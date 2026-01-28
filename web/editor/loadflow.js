/**
 * Snapflow Loader – parses .snapf files and restores editor state.
 * The module is intentionally written in ES‑module style with
 * modern syntax (`const/let`, arrow functions, destructuring,
 * template literals). All public APIs are documented with JSDoc.
 */

class SnapflowLoader {
  constructor() {
    /** @type {Record<string, {type:string,label:string,variant:string|null}>} */
    this.blockMappings = {
      startup: { type: 'trigger', label: 'Trigger 1', variant: null },
      schedule: { type: 'trigger', label: 'Trigger 2', variant: null },
      webhook: { type: 'trigger', label: 'Trigger 3', variant: null },
      terminal: { type: 'action', label: 'Action 1', variant: 'secondary' },
      AI: { type: 'action', label: 'Connect to AI', variant: 'secondary' },
      http: { type: 'action', label: 'Action 3', variant: 'secondary' },
    };
  }

  /**
   * Parses raw .snapf content into a structured object.
   * @param {string} content
   * @returns {{metadata:object,flows:object[],blocks:object[]}}
   */
  parse(content) {
    const result = { metadata: {}, flows: [], blocks: [] };
    const lines = content.split('\n');
    let inBlock = false;
    let inFlow = false;
    let currentBlock = null;
    let currentFlow = null;
    let currentPosition = { x: 50, y: 50 };
    const blockStack = [];

    for (const line of lines) {
      const trimmed = line.trim();

      /* ---------- metadata ---------- */
      if (trimmed.startsWith('- ') && !inBlock && !inFlow) {
        const parts = trimmed.substring(2).split(' - ');
        if (parts.length === 1) {
          result.metadata.type = parts[0];
        } else {
          const [key, ...rest] = parts;
          result.metadata[key.toLowerCase()] = rest.join(' - ');
        }
        continue;
      }

      /* ---------- position comment ---------- */
      const posMatch = trimmed.match(/<!--\s*Position:\s*(-?\d+),\s*(-?\d+)\s*-->/);
      if (posMatch) {
        currentPosition = {
          x: parseInt(posMatch[1], 10),
          y: parseInt(posMatch[2], 10),
        };
        continue;
      }

      /* ---------- flow ---------- */
      if (trimmed === '<flow>') {
        inFlow = true;
        currentFlow = { position: { ...currentPosition }, blocks: [] };
        continue;
      }
      if (trimmed === '</flow>') {
        if (currentFlow && currentFlow.blocks.length > 0) {
          result.flows.push(currentFlow);
        }
        inFlow = false;
        currentFlow = null;
        currentPosition.y += 120;
        continue;
      }

      /* ---------- block start ---------- */
      const blockStart = trimmed.match(/^<block\s+(\w+)>$/);
      if (blockStart) {
        const blockType = blockStart[1];
        currentBlock = {
          snapfType: blockType,
          content: {},
          position: { ...currentPosition },
        };
        inBlock = true;
        blockStack.push(blockType);
        continue;
      }

      /* ---------- block end ---------- */
      const blockEnd = trimmed.match(/^<\/block\s+(\w+)>$/);
      if (blockEnd && inBlock) {
        const blockType = blockEnd[1];
        if (blockStack[blockStack.length - 1] === blockType) {
          blockStack.pop();
          const mapping = this.blockMappings[currentBlock.snapfType] || {
            type: 'trigger',
            label: currentBlock.snapfType,
            variant: null,
          };
          const blockData = {
            ...mapping,
            snapfType: currentBlock.snapfType,
            content: currentBlock.content,
            position: currentBlock.position,
          };
          if (inFlow && currentFlow) {
            currentFlow.blocks.push(blockData);
          } else {
            result.blocks.push(blockData);
          }
          currentBlock = null;
          inBlock = blockStack.length > 0;
          if (!inFlow) {
            currentPosition.y += 80;
          }
        }
        continue;
      }

      /* ---------- block content ---------- */
      if (inBlock && currentBlock) {
        const contentMatch = trimmed.match(/^<(\w+)>(.*)<\/\1>$/);
        if (contentMatch) {
          const [, key, value] = contentMatch;
          currentBlock.content[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Restores the UI from parsed data.
   * @param {{metadata:object,flows:object[],blocks:object[]}} parsed
   * @returns {boolean}
   */
  restore(parsed) {
    const dragboard = document.getElementById('dragboard');
    if (!dragboard) {
      console.error('Dragboard not found');
      return false;
    }

    // Clear existing nodes and connections
    dragboard.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'connections-layer';
    Object.assign(svg.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'visible',
    });
    dragboard.appendChild(svg);
    window.snapflowConnections = [];

    const applyContent = (wrapper, content) => {
      if (!content || !Object.keys(content).length) return;
      const btn = wrapper.querySelector('neo-button');
      if (btn) btn.dataset.content = JSON.stringify(content);
    };

    // Standalone blocks
    for (const block of parsed.blocks) {
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

    // Flows – sequentially connected nodes
    for (const flow of parsed.flows) {
      if (!flow.blocks.length) continue;
      let prevId = null;
      flow.blocks.forEach((block, idx) => {
        const gap = 250;
        const x = (flow.position.x || 50) + idx * gap;
        const y = flow.position.y || 50;
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
              window.snapflowConnections.push({ from: prevId, to: id });
            }
            prevId = id;
          }
        }
      });
    }

    console.log('Restored', {
      blocks: parsed.blocks.length,
      flows: parsed.flows.length,
      metadata: parsed.metadata,
    });

    if (typeof window.drawConnections === 'function') window.drawConnections();
    return true;
  }

  /** Load from raw text */
  loadFromContent(content) {
    return this.restore(this.parse(content));
  }

  /** Load from file input */
  loadFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const success = this.loadFromContent(reader.result);
          resolve(success);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}

export const snapflowLoader = new SnapflowLoader();

export function loadFlowFromSNAPF() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.snapf';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await snapflowLoader.loadFromFile(file);
      console.log('Successfully loaded:', file.name);
    } catch (err) {
      console.error('Failed to load file:', err);
      alert('Failed to load .snapf file: ' + err.message);
    }
  };
  input.click();
}

export const loadFlowFromContent = snapflowLoader.loadFromContent;
export const parseSnapf = snapflowLoader.parse;
