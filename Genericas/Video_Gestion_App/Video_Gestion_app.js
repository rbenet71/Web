// Archivo principal de la aplicación Video Gestión
class VideoGestionApp {
    constructor() {
        this.ffmpeg = null;
        this.estaCargado = false;
        this.tareasEnProceso = [];
        
        this.inicializarApp();
    }

    inicializarApp() {
        // Inicializar traducciones
        if (window.traducciones) {
            window.traducciones.inicializar();
        }
        
        // Inicializar almacenamiento
        if (window.almacenamiento) {
            window.almacenamiento.inicializar();
        }
        
        // Inicializar UI
        if (window.uiManager) {
            window.uiManager.inicializar();
        }
        
        // Cargar FFMPEG
        this.cargarFFMPEG();
        
        // Configurar eventos
        this.configurarEventos();
        
        // Verificar instalación PWA
        this.verificarInstalacion();
    }

    async cargarFFMPEG() {
        try {
            this.mostrarMensaje('Cargando FFMPEG...', 'info');
            
            // Usar FFMPEG.wasm
            this.ffmpeg = new FFmpeg();
            
            // Cargar el binario
            await this.ffmpeg.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
                wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm',
            });
            
            this.estaCargado = true;
            this.mostrarMensaje('FFMPEG cargado correctamente', 'success');
            
