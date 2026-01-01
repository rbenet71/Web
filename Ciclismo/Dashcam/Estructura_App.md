Aquí está el archivo `Estructura_App.md` actualizado con todos los cambios:

```markdown
# 🗂️ **ÍNDICE COMPLETO DE FUNCIONALIDADES POR MÓDULO - app.js** (ACTUALIZADO v4.9.1)

Con las mejoras implementadas para la funcionalidad realista de iOS Safari y el nuevo sistema de nombres estandarizado, aquí está el archivo **Estructura_App.md** completamente actualizado:

```markdown
# 🗂️ ÍNDICE COMPLETO DE FUNCIONALIDADES POR MÓDULO - app.js (ACTUALIZADO v4.9.1)

Basándome en las limitaciones reales de iOS Safari, el flujo de trabajo implementado y el nuevo sistema de nombres estandarizado, he actualizado completamente el archivo Estructura_App.md:

## 📋 ESTRUCTURA GENERAL DE app.js

```
app.js (~8710 líneas)
├── CLASE DashcamApp
│   ├── CONSTRUCTOR + PROPIEDADES (ACTUALIZADO CON REALIDAD iOS)
│   ├── MÉTODOS DE INICIALIZACIÓN (init, initUI, etc.)
│   ├── MÓDULO PWA (detección realista - ACTUALIZADO)
│   ├── MÓDULO DE INICIALIZACIÓN Y ESTADO
│   ├── MÓDULO GRABACIÓN (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES)
│   ├── MÓDULO GPS
│   ├── MÓDULO DE ALMACENAMIENTO
│   ├── MÓDULO DE SESIONES Y CARPETAS
│   ├── MÓDULO DE DIBUJADO Y OVERLAY
│   ├── MÓDULO GALERÍA (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES)
│   ├── MÓDULO REPRODUCCIÓN (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES)
│   ├── MÓDULO GPX
│   ├── MÓDULO MAPAS
│   ├── MÓDULO CONFIGURACIÓN (ACTUALIZADO CON LIMITACIONES iOS)
│   ├── MÓDULO UTILIDADES (AMPLIADO CON FUNCIONES iOS REALES Y NUEVO SISTEMA DE NOMBRES)
│   ├── MÓDULO DE PERMISOS Y VERIFICACIÓN
│   ├── MÓDULO DE MIGRACIÓN iOS
│   ├── MÓDULO DE BASE DE DATOS - UTILIDADES (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES)
│   ├── MÓDULO DE GESTIÓN DE SESIONES
│   ├── MÓDULO DE COMBINACIÓN Y EXPORTACIÓN
│   ├── MÓDULO DE LIMPIEZA AUTOMÁTICA
│   ├── MÓDULO DE GESTIÓN DE ARCHIVOS iOS (REALIDAD ACTUALIZADA)
│   ├── MÓDULO EVENTOS (ACTUALIZADO CON LISTENERS UNIFICADOS)
│   ├── FUNCIONES AUXILIARES DE GALERÍA
│   ├── MÓDULO DE DIAGNÓSTICO Y VERIFICACIÓN
│   ├── MÓDULO DE SINCRONIZACIÓN WEBKIT/IOS
│   └── NUEVO: MÓDULO DE ASISTENTE iOS (GUARDADO MANUAL)
└── INICIALIZACIÓN GLOBAL
```

## 📁 ÍNDICE POR MÓDULO - PARA MODIFICACIONES

### **1. 🏗️ MÓDULO DE INICIALIZACIÓN Y ESTADO** (ACTUALIZADO CON REALIDAD iOS)
**Ubicación aproximada:** líneas 1-500

```javascript
// CONSTRUCTOR Y PROPIEDADES
constructor()                // Inicializa estado y variables con realidad iOS
init()                      // Proceso de inicio de 20 pasos (ACTUALIZADO)

// ESTADO DE LA APLICACIÓN (CON REALIDAD iOS)
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
    selectedSessions: new Set(),
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
    expandedSessions: new Set(),
    sessionStats: {},
    tempCombinationVideos: null
}

// PROPIEDADES ACTUALIZADAS CON REALIDAD iOS
this.state.settings = {
    // ... otras configuraciones ...
    storageLocation: 'default', // 'default' o 'localFolder'
    localFolderName: '',
    localFolderPath: '',
    
    // ===== REALIDAD iOS SAFARI =====
    iosCapabilities: {           // Lo que REALMENTE puede hacer iOS
        canDownloadFiles: true,  // ✅ Siempre funciona con <a download>
        canSaveToPhotos: true,   // ✅ Puede guardar en Fotos
        canUseShareSheet: true,  // ✅ Puede usar menú Compartir
        canUseFilesApp: true,    // ✅ Puede usar app Archivos
        canShowDirectoryPicker: false, // ❌ Nunca funciona en iOS
        canWriteToSelectedFolder: false, // ❌ No puede escribir donde quiera
        canCreateFoldersProgrammatically: false, // ❌ No puede crear carpetas
        canAccessUSBdirectly: false, // ❌ No puede acceder a USB directamente
        canSaveViaFilesApp: true,    // ✅ Usuario puede navegar manualmente
        canOrganizeManually: true,   // ✅ Usuario puede crear carpetas manualmente
        canBatchProcess: false       // ❌ No puede procesar en lote automáticamente
    },
    
    isWebkitDirectory: false,    // TRUE si usa webkitdirectory en iOS
    isExternalDevice: false,     // TRUE si es USB/dispositivo externo
    webkitFolderName: null,      // Nombre de carpeta webkit
    webkitFilesCount: 0,         // Número de archivos en webkit
    webkitLastScan: null,        // Último escaneo webkit
    
    // ===== REALIDAD PWA EN iOS =====
    pwaInstalled: false,         // Detectado por múltiples métodos
    pwaDetectionMethod: 'none',  // Método usado para detección
    pwaInstallDate: null,        // Fecha de instalación
    pwaCanWriteDirectly: false,  // ❌ IMPORTANTE: PWA en iOS NO puede escribir
    
    // ===== FLUJO DE GUARDADO MANUAL iOS =====
    iosManualSaveEnabled: true,   // Usar flujo manual para iOS
    iosShowInstructions: true,    // Mostrar instrucciones paso a paso
    iosAutoFilename: true,        // Generar nombres automáticos con sesión
    iosSaveMethod: 'download',    // 'download' o 'share'
    
    // ===== PERSISTENCIA DE LOGO =====
    customLogo: null,
    logoFilename: null,
    logoInfo: null,
    logoFileSize: 0,
    logoDimensions: '?x?',
    logoLastModified: Date.now(),
    logoId: null,
    logoIsIOS: false,
    lastLogoUpdate: Date.now(),
    logoSource: 'unknown'
}

// VARIABLES DE CONTROL (ACTUALIZADAS CON REALIDAD iOS)
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
this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
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
this.isPWAInstalled = false;        // Detección mejorada
this.deferredPrompt = null;
this.installButton = null;
this.gpxViewerMap = null;
this.iosManualSaveQueue = [];       // Cola de videos pendientes para iOS
```

