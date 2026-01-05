// VideoGest_FFMPEG.js
class VideoGestFFMPEG {
    constructor() {
        this.ffmpegCommands = {
            pc: '-vcodec libx265 -crf 28',
            tablet: '-crf 28',
            mobile: '-crf 28'
        };
        
        // URL pública de ffmpeg.exe
        this.ffmpegURL = 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe';
        
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
    
    extractDirectory(filePath) {
        if (!filePath) return '.';
        
        const path = filePath.replace(/\\/g, '/');
        const lastSlash = path.lastIndexOf('/');
        
        if (lastSlash !== -1) {
            return path.substring(0, lastSlash);
        }
        
        return '.';
    }
    
    getQualitySuffix(quality) {
        const suffixes = {
            pc: '_PC',
            tablet: '_Tablet',
            mobile: '_Movil'
        };
        
        return suffixes[quality] || '_reduced';
    }
    
    generateOutputFilename(inputPath, quality) {
        const path = inputPath.replace(/\\/g, '/');
        const lastSlash = path.lastIndexOf('/');
        const filename = lastSlash !== -1 ? path.substring(lastSlash + 1) : path;
        
        const lastDot = filename.lastIndexOf('.');
        const nameWithoutExt = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
        
        const qualitySuffix = this.getQualitySuffix(quality);
        return `${nameWithoutExt}${qualitySuffix}.mp4`;
    }
    
    generateCommand(params = {}) {
        if (!this.currentOperation || !this.currentFile) {
            throw new Error('Operación o archivo no especificado');
        }
        
        const inputPath = this.currentFile.path || this.currentFile.name;
        const quality = params.quality || 'tablet';
        
        const outputFilename = this.generateOutputFilename(inputPath, quality);
        const ffmpegOptions = this.ffmpegCommands[quality] || this.ffmpegCommands.tablet;
        
        // COMANDO DE UNA SOLA LÍNEA PARA PEGAR EN CMD
        const oneLineCommand = `if not exist "ffmpeg.exe" (powershell -Command "Invoke-WebRequest -Uri '${this.ffmpegURL}' -OutFile 'ffmpeg.exe'") && ffmpeg -y -i "${inputPath}" ${ffmpegOptions} "${outputFilename}"`;
        
        // DIRECTORIO DEL VIDEO
        const directory = this.extractDirectory(inputPath);
        
        this.outputFile = outputFilename;
        
        return {
            command: oneLineCommand,
            input: inputPath,
            output: outputFilename,
            operation: this.currentOperation,
            quality: quality,
            directory: directory,
            ffmpegURL: this.ffmpegURL,
            estimatedTime: this.estimateProcessingTime(this.currentFile.size, 'reduce', quality)
        };
    }
    
    getQualityDescription(quality) {
        const descriptions = {
            pc: 'Calidad PC (H.265/HEVC) - Máxima compresión manteniendo calidad',
            tablet: 'Calidad Tablet (H.264) - Balance calidad/tamaño',
            mobile: 'Calidad Móvil (H.264) - Tamaño reducido para dispositivos móviles'
        };
        
        return descriptions[quality] || 'Calidad estándar';
    }
    
    estimateProcessingTime(fileSize, operation, quality) {
        const baseTime = 30;
        const sizeFactor = fileSize / (100 * 1024 * 1024);
        const operationFactors = {
            reduce: 1.5,
            cut: 1.0,
            convert: 0.8,
            reverse: 2.0,
            tojpg: 1.2,
            merge: 1.3
        };
        
        const qualityFactors = {
            pc: 2.0,
            tablet: 1.0,
            mobile: 0.8
        };
        
        const operationFactor = operationFactors[operation] || 1.0;
        const qualityFactor = qualityFactors[quality] || 1.0;
        const estimatedSeconds = baseTime * sizeFactor * operationFactor * qualityFactor;
        
        return {
            seconds: Math.round(estimatedSeconds),
            minutes: Math.round(estimatedSeconds / 60),
            formatted: estimatedSeconds < 60 ? 
                `${Math.round(estimatedSeconds)} segundos` : 
                `${Math.round(estimatedSeconds / 60)} minutos`
        };
    }
}

// Crear instancia global
window.videoGestFFMPEG = new VideoGestFFMPEG();