            console.log('FFMPEG cargado:', this.ffmpeg);
        } catch (error) {
            console.error('Error cargando FFMPEG:', error);
            this.mostrarMensaje('Error cargando FFMPEG. Algunas funciones pueden no estar disponibles.', 'error');
        }
    }

    configurarEventos() {
        // Eventos del menú principal
        document.getElementById('reduce-size-card').addEventListener('click', () => {
            this.abrirModal('reduce-size-modal');
        });
        
        document.getElementById('cut-video-card').addEventListener('click', () => {
            this.abrirModal('cut-video-modal');
        });
        
        document.getElementById('convert-format-card').addEventListener('click', () => {
            this.abrirModal('convert-format-modal');
        });
        
        document.getElementById('reverse-video-card').addEventListener('click', () => {
            this.abrirModal('reverse-video-modal');
        });
        
        document.getElementById('to-jpg-card').addEventListener('click', () => {
            this.abrirModal('to-jpg-modal');
        });
        
        document.getElementById('join-videos-card').addEventListener('click', () => {
            this.abrirModal('join-videos-modal');
        });
        
        // Eventos de instalación PWA
        document.getElementById('install-btn').addEventListener('click', () => {
            this.mostrarInstalacionPWA();
        });
        
        // Eventos de ayuda
        document.getElementById('footer-help-btn').addEventListener('click', () => {
            this.abrirModal('help-modal');
        });
        
        document.getElementById('help-icon-header').addEventListener('click', () => {
            this.abrirModal('help-modal');
        });
        
        // Eventos de sugerencias
        document.getElementById('suggestions-btn').addEventListener('click', () => {
            this.abrirModal('suggestions-modal');
        });
        
        // Cerrar modales al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModal(modal.id);
                }
            });
        });
    }

    abrirModal(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Inicializar componentes específicos del modal
            this.inicializarModal(idModal);
        }
    }

    cerrarModal(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    inicializarModal(idModal) {
        switch(idModal) {
            case 'reduce-size-modal':
                this.inicializarModalReducir();
                break;
            case 'cut-video-modal':
                this.inicializarModalCortar();
                break;
            case 'convert-format-modal':
                this.inicializarModalConvertir();
                break;
            case 'reverse-video-modal':
                this.inicializarModalRevertir();
                break;
            case 'to-jpg-modal':
                this.inicializarModalJPG();
                break;
            case 'join-videos-modal':
                this.inicializarModalUnir();
                break;
        }
    }

    inicializarModalReducir() {
        const form = document.getElementById('reduce-size-form');
        const fileInput = document.getElementById('reduce-file-input');
        const filePath = document.getElementById('reduce-file-path');
        const browseBtn = document.getElementById('reduce-browse-btn');
        const destFolder = document.getElementById('reduce-dest-folder');
        const destBrowseBtn = document.getElementById('reduce-dest-browse-btn');
        const convertBtn = document.getElementById('reduce-convert-btn');
        const cancelBtn = document.getElementById('reduce-cancel-btn');
        const modalClose = document.getElementById('reduce-size-modal-close');

        // Configurar eventos
        browseBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                filePath.value = file.name;
                
                // Establecer carpeta destino por defecto
                const rutaCompleta = fileInput.value;
                const rutaCarpeta = rutaCompleta.substring(0, rutaCompleta.lastIndexOf('\\'));
                destFolder.value = rutaCarpeta;
                
                // Guardar preferencia
                window.almacenamiento.guardarPreferencia('ultima_carpeta', rutaCarpeta);
            }
        });

        destBrowseBtn.addEventListener('click', () => {
            // En una PWA real, usarías la API de sistema de archivos
            // Por ahora simulamos con un input
            const tempInput = document.createElement('input');
            tempInput.type = 'file';
            tempInput.webkitdirectory = true;
            tempInput.addEventListener('change', () => {
                if (tempInput.files.length > 0) {
                    destFolder.value = tempInput.files[0].webkitRelativePath.split('/')[0];
                }
            });
            tempInput.click();
        });

        convertBtn.addEventListener('click', async () => {
            if (!this.estaCargado) {
                this.mostrarMensaje('FFMPEG no está cargado. Por favor, espera.', 'error');
                return;
            }

            if (!fileInput.files[0]) {
                this.mostrarMensaje('Por favor, selecciona un archivo de video.', 'warning');
                return;
            }

            const calidad = document.getElementById('quality-select').value;
            const archivo = fileInput.files[0];
            const carpetaDestino = destFolder.value || '.';

            try {
                await window.procesadorVideo.reducirTamanio(archivo, calidad, carpetaDestino);
                this.mostrarMensaje('Video procesado correctamente', 'success');
                this.cerrarModal('reduce-size-modal');
            } catch (error) {
                this.mostrarMensaje('Error procesando video: ' + error.message, 'error');
            }
        });

        cancelBtn.addEventListener('click', () => {
            this.cerrarModal('reduce-size-modal');
        });

        modalClose.addEventListener('click', () => {
            this.cerrarModal('reduce-size-modal');
        });
    }

    inicializarModalCortar() {
        // Implementación similar a la anterior
        const fileInput = document.getElementById('cut-file-input');
        const browseBtn = document.getElementById('cut-browse-btn');
        const convertBtn = document.getElementById('cut-convert-btn');
        const cancelBtn = document.getElementById('cut-cancel-btn');
        const modalClose = document.getElementById('cut-video-modal-close');

        browseBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', async () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                document.getElementById('cut-file-path').value = file.name;
                
                // Obtener duración del video
                try {
                    const duracion = await window.procesadorVideo.obtenerDuracionVideo(file);
                    document.getElementById('cut-end-time').value = duracion;
                    document.getElementById('cut-video-info').innerHTML = 
                        `Duración: ${duracion} | Tamaño: ${this.formatearTamano(file.size)}`;
                } catch (error) {
                    console.error('Error obteniendo duración:', error);
                }
            }
        });

        convertBtn.addEventListener('click', async () => {
            if (!fileInput.files[0]) {
                this.mostrarMensaje('Por favor, selecciona un archivo de video.', 'warning');
                return;
            }

            const archivo = fileInput.files[0];
            const inicio = document.getElementById('cut-start-time').value;
            const fin = document.getElementById('cut-end-time').value;
            const carpetaDestino = document.getElementById('cut-dest-folder').value || '.';

            try {
                await window.procesadorVideo.cortarVideo(archivo, inicio, fin, carpetaDestino);
                this.mostrarMensaje('Video cortado correctamente', 'success');
                this.cerrarModal('cut-video-modal');
            } catch (error) {
                this.mostrarMensaje('Error cortando video: ' + error.message, 'error');
            }
        });

        cancelBtn.addEventListener('click', () => {
            this.cerrarModal('cut-video-modal');
        });

        modalClose.addEventListener('click', () => {
            this.cerrarModal('cut-video-modal');
        });
    }

    inicializarModalConvertir() {
        // Implementación similar
    }

    inicializarModalRevertir() {
        // Implementación similar
    }

    inicializarModalJPG() {
        // Implementación similar
    }

    inicializarModalUnir() {
        // Implementación más compleja para unir videos
    }

    mostrarMensaje(texto, tipo = 'info', duracion = 5000) {
        const mensaje = document.getElementById('message');
        mensaje.textContent = texto;
        mensaje.className = `message ${tipo}`;
        mensaje.style.display = 'block';
        
        setTimeout(() => {
            mensaje.style.display = 'none';
        }, duracion);
    }

    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    verificarInstalacion() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.getElementById('install-btn').style.display = 'none';
        }
    }

    async mostrarInstalacionPWA() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                this.mostrarMensaje('¡Aplicación instalada correctamente!', 'success');
                document.getElementById('install-btn').style.display = 'none';
            }
            
            window.deferredPrompt = null;
        } else {
            this.mostrarMensaje('La aplicación ya está instalada o no se puede instalar.', 'info');
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VideoGestionApp();
});