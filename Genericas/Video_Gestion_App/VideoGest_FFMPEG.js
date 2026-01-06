// VideoGest_FFMPEG.js - VERSIÓN COMPLETA MODIFICADA
class VideoGestFFMPEG {
    constructor() {
        this.ffmpegURL = 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe';
        
        // Configuración de calidad para reducción
        this.qualitySettings = {
            pc: '-vcodec libx265 -crf 28',
            tablet: '-crf 28',
            mobile: '-crf 28 -vf "scale=\'min(640,iw)\':-2"'
        };
        
        // Sufijos para archivos de salida por operación
        this.outputSuffixes = {
            reduce: {
                pc: '_PC',
                tablet: '_Tablet',
                mobile: '_Movil'
            },
            cut: '_Cortado',
            convert: '_Convertido',
            reverse: '_Reverse'
        };
        
        // Formatos soportados para conversión
        this.supportedFormats = {
            'mp4': 'mp4',
            'mov': 'mov',
            'avi': 'avi',
            'mkv': 'matroska',
            'webm': 'webm',
            'flv': 'flv',
            'wmv': 'asf',
            'm4v': 'mp4',
            'mpg': 'mpeg',
            'mpeg': 'mpeg'
        };
        
        this.currentOperation = null;
        this.currentFile = null;
        this.outputFile = null;
    }
    
    setOperation(operation) {
        this.currentOperation = operation;
    }
    
    setInputFile(file) {
        this.currentFile = file;
    }
    
    // Método principal para generar comandos - ahora soporta múltiples operaciones
    generateCommand(params = {}) {
        if (!this.currentOperation || !this.currentFile) {
            throw new Error('Operación o archivo no especificado');
        }
        
        // Generar nombre de archivo de salida
        const outputFilename = this.generateOutputFilename(params);
        
        // Comando para descargar ffmpeg si no existe
        const downloadCommand = `if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri '${this.ffmpegURL}' -OutFile 'ffmpeg.exe'"`;
        
        // Generar comando FFMPEG específico según la operación
        let ffmpegCommand;
        
        switch(this.currentOperation) {
            case 'reduce':
                ffmpegCommand = this.generateReduceCommand(outputFilename, params);
                break;
            case 'cut':
                ffmpegCommand = this.generateCutCommand(outputFilename, params);
                break;
            case 'convert':
                ffmpegCommand = this.generateConvertCommand(outputFilename, params);
                break;
            case 'reverse':
                ffmpegCommand = this.generateReverseCommand(outputFilename);
                break;
            default:
                throw new Error(`Operación no soportada: ${this.currentOperation}`);
        }
        
        const fullCommand = `${downloadCommand}\n${ffmpegCommand}`;
        this.outputFile = outputFilename;
        
        return {
            command: fullCommand,
            input: this.currentFile,
            output: outputFilename,
            operation: this.currentOperation,
            params: params,
            downloadCommand: downloadCommand,
            ffmpegCommand: ffmpegCommand
        };
    }
    
    // Generar nombre de archivo de salida según operación
    generateOutputFilename(params) {
        if (!this.currentFile) {
            return `output${this.getSuffix(params)}.mp4`;
        }
        
        // Normalizar separadores
        const normalizedPath = this.currentFile.replace(/\\/g, '/');
        
        // Obtener solo el nombre del archivo
        const lastSlash = normalizedPath.lastIndexOf('/');
        const filename = lastSlash !== -1 ? normalizedPath.substring(lastSlash + 1) : normalizedPath;
        
        const lastDot = filename.lastIndexOf('.');
        const nameWithoutExt = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
        const originalExt = lastDot !== -1 ? filename.substring(lastDot) : '';
        
        const suffix = this.getSuffix(params);
        const extension = this.getOutputExtension(params);
        
        return `${nameWithoutExt}${suffix}${extension}`;
    }
    
    // Obtener sufijo según operación
    getSuffix(params) {
        switch(this.currentOperation) {
            case 'reduce':
                return this.outputSuffixes.reduce[params.quality || 'tablet'] || '';
            case 'cut':
                return this.outputSuffixes.cut;
            case 'convert':
                return this.outputSuffixes.convert;
            case 'reverse':
                return this.outputSuffixes.reverse;
            default:
                return '';
        }
    }
    
