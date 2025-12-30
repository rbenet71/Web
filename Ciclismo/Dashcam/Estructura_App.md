# 🗂️ **ÍNDICE COMPLETO DE FUNCIONALIDADES POR MÓDULO - app.js** - ACTUALIZADO

Basándome en el análisis de los archivos, he creado un **índice detallado** de todas las funcionalidades organizadas por módulo. Cuando necesites modificar algo, consulta esta guía y pídeme el código específico.

## 📋 **ESTRUCTURA GENERAL DE app.js**

```
app.js (~6000 líneas)
├── CLASE DashcamApp
│   ├── CONSTRUCTOR + PROPIEDADES
│   ├── MÉTODOS DE INICIALIZACIÓN (init, initUI, etc.)
│   ├── MÓDULO PWA (detección, instalación)
│   ├── MÓDULO DE INICIALIZACIÓN Y ESTADO
│   ├── MÓDULO GRABACIÓN
│   ├── MÓDULO GPS
│   ├── MÓDULO DE ALMACENAMIENTO
│   ├── MÓDULO DE SESIONES Y CARPETAS (ACTUALIZADO)
│   ├── MÓDULO DE DIBUJADO Y OVERLAY
│   ├── MÓDULO GALERÍA (ACTUALIZADO - Ahora con sesiones)
│   ├── MÓDULO REPRODUCCIÓN
│   ├── MÓDULO GPX (ampliado)
│   ├── MÓDULO MAPAS (ampliado)
│   ├── MÓDULO CONFIGURACIÓN
│   ├── MÓDULO UTILIDADES (ampliado)
│   ├── MÓDULO DE PERMISOS Y VERIFICACIÓN
│   ├── MÓDULO DE MIGRACIÓN iOS
│   ├── MÓDULO DE BASE DE DATOS - UTILIDADES
│   ├── MÓDULO DE GESTIÓN DE SESIONES (NUEVO)
│   └── MÓDULO EVENTOS (completo)
└── INICIALIZACIÓN GLOBAL
```

## 📁 **ÍNDICE POR MÓDULO - PARA MODIFICACIONES**

### **1. 🏗️ MÓDULO DE INICIALIZACIÓN Y ESTADO**
**Ubicación aproximada:** líneas 1-500

```javascript
// CONSTRUCTOR Y PROPIEDADES
constructor()                // Inicializa estado y variables
init()                      // Proceso de inicio de 19 pasos

// ESTADO DE LA APLICACIÓN
this.state = {              // ~50 propiedades
    recordedSegments: [],
    recordingSessionSegments: 0,
    recordingSessionName: null,
    isRecording: false,
    isPaused: false,
    startTime: null,
    currentTime: 0,
    selectedVideos: new Set(),
    selectedGPX: new Set(),
    selectedSessions: new Set(),    // NUEVO: Sesiones seleccionadas
    currentVideo: null,
    activeTab: 'videos',
    showLandscapeModal: false,
    appVersion: APP_VERSION,
    viewMode: 'default',
    videos: [],
    gpxTracks: [],
    loadedGPXFiles: [],
    activeGPX: null,
    currentSegment: 1,
    settings: { ... },      // Configuración completa
    customLogo: null,
    logoImage: null,
    currentLocationName: 'Buscando...',
    reverseGeocodeCache: {},
    frameCounter: 0,
    expandedSessions: new Set()     // NUEVO: Control sesiones expandidas
}

// VARIABLES DE CONTROL
this.mediaRecorder = null;
this.mediaStream = null;
this.gpsWatchId = null;
this.gpxInterval = null;
this.currentPosition = null;
this.gpxPoints = [];
this.recordedChunks = [];
this.segmentTimer = null;
this.updateInterval = null;
this.db = null;
this.mainCanvas = null;
this.mainCtx = null;
this.videoElement = null;
this.canvasStream = null;
this.animationFrame = null;
this.isSaving = false;
this.localFolderHandle = null;
this.isIOS = false;
this.elements = {};
this.tempGpxData = null;
this.lastGeocodeUpdate = null;
this.playbackMap = null;
this.mapTrackLayer = null;
this.mapRouteLayer = null;
this.startMarker = null;
this.endMarker = null;
this.currentPositionMarker = null;
this.mapMarkers = [];
this.mapTileLayers = {};
this.isPWAInstalled = false;
this.deferredPrompt = null;
this.installButton = null;
this.gpxViewerMap = null;      // Nuevo: mapa para visualizador GPX
```

