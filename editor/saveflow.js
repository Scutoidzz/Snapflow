/**
 * Snapflow Save System
 * Serializes the editor state to .snapf format
 */

class SnapflowSaver {
    constructor() {
        this.authorName = localStorage.getItem('snapflow_author') || null;
    }

    /**
     * Prompt for author name (only once)
     */
    promptAuthor() {
        if (!this.authorName) {
            const name = prompt("What is your name? (You can only set this once)");
            if (name && name.trim()) {
                this.authorName = name.trim();
                localStorage.setItem('snapflow_author', this.authorName);
            } else {
                this.authorName = "Unknown";
            }
        }
        return this.authorName;
    }

    collectBlocks() {
        const dragboard = document.getElementById('dragboard');
        if (!dragboard) return [];

        const nodes = Array.from(dragboard.querySelectorAll('neo-button'));
        const connections = window.snapflowConnections || [];

        const nodeMap = new Map();
        nodes.forEach(node => {
            let x = parseInt(node.style.left) || 0;
            let y = parseInt(node.style.top) || 0;

            // Check if wrapped
            if (node.parentElement && node.parentElement.classList.contains('node-wrapper')) {
                x = parseInt(node.parentElement.style.left) || 0;
                y = parseInt(node.parentElement.style.top) || 0;
            }

            nodeMap.set(node.id, {
                type: node.getAttribute('data-type'),
                label: node.getAttribute('data-label'),
                variant: node.getAttribute('variant') || 'default',
                id: node.id,
                position: { x, y },
                visited: false,
                content: node.dataset.content ? JSON.parse(node.dataset.content) : {}
            });
        });

        const blocks = [];

        // Build adjacency list
        const outgoing = {};
        const incoming = {};

        connections.forEach(conn => {
            if (!outgoing[conn.from]) outgoing[conn.from] = [];
            outgoing[conn.from].push(conn.to);

            if (!incoming[conn.to]) incoming[conn.to] = [];
            incoming[conn.to].push(conn.from);
        });

        // Helper to trace a flow
        const traceFlow = (startId) => {
            const flow = [];
            let currentId = startId;

            while (currentId) {
                const node = nodeMap.get(currentId);
                if (!node || node.visited) break;

                node.visited = true;
                flow.push(node);

                // Move to next
                // If multiple branches, we only follow the first one for the linear .snapf format
                // Ideal for future: support branching in .snapf
                const nextIds = outgoing[currentId];
                if (nextIds && nextIds.length > 0) {
                    currentId = nextIds[0];
                } else {
                    currentId = null;
                }
            }
            return flow;
        };

        // 1. Find roots (nodes with no incoming connections)
        nodes.forEach(node => {
            if (nodeMap.get(node.id).visited) return;

            // If it has no incoming connections, it's a start of a flow
            if (!incoming[node.id] || incoming[node.id].length === 0) {
                const flowNodes = traceFlow(node.id);
                if (flowNodes.length > 1) {
                    // It's a flow
                    blocks.push({
                        isGroup: true,
                        position: flowNodes[0].position,
                        blocks: flowNodes
                    });
                } else if (flowNodes.length === 1) {
                    // Standalone
                    blocks.push({
                        isGroup: false,
                        ...flowNodes[0]
                    });
                }
            }
        });

        // 2. Handle cycles or remaining disjoint parts (if any not visited)
        nodes.forEach(node => {
            const data = nodeMap.get(node.id);
            if (!data.visited) {
                // Must be part of a cycle or complex structure we missed
                // Treat as new flow start
                const flowNodes = traceFlow(node.id);
                if (flowNodes.length > 1) {
                    blocks.push({
                        isGroup: true,
                        position: flowNodes[0].position,
                        blocks: flowNodes
                    });
                } else if (flowNodes.length === 1) {
                    blocks.push({
                        isGroup: false,
                        ...flowNodes[0]
                    });
                }
            }
        });

        return blocks;
    }

