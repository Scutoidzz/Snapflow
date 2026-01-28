const AI_PROVIDERS = {
    'Mistral': ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    'OpenAI': ['gpt-4o-latest', 'gpt-5-turbo-latest', 'gpt-o1'],
    'Gemini': ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    'Anthropic': ['claude-4.5-haiku', 'claude-4.5-sonnet', 'claude-4-haiku'],
    'Hack AI': ['qwen-32b'],
    'OpenRouter': ['auto']
};

function customizeApiMenu() {
    const menu = document.createElement('neo-card');
    menu.style.minWidth = '550px';
    menu.style.maxWidth = '600px';

    menu.innerHTML = `
        <h1>AI Settings</h1>
        <neo-select id="provider-select" placeholder="Select AI Provider" 
            options="${Object.keys(AI_PROVIDERS).join(',')}">
        </neo-select>

        <br>

        <div id="model-container">
            <neo-select id="model-select" placeholder="Select Model"
                options="Select a provider first...">
            </neo-select>
        </div>
        
        <div id="custom-model-container" style="display: none; margin-top: 10px;">
             <neo-input id="custom-model-input" placeholder="Enter  model ID"></neo-input>
        </div>

        <div style="margin-top: 5px; text-align: right;">
            <a href="#" id="toggle-custom" style="font-size: 0.8rem; color: #666; font-weight: bold;">+ Custom Model</a>
        </div>

        <br>

        <neo-input placeholder="API Key" type="password" style="width: 550px"></neo-input>
        
        <br>

        <neo-button variant="primary" style="width: 100%">Save Configuration</neo-button>
    `;

    // Logic for dynamic updates
    setTimeout(() => {
        const providerSelect = menu.querySelector('#provider-select');
        const modelContainer = menu.querySelector('#model-container');
        const customModelContainer = menu.querySelector('#custom-model-container');
        const toggleCustom = menu.querySelector('#toggle-custom');

        // Handle Provider Change
        providerSelect.addEventListener('change', (e) => {
            const provider = e.detail;
            const models = AI_PROVIDERS[provider] || [];

            // Re-render model select
            modelContainer.innerHTML = `
                <neo-select id="model-select" placeholder="Select Model"
                    options="${models.join(',')}">
                </neo-select>
            `;
        });

        // Handle Custom Model Toggle
        toggleCustom.addEventListener('click', (e) => {
            e.preventDefault();
            if (customModelContainer.style.display === 'none') {
                customModelContainer.style.display = 'block';
                modelContainer.style.display = 'none';
                toggleCustom.textContent = 'Use Preset Model';
            } else {
                customModelContainer.style.display = 'none';
                modelContainer.style.display = 'block';
                toggleCustom.textContent = '+ Custom Model';
            }
        });
    }, 0);

    return menu;
}

