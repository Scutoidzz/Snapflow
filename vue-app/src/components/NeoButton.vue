<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary'
  }
})

const buttonStyle = computed(() => {
  let bgColor = 'var(--card-bg)'
  if (props.variant === 'primary') bgColor = 'var(--accent-2)'
  else if (props.variant === 'secondary') bgColor = 'var(--accent-1)'
  else if (props.variant === 'accent') bgColor = 'var(--accent-3)'
  
  return {
    backgroundColor: bgColor
  }
})
</script>

<template>
  <button :style="buttonStyle" class="neo-button">
    <slot></slot>
  </button>
</template>

<style scoped>
.neo-button {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  padding: 1rem 2rem;
  border: var(--border-width, 3px) solid black;
  box-shadow: var(--shadow-offset, 4px) var(--shadow-offset, 4px) 0px 0px black;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  transition: all 0.15s ease-in-out;
  color: black;
}

.neo-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px black;
}

.neo-button:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px 0px black;
}
</style>
