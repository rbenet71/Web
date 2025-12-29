// Dashcam PWA v4.0 - Versión Completa Simplificada

const APP_VERSION = '4.0';

class DashcamApp {
    constructor() {
        // Estado de la aplicación
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
                localFolderHandle: null,
                localFolderName: null,
                localFolderPath: null,
                showWatermark: true,
                logoPosition: 'top-left',
                logoSize: 'medium',
                customWatermarkText: 'Powered By Roberto Benet - rbenet71@gmail.com',
                textPosition: 'bottom-right',
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
        
        this.init();
    }

    async init() {
        console.log(`🚀 Iniciando Dashcam iPhone Pro v${APP_VERSION}`);
        
        // Inicializar elementos DOM
        this.initElements();
        
        // Inicializar canvas
        this.mainCanvas = document.getElementById('mainCanvas');
        if (this.mainCanvas) {
            this.mainCtx = this.mainCanvas.getContext('2d');
        }
        
        // Orden de inicialización
        await this.initDatabase();
        await this.loadSettings();
        await this.loadCustomLogo();
        await this.loadGPXFiles();
        
        this.setupEventListeners();
        this.startMonitoring();
        await this.loadGallery();
        this.updateStorageStatus();
        
        this.showNotification(`Dashcam iPhone Pro v${APP_VERSION} lista`);
        console.log(`✅ Aplicación iniciada correctamente`);
    }

    // ============ INICIALIZACIÓN ============

