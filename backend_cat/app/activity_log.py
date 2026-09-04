"""Records who did what, when, and from where — see database.py's
ActivityLogModel docstring for what this is for and who can see it.

A separate, independent commit rather than folding into each caller's own
transaction — the log entry should still land even in the unlikely case a
caller's later code fails after their main commit, and it has no foreign
key or other relationship to the data it's describing, so there's nothing
to keep atomic with it.
"""

from fastapi import Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import ActivityLogModel, async_session_factory


def _client_ip(request: Request) -> str | None:
    # Trust X-Forwarded-For when present (Render sits behind a proxy) — the
    # first entry in that chain is the original client, not the proxy.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


async def log_activity(request: Request, actor_email: str, action: str) -> None:
    async with async_session_factory() as session:
        session.add(ActivityLogModel(actor_email=actor_email, action=action, ip_address=_client_ip(request)))
        await session.commit()


async def list_activity(session: AsyncSession, limit: int = 200) -> list[ActivityLogModel]:
    result = await session.execute(select(ActivityLogModel).order_by(ActivityLogModel.created_at.desc()).limit(limit))
    return list(result.scalars().all())
