import psycopg2
from openai import AzureOpenAI
from .config import settings

# ── Azure OpenAI клиент ───────────────────────────────────────────────────────
client = AzureOpenAI(
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    api_key=settings.AZURE_OPENAI_API_KEY,
    api_version=settings.AZURE_OPENAI_API_VERSION,
)

# ── Системные промпты ─────────────────────────────────────────────────────────

SYSTEM_CHAT = """Ты — Сенім (Senim), дружелюбный AI-ассистент платформы SenimdiQAdam («Сенімді Қадам» — «Уверенный шаг»).

Платформа создана для людей с инвалидностью в Алматы, Казахстан. На платформе есть:
• Каталог организаций — реабилитация, медицина, юридическая помощь, образование, спорт, культура, трудоустройство
• Новостная лента — пользователи публикуют новости, ставят лайки и комментируют
• Гайды — полезные инструкции для людей с инвалидностью
• Профиль пользователя:
  - USER — человек с инвалидностью
  - RELATIVE — родственник/опекун (может связаться с подопечным через платформу)
• AI-ассистент (это ты!) — отвечает на вопросы и помогает найти организации
• Такси для людей с инвалидностью (в разработке)

Правила:
1. Отвечай на языке вопроса — казахский, русский или английский
2. Будь дружелюбным, тактичным и кратким
3. Никогда не придумывай телефоны, адреса или названия организаций
4. Если не знаешь — честно скажи и предложи позвонить напрямую
5. При экстренных ситуациях сразу называй номера: 103 (скорая), 112 (единый)
"""

SYSTEM_EMERGENCY = """Ты — экстренный помощник платформы SenimdiQAdam для людей с инвалидностью в Казахстане.

Экстренные номера Казахстана:
• 112 — единый номер (работает всегда)
• 103 — скорая помощь
• 102 — полиция
• 101 — пожарная служба

Правила:
1. Отвечай КОРОТКО и ЧЁТКО — это экстренная ситуация
2. Сначала назови нужный номер телефона
3. Дай конкретные пошаговые инструкции первой помощи
4. Всегда рекомендуй вызвать специалистов
5. Учитывай что пользователь может быть человеком с инвалидностью
"""

SITE_GUIDE = """# 📱 Гид по платформе SenimdiQAdam

## 🏢 Организации
- Перейди в раздел **"Организации"**
- Фильтруй по категории: реабилитация, медицина, юридическая помощь, образование, спорт, культура, трудоустройство
- Нажми **"Рядом со мной"** чтобы найти ближайшие организации
- Сохраняй понравившиеся в **избранное** (кнопка ❤️)

## 📰 Новости
- Лента новостей доступна без регистрации
- Сортировка: **"Популярные"** (по лайкам) или **"Новые"** (по дате)
- Чтобы публиковать новости или комментировать — нужна **регистрация**
- Новости проходят **модерацию** перед публикацией

## 📚 Гайды
- Полезные инструкции и статьи
- Фильтрация по категориям
- Можно ставить лайки ❤️

## 👤 Профиль
- **USER** (человек с инвалидностью) — заполни тип инвалидности, город, фото
- **RELATIVE** (родственник/опекун) — отправь запрос на связку с подопечным по email
- Загрузи **аватар** (до 5MB, jpg/png/webp)
- Укажи **геолокацию** чтобы платформа находила организации рядом

## 🔐 Регистрация и вход
- Регистрация через **email и пароль**
- Или через **Google аккаунт** (одна кнопка)
- Забыл пароль? Используй **"Забыли пароль?"** — придёт код на email

## 🤖 AI-ассистент (я!)
- Задавай вопросы про организации — найду по базе данных
- Спрашивай что угодно про платформу
- При экстренной ситуации — напиши **"экстренная помощь"**

## 🚕 Такси (скоро!)
- Специализированное такси для людей с инвалидностью
- В разработке — скоро появится!
"""

# ── Поиск организаций напрямую из core_db ────────────────────────────────────