### **2. 🚀 MÓDULO PWA** (ACTUALIZADO CON REALIDAD iOS)
**Ubicación aproximada:** líneas 100-400

```javascript
// DETECCIÓN PWA REALISTA (CON LIMITACIONES iOS)
async detectPWAInstallation()          // Detección realista con verificación iOS
setupPWAInstallListener()        
checkPWARequirements()           

// DETECCIÓN REALISTA POR MÉTODO:
// 1. display-mode: standalone (funciona en iOS PWA)
// 2. navigator.standalone (iOS Safari específico)
// 3. localStorage marcado manual
// 4. Parámetros URL para debugging
// 5. Verificación de APIs disponibles

// REALIDAD iOS: PWA instalado NO da permisos de escritura
async verifyIOSPWALimitations()    // Verifica lo que REALMENTE puede hacer iOS PWA

// FUNCIÓN PARA MARCAR MANUALMENTE
markAsPWAInstalled()            // Marca app como instalada manualmente

// SERVICE WORKER
registerServiceWorker()          
clearCacheIfNeeded()             

// INSTALACIÓN (con advertencias iOS)
setupPWAEvents()                 
handleInstallPrompt()            
showInstallButton()              
hideInstallButton()              
installPWA()                     
showPWAInstalledBadge()          
promotePWAInstallation()         
showPWAInstallInstructions()     
showLocalServerInstructions()    

// NUEVO: EXPLICACIÓN LIMITACIONES iOS
showIOSPWALimitationWarning()    // Explica que PWA en iOS no puede escribir en USB
setupIOSWorkflowInstructions()   // Configura instrucciones para flujo manual
```

### **3. 🎬 MÓDULO DE GRABACIÓN** (ACTUALIZADO CON FLUJO iOS REAL Y NUEVO SISTEMA DE NOMBRES)
**Ubicación aproximada:** líneas 500-1400

```javascript
// FUNCIONES PRINCIPALES (ACTUALIZADAS CON FLUJO iOS Y NUEVO SISTEMA DE NOMBRES)
async saveVideoSegment()         // Guarda con flujo iOS manual y nombres RBB_...
startRecording()          
stopRecording()           
pauseRecording()          
resumeRecording()         
startNewSegment()         

// FLUJO ESPECÍFICO PARA iOS
async saveVideoSegmentIOS()      // Flujo manual para iOS Safari
async prepareIOSManualSave(blob, filename, sessionName) // Prepara descarga manual
async triggerIOSDownload(blob, filename) // Dispara descarga iOS

// NUEVO: GENERACIÓN DE NOMBRES ESTANDARIZADOS
generateStandardFilename(segmentNum = 1, customDate = null) // Genera RBB_YYYYMMDD_HHMM_S[#].mp4

// VERIFICACIÓN REALISTA PARA iOS
const shouldUseIOSManualFlow = this.isIOS && 
                              this.state.settings.storageLocation === 'localFolder';

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
saveVideoSegment()        // Con lógica iOS manual y nombres RBB_...
saveToApp()               

// GESTIÓN DE SESIONES DE GRABACIÓN
createSessionFolder()     // Solo nombre en memoria para iOS
resetRecordingSession()   

// GENERACIÓN DE NOMBRES PARA iOS (ACTUALIZADO CON SISTEMA RBB_...)
generateIOSFilename(originalName, sessionName) // Incluye sesión y timestamp
getAutoFilenameForIOS()   // Nombre automático para organización manual

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
**Ubicación aproximada:** líneas 1400-2000

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

### **5. 💾 MÓDULO DE ALMACENAMIENTO** (ACTUALIZADO CON REALIDAD iOS)
**Ubicación aproximada:** líneas 2000-2800

```javascript
// BASE DE DATOS (IndexedDB) - MEJORADO
initDatabase()            
createDatabaseStores()    
saveToDatabase(store, data) 
getFromStore(store, id)   
getAllFromStore(store)    
deleteFromStore(store, id) 

// SISTEMA DE ARCHIVOS - ESTRATEGIAS POR PLATAFORMA
selectLocalFolder()       
saveToLocalFolder(blob, filename, sessionName)  // Decide estrategia por plataforma
loadLocalFolderVideos()   // Carga según plataforma

// FLUJO ESPECÍFICO iOS (GUARDADO MANUAL)
async saveToLocalFolderIOS(blob, filename, sessionName) // Flujo manual iOS
async prepareIOSDownload(blob, filename, sessionName)   // Prepara descarga
async executeIOSDownload(blob, filename)                // Ejecuta descarga
async saveToIndexedDBFallback(blob, filename, sessionName, error) // Fallback

// FUNCIONES ESPECÍFICAS WEBKITDIRECTORY
loadWebkitDirectoryVideosFromDB()    // Carga videos webkit desde IndexedDB
loadFolderVideosFromIndexedDB(folderName) // Carga por nombre
saveWebkitFileReference(fileData)    // Guarda referencia webkit

// SINCRONIZACIÓN MEJORADA
async syncPhysicalFilesWithDatabase() // Estrategias múltiples
syncPhysicalFilesWithHandle()        // Para handle persistente (NO iOS)
syncWebkitDirectoryReferences()      // Para webkit
cleanupInvalidWebkitReferences()     // Limpia referencias inválidas
cleanupOrphanedDatabaseEntries()     // Limpia entradas huérfanas

// CONVERSIÓN Y METADATOS
ensureMP4WithMetadata()   
convertWebMtoMP4()        
addGpsMetadataToMP4(blob, track) 
addMetadataToWebM()       

// CONFIGURACIÓN
this.state.settings.storageLocation  // 'default' o 'localFolder'
this.localFolderHandle               // null en iOS (no disponible)
this.state.settings.localFolderName  // Usado en iOS para referencia
```

### **6. 📁 MÓDULO DE SESIONES Y CARPETAS** (ACTUALIZADO CON REALIDAD iOS)
**Ubicación aproximada:** líneas 1700-2200

```javascript
// GESTIÓN DE SESIONES (VIRTUALES EN iOS)
createSessionFolder()        // Solo nombre en memoria para iOS
askAboutCombining()         
combineSessionSegments()    
resetRecordingSession()     

// SELECTORES DE CARPETA - REALIDAD iOS
async showIOSFolderPicker()  // Solo lectura con webkitdirectory
showDesktopFolderPickerWithPersistence() 
showDesktopFolderPicker()    

// DETECCIÓN DE DISPOSITIVOS EXTERNOS
detectExternalDevice(folderName, webkitPath) // USB/externo

