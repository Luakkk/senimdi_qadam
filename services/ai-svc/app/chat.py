import math
import psycopg2
from openai import AzureOpenAI
from typing import Optional
from .config import settings

# ── Azure OpenAI клиент ───────────────────────────────────────────────────────
client = AzureOpenAI(
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    api_key=settings.AZURE_OPENAI_API_KEY,
    api_version=settings.AZURE_OPENAI_API_VERSION,
)

# ── Системные промпты ─────────────────────────────────────────────────────────

SYSTEM_CHAT = """Ты — Сенім (Senim), дружелюбный AI-ассистент платформы SenimdiQAdam («Сенімді Қадам» — «Уверенный шаг»).

Платформа создана для людей с инвалидностью в Алматы, Казахстан.

На платформе есть:
• Каталог организаций (/organizations) — реабилитация, медицина, юридическая помощь, образование, спорт, культура, трудоустройство
• Новостная лента (/news) — пользователи публикуют новости, ставят лайки и комментируют
• Гайды (/guides) — полезные инструкции для людей с инвалидностью
• Профиль (/profile/me) — тип инвалидности, аватар, геолокация, связка с опекуном
• InvaTaxi (/taxi) — специальное такси с поддержкой инвалидных кресел, кнопка "Создать заявку"
• AI-ассистент (/ai-chat) — это ты, помогаешь найти организации и ориентироваться на сайте

Правила:
1. Отвечай на языке вопроса — казахский, русский или английский
2. Будь дружелюбным, тактичным и кратким
3. Никогда не придумывай телефоны, адреса или названия — только из базы данных
4. При экстренных ситуациях: 103 (скорая), 112 (единый)
5. Если пользователь спрашивает "где найти X" — используй режим /chat/rag
6. Когда знаешь маршрут сайта — упоминай его в скобках: "перейди в Организации (/organizations)"
"""

SYSTEM_EMERGENCY = """Ты — экстренный помощник SenimdiQAdam для людей с инвалидностью в Казахстане.

Экстренные номера:
• 112 — единый (работает всегда, бесплатно)
• 103 — скорая помощь
• 102 — полиция
• 101 — пожарная служба

Правила:
1. Отвечай КОРОТКО и ЧЁТКО — это экстренная ситуация
2. Сначала назови нужный номер телефона крупно
3. Дай конкретные пошаговые инструкции первой помощи
4. Учитывай что пользователь может иметь инвалидность
"""

SITE_GUIDE = """# Гид по платформе SenimdiQAdam

## Организации (/organizations)
- Каталог реабилитационных центров, больниц, юридических служб, спортивных клубов
- Фильтры по категории и городу
- Кнопка "Рядом со мной" — находит организации в радиусе 3 км
- Кнопка ❤️ — сохранить в избранное

## Новости (/news)
- Лента без регистрации
- Сортировка: "Популярные" (по лайкам) или "Новые" (по дате)
- Публикация и комментарии — только после регистрации, проходят модерацию

## Гайды (/guides)
- Полезные инструкции для людей с инвалидностью
- Категории, лайки

## Профиль (/profile/me)
- USER — человек с инвалидностью: тип инвалидности, аватар, геолокация
- RELATIVE — родственник/опекун: запрос на связку с подопечным
- Геолокация нужна для поиска "рядом со мной"

## Вход (/auth/login)
- Email + пароль или Google OAuth
- Забыл пароль → "Забыли пароль?" → код на email

## InvaTaxi (/taxi)
- Специальное такси для людей с инвалидностью
- Создай заявку: адрес, дата, тип инвалидности
- Менеджер назначит водителя и напишет в чат
- После подтверждения — контакт водителя и WhatsApp

## AI-ассистент (/ai-chat)
- Задавай вопросы про организации — ищу по базе
- Спрашивай где что находится на сайте
- Напиши "экстренная помощь" для быстрой помощи
"""


# ── Haversine расстояние ──────────────────────────────────────────────────────

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


# ── Поиск организаций в core_db ───────────────────────────────────────────────

