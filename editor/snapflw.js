// Global connection state
window.snapflowConnections = [];
let tempConnectionLine = null;
let currentConnectionSource = null;

document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    // Redraw connections on window resize
    window.addEventListener('resize', drawConnections);

    // Global mouseup for finishing connection drags
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);
});

function initDragAndDrop() {
    const sidebarItems = document.querySelectorAll('.sidebar-content neo-button');
    const dragboard = document.getElementById('dragboard');

    // Initialize sidebar items
    sidebarItems.forEach(item => {
        setupDraggable(item);
    });

    // Drop zone
    dragboard.addEventListener('dragover', handleDragOver);
    dragboard.addEventListener('drop', handleDrop);
}

function setupDraggable(el) {
    el.draggable = true;
    el.addEventListener('dragstart', handleDragStart);
}

function handleDragStart(e) {
    const isSidebar = e.target.closest('.sidebar-content') !== null;
    let target = e.target;

    // If dragging a wrapper, get the internal button for ID/Type
    let noteBtn = target;
    if (target.classList.contains('node-wrapper')) {
        noteBtn = target.querySelector('neo-button');
    }

    // Identify the element being dragged for offset calculation
    const rect = target.getBoundingClientRect();

    const data = {
        type: noteBtn.getAttribute('data-type'),
        label: noteBtn.getAttribute('data-label'),
        variant: noteBtn.getAttribute('variant'),
        id: noteBtn.id, // ID is on the button
        mode: isSidebar ? 'copy' : 'move',
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
    };

    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.dataTransfer.effectAllowed = isSidebar ? 'copy' : 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleDrop(e) {
    e.preventDefault();
    const dragboard = document.getElementById('dragboard');
    const dataRaw = e.dataTransfer.getData('application/json');

    if (!dataRaw) return;

    const data = JSON.parse(dataRaw);
    const rect = dragboard.getBoundingClientRect();

    // Mouse position relative to dragboard
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new position
    const newLeft = mouseX - data.offsetX;
    const newTop = mouseY - data.offsetY;

    if (data.mode === 'move') {
        // Find existing button
        const btn = document.getElementById(data.id);
        if (btn) {
            // Move its wrapper
            const wrapper = btn.closest('.node-wrapper');
            if (wrapper) {
                wrapper.style.left = `${newLeft}px`;
                wrapper.style.top = `${newTop}px`;
                drawConnections();
                return;
            }
        }
    }

    // Create new
    window.createNodeWrapper(
        data.type,
        data.label,
        data.variant,
        newLeft,
        newTop,
        null // Create new ID
    );
}

/**
 * Create a Node Wrapper with Ports
 */
window.createNodeWrapper = function (type, label, variant, x, y, existingId = null) {
    const dragboard = document.getElementById('dragboard');

    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.classList.add('node-wrapper');
    Object.assign(wrapper.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    // The Node (Button)
    const btn = document.createElement('neo-button');
    // Ensure unique ID
    const id = existingId || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    btn.id = id;
    btn.setAttribute('data-type', type);
    btn.setAttribute('data-label', label);
    if (variant && variant !== 'null') btn.setAttribute('variant', variant);
    btn.textContent = label;

    // Make wrapper draggable
    setupDraggable(wrapper);

    // Ports
    const portStyle = {
        width: '12px',
        height: '12px',
        background: 'white',
        border: '3px solid black',
        borderRadius: '50%',
        position: 'absolute',
        cursor: 'crosshair',
        zIndex: '10'
    };

    // Input Port (Left)
    const inputPort = document.createElement('div');
    inputPort.classList.add('port', 'port-in');
    Object.assign(inputPort.style, portStyle, {
        left: '-6px',
        top: '50%',
        transform: 'translateY(-50%)'
    });
    inputPort.dataset.nodeId = id;
    inputPort.dataset.portType = 'in';

    // Output Port (Right)
    const outputPort = document.createElement('div');
    outputPort.classList.add('port', 'port-out');
    Object.assign(outputPort.style, portStyle, {
        right: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'var(--accent-3, #A3E635)' // Lime for output
    });
    outputPort.dataset.nodeId = id;
    outputPort.dataset.portType = 'out';

    // Add port listeners
    setupPort(inputPort);
    setupPort(outputPort);

    wrapper.appendChild(inputPort);
    wrapper.appendChild(btn);
    wrapper.appendChild(outputPort);

    dragboard.appendChild(wrapper);

    drawConnections();
    return wrapper;
};

function setupPort(port) {
    port.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Don't drag node
        e.preventDefault(); // Prevent text selection

        currentConnectionSource = {
            nodeId: port.dataset.nodeId,
            type: port.dataset.portType,
            element: port
        };

        // Create temp line
        const svg = document.getElementById('connections-layer');
        tempConnectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tempConnectionLine.setAttribute('stroke', 'black');
        tempConnectionLine.setAttribute('stroke-width', '4');
        tempConnectionLine.setAttribute('stroke-dasharray', '5,5'); // Dashed for temp
        svg.appendChild(tempConnectionLine);

        // Initial position
        updateTempLine(e.clientX, e.clientY);
    });
}

