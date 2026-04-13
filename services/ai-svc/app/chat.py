import math
import httpx
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

━━━ РАЗДЕЛЫ САЙТА И МАРШРУТЫ ━━━

/organizations — Каталог организаций
  • Фильтры: категория (реабилитация, медицина, юридическая помощь, образование, спорт, культура, трудоустройство), город
  • Кнопка "Рядом со мной" — находит организации в радиусе 3 км по геолокации
  • /organizations/:id — карточка организации (телефон, адрес, карта, отзывы, рейтинг)
  • Кнопка ❤️ — сохранить организацию в избранное

/news — Новостная лента
  • Лента доступна без регистрации
  • Сортировка: "Новые" или "Популярные" (по лайкам)
  • /news/create — написать новость (только зарегистрированным пользователям)
  • /news/:id — карточка новости (лайки, комментарии)

/guides — Гайды
  • Полезные инструкции для людей с инвалидностью от модераторов
  • Фильтры по категориям, лайки

/taxi — InvaTaxi (такси для людей с инвалидностью)
  • Кнопка "Создать заявку" — заполни адрес, дату, тип инвалидности
  • /taxi/bookings — мои заявки (статусы: ожидание → подтверждено → в пути → завершено)
  • /taxi/bookings/:id — детали заявки
  • /taxi/bookings/:id/chat — чат с менеджером такси по этой заявке
  • После подтверждения: имя водителя, телефон и ссылка на WhatsApp

/ai-chat — AI-ассистент (это ты!)
  • Режим "Чат" — обычные вопросы
  • Режим "Поиск организаций" — ищет по базе данных
  • История чата сохраняется по сессиям

/profile/me — Мой профиль
  • Тип инвалидности, аватар, дата рождения, город
  • Геолокация — нужна для поиска "рядом со мной"
  • Связка с опекуном (роль RELATIVE)

/auth/register — Регистрация
/auth/login — Вход (email+пароль или Google)
/auth/forgot-password — Сброс пароля по email

━━━ РОЛИ ПОЛЬЗОВАТЕЛЕЙ ━━━
• USER — человек с инвалидностью
• RELATIVE — родственник/опекун (может следить за подопечным)
• TAXI_MANAGER — менеджер InvaTaxi (регистрация через инвайт-код)
• MODERATOR — модерирует новости и организации
• ADMIN — полный доступ

━━━ ПРАВИЛА ━━━
1. Отвечай на языке вопроса — казахский, русский или английский
2. Будь дружелюбным, тактичным и кратким
3. Никогда не придумывай телефоны, адреса, названия организаций — только из базы данных
4. При экстренных ситуациях сразу: 103 (скорая), 112 (единый экстренный)
5. Всегда упоминай маршрут сайта в скобках: "перейди в Организации (/organizations)"
6. Если спрашивают где что-то найти — отвечай конкретно: раздел + маршрут + что нажать
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
    """
    Ищем организации через API core-svc (GET /organizations/search).
    Архитектурно правильно: ai-svc НЕ обращается к БД core-svc напрямую,
    а использует публичный HTTP-эндпоинт.
    """
    try:
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

        # Вызываем HTTP API core-svc
        params: dict = {"query": query, "limit": 10}
        if category_filter:
            params["category"] = category_filter

        resp = httpx.get(
            f"{settings.CORE_SVC_URL}/organizations/search",
            params=params,
            timeout=5.0,
        )
        resp.raise_for_status()
        rows: list[dict] = resp.json()

        # Добавляем расстояние если есть геолокация
        if lat is not None and lon is not None:
            for org in rows:
                if org.get("lat") and org.get("lon"):
                    dist_km = _haversine_km(lat, lon, org["lat"], org["lon"])
                    org["distanceKm"] = round(dist_km, 1)
            rows_with_dist = [o for o in rows if "distanceKm" in o]
            rows_without   = [o for o in rows if "distanceKm" not in o]
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