def search_organizations(query: str, lat: Optional[float] = None, lon: Optional[float] = None) -> list[dict]:
    """Ищем организации в core_db. Если передана геолокация — добавляем расстояние."""
    try:
        conn = psycopg2.connect(settings.CORE_DATABASE_URL)
        cur = conn.cursor()

        # Маппинг ключевых слов → категории Prisma enum
        category_map = {
            "реабилит":       "REHABILITATION",
            "медицин":        "MEDICAL",
            "больниц":        "MEDICAL",
            "клиник":         "MEDICAL",
            "юридич":         "LEGAL",
            "правовой":       "LEGAL",
            "образован":      "EDUCATION",
            "школ":           "EDUCATION",
            "спорт":          "SPORT",
            "физкульт":       "SPORT",
            "культур":        "CULTURE",
            "трудоустройств": "EMPLOYMENT",
            "работ":          "EMPLOYMENT",
            "занятост":       "EMPLOYMENT",
            "социал":         "SOCIAL",
        }

        category_filter = None
        for keyword, cat in category_map.items():
            if keyword in query.lower():
                category_filter = cat
                break

        # Базовый SELECT — берём lat/lon чтобы считать расстояние
        select = """
            SELECT "nameRu", category, address, city, phone, website,
                   description, "ratingAvg", "ratingCount", lat, lon
            FROM "Organization"
            WHERE status IN ('VERIFIED', 'PENDING')
        """

        if category_filter:
            cur.execute(
                select + """ AND (category = %s OR "nameRu" ILIKE %s OR description ILIKE %s)
                ORDER BY "ratingAvg" DESC NULLS LAST LIMIT 10""",
                (category_filter, f"%{query}%", f"%{query}%"),
            )
        else:
            cur.execute(
                select + """ AND ("nameRu" ILIKE %s OR description ILIKE %s OR address ILIKE %s)
                ORDER BY "ratingAvg" DESC NULLS LAST LIMIT 10""",
                (f"%{query}%", f"%{query}%", f"%{query}%"),
            )

        cols = [d[0] for d in cur.description]
        rows = [dict(zip(cols, row)) for row in cur.fetchall()]

        # Fallback: вернём топ-5 если ничего не нашли
        if not rows:
            cur.execute(
                select + " ORDER BY \"ratingAvg\" DESC NULLS LAST LIMIT 5"
            )
            cols = [d[0] for d in cur.description]
            rows = [dict(zip(cols, row)) for row in cur.fetchall()]

        conn.close()

        # Добавляем расстояние если есть геолокация
        if lat is not None and lon is not None:
            for org in rows:
                if org.get("lat") and org.get("lon"):
                    dist_km = _haversine_km(lat, lon, org["lat"], org["lon"])
                    org["distanceKm"] = round(dist_km, 1)
            # Сортируем по расстоянию если есть координаты
            rows_with_dist  = [o for o in rows if "distanceKm" in o]
            rows_without    = [o for o in rows if "distanceKm" not in o]
            rows = sorted(rows_with_dist, key=lambda x: x["distanceKm"]) + rows_without

        return rows

    except Exception as e:
        print(f"[org search error] {type(e).__name__}: {e}")
        return []


def _format_orgs_context(orgs: list[dict], user_lat=None, user_lon=None) -> str:
    if not orgs:
        return "Организации по данному запросу не найдены в базе данных."
    lines = []
    for org in orgs:
        line = f"• {org.get('nameRu', '—')} (категория: {org.get('category', '—')})"
        # Расстояние от пользователя
        if org.get("distanceKm") is not None:
            dist = org["distanceKm"]
            if dist < 1:
                line += f" — {int(dist * 1000)} м от вас"
            else:
                line += f" — {dist} км от вас"
        if org.get("address"):     line += f"\n  Адрес: {org['address']}"
        if org.get("phone"):       line += f"\n  Телефон: {org['phone']}"
        if org.get("website"):     line += f"\n  Сайт: {org['website']}"
        if org.get("ratingAvg"):   line += f"\n  Рейтинг: {org['ratingAvg']:.1f}★ ({org.get('ratingCount', 0)} отзывов)"
        if org.get("description"): line += f"\n  {str(org['description'])[:150]}..."
        lines.append(line)
    return "\n\n".join(lines)


# ── Публичные функции чата ────────────────────────────────────────────────────

def simple_chat(messages: list[dict], location=None) -> str:
    """Обычный чат — история сообщений + системный промпт"""
    system = SYSTEM_CHAT
    if location:
        system += f"\n\nГеолокация пользователя: {location.lat}, {location.lon} (город: {location.city or 'Алматы'})"

    all_messages = [{"role": "system", "content": system}] + messages
    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=all_messages,
        temperature=0.7,
        max_tokens=1000,
    )
    return response.choices[0].message.content


def rag_chat(messages: list[dict], location=None) -> dict:
    """Чат с поиском организаций из core_db + геолокация"""
    last_question = messages[-1]["content"] if messages else ""

    lat = location.lat if location else None
    lon = location.lon if location else None

    orgs = search_organizations(last_question, lat=lat, lon=lon)
    context = _format_orgs_context(orgs)

    system = SYSTEM_CHAT
    if location:
        system += f"\n\nГеолокация пользователя: {location.lat}, {location.lon} (город: {location.city or 'Алматы'}). Укажи расстояние до организаций."
    system += f"\n\n---\nДанные из базы организаций:\n{context}\n---"

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
