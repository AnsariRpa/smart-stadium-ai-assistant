// public/js/stadium-map.js

const svgContainer = document.getElementById('svg-map-container');
let stadiumMap;

// Global tracking for tooltips
let currentZonesData = {};

// Use layered coordinates for a realistic stadium setup
// Center of SVG is at (500, 430)
const zonesLayout = [
    { id: 'North Gate', text: 'North Gate', x: 500, y: 150, r: 35, type: 'gate' },
    { id: 'South Gate', text: 'South Gate', x: 500, y: 710, r: 35, type: 'gate' },
    { id: 'East Gate', text: 'East Gate', x: 780, y: 430, r: 35, type: 'gate' },
    { id: 'West Gate', text: 'West Gate', x: 220, y: 430, r: 35, type: 'gate' },
    { id: 'Food Stall 1', text: 'Food Stall 1', x: 740, y: 220, r: 30, type: 'food' },
    { id: 'Food Stall 2', text: 'Food Stall 2', x: 260, y: 640, r: 30, type: 'food' },
    { id: 'Fan Booth', text: 'Fan Booth', x: 260, y: 220, r: 30, type: 'merch' },
    { id: 'Parking', text: 'Parking', x: 850, y: 720, width: 100, height: 80, type: 'transport', isRect: true },
    { id: 'Transport', text: 'Transport', x: 100, y: 100, width: 90, height: 90, type: 'transport', isRect: true }
];

// Use curved paths (Quadratic or Cubic Beziers)
const pathsLayout = [
    { id: 'North Path', d: 'M 500,185 Q 500,280 500,350' },
    { id: 'South Path', d: 'M 500,675 Q 500,580 500,510' },
    { id: 'East Path', d: 'M 745,430 Q 650,430 600,430' },
    { id: 'West Path', d: 'M 255,430 Q 350,430 400,430' },
    { id: 'North-East Walkway', d: 'M 720,240 Q 600,300 550,380' },
    { id: 'South-West Walkway', d: 'M 280,620 Q 400,560 450,480' },
    { id: 'Central Promenade', d: 'M 280,240 Q 400,300 450,380' },
    { id: 'Outer Ring Road', d: 'M 850,150 Q 950,430 900,720' },
    { id: 'Main Corridors', d: 'M 500,430 A 100 100 0 1 0 500.1 430' } // Circular route fallback
];