    initElements() {
        // Solo elementos esenciales
        this.elements = {
            startScreen: document.querySelector('.start-screen'),
            cameraScreen: document.querySelector('.camera-screen'),
            locationSelector: document.getElementById('locationSelector'),
            locationHeader: document.getElementById('locationHeader'),
            locationOptions: document.getElementById('locationOptions'),
            typeSelector: document.getElementById('typeSelector'),
            typeHeader: document.getElementById('typeHeader'),
            typeOptions: document.getElementById('typeOptions'),
            startBtn: document.getElementById('startBtn'),
            galleryBtn: document.getElementById('galleryBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            gpxManagerBtn: document.getElementById('gpxManagerBtn'),
            videoPreview: document.getElementById('videoPreview'),
            overlayCanvas: document.getElementById('overlayCanvas'),
            pauseBtn: document.getElementById('pauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            newSegmentBtn: document.getElementById('newSegmentBtn'),
            recordingStatus: document.getElementById('recordingStatus'),
            recordingTimeEl: document.getElementById('recordingTime'),
            gpsInfo: document.getElementById('gpsInfo'),
            formatInfo: document.getElementById('formatInfo'),
            segmentInfo: document.getElementById('segmentInfo'),
            savingStatus: document.getElementById('savingStatus'),
            savingText: document.getElementById('savingText'),
            galleryPanel: document.getElementById('galleryPanel'),
            settingsPanel: document.getElementById('settingsPanel'),
            gpxManagerPanel: document.getElementById('gpxManagerPanel'),
            videoPlayer: document.getElementById('videoPlayer'),
            videosList: document.getElementById('videosList'),
            searchVideos: document.getElementById('searchVideos'),
            selectAllVideos: document.getElementById('selectAllVideos'),
            deselectAllVideos: document.getElementById('deselectAllVideos'),
            galleryActionsDropdown: document.getElementById('galleryActionsDropdown'),
            galleryDropdownToggle: document.getElementById('galleryDropdownToggle'),
            galleryDropdownMenu: document.getElementById('galleryDropdownMenu'),
            gpxList: document.getElementById('gpxList'),
            exportBtn: document.getElementById('exportBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            moveToLocalBtn: document.getElementById('moveToLocalBtn'),
            combineVideosBtn: document.getElementById('combineVideosBtn'),
            closeGallery: document.getElementById('closeGallery'),
            recordingMode: document.getElementById('recordingMode'),
            segmentDuration: document.getElementById('segmentDuration'),
            videoQuality: document.getElementById('videoQuality'),
            videoFormat: document.getElementById('videoFormat'),
            gpxInterval: document.getElementById('gpxInterval'),
            overlayEnabled: document.getElementById('overlayEnabled'),
            audioEnabled: document.getElementById('audioEnabled'),
            reverseGeocodeEnabled: document.getElementById('reverseGeocodeEnabled'),
            showWatermark: document.getElementById('showWatermark'),
            logoPosition: document.getElementById('logoPosition'),
            logoSize: document.getElementById('logoSize'),
            customWatermarkText: document.getElementById('customWatermarkText'),
            textPosition: document.getElementById('textPosition'),
            watermarkOpacity: document.getElementById('watermarkOpacity'),
            opacityValue: document.getElementById('opacityValue'),
            gpxOverlayEnabled: document.getElementById('gpxOverlayEnabled'),
            activeGpxRoute: document.getElementById('activeGpxRoute'),
            showGpxDistance: document.getElementById('showGpxDistance'),
            showGpxSpeed: document.getElementById('showGpxSpeed'),
            embedGpsMetadata: document.getElementById('embedGpsMetadata'),
            metadataFrequency: document.getElementById('metadataFrequency'),
            storageLocation: document.getElementById('storageLocation'),
            keepAppCopy: document.getElementById('keepAppCopy'),
            selectLocalFolderBtn: document.getElementById('selectLocalFolderBtn'),
            currentLocalFolderInfo: document.getElementById('currentLocalFolderInfo'),
            uploadLogoBtn: document.getElementById('uploadLogoBtn'),
            currentLogoInfo: document.getElementById('currentLogoInfo'),
            saveSettings: document.getElementById('saveSettings'),
            resetSettingsBtn: document.getElementById('resetSettingsBtn'),
            closeSettings: document.getElementById('closeSettings'),
            uploadGpxBtn: document.getElementById('uploadGpxBtn'),
            currentGpxInfo: document.getElementById('currentGpxInfo'),
            gpxPreview: document.getElementById('gpxPreview'),
            gpxDistance: document.getElementById('gpxDistance'),
            gpxPointsEl: document.getElementById('gpxPoints'),
            gpxDuration: document.getElementById('gpxDuration'),
            gpxElevation: document.getElementById('gpxElevation'),
            gpxCanvas: document.getElementById('gpxCanvas'),
            clearGpxBtn: document.getElementById('clearGpxBtn'),
            saveGpxBtn: document.getElementById('saveGpxBtn'),
            closeGpxManager: document.getElementById('closeGpxManager'),
            playbackVideo: document.getElementById('playbackVideo'),
            playbackMap: document.getElementById('playbackMap'),
            videoTitle: document.getElementById('videoTitle'),
            videoDate: document.getElementById('videoDate'),
            videoDuration: document.getElementById('videoDuration'),
            videoSize: document.getElementById('videoSize'),
            videoGpsPoints: document.getElementById('videoGpsPoints'),
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
            landscapeModal: document.querySelector('.landscape-modal'),
            continueBtn: document.getElementById('continueBtn'),
            storageStatus: document.getElementById('storageStatus'),
            storageStatusText: document.getElementById('storageStatusText')
        };

        if (this.elements.overlayCanvas) {
            this.elements.overlayCtx = this.elements.overlayCanvas.getContext('2d');
        }
    }

    async initDatabase() {
        return new Promise((resolve) => {
            console.log('📊 Inicializando base de datos...');
            
            const request = indexedDB.open('DashcamDB_Pro', 12);
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                this.createDatabaseStores();
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ Base de datos lista, versión:', this.db.version);
                resolve();
            };
            
            request.onerror = () => {
                console.error('❌ Error base de datos');
                this.db = null;
                resolve();
            };
        });
    }

    createDatabaseStores() {
        if (!this.db) return;
        
        // Crear solo los stores necesarios
        const stores = [
            { name: 'videos', keyPath: 'id', indexes: ['timestamp', 'location', 'session'] },
            { name: 'gpxTracks', keyPath: 'id', indexes: ['timestamp', 'name'] },
            { name: 'settings', keyPath: 'name' },
            { name: 'localFiles', keyPath: 'id', indexes: ['filename', 'timestamp'] },
            { name: 'customLogos', keyPath: 'id' },
            { name: 'gpxFiles', keyPath: 'id', indexes: ['name', 'uploadDate'] },
            { name: 'geocodeCache', keyPath: 'key' }
        ];
        
        stores.forEach(store => {
            if (!this.db.objectStoreNames.contains(store.name)) {
                const objectStore = this.db.createObjectStore(store.name, {
                    keyPath: store.keyPath,
                    autoIncrement: store.keyPath === 'id'
                });
                
                if (store.indexes) {
                    store.indexes.forEach(index => {
                        objectStore.createIndex(index, index, { unique: false });
                    });
                }
                console.log(`✅ Store ${store.name} creado`);
            }
        });
    }

    async loadSettings() {
        try {
            if (!this.db) {
                const savedSettings = localStorage.getItem('dashcam_settings');
                if (savedSettings) {
                    this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
                }
                this.updateSettingsUI();
                return;
            }
            
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get('appSettings');
            
            request.onsuccess = () => {
                if (request.result?.value) {
                    this.state.settings = { 
                        ...this.state.settings, 
                        ...request.result.value,
                        localFolderHandle: this.state.settings.localFolderHandle 
                    };
                }
                this.updateSettingsUI();
            };
            
        } catch (error) {
            console.warn('⚠️ Error cargando configuración:', error);
            this.updateSettingsUI();
        }
    }

    updateSettingsUI() {
        try {
            if (!this.elements.recordingMode) return;
            
            // Configuración existente
            this.elements.recordingMode.value = this.state.settings.recordingMode;
            this.elements.segmentDuration.value = this.state.settings.segmentDuration;
            this.elements.videoQuality.value = this.state.settings.videoQuality;
            this.elements.videoFormat.value = this.state.settings.videoFormat;
            this.elements.gpxInterval.value = this.state.settings.gpxInterval;
            this.elements.overlayEnabled.checked = this.state.settings.overlayEnabled;
            this.elements.audioEnabled.checked = this.state.settings.audioEnabled;
            this.elements.reverseGeocodeEnabled.checked = this.state.settings.reverseGeocodeEnabled;
            
            // Configuración marca de agua
            this.elements.showWatermark.checked = this.state.settings.showWatermark;
            this.elements.logoPosition.value = this.state.settings.logoPosition;
            this.elements.logoSize.value = this.state.settings.logoSize;
            this.elements.textPosition.value = this.state.settings.textPosition;
            this.elements.watermarkOpacity.value = this.state.settings.watermarkOpacity;
            if (this.elements.opacityValue) {
                this.elements.opacityValue.textContent = `${Math.round(this.state.settings.watermarkOpacity * 100)}%`;
            }
            
            // Configuración GPX
            this.elements.gpxOverlayEnabled.checked = this.state.settings.gpxOverlayEnabled;
            this.elements.showGpxDistance.checked = this.state.settings.showGpxDistance;
            this.elements.showGpxSpeed.checked = this.state.settings.showGpxSpeed;
            
            // Configuración metadatos
            this.elements.embedGpsMetadata.checked = this.state.settings.embedGpsMetadata;
            this.elements.metadataFrequency.value = this.state.settings.metadataFrequency;
            
            // Configuración de almacenamiento
            this.elements.storageLocation.value = this.state.settings.storageLocation;
            this.elements.keepAppCopy.checked = this.state.settings.keepAppCopy;
            this.toggleStorageSettings();
            
            // Actualizar información de carpetas
            if (this.elements.currentLocalFolderInfo && this.state.settings.localFolderName) {
                this.elements.currentLocalFolderInfo.innerHTML = 
                    `<span>📁 ${this.state.settings.localFolderName}</span>`;
            }
            
            // Mostrar formato actual
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
        
        if (localFolderSettings) {
            localFolderSettings.style.display = storageLocation === 'localFolder' ? 'block' : 'none';
        }
    }

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

    updateLogoInfo() {
        if (this.elements.currentLogoInfo && this.state.customLogo) {
            this.elements.currentLogoInfo.innerHTML = 
                `<span>🖼️ ${this.state.customLogo.filename}</span>`;
        }
    }

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

    // ============ GRABACIÓN ============

    async startRecording() {
        if (this.state.isRecording) return;
        
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = true;
            setTimeout(() => this.elements.startBtn.disabled = false, 3000);
        }
        
        if (this.checkOrientation() && !this.state.showLandscapeModal) {
            this.showLandscapeModal();
            return;
        }
        
        try {
            this.showNotification('🔐 Solicitando permisos...');
            
            // Verificar permiso de cámara
            try {
                const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
                testStream.getTracks().forEach(track => track.stop());
            } catch {
                this.showNotification('❌ Se necesita permiso de cámara para grabar');
                return;
            }
            
            // Solicitar GPS
            const locationGranted = await this.requestLocationPermission();
            
            // Iniciar componentes
            await this.initCamera();
            if (!this.mediaStream) throw new Error('No se pudo acceder a la cámara');
            
            this.showCameraScreen();
            
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
            this.recordedChunks = [];
            
            // Configurar canvas
            if (this.mainCanvas) {
                const videoTrack = this.mediaStream.getVideoTracks()[0];
                const settings = videoTrack.getSettings();
                this.mainCanvas.width = settings.width || 1280;
                this.mainCanvas.height = settings.height || 720;
            }
            
            // Configurar video element
            this.videoElement = document.createElement('video');
            this.videoElement.srcObject = this.mediaStream;
            this.videoElement.autoplay = true;
            this.videoElement.muted = true;
            this.videoElement.playsInline = true;
            
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play().then(resolve).catch(resolve);
                };
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
                        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        if (audioStream) {
                            this.canvasStream.addTrack(audioStream.getAudioTracks()[0]);
                        }
                    } catch {}
                }
                
                // Configurar MediaRecorder
                const mimeType = 'video/webm;codecs=vp9,opus';
                
                this.mediaRecorder = new MediaRecorder(this.canvasStream, {
                    mimeType: mimeType,
                    videoBitsPerSecond: this.getVideoBitrate()
                });
                
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
                
                if (this.state.settings.recordingMode === 'continuous') {
                    this.mediaRecorder.start();
                } else {
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
            this.cleanupResources();
        }
    }

