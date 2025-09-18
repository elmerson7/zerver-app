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

### Solución de problemas de permisos

Si encuentras errores de permisos al ejecutar comandos, puedes corregirlos con:

```bash
# Para scripts de Node.js
chmod -R 755 /app/node_modules/.bin/

# Para scripts de Gradle
chmod +x /app/android/gradlew
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
cd android
./gradlew assembleDebug
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

5. Realiza tus cambios en el código fuente.

6. Cuando termines, puedes hacer commit de tus cambios:
```bash
# Fuera del contenedor, en la raíz del proyecto
git add .
git commit -m "Descripción de los cambios"
git push
```

## Despliegue

### Generar una APK para Android
1. Dentro del contenedor, compila la aplicación:
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
   
   Si encuentras errores de permisos, ejecuta:
   ```bash
   chmod +x ./gradlew
   ```

4. La APK generada estará disponible en: `android/app/build/outputs/apk/debug/app-debug.apk`

### Actualizar la aplicación Android después de cambios
Cada vez que realices cambios significativos en el código y quieras actualizar la aplicación Android:

1. Compila la aplicación:
```bash
npm run build
```

2. Sincroniza con Android:
```bash
npx cap sync android
```

## Licencia
[Especificar licencia]

## Contacto
[Información de contacto]