def search_organizations(query: str) -> list[dict]:
    """Ищем организации в core_db по названию, категории или описанию"""
    try:
        conn = psycopg2.connect(settings.CORE_DATABASE_URL)
        cur = conn.cursor()

        # Маппинг ключевых слов → категории Prisma enum
        category_map = {
            "реабилит": "REHABILITATION",
            "медицин":  "MEDICAL",
            "юридич":   "LEGAL",
            "образован": "EDUCATION",
            "спорт":    "SPORT",
            "культур":  "CULTURE",
            "трудоустройств": "EMPLOYMENT",
            "работ":    "EMPLOYMENT",
            "социал":   "SOCIAL",
        }

        category_filter = None
        for keyword, cat in category_map.items():
            if keyword in query.lower():
                category_filter = cat
                break

        if category_filter:
            cur.execute("""
                SELECT "nameRu", category, address, city, phone, website,
                       description, "ratingAvg", "ratingCount"
                FROM "Organization"
                WHERE status = 'VERIFIED'
                  AND (category = %s OR "nameRu" ILIKE %s OR description ILIKE %s)
                ORDER BY "ratingAvg" DESC NULLS LAST
                LIMIT 5
            """, (category_filter, f"%{query}%", f"%{query}%"))
        else:
            cur.execute("""
                SELECT "nameRu", category, address, city, phone, website,
                       description, "ratingAvg", "ratingCount"
                FROM "Organization"
                WHERE status = 'VERIFIED'
                  AND ("nameRu" ILIKE %s OR description ILIKE %s OR address ILIKE %s)
                ORDER BY "ratingAvg" DESC NULLS LAST
                LIMIT 5
            """, (f"%{query}%", f"%{query}%", f"%{query}%"))

        cols = [d[0] for d in cur.description]
        rows = [dict(zip(cols, row)) for row in cur.fetchall()]
        conn.close()
        return rows

    except Exception as e:
        print(f"[org search error] {e}")
        return []


def _format_orgs_context(orgs: list[dict]) -> str:
    if not orgs:
        return "Организации по данному запросу не найдены в базе данных."
    lines = []
    for org in orgs:
        line = f"• {org.get('nameRu', '—')} (категория: {org.get('category', '—')})"
        if org.get("address"):  line += f"\n  Адрес: {org['address']}"
        if org.get("phone"):    line += f"\n  Телефон: {org['phone']}"
        if org.get("website"):  line += f"\n  Сайт: {org['website']}"
        if org.get("ratingAvg"):line += f"\n  Рейтинг: {org['ratingAvg']:.1f} ({org.get('ratingCount',0)} отзывов)"
        if org.get("description"):
            line += f"\n  {str(org['description'])[:150]}..."
        lines.append(line)
    return "\n\n".join(lines)


# ── Публичные функции чата ────────────────────────────────────────────────────

def simple_chat(messages: list[dict]) -> str:
    """Обычный чат — история сообщений + системный промпт"""
    all_messages = [{"role": "system", "content": SYSTEM_CHAT}] + messages
    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=all_messages,
        temperature=0.7,
        max_tokens=1000,
    )
    return response.choices[0].message.content


def rag_chat(messages: list[dict]) -> dict:
    """Чат с поиском организаций из core_db"""
    last_question = messages[-1]["content"] if messages else ""

    orgs = search_organizations(last_question)
    context = _format_orgs_context(orgs)

    system = SYSTEM_CHAT + f"\n\n---\nДанные из базы организаций:\n{context}\n---"
    all_messages = [{"role": "system", "content": system}] + messages

    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=all_messages,
        temperature=0.3,
        max_tokens=1200,
    )
    return {
        "answer": response.choices[0].message.content,
        "organizations_found": len(orgs),
        "organizations": orgs,
    }


def emergency_chat(message: str) -> str:
    """Экстренная помощь — короткие чёткие инструкции"""
    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=[
            {"role": "system", "content": SYSTEM_EMERGENCY},
            {"role": "user",   "content": message},
        ],
        temperature=0.1,
        max_tokens=600,
    )
    return response.choices[0].message.content
