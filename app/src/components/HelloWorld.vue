<script setup>
import { ref, onMounted } from 'vue'
import NotificationService from '../services/NotificationService.js'

defineProps({
  msg: String,
})

const count = ref(0)
const notificationsActive = ref(false)
const notificationInterval = ref(120) // 2 minutos por defecto
const notificationTitle = ref('Notificación de prueba')
const notificationBody = ref('Esta es una notificación periódica cada 2 minutos')
const status = ref('Notificaciones inactivas')

onMounted(async () => {
  // Inicializar el servicio de notificaciones al cargar el componente
  await NotificationService.initialize()
})

const startNotifications = async () => {
  if (notificationsActive.value) return
  
  // Usar el servicio de notificaciones normal
  const success = NotificationService.startPeriodicNotifications(
    notificationTitle.value,
    notificationBody.value,
    notificationInterval.value
  )
  
  if (success) {
    notificationsActive.value = true
    status.value = `Notificaciones activas (cada ${notificationInterval.value} segundos)`
  } else {
    status.value = 'Error al iniciar notificaciones'
  }
}

const stopNotifications = () => {
  const stopped = NotificationService.stopPeriodicNotifications()
  if (stopped) {
    notificationsActive.value = false
    status.value = 'Notificaciones detenidas'
  }
}

const updateInterval = () => {
  if (notificationsActive.value) {
    stopNotifications()
    startNotifications()
  }
}

// Nuevas funciones para los controles de intervalo
const incrementInterval = () => {
  notificationInterval.value += 5
  updateInterval()
}

const decrementInterval = () => {
  if (notificationInterval.value > 5) {
    notificationInterval.value -= 5
    updateInterval()
  }
}
</script>

<template>
  <h1 class="page-title">{{ msg }}</h1>

  <div class="notification-card">
    <div class="card-header">
      <h2>Control de Notificaciones</h2>
      <div class="status-badge" :class="{ active: notificationsActive }">
        {{ status }}
      </div>
    </div>
    
    <div class="card-body">
      <div class="form-group">
        <label for="title">Título:</label>
        <input id="title" v-model="notificationTitle" type="text" placeholder="Título de la notificación" />
      </div>
      
      <div class="form-group">
        <label for="body">Mensaje:</label>
        <input id="body" v-model="notificationBody" type="text" placeholder="Cuerpo de la notificación" />
      </div>
      
      <div class="form-group">
        <label for="interval">Intervalo (segundos):</label>
        <div class="input-with-controls">
          <button 
            class="control-button" 
            @click="decrementInterval" 
            :disabled="notificationInterval <= 5"
          >-</button>
          <input 
            id="interval" 
            v-model.number="notificationInterval" 
            type="number" 
            min="5" 
            @change="updateInterval"
          />
          <button 
            class="control-button" 
            @click="incrementInterval"
          >+</button>
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <button 
        class="action-button start-button" 
        :disabled="notificationsActive" 
        @click="startNotifications"
      >
        <span class="button-icon">▶</span>
        Iniciar Notificaciones
      </button>
      
      <button 
        class="action-button stop-button" 
        :disabled="!notificationsActive" 
        @click="stopNotifications"
      >
        <span class="button-icon">■</span>
        Detener Notificaciones
      </button>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.notification-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.card-header {
  background-color: #f8f9fa;
  padding: 1.2rem;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #333;
}

.status-badge {
  background-color: #e0e0e0;
  color: #555;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #4CAF50;
  color: white;
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1.2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  outline: none;
}

.input-with-controls {
  display: flex;
  align-items: center;
}

.input-with-controls input {
  flex: 1;
  text-align: center;
  border-radius: 0;
  border-left: none;
  border-right: none;
}

.control-button {
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  width: 40px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

.control-button:first-child {
  border-radius: 8px 0 0 8px;
}

.control-button:last-child {
  border-radius: 0 8px 8px 0;
}

.control-button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button {
  flex: 1;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.button-icon {
  font-size: 0.9rem;
}

.start-button {
  background-color: #4CAF50;
  color: white;
}

.start-button:hover:not(:disabled) {
  background-color: #3d9140;
}

.start-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.stop-button {
  background-color: #f44336;
  color: white;
}

.stop-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

.stop-button:disabled {
  background-color: #ef9a9a;
  cursor: not-allowed;
}

/* Responsive styles */
@media (max-width: 600px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .notification-card {
    border-radius: 8px;
  }
  
  .card-header {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .card-body, .card-footer {
    padding: 1rem;
  }
  
  .card-footer {
    flex-direction: column;
  }
  
  .form-group label {
    font-size: 0.9rem;
  }
  
  .form-group input {
    padding: 0.7rem;
  }
  
  .action-button {
    padding: 0.8rem;
  }
}
</style>