### **2. 🚀 MÓDULO PWA**
**Ubicación aproximada:** líneas 100-300

```javascript
// DETECCIÓN PWA
detectPWAInstallation()          // Verifica si está instalada como PWA
setupPWAInstallListener()        // Configura eventos de instalación
checkPWARequirements()           // Verifica requisitos PWA

// SERVICE WORKER
registerServiceWorker()          // Registra service worker
clearCacheIfNeeded()             // Limpia cache en actualizaciones

// INSTALACIÓN
setupPWAEvents()                 // Configura eventos de instalación
handleInstallPrompt()            // Maneja prompt de instalación
showInstallButton()              // Muestra botón de instalación
hideInstallButton()              // Oculta botón de instalación
installPWA()                     // Función para instalar la PWA
showPWAInstalledBadge()          // Muestra badge de "Instalado"
promotePWAInstallation()         // Promueve instalación PWA
showPWAInstallInstructions()     // Muestra instrucciones instalación
showLocalServerInstructions()    // Instrucciones servidor local
```

### **3. 🎬 MÓDULO DE GRABACIÓN**
**Ubicación aproximada:** líneas 500-1200

```javascript
// FUNCIONES PRINCIPALES
startRecording()          // Inicia grabación con permisos
stopRecording()           // Detiene y guarda grabación
pauseRecording()          // Pausa grabación actual
resumeRecording()         // Reanuda grabación pausada
startNewSegment()         // Crea nuevo segmento

// INICIALIZACIÓN CÁMARA
initCamera()              // Configura cámara y stream
setupMediaRecorder()      // Configura MediaRecorder
getVideoBitrate()         // Obtiene bitrate según calidad
cleanupResources()        // Limpia recursos de grabación
cleanupRecordingResources() // Limpia recursos específicos

// PROCESAMIENTO VIDEO
processVideoFrame()       // Procesa frame con overlay
addWatermarkToFrame()     // Añade marca de agua/overlay
handleDataAvailable()     // Maneja datos del recorder
saveVideoSegment()        // Guarda segmento de video
saveToApp()               // Guarda video en la app

// ELEMENTOS DEL DOM
this.elements.startBtn
this.elements.pauseBtn
this.elements.stopBtn
this.elements.newSegmentBtn
this.elements.recordingTimeEl
this.elements.recordingStatus
this.elements.segmentInfo
```

### **4. 📍 MÓDULO GPS**
**Ubicación aproximada:** líneas 1200-1800

```javascript
// FUNCIONES PRINCIPALES
startGPS()                // Inicia seguimiento GPS
stopGPS()                 // Detiene GPS
getCurrentLocation()      // Obtiene ubicación actual
requestLocationPermission() // Solicita permiso ubicación
reverseGeocode()          // Geocodificación inversa (nombre ciudad)
getLocationName(lat, lon) // Obtiene nombre de ubicación
formatPosition()          // Formatea datos de posición
saveGPXPoint()            // Guarda punto GPS
saveGPXTrack()            // Guarda track GPX completo
getGPSErrorMessage()      // Traduce códigos error GPS

// DATOS GPS
this.state.gpsData = {
    currentPosition,
    gpxPoints,            // Array de puntos GPS
    currentLocationName,
    speed,
    heading,
    accuracy
}

this.currentPosition      // Posición actual formateada
this.gpxPoints           // Puntos GPX acumulados
```

### **5. 💾 MÓDULO DE ALMACENAMIENTO**
**Ubicación aproximada:** líneas 1800-2500

```javascript
// BASE DE DATOS (IndexedDB)
initDatabase()            // Inicializa IndexedDB
createDatabaseStores()    // Crea stores de BD
saveToDatabase(store, data) // Guarda en store específico
getFromStore(store, id)   // Obtiene por ID
getAllFromStore(store)    // Obtiene todos
deleteFromStore(store, id) // Elimina por ID

// SISTEMA DE ARCHIVOS
selectLocalFolder()       // Selecciona carpeta local
saveToLocalFolder(blob, filename) // Guarda blob en carpeta
loadLocalFolderVideos()   // Carga videos de carpeta
syncPhysicalFiles()       // Sincroniza con BD
cleanupLocalFilesDatabase() // Limpia archivos locales
syncPhysicalFilesWithDatabase() // Sincroniza archivos físicos con BD
deleteFileByPath(filename, sessionName) // Borra archivo por ruta
deletePhysicalFile(fileHandle) // Borra archivo físico

// CONVERSIÓN Y METADATOS
ensureMP4WithMetadata()   // Asegura MP4 con metadatos
convertWebMtoMP4()        // Convierte WebM a MP4
addGpsMetadataToMP4(blob, track) // Añade metadatos GPS a MP4
addMetadataToWebM()       // Añade metadatos a WebM

// CONFIGURACIÓN
this.state.settings.storageLocation  // 'default' o 'localFolder'
this.localFolderHandle               // Handle de carpeta
this.state.settings.localFolderName  // Nombre carpeta
```

