# Dashcam iPhone Pro — Estructura y funcionamiento interno (v4.2.6)

> Documento pensado para **modificar y mantener** la app con seguridad: arquitectura, recursos, flujos, módulos, funciones clave, almacenamiento, PWA, mapas y ayuda.

---

## 1) Resumen rápido

**Dashcam iPhone Pro** es una **PWA** (Progressive Web App) que permite:

- Grabar vídeo desde cámara usando **MediaRecorder** (MP4/WebM según plataforma).
- Dibujar un **overlay** en tiempo real sobre un **canvas** (marca de agua, GPS, y opcionalmente ruta GPX).
- Registrar **GPS** con `watchPosition` y construir un track en memoria; después genera/guarda GPX.
- Gestionar una **galería** de vídeos y GPX, con selección múltiple, exportación, borrado, combinación, migraciones iOS→Windows, etc.
- Visualizar tracks en mapas **Leaflet** (reproductor y visor GPX).
- Funcionar offline parcialmente con **Service Worker**.

La lógica se concentra en un único fichero JS con una clase grande: `DashcamApp` (v4.2.6). fileciteturn20file7

---

## 2) Inventario de archivos y responsabilidades

### 2.1 Núcleo de la app

- **`Dashcam.html`**: layout (pantallas, paneles, modales, controles) + carga de libs externas y scripts. fileciteturn17file0
- **`Dashcam_App.js`**: toda la lógica: estado, UI, grabación, GPS, GPX, base de datos, galería, mapas, PWA, etc. fileciteturn20file7
- **`Dashcam_styles.css`**: estilos de pantallas, paneles, listas, modales, controles. fileciteturn17file1

### 2.2 PWA / Offline

- **`Dashcam_manifest.json`**: metadata PWA (name, scope, start_url, icons, shortcuts). fileciteturn20file15
- **`Dashcam_service-worker.js`**: caché offline con versión (`CACHE_NAME`) y exclusiones (blob/video/gpx). fileciteturn15file6

### 2.3 Ayuda / documentación interna

- **`Dashcam_ayuda_completa.html`**: página de ayuda independiente con selector de idioma por pestañas (CA/EN/FR) y lógica en JS embebida. (Ojo: el HTML de ayuda indica `DashCam v4.11`, no 4.2.6). fileciteturn16file2turn16file9

### 2.4 Documentos existentes (histórico)

- **`Dashcam_Estructura_App_antiguo.md`** y **`Dashcam_Estructura_App_Nuevo.md`**: estructura previa del proyecto, lista de módulos y funciones. Útiles como índice, pero no sustituyen al análisis real del código. fileciteturn19file4turn19file5

---

## 3) Dependencias externas (cargadas desde CDN)

En `Dashcam.html` se cargan:

- **Leaflet 1.9.4** (CSS/JS) → mapas (reproductor y visor GPX). fileciteturn17file0
- **gpxparser** → parseo de GPX (trkpt, etc.). fileciteturn17file0
- **JSZip** → empaquetado ZIP/exportaciones (cuando aplica). fileciteturn17file0

> Implicación para mantenimiento: la app depende de CDNs. Si se requiere offline total, hay que **self-host** o meter en `urlsToCache`.

---

## 4) Arquitectura general (en 1 clase)

Toda la app está encapsulada en:

- `const APP_VERSION = '4.2.6';`
- `class DashcamApp { ... }`
- Se instancia en `DOMContentLoaded` y se registra el Service Worker (si HTTPS o localhost). fileciteturn20file0turn20file7

### 4.1 Estado global (`this.state`)

El constructor define un estado grande con:

- Estado de grabación (`isRecording`, `isPaused`, `startTime`, `currentSegment`, `recordedSegments`, `recordingSessionName`, etc.).
- Galería (selección, sesiones expand/collapse, pestaña activa).
- Datos GPS/GPX (tracks, archivos, track activo, overlay GPX).
- Configuración (`settings`) con defaults (modo, duración segmento, formato, overlay, audio, reverse geocode, etc.).
- Caché de geocodificación inversa y contadores/auxiliares. fileciteturn20file7

