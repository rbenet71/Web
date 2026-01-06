// VideoGest_UI.js - VERSIÓN FINAL SIN BARRA DE PROGRESO
class VideoGestUI {
    constructor() {
        this.currentPanel = 'main';
        this.selectedOperation = null;
        this.selectedFile = null;
        this.currentFormat = 'mp4'; // Formato por defecto para conversión
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
        
        // ========== PANELES PRINCIPALES ==========
        this.mainPanel = document.getElementById('main-panel');
        this.reducePanel = document.getElementById('reduce-panel');
        this.cutPanel = document.getElementById('cut-panel');
        this.convertPanel = document.getElementById('convert-panel');
        this.reversePanel = document.getElementById('reverse-panel');
        this.ffmpegPanel = document.getElementById('ffmpeg-panel');
        
        // ========== ELEMENTOS DE REDUCCIÓN ==========
        this.inputFileReduce = document.getElementById('input-file-reduce');
        this.fileInfoReduce = document.getElementById('file-info-reduce');
        this.qualitySelect = document.getElementById('quality');
        this.executeReduceBtn = document.getElementById('execute-reduce');
        
        // ========== ELEMENTOS DE CORTAR ==========
        this.inputFileCut = document.getElementById('input-file-cut');
        this.fileInfoCut = document.getElementById('file-info-cut');
        this.durationInfoCut = document.getElementById('duration-info-cut');
        this.videoDuration = document.getElementById('video-duration');
        this.getDurationBtn = document.getElementById('get-duration-btn');
        this.startTime = document.getElementById('start-time');
        this.endTime = document.getElementById('end-time');
        this.executeCutBtn = document.getElementById('execute-cut');
        
        // ========== ELEMENTOS DE CONVERTIR ==========
        this.inputFileConvert = document.getElementById('input-file-convert');
        this.fileInfoConvert = document.getElementById('file-info-convert');
        this.formatSelector = document.getElementById('format-selector');
        this.outputDirectory = document.getElementById('output-directory');
        this.browseDirectoryBtn = document.getElementById('browse-directory-btn');
        this.executeConvertBtn = document.getElementById('execute-convert');
        
        // ========== ELEMENTOS DE REVERTIR ==========
        this.inputFileReverse = document.getElementById('input-file-reverse');
        this.fileInfoReverse = document.getElementById('file-info-reverse');
        this.preserveMetadata = document.getElementById('preserve-metadata');
        this.includeAudio = document.getElementById('include-audio');
        this.executeReverseBtn = document.getElementById('execute-reverse');
        
        // ========== ELEMENTOS COMPARTIDOS ==========
        this.continueButton = document.getElementById('continue-button');
        this.copyCommandBtn = document.getElementById('copy-command');
        this.installButton = document.getElementById('install-button');
        
        // ========== BOTONES GENERALES ==========
        this.operationButtons = document.querySelectorAll('.operation-btn');
        this.backButtons = document.querySelectorAll('.back-btn');
        
        // Inicializar selector de formatos
        this.initFormatSelector();
        
        // Verificar que todos los elementos esenciales existan
        this.checkRequiredElements();

        // Inicializar campos de tiempo inteligentes
        this.initTimeInputs();
        
        // Añadir botones de ajuste de tiempo
        setTimeout(() => {
            this.addTimeButtons();
        }, 100);
    }

    
    initFormatSelector() {
        if (!this.formatSelector || !window.videoGestFFMPEG) return;
        
        const formats = window.videoGestFFMPEG.getSupportedFormatsForConversion();
        this.formatSelector.innerHTML = '';
        
        formats.forEach(format => {
            const formatDiv = document.createElement('div');
            formatDiv.className = 'format-option';
            if (format.value === 'mp4') {
                formatDiv.classList.add('selected');
            }
            
            formatDiv.innerHTML = `
                <div style="font-weight: bold;">${format.label}</div>
                <div class="format-description">${this.translate(`format${format.label}`) || format.description}</div>
            `;
            
            formatDiv.addEventListener('click', () => {
                // Remover selección anterior
                document.querySelectorAll('.format-option').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Añadir selección actual
                formatDiv.classList.add('selected');
                this.currentFormat = format.value;
                console.log(`Formato seleccionado: ${this.currentFormat}`);
            });
            
            this.formatSelector.appendChild(formatDiv);
        });
    }
    
