# Database schema

`supabase/schema.sql` is a plain-SQL mirror of the SQLAlchemy models in
`app/database.py` — kept here for reference and for running directly
against the database with `psql` if needed. This is the only database the
app uses (`DATABASE_URL` in `.env`); if you change `database.py`, update
this file to match.

The table design is banks → home_loan_products → eligibility_rules, with a
shared `attributes` catalog so a new eligibility field is just a new row in
`attributes`, not a new column or a schema change.
