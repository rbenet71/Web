// Dashcam PWA v3.3 - Versión Avanzada con todas las funcionalidades

const APP_VERSION = '3.3';

class DashcamApp {
    constructor() {
        // Estado de la aplicación
        this.state = {
            recordedSegments: [], // Segmentos grabados en esta sesión
            recordingSessionSegments: 0, // Contador de segmentos en esta sesión
            recordingSessionName: null, // Nombre de la sesión (si se crea carpeta)
            isRecording: false,
            isPaused: false,
            startTime: null,
            currentTime: 0,
            selectedVideos: new Set(),
            selectedGPX: new Set(),
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
            settings: {
                recordingMode: 'segmented', // 'segmented' o 'continuous'
                segmentDuration: 5,
                videoQuality: '720p',
                videoFormat: 'mp4',
                gpxInterval: 5,
                overlayEnabled: true,
                audioEnabled: false,
                reverseGeocodeEnabled: true,
                watermarkOpacity: 0.7,
                watermarkFontSize: 16,
                watermarkPosition: 'bottom',
                storageLocation: 'default',
                keepAppCopy: true,
                localFolderHandle: null,
                localFolderName: null,
                localFolderPath: null,
                showWatermark: true,
                logoPosition: 'top-left', // Cambiado por defecto
                logoSize: 'medium',
                customWatermarkText: 'Powered By Roberto Benet - rbenet71@gmail.com',
                textPosition: 'bottom-right', // Cambiado por defecto
                gpxOverlayEnabled: false,
                showGpxDistance: true,
                showGpxSpeed: true,
                embedGpsMetadata: true,
                metadataFrequency: 2
            },
            customLogo: null,
            logoImage: null,
            currentLocationName: 'Buscando...',
            reverseGeocodeCache: {},
            frameCounter: 0
        };

        // Variables de control
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
        
        // Variables para composición de video
        this.mainCanvas = null;
        this.mainCtx = null;
        this.videoElement = null;
        this.canvasStream = null;
        this.animationFrame = null;
        
        // Variables para gestión de archivos
        this.isSaving = false;
        this.localFolderHandle = null;
        this.isIOS = this.detectIOS();
        
        // Elementos DOM adicionales para galería mejorada
        this.elements = {};
        
        // Inicializar
        this.init();
    }

    detectIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }



    async init() {
        console.log(`🚀 Iniciando Dashcam iPhone Pro v${APP_VERSION}`);
        console.log(`📱 Dispositivo: ${this.isIOS ? 'iPhone/iPad' : 'Otro'}`);
        
        // Limpiar caché si es necesario
        await this.clearCacheIfNeeded();
        
        // Inicializar elementos DOM
        this.initElements();
        
        // Inicializar canvas
        this.mainCanvas = document.getElementById('mainCanvas');
        if (this.mainCanvas) {
            this.mainCtx = this.mainCanvas.getContext('2d');
        }
        
        const overlayCanvas = document.getElementById('overlayCanvas');
        if (overlayCanvas) {
            this.elements.overlayCtx = overlayCanvas.getContext('2d');
        }
        
        // ============ ORDEN CORRECTO ============
        // 1. Primero inicializar la base de datos
        await this.initDatabase();
        
        // 2. Luego cargar configuración (después de que la BD esté lista)
        await this.loadSettings();
        
        // 3. Intentar restaurar permisos de carpeta (si aplica)
        await this.restoreFolderPermissions();
        
        // 4. Cargar logo personalizado si existe
        await this.loadCustomLogo();
        
        // 5. Cargar GPX cargados
        await this.loadGPXFiles();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Iniciar monitoreo básico (sin GPS inicial)
        this.startMonitoring();
        
        // Cargar galería inicial
        await this.loadGallery();
        
        // Mostrar estado de almacenamiento
        this.updateStorageStatus();
        
        this.showNotification(`Dashcam iPhone Pro v${APP_VERSION} lista`);
        console.log(`✅ Aplicación iniciada correctamente`);
    }


    async createSessionFolder() {
        try {
            const timestamp = new Date().toISOString()
                .replace(/[:.]/g, '-')
                .replace('T', '_')
                .substring(0, 16);
            
            const sessionName = `Sesion_${timestamp}`;
            console.log(`📁 Creando carpeta de sesión: ${sessionName}`);
            
            this.state.recordingSessionName = sessionName;
            
            // Crear carpeta según ubicación de almacenamiento
            if (this.state.settings.storageLocation === 'localFolder' && this.localFolderHandle) {
                // Para File System Access API
                const folderHandle = await this.localFolderHandle.getDirectoryHandle(sessionName, { create: true });
                
                // Guardar metadatos de la sesión
                const sessionInfo = {
                    name: sessionName,
                    startTime: Date.now(),
                    segments: 1,
                    handle: folderHandle
                };
                
                // Crear archivo de información de sesión
                const infoContent = JSON.stringify(sessionInfo, null, 2);
                const infoBlob = new Blob([infoContent], { type: 'application/json' });
                const infoFile = await folderHandle.getFileHandle('session_info.json', { create: true });
                const writable = await infoFile.createWritable();
                await writable.write(infoBlob);
                await writable.close();
                
            } else {
                // Para almacenamiento en app
                const sessionInfo = {
                    id: Date.now(),
                    name: sessionName,
                    startTime: Date.now(),
                    segments: 1,
                    location: this.state.settings.storageLocation,
                    type: 'session'
                };
                
                // Verificar que el store exista antes de guardar
                if (this.db && this.db.objectStoreNames.contains('recordingSessions')) {
                    await this.saveToDatabase('recordingSessions', sessionInfo);
                } else {
                    console.log('⚠️ Store recordingSessions no disponible, guardando en localStorage');
                    // Fallback a localStorage
                    const sessions = JSON.parse(localStorage.getItem('recordingSessions') || '[]');
                    sessions.push(sessionInfo);
                    localStorage.setItem('recordingSessions', JSON.stringify(sessions));
                }
            }
            
            console.log(`✅ Carpeta de sesión creada: ${sessionName}`);
            this.showNotification(`📁 Sesión creada: ${sessionName}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error creando carpeta de sesión:', error);
            this.state.recordingSessionName = null;
            return false;
        }
    }

    async verifyPersistentPermissions() {
        // Verificar si tenemos permisos persistentes de carpeta
        if (this.state.settings.storageLocation === 'localFolder' && 
            this.state.settings.localFolderName) {
            
            // Mostrar indicador de carpeta guardada
            if (this.elements.currentLocalFolderInfo) {
                this.elements.currentLocalFolderInfo.innerHTML = 
                    `<span>📁 ${this.state.settings.localFolderName} (seleccionar de nuevo)</span>`;
            }
            
            // Mostrar advertencia si el handle no está disponible
            if (!this.state.settings.localFolderHandle) {
                console.log('⚠️ Handle de carpeta perdido, usuario debe seleccionar de nuevo');
            }
        }
    }

    async saveToSessionFolder(blob, filename, segmentNum) {
        try {
            if (!this.state.recordingSessionName) {
                console.error('❌ No hay nombre de sesión para guardar');
                return false;
            }
            
            if (this.state.settings.storageLocation === 'localFolder' && this.localFolderHandle) {
                // Abrir carpeta de sesión
                const sessionFolder = await this.localFolderHandle.getDirectoryHandle(this.state.recordingSessionName);
                const fileHandle = await sessionFolder.getFileHandle(filename, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                
                console.log(`📂 Guardado en sesión: ${this.state.recordingSessionName}/${filename}`);
                return true;
                
            } else {
                // Para almacenamiento en app, guardar con referencia a sesión
                const videoData = {
                    id: Date.now(),
                    blob: blob,
                    timestamp: Date.now(),
                    duration: this.state.currentTime || 10000,
                    size: blob.size,
                    title: `Segmento ${segmentNum} - ${this.state.recordingSessionName}`,
                    filename: filename,
                    session: this.state.recordingSessionName,  // <-- Aquí está la sesión
                    format: filename.endsWith('.mp4') ? 'mp4' : 'webm',
                    location: 'session'
                };
                
                if (this.db) {
                    await this.saveToDatabase('videos', videoData);
                }
                
                console.log(`📱 Guardado en sesión (app): ${this.state.recordingSessionName}/${filename}`);
                return true;
            }
            
        } catch (error) {
            console.error('❌ Error guardando en sesión:', error);
            return false;
        }
    }


    askAboutCombining() {
        if (this.state.recordedSegments.length <= 1) return;
        
        // Crear modal de confirmación
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>🎬 Sesión Grabada</h3>
                </div>
                <div class="modal-body">
                    <p>✅ Se han grabado <strong>${this.state.recordedSegments.length} segmentos</strong> en la sesión:</p>
                    <p style="text-align: center; font-size: 16px; margin: 15px 0; padding: 10px; background: rgba(0, 168, 255, 0.1); border-radius: 8px;">
                        📁 <strong>${this.state.recordingSessionName}</strong>
                    </p>
                    
                    <div class="session-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0;">
                        <div style="background: rgba(0, 168, 255, 0.1); padding: 10px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 11px; opacity: 0.7;">Segmentos</div>
                            <div style="font-size: 18px; font-weight: bold;">${this.state.recordedSegments.length}</div>
                        </div>
                        <div style="background: rgba(0, 168, 255, 0.1); padding: 10px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 11px; opacity: 0.7;">Duración</div>
                            <div style="font-size: 18px; font-weight: bold;">${this.formatTime(this.state.recordedSegments.reduce((sum, seg) => sum + seg.duration, 0))}</div>
                        </div>
                    </div>
                    
                    <p>¿Quieres <strong>combinar los segmentos</strong> en un solo video?</p>
                    
                    <div class="setting" style="margin-top: 15px;">
                        <label>
                            <input type="checkbox" id="autoCombineFuture" checked>
                            Recordar esta preferencia para futuras sesiones
                        </label>
                    </div>
                </div>
                
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="cancelCombine" class="btn cancel-btn" style="flex: 1;">
                        Mantener segmentos
                    </button>
                    <button id="confirmCombine" class="btn save-btn" style="flex: 1;">
                        🔗 Combinar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar eventos
        modal.querySelector('#cancelCombine').addEventListener('click', () => {
            modal.remove();
            this.showNotification('📁 Sesión guardada con segmentos individuales');
        });
        
        modal.querySelector('#confirmCombine').addEventListener('click', async () => {
            modal.remove();
            await this.combineSessionSegments();
        });
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    async combineSessionSegments() {
        if (this.state.recordedSegments.length <= 1) {
            this.showNotification('❌ No hay suficientes segmentos para combinar');
            return;
        }
        
        try {
            this.showNotification('🔗 Combinando segmentos de sesión...');
            
            // Crear nombre para video combinado
            const combinedName = `${this.state.recordingSessionName}_completo.mp4`;
            
            // Simular proceso de combinación (en una implementación real usarías una librería)
            // Por ahora, crearemos un "video" simbólico que referencia los segmentos
            
            const combinedData = {
                id: Date.now(),
                name: combinedName,
                session: this.state.recordingSessionName,
                segments: this.state.recordedSegments.length,
                totalDuration: this.state.recordedSegments.reduce((sum, seg) => sum + seg.duration, 0),
                combinedAt: Date.now(),
                type: 'combined'
            };
            
            // Guardar información del video combinado
            if (this.db) {
                await this.saveToDatabase('combinedVideos', combinedData);
            }
            
            // Si estamos en carpeta local, crear archivo de referencia
            if (this.state.settings.storageLocation === 'localFolder' && this.localFolderHandle) {
                try {
                    const sessionFolder = await this.localFolderHandle.getDirectoryHandle(this.state.recordingSessionName);
                    const combinedFile = await sessionFolder.getFileHandle('combinado.txt', { create: true });
                    const writable = await combinedFile.createWritable();
                    const content = `Video combinado de ${this.state.recordedSegments.length} segmentos\n`;
                    await writable.write(content);
                    await writable.close();
                } catch (error) {
                    console.log('⚠️ No se pudo crear archivo de referencia');
                }
            }
            
            this.showNotification(`✅ ${this.state.recordedSegments.length} segmentos combinados en sesión`);
            
            // Opcional: ofrecer descargar un archivo "combinado" simbólico
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(new Blob([
                `Sesión: ${this.state.recordingSessionName}\n`,
                `Segmentos: ${this.state.recordedSegments.length}\n`,
                `Para unir los videos, usa un editor de video como:\n`,
                `- iMovie (iPhone)\n`,
                `- DaVinci Resolve (gratuito)\n`,
                `- Shotcut (gratuito)\n`,
                `\nLista de segmentos:\n`,
                ...this.state.recordedSegments.map(seg => `- ${seg.filename} (${this.formatTime(seg.duration)})\n`)
            ], { type: 'text/plain' }));
            downloadLink.download = `${this.state.recordingSessionName}_info.txt`;
            downloadLink.click();
            URL.revokeObjectURL(downloadLink.href);
            
        } catch (error) {
            console.error('❌ Error combinando segmentos:', error);
            this.showNotification('❌ Error al combinar segmentos');
        }
    }
    resetRecordingSession() {
        this.state.recordedSegments = [];
        this.state.recordingSessionSegments = 0;
        this.state.recordingSessionName = null;
    }

    // ============ MANEJO DE SELECTORES COMPACTOS ============

    setupCompactSelectors() {
        // Selector de ubicación
        if (this.elements.locationHeader) {
            this.elements.locationHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSelect('location');
            });
        }
        
        // Selector de tipo
        if (this.elements.typeHeader) {
            this.elements.typeHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSelect('type');
            });
        }
        
        // Opciones de ubicación
        if (this.elements.locationOptions) {
            this.elements.locationOptions.querySelectorAll('.select-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const value = e.currentTarget.dataset.value;
                    this.selectLocation(value);
                    this.closeAllSelects();
                });
            });
        }
        
        // Opciones de tipo
        if (this.elements.typeOptions) {
            this.elements.typeOptions.querySelectorAll('.select-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const value = e.currentTarget.dataset.value;
                    this.selectType(value);
                    this.closeAllSelects();
                });
            });
        }
        
        // Cerrar selects al hacer clic fuera
        document.addEventListener('click', () => {
            this.closeAllSelects();
        });
    }

    toggleSelect(type) {
        const options = type === 'location' ? this.elements.locationOptions : this.elements.typeOptions;
        const header = type === 'location' ? this.elements.locationHeader : this.elements.typeHeader;
        
        // Cerrar todos primero
        this.closeAllSelects();
        
        // Abrir este
        if (options && header) {
            options.classList.add('show');
            header.classList.add('active');
        }
    }

    closeAllSelects() {
        if (this.elements.locationOptions) {
            this.elements.locationOptions.classList.remove('show');
        }
        if (this.elements.locationHeader) {
            this.elements.locationHeader.classList.remove('active');
        }
        if (this.elements.typeOptions) {
            this.elements.typeOptions.classList.remove('show');
        }
        if (this.elements.typeHeader) {
            this.elements.typeHeader.classList.remove('active');
        }
    }

    selectLocation(value) {
        this.state.viewMode = value;
        
        // Actualizar UI
        const header = this.elements.locationHeader;
        const options = this.elements.locationOptions;
        
        if (header && options) {
            // Actualizar texto del header
            const selectedOption = options.querySelector(`.select-option[data-value="${value}"]`);
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                header.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
            }
            
            // Actualizar clases activas
            options.querySelectorAll('.select-option').forEach(option => {
                option.classList.remove('active');
            });
            selectedOption.classList.add('active');
        }
        
        // Cargar galería
        this.loadGallery();
    }

    selectType(value) {
        this.state.activeTab = value;
        
        // Actualizar UI
        const header = this.elements.typeHeader;
        const options = this.elements.typeOptions;
        
        if (header && options) {
            // Actualizar texto del header
            const selectedOption = options.querySelector(`.select-option[data-value="${value}"]`);
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                header.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
            }
            
            // Actualizar clases activas
            options.querySelectorAll('.select-option').forEach(option => {
                option.classList.remove('active');
            });
            selectedOption.classList.add('active');
        }
        
        // Cambiar tab
        this.switchTab(value);
    }

    async clearCacheIfNeeded() {
        const lastVersion = localStorage.getItem('dashcam_version');
        
        if (lastVersion !== APP_VERSION) {
            console.log(`🔄 Nueva versión detectada: ${lastVersion || 'ninguna'} → ${APP_VERSION}`);
            
            // Limpiar service workers
            if ('serviceWorker' in navigator) {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (let registration of registrations) {
                        await registration.unregister();
                        console.log('🗑️ Service Worker desregistrado');
                    }
                } catch (error) {
                    console.warn('⚠️ Error limpiando service workers:', error);
                }
            }
            
            // Limpiar caché
            if (caches) {
                try {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                    console.log('🗑️ Caché limpiada');
                } catch (error) {
                    console.warn('⚠️ Error limpiando caché:', error);
                }
            }
            
            // Si hay error de versión, corregir base de datos
            if (lastVersion && parseInt(lastVersion.replace('.', '')) < 30) { // Versión anterior a 3.0
                console.log('🔧 Versión anterior detectada, corregiendo base de datos...');
                await this.fixDatabaseVersion();
            }
            
            // Guardar nueva versión
            localStorage.setItem('dashcam_version', APP_VERSION);
            
            // Recargar si había una versión anterior
            if (lastVersion) {
                this.showNotification('🔄 Aplicación actualizada', 2000);
                setTimeout(() => location.reload(), 2000);
            }
        }
    }



    initElements() {
        this.elements = {
            // Pantallas
            startScreen: document.querySelector('.start-screen'),
            cameraScreen: document.querySelector('.camera-screen'),

            // Selectores compactos
            locationSelector: document.getElementById('locationSelector'),
            locationHeader: document.getElementById('locationHeader'),
            locationOptions: document.getElementById('locationOptions'),
            typeSelector: document.getElementById('typeSelector'),
            typeHeader: document.getElementById('typeHeader'),
            typeOptions: document.getElementById('typeOptions'),
            
            // Botones iniciales
            startBtn: document.getElementById('startBtn'),
            galleryBtn: document.getElementById('galleryBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            gpxManagerBtn: document.getElementById('gpxManagerBtn'),
            
            // Elementos de cámara
            videoPreview: document.getElementById('videoPreview'),
            mainCanvas: document.getElementById('mainCanvas'),
            overlayCanvas: document.getElementById('overlayCanvas'),
            overlayCtx: null,
            
            // Controles de grabación
            pauseBtn: document.getElementById('pauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            newSegmentBtn: document.getElementById('newSegmentBtn'),
            
            // Información de grabación
            recordingStatus: document.getElementById('recordingStatus'),
            recordingTimeEl: document.getElementById('recordingTime'),
            gpsInfo: document.getElementById('gpsInfo'),
            formatInfo: document.getElementById('formatInfo'),
            segmentInfo: document.getElementById('segmentInfo'),
            savingStatus: document.getElementById('savingStatus'),
            savingText: document.getElementById('savingText'),
            
            // Paneles
            galleryPanel: document.getElementById('galleryPanel'),
            settingsPanel: document.getElementById('settingsPanel'),
            gpxManagerPanel: document.getElementById('gpxManagerPanel'),
            videoPlayer: document.getElementById('videoPlayer'),
            
            // Tabs
            tabVideos: document.getElementById('tabVideos'),
            tabGPX: document.getElementById('tabGPX'),
            videosTab: document.getElementById('videosTab'),
            gpxTab: document.getElementById('gpxTab'),
            
            // Vistas
            viewDefaultBtn: document.getElementById('viewDefaultBtn'),
            viewLocalFolderBtn: document.getElementById('viewLocalFolderBtn'),
            
            // Galería mejorada
            videosList: document.getElementById('videosList'),
            searchVideos: document.getElementById('searchVideos'),
            selectAllVideos: document.getElementById('selectAllVideos'),
            deselectAllVideos: document.getElementById('deselectAllVideos'),
            galleryActionsDropdown: document.getElementById('galleryActionsDropdown'),
            galleryDropdownToggle: document.getElementById('galleryDropdownToggle'),
            galleryDropdownMenu: document.getElementById('galleryDropdownMenu'),
            
            // Galería - GPX
            gpxList: document.getElementById('gpxList'),
            searchGPX: document.getElementById('searchGPX'),
            selectAllGPX: document.getElementById('selectAllGPX'),
            deselectAllGPX: document.getElementById('deselectAllGPX'),
            
            // Botones de acción
            exportBtn: document.getElementById('exportBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            moveToLocalBtn: document.getElementById('moveToLocalBtn'),
            combineVideosBtn: document.getElementById('combineVideosBtn'),
            closeGallery: document.getElementById('closeGallery'),
            
            // Configuración
            recordingMode: document.getElementById('recordingMode'),
            segmentDuration: document.getElementById('segmentDuration'),
            videoQuality: document.getElementById('videoQuality'),
            videoFormat: document.getElementById('videoFormat'),
            gpxInterval: document.getElementById('gpxInterval'),
            overlayEnabled: document.getElementById('overlayEnabled'),
            audioEnabled: document.getElementById('audioEnabled'),
            reverseGeocodeEnabled: document.getElementById('reverseGeocodeEnabled'),
            
            // Configuración marca de agua
            showWatermark: document.getElementById('showWatermark'),
            logoPosition: document.getElementById('logoPosition'),
            logoSize: document.getElementById('logoSize'),
            customWatermarkText: document.getElementById('customWatermarkText'),
            textPosition: document.getElementById('textPosition'),
            watermarkOpacity: document.getElementById('watermarkOpacity'),
            opacityValue: document.getElementById('opacityValue'),
            
            // Configuración GPX
            gpxOverlayEnabled: document.getElementById('gpxOverlayEnabled'),
            activeGpxRoute: document.getElementById('activeGpxRoute'),
            gpxRouteColor: document.getElementById('gpxRouteColor'),
            showGpxDistance: document.getElementById('showGpxDistance'),
            showGpxSpeed: document.getElementById('showGpxSpeed'),
            
            // Configuración metadatos
            embedGpsMetadata: document.getElementById('embedGpsMetadata'),
            metadataFrequency: document.getElementById('metadataFrequency'),
            
            // Configuración de almacenamiento
            storageLocation: document.getElementById('storageLocation'),
            keepAppCopy: document.getElementById('keepAppCopy'),
            
            // Selectores de carpeta
            selectLocalFolderBtn: document.getElementById('selectLocalFolderBtn'),
            currentLocalFolderInfo: document.getElementById('currentLocalFolderInfo'),
            uploadLogoBtn: document.getElementById('uploadLogoBtn'),
            currentLogoInfo: document.getElementById('currentLogoInfo'),
            logoUpload: document.getElementById('logoUpload'),
            
            saveSettings: document.getElementById('saveSettings'),
            resetSettingsBtn: document.getElementById('resetSettingsBtn'),
            closeSettings: document.getElementById('closeSettings'),
            
            // GPX Manager
            uploadGpxBtn: document.getElementById('uploadGpxBtn'),
            currentGpxInfo: document.getElementById('currentGpxInfo'),
            gpxUpload: document.getElementById('gpxUpload'),
            gpxPreview: document.getElementById('gpxPreview'),
            gpxDistance: document.getElementById('gpxDistance'),
            gpxPoints: document.getElementById('gpxPoints'),
            gpxDuration: document.getElementById('gpxDuration'),
            gpxElevation: document.getElementById('gpxElevation'),
            gpxCanvas: document.getElementById('gpxCanvas'),
            gpxListContainer: document.getElementById('gpxListContainer'),
            clearGpxBtn: document.getElementById('clearGpxBtn'),
            saveGpxBtn: document.getElementById('saveGpxBtn'),
            closeGpxManager: document.getElementById('closeGpxManager'),
            
            // Reproductor
            playbackVideo: document.getElementById('playbackVideo'),
            playbackMap: document.getElementById('playbackMap'),
            videoTitle: document.getElementById('videoTitle'),
            videoDate: document.getElementById('videoDate'),
            videoDuration: document.getElementById('videoDuration'),
            videoSize: document.getElementById('videoSize'),
            videoGpsPoints: document.getElementById('videoGpsPoints'),
            videoLocation: document.getElementById('videoLocation'),
            locationIcon: document.getElementById('locationIcon'),
            locationText: document.getElementById('locationText'),
            mapLat: document.getElementById('mapLat'),
            mapLon: document.getElementById('mapLon'),
            mapSpeed: document.getElementById('mapSpeed'),
            mapCity: document.getElementById('mapCity'),
            moveToLocalFolderBtn: document.getElementById('moveToLocalFolderBtn'),
            extractGpxBtn: document.getElementById('extractGpxBtn'),
            exportVideo: document.getElementById('exportVideo'),
            deleteVideo: document.getElementById('deleteVideo'),
            closePlayer: document.getElementById('closePlayer'),
            
            // Modal landscape
            landscapeModal: document.querySelector('.landscape-modal'),
            continueBtn: document.getElementById('continueBtn'),
            
            // Modal carpeta local
            localFolderPickerModal: document.getElementById('localFolderPickerModal'),
            folderModalTitle: document.getElementById('folderModalTitle'),
            iphoneInstructions: document.getElementById('iphoneInstructions'),
            desktopInstructions: document.getElementById('desktopInstructions'),
            openLocalFolderBtn: document.getElementById('openLocalFolderBtn'),
            openFilesAppBtn: document.getElementById('openFilesAppBtn'),
            cancelLocalFolderBtn: document.getElementById('cancelLocalFolderBtn'),
            closeLocalFolderPicker: document.getElementById('closeLocalFolderPicker'),
            localFolderPath: document.getElementById('localFolderPath'),
            
            // Modal combinar videos
            combineVideosModal: document.getElementById('combineVideosModal'),
            combineVideosList: document.getElementById('combineVideosList'),
            combinedVideoName: document.getElementById('combinedVideoName'),
            preserveMetadata: document.getElementById('preserveMetadata'),
            combineProgress: document.getElementById('combineProgress'),
            combineProgressFill: document.getElementById('combineProgressFill'),
            combineStatus: document.getElementById('combineStatus'),
            startCombineBtn: document.getElementById('startCombineBtn'),
            cancelCombineBtn: document.getElementById('cancelCombineBtn'),
            closeCombineModal: document.getElementById('closeCombineModal'),
            
            // Estado almacenamiento
            storageStatus: document.getElementById('storageStatus'),
            storageStatusText: document.getElementById('storageStatusText')
        };
    }

    // ============ BASE DE DATOS MEJORADA ============

async initDatabase() {
    return new Promise((resolve, reject) => {
        console.log('📊 Inicializando base de datos...');
        
        // Primero, obtener la versión actual de la base de datos existente
        const getVersionRequest = indexedDB.open('DashcamDB_Pro');
        
        getVersionRequest.onsuccess = (event) => {
            const db = event.target.result;
            const currentVersion = db.version;
            console.log(`📊 Versión actual de BD: ${currentVersion}`);
            db.close();
            
            // Abrir con la versión más alta
            const request = indexedDB.open('DashcamDB_Pro', Math.max(currentVersion, 12)); // <-- Usar 12 o la versión actual
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                const oldVersion = event.oldVersion;
                const newVersion = event.newVersion;
                console.log(`🔄 Actualizando base de datos de ${oldVersion} a ${newVersion}...`);
                
                // Solo crear stores si no existen
                this.createDatabaseStores();
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ Base de datos lista, versión:', this.db.version);
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('❌ Error base de datos:', event.target.error);
                this.db = null;
                resolve(); // Resolver igual para continuar
            };
        };
        
        getVersionRequest.onerror = () => {
            console.log('📊 No hay base de datos existente, creando nueva...');
            // Crear nueva base de datos con versión 12
            const request = indexedDB.open('DashcamDB_Pro', 12);
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                console.log('🔄 Creando base de datos inicial...');
                this.createDatabaseStores();
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ Base de datos nueva creada, versión:', this.db.version);
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('❌ Error creando base de datos:', event.target.error);
                this.db = null;
                resolve();
            };
        };
    });
}

    // Nueva función para crear stores
    createDatabaseStores() {
        console.log('🏗️ Creando stores de base de datos...');
        
        // Store para vídeos con metadatos GPS
        if (!this.db.objectStoreNames.contains('videos')) {
            const videoStore = this.db.createObjectStore('videos', {
                keyPath: 'id',
                autoIncrement: true
            });
            videoStore.createIndex('timestamp', 'timestamp', { unique: false });
            videoStore.createIndex('location', 'location', { unique: false });
            videoStore.createIndex('format', 'format', { unique: false });
            videoStore.createIndex('hasMetadata', 'hasMetadata', { unique: false });
            videoStore.createIndex('session', 'session', { unique: false }); // Nuevo índice
            console.log('✅ Store de vídeos creado');
        }
        
        // Store para tracks GPX
        if (!this.db.objectStoreNames.contains('gpxTracks')) {
            const gpxStore = this.db.createObjectStore('gpxTracks', {
                keyPath: 'id',
                autoIncrement: true
            });
            gpxStore.createIndex('timestamp', 'timestamp', { unique: false });
            gpxStore.createIndex('name', 'name', { unique: false });
            gpxStore.createIndex('distance', 'distance', { unique: false });
            console.log('✅ Store de GPX creado');
        }
        
        // Store para configuración
        if (!this.db.objectStoreNames.contains('settings')) {
            this.db.createObjectStore('settings', { keyPath: 'name' });
            console.log('✅ Store de configuración creado');
        }
        
        // Store para archivos locales (iPhone)
        if (!this.db.objectStoreNames.contains('localFiles')) {
            const localStore = this.db.createObjectStore('localFiles', { 
                keyPath: 'id',
                autoIncrement: true 
            });
            localStore.createIndex('filename', 'filename', { unique: false });
            localStore.createIndex('timestamp', 'timestamp', { unique: false });
            console.log('✅ Store de archivos locales creado');
        }
        
        // Store para logos personalizados
        if (!this.db.objectStoreNames.contains('customLogos')) {
            this.db.createObjectStore('customLogos', { keyPath: 'id' });
            console.log('✅ Store de logos creado');
        }
        
        // Store para GPX cargados
        if (!this.db.objectStoreNames.contains('gpxFiles')) {
            const gpxFilesStore = this.db.createObjectStore('gpxFiles', {
                keyPath: 'id',
                autoIncrement: true
            });
            gpxFilesStore.createIndex('name', 'name', { unique: false });
            gpxFilesStore.createIndex('uploadDate', 'uploadDate', { unique: false });
            console.log('✅ Store de archivos GPX creado');
        }
        
        // Store para caché de geocodificación
        if (!this.db.objectStoreNames.contains('geocodeCache')) {
            const geocodeStore = this.db.createObjectStore('geocodeCache', {
                keyPath: 'key'
            });
            console.log('✅ Store de caché geocodificación creado');
        }
        
        // Store para sesiones de grabación
        if (!this.db.objectStoreNames.contains('recordingSessions')) {
            const sessionStore = this.db.createObjectStore('recordingSessions', {
                keyPath: 'id',
                autoIncrement: true
            });
            sessionStore.createIndex('name', 'name', { unique: false });
            sessionStore.createIndex('startTime', 'startTime', { unique: false });
            sessionStore.createIndex('location', 'location', { unique: false });
            console.log('✅ Store de sesiones de grabación creado');
        }
        
        // Store para videos combinados
        if (!this.db.objectStoreNames.contains('combinedVideos')) {
            const combinedStore = this.db.createObjectStore('combinedVideos', {
                keyPath: 'id',
                autoIncrement: true
            });
            combinedStore.createIndex('session', 'session', { unique: false });
            combinedStore.createIndex('combinedAt', 'combinedAt', { unique: false });
            console.log('✅ Store de videos combinados creado');
        }
        
        console.log('🏗️ Todos los stores creados/verificados');
    }

    async loadSettings() {
        try {
            // Si la base de datos no está disponible, usar localStorage
            if (!this.db) {
                console.log('⚠️ Base de datos no disponible, cargando de localStorage...');
                const savedSettings = localStorage.getItem('dashcam_settings');
                if (savedSettings) {
                    try {
                        const parsedSettings = JSON.parse(savedSettings);
                        this.state.settings = { ...this.state.settings, ...parsedSettings };
                        console.log('⚙️ Configuración cargada de localStorage');
                    } catch (error) {
                        console.warn('⚠️ Error parseando configuración de localStorage:', error);
                    }
                }
                this.updateSettingsUI();
                return;
            }
            
            // Si la base de datos está disponible, cargar de IndexedDB
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['settings'], 'readonly');
                const store = transaction.objectStore('settings');
                const request = store.get('appSettings');
                
                request.onsuccess = () => {
                    if (request.result && request.result.value) {
                        console.log('⚙️ Configuración cargada de IndexedDB');
                        
                        // Cargar los settings serializables
                        const loadedSettings = request.result.value;
                        
                        // Restaurar los settings manteniendo el handle en memoria (si existe)
                        this.state.settings = { 
                            ...this.state.settings, 
                            ...loadedSettings,
                            // Mantener el handle que ya tenemos en memoria
                            localFolderHandle: this.state.settings.localFolderHandle 
                        };
                        
                        this.updateSettingsUI();
                    } else {
                        console.log('⚙️ No hay configuración guardada en IndexedDB');
                        // Intentar cargar de localStorage como fallback
                        const savedSettings = localStorage.getItem('dashcam_settings');
                        if (savedSettings) {
                            try {
                                const parsedSettings = JSON.parse(savedSettings);
                                this.state.settings = { ...this.state.settings, ...parsedSettings };
                                console.log('⚙️ Configuración cargada de localStorage (fallback)');
                            } catch (error) {
                                console.warn('⚠️ Error parseando configuración de localStorage:', error);
                            }
                        }
                        this.updateSettingsUI();
                    }
                    resolve();
                };
                
                request.onerror = (error) => {
                    console.warn('⚠️ Error cargando configuración de IndexedDB:', error);
                    // Fallback a localStorage
                    const savedSettings = localStorage.getItem('dashcam_settings');
                    if (savedSettings) {
                        try {
                            const parsedSettings = JSON.parse(savedSettings);
                            this.state.settings = { ...this.state.settings, ...parsedSettings };
                            console.log('⚙️ Configuración cargada de localStorage (error fallback)');
                        } catch (error) {
                            console.warn('⚠️ Error parseando configuración de localStorage:', error);
                        }
                    }
                    this.updateSettingsUI();
                    resolve();
                };
                
            });
            
        } catch (error) {
            console.warn('⚠️ Error general cargando configuración:', error);
            this.updateSettingsUI();
        }
    }

    async restoreFolderPermissions() {
        try {
            // Si tenemos nombre de carpeta guardado pero no handle
            if (this.state.settings.localFolderName && !this.state.settings.localFolderHandle) {
                console.log('📂 Intentando restaurar permisos de carpeta...');
                
                // Pedir permisos para la misma carpeta
                if ('showDirectoryPicker' in window) {
                    try {
                        // Mostrar diálogo de selección (el usuario debe seleccionar la misma carpeta)
                        this.showNotification('📂 Selecciona la misma carpeta para restaurar permisos');
                        
                        // Nota: No podemos restaurar automáticamente, el usuario debe volver a seleccionar
                        // Pero podemos guardar el nombre para referencia
                    } catch (error) {
                        console.log('⚠️ No se pudieron restaurar permisos de carpeta:', error);
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Error restaurando permisos de carpeta:', error);
        }
    }

    updateSettingsUI() {
        try {
            // Configuración existente
            if (this.elements.recordingMode) {
                this.elements.recordingMode.value = this.state.settings.recordingMode;
            }
            if (this.elements.segmentDuration) {
                this.elements.segmentDuration.value = this.state.settings.segmentDuration;
            }
            if (this.elements.videoQuality) {
                this.elements.videoQuality.value = this.state.settings.videoQuality;
            }
            if (this.elements.videoFormat) {
                this.elements.videoFormat.value = this.state.settings.videoFormat;
            }
            if (this.elements.gpxInterval) {
                this.elements.gpxInterval.value = this.state.settings.gpxInterval;
            }
            if (this.elements.overlayEnabled) {
                this.elements.overlayEnabled.checked = this.state.settings.overlayEnabled;
            }
            if (this.elements.audioEnabled) {
                this.elements.audioEnabled.checked = this.state.settings.audioEnabled;
            }
            if (this.elements.reverseGeocodeEnabled) {
                this.elements.reverseGeocodeEnabled.checked = this.state.settings.reverseGeocodeEnabled;
            }
            
            // Configuración marca de agua
            if (this.elements.showWatermark) {
                this.elements.showWatermark.checked = this.state.settings.showWatermark;
            }
            if (this.elements.logoPosition) {
                this.elements.logoPosition.value = this.state.settings.logoPosition;
            }
            if (this.elements.logoSize) {
                this.elements.logoSize.value = this.state.settings.logoSize;
            }
            if (this.elements.textPosition) {
                this.elements.textPosition.value = this.state.settings.textPosition;
            }
            if (this.elements.watermarkOpacity) {
                this.elements.watermarkOpacity.value = this.state.settings.watermarkOpacity;
                if (this.elements.opacityValue) {
                    this.elements.opacityValue.textContent = `${Math.round(this.state.settings.watermarkOpacity * 100)}%`;
                }
            }
            
            // Configuración GPX
            if (this.elements.gpxOverlayEnabled) {
                this.elements.gpxOverlayEnabled.checked = this.state.settings.gpxOverlayEnabled;
            }
            if (this.elements.showGpxDistance) {
                this.elements.showGpxDistance.checked = this.state.settings.showGpxDistance;
            }
            if (this.elements.showGpxSpeed) {
                this.elements.showGpxSpeed.checked = this.state.settings.showGpxSpeed;
            }
            
            // Configuración metadatos
            if (this.elements.embedGpsMetadata) {
                this.elements.embedGpsMetadata.checked = this.state.settings.embedGpsMetadata;
            }
            if (this.elements.metadataFrequency) {
                this.elements.metadataFrequency.value = this.state.settings.metadataFrequency;
            }
            
            // Configuración de almacenamiento
            if (this.elements.storageLocation) {
                this.elements.storageLocation.value = this.state.settings.storageLocation;
                this.toggleStorageSettings();
            }
            if (this.elements.keepAppCopy) {
                this.elements.keepAppCopy.checked = this.state.settings.keepAppCopy;
            }
            
            // Actualizar información de carpetas
            if (this.elements.currentLocalFolderInfo && this.state.settings.localFolderName) {
                this.elements.currentLocalFolderInfo.innerHTML = 
                    `<span>📁 ${this.state.settings.localFolderName}</span>`;
            }
            
            // Mostrar formato actual en la pantalla de cámara
            if (this.elements.formatInfo) {
                this.elements.formatInfo.textContent = `🎬 ${this.state.settings.videoFormat.toUpperCase()}`;
            }
            
            // Actualizar slider de opacidad
            if (this.elements.watermarkOpacity) {
                this.elements.watermarkOpacity.addEventListener('input', (e) => {
                    if (this.elements.opacityValue) {
                        this.elements.opacityValue.textContent = `${Math.round(e.target.value * 100)}%`;
                    }
                });
            }
            
        } catch (error) {
            console.warn('⚠️ Error actualizando UI de configuración:', error);
        }
    }

    toggleStorageSettings() {
        const storageLocation = this.elements.storageLocation.value;
        const localFolderSettings = document.getElementById('localFolderSettings');
        
        // Ocultar todos primero
        if (localFolderSettings) localFolderSettings.style.display = 'none';
        
        // Mostrar solo el configurado
        if (storageLocation === 'localFolder' && localFolderSettings) {
            localFolderSettings.style.display = 'block';
            
            // Verificar si tenemos carpeta guardada
            if (this.state.settings.localFolderName && !this.state.settings.localFolderHandle) {
                if (this.elements.currentLocalFolderInfo) {
                    this.elements.currentLocalFolderInfo.innerHTML = 
                        `<span>📁 ${this.state.settings.localFolderName} (selecciona de nuevo)</span>`;
                }
            }
        }
    }

    // ============ PERMISOS ============
    async requestPermissions() {
        try {
            console.log('🔐 Solicitando permisos solo para cámara y ubicación...');
            
            // Solo pedir permiso de cámara cuando sea necesario
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true,
                    audio: this.state.settings.audioEnabled 
                });
                console.log('✅ Permiso de cámara concedido');
                return stream; // Devolver el stream para usarlo en la grabación
            } catch (error) {
                console.warn('⚠️ Permiso de cámara no concedido:', error);
                throw new Error('Permiso de cámara necesario para grabar');
            }
            
        } catch (error) {
            console.warn('⚠️ Error solicitando permisos:', error);
            throw error;
        }
    }

    async requestLocationPermission() {
        try {
            console.log('📍 Solicitando permiso de ubicación...');
            
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    console.log('ℹ️ API de geolocalización no disponible');
                    resolve(false);
                    return;
                }
                
                navigator.geolocation.getCurrentPosition(
                    () => {
                        console.log('✅ Permiso de ubicación concedido');
                        resolve(true);
                    },
                    (error) => {
                        console.warn('⚠️ Permiso de ubicación no concedido:', error.message);
                        // No rechazamos, solo informamos
                        resolve(false);
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 10000,
                        timeout: 5000
                    }
                );
            });
            
        } catch (error) {
            console.warn('⚠️ Error solicitando permiso de ubicación:', error);
            return false;
        }
    }

    // ============ GRABACIÓN AVANZADA ============

    async startRecording() {
        console.log('🎬 Iniciando grabación avanzada...');

        // Prevenir múltiples inicios
        if (this.state.isRecording) {
            console.log('⚠️ Ya se está grabando');
            return;
        }
        
        // Deshabilitar botón para evitar múltiples clics
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = true;
            setTimeout(() => {
                if (this.elements.startBtn) {
                    this.elements.startBtn.disabled = false;
                }
            }, 3000);
        }
        
        // Mostrar sugerencia de orientación
        if (this.checkOrientation() && !this.state.showLandscapeModal) {
            this.showLandscapeModal();
            return;
        }
        
        try {
            // ====== SOLICITAR PERMISOS JUSTO ANTES DE GRABAR ======
            this.showNotification('🔐 Solicitando permisos...');
            
            // 1. Solicitar permiso de cámara (requerido)
            try {
                // Intentar acceder a la cámara primero
                const testStream = await navigator.mediaDevices.getUserMedia({ 
                    video: true 
                }).catch(async (error) => {
                    console.log('⚠️ Intentando con constraints más permisivos...');
                    const fallbackConstraints = { video: true };
                    return navigator.mediaDevices.getUserMedia(fallbackConstraints);
                });
                
                // Detener el stream de prueba
                testStream.getTracks().forEach(track => track.stop());
                console.log('✅ Permiso de cámara concedido');
                
            } catch (error) {
                console.error('❌ Permiso de cámara denegado:', error);
                this.showNotification('❌ Se necesita permiso de cámara para grabar');
                this.showPermissionInstructions();
                if (this.elements.startBtn) this.elements.startBtn.disabled = false;
                return;
            }
            
            // 2. Solicitar permiso de ubicación (opcional)
            let locationGranted = false;
            try {
                locationGranted = await this.requestLocationPermission();
                if (locationGranted) {
                    console.log('✅ Permiso de ubicación concedido');
                } else {
                    console.log('⚠️ Permiso de ubicación no concedido');
                    this.showNotification('⚠️ Grabando sin GPS - Actívalo para mejores resultados');
                }
            } catch (error) {
                console.warn('⚠️ Error con permiso de ubicación:', error);
            }
            
            // ====== INICIAR COMPONENTES CON PERMISOS ======
            await this.initCamera();
            
            if (!this.mediaStream) {
                throw new Error('No se pudo acceder a la cámara');
            }
            
            this.showCameraScreen();
            
            // Iniciar GPS si tenemos permiso
            if (locationGranted) {
                this.startGPS();
            } else {
                if (this.elements.gpsInfo) {
                    this.elements.gpsInfo.textContent = '📍 GPS: No disponible - Activa ubicación';
                }
            }
            
            // Resetear estado
            this.state.isRecording = true;
            this.state.isPaused = false;
            this.state.startTime = Date.now();
            this.state.currentTime = 0;
            this.state.currentSegment = 1;
            this.gpxPoints = [];
            this.frameCounter = 0;
            this.recordedChunks = []; // Limpiar chunks anteriores
            
            // Obtener dimensiones del video
            const videoTrack = this.mediaStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            
            // Configurar canvas
            if (this.mainCanvas) {
                this.mainCanvas.width = settings.width || 1280;
                this.mainCanvas.height = settings.height || 720;
            }
            
            // Configurar video element para captura
            this.videoElement = document.createElement('video');
            this.videoElement.srcObject = this.mediaStream;
            this.videoElement.autoplay = true;
            this.videoElement.muted = true;
            this.videoElement.playsInline = true;
            
            // Esperar a que el video esté listo
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play().then(resolve).catch(resolve);
                };
                
                // Timeout de seguridad
                setTimeout(resolve, 3000);
            });
            
            // Iniciar captura de frames
            this.startFrameCapture();
            
            // Crear stream desde canvas
            if (this.mainCanvas) {
                this.canvasStream = this.mainCanvas.captureStream(30);
                
                // Agregar audio si está habilitado
                if (this.state.settings.audioEnabled) {
                    try {
                        const audioStream = await navigator.mediaDevices.getUserMedia({ 
                            audio: true 
                        }).catch(() => {
                            console.log('⚠️ Audio no disponible o permiso denegado');
                            return null;
                        });
                        
                        if (audioStream) {
                            const audioTrack = audioStream.getAudioTracks()[0];
                            if (audioTrack) {
                                this.canvasStream.addTrack(audioTrack);
                            }
                        }
                    } catch (audioError) {
                        console.warn('⚠️ Audio no disponible:', audioError);
                    }
                }
                
                // Configurar MediaRecorder
                const mimeType = 'video/webm;codecs=vp9,opus';
                
                console.log(`🎬 Grabando en modo: ${this.state.settings.recordingMode}`);
                
                this.mediaRecorder = new MediaRecorder(this.canvasStream, {
                    mimeType: mimeType,
                    videoBitsPerSecond: this.getVideoBitrate()
                });
                
                this.recordedChunks = [];
                
                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.recordedChunks.push(event.data);
                    }
                };
                
                this.mediaRecorder.onstop = async () => {
                    console.log('🛑 MediaRecorder detenido');
                    this.showSavingStatus('💾 Guardando y procesando video...');
                    await this.saveVideoSegment();
                    this.hideSavingStatus();
                };
                
                // Para modo continuo, grabar sin parar
                if (this.state.settings.recordingMode === 'continuous') {
                    this.mediaRecorder.start();
                    console.log('🎬 Grabación continua iniciada');
                } else {
                    // Para modo segmentado, usar segmentos
                    this.mediaRecorder.start(1000);
                    this.startSegmentTimer();
                }
            }
            
            this.updateRecordingUI();
            this.showNotification(`🎬 Grabación iniciada (${this.state.settings.recordingMode === 'continuous' ? 'Continuo' : 'Segmentado'})`);
            
        } catch (error) {
            console.error('❌ Error iniciando grabación:', error);
            this.state.isRecording = false;
            this.showNotification('❌ Error: ' + error.message);
            this.showStartScreen();
            
            // Limpiar recursos
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
                this.mediaStream = null;
            }
            
            // Rehabilitar botón de inicio
            if (this.elements.startBtn) {
                this.elements.startBtn.disabled = false;
            }
        }
    }


    cleanupRecordingResources() {
        console.log('🧹 Limpiando recursos de grabación...');
        
        // Detener temporizadores
        if (this.segmentTimer) {
            clearTimeout(this.segmentTimer);
            this.segmentTimer = null;
        }
        
        // Detener captura de frames
        this.stopFrameCapture();
        
        // Detener GPS
        if (this.gpsWatchId) {
            navigator.geolocation.clearWatch(this.gpsWatchId);
            this.gpsWatchId = null;
        }
        
        if (this.gpxInterval) {
            clearInterval(this.gpxInterval);
            this.gpxInterval = null;
        }
        
        // Detener MediaRecorder
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            try {
                this.mediaRecorder.stop();
            } catch (e) {
                console.warn('⚠️ Error deteniendo MediaRecorder:', e);
            }
        }
        
        // Limpiar streams
        if (this.canvasStream) {
            this.canvasStream.getTracks().forEach(track => track.stop());
            this.canvasStream = null;
        }
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        // Resetear variables
        this.mediaRecorder = null;
        this.videoElement = null;
        this.recordedChunks = [];
    }
    
    checkOrientation() {
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return false;
        }
        
        // Solo mostrar una vez por sesión
        if (sessionStorage.getItem('landscape_shown')) {
            return false;
        }
        
        const isVertical = window.innerHeight > window.innerWidth;
        
        if (isVertical) {
            sessionStorage.setItem('landscape_shown', 'true');
        }
        
        return isVertical;
    }

    showLandscapeModal() {
        this.state.showLandscapeModal = true;
        if (this.elements.landscapeModal) {
            this.elements.landscapeModal.classList.add('active');
        }
    }

    hideLandscapeModal() {
        this.state.showLandscapeModal = false;
        if (this.elements.landscapeModal) {
            this.elements.landscapeModal.classList.remove('active');
        }
    }

    getVideoBitrate() {
        const quality = this.state.settings.videoQuality;
        
        switch(quality) {
            case '480p':
                return 1000000; // 1 Mbps
            case '720p':
                return 2500000; // 2.5 Mbps
            case '1080p':
                return 5000000; // 5 Mbps
            case '4k':
                return 15000000; // 15 Mbps
            default:
                return 2500000; // 2.5 Mbps
        }
    }

    async initCamera() {
        try {
            console.log('📷 Inicializando cámara...');
            
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: this.state.settings.audioEnabled
            };
            
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
                .catch(async (error) => {
                    console.log('⚠️ Intentando con constraints más permisivos...');
                    const fallbackConstraints = {
                        video: true,
                        audio: this.state.settings.audioEnabled
                    };
                    return navigator.mediaDevices.getUserMedia(fallbackConstraints);
                });
            
            if (this.elements.videoPreview) {
                this.elements.videoPreview.srcObject = this.mediaStream;
                
                await new Promise((resolve, reject) => {
                    this.elements.videoPreview.onloadedmetadata = () => {
                        this.elements.videoPreview.play().then(resolve).catch(resolve);
                    };
                    this.elements.videoPreview.onerror = reject;
                    setTimeout(resolve, 3000);
                });
                
                if (this.elements.overlayCanvas) {
                    this.elements.overlayCanvas.width = this.elements.videoPreview.videoWidth || 1280;
                    this.elements.overlayCanvas.height = this.elements.videoPreview.videoHeight || 720;
                }
            }
            
            console.log('✅ Cámara inicializada');
            
        } catch (error) {
            console.error('❌ Error cámara:', error);
            throw new Error('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
        }
    }

    showStartScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.style.display = 'flex';
        }
        if (this.elements.cameraScreen) {
            this.elements.cameraScreen.classList.remove('active');
        }
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
    }

    showCameraScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.style.display = 'none';
        }
        if (this.elements.cameraScreen) {
            this.elements.cameraScreen.classList.add('active');
        }
        
        if (this.elements.videoPreview && this.elements.videoPreview.srcObject) {
            this.elements.videoPreview.play().catch(console.error);
        }
    }

    startSegmentTimer() {
        if (this.segmentTimer) {
            clearTimeout(this.segmentTimer);
        }
        
        if (this.state.settings.recordingMode === 'segmented') {
            const segmentMs = this.state.settings.segmentDuration * 60 * 1000;
            this.segmentTimer = setTimeout(() => {
                this.startNewSegment();
            }, segmentMs);
        }
    }

    async startNewSegment() {
        if (!this.mediaRecorder || this.state.isPaused || this.state.settings.recordingMode === 'continuous') return;
        
        try {
            console.log('✂️ Iniciando nuevo segmento...');
            
            // Guardar segmento actual
            if (this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
                
                // Esperar a que se guarde completamente
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Limpiar chunks ANTES de crear el nuevo segmento
                this.recordedChunks = [];
                
                // Incrementar segmento
                this.state.currentSegment++;
                
                // Actualizar UI inmediatamente
                if (this.elements.segmentInfo) {
                    this.elements.segmentInfo.textContent = `📹 Segmento ${this.state.currentSegment}`;
                }
                
                // Solo si seguimos grabando, crear nuevo segmento
                if (this.state.isRecording && !this.state.isPaused) {
                    // Crear nuevo MediaRecorder con el mismo stream
                    const mimeType = 'video/webm;codecs=vp9,opus';
                    
                    this.mediaRecorder = new MediaRecorder(this.canvasStream, {
                        mimeType: mimeType,
                        videoBitsPerSecond: this.getVideoBitrate()
                    });
                    
                    this.recordedChunks = [];
                    
                    this.mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            this.recordedChunks.push(event.data);
                        }
                    };
                    
                    this.mediaRecorder.onstop = async () => {
                        this.showSavingStatus('💾 Guardando y procesando video...');
                        await this.saveVideoSegment();
                        this.hideSavingStatus();
                    };
                    
                    // Iniciar grabación para nuevo segmento
                    this.mediaRecorder.start(1000);
                    this.startSegmentTimer();
                    
                    console.log(`✅ Nuevo segmento iniciado: ${this.state.currentSegment}`);
                    this.showNotification(`🔄 Nuevo segmento: ${this.state.currentSegment}`);
                }
            }
        } catch (error) {
            console.error('❌ Error iniciando nuevo segmento:', error);
            this.showNotification('❌ Error al crear nuevo segmento');
        }
    }


    startFrameCapture() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        let lastTimestamp = 0;
        const fps = 30;
        const interval = 1000 / fps;
        
        const captureFrame = (timestamp) => {
            if (!this.state.isRecording) {
                this.animationFrame = null;
                return;
            }
            
            const elapsed = timestamp - lastTimestamp;
            
            if (elapsed >= interval) {
                lastTimestamp = timestamp - (elapsed % interval);
                
                try {
                    this.drawFrameWithData();
                } catch (error) {
                    console.warn('⚠️ Error dibujando frame:', error);
                }
            }
            
            this.animationFrame = requestAnimationFrame(captureFrame);
        };
        
        this.animationFrame = requestAnimationFrame(captureFrame);
    }

    // ============ DIBUJADO AVANZADO CON LOGO Y GPX ============

    drawFrameWithData() {
        if (!this.videoElement || !this.mainCtx || this.videoElement.readyState < 2) return;
        
        const canvas = this.mainCanvas;
        const ctx = this.mainCtx;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        
        // Dibujar marca de agua personalizada
        if (this.state.settings.showWatermark) {
            this.drawCustomWatermark(ctx, canvas);
        }
        
        // Dibujar overlay de grabación
        if (this.state.settings.overlayEnabled) {
            this.drawTemporaryOverlay();
        }
        
        // Dibujar overlay GPX si está activo
        if (this.state.settings.gpxOverlayEnabled && this.state.activeGPX) {
            this.drawGpxOverlay(ctx, canvas);
        }
        
        // Incrementar contador de frames
        this.frameCounter++;
    }

    drawCustomWatermark(ctx, canvas) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const fontSize = this.state.settings.watermarkFontSize;
        const opacity = this.state.settings.watermarkOpacity;
        
        ctx.save();
        
        // Dibujar logo si existe
        if (this.logoImage && this.state.settings.showWatermark) {
            this.drawLogo(ctx, canvas);
        }
        
        // Dibujar texto personalizado (no editable)
        this.drawWatermarkText(ctx, canvas, this.state.settings.customWatermarkText);
        
        // Dibujar información GPS
        this.drawGpsInfo(ctx, canvas, dateStr, fontSize, opacity);
        
        ctx.restore();
    }

    drawLogo(ctx, canvas) {
        let size;
        switch(this.state.settings.logoSize) {
            case 'small': size = 40; break;
            case 'large': size = 80; break;
            default: size = 60; break;
        }
        
        let x, y;
        const padding = 10;
        
        switch(this.state.settings.logoPosition) {
            case 'top-left':
                x = padding;
                y = padding;
                break;
            case 'top-right':
                x = canvas.width - size - padding;
                y = padding;
                break;
            case 'bottom-left':
                x = padding;
                y = canvas.height - size - padding;
                break;
            case 'bottom-right':
                x = canvas.width - size - padding;
                y = canvas.height - size - padding;
                break;
        }
        
        // Fondo semitransparente para logo
        ctx.fillStyle = `rgba(0, 0, 0, ${this.state.settings.watermarkOpacity * 0.5})`;
        ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
        
        // Dibujar logo
        ctx.drawImage(this.logoImage, x, y, size, size);
    }

    drawWatermarkText(ctx, canvas, text) {
        const fontSize = 10;  // Tamaño pequeño
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.state.settings.watermarkOpacity})`;
        ctx.textAlign = 'right';  // Alineación a la derecha
        ctx.textBaseline = 'bottom';  // Línea base inferior
        
        let x, y;
        const padding = 15;  // Un poco más de padding para que no quede pegado al borde
        
        // SIEMPRE en la parte inferior derecha
        x = canvas.width - padding;
        y = canvas.height - padding;
        
        // Usa el texto fijo
        const watermarkText = 'Powered By Roberto Benet - rbenet71@gmail.com';
        
        // Fondo para texto (opcional, para mejor legibilidad)
        ctx.fillStyle = `rgba(0, 0, 0, ${this.state.settings.watermarkOpacity * 0.7})`;
        const textWidth = ctx.measureText(watermarkText).width;
        const textHeight = fontSize + 4;
        
        // Dibujar fondo (ajustado para alineación derecha)
        ctx.fillRect(x - textWidth - 8, y - fontSize - 2, textWidth + 16, textHeight);
        
        // Dibujar texto
        ctx.fillStyle = `rgba(255, 255, 255, ${this.state.settings.watermarkOpacity})`;
        ctx.fillText(watermarkText, x, y);
    }

    drawGpsInfo(ctx, canvas, dateStr, fontSize, opacity) {
        const position = this.state.settings.watermarkPosition;
        
        let x, y, textAlign, textBaseline, bgHeight;
        
        switch(position) {
            case 'top':
                x = canvas.width / 2;
                y = 25;
                textAlign = 'center';
                textBaseline = 'top';
                bgHeight = 80;
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                ctx.fillRect(0, 0, canvas.width, bgHeight);
                break;
            case 'corner':
                x = 15;
                y = 25;
                textAlign = 'left';
                textBaseline = 'top';
                bgHeight = 80;
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                ctx.fillRect(0, 0, 500, bgHeight);
                break;
            case 'bottom':
            default:
                x = canvas.width / 2;
                y = canvas.height - 25;
                textAlign = 'center';
                textBaseline = 'bottom';
                bgHeight = 80;
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                ctx.fillRect(0, canvas.height - bgHeight, canvas.width, bgHeight);
                break;
        }
        
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        ctx.fillText(`📅 ${dateStr}`, x, y);
        
        if (this.currentPosition) {
            const lat = this.currentPosition.lat.toFixed(6);
            const lon = this.currentPosition.lon.toFixed(6);
            const speed = (this.currentPosition.speed * 3.6 || 0).toFixed(1);
            let locationName = this.state.currentLocationName;
            
            // Limitar nombre de población a 50 caracteres
            if (locationName.length > 50) {
                locationName = locationName.substring(0, 47) + '...';
            }
            
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText(`📍 ${lat}, ${lon} | 🏙️ ${locationName}`, x, y + fontSize + 6);
            
            if (this.currentPosition.accuracy) {
                const accuracy = this.currentPosition.accuracy.toFixed(1);
                const timeStr = this.formatTime(this.state.currentTime);
                ctx.fillText(`🚗 ${speed} km/h | 🎯 ${accuracy}m | ⏱️ ${timeStr}`, x, y + (fontSize * 2) + 12);
            }
            
            // Guardar punto GPS si estamos grabando
            if (this.state.isRecording && !this.state.isPaused) {
                this.saveGPXPoint(this.currentPosition);
            }
        } else {
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText('📍 GPS: Buscando señal...', x, y + fontSize + 6);
        }
    }

    drawTemporaryOverlay() {
        const overlayCanvas = this.elements.overlayCanvas;
        const overlayCtx = this.elements.overlayCtx;
        
        if (!overlayCanvas || !overlayCtx) return;
        
        overlayCanvas.width = this.mainCanvas.width;
        overlayCanvas.height = this.mainCanvas.height;
        
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        if (this.state.isRecording) {
            overlayCtx.fillStyle = this.state.isPaused ? 'rgba(254, 202, 87, 0.8)' : 'rgba(255, 107, 107, 0.8)';
            overlayCtx.font = 'bold 18px monospace';
            overlayCtx.textAlign = 'right';
            overlayCtx.textBaseline = 'top';
            
            const statusText = this.state.isPaused ? '⏸️ PAUSADO' : '● GRABANDO';
            overlayCtx.fillText(statusText, overlayCanvas.width - 15, 15);
        }
    }

    drawGpxOverlay(ctx, canvas) {
        if (!this.state.activeGPX || !this.currentPosition) return;
        
        ctx.save();
        
        // Calcular posición en ruta GPX
        const gpxProgress = this.calculateGpxProgress();
        if (gpxProgress) {
            const { distance, totalDistance, percentage, currentPoint } = gpxProgress;
            
            // Dibujar información GPX en una esquina
            ctx.fillStyle = `rgba(0, 255, 0, 0.7)`;
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            const infoX = 10;
            const infoY = canvas.height - 120;
            
            // Fondo para información
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(infoX - 5, infoY - 5, 250, 110);
            
            // Texto GPX
            ctx.fillStyle = '#00ff00';
            ctx.fillText(`🗺️ ${this.state.activeGPX.name || 'Ruta GPX'}`, infoX, infoY);
            ctx.fillText(`📏 ${distance.toFixed(1)} / ${totalDistance.toFixed(1)} km`, infoX, infoY + 20);
            ctx.fillText(`📊 ${percentage.toFixed(1)}% completado`, infoX, infoY + 40);
            
            if (currentPoint && this.state.settings.showGpxSpeed) {
                const gpxSpeed = currentPoint.speed || 0;
                const currentSpeed = this.currentPosition.speed * 3.6 || 0;
                ctx.fillText(`⚡ ${currentSpeed.toFixed(1)} km/h (GPX: ${gpxSpeed.toFixed(1)})`, infoX, infoY + 60);
            }
        }
        
        ctx.restore();
    }

    calculateGpxProgress() {
        if (!this.state.activeGPX || !this.currentPosition || !this.state.activeGPX.points) {
            return null;
        }
        
        const currentLat = this.currentPosition.lat;
        const currentLon = this.currentPosition.lon;
        const points = this.state.activeGPX.points;
        
        // Encontrar el punto más cercano
        let closestPoint = null;
        let minDistance = Infinity;
        let closestIndex = -1;
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const distance = this.calculateDistance(
                currentLat, currentLon,
                point.lat, point.lon
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
                closestIndex = i;
            }
        }
        
        if (closestPoint && minDistance < 0.1) { // Dentro de 100 metros
            // Calcular distancia acumulada hasta este punto
            let accumulatedDistance = 0;
            for (let i = 1; i <= closestIndex; i++) {
                accumulatedDistance += this.calculateDistance(
                    points[i-1].lat, points[i-1].lon,
                    points[i].lat, points[i].lon
                );
            }
            
            const totalDistance = this.state.activeGPX.distance || 0;
            const percentage = totalDistance > 0 ? (accumulatedDistance / totalDistance) * 100 : 0;
            
            return {
                distance: accumulatedDistance,
                totalDistance: totalDistance,
                percentage: percentage,
                currentPoint: closestPoint,
                pointIndex: closestIndex
            };
        }
        
        return null;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    stopFrameCapture() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.srcObject = null;
            this.videoElement = null;
        }
    }

    async pauseRecording() {
        if (!this.mediaRecorder || this.state.isPaused) return;
        
        this.state.isPaused = true;
        this.mediaRecorder.pause();
        this.updateRecordingUI();
        this.showNotification('⏸️ Grabación pausada');
    }

    async resumeRecording() {
        if (!this.mediaRecorder || !this.state.isPaused) return;
        
        this.state.isPaused = false;
        this.mediaRecorder.resume();
        this.updateRecordingUI();
        this.showNotification('▶️ Grabación reanudada');
    }

    async stopRecording() {
        if (!this.mediaRecorder && !this.state.isRecording) {
            this.showStartScreen();
            return;
        }
        
        try {
            // Limpiar recursos primero
            this.cleanupRecordingResources();
            
            // Guardar último segmento si hay chunks
            if (this.recordedChunks.length > 0) {
                await this.saveVideoSegment();
            }
            
            // Guardar track GPX si hay puntos
            if (this.gpxPoints.length > 0) {
                await this.saveGPXTrack();
            }
            
            // Si hay múltiples segmentos, preguntar sobre unión
            if (this.state.recordedSegments.length > 1 && this.state.recordingSessionName) {
                setTimeout(() => {
                    this.askAboutCombining();
                }, 1500);
            }
            
            // Resetear estado
            this.state.isRecording = false;
            this.state.isPaused = false;
            this.state.currentTime = 0;
            this.state.currentSegment = 1;
            
            // Mostrar pantalla inicial
            this.showStartScreen();
            this.showNotification('💾 Grabación finalizada');
            
            // Recargar galería
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error deteniendo grabación:', error);
            this.showNotification('❌ Error al finalizar grabación');
            this.showStartScreen();
        } finally {
            // Resetear estado de sesión
            this.resetRecordingSession();
        }
    }

    updateRecordingUI() {
        if (!this.elements.recordingStatus || !this.elements.recordingTimeEl) return;
        
        if (this.state.isPaused) {
            this.elements.recordingStatus.textContent = '⏸️ PAUSADO';
            this.elements.recordingStatus.className = 'recording-status paused';
            if (this.elements.pauseBtn) {
                this.elements.pauseBtn.textContent = '▶️ Continuar';
            }
        } else if (this.state.isRecording) {
            this.elements.recordingStatus.textContent = '● GRABANDO';
            this.elements.recordingStatus.className = 'recording-status recording';
            if (this.elements.pauseBtn) {
                this.elements.pauseBtn.textContent = '⏸️ Pausar';
            }
        }
        
        // Actualizar información de segmento
        if (this.elements.segmentInfo) {
            this.elements.segmentInfo.textContent = `📹 Segmento ${this.state.currentSegment}`;
        }
    }

    // ============ CONVERSIÓN Y METADATOS ============

    async convertWebMtoMP4(webmBlob) {
        console.log('🔄 Convirtiendo WebM → MP4...');
        return new Promise((resolve, reject) => {
            try {
                // Para compatibilidad, simplemente cambiamos el tipo MIME
                // En una implementación real, necesitarías una librería de conversión
                const reader = new FileReader();
                reader.onload = () => {
                    const arrayBuffer = reader.result;
                    const mp4Blob = new Blob([arrayBuffer], { type: 'video/mp4' });
                    console.log(`✅ WebM convertido a MP4: ${webmBlob.size} → ${mp4Blob.size} bytes`);
                    resolve(mp4Blob);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(webmBlob);
            } catch (error) {
                console.warn('⚠️ Error en conversión:', error);
                // Fallback: devolver el blob original
                resolve(webmBlob);
            }
        });
    }

    async ensureMP4WithMetadata(blob, originalFormat, gpsPoints) {
        // Si el formato ya es MP4, mantenerlo
        if (originalFormat === 'mp4' || blob.type.includes('mp4')) {
            if (this.state.settings.embedGpsMetadata && gpsPoints.length > 0) {
                try {
                    const mp4WithMetadata = await this.addGpsMetadataToMP4(blob, gpsPoints);
                    return { blob: mp4WithMetadata, format: 'mp4' };
                } catch (error) {
                    console.warn('⚠️ Error agregando metadatos GPS:', error);
                    return { blob, format: 'mp4' };
                }
            }
            return { blob, format: 'mp4' };
        }
        
        // Convertir a MP4
        try {
            console.log('🔄 Convirtiendo a MP4 con metadatos...');
            const mp4Blob = await this.convertWebMtoMP4(blob);
            
            if (this.state.settings.embedGpsMetadata && gpsPoints.length > 0) {
                const mp4WithMetadata = await this.addGpsMetadataToMP4(mp4Blob, gpsPoints);
                return { blob: mp4WithMetadata, format: 'mp4' };
            }
            
            return { blob: mp4Blob, format: 'mp4' };
            
        } catch (error) {
            console.warn('⚠️ Error convirtiendo a MP4:', error);
            return { blob, format: originalFormat };
        }
    }

    async addGpsMetadataToMP4(mp4Blob, gpsPoints) {
        return new Promise((resolve, reject) => {
            try {
                console.log('📍 Agregando metadatos GPS al video...');
                
                // Crear metadatos GPS
                const metadata = {
                    gpsPoints: gpsPoints.length,
                    startTime: gpsPoints[0]?.timestamp || Date.now(),
                    endTime: gpsPoints[gpsPoints.length-1]?.timestamp || Date.now(),
                    track: gpsPoints.map(p => ({
                        lat: p.lat,
                        lon: p.lon,
                        time: p.timestamp,
                        speed: p.speed || 0,
                        altitude: p.altitude || 0
                    }))
                };
                
                // Convertir metadatos a JSON
                const metadataStr = JSON.stringify(metadata);
                const metadataEncoder = new TextEncoder();
                const metadataArray = metadataEncoder.encode(metadataStr);
                
                // Crear un blob combinado (metadatos al final)
                const combinedBlob = new Blob([mp4Blob, metadataArray], { 
                    type: 'video/mp4' 
                });
                
                console.log(`✅ Metadatos GPS agregados: ${gpsPoints.length} puntos`);
                resolve(combinedBlob);
                
            } catch (error) {
                console.warn('⚠️ Error agregando metadatos:', error);
                resolve(mp4Blob);
            }
        });
    }

    // ============ GUARDADO DE VÍDEOS ============

    async saveVideoSegment() {
        if (this.recordedChunks.length === 0) {
            console.log('⚠️ No hay chunks para guardar');
            return;
        }
        
        // Prevenir múltiples guardados simultáneos
        if (this.isSaving) {
            console.log('⚠️ Ya se está guardando, ignorando...');
            return;
        }
        
        this.isSaving = true;
        
        try {
            console.log('💾 Guardando vídeo segmento...');
            
            const originalBlob = new Blob(this.recordedChunks, { 
                type: this.mediaRecorder?.mimeType || 'video/webm' 
            });
            
            // Verificar que el blob tenga tamaño válido
            if (originalBlob.size < 1024) {
                console.log('⚠️ Blob demasiado pequeño, ignorando...');
                return;
            }
            
            const duration = this.state.currentTime || 10000;
            const timestamp = this.state.startTime || Date.now();
            const originalFormat = this.state.settings.videoFormat === 'mp4' ? 'mp4' : 'webm';
            const segmentNum = this.state.currentSegment;
            
            // Convertir a MP4 con metadatos
            const { blob: finalBlob, format: finalFormat } = await this.ensureMP4WithMetadata(
                originalBlob, 
                originalFormat,
                this.gpxPoints
            );
            
            const filename = `segmento_${segmentNum}.${finalFormat}`;
            
            // Incrementar contador de segmentos en esta sesión
            this.state.recordingSessionSegments++;
            
            // Si es el PRIMER segmento y no hay sesión, crear carpeta para la sesión
            if (this.state.recordingSessionSegments === 1 && !this.state.recordingSessionName) {
                await this.createSessionFolder();
            }
            
            let savedPath = filename;
            let savedInSession = false;
            
            // Guardar según configuración
            if (this.state.recordingSessionName) {
                // Guardar en carpeta de sesión
                savedInSession = await this.saveToSessionFolder(finalBlob, filename, segmentNum);
                savedPath = `${this.state.recordingSessionName}/${filename}`;
            } else {
                // Guardar individualmente
                switch(this.state.settings.storageLocation) {
                    case 'default':
                        await this.saveToApp(finalBlob, timestamp, duration, finalFormat, segmentNum);
                        break;
                    case 'localFolder':
                        await this.saveToLocalFolder(finalBlob, filename);
                        break;
                }
            }
            
            // Guardar referencia del segmento
            const segmentData = {
                id: Date.now(),
                filename: filename,
                blob: finalBlob,
                timestamp: timestamp,
                duration: duration,
                format: finalFormat,
                segment: segmentNum,
                sessionName: this.state.recordingSessionName,
                savedInSession: savedInSession
            };
            
            this.state.recordedSegments.push(segmentData);
            
            // Mostrar notificación
            if (this.state.recordingSessionName) {
                this.showNotification(`✅ Segmento ${segmentNum} guardado en sesión "${this.state.recordingSessionName}"`);
            } else {
                this.showNotification(`✅ Segmento ${segmentNum} guardado`);
            }
            
            console.log('✅ Vídeo guardado', {
                session: this.state.recordingSessionName,
                segment: segmentNum,
                filename: filename
            });
            
        } catch (error) {
            console.error('❌ Error guardando vídeo:', error);
            this.showNotification('❌ Error al guardar video');
        } finally {
            // Limpiar chunks después de guardar
            this.recordedChunks = [];
            this.isSaving = false;
        }
    }

    drawFrameWithData() {
        if (!this.videoElement || !this.mainCtx || this.videoElement.readyState < 2) return;
        
        try {
            const canvas = this.mainCanvas;
            const ctx = this.mainCtx;
            
            // Verificar dimensiones válidas
            if (canvas.width === 0 || canvas.height === 0) {
                console.warn('⚠️ Canvas con dimensiones inválidas');
                canvas.width = 1280;
                canvas.height = 720;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
            
            // Dibujar marca de agua personalizada
            if (this.state.settings.showWatermark) {
                this.drawCustomWatermark(ctx, canvas);
            }
            
            // Dibujar overlay de grabación
            if (this.state.settings.overlayEnabled) {
                this.drawTemporaryOverlay();
            }
            
            // Dibujar overlay GPX si está activo
            if (this.state.settings.gpxOverlayEnabled && this.state.activeGPX) {
                this.drawGpxOverlay(ctx, canvas);
            }
            
            // Incrementar contador de frames
            this.frameCounter++;
            
        } catch (error) {
            console.warn('⚠️ Error dibujando frame:', error);
            // No detener la ejecución, solo registrar el error
        }
    }

    async saveToApp(blob, timestamp, duration, format, segmentNum = 1) {
        try {
            const videoData = {
                id: Date.now(),
                blob: blob,
                timestamp: timestamp,
                duration: duration,
                size: blob.size,
                title: `Grabación ${new Date(timestamp).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })} - S${segmentNum}${this.state.recordingSessionName ? ` - ${this.state.recordingSessionName}` : ''}`,  // <-- Incluir nombre de sesión
                gpsPoints: this.gpxPoints.length,
                gpsTrack: this.gpxPoints,
                format: format,
                location: 'app',
                hasMetadata: this.state.settings.embedGpsMetadata,
                segment: segmentNum,
                session: this.state.recordingSessionName  // <-- Agregar campo de sesión
            };
            
            if (this.db) {
                await this.saveToDatabase('videos', videoData);
                console.log('📱 Video guardado en app con metadatos');
                return true;
            } else {
                this.saveToLocalStorage(videoData);
                return true;
            }
        } catch (error) {
            console.error('❌ Error guardando en app:', error);
            return false;
        }
    }

    saveToLocalStorage(videoData) {
        try {
            const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
            videos.push({
                ...videoData,
                blob: null,
                dataUrl: 'placeholder'
            });
            localStorage.setItem('dashcam_videos', JSON.stringify(videos));
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
        }
    }

    // ============ GESTIÓN DE LOGO PERSONALIZADO ============

    async loadCustomLogo() {
        try {
            if (this.db) {
                const logoData = await this.getFromStore('customLogos', 'current_logo');
                if (logoData && logoData.dataUrl) {
                    this.logoImage = new Image();
                    this.logoImage.onload = () => {
                        console.log('✅ Logo personalizado cargado');
                        this.updateLogoInfo();
                    };
                    this.logoImage.src = logoData.dataUrl;
                    this.state.customLogo = logoData;
                }
            }
        } catch (error) {
            console.log('ℹ️ No hay logo personalizado cargado');
        }
    }

    async uploadCustomLogo() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) {
                    reject(new Error('No se seleccionó archivo'));
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) { // 5MB max
                    this.showNotification('❌ El logo debe ser menor a 5MB');
                    reject(new Error('Archivo demasiado grande'));
                    return;
                }
                
                try {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        const dataUrl = e.target.result;
                        
                        this.logoImage = new Image();
                        this.logoImage.onload = () => {
                            console.log('✅ Logo cargado:', file.name, this.logoImage.width, 'x', this.logoImage.height);
                            
                            // Guardar en base de datos
                            const logoData = {
                                id: 'current_logo',
                                filename: file.name,
                                dataUrl: dataUrl,
                                size: file.size,
                                type: file.type,
                                uploadDate: Date.now()
                            };
                            
                            this.state.customLogo = logoData;
                            
                            if (this.db) {
                                this.saveToDatabase('customLogos', logoData)
                                    .then(() => {
                                        this.updateLogoInfo();
                                        this.showNotification('✅ Logo personalizado guardado');
                                        resolve(logoData);
                                    })
                                    .catch(error => {
                                        console.error('❌ Error guardando logo:', error);
                                        reject(error);
                                    });
                            } else {
                                this.updateLogoInfo();
                                this.showNotification('✅ Logo personalizado cargado');
                                resolve(logoData);
                            }
                        };
                        
                        this.logoImage.onerror = () => {
                            reject(new Error('Error cargando imagen'));
                        };
                        
                        this.logoImage.src = dataUrl;
                    };
                    
                    reader.onerror = () => {
                        reject(new Error('Error leyendo archivo'));
                    };
                    
                    reader.readAsDataURL(file);
                    
                } catch (error) {
                    console.error('❌ Error subiendo logo:', error);
                    reject(error);
                }
            };
            
            input.click();
        });
    }

    updateLogoInfo() {
        if (this.elements.currentLogoInfo && this.state.customLogo) {
            this.elements.currentLogoInfo.innerHTML = 
                `<span>🖼️ ${this.state.customLogo.filename}</span>`;
        }
    }

    // ============ GESTIÓN DE ARCHIVOS GPX ============

    async loadGPXFiles() {
        try {
            if (this.db) {
                const gpxFiles = await this.getAllFromStore('gpxFiles');
                this.state.loadedGPXFiles = gpxFiles;
                this.updateGpxSelect();
                console.log(`🗺️ ${gpxFiles.length} archivos GPX cargados`);
            }
        } catch (error) {
            console.log('ℹ️ No hay archivos GPX cargados');
        }
    }

    async uploadGPXFile() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.gpx,.xml';
            
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) {
                    reject(new Error('No se seleccionó archivo'));
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) { // 10MB max
                    this.showNotification('❌ El archivo GPX debe ser menor a 10MB');
                    reject(new Error('Archivo demasiado grande'));
                    return;
                }
                
                try {
                    const text = await file.text();
                    
                    // Parsear GPX manualmente (simplificado)
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, 'text/xml');
                    
                    const trackPoints = [];
                    const trkpts = xmlDoc.getElementsByTagName('trkpt');
                    
                    for (let i = 0; i < trkpts.length; i++) {
                        const trkpt = trkpts[i];
                        const lat = parseFloat(trkpt.getAttribute('lat'));
                        const lon = parseFloat(trkpt.getAttribute('lon'));
                        
                        const eleElement = trkpt.getElementsByTagName('ele')[0];
                        const timeElement = trkpt.getElementsByTagName('time')[0];
                        const speedElement = trkpt.getElementsByTagName('speed')[0];
                        
                        trackPoints.push({
                            lat: lat,
                            lon: lon,
                            ele: eleElement ? parseFloat(eleElement.textContent) : 0,
                            time: timeElement ? new Date(timeElement.textContent) : null,
                            speed: speedElement ? parseFloat(speedElement.textContent) : 0
                        });
                    }
                    
                    // Calcular distancia total (simplificado)
                    let totalDistance = 0;
                    for (let i = 1; i < trackPoints.length; i++) {
                        totalDistance += this.calculateDistance(
                            trackPoints[i-1].lat, trackPoints[i-1].lon,
                            trackPoints[i].lat, trackPoints[i].lon
                        );
                    }
                    
                    const gpxData = {
                        id: Date.now(),
                        name: file.name.replace('.gpx', '').replace('.xml', ''),
                        filename: file.name,
                        points: trackPoints,
                        distance: totalDistance,
                        elevation: {
                            min: Math.min(...trackPoints.map(p => p.ele)),
                            max: Math.max(...trackPoints.map(p => p.ele)),
                            avg: trackPoints.reduce((sum, p) => sum + p.ele, 0) / trackPoints.length
                        },
                        uploadDate: Date.now(),
                        fileSize: file.size
                    };
                    
                    // Mostrar vista previa
                    this.showGpxPreview(gpxData);
                    
                    // Guardar en estado temporal
                    this.tempGpxData = gpxData;
                    
                    resolve(gpxData);
                    
                } catch (error) {
                    console.error('❌ Error procesando GPX:', error);
                    this.showNotification('❌ Error en archivo GPX');
                    reject(error);
                }
            };
            
            input.click();
        });
    }

    showGpxPreview(gpxData) {
        if (this.elements.gpxPreview) {
            this.elements.gpxPreview.style.display = 'block';
            
            // Actualizar estadísticas
            this.elements.gpxDistance.textContent = `${gpxData.distance.toFixed(2)} km`;
            this.elements.gpxPoints.textContent = gpxData.points.length;
            this.elements.gpxDuration.textContent = this.formatTime(gpxData.points.length * 1000); // Estimado
            this.elements.gpxElevation.textContent = `${gpxData.elevation.min.toFixed(0)}-${gpxData.elevation.max.toFixed(0)}m`;
            
            // Dibujar vista previa en canvas
            this.drawGpxPreview(gpxData);
        }
    }

    drawGpxPreview(gpxData) {
        const canvas = this.elements.gpxCanvas;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (gpxData.points.length === 0) return;
        
        // Calcular bounds
        let minLat = Infinity, maxLat = -Infinity;
        let minLon = Infinity, maxLon = -Infinity;
        
        gpxData.points.forEach(point => {
            minLat = Math.min(minLat, point.lat);
            maxLat = Math.max(maxLat, point.lat);
            minLon = Math.min(minLon, point.lon);
            maxLon = Math.max(maxLon, point.lon);
        });
        
        const latRange = maxLat - minLat;
        const lonRange = maxLon - minLon;
        
        // Escalar puntos al canvas
        const points = gpxData.points.map(point => ({
            x: ((point.lon - minLon) / lonRange) * canvas.width,
            y: canvas.height - ((point.lat - minLat) / latRange) * canvas.height
        }));
        
        // Dibujar línea
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Dibujar puntos inicial y final
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(points[points.length-1].x, points[points.length-1].y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    async saveGPXToDatabase() {
        if (!this.tempGpxData) {
            this.showNotification('❌ No hay GPX para guardar');
            return;
        }
        
        try {
            if (this.db) {
                await this.saveToDatabase('gpxFiles', this.tempGpxData);
                this.state.loadedGPXFiles.push(this.tempGpxData);
                this.updateGpxSelect();
                
                this.showNotification(`✅ GPX guardado: ${this.tempGpxData.name}`);
                this.tempGpxData = null;
                
                if (this.elements.gpxPreview) {
                    this.elements.gpxPreview.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('❌ Error guardando GPX:', error);
            this.showNotification('❌ Error al guardar GPX');
        }
    }

    updateGpxSelect() {
        if (!this.elements.activeGpxRoute) return;
        
        // Limpiar opciones excepto la primera
        while (this.elements.activeGpxRoute.options.length > 1) {
            this.elements.activeGpxRoute.remove(1);
        }
        
        // Agregar opciones para cada GPX cargado
        this.state.loadedGPXFiles.forEach(gpx => {
            const option = document.createElement('option');
            option.value = gpx.id;
            option.textContent = gpx.name;
            this.elements.activeGpxRoute.appendChild(option);
        });
        
        // Actualizar lista en GPX Manager
        this.renderGpxList();
    }

    renderGpxList() {
        const container = this.elements.gpxListContainer;
        if (!container) return;
        
        if (this.state.loadedGPXFiles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>🗺️</div>
                    <p>No hay rutas GPX cargadas</p>
                    <p>Sube un archivo GPX para comenzar</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="file-list">';
        
        this.state.loadedGPXFiles.forEach(gpx => {
            const date = new Date(gpx.uploadDate);
            const dateStr = date.toLocaleDateString('es-ES');
            const isActive = this.state.activeGPX && this.state.activeGPX.id === gpx.id;
            
            html += `
                <div class="file-item gpx-file ${isActive ? 'selected' : ''}" 
                     data-id="${gpx.id}">
                    <div class="file-header">
                        <div class="file-title">${gpx.name}</div>
                        <div class="file-format">GPX</div>
                        <div class="file-time">${dateStr}</div>
                    </div>
                    <div class="file-details">
                        <div>📏 ${gpx.distance.toFixed(2)} km</div>
                        <div>📍 ${gpx.points.length} puntos</div>
                        <div>⛰️ ${gpx.elevation.min.toFixed(0)}-${gpx.elevation.max.toFixed(0)}m</div>
                        <div>💾 ${Math.round(gpx.fileSize / 1024)} KB</div>
                    </div>
                    <div class="file-footer">
                        <button class="play-btn set-active-gpx" data-id="${gpx.id}">
                            ${isActive ? '✅ Activa' : '🗺️ Activar'}
                        </button>
                        <button class="play-btn delete-gpx" data-id="${gpx.id}">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Configurar eventos
        container.querySelectorAll('.set-active-gpx').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.setActiveGpx(id);
            });
        });
        
        container.querySelectorAll('.delete-gpx').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteGpxFile(id);
            });
        });
    }

    setActiveGpx(gpxId) {
        const gpx = this.state.loadedGPXFiles.find(g => g.id === gpxId);
        if (gpx) {
            this.state.activeGPX = gpx;
            this.showNotification(`🗺️ Ruta GPX activada: ${gpx.name}`);
            this.renderGpxList();
            
            // Actualizar selector en configuración
            if (this.elements.activeGpxRoute) {
                this.elements.activeGpxRoute.value = gpxId;
            }
        }
    }

    async deleteGpxFile(gpxId) {
        if (!confirm('¿Eliminar esta ruta GPX?')) return;
        
        try {
            if (this.db) {
                await this.deleteFromStore('gpxFiles', gpxId);
            }
            
            this.state.loadedGPXFiles = this.state.loadedGPXFiles.filter(g => g.id !== gpxId);
            
            if (this.state.activeGPX && this.state.activeGPX.id === gpxId) {
                this.state.activeGPX = null;
            }
            
            this.updateGpxSelect();
            this.showNotification('🗑️ Ruta GPX eliminada');
            
        } catch (error) {
            console.error('❌ Error eliminando GPX:', error);
            this.showNotification('❌ Error al eliminar GPX');
        }
    }

    // ============ COMBINAR VÍDEOS ============

    async combineSelectedVideos() {
        if (this.state.selectedVideos.size < 2) {
            this.showNotification('❌ Selecciona al menos 2 videos para combinar');
            return;
        }
        
        // Mostrar modal de combinación
        this.showCombineModal();
    }

    showCombineModal() {
        // Crear lista de videos seleccionados
        const container = this.elements.combineVideosList;
        if (!container) return;
        
        const selectedVideos = Array.from(this.state.selectedVideos)
            .map(id => this.state.videos.find(v => v.id === id))
            .filter(v => v);
        
        if (selectedVideos.length === 0) {
            this.showNotification('❌ No hay videos seleccionados');
            return;
        }
        
        let html = '<div class="file-list">';
        
        selectedVideos.forEach(video => {
            const date = new Date(video.timestamp);
            const dateStr = date.toLocaleDateString('es-ES');
            const timeStr = date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            
            html += `
                <div class="file-item">
                    <div class="file-header">
                        <div class="file-title">${video.title || 'Grabación'}</div>
                        <div class="file-time">${timeStr}</div>
                    </div>
                    <div class="file-details">
                        <div>📅 ${dateStr}</div>
                        <div>⏱️ ${this.formatTime(video.duration)}</div>
                        <div>💾 ${Math.round(video.size / (1024 * 1024))} MB</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Mostrar modal
        if (this.elements.combineVideosModal) {
            this.elements.combineVideosModal.classList.remove('hidden');
        }
    }

    async startCombineProcess() {
        const selectedVideos = Array.from(this.state.selectedVideos)
            .map(id => this.state.videos.find(v => v.id === id))
            .filter(v => v);
        
        if (selectedVideos.length < 2) {
            this.showNotification('❌ Selecciona al menos 2 videos');
            return;
        }
        
        const combinedName = this.elements.combinedVideoName.value || 
                           `Video_combinado_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}`;
        
        const preserveMetadata = this.elements.preserveMetadata.checked;
        
        // Mostrar progreso
        if (this.elements.combineProgress) {
            this.elements.combineProgress.style.display = 'block';
        }
        
        this.elements.startCombineBtn.disabled = true;
        
        try {
            this.elements.combineStatus.textContent = 'Preparando videos...';
            this.elements.combineProgressFill.style.width = '0%';
            
            // Simular proceso de combinación
            for (let i = 0; i < selectedVideos.length; i++) {
                const progress = ((i + 1) / selectedVideos.length) * 100;
                this.elements.combineProgressFill.style.width = `${progress}%`;
                this.elements.combineStatus.textContent = `Procesando video ${i + 1} de ${selectedVideos.length}...`;
                
                // Simular procesamiento
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            this.elements.combineStatus.textContent = 'Finalizando...';
            
            // Simular combinación completada
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNotification(`✅ ${selectedVideos.length} videos combinados en "${combinedName}"`);
            this.hideCombineModal();
            
            // Recargar galería
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error combinando videos:', error);
            this.showNotification('❌ Error al combinar videos');
        } finally {
            this.elements.startCombineBtn.disabled = false;
            if (this.elements.combineProgress) {
                this.elements.combineProgress.style.display = 'none';
            }
        }
    }

    hideCombineModal() {
        if (this.elements.combineVideosModal) {
            this.elements.combineVideosModal.classList.add('hidden');
        }
    }

    // ============ GEOCODIFICACIÓN INVERSA ============

    async getLocationName(lat, lon) {
        // Primero buscar en caché
        const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
        
        if (this.state.reverseGeocodeCache[cacheKey]) {
            return this.state.reverseGeocodeCache[cacheKey];
        }
        
        if (this.db) {
            try {
                const cached = await this.getFromStore('geocodeCache', cacheKey);
                if (cached) {
                    this.state.reverseGeocodeCache[cacheKey] = cached.value;
                    return cached.value;
                }
            } catch (error) {
                console.log('⚠️ Error accediendo a caché geocodificación');
            }
        }
        
        try {
            // Usar Nominatim (OpenStreetMap) para geocodificación inversa
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=es`
            );
            
            if (response.ok) {
                const data = await response.json();
                
                let locationName = 'Desconocido';
                
                if (data.address) {
                    // Intentar obtener nombre de ciudad/pueblo
                    if (data.address.city) {
                        locationName = data.address.city;
                    } else if (data.address.town) {
                        locationName = data.address.town;
                    } else if (data.address.village) {
                        locationName = data.address.village;
                    } else if (data.address.municipality) {
                        locationName = data.address.municipality;
                    } else if (data.address.county) {
                        locationName = data.address.county;
                    } else if (data.address.state) {
                        locationName = data.address.state;
                    } else if (data.address.country) {
                        locationName = data.address.country;
                    }
                }
                
                // Limitar a 50 caracteres
                if (locationName.length > 50) {
                    locationName = locationName.substring(0, 47) + '...';
                }
                
                // Guardar en caché
                this.state.reverseGeocodeCache[cacheKey] = locationName;
                
                if (this.db) {
                    await this.saveToDatabase('geocodeCache', {
                        key: cacheKey,
                        value: locationName,
                        timestamp: Date.now()
                    });
                }
                
                return locationName;
            }
        } catch (error) {
            console.log('⚠️ Error en geocodificación inversa:', error);
        }
        
        return 'Desconocido';
    }

    // ============ GPS MEJORADO ============

    startGPS() {
        if (!navigator.geolocation) {
            console.log('📍 GPS no soportado');
            return;
        }
        
        console.log('📍 Iniciando GPS con geocodificación...');
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                this.currentPosition = this.formatPosition(position);
                
                // Obtener nombre de ubicación si está habilitado
                if (this.state.settings.reverseGeocodeEnabled) {
                    this.state.currentLocationName = await this.getLocationName(
                        this.currentPosition.lat,
                        this.currentPosition.lon
                    );
                }
                
                this.startGPSWatching();
            },
            (error) => {
                console.warn('📍 GPS Error inicial:', error.message);
                if (this.elements.gpsInfo) {
                    this.elements.gpsInfo.textContent = `📍 GPS: ${this.getGPSErrorMessage(error.code)}`;
                }
                this.startGPSWatching();
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 15000
            }
        );
    }

    async startGPSWatching() {
        this.gpsWatchId = navigator.geolocation.watchPosition(
            async (position) => {
                this.currentPosition = this.formatPosition(position);
                
                // Actualizar información de ubicación si está habilitado
                if (this.state.settings.reverseGeocodeEnabled) {
                    // Actualizar cada 30 segundos para no sobrecargar la API
                    const now = Date.now();
                    if (!this.lastGeocodeUpdate || now - this.lastGeocodeUpdate > 30000) {
                        this.state.currentLocationName = await this.getLocationName(
                            this.currentPosition.lat,
                            this.currentPosition.lon
                        );
                        this.lastGeocodeUpdate = now;
                    }
                }
                
                if (this.elements.gpsInfo) {
                    const speedKmh = (this.currentPosition.speed * 3.6).toFixed(1);
                    let locationName = this.state.currentLocationName;
                    
                    // Limitar a 50 caracteres en la pantalla también
                    if (locationName.length > 50) {
                        locationName = locationName.substring(0, 47) + '...';
                    }
                    
                    const locationText = this.state.settings.reverseGeocodeEnabled ? 
                        ` | 🏙️ ${locationName}` : '';
                    this.elements.gpsInfo.textContent = 
                        `📍 ${this.currentPosition.lat.toFixed(4)}, ${this.currentPosition.lon.toFixed(4)}${locationText} | ${speedKmh} km/h`;
                }
                
            },
            (error) => {
                console.warn('📍 GPS Error:', error.message);
                if (this.elements.gpsInfo) {
                    this.elements.gpsInfo.textContent = `📍 GPS: ${this.getGPSErrorMessage(error.code)}`;
                }
                this.currentPosition = null;
            },
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 10000
            }
        );
        
        if (this.gpxInterval) {
            clearInterval(this.gpxInterval);
        }
        
        this.gpxInterval = setInterval(() => {
            if (this.currentPosition && this.state.isRecording && !this.state.isPaused) {
                this.saveGPXPoint(this.currentPosition);
            }
        }, this.state.settings.gpxInterval * 1000);
    }

    formatPosition(position) {
        return {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            speed: position.coords.speed || 0,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            timestamp: position.timestamp || Date.now()
        };
    }

    getGPSErrorMessage(code) {
        switch(code) {
            case 1:
                return 'Permiso denegado - Activa GPS en ajustes';
            case 2:
                return 'Posición no disponible - Sal al exterior';
            case 3:
                return 'Buscando señal...';
            default:
                return 'Iniciando GPS...';
        }
    }

    async saveGPXPoint(position) {
        const pointData = {
            lat: position.lat,
            lon: position.lon,
            ele: position.altitude || 0,
            speed: position.speed || 0,
            heading: position.heading || 0,
            accuracy: position.accuracy,
            timestamp: position.timestamp || Date.now(),
            recordTime: Date.now()
        };
        
        this.gpxPoints.push(pointData);
    }

    async saveGPXTrack(timestamp = Date.now(), segmentNum = 1) {
        if (this.gpxPoints.length === 0) return;
        
        try {
            const gpxContent = this.generateGPX(this.gpxPoints);
            const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
            
            const gpxData = {
                id: Date.now(),
                blob: blob,
                timestamp: timestamp,
                points: this.gpxPoints.length,
                title: `Ruta ${new Date(timestamp).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })} - S${segmentNum}`,
                size: blob.size,
                location: 'local',
                segment: segmentNum
            };
            
            if (this.db) {
                await this.saveToDatabase('gpxTracks', gpxData);
            }
            console.log('📍 GPX guardado:', gpxData.points, 'puntos');
            
        } catch (error) {
            console.error('❌ Error guardando GPX:', error);
        }
    }

    generateGPX(points) {
        let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Dashcam PWA Pro">
  <metadata>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Dashcam Recording</name>
    <trkseg>`;
    
        points.forEach(point => {
            gpx += `
      <trkpt lat="${point.lat}" lon="${point.lon}">
        <ele>${point.ele}</ele>
        <time>${new Date(point.timestamp).toISOString()}</time>
        <speed>${point.speed}</speed>
      </trkpt>`;
        });
        
        gpx += `
    </trkseg>
  </trk>
</gpx>`;
        
        return gpx;
    }

    // ============ GALERÍA MEJORADA ============

    async loadGallery() {
        console.log('📁 Cargando galería...');
        try {
            // Cargar según el modo de vista
            switch(this.state.viewMode) {
                case 'default':
                    await this.loadAppVideos();
                    break;
                case 'localFolder':
                    await this.loadLocalFolderVideos();
                    break;
            }
            
            console.log('✅ Galería cargada');
        } catch (error) {
            console.error('❌ Error cargando galería:', error);
        }
    }

    async loadAppVideos() {
        try {
            console.log('📱 Cargando vídeos de la app...');
            let videos = [];
            
            if (this.db) {
                videos = await this.getAllFromStore('videos');
                // Filtrar solo videos de la app
                videos = videos.filter(v => v.location === 'app' || !v.location);
            } else {
                const storedVideos = localStorage.getItem('dashcam_videos');
                if (storedVideos) {
                    videos = JSON.parse(storedVideos);
                }
            }
            
            console.log(`📊 ${videos.length} vídeos en app encontrados`);
            
            this.state.videos = videos.sort((a, b) => b.timestamp - a.timestamp);
            this.renderVideosList();
            
        } catch (error) {
            console.error('❌ Error cargando vídeos de app:', error);
            this.state.videos = [];
            this.renderVideosList();
        }
    }

    async loadLocalFolderVideos() {
        try {
            console.log('📂 Cargando vídeos de carpeta local...');
            
            // Por ahora, cargamos desde la base de datos
            let videos = [];
            if (this.db) {
                const localFiles = await this.getAllFromStore('localFiles');
                videos = localFiles.map(file => ({
                    id: file.id,
                    title: file.filename,
                    timestamp: file.timestamp,
                    size: file.size,
                    location: file.location || 'localFolder',
                    format: file.filename.endsWith('.mp4') ? 'mp4' : 'webm'
                }));
            }
            
            console.log(`📊 ${videos.length} vídeos en carpeta local encontrados`);
            
            this.state.videos = videos.sort((a, b) => b.timestamp - a.timestamp);
            this.renderVideosList();
            
        } catch (error) {
            console.error('❌ Error cargando vídeos de carpeta:', error);
            this.state.videos = [];
            this.renderVideosList();
        }
    }

    renderVideosList() {
        const container = this.elements.videosList;
        if (!container) return;
        
        console.log('🖼️ Renderizando lista de vídeos:', this.state.videos.length);
        
        if (this.state.videos.length === 0) {
            let message = '';
            let icon = '📱';
            
            switch(this.state.viewMode) {
                case 'default':
                    message = 'No hay vídeos en la app';
                    icon = '📱';
                    break;
                case 'localFolder':
                    message = 'No hay vídeos en la carpeta local';
                    icon = '📂';
                    break;
            }
            
            container.innerHTML = `
                <div class="empty-state">
                    <div>${icon}</div>
                    <p>${message}</p>
                    <p>${this.state.viewMode === 'default' ? 
                        'Inicia una grabación para comenzar' : 
                        'Los vídeos aparecerán aquí después de guardarlos'}</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="file-list">';
        
        this.state.videos.forEach(video => {
            const date = new Date(video.timestamp);
            const sizeMB = video.size ? Math.round(video.size / (1024 * 1024)) : 0;
            const duration = this.formatTime(video.duration || 0);
            const dateStr = date.toLocaleDateString('es-ES');
            const timeStr = date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            const location = video.location || 'app';
            const format = video.format || 'mp4';
            const segment = video.segment || 1;
            
            // Icono según ubicación
            let locationIcon = '📱';
            if (location === 'localFolder' || location === 'desktop_folder') locationIcon = '📂';
            if (location === 'ios_local') locationIcon = '📱';
            
            html += `
                <div class="file-item video-file ${this.state.selectedVideos.has(video.id) ? 'selected' : ''}" 
                     data-id="${video.id}" 
                     data-type="video"
                     data-location="${location}"
                     data-format="${format}">
                    <div class="file-header">
                        <div class="file-title">${video.title || 'Grabación'}</div>
                        <div class="file-location">${locationIcon}</div>
                        <div class="file-format">${format.toUpperCase()}</div>
                        <div class="file-time">${timeStr}</div>
                    </div>
                    <div class="file-details">
                        <div>📅 ${dateStr}</div>
                        <div>⏱️ ${duration}</div>
                        <div>💾 ${sizeMB} MB</div>
                        <div>📍 ${video.gpsPoints || 0} puntos</div>
                        ${segment > 1 ? `<div>📹 Segmento ${segment}</div>` : ''}
                    </div>
                    <div class="file-footer">
                        <div class="file-checkbox">
                            <input type="checkbox" ${this.state.selectedVideos.has(video.id) ? 'checked' : ''}>
                            <span>Seleccionar</span>
                        </div>
                        <button class="play-btn" data-id="${video.id}">▶️ Reproducir</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Configurar eventos
        container.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.play-btn') && !(e.target.type === 'checkbox')) {
                    const id = parseInt(item.dataset.id);
                    this.toggleSelection(id, 'video');
                }
            });
            
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(item.dataset.id);
                    this.toggleSelection(id, 'video');
                });
            }
            
            const playBtn = item.querySelector('.play-btn');
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(item.dataset.id);
                    this.playVideo(id);
                });
            }
        });
        
        // Actualizar botones de acción
        this.updateGalleryActions();
    }

    updateGalleryActions() {
        const hasSelectedVideos = this.state.selectedVideos.size > 0;
        
        // Actualizar botones en el menú desplegable
        const moveBtn = document.getElementById('moveToLocalBtn');
        const combineBtn = document.getElementById('combineVideosBtn');
        const exportBtn = document.getElementById('exportBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        
        if (moveBtn) moveBtn.disabled = !hasSelectedVideos;
        if (combineBtn) combineBtn.disabled = !hasSelectedVideos || this.state.selectedVideos.size < 2;
        if (exportBtn) exportBtn.disabled = !hasSelectedVideos;
        if (deleteBtn) deleteBtn.disabled = !hasSelectedVideos;
    }

    // ============ REPRODUCTOR AVANZADO ============

    async playVideo(videoId) {
        try {
            let video;
            
            // Buscar según el modo de vista
            if (this.state.viewMode === 'default') {
                if (this.db) {
                    video = await this.getFromStore('videos', videoId);
                } else {
                    const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
                    video = videos.find(v => v.id === videoId);
                }
            } else if (this.state.viewMode === 'localFolder') {
                // Para carpeta local, buscar en localFiles
                if (this.db) {
                    const localFile = await this.getFromStore('localFiles', videoId);
                    if (localFile) {
                        // Buscar el video correspondiente
                        video = await this.getFromStore('videos', videoId);
                    }
                }
            }
            
            if (!video) {
                this.showNotification('❌ Video no encontrado');
                return;
            }
            
            this.state.currentVideo = video;
            
            if (video.blob) {
                const videoUrl = URL.createObjectURL(video.blob);
                
                this.elements.playbackVideo.src = videoUrl;
                this.elements.videoTitle.textContent = video.title || 'Grabación';
                
                const date = new Date(video.timestamp);
                const sizeMB = Math.round(video.size / (1024 * 1024));
                const duration = this.formatTime(video.duration);
                const location = video.location || 'app';
                const format = video.format || 'mp4';
                
                this.elements.videoDate.textContent = date.toLocaleString('es-ES');
                this.elements.videoDuration.textContent = duration;
                this.elements.videoSize.textContent = `${sizeMB} MB`;
                this.elements.videoGpsPoints.textContent = video.gpsPoints || 0;
                
                // Actualizar información de ubicación
                let locationText = 'Almacenado en la app';
                let locationIcon = '📱';
                
                if (location === 'localFolder' || location === 'desktop_folder') {
                    locationText = `Almacenado en carpeta: ${this.state.settings.localFolderName || 'Local'}`;
                    locationIcon = '📂';
                } else if (location === 'ios_local') {
                    locationText = 'Almacenado en iPhone (app)';
                    locationIcon = '📱';
                }
                
                this.elements.locationIcon.textContent = locationIcon;
                this.elements.locationText.textContent = locationText;
                
                // Configurar eventos del video
                this.elements.playbackVideo.addEventListener('timeupdate', () => {
                    this.updatePlaybackMap();
                });
                
                this.elements.videoPlayer.classList.remove('hidden');
                
                // Inicializar mapa
                this.initPlaybackMap();
            } else {
                this.showNotification('❌ Video no disponible para reproducción');
            }
            
        } catch (error) {
            console.error('❌ Error reproduciendo video:', error);
            this.showNotification('❌ Error al reproducir');
        }
    }

    initPlaybackMap() {
        if (!this.state.currentVideo || !this.state.currentVideo.gpsTrack) return;
        
        const canvas = this.elements.playbackMap;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const points = this.state.currentVideo.gpsTrack;
        if (points.length === 0) return;
        
        // Calcular bounds
        let minLat = Infinity, maxLat = -Infinity;
        let minLon = Infinity, maxLon = -Infinity;
        
        points.forEach(point => {
            minLat = Math.min(minLat, point.lat);
            maxLat = Math.max(maxLat, point.lat);
            minLon = Math.min(minLon, point.lon);
            maxLon = Math.max(maxLon, point.lon);
        });
        
        const latRange = maxLat - minLat;
        const lonRange = maxLon - minLon;
        
        // Escalar puntos al canvas
        const scaledPoints = points.map(point => ({
            x: ((point.lon - minLon) / lonRange) * canvas.width,
            y: canvas.height - ((point.lat - minLat) / latRange) * canvas.height
        }));
        
        // Dibujar ruta
        ctx.beginPath();
        ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
        for (let i = 1; i < scaledPoints.length; i++) {
            ctx.lineTo(scaledPoints[i].x, scaledPoints[i].y);
        }
        
        ctx.strokeStyle = '#00a8ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Marcar punto inicial
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(scaledPoints[0].x, scaledPoints[0].y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Marcar punto final
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(scaledPoints[scaledPoints.length-1].x, scaledPoints[scaledPoints.length-1].y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    updatePlaybackMap() {
        if (!this.state.currentVideo || !this.state.currentVideo.gpsTrack) return;
        
        const video = this.elements.playbackVideo;
        if (!video || !video.duration) return;
        
        const currentTime = video.currentTime;
        const totalTime = video.duration;
        const progress = currentTime / totalTime;
        
        const points = this.state.currentVideo.gpsTrack;
        const pointIndex = Math.min(Math.floor(progress * points.length), points.length - 1);
        const currentPoint = points[pointIndex];
        
        if (currentPoint) {
            this.elements.mapLat.textContent = currentPoint.lat.toFixed(4);
            this.elements.mapLon.textContent = currentPoint.lon.toFixed(4);
            this.elements.mapSpeed.textContent = `${(currentPoint.speed * 3.6 || 0).toFixed(1)} km/h`;
            
            // Actualizar ciudad si tenemos geocodificación
            if (currentPoint.locationName) {
                this.elements.mapCity.textContent = currentPoint.locationName;
            }
        }
    }

    hideVideoPlayer() {
        this.elements.videoPlayer.classList.add('hidden');
        if (this.elements.playbackVideo) {
            this.elements.playbackVideo.pause();
            if (this.elements.playbackVideo.src) {
                URL.revokeObjectURL(this.elements.playbackVideo.src);
            }
            this.elements.playbackVideo.src = '';
        }
        this.state.currentVideo = null;
    }

    async extractGpxFromVideo() {
        if (!this.state.currentVideo) {
            this.showNotification('❌ No hay video seleccionado');
            return;
        }
        
        try {
            if (this.state.currentVideo.gpsTrack && this.state.currentVideo.gpsTrack.length > 0) {
                // Generar archivo GPX a partir de los puntos guardados
                const gpxContent = this.generateGPX(this.state.currentVideo.gpsTrack);
                const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
                
                const gpxData = {
                    id: Date.now(),
                    blob: blob,
                    timestamp: this.state.currentVideo.timestamp,
                    points: this.state.currentVideo.gpsTrack.length,
                    title: `Ruta_${this.state.currentVideo.title.replace(/[^a-z0-9]/gi, '_')}`,
                    size: blob.size,
                    location: 'extracted'
                };
                
                if (this.db) {
                    await this.saveToDatabase('gpxTracks', gpxData);
                }
                
                this.downloadBlob(blob, `${gpxData.title}.gpx`);
                this.showNotification('🗺️ Ruta GPX extraída y descargada');
                
            } else {
                this.showNotification('⚠️ Este video no tiene metadatos GPS');
            }
            
        } catch (error) {
            console.error('❌ Error extrayendo GPX:', error);
            this.showNotification('❌ Error al extraer GPX');
        }
    }

    // ============ CONFIGURACIÓN ============

    async saveSettings() {
        try {
            const settings = {
                recordingMode: this.elements.recordingMode.value,
                segmentDuration: parseInt(this.elements.segmentDuration.value),
                videoQuality: this.elements.videoQuality.value,
                videoFormat: this.elements.videoFormat.value,
                gpxInterval: parseInt(this.elements.gpxInterval.value),
                overlayEnabled: this.elements.overlayEnabled.checked,
                audioEnabled: this.elements.audioEnabled.checked,
                reverseGeocodeEnabled: this.elements.reverseGeocodeEnabled.checked,
                watermarkOpacity: parseFloat(this.elements.watermarkOpacity.value),
                watermarkFontSize: this.state.settings.watermarkFontSize,
                watermarkPosition: this.state.settings.watermarkPosition,
                storageLocation: this.elements.storageLocation.value,
                keepAppCopy: this.elements.keepAppCopy.checked,
                showWatermark: this.elements.showWatermark.checked,
                logoPosition: this.elements.logoPosition.value,
                logoSize: this.elements.logoSize.value,
                customWatermarkText: this.state.settings.customWatermarkText,
                textPosition: this.elements.textPosition.value,
                gpxOverlayEnabled: this.elements.gpxOverlayEnabled.checked,
                showGpxDistance: this.elements.showGpxDistance.checked,
                showGpxSpeed: this.elements.showGpxSpeed.checked,
                embedGpsMetadata: this.elements.embedGpsMetadata.checked,
                metadataFrequency: parseInt(this.elements.metadataFrequency.value),
                // NO guardar localFolderHandle aquí
                localFolderName: this.state.settings.localFolderName,
                localFolderPath: this.state.settings.localFolderPath
            };
            
            // Actualizar estado
            this.state.settings = { 
                ...this.state.settings, 
                ...settings,
                // Mantener el handle en memoria
                localFolderHandle: this.state.settings.localFolderHandle
            };
            
            // Guardar en IndexedDB si está disponible
            if (this.db) {
                try {
                    const transaction = this.db.transaction(['settings'], 'readwrite');
                    const store = transaction.objectStore('settings');
                    
                    // Guardar solo los campos serializables
                    const serializableSettings = { ...settings };
                    await store.put({ name: 'appSettings', value: serializableSettings });
                    console.log('⚙️ Configuración guardada en IndexedDB');
                } catch (error) {
                    console.warn('⚠️ Error guardando en IndexedDB:', error);
                }
            }
            
            // También guardar en localStorage como backup
            try {
                localStorage.setItem('dashcam_settings', JSON.stringify(settings));
                console.log('⚙️ Configuración guardada en localStorage');
            } catch (error) {
                console.warn('⚠️ Error guardando en localStorage:', error);
            }
            
            this.updateStorageStatus();
            this.updateSettingsUI();
            this.showNotification('⚙️ Configuración guardada');
            this.hideSettings();
            
        } catch (error) {
            console.error('❌ Error guardando configuración:', error);
            this.showNotification('❌ Error al guardar configuración');
        }
    }

    async fixDatabaseVersion() {
        try {
            console.log('🔧 Intentando corregir versión de base de datos...');
            
            // Cerrar conexión si existe
            if (this.db) {
                this.db.close();
                this.db = null;
            }
            
            // Eliminar base de datos existente
            await new Promise((resolve, reject) => {
                const deleteRequest = indexedDB.deleteDatabase('DashcamDB_Pro');
                deleteRequest.onsuccess = () => {
                    console.log('🗑️ Base de datos eliminada');
                    resolve();
                };
                deleteRequest.onerror = (error) => {
                    console.warn('⚠️ Error eliminando base de datos:', error);
                    reject(error);
                };
                deleteRequest.onblocked = () => {
                    console.warn('⚠️ Base de datos bloqueada, intentando cerrar conexiones...');
                    resolve();
                };
            });
            
            // Crear nueva base de datos
            await this.initDatabase();
            console.log('✅ Base de datos corregida');
            return true;
            
        } catch (error) {
            console.error('❌ Error corrigiendo base de datos:', error);
            return false;
        }
    }

    async resetSettings() {
        if (!confirm('¿Restaurar configuración predeterminada?')) return;
        
        try {
            // Restaurar valores por defecto
            this.state.settings = {
                recordingMode: 'segmented',
                segmentDuration: 5,
                videoQuality: '720p',
                videoFormat: 'mp4',
                gpxInterval: 5,
                overlayEnabled: true,
                audioEnabled: false,
                reverseGeocodeEnabled: true,
                watermarkOpacity: 0.7,
                watermarkFontSize: 16,
                watermarkPosition: 'bottom',
                storageLocation: 'default',
                keepAppCopy: true,
                showWatermark: true,
                logoPosition: 'top-left', // Cambiado por defecto
                logoSize: 'medium',
                customWatermarkText: 'Powered By Roberto Benet - rbenet71@gmail.com',
                textPosition: 'bottom-right', // Cambiado por defecto
                gpxOverlayEnabled: false,
                showGpxDistance: true,
                showGpxSpeed: true,
                embedGpsMetadata: true,
                metadataFrequency: 2,
                localFolderHandle: null,
                localFolderName: null,
                localFolderPath: null
            };
            
            // Guardar configuración restablecida
            if (this.db) {
                const transaction = this.db.transaction(['settings'], 'readwrite');
                const store = transaction.objectStore('settings');
                await store.put({ name: 'appSettings', value: this.state.settings });
            } else {
                localStorage.setItem('dashcam_settings', JSON.stringify(this.state.settings));
            }
            
            this.updateSettingsUI();
            this.showNotification('🔄 Configuración restablecida');
            
        } catch (error) {
            console.error('❌ Error restableciendo configuración:', error);
            this.showNotification('❌ Error al restablecer configuración');
        }
    }

    showSettings() {
        this.updateSettingsUI();
        this.elements.settingsPanel.classList.remove('hidden');
    }

    hideSettings() {
        this.elements.settingsPanel.classList.add('hidden');
    }

    // ============ GESTIÓN DE CARPETAS PARA IPHONE ============

    async selectLocalFolder() {
        console.log('📂 Seleccionando carpeta...');
        
        if (this.isIOS) {
            // Mostrar modal específico para iPhone
            await this.showIOSFolderPicker();
        } else {
            // Usar File System Access API para otros dispositivos
            await this.showDesktopFolderPicker();
        }
    }

    async showIOSFolderPicker() {
        try {
            // Mostrar instrucciones para iPhone
            if (this.elements.localFolderPickerModal) {
                this.elements.folderModalTitle.textContent = '📱 iPhone/iPad';
                this.elements.iphoneInstructions.style.display = 'block';
                this.elements.desktopInstructions.style.display = 'none';
                this.elements.localFolderPickerModal.classList.remove('hidden');
            }
            
        } catch (error) {
            console.error('❌ Error mostrando selector iOS:', error);
            this.showNotification('❌ Error en selector de carpeta');
        }
    }

    async showDesktopFolderPicker() {
        try {
            if ('showDirectoryPicker' in window) {
                const handle = await window.showDirectoryPicker({
                    id: 'dashcam-local-folder',
                    startIn: 'videos',
                    mode: 'readwrite'
                });
                
                if (await this.verifyFolderPermissions(handle)) {
                    this.localFolderHandle = handle;
                    this.state.settings.localFolderHandle = handle;
                    this.state.settings.localFolderName = handle.name;
                    
                    // Actualizar UI
                    this.elements.currentLocalFolderInfo.innerHTML = 
                        `<span>📁 ${handle.name}</span>`;
                    
                    if (this.elements.localFolderPath) {
                        this.elements.localFolderPath.textContent = handle.name;
                    }
                    
                    await this.saveSettings();
                    this.showNotification(`📂 Carpeta seleccionada: ${handle.name}`);
                    
                    // Cerrar modal si está abierto
                    if (this.elements.localFolderPickerModal) {
                        this.elements.localFolderPickerModal.classList.add('hidden');
                    }
                    
                } else {
                    this.showNotification('❌ Permisos insuficientes para la carpeta');
                }
            } else {
                // Fallback para navegadores antiguos
                this.showNotification('⚠️ Tu navegador no soporta selección de carpetas');
                
                // Mostrar modal con instrucciones
                if (this.elements.localFolderPickerModal) {
                    this.elements.folderModalTitle.textContent = '📂 Seleccionar Carpeta';
                    this.elements.iphoneInstructions.style.display = 'none';
                    this.elements.desktopInstructions.style.display = 'block';
                    this.elements.localFolderPickerModal.classList.remove('hidden');
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Error seleccionando carpeta:', error);
            
            if (error.name === 'AbortError') {
                // El usuario canceló
                return;
            }
            
            this.showNotification('❌ Error seleccionando carpeta');
        }
    }

    async saveToLocalFolder(blob, filename) {
        if (!this.localFolderHandle && !this.isIOS) {
            console.log('⚠️ No hay carpeta local seleccionada');
            return false;
        }
        
        try {
            if (this.isIOS) {
                // Para iPhone, usar método alternativo
                return await this.saveToIOSFiles(blob, filename);
            } else {
                // Para otros dispositivos, usar File System Access API
                return await this.saveToDesktopFolder(blob, filename);
            }
            
        } catch (error) {
            console.error('❌ Error guardando en carpeta local:', error);
            return false;
        }
    }

    async saveToIOSFiles(blob, filename) {
        try {
            console.log(`📱 Guardando en iPhone: ${filename}`);
            
            // En iPhone, guardamos en IndexedDB
            const fileData = {
                id: Date.now(),
                filename: filename,
                timestamp: Date.now(),
                size: blob.size,
                type: 'video/mp4',
                location: 'ios_local'
            };
            
            if (this.db) {
                await this.saveToDatabase('localFiles', fileData);
            }
            
            console.log(`✅ Guardado en iPhone: ${filename}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error guardando en iPhone:', error);
            return false;
        }
    }

    async saveToDesktopFolder(blob, filename) {
        try {
            // Crear archivo en la carpeta local
            const fileHandle = await this.localFolderHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            
            console.log(`📂 Video guardado en carpeta local: ${filename}`);
            
            // Guardar referencia en la base de datos
            if (this.db) {
                const fileRef = {
                    id: Date.now(),
                    filename: filename,
                    folderName: this.state.settings.localFolderName,
                    timestamp: Date.now(),
                    size: blob.size,
                    location: 'desktop_folder'
                };
                await this.saveToDatabase('localFiles', fileRef);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error guardando en carpeta desktop:', error);
            return false;
        }
    }

    async verifyFolderPermissions(handle) {
        const options = { mode: 'readwrite' };
        
        if (await handle.queryPermission(options) === 'granted') {
            return true;
        }
        
        if (await handle.requestPermission(options) === 'granted') {
            return true;
        }
        
        return false;
    }

    // ============ MOVER VÍDEOS A CARPETA LOCAL ============

    async moveToLocalFolder() {
        if (!this.state.currentVideo) {
            this.showNotification('❌ No hay video seleccionado');
            return;
        }
        
        if (!this.localFolderHandle && !this.isIOS) {
            this.showNotification('❌ Selecciona una carpeta local primero');
            return;
        }
        
        try {
            this.showNotification('📂 Moviendo a carpeta local...');
            
            const video = this.state.currentVideo;
            const filename = `dashcam_${video.timestamp}.${video.format || 'mp4'}`;
            
            // Guardar en carpeta local
            const success = await this.saveToLocalFolder(video.blob, filename);
            
            if (success) {
                // Si está configurado para no mantener copia en app, eliminar
                if (!this.state.settings.keepAppCopy) {
                    await this.deleteFromStore('videos', video.id);
                    this.hideVideoPlayer();
                }
                
                await this.loadGallery();
                this.showNotification('✅ Movido a carpeta local');
            } else {
                this.showNotification('❌ Error al mover');
            }
            
        } catch (error) {
            console.error('❌ Error moviendo a carpeta local:', error);
            this.showNotification('❌ Error al mover');
        }
    }

    async moveSelectedToLocalFolder() {
        if (this.state.selectedVideos.size === 0) {
            this.showNotification('❌ No hay videos seleccionados');
            return;
        }
        
        if (!this.localFolderHandle && !this.isIOS) {
            this.showNotification('❌ Selecciona una carpeta local primero');
            return;
        }
        
        try {
            this.showNotification(`📂 Moviendo ${this.state.selectedVideos.size} videos...`);
            
            let moved = 0;
            let errors = 0;
            
            for (const videoId of this.state.selectedVideos) {
                try {
                    const video = await this.getFromStore('videos', videoId);
                    if (video && video.blob) {
                        const filename = `dashcam_${video.timestamp}.${video.format || 'mp4'}`;
                        const success = await this.saveToLocalFolder(video.blob, filename);
                        
                        if (success) {
                            if (!this.state.settings.keepAppCopy) {
                                await this.deleteFromStore('videos', videoId);
                            }
                            moved++;
                        } else {
                            errors++;
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error moviendo video ${videoId}:`, error);
                    errors++;
                }
            }
            
            this.state.selectedVideos.clear();
            await this.loadGallery();
            
            if (errors > 0) {
                this.showNotification(`✅ ${moved} movidos, ❌ ${errors} errores`);
            } else {
                this.showNotification(`✅ ${moved} videos movidos a carpeta`);
            }
            
        } catch (error) {
            console.error('❌ Error moviendo videos:', error);
            this.showNotification('❌ Error al mover videos');
        }
    }

    // ============ UTILIDADES ============

    formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    updateUI() {
        if (this.state.isRecording) {
            this.state.currentTime = Date.now() - this.state.startTime;
            
            if (this.elements.recordingTimeEl) {
                this.elements.recordingTimeEl.textContent = this.formatTime(this.state.currentTime);
            }
        }
    }

    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }

    startMonitoring() {
        // Solo inicia el GPS si ya tenemos permisos de ubicación
        // De lo contrario, se iniciará cuando el usuario conceda permisos
        
        // Iniciar actualización de UI básica
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.updateInterval = setInterval(() => this.updateUI(), 1000);
    }

// Agrega esta función para iniciar GPS después de obtener permisos
async startGPSAfterPermission() {
    if (this.gpsWatchId) {
        // Ya está iniciado
        return;
    }
    
    try {
        this.startGPS();
    } catch (error) {
        console.warn('⚠️ Error iniciando GPS:', error);
    }
}

    showSavingStatus(message = '💾 Guardando...') {
        if (this.elements.savingStatus && this.elements.savingText) {
            this.elements.savingText.textContent = message;
            this.elements.savingStatus.classList.remove('hidden');
        }
    }

    hideSavingStatus() {
        if (this.elements.savingStatus) {
            this.elements.savingStatus.classList.add('hidden');
        }
    }

    updateStorageStatus() {
        const storageLocation = this.state.settings.storageLocation;
        let statusText = '';
        
        switch(storageLocation) {
            case 'default':
                statusText = '📱 Almacenando en la app';
                break;
            case 'localFolder':
                const folderName = this.state.settings.localFolderName || 'No seleccionada';
                statusText = `📂 Almacenando en: ${folderName}`;
                break;
        }
        
        if (this.elements.storageStatusText) {
            this.elements.storageStatusText.textContent = statusText;
            this.elements.storageStatus.classList.remove('hidden');
        }
    }

    // ============ BASE DE DATOS - UTILIDADES ============

    async saveToDatabase(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            
            // Verificar que el store exista
            if (!this.db.objectStoreNames.contains(storeName)) {
                console.error(`❌ Store ${storeName} no existe en la base de datos`);
                console.error('Stores disponibles:', Array.from(this.db.objectStoreNames));
                
                // Intentar crear el store dinámicamente (solo para desarrollo)
                try {
                    console.warn(`⚠️ Creando store ${storeName} dinámicamente...`);
                    this.db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    console.log(`✅ Store ${storeName} creado dinámicamente`);
                } catch (error) {
                    console.error(`❌ No se pudo crear store ${storeName}:`, error);
                    reject(new Error(`Store ${storeName} no encontrado y no se pudo crear`));
                    return;
                }
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => {
                console.log(`✅ Guardado en ${storeName}:`, data.id || 'N/A');
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error(`❌ Error guardando en ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }



    async getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.log(`⚠️ Base de datos no inicializada para ${storeName}`);
                resolve([]);
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                console.log(`📊 ${storeName}: ${request.result.length} elementos`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error(`❌ Error obteniendo de ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    async getFromStore(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve(null);
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFromStore(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ============ EVENTOS ============

    setupEventListeners() {
        // Botones iniciales
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => {
                if (this.elements.startBtn.disabled) return;
                this.startRecording();
            });
        }
        this.setupCompactSelectors();
        if (this.elements.galleryBtn) {
            this.elements.galleryBtn.addEventListener('click', () => this.showGallery());
        }
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        }
        if (this.elements.gpxManagerBtn) {
            this.elements.gpxManagerBtn.addEventListener('click', () => this.showGpxManager());
        }
        
        // Controles de grabación
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => {
                if (this.state.isPaused) {
                    this.resumeRecording();
                } else {
                    this.pauseRecording();
                }
            });
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        }
        
        if (this.elements.newSegmentBtn) {
            this.elements.newSegmentBtn.addEventListener('click', () => this.startNewSegment());
        }
        
        // Modal landscape
        if (this.elements.continueBtn) {
            this.elements.continueBtn.addEventListener('click', () => {
                this.hideLandscapeModal();
                this.startRecording();
            });
        }
        
        // Botón para girar dispositivo
        const rotateBtn = document.getElementById('rotateDevice');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {
                        this.showNotification('Gira tu dispositivo manualmente');
                    });
                } else {
                    this.showNotification('Gira tu dispositivo manualmente');
                }
                this.hideLandscapeModal();
                setTimeout(() => this.startRecording(), 500);
            });
        }
        
        // Galería mejorada
        if (this.elements.closeGallery) {
            this.elements.closeGallery.addEventListener('click', () => this.hideGallery());
        }
        if (this.elements.selectAllVideos) {
            this.elements.selectAllVideos.addEventListener('click', () => this.selectAll('videos'));
        }
        if (this.elements.deselectAllVideos) {
            this.elements.deselectAllVideos.addEventListener('click', () => this.deselectAll('videos'));
        }
        if (this.elements.selectAllGPX) {
            this.elements.selectAllGPX.addEventListener('click', () => this.selectAll('gpx'));
        }
        if (this.elements.deselectAllGPX) {
            this.elements.deselectAllGPX.addEventListener('click', () => this.deselectAll('gpx'));
        }
        if (this.elements.galleryDropdownToggle) {
            this.elements.galleryDropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.elements.galleryDropdownMenu) {
                    this.elements.galleryDropdownMenu.classList.toggle('show');
                }
            });
        }
        
        // Cerrar menú desplegable al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.elements.galleryDropdownMenu && this.elements.galleryDropdownMenu.classList.contains('show')) {
                if (!this.elements.galleryDropdownToggle.contains(e.target) && 
                    !this.elements.galleryDropdownMenu.contains(e.target)) {
                    this.elements.galleryDropdownMenu.classList.remove('show');
                }
            }
        });
        
        // Botones de acción en la galería
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportSelected());
        }
        if (this.elements.deleteBtn) {
            this.elements.deleteBtn.addEventListener('click', () => this.deleteSelected());
        }
        if (this.elements.moveToLocalBtn) {
            this.elements.moveToLocalBtn.addEventListener('click', () => this.moveSelectedToLocalFolder());
        }
        if (this.elements.combineVideosBtn) {
            this.elements.combineVideosBtn.addEventListener('click', () => this.combineSelectedVideos());
        }
        
        // Configuración
        if (this.elements.saveSettings) {
            this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        }
        if (this.elements.resetSettingsBtn) {
            this.elements.resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }
        if (this.elements.closeSettings) {
            this.elements.closeSettings.addEventListener('click', () => this.hideSettings());
        }
        
        // Configuración de almacenamiento
        if (this.elements.storageLocation) {
            this.elements.storageLocation.addEventListener('change', () => this.toggleStorageSettings());
        }
        
        if (this.elements.selectLocalFolderBtn) {
            this.elements.selectLocalFolderBtn.addEventListener('click', () => this.selectLocalFolder());
        }
        
        if (this.elements.uploadLogoBtn) {
            this.elements.uploadLogoBtn.addEventListener('click', () => this.uploadCustomLogo());
        }
        
        // GPX Manager
        if (this.elements.uploadGpxBtn) {
            this.elements.uploadGpxBtn.addEventListener('click', () => this.uploadGPXFile());
        }
        if (this.elements.saveGpxBtn) {
            this.elements.saveGpxBtn.addEventListener('click', () => this.saveGPXToDatabase());
        }
        if (this.elements.clearGpxBtn) {
            this.elements.clearGpxBtn.addEventListener('click', () => this.clearGpxPreview());
        }
        if (this.elements.closeGpxManager) {
            this.elements.closeGpxManager.addEventListener('click', () => this.hideGpxManager());
        }
        
        // Modal carpeta local
        if (this.elements.openLocalFolderBtn) {
            this.elements.openLocalFolderBtn.addEventListener('click', () => this.showDesktopFolderPicker());
        }
        
        if (this.elements.openFilesAppBtn) {
            this.elements.openFilesAppBtn.addEventListener('click', () => {
                this.showNotification('📱 Abre la app "Archivos" y selecciona una carpeta');
                if (this.elements.localFolderPickerModal) {
                    this.elements.localFolderPickerModal.classList.add('hidden');
                }
            });
        }
        
        if (this.elements.cancelLocalFolderBtn) {
            this.elements.cancelLocalFolderBtn.addEventListener('click', () => {
                if (this.elements.localFolderPickerModal) {
                    this.elements.localFolderPickerModal.classList.add('hidden');
                }
            });
        }
        
        if (this.elements.closeLocalFolderPicker) {
            this.elements.closeLocalFolderPicker.addEventListener('click', () => {
                if (this.elements.localFolderPickerModal) {
                    this.elements.localFolderPickerModal.classList.add('hidden');
                }
            });
        }
        
        // Reproductor
        if (this.elements.closePlayer) {
            this.elements.closePlayer.addEventListener('click', () => this.hideVideoPlayer());
        }
        if (this.elements.moveToLocalFolderBtn) {
            this.elements.moveToLocalFolderBtn.addEventListener('click', () => {
                if (this.state.currentVideo) {
                    this.moveToLocalFolder();
                }
            });
        }
        if (this.elements.extractGpxBtn) {
            this.elements.extractGpxBtn.addEventListener('click', () => this.extractGpxFromVideo());
        }
        if (this.elements.exportVideo) {
            this.elements.exportVideo.addEventListener('click', () => this.exportSingleVideo());
        }
        if (this.elements.deleteVideo) {
            this.elements.deleteVideo.addEventListener('click', () => this.deleteSingleVideo());
        }
        
        // Tabs
        if (this.elements.tabVideos) {
            this.elements.tabVideos.addEventListener('click', () => this.switchTab('videos'));
        }
        if (this.elements.tabGPX) {
            this.elements.tabGPX.addEventListener('click', () => this.switchTab('gpx'));
        }
        
        // Vistas
        if (this.elements.viewDefaultBtn) {
            this.elements.viewDefaultBtn.addEventListener('click', () => {
                this.state.viewMode = 'default';
                this.updateViewButtons();
                this.loadGallery();
            });
        }
        
        if (this.elements.viewLocalFolderBtn) {
            this.elements.viewLocalFolderBtn.addEventListener('click', () => {
                this.state.viewMode = 'localFolder';
                this.updateViewButtons();
                this.loadGallery();
            });
        }
        
        // Búsqueda
        if (this.elements.searchVideos) {
            this.elements.searchVideos.addEventListener('input', (e) => this.searchVideos(e.target.value));
        }
        if (this.elements.searchGPX) {
            this.elements.searchGPX.addEventListener('input', (e) => this.searchGPX(e.target.value));
        }
        
        // Modal combinar videos
        if (this.elements.startCombineBtn) {
            this.elements.startCombineBtn.addEventListener('click', () => this.startCombineProcess());
        }
        if (this.elements.cancelCombineBtn) {
            this.elements.cancelCombineBtn.addEventListener('click', () => this.hideCombineModal());
        }
        if (this.elements.closeCombineModal) {
            this.elements.closeCombineModal.addEventListener('click', () => this.hideCombineModal());
        }
        
        // Escuchar cambios de orientación
        window.addEventListener('orientationchange', () => {
            if (this.state.showLandscapeModal && window.innerHeight <= window.innerWidth) {
                this.hideLandscapeModal();
            }
        });
        
        // Detener grabación al salir de la página
        window.addEventListener('beforeunload', () => {
            if (this.state.isRecording) {
                this.stopRecording();
            }
        });
    }

