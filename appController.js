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
    const tableContent = await appService.fetchGardenersFromDb();
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