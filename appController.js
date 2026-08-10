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
    const table = await appService.fetchFromDb('gardeners');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/seasons', async (req, res) => {
    const table = await appService.fetchFromDb('seasons');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/gardens', async (req, res) => {
    const table = await appService.fetchFromDb('gardens');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/spending_categories', async (req, res) => {
    const table = await appService.fetchFromDb('spending_categories');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/plant_species', async (req, res) => {
    const table = await appService.fetchFromDb('plant_species');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/budget_plans', async (req, res) => {
    const table = await appService.fetchFromDb('budget_plans');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/lessons', async (req, res) => {
    const table = await appService.fetchFromDb('lessons');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/currencies', async (req, res) => {
    const table = await appService.fetchFromDb('currencies');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/transactions', async (req, res) => {
    const table = await appService.fetchFromDb('transactions');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/expenses', async (req, res) => {
    const table = await appService.fetchFromDb('expenses');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/incomes', async (req, res) => {
    const table = await appService.fetchFromDb('incomes');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/daily_summaries', async (req, res) => {
    const table = await appService.fetchFromDb('daily_summaries');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/contains_plant', async (req, res) => {
    const table = await appService.fetchFromDb('contains_plant');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/completes_lesson', async (req, res) => {
    const table = await appService.fetchFromDb('completes_lesson');
    res.json({data: table.rows, columns: table.columns});
});

router.get('/follows', async (req, res) => {
    const table = await appService.fetchFromDb('follows');
    res.json({data: table.rows, columns: table.columns});
});

router.post("/initiate-db", async (req, res) => {
    const initiateResult = await appService.initiateGreenhouseDB();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

module.exports = router;
