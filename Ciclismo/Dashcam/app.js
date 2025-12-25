// Dashcam PWA v2.0.0
// Versión corregida para mostrar archivos en la galería

const APP_VERSION = '2.0.0';

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
            settings: {
                segmentDuration: 5,
                videoQuality: '720p',
                gpxInterval: 5,
                overlayEnabled: true,
                audioEnabled: true,
                watermarkOpacity: 0.7,
                watermarkFontSize: 16,
                watermarkPosition: 'bottom'
            },
            videos: [],
            gpxTracks: []
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
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.elements.overlayCtx = document.getElementById('overlayCanvas').getContext('2d');
        
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
            
            // Paneles
            galleryPanel: document.getElementById('galleryPanel'),
            settingsPanel: document.getElementById('settingsPanel'),
            videoPlayer: document.getElementById('videoPlayer'),
            
            // Tabs
            tabVideos: document.getElementById('tabVideos'),
            tabGPX: document.getElementById('tabGPX'),
            videosTab: document.getElementById('videosTab'),
            gpxTab: document.getElementById('gpxTab'),
            
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
            shareBtn: document.getElementById('shareBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            closeGallery: document.getElementById('closeGallery'),
            
            // Configuración
            segmentDuration: document.getElementById('segmentDuration'),
            videoQuality: document.getElementById('videoQuality'),
            gpxInterval: document.getElementById('gpxInterval'),
            overlayEnabled: document.getElementById('overlayEnabled'),
            audioEnabled: document.getElementById('audioEnabled'),
            saveSettings: document.getElementById('saveSettings'),
            closeSettings: document.getElementById('closeSettings'),
            
            // Reproductor
            playbackVideo: document.getElementById('playbackVideo'),
            videoTitle: document.getElementById('videoTitle'),
            videoDetails: document.getElementById('videoDetails'),
            exportVideo: document.getElementById('exportVideo'),
            shareVideo: document.getElementById('shareVideo'),
            deleteVideo: document.getElementById('deleteVideo'),
            closePlayer: document.getElementById('closePlayer'),
            
            // Modal landscape
            landscapeModal: document.querySelector('.landscape-modal'),
            continueBtn: document.getElementById('continueBtn')
        };
    }

    // ============ BASE DE DATOS ============

    async initDatabase() {
        return new Promise((resolve, reject) => {
            console.log('📊 Inicializando base de datos...');
            
            const request = indexedDB.open('DashcamDB', 6);
            
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
                    console.log('✅ Store de vídeos creado');
                }
                
                // Store para tracks GPX
                if (!this.db.objectStoreNames.contains('gpxTracks')) {
                    const gpxStore = this.db.createObjectStore('gpxTracks', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    gpxStore.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log('✅ Store de GPX creado');
                }
                
                // Store para configuración
                if (!this.db.objectStoreNames.contains('settings')) {
                    this.db.createObjectStore('settings', { keyPath: 'name' });
                    console.log('✅ Store de configuración creado');
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ Base de datos lista');
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('❌ Error base de datos:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async loadSettings() {
        try {
            if (!this.db) {
                console.log('⚠️ Base de datos no disponible para cargar configuración');
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
                }
            };
            
            request.onerror = (error) => {
                console.warn('⚠️ Error cargando configuración:', error);
            };
            
        } catch (error) {
            console.warn('⚠️ Error cargando configuración:', error);
        }
    }

    updateSettingsUI() {
        try {
            if (this.elements.segmentDuration) {
                this.elements.segmentDuration.value = this.state.settings.segmentDuration;
            }
            if (this.elements.videoQuality) {
                this.elements.videoQuality.value = this.state.settings.videoQuality;
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
        } catch (error) {
            console.warn('⚠️ Error actualizando UI de configuración:', error);
        }
    }

    // ============ PERMISOS ============

    async requestPermissions() {
        try {
            console.log('🔐 Solicitando permisos...');
            
            if (navigator.permissions && navigator.permissions.query) {
                await Promise.all([
                    navigator.permissions.query({ name: 'camera' }).catch(() => {
                        console.log('⚠️ Permiso de cámara no disponible');
                    }),
                    navigator.permissions.query({ name: 'geolocation' }).catch(() => {
                        console.log('⚠️ Permiso de geolocalización no disponible');
                    })
                ]);
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

    // ============ GRABACIÓN ============

    async startRecording() {
        console.log('🎬 Iniciando grabación...');
        
        if (this.shouldShowLandscapeModal()) {
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
            this.mainCanvas.width = settings.width || 1280;
            this.mainCanvas.height = settings.height || 720;
            
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
            
            this.canvasStream = this.mainCanvas.captureStream(30);
            
            if (this.state.settings.audioEnabled) {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const audioTrack = audioStream.getAudioTracks()[0];
                    this.canvasStream.addTrack(audioTrack);
                } catch (audioError) {
                    console.warn('⚠️ Audio no disponible:', audioError);
                }
            }
            
            const mimeType = this.getSupportedMimeType();
            this.mediaRecorder = new MediaRecorder(this.canvasStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000
            });
            
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.saveVideoSegment();
                this.stopFrameCapture();
            };
            
            this.mediaRecorder.start(1000);
            
            const segmentMs = this.state.settings.segmentDuration * 60 * 1000;
            this.segmentTimer = setTimeout(() => {
                this.startNewSegment();
            }, segmentMs);
            
            this.updateRecordingUI();
            this.showNotification('🎬 Grabación iniciada');
            
        } catch (error) {
            console.error('❌ Error iniciando grabación:', error);
            this.state.isRecording = false;
            this.showNotification('❌ Error: ' + error.message);
            this.showStartScreen();
        }
    }

    shouldShowLandscapeModal() {
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return false;
        }
        return window.innerHeight > window.innerWidth;
    }

    showLandscapeModal() {
        this.state.showLandscapeModal = true;
        this.elements.landscapeModal.classList.add('active');
    }

    hideLandscapeModal() {
        this.state.showLandscapeModal = false;
        this.elements.landscapeModal.classList.remove('active');
    }

    async initCamera() {
        try {
            console.log('📷 Inicializando cámara...');
            
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: this.state.settings.audioEnabled
            };
            
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.elements.videoPreview.srcObject = this.mediaStream;
            
            await new Promise((resolve) => {
                this.elements.videoPreview.onloadedmetadata = () => {
                    this.elements.videoPreview.play().then(resolve).catch(resolve);
                };
            });
            
            this.elements.overlayCanvas.width = this.elements.videoPreview.videoWidth;
            this.elements.overlayCanvas.height = this.elements.videoPreview.videoHeight;
            
            console.log('✅ Cámara inicializada');
            
        } catch (error) {
            console.error('❌ Error cámara:', error);
            throw error;
        }
    }

    showStartScreen() {
        this.elements.startScreen.style.display = 'flex';
        this.elements.cameraScreen.classList.remove('active');
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
    }

    showCameraScreen() {
        this.elements.startScreen.style.display = 'none';
        this.elements.cameraScreen.classList.add('active');
        
        if (this.elements.videoPreview.srcObject) {
            this.elements.videoPreview.play().catch(console.error);
        }
    }

    startFrameCapture() {
        let lastTimestamp = 0;
        const fps = 30;
        const interval = 1000 / fps;
        
        const captureFrame = (timestamp) => {
            if (!this.state.isRecording) {
                this.animationFrame = requestAnimationFrame(captureFrame);
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
        if (!this.mediaRecorder) return;
        
        try {
            if (this.segmentTimer) {
                clearTimeout(this.segmentTimer);
                this.segmentTimer = null;
            }
            
            this.mediaRecorder.stop();
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
        }
    }

    updateRecordingUI() {
        if (!this.elements.recordingStatus || !this.elements.recordingTimeEl) return;
        
        if (this.state.isPaused) {
            this.elements.recordingStatus.textContent = '⏸️ PAUSADO';
            this.elements.recordingStatus.className = 'recording-status paused';
            this.elements.pauseBtn.textContent = '▶️ Continuar';
        } else if (this.state.isRecording) {
            this.elements.recordingStatus.textContent = '● GRABANDO';
            this.elements.recordingStatus.className = 'recording-status recording';
            this.elements.pauseBtn.textContent = '⏸️ Pausar';
        }
    }

    // ============ GUARDADO DE DATOS ============

    async saveVideoSegment() {
        if (this.recordedChunks.length === 0) {
            console.log('⚠️ No hay chunks para guardar');
            return;
        }
        
        try {
            console.log('💾 Guardando vídeo...');
            
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const duration = Date.now() - this.state.startTime;
            
            const videoData = {
                id: Date.now(),
                blob: blob,
                timestamp: this.state.startTime,
                duration: duration,
                size: blob.size,
                title: `Grabación ${new Date(this.state.startTime).toLocaleString()}`,
                gpsPoints: this.gpxPoints.length
            };
            
            console.log('📊 Datos del vídeo:', {
                size: Math.round(blob.size / (1024 * 1024)) + ' MB',
                duration: this.formatTime(duration),
                gpsPoints: this.gpxPoints.length
            });
            
            await this.saveToDatabase('videos', videoData);
            this.recordedChunks = [];
            
            console.log('✅ Vídeo guardado en base de datos');
            
        } catch (error) {
            console.error('❌ Error guardando vídeo:', error);
        }
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
                title: `Ruta ${new Date().toLocaleString()}`,
                size: blob.size
            };
            
            await this.saveToDatabase('gpxTracks', gpxData);
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

    // ============ GPS ============

    startGPS() {
        if (!navigator.geolocation) {
            console.log('📍 GPS no soportado');
            return;
        }
        
        console.log('📍 Iniciando GPS...');
        
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
                    this.elements.gpsInfo.textContent = '📍 GPS: Buscando señal...';
                }
                this.currentPosition = null;
            },
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 5000
            }
        );
        
        this.gpxInterval = setInterval(() => {
            if (this.currentPosition && this.state.isRecording && !this.state.isPaused) {
                this.saveGPXPoint(this.currentPosition);
            }
        }, this.state.settings.gpxInterval * 1000);
    }

    async saveGPXPoint(position) {
        const pointData = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            ele: position.coords.altitude || 0,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            recordTime: Date.now()
        };
        
        this.gpxPoints.push(pointData);
    }

    // ============ GALERÍA ============

    async loadGallery() {
        console.log('📁 Cargando galería...');
        try {
            await this.loadVideos();
            await this.loadGPXTracks();
            console.log('✅ Galería cargada');
        } catch (error) {
            console.error('❌ Error cargando galería:', error);
        }
    }

    async loadVideos() {
        try {
            console.log('🎬 Cargando vídeos...');
            const videos = await this.getAllFromStore('videos');
            console.log(`📊 ${videos.length} vídeos encontrados`);
            
            this.state.videos = videos.sort((a, b) => b.timestamp - a.timestamp);
            this.renderVideosList();
            
        } catch (error) {
            console.error('❌ Error cargando vídeos:', error);
            this.state.videos = [];
            this.renderVideosList();
        }
    }

    renderVideosList() {
        const container = this.elements.videosList;
        if (!container) return;
        
        console.log('🖼️ Renderizando lista de vídeos:', this.state.videos.length);
        
        if (this.state.videos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>🎬</div>
                    <p>No hay vídeos grabados</p>
                    <p>Inicia una grabación para comenzar</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="file-list">';
        
        this.state.videos.forEach(video => {
            const date = new Date(video.timestamp);
            const sizeMB = Math.round(video.size / (1024 * 1024));
            const duration = this.formatTime(video.duration || 0);
            
            html += `
                <div class="file-item video-file ${this.state.selectedVideos.has(video.id) ? 'selected' : ''}" 
                     data-id="${video.id}" 
                     data-type="video">
                    <div class="file-header">
                        <div class="file-title">${video.title || 'Grabación'}</div>
                        <div class="file-time">${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div class="file-details">
                        <div>📅 ${date.toLocaleDateString()}</div>
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
        
        // Eventos
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

    async loadGPXTracks() {
        try {
            console.log('📍 Cargando tracks GPX...');
            const tracks = await this.getAllFromStore('gpxTracks');
            console.log(`📊 ${tracks.length} tracks GPX encontrados`);
            
            this.state.gpxTracks = tracks.sort((a, b) => b.timestamp - a.timestamp);
            this.renderGPXList();
            
        } catch (error) {
            console.error('❌ Error cargando GPX:', error);
            this.state.gpxTracks = [];
            this.renderGPXList();
        }
    }

    renderGPXList() {
        const container = this.elements.gpxList;
        if (!container) return;
        
        if (this.state.gpxTracks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>📍</div>
                    <p>No hay rutas GPX</p>
                    <p>Se generan durante la grabación</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="file-list">';
        
        this.state.gpxTracks.forEach(track => {
            const date = new Date(track.timestamp);
            const sizeKB = Math.round(track.size / 1024);
            
            html += `
                <div class="file-item gpx-file ${this.state.selectedGPX.has(track.id) ? 'selected' : ''}" 
                     data-id="${track.id}" 
                     data-type="gpx">
                    <div class="file-header">
                        <div class="file-title">${track.title || 'Ruta GPX'}</div>
                        <div class="file-time">${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                    <div class="file-details">
                        <div>📅 ${date.toLocaleDateString()}</div>
                        <div>📍 ${track.points || 0} puntos</div>
                        <div>💾 ${sizeKB} KB</div>
                    </div>
                    <div class="file-footer">
                        <div class="file-checkbox">
                            <input type="checkbox" ${this.state.selectedGPX.has(track.id) ? 'checked' : ''}>
                            <span>Seleccionar</span>
                        </div>
                        <button class="view-btn" data-id="${track.id}">👁️ Ver</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Eventos
        container.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.view-btn') && !(e.target.type === 'checkbox')) {
                    const id = parseInt(item.dataset.id);
                    this.toggleSelection(id, 'gpx');
                }
            });
            
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(item.dataset.id);
                    this.toggleSelection(id, 'gpx');
                });
            }
            
            const viewBtn = item.querySelector('.view-btn');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(item.dataset.id);
                    this.viewGPX(id);
                });
            }
        });
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
        this.updateInterval = setInterval(() => this.updateUI(), 1000);
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
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFromStore(storeName, id) {
        return new Promise((resolve, reject) => {
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
        this.elements.startBtn.addEventListener('click', () => this.startRecording());
        this.elements.galleryBtn.addEventListener('click', () => this.showGallery());
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        
        // Controles de grabación
        this.elements.pauseBtn.addEventListener('click', () => {
            if (this.state.isPaused) {
                this.resumeRecording();
            } else {
                this.pauseRecording();
            }
        });
        
        this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        
        // Modal landscape
        this.elements.continueBtn.addEventListener('click', () => {
            this.hideLandscapeModal();
            this.startRecording();
        });
        
        // Galería
        this.elements.closeGallery.addEventListener('click', () => this.hideGallery());
        this.elements.selectAllVideos.addEventListener('click', () => this.selectAll('videos'));
        this.elements.deselectAllVideos.addEventListener('click', () => this.deselectAll('videos'));
        this.elements.selectAllGPX.addEventListener('click', () => this.selectAll('gpx'));
        this.elements.deselectAllGPX.addEventListener('click', () => this.deselectAll('gpx'));
        this.elements.exportBtn.addEventListener('click', () => this.exportSelected());
        this.elements.shareBtn.addEventListener('click', () => this.shareSelected());
        this.elements.deleteBtn.addEventListener('click', () => this.deleteSelected());
        
        // Configuración
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        this.elements.closeSettings.addEventListener('click', () => this.hideSettings());
        
        // Reproductor
        this.elements.closePlayer.addEventListener('click', () => this.hideVideoPlayer());
        this.elements.exportVideo.addEventListener('click', () => this.exportSingleVideo());
        this.elements.shareVideo.addEventListener('click', () => this.shareSingleVideo());
        this.elements.deleteVideo.addEventListener('click', () => this.deleteSingleVideo());
        
        // Tabs
        this.elements.tabVideos.addEventListener('click', () => this.switchTab('videos'));
        this.elements.tabGPX.addEventListener('click', () => this.switchTab('gpx'));
        
        // Búsqueda
        this.elements.searchVideos.addEventListener('input', (e) => this.searchVideos(e.target.value));
        this.elements.searchGPX.addEventListener('input', (e) => this.searchGPX(e.target.value));
    }

    showGallery() {
        console.log('📁 Mostrando galería');
        this.elements.galleryPanel.classList.remove('hidden');
        this.switchTab(this.state.activeTab);
    }

    hideGallery() {
        this.elements.galleryPanel.classList.add('hidden');
        this.state.selectedVideos.clear();
        this.state.selectedGPX.clear();
        this.updateSelectionButtons();
    }

    switchTab(tabName) {
        console.log(`↔️ Cambiando a tab: ${tabName}`);
        this.state.activeTab = tabName;
        
        const tabVideos = document.getElementById('tabVideos');
        const tabGPX = document.getElementById('tabGPX');
        const videosTab = document.getElementById('videosTab');
        const gpxTab = document.getElementById('gpxTab');
        
        if (tabVideos && tabGPX && videosTab && gpxTab) {
            tabVideos.classList.toggle('active', tabName === 'videos');
            tabGPX.classList.toggle('active', tabName === 'gpx');
            
            videosTab.classList.toggle('active', tabName === 'videos');
            gpxTab.classList.toggle('active', tabName === 'gpx');
            
            if (tabName === 'videos') {
                this.loadVideos();
            } else {
                this.loadGPXTracks();
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
        
        this.elements.exportBtn.disabled = !hasSelected;
        this.elements.shareBtn.disabled = !hasSelected;
        this.elements.deleteBtn.disabled = !hasSelected;
    }

    // ... (resto de métodos para reproductor, configuración, etc. se mantienen igual)

    getSupportedMimeType() {
        const types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return '';
    }

    startNewSegment() {
        if (!this.mediaRecorder || this.state.isPaused) return;
        
        this.mediaRecorder.stop();
        
        setTimeout(() => {
            if (this.state.isRecording && !this.state.isPaused) {
                this.mediaRecorder.start(1000);
                
                const segmentMs = this.state.settings.segmentDuration * 60 * 1000;
                this.segmentTimer = setTimeout(() => {
                    this.startNewSegment();
                }, segmentMs);
                
                this.showNotification(`🔄 Nuevo segmento`);
            }
        }, 100);
    }
}

// Inicializar la app
document.addEventListener('DOMContentLoaded', () => {
    window.dashcamApp = new DashcamApp();
});