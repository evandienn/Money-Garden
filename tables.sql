DROP TABLE Follows CASCADE CONSTRAINTS;
DROP TABLE Completes_Lesson CASCADE CONSTRAINTS;
DROP TABLE Contains_Plant CASCADE CONSTRAINTS;
DROP TABLE DailySummary CASCADE CONSTRAINTS;
DROP TABLE Income CASCADE CONSTRAINTS;
DROP TABLE Expense CASCADE CONSTRAINTS;
DROP TABLE Transaction CASCADE CONSTRAINTS;
DROP TABLE Currency CASCADE CONSTRAINTS;
DROP TABLE Lesson CASCADE CONSTRAINTS;
DROP TABLE BudgetPlan CASCADE CONSTRAINTS;
DROP TABLE PlantSpecies CASCADE CONSTRAINTS;
DROP TABLE SpendingCategory CASCADE CONSTRAINTS;
DROP TABLE Garden CASCADE CONSTRAINTS;
DROP TABLE Season CASCADE CONSTRAINTS;
DROP TABLE Gardener CASCADE CONSTRAINTS;

CREATE TABLE Gardener (
    gardener_id NUMBER,
    display_name VARCHAR2 (50),
    email VARCHAR2 (100) NOT NULL UNIQUE,
    join_date DATE,
    timezone VARCHAR2 (50),
    PRIMARY KEY (gardener_id)
);
CREATE TABLE Season (
    name VARCHAR2(50),
    start_date DATE,
    end_date DATE,
    theme_rule VARCHAR2(100),
    PRIMARY KEY (name)
);
CREATE TABLE Garden (
    garden_id NUMBER,
    theme VARCHAR2(50),
    created_on DATE,
    soil_quality VARCHAR2(20),
    gardener_id NUMBER,
    season_name VARCHAR2(50),
    PRIMARY KEY (garden_id),
    FOREIGN KEY (gardener_id) REFERENCES Gardener (gardener_id),
    FOREIGN KEY (season_name) REFERENCES Season (name)
);
CREATE TABLE SpendingCategory (
    category_name VARCHAR2(50),
    icon VARCHAR2(20),
    is_essential NUMBER(1),
    garden_id NUMBER,
    PRIMARY KEY (category_name),
    FOREIGN KEY (garden_id) REFERENCES Garden (garden_id)
);
CREATE TABLE PlantSpecies (
    common_name VARCHAR2(50),
    rarity VARCHAR2(20),
    days_to_mature NUMBER,
    drought_tolerance VARCHAR2(20),
    category_name VARCHAR2 (50),
    PRIMARY KEY (common_name),
    UNIQUE (category_name),
    FOREIGN KEY (category_name) REFERENCES SpendingCategory (category_name)
);
CREATE TABLE BudgetPlan (
    plan_id NUMBER,
    effective_date DATE,
    daily_cap NUMBER (10,2),
    generated_by_rule VARCHAR2(100),
    category_name VARCHAR2 (50),
    PRIMARY KEY (plan_id),
    FOREIGN KEY (category_name) REFERENCES SpendingCategory (category_name)
);
CREATE TABLE Lesson (
    lesson_id NUMBER,
    title VARCHAR2(100),
    topic VARCHAR2(50),
    difficulty VARCHAR2(20),
    est_minutes NUMBER,
    PRIMARY KEY (lesson_id)
);
CREATE TABLE Currency (
    currency_code CHAR(3),
    exchange_rate NUMBER,
    PRIMARY KEY (currency_code)
);
CREATE TABLE Transaction (
    transaction_id NUMBER,
    amount NUMBER(10,2),
    transaction_date DATE,
    category_name VARCHAR2(50),
    currency_code CHAR(3),
    PRIMARY KEY (transaction_id),
    FOREIGN KEY (category_name) REFERENCES SpendingCategory (category_name),
    FOREIGN KEY (currency_code) REFERENCES Currency (currency_code)
);
CREATE TABLE Expense (
    transaction_id NUMBER,
    merchant_name VARCHAR2(100),
    asset VARCHAR2 (50),
    PRIMARY KEY (transaction_id),
    FOREIGN KEY (transaction_id) REFERENCES Transaction (transaction_id) ON DELETE CASCADE
);
CREATE TABLE Income (
    transaction_id NUMBER,
    source_name VARCHAR2(100),
    is_primary NUMBER(1),
    PRIMARY KEY (transaction_id),
    FOREIGN KEY (transaction_id) REFERENCES Transaction (transaction_id) ON DELETE CASCADE
);
CREATE TABLE DailySummary (
    log_date DATE,
    gardener_id NUMBER,
    streak_count NUMBER,
    PRIMARY KEY (log_date, gardener_id),
    FOREIGN KEY (gardener_id) REFERENCES Gardener (gardener_id) ON DELETE CASCADE
);
CREATE TABLE Contains_Plant (
    garden_id NUMBER,
    common_name VARCHAR2 (50),
    PRIMARY KEY (garden_id, common_name),
    FOREIGN KEY (garden_id) REFERENCES Garden (garden_id),
    FOREIGN KEY (common_name) REFERENCES PlantSpecies (common_name)
);
CREATE TABLE Completes_Lesson (
    gardener_id NUMBER,
    lesson_id NUMBER,
    PRIMARY KEY (gardener_id, lesson_id),
    FOREIGN KEY (gardener_id) REFERENCES Gardener (gardener_id),
    FOREIGN KEY (lesson_id) REFERENCES Lesson (lesson_id)
);
CREATE TABLE Follows (
    follower_id NUMBER,
    followee_id NUMBER,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES Gardener (gardener_id),
    FOREIGN KEY (followee_id) REFERENCES Gardener (gardener_id)
);


INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (1, 'temp1', 'temp1@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'EST');
INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (2, 'temp2', 'temp2@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'PST');
INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (3, 'temp3', 'temp3@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'PST');
INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (4, 'temp4', 'temp4@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'CST');
INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (5, 'temp5', 'temp5@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'EST');
INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('fall', TO_DATE('09-20-2025', 'MM-DD-YYYY'), TO_DATE('12-19-2025', 'MM-DD-YYYY'), 'need to maintain healthy plants for winter');
INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('winter', TO_DATE('12-20-2025', 'MM-DD-YYYY'), TO_DATE('03-19-2026', 'MM-DD-YYYY'), 'garden moved to greenhouse');
INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('spring', TO_DATE('03-20-2026', 'MM-DD-YYYY'), TO_DATE('06-19-2026', 'MM-DD-YYYY'), 'plants get a boost for money saved');
INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('summer', TO_DATE('06-20-2026', 'MM-DD-YYYY'), TO_DATE('09-19-2026', 'MM-DD-YYYY'), 'plants need safety from the sun');
INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('fall_2', TO_DATE('09-20-2025', 'MM-DD-YYYY'), TO_DATE('12-19-2025', 'MM-DD-YYYY'), 'plant boost depending on species');
INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (1, 'tropical', TO_DATE('01-01-2026', 'MM-DD-YYYY'), 'healthy', 1, 'fall');
INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (2, 'arid', TO_DATE('01-02-2026', 'MM-DD-YYYY'), 'poor', 2, 'summer');
INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (3, 'plains', TO_DATE('01-03-2026', 'MM-DD-YYYY'), 'moderate', 3, 'winter');
INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (4, 'classic', TO_DATE('01-04-2026', 'MM-DD-YYYY'), 'healthy', 4, 'spring');
INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (5, 'hellscape', TO_DATE('01-05-2026', 'MM-DD-YYYY'), 'healthy', 5, 'spring');
INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('eating out', 'burger', 0, 1);
INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('school', 'book', 1, 1);
INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('rent', 'house', 1, 1);
INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('travel', 'plane', 0, 1);
INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('investment', 'bank', 0, 1);
INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Tomato', 'Common', 85, 'Medium', 'eating out');
INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Sunflower', 'Common', 75, 'High', 'school');
INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Oak Tree', 'Uncommon', 3650, 'Medium', 'rent');
INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Lavender', 'Rare', 120, 'High', 'travel');
INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Money Tree', 'Common', 730, 'Low', 'investment');
INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (1, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 25.00, 'Default budget', 'eating out');
INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (2, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 15.00, 'Student budget', 'school');
INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (3, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 60.00, 'Monthly rent allocation', 'rent');
INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (4, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 20.00, 'Vacation savings', 'travel');
INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (5, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 30.00, 'Invest 20% of income', 'investment');
INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (1, 'Budgeting Basics', 'Budgeting', 'Easy', 15);
INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (2, 'Saving Money', 'Saving', 'Easy', 20);
INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (3, 'Understanding Credit', 'Credit', 'Medium', 25);
INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (4, 'Investing 101', 'Investing', 'Medium', 30);
INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (5, 'Retirement Planning', 'Investing', 'Hard', 45);
INSERT INTO Currency (currency_code, exchange_rate) VALUES ('CAD', 1.00);
INSERT INTO Currency (currency_code, exchange_rate) VALUES ('USD', 1.35);
INSERT INTO Currency (currency_code, exchange_rate) VALUES ('EUR', 1.45);
INSERT INTO Currency (currency_code, exchange_rate) VALUES ('GBP', 1.70);
INSERT INTO Currency (currency_code, exchange_rate) VALUES ('JPY', 0.009);
INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (1, 18.50, TO_DATE('07-01-2026', 'MM-DD-YYYY'), 'eating out', 'CAD');
INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (2, 120.00, TO_DATE('07-02-2026', 'MM-DD-YYYY'), 'school', 'CAD');
INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (3, 1450.00, TO_DATE('07-03-2026', 'MM-DD-YYYY'), 'rent', 'CAD');
INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (4, 75.25, TO_DATE('07-04-2026', 'MM-DD-YYYY'), 'travel', 'CAD');
INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (5, 250.00, TO_DATE('07-05-2026', 'MM-DD-YYYY'), 'investment', 'CAD');
INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (1, 'McDonalds', 'Food');
INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (2, 'UBC Bookstore', 'Textbook');
INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (3, 'Westbrook Properties', 'Apartment');
INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (4, 'Air Canada', 'Flight');
INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (5, 'Wealthsimple', 'ETF');
INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (1, 'UBC Payroll', 1);
INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (2, 'Scholarship Office', 0);
INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (3, 'Freelance Client', 0);
INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (4, 'Investment Dividend', 0);
INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (5, 'Tax Refund', 0);
INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-26-2026', 'MM-DD-YYYY'), 1, 5);
INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-27-2026', 'MM-DD-YYYY'), 2, 12);
INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-28-2026', 'MM-DD-YYYY'), 3, 3);
INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-29-2026', 'MM-DD-YYYY'), 4, 18);
INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-30-2026', 'MM-DD-YYYY'), 5, 1);
INSERT INTO Contains_Plant (garden_id, common_name) VALUES (1, 'Tomato');
INSERT INTO Contains_Plant (garden_id, common_name) VALUES (2, 'Sunflower');
INSERT INTO Contains_Plant (garden_id, common_name) VALUES (3, 'Oak Tree');
INSERT INTO Contains_Plant (garden_id, common_name) VALUES (4, 'Lavender');
INSERT INTO Contains_Plant (garden_id, common_name) VALUES (5, 'Money Tree');
INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (1, 1);
INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (2, 2);
INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (3, 3);
INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (4, 4);
INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (5, 5);
INSERT INTO Follows (follower_id, followee_id) VALUES (1, 2);
INSERT INTO Follows (follower_id, followee_id) VALUES (2, 3);
INSERT INTO Follows (follower_id, followee_id) VALUES (3, 4);
INSERT INTO Follows (follower_id, followee_id) VALUES (4, 5);
INSERT INTO Follows (follower_id, followee_id) VALUES (5, 1);
