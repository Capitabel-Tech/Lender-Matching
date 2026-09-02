"""A second, exploratory way to query the same lender data domain.py's
match_lenders uses — built for a filter-sidebar testing UI (checkboxes per
category; checking several boxes in one category is "any of these", picking
across categories is "all of these"), not for a real borrower application.
That's why match_lenders (which requires a full profile: CIBIL, loan amount,
one employment type...) isn't reused here — this dataset doesn't have that
numeric data yet, and this UI is explicitly about browsing what *is* loaded
so far (see app/load_client_property_data.py).

Doesn't reuse domain.py's _rule_satisfied either, because the comparison
shape is reversed: that function checks one borrower answer against a bank's
accepted set. Here it's a set of *selected filter values* against a bank's
accepted set — "does this bank accept any of what I picked" — so this module
reads eligibility_rules' "in"/"==" values directly instead.
"""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import CategoryOptionModel
from app.domain import HomeLoanProduct

# Order controls both the sidebar's section order and how facet counts are
# computed. Keys match the attribute keys app/load_client_property_data.py
# writes into eligibility_rules.
FILTERABLE_CATEGORIES = [
    "employment_type",
    "property_type",
    "property_usage",
    "property_stage",
    "property_location",
]

# loan_type is a real category_options category too — managed from the same
# admin "Manage categories" screen — but deliberately NOT in
# FILTERABLE_CATEGORIES: the borrower-facing Explore page has no concept of
# loan type yet (every product is treated as a home loan), so it must not
# show up as a sidebar filter or a facet. It exists purely so the admin
# panel can organize products by loan type (Home Loan, Education Loan, ...)
# while that borrower-facing behavior catches up later.
ADMIN_ONLY_CATEGORIES = ["loan_type"]

_DEFAULT_LOAN_TYPES: list[tuple[str, str]] = [("home_loan", "Home Loan")]

CATEGORY_LABELS = {
    "employment_type": "Employment / Income Type",
    "property_type": "Property Type",
    "property_usage": "Property Usage",
    "property_stage": "Property Stage",
    "property_location": "Property Location",
}

# Seed data only — the actual, current set of allowed values per category
# lives in the category_options table (see app/database.py's
# CategoryOptionModel and load_category_values below) so an admin can add a
# new value without a code change. This dict is what app/seed_category_options.py
# loads into that table the first time; it's also the fallback used if the
# table happens to be empty (e.g. a fresh database that hasn't been seeded
# yet), so the app still works out of the box.
_DEFAULT_CATEGORY_VALUES: dict[str, list[tuple[str, str]]] = {
    "employment_type": [
        ("salaried", "Salaried"),
        ("self_employed", "Self-Employed"),
        ("pensioner", "Pensioner"),
        ("cash_income", "Cash Income"),
        ("nri", "NRI"),
    ],
    "property_type": [
        ("residential_vacant_land", "Residential — Vacant Land"),
        ("residential_apartment", "Residential — Apartment"),
        ("residential_independent_building", "Residential — Independent Building"),
        ("residential_semi_independent_uds", "Residential — Semi-Independent (UDS)"),
        ("commercial_farm_land", "Commercial — Farm Land"),
        ("commercial_vacant_land", "Commercial — Vacant Land"),
        ("commercial_independent_building", "Commercial — Independent Building"),
        ("commercial_semi_independent_uds", "Commercial — Semi-Independent (UDS)"),
        ("commercial_temporary_structure", "Commercial — Temporary Structure"),
        ("industrial_vacant_land", "Industrial — Vacant Land"),
        ("industrial_warehouse", "Industrial — Warehouse"),
        ("res_cum_comm_independent_building", "Residential cum Commercial — Independent Building"),
        ("res_cum_comm_building", "Residential cum Commercial — Building"),
        ("res_cum_comm_multi_unit", "Residential cum Commercial — Multi-Unit"),
    ],
    "property_usage": [
        ("self_occupied", "Self-Occupied"),
        ("let_out", "Let-Out"),
        ("lease", "Lease"),
    ],
    "property_stage": [
        ("new_purchase", "New Purchase"),
        ("resale", "Resale"),
        ("under_construction", "Under Construction"),
        ("take_over", "Take Over"),
    ],
    "property_location": [
        ("standard_urban", "Standard Urban"),
        ("peri_urban", "Peri-Urban"),
        ("rural", "Rural"),
    ],
}

# property_type's 14 values grouped under sub-headings, matching the client
# workbook's own Classification grouping — seed data for category_options'
# group_heading column, same status as _DEFAULT_CATEGORY_VALUES above.
_DEFAULT_PROPERTY_TYPE_GROUPS: dict[str, str] = {
    "residential_vacant_land": "Residential",
    "residential_apartment": "Residential",
    "residential_independent_building": "Residential",
    "residential_semi_independent_uds": "Residential",
    "commercial_farm_land": "Commercial",
    "commercial_vacant_land": "Commercial",
    "commercial_independent_building": "Commercial",
    "commercial_semi_independent_uds": "Commercial",
    "commercial_temporary_structure": "Commercial",
    "industrial_vacant_land": "Industrial",
    "industrial_warehouse": "Industrial",
    "res_cum_comm_independent_building": "Residential cum Commercial",
    "res_cum_comm_building": "Residential cum Commercial",
    "res_cum_comm_multi_unit": "Residential cum Commercial",
}

