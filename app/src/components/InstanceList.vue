<script setup>
import { ref, onMounted } from 'vue';
import ApiService from '../services/ApiService.js';
import InstanceItem from './InstanceItem.vue';

const instances = ref([]);
const loading = ref(true);
const error = ref('');
const refreshing = ref(false);
const actionInProgress = ref(null);
const pullRefreshActive = ref(false);
const pullStartY = ref(0);
const pullMoveY = ref(0);

// Cargar instancias
const loadInstances = async () => {
  try {
    loading.value = true;
    error.value = '';
    const data = await ApiService.fetchInstances();
    instances.value = data;
  } catch (err) {
    error.value = `Error al cargar las instancias: ${err.message}`;
    console.error('Error al cargar instancias:', err);
  } finally {
    loading.value = false;
  }
};

// Refrescar instancias
const refreshInstances = async () => {
  if (refreshing.value) return;
  
  try {
    refreshing.value = true;
    error.value = '';
    const data = await ApiService.fetchInstances();
    instances.value = data;
  } catch (err) {
    error.value = `Error al actualizar las instancias: ${err.message}`;
    console.error('Error al actualizar instancias:', err);
  } finally {
    refreshing.value = false;
    pullRefreshActive.value = false;
    pullMoveY.value = 0;
  }
};

// Iniciar instancia
const startInstance = async (instanceId) => {
  if (actionInProgress.value) return;
  
  try {
    actionInProgress.value = instanceId;
    error.value = '';
    await ApiService.startInstance(instanceId);
    // Actualizar la instancia en la lista
    await refreshInstances();
  } catch (err) {
    error.value = `Error al iniciar la instancia ${instanceId}: ${err.message}`;
    console.error(`Error al iniciar instancia ${instanceId}:`, err);
  } finally {
    actionInProgress.value = null;
  }
};

// Detener instancia
const stopInstance = async (instanceId) => {
  if (actionInProgress.value) return;
  
  try {
    actionInProgress.value = instanceId;
    error.value = '';
    await ApiService.stopInstance(instanceId);
    // Actualizar la instancia en la lista
    await refreshInstances();
  } catch (err) {
    error.value = `Error al detener la instancia ${instanceId}: ${err.message}`;
    console.error(`Error al detener instancia ${instanceId}:`, err);
  } finally {
    actionInProgress.value = null;
  }
};

// Limpiar error
const clearError = () => {
  error.value = '';
};

// Pull to refresh
const onTouchStart = (e) => {
  if (window.scrollY === 0) {
    pullStartY.value = e.touches[0].clientY;
    pullRefreshActive.value = true;
  }
};

const onTouchMove = (e) => {
  if (!pullRefreshActive.value) return;
  
  const touchY = e.touches[0].clientY;
  const diff = touchY - pullStartY.value;
  
  if (diff > 0) {
    // Resistencia al deslizamiento (no lineal)
    pullMoveY.value = Math.min(80, Math.pow(diff, 0.8));
    e.preventDefault(); // Prevenir scroll
  }
};

const onTouchEnd = () => {
  if (pullRefreshActive.value && pullMoveY.value > 50) {
    // Si se ha tirado lo suficiente, actualizar
    refreshInstances();
  } else {
    // Si no, restaurar posición
    pullRefreshActive.value = false;
    pullMoveY.value = 0;
  }
};

// Cargar instancias al montar el componente
onMounted(loadInstances);
</script>

<template>
  <div 
    class="instance-list-container"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div 
      class="pull-indicator" 
      v-if="pullRefreshActive" 
      :style="{ height: pullMoveY + 'px' }"
    >
      <div class="pull-spinner" :class="{ 'is-refreshing': refreshing }">
        <span class="material-icons">refresh</span>
      </div>
    </div>
    
    <div class="list-header">
      <h2 class="list-title">Instancias EC2</h2>
      <button 
        class="refresh-button" 
        @click="refreshInstances" 
        :disabled="refreshing || loading"
      >
        <span class="material-icons" :class="{ 'is-refreshing': refreshing }">refresh</span>
        <span class="button-text">{{ refreshing ? '' : 'Actualizar' }}</span>
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      <div class="error-content">{{ error }}</div>
      <button class="error-close" @click="clearError">
        <span class="material-icons">close</span>
      </button>
    </div>
    
    <div v-if="loading && !refreshing" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando instancias...</p>
    </div>
    
    <div v-else-if="instances.length === 0" class="empty-state">
      <span class="material-icons empty-icon">cloud_off</span>
      <p>No se encontraron instancias disponibles.</p>
    </div>
    
    <div v-else class="instance-list">
      <InstanceItem 
        v-for="instance in instances" 
        :key="instance.id"
        :instance="instance"
        :loading="actionInProgress === instance.id"
        @start="startInstance"
        @stop="stopInstance"
      />
    </div>
  </div>
</template>

<style scoped>
.instance-list-container {
  margin-bottom: 16px;
  position: relative;
  min-height: 200px;
}

.pull-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  overflow: hidden;
  transition: height 0.2s;
}

.pull-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
  transform: rotate(0deg);
  transition: transform 0.2s;
}

.pull-spinner.is-refreshing {
  animation: spin 1s linear infinite;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.list-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
  letter-spacing: 0.25px;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  border-radius: 50%;
  padding: 8px;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
  min-height: 40px;
}

.refresh-button:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.material-icons {
  font-size: 20px;
}

.button-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.is-refreshing {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--color-secondary-light);
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid var(--color-secondary);
}

.error-content {
  flex: 1;
  padding-right: 8px;
}

.error-close {
  background: none;
  border: none;
  color: var(--color-secondary-light);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close .material-icons {
  font-size: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: var(--color-text-light);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid var(--color-primary-light);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: var(--color-text-light);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.instance-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 600px) {
  .list-header {
    padding: 0;
  }
  
  .list-title {
    font-size: 1.1rem;
  }
}
</style>