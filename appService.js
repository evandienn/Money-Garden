const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10);
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);

async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchFromDb(table) {
    return await withOracleDB(async (connection) => {
        let command = '';
        switch(table) {
            case 'gardeners':
                command = 'SELECT gardener_id, display_name, email, join_date, timezone FROM Gardener';
                break;
            case 'seasons':
                command = 'SELECT name, start_date, end_date, theme_rule FROM Season';
                break;
            case 'gardens':
                command = 'SELECT garden_id, theme, created_on, soil_quality, gardener_id, season_name FROM Garden';
                break;
            case 'spending_categories':
                command = 'SELECT category_name, icon, is_essential, garden_id FROM SpendingCategory';
                break;
            case 'plant_species':
                command = 'SELECT common_name, rarity, days_to_mature, drought_tolerance, category_name FROM PlantSpecies';
                break;
            case 'budget_plans':
                command = 'SELECT plan_id, effective_date, daily_cap, generated_by_rule, category_name FROM BudgetPlan';
                break;
            case 'lessons':
                command = 'SELECT lesson_id, title, topic, difficulty, est_minutes FROM Lesson';
                break;
            case 'currencies':
                command = 'SELECT currency_code, exchange_rate FROM Currency';
                break;
            case 'transactions':
                command = 'SELECT transaction_id, amount, transaction_date, category_name, currency_code FROM Transaction';
                break;
            case 'expenses':
                command = 'SELECT transaction_id, merchant_name, asset FROM Expense';
                break;
            case 'incomes':
                command = 'SELECT transaction_id, source_name, is_primary FROM Income';
                break;
            case 'daily_summaries':
                command = 'SELECT log_date, gardener_id, streak_count FROM DailySummary';
                break;
            case 'contains_plant':
                command = 'SELECT garden_id, common_name FROM Contains_Plant';
                break;
            case 'completes_lesson':
                command = 'SELECT gardener_id, lesson_id FROM Completes_Lesson';
                break;
            case 'follows':
                command = 'SELECT follower_id, followee_id FROM Follows';
                break;
            default:
                break;
        }
        const result = await connection.execute(command);
        return {
            rows: result.rows,
            columns: result.metaData.map(col => col.name)
        };
    }).catch((err) => {
        console.error(`Error executing: ${command}\n`, err.message);
        return { rows: [], columns: [] };
    });
}

