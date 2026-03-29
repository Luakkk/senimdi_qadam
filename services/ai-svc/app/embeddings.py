from openai import AzureOpenAI
from .config import settings

# Клиент Azure OpenAI
client = AzureOpenAI(
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    api_key=settings.AZURE_OPENAI_API_KEY,
    api_version=settings.AZURE_OPENAI_API_VERSION,
)

def get_embedding(text: str) -> list[float]:
    """Получить вектор текста через Azure OpenAI"""
    response = client.embeddings.create(
        model=settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
        input=text,
    )
    return response.data[0].embedding

def get_chat_response(system_prompt: str, user_message: str) -> str:
    """Получить ответ от GPT-4o"""
    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message},
        ],
        temperature=0.3,
        max_tokens=1000,
    )
    return response.choices[0].message.content
