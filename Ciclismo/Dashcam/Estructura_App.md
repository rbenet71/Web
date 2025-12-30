Tienes razón. Voy a proporcionarte la versión completa y detallada del archivo Estructura_App.md con todos los cambios actualizados:

```markdown
# 🗂️ **ÍNDICE COMPLETO DE FUNCIONALIDADES POR MÓDULO - app.js**

Basándome en el análisis de los archivos y todas las modificaciones recientes, he creado un **índice detallado** de todas las funcionalidades organizadas por módulo. Cuando necesites modificar algo, consulta esta guía y pídeme el código específico.

## 📋 **ESTRUCTURA GENERAL DE app.js**

```
app.js (~7000 líneas)
├── CLASE DashcamApp
│   ├── CONSTRUCTOR + PROPIEDADES (ACTUALIZADO)
│   ├── MÉTODOS DE INICIALIZACIÓN (init, initUI, etc.)
│   ├── MÓDULO PWA (detección, instalación)
│   ├── MÓDULO DE INICIALIZACIÓN Y ESTADO
│   ├── MÓDULO GRABACIÓN
│   ├── MÓDULO GPS
│   ├── MÓDULO DE ALMACENAMIENTO
│   ├── MÓDULO DE SESIONES Y CARPETAS (ACTUALIZADO)
│   ├── MÓDULO DE DIBUJADO Y OVERLAY
│   ├── MÓDULO GALERÍA (COMPLETAMENTE REESCRITO)
│   ├── MÓDULO REPRODUCCIÓN
│   ├── MÓDULO GPX (ampliado)
│   ├── MÓDULO MAPAS (ampliado)
│   ├── MÓDULO CONFIGURACIÓN
│   ├── MÓDULO UTILIDADES (ampliado)
│   ├── MÓDULO DE PERMISOS Y VERIFICACIÓN
│   ├── MÓDULO DE MIGRACIÓN iOS
│   ├── MÓDULO DE BASE DE DATOS - UTILIDADES
│   ├── MÓDULO DE GESTIÓN DE SESIONES (NUEVO COMPLETO)
│   ├── MÓDULO DE COMBINACIÓN Y EXPORTACIÓN (ACTUALIZADO)
│   ├── MÓDULO DE LIMPIEZA AUTOMÁTICA (NUEVO)
│   └── MÓDULO EVENTOS (completo y actualizado)
└── INICIALIZACIÓN GLOBAL
```

## 📁 **ÍNDICE POR MÓDULO - PARA MODIFICACIONES**

### **1. 🏗️ MÓDULO DE INICIALIZACIÓN Y ESTADO** (ACTUALIZADO)
**Ubicación aproximada:** líneas 1-500

```javascript
// CONSTRUCTOR Y PROPIEDADES
constructor()                // Inicializa estado y variables
init()                      // Proceso de inicio de 19 pasos

// ESTADO DE LA APLICACIÓN (COMPLETAMENTE ACTUALIZADO)
this.state = {              
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
    settings: { ... },      
    customLogo: null,
    logoImage: null,
    currentLocationName: 'Buscando...',
    reverseGeocodeCache: {},
    frameCounter: 0,
    // ===== NUEVAS PROPIEDADES AÑADIDAS =====
    expandedSessions: new Set(),    // NUEVO: Control sesiones expandidas
    sessionStats: {},               // NUEVO: Estadísticas por sesión
    tempCombinationVideos: null     // NUEVO: Videos para combinar temporalmente
}

// VARIABLES DE CONTROL (ACTUALIZADAS)
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
this.gpxViewerMap = null;
```

### **2. 🚀 MÓDULO PWA**
**Ubicación aproximada:** líneas 100-300

```javascript
// DETECCIÓN PWA
detectPWAInstallation()          
setupPWAInstallListener()        
checkPWARequirements()           

// SERVICE WORKER
registerServiceWorker()          
clearCacheIfNeeded()             

