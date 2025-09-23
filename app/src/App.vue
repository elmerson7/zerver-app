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
      <h1 class="app-title">EC2 Control</h1>
      <div class="monitoring-status" :class="{ active: monitoringActive }">
        {{ monitoringActive ? 'Monitoreo activo' : 'Monitoreo inactivo' }}
      </div>
    </header>
    
    <main class="app-content">
      <div class="tab-container">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'instances' }"
          @click="switchTab('instances')"
        >
          <span class="tab-icon">📊</span>
          Instancias
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'settings' }"
          @click="switchTab('settings')"
        >
          <span class="tab-icon">⚙️</span>
          Configuración
        </button>
      </div>
      
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
    
    <footer class="app-footer">
      <p>© 2025 EC2 Control App</p>
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
  background-color: var(--color-primary);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 8px;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  color: white;
  text-align: center;
}

.monitoring-status {
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.monitoring-status.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.app-content {
  flex: 1;
  padding: 1rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
}

.tab-container {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.tab-button.active {
  color: var(--color-primary-light);
  border-bottom-color: var(--color-primary);
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-content {
  padding: 10px 0;
}

.monitoring-controls {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.monitoring-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  width: 100%;
  max-width: 300px;
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

.app-footer {
  background-color: var(--color-background-alt);
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-light);
  border-top: 1px solid var(--color-border);
}

/* Responsive styles */
@media (max-width: 768px) {
  .app-content {
    padding: 0.8rem;
  }
  
  .tab-button {
    padding: 10px 16px;
    font-size: 0.95rem;
  }
  
  .monitoring-button {
    padding: 10px 20px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0.8rem;
  }
  
  .app-title {
    font-size: 1.3rem;
  }
  
  .app-content {
    padding: 0.6rem;
  }
  
  .tab-button {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .tab-icon {
    font-size: 1rem;
  }
  
  .monitoring-button {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
</style>