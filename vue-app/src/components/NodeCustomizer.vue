<script setup>
import { ref, computed } from 'vue'
import NeoCard from './NeoCard.vue'
import NeoButton from './NeoButton.vue'
import NeoInput from './NeoInput.vue'
import NeoSelect from './NeoSelect.vue'
import NeoSegment from './NeoSegment.vue'
import NeoDate from './NeoDate.vue'
import NeoTime from './NeoTime.vue'
import NeoSlider from './NeoSlider.vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

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
}

// Form state
const formData = ref({})

// Initialize form defaults if needed, though mostly empty start for now
// In a real app, we'd load existing config from node.data

// Helpers
const isAI = computed(() => props.node.label.includes('AI') || props.node.label.includes('Connect'))
const isTime = computed(() => props.node.label.includes('Time') || props.node.label.includes('Schedule'))
const isNotification = computed(() => props.node.label.includes('Notification'))
const isFile = computed(() => props.node.label.includes('File') || props.node.label.includes('CRUD'))
const isBattery = computed(() => props.node.label.includes('Battery'))
const isTerminal = computed(() => props.node.label.includes('Terminal'))
const isCustomAPI = computed(() => props.node.label.includes('Custom API'))

// AI Specific
const selectedProvider = ref('')
const availableModels = computed(() => selectedProvider.value ? AI_PROVIDERS[selectedProvider.value] || [] : [])
const useCustomModel = ref(false)

function save() {
    // Save logic would go here, updating node.data
    // For now just close
    emit('save', formData.value)
    emit('close')
}
</script>

<template>
  <div class="customizer-overlay" @click.self="$emit('close')">
    <NeoCard class="customizer-card">
        
      <!-- AI Settings -->
      <div v-if="isAI">
        <h1>AI Settings</h1>
        <NeoSelect 
            placeholder="Select AI Provider" 
            :options="Object.keys(AI_PROVIDERS).join(',')"
            v-model="selectedProvider"
            style="margin-bottom: 1rem;"
        />
        
        <div v-if="!useCustomModel">
             <NeoSelect 
                placeholder="Select Model" 
                :options="availableModels.join(',')"
                v-model="formData.model"
                style="margin-bottom: 1rem;"
            />
        </div>
        <div v-else style="margin-bottom: 1rem;">
            <NeoInput placeholder="Enter model name" v-model="formData.customModel" />
        </div>

        <div style="margin-bottom: 1rem; text-align: right;">
            <a href="#" @click.prevent="useCustomModel = !useCustomModel" style="font-size: 0.8rem; color: #666; font-weight: bold;">
                {{ useCustomModel ? 'Use Preset Model' : '+ Custom Model' }}
            </a>
        </div>

        <NeoInput placeholder="API Key" type="password" v-model="formData.apiKey" style="margin-bottom: 1rem;" />
        <NeoButton variant="primary" style="width: 100%;" @click="save">Save Configuration</NeoButton>
      </div>

      <!-- Time Settings -->
      <div v-else-if="isTime">
        <h1>Time & Date Settings</h1>
        <div class="spacer"></div>
        <NeoInput placeholder="Timezone (e.g. UTC, PST)" v-model="formData.timezone" />
        <div class="spacer"></div>
        <label>Start Date</label>
        <NeoDate v-model="formData.startDate" />
        <div class="spacer"></div>
        <label>Trigger Time</label>
        <NeoTime v-model="formData.triggerTime" />
        <div class="spacer"></div>
        <NeoButton variant="primary" style="width: 100%;" @click="save">Save Configuration</NeoButton>
      </div>

      <!-- Notification -->
      <div v-else-if="isNotification">
        <h1>Notification Settings</h1>
        <div class="spacer"></div>
        <NeoInput placeholder="Notification Message" v-model="formData.message" />
        <div class="spacer"></div>
        <NeoButton variant="primary" style="width: 100%;" @click="save">Save</NeoButton>
      </div>

      <!-- File / CRUD -->
      <div v-else-if="isFile">
        <h1>CRUD Settings</h1>
        <div class="spacer"></div>
        <NeoInput placeholder="File Path / Settings" v-model="formData.filePath" />
        <div class="spacer"></div>
        <NeoButton variant="primary" style="width: 100%;" @click="save">Save</NeoButton>
      </div>

      <!-- Battery -->
      <div v-else-if="isBattery">
        <h1>Battery Settings</h1>
        <div class="spacer"></div>
        <label>Trigger Level: {{ formData.level || 20 }}%</label>
        <NeoSlider min="0" max="100" v-model="formData.level" />
        <div class="spacer"></div>
        <NeoSegment options="Below,Above,Equals" v-model="formData.operator" />
        <div class="spacer"></div>
        <NeoButton variant="primary" style="width: 100%;" @click="save">Save</NeoButton>
      </div>

      <!-- Terminal -->
      <div v-else-if="isTerminal">
        <h1>Terminal Command Settings</h1>
        <div class="spacer"></div>
        <NeoInput placeholder="Terminal Command" v-model="formData.command" />
        <div class="spacer"></div>
        <NeoSegment options="Sudo,Normal" v-model="formData.mode" />
        <div class="spacer"></div>
        <NeoButton variant="primary" style="width: 100%;" @click="save">Save</NeoButton>
      </div>

      <!-- Custom API -->
      <div v-else-if="isCustomAPI">
        <h1>Custom API Settings</h1>
        <div class="spacer"></div>
        <NeoInput placeholder="URL endpoint" v-model="formData.url" />
        <div class="spacer"></div>
        <NeoSegment options="GET,POST,PUT,DELETE" v-model="formData.method" />
        <div class="spacer"></div>
        <NeoInput placeholder="Request Body" v-model="formData.body" />
        <div class="spacer"></div>
        <NeoInput placeholder="Request Headers" v-model="formData.headers" />
        <div class="spacer"></div>
        <NeoButton variant="primary" style="width: 100%;" @click="save">Save</NeoButton>
      </div>

      <!-- Default -->
      <div v-else>
        <h1>Settings</h1>
        <p>No specific settings available for this block.</p>
        <div class="spacer"></div>
        <NeoButton variant="primary" style="width: 100%;" @click="save">Save</NeoButton>
      </div>

    </NeoCard>
  </div>
</template>

<style scoped>
.customizer-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3000;
}

.customizer-card {
    min-width: 550px;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
}

.spacer {
    margin-bottom: 1rem;
}

label {
    font-weight: bold; 
    display: block; 
    margin-bottom: 0.5rem;
}
</style>
