# Money Garden

Database project for CPSC 304 using Node.js/Express and Oracle.

Money Garden gamifies personal finance by modeling a user's spending as a
garden — overspend on a category and the linked plant wilts, hit your
budget and it thrives. Friends can see each other's gardens and streaks,
and short finance lessons unlock new seeds to plant.

Proposal (ADD_LINK_HERE)
ERD/Relations + SQL DDL Draft (ADD_LINK_HERE)
Specifications (ADD_LINK_HERE)

## Setup

See the setup guide in this repo for the `.env` / `remote-start.sh`
instructions to run this locally or on the department server.

## What Was Accomplished

Built out the Money Garden database and a GUI on top of it covering all
ten required query categories (insert, update, delete, selection,
projection, join, group by, having, nested aggregation, division), along
with basic sanitization, error handling, and user notifications.

## Changes to Final Schema

- Renamed `Income.primary` → `Income.is_primary`. The original name
  caused the Incomes view to crash the app in practice (despite `PRIMARY`
  not being on Oracle's strict reserved-word list). Fixed in
  `appService.js`.
  Fixed in both `appService.js` and `tables.sql` (the column definition
  and all five `INSERT INTO Income` statements).

## Scripts

The script to create and populate the tables is located at `tables.sql`

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

**Transaction:** transaction_id → amount, transaction_date,
category_name, currency_code, exchange_rate
*(pre-normalization; currency_code, exchange_rate later split into the
Currency table above — see Milestone 3 normalization writeup)*

**Expense:** transaction_id → merchant_name, asset

**Income:** transaction_id → source_name, is_primary

**DailySummary:** (log_date, gardener_id) → streak_count

**Contains_Plant:** (garden_id, common_name) → *(no non-prime attributes)*

**Completes_Lesson:** (gardener_id, lesson_id) → *(no non-prime attributes)*

**Follows:** (follower_id, followee_id) → *(no non-prime attributes)*
