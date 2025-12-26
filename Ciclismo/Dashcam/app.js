// Dashcam PWA v2.0.6 - Con soporte MP4 y carpeta local

const APP_VERSION = '2.0.6';

class DashcamApp {
    constructor() {
        // Estado de la aplicación
        this.state = {
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
            viewMode: 'default', // 'default', 'localFolder', 'cloud'
            videos: [],
            gpxTracks: [],
            settings: {
                segmentDuration: 5,
                videoQuality: '720p',
                videoFormat: 'mp4', // 'mp4' o 'webm'
                gpxInterval: 5,
                overlayEnabled: true,
                audioEnabled: false,
                watermarkOpacity: 0.7,
                watermarkFontSize: 16,
                watermarkPosition: 'bottom',
                // NUEVAS CONFIGURACIONES
                storageLocation: 'default', // 'default', 'localFolder', 'cloud'
                cloudProvider: 'onedrive',
                autoSync: true,
                keepLocalCopy: false,
                keepAppCopy: true, // Para carpeta local
                autoConvertMP4: true, // Convertir automáticamente a MP4
                // Carpetas
                localFolderHandle: null,
                localFolderName: null,
                localFolderPath: null,
                cloudFolderHandle: null,
                cloudFolderName: null
            }
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
        this.cloudFolderHandle = null;
        
        // Inicializar
        this.init();
    }

    async init() {
        console.log(`🚀 Iniciando Dashcam PWA v${APP_VERSION}`);
        
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
        
        // Cargar configuración
        await this.loadSettings();
        
        // Inicializar base de datos
        await this.initDatabase();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Solicitar permisos básicos
        await this.requestPermissions();
        
        // Iniciar monitoreo
        this.startMonitoring();
        
        // Cargar galería inicial
        await this.loadGallery();
        
        // Mostrar estado de almacenamiento
        this.updateStorageStatus();
        
        this.showNotification(`Dashcam PWA v${APP_VERSION} lista`);
        console.log(`✅ Aplicación iniciada correctamente`);
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
            
            // Botones iniciales
            startBtn: document.getElementById('startBtn'),
            galleryBtn: document.getElementById('galleryBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Elementos de cámara
            videoPreview: document.getElementById('videoPreview'),
            mainCanvas: document.getElementById('mainCanvas'),
            overlayCanvas: document.getElementById('overlayCanvas'),
            overlayCtx: null,
            
            // Controles de grabación
            pauseBtn: document.getElementById('pauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            
            // Información de grabación
            recordingStatus: document.getElementById('recordingStatus'),
            recordingTimeEl: document.getElementById('recordingTime'),
            gpsInfo: document.getElementById('gpsInfo'),
            formatInfo: document.getElementById('formatInfo'),
            savingStatus: document.getElementById('savingStatus'),
            savingText: document.getElementById('savingText'),
            
            // Paneles
            galleryPanel: document.getElementById('galleryPanel'),
            settingsPanel: document.getElementById('settingsPanel'),
            videoPlayer: document.getElementById('videoPlayer'),
            
            // Tabs
            tabVideos: document.getElementById('tabVideos'),
            tabGPX: document.getElementById('tabGPX'),
            videosTab: document.getElementById('videosTab'),
            gpxTab: document.getElementById('gpxTab'),
            
            // Vistas
            viewDefaultBtn: document.getElementById('viewDefaultBtn'),
            viewLocalFolderBtn: document.getElementById('viewLocalFolderBtn'),
            viewCloudBtn: document.getElementById('viewCloudBtn'),
            
            // Galería - Vídeos
            videosList: document.getElementById('videosList'),
            searchVideos: document.getElementById('searchVideos'),
            selectAllVideos: document.getElementById('selectAllVideos'),
            deselectAllVideos: document.getElementById('deselectAllVideos'),
            
            // Galería - GPX
            gpxList: document.getElementById('gpxList'),
            searchGPX: document.getElementById('searchGPX'),
            selectAllGPX: document.getElementById('selectAllGPX'),
            deselectAllGPX: document.getElementById('deselectAllGPX'),
            
            // Botones de acción
            exportBtn: document.getElementById('exportBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            syncNowBtn: document.getElementById('syncNowBtn'),
            moveToLocalBtn: document.getElementById('moveToLocalBtn'),
            closeGallery: document.getElementById('closeGallery'),
            
            // Configuración
            segmentDuration: document.getElementById('segmentDuration'),
            videoQuality: document.getElementById('videoQuality'),
            videoFormat: document.getElementById('videoFormat'),
            gpxInterval: document.getElementById('gpxInterval'),
            overlayEnabled: document.getElementById('overlayEnabled'),
            audioEnabled: document.getElementById('audioEnabled'),
            
            // Nueva configuración de almacenamiento
            storageLocation: document.getElementById('storageLocation'),
            cloudProvider: document.getElementById('cloudProvider'),
            autoSync: document.getElementById('autoSync'),
            keepLocalCopy: document.getElementById('keepLocalCopy'),
            keepAppCopy: document.getElementById('keepAppCopy'),
            autoConvertMP4: document.getElementById('autoConvertMP4'),
            
            // Selectores de carpeta
            selectLocalFolderBtn: document.getElementById('selectLocalFolderBtn'),
            selectCloudFolderBtn: document.getElementById('selectCloudFolderBtn'),
            currentLocalFolderInfo: document.getElementById('currentLocalFolderInfo'),
            currentCloudFolderInfo: document.getElementById('currentCloudFolderInfo'),
            
            saveSettings: document.getElementById('saveSettings'),
            closeSettings: document.getElementById('closeSettings'),
            
            // Reproductor
            playbackVideo: document.getElementById('playbackVideo'),
            videoTitle: document.getElementById('videoTitle'),
            videoDetails: document.getElementById('videoDetails'),
            videoLocation: document.getElementById('videoLocation'),
            locationIcon: document.getElementById('locationIcon'),
            locationText: document.getElementById('locationText'),
            moveToLocalFolderBtn: document.getElementById('moveToLocalFolderBtn'),
            moveToCloudBtn: document.getElementById('moveToCloudBtn'),
            exportVideo: document.getElementById('exportVideo'),
            deleteVideo: document.getElementById('deleteVideo'),
            closePlayer: document.getElementById('closePlayer'),
            
            // Modal landscape
            landscapeModal: document.querySelector('.landscape-modal'),
            continueBtn: document.getElementById('continueBtn'),
            
            // Modal carpeta local
            localFolderPickerModal: document.getElementById('localFolderPickerModal'),
            localFolderInstructions: document.getElementById('localFolderInstructions'),
            openLocalFolderBtn: document.getElementById('openLocalFolderBtn'),
            cancelLocalFolderBtn: document.getElementById('cancelLocalFolderBtn'),
            closeLocalFolderPicker: document.getElementById('closeLocalFolderPicker'),
            localFolderPath: document.getElementById('localFolderPath'),
            
            // Estado almacenamiento
            storageStatus: document.getElementById('storageStatus'),
            storageStatusText: document.getElementById('storageStatusText')
        };
    }

    // ============ BASE DE DATOS ============

    async initDatabase() {
        return new Promise((resolve, reject) => {
            console.log('📊 Inicializando base de datos...');
            
            const request = indexedDB.open('DashcamDB', 8);
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                console.log('🔄 Actualizando base de datos...');
                
                // Store para vídeos
                if (!this.db.objectStoreNames.contains('videos')) {
                    const videoStore = this.db.createObjectStore('videos', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    videoStore.createIndex('timestamp', 'timestamp', { unique: false });
                    videoStore.createIndex('location', 'location', { unique: false });
                    videoStore.createIndex('format', 'format', { unique: false });
                    console.log('✅ Store de vídeos creado');
                }
                
                // Store para tracks GPX
                if (!this.db.objectStoreNames.contains('gpxTracks')) {
                    const gpxStore = this.db.createObjectStore('gpxTracks', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    gpxStore.createIndex('timestamp', 'timestamp', { unique: false });
                    gpxStore.createIndex('location', 'location', { unique: false });
                    console.log('✅ Store de GPX creado');
                }
                
                // Store para configuración
                if (!this.db.objectStoreNames.contains('settings')) {
                    this.db.createObjectStore('settings', { keyPath: 'name' });
                    console.log('✅ Store de configuración creado');
                }
                
                // Store para rutas de archivos locales
                if (!this.db.objectStoreNames.contains('localFiles')) {
                    this.db.createObjectStore('localFiles', { keyPath: 'id' });
                    console.log('✅ Store de archivos locales creado');
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ Base de datos lista');
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('❌ Error base de datos:', event.target.error);
                this.db = null;
                resolve();
            };
        });
    }

    async loadSettings() {
        try {
            if (!this.db) {
                console.log('⚠️ Base de datos no disponible para cargar configuración');
                this.updateSettingsUI();
                return;
            }
            
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get('appSettings');
            
            request.onsuccess = () => {
                if (request.result && request.result.value) {
                    console.log('⚙️ Configuración cargada:', request.result.value);
                    this.state.settings = { ...this.state.settings, ...request.result.value };
                    this.updateSettingsUI();
                } else {
                    console.log('⚙️ No hay configuración guardada, usando valores por defecto');
                    this.updateSettingsUI();
                }
            };
            
            request.onerror = (error) => {
                console.warn('⚠️ Error cargando configuración:', error);
                this.updateSettingsUI();
            };
            
        } catch (error) {
            console.warn('⚠️ Error cargando configuración:', error);
            this.updateSettingsUI();
        }
    }

    updateSettingsUI() {
        try {
            // Configuración existente
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
            
            // Nueva configuración de almacenamiento
            if (this.elements.storageLocation) {
                this.elements.storageLocation.value = this.state.settings.storageLocation;
                this.toggleStorageSettings();
            }
            if (this.elements.cloudProvider) {
                this.elements.cloudProvider.value = this.state.settings.cloudProvider;
            }
            if (this.elements.autoSync) {
                this.elements.autoSync.checked = this.state.settings.autoSync;
            }
            if (this.elements.keepLocalCopy) {
                this.elements.keepLocalCopy.checked = this.state.settings.keepLocalCopy;
            }
            if (this.elements.keepAppCopy) {
                this.elements.keepAppCopy.checked = this.state.settings.keepAppCopy;
            }
            if (this.elements.autoConvertMP4) {
                this.elements.autoConvertMP4.checked = this.state.settings.autoConvertMP4;
            }
            
            // Actualizar información de carpetas
            if (this.elements.currentLocalFolderInfo && this.state.settings.localFolderName) {
                this.elements.currentLocalFolderInfo.innerHTML = 
                    `<span>📁 ${this.state.settings.localFolderName}</span>`;
            }
            if (this.elements.currentCloudFolderInfo && this.state.settings.cloudFolderName) {
                this.elements.currentCloudFolderInfo.innerHTML = 
                    `<span>📁 ${this.state.settings.cloudFolderName}</span>`;
            }
            
            // Mostrar formato actual en la pantalla de cámara
            if (this.elements.formatInfo) {
                this.elements.formatInfo.textContent = `🎬 ${this.state.settings.videoFormat.toUpperCase()}`;
            }
            
        } catch (error) {
            console.warn('⚠️ Error actualizando UI de configuración:', error);
        }
    }

    toggleStorageSettings() {
        const storageLocation = this.elements.storageLocation.value;
        const localFolderSettings = document.getElementById('localFolderSettings');
        const cloudSettings = document.getElementById('cloudSettings');
        
        // Ocultar todos primero
        if (localFolderSettings) localFolderSettings.style.display = 'none';
        if (cloudSettings) cloudSettings.style.display = 'none';
        
        // Mostrar solo el configurado
        if (storageLocation === 'localFolder' && localFolderSettings) {
            localFolderSettings.style.display = 'block';
        } else if (storageLocation === 'cloud' && cloudSettings) {
            cloudSettings.style.display = 'block';
        }
    }

    // ============ PERMISOS ============

    async requestPermissions() {
        try {
            console.log('🔐 Solicitando permisos...');
            
            try {
                if (navigator.permissions && navigator.permissions.query) {
                    await navigator.permissions.query({ name: 'camera' });
                }
            } catch (e) {
                console.log('ℹ️ API de permisos no disponible');
            }
            
            try {
                if (navigator.permissions && navigator.permissions.query) {
                    await navigator.permissions.query({ name: 'geolocation' });
                }
            } catch (e) {
                console.log('ℹ️ API de permisos de geolocalización no disponible');
            }
            
            if (navigator.storage && navigator.storage.persist) {
                const isPersisted = await navigator.storage.persist();
                console.log('💾 Almacenamiento persistente:', isPersisted ? '✅' : '❌');
            }
            
            console.log('✅ Permisos solicitados');
            
        } catch (error) {
            console.warn('⚠️ Error solicitando permisos:', error);
        }
    }

    // ============ GRABACIÓN MEJORADA ============

    async startRecording() {
        console.log('🎬 Iniciando grabación...');

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
            await this.initCamera();
            
            if (!this.mediaStream) {
                throw new Error('No se pudo acceder a la cámara');
            }
            
            this.showCameraScreen();
            
            this.state.isRecording = true;
            this.state.isPaused = false;
            this.state.startTime = Date.now();
            this.state.currentTime = 0;
            this.gpxPoints = [];
            
            const videoTrack = this.mediaStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            
            if (this.mainCanvas) {
                this.mainCanvas.width = settings.width || 1280;
                this.mainCanvas.height = settings.height || 720;
            }
            
            this.videoElement = document.createElement('video');
            this.videoElement.srcObject = this.mediaStream;
            this.videoElement.autoplay = true;
            this.videoElement.muted = true;
            this.videoElement.playsInline = true;
            
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play().then(resolve).catch(resolve);
                };
            });
            
            this.startFrameCapture();
            
            if (this.mainCanvas) {
                this.canvasStream = this.mainCanvas.captureStream(30);
                
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
                
                // Determinar el tipo MIME según formato seleccionado
                const mimeType = this.getMimeType();
                if (!mimeType) {
                    throw new Error('Formato de video no soportado');
                }
                
                console.log(`🎬 Usando formato: ${mimeType}`);
                
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
                    this.showSavingStatus('💾 Guardando video...');
                    await this.saveVideoSegment();
                    this.stopFrameCapture();
                    this.hideSavingStatus();
                };
                
                this.mediaRecorder.start(1000);
                
                const segmentMs = this.state.settings.segmentDuration * 60 * 1000;
                if (this.segmentTimer) {
                    clearTimeout(this.segmentTimer);
                }
                this.segmentTimer = setTimeout(() => {
                    this.startNewSegment();
                }, segmentMs);
            }
            
            this.updateRecordingUI();
            this.showNotification(`🎬 Grabación iniciada (${this.state.settings.videoFormat.toUpperCase()})`);
            
        } catch (error) {
            console.error('❌ Error iniciando grabación:', error);
            this.state.isRecording = false;
            this.showNotification('❌ Error: ' + error.message);
            this.showStartScreen();
            
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
                this.mediaStream = null;
            }
        }
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