function initMap() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 1000 860");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.borderRadius = '16px';
    
    // Base Layer: Outer stadium grounds
    const grounds = document.createElementNS(svgNS, "ellipse");
    grounds.setAttribute("cx", "500"); grounds.setAttribute("cy", "430");
    grounds.setAttribute("rx", "400"); grounds.setAttribute("ry", "320");
    grounds.setAttribute("fill", "#0f172a"); // Matches map background
    grounds.setAttribute("stroke", "rgba(59, 130, 246, 0.2)");
    grounds.setAttribute("stroke-width", "2");
    svg.appendChild(grounds);
    
    // Roads around the stadium
    const ringRoad = document.createElementNS(svgNS, "ellipse");
    ringRoad.setAttribute("cx", "500"); ringRoad.setAttribute("cy", "430");
    ringRoad.setAttribute("rx", "440"); ringRoad.setAttribute("ry", "360");
    ringRoad.setAttribute("fill", "none");
    ringRoad.setAttribute("stroke", "rgba(255,255,255,0.05)");
    ringRoad.setAttribute("stroke-width", "20");
    svg.appendChild(ringRoad);

    const dashedRingRoad = document.createElementNS(svgNS, "ellipse");
    dashedRingRoad.setAttribute("cx", "500"); dashedRingRoad.setAttribute("cy", "430");
    dashedRingRoad.setAttribute("rx", "440"); dashedRingRoad.setAttribute("ry", "360");
    dashedRingRoad.setAttribute("fill", "none");
    dashedRingRoad.setAttribute("stroke", "rgba(255,255,255,0.2)");
    dashedRingRoad.setAttribute("stroke-width", "2");
    dashedRingRoad.setAttribute("stroke-dasharray", "10,10");
    svg.appendChild(dashedRingRoad);

    // Inner Layer: Seating Rings
    const seating = document.createElementNS(svgNS, "ellipse");
    seating.setAttribute("cx", "500"); seating.setAttribute("cy", "430");
    seating.setAttribute("rx", "250"); seating.setAttribute("ry", "180");
    seating.setAttribute("fill", "#1e293b"); 
    seating.setAttribute("stroke", "rgba(59, 130, 246, 0.5)");
    seating.setAttribute("stroke-width", "5");
    svg.appendChild(seating);

    // Inner Field
    const field = document.createElementNS(svgNS, "ellipse");
    field.setAttribute("cx", "500"); field.setAttribute("cy", "430");
    field.setAttribute("rx", "120"); field.setAttribute("ry", "80");
    field.setAttribute("fill", "#064e3b");
    field.setAttribute("stroke", "#10b981");
    field.setAttribute("stroke-width", "3");
    svg.appendChild(field);
    
    const centerLine = document.createElementNS(svgNS, "line");
    centerLine.setAttribute("x1","500"); centerLine.setAttribute("y1","350");
    centerLine.setAttribute("x2","500"); centerLine.setAttribute("y2","510");
    centerLine.setAttribute("stroke", "rgba(255,255,255,0.4)");
    centerLine.setAttribute("stroke-width", "2");
    svg.appendChild(centerLine);
    
    // Draw Curved Paths Connectors
    pathsLayout.forEach(p => {
        const pathLine = document.createElementNS(svgNS, "path");
        pathLine.setAttribute("d", p.d);
        pathLine.setAttribute("class", "path");
        pathLine.setAttribute("id", `path-${p.id.replace(/\s+/g, '-')}`);
        pathLine.setAttribute("stroke-width", "8");
        pathLine.setAttribute("stroke", "rgba(255,255,255,0.1)");
        pathLine.setAttribute("stroke-dasharray", "8, 8");
        pathLine.setAttribute("stroke-linecap", "round");
        pathLine.setAttribute("fill", "none");
        svg.appendChild(pathLine);
        
        // Highlight overlay layer for animations
        const highlightPath = document.createElementNS(svgNS, "path");
        highlightPath.setAttribute("d", p.d);
        highlightPath.setAttribute("class", "path-overlay");
        highlightPath.setAttribute("id", `path-overlay-${p.id.replace(/\s+/g, '-')}`);
        highlightPath.setAttribute("stroke-width", "10");
        highlightPath.setAttribute("stroke", "transparent");
        highlightPath.setAttribute("fill", "none");
        svg.appendChild(highlightPath);
    });

    // Draw Zones over everything
    zonesLayout.forEach(z => {
        const group = document.createElementNS(svgNS, "g");
        group.setAttribute("class", "zone-group");
        group.style.cursor = "pointer";
        
        let shape;
        if (z.isRect) {
            shape = document.createElementNS(svgNS, "rect");
            shape.setAttribute("x", z.x - z.width/2);
            shape.setAttribute("y", z.y - z.height/2);
            shape.setAttribute("width", z.width);
            shape.setAttribute("height", z.height);
            shape.setAttribute("rx", "12");
        } else {
            shape = document.createElementNS(svgNS, "circle");
            shape.setAttribute("cx", z.x);
            shape.setAttribute("cy", z.y);
            shape.setAttribute("r", z.r);
        }
        
        shape.setAttribute("class", "zone");
        shape.setAttribute("id", `zone-${z.id.replace(/\s+/g, '-')}`);
        shape.setAttribute("fill", "#10b981"); // default
        shape.setAttribute("stroke", "rgba(255,255,255,0.2)");
        shape.setAttribute("stroke-width", "3");
        group.appendChild(shape);

        // Label Text
        const textObj = document.createElementNS(svgNS, "text");
        textObj.setAttribute("x", z.x);
        textObj.setAttribute("y", z.isRect ? z.y - 10 : z.y - 5);
        textObj.setAttribute("text-anchor", "middle");
        textObj.setAttribute("class", "zone-text name-text");
        textObj.setAttribute("fill", "#ffffff");
        textObj.setAttribute("font-size", "14px");
        textObj.setAttribute("font-weight", "600");
        textObj.setAttribute("pointer-events", "none");
        textObj.textContent = z.text;
        group.appendChild(textObj);
        
        // Crowd % Label
        const percObj = document.createElementNS(svgNS, "text");
        percObj.setAttribute("x", z.x);
        percObj.setAttribute("y", z.isRect ? z.y + 10 : z.y + 12);
        percObj.setAttribute("text-anchor", "middle");
        percObj.setAttribute("id", `perc-${z.id.replace(/\s+/g, '-')}`);
        percObj.setAttribute("class", "zone-text perc-text");
        percObj.setAttribute("fill", "rgba(255,255,255,0.9)");
        percObj.setAttribute("font-size", "12px");
        percObj.setAttribute("pointer-events", "none");
        percObj.textContent = "(0%)";
        group.appendChild(percObj);

        // Tooltip logic
        group.addEventListener('mouseenter', (e) => showTooltip(e, z.id));
        group.addEventListener('mouseleave', hideTooltip);

        svg.appendChild(group);
    });

    // You are Here Marker
    const locationGroup = document.createElementNS(svgNS, "g");
    locationGroup.setAttribute("id", "user-location-marker");
    // Place in center field
    const pulseCircle = document.createElementNS(svgNS, "circle");
    pulseCircle.setAttribute("cx", "500"); pulseCircle.setAttribute("cy", "430");
    pulseCircle.setAttribute("r", "15");
    pulseCircle.setAttribute("fill", "var(--primary)");
    pulseCircle.style.animation = "beacon-pulse 2s infinite ease-out";
    locationGroup.appendChild(pulseCircle);
    
    const locDot = document.createElementNS(svgNS, "circle");
    locDot.setAttribute("cx", "500"); locDot.setAttribute("cy", "430");
    locDot.setAttribute("r", "6");
    locDot.setAttribute("fill", "#60a5fa");
    locDot.setAttribute("stroke", "#fff");
    locDot.setAttribute("stroke-width", "2");
    locationGroup.appendChild(locDot);
    
    const locText = document.createElementNS(svgNS, "text");
    locText.setAttribute("x", "500"); locText.setAttribute("y", "455");
    locText.setAttribute("text-anchor", "middle");
    locText.setAttribute("fill", "#93c5fd");
    locText.setAttribute("font-size", "12px");
    locText.setAttribute("font-weight", "600");
    locText.textContent = "You are here";
    locationGroup.appendChild(locText);
    
    svg.appendChild(locationGroup);

    svgContainer.appendChild(svg);
    stadiumMap = svg;

    // Build the HTML tooltip element
    buildTooltipElement();
}

