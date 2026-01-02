// Procesador de video usando FFMPEG
class ProcesadorVideo {
    constructor() {
        this.ffmpeg = window.app ? window.app.ffmpeg : null;
    }

    async reducirTamanio(archivo, calidad, carpetaDestino) {
        if (!this.ffmpeg) {
            throw new Error('FFMPEG no está disponible');
        }

        try {
            // Leer el archivo
            const data = await archivo.arrayBuffer();
            const nombreArchivo = archivo.name;
            const nombreBase = nombreArchivo.substring(0, nombreArchivo.lastIndexOf('.'));
            
            // Escribir archivo en FFMPEG
            await this.ffmpeg.writeFile(nombreArchivo, new Uint8Array(data));
            
            // Configurar parámetros según calidad
            let parametros = ['-i', nombreArchivo];
            
            switch(calidad) {
                case 'pc':
                    parametros.push('-vcodec', 'libx265', '-crf', '28');
                    break;
                case 'tablet':
                    parametros.push('-vf', 'scale=iw/4:ih/4', '-crf', '28', '-b:v', '5k');
                    break;
                case 'mobile':
                    parametros.push('-vf', 'scale=iw/8:ih/8', '-crf', '28', '-b:v', '5k');
                    break;
            }
            
            const nombreSalida = `${nombreBase}_${calidad.toUpperCase()}.mp4`;
            parametros.push(nombreSalida);
            
            // Ejecutar FFMPEG
            await this.ffmpeg.exec(parametros);
            
            // Leer archivo de salida
            const dataSalida = await this.ffmpeg.readFile(nombreSalida);
            
            // Crear blob y descargar
            const blob = new Blob([dataSalida.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nombreSalida;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return nombreSalida;
        } catch (error) {
            console.error('Error reduciendo tamaño:', error);
            throw error;
        }
    }

    async cortarVideo(archivo, inicio, fin, carpetaDestino) {
        if (!this.ffmpeg) {
            throw new Error('FFMPEG no está disponible');
        }

        try {
            const data = await archivo.arrayBuffer();
            const nombreArchivo = archivo.name;
            const nombreBase = nombreArchivo.substring(0, nombreArchivo.lastIndexOf('.'));
            
            await this.ffmpeg.writeFile(nombreArchivo, new Uint8Array(data));
            
            const parametros = [
                '-ss', inicio,
                '-to', fin,
                '-i', nombreArchivo,
                '-c', 'copy',
                `${nombreBase}_Cortado.mp4`
            ];
            
            await this.ffmpeg.exec(parametros);
            
            const dataSalida = await this.ffmpeg.readFile(`${nombreBase}_Cortado.mp4`);
            const blob = new Blob([dataSalida.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${nombreBase}_Cortado.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return `${nombreBase}_Cortado.mp4`;
        } catch (error) {
            console.error('Error cortando video:', error);
            throw error;
        }
    }

    async obtenerDuracionVideo(archivo) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duracion = video.duration;
                resolve(this.segundosAHMS(duracion));
            };
            
            video.onerror = () => {
                resolve('00:00:00');
            };
            
            video.src = URL.createObjectURL(archivo);
        });
    }

    segundosAHMS(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = Math.floor(segundos % 60);
        
        return [
            horas.toString().padStart(2, '0'),
            minutos.toString().padStart(2, '0'),
            segs.toString().padStart(2, '0')
        ].join(':');
    }

    // Métodos adicionales para las otras funcionalidades
    async convertirFormato(archivo, formato, carpetaDestino) {
        // Implementar conversión de formato
    }

    async revertirVideo(archivo, carpetaDestino) {
        // Implementar reversión de video
    }

    async convertirAJPG(archivo, tamanio, intervalo, carpetaDestino) {
        // Implementar extracción de JPG
    }

    async unirVideos(archivos, carpetaDestino, nombreSalida) {
        // Implementar unión de videos
    }
}

// Exportar procesador
window.procesadorVideo = new ProcesadorVideo();