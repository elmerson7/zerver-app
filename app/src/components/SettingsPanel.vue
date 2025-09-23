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
const showSavedMessage = ref(false);

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
    
    // Mostrar mensaje de éxito con animación
    showSavedMessage.value = true;
    setTimeout(() => {
      showSavedMessage.value = false;
    }, 2000);
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
    
    <div class="settings-list">
      <!-- Intervalo de notificaciones -->
      <div class="settings-item">
        <div class="settings-item-label">
          <span class="material-icons">schedule</span>
          <div>
            <div class="setting-name">Intervalo de notificaciones</div>
            <div class="setting-description">Define cada cuánto tiempo recibirás notificaciones</div>
          </div>
        </div>
        <div class="settings-item-control">
          <select v-model="settings.intervalMinutes" class="select-control">
            <option value="30">30 min</option>
            <option value="60">60 min</option>
          </select>
        </div>
      </div>
      
      <!-- Tiempo de gracia -->
      <div class="settings-item">
        <div class="settings-item-label">
          <span class="material-icons">timer</span>
          <div>
            <div class="setting-name">Tiempo de gracia</div>
            <div class="setting-description">Tiempo para responder antes del apagado automático</div>
          </div>
        </div>
        <div class="settings-item-control">
          <select v-model="settings.graceMinutes" class="select-control">
            <option value="2">2 min</option>
            <option value="3">3 min</option>
            <option value="4">4 min</option>
            <option value="5">5 min</option>
          </select>
        </div>
      </div>
      
      <!-- Notificaciones activadas -->
      <div class="settings-item">
        <div class="settings-item-label">
          <span class="material-icons">notifications</span>
          <div>
            <div class="setting-name">Notificaciones</div>
            <div class="setting-description">Activar o desactivar notificaciones</div>
          </div>
        </div>
        <div class="settings-item-control">
          <label class="switch">
            <input 
              type="checkbox" 
              v-model="settings.notificationsEnabled"
              @change="toggleNotifications"
            >
            <span class="slider"></span>
          </label>
        </div>
      </div>
      
      <!-- Configuración de FCM solo para plataformas nativas -->
      <div v-if="showFCMSettings" class="settings-item">
        <div class="settings-item-label">
          <span class="material-icons">cloud</span>
          <div>
            <div class="setting-name">Notificaciones push (FCM)</div>
            <div class="setting-description">Recibir notificaciones incluso con la app cerrada</div>
          </div>
        </div>
        <div class="settings-item-control">
          <label class="switch">
            <input 
              type="checkbox" 
              v-model="settings.useFCM"
              :disabled="!fcmAvailable"
            >
            <span class="slider" :class="{ 'disabled': !fcmAvailable }"></span>
          </label>
        </div>
      </div>
    </div>
    
    <!-- Información del dispositivo -->
    <div class="device-info-section">
      <h3 class="section-title">Información del dispositivo</h3>
      <div class="device-info">
        <div class="device-info-item">
          <div class="info-label">ID de Usuario:</div>
          <div class="info-value">{{ userId }}</div>
        </div>
        <div class="device-info-item">
          <div class="info-label">ID de Dispositivo:</div>
          <div class="info-value">{{ deviceId }}</div>
        </div>
      </div>
    </div>
    
    <!-- Botón de guardar -->
    <div class="form-actions">
      <button 
        class="save-button" 
        @click="saveSettings" 
        :disabled="isSaving"
      >
        <span class="material-icons" v-if="!isSaving">save</span>
        <span class="material-icons spin" v-else>sync</span>
        <span>{{ isSaving ? 'Guardando...' : 'Guardar configuración' }}</span>
      </button>
      
      <div v-if="saveMessage" class="save-message">
        {{ saveMessage }}
      </div>
    </div>
    
    <!-- Mensaje de guardado exitoso -->
    <div class="saved-toast" :class="{ 'show': showSavedMessage }">
      <span class="material-icons">check_circle</span>
      <span>Configuración guardada</span>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>

<style scoped>
.settings-panel {
  position: relative;
  padding-bottom: 24px;
}

.settings-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 16px 0;
  letter-spacing: 0.25px;
  padding: 0 4px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 24px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--color-card);
  transition: background-color 0.2s;
}

.settings-item:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.settings-item-label {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.settings-item-label .material-icons {
  font-size: 24px;
  color: var(--color-primary);
}

.setting-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2px;
}

.setting-description {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.settings-item-control {
  min-width: 80px;
}

/* Switch toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Select control */
.select-control {
  width: 100%;
  padding: 8px 24px 8px 8px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  background-color: var(--color-background-alt);
  color: var(--color-text);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 4px center;
  background-size: 16px;
}

/* Device info section */
.device-info-section {
  background-color: var(--color-card);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 12px 0;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-light);
}

.info-value {
  font-size: 0.8rem;
  color: var(--color-text);
  font-family: monospace;
  word-break: break-all;
}

/* Save button */
.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  height: 48px;
  font-weight: 500;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 300px;
}

.save-button:active:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-button .material-icons {
  font-size: 20px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.save-message {
  margin-top: 12px;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  text-align: center;
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--color-secondary-light);
  width: 100%;
  max-width: 300px;
}

/* Toast de guardado exitoso */
.saved-toast {
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background-color: var(--color-primary);
  color: white;
  padding: 8px 16px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
  z-index: 1000;
}

.saved-toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.saved-toast .material-icons {
  font-size: 18px;
}
</style>