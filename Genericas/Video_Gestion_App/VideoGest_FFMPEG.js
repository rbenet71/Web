// VideoGest_FFMPEG.js - VERSIÓN CORREGIDA
class VideoGestFFMPEG {
    constructor() {
        this.ffmpegURL = 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe';
        
        this.qualitySettings = {
            pc: '-vcodec libx265 -crf 28',
            tablet: '-crf 28',
            mobile: '-crf 28 -vf "scale=\'min(640,iw)\':-2"'
        };
        
        this.outputSuffixes = {
            pc: '_PC',
            tablet: '_Tablet',
            mobile: '_Movil'
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
    
    generateOutputFilename(inputPath, quality) {
        // Si solo tenemos el nombre del archivo (sin ruta), manejarlo correctamente
        if (!inputPath) {
            return `output${this.outputSuffixes[quality] || ''}.mp4`;
        }
        
        // Normalizar separadores (por si acaso)
        const normalizedPath = inputPath.replace(/\\/g, '/');
        
        // Encontrar el último separador para obtener solo el nombre del archivo
        const lastSlash = normalizedPath.lastIndexOf('/');
        const filename = lastSlash !== -1 ? normalizedPath.substring(lastSlash + 1) : normalizedPath;
        
        const lastDot = filename.lastIndexOf('.');
        const nameWithoutExt = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
        const originalExt = lastDot !== -1 ? filename.substring(lastDot) : '';
        
        const suffix = this.outputSuffixes[quality] || '';
        return `${nameWithoutExt}${suffix}${originalExt || '.mp4'}`;
    }
    
    generateCommand(params = {}) {
        if (!this.currentOperation || !this.currentFile) {
            throw new Error('Operación o archivo no especificado');
        }
        
        if (this.currentOperation !== 'reduce') {
            throw new Error('Solo la operación de reducción está implementada');
        }
        
        const inputPath = this.currentFile;
        const quality = params.quality || 'tablet';
        const outputFilename = this.generateOutputFilename(inputPath, quality);
        
        // Comando de dos líneas (no usa &&)
        const downloadCommand = `if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri '${this.ffmpegURL}' -OutFile 'ffmpeg.exe'"`;
        const ffmpegCommand = `ffmpeg -y -i "${inputPath}" ${this.qualitySettings[quality]} "${outputFilename}"`;
        
        const fullCommand = `${downloadCommand}\n${ffmpegCommand}`;
        
        this.outputFile = outputFilename;
        
        return {
            command: fullCommand,
            input: inputPath,
            output: outputFilename,
            operation: this.currentOperation,
            quality: quality,
            downloadCommand: downloadCommand,
            ffmpegCommand: ffmpegCommand
        };
    }
    
    getQualityDescription(quality) {
        const descriptions = {
            pc: 'Calidad PC (H.265/HEVC) - Máxima compresión manteniendo calidad',
            tablet: 'Calidad Tablet (H.264) - Balance calidad/tamaño',
            mobile: 'Calidad Móvil (H.264) - Tamaño reducido para móviles'
        };
        
        return descriptions[quality] || 'Calidad estándar';
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
    
    estimateProcessingTime(fileSize, quality) {
        const baseTime = 30;
        const sizeFactor = fileSize / (100 * 1024 * 1024);
        const qualityFactors = {
            pc: 2.0,     // H.265 es más lento
            tablet: 1.0,
            mobile: 1.2  // Escalado añade tiempo
        };
        
        const factor = qualityFactors[quality] || 1.0;
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
        return [
            '.mp4', '.avi', '.mov', '.mkv', '.webm',
            '.flv', '.wmv', '.m4v', '.mpg', '.mpeg'
        ];
    }
    
    validateFileFormat(filename) {
        const formats = this.getSupportedFormats();
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return formats.includes(ext);
    }
}

// Crear instancia global
window.videoGestFFMPEG = new VideoGestFFMPEG();