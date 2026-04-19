// backend/server.js
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

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', apiRoutes);

// Start Simulation Engine
simulationEngine.startSimulation(2000); // 2 sec updates

// PORT (Cloud Run compatible)
const PORT = process.env.PORT || 3000;

// Start Server (ONLY ONCE)
app.listen(PORT, () => {
    console.log(`[Server] Smart Stadium AI Assistant running on port ${PORT}`);
});