// INSTALACIÓN
setupPWAEvents()                 
handleInstallPrompt()            
showInstallButton()              
hideInstallButton()              
installPWA()                     
showPWAInstalledBadge()          
promotePWAInstallation()         
showPWAInstallInstructions()     
showLocalServerInstructions()    
```

### **3. 🎬 MÓDULO DE GRABACIÓN**
**Ubicación aproximada:** líneas 500-1200

```javascript
// FUNCIONES PRINCIPALES
startRecording()          
stopRecording()           
pauseRecording()          
resumeRecording()         
startNewSegment()         

// INICIALIZACIÓN CÁMARA
initCamera()              
setupMediaRecorder()      
getVideoBitrate()         
cleanupResources()        
cleanupRecordingResources()

// PROCESAMIENTO VIDEO
processVideoFrame()       
addWatermarkToFrame()     
handleDataAvailable()     
saveVideoSegment()        
saveToApp()               

// GESTIÓN DE SESIONES DE GRABACIÓN
createSessionFolder()     // Crea carpeta/nombre de sesión
resetRecordingSession()   // Resetea sesión de grabación

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
startGPS()                
stopGPS()                 
getCurrentLocation()      
requestLocationPermission()
reverseGeocode()          
getLocationName(lat, lon) 
formatPosition()          
saveGPXPoint()            
saveGPXTrack()            
getGPSErrorMessage()      

// DATOS GPS
this.state.gpsData = {
    currentPosition,
    gpxPoints,            
    currentLocationName,
    speed,
    heading,
    accuracy
}

// VARIABLES DE CONTROL GPS
this.currentPosition      
this.gpxPoints           
this.gpxInterval         
```

### **5. 💾 MÓDULO DE ALMACENAMIENTO**
**Ubicación aproximada:** líneas 1800-2500

```javascript
// BASE DE DATOS (IndexedDB)
initDatabase()            
createDatabaseStores()    
saveToDatabase(store, data) 
getFromStore(store, id)   
getAllFromStore(store)    
deleteFromStore(store, id) 

// SISTEMA DE ARCHIVOS
selectLocalFolder()       
saveToLocalFolder(blob, filename) 
loadLocalFolderVideos()   
syncPhysicalFiles()       
cleanupLocalFilesDatabase()
syncPhysicalFilesWithDatabase() 
deleteFileByPath(filename, sessionName) 
deletePhysicalFile(fileHandle) 

// CONVERSIÓN Y METADATOS
ensureMP4WithMetadata()   
convertWebMtoMP4()        
addGpsMetadataToMP4(blob, track) 
addMetadataToWebM()       

// FUNCIONES DE GUARDADO
saveToApp(blob, timestamp, duration, format, segmentNum, gpsData) // ACTUALIZADA
saveToLocalFolder(blob, filename, sessionName) // ACTUALIZADA

// CONFIGURACIÓN
this.state.settings.storageLocation  // 'default' o 'localFolder'
this.localFolderHandle               
this.state.settings.localFolderName  
```

### **6. 📁 MÓDULO DE SESIONES Y CARPETAS** (ACTUALIZADO)
**Ubicación aproximada:** líneas 1500-2000

```javascript
// GESTIÓN DE SESIONES
createSessionFolder()        
askAboutCombining()         
combineSessionSegments()    
resetRecordingSession()     

// CARPETAS PERSISTENTES
saveFolderHandle()          
restoreFolderHandle()       
updateFolderUI()            
showFolderInstructions()    
showPersistentPermissionReminder() 

// SELECTORES DE CARPETA
showDesktopFolderPickerWithPersistence() 
showIOSFolderPicker()        
showDesktopFolderPicker()    

// INTERFAZ CARPETAS
updateFolderUI()            
requestStoragePersistence() 
showRestoreFolderModal()    

// NUEVAS FUNCIONES PARA SESIONES
scanSessionFolder(folderHandle, sessionName) 
getSessionVideos(sessionName)               
deleteSession(sessionName)                  
renameSession(oldName, newName)             
getSessionFolderHandle(sessionName)         
deleteEmptyFolder(folderHandle, folderName) 
```

### **7. 🎨 MÓDULO DE DIBUJADO Y OVERLAY**
**Ubicación aproximada:** líneas 2000-2500

```javascript
// CAPTURA Y DIBUJADO
startFrameCapture()         
stopFrameCapture()          
drawFrameWithData()         
drawCustomWatermark()       

