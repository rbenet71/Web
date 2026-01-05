// VideoGest_UI.js
class VideoGestUI {
    constructor() {
        this.currentPanel = 'main';
        this.panels = {};
        this.currentCommandInfo = null;
        this.init();
    }
    
    init() {
        // Mapear todos los paneles
        this.panels = {
            main: document.getElementById('main-panel'),
            language: document.getElementById('language-panel'),
            help: document.getElementById('help-panel'),
            reduce: document.getElementById('reduce-panel'),
            ffmpeg: document.getElementById('ffmpeg-panel'),
            progress: document.getElementById('progress-panel')
        };
        
        // Inicializar event listeners
        this.initEventListeners();
        
        // Cargar configuración guardada
        this.loadSavedSettings();
    }
    
    initEventListeners() {
        // Selector de idioma
        document.getElementById('language-selector').addEventListener('click', () => {
            this.showPanel('language');
        });
        
        // Botón de ayuda
        document.getElementById('help-button').addEventListener('click', () => {
            this.showPanel('help');
        });
        
        // Botones de operación
        document.querySelectorAll('.operation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const operation = e.currentTarget.dataset.operation;
                this.handleOperationSelect(operation);
            });
        });
        
        // Botones volver
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showPanel('main');
            });
        });
        
        // Botones de idioma
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                videoGestTranslations.setLanguage(lang);
                this.showPanel('main');
            });
        });
        
        // Cerrar ayuda
        document.querySelector('#help-panel .btn-secondary').addEventListener('click', () => {
            this.showPanel('main');
        });
        
        // Selección de archivo
        document.getElementById('input-file').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
        
        // Ejecutar reducción
        document.getElementById('execute-reduce').addEventListener('click', () => {
            this.executeReduceOperation();
        });
        
        // Botón Continuar
        document.getElementById('continue-button').addEventListener('click', () => {
            this.openFileExplorer();
        });
        
        // Instalación PWA
        this.initPWAInstall();
    }
    
    showPanel(panelName) {
        // Ocultar todos los paneles
        Object.values(this.panels).forEach(panel => {
            if (panel) panel.style.display = 'none';
        });
        
        // Mostrar panel solicitado
        if (this.panels[panelName]) {
            this.panels[panelName].style.display = 'flex';
            this.currentPanel = panelName;
            
            // Ejecutar acciones específicas del panel
            this.onPanelShow(panelName);
        }
    }
    
    onPanelShow(panelName) {
        switch (panelName) {
            case 'reduce':
                this.updateFileInfo();
                break;
            case 'ffmpeg':
                this.displayFFMPEGCommand();
                break;
            case 'main':
                // Actualizar traducciones
                videoGestTranslations.applyTranslations();
                break;
        }
    }
    
    handleOperationSelect(operation) {
        videoGestStorage.updateSetting('lastOperation', operation);
        
        switch (operation) {
            case 'reduce':
                this.showPanel('reduce');
                break;
            default:
                // Para otras operaciones, mostrar mensaje de "próximamente"
                this.showMessage(
                    'Función en desarrollo',
                    `La función "${operation}" estará disponible en próximas actualizaciones.`,
                    'info'
                );
                break;
        }
    }
    
    handleFileSelect(file) {
        if (!file) return;
        
        // Validar que sea un video
        if (!file.type.startsWith('video/')) {
            this.showMessage(
                'Archivo no válido',
                'Por favor, seleccione un archivo de video.',
                'error'
            );
            return;
        }
        
        // Guardar información del archivo
        const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            path: file.webkitRelativePath || file.name
        };
        
        videoGestStorage.saveLastFile(fileInfo);
        this.updateFileInfo();
        
        // Actualizar traducción
        const fileInfoElement = document.getElementById('file-info');
        const t = videoGestTranslations;
        fileInfoElement.innerHTML = `
            <strong>${t.get('fileSelected')}</strong><br>
            ${file.name}<br>
            <small>${this.formatFileSize(file.size)}</small>
        `;
    }
    
    updateFileInfo() {
        const lastFile = videoGestStorage.getLastFile();
        const fileInfoElement = document.getElementById('file-info');
        
        if (lastFile) {
            const t = videoGestTranslations;
            fileInfoElement.innerHTML = `
                <strong>${t.get('fileSelected')}</strong><br>
                ${lastFile.name}<br>
                <small>${this.formatFileSize(lastFile.size)}</small>
            `;
        } else {
            fileInfoElement.innerHTML = '';
        }
    }
    
    async executeReduceOperation() {
        const fileInput = document.getElementById('input-file');
        if (!fileInput.files || fileInput.files.length === 0) {
            this.showMessage(
                videoGestTranslations.get('selectFileFirst'),
                'Por favor, seleccione un archivo de video antes de continuar.',
                'warning'
            );
            return;
        }
        
        const file = fileInput.files[0];
        const quality = document.getElementById('quality').value;
        
        // Guardar configuración
        videoGestStorage.updateSetting('quality', quality);
        
        // Configurar FFMPEG
        videoGestFFMPEG.setOperation('reduce');
        videoGestFFMPEG.setInputFile(file);
        
        try {
            // Generar comando
            this.currentCommandInfo = videoGestFFMPEG.generateCommand({
                quality: quality
            });
            
            // Guardar en historial
            videoGestStorage.saveCommandHistory(this.currentCommandInfo.command);
            
            // 1. COPIAR AUTOMÁTICAMENTE AL GENERAR
            await this.copyCommandToClipboard(true); // true = copia silenciosa
            
            // Mostrar panel de instrucciones
            this.showPanel('ffmpeg');
            
        } catch (error) {
            this.showMessage(
                videoGestTranslations.get('errorOccurred'),
                `Error: ${error.message}\n\nAsegúrese de que ha seleccionado un archivo de video válido.`,
                'error'
            );
        }
    }
    
    displayFFMPEGCommand() {
        if (this.currentCommandInfo) {
            const instructions = document.querySelector('#ffmpeg-panel .instructions');
            if (instructions) {
                const t = videoGestTranslations;
                const qualityDesc = videoGestFFMPEG.getQualityDescription(this.currentCommandInfo.quality);
                
                instructions.innerHTML = `
                    <p>${t.get('instruction1')}</p>
                    <p><strong>${t.get('instruction2')}</strong></p>
                    
                    <div class="note important">
                        <h4>✅ Comando ya copiado automáticamente</h4>
                        <p>El comando FFMPEG ya está en su portapapeles.</p>
                        <p><strong>Ahora solo necesita:</strong></p>
                        <ol>
                            <li>Hacer clic en "Continuar" para seleccionar la carpeta</li>
                            <li>Abrir CMD en esa carpeta</li>
                            <li>Pegar el comando (Ctrl+V) y ejecutar</li>
                        </ol>
                    </div>
                    
                    <div class="note">
                        <h4>⚡ Comando automático</h4>
                        <p>Este comando hace TODO automáticamente:</p>
                        <ol>
                            <li>Verifica si ffmpeg.exe está en la carpeta</li>
                            <li>Si no está, lo descarga desde internet</li>
                            <li>Ejecuta la conversión del video</li>
                        </ol>
                    </div>
                    
                    <div class="command-box">
                        <h3>Comando listo para pegar:</h3>
                        <div class="command">${this.currentCommandInfo.command}</div>
                        <p class="note" style="margin-top: 10px;">
                            <small>⚠️ Ya está copiado en su portapapeles</small>
                        </p>
                    </div>
                    
                    <div class="note">
                        <p><strong>Calidad seleccionada:</strong> ${qualityDesc}</p>
                        <p><strong>Directorio del video:</strong> ${this.currentCommandInfo.directory || 'No especificado'}</p>
                        <p><strong>Archivo de salida:</strong> ${this.currentCommandInfo.output}</p>
                        <p><strong>Tiempo estimado:</strong> ${this.currentCommandInfo.estimatedTime?.formatted || '2-5 minutos'}</p>
                        <p><strong>Archivo original:</strong> Se mantiene intacto</p>
                    </div>
                `;
            }
        }
    }
    
    // Método para abrir el explorador de archivos
    openFileExplorer() {
        if (!this.currentCommandInfo) {
            this.showMessage(
                'Error',
                'Primero debe generar un comando haciendo clic en "Ejecutar".',
                'error'
            );
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        
        // Configurar atributos para que se abra en modo directorio
        input.setAttribute('webkitdirectory', '');
        input.setAttribute('directory', '');
        input.setAttribute('multiple', '');
        
        // Agregar al documento
        document.body.appendChild(input);
        
        // Cuando el usuario seleccione un directorio
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const firstFile = e.target.files[0];
                const path = firstFile.webkitRelativePath;
                const directory = path ? path.substring(0, path.indexOf('/')) : 'Directorio seleccionado';
                
                // 2. RECORDAR AL USUARIO QUE EL COMANDO YA ESTÁ COPIADO
                this.showMessage(
                    '✅ ¡Todo listo!',
                    `Directorio seleccionado: ${directory}\n\n📋 <strong>El comando YA ESTÁ en su portapapeles.</strong>\n\nAhora solo necesita:\n1. En la barra de dirección escriba: <code>CMD</code>\n2. Presione Enter para abrir la terminal\n3. Pegue el comando (Ctrl+V)\n4. Presione Enter para ejecutar\n\nEl comando descargará ffmpeg.exe automáticamente si es necesario.`,
                    'success'
                );
            }
            
            // Limpiar el input
            document.body.removeChild(input);
        });
        
        input.addEventListener('cancel', () => {
            // El usuario canceló
            this.showMessage(
                'Selección cancelada',
                'Recuerde: el comando sigue copiado en su portapapeles.\nPuede volver a intentarlo haciendo clic en "Continuar".',
                'warning'
            );
            document.body.removeChild(input);
        });
        
        // Disparar el click para abrir el explorador
        input.click();
    }
    
    // Método mejorado para copiar al portapapeles
    async copyCommandToClipboard(silent = false) {
        if (!this.currentCommandInfo) {
            if (!silent) {
                this.showMessage(
                    'Error',
                    'No hay comando para copiar. Primero debe generar un comando.',
                    'error'
                );
            }
            return false;
        }
        
        const command = this.currentCommandInfo.command;
        
        try {
            await navigator.clipboard.writeText(command);
            
            if (!silent) {
                this.showMessage(
                    '✅ Comando copiado',
                    'El comando está listo para pegar en CMD.\n\nAhora:\n1. Abra CMD en la carpeta del video\n2. Pegue el comando (Ctrl+V)\n3. Presione Enter para ejecutar',
                    'success'
                );
            }
            
            return true;
            
        } catch (err) {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = command;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (!silent) {
                if (success) {
                    this.showMessage(
                        '✅ Comando copiado',
                        'El comando está listo para pegar en CMD.\n\nAhora:\n1. Abra CMD en la carpeta del video\n2. Pegue el comando (Ctrl+V)\n3. Presione Enter para ejecutar',
                        'success'
                    );
                } else {
                    this.showMessage(
                        'Error al copiar',
                        'No se pudo copiar el comando automáticamente.\n\nPor favor, seleccione y copie el comando manualmente.',
                        'error'
                    );
                }
            }
            
            return success;
        }
    }
    
    showMessage(title, message, type = 'info') {
        // Crear elemento de mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        
        const typeIcons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-icon">${typeIcons[type] || 'ℹ️'}</span>
                <span class="message-title">${title}</span>
            </div>
            <div class="message-content">${message}</div>
        `;
        
        // Estilos inline para el mensaje
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid ${this.getMessageColor(type)};
            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        // Permitir HTML básico en el mensaje
        messageDiv.querySelector('.message-content').innerHTML = message;
        
        document.body.appendChild(messageDiv);
        
        // Auto-eliminar después de 7 segundos (más tiempo para instrucciones)
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 7000);
        
        // Agregar estilos de animación si no existen
        if (!document.getElementById('message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getMessageColor(type) {
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        return colors[type] || colors.info;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    loadSavedSettings() {
        const settings = videoGestStorage.getSettings();
        
        // Cargar configuración en los controles
        document.getElementById('quality').value = settings.quality || 'tablet';
        
        // Aplicar idioma
        videoGestTranslations.setLanguage(settings.language);
    }
    
    initPWAInstall() {
        let deferredPrompt;
        const installButton = document.getElementById('install-button');
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevenir que el navegador muestre el prompt automático
            e.preventDefault();
            // Guardar el evento para usarlo después
            deferredPrompt = e;
            // Mostrar el botón de instalación
            installButton.style.display = 'block';
            
            installButton.addEventListener('click', async () => {
                // Ocultar el botón
                installButton.style.display = 'none';
                // Mostrar el prompt de instalación
                deferredPrompt.prompt();
                // Esperar a que el usuario responda
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                // Limpiar la referencia
                deferredPrompt = null;
            });
        });
        
        window.addEventListener('appinstalled', () => {
            // Ocultar el botón de instalación
            installButton.style.display = 'none';
            // Limpiar la referencia
            deferredPrompt = null;
            console.log('PWA installed successfully');
        });
        
        // Verificar si la app ya está instalada
        if (window.matchMedia('(display-mode: standalone)').matches) {
            installButton.style.display = 'none';
        }
    }
    
    updateProgress(percentage, message) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
    }
}

// Crear instancia global
window.videoGestUI = new VideoGestUI();