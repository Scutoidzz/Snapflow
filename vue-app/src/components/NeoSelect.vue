<script setup>
import { ref } from 'vue'

const props = defineProps({
  options: {
    type: String, // comma separated
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select...'
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const optionsList = props.options.split(',').map(o => o.trim())

function toggle() {
  isOpen.value = !isOpen.value
}

function select(opt) {
  emit('update:modelValue', opt)
  emit('change', opt)
  isOpen.value = false
}

function close() {
  isOpen.value = false
}

// Click outside handled via simple backdrop or directive (omitted for speed, simple logic here)
</script>

<template>
  <div class="neo-select-host">
    <div class="select-trigger" @click="toggle">
      <span>{{ modelValue || placeholder }}</span>
      <div class="chevron"></div>
    </div>
    
    <div class="options-container" :class="{ open: isOpen }">
      <div 
        v-for="(opt, idx) in optionsList" 
        :key="idx" 
        class="option" 
        @click="select(opt)"
      >
        {{ opt }}
      </div>
    </div>
    
    <!-- Transparent backdrop to close -->
    <div v-if="isOpen" class="backdrop" @click="close"></div>
  </div>
</template>

<style scoped>
.neo-select-host {
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

.backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 90;
  cursor: default;
}
</style>
