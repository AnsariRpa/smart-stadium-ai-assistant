// tests/decision.test.js
const decisionEngine = require('../backend/engine/decision');
const orchestrator = require('../backend/services/orchestrator');

const mockSession = {
    preferences: { routeStrategy: 'shortest' }
};

describe('Decision Engine Route Strategy', () => {

    test('Shortest route strategy with no congestion', () => {
        const crowdData = {
            'North Gate': { crowdLevel: 10 },
            'South Gate': { crowdLevel: 20 },
            'East Gate': { crowdLevel: 5 },
            'West Gate': { crowdLevel: 10 }
        };
        const result = decisionEngine.decideRoute('exit', crowdData, mockSession);
        // Default shortest should pick North Gate first
        expect(result.destination).toBe('North Gate');
        expect(result.crowdLevel).toBe(10);
    });

    test('Shortest route fallback to least crowded during massive spike (Route Conflict)', () => {
        const crowdData = {
            'North Gate': { crowdLevel: 95 }, // highly congested
            'South Gate': { crowdLevel: 90 },
            'East Gate': { crowdLevel: 15 },  // very clear
            'West Gate': { crowdLevel: 98 }
        };
        const result = decisionEngine.decideRoute('exit', crowdData, mockSession);
        // Should reroute to East Gate because 95 > 85 threshold
        expect(result.destination).toBe('East Gate');
        expect(result.justification).toContain("extremely congested right now");
    });

    test('Empty stadium scenario (0% crowd)', () => {
        const crowdData = {
            'North Gate': { crowdLevel: 0 },
            'South Gate': { crowdLevel: 0 },
            'East Gate': { crowdLevel: 0 },
            'West Gate': { crowdLevel: 0 }
        };
        const result = decisionEngine.decideRoute('exit', crowdData, mockSession);
        expect(result.destination).toBe('North Gate'); // Picks default shortest
        expect(result.crowdLevel).toBe(0);
    });
});

describe('Orchestrator Invalid Inputs', () => {
    test('Handles extreme undefined input gracefully', async () => {
        const result = await orchestrator.processUserQuery('testUser', 'sdjkfnaskldfnklasdn');
        // fallback intent should be wayfinding and point to Fan Booth usually, or whatever is the default
        expect(result).toHaveProperty('intent');
    });
});
