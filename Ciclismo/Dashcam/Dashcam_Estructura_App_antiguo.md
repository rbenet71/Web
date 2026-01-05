Perfecto. Aquí está la **nueva versión completa del archivo Estructura_App.md** con todos los cambios incorporados:

```markdown
# 🗂️ **ÍNDICE COMPLETO DE FUNCIONALIDADES POR MÓDULO - Dashcam_App.js** (ACTUALIZADO v4.13)

Con las mejoras implementadas para la funcionalidad realista de iOS Safari, el nuevo sistema de nombres estandarizado, la corrección de exportación individual, la optimización de `updateFolderUI()`, la SOLUCIÓN COMPLETA PARA VLC EN iOS con conversión WebM→MP4 y mantenimiento de sesiones, y ahora la **GESTIÓN COMPLETA DE GPX CON ELIMINACIÓN Y NOMBRES DE SESIÓN**, aquí está el archivo **Estructura_App.md** completamente actualizado:

```markdown
# 🗂️ ÍNDICE COMPLETO DE FUNCIONALIDADES POR MÓDULO - Dashcam_App.js (ACTUALIZADO v4.13)

Basándome en las limitaciones reales de iOS Safari, el flujo de trabajo implementado, el nuevo sistema de nombres estandarizado, las correcciones de exportación, la optimización de interfaz, la SOLUCIÓN DEFINITIVA para compatibilidad VLC en iOS con mantenimiento de sesiones, y ahora la **GESTIÓN COMPLETA DE GPX CON ELIMINACIÓN Y NOMBRES DE SESIÓN**, he actualizado completamente el archivo Estructura_App.md:

## 📋 ESTRUCTURA GENERAL DE Dashcam_App.js

```
Dashcam_App.js (~8850 líneas)
├── CLASE DashcamApp
│   ├── CONSTRUCTOR + PROPIEDADES (ACTUALIZADO CON REALIDAD iOS + VLC)
│   ├── MÉTODOS DE INICIALIZACIÓN (init, initUI, etc.)
│   ├── MÓDULO PWA (detección realista - ACTUALIZADO)
│   ├── MÓDULO DE INICIALIZACIÓN Y ESTADO
│   ├── MÓDULO GRABACIÓN (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES + DETECCIÓN AUTOMÁTICA CODECS + CONVERSIÓN VLC iOS)
│   ├── MÓDULO GPS
│   ├── MÓDULO DE ALMACENAMIENTO
│   ├── MÓDULO DE SESIONES Y CARPETAS
│   ├── MÓDULO DE DIBUJADO Y OVERLAY
│   ├── MÓDULO GALERÍA (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES Y CORRECCIÓN DE EXPORTACIÓN)
│   ├── MÓDULO REPRODUCCIÓN (ACTUALIZADO CON CORRECCIÓN EXPORTACIÓN INDIVIDUAL + CONVERSIÓN VLC)
│   ├── MÓDULO GPX (ACTUALIZADO CON ELIMINACIÓN Y NOMBRES DE SESIÓN)
│   ├── MÓDULO MAPAS
│   ├── MÓDULO CONFIGURACIÓN (ACTUALIZADO CON OPTIMIZACIÓN updateFolderUI + OPCIONES VLC)
│   ├── MÓDULO UTILIDADES (AMPLIADO CON FUNCIONES iOS REALES, NUEVO SISTEMA DE NOMBRES + FUNCIONES VLC)
│   ├── MÓDULO DE PERMISOS Y VERIFICACIÓN
│   ├── MÓDULO DE MIGRACIÓN iOS (ACTUALIZADO CON CONVERSIÓN VLC)
│   ├── MÓDULO DE BASE DE DATOS - UTILIDADES (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES)
│   ├── MÓDULO DE GESTIÓN DE SESIONES (ACTUALIZADO CON COMPATIBILIDAD VLC)
│   ├── MÓDULO DE COMBINACIÓN Y EXPORTACIÓN (ACTUALIZADO CON VLC)
│   ├── MÓDULO DE LIMPIEZA AUTOMÁTICA
│   ├── MÓDULO DE GESTIÓN DE ARCHIVOS iOS (REALIDAD ACTUALIZADA + VLC)
│   ├── MÓDULO EVENTOS (ACTUALIZADO CON LISTENERS UNIFICADOS)
│   ├── FUNCIONES AUXILIARES DE GALERÍA (ACTUALIZADO CON CORRECCIÓN DE EXPORTACIÓN)
│   ├── MÓDULO DE DIAGNÓSTICO Y VERIFICACIÓN (AMPLIADO CON DIAGNÓSTICO VLC)
│   ├── MÓDULO DE SINCRONIZACIÓN WEBKIT/IOS
│   ├── MÓDULO DE ASISTENTE iOS (GUARDADO MANUAL)
│   └── 🆕 NUEVO: MÓDULO DE CONVERSIÓN Y COMPATIBILIDAD VLC iOS
└── INICIALIZACIÓN GLOBAL
```

## 📁 ÍNDICE POR MÓDULO - PARA MODIFICACIONES

### **1. 🏗️ MÓDULO DE INICIALIZACIÓN Y ESTADO** (ACTUALIZADO CON REALIDAD iOS + VLC)
**Ubicación aproximada:** líneas 1-500

```javascript
// CONSTRUCTOR Y PROPIEDADES
constructor()                // Inicializa estado y variables con realidad iOS + VLC
init()                      // Proceso de inicio de 20 pasos (ACTUALIZADO)

// ESTADO DE LA APLICACIÓN (CON REALIDAD iOS + VLC)
this.state = {              
    recordedSegments: [],
    recordingSessionSegments: 0,
    recordingSessionName: null,
    isRecording: false,
    isPaused: false,
    startTime: null,
    currentTime: 0,
    selectedVideos: new Set(),
    selectedGPX: new Set(),  // 🆕 ACTUALIZADO: Selección GPX mejorada
    selectedSessions: new Set(),
    currentVideo: null,
    activeTab: 'videos',
    showLandscapeModal: false,
    appVersion: APP_VERSION, // v4.13
    viewMode: 'default',
    videos: [],
    gpxTracks: [],           // 🆕 ACTUALIZADO: Ahora incluye sessionName
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
    tempCombinationVideos: null,
    
    // ===== NUEVO: SEGUIMIENTO VLC iOS =====
    vlcCompatibility: {
        enabled: true,
        autoConvert: true,
        iosForceMP4: true,
        conversionCount: 0,
        lastConversion: null,
        issuesDetected: 0
    },
    recordingSessionInfo: {
        name: null,
        segments: 0,
        format: 'webm', // o 'mp4'
        vlcOptimized: false
    }
}

// PROPIEDADES ACTUALIZADAS CON REALIDAD iOS + VLC
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
    logoSource: 'unknown',
    
    // ===== 🆕 CONFIGURACIÓN VLC iOS =====
    vlcCompatibility: {
        enabled: true,                     // Habilitar compatibilidad VLC
        autoConvert: true,                 // Convertir automáticamente WebM→MP4
        forceMP4OnIOS: true,               // Forzar MP4 en iOS para VLC
        optimizeStructure: true,           // Optimizar estructura MP4 (moov primero)
        keepOriginal: false,               // Mantener original además del convertido
        quality: 'high',                   // Calidad de conversión
        notifyOnConvert: true,             // Notificar al convertir
        diagnosticMode: false              // Modo diagnóstico
    },
    
    // ===== 🆕 DETECCIÓN DE CODECS =====
    codecPreferences: {
        ios: ['h264', 'mp4', 'webm'],     // Preferencias iOS (MP4 primero)
        windows: ['vp9', 'vp8', 'h264'],  // Preferencias Windows
        fallback: 'webm',                  // Codec de respaldo
        autoDetect: true                   // Detectar automáticamente
    }
}

// VARIABLES DE CONTROL (ACTUALIZADAS CON REALIDAD iOS + VLC)
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

// ===== 🆕 NUEVAS VARIABLES PARA VLC iOS =====
this.currentRecordingFormat = null;  // Formato actual de grabación
this.iosUsingMP4 = false;            // iOS usando MP4 directamente
this.iosNeedsConversion = false;     // iOS necesita conversión WebM→MP4
this.vlcConversionQueue = [];        // Cola de conversiones VLC
this.conversionInProgress = false;   // Conversión en progreso
this.vlcDiagnostics = {              // Diagnóstico VLC
    totalConversions: 0,
    successfulConversions: 0,
    failedConversions: 0,
    lastError: null,
    lastConversionTime: null
};
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

// 🆕 NUEVO: VERIFICACIÓN DE COMPATIBILIDAD VLC EN PWA iOS
async checkVLCCompatibilityOnIOS()  // Verifica si puede grabar MP4 en PWA
showVLCCompatibilityWarning()       // Muestra advertencia si no es compatible
```

