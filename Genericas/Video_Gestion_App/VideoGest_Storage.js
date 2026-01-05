// VideoGest_Storage.js
class VideoGestStorage {
    constructor() {
        this.storageKey = 'videogest_';
        this.defaultSettings = {
            language: 'es',
            lastOperation: 'reduce',
            quality: 'medium',
            outputFormat: 'mp4',
            keepBackup: true,
            lastDirectory: null
        };
        
        this.init();
    }
    
    init() {
        // Inicializar valores por defecto si no existen
        this.ensureDefaultValues();
    }
    
    ensureDefaultValues() {
        const settings = this.getSettings();
        let changed = false;
        
        for (const key in this.defaultSettings) {
            if (settings[key] === undefined) {
                settings[key] = this.defaultSettings[key];
                changed = true;
            }
        }
        
        if (changed) {
            this.saveSettings(settings);
        }
    }
    
    getSettings() {
        try {
            const settings = localStorage.getItem(this.storageKey + 'settings');
            return settings ? JSON.parse(settings) : { ...this.defaultSettings };
        } catch (error) {
            console.error('Error loading settings:', error);
            return { ...this.defaultSettings };
        }
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem(this.storageKey + 'settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }
    
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    }
    
    getSetting(key) {
        const settings = this.getSettings();
        return settings[key] !== undefined ? settings[key] : this.defaultSettings[key];
    }
    
    // Métodos específicos para la aplicación
    
    saveLastFile(fileInfo) {
        try {
            localStorage.setItem(this.storageKey + 'lastFile', JSON.stringify(fileInfo));
            return true;
        } catch (error) {
            console.error('Error saving last file:', error);
            return false;
        }
    }
    
    getLastFile() {
        try {
            const lastFile = localStorage.getItem(this.storageKey + 'lastFile');
            return lastFile ? JSON.parse(lastFile) : null;
        } catch (error) {
            console.error('Error loading last file:', error);
            return null;
        }
    }
    
    saveCommandHistory(command) {
        try {
            let history = this.getCommandHistory();
            history.unshift({
                command: command,
                timestamp: new Date().toISOString(),
                operation: this.getSetting('lastOperation')
            });
            
            // Mantener solo los últimos 10 comandos
            if (history.length > 10) {
                history = history.slice(0, 10);
            }
            
            localStorage.setItem(this.storageKey + 'commandHistory', JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Error saving command history:', error);
            return false;
        }
    }
    
    getCommandHistory() {
        try {
            const history = localStorage.getItem(this.storageKey + 'commandHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading command history:', error);
            return [];
        }
    }
    
    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey + 'commandHistory');
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }
    
    // Métodos para almacenamiento temporal (sessionStorage)
    
    setTempData(key, data) {
        try {
            sessionStorage.setItem(this.storageKey + 'temp_' + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error setting temp data:', error);
            return false;
        }
    }
    
    getTempData(key) {
        try {
            const data = sessionStorage.getItem(this.storageKey + 'temp_' + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting temp data:', error);
            return null;
        }
    }
    
    removeTempData(key) {
        try {
            sessionStorage.removeItem(this.storageKey + 'temp_' + key);
            return true;
        } catch (error) {
            console.error('Error removing temp data:', error);
            return false;
        }
    }
    
    // Método para exportar/importar configuración
    
    exportSettings() {
        const settings = this.getSettings();
        const data = {
            settings: settings,
            lastFile: this.getLastFile(),
            commandHistory: this.getCommandHistory(),
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return {
            data: data,
            blob: blob,
            url: url
        };
    }
    
    importSettings(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            if (data.lastFile) {
                localStorage.setItem(this.storageKey + 'lastFile', JSON.stringify(data.lastFile));
            }
            
            if (data.commandHistory) {
                localStorage.setItem(this.storageKey + 'commandHistory', JSON.stringify(data.commandHistory));
            }
            
            return { success: true, message: 'Configuración importada correctamente' };
        } catch (error) {
            console.error('Error importing settings:', error);
            return { success: false, message: 'Error al importar configuración' };
        }
    }
    
    // Método para limpiar todos los datos
    clearAllData() {
        try {
            // Eliminar solo los datos de esta aplicación
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.storageKey)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // También limpiar sessionStorage
            const tempKeysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key.startsWith(this.storageKey)) {
                    tempKeysToRemove.push(key);
                }
            }
            
            tempKeysToRemove.forEach(key => sessionStorage.removeItem(key));
            
            return { success: true, message: 'Datos limpiados correctamente' };
        } catch (error) {
            console.error('Error clearing data:', error);
            return { success: false, message: 'Error al limpiar datos' };
        }
    }
}

// Crear instancia global
window.videoGestStorage = new VideoGestStorage();