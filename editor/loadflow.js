/**
 * Snapflow Load System
 * Parses .snapf files and restores editor state
 */

class SnapflowLoader {
    constructor() {
        this.blockMappings = {
            'startup': { type: 'trigger', label: 'Trigger 1', variant: null },
            'schedule': { type: 'trigger', label: 'Trigger 2', variant: null },
            'webhook': { type: 'trigger', label: 'Trigger 3', variant: null },
            'terminal': { type: 'action', label: 'Action 1', variant: 'secondary' },
            'AI': { type: 'action', label: 'Connect to AI', variant: 'secondary' },
            'http': { type: 'action', label: 'Action 3', variant: 'secondary' }
        };
    }

    /**
     * Parse .snapf file content
     */
    parse(content) {
        const result = {
            metadata: {},
            flows: [],
            blocks: []
        };

        const lines = content.split('\n');
        let inBlock = false;
        let inFlow = false;
        let currentBlock = null;
        let currentFlow = null;
        let currentPosition = { x: 50, y: 50 };
        let blockStack = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Parse metadata (lines starting with -)
            if (trimmed.startsWith('- ') && !inBlock && !inFlow) {
                const parts = trimmed.substring(2).split(' - ');
                if (parts.length === 1) {
                    result.metadata.type = parts[0];
                } else {
                    const key = parts[0].toLowerCase();
                    const value = parts.slice(1).join(' - ');
                    result.metadata[key] = value;
                }
                continue;
            }

            // Parse position comments
            const posMatch = trimmed.match(/<!--\s*Position:\s*(-?\d+),\s*(-?\d+)\s*-->/);
            if (posMatch) {
                currentPosition = {
                    x: parseInt(posMatch[1]),
                    y: parseInt(posMatch[2])
                };
                continue;
            }

            // Flow start
            if (trimmed === '<flow>') {
                inFlow = true;
                currentFlow = {
                    position: { ...currentPosition },
                    blocks: []
                };
                continue;
            }

            // Flow end
            if (trimmed === '</flow>') {
                if (currentFlow && currentFlow.blocks.length > 0) {
                    result.flows.push(currentFlow);
                }
                inFlow = false;
                currentFlow = null;
                currentPosition.y += 120; // Offset next flow
                continue;
            }

            // Block start
            const blockStartMatch = trimmed.match(/^<block\s+(\w+)>$/);
            if (blockStartMatch) {
                const blockType = blockStartMatch[1];
                currentBlock = {
                    snapfType: blockType,
                    content: {},
                    position: { ...currentPosition }
                };
                inBlock = true;
                blockStack.push(blockType);
                continue;
            }

            // Block end
            const blockEndMatch = trimmed.match(/^<\/block\s+(\w+)>$/);
            if (blockEndMatch && inBlock) {
                const blockType = blockEndMatch[1];
                if (blockStack[blockStack.length - 1] === blockType) {
                    blockStack.pop();

                    // Map to UI element type
                    const mapping = this.blockMappings[currentBlock.snapfType] || {
                        type: 'trigger',
                        label: currentBlock.snapfType,
                        variant: null
                    };

                    const blockData = {
                        ...mapping,
                        snapfType: currentBlock.snapfType,
                        content: currentBlock.content,
                        position: currentBlock.position
                    };

                    if (inFlow && currentFlow) {
                        currentFlow.blocks.push(blockData);
                    } else {
                        result.blocks.push(blockData);
                    }

                    currentBlock = null;
                    inBlock = blockStack.length > 0;

                    if (!inFlow) {
                        currentPosition.y += 80; // Offset next standalone block
                    }
                }
                continue;
            }

            // Parse block content (like <command>ls -la</command>)
            if (inBlock && currentBlock) {
                const contentMatch = trimmed.match(/^<(\w+)>(.*)<\/\1>$/);
                if (contentMatch) {
                    currentBlock.content[contentMatch[1]] = contentMatch[2];
                }
            }
        }

        return result;
    }

    /**
     * Restore the dragboard from parsed data
     */
    restore(parsedData) {
        const dragboard = document.getElementById('dragboard');
        if (!dragboard) {
            console.error('Dragboard not found');
            return false;
        }

        // Clear existing content
        dragboard.innerHTML = '';
        // Add SVG layer (snapflw.js drawConnections will need it, but we can add it here to be safe)
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'connections-layer';
        Object.assign(svg.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '0',
            overflow: 'visible'
        });
        dragboard.appendChild(svg);

        // Reset connections
        window.snapflowConnections = [];

        // Helper to apply content
        const applyContent = (wrapper, content) => {
            if (!content || Object.keys(content).length === 0) return;
            const btn = wrapper.querySelector('neo-button');
            if (btn) btn.dataset.content = JSON.stringify(content);
        };

        // Restore standalone blocks
        for (const block of parsedData.blocks) {
            if (window.createNodeWrapper) {
                const wrapper = window.createNodeWrapper(
                    block.type,
                    block.label,
                    block.variant,
                    block.position.x,
                    block.position.y
                );
                applyContent(wrapper, block.content);
            }
        }

        // Restore flows (grouped blocks -> connected nodes)
        for (const flow of parsedData.flows) {
            if (flow.blocks.length === 0) continue;

            let prevId = null;

            flow.blocks.forEach((block, index) => {
                const gap = 250;
                const x = (flow.position.x || 50) + (index * gap);
                const y = (flow.position.y || 50);

                if (window.createNodeWrapper) {
                    const wrapper = window.createNodeWrapper(
                        block.type,
                        block.label,
                        block.variant,
                        x,
                        y
                    );
                    applyContent(wrapper, block.content);

                    const btn = wrapper.querySelector('neo-button');
                    if (btn) {
                        const id = btn.id;
                        if (prevId) {
                            window.snapflowConnections.push({
                                from: prevId,
                                to: id
                            });
                        }
                        prevId = id;
                    }
                }
            });
        }

        console.log('Restored:', {
            blocks: parsedData.blocks.length,
            flows: parsedData.flows.length,
            metadata: parsedData.metadata
        });

        // Draw the connections
        if (typeof window.drawConnections === 'function') {
            window.drawConnections();
        }

        return true;
    }

    /**
     * Load from file content
     */
    loadFromContent(content) {
        const parsed = this.parse(content);
        return this.restore(parsed);
    }

    /**
     * Load from file input
     */
    loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const success = this.loadFromContent(content);
                    resolve(success);
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
}

// Global instance
const snapflowLoader = new SnapflowLoader();

/**
 * Open file picker and load a .snapf file
 */
function loadFlowFromSNAPF() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.snapf';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await snapflowLoader.loadFromFile(file);
                console.log('Successfully loaded:', file.name);
            } catch (err) {
                console.error('Failed to load file:', err);
                alert('Failed to load .snapf file: ' + err.message);
            }
        }
    };

    input.click();
}

/**
 * Load from text content directly
 */
function loadFlowFromContent(content) {
    return snapflowLoader.loadFromContent(content);
}

/**
 * Parse content without restoring (for inspection)
 */
function parseSnapf(content) {
    return snapflowLoader.parse(content);
}

/**
 * Export for ES modules if needed
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnapflowLoader, loadFlowFromSNAPF, loadFlowFromContent, parseSnapf };
}