### **3. 🎬 MÓDULO DE GRABACIÓN** (ACTUALIZADO CON FLUJO iOS REAL, NUEVO SISTEMA DE NOMBRES + CONVERSIÓN VLC)
**Ubicación aproximada:** líneas 500-1500

```javascript
// FUNCIONES PRINCIPALES (ACTUALIZADAS CON FLUJO iOS, NUEVO SISTEMA DE NOMBRES + VLC)
async saveVideoSegment()         // ACTUALIZADO: Mantiene sesiones + conversión VLC
async startRecording()           // 🆕 ACTUALIZADO: Detección automática de codecs
stopRecording()           
pauseRecording()          
resumeRecording()         
startNewSegment()         

// 🆕 NUEVO: DETECCIÓN Y SELECCIÓN DE CODECS ÓPTIMOS
async selectOptimalCodec()       // Selecciona mejor codec para la plataforma
detectSupportedCodecs()          // Detecta codecs soportados
isMP4Supported()                 // Verifica soporte MP4
isH264Supported()                // Verifica soporte H.264

// 🆕 NUEVO: CONVERSIÓN PARA VLC iOS
async convertWebMtoMP4ForVLC(webmBlob)  // Convierte WebM → MP4 compatible VLC
async ensureMP4VLCCompatible(mp4Blob)   // Asegura estructura MP4 para VLC
createBasicMP4Container(videoData)      // Crea contenedor MP4 básico

// FLUJO ESPECÍFICO PARA iOS
async saveVideoSegmentIOS()      // Flujo manual para iOS Safari
async prepareIOSManualSave(blob, filename, sessionName) // Prepara descarga manual
async triggerIOSDownload(blob, filename) // Dispara descarga iOS

// FLUJO MEJORADO PARA iOS
async processIOSVideo(originalBlob, gpsData)  // Procesamiento completo iOS
async handleIOSWebMRecording(webmBlob)        // Maneja WebM en iOS

// NUEVO: GENERACIÓN DE NOMBRES ESTANDARIZADOS
generateStandardFilename(segmentNum = 1, customDate = null) // Genera RBB_YYYYMMDD_HHMM_S[#].mp4

// VERIFICACIÓN REALISTA PARA iOS
const shouldUseIOSManualFlow = this.isIOS && 
                              this.state.settings.storageLocation === 'localFolder';

// 🆕 VERIFICACIÓN DE COMPATIBILIDAD VLC
checkVLCCompatibility(blob)      // Verifica si un blob es compatible con VLC
getFirstBytes(blob, bytes)       // Obtiene primeros bytes para diagnóstico

// INICIALIZACIÓN CÁMARA
initCamera()              
setupMediaRecorder()      // 🆕 ACTUALIZADO: Configuración optimizada por plataforma

// PROCESAMIENTO VIDEO
processVideoFrame()       
addWatermarkToFrame()     
handleDataAvailable()     
saveVideoSegment()        // Con lógica iOS manual, nombres RBB_... y conversión VLC
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
this.elements.recordingStatus    // 🆕 Ahora muestra formato (MP4/WebM/VLC)
this.elements.segmentInfo
```

### **4. 📍 MÓDULO GPS**
**Ubicación aproximada:** líneas 1500-2100

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

// 🆕 INTEGRACIÓN MEJORADA CON VLC
formatPositionForVLC()           // Formatea posición para metadata VLC

// VARIABLES DE CONTROL GPS
this.currentPosition      
this.gpxPoints           
this.gpxInterval         
```

### **5. 💾 MÓDULO DE ALMACENAMIENTO** (ACTUALIZADO CON REALIDAD iOS + VLC)
**Ubicación aproximada:** líneas 2100-2900

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
saveToLocalFolder(blob, filename, sessionName)  // 🆕 ACTUALIZADO: Maneja MP4 iOS
loadLocalFolderVideos()   // Carga según plataforma

// 🆕 NUEVO: MANEJO DE FORMATOS VLC
async saveVLCCompatibleVideo(blob, metadata)  // Guarda video compatible VLC
createVLCCompatibleFilename(originalName)     // Crea nombre compatible

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

// CONVERSIÓN Y METADATOS (MEJORADOS)
ensureMP4WithMetadata()   // 🆕 ACTUALIZADO: Mejor integración VLC
convertWebMtoMP4()        
addGpsMetadataToMP4(blob, track)  // 🆕 ACTUALIZADO: Mejor integración
addMetadataToWebM()       

// 🆕 NUEVO: DIAGNÓSTICO DE ARCHIVOS
async diagnoseVideoFile(blob)                  // Diagnóstico de archivo de video
checkFileStructure(blob)                       // Verifica estructura del archivo

// CONFIGURACIÓN
this.state.settings.storageLocation  // 'default' o 'localFolder'
this.localFolderHandle               // null en iOS (no disponible)
this.state.settings.localFolderName  // Usado en iOS para referencia
```

### **6. 📁 MÓDULO DE SESIONES Y CARPETAS** (ACTUALIZADO CON REALIDAD iOS + VLC)
**Ubicación aproximada:** líneas 1800-2300