### 4.2 Objetos de control (no serializables)

En el constructor también se inicializan referencias:

- `mediaRecorder`, `mediaStream`, `canvasStream`, `videoElement`, `mainCanvas/mainCtx`, `animationFrame`.
- GPS: `gpsWatchId`, `gpxInterval`, `currentPosition`, `gpxPoints`.
- Persistencia: `db` (IndexedDB), `localFolderHandle`.
- Mapas Leaflet: `playbackMap`, capas/markers.
- Flags plataforma: `isIOS = /iPad|iPhone|iPod/ ...`. fileciteturn20file7

---

## 5) Persistencia y almacenamiento

La app mezcla **IndexedDB + localStorage + sessionStorage** con una estrategia redundante especialmente para settings.

### 5.1 IndexedDB (DashcamDB_Pro)

Se crea/actualiza en `initDatabase()`. Stores creados en `onupgradeneeded` incluyen (según versión actual del fichero):

- `videos` (keyPath `id`)  
- `settings` (keyPath `id`)  
- `gpxTracks` (keyPath `id`)  
- `gpxFiles` (keyPath `id`)  
- `localFiles` (keyPath `id`)  
- `logins` (keyPath `id`)  
- `geocodeCache` (keyPath `key`)  
- `migrations` (keyPath `id`)  
- `videoMetadata` (keyPath `id`) fileciteturn16file14

> Nota: el documento “Nuevo” menciona muchos módulos avanzados; el código real confirma stores y helpers de acceso genéricos `getAllFromStore`, `getFromStore`, `saveToDatabase`, `deleteFromStore`, etc. fileciteturn20file14turn20file2

### 5.2 Settings: guardado “4 niveles”

`saveSettings()` compone un objeto `settings` desde los controles UI y luego lo guarda de forma redundante:

1) **Memoria (`this.state.settings`)**  
2) **localStorage** (`dashcam_settings`) como backup  
3) **IndexedDB** (store `settings`)  
4) **sessionStorage** (fallback mínimo)  

La carga hace el camino inverso (`loadSettingsFromStorage`) y mantiene `localFolderHandle` existente. fileciteturn19file17turn19file12turn19file18

### 5.3 Vídeos: estructura “videoData” (app storage)

Cuando se guarda un segmento en la app (no filesystem), se construye un objeto con:

- `id`, `blob`, `timestamp`, `duration`, `size`, `title`, `filename`, `gpsPoints`, `gpsTrack`, `format`, `location`, `hasMetadata`, `segment`, `session`. fileciteturn19file14

La galería (modo app) se alimenta con `loadAppVideos()` y normaliza IDs, títulos, filename, etc. fileciteturn20file5

### 5.4 Carpeta local (File System Access / iOS)

La app soporta un modo de almacenamiento en “carpeta local” (filesystem) pero **en iOS** se asume una realidad: incluso en PWA “standalone”, **no siempre hay escritura directa** al USB/carpeta externa; entonces se usa flujo de descarga/Archivos.

El método `saveToLocalFolder(blob, filename, sessionName)` hace branching:

- iOS PWA instalado + `!canWriteDirectly` → guía al usuario con instrucciones y descarga manual. fileciteturn19file11
- Windows/Android/desktop con `showDirectoryPicker`/handles → guarda directamente cuando hay permisos.

En la UI, el selector “Almacenamiento” vive en `Dashcam.html` y ofrece `default` / `localFolder`. fileciteturn16file8

---

## 6) Flujos principales de usuario (end-to-end)

### 6.1 Arranque / inicialización

Secuencia típica (lo que hace `init()`):

