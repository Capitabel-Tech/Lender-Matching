"""Shared enums for values the admin API validates against a known, fixed set."""

from enum import StrEnum


class EmploymentType(StrEnum):
    SALARIED = "salaried"
    SELF_EMPLOYED = "self_employed"
    PROFESSIONAL = "professional"
    PENSIONER = "pensioner"
    CASH_INCOME = "cash_income"
    NRI = "nri"
