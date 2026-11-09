# SETUP — Sistema de Gestión de Información Académica de Docentes

Esta guía explica cómo descargar, instalar, configurar y ejecutar el proyecto en un equipo de desarrollo. La aplicación utiliza Node.js, Express y SQLite. La interfaz se sirve por separado mediante un servidor estático y se comunica con la API local.

La base inicial `db/app.db` se incluye en el repositorio para facilitar la ejecución. En una instalación normal no es necesario crear manualmente la base de datos ni ejecutar scripts de inicialización.

## 1. Requisitos previos

Instala o prepara los siguientes componentes:

- **Git**, para clonar y actualizar el repositorio.
- **Node.js y npm**. El proyecto se ha desarrollado y probado con Node.js `v24.19.0`. Se recomienda utilizar esa versión para reproducir el entorno conocido.
- **Un navegador web moderno**, como Chrome, Edge o Firefox.
- **Visual Studio Code** (recomendado) y la extensión **Live Server**, o bien **Python 3** para servir los archivos HTML localmente.

No es necesario instalar un servidor SQLite ni la herramienta de línea de comandos `sqlite3`. La aplicación accede a la base de datos mediante `better-sqlite3`, instalado como dependencia de Node.js.

Verifica las herramientas desde una terminal:

```bash
node --version
npm --version
git --version
```

La versión de Node.js debe ser compatible con las dependencias declaradas en `package.json`. Para reproducir el entorno utilizado durante el desarrollo, usa Node.js `v24.19.0`.

## 2. Descargar el proyecto

La rama de trabajo para la instalación y ejecución del proyecto es `main`.

```bash
git clone --branch main --single-branch https://github.com/kevin-coronado-carmona-201398/sistema-gestion-docentes.git
cd sistema-gestion-docentes
```

Comprueba que estás en la rama correcta:

```bash
git branch --show-current
```

El resultado esperado es:

```text
main
```

### 2.1 Actualizar una copia que ya existe

Si ya tienes el repositorio clonado, entra en su carpeta y actualiza la rama `main`:

```bash
git switch main
git pull --ff-only origin main
```

Si Git informa que tienes cambios locales que impiden actualizar, revisa primero `git status`. No descartes cambios sin comprobar si necesitas conservarlos.

## 3. Instalar dependencias

Desde la carpeta raíz del proyecto, instala las dependencias:

```bash
npm install
```

Este comando instala los paquetes declarados en `package.json`, incluidos Express y `better-sqlite3`.

Si el repositorio contiene `package-lock.json` y deseas instalar exactamente las versiones registradas en ese archivo, también puedes utilizar:

```bash
npm ci
```

Utiliza `npm install` cuando necesites instalar o actualizar dependencias y `npm ci` cuando quieras reproducir una instalación limpia a partir del archivo de bloqueo. No ejecutes ambos comandos de manera rutinaria.

Si la instalación de `better-sqlite3` falla en Windows al compilar su módulo nativo, revisa primero que estés usando una versión compatible de Node.js y vuelve a ejecutar la instalación. Si el mensaje de error indica que faltan herramientas de compilación, puede ser necesario instalar Visual Studio Build Tools con la carga de trabajo **Desarrollo para el escritorio con C++**.

## 4. Verificar la base de datos

Comprueba que exista el siguiente archivo:

```text
db/app.db
```

La base de datos inicial se distribuye con el repositorio. El servidor utiliza esa ruta para abrir SQLite.

**No ejecutes `db/crearDb.mjs` ni `db/crearTablas.mjs` durante una instalación normal.** Esos scripts preparan una base nueva y no sustituyen la base distribuida con sus datos de demostración. Una base creada desde cero puede requerir pasos adicionales de inicialización y no necesariamente contendrá los mismos registros.

Si `db/app.db` no existe después de clonar el proyecto:

1. Confirma que estás en la rama `main`.
2. Comprueba que la descarga del repositorio terminó correctamente.
3. Verifica si el archivo está presente en el repositorio remoto o solicita la copia inicial al responsable del proyecto.

No reemplaces una base existente sin hacer antes una copia de seguridad.

### 4.1 Inicialización de plantillas

Durante el inicio, `server.js` invoca `modelPlantillas.seedDefaults()`. Por tanto, la inicialización de las plantillas predeterminadas forma parte del arranque del servidor; no se necesita ejecutar manualmente un script separado para ello.

## 5. Iniciar la API de Express

Abre una terminal en la carpeta raíz del proyecto y ejecuta:

```bash
node server.js
```

La terminal debe mostrar un mensaje similar a:

```text
Servidor Express ejecutándose en http://localhost:3000
```

Mantén esa terminal abierta mientras utilices la aplicación. Para detener el servidor, presiona `Ctrl+C`.

### 5.1 Comprobar que la API responde

Abre en el navegador:

```text
http://localhost:3000/
```

La ruta raíz muestra un mensaje de estado del servidor. **No es la página principal de la interfaz.**

