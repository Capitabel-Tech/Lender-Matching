"""What the admin panel sends and receives. Shaped to match exactly what's
actually stored per product (see app/load_client_property_data.py and
app/explore.py's CATEGORY_VALUES) — property eligibility, FOIR%, max tenure,
and interest rate — not the older Birbal-dataset fields (CIBIL score, loan
amount range, income threshold, documents, processing fee) that this app's
real bank data has never had. app/admin_api.py translates between this plain
shape and the raw attribute/operator/value rule rows the database stores.
"""

from pydantic import BaseModel, Field

from app.schemas import EmploymentType


class AdminProductDetail(BaseModel):
    employment_type: EmploymentType
    # Which loan product this is (Home Loan, Education Loan, ...) — admin
    # organization only for now; see app/explore.py's ADMIN_ONLY_CATEGORIES.
    # Defaults to "home_loan" since every product predates this field.
    loan_type: str = "home_loan"
    property_type: list[str] = Field(default_factory=list)
    property_usage: list[str] = Field(default_factory=list)
    property_stage: list[str] = Field(default_factory=list)
    property_location: list[str] = Field(default_factory=list)
    # Optional because app/load_client_property_data.py loads property
    # eligibility first and pricing data (FOIR%, tenure) arrives separately —
    # a product can genuinely be mid-setup with these still unset.
    foir_pct: float | None = Field(default=None, gt=0, le=100)
    max_tenure_years: float | None = Field(default=None, gt=0)
    # Required — domain.py's get_bank_interest_rate_pct raises if a product
    # has no rate at all, so every product the matching engine actually uses
    # must have one; a bank with no confirmed rate still gets one, flagged by
    # interest_rate_is_estimated.
    interest_rate_pct: float = Field(gt=0)
    interest_rate_upper_pct: float | None = Field(default=None, gt=0)
    interest_rate_is_estimated: bool = False


class AdminProductOut(AdminProductDetail):
    bank_name: str


class AdminBankSummary(BaseModel):
    bank_name: str
    source: str
    employment_types: list[EmploymentType]


class AdminBiasIn(BaseModel):
    recent_borrowers_processed: int = Field(ge=0)
    relationship_note: str = ""


class AdminBiasOut(AdminBiasIn):
    bank_name: str


class AdminCategoryOptionIn(BaseModel):
    value: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9_]+$")
    label: str = Field(min_length=1, max_length=120)
    # Only meaningful for category_key="property_type", which shows its 14
    # values grouped under sub-headings (Residential/Commercial/...) in the
    # borrower sidebar — ignored for every other category.
    group_heading: str | None = None


class AdminCategoryOptionOut(AdminCategoryOptionIn):
    category_key: str


class AmbakBankOption(BaseModel):
    name: str


class AdminAccountOut(BaseModel):
    uid: str
    email: str
    role: str  # "business" or "admin"
    display_name: str | None = None
    org_role: str | None = None  # their role/title within the org, set at signup
    admin_requested: bool = False  # a business account that's asked to be promoted to admin


class ActivityLogEntryOut(BaseModel):
    actor_email: str
    action: str
    ip_address: str | None
    created_at: str
