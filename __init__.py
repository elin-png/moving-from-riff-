from fastapi import APIRouter, HTTPException
from app.auth import AuthorizedUser
from app.libs.domain_model import UserProfile
from pydantic import BaseModel
import asyncpg
import os

router = APIRouter()

@router.get("/users")
async def list_users(user: AuthorizedUser) -> list[UserProfile]:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        rows = await conn.fetch("SELECT * FROM user_profiles ORDER BY full_name")
        return [UserProfile(**dict(row)) for row in rows]
    finally:
        await conn.close()

class CreateUserRequest(BaseModel):
    user_id: str
    full_name: str
    email: str
    role: str = "employee"

@router.post("/users")
async def create_user(body: CreateUserRequest, user: AuthorizedUser) -> UserProfile:
    # In a real app, we might check if the requester is an admin
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO user_profiles (user_id, full_name, email, role)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """,
            body.user_id, body.full_name, body.email, body.role
        )
        return UserProfile(**dict(row))
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=400, detail="User already exists")
    finally:
        await conn.close()

@router.get("/users/me")
async def get_my_profile(user: AuthorizedUser) -> UserProfile:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        row = await conn.fetchrow("SELECT * FROM user_profiles WHERE user_id = $1", user.sub)
        if not row:
            # If user doesn't exist in our profile table yet, we might return 404
            # Or effectively "auto-create" or handle it gracefully.
            # For now, 404 is appropriate as they need a profile.
            raise HTTPException(status_code=404, detail="User profile not found")
        return UserProfile(**dict(row))
    finally:
        await conn.close()