// INTERFAZ CARPETAS - ACTUALIZADA CON ADVERTENCIAS iOS
updateFolderUI()            // Muestra estado real de permisos iOS
showIOSFolderLimitationWarning() // Explica limitaciones iOS
requestStoragePersistence() 
showRestoreFolderModal()    

// NUEVAS FUNCIONES PARA iOS
processWebkitFolderSelection(files) // Procesa selección webkit
saveWebkitFolderInfo(folderName, isExternal) // Guarda info webkit
explainIOSLimitations()            // Explica por qué no hay escritura automática

// FUNCIONES PARA SESIONES (VIRTUALES EN iOS)
scanSessionFolder(folderHandle, sessionName) // Solo desktop
getSessionVideos(sessionName)               
deleteSession(sessionName)                  
renameSession(oldName, newName)             
getSessionFolderHandle(sessionName)         // null en iOS
deleteEmptyFolder(folderHandle, folderName) // Solo desktop

// ORGANIZACIÓN MANUAL PARA iOS
generateIOSOrganizationGuide()              // Guía para organizar manualmente
suggestSessionNamesForIOS()                 // Sugiere nombres para carpetas
createIOSReadmeFile(sessionName)           // Crea archivo README para guiar
```

### **7. 🎨 MÓDULO DE DIBUJADO Y OVERLAY**
**Ubicación aproximada:** líneas 2200-2700

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

### **8. 🖼️ MÓDULO DE GALERÍA** (ACTUALIZADO CON FLUJO iOS Y NUEVO SISTEMA DE NOMBRES)
**Ubicación aproximada:** líneas 2700-4500

```javascript
// FUNCIONES PRINCIPALES - MEJORADAS CON iOS Y NUEVO SISTEMA DE NOMBRES
async loadGallery()               // Carga según plataforma
async loadLocalFolderVideos()     // Verificación mejorada con iOS
loadAppVideos()              // ACTUALIZADO: Genera títulos con formato RBB_...
scanLocalFolderForVideos()  
scanSessionFolder(folderHandle, sessionName) 
showGallery()               
hideGallery()               

// VERIFICACIÓN MEJORADA PARA CARGA iOS
const shouldLoadLocal = this.state.settings.storageLocation === 'localFolder' && 
                       (this.localFolderHandle || 
                        this.state.settings.localFolderName || 
                        this.state.settings.isWebkitDirectory);

// SISTEMA DE RENDERIZADO POR TABLA
renderVideosList()          // Versión tabla con onclick directo
groupVideosBySession(videos) // Agrupa videos por sesión
renderVideoItem(video, sessionName, index) 
renderSessionRow(session, index) 

// MEJORA DE DATOS CON SOPORTE iOS REAL Y NUEVO SISTEMA DE NOMBRES
enhanceLocalVideoData(video)  // ACTUALIZADO: Genera nombres con formato RBB_...
extractAndSetVideoDuration(video) 

// SELECCIÓN MÚLTIPLE
toggleVideoSelection(videoId)      
toggleSessionSelection(sessionName) 
toggleSelectAllVideos(checked)     
playVideoById(videoId)            

// CONFIGURACIÓN EVENTOS
setupGalleryEventListeners() 
setupCompactSelectors()      
updateCompactSelectors()     
updateGalleryActions()       
updateSelectionButtons()     

// NUEVO: HERRAMIENTAS iOS
showIOSOrganizationTools()        // Muestra herramientas para organizar manualmente
generateIOSFileList()             // Genera lista de archivos para organización
createIOSOrganizationGuide()      // Crea guía paso a paso

// ELEMENTOS
this.state.videos[]          // Incluye videos iOS manuales con nombres RBB_...
this.state.selectedVideos    
this.state.viewMode          
```

### **9. 🎥 MÓDULO DE REPRODUCCIÓN** (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES)
**Ubicación aproximada:** líneas 4500-5000

```javascript
// FUNCIONES PRINCIPALES (ACTUALIZADAS CON NUEVO SISTEMA DE NOMBRES)
playVideo(video)            
playVideoFromCurrentLocation(videoId)  // ACTUALIZADO: Usa formato RBB_...
hideVideoPlayer()           
extractGpxFromVideo()       
extractGPSMetadataFromMP4(video) 
addLocationNamesToTrack(gpsTrack) 

// OPERACIONES INDIVIDUALES
exportSingleVideo()         
deleteSingleVideo()         
moveToLocalFolder()         // Solo desktop

// NUEVO: RE-DESCARGA PARA iOS
redownloadVideoIOS(video)   // Permite re-descargar video en iOS
showIOSRedownloadOption(video) // Muestra opción de re-descarga

// EXTRACCIÓN METADATOS
extractVideoDuration(blob)  
getVideoDurationAlternative(blob) 
extractMP4Duration(arrayBuffer, dataView) 
extractWebMDuration(arrayBuffer, dataView) 
readString(arrayBuffer, offset, length) 

// ELEMENTOS REPRODUCTOR
this.elements.playbackVideo
this.elements.playbackMap
this.elements.videoTitle    // Ahora muestra nombres RBB_...
this.elements.videoDate
```

### **10. 🗺️ MÓDULO GPX**
**Ubicación aproximada:** líneas 5000-5700

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

### **11. 🗾 MÓDULO DE MAPAS**
**Ubicación aproximada:** líneas 5700-6300

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

### **12. ⚙️ MÓDULO DE CONFIGURACIÓN** (ACTUALIZADO CON REALIDAD iOS)
**Ubicación aproximada:** líneas 6300-6800

```javascript
// CONFIGURACIÓN - FUNCIONES MEJORADAS CON iOS
showSettings()            
hideSettings()            
async saveSettings()      // Guarda configuración iOS
resetSettings()           
loadSettings()            
updateSettingsUI()        

// FUNCIONES DE INTERFAZ MEJORADAS CON iOS
updateFolderUI()          // Muestra estado real iOS
toggleStorageSettings()   // Muestra/oculta sección carpeta con advertencias
showIOSLimitationInfo()   // Muestra información de limitaciones iOS

