"""One-off (for now) sync of the Ambak bank-name catalog — see
AmbakBankCatalogModel's docstring in database.py for why this exists.

Manager-approved to run manually; NOT wired into any scheduler (the daily
rate-scrape itself stays paused, see scrape_ambak_rates.py's module
docstring). Run this by hand whenever the admin's "add a new bank" list
needs refreshing:

    python -m app.sync_ambak_bank_catalog
"""

import asyncio
import sys

from sqlalchemy.dialects.postgresql import insert

from app.database import AmbakBankCatalogModel, async_session_factory, create_all_tables
from app.scrape_ambak_rates import scrape_ambak_rates


async def sync_bank_catalog() -> int:
    scraped = await scrape_ambak_rates()
    # _parse_cards occasionally sweeps up page furniture as if it were a
    # card (seen: the "76 Banks Found" header text) — no real bank name
    # contains a digit, so this is a cheap, safe way to drop that noise
    # without touching the shared rate-matching parser other banks' live
    # rates depend on.
    names = [name for name in scraped if not any(ch.isdigit() for ch in name)]
    async with async_session_factory() as session:
        for name in names:
            stmt = insert(AmbakBankCatalogModel).values(name=name).on_conflict_do_nothing(index_elements=["name"])
            await session.execute(stmt)
        await session.commit()
    return len(names)


async def main() -> None:
    await create_all_tables()
    count = await sync_bank_catalog()
    print(f"Synced {count} bank names from Ambak into the catalog.")


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
