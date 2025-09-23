<script setup>
import { defineProps, defineEmits, ref } from 'vue';

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
const touchStart = ref(null);
const showRipple = ref(false);
const rippleX = ref(0);
const rippleY = ref(0);

const handleAction = (action) => {
  if (props.loading) return;
  emit(action, props.instance.id);
};

const getStatusColor = (state) => {
  switch (state.toLowerCase()) {
    case 'running':
      return 'var(--color-primary-light)';
    case 'stopped':
      return 'var(--color-secondary-light)';
    case 'pending':
    case 'stopping':
      return 'var(--color-warning)';
    default:
      return '#9E9E9E';
  }
};

const onTouchStart = (e) => {
  touchStart.value = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  };
  
  // Mostrar efecto ripple
  rippleX.value = e.touches[0].clientX - e.currentTarget.getBoundingClientRect().left;
  rippleY.value = e.touches[0].clientY - e.currentTarget.getBoundingClientRect().top;
  showRipple.value = true;
};

const onTouchEnd = () => {
  touchStart.value = null;
  setTimeout(() => {
    showRipple.value = false;
  }, 300);
};
</script>

<template>
  <div 
    class="instance-item" 
    :class="{ 'is-loading': loading }"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div class="ripple" v-if="showRipple" :style="{ left: rippleX + 'px', top: rippleY + 'px' }"></div>
    
    <div class="instance-info">
      <div class="instance-name">{{ instance.name || 'Sin nombre' }}</div>
      <div class="instance-id">{{ instance.id }}</div>
      
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
        <span class="material-icons">play_arrow</span>
        <span class="button-text">Iniciar</span>
      </button>
      
      <button 
        v-if="instance.state.toLowerCase() === 'running'" 
        class="action-button stop-button" 
        @click="handleAction('stop')"
        :disabled="loading"
      >
        <span class="material-icons">stop</span>
        <span class="button-text">Detener</span>
      </button>
      
      <div v-if="loading" class="loading-spinner"></div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>

<style scoped>
.instance-item {
  background-color: var(--color-card);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: background-color 0.2s;
}

.instance-item:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.ripple {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: scale(0);
  animation: ripple-effect 0.6s linear;
  pointer-events: none;
}

@keyframes ripple-effect {
  to {
    transform: scale(40);
    opacity: 0;
  }
}

.instance-item.is-loading {
  opacity: 0.7;
}

.instance-info {
  flex: 1;
  min-width: 0;
}

.instance-name {
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 2px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.instance-id {
  font-size: 0.7rem;
  color: var(--color-text-light);
  font-family: monospace;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.instance-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-text {
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: lowercase;
}

.instance-actions {
  display: flex;
  align-items: center;
}

.action-button {
  min-width: 88px;
  height: 36px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  padding: 0 12px;
}

.material-icons {
  font-size: 18px;
}

.button-text {
  font-size: 0.75rem;
}

.start-button {
  background-color: var(--color-primary);
  color: white;
}

.start-button:active {
  background-color: var(--color-primary-dark);
}

.stop-button {
  background-color: var(--color-secondary);
  color: white;
}

.stop-button:active {
  background-color: var(--color-secondary-dark);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid var(--color-primary-light);
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
    padding: 10px;
  }
  
  .action-button {
    min-width: 72px;
    height: 32px;
    padding: 0 8px;
  }
  
  .material-icons {
    font-size: 16px;
  }
  
  .button-text {
    font-size: 0.7rem;
  }
}
</style>