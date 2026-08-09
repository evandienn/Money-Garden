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
    const tableContent = await appService.fetchFromDb('gardeners');
    res.json({data: tableContent});
});

router.get('/seasons', async (req, res) => {
    const tableContent = await appService.fetchFromDb('seasons');
    res.json({data: tableContent});
});

router.get('/gardens', async (req, res) => {
    const tableContent = await appService.fetchFromDb('gardens');
    res.json({data: tableContent});
});

router.get('/spending_categories', async (req, res) => {
    const tableContent = await appService.fetchFromDb('spending_categories');
    res.json({data: tableContent});
});

router.get('/plant_species', async (req, res) => {
    const tableContent = await appService.fetchFromDb('plant_species');
    res.json({data: tableContent});
});

router.get('/budget_plans', async (req, res) => {
    const tableContent = await appService.fetchFromDb('budget_plans');
    res.json({data: tableContent});
});

router.get('/lessons', async (req, res) => {
    const tableContent = await appService.fetchFromDb('lessons');
    res.json({data: tableContent});
});

router.get('/currencies', async (req, res) => {
    const tableContent = await appService.fetchFromDb('currencies');
    res.json({data: tableContent});
});

router.get('/transactions', async (req, res) => {
    const tableContent = await appService.fetchFromDb('transactions');
    res.json({data: tableContent});
});

router.get('/expenses', async (req, res) => {
    const tableContent = await appService.fetchFromDb('expenses');
    res.json({data: tableContent});
});

router.get('/incomes', async (req, res) => {
    const tableContent = await appService.fetchFromDb('incomes');
    res.json({data: tableContent});
});

router.get('/daily_summaries', async (req, res) => {
    const tableContent = await appService.fetchFromDb('daily_summaries');
    res.json({data: tableContent});
});

router.get('/contains_plant', async (req, res) => {
    const tableContent = await appService.fetchFromDb('contains_plant');
    res.json({data: tableContent});
});

router.get('/completes_lesson', async (req, res) => {
    const tableContent = await appService.fetchFromDb('completes_lesson');
    res.json({data: tableContent});
});

router.get('/follows', async (req, res) => {
    const tableContent = await appService.fetchFromDb('follows');
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