/* AI Model providers ----------------------------------------------------- */
const AI_PROVIDERS = {
  Mistral: ['mistral-large-3', 'mistral-medium-3', 'ministral-3'],
  OpenAI: ['gpt-5.2-chat-latest', 'gpt-5.2-instant', 'gpt-5', 'gpt-oss-120b'],
  Gemini: ['gemini-3-pro', 'gemini-2.5-pro', 'gemini-2.5-flash'],
  Anthropic: ['claude-opus-4.5', 'claude-sonnet-4.5', 'claude-cowork'],
  'DeepSeek': ['deepseek-v3.2', 'deepseek-v3.2-speciale'],
  'Meta': ['llama-4-scout', 'llama-4-maverick', 'llama-3.3-70b-instruct'],
  'Hack Club': [
    'qwen-3-32b',
    'gpt-oss-120b',
    'kimi-k2-thinking',
    'gpt-5-mini',
    'deepseek-v3.2-exp'
  ],
  OpenRouter: ['auto'],
};
/* EOF - AI Model providers ----------------------------------------------------- */

/**
 * Creates the AI Settings dialog.
 * @returns {HTMLElement} The configured card element.
 */
const customizeApiMenu = () => {
  const menu = document.createElement('neo-card');
  menu.style.minWidth = '550px';
  menu.style.maxWidth = '600px';

  const renderModelSelect = (models) => `
    <neo-select id="model-select" placeholder="Select Model"
      options="${models.join(',')}"
    >
    </neo-select>`;

  menu.innerHTML = `
    <h1>AI Settings</h1>
    <neo-select id="provider-select" placeholder="Select AI Provider"
      options="${Object.keys(AI_PROVIDERS).join(',')}"
    >
    </neo-select>

    <br>

    <div id="model-container">${renderModelSelect(['Select a provider'])}</div>

    <div id="custom-model-container" style="display:none; margin-top:10px;">
      <neo-input id="custom-model-input" placeholder="Enter model name"></neo-input>
    </div>

    <div style="margin-top:5px; text-align:right;">
      <a href="#" id="toggle-custom" style="font-size:.8rem; color:#666; font-weight:bold;">+ Custom Model</a>
    </div>

    <br>

    <neo-input placeholder="API Key" type="password" style="width:550px"></neo-input>
    <br>

    <neo-button variant="primary" style="width:100%">Save Configuration</neo-button>
  `;

  const providerSelect = menu.querySelector('#provider-select');
  const modelContainer = menu.querySelector('#model-container');
  const customModelContainer = menu.querySelector('#custom-model-container');
  const toggleCustom = menu.querySelector('#toggle-custom');

  providerSelect.addEventListener('change', (e) => {
    const provider = e.detail;
    const models = AI_PROVIDERS[provider] ?? [];
    modelContainer.innerHTML = renderModelSelect(models);
  });

  toggleCustom.addEventListener('click', (e) => {
    e.preventDefault();
    const visible = customModelContainer.style.display === 'none';
    customModelContainer.style.display = visible ? 'block' : 'none';
    modelContainer.style.display = visible ? 'none' : 'block';
    toggleCustom.textContent = visible ? 'Use Preset Model' : '+ Custom Model';
  });

  return menu;
};

/**
 * Creates the Time & Date Settings dialog.
 * @returns {HTMLElement} The configured card element.
 */
const customizeTimeDate = () => {
  const menu = document.createElement('neo-card');
  menu.style.minWidth = '550px';
  menu.style.maxWidth = '600px';

  const spacer = '<div style="margin-bottom:1rem;"></div>';

  menu.innerHTML = `
    <h1>Time & Date Settings</h1>
    ${spacer}
    <neo-input placeholder="Timezone (e.g. UTC, PST)" style="width:100%"></neo-input>
    ${spacer}
    <label style="font-weight:bold; display:block; margin-bottom:.5rem;">Start Date</label>
    <neo-date></neo-date>
    ${spacer}
    <label style="font-weight:bold; display:block; margin-bottom:.5rem;">Trigger Time</label>
    <neo-time></neo-time>
    ${spacer}
    <neo-button variant="primary" style="width:100%">Save Configuration</neo-button>
  `;

  return menu;
};

const customizeNotification = () => {
  const menu = document.createElement('neo-card');
  menu.style.minWidth = '550px';
  menu.style.maxWidth = '600px';

  const spacer = '<div style="margin-bottom:1rem;"></div>';

  menu.innerHTML = `
    <h1>Notification Settings</h1>
    ${spacer}
    <neo-input placeholder="Notification Message" style="width:100%"></neo-input>
    ${spacer}
    <neo-button variant="primary" style="width:100%">Save</neo-button>
  `;

  return menu;
};

const customizeFile = () => {
  const menu = document.createElement('neo-card');
  menu.style.minWidth = '550px';
  menu.style.maxWidth = '600px';

  const spacer = '<div style="margin-bottom:1rem;"></div>';

  menu.innerHTML = `
    <h1>CRUD Settings</h1>
    ${spacer}
    <neo-input placeholder="CRUD Settings" style="width:100%"></neo-input>
    ${spacer}
    <neo-button variant="primary" style="width:100%">Save</neo-button>
  `;

  return menu;
};

const terminalCommand = () => {
  const menu = document.createElement('neo-card');
  menu.style.minWidth = '550px';
  menu.style.maxWidth = '600px';

  const spacer = '<div style="margin-bottom:1rem;"></div>';

  menu.innerHTML = `
    <h1>Terminal Command Settings</h1>
    ${spacer}
    <neo-input placeholder="Terminal Command" style="width:100%"></neo-input>
    ${spacer}
    <neo-segment options="Sudo,Normal"></neo-segment>
    ${spacer}
    <neo-button variant="primary" style="width:100%">Save</neo-button>
  `;

  return menu;
};

const customizeBattery = () => {
  const menu = document.createElement('neo-card');
  menu.style.minWidth = '550px';
  menu.style.maxWidth = '600px';

  const spacer = '<div style="margin-bottom:1rem;"></div>';

  menu.innerHTML = `
    <h1>Battery Settings</h1>
    ${spacer}
    <label style="font-weight:bold; display:block; margin-bottom:.5rem;">Trigger Level</label>
    <neo-slider min="0" max="100" value="20"></neo-slider>
    ${spacer}
    <neo-segment options="Below,Above,Equals"></neo-segment>
    ${spacer}
    <neo-button variant="primary" style="width:100%">Save</neo-button>
  `;

  return menu;
};

const customizeCustomApi = () => {
  const menu = document.createElement('neo-card');
  menu.style.minWidth = '550px';
  menu.style.maxWidth = '600px';

  const spacer = '<div style="margin-bottom:1rem;"></div>';

  menu.innerHTML = `
    <h1>Custom API Settings</h1>
    ${spacer}
    <neo-input placeholder="URL endpoint" style="width:100%"></neo-input>
    ${spacer}
    <neo-segment options="GET,POST,PUT,DELETE"></neo-segment>
    ${spacer}
    <neo-input placeholder="Request Body" style="width:100%"></neo-input>
    ${spacer}
    <neo-input placeholder="Request Headers" style="width:100%"></neo-input>
    ${spacer}
    <neo-button variant="primary" style="width:100%">Save</neo-button>
  `;

  return menu;
};

window.customizeApiMenu = customizeApiMenu;
window.customizeTimeDate = customizeTimeDate;
window.customizeNotification = customizeNotification;
window.customizeFile = customizeFile;
window.terminalCommand = terminalCommand;
window.customizeBattery = customizeBattery;

