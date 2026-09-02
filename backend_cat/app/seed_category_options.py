"""One-time seed: copies app/explore.py's hardcoded default category values
(and property_type's group headings) into the category_options table, so the
admin's "Manage Categories" screen and the borrower sidebar have real data to
start from. Idempotent — safe to re-run; skips any (category_key, value)
pair that's already there rather than duplicating or overwriting it, so it
never clobbers values an admin has since added, renamed, or removed.

Run with: python -m app.seed_category_options
"""

import asyncio

from sqlalchemy import select

from app.database import CategoryOptionModel, async_session_factory, create_all_tables
from app.explore import _DEFAULT_CATEGORY_VALUES, _DEFAULT_LOAN_TYPES, _DEFAULT_PROPERTY_TYPE_GROUPS


async def seed() -> None:
    await create_all_tables()
    async with async_session_factory() as session:
        existing = {
            (row.category_key, row.value)
            for row in (await session.execute(select(CategoryOptionModel))).scalars().all()
        }
        added = 0
        all_defaults = {**_DEFAULT_CATEGORY_VALUES, "loan_type": _DEFAULT_LOAN_TYPES}
        for category_key, options in all_defaults.items():
            for sort_order, (value, label) in enumerate(options):
                if (category_key, value) in existing:
                    continue
                session.add(
                    CategoryOptionModel(
                        category_key=category_key,
                        value=value,
                        label=label,
                        group_heading=_DEFAULT_PROPERTY_TYPE_GROUPS.get(value) if category_key == "property_type" else None,
                        sort_order=sort_order,
                    )
                )
                added += 1
        await session.commit()
        print(f"Seeded {added} new category option(s); {len(existing)} already existed.")


if __name__ == "__main__":
    asyncio.run(seed())
