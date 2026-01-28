from fastapi import APIRouter, HTTPException, Query
from app.auth import AuthorizedUser
from app.libs.domain_model import ShiftSwap, ShiftSwapDetail, Shift, UserProfile
from pydantic import BaseModel
import asyncpg
import os
from datetime import datetime
from uuid import UUID

router = APIRouter()

class CreateSwapRequest(BaseModel):
    shift_id: UUID
    target_user_id: str | None = None

@router.post("/swaps")
async def create_swap(body: CreateSwapRequest, user: AuthorizedUser) -> ShiftSwap:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        # Verify ownership of the shift
        shift = await conn.fetchrow("SELECT * FROM shifts WHERE id = $1", body.shift_id)
        if not shift:
            raise HTTPException(status_code=404, detail="Shift not found")
        if shift["user_id"] != user.sub:
             raise HTTPException(status_code=403, detail="You can only offer your own shifts")

        # Check for existing open swaps for this shift
        existing = await conn.fetchval(
            "SELECT id FROM shift_swaps WHERE shift_id = $1 AND status IN ('open', 'pending_acceptance', 'pending_admin')",
            body.shift_id
        )
        if existing:
            raise HTTPException(status_code=400, detail="This shift is already being swapped")

        status = 'pending_acceptance' if body.target_user_id else 'open'
        
        row = await conn.fetchrow(
            """
            INSERT INTO shift_swaps (shift_id, requesting_user_id, target_user_id, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """,
            body.shift_id, user.sub, body.target_user_id, status
        )
        return ShiftSwap(**dict(row))
    finally:
        await conn.close()

@router.get("/swaps")
async def list_swaps(
    user: AuthorizedUser,
    status: str | None = Query(None, description="Filter by status")
) -> list[ShiftSwapDetail]:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        query = """
            SELECT 
                ss.*,
                row_to_json(s.*) as shift,
                row_to_json(up.*) as initiator,
                row_to_json(tu.*) as target_user
            FROM shift_swaps ss
            JOIN shifts s ON ss.shift_id = s.id
            JOIN user_profiles up ON ss.requesting_user_id = up.user_id
            LEFT JOIN user_profiles tu ON ss.target_user_id = tu.user_id
        """
        params = []
        if status:
            query += " WHERE ss.status = $1"
            params.append(status)
        
        query += " ORDER BY ss.created_at DESC"
        
        rows = await conn.fetch(query, *params)
        
        results = []
        for row in rows:
            data = dict(row)
            # Parse nested JSON
            import json
            shift_data = json.loads(data['shift']) if isinstance(data['shift'], str) else data['shift']
            initiator_data = json.loads(data['initiator']) if isinstance(data['initiator'], str) else data['initiator']
            target_user_data = json.loads(data['target_user']) if data['target_user'] and isinstance(data['target_user'], str) else data['target_user']
            
            # Remove raw json fields to match ShiftSwap
            del data['shift']
            del data['initiator']
            del data['target_user']
            
            # Construct nested objects
            # Dates in json from postgres might be strings, pydantic handles it?
            # asyncpg returns strings for json fields usually.
            
            # Actually row_to_json in postgres returns a string in asyncpg usually unless decoded.
            # But let's be careful. `fetch` returns Record objects.
            # row_to_json returns text.
            
            results.append(ShiftSwapDetail(
                **data,
                shift=Shift(**shift_data),
                initiator=UserProfile(**initiator_data),
                target_user=UserProfile(**target_user_data) if target_user_data else None
            ))
            
        return results
    finally:
        await conn.close()

@router.post("/swaps/{swap_id}/claim")
async def claim_swap(swap_id: UUID, user: AuthorizedUser) -> ShiftSwap:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        # Check current status
        swap = await conn.fetchrow("SELECT * FROM shift_swaps WHERE id = $1", swap_id)
        if not swap:
             raise HTTPException(status_code=404, detail="Swap not found")
        
        if swap["requesting_user_id"] == user.sub:
             raise HTTPException(status_code=400, detail="You cannot claim your own swap")

        if swap["status"] == "open":
            # Marketplace claim
            pass
        elif swap["status"] == "pending_acceptance":
            # Direct offer claim
            if swap["target_user_id"] != user.sub:
                raise HTTPException(status_code=403, detail="This swap is not offered to you")
        else:
            raise HTTPException(status_code=400, detail="Swap is not available")

        # Update
        row = await conn.fetchrow(
            """
            UPDATE shift_swaps 
            SET status = 'pending_admin', target_user_id = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
            """,
            user.sub, swap_id
        )
        return ShiftSwap(**dict(row))
    finally:
        await conn.close()

@router.post("/swaps/{swap_id}/approve")
async def approve_swap(swap_id: UUID, user: AuthorizedUser) -> ShiftSwap:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        # Verify admin
        admin = await conn.fetchrow("SELECT role FROM user_profiles WHERE user_id = $1", user.sub)
        if not admin or admin["role"] != "admin":
            raise HTTPException(status_code=403, detail="Only admins can approve swaps")

        # Get swap
        swap = await conn.fetchrow("SELECT * FROM shift_swaps WHERE id = $1", swap_id)
        if not swap:
            raise HTTPException(status_code=404, detail="Swap not found")
        
        if swap["status"] != "pending_admin":
            raise HTTPException(status_code=400, detail="Swap is not pending approval")
            
        if not swap["target_user_id"]:
             raise HTTPException(status_code=400, detail="No target user to transfer shift to")

        # Start transaction
        async with conn.transaction():
            # Update swap status
            updated_swap = await conn.fetchrow(
                """
                UPDATE shift_swaps 
                SET status = 'approved', updated_at = NOW()
                WHERE id = $1
                RETURNING *
                """,
                swap_id
            )
            
            # Transfer shift
            await conn.execute(
                "UPDATE shifts SET user_id = $1 WHERE id = $2",
                swap["target_user_id"], swap["shift_id"]
            )
            
            # Cancel any other open swaps for this shift?
            # Ideally yes.
            await conn.execute(
                """
                UPDATE shift_swaps
                SET status = 'cancelled', updated_at = NOW()
                WHERE shift_id = $1 AND id != $2 AND status IN ('open', 'pending_acceptance', 'pending_admin')
                """,
                swap["shift_id"], swap_id
            )

        return ShiftSwap(**dict(updated_swap))
    finally:
        await conn.close()

@router.post("/swaps/{swap_id}/reject")
async def reject_swap(swap_id: UUID, user: AuthorizedUser) -> ShiftSwap:
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        # Verify admin
        admin = await conn.fetchrow("SELECT role FROM user_profiles WHERE user_id = $1", user.sub)
        if not admin or admin["role"] != "admin":
            raise HTTPException(status_code=403, detail="Only admins can reject swaps")

        # Get swap
        swap = await conn.fetchrow("SELECT * FROM shift_swaps WHERE id = $1", swap_id)
        if not swap:
            raise HTTPException(status_code=404, detail="Swap not found")
        
        if swap["status"] != "pending_admin":
            raise HTTPException(status_code=400, detail="Swap is not pending approval")

        # Update swap status
        updated_swap = await conn.fetchrow(
            """
            UPDATE shift_swaps 
            SET status = 'rejected', updated_at = NOW()
            WHERE id = $1
            RETURNING *
            """,
            swap_id
        )
        return ShiftSwap(**dict(updated_swap))
    finally:
        await conn.close()
