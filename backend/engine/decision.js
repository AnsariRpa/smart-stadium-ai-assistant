// backend/engine/decision.js

class DecisionEngine {
    constructor() {
        console.log('[Decision Engine] Initialized rule-based logic logic.');
    }

    /**
     * Determines the best destination and route based on parameters.
     * @param {string} intent - user intent derived initially (or default)
     * @param {object} crowdData - real-time zones from Firebase
     * @param {object} userSession - Context Builder session
     */
    decideRoute(intent, crowdData, userSession) {
        console.log(`[Decision Engine] Calculating route strategy: ${userSession.preferences.routeStrategy} for intent: ${intent}`);
        
        let possibleDestinations = [];

        // Identify possible destinations based on intent
        if (intent === 'food') {
            possibleDestinations = ['Food Stall 1', 'Food Stall 2'];
        } else if (intent === 'parking') {
            possibleDestinations = ['Parking'];
        } else if (intent === 'exit') {
            possibleDestinations = ['North Gate', 'South Gate', 'East Gate', 'West Gate'];
        } else {
            // default wayfinding/general
            possibleDestinations = ['Fan Booth'];
        }

        // Apply strategy: shortest vs least crowded
        let selectedDest = '';
        let direction = '';
        let justification = '';
        let minimumCrowd = 101;

        if (userSession.preferences.routeStrategy === 'least_crowded') {
            // Find destination with absolute lowest crowd
            possibleDestinations.forEach(dest => {
                if (crowdData[dest] && crowdData[dest].crowdLevel < minimumCrowd) {
                    minimumCrowd = crowdData[dest].crowdLevel;
                    selectedDest = dest;
                }
            });
            justification = `Recommended because it is the least congested option currently available.`;
            direction = this._getDirectionForZone(selectedDest);
        } else {
            // Shortest route (simulated spatial proximity: North/South closer to center, East/West closer to edges)
            // Just picking the first one in the list for simplicity, but checking if crowded
            selectedDest = possibleDestinations[0];
            let currentCrowd = crowdData[selectedDest] ? crowdData[selectedDest].crowdLevel : 0;
            
            // Conflict handling: If shortest is extremely congested (>85%), fallback to least crowded if available
            if (currentCrowd > 85 && possibleDestinations.length > 1) {
                console.log('[Decision Engine] Conflict detected: Shortest route is too crowded. Triggering fallback to least crowded.');
                let altDest = null;
                possibleDestinations.forEach(dest => {
                    if (crowdData[dest] && crowdData[dest].crowdLevel < (altDest ? crowdData[altDest].crowdLevel : currentCrowd)) {
                        altDest = dest;
                    }
                });
                if (altDest && altDest !== selectedDest) {
                    selectedDest = altDest;
                    currentCrowd = crowdData[selectedDest].crowdLevel;
                    justification = `Your usual shortest route is extremely congested right now. Rerouted to a clearer path.`;
                } else {
                    justification = `This is the shortest route, though be advised it is currently highly congested.`;
                }
            } else {
                justification = `Selected based on your preference for the fastest route.`;
            }
            direction = this._getDirectionForZone(selectedDest);
            minimumCrowd = currentCrowd;
        }

        return {
            destination: selectedDest,
            direction: direction,
            crowdLevel: minimumCrowd,
            justification: justification
        };
    }

    _getDirectionForZone(zone) {
        if (zone.includes('North')) return 'North Path';
        if (zone.includes('South')) return 'South Path';
        if (zone.includes('East')) return 'East Path';
        if (zone.includes('West')) return 'West Path';
        if (zone === 'Food Stall 1') return 'North-East Walkway';
        if (zone === 'Food Stall 2') return 'South-West Walkway';
        if (zone === 'Fan Booth') return 'Central Promenade';
        if (zone === 'Parking' || zone === 'Transport') return 'Outer Ring Road';
        return 'Main Corridors';
    }
}

module.exports = new DecisionEngine();