### **6. 📁 MÓDULO DE SESIONES Y CARPETAS (ACTUALIZADO)**
**Ubicación aproximada:** líneas 1500-2000

```javascript
// GESTIÓN DE SESIONES
createSessionFolder()        // Crea carpeta de sesión
askAboutCombining()         // Pregunta sobre combinar segmentos
combineSessionSegments()    // Combina segmentos de sesión
resetRecordingSession()     // Resetea sesión de grabación

// CARPETAS PERSISTENTES
saveFolderHandle()          // Serializa handle de carpeta
restoreFolderHandle()       // Restaura handle de carpeta
updateFolderUI()            // Actualiza UI de carpeta
showFolderInstructions()    // Muestra instrucciones de carpeta
showPersistentPermissionReminder() // Recordatorio permisos

// SELECTORES DE CARPETA
showDesktopFolderPickerWithPersistence() // Selector con persistencia
showIOSFolderPicker()        // Selector para iOS
showDesktopFolderPicker()    // Selector para desktop

// INTERFAZ CARPETAS
updateFolderUI()            // Actualiza información carpeta
requestStoragePersistence() // Solicita persistencia almacenamiento
showRestoreFolderModal()    // Modal restaurar carpeta

// NUEVAS FUNCIONES RELACIONADAS CON SESIONES
scanSessionFolder(folderHandle, sessionName) // Escanea carpeta de sesión
getSessionVideos(sessionName)               // Obtiene videos de una sesión
deleteSession(sessionName)                  // Elimina una sesión completa
renameSession(oldName, newName)             // Renombra una sesión
```

### **7. 🎨 MÓDULO DE DIBUJADO Y OVERLAY**
**Ubicación aproximada:** líneas 2000-2500

```javascript
// CAPTURA Y DIBUJADO
startFrameCapture()         // Inicia captura de frames
stopFrameCapture()          // Detiene captura de frames
drawFrameWithData()         // Dibuja frame completo con datos
drawCustomWatermark()       // Dibuja marca de agua personalizada

// ELEMENTOS VISUALES
drawLogo()                  // Dibuja logo en canvas
drawWatermarkText()         // Dibuja texto de marca de agua
drawGpsInfo()               // Dibuja información GPS
drawTemporaryOverlay()      // Dibuja overlay temporal
drawGpxOverlay()            // Dibuja overlay de GPX

// CÁLCULOS VISUALES
calculateGpxProgress()      // Calcula progreso en ruta GPX
calculateDistance()         // Calcula distancia entre puntos

// CONTROL DE FRAMES
this.animationFrame         // Referencia animation frame
this.frameCounter           // Contador de frames
this.mainCanvas             // Canvas principal
this.mainCtx                // Contexto canvas
```

### **8. 🖼️ MÓDULO DE GALERÍA (ACTUALIZADO - CON SESIONES)**
**Ubicación aproximada:** líneas 2500-3500