1. Detecta plataforma iOS / PWA / permisos.
2. Inicializa IndexedDB.
3. Carga settings (y logo si existe).
4. Prepara elementos UI, event listeners, check orientación.
5. Actualiza galería y estado almacenamiento.
6. Registra SW (también se registra globalmente en DOMContentLoaded si aplica). fileciteturn17file10turn20file3turn20file0

Además, hay un mecanismo de **limpieza por cambio de versión**:

- compara `dashcam_version` en localStorage,
- si cambia, desregistra service workers, limpia cachés, y si la versión era muy antigua puede borrar/rehacer DB (`fixDatabaseVersion`). fileciteturn20file0turn20file3

### 6.2 Flujo “Grabar”

**Entrada**: botón “Start / Record” en UI.

Pasos esenciales:

1) Solicita permiso de cámara (prueba con `getUserMedia`). fileciteturn19file19  
2) Solicita ubicación (`requestLocationPermission`) y arranca `watchPosition` si se concede. fileciteturn19file19turn19file9  
3) `initCamera()` obtiene `mediaStream`.  
4) Se muestra pantalla de cámara.  
5) Se prepara canvas:
   - `videoElement` (srcObject = mediaStream)  
   - `startFrameCapture()` empieza a pintar frames al canvas con overlay  
   - `canvasStream = mainCanvas.captureStream(30)`  
6) `MediaRecorder` se crea sobre `canvasStream` con codec/bitrate óptimos. fileciteturn19file19turn19file8turn19file1  
7) `MediaRecorder.start()`:
   - modo continuo: `start()`
   - modo segmentado: `start(1000)` + `startSegmentTimer()` fileciteturn19file7turn19file16

**Eventos críticos**:
- `ondataavailable` acumula `recordedChunks`. fileciteturn19file2
- `onstop` dispara `saveVideoSegment()` y muestra “guardando”. fileciteturn19file2

### 6.3 Segmentación

En modo `segmented`:

- `startSegmentTimer()` programa un timeout de `segmentDuration * 60*1000`.
- `startNewSegment()` detiene el recorder, espera ~500ms, resetea chunks, incrementa `currentSegment` y arranca un nuevo recorder. fileciteturn19file16turn19file3

### 6.4 GPS / GPX durante grabación

`startGPS()` usa `watchPosition` y además un `setInterval` (cada `gpxInterval` segundos) que guarda puntos cuando está grabando y no pausado. fileciteturn19file9

- `formatPosition()` normaliza la estructura (lat/lon/speed/accuracy/etc.). fileciteturn19file9
- `saveGPXPoint()` acumula puntos en `this.gpxPoints`. fileciteturn19file9
- `getLocationName()` hace reverse geocoding con **Nominatim** y cachea por `lat/lon` redondeado; si hay DB, guarda en `geocodeCache`. fileciteturn19file9

### 6.5 Parar grabación / guardar

Al parar:

- `MediaRecorder.stop()` → `onstop` → `saveVideoSegment()`.

`saveVideoSegment()` decide destino según settings:

- Guardar en app (IndexedDB) y opcionalmente mantener copia.
- Guardar en “localFolder” (filesystem/manual iOS).
- Adjunta metadata GPS si `embedGpsMetadata` y hay track. (Hay lógica de “marcadores” en blobs, y también conversión a MP4 para VLC en iOS). fileciteturn19file14turn20file19

---

## 7) Grabación: codecs, formatos y compatibilidad iOS/VLC

Hay una estrategia explícita:

- En iOS, se prueban codecs (MP4/H264 primero) y se prioriza MP4 si está soportado. fileciteturn19file8turn19file1
- En Windows/Android/desktop, respeta `settings.videoFormat` y busca codecs compatibles (mp4 h264 o webm vp9/vp8). fileciteturn19file1
- Si falla crear `MediaRecorder` con el codec elegido, se hace fallback a WebM básico. fileciteturn19file2

Para VLC en iOS existe una ruta de conversión:

