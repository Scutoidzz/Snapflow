<script setup>
defineProps({
  modelValue: String
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="neo-time-host">
    <input 
      type="time" 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  </div>
</template>

<style scoped>
.neo-time-host {
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