// AJUSTES ACTUALIZADOS CON REALIDAD iOS
this.state.settings = {
    recordingMode: 'continuous',
    segmentDuration: 300,
    videoQuality: 'medium',
    videoFormat: 'mp4',
    gpxInterval: 1,
    overlayEnabled: true,
    audioEnabled: false,
    reverseGeocodeEnabled: true,
    watermarkOpacity: 0.7,
    watermarkFontSize: 16,
    watermarkPosition: 'bottom-right',
    storageLocation: 'default',
    keepAppCopy: true,
    showWatermark: true,
    logoPosition: 'top-left',
    logoSize: 'medium',
    customWatermarkText: '',
    textPosition: 'top-right',
    gpxOverlayEnabled: false,
    showGpxDistance: true,
    showGpxSpeed: true,
    embedGpsMetadata: true,
    metadataFrequency: 5,
    localFolderName: '',
    
    // ===== REALIDAD iOS SAFARI =====
    iosCapabilities: { ... }, // Lo que REALMENTE puede hacer iOS
    iosManualSaveEnabled: true,
    iosShowInstructions: true,
    iosAutoFilename: true,
    iosSaveMethod: 'download',
    
    // ===== CONFIGURACIÓN WEBKIT/IOS =====
    isWebkitDirectory: false,
    isExternalDevice: false,
    webkitFolderName: null,
    webkitFilesCount: 0,
    
    // ===== REALIDAD PWA EN iOS =====
    pwaInstalled: false,
    pwaDetectionMethod: 'none',
    pwaInstallDate: null,
    pwaCanWriteDirectly: false,  // ❌ IMPORTANTE
    
    // ===== PERSISTENCIA DE LOGO =====
    customLogo: null,
    logoFilename: null,
    logoInfo: null,
    logoFileSize: 0,
    logoDimensions: '?x?',
    logoLastModified: Date.now(),
    logoId: null,
    logoIsIOS: false,
    lastLogoUpdate: Date.now(),
    logoSource: 'unknown'
}

// INTERFAZ CON ADVERTENCIAS iOS
toggleStorageSettings()   
uploadCustomLogo()        
loadCustomLogo()          
updateLogoInfo()          
showIOSStorageWarning()   // Muestra advertencia iOS al seleccionar carpeta
```

### **13. 🛠️ MÓDULO DE UTILIDADES** (AMPLIADO CON iOS REAL Y NUEVO SISTEMA DE NOMBRES)
**Ubicación aproximada:** líneas 6800-7300

```javascript
// FORMATOS Y CONVERSIÓN
formatTime(ms)            
cleanFileName(filename)   
escapeHTML(text)          
normalizeId(id)           

// NUEVO: GENERACIÓN DE NOMBRES ESTANDARIZADOS
generateStandardFilename(segmentNum = 1, customDate = null) // Genera RBB_YYYYMMDD_HHMM_S[#].mp4

// NOTIFICACIONES Y ESTADO (MEJORADAS PARA iOS)
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

// GESTIÓN DE ELEMENTOS SELECCIONADOS
exportSelected()          
deleteSelected()          
moveSelectedToLocalFolder() // Solo desktop
combineSelectedVideos()   
showCombineModal()        
hideCombineModal()        

// NUEVAS FUNCIONES PARA iOS REAL
generateIOSFilename(originalName, sessionName) // Nombre con sesión
showIOSStepByStepGuide()   // Guía paso a paso para iOS
prepareIOSDownloadPackage(blobs, sessionName) // Prepara paquete para descarga
createIOSOrganizationTemplate() // Plantilla para organización manual

// DIAGNÓSTICO iOS
debugIOSStorage()         // Diagnóstico específico iOS
verifyIOSPermissions()    // Verifica permisos REALES iOS
testIOSDownload()         // Prueba descarga en iOS

// COLA DE GUARDADO iOS
addToIOSSaveQueue(blob, filename, sessionName) // Añade a cola
processIOSSaveQueue()     // Procesa cola de guardados
showIOSQueueStatus()      // Muestra estado de cola
```

### **14. 🛡️ MÓDULO DE PERMISOS Y VERIFICACIÓN**
**Ubicación aproximada:** líneas 500-700

```javascript
// VERIFICACIONES REALISTAS
checkPWARequirements()      // Con realidad iOS
requestStoragePersistence() 
cleanupResources()          
checkOrientation()          
clearCacheIfNeeded()        
fixDatabaseVersion()        

// NUEVO: VERIFICACIÓN iOS
verifyIOSCapabilities()     // Verifica lo que REALMENTE puede hacer iOS
checkIOSFileAccess()        // Verifica acceso a archivos en iOS
testIOSWritePermissions()   // Prueba escritura (siempre falla en iOS)

// INICIALIZACIÓN ELEMENTOS
initElements()              
init()                      

// FUNCIONES PWA ESPECÍFICAS (CON REALIDAD iOS)
detectPWAInstallation()     // Detección realista
setupPWAInstallListener()   
showPWAInstalledBadge()     
promotePWAInstallation()    
explainPWALimitationsIOS()  // Explica limitaciones PWA en iOS

// GESTIÓN RECURSOS
cleanupRecordingResources() 
stopFrameCapture()          
```

### **15. 📱 MÓDULO DE MIGRACIÓN iOS**
**Ubicación aproximada:** líneas 7300-7400

```javascript
// MIGRACIÓN iOS/WINDOWS
migrateIOSVideoToWindows(video) 
checkAndMigrateIOSVideos() 
extractIOSMetadata(moovData) 
removeOldMetadata(blob)     
addLocationNamesToTrack(gpsTrack) 

// NUEVO: MIGRACIÓN MANUAL iOS
generateIOSMigrationGuide()  // Guía para migrar videos manualmente
createIOSFileListForMigration() // Lista para migración manual
suggestFolderStructureForIOS() // Sugiere estructura de carpetas

// FUNCIONES AUXILIARES
readString(arrayBuffer, offset, length) 
```

### **16. 💾 MÓDULO DE BASE DE DATOS - UTILIDADES** (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES)
**Ubicación aproximada:** líneas 7400-7500

```javascript
// OPERACIONES CRUD
saveToDatabase(storeName, data)  
getAllFromStore(storeName)       
getFromStore(storeName, id)      
deleteFromStore(storeName, id)   

// NUEVO: BASE DE DATOS PARA iOS
saveIOSManualReference(data)      // Guarda referencia de guardado manual
getPendingIOSDownloads()          // Obtiene descargas pendientes iOS
markIOSDownloadComplete(id)       // Marca descarga iOS como completada

// ACTUALIZACIÓN: SAVE TO APP CON NUEVO SISTEMA DE NOMBRES
async saveToApp(blob, timestamp, duration, format, segmentNum = 1, gpsData = []) {
    // Ahora usa generateStandardFilename() para título y filename
    // Título: RBB_YYYYMMDD_HHMM_S[#] (sin .mp4)
    // Filename: RBB_YYYYMMDD_HHMM_S[#].mp4
}

// MANEJO DE ERRORES
// Incluye manejo de ConstraintError y excepciones
```

### **17. 🗂️ MÓDULO DE GESTIÓN DE SESIONES**
**Ubicación aproximada:** líneas 7500-7700

```javascript
// FUNCIONES DE GESTIÓN DE SESIONES
groupVideosBySession(videos)     
toggleSession(sessionName)       
toggleSessionSelection(sessionName) 
expandAllSessions()              
collapseAllSessions()            
getSessionByName(sessionName)    
getSessionVideos(sessionName)    
exportSession(sessionName)       
exportAllSessions()              
deleteSession(sessionName)       

