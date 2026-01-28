<script setup>
import NeoButton from '../components/NeoButton.vue'
import NeoCard from '../components/NeoCard.vue'
import NeoBadge from '../components/NeoBadge.vue'
import NeoScroller from '../components/NeoScroller.vue'
</script>

<template>
  <div class="home-container">
    <nav class="navbar">
      <div class="nav-brand">Snapflw</div>
      <div class="nav-links">
        <a href="#features" class="nav-link">Features</a>
        <RouterLink to="/dashboard" class="nav-link">Editor</RouterLink>
        <a href="#" class="nav-link">Download</a>
      </div>
    </nav>

    <section id="hero">
      <div id="intro">
        <h1>Easy automation</h1>
        <div id="call_to_action">
        <RouterLink to="/dashboard" style="text-decoration: none;">
            <NeoButton variant="primary">Enter the web editor</NeoButton>
          </RouterLink>
          <NeoButton variant="secondary">Download the client</NeoButton>
        </div>
      </div>
    </section>

    <section id="features">
      <NeoCard>
        <h2 class="text-center mb-2" style="font-size: 2.5rem; text-transform: uppercase;">Works with everything you do</h2>
        <div style="margin-top: 2rem; width: 100%;">
          <NeoScroller speed="40s">
            <!-- Set 1 -->
            <NeoBadge variant="secondary"><img src="/assets/openweather.svg" height="24" alt="OpenWeather"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/hackclub.svg" height="24" alt="Hack Club"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/calendar.svg" height="24" alt="Google Calendar"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/chatgpt.svg" height="24" alt="ChatGPT"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/linear.svg" height="24" alt="Linear"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/vercel.svg" height="24" alt="Vercel"></NeoBadge>
            <!-- Set 2 -->
            <NeoBadge variant="secondary"><img src="/assets/openweather.svg" height="24" alt="OpenWeather"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/hackclub.svg" height="24" alt="Hack Club"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/calendar.svg" height="24" alt="Google Calendar"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/chatgpt.svg" height="24" alt="ChatGPT"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/notion.svg" height="24" alt="Notion"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/vercel.svg" height="24" alt="Vercel"></NeoBadge>
            <!-- Set 3 -->
            <NeoBadge variant="secondary"><img src="/assets/openweather.svg" height="24" alt="OpenWeather"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/hackclub.svg" height="24" alt="Hack Club"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/calendar.svg" height="24" alt="Google Calendar"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/chatgpt.svg" height="24" alt="ChatGPT"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/notion.svg" height="24" alt="Notion"></NeoBadge>
            <NeoBadge variant="secondary"><img src="/assets/vercel.svg" height="24" alt="Vercel"></NeoBadge>
          </NeoScroller>
        </div>
      </NeoCard>
    </section>

    <div class="split-section">
      <div class="split-content">
        <NeoCard>
          <h1>Use it everywhere</h1>
          <ul style="padding-left: 1.5rem; font-size: 1.1rem; line-height: 1.8;">
            <li><strong>Share:</strong> Just send your shortcut file to anyone.</li>
            <li><strong>Run:</strong> just open it in the client.</li>
          </ul>
        </NeoCard>
      </div>
      <div class="split-image">
        <img src="/assets/snapf.png" alt="Snapfile illustration" class="snapf-image" width="300">
      </div>
    </div>

    <div class="section-grid">
      <NeoCard>
        <h1>Customizable</h1>
        <p>Use custom APIs and terminal commands to create a snapflow that fits your exact needs.</p>
      </NeoCard>

      <NeoCard>
        <h1>Free Forever</h1>
        <p>Completely free to use for individuals. Open source and community driven.</p>
        <div style="margin-top: 1.5rem;">
          <NeoButton variant="accent">Get Started</NeoButton>
        </div>
      </NeoCard>
    </div>

    <footer>
      <div class="footer-content">
        <div class="footer-brand">
          <h2>Snapflw</h2>
          <p>Automation for everyone.</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h3>Product</h3>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Download</a></li>
              <li><RouterLink to="/editor">Editor</RouterLink></li>
              <li><a href="https://github.com/scutoidzz/snapflow">Github</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Snapflw - The Product</h5>
            <h5>Snapflow - The File</h5>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
