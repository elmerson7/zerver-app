import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  constructor() {
    this.notificationId = 1;
    this.intervalId = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

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

      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Acción realizada en notificación:', notification);
      });

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      return false;
    }
  }

  async scheduleNotification(title, body, seconds = 5) {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) return false;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: this.notificationId++,
            schedule: { at: new Date(Date.now() + seconds * 1000) },
            sound: 'default',
            attachments: null,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
      return true;
    } catch (error) {
      console.error('Error al programar notificación:', error);
      return false;
    }
  }

  // Iniciar notificaciones periódicas cada X segundos
  startPeriodicNotifications(title, body, intervalSeconds = 120) {
    if (this.intervalId) {
      this.stopPeriodicNotifications();
    }

    // Primera notificación inmediata
    this.scheduleNotification(title, body, 1);

    // Programar notificaciones periódicas
    this.intervalId = setInterval(() => {
      this.scheduleNotification(title, body, 1);
    }, intervalSeconds * 1000);

    console.log(`Notificaciones periódicas iniciadas cada ${intervalSeconds} segundos`);
    return true;
  }

  // Detener notificaciones periódicas
  stopPeriodicNotifications() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Notificaciones periódicas detenidas');
      return true;
    }
    return false;
  }

  // Crear una notificación con canal de alta prioridad (para Android)
  async createHighPriorityChannel() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await LocalNotifications.createChannel({
        id: 'persistent-notifications',
        name: 'Notificaciones Persistentes',
        description: 'Canal para notificaciones que deben persistir',
        importance: 4, // HIGH: muestra en todas partes, hace sonido y puede aparecer como heads-up
        visibility: 1, // PUBLIC: visible en pantalla de bloqueo
        lights: true,
        vibration: true,
        sound: 'default',
      });
      console.log('Canal de alta prioridad creado');
      return true;
    } catch (error) {
      console.error('Error al crear canal de notificaciones:', error);
      return false;
    }
  }

  // Programar notificación con alta prioridad
  async scheduleHighPriorityNotification(title, body, seconds = 5) {
    await this.createHighPriorityChannel();
    
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: this.notificationId++,
            schedule: { at: new Date(Date.now() + seconds * 1000) },
            channelId: 'persistent-notifications',
            sound: 'default',
            ongoing: true, // Hace que la notificación sea persistente (solo Android)
            autoCancel: false, // Evita que se cancele al tocarla
            attachments: null,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
      return true;
    } catch (error) {
      console.error('Error al programar notificación de alta prioridad:', error);
      return false;
    }
  }

  // Iniciar notificaciones persistentes de alta prioridad
  startPersistentNotifications(title, body, intervalSeconds = 120) {
    if (this.intervalId) {
      this.stopPeriodicNotifications();
    }

    // Primera notificación inmediata
    this.scheduleHighPriorityNotification(title, body, 1);

    // Programar notificaciones periódicas de alta prioridad
    this.intervalId = setInterval(() => {
      this.scheduleHighPriorityNotification(title, body, 1);
    }, intervalSeconds * 1000);

    console.log(`Notificaciones persistentes iniciadas cada ${intervalSeconds} segundos`);
    return true;
  }
}

export default new NotificationService();