// NUEVO: SESIONES VIRTUALES iOS
createVirtualSessionIOS(sessionName) // Sesión solo en memoria para iOS
getVirtualSessionVideos(sessionName) // Videos de sesión virtual
exportVirtualSessionIOS(sessionName) // Exporta sesión virtual

// FUNCIONES DE INTERFAZ PARA TABLA
renderVideosList()               
renderVideoItem(video, sessionName, index) 
renderSessionRow(session, index) 
renderEmptyState()               

// FUNCIONES AUXILIARES
toggleVideoSelection(videoId)    
toggleSelectAllVideos(checked)   
playVideoById(videoId)           

// ESTADO DE SESIONES
this.state.expandedSessions = new Set()  
this.state.selectedSessions = new Set()  
this.state.sessionStats = {}             
this.state.virtualSessions = {}          // Sesiones virtuales iOS
```

### **18. 🔗 MÓDULO DE COMBINACIÓN Y EXPORTACIÓN**
**Ubicación aproximada:** líneas 7700-7800

```javascript
// FUNCIONES DE COMBINACIÓN DE VIDEOS
combineSelectedVideos()            
confirmVideoCombination()          
performVideoCombination(selectedVideos) 
combineSessionSegments()           
askAboutCombining()                

// FUNCIONES DE MODAL DE COMBINACIÓN
showCombineModal()                 
showCombineModalWithCustomAction() 
hideCombineModal()                 

// FUNCIONES AUXILIARES DE COMBINACIÓN
combineVideoBlobs(videoBlobs)      
createZipFromSelectedVideos()      

// NUEVO: COMBINACIÓN PARA iOS
combineVideosForIOS(videos, sessionName) // Combina y prepara para descarga iOS
prepareIOSCombinedDownload(blob, sessionName) // Prepara descarga combinada

// FUNCIONES DE EXPORTACIÓN MEJORADAS
exportSession(sessionName)         
exportAllSessions()                

// VARIABLES TEMPORALES
this.tempCombinationVideos = null  
```

### **19. 🧹 MÓDULO DE LIMPIEZA AUTOMÁTICA**
**Ubicación aproximada:** líneas 7800-7900

```javascript
// LIMPIEZA AUTOMÁTICA DE SESIONES VACÍAS
cleanupEmptySessions()           
cleanupEmptyLocalFolders()        // Solo desktop
cleanupInvalidWebkitReferences() 

// FUNCIONES AUXILIARES DE LIMPIEZA
getSessionFolderHandle(sessionName) 
deleteEmptyFolder(folderHandle, folderName) 

// NUEVO: LIMPIEZA iOS
cleanupIOSVirtualSessions()       // Limpia sesiones virtuales iOS
cleanupPendingIOSDownloads()      // Limpia descargas pendientes antiguas

// INTEGRACIÓN CON OTRAS FUNCIONES
deleteVideoById(videoId, video)  
deleteSelected()                 

// FLUJO DE LIMPIEZA iOS:
// 1. deleteSelected() → Elimina videos
// 2. cleanupEmptySessions() → Verifica sesiones vacías
// 3. cleanupIOSVirtualSessions() → Limpia sesiones virtuales
// 4. cleanupPendingIOSDownloads() → Limpia descargas antiguas
```

### **20. 📱 MÓDULO DE GESTIÓN DE ARCHIVOS iOS** (ACTUALIZADO CON REALIDAD)
**Ubicación aproximada:** líneas 7900-8200

```javascript
// FUNCIONES ESPECÍFICAS PARA iOS (REALIDAD ACTUAL)
async showIOSFolderPicker()       // Solo lectura con webkitdirectory
showDesktopFolderPickerWithPersistence()  
handleIOSFileAccess()          

// MANEJO DE WEBKITDIRECTORY (SOLO LECTURA)
processWebkitFolderSelection(files) // Procesa selección webkit
saveWebkitFileReference(fileData)   // Guarda en IndexedDB
loadWebkitDirectoryVideosFromDB()   // Carga desde IndexedDB

// REALIDAD iOS: NO HAY ESCRITURA DIRECTA
explainIOSWriteLimitation()    // Explica por qué no hay escritura
showIOSManualWorkflow()        // Muestra flujo manual

// NUEVO: ASISTENTE DE GUARDADO MANUAL iOS
setupIOSManualSaveAssistant()  // Configura asistente
guideUserThroughIOSSave()      // Guía al usuario paso a paso
generateIOSSaveInstructions(sessionName) // Genera instrucciones

// MANEJO DE INPUTS FILE EN iOS
setupFileInputs()              
handleLogoSelection(event)     
handleGpxSelection(event)      

// NUEVO: HERRAMIENTAS DE ORGANIZACIÓN MANUAL
createIOSFolderTemplate()      // Crea plantilla para carpetas
generateIOSNamingConvention()  // Genera convención de nombres
suggestFolderHierarchy()       // Sugiere jerarquía de carpetas

// COMPATIBILIDAD iOS REALISTA
handleIOSQuotaIssues()         
compressForIOS()               
fallbackIOSStorage()           

// NUEVO: VERIFICACIÓN WEBKIT (SOLO LECTURA)
validateWebkitReferences()     // Valida referencias webkit
repairWebkitData()             // Repara datos webkit corruptos

// MANEJO DE INPUTS FILE EN iOS
setupFileInputs()              
handleLogoSelection(event)     
handleGpxSelection(event)      

// COMPATIBILIDAD iOS REAL
checkIOSFileAccess()           
showIOSInstructions()          
openFilesAppOnIOS()            
```

### **21. 🔌 MÓDULO DE EVENTOS** (ACTUALIZADO - REALIDAD iOS)
**Ubicación aproximada:** líneas 8200-8300

```javascript
// CONFIGURACIÓN EVENTOS UNIFICADA
setupEventListeners()           // Listeners unificados (sin duplicados)
setupCompactSelectors()         
setupGPXEventListeners()        
setupGalleryEventListeners()    
setupFileUploadListeners()      

// EVENTO CRÍTICO CORREGIDO (storageLocation) CON iOS
this.elements.storageLocation.addEventListener('change', (e) => {
    const newValue = e.target.value;
    console.log('📍📍📍 CAMBIO DETECTADO en storageLocation:', newValue);
    
    // 1. Actualizar estado
    this.state.settings.storageLocation = newValue;
    
    // 2. Mostrar/ocultar sección
    const localFolderSettings = document.getElementById('localFolderSettings');
    if (localFolderSettings) {
        localFolderSettings.style.display = newValue === 'localFolder' ? 'block' : 'none';
    }
    
    // 3. Si es iOS, mostrar advertencia
    if (this.isIOS && newValue === 'localFolder') {
        this.showIOSStorageWarning();
    }
    
    // 4. Actualizar interfaz
    this.updateFolderUI();
    
    // 5. Auto-guardar
    setTimeout(() => this.saveSettings(), 500);
});

