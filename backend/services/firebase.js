// backend/services/firebase.js
// Simulating Firebase Realtime Database
const simulation = require('../engine/simulation');

class FirebaseMock {
    constructor() {
        console.log('[Firebase] Initializing connection to Realtime Database...');
    }

    async getRealtimeCrowdData() {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('[Firebase] Fetched real-time crowd data.');
        return simulation.getZones();
    }
}

module.exports = new FirebaseMock();
