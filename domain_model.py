from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class UserProfile(BaseModel):
    user_id: str
    full_name: str
    email: str
    role: str
    created_at: datetime
    updated_at: datetime

class Shift(BaseModel):
    id: UUID
    user_id: Optional[str]
    start_time: datetime
    end_time: datetime
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

class ShiftSwap(BaseModel):
    id: UUID
    shift_id: UUID
    requesting_user_id: str
    target_user_id: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

class ShiftSwapDetail(ShiftSwap):
    shift: Shift
    initiator: UserProfile
    target_user: Optional[UserProfile]