VALUE_LABELS = {value: label for values in _DEFAULT_CATEGORY_VALUES.values() for value, label in values}


def label_for(value: str) -> str:
    return VALUE_LABELS.get(value, value)


async def load_category_values(session: AsyncSession) -> dict[str, list[tuple[str, str]]]:
    """The real, current set of allowed values per category — from
    category_options, falling back to the hardcoded defaults for any
    category that table doesn't have rows for yet (e.g. right after a fresh
    deploy, before app/seed_category_options.py has been run)."""
    rows = (
        await session.execute(
            select(CategoryOptionModel).order_by(CategoryOptionModel.category_key, CategoryOptionModel.sort_order)
        )
    ).scalars().all()
    result: dict[str, list[tuple[str, str]]] = {}
    for row in rows:
        result.setdefault(row.category_key, []).append((row.value, row.label))
    for category in FILTERABLE_CATEGORIES:
        if category not in result:
            result[category] = _DEFAULT_CATEGORY_VALUES.get(category, [])
    return result


async def load_loan_types(session: AsyncSession) -> list[tuple[str, str]]:
    """The admin-managed set of loan types (Home Loan, Education Loan, ...) —
    see ADMIN_ONLY_CATEGORIES above for why this isn't in FILTERABLE_CATEGORIES.
    Falls back to just Home Loan if none have been added yet."""
    rows = (
        await session.execute(
            select(CategoryOptionModel)
            .where(CategoryOptionModel.category_key == "loan_type")
            .order_by(CategoryOptionModel.sort_order)
        )
    ).scalars().all()
    if not rows:
        return _DEFAULT_LOAN_TYPES
    return [(row.value, row.label) for row in rows]


async def load_property_type_groups(session: AsyncSession) -> list[dict[str, object]]:
    """property_type's values grouped under their sub-headings, in
    sort_order — powers both the admin's property-type picker and the
    borrower-facing sidebar's grouped checkboxes."""
    rows = (
        await session.execute(
            select(CategoryOptionModel)
            .where(CategoryOptionModel.category_key == "property_type")
            .order_by(CategoryOptionModel.sort_order)
        )
    ).scalars().all()
    if not rows:
        groups: dict[str, list[str]] = {}
        for value, heading in _DEFAULT_PROPERTY_TYPE_GROUPS.items():
            groups.setdefault(heading, []).append(value)
        return [{"heading": heading, "values": values} for heading, values in groups.items()]
    groups = {}
    for row in rows:
        heading = row.group_heading or "Other"
        groups.setdefault(heading, []).append(row.value)
    return [{"heading": heading, "values": values} for heading, values in groups.items()]


@dataclass(frozen=True)
class FacetOption:
    value: str
    label: str
    count: int


def _rule_values(product: HomeLoanProduct, attribute_key: str) -> set[str]:
    for rule in product.rules:
        if rule.attribute_key == attribute_key and rule.operator in ("in", "=="):
            return {v.strip() for v in rule.value.split(",") if v.strip()}
    return set()


def matches(product: HomeLoanProduct, filters: dict[str, list[str]]) -> bool:
    """A product matches if, for every category the user picked at least one
    value in, the product's accepted set overlaps with what was picked.
    Categories with nothing picked don't filter anything out."""
    for category in FILTERABLE_CATEGORIES:
        selected = filters.get(category) or []
        if not selected:
            continue
        if not _rule_values(product, category) & set(selected):
            return False
    return True


def filter_products(products: list[HomeLoanProduct], filters: dict[str, list[str]]) -> list[HomeLoanProduct]:
    return [p for p in products if matches(p, filters)]


def facet_counts(
    products: list[HomeLoanProduct],
    filters: dict[str, list[str]],
    category_values: dict[str, list[tuple[str, str]]],
) -> dict[str, list[FacetOption]]:
    """For each category, how many currently-visible-if-this-were-also-picked
    products each of its possible values would leave — computed against
    products filtered by every *other* category's current selection, so
    ticking one box doesn't collapse its own siblings' counts (matches how
    the Accenture reference site's sidebar behaves).

    Always returns every value in category_values (see load_category_values),
    even ones sitting at 0 — a value that's always 0 is a real, meaningful
    answer ("no bank accepts this yet"), not something to hide as if it
    didn't exist as an option.
    """
    result: dict[str, list[FacetOption]] = {}
    for category in FILTERABLE_CATEGORIES:
        other_filters = {k: v for k, v in filters.items() if k != category}
        base = [p for p in products if matches(p, other_filters)]
        counts: dict[str, int] = {value: 0 for value, _ in category_values[category]}
        for product in base:
            for value in _rule_values(product, category):
                if value in counts:
                    counts[value] += 1
        result[category] = [
            FacetOption(value=value, label=label, count=counts[value]) for value, label in category_values[category]
        ]
    return result