    // Obtener extensión de salida según operación
    getOutputExtension(params) {
        switch(this.currentOperation) {
            case 'convert':
                return params.format ? `.${params.format}` : '.mp4';
            default:
                // Para otras operaciones, mantener la extensión original
                if (!this.currentFile) return '.mp4';
                
                const normalizedPath = this.currentFile.replace(/\\/g, '/');
                const filename = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
                const lastDot = filename.lastIndexOf('.');
                return lastDot !== -1 ? filename.substring(lastDot) : '.mp4';
        }
    }
    
    // Generar comando para REDUCIR tamaño
    generateReduceCommand(outputFilename, params) {
        const quality = params.quality || 'tablet';
        const ffmpegParams = this.qualitySettings[quality];
        
        return `ffmpeg -y -i "${this.currentFile}" ${ffmpegParams} "${outputFilename}"`;
    }
    
    // Generar comando para CORTAR video
    // VideoGest_FFMPEG.js - Método generateCutCommand actualizado
    generateCutCommand(outputFilename, params) {
        const startTime = params.startTime || '00:00:00';
        const endTime = params.endTime || '';
        
        let command = `ffmpeg -y -i "${this.currentFile}"`;
        
        if (endTime) {
            command += ` -ss ${startTime} -to ${endTime}`;
        } else {
            command += ` -ss ${startTime}`;
        }
        
        // Comando simplificado - mapea todos los streams disponibles
        command += ` -c copy -map_metadata 0 -map 0 "${outputFilename}"`;
        
        return command;
    }
    
    // Generar comando para CONVERTIR formato
    generateConvertCommand(outputFilename, params) {
        const format = params.format || 'mp4';
        
        // Obtener codec apropiado para el formato
        let codecParams = '';
        if (format === 'mp4') {
            codecParams = '-c:v libx264 -c:a aac';
        } else if (format === 'mov') {
            codecParams = '-c:v mpeg4 -c:a aac';
        } else if (format === 'avi') {
            codecParams = '-c:v mpeg4 -c:a mp3';
        }
        
        // Preservar metadatos
        let command = `ffmpeg -y -i "${this.currentFile}"`;
        command += ` ${codecParams}`;
        command += ` -map_metadata 0 -map_metadata:s:v 0:s:v -map_metadata:s:a 0:s:a`;
        command += ` "${outputFilename}"`;
        
        return command;
    }
    
    // Generar comando para REVERTIR video
    generateReverseCommand(outputFilename) {
        // Revertir video preservando metadatos
        return `ffmpeg -y -i "${this.currentFile}" -vf reverse -af areverse -map_metadata 0 "${outputFilename}"`;
    }
    
    // Método para analizar duración de video (usa API del navegador)
    analyzeVideoDuration(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('video/')) {
                reject(new Error('No es un archivo de video válido'));
                return;
            }
            
            // Verificar si el navegador soporta la API necesaria
            if (typeof document === 'undefined' || !('createElement' in document)) {
                reject(new Error('Entorno de navegador no disponible'));
                return;
            }
            
            // Crear URL temporal para el video
            const videoURL = URL.createObjectURL(file);
            const video = document.createElement('video');
            
            video.preload = 'metadata';
            video.src = videoURL;
            video.muted = true; // Silenciar para mejor experiencia
            
            // Cuando se cargan los metadatos, obtenemos la duración
            const onLoadedMetadata = () => {
                URL.revokeObjectURL(videoURL); // Liberar memoria
                
                const duration = video.duration; // Duración en segundos
                
                if (!duration || duration === Infinity || isNaN(duration)) {
                    reject(new Error('No se pudo obtener la duración del video'));
                    return;
                }
                
                const totalSeconds = Math.floor(duration);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                
                // Formatear con ceros a la izquierda
                const formatTime = (time) => time.toString().padStart(2, '0');
                
                resolve({
                    seconds: duration,
                    hours: hours,
                    minutes: minutes,
                    secondsFormatted: formatTime(seconds),
                    totalSeconds: totalSeconds,
                    formatted: `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`,
                    raw: duration,
                    valid: true
                });
            };
            
            const onError = (error) => {
                URL.revokeObjectURL(videoURL);
                console.error('Error cargando video:', error);
                reject(new Error('Error al cargar el video para análisis'));
            };
            
