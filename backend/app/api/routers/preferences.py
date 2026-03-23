from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.preference import UserPreference
from app.models.user import User
from app.schemas.preference import PreferencesOut, PreferencesUpdateIn

router = APIRouter(prefix="/users/me/preferences")


@router.get("", response_model=PreferencesOut)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pref = db.get(UserPreference, current_user.id)
    if not pref:
        return PreferencesOut()
    return PreferencesOut.from_db_obj(pref)


@router.put("", response_model=PreferencesOut)
def upsert_preferences(
    payload: PreferencesUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pref = db.get(UserPreference, current_user.id)
    data = payload.model_dump(exclude_unset=True)

    favorite_cuisines = data.get("favorite_cuisines")
    if favorite_cuisines is None and data.get("cuisine_preferences"):
        favorite_cuisines = ", ".join(data["cuisine_preferences"])

    values = {
        "favorite_cuisines": favorite_cuisines,
        "price_range": data.get("price_range"),
    }
    values = {key: value for key, value in values.items() if key in data or value is not None}

    if not pref:
        pref = UserPreference(user_id=current_user.id, **values)
        db.add(pref)
    else:
        for key, value in values.items():
            setattr(pref, key, value)
        db.add(pref)

    db.commit()
    db.refresh(pref)
    return PreferencesOut.from_db_obj(pref)
