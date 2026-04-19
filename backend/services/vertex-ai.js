// backend/services/vertex-ai.js
// Simulating Vertex AI integration

class VertexAIMock {
    constructor() {
        console.log('[Vertex AI] Initialized for Intent Classification and Generation');
    }

    async classifyIntentAndReason(query, context, decisionData) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate AI latency
        console.log('[Vertex AI] Analyzing query and decision data...');

        const lowerQuery = query.toLowerCase();
        let intent = 'wayfinding';
        let priority = 'normal';

        if (lowerQuery.includes('emergency') || lowerQuery.includes('help') || lowerQuery.includes('fire')) {
            intent = 'emergency';
            priority = 'high';
        } else if (lowerQuery.includes('food') || lowerQuery.includes('eat') || lowerQuery.includes('hungry')) {
            intent = 'food';
        } else if (lowerQuery.includes('park') || lowerQuery.includes('car')) {
            intent = 'parking';
        } else if (lowerQuery.includes('exit') || lowerQuery.includes('leave')) {
            intent = 'exit';
        }

        // Generate response based on decision engine's selected route and AI reasoning
        let responseText = '';
        if (priority === 'high') {
            responseText = `EMERGENCY PROTOCOL: Please stay calm and proceed immediately to ${decisionData.destination}. Security has been notified. Follow the illuminated signs towards ${decisionData.direction}.`;
        } else {
            responseText = `I recommend heading to ${decisionData.destination} via the ${decisionData.direction}. It currently has a crowd level of ${decisionData.crowdLevel}%. ${decisionData.justification}`;
            
            // Highlight Edge Cases + Alt Option
            if (decisionData.alternative && decisionData.alternative.destination !== decisionData.destination) {
                responseText += `\n\n**Alternative Option:** You could also head to ${decisionData.alternative.destination} via ${decisionData.alternative.direction}, which currently has a crowd level of ${decisionData.alternative.crowdLevel}%. However, we stand by our primary recommendation based on your preferences and active stadium modeling.`;
            }
        }

        return {
            intent,
            priority,
            structuredResponse: {
                destination: decisionData.destination,
                direction: decisionData.direction,
                crowdLevel: decisionData.crowdLevel,
                justification: decisionData.justification,
                message: responseText
            }
        };
    }
}

module.exports = new VertexAIMock();
