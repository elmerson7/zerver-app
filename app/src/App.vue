<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="logo-container">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <a href="https://vuejs.org/" target="_blank">
          <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
        </a>
      </div>
      <h1 class="app-title">Notificaciones App</h1>
    </header>
    <main class="app-content">
      <HelloWorld msg="Sistema de Notificaciones" />
    </main>
    <footer class="app-footer">
      <p>© 2025 Zerver App</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
}

.app-header {
  background-color: #f8f9fa;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.app-title {
  margin: 0.5rem 0;
  font-size: 1.8rem;
  color: #333;
}

.logo {
  height: 3em;
  padding: 0.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 1em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 1em #42b883aa);
}

.app-content {
  flex: 1;
  padding: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.app-footer {
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  border-top: 1px solid #eaeaea;
}

/* Responsive styles */
@media (max-width: 768px) {
  .app-header {
    padding: 0.8rem;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
  
  .logo {
    height: 2.5em;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0.6rem;
  }
  
  .app-title {
    font-size: 1.3rem;
  }
  
  .logo {
    height: 2em;
    padding: 0.3em;
  }
}
</style>