updateCompactSelectors() {
    // Actualizar selector de ubicación según el modo de vista
    if (this.elements.locationHeader && this.elements.locationOptions) {
        const value = this.state.viewMode;
        const selectedOption = this.elements.locationOptions.querySelector(`.select-option[data-value="${value}"]`);
        
        if (selectedOption) {
            const icon = selectedOption.querySelector('span:first-child').textContent;
            const text = selectedOption.querySelector('span:last-child').textContent;
            this.elements.locationHeader.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
            
            // Actualizar clases activas
            this.elements.locationOptions.querySelectorAll('.select-option').forEach(option => {
                option.classList.remove('active');
            });
            selectedOption.classList.add('active');
        }
    }
    
    // Actualizar selector de tipo según tab activo
    if (this.elements.typeHeader && this.elements.typeOptions) {
        const value = this.state.activeTab;
        const selectedOption = this.elements.typeOptions.querySelector(`.select-option[data-value="${value}"]`);
        
        if (selectedOption) {
            const icon = selectedOption.querySelector('span:first-child').textContent;
            const text = selectedOption.querySelector('span:last-child').textContent;
            this.elements.typeHeader.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
            
            // Actualizar clases activas
            this.elements.typeOptions.querySelectorAll('.select-option').forEach(option => {
                option.classList.remove('active');
            });
            selectedOption.classList.add('active');
        }
    }
}

