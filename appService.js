const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
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
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
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


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
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


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}



// ----------------------------------------------------------
// GREENHOUSE SPECIFIC FUNCTIONS
// ----------------------------------------------------------

async function fetchGardenersFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT gardener_id, display_name, email, join_date, timezone FROM Gardener');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchSeasonsFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT name, start_date, end_date, theme_rule FROM Season');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateGreenhouseDB() {
    return await withOracleDB(async (connection) => {
        const statements = [
            // 1. DROP EXISTING TABLES (Child tables first to avoid FK constraint errors)
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

            // 2. CREATE TABLES
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
                primary NUMBER(1),
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

            // 3. POPULATE DATA
            `INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (1, 'temp1', 'temp1@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'EST')`,
            `INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (2, 'temp2', 'temp2@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'PST')`,
            `INSERT INTO Gardener (gardener_id, display_name, email, join_date, timezone) VALUES (3, 'temp3', 'temp3@gmail.com', TO_DATE('07-30-2026', 'MM-DD-YYYY'), 'PST')`,
            `INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('fall', TO_DATE('09-20-2025', 'MM-DD-YYYY'), TO_DATE('12-19-2025', 'MM-DD-YYYY'), 'need to maintain healthy plants for winter')`,
            `INSERT INTO Season (name, start_date, end_date, theme_rule) VALUES ('winter', TO_DATE('12-20-2025', 'MM-DD-YYYY'), TO_DATE('03-19-2026', 'MM-DD-YYYY'), 'garden moved to greenhouse')`,
            `INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (1, 'tropical', TO_DATE('01-01-2026', 'MM-DD-YYYY'), 'healthy', 1, 'fall')`,
            `INSERT INTO Garden (garden_id, theme, created_on, soil_quality, gardener_id, season_name) VALUES (2, 'arid', TO_DATE('01-02-2026', 'MM-DD-YYYY'), 'poor', 2, 'winter')`,
            `INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('eating out', 'burger', 0, 1)`,
            `INSERT INTO SpendingCategory (category_name, icon, is_essential, garden_id) VALUES ('school', 'book', 1, 1)`,
            `INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Tomato', 'Common', 85, 'Medium', 'eating out')`,
            `INSERT INTO PlantSpecies (common_name, rarity, days_to_mature, drought_tolerance, category_name) VALUES ('Sunflower', 'Common', 75, 'High', 'school')`,
            `INSERT INTO BudgetPlan (plan_id, effective_date, daily_cap, generated_by_rule, category_name) VALUES (1, TO_DATE('01-01-2026', 'MM-DD-YYYY'), 25.00, 'Default budget', 'eating out')`,
            `INSERT INTO Lesson (lesson_id, title, topic, difficulty, est_minutes) VALUES (1, 'Budgeting Basics', 'Budgeting', 'Easy', 15)`,
            `INSERT INTO Currency (currency_code, exchange_rate) VALUES ('CAD', 1.00)`,
            `INSERT INTO Currency (currency_code, exchange_rate) VALUES ('USD', 1.35)`,
            `INSERT INTO Transaction (transaction_id, amount, transaction_date, category_name, currency_code) VALUES (1, 18.50, TO_DATE('07-01-2026', 'MM-DD-YYYY'), 'eating out', 'CAD')`,
            `INSERT INTO Expense (transaction_id, merchant_name, asset) VALUES (1, 'McDonalds', 'Food')`,
            `INSERT INTO DailySummary (log_date, gardener_id, streak_count) VALUES (TO_DATE('07-26-2026', 'MM-DD-YYYY'), 1, 5)`,
            `INSERT INTO Contains_Plant (garden_id, common_name) VALUES (1, 'Tomato')`,
            `INSERT INTO Completes_Lesson (gardener_id, lesson_id) VALUES (1, 1)`,
            `INSERT INTO Follows (follower_id, followee_id) VALUES (1, 2)`
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

module.exports = {
    testOracleConnection,
    fetchGardenersFromDb,
    fetchSeasonsFromDb,
    initiateGreenhouseDB
};