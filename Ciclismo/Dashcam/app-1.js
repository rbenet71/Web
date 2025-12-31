// Dashcam PWA v4.5.7 - Versión Completa Simplificada

const APP_VERSION = '4.5.7';

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
        this.playbackMap = null;
        this.mapTrackLayer = null;
        this.mapRouteLayer = null;
        this.startMarker = null;
        this.endMarker = null;
        this.currentPositionMarker = null;
        this.mapMarkers = [];
        this.mapTileLayers = {};
        this.isPWAInstalled = false;
        this.deferredPrompt = null; // Para el evento de instalación
        this.installButton = null; // Referencia al botón
        
        this.init();
    }

    async init() {
        console.log(`🚀 Iniciando Dashcam iPhone Pro v${APP_VERSION}`);
        console.log(`📱 Dispositivo: ${this.isIOS ? 'iPhone/iPad' : 'Otro'}`);
        console.log(`🌐 Protocolo: ${window.location.protocol}`);
        
        // 1. Verificar protocolo
        if (window.location.protocol === 'file:') {
            console.log('⚠️ Ejecutando desde file:// - Algunas funciones estarán limitadas');
            this.showNotification('⚠️ Ejecuta desde servidor local para todas las funciones', 5000);
        }
        
        // 2. Limpiar caché si es necesario
        await this.clearCacheIfNeeded();
        
        // 3. Inicializar elementos DOM
        this.initElements();
        
        // 4. Verificar instalación PWA (solo si no es file://)
        if (window.location.protocol !== 'file:') {
            this.detectPWAInstallation();
            this.setupPWAInstallListener();
        } else {
            console.log('📱 PWA deshabilitado en file:// protocol');
        }
        
        // 5. Inicializar canvas
        this.mainCanvas = document.getElementById('mainCanvas');
        if (this.mainCanvas) {
            this.mainCtx = this.mainCanvas.getContext('2d');
        }
        
        // 6. ORDEN CORRECTO DE INICIALIZACIÓN
        await this.initDatabase();
        await this.loadSettings();
        await this.loadCustomLogo();
        await this.loadGPXFiles();
        
        // 7. RESTAURAR PERMISOS PERSISTENTES
        if (this.state.settings.storageLocation === 'localFolder') {
            const restored = await this.restoreFolderHandle();
            
            if (!restored && this.state.settings.localFolderName) {
                setTimeout(() => {
                    this.showPersistentPermissionReminder();
                }, 2000);
            }
        }
        
        // 8. Configurar eventos
        this.setupEventListeners();
        
        // 9. Iniciar monitoreo básico
        this.startMonitoring();
        
        // 10. Cargar galería inicial
        await this.loadGallery();
        
        // 11. Mostrar estado de almacenamiento
        this.updateStorageStatus();
        
        // 12. Limpiar archivos locales inexistentes
        if (this.state.settings.storageLocation === 'localFolder' && this.state.settings.localFolderName) {
            setTimeout(() => {
                this.cleanupLocalFilesDatabase();
            }, 3000);
        }
        
        // 13. Solicitar persistencia de almacenamiento (solo si no es file://)
        if (window.location.protocol !== 'file:') {
            await this.requestStoragePersistence();
        }
        
        // 14. Mostrar botón de instalación PWA si está disponible
        setTimeout(() => {
            this.showInstallButton();
        }, 2000);
        
        // 15. Verificar requisitos PWA (para debugging)
        this.checkPWARequirements();
        
        // 16. Promover instalación PWA (solo si no es file://)
        if (window.location.protocol !== 'file:') {
            this.promotePWAInstallation();
        }
        
        // 17. Mostrar instrucciones de carpeta si es necesario
        if (this.state.settings.storageLocation === 'localFolder' && !this.localFolderHandle) {
            setTimeout(() => {
                this.showFolderInstructions();
            }, 5000);
        }
        
        // 18. Mostrar notificación de inicio
        this.showNotification(`Dashcam iPhone Pro v${APP_VERSION} lista`);
        console.log(`✅ Aplicación iniciada correctamente`);
        
        // 19. Mostrar badge si ya está instalado como PWA
        if (this.isPWAInstalled) {
            setTimeout(() => {
                this.showPWAInstalledBadge();
            }, 1000);
        }
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

    // ============ FUNCIONES FALTANTES ============

    // Función para detectar si está instalado como PWA
    // Detección mejorada de PWA

    detectPWAInstallation() {
        // Métodos de detección para diferentes navegadores
        const detectionMethods = [
            // Método estándar
            () => window.matchMedia('(display-mode: standalone)').matches,
            
            // iOS Safari
            () => window.navigator.standalone === true,
            
            // Android Chrome
            () => document.referrer.includes('android-app://'),
            
            // Check localStorage (backup)
            () => localStorage.getItem('pwa_installed') === 'true'
        ];
        
        // Probar cada método
        this.isPWAInstalled = false;
        
        for (const method of detectionMethods) {
            try {
                if (method()) {
                    this.isPWAInstalled = true;
                    console.log('📱 PWA detectado');
                    break;
                }
            } catch (error) {
                // Continuar con el siguiente método
                continue;
            }
        }
        
        // SOLUCIÓN: No intentar acceder a Service Worker si estamos en file://
        if (window.location.protocol !== 'file:' && 'serviceWorker' in navigator) {
            try {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    const hasActiveSW = registrations.some(reg => 
                        reg.active && reg.scope.includes(location.origin)
                    );
                    if (hasActiveSW) {
                        this.isPWAInstalled = true;
                        console.log('📱 PWA detectado por Service Worker activo');
                    }
                }).catch(error => {
                    console.log('⚠️ No se pudo verificar Service Worker:', error.message);
                });
            } catch (error) {
                console.log('⚠️ Error verificando Service Worker');
            }
        }
        
        console.log(`📱 Modo PWA: ${this.isPWAInstalled ? '✅ INSTALADO' : '❌ NO INSTALADO'}`);
        return this.isPWAInstalled;
    }

    // Escuchar el evento de instalación PWA
    setupPWAInstallListener() {
        // Solo configurar PWA si estamos en un protocolo compatible
        if (window.location.protocol === 'file:') {
            console.log('⚠️ PWA no disponible en file:// protocol');
            console.log('💡 Ejecuta desde un servidor local (http://localhost)');
            return;
        }
        
        // Escuchar el evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📲 Evento de instalación PWA disponible');
            
            // Prevenir que el navegador muestre el prompt automático
            e.preventDefault();
            
            // Guardar el evento para usarlo luego
            this.deferredPrompt = e;
            
            // Mostrar el botón de instalación
            this.showInstallButton();
        });
        
        // Escuchar cuando la app se instala
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA instalado exitosamente');
            this.isPWAInstalled = true;
            this.hideInstallButton();
            this.showNotification('✅ Aplicación instalada');
        });
    }

    // Función para mostrar instrucciones de carpeta
    showFolderInstructions() {
        if (this.state.settings.storageLocation !== 'localFolder' || this.localFolderHandle) {
            return;
        }
        
        // Verificar si ya mostramos hoy
        const lastShown = localStorage.getItem('folder_instructions_last_shown');
        const today = new Date().toDateString();
        
        if (lastShown === today) {
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>📂 Configurar Carpeta Local</h3>
                </div>
                <div class="modal-body">
                    <p>Has configurado el almacenamiento en "Carpeta Local" pero no has seleccionado una carpeta.</p>
                    
                    <div class="tip-card" style="background: rgba(0, 168, 255, 0.05); border: 1px solid rgba(0, 168, 255, 0.2); border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>💡 Recomendación:</strong></p>
                        <p style="margin: 0; font-size: 14px;">
                            Para permisos persistentes, <strong>instala la app como PWA primero</strong> y luego selecciona la carpeta.
                        </p>
                    </div>
                    
                    <p><strong>¿Qué quieres hacer?</strong></p>
                </div>
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 20px; flex-direction: column;">
                    <button id="installFirst" class="btn install-btn" style="width: 100%; background: #00b894;">
                        📲 1. Instalar como PWA primero
                    </button>
                    <button id="selectNow" class="btn save-btn" style="width: 100%;">
                        📂 2. Seleccionar carpeta ahora
                    </button>
                    <button id="dismissFolder" class="btn cancel-btn" style="width: 100%;">
                        Recordármelo más tarde
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#installFirst').addEventListener('click', () => {
            modal.remove();
            this.showPWAInstallPromotion();
        });
        
        modal.querySelector('#selectNow').addEventListener('click', async () => {
            modal.remove();
            await this.selectLocalFolder();
        });
        
        modal.querySelector('#dismissFolder').addEventListener('click', () => {
            localStorage.setItem('folder_instructions_last_shown', today);
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Mostrar el botón de instalación
    showInstallButton() {
        // Verificar si estamos en un protocolo compatible
        if (window.location.protocol === 'file:') {
            console.log('⚠️ PWA no disponible en file:// protocol');
            
            // Mostrar instrucciones para ejecutar desde servidor local
            this.showLocalServerInstructions();
            return;
        }
        
        // Verificar si ya está instalado
        if (this.isPWAInstalled) {
            this.hideInstallButton();
            return;
        }
        
        // Verificar si el navegador soporta instalación PWA
        if (!this.deferredPrompt) {
            console.log('⚠️ Este navegador no soporta instalación PWA');
            return;
        }
        
        // Mostrar el contenedor
        const container = document.getElementById('pwaInstallContainer');
        const button = document.getElementById('installPWAButton');
        
        if (container && button) {
            container.classList.remove('hidden');
            this.installButton = button;
            
            // Configurar el evento del botón
            button.addEventListener('click', () => this.installPWA());
            
            console.log('📲 Botón de instalación PWA mostrado');
        }
    }

    // Añadir función para mostrar instrucciones de servidor local
    showLocalServerInstructions() {
        const container = document.getElementById('pwaInstallContainer');
        if (!container) return;
        
        container.classList.remove('hidden');
        container.innerHTML = `
            <div class="pwa-install-info">
                <div class="info-icon">⚠️</div>
                <h4>Ejecutar desde Servidor Local</h4>
                <p>Para instalar como PWA y tener permisos persistentes:</p>
                <ol style="padding-left: 20px; margin: 10px 0;">
                    <li><strong>Usa un servidor local:</strong></li>
                    <li>En terminal: <code>python -m http.server 8080</code></li>
                    <li>Abre: <code>http://localhost:8080</code></li>
                    <li>O usa extensión "Live Server" en VS Code</li>
                </ol>
                <button id="testLocalServer" class="btn test-btn">
                    🧪 Probar con Servidor Local
                </button>
            </div>
        `;
        
        container.querySelector('#testLocalServer').addEventListener('click', () => {
            // Intentar abrir localhost
            window.open('http://localhost:8080', '_blank');
        });
    }

    // Ocultar el botón de instalación
    hideInstallButton() {
        const container = document.getElementById('pwaInstallContainer');
        if (container) {
            container.classList.add('hidden');
            console.log('📲 Botón de instalación PWA ocultado');
        }
    }

    // Función para instalar la PWA
    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('❌ No hay prompt de instalación disponible');
            this.showNotification('⚠️ Tu navegador no soporta instalación directa');
            return;
        }
        
        try {
            console.log('📲 Iniciando instalación PWA...');
            
            // Mostrar el prompt de instalación
            this.deferredPrompt.prompt();
            
            // Esperar a que el usuario responda
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`📲 Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
            
            if (outcome === 'accepted') {
                this.showNotification('✅ Aplicación instalada');
                this.isPWAInstalled = true;
                this.hideInstallButton();
                
                // Mostrar badge de instalado
                this.showPWAInstalledBadge();
            } else {
                this.showNotification('❌ Instalación cancelada');
            }
            
            // Limpiar el prompt
            this.deferredPrompt = null;
            
        } catch (error) {
            console.error('❌ Error instalando PWA:', error);
            this.showNotification('❌ Error al instalar la aplicación');
        }
    }

    // Mostrar badge de "Instalado"
    showPWAInstalledBadge() {
        // Remover badge anterior si existe
        const existingBadge = document.querySelector('.pwa-installed-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Crear nuevo badge
        const badge = document.createElement('div');
        badge.className = 'pwa-installed-badge';
        badge.innerHTML = `
            <span>✅</span>
            <span>Aplicación instalada</span>
        `;
        
        document.body.appendChild(badge);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (badge.parentNode) {
                badge.remove();
            }
        }, 5000);
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

    updateSettingsUI() {
        try {
            if (!this.elements.recordingMode) return;
            
            this.elements.recordingMode.value = this.state.settings.recordingMode;
            this.elements.segmentDuration.value = this.state.settings.segmentDuration;
            this.elements.videoQuality.value = this.state.settings.videoQuality;
            this.elements.videoFormat.value = this.state.settings.videoFormat;
            this.elements.gpxInterval.value = this.state.settings.gpxInterval;
            this.elements.overlayEnabled.checked = this.state.settings.overlayEnabled;
            this.elements.audioEnabled.checked = this.state.settings.audioEnabled;
            this.elements.reverseGeocodeEnabled.checked = this.state.settings.reverseGeocodeEnabled;
            
            this.elements.showWatermark.checked = this.state.settings.showWatermark;
            this.elements.logoPosition.value = this.state.settings.logoPosition;
            this.elements.logoSize.value = this.state.settings.logoSize;
            this.elements.textPosition.value = this.state.settings.textPosition;
            this.elements.watermarkOpacity.value = this.state.settings.watermarkOpacity;
            
            if (this.elements.opacityValue) {
                this.elements.opacityValue.textContent = `${Math.round(this.state.settings.watermarkOpacity * 100)}%`;
            }
            
            this.elements.gpxOverlayEnabled.checked = this.state.settings.gpxOverlayEnabled;
            this.elements.showGpxDistance.checked = this.state.settings.showGpxDistance;
            this.elements.showGpxSpeed.checked = this.state.settings.showGpxSpeed;
            
            this.elements.embedGpsMetadata.checked = this.state.settings.embedGpsMetadata;
            this.elements.metadataFrequency.value = this.state.settings.metadataFrequency;
            
            this.elements.storageLocation.value = this.state.settings.storageLocation;
            this.elements.keepAppCopy.checked = this.state.settings.keepAppCopy;
            
            if (this.elements.currentLocalFolderInfo && this.state.settings.localFolderName) {
                this.elements.currentLocalFolderInfo.innerHTML = 
                    `<span>📁 ${this.state.settings.localFolderName}</span>`;
            }
            
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

    async initDatabase() {
        return new Promise((resolve) => {
            console.log('📊 Inicializando base de datos...');
            
            // Aumentar la versión para forzar recreación de stores
            const request = indexedDB.open('DashcamDB_Pro', 13); // <-- Cambiar de 12 a 13
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                this.createDatabaseStores();
                console.log('🔄 Actualizando base de datos a versión 13');
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
            { name: 'geocodeCache', keyPath: 'key' },
            { name: 'folderHandles', keyPath: 'id' } // <-- AÑADIR ESTA LÍNEA
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
                this.isSaving = false;
                return;
            }
            
            const originalBlob = new Blob(this.recordedChunks, { 
                type: this.mediaRecorder?.mimeType || 'video/webm' 
            });
            
            if (originalBlob.size < 1024) {
                console.error('❌ Blob demasiado pequeño');
                this.isSaving = false;
                return;
            }
            
            const duration = this.state.currentTime || 10000;
            const timestamp = this.state.startTime || Date.now();
            const segmentNum = this.state.currentSegment;
            
            console.log(`💾 Guardando segmento ${segmentNum}:`, {
                size: originalBlob.size,
                duration: duration,
                gpsPoints: this.gpxPoints.length,
                format: this.state.settings.videoFormat
            });
            
            // Crear sesión si es el primer segmento
            if (this.state.recordingSessionSegments === 0 && !this.state.recordingSessionName) {
                await this.createSessionFolder();
            }
            
            // Asegurar que tenemos datos GPS
            let gpsData = this.gpxPoints;
            if (gpsData.length === 0 && this.currentPosition) {
                // Si no hay puntos GPS pero tenemos posición actual, crear un punto
                gpsData = [this.formatPosition({ 
                    coords: {
                        latitude: this.currentPosition.lat,
                        longitude: this.currentPosition.lon,
                        speed: this.currentPosition.speed,
                        altitude: this.currentPosition.altitude,
                        accuracy: this.currentPosition.accuracy
                    },
                    timestamp: Date.now()
                })];
                console.log('📍 Usando posición actual como único punto GPS');
            }
            
            // Convertir a MP4 con metadatos
            let finalBlob = originalBlob;
            let finalFormat = this.state.settings.videoFormat;
            
            if (this.state.settings.embedGpsMetadata && gpsData.length > 0) {
                try {
                    console.log(`📍 Agregando ${gpsData.length} puntos GPS al video...`);
                    
                    // Si el formato es webm, convertir a mp4 primero
                    if (this.state.settings.videoFormat === 'mp4' || 
                        this.state.settings.videoFormat === 'mp4' || 
                        originalBlob.type.includes('mp4')) {
                        
                        finalBlob = await this.addGpsMetadataToMP4(originalBlob, gpsData);
                        finalFormat = 'mp4';
                        console.log('✅ Metadatos GPS agregados a MP4');
                        
                    } else {
                        // Para webm, agregar metadatos al final
                        finalBlob = await this.addMetadataToWebM(originalBlob, gpsData);
                        finalFormat = 'webm';
                        console.log('✅ Metadatos GPS agregados a WebM');
                    }
                } catch (error) {
                    console.warn('⚠️ Error agregando metadatos GPS:', error);
                    finalBlob = originalBlob;
                    finalFormat = this.state.settings.videoFormat;
                }
            } else {
                console.log('ℹ️ No se agregarán metadatos GPS (configuración desactivada o sin datos)');
            }
            
            const filename = `segmento_${segmentNum}.${finalFormat}`;
            this.state.recordingSessionSegments++;
            
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
                    savedSuccess = await this.saveToApp(finalBlob, timestamp, duration, finalFormat, segmentNum, gpsData);
                    savedPath = `${this.state.recordingSessionName}/${filename}`;
                } else {
                    savedSuccess = await this.saveToApp(finalBlob, timestamp, duration, finalFormat, segmentNum, gpsData);
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
                    location: this.state.settings.storageLocation === 'localFolder' ? 'desktop_folder' : 'app',
                    gpsPoints: gpsData.length,
                    gpsTrack: gpsData
                });
                
                this.showNotification(`✅ Segmento ${segmentNum} guardado (${gpsData.length} puntos GPS)`);
                
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
            this.hideSavingStatus();
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
        console.log('📍 Agregando metadatos GPS al video MP4...');
        
        return new Promise((resolve) => {
            try {
                if (!gpsPoints || gpsPoints.length === 0) {
                    console.log('⚠️ No hay puntos GPS para agregar');
                    resolve(mp4Blob);
                    return;
                }
                
                // Preparar metadatos GPS
                const metadata = {
                    gpsVersion: "1.0",
                    appVersion: APP_VERSION,
                    created: new Date().toISOString(),
                    gpsPoints: gpsPoints.length,
                    startTime: gpsPoints[0]?.timestamp || Date.now(),
                    endTime: gpsPoints[gpsPoints.length-1]?.timestamp || Date.now(),
                    totalDistance: 0, // Podrías calcular esto si quieres
                    track: gpsPoints.map(p => ({
                        lat: p.lat || p.latitude || 0,
                        lon: p.lon || p.longitude || 0,
                        ele: p.ele || p.altitude || 0,
                        speed: p.speed || 0,
                        heading: p.heading || 0,
                        accuracy: p.accuracy || 0,
                        time: p.timestamp || Date.now(),
                        recordTime: p.recordTime || Date.now()
                    }))
                };
                
                // Calcular distancia total si hay más de un punto
                if (gpsPoints.length > 1) {
                    let totalDistance = 0;
                    for (let i = 1; i < gpsPoints.length; i++) {
                        const p1 = gpsPoints[i-1];
                        const p2 = gpsPoints[i];
                        const distance = this.calculateDistance(
                            p1.lat || p1.latitude,
                            p1.lon || p1.longitude,
                            p2.lat || p2.latitude,
                            p2.lon || p2.longitude
                        );
                        totalDistance += distance;
                    }
                    metadata.totalDistance = totalDistance;
                }
                
                const metadataStr = JSON.stringify(metadata, null, 2);
                console.log(`📝 Metadatos GPS preparados (${metadataStr.length} bytes):`, {
                    points: gpsPoints.length,
                    distance: metadata.totalDistance?.toFixed(2) + ' km'
                });
                
                // Crear un nuevo blob con los metadatos al final
                const metadataEncoder = new TextEncoder();
                const metadataArray = metadataEncoder.encode(metadataStr);
                
                // Agregar marcador para identificar metadatos
                const marker = new TextEncoder().encode("GPXMETADATA:");
                
                // Combinar video + marcador + metadatos
                const combinedParts = [
                    mp4Blob,
                    marker,
                    metadataArray
                ];
                
                const combinedBlob = new Blob(combinedParts, { 
                    type: 'video/mp4' 
                });
                
                console.log(`✅ Metadatos GPS agregados: ${gpsPoints.length} puntos, ${Math.round(combinedBlob.size / 1024 / 1024)} MB`);
                resolve(combinedBlob);
                
            } catch (error) {
                console.warn('⚠️ Error agregando metadatos GPS:', error);
                resolve(mp4Blob);
            }
        });
    }
    async saveToApp(blob, timestamp, duration, format, segmentNum = 1, gpsData = []) {
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
                filename: `segmento_${segmentNum}.${format}`,
                gpsPoints: gpsData.length,
                gpsTrack: gpsData,
                format: format,
                location: 'app',
                hasMetadata: this.state.settings.embedGpsMetadata && gpsData.length > 0,
                segment: segmentNum,
                session: this.state.recordingSessionName
            };
            
            console.log('📱 Guardando video en app con datos:', {
                id: videoData.id,
                title: videoData.title,
                gpsPoints: videoData.gpsPoints,
                size: Math.round(videoData.size / 1024 / 1024) + ' MB'
            });
            
            if (this.db) {
                await this.saveToDatabase('videos', videoData);
                console.log('📱 Video guardado en app con metadatos GPS');
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

    async addMetadataToWebM(webmBlob, gpsPoints) {
        console.log('📍 Agregando metadatos GPS al video WebM...');
        
        return new Promise((resolve) => {
            try {
                if (!gpsPoints || gpsPoints.length === 0) {
                    resolve(webmBlob);
                    return;
                }
                
                const metadata = {
                    gpsPoints: gpsPoints.length,
                    track: gpsPoints
                };
                
                const metadataStr = JSON.stringify(metadata);
                const metadataEncoder = new TextEncoder();
                const metadataArray = metadataEncoder.encode(metadataStr);
                
                // Agregar marcador para WebM
                const marker = new TextEncoder().encode("WEBM_METADATA:");
                
                const combinedBlob = new Blob([webmBlob, marker, metadataArray], { 
                    type: 'video/webm' 
                });
                
                console.log(`✅ Metadatos GPS agregados a WebM: ${gpsPoints.length} puntos`);
                resolve(combinedBlob);
                
            } catch (error) {
                console.warn('⚠️ Error agregando metadatos a WebM:', error);
                resolve(webmBlob);
            }
        });
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
        console.log('📂 Seleccionando carpeta con permisos persistentes...');
        
        if (this.isIOS) {
            await this.showIOSFolderPicker();
        } else {
            await this.showDesktopFolderPickerWithPersistence();
        }
    }

    async showDesktopFolderPickerWithPersistence() {
        try {
            // Opciones para permisos persistentes
            const options = {
                id: 'dashcam-local-folder',
                mode: 'readwrite',
                startIn: 'documents' // Sugerir carpeta Documents
            };
            
            // Intentar restaurar handle guardado con permisos persistentes
            if (this.state.settings.localFolderHandle) {
                try {
                    console.log('🔄 Intentando restaurar carpeta guardada...');
                    
                    // Verificar si todavía tenemos permiso
                    const permission = await this.state.settings.localFolderHandle.queryPermission(options);
                    
                    if (permission === 'granted') {
                        // Ya tenemos permiso, usar el handle existente
                        this.localFolderHandle = this.state.settings.localFolderHandle;
                        this.updateFolderUI();
                        this.showNotification(`✅ Carpeta restaurada: ${this.localFolderHandle.name}`);
                        return;
                    } else if (permission === 'prompt') {
                        // Pedir permiso nuevamente
                        const newPermission = await this.state.settings.localFolderHandle.requestPermission(options);
                        if (newPermission === 'granted') {
                            this.localFolderHandle = this.state.settings.localFolderHandle;
                            this.updateFolderUI();
                            this.showNotification(`✅ Permiso reconfirmado: ${this.localFolderHandle.name}`);
                            return;
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Error restaurando carpeta:', error);
                }
            }
            
            // Si no hay handle o no tenemos permiso, pedir nueva carpeta
            console.log('📤 Abriendo selector de carpeta...');
            const handle = await window.showDirectoryPicker(options);
            
            if (handle) {
                // Pedir permiso persistente
                const permission = await handle.requestPermission(options);
                
                if (permission === 'granted') {
                    this.localFolderHandle = handle;
                    this.state.settings.localFolderHandle = handle;
                    this.state.settings.localFolderName = handle.name;
                    
                    // Guardar el handle serializado para persistencia
                    await this.saveFolderHandle(handle);
                    
                    this.updateFolderUI();
                    await this.saveSettings();
                    
                    this.showNotification(`✅📂 Carpeta seleccionada (persistente): ${handle.name}`);
                    
                    // Verificar si podemos hacerlo persistente
                    if ('storage' in navigator && navigator.storage.persist) {
                        const persisted = await navigator.storage.persist();
                        console.log('💾 Persistencia de almacenamiento:', persisted ? '✅ Concedida' : '❌ No concedida');
                    }
                } else {
                    this.showNotification('❌ Permiso denegado');
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Error seleccionando carpeta:', error);
            if (error.name !== 'AbortError') {
                this.showNotification('❌ Error seleccionando carpeta');
            }
        }
    }

    async requestStoragePersistence() {
        try {
            // Verificar si la API está disponible
            if ('storage' in navigator && navigator.storage && navigator.storage.persist) {
                const isPersisted = await navigator.storage.persisted();
                console.log(`💾 Persistencia actual: ${isPersisted ? '✅ ACTIVADA' : '❌ NO ACTIVADA'}`);
                
                if (!isPersisted) {
                    // Solicitar persistencia
                    const persisted = await navigator.storage.persist();
                    
                    if (persisted) {
                        console.log('✅ Persistencia de almacenamiento concedida');
                        this.showNotification('💾 Almacenamiento persistente activado');
                    } else {
                        console.log('⚠️ Persistencia de almacenamiento no concedida');
                        this.showNotification('ℹ️ Para mejor experiencia, permite almacenamiento persistente');
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Error solicitando persistencia:', error);
        }
    }

    showPersistentPermissionReminder() {
        if (this.state.settings.storageLocation !== 'localFolder' || !this.state.settings.localFolderName) {
            return;
        }
        
        // Verificar si ya mostramos el recordatorio hoy
        const lastReminder = localStorage.getItem('dashcam_folder_reminder');
        const today = new Date().toDateString();
        
        if (lastReminder === today) {
            return; // Ya mostramos hoy
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'permissionReminderModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>🔐 Permisos Persistentes</h3>
                    <button class="close-btn" onclick="document.getElementById('permissionReminderModal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <p><strong>Para acceso persistente a tu carpeta local:</strong></p>
                    
                    <div class="tip-card" style="background: rgba(0, 168, 255, 0.05); border: 1px solid rgba(0, 168, 255, 0.2); border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>💡 Consejo profesional:</strong></p>
                        <ol style="margin: 0; padding-left: 20px;">
                            <li><strong>Instala la app como PWA</strong> (Añadir a pantalla de inicio)</li>
                            <li><strong>Usa siempre la app instalada</strong>, no la abras desde el navegador</li>
                            <li><strong>Permite "Almacenamiento persistente"</strong> cuando lo solicite</li>
                        </ol>
                    </div>
                    
                    <p><strong>Carpeta configurada:</strong> ${this.state.settings.localFolderName}</p>
                    
                    <div style="margin-top: 20px; padding: 10px; background: rgba(253, 203, 110, 0.1); border-radius: 6px;">
                        <p style="margin: 0; font-size: 13px; color: #fdcb6e;">
                            ⚠️ <strong>Nota:</strong> Los navegadores modernos requieren reconfirmación periódica por seguridad.
                            Esto es normal y protege tu privacidad.
                        </p>
                    </div>
                </div>
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="dontShowAgain" class="btn cancel-btn" style="flex: 1;">
                        No mostrar de nuevo
                    </button>
                    <button id="selectFolderNow" class="btn save-btn" style="flex: 1;">
                        📂 Seleccionar carpeta
                    </button>
                    <button id="installPWA" class="btn install-btn" style="flex: 1; background: #00b894;">
                        📲 Instalar PWA
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Guardar que mostramos hoy
        localStorage.setItem('dashcam_folder_reminder', today);
        
        // Configurar eventos
        modal.querySelector('#dontShowAgain').addEventListener('click', () => {
            localStorage.setItem('dashcam_folder_reminder', 'never');
            modal.remove();
        });
        
        modal.querySelector('#selectFolderNow').addEventListener('click', async () => {
            modal.remove();
            await this.selectLocalFolder();
        });
        
        modal.querySelector('#installPWA').addEventListener('click', () => {
            this.showPWAInstallInstructions();
            modal.remove();
        });
    }

    showPWAInstallInstructions() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>📲 Instalar como Aplicación</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">✕</button>
                </div>
                <div class="modal-body">
                    <p><strong>Para permisos persistentes y mejor experiencia:</strong></p>
                    
                    <div class="platform-instructions">
                        <div class="platform" style="margin-bottom: 15px;">
                            <strong>📱 iPhone/iPad:</strong>
                            <ol style="margin: 5px 0 5px 20px; padding: 0;">
                                <li>Abre en Safari</li>
                                <li>Toca el botón "Compartir" (📤)</li>
                                <li>Selecciona "Añadir a pantalla de inicio"</li>
                                <li>Nombra la app y toca "Añadir"</li>
                            </ol>
                        </div>
                        
                        <div class="platform" style="margin-bottom: 15px;">
                            <strong>🖥️ Windows (Chrome/Edge):</strong>
                            <ol style="margin: 5px 0 5px 20px; padding: 0;">
                                <li>Haz clic en el icono "Instalar" en la barra de direcciones</li>
                                <li>O ve a Menú → "Instalar Dashcam..."</li>
                                <li>La app se instalará como aplicación independiente</li>
                            </ol>
                        </div>
                        
                        <div class="platform">
                            <strong>🤖 Android (Chrome):</strong>
                            <ol style="margin: 5px 0 5px 20px; padding: 0;">
                                <li>Toca el menú de tres puntos (⋮)</li>
                                <li>Selecciona "Instalar app" o "Añadir a pantalla de inicio"</li>
                                <li>Sigue las instrucciones en pantalla</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 10px; background: rgba(0, 184, 148, 0.1); border-radius: 8px;">
                        <p style="margin: 0; color: #00b894; font-size: 14px;">
                            ✅ <strong>Beneficios de instalar como PWA:</strong><br>
                            • Permisos persistentes<br>
                            • Funciona sin conexión<br>
                            • Icono en pantalla de inicio<br>
                            • Mejor rendimiento
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }


    async saveFolderHandle(handle) {
        try {
            // Serializar el handle para almacenamiento
            const serializedHandle = {
                name: handle.name,
                kind: handle.kind,
                isDirectory: true
            };
            
            // Almacenar en IndexedDB para persistencia
            if (this.db) {
                await this.saveToDatabase('folderHandles', {
                    id: 'localFolder',
                    handle: serializedHandle,
                    timestamp: Date.now()
                });
                console.log('💾 Handle de carpeta guardado en IndexedDB');
            }
            
            // También guardar en localStorage como backup
            try {
                // Nota: No podemos almacenar el objeto handle directamente
                // Solo guardamos información de referencia
                localStorage.setItem('dashcam_folder_name', handle.name);
                localStorage.setItem('dashcam_folder_timestamp', Date.now().toString());
            } catch (e) {
                console.warn('⚠️ Error guardando en localStorage:', e);
            }
            
        } catch (error) {
            console.error('❌ Error guardando handle:', error);
        }
    }

    async restoreFolderHandle() {
        try {
            console.log('🔄 Restaurando handle de carpeta persistente...');
            
            // Primero intentar desde localStorage
            const folderName = localStorage.getItem('dashcam_folder_name');
            if (folderName) {
                console.log(`📂 Nombre de carpeta encontrado en localStorage: ${folderName}`);
                
                // Solo mostrar información, no forzar restauración
                this.state.settings.localFolderName = folderName;
                this.updateFolderUI();
                
                // Mostrar notificación informativa
                this.showNotification(`📂 Carpeta "${folderName}" detectada`);
                
                // Si el usuario está en modo carpeta local, sugerir seleccionar
                if (this.state.settings.storageLocation === 'localFolder') {
                    setTimeout(() => {
                        this.showPersistentPermissionReminder();
                    }, 3000);
                }
                
                return false; // No está realmente restaurada, necesita reconfirmación
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Error restaurando handle:', error);
            return false;
        }
    }

    checkPWARequirements() {
        console.log('📱 Verificando requisitos PWA:');
        console.log('🔹 Protocolo actual:', window.location.protocol);
        console.log('🔹 HTTPS:', window.location.protocol === 'https:');
        console.log('🔹 Localhost:', window.location.hostname === 'localhost');
        console.log('🔹 Service Worker:', 'serviceWorker' in navigator);
        console.log('🔹 BeforeInstallPrompt:', 'BeforeInstallPromptEvent' in window);
        console.log('🔹 Display Mode:', window.matchMedia('(display-mode: standalone)').matches);
        console.log('🔹 Standalone en iOS:', window.navigator.standalone);
        
        // Solo verificar service workers si estamos en https:// o localhost
        if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    console.log('🔹 Service Workers registrados:', registrations.length);
                    registrations.forEach((reg, index) => {
                        console.log(`  SW ${index}:`, reg.scope);
                    });
                }).catch(error => {
                    console.log('🔹 Error verificando service workers:', error.message);
                });
            }
        } else {
            console.log('🔹 Service Workers no disponibles en file://');
        }
    }

    // Añade esta función
    promotePWAInstallation() {
        // Solo mostrar si no está instalado y han pasado 10 segundos
        if (this.isPWAInstalled) return;
        
        setTimeout(() => {
            this.showInstallButton();
            
            // Si después de 30 segundos no se ha instalado, mostrar recordatorio
            setTimeout(() => {
                if (!this.isPWAInstalled && this.deferredPrompt) {
                    const modal = document.createElement('div');
                    modal.className = 'modal';
                    modal.innerHTML = `
                        <div class="modal-content" style="max-width: 450px;">
                            <div class="modal-header">
                                <h3>📲 Instalar para mejor experiencia</h3>
                            </div>
                            <div class="modal-body">
                                <p>Instalando la app como PWA te dará:</p>
                                <ul style="padding-left: 20px; margin: 10px 0;">
                                    <li>✅ Permisos persistentes para carpetas</li>
                                    <li>✅ Acceso más rápido</li>
                                    <li>✅ Funcionamiento sin conexión</li>
                                    <li>✅ Icono en pantalla de inicio</li>
                                </ul>
                            </div>
                            <div class="modal-actions">
                                <button id="installNow" class="btn save-btn">📲 Instalar ahora</button>
                                <button id="later" class="btn cancel-btn">Más tarde</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    modal.querySelector('#installNow').addEventListener('click', () => {
                        this.installPWA();
                        modal.remove();
                    });
                    
                    modal.querySelector('#later').addEventListener('click', () => {
                        modal.remove();
                    });
                }
            }, 30000);
        }, 10000);
    }



    showRestoreFolderModal(folderName) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'restoreFolderModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h3>📂 Restaurar Carpeta</h3>
                </div>
                <div class="modal-body">
                    <p>Se detectó una carpeta guardada previamente:</p>
                    <div style="text-align: center; margin: 15px 0; padding: 10px; background: rgba(0, 168, 255, 0.1); border-radius: 8px;">
                        <strong style="color: #00a8ff; font-size: 16px;">${folderName}</strong>
                    </div>
                    <p>¿Quieres restaurar el acceso a esta carpeta?</p>
                    <p><small><em>Nota: Windows/Chrome requerirá que confirmes el permiso nuevamente por seguridad.</em></small></p>
                </div>
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="cancelRestore" class="btn cancel-btn" style="flex: 1;">
                        Usar carpeta diferente
                    </button>
                    <button id="restoreFolder" class="btn save-btn" style="flex: 1;">
                        📂 Restaurar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#cancelRestore').addEventListener('click', () => {
            modal.remove();
            this.selectLocalFolder();
        });
        
        modal.querySelector('#restoreFolder').addEventListener('click', async () => {
            modal.remove();
            await this.selectLocalFolder(); // El selector recordará la última carpeta
        });
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
            console.log('📁 Cargando galería modo:', this.state.viewMode);
            
            // Limpiar lista actual
            this.state.videos = [];
            
            if (this.state.viewMode === 'default') {
                // Cargar solo videos de la APP
                await this.loadAppVideos();
                console.log(`📱 Mostrando ${this.state.videos.length} videos de la APP`);
            } else if (this.state.viewMode === 'localFolder') {
                // Cargar solo videos de carpeta LOCAL
                await this.loadLocalFolderVideos();
                console.log(`📂 Mostrando ${this.state.videos.length} videos de carpeta LOCAL`);
                
                // También limpiar la base de datos de archivos inexistentes
                await this.cleanupLocalFilesDatabase();
            }
            
            // Renderizar la lista
            this.renderVideosList();
            
        } catch (error) {
            console.error('❌ Error cargando galería:', error);
            this.state.videos = [];
            this.renderVideosList();
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
        } else if (type === 'gpx') {
            if (this.state.selectedGPX.has(id)) {
                this.state.selectedGPX.delete(id);
            } else {
                this.state.selectedGPX.add(id);
            }
        }
        
        this.updateGalleryActions();
    }

    // En loadAppVideos(), asegúrate de que los IDs de la app sean números
    async loadAppVideos() {
        try {
            console.log('📱 Cargando videos de la APP...');
            
            let videos = [];
            
            if (this.db) {
                // Obtener solo videos de la app (location: 'app' o sin location)
                const allVideos = await this.getAllFromStore('videos');
                videos = allVideos.filter(video => 
                    !video.location || 
                    video.location === 'app' || 
                    video.location === 'default'
                );
            } else {
                const storedVideos = localStorage.getItem('dashcam_videos');
                if (storedVideos) {
                    videos = JSON.parse(storedVideos);
                }
            }
            
            // Asegurar que los IDs sean números y tengan todos los campos necesarios
            videos = videos.map(video => ({
                ...video,
                id: Number(video.id) || Date.now() + Math.random(), // Convertir a número o crear ID único
                // Asegurar que siempre tenga título
                title: video.title || `Grabación ${new Date(video.timestamp || Date.now()).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })}${video.segment ? ` - S${video.segment}` : ''}${video.sessionName ? ` - ${video.sessionName}` : ''}`,
                // Asegurar que siempre tenga filename
                filename: video.filename || `grabacion_${video.timestamp || Date.now()}.${video.format || 'mp4'}`,
                // Asegurar que tenga formato
                format: video.format || 'mp4',
                // Asegurar que tenga ubicación
                location: video.location || 'app',
                // Asegurar que tenga tamaño
                size: video.size || (video.blob ? video.blob.size : 0),
                // Asegurar que tenga duración
                duration: video.duration || 0,
                // Asegurar que tenga puntos GPS
                gpsPoints: video.gpsPoints || 0,
                // Asegurar que tenga track GPS
                gpsTrack: video.gpsTrack || []
            }));
            
            // Filtrar para asegurar que tienen blob o dataUrl
            this.state.videos = videos
                .filter(video => {
                    const hasData = video.blob || video.dataUrl;
                    if (!hasData) {
                        console.warn('⚠️ Video sin datos eliminado:', video.id, video.title);
                    }
                    return hasData;
                })
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            
            console.log(`✅ ${this.state.videos.length} videos cargados de la APP`);
            
            // DEBUG: Mostrar información de depuración
            console.log('📊 Detalles de videos cargados:');
            this.state.videos.forEach((video, index) => {
                console.log(`🎬 Video ${index}:`, {
                    id: video.id,
                    title: video.title?.substring(0, 50) + (video.title?.length > 50 ? '...' : ''),
                    filename: video.filename,
                    hasBlob: !!video.blob,
                    size: video.size ? `${Math.round(video.size / (1024 * 1024))} MB` : '0 MB',
                    location: video.location
                });
            });
            
        } catch (error) {
            console.error('❌ Error cargando vídeos de app:', error);
            this.state.videos = [];
            this.showNotification('❌ Error al cargar videos de la app');
        }
    }


    async loadLocalFolderVideos() {
        try {
            console.log('📂 Cargando videos de carpeta LOCAL...');
            
            // Sincronizar antes de cargar
            await this.syncPhysicalFilesWithDatabase();
            
            let videos = [];
            
            if (this.localFolderHandle) {
                videos = await this.scanLocalFolderForVideos();
                
                if (videos.length === 0) {
                    console.log('📂 No se encontraron videos en la carpeta');
                    this.state.videos = [];
                    this.renderVideosList();
                    
                    // Mostrar estado vacío
                    this.showNotification('📂 No hay videos en la carpeta local');
                    return;
                }
                
                // Extraer duración para videos que no la tienen
                console.log('⏱️ Extrayendo duraciones para videos locales...');
                const enhancedVideos = [];
                
                for (const video of videos) {
                    if (!video.hasDuration || video.duration === 0) {
                        const enhancedVideo = await this.extractAndSetVideoDuration(video);
                        enhancedVideos.push(enhancedVideo);
                    } else {
                        enhancedVideos.push(video);
                    }
                }
                
                videos = enhancedVideos;
                
            } else {
                console.log('⚠️ No hay carpeta local seleccionada');
                this.state.videos = [];
                this.renderVideosList();
                
                this.showNotification('📂 Selecciona una carpeta local primero');
                return;
            }
            
            // Filtrar y mejorar datos
            this.state.videos = videos
                .filter(video => video.blob)
                .map(video => this.enhanceLocalVideoData(video))
                .sort((a, b) => b.timestamp - a.timestamp);
                
            console.log(`✅ ${this.state.videos.length} videos cargados de carpeta LOCAL`);
            
            // Mostrar información de duración
            const videosWithDuration = this.state.videos.filter(v => v.duration > 0).length;
            console.log(`📊 ${videosWithDuration}/${this.state.videos.length} videos tienen duración válida`);
            
            this.renderVideosList();
            
        } catch (error) {
            console.error('❌ Error cargando vídeos de carpeta:', error);
            this.state.videos = [];
            this.renderVideosList();
            this.showNotification('❌ Error al cargar carpeta local');
        }
    }
        
    enhanceLocalVideoData(video) {
        if (!video) return video;
        
        // Asegurar que tenga duración
        let finalDuration = video.duration || 0;
        
        // Si no tiene duración pero tiene blob, intentar extraerla
        if (finalDuration === 0 && video.blob) {
            console.log(`🔄 Intentando extraer duración para: ${video.filename}`);
            
            // Esto se hará de manera asíncrona, así que por ahora dejamos 0
            // La duración real se extraerá cuando sea necesario
        }
        
        // Crear ID único si no existe
        if (!video.id || video.id === 'undefined') {
            video.id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Asegurar campos esenciales
        return {
            ...video,
            duration: finalDuration, // Asegurar duración
            
            // Asegurar título
            title: video.title || 
                (video.session ? `${video.session}/${video.filename}` : video.filename) || 
                `Grabación ${new Date(video.timestamp || video.lastModified || Date.now()).toLocaleString('es-ES')}`,
            
            // Asegurar filename si no existe
            filename: video.filename || video.title || `video_${Date.now()}.${video.format || 'mp4'}`,
            
            // Asegurar timestamp
            timestamp: video.timestamp || video.lastModified || Date.now(),
            
            // Asegurar tamaño
            size: video.size || (video.blob ? video.blob.size : 0),
            
            // Asegurar formato
            format: video.format || (video.filename?.endsWith('.mp4') ? 'mp4' : 'webm'),
            
            // Asegurar ubicación
            location: video.location || 'localFolder',
            
            // Asegurar fuente
            source: video.source || 'filesystem',
            
            // Asegurar track GPS
            gpsTrack: video.gpsTrack || [],
            gpsPoints: video.gpsPoints || video.gpsTrack?.length || 0,
            
            // Asegurar si es archivo físico
            isPhysical: video.isPhysical !== undefined ? video.isPhysical : true,
            
            // Asegurar sesión si existe
            session: video.session || null,
            
            // Asegurar lastModified
            lastModified: video.lastModified || video.timestamp || Date.now(),
            
            // Asegurar handle del archivo
            fileHandle: video.fileHandle || null,
            
            // Asegurar blob
            blob: video.blob || null,
            
            // Asegurar flag de duración
            hasDuration: video.hasDuration !== undefined ? video.hasDuration : (video.duration > 0),
            
            // Asegurar si tiene metadatos GPS
            hasMetadata: video.hasMetadata !== undefined ? video.hasMetadata : (video.gpsTrack?.length > 0),
            
            // Asegurar segmento si aplica
            segment: video.segment || 1,
            
            // Asegurar tamaño en MB para UI
            sizeMB: video.sizeMB || (video.size ? Math.round(video.size / (1024 * 1024)) : 0)
        };
    }

    async extractAndSetVideoDuration(video) {
        try {
            if (!video || !video.blob) return video;
            
            // Si ya tiene duración, no hacer nada
            if (video.duration && video.duration > 0) {
                return video;
            }
            
            console.log(`⏱️ Extrayendo duración para video local: ${video.filename}`);
            
            // Extraer duración
            const duration = await this.extractVideoDuration(video.blob);
            
            // Actualizar video
            video.duration = duration;
            video.hasDuration = duration > 0;
            
            console.log(`✅ Duración establecida: ${this.formatTime(duration)}`);
            
            return video;
            
        } catch (error) {
            console.warn(`⚠️ Error extrayendo duración para ${video.filename}:`, error);
            video.duration = 0;
            video.hasDuration = false;
            return video;
        }
    }

    async scanLocalFolderForVideos() {
        try {
            console.log('🔍 Escaneando carpeta física para videos...');
            let videos = [];
            
            if (!this.localFolderHandle) {
                console.log('⚠️ No hay carpeta local seleccionada');
                return [];
            }
            
            // Verificar que tenemos acceso
            try {
                const permission = await this.localFolderHandle.requestPermission({ mode: 'readwrite' });
                if (permission !== 'granted') {
                    console.log('⚠️ Permiso denegado para acceder a la carpeta');
                    this.showNotification('❌ Permiso denegado para acceder a la carpeta');
                    return [];
                }
            } catch (error) {
                console.warn('⚠️ No se pudo verificar permiso:', error);
            }
            
            // Leer todos los archivos de la carpeta
            console.log('📂 Leyendo contenido de la carpeta...');
            let entries = []; // DECLARAR LA VARIABLE AQUÍ FUERA DEL try-catch
            
            try {
                for await (const entry of this.localFolderHandle.values()) {
                    entries.push(entry);
                    console.log(`📄 Encontrado: ${entry.name} (${entry.kind})`);
                }
            } catch (error) {
                console.error('❌ Error leyendo carpeta:', error);
                this.showNotification('❌ Error al leer carpeta');
                return [];
            }
            
            console.log(`📊 Total entradas encontradas: ${entries.length}`);
            
            // Buscar videos .mp4 y .webm
            for (const entry of entries) {
                if (entry.kind === 'file') {
                    const fileName = entry.name.toLowerCase();
                    
                    if (fileName.endsWith('.mp4') || fileName.endsWith('.webm')) {
                        console.log(`🎬 Procesando video: ${entry.name}`);
                        
                        try {
                            const file = await entry.getFile();
                            
                            // Extraer duración del video
                            let duration = await this.extractVideoDuration(file);
                            
                            // Si la duración es 0, inválida o Infinity
                            if (!duration || !isFinite(duration) || duration === Infinity || duration === 0) {
                                console.log('🔄 Duración inválida, usando estimación por tamaño...');
                                duration = this.estimateDurationByFileSize(
                                    file.size, 
                                    fileName.endsWith('.mp4') ? 'mp4' : 'webm'
                                );
                            }
                            
                            // Verificar que la duración sea válida
                            if (!isFinite(duration) || duration === Infinity || duration < 0) {
                                duration = 0;
                            }
                            
                            // Crear ID único como STRING
                            const uniqueId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            
                            const video = {
                                id: uniqueId,
                                filename: entry.name,
                                title: entry.name.replace(/\.[^/.]+$/, ''), // Remover extensión
                                timestamp: file.lastModified,
                                size: file.size,
                                duration: duration,
                                location: 'localFolder',
                                source: 'filesystem',
                                fileHandle: entry,
                                blob: file,
                                format: fileName.endsWith('.mp4') ? 'mp4' : 'webm',
                                isPhysical: true,
                                lastModified: file.lastModified,
                                hasDuration: duration > 0
                            };
                            
                            console.log(`✅ Video procesado: ${entry.name} - ${Math.round(file.size / 1024 / 1024)} MB - ${this.formatTime(duration)}`);
                            
                            videos.push(video);
                            
                        } catch (error) {
                            console.warn(`⚠️ Error procesando archivo ${entry.name}:`, error);
                        }
                    }
                } else if (entry.kind === 'directory') {
                    console.log(`📁 Carpeta encontrada: ${entry.name}`);
                    
                    // ESCANEAR SUBDIRECTORIOS (sesiones)
                    try {
                        const sessionVideos = await this.scanSessionFolder(entry, entry.name);
                        videos = videos.concat(sessionVideos);
                    } catch (error) {
                        console.warn(`⚠️ Error escaneando carpeta ${entry.name}:`, error);
                    }
                }
            }
            
            console.log(`📊 Total videos físicos encontrados: ${videos.length}`);
            return videos;
            
        } catch (error) {
            console.error('❌ Error escaneando carpeta física:', error);
            this.showNotification('❌ Error al escanear carpeta');
            return [];
        }
    }

