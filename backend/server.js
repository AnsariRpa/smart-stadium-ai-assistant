// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const simulationEngine = require('./engine/simulation');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', apiRoutes);

// Start Simulation Engine
simulationEngine.startSimulation(2000); // 2 second updates for UI demo feel

// Start Server
app.listen(PORT, () => {
    console.log(`[Server] Smart Stadium AI Assistant running on port ${PORT}`);
});
