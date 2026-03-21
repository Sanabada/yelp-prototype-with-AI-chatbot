from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, ConfigDict, AliasChoices
from sqlalchemy.orm import Session

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.restaurant import Restaurant

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    message: str = Field(min_length=1, max_length=4000)
    conversation_history: list[ChatMessage] = Field(
        default_factory=list,
        validation_alias=AliasChoices("conversation_history", "history"),
    )


class ChatResponse(BaseModel):
    answer: str


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

    lines = []
    for r in restaurants:
        restaurant_id = getattr(r, "id", "N/A")
        name = getattr(r, "name", "Unknown")
        cuisine = getattr(r, "cuisine_type", None) or getattr(r, "cuisine", "Unknown")
        city = getattr(r, "city", "Unknown")
        price = getattr(r, "price_tier", None) or getattr(r, "price_range", "Unknown")
        rating = getattr(r, "average_rating", None)
        if rating is None:
            rating = getattr(r, "rating", "Unknown")

        lines.append(
            "\n".join(
                [
                    f"ID: {restaurant_id}",
                    f"Name: {name}",
                    f"Cuisine: {cuisine}",
                    f"City: {city}",
                    f"Price: {price}",
                    f"Rating: {rating}",
                ]
            )
        )

    return "\n\n".join(lines)


def build_messages(
    history: list[ChatMessage],
    user_message: str,
    restaurant_context: str,
):
    messages = [
        SystemMessage(
            content=(
                f"{SYSTEM_PROMPT}\n\n"
                f"Available restaurants from backend database:\n{restaurant_context}"
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
    current_user: User = Depends(get_current_user),
):
    try:
        llm = build_llm()
        restaurant_context = build_restaurant_context(db)

        messages = build_messages(
            payload.conversation_history,
            payload.message,
            restaurant_context,
        )

        response = llm.invoke(messages)
        answer = response.content if isinstance(response.content, str) else str(response.content)

        return ChatResponse(answer=answer)

    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI assistant failed: {str(exc)}")