// Dashcam PWA v4.5 - Versión Completa Simplificada

const APP_VERSION = '4.5';

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
            expandedSessions: new Set(),  // Para guardar qué sesiones están expandidas
            selectedSessions: new Set(),   // Para guardar qué sesiones están seleccionadas
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

    async uploadCustomLogo() {
        try {
            // Para iOS/Android/Desktop usamos el input file oculto
            const logoInput = document.getElementById('logoUpload');
            
            if (!logoInput) {
                this.showNotification('❌ No se encontró el selector de logo');
                return;
            }
            
            // Configurar el input para iOS
            logoInput.accept = 'image/*';
            logoInput.multiple = false;
            
            // Crear promesa para manejar la selección
            const filePromise = new Promise((resolve, reject) => {
                logoInput.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        resolve(file);
                    } else {
                        reject(new Error('No se seleccionó archivo'));
                    }
                    // Limpiar el input
                    logoInput.value = '';
                };
                
                logoInput.oncancel = () => {
                    reject(new Error('Selección cancelada'));
                };
            });
            
            // Disparar el selector de archivos
            logoInput.click();
            
            // Esperar a que el usuario seleccione
            const file = await filePromise;
            
            // Validar el archivo
            if (!file.type.startsWith('image/')) {
                this.showNotification('❌ Por favor selecciona una imagen');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB máximo
                this.showNotification('❌ La imagen es demasiado grande (máx. 5MB)');
                return;
            }
            
            // Convertir a Data URL para previsualización
            const reader = new FileReader();
            reader.onload = (e) => {
                const logoDataUrl = e.target.result;
                this.state.customLogo = logoDataUrl;
                this.state.logoImage = logoDataUrl;
                
                // Guardar en configuración
                this.state.settings.customLogo = logoDataUrl;
                this.saveSettings();
                
                // Actualizar UI
                this.updateLogoInfo();
                
                this.showNotification(`✅ Logo cargado: ${file.name}`);
            };
            reader.readAsDataURL(file);
            
        } catch (error) {
            if (error.message !== 'Selección cancelada') {
                console.error('❌ Error cargando logo:', error);
                this.showNotification('❌ Error al cargar logo');
            }
        }
    }

    async handleGpxUpload() {
        try {
            // Usar el input file oculto para GPX
            const gpxInput = document.getElementById('gpxUpload');
            
            if (!gpxInput) {
                this.showNotification('❌ No se encontró el selector de GPX');
                return;
            }
            
            // Configurar el input
            gpxInput.accept = '.gpx,.xml';
            gpxInput.multiple = false;
            
            // Crear promesa para manejar la selección
            const filePromise = new Promise((resolve, reject) => {
                gpxInput.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        resolve(file);
                    } else {
                        reject(new Error('No se seleccionó archivo'));
                    }
                    // Limpiar el input
                    gpxInput.value = '';
                };
                
                gpxInput.oncancel = () => {
                    reject(new Error('Selección cancelada'));
                };
            });
            
            // Disparar el selector de archivos
            gpxInput.click();
            
            // Esperar a que el usuario seleccione
            const file = await filePromise;
            
            // Validar el archivo
            if (!file.name.toLowerCase().endsWith('.gpx') && 
                !file.name.toLowerCase().endsWith('.xml')) {
                this.showNotification('❌ Por favor selecciona un archivo GPX o XML');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB máximo
                this.showNotification('❌ El archivo GPX es demasiado grande (máx. 10MB)');
                return;
            }
            
            // Leer el archivo
            const text = await file.text();
            
            // Procesar el GPX
            const gpxData = await this.parseGPXData(text, {
                filename: file.name,
                uploadDate: Date.now(),
                fileSize: file.size,
                source: 'upload'
            });
            
            // Guardar en la base de datos
            if (this.db) {
                await this.saveToDatabase('gpxFiles', gpxData);
                
                // Actualizar lista en memoria
                this.state.loadedGPXFiles.push(gpxData);
                this.updateGpxSelect();
                
                this.showNotification(`✅ GPX cargado: ${gpxData.name}`);
                
                // Recargar la lista
                this.loadGPXFromStore();
            }
            
        } catch (error) {
            if (error.message !== 'Selección cancelada') {
                console.error('❌ Error cargando GPX:', error);
                this.showNotification('❌ Error al cargar GPX');
            }
        }
    }
    async handleGpxUploadFile(file) {
        try {
            // Leer el archivo
            const text = await file.text();
            
            // Procesar el GPX
            const gpxData = await this.parseGPXData(text, {
                filename: file.name,
                uploadDate: Date.now(),
                fileSize: file.size,
                source: 'upload'
            });
            
            // Guardar en la base de datos
            if (this.db) {
                await this.saveToDatabase('gpxFiles', gpxData);
                
                // Actualizar lista en memoria
                this.state.loadedGPXFiles.push(gpxData);
                this.updateGpxSelect();
                
                this.showNotification(`✅ GPX cargado: ${gpxData.name}`);
                
                // Recargar la lista
                this.loadGPXFromStore();
            }
            
        } catch (error) {
            console.error('❌ Error procesando GPX:', error);
            this.showNotification('❌ Error al procesar GPX');
        }
    }

    async showIOSFolderPicker() {
        try {
            // En iOS, usamos el input file con webkitdirectory si está disponible
            // o mostramos instrucciones si no
            if (window.showOpenFilePicker) {
                // Navegadores modernos (Chrome, Edge)
                const handle = await window.showOpenFilePicker({
                    types: [{
                        description: 'Videos y GPX',
                        accept: {
                            'video/*': ['.mp4', '.webm'],
                            'application/gpx+xml': ['.gpx', '.xml']
                        }
                    }],
                    multiple: true,
                    excludeAcceptAllOption: false
                });
                
                // Procesar archivos seleccionados
                for (const fileHandle of handle) {
                    const file = await fileHandle.getFile();
                    // Aquí procesar el archivo según su tipo
                    if (file.type.startsWith('video/')) {
                        // Procesar video
                    } else if (file.name.endsWith('.gpx') || file.name.endsWith('.xml')) {
                        // Procesar GPX
                        await this.handleGpxUploadFile(file);
                    }
                }
                
            } else if ('webkitdirectory' in HTMLInputElement.prototype) {
                // Safari/iOS con soporte limitado
                this.showNotification('ℹ️ En iOS, usa la app "Archivos" para seleccionar');
                
                // Mostrar instrucciones
                const modal = document.getElementById('localFolderPickerModal');
                if (modal) {
                    modal.classList.remove('hidden');
                    document.getElementById('iphoneInstructions').style.display = 'block';
                    document.getElementById('desktopInstructions').style.display = 'none';
                }
                
                // Configurar botón para abrir app Archivos
                const openFilesBtn = document.getElementById('openFilesAppBtn');
                if (openFilesBtn) {
                    openFilesBtn.onclick = () => {
                        // En iOS podemos intentar abrir la app Archivos
                        window.open('shareddocuments://', '_blank');
                    };
                }
                
            } else {
                // Fallback: usar input file normal
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*,.gpx,.xml';
                input.multiple = true;
                
                input.onchange = async (event) => {
                    const files = Array.from(event.target.files);
                    for (const file of files) {
                        if (file.type.startsWith('video/')) {
                            // Procesar video
                        } else if (file.name.endsWith('.gpx') || file.name.endsWith('.xml')) {
                            await this.handleGpxUploadFile(file);
                        }
                    }
                };
                
                input.click();
            }
            
        } catch (error) {
            console.error('❌ Error en selector iOS:', error);
            if (error.name !== 'AbortError') {
                this.showNotification('❌ Error en selector de archivos');
            }
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
                await this.loadAppVideos();
            } else if (this.state.viewMode === 'localFolder') {
                await this.loadLocalFolderVideos();
                await this.cleanupLocalFilesDatabase();
            }
            
            // Limpiar sesiones vacías automáticamente
            await this.cleanupEmptySessions();
            
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

    async scanSessionFolder(folderHandle, sessionName) {
        try {
            console.log(`📂 Escaneando carpeta de sesión: ${sessionName}`);
            let videos = [];
            
            const entries = [];
            for await (const entry of folderHandle.values()) {
                entries.push(entry);
            }
            
            console.log(`📄 Archivos en sesión ${sessionName}: ${entries.length}`);
            
            // Buscar videos en esta carpeta
            for (const entry of entries) {
                if (entry.kind === 'file') {
                    const fileName = entry.name.toLowerCase();
                    
                    if (fileName.endsWith('.mp4') || fileName.endsWith('.webm')) {
                        try {
                            const file = await entry.getFile();
                            
                            // Extraer duración del video
                            const duration = await this.extractVideoDuration(file);
                            
                            // Crear ID único como STRING
                            const uniqueId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            
                            const video = {
                                id: uniqueId,
                                filename: entry.name,
                                title: `${sessionName}/${entry.name}`,
                                timestamp: file.lastModified,
                                size: file.size,
                                duration: duration, // Duración extraída
                                location: 'localFolder',
                                source: 'filesystem',
                                session: sessionName,
                                fileHandle: entry,
                                blob: file,
                                format: fileName.endsWith('.mp4') ? 'mp4' : 'webm',
                                isPhysical: true,
                                lastModified: file.lastModified,
                                hasDuration: duration > 0
                            };
                            
                            console.log(`📄 Video en sesión ${sessionName}: ${entry.name} - ${this.formatTime(duration)}`);
                            
                            videos.push(video);
                            
                        } catch (error) {
                            console.warn(`⚠️ Error leyendo archivo ${entry.name}:`, error);
                        }
                    }
                } else if (entry.kind === 'directory') {
                    console.log(`📁 Subcarpeta en ${sessionName}: ${entry.name}`);
                    // Opcional: escanear recursivamente
                    const subVideos = await this.scanSessionFolder(entry, `${sessionName}/${entry.name}`);
                    videos = videos.concat(subVideos);
                }
            }
            
            return videos;
            
        } catch (error) {
            console.error(`❌ Error escaneando carpeta ${sessionName}:`, error);
            return [];
        }
    }
    // Helper para leer strings del array buffer (si no la tienes)
    readString(arrayBuffer, offset, length) {
        try {
            const bytes = new Uint8Array(arrayBuffer, offset, length);
            let str = '';
            for (let i = 0; i < length; i++) {
                str += String.fromCharCode(bytes[i]);
            }
            return str;
        } catch (error) {
            console.warn('⚠️ Error leyendo string:', error);
            return '';
        }
    }

    // Método alternativo para extraer duración
// Método alternativo para extraer duración
    async getVideoDurationAlternative(blob) {
        return new Promise((resolve) => {
            try {
                console.log('🔄 Usando método alternativo para duración...');
                
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const arrayBuffer = e.target.result;
                        const dataView = new DataView(arrayBuffer);
                        
                        let duration = 0;
                        
                        // Para MP4 files
                        if (blob.type.includes('mp4') || blob.name?.includes('.mp4')) {
                            duration = this.extractMP4Duration(arrayBuffer, dataView);
                        }
                        // Para WebM files
                        else if (blob.type.includes('webm') || blob.name?.includes('.webm')) {
                            duration = this.extractWebMDuration(arrayBuffer, dataView);
                        }
                        
                        if (duration > 0) {
                            console.log(`✅ Duración encontrada (alternativo): ${duration}ms`);
                            resolve(duration);
                        } else {
                            console.log('⚠️ No se pudo extraer duración con método alternativo');
                            resolve(0);
                        }
                        
                    } catch (error) {
                        console.warn('⚠️ Error en método alternativo:', error);
                        resolve(0);
                    }
                };
                
                reader.onerror = () => {
                    console.warn('⚠️ Error leyendo archivo para método alternativo');
                    resolve(0);
                };
                
                // Leer solo los primeros 100KB (donde suele estar la metadata)
                reader.readAsArrayBuffer(blob.slice(0, 100000));
                
            } catch (error) {
                console.warn('⚠️ Error en getVideoDurationAlternative:', error);
                resolve(0);
            }
        });
    }

    // Extraer duración de archivos MP4
    extractMP4Duration(arrayBuffer, dataView) {
        try {
            // Buscar átomo 'moov' que contiene la duración
            for (let i = 0; i < arrayBuffer.byteLength - 16; i++) {
                const size = dataView.getUint32(i);
                const type = this.readString(arrayBuffer, i + 4, 4);
                
                if (type === 'moov') {
                    // Buscar átomo 'mvhd' (movie header) dentro de moov
                    for (let j = i + 8; j < i + size; j++) {
                        const subSize = dataView.getUint32(j);
                        const subType = this.readString(arrayBuffer, j + 4, 4);
                        
                        if (subType === 'mvhd') {
                            const version = dataView.getUint8(j + 8);
                            let timescale, duration;
                            
                            if (version === 1) {
                                // Versión 1 (64-bit)
                                timescale = dataView.getUint32(j + 20);
                                duration = Number(dataView.getBigUint64(j + 24));
                            } else {
                                // Versión 0 (32-bit)
                                timescale = dataView.getUint32(j + 12);
                                duration = dataView.getUint32(j + 16);
                            }
                            
                            if (timescale > 0 && duration > 0) {
                                const durationMs = (duration / timescale) * 1000;
                                console.log(`📹 MP4: timescale=${timescale}, duration=${duration}, ms=${durationMs}`);
                                return Math.round(durationMs);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error extrayendo duración MP4:', error);
        }
        return 0;
    }

    // Extraer duración de archivos WebM
    extractWebMDuration(arrayBuffer, dataView) {
        try {
            // WebM es más complejo, buscar segmentos de información
            // Para simplificar, podemos usar una estimación basada en el tamaño
            const fileSize = arrayBuffer.byteLength;
            
            // Estimación aproximada: 1MB ≈ 5-10 segundos en calidad media
            // Esto es solo una estimación de respaldo
            const estimatedDuration = Math.round((fileSize / (1024 * 1024)) * 8000); // 8 segundos por MB
            
            console.log(`🎬 WebM: tamaño=${Math.round(fileSize/1024/1024)}MB, duración estimada=${estimatedDuration}ms`);
            
            return estimatedDuration;
        } catch (error) {
            console.warn('⚠️ Error extrayendo duración WebM:', error);
        }
        return 0;
    }

    // Helper para leer strings del array buffer (si no la tienes)
    readString(arrayBuffer, offset, length) {
        const bytes = new Uint8Array(arrayBuffer, offset, length);
        let str = '';
        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return str;
    }
    

    // Añade esta función a tu clase DashcamApp (puede ir en la sección UTILIDADES)
    async extractVideoDuration(blob) {
        return new Promise((resolve) => {
            try {
                console.log('⏱️ Extrayendo duración del video...');
                
                // Si estamos en file:// protocol, usar método alternativo
                if (window.location.protocol === 'file:') {
                    console.log('⚠️ file:// protocol detectado, usando método alternativo');
                    this.getVideoDurationAlternative(blob).then(duration => {
                        console.log(`✅ Duración extraída (alternativo): ${duration}ms (${this.formatTime(duration)})`);
                        resolve(duration);
                    });
                    return;
                }
                
                // Método normal para http/https
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.muted = true;
                video.playsInline = true;
                
                let durationExtracted = false;
                let fallbackTimeout;
                
                video.onloadedmetadata = () => {
                    if (durationExtracted) return;
                    durationExtracted = true;
                    
                    const duration = Math.round(video.duration * 1000);
                    
                    // Verificar que la duración no sea Infinity o NaN
                    if (!isFinite(duration) || isNaN(duration) || duration === Infinity) {
                        console.warn('⚠️ Duración inválida del video:', video.duration);
                        this.getVideoDurationAlternative(blob).then(altDuration => {
                            console.log(`✅ Duración alternativa: ${altDuration}ms`);
                            URL.revokeObjectURL(video.src);
                            video.remove();
                            clearTimeout(fallbackTimeout);
                            resolve(altDuration);
                        });
                        return;
                    }
                    
                    console.log(`✅ Duración extraída: ${duration}ms (${this.formatTime(duration)})`);
                    
                    URL.revokeObjectURL(video.src);
                    video.remove();
                    clearTimeout(fallbackTimeout);
                    resolve(duration);
                };
                
                video.onerror = (error) => {
                    console.warn('⚠️ Error extrayendo duración del video:', error);
                    this.getVideoDurationAlternative(blob).then(altDuration => {
                        console.log(`✅ Duración alternativa (error): ${altDuration}ms`);
                        URL.revokeObjectURL(video.src);
                        video.remove();
                        clearTimeout(fallbackTimeout);
                        resolve(altDuration);
                    });
                };
                
                // Timeout de respaldo
                fallbackTimeout = setTimeout(() => {
                    if (!durationExtracted) {
                        console.log('⏱️ Timeout extrayendo duración, usando método alternativo');
                        this.getVideoDurationAlternative(blob).then(altDuration => {
                            console.log(`✅ Duración alternativa (timeout): ${altDuration}ms`);
                            URL.revokeObjectURL(video.src);
                            video.remove();
                            resolve(altDuration);
                        });
                    }
                }, 3000);
                
                // Crear URL del blob
                const videoUrl = URL.createObjectURL(blob);
                video.src = videoUrl;
                
                // Forzar carga de metadatos
                video.load();
                
            } catch (error) {
                console.warn('⚠️ Error en extractVideoDuration:', error);
                // Usar método alternativo como último recurso
                this.getVideoDurationAlternative(blob).then(duration => {
                    console.log(`✅ Duración alternativa (catch): ${duration}ms`);
                    resolve(duration);
                });
            }
        });
    }


    renderVideosList() {
        const container = this.elements.videosList;
        if (!container) return;
        
        console.log('🔄 Iniciando renderVideosList()...');
        
        // Función auxiliar para mostrar estado vacío
        const renderEmptyState = () => {
            let message = 'No hay vídeos en esta ubicación';
            let submessage = '';
            
            if (this.state.viewMode === 'default') {
                submessage = 'Inicia una grabación para comenzar';
            } else if (this.state.viewMode === 'localFolder') {
                if (!this.localFolderHandle) {
                    message = 'No hay carpeta local seleccionada';
                    submessage = 'Haz clic en "Elegir carpeta" en Configuración';
                } else {
                    message = 'No hay vídeos en la carpeta local';
                    submessage = 'Mueve videos aquí desde la app o graba directamente';
                }
            }
            
            container.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 3em; margin-bottom: 10px;">📁</div>
                    <p style="font-size: 1.2em; font-weight: bold; margin-bottom: 5px;">${message}</p>
                    <p style="color: #666; margin-bottom: 15px;">${submessage}</p>
                    ${this.state.viewMode === 'localFolder' && !this.localFolderHandle ? `
                        <button class="btn open-btn" onclick="window.dashcamApp.showSettings()" 
                                style="margin-top: 15px; padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            ⚙️ Ir a Configuración
                        </button>
                    ` : ''}
                </div>
            `;
        };
        
        // Si no hay videos, mostrar estado vacío
        if (!this.state.videos || this.state.videos.length === 0) {
            console.log('📭 No hay videos para mostrar');
            renderEmptyState();
            return;
        }
        
        console.log(`📊 Total videos: ${this.state.videos.length}`);
        
        // Inicializar sets si no existen
        if (!this.state.expandedSessions) this.state.expandedSessions = new Set();
        if (!this.state.selectedSessions) this.state.selectedSessions = new Set();
        if (!this.state.selectedVideos) this.state.selectedVideos = new Set();
        
        // Función para agrupar videos por sesión
        const groupVideosBySession = (videos) => {
            console.log('📁 Agrupando videos por sesión...');
            const sessions = {};
            
            videos.forEach((video, index) => {
                // Determinar nombre de sesión
                let sessionName = video.session || 'Sesión sin nombre';
                
                // Si no hay sesión o es inválido, crear nombre basado en fecha
                if (!sessionName || sessionName === 'null' || sessionName === 'undefined' || sessionName === '') {
                    const date = new Date(video.timestamp);
                    sessionName = `Sesión ${date.toLocaleDateString('es-ES')}`;
                }
                
                if (!sessions[sessionName]) {
                    sessions[sessionName] = {
                        name: sessionName,
                        videos: [],
                        expanded: this.state.expandedSessions.has(sessionName),
                        selected: this.state.selectedSessions.has(sessionName),
                        totalDuration: 0,
                        totalSize: 0,
                        videoCount: 0,
                        hasPhysicalFiles: false,
                        hasAppFiles: false,
                        earliestDate: null,
                        latestDate: null
                    };
                }
                
                // Agregar video a la sesión
                sessions[sessionName].videos.push(video);
                sessions[sessionName].videoCount++;
                sessions[sessionName].totalDuration += (video.duration || 0);
                sessions[sessionName].totalSize += (video.size || 0);
                
                // Determinar tipos de archivos en la sesión
                if (video.source === 'filesystem' || video.isPhysical || 
                    video.location === 'localFolder' || video.location === 'desktop_folder') {
                    sessions[sessionName].hasPhysicalFiles = true;
                } else {
                    sessions[sessionName].hasAppFiles = true;
                }
                
                // Actualizar fechas
                const timestamp = video.timestamp || Date.now();
                const videoDate = new Date(timestamp);
                
                if (!sessions[sessionName].earliestDate || videoDate < sessions[sessionName].earliestDate) {
                    sessions[sessionName].earliestDate = videoDate;
                }
                if (!sessions[sessionName].latestDate || videoDate > sessions[sessionName].latestDate) {
                    sessions[sessionName].latestDate = videoDate;
                }
            });
            
            // Ordenar videos dentro de cada sesión (más reciente primero)
            Object.values(sessions).forEach(session => {
                session.videos.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            });
            
            return Object.values(sessions);
        };
        
        // Función para renderizar un video individual
        const renderVideoItem = (video) => {
            const date = new Date(video.timestamp);
            const sizeMB = video.size ? Math.round(video.size / (1024 * 1024)) : 0;
            const duration = this.formatTime(video.duration || 0);
            const dateStr = date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
            const timeStr = date.toLocaleTimeString('es-ES', {
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            });
            const location = video.location || 'app';
            const format = video.format || 'mp4';
            const segment = video.segment || 1;
            const normalizedId = this.normalizeId(video.id);
            const isSelected = this.state.selectedVideos.has(normalizedId);
            
            // Determinar icono y texto según ubicación real
            let locationIcon, locationText, locationClass;
            if (video.source === 'filesystem' || video.isPhysical || 
                location === 'localFolder' || location === 'desktop_folder' || location === 'ios_local') {
                locationIcon = '📂';
                locationText = 'Carpeta Local';
                locationClass = 'local-file';
            } else {
                locationIcon = '📱';
                locationText = 'App';
                locationClass = 'app-file';
            }
            
            // Acortar título si es muy largo
            let title = video.title || video.filename || 'Grabación';
            if (title.length > 60) {
                title = title.substring(0, 57) + '...';
            }
            
            return `
                <div class="file-item video-file ${locationClass} ${isSelected ? 'selected' : ''}" 
                    data-id="${video.id}" 
                    data-type="video"
                    data-session="${video.session || ''}"
                    style="
                        margin: 8px 0;
                        padding: 12px;
                        border: 1px solid #e0e0e0;
                        border-radius: 6px;
                        background: ${isSelected ? '#e8f4fd' : '#ffffff'};
                        transition: all 0.2s;
                    ">
                    <div class="file-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    ">
                        <div class="file-title" style="
                            flex: 1;
                            font-weight: 500;
                            font-size: 0.95em;
                            color: #333;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            padding-right: 10px;
                        " title="${this.escapeHTML(video.title || video.filename || 'Grabación')}">
                            ${this.escapeHTML(title)}
                        </div>
                        <div class="file-meta" style="
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            flex-shrink: 0;
                        ">
                            <div class="file-location" title="${locationText}" style="font-size: 1.1em;">
                                ${locationIcon}
                            </div>
                            <div class="file-format" style="
                                font-size: 0.75em;
                                background: #f0f0f0;
                                padding: 2px 6px;
                                border-radius: 3px;
                                color: #666;
                            ">
                                ${format.toUpperCase()}
                            </div>
                            <div class="file-time" style="
                                font-size: 0.85em;
                                color: #666;
                            ">
                                ${timeStr}
                            </div>
                        </div>
                    </div>
                    
                    <div class="file-details" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 8px;
                        margin-bottom: 10px;
                        font-size: 0.85em;
                        color: #666;
                    ">
                        <div title="Fecha">
                            <span style="margin-right: 4px;">📅</span> ${dateStr}
                        </div>
                        <div title="Duración">
                            <span style="margin-right: 4px;">⏱️</span> ${duration}
                        </div>
                        <div title="Tamaño">
                            <span style="margin-right: 4px;">💾</span> ${sizeMB} MB
                        </div>
                        <div title="Puntos GPS">
                            <span style="margin-right: 4px;">📍</span> ${video.gpsPoints || 0} puntos
                        </div>
                        ${segment > 1 ? `
                            <div title="Segmento">
                                <span style="margin-right: 4px;">📹</span> Segmento ${segment}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="file-footer" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-top: 8px;
                        border-top: 1px solid #f0f0f0;
                    ">
                        <div class="file-checkbox" style="
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            cursor: pointer;
                        ">
                            <input type="checkbox" class="video-checkbox" 
                                ${isSelected ? 'checked' : ''}
                                data-id="${video.id}"
                                style="
                                    width: 16px;
                                    height: 16px;
                                    cursor: pointer;
                                ">
                            <span style="
                                font-size: 0.85em;
                                color: #666;
                                cursor: pointer;
                            ">Seleccionar</span>
                        </div>
                        <button class="play-btn" data-id="${video.id}" 
                                title="Reproducir ${locationText}"
                                style="
                                    padding: 6px 12px;
                                    background: #4CAF50;
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-size: 0.85em;
                                    transition: background 0.2s;
                                "
                                onmouseover="this.style.background='#45a049'"
                                onmouseout="this.style.background='#4CAF50'">
                            ▶️ Reproducir
                        </button>
                    </div>
                </div>
            `;
        };
        
        // Función para renderizar una sesión completa
        const renderSession = (session) => {
            const isExpanded = session.expanded;
            const totalDuration = this.formatTime(session.totalDuration);
            const totalSizeMB = Math.round(session.totalSize / (1024 * 1024));
            
            // Formatear fechas
            let dateStr = '';
            if (session.earliestDate && session.latestDate) {
                if (session.earliestDate.toDateString() === session.latestDate.toDateString()) {
                    dateStr = session.earliestDate.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                } else {
                    dateStr = `
                        ${session.earliestDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - 
                        ${session.latestDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    `;
                }
            }
            
            // Determinar tipos de archivos en la sesión
            let fileTypes = '';
            if (session.hasPhysicalFiles && session.hasAppFiles) {
                fileTypes = '📱+📂 Mixtos';
            } else if (session.hasPhysicalFiles) {
                fileTypes = '📂 Solo locales';
            } else {
                fileTypes = '📱 Solo app';
            }
            
            // Escapar el nombre de sesión para JavaScript
            const safeSessionName = this.escapeHTML(session.name).replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            // Contador de videos seleccionados en esta sesión
            const selectedVideosInSession = session.videos.filter(video => 
                this.state.selectedVideos.has(this.normalizeId(video.id))
            ).length;
            
            return `
                <div class="session-item" data-session-name="${this.escapeHTML(session.name)}"
                    style="
                        margin-bottom: 20px;
                        border-radius: 8px;
                        overflow: hidden;
                        background: white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                        border: 1px solid #e0e0e0;
                    ">
                    <!-- FILA SUPERIOR: Cabecera principal con TRES botones alineados -->
                    <div class="session-top-row" style="
                        padding: 18px;
                        background: ${isExpanded ? '#f8f9fa' : '#ffffff'};
                        border-bottom: ${isExpanded ? '2px solid #3498db' : '1px solid #f0f0f0'};
                    ">
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 15px;
                        ">
                            <div class="session-main" onclick="window.dashcamApp.toggleSession('${safeSessionName}')"
                                style="
                                    flex: 1;
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                    cursor: pointer;
                                    min-width: 0;
                                ">
                                <div class="session-icon" style="
                                    font-size: 1.5em;
                                    transition: transform 0.3s;
                                    flex-shrink: 0;
                                    ${isExpanded ? 'transform: rotate(90deg);' : ''}
                                ">
                                    ${isExpanded ? '📂' : '📁'}
                                </div>
                                <div class="session-info" style="flex: 1; min-width: 0;">
                                    <div class="session-title" style="
                                        font-weight: 600;
                                        color: #2c3e50;
                                        margin-bottom: 6px;
                                        font-size: 1.1em;
                                        white-space: nowrap;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                    ">
                                        ${this.escapeHTML(session.name)}
                                    </div>
                                    <div class="session-stats" style="
                                        display: flex;
                                        flex-wrap: wrap;
                                        gap: 12px;
                                        color: #7f8c8d;
                                        font-size: 0.9em;
                                    ">
                                        <span class="session-stat" title="Número de videos">
                                            <span style="margin-right: 4px;">🎬</span> ${session.videoCount} videos
                                        </span>
                                        <span class="session-stat" title="Duración total">
                                            <span style="margin-right: 4px;">⏱️</span> ${totalDuration}
                                        </span>
                                        <span class="session-stat" title="Tamaño total">
                                            <span style="margin-right: 4px;">💾</span> ${totalSizeMB} MB
                                        </span>
                                        ${dateStr ? `
                                            <span class="session-stat" title="Rango de fechas">
                                                <span style="margin-right: 4px;">📅</span> ${dateStr}
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- TRES BOTONES ALINEADOS: Eliminar, Exportar y Seleccionar -->
                            <div class="session-top-actions" style="
                                display: flex;
                                gap: 10px;
                                flex-shrink: 0;
                            ">
                                <!-- Botón 1: Eliminar Sesión -->
                                <button class="session-action-btn delete-session-btn" 
                                        onclick="event.stopPropagation(); window.dashcamApp.deleteSession('${safeSessionName}')"
                                        title="Eliminar sesión completa"
                                        style="
                                            padding: 10px 18px;
                                            background: #e74c3c;
                                            color: white;
                                            border: none;
                                            border-radius: 6px;
                                            cursor: pointer;
                                            font-size: 0.95em;
                                            white-space: nowrap;
                                            transition: all 0.2s;
                                            display: flex;
                                            align-items: center;
                                            gap: 8px;
                                            font-weight: 500;
                                            box-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);
                                        "
                                        onmouseover="this.style.background='#c0392b'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(231, 76, 60, 0.3)'"
                                        onmouseout="this.style.background='#e74c3c'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(231, 76, 60, 0.2)'">
                                    🗑️ <span>Eliminar Sesión</span>
                                </button>
                                
                                <!-- Botón 2: Exportar Sesión -->
                                <button class="session-action-btn export-session-btn" 
                                        onclick="event.stopPropagation(); window.dashcamApp.exportSession('${safeSessionName}')"
                                        title="Exportar toda la sesión como ZIP"
                                        style="
                                            padding: 10px 18px;
                                            background: #f39c12;
                                            color: white;
                                            border: none;
                                            border-radius: 6px;
                                            cursor: pointer;
                                            font-size: 0.95em;
                                            white-space: nowrap;
                                            transition: all 0.2s;
                                            display: flex;
                                            align-items: center;
                                            gap: 8px;
                                            font-weight: 500;
                                            box-shadow: 0 2px 4px rgba(243, 156, 18, 0.2);
                                        "
                                        onmouseover="this.style.background='#e67e22'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(243, 156, 18, 0.3)'"
                                        onmouseout="this.style.background='#f39c12'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(243, 156, 18, 0.2)'">
                                    📦 <span>Exportar Sesión</span>
                                </button>
                                
                                <!-- Botón 3: Seleccionar Videos -->
                                <button class="session-action-btn select-session-btn" 
                                        onclick="event.stopPropagation(); window.dashcamApp.toggleSelectSession('${safeSessionName}')"
                                        title="${session.selected ? 'Deseleccionar todos' : 'Seleccionar todos'}"
                                        style="
                                            padding: 10px 18px;
                                            background: ${session.selected ? '#95a5a6' : '#2ecc71'};
                                            color: white;
                                            border: none;
                                            border-radius: 6px;
                                            cursor: pointer;
                                            font-size: 0.95em;
                                            white-space: nowrap;
                                            transition: all 0.2s;
                                            display: flex;
                                            align-items: center;
                                            gap: 8px;
                                            font-weight: 500;
                                            box-shadow: 0 2px 4px rgba(${session.selected ? '149, 165, 166' : '46, 204, 113'}, 0.2);
                                        "
                                        onmouseover="this.style.background='${session.selected ? '#7f8c8d' : '#27ae60'}; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(${session.selected ? '149, 165, 166' : '46, 204, 113'}, 0.3)'"
                                        onmouseout="this.style.background='${session.selected ? '#95a5a6' : '#2ecc71'}; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(${session.selected ? '149, 165, 166' : '46, 204, 113'}, 0.2)'">
                                    ${session.selected ? '❌' : '✅'} 
                                    <span>${session.selected ? 'Deseleccionar' : 'Seleccionar'}</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- FILA INFERIOR: GRID de acciones para videos seleccionados -->
                        <div class="session-bottom-row" style="
                            padding-top: 15px;
                            border-top: 1px solid #eee;
                        ">
                            <!-- GRID de 3 botones para acciones sobre videos seleccionados -->
                            ${selectedVideosInSession > 0 ? `
                                <div style="
                                    display: grid;
                                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                                    gap: 12px;
                                ">
                                    <!-- Botón 1: Eliminar Seleccionados -->
                                    <button onclick="event.stopPropagation(); window.dashcamApp.deleteSelected()"
                                            style="
                                                padding: 14px;
                                                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                                                color: white;
                                                border: none;
                                                border-radius: 6px;
                                                cursor: pointer;
                                                font-size: 0.95em;
                                                transition: all 0.2s;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                gap: 10px;
                                                font-weight: 500;
                                                box-shadow: 0 3px 6px rgba(231, 76, 60, 0.2);
                                            "
                                            onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 12px rgba(231, 76, 60, 0.3)'"
                                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 3px 6px rgba(231, 76, 60, 0.2)'">
                                        <div style="font-size: 1.5em;">🗑️</div>
                                        <div style="font-size: 1em; text-align: center;">
                                            Eliminar
                                        </div>
                                    </button>
                                                                        
                                    <!-- Botón 3: Exportar Seleccionados -->
                                    <button onclick="event.stopPropagation(); window.dashcamApp.exportSelected()"
                                            style="
                                                padding: 14px;
                                                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                                                color: white;
                                                border: none;
                                                border-radius: 6px;
                                                cursor: pointer;
                                                font-size: 0.95em;
                                                transition: all 0.2s;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                gap: 10px;
                                                font-weight: 500;
                                                box-shadow: 0 3px 6px rgba(243, 156, 18, 0.2);
                                            "
                                            onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 12px rgba(243, 156, 18, 0.3)'"
                                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 3px 6px rgba(243, 156, 18, 0.2)'">
                                        <div style="font-size: 1.5em;">📦</div>
                                        <div style="font-size: 1em; text-align: center;">
                                            Exportar
                                        </div>
                                    </button>
                                </div>
                            ` : `
                                <!-- Mensaje cuando no hay videos seleccionados -->
                                <div style="
                                    text-align: center;
                                    padding: 15px;
                                    background: #f8f9fa;
                                    border-radius: 6px;
                                    color: #95a5a6;
                                    font-style: italic;
                                    border: 1px dashed #ddd;
                                ">
                                    Selecciona videos para habilitar las acciones
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- CONTENEDOR DE VIDEOS (se muestra cuando está expandido) -->
                    ${isExpanded ? `
                        <div class="session-videos-container expanded" style="
                            max-height: 5000px;
                            overflow: visible;
                            background: #f9f9f9;
                            display: block !important;
                            padding: ${session.videos.length > 0 ? '20px' : '0'};
                        ">
                            ${session.videos.length > 0 ? `
                                <div class="session-videos" style="
                                    display: flex;
                                    flex-direction: column;
                                    gap: 12px;
                                ">
                                    ${session.videos.map(video => renderVideoItem(video)).join('')}
                                </div>
                            ` : `
                                <div style="
                                    text-align: center;
                                    padding: 40px;
                                    color: #95a5a6;
                                    font-style: italic;
                                    background: white;
                                    border-radius: 6px;
                                    margin: 10px;
                                    border: 1px dashed #ddd;
                                ">
                                    Esta sesión no contiene videos
                                </div>
                            `}
                        </div>
                    ` : ''}
                </div>
            `;
        };
        
        // Agrupar videos por sesión
        const sessions = groupVideosBySession(this.state.videos);
        
        // Ordenar sesiones por fecha (más reciente primero)
        sessions.sort((a, b) => {
            if (!a.latestDate || !b.latestDate) return 0;
            return b.latestDate - a.latestDate;
        });
        
        // Generar HTML
        let html = `
            <div class="sessions-view" style="
                padding: 20px;
                background: #f8f9fa;
                min-height: 300px;
            ">
                <!-- CABECERA SIMPLIFICADA -->
                <div style="
                    margin-bottom: 25px;
                    padding: 0;
                ">
                    <h2 style="
                        margin: 0 0 10px 0;
                        color: #2c3e50;
                        font-size: 1.8em;
                        font-weight: 600;
                    ">
                        📁 Gestión de Sesiones
                    </h2>
                    
                    <div style="
                        display: flex;
                        gap: 12px;
                        flex-wrap: wrap;
                    ">
                        <button onclick="window.dashcamApp.expandAllSessions()"
                                style="
                                    padding: 10px 20px;
                                    background: #3498db;
                                    color: white;
                                    border: none;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 0.95em;
                                    transition: all 0.2s;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    font-weight: 500;
                                "
                                onmouseover="this.style.background='#2980b9'; this.style.transform='translateY(-2px)'"
                                onmouseout="this.style.background='#3498db'; this.style.transform='translateY(0)'">
                            📂 Expandir Todas
                        </button>
                        
                        <button onclick="window.dashcamApp.collapseAllSessions()"
                                style="
                                    padding: 10px 20px;
                                    background: #95a5a6;
                                    color: white;
                                    border: none;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 0.95em;
                                    transition: all 0.2s;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    font-weight: 500;
                                "
                                onmouseover="this.style.background='#7f8c8d'; this.style.transform='translateY(-2px)'"
                                onmouseout="this.style.background='#95a5a6'; this.style.transform='translateY(0)'">
                            📁 Colapsar Todas
                        </button>
                        
                        ${sessions.length > 0 ? `
                            <button onclick="window.dashcamApp.exportAllSessions()"
                                    style="
                                        padding: 10px 20px;
                                        background: #e67e22;
                                        color: white;
                                        border: none;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-size: 0.95em;
                                        transition: all 0.2s;
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                        font-weight: 500;
                                    "
                                    onmouseover="this.style.background='#d35400'; this.style.transform='translateY(-2px)'"
                                    onmouseout="this.style.background='#e67e22'; this.style.transform='translateY(0)'">
                                📦 Exportar Todo
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- LISTA DE SESIONES -->
                ${sessions.length > 0 ? `
                    <div class="sessions-list" style="
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                    ">
                        ${sessions.map(session => renderSession(session)).join('')}
                    </div>
                ` : `
                    <div class="no-sessions" style="
                        text-align: center;
                        padding: 60px 20px;
                        color: #7f8c8d;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        margin: 20px 0;
                    ">
                        <div style="font-size: 4em; margin-bottom: 20px;">📁</div>
                        <h3 style="font-size: 1.4em; margin-bottom: 10px; color: #2c3e50;">
                            No hay sesiones de grabación disponibles
                        </h3>
                        <p style="color: #95a5a6; max-width: 500px; margin: 0 auto; line-height: 1.6;">
                            Inicia una grabación para crear tu primera sesión.<br>
                            Las sesiones se organizan automáticamente por fecha de grabación.
                        </p>
                    </div>
                `}
            </div>
        `;
        
        container.innerHTML = html;
        
        // Configurar eventos de galería
        if (typeof this.setupGalleryEventListeners === 'function') {
            this.setupGalleryEventListeners();
        }
        
        console.log('✅ renderVideosList() completado');
    }

    renderSessionsList() {
        const container = this.elements.videosList;
        if (!container) return;
        
        if (this.state.videos.length === 0) {
            // Mantener el mensaje actual de vacío
            this.renderEmptyState();
            return;
        }
        
        // Agrupar videos por sesión
        const sessions = this.groupVideosBySession(this.state.videos);
        
        // Ordenar sesiones por fecha (más reciente primero)
        sessions.sort((a, b) => b.dateRange.max - a.dateRange.max);
        
        let html = '<div class="sessions-container">';
        
        sessions.forEach(session => {
            const isExpanded = session.expanded;
            const totalDuration = this.formatTime(session.totalDuration);
            const totalSizeMB = Math.round(session.totalSize / (1024 * 1024));
            const avgDuration = this.formatTime(session.totalDuration / session.videoCount);
            
            const minDate = new Date(session.dateRange.min);
            const maxDate = new Date(session.dateRange.max);
            const dateStr = session.dateRange.min === session.dateRange.max 
                ? minDate.toLocaleDateString('es-ES')
                : `${minDate.toLocaleDateString('es-ES')} - ${maxDate.toLocaleDateString('es-ES')}`;
            
            html += `
                <div class="session-item" data-session="${session.name}">
                    <div class="session-header ${isExpanded ? 'expanded' : ''}" 
                        onclick="dashcamApp.toggleSession('${session.name}')">
                        <div class="session-title">
                            <span class="session-icon">${isExpanded ? '📂' : '📁'}</span>
                            <span>${this.escapeHTML(session.name)}</span>
                            <span class="session-badge">${session.videoCount} videos</span>
                        </div>
                        <div class="session-info">
                            <span>⏱️ ${totalDuration}</span>
                            <span>💾 ${totalSizeMB} MB</span>
                            <span>📅 ${dateStr}</span>
                        </div>
                        <div class="session-actions">
                            <button class="session-action-btn export-session-btn" 
                                    onclick="event.stopPropagation(); dashcamApp.exportSession('${session.name}')"
                                    title="Exportar toda la sesión como ZIP">
                                📦 Exportar ZIP
                            </button>
                            <button class="session-action-btn" 
                                    onclick="event.stopPropagation(); dashcamApp.selectSession('${session.name}')">
                                ${session.selected ? '❌ Deseleccionar' : '✅ Seleccionar'}
                            </button>
                        </div>
                    </div>
                    
                    <div class="session-videos ${isExpanded ? 'expanded' : ''}">
            `;
            
            if (isExpanded) {
                session.videos.forEach(video => {
                    html += this.renderVideoItem(video);
                });
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Configurar eventos
        this.setupGalleryEventListeners();
    }

    renderVideoItem(video) {
        const date = new Date(video.timestamp);
        const sizeMB = video.size ? Math.round(video.size / (1024 * 1024)) : 0;
        const duration = this.formatTime(video.duration || 0);
        const dateStr = date.toLocaleDateString('es-ES');
        const timeStr = date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
        const location = video.location || 'app';
        const format = video.format || 'mp4';
        const normalizedId = this.normalizeId(video.id);
        
        let locationIcon, locationText, locationClass;
        if (video.source === 'filesystem' || video.isPhysical || 
            location === 'localFolder' || location === 'desktop_folder' || location === 'ios_local') {
            locationIcon = '📂';
            locationText = 'Carpeta Local';
            locationClass = 'local-file';
        } else {
            locationIcon = '📱';
            locationText = 'App';
            locationClass = 'app-file';
        }
        
        return `
            <div class="file-item video-file ${locationClass} ${this.state.selectedVideos.has(normalizedId) ? 'selected' : ''}" 
                data-id="${video.id}" 
                data-session="${video.session || ''}"
                data-type="video"
                data-location="${location}"
                data-format="${format}"
                data-source="${video.source || 'app'}">
                <div class="file-header">
                    <div class="file-title">${this.escapeHTML(video.title || video.filename || 'Grabación')}</div>
                    <div class="file-location" title="${locationText}">${locationIcon}</div>
                    <div class="file-format" data-format="${format}">${format.toUpperCase()}</div>
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
                        <input type="checkbox" ${this.state.selectedVideos.has(normalizedId) ? 'checked' : ''}>
                        <span>Seleccionar</span>
                    </div>
                    <button class="play-btn" data-id="${video.id}" title="Reproducir">
                        ▶️ Reproducir
                    </button>
                </div>
            </div>
        `;
    }

    // Agregar al módulo de Galería o crear nuevo módulo "SESIONES"

    groupVideosBySession(videos) {
        const sessions = {};
        
        videos.forEach(video => {
            let sessionName = video.session || 'Sesión sin nombre';
            
            if (!sessionName || sessionName === 'null' || sessionName === 'undefined') {
                const date = new Date(video.timestamp);
                sessionName = `Sesión ${date.toLocaleDateString('es-ES')}`;
            }
            
            if (!sessions[sessionName]) {
                sessions[sessionName] = {
                    name: sessionName,
                    videos: [],
                    // Usar el estado actual de expandedSessions
                    expanded: this.state.expandedSessions ? this.state.expandedSessions.has(sessionName) : false,
                    selected: this.state.selectedSessions ? this.state.selectedSessions.has(sessionName) : false,
                    totalDuration: 0,
                    totalSize: 0,
                    videoCount: 0,
                    dateRange: { min: Infinity, max: 0 }
                };
            }
            
            sessions[sessionName].videos.push(video);
            sessions[sessionName].videoCount++;
            sessions[sessionName].totalDuration += (video.duration || 0);
            sessions[sessionName].totalSize += (video.size || 0);
            
            const timestamp = video.timestamp || Date.now();
            if (timestamp < sessions[sessionName].dateRange.min) {
                sessions[sessionName].dateRange.min = timestamp;
            }
            if (timestamp > sessions[sessionName].dateRange.max) {
                sessions[sessionName].dateRange.max = timestamp;
            }
        });
        
        return Object.values(sessions);
    }
    
    // Función para expandir todas las sesiones
    expandAllSessions() {
        console.log('📂 Expandiendo todas las sesiones');
        const sessions = this.groupVideosBySession(this.state.videos);
        this.state.expandedSessions = new Set(sessions.map(s => s.name));
        this.renderVideosList();
    }
    
    // Función para colapsar todas las sesiones
    collapseAllSessions() {
        console.log('📁 Colapsando todas las sesiones');
        this.state.expandedSessions = new Set();
        this.renderVideosList();
    }

    toggleSession(sessionName) {
        console.log(`🔄 toggleSession llamado para: ${sessionName}`);



console.log('=== DEBUG toggleSession ===');
console.log('1. Función llamada con sessionName:', sessionName);
console.log('2. expandedSessions antes:', Array.from(this.state.expandedSessions || []));
console.log('3. dashcamApp disponible en window?', !!window.dashcamApp);
        
        // Obtener estado actual
        const currentExpanded = new Set(this.state.expandedSessions);
        
        if (currentExpanded.has(sessionName)) {
            // Si ya está expandida, colapsarla
            currentExpanded.delete(sessionName);
            console.log(`📁 Colapsando sesión: ${sessionName}`);
        } else {
            // Si está colapsada, expandirla
            currentExpanded.add(sessionName);
            console.log(`📂 Expandiendo sesión: ${sessionName}`);
        }
        
        // Actualizar estado
        this.state.expandedSessions = currentExpanded;
        
        // Volver a renderizar
        this.renderVideosList();

console.log('4. expandedSessions después:', Array.from(this.state.expandedSessions || []));

    }
    
    // Función para seleccionar/deseleccionar sesión
    toggleSelectSession(sessionName) {
        console.log(`✅ toggleSelectSession llamado para: ${sessionName}`);
        
        // Obtener videos de esta sesión
        const sessions = this.groupVideosBySession(this.state.videos);
        const session = sessions.find(s => s.name === sessionName);
        
        if (!session) return;
        
        // Verificar si la sesión ya está seleccionada
        const sessionSelected = this.state.selectedSessions.has(sessionName);
        
        if (sessionSelected) {
            // Deseleccionar todos los videos de esta sesión
            session.videos.forEach(video => {
                this.state.selectedVideos.delete(this.normalizeId(video.id));
            });
            this.state.selectedSessions.delete(sessionName);
            console.log(`❌ Deseleccionada sesión: ${sessionName}`);
        } else {
            // Seleccionar todos los videos de esta sesión
            session.videos.forEach(video => {
                this.state.selectedVideos.add(this.normalizeId(video.id));
            });
            this.state.selectedSessions.add(sessionName);
            console.log(`✅ Seleccionada sesión: ${sessionName} (${session.videos.length} videos)`);
        }
        
        // Volver a renderizar
        this.renderVideosList();
        this.updateGalleryActions();
    }

    // Función expandir todas las sesiones
    expandAllSessions() {
        const sessions = this.groupVideosBySession(this.state.videos);
        this.state.expandedSessions = new Set(sessions.map(s => s.name));
        this.renderVideosList();
    }

    // Función colapsar todas las sesiones
    collapseAllSessions() {
        this.state.expandedSessions = new Set();
        this.renderVideosList();
    }


    selectSession(sessionName) {
        const sessions = this.groupVideosBySession(this.state.videos);
        const session = sessions.find(s => s.name === sessionName);
        
        if (session) {
            session.selected = !session.selected;
            
            if (session.selected) {
                // Seleccionar todos los videos de la sesión
                session.videos.forEach(video => {
                    this.state.selectedVideos.add(this.normalizeId(video.id));
                });
            } else {
                // Deseleccionar todos
                session.videos.forEach(video => {
                    this.state.selectedVideos.delete(this.normalizeId(video.id));
                });
            }
            
            this.renderSessionsList();
            this.updateGalleryActions();
        }
    }

    async exportSession(sessionName) {
        try {
            // Filtrar videos de la sesión específica
            const sessionVideos = this.state.videos.filter(video => {
                let videoSessionName = video.session || 'Sesión sin nombre';
                
                // Para videos sin sesión, crear un nombre basado en fecha
                if (!video.session) {
                    const date = new Date(video.timestamp);
                    videoSessionName = `Sesión ${date.toLocaleDateString('es-ES')}`;
                }
                
                return videoSessionName === sessionName;
            });
            
            if (sessionVideos.length === 0) {
                this.showNotification(`❌ No hay videos en la sesión: ${sessionName}`);
                return;
            }
            
            this.showNotification(`📦 Preparando ZIP para sesión: ${sessionName} (${sessionVideos.length} videos)`);
            this.showSavingStatus(`Generando ZIP...`);
            
            // Verificar si JSZip está disponible
            if (typeof JSZip === 'undefined') {
                console.error('❌ JSZip no está cargado');
                this.showNotification('❌ Error: JSZip no disponible');
                this.hideSavingStatus();
                return;
            }
            
            const zip = new JSZip();
            const sessionFolder = zip.folder(this.cleanFileName(sessionName));
            
            let addedFiles = 0;
            let failedFiles = 0;
            
            // Añadir cada video al ZIP
            for (const video of sessionVideos) {
                try {
                    let blob = null;
                    
                    // Intentar obtener el blob del video
                    if (video.blob) {
                        // El blob ya está disponible en memoria
                        blob = video.blob;
                    } else if (video.fileHandle) {
                        // Es un archivo físico, leerlo
                        const file = await video.fileHandle.getFile();
                        blob = file;
                    } else if (this.db) {
                        // Buscar en la base de datos
                        const storedVideo = await this.getFromStore('videos', video.id);
                        blob = storedVideo?.blob;
                    }
                    
                    if (blob) {
                        // Crear nombre de archivo seguro
                        const safeName = this.cleanFileName(video.filename || `${video.title || 'video'}.${video.format || 'mp4'}`);
                        const filename = `${safeName}`;
                        
                        // Convertir blob a array buffer para JSZip
                        const arrayBuffer = await blob.arrayBuffer();
                        
                        // Añadir al ZIP
                        sessionFolder.file(filename, arrayBuffer);
                        addedFiles++;
                        
                        console.log(`✅ Añadido al ZIP: ${filename} (${Math.round(blob.size / (1024 * 1024))} MB)`);
                        
                        // Actualizar progreso
                        if (addedFiles % 3 === 0) {
                            this.showSavingStatus(`Generando ZIP... ${addedFiles}/${sessionVideos.length} videos`);
                        }
                    } else {
                        console.warn(`⚠️ No se pudo obtener blob para: ${video.filename || video.id}`);
                        failedFiles++;
                    }
                    
                } catch (error) {
                    console.error(`❌ Error procesando ${video.filename}:`, error);
                    failedFiles++;
                }
            }
            
            if (addedFiles === 0) {
                this.showNotification('❌ No se pudo obtener ningún video para exportar');
                this.hideSavingStatus();
                return;
            }
            
            // Opcional: añadir un archivo README con información de la sesión
            const sessionInfo = `
    SESIÓN DE GRABACIÓN: ${sessionName}
    ===========================================

    Fecha de exportación: ${new Date().toLocaleString('es-ES')}
    Total de videos: ${sessionVideos.length}
    Videos exportados: ${addedFiles}
    Videos fallados: ${failedFiles}

    DETALLES DE LA SESIÓN:
    -------------------
    - Videos en sesión: ${sessionVideos.length}
    - Duración total: ${this.formatTime(sessionVideos.reduce((sum, v) => sum + (v.duration || 0), 0))}
    - Tamaño total: ${Math.round(sessionVideos.reduce((sum, v) => sum + (v.size || 0), 0) / (1024 * 1024))} MB

    LISTA DE VIDEOS:
    ----------------
    ${sessionVideos.map((v, i) => 
        `${i + 1}. ${v.filename || 'video'} - ${this.formatTime(v.duration || 0)} - ${Math.round((v.size || 0) / (1024 * 1024))} MB`
    ).join('\n')}

    EXPORTADO CON:
    --------------
    Dashcam App PWA v${this.state.appVersion}
    ${window.location.origin}
            `;
            
            sessionFolder.file('README.txt', sessionInfo);
            
            // Generar el archivo ZIP
            console.log(`📦 Generando archivo ZIP...`);
            this.showSavingStatus('Finalizando ZIP...');
            
            const zipBlob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });
            
            // Crear nombre de archivo seguro
            const safeSessionName = this.cleanFileName(sessionName);
            const zipFilename = `${safeSessionName}_${new Date().toISOString().slice(0, 10)}.zip`;
            
            // Descargar el ZIP
            this.downloadBlob(zipBlob, zipFilename);
            
            this.hideSavingStatus();
            this.showNotification(`✅ Sesión "${sessionName}" exportada como ZIP (${addedFiles} videos, ${Math.round(zipBlob.size / (1024 * 1024))} MB)`);
            
            // Log para depuración
            console.log(`✅ ZIP generado exitosamente:`, {
                session: sessionName,
                videos: addedFiles,
                sizeMB: Math.round(zipBlob.size / (1024 * 1024)),
                filename: zipFilename
            });
            
        } catch (error) {
            console.error('❌ Error exportando sesión:', error);
            this.hideSavingStatus();
            this.showNotification('❌ Error al exportar sesión');
        }
    }

    async exportAllSessions() {
        try {
            // Agrupar videos por sesión
            const sessions = this.groupVideosBySession(this.state.videos);
            
            if (sessions.length === 0) {
                this.showNotification('❌ No hay sesiones para exportar');
                return;
            }
            
            // Preguntar confirmación si son muchas sesiones
            if (sessions.length > 3) {
                const confirmExport = confirm(
                    `¿Exportar TODAS las sesiones (${sessions.length} sesiones, ${this.state.videos.length} videos)?\n\n` +
                    `Esto puede tomar varios minutos y generar un archivo grande.\n` +
                    `¿Continuar?`
                );
                
                if (!confirmExport) {
                    return;
                }
            }
            
            this.showNotification(`📦 Preparando exportación de ${sessions.length} sesiones...`);
            this.showSavingStatus(`Preparando exportación masiva...`);
            
            // Verificar si JSZip está disponible
            if (typeof JSZip === 'undefined') {
                console.error('❌ JSZip no está cargado');
                this.showNotification('❌ Error: JSZip no disponible');
                this.hideSavingStatus();
                return;
            }
            
            const masterZip = new JSZip();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
            const masterZipName = `Dashcam_Export_${timestamp}`;
            
            let totalVideosAdded = 0;
            let totalSessionsAdded = 0;
            
            // Procesar cada sesión
            for (const session of sessions) {
                try {
                    const sessionVideos = this.state.videos.filter(video => {
                        let videoSessionName = video.session || 'Sesión sin nombre';
                        
                        if (!video.session) {
                            const date = new Date(video.timestamp);
                            videoSessionName = `Sesión ${date.toLocaleDateString('es-ES')}`;
                        }
                        
                        return videoSessionName === session.name;
                    });
                    
                    if (sessionVideos.length === 0) continue;
                    
                    console.log(`📦 Procesando sesión: ${session.name} (${sessionVideos.length} videos)`);
                    this.showSavingStatus(`Procesando sesión ${totalSessionsAdded + 1}/${sessions.length}...`);
                    
                    // Crear un ZIP para esta sesión individual
                    const sessionZip = new JSZip();
                    const sessionFolder = sessionZip.folder(this.cleanFileName(session.name));
                    
                    let sessionVideosAdded = 0;
                    
                    // Añadir videos a la sesión
                    for (const video of sessionVideos) {
                        try {
                            let blob = null;
                            
                            if (video.blob) {
                                blob = video.blob;
                            } else if (video.fileHandle) {
                                const file = await video.fileHandle.getFile();
                                blob = file;
                            } else if (this.db) {
                                const storedVideo = await this.getFromStore('videos', video.id);
                                blob = storedVideo?.blob;
                            }
                            
                            if (blob) {
                                const safeName = this.cleanFileName(video.filename || `${video.title || 'video'}.${video.format || 'mp4'}`);
                                const arrayBuffer = await blob.arrayBuffer();
                                
                                sessionFolder.file(safeName, arrayBuffer);
                                sessionVideosAdded++;
                                totalVideosAdded++;
                            }
                            
                        } catch (error) {
                            console.warn(`⚠️ Error con video ${video.filename}:`, error);
                        }
                    }
                    
                    if (sessionVideosAdded > 0) {
                        // Añadir archivo README a la sesión
                        const sessionInfo = `
    SESIÓN: ${session.name}
    ===========================

    Videos: ${sessionVideosAdded}
    Duración total: ${this.formatTime(session.totalDuration)}
    Tamaño estimado: ${Math.round(session.totalSize / (1024 * 1024))} MB

    Exportado el: ${new Date().toLocaleString('es-ES')}
                        `;
                        
                        sessionFolder.file('_INFO_SESION.txt', sessionInfo);
                        
                        // Generar el ZIP de la sesión individual
                        const sessionZipBlob = await sessionZip.generateAsync({ 
                            type: 'blob',
                            compression: 'DEFLATE'
                        });
                        
                        // Añadir el ZIP de la sesión al ZIP maestro
                        const sessionZipFilename = `${this.cleanFileName(session.name)}.zip`;
                        masterZip.file(sessionZipFilename, sessionZipBlob);
                        
                        totalSessionsAdded++;
                        
                        console.log(`✅ Sesión añadida al export: ${session.name}`);
                    }
                    
                } catch (error) {
                    console.error(`❌ Error procesando sesión ${session.name}:`, error);
                }
            }
            
            if (totalSessionsAdded === 0) {
                this.showNotification('❌ No se pudo exportar ninguna sesión');
                this.hideSavingStatus();
                return;
            }
            
            // Añadir archivo README maestro
            const masterReadme = `
    EXPORTACIÓN COMPLETA DASHCAM APP
    ===========================================

    Fecha de exportación: ${new Date().toLocaleString('es-ES')}
    Total de sesiones exportadas: ${totalSessionsAdded}
    Total de videos exportados: ${totalVideosAdded}

    SESIONES INCLUIDAS:
    -------------------
    ${sessions.slice(0, totalSessionsAdded).map((s, i) => 
        `${i + 1}. ${s.name} - ${s.videoCount} videos - ${this.formatTime(s.totalDuration)}`
    ).join('\n')}

    INSTRUCCIONES:
    -------------
    1. Extrae este archivo ZIP
    2. Cada sesión está en un archivo ZIP individual
    3. Extrae cada sesión para acceder a los videos

    EXPORTADO CON:
    --------------
    Dashcam App PWA v${this.state.appVersion}
    ${window.location.origin}
            `;
            
            masterZip.file('README_COMPLETO.txt', masterReadme);
            
            // Generar el ZIP maestro
            console.log('📦 Generando ZIP maestro...');
            this.showSavingStatus('Generando archivo final...');
            
            const masterZipBlob = await masterZip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });
            
            // Descargar el ZIP maestro
            const finalFilename = `${masterZipName}.zip`;
            this.downloadBlob(masterZipBlob, finalFilename);
            
            this.hideSavingStatus();
            this.showNotification(`✅ Exportación completa: ${totalSessionsAdded} sesiones, ${totalVideosAdded} videos (${Math.round(masterZipBlob.size / (1024 * 1024))} MB)`);
            
            console.log('✅ Exportación masiva completada:', {
                sessions: totalSessionsAdded,
                videos: totalVideosAdded,
                sizeMB: Math.round(masterZipBlob.size / (1024 * 1024)),
                filename: finalFilename
            });
            
        } catch (error) {
            console.error('❌ Error en exportación masiva:', error);
            this.hideSavingStatus();
            this.showNotification('❌ Error en exportación masiva');
        }
    }

    // Función auxiliar para limpiar nombres de archivo
    cleanFileName(filename) {
        if (!filename) return 'archivo';
        
        // Reemplazar caracteres problemáticos
        return filename
            .replace(/[<>:"/\\|?*]/g, '_')  // Caracteres no permitidos en Windows
            .replace(/\s+/g, '_')           // Espacios por guiones bajos
            .replace(/[^\w.\-]/g, '')       // Solo caracteres alfanuméricos, puntos y guiones
            .substring(0, 100);             // Limitar longitud
    }

    async exportSelectedSessions() {
        const sessions = this.groupVideosBySession(this.state.videos);
        const selectedSessions = sessions.filter(session => session.selected);
        
        if (selectedSessions.length === 0) {
            this.showNotification('❌ No hay sesiones seleccionadas');
            return;
        }
        
        for (const session of selectedSessions) {
            await this.exportSession(session.name);
        }
    }

    setupGalleryEventListeners() {
        const container = this.elements.videosList;
        if (!container) return;
        
        console.log('🔄 Configurando eventos para', container.querySelectorAll('.file-item').length, 'videos');
        
        container.querySelectorAll('.file-item').forEach(item => {
            // Click en el item (excepto en botones y checkboxes)
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.play-btn') && !(e.target.type === 'checkbox')) {
                    const id = item.dataset.id;
                    this.toggleSelection(id, 'video');
                }
            });
            
            // Checkbox
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = item.dataset.id;
                    this.toggleSelection(id, 'video');
                });
            }
            
            // Botón de reproducir
            const playBtn = item.querySelector('.play-btn');
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const id = item.dataset.id;
                    console.log('▶️ Clic en botón reproducir, ID:', id, 'Tipo:', typeof id);
                    
                    // Buscar video en el estado
                    const video = this.findVideoInState(id);
                    if (video) {
                        console.log('✅ Video encontrado en estado, reproduciendo...');
                        this.playVideoFromCurrentLocation(id);
                    } else {
                        console.error('❌ Video no encontrado en estado');
                        console.error('ID buscado:', id);
                        console.error('IDs disponibles:', this.state.videos.map(v => v.id));
                        this.showNotification('❌ Video no disponible');
                    }
                });
            }
        });
    }
    // Añade esta función para buscar videos correctamente
    findVideoInState(id) {
        console.log('🔍 Buscando video en estado con ID:', id, 'Tipo:', typeof id);
        console.log('📊 Videos disponibles:', this.state.videos.length);
        
        if (!id) {
            console.error('❌ ID vacío recibido');
            return null;
        }
        
        // Normalizar ID
        const normalizedSearchId = this.normalizeId(id);
        console.log('🔍 ID normalizado para búsqueda:', normalizedSearchId);
        
        // Primero buscar por ID exacto
        let video = this.state.videos.find(v => {
            const videoId = this.normalizeId(v.id);
            return videoId === normalizedSearchId;
        });
        
        if (!video) {
            // Buscar por comparación flexible
            video = this.state.videos.find(v => {
                const videoId = this.normalizeId(v.id);
                return videoId == normalizedSearchId; // Comparación con == para tipos diferentes
            });
        }
        
        if (!video) {
            // Buscar por ID string en número
            const numId = Number(id);
            if (!isNaN(numId)) {
                video = this.state.videos.find(v => {
                    const videoId = this.normalizeId(v.id);
                    return videoId === numId;
                });
            }
        }
        
        if (video) {
            console.log('✅ Video encontrado:', {
                id: video.id,
                filename: video.filename,
                title: video.title,
                hasBlob: !!video.blob
            });
        } else {
            console.error('❌ Video NO encontrado');
            console.error('IDs disponibles:', this.state.videos.map(v => ({id: v.id, filename: v.filename})));
        }
        
        return video;
    }

    async playVideoFromCurrentLocation(videoId) {
        try {
            console.log('🎬 Reproduciendo video desde ubicación actual:', this.state.viewMode);
            console.log('📊 Videos disponibles en estado:', this.state.videos.length);
            console.log('ID recibido:', videoId, 'Tipo:', typeof videoId);
            
            // Buscar video usando la función mejorada
            const video = this.findVideoInState(videoId);
            
            if (!video) {
                console.error('❌ Video no encontrado en estado actual');
                
                // Intentar cargar desde la base de datos si es modo "default"
                if (this.state.viewMode === 'default' && this.db) {
                    console.log('📱 Intentando cargar desde base de datos...');
                    const idToSearch = this.normalizeId(videoId);
                    const dbVideo = await this.getFromStore('videos', idToSearch);
                    
                    if (dbVideo) {
                        // Asegurar que tenga título y filename
                        dbVideo.title = dbVideo.title || `Grabación ${new Date(dbVideo.timestamp).toLocaleString('es-ES')}`;
                        dbVideo.filename = dbVideo.filename || `grabacion_${dbVideo.id}.mp4`;
                        
                        // Llamar a playVideo con el video de la BD
                        await this.playVideo(dbVideo);
                        return;
                    }
                }
                
                this.showNotification('❌ Video no disponible');
                return;
            }
            
            // Verificar que el video tenga los datos mínimos necesarios
            if (!video.blob) {
                console.error('❌ Video no tiene blob');
                this.showNotification('❌ Video dañado o no disponible');
                return;
            }
            
            // Asegurar título y filename
            if (!video.title) {
                video.title = `Grabación ${new Date(video.timestamp).toLocaleString('es-ES')}`;
            }
            if (!video.filename) {
                video.filename = `grabacion_${video.id}.${video.format || 'mp4'}`;
            }
            
            console.log('✅ Video válido encontrado, reproduciendo...');
            await this.playVideo(video);
            
        } catch (error) {
            console.error('❌ Error reproduciendo video:', error);
            this.showNotification('❌ Error al reproducir');
        }
    }

    // Función helper para identificar IDs locales
    isLocalId(id) {
        return typeof id === 'string' && id.startsWith('local_');
    }

    async playVideo(video) {
        try {
            console.log('🎬 Reproduciendo video:', video);
            console.log('🎬 Nombre del video:', video.filename);
            console.log('🎬 ID del video:', video.id);
            
            if (!video || !video.blob) {
                console.error('❌ Video o blob inválido en playVideo');
                console.error('Video:', video);
                this.showNotification('❌ Video no disponible para reproducción');
                return;
            }
            
            // EXTRAER METADATOS GPS DEL MP4 si es necesario
            if (!video.gpsTrack || video.gpsTrack.length === 0) {
                await this.extractGPSMetadataFromMP4(video);
            }
            
            this.state.currentVideo = video;
            
            // Crear URL del blob
            const videoUrl = URL.createObjectURL(video.blob);
            console.log('🎬 URL de video creada:', videoUrl.substring(0, 50) + '...');
            
            // Configurar elemento de video
            this.elements.playbackVideo.src = videoUrl;
            this.elements.videoTitle.textContent = video.title || video.filename || 'Grabación';
            
            const date = new Date(video.timestamp);
            const sizeMB = Math.round(video.size / (1024 * 1024));
            const duration = this.formatTime(video.duration || 0);
            const location = video.location || 'app';
            
            // Actualizar información en la UI
            this.elements.videoDate.textContent = date.toLocaleString('es-ES');
            this.elements.videoDuration.textContent = duration;
            this.elements.videoSize.textContent = `${sizeMB} MB`;
            this.elements.videoGpsPoints.textContent = video.gpsPoints || 0;
            
            // Determinar ubicación y mostrar icono apropiado
            let locationText = 'Almacenado en la app';
            let locationIcon = '📱';
            
            if (location === 'localFolder' || location === 'desktop_folder' || 
                video.source === 'filesystem' || video.isPhysical) {
                locationText = `Almacenado en carpeta local${video.session ? ` (${video.session})` : ''}`;
                locationIcon = '📂';
            }
            
            this.elements.locationIcon.textContent = locationIcon;
            this.elements.locationText.textContent = locationText;
            
            // ---- AÑADIR SELECTOR DE VELOCIDAD ----
            // Crear o actualizar el selector de velocidad
            this.createSpeedControl();
            
            // ---- FIN DE AÑADIDO ----
            
            // Limpiar mapa existente antes de inicializar uno nuevo
            this.cleanupMap();
            
            // Mostrar reproductor
            this.elements.videoPlayer.classList.remove('hidden');
            this.elements.videoPlayer.classList.add('mobile-view');
            
            // Inicializar mapa si hay datos GPS
            setTimeout(() => {
                if (video.gpsTrack && video.gpsTrack.length > 0) {
                    this.initLeafletMap();
                    console.log('🗺️ Inicializando mapa con', video.gpsTrack.length, 'puntos GPS');
                } else {
                    const mapContainer = this.elements.playbackMap;
                    if (mapContainer) {
                        mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ Este video no tiene datos GPS</span></div>';
                    }
                    console.log('⚠️ Video sin datos GPS para mostrar en mapa');
                }
            }, 300);
            
            // Configurar eventos de reproducción
            this.elements.playbackVideo.addEventListener('timeupdate', () => {
                this.updatePlaybackMap();
            });
            
            // Intentar reproducir automáticamente
            setTimeout(() => {
                this.elements.playbackVideo.play().catch(error => {
                    console.log('⚠️ No se pudo autoplay:', error.message);
                    // Mostrar controles para que el usuario pueda reproducir manualmente
                    this.elements.playbackVideo.controls = true;
                });
            }, 300);
            
        } catch (error) {
            console.error('❌ Error en playVideo:', error);
            this.showNotification('❌ Error al reproducir el video');
        }
    }

    // Añade esta función en el módulo de reproducción:
createSpeedControl() {
    // Verificar si ya existe el selector de velocidad
    let speedControl = document.getElementById('playbackSpeedControl');
    
    if (!speedControl) {
        // Crear el selector de velocidad
        speedControl = document.createElement('div');
        speedControl.id = 'playbackSpeedControl';
        speedControl.className = 'playback-speed-control integrated';
        speedControl.innerHTML = `
            <button type="button" class="speed-toggle-btn" title="Velocidad de reproducción">
                <span class="speed-icon">⏩</span>
                <span class="speed-value">1x</span>
            </button>
            <div class="speed-dropdown hidden">
                <div class="speed-options">
                    <button type="button" class="speed-option" data-speed="0.25">0.25x</button>
                    <button type="button" class="speed-option" data-speed="0.5">0.5x</button>
                    <button type="button" class="speed-option active" data-speed="1">Normal (1x)</button>
                    <button type="button" class="speed-option" data-speed="2">2x</button>
                    <button type="button" class="speed-option" data-speed="4">4x</button>
                    <button type="button" class="speed-option" data-speed="8">8x</button>
                    <button type="button" class="speed-option" data-speed="16">16x</button>
                </div>
            </div>
        `;
        
        // Buscar los controles nativos del video o su contenedor
        const videoElement = document.querySelector('#playbackVideo');
        
        if (videoElement) {
            // Opción 1: Intentar insertar en los controles nativos del video
            const nativeControls = videoElement.parentNode;
            
            // Crear un contenedor para controles personalizados si no existe
            let customControls = document.querySelector('.custom-video-controls');
            
            if (!customControls) {
                customControls = document.createElement('div');
                customControls.className = 'custom-video-controls';
                
                // Insertar después del video o en un lugar apropiado
                if (videoElement.nextSibling) {
                    videoElement.parentNode.insertBefore(customControls, videoElement.nextSibling);
                } else {
                    videoElement.parentNode.appendChild(customControls);
                }
            }
            
            // Añadir el control de velocidad a los controles personalizados
            customControls.appendChild(speedControl);
            
            // Asegurar que el video tenga controles nativos visibles
            videoElement.controls = true;
            
            // Opción alternativa: Insertar directamente en el contenedor del video
            // si ya hay otros controles personalizados
            const existingControls = videoElement.parentNode.querySelector('.video-controls, .control-bar');
            if (existingControls) {
                existingControls.appendChild(speedControl);
            }
        } else {
            // Fallback: Insertar en el modal del reproductor
            const modalContent = document.querySelector('#videoPlayerModal .modal-content') || 
                               document.querySelector('.modal-content');
            if (modalContent) {
                // Buscar o crear barra de controles
                let controlBar = modalContent.querySelector('.video-control-bar');
                if (!controlBar) {
                    controlBar = document.createElement('div');
                    controlBar.className = 'video-control-bar';
                    modalContent.appendChild(controlBar);
                }
                controlBar.appendChild(speedControl);
            }
        }
        
        // Configurar eventos para el control de velocidad
        this.setupSpeedControlEvents();
    }
    
    // Inicializar velocidad actual
    if (!this.currentPlaybackSpeed) {
        this.currentPlaybackSpeed = 1.0;
    }
}

// Nueva función para configurar los eventos del control de velocidad
setupSpeedControlEvents() {
    const speedToggle = document.querySelector('.speed-toggle-btn');
    const speedDropdown = document.querySelector('.speed-dropdown');
    const speedOptions = document.querySelectorAll('.speed-option');
    const speedValue = document.querySelector('.speed-value');
    
    if (!speedToggle || !speedDropdown) return;
    
    // Toggle del dropdown
    speedToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        speedDropdown.classList.toggle('hidden');
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!speedDropdown.contains(e.target) && !speedToggle.contains(e.target)) {
            speedDropdown.classList.add('hidden');
        }
    });
    
    // Seleccionar opción de velocidad
    speedOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const speed = parseFloat(e.target.dataset.speed);
            
            // Remover clase active de todas las opciones
            speedOptions.forEach(opt => opt.classList.remove('active'));
            
            // Añadir clase active a la opción seleccionada
            e.target.classList.add('active');
            
            // Actualizar botón toggle
            speedValue.textContent = speed === 1 ? '1x' : `${speed}x`;
            
            // Aplicar velocidad al video
            this.setPlaybackSpeed(speed);
            
            // Cerrar dropdown
            speedDropdown.classList.add('hidden');
        });
    });
    
    // Inicializar con velocidad actual
    if (this.currentPlaybackSpeed) {
        const currentOption = document.querySelector(`.speed-option[data-speed="${this.currentPlaybackSpeed}"]`);
        if (currentOption) {
            speedOptions.forEach(opt => opt.classList.remove('active'));
            currentOption.classList.add('active');
            speedValue.textContent = this.currentPlaybackSpeed === 1 ? '1x' : `${this.currentPlaybackSpeed}x`;
        }
    }
}

// Función para cambiar velocidad
setPlaybackSpeed(speed) {
    if (!this.elements.playbackVideo) return;
    
    // Validar velocidad
    const validSpeed = Math.max(0.25, Math.min(4.0, speed));
    
    // Aplicar velocidad
    this.elements.playbackVideo.playbackRate = validSpeed;
    
    // Guardar preferencia
    this.currentPlaybackSpeed = validSpeed;
    
    // Mostrar feedback
    console.log(`🎬 Velocidad de reproducción: ${validSpeed}x`);
}


    async cleanupLocalFilesDatabase() {
        try {
            console.log('🧹 Limpiando base de datos de archivos locales...');
            
            if (!this.db) return;
            
            const localFiles = await this.getAllFromStore('localFiles');
            console.log(`📊 Archivos locales en BD: ${localFiles.length}`);
            
            if (!this.localFolderHandle) {
                console.log('⚠️ No hay carpeta local para verificar');
                return;
            }
            
            let deletedCount = 0;
            let keptCount = 0;
            
            // Verificar cada archivo
            for (const file of localFiles) {
                try {
                    const fileName = file.filename || file.title;
                    
                    if (!fileName) {
                        // Sin nombre, eliminar
                        await this.deleteFromStore('localFiles', file.id);
                        deletedCount++;
                        continue;
                    }
                    
                    // Intentar encontrar el archivo físicamente
                    let exists = false;
                    
                    try {
                        // Buscar en raíz
                        await this.localFolderHandle.getFileHandle(fileName, { create: false });
                        exists = true;
                    } catch {
                        // Buscar en sesiones
                        if (file.session) {
                            try {
                                const sessionFolder = await this.localFolderHandle.getDirectoryHandle(file.session, { create: false });
                                await sessionFolder.getFileHandle(fileName, { create: false });
                                exists = true;
                            } catch {
                                exists = false;
                            }
                        }
                    }
                    
                    if (!exists) {
                        console.log(`🗑️ Eliminando archivo inexistente de BD: ${fileName}`);
                        await this.deleteFromStore('localFiles', file.id);
                        deletedCount++;
                    } else {
                        keptCount++;
                    }
                    
                } catch (error) {
                    console.warn(`⚠️ Error verificando archivo ${file.id}:`, error);
                    keptCount++;
                }
            }
            
            console.log(`✅ Limpieza completada: ${deletedCount} eliminados, ${keptCount} conservados`);
            
            if (deletedCount > 0) {
                this.showNotification(`🧹 Limpiados ${deletedCount} archivos inexistentes de la BD`);
            }
            
        } catch (error) {
            console.error('❌ Error limpiando base de datos local:', error);
        }
    }

    async syncPhysicalFilesWithDatabase() {
        try {
            console.log('🔄 Sincronizando archivos físicos con base de datos...');
            
            if (!this.localFolderHandle) return;
            
            // Escanear archivos físicos
            const physicalFiles = await this.scanLocalFolderForVideos();
            
            // Obtener archivos de la base de datos
            const dbFiles = await this.getAllFromStore('localFiles');
            
            // Buscar archivos físicos que no están en la BD
            const dbFilenames = dbFiles.map(f => f.filename).filter(Boolean);
            const newFiles = physicalFiles.filter(file => 
                !dbFilenames.includes(file.filename)
            );
            
            // Agregar nuevos archivos a la BD
            for (const file of newFiles) {
                if (file.filename) {
                    const fileRef = {
                        id: file.id || Date.now(),
                        filename: file.filename,
                        folderName: this.state.settings.localFolderName,
                        timestamp: file.timestamp || Date.now(),
                        size: file.size || 0,
                        location: 'localFolder',
                        session: file.session,
                        source: 'filesystem'
                    };
                    
                    await this.saveToDatabase('localFiles', fileRef);
                    console.log(`✅ Añadido a BD: ${file.filename}`);
                }
            }
            
            console.log(`🔄 Sincronización completada: ${newFiles.length} nuevos archivos añadidos a BD`);
            
        } catch (error) {
            console.error('❌ Error sincronizando archivos:', error);
        }
    }

    async extractGPSMetadataFromMP4(video) {
        try {
            console.log('📍 Extrayendo metadatos GPS del video...');
            
            // Si ya tiene datos GPS, no hacer nada
            if (video.gpsTrack && video.gpsTrack.length > 0) {
                console.log('✅ Video ya tiene datos GPS');
                return video.gpsTrack;
            }
            
            if (!video.blob) {
                console.log('⚠️ Video no tiene blob para extraer metadatos');
                return [];
            }
            
            // Leer el blob como texto para buscar metadatos
            const reader = new FileReader();
            
            return new Promise((resolve) => {
                reader.onload = (event) => {
                    try {
                        const arrayBuffer = event.target.result;
                        
                        // Convertir a texto para buscar JSON
                        const textDecoder = new TextDecoder('utf-8');
                        const tailSize = Math.min(100000, arrayBuffer.byteLength); // Últimos 100KB
                        const tailStart = arrayBuffer.byteLength - tailSize;
                        const tailData = new Uint8Array(arrayBuffer, tailStart, tailSize);
                        const tailText = textDecoder.decode(tailData);
                        
                        console.log('🔍 Buscando metadatos GPS en el video...');
                        
                        // Buscar marcador de metadatos
                        const markerIndex = tailText.lastIndexOf('GPXMETADATA:');
                        if (markerIndex !== -1) {
                            const jsonStart = markerIndex + 'GPXMETADATA:'.length;
                            const jsonText = tailText.substring(jsonStart);
                            
                            // Intentar parsear como JSON
                            try {
                                const metadata = JSON.parse(jsonText);
                                console.log('✅ Metadatos GPS encontrados:', metadata.gpsPoints, 'puntos');
                                
                                // Actualizar video con los metadatos extraídos
                                video.gpsTrack = metadata.track || [];
                                video.gpsPoints = metadata.gpsPoints || 0;
                                
                                // También agregar nombres de ubicación a cada punto
                                if (video.gpsTrack.length > 0) {
                                    this.addLocationNamesToTrack(video.gpsTrack);
                                }
                                
                                resolve(video.gpsTrack);
                                return;
                                
                            } catch (jsonError) {
                                console.warn('⚠️ Error parseando metadatos JSON:', jsonError);
                            }
                        }
                        
                        // También buscar marcador WebM
                        const webmMarkerIndex = tailText.lastIndexOf('WEBM_METADATA:');
                        if (webmMarkerIndex !== -1) {
                            const jsonStart = webmMarkerIndex + 'WEBM_METADATA:'.length;
                            const jsonText = tailText.substring(jsonStart);
                            
                            try {
                                const metadata = JSON.parse(jsonText);
                                console.log('✅ Metadatos GPS encontrados en WebM:', metadata.gpsPoints, 'puntos');
                                
                                video.gpsTrack = metadata.track || [];
                                video.gpsPoints = metadata.gpsPoints || 0;
                                
                                if (video.gpsTrack.length > 0) {
                                    this.addLocationNamesToTrack(video.gpsTrack);
                                }
                                
                                resolve(video.gpsTrack);
                                return;
                                
                            } catch (jsonError) {
                                console.warn('⚠️ Error parseando metadatos WebM JSON:', jsonError);
                            }
                        }
                        
                        console.log('ℹ️ No se encontraron metadatos GPS en el video');
                        resolve([]);
                        
                    } catch (error) {
                        console.warn('⚠️ Error procesando metadatos:', error);
                        resolve([]);
                    }
                };
                
                reader.onerror = () => {
                    console.warn('⚠️ Error leyendo archivo para extraer metadatos');
                    resolve([]);
                };
                
                // Leer todo el archivo (los metadatos están al final)
                reader.readAsArrayBuffer(video.blob);
            });
            
        } catch (error) {
            console.error('❌ Error en extractGPSMetadataFromMP4:', error);
            return [];
        }
    }

    async migrateIOSVideoToWindows(video) {
        try {
            console.log('🔄 Migrando video de iOS a Windows...');
            
            if (!video.blob) {
                console.error('❌ Video no tiene blob');
                return null;
            }
            
            // Leer el blob completo
            const arrayBuffer = await video.blob.arrayBuffer();
            const dataView = new DataView(arrayBuffer);
            
            // Buscar átomos MP4 que contengan metadatos GPS
            let gpsData = null;
            let videoData = null;
            
            // Buscar átomo 'moov' (contiene metadatos)
            for (let i = 0; i < arrayBuffer.byteLength - 8; i++) {
                const size = dataView.getUint32(i);
                const type = this.readString(arrayBuffer, i + 4, 4);
                
                if (type === 'moov') {
                    console.log('✅ Encontrado átomo moov en posición:', i);
                    videoData = await this.extractIOSMetadata(arrayBuffer.slice(i, i + size));
                    break;
                }
                
                // Saltar al siguiente átomo
                i += size - 1;
            }
            
            // Si no encontramos en MP4, buscar JSON al final (nuestro formato)
            if (!videoData) {
                const textDecoder = new TextDecoder('utf-8');
                const tailData = new Uint8Array(arrayBuffer.slice(-100000)); // Últimos 100KB
                const tailText = textDecoder.decode(tailData);
                
                // Buscar nuestros marcadores
                const gpxIndex = tailText.lastIndexOf('GPXMETADATA:');
                const webmIndex = tailText.lastIndexOf('WEBM_METADATA:');
                
                if (gpxIndex !== -1) {
                    const jsonText = tailText.substring(gpxIndex + 'GPXMETADATA:'.length);
                    try {
                        videoData = JSON.parse(jsonText);
                        console.log('✅ Encontrados metadatos GPS en marcador personalizado');
                    } catch (e) {}
                }
            }
            
            if (videoData && videoData.track) {
                console.log(`✅ Metadatos encontrados: ${videoData.track.length} puntos GPS`);
                
                // Recrear el video con metadatos en nuestro formato
                const cleanBlob = await this.removeOldMetadata(video.blob);
                const newBlob = await this.addGpsMetadataToMP4(cleanBlob, videoData.track);
                
                // Actualizar el video
                video.blob = newBlob;
                video.gpsTrack = videoData.track;
                video.gpsPoints = videoData.track.length;
                video.hasMetadata = true;
                
                console.log('✅ Video migrado exitosamente');
                return video;
            } else {
                console.log('⚠️ No se encontraron metadatos GPS en el video iOS');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error migrando video iOS:', error);
            return null;
        }
    }

    async checkAndMigrateIOSVideos() {
        try {
            console.log('🔍 Verificando videos iOS para migración...');
            
            let migratedCount = 0;
            let videosToUpdate = [];
            
            for (const video of this.state.videos) {
                // Si es un video de iOS sin metadatos GPS
                if ((video.source === 'filesystem' || video.isPhysical) && 
                    (!video.gpsTrack || video.gpsTrack.length === 0)) {
                    
                    console.log(`🔄 Verificando video iOS: ${video.filename}`);
                    
                    // Primero intentar extraer metadatos del video
                    const extractedTrack = await this.extractGPSMetadataFromMP4(video);
                    
                    if (extractedTrack && extractedTrack.length > 0) {
                        console.log(`✅ Metadatos extraídos: ${extractedTrack.length} puntos GPS`);
                        
                        // Actualizar el video con los metadatos extraídos
                        video.gpsTrack = extractedTrack;
                        video.gpsPoints = extractedTrack.length;
                        video.hasMetadata = true;
                        
                        migratedCount++;
                        videosToUpdate.push(video);
                        
                    } else {
                        // Si no se pudieron extraer, intentar migración completa
                        console.log('🔄 Intentando migración completa...');
                        const migrated = await this.migrateIOSVideoToWindows(video);
                        
                        if (migrated && migrated.gpsTrack && migrated.gpsTrack.length > 0) {
                            migratedCount++;
                            videosToUpdate.push(migrated);
                        }
                    }
                }
            }
            
            // Actualizar videos en el estado
            if (migratedCount > 0) {
                console.log(`✅ ${migratedCount} videos iOS procesados`);
                
                // Reemplazar videos en el estado
                this.state.videos = this.state.videos.map(video => {
                    const updatedVideo = videosToUpdate.find(v => v.id === video.id);
                    return updatedVideo || video;
                });
                
                this.showNotification(`✅ ${migratedCount} videos iOS procesados`);
                
                // Si estamos en la galería, actualizar la vista
                if (this.elements.galleryPanel && !this.elements.galleryPanel.classList.contains('hidden')) {
                    this.renderVideosList();
                }
            } else {
                console.log('ℹ️ No se encontraron videos iOS para migrar');
            }
            
        } catch (error) {
            console.error('❌ Error en verificación automática iOS:', error);
        }
    }

    // Helper para leer strings del array buffer
    readString(arrayBuffer, offset, length) {
        const bytes = new Uint8Array(arrayBuffer, offset, length);
        let str = '';
        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return str;
    }

    // Extraer metadatos de video iOS
    async extractIOSMetadata(moovData) {
        try {
            const textDecoder = new TextDecoder('utf-8');
            const text = textDecoder.decode(moovData);
            
            // Buscar datos GPS en formato iOS
            // iOS puede almacenar GPS en átomos '©xyz' o '©gps'
            const patterns = [
                /"gps":\s*(\[[^\]]+\])/,
                /"track":\s*(\[[^\]]+\])/,
                /"locations":\s*(\[[^\]]+\])/
            ];
            
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    try {
                        const trackData = JSON.parse(match[1]);
                        if (Array.isArray(trackData) && trackData.length > 0) {
                            console.log(`✅ Encontrados ${trackData.length} puntos GPS en formato iOS`);
                            return { track: trackData };
                        }
                    } catch (e) {}
                }
            }
            
            return null;
        } catch (error) {
            console.warn('⚠️ Error extrayendo metadatos iOS:', error);
            return null;
        }
    }

    // Remover metadatos antiguos
    async removeOldMetadata(blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const textDecoder = new TextDecoder('utf-8');
            const text = textDecoder.decode(arrayBuffer);
            
            // Buscar y remover nuestros marcadores
            const gpxIndex = text.lastIndexOf('GPXMETADATA:');
            const webmIndex = text.lastIndexOf('WEBM_METADATA:');
            
            let cleanData = arrayBuffer;
            
            if (gpxIndex !== -1) {
                console.log('🗑️ Removiendo marcador GPXMETADATA antiguo');
                cleanData = arrayBuffer.slice(0, gpxIndex);
            } else if (webmIndex !== -1) {
                console.log('🗑️ Removiendo marcador WEBM_METADATA antiguo');
                cleanData = arrayBuffer.slice(0, webmIndex);
            }
            
            return new Blob([cleanData], { type: blob.type });
        } catch (error) {
            console.warn('⚠️ Error removiendo metadatos antiguos:', error);
            return blob;
        }
    }
    // FUNCIÓN PARA AÑADIR NOMBRES DE UBICACIÓN:

    async addLocationNamesToTrack(gpsTrack) {
        if (!gpsTrack || gpsTrack.length === 0) return;
        
        console.log('🏙️ Añadiendo nombres de ubicación al track...');
        
        // Tomar muestras para no sobrecargar la API
        const samplePoints = [];
        const step = Math.max(1, Math.floor(gpsTrack.length / 10)); // 10 puntos máximo
        
        for (let i = 0; i < gpsTrack.length; i += step) {
            samplePoints.push(gpsTrack[i]);
        }
        
        // Procesar puntos en paralelo
        const promises = samplePoints.map(async (point, index) => {
            try {
                const locationName = await this.getLocationName(point.lat, point.lon);
                point.locationName = locationName;
                
                // Asignar el mismo nombre a puntos cercanos
                const startIdx = index * step;
                const endIdx = Math.min((index + 1) * step, gpsTrack.length);
                
                for (let j = startIdx; j < endIdx; j++) {
                    if (gpsTrack[j]) {
                        gpsTrack[j].locationName = locationName;
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error obteniendo ubicación para punto ${index}:`, error);
            }
        });
        
        await Promise.all(promises);
        console.log('✅ Nombres de ubicación añadidos al track');
    }




    initLeafletMap() {
        console.log('🗺️ Inicializando mapa Leaflet...');
        
        if (!this.state.currentVideo || !this.state.currentVideo.gpsTrack) {
            console.log('⚠️ No hay datos GPS para mostrar en el mapa');
            const mapContainer = document.getElementById('playbackMap');
            if (mapContainer) {
                mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ No hay datos GPS disponibles</span></div>';
            }
            return;
        }
        
        const mapContainer = document.getElementById('playbackMap');
        if (!mapContainer) {
            console.error('❌ No se encontró el contenedor del mapa');
            return;
        }
        
        // Limpiar contenido anterior
        mapContainer.innerHTML = '';
        
        const points = this.state.currentVideo.gpsTrack;
        if (points.length === 0) {
            console.log('⚠️ El track GPS está vacío');
            mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ No hay datos GPS para mostrar</span></div>';
            return;
        }
        
        // Verificar si Leaflet está disponible
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet no está cargado');
            mapContainer.innerHTML = '<div class="map-loading" style="color: #ff7675;"><span>❌ Error: Leaflet no está disponible</span></div>';
            return;
        }
        
        try {
            // Calcular centro y área del recorrido
            const bounds = this.calculateTrackBounds(points);
            const center = this.calculateTrackCenter(points);
            
            // Crear mapa Leaflet
            this.playbackMap = L.map('playbackMap', {
                center: center,
                zoom: 13,
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: false,
                dragging: !this.isIOS,
                tap: !this.isIOS,
                touchZoom: true,
                boxZoom: false,
                doubleClickZoom: true,
                keyboard: false
            });
            
            // Añadir capa de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
            }).addTo(this.playbackMap);
            
            // Dibujar la ruta
            const latLngs = points.map(point => [point.lat, point.lon]);
            
            // Crear línea para la ruta
            this.mapRouteLayer = L.polyline(latLngs, {
                color: '#00a8ff',
                weight: 4,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
            }).addTo(this.playbackMap);
            
            // Añadir marcador de inicio
            const startPoint = points[0];
            this.startMarker = L.marker([startPoint.lat, startPoint.lon]).addTo(this.playbackMap);
            this.startMarker.bindTooltip('📍 Punto de inicio', { direction: 'top' });
            
            // Añadir marcador de fin
            const endPoint = points[points.length - 1];
            this.endMarker = L.marker([endPoint.lat, endPoint.lon]).addTo(this.playbackMap);
            this.endMarker.bindTooltip('🏁 Punto final', { direction: 'top' });
            
            // Ajustar vista para mostrar toda la ruta
            this.playbackMap.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 16
            });
            
            // Forzar redibujado del mapa
            setTimeout(() => {
                if (this.playbackMap) {
                    this.playbackMap.invalidateSize();
                    console.log('✅ Mapa Leaflet inicializado correctamente');
                }
            }, 300);
            
            // Crear marcador de posición actual (será actualizado durante reproducción)
            if (points.length > 0) {
                const firstPoint = points[0];
                this.currentPositionMarker = L.marker([firstPoint.lat, firstPoint.lon], {
                    icon: L.divIcon({
                        className: 'current-position-marker',
                        iconSize: [16, 16],
                        html: '<div></div>'
                    }),
                    zIndexOffset: 1000
                }).addTo(this.playbackMap);
            }
            
        } catch (error) {
            console.error('❌ Error inicializando mapa Leaflet:', error);
            mapContainer.innerHTML = `
                <div class="map-loading" style="color: #ff7675;">
                    <span>❌ Error cargando mapa</span>
                    <br>
                    <small>${error.message}</small>
                </div>
            `;
        }
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
        // Limpiar mapa Leaflet
        this.cleanupMap();
        
        // Limpiar el contenedor del mapa
        const mapContainer = this.elements.playbackMap;
        if (mapContainer) {
            mapContainer.innerHTML = '<div class="map-loading"><span>🔄 Cargando mapa...</span></div>';
        }
        
        // Ocultar el panel
        if (this.elements.videoPlayer) {
            this.elements.videoPlayer.classList.add('hidden');
            this.elements.videoPlayer.classList.remove('mobile-view');
        }
        
        // Detener y limpiar el video
        if (this.elements.playbackVideo) {
            this.elements.playbackVideo.pause();
            
            // Liberar URL del blob para liberar memoria
            if (this.elements.playbackVideo.src && this.elements.playbackVideo.src.startsWith('blob:')) {
                URL.revokeObjectURL(this.elements.playbackVideo.src);
            }
            
            this.elements.playbackVideo.src = '';
            this.elements.playbackVideo.load();
        }
        
        // Limpiar datos del video actual
        this.state.currentVideo = null;
        
        console.log('🎬 Reproductor de video cerrado');
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
                console.log('✅ Video movido a carpeta local');
                
                // Si está configurado para NO mantener copia en app, eliminar
                if (!this.state.settings.keepAppCopy) {
                    await this.deleteFromStore('videos', video.id);
                    console.log('🗑️ Video eliminado de la app');
                    
                    // Cerrar reproductor si estaba abierto
                    this.hideVideoPlayer();
                }
                
                // Recargar galería
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
            const video = this.state.currentVideo;
            console.log('🗑️ DELETE_SINGLE_VIDEO:', {
                id: video.id,
                filename: video.filename,
                session: video.sessionName,
                isPhysical: video.isPhysical,
                protocol: window.location.protocol
            });
            
            let deletedFromFS = false;
            let deletedFromDB = false;
            
            // ===== VERIFICAR PROTOCOLO =====
            const isFileProtocol = window.location.protocol === 'file:';
            
            if (isFileProtocol) {
                console.warn('⚠️ Protocolo file:// detectado - Borrado físico DESHABILITADO');
                console.warn('⚠️ Para borrar archivos físicos, ejecuta desde http://localhost');
                deletedFromFS = false; // No se puede borrar en file://
            } else {
                // ===== BORRADO FÍSICO (solo si NO es file://) =====
                if (video.source === 'filesystem' || video.isPhysical || video.sessionName) {
                    console.log('📁 Intentando borrado físico...');
                    
                    // Usar deleteFileByPath que ya tienes
                    if (video.filename && video.sessionName) {
                        deletedFromFS = await this.deleteFileByPath(video.filename, video.sessionName);
                    } else if (video.filename) {
                        deletedFromFS = await this.deleteFileByPath(video.filename);
                    }
                }
            }
            
            // ===== BORRADO DE BASE DE DATOS (SIEMPRE) =====
            console.log('🗃️ Borrando de base de datos...');
            
            if (this.db) {
                await this.deleteFromStore('videos', video.id);
                deletedFromDB = true;
                console.log('✅ Borrado de IndexedDB');
            } else {
                const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
                const filteredVideos = videos.filter(v => v.id !== video.id);
                localStorage.setItem('dashcam_videos', JSON.stringify(filteredVideos));
                deletedFromDB = true;
                console.log('✅ Borrado de localStorage');
            }
            
            // ===== FEEDBACK AL USUARIO =====
            this.hideVideoPlayer();
            await this.loadGallery();
            
            if (isFileProtocol) {
                if (deletedFromDB) {
                    this.showNotification('📱 Video eliminado de la app (ejecuta desde localhost para borrar físicamente)');
                }
            } else {
                if (deletedFromFS && deletedFromDB) {
                    this.showNotification('🗑️ Video eliminado completamente');
                } else if (deletedFromDB) {
                    this.showNotification('📱 Video eliminado de la app (archivo físico no borrado)');
                } else {
                    this.showNotification('⚠️ Eliminación incompleta');
                }
            }
            
        } catch (error) {
            console.error('❌ Error en deleteSingleVideo:', error);
            this.showNotification('❌ Error al eliminar');
        }
    }

    async deleteFileByPath(filename, sessionName = null) {
        try {
            if (!this.localFolderHandle) {
                console.error('❌ No hay carpeta local seleccionada');
                return false;
            }
            
            console.log(`🗑️ Intentando borrar: ${sessionName ? `${sessionName}/` : ''}${filename}`);
            
            let folderHandle = this.localFolderHandle;
            
            // Navegar a la carpeta de sesión si existe
            if (sessionName) {
                try {
                    folderHandle = await this.localFolderHandle.getDirectoryHandle(sessionName, { create: false });
                    console.log(`📁 Accediendo a carpeta de sesión: ${sessionName}`);
                } catch (error) {
                    console.warn(`⚠️ Carpeta de sesión no encontrada: ${sessionName}`, error);
                    // Intentar borrar de la raíz
                    sessionName = null;
                }
            }
            
            // Verificar si el archivo existe
            try {
                const fileHandle = await folderHandle.getFileHandle(filename, { create: false });
                
                // Borrar el archivo
                if (fileHandle.remove) {
                    // File System Access API moderno
                    await fileHandle.remove();
                    console.log(`✅ Archivo borrado: ${filename}`);
                } else {
                    // API más antigua
                    await this.deletePhysicalFile(fileHandle);
                }
                
                // Limpiar carpeta vacía si es una sesión
                if (sessionName) {
                    await this.cleanupEmptyLocalFolders();
                }
                
                return true;
                
            } catch (error) {
                if (error.name === 'NotFoundError') {
                    console.warn(`⚠️ Archivo no encontrado: ${filename}`);
                    return false;
                }
                throw error;
            }
            
        } catch (error) {
            console.error(`❌ Error borrando archivo por ruta:`, error);
            return false;
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
        
        // FORZAR RECARGA de la galería
        console.log(`📍 Cambiando a vista: ${value}`);
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
        // Normalizar ID (convertir a número si es posible)
        const normalizedId = this.normalizeId(id);
        
        if (type === 'video') {
            if (this.state.selectedVideos.has(normalizedId)) {
                this.state.selectedVideos.delete(normalizedId);
            } else {
                this.state.selectedVideos.add(normalizedId);
            }
            this.renderVideosList();
        } else if (type === 'gpx') {
            if (this.state.selectedGPX.has(normalizedId)) {
                this.state.selectedGPX.delete(normalizedId);
            } else {
                this.state.selectedGPX.add(normalizedId);
            }
        }
        
        this.updateGalleryActions();
    }

    // Añade esta función helper
// ============ FUNCIONES HELPER PARA HTML ============

    // Función para normalizar IDs (números vs strings)
    normalizeId(id) {
        if (id === null || id === undefined) {
            return null;
        }
        
        // Si es un ID local (string que empieza con "local_"), mantenerlo como string
        if (typeof id === 'string') {
            if (id.startsWith('local_')) {
                return id;
            }
            // Si es un string numérico, convertirlo
            const numId = Number(id);
            return isNaN(numId) ? id : numId;
        }
        
        // Si es número, mantenerlo
        if (typeof id === 'number') {
            return id;
        }
        
        // Para cualquier otro tipo, intentar convertir a string
        return String(id);
    }

    // Función para escapar HTML y prevenir inyección XSS
    escapeHTML(text) {
        if (text === null || text === undefined) {
            return '';
        }
        
        // Convertir a string si no lo es
        const str = String(text);
        
        // Reemplazar caracteres especiales
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Función para buscar videos en el estado
    findVideoInState(id) {
        console.log('🔍 Buscando video en estado con ID:', id);
        console.log('📊 Videos en estado:', this.state.videos.length);
        
        // Normalizar el ID de búsqueda
        const normalizedSearchId = this.normalizeId(id);
        console.log('🔍 ID normalizado para búsqueda:', normalizedSearchId);
        
        // Primero buscar coincidencia exacta
        let video = this.state.videos.find(v => {
            const normalizedVideoId = this.normalizeId(v.id);
            const found = normalizedVideoId === normalizedSearchId;
            console.log(`🔍 Comparando "${normalizedVideoId}" === "${normalizedSearchId}" -> ${found}`);
            return found;
        });
        
        if (!video) {
            console.log('🔍 No encontrado con ===, intentando con ==');
            // Si no se encuentra, intentar comparación flexible
            video = this.state.videos.find(v => {
                const normalizedVideoId = this.normalizeId(v.id);
                const found = normalizedVideoId == normalizedSearchId;
                console.log(`🔍 Comparando "${normalizedVideoId}" == "${normalizedSearchId}" -> ${found}`);
                return found;
            });
        }
        
        if (video) {
            console.log('✅ Video encontrado en estado:', video.filename);
        } else {
            console.log('❌ Video NO encontrado en estado');
        }
        
        return video;
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
            this.elements.selectAllVideos.textContent = this.state.activeTab === 'videos' 
                ? 'Seleccionar todos' 
                : 'Seleccionar todos';
        }
        
        if (this.elements.deselectAllVideos) {
            this.elements.deselectAllVideos.disabled = !hasSelected;
            this.elements.deselectAllVideos.textContent = this.state.activeTab === 'videos'
                ? 'Deseleccionar todos'
                : 'Deseleccionar todos';
        }
        
        const exportBtn = document.getElementById('exportBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const moveToLocalBtn = document.getElementById('moveToLocalBtn');
        const combineVideosBtn = document.getElementById('combineVideosBtn');
        
        if (exportBtn) {
            exportBtn.disabled = !hasSelected;
            exportBtn.textContent = this.state.activeTab === 'videos' ? '📤 Exportar' : '📤 Exportar GPX';
        }
        
        if (deleteBtn) {
            deleteBtn.disabled = !hasSelected;
            deleteBtn.textContent = this.state.activeTab === 'videos' ? '🗑️ Eliminar' : '🗑️ Eliminar GPX';
        }
        
        if (moveToLocalBtn) {
            moveToLocalBtn.disabled = this.state.activeTab === 'gpx' || !hasSelected;
            moveToLocalBtn.style.display = this.state.activeTab === 'videos' ? 'block' : 'none';
        }
        
        if (combineVideosBtn) {
            combineVideosBtn.disabled = this.state.activeTab === 'gpx' || !hasSelected || this.state.selectedVideos.size < 2;
            combineVideosBtn.style.display = this.state.activeTab === 'videos' ? 'block' : 'none';
        }
    }

    selectAll(type = null) {
        const tabType = type || this.state.activeTab;
        
        if (tabType === 'videos') {
            this.state.selectedVideos.clear();
            this.state.videos.forEach(video => this.state.selectedVideos.add(video.id));
            this.renderVideosList();
        } else if (tabType === 'gpx') {
            this.state.selectedGPX.clear();
            this.state.gpxTracks.forEach(track => this.state.selectedGPX.add(track.id));
            this.renderGPXList();
        }
        
        this.updateSelectionButtons();
    }

    deselectAll(type = null) {
        const tabType = type || this.state.activeTab;
        
        if (tabType === 'videos') {
            this.state.selectedVideos.clear();
            this.renderVideosList();
        } else if (tabType === 'gpx') {
            this.state.selectedGPX.clear();
            this.renderGPXList();
        }
        
        this.updateSelectionButtons();
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

    // Estimación de duración basada en tamaño de archivo (último recurso)
    estimateDurationByFileSize(fileSize, format) {
        // Tabla de estimaciones (valores aproximados)
        const estimates = {
            'mp4': {
                '480p': 8000,  // 8 segundos por MB
                '720p': 5000,  // 5 segundos por MB
                '1080p': 3000, // 3 segundos por MB
                '4k': 1500     // 1.5 segundos por MB
            },
            'webm': {
                'default': 6000 // 6 segundos por MB
            }
        };
        
        const sizeMB = fileSize / (1024 * 1024);
        let secondsPerMB = 6000; // Valor por defecto
        
        if (format === 'mp4') {
            const quality = this.state.settings.videoQuality || '720p';
            secondsPerMB = estimates.mp4[quality] || estimates.mp4['720p'];
        } else {
            secondsPerMB = estimates.webm.default;
        }
        
        const estimatedMs = Math.round(sizeMB * secondsPerMB);
        console.log(`📏 Estimación por tamaño: ${sizeMB.toFixed(2)}MB × ${secondsPerMB}ms/MB = ${estimatedMs}ms`);
        
        return estimatedMs;
    }

    // ============ UTILIDADES ============

    formatTime(ms) {
        // Verificar si el valor es válido
        if (!ms || !isFinite(ms) || isNaN(ms) || ms === Infinity) {
            return '00:00';
        }
        
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
                console.log(`⚠️ Base de datos no disponible para ${storeName}`);
                resolve(null);
                return;
            }
            
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // Usar put() en lugar de add() para actualizar si ya existe
                const request = store.put(data);
                
                request.onsuccess = () => {
                    console.log(`✅ Guardado/Actualizado en ${storeName}:`, data.id || 'N/A');
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.warn(`⚠️ Error guardando en ${storeName}:`, request.error?.message);
                    
                    // Intentar con put() si add() falló por duplicado
                    if (request.error?.name === 'ConstraintError') {
                        console.log(`🔄 Intentando actualizar en ${storeName}...`);
                        const updateRequest = store.put(data);
                        updateRequest.onsuccess = () => {
                            console.log(`✅ Actualizado en ${storeName}:`, data.id || 'N/A');
                            resolve(updateRequest.result);
                        };
                        updateRequest.onerror = () => {
                            console.warn(`⚠️ Error actualizando en ${storeName}:`, updateRequest.error?.message);
                            resolve(null);
                        };
                    } else {
                        resolve(null);
                    }
                };
            } catch (error) {
                console.warn(`⚠️ Excepción guardando en ${storeName}:`, error.message);
                resolve(null);
            }
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
                console.log(`⚠️ Base de datos no inicializada para ${storeName}`);
                resolve(null);
                return;
            }
            
            // Verificar si el store existe
            if (!this.db.objectStoreNames.contains(storeName)) {
                console.warn(`⚠️ Store ${storeName} no existe`);
                resolve(null);
                return;
            }
            
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => {
                    console.warn(`⚠️ Error obteniendo de ${storeName}:`, request.error);
                    resolve(null);
                };
            } catch (error) {
                console.error(`❌ Excepción en getFromStore ${storeName}:`, error);
                resolve(null);
            }
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
            const normalizedId = this.normalizeId(gpx.id || index);
            const isSelected = this.state.selectedGPX.has(normalizedId);
            
            // Icono según ubicación
            let locationIcon = '📱';
            let locationText = 'App';
            let locationClass = 'app-file';
            if (location === 'localFolder' || source === 'filesystem') {
                locationIcon = '📂';
                locationText = 'Local';
                locationClass = 'local-file';
            }
            
            // Información específica según fuente
            let detailsHTML = '';
            if (gpx.points) {
                detailsHTML += `<div>📍 ${gpx.points} puntos</div>`;
            }
            if (gpx.path) {
                detailsHTML += `<div>📁 ${gpx.path}</div>`;
            }
            if (gpx.distance) {
                detailsHTML += `<div>📏 ${gpx.distance.toFixed(2)} km</div>`;
            }
            
            html += `
                <div class="file-item gpx-file ${locationClass} ${isSelected ? 'selected' : ''}" 
                    data-id="${gpx.id || index}" 
                    data-type="gpx"
                    data-location="${location}"
                    data-source="${source}">
                    <div class="file-header">
                        <div class="file-title">${gpx.title || gpx.filename || 'Archivo GPX'}</div>
                        <div class="file-location" title="${locationText}">${locationIcon}</div>
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
                        <div class="file-checkbox">
                            <input type="checkbox" ${isSelected ? 'checked' : ''}>
                            <span>Seleccionar</span>
                        </div>
                        <button class="play-btn view-gpx" data-id="${gpx.id || index}" data-source="${source}">
                            👁️ Ver
                        </button>
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
        this.setupGPXEventListeners();
    }

    setupGPXEventListeners() {
        const container = this.elements.gpxList;
        if (!container) return;
        
        console.log('🔄 Configurando eventos para GPX...');
        
        container.querySelectorAll('.gpx-file').forEach(item => {
            // Click en el item (excepto en botones y checkboxes)
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.play-btn') && !(e.target.type === 'checkbox')) {
                    const id = item.dataset.id;
                    this.toggleSelection(id, 'gpx');
                }
            });
            
            // Checkbox
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = item.dataset.id;
                    this.toggleSelection(id, 'gpx');
                });
            }
            
            // Botón de ver GPX
            const viewBtn = item.querySelector('.view-gpx');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const id = e.target.dataset.id;
                    const source = e.target.dataset.source;
                    console.log('👁️ Ver GPX clickeado, ID:', id, 'Fuente:', source);
                    this.viewGPX(id, source);
                });
            }
            
            // Botón de descargar GPX
            const downloadBtn = item.querySelector('.download-gpx');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = e.target.dataset.id;
                    const source = e.target.dataset.source;
                    await this.downloadGPX(id, source);
                });
            }
            
            // Botón de cargar a app
            const loadBtn = item.querySelector('.load-gpx');
            if (loadBtn) {
                loadBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const filename = e.target.dataset.filename;
                    const path = e.target.dataset.path;
                    await this.loadGPXFromFileSystem(filename, path);
                });
            }
        });
    }


    async viewGPX(gpxId, source = 'gpxTracks') {
        try {
            console.log('🗺️ Visualizando GPX:', gpxId, 'fuente:', source);
            
            let gpxData;
            
            if (source === 'filesystem') {
                // Para GPX del sistema de archivos
                gpxData = this.state.gpxTracks.find(g => (g.id == gpxId || g.filename === gpxId));
                
                if (gpxData) {
                    try {
                        if (gpxData.file) {
                            // Procesar el archivo GPX
                            const text = await gpxData.file.text();
                            gpxData = await this.parseGPXData(text, gpxData);
                        } else if (gpxData.blob) {
                            // Si ya tiene blob
                            const text = await gpxData.blob.text();
                            gpxData = await this.parseGPXData(text, gpxData);
                        }
                    } catch (parseError) {
                        console.error('❌ Error parseando archivo GPX:', parseError);
                        this.showNotification('❌ Formato GPX no compatible');
                        return;
                    }
                }
            } else {
                // Para GPX de la app
                let rawData = await this.getFromStore('gpxTracks', parseInt(gpxId));
                
                if (!rawData) {
                    // Intentar desde gpxFiles
                    rawData = await this.getFromStore('gpxFiles', parseInt(gpxId));
                }
                
                if (rawData) {
                    try {
                        if (rawData.blob) {
                            const text = await rawData.blob.text();
                            gpxData = await this.parseGPXData(text, rawData);
                        } else if (rawData.gpxData) {
                            // Si ya tiene datos procesados
                            gpxData = rawData.gpxData;
                        }
                    } catch (parseError) {
                        console.error('❌ Error parseando GPX de BD:', parseError);
                        this.showNotification('❌ Error al procesar GPX');
                        return;
                    }
                }
            }
            
            if (!gpxData) {
                this.showNotification('❌ No se pudo cargar el archivo GPX');
                return;
            }
            
            // Verificar si tiene puntos
            if (!gpxData.points || gpxData.points.length === 0) {
                console.warn('⚠️ GPX sin puntos válidos:', gpxData);
                this.showNotification('⚠️ GPX no contiene datos de ruta válidos');
                
                // Mostrar información básica aunque no tenga puntos
                this.showGPXViewer(gpxData);
                return;
            }
            
            console.log('✅ GPX cargado para visualización:', {
                name: gpxData.name,
                points: gpxData.points.length,
                distance: gpxData.stats.totalDistance.toFixed(2) + ' km'
            });
            
            // Mostrar panel de visualización
            this.showGPXViewer(gpxData);
            
        } catch (error) {
            console.error('❌ Error visualizando GPX:', error);
            this.showNotification('❌ Error al cargar GPX: ' + error.message);
        }
    }

    async debugGPXFile(file) {
        try {
            console.log('🐛 Debuggeando archivo GPX:', file.name);
            
            const text = await file.text();
            console.log('📄 Primeros 1000 caracteres del GPX:', text.substring(0, 1000));
            
            // Verificar estructura
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            // Verificar errores de parseo
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                console.error('❌ Error de parseo XML:', parserError.textContent);
            }
            
            // Contar diferentes tipos de elementos
            const counts = {
                trkpt: xmlDoc.getElementsByTagName('trkpt').length,
                wpt: xmlDoc.getElementsByTagName('wpt').length,
                rtept: xmlDoc.getElementsByTagName('rtept').length,
                trk: xmlDoc.getElementsByTagName('trk').length,
                rte: xmlDoc.getElementsByTagName('rte').length
            };
            
            console.log('📊 Conteo de elementos:', counts);
            
            // Extraer metadatos
            const metadata = {
                name: xmlDoc.querySelector('name')?.textContent,
                desc: xmlDoc.querySelector('desc')?.textContent,
                author: xmlDoc.querySelector('author')?.textContent,
                time: xmlDoc.querySelector('time')?.textContent
            };
            
            console.log('📝 Metadatos:', metadata);
            
            // Mostrar primeros puntos
            const firstPoints = [];
            const trkpts = xmlDoc.getElementsByTagName('trkpt');
            for (let i = 0; i < Math.min(3, trkpts.length); i++) {
                const trkpt = trkpts[i];
                firstPoints.push({
                    lat: trkpt.getAttribute('lat'),
                    lon: trkpt.getAttribute('lon'),
                    ele: trkpt.querySelector('ele')?.textContent,
                    time: trkpt.querySelector('time')?.textContent
                });
            }
            
            console.log('📍 Primeros puntos:', firstPoints);
            
            return { counts, metadata, firstPoints };
            
        } catch (error) {
            console.error('❌ Error debuggeando GPX:', error);
            return null;
        }
    }

    async parseGPXData(gpxText, originalData) {
        try {
            console.log('🔍 Parseando datos GPX...');
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(gpxText, 'text/xml');
            
            // Verificar si el XML es válido
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                console.error('❌ Error parseando XML GPX:', parserError.textContent);
                throw new Error('Formato GPX inválido');
            }
            
            // Extraer nombre (probar diferentes ubicaciones)
            let name = originalData.name || originalData.filename || 'Ruta GPX';
            const nameElements = [
                xmlDoc.querySelector('metadata > name'),
                xmlDoc.querySelector('trk > name'),
                xmlDoc.querySelector('rte > name'),
                xmlDoc.querySelector('gpx > name'),
                xmlDoc.querySelector('name')
            ];
            
            for (const nameElement of nameElements) {
                if (nameElement && nameElement.textContent && nameElement.textContent.trim()) {
                    name = nameElement.textContent.trim();
                    break;
                }
            }
            
            // Extraer puntos de diferentes tipos
            const trackPoints = [];
            
            // Intentar extraer puntos de track (trkseg > trkpt)
            const trkpts = xmlDoc.getElementsByTagName('trkpt');
            if (trkpts.length > 0) {
                console.log(`📍 Encontrados ${trkpts.length} puntos de track (trkpt)`);
                for (let i = 0; i < trkpts.length; i++) {
                    const trkpt = trkpts[i];
                    const point = this.extractPointData(trkpt);
                    if (point) trackPoints.push(point);
                }
            }
            
            // Si no hay puntos de track, intentar con waypoints (wpt)
            if (trackPoints.length === 0) {
                const wpts = xmlDoc.getElementsByTagName('wpt');
                if (wpts.length > 0) {
                    console.log(`📍 Encontrados ${wpts.length} waypoints (wpt)`);
                    for (let i = 0; i < wpts.length; i++) {
                        const wpt = wpts[i];
                        const point = this.extractPointData(wpt);
                        if (point) trackPoints.push(point);
                    }
                }
            }
            
            // Si aún no hay puntos, intentar con puntos de ruta (rtept)
            if (trackPoints.length === 0) {
                const rtepts = xmlDoc.getElementsByTagName('rtept');
                if (rtepts.length > 0) {
                    console.log(`📍 Encontrados ${rtepts.length} puntos de ruta (rtept)`);
                    for (let i = 0; i < rtepts.length; i++) {
                        const rtept = rtepts[i];
                        const point = this.extractPointData(rtept);
                        if (point) trackPoints.push(point);
                    }
                }
            }
            
            // Si no hay puntos en absoluto, lanzar error
            if (trackPoints.length === 0) {
                console.warn('⚠️ No se encontraron puntos en el archivo GPX');
                
                // Intentar método alternativo: buscar coordenadas en el texto
                const coordMatches = gpxText.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/g);
                if (coordMatches && coordMatches.length > 0) {
                    console.log(`🔄 Encontradas ${coordMatches.length} coordenadas por regex`);
                    coordMatches.forEach((match, index) => {
                        const coords = match.split(/[,\s]+/).map(Number);
                        if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                            trackPoints.push({
                                lat: coords[0],
                                lon: coords[1],
                                ele: 0,
                                time: null,
                                speed: 0,
                                timestamp: Date.now() + index
                            });
                        }
                    });
                }
            }
            
            console.log(`✅ Puntos extraídos: ${trackPoints.length}`);
            
            // Calcular estadísticas
            const stats = this.calculateGPXStats(trackPoints);
            
            // Preparar datos finales
            const gpxData = {
                id: originalData.id || Date.now(),
                name: name,
                filename: originalData.filename || 'ruta.gpx',
                points: trackPoints,
                stats: stats,
                metadata: originalData,
                rawText: gpxText.substring(0, 500) + '...' // Guardar parte del texto para debugging
            };
            
            console.log('📊 Estadísticas GPX calculadas:', {
                puntos: stats.totalPoints,
                distancia: stats.totalDistance.toFixed(2) + ' km',
                tiempo: stats.totalTimeFormatted,
                elevacion: `${stats.minElevation.toFixed(0)}-${stats.maxElevation.toFixed(0)} m`
            });
            
            return gpxData;
            
        } catch (error) {
            console.error('❌ Error parseando GPX:', error);
            
            // Devolver datos básicos si hay error
            return {
                id: originalData.id || Date.now(),
                name: originalData.name || originalData.filename || 'Ruta GPX',
                filename: originalData.filename || 'ruta.gpx',
                points: [],
                stats: {
                    totalPoints: 0,
                    totalDistance: 0,
                    totalTime: 0,
                    totalTimeFormatted: '00:00',
                    avgSpeed: 0,
                    avgSpeedKmh: 0,
                    maxSpeed: 0,
                    minElevation: 0,
                    maxElevation: 0,
                    elevationGain: 0,
                    elevationLoss: 0,
                    startTime: null,
                    endTime: null
                },
                metadata: originalData,
                error: error.message
            };
        }
    }

    calculateGPXStats(points) {
        if (!points || points.length === 0) {
            return {
                totalPoints: 0,
                totalDistance: 0,
                totalTime: 0,
                totalTimeFormatted: '00:00',
                avgSpeed: 0,
                avgSpeedKmh: 0,
                maxSpeed: 0,
                minElevation: 0,
                maxElevation: 0,
                elevationGain: 0,
                elevationLoss: 0,
                startTime: null,
                endTime: null
            };
        }
        
        let totalDistance = 0;
        let totalElevationGain = 0;
        let totalElevationLoss = 0;
        let minElevation = Infinity;
        let maxElevation = -Infinity;
        let maxSpeed = 0;
        let startTime = null;
        let endTime = null;
        
        // Filtrar solo puntos válidos con tiempo
        const validPoints = points.filter(p => p && p.time);
        
        // Encontrar tiempos de inicio y fin
        if (validPoints.length > 0) {
            // Ordenar por tiempo para asegurar correcto orden
            validPoints.sort((a, b) => a.time - b.time);
            startTime = validPoints[0].time;
            endTime = validPoints[validPoints.length - 1].time;
        }
        
        // Calcular estadísticas
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (!point) continue;
            
            // Elevación
            if (point.ele !== undefined) {
                if (point.ele < minElevation) minElevation = point.ele;
                if (point.ele > maxElevation) maxElevation = point.ele;
                
                // Ganancia/pérdida de elevación
                if (i > 0 && points[i-1] && points[i-1].ele !== undefined) {
                    const prevEle = points[i-1].ele;
                    const eleDiff = point.ele - prevEle;
                    if (eleDiff > 0) totalElevationGain += eleDiff;
                    else totalElevationLoss += Math.abs(eleDiff);
                }
            }
            
            // Velocidad
            if (point.speed && point.speed > maxSpeed) {
                maxSpeed = point.speed;
            }
            
            // Distancia
            if (i > 0 && points[i-1]) {
                const prevPoint = points[i-1];
                const distance = this.calculateDistance(
                    prevPoint.lat, prevPoint.lon,
                    point.lat, point.lon
                );
                totalDistance += distance;
                
                // Calcular velocidad entre puntos si tenemos tiempo
                if (point.time && prevPoint.time && distance > 0) {
                    const timeDiff = (point.time - prevPoint.time) / 1000; // en segundos
                    if (timeDiff > 0) {
                        const speed = distance / (timeDiff / 3600); // km/h
                        if (speed > maxSpeed) maxSpeed = speed;
                        
                        // Si el punto no tenía velocidad, asignar la calculada
                        if (!point.speed || point.speed === 0) {
                            point.speed = speed / 3.6; // convertir a m/s para consistencia
                        }
                    }
                }
            }
        }
        
        // Calcular tiempo total
        const totalTimeMs = startTime && endTime ? endTime - startTime : 0;
        
        // Calcular velocidad promedio
        const totalTimeHours = totalTimeMs / (1000 * 60 * 60);
        const avgSpeedKmh = totalTimeHours > 0 ? totalDistance / totalTimeHours : 0;
        
        return {
            totalPoints: points.length,
            totalDistance: totalDistance,
            totalTime: totalTimeMs,
            totalTimeFormatted: this.formatTime(totalTimeMs),
            avgSpeed: avgSpeedKmh / 3.6, // en m/s
            avgSpeedKmh: avgSpeedKmh,
            maxSpeed: maxSpeed,
            minElevation: minElevation === Infinity ? 0 : minElevation,
            maxElevation: maxElevation === -Infinity ? 0 : maxElevation,
            elevationGain: totalElevationGain,
            elevationLoss: totalElevationLoss,
            startTime: startTime,
            endTime: endTime
        };
    }
    
    extractPointData(pointElement) {
        try {
            const lat = parseFloat(pointElement.getAttribute('lat'));
            const lon = parseFloat(pointElement.getAttribute('lon'));
            
            // Validar coordenadas
            if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                console.warn('⚠️ Coordenadas inválidas:', lat, lon);
                return null;
            }
            
            const point = {
                lat: lat,
                lon: lon,
                ele: 0,
                time: null,
                speed: 0,
                timestamp: Date.now()
            };
            
            // Extraer elevación
            const eleElement = pointElement.querySelector('ele');
            if (eleElement && eleElement.textContent) {
                const eleValue = parseFloat(eleElement.textContent);
                if (!isNaN(eleValue)) point.ele = eleValue;
            }
            
            // MEJORADA: Extraer tiempo con múltiples formatos
            const timeElement = pointElement.querySelector('time');
            if (timeElement && timeElement.textContent) {
                try {
                    // Intentar parsear diferentes formatos de tiempo
                    let timeString = timeElement.textContent.trim();
                    
                    // Ajustar para formato ISO con 'Z' o sin ella
                    if (timeString.endsWith('Z')) {
                        point.time = new Date(timeString);
                    } else {
                        // Si no tiene 'Z', asumir UTC o añadirla
                        if (timeString.includes('T')) {
                            // Formato ISO sin Z: "2023-10-15T14:30:00"
                            point.time = new Date(timeString + 'Z');
                        } else {
                            // Otros formatos
                            point.time = new Date(timeString);
                        }
                    }
                    
                    if (!isNaN(point.time.getTime())) {
                        point.timestamp = point.time.getTime();
                        // Debug: mostrar algunos tiempos
                        if (Math.random() < 0.001) { // Solo para algunos puntos
                            console.log('⏰ Tiempo extraído:', point.time.toISOString());
                        }
                    } else {
                        console.warn('⚠️ Tiempo inválido:', timeString);
                    }
                } catch (e) {
                    console.warn('⚠️ Error parseando tiempo:', e);
                }
            }
            
            // Extraer velocidad (puede estar como 'speed' o 'gpxtpx:speed')
            const speedElements = [
                pointElement.querySelector('speed'),
                pointElement.querySelector('gpxtpx\\:speed'),
                pointElement.querySelector('[speed]'),
                pointElement.querySelector('extensions > speed'),
                pointElement.querySelector('extensions > gpxtpx\\:speed')
            ];
            
            for (const speedEl of speedElements) {
                if (speedEl && speedEl.textContent) {
                    const speedValue = parseFloat(speedEl.textContent);
                    if (!isNaN(speedValue)) {
                        point.speed = speedValue;
                        break;
                    }
                }
            }
            
            // Si no hay velocidad en los datos, calcularla basada en posición y tiempo
            if (point.speed === 0 && point.time) {
                // La velocidad se calculará después cuando procesemos todos los puntos
            }
            
            // Extraer frecuencia cardíaca
            const hrElements = [
                pointElement.querySelector('gpxtpx\\:hr'),
                pointElement.querySelector('hr'),
                pointElement.querySelector('[hr]'),
                pointElement.querySelector('extensions > gpxtpx\\:hr'),
                pointElement.querySelector('extensions > hr')
            ];
            
            for (const hrEl of hrElements) {
                if (hrEl && hrEl.textContent) {
                    const hrValue = parseInt(hrEl.textContent);
                    if (!isNaN(hrValue)) {
                        point.hr = hrValue;
                        break;
                    }
                }
            }
            
            // Extraer cadencia
            const cadElements = [
                pointElement.querySelector('gpxtpx\\:cad'),
                pointElement.querySelector('cad'),
                pointElement.querySelector('[cad]'),
                pointElement.querySelector('extensions > gpxtpx\\:cad'),
                pointElement.querySelector('extensions > cad')
            ];
            
            for (const cadEl of cadElements) {
                if (cadEl && cadEl.textContent) {
                    const cadValue = parseInt(cadEl.textContent);
                    if (!isNaN(cadValue)) {
                        point.cad = cadValue;
                        break;
                    }
                }
            }
            
            return point;
            
        } catch (error) {
            console.warn('⚠️ Error extrayendo datos de punto:', error);
            return null;
        }
    }

    async downloadGPX(gpxId, source = 'gpxTracks') {
        try {
            console.log('📥 Descargando GPX:', gpxId, 'fuente:', source);
            
            let blob;
            let filename = 'ruta.gpx';
            
            if (source === 'gpxFiles') {
                // 1. Obtener datos de la base de datos
                const gpxData = await this.getFromStore('gpxFiles', parseInt(gpxId));
                
                if (gpxData) {
                    console.log('✅ GPX encontrado en gpxFiles:', {
                        name: gpxData.name,
                        filename: gpxData.filename,
                        tieneBlob: !!gpxData.blob,
                        fileSize: gpxData.fileSize
                    });
                    
                    // 2. Si tiene blob, usarlo
                    if (gpxData.blob) {
                        blob = gpxData.blob;
                        filename = gpxData.filename || `${gpxData.name}.gpx`;
                        console.log('✅ Usando blob existente');
                    }
                    // 3. Si NO tiene blob pero tiene gpxData con puntos
                    else if (gpxData.gpxData && gpxData.gpxData.points) {
                        console.log('🔄 Creando blob desde puntos GPX...');
                        const gpxContent = this.generateGPXFromPoints(gpxData.gpxData.points, gpxData.name);
                        blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
                        filename = gpxData.filename || `${gpxData.name}.gpx`;
                        console.log('✅ Blob creado desde puntos');
                    }
                    // 4. Si tiene fileSize pero no blob ni puntos, es un GPX externo
                    else if (gpxData.fileSize && gpxData.fileSize > 0) {
                        console.log('🔄 Es un GPX externo, intentando obtener del sistema de archivos...');
                        
                        // Buscar en la carpeta local
                        if (this.localFolderHandle) {
                            try {
                                // Intentar encontrar el archivo por nombre
                                const fileHandle = await this.localFolderHandle.getFileHandle(gpxData.filename);
                                const file = await fileHandle.getFile();
                                blob = file;
                                filename = gpxData.filename;
                                console.log('✅ Archivo encontrado en carpeta local');
                                
                                // Actualizar la base de datos con el blob
                                gpxData.blob = blob;
                                await this.saveToDatabase('gpxFiles', gpxData);
                                console.log('✅ Base de datos actualizada con blob');
                            } catch (fsError) {
                                console.warn('⚠️ No se encontró en carpeta local:', fsError);
                            }
                        }
                    }
                }
            }
            
            // Si aún no tenemos blob, probar otras fuentes
            if (!blob) {
                // Intentar desde gpxTracks
                const gpxTracksData = await this.getFromStore('gpxTracks', parseInt(gpxId));
                if (gpxTracksData?.blob) {
                    blob = gpxTracksData.blob;
                    filename = gpxTracksData.filename || 'ruta.gpx';
                    console.log('✅ Usando blob de gpxTracks');
                }
            }
            
            // SI NADA FUNCIONA, crear un GPX básico
            if (!blob) {
                console.log('⚠️ Creando GPX básico como último recurso...');
                const basicGPX = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="Dashcam PWA Pro">
    <metadata>
        <name>Ruta Exportada</name>
        <time>${new Date().toISOString()}</time>
    </metadata>
    <trk>
        <name>Ruta Exportada</name>
        <desc>Exportado desde Dashcam PWA</desc>
    </trk>
    </gpx>`;
                
                blob = new Blob([basicGPX], { type: 'application/gpx+xml' });
                filename = `ruta_exportada_${Date.now()}.gpx`;
                console.log('✅ GPX básico creado');
            }
            
            // Verificar y descargar
            if (blob && blob.size > 0) {
                console.log(`✅ Descargando: ${filename} (${Math.round(blob.size / 1024)} KB)`);
                this.downloadBlob(blob, filename);
                this.showNotification('🗺️ GPX descargado');
            } else {
                console.error('❌ Blob inválido o vacío');
                this.showNotification('❌ Error: Archivo GPX inválido');
            }
            
        } catch (error) {
            console.error('❌ Error descargando GPX:', error);
            this.showNotification('❌ Error al descargar GPX');
        }
    }

    // Función para generar GPX desde puntos (si no la tienes)
    generateGPXFromPoints(points, name = 'Ruta GPX') {
        if (!points || points.length === 0) {
            return `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="Dashcam PWA Pro">
    <metadata>
        <name>${name}</name>
        <time>${new Date().toISOString()}</time>
    </metadata>
    <trk>
        <name>${name}</name>
        <desc>Sin puntos de track</desc>
    </trk>
    </gpx>`;
        }
        
        let gpx = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="Dashcam PWA Pro">
    <metadata>
        <name>${name}</name>
        <time>${new Date().toISOString()}</time>
    </metadata>
    <trk>
        <name>${name}</name>
        <trkseg>`;
        
        points.forEach(point => {
            const time = point.time ? point.time.toISOString() : new Date().toISOString();
            
            gpx += `
        <trkpt lat="${point.lat}" lon="${point.lon}">`;
            
            if (point.ele !== undefined) {
                gpx += `
            <ele>${point.ele}</ele>`;
            }
            
            gpx += `
            <time>${time}</time>`;
            
            if (point.speed !== undefined) {
                gpx += `
            <speed>${point.speed}</speed>`;
            }
            
            gpx += `
        </trkpt>`;
        });
        
        gpx += `
        </trkseg>
    </trk>
    </gpx>`;
        
        return gpx;
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
            
            // Obtener archivo
            const parts = path.split('/');
            let currentHandle = this.localFolderHandle;
            
            for (const part of parts) {
                if (part && part !== filename) {
                    currentHandle = await currentHandle.getDirectoryHandle(part);
                }
            }
            
            const fileHandle = await currentHandle.getFileHandle(filename);
            const file = await fileHandle.getFile();
            
            // LEER EL ARCHIVO COMPLETO COMO BLOB
            const blob = new Blob([await file.arrayBuffer()], { type: 'application/gpx+xml' });
            
            // Crear datos del GPX
            const gpxData = {
                id: Date.now(),
                name: filename.replace('.gpx', '').replace('.GPX', ''),
                filename: filename,
                uploadDate: Date.now(),
                fileSize: file.size,
                blob: blob, // ←←← ¡ESTO ES LO IMPORTANTE QUE FALTABA!
                lastModified: file.lastModified,
                source: 'filesystem'
            };
            
            // Guardar en la base de datos
            if (this.db) {
                await this.saveToDatabase('gpxFiles', gpxData);
                
                // Actualizar lista en memoria
                this.state.loadedGPXFiles.push(gpxData);
                this.updateGpxSelect();
                
                this.showNotification(`✅ GPX cargado: ${gpxData.name}`);
                
                // Recargar la lista
                this.loadGPXFromStore();
            }
            
        } catch (error) {
            console.error('❌ Error cargando GPX desde sistema de archivos:', error);
            this.showNotification('❌ Error al cargar GPX');
        }
    }

    showGPXViewer(gpxData) {
        try {
            console.log('🗺️ Mostrando visualizador GPX:', gpxData.name);
            
            // Crear o mostrar panel de visualización
            let viewerPanel = document.getElementById('gpxViewerPanel');
            
            if (!viewerPanel) {
                // Crear panel si no existe
                viewerPanel = document.createElement('div');
                viewerPanel.id = 'gpxViewerPanel';
                viewerPanel.className = 'fullscreen-panel hidden';
                viewerPanel.innerHTML = `
                    <div class="panel-header">
                        <h2>🗺️ Visualizador GPX</h2>
                        <button id="closeGpxViewer" class="close-btn">✕</button>
                    </div>
                    <div class="panel-content">
                        <div class="gpx-viewer-container">
                            <div class="gpx-info-panel">
                                <div class="gpx-header">
                                    <h3 id="gpxViewerTitle">Cargando...</h3>
                                    <div class="gpx-meta">
                                        <span id="gpxViewerFilename"></span>
                                        <span id="gpxViewerDate"></span>
                                    </div>
                                </div>
                                
                                <div class="gpx-stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-icon">📍</div>
                                        <div class="stat-value" id="gpxPoints2">0</div>
                                        <div class="stat-label">Puntos</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">📏</div>
                                        <div class="stat-value" id="gpxDistance2">0 km</div>
                                        <div class="stat-label">Distancia</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">⏱️</div>
                                        <div class="stat-value" id="gpxDuration2">00:00</div>
                                        <div class="stat-label">Duración</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">⚡</div>
                                        <div class="stat-value" id="gpxAvgSpeed2">0 km/h</div>
                                        <div class="stat-label">Velocidad</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">⬆️</div>
                                        <div class="stat-value" id="gpxElevationGain">0 m</div>
                                        <div class="stat-label">Subida</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">⬇️</div>
                                        <div class="stat-value" id="gpxElevationLoss">0 m</div>
                                        <div class="stat-label">Bajada</div>
                                    </div>
                                </div>
                                
                                <div class="gpx-details">
                                    <div class="detail-row">
                                        <span>📅 Inicio:</span>
                                        <span id="gpxStartTime">--:--</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>📅 Fin:</span>
                                        <span id="gpxEndTime">--:--</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>📈 Elevación min:</span>
                                        <span id="gpxMinElevation">0 m</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>📉 Elevación max:</span>
                                        <span id="gpxMaxElevation">0 m</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>🚀 Velocidad max:</span>
                                        <span id="gpxMaxSpeed">0 km/h</span>
                                    </div>
                                </div>
                                
                                <div class="gpx-actions">
                                    <button id="exportGpxAsKml" class="btn action-btn">
                                        📤 Exportar KML
                                    </button>
                                    <button id="exportGpxAsJson" class="btn action-btn">
                                        📊 Exportar JSON
                                    </button>
                                    <button id="showGpxOnMap" class="btn primary-btn">
                                        🗺️ Ver en mapa grande
                                    </button>
                                </div>
                            </div>
                            
                            <div class="gpx-map-container">
                                <div id="gpxViewerMap"></div>
                                <div class="map-controls">
                                    <button id="zoomInBtn" class="map-btn">+</button>
                                    <button id="zoomOutBtn" class="map-btn">-</button>
                                    <button id="fitBoundsBtn" class="map-btn">🗺️</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(viewerPanel);
                
                // Configurar eventos del panel
                document.getElementById('closeGpxViewer').addEventListener('click', () => {
                    this.hideGPXViewer();
                });
                
                document.getElementById('exportGpxAsKml').addEventListener('click', () => {
                    this.exportGPXAsKML(gpxData);
                });
                
                document.getElementById('exportGpxAsJson').addEventListener('click', () => {
                    this.exportGPXAsJSON(gpxData);
                });
                
                document.getElementById('showGpxOnMap').addEventListener('click', () => {
                    this.showFullscreenMap(gpxData);
                });
            }
            
            // Actualizar datos en el panel
            this.updateGPXViewerData(gpxData);
            
            // Mostrar panel
            viewerPanel.classList.remove('hidden');
            
            // Inicializar mapa después de que el panel esté visible
            setTimeout(() => {
                this.initGPXViewerMap(gpxData);
            }, 100);
            
        } catch (error) {
            console.error('❌ Error mostrando visualizador GPX:', error);
            this.showNotification('❌ Error al mostrar GPX');
        }
    }

    updateGPXViewerData(gpxData) {
        try {
            const stats = gpxData.stats;
            
            // Actualizar información básica
            document.getElementById('gpxViewerTitle').textContent = gpxData.name;
            document.getElementById('gpxViewerFilename').textContent = gpxData.filename;
            
            if (gpxData.metadata && gpxData.metadata.timestamp) {
                const date = new Date(gpxData.metadata.timestamp);
                document.getElementById('gpxViewerDate').textContent = 
                    date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            }
            
            // Actualizar estadísticas - CORREGIDO: usar 'gpxDistance2' en lugar de 'gpxDistance'
            document.getElementById('gpxPoints2').textContent = stats.totalPoints.toLocaleString();
            document.getElementById('gpxDistance2').textContent = stats.totalDistance.toFixed(2) + ' km';
            document.getElementById('gpxDuration2').textContent = stats.totalTimeFormatted;
            document.getElementById('gpxAvgSpeed2').textContent = stats.avgSpeedKmh.toFixed(1) + ' km/h';
            document.getElementById('gpxElevationGain').textContent = stats.elevationGain.toFixed(0) + ' m';
            document.getElementById('gpxElevationLoss').textContent = stats.elevationLoss.toFixed(0) + ' m';
            
            // Actualizar detalles
            if (stats.startTime) {
                document.getElementById('gpxStartTime').textContent = 
                    stats.startTime.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            }
            
            if (stats.endTime) {
                document.getElementById('gpxEndTime').textContent = 
                    stats.endTime.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            }
            
            document.getElementById('gpxMinElevation').textContent = stats.minElevation.toFixed(0) + ' m';
            document.getElementById('gpxMaxElevation').textContent = stats.maxElevation.toFixed(0) + ' m';
            document.getElementById('gpxMaxSpeed').textContent = (stats.maxSpeed * 3.6).toFixed(1) + ' km/h';
            
        } catch (error) {
            console.error('❌ Error actualizando datos del visualizador GPX:', error);
        }
    }
    
    initGPXViewerMap(gpxData) {
        try {
            const mapContainer = document.getElementById('gpxViewerMap');
            if (!mapContainer) {
                console.error('❌ No se encontró el contenedor del mapa');
                return;
            }
            
            // Limpiar contenido anterior
            mapContainer.innerHTML = '';
            
            if (!gpxData.points || gpxData.points.length === 0) {
                mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ No hay datos GPS para mostrar</span></div>';
                return;
            }
            
            if (typeof L === 'undefined') {
                mapContainer.innerHTML = '<div class="map-loading"><span>❌ Leaflet no está disponible</span></div>';
                return;
            }
            
            // Calcular centro y bounds
            const points = gpxData.points;
            const bounds = this.calculateTrackBounds(points);
            const center = this.calculateTrackCenter(points);
            
            // Crear mapa
            const map = L.map('gpxViewerMap', {
                center: center,
                zoom: 13,
                zoomControl: false, // Usaremos controles personalizados
                attributionControl: true
            });
            
            // Añadir capa base
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);
            
            // Añadir capa de relieve (opcional)
            L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 17,
                opacity: 0.3
            }).addTo(map);
            
            // Dibujar la ruta
            const latLngs = points.map(point => [point.lat, point.lon]);
            const routeLine = L.polyline(latLngs, {
                color: '#00a8ff',
                weight: 4,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
            }).addTo(map);
            
            // Añadir marcador de inicio
            const startPoint = points[0];
            const startMarker = L.marker([startPoint.lat, startPoint.lon], {
                icon: L.divIcon({
                    className: 'start-marker',
                    html: '<div>🚩</div>',
                    iconSize: [30, 30]
                })
            }).addTo(map);
            startMarker.bindTooltip('📍 Punto de inicio', { direction: 'top' });
            
            // Añadir marcador de fin
            const endPoint = points[points.length - 1];
            const endMarker = L.marker([endPoint.lat, endPoint.lon], {
                icon: L.divIcon({
                    className: 'end-marker',
                    html: '<div>🏁</div>',
                    iconSize: [30, 30]
                })
            }).addTo(map);
            endMarker.bindTooltip('🏁 Punto final', { direction: 'top' });
            
            // Añadir controles de zoom personalizados
            L.control.zoom({
                position: 'topright'
            }).addTo(map);
            
            // Ajustar vista
            map.fitBounds(bounds, { padding: [30, 30] });
            
            // Forzar redibujado
            setTimeout(() => {
                map.invalidateSize();
                
                // Configurar controles personalizados
                document.getElementById('zoomInBtn').addEventListener('click', () => {
                    map.zoomIn();
                });
                
                document.getElementById('zoomOutBtn').addEventListener('click', () => {
                    map.zoomOut();
                });
                
                document.getElementById('fitBoundsBtn').addEventListener('click', () => {
                    map.fitBounds(bounds, { padding: [30, 30] });
                });
            }, 300);
            
            // Guardar referencia al mapa
            this.gpxViewerMap = map;
            
            console.log('✅ Mapa GPX inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando mapa GPX:', error);
            const mapContainer = document.getElementById('gpxViewerMap');
            if (mapContainer) {
                mapContainer.innerHTML = `
                    <div class="map-loading">
                        <span>❌ Error cargando mapa</span>
                        <br>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        }
    }
    exportGPXAsKML(gpxData) {
        try {
            console.log('📤 Exportando GPX como KML...');
            
            // Crear KML básico
            let kml = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
        <name>${gpxData.name || 'Ruta'}</name>
        <description>Exportado desde Dashcam PWA</description>
        <Style id="trackStyle">
        <LineStyle>
            <color>ff00a8ff</color>
            <width>4</width>
        </LineStyle>
        </Style>
        <Placemark>
        <name>${gpxData.name || 'Ruta'}</name>
        <styleUrl>#trackStyle</styleUrl>
        <LineString>
            <extrude>1</extrude>
            <tessellate>1</tessellate>
            <altitudeMode>absolute</altitudeMode>
            <coordinates>`;
            
            // Añadir coordenadas
            gpxData.points.forEach(point => {
                kml += `
            ${point.lon},${point.lat},${point.ele || 0}`;
            });
            
            kml += `
            </coordinates>
        </LineString>
        </Placemark>
    </Document>
    </kml>`;
            
            const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
            this.downloadBlob(blob, `${gpxData.name || 'ruta'}.kml`);
            
            this.showNotification('✅ GPX exportado como KML');
            
        } catch (error) {
            console.error('❌ Error exportando KML:', error);
            this.showNotification('❌ Error al exportar KML');
        }
    }

    exportGPXAsJSON(gpxData) {
        try {
            console.log('📊 Exportando GPX como JSON...');
            
            // Preparar datos para JSON
            const exportData = {
                name: gpxData.name,
                filename: gpxData.filename,
                stats: gpxData.stats,
                points: gpxData.points.map(point => ({
                    lat: point.lat,
                    lon: point.lon,
                    ele: point.ele,
                    time: point.time ? point.time.toISOString() : null,
                    speed: point.speed,
                    hr: point.hr,
                    cad: point.cad
                })),
                exportDate: new Date().toISOString(),
                appVersion: APP_VERSION
            };
            
            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            this.downloadBlob(blob, `${gpxData.name || 'ruta'}_data.json`);
            
            this.showNotification('✅ GPX exportado como JSON');
            
        } catch (error) {
            console.error('❌ Error exportando JSON:', error);
            this.showNotification('❌ Error al exportar JSON');
        }
    }
    hideGPXViewer() {
        const viewerPanel = document.getElementById('gpxViewerPanel');
        if (viewerPanel) {
            viewerPanel.classList.add('hidden');
        }
        
        // Limpiar mapa si existe
        if (this.gpxViewerMap) {
            this.gpxViewerMap.remove();
            this.gpxViewerMap = null;
        }
        
        console.log('🗺️ Visualizador GPX cerrado');
    }

    calculateTrackBounds(points) {
        if (!points || points.length === 0) {
            return [[0, 0], [0, 0]];
        }
        
        let minLat = 90, maxLat = -90;
        let minLon = 180, maxLon = -180;
        
        points.forEach(point => {
            if (point.lat < minLat) minLat = point.lat;
            if (point.lat > maxLat) maxLat = point.lat;
            if (point.lon < minLon) minLon = point.lon;
            if (point.lon > maxLon) maxLon = point.lon;
        });
        
        return [[minLat, minLon], [maxLat, maxLon]];
    }

    calculateTrackCenter(points) {
        if (!points || points.length === 0) {
            return [0, 0];
        }
        
        const bounds = this.calculateTrackBounds(points);
        const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
        const centerLon = (bounds[0][1] + bounds[1][1]) / 2;
        
        return [centerLat, centerLon];
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
        // Verificar si hay sesiones seleccionadas
        const sessions = this.groupVideosBySession(this.state.videos);
        const selectedSessions = sessions.filter(session => session.selected);
        
        if (selectedSessions.length > 0) {
            // Exportar sesiones seleccionadas
            for (const session of selectedSessions) {
                await this.exportSession(session.name);
            }
            return;
        }
        
        // Exportar individualmente (comportamiento original)
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
        try {
            if (this.state.selectedVideos.size === 0 && this.state.selectedGPX.size === 0) {
                this.showNotification('❌ No hay elementos seleccionados');
                return;
            }
            
            const confirmDelete = confirm(
                `¿Eliminar ${this.state.selectedVideos.size} videos seleccionados?\n` +
                `Esta acción no se puede deshacer.`
            );
            
            if (!confirmDelete) return;
            
            // Procesar eliminación de videos seleccionados
            const deletedVideos = [];
            
            for (const videoId of this.state.selectedVideos) {
                const video = this.findVideoInState(videoId);
                if (video) {
                    const success = await this.deleteVideoById(videoId, video);
                    if (success) {
                        deletedVideos.push(video);
                    }
                }
            }
            
            // Limpiar selecciones
            this.state.selectedVideos.clear();
            if (this.state.selectedSessions) {
                this.state.selectedSessions.clear();
            }
            
            // Recargar galería
            await this.loadGallery();
            
            // Limpiar sesiones vacías automáticamente
            await this.cleanupEmptySessions();
            
            this.showNotification(`🗑️ ${deletedVideos.length} videos eliminados`);
            
        } catch (error) {
            console.error('❌ Error eliminando videos:', error);
            this.showNotification('❌ Error al eliminar videos');
        }
    }

    async deleteVideoById(videoId, video) {
        try {
            console.log(`🗑️ Eliminando video: ${videoId}`, video.filename);
            
            // Eliminar según la ubicación
            if (video.source === 'filesystem' || video.isPhysical) {
                // Archivo físico
                await this.deletePhysicalVideo(video);
            } else {
                // Archivo en la app (IndexedDB)
                await this.deleteFromStore('videos', videoId);
            }
            
            // Eliminar del estado
            const index = this.state.videos.findIndex(v => this.normalizeId(v.id) === this.normalizeId(videoId));
            if (index !== -1) {
                this.state.videos.splice(index, 1);
            }
            
            return true;
            
        } catch (error) {
            console.error(`❌ Error eliminando video ${videoId}:`, error);
            return false;
        }
    }

    async deletePhysicalVideo(video) {
        try {
            if (video.fileHandle) {
                // Intentar eliminar el archivo físico
                // Nota: File System Access API tiene limitaciones para eliminar
                console.log(`📄 Intentando eliminar archivo físico: ${video.filename}`);
                
                // En lugar de eliminar, podemos marcarlo como eliminado en la BD
                await this.deleteFromStore('localFiles', video.id);
                
                // También podemos intentar moverlo a una carpeta de "papelera"
                // o simplemente ignorarlo y dejar que el usuario lo elimine manualmente
                
                return true;
            }
            return false;
        } catch (error) {
            console.warn(`⚠️ No se pudo eliminar archivo físico ${video.filename}:`, error);
            return false;
        }
    }


        /**
     * Elimina automáticamente sesiones vacías después de borrar videos
     */
    async cleanupEmptySessions() {
        try {
            console.log('🧹 Buscando sesiones vacías para limpiar...');
            
            // Obtener todas las sesiones actuales
            const sessions = this.groupVideosBySession(this.state.videos);
            
            // Buscar sesiones vacías (sin videos)
            const emptySessions = sessions.filter(session => session.videoCount === 0);
            
            if (emptySessions.length === 0) {
                console.log('✅ No hay sesiones vacías');
                return;
            }
            
            console.log(`🗑️ Encontradas ${emptySessions.length} sesiones vacías:`, 
                    emptySessions.map(s => s.name));
            
            // Limpiar de expandedSessions y selectedSessions
            emptySessions.forEach(session => {
                if (this.state.expandedSessions) {
                    this.state.expandedSessions.delete(session.name);
                }
                if (this.state.selectedSessions) {
                    this.state.selectedSessions.delete(session.name);
                }
            });
            
            // Si estamos en modo localFolder, eliminar carpetas físicas vacías
            if (this.state.viewMode === 'localFolder' && this.localFolderHandle) {
                await this.cleanupEmptyLocalFolders(emptySessions);
            }
            
            console.log('✅ Sesiones vacías limpiadas del estado');
            
        } catch (error) {
            console.error('❌ Error limpiando sesiones vacías:', error);
        }
    }

    /**
     * Elimina carpetas físicas vacías del sistema de archivos
     */
    async cleanupEmptyLocalFolders(emptySessions) {
        try {
            console.log('🗂️ Limpiando carpetas locales vacías...');
            
            for (const session of emptySessions) {
                try {
                    // Intentar obtener la carpeta de sesión
                    const sessionFolderHandle = await this.getSessionFolderHandle(session.name);
                    
                    if (sessionFolderHandle) {
                        // Verificar si realmente está vacía
                        const entries = [];
                        for await (const entry of sessionFolderHandle.values()) {
                            entries.push(entry);
                        }
                        
                        if (entries.length === 0) {
                            // Carpeta vacía, intentar eliminarla
                            await this.deleteEmptyFolder(sessionFolderHandle, session.name);
                            console.log(`✅ Carpeta vacía eliminada: ${session.name}`);
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ No se pudo limpiar carpeta ${session.name}:`, error);
                }
            }
            
        } catch (error) {
            console.error('❌ Error limpiando carpetas locales:', error);
        }
    }

    async deletePhysicalFile(fileHandle) {
        try {
            console.log(`🗑️ DELETE_PHYSICAL_FILE: Iniciando borrado de ${fileHandle.name}`);
            
            // MÉTODO 1: File System Access API moderna (Chrome 86+)
            if (fileHandle.remove && typeof fileHandle.remove === 'function') {
                console.log('🗑️ Usando fileHandle.remove()...');
                await fileHandle.remove();
                console.log(`✅ Archivo físico eliminado: ${fileHandle.name}`);
                return true;
            }
            
            // MÉTODO 2: Intentar obtener el directorio padre y borrar desde ahí
            try {
                // Necesitamos el directorio padre para borrar
                const parentHandle = await this.getParentDirectoryHandle(fileHandle);
                if (parentHandle && parentHandle.removeEntry) {
                    console.log(`🗑️ Usando parentHandle.removeEntry(${fileHandle.name})...`);
                    await parentHandle.removeEntry(fileHandle.name);
                    console.log(`✅ Archivo eliminado vía directorio padre: ${fileHandle.name}`);
                    return true;
                }
            } catch (parentError) {
                console.warn('⚠️ No se pudo obtener directorio padre:', parentError);
            }
            
            // MÉTODO 3: Para sistemas antiguos - recrear el archivo vacío (no recomendado)
            console.warn('⚠️ API no compatible para borrado directo');
            
            // MÉTODO 4: Intentar abrir en modo escritura y truncar
            try {
                const writable = await fileHandle.createWritable();
                await writable.write(new Uint8Array(0)); // Escribir 0 bytes
                await writable.close();
                console.log(`⚠️ Archivo truncado a 0 bytes (no eliminado): ${fileHandle.name}`);
                return false; // No es una eliminación real
            } catch (writeError) {
                console.error('❌ No se pudo truncar archivo:', writeError);
            }
            
            console.error('❌ No se pudo eliminar el archivo físico');
            return false;
            
        } catch (error) {
            console.error(`❌ Error en deletePhysicalFile(${fileHandle?.name}):`, error);
            return false;
        }
    }

// Función auxiliar para obtener el directorio padre
async getParentDirectoryHandle(fileHandle) {
    try {
        // Intentar diferentes métodos para obtener el padre
        if (fileHandle.getParent) {
            return await fileHandle.getParent();
        }
        
        // Si tenemos el localFolderHandle, usarlo
        if (this.localFolderHandle && fileHandle.name) {
            // Esto es complicado porque necesitamos la ruta completa
            console.warn('⚠️ No se puede obtener directorio padre directamente');
            return null;
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error obteniendo directorio padre:', error);
        return null;
    }
}


    /**
     * Obtiene el handle de una carpeta de sesión
     */
    async getSessionFolderHandle(sessionName) {
        if (!this.localFolderHandle) return null;
        
        try {
            // Verificar si existe una carpeta con el nombre de la sesión
            for await (const entry of this.localFolderHandle.values()) {
                if (entry.kind === 'directory' && entry.name === sessionName) {
                    return entry;
                }
            }
            return null;
        } catch (error) {
            console.warn(`⚠️ Error buscando carpeta ${sessionName}:`, error);
            return null;
        }
    }

    /**
     * Intenta eliminar una carpeta vacía
     */
    async deleteEmptyFolder(folderHandle, folderName) {
        try {
            // En File System Access API, necesitamos permisos especiales para eliminar
            // Primero verificar que esté vacía
            const entries = [];
            for await (const entry of folderHandle.values()) {
                entries.push(entry);
            }
            
            if (entries.length > 0) {
                console.log(`ℹ️ Carpeta ${folderName} no está vacía (${entries.length} archivos)`);
                return false;
            }
            
            // Intentar eliminar (esto puede no funcionar en todos los navegadores)
            // Normalmente necesitarías permisos especiales
            console.log(`ℹ️ No se puede eliminar carpeta ${folderName} - API limitada`);
            return false;
            
        } catch (error) {
            console.warn(`⚠️ No se pudo eliminar carpeta ${folderName}:`, error);
            return false;
        }
    }

    /**
     * Elimina una sesión completa (todos sus videos)
     */
    async deleteSession(sessionName) {
        try {
            // Obtener todos los videos de esta sesión
            const sessionVideos = this.state.videos.filter(video => {
                let videoSession = video.session || 'Sesión sin nombre';
                if (!videoSession || videoSession === 'null') {
                    const date = new Date(video.timestamp);
                    videoSession = `Sesión ${date.toLocaleDateString('es-ES')}`;
                }
                return videoSession === sessionName;
            });
            
            if (sessionVideos.length === 0) {
                this.showNotification(`ℹ️ La sesión ${sessionName} ya está vacía`);
                return;
            }
            
            const confirmDelete = confirm(
                `¿Eliminar la sesión COMPLETA "${sessionName}"?\n\n` +
                `Se eliminarán ${sessionVideos.length} videos.\n` +
                `Esta acción no se puede deshacer.`
            );
            
            if (!confirmDelete) return;
            
            this.showNotification(`🗑️ Eliminando sesión: ${sessionName}...`);
            
            // Eliminar todos los videos de la sesión
            let deletedCount = 0;
            
            for (const video of sessionVideos) {
                const success = await this.deleteVideoById(video.id, video);
                if (success) {
                    deletedCount++;
                }
            }
            
            // Limpiar selecciones
            this.state.selectedVideos.clear();
            if (this.state.selectedSessions) {
                this.state.selectedSessions.delete(sessionName);
            }
            if (this.state.expandedSessions) {
                this.state.expandedSessions.delete(sessionName);
            }
            
            // Recargar galería
            await this.loadGallery();
            
            // Intentar eliminar carpeta física si existe
            if (this.state.viewMode === 'localFolder' && this.localFolderHandle) {
                await this.cleanupEmptyLocalFolders([{ name: sessionName }]);
            }
            
            this.showNotification(`✅ Sesión "${sessionName}" eliminada (${deletedCount} videos)`);
            
        } catch (error) {
            console.error('❌ Error eliminando sesión:', error);
            this.showNotification('❌ Error al eliminar sesión');
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
                    // Obtener video de la app
                    const video = await this.getFromStore('videos', parseInt(videoId));
                    
                    if (video && video.blob) {
                        const filename = `dashcam_${video.timestamp}.${video.format || 'mp4'}`;
                        
                        // Guardar en carpeta local
                        const success = await this.saveToLocalFolder(video.blob, filename);
                        
                        if (success) {
                            console.log(`✅ Video ${videoId} movido a carpeta local`);
                            
                            // Si está configurado para NO mantener copia en app, eliminar
                            if (!this.state.settings.keepAppCopy) {
                                await this.deleteFromStore('videos', parseInt(videoId));
                                console.log(`🗑️ Video ${videoId} eliminado de la app`);
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
            
            // Limpiar selección y recargar
            this.state.selectedVideos.clear();
            await this.loadGallery();
            
            if (errors > 0) {
                this.showNotification(`✅ ${moved} movidos, ❌ ${errors} errores`);
            } else {
                this.showNotification(`✅ ${moved} videos movidos a carpeta local`);
            }
            
        } catch (error) {
            console.error('❌ Error moviendo videos:', error);
            this.showNotification('❌ Error al mover videos');
        }
    }
    

    // NUEVA FUNCIÓN AUXILIAR: Guardar en una carpeta específica
    async saveToFolder(folderHandle, blob, filename, sessionName) {
        try {
            // Crear archivo en la carpeta
            const fileHandle = await folderHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            
            console.log(`✅ Video guardado en carpeta: ${filename}`);
            
            // Si la carpeta no es la carpeta de sesión original, también actualizar la base de datos
            if (sessionName) {
                const videoData = {
                    id: Date.now(),
                    filename: filename,
                    timestamp: Date.now(),
                    duration: 0, // Se actualizará después
                    size: blob.size,
                    format: 'mp4',
                    location: 'localFolder',
                    source: 'localFolder',
                    session: sessionName,
                    fileHandle: fileHandle,
                    folderHandle: folderHandle,
                    path: `${sessionName}/${filename}`
                };
                
                // Extraer duración del video
                await this.extractAndSetVideoDuration(videoData);
                
                // Guardar en la base de datos
                if (this.db) {
                    await this.saveToDatabase('videos', videoData);
                }
                
                // Actualizar estado
                this.state.videos.push(videoData);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error guardando en carpeta:', error);
            return false;
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

    async loadGPXFromStore() {
        try {
            console.log('🗺️ Cargando rutas GPX desde fuentes reales...');
            
            let allGPX = [];
            
            if (this.state.viewMode === 'default') {
                allGPX = await this.scanAppGPXFiles();
                console.log(`📱 ${allGPX.length} GPX en la app`);
            } else if (this.state.viewMode === 'localFolder') {
                allGPX = await this.scanLocalFolderGPXFiles();
                console.log(`📂 ${allGPX.length} GPX en carpeta local`);
                
                const appGPX = await this.scanAppGPXFiles();
                const localGPX = allGPX.map(g => g.filename || g.title);
                
                appGPX.forEach(gpx => {
                    if (!localGPX.includes(gpx.filename || gpx.title)) {
                        allGPX.push(gpx);
                    }
                });
            }
            
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

    initPlaybackMap() {
        console.log('🗺️ Inicializando mapa Leaflet...');
        
        if (!this.state.currentVideo || !this.state.currentVideo.gpsTrack) {
            console.log('⚠️ No hay datos GPS para mostrar en el mapa');
            return;
        }
        
        const mapContainer = document.getElementById('playbackMap');
        if (!mapContainer) {
            console.error('❌ No se encontró el contenedor del mapa');
            return;
        }
        
        // Limpiar mapa existente
        this.cleanupMap();
        
        const points = this.state.currentVideo.gpsTrack;
        if (points.length === 0) {
            console.log('⚠️ El track GPS está vacío');
            mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ No hay datos GPS</span></div>';
            return;
        }
        
        // Mostrar mensaje de carga
        mapContainer.innerHTML = '<div class="map-loading"><span>🔄 Cargando mapa...</span></div>';
        
        // Esperar a que Leaflet esté disponible
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet no está cargado');
            mapContainer.innerHTML = '<div class="map-loading"><span>❌ Error cargando mapa</span></div>';
            return;
        }
        
        try {
            // Calcular centro y área del recorrido
            const bounds = this.calculateTrackBounds(points);
            const center = this.calculateTrackCenter(points);
            
            // Crear mapa Leaflet
            this.playbackMap = L.map('playbackMap', {
                center: center,
                zoom: 13,
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: false, // Desactivar zoom con rueda en móvil
                dragging: !this.isIOS,  // Desactivar arrastre en iOS si causa problemas
                tap: !this.isIOS,
                touchZoom: true,
                boxZoom: false,
                doubleClickZoom: true,
                keyboard: false,
                fadeAnimation: true,
                zoomAnimation: true
            });
            
            // Añadir capas de mapa
            this.addMapTileLayers();
            
            // Dibujar la ruta
            this.drawRouteOnMap(points);
            
            // Añadir marcadores de inicio y fin
            this.addStartEndMarkers(points);
            
            // Ajustar vista para mostrar toda la ruta
            this.playbackMap.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 16
            });
            
            // Añadir botón para centrar
            this.addMapControls();
            
            // Forzar redibujado del mapa después de un breve delay
            setTimeout(() => {
                if (this.playbackMap) {
                    this.playbackMap.invalidateSize();
                    console.log('✅ Mapa Leaflet inicializado correctamente');
                }
            }, 300);
            
            // Actualizar información de distancia
            this.updateMapStats(points);
            
        } catch (error) {
            console.error('❌ Error inicializando mapa Leaflet:', error);
            mapContainer.innerHTML = `
                <div class="map-loading" style="color: #ff7675;">
                    <span>❌ Error cargando mapa</span>
                    <br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    // Función auxiliar para calcular límites del track
    calculateTrackBounds(points) {
        let minLat = Infinity, maxLat = -Infinity;
        let minLon = Infinity, maxLon = -Infinity;
        
        points.forEach(point => {
            minLat = Math.min(minLat, point.lat);
            maxLat = Math.max(maxLat, point.lat);
            minLon = Math.min(minLon, point.lon);
            maxLon = Math.max(maxLon, point.lon);
        });
        
        // Añadir un margen del 10%
        const latMargin = (maxLat - minLat) * 0.1;
        const lonMargin = (maxLon - minLon) * 0.1;
        
        return [
            [minLat - latMargin, minLon - lonMargin],
            [maxLat + latMargin, maxLon + lonMargin]
        ];
    }

    // Función auxiliar para calcular centro del track
    calculateTrackCenter(points) {
        let latSum = 0, lonSum = 0;
        points.forEach(point => {
            latSum += point.lat;
            lonSum += point.lon;
        });
        
        return [latSum / points.length, lonSum / points.length];
    }

    // Añadir capas de mapa
    addMapTileLayers() {
        if (!this.playbackMap) return;
        
        // Capa principal: OpenStreetMap Standard
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 2,
            subdomains: ['a', 'b', 'c']
        });
        
        // Capa alternativa: CartoDB Voyager
        const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20,
            subdomains: ['a', 'b', 'c']
        });
        
        // Capa satélite: ESRI World Imagery
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 19
        });
        
        // Añadir capas al mapa
        osmLayer.addTo(this.playbackMap);
        
        // Guardar referencia a las capas
        this.mapTileLayers = {
            "OpenStreetMap": osmLayer,
            "CartoDB Voyager": cartoLayer,
            "Satélite": satelliteLayer
        };
        
        // Añadir control de capas
        L.control.layers(this.mapTileLayers, null, {
            collapsed: true,
            position: 'topright'
        }).addTo(this.playbackMap);
    }

    // Dibujar ruta en el mapa
    drawRouteOnMap(points) {
        if (!this.playbackMap || points.length < 2) return;
        
        // Convertir puntos a formato [lat, lng] para Leaflet
        const latLngs = points.map(point => [point.lat, point.lon]);
        
        // Crear línea para la ruta
        this.mapRouteLayer = L.polyline(latLngs, {
            color: '#00a8ff',
            weight: 4,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            className: 'leaflet-polyline-path'
        }).addTo(this.playbackMap);
        
        // Añadir sombra para mejor visibilidad
        L.polyline(latLngs, {
            color: '#000',
            weight: 6,
            opacity: 0.3,
            lineJoin: 'round',
            lineCap: 'round'
        }).addTo(this.playbackMap);
        
        console.log(`🗺️ Ruta dibujada con ${points.length} puntos`);
    }

    // Añadir marcadores de inicio y fin
    addStartEndMarkers(points) {
        if (!this.playbackMap || points.length === 0) return;
        
        // Marcador de inicio
        const startPoint = points[0];
        this.startMarker = L.marker([startPoint.lat, startPoint.lon], {
            icon: L.divIcon({
                className: 'start-marker',
                iconSize: [12, 12],
                html: '<div></div>'
            }),
            title: 'Punto de inicio',
            alt: 'Punto de inicio'
        }).addTo(this.playbackMap);
        
        this.startMarker.bindTooltip('📍 Punto de inicio', {
            permanent: false,
            direction: 'top',
            offset: [0, -10]
        });
        
        // Marcador de fin (si hay más de un punto)
        if (points.length > 1) {
            const endPoint = points[points.length - 1];
            this.endMarker = L.marker([endPoint.lat, endPoint.lon], {
                icon: L.divIcon({
                    className: 'end-marker',
                    iconSize: [12, 12],
                    html: '<div></div>'
                }),
                title: 'Punto final',
                alt: 'Punto final'
            }).addTo(this.playbackMap);
            
            this.endMarker.bindTooltip('🏁 Punto final', {
                permanent: false,
                direction: 'top',
                offset: [0, -10]
            });
        }
    }

    // Añadir controles al mapa
    addMapControls() {
        if (!this.playbackMap) return;
        
        // Botón para centrar en la ruta
        const centerControl = L.Control.extend({
            options: {
                position: 'bottomright'
            },
            
            onAdd: function() {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                const button = L.DomUtil.create('a', '', container);
                button.innerHTML = '🗺️';
                button.title = 'Centrar en ruta';
                button.style.cssText = `
                    width: 32px;
                    height: 32px;
                    line-height: 30px;
                    text-align: center;
                    background: rgba(30, 39, 46, 0.95);
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                `;
                
                L.DomEvent.on(button, 'click', () => {
                    if (this.playbackMap && this.mapRouteLayer) {
                        this.playbackMap.fitBounds(this.mapRouteLayer.getBounds(), {
                            padding: [30, 30],
                            maxZoom: 16
                        });
                    }
                });
                
                return container;
            }
        });
        
        this.playbackMap.addControl(new centerControl());
    }

    // Actualizar estadísticas del mapa
    updateMapStats(points) {
        if (points.length < 2) return;
        
        // Calcular distancia total
        let totalDistance = 0;
        for (let i = 1; i < points.length; i++) {
            totalDistance += this.calculateDistance(
                points[i-1].lat, points[i-1].lon,
                points[i].lat, points[i].lon
            );
        }
        
        // Calcular tiempo total
        let totalTime = 0;
        if (points[0].timestamp && points[points.length-1].timestamp) {
            totalTime = points[points.length-1].timestamp - points[0].timestamp;
        }
        
        // Actualizar UI
        const distanceElement = document.getElementById('mapDistance');
        const timeElement = document.getElementById('mapTime');
        
        if (distanceElement) {
            distanceElement.textContent = `${totalDistance.toFixed(2)} km`;
        }
        
        if (timeElement) {
            timeElement.textContent = this.formatTime(totalTime);
        }
    }

    // Actualizar marcador de posición actual durante reproducción
    updatePlaybackMap() {
        if (!this.state.currentVideo || !this.state.currentVideo.gpsTrack || !this.playbackMap) return;
        
        const video = this.elements.playbackVideo;
        if (!video || !video.duration) return;
        
        const currentTime = video.currentTime;
        const totalTime = video.duration;
        const progress = currentTime / totalTime;
        
        const points = this.state.currentVideo.gpsTrack;
        const pointIndex = Math.min(Math.floor(progress * points.length), points.length - 1);
        const currentPoint = points[pointIndex];
        
        if (currentPoint) {
            // Actualizar información textual
            this.updateMapInfo(currentPoint);
            
            // Actualizar marcador en el mapa
            this.updateCurrentPositionMarker(currentPoint);
            
            // Actualizar tiempo en el mapa
            const timeElement = document.getElementById('mapTime');
            if (timeElement) {
                timeElement.textContent = this.formatTime(currentTime * 1000);
            }
        }
    }

    // Actualizar información del mapa
    updateMapInfo(point) {
        this.elements.mapLat.textContent = point.lat.toFixed(6);
        this.elements.mapLon.textContent = point.lon.toFixed(6);
        this.elements.mapSpeed.textContent = `${(point.speed * 3.6 || 0).toFixed(1)} km/h`;
        
        if (point.locationName) {
            this.elements.mapCity.textContent = point.locationName;
        } else if (point.city) {
            this.elements.mapCity.textContent = point.city;
        }
    }

    // Actualizar marcador de posición actual
    updateCurrentPositionMarker(point) {
        if (!this.playbackMap || !point) return;
        
        const latLng = [point.lat, point.lon];
        
        // Crear o actualizar marcador
        if (!this.currentPositionMarker) {
            this.currentPositionMarker = L.marker(latLng, {
                icon: L.divIcon({
                    className: 'current-position-marker',
                    iconSize: [16, 16],
                    html: '<div></div>'
                }),
                title: 'Posición actual',
                alt: 'Posición actual',
                zIndexOffset: 1000
            }).addTo(this.playbackMap);
            
            this.currentPositionMarker.bindTooltip('📍 Posición actual', {
                permanent: false,
                direction: 'top',
                offset: [0, -10]
            });
        } else {
            this.currentPositionMarker.setLatLng(latLng);
        }
        
        // Actualizar tooltip con más información
        const tooltipText = `
            <strong>📍 Posición actual</strong><br>
            Lat: ${point.lat.toFixed(6)}<br>
            Lon: ${point.lon.toFixed(6)}<br>
            Vel: ${(point.speed * 3.6 || 0).toFixed(1)} km/h
        `;
        
        this.currentPositionMarker.setTooltipContent(tooltipText);
    }

    // Limpiar mapa
    cleanupMap() {
        if (this.playbackMap) {
            this.playbackMap.remove();
            this.playbackMap = null;
        }
        
        this.mapRouteLayer = null;
        this.startMarker = null;
        this.endMarker = null;
        this.currentPositionMarker = null;
        this.mapMarkers = [];
        this.mapTileLayers = {};
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
        
        // Para el botón de subir GPX en el GPX Manager
        if (this.elements.uploadGpxBtn) {
            this.elements.uploadGpxBtn.addEventListener('click', () => this.handleGpxUpload());
        }

        // Para el botón de seleccionar carpeta local en iOS
        const openFilesBtn = document.getElementById('openFilesAppBtn');
        if (openFilesBtn) {
            openFilesBtn.addEventListener('click', () => {
                // Intentar abrir la app Archivos en iOS
                window.open('shareddocuments://', '_blank');
            });
        }
        // Detener grabación al salir de la página
        window.addEventListener('beforeunload', () => {
            if (this.state.isRecording) {
                this.stopRecording();
            }
        });
    }
    // Añade esta función en la clase DashcamApp, justo después de detectIOS():

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

    // También necesitas la función fixDatabaseVersion():

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