// ELEMENTOS VISUALES
drawLogo()                  
drawWatermarkText()         
drawGpsInfo()               
drawTemporaryOverlay()      
drawGpxOverlay()            

// CÁLCULOS VISUALES
calculateGpxProgress()      
calculateDistance()         

// CONTROL DE FRAMES
this.animationFrame         
this.frameCounter           
this.mainCanvas             
this.mainCtx                
```

### **8. 🖼️ MÓDULO DE GALERÍA** (COMPLETAMENTE REESCRITO)
**Ubicación aproximada:** líneas 2500-4000

```javascript
// FUNCIONES PRINCIPALES (COMPLETAMENTE REESCRITAS)
loadGallery()               // REESCRITO: Con limpieza automática
loadAppVideos()             
loadLocalFolderVideos()     
scanLocalFolderForVideos()  
scanSessionFolder(folderHandle, sessionName) 
syncPhysicalFilesWithDatabase() 
cleanupLocalFilesDatabase() 
showGallery()               
hideGallery()               

// NUEVO SISTEMA DE RENDERIZADO POR SESIONES
renderVideosList()          // COMPLETAMENTE REESCRITO
groupVideosBySession(videos) // NUEVO: Agrupa videos por sesión
renderVideoItem(video)      // NUEVO: Renderiza video individual
renderSession(session)      // NUEVO: Renderiza sesión completa
renderEmptyState()          // NUEVO: Estado vacío

// ESTRUCTURA DE INTERFAZ IMPLEMENTADA:
// [Fila Superior - Acciones de Sesión]
// 1. 🗑️ Eliminar Sesión  2. 📦 Exportar Sesión  3. ✅ Seleccionar/Deseleccionar
//
// [Fila Inferior - Acciones de Videos Seleccionados]
// Grid de 3 botones (aparece cuando hay selección):
// 1. 🗑️ Eliminar  2. 🔗 Combinar  3. 📦 Exportar

// MEJORA DE DATOS
enhanceLocalVideoData(video) 
extractAndSetVideoDuration(video) 

// SELECCIÓN MÚLTIPLE
toggleSelection(id, type)   
selectAll(type)             
deselectAll(type)           
normalizeId(id)             
escapeHTML(text)            

// CONFIGURACIÓN EVENTOS
setupGalleryEventListeners() 
setupCompactSelectors()     
updateCompactSelectors()    
updateGalleryActions()      
updateSelectionButtons()    

// BÚSQUEDA
findVideoInState(id)        
playVideoFromCurrentLocation(videoId) 
isLocalId(id)               

// ELEMENTOS
this.state.videos[]         
this.state.selectedVideos   
this.state.viewMode         
```

### **9. 🎥 MÓDULO DE REPRODUCCIÓN**
**Ubicación aproximada:** líneas 4000-4500

```javascript
// FUNCIONES PRINCIPALES
playVideo(video)            
playVideoFromCurrentLocation(videoId) 
hideVideoPlayer()           
extractGpxFromVideo()       
extractGPSMetadataFromMP4(video) 
addLocationNamesToTrack(gpsTrack) 

// OPERACIONES INDIVIDUALES
exportSingleVideo()         
deleteSingleVideo()         
moveToLocalFolder()         

// EXTRACCIÓN METADATOS
extractVideoDuration(blob)  
getVideoDurationAlternative(blob) 
extractMP4Duration(arrayBuffer, dataView) 
extractWebMDuration(arrayBuffer, dataView) 
readString(arrayBuffer, offset, length) 

