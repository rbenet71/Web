// VideoGest_UI.js
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
        
        // Botones de operación
        this.operationButtons = document.querySelectorAll('.operation-btn');
        
        // Botones de volver
        this.backButtons = document.querySelectorAll('.back-btn');
        
        // Botones del footer
        this.exportBtn = document.getElementById('export-btn');
        this.importBtn = document.getElementById('import-btn');
        this.clearDataBtn = document.getElementById('clear-data-btn');
        
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
        
        // Botones del footer - con verificación
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => {
                this.handleExportSettings();
            });
        }
        
        if (this.importBtn) {
            this.importBtn.addEventListener('click', () => {
                this.handleImportSettings();
            });
        }
        
        if (this.clearDataBtn) {
            this.clearDataBtn.addEventListener('click', () => {
                this.handleClearData();
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
                <strong>${videoGestTranslations.get('fileSelected')}</strong> ${file.name}<br>
                <small>Tamaño: ${fileSizeMB} MB | Tipo: ${file.type}</small>
            `;
        }
    }
    
    handleExecuteReduce() {
        if (!this.selectedFile) {
            this.showMessage(
                videoGestTranslations.get('errorOccurred'),
                videoGestTranslations.get('selectFileFirst'),
                'warning'
            );
            return;
        }
        
        const quality = this.qualitySelect ? this.qualitySelect.value : 'tablet';
        
        // Generar comando FFMPEG
        if (window.videoGestFFMPEG) {
            const command = window.videoGestFFMPEG.generateReduceCommand(
                this.selectedFile.name,
                quality
            );
            
            this.showFFMPEGPanel(command);
        } else {
            this.showMessage(
                'Error',
                'Sistema FFMPEG no disponible',
                'error'
            );
        }
    }
    
    handleContinue() {
        // Aquí se manejaría la lógica para continuar con la operación
        // Por ahora, mostramos un mensaje
        this.showMessage(
            videoGestTranslations.get('processing'),
            'La funcionalidad está en desarrollo...',
            'info'
        );
    }
    
    handleCopyCommand() {
        // Implementar lógica para copiar comando al portapapeles
        console.log('Copiar comando al portapapeles');
        this.showMessage(
            videoGestTranslations.get('commandCopied'),
            'Comando copiado al portapapeles',
            'success'
        );
    }
    
    handleExportSettings() {
        if (window.videoGestApp) {
            const exportData = window.videoGestApp.exportAppData();
            
            // Crear enlace de descarga
            const url = URL.createObjectURL(exportData.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = exportData.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage(
                'Exportación exitosa',
                'Configuración exportada correctamente',
                'success'
            );
        }
    }
    
    handleImportSettings() {
        // Implementar lógica para importar configuración
        this.showMessage(
            'Importar configuración',
            'Funcionalidad en desarrollo',
            'info'
        );
    }
    
    handleClearData() {
        if (window.videoGestApp) {
            window.videoGestApp.resetApp();
        }
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
            'info'
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
        const lang = videoGestTranslations.getCurrentLanguage();
        
        return `
            <div class="instruction-step">
                <p><strong>${videoGestTranslations.get('instruction1')}</strong></p>
                <p>${videoGestTranslations.get('instruction2')}</p>
                <ol>
                    <li>${videoGestTranslations.get('instruction3')}</li>
                    <li>${videoGestTranslations.get('instruction4')}</li>
                    <li>${videoGestTranslations.get('instruction5')}</li>
                    <li>${videoGestTranslations.get('instruction6')}</li>
                </ol>
            </div>
            
            <div class="command-box">
                <h3>${videoGestTranslations.get('commandToExecute')}</h3>
                <pre><code>${command}</code></pre>
            </div>
            
            <div class="note">
                <p><strong>${videoGestTranslations.get('note')}</strong></p>
            </div>
        `;
    }
    
    showMessage(title, message, type = 'info') {
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
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        // Estilos para el título y contenido
        const titleStyle = `
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 16px;
        `;
        
        const contentStyle = `
            font-size: 14px;
            opacity: 0.9;
        `;
        
        const closeStyle = `
            position: absolute;
            top: 5px;
            right: 10px;
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            line-height: 1;
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
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 5000);
        
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
    
    // Agregar este método a la clase VideoGestUI
    showUpdateNotification(updateInfo) {
        const notificationHTML = `
            <div class="update-notification">
                <h3>¡Actualización disponible!</h3>
                <p><strong>Versión ${updateInfo.currentVersion} → ${updateInfo.newVersion}</strong></p>
                <p><em>${updateInfo.notes}</em></p>
                <p>Fecha: ${updateInfo.date}</p>
                <div class="button-group">
                    <button id="update-now" class="btn-primary">Actualizar ahora</button>
                    <button id="update-later" class="btn-secondary">Más tarde</button>
                </div>
            </div>
        `;
        
        // Crear elemento de notificación
        const notificationEl = document.createElement('div');
        notificationEl.className = 'global-notification update';
        notificationEl.innerHTML = notificationHTML;
        
        // Agregar al DOM
        document.body.appendChild(notificationEl);
        
        // Event listeners
        document.getElementById('update-now').addEventListener('click', () => {
            if (window.videoGestApp) {
                window.videoGestApp.installUpdate();
            }
            notificationEl.remove();
        });
        
        document.getElementById('update-later').addEventListener('click', () => {
            notificationEl.remove();
        });
        
        // Auto-ocultar después de 30 segundos
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.remove();
            }
        }, 30000);
    }
}

// Inicializar UI global
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado - Creando VideoGestUI...');
    window.videoGestUI = new VideoGestUI();
});