También puedes consultar un recurso desde otra terminal. En Windows CMD o PowerShell utiliza `curl.exe`:

```bash
curl.exe http://localhost:3000/academias
curl.exe http://localhost:3000/cursos
curl.exe http://localhost:3000/horarios
curl.exe "http://localhost:3000/plantillas?soloActivas=true"
```

En macOS o Linux puedes utilizar `curl` en lugar de `curl.exe`.

Si la API responde con JSON, el servidor está atendiendo las solicitudes.

## 6. Iniciar la interfaz web

La interfaz está formada por archivos HTML ubicados en la raíz del proyecto, como `home.html`, `docentes.html`, `academias.html`, `materias.html` y `asignacion.html`.

**Express expone la API, pero no sirve estos archivos HTML como páginas estáticas.** Por eso, además de iniciar Express, debes abrir la interfaz mediante un servidor estático de desarrollo. No abras las páginas directamente con una dirección `file:///`.

Puedes utilizar cualquiera de los siguientes métodos.

### Frontend.

```cmd
npx serve -p 5000
```

Después abre:

```text
http://localhost:5000/home.html
```

Para detener el servidor estático, presiona `Ctrl+C` en su terminal.

## 7. Configuración y modificación de puertos

La configuración actual utiliza dos puertos independientes:

| Servicio | Puerto habitual | Configuración |
|---|---:|---|
| API de Express | `3000` | `server.js` y `js/api.js` |
| Frontend | `5000` en los comandos de esta guía | Parámetro del comando `http.server` |

El puerto de la interfaz puede ser diferente del puerto de la API. Lo importante es que la dirección de la API configurada en el frontend coincida con el puerto real de Express.

### 7.1 Cambiar el puerto de Express

Por defecto, `server.js` contiene:

```javascript
const PORT = 3000;
```

Por ejemplo, para utilizar el puerto `3001`, cambia esa línea por:

```javascript
const PORT = 3001;
```

Guarda el archivo y reinicia Express. El servidor debe mostrar ahora `http://localhost:3001`.

### 7.2 Actualizar la dirección de la API en el frontend

El archivo `js/api.js` contiene la dirección que utiliza la interfaz para comunicarse con Express:

```javascript
export const API_URL = "http://localhost:3000";
```

Si cambiaste Express al puerto `3001`, actualiza también esa línea:

```javascript
export const API_URL = "http://localhost:3001";
```

**Debes actualizar ambos archivos.** Si modificas el puerto de Express pero dejas el valor anterior en `js/api.js`, la interfaz seguirá intentando conectarse al puerto `3000` y no podrá cargar ni guardar información.

La versión actual utiliza estos valores definidos directamente en el código: **no está configurada para leer el puerto desde un archivo `.env`**. Crear o modificar un `.env` por sí solo no cambiará el puerto.

## 8. Flujo habitual de inicio

Una vez realizada la instalación inicial, utiliza dos terminales.

**Terminal 1 — Backend:**

```bash
cd sistema-gestion-docentes
node server.js
```

**Terminal 2 — Frontend:**

Desde la raíz del proyecto, si utilizas Python:

```bash
npx serve -p 5000
```

Abre la interfaz en:

```text
http://localhost:5000/home.html
```

## 9. Persistencia y respaldo de datos

Los registros se guardan en `db/app.db`. Los cambios válidos permanecen después de cerrar y reiniciar Express, porque se almacenan en el archivo SQLite.

Para comprobar la persistencia:

1. Inicia la API y la interfaz.
2. Crea o modifica un registro de prueba.
3. Detén Express con `Ctrl+C`.
4. Inicia Express de nuevo con `node server.js`.
5. Recarga la interfaz y comprueba que el registro siga disponible.

### 9.1 Crear una copia de seguridad

Antes de restaurar la base o hacer cambios importantes, detén Express y copia `db/app.db` a una ubicación fuera del repositorio.

En Windows CMD, por ejemplo:

```cmd
copy db\app.db "%USERPROFILE%\Desktop\app-backup.db"
```

En macOS o Linux:

```bash
cp db/app.db ~/app-backup.db
```

Conserva la copia en un lugar seguro. No la guardes dentro de `db/` si no deseas que aparezca como un archivo adicional del proyecto.

### 9.2 Cambios de la base de datos en Git

Como `db/app.db` forma parte del repositorio, las operaciones realizadas durante las pruebas pueden aparecer en `git status` como una modificación de un archivo binario.

Antes de confirmar cambios, revisa:

```bash
git status --short
```

No incluyas automáticamente `db/app.db` en un commit: puede contener registros de demostración o datos locales que no deban compartirse.

Si necesitas descartar **todos los cambios locales no confirmados** de la base de datos y restaurar la versión registrada en el commit actual de Git, primero detén Express y crea un respaldo. Después ejecuta:

```bash
git restore -- db/app.db
```

