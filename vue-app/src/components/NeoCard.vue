<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: {
    type: [String, Number],
    default: null
  }
})

const cardStyle = computed(() => {
  if (props.width) {
    const w = isNaN(props.width) ? props.width : `${props.width}px`
    return { width: w }
  }
  return {}
})
</script>

<template>
  <div class="neo-card" :style="cardStyle">
    <slot></slot>
  </div>
</template>

<style scoped>
.neo-card {
  display: block;
  background-color: white;
  border: var(--border-width, 3px) solid black;
  box-shadow: 8px 8px 0px 0px black;
  padding: 24px;
  height: 100%; /* Or auto? Original web component said 100% height, but host was block */
  width: 100%;
  box-sizing: border-box;
}
</style>