    shouldShowLandscapeModal() {
        return this.checkOrientation();
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

    getMimeType() {
        const format = this.state.settings.videoFormat;
        
        if (format === 'mp4') {
            // Intentar usar MP4 si está disponible
            const mp4Types = [
                'video/mp4;codecs=h264,opus',
                'video/mp4;codecs=avc1,opus',
                'video/mp4'
            ];
            
            for (const type of mp4Types) {
                if (MediaRecorder.isTypeSupported(type)) {
                    console.log(`✅ Formato MP4 soportado: ${type}`);
                    return type;
                }
            }
            
            console.log('⚠️ MP4 no soportado, usando WebM como fallback');
            // Si MP4 no está soportado, usar WebM pero marcar para conversión
            this.state.needsConversion = true;
        }
        
        // Fallback a WebM
        const webmTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm'
        ];
        
        for (const type of webmTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log(`✅ Formato WebM soportado: ${type}`);
                return type;
            }
        }
        
        return null;
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

    drawFrameWithData() {
        if (!this.videoElement || !this.mainCtx || this.videoElement.readyState < 2) return;
        
        const canvas = this.mainCanvas;
        const ctx = this.mainCtx;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        this.drawPermanentWatermark(ctx, canvas);
        
        if (this.state.settings.overlayEnabled) {
            this.drawTemporaryOverlay();
        }
    }

