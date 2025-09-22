import NotificationService from './NotificationService.js';
import StorageService from './StorageService.js';
import ApiService from './ApiService.js';

class PingService {
  constructor() {
    this.isActive = false;
    this.checkInterval = null;
    this.lastCheckTime = null;
    this.userId = null;
    this.deviceId = null;
    this.settings = null;
  }

  // Inicializar el servicio
  initialize() {
    this.userId = StorageService.getUserId();
    this.deviceId = StorageService.getDeviceId();
    this.settings = StorageService.getSettings();
    
    // Iniciar el servicio de notificaciones
    NotificationService.initialize();
    
    return true;
  }

  // Iniciar monitoreo de pings
  startMonitoring() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.lastCheckTime = new Date();
    
    // Verificar inmediatamente al iniciar
    this.checkForPings();
    
    // Programar verificación periódica (cada minuto)
    this.checkInterval = setInterval(() => {
      this.checkForPings();
    }, 60000); // 1 minuto
    
    // Iniciar verificación de recordatorios
    NotificationService.startReminderCheck();
    
    console.log('Monitoreo de pings iniciado');
    return true;
  }

  // Detener monitoreo de pings
  stopMonitoring() {
    if (!this.isActive) return;
    
    clearInterval(this.checkInterval);
    this.checkInterval = null;
    this.isActive = false;
    
    // Detener verificación de recordatorios
    NotificationService.stopReminderCheck();
    
    console.log('Monitoreo de pings detenido');
    return true;
  }

  // Verificar si hay pings pendientes
  async checkForPings() {
    if (!this.isActive || !this.userId) return;
    
    try {
      // Obtener instancias activas
      const instances = await ApiService.fetchInstances();
      
      // Filtrar solo instancias en ejecución
      const runningInstances = instances.filter(
        instance => instance.state.toLowerCase() === 'running'
      );
      
      if (runningInstances.length === 0) return;
      
      // Verificar la hora actual para determinar si es un tick de :00 o :30
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Si estamos cerca de un tick (dentro de 5 minutos después)
      const isNearTick = (minutes < 5 || (minutes >= 30 && minutes < 35)) && seconds < 30;
      
      if (!isNearTick) return;
      
      // Determinar el tickIso actual
      const tickHour = now.getHours();
      const tickMinute = minutes < 30 ? 0 : 30;
      const tickDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), tickHour, tickMinute, 0);
      const tickIso = tickDate.toISOString();
      
      // Verificar si el usuario debe recibir notificación en este tick
      // intervalMinutes: 30 = notificar a :00 y :30, 60 = solo a :00
      const shouldNotify = this.settings.intervalMinutes === 30 || 
                          (this.settings.intervalMinutes === 60 && tickMinute === 0);
      
      if (!shouldNotify) return;
      
      // Procesar cada instancia en ejecución
      for (const instance of runningInstances) {
        // Enviar notificación para confirmar uso
        await NotificationService.scheduleActionableNotification(
          instance.id,
          instance.name,
          tickIso,
          this.settings.graceMinutes
        );
      }
      
      this.lastCheckTime = now;
    } catch (error) {
      console.error('Error al verificar pings:', error);
    }
  }

  // Confirmar uso de una instancia
  async confirmUse(instanceId, tickIso) {
    if (!this.userId) return false;
    
    try {
      await ApiService.confirmUse(instanceId, this.userId, tickIso, 'use');
      return true;
    } catch (error) {
      console.error('Error al confirmar uso:', error);
      return false;
    }
  }

  // Confirmar que puede detenerse una instancia
  async confirmStop(instanceId, tickIso) {
    if (!this.userId) return false;
    
    try {
      await ApiService.confirmUse(instanceId, this.userId, tickIso, 'stop');
      return true;
    } catch (error) {
      console.error('Error al confirmar detención:', error);
      return false;
    }
  }
}

export default new PingService();
