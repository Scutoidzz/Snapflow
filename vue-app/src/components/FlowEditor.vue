<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import NeoButton from './NeoButton.vue'
import NeoInput from './NeoInput.vue'
import NodeCustomizer from './NodeCustomizer.vue'

// -- STATE --
const nodes = ref([])
const connections = ref([])

// Interaction state
const dragItem = ref(null) // { type, label, variant, id, mode, offsetX, offsetY }
const tempConnection = ref(null) // { x1, y1, x2, y2 }
const currentConnectionSource = ref(null) // { nodeId, type, element }
const contextMenu = ref(null) // { x, y, nodeId, show }
const customizingNode = ref(null) // Node currently being customized

// Refs
const dragboardRef = ref(null)
const nodesRef = ref({}) // Map of node IDs to DOM elements

// -- LIFECYCLE --
onMounted(() => {
  // Load pending flow if any
  const pending = localStorage.getItem('pending_load_flow')
  if (pending) {
    loadFlowContent(pending)
    localStorage.removeItem('pending_load_flow')
  }
  
  window.addEventListener('mousemove', handleGlobalMouseMove)
  window.addEventListener('mouseup', handleGlobalMouseUp)
  window.addEventListener('resize', updateConnections)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleGlobalMouseMove)
  window.removeEventListener('mouseup', handleGlobalMouseUp)
  window.removeEventListener('resize', updateConnections)
})

// -- DRAG & DROP (Sidebar -> Canvas AND Canvas -> Canvas) --

function onDragStart(event, item, isSidebar = false) {
  const target = event.target.closest('.draggable-item') || event.target
  const rect = target.getBoundingClientRect()
  
  const data = {
    type: item.type,
    label: item.label,
    variant: item.variant,
    id: item.id, // Will be undefined for sidebar items
    mode: isSidebar ? 'copy' : 'move',
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  }

  event.dataTransfer.setData('application/json', JSON.stringify(data))
  event.dataTransfer.effectAllowed = isSidebar ? 'copy' : 'move'
}

