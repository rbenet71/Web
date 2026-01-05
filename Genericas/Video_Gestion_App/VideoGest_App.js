// VideoGest_App.js
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
        
        // Verificar actualizaciones
        await this.checkForUpdates();
        
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
            console.warn('No se pudo cargar el manifest, usando versión por defecto:', error);
        }
    }
    
    async checkStoredVersion() {
        if (window.videoGestStorage) {
            const storedVersion = window.videoGestStorage.getSetting('app_version');
            const storedVersionCode = window.videoGestStorage.getSetting('app_version_code');
            
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
        // Solo verificar actualizaciones si estamos online
        if (!this.isOnline) {
            console.log('Modo offline - omitiendo verificación de actualizaciones');
            return;
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
            console.log('No se pudo verificar actualizaciones:', error);
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
        if (window.videoGestUI && window.videoGestUI.showUpdateNotification) {
            window.videoGestUI.showUpdateNotification(updateInfo);
        }
    }
    
    async installUpdate() {
        if (!this.updateAvailable) {
            return false;
        }
        
        console.log('Instalando actualización...');
        
        // Recargar la página para obtener los nuevos archivos
        location.reload(true);
        return true;
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
            manifest_data: this.manifestData
        };
    }
    
    // ... resto del código existente se mantiene igual ...
    
    async registerServiceWorker() {
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
                console.error('Error registrando ServiceWorker:', error);
                return null;
            }
        } else {
            console.log('ServiceWorker no soportado en este navegador');
            return null;
        }
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
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }
    
    // ... resto del código existente se mantiene igual ...
    
    // Método para mostrar información de depuración
    showDebugInfo() {
        const appInfo = this.getAppInfo();
        const versionInfo = this.getVersionInfo();
        
        const debugInfo = `
=== VideoGest Debug Info ===
Versión: ${appInfo.version} (${appInfo.version_code})
Nombre versión: ${appInfo.version_name}
Fecha release: ${appInfo.release_date}
Notas: ${appInfo.version_notes}
Actualización disponible: ${this.updateAvailable}
Última verificación: ${this.lastUpdateCheck ? this.formatDate(this.lastUpdateCheck) : 'Nunca'}
Protocolo: ${appInfo.protocol}
Modo archivo local: ${appInfo.isLocalFile}
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

// ... resto del código existente se mantiene igual ...