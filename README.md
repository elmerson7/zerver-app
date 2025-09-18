# Zerver App

## Descripción
Zerver App es una aplicación móvil desarrollada con Vue.js y Capacitor para crear aplicaciones nativas para Android a partir de código web.

## Estructura del Proyecto
```
zerver-app/
├── docker-compose.yml    # Configuración de Docker Compose
├── Dockerfile            # Configuración del entorno de desarrollo
├── README.md             # Documentación del proyecto
└── app/                  # Directorio principal del proyecto
    ├── public/           # Archivos públicos estáticos
    ├── src/              # Código fuente de Vue.js
    │   ├── assets/       # Recursos estáticos (imágenes, estilos, etc.)
    │   ├── components/   # Componentes Vue reutilizables
    │   └── views/        # Vistas/páginas de la aplicación
    ├── android/          # Proyecto Android generado por Capacitor
    ├── dist/             # Archivos compilados para producción
    └── node_modules/     # Dependencias (no versionadas en Git)
```

## Requisitos
- Docker
- Docker Compose
- Git

## Tecnologías Utilizadas
- Vue.js 3
- Vite
- Capacitor 7
- Node.js 22
- Android SDK

## Configuración del Entorno
El proyecto utiliza Docker para proporcionar un entorno de desarrollo consistente con todas las dependencias necesarias:

1. Node.js 22
2. Java 21
3. Android SDK

## Instalación

Este proyecto ya está configurado con Vue.js 3, Vite y Capacitor. La configuración inicial se realizó una sola vez y el código está versionado en Git.

1. Clona este repositorio:
```bash
git clone <url-del-repositorio>
cd zerver-app
```

2. Inicia el contenedor Docker:
```bash
docker-compose up -d
```

3. Accede al contenedor:
```bash
docker exec -it vue-capacitor bash
```

4. Dentro del contenedor, instala las dependencias:
```bash
cd /app
npm install
```

## Comandos Disponibles

### Desarrollo

#### Dentro del contenedor:
```bash
npm run dev
```

### Compilación para producción

#### Dentro del contenedor:
```bash
npm run build
```

#### Con Docker (desde el host):
```bash
docker exec vue-capacitor bash -c "npm run build"
```

### Vista previa de la compilación

#### Dentro del contenedor:
```bash
npm run preview
```

### Compilar para Android

#### Dentro del contenedor:
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

#### Con Docker (desde el host):
```bash
docker exec vue-capacitor bash -c "npm run build && npx cap sync android"
docker exec vue-capacitor bash -c "cd /app/android && ./gradlew assembleDebug"
```

## Flujo de Trabajo de Desarrollo

### Control de Versiones
Todo el código del proyecto se encuentra en la carpeta `app/` y está configurado para ser versionado con Git. Se ha incluido un archivo `.gitignore` para excluir archivos innecesarios.

### Desarrollo Diario
1. Inicia el contenedor Docker (si no está en ejecución):
```bash
docker-compose up -d
```

2. Accede al contenedor:
```bash
docker exec -it vue-capacitor bash
```

3. Inicia el servidor de desarrollo:
```bash
cd /app
npm run dev
```

4. Accede a la aplicación desde tu navegador:
   - URL: http://localhost:8019
   - Si estás accediendo desde otra máquina, usa la IP del servidor: http://[IP-del-servidor]:8019


## Despliegue

### Generar una APK para Android

#### Dentro del contenedor:
1. Compila la aplicación:
```bash
cd /app
npm run build
```

2. Sincroniza los archivos con la plataforma Android:
```bash
npx cap sync android
```

3. Genera la APK utilizando Capacitor y Gradle:
```bash
cd android
./gradlew assembleDebug
```

#### Con Docker (desde el host):
```bash
# Compilar y sincronizar
docker exec vue-capacitor bash -c "cd /app && npm run build && npx cap sync android"

# Generar APK
docker exec vue-capacitor bash -c "cd /app/android && ./gradlew assembleDebug"
```

4. La APK generada estará disponible en: `app/android/app/build/outputs/apk/debug/app-debug.apk`

5. Para copiar la APK a la raíz del proyecto (fuera de la carpeta app):
```bash
# Dentro del contenedor
cp /app/android/app/build/outputs/apk/debug/app-debug.apk /app/..

# O desde el host con Docker
docker exec vue-capacitor bash -c "cp /app/android/app/build/outputs/apk/debug/app-debug.apk /app/.."
```

## Licencia
[Especificar licencia]

## Contacto
[Información de contacto]