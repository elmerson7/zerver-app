<script setup>
import { ref, onMounted } from 'vue';
import InstanceList from './components/InstanceList.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import NotificationService from './services/NotificationService.js';
import PingService from './services/PingService.js';
import StorageService from './services/StorageService.js';

// Estado para manejar las pestañas
const activeTab = ref('instances'); // 'instances' o 'settings'
const monitoringActive = ref(false);
const monitoringStatus = ref('');

// Cambiar de pestaña
const switchTab = (tab) => {
  activeTab.value = tab;
};

// Inicializar servicios al montar el componente
onMounted(async () => {
  // Inicializar el servicio de notificaciones
  await NotificationService.initialize();
  
  // Inicializar el servicio de pings
  PingService.initialize();
  
  // Verificar si las notificaciones están habilitadas en la configuración
  const settings = StorageService.getSettings();
  if (settings.notificationsEnabled) {
    startMonitoring();
  }
});

// Iniciar monitoreo de pings
const startMonitoring = () => {
  if (monitoringActive.value) return;
  
  const success = PingService.startMonitoring();
  if (success) {
    monitoringActive.value = true;
    monitoringStatus.value = 'Monitoreo activo';
    
    // Guardar preferencia en configuración
    const settings = StorageService.getSettings();
    settings.notificationsEnabled = true;
    StorageService.saveSettings(settings);
  } else {
    monitoringStatus.value = 'Error al iniciar monitoreo';
  }
};

// Detener monitoreo de pings
const stopMonitoring = () => {
  if (!monitoringActive.value) return;
  
  const success = PingService.stopMonitoring();
  if (success) {
    monitoringActive.value = false;
    monitoringStatus.value = 'Monitoreo detenido';
    
    // Guardar preferencia en configuración
    const settings = StorageService.getSettings();
    settings.notificationsEnabled = false;
    StorageService.saveSettings(settings);
  } else {
    monitoringStatus.value = 'Error al detener monitoreo';
  }
};
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="status-bar"></div>
      <h1 class="app-title">EC2 Control</h1>
      <div class="monitoring-status" :class="{ active: monitoringActive }">
        {{ monitoringActive ? 'Monitoreo activo' : 'Monitoreo inactivo' }}
      </div>
    </header>
    
    <main class="app-content">
      <div class="tab-content">
        <InstanceList v-if="activeTab === 'instances'" />
        <SettingsPanel v-if="activeTab === 'settings'" />
      </div>
      
      <div class="monitoring-controls">
        <button 
          v-if="!monitoringActive" 
          class="monitoring-button start-button" 
          @click="startMonitoring"
        >
          <span class="button-icon">▶</span>
          Iniciar monitoreo
        </button>
        <button 
          v-else 
          class="monitoring-button stop-button" 
          @click="stopMonitoring"
        >
          <span class="button-icon">■</span>
          Detener monitoreo
        </button>
      </div>
    </main>
    
    <nav class="bottom-tabs">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'instances' }"
        @click="switchTab('instances')"
      >
        <span class="tab-icon material-icon">dashboard</span>
        <span class="tab-label">Instancias</span>
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'settings' }"
        @click="switchTab('settings')"
      >
        <span class="tab-icon material-icon">settings</span>
        <span class="tab-label">Configuración</span>
      </button>
    </nav>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
}

.app-header {
  background-color: var(--color-primary);
  height: 64px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
}

.status-bar {
  width: 100%;
  height: 24px; /* Espacio para la barra de estado del móvil */
}

.app-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: white;
  text-align: center;
  letter-spacing: 0.5px;
}

.monitoring-status {
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.4px;
}

.monitoring-status.active {
  background-color: rgba(255, 255, 255, 0.15);
}

.app-content {
  flex: 1;
  padding: 8px 12px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
  margin-bottom: 56px; /* Espacio para la barra de navegación inferior */
}

.tab-content {
  padding: 4px 0;
}

/* Barra de navegación inferior */
.bottom-tabs {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: var(--color-background-alt);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.tab-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: 0.75rem;
  padding: 8px 0;
  transition: color 0.2s;
  position: relative;
}

.tab-button.active {
  color: var(--color-primary);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 2px;
  background-color: var(--color-primary);
  border-radius: 1px;
}

.tab-icon.material-icon {
  font-family: 'Material Icons';
  font-size: 24px;
  margin-bottom: 2px;
}

.tab-label {
  font-size: 0.7rem;
  font-weight: 500;
}

.monitoring-controls {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.monitoring-button {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  width: 100%;
  max-width: 300px;
  height: 48px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.start-button {
  background-color: var(--color-primary);
  color: white;
}

.start-button:hover {
  background-color: var(--color-primary-dark);
}

.stop-button {
  background-color: var(--color-secondary);
  color: white;
}

.stop-button:hover {
  background-color: var(--color-secondary-dark);
}

.button-icon {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .app-content {
    padding: 8px;
  }
  
  .monitoring-button {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .app-header {
    height: 56px;
  }
  
  .app-title {
    font-size: 1.1rem;
  }
  
  .app-content {
    padding: 4px 8px;
  }
  
  .monitoring-button {
    padding: 8px 16px;
    font-size: 0.8rem;
    height: 44px;
  }
}

/* Animaciones de transición entre pestañas */
.tab-content {
  position: relative;
}

.tab-content > * {
  transition: opacity 0.3s, transform 0.3s;
}
</style>