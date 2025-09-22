import { LocalNotifications } from '@capacitor/local-notifications';
import StorageService from './StorageService.js';
import ApiService from './ApiService.js';

class NotificationService {
  constructor() {
    this.notificationId = 1;
    this.intervalId = null;
    this.initialized = false;
    this.activePings = new Map(); // Para almacenar los pings activos
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      // Solicitar permisos para notificaciones
      const permissionStatus = await LocalNotifications.requestPermissions();
      
      if (permissionStatus.display !== 'granted') {
        console.error('Permiso de notificaciones no concedido');
        return false;
      }

      // Registrar listeners para eventos de notificaciones
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('Notificación recibida:', notification);
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        console.log('Acción realizada en notificación:', notificationAction);
        
        // Procesar acciones de notificación
        this.handleNotificationAction(notificationAction);
      });

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      return false;
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
      
      // Crear notificación con acciones
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

      // Registrar el ping activo
      this.activePings.set(pingKey, {
        instanceId,
        tickIso,
        graceEndsAt,
        notificationSent: true
      });

      // Registrar acciones de notificación (solo una vez)
      if (!this.actionsRegistered) {
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
      }

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
}

export default new NotificationService();