```javascript
// FUNCIONES PRINCIPALES
loadGallery()               // Carga galería según modo de vista - ACTUALIZADO
loadAppVideos()             // Carga videos de la app
loadLocalFolderVideos()     // Carga videos de carpeta local
scanLocalFolderForVideos()  // Escanea carpeta física para videos
scanSessionFolder(folderHandle, sessionName) // Escanea carpeta de sesión
syncPhysicalFilesWithDatabase() // Sincroniza archivos físicos con BD
cleanupLocalFilesDatabase() // Limpia BD de archivos locales
showGallery()               // Muestra panel de galería
hideGallery()               // Oculta galería

// NUEVAS FUNCIONES DE RENDERIZADO POR SESIONES
renderVideosList()          // Renderiza lista de videos - COMPLETAMENTE REESCRITA
groupVideosBySession(videos) // Agrupa videos por sesión - NUEVA
renderVideoItem(video)      // Renderiza un video individual - NUEVA
renderSession(session)      // Renderiza una sesión completa - NUEVA
renderEmptyState()          // Renderiza estado vacío - NUEVA

// MEJORA Y PROCESAMIENTO DE DATOS
enhanceLocalVideoData(video) // Mejora datos de video local
extractAndSetVideoDuration(video) // Extrae y establece duración

// SELECCIÓN MÚLTIPLE
toggleSelection(id, type)   // Alterna selección individual
selectAll(type)             // Selecciona todos
deselectAll(type)           // Deselecciona todos
normalizeId(id)             // Normaliza IDs para comparación
escapeHTML(text)            // Escapa HTML para prevenir XSS

// RENDERIZADO
setupGalleryEventListeners() // Configura eventos de galería
setupCompactSelectors()     // Configura selectores compactos
updateCompactSelectors()    // Actualiza selectores compactos
updateGalleryActions()      // Actualiza acciones de galería
updateSelectionButtons()    // Actualiza botones de selección

// BÚSQUEDA
findVideoInState(id)        // Busca video en el estado
playVideoFromCurrentLocation(videoId) // Reproduce desde ubicación actual
isLocalId(id)               // Identifica si es ID local

// ELEMENTOS
this.state.videos[]         // Array de videos
this.state.selectedVideos   // Set de IDs seleccionados
this.state.viewMode         // 'default' o 'localFolder'
```

### **9. 🎥 MÓDULO DE REPRODUCCIÓN**
**Ubicación aproximada:** líneas 3500-4000

```javascript
// FUNCIONES PRINCIPALES
playVideo(video)            // Reproduce video específico
playVideoFromCurrentLocation(videoId) // Reproduce desde ubicación actual
hideVideoPlayer()           // Oculta reproductor
extractGpxFromVideo()       // Extrae GPX de metadatos
extractGPSMetadataFromMP4(video) // Extrae metadatos GPS del video
addLocationNamesToTrack(gpsTrack) // Añade nombres de ubicación al track

// OPERACIONES INDIVIDUALES
exportSingleVideo()         // Exporta video actual
deleteSingleVideo()         // Elimina video actual
moveToLocalFolder()         // Mueve video a carpeta local

// EXTRACCIÓN METADATOS
extractVideoDuration(blob)  // Extrae/estima duración del video
getVideoDurationAlternative(blob) // Método alternativo para duración
extractMP4Duration(arrayBuffer, dataView) // Extrae duración MP4
extractWebMDuration(arrayBuffer, dataView) // Extrae duración WebM
readString(arrayBuffer, offset, length) // Lee strings del array buffer

// ELEMENTOS REPRODUCTOR
this.elements.playbackVideo
this.elements.playbackMap
this.elements.videoTitle
this.elements.videoDate
```

### **10. 🗺️ MÓDULO GPX (AMPLIADO)**
**Ubicación aproximada:** líneas 3800-5200

```javascript
// GESTIÓN GPX
loadGPXFiles()            // Carga archivos GPX
loadGPXFromStore()        // Carga GPX desde varias fuentes
scanAppGPXFiles()         // Escanea GPX en la app
scanLocalFolderGPXFiles() // Escanea GPX en carpeta
scanFolderForGPX(folderHandle, path, gpxList) // Escanea carpeta recursivamente
viewGPX(gpxId, source)    // Visualiza GPX específico
downloadGPX(gpxId, source) // Descarga archivo GPX
exportGPXAsKML(gpxData)   // Exporta como KML
exportGPXAsJSON(gpxData)  // Exporta como JSON
generateGPXFromPoints(points, name) // Genera XML GPX desde puntos
loadGPXFromFileSystem(filename, path) // Carga GPX desde sistema de archivos

// PARSEO Y PROCESAMIENTO
parseGPXData(gpxText, originalData) // Parsea XML GPX
extractPointData(pointElement)      // Extrae datos de punto GPX
calculateGPXStats(points)           // Calcula estadísticas de ruta
debugGPXFile(file)                  // Depura archivo GPX
getGPXFileInfo(file, path)          // Obtiene información básica de archivo GPX

// VISUALIZACIÓN
showGPXViewer(gpxData)             // Muestra visualizador completo
updateGPXViewerData(gpxData)       // Actualiza datos del visualizador
initGPXViewerMap(gpxData)          // Inicializa mapa para visualizador GPX
hideGPXViewer()                    // Oculta visualizador GPX
renderGPXList()                    // Renderiza lista de GPX en UI
setupGPXEventListeners()           // Configura eventos de lista GPX
showFullscreenMap(gpxData)         // Muestra mapa a pantalla completa

// CÁLCULOS GEOGRÁFICOS
calculateTrackBounds(points)       // Calcula límites del track
calculateTrackCenter(points)       // Calcula centro del track
calculateDistance(lat1, lon1, lat2, lon2) // Calcula distancia entre puntos

// ELEMENTOS UI
this.elements.gpxList              // Contenedor lista GPX
this.state.gpxTracks[]             // Array de tracks GPX
this.state.loadedGPXFiles          // Archivos GPX cargados
this.state.activeGPX               // GPX activo actual
this.gpxViewerMap                  // Mapa del visualizador GPX
```