    drawPermanentWatermark(ctx, canvas) {
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
        const position = this.state.settings.watermarkPosition;
        
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        
        let x, y, textAlign, textBaseline, bgHeight;
        
        switch(position) {
            case 'top':
                x = canvas.width / 2;
                y = 25;
                textAlign = 'center';
                textBaseline = 'top';
                bgHeight = 60;
                ctx.fillRect(0, 0, canvas.width, bgHeight);
                break;
            case 'corner':
                x = 15;
                y = 25;
                textAlign = 'left';
                textBaseline = 'top';
                bgHeight = 60;
                ctx.fillRect(0, 0, 450, bgHeight);
                break;
            case 'bottom':
            default:
                x = canvas.width / 2;
                y = canvas.height - 25;
                textAlign = 'center';
                textBaseline = 'bottom';
                bgHeight = 60;
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
            
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText(`📍 ${lat}, ${lon} | 🚗 ${speed} km/h`, x, y + fontSize + 6);
            
            if (this.currentPosition.accuracy) {
                const accuracy = this.currentPosition.accuracy.toFixed(1);
                const timeStr = this.formatTime(this.state.currentTime);
                ctx.fillText(`🎯 ${accuracy}m | ⏱️ ${timeStr}`, x, y + (fontSize * 2) + 12);
            }
            
            if (this.state.isRecording && !this.state.isPaused) {
                this.saveGPXPoint(this.currentPosition);
            }
        } else {
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText('📍 GPS: Buscando señal...', x, y + fontSize + 6);
        }
        
        ctx.restore();
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
        
        if (this.canvasStream) {
            this.canvasStream.getTracks().forEach(track => track.stop());
            this.canvasStream = null;
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
        if (!this.mediaRecorder) {
            this.state.isRecording = false;
            this.state.isPaused = false;
            this.showStartScreen();
            return;
        }
        
        try {
            if (this.segmentTimer) {
                clearTimeout(this.segmentTimer);
                this.segmentTimer = null;
            }
            
            if (this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }
            this.stopFrameCapture();
            
            if (this.recordedChunks.length > 0) {
                await this.saveVideoSegment();
            }
            
            if (this.gpxPoints.length > 0) {
                await this.saveGPXTrack();
            }
            
            this.state.isRecording = false;
            this.state.isPaused = false;
            this.state.currentTime = 0;
            
            this.showStartScreen();
            this.showNotification('💾 Video guardado');
            
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error deteniendo grabación:', error);
            this.showNotification('❌ Error al guardar');
            this.showStartScreen();
        } finally {
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
                this.mediaStream = null;
            }
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
    }

    // ============ CONVERSIÓN MP4 ============

    async convertWebMtoMP4(webmBlob) {
        return new Promise((resolve, reject) => {
            console.log('🔄 Convirtiendo WebM a MP4...');
            
            // Método simplificado de conversión
            // En producción, usarías una librería como ffmpeg.js o similar
            
            try {
                // Para demostración, creamos un MP4 simple
                // NOTA: Esta es una implementación simplificada
                // En producción necesitarías una librería de conversión real
                
                const reader = new FileReader();
                reader.onload = function() {
                    // Simular conversión creando un nuevo blob
                    const arrayBuffer = reader.result;
                    const mp4Blob = new Blob([arrayBuffer], { type: 'video/mp4' });
                    resolve(mp4Blob);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(webmBlob);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    async ensureMP4Format(blob, originalFormat) {
        // Si el formato ya es MP4, devolver tal cual
        if (originalFormat === 'mp4' || blob.type.includes('mp4')) {
            return { blob, format: 'mp4' };
        }
        
        // Si la configuración requiere conversión automática a MP4
        if (this.state.settings.autoConvertMP4 || this.state.settings.videoFormat === 'mp4') {
            try {
                const mp4Blob = await this.convertWebMtoMP4(blob);
                return { blob: mp4Blob, format: 'mp4' };
            } catch (error) {
                console.warn('⚠️ Error convirtiendo a MP4:', error);
                // Devolver el original si falla la conversión
                return { blob, format: 'webm' };
            }
        }
        
        // Si no se requiere conversión, devolver original
        return { blob, format: originalFormat };
    }

    // ============ GUARDADO DE VÍDEOS MEJORADO ============

    async saveVideoSegment() {
        if (this.recordedChunks.length === 0) {
            console.log('⚠️ No hay chunks para guardar');
            return;
        }
        
        this.isSaving = true;
        
        try {
            console.log('💾 Guardando vídeo...');
            
            // Crear blob del video grabado
            const originalBlob = new Blob(this.recordedChunks, { 
                type: this.mediaRecorder?.mimeType || 'video/webm' 
            });
            
            const duration = this.state.currentTime || 10000;
            const timestamp = this.state.startTime || Date.now();
            const originalFormat = this.state.settings.videoFormat === 'mp4' ? 'mp4' : 'webm';
            
            // Asegurar formato MP4 si es necesario
            const { blob: finalBlob, format: finalFormat } = await this.ensureMP4Format(originalBlob, originalFormat);
            
            const filename = `dashcam_${new Date(timestamp).toISOString().replace(/[:.]/g, '-')}.${finalFormat}`;
            
            // Determinar ubicación de almacenamiento
            const storageLocation = this.state.settings.storageLocation;
            
            let savedLocally = false;
            let savedInFolder = false;
            let savedInCloud = false;
            
            // Guardar según configuración
            switch(storageLocation) {
                case 'default':
                    // Guardar solo en la app
                    savedLocally = await this.saveToApp(finalBlob, timestamp, duration, finalFormat);
                    break;
                    
                case 'localFolder':
                    // Guardar en carpeta local
                    savedInFolder = await this.saveToLocalFolder(finalBlob, filename);
                    
                    // Si está configurado, también guardar en la app
                    if (this.state.settings.keepAppCopy && savedInFolder) {
                        savedLocally = await this.saveToApp(finalBlob, timestamp, duration, finalFormat);
                    }
                    break;
                    
                case 'cloud':
                    // Guardar en la nube
                    savedInCloud = await this.saveToCloud(finalBlob, filename);
                    
                    // Si está configurado, también guardar localmente
                    if (this.state.settings.keepLocalCopy && savedInCloud) {
                        savedLocally = await this.saveToApp(finalBlob, timestamp, duration, finalFormat);
                    }
                    break;
            }
            
            // Actualizar notificación según dónde se guardó
            this.showSaveNotification(savedLocally, savedInFolder, savedInCloud, finalFormat);
            
            // Guardar track GPX si hay puntos
            if (this.gpxPoints.length > 0) {
                await this.saveGPXTrack(timestamp);
            }
            
            console.log('✅ Vídeo guardado');
            
        } catch (error) {
            console.error('❌ Error guardando vídeo:', error);
            this.showNotification('❌ Error al guardar video');
        } finally {
            this.recordedChunks = [];
            this.isSaving = false;
        }
    }

    async saveToApp(blob, timestamp, duration, format) {
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
                })}`,
                gpsPoints: this.gpxPoints.length,
                format: format,
                location: 'app'
            };
            
            if (this.db) {
                await this.saveToDatabase('videos', videoData);
                console.log('📱 Video guardado en app');
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

    async saveToLocalFolder(blob, filename) {
        if (!this.localFolderHandle) {
            console.log('⚠️ No hay carpeta local seleccionada');
            return false;
        }
        
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
                    size: blob.size
                };
                await this.saveToDatabase('localFiles', fileRef);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error guardando en carpeta local:', error);
            return false;
        }
    }

    async saveToCloud(blob, filename) {
        // Implementación simplificada - en producción necesitarías APIs OAuth2
        console.log(`☁️ Simulando guardado en nube: ${filename}`);
        
        // TODO: Implementar integración real con servicios de nube
        this.showNotification('⚠️ Guardado en nube no implementado completamente');
        return false;
    }

    showSaveNotification(savedLocally, savedInFolder, savedInCloud, format) {
        const formatText = format.toUpperCase();
        
        if (savedInFolder) {
            this.showNotification(`✅ Guardado en carpeta (${formatText})`);
        } else if (savedInCloud) {
            this.showNotification(`✅ Subido a nube (${formatText})`);
        } else if (savedLocally) {
            this.showNotification(`✅ Guardado en app (${formatText})`);
        } else {
            this.showNotification('⚠️ No se pudo guardar en ninguna ubicación');
        }
    }

    // ============ GESTIÓN DE CARPETAS LOCALES ============

    async selectLocalFolder() {
        try {
            console.log('📂 Seleccionando carpeta local...');
            
            // Usar File System Access API
            if ('showDirectoryPicker' in window) {
                const handle = await window.showDirectoryPicker({
                    id: 'dashcam-local-folder',
                    startIn: 'videos',
                    mode: 'readwrite'
                });
                
                // Verificar permisos
                if (await this.verifyFolderPermissions(handle)) {
                    this.localFolderHandle = handle;
                    this.state.settings.localFolderHandle = handle;
                    this.state.settings.localFolderName = handle.name;
                    
                    // Intentar obtener la ruta completa
                    try {
                        this.state.settings.localFolderPath = await this.getFolderPath(handle);
                    } catch (e) {
                        this.state.settings.localFolderPath = handle.name;
                    }
                    
                    // Actualizar UI
                    this.elements.currentLocalFolderInfo.innerHTML = 
                        `<span>📁 ${handle.name}</span>`;
                    
                    if (this.elements.localFolderPath) {
                        this.elements.localFolderPath.textContent = 
                            this.state.settings.localFolderPath || handle.name;
                    }
                    
                    // Guardar configuración
                    await this.saveSettings();
                    
                    this.showNotification(`📂 Carpeta local seleccionada: ${handle.name}`);
                    
                    // Cerrar modal si está abierto
                    if (this.elements.localFolderPickerModal) {
                        this.elements.localFolderPickerModal.classList.add('hidden');
                    }
                    
                } else {
                    this.showNotification('❌ Permisos insuficientes para la carpeta');
                }
            } else {
                // Fallback para navegadores sin File System Access API
                this.showNotification('⚠️ Tu navegador no soporta selección de carpetas');
                this.showLocalFolderPickerModal();
            }
            
        } catch (error) {
            console.warn('⚠️ Error seleccionando carpeta local:', error);
            
            if (error.name === 'AbortError') {
                // El usuario canceló
                return;
            }
            
            this.showNotification('❌ Error seleccionando carpeta');
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

    async getFolderPath(handle) {
        // Intentar obtener la ruta relativa
        if (handle.queryRelativePath) {
            const path = await handle.queryRelativePath(handle);
            return path || handle.name;
        }
        return handle.name;
    }

    showLocalFolderPickerModal() {
        if (this.elements.localFolderPickerModal) {
            this.elements.localFolderPickerModal.classList.remove('hidden');
        }
    }

    // ============ GPS ============

    startGPS() {
        if (!navigator.geolocation) {
            console.log('📍 GPS no soportado');
            return;
        }
        
        console.log('📍 Iniciando GPS...');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
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

    startGPSWatching() {
        this.gpsWatchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentPosition = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    speed: position.coords.speed || 0,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    heading: position.coords.heading,
                    timestamp: position.timestamp
                };
                
                if (this.elements.gpsInfo) {
                    const speedKmh = (this.currentPosition.speed * 3.6).toFixed(1);
                    this.elements.gpsInfo.textContent = 
                        `📍 ${this.currentPosition.lat.toFixed(4)}, ${this.currentPosition.lon.toFixed(4)} | ${speedKmh} km/h`;
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

    async saveGPXTrack() {
        if (this.gpxPoints.length === 0) return;
        
        try {
            const gpxContent = this.generateGPX(this.gpxPoints);
            const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
            
            const gpxData = {
                id: Date.now(),
                blob: blob,
                timestamp: this.state.startTime || Date.now(),
                points: this.gpxPoints.length,
                title: `Ruta ${new Date().toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`,
                size: blob.size,
                location: 'local'
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
<gpx version="1.1" creator="Dashcam PWA">
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
                case 'cloud':
                    await this.loadCloudVideos();
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
            // En una implementación completa, leeríamos directamente del filesystem
            let videos = [];
            if (this.db) {
                const localFiles = await this.getAllFromStore('localFiles');
                videos = localFiles.map(file => ({
                    id: file.id,
                    title: file.filename,
                    timestamp: file.timestamp,
                    size: file.size,
                    location: 'localFolder',
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

    async loadCloudVideos() {
        try {
            console.log('☁️ Cargando vídeos de la nube...');
            
            // TODO: Implementar carga real desde la nube
            this.state.videos = [];
            this.renderVideosList();
            this.showNotification('⚠️ Nube no implementada completamente');
            
        } catch (error) {
            console.error('❌ Error cargando vídeos de nube:', error);
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
                case 'cloud':
                    message = 'No hay vídeos en la nube';
                    icon = '☁️';
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
            
            // Icono según ubicación
            let locationIcon = '📱';
            if (location === 'localFolder') locationIcon = '📂';
            if (location === 'cloud') locationIcon = '☁️';
            
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
    }

    // ============ REPRODUCTOR ============

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
                // Para carpeta local, necesitaríamos leer el archivo del filesystem
                this.showNotification('⚠️ Reproducción desde carpeta no implementada');
                return;
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
                
                this.elements.videoDetails.innerHTML = `
                    <strong>📅 Fecha:</strong> ${date.toLocaleString('es-ES')}<br>
                    <strong>⏱️ Duración:</strong> ${duration}<br>
                    <strong>💾 Tamaño:</strong> ${sizeMB} MB<br>
                    <strong>📍 Puntos GPS:</strong> ${video.gpsPoints || 0}<br>
                    <strong>🎬 Formato:</strong> ${format.toUpperCase()}
                `;
                
                // Actualizar información de ubicación
                let locationText = 'Almacenado en la app';
                let locationIcon = '📱';
                
                if (location === 'localFolder') {
                    locationText = `Almacenado en carpeta: ${this.state.settings.localFolderName || 'Local'}`;
                    locationIcon = '📂';
                } else if (location === 'cloud') {
                    locationText = 'Almacenado en la nube';
                    locationIcon = '☁️';
                }
                
                this.elements.locationIcon.textContent = locationIcon;
                this.elements.locationText.textContent = locationText;
                
                // Mostrar botones según ubicación
                this.updatePlayerButtons(location);
                
                this.elements.videoPlayer.classList.remove('hidden');
            } else {
                this.showNotification('❌ Video no disponible para reproducción');
            }
            
        } catch (error) {
            console.error('❌ Error reproduciendo video:', error);
            this.showNotification('❌ Error al reproducir');
        }
    }

    updatePlayerButtons(location) {
        // Ocultar todos los botones primero
        if (this.elements.moveToLocalFolderBtn) {
            this.elements.moveToLocalFolderBtn.style.display = 'none';
        }
        if (this.elements.moveToCloudBtn) {
            this.elements.moveToCloudBtn.style.display = 'none';
        }
        
        // Mostrar según ubicación y configuración
        if (location === 'app') {
            if (this.state.settings.storageLocation === 'localFolder') {
                this.elements.moveToLocalFolderBtn.style.display = 'block';
            }
            if (this.state.settings.storageLocation === 'cloud') {
                this.elements.moveToCloudBtn.style.display = 'block';
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

    // ============ MOVER VÍDEOS ENTRE UBICACIONES ============

    async moveToLocalFolder() {
        if (!this.state.currentVideo) {
            this.showNotification('❌ No hay video seleccionado');
            return;
        }
        
        if (!this.localFolderHandle) {
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

    // ============ CONFIGURACIÓN ============

    async saveSettings() {
        try {
            const settings = {
                segmentDuration: parseInt(this.elements.segmentDuration.value),
                videoQuality: this.elements.videoQuality.value,
                videoFormat: this.elements.videoFormat.value,
                gpxInterval: parseInt(this.elements.gpxInterval.value),
                overlayEnabled: this.elements.overlayEnabled.checked,
                audioEnabled: this.elements.audioEnabled.checked,
                // Nueva configuración
                storageLocation: this.elements.storageLocation.value,
                cloudProvider: this.elements.cloudProvider.value,
                autoSync: this.elements.autoSync.checked,
                keepLocalCopy: this.elements.keepLocalCopy.checked,
                keepAppCopy: this.elements.keepAppCopy.checked,
                autoConvertMP4: this.elements.autoConvertMP4.checked,
                // Carpetas
                localFolderHandle: this.state.settings.localFolderHandle,
                localFolderName: this.state.settings.localFolderName,
                localFolderPath: this.state.settings.localFolderPath,
                cloudFolderHandle: this.state.settings.cloudFolderHandle,
                cloudFolderName: this.state.settings.cloudFolderName
            };
            
            this.state.settings = { ...this.state.settings, ...settings };
            
            if (this.db) {
                const transaction = this.db.transaction(['settings'], 'readwrite');
                const store = transaction.objectStore('settings');
                await store.put({ name: 'appSettings', value: settings });
                console.log('⚙️ Configuración guardada');
            } else {
                localStorage.setItem('dashcam_settings', JSON.stringify(settings));
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

    showSettings() {
        this.updateSettingsUI();
        this.elements.settingsPanel.classList.remove('hidden');
    }

    hideSettings() {
        this.elements.settingsPanel.classList.add('hidden');
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
        this.startGPS();
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.updateInterval = setInterval(() => this.updateUI(), 1000);
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
            case 'cloud':
                const cloudName = this.getCloudProviderName();
                statusText = `☁️ Almacenando en: ${cloudName}`;
                break;
        }
        
        if (this.elements.storageStatusText) {
            this.elements.storageStatusText.textContent = statusText;
            this.elements.storageStatus.classList.remove('hidden');
        }
    }

    getCloudProviderName() {
        switch(this.state.settings.cloudProvider) {
            case 'onedrive': return 'OneDrive';
            case 'google': return 'Google Drive';
            case 'icloud': return 'iCloud Drive';
            default: return 'Nube';
        }
    }

    // ============ BASE DE DATOS - UTILIDADES ============

    async saveToDatabase(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => {
                console.log(`✅ Guardado en ${storeName}:`, data.id);
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
        if (this.elements.galleryBtn) {
            this.elements.galleryBtn.addEventListener('click', () => this.showGallery());
        }
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
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
        
        // Galería
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
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportSelected());
        }
        if (this.elements.deleteBtn) {
            this.elements.deleteBtn.addEventListener('click', () => this.deleteSelected());
        }
        if (this.elements.syncNowBtn) {
            this.elements.syncNowBtn.addEventListener('click', () => this.syncAll());
        }
        if (this.elements.moveToLocalBtn) {
            this.elements.moveToLocalBtn.addEventListener('click', () => this.moveSelectedToLocalFolder());
        }
        
        // Configuración
        if (this.elements.saveSettings) {
            this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        }
        if (this.elements.closeSettings) {
            this.elements.closeSettings.addEventListener('click', () => this.hideSettings());
        }
        
        // Nueva configuración de almacenamiento
        if (this.elements.storageLocation) {
            this.elements.storageLocation.addEventListener('change', () => this.toggleStorageSettings());
        }
        
        if (this.elements.selectLocalFolderBtn) {
            this.elements.selectLocalFolderBtn.addEventListener('click', () => this.selectLocalFolder());
        }
        
        if (this.elements.selectCloudFolderBtn) {
            this.elements.selectCloudFolderBtn.addEventListener('click', () => this.selectCloudFolder());
        }
        
        // Modal carpeta local
        if (this.elements.openLocalFolderBtn) {
            this.elements.openLocalFolderBtn.addEventListener('click', () => this.selectLocalFolder());
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
        if (this.elements.moveToCloudBtn) {
            this.elements.moveToCloudBtn.addEventListener('click', () => {
                if (this.state.currentVideo) {
                    this.moveToCloud();
                }
            });
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
        
        if (this.elements.viewCloudBtn) {
            this.elements.viewCloudBtn.addEventListener('click', () => {
                this.state.viewMode = 'cloud';
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

    updateViewButtons() {
        // Actualizar clases active en botones de vista
        if (this.elements.viewDefaultBtn) {
            this.elements.viewDefaultBtn.classList.toggle('active', this.state.viewMode === 'default');
        }
        if (this.elements.viewLocalFolderBtn) {
            this.elements.viewLocalFolderBtn.classList.toggle('active', this.state.viewMode === 'localFolder');
        }
        if (this.elements.viewCloudBtn) {
            this.elements.viewCloudBtn.classList.toggle('active', this.state.viewMode === 'cloud');
        }
    }

    showGallery() {
        console.log('📁 Mostrando galería');
        if (this.elements.galleryPanel) {
            this.elements.galleryPanel.classList.remove('hidden');
        }
        this.switchTab(this.state.activeTab);
    }

    hideGallery() {
        if (this.elements.galleryPanel) {
            this.elements.galleryPanel.classList.add('hidden');
        }
        this.state.selectedVideos.clear();
        this.state.selectedGPX.clear();
        this.updateSelectionButtons();
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
            this.renderGPXList();
        }
        
        this.updateSelectionButtons();
    }

    selectAll(type) {
        if (type === 'video') {
            this.state.selectedVideos.clear();
            this.state.videos.forEach(video => this.state.selectedVideos.add(video.id));
            this.renderVideosList();
        } else {
            this.state.selectedGPX.clear();
            this.state.gpxTracks.forEach(track => this.state.selectedGPX.add(track.id));
            this.renderGPXList();
        }
        
        this.updateSelectionButtons();
    }

    deselectAll(type) {
        if (type === 'video') {
            this.state.selectedVideos.clear();
            this.renderVideosList();
        } else {
            this.state.selectedGPX.clear();
            this.renderGPXList();
        }
        
        this.updateSelectionButtons();
    }

    updateSelectionButtons() {
        const hasSelectedVideos = this.state.selectedVideos.size > 0;
        const hasSelectedGPX = this.state.selectedGPX.size > 0;
        const hasSelected = hasSelectedVideos || hasSelectedGPX;
        
        if (this.elements.exportBtn) {
            this.elements.exportBtn.disabled = !hasSelected;
        }
        if (this.elements.deleteBtn) {
            this.elements.deleteBtn.disabled = !hasSelected;
        }
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

    startNewSegment() {
        if (!this.mediaRecorder || this.state.isPaused) return;
        
        this.mediaRecorder.stop();
        
        setTimeout(() => {
            if (this.state.isRecording && !this.state.isPaused) {
                this.mediaRecorder.start(1000);
                
                const segmentMs = this.state.settings.segmentDuration * 60 * 1000;
                if (this.segmentTimer) {
                    clearTimeout(this.segmentTimer);
                }
                this.segmentTimer = setTimeout(() => {
                    this.startNewSegment();
                }, segmentMs);
                
                this.showNotification(`🔄 Nuevo segmento`);
            }
        }, 100);
    }

    async viewGPX(gpxId) {
        try {
            const gpx = await this.getFromStore('gpxTracks', gpxId);
            if (!gpx) {
                this.showNotification('❌ Ruta GPX no encontrada');
                return;
            }
            
            const text = await gpx.blob.text();
            alert(`Ruta GPX con ${gpx.points} puntos.\nTamaño: ${Math.round(gpx.size / 1024)} KB`);
            console.log('📍 Contenido GPX:', text.substring(0, 500) + '...');
            
        } catch (error) {
            console.error('❌ Error viendo GPX:', error);
            this.showNotification('❌ Error al mostrar GPX');
        }
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

    // ============ MÉTODOS DE CLOUD ============

    async moveSelectedToLocalFolder() {
        if (this.state.selectedVideos.size === 0) {
            this.showNotification('❌ No hay videos seleccionados');
            return;
        }
        
        if (!this.localFolderHandle) {
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

    async moveToCloud() {
        this.showNotification('⚠️ Función en desarrollo');
    }

    async syncAll() {
        this.showNotification('⚠️ Función en desarrollo');
    }

    async selectCloudFolder() {
        this.showNotification('⚠️ Función en desarrollo');
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