// ELEMENTOS REPRODUCTOR
this.elements.playbackVideo
this.elements.playbackMap
this.elements.videoTitle
this.elements.videoDate
```

### **10. 🗺️ MÓDULO GPX (AMPLIADO)**
**Ubicación aproximada:** líneas 4500-5200

```javascript
// GESTIÓN GPX
loadGPXFiles()            
loadGPXFromStore()        
scanAppGPXFiles()         
scanLocalFolderGPXFiles() 
scanFolderForGPX(folderHandle, path, gpxList) 
viewGPX(gpxId, source)    
downloadGPX(gpxId, source) 
exportGPXAsKML(gpxData)   
exportGPXAsJSON(gpxData)  
generateGPXFromPoints(points, name) 
loadGPXFromFileSystem(filename, path) 

// PARSEO Y PROCESAMIENTO
parseGPXData(gpxText, originalData) 
extractPointData(pointElement)      
calculateGPXStats(points)           
debugGPXFile(file)                  
getGPXFileInfo(file, path)          

// VISUALIZACIÓN
showGPXViewer(gpxData)             
updateGPXViewerData(gpxData)       
initGPXViewerMap(gpxData)          
hideGPXViewer()                    
renderGPXList()                    
setupGPXEventListeners()           
showFullscreenMap(gpxData)         

// CÁLCULOS GEOGRÁFICOS
calculateTrackBounds(points)       
calculateTrackCenter(points)       
calculateDistance(lat1, lon1, lat2, lon2) 

// ELEMENTOS UI
this.elements.gpxList              
this.state.gpxTracks[]             
this.state.loadedGPXFiles          
this.state.activeGPX               
this.gpxViewerMap                  
```

### **11. 🗾 MÓDULO DE MAPAS (AMPLIADO)**
**Ubicación aproximada:** líneas 5200-5800

```javascript
// MAPAS LEAFLET
initPlaybackMap()         
initLeafletMap()          
addMapTileLayers()        
drawRouteOnMap(points)    
addStartEndMarkers(points) 
addMapControls()          
updatePlaybackMap()       
cleanupMap()              

// ACTUALIZACIÓN TIEMPO REAL
updateCurrentPositionMarker(point) 
updateMapInfo(point)      
updateMapStats(points)    

// INTERACCIÓN CON REPRODUCCIÓN
updatePlaybackMap()       

// CONTROL DE MAPA
this.playbackMap          
this.mapTrackLayer        
this.mapRouteLayer        
this.startMarker          
this.endMarker            
this.currentPositionMarker 
this.mapMarkers           
this.mapTileLayers        
```

### **12. ⚙️ MÓDULO DE CONFIGURACIÓN**
**Ubicación aproximada:** líneas 5800-6000

```javascript
// CONFIGURACIÓN
showSettings()            
hideSettings()            
saveSettings()            
resetSettings()           
loadSettings()            
updateSettingsUI()        

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
toggleStorageSettings()   
uploadCustomLogo()        
loadCustomLogo()          
updateLogoInfo()          
```

### **13. 🛠️ MÓDULO DE UTILIDADES** (AMPLIADO SIGNIFICATIVAMENTE)
**Ubicación aproximada:** líneas 6000-6300

```javascript
// FORMATOS Y CONVERSIÓN
formatTime(ms)            
cleanFileName(filename)   // NUEVO: Limpia nombres de archivo
escapeHTML(text)          // NUEVO: Escapa HTML para seguridad
normalizeId(id)           // NUEVO: Normaliza IDs para comparación

// NOTIFICACIONES Y ESTADO
showNotification(message, duration) 
showSavingStatus(message) 
hideSavingStatus()        

// INTERFAZ DE USUARIO
updateUI()                
startMonitoring()         
updateStorageStatus()     
updateGpxSelect()         

// ORIENTACIÓN Y PANTALLAS
checkOrientation()        
showLandscapeModal()      
hideLandscapeModal()      
showStartScreen()         
showCameraScreen()        
updateRecordingUI()       

// DESCARGA Y SUBIDA
downloadBlob(blob, filename) 
uploadCustomLogo()        

// SELECTORES Y NAVEGACIÓN
toggleSelect(type)        
closeAllSelects()         
selectLocation(value)     
selectType(value)         
switchTab(tabName)        

// ESTIMACIONES
estimateDurationByFileSize(fileSize, format) 