    /**
     * Convert a block type/label to a snapf block representation
     */
    blockToSnapf(type, label, indent = '') {
        const blockMappings = {
            'trigger': {
                'Time': '<block startup>\n</block startup>',
                'File': '<block file>\n    <if></if>\n<crud></crud>\n</block file>',
                'Battery': '<block battery>\n    <at></at>\n</block battery>'
            },
            'action': {
                'Send Notification': '<block notify>\n    <text></text>\n</block notify>',
                'Connect to AI': '<block AI>\n    <prompt></prompt>\n    <model></model>\n    <api_key></api_key>\n</block AI>',
                'Custom API': '<block http>\n    <url></url>\n    <method>GET</method>\n    <api_key></api_key>\n</block http>'
            }
        };

        // Try to find a mapping
        if (blockMappings[type] && blockMappings[type][label]) {
            return blockMappings[type][label]
                .split('\n')
                .map(line => indent + line)
                .join('\n');
        }

        // Default fallback - generic block
        const safeLabel = label.toLowerCase().replace(/\s+/g, '_');
        return `${indent}<block ${safeLabel}>\n${indent}</block ${safeLabel}>`;
    }

    /**
     * Generate the .snapf file content
     */
    generateSnapf(flowName = 'Untitled Flow') {
        const author = this.promptAuthor();
        const blocks = this.collectBlocks();

        let content = '';

        // Header
        content += '- Snapflow\n';
        content += `- Author - ${author}\n`;
        content += `- Name - ${flowName}\n`;
        content += `- Created - ${new Date().toDateString()}\n`;
        content += '\n';

        // Process blocks
        for (const item of blocks) {
            if (item.isGroup) {
                // It's a connected group (trigger + action flow)
                content += '<flow>\n';
                content += `    <!-- Position: ${item.position.x}, ${item.position.y} -->\n`;

                for (const block of item.blocks) {
                    content += this.blockToSnapf(block.type, block.label, '    ');
                    content += '\n';
                }

                content += '</flow>\n\n';
            } else {
                // Single standalone block
                content += `<!-- Position: ${item.position.x}, ${item.position.y} -->\n`;
                content += this.blockToSnapf(item.type, item.label, '');
                content += '\n\n';
            }
        }

        return content;
    }

    /**
     * Save to file (triggers download)
     */
    saveToFile(filename = `${flowName}.snapf`) {
        const flowName = prompt('Enter a name for this flow:', 'My Flow') || 'Untitled Flow';
        const content = this.generateSnapf(flowName);

        // Save to browser history (localStorage)
        this.saveToHistory(flowName, content);

        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Saved to:', filename);
        return content;
    }

    /**
     * Save flow metadata to LocalStorage history
     */
    saveToHistory(name, content) {
        try {
            const history = JSON.parse(localStorage.getItem('recent_snapflows') || '[]');

            // Add new entry
            const entry = {
                name: name,
                date: new Date().toISOString(),
                content: content
            };

            // Unshift to beginning
            history.unshift(entry);

            // Keep max 20
            if (history.length > 20) history.pop();

            localStorage.setItem('recent_snapflows', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history', e);
        }
    }

    /**
     * Get the content without downloading (for preview or API use)
     */
    getContent(flowName = 'Untitled Flow') {
        return this.generateSnapf(flowName);
    }
}

// Global instance
const snapflowSaver = new SnapflowSaver();

/**
 * Save the current flow to a .snapf file
 * This is the main function to call from UI
 */
function saveFlowToSNAPF(customFilename = null) {
    const filename = customFilename || `snapfile_${Date.now()}.snapf`;
    return snapflowSaver.saveToFile(filename);
}

/**
 * Preview the .snapf content without saving
 */
function previewSnapf(flowName = 'Preview') {
    return snapflowSaver.getContent(flowName);
}

/**
 * Export for ES modules if needed
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnapflowSaver, saveFlowToSNAPF, previewSnapf };
}