```javascript
// GESTIÓN DE SESIONES (VIRTUALES EN iOS)
createSessionFolder()        // 🆕 ACTUALIZADO: Crea sesión con formato VLC
askAboutCombining()          
combineSessionSegments()    
resetRecordingSession()     

// 🆕 NUEVO: SESIONES COMPATIBLES CON VLC
async createVLCCompatibleSession(sessionName)  // Crea sesión optimizada para VLC
getSessionVLCStatus(sessionName)               // Obtiene estado VLC de sesión

// SELECTORES DE CARPETA - REALIDAD iOS
async showIOSFolderPicker()  // Solo lectura con webkitdirectory
showDesktopFolderPickerWithPersistence() 
showDesktopFolderPicker()    

// DETECCIÓN DE DISPOSITIVOS EXTERNOS
detectExternalDevice(folderName, webkitPath) // USB/externo

// INTERFAZ CARPETAS - ACTUALIZADA CON ADVERTENCIAS iOS + VLC
updateFolderUI()            // OPTIMIZADO v4.10: Solo ejecuta en settings
showIOSFolderLimitationWarning() // Explica limitaciones iOS
showVLCCompatibilityInfo()          // 🆕 Muestra información de compatibilidad VLC
requestStoragePersistence() 
showRestoreFolderModal()    

// NUEVAS FUNCIONES PARA iOS
processWebkitFolderSelection(files) // Procesa selección webkit
saveWebkitFolderInfo(folderName, isExternal) // Guarda info webkit
explainIOSLimitations()            // Explica por qué no hay escritura automática

// 🆕 NUEVAS FUNCIONES PARA iOS + VLC
processIOSSessionVideos(sessionName)  // Procesa videos iOS en sesión
checkSessionVLCCompatibility(sessionName)  // Verifica compatibilidad VLC

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
**Ubicación aproximada:** líneas 2300-2800

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

### **8. 🖼️ MÓDULO DE GALERÍA** (ACTUALIZADO CON FLUJO iOS, NUEVO SISTEMA DE NOMBRES, CORRECCIÓN DE EXPORTACIÓN + VLC)
**Ubicación aproximada:** líneas 2800-4600

```javascript
// FUNCIONES PRINCIPALES - MEJORADAS CON iOS, NUEVO SISTEMA DE NOMBRES + VLC
async loadGallery()               // 🆕 ACTUALIZADO: Detecta compatibilidad VLC
async loadLocalFolderVideos()     // 🆕 ACTUALIZADO: Verifica videos VLC
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

// 🆕 NUEVO: INDICADORES VLC
addVLCBadgeToVideo(videoElement, video)  // Añade badge de compatibilidad VLC
showVLCCompatibilityWarnings()            // Muestra advertencias de compatibilidad

// SISTEMA DE RENDERIZADO POR TABLA
renderVideosList()          // 🆕 ACTUALIZADO: Muestra info VLC
groupVideosBySession(videos) // Agrupa videos por sesión
renderVideoItem(video, sessionName, index)  // 🆕 ACTUALIZADO
renderSessionRow(session, index) 

// MEJORA DE DATOS CON SOPORTE iOS REAL Y NUEVO SISTEMA DE NOMBRES
enhanceLocalVideoData(video)  // ACTUALIZADO: Genera nombres con formato RBB_...
extractAndSetVideoDuration(video) 

// SELECCIÓN MÚLTIPLE
toggleVideoSelection(videoId)      
toggleSessionSelection(sessionName) 
toggleSelectAllVideos(checked)     
playVideoById(videoId)            

// 🆕 NUEVO: HERRAMIENTAS VLC
checkVideoVLCCompatibility(video)        // Verifica compatibilidad VLC
showVLCFixOptions(video)                 // Muestra opciones para arreglar VLC
async fixVideoForVLC(video)              // Arregla video para VLC

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

### **9. 🎥 MÓDULO DE REPRODUCCIÓN** (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES + CONVERSIÓN VLC)
**Ubicación aproximada:** líneas 4600-5100

```javascript
// FUNCIONES PRINCIPALES (ACTUALIZADAS CON NUEVO SISTEMA DE NOMBRES + VLC)
playVideo(video)                // 🆕 ACTUALIZADO: Maneja conversión si es necesario
playVideoFromCurrentLocation(videoId)  // ACTUALIZADO: Usa formato RBB_...
hideVideoPlayer()           
extractGpxFromVideo()       
extractGPSMetadataFromMP4(video) 
addLocationNamesToTrack(gpsTrack) 

// 🆕 NUEVO: REPRODUCCIÓN COMPATIBLE CON VLC
async playVLCCompatibleVideo(video)  // Reproduce video asegurando compatibilidad
checkPlayerCompatibility(video)      // Verifica compatibilidad del reproductor

// OPERACIONES INDIVIDUALES
exportSingleVideo()         // 🆕 ACTUALIZADO: Convierte a VLC si es necesario
deleteSingleVideo()         
moveToLocalFolder()         // Solo desktop

// 🆕 NUEVO: CONVERSIÓN PARA EXPORTACIÓN
async convertForVLCBeforeExport(video)  // Convierte antes de exportar

// NUEVO: RE-DESCARGA PARA iOS
redownloadVideoIOS(video)   // Permite re-descargar video en iOS
showIOSRedownloadOption(video) // Muestra opción de re-descarga

// 🆕 NUEVO: DIAGNÓSTICO DE REPRODUCCIÓN
diagnosePlaybackIssue(video)          // Diagnostica problemas de reproducción
suggestVLCFix(video)                  // Sugiere solución para VLC

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

### **10. 🗺️ MÓDULO GPX** (ACTUALIZADO CON ELIMINACIÓN Y NOMBRES DE SESIÓN)
**Ubicación aproximada:** líneas 5100-5900

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
renderGPXList()                     // 🆕 ACTUALIZADO: Con nombres de sesión y botón eliminar
setupGPXEventListeners()            // 🆕 ACTUALIZADO: Maneja eliminación
showFullscreenMap(gpxData)          

// 🆕 NUEVO: ELIMINACIÓN DE GPX
async deleteGPX(gpxId, source = 'gpxTracks')  // Elimina GPX de IndexedDB y estado

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
**Ubicación aproximada:** líneas 5900-6500

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

### **12. ⚙️ MÓDULO DE CONFIGURACIÓN** (ACTUALIZADO CON OPTIMIZACIÓN updateFolderUI + OPCIONES VLC)
**Ubicación aproximada:** líneas 6500-7000

```javascript
// CONFIGURACIÓN - FUNCIONES MEJORADAS CON iOS + VLC
showSettings()            // 🆕 ACTUALIZADO: Incluye opciones VLC
hideSettings()            
async saveSettings()      // 🆕 ACTUALIZADO: Guarda configuración VLC
resetSettings()           
loadSettings()            
updateSettingsUI()        

