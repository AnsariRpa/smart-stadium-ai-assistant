// public/js/app.js

const chatWindow = document.getElementById('chat-window');
const queryInput = document.getElementById('query-input');
const strategySelect = document.getElementById('route-strategy');
const eventStateSelect = document.getElementById('event-state');

const userId = 'user_' + Math.floor(Math.random() * 10000); 

function appendMessage(sender, text, meta = null, isEmergency = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    if (isEmergency) msgDiv.classList.add('emergency');
    
    let html = `<p>${text}</p>`;
    if (meta) {
        html += `<span class="ai-meta">Dest: ${meta.destination} | Crowd: ${meta.crowdLevel}% | Rule: ${meta.justification}</span>`;
    }
    
    msgDiv.innerHTML = html;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendQuery() {
    const query = queryInput.value.trim();
    if (!query) return;

    appendMessage('user', query);
    queryInput.value = '';

    // Simulate typing
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing';
    typingDiv.innerHTML = '<p>...</p>';
    chatWindow.appendChild(typingDiv);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, query })
        });
        const data = await response.json();
        
        chatWindow.removeChild(typingDiv);

        const isEmergency = data.priority === 'high';
        appendMessage('ai', data.structuredResponse.message, data.structuredResponse, isEmergency);

        if (data.structuredResponse.direction && window.highlightPath) {
            window.highlightPath(data.structuredResponse.direction);
        }

    } catch (e) {
        chatWindow.removeChild(typingDiv);
        appendMessage('ai', 'Connection lost to the AI Assistant.');
    }
}

// Event Listeners for UI Controls
strategySelect.addEventListener('change', (e) => {
    fetch('/api/context/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, strategy: e.target.value })
    });
});

eventStateSelect.addEventListener('change', (e) => {
    fetch('/api/simulation/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: e.target.value })
    });
});

// Periodic update of stadium map
setInterval(async () => {
    try {
        const response = await fetch('/api/simulation/status');
        const zonesData = await response.json();
        if (window.updateMapCrowd) {
            window.updateMapCrowd(zonesData);
        }
    } catch(e) {
        console.error("Simulation polling failed", e);
    }
}, 2000);
