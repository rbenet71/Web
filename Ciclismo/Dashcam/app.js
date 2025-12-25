// Dashcam PWA - Grabación con datos GPS incorporados permanentemente en el video
// Versión simplificada: pantalla inicial completa, cámara solo al grabar

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
            settings: {
                segmentDuration: 5,
                videoQuality: '720p',
                gpxInterval: 5,
                overlayEnabled: true,
                audioEnabled: true,
                watermarkOpacity: 0.7,
                watermarkFontSize: 18,
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
        console.log('🚀 Iniciando Dashcam PWA');
        
        // Inicializar elementos DOM
        this.initElements();
        
        // Inicializar canvas (pero ocultos)
        this.mainCanvas = document.getElementById('mainCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        
        // Cargar configuración
        await this.loadSettings();
        
        // Inicializar base de datos
        await this.initDatabase();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Solicitar permisos básicos
        await this.requestPermissions();
        
        // Iniciar monitoreo (GPS, batería, etc.)
        this.startMonitoring();
        
        // Cargar galería
        await this.loadGallery();
        
        this.showNotification('Dashcam PWA lista para usar');
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
            overlayCtx: document.getElementById('overlayCanvas').getContext('2d'),
            
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
            const request = indexedDB.open('DashcamDB', 5);
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                
                // Store para vídeos
                if (!this.db.objectStoreNames.contains('videos')) {
                    const videoStore = this.db.createObjectStore('videos', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    videoStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Store para tracks GPX
                if (!this.db.objectStoreNames.contains('gpxTracks')) {
                    const gpxStore = this.db.createObjectStore('gpxTracks', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    gpxStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Store para configuración
                if (!this.db.objectStoreNames.contains('settings')) {
                    this.db.createObjectStore('settings', { keyPath: 'name' });
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
            if (!this.db) return;
            
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get('appSettings');
            
            request.onsuccess = () => {
                if (request.result) {
                    this.state.settings = { ...this.state.settings, ...request.result.value };
                    this.updateSettingsUI();
                }
            };
        } catch (error) {
            console.warn('⚠️ Error cargando configuración:', error);
        }
    }

    async saveSettingsToDB() {
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({
                name: 'appSettings',
                value: this.state.settings,
                timestamp: Date.now()
            });
            
            request.onsuccess = () => resolve();
        });
    }

    updateSettingsUI() {
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
    }

    // ============ PERMISOS ============

    async requestPermissions() {
        try {
            // Solo solicitar permisos básicos, no iniciar cámara aún
            if (navigator.permissions && navigator.permissions.query) {
                await Promise.all([
                    navigator.permissions.query({ name: 'camera' }).catch(() => {}),
                    navigator.permissions.query({ name: 'geolocation' }).catch(() => {})
                ]);
            }
            
            // Almacenamiento persistente
            if (navigator.storage && navigator.storage.persist) {
                await navigator.storage.persist();
            }
            
        } catch (error) {
            console.warn('⚠️ Algunos permisos no disponibles:', error);
        }
    }

    // ============ INICIAR GRABACIÓN ============

    async startRecording() {
        console.log('🎬 Iniciando grabación...');
        
        // Mostrar modal de landscape si está en portrait en móvil
        if (this.shouldShowLandscapeModal()) {
            this.showLandscapeModal();
            return;
        }
        
        try {
            // 1. Inicializar cámara
            await this.initCamera();
            
            if (!this.mediaStream) {
                this.showNotification('❌ No se pudo acceder a la cámara');
                return;
            }
            
            // 2. Cambiar a pantalla de cámara
            this.showCameraScreen();
            
            // 3. Configurar estado
            this.state.isRecording = true;
            this.state.isPaused = false;
            this.state.startTime = Date.now();
            this.state.currentTime = 0;
            this.gpxPoints = [];
            
            // 4. Configurar canvas principal
            const videoTrack = this.mediaStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            this.mainCanvas.width = settings.width || 1280;
            this.mainCanvas.height = settings.height || 720;
            
            // 5. Crear elemento de video para captura
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
            
            // 6. Iniciar captura de frames
            this.startFrameCapture();
            
            // 7. Crear stream desde el canvas
            this.canvasStream = this.mainCanvas.captureStream(30);
            
            // 8. Añadir audio si está habilitado
            if (this.state.settings.audioEnabled) {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const audioTrack = audioStream.getAudioTracks()[0];
                    this.canvasStream.addTrack(audioTrack);
                } catch (audioError) {
                    console.warn('⚠️ Audio no disponible:', audioError);
                }
            }
            
            // 9. Configurar MediaRecorder
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
            
            // 10. Iniciar grabación
            this.mediaRecorder.start(1000);
            
            // 11. Temporizador para segmentos
            const segmentMs = this.state.settings.segmentDuration * 60 * 1000;
            this.segmentTimer = setTimeout(() => {
                this.startNewSegment();
            }, segmentMs);
            
            // 12. Actualizar UI
            this.updateRecordingUI();
            
            this.showNotification('🎬 Grabación iniciada - Los datos GPS se graban en el video');
            
        } catch (error) {
            console.error('❌ Error iniciando grabación:', error);
            this.state.isRecording = false;
            this.showNotification('❌ Error al iniciar grabación: ' + error.message);
            this.showStartScreen();
        }
    }

    shouldShowLandscapeModal() {
        // Solo mostrar modal en móviles en portrait
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
            
            // Configurar tamaño del overlay
            this.elements.overlayCanvas.width = this.elements.videoPreview.videoWidth;
            this.elements.overlayCanvas.height = this.elements.videoPreview.videoHeight;
            
            console.log('✅ Cámara inicializada');
            
        } catch (error) {
            console.error('❌ Error cámara:', error);
            throw error;
        }
    }

    // ============ PANTALLAS ============

    showStartScreen() {
        this.elements.startScreen.style.display = 'flex';
        this.elements.cameraScreen.classList.remove('active');
        
        // Detener cualquier stream activo
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
    }

    showCameraScreen() {
        this.elements.startScreen.style.display = 'none';
        this.elements.cameraScreen.classList.add('active');
        
        // Asegurar que el video está reproduciéndose
        if (this.elements.videoPreview.srcObject) {
            this.elements.videoPreview.play().catch(console.error);
        }
    }

    // ============ CAPTURA DE VIDEO ============

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
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar frame de video
        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        
        // Dibujar datos GPS y fecha
        this.drawPermanentWatermark(ctx, canvas);
        
        // Dibujar overlay temporal si está habilitado
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
        
        // Fondo semitransparente
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        
        let x, y, textAlign, textBaseline, bgHeight;
        
        switch(position) {
            case 'top':
                x = canvas.width / 2;
                y = 30;
                textAlign = 'center';
                textBaseline = 'top';
                bgHeight = 70;
                ctx.fillRect(0, 0, canvas.width, bgHeight);
                break;
                
            case 'corner':
                x = 20;
                y = 30;
                textAlign = 'left';
                textBaseline = 'top';
                bgHeight = 70;
                ctx.fillRect(0, 0, 500, bgHeight);
                break;
                
            case 'bottom':
            default:
                x = canvas.width / 2;
                y = canvas.height - 30;
                textAlign = 'center';
                textBaseline = 'bottom';
                bgHeight = 70;
                ctx.fillRect(0, canvas.height - bgHeight, canvas.width, bgHeight);
                break;
        }
        
        // Fecha y hora
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        ctx.fillText(`📅 ${dateStr}`, x, y);
        
        // Coordenadas GPS si disponibles
        if (this.currentPosition) {
            const lat = this.currentPosition.lat.toFixed(6);
            const lon = this.currentPosition.lon.toFixed(6);
            const speed = (this.currentPosition.speed * 3.6 || 0).toFixed(1);
            
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText(`📍 ${lat}, ${lon} | 🚗 ${speed} km/h`, x, y + fontSize + 8);
            
            if (this.currentPosition.accuracy) {
                const accuracy = this.currentPosition.accuracy.toFixed(1);
                const timeStr = this.formatTime(this.state.currentTime);
                ctx.fillText(`🎯 ${accuracy}m | ⏱️ ${timeStr}`, x, y + (fontSize * 2) + 16);
            }
            
            // Guardar punto GPX
            if (this.state.isRecording && !this.state.isPaused) {
                this.saveGPXPoint(this.currentPosition);
            }
        } else {
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText('📍 GPS: Buscando señal...', x, y + fontSize + 8);
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
        
        // Solo mostrar indicador de grabación en esquina superior derecha
        overlayCtx.fillStyle = this.state.isPaused ? 'rgba(254, 202, 87, 0.8)' : 'rgba(255, 107, 107, 0.8)';
        overlayCtx.font = 'bold 20px monospace';
        overlayCtx.textAlign = 'right';
        overlayCtx.textBaseline = 'top';
        
        const statusText = this.state.isPaused ? '⏸️ PAUSADO' : '● GRABANDO';
        overlayCtx.fillText(statusText, overlayCanvas.width - 20, 20);
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

    // ============ CONTROL DE GRABACIÓN ============

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
            // Detener temporizador
            if (this.segmentTimer) {
                clearTimeout(this.segmentTimer);
                this.segmentTimer = null;
            }
            
            // Detener grabación
            this.mediaRecorder.stop();
            
            // Detener captura de frames
            this.stopFrameCapture();
            
            // Guardar último segmento
            if (this.recordedChunks.length > 0) {
                await this.saveVideoSegment();
            }
            
            // Guardar track GPX
            if (this.gpxPoints.length > 0) {
                await this.saveGPXTrack();
            }
            
            // Resetear estado
            this.state.isRecording = false;
            this.state.isPaused = false;
            this.state.currentTime = 0;
            
            // Volver a pantalla inicial
            this.showStartScreen();
            
            this.showNotification('💾 Video guardado con datos GPS incorporados');
            
            // Recargar galería
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error deteniendo grabación:', error);
            this.showNotification('❌ Error al guardar el video');
        }
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
                
                this.showNotification(`🔄 Nuevo segmento (${this.state.settings.segmentDuration} min)`);
            }
        }, 100);
    }

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
        if (this.recordedChunks.length === 0) return;
        
        try {
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const duration = Date.now() - this.state.startTime;
            
            const metadata = {
                title: `Dashcam ${new Date(this.state.startTime).toLocaleString()}`,
                description: 'Grabación con datos GPS incorporados en el video',
                creationTime: new Date(this.state.startTime).toISOString(),
                duration: duration,
                gpsPoints: this.gpxPoints.length,
                settings: { ...this.state.settings }
            };
            
            const videoData = {
                id: Date.now(),
                blob: blob,
                timestamp: this.state.startTime,
                duration: duration,
                size: blob.size,
                metadata: metadata,
                title: metadata.title,
                gpsPoints: this.gpxPoints.length
            };
            
            await this.saveToDatabase('videos', videoData);
            
            this.recordedChunks = [];
            
            console.log('💾 Vídeo guardado con metadatos');
            
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
                size: blob.size,
                videoId: this.state.currentSegment
            };
            
            await this.saveToDatabase('gpxTracks', gpxData);
            
            console.log('📍 GPX guardado');
            
            this.gpxPoints = [];
            
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
            this.updateGPSStatus('❌ No soportado');
            return;
        }
        
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
                
                this.updateGPSStatus('✅ Conectado');
                
                // Actualizar info en pantalla de grabación
                if (this.elements.gpsInfo) {
                    const speedKmh = (this.currentPosition.speed * 3.6).toFixed(1);
                    this.elements.gpsInfo.textContent = 
                        `📍 ${this.currentPosition.lat.toFixed(4)}, ${this.currentPosition.lon.toFixed(4)} | ${speedKmh} km/h`;
                }
                
            },
            (error) => this.onGPSError(error),
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

    updateGPSStatus(status) {
        // Se actualiza en la UI directamente
    }

    onGPSError(error) {
        console.warn('⚠️ GPS Error:', error);
        
        if (this.elements.gpsInfo) {
            this.elements.gpsInfo.textContent = '📍 GPS: Buscando señal...';
        }
        
        this.currentPosition = null;
    }

    // ============ UTILIDADES ============

    formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

    // ============ MONITOREO ============

    startMonitoring() {
        this.startGPS();
        this.updateInterval = setInterval(() => this.updateUI(), 1000);
    }

    // ============ BASE DE DATOS - UTILIDADES ============

    async saveToDatabase(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
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
        
        // Continuar después del modal landscape
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
        
        // Manejar cierre de la aplicación
        window.addEventListener('beforeunload', (e) => {
            if (this.state.isRecording) {
                e.preventDefault();
                e.returnValue = '¿Salir? Se perderá la grabación en curso.';
            }
        });
        
        // Detectar cambios de orientación
        window.addEventListener('orientationchange', () => {
            if (this.state.showLandscapeModal && window.innerHeight < window.innerWidth) {
                this.hideLandscapeModal();
            }
        });
    }

    // ============ GALERÍA ============

    showGallery() {
        this.elements.galleryPanel.classList.remove('hidden');
        this.switchTab(this.state.activeTab);
    }

    hideGallery() {
        this.elements.galleryPanel.classList.add('hidden');
        this.state.selectedVideos.clear();
        this.state.selectedGPX.clear();
        this.updateSelectionButtons();
    }

    async loadGallery() {
        await this.loadVideos();
        await this.loadGPXTracks();
    }

    async loadVideos() {
        try {
            const videos = await this.getAllFromStore('videos');
            this.state.videos = videos.sort((a, b) => b.timestamp - a.timestamp);
            this.renderVideosList();
        } catch (error) {
            console.error('❌ Error cargando vídeos:', error);
        }
    }

    async loadGPXTracks() {
        try {
            const tracks = await this.getAllFromStore('gpxTracks');
            this.state.gpxTracks = tracks.sort((a, b) => b.timestamp - a.timestamp);
            this.renderGPXList();
        } catch (error) {
            console.error('❌ Error cargando GPX:', error);
        }
    }

    renderVideosList() {
        const container = this.elements.videosList;
        
        if (this.state.videos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>🎬</div>
                    <p>No hay vídeos grabados</p>
                    <p>Los datos GPS se graban en cada video</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.state.videos.map(video => `
            <div class="file-item video-file ${this.state.selectedVideos.has(video.id) ? 'selected' : ''}" 
                 data-id="${video.id}" 
                 data-type="video">
                <div class="file-header">
                    <div class="file-title">${video.title || 'Grabación'}</div>
                    <div class="file-time">${new Date(video.timestamp).toLocaleTimeString()}</div>
                </div>
                <div class="file-details">
                    <div>📅 ${new Date(video.timestamp).toLocaleDateString()}</div>
                    <div>⏱️ ${this.formatTime(video.duration)}</div>
                    <div>💾 ${Math.round(video.size / (1024 * 1024))} MB</div>
                </div>
                <div class="file-footer">
                    <div class="file-checkbox">
                        <input type="checkbox" ${this.state.selectedVideos.has(video.id) ? 'checked' : ''}>
                        <span>Seleccionar</span>
                    </div>
                    <button class="play-btn" data-id="${video.id}">▶️ Reproducir</button>
                </div>
            </div>
        `).join('');
        
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

    renderGPXList() {
        const container = this.elements.gpxList;
        
        if (this.state.gpxTracks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>📍</div>
                    <p>No hay rutas GPX</p>
                    <p>Se generan automáticamente durante la grabación</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.state.gpxTracks.map(track => `
            <div class="file-item gpx-file ${this.state.selectedGPX.has(track.id) ? 'selected' : ''}" 
                 data-id="${track.id}" 
                 data-type="gpx">
                <div class="file-header">
                    <div class="file-title">${track.title || 'Ruta GPX'}</div>
                    <div class="file-time">${new Date(track.timestamp).toLocaleTimeString()}</div>
                </div>
                <div class="file-details">
                    <div>📅 ${new Date(track.timestamp).toLocaleDateString()}</div>
                    <div>📍 ${track.points} puntos</div>
                    <div>💾 ${Math.round(track.size / 1024)} KB</div>
                </div>
                <div class="file-footer">
                    <div class="file-checkbox">
                        <input type="checkbox" ${this.state.selectedGPX.has(track.id) ? 'checked' : ''}>
                        <span>Seleccionar</span>
                    </div>
                    <button class="view-btn" data-id="${track.id}">👁️ Ver</button>
                </div>
            </div>
        `).join('');
        
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

    // ============ TABS ============

    switchTab(tabName) {
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

    // ============ SELECCIÓN ============

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

    // ============ REPRODUCCIÓN ============

    async playVideo(id) {
        try {
            const video = await this.getFromStore('videos', id);
            this.state.currentVideo = video;
            
            const videoUrl = URL.createObjectURL(video.blob);
            
            this.elements.playbackVideo.src = videoUrl;
            this.elements.videoTitle.textContent = video.title || 'Grabación';
            this.elements.videoDetails.textContent = 
                `${new Date(video.timestamp).toLocaleString()} | ${this.formatTime(video.duration)} | ${Math.round(video.size / (1024 * 1024))} MB | 📍 ${video.gpsPoints || 0} puntos GPS`;
            
            this.elements.videoPlayer.classList.remove('hidden');
            this.hideGallery();
            
            setTimeout(() => {
                this.elements.playbackVideo.play().catch(e => console.log('Autoplay bloqueado:', e));
            }, 500);
            
        } catch (error) {
            console.error('❌ Error reproduciendo:', error);
            this.showNotification('❌ Error al cargar el vídeo');
        }
    }

    hideVideoPlayer() {
        this.elements.videoPlayer.classList.add('hidden');
        
        if (this.elements.playbackVideo.src) {
            URL.revokeObjectURL(this.elements.playbackVideo.src);
            this.elements.playbackVideo.src = '';
        }
        
        this.state.currentVideo = null;
    }

    async exportSingleVideo() {
        if (!this.state.currentVideo) return;
        
        try {
            this.showNotification('📤 Exportando vídeo...');
            
            const video = this.state.currentVideo;
            const filename = `dashcam_${new Date(video.timestamp).toISOString().replace(/[:.]/g, '-')}.webm`;
            
            const url = URL.createObjectURL(video.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            this.showNotification('✅ Vídeo exportado');
            
        } catch (error) {
            console.error('❌ Error exportando:', error);
            this.showNotification('❌ Error al exportar');
        }
    }

    async shareSingleVideo() {
        if (!this.state.currentVideo) return;
        
        try {
            const video = this.state.currentVideo;
            
            if (navigator.share) {
                const blob = video.blob;
                const file = new File([blob], `dashcam_${Date.now()}.webm`, { type: 'video/webm' });
                
                await navigator.share({
                    files: [file],
                    title: 'Grabación Dashcam',
                    text: `Grabación del ${new Date(video.timestamp).toLocaleString()} con datos GPS`
                });
                
                this.showNotification('✅ Vídeo compartido');
                
            } else {
                this.exportSingleVideo();
            }
            
        } catch (error) {
            console.error('❌ Error compartiendo:', error);
            if (error.name !== 'AbortError') {
                this.showNotification('❌ Error al compartir');
            }
        }
    }

    async deleteSingleVideo() {
        if (!this.state.currentVideo || !confirm('¿Eliminar esta grabación?')) return;
        
        try {
            await this.deleteFromStore('videos', this.state.currentVideo.id);
            this.showNotification('🗑️ Vídeo eliminado');
            this.hideVideoPlayer();
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error eliminando:', error);
            this.showNotification('❌ Error al eliminar');
        }
    }

    // ============ GPX ============

    async viewGPX(id) {
        try {
            const track = await this.getFromStore('gpxTracks', id);
            
            alert(`Ruta GPX:
📅 ${new Date(track.timestamp).toLocaleString()}
📍 ${track.points} puntos GPS
💾 ${Math.round(track.size / 1024)} KB

Exporta el archivo GPX para verlo en aplicaciones de mapas.`);
            
        } catch (error) {
            console.error('❌ Error cargando GPX:', error);
            this.showNotification('❌ Error al cargar la ruta');
        }
    }

    // ============ EXPORTACIÓN MÚLTIPLE ============

    async exportSelected() {
        const videosToExport = Array.from(this.state.selectedVideos);
        const gpxToExport = Array.from(this.state.selectedGPX);
        
        if (videosToExport.length === 0 && gpxToExport.length === 0) return;
        
        try {
            this.showNotification(`📤 Exportando ${videosToExport.length + gpxToExport.length} archivos...`);
            
            for (const id of videosToExport) {
                const video = await this.getFromStore('videos', id);
                await this.exportFile(video.blob, `video_${id}.webm`);
            }
            
            for (const id of gpxToExport) {
                const track = await this.getFromStore('gpxTracks', id);
                await this.exportFile(track.blob, `ruta_${id}.gpx`);
            }
            
            this.showNotification(`✅ ${videosToExport.length + gpxToExport.length} archivos exportados`);
            
            this.state.selectedVideos.clear();
            this.state.selectedGPX.clear();
            this.updateSelectionButtons();
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error exportando múltiple:', error);
            this.showNotification('❌ Error al exportar');
        }
    }

    async exportFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    async shareSelected() {
        const videosToShare = Array.from(this.state.selectedVideos);
        const gpxToShare = Array.from(this.state.selectedGPX);
        
        if (videosToShare.length === 0 && gpxToShare.length === 0) return;
        
        try {
            if (navigator.share) {
                const files = [];
                
                for (const id of videosToShare) {
                    const video = await this.getFromStore('videos', id);
                    const file = new File([video.blob], `video_${id}.webm`, { type: 'video/webm' });
                    files.push(file);
                }
                
                for (const id of gpxToShare) {
                    const track = await this.getFromStore('gpxTracks', id);
                    const file = new File([track.blob], `ruta_${id}.gpx`, { type: 'application/gpx+xml' });
                    files.push(file);
                }
                
                await navigator.share({
                    files: files,
                    title: 'Archivos Dashcam',
                    text: `${videosToShare.length} vídeos y ${gpxToShare.length} rutas GPX`
                });
                
                this.showNotification('✅ Archivos compartidos');
                
                this.state.selectedVideos.clear();
                this.state.selectedGPX.clear();
                this.updateSelectionButtons();
                await this.loadGallery();
                
            } else {
                this.exportSelected();
            }
            
        } catch (error) {
            console.error('❌ Error compartiendo:', error);
            if (error.name !== 'AbortError') {
                this.showNotification('❌ Error al compartir');
            }
        }
    }

    async deleteSelected() {
        const videosToDelete = Array.from(this.state.selectedVideos);
        const gpxToDelete = Array.from(this.state.selectedGPX);
        
        if (videosToDelete.length === 0 && gpxToDelete.length === 0) return;
        
        const confirmMsg = `¿Eliminar ${videosToDelete.length} vídeos y ${gpxToDelete.length} rutas GPX?`;
        if (!confirm(confirmMsg)) return;
        
        try {
            for (const id of videosToDelete) {
                await this.deleteFromStore('videos', id);
            }
            
            for (const id of gpxToDelete) {
                await this.deleteFromStore('gpxTracks', id);
            }
            
            this.showNotification(`🗑️ ${videosToDelete.length + gpxToDelete.length} archivos eliminados`);
            
            this.state.selectedVideos.clear();
            this.state.selectedGPX.clear();
            this.updateSelectionButtons();
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error eliminando:', error);
            this.showNotification('❌ Error al eliminar');
        }
    }

    // ============ CONFIGURACIÓN ============

    showSettings() {
        this.elements.settingsPanel.classList.remove('hidden');
        this.loadCurrentSettings();
    }

    hideSettings() {
        this.elements.settingsPanel.classList.add('hidden');
    }

    loadCurrentSettings() {
        this.updateSettingsUI();
    }

    async saveSettings() {
        this.state.settings = {
            segmentDuration: parseInt(this.elements.segmentDuration.value),
            videoQuality: this.elements.videoQuality.value,
            gpxInterval: parseInt(this.elements.gpxInterval.value),
            overlayEnabled: this.elements.overlayEnabled.checked,
            audioEnabled: this.elements.audioEnabled.checked,
            watermarkOpacity: this.state.settings.watermarkOpacity,
            watermarkFontSize: this.state.settings.watermarkFontSize,
            watermarkPosition: this.state.settings.watermarkPosition
        };
        
        await this.saveSettingsToDB();
        
        // Reiniciar intervalo GPX si está activo
        if (this.gpxInterval) {
            clearInterval(this.gpxInterval);
            this.gpxInterval = setInterval(() => {
                if (this.currentPosition && this.state.isRecording && !this.state.isPaused) {
                    this.saveGPXPoint(this.currentPosition);
                }
            }, this.state.settings.gpxInterval * 1000);
        }
        
        this.showNotification('⚙️ Configuración guardada');
        this.hideSettings();
    }

    // ============ BÚSQUEDA ============

    searchVideos(query) {
        const items = document.querySelectorAll('#videosList .file-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    searchGPX(query) {
        const items = document.querySelectorAll('#gpxList .file-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }
}

// ============ INICIALIZACIÓN GLOBAL ============

document.addEventListener('DOMContentLoaded', () => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('✅ Service Worker registrado'))
            .catch(error => console.log('❌ Service Worker:', error));
    }
    
    // Inicializar la app
    window.dashcamApp = new DashcamApp();
});