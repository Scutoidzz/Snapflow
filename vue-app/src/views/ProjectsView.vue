<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NeoButton from '../components/NeoButton.vue'
import NeoCard from '../components/NeoCard.vue'

const router = useRouter()
const history = ref([])

onMounted(() => {
  const stored = localStorage.getItem('recent_snapflows')
  if (stored) {
    try {
      history.value = JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
  }
})

function openFlow(item) {
  // Logic to load flow. For now just navigate to editor.
  // In a real app we'd pass ID or use a store used by EditorView.
  // Using localStorage as legacy app did:
  localStorage.setItem('pending_load_flow', item.content)
  router.push('/editor')
}

function downloadFlow(item) {
  const blob = new Blob([item.content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (item.name || 'flow').replace(/\s+/g, '_') + '.snapf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div class="projects-container">
    <h1>Snapflw - Snapflows</h1>
    <div id="centered" style="display: flex; gap: 10px; justify-content: center; align-items: center; margin-bottom: 20px;">
      <RouterLink to="/editor" style="text-decoration: none;">
        <NeoButton variant="primary">New snapflow</NeoButton>
      </RouterLink>
      <NeoButton variant="secondary">Import snapflow</NeoButton>
      <NeoButton variant="tertiary">Create block</NeoButton>
    </div>

    <div id="snapflows" class="section-grid">
      <NeoCard v-if="history.length === 0" style="grid-column: 1 / -1; text-align: center; opacity: 0.7;">
        <h3>No recent flows found.</h3>
        <p>Create a new one to get started!</p>
      </NeoCard>

      <NeoCard v-else v-for="(item, index) in history" :key="index">
        <h3>{{ item.name }}</h3>
        <p style="color: #666; font-size: 0.9rem;">Last edited: {{ formatDate(item.date) }}</p>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <NeoButton variant="secondary" @click="openFlow(item)">Load</NeoButton>
          <NeoButton variant="primary" @click="downloadFlow(item)">Download</NeoButton>
        </div>
      </NeoCard>
    </div>
  </div>
</template>

<style scoped>
.projects-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
