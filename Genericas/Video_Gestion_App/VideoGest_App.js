// VideoGest_App.js - ARCHIVO COMPLETO MODIFICADO
class VideoGestApp {
    constructor() {
        // Configuración de versión
        this.version = '1.0.0';
        this.versionCode = '20251218';
        this.versionName = '1.0.0';
        this.releaseDate = '2025-12-18';
        this.versionNotes = 'Versión inicial con todas las funcionalidades básicas';
        
        this.isOnline = navigator.onLine;
        this.isLocalFile = window.location.protocol === 'file:' || window.location.protocol === 'null:';
        this.lastUpdateCheck = null;
        this.updateAvailable = false;
        this.manifestData = null;
        
        // Detección PWA
        this.isPWAInstalled = false;
        this.deferredPrompt = null;
        
        // Referencia al handler del botón de instalación
        this.installButtonHandler = null;
        
        // Esperar a que se cargue completamente
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
            });
        } else {
            setTimeout(() => {
                this.init();
            }, 500);
        }
    }
    
    async init() {
        console.log(`VideoGest App v${this.version} (${this.versionCode}) inicializando...`);
        
        // Cargar manifest para obtener información de versión
        await this.loadManifest();
        
        // Verificar versión actual vs almacenada
        await this.checkStoredVersion();
        
        // Esperar a que se cargue el sistema de traducciones
        if (!window.videoGestTranslations) {
            console.warn('Esperando sistema de traducciones...');
            await this.waitForTranslations();
        }
        
        // Inicializar componentes
        this.initComponents();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Verificar actualizaciones SOLO si estamos online y no es archivo local
        if (this.isOnline && !this.isLocalFile) {
            await this.checkForUpdates();
        } else {
            console.log('Modo offline o archivo local - omitiendo verificación de actualizaciones');
        }
        
        // Verificar si es PWA instalada
        this.checkPWAInstallation();
        
        // Configurar instalación PWA
        this.setupPWAInstallation();
        
        // Aplicar traducciones iniciales
        if (window.videoGestTranslations) {
            videoGestTranslations.applyTranslations();
        }
        
        // Registrar Service Worker SOLO si no es archivo local
        if (!this.isLocalFile) {
            await this.registerServiceWorker();
        } else {
            console.log('Modo archivo local: ServiceWorker deshabilitado');
            console.log('Para PWA completa, sirve la aplicación desde un servidor web (http://)');
        }
        
        console.log('VideoGest App inicializada correctamente');
    }
    
    async loadManifest() {
        // Si estamos en modo archivo local, usar valores por defecto
        if (this.isLocalFile) {
            console.log('Modo archivo local - usando valores de versión por defecto');
            this.manifestData = {
                version: this.version,
                version_code: this.versionCode,
                version_name: this.versionName,
                release_date: this.releaseDate,
                version_notes: this.versionNotes
            };
            return;
        }
        
        try {
            const response = await fetch('VideoGest_Manifest.json?v=' + Date.now());
            this.manifestData = await response.json();
            
            // Actualizar versión desde manifest si está disponible
            if (this.manifestData.version) {
                this.version = this.manifestData.version;
            }
            if (this.manifestData.version_code) {
                this.versionCode = this.manifestData.version_code;
            }
            if (this.manifestData.version_name) {
                this.versionName = this.manifestData.version_name;
            }
            if (this.manifestData.release_date) {
                this.releaseDate = this.manifestData.release_date;
            }
            if (this.manifestData.version_notes) {
                this.versionNotes = this.manifestData.version_notes;
            }
            
            console.log('Manifest cargado:', this.manifestData);
        } catch (error) {
            console.warn('No se pudo cargar el manifest, usando versión por defecto:', error.message);
            
            // Usar valores por defecto
            this.manifestData = {
                version: this.version,
                version_code: this.versionCode,
                version_name: this.versionName,
                release_date: this.releaseDate,
                version_notes: this.versionNotes
            };
        }
    }
    
    async checkStoredVersion() {
        if (window.videoGestStorage) {
            const storedVersion = window.videoGestStorage.getSetting('app_version');
            const storedVersionCode = window.videoGestStorage.getSetting('app_version_code');
            
            // Si no hay versión almacenada, establecer la actual
            if (!storedVersion || !storedVersionCode) {
                window.videoGestStorage.updateSetting('app_version', this.version);
                window.videoGestStorage.updateSetting('app_version_code', this.versionCode);
                window.videoGestStorage.updateSetting('app_last_updated', new Date().toISOString());
                console.log('Versión inicial almacenada:', this.version);
                return;
            }
            
            // Verificar si hay cambio de versión
            if (storedVersion !== this.version || storedVersionCode !== this.versionCode) {
                console.log(`Actualización de versión detectada: ${storedVersion} -> ${this.version}`);
                
                // Mostrar notificación de nueva versión si es la primera vez que se ejecuta
                if (storedVersion && window.videoGestUI) {
                    const updateMessage = `
                        <h3>¡Nueva versión disponible!</h3>
                        <p><strong>${storedVersion} → ${this.version}</strong></p>
                        <p><em>${this.versionNotes}</em></p>
                        <p>Fecha: ${this.releaseDate}</p>
                    `;
                    
                    window.videoGestUI.showMessage(
                        'Aplicación actualizada',
                        updateMessage,
                        'info',
                        8000
                    );
                }
                
                // Actualizar versión almacenada
                window.videoGestStorage.updateSetting('app_version', this.version);
                window.videoGestStorage.updateSetting('app_version_code', this.versionCode);
                window.videoGestStorage.updateSetting('app_last_updated', new Date().toISOString());
                
                // Limpiar cache si hay un cambio mayor de versión
                await this.handleVersionMigration(storedVersion, this.version);
            }
        }
    }
    
    async handleVersionMigration(oldVersion, newVersion) {
        console.log(`Migrando de ${oldVersion} a ${newVersion}`);
        
        // Solo limpiar cache si no estamos en modo archivo local
        if (this.isLocalFile) {
            console.log('Modo archivo local - omitiendo limpieza de cache');
            return;
        }
        
        // Aquí puedes agregar lógica específica para migraciones entre versiones
        const oldMajor = oldVersion ? parseInt(oldVersion.split('.')[0]) : 0;
        const newMajor = parseInt(newVersion.split('.')[0]);
        
        if (newMajor > oldMajor) {
            console.log('Cambio mayor de versión, limpiando cache...');
            
            // Limpiar cache del Service Worker
            if ('caches' in window) {
                try {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                    console.log('Cache limpiado exitosamente');
                } catch (error) {
                    console.error('Error limpiando cache:', error);
                }
            }
        }
    }
    
    async checkForUpdates() {
        // Solo verificar actualizaciones si estamos online y no es archivo local
        if (!this.isOnline || this.isLocalFile) {
            console.log('Modo offline o archivo local - omitiendo verificación de actualizaciones');
            return false;
        }
        
        this.lastUpdateCheck = new Date();
        
        try {
            // Intentar cargar el manifest del servidor (sin cache)
            const response = await fetch('VideoGest_Manifest.json?_=' + Date.now());
            const serverManifest = await response.json();
            
            // Comparar versiones
            if (serverManifest.version_code && serverManifest.version_code !== this.versionCode) {
                console.log(`Actualización disponible en servidor: ${this.versionCode} -> ${serverManifest.version_code}`);
                this.updateAvailable = true;
                
                // Mostrar notificación si la interfaz está disponible
                if (window.videoGestUI) {
                    this.showUpdateNotification(serverManifest);
                }
                
                return true;
            }
            
            console.log('La aplicación está actualizada');
            this.updateAvailable = false;
            return false;
            
        } catch (error) {
            console.log('No se pudo verificar actualizaciones:', error.message);
            return false;
        }
    }
    
    showUpdateNotification(serverManifest) {
        const updateInfo = {
            currentVersion: this.version,
            newVersion: serverManifest.version,
            currentCode: this.versionCode,
            newCode: serverManifest.version_code,
            notes: serverManifest.version_notes || 'Mejoras y correcciones de errores',
            date: serverManifest.release_date || 'Próximamente'
        };
        
        // Guardar información de actualización
        if (window.videoGestStorage) {
            window.videoGestStorage.updateSetting('update_available', true);
            window.videoGestStorage.updateSetting('update_info', updateInfo);
        }
        
        // Mostrar notificación no intrusiva
        if (window.videoGestUI && window.videoGestUI.showMessage) {
            const notificationHTML = `
                <h3>¡Actualización disponible!</h3>
                <p><strong>Versión ${updateInfo.currentVersion} → ${updateInfo.newVersion}</strong></p>
                <p><em>${updateInfo.notes}</em></p>
                <p>Recarga la página para actualizar.</p>
            `;
            
            window.videoGestUI.showMessage(
                'Actualización disponible',
                notificationHTML,
                'info',
                10000
            );
        }
    }
    
    async waitForTranslations() {
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (window.videoGestTranslations) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout de seguridad
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('Timeout esperando traducciones');
                resolve();
            }, 5000);
        });
    }
    
    initComponents() {
        // Los componentes ya están inicializados en sus propios archivos
        // Esta función es para cualquier inicialización adicional
        console.log('Componentes de la aplicación inicializados');
    }
    
    setupEventListeners() {
        // Estado de conexión
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNetworkStatus('online');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNetworkStatus('offline');
        });
        
        // Cambio de idioma
        document.addEventListener('languageChanged', (e) => {
            console.log(`Idioma cambiado a: ${e.detail.language}`);
            if (window.videoGestStorage) {
                window.videoGestStorage.updateSetting('language', e.detail.language);
            }
        });
        
        // Manejar parámetros de URL
        this.handleURLParameters();
    }
    
    showNetworkStatus(status) {
        const message = status === 'online' 
            ? 'Conexión restablecida'
            : 'Sin conexión - La aplicación funciona en modo offline';
        
        const type = status === 'online' ? 'success' : 'warning';
        
        if (window.videoGestUI && window.videoGestUI.showMessage) {
            window.videoGestUI.showMessage(
                status === 'online' ? 'En línea' : 'Sin conexión',
                message,
                type
            );
        }
    }
    
    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action && window.videoGestUI) {
            setTimeout(() => {
                window.videoGestUI.handleOperationSelect(action);
            }, 1000);
        }
    }
    
    async registerServiceWorker() {
        // Solo registrar Service Worker si no es archivo local y el navegador lo soporta
        if (this.isLocalFile) {
            console.log('Modo archivo local - ServiceWorker deshabilitado');
            return null;
        }
        
        if ('serviceWorker' in navigator) {
            try {
                // Incluir versión en la URL del Service Worker para forzar actualización
                const swUrl = `VideoGest_ServiceWorker.js?v=${this.versionCode}`;
                const registration = await navigator.serviceWorker.register(swUrl);
                
                console.log('ServiceWorker registrado correctamente:', registration);
                
                // Verificar actualizaciones del Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Nueva versión del Service Worker encontrada:', newWorker);
                    
                    newWorker.addEventListener('statechange', () => {
                        console.log('Estado del nuevo Service Worker:', newWorker.state);
                        
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nuevo Service Worker instalado, mostrar notificación
                            console.log('Nuevo Service Worker listo para activar');
                        }
                    });
                });
                
                // Verificar actualizaciones periódicamente
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Cada hora
                
                return registration;
                
            } catch (error) {
                console.error('Error registrando ServiceWorker:', error.message);
                return null;
            }
        } else {
            console.log('ServiceWorker no soportado en este navegador');
            return null;
        }
    }
    
    // === MÉTODOS PARA PWA INSTALACIÓN ===
    
    checkPWAInstallation() {
        // Método 1: Verificar display mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
        const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
        
        // Método 2: Verificar si se abrió desde la pantalla de inicio
        const isLaunchedFromHomeScreen = ('standalone' in window.navigator) && window.navigator.standalone;
        
        // Método 3: Verificar user agent en iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIOSStandalone = isIOS && isSafari && window.navigator.standalone;
        
        this.isPWAInstalled = isStandalone || isFullscreen || isMinimalUI || isLaunchedFromHomeScreen || isIOSStandalone;
        
        console.log('Verificación PWA:');
        console.log('- Display mode standalone:', isStandalone);
        console.log('- Display mode fullscreen:', isFullscreen);
        console.log('- Display mode minimal-ui:', isMinimalUI);
        console.log('- Launched from home screen:', isLaunchedFromHomeScreen);
        console.log('- iOS Standalone:', isIOSStandalone);
        console.log('- PWA Instalada:', this.isPWAInstalled);
        
        return this.isPWAInstalled;
    }
    
    setupPWAInstallation() {
        console.log('=== Configurando instalación PWA ===');
        console.log('- PWA instalada:', this.isPWAInstalled);
        console.log('- Archivo local:', this.isLocalFile);
        console.log('- Sistema operativo:', this.detectOS());
        console.log('- Navegador:', this.detectBrowser());
        
        // Solo configurar instalación PWA si no está instalada y no es archivo local
        if (this.isPWAInstalled) {
            console.log('PWA ya instalada - ocultando botón');
            this.hideInstallButton();
            return;
        }
        
        if (this.isLocalFile) {
            console.log('Modo archivo local - deshabilitando instalación PWA');
            this.hideInstallButton();
            return;
        }
        
        // Evento beforeinstallprompt - se dispara cuando el navegador quiere mostrar el prompt de instalación
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('✅ Evento beforeinstallprompt capturado');
            
            // Prevenir que el navegador muestre el prompt automático
            e.preventDefault();
            
            // Guardar el evento para usarlo después
            this.deferredPrompt = e;
            
            // Mostrar nuestro botón de instalación
            this.showInstallButton();
            this.setupInstallButtonListener();
            
            // Para Chrome en Windows, mostrar ayuda adicional
            if (this.isChromeOnWindows()) {
                console.log('Chrome en Windows - icono 📦 aparecerá en la barra de navegación');
                setTimeout(() => {
                    this.showChromeInstallHint();
                }, 3000);
            }
        });
        
        // Evento appinstalled - se dispara cuando la PWA se instala
        window.addEventListener('appinstalled', (e) => {
            console.log('🎉 PWA instalada exitosamente');
            this.isPWAInstalled = true;
            this.hideInstallButton();
            
            // Mostrar mensaje de éxito
            if (window.videoGestUI && window.videoGestUI.showMessage) {
                window.videoGestUI.showMessage(
                    '✅ Aplicación instalada',
                    'VideoGest se ha instalado correctamente en tu dispositivo.',
                    'success',
                    5000
                );
            }
            
            // Actualizar almacenamiento
            if (window.videoGestStorage) {
                window.videoGestStorage.updateSetting('pwa_installed', true);
                window.videoGestStorage.updateSetting('pwa_install_date', new Date().toISOString());
            }
            
            // Limpiar el prompt
            this.deferredPrompt = null;
        });
        
        // Para Chrome en Windows, verificar si ya es instalable
        if (this.isChromeOnWindows()) {
            console.log('🔧 Configuración especial para Chrome en Windows');
            
            setTimeout(() => {
                this.checkChromeInstallability();
            }, 3000);
        }
        
        // Verificar si ya pasó el evento beforeinstallprompt
        setTimeout(() => {
            console.log('Verificando estado de instalación PWA...');
            console.log('- DeferredPrompt:', this.deferredPrompt ? 'Disponible' : 'No disponible');
            console.log('- PWA instalada:', this.isPWAInstalled);
            
            if (!this.deferredPrompt && !this.isPWAInstalled) {
                console.log('⚠️ beforeinstallprompt no se disparó');
                
                // Mostrar botón de todos modos para dar instrucciones
                this.showInstallButton();
                this.setupInstallButtonListener();
                
                // Para Chrome en Windows, mostrar instrucciones específicas
                if (this.isChromeOnWindows()) {
                    setTimeout(() => {
                        this.showChromeWindowsInstructions();
                    }, 5000);
                }
            }
        }, 2000);
        
        console.log('=== Fin configuración PWA ===');
    }
    
    setupInstallButtonListener() {
        const installButton = document.getElementById('install-button');
        if (!installButton) {
            console.error('❌ Botón de instalación no encontrado en el DOM');
            return;
        }
        
        console.log('🔧 Configurando event listener para botón de instalación');
        
        // Remover listeners anteriores para evitar duplicados
        const newButton = installButton.cloneNode(true);
        if (installButton.parentNode) {
            installButton.parentNode.replaceChild(newButton, installButton);
        }
        
        // Obtener la nueva referencia
        const currentButton = document.getElementById('install-button');
        
        // Agregar event listener
        currentButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Botón de instalación clickeado');
            
            // Efecto visual
            currentButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                currentButton.style.transform = '';
            }, 150);
            
            if (this.deferredPrompt) {
                console.log('📱 Mostrando prompt de instalación PWA...');
                await this.installPWA();
            } else {
                console.log('📋 No hay prompt disponible, mostrando instrucciones');
                this.showManualInstallInstructions();
            }
        });
        
        console.log('✅ Event listener configurado correctamente');
    }
    
    showInstallButton() {
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'flex';
            
            // Aplicar traducción al texto
            if (window.videoGestTranslations) {
                const installText = installButton.querySelector('.install-text');
                if (installText) {
                    installText.textContent = window.videoGestTranslations.get('installApp');
                }
            }
            
            // Asegurar visibilidad
            installButton.style.opacity = '1';
            installButton.style.visibility = 'visible';
            installButton.style.pointerEvents = 'auto';
            
            // Animación de atención
            installButton.classList.add('pulse');
            
            console.log('👁️ Botón de instalación mostrado');
            
        } else {
            console.warn('⚠️ Botón de instalación no encontrado en showInstallButton');
        }
    }
    
    hideInstallButton() {
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'none';
            installButton.classList.remove('pulse');
            console.log('👁️‍🗨️ Botón de instalación ocultado');
        }
    }
    
    // === MÉTODOS DE DETECCIÓN ===
    
    detectOS() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.indexOf('Windows') !== -1) return 'Windows';
        if (userAgent.indexOf('Mac') !== -1) return 'macOS';
        if (userAgent.indexOf('Linux') !== -1) return 'Linux';
        if (userAgent.indexOf('Android') !== -1) return 'Android';
        if (userAgent.indexOf('iOS') !== -1 || userAgent.indexOf('iPhone') !== -1) return 'iOS';
        
        return 'Unknown';
    }
    
    detectBrowser() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Edge') === -1) return 'Chrome';
        if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
        if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) return 'Safari';
        if (userAgent.indexOf('Edge') !== -1) return 'Edge';
        if (userAgent.indexOf('OPR') !== -1 || userAgent.indexOf('Opera') !== -1) return 'Opera';
        
        return 'Unknown';
    }
    
    isChromeOnWindows() {
        return this.detectOS() === 'Windows' && this.detectBrowser() === 'Chrome';
    }
    
    checkInstallCriteria() {
        const isHTTPS = window.location.protocol === 'https:';
        const isHTTP = window.location.protocol === 'http:';
        const hasServiceWorker = 'serviceWorker' in navigator;
        const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
        
        console.log('🔍 Verificando criterios PWA:');
        console.log('- HTTPS:', isHTTPS);
        console.log('- HTTP:', isHTTP);
        console.log('- Service Worker soportado:', hasServiceWorker);
        console.log('- Manifest encontrado:', hasManifest);
        
        return (isHTTPS || isHTTP) && hasManifest;
    }
    
    checkChromeInstallability() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        if (!isStandalone) {
            console.log('Chrome puede mostrar el icono de instalación 📦 en la barra de navegación');
            
            // Mostrar ayuda después de un tiempo
            setTimeout(() => {
                if (!this.isPWAInstalled && !this.deferredPrompt) {
                    this.showChromeInstallHint();
                }
            }, 8000);
        }
    }
    
    showChromeInstallHint() {
        const currentLang = window.videoGestTranslations ? window.videoGestTranslations.getCurrentLanguage() : 'es';
        
        let message = '';
        let title = '';
        
        if (currentLang === 'es') {
            title = 'Instalar VideoGest';
            message = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 2.5rem; margin-bottom: 15px;">📦</div>
                    <p><strong>¿Quieres instalar VideoGest?</strong></p>
                    <p>Busca el icono de instalación en Chrome:</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #dee2e6;">
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <span style="background: #4285f4; color: white; padding: 6px 12px; border-radius: 4px; font-family: monospace;">
                                video-gest.app
                            </span>
                            <span style="margin: 0 15px; font-size: 1.5rem;">→</span>
                            <span style="background: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #ddd; font-size: 1.5rem;">
                                📦
                            </span>
                        </div>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">(Aparece a la derecha de la barra de direcciones)</p>
                    </div>
                    <p>O usa el botón <strong>"Instalar App"</strong> en esta página.</p>
                </div>
            `;
        } else if (currentLang === 'en') {
            title = 'Install VideoGest';
            message = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 2.5rem; margin-bottom: 15px;">📦</div>
                    <p><strong>Want to install VideoGest?</strong></p>
                    <p>Look for the install icon in Chrome:</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #dee2e6;">
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <span style="background: #4285f4; color: white; padding: 6px 12px; border-radius: 4px; font-family: monospace;">
                                video-gest.app
                            </span>
                            <span style="margin: 0 15px; font-size: 1.5rem;">→</span>
                            <span style="background: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #ddd; font-size: 1.5rem;">
                                📦
                            </span>
                        </div>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">(Appears to the right of the address bar)</p>
                    </div>
                    <p>Or use the <strong>"Install App"</strong> button on this page.</p>
                </div>
            `;
        } else if (currentLang === 'ca') {
            title = 'Instal·lar VideoGest';
            message = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 2.5rem; margin-bottom: 15px;">📦</div>
                    <p><strong>Vols instal·lar VideoGest?</strong></p>
                    <p>Cerca la icona d'instal·lació a Chrome:</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #dee2e6;">
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <span style="background: #4285f4; color: white; padding: 6px 12px; border-radius: 4px; font-family: monospace;">
                                video-gest.app
                            </span>
                            <span style="margin: 0 15px; font-size: 1.5rem;">→</span>
                            <span style="background: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #ddd; font-size: 1.5rem;">
                                📦
                            </span>
                        </div>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">(Apareix a la dreta de la barra d'adreces)</p>
                    </div>
                    <p>O usa el botó <strong>"Instal·lar App"</strong> en aquesta pàgina.</p>
                </div>
            `;
        } else if (currentLang === 'fr') {
            title = 'Installer VideoGest';
            message = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 2.5rem; margin-bottom: 15px;">📦</div>
                    <p><strong>Voulez-vous installer VideoGest ?</strong></p>
                    <p>Recherchez l'icône d'installation dans Chrome :</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #dee2e6;">
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <span style="background: #4285f4; color: white; padding: 6px 12px; border-radius: 4px; font-family: monospace;">
                                video-gest.app
                            </span>
                            <span style="margin: 0 15px; font-size: 1.5rem;">→</span>
                            <span style="background: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #ddd; font-size: 1.5rem;">
                                📦
                            </span>
                        </div>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">(Apparaît à droite de la barre d'adresse)</p>
                    </div>
                    <p>Ou utilisez le bouton <strong>"Installer App"</strong> sur cette page.</p>
                </div>
            `;
        }
        
        if (window.videoGestUI && window.videoGestUI.showMessage) {
            window.videoGestUI.showMessage(
                title,
                message,
                'info',
                10000
            );
        }
    }
    
    showChromeWindowsInstructions() {
        const currentLang = window.videoGestTranslations ? window.videoGestTranslations.getCurrentLanguage() : 'es';
        
        let instructions = '';
        let title = '';
        
        if (currentLang === 'es') {
            title = 'Instalar en Chrome (Windows)';
            instructions = `
                <div style="max-width: 500px;">
                    <h3 style="text-align: center; margin-bottom: 20px;">📦 Instalar en Chrome (Windows)</h3>
                    <p>En Chrome para Windows, hay dos formas de instalar:</p>
                    
                    <div style="margin: 20px 0;">
                        <h4 style="color: #4285f4;">Método 1: Icono en la barra de navegación</h4>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <div style="display: flex; align-items: center; justify-content: center; margin: 10px 0;">
                                <div style="background: #4285f4; color: white; padding: 8px 15px; border-radius: 4px; font-family: monospace; font-weight: bold;">
                                    ${window.location.hostname || 'video-gest.app'}
                                </div>
                                <div style="margin: 0 15px; font-size: 1.5rem;">→</div>
                                <div style="background: white; padding: 10px; border-radius: 50%; border: 2px solid #4285f4; font-size: 1.5rem;">
                                    📦
                                </div>
                            </div>
                        </div>
                        <ol style="margin-left: 20px;">
                            <li>Busca el icono <strong>📦</strong> a la derecha de la barra de direcciones</li>
                            <li>Haz clic en el icono</li>
                            <li>Selecciona "Instalar VideoGest"</li>
                        </ol>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h4 style="color: #4285f4;">Método 2: Menú de Chrome</h4>
                        <ol style="margin-left: 20px;">
                            <li>Haz clic en los tres puntos <strong>⋮</strong> (esquina superior derecha)</li>
                            <li>Selecciona <strong>"Instalar VideoGest"</strong></li>
                            <li>Confirma la instalación</li>
                        </ol>
                    </div>
                    
                    <div style="background: #e8f4fd; border-left: 4px solid #4285f4; padding: 12px; margin: 15px 0; border-radius: 0 4px 4px 0;">
                        <p><strong>💡 Consejo:</strong> El icono 📦 puede tardar unos segundos en aparecer.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="close-chrome-instructions" style="padding: 10px 25px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            Entendido
                        </button>
                    </div>
                </div>
            `;
        } else if (currentLang === 'en') {
            title = 'Install in Chrome (Windows)';
            instructions = `
                <div style="max-width: 500px;">
                    <h3 style="text-align: center; margin-bottom: 20px;">📦 Install in Chrome (Windows)</h3>
                    <p>In Chrome for Windows, there are two ways to install:</p>
                    
                    <div style="margin: 20px 0;">
                        <h4 style="color: #4285f4;">Method 1: Icon in navigation bar</h4>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <div style="display: flex; align-items: center; justify-content: center; margin: 10px 0;">
                                <div style="background: #4285f4; color: white; padding: 8px 15px; border-radius: 4px; font-family: monospace; font-weight: bold;">
                                    ${window.location.hostname || 'video-gest.app'}
                                </div>
                                <div style="margin: 0 15px; font-size: 1.5rem;">→</div>
                                <div style="background: white; padding: 10px; border-radius: 50%; border: 2px solid #4285f4; font-size: 1.5rem;">
                                    📦
                                </div>
                            </div>
                        </div>
                        <ol style="margin-left: 20px;">
                            <li>Look for the <strong>📦</strong> icon to the right of the address bar</li>
                            <li>Click the icon</li>
                            <li>Select "Install VideoGest"</li>
                        </ol>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h4 style="color: #4285f4;">Method 2: Chrome menu</h4>
                        <ol style="margin-left: 20px;">
                            <li>Click the three dots <strong>⋮</strong> (top right corner)</li>
                            <li>Select <strong>"Install VideoGest"</strong></li>
                            <li>Confirm installation</li>
                        </ol>
                    </div>
                    
                    <div style="background: #e8f4fd; border-left: 4px solid #4285f4; padding: 12px; margin: 15px 0; border-radius: 0 4px 4px 0;">
                        <p><strong>💡 Tip:</strong> The 📦 icon may take a few seconds to appear.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="close-chrome-instructions" style="padding: 10px 25px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            Got it
                        </button>
                    </div>
                </div>
            `;
        }
        
        if (window.videoGestUI && window.videoGestUI.showMessage) {
            window.videoGestUI.showMessage(
                title,
                instructions,
                'info',
                0
            );
            
            // Agregar event listener para cerrar
            setTimeout(() => {
                const closeBtn = document.getElementById('close-chrome-instructions');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        window.videoGestUI.closeCurrentMessage();
                    });
                }
            }, 100);
        }
    }
    
    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('⚠️ No hay prompt de instalación disponible');
            this.showManualInstallInstructions();
            return;
        }
        
        console.log('📲 Mostrando prompt de instalación PWA...');
        
        try {
            this.deferredPrompt.prompt();
            const choiceResult = await this.deferredPrompt.userChoice;
            
            console.log(`👤 Usuario eligió: ${choiceResult.outcome}`);
            
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ Usuario aceptó la instalación PWA');
                
                if (window.videoGestUI && window.videoGestUI.showMessage) {
                    window.videoGestUI.showMessage(
                        '⏳ Instalación en progreso',
                        'La aplicación se está instalando. Por favor, sigue las instrucciones en pantalla.',
                        'info',
                        3000
                    );
                }
            } else {
                console.log('❌ Usuario canceló la instalación PWA');
                this.showInstallationCancelledMessage();
            }
            
            this.deferredPrompt = null;
            this.hideInstallButton();
            
        } catch (error) {
            console.error('💥 Error durante la instalación PWA:', error);
            
            if (window.videoGestUI && window.videoGestUI.showMessage) {
                window.videoGestUI.showMessage(
                    '❌ Error de instalación',
                    `Hubo un error al intentar instalar la aplicación: ${error.message}`,
                    'error',
                    5000
                );
            }
        }
    }
    
    showInstallationCancelledMessage() {
        const currentLang = window.videoGestTranslations ? window.videoGestTranslations.getCurrentLanguage() : 'es';
        
        let title = '';
        let message = '';
        let buttonText = '';
        
        if (currentLang === 'es') {
            title = 'Instalación cancelada';
            buttonText = 'Intentar de nuevo';
            message = `
                <p>Instalación cancelada. Puedes instalar VideoGest más tarde:</p>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li>En Chrome/Edge: Haz clic en el menú (⋮) → "Instalar VideoGest"</li>
                    <li>En Firefox: Haz clic en el menú (☰) → "Instalar"</li>
                    <li>Busca el icono 📦 en la barra de navegación</li>
                </ol>
                <button id="try-again-later" style="margin-top: 15px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ${buttonText}
                </button>
            `;
        } else if (currentLang === 'en') {
            title = 'Installation cancelled';
            buttonText = 'Try again';
            message = `
                <p>Installation cancelled. You can install VideoGest later:</p>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li>In Chrome/Edge: Click the menu (⋮) → "Install VideoGest"</li>
                    <li>In Firefox: Click the menu (☰) → "Install"</li>
                    <li>Look for the 📦 icon in the navigation bar</li>
                </ol>
                <button id="try-again-later" style="margin-top: 15px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ${buttonText}
                </button>
            `;
        }
        
        if (window.videoGestUI && window.videoGestUI.showMessage) {
            window.videoGestUI.showMessage(
                title,
                message,
                'warning',
                0
            );
            
            setTimeout(() => {
                const tryAgainBtn = document.getElementById('try-again-later');
                if (tryAgainBtn) {
                    tryAgainBtn.addEventListener('click', () => {
                        this.installPWA();
                        window.videoGestUI.closeCurrentMessage();
                    });
                }
            }, 100);
        }
    }
    
    showManualInstallInstructions() {
        const currentLang = window.videoGestTranslations ? window.videoGestTranslations.getCurrentLanguage() : 'es';
        
        let instructions = '';
        let title = '';
        let closeButton = '';
        
        if (currentLang === 'es') {
            title = 'Instalar aplicación';
            closeButton = 'Entendido';
            instructions = `
                <div style="max-width: 500px; color: #333;">
                    <h3 style="text-align: center; margin-bottom: 20px; color: #333;">📱 Instalar VideoGest como aplicación</h3>
                    <p style="color: #333;">Para instalar VideoGest en tu dispositivo:</p>
                    
                    <div style="margin: 20px 0;">
                        <h4 style="color: #4285f4;">Google Chrome / Microsoft Edge:</h4>
                        <ol style="margin-left: 20px; color: #333;">
                            <li>Haz clic en el menú (⋮) en la esquina superior derecha</li>
                            <li>Selecciona "<strong>Instalar VideoGest</strong>"</li>
                            <li>Confirma la instalación en el diálogo que aparece</li>
                        </ol>
                        
                        <h4 style="color: #4285f4; margin-top: 20px;">Mozilla Firefox:</h4>
                        <ol style="margin-left: 20px; color: #333;">
                            <li>Haz clic en el menú (☰) en la esquina superior derecha</li>
                            <li>Selecciona "<strong>Instalar</strong>" o "<strong>Instalar VideoGest</strong>"</li>
                            <li>Sigue las instrucciones en pantalla</li>
                        </ol>
                    </div>
                    
                    <div style="background: #e8f4fd; border-left: 4px solid #4285f4; padding: 12px; margin: 15px 0; border-radius: 0 4px 4px 0;">
                        <p style="color: #333; margin: 0;"><strong>💡 En Chrome para Windows:</strong></p>
                        <p style="color: #333; margin: 5px 0 0 0;">
                            Busca el icono <strong>📦</strong> a la derecha de la barra de direcciones y haz clic en él.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="close-manual-instructions" style="padding: 10px 25px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            ${closeButton}
                        </button>
                    </div>
                </div>
            `;
        } else if (currentLang === 'en') {
            title = 'Install app';
            closeButton = 'Got it';
            instructions = `
                <div style="max-width: 500px; color: #333;">
                    <h3 style="text-align: center; margin-bottom: 20px; color: #333;">📱 Install VideoGest as an app</h3>
                    <p style="color: #333;">To install VideoGest on your device:</p>
                    
                    <div style="margin: 20px 0;">
                        <h4 style="color: #4285f4;">Google Chrome / Microsoft Edge:</h4>
                        <ol style="margin-left: 20px; color: #333;">
                            <li>Click the menu (⋮) in the top right corner</li>
                            <li>Select "<strong>Install VideoGest</strong>"</li>
                            <li>Confirm the installation in the dialog that appears</li>
                        </ol>
                        
                        <h4 style="color: #4285f4; margin-top: 20px;">Mozilla Firefox:</h4>
                        <ol style="margin-left: 20px; color: #333;">
                            <li>Click the menu (☰) in the top right corner</li>
                            <li>Select "<strong>Install</strong>" or "<strong>Install VideoGest</strong>"</li>
                            <li>Follow the on-screen instructions</li>
                        </ol>
                    </div>
                    
                    <div style="background: #e8f4fd; border-left: 4px solid #4285f4; padding: 12px; margin: 15px 0; border-radius: 0 4px 4px 0;">
                        <p style="color: #333; margin: 0;"><strong>💡 In Chrome for Windows:</strong></p>
                        <p style="color: #333; margin: 5px 0 0 0;">
                            Look for the <strong>📦</strong> icon to the right of the address bar and click it.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="close-manual-instructions" style="padding: 10px 25px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            ${closeButton}
                        </button>
                    </div>
                </div>
            `;
        } else if (currentLang === 'ca') {
            title = 'Instal·lar aplicació';
            closeButton = 'Entesos';
            instructions = `
                <div style="max-width: 500px; color: #333;">
                    <h3 style="text-align: center; margin-bottom: 20px; color: #333;">📱 Instal·lar VideoGest com a aplicació</h3>
                    <p style="color: #333;">Per instal·lar VideoGest al teu dispositiu:</p>
                    
                    <div style="margin: 20px 0;">
                        <h4 style="color: #4285f4;">Google Chrome / Microsoft Edge:</h4>
                        <ol style="margin-left: 20px; color: #333;">
                            <li>Fes clic al menú (⋮) a la cantonada superior dreta</li>
                            <li>Selecciona "<strong>Instal·lar VideoGest</strong>"</li>
                            <li>Confirma la instal·lació al diàleg que apareix</li>
                        </ol>
                        
                        <h4 style="color: #4285f4; margin-top: 20px;">Mozilla Firefox:</h4>
                        <ol style="margin-left: 20px; color: #333;">
                            <li>Fes clic al menú (☰) a la cantonada superior dreta</li>
                            <li>Selecciona "<strong>Instal·lar</strong>" o "<strong>Instal·lar VideoGest</strong>"</li>
                            <li>Segueix les instruccions a pantalla</li>
                        </ol>
                    </div>
                    
                    <div style="background: #e8f4fd; border-left: 4px solid #4285f4; padding: 12px; margin: 15px 0; border-radius: 0 4px 4px 0;">
                        <p style="color: #333; margin: 0;"><strong>💡 A Chrome per Windows:</strong></p>
                        <p style="color: #333; margin: 5px 0 0 0;">
                            Cerca la icona <strong>📦</strong> a la dreta de la barra d'adreces i fes-hi clic.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="close-manual-instructions" style="padding: 10px 25px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            ${closeButton}
                        </button>
                    </div>
                </div>
            `;
        } else if (currentLang === 'fr') {
            title = 'Installer application';
            closeButton = 'Compris';
            instructions = `
                <div style="max-width: 500px; color: #333;">
                    <h3 style="text-align: center; margin-bottom: 20px; color: #333;">📱 Installer VideoGest comme application</h3>
                    <p style="color: #333;">Pour installer VideoGest sur votre appareil :</p>
                    
                    <div style="margin: 20px 0;">
                        <h4 style="color: #4285f4;">Google Chrome / Microsoft Edge :</h4>
                        <ol style="margin-left: 20px; color: #333;">
                            <li>Cliquez sur le menu (⋮) dans le coin supérieur droit</li>
                            <li>Sélectionnez "<strong>Installer VideoGest</strong>"</li>
                            <li>Confirmez l'installation dans la boîte de dialogue qui apparaît</li>
                        </ol>
                        
                        <h4 style="color: #4285f4; margin-top: 20px;">Mozilla Firefox :</h4>
                        <ol style="margin-left: 20px; color: #333;">
                            <li>Cliquez sur le menu (☰) dans le coin supérieur droit</li>
                            <li>Sélectionnez "<strong>Installer</strong>" ou "<strong>Installer VideoGest</strong>"</li>
                            <li>Suivez les instructions à l'écran</li>
                        </ol>
                    </div>
                    
                    <div style="background: #e8f4fd; border-left: 4px solid #4285f4; padding: 12px; margin: 15px 0; border-radius: 0 4px 4px 0;">
                        <p style="color: #333; margin: 0;"><strong>💡 Dans Chrome pour Windows :</strong></p>
                        <p style="color: #333; margin: 5px 0 0 0;">
                            Recherchez l'icône <strong>📦</strong> à droite de la barre d'adresse et cliquez dessus.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="close-manual-instructions" style="padding: 10px 25px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            ${closeButton}
                        </button>
                    </div>
                </div>
            `;
        }
        
        if (window.videoGestUI && window.videoGestUI.showMessage) {
            window.videoGestUI.showMessage(
                title,
                instructions,
                'info',
                0
            );
            
            setTimeout(() => {
                const closeBtn = document.getElementById('close-manual-instructions');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        window.videoGestUI.closeCurrentMessage();
                    });
                }
            }, 100);
        }
    }
    
    // === FIN MÉTODOS PWA ===
    
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return 'standalone';
        } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
            return 'fullscreen';
        } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
            return 'minimal-ui';
        } else if (window.matchMedia('(display-mode: browser)').matches) {
            return 'browser';
        } else {
            return 'unknown';
        }
    }
    
    getVersionInfo() {
        return {
            version: this.version,
            version_code: this.versionCode,
            version_name: this.versionName,
            release_date: this.releaseDate,
            version_notes: this.versionNotes,
            last_update_check: this.lastUpdateCheck,
            update_available: this.updateAvailable,
            manifest_data: this.manifestData,
            is_local_file: this.isLocalFile,
            protocol: window.location.protocol
        };
    }
    
    getAppInfo() {
        const versionInfo = this.getVersionInfo();
        
        return {
            ...versionInfo,
            name: 'VideoGest',
            author: 'Roberto Benet',
            email: 'rbenet71@gmail.com',
            lastUpdate: 'V_18_12_2025',
            features: [
                'Reducción de tamaño de video',
                'Corte de video',
                'Conversión de formato',
                'Reversión de video',
                'Extracción de frames JPG',
                'Unión de videos'
            ],
            requirements: {
                browser: 'Chrome 80+, Firefox 75+, Edge 80+',
                pwa: 'Soporte para Service Workers (solo en HTTP/HTTPS)',
                storage: 'Almacenamiento persistente',
                os: 'Windows 7+ (para ejecutar FFMPEG)'
            },
            isLocalFile: this.isLocalFile,
            protocol: window.location.protocol,
            pwaInstalled: this.isPWAInstalled,
            pwaSupported: !this.isLocalFile && 'serviceWorker' in navigator,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }
    
    exportAppData() {
        const settings = window.videoGestStorage ? window.videoGestStorage.exportSettings() : { data: {} };
        const appInfo = this.getAppInfo();
        
        const data = {
            appInfo: appInfo,
            settings: settings.data,
            exportDate: new Date().toISOString()
        };
        
        return {
            filename: `VideoGest_Backup_${new Date().toISOString().split('T')[0]}.json`,
            data: JSON.stringify(data, null, 2),
            blob: new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        };
    }
    
    resetApp() {
        if (confirm('¿Está seguro de que desea restablecer toda la configuración de la aplicación? Esto borrará todos los datos guardados.')) {
            if (window.videoGestStorage) {
                const result = window.videoGestStorage.clearAllData();
                
                if (result.success) {
                    // Recargar la página
                    location.reload();
                } else {
                    if (window.videoGestUI && window.videoGestUI.showMessage) {
                        window.videoGestUI.showMessage('Error', result.message, 'error');
                    }
                }
            } else {
                // Recargar la página si no hay storage
                location.reload();
            }
        }
    }
    
    // Métodos de utilidad
    
    formatDate(date) {
        const lang = window.videoGestTranslations ? window.videoGestTranslations.getCurrentLanguage() : 'es';
        return new Intl.DateTimeFormat(lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    async checkStorageQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                const usedMB = estimate.usage / (1024 * 1024);
                const quotaMB = estimate.quota / (1024 * 1024);
                const percentage = (usedMB / quotaMB * 100).toFixed(1);
                
                return {
                    used: usedMB,
                    quota: quotaMB,
                    percentage: percentage,
                    available: quotaMB - usedMB
                };
            } catch (error) {
                console.error('Error al verificar cuota de almacenamiento:', error);
                return null;
            }
        }
        return null;
    }
    
    // Método para mostrar información de depuración
    showDebugInfo() {
        const appInfo = this.getAppInfo();
        
        const debugInfo = `
=== VideoGest Debug Info ===
Versión: ${appInfo.version} (${appInfo.version_code})
Nombre versión: ${appInfo.version_name}
Fecha release: ${appInfo.release_date}

=== Información PWA ===
PWA Instalada: ${this.isPWAInstalled ? '✅ Sí' : '❌ No'}
Soporta PWA: ${appInfo.pwaSupported ? '✅ Sí' : '❌ No'}
Modo archivo local: ${appInfo.isLocalFile ? '✅ Sí' : '❌ No'}
Protocolo: ${appInfo.protocol}
Display Mode: ${this.getDisplayMode()}
Sistema: ${this.detectOS()}
Navegador: ${this.detectBrowser()}

=== Información Sistema ===
Online: ${this.isOnline}
Idioma: ${window.videoGestTranslations ? window.videoGestTranslations.getCurrentLanguage() : 'N/A'}
User Agent: ${appInfo.userAgent}
ServiceWorker soportado: ${'serviceWorker' in navigator}
LocalStorage disponible: ${typeof localStorage !== 'undefined'}
IndexedDB disponible: ${typeof indexedDB !== 'undefined'}
============================
`;
        
        console.log(debugInfo);
        
        if (window.videoGestUI && window.videoGestUI.showMessage) {
            window.videoGestUI.showMessage(
                'Información de depuración',
                debugInfo.replace(/===/g, '').trim(),
                'info'
            );
        }
    }
}

// Inicializar aplicación con retardo para asegurar que todos los scripts se carguen
setTimeout(() => {
    console.log('Inicializando VideoGestApp...');
    window.videoGestApp = new VideoGestApp();
    
    // Opcional: agregar atajo de teclado para debug (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            if (window.videoGestApp) {
                window.videoGestApp.showDebugInfo();
            }
        }
    });
}, 1000);