import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import StorageService from './StorageService.js';
import ApiService from './ApiService.js';
import FCMService from './FCMService.js';

class NotificationService {
  constructor() {
    this.notificationId = 1;
    this.initialized = false;
    this.activePings = new Map(); // Para almacenar los pings activos
    this.actionsRegistered = false;
    this.fcmAvailable = false;
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      // Inicializar FCM si estamos en plataforma nativa
      if (Capacitor.isNativePlatform()) {
        this.fcmAvailable = await FCMService.initialize();
        console.log(`FCM ${this.fcmAvailable ? 'inicializado' : 'no disponible'}`);
      }

      // Inicializar notificaciones locales (siempre, como respaldo)
      const permissionStatus = await LocalNotifications.requestPermissions();
      
      if (permissionStatus.display !== 'granted') {
        console.error('Permiso de notificaciones locales no concedido');
        // Si FCM está disponible, podemos continuar aunque las notificaciones locales no estén permitidas
        if (!this.fcmAvailable) {
          return false;
        }
      }

      // Registrar listeners para eventos de notificaciones locales
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('Notificación local recibida:', notification);
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        console.log('Acción realizada en notificación local:', notificationAction);
        
        // Procesar acciones de notificación
        this.handleNotificationAction(notificationAction);
      });

      // Registrar acciones para notificaciones locales
      await this.registerActionTypes();

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      return false;
    }
  }

  // Registrar tipos de acciones para notificaciones
  async registerActionTypes() {
    if (this.actionsRegistered) return;
    
    try {
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'EC2_ACTIONS',
            actions: [
              {
                id: 'confirm',
                title: 'Sigo usándola'
              },
              {
                id: 'stop',
                title: 'Puede apagarse'
              }
            ]
          }
        ]
      });
      this.actionsRegistered = true;
    } catch (error) {
      console.error('Error al registrar tipos de acciones:', error);
    }
  }

  // Manejar acciones de notificación
  async handleNotificationAction(notificationAction) {
    const { notification } = notificationAction;
    const { id, actionId, extra } = notification;
    
    if (!extra || !extra.instanceId || !extra.tickIso) return;
    
    const { instanceId, tickIso } = extra;
    const userId = StorageService.getUserId();
    
    try {
      if (actionId === 'confirm') {
        // Confirmar uso de la instancia
        await ApiService.confirmUse(instanceId, userId, tickIso, 'use');
        console.log(`Uso confirmado para instancia ${instanceId}`);
      } else if (actionId === 'stop') {
        // Confirmar que puede detenerse
        await ApiService.confirmUse(instanceId, userId, tickIso, 'stop');
        console.log(`Detención confirmada para instancia ${instanceId}`);
      }
      
      // Eliminar el ping del mapa de pings activos
      this.activePings.delete(`${instanceId}-${tickIso}`);
    } catch (error) {
      console.error('Error al procesar acción de notificación:', error);
    }
  }

  // Programar notificación con acciones
  async scheduleActionableNotification(instanceId, instanceName, tickIso, graceMinutes) {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) return false;
    }

    const pingKey = `${instanceId}-${tickIso}`;
    if (this.activePings.has(pingKey)) {
      console.log(`Ya existe una notificación para el ping ${pingKey}`);
      return true;
    }

    try {
      // Calcular tiempo de gracia
      const graceEndsAt = new Date(new Date().getTime() + graceMinutes * 60 * 1000);
      const formattedTime = this.formatTime(graceEndsAt);
      
      const settings = StorageService.getSettings();
      let notificationSent = false;
      
      // Si FCM está disponible y habilitado en la configuración, usarlo primero
      if (this.fcmAvailable && settings.useFCM) {
        // FCM se gestiona en el servidor, no necesitamos hacer nada aquí
        // El token ya está registrado en el servidor
        console.log('Notificación FCM será enviada por el servidor');
        notificationSent = true;
      }
      
      // Siempre enviar notificación local como respaldo
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `¿Sigues usando ${instanceName || instanceId}?`,
            body: `La instancia se apagará automáticamente a las ${formattedTime} si nadie confirma su uso.`,
            id: this.notificationId++,
            schedule: { at: new Date() },
            sound: 'default',
            actionTypeId: 'EC2_ACTIONS',
            extra: {
              instanceId,
              tickIso,
              graceEndsAt: graceEndsAt.toISOString()
            }
          },
        ],
      });
      notificationSent = true;

      // Registrar el ping activo
      this.activePings.set(pingKey, {
        instanceId,
        instanceName,
        tickIso,
        graceEndsAt,
        notificationSent
      });

      return true;
    } catch (error) {
      console.error('Error al programar notificación con acciones:', error);
      return false;
    }
  }

  // Programar recordatorio para un ping existente
  async scheduleReminder(pingData) {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) return false;
    }

    try {
      const { instanceId, instanceName, tickIso, graceEndsAt } = pingData;
      const now = new Date();
      const graceEndsAtDate = new Date(graceEndsAt);
      
      // Si ya pasó el tiempo de gracia, no enviar recordatorio
      if (graceEndsAtDate <= now) return false;
      
      // Calcular tiempo restante en minutos
      const remainingMinutes = Math.ceil((graceEndsAtDate - now) / (60 * 1000));
      
      // Los recordatorios siempre se envían como notificaciones locales
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `RECORDATORIO: ¿Sigues usando ${instanceName || instanceId}?`,
            body: `Quedan ${remainingMinutes} minutos antes del apagado automático.`,
            id: this.notificationId++,
            schedule: { at: new Date() },
            sound: 'default',
            actionTypeId: 'EC2_ACTIONS',
            extra: {
              instanceId,
              tickIso,
              graceEndsAt
            }
          },
        ],
      });

      return true;
    } catch (error) {
      console.error('Error al programar recordatorio:', error);
      return false;
    }
  }

  // Formatear hora en formato legible
  formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  // Verificar si hay pings activos que necesitan recordatorio
  checkForReminders() {
    const now = new Date();
    
    this.activePings.forEach((pingData, key) => {
      const { graceEndsAt, lastReminderAt } = pingData;
      const graceEndsAtDate = new Date(graceEndsAt);
      
      // Si ya pasó el tiempo de gracia, eliminar el ping
      if (graceEndsAtDate <= now) {
        this.activePings.delete(key);
        return;
      }
      
      // Enviar recordatorio cada minuto, pero no más frecuente que cada 60 segundos
      const shouldSendReminder = !lastReminderAt || 
        (now - new Date(lastReminderAt)) >= 60000;
      
      if (shouldSendReminder) {
        this.scheduleReminder(pingData);
        pingData.lastReminderAt = now.toISOString();
      }
    });
  }

  // Iniciar verificación periódica de recordatorios
  startReminderCheck() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
    }
    
    // Verificar cada 30 segundos
    this.reminderIntervalId = setInterval(() => {
      this.checkForReminders();
    }, 30000);
  }

  // Detener verificación periódica de recordatorios
  stopReminderCheck() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = null;
    }
  }

  // Comprobar si FCM está disponible
  isFCMAvailable() {
    return this.fcmAvailable;
  }
}

export default new NotificationService();