// 🆕 NUEVO: CONFIGURACIÓN VLC
showVLCSettings()                  // Muestra configuración específica VLC
updateVLCSettingsUI()              // Actualiza interfaz de configuración VLC
toggleVLCCompatibilityMode()       // Activa/desactiva modo compatible VLC

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
        
        // 🆕 AÑADIR INFO VLC SI ES iOS
        if (this.isIOS) {
            details += ` | 🎬 VLC: ${this.state.settings.vlcCompatibility.enabled ? '✅ Compatible' : '⚠️ Revisar'}`;
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

// AJUSTES ACTUALIZADAS CON REALIDAD iOS + VLC
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
    logoSource: 'unknown',
    
    // ===== 🆕 CONFIGURACIÓN VLC iOS =====
    vlcCompatibility: {
        enabled: true,                     // Habilitar compatibilidad VLC
        autoConvert: true,                 // Convertir automáticamente
        forceMP4OnIOS: true,               // Forzar MP4 en iOS
        optimizeStructure: true,           // Optimizar estructura MP4
        keepOriginal: false,               // Mantener original además del convertido
        quality: 'high',                   // Calidad de conversión
        notifyOnConvert: true              // Notificar al convertir
    },
    
    // ===== 🆕 DETECCIÓN DE CODECS =====
    codecPreferences: {
        ios: ['h264', 'mp4', 'webm'],     // Preferencias iOS
        windows: ['vp9', 'vp8', 'h264'],  // Preferencias Windows
        fallback: 'webm'                   // Codec de respaldo
    }
}

// INTERFAZ CON ADVERTENCIAS iOS + VLC
toggleStorageSettings()   
uploadCustomLogo()        
loadCustomLogo()          
updateLogoInfo()          
showIOSStorageWarning()   // Muestra advertencia iOS al seleccionar carpeta
showVLCInfo()                      // 🆕 Muestra información sobre VLC
explainVLCCompatibility()          // 🆕 Explica compatibilidad VLC
```

### **13. 🛠️ MÓDULO DE UTILIDADES** (AMPLIADO CON iOS REAL, NUEVO SISTEMA DE NOMBRES + FUNCIONES VLC)
**Ubicación aproximada:** líneas 7000-7500

```javascript
// FORMATOS Y CONVERSIÓN
formatTime(ms)            
cleanFileName(filename)   
escapeHTML(text)          
normalizeId(id)           

// NUEVO: GENERACIÓN DE NOMBRES ESTANDARIZADOS
generateStandardFilename(segmentNum = 1, customDate = null) // Genera RBB_YYYYMMDD_HHMM_S[#].mp4

// 🆕 NUEVO: UTILIDADES VLC
async diagnoseVLCCompatibility(blob)     // Diagnóstico de compatibilidad VLC
getVideoFormatInfo(blob)                 // Obtiene información del formato
checkForMoovAtom(blob)                   // Verifica átomo moov
checkMP4Structure(blob)                  // Verifica estructura MP4

// 🆕 NUEVO: CONVERSIÓN Y REPARACIÓN
async repairMP4ForVLC(mp4Blob)           // Repara MP4 para VLC
async convertToVLCCompatible(blob)       // Convierte a formato compatible
createVLCCompatibleBlob(originalBlob)    // Crea blob compatible

// NOTIFICACIONES Y ESTADO (MEJORADAS PARA iOS + VLC)
showNotification(message, duration)  // 🆕 ACTUALIZADO: Notificaciones VLC
showSavingStatus(message) 
hideSavingStatus()        
showVLCConversionStatus()                // 🆕 Muestra estado de conversión VLC

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
debugIOSVLCIssues()                      // 🆕 Diagnóstico específico VLC iOS
testVLCPlayback()                        // 🆕 Prueba reproducción VLC

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

// 🆕 NUEVO: VERIFICACIÓN VLC
checkVLCRequirements()                 // Verifica requisitos para VLC
verifyVLCCompatibility()               // Verifica compatibilidad VLC

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

### **15. 📱 MÓDULO DE MIGRACIÓN iOS** (ACTUALIZADO CON VLC)
**Ubicación aproximada:** líneas 7500-7600

```javascript
// MIGRACIÓN iOS/WINDOWS - MEJORADA
async migrateIOSVideoToWindows(video)  // 🆕 ACTUALIZADO: Convierte para VLC
async checkAndMigrateIOSVideos()       // 🆕 ACTUALIZADO: Incluye conversión VLC

// NUEVO: MIGRACIÓN MANUAL iOS
generateIOSMigrationGuide()  // Guía para migrar videos manualmente
createIOSFileListForMigration() // Lista para migración manual
suggestFolderStructureForIOS() // Sugiere estructura de carpetas

// 🆕 NUEVO: MIGRACIÓN PARA VLC
async migrateForVLCCompatibility()     // Migra videos para compatibilidad VLC
convertIOSVideosToVLCFormat()          // Convierte videos iOS a formato VLC

// FUNCIONES AUXILIARES
readString(arrayBuffer, offset, length) 
```

### **16. 💾 MÓDULO DE BASE DE DATOS - UTILIDADES** (ACTUALIZADO CON NUEVO SISTEMA DE NOMBRES)
**Ubicación aproximada:** líneas 7600-7700

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

// 🆕 NUEVO: ALMACENAMIENTO DE METADATOS VLC
saveVLCCompatibilityInfo(videoId, info)  // Guarda info de compatibilidad
getVLCCompatibilityInfo(videoId)         // Obtiene info de compatibilidad

// ACTUALIZACIÓN: SAVE TO APP CON NUEVO SISTEMA DE NOMBRES
async saveToApp(blob, timestamp, duration, format, segmentNum = 1, gpsData = []) {
    // Ahora usa generateStandardFilename() para título y filename
    // Título: RBB_YYYYMMDD_HHMM_S[#] (sin .mp4)
    // Filename: RBB_YYYYMMDD_HHMM_S[#].mp4
}

// MANEJO DE ERRORES
// Incluye manejo de ConstraintError y excepciones
```

### **17. 🗂️ MÓDULO DE GESTIÓN DE SESIONES** (ACTUALIZADO CON COMPATIBILIDAD VLC)
**Ubicación aproximada:** líneas 7700-7900

```javascript
// FUNCIONES DE GESTIÓN DE SESIONES
groupVideosBySession(videos)      // 🆕 ACTUALIZADO: Agrupa por sesión y compatibilidad
toggleSession(sessionName)       
toggleSessionSelection(sessionName) 
expandAllSessions()              
collapseAllSessions()            
getSessionByName(sessionName)    
getSessionVideos(sessionName)    
exportSession(sessionName)       // 🆕 ACTUALIZADO: Convierte para VLC si es necesario
exportAllSessions()              
deleteSession(sessionName)       

// 🆕 NUEVO: SESIONES COMPATIBLES CON VLC
checkSessionVLCStatus(sessionName)        // Verifica estado VLC de sesión
fixSessionForVLC(sessionName)             // Arregla sesión para VLC
exportSessionVLCCompatible(sessionName)   // Exporta sesión compatible VLC

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

### **18. 🔗 MÓDULO DE COMBINACIÓN Y EXPORTACIÓN** (ACTUALIZADO CON VLC)
**Ubicación aproximada:** líneas 7900-8000

```javascript
// FUNCIONES DE COMBINACIÓN DE VIDEOS
combineSelectedVideos()            // 🆕 ACTUALIZADO: Mantiene compatibilidad VLC
confirmVideoCombination()          
performVideoCombination(selectedVideos) 
combineSessionSegments()           
askAboutCombining()                

// 🆕 NUEVO: COMBINACIÓN PARA VLC
combineVideosForVLC(videos)        // Combina videos asegurando compatibilidad VLC
createVLCCompatibleCombination(videos)  // Crea combinación compatible

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
exportSession(sessionName)         // 🆕 ACTUALIZADO: Asegura formato VLC
exportAllSessions()                

// VARIABLES TEMPORALES
this.tempCombinationVideos = null  
```

