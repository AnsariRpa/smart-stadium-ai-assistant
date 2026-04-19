// backend/routes/api.js
const express = require('express');
const router = express.express.Router ? express.express.Router() : express.Router();
const orchestrator = require('../services/orchestrator');
const contextBuilder = require('../engine/context');
const simulationEngine = require('../engine/simulation');

// Chat interaction endpoint
router.post('/chat', async (req, res) => {
    const { userId, query } = req.body;
    if (!userId || !query) {
        return res.status(400).json({ error: 'userId and query are required' });
    }
    const response = await orchestrator.processUserQuery(userId, query);
    res.json(response);
});

// Context update endpoint (e.g. changing strategy)
router.post('/context/preferences', (req, res) => {
    const { userId, strategy } = req.body;
    if (!['shortest', 'least_crowded'].includes(strategy)) {
        return res.status(400).json({ error: 'Invalid strategy. Use shortest or least_crowded.' });
    }
    contextBuilder.updatePreference(userId, 'routeStrategy', strategy);
    res.json({ success: true, strategy });
});

// Simulation status/control (for testing/frontend UI)
router.get('/simulation/status', (req, res) => {
    res.json(simulationEngine.getZones());
});

router.post('/simulation/event', (req, res) => {
    const { state } = req.body;
    simulationEngine.setEventState(state);
    res.json({ success: true, state });
});

module.exports = router;
