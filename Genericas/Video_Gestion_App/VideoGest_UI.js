// VideoGest_UI.js - ARCHIVO COMPLETO SIMPLIFICADO
class VideoGestUI {
    constructor() {
        this.currentPanel = 'main';
        this.selectedOperation = null;
        this.selectedFile = null;
        this.init();
    }
    
    init() {
        console.log('VideoGestUI inicializando...');
        
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initComponents();
                this.initEventListeners();
                this.updateUI();
            });
        } else {
            // DOM ya está cargado
            setTimeout(() => {
                this.initComponents();
                this.initEventListeners();
                this.updateUI();
            }, 100);
        }
    }
    
    initComponents() {
        console.log('Inicializando componentes UI...');
        
        // Buscar elementos principales - con verificación de nulidad
        this.mainPanel = document.getElementById('main-panel');
        this.reducePanel = document.getElementById('reduce-panel');
        this.ffmpegPanel = document.getElementById('ffmpeg-panel');
        this.progressPanel = document.getElementById('progress-panel');
        this.inputFile = document.getElementById('input-file');
        this.fileInfo = document.getElementById('file-info');
        this.qualitySelect = document.getElementById('quality');
        this.executeReduceBtn = document.getElementById('execute-reduce');
        this.continueButton = document.getElementById('continue-button');
        this.copyCommandBtn = document.getElementById('copy-command');
        
        // Botón de instalación PWA
        this.installButton = document.getElementById('install-button');
        
        // Botones de operación
        this.operationButtons = document.querySelectorAll('.operation-btn');
        
        // Botones de volver
        this.backButtons = document.querySelectorAll('.back-btn');
        
        // Verificar que todos los elementos esenciales existan
        this.checkRequiredElements();
    }
    
    checkRequiredElements() {
        const requiredElements = [
            { name: 'mainPanel', element: this.mainPanel },
            { name: 'operationButtons', element: this.operationButtons }
        ];
        
        requiredElements.forEach(item => {
            if (!item.element) {
                console.error(`Elemento requerido no encontrado: ${item.name}`);
            }
        });
    }
    
    initEventListeners() {
        console.log('Inicializando event listeners...');
        
        // Botones de operación - con verificación
        if (this.operationButtons && this.operationButtons.length > 0) {
            this.operationButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const operation = e.currentTarget.getAttribute('data-operation');
                    this.handleOperationSelect(operation);
                });
            });
        } else {
            console.warn('No se encontraron botones de operación');
        }
        
        // Botones de volver - con verificación
        if (this.backButtons && this.backButtons.length > 0) {
            this.backButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.showMainPanel();
                });
            });
        }
        
        // Selección de archivo - con verificación
        if (this.inputFile) {
            this.inputFile.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0]);
            });
        }
        
        // Botón ejecutar reducción - con verificación
        if (this.executeReduceBtn) {
            this.executeReduceBtn.addEventListener('click', () => {
                this.handleExecuteReduce();
            });
        }
        
        // Botón continuar - con verificación
        if (this.continueButton) {
            this.continueButton.addEventListener('click', () => {
                this.handleContinue();
            });
        }
        
        // Botón copiar comando - con verificación
        if (this.copyCommandBtn) {
            this.copyCommandBtn.addEventListener('click', () => {
                this.handleCopyCommand();
            });
        }
        
        console.log('Event listeners inicializados correctamente');
    }
    
    handleOperationSelect(operation) {
        console.log('Operación seleccionada:', operation);
        this.selectedOperation = operation;
        
        switch(operation) {
            case 'reduce':
                this.showReducePanel();
                break;
            case 'cut':
                this.showNotImplemented(operation);
                break;
            case 'convert':
                this.showNotImplemented(operation);
                break;
            case 'reverse':
                this.showNotImplemented(operation);
                break;
            case 'tojpg':
                this.showNotImplemented(operation);
                break;
            case 'merge':
                this.showNotImplemented(operation);
                break;
            default:
                console.warn('Operación desconocida:', operation);
                this.showMainPanel();
        }
    }
    
    handleFileSelect(file) {
        if (!file) return;
        
        this.selectedFile = file;
        
        // Mostrar información del archivo
        if (this.fileInfo) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            this.fileInfo.innerHTML = `
                <strong>${this.translate('fileSelected')}</strong> ${file.name}<br>
                <small>Tamaño: ${fileSizeMB} MB | Tipo: ${file.type}</small>
            `;
        }
    }
    
    handleExecuteReduce() {
        console.log('=== DEBUG handleExecuteReduce ===');
        
        if (!this.selectedFile) {
            this.showMessage(
                this.translate('errorOccurred'),
                this.translate('selectFileFirst'),
                'warning'
            );
            return;
        }
        
        const quality = this.qualitySelect ? this.qualitySelect.value : 'tablet';
        
        // Verificar que videoGestFFMPEG esté disponible
        if (!window.videoGestFFMPEG) {
            console.error('videoGestFFMPEG no está disponible');
            this.showMessage(
                'Error',
                'Sistema FFMPEG no disponible',
                'error'
            );
            return;
        }
        
        // DEBUG: Mostrar información actual
        console.log('selectedFile:', this.selectedFile);
        console.log('selectedFile.name:', this.selectedFile.name);
        console.log('quality:', quality);
        console.log('videoGestFFMPEG:', window.videoGestFFMPEG);
        console.log('currentOperation antes:', window.videoGestFFMPEG.currentOperation);
        console.log('currentFile antes:', window.videoGestFFMPEG.currentFile);
        
        try {
            // Configurar la operación y archivo en videoGestFFMPEG
            window.videoGestFFMPEG.setOperation('reduce');
            window.videoGestFFMPEG.setInputFile(this.selectedFile.name); // Pasar solo el nombre del archivo
            
            // DEBUG: Verificar después de configurar
            console.log('currentOperation después:', window.videoGestFFMPEG.currentOperation);
            console.log('currentFile después:', window.videoGestFFMPEG.currentFile);
            
            // Verificar que las propiedades se hayan configurado correctamente
            if (!window.videoGestFFMPEG.currentOperation || !window.videoGestFFMPEG.currentFile) {
                console.error('Propiedades no configuradas correctamente');
                this.showMessage(
                    'Error',
                    'No se pudo configurar la operación. Por favor, intente nuevamente.',
                    'error'
                );
                return;
            }
            
            // Generar comando FFMPEG
            console.log('Generando comando...');
            const commandData = window.videoGestFFMPEG.generateCommand({
                quality: quality
            });
            
            console.log('Comando generado:', commandData);
            console.log('=== FIN DEBUG ===');
            
            // Mostrar panel de instrucciones FFMPEG
            this.showFFMPEGPanel(commandData.command || commandData);
            
        } catch (error) {
            console.error('Error en handleExecuteReduce:', error);
            console.log('=== FIN DEBUG CON ERROR ===');
            
            this.showMessage(
                'Error',
                `Error al generar el comando: ${error.message}`,
                'error'
            );
        }
    }
    
    handleContinue() {
        console.log('Botón Continuar presionado - Abriendo selector de archivos directamente');
        
        // 1. Copiar automáticamente el comando al portapapeles
        const instructionsDiv = this.ffmpegPanel.querySelector('.instructions');
        if (instructionsDiv) {
            const commandPre = instructionsDiv.querySelector('pre code');
            if (commandPre) {
                const command = commandPre.textContent;
                this.copyToClipboard(command);
                
                // Mostrar mensaje breve de confirmación
                this.showMessage(
                    '✅ Comando copiado',
                    'El comando FFMPEG ha sido copiado al portapapeles.<br>Ahora selecciona cualquier archivo para ver su ubicación.',
                    'success',
                    3000
                );
            }
        }
        
        // 2. Abrir directamente el cuadro de diálogo para seleccionar archivo
        setTimeout(() => {
            this.openSimpleFileDialog();
        }, 500);
    }
    
    openSimpleFileDialog() {
        // Crear un input de archivo oculto
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        fileInput.accept = 'video/*';
        fileInput.multiple = false;
        
        // Configurar título para el diálogo
        fileInput.setAttribute('title', 'Selecciona un archivo para navegar a su carpeta');
        
        // Al seleccionar archivo, mostrar un mensaje simple
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const selectedFile = e.target.files[0];
                const fileName = selectedFile.name;
                
                // Mostrar mensaje simple con instrucciones
                this.showMessage(
                    '📁 Ubicación seleccionada',
                    `Has seleccionado: <strong>${fileName}</strong><br><br>
                    <strong>Sigue estos pasos:</strong>
                    <ol style="margin-left: 20px; margin-top: 10px;">
                        <li>Navega a esta carpeta en el Explorador de Windows</li>
                        <li>En la barra de dirección, escribe <code>CMD</code> y presiona Enter</li>
                        <li>En la terminal, pega el comando (Ctrl+V)</li>
                        <li>Presiona Enter para ejecutar</li>
                    </ol>`,
                    'info',
                    8000
                );
            }
            
            // Limpiar el input
            e.target.value = '';
        });
        
        // Al cancelar, no hacer nada (silencio)
        fileInput.addEventListener('cancel', () => {
            // No mostrar nada si el usuario cancela
            console.log('Usuario canceló la selección de archivo');
        });
        
        // Disparar el diálogo de selección
        document.body.appendChild(fileInput);
        fileInput.click();
        
        // Limpiar después de un tiempo
        setTimeout(() => {
            if (fileInput.parentNode) {
                fileInput.parentNode.removeChild(fileInput);
            }
        }, 1000);
    }
    
    handleCopyCommand() {
        const instructionsDiv = this.ffmpegPanel.querySelector('.instructions');
        if (instructionsDiv) {
            const commandPre = instructionsDiv.querySelector('pre code');
            if (commandPre) {
                const command = commandPre.textContent;
                this.copyToClipboard(command);
                
                this.showMessage(
                    '📋 Comando copiado',
                    'El comando ha sido copiado al portapapeles.',
                    'success',
                    3000
                );
            }
        }
    }
    
    copyToClipboard(text) {
        try {
            // Método moderno usando Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    console.log('Comando copiado al portapapeles');
                }).catch(err => {
                    console.error('Error copiando al portapapeles:', err);
                    this.fallbackCopyToClipboard(text);
                });
            } else {
                // Fallback para navegadores antiguos
                this.fallbackCopyToClipboard(text);
            }
        } catch (error) {
            console.error('Error al copiar:', error);
            this.fallbackCopyToClipboard(text);
        }
    }
    
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            console.log(successful ? 'Comando copiado (fallback)' : 'Error al copiar');
        } catch (err) {
            console.error('Error en fallback copy:', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    showMainPanel() {
        this.hideAllPanels();
        if (this.mainPanel) {
            this.mainPanel.style.display = 'block';
        }
        this.currentPanel = 'main';
    }
    
    showReducePanel() {
        this.hideAllPanels();
        if (this.reducePanel) {
            this.reducePanel.style.display = 'block';
        }
        this.currentPanel = 'reduce';
    }
    
    showFFMPEGPanel(command = '') {
        this.hideAllPanels();
        if (this.ffmpegPanel) {
            this.ffmpegPanel.style.display = 'block';
            
            // Actualizar contenido del panel
            const instructionsDiv = this.ffmpegPanel.querySelector('.instructions');
            if (instructionsDiv) {
                instructionsDiv.innerHTML = this.generateFFMPEGInstructions(command);
            }
        }
        this.currentPanel = 'ffmpeg';
    }
    
    showProgressPanel() {
        this.hideAllPanels();
        if (this.progressPanel) {
            this.progressPanel.style.display = 'block';
        }
        this.currentPanel = 'progress';
    }
    
    showNotImplemented(operation) {
        this.showMessage(
            'Funcionalidad en desarrollo',
            `La operación "${operation}" está en desarrollo.`,
            'info',
            3000
        );
    }
    
    hideAllPanels() {
        const panels = [this.mainPanel, this.reducePanel, this.ffmpegPanel, this.progressPanel];
        panels.forEach(panel => {
            if (panel) {
                panel.style.display = 'none';
            }
        });
    }
    
    generateFFMPEGInstructions(command) {
        // Obtener información del archivo si está disponible
        let fileInfoHtml = '';
        if (this.selectedFile && window.videoGestFFMPEG && window.videoGestFFMPEG.outputFile) {
            const inputFile = this.selectedFile.name;
            const outputFile = window.videoGestFFMPEG.outputFile;
            const quality = this.qualitySelect ? this.qualitySelect.value : 'tablet';
            
            fileInfoHtml = `
                <div class="file-info-box">
                    <h4>Información del proceso:</h4>
                    <ul>
                        <li><strong>Archivo de entrada:</strong> ${inputFile}</li>
                        <li><strong>Archivo de salida:</strong> ${outputFile}</li>
                        <li><strong>Calidad seleccionada:</strong> ${this.translate(quality + 'Quality')}</li>
                    </ul>
                </div>
            `;
        }
        
        return `
            <div class="instruction-step">
                <p><strong>${this.translate('instruction1')}</strong></p>
                <p>${this.translate('instruction2')}</p>
                <ol>
                    <li>${this.translate('instruction3')}</li>
                    <li>${this.translate('instruction4')}</li>
                    <li>${this.translate('instruction5')}</li>
                    <li>${this.translate('instruction6')}</li>
                </ol>
            </div>
            
            ${fileInfoHtml}
            
            <div class="command-box">
                <h3>${this.translate('commandToExecute')}</h3>
                <pre><code>${command}</code></pre>
                <p class="command-note"><strong>Nota:</strong> Haz clic en "Continuar" para seleccionar la ubicación del archivo.</p>
            </div>
        `;
    }
    
    showMessage(title, message, type = 'info', duration = 5000) {
        // Cerrar mensajes existentes primero
        this.closeCurrentMessage();
        
        // Crear elemento de mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-title">${title}</div>
            <div class="message-content">${message}</div>
            <button class="message-close">×</button>
        `;
        
        // Estilos para el mensaje
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            min-width: 400px;
            max-width: 500px;
            animation: slideIn 0.3s ease;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        // Estilos para el título y contenido
        const titleStyle = `
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 18px;
            color: white;
        `;
        
        const contentStyle = `
            font-size: 14px;
            opacity: 0.9;
            color: white;
        `;
        
        const closeStyle = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            line-height: 1;
            z-index: 1001;
        `;
        
        // Aplicar estilos a los elementos internos
        const titleEl = messageDiv.querySelector('.message-title');
        const contentEl = messageDiv.querySelector('.message-content');
        const closeEl = messageDiv.querySelector('.message-close');
        
        if (titleEl) titleEl.style.cssText = titleStyle;
        if (contentEl) contentEl.style.cssText = contentStyle;
        if (closeEl) {
            closeEl.style.cssText = closeStyle;
            closeEl.addEventListener('click', () => {
                messageDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            });
        }
        
        // Agregar al documento
        document.body.appendChild(messageDiv);
        
        // Auto-eliminar después de la duración especificada
        if (duration > 0) {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        if (messageDiv.parentNode) {
                            messageDiv.parentNode.removeChild(messageDiv);
                        }
                    }, 300);
                }
            }, duration);
        }
        
        // Agregar animaciones CSS si no existen
        if (!document.querySelector('#message-animations')) {
            const style = document.createElement('style');
            style.id = 'message-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    closeCurrentMessage() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => {
            if (msg.parentNode) {
                msg.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (msg.parentNode) {
                        msg.parentNode.removeChild(msg);
                    }
                }, 300);
            }
        });
    }
    
    updateUI() {
        console.log('Actualizando UI...');
        // Actualizar cualquier elemento de la interfaz que necesite refresco
    }
    
    updateProgress(percent, message = '') {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        
        if (progressText && message) {
            progressText.textContent = message;
        }
    }
    
    // Método auxiliar para obtener traducción
    translate(key) {
        if (window.videoGestTranslations && window.videoGestTranslations.get) {
            return window.videoGestTranslations.get(key) || key;
        }
        return key;
    }
}

// Inicializar UI global
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado - Creando VideoGestUI...');
    window.videoGestUI = new VideoGestUI();
});