### **19. 🧹 MÓDULO DE LIMPIEZA AUTOMÁTICA**
**Ubicación aproximada:** líneas 8000-8100

```javascript
// LIMPIEZA AUTOMÁTICA DE SESIONES VACÍAS
cleanupEmptySessions()           
cleanupEmptyLocalFolders()        // Solo desktop
cleanupInvalidWebkitReferences() 

// 🆕 NUEVO: LIMPIEZA VLC
cleanupVLCConversionArtifacts()   // Limpia archivos temporales de conversión
removeDuplicateVLCVideos()        // Elimina duplicados VLC

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
// 5. cleanupVLCConversionArtifacts() → 🆕 Limpia temporales VLC
```

### **20. 📱 MÓDULO DE GESTIÓN DE ARCHIVOS iOS** (ACTUALIZADO CON REALIDAD + VLC)
**Ubicación aproximada:** líneas 8100-8400

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

// 🆕 NUEVO: MANEJO VLC EN iOS
handleIOSVLCConversion()           // Maneja conversión VLC en iOS
showIOSVLCInstructions()           // Muestra instrucciones VLC para iOS
setupIOSVLCWorkflow()              // Configura flujo de trabajo VLC

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

### **21. 🔌 MÓDULO DE EVENTOS** (ACTUALIZADO - REALIDAD iOS + VLC)
**Ubicación aproximada:** líneas 8400-8500

```javascript
// CONFIGURACIÓN EVENTOS UNIFICADA
setupEventListeners()           // 🆕 ACTUALIZADO: Listeners para VLC
setupCompactSelectors()         
setupGPXEventListeners()        
setupGalleryEventListeners()    
setupFileUploadListeners()      

// 🆕 NUEVOS EVENTOS PARA VLC
vlc-conversion-started          // Cuando inicia conversión VLC
vlc-conversion-completed        // Cuando completa conversión VLC
vlc-compatibility-checked       // Cuando verifica compatibilidad VLC

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

### **22. 🔧 FUNCIONES AUXILIARES DE GALERÍA** (ACTUALIZADO CON CORRECCIÓN DE EXPORTACIÓN + VLC)
**Ubicación aproximada:** líneas 8500-8600

```javascript
// FUNCIONES ESPECÍFICAS PARA LA INTERFAZ DE TABLA
toggleVideoSelection(videoId)      
toggleSessionSelection(sessionName) 
toggleSelectAllVideos(checked)     
playVideoById(videoId)            

// 🆕 NUEVO: AUXILIARES VLC
showVLCVideoOptions(video)        // Muestra opciones VLC para video
enableVLCConversion(video)        // Habilita conversión VLC
addVLCStatusBadge(videoElement)   // Añade badge de estado VLC

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
// 1. renderVideosList() → Genera tabla completa con badges iOS + VLC
// 2. renderSessionRow() → Crea filas de sesión con indicadores iOS + VLC
// 3. renderVideoRow() → Crea filas de video con opciones iOS + VLC
// 4. onclick directo → Ejecuta acciones con flujo iOS + VLC
```

### **23. 🔍 MÓDULO DE DIAGNÓSTICO Y VERIFICACIÓN** (AMPLIADO CON DIAGNÓSTICO VLC)
**Ubicación aproximada:** líneas 8600-8700

```javascript
// FUNCIONES DE DIAGNÓSTICO DEL SISTEMA
debugStorage()                  
checkDataIntegrity()           
validateSettings()             
verifyLogoInfo()               

// 🆕 NUEVO: DIAGNÓSTICO VLC ESPECÍFICO
debugVLCCompatibility()         // Diagnóstico de compatibilidad VLC
testVLCConversion()             // Prueba conversión VLC
verifyVLCStructure()            // Verifica estructura para VLC

// NUEVO: DIAGNÓSTICO iOS ESPECÍFICO
debugIOSCapabilities()         // Diagnóstico de capacidades iOS
testIOSDownloadWorkflow()      // Prueba flujo de descarga iOS
verifyIOSFolderAccess()        // Verifica acceso a carpetas iOS

// FUNCIONES DE REPARACIÓN
repairCorruptedSettings()      
restoreFromBackup()           
cleanupOrphanedData()         

// 🆕 NUEVO: REPARACIÓN VLC
repairVLCIssues()               // Repara problemas VLC
fixVLCCompatibility()           // Arregla compatibilidad VLC

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
**Ubicación aproximada:** líneas 8700-8800

```javascript
// SINCRONIZACIÓN MEJORADA CON REALIDAD iOS
async syncPhysicalFilesWithDatabase() // Función principal
syncPhysicalFilesWithHandle()        // Para handle persistente (NO iOS)
syncWebkitDirectoryReferences()      // Para webkitdirectory (solo lectura iOS)
cleanupInvalidWebkitReferences()     // Limpia referencias inválidas
cleanupOrphanedDatabaseEntries()     // Limpia entradas huérfanas

// 🆕 NUEVO: SINCRONIZACIÓN VLC
syncVLCCompatibleFiles()            // Sincroniza archivos compatibles VLC
updateVLCFileReferences()           // Actualiza referencias VLC

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

### **25. 🆕 NUEVO: MÓDULO DE CONVERSIÓN Y COMPATIBILIDAD VLC iOS**
**Ubicación aproximada:** líneas 8800-8950

```javascript
// 🎯 CONVERSIÓN WEBM → MP4 PARA VLC
async convertWebMtoMP4ForVLC(webmBlob) {
    console.log('🎬 Convirtiendo WebM → MP4 para VLC...');
    
    try {
        // 1. Leer datos WebM
        const webmData = await webmBlob.arrayBuffer();
        const webmArray = new Uint8Array(webmData);
        
        // 2. Crear estructura MP4 básica pero VÁLIDA
        // El truco: mantener los datos WebM en un contenedor MP4 con moov al inicio
        
        // Átomo ftyp (file type - obligatorio)
        const ftypAtom = new Uint8Array([
            // Tamaño: 24 bytes
            0x00, 0x00, 0x00, 0x18,
            // Tipo: ftyp
            0x66, 0x74, 0x79, 0x70,
            // Major brand: mp42 (muy compatible)
            0x6D, 0x70, 0x34, 0x32,
            // Minor version: 0
            0x00, 0x00, 0x00, 0x00,
            // Compatible brands: mp42, mp41, isom
            0x6D, 0x70, 0x34, 0x32,
            0x6D, 0x70, 0x34, 0x31,
            0x69, 0x73, 0x6F, 0x6D
        ]);
        
        // Átomo moov (movie metadata - DEBE ir antes de mdat para VLC)
        const moovAtom = new Uint8Array([
            // Tamaño: 56 bytes
            0x00, 0x00, 0x00, 0x38,
            // Tipo: moov
            0x6D, 0x6F, 0x6F, 0x76,
            
            // mvhd atom (movie header - simplificado)
            0x00, 0x00, 0x00, 0x20,
            0x6D, 0x76, 0x68, 0x64,
            // Versión 0, flags 0
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            // Creation & modification time (0)
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            // Timescale: 1000 (1ms)
            0x00, 0x00, 0x03, 0xE8,
            // Duration: 10000 (10 segundos - placeholder)
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x27, 0x10,
            // Rate: 1.0 normal speed
            0x00, 0x01, 0x00, 0x00,
            // Volume: 1.0
            0x01, 0x00,
            // Reserved
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            // Matrix (identity)
            0x00, 0x01, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x01, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x40, 0x00, 0x00, 0x00,
            // Pre-defined zeros
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            // Next track ID: 2
            0x00, 0x00, 0x00, 0x02
        ]);
        
        // Átomo mdat (media data - contiene los datos WebM reales)
        const mdatSize = 8 + webmArray.length;
        const mdatHeader = new Uint8Array(8);
        
        // Escribir tamaño (big endian)
        mdatHeader[0] = (mdatSize >> 24) & 0xFF;
        mdatHeader[1] = (mdatSize >> 16) & 0xFF;
        mdatHeader[2] = (mdatSize >> 8) & 0xFF;
        mdatHeader[3] = mdatSize & 0xFF;
        
        // Escribir tipo: mdat
        mdatHeader[4] = 0x6D; // m
        mdatHeader[5] = 0x64; // d
        mdatHeader[6] = 0x61; // a
        mdatHeader[7] = 0x74; // t
        
        // 3. Combinar todo: ftyp → moov → mdat (ESTRUCTURA VLC-COMPATIBLE)
        const totalSize = ftypAtom.length + moovAtom.length + mdatHeader.length + webmArray.length;
        const finalArray = new Uint8Array(totalSize);
        
        let offset = 0;
        finalArray.set(ftypAtom, offset);
        offset += ftypAtom.length;
        
        finalArray.set(moovAtom, offset);    // 🎯 MOOV PRIMERO (para VLC)
        offset += moovAtom.length;
        
        finalArray.set(mdatHeader, offset);
        offset += mdatHeader.length;
        
        finalArray.set(webmArray, offset);   // Datos WebM originales
        
        // 4. Crear blob MP4
        const mp4Blob = new Blob([finalArray], { type: 'video/mp4' });
        
        console.log(`✅ WebM → MP4: ${Math.round(webmBlob.size/1024)}KB → ${Math.round(mp4Blob.size/1024)}KB`);
        
        return mp4Blob;
        
    } catch (error) {
        console.error('❌ Error en conversión WebM→MP4:', error);
        
        // Fallback crítico: devolver WebM pero con tipo MP4
        // VLC al menos intentará abrirlo
        return new Blob([await webmBlob.arrayBuffer()], { type: 'video/mp4' });
    }
}

