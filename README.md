# SETUP — Sistema de Gestión de Información Académica de Docentes

Esta guía describe cómo preparar y ejecutar la versión actual del proyecto en un equipo de desarrollo. La aplicación utiliza Node.js, Express y SQLite. La base inicial `db/app.db` se incluye en el repositorio para facilitar la ejecución sin tener que migrar los datos manualmente.

## 1. Requisitos previos

- Git.
- Node.js y npm instalados. El entorno de desarrollo usado para esta versión ha utilizado Node.js `v24.19.0`.
- Un navegador web moderno.
- Un editor de código, recomendado para abrir el proyecto y servir las páginas HTML durante el desarrollo.

Verifica las instalaciones desde una terminal:

```bash
node --version
npm --version
git --version
```

## 2. Descargar el proyecto

Clona la rama de desarrollo, que contiene la versión de trabajo del proyecto:

```bash
git clone --branch desarrollo https://github.com/kevin-coronado-carmona-201398/sistema-gestion-docentes.git
cd sistema-gestion-docentes
```

Si el repositorio o el nombre de la rama cambian, utiliza la URL y rama que indique el responsable del proyecto.

## 3. Instalar dependencias

Desde la carpeta raíz, ejecuta:

```bash
npm install
```

Esto instala las dependencias declaradas en `package.json`, incluidas las utilizadas por el servidor Express y el acceso a SQLite. No es necesario instalar SQLite por separado para usar `better-sqlite3` en el flujo habitual de esta aplicación.

## 4. Verificar la base de datos

Comprueba que exista este archivo:

```text
db/app.db
```

La base de datos inicial se distribuye con el repositorio. Por tanto, **en una instalación normal no ejecutes `crearDb.mjs` ni `crearTablas.mjs`**: esos scripts sirven para preparar una base de datos, pero no sustituyen la base inicial con sus datos de demostración.

Si `db/app.db` no existe, primero verifica que clonaste la rama correcta y que el archivo esté disponible en el repositorio. Los scripts de creación permiten crear el archivo y las tablas, pero una base recién creada no tendrá necesariamente los mismos datos de demostración.

## 5. Iniciar la API

Desde la raíz del proyecto, ejecuta:

```bash
node server.js
```

La terminal debe mostrar un mensaje similar a:

```text
Servidor Express ejecutándose en http://localhost:3000
```

Deja esa terminal abierta mientras utilices la aplicación. Para detener el servidor, presiona `Ctrl+C`.

Puedes comprobar que Express responde abriendo esta dirección en el navegador:

```text
http://localhost:3000/
```

Esta ruta muestra un mensaje de estado del servidor; **no es la página principal de la interfaz**.

## 6. Abrir la interfaz

La interfaz web se encuentra en los archivos HTML de la raíz del proyecto, como `home.html`, `docentes.html`, `academias.html`, `materias.html` y `asignacion.html`. El servidor Express actual expone la API, pero no sirve esos archivos HTML como páginas estáticas.

Durante el desarrollo, abre la carpeta del proyecto en el editor y utiliza una herramienta de servidor estático —por ejemplo, la extensión Live Server de Visual Studio Code— para abrir `home.html`. Mantén Express ejecutándose en `http://localhost:3000`, que es la dirección que utiliza la interfaz para consultar la API.

Si la página abre pero no muestra datos, abre las herramientas de desarrollador del navegador y revisa la consola y la pestaña de red. Confirma que el servidor esté activo y que las solicitudes se dirijan a `http://localhost:3000`.

## 7. Persistencia de datos

Los registros se guardan en `db/app.db`. Los cambios válidos deberían permanecer después de detener y reiniciar el servidor.

Para comprobarlo:

1. Inicia la API con `node server.js`.
2. Crea o modifica un registro de prueba desde la interfaz.
3. Detén el servidor con `Ctrl+C`.
4. Inicia de nuevo el servidor.
5. Recarga la interfaz y verifica que el registro siga ahí.

### Precaución con Git

Como `db/app.db` forma parte del repositorio, los cambios realizados durante las pruebas pueden aparecer en `git status` como una modificación del archivo binario. No confirmes esos cambios automáticamente: la base puede contener registros creados durante una demostración.

Si deseas descartar **todos los cambios locales de la base y restaurar exactamente la versión de Git**, detén primero el servidor y ejecuta:

```bash
git restore db/app.db
```

Este comando es destructivo para los cambios locales de la base de datos. Úsalo únicamente cuando estés seguro de que no necesitas conservar esos registros.

Para hacer una copia de seguridad manual, detén el servidor y copia `db/app.db` a una ubicación segura antes de restaurar o reemplazar el archivo.

## 8. Archivos de base de datos y scripts de creación

- `db/app.db`: base inicial utilizada por la aplicación.
- `db/crearDb.mjs`: script de preparación del archivo SQLite.
- `db/crearTablas.mjs`: script de creación de las tablas.
- `db/DaoBetterSqlite3.mjs`: capa de acceso a la base de datos.
- `db/model.*.mjs`: modelos que realizan las operaciones de cada entidad.

Los scripts de creación no forman parte del inicio rutinario de la aplicación cuando `db/app.db` ya existe y contiene los datos necesarios.

## 9. Problemas frecuentes

### `Cannot find module ...`

Ejecuta `npm install` desde la raíz del proyecto y vuelve a iniciar el servidor.

### El puerto 3000 ya está en uso

Detén la otra instancia del servidor. Si no sabes qué proceso lo ocupa, revisa los procesos activos antes de cerrar uno. El puerto se encuentra fijado en `server.js` hasta completar la futura integración de `.env`.

### La interfaz no carga datos

Verifica que `node server.js` siga activo y que la interfaz envíe las solicitudes a `http://localhost:3000`. Revisa la consola y la pestaña de red del navegador para identificar errores de conexión o respuestas HTTP.

### La base de datos no aparece o SQLite devuelve un error

Verifica que estés ejecutando `node server.js` desde la carpeta raíz del proyecto y que exista `db/app.db`. No reemplaces el archivo con una base nueva sin respaldar primero los datos que necesites conservar.

### Aparecen cambios inesperados en `git status`

Es posible que hayas modificado `db/app.db` al utilizar la aplicación. Revisa el estado antes de confirmar cambios y no incluyas el archivo en un commit si contiene datos de prueba que no deben compartirse.

## 10. Consideraciones de seguridad

- La versión actual no implementa autenticación ni autorización. Úsala en un entorno local o controlado.
- No expongas el servidor a Internet ni a una red no confiable sin revisar antes los controles de acceso y la configuración de CORS.
- Las consultas a SQLite deben continuar usando sentencias preparadas y parámetros.
- No subas credenciales ni secretos al repositorio. Cuando se integre `.env`, el archivo local deberá ignorarse mediante `.gitignore` y se deberá distribuir una plantilla sin secretos, por ejemplo `.env.example`.
- Antes de compartir una base de datos modificada, revisa que no contenga datos personales o registros de prueba que no deban publicarse.

## 11. Flujo rápido de trabajo

En una instalación ya preparada, los pasos habituales son:

```bash
cd sistema-gestion-docentes
node server.js
```

Después, abre `home.html` mediante un servidor estático de desarrollo en el navegador. Mantén ambas partes activas: la interfaz y la API de Express.