async function initiateGreenhouseDB() {
    return await withOracleDB(async (connection) => {
        const statements = [
            `DROP TABLE Follows CASCADE CONSTRAINTS`,
            `DROP TABLE Completes_Lesson CASCADE CONSTRAINTS`,
            `DROP TABLE Contains_Plant CASCADE CONSTRAINTS`,
            `DROP TABLE DailySummary CASCADE CONSTRAINTS`,
            `DROP TABLE Income CASCADE CONSTRAINTS`,
            `DROP TABLE Expense CASCADE CONSTRAINTS`,
            `DROP TABLE Transaction CASCADE CONSTRAINTS`,
            `DROP TABLE Currency CASCADE CONSTRAINTS`,
            `DROP TABLE Lesson CASCADE CONSTRAINTS`,
            `DROP TABLE BudgetPlan CASCADE CONSTRAINTS`,
            `DROP TABLE PlantSpecies CASCADE CONSTRAINTS`,
            `DROP TABLE SpendingCategory CASCADE CONSTRAINTS`,
            `DROP TABLE Garden CASCADE CONSTRAINTS`,
            `DROP TABLE Season CASCADE CONSTRAINTS`,
            `DROP TABLE Gardener CASCADE CONSTRAINTS`,

            `CREATE TABLE Gardener (
                gardener_id NUMBER,
                display_name VARCHAR2 (50),
                email VARCHAR2 (100) NOT NULL UNIQUE,
                join_date DATE,
                timezone VARCHAR2 (50),
                PRIMARY KEY (gardener_id)
            )`,
            `CREATE TABLE Season (
                name VARCHAR2(50),
                start_date DATE,
                end_date DATE,
                theme_rule VARCHAR2(100),
                PRIMARY KEY (name)
            )`,
            `CREATE TABLE Garden (
                garden_id NUMBER,
                theme VARCHAR2(50),
                created_on DATE,
                soil_quality VARCHAR2(20),
                gardener_id NUMBER,
                season_name VARCHAR2(50),
                PRIMARY KEY (garden_id),
                FOREIGN KEY (gardener_id) REFERENCES Gardener (gardener_id),
                FOREIGN KEY (season_name) REFERENCES Season (name)
            )`,
            `CREATE TABLE SpendingCategory (
                category_name VARCHAR2(50),
                icon VARCHAR2(20),
                is_essential NUMBER(1),
                garden_id NUMBER,
                PRIMARY KEY (category_name),
                FOREIGN KEY (garden_id) REFERENCES Garden (garden_id)
            )`,
            `CREATE TABLE PlantSpecies (
                common_name VARCHAR2(50),
                rarity VARCHAR2(20),
                days_to_mature NUMBER,
                drought_tolerance VARCHAR2(20),
                category_name VARCHAR2 (50),
                PRIMARY KEY (common_name),
                UNIQUE (category_name),
                FOREIGN KEY (category_name) REFERENCES SpendingCategory (category_name)
            )`,
            `CREATE TABLE BudgetPlan (
                plan_id NUMBER,
                effective_date DATE,
                daily_cap NUMBER (10,2),
                generated_by_rule VARCHAR2(100),
                category_name VARCHAR2 (50),
                PRIMARY KEY (plan_id),
                FOREIGN KEY (category_name) REFERENCES SpendingCategory (category_name)
            )`,
            `CREATE TABLE Lesson (
                lesson_id NUMBER,
                title VARCHAR2(100),
                topic VARCHAR2(50),
                difficulty VARCHAR2(20),
                est_minutes NUMBER,
                PRIMARY KEY (lesson_id)
            )`,
            `CREATE TABLE Currency (
                currency_code CHAR(3),
                exchange_rate NUMBER,
                PRIMARY KEY (currency_code)
            )`,
            `CREATE TABLE Transaction (
                transaction_id NUMBER,
                amount NUMBER(10,2),
                transaction_date DATE,
                category_name VARCHAR2(50),
                currency_code CHAR(3),
                PRIMARY KEY (transaction_id),
                FOREIGN KEY (category_name) REFERENCES SpendingCategory (category_name),
                FOREIGN KEY (currency_code) REFERENCES Currency (currency_code)
            )`,
            `CREATE TABLE Expense (
                transaction_id NUMBER,
                merchant_name VARCHAR2(100),
                asset VARCHAR2 (50),
                PRIMARY KEY (transaction_id),
                FOREIGN KEY (transaction_id) REFERENCES Transaction (transaction_id) ON DELETE CASCADE
            )`,
            `CREATE TABLE Income (
                transaction_id NUMBER,
                source_name VARCHAR2(100),
                is_primary NUMBER(1),
                PRIMARY KEY (transaction_id),
                FOREIGN KEY (transaction_id) REFERENCES Transaction (transaction_id) ON DELETE CASCADE
            )`,
            `CREATE TABLE DailySummary (
                log_date DATE,
                gardener_id NUMBER,
                streak_count NUMBER,
                PRIMARY KEY (log_date, gardener_id),
                FOREIGN KEY (gardener_id) REFERENCES Gardener (gardener_id) ON DELETE CASCADE
            )`,
            `CREATE TABLE Contains_Plant (
                garden_id NUMBER,
                common_name VARCHAR2 (50),
                PRIMARY KEY (garden_id, common_name),
                FOREIGN KEY (garden_id) REFERENCES Garden (garden_id),
                FOREIGN KEY (common_name) REFERENCES PlantSpecies (common_name)
            )`,
            `CREATE TABLE Completes_Lesson (
                gardener_id NUMBER,
                lesson_id NUMBER,
                PRIMARY KEY (gardener_id, lesson_id),
                FOREIGN KEY (gardener_id) REFERENCES Gardener (gardener_id),
                FOREIGN KEY (lesson_id) REFERENCES Lesson (lesson_id)
            )`,
            `CREATE TABLE Follows (
                follower_id NUMBER,
                followee_id NUMBER,
                PRIMARY KEY (follower_id, followee_id),
                FOREIGN KEY (follower_id) REFERENCES Gardener (gardener_id),
                FOREIGN KEY (followee_id) REFERENCES Gardener (gardener_id)
            )`,

            // Initial Data
            `INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (1, 'temp1', 'temp1@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'EST')`,
            `INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (2, 'temp2', 'temp2@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'PST')`,
            `INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (3, 'temp3', 'temp3@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'PST')`,
            `INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (4, 'temp4', 'temp4@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'CST')`,
            `INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (5, 'temp5', 'temp5@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'EST')`,
            `INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('fall', TO_DATE('09-20-2025', 'MM-DD-YYYY'), TO_DATE('12-19-2025', 'MM-DD-YYYY'), 'need to maintain healthy plants for winter')`,
            `INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('winter', TO_DATE('12-20-2025', 'MM-DD-YYYY'), TO_DATE('03-19-2026', 'MM-DD-YYYY'), 'garden moved to greenhouse')`,
            `INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('spring', TO_DATE('03-20-2026', 'MM-DD-YYYY'), TO_DATE('06-19-2026', 'MM-DD-YYYY'), 'plants get a boost for money saved')`,
            `INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('summer', TO_DATE('06-20-2026', 'MM-DD-YYYY'), TO_DATE('09-19-2026', 'MM-DD-YYYY'), 'plants need safety from the sun')`,
            `INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('fall_2', TO_DATE('09-20-2025', 'MM-DD-YYYY'), TO_DATE('12-19-2025', 'MM-DD-YYYY'), 'plant boost depending on species')`,
            `INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (1, 'tropical', TO_DATE('01-01-2026', 'MM-DD-YYYY'), 'healthy', 1, 'fall')`,
            `INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (2, 'arid', TO_DATE('01-02-2026', 'MM-DD-YYYY'), 'poor', 2, 'summer')`,
            `INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (3, 'plains', TO_DATE('01-03-2026', 'MM-DD-YYYY'), 'moderate', 3, 'winter')`,
            `INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (4, 'classic', TO_DATE('01-04-2026', 'MM-DD-YYYY'), 'healthy', 4, 'spring')`,
            `INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (5, 'hellscape', TO_DATE('01-05-2026', 'MM-DD-YYYY'), 'healthy', 5, 'spring')`,
            `INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('eating out', 'burger', 0, 1)`,
            `INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('school', 'book', 1, 1)`,
            `INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('rent', 'house', 1, 1)`,
            `INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('travel', 'plane', 0, 2)`,
            `INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('investment', 'chart', 0, 2)`,
            `INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Tomato', 'Common', 85, 'Medium', 'eating out')`,
            `INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Sunflower', 'Common', 75, 'High', 'school')`,
            `INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Oak Tree', 'Uncommon', 3650, 'Medium', 'rent')`,
            `INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Lavender', 'Rare', 120, 'High', 'travel')`,
            `INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Money Tree', 'Common', 730, 'Low', 'investment')`,
            `INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (1, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 25.00, 'Default budget', 'eating out')`,
            `INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (2, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 15.00, 'Student budget', 'school')`,
            `INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (3, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 60.00, 'Monthly rent allocation', 'rent')`,
            `INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (4, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 20.00, 'Vacation savings', 'travel')`,
            `INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (5, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 30.00, 'Invest 20% of income', 'investment')`,
            `INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (1, 'Budgeting Basics', 'Budgeting', 'Easy', 15)`,
            `INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (2, 'Saving Money', 'Saving', 'Easy', 20)`,
            `INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (3, 'Understanding Credit', 'Credit', 'Medium', 25)`,
            `INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (4, 'Investing 101', 'Investing', 'Medium', 30)`,
            `INSERT INTO Lesson(lesson_id, title, topic, difficulty, est_minutes) VALUES (5, 'Retirement Planning', 'Investing', 'Hard', 45)`,
            `INSERT INTO Currency (currency_code, exchange_rate) VALUES ('CAD', 1.00)`,
            `INSERT INTO Currency (currency_code, exchange_rate) VALUES ('USD', 1.35)`,
            `INSERT INTO Currency (currency_code, exchange_rate) VALUES ('EUR', 1.45)`,
            `INSERT INTO Currency (currency_code, exchange_rate) VALUES ('GBP', 1.70)`,
            `INSERT INTO Currency (currency_code, exchange_rate) VALUES ('JPY', 0.0091)`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (1, 18.50, TO_DATE('07-01-2026', 'MM-DD-YYYY'), 'eating out', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (2, 120.00, TO_DATE('07-02-2026', 'MM-DD-YYYY'), 'school', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (3, 1450.00, TO_DATE('07-03-2026', 'MM-DD-YYYY'), 'rent', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (4, 75.25, TO_DATE('07-04-2026', 'MM-DD-YYYY'), 'travel', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (5, 250.00, TO_DATE('07-05-2026', 'MM-DD-YYYY'), 'investment', 'CAD')`,

            // Expanded Data for Aggregations, GROUP BY, HAVING, and Division
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (6, 25.00, TO_DATE('07-06-2026', 'MM-DD-YYYY'), 'eating out', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (7, 12.50, TO_DATE('07-07-2026', 'MM-DD-YYYY'), 'eating out', 'USD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (8, 45.00, TO_DATE('07-08-2026', 'MM-DD-YYYY'), 'eating out', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (9, 200.00, TO_DATE('07-06-2026', 'MM-DD-YYYY'), 'school', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (10, 50.00, TO_DATE('07-09-2026', 'MM-DD-YYYY'), 'school', 'USD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (11, 1450.00, TO_DATE('08-03-2026', 'MM-DD-YYYY'), 'rent', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (12, 1450.00, TO_DATE('09-03-2026', 'MM-DD-YYYY'), 'rent', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (13, 300.00, TO_DATE('07-10-2026', 'MM-DD-YYYY'), 'travel', 'EUR')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (14, 15.00, TO_DATE('07-11-2026', 'MM-DD-YYYY'), 'travel', 'GBP')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (15, 80.00, TO_DATE('07-12-2026', 'MM-DD-YYYY'), 'travel', 'JPY')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (16, 500.00, TO_DATE('07-15-2026', 'MM-DD-YYYY'), 'investment', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (17, 150.00, TO_DATE('07-16-2026', 'MM-DD-YYYY'), 'investment', 'USD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (18, 50.00, TO_DATE('07-17-2026', 'MM-DD-YYYY'), 'eating out', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (19, 100.00, TO_DATE('07-18-2026', 'MM-DD-YYYY'), 'school', 'CAD')`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (20, 20.00, TO_DATE('07-19-2026', 'MM-DD-YYYY'), 'eating out', 'CAD')`,

            `INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (1, 'McDonalds', 'Food')`,
            `INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (2, 'UBC Bookstore', 'Textbook')`,
            `INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (3, 'Westbrook Properties', 'Apartment')`,
            `INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (4, 'Air Canada', 'Flight')`,
            `INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (5, 'Wealthsimple', 'ETF')`,
            `INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (6, 'UBC Payroll', 1)`,
            `INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (9, 'Scholarship Office', 0)`,
            `INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (10, 'Freelance Client', 0)`,
            `INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (16, 'Investment Dividend', 0)`,
            `INSERT INTO Income (transaction_id, source_name, is_primary) VALUES (17, 'Tax Refund', 0)`,

            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-26-2026', 'MM-DD-YYYY'), 1, 5)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-27-2026', 'MM-DD-YYYY'), 2, 12)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-28-2026', 'MM-DD-YYYY'), 3, 3)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-29-2026', 'MM-DD-YYYY'), 4, 18)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-30-2026', 'MM-DD-YYYY'), 5, 1)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-27-2026', 'MM-DD-YYYY'), 1, 6)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-28-2026', 'MM-DD-YYYY'), 1, 7)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-28-2026', 'MM-DD-YYYY'), 2, 13)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-29-2026', 'MM-DD-YYYY'), 2, 14)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-29-2026', 'MM-DD-YYYY'), 3, 4)`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-30-2026', 'MM-DD-YYYY'), 4, 19)`,

            `INSERT INTO Contains_Plant (garden_id, common_name) VALUES (1, 'Tomato')`,
            `INSERT INTO Contains_Plant (garden_id, common_name) VALUES (2, 'Sunflower')`,
            `INSERT INTO Contains_Plant (garden_id, common_name) VALUES (3, 'Oak Tree')`,
            `INSERT INTO Contains_Plant (garden_id, common_name) VALUES (4, 'Lavender')`,
            `INSERT INTO Contains_Plant (garden_id, common_name) VALUES (5, 'Money Tree')`,

            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (1, 1)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (2, 2)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (3, 3)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (4, 4)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (5, 5)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (1, 2)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (1, 3)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (1, 4)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (1, 5)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (2, 1)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (2, 3)`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (3, 1)`,

            `INSERT INTO Follows (follower_id, followee_id) VALUES (1, 2)`,
            `INSERT INTO Follows (follower_id, followee_id) VALUES (2, 3)`,
            `INSERT INTO Follows (follower_id, followee_id) VALUES (3, 4)`,
            `INSERT INTO Follows (follower_id, followee_id) VALUES (4, 5)`,
            `INSERT INTO Follows (follower_id, followee_id) VALUES (5, 1)`
        ];

        for (const sql of statements) {
            try {
                await connection.execute(sql, [], { autoCommit: true });
            } catch (err) {
                // Silently ignore DROP errors if tables don't exist yet
                if (!sql.startsWith('DROP')) {
                    console.error(`Error executing: ${sql}\n`, err.message);
                }
            }
        }
        return true;
    }).catch((err) => {
        console.error("Failed to initialize database:", err);
        return false;
    });
}

// ----------------------------------------------------------
// MILESTONE 4 QUERY FUNCTIONS
// ----------------------------------------------------------

async function insertTransaction({ id, amount, date, category, currency }) {
    return await withOracleDB(async (connection) => {
        await connection.execute(
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code)
             VALUES (:id, :amount, TO_DATE(:tx_date, 'YYYY-MM-DD'), :category, :currency)`,
            { id, amount, tx_date: date, category, currency },
            { autoCommit: true }
        );
        return true;
    }).catch((err) => {
        console.error('Error inserting transaction:', err.message);
        return false;
    });
}

async function updateBudgetPlan({ plan_id, new_cap, new_rule }) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE BudgetPlan SET daily_cap = :new_cap, generated_by_rule = :new_rule WHERE plan_id = :plan_id`,
            { plan_id, new_cap, new_rule },
            { autoCommit: true }
        );
        return result.rowsAffected > 0;
    }).catch((err) => {
        console.error('Error updating budget plan:', err.message);
        return false;
    });
}

async function deleteTransaction({ transaction_id }) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Transaction WHERE transaction_id = :transaction_id`,
            { transaction_id },
            { autoCommit: true }
        );
        return result.rowsAffected > 0;
    }).catch((err) => {
        console.error('Error deleting transaction:', err.message);
        return false;
    });
}

const PLANT_SEARCHABLE_FIELDS = {
    common_name: 'STRING',
    rarity: 'STRING',
    days_to_mature: 'NUMBER',
    drought_tolerance: 'STRING',
    category_name: 'STRING'
};
const ALLOWED_OPERATORS = ['=', '!=', '<', '>', '<=', '>='];
const ALLOWED_CONNECTORS = ['AND', 'OR'];

async function searchPlantSpecies(conditions) {
    return await withOracleDB(async (connection) => {
        // If the user clicks search without conditions, return all plants
        if (!Array.isArray(conditions) || conditions.length === 0) {
            const result = await connection.execute(`SELECT common_name, rarity, days_to_mature, drought_tolerance, category_name FROM PlantSpecies`);
            return { rows: result.rows, columns: result.metaData.map(c => c.name) };
        }

        let whereParts = [];
        let binds = {};

        conditions.forEach((cond, i) => {
            const { field, operator, value, connector } = cond;
            
            // Security check against SQL injection
            if (!PLANT_SEARCHABLE_FIELDS[field]) throw new Error(`Invalid field: ${field}`);
            if (!ALLOWED_OPERATORS.includes(operator)) throw new Error(`Invalid operator: ${operator}`);
            if (i > 0 && !ALLOWED_CONNECTORS.includes(connector)) throw new Error(`Invalid connector: ${connector}`);

            // Bind values dynamically based on their type
            const bindName = `v${i}`;
            binds[bindName] = PLANT_SEARCHABLE_FIELDS[field] === 'NUMBER' ? Number(value) : value;

            // Assemble the SQL string (e.g., "AND days_to_mature <= :v1")
            whereParts.push(`${i > 0 ? ` ${connector} ` : ''}${field} ${operator} :${bindName}`);
        });

        const sql = `SELECT common_name, rarity, days_to_mature, drought_tolerance, category_name 
                     FROM PlantSpecies 
                     WHERE ${whereParts.join('')}`;
                     
        const result = await connection.execute(sql, binds);
        return { rows: result.rows, columns: result.metaData.map(c => c.name) };
        
    }).catch((err) => {
        console.error('Error searching plant species:', err.message);
        return { rows: [], columns: [] };
    });
}

const GARDENER_COLUMNS = ['gardener_id', 'display_name', 'email', 'join_date', 'timezone'];

async function projectGardener(columns) {
    const safeColumns = (columns || []).filter(c => GARDENER_COLUMNS.includes(c));
    if (safeColumns.length === 0) {
        return { rows: [], columns: [] };
    }
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT ${safeColumns.join(', ')} FROM Gardener`);
        return { rows: result.rows, columns: result.metaData.map(c => c.name) };
    }).catch((err) => {
        console.error('Error projecting gardener columns:', err.message);
        return { rows: [], columns: [] };
    });
}

