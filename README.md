# Money Garden

Database project for CPSC 304 using Node.js/Express and Oracle.

Money Garden gamifies personal finance by modeling a user's spending as a
garden; overspend on a category and the linked plant wilts, hit your
budget and it thrives. Friends can see each other's gardens and streaks,
and short finance lessons unlock new seeds to plant.

[Milestone](milestones/milestone4.pdf)

[Proposal](https://docs.google.com/document/d/1BEMb5QCjfTmhPcxXpCRvODozFUc4h6v6/edit?usp=sharing&ouid=114146353568543124197&rtpof=true&sd=true)

[ERD/Relations/SQL](https://docs.google.com/document/d/1LoPUKN3fsiJjgPAQQljYwpy3rpKpFFq7/edit?usp=sharing&ouid=114146353568543124197&rtpof=true&sd=true)

[Visualization](milestones/tables.pdf)

## Setup

See the setup guide in this repo for the `.env` / `remote-start.sh`
instructions to run this locally or on the department server.

To connect to the database
```
ssh -l ora_fmunsonw -L localhost:1522:dbhost.students.cs.ubc.ca:1522 remote.students.cs.ubc.ca
```
## What Was Accomplished

Built out the Money Garden database and a GUI on top of it covering all
ten required query categories (insert, update, delete, selection,
projection, join, group by, having, nested aggregation, division), along
with basic sanitization, error handling, and user notifications.

## Changes to Final Schema / ERD

After starting to work on the project, we renamed `Income.primary` to `Income.is_primary`. The original name caused the Incomes view to crash the app in practice, despite `PRIMARY` not being on Oracle's strict reserved-word list. This was fixed in both `appService.js` and `tables.sql` by updating the column definition and all five `INSERT INTO Income` statements.

Currency (currency_code, exchange_rate) exists as its own table, split out from Transaction during normalization. This is consistent with M2 TA feedback noting that our original Transaction FD was incomplete and should not have assumed a separate Currency relation existed pre-normalization. See the Functional Dependencies section below for the corrected FD.

## Scripts

The script to create and populate the tables is located at `tables.sql`. This is a single file with DROP statements first, so it can be re-run from scratch.

## Queries

All ten required queries are implemented in `appService.js`, wired up
through `appController.js`. See the Milestone 4 PDF for the specific
file/line reference for each one.

## Functional Dependencies

**Gardener:** gardener_id → display_name, email, join_date, timezone
(email → gardener_id, display_name, join_date, timezone)

**Season:** name → start_date, end_date, theme_rule

**Garden:** garden_id → theme, created_on, soil_quality, gardener_id,
season_name

**SpendingCategory:** category_name → icon, is_essential, garden_id

**PlantSpecies:** common_name → rarity, days_to_mature,
drought_tolerance, category_name

**BudgetPlan:** plan_id → effective_date, daily_cap, generated_by_rule,
category_name

**Lesson:** lesson_id → title, topic, difficulty, est_minutes

**Currency:** currency_code → exchange_rate

**Transaction:** transaction_id → amount, transaction_date, category_name,
currency_code
*(currency_code is now just a FK into Currency; pre-normalization it also
determined exchange_rate)*

**Expense:** transaction_id → merchant_name, asset

**Income:** transaction_id → source_name, is_primary

**DailySummary:** (log_date, gardener_id) → streak_count

**Contains_Plant:** (garden_id, common_name) → *(no non-prime attributes)*

**Completes_Lesson:** (gardener_id, lesson_id) → *(no non-prime attributes)*

**Follows:** (follower_id, followee_id) → *(no non-prime attributes)*
