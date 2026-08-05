const express = require('express');
const appService = require('./appService');

const router = express.Router();

router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/gardeners', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT gardener_id, display_name, email, join_date, timezone FROM Gardener');
    res.json({data: tableContent});
});

router.get('/seasons', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT name, start_date, end_date, theme_rule FROM Season');
    res.json({data: tableContent});
});

router.get('/gardens', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT garden_id, theme, created_on, soil_quality, gardener_id, season_name FROM Garden');
    res.json({data: tableContent});
});

router.get('/spending_categories', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT category_name, icon, is_essential, garden_id FROM SpendingCategory');
    res.json({data: tableContent});
});

router.get('/plant_species', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT common_name, rarity, days_to_mature, drought_tolerance, category_name FROM PlantSpecies');
    res.json({data: tableContent});
});

router.get('/budget_plans', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT plan_id, effective_date, daily_cap, generated_by_rule, category_name FROM SpendingCategory');
    res.json({data: tableContent});
});

router.get('/lessons', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT lesson_id, title, topic, difficulty, est_minutes FROM Lesson');
    res.json({data: tableContent});
});

router.get('/currencies', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT currency_code, exchange_rate FROM Currency');
    res.json({data: tableContent});
});

router.get('/transactions', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT transaction_id, amount, transaction_date, category_name, currency_code FROM Transaction');
    res.json({data: tableContent});
});

router.get('/expenses', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT transaction_id, merchant_name, asset FROM Expense');
    res.json({data: tableContent});
});

router.get('/incomes', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT transaction_id, source_name, primary FROM Income');
    res.json({data: tableContent});
});

router.get('/daily_summaries', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT log_date, gardener_id, streak_count FROM DailySummary');
    res.json({data: tableContent});
});

router.get('/contains_plant', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT garden_id, common_name FROM Contains_Plant');
    res.json({data: tableContent});
});

router.get('/completes_lesson', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT gardener_id, lesson_id FROM Completes_Lesson');
    res.json({data: tableContent});
});

router.get('/follows', async (req, res) => {
    const tableContent = await appService.fetchFromDb('SELECT follower_id, followee_id FROM Follows');
    res.json({data: tableContent});
});

router.post("/initiate-db", async (req, res) => {
    const initiateResult = await appService.initiateGreenhouseDB();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert", async (req, res) => {
    // TODO
});

module.exports = router;