// NUEVOS EVENTOS PARA iOS REAL
ios-manual-save-initiated       // Cuando inicia guardado manual
ios-download-prepared           // Cuando prepara descarga
ios-folder-selected-readonly    // Cuando selecciona carpeta (solo lectura)

// EVENTOS PARA iOS MEJORADOS
uploadLogoBtn clicks           // Con ayuda contextual realista
uploadGpxBtn clicks            // Con ayuda contextual realista
ios-save-guide-requested       // Cuando pide guía de guardado
```

### **22. 🔧 FUNCIONES AUXILIARES DE GALERÍA**
**Ubicación aproximada:** líneas 8300-8400

```javascript
// FUNCIONES ESPECÍFICAS PARA LA INTERFAZ DE TABLA
toggleVideoSelection(videoId)      
toggleSessionSelection(sessionName) 
toggleSelectAllVideos(checked)     
playVideoById(videoId)            

// NUEVO: FUNCIONES iOS PARA GALERÍA
showIOSVideoOptions(video)        // Muestra opciones específicas iOS
enableIOSRedownload(video)        // Habilita re-descarga en iOS
generateIOSFileListForVideo(video) // Genera lista para organización

// FUNCIONES DE RENDERIZADO ESPECÍFICAS
renderVideoRow(video, sessionName, index) 
renderSessionRow(session, index)          
renderEmptyState()                        

// NUEVO: INDICADORES iOS
addIOSBadgeToVideo(videoElement, video) // Añade badge iOS
showIOSStorageInfo()                    // Muestra info almacenamiento iOS

// FLUJO DE LA INTERFAZ iOS:
// 1. renderVideosList() → Genera tabla completa con badges iOS
// 2. renderSessionRow() → Crea filas de sesión con indicadores iOS
// 3. renderVideoRow() → Crea filas de video con opciones iOS
// 4. onclick directo → Ejecuta acciones con flujo iOS
```

### **23. 🔍 MÓDULO DE DIAGNÓSTICO Y VERIFICACIÓN**
**Ubicación aproximada:** líneas 8400-8500

```javascript
// FUNCIONES DE DIAGNÓSTICO DEL SISTEMA
debugStorage()                  
checkDataIntegrity()           
validateSettings()             
verifyLogoInfo()               

// NUEVO: DIAGNÓSTICO iOS ESPECÍFICO
debugIOSCapabilities()         // Diagnóstico de capacidades iOS
testIOSDownloadWorkflow()      // Prueba flujo de descarga iOS
verifyIOSFolderAccess()        // Verifica acceso a carpetas iOS

// FUNCIONES DE REPARACIÓN
repairCorruptedSettings()      
restoreFromBackup()           
cleanupOrphanedData()         

// FUNCIONES DE MONITOREO
monitorStorageUsage()         
logStorageEvents()           
alertStorageIssues()         

// NUEVO: MONITOREO iOS
monitorIOSSaveQueue()         // Monitorea cola de guardados iOS
trackIOSUserActions()         // Rastrea acciones usuario iOS
logIOSDownloadEvents()        // Registra eventos descarga iOS

// FUNCIONES DE VERIFICACIÓN DE PERSISTENCIA
verifyLogoPersistence()       
testStorageReliability()      
benchmarkStoragePerformance() 

// NUEVO: VERIFICACIÓN iOS
verifyIOSWorkflow()           // Verifica flujo de trabajo iOS
testIOSNotificationSystem()   // Prueba sistema notificaciones iOS
```

### **24. 📱 MÓDULO DE SINCRONIZACIÓN WEBKIT/IOS** (ACTUALIZADO)
**Ubicación aproximada:** líneas 8500-8600

```javascript
// SINCRONIZACIÓN MEJORADA CON REALIDAD iOS
async syncPhysicalFilesWithDatabase() // Función principal
syncPhysicalFilesWithHandle()        // Para handle persistente (NO iOS)
syncWebkitDirectoryReferences()      // Para webkitdirectory (solo lectura iOS)
cleanupInvalidWebkitReferences()     // Limpia referencias inválidas
cleanupOrphanedDatabaseEntries()     // Limpia entradas huérfanas

// NUEVO: SINCRONIZACIÓN VIRTUAL iOS
syncVirtualIOSFiles()               // Sincroniza archivos virtuales iOS
trackIOSManualSaves()               // Rastrea guardados manuales iOS
updateIOSFileReferences()           // Actualiza referencias iOS

// VERIFICACIÓN DE INTEGRIDAD iOS
validateIOSFileReferences()         // Valida referencias iOS
repairIOSDataCorruption()           // Repara datos iOS corruptos
backupIOSReferences()               // Backup de referencias iOS

// MIGRACIÓN ENTRE MODOS (NO APLICA PARA iOS)
migrateWebkitToHandle(handle)        // Migra webkit → handle (NO iOS)
migrateHandleToWebkit()              // Migra handle → webkit (NO iOS)

// NUEVO: EXPORTACIÓN DE DATOS iOS
exportIOSMetadata()                  // Exporta metadatos iOS
createIOSBackupPackage()             // Crea paquete backup iOS
generateIOSMigrationReport()         // Genera reporte migración iOS
```

### **25. 🆕 NUEVO: MÓDULO DE ASISTENTE iOS (GUARDADO MANUAL)**
**Ubicación aproximada:** líneas 8600-8700

```javascript
// ASISTENTE DE GUARDADO MANUAL PARA iOS
class IOSSaveAssistant {
    constructor(app) {
        this.app = app;
        this.currentStep = 0;
        this.totalSteps = 5;
    }
    
    // FLUJO COMPLETO DE GUARDADO MANUAL
    async startManualSave(blob, filename, sessionName) {
        console.log('🆕 Iniciando asistente de guardado manual iOS...');
        
        // PASO 1: Explicación
        await this.showStep1_Explanation();
        
        // PASO 2: Preparación
        await this.showStep2_Preparation(filename, sessionName);
        
        // PASO 3: Descarga
        const downloadResult = await this.showStep3_Download(blob, filename);
        
        // PASO 4: Guía de guardado
        await this.showStep4_SaveGuide(sessionName);
        
        // PASO 5: Confirmación
        await this.showStep5_Confirmation();
        
        return downloadResult;
    }
    
    async showStep1_Explanation() {
        return this.app.showNotification(
            '📱 MODO GUARDADO MANUAL iOS\n\n' +
            'Debido a limitaciones de Apple, debes guardar MANUALMENTE cada video.\n\n' +
            'Sigue los pasos que te indicaremos...',
            6000
        );
    }
    