- `convertWebMtoMP4ForVLC(webmBlob)` crea un contenedor MP4 mínimo (átomos `ftyp`, `moov`…) y reempaqueta datos para maximizar compatibilidad. fileciteturn20file19

> Importante para modificaciones: tocar esta parte puede romper compatibilidad VLC; conviene añadir tests manuales (Safari iOS + VLC).

---

## 8) Overlay y renderizado en canvas

Concepto clave: **no se graba directamente el `mediaStream`**, sino lo que se dibuja en `mainCanvas`:

- `startFrameCapture()` / `drawFrameWithData()` dibuja frame a frame:
  1) frame del vídeo
  2) overlays (texto/agua/logo)
  3) datos GPS (si disponibles)
  4) overlay GPX (si activo) fileciteturn19file8turn19file3

Los toggles relevantes están en `settings`:

- `overlayEnabled`, `showWatermark`, `customWatermarkText`, `watermarkOpacity`
- `logoPosition`, `logoSize`, `textPosition`
- `gpxOverlayEnabled`, `showGpxDistance`, `showGpxSpeed` fileciteturn20file7

---

## 9) Galería (vídeos + GPX) y selector compacto

La galería usa:

- `viewMode`: `default` (contenido “app”) o `localFolder` (filesystem). fileciteturn20file7turn20file11
- `activeTab`: `videos` o `gpx`.

UI/UX:

- Selectores compactos (ubicación y tipo) que renderizan un “header” clicable + opciones. fileciteturn20file11
- Selección múltiple (Set) y habilitación dinámica de acciones:
  - Mover a carpeta local
  - Combinar (requiere ≥2)
  - Exportar
  - Eliminar fileciteturn19file17

### 9.1 Sesiones (agrupación)

Los vídeos pueden agruparse en sesiones por `recordingSessionName` y se guardan estados de:

- `expandedSessions`
- `selectedSessions` fileciteturn20file12turn20file7

---

## 10) Mapas Leaflet (reproductor y visor GPX)

### 10.1 Mapa del reproductor (playback)

`initPlaybackMap()`:

- valida que haya `currentVideo.gpsTrack`
- crea `L.map` en `#playbackMap`
- calcula bounds/center
- añade tiles
- dibuja polyline de ruta, markers inicio/fin
- ajusta `fitBounds` y controla limitaciones iOS (dragging/tap). fileciteturn20file8

### 10.2 Visor GPX

La app también crea un visor GPX con panel y acciones:

- Exportar KML (`exportGpxAsKml`)
- Exportar JSON (`exportGpxAsJson`)
- Eliminar GPX (`deleteGpxInViewer`)
- Controles de zoom/fit bounds fileciteturn20file1turn20file16

Además, hay un manager de GPX en galería:

- listar GPX por origen (“app” vs “filesystem”)
- acciones: ver / descargar / eliminar / “cargar a app” fileciteturn20file9turn20file2

---

## 11) Logo personalizado

Hay una lógica robusta para logo:

- En carga, prioriza “logo iOS más reciente” si `settings.logoIsIOS && settings.logoInfo`. fileciteturn20file4
- Si no, intenta restaurar por `customLogo` / `logoFilename` (métodos antiguos).
- Si nada coincide, crea un objeto nuevo de logo con dimensiones y metadatos. fileciteturn20file18turn20file4

Esto evita perder el logo en migraciones de settings o plataformas.

---

## 12) PWA: manifest, service worker e instalación

### 12.1 Manifest

- `start_url` y `scope` están **hardcodeados** a `/Web/Ciclismo/Dashcam/`. fileciteturn20file15
- `display: standalone`, iconos maskable, screenshots, categorías.
- `shortcuts` definidos para “Iniciar grabación” y “Ver galería” con `?action=record|gallery`. fileciteturn20file15

⚠️ **Nota importante:** en el JS actual no se ve parseo de `action=` en URL. Si se quiere que los shortcuts realmente cambien pantalla/arranquen grabación, hay que implementar lectura de `URLSearchParams` en `init()`.