    checkRequiredElements() {
        const requiredElements = [
            { name: 'mainPanel', element: this.mainPanel },
            { name: 'operationButtons', element: this.operationButtons },
            { name: 'ffmpegPanel', element: this.ffmpegPanel },
            { name: 'continueButton', element: this.continueButton }
        ];
        
        requiredElements.forEach(item => {
            if (!item.element) {
                console.error(`Elemento requerido no encontrado: ${item.name}`);
            }
        });
    }
    
    initEventListeners() {
        console.log('Inicializando event listeners...');
        
        // ========== BOTONES DE OPERACIÓN PRINCIPAL ==========
        if (this.operationButtons && this.operationButtons.length > 0) {
            this.operationButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const operation = e.currentTarget.getAttribute('data-operation');
                    this.handleOperationSelect(operation);
                });
            });
        }
        
        // ========== BOTONES DE VOLVER ==========
        if (this.backButtons && this.backButtons.length > 0) {
            this.backButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.showMainPanel();
                });
            });
        }
        
        // ========== EVENTOS DE REDUCCIÓN ==========
        if (this.inputFileReduce) {
            this.inputFileReduce.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0], 'reduce');
            });
        }
        
        if (this.executeReduceBtn) {
            this.executeReduceBtn.addEventListener('click', () => {
                this.handleExecuteReduce();
            });
        }
        
        // ========== EVENTOS DE CORTAR ==========
        if (this.inputFileCut) {
            this.inputFileCut.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0], 'cut');
            });
        }
        
        if (this.getDurationBtn) {
            this.getDurationBtn.addEventListener('click', () => {
                this.handleGetDuration();
            });
        }
        
        if (this.executeCutBtn) {
            this.executeCutBtn.addEventListener('click', () => {
                this.handleExecuteCut();
            });
        }
        
        // ========== EVENTOS DE CONVERTIR ==========
        if (this.inputFileConvert) {
            this.inputFileConvert.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0], 'convert');
            });
        }
        
        if (this.browseDirectoryBtn) {
            this.browseDirectoryBtn.addEventListener('click', () => {
                this.handleBrowseDirectory();
            });
        }
        
        if (this.executeConvertBtn) {
            this.executeConvertBtn.addEventListener('click', () => {
                this.handleExecuteConvert();
            });
        }
        
        // ========== EVENTOS DE REVERTIR ==========
        if (this.inputFileReverse) {
            this.inputFileReverse.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0], 'reverse');
            });
        }
        
        if (this.executeReverseBtn) {
            this.executeReverseBtn.addEventListener('click', () => {
                this.handleExecuteReverse();
            });
        }
        
        // ========== EVENTOS COMPARTIDOS ==========
        if (this.continueButton) {
            this.continueButton.addEventListener('click', () => {
                this.handleContinue();
            });
        }
        
        if (this.copyCommandBtn) {
            this.copyCommandBtn.addEventListener('click', () => {
                this.handleCopyCommand();
            });
        }
        
        console.log('Event listeners inicializados correctamente');
    }
    
    // ========== MANEJO DE OPERACIONES ==========
    
    handleOperationSelect(operation) {
        console.log('Operación seleccionada:', operation);
        this.selectedOperation = operation;
        
        switch(operation) {
            case 'reduce':
                this.showReducePanel();
                break;
            case 'cut':
                this.showCutPanel();
                break;
            case 'convert':
                this.showConvertPanel();
                break;
            case 'reverse':
                this.showReversePanel();
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
    
    handleFileSelect(file, operationType) {
        if (!file) return;
        
        this.selectedFile = file;
        const fileInfoElement = this[`fileInfo${this.capitalizeFirst(operationType)}`];
        
        if (fileInfoElement) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            fileInfoElement.innerHTML = `
                <strong>${this.translate('fileSelected')}</strong> ${file.name}<br>
                <small>Tamaño: ${fileSizeMB} MB | Tipo: ${file.type}</small>
            `;
        }
        
        // Analizar duración automáticamente para cortar
        if (operationType === 'cut' && this.durationInfoCut) {
            this.durationInfoCut.style.display = 'block';
            
            // Mostrar "Analizando..." inmediatamente
            if (this.videoDuration) {
                this.videoDuration.textContent = 'Analizando...';
                this.videoDuration.style.color = '#666';
                this.videoDuration.classList.remove('duration-detected', 'duration-error');
                this.videoDuration.classList.add('duration-analyzing');
            }
            
            // Deshabilitar botón temporalmente
            if (this.getDurationBtn) {
                this.getDurationBtn.disabled = true;
                this.getDurationBtn.textContent = 'Analizando...';
            }
            
            // Analizar duración real (con pequeño delay para UI)
            setTimeout(() => {
                this.analyzeVideoDuration(file);
            }, 100);
        }
        
        // Establecer directorio por defecto para convertir
        if (operationType === 'convert' && this.outputDirectory) {
            // Obtener directorio del archivo (simulado)
            const fileName = file.name;
            this.outputDirectory.value = `Misma carpeta que "${fileName}"`;
        }
    }
    
    // ========== MANEJADORES DE EJECUCIÓN ==========
    
    handleExecuteReduce() {
        console.log('=== Ejecutar Reducción ===');
        
        if (!this.selectedFile) {
            this.showMessage(
                this.translate('errorOccurred'),
                this.translate('selectFileFirst'),
                'warning'
            );
            return;
        }
        
        const quality = this.qualitySelect ? this.qualitySelect.value : 'tablet';
        
        if (!window.videoGestFFMPEG) {
            this.showMessage('Error', 'Sistema FFMPEG no disponible', 'error');
            return;
        }
        
        try {
            window.videoGestFFMPEG.setOperation('reduce');
            window.videoGestFFMPEG.setInputFile(this.selectedFile.name);
            
            const commandData = window.videoGestFFMPEG.generateCommand({
                quality: quality
            });
            
            this.showFFMPEGPanel(commandData.command || commandData);
            
        } catch (error) {
            console.error('Error en handleExecuteReduce:', error);
            this.showMessage('Error', `Error al generar el comando: ${error.message}`, 'error');
        }
    }
    
    handleExecuteCut() {
        console.log('=== Ejecutar Corte ===');
        
        if (!this.selectedFile) {
            this.showMessage(
                this.translate('errorOccurred'),
                this.translate('selectFileFirst'),
                'warning'
            );
            return;
        }
        
        // Validar formato de tiempo
        const startTime = this.startTime ? this.startTime.value : '00:00:00';
        const endTime = this.endTime ? this.endTime.value : '';
        
        if (!window.videoGestFFMPEG.validateTimeFormat(startTime)) {
            this.showMessage(
                this.translate('errorOccurred'),
                this.translate('invalidTimeFormat'),
                'warning'
            );
            return;
        }
        
        if (endTime && !window.videoGestFFMPEG.validateTimeFormat(endTime)) {
            this.showMessage(
                this.translate('errorOccurred'),
                this.translate('invalidTimeFormat'),
                'warning'
            );
            return;
        }
        
        if (!window.videoGestFFMPEG) {
            this.showMessage('Error', 'Sistema FFMPEG no disponible', 'error');
            return;
        }
        
        try {
            window.videoGestFFMPEG.setOperation('cut');
            window.videoGestFFMPEG.setInputFile(this.selectedFile.name);
            
            const commandData = window.videoGestFFMPEG.generateCommand({
                startTime: startTime,
                endTime: endTime
            });
            
            this.showFFMPEGPanel(commandData.command || commandData);
            
        } catch (error) {
            console.error('Error en handleExecuteCut:', error);
            this.showMessage('Error', `Error al generar el comando: ${error.message}`, 'error');
        }
    }
    
    handleExecuteConvert() {
        console.log('=== Ejecutar Conversión ===');
        
        if (!this.selectedFile) {
            this.showMessage(
                this.translate('errorOccurred'),
                this.translate('selectFileFirst'),
                'warning'
            );
            return;
        }
        
        if (!this.currentFormat) {
            this.showMessage(
                this.translate('errorOccurred'),
                this.translate('selectFormatFirst'),
                'warning'
            );
            return;
        }
        
        if (!window.videoGestFFMPEG) {
            this.showMessage('Error', 'Sistema FFMPEG no disponible', 'error');
            return;
        }
        
        try {
            window.videoGestFFMPEG.setOperation('convert');
            window.videoGestFFMPEG.setInputFile(this.selectedFile.name);
            
            const commandData = window.videoGestFFMPEG.generateCommand({
                format: this.currentFormat
            });
            
            this.showFFMPEGPanel(commandData.command || commandData);
            
        } catch (error) {
            console.error('Error en handleExecuteConvert:', error);
            this.showMessage('Error', `Error al generar el comando: ${error.message}`, 'error');
        }
    }
    
    handleExecuteReverse() {
        console.log('=== Ejecutar Reversión ===');
        
        if (!this.selectedFile) {
            this.showMessage(
                this.translate('errorOccurred'),
                this.translate('selectFileFirst'),
                'warning'
            );
            return;
        }
        
        if (!window.videoGestFFMPEG) {
            this.showMessage('Error', 'Sistema FFMPEG no disponible', 'error');
            return;
        }
        
        try {
            window.videoGestFFMPEG.setOperation('reverse');
            window.videoGestFFMPEG.setInputFile(this.selectedFile.name);
            
            const commandData = window.videoGestFFMPEG.generateCommand({
                preserveMetadata: this.preserveMetadata ? this.preserveMetadata.checked : true,
                includeAudio: this.includeAudio ? this.includeAudio.checked : true
            });
            
            this.showFFMPEGPanel(commandData.command || commandData);
            
        } catch (error) {
            console.error('Error en handleExecuteReverse:', error);
            this.showMessage('Error', `Error al generar el comando: ${error.message}`, 'error');
        }
    }
    
    // ========== MÉTODOS AUXILIARES ==========

    // Analizar duración real del video
    async analyzeVideoDuration(file) {
        if (!file || !file.type.startsWith('video/')) {
            this.showDurationError('Formato de archivo no soportado');
            return;
        }
        
        // Verificar que el sistema FFMPEG tenga el método de análisis
        if (!window.videoGestFFMPEG || typeof window.videoGestFFMPEG.analyzeVideoDuration !== 'function') {
            this.showDurationError('Sistema de análisis no disponible');
            return;
        }
        
        try {
            const durationInfo = await window.videoGestFFMPEG.analyzeVideoDuration(file);
            
            if (!durationInfo.valid) {
                throw new Error('Duración no válida obtenida');
            }
            
            // Actualizar UI con la duración real
            if (this.videoDuration) {
                this.videoDuration.textContent = durationInfo.formatted;
                this.videoDuration.style.color = '#2196f3';
                this.videoDuration.classList.remove('duration-analyzing', 'duration-error');
                this.videoDuration.classList.add('duration-detected');
            }
            
            // Establecer placeholder en tiempo final con la duración completa
            if (this.endTime && !this.endTime.value) {
                this.endTime.placeholder = durationInfo.formatted;
                this.endTime.title = `Duración total: ${durationInfo.formatted}`;
            }
            
            // Mostrar información adicional en tooltip
            if (this.videoDuration) {
                this.videoDuration.title = `${durationInfo.formatted} (${durationInfo.totalSeconds} segundos)`;
            }
            
            // Mostrar mensaje de éxito breve
            this.showMessage(
                '✅ Duración detectada',
                `El video tiene una duración de <strong>${durationInfo.formatted}</strong><br>
                <small>(${durationInfo.totalSeconds} segundos)</small>`,
                'success',
                3000
            );
            
        } catch (error) {
            console.error('Error analizando duración:', error);
            this.showDurationError(`No se pudo analizar: ${error.message}`);
            
            // Mostrar instrucciones de fallback
            this.showMessage(
                '⚠️ Análisis automático falló',
                `No pudimos detectar la duración automáticamente.<br><br>
                <strong>Puedes:</strong><br>
                1. Abrir el video en un reproductor para ver la duración<br>
                2. Usar el formato HH:MM:SS (ej: 00:01:30 para 1 minuto 30 segundos)<br>
                3. Dejar "Tiempo Final" vacío para cortar hasta el final del video`,
                'warning',
                8000
            );
        } finally {
            // Rehabilitar botón
            if (this.getDurationBtn) {
                this.getDurationBtn.disabled = false;
                this.getDurationBtn.textContent = this.translate('getDuration');
            }
        }
    }
    
    // Método auxiliar para mostrar errores de duración
    showDurationError(message) {
        if (this.videoDuration) {
            this.videoDuration.textContent = 'Error';
            this.videoDuration.style.color = '#f44336';
            this.videoDuration.classList.remove('duration-analyzing', 'duration-detected');
            this.videoDuration.classList.add('duration-error');
            this.videoDuration.title = message;
        }
        
        // Restablecer placeholder
        if (this.endTime) {
            this.endTime.placeholder = 'HH:MM:SS';
        }
    }
    
    handleGetDuration() {
        if (!this.selectedFile) {
            this.showMessage(
                this.translate('errorOccurred'),
                this.translate('selectFileFirst'),
                'warning'
            );
            return;
        }
        
        // Re-analizar la duración
        if (this.videoDuration) {
            this.videoDuration.textContent = 'Analizando...';
            this.videoDuration.style.color = '#666';
            this.videoDuration.classList.remove('duration-detected', 'duration-error');
            this.videoDuration.classList.add('duration-analyzing');
        }
        
        // Deshabilitar botón temporalmente
        if (this.getDurationBtn) {
            this.getDurationBtn.disabled = true;
            this.getDurationBtn.textContent = 'Analizando...';
        }
        
        this.analyzeVideoDuration(this.selectedFile);
    }
    
    handleBrowseDirectory() {
        // Crear un input de directorio oculto (simulado con input file)
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        fileInput.webkitdirectory = true;
        fileInput.directory = true;
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const path = e.target.files[0].webkitRelativePath || e.target.files[0].name;
                const directory = path.split('/')[0] || 'Carpeta seleccionada';
                
                if (this.outputDirectory) {
                    this.outputDirectory.value = directory;
                }
                
                this.showMessage(
                    'Directorio seleccionado',
                    `Se usará: ${directory}`,
                    'success',
                    3000
                );
            }
            
            e.target.value = '';
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        
        setTimeout(() => {
            if (fileInput.parentNode) {
                fileInput.parentNode.removeChild(fileInput);
            }
        }, 1000);
    }
    
    // ========== MÉTODOS DE PANELES ==========
    
    showMainPanel() {
        this.hideAllPanels();
        if (this.mainPanel) {
            this.mainPanel.style.display = 'block';
        }
        this.currentPanel = 'main';
        this.selectedFile = null;
        this.selectedOperation = null;
    }
    
    showReducePanel() {
        this.hideAllPanels();
        if (this.reducePanel) {
            this.reducePanel.style.display = 'block';
        }
        this.currentPanel = 'reduce';
    }
    
    showCutPanel() {
        this.hideAllPanels();
        if (this.cutPanel) {
            this.cutPanel.style.display = 'block';
            
            // Resetear campos de tiempo
            if (this.startTime) this.startTime.value = '00:00:00';
            if (this.endTime) this.endTime.value = '';
            if (this.durationInfoCut) this.durationInfoCut.style.display = 'none';
        }
        this.currentPanel = 'cut';
    }
    
    showConvertPanel() {
        this.hideAllPanels();
        if (this.convertPanel) {
            this.convertPanel.style.display = 'block';
            
            // Resetear directorio
            if (this.outputDirectory) {
                this.outputDirectory.value = '';
            }
        }
        this.currentPanel = 'convert';
    }
    
    showReversePanel() {
        this.hideAllPanels();
        if (this.reversePanel) {
            this.reversePanel.style.display = 'block';
            
            // Establecer opciones por defecto
            if (this.preserveMetadata) this.preserveMetadata.checked = true;
            if (this.includeAudio) this.includeAudio.checked = true;
        }
        this.currentPanel = 'reverse';
    }
    
    showFFMPEGPanel(command = '') {
        this.hideAllPanels();
        if (this.ffmpegPanel) {
            this.ffmpegPanel.style.display = 'block';
            
            const instructionsDiv = this.ffmpegPanel.querySelector('.instructions');
            if (instructionsDiv) {
                instructionsDiv.innerHTML = this.generateFFMPEGInstructions(command);
            }
        }
        this.currentPanel = 'ffmpeg';
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
        const panels = [
            this.mainPanel, this.reducePanel, this.cutPanel, 
            this.convertPanel, this.reversePanel, this.ffmpegPanel
        ];
        panels.forEach(panel => {
            if (panel) {
                panel.style.display = 'none';
            }
        });
    }
    
    // ========== MÉTODOS COMPARTIDOS ==========
    
    handleContinue() {
        console.log('Botón Continuar presionado');
        
        // Copiar automáticamente el comando al portapapeles
        const instructionsDiv = this.ffmpegPanel.querySelector('.instructions');
        if (instructionsDiv) {
            const commandPre = instructionsDiv.querySelector('pre code');
            if (commandPre) {
                const command = commandPre.textContent;
                this.copyToClipboard(command);
                
                this.showMessage(
                    '✅ ' + this.translate('commandCopied'),
                    this.translate('readyToPaste') + '<br>' + this.translate('justOpenCmdAndPaste'),
                    'success',
                    3000
                );
            }
        }
        
        // Abrir diálogo para seleccionar archivo (para navegar a la carpeta)
        setTimeout(() => {
            this.openSimpleFileDialog();
        }, 500);
    }
    
    openSimpleFileDialog() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        fileInput.accept = 'video/*';
        fileInput.multiple = false;
        
        fileInput.setAttribute('title', 'Selecciona un archivo para navegar a su carpeta');
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const selectedFile = e.target.files[0];
                const fileName = selectedFile.name;
                
                this.showMessage(
                    '📁 ' + this.translate('directorySelected'),
                    `${this.translate('navigateToDirectory')}<br><br>
                    <strong>${fileName}</strong><br><br>
                    <strong>${this.translate('instruction5')}:</strong><br>
                    <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-family: monospace;">CMD</code><br><br>
                    <strong>${this.translate('instruction6')}:</strong><br>
                    ${this.translate('pasteCommand')} → ${this.translate('executeCommand')}`,
                    'info',
                    8000
                );
            }
            
            e.target.value = '';
        });
        
        fileInput.addEventListener('cancel', () => {
            console.log('Usuario canceló la selección de archivo');
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        
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
                    '📋 ' + this.translate('commandCopied'),
                    this.translate('fullCommandCopied'),
                    'success',
                    3000
                );
            }
        }
    }
    
    copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    console.log('Comando copiado al portapapeles');
                }).catch(err => {
                    console.error('Error copiando al portapapeles:', err);
                    this.fallbackCopyToClipboard(text);
                });
            } else {
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
    
    // ========== GENERACIÓN DE INSTRUCCIONES ==========
    
    generateFFMPEGInstructions(command) {
        let fileInfoHtml = '';
        let operationInfo = '';
        
        if (this.selectedFile && window.videoGestFFMPEG && window.videoGestFFMPEG.outputFile) {
            const inputFile = this.selectedFile.name;
            const outputFile = window.videoGestFFMPEG.outputFile;
            
            fileInfoHtml = `
                <div class="file-info-box">
                    <h4>${this.translate('outputFileWillBe')}</h4>
                    <ul>
                        <li><strong>${this.translate('fileSelected')}</strong> ${inputFile}</li>
                        <li><strong>${this.translate('operationCompleted')}:</strong> ${outputFile}</li>
                    </ul>
                </div>
            `;
            
            // Información específica de la operación
            switch(this.selectedOperation) {
                case 'reduce':
                    const quality = this.qualitySelect ? this.qualitySelect.value : 'tablet';
                    operationInfo = `<p><strong>${this.translate('quality')}:</strong> ${this.translate(quality + 'Quality')}</p>`;
                    break;
                case 'cut':
                    const startTime = this.startTime ? this.startTime.value : '00:00:00';
                    const endTime = this.endTime ? this.endTime.value : '';
                    operationInfo = `<p><strong>${this.translate('cutSettings')}:</strong> ${startTime} ${endTime ? `→ ${endTime}` : this.translate('fullVideo')}</p>`;
                    break;
                case 'convert':
                    operationInfo = `<p><strong>${this.translate('selectFormat')}:</strong> ${this.currentFormat.toUpperCase()}</p>`;
                    break;
                case 'reverse':
                    operationInfo = `<p><strong>${this.translate('reverseDescription')}</strong></p>`;
                    break;
            }
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
            
            ${operationInfo}
            ${fileInfoHtml}
            
            <div class="command-box">
                <h3>${this.translate('commandToExecute')}</h3>
                <pre><code>${command}</code></pre>
                <p class="command-note"><strong>${this.translate('note')}</strong></p>
            </div>
        `;
    }
    
    // ========== MÉTODOS DE UTILIDAD ==========
    
    showMessage(title, message, type = 'info', duration = 5000) {
        this.closeCurrentMessage();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-title">${title}</div>
            <div class="message-content">${message}</div>
            <button class="message-close">×</button>
        `;
        
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
        
        const titleEl = messageDiv.querySelector('.message-title');
        const contentEl = messageDiv.querySelector('.message-content');
        const closeEl = messageDiv.querySelector('.message-close');
        
        if (titleEl) titleEl.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 18px; color: white;';
        if (contentEl) contentEl.style.cssText = 'font-size: 14px; opacity: 0.9; color: white;';
        if (closeEl) {
            closeEl.style.cssText = 'position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 24px; height: 24px; line-height: 1; z-index: 1001;';
            closeEl.addEventListener('click', () => {
                messageDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            });
        }
        
        document.body.appendChild(messageDiv);
        
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
        
        if (!document.querySelector('#message-animations')) {
            const style = document.createElement('style');
            style.id = 'message-animations';
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
    }
    
    translate(key) {
        if (window.videoGestTranslations && window.videoGestTranslations.get) {
            return window.videoGestTranslations.get(key) || key;
        }
        return key;
    }
    
    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

}

// Inicializar UI global
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado - Creando VideoGestUI...');
    window.videoGestUI = new VideoGestUI();
});