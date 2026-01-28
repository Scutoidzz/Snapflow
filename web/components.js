class NeoButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const variant = this.getAttribute('variant') || 'primary';

        let bgColor = 'var(--card-bg)';
        if (variant === 'primary') bgColor = 'var(--accent-2)';
        if (variant === 'secondary') bgColor = 'var(--accent-1)';
        if (variant === 'accent') bgColor = 'var(--accent-3)';

        this.shadowRoot.innerHTML = `
            <style>
                button {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 1.2rem;
                    padding: 1rem 2rem;
                    border: 3px solid black; /* Hardcoded because vars might not pierce if not passed, but vars on :root work usually */
                    border: var(--border-width, 3px) solid black;
                    background-color: ${bgColor};
                    box-shadow: var(--shadow-offset, 4px) var(--shadow-offset, 4px) 0px 0px black;
                    cursor: pointer;
                    font-weight: 700;
                    text-transform: uppercase;
                    transition: all 0.15s ease-in-out;
                    color: black;
                }
                button:hover {
                    transform: translate(-2px, -2px);
                    box-shadow: 6px 6px 0px 0px black;
                }
                button:active {
                    transform: translate(2px, 2px);
                    box-shadow: 0px 0px 0px 0px black;
                }
            </style>
            <button part="button">
                <slot></slot>
            </button>
        `;
    }
}

class NeoCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        let width = this.getAttribute('width');

        let hostStyle = '';
        if (width) {
            if (!isNaN(width)) {
                width = `${width}px`;
            }
            hostStyle = `width: ${width};`;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    ${hostStyle}
                }
                div {
                    background-color: white;
                    border: var(--border-width, 3px) solid black;
                    box-shadow: 8px 8px 0px 0px black;
                    padding: 24px;
                    height: 100%;
                    width: 100%;
                    box-sizing: border-box;
                }
            </style>
            <div>
                <slot></slot>
            </div>
        `;
    }
}

class NeoInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const placeholder = this.getAttribute('placeholder') || '';
        const type = this.getAttribute('type') || 'text';

        this.shadowRoot.innerHTML = `
            <style>
                input {
                    display: block;
                    width: 100%;
                    padding: 12px;
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 1rem;
                    border: var(--border-width, 3px) solid black;
                    background: white;
                    box-shadow: 4px 4px 0px 0px black;
                    outline: none;
                    transition: box-shadow 0.2s;
                    color: black;
                }
                input:focus {
                    box-shadow: 6px 6px 0px 0px black;
                }
            </style>
            <input type="${type}" placeholder="${placeholder}" part="input">
        `;
    }
}

class NeoBadge extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                span {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px 12px;
                    background-color: var(--accent-3);
                    border: 2px solid black;
                    font-weight: bold;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    color: black;
                    min-height: 32px;
                }
            </style>
            <span><slot></slot></span>
        `;
    }
}

class NeoScroller extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const speed = this.getAttribute('speed') || '20s';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    overflow: hidden;
                    width: 100%;
                }
                .scroller {
                    display: flex;
                    width: max-content;
                    animation: scroll ${speed} linear infinite;
                }
                .scroller:hover {
                    animation-play-state: paused;
                }
                ::slotted(*) {
                    margin: 0 1rem;
                }
                @keyframes scroll {
                    to {
                        transform: translateX(-50%);
                    }
                }
            </style>
            <div class="scroller">
                <slot></slot>
                <slot></slot>
            </div>
        `;
    }
}

class NeoSlider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const min = this.getAttribute('min') || '0';
        const max = this.getAttribute('max') || '100';
        const value = this.getAttribute('value') || '50';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                input[type=range] {
                    -webkit-appearance: none;
                    width: 100%;
                    background: transparent;
                }
                input[type=range]:focus {
                    outline: none;
                }
                /* Webkit (Chrome, Safari, Edge) */
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 24px;
                    width: 24px;
                    background: var(--accent-3);
                    border: 3px solid black;
                    cursor: pointer;
                    margin-top: -9px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
                    box-shadow: 2px 2px 0px 0px black;
                    transition: transform 0.1s;
                }
                input[type=range]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: white;
                    border: 3px solid black;
                }
                /* Firefox */
                input[type=range]::-moz-range-thumb {
                    height: 24px;
                    width: 24px;
                    background: var(--accent-3);
                    border: 3px solid black;
                    cursor: pointer;
                    box-shadow: 2px 2px 0px 0px black;
                }
                input[type=range]::-moz-range-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: white;
                    border: 3px solid black;
                }
            </style>
            <input type="range" min="${min}" max="${max}" value="${value}">
        `;
    }
}

