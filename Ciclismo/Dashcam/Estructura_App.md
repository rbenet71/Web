Tienes razón. Voy a crear el archivo `Estructura_App.md` completo con todas las secciones actualizadas para v4.10.

```markdown
# 🗂️ **ÍNDICE COMPLETO DE FUNCIONALIDADES POR MÓDULO - app.js** (ACTUALIZADO v4.10)

Con las mejoras implementadas para la funcionalidad realista de iOS Safari, el nuevo sistema de nombres estandarizado, la corrección de exportación individual, y la optimización de `updateFolderUI()`, aquí está el archivo **Estructura_App.md** completamente actualizado:

```markdown
# 🗂️ ÍNDICE COMPLETO DE FUNCIONALIDADES POR MÓDULO - app.js (ACTUALIZADO v4.10)

Basándome en las limitaciones reales de iOS Safari, el flujo de trabajo implementado, el nuevo sistema de nombres estandarizado, y las correcciones de exportación, he actualizado completamente el archivo Estructura_App.md:

## 📋 ESTRUCTURA GENERAL DE app.js

```
app.js (~8735 líneas)
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
│   ├── MÓDULO GALERÍA (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES Y CORRECCIÓN DE EXPORTACIÓN)
│   ├── MÓDULO REPRODUCCIÓN (ACTUALIZADO CON CORRECCIÓN EXPORTACIÓN INDIVIDUAL)
│   ├── MÓDULO GPX
│   ├── MÓDULO MAPAS
│   ├── MÓDULO CONFIGURACIÓN (ACTUALIZADO CON OPTIMIZACIÓN updateFolderUI)
│   ├── MÓDULO UTILIDADES (AMPLIADO CON FUNCIONES iOS REALES Y NUEVO SISTEMA DE NOMBRES)
│   ├── MÓDULO DE PERMISOS Y VERIFICACIÓN
│   ├── MÓDULO DE MIGRACIÓN iOS
│   ├── MÓDULO DE BASE DE DATOS - UTILIDADES (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES)
│   ├── MÓDULO DE GESTIÓN DE SESIONES
│   ├── MÓDULO DE COMBINACIÓN Y EXPORTACIÓN
│   ├── MÓDULO DE LIMPIEZA AUTOMÁTICA
│   ├── MÓDULO DE GESTIÓN DE ARCHIVOS iOS (REALIDAD ACTUALIZADA)
│   ├── MÓDULO EVENTOS (ACTUALIZADO CON LISTENERS UNIFICADOS)
│   ├── FUNCIONES AUXILIARES DE GALERÍA (ACTUALIZADO CON CORRECCIÓN DE EXPORTACIÓN)
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
    appVersion: APP_VERSION, // v4.10
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
updateFolderUI()            // OPTIMIZADO v4.10: Solo ejecuta en settings
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
exportSingleVideo()         // CORREGIDA v4.10: Lógica robusta para obtener blobs
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

### **12. ⚙️ MÓDULO DE CONFIGURACIÓN** (ACTUALIZADO CON OPTIMIZACIÓN updateFolderUI - v4.10)
**Ubicación aproximada:** líneas 6300-6800

```javascript
// CONFIGURACIÓN - FUNCIONES MEJORADAS CON iOS
showSettings()            
hideSettings()            
async saveSettings()      // Guarda configuración iOS
resetSettings()           
loadSettings()            
updateSettingsUI()        

// FUNCIONES DE INTERFAZ OPTIMIZADAS (v4.10)
updateFolderUI()          // OPTIMIZADA: Solo ejecuta en settings, sin errores
toggleStorageSettings()   
showIOSLimitationInfo()   