### **11. 🗾 MÓDULO DE MAPAS (AMPLIADO)**
**Ubicación aproximada:** líneas 5200-5800

```javascript
// MAPAS LEAFLET
initPlaybackMap()         // Inicializa mapa para reproducción de video
initLeafletMap()          // Inicializa mapa Leaflet genérico
addMapTileLayers()        // Añade capas de mapa (OSM, CartoDB, Satélite)
drawRouteOnMap(points)    // Dibuja ruta GPS en mapa
addStartEndMarkers(points) // Añade marcadores inicio/fin
addMapControls()          // Añade controles personalizados al mapa
updatePlaybackMap()       // Actualiza mapa durante reproducción
cleanupMap()              // Limpia recursos del mapa

// ACTUALIZACIÓN TIEMPO REAL
updateCurrentPositionMarker(point) // Actualiza marcador posición actual
updateMapInfo(point)      // Actualiza información textual del mapa
updateMapStats(points)    // Actualiza estadísticas en el mapa

// INTERACCIÓN CON REPRODUCCIÓN
updatePlaybackMap()       // Sincroniza mapa con reproducción de video

// CONTROL DE MAPA
this.playbackMap          // Instancia de mapa Leaflet principal
this.mapTrackLayer        // Capa de track
this.mapRouteLayer        // Capa de ruta
this.startMarker          // Marcador inicio
this.endMarker            // Marcador fin
this.currentPositionMarker // Marcador posición actual
this.mapMarkers           // Array de marcadores
this.mapTileLayers        // Objeto con capas de mapa
```

### **12. ⚙️ MÓDULO DE CONFIGURACIÓN**
**Ubicación aproximada:** líneas 4800-5000

```javascript
// CONFIGURACIÓN
showSettings()            // Muestra panel configuración
hideSettings()            // Oculta configuración
saveSettings()            // Guarda configuración
resetSettings()           // Restaura valores por defecto
loadSettings()            // Carga configuración guardada
updateSettingsUI()        // Actualiza UI configuración

// AJUSTES
this.state.settings = {
    recordingMode,
    segmentDuration,
    videoQuality,
    videoFormat,
    storageLocation,
    keepAppCopy,
    watermarkText,
    logoEnabled,
    gpxInterval,
    overlayEnabled,
    audioEnabled,
    reverseGeocodeEnabled,
    watermarkOpacity,
    watermarkFontSize,
    watermarkPosition,
    showWatermark,
    logoPosition,
    logoSize,
    customWatermarkText,
    textPosition,
    gpxOverlayEnabled,
    showGpxDistance,
    showGpxSpeed,
    embedGpsMetadata,
    metadataFrequency,
    localFolderHandle,
    localFolderName,
    localFolderPath
}

// INTERFAZ
toggleStorageSettings()   // Muestra/oculta opciones almacenamiento
uploadCustomLogo()        // Sube logo personalizado
loadCustomLogo()          // Carga logo personalizado
updateLogoInfo()          // Actualiza info logo
```

### **13. 🛠️ MÓDULO DE UTILIDADES (AMPLIADO)**
**Ubicación aproximada:** líneas 5000-5300