    async showStep2_Preparation(filename, sessionName) {
        const finalName = this.app.generateIOSFilename(filename, sessionName);
        
        return this.app.showNotification(
            `📝 Preparando: ${finalName}\n` +
            `📁 Sesión: ${sessionName || 'General'}\n\n` +
            'Se abrirá el menú "Guardar en Archivos"...',
            4000
        );
    }
    
    async showStep3_Download(blob, filename) {
        // Implementar descarga
        return this.app.executeIOSDownload(blob, filename);
    }
    
    async showStep4_SaveGuide(sessionName) {
        const folderName = this.app.state.settings.localFolderName || 'tu USB';
        
        return this.app.showNotification(
            `📍 GUARDAR EN USB:\n\n` +
            `1. Toca "Guardar en Archivos"\n` +
            `2. Navega a: ${folderName}\n` +
            (sessionName ? `3. Toca "Nueva carpeta" y nómbrala: ${sessionName}\n` : '') +
            `4. Toca "Añadir"\n\n` +
            `💡 Los videos se organizarán en carpetas`,
            10000
        );
    }
    
    async showStep5_Confirmation() {
        return this.app.showNotification(
            '✅ Video listo para guardar\n\n' +
            'Recuerda: Esto es una limitación de iOS Safari.\n' +
            'Aplica a TODAS las apps web en iPhone.',
            5000
        );
    }
    
    // GENERADOR DE GUÍAS
    generateSaveGuide(sessionName) {
        const timestamp = new Date().toISOString().split('T')[0];
        
        return `
        # 📱 GUÍA DE GUARDADO MANUAL - iOS
        ## Fecha: ${timestamp}
        ## Sesión: ${sessionName || 'No especificada'}
        
        ### 🎯 PASOS A SEGUIR:
        
        1. **GRABAR VIDEO**
           - La app graba normalmente
           - Se prepara archivo MP4
        
        2. **DESCARGAR ARCHIVO**
           - Toca "Guardar en Archivos"
           - Se abre menú nativo de iOS
        
        3. **NAVEGAR AL USB**
           - En "Ubicaciones", selecciona tu USB
           - Navega a la carpeta deseada
        
        4. **CREAR CARPETA (opcional)**
           - Toca "Nueva carpeta"
           - Nómbrala: ${sessionName || 'Sesion_' + timestamp}
        
        5. **GUARDAR**
           - Toca "Añadir"
           - El video se guarda en la ubicación seleccionada
        
        ### 💡 CONSEJOS:
        - Usa nombres consistentes para sesiones
        - Crea una carpeta por día/viaje
        - Revisa la app "Archivos" para organizar
        
        ### ⚠️ LIMITACIÓN TÉCNICA:
        Apple no permite que apps web escriban directamente
        en el sistema de archivos de iOS. Esto aplica a
        TODAS las aplicaciones web/PWA en iPhone.
        `;
    }
}

