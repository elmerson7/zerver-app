# Zerver App

## Descripción
Zerver App es una aplicación móvil desarrollada con Vue.js y Capacitor para crear aplicaciones nativas para Android a partir de código web.

## Estructura del Proyecto
```
zerver-app/
├── docker-compose.yml    # Configuración de Docker Compose
├── Dockerfile            # Configuración del entorno de desarrollo
└── app/                  # Directorio principal del proyecto
    ├── public/           # Archivos públicos
    ├── src/              # Código fuente
    ├── android/          # Proyecto Android generado por Capacitor
    └── ...               # Otros archivos de configuración
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

4. Dentro del contenedor, crea un nuevo proyecto Vue con Vite:
```bash
cd /app
npm create vite@latest . -- --template vue
```

5. Instala las dependencias:
```bash
npm install
```

6. Instala Capacitor:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init [nombre-app] [id-app] --web-dir=dist
```

7. Añade la plataforma Android:
```bash
npm install @capacitor/android
npx cap add android
```

## Comandos Disponibles

### Desarrollo (dentro del contenedor)
```bash
npm run dev
```

### Compilación para producción (dentro del contenedor)
```bash
npm run build
```

### Vista previa de la compilación (dentro del contenedor)
```bash
npm run preview
```

### Compilar para Android (dentro del contenedor)
```bash
npm run build
npx cap sync android
npx cap open android
```

## Control de Versiones
Todo el código del proyecto se encuentra en la carpeta `app/` y está configurado para ser versionado con Git. Se ha incluido un archivo `.gitignore` para excluir archivos innecesarios.

## Despliegue
Para generar una APK para Android:

1. Sincroniza los archivos con la plataforma Android:
```bash
npx cap sync android
```

2. Abre el proyecto en Android Studio:
```bash
npx cap open android
```

3. Desde Android Studio, selecciona Build > Build Bundle(s) / APK(s) > Build APK(s)

## Licencia
[Especificar licencia]

## Contacto
[Información de contacto]