            video.onloadedmetadata = onLoadedMetadata;
            video.onerror = onError;
            
            // Timeout de seguridad (10 segundos máximo)
            const timeout = setTimeout(() => {
                URL.revokeObjectURL(videoURL);
                if (video.parentNode) {
                    video.parentNode.removeChild(video);
                }
                reject(new Error('Timeout analizando duración'));
            }, 10000);
            
            // Limpiar timeout cuando se complete
            video.onloadedmetadata = () => {
                clearTimeout(timeout);
                onLoadedMetadata();
            };
            
            video.onerror = () => {
                clearTimeout(timeout);
                onError();
            };
            
            // Forzar carga de metadatos
            video.load();
        });
    }
    
    // Mantener el método antiguo por compatibilidad (pero ahora devuelve valores vacíos)
    getVideoDuration() {
        return {
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            formatted: '--:--:--',
            valid: false
        };
    }
    
    // Métodos de utilidad
    
    getQualityDescription(quality) {
        const descriptions = {
            pc: 'Calidad PC (H.265/HEVC) - Máxima compresión manteniendo calidad',
            tablet: 'Calidad Tablet (H.264) - Balance calidad/tamaño',
            mobile: 'Calidad Móvil (H.264) - Tamaño reducido para móviles'
        };
        
        return descriptions[quality] || 'Calidad estándar';
    }
    
    getFormatDescription(format) {
        const descriptions = {
            'mp4': 'MP4 - Formato estándar para web y dispositivos',
            'mov': 'MOV - Formato Apple QuickTime',
            'avi': 'AVI - Formato contenedor de audio/video',
            'mkv': 'MKV - Formato contenedor multimedia abierto',
            'webm': 'WebM - Formato optimizado para web',
            'flv': 'FLV - Formato Flash Video',
            'wmv': 'WMV - Formato Windows Media Video',
            'm4v': 'M4V - Formato Apple iTunes Video',
            'mpg': 'MPG - Formato MPEG-1/MPEG-2',
            'mpeg': 'MPEG - Formato MPEG-1/MPEG-2'
        };
        
        return descriptions[format] || `Formato ${format.toUpperCase()}`;
    }
    
    validateFFMPEGAvailable() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    available: false,
                    message: 'FFMPEG no detectado. Se descargará automáticamente si es necesario.'
                });
            }, 500);
        });
    }
    
    estimateProcessingTime(fileSize, operation, params = {}) {
        const baseTime = 30;
        const sizeFactor = fileSize / (100 * 1024 * 1024);
        
        // Factores según operación
        const operationFactors = {
            reduce: params.quality === 'pc' ? 2.0 : 1.0,
            cut: 0.5,  // Cortar es rápido
            convert: 1.2,  // Convertir puede requerir re-encoding
            reverse: 1.5   // Revertir requiere procesamiento completo
        };
        
        const factor = operationFactors[operation] || 1.0;
        const estimatedSeconds = baseTime * sizeFactor * factor;
        
        return {
            seconds: Math.round(estimatedSeconds),
            minutes: Math.round(estimatedSeconds / 60),
            formatted: estimatedSeconds < 60 ? 
                `${Math.round(estimatedSeconds)} segundos` : 
                `${Math.round(estimatedSeconds / 60)} minutos`
        };
    }
    
    getSupportedFormats() {
        return Object.keys(this.supportedFormats);
    }
    
    getSupportedFormatsForConversion() {
        return Object.keys(this.supportedFormats).map(format => ({
            value: format,
            label: format.toUpperCase(),
            description: this.getFormatDescription(format)
        }));
    }
    
    validateFileFormat(filename) {
        const formats = this.getSupportedFormats();
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.') + 1);
        return formats.includes(ext);
    }
    
    // Validar formato de tiempo HH:MM:SS
    validateTimeFormat(time) {
        if (!time) return true;
        
        const timeRegex = /^([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
        if (!timeRegex.test(time)) {
            return false;
        }
        
        const [, hours, minutes, seconds] = time.match(timeRegex);
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        const s = parseInt(seconds, 10);
        
        return h >= 0 && h < 24 && m >= 0 && m < 60 && s >= 0 && s < 60;
    }
}

// Crear instancia global
window.videoGestFFMPEG = new VideoGestFFMPEG();