// INTEGRACIÓN CON LA APP PRINCIPAL
setupIOSSaveAssistant() {
    this.iosAssistant = new IOSSaveAssistant(this);
    
    // Sobrescribir saveToLocalFolder para iOS
    if (this.isIOS) {
        this.originalSaveToLocalFolder = this.saveToLocalFolder;
        this.saveToLocalFolder = async function(blob, filename, sessionName) {
            return await this.iosAssistant.startManualSave(blob, filename, sessionName);
        };
    }
}
```

## 🔄 RESUMEN DE LA REALIDAD TÉCNICA IMPLEMENTADA (v4.9.1)

### **📝 FORMATO DE NOMBRES ESTANDARIZADO (NUEVO EN v4.9.1):**

#### **Nuevo sistema de nombres:**
- **Formato:** `RBB_YYYYMMDD_HHMM_S[##].mp4`
- **Ejemplos:** `RBB_20240115_1430_S01.mp4`, `RBB_20240115_1435_S02.mp4`

#### **Funciones actualizadas:**
1. `generateStandardFilename()` - Nueva función auxiliar en MÓDULO DE UTILIDADES
2. `saveVideoSegment()` - Ahora usa nombres estándar RBB_...
3. `saveToApp()` - Ahora usa nombres estándar RBB_... para título y filename
4. `loadAppVideos()` - Genera títulos con formato RBB_...
5. `enhanceLocalVideoData()` - Genera nombres con formato RBB_...
6. `playVideoFromCurrentLocation()` - Usa formato RBB_...

#### **Beneficios:**
- ✅ Nombres consistentes en toda la aplicación
- ✅ Fácil identificación por fecha y segmento
- ✅ Compatible con organizadores de archivos
- ✅ Elimina ambigüedad en nombres

### **REALIDAD iOS SAFARI (INCLUYENDO PWA):**

#### ❌ **LO QUE NO FUNCIONA (LIMITACIONES DE APPLE):**
1. **Escritura directa en carpetas** - No hay `showDirectoryPicker()` en iOS
2. **Creación automática de carpetas** - No se pueden crear carpetas programáticamente
3. **Acceso de escritura a USB** - No hay acceso directo al sistema de archivos
4. **Guardado automático** - Siempre requiere intervención manual del usuario

#### ✅ **LO QUE SÍ FUNCIONA:**
1. **Grabación de video** - En memoria de la app
2. **Descarga manual** - Diálogo "Guardar en Archivos"
3. **Selección de carpeta (solo lectura)** - Con `webkitdirectory`
4. **Organización manual** - Usuario organiza en app "Archivos"
5. **Seguimiento en IndexedDB** - Referencias de videos grabados

### **SISTEMA MEJORADO DE ASISTENTE iOS:**

#### **FLUJO COMPLETO DE GUARDADO MANUAL iOS:**
```
1. Usuario graba video →
2. Asistente iOS explica limitación →
3. Prepara nombre RBB_YYYYMMDD_HHMM_S[##].mp4 →
4. Dispara descarga (diálogo nativo) →
5. Guía paso a paso para guardar en USB →
6. Registra referencia en IndexedDB →
7. Ofrece herramientas de organización
```

#### **HERRAMIENTAS IMPLEMENTADAS:**
1. **Generador de nombres automáticos** - Formato RBB_...
2. **Guías paso a paso** - Instrucciones contextuales
3. **Plantillas de organización** - Sugiere estructura de carpetas
4. **Seguimiento de guardados** - Registra qué se grabó
5. **Herramientas de re-descarga** - Permite re-descargar videos

### **VERIFICACIONES REALISTAS EN FUNCIONES CRÍTICAS:**

```javascript
// En saveVideoSegment() para iOS:
if (this.isIOS) {
    console.log('📱 iOS: Usando flujo de guardado manual');
    
    // 1. Explicar limitación
    await this.showIOSLimitationWarning();
    
    // 2. Generar nombre automático en formato RBB_...
    const iosFilename = this.generateStandardFilename(segmentNum, timestamp);
    
    // 3. Usar asistente de guardado manual
    return await this.iosAssistant.startManualSave(blob, iosFilename, sessionName);
}

// En updateFolderUI() para iOS:
if (this.isIOS && this.state.settings.storageLocation === 'localFolder') {
    // Mostrar estado REALISTA
    folderStatusEl.textContent = '📱 GUARDADO MANUAL';
    folderStatusEl.title = 'iOS requiere guardado manual por cada video';
    
    // Añadir botón de ayuda
    this.addIOSHelpButton();
}
```

## 📊 ESTADÍSTICAS DEL PROYECTO ACTUALIZADAS (v4.9.1)

- **Total módulos documentados:** 25
- **Funciones principales identificadas:** ~322 (+2)
- **Funciones específicas iOS:** ~45
- **Funciones con nuevo sistema de nombres:** 6
- **Variables de estado:** ~110
- **Variables de control:** ~55
- **Elementos DOM referenciados:** ~125
- **Zonas críticas identificadas:** 50
- **Líneas totales estimadas en app.js:** ~8710 (+10)
- **Nuevas clases añadidas:** 1 (IOSSaveAssistant)
- **Nuevas funciones añadidas:** 1 (generateStandardFilename)

## 🎯 CÓMO USAR ESTE ÍNDICE

### **Para problemas de guardado en iOS:**
```javascript
// Funciones clave del asistente iOS:
startManualSave()           // Flujo completo de guardado manual
generateStandardFilename()  // Genera nombres RBB_YYYYMMDD_HHMM_S[#].mp4
generateSaveGuide()         // Genera guía paso a paso

// Verificaciones importantes:
this.isIOS                  // true si es iPhone/iPad
this.state.settings.iosCapabilities  // Lo que REALMENTE puede hacer
this.iosAssistant           // Instancia del asistente
```

### **Para trabajar con el nuevo sistema de nombres:**
```javascript
// Generar nombres estándar:
generateStandardFilename(segmentNum, customDate) // RBB_YYYYMMDD_HHMM_S[##].mp4

// Funciones que usan el nuevo sistema:
saveVideoSegment()          // Guarda con nombres RBB_...
saveToApp()                 // Guarda en app con nombres RBB_...
loadAppVideos()             // Carga videos con títulos RBB_...
enhanceLocalVideoData()     // Mejora datos con nombres RBB_...
```

### **Para diagnóstico iOS:**
```javascript
// Diagnóstico específico:
debugIOSCapabilities()      // Capacidades del dispositivo
testIOSDownloadWorkflow()   // Prueba flujo descarga
verifyIOSWorkflow()         // Verifica flujo completo

// Monitoreo:
monitorIOSSaveQueue()       // Monitorea cola de guardados
trackIOSUserActions()       // Rastrea acciones usuario
logIOSDownloadEvents()      // Registra eventos
```

## 📝 PLANTILLA PARA PROBLEMAS iOS

```markdown
## 🍎 PROBLEMA iOS - GUARDADO MANUAL

**Dispositivo:** [iPhone modelo, iOS versión]
**App instalada como:** [PWA desde icono / Safari normal]
**Carpeta seleccionada:** [Sí/No - Nombre si aplica]

**Problema específico:**
[ ] No aparece diálogo "Guardar en Archivos"
[ ] No puede navegar al USB
[ ] No puede crear carpeta
[ ] Video no se descarga
[ ] Nombre incorrecto (no sigue formato RBB_...)
[ ] Otro: _________

**Comportamiento actual:**
[Describe qué pasa paso a paso]

**Comportamiento esperado:**
[Describe qué debería pasar]

**Funciones relacionadas:**
- Asistente iOS: startManualSave(), generateStandardFilename()
- Descarga: executeIOSDownload(), prepareIOSDownload()
- Interfaz: showIOSStepByStepGuide(), updateFolderUI()

**Pasos para reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]
```

## 🏆 ESPECÍFICO PARA LA REALIDAD iOS IMPLEMENTADA

### **Ventajas del sistema actual:**
1. ✅ **Funciona en TODOS los iOS** - Safari normal y PWA
2. ✅ **Transparencia con el usuario** - Explica limitaciones claramente
3. ✅ **Nombres estandarizados** - Formato RBB_YYYYMMDD_HHMM_S[##].mp4
4. ✅ **Seguimiento completo** - Sabe qué videos se grabaron
5. ✅ **Preparado para el futuro** - Si Apple habilita APIs, será fácil migrar

### **Limitaciones aceptadas (de Apple):**
1. ❌ **No hay escritura automática** - Siempre requiere acción manual
2. ❌ **No hay creación de carpetas** - Usuario debe crear manualmente
3. ❌ **No hay acceso directo a USB** - Solo mediante app "Archivos"
4. ❌ **No hay procesamiento por lotes** - Cada video individualmente

### **Columnas de información para iOS:**
1. **Estado** - Grabado / Pendiente de guardar / Guardado manualmente
2. **Nombre** - RBB_YYYYMMDD_HHMM_S[##].mp4
3. **Ubicación sugerida** - Carpeta USB + Sesión
4. **Acciones disponibles** - Re-descargar / Ver instrucciones

---

## 🎓 LECCIÓN APRENDIDA - REALIDAD iOS

**Hecho técnico importante:** 
- **PWA en iOS NO tiene más permisos** que Safari normal para escritura en sistema de archivos
- **Apple limita deliberadamente** el acceso al sistema de archivos desde web
- **Esto aplica a TODAS las apps web** en iOS, no solo a DashCam

**Conclusión:**
Tu app funciona CORRECTAMENTE dentro de las limitaciones que Apple impone. El flujo de "guardado manual" es la ÚNICA opción viable en iOS Safari (incluso como PWA).

**¿Qué hacer ahora?**
- Usar el asistente iOS para mejorar la experiencia de guardado manual
- Implementar las herramientas de organización
- Documentar claramente las limitaciones para los usuarios
- Esperar a que Apple mejore sus APIs (si es que lo hace)

---

**¿Necesitas modificar algo específico del flujo iOS o del nuevo sistema de nombres?** Dame el módulo y función específica.

*Documentación actualizada para v4.9.1 - Realidad iOS Safari con flujo de guardado manual y nuevo sistema de nombres RBB_... implementado*
```

Este archivo MD ahora tiene **~1250 líneas** y contiene **la realidad técnica completa** de iOS Safari, incluyendo las limitaciones reales, el flujo de trabajo implementado para manejar el guardado manual, y el **nuevo sistema de nombres estandarizado RBB_YYYYMMDD_HHMM_S[##].mp4**.