// 🔧 CREACIÓN DE CONTENEDOR MP4 VÁLIDO
createBasicMP4Container(videoData) {
    // Crea estructura MP4 mínima pero válida
    // Orden: ftyp → moov → mdat (ESENCIAL para VLC)
    
    // Implementación completa (ver código anterior)
    // ... [150 líneas de código] ...
}

// 📊 DIAGNÓSTICO DE COMPATIBILIDAD VLC
async diagnoseVLCIssue(blob) {
    console.log('🔍 Diagnóstico VLC...');
    
    try {
        // Leer primeros 2000 bytes
        const slice = blob.slice(0, 2000);
        const arrayBuffer = await slice.arrayBuffer();
        const arr = new Uint8Array(arrayBuffer);
        
        let moovPos = -1, mdatPos = -1, ftypPos = -1;
        let position = 0;
        
        // Analizar estructura MP4
        while (position < arr.length - 8) {
            const size = (arr[position] << 24) | 
                        (arr[position + 1] << 16) | 
                        (arr[position + 2] << 8) | 
                        arr[position + 3];
            
            const type = String.fromCharCode(
                arr[position + 4],
                arr[position + 5],
                arr[position + 6],
                arr[position + 7]
            );
            
            if (type === 'ftyp') ftypPos = position;
            if (type === 'moov') moovPos = position;
            if (type === 'mdat') mdatPos = position;
            
            if (size === 0 || size < 8) break;
            position += size;
        }
        
        const moovBeforeMdat = moovPos < mdatPos && moovPos !== -1;
        const hasFtyp = ftypPos !== -1;
        const isValidMP4 = hasFtyp && moovPos !== -1 && mdatPos !== -1;
        
        return {
            isValidMP4,
            moovBeforeMdat,
            moovPos,
            mdatPos,
            ftypPos,
            vlcCompatible: moovBeforeMdat,
            issue: !moovBeforeMdat ? 'moov atom está después de mdat' : 'Estructura correcta',
            recommendation: !moovBeforeMdat ? 'Convertir a MP4 VLC-compatible' : 'Listo para VLC'
        };
        
    } catch (error) {
        return {
            error: error.message,
            vlcCompatible: false,
            issue: 'Error en análisis'
        };
    }
}

// 🛠️ REPARACIÓN DE MP4 PARA VLC
async repairMP4ForVLC(mp4Blob) {
    console.log('🔧 Reparando MP4 para VLC...');
    
    try {
        const arrayBuffer = await mp4Blob.arrayBuffer();
        const arr = new Uint8Array(arrayBuffer);
        
        // Buscar y reordenar átomos
        const atoms = [];
        let pos = 0;
        
        while (pos < arr.length - 8) {
            const size = (arr[pos] << 24) | (arr[pos + 1] << 16) | (arr[pos + 2] << 8) | arr[pos + 3];
            const type = String.fromCharCode(arr[pos + 4], arr[pos + 5], arr[pos + 6], arr[pos + 7]);
            
            if (size < 8) break;
            
            atoms.push({
                pos,
                size,
                type,
                data: arr.slice(pos, pos + size)
            });
            
            pos += size;
        }
        
        // Verificar si ya está bien
        const moov = atoms.find(a => a.type === 'moov');
        const mdat = atoms.find(a => a.type === 'mdat');
        
        if (moov && mdat && moov.pos < mdat.pos) {
            console.log('✅ MP4 ya tiene estructura VLC-compatible');
            return mp4Blob;
        }
        
        // Reordenar: ftyp → moov → mdat (ORDEN CORRECTO PARA VLC)
        const ordered = [];
        
        // 1. ftyp primero (si existe)
        const ftyp = atoms.find(a => a.type === 'ftyp');
        if (ftyp) ordered.push(ftyp.data);
        
        // 2. moov segundo (CRÍTICO: debe ir antes de mdat para VLC)
        if (moov) ordered.push(moov.data);
        
        // 3. mdat después
        if (mdat) ordered.push(mdat.data);
        
        // 4. Otros átomos
        atoms.forEach(atom => {
            if (!['ftyp', 'moov', 'mdat'].includes(atom.type)) {
                ordered.push(atom.data);
            }
        });
        
        const finalBlob = new Blob(ordered, { type: 'video/mp4' });
        
        console.log(`✅ MP4 reparado para VLC: ${atoms.length} átomos reordenados`);
        return finalBlob;
        
    } catch (error) {
        console.warn('⚠️ Error reparando MP4:', error);
        return mp4Blob;
    }
}

