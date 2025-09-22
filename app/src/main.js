import { createApp } from 'vue'
import { Capacitor } from '@capacitor/core'
import './style.css'
import App from './App.vue'
import NotificationService from './services/NotificationService.js'
import PingService from './services/PingService.js'
import StorageService from './services/StorageService.js'

// Inicializar servicios
const initializeApp = async () => {
  // Inicializar notificaciones
  await NotificationService.initialize()
  
  // Inicializar servicio de pings
  PingService.initialize()
  
  // Iniciar monitoreo si está habilitado en la configuración
  const settings = StorageService.getSettings()
  if (settings.notificationsEnabled) {
    PingService.startMonitoring()
  }
  
  // Registrar eventos de la aplicación
  if (Capacitor.isNativePlatform()) {
    document.addEventListener('resume', () => {
      console.log('App resumed')
      // Reiniciar servicios si es necesario
      if (settings.notificationsEnabled) {
        PingService.startMonitoring()
      }
    })
    
    document.addEventListener('pause', () => {
      console.log('App paused')
      // No detenemos el monitoreo para que siga funcionando en segundo plano
    })
  }
}

// Crear y montar la aplicación
const app = createApp(App)

// Montar la aplicación
app.mount('#app')

// Inicializar servicios después de montar la aplicación
initializeApp().catch(error => {
  console.error('Error al inicializar la aplicación:', error)
})