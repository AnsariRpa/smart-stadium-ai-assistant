// public/js/stadium-map.js

const svgContainer = document.getElementById('svg-map-container');
let stadiumMap;

const zonesLayout = [
    { id: 'North Gate', x: 400, y: 100, width: 200, height: 60, type: 'gate' },
    { id: 'South Gate', x: 400, y: 700, width: 200, height: 60, type: 'gate' },
    { id: 'East Gate', x: 740, y: 400, width: 60, height: 200, type: 'gate' },
    { id: 'West Gate', x: 200, y: 400, width: 60, height: 200, type: 'gate' },
    { id: 'Food Stall 1', x: 700, y: 150, width: 120, height: 80, type: 'food' },
    { id: 'Food Stall 2', x: 180, y: 650, width: 120, height: 80, type: 'food' },
    { id: 'Fan Booth', x: 200, y: 150, width: 140, height: 80, type: 'merch' },
    { id: 'Parking', x: 800, y: 650, width: 150, height: 120, type: 'transport' },
    { id: 'Transport', x: 50, y: 50, width: 120, height: 120, type: 'transport' }
];

const pathsLayout = [
    { id: 'North Path', x1: 500, y1: 160, x2: 500, y2: 300 },
    { id: 'South Path', x1: 500, y1: 700, x2: 500, y2: 560 },
    { id: 'East Path', x1: 740, y1: 500, x2: 600, y2: 500 },
    { id: 'West Path', x1: 260, y1: 500, x2: 400, y2: 500 },
    { id: 'North-East Walkway', x1: 760, y1: 230, x2: 550, y2: 350 },
    { id: 'South-West Walkway', x1: 240, y1: 650, x2: 450, y2: 550 },
    { id: 'Central Promenade', x1: 270, y1: 230, x2: 450, y2: 350 },
    { id: 'Outer Ring Road', x1: 850, y1: 650, x2: 850, y2: 100 }
];

function initMap() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 1000 860");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.background = "transparent";

    // Draw field (center)
    const field = document.createElementNS(svgNS, "ellipse");
    field.setAttribute("cx", "500");
    field.setAttribute("cx", "500"); // keep center 
    field.setAttribute("cy", "430");
    field.setAttribute("rx", "150");
    field.setAttribute("ry", "220");
    field.setAttribute("fill", "#064e3b");
    field.setAttribute("stroke", "#059669");
    field.setAttribute("stroke-width", "4");
    svg.appendChild(field);

    // Draw paths
    pathsLayout.forEach(p => {
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", p.x1);
        line.setAttribute("y1", p.y1);
        line.setAttribute("x2", p.x2);
        line.setAttribute("y2", p.y2);
        line.setAttribute("class", "path");
        line.setAttribute("id", `path-${p.id.replace(/\s+/g, '-')}`);
        line.setAttribute("stroke-width", "8");
        svg.appendChild(line);
    });

    // Draw zones
    zonesLayout.forEach(z => {
        const group = document.createElementNS(svgNS, "g");
        
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", z.x);
        rect.setAttribute("y", z.y);
        rect.setAttribute("width", z.width);
        rect.setAttribute("height", z.height);
        rect.setAttribute("rx", "10");
        rect.setAttribute("class", "zone");
        rect.setAttribute("id", `zone-${z.id.replace(/\s+/g, '-')}`);
        rect.setAttribute("fill", "#10b981"); // default low
        group.appendChild(rect);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", z.x + z.width / 2);
        text.setAttribute("y", z.y + z.height / 2 + 5);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("class", "zone-text");
        text.textContent = z.id;
        group.appendChild(text);

        svg.appendChild(group);
    });

    svgContainer.appendChild(svg);
    stadiumMap = svg;
}

function updateMapCrowd(zonesData) {
    Object.keys(zonesData).forEach(zoneKey => {
        const data = zonesData[zoneKey];
        const elId = `zone-${zoneKey.replace(/\s+/g, '-')}`;
        const rect = document.getElementById(elId);
        if (rect) {
            let color = '#10b981'; // low
            if (data.crowdLevel >= 50 && data.crowdLevel <= 80) color = '#f59e0b'; // med
            if (data.crowdLevel > 80) color = '#ef4444'; // high
            rect.setAttribute("fill", color);
        }
    });
}

function highlightPath(direction) {
    // Reset all
    document.querySelectorAll('.path').forEach(p => p.classList.remove('highlight'));
    
    if (direction) {
        const id = `path-${direction.replace(/\s+/g, '-')}`;
        const el = document.getElementById(id);
        if (el) el.classList.add('highlight');
    }
}

// Initialize on load
initMap();