```javascript
// FORMATOS
formatTime(ms)            // Formatea tiempo HH:MM:SS

// NOTIFICACIONES
showNotification(message, duration) // Muestra notificación temporal
showSavingStatus(message) // Muestra estado "Guardando..."
hideSavingStatus()        // Oculta estado guardado

// UI
updateUI()                // Actualiza interfaz
startMonitoring()         // Inicia monitoreo continuo
updateStorageStatus()     // Actualiza estado almacenamiento
updateGpxSelect()         // Actualiza selector de GPX

// ORIENTACIÓN
checkOrientation()        // Verifica orientación dispositivo
showLandscapeModal()      // Muestra modal landscape
hideLandscapeModal()      // Oculta modal

// DESCARGA
downloadBlob(blob, filename) // Descarga archivo

// PANTALLAS
showStartScreen()         // Muestra pantalla inicio
showCameraScreen()        // Muestra pantalla cámara
updateRecordingUI()       // Actualiza UI grabación

// SELECTORES Y NAVEGACIÓN
toggleSelect(type)        // Alterna selector
closeAllSelects()         // Cierra todos los selectores
selectLocation(value)     // Selecciona ubicación
selectType(value)         // Selecciona tipo
switchTab(tabName)        // Cambia de pestaña

// ESTIMACIONES
estimateDurationByFileSize(fileSize, format) // Estimación por tamaño

// GESTIÓN DE ELEMENTOS SELECCIONADOS
exportSelected()          // Exporta elementos seleccionados
deleteSelected()          // Elimina elementos seleccionados
moveSelectedToLocalFolder() // Mueve seleccionados a carpeta local
combineSelectedVideos()   // Combina videos seleccionados
showCombineModal()        // Muestra modal de combinación
hideCombineModal()        // Oculta modal de combinación

// GPX MANAGER
showGpxManager()          // Muestra gestor GPX
hideGpxManager()          // Oculta gestor GPX

// NUEVAS FUNCIONES PARA EXPORTACIÓN MASIVA
exportAllSessions()       // Exporta todas las sesiones como ZIP
exportSession(sessionName) // Exporta una sesión específica como ZIP
```

### **14. 🛡️ MÓDULO DE PERMISOS Y VERIFICACIÓN**
**Ubicación aproximada:** líneas 500-600

```javascript
// VERIFICACIONES
checkPWARequirements()      // Verifica requisitos PWA
requestStoragePersistence() // Solicita persistencia almacenamiento
cleanupResources()          // Limpia recursos generales
checkOrientation()          // Verifica orientación dispositivo
clearCacheIfNeeded()        // Limpia caché si es necesario
fixDatabaseVersion()        // Corrige versión de base de datos

// INICIALIZACIÓN ELEMENTOS
initElements()              // Inicializa elementos DOM
init()                      // Proceso de inicialización principal

// FUNCIONES PWA ESPECÍFICAS
detectPWAInstallation()     // Detección mejorada de PWA
setupPWAInstallListener()   // Configura listener instalación
showPWAInstalledBadge()     // Muestra badge de instalado
promotePWAInstallation()    // Promueve instalación PWA

// GESTIÓN RECURSOS
cleanupRecordingResources() // Limpia recursos grabación
stopFrameCapture()          // Detiene captura frames
```

### **15. 📱 MÓDULO DE MIGRACIÓN iOS**
**Ubicación aproximada:** líneas 5300-5400

```javascript
// MIGRACIÓN iOS/WINDOWS
migrateIOSVideoToWindows(video) // Migra video iOS a Windows
checkAndMigrateIOSVideos() // Verifica y migra videos iOS automáticamente
extractIOSMetadata(moovData) // Extrae metadatos de video iOS
removeOldMetadata(blob)     // Remueve metadatos antiguos del video
addLocationNamesToTrack(gpsTrack) // Añade nombres de ubicación al track

// FUNCIONES AUXILIARES
readString(arrayBuffer, offset, length) // Lee strings del buffer
```

### **16. 💾 MÓDULO DE BASE DE DATOS - UTILIDADES**
**Ubicación aproximada:** líneas 5800-5900

```javascript
// OPERACIONES CRUD
saveToDatabase(storeName, data)  // Guarda/actualiza en BD
getAllFromStore(storeName)       // Obtiene todos los elementos
getFromStore(storeName, id)      // Obtiene elemento por ID
deleteFromStore(storeName, id)   // Elimina elemento por ID

// MANEJO DE ERRORES
// Incluye manejo de ConstraintError y excepciones
```

### **17. 🗂️ NUEVO MÓDULO: GESTIÓN DE SESIONES**
**Ubicación aproximada:** líneas 5900-6000

