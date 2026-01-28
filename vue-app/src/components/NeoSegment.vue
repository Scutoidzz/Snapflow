<script setup>
import { ref } from 'vue'

const props = defineProps({
  options: {
    type: String, // comma separated
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const optionsList = props.options.split(',').map(o => o.trim())

function select(opt) {
  emit('update:modelValue', opt)
  emit('change', opt)
}
</script>

<template>
  <div class="neo-segment">
    <div 
        v-for="(opt, idx) in optionsList" 
        :key="idx" 
        class="option" 
        :class="{ selected: opt === modelValue }"
        @click="select(opt)"
    >
      {{ opt }}
    </div>
  </div>
</template>

<style scoped>
.neo-segment {
  display: inline-flex;
  border: var(--border-width, 3px) solid black;
  background: white;
  box-shadow: 4px 4px 0px 0px black;
  overflow: hidden;
  font-family: 'Space Grotesk', sans-serif;
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
