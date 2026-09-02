"""Admin-only endpoints for managing lender data directly — add/update/delete
banks and their eligibility rules, add/update/delete relationship (bias) data.
Every route here requires a real, verified login (see app/auth.py) via the
router-level dependency below; nothing here is reachable without it, unlike
the borrower-facing match endpoint.

Translates between the admin's plain form fields (admin_schemas.py) and the
database's generic attribute/rule rows — the same translation
app/load_birbal_dataset.py already does for the Excel file, just triggered by
a button click instead of a script.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.admin_schemas import (
    AdminBankSummary,
    AdminBiasIn,
    AdminBiasOut,
    AdminCategoryOptionIn,
    AdminCategoryOptionOut,
    AdminProductDetail,
    AdminProductOut,
    AmbakBankOption,
)
from app.auth import require_admin
from app.database import (
    AmbakBankCatalogModel,
    AttributeModel,
    BankBiasFactModel,
    BankModel,
    CategoryOptionModel,
    EligibilityRuleModel,
    HomeLoanProductModel,
    get_db,
)
from app.explore import ADMIN_ONLY_CATEGORIES, CATEGORY_LABELS, FILTERABLE_CATEGORIES
from app.scrape_ambak_rates import _normalize

admin_router = APIRouter(prefix="/api/v1/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@admin_router.get("/me")
async def whoami(admin_email: Annotated[str, Depends(require_admin)]) -> dict[str, str]:
    """Lets the frontend check "am I actually logged in" without any side
    effects — just re-verifies the token and echoes back who it belongs to."""
    return {"email": admin_email}


# Every attribute key an admin-managed product's rules can use. Unlike the
# old Birbal-dataset admin form, missing catalog rows are just created on the
# fly (matching app/load_client_property_data.py's own get-or-create
# pattern) rather than treated as an error — a fresh database with no data
# loaded yet should still let an admin start adding banks from scratch.
_ATTRIBUTE_CATALOG = {
    "employment_type": ("Employment type", "Income", "text"),
    "loan_type": ("Loan type", "Income", "text"),
    "property_type": ("Property type", "Property", "text"),
    "property_usage": ("Property usage", "Property", "text"),
    "property_stage": ("Property stage", "Property", "text"),
    "property_location": ("Property location", "Property", "text"),
    "foir_pct": ("FOIR %", "Pricing", "number"),
    "max_tenure_years": ("Max tenure (years)", "Pricing", "number"),
    "interest_rate_pct": ("Interest rate %", "Pricing", "number"),
    "interest_rate_upper_pct": ("Interest rate upper %", "Pricing", "number"),
    "interest_rate_is_estimated": ("Interest rate is estimated", "Pricing", "boolean"),
}

# property_type/property_usage/property_stage/property_location — the
# list-valued fields a product's rules can hold.
_LIST_ATTRIBUTE_KEYS = frozenset(CATEGORY_LABELS.keys() - {"employment_type"})


async def _get_attributes(session: AsyncSession) -> dict[str, AttributeModel]:
    rows = (await session.execute(select(AttributeModel))).scalars().all()
    attributes = {a.key: a for a in rows}
    missing = _ATTRIBUTE_CATALOG.keys() - attributes.keys()
    for key in missing:
        label, category, data_type = _ATTRIBUTE_CATALOG[key]
        model = AttributeModel(key=key, label=label, category=category, data_type=data_type)
        session.add(model)
        attributes[key] = model
    if missing:
        await session.flush()
    return attributes


def _detail_to_rules(
    product_id: int, detail: AdminProductDetail, attributes: dict[str, AttributeModel]
) -> list[EligibilityRuleModel]:
    rules = [
        EligibilityRuleModel(
            product_id=product_id,
            attribute_id=attributes["employment_type"].id,
            operator="==",
            value=detail.employment_type.value,
        ),
        EligibilityRuleModel(
            product_id=product_id,
            attribute_id=attributes["loan_type"].id,
            operator="==",
            value=detail.loan_type,
        ),
        EligibilityRuleModel(
            product_id=product_id,
            attribute_id=attributes["interest_rate_pct"].id,
            operator="fact",
            value=str(detail.interest_rate_pct),
        ),
    ]
    for key in _LIST_ATTRIBUTE_KEYS:
        values: list[str] = getattr(detail, key)
        if values:
            rules.append(
                EligibilityRuleModel(product_id=product_id, attribute_id=attributes[key].id, operator="in", value=",".join(values))
            )
    if detail.foir_pct is not None:
        rules.append(
            EligibilityRuleModel(product_id=product_id, attribute_id=attributes["foir_pct"].id, operator="fact", value=str(detail.foir_pct))
        )
    if detail.max_tenure_years is not None:
        rules.append(
            EligibilityRuleModel(
                product_id=product_id, attribute_id=attributes["max_tenure_years"].id, operator="fact", value=str(detail.max_tenure_years)
            )
        )
    if detail.interest_rate_upper_pct is not None:
        rules.append(
            EligibilityRuleModel(
                product_id=product_id,
                attribute_id=attributes["interest_rate_upper_pct"].id,
                operator="fact",
                value=str(detail.interest_rate_upper_pct),
            )
        )
    if detail.interest_rate_is_estimated:
        rules.append(
            EligibilityRuleModel(
                product_id=product_id, attribute_id=attributes["interest_rate_is_estimated"].id, operator="fact", value="true"
            )
        )
    return rules


def _rules_to_detail(bank_name: str, product: HomeLoanProductModel) -> AdminProductOut:
    facts: dict[str, str] = {}
    lists: dict[str, list[str]] = {key: [] for key in _LIST_ATTRIBUTE_KEYS}
    for rule in product.rules:
        key = rule.attribute.key
        if key in lists:
            lists[key] = [v.strip() for v in rule.value.split(",") if v.strip()]
        else:
            facts[key] = rule.value
    return AdminProductOut(
        bank_name=bank_name,
        employment_type=facts["employment_type"],
        # Defaults to "home_loan" for every product that predates this field
        # — see admin_schemas.py's AdminProductDetail.loan_type.
        loan_type=facts.get("loan_type", "home_loan"),
        property_type=lists["property_type"],
        property_usage=lists["property_usage"],
        property_stage=lists["property_stage"],
        property_location=lists["property_location"],
        foir_pct=float(facts["foir_pct"]) if "foir_pct" in facts else None,
        max_tenure_years=float(facts["max_tenure_years"]) if "max_tenure_years" in facts else None,
        interest_rate_pct=float(facts["interest_rate_pct"]),
        interest_rate_upper_pct=float(facts["interest_rate_upper_pct"]) if "interest_rate_upper_pct" in facts else None,
        interest_rate_is_estimated=facts.get("interest_rate_is_estimated") == "true",
    )


async def _get_bank_or_404(session: AsyncSession, bank_name: str) -> BankModel:
    bank = (
        await session.execute(
            select(BankModel)
            .options(selectinload(BankModel.products).selectinload(HomeLoanProductModel.rules).selectinload(EligibilityRuleModel.attribute))
            .where(BankModel.name == bank_name)
        )
    ).scalar_one_or_none()
    if bank is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No bank named {bank_name!r}.")
    return bank


def _find_product(bank: BankModel, loan_type: str, employment_type: str) -> HomeLoanProductModel | None:
    for product in bank.products:
        by_key = {rule.attribute.key: rule.value for rule in product.rules}
        # Defaults to "home_loan" for products that predate loan_type, same
        # as _rules_to_detail — otherwise every pre-existing product would
        # stop matching "home_loan" lookups the moment this field shipped.
        if by_key.get("employment_type") == employment_type and by_key.get("loan_type", "home_loan") == loan_type:
            return product
    return None


# ---------------------------------------------------------------------------
# Banks
# ---------------------------------------------------------------------------


@admin_router.get("/banks", response_model=list[AdminBankSummary])
async def list_banks(session: Annotated[AsyncSession, Depends(get_db)]) -> list[AdminBankSummary]:
    banks = (
        await session.execute(
            select(BankModel).options(
                selectinload(BankModel.products).selectinload(HomeLoanProductModel.rules).selectinload(EligibilityRuleModel.attribute)
            )
        )
    ).scalars().all()
    return [
        AdminBankSummary(
            bank_name=bank.name,
            source=bank.source,
            employment_types=[
                rule.value
                for product in bank.products
                for rule in product.rules
                if rule.attribute.key == "employment_type"
            ],
        )
        for bank in banks
    ]


@admin_router.get("/ambak-banks", response_model=list[AmbakBankOption])
async def list_ambak_banks(session: Annotated[AsyncSession, Depends(get_db)]) -> list[AmbakBankOption]:
    """Ambak lender names not already one of our banks — powers the "add a
    new bank" picker, so an admin picks a name that matches what
    scrape_ambak_rates.py will later look for, instead of free-typing one
    that silently never gets a live rate. Compared with the same
    suffix/case-insensitive normalization the scraper itself uses, so
    "HDFC Bank" on Ambak's list correctly excludes our "HDFC Bank Ltd".
    """
    catalog = (await session.execute(select(AmbakBankCatalogModel))).scalars().all()
    existing_names = {_normalize(b.name) for b in (await session.execute(select(BankModel))).scalars().all()}
    return [
        AmbakBankOption(name=row.name)
        for row in sorted(catalog, key=lambda r: r.name)
        if _normalize(row.name) not in existing_names
    ]


@admin_router.get("/products", response_model=list[AdminProductOut])
async def list_all_products(session: Annotated[AsyncSession, Depends(get_db)]) -> list[AdminProductOut]:
    """Every bank's every product in one flat list — powers the admin
    spreadsheet grid, which shows every row up front rather than needing a
    per-bank drill-down fetch."""
    banks = (
        await session.execute(
            select(BankModel).options(
                selectinload(BankModel.products).selectinload(HomeLoanProductModel.rules).selectinload(EligibilityRuleModel.attribute)
            )
        )
    ).scalars().all()
    return [_rules_to_detail(bank.name, product) for bank in banks for product in bank.products]


@admin_router.get("/banks/{bank_name}/products", response_model=list[AdminProductOut])
async def get_bank_products(
    bank_name: str, session: Annotated[AsyncSession, Depends(get_db)]
) -> list[AdminProductOut]:
    bank = await _get_bank_or_404(session, bank_name)
    return [_rules_to_detail(bank.name, product) for product in bank.products]


def _require_property_lists(detail: AdminProductDetail) -> None:
    for key in _LIST_ATTRIBUTE_KEYS:
        if not getattr(detail, key):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Pick at least one {key.replace('_', ' ')}.")


@admin_router.post("/banks/{bank_name}/products", response_model=AdminProductOut, status_code=status.HTTP_201_CREATED)
async def create_bank_product(
    bank_name: str, detail: AdminProductDetail, session: Annotated[AsyncSession, Depends(get_db)]
) -> AdminProductOut:
    _require_property_lists(detail)
    attributes = await _get_attributes(session)

    bank = (await session.execute(select(BankModel).where(BankModel.name == bank_name))).scalar_one_or_none()
    if bank is None:
        # source="admin_manual" — a third tag alongside "excel_import" and
        # "manual_calibration" (see BankModel's docstring in database.py) so
        # bulk reloads of the Excel file never touch banks added here either.
        bank = BankModel(name=bank_name, source="admin_manual")
        session.add(bank)
        await session.flush()
    else:
        existing = await _get_bank_or_404(session, bank_name)
        if _find_product(existing, detail.loan_type, detail.employment_type.value) is not None:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"{bank_name} already has a {detail.employment_type.value} {detail.loan_type} product — use the update endpoint instead.",
            )

    loan_type_label = detail.loan_type.replace("_", " ").title()
    product = HomeLoanProductModel(
        bank_id=bank.id, product_name=f"{loan_type_label} — {detail.employment_type.value.replace('_', ' ').title()}"
    )
    session.add(product)
    await session.flush()

    session.add_all(_detail_to_rules(product.id, detail, attributes))
    await session.commit()

    # Without this, the re-fetch below can hand back the newly-created
    # product with a stale, empty `.rules` collection — the `product` object
    # already sits in this session's identity map from the `session.add()`
    # above, and its `rules` relationship was never populated via ORM
    # assignment (the rules were linked by raw product_id, not `rule.product
    # = product`), so a plain requery reuses that stale empty collection
    # instead of loading what was just committed. See update_bank_product's
    # identical fix below for the same underlying SQLAlchemy behavior.
    session.expire_all()

    bank_fresh = await _get_bank_or_404(session, bank_name)
    return _rules_to_detail(bank_name, _find_product(bank_fresh, detail.loan_type, detail.employment_type.value))


@admin_router.put("/banks/{bank_name}/products/{loan_type}/{employment_type}", response_model=AdminProductOut)
async def update_bank_product(
    bank_name: str,
    loan_type: str,
    employment_type: str,
    detail: AdminProductDetail,
    session: Annotated[AsyncSession, Depends(get_db)],
) -> AdminProductOut:
    if detail.employment_type.value != employment_type:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "employment_type in the URL and body must match.")
    if detail.loan_type != loan_type:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "loan_type in the URL and body must match.")
    _require_property_lists(detail)
    attributes = await _get_attributes(session)
    bank = await _get_bank_or_404(session, bank_name)
    product = _find_product(bank, loan_type, employment_type)
    if product is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            f"{bank_name} has no {employment_type} {loan_type} product yet — use the create endpoint instead.",
        )

    # Replace-all-rules is simpler and less error-prone than diffing field by
    # field, and this table is small enough (≤11 rows) that it's cheap.
    await session.execute(delete(EligibilityRuleModel).where(EligibilityRuleModel.product_id == product.id))
    session.add_all(_detail_to_rules(product.id, detail, attributes))
    await session.commit()

    # The bulk delete() above is a Core statement — it doesn't touch this
    # session's already-loaded `bank`/`product` objects, so without this,
    # the re-fetch below would silently hand back the stale pre-update rules
    # instead of what was just written (SQLAlchemy's identity map doesn't
    # know those Python objects are now wrong).
    session.expire_all()

    bank_fresh = await _get_bank_or_404(session, bank_name)
    return _rules_to_detail(bank_name, _find_product(bank_fresh, loan_type, employment_type))


@admin_router.delete("/banks/{bank_name}/products/{loan_type}/{employment_type}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bank_product(
    bank_name: str, loan_type: str, employment_type: str, session: Annotated[AsyncSession, Depends(get_db)]
) -> None:
    bank = await _get_bank_or_404(session, bank_name)
    product = _find_product(bank, loan_type, employment_type)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{bank_name} has no {employment_type} {loan_type} product.")
    await session.delete(product)
    await session.commit()


@admin_router.delete("/banks/{bank_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bank(bank_name: str, session: Annotated[AsyncSession, Depends(get_db)]) -> None:
    bank = await _get_bank_or_404(session, bank_name)
    await session.delete(bank)
    await session.commit()


# ---------------------------------------------------------------------------
# Relationship / bias data
# ---------------------------------------------------------------------------


@admin_router.get("/bias", response_model=list[AdminBiasOut])
async def list_bias(session: Annotated[AsyncSession, Depends(get_db)]) -> list[AdminBiasOut]:
    rows = (await session.execute(select(BankBiasFactModel))).scalars().all()
    by_bank: dict[str, dict[str, str]] = {}
    for row in rows:
        by_bank.setdefault(row.bank_name, {})[row.metric_key] = row.value
    return [
        AdminBiasOut(
            bank_name=name,
            recent_borrowers_processed=int(facts.get("recent_borrowers_processed", 0)),
            relationship_note=facts.get("relationship_note", ""),
        )
        for name, facts in by_bank.items()
    ]


@admin_router.put("/bias/{bank_name}", response_model=AdminBiasOut)
async def upsert_bias(
    bank_name: str, data: AdminBiasIn, session: Annotated[AsyncSession, Depends(get_db)]
) -> AdminBiasOut:
    for metric_key, value in (
        ("recent_borrowers_processed", str(data.recent_borrowers_processed)),
        ("relationship_note", data.relationship_note),
    ):
        stmt = (
            insert(BankBiasFactModel)
            .values(bank_name=bank_name, metric_key=metric_key, value=value)
            .on_conflict_do_update(index_elements=["bank_name", "metric_key"], set_={"value": value})
        )
        await session.execute(stmt)
    await session.commit()
    return AdminBiasOut(bank_name=bank_name, **data.model_dump())


@admin_router.delete("/bias/{bank_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bias(bank_name: str, session: Annotated[AsyncSession, Depends(get_db)]) -> None:
    result = await session.execute(delete(BankBiasFactModel).where(BankBiasFactModel.bank_name == bank_name))
    await session.commit()
    if result.rowcount == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{bank_name} has no relationship data.")


# ---------------------------------------------------------------------------
# Category options — the allowed values for employment_type, property_type,
# property_usage, property_stage, property_location. Reading them back is
# public (see app/explore_api.py's GET /api/v1/explore/categories, the same
# endpoint the borrower sidebar and this admin form both use) — only adding
# and removing values needs admin login.
# ---------------------------------------------------------------------------


@admin_router.post("/categories/{category_key}", response_model=AdminCategoryOptionOut, status_code=status.HTTP_201_CREATED)
async def add_category_option(
    category_key: str, option: AdminCategoryOptionIn, session: Annotated[AsyncSession, Depends(get_db)]
) -> AdminCategoryOptionOut:
    if category_key not in FILTERABLE_CATEGORIES and category_key not in ADMIN_ONLY_CATEGORIES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unknown category {category_key!r}.")
    existing = (
        await session.execute(
            select(CategoryOptionModel).where(
                CategoryOptionModel.category_key == category_key, CategoryOptionModel.value == option.value
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, f"{category_key!r} already has a {option.value!r} value.")
    max_sort = (
        await session.execute(
            select(func.max(CategoryOptionModel.sort_order)).where(CategoryOptionModel.category_key == category_key)
        )
    ).scalar_one()
    session.add(
        CategoryOptionModel(
            category_key=category_key,
            value=option.value,
            label=option.label,
            group_heading=option.group_heading if category_key == "property_type" else None,
            sort_order=(max_sort or 0) + 1,
        )
    )
    await session.commit()
    return AdminCategoryOptionOut(category_key=category_key, **option.model_dump())


@admin_router.delete("/categories/{category_key}/{value}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category_option(category_key: str, value: str, session: Annotated[AsyncSession, Depends(get_db)]) -> None:
    result = await session.execute(
        delete(CategoryOptionModel).where(
            CategoryOptionModel.category_key == category_key, CategoryOptionModel.value == value
        )
    )
    await session.commit()
    if result.rowcount == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{category_key!r} has no {value!r} value.")
