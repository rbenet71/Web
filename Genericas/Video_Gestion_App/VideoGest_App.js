// VideoGest_App.js
class VideoGestApp {
    constructor() {
        this.version = '1.0.0';
        this.isOnline = navigator.onLine;
        this.isLocalFile = window.location.protocol === 'file:' || window.location.protocol === 'null:';
        this.init();
    }
    
    async init() {
        console.log(`VideoGest App v${this.version} inicializando...`);
        
        // Inicializar componentes
        this.initComponents();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Verificar actualizaciones
        await this.checkForUpdates();
        
        // Aplicar traducciones iniciales
        videoGestTranslations.applyTranslations();
        
        // Registrar Service Worker SOLO si no es archivo local
        if (!this.isLocalFile) {
            await this.registerServiceWorker();
        } else {
            console.log('Modo archivo local: ServiceWorker deshabilitado');
            console.log('Para PWA completa, sirve la aplicación desde un servidor web (http://)');
        }
        
        console.log('VideoGest App inicializada correctamente');
    }
    
    initComponents() {
        // Los componentes ya están inicializados en sus propios archivos
        // Esta función es para cualquier inicialización adicional
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
            videoGestStorage.updateSetting('language', e.detail.language);
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
            }, 100);
        }
    }
    
    async checkForUpdates() {
        // Verificar si hay una nueva versión disponible
        try {
            const response = await fetch('VideoGest_Manifest.json?v=' + Date.now());
            const manifest = await response.json();
            
            // Aquí podrías comparar versiones o fechas
            // Por ahora, solo verificamos si podemos cargar el manifest
            
            console.log('Aplicación actualizada correctamente');
        } catch (error) {
            console.log('Modo offline - no se pudo verificar actualizaciones');
        }
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('VideoGest_ServiceWorker.js');
                console.log('ServiceWorker registrado correctamente:', registration);
                
                // Verificar actualizaciones periódicamente
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Cada hora
                
                return registration;
                
            } catch (error) {
                console.error('Error registrando ServiceWorker:', error);
                // No mostrar error al usuario
                return null;
            }
        } else {
            console.log('ServiceWorker no soportado en este navegador');
            return null;
        }
    }
    
    getAppInfo() {
        return {
            version: this.version,
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
            protocol: window.location.protocol
        };
    }
    
    exportAppData() {
        const settings = videoGestStorage.exportSettings();
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
            const result = videoGestStorage.clearAllData();
            
            if (result.success) {
                // Recargar la página
                location.reload();
            } else {
                if (window.videoGestUI && window.videoGestUI.showMessage) {
                    window.videoGestUI.showMessage('Error', result.message, 'error');
                }
            }
        }
    }
    
    // Métodos de utilidad
    
    formatDate(date) {
        return new Intl.DateTimeFormat(videoGestTranslations.getCurrentLanguage(), {
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
Versión: ${appInfo.version}
Protocolo: ${appInfo.protocol}
Modo archivo local: ${appInfo.isLocalFile}
Online: ${this.isOnline}
Idioma: ${videoGestTranslations.getCurrentLanguage()}
User Agent: ${navigator.userAgent}
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

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.videoGestApp = new VideoGestApp();
    
    // Opcional: agregar atajo de teclado para debug (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            window.videoGestApp.showDebugInfo();
        }
    });
});