/* Segmented Button ------------------------------------------------------------ */
class NeoSegment extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const options = (this.getAttribute('options') || 'Option 1,Option 2').split(',');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    font-family: 'Space Grotesk', sans-serif;
                }
                .container {
                    display: inline-flex;
                    border: var(--border-width, 3px) solid black;
                    background: white;
                    box-shadow: 4px 4px 0px 0px black;
                    overflow: hidden; /* Ensures corners match if we had radius, but here it's square */
                }
                .option {
                    padding: 0.5rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: background 0.2s;
                    border-right: var(--border-width, 3px) solid black;
                    user-select: none;
                }
                .option:last-child {
                    border-right: none;
                }
                .option:hover {
                    background: #eee;
                }
                .option.selected {
                    background: var(--accent-2); /* Teal */
                }
            </style>
            <div class="container">
                ${options.map((opt, index) => `
                    <div class="option ${index === 0 ? 'selected' : ''}" data-value="${opt.trim()}">
                        ${opt.trim()}
                    </div>
                `).join('')}
            </div>
        `;

        this.shadowRoot.querySelectorAll('.option').forEach(el => {
            el.addEventListener('click', (e) => {
                this.shadowRoot.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
                this.dispatchEvent(new CustomEvent('change', { detail: e.target.getAttribute('data-value') }));
            });
        });
    }
}

/* EOF - Segmented button ----------------------------------------------------------- */

customElements.define('neo-button', NeoButton);
class NeoSelect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const options = (this.getAttribute('options') || '').split(',');
        const placeholder = this.getAttribute('placeholder') || 'Select...';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Space Grotesk', sans-serif;
                    position: relative;
                }
                .select-trigger {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: white;
                    border: var(--border-width, 3px) solid black;
                    padding: 12px;
                    cursor: pointer;
                    box-shadow: 4px 4px 0px 0px black;
                    font-weight: bold;
                    transition: all 0.2s;
                    user-select: none;
                }
                .select-trigger:hover {
                    background-color: #eee;
                }
                .select-trigger:active {
                    transform: translate(2px, 2px);
                    box-shadow: 2px 2px 0px 0px black;
                }
                .chevron {
                    width: 0; 
                    height: 0; 
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 6px solid black;
                    margin-left: 10px;
                }
                .options-container {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background: white;
                    border: var(--border-width, 3px) solid black;
                    border-top: none;
                    box-shadow: 4px 4px 0px 0px black;
                    z-index: 100;
                    margin-top: 2px;
                }
                .options-container.open {
                    display: block;
                }
                .option {
                    padding: 10px 12px;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 2px solid #eee;
                }
                .option:last-child {
                    border-bottom: none;
                }
                .option:hover {
                    background-color: var(--accent-3, #ffe66d);
                }
            </style>
            <div class="select-trigger" id="trigger">
                <span id="label">${placeholder}</span>
                <div class="chevron"></div>
            </div>
            <div class="options-container" id="options">
                ${options.map(opt => `<div class="option" data-value="${opt.trim()}">${opt.trim()}</div>`).join('')}
            </div>
        `;

        const trigger = this.shadowRoot.getElementById('trigger');
        const optionsContainer = this.shadowRoot.getElementById('options');
        const label = this.shadowRoot.getElementById('label');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsContainer.classList.toggle('open');
        });

        this.shadowRoot.querySelectorAll('.option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = e.target.dataset.value;
                label.textContent = value;
                optionsContainer.classList.remove('open');
                this.dispatchEvent(new CustomEvent('change', { detail: value }));
            });
        });

        // Close on click outside
        document.addEventListener('click', () => {
            optionsContainer.classList.remove('open');
        });
    }
}

customElements.define('neo-select', NeoSelect);
customElements.define('neo-card', NeoCard);
customElements.define('neo-input', NeoInput);
customElements.define('neo-badge', NeoBadge);
customElements.define('neo-scroller', NeoScroller);
customElements.define('neo-slider', NeoSlider);
class NeoDate extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                input {
                    display: block;
                    width: 100%;
                    padding: 12px;
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 1rem;
                    border: var(--border-width, 3px) solid black;
                    background: white;
                    box-shadow: 4px 4px 0px 0px black;
                    outline: none;
                    transition: box-shadow 0.2s;
                    color: black;
                }
                input:focus {
                    box-shadow: 6px 6px 0px 0px black;
                }
            </style>
            <input type="datetime-local">
        `;
    }
}

customElements.define('neo-date', NeoDate);

class NeoTime extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                input {
                    display: block;
                    width: 100%;
                    padding: 12px;
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 1rem;
                    border: var(--border-width, 3px) solid black;
                    background: white;
                    box-shadow: 4px 4px 0px 0px black;
                    outline: none;
                    transition: box-shadow 0.2s;
                    color: black;
                }
                input:focus {
                    box-shadow: 6px 6px 0px 0px black;
                }
            </style>
            <input type="time">
        `;
    }
}

customElements.define('neo-time', NeoTime);
customElements.define('neo-segment', NeoSegment);
