"""Product model and affordability math: pure Python, no HTTP, no database.

Pricing/amount/tier info (interest rate, fee, loan amount range, approval tier)
isn't a fixed field on HomeLoanProduct — a new field would mean a developer
touching code every time one was needed. Instead these are rows in `rules`,
using the "fact" operator (a stored value, not a condition to check against a
borrower's answer) instead of a dedicated field each. `get_fact` below reads
them back out.
"""

from dataclasses import dataclass
from typing import Literal

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

AttributeDataType = Literal["number", "boolean", "text"]
RuleOperator = Literal[">=", "<=", "==", "required", "in", "fact", "any_of", "between"]


@dataclass(frozen=True)
class AttributeDef:
    """One entry in the small, rarely-changing criteria catalog."""

    key: str
    label: str
    category: str
    data_type: AttributeDataType


@dataclass(frozen=True)
class EligibilityRuleDef:
    """Usually a condition: a product needs `attribute_key` to satisfy `operator`
    against `value`, checked against a borrower's answer. `value` is always text;
    it's interpreted using the attribute's data_type.

    When `operator` is "fact", this row isn't a condition at all — it's a stored
    value (interest rate, tenure, ...) for display, not something checked
    against a borrower's answer. See get_fact.

    An earlier version had an `employment_type` field to scope a rule to one
    employment type. Removed — no real data has needed that distinction yet. If
    it's needed later, it should come back as a general "scope by any attribute"
    mechanism, not a field limited to employment type alone (see database.py).
    """

    attribute_key: str
    operator: RuleOperator
    value: str


@dataclass(frozen=True)
class HomeLoanProduct:
    id: int
    bank_name: str
    product_name: str
    rules: list[EligibilityRuleDef]


def get_fact(product: HomeLoanProduct, key: str) -> str | None:
    """Reads a stored "fact" row (interest rate, loan amount range, tier, ...)
    off a product, or None if that fact hasn't been loaded for this product yet.
    None is treated as "not known", never as zero.
    """
    for rule in product.rules:
        if rule.operator == "fact" and rule.attribute_key == key:
            return rule.value
    return None


# ---------------------------------------------------------------------------
# Affordability — FOIR and age-based tenure capping
# ---------------------------------------------------------------------------

# Not bank-specific data, just a general rule of thumb we hardcoded after
# the client said not to bother storing age-related rules per bank — see
# calculate_final_tenure_years.
ASSUMED_RETIREMENT_AGE = 60

def calculate_customer_foir_pct(monthly_income: float, monthly_obligations: float) -> float:
    """The customer's own FOIR — what share of their income is already
    committed to existing loan payments. Compared against a bank's stored
    foir_pct fact (see get_fact) to check whether they qualify for a new
    loan from that bank: customer_foir_pct <= bank's foir_pct.
    """
    if monthly_income <= 0:
        return 0.0
    return (monthly_obligations / monthly_income) * 100


def calculate_final_tenure_years(customer_age: int, bank_max_tenure_years: float) -> float:
    """The tenure actually available to this customer at this bank: whichever
    is smaller — the bank's own max tenure (a stored fact, see get_fact), or
    how many years are left until ASSUMED_RETIREMENT_AGE. Never negative —
    a customer already at or past that age gets 0 years, not a negative
    number.
    """
    age_based_tenure = max(ASSUMED_RETIREMENT_AGE - customer_age, 0)
    return min(bank_max_tenure_years, age_based_tenure)


def calculate_max_emi(bank_foir_pct: float, monthly_income: float, monthly_obligations: float) -> float:
    """The biggest monthly payment left for a *new* loan: this bank's FOIR%
    applied to income, minus what the customer already pays toward existing
    obligations. Can go negative — that just means this bank's FOIR% doesn't
    leave room for a new loan at all, given what the customer already owes.
    """
    return (bank_foir_pct / 100) * monthly_income - monthly_obligations


def get_bank_interest_rate_pct(product: HomeLoanProduct) -> tuple[float, bool]:
    """This bank's interest rate — always read from stored facts, never a
    hardcoded guess in code. Most banks have a real, confirmed rate; a bank
    with no public rate (e.g. InCred) still gets a normal "interest_rate_pct"
    fact row, just paired with an "interest_rate_is_estimated" fact set to
    "true" so the UI can flag it as unconfirmed rather than presenting it as
    real. Raises if a product has no interest_rate_pct fact at all — every
    product loaded into the system is expected to have one (real or
    estimated), so a missing fact means the load is incomplete, not something
    to silently paper over with a number invented here.
    """
    raw = get_fact(product, "interest_rate_pct")
    if raw is None:
        raise ValueError(
            f"Product {product.id} ({product.bank_name} — {product.product_name}) has no "
            "interest_rate_pct fact loaded."
        )
    is_estimated = get_fact(product, "interest_rate_is_estimated") == "true"
    return float(raw), is_estimated


def get_bank_interest_rate_upper_pct(product: HomeLoanProduct) -> float | None:
    """The upper end of this bank's published rate range, from the
    "interest_rate_upper_pct" fact — only set for banks whose source
    actually stated one. None for a bank that only ever published a single
    "starting from" rate; the UI uses that to decide whether a rate
    range/slider makes sense to show at all, rather than inventing a ceiling.
    """
    raw = get_fact(product, "interest_rate_upper_pct")
    return float(raw) if raw is not None else None


def calculate_max_loan_amount(max_emi: float, tenure_years: float, interest_rate_pct: float) -> float:
    """Turns a monthly EMI budget into one lump-sum loan amount, using the
    standard bank formula (present value of an annuity) — the same formula
    a real FOIR calculator (fincover.com) uses, verified by reproducing its
    exact output. That site assumes a flat 5-year tenure for everyone; we
    use tenure_years from calculate_final_tenure_years instead, since we
    already have a real per-customer, per-bank tenure to work with.
    interest_rate_pct is this bank's real rate — see get_bank_interest_rate_pct.

    Zero (not negative) when there's no room for a new loan at all — an
    EMI or tenure of zero can't be converted into any loan amount.
    """
    if max_emi <= 0 or tenure_years <= 0:
        return 0.0
    monthly_rate = interest_rate_pct / 100 / 12
    tenure_months = tenure_years * 12
    return max_emi * (1 - (1 + monthly_rate) ** -tenure_months) / monthly_rate