```javascript
// FUNCIONES DE GESTIÓN DE SESIONES
groupVideosBySession(videos)     // Agrupa videos por sesión - NUEVA
toggleSession(sessionName)       // Expande/colapsa una sesión - NUEVA
toggleSelectSession(sessionName) // Selecciona/deselecciona todos los videos de una sesión - NUEVA
expandAllSessions()              // Expande todas las sesiones - NUEVA
collapseAllSessions()            // Colapsa todas las sesiones - NUEVA
getSessionByName(sessionName)    // Obtiene información de una sesión - NUEVA
getSessionVideos(sessionName)    // Obtiene videos de una sesión - NUEVA
exportSession(sessionName)       // Exporta sesión como ZIP - NUEVA
exportAllSessions()              // Exporta todas las sesiones - NUEVA
deleteSession(sessionName)       // Elimina una sesión completa - NUEVA
renameSession(oldName, newName)  // Renombra una sesión - NUEVA
mergeSessions(session1, session2) // Fusiona dos sesiones - NUEVA

// ESTADO DE SESIONES
this.state.expandedSessions = new Set()  // Sesiones expandidas
this.state.selectedSessions = new Set()  // Sesiones seleccionadas
```

### **18. 🔌 MÓDULO DE EVENTOS (COMPLETO - ACTUALIZADO)**
**Ubicación aproximada:** líneas 6000-6100

```javascript
// CONFIGURACIÓN EVENTOS
setupEventListeners()           // Configura todos los event listeners
setupCompactSelectors()         // Configura selectores compactos
setupGPXEventListeners()        // Configura eventos de GPX
setupGalleryEventListeners()    // Configura eventos de galería - ACTUALIZADO

// EVENTOS PRINCIPALES
// Grabación: startBtn, pauseBtn, stopBtn, newSegmentBtn
// Galería: galleryBtn, closeGallery, selectAllVideos, deselectAllVideos
// Reproductor: closePlayer, moveToLocalFolderBtn, extractGpxBtn, exportVideo, deleteVideo
// Configuración: saveSettings, resetSettingsBtn, closeSettings, storageLocation, selectLocalFolderBtn, uploadLogoBtn
// GPX Manager: gpxManagerBtn
// Navegación: galleryDropdownToggle, rotateDevice, continueBtn

// NUEVOS EVENTOS PARA SESIONES
session-header clicks           // Expansión/colapso de sesiones
select-session-btn clicks       // Selección de todos los videos de una sesión
export-session-btn clicks       // Exportación de sesión como ZIP
session-control-btn clicks      // Control global de sesiones (expandir/colapsar todos)

// ACCIONES MASIVAS
exportBtn, deleteBtn, moveToLocalBtn, combineVideosBtn
exportAllSessionsBtn            // NUEVO: Exportar todas las sesiones

// EVENTOS ESPECIALES
window.beforeunload            // Guarda antes de cerrar
screen.orientation            // Manejo orientación
window.resize                 // Manejo redimensionamiento
document.DOMContentLoaded     // Inicialización app
serviceWorker.register        // Registro service worker
```

## 🔍 **CÓMO USAR ESTE ÍNDICE PARA MODIFICACIONES**

### **Cuando necesites modificar algo:**

1. **Identifica el módulo** afectado en la lista anterior
2. **Busca la función específica** que necesitas cambiar
3. **Pídeme exactamente**: "Necesito modificar la función `[nombre]` del módulo `[módulo]`"
4. **Te enviaré solo esa sección** del código

### **Ejemplos de solicitudes:**

```
"Necesito modificar la función renderVideosList() del módulo Galería"
"Quiero cambiar cómo se agrupan videos en groupVideosBySession()"
"Necesito ajustar la exportación ZIP en exportSession()"
"Quiero modificar la UI de sesiones en renderSession()"
"Necesito cambiar cómo se expanden sesiones en toggleSession()"
"Quiero modificar la selección de sesiones en toggleSelectSession()"
"Necesito ajustar la búsqueda de videos en findVideoInState()"
"Quiero modificar la exportación masiva en exportAllSessions()"
```

### **Para añadir nuevas funcionalidades:**

1. **Identifica el módulo** más relacionado
2. **Pídeme**: "Necesito añadir una función que haga [X] en el módulo [Y]"
3. **Te enviaré** la estructura actual de ese módulo
4. **Podemos añadir** la nueva función en el lugar adecuado

## 📝 **PLANTILLA PARA SOLICITAR MODIFICACIONES**

Cuando necesites hacer un cambio, usa esta plantilla:

```markdown
## 🛠️ SOLICITUD DE MODIFICACIÓN

**Módulo afectado:** [Ej: MÓDULO DE GESTIÓN DE SESIONES]
**Función a modificar:** [Ej: exportSession()]
**Cambio necesario:** [Describe qué quieres cambiar]
**Razón del cambio:** [Por qué es necesario]
**Impacto estimado:** [Qué otras partes afecta]

**Código específico que necesitas:**
- Función principal: exportSession()
- Funciones relacionadas: groupVideosBySession(), getSessionVideos()
- Variables de estado: this.state.videos, this.state.selectedSessions
```