function onDragOver(event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

function onDrop(event) {
  event.preventDefault()
  const dataRaw = event.dataTransfer.getData('application/json')
  if (!dataRaw) return
  
  const data = JSON.parse(dataRaw)
  const boardRect = dragboardRef.value.getBoundingClientRect()
  
  const newLeft = event.clientX - boardRect.left - data.offsetX
  const newTop = event.clientY - boardRect.top - data.offsetY
  
  if (data.mode === 'move') {
    // Update existing node
    const node = nodes.value.find(n => n.id === data.id)
    if (node) {
      node.x = newLeft
      node.y = newTop
      // Update connections next tick after DOM update
      nextTick(updateConnections)
    }
  } else {
    // Create new node
    createNode(data.type, data.label, data.variant, newLeft, newTop)
  }
}

function createNode(type, label, variant, x, y, existingId = null) {
  const id = existingId || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  nodes.value.push({
    id,
    type,
    label,
    variant,
    x,
    y
  })
  nextTick(updateConnections)
}

// -- CONNECTIONS --

function startConnection(event, nodeId, type) {
  event.stopPropagation()
  event.preventDefault()
  
  const port = event.target
  // We need to store the element to calculate coordinates during drag
  currentConnectionSource.value = {
    nodeId,
    type, 
    element: port
  }
  
  // Initial temp line
  updateTempLine(event.clientX, event.clientY)
}

function handleGlobalMouseMove(event) {
  if (currentConnectionSource.value) {
    updateTempLine(event.clientX, event.clientY)
  }
}

function updateTempLine(mouseX, mouseY) {
  if (!dragboardRef.value || !currentConnectionSource.value) return

  const boardRect = dragboardRef.value.getBoundingClientRect()
  const sourceRect = currentConnectionSource.value.element.getBoundingClientRect()
  
  const x1 = (sourceRect.left + sourceRect.width / 2) - boardRect.left
  const y1 = (sourceRect.top + sourceRect.height / 2) - boardRect.top
  
  const x2 = mouseX - boardRect.left
  const y2 = mouseY - boardRect.top
  
  tempConnection.value = { x1, y1, x2, y2 }
}

function handleGlobalMouseUp(event) {
  if (!currentConnectionSource.value) return

  // Check if dropped on a port
  const target = document.elementFromPoint(event.clientX, event.clientY)
  
  if (target && target.classList.contains('port')) {
    const targetNodeId = target.dataset.nodeId
    const targetType = target.dataset.portType
    
    // Validate
    if (targetNodeId !== currentConnectionSource.value.nodeId &&
        targetType !== currentConnectionSource.value.type) {
          
      let from, to
      if (currentConnectionSource.value.type === 'out') {
        from = currentConnectionSource.value.nodeId
        to = targetNodeId
      } else {
        from = targetNodeId
        to = currentConnectionSource.value.nodeId
      }
      
      // Avoid duplicates
      if (!connections.value.find(c => c.from === from && c.to === to)) {
        connections.value.push({ from, to })
      }
    }
  }
  
  currentConnectionSource.value = null
  tempConnection.value = null
  nextTick(updateConnections)
}

const layoutVersion = ref(0) // Used to force re-render of connections

function updateConnections() {
    layoutVersion.value++
}

// We need a helper to get port position for a node
function getPortPosition(nodeId, type) {
  // We need safe access to DOM
  if (!dragboardRef.value) return { x: 0, y: 0 }
  
  const nodeEl = dragboardRef.value.querySelector(`[data-node-id="${nodeId}"]`)
  if (!nodeEl) return { x: 0, y: 0 }
  
  const port = nodeEl.querySelector(type === 'in' ? '.port-in' : '.port-out')
  if (!port) return { x: 0, y: 0 }
  
  const portRect = port.getBoundingClientRect()
  const boardRect = dragboardRef.value.getBoundingClientRect()
  
  return {
    x: (portRect.left + portRect.width / 2) - boardRect.left,
    y: (portRect.top + portRect.height / 2) - boardRect.top
  }
}

function getConnectionPath(conn) {
    // Dependency on layoutVersion to force update
    if (layoutVersion.value < 0) return '' 

    // Find nodes to ensure they exist (and create reactivity if we used them directly, but we use DOM)
    const fromNode = nodes.value.find(n => n.id === conn.from)
    const toNode = nodes.value.find(n => n.id === conn.to)
    
    if (!fromNode || !toNode) return ''

    const start = getPortPosition(conn.from, 'out')
    const end = getPortPosition(conn.to, 'in')
    
    const x1 = start.x
    const y1 = start.y
    const x2 = end.x
    const y2 = end.y

    const dx = Math.abs(x2 - x1) * 0.5
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
}

// -- CONTEXT MENU --
function onContextMenu(event, node) {
    event.preventDefault()
    contextMenu.value = {
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
        // Clone config to prevent mutation until save? Not strictly necessary if we rely on refs
        node: node, 
        show: true
    }
}

function openCustomizer() {
    if (contextMenu.value) {
        customizingNode.value = contextMenu.value.node
        contextMenu.value = null
    }
}

function onSaveCustomization(data) {
    if (customizingNode.value) {
        customizingNode.value.data = data
        customizingNode.value = null
    }
}

function deleteNode() {
    if (contextMenu.value) {
        const id = contextMenu.value.nodeId
        nodes.value = nodes.value.filter(n => n.id !== id)
        connections.value = connections.value.filter(c => c.from !== id && c.to !== id)
        contextMenu.value = null
    }
}

function loadFlowContent(content) {
  try {
    const data = JSON.parse(content)
    // Basic format check
    // If it's the localStorage format { nodes, connections }
    // Or if it's the "snapf" file format, we might need to parse lines
    // snapflw.js saveFlowToSNAPF generated a text file with commands.
    // wait, the previous saveflow/loadflow might have been saving JSON or something else
    // Let's assume JSON for internal localStorage for now.
    // Actually, looking at previous conversation, the .snapf might be commands
    // But for the editor state, JSON is easier.
    
    // If simple JSON object
    if (data.nodes && data.connections) {
        nodes.value = data.nodes
        connections.value = data.connections
    }
  } catch (e) {
      console.error("Failed to load flow", e)
  }
}

function saveFlow() {
   const data = JSON.stringify({
       nodes: nodes.value,
       connections: connections.value
   })
   const blob = new Blob([data], { type: 'application/json' })
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = 'flow.json' // Using json for now for re-import ease
   document.body.appendChild(a)
   a.click()
   document.body.removeChild(a)
}

// Sidebar items config
const sidebarItems = [
    { type: 'trigger', label: 'Time Trigger', variant: 'primary' },
    { type: 'trigger', label: 'File Created', variant: 'primary' },
    { type: 'trigger', label: 'Battery Level', variant: 'primary' },
    { type: 'action', label: 'Send Notification', variant: 'secondary' },
    { type: 'action', label: 'Connect to AI', variant: 'secondary' },
    { type: 'action', label: 'Custom API', variant: 'secondary' },
    { type: 'action', label: 'Terminal Command', variant: 'secondary' }
]
</script>

<template>
  <div class="editor-layout">
    <aside class="sidebar">
      <div style="padding: 2rem; border-bottom: var(--border-width, 3px) solid black;">
        <div style="display: flex; gap: 0.5rem; flex-direction: column;">
            <NeoInput placeholder="Search blocks..." />
            <NeoButton variant="primary">Search</NeoButton>
        </div>
      </div>
      
      <div class="sidebar-content">
        <div 
            v-for="(item, idx) in sidebarItems" 
            :key="idx" 
            class="draggable-item" 
            draggable="true"
            @dragstart="onDragStart($event, item, true)"
        >
            <NeoButton style="width: 100%; pointer-events: none;" :variant="item.variant">
                {{ item.label }}
            </NeoButton>
            <!-- Overlay to capture drag events better than the button itself sometimes -->
            <div class="drag-overlay"></div>
        </div>
      </div>
    </aside>

    <div class="workspace">
        <div class="workspace-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
             <div><p style="margin: 0.5rem 0 0 0;">Drag blocks here to start building.</p></div>
             <div class="file-actions" style="display: flex; gap: 0.5rem;">
                <NeoButton variant="primary" @click="saveFlow">Download</NeoButton>
             </div>
        </div>

        <div 
            id="dragboard" 
            ref="dragboardRef"
            style="position: relative; width: 100%; height: 75vh; border: 3px dashed #ccc; overflow: hidden;"
            @dragover="onDragOver"
            @drop="onDrop"
            @click="contextMenu = null"
        >
            <!-- Connections Layer -->
            <svg id="connections-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: visible;">
                <defs>
                   <!-- Arrowhead if needed -->
                </defs>
                <path 
                    v-for="(conn, idx) in connections" 
                    :key="idx"
                    :d="getConnectionPath(conn)"
                    fill="none"
                    stroke="black"
                    stroke-width="4"
                />
                <line 
                    v-if="tempConnection"
                    :x1="tempConnection.x1"
                    :y1="tempConnection.y1"
                    :x2="tempConnection.x2"
                    :y2="tempConnection.y2"
                    stroke="black"
                    stroke-width="4"
                    stroke-dasharray="5,5"
                />
            </svg>

            <!-- Nodes -->
            <div 
                v-for="node in nodes" 
                :key="node.id"
                class="node-wrapper draggable-item"
                :data-node-id="node.id"
                :style="{ left: node.x + 'px', top: node.y + 'px' }"
                draggable="true"
                @dragstart="onDragStart($event, node, false)"
                @contextmenu.stop="onContextMenu($event, node)"
            >
                <div 
                    class="port port-in" 
                    data-port-type="in" 
                    :data-node-id="node.id"
                    @mousedown="startConnection($event, node.id, 'in')"
                ></div>
                
                <NeoButton :variant="node.variant" style="pointer-events: none;">{{ node.label }}</NeoButton>
                
                <div 
                    class="port port-out" 
                    data-port-type="out" 
                    :data-node-id="node.id"
                    @mousedown="startConnection($event, node.id, 'out')"
                ></div>
            </div>
        </div>
    </div>
    
    <!-- Context Menu -->
    <div 
        v-if="contextMenu && contextMenu.show" 
        class="right-click-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
        <div class="menu-item" @click="openCustomizer">Customize</div>
        <div class="menu-item" @click="deleteNode">Delete</div>
    </div>

    <!-- Customizer -->
    <NodeCustomizer 
        v-if="customizingNode" 
        :node="customizingNode" 
        @close="customizingNode = null"
        @save="onSaveCustomization"
    />
  </div>
</template>

<style scoped>
.editor-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 350px;
  background: white;
  border-right: var(--border-width, 3px) solid black;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.sidebar-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workspace {
  flex: 1;
  padding: 3rem;
  overflow-y: auto;
  background-color: var(--bg-color);
  background-image: radial-gradient(rgba(0, 0, 0, 0.1) 2px, transparent 2px);
  background-size: 24px 24px;
  position: relative;
}

.draggable-item {
    position: relative; 
    cursor: grab;
}

.draggable-item:active {
    cursor: grabbing;
}

.drag-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 2;
}

.node-wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Add z-index so it floats above lines */
    z-index: 1; 
}

.port {
    width: 12px;
    height: 12px;
    background: white;
    border: 3px solid black;
    border-radius: 50%;
    position: absolute;
    cursor: crosshair;
    z-index: 10;
    pointer-events: auto; /* Essential for mousedown */
}

.port-in {
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
}

.port-out {
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--accent-3, #ffe66d);
}

/* Context Menu */
.right-click-menu {
    position: fixed; /* Fixed to viewport */
    background: white;
    border: var(--border-width, 3px) solid black;
    box-shadow: 6px 6px 0px 0px black;
    z-index: 2000;
    min-width: 150px;
    display: flex;
    flex-direction: column;
}

.menu-item {
    padding: 0.8rem 1.2rem;
    cursor: pointer;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.9rem;
    transition: background 0.2s;
    border-bottom: 2px solid black;
}

.menu-item:last-child {
    border-bottom: none;
}

.menu-item:hover {
    background: var(--accent-3);
}
</style>