// GESTIÓN DE ELEMENTOS SELECCIONADOS (ACTUALIZADAS)
exportSelected()          
deleteSelected()          // ACTUALIZADA con limpieza automática
moveSelectedToLocalFolder() 
combineSelectedVideos()   // ACTUALIZADA con funcionalidad real
showCombineModal()        
hideCombineModal()        

// GPX MANAGER
showGpxManager()          
hideGpxManager()          

// NUEVAS FUNCIONES PARA GESTIÓN DE SESIONES
exportAllSessions()       
exportSession(sessionName) 
```

### **14. 🛡️ MÓDULO DE PERMISOS Y VERIFICACIÓN**
**Ubicación aproximada:** líneas 500-600

```javascript
// VERIFICACIONES
checkPWARequirements()      
requestStoragePersistence() 
cleanupResources()          
checkOrientation()          
clearCacheIfNeeded()        
fixDatabaseVersion()        

// INICIALIZACIÓN ELEMENTOS
initElements()              
init()                      

// FUNCIONES PWA ESPECÍFICAS
detectPWAInstallation()     
setupPWAInstallListener()   
showPWAInstalledBadge()     
promotePWAInstallation()    

// GESTIÓN RECURSOS
cleanupRecordingResources() 
stopFrameCapture()          
```

### **15. 📱 MÓDULO DE MIGRACIÓN iOS**
**Ubicación aproximada:** líneas 6300-6400

```javascript
// MIGRACIÓN iOS/WINDOWS
migrateIOSVideoToWindows(video) 
checkAndMigrateIOSVideos() 
extractIOSMetadata(moovData) 
removeOldMetadata(blob)     
addLocationNamesToTrack(gpsTrack) 

// FUNCIONES AUXILIARES
readString(arrayBuffer, offset, length) 
```

### **16. 💾 MÓDULO DE BASE DE DATOS - UTILIDADES**
**Ubicación aproximada:** líneas 6400-6500

```javascript
// OPERACIONES CRUD
saveToDatabase(storeName, data)  
getAllFromStore(storeName)       
getFromStore(storeName, id)      
deleteFromStore(storeName, id)   

// MANEJO DE ERRORES
// Incluye manejo de ConstraintError y excepciones
```

### **17. 🗂️ MÓDULO DE GESTIÓN DE SESIONES** (NUEVO COMPLETO)
**Ubicación aproximada:** líneas 6500-6700

```javascript
// FUNCIONES DE GESTIÓN DE SESIONES
groupVideosBySession(videos)     // NUEVO: Agrupa videos por sesión
toggleSession(sessionName)       // NUEVO: Expande/colapsa una sesión
toggleSelectSession(sessionName) // NUEVO: Selecciona/deselecciona todos los videos
expandAllSessions()              // NUEVO: Expande todas las sesiones
collapseAllSessions()            // NUEVO: Colapsa todas las sesiones
getSessionByName(sessionName)    // NUEVO: Obtiene información de una sesión
getSessionVideos(sessionName)    // NUEVO: Obtiene videos de una sesión
exportSession(sessionName)       // NUEVO: Exporta sesión como ZIP
exportAllSessions()              // NUEVO: Exporta todas las sesiones
deleteSession(sessionName)       // NUEVO: Elimina una sesión completa

// FUNCIONES DE INTERFAZ PARA SESIONES
renderVideosList()               // COMPLETAMENTE REESCRITA
renderSession(session)           // NUEVO: Renderiza sesión completa
renderVideoItem(video)           // NUEVO: Renderiza video individual
renderEmptyState()               // NUEVO: Estado vacío

// ESTADO DE SESIONES
this.state.expandedSessions = new Set()  // Sesiones expandidas
this.state.selectedSessions = new Set()  // Sesiones seleccionadas
this.state.sessionStats = {}            // Estadísticas por sesión
```

### **18. 🔗 MÓDULO DE COMBINACIÓN Y EXPORTACIÓN** (ACTUALIZADO)
**Ubicación aproximada:** líneas 6700-6900

```javascript
// FUNCIONES DE COMBINACIÓN DE VIDEOS (ACTUALIZADAS)
combineSelectedVideos()            // ACTUALIZADA: Ahora funciona realmente
confirmVideoCombination()          // NUEVO: Confirma y ejecuta combinación
performVideoCombination(selectedVideos) // NUEVO: Realiza combinación real
combineSessionSegments()           // Combina segmentos de sesión
askAboutCombining()                // Pregunta sobre combinar segmentos