## 🚨 **ZONAS DE ALTO ACOPAMIENTO (CUIDADO AL MODIFICAR)**

Estas funciones afectan múltiples módulos:

1. **`init()`** → Coordina todos los módulos de inicialización
2. **`saveVideoSegment()`** → Usa grabación, GPS, almacenamiento, sesiones, metadatos
3. **`saveToDatabase()`** → Usado por grabación, galería, GPX, configuración
4. **`drawFrameWithData()`** → Usa canvas, overlay, GPS, GPX, marca de agua
5. **`normalizeId()`** → Usado en selección, galería, GPX, reproducción
6. **`formatTime()`** → Usado en UI, estadísticas, reproducción, mapas
7. **`calculateDistance()`** → Usado en GPS, mapas, estadísticas GPX
8. **`selectLocalFolder()`** → Interactúa con PWA, permisos, almacenamiento, UI
9. **`extractVideoDuration()`** → Usado en galería, reproducción, migración iOS
10. **`playVideo()`** → Usa reproducción, mapas, extracción de metadatos, UI
11. **`parseGPXData()`** → Usado por visualización GPX, exportación, mapas
12. **`calculateTrackBounds()`** → Usado por mapas, visualización GPX
13. **`downloadBlob()`** → Usado por exportación de videos y GPX
14. **`renderVideosList()`** → **NUEVO CRÍTICO**: Usa galería, sesiones, exportación, UI (completamente reescrita)
15. **`exportSession()`** → **NUEVO CRÍTICO**: Usa almacenamiento, galería, utilidades, ZIP

## 💡 **RECOMENDACIONES PARA FUTURAS MODIFICACIONES**

### **Pequeños cambios:**
- Modifica solo la función específica
- Verifica dependencias en el índice
- Testea en el módulo afectado

### **Cambios medianos:**
- Revisa el módulo completo
- Verifica interacciones con otros módulos
- Actualiza esta documentación si cambias interfaces

### **Grandes cambios:**
- Considera refactorizar en módulos separados
- Crea interfaces claras entre módulos
- Documenta los nuevos flujos de datos

## 🎯 **RESUMEN**

Ahora tienes un **mapa completo** de tu aplicación `app.js` con las nuevas funcionalidades de **gestión de sesiones**. Con este índice puedes:

1. **Localizar rápidamente** cualquier funcionalidad, incluyendo las nuevas de sesiones
2. **Entender dependencias** entre módulos
3. **Solicitar modificaciones específicas** sin enviar todo el código
4. **Mantener consistencia** al hacer cambios
5. **Identificar zonas críticas** que requieren cuidado especial

## 📊 **ESTADÍSTICAS DEL PROYECTO ACTUALIZADAS**

- **Total módulos documentados:** 18 (ahora incluye Módulo de Gestión de Sesiones)
- **Funciones principales identificadas:** ~200+
- **Nuevas funciones añadidas:** 15+ para gestión de sesiones
- **Variables de estado:** ~55+
- **Variables de control:** ~30+
- **Elementos DOM referenciados:** ~90+
- **Ubicaciones aproximadas:** Definidas para cada módulo
- **Zonas críticas identificadas:** 15 funciones de alto acoplamiento (+2 nuevas)

## 🔄 **CAMBIOS PRINCIPALES RESPECTO A LA VERSIÓN ANTERIOR**

1. **Nuevo módulo:** **MÓDULO DE GESTIÓN DE SESIONES** con 12+ funciones nuevas
2. **Módulo Galería completamente actualizado:** 
   - `renderVideosList()` completamente reescrita
   - Nueva función `groupVideosBySession()`
   - Nueva función `renderSession()`
   - Nueva función `renderVideoItem()`
3. **Módulo Utilidades ampliado:** 
   - `exportSession()` para exportar ZIP por sesión
   - `exportAllSessions()` para exportar todas las sesiones
4. **Estado ampliado:**
   - `this.state.selectedSessions` para control de selección
   - `this.state.expandedSessions` para control de expansión
5. **Módulo Eventos actualizado:** Nuevos eventos para gestión de sesiones
6. **CSS añadido:** Estilos completos para la interfaz de sesiones
7. **Funciones críticas actualizadas:** Se añadieron 2 nuevas funciones críticas

---

**¿Qué necesitas modificar primero?** Dame el módulo y función específica y te enviaré solo esa parte del código.