    cleanupResources() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
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
                    const fallbackConstraints = { video: true, audio: this.state.settings.audioEnabled };
                    return navigator.mediaDevices.getUserMedia(fallbackConstraints);
                });
            
            if (this.elements.videoPreview) {
                this.elements.videoPreview.srcObject = this.mediaStream;
                
                await new Promise((resolve) => {
                    this.elements.videoPreview.onloadedmetadata = () => {
                        this.elements.videoPreview.play().then(resolve).catch(resolve);
                    };
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
        if (this.elements.startScreen) this.elements.startScreen.style.display = 'flex';
        if (this.elements.cameraScreen) this.elements.cameraScreen.classList.remove('active');
        this.cleanupResources();
    }

    showCameraScreen() {
        if (this.elements.startScreen) this.elements.startScreen.style.display = 'none';
        if (this.elements.cameraScreen) this.elements.cameraScreen.classList.add('active');
        
        if (this.elements.videoPreview && this.elements.videoPreview.srcObject) {
            this.elements.videoPreview.play().catch(console.error);
        }
    }

    getVideoBitrate() {
        const quality = this.state.settings.videoQuality;
        
        switch(quality) {
            case '480p': return 1000000;
            case '720p': return 2500000;
            case '1080p': return 5000000;
            case '4k': return 15000000;
            default: return 2500000;
        }
    }

    async stopRecording() {
        if (!this.mediaRecorder && !this.state.isRecording) {
            this.showStartScreen();
            return;
        }
        
        try {
            if (this.mediaRecorder?.state === 'recording') {
                this.mediaRecorder.stop();
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            this.cleanupRecordingResources();
            
            if (this.recordedChunks?.length > 0) {
                await this.saveVideoSegment();
            }
            
            if (this.gpxPoints.length > 0) {
                await this.saveGPXTrack(Date.now(), this.state.currentSegment);
            }
            
            this.state.isRecording = false;
            this.state.isPaused = false;
            this.state.currentTime = 0;
            this.state.currentSegment = 1;
            
            this.recordedChunks = [];
            this.showStartScreen();
            this.showNotification('💾 Grabación finalizada');
            
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error deteniendo grabación:', error);
            this.showNotification('❌ Error al finalizar grabación');
            this.showStartScreen();
        } finally {
            this.resetRecordingSession();
        }
    }

    cleanupRecordingResources() {
        if (this.segmentTimer) clearTimeout(this.segmentTimer);
        this.stopFrameCapture();
        
        if (this.gpsWatchId) {
            navigator.geolocation.clearWatch(this.gpsWatchId);
            this.gpsWatchId = null;
        }
        
        if (this.gpxInterval) clearInterval(this.gpxInterval);
        
        if (this.mediaRecorder?.state !== 'inactive') {
            try {
                this.mediaRecorder.stop();
            } catch {}
        }
        
        if (this.canvasStream) {
            this.canvasStream.getTracks().forEach(track => track.stop());
            this.canvasStream = null;
        }
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        this.videoElement = null;
    }

    async saveVideoSegment() {
        if (this.isSaving) return;
        
        this.isSaving = true;
        
        try {
            if (!this.recordedChunks || this.recordedChunks.length === 0) {
                console.warn('⚠️ No hay chunks para guardar');
                return;
            }
            
            const originalBlob = new Blob(this.recordedChunks, { 
                type: this.mediaRecorder?.mimeType || 'video/webm' 
            });
            
            if (originalBlob.size < 1024) {
                console.error('❌ Blob demasiado pequeño');
                return;
            }
            
            const duration = this.state.currentTime || 10000;
            const timestamp = this.state.startTime || Date.now();
            const segmentNum = this.state.currentSegment;
            
            // Convertir a MP4 con metadatos
            const { blob: finalBlob, format: finalFormat } = await this.ensureMP4WithMetadata(
                originalBlob, 
                this.state.settings.videoFormat === 'mp4' ? 'mp4' : 'webm',
                this.gpxPoints
            );
            
            const filename = `segmento_${segmentNum}.${finalFormat}`;
            this.state.recordingSessionSegments++;
            
            // Crear sesión si es el primer segmento
            if (this.state.recordingSessionSegments === 1 && !this.state.recordingSessionName) {
                await this.createSessionFolder();
            }
            
            let savedPath = filename;
            let savedSuccess = false;
            
            // Guardar según ubicación configurada
            if (this.state.settings.storageLocation === 'localFolder' && this.localFolderHandle) {
                if (this.state.recordingSessionName) {
                    savedSuccess = await this.saveToLocalFolder(finalBlob, filename, this.state.recordingSessionName);
                    savedPath = `${this.state.recordingSessionName}/${filename}`;
                } else {
                    savedSuccess = await this.saveToLocalFolder(finalBlob, filename);
                }
            } else {
                // Guardar en la app
                if (this.state.recordingSessionName) {
                    savedSuccess = await this.saveToApp(finalBlob, timestamp, duration, finalFormat, segmentNum);
                    savedPath = `${this.state.recordingSessionName}/${filename}`;
                } else {
                    savedSuccess = await this.saveToApp(finalBlob, timestamp, duration, finalFormat, segmentNum);
                }
            }
            
            if (savedSuccess) {
                // Guardar referencia del segmento
                this.state.recordedSegments.push({
                    id: Date.now(),
                    filename: filename,
                    blob: finalBlob,
                    timestamp: timestamp,
                    duration: duration,
                    format: finalFormat,
                    segment: segmentNum,
                    sessionName: this.state.recordingSessionName,
                    savedPath: savedPath,
                    location: this.state.settings.storageLocation === 'localFolder' ? 'desktop_folder' : 'app'
                });
                
                this.showNotification(`✅ Segmento ${segmentNum} guardado`);
                
                // Preguntar sobre combinar si hay varios segmentos
                if (this.state.recordedSegments.length > 1 && this.state.recordingSessionName) {
                    this.askAboutCombining();
                }
            }
            
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error guardando vídeo:', error);
            this.showNotification('❌ Error al guardar video');
        } finally {
            this.recordedChunks = [];
            this.isSaving = false;
        }
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

    async convertWebMtoMP4(webmBlob) {
        console.log('🔄 Convirtiendo WebM → MP4...');
        return new Promise((resolve, reject) => {
            try {
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
                resolve(webmBlob);
            }
        });
    }

    async addGpsMetadataToMP4(mp4Blob, gpsPoints) {
        return new Promise((resolve) => {
            try {
                console.log('📍 Agregando metadatos GPS al video...');
                
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
                
                const metadataStr = JSON.stringify(metadata);
                const metadataEncoder = new TextEncoder();
                const metadataArray = metadataEncoder.encode(metadataStr);
                
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
                })} - S${segmentNum}${this.state.recordingSessionName ? ` - ${this.state.recordingSessionName}` : ''}`,
                gpsPoints: this.gpxPoints.length,
                gpsTrack: this.gpxPoints,
                format: format,
                location: 'app',
                hasMetadata: this.state.settings.embedGpsMetadata,
                segment: segmentNum,
                session: this.state.recordingSessionName
            };
            
            if (this.db) {
                await this.saveToDatabase('videos', videoData);
                console.log('📱 Video guardado en app con metadatos');
                return true;
            } else {
                const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
                videos.push({
                    ...videoData,
                    blob: null,
                    dataUrl: 'placeholder'
                });
                localStorage.setItem('dashcam_videos', JSON.stringify(videos));
                return true;
            }
        } catch (error) {
            console.error('❌ Error guardando en app:', error);
            return false;
        }
    }

    // ============ SESIONES Y CARPETAS ============

    async createSessionFolder() {
        try {
            const timestamp = new Date().toISOString()
                .replace(/[:.]/g, '-')
                .replace('T', '_')
                .substring(0, 16);
            
            const sessionName = `Sesion_${timestamp}`;
            this.state.recordingSessionName = sessionName;
            
            console.log(`✅ Carpeta de sesión creada: ${sessionName}`);
            this.showNotification(`📁 Sesión creada: ${sessionName}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error creando carpeta de sesión:', error);
            this.state.recordingSessionName = null;
            return false;
        }
    }

    askAboutCombining() {
        if (this.state.recordedSegments.length <= 1) return;
        
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
                    <p>¿Quieres <strong>combinar los segmentos</strong> en un solo video?</p>
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
        
        modal.querySelector('#cancelCombine').addEventListener('click', () => {
            modal.remove();
            this.showNotification('📁 Sesión guardada con segmentos individuales');
        });
        
        modal.querySelector('#confirmCombine').addEventListener('click', async () => {
            modal.remove();
            await this.combineSessionSegments();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async combineSessionSegments() {
        if (this.state.recordedSegments.length <= 1) {
            this.showNotification('❌ No hay suficientes segmentos para combinar');
            return;
        }
        
        try {
            this.showNotification('🔗 Combinando segmentos de sesión...');
            
            const combinedName = `${this.state.recordingSessionName}_completo.mp4`;
            const combinedData = {
                id: Date.now(),
                name: combinedName,
                session: this.state.recordingSessionName,
                segments: this.state.recordedSegments.length,
                totalDuration: this.state.recordedSegments.reduce((sum, seg) => sum + seg.duration, 0),
                combinedAt: Date.now(),
                type: 'combined'
            };
            
            if (this.db) {
                await this.saveToDatabase('combinedVideos', combinedData);
            }
            
            this.showNotification(`✅ ${this.state.recordedSegments.length} segmentos combinados en sesión`);
            
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

    async selectLocalFolder() {
        console.log('📂 Seleccionando carpeta...');
        
        if (this.isIOS) {
            await this.showIOSFolderPicker();
        } else {
            await this.showDesktopFolderPicker();
        }
    }

    async showDesktopFolderPicker() {
        try {
            // Intentar usar handle existente
            if (this.state.settings.localFolderHandle) {
                try {
                    const permission = await this.state.settings.localFolderHandle.requestPermission({ mode: 'readwrite' });
                    if (permission === 'granted') {
                        this.localFolderHandle = this.state.settings.localFolderHandle;
                        this.updateFolderUI();
                        return;
                    }
                } catch {}
            }
            
            const handle = await window.showDirectoryPicker({
                id: 'dashcam-local-folder',
                mode: 'readwrite'
            });
            
            if (handle) {
                this.localFolderHandle = handle;
                this.state.settings.localFolderHandle = handle;
                this.state.settings.localFolderName = handle.name;
                this.updateFolderUI();
                await this.saveSettings();
                this.showNotification(`📂 Carpeta seleccionada: ${handle.name}`);
            }
            
        } catch (error) {
            console.warn('⚠️ Error seleccionando carpeta:', error);
            if (error.name !== 'AbortError') {
                this.showNotification('❌ Error seleccionando carpeta');
            }
        }
    }

    async showIOSFolderPicker() {
        try {
            // Mostrar instrucciones para iPhone
            const modal = document.getElementById('localFolderPickerModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.getElementById('iphoneInstructions').style.display = 'block';
                document.getElementById('desktopInstructions').style.display = 'none';
            }
            
        } catch (error) {
            console.error('❌ Error mostrando selector iOS:', error);
            this.showNotification('❌ Error en selector de carpeta');
        }
    }

    updateFolderUI() {
        if (this.elements.currentLocalFolderInfo && this.state.settings.localFolderName) {
            this.elements.currentLocalFolderInfo.innerHTML = 
                `<span>📁 ${this.state.settings.localFolderName}</span>`;
        }
    }

    async saveToLocalFolder(blob, filename, sessionName = null) {
        if (!this.localFolderHandle && !this.isIOS) {
            console.log('⚠️ No hay carpeta local seleccionada');
            return false;
        }
        
        try {
            if (this.isIOS) {
                // Para iPhone, guardar en IndexedDB
                const fileData = {
                    id: Date.now(),
                    filename: filename,
                    timestamp: Date.now(),
                    size: blob.size,
                    type: 'video/mp4',
                    location: 'ios_local',
                    session: sessionName,
                    blob: blob
                };
                
                if (this.db) {
                    await this.saveToDatabase('localFiles', fileData);
                }
                return true;
                
            } else {
                // Para desktop - guardar físicamente
                let fileHandle;
                
                if (sessionName) {
                    const sessionFolder = await this.localFolderHandle.getDirectoryHandle(sessionName, { create: true });
                    fileHandle = await sessionFolder.getFileHandle(filename, { create: true });
                } else {
                    fileHandle = await this.localFolderHandle.getFileHandle(filename, { create: true });
                }
                
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                
                // Guardar referencia
                const fileRef = {
                    id: Date.now(),
                    filename: filename,
                    folderName: this.state.settings.localFolderName,
                    timestamp: Date.now(),
                    size: blob.size,
                    location: 'desktop_folder',
                    session: sessionName,
                    blob: blob
                };
                
                if (this.db) {
                    await this.saveToDatabase('localFiles', fileRef);
                }
                
                return true;
            }
            
        } catch (error) {
            console.error('❌ Error guardando en carpeta local:', error);
            return false;
        }
    }

    // ============ GPS Y GEOLOCALIZACIÓN ============

    async requestLocationPermission() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(false);
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                () => {
                    console.log('✅ Permiso de ubicación concedido');
                    resolve(true);
                },
                () => {
                    console.warn('⚠️ Permiso de ubicación no concedido');
                    resolve(false);
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
        });
    }

    startGPS() {
        if (!navigator.geolocation) return;
        
        console.log('📍 Iniciando GPS...');
        
        this.gpsWatchId = navigator.geolocation.watchPosition(
            async (position) => {
                this.currentPosition = this.formatPosition(position);
                
                // Actualizar nombre de ubicación
                if (this.state.settings.reverseGeocodeEnabled) {
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
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
        );
        
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
            case 1: return 'Permiso denegado - Activa GPS en ajustes';
            case 2: return 'Posición no disponible - Sal al exterior';
            case 3: return 'Buscando señal...';
            default: return 'Iniciando GPS...';
        }
    }

    async getLocationName(lat, lon) {
        const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
        
        if (this.state.reverseGeocodeCache[cacheKey]) {
            return this.state.reverseGeocodeCache[cacheKey];
        }
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=es`
            );
            
            if (response.ok) {
                const data = await response.json();
                let locationName = 'Desconocido';
                
                if (data.address) {
                    if (data.address.city) locationName = data.address.city;
                    else if (data.address.town) locationName = data.address.town;
                    else if (data.address.village) locationName = data.address.village;
                    else if (data.address.municipality) locationName = data.address.municipality;
                    else if (data.address.county) locationName = data.address.county;
                    else if (data.address.state) locationName = data.address.state;
                    else if (data.address.country) locationName = data.address.country;
                }
                
                if (locationName.length > 50) {
                    locationName = locationName.substring(0, 47) + '...';
                }
                
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
            
            const location = this.state.settings.storageLocation === 'localFolder' ? 'localFolder' : 'app';
            
            // Si es carpeta local, guardar físicamente también
            if (location === 'localFolder' && this.localFolderHandle) {
                try {
                    const filename = `ruta_${timestamp}.gpx`;
                    let fileHandle;
                    
                    // Si hay sesión, guardar en subcarpeta
                    if (this.state.recordingSessionName) {
                        const sessionFolder = await this.localFolderHandle.getDirectoryHandle(
                            this.state.recordingSessionName, 
                            { create: true }
                        );
                        fileHandle = await sessionFolder.getFileHandle(filename, { create: true });
                    } else {
                        fileHandle = await this.localFolderHandle.getFileHandle(filename, { create: true });
                    }
                    
                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    console.log('📂 GPX guardado físicamente en carpeta local');
                    
                } catch (fsError) {
                    console.warn('⚠️ Error guardando GPX físicamente:', fsError);
                }
            }
            
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
                location: location,
                gpxPoints: this.gpxPoints,
                segment: segmentNum,
                sessionName: this.state.recordingSessionName
            };
            
            if (this.db) {
                await this.saveToDatabase('gpxTracks', gpxData);
            }
            console.log('📍 GPX guardado:', gpxData.points, 'puntos, ubicación:', gpxData.location);
            
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

    // ============ MARCA DE AGUA Y DIBUJADO ============

    startFrameCapture() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        
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
                this.drawFrameWithData();
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
        
        if (this.state.settings.showWatermark) {
            this.drawCustomWatermark(ctx, canvas);
        }
        
        if (this.state.settings.overlayEnabled) {
            this.drawTemporaryOverlay();
        }
        
        if (this.state.settings.gpxOverlayEnabled && this.state.activeGPX) {
            this.drawGpxOverlay(ctx, canvas);
        }
        
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
        
        ctx.save();
        
        // Dibujar logo si existe
        if (this.logoImage && this.state.settings.showWatermark) {
            this.drawLogo(ctx, canvas);
        }
        
        // Dibujar texto personalizado
        this.drawWatermarkText(ctx, canvas, this.state.settings.customWatermarkText);
        
        // Dibujar información GPS
        this.drawGpsInfo(ctx, canvas, dateStr);
        
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
            case 'top-left': x = padding; y = padding; break;
            case 'top-right': x = canvas.width - size - padding; y = padding; break;
            case 'bottom-left': x = padding; y = canvas.height - size - padding; break;
            case 'bottom-right': x = canvas.width - size - padding; y = canvas.height - size - padding; break;
        }
        
        ctx.fillStyle = `rgba(0, 0, 0, ${this.state.settings.watermarkOpacity * 0.5})`;
        ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
        ctx.drawImage(this.logoImage, x, y, size, size);
    }

    drawWatermarkText(ctx, canvas, text) {
        const fontSize = 10;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.state.settings.watermarkOpacity})`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        const x = canvas.width - 15;
        const y = canvas.height - 15;
        const watermarkText = 'Powered By Roberto Benet - rbenet71@gmail.com';
        
        ctx.fillStyle = `rgba(0, 0, 0, ${this.state.settings.watermarkOpacity * 0.7})`;
        const textWidth = ctx.measureText(watermarkText).width;
        const textHeight = fontSize + 4;
        
        ctx.fillRect(x - textWidth - 8, y - fontSize - 2, textWidth + 16, textHeight);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.state.settings.watermarkOpacity})`;
        ctx.fillText(watermarkText, x, y);
    }

    drawGpsInfo(ctx, canvas, dateStr) {
        const position = this.state.settings.watermarkPosition;
        const fontSize = this.state.settings.watermarkFontSize;
        const opacity = this.state.settings.watermarkOpacity;
        
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
        
        const gpxProgress = this.calculateGpxProgress();
        if (gpxProgress) {
            const { distance, totalDistance, percentage, currentPoint } = gpxProgress;
            
            ctx.fillStyle = `rgba(0, 255, 0, 0.7)`;
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            const infoX = 10;
            const infoY = canvas.height - 120;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(infoX - 5, infoY - 5, 250, 110);
            
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
        
        if (closestPoint && minDistance < 0.1) {
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
        const R = 6371;
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

    // ============ CONTROLES DE GRABACIÓN ============

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
            
            if (this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                this.recordedChunks = [];
                this.state.currentSegment++;
                
                if (this.elements.segmentInfo) {
                    this.elements.segmentInfo.textContent = `📹 Segmento ${this.state.currentSegment}`;
                }
                
                if (this.state.isRecording && !this.state.isPaused) {
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
        
        if (this.elements.segmentInfo) {
            this.elements.segmentInfo.textContent = `📹 Segmento ${this.state.currentSegment}`;
        }
    }

    // ============ GALERÍA ============

    async loadGallery() {
        try {
            switch(this.state.viewMode) {
                case 'default':
                    await this.loadAppVideos();
                    break;
                case 'localFolder':
                    await this.loadLocalFolderVideos();
                    break;
            }
            
            if (this.elements.galleryPanel && !this.elements.galleryPanel.classList.contains('hidden')) {
                this.renderVideosList();
            }
            
        } catch (error) {
            console.error('❌ Error cargando galería:', error);
        }
    }

    async loadAppVideos() {
        try {
            let videos = [];
            
            if (this.db) {
                videos = await this.getAllFromStore('videos');
            } else {
                const storedVideos = localStorage.getItem('dashcam_videos');
                if (storedVideos) videos = JSON.parse(storedVideos);
            }
            
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
       
        if (this.state.videos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>📱</div>
                    <p>No hay vídeos en la app</p>
                    <p>Inicia una grabación para comenzar</p>
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
            
            let locationIcon = '📱';
            if (location === 'localFolder' || location === 'desktop_folder' || location === 'ios_local') {
                locationIcon = '📂';
            }
            
            html += `
                <div class="file-item video-file ${this.state.selectedVideos.has(video.id) ? 'selected' : ''}" 
                    data-id="${video.id}" 
                    data-type="video"
                    data-location="${location}"
                    data-format="${format}">
                    <div class="file-header">
                        <div class="file-title">${video.title || video.filename || 'Grabación'}</div>
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
        
        this.updateGalleryActions();
    }

    async playVideo(videoId) {
        try {
            console.log('🎬 Intentando reproducir video ID:', videoId, 'modo:', this.state.viewMode);
            
            let video;
            
            if (this.state.viewMode === 'default') {
                if (this.db) {
                    video = await this.getFromStore('videos', videoId);
                }
            } else if (this.state.viewMode === 'localFolder') {
                if (this.db) {
                    video = await this.getFromStore('localFiles', videoId);
                    if (video && !video.blob) {
                        const videoFromVideos = await this.getFromStore('videos', videoId);
                        if (videoFromVideos && videoFromVideos.blob) {
                            video.blob = videoFromVideos.blob;
                        }
                    }
                }
            }
            
            if (!video || !video.blob) {
                console.error('❌ Video no encontrado o sin blob:', videoId);
                this.showNotification('❌ Video no disponible');
                return;
            }
            
            this.state.currentVideo = video;
            
            const videoUrl = URL.createObjectURL(video.blob);
            console.log('🎬 URL de video creada');
            
            this.elements.playbackVideo.src = videoUrl;
            this.elements.videoTitle.textContent = video.title || video.filename || 'Grabación';
            
            const date = new Date(video.timestamp);
            const sizeMB = Math.round(video.size / (1024 * 1024));
            const duration = this.formatTime(video.duration);
            const location = video.location || 'app';
            
            this.elements.videoDate.textContent = date.toLocaleString('es-ES');
            this.elements.videoDuration.textContent = duration;
            this.elements.videoSize.textContent = `${sizeMB} MB`;
            this.elements.videoGpsPoints.textContent = video.gpsPoints || 0;
            
            let locationText = 'Almacenado en la app';
            let locationIcon = '📱';
            
            if (location === 'localFolder' || location === 'desktop_folder') {
                locationText = `Almacenado en carpeta: ${video.folderName || 'Local'}`;
                locationIcon = '📂';
            } else if (location === 'ios_local') {
                locationText = 'Almacenado en iPhone (app)';
                locationIcon = '📱';
            }
            
            this.elements.locationIcon.textContent = locationIcon;
            this.elements.locationText.textContent = locationText;
            
            this.elements.playbackVideo.addEventListener('timeupdate', () => {
                this.updatePlaybackMap();
            });
            
            this.elements.videoPlayer.classList.remove('hidden');
            
            if (video.gpsTrack && video.gpsTrack.length > 0) {
                this.initPlaybackMap();
            }
            
            setTimeout(() => {
                this.elements.playbackVideo.play().catch(error => {
                    console.log('⚠️ No se pudo autoplay:', error.message);
                });
            }, 300);
            
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
        
        const scaledPoints = points.map(point => ({
            x: ((point.lon - minLon) / lonRange) * canvas.width,
            y: canvas.height - ((point.lat - minLat) / latRange) * canvas.height
        }));
        
        ctx.beginPath();
        ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
        for (let i = 1; i < scaledPoints.length; i++) {
            ctx.lineTo(scaledPoints[i].x, scaledPoints[i].y);
        }
        
        ctx.strokeStyle = '#00a8ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(scaledPoints[0].x, scaledPoints[0].y, 4, 0, Math.PI * 2);
        ctx.fill();
        
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

    async extractGpxFromVideo() {
        if (!this.state.currentVideo) {
            this.showNotification('❌ No hay video seleccionado');
            return;
        }
        
        try {
            if (this.state.currentVideo.gpsTrack && this.state.currentVideo.gpsTrack.length > 0) {
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

    async exportSingleVideo() {
        if (!this.state.currentVideo) return;
        
        try {
            if (this.state.currentVideo.blob) {
                this.downloadBlob(
                    this.state.currentVideo.blob, 
                    `${this.state.currentVideo.title || 'grabacion'}.${this.state.currentVideo.format || 'mp4'}`
                );
                this.showNotification('📤 Video exportado');
            } else {
                this.showNotification('❌ Video no disponible para exportar');
            }
        } catch (error) {
            console.error('❌ Error exportando video:', error);
            this.showNotification('❌ Error al exportar');
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

    // ============ SELECTORES Y UI ============

    setupCompactSelectors() {
        if (this.elements.locationHeader) {
            this.elements.locationHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSelect('location');
            });
        }
        
        if (this.elements.typeHeader) {
            this.elements.typeHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSelect('type');
            });
        }
        
        if (this.elements.locationOptions) {
            this.elements.locationOptions.querySelectorAll('.select-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const value = e.currentTarget.dataset.value;
                    this.selectLocation(value);
                    this.closeAllSelects();
                });
            });
        }
        
        if (this.elements.typeOptions) {
            this.elements.typeOptions.querySelectorAll('.select-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const value = e.currentTarget.dataset.value;
                    this.selectType(value);
                    this.closeAllSelects();
                });
            });
        }
        
        document.addEventListener('click', () => {
            this.closeAllSelects();
        });
    }

    toggleSelect(type) {
        const options = type === 'location' ? this.elements.locationOptions : this.elements.typeOptions;
        const header = type === 'location' ? this.elements.locationHeader : this.elements.typeHeader;
        
        this.closeAllSelects();
        
        if (options && header) {
            options.classList.add('show');
            header.classList.add('active');
        }
    }

    closeAllSelects() {
        if (this.elements.locationOptions) this.elements.locationOptions.classList.remove('show');
        if (this.elements.locationHeader) this.elements.locationHeader.classList.remove('active');
        if (this.elements.typeOptions) this.elements.typeOptions.classList.remove('show');
        if (this.elements.typeHeader) this.elements.typeHeader.classList.remove('active');
    }

    selectLocation(value) {
        this.state.viewMode = value;
        
        const header = this.elements.locationHeader;
        const options = this.elements.locationOptions;
        
        if (header && options) {
            const selectedOption = options.querySelector(`.select-option[data-value="${value}"]`);
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                header.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
                
                options.querySelectorAll('.select-option').forEach(option => {
                    option.classList.remove('active');
                });
                selectedOption.classList.add('active');
            }
        }
        
        this.loadGallery();
    }

    selectType(value) {
        this.state.activeTab = value;
        
        const header = this.elements.typeHeader;
        const options = this.elements.typeOptions;
        
        if (header && options) {
            const selectedOption = options.querySelector(`.select-option[data-value="${value}"]`);
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                header.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
                
                options.querySelectorAll('.select-option').forEach(option => {
                    option.classList.remove('active');
                });
                selectedOption.classList.add('active');
            }
        }
        
        this.switchTab(value);
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
                this.loadGPXFromStore();
            }
        }
        
        this.updateSelectionButtons();
    }

    showGallery() {
        console.log('📁 Mostrando galería');
        if (this.elements.galleryPanel) {
            this.elements.galleryPanel.classList.remove('hidden');
        }
        this.updateCompactSelectors();
        this.switchTab(this.state.activeTab);
        this.updateGalleryActions();
    }

    hideGallery() {
        if (this.elements.galleryPanel) {
            this.elements.galleryPanel.classList.add('hidden');
        }
        this.state.selectedVideos.clear();
        this.state.selectedGPX.clear();
        
        if (this.elements.galleryDropdownMenu) {
            this.elements.galleryDropdownMenu.classList.remove('show');
        }
    }

    updateCompactSelectors() {
        if (this.elements.locationHeader && this.elements.locationOptions) {
            const value = this.state.viewMode;
            const selectedOption = this.elements.locationOptions.querySelector(`.select-option[data-value="${value}"]`);
            
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                this.elements.locationHeader.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
                
                this.elements.locationOptions.querySelectorAll('.select-option').forEach(option => {
                    option.classList.remove('active');
                });
                selectedOption.classList.add('active');
            }
        }
        
        if (this.elements.typeHeader && this.elements.typeOptions) {
            const value = this.state.activeTab;
            const selectedOption = this.elements.typeOptions.querySelector(`.select-option[data-value="${value}"]`);
            
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                this.elements.typeHeader.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
                
                this.elements.typeOptions.querySelectorAll('.select-option').forEach(option => {
                    option.classList.remove('active');
                });
                selectedOption.classList.add('active');
            }
        }
    }

    // ============ SELECCIÓN Y ACCIONES ============

    toggleSelection(id, type) {
        if (type === 'video') {
            if (this.state.selectedVideos.has(id)) {
                this.state.selectedVideos.delete(id);
            } else {
                this.state.selectedVideos.add(id);
            }
            this.renderVideosList();
        } else if (type === 'gpx') {
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
        if (type === 'video' || this.state.activeTab === 'videos') {
            this.state.selectedVideos.clear();
            this.renderVideosList();
        } else {
            this.state.selectedGPX.clear();
        }
        
        this.updateSelectionButtons();
    }

    updateSelectionButtons() {
        const hasSelected = this.state.activeTab === 'videos' 
            ? this.state.selectedVideos.size > 0 
            : this.state.selectedGPX.size > 0;
        
        const totalItems = this.state.activeTab === 'videos'
            ? this.state.videos.length
            : this.state.gpxTracks.length;
        
        if (this.elements.selectAllVideos) {
            this.elements.selectAllVideos.disabled = totalItems === 0;
        }
        
        if (this.elements.deselectAllVideos) {
            this.elements.deselectAllVideos.disabled = !hasSelected;
        }
        
        const exportBtn = document.getElementById('exportBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const moveToLocalBtn = document.getElementById('moveToLocalBtn');
        const combineVideosBtn = document.getElementById('combineVideosBtn');
        
        if (exportBtn) exportBtn.disabled = !hasSelected;
        if (deleteBtn) deleteBtn.disabled = !hasSelected;
        if (moveToLocalBtn) moveToLocalBtn.disabled = !hasSelected;
        if (combineVideosBtn) combineVideosBtn.disabled = !hasSelected || this.state.selectedVideos.size < 2;
    }

    updateGalleryActions() {
        const hasSelectedVideos = this.state.selectedVideos.size > 0;
        
        const moveBtn = document.getElementById('moveToLocalBtn');
        const combineBtn = document.getElementById('combineVideosBtn');
        const exportBtn = document.getElementById('exportBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        
        if (moveBtn) moveBtn.disabled = !hasSelectedVideos;
        if (combineBtn) combineBtn.disabled = !hasSelectedVideos || this.state.selectedVideos.size < 2;
        if (exportBtn) exportBtn.disabled = !hasSelectedVideos;
        if (deleteBtn) deleteBtn.disabled = !hasSelectedVideos;
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
                localFolderName: this.state.settings.localFolderName,
                localFolderPath: this.state.settings.localFolderPath
            };
            
            this.state.settings = { 
                ...this.state.settings, 
                ...settings,
                localFolderHandle: this.state.settings.localFolderHandle
            };
            
            // Guardar en IndexedDB
            if (this.db) {
                try {
                    const transaction = this.db.transaction(['settings'], 'readwrite');
                    const store = transaction.objectStore('settings');
                    await store.put({ name: 'appSettings', value: settings });
                    console.log('⚙️ Configuración guardada en IndexedDB');
                } catch (error) {
                    console.warn('⚠️ Error guardando en IndexedDB:', error);
                }
            }
            
            // Guardar en localStorage como backup
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

    showSettings() {
        this.updateSettingsUI();
        if (this.elements.settingsPanel) {
            this.elements.settingsPanel.classList.remove('hidden');
        }
    }

    hideSettings() {
        if (this.elements.settingsPanel) {
            this.elements.settingsPanel.classList.add('hidden');
        }
    }

    async resetSettings() {
        if (!confirm('¿Restaurar configuración predeterminada?')) return;
        
        try {
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
                logoPosition: 'top-left',
                logoSize: 'medium',
                customWatermarkText: 'Powered By Roberto Benet - rbenet71@gmail.com',
                textPosition: 'bottom-right',
                gpxOverlayEnabled: false,
                showGpxDistance: true,
                showGpxSpeed: true,
                embedGpsMetadata: true,
                metadataFrequency: 2,
                localFolderHandle: null,
                localFolderName: null,
                localFolderPath: null
            };
            
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

    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }

    updateUI() {
        if (this.state.isRecording) {
            this.state.currentTime = Date.now() - this.state.startTime;
            
            if (this.elements.recordingTimeEl) {
                this.elements.recordingTimeEl.textContent = this.formatTime(this.state.currentTime);
            }
        }
    }

    startMonitoring() {
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
        }
        
        if (this.elements.storageStatusText) {
            this.elements.storageStatusText.textContent = statusText;
            this.elements.storageStatus.classList.remove('hidden');
        }
    }

    checkOrientation() {
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return false;
        }
        
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

    // ============ BASE DE DATOS - UTILIDADES ============

    async saveToDatabase(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            
            if (!this.db.objectStoreNames.contains(storeName)) {
                console.error(`❌ Store ${storeName} no existe`);
                reject(new Error(`Store ${storeName} no encontrado`));
                return;
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

    // Añade esta función en la clase DashcamApp, por ejemplo después de loadGPXFiles()

    async loadGPXFromStore() {
        try {
            console.log('🗺️ Cargando rutas GPX desde fuentes reales...');
            
            let allGPX = [];
            
            // Escanear según el modo de vista
            if (this.state.viewMode === 'default') {
                // Mostrar GPX de la app
                allGPX = await this.scanAppGPXFiles();
                console.log(`📱 ${allGPX.length} GPX en la app`);
                
            } else if (this.state.viewMode === 'localFolder') {
                // Mostrar GPX de carpeta local
                allGPX = await this.scanLocalFolderGPXFiles();
                console.log(`📂 ${allGPX.length} GPX en carpeta local`);
                
                // También mostrar GPX de la app que están relacionados con videos locales
                const appGPX = await this.scanAppGPXFiles();
                const localGPX = allGPX.map(g => g.filename || g.title);
                
                // Agregar GPX de app que no están duplicados
                appGPX.forEach(gpx => {
                    if (!localGPX.includes(gpx.filename || gpx.title)) {
                        allGPX.push(gpx);
                    }
                });
            }
            
            // Ordenar por fecha (más recientes primero)
            this.state.gpxTracks = allGPX.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            console.log(`🗺️ Total GPX a mostrar: ${this.state.gpxTracks.length}`);
            
            this.renderGPXList();
            
        } catch (error) {
            console.error('❌ Error cargando GPX:', error);
            this.state.gpxTracks = [];
            this.renderGPXList();
        }
    }

    async scanAppGPXFiles() {
        try {
            console.log('🔍 Escaneando GPX en la app...');
            let gpxList = [];
            
            if (this.db) {
                // Buscar en gpxTracks (GPX generados automáticamente)
                const gpxTracks = await this.getAllFromStore('gpxTracks');
                gpxList = gpxList.concat(gpxTracks.map(gpx => ({
                    id: gpx.id,
                    title: gpx.title || 'Ruta GPX',
                    timestamp: gpx.timestamp,
                    size: gpx.size,
                    points: gpx.points,
                    location: 'app',
                    source: 'gpxTracks',
                    blob: gpx.blob,
                    gpxPoints: gpx.gpxPoints
                })));
                
                // También buscar en gpxFiles (GPX cargados manualmente)
                const gpxFiles = await this.getAllFromStore('gpxFiles');
                gpxList = gpxList.concat(gpxFiles.map(file => ({
                    id: file.id,
                    title: file.name || file.filename || 'GPX Cargado',
                    timestamp: file.uploadDate || file.timestamp,
                    size: file.fileSize,
                    points: file.points?.length || 0,
                    location: 'app',
                    source: 'gpxFiles',
                    blob: file.blob,
                    gpxData: file
                })));
                
                console.log(`📊 ${gpxList.length} GPX encontrados en la app`);
            }
            
            return gpxList;
            
        } catch (error) {
            console.error('❌ Error escaneando GPX de app:', error);
            return [];
        }
    }

    async scanLocalFolderGPXFiles() {
        try {
            console.log('🔍 Escaneando GPX en carpeta local...');
            let gpxList = [];
            
            if (!this.localFolderHandle) {
                console.log('⚠️ No hay carpeta local seleccionada');
                return [];
            }
            
            // Escanear carpeta raíz
            await this.scanFolderForGPX(this.localFolderHandle, '', gpxList);
            
            console.log(`📂 ${gpxList.length} GPX encontrados en carpeta local`);
            return gpxList;
            
        } catch (error) {
            console.error('❌ Error escaneando carpeta local:', error);
            return [];
        }
    }

    async scanFolderForGPX(folderHandle, path, gpxList) {
        try {
            const entries = [];
            
            // Leer directorio
            for await (const entry of folderHandle.values()) {
                entries.push(entry);
            }
            
            // Procesar archivos .gpx
            for (const entry of entries) {
                if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.gpx')) {
                    try {
                        const file = await entry.getFile();
                        const fileInfo = await this.getGPXFileInfo(file, path);
                        gpxList.push({
                            id: Date.now() + Math.random(), // ID temporal
                            title: entry.name.replace('.gpx', '').replace('.GPX', ''),
                            filename: entry.name,
                            path: path ? `${path}/${entry.name}` : entry.name,
                            timestamp: file.lastModified,
                            size: file.size,
                            location: 'localFolder',
                            source: 'filesystem',
                            fileHandle: entry, // Guardar referencia al archivo
                            file: file
                        });
                    } catch (error) {
                        console.warn(`⚠️ Error leyendo archivo ${entry.name}:`, error);
                    }
                }
                // También escanear subcarpetas (sesiones)
                else if (entry.kind === 'directory') {
                    const subPath = path ? `${path}/${entry.name}` : entry.name;
                    await this.scanFolderForGPX(entry, subPath, gpxList);
                }
            }
            
        } catch (error) {
            console.error(`❌ Error escaneando carpeta ${path}:`, error);
        }
    }

    async getGPXFileInfo(file, path) {
        try {
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            // Extraer información básica del GPX
            const nameElement = xmlDoc.querySelector('name, metadata > name');
            const points = xmlDoc.querySelectorAll('trkpt, wpt').length;
            
            return {
                name: nameElement ? nameElement.textContent : file.name.replace('.gpx', ''),
                points: points,
                path: path
            };
            
        } catch (error) {
            console.warn('⚠️ Error parseando GPX:', error);
            return {
                name: file.name.replace('.gpx', ''),
                points: 0,
                path: path
            };
        }
    }

    renderGPXList() {
        const container = this.elements.gpxList;
        if (!container) return;
        
        console.log('🗺️ Renderizando lista GPX:', this.state.gpxTracks.length);
        
        if (this.state.gpxTracks.length === 0) {
            let message = 'No hay rutas GPX';
            let submessage = 'Las rutas se crearán automáticamente al grabar videos con GPS';
            
            if (this.state.viewMode === 'localFolder') {
                message = 'No hay archivos GPX en la carpeta';
                submessage = 'Los archivos .gpx aparecerán aquí automáticamente';
            }
            
            container.innerHTML = `
                <div class="empty-state">
                    <div>🗺️</div>
                    <p>${message}</p>
                    <p>${submessage}</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="file-list">';
        
        this.state.gpxTracks.forEach((gpx, index) => {
            const date = new Date(gpx.timestamp || Date.now());
            const sizeKB = gpx.size ? Math.round(gpx.size / 1024) : 0;
            const dateStr = date.toLocaleDateString('es-ES');
            const timeStr = date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            const location = gpx.location || 'app';
            const source = gpx.source || 'unknown';
            
            // Icono según ubicación
            let locationIcon = '📱';
            let locationText = 'App';
            if (location === 'localFolder' || source === 'filesystem') {
                locationIcon = '📂';
                locationText = 'Local';
            }
            
            // Información específica según fuente
            let detailsHTML = '';
            if (gpx.points) {
                detailsHTML += `<div>📍 ${gpx.points} puntos</div>`;
            }
            if (gpx.path) {
                detailsHTML += `<div>📁 ${gpx.path}</div>`;
            }
            
            html += `
                <div class="file-item gpx-file" 
                    data-id="${gpx.id || index}" 
                    data-type="gpx"
                    data-location="${location}"
                    data-source="${source}">
                    <div class="file-header">
                        <div class="file-title">${gpx.title || gpx.filename || 'Archivo GPX'}</div>
                        <div class="file-location">${locationIcon}</div>
                        <div class="file-format">GPX</div>
                        <div class="file-time">${timeStr}</div>
                    </div>
                    <div class="file-details">
                        <div>📅 ${dateStr}</div>
                        ${detailsHTML}
                        <div>💾 ${sizeKB} KB</div>
                        <div>${locationIcon} ${locationText}</div>
                    </div>
                    <div class="file-footer">
                        <button class="play-btn download-gpx" data-id="${gpx.id || index}" data-source="${source}">
                            📥 Descargar
                        </button>
                        ${source === 'filesystem' ? `
                            <button class="play-btn load-gpx" data-filename="${gpx.filename}" data-path="${gpx.path}">
                                📤 Cargar a App
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Configurar eventos
        container.querySelectorAll('.download-gpx').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = e.target.dataset.id;
                const source = e.target.dataset.source;
                await this.downloadGPX(id, source);
            });
        });
        
        container.querySelectorAll('.load-gpx').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const filename = e.target.dataset.filename;
                const path = e.target.dataset.path;
                await this.loadGPXFromFileSystem(filename, path);
            });
        });
    }

    async downloadGPX(gpxId, source = 'gpxTracks') {
        try {
            console.log('📥 Descargando GPX:', gpxId, 'fuente:', source);
            
            let blob;
            let filename = 'ruta.gpx';
            
            if (source === 'filesystem') {
                // Para GPX del sistema de archivos
                const gpx = this.state.gpxTracks.find(g => (g.id == gpxId || g.filename === gpxId));
                if (gpx && gpx.file) {
                    blob = gpx.file;
                    filename = gpx.filename || 'ruta.gpx';
                }
            } else {
                // Para GPX de la app
                const gpx = await this.getFromStore('gpxTracks', parseInt(gpxId));
                if (gpx && gpx.blob) {
                    blob = gpx.blob;
                    filename = `${gpx.title || 'ruta'}.gpx`;
                }
            }
            
            if (!blob) {
                this.showNotification('❌ No se pudo obtener el archivo GPX');
                return;
            }
            
            this.downloadBlob(blob, filename);
            this.showNotification('🗺️ GPX descargado');
            
        } catch (error) {
            console.error('❌ Error descargando GPX:', error);
            this.showNotification('❌ Error al descargar GPX');
        }
    }

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

    async loadGPXFromFileSystem(filename, path) {
        try {
            console.log('📤 Cargando GPX desde sistema de archivos:', filename);
            
            if (!this.localFolderHandle) {
                this.showNotification('❌ No hay carpeta local seleccionada');
                return;
            }
            
            // Navegar a la carpeta y obtener el archivo
            const parts = path.split('/');
            let currentHandle = this.localFolderHandle;
            
            for (const part of parts) {
                if (part && part !== filename) {
                    currentHandle = await currentHandle.getDirectoryHandle(part);
                }
            }
            
            const fileHandle = await currentHandle.getFileHandle(filename);
            const file = await fileHandle.getFile();
            
            // Procesar el archivo GPX
            const text = await file.text();
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
                fileSize: file.size,
                blob: new Blob([text], { type: 'application/gpx+xml' })
            };
            
            // Guardar en la base de datos
            if (this.db) {
                await this.saveToDatabase('gpxFiles', gpxData);
                this.state.loadedGPXFiles.push(gpxData);
                this.updateGpxSelect();
                this.showNotification(`✅ GPX cargado a la app: ${gpxData.name}`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando GPX desde sistema de archivos:', error);
            this.showNotification('❌ Error al cargar GPX');
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
    }


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
        const container = document.getElementById('combineVideosList');
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
        const modal = document.getElementById('combineVideosModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideCombineModal() {
        const modal = document.getElementById('combineVideosModal');
        if (modal) {
            modal.classList.add('hidden');
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
        
        // Busca en setupEventListeners() la sección de "Reproductor" y añade:

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
            this.elements.selectAllVideos.addEventListener('click', () => this.selectAll('video'));
        }
        if (this.elements.deselectAllVideos) {
            this.elements.deselectAllVideos.addEventListener('click', () => this.deselectAll('video'));
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
        
        // Detener grabación al salir de la página
        window.addEventListener('beforeunload', () => {
            if (this.state.isRecording) {
                this.stopRecording();
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