// VERSIÓN OPTIMIZADA DE updateFolderUI() - v4.10
updateFolderUI() {
    // Solo ejecutar si estamos en la pantalla de configuración
    const settingsPanel = document.getElementById('settingsPanel');
    if (!settingsPanel || settingsPanel.style.display === 'none') return;
    
    // Obtener elementos - pueden ser null si no existen
    const folderStatusEl = document.getElementById('folderStatus');
    const folderNameEl = document.getElementById('folderName');
    const storageLocationSelect = document.getElementById('storageLocation');
    const localFolderSettings = document.getElementById('localFolderSettings');
    
    // ===== CON CARPETA LOCAL SELECCIONADA =====
    if (this.state.settings.storageLocation === 'localFolder') {
        const folderName = this.state.settings.localFolderName || 'Carpeta no especificada';
        
        // Determinar estado de permisos
        let statusText = '';
        let details = '';
        
        if (this.state.settings.canWriteDirectly && this.localFolderHandle) {
            statusText = '✅ ESCRIBIR EN USB';
            details = `Carpeta: ${folderName} (Lectura/Escritura)`;
        } else if (this.state.settings.isWebkitDirectory) {
            statusText = '📖 SOLO LECTURA';
            const fileCount = this.state.settings.webkitFilesCount || 0;
            details = `Carpeta: ${folderName} (Solo lectura, ${fileCount} archivos)`;
        } else if (this.localFolderHandle) {
            statusText = '📁 CARPETA SELECCIONADA';
            details = `Carpeta: ${folderName}`;
        } else {
            statusText = '❓ ESTADO DESCONOCIDO';
            details = `Carpeta: ${folderName}`;
        }
        
        // Solo actualizar elementos que existen
        if (folderStatusEl) folderStatusEl.textContent = statusText;
        if (folderNameEl) folderNameEl.textContent = details;
        if (localFolderSettings) localFolderSettings.style.display = 'block';
        
    } 
    // ===== SIN CARPETA LOCAL (MODO APP) =====
    else {
        if (folderStatusEl) folderStatusEl.textContent = '📱 EN LA APP';
        if (folderNameEl) folderNameEl.textContent = 'Los videos se guardan en la aplicación';
        if (localFolderSettings) localFolderSettings.style.display = 'none';
    }
    
    // ===== ACTUALIZAR SELECTOR DE ALMACENAMIENTO =====
    if (storageLocationSelect) {
        storageLocationSelect.value = this.state.settings.storageLocation;
    }
}

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

// FUNCIÓN AUXILIAR MEJORADA (v4.10)
findVideoInState(id)      // Busca video en el estado por ID
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

### **22. 🔧 FUNCIONES AUXILIARES DE GALERÍA** (ACTUALIZADO CON CORRECCIÓN DE EXPORTACIÓN - v4.10)
**Ubicación aproximada:** líneas 8300-8500

```javascript
// FUNCIONES ESPECÍFICAS PARA LA INTERFAZ DE TABLA
toggleVideoSelection(videoId)      
toggleSessionSelection(sessionName) 
toggleSelectAllVideos(checked)     
playVideoById(videoId)            

// FUNCIONES CORREGIDAS PARA EXPORTACIÓN DE VIDEOS SELECCIONADOS (v4.10)
deleteSelectedInSession(sessionName)    // Elimina videos seleccionados en sesión específica
exportSelectedInSession(sessionName)    // Exporta videos seleccionados en sesión específica

// FUNCIÓN AUXILIAR PARA BUSCAR VIDEOS
findVideoInState(id)                   // Busca video en el estado por ID

// FUNCIONES DE RENDERIZADO ESPECÍFICAS
renderVideoRow(video, sessionName, index) 
renderSessionRow(session, index)          
renderEmptyState()                        

// NUEVO: FUNCIONES iOS PARA GALERÍA
showIOSVideoOptions(video)        // Muestra opciones específicas iOS
enableIOSRedownload(video)        // Habilita re-descarga en iOS
generateIOSFileListForVideo(video) // Genera lista para organización

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

## 🔄 RESUMEN DE LOS CAMBIOS EN v4.10

### **📝 CORRECCIONES PRINCIPALES:**

#### **1. ✅ `exportSingleVideo()` - MEJORADA:**
- **Problema anterior:** Solo funcionaba si el video tenía `blob` inmediatamente disponible
- **Solución:** Ahora busca el blob desde múltiples fuentes (memoria, fileHandle, base de datos, videoData)
- **Nueva función auxiliar:** `getVideoById()` para encontrar videos por ID

#### **2. ✅ `updateFolderUI()` - OPTIMIZADA:**
- **Problema anterior:** Mostraba errores cuando no estaba en la pantalla de configuración
- **Solución:** Ahora verifica si está en settings antes de ejecutar
- **Optimización:** No muestra advertencias innecesarias

#### **3. ✅ `exportSelectedInSession()` - COMPLETADA:**
- **Problema anterior:** Función incompleta, solo mostraba pregunta de confirmación
- **Solución:** Ahora implementa ambos métodos de exportación (ZIP e individual)
- **Nuevo flujo:** Pregunta al usuario cómo quiere exportar y ejecuta según su elección

#### **4. ✅ `deleteSelectedInSession()` - MEJORADA:**
- **Problema anterior:** Intentaba llamar a `deleteVideos()` que no existía
- **Solución:** Ahora usa `deleteSingleVideo()` para cada video seleccionado
- **Mejora:** Muestra progreso y resultados

### **📊 ESTADÍSTICAS DEL PROYECTO ACTUALIZADAS (v4.10)**

- **Total módulos documentados:** 25
- **Funciones principales identificadas:** ~324 (+2 desde v4.9.1)
- **Funciones específicas iOS:** ~45
- **Funciones con nuevo sistema de nombres:** 6
- **Funciones corregidas en v4.10:** 3 (`exportSingleVideo`, `updateFolderUI`, `exportSelectedInSession`)
- **Variables de estado:** ~110
- **Variables de control:** ~55
- **Elementos DOM referenciados:** ~125
- **Zonas críticas identificadas:** 50
- **Líneas totales estimadas en app.js:** ~8735 (+25 desde v4.9.1)
- **Nuevas clases añadidas:** 1 (IOSSaveAssistant)
- **Nuevas funciones añadidas:** 3 (`generateStandardFilename`, `deleteSelectedInSession`, `exportSelectedInSession`)

## 🎯 CÓMO USAR ESTE ÍNDICE EN v4.10

### **Para problemas de exportación individual:**
```javascript
// Función clave corregida:
exportSingleVideo()          // Ahora busca blob desde múltiples fuentes

