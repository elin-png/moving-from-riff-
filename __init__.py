from fastapi import APIRouter, HTTPException, Query
from app.auth import AuthorizedUser
from app.libs.domain_model import Shift
from pydantic import BaseModel
from datetime import datetime
import asyncpg
import os

router = APIRouter()

class CreateShiftRequest(BaseModel):
    user_id: str | None = None
    start_time: datetime
    end_time: datetime
    notes: str | None = None
    status: str = "assigned"

class UpdateShiftRequest(BaseModel):
    user_id: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    notes: str | None = None
    status: str | None = None

@router.get("/shifts")
async def list_shifts(
    user: AuthorizedUser,
    start: datetime = Query(..., description="Start of range"),
    end: datetime = Query(..., description="End of range"),
    user_id: str | None = Query(None, description="Filter by user ID")
) -> list[Shift]:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        query = """
            SELECT * FROM shifts 
            WHERE start_time >= $1 AND end_time <= $2
        """
        params = [start, end]
        
        if user_id:
            query += " AND user_id = $3"
            params.append(user_id)
            
        query += " ORDER BY start_time"
        
        rows = await conn.fetch(query, *params)
        return [Shift(**dict(row)) for row in rows]
    finally:
        await conn.close()

@router.get("/my-shifts")
async def list_my_shifts(
    user: AuthorizedUser,
    start: datetime = Query(..., description="Start of range"),
    end: datetime = Query(..., description="End of range")
) -> list[Shift]:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        query = """
            SELECT * FROM shifts 
            WHERE start_time >= $1 AND end_time <= $2 AND user_id = $3
            ORDER BY start_time
        """
        rows = await conn.fetch(query, start, end, user.sub)
        return [Shift(**dict(row)) for row in rows]
    finally:
        await conn.close()

@router.post("/shifts")
async def create_shift(body: CreateShiftRequest, user: AuthorizedUser) -> Shift:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO shifts (user_id, start_time, end_time, status, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            """,
            body.user_id, body.start_time, body.end_time, body.status, body.notes
        )
        return Shift(**dict(row))
    finally:
        await conn.close()

@router.put("/shifts/{shift_id}")
async def update_shift(shift_id: str, body: UpdateShiftRequest, user: AuthorizedUser) -> Shift:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        # Build dynamic update query
        fields = []
        values = []
        idx = 1
        
        if body.user_id is not None:
            fields.append(f"user_id = ${idx}")
            values.append(body.user_id)
            idx += 1
        if body.start_time is not None:
            fields.append(f"start_time = ${idx}")
            values.append(body.start_time)
            idx += 1
        if body.end_time is not None:
            fields.append(f"end_time = ${idx}")
            values.append(body.end_time)
            idx += 1
        if body.status is not None:
            fields.append(f"status = ${idx}")
            values.append(body.status)
            idx += 1
        if body.notes is not None:
            fields.append(f"notes = ${idx}")
            values.append(body.notes)
            idx += 1
            
        if not fields:
            # No updates requested, return existing
            row = await conn.fetchrow("SELECT * FROM shifts WHERE id = $1", shift_id)
            if not row:
                raise HTTPException(status_code=404, detail="Shift not found")
            return Shift(**dict(row))

        fields.append("updated_at = NOW()")
        
        query = f"""
            UPDATE shifts 
            SET {", ".join(fields)}
            WHERE id = ${idx}
            RETURNING *
        """
        values.append(shift_id)
        
        row = await conn.fetchrow(query, *values)
        if not row:
            raise HTTPException(status_code=404, detail="Shift not found")
            
        return Shift(**dict(row))
    except asyncpg.DataError:
        raise HTTPException(status_code=400, detail="Invalid data")
    finally:
        await conn.close()

@router.delete("/shifts/{shift_id}")
async def delete_shift(shift_id: str, user: AuthorizedUser) -> bool:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        result = await conn.execute("DELETE FROM shifts WHERE id = $1", shift_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Shift not found")
        return True
    finally:
        await conn.close()
