<script setup>
defineProps({
  modelValue: [String, Number],
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="neo-input"
  />
</template>

<style scoped>
.neo-input {
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

.neo-input:focus {
  box-shadow: 6px 6px 0px 0px black;
}
</style>
