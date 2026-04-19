// backend/services/bigquery.js
// Simulating BigQuery for historical patterns

class BigQueryMock {
    constructor() {
        console.log('[BigQuery] Initialized connection for historical analytics.');
    }

    async getHistoricalPattern(zone, eventType) {
        // Simulate query latency
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`[BigQuery] Queried historical patterns for zone: ${zone}`);
        
        // Mock data logic based on event
        if (eventType === 'halftime') {
            return { averageCrowd: 88, peakTime: '15 mins into halftime' };
        } else if (eventType === 'exit_surge') {
            return { averageCrowd: 95, peakTime: 'immediately after match' };
        }
        return { averageCrowd: 30, peakTime: 'N/A' };
    }
}

module.exports = new BigQueryMock();