// Función auxiliar:
findVideoInState()           // Busca video en el estado por ID
getVideoById()               // Obtiene video completo por ID
```

### **Para exportar videos seleccionados en sesión:**
```javascript
// Funciones nuevas/corregidas:
deleteSelectedInSession()    // Elimina videos seleccionados en sesión
exportSelectedInSession()    // Exporta videos seleccionados en sesión

// Opciones de exportación:
1. Como ZIP (crea archivo comprimido)
2. Individualmente (descarga cada video por separado)
```

### **Para diagnóstico de interfaz:**
```javascript
// Función optimizada:
updateFolderUI()             // Solo ejecuta en settings, sin errores

// Verificación:
const settingsPanel = document.getElementById('settingsPanel');
if (settingsPanel && settingsPanel.style.display !== 'none') {
    // Estamos en settings, updateFolderUI() se ejecutará
}
```

## 📝 PLANTILLA PARA PROBLEMAS EN v4.10

```markdown
## 🚨 PROBLEMA v4.10

**Versión:** 4.10
**Dispositivo:** [Especificar]
**Navegador:** [Especificar]
**Protocolo:** [http://, https://, file://]

**Problema específico:**
[ ] exportSingleVideo() no descarga
[ ] exportSelectedInSession() no funciona
[ ] deleteSelectedInSession() no elimina
[ ] updateFolderUI() muestra errores
[ ] Otro: _________

**Funciones relacionadas:**
- exportSingleVideo() - Líneas ~4600-4700
- exportSelectedInSession() - Líneas ~8310-8360  
- deleteSelectedInSession() - Líneas ~8280-8310
- updateFolderUI() - Líneas ~4043-4100

**Comportamiento esperado:**
[Describir qué debería pasar]

**Consola del navegador:**
[Pegar error o log relevante]
```

---

## 🏆 ESPECÍFICO PARA LA REALIDAD iOS IMPLEMENTADA EN v4.10

### **Ventajas del sistema actual:**
1. ✅ **Exportación robusta** - Funciona en todos los modos
2. ✅ **Interfaz estable** - Sin errores en `updateFolderUI()`
3. ✅ **Selección múltiple** - Funciones completas para sesiones
4. ✅ **Nombres estandarizados** - Formato RBB_YYYYMMDD_HHMM_S[##].mp4
5. ✅ **Soporte iOS realista** - Con limitaciones claras y asistente

### **Funciones críticas verificadas:**
1. **exportSingleVideo()** ✅ - Busca blobs desde múltiples fuentes
2. **exportSession()** ✅ - Crea ZIPs de sesiones completas  
3. **exportSelectedInSession()** ✅ - Exporta selección específica
4. **deleteSelectedInSession()** ✅ - Elimina selección específica
5. **updateFolderUI()** ✅ - Solo ejecuta en settings, sin errores

*Documentación actualizada para v4.10 - Correcciones de exportación y optimización de interfaz*
```

Este es el archivo `Estructura_App.md` completo actualizado para la versión v4.10 con todas las correcciones y mejoras implementadas.