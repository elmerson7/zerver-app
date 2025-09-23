<script setup>
import { ref, onMounted } from 'vue';
import ApiService from '../services/ApiService.js';
import InstanceItem from './InstanceItem.vue';

const instances = ref([]);
const loading = ref(true);
const error = ref('');
const refreshing = ref(false);
const actionInProgress = ref(null);

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

// Cargar instancias al montar el componente
onMounted(loadInstances);
</script>

<template>
  <div class="instance-list-container">
    <div class="list-header">
      <h2 class="list-title">Instancias EC2</h2>
      <button 
        class="refresh-button" 
        @click="refreshInstances" 
        :disabled="refreshing || loading"
      >
        <span class="refresh-icon" :class="{ 'is-refreshing': refreshing }">↻</span>
        <span>{{ refreshing ? 'Actualizando...' : 'Actualizar' }}</span>
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      <div class="error-content">{{ error }}</div>
      <button class="error-close" @click="clearError">×</button>
    </div>
    
    <div v-if="loading && !refreshing" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando instancias...</p>
    </div>
    
    <div v-else-if="instances.length === 0" class="empty-state">
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
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-title {
  font-size: 1.4rem;
  color: var(--color-text);
  margin: 0;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background-color: var(--color-background-dark);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 1rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.refresh-icon.is-refreshing {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: rgba(244, 67, 54, 0.2);
  color: var(--color-secondary-light);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--color-secondary-dark);
}

.error-content {
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: var(--color-secondary-light);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 8px;
  margin: -8px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--color-text-light);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid var(--color-primary-light);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-light);
  background-color: var(--color-background-alt);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.instance-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 600px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .refresh-button {
    align-self: flex-end;
  }
}
</style>