# Smart Stadium AI Assistant

A production-grade, modular AI system designed to resolve stadium congestion, optimize spectator experiences, and handle real-time crowd dynamics dynamically.

## Architecture Explanation
The application is separated into distinct, lightweight modules to guarantee performance and reliability under high load. It uses an Event-Driven API backend (Express) and a vanilla web frontend. 

### Core Components
1. **Context Builder**: Maintains user session states (like preferred navigation routing: `shortest` vs `least_crowded`).
2. **Decision Engine**: Resolves where users should go before relying on LLMs. Evaluates rule-based constraints (e.g., shortest route is overridden if congestion hits >85%).
3. **Simulation Engine**: Replaces traditional database polling for local environments by realistically modeling crowd spikes (`halftime`, `entry_rush`, `exit_surge`).
4. **Tool Orchestrator**: Manages service calls (Firebase -> BigQuery -> Decision -> Vertex AI), handling the macro-routing of data.
5. **Response Generator**: Integrates with Google's Vertex AI to provide intent classification and generate natural language responses imbued with routing rationale.

## System Flow Diagram
```text
[ User / External Environment ]
      │ (Web UI Chat Input)
      ▼
[ Orchestrator API (/api/chat) ] 
      │ 
      ├─► Context Builder (Loads User State, e.g., Prefers Route = Shortest)
      │
      ├─► Firebase Service (Fetches Real-Time Crowd Density)
      │      └─► (Powered by Simulation Engine internally)
      │
      ├─► BigQuery Service (Fetches Historical Event Predictions if needed)
      │
      ├─► Decision Engine (Rule-based pre-processing)
      │      └─► Intent Resolution => Route Strategy => Conflict Resolution
      │
      └─► Vertex AI Service (Classifies final intent & generates NLP structured response)
             │
             ▼
[ User Frontend UI (Map Updates + Chat Response Rendered) ]
```

## Simulation Logic
A lightweight chron job updates stadium metrics based on contextual shifts:
- **`entry_rush`**: Forces gate zones to spike 80-100% capacity.
- **`halftime`**: Forces food stalls and fan booths to surge to 90%+.
- **`exit_surge`**: Pushes gates, transport, and parking to peak levels.

## Deep Google Cloud Integration (Simulated Mocks)
- `@google-cloud/firebase`: Emulates real-time density synchronization via `backend/services/firebase.js`.
- `@google-cloud/bigquery`: Emulates data-lake polling for historic metrics via `backend/services/bigquery.js`.
- `@google-cloud/vertexai`: Acts as the final NLP bridge, packaging the data gracefully inside `backend/services/vertex-ai.js`.

## Sample Outputs
* **Standard Wayfinding (Shortest Route Preferred)**
  * *Destination*: Food Stall 1
  * *Direction*: North-East Walkway
  * *Crowd*: 10%
  * *Response*: "I recommend heading to Food Stall 1 via the North-East Walkway. It currently has a crowd level of 10%. Selected based on your preference for the fastest route."

* **Conflict Resolution / Emergency Reroute**
  * *Destination*: East Gate (Redirected from heavily congested North Gate)
  * *Direction*: East Path
  * *Crowd*: 15%
  * *Response*: "I recommend heading to East Gate via the East Path. It currently has a crowd level of 15%. Your usual shortest route is extremely congested right now. Rerouted to a clearer path."
