import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import StorageService from './StorageService.js';
import ApiService from './ApiService.js';

class FCMService {
  constructor() {
    this.initialized = false;
    this.token = null;
  }

  async initialize() {
    // Solo inicializar en plataformas nativas (Android, iOS)
    if (!Capacitor.isNativePlatform()) {
      console.log('FCM solo está disponible en plataformas nativas');
      return false;
    }

    try {
      // Verificar permisos
      const permissionStatus = await FirebaseMessaging.checkPermissions();
      
      if (permissionStatus.receive !== 'granted') {
        console.log('Solicitando permisos para FCM...');
        const requestResult = await FirebaseMessaging.requestPermissions();
        if (requestResult.receive !== 'granted') {
          console.error('Permiso para FCM denegado');
          return false;
        }
      }

      // Registrar listeners para notificaciones
      await this.registerListeners();

      // Obtener token FCM
      const tokenResult = await FirebaseMessaging.getToken();
      if (tokenResult && tokenResult.token) {
        this.token = tokenResult.token;
        console.log('Token FCM obtenido:', this.token);
        
        // Guardar token en el almacenamiento local
        const settings = StorageService.getSettings();
        settings.fcmToken = this.token;
        StorageService.saveSettings(settings);
        
        // Registrar el token en el servidor
        await this.registerTokenWithServer();
      } else {
        console.error('No se pudo obtener el token FCM');
        return false;
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error al inicializar FCM:', error);
      return false;
    }
  }

  async registerListeners() {
    // Listener para token actualizado
    FirebaseMessaging.addListener('tokenReceived', async (event) => {
      console.log('Nuevo token FCM recibido:', event.token);
      this.token = event.token;
      
      // Actualizar token en el almacenamiento local
      const settings = StorageService.getSettings();
      settings.fcmToken = this.token;
      StorageService.saveSettings(settings);
      
      // Registrar el nuevo token en el servidor
      await this.registerTokenWithServer();
    });

    // Listener para notificaciones en primer plano
    FirebaseMessaging.addListener('notificationReceived', (notification) => {
      console.log('Notificación FCM recibida en primer plano:', notification);
    });

    // Listener para notificaciones en segundo plano (cuando se hace clic)
    FirebaseMessaging.addListener('notificationActionPerformed', (notification) => {
      console.log('Acción realizada en notificación FCM:', notification);
      this.handleNotificationAction(notification);
    });

    return true;
  }

  async registerTokenWithServer() {
    if (!this.token) return false;

    try {
      const userId = StorageService.getUserId();
      const deviceId = StorageService.getDeviceId();
      const settings = StorageService.getSettings();
      
      // Registrar dispositivo con el token FCM
      await ApiService.registerDevice({
        userId,
        deviceId,
        fcmToken: this.token,
        intervalMinutes: settings.intervalMinutes,
        graceMinutes: settings.graceMinutes
      });
      
      return true;
    } catch (error) {
      console.error('Error al registrar token FCM en el servidor:', error);
      return false;
    }
  }

  async handleNotificationAction(notification) {
    // Extraer datos de la notificación
    const data = notification.notification.data;
    
    if (!data || !data.instanceId || !data.tickIso) {
      console.log('Notificación FCM sin datos necesarios');
      return;
    }
    
    const { instanceId, tickIso, action } = data;
    const userId = StorageService.getUserId();
    
    try {
      // Determinar la acción basada en los datos de la notificación
      const decision = action === 'confirm' ? 'use' : 'stop';
      
      // Enviar confirmación al servidor
      await ApiService.confirmUse(instanceId, userId, tickIso, decision);
      console.log(`Acción ${decision} enviada para instancia ${instanceId}`);
    } catch (error) {
      console.error('Error al procesar acción de notificación FCM:', error);
    }
  }

  getToken() {
    return this.token;
  }

  isInitialized() {
    return this.initialized;
  }
}

export default new FCMService();