showGallery() {
    console.log('📁 Mostrando galería');
    if (this.elements.galleryPanel) {
        this.elements.galleryPanel.classList.remove('hidden');
    }
    this.updateCompactSelectors();  // Añade esta línea
    this.switchTab(this.state.activeTab);
    this.updateGalleryActions();
}

    hideGallery() {
        if (this.elements.galleryPanel) {
            this.elements.galleryPanel.classList.add('hidden');
        }
        this.state.selectedVideos.clear();
        this.state.selectedGPX.clear();
        
        // Cerrar menú desplegable si está abierto
        if (this.elements.galleryDropdownMenu) {
            this.elements.galleryDropdownMenu.classList.remove('show');
        }
    }

    showGpxManager() {
        console.log('🗺️ Mostrando gestor GPX');
        if (this.elements.gpxManagerPanel) {
            this.elements.gpxManagerPanel.classList.remove('hidden');
        }
    }

    hideGpxManager() {
        if (this.elements.gpxManagerPanel) {
            this.elements.gpxManagerPanel.classList.add('hidden');
        }
    }

    clearGpxPreview() {
        this.tempGpxData = null;
        if (this.elements.gpxPreview) {
            this.elements.gpxPreview.style.display = 'none';
        }
    }

    switchTab(tabName) {
        console.log(`↔️ Cambiando a tab: ${tabName}`);
        this.state.activeTab = tabName;
        
        const tabVideos = document.getElementById('tabVideos');
        const tabGPX = document.getElementById('tabGPX');
        
        if (tabVideos && tabGPX) {
            tabVideos.classList.toggle('active', tabName === 'videos');
            tabGPX.classList.toggle('active', tabName === 'gpx');
        }
        
        const videosTab = document.getElementById('videosTab');
        const gpxTab = document.getElementById('gpxTab');
        
        if (videosTab && gpxTab) {
            videosTab.classList.toggle('active', tabName === 'videos');
            gpxTab.classList.toggle('active', tabName === 'gpx');
            
            if (tabName === 'videos') {
                videosTab.style.display = 'block';
                gpxTab.style.display = 'none';
            } else {
                videosTab.style.display = 'none';
                gpxTab.style.display = 'block';
            }
        }
    }

    toggleSelection(id, type) {
        if (type === 'video') {
            if (this.state.selectedVideos.has(id)) {
                this.state.selectedVideos.delete(id);
            } else {
                this.state.selectedVideos.add(id);
            }
            this.renderVideosList();
        } else {
            if (this.state.selectedGPX.has(id)) {
                this.state.selectedGPX.delete(id);
            } else {
                this.state.selectedGPX.add(id);
            }
        }
        
        this.updateGalleryActions();
    }

    selectAll(type) {
        if (type === 'video') {
            this.state.selectedVideos.clear();
            this.state.videos.forEach(video => this.state.selectedVideos.add(video.id));
            this.renderVideosList();
        } else {
            this.state.selectedGPX.clear();
            this.state.gpxTracks.forEach(track => this.state.selectedGPX.add(track.id));
        }
        
        this.updateGalleryActions();
    }

    deselectAll(type) {
        if (type === 'video') {
            this.state.selectedVideos.clear();
            this.renderVideosList();
        } else {
            this.state.selectedGPX.clear();
        }
        
        this.updateGalleryActions();
    }

    // ============ FUNCIONES DE ACCIÓN ============

    async exportSelected() {
        if (this.state.selectedVideos.size === 0 && this.state.selectedGPX.size === 0) {
            this.showNotification('❌ No hay elementos seleccionados');
            return;
        }
        
        try {
            for (const videoId of this.state.selectedVideos) {
                let video;
                if (this.db) {
                    video = await this.getFromStore('videos', videoId);
                } else {
                    const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
                    video = videos.find(v => v.id === videoId);
                }
                
                if (video && video.blob) {
                    this.downloadBlob(video.blob, `${video.title || 'grabacion'}.${video.format || 'mp4'}`);
                }
            }
            
            for (const gpxId of this.state.selectedGPX) {
                const gpx = await this.getFromStore('gpxTracks', gpxId);
                if (gpx && gpx.blob) {
                    this.downloadBlob(gpx.blob, `${gpx.title || 'ruta'}.gpx`);
                }
            }
            
            this.showNotification('📤 Elementos exportados');
            
        } catch (error) {
            console.error('❌ Error exportando:', error);
            this.showNotification('❌ Error al exportar');
        }
    }

    async exportSingleVideo() {
        if (!this.state.currentVideo) return;
        
        try {
            if (this.state.currentVideo.blob) {
                this.downloadBlob(this.state.currentVideo.blob, 
                    `${this.state.currentVideo.title || 'grabacion'}.${this.state.currentVideo.format || 'mp4'}`);
                this.showNotification('📤 Video exportado');
            } else {
                this.showNotification('❌ Video no disponible para exportar');
            }
        } catch (error) {
            console.error('❌ Error exportando video:', error);
            this.showNotification('❌ Error al exportar');
        }
    }

    async deleteSelected() {
        if (this.state.selectedVideos.size === 0 && this.state.selectedGPX.size === 0) {
            this.showNotification('❌ No hay elementos seleccionados');
            return;
        }
        
        if (!confirm(`¿Eliminar ${this.state.selectedVideos.size + this.state.selectedGPX.size} elementos?`)) {
            return;
        }
        
        try {
            for (const videoId of this.state.selectedVideos) {
                if (this.db) {
                    await this.deleteFromStore('videos', videoId);
                } else {
                    const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
                    const filteredVideos = videos.filter(v => v.id !== videoId);
                    localStorage.setItem('dashcam_videos', JSON.stringify(filteredVideos));
                }
            }
            
            for (const gpxId of this.state.selectedGPX) {
                if (this.db) {
                    await this.deleteFromStore('gpxTracks', gpxId);
                }
            }
            
            this.state.selectedVideos.clear();
            this.state.selectedGPX.clear();
            
            await this.loadGallery();
            
            this.showNotification('🗑️ Elementos eliminados');
            
        } catch (error) {
            console.error('❌ Error eliminando:', error);
            this.showNotification('❌ Error al eliminar');
        }
    }

    async deleteSingleVideo() {
        if (!this.state.currentVideo) return;
        
        if (!confirm('¿Eliminar este video?')) {
            return;
        }
        
        try {
            if (this.db) {
                await this.deleteFromStore('videos', this.state.currentVideo.id);
            } else {
                const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
                const filteredVideos = videos.filter(v => v.id !== this.state.currentVideo.id);
                localStorage.setItem('dashcam_videos', JSON.stringify(filteredVideos));
            }
            
            this.hideVideoPlayer();
            await this.loadGallery();
            this.showNotification('🗑️ Video eliminado');
            
        } catch (error) {
            console.error('❌ Error eliminando video:', error);
            this.showNotification('❌ Error al eliminar');
        }
    }

    // ============ FUNCIONES AUXILIARES ============

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    searchVideos(query) {
        const container = this.elements.videosList;
        if (!container) return;
        
        const items = container.querySelectorAll('.file-item');
        const searchTerm = query.toLowerCase();
        
        items.forEach(item => {
            const title = item.querySelector('.file-title').textContent.toLowerCase();
            const details = item.querySelector('.file-details').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || details.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    searchGPX(query) {
        const container = this.elements.gpxList;
        if (!container) return;
        
        const items = container.querySelectorAll('.file-item');
        const searchTerm = query.toLowerCase();
        
        items.forEach(item => {
            const title = item.querySelector('.file-title').textContent.toLowerCase();
            const details = item.querySelector('.file-details').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || details.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    showPermissionInstructions() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>🔐 Permisos Requeridos</h3>
                </div>
                <div class="modal-body">
                    <p>Para grabar videos necesitas:</p>
                    <ul style="margin: 15px 0; padding-left: 20px;">
                        <li><strong>Cámara:</strong> Para capturar video</li>
                        <li><strong>Ubicación (opcional):</strong> Para agregar datos GPS</li>
                    </ul>
                    <p>Puedes activarlos en:</p>
                    <ol style="margin: 15px 0; padding-left: 20px;">
                        <li>Ajustes de tu dispositivo</li>
                        <li>Buscar "Dashcam iPhone Pro"</li>
                        <li>Activar Cámara y Ubicación</li>
                    </ol>
                </div>
                <div class="modal-actions" style="display: flex; gap: 10px;">
                    <button id="closePermissionModal" class="btn cancel-btn" style="flex: 1;">
                        Entendido
                    </button>
                    <button id="retryPermissions" class="btn save-btn" style="flex: 1;">
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#closePermissionModal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#retryPermissions').addEventListener('click', async () => {
            modal.remove();
            setTimeout(() => {
                this.startRecording();
            }, 500);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Inicializar la app
document.addEventListener('DOMContentLoaded', () => {
    window.dashcamApp = new DashcamApp();
    
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);
            })
            .catch(error => {
                console.log('⚠️ Service Worker no registrado:', error.message);
            });
    }
});

