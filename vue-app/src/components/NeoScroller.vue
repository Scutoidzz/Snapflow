<script setup>
const props = defineProps({
  speed: {
    type: String, // e.g. "40s"
    default: '20s'
  }
})
</script>

<template>
  <div class="neo-scroller-host">
    <div class="scroller" :style="{ animationDuration: speed }">
      <slot></slot>
      <!-- Note: In original Custom Element, a second slot was present but likely ineffective. 
           In Vue, we can't easily clone the slot content without a render function or v-for data.
           We assume the user provides sufficient repeated content or we adjust the animation if needed.
           For now, we preserve the valid part of the original structure. -->
    </div>
  </div>
</template>

<style scoped>
.neo-scroller-host {
  display: block;
  overflow: hidden;
  width: 100%;
}

.scroller {
  display: flex;
  width: max-content;
  animation: scroll linear infinite;
}

.scroller:hover {
  animation-play-state: paused;
}

:slotted(*) {
  margin: 0 1rem;
}

@keyframes scroll {
  to {
    transform: translateX(-50%);
  }
}
</style>