### 12.2 Service Worker

- Cache versionado: `dashcam-iphone-pro-cache-v4.2.6`. fileciteturn15file6
- Precache de HTML/CSS/JS/manifest/ayuda + iconos.
- Estrategia fetch: cache-first para recursos básicos; **no cachea** `blob:`, `video/`, `media/`, ni URLs con `gpx`. fileciteturn15file6

### 12.3 Registro SW

- En `Dashcam.html` se registra `Dashcam_service-worker.js?v=4.2.6`. fileciteturn17file0
- En `Dashcam_App.js` se registra también (sin querystring), pero solo en HTTPS/localhost. fileciteturn20file0

> Recomendación de mantenimiento: unificar registro (solo un lugar) y aplicar el mismo `?v=` para evitar incoherencias al actualizar.

---

## 13) UI: pantallas, paneles y elementos clave

### 13.1 Pantallas principales (IDs de alto nivel)

En `Dashcam.html` se distinguen:

- Start/landing: `#startScreen`
- Cámara/preview: `#cameraScreen`, `#videoPreview`, `#mainCanvas`, `#overlayCanvas`, `#recordingTime`, etc.
- Panel galería: `#galleryPanel` (tabs `#videosTab` / `#gpxTab`)
- Panel settings: `#settingsPanel`
- Modales: `#videoPlayerModal`, `#landscapeModal`, `#iosGuideModal`, `#pwaInstallModal`, etc. fileciteturn16file5turn17file0turn16file8

### 13.2 Botones/acciones principales (patrón)

Patrón típico en JS:

1) Cachea elementos en `this.elements`.
2) `setupEventListeners()` añade listeners:
   - `startBtn`, `stopBtn`, `pauseBtn`, etc.
   - `uploadLogoBtn`, `uploadGpxBtn`, inputs ocultos `logoUpload`, `gpxUpload`… fileciteturn20file3

---

## 14) Ayuda y “traducciones”

### 14.1 App principal (Dashcam_App.js)

No hay un sistema i18n formal (diccionario/JSON).  
Los textos son **hardcoded** (ES) en notificaciones y mensajes, por ejemplo:

- Mensajes GPS (`getGPSErrorMessage`) y notificaciones. fileciteturn19file9turn19file7

Si quieres internacionalizar la app, el punto de partida es:

- extraer strings a un objeto `i18n[lang][key]`,
- leer `lang` desde `navigator.language` o setting,
- sustituir llamadas `showNotification('texto')` por `t('key')`.

### 14.2 Página de ayuda (Dashcam_ayuda_completa.html)

Aquí sí hay selector de idioma con tabs y contenido duplicado por idioma:

- pestañas: CA / EN / FR (no ES).
- usa JS embebido para alternar secciones por ID/clase. fileciteturn16file2turn16file9

⚠️ Inconsistencia: la ayuda indica “DashCam v4.11”. Conviene alinear la ayuda con el APP_VERSION o generar el contenido desde el propio build.

---

## 15) CSS: estructura de estilos (lo que suele romper UI)

Clases y componentes típicos:

- Pantallas: `.start-screen`, `.camera-screen`, `.gallery-panel`, `.settings-panel`
- Componentes: `.modal`, `.notification`, `.btn`, `.action-btn`, `.leaflet-map`, etc. fileciteturn17file1turn15file16

> Regla práctica para cambios: tocar CSS de `.hidden`, `.modal` o contenedores principales suele afectar lógica JS (que se basa en añadir/quitar clases).

---

## 16) Puntos de extensión y “zonas delicadas”

### 16.1 Delicado: pipeline de grabación

Cualquier cambio en:

- tamaño/fps del canvas,
- codec selection,
- conversión a MP4 (VLC),
- concatenación de metadatos,
- y temporización de segmentación,

puede romper compatibilidad de reproducción/exportación. fileciteturn19file8turn20file19

