# Zerver App

## Descripción
Zerver App es una aplicación móvil desarrollada con Vue.js y Capacitor para crear aplicaciones nativas para Android a partir de código web.

## Estructura del Proyecto
```
zerver-app/
├── docker-compose.yml    # Configuración de Docker Compose
├── Dockerfile            # Configuración del entorno de desarrollo
└── workspace/
    └── vue-app/         # Aplicación Vue.js con Capacitor
```

## Requisitos
- Docker
- Docker Compose

## Tecnologías Utilizadas
- Vue.js 3
- Capacitor 7
- Node.js 22
- Android SDK

## Configuración del Entorno
El proyecto utiliza Docker para proporcionar un entorno de desarrollo consistente con todas las dependencias necesarias:

1. Node.js 22
2. Java 21
3. Android SDK
4. Vue CLI

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

4. Instala las dependencias:
```bash
cd vue-app
npm install
```

## Comandos Disponibles

### Desarrollo
```bash
npm run serve
```

### Compilación para producción
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Compilar para Android
```bash
npx cap sync android
npx cap open android
```

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