function handleGlobalMouseMove(e) {
    if (currentConnectionSource && tempConnectionLine) {
        updateTempLine(e.clientX, e.clientY);
    }
}

function updateTempLine(mouseX, mouseY) {
    const dragboard = document.getElementById('dragboard');
    const boardRect = dragboard.getBoundingClientRect();
    const sourceRect = currentConnectionSource.element.getBoundingClientRect();

    const x1 = (sourceRect.left + sourceRect.width / 2) - boardRect.left;
    const y1 = (sourceRect.top + sourceRect.height / 2) - boardRect.top;

    const x2 = mouseX - boardRect.left;
    const y2 = mouseY - boardRect.top;

    tempConnectionLine.setAttribute('x1', x1);
    tempConnectionLine.setAttribute('y1', y1);
    tempConnectionLine.setAttribute('x2', x2);
    tempConnectionLine.setAttribute('y2', y2);
}

function handleGlobalMouseUp(e) {
    if (!currentConnectionSource) return;

    // Clean up temp line
    if (tempConnectionLine) {
        tempConnectionLine.remove();
        tempConnectionLine = null;
    }

    // Check if dropped on a port
    // We need to use document.elementFromPoint because mouseup happens on window/document
    // Temporarily hide the temp line or pointer-events none on it? It's SVG so pointer events might be weird
    // but elementFromPoint usually respects pointer-events: none;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.classList.contains('port')) {
        const targetType = target.dataset.portType;
        const targetNodeId = target.dataset.nodeId;

        // Validate connection
        if (targetNodeId !== currentConnectionSource.nodeId && // Not self
            targetType !== currentConnectionSource.type) { // In to Out or Out to In

            let from, to;
            if (currentConnectionSource.type === 'out') {
                from = currentConnectionSource.nodeId;
                to = targetNodeId;
            } else {
                from = targetNodeId;
                to = currentConnectionSource.nodeId;
            }

            // Avoid duplicates
            if (!window.snapflowConnections.find(c => c.from === from && c.to === to)) {
                window.snapflowConnections.push({ from, to });
                drawConnections();
            }
        }
    }

    currentConnectionSource = null;
}


/**
 * Draw all connections using SVG
 */
function drawConnections() {
    const svg = document.getElementById('connections-layer');
    if (!svg) return;

    // Keep defs, clear lines
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);
    else {
        // Recreate defs if missing
        const newDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        newDefs.innerHTML = `
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
            </marker>
        `;
        svg.appendChild(newDefs);
    }

    const dragboard = document.getElementById('dragboard');
    const boardRect = dragboard.getBoundingClientRect();

    window.snapflowConnections.forEach(conn => {
        const fromNode = document.getElementById(conn.from);
        const toNode = document.getElementById(conn.to);

        if (!fromNode || !toNode) return;

        // Find ports
        const fromWrapper = fromNode.closest('.node-wrapper');
        const toWrapper = toNode.closest('.node-wrapper');

        if (!fromWrapper || !toWrapper) return;

        const outPort = fromWrapper.querySelector('.port-out');
        const inPort = toWrapper.querySelector('.port-in');

        const r1 = outPort.getBoundingClientRect();
        const r2 = inPort.getBoundingClientRect();

        // Calculate centers
        const x1 = (r1.left + r1.width / 2) - boardRect.left;
        const y1 = (r1.top + r1.height / 2) - boardRect.top;
        const x2 = (r2.left + r2.width / 2) - boardRect.left;
        const y2 = (r2.top + r2.height / 2) - boardRect.top;

        // Draw Line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Bezier curve for smoother look
        const dx = Math.abs(x2 - x1) * 0.5;
        const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'black');
        path.setAttribute('stroke-width', '4');
        path.setAttribute('marker-end', 'url(#arrowhead)');

        svg.appendChild(path);
    });
}

// Export for other modules if needed (though using window global)
window.drawConnections = drawConnections;