### 16.2 Delicado: permisos iOS y “filesystem”

En iOS hay muchas bifurcaciones por limitaciones (escritura directa, app Archivos). `saveToLocalFolder` y modales iOS son el núcleo de esa compatibilidad. fileciteturn19file11turn20file3

### 16.3 Delicado: versionado y caché

- Hay limpieza de service workers y caché al cambiar `APP_VERSION`. fileciteturn20file0
- El SW tiene `CACHE_NAME` con versión; si no se actualiza coherentemente (y/o hay dos registros distintos), puedes quedar con recursos antiguos.

---

## 17) Checklist para modificar la app sin romperla

1) **Si cambias HTML IDs** → busca referencias en `Dashcam_App.js` (setup/cache de elementos).  
2) **Si cambias settings** → actualiza: defaults en constructor + `getDefaultSettings()` + `saveSettings()` + `updateSettingsUI()`. fileciteturn20file7turn19file18turn19file17  
3) **Si añades nuevos stores IndexedDB** → incrementa versión de DB y maneja `onupgradeneeded`. fileciteturn16file14  
4) **Si cambias recursos** → actualiza `urlsToCache` del SW y manifest icons/shortcuts. fileciteturn15file6turn20file15  
5) **Si cambias compatibilidad iOS** → prueba:
   - Safari normal
   - PWA instalada
   - guardado en app y guardado “manual” a Archivos/USB
   - reproducción en VLC. fileciteturn19file1turn19file11  

---

## 18) Anexo A — Recursos esperados (recursos/)

Referenciados por manifest o SW:

- `recursos/Picto_Color_192x192.png`
- `recursos/Picto_Color_512x512.png`
- `recursos/Logo_Dashcam_Bike_192x192.png`
- `recursos/screenshot1.png`
- `recursos/record-icon.png`
- `recursos/gallery-icon.png` fileciteturn20file15turn15file6

---

## 19) Anexo B — IDs principales del HTML (mapa mental)

> Lista práctica para navegar el DOM (no exhaustiva):

### Grabación / cámara
- `startBtn`, `stopBtn`, `pauseBtn`, `segmentInfo`
- `videoPreview`, `mainCanvas`, `overlayCanvas`
- `gpsInfo`, `recordingStatus`, `recordingTime`

### Galería
- `galleryPanel`, `videosTab`, `gpxTab`
- `videosList`, `gpxList`
- `exportBtn`, `deleteBtn`, `combineVideosBtn`, `moveToLocalBtn`
- selectores compactos: `locationHeader`, `locationOptions`, `typeHeader`, `typeOptions`

### GPX
- `uploadGpxBtn`, `gpxUpload`
- visor: `gpxViewerMap`, `exportGpxAsKml`, `exportGpxAsJson`, `deleteGpxInViewer` fileciteturn16file5turn20file1turn20file16

### Settings
- `settingsPanel`
- `recordingMode`, `segmentDuration`, `videoQuality`, `videoFormat`, `gpxInterval`
- `overlayEnabled`, `audioEnabled`, `reverseGeocodeEnabled`
- `storageLocation`, `keepAppCopy`, `embedGpsMetadata`, `metadataFrequency`
- logo: `uploadLogoBtn`, `logoUpload`, `logoPosition`, `logoSizer`, `customWatermarkText`, etc. fileciteturn16file8turn19file17turn20file3

---

## 20) Anexo C — “Falta” / oportunidades detectadas

- Implementar manejo de `?action=record|gallery` (shortcuts del manifest) para abrir pantalla correcta automáticamente.
- Unificar registro de service worker y querystring de versión.
- Considerar extraer strings a i18n (app principal está en ES; ayuda no tiene ES).
- Modularizar `Dashcam_App.js` (ahora es monolítico): separar en módulos (Recorder, GPS, Storage, UI, Maps, PWA).

---

**Fin del documento.**