let tooltipEl;

function buildTooltipElement() {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'map-tooltip';
    tooltipEl.innerHTML = `
        <div class="map-tooltip-title" id="tt-title">Zone Name</div>
        <div class="map-tooltip-metric"><span>Crowd:</span> <strong id="tt-crowd">0%</strong></div>
        <div class="map-tooltip-metric"><span>Status:</span> <strong id="tt-status">Low</strong></div>
    `;
    document.body.appendChild(tooltipEl);
}

function showTooltip(e, zoneId) {
    const data = currentZonesData[zoneId] || { crowdLevel: 0 };
    const rect = e.target.getBoundingClientRect();
    
    document.getElementById('tt-title').textContent = zoneId;
    document.getElementById('tt-crowd').textContent = data.crowdLevel + '%';
    
    const statusEl = document.getElementById('tt-status');
    if (data.crowdLevel > 80) { statusEl.textContent = 'High'; statusEl.style.color = '#ef4444'; }
    else if (data.crowdLevel >= 50) { statusEl.textContent = 'Medium'; statusEl.style.color = '#f59e0b'; }
    else { statusEl.textContent = 'Low'; statusEl.style.color = '#10b981'; }

    // Position tooltip
    tooltipEl.style.left = (e.clientX + 15) + 'px';
    tooltipEl.style.top = (e.clientY - 30) + 'px';
    tooltipEl.classList.add('visible');
}

function hideTooltip() {
    tooltipEl.classList.remove('visible');
}

function updateMapCrowd(zonesData) {
    currentZonesData = zonesData;
    Object.keys(zonesData).forEach(zoneKey => {
        const data = zonesData[zoneKey];
        const safeId = zoneKey.replace(/\s+/g, '-');
        const shape = document.getElementById(`zone-${safeId}`);
        const perc = document.getElementById(`perc-${safeId}`);
        
        if (shape) {
            let color = 'var(--heat-low)'; // low
            shape.style.animation = 'none'; // reset
            shape.style.filter = 'none';
            
            if (data.crowdLevel >= 50 && data.crowdLevel <= 80) {
                color = 'var(--heat-med)'; 
            }
            if (data.crowdLevel > 80) { 
                color = 'var(--heat-high)'; 
                shape.style.animation = 'high-congest-pulse 1s infinite alternate';
                shape.style.filter = 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))';
            }
            shape.setAttribute("fill", color);
            
            if (perc) {
                perc.textContent = `(${data.crowdLevel}%)`;
            }
        }
    });
}

function highlightPath(direction) {
    // Reset all overlays
    const overlays = document.querySelectorAll('.path-overlay');
    overlays.forEach(p => {
        p.setAttribute('stroke', 'transparent');
        p.style.animation = 'none';
        p.style.filter = 'none';
    });
    
    if (direction) {
        const id = `path-overlay-${direction.replace(/\s+/g, '-')}`;
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('stroke', 'var(--primary)');
            el.setAttribute('stroke-dasharray', '20, 10');
            el.style.animation = 'dash-flow 1s linear infinite';
            el.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))';
        }
    }
}

// Initialize on load
initMap();
