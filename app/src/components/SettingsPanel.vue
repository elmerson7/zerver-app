<script setup>
import { ref, onMounted, computed } from 'vue';
import { Capacitor } from '@capacitor/core';
import StorageService from '../services/StorageService.js';
import ApiService from '../services/ApiService.js';
import PingService from '../services/PingService.js';
import NotificationService from '../services/NotificationService.js';

const settings = ref({
  intervalMinutes: 30,
  graceMinutes: 2,
  notificationsEnabled: true,
  useFCM: true
});

const userId = ref('');
const deviceId = ref('');
const fcmToken = ref('');
const isSaving = ref(false);
const saveMessage = ref('');
const isNativePlatform = ref(false);
const fcmAvailable = ref(false);

onMounted(async () => {
  // Verificar si estamos en plataforma nativa
  isNativePlatform.value = Capacitor.isNativePlatform();
  
  // Verificar si FCM está disponible
  fcmAvailable.value = NotificationService.isFCMAvailable();
  
  // Cargar configuración guardada
  const savedSettings = StorageService.getSettings();
  settings.value = { ...settings.value, ...savedSettings };
  
  // Obtener IDs
  userId.value = StorageService.getUserId();
  deviceId.value = StorageService.getDeviceId();
  
  // Obtener token FCM
  fcmToken.value = StorageService.getFCMToken() || 'No disponible';
});

const showFCMSettings = computed(() => {
  return isNativePlatform.value;
});

const saveSettings = async () => {
  try {
    isSaving.value = true;
    saveMessage.value = '';
    
    // Guardar en almacenamiento local
    StorageService.saveSettings(settings.value);
    
    // Registrar en la API
    await ApiService.registerDevice({
      userId: userId.value,
      deviceId: deviceId.value,
      fcmToken: fcmToken.value !== 'No disponible' ? fcmToken.value : 'local-notifications-only',
      intervalMinutes: settings.value.intervalMinutes,
      graceMinutes: settings.value.graceMinutes
    });
    
    // Reiniciar el servicio de pings si está activo
    if (settings.value.notificationsEnabled) {
      PingService.stopMonitoring();
      PingService.startMonitoring();
    } else {
      PingService.stopMonitoring();
    }
    
    saveMessage.value = 'Configuración guardada correctamente';
    setTimeout(() => {
      saveMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    saveMessage.value = 'Error al guardar la configuración';
  } finally {
    isSaving.value = false;
  }
};

const toggleNotifications = () => {
  if (settings.value.notificationsEnabled) {
    PingService.startMonitoring();
  } else {
    PingService.stopMonitoring();
  }
};
</script>

<template>
  <div class="settings-panel">
    <h2 class="settings-title">Configuración</h2>
    
    <div class="settings-form">
      <div class="form-group">
        <label for="intervalMinutes">Intervalo de notificaciones:</label>
        <div class="select-wrapper">
          <select id="intervalMinutes" v-model="settings.intervalMinutes">
            <option value="30">Cada 30 minutos (00:00, 00:30)</option>
            <option value="60">Cada 60 minutos (solo 00:00)</option>
          </select>
        </div>
        <p class="help-text">Define cada cuánto tiempo recibirás notificaciones para confirmar el uso de las instancias.</p>
      </div>
      
      <div class="form-group">
        <label for="graceMinutes">Tiempo de gracia:</label>
        <div class="select-wrapper">
          <select id="graceMinutes" v-model="settings.graceMinutes">
            <option value="2">2 minutos</option>
            <option value="3">3 minutos</option>
            <option value="4">4 minutos</option>
            <option value="5">5 minutos</option>
          </select>
        </div>
        <p class="help-text">Tiempo disponible para responder antes de que la instancia se apague automáticamente.</p>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="settings.notificationsEnabled"
            @change="toggleNotifications"
          >
          <span>Notificaciones activadas</span>
        </label>
        <p class="help-text">Activa o desactiva las notificaciones para confirmar el uso de instancias.</p>
      </div>
      
      <!-- Configuración de FCM solo para plataformas nativas -->
      <div v-if="showFCMSettings" class="form-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="settings.useFCM"
            :disabled="!fcmAvailable"
          >
          <span>Usar notificaciones push (FCM)</span>
        </label>
        <p class="help-text">
          {{ fcmAvailable 
            ? 'Permite recibir notificaciones incluso cuando la app está cerrada.' 
            : 'FCM no está disponible en este dispositivo.' }}
        </p>
        
        <div class="fcm-token-info">
          <p><strong>Token FCM:</strong> {{ fcmToken }}</p>
        </div>
      </div>
      
      <div class="device-info">
        <p><strong>ID de Usuario:</strong> {{ userId }}</p>
        <p><strong>ID de Dispositivo:</strong> {{ deviceId }}</p>
        <p v-if="isNativePlatform"><strong>Plataforma:</strong> {{ Capacitor.getPlatform() }}</p>
      </div>
      
      <div class="form-actions">
        <button 
          class="save-button" 
          @click="saveSettings" 
          :disabled="isSaving"
        >
          <span v-if="isSaving">Guardando...</span>
          <span v-else>Guardar configuración</span>
        </button>
        
        <div v-if="saveMessage" class="save-message">
          {{ saveMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.settings-title {
  font-size: 1.4rem;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.help-text {
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: '▼';
  font-size: 0.8rem;
  color: #666;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
  appearance: none;
  cursor: pointer;
}

select:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
}

.checkbox-label input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fcm-token-info {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #666;
  margin-top: 8px;
  word-break: break-all;
}

.device-info {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
  margin-top: 10px;
}

.device-info p {
  margin: 4px 0;
}

.form-actions {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.save-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  max-width: 300px;
}

.save-button:hover:not(:disabled) {
  background-color: #3d9140;
}

.save-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.save-message {
  margin-top: 12px;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
  background-color: #e8f5e9;
  color: #2e7d32;
}

@media (max-width: 600px) {
  .settings-panel {
    padding: 16px;
  }
  
  .settings-title {
    font-size: 1.2rem;
  }
  
  select {
    padding: 8px 10px;
  }
  
  .save-button {
    padding: 10px 20px;
    font-size: 0.95rem;
  }
}
</style>