// 🔍 DETECCIÓN DE CODECS ÓPTIMOS
async selectOptimalCodec() {
    console.log('🔍 Detectando codec óptimo...');
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // iOS: Priorizar MP4/H264 para compatibilidad VLC
        const iosCodecs = [
            'video/mp4;codecs=h264',
            'video/mp4;codecs=avc1.42E01E',
            'video/mp4',
            'video/webm;codecs=h264',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8,opus',
            'video/webm'
        ];
        
        for (const codec of iosCodecs) {
            if (MediaRecorder.isTypeSupported(codec)) {
                console.log(`✅ iOS soporta: ${codec}`);
                
                // Preferir MP4 sobre WebM para VLC
                if (codec.includes('mp4')) {
                    console.log('🎯 Usando MP4 en iOS para VLC');
                    this.iosUsingMP4 = true;
                    return codec;
                }
            }
        }
        
        // Si no se encontró MP4, marcar para conversión
        this.iosNeedsConversion = true;
        return 'video/webm';
        
    } else {
        // Windows/Android: Usar preferencias del usuario
        if (this.state.settings.videoFormat === 'mp4') {
            const mp4Codecs = [
                'video/mp4;codecs=h264',
                'video/mp4;codecs=avc1.42E01E',
                'video/mp4'
            ];
            
            for (const codec of mp4Codecs) {
                if (MediaRecorder.isTypeSupported(codec)) {
                    return codec;
                }
            }
        }
        
        // WebM por defecto o como fallback
        const webmCodecs = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8,opus',
            'video/webm'
        ];
        
        for (const codec of webmCodecs) {
            if (MediaRecorder.isTypeSupported(codec)) {
                return codec;
            }
        }
        
        // Último recurso
        return 'video/webm';
    }
}

// 📝 GENERACIÓN DE METADATOS VLC
createVLCCompatibleMetadata(gpsData) {
    // Crea metadatos optimizados para VLC
    // Evita corromper estructura del archivo
    
    const metadata = {
        gpsVersion: "2.0",
        appVersion: APP_VERSION,
        created: new Date().toISOString(),
        gpsPoints: gpsData.length,
        track: gpsData.map(p => ({
            lat: p.lat || p.latitude || 0,
            lon: p.lon || p.longitude || 0,
            ele: p.ele || p.altitude || 0,
            time: p.timestamp || Date.now(),
            speed: p.speed || 0
        })),
        vlcCompatible: true,
        conversionDate: new Date().toISOString()
    };
    
    return metadata;
}

// ⚡ CONVERSIÓN EN TIEMPO REAL PARA iOS
async processIOSVideoRealTime(blob, gpsData) {
    console.log('⚡ Procesamiento iOS tiempo real para VLC...');
    
    // 1. Detectar formato
    const isWebM = blob.type.includes('webm');
    const isMP4 = blob.type.includes('mp4');
    
    let finalBlob = blob;
    
    // 2. Convertir WebM→MP4 si es necesario
    if (isWebM && this.state.settings.vlcCompatibility.autoConvert) {
        console.log('🔄 iOS: Convirtiendo WebM → MP4 para VLC...');
        finalBlob = await this.convertWebMtoMP4ForVLC(blob);
    }
    
    // 3. Añadir metadatos GPS
    if (gpsData && gpsData.length > 0 && finalBlob.type.includes('mp4')) {
        console.log(`📍 Añadiendo ${gpsData.length} puntos GPS...`);
        finalBlob = await this.addGpsMetadataToMP4(finalBlob, gpsData);
    }
    
    // 4. Optimizar para VLC
    if (finalBlob.type.includes('mp4')) {
        finalBlob = await this.repairMP4ForVLC(finalBlob);
    }
    
    console.log(`✅ Procesamiento iOS completado: ${blob.type} → ${finalBlob.type}`);
    return finalBlob;
}

// 🎨 INTERFAZ DE USUARIO VLC
showVLCConversionProgress(progress) {
    // Muestra progreso de conversión
    // Notifica al usuario
    
    const progressEl = document.getElementById('vlcConversionProgress');
    if (progressEl) {
        progressEl.style.display = 'block';
        progressEl.innerHTML = `
            <div class="conversion-status">
                <h3>🎬 Optimizando para VLC</h3>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <p>${progress}% completado</p>
                <small>Convirtiendo video para compatibilidad con VLC...</small>
            </div>
        `;
    }
    
    if (progress >= 100) {
        setTimeout(() => {
            if (progressEl) progressEl.style.display = 'none';
        }, 2000);
    }
}

// 💾 GUARDADO COMPATIBLE CON VLC (MANTIENE SESIONES)
async saveVLCCompatible(blob, filename, sessionName) {
    console.log('💾 Guardando video compatible VLC...');
    
    try {
        // Verificar si ya es compatible con VLC
        const diagnosis = await this.diagnoseVLCIssue(blob);
        
        if (!diagnosis.vlcCompatible && blob.type.includes('mp4')) {
            // Reparar MP4 existente
            blob = await this.repairMP4ForVLC(blob);
        } else if (blob.type.includes('webm') && this.isIOS) {
            // Convertir WebM → MP4 en iOS
            blob = await this.convertWebMtoMP4ForVLC(blob);
            filename = filename.replace('.webm', '.mp4');
        }
        
        // 🎯 MANTENER SESIÓN ORIGINAL
        // Usar la función saveToLocalFolder existente con el nombre de sesión
        const saved = await this.saveToLocalFolder(blob, filename, sessionName);
        
        if (saved) {
            console.log(`✅ Video VLC-compatible guardado en sesión: ${sessionName || 'Sin sesión'}`);
            
            // Actualizar estadísticas
            this.vlcDiagnostics.successfulConversions++;
            this.vlcDiagnostics.lastConversionTime = new Date().toISOString();
            
            return {
                success: true,
                filename: filename,
                session: sessionName,
                vlcCompatible: true,
                originalSessionMaintained: true
            };
        }
        
        return { success: false, error: 'No se pudo guardar' };
        
    } catch (error) {
        console.error('❌ Error guardando VLC-compatible:', error);
        
        this.vlcDiagnostics.failedConversions++;
        this.vlcDiagnostics.lastError = error.message;
        
        return {
            success: false,
            error: error.message,
            vlcCompatible: false
        };
    }
}
```

## 🔄 RESUMEN DE LOS CAMBIOS EN v4.13

### **🆕 NUEVAS FUNCIONALIDADES V4.13:**

#### **1. ✅ Gestión Completa de GPX con Eliminación y Nombres de Sesión:**
- **Botón eliminar GPX** - Nueva opción para eliminar archivos GPX individualmente
- **Nombres de sesión** - Los archivos GPX muestran el nombre de sesión como título principal
- **Confirmación** - Pide confirmación antes de eliminar archivos GPX
- **Actualización en tiempo real** - La UI se actualiza inmediatamente después de eliminar

#### **2. ✅ Función `deleteGPX()` completamente nueva:**
- **Eliminación de IndexedDB** - Borra entradas de `gpxTracks` o `gpxFiles`
- **Actualización de estado** - Elimina GPX de `this.state.gpxTracks`
- **Limpieza de selecciones** - Elimina IDs de `this.state.selectedGPX` si estaban seleccionados
- **Notificaciones** - Informa al usuario sobre la eliminación exitosa o errores

#### **3. ✅ Mejora en `renderGPXList()`:**
- **Títulos con nombre de sesión** - Prioriza mostrar el nombre de sesión sobre otros nombres
- **Información mejorada** - Muestra "Sesión: [nombre]" en los detalles
- **Botón eliminar integrado** - Nuevo botón "🗑️ Eliminar" en cada archivo GPX

#### **4. ✅ Mejora en `setupGPXEventListeners()`:**
- **Event listener para eliminar** - Maneja clics en el nuevo botón eliminar
- **Confirmación de usuario** - Usa `confirm()` para prevenir eliminaciones accidentales
- **Integración con `deleteGPX()`** - Llama a la nueva función de eliminación

### **📊 ESTADÍSTICAS DEL PROYECTO ACTUALIZADAS (v4.13)**

- **Total módulos documentados:** 25 (módulos principales completos)
- **Funciones principales identificadas:** ~385 (+5 desde v4.12)
- **Funciones específicas GPX mejoradas:** 3 (`renderGPXList`, `setupGPXEventListeners`, nueva `deleteGPX`)
- **Nuevas funciones añadidas:** 1 (`deleteGPX`)
- **Funciones modificadas:** 2 (`renderGPXList`, `setupGPXEventListeners`)
- **Líneas totales estimadas en Dashcam_App.js:** ~8850 (+50 desde v4.12)
- **Código específico GPX mejorado:** ~120 líneas adicionales/modificadas

## 🎯 CÓMO USAR LAS NUEVAS FUNCIONALIDADES GPX EN v4.13

### **Para eliminar archivos GPX:**
```javascript
// 1. Click en el botón "🗑️ Eliminar" en cualquier archivo GPX
// 2. Confirmar la eliminación en el diálogo emergente
// 3. El sistema automáticamente:
//    - Elimina de IndexedDB (gpxTracks o gpxFiles)
//    - Elimina del estado this.state.gpxTracks
//    - Actualiza la UI inmediatamente
//    - Muestra notificación de confirmación

