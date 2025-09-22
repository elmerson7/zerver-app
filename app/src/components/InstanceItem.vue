<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  instance: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['start', 'stop']);

const handleAction = (action) => {
  if (props.loading) return;
  emit(action, props.instance.id);
};

const getStatusColor = (state) => {
  switch (state.toLowerCase()) {
    case 'running':
      return '#4CAF50';
    case 'stopped':
      return '#F44336';
    case 'pending':
    case 'stopping':
      return '#FF9800';
    default:
      return '#9E9E9E';
  }
};
</script>

<template>
  <div class="instance-item" :class="{ 'is-loading': loading }">
    <div class="instance-info">
      <div class="instance-name">{{ instance.name || 'Sin nombre' }}</div>
      <div class="instance-id">{{ instance.id }}</div>
      <div class="instance-region">{{ instance.region }}</div>
      <div class="instance-status">
        <span class="status-indicator" :style="{ backgroundColor: getStatusColor(instance.state) }"></span>
        <span class="status-text">{{ instance.state }}</span>
      </div>
    </div>
    <div class="instance-actions">
      <button 
        v-if="instance.state.toLowerCase() === 'stopped'" 
        class="action-button start-button" 
        @click="handleAction('start')"
        :disabled="loading"
      >
        <span class="button-icon">▶</span>
        Iniciar
      </button>
      <button 
        v-if="instance.state.toLowerCase() === 'running'" 
        class="action-button stop-button" 
        @click="handleAction('stop')"
        :disabled="loading"
      >
        <span class="button-icon">■</span>
        Detener
      </button>
      <div v-if="loading" class="loading-spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.instance-item {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.instance-item.is-loading {
  opacity: 0.7;
}

.instance-info {
  flex: 1;
}

.instance-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 4px;
  color: #333;
}

.instance-id {
  font-size: 0.8rem;
  color: #666;
  font-family: monospace;
  margin-bottom: 4px;
}

.instance-region {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 8px;
}

.instance-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.instance-actions {
  display: flex;
  align-items: center;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.button-icon {
  font-size: 0.8rem;
}

.start-button {
  background-color: #4CAF50;
  color: white;
}

.start-button:hover:not(:disabled) {
  background-color: #3d9140;
}

.stop-button {
  background-color: #f44336;
  color: white;
}

.stop-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .instance-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .instance-actions {
    margin-top: 12px;
    align-self: flex-end;
  }
  
  .action-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>