async function joinSeason(season_name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT g.display_name AS gardener_name, gd.theme AS garden_theme, s.theme_rule AS season_rule
             FROM Gardener g
             JOIN Garden gd ON g.gardener_id = gd.gardener_id
             JOIN Season s ON gd.season_name = s.name
             WHERE s.name = :season_name`,
            { season_name }
        );
        return { rows: result.rows, columns: result.metaData.map(c => c.name) };
    }).catch((err) => {
        console.error('Error joining gardeners by season:', err.message);
        return { rows: [], columns: [] };
    });
}

async function aggTotalSpent() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT category_name, SUM(amount) AS total_spent FROM Transaction GROUP BY category_name`
        );
        return { rows: result.rows, columns: result.metaData.map(c => c.name) };
    }).catch((err) => {
        console.error('Error computing total spent by category:', err.message);
        return { rows: [], columns: [] };
    });
}

async function aggHaving(min_count) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT category_name, COUNT(*) AS transaction_count
             FROM Transaction
             GROUP BY category_name
             HAVING COUNT(*) >= :min_count`,
            { min_count }
        );
        return { rows: result.rows, columns: result.metaData.map(c => c.name) };
    }).catch((err) => {
        console.error('Error computing categories by transaction count:', err.message);
        return { rows: [], columns: [] };
    });
}

async function aggNested() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT category_name, AVG(amount) AS avg_amount
             FROM Transaction
             GROUP BY category_name
             HAVING AVG(amount) = (
                 SELECT MAX(avg_amt) FROM (
                     SELECT AVG(amount) AS avg_amt 
                     FROM Transaction 
                     GROUP BY category_name
                 )
             )`
        );
        return { rows: result.rows, columns: result.metaData.map(c => c.name) };
    }).catch((err) => {
        console.error('Error computing highest average spending category:', err.message);
        return { rows: [], columns: [] };
    });
}

async function divisionDiligent() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT g.display_name AS diligent_gardener
             FROM Gardener g
             WHERE NOT EXISTS (
                 SELECT l.lesson_id FROM Lesson l
                 WHERE NOT EXISTS (
                     SELECT 1 FROM Completes_Lesson cl
                     WHERE cl.gardener_id = g.gardener_id AND cl.lesson_id = l.lesson_id
                 )
             )`
        );
        return { rows: result.rows, columns: result.metaData.map(c => c.name) };
    }).catch((err) => {
        console.error('Error finding diligent gardeners:', err.message);
        return { rows: [], columns: [] };
    });
}

module.exports = {
    testOracleConnection,
    fetchFromDb,
    initiateGreenhouseDB,
    insertTransaction,
    updateBudgetPlan,
    deleteTransaction,
    searchPlantSpecies,
    projectGardener,
    joinSeason,
    aggTotalSpent,
    aggHaving,
    aggNested,
    divisionDiligent
};