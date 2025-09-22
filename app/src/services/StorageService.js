class StorageService {
  constructor() {
    this.USER_ID_KEY = 'zerver_user_id';
    this.DEVICE_ID_KEY = 'zerver_device_id';
    this.SETTINGS_KEY = 'zerver_settings';
  }

  // Generar un ID único para el usuario si no existe
  getUserId() {
    let userId = localStorage.getItem(this.USER_ID_KEY);
    if (!userId) {
      userId = 'user_' + this.generateUniqueId();
      localStorage.setItem(this.USER_ID_KEY, userId);
    }
    return userId;
  }

  // Generar un ID único para el dispositivo si no existe
  getDeviceId() {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = 'device_' + this.generateUniqueId();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  // Guardar configuración del usuario
  saveSettings(settings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  // Obtener configuración del usuario
  getSettings() {
    const settings = localStorage.getItem(this.SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {
      intervalMinutes: 30,
      graceMinutes: 2,
      notificationsEnabled: true
    };
  }

  // Generar un ID único
  generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}

export default new StorageService();