// FUNCIONES DE MODAL DE COMBINACIÓN
showCombineModal()                 // Muestra modal de combinación
showCombineModalWithCustomAction() // NUEVO: Modal con acción personalizada
hideCombineModal()                 // Oculta modal

// FUNCIONES AUXILIARES DE COMBINACIÓN
combineVideoBlobs(videoBlobs)      // NUEVO: Combina blobs de video
createZipFromSelectedVideos()      // NUEVO: Crea ZIP alternativo

// FUNCIONES DE EXPORTACIÓN MEJORADAS
exportSession(sessionName)         // ACTUALIZADA: Usa JSZip para compresión
exportAllSessions()                // ACTUALIZADA: Exporta todas las sesiones

// VARIABLES TEMPORALES
this.tempCombinationVideos = null  // Videos para combinar temporalmente
```

### **19. 🧹 MÓDULO DE LIMPIEZA AUTOMÁTICA** (NUEVO)
**Ubicación aproximada:** líneas 6900-7000

```javascript
// LIMPIEZA AUTOMÁTICA DE SESIONES VACÍAS
cleanupEmptySessions()           // NUEVO: Limpia sesiones vacías automáticamente
cleanupEmptyLocalFolders()       // NUEVO: Limpia carpetas locales vacías

// FUNCIONES AUXILIARES DE LIMPIEZA
getSessionFolderHandle(sessionName) // NUEVO: Obtiene handle de carpeta
deleteEmptyFolder(folderHandle, folderName) // NUEVO: Elimina carpeta vacía

// INTEGRACIÓN CON OTRAS FUNCIONES
deleteVideoById(videoId, video)  // NUEVO: Elimina video específico
deleteSelected()                 // MODIFICADA: Ahora llama a cleanupEmptySessions()

// FLUJO DE LIMPIEZA:
// 1. deleteSelected() → Elimina videos
// 2. cleanupEmptySessions() → Verifica sesiones vacías
// 3. cleanupEmptyLocalFolders() → Limpia carpetas físicas
```

### **20. 🔌 MÓDULO DE EVENTOS** (COMPLETO Y ACTUALIZADO)
**Ubicación aproximada:** líneas 7000-7100

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
delete-session-btn clicks       // Eliminación de sesión completa
session-control-btn clicks      // Control global de sesiones

// NUEVOS EVENTOS PARA COMBINACIÓN
combine-videos-btn clicks       // Inicia combinación de videos seleccionados
confirm-combination-btn clicks  // Confirma combinación en modal

// ACCIONES MASIVAS ACTUALIZADAS
exportBtn, deleteBtn, moveToLocalBtn, combineVideosBtn
exportAllSessionsBtn            // Exportar todas las sesiones

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
"Necesito ajustar la combinación de videos en performVideoCombination()"
"Quiero modificar la exportación ZIP en exportSession()"
"Necesito cambiar cómo se expanden sesiones en toggleSession()"
"Quiero modificar la selección de sesiones en toggleSelectSession()"
"Necesito ajustar la limpieza automática en cleanupEmptySessions()"
"Quiero modificar la eliminación de sesión completa en deleteSession()"
"Necesito cambiar la interfaz de botones en renderSession()"
"Quiero modificar el manejo de errores en combineSelectedVideos()"
```

## 📝 **PLANTILLA PARA SOLICITAR MODIFICACIONES**

```markdown
## 🛠️ SOLICITUD DE MODIFICACIÓN

**Módulo afectado:** [Ej: MÓDULO DE GESTIÓN DE SESIONES]
**Función a modificar:** [Ej: cleanupEmptySessions()]
**Cambio necesario:** [Describe qué quieres cambiar]
**Razón del cambio:** [Por qué es necesario]
**Impacto estimado:** [Qué otras partes afecta]

**Código específico que necesitas:**
- Función principal: cleanupEmptySessions()
- Funciones relacionadas: cleanupEmptyLocalFolders(), getSessionFolderHandle()
- Variables de estado: this.state.expandedSessions, this.state.selectedSessions
```