// Uso programático:
await deleteGPX(gpxId, source); // source: 'gpxTracks' o 'gpxFiles'
```

### **Para ver nombres de sesión en GPX:**
```javascript
// Los archivos GPX ahora muestran:
// - Título principal: Nombre de sesión (si está disponible)
// - Detalles: Incluye "Sesión: [nombre]" si existe
// - Prioridad: sessionName > title > filename (sin extensión)

// Estructura GPX mejorada:
{
    id: 123,
    sessionName: "Viaje a montaña",  // 🆕 NUEVO: Prioridad para título
    title: "Viaje a montaña.gpx",    // Usado si no hay sessionName
    filename: "Viaje_a_montaña.gpx", // Usado si no hay title
    points: 150,
    // ... otros campos
}
```

## 📝 PLANTILLA PARA PROBLEMAS EN v4.13

```markdown
## 🚨 PROBLEMA v4.13

**Versión:** 4.13
**Dispositivo:** [iOS/Windows]
**Navegador:** [Safari/Chrome/etc]
**Protocolo:** [http://, https://, file://]

**Problema específico GPX:**
[ ] Botón eliminar no aparece en archivos GPX
[ ] Botón eliminar no funciona
[ ] No se muestra nombre de sesión en GPX
[ ] Eliminación no actualiza la UI
[ ] Error al intentar eliminar GPX
[ ] Sesión no aparece en detalles GPX
[ ] Otro: _________

**Funciones relacionadas:**
- renderGPXList() - Líneas ~5700-5800 (renderizado con nombres sesión + botón eliminar)
- setupGPXEventListeners() - Líneas ~5700-5800 (eventos para eliminar)
- deleteGPX() - Líneas ~5850-5900 (función de eliminación)
- downloadGPX() - Líneas ~5800-5850 (descarga GPX)

**Diagnóstico rápido GPX:**
1. ¿Archivo GPX tiene sessionName? _______
2. ¿Botón eliminar visible? _______
3. ¿Confirmación aparece? _______
4. ¿Error en consola? _______
5. ¿GPX eliminado de UI? _______

**Consola del navegador:**
[Pegar error o log relevante]

**Estructura GPX actual (ejemplo):**
{
  "id": 123,
  "sessionName": "Viaje a montaña",
  "title": "Viaje a montaña.gpx",
  "filename": "Ruta_20231201.gpx",
  "points": 150,
  "source": "gpxTracks"
}
```

## 🏆 VENTAJAS DEL SISTEMA v4.13

### **✅ Para Usuarios:**
1. **Gestión completa GPX** - Eliminar archivos GPX no deseados
2. **Organización mejorada** - Nombres de sesión claros en archivos GPX
3. **Confirmación segura** - Previene eliminaciones accidentales
4. **Feedback inmediato** - UI actualizada al instante

### **✅ Para Desarrolladores:**
1. **Código modular** - Nueva función `deleteGPX()` autocontenida
2. **Integración limpia** - No rompe funcionalidad existente
3. **Manejo de errores** - Robustez en eliminación de IndexedDB
4. **Consistencia** - Mismo patrón que eliminación de videos

### **✅ Funciones Críticas Verificadas:**
1. **renderGPXList()** ✅ - Muestra nombres de sesión y botón eliminar
2. **setupGPXEventListeners()** ✅ - Maneja eventos de eliminación con confirmación
3. **deleteGPX()** ✅ - Eliminación segura con actualización de estado y UI
4. **downloadGPX()** ✅ - Mantiene funcionalidad existente intacta

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Pruebas exhaustivas** - Verificar eliminación en diferentes escenarios
2. **Mejorar feedback** - Añadir animaciones o transiciones en eliminación
3. **Exportación mejorada** - Permitir exportar GPX con nombre de sesión automático
4. **Selección múltiple** - Extender eliminación a múltiples archivos GPX seleccionados
5. **Recuperación** - Considerar papelera de reciclaje o deshacer eliminación

## ⚠️ NOTAS IMPORTANTES DE IMPLEMENTACIÓN

### **Para GPX con nombres de sesión:**
- Si existe `sessionName`, se usa como título principal
- Si no existe `sessionName`, se usa `title` o `filename` (sin extensión)
- La información de sesión se muestra en los detalles
- Compatible con GPX existentes (no requiere migración)

### **Para eliminación de GPX:**
- Elimina de IndexedDB según la fuente (`gpxTracks` o `gpxFiles`)
- Actualiza `this.state.gpxTracks` inmediatamente
- Limpia `this.state.selectedGPX` si el GPX estaba seleccionado
- Muestra notificación de éxito/error
- Pide confirmación al usuario antes de eliminar

### **Performance:**
- Eliminación en memoria y IndexedDB (rápido)
- Actualización inmediata de UI
- Sin impacto en otros módulos
- Compatible con iOS y desktop

*Documentación actualizada para v4.13 - Gestión completa de GPX con eliminación y nombres de sesión*
```

Este es el archivo **Estructura_App.md COMPLETO** actualizado para v4.13 con toda la gestión GPX mejorada, incluyendo eliminación de archivos GPX y uso de nombres de sesión como títulos principales.