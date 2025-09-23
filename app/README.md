# EC2 Control App

Aplicación móvil para monitorear y controlar instancias EC2 de AWS, con notificaciones para confirmar uso y evitar gastos innecesarios.

## Características

- Lista de instancias EC2 con estado actual
- Control de inicio/parada de instancias
- Sistema de notificaciones para confirmar uso de instancias
- Configuración de intervalos y tiempos de gracia
- Soporte para notificaciones push con Firebase Cloud Messaging (FCM)
- Interfaz nativa con Material Design
- Modo oscuro

## Tecnologías

- Vue 3
- Capacitor
- Firebase Cloud Messaging (FCM)
- Material Design

## Configuración del proyecto

### Instalación

```bash
# Instalar dependencias
npm install

# Compilar para desarrollo
npm run dev

# Compilar para producción
npm run build

# Sincronizar con Capacitor
npx cap sync
```

### Configuración de Firebase Cloud Messaging (FCM)

Para habilitar las notificaciones push con FCM, es necesario configurar Firebase en el proyecto:

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Registrar la aplicación Android con el package name `com.zerver.ec2control`
3. Descargar el archivo `google-services.json` generado
4. Colocar el archivo en la carpeta `android/app/`

> **IMPORTANTE**: El archivo `google-services.json` contiene credenciales sensibles y **NO** debe incluirse en el control de versiones. Este archivo ya está configurado en `.gitignore`.

#### Estructura del archivo google-services.json

El archivo `google-services.json` tiene la siguiente estructura básica:

```json
{
  "project_info": {
    "project_number": "123456789012",
    "project_id": "tu-proyecto-firebase",
    "storage_bucket": "tu-proyecto-firebase.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789012:android:abc123def456",
        "android_client_info": {
          "package_name": "com.zerver.ec2control"
        }
      },
      "api_key": [
        {
          "current_key": "tu-clave-api-aqui"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

Para facilitar el desarrollo, se proporciona un archivo de ejemplo `google-services.json.example` que debe renombrarse y completarse con las credenciales reales.

## API Backend

La aplicación se comunica con una API REST alojada en AWS API Gateway:

- Base URL: `https://<ID_API>.execute-api.us-east-2.amazonaws.com/prod/`
- Endpoints:
  - `GET /instances`: Lista todas las instancias EC2
  - `POST /instances/{id}/start`: Inicia una instancia
  - `POST /instances/{id}/stop`: Detiene una instancia
  - `POST /confirm`: Confirma uso de una instancia
  - `POST /register-device`: Registra un dispositivo para notificaciones

## Estructura del proyecto

```
app/
├── android/                # Código nativo Android
│   └── app/
│       └── google-services.json  # Configuración de Firebase (no incluido)
├── public/                 # Archivos estáticos
├── src/
│   ├── components/         # Componentes Vue
│   │   ├── InstanceItem.vue
│   │   ├── InstanceList.vue
│   │   └── SettingsPanel.vue
│   ├── services/           # Servicios
│   │   ├── ApiService.js   # Comunicación con API
│   │   ├── FCMService.js   # Firebase Cloud Messaging
│   │   ├── NotificationService.js
│   │   ├── PingService.js
│   │   └── StorageService.js
│   ├── App.vue             # Componente raíz
│   ├── main.js             # Punto de entrada
│   └── style.css           # Estilos globales
├── capacitor.config.json   # Configuración de Capacitor
├── index.html
├── package.json
└── vite.config.js
```

## Seguridad

- El archivo `google-services.json` contiene credenciales sensibles y **NO** debe incluirse en el control de versiones.
- Las credenciales de AWS se manejan en el backend, no en la aplicación móvil.
- Se recomienda implementar autenticación de usuarios en futuras versiones.

## Próximas mejoras

- Implementación completa de FCM para notificaciones push
- Autenticación de usuarios
- Soporte para múltiples cuentas de AWS
- Métricas y estadísticas de uso
- Programación de encendido/apagado automático