"""The API contract: what the website sends us, and what we send back.

These enums are a validation convenience at the API boundary only — the form the
customer fills in today asks a known, fixed set of questions, so it's reasonable
to validate them strictly here. That's independent of the database and matching
engine underneath, which no longer know about any of these specific values; see
app.domain for how a fixed request like this gets turned into generic attribute
answers. Adding a brand new question to the form still means adding a field here
(this is API contract, not eligibility data) — but it no longer means touching the
database schema or the matching logic.
"""

from enum import StrEnum


class EmploymentType(StrEnum):
    SALARIED = "salaried"
    SELF_EMPLOYED = "self_employed"
    PROFESSIONAL = "professional"
    PENSIONER = "pensioner"
    # The two extra income types from the client's property-eligibility
    # workbook (see app/load_client_property_data.py) — not in the original
    # Birbal dataset, which is why they weren't here before.
    CASH_INCOME = "cash_income"
    NRI = "nri"


class DocumentType(StrEnum):
    ITR_FORM16 = "itr_form16"
    ITR = "itr"
    SALARY_SLIP = "salary_slip"
    CASH_INCOME = "cash_income"
    BANK_STATEMENT = "bank_statement"
    GST = "gst"
    BUSINESS_PROOF = "business_proof"
    PENSION_PROOF = "pension_proof"


class PropertyType(StrEnum):
    STANDARD_URBAN = "standard_urban"
    SEMI_URBAN_VILLAGE = "semi_urban_village"
    UNDER_CONSTRUCTION = "under_construction"
    OTHERS = "others"


