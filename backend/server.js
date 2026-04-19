require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const simulationEngine = require('./engine/simulation');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', apiRoutes);

// Safe simulation start
try {
    simulationEngine.startSimulation(2000);
} catch (err) {
    console.error("[Simulation Error]", err);
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on port ${PORT}`);
});