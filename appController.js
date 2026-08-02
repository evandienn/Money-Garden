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

router.post("/initiate-db", async (req, res) => {
    const initiateResult = await appService.initiateGreenhouseDB();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

module.exports = router;