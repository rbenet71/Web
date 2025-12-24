class DashcamApp {
    constructor() {
        // Estado de la aplicación
        this.state = {
            isRecording: false,
            isPaused: false,
            currentSegment: null,
            segments: [],
            gpsTrack: [],
            startTime: null,
            currentTime: 0,
            totalSize: 0,
            settings: {
                segmentDuration: 5, // minutos
                videoQuality: 'medium',
                maxStorage: 5, // GB
                overlayEnabled: true,
                audioEnabled: true,
                autoStart: true
            }
        };

        // Referencias a elementos DOM
        this.elements = {
            videoPreview: document.getElementById('videoPreview'),
            overlayCanvas: document.getElementById('overlayCanvas'),
            overlayCtx: null,
            recordBtn: document.getElementById('recordBtn'),
            stopBtn: document.getElementById('stopBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsPanel: document.getElementById('settingsPanel'),
            filesPanel: document.getElementById('filesPanel'),
            status: document.getElementById('status'),
            gpsStatus: document.getElementById('gpsStatus'),
            storageStatus: document.getElementById('storageStatus'),
            batteryStatus: document.getElementById('batteryStatus'),
            recordingTime: document.getElementById('recordingTime'),
            fileSize: document.getElementById('fileSize'),
            currentSpeed: document.getElementById('currentSpeed'),
            coordinates: document.getElementById('coordinates')
        };

        // Variables de control
        this.mediaRecorder = null;
        this.mediaStream = null;
        this.gpsWatchId = null;
        this.currentPosition = null;
        this.recordedChunks = [];
        this.segmentTimer = null;
        this.updateInterval = null;
        this.db = null;
        this.batteryManager = null;

        // Inicialización
        this.init();
    }

    async init() {
        console.log('Inicializando Dashcam PWA...');
        
        // Inicializar canvas
        this.elements.overlayCtx = this.elements.overlayCanvas.getContext('2d');
        
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
        
        // Iniciar automáticamente si está configurado
        if (this.state.settings.autoStart) {
            setTimeout(() => this.startRecording(), 1000);
        }
        
        this.showNotification('Dashcam lista para usar');
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('DashcamDB', 3);
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                
                if (!this.db.objectStoreNames.contains('videos')) {
                    const videoStore = this.db.createObjectStore('videos', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    videoStore.createIndex('timestamp', 'timestamp', { unique: false });
                    videoStore.createIndex('duration', 'duration', { unique: false });
                }
                
                if (!this.db.objectStoreNames.contains('gpxTracks')) {
                    const gpxStore = this.db.createObjectStore('gpxTracks', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    gpxStore.createIndex('videoId', 'videoId', { unique: false });
                }
                
                if (!this.db.objectStoreNames.contains('settings')) {
                    this.db.createObjectStore('settings', { keyPath: 'name' });
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Base de datos inicializada');
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Error inicializando base de datos:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async loadSettings() {
        if (!this.db) return;
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get('appSettings');
            
            request.onsuccess = () => {
                if (request.result) {
                    this.state.settings = { ...this.state.settings, ...request.result.value };
                    this.updateSettingsUI();
                }
                resolve();
            };
        });
    }

    async saveSettings() {
        if (!this.db) return;
        
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

    setupEventListeners() {
        // Botones de control
        this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.settingsBtn.addEventListener('click', () => this.toggleSettingsPanel());
        
        // Configuración
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettingsFromUI());
        document.getElementById('closeSettings').addEventListener('click', () => this.toggleSettingsPanel());
        
        // Manejar cierre de la app
        window.addEventListener('beforeunload', (e) => {
            if (this.state.isRecording) {
                e.preventDefault();
                e.returnValue = '¿Estás seguro de que quieres salir? La grabación se detendrá.';
            }
        });
        
        // Manejar cambios de visibilidad
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.isRecording) {
                this.showNotification('La app sigue grabando en segundo plano');
            }
        });
        
        // Redimensionar canvas cuando cambia el tamaño de la ventana
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    async requestPermissions() {
        try {
            // Permisos de cámara
            const cameraPerm = await navigator.permissions.query({ name: 'camera' });
            if (cameraPerm.state === 'prompt') {
                this.showNotification('Se necesitan permisos de cámara');
            }
            
            // Permisos de ubicación
            const locationPerm = await navigator.permissions.query({ name: 'geolocation' });
            if (locationPerm.state === 'prompt') {
                this.showNotification('Se necesitan permisos de ubicación para GPS');
            }
            
            // Permisos de almacenamiento
            if (navigator.storage && navigator.storage.persist) {
                const isPersisted = await navigator.storage.persisted();
                if (!isPersisted) {
                    const persisted = await navigator.storage.persist();
                    if (persisted) {
                        console.log('Almacenamiento persistente garantizado');
                    }
                }
            }
        } catch (error) {
            console.warn('Error con permisos:', error);
        }
    }

    async initCamera() {
        try {
            const constraints = this.getVideoConstraints();
            
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: constraints,
                audio: this.state.settings.audioEnabled
            });
            
            this.elements.videoPreview.srcObject = this.mediaStream;
            
            // Esperar a que el video esté listo
            await new Promise((resolve) => {
                this.elements.videoPreview.onloadedmetadata = resolve;
            });
            
            this.resizeCanvas();
            this.elements.recordBtn.disabled = false;
            this.updateStatus('Cámara lista');
            
        } catch (error) {
            console.error('Error inicializando cámara:', error);
            this.updateStatus('Error de cámara: ' + error.message, 'error');
        }
    }

    getVideoConstraints() {
        const qualities = {
            'low': { width: 640, height: 480, frameRate: 24 },
            'medium': { width: 1280, height: 720, frameRate: 30 },
            'high': { width: 1920, height: 1080, frameRate: 30 },
            'very-high': { width: 2560, height: 1440, frameRate: 30 }
        };
        
        const quality = qualities[this.state.settings.videoQuality] || qualities.medium;
        
        return {
            facingMode: 'environment',
            width: { ideal: quality.width },
            height: { ideal: quality.height },
            frameRate: { ideal: quality.frameRate }
        };
    }

    resizeCanvas() {
        const video = this.elements.videoPreview;
        const canvas = this.elements.overlayCanvas;
        
        if (video.videoWidth && video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        } else {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight * 0.7;
        }
    }

    startMonitoring() {
        // Monitorear GPS
        this.startGPS();
        
        // Monitorear batería
        this.monitorBattery();
        
        // Monitorear almacenamiento
        this.monitorStorage();
        
        // Actualizar interfaz cada segundo
        this.updateInterval = setInterval(() => this.updateUI(), 1000);
    }

    startGPS() {
        if (!navigator.geolocation) {
            this.updateGPSStatus('No soportado');
            return;
        }
        
        this.gpsWatchId = navigator.geolocation.watchPosition(
            (position) => this.onGPSUpdate(position),
            (error) => this.onGPSError(error),
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 5000
            }
        );
    }

    onGPSUpdate(position) {
        this.currentPosition = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            speed: position.coords.speed || 0,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            timestamp: position.timestamp
        };
        
        // Agregar al track si estamos grabando
        if (this.state.isRecording && !this.state.isPaused) {
            this.state.gpsTrack.push({ ...this.currentPosition, recordTime: Date.now() });
        }
        
        // Actualizar UI
        this.updateGPSStatus('Conectado');
        this.elements.coordinates.textContent = 
            `${this.currentPosition.lat.toFixed(6)}, ${this.currentPosition.lon.toFixed(6)}`;
        
        const speedKmh = this.currentPosition.speed ? (this.currentPosition.speed * 3.6).toFixed(1) : '0';
        this.elements.currentSpeed.textContent = `${speedKmh} km/h`;
        
        // Actualizar overlay
        this.updateOverlay();
    }

    onGPSError(error) {
        console.warn('GPS Error:', error);
        this.updateGPSStatus('Error: ' + error.message);
        this.currentPosition = null;
    }

    updateGPSStatus(status) {
        this.elements.gpsStatus.textContent = `GPS: ${status}`;
        this.elements.gpsStatus.style.color = status.includes('Conectado') ? '#4ade80' : 
                                             status.includes('Error') ? '#f87171' : '#94a3b8';
    }

    async monitorBattery() {
        if ('getBattery' in navigator || 'battery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                this.batteryManager = battery;
                
                const updateBattery = () => {
                    const level = Math.round(battery.level * 100);
                    const charging = battery.charging;
                    
                    this.elements.batteryStatus.textContent = `Batería: ${level}%${charging ? ' ⚡' : ''}`;
                    this.elements.batteryStatus.style.color = 
                        level > 50 ? '#4ade80' : 
                        level > 20 ? '#fbbf24' : '#f87171';
                };
                
                battery.addEventListener('levelchange', updateBattery);
                battery.addEventListener('chargingchange', updateBattery);
                updateBattery();
                
            } catch (error) {
                console.warn('No se pudo acceder a la batería:', error);
            }
        }
    }

    async monitorStorage() {
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                const usedMB = Math.round(estimate.usage / (1024 * 1024));
                const quotaMB = Math.round(estimate.quota / (1024 * 1024));
                const percentage = Math.round((usedMB / quotaMB) * 100);
                
                this.elements.storageStatus.textContent = 
                    `Almacenamiento: ${usedMB}MB / ${quotaMB}MB (${percentage}%)`;
                
                this.state.totalSize = usedMB;
                
                // Limpiar espacio si estamos cerca del límite
                if (percentage > 80) {
                    await this.cleanupOldFiles();
                }
                
            } catch (error) {
                console.warn('Error monitoreando almacenamiento:', error);
            }
        }
    }

    async toggleRecording() {
        if (this.state.isRecording) {
            await this.pauseRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        if (!this.mediaStream) {
            this.showNotification('Error: No hay acceso a la cámara');
            return;
        }
        
        try {
            this.state.isRecording = true;
            this.state.isPaused = false;
            this.state.startTime = Date.now();
            this.state.gpsTrack = [];
            this.state.currentTime = 0;
            
            // Configurar MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
                ? 'video/webm;codecs=vp9,opus'
                : 'video/webm';
            
            const options = {
                mimeType: mimeType,
                videoBitsPerSecond: this.getVideoBitrate()
            };
            
            this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
            this.recordedChunks = [];
            
            // Configurar eventos
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.saveVideoSegment();
            };
            
            // Iniciar grabación
            this.mediaRecorder.start(1000); // Emitir datos cada segundo
            
            // Iniciar temporizador para segmentos
            const segmentMs = this.state.settings.segmentDuration * 60 * 1000;
            this.segmentTimer = setTimeout(() => {
                this.startNewSegment();
            }, segmentMs);
            
            // Actualizar UI
            this.elements.recordBtn.classList.add('recording');
            this.elements.recordBtn.querySelector('.btn-text').textContent = 'Pausar';
            this.elements.recordBtn.querySelector('.btn-icon').textContent = '⏸️';
            this.elements.stopBtn.disabled = false;
            this.elements.pauseBtn.disabled = false;
            
            this.updateStatus('Grabando...');
            this.showNotification('Grabación iniciada');
            
        } catch (error) {
            console.error('Error iniciando grabación:', error);
            this.state.isRecording = false;
            this.updateStatus('Error: ' + error.message, 'error');
        }
    }

    getVideoBitrate() {
        const bitrates = {
            'low': 1000000,     // 1 Mbps
            'medium': 2500000,  // 2.5 Mbps
            'high': 5000000,    // 5 Mbps
            'very-high': 8000000 // 8 Mbps
        };
        return bitrates[this.state.settings.videoQuality] || 2500000;
    }

    async pauseRecording() {
        if (!this.mediaRecorder || this.state.isPaused) return;
        
        this.state.isPaused = true;
        this.mediaRecorder.pause();
        
        this.elements.recordBtn.querySelector('.btn-text').textContent = 'Reanudar';
        this.elements.recordBtn.querySelector('.btn-icon').textContent = '▶️';
        
        this.updateStatus('Pausado');
        this.showNotification('Grabación pausada');
    }

    async resumeRecording() {
        if (!this.mediaRecorder || !this.state.isPaused) return;
        
        this.state.isPaused = false;
        this.mediaRecorder.resume();
        
        this.elements.recordBtn.querySelector('.btn-text').textContent = 'Pausar';
        this.elements.recordBtn.querySelector('.btn-icon').textContent = '⏸️';
        
        this.updateStatus('Grabando...');
        this.showNotification('Grabación reanudada');
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
            
            // Detener stream
            this.mediaStream.getTracks().forEach(track => track.stop());
            
            // Guardar último segmento si hay datos
            if (this.recordedChunks.length > 0) {
                await this.saveVideoSegment();
            }
            
            // Generar y guardar archivo GPX
            if (this.state.gpsTrack.length > 0) {
                await this.saveGPXTrack();
            }
            
            // Resetear estado
            this.state.isRecording = false;
            this.state.isPaused = false;
            this.state.currentSegment = null;
            
            // Actualizar UI
            this.elements.recordBtn.classList.remove('recording');
            this.elements.recordBtn.querySelector('.btn-text').textContent = 'Iniciar Grabación';
            this.elements.recordBtn.querySelector('.btn-icon').textContent = '⏺️';
            this.elements.stopBtn.disabled = true;
            this.elements.pauseBtn.disabled = true;
            
            this.updateStatus('Grabación finalizada');
            this.showNotification('Grabación guardada');
            
            // Reiniciar cámara
            await this.initCamera();
            
        } catch (error) {
            console.error('Error deteniendo grabación:', error);
            this.updateStatus('Error: ' + error.message, 'error');
        }
    }

    startNewSegment() {
        if (!this.mediaRecorder || this.state.isPaused) return;
        
        // Finalizar segmento actual
        this.mediaRecorder.stop();
        
        // Iniciar nuevo segmento inmediatamente
        setTimeout(() => {
            if (this.state.isRecording && !this.state.isPaused) {
                this.mediaRecorder.start(1000);
                
                // Reprogramar siguiente segmento
                const segmentMs = this.state.settings.segmentDuration * 60 * 1000;
                this.segmentTimer = setTimeout(() => {
                    this.startNewSegment();
                }, segmentMs);
                
                this.showNotification(`Nuevo segmento iniciado (${this.state.settings.segmentDuration} min)`);
            }
        }, 100);
    }

    async saveVideoSegment() {
        if (this.recordedChunks.length === 0) return;
        
        try {
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const duration = Date.now() - this.state.startTime;
            
            const videoData = {
                id: Date.now(),
                blob: blob,
                timestamp: this.state.startTime,
                duration: duration,
                size: blob.size,
                gpsPoints: this.state.gpsTrack.length,
                settings: { ...this.state.settings }
            };
            
            // Guardar en IndexedDB
            await this.saveToDatabase('videos', videoData);
            
            // Actualizar almacenamiento
            this.state.totalSize += Math.round(blob.size / (1024 * 1024));
            
            // Limpiar chunks
            this.recordedChunks = [];
            
            console.log('Segmento guardado:', videoData);
            
        } catch (error) {
            console.error('Error guardando segmento:', error);
        }
    }

    async saveGPXTrack() {
        if (this.state.gpsTrack.length === 0) return;
        
        try {
            const gpxContent = this.generateGPX(this.state.gpsTrack);
            const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
            
            const gpxData = {
                id: Date.now(),
                blob: blob,
                timestamp: this.state.startTime,
                points: this.state.gpsTrack.length,
                videoId: this.state.currentSegment
            };
            
            await this.saveToDatabase('gpxTracks', gpxData);
            
        } catch (error) {
            console.error('Error guardando GPX:', error);
        }
    }

    generateGPX(trackPoints) {
        let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Dashcam PWA" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Dashcam Recording ${new Date().toLocaleString()}</name>
    <trkseg>`;
    
        trackPoints.forEach(point => {
            gpx += `
      <trkpt lat="${point.lat}" lon="${point.lon}">
        <ele>${point.altitude || 0}</ele>
        <time>${new Date(point.timestamp).toISOString()}</time>
        <speed>${point.speed || 0}</speed>
        <course>${point.heading || 0}</course>
      </trkpt>`;
        });
        
        gpx += `
    </trkseg>
  </trk>
</gpx>`;
        
        return gpx;
    }

    async saveToDatabase(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    updateOverlay() {
        if (!this.state.settings.overlayEnabled || !this.elements.overlayCtx) return;
        
        const ctx = this.elements.overlayCtx;
        const canvas = this.elements.overlayCanvas;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar información
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        const dateStr = now.toLocaleDateString();
        
        // Fondo semitransparente para texto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 400, 90);
        
        // Texto
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`${dateStr} ${timeStr}`, 20, 40);
        
        // Coordenadas GPS
        if (this.currentPosition) {
            ctx.font = '18px monospace';
            ctx.fillText(
                `GPS: ${this.currentPosition.lat.toFixed(6)}, ${this.currentPosition.lon.toFixed(6)}`, 
                20, 70
            );
            
            // Velocidad
            const speedKmh = this.currentPosition.speed ? (this.currentPosition.speed * 3.6).toFixed(1) : '0';
            ctx.fillText(`Velocidad: ${speedKmh} km/h`, 20, 95);
        }
        
        // Estado de grabación
        if (this.state.isRecording) {
            ctx.fillStyle = this.state.isPaused ? 'yellow' : 'red';
            ctx.font = 'bold 28px monospace';
            ctx.fillText(this.state.isPaused ? '⏸️ PAUSADO' : '● GRABANDO', canvas.width - 200, 40);
            
            // Tiempo de grabación
            const time = this.formatTime(this.state.currentTime);
            ctx.fillStyle = 'white';
            ctx.font = '20px monospace';
            ctx.fillText(`Tiempo: ${time}`, canvas.width - 200, 70);
        }
    }

    updateUI() {
        if (this.state.isRecording && !this.state.isPaused) {
            this.state.currentTime = Date.now() - this.state.startTime;
            
            // Actualizar tiempo
            this.elements.recordingTime.textContent = this.formatTime(this.state.currentTime);
            
            // Actualizar tamaño estimado
            const bitrate = this.getVideoBitrate();
            const sizeMB = (bitrate * this.state.currentTime / 1000 / 8 / 1024 / 1024).toFixed(2);
            this.elements.fileSize.textContent = `${sizeMB} MB`;
            
            // Actualizar overlay
            this.updateOverlay();
        }
        
        // Actualizar almacenamiento periódicamente
        if (Date.now() % 10000 < 1000) { // Cada 10 segundos
            this.monitorStorage();
        }
    }

    formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateStatus(message, type = 'info') {
        this.elements.status.textContent = message;
        this.elements.status.style.color = 
            type === 'error' ? '#f87171' : 
            type === 'warning' ? '#fbbf24' : '#60a5fa';
    }

    toggleSettingsPanel() {
        this.elements.settingsPanel.classList.toggle('hidden');
    }

    updateSettingsUI() {
        document.getElementById('segmentDuration').value = this.state.settings.segmentDuration;
        document.getElementById('videoQuality').value = this.state.settings.videoQuality;
        document.getElementById('maxStorage').value = this.state.settings.maxStorage;
        document.getElementById('overlayEnabled').checked = this.state.settings.overlayEnabled;
        document.getElementById('audioEnabled').checked = this.state.settings.audioEnabled;
        document.getElementById('autoStart').checked = this.state.settings.autoStart;
    }

    async saveSettingsFromUI() {
        this.state.settings = {
            segmentDuration: parseInt(document.getElementById('segmentDuration').value),
            videoQuality: document.getElementById('videoQuality').value,
            maxStorage: parseInt(document.getElementById('maxStorage').value),
            overlayEnabled: document.getElementById('overlayEnabled').checked,
            audioEnabled: document.getElementById('audioEnabled').checked,
            autoStart: document.getElementById('autoStart').checked
        };
        
        await this.saveSettings();
        this.toggleSettingsPanel();
        
        // Reiniciar grabación si está activa
        if (this.state.isRecording) {
            this.showNotification('Reiniciando con nueva configuración...');
            await this.stopRecording();
            setTimeout(() => this.startRecording(), 1000);
        }
        
        this.showNotification('Configuración guardada');
    }

    async cleanupOldFiles() {
        try {
            const maxSize = this.state.settings.maxStorage * 1024 * 1024 * 1024; // GB a bytes
            
            const transaction = this.db.transaction(['videos'], 'readonly');
            const store = transaction.objectStore('videos');
            const request = store.getAll();
            
            request.onsuccess = async () => {
                const videos = request.result;
                let totalSize = videos.reduce((sum, video) => sum + video.size, 0);
                
                // Ordenar por fecha (más antiguos primero)
                videos.sort((a, b) => a.timestamp - b.timestamp);
                
                // Eliminar videos antiguos hasta estar bajo el límite
                const deletePromises = [];
                for (const video of videos) {
                    if (totalSize <= maxSize * 0.8) break; // Dejar 20% de margen
                    
                    deletePromises.push(this.deleteVideo(video.id));
                    totalSize -= video.size;
                }
                
                if (deletePromises.length > 0) {
                    await Promise.all(deletePromises);
                    this.showNotification(`${deletePromises.length} videos antiguos eliminados`);
                }
            };
            
        } catch (error) {
            console.error('Error limpiando archivos:', error);
        }
    }

    async deleteVideo(videoId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['videos'], 'readwrite');
            const store = transaction.objectStore('videos');
            const request = store.delete(videoId);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashcamApp = new DashcamApp();
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('Error registrando Service Worker:', error);
            });
    });
}