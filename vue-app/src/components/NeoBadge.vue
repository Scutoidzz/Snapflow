<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'accent' // Default to yellow per original implementation
  }
})

const badgeStyle = computed(() => {
  let bgColor = 'var(--accent-3)' // Default
  if (props.variant === 'primary') bgColor = 'var(--accent-2)'
  else if (props.variant === 'secondary') bgColor = 'var(--accent-1)'
  else if (props.variant === 'accent') bgColor = 'var(--accent-3)'
  
  return {
    backgroundColor: bgColor
  }
})
</script>

<template>
  <span class="neo-badge" :style="badgeStyle">
    <slot></slot>
  </span>
</template>

<style scoped>
.neo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border: 2px solid black;
  font-weight: bold;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: black;
  min-height: 32px;
}
</style>
