<script setup>
defineProps({
  min: { type: [String, Number], default: 0 },
  max: { type: [String, Number], default: 100 },
  modelValue: { type: [String, Number], default: 50 }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="neo-slider-host">
    <input 
        type="range" 
        :min="min" 
        :max="max" 
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
    >
  </div>
</template>

<style scoped>
.neo-slider-host {
  display: block;
  width: 100%;
}

input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
}

input[type=range]:focus {
  outline: none;
}

/* Webkit */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  background: var(--accent-3);
  border: 3px solid black;
  cursor: pointer;
  margin-top: -9px;
  box-shadow: 2px 2px 0px 0px black;
  transition: transform 0.1s;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: white;
  border: 3px solid black;
}

/* Firefox */
input[type=range]::-moz-range-thumb {
  height: 24px;
  width: 24px;
  background: var(--accent-3);
  border: 3px solid black;
  cursor: pointer;
  box-shadow: 2px 2px 0px 0px black;
}

input[type=range]::-moz-range-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: white;
  border: 3px solid black;
}
</style>