## 🚨 **ZONAS DE ALTO ACOPAMIENTO (CUIDADO AL MODIFICAR)**

Estas funciones afectan múltiples módulos y son críticas para el funcionamiento:

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
14. **`renderVideosList()`** → **CRÍTICO REESCRITO**: Base del sistema de sesiones
15. **`groupVideosBySession()`** → **NUEVO CRÍTICO**: Lógica de agrupamiento
16. **`deleteSelected()`** → **ACTUALIZADA**: Ahora limpia sesiones vacías
17. **`combineSelectedVideos()`** → **ACTUALIZADA**: Sistema completo de combinación
18. **`confirmVideoCombination()`** → **NUEVO CRÍTICO**: Ejecuta combinación real
19. **`exportSession()`** → **NUEVO CRÍTICO**: Exportación ZIP por sesión
20. **`deleteSession()`** → **NUEVO CRÍTICO**: Eliminación completa de sesión

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

## 🎯 **RESUMEN DE LAS MODIFICACIONES IMPLEMENTADAS**

### **SISTEMA COMPLETO DE SESIONES:**
1. ✅ **Renderizado jerárquico** por sesiones con expansión/colapso
2. ✅ **Interfaz reorganizada** con botones en dos filas
3. ✅ **Selección masiva** por sesión y por video individual
4. ✅ **Grid de acciones** para videos seleccionados
5. ✅ **Estadísticas por sesión** automáticas

### **FUNCIONALIDADES NUEVAS IMPLEMENTADAS:**
1. ✅ **Combinación real de videos** (concatenación de blobs MP4)
2. ✅ **Exportación ZIP por sesión** con JSZip
3. ✅ **Limpieza automática** de sesiones vacías
4. ✅ **Eliminación completa** de sesiones
5. ✅ **Modal de confirmación** para combinación

### **MEJORAS DE USABILIDAD:**
1. ✅ **Interfaz más limpia** sin contadores redundantes
2. ✅ **Feedback visual** mejorado con hover effects
3. ✅ **Organización lógica** de botones por funcionalidad
4. ✅ **Mensajes informativos** contextuales
5. ✅ **Diseño responsive** para móviles

## 📊 **ESTADÍSTICAS DEL PROYECTO ACTUALIZADAS**

- **Total módulos documentados:** 20
- **Funciones principales identificadas:** ~250+
- **Nuevas funciones añadidas:** 45+ para gestión de sesiones
- **Funciones reescritas completamente:** 5 (renderVideosList, etc.)
- **Variables de estado:** ~70+
- **Variables de control:** ~45+
- **Elementos DOM referenciados:** ~105+
- **Zonas críticas identificadas:** 20 funciones de alto acoplamiento
- **Dependencias externas añadidas:** JSZip para compresión ZIP

## 🔄 **CAMBIOS PRINCIPALES RESPECTO A VERSIÓN ANTERIOR**

1. **Nuevo módulo:** **LIMPIEZA AUTOMÁTICA** con 4 funciones nuevas
2. **Módulo actualizado:** **COMBINACIÓN Y EXPORTACIÓN** con funcionalidad real
3. **Módulo reescrito:** **GALERÍA** con sistema completo de sesiones
4. **Mejoras significativas:** **UTILIDADES** con 15+ nuevas funciones
5. **Estado ampliado:** 3 nuevas propiedades para gestión de sesiones
6. **Eventos actualizados:** 10+ nuevos eventos para funcionalidades nuevas
7. **Integración completa:** JSZip para exportación comprimida

---

**¿Qué necesitas modificar primero?** Dame el módulo y función específica y te enviaré solo esa parte del código.
```

Este archivo ahora refleja **completamente** todas las modificaciones implementadas, incluyendo el sistema completo de sesiones, combinación de videos, exportación ZIP y limpieza automática.