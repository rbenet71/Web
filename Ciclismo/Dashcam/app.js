// Dashcam PWA - Grabación con datos GPS incorporados permanentemente en el video
// Archivo completo corregido

class DashcamApp {
    constructor() {
        // Estado de la aplicación
        this.state = {
            isRecording: false,
            isPaused: false,
            currentSegment: null,
            gpsTrack: [],
            startTime: null,
            currentTime: 0,
            totalSize: 0,
            selectedVideos: new Set(),
            selectedGPX: new Set(),
            currentVideo: null,
            currentGPX: null,
            activeTab: 'videos', // <-- IMPORTANTE: añadido para tabs
            settings: {
                segmentDuration: 5,
                videoQuality: '720p',
                gpxInterval: 5,
                overlayEnabled: true,
                audioEnabled: true,
                watermarkOpacity: 0.7,
                watermarkFontSize: 20,
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
        this.lastGPXPoint = null;
        this.gpxPoints = [];
        this.recordedChunks = [];
        this.segmentTimer = null;
        this.updateInterval = null;
        this.db = null;
        
        // Variables para composición de video con canvas
        this.mainCanvas = null;
        this.mainCtx = null;
        this.videoElement = null;
        this.canvasStream = null;
        this.animationFrame = null;
        
        // Inicializar
        this.init();
    }

    async init() {
        console.log('🚀 Iniciando Dashcam PWA con grabación de datos en video');
        
        // Inicializar elementos DOM
        this.initElements();
        
        // Inicializar canvas principal
        this.mainCanvas = document.getElementById('mainCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.elements.overlayCtx = document.getElementById('overlayCanvas').getContext('2d');
        
        // Cargar configuración
        await this.loadSettings();
        
        // Inicializar base de datos
        await this.initDatabase();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Solicitar permisos
        await this.requestPermissions();
        
        // Inicializar cámara
        await this.initCamera();
        
        // Iniciar monitoreo
        this.startMonitoring();
        
        // Cargar galería
        await this.loadGallery();
        
        this.showNotification('Dashcam lista para usar - Los datos GPS se grabarán en el video');
    }

    initElements() {
        this.elements = {
            // Vista de cámara
            videoPreview: document.getElementById('videoPreview'),
            mainCanvas: document.getElementById('mainCanvas'),
            overlayCanvas: document.getElementById('overlayCanvas'),
            overlayCtx: null,
            
            // Controles principales
            recordBtn: document.getElementById('recordBtn'),
            stopBtn: document.getElementById('stopBtn'),
            galleryBtn: document.getElementById('galleryBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Elementos de estado
            status: document.getElementById('status'),
            gpsStatus: document.getElementById('gpsStatus'),
            storageStatus: document.getElementById('storageStatus'),
            batteryStatus: document.getElementById('batteryStatus'),
            recordingTime: document.getElementById('recordingTime'),
            fileSize: document.getElementById('fileSize'),
            currentSpeed: document.getElementById('currentSpeed'),
            coordinates: document.getElementById('coordinates'),
            
            // Galería
            galleryPanel: document.getElementById('galleryPanel'),
            settingsPanel: document.getElementById('settingsPanel'),
            videoPlayer: document.getElementById('videoPlayer'),
            
            // Tabs y contenido - NUEVO: IDs específicos
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
            closePlayer: document.getElementById('closePlayer')
        };
    }

    // ============ BASE DE DATOS ============

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('DashcamDB', 4);
            
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

    // ============ PERMISOS Y CÁMARA ============

    async requestPermissions() {
        try {
            // Permisos de cámara
            if (navigator.permissions && navigator.permissions.query) {
                await navigator.permissions.query({ name: 'camera' });
            }
            
            // Permisos de ubicación
            if (navigator.permissions && navigator.permissions.query) {
                await navigator.permissions.query({ name: 'geolocation' });
            }
            
            // Almacenamiento persistente
            if (navigator.storage && navigator.storage.persist) {
                await navigator.storage.persist();
            }
            
        } catch (error) {
            console.warn('⚠️ Algunos permisos no disponibles:', error);
        }
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
            
            // Esperar a que el video esté listo
            await new Promise((resolve) => {
                this.elements.videoPreview.onloadedmetadata = resolve;
            });
            
            // Configurar tamaño del overlay
            this.elements.overlayCanvas.width = this.elements.videoPreview.videoWidth;
            this.elements.overlayCanvas.height = this.elements.videoPreview.videoHeight;
            
            this.elements.recordBtn.disabled = false;
            this.updateStatus('✅ Cámara lista');
            
        } catch (error) {
            console.error('❌ Error cámara:', error);
            this.updateStatus('❌ Error cámara: ' + error.message);
        }
    }

    // ============ GRABACIÓN CON DATOS INCORPORADOS ============

    async startRecording() {
        if (!this.mediaStream) {
            this.showNotification('❌ No hay acceso a la cámara');
            return;
        }
        
        try {
            this.state.isRecording = true;
            this.state.isPaused = false;
            this.state.startTime = Date.now();
            this.state.currentTime = 0;
            this.gpxPoints = [];
            this.lastGPXPoint = null;
            
            // Obtener dimensiones del video
            const videoTrack = this.mediaStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            
            // Configurar canvas principal
            this.mainCanvas.width = settings.width || 1280;
            this.mainCanvas.height = settings.height || 720;
            
            // Crear elemento de video para captura
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
            
            // Iniciar captura de frames
            this.startFrameCapture();
            
            // Crear stream desde el canvas (con datos grabados)
            this.canvasStream = this.mainCanvas.captureStream(30); // 30 FPS
            
            // Añadir audio si está habilitado
            if (this.state.settings.audioEnabled) {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const audioTrack = audioStream.getAudioTracks()[0];
                    this.canvasStream.addTrack(audioTrack);
                } catch (audioError) {
                    console.warn('⚠️ Audio no disponible:', audioError);
                }
            }
            
            // Configurar MediaRecorder
            const mimeType = this.getSupportedMimeType();
            this.mediaRecorder = new MediaRecorder(this.canvasStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000 // 2.5 Mbps
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
            
            // Iniciar grabación
            this.mediaRecorder.start(1000);
            
            // Temporizador para segmentos
            const segmentMs = this.state.settings.segmentDuration * 60 * 1000;
            this.segmentTimer = setTimeout(() => {
                this.startNewSegment();
            }, segmentMs);
            
            // Actualizar UI
            this.elements.recordBtn.classList.add('recording');
            this.elements.recordBtn.querySelector('.btn-text').textContent = 'Pausar';
            this.elements.stopBtn.disabled = false;
            
            this.updateStatus('● GRABANDO');
            this.showNotification('🎬 Grabación iniciada - Los datos GPS se están grabando en el video');
            
        } catch (error) {
            console.error('❌ Error iniciando grabación:', error);
            this.state.isRecording = false;
            this.updateStatus('❌ Error: ' + error.message);
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
                    // Dibujar frame con datos incorporados
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
        
        // Dibujar datos GPS y fecha (¡QUEDAN GRABADOS PERMANENTEMENTE!)
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
        
        // Configuración de visualización
        const fontSize = this.state.settings.watermarkFontSize;
        const opacity = this.state.settings.watermarkOpacity;
        const position = this.state.settings.watermarkPosition;
        
        ctx.save();
        
        // Fondo semitransparente para mejor legibilidad
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        
        // Calcular posición según configuración
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
        
        // Dibujar fecha y hora (LÍNEA 1)
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        ctx.fillText(`📅 ${dateStr}`, x, y);
        
        // Dibujar coordenadas GPS si disponibles (LÍNEA 2)
        if (this.currentPosition) {
            const lat = this.currentPosition.lat.toFixed(6);
            const lon = this.currentPosition.lon.toFixed(6);
            const speed = (this.currentPosition.speed * 3.6 || 0).toFixed(1);
            
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText(`📍 ${lat}, ${lon} | 🚗 ${speed} km/h`, x, y + fontSize + 8);
            
            // Dibujar precisión y tiempo de grabación (LÍNEA 3)
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
            // Sin señal GPS
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText('📍 GPS: Buscando señal...', x, y + fontSize + 8);
        }
        
        ctx.restore();
    }

    drawTemporaryOverlay() {
        const overlayCanvas = this.elements.overlayCanvas;
        const overlayCtx = this.elements.overlayCtx;
        
        if (!overlayCanvas || !overlayCtx) return;
        
        // Asegurar tamaño correcto
        overlayCanvas.width = this.mainCanvas.width;
        overlayCanvas.height = this.mainCanvas.height;
        
        // Limpiar overlay
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        // Solo mostrar indicador de estado de grabación
        if (this.state.isRecording) {
            overlayCtx.fillStyle = this.state.isPaused ? 'rgba(255, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
            overlayCtx.font = 'bold 24px monospace';
            overlayCtx.textAlign = 'right';
            overlayCtx.textBaseline = 'top';
            
            const statusText = this.state.isPaused ? '⏸️ PAUSADO' : '● GRABANDO';
            overlayCtx.fillText(statusText, overlayCanvas.width - 20, 20);
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
        
        this.elements.recordBtn.querySelector('.btn-text').textContent = 'Continuar';
        this.updateStatus('⏸️ PAUSADO');
        this.showNotification('⏸️ Grabación pausada');
    }

    async resumeRecording() {
        if (!this.mediaRecorder || !this.state.isPaused) return;
        
        this.state.isPaused = false;
        this.mediaRecorder.resume();
        
        this.elements.recordBtn.querySelector('.btn-text').textContent = 'Pausar';
        this.updateStatus('● GRABANDO');
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
            
            // Actualizar UI
            this.elements.recordBtn.classList.remove('recording');
            this.elements.recordBtn.querySelector('.btn-text').textContent = 'Grabar';
            this.elements.stopBtn.disabled = true;
            
            this.updateStatus('✅ Grabación guardada');
            this.showNotification('💾 Video guardado con datos GPS incorporados');
            
            // Recargar galería
            await this.loadGallery();
            
        } catch (error) {
            console.error('❌ Error deteniendo grabación:', error);
            this.updateStatus('❌ Error: ' + error.message);
        }
    }

    startNewSegment() {
        if (!this.mediaRecorder || this.state.isPaused) return;
        
        // Finalizar segmento actual
        this.mediaRecorder.stop();
        
        // Iniciar nuevo segmento
        setTimeout(() => {
            if (this.state.isRecording && !this.state.isPaused) {
                this.mediaRecorder.start(1000);
                
                // Reprogramar siguiente segmento
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

    // ============ CONTROL DE GRABACIÓN ============

    toggleRecording() {
        if (this.state.isRecording) {
            if (this.state.isPaused) {
                this.resumeRecording();
            } else {
                this.pauseRecording();
            }
        } else {
            this.startRecording();
        }
    }

    // ============ GUARDADO DE DATOS ============

    async saveVideoSegment() {
        if (this.recordedChunks.length === 0) return;
        
        try {
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const duration = Date.now() - this.state.startTime;
            
            // Metadatos extensos
            const metadata = {
                title: `Dashcam ${new Date(this.state.startTime).toLocaleString()}`,
                description: 'Grabación con datos GPS incorporados en el video',
                creationTime: new Date(this.state.startTime).toISOString(),
                duration: duration,
                gpsPoints: this.gpxPoints.length,
                settings: { ...this.state.settings },
                trackSummary: this.gpxPoints.length > 0 ? {
                    startTime: new Date(this.gpxPoints[0].timestamp).toISOString(),
                    endTime: new Date(this.gpxPoints[this.gpxPoints.length - 1].timestamp).toISOString(),
                    points: this.gpxPoints.length,
                    bounds: {
                        minLat: Math.min(...this.gpxPoints.map(p => p.lat)),
                        maxLat: Math.max(...this.gpxPoints.map(p => p.lat)),
                        minLon: Math.min(...this.gpxPoints.map(p => p.lon)),
                        maxLon: Math.max(...this.gpxPoints.map(p => p.lon))
                    }
                } : null
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
            
            // Guardar en IndexedDB
            await this.saveToDatabase('videos', videoData);
            
            // Actualizar almacenamiento
            this.state.totalSize += Math.round(blob.size / (1024 * 1024));
            
            // Limpiar
            this.recordedChunks = [];
            
            console.log('💾 Vídeo guardado con metadatos:', videoData);
            
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
            
            console.log('📍 GPX guardado:', gpxData);
            
            // Limpiar puntos
            this.gpxPoints = [];
            this.lastGPXPoint = null;
            
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
                this.elements.coordinates.textContent = 
                    `${this.currentPosition.lat.toFixed(6)}, ${this.currentPosition.lon.toFixed(6)}`;
                
                const speedKmh = (this.currentPosition.speed * 3.6).toFixed(1);
                this.elements.currentSpeed.textContent = `${speedKmh} km/h`;
                
            },
            (error) => this.onGPSError(error),
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 5000
            }
        );
        
        // Intervalo para puntos GPX
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
        this.state.gpsTrack.push(pointData);
        
        this.lastGPXPoint = {
            timestamp: position.timestamp,
            coords: position.coords
        };
    }

    onGPSError(error) {
        console.warn('⚠️ GPS Error:', error);
        this.updateGPSStatus('❌ Error');
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
        if (this.state.isRecording && !this.state.isPaused) {
            this.state.currentTime = Date.now() - this.state.startTime;
            
            // Actualizar tiempo
            this.elements.recordingTime.textContent = this.formatTime(this.state.currentTime);
            
            // Actualizar tamaño estimado
            const bitrate = 2500000; // 2.5 Mbps
            const sizeMB = (bitrate * this.state.currentTime / 1000 / 8 / 1024 / 1024).toFixed(2);
            this.elements.fileSize.textContent = `${sizeMB} MB`;
        }
        
        // Actualizar almacenamiento periódicamente
        if (Date.now() % 10000 < 1000) {
            this.monitorStorage();
        }
    }

    updateStatus(message) {
        this.elements.status.textContent = message;
    }

    updateGPSStatus(status) {
        this.elements.gpsStatus.textContent = `📍 GPS: ${status}`;
    }

    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }

    // ============ MONITOREO ============

    startMonitoring() {
        // Iniciar GPS
        this.startGPS();
        
        // Monitorear batería
        this.monitorBattery();
        
        // Monitorear almacenamiento
        this.monitorStorage();
        
        // Actualizar interfaz
        this.updateInterval = setInterval(() => this.updateUI(), 1000);
    }

    async monitorStorage() {
        if (!navigator.storage || !navigator.storage.estimate) return;
        
        try {
            const estimate = await navigator.storage.estimate();
            const usedMB = Math.round(estimate.usage / (1024 * 1024));
            const quotaMB = Math.round(estimate.quota / (1024 * 1024));
            const percentage = Math.round((usedMB / quotaMB) * 100);
            
            this.elements.storageStatus.textContent = `💾 ${usedMB} MB / ${quotaMB} MB`;
            
            this.state.totalSize = usedMB;
            
            // Limpiar si es necesario
            if (percentage > 80) {
                await this.cleanupOldFiles();
            }
            
        } catch (error) {
            console.warn('⚠️ Error almacenamiento:', error);
        }
    }

    async monitorBattery() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                
                const updateBattery = () => {
                    const level = Math.round(battery.level * 100);
                    const charging = battery.charging;
                    
                    this.elements.batteryStatus.textContent = `🔋 ${level}%${charging ? ' ⚡' : ''}`;
                };
                
                battery.addEventListener('levelchange', updateBattery);
                battery.addEventListener('chargingchange', updateBattery);
                updateBattery();
                
            } catch (error) {
                console.warn('⚠️ Batería no disponible:', error);
            }
        }
    }

    async cleanupOldFiles() {
        const maxSize = 500 * 1024 * 1024; // 500 MB máximo
        
        try {
            const videos = await this.getAllFromStore('videos');
            let totalSize = videos.reduce((sum, video) => sum + video.size, 0);
            
            // Ordenar por fecha (más antiguos primero)
            videos.sort((a, b) => a.timestamp - b.timestamp);
            
            // Eliminar videos antiguos hasta estar bajo el límite
            for (const video of videos) {
                if (totalSize <= maxSize * 0.8) break;
                
                await this.deleteFromStore('videos', video.id);
                totalSize -= video.size;
            }
            
        } catch (error) {
            console.error('❌ Error limpiando:', error);
        }
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
        // Botones principales
        this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        this.elements.galleryBtn.addEventListener('click', () => this.showGallery());
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        
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
        this.elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Búsqueda
        this.elements.searchVideos.addEventListener('input', (e) => this.searchVideos(e.target.value));
        this.elements.searchGPX.addEventListener('input', (e) => this.searchGPX(e.target.value));
        
        // Manejar cierre
        window.addEventListener('beforeunload', (e) => {
            if (this.state.isRecording) {
                e.preventDefault();
                e.returnValue = '¿Salir? Se perderá la grabación en curso.';
            }
        });

        // Eventos para tabs
        if (this.elements.tabVideos) {
            this.elements.tabVideos.addEventListener('click', () => {
                console.log('Click en tab Vídeos');
                this.switchTab('videos');
            });
        }
        
        if (this.elements.tabGPX) {
            this.elements.tabGPX.addEventListener('click', () => {
                console.log('Click en tab GPX');
                this.switchTab('gpx');
            });
        }
    }

    // ============ CONTROL DE GRABACIÓN ============

    toggleRecording() {
        if (this.state.isRecording) {
            if (this.state.isPaused) {
                this.resumeRecording();
            } else {
                this.pauseRecording();
            }
        } else {
            this.startRecording();
        }
    }

    // ============ GALERÍA ============

        showGallery() {
            console.log('Mostrando galería, tab actual:', this.state.activeTab);
            
            // Mostrar panel
            this.elements.galleryPanel.classList.remove('hidden');
            
            // Forzar recálculo de layout para iOS
            setTimeout(() => {
                // Cargar datos según tab activo
                if (this.state.activeTab === 'videos') {
                    this.loadVideos();
                } else {
                    this.loadGPXTracks();
                }
                
                // Aplicar tab correcto
                this.switchTab(this.state.activeTab);
                
                // Forzar redibujado para iOS
                this.elements.galleryPanel.style.display = 'flex';
                setTimeout(() => {
                    this.elements.galleryPanel.style.display = '';
                }, 50);
            }, 100);
        }

        hideGallery() {
            const galleryPanel = document.getElementById('galleryPanel');
            if (galleryPanel) {
                galleryPanel.classList.add('hidden');
            }
            
            // Limpiar selecciones
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
    
    // AÑADE 'video-file' class para diferenciar
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
        
        // Eventos para los vídeos
        container.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.play-btn') && !e.target.type === 'checkbox') {
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
            <div class="file-item ${this.state.selectedGPX.has(track.id) ? 'selected' : ''}" 
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
        
        // Eventos para GPX
        container.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.view-btn') && !e.target.type === 'checkbox') {
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
            
            // Intentar reproducción automática
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
        this.elements.segmentDuration.value = this.state.settings.segmentDuration;
        this.elements.videoQuality.value = this.state.settings.videoQuality;
        this.elements.gpxInterval.value = this.state.settings.gpxInterval;
        this.elements.overlayEnabled.checked = this.state.settings.overlayEnabled;
        this.elements.audioEnabled.checked = this.state.settings.audioEnabled;
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

    // ============ TABS Y BÚSQUEDA ============

    switchTab(tabName) {
        this.elements.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        this.elements.videosTab.classList.toggle('active', tabName === 'videos');
        this.elements.gpxTab.classList.toggle('active', tabName === 'gpx');
    }

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
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('✅ Service Worker registrado'))
            .catch(error => console.log('❌ Service Worker:', error));
    }
    
    window.dashcamApp = new DashcamApp();
});

