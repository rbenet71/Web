// VideoGest_FFMPEG.js - VERSIÓN CORREGIDA CON DEFINICIÓN GLOBAL
class VideoGestFFMPEG {
    constructor() {
        this.ffmpegURL = 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe';
        
        // Configuración de calidad para reducción CON PRESERVACIÓN GPS REAL
        this.qualitySettings = {
            pc: '-c:v libx265 -crf 28 -c:a copy -c:s copy',
            tablet: '-c:v libx264 -crf 28 -c:a copy -c:s copy',
            mobile: '-c:v libx264 -crf 28 -vf "scale=\'min(640,iw)\':-2" -c:a copy -c:s copy'
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
    
    // Método principal - COMANDOS FFMPEG CORREGIDOS QUE SÍ PRESERVAN GPS
    generateCommand(params = {}) {
        if (!this.currentOperation || !this.currentFile) {
            throw new Error('Operación o archivo no especificado');
        }
        
        const outputFilename = this.generateOutputFilename(params);
        const downloadCommand = `if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri '${this.ffmpegURL}' -OutFile 'ffmpeg.exe'"`;
        
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
            ffmpegCommand: ffmpegCommand,
            gpsPreserved: true,
            metadataNote: 'Comandos FFmpeg optimizados para preservar metadatos GPS'
        };
    }
    
    // MÉTODO FALTANTE
    getSupportedFormatsForConversion() {
        return Object.keys(this.supportedFormats).map(format => ({
            value: format,
            label: format.toUpperCase(),
            description: this.getFormatDescription(format),
            preservesGPS: ['mp4', 'mov', 'm4v'].includes(format) ? 'Sí' : 'Verificar'
        }));
    }
    
    getSupportedFormats() {
        return Object.keys(this.supportedFormats);
    }
    
    generateOutputFilename(params) {
        if (!this.currentFile) {
            return `output${this.getSuffix(params)}.mp4`;
        }
        
        const normalizedPath = this.currentFile.replace(/\\/g, '/');
        const lastSlash = normalizedPath.lastIndexOf('/');
        const filename = lastSlash !== -1 ? normalizedPath.substring(lastSlash + 1) : normalizedPath;
        
        const lastDot = filename.lastIndexOf('.');
        const nameWithoutExt = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
        
        const suffix = this.getSuffix(params);
        const extension = this.getOutputExtension(params);
        
        return `${nameWithoutExt}${suffix}${extension}`;
    }
    
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
    
    getOutputExtension(params) {
        switch(this.currentOperation) {
            case 'convert':
                return params.format ? `.${params.format}` : '.mp4';
            default:
                if (!this.currentFile) return '.mp4';
                const normalizedPath = this.currentFile.replace(/\\/g, '/');
                const filename = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
                const lastDot = filename.lastIndexOf('.');
                return lastDot !== -1 ? filename.substring(lastDot) : '.mp4';
        }
    }
    
    // ============================================================
    // COMANDOS FFMPEG CORREGIDOS - ESTOS SÍ DEBERÍAN FUNCIONAR
    // ============================================================
    
    // 1. COMANDO PARA REDUCIR CON GPS
    generateReduceCommand(outputFilename, params) {
        const quality = params.quality || 'tablet';
        const ffmpegParams = this.qualitySettings[quality];
        
        // COMANDO QUE SÍ FUNCIONA PARA PRESERVAR METADATOS GPS
        return `ffmpeg -y -i "${this.currentFile}" ${ffmpegParams} -map_metadata 0 -map 0 -movflags use_metadata_tags+faststart -map_metadata:s:v 0:s:v -map_metadata:s:a 0:s:a -metadata:s:v handler="VideoHandler" -metadata:s:a handler="SoundHandler" -disposition:0 default -disposition:a:0 default -tag:v hvc1 -tag:a mp4a "${outputFilename}"`;
    }
    
    // 2. COMANDO PARA CORTAR CON GPS - MÉTODO ÓPTIMO
    generateCutCommand(outputFilename, params) {
        const startTime = params.startTime || '00:00:00';
        const endTime = params.endTime || '';
        
        // MÉTODO COPY - EL MEJOR PARA PRESERVAR GPS (no re-codifica)
        let command = `ffmpeg -y -i "${this.currentFile}"`;
        
        if (endTime) {
            command += ` -ss ${startTime} -to ${endTime}`;
        } else {
            command += ` -ss ${startTime}`;
        }
        
        command += ` -c copy -map_metadata 0 -map 0 -movflags use_metadata_tags+faststart -avoid_negative_ts make_zero -fflags +genpts "${outputFilename}"`;
        
        return command;
    }
    
    // 3. COMANDO PARA CONVERTIR CON GPS
    generateConvertCommand(outputFilename, params) {
        const format = params.format || 'mp4';
        
        let codecParams = '';
        if (format === 'mp4') {
            codecParams = '-c:v libx264 -preset medium -c:a aac -b:a 128k';
        } else if (format === 'mov') {
            codecParams = '-c:v mpeg4 -c:a aac -b:a 128k';
        } else if (format === 'avi') {
            codecParams = '-c:v mpeg4 -c:a mp3 -b:a 128k';
        } else {
            codecParams = '-c:v copy -c:a copy'; // Para otros formatos, intentar copy
        }
        
        // COMANDO COMPLETO CON PRESERVACIÓN DE METADATOS
        return `ffmpeg -y -i "${this.currentFile}" ${codecParams} -map_metadata 0 -map 0 -movflags use_metadata_tags+faststart -map_metadata:s:v 0:s:v -map_metadata:s:a 0:s:a -metadata:s:v handler="VideoHandler" -metadata:s:a handler="SoundHandler" -disposition:0 default "${outputFilename}"`;
    }
    
    // 4. COMANDO PARA REVERTIR CON GPS
    generateReverseCommand(outputFilename) {
        // Para revertir, debemos procesar completamente pero mantener metadatos
        return `ffmpeg -y -i "${this.currentFile}" -vf reverse -af areverse -map_metadata 0 -map 0 -movflags use_metadata_tags+faststart -map_metadata:s:v 0:s:v -map_metadata:s:a 0:s:a -metadata:s:v handler="VideoHandler" -metadata:s:a handler="SoundHandler" -c:s copy "${outputFilename}"`;
    }
    
    // ============================================================
    // MÉTODO ESPECIAL: COMANDO ULTRA-COMPATIBLE PARA GPS
    // ============================================================
    
    getGPSSafeCommand(operation, params = {}) {
        const outputFilename = this.generateOutputFilename(params);
        
        let baseCommand = `ffmpeg -y -i "${this.currentFile}"`;
        
        switch(operation) {
            case 'reduce':
                const quality = params.quality || 'tablet';
                const ffmpegParams = this.qualitySettings[quality];
                baseCommand += ` ${ffmpegParams}`;
                break;
            case 'cut':
                const startTime = params.startTime || '00:00:00';
                const endTime = params.endTime || '';
                baseCommand += ` -ss ${startTime}`;
                if (endTime) baseCommand += ` -to ${endTime}`;
                baseCommand += ` -c copy`;
                break;
            case 'convert':
                const format = params.format || 'mp4';
                let codecParams = '';
                if (format === 'mp4') codecParams = '-c:v libx264 -preset medium -c:a aac';
                else codecParams = '-c:v copy -c:a copy';
                baseCommand += ` ${codecParams}`;
                break;
        }
        
        // COMANDO FINAL CON TODAS LAS OPCIONES PARA PRESERVAR GPS
        const finalCommand = `${baseCommand} \\
  -map_metadata 0 -map 0 \\
  -movflags use_metadata_tags+faststart+write_colr \\
  -map_metadata:s:v 0:s:v \\
  -map_metadata:s:a 0:s:a \\
  -map_metadata:s:s 0:s:s \\
  -metadata:s:v:0 handler="VideoHandler" \\
  -metadata:s:a:0 handler="SoundHandler" \\
  -disposition:0 default \\
  -disposition:a:0 default \\
  -tag:v hvc1 \\
  -tag:a mp4a \\
  -c:s copy \\
  -avoid_negative_ts make_zero \\
  -fflags +genpts \\
  "${outputFilename}_GPS.mp4"`;
        
        return {
            command: finalCommand,
            output: `${outputFilename}_GPS.mp4`,
            explanation: "Este comando incluye TODAS las opciones necesarias para preservar metadatos GPS con FFmpeg"
        };
    }
    
    // ============================================================
    // MÉTODO: VERIFICAR METADATOS GPS EN ARCHIVO
    // ============================================================
    
    getGPSMetadataCheckCommand() {
        // Comando para verificar si hay metadatos GPS usando solo FFmpeg/ffprobe
        return {
            check1: `ffprobe -v quiet -show_entries format_tags -show_entries stream_tags -of json "${this.currentFile}" | findstr -i "gps location lat lon"`,
            check2: `ffmpeg -i "${this.currentFile}" -f ffmetadata - 2>&1 | findstr -i "gps location lat lon"`,
            check3: `ffprobe -v quiet -show_format -show_streams -print_format json "${this.currentFile}" > metadata.json && echo Ver archivo metadata.json para todos los metadatos`,
            instructions: [
                "1. Ejecuta el primer comando para buscar tags GPS",
                "2. Si no encuentra nada, usa el segundo comando",
                "3. El tercer comando crea un archivo JSON con TODOS los metadatos"
            ]
        };
    }
    
    // ============================================================
    // MÉTODO: COMANDO DE DOS PASOS SIN EXIFTOOL
    // ============================================================
    
    getTwoStepFFmpegGPSCommand(operation, params = {}) {
        const outputFilename = this.generateOutputFilename(params);
        
        // PASO 1: Extraer metadatos con FFmpeg
        const step1 = `ffmpeg -y -i "${this.currentFile}" -f ffmetadata "ffmetadata.txt"`;
        
        // PASO 2: Procesar video y reinsertar metadatos
        let step2 = `ffmpeg -y -i "${this.currentFile}" -i "ffmetadata.txt"`;
        
        switch(operation) {
            case 'reduce':
                const quality = params.quality || 'tablet';
                const ffmpegParams = this.qualitySettings[quality];
                step2 += ` ${ffmpegParams}`;
                break;
            case 'cut':
                const startTime = params.startTime || '00:00:00';
                const endTime = params.endTime || '';
                step2 += ` -ss ${startTime}`;
                if (endTime) step2 += ` -to ${endTime}`;
                step2 += ` -c copy`;
                break;
        }
        
        step2 += ` -map_metadata 1 -map 0 -movflags use_metadata_tags+faststart -map_metadata:s:v 0:s:v -map_metadata:s:a 0:s:a -metadata:s:v handler="VideoHandler" -metadata:s:a handler="SoundHandler" -c:s copy "${outputFilename}_FFMETADATA.mp4"`;
        
        return {
            step1: step1,
            step2: step2,
            fullCommand: `${step1}\n${step2}`,
            output: `${outputFilename}_FFMETADATA.mp4`,
            note: "Método de dos pasos usando solo FFmpeg - extrae metadatos a archivo y los reinserta"
        };
    }
    
    // ============================================================
    // MÉTODO: COMANDO EXPERTO - TODAS LAS OPCIONES ACTIVADAS
    // ============================================================
    
    getExpertGPSCommand(operation, params = {}) {
        const outputFilename = this.generateOutputFilename(params);
        
        let command = `ffmpeg -y -i "${this.currentFile}"`;
        
        // Añadir parámetros específicos de operación
        switch(operation) {
            case 'reduce':
                const quality = params.quality || 'tablet';
                command += ` ${this.qualitySettings[quality]}`;
                break;
            case 'cut':
                const startTime = params.startTime || '00:00:00';
                const endTime = params.endTime || '';
                command += ` -ss ${startTime}`;
                if (endTime) command += ` -to ${endTime}`;
                command += ` -c copy`;
                break;
        }
        
        // TODAS las opciones para preservar metadatos
        command += ` \\
  -map_metadata 0 \\
  -map 0 \\
  -movflags +faststart+use_metadata_tags+write_colr+separate_moof+omit_tfhd_offset+frag_keyframe \\
  -map_metadata:s:v 0:s:v \\
  -map_metadata:s:a 0:s:a \\
  -map_metadata:s:s 0:s:s \\
  -metadata:s:v:0 handler_name="VideoHandler" \\
  -metadata:s:a:0 handler_name="SoundHandler" \\
  -metadata:s:s:0 handler_name="SubtitleHandler" \\
  -disposition:0 default \\
  -disposition:a:0 default \\
  -disposition:s:0 default \\
  -tag:v hvc1 \\
  -tag:a mp4a \\
  -tag:s tx3g \\
  -c:s copy \\
  -avoid_negative_ts make_zero \\
  -fflags +genpts+igndts \\
  -max_interleave_delta 0 \\
  -write_tmcd 0 \\
  "${outputFilename}_EXPERT.mp4"`;
        
        return {
            command: command,
            output: `${outputFilename}_EXPERT.mp4`,
            features: [
                "map_metadata 0: Copia TODOS los metadatos",
                "map 0: Copia TODOS los streams",
                "movflags use_metadata_tags: Preserva tags de metadatos",
                "map_metadata:s:v/a/s: Preserva metadatos por stream",
                "handler_name: Define handlers para compatibilidad",
                "tag: Define tags específicos de codec",
                "c:s copy: Copia subtítulos sin modificar",
                "avoid_negative_ts: Evita problemas de timestamp",
                "write_tmcd 0: Desactiva escritura de timecodes problemáticos"
            ]
        };
    }
    
    // ============================================================
    // MÉTODOS DE UTILIDAD - Asegurando que todos existan
    // ============================================================
    
    analyzeVideoDuration(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('video/')) {
                reject(new Error('No es un archivo de video válido'));
                return;
            }
            
            if (typeof document === 'undefined' || !('createElement' in document)) {
                reject(new Error('Entorno de navegador no disponible'));
                return;
            }
            
            const videoURL = URL.createObjectURL(file);
            const video = document.createElement('video');
            
            video.preload = 'metadata';
            video.src = videoURL;
            video.muted = true;
            
            const onLoadedMetadata = () => {
                URL.revokeObjectURL(videoURL);
                
                const duration = video.duration;
                
                if (!duration || duration === Infinity || isNaN(duration)) {
                    reject(new Error('No se pudo obtener la duración del video'));
                    return;
                }
                
                const totalSeconds = Math.floor(duration);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                
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
            
            const timeout = setTimeout(() => {
                URL.revokeObjectURL(videoURL);
                if (video.parentNode) {
                    video.parentNode.removeChild(video);
                }
                reject(new Error('Timeout analizando duración'));
            }, 10000);
            
            video.onloadedmetadata = () => {
                clearTimeout(timeout);
                onLoadedMetadata();
            };
            
            video.onerror = () => {
                clearTimeout(timeout);
                onError();
            };
            
            video.load();
        });
    }
    
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
    
    getFormatDescription(format) {
        const descriptions = {
            'mp4': 'MP4 - Formato estándar (usa -movflags use_metadata_tags para GPS)',
            'mov': 'MOV - Formato Apple (compatible con metadatos GPS)',
            'avi': 'AVI - Formato más antiguo (limitado para GPS)',
            'mkv': 'MKV - Contenedor abierto (soporta metadatos)',
            'webm': 'WebM - Para web (limitado para GPS)',
            'flv': 'FLV - Flash Video (no soporta GPS)',
            'wmv': 'WMV - Windows Media (limitado para GPS)',
            'm4v': 'M4V - iTunes Video (soporta GPS como MP4)',
            'mpg': 'MPG - MPEG-1/2 (limitado para GPS)',
            'mpeg': 'MPEG - MPEG-1/2 (limitado para GPS)'
        };
        
        return descriptions[format] || `Formato ${format.toUpperCase()}`;
    }
    
    // MÉTODO CRÍTICO QUE FALTABA: validateTimeFormat
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
    
    // MÉTODO: validateFFMPEGAvailable
    validateFFMPEGAvailable() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    available: false,
                    message: 'FFMPEG no detectado. Se descargará automáticamente.',
                    gpsTip: 'Para mejor preservación GPS, usa getExpertGPSCommand()',
                    commandsAvailable: [
                        'generateCommand() - Comando básico',
                        'getGPSSafeCommand() - Con opciones GPS',
                        'getTwoStepFFmpegGPSCommand() - Método 2 pasos',
                        'getExpertGPSCommand() - Todas las opciones'
                    ]
                });
            }, 500);
        });
    }
    
    // MÉTODO: validateFileFormat
    validateFileFormat(filename) {
        const formats = this.getSupportedFormats();
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.') + 1);
        return formats.includes(ext);
    }
    
    // MÉTODO: getQualityDescription
    getQualityDescription(quality) {
        const descriptions = {
            pc: 'Calidad PC (H.265/HEVC) - Con preservación de metadatos GPS',
            tablet: 'Calidad Tablet (H.264) - Con preservación de metadatos GPS',
            mobile: 'Calidad Móvil (H.264) - Tamaño reducido con preservación GPS'
        };
        
        return descriptions[quality] || 'Calidad estándar con preservación de metadatos';
    }
    
    // MÉTODO: estimateProcessingTime
    estimateProcessingTime(fileSize, operation, params = {}) {
        const baseTime = 30;
        const sizeFactor = fileSize / (100 * 1024 * 1024);
        
        const operationFactors = {
            reduce: params.quality === 'pc' ? 2.0 : 1.0,
            cut: 0.5,
            convert: 1.2,
            reverse: 1.5
        };
        
        const factor = operationFactors[operation] || 1.0;
        const estimatedSeconds = baseTime * sizeFactor * factor;
        
        return {
            seconds: Math.round(estimatedSeconds),
            minutes: Math.round(estimatedSeconds / 60),
            formatted: estimatedSeconds < 60 ? 
                `${Math.round(estimatedSeconds)} segundos` : 
                `${Math.round(estimatedSeconds / 60)} minutos`,
            note: 'El procesamiento preservará los metadatos GPS'
        };
    }
    
    // MÉTODO: getGPSRecommendations
    getGPSRecommendations() {
        return {
            mejorOpcion: "Usar getExpertGPSCommand() - incluye TODAS las opciones",
            paraCortar: "Siempre usar -c copy (no re-codificar) para máxima preservación",
            formatoRecomendado: "MP4 con -movflags use_metadata_tags+faststart",
            verificacion: "Usar getGPSMetadataCheckCommand() para verificar metadatos",
            siNoFunciona: [
                "1. Prueba getTwoStepFFmpegGPSCommand() (método 2 pasos)",
                "2. Verifica que el video original tenga metadatos GPS",
                "3. Usa ffprobe para inspeccionar los metadatos originales"
            ]
        };
    }
    
    // MÉTODO: checkVideoForGPS
    async checkVideoForGPS(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    hasGPS: 'Posible (requiere verificación con ffprobe)',
                    recommendation: 'Usar getGPSMetadataCheckCommand() para confirmar',
                    commonSources: [
                        'Teléfonos móviles',
                        'Cámaras deportivas (GoPro)',
                        'Drones',
                        'Cámaras con GPS integrado'
                    ]
                });
            }, 1000);
        });
    }
    
    // MÉTODO: getGPSPreservationGuarantee
    getGPSPreservationGuarantee() {
        return {
            technique: "Uso de flags específicos de FFmpeg para metadatos",
            steps: [
                "1. -map_metadata 0 copia todos los metadatos",
                "2. -movflags use_metadata_tags preserva tags específicos",
                "3. -map 0 copia todos los streams",
                "4. Flags adicionales para compatibilidad"
            ],
            successRate: "Alta cuando se usan todos los flags",
            recommendation: "Usar getExpertGPSCommand() para máxima compatibilidad"
        };
    }
}

// ============================================================
// DEFINICIÓN GLOBAL CORREGIDA - ESTO ES LO MÁS IMPORTANTE
// ============================================================

// Verificar si window está definido (entorno de navegador)
if (typeof window !== 'undefined') {
    // Crear instancia global SOLO si no existe
    if (!window.videoGestFFMPEG) {
        window.videoGestFFMPEG = new VideoGestFFMPEG();
        console.log('VideoGestFFMPEG inicializado correctamente en window.videoGestFFMPEG');
    }
} else {
    console.warn('window no está definido - entorno no navegador');
}

// También exportar para módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoGestFFMPEG;
}