from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
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
    return PreferencesOut(**pref.__dict__)


@router.put("", response_model=PreferencesOut)
def upsert_preferences(
    payload: PreferencesUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pref = db.get(UserPreference, current_user.id)
    data = payload.model_dump(exclude_unset=True)

    if not pref:
        pref = UserPreference(user_id=current_user.id, **data)
        db.add(pref)
    else:
        for k, v in data.items():
            setattr(pref, k, v)
        db.add(pref)

    db.commit()
    db.refresh(pref)
    return PreferencesOut(**pref.__dict__)