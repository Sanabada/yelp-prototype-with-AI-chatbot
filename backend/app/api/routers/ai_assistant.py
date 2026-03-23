from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.api.deps import get_db
from app.core.config import settings
from app.models.restaurant import Restaurant
from app.schemas.chat import ChatMessage, ChatRequest, ChatResponse

router = APIRouter(prefix="/ai-assistant")



SYSTEM_PROMPT = """
You are a restaurant assistant for a Yelp-style app.

Help users with:
- restaurant recommendations
- cuisines
- dietary preferences
- price range suggestions
- what to order
- review interpretation

Rules:
- Be concise and useful.
- Only mention restaurants that appear in the backend restaurant list provided to you.
- If the database does not clearly match the user request, say so clearly.
- Use the conversation history when relevant.
- Do not return JSON unless the user explicitly asks for JSON.
- Give a natural conversational answer.
""".strip()


def build_llm() -> ChatOpenAI:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not configured in .env")

    kwargs = {
        "model": settings.OPENAI_MODEL,
        "api_key": settings.OPENAI_API_KEY,
        "temperature": settings.OPENAI_TEMPERATURE,
    }
    if settings.OPENAI_BASE_URL:
        kwargs["base_url"] = settings.OPENAI_BASE_URL
    return ChatOpenAI(**kwargs)


def build_restaurant_context(db: Session, limit: int = 50) -> str:
    restaurants = db.query(Restaurant).limit(limit).all()
    if not restaurants:
        return "No restaurants are currently available in the database."

    lines: list[str] = []
    for restaurant in restaurants:
        rating = getattr(restaurant, "average_rating", None) or getattr(restaurant, "rating", "Unknown")
        price = getattr(restaurant, "price_tier", None) or getattr(restaurant, "price_range", "Unknown")
        lines.append(
            "\n".join(
                [
                    f"ID: {getattr(restaurant, 'id', 'N/A')}",
                    f"Name: {getattr(restaurant, 'name', 'Unknown')}",
                    f"Cuisine: {getattr(restaurant, 'cuisine_type', None) or getattr(restaurant, 'cuisine', 'Unknown')}",
                    f"City: {getattr(restaurant, 'city', 'Unknown')}",
                    f"Price: {price}",
                    f"Rating: {rating}",
                ]
            )
        )
    return "\n\n".join(lines)


def build_messages(history: list[ChatMessage], user_message: str, restaurant_context: str):
    messages = [
        SystemMessage(
            content=(
                f"{SYSTEM_PROMPT}\n\nAvailable restaurants from backend database:\n{restaurant_context}"
            )
        )
    ]

    for item in history[-10:]:
        if item.role == "assistant":
            messages.append(AIMessage(content=item.content))
        elif item.role == "system":
            messages.append(SystemMessage(content=item.content))
        else:
            messages.append(HumanMessage(content=item.content))

    messages.append(HumanMessage(content=user_message))
    return messages


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    payload: ChatRequest,
    db: Session = Depends(get_db),
):
    try:
        llm = build_llm()
        restaurant_context = build_restaurant_context(db)
        messages = build_messages(payload.history, payload.message, restaurant_context)
        response = llm.invoke(messages)
        answer = response.content if isinstance(response.content, str) else str(response.content)
        return ChatResponse(answer=answer, response=answer)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI assistant failed: {str(exc)}")