Este comando es destructivo para los cambios locales de la base. No lo utilices si necesitas conservar registros creados durante las pruebas. Si la base ya tiene cambios confirmados en otro commit, restaurará la versión del commit actual, no necesariamente una copia remota más reciente.

## 10. Estructura general del proyecto

La estructura principal es la siguiente:

```text
sistema-gestion-docentes/
├── server.js                 # Servidor Express y rutas de la API
├── home.html                 # Página principal
├── academias.html            # Gestión de academias
├── docentes.html             # Gestión de docentes
├── materias.html             # Gestión de materias
├── asignacion.html           # Asignaciones, horarios y dominios
├── styles.css                # Estilos de la interfaz
├── js/                       # Módulos JavaScript del frontend
│   ├── api.js                # Comunicación HTTP con Express
│   ├── main.js               # Inicialización de la aplicación
│   ├── state.js              # Estado compartido
│   ├── cursos.js             # Interfaz de materias
│   ├── asignaciones.js       # Interfaz y lógica de asignaciones
│   └── ...                   # Otros módulos del frontend
└── db/
    ├── app.db                # Base de datos SQLite
    ├── DaoBetterSqlite3.mjs  # Acceso a SQLite
    └── model.*.mjs           # Modelos de datos
```

La interfaz está organizada en módulos JavaScript. Express recibe las solicitudes HTTP y los modelos utilizan el DAO para consultar o modificar SQLite.

## 11. Problemas frecuentes

### `Cannot find module ...`

Comprueba que estás en la raíz del proyecto y ejecuta:

```bash
npm install
```

Después vuelve a iniciar el servidor.

### `EADDRINUSE` o el puerto ya está en uso

Otra aplicación está utilizando el puerto solicitado. Revisa el proceso con `netstat -ano | findstr :3000` en Windows o selecciona otro puerto. Si cambias el puerto de Express, recuerda actualizar también `API_URL` en `js/api.js`.

### La interfaz no carga datos o aparece `Failed to fetch`

Comprueba lo siguiente:

1. Que Express siga ejecutándose en la terminal correspondiente.
2. Que la API responda en `http://localhost:3000/` (o en el puerto configurado).
3. Que `API_URL` en `js/api.js` coincida con la dirección y el puerto de Express.
4. Que estés abriendo la interfaz mediante Live Server o un servidor estático, no mediante `file:///`.
5. Que la consola y la pestaña **Network/Red** del navegador no muestren errores HTTP o de conexión.

### La página abre, pero los módulos JavaScript no funcionan

Abre la página mediante un servidor estático y confirma que el HTML cargue `js/main.js` con `type="module"`. No abras los archivos HTML directamente desde el sistema de archivos.

### `better-sqlite3` no se encuentra o no puede cargarse

Ejecuta `npm install` desde la raíz. Si la instalación falla al compilar el módulo nativo en Windows, revisa la versión de Node.js y los requisitos de compilación indicados en la sección 3.

### SQLite indica que no encuentra la base de datos

Comprueba que exista `db/app.db` y que hayas clonado la rama `main`. No ejecutes scripts de creación para reemplazar la base distribuida sin seguir primero las instrucciones del responsable del proyecto.

### Aparecen cambios inesperados en `git status`

Es posible que hayas modificado `db/app.db` durante las pruebas. Revisa el estado y respalda la base antes de restaurarla. No descartes los cambios automáticamente.

## 12. Consideraciones de seguridad

- La versión actual no implementa autenticación ni autorización. Está destinada a un entorno local o controlado.
- No expongas Express a Internet ni a redes no confiables sin implementar primero controles de acceso y revisar la configuración de CORS.
- El servidor actual utiliza una política CORS permisiva para facilitar la comunicación local entre la interfaz y la API. Esto no sustituye la autenticación ni constituye una configuración adecuada para producción.
- Las consultas a SQLite deben continuar utilizando sentencias preparadas y parámetros.
- No subas credenciales, tokens ni secretos al repositorio.
- Antes de compartir una base de datos modificada, comprueba que no contenga datos personales o registros que no deban publicarse.

## 13. Resumen de comandos

| Tarea | Comando |
|---|---|
| Clonar la rama principal | `git clone --branch main --single-branch https://github.com/kevin-coronado-carmona-201398/sistema-gestion-docentes.git` |
| Entrar al proyecto | `cd sistema-gestion-docentes` |
| Instalar dependencias | `npm install` |
| Iniciar la API | `node server.js` |
| Verificar la API | `curl.exe http://localhost:3000/` |
| Iniciar frontend | `npx serve -p 5000` |
| Abrir la página principal | `http://localhost:5000/home.html` |
| Verificar la rama actual | `git branch --show-current` |
| Actualizar la rama principal | `git switch main` y `git pull --ff-only origin main` |
| Revisar cambios locales | `git status --short` |

Para el trabajo cotidiano, mantén activa la API de Express y el servidor estático de la interfaz en terminales separadas.