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
  
  // Iniciar notificaciones persistentes
  const success = NotificationService.startPersistentNotifications(
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
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="notification-controls">
    <h2>Control de Notificaciones</h2>
    <p class="status">Estado: {{ status }}</p>
    
    <div class="form-group">
      <label for="title">Título:</label>
      <input id="title" v-model="notificationTitle" type="text" />
    </div>
    
    <div class="form-group">
      <label for="body">Mensaje:</label>
      <input id="body" v-model="notificationBody" type="text" />
    </div>
    
    <div class="form-group">
      <label for="interval">Intervalo (segundos):</label>
      <input 
        id="interval" 
        v-model.number="notificationInterval" 
        type="number" 
        min="5" 
        @change="updateInterval"
      />
    </div>
    
    <div class="button-group">
      <button 
        class="start-button" 
        :disabled="notificationsActive" 
        @click="startNotifications"
      >
        Iniciar Notificaciones
      </button>
      
      <button 
        class="stop-button" 
        :disabled="!notificationsActive" 
        @click="stopNotifications"
      >
        Detener Notificaciones
      </button>
    </div>
  </div>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

.notification-controls {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.status {
  font-weight: bold;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  max-width: 300px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.start-button {
  background-color: #4CAF50;
  color: white;
}

.start-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.stop-button {
  background-color: #f44336;
  color: white;
}

.stop-button:disabled {
  background-color: #ef9a9a;
  cursor: not-allowed;
}
</style>
