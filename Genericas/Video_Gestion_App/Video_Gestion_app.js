// Video_Gestion_app.js - Versión con FFMPEG local
class VideoGestionApp {
    constructor() {
        this.ffmpeg = null;
        this.estaCargado = false;
        this.modalesAbiertos = new Set();
        this.sesionActual = null;
        this.ffmpegCargando = false;
        
        this.inicializarCuandoListo();
    }

    inicializarCuandoListo() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.inicializarApp());
        } else {
            this.inicializarApp();
        }
    }

    async inicializarApp() {
        console.log('🚀 Inicializando Video Gestión App...');
        
        try {
            // 1. Inicializar módulos básicos primero
            this.inicializarModulosBasicos();
            
            // 2. Configurar eventos (sin esperar FFMPEG)
            this.configurarEventos();
            
            // 3. Cargar FFMPEG en segundo plano (opcional)
            setTimeout(() => this.cargarFFMPEGEnBackground(), 1000);
            
            // 4. Verificar PWA
            this.verificarInstalacionPWA();
            
            // 5. Cargar sesión por defecto
            this.cargarSesionPorDefecto();
            
            console.log('✅ Aplicación inicializada correctamente');
            this.mostrarMensaje('✅ Aplicación lista - Modo demo activado', 'success', 3000);
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.mostrarMensaje('Error inicializando aplicación', 'error');
        }
    }

    inicializarModulosBasicos() {
        // Inicializar traducciones
        if (typeof window.traducciones !== 'undefined') {
            window.traducciones.inicializar();
            console.log('✅ Traducciones inicializadas');
        }
        
        // Inicializar almacenamiento
        if (typeof window.almacenamiento !== 'undefined') {
            window.almacenamiento.inicializar();
            console.log('✅ Almacenamiento inicializado');
        }
        
        // Inicializar UI Manager
        if (typeof window.uiManager !== 'undefined') {
            window.uiManager.inicializar();
            console.log('✅ UI Manager inicializado');
        }
        
        // Crear procesador de video simulado
        this.crearProcesadorSimulado();
    }

    crearProcesadorSimulado() {
        window.procesadorVideo = {
            estaCargado: false,
            
            reducirTamanio: async (archivo, calidad, carpetaDestino) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        console.log(`Procesando ${archivo.name} para ${calidad}`);
                        resolve(`video_${calidad}.mp4`);
                    }, 2000);
                });
            },
            
            cortarVideo: async (archivo, inicio, fin, carpetaDestino) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        console.log(`Cortando ${archivo.name} de ${inicio} a ${fin}`);
                        resolve(`video_cortado.mp4`);
                    }, 1500);
                });
            },
            
            obtenerDuracionVideo: async (file) => {
                return new Promise((resolve) => {
                    const video = document.createElement('video');
                    video.preload = 'metadata';
                    video.onloadedmetadata = () => {
                        window.URL.revokeObjectURL(video.src);
                        const segundos = video.duration;
                        const horas = Math.floor(segundos / 3600);
                        const minutos = Math.floor((segundos % 3600) / 60);
                        const segs = Math.floor(segundos % 60);
                        resolve(`${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`);
                    };
                    video.onerror = () => resolve('00:05:00');
                    video.src = URL.createObjectURL(file);
                });
            },
            
            convertirFormato: async (archivo, formato, carpetaDestino) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        console.log(`Convirtiendo ${archivo.name} a ${formato}`);
                        resolve(`video_convertido.${formato}`);
                    }, 1000);
                });
            }
        };
        
        console.log('✅ Procesador de video simulado inicializado');
    }

    async cargarFFMPEGEnBackground() {
        if (this.ffmpegCargando) return;
        this.ffmpegCargando = true;
        
        try {
            console.log('🔄 Intentando cargar FFMPEG...');
            
            // Solo cargar FFMPEG si estamos en HTTPS/localhost
            if (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                await this.cargarFFMPEGReal();
            } else {
                console.log('⚠️ FFMPEG solo disponible en HTTPS/localhost');
                this.mostrarMensaje('FFMPEG disponible en servidor local', 'info', 2000);
            }
            
        } catch (error) {
            console.log('ℹ️ FFMPEG no disponible - Modo demo activado');
        } finally {
            this.ffmpegCargando = false;
        }
    }

    async cargarFFMPEGReal() {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            if (window.FFmpegWASM) {
                this.inicializarFFMPEGReal();
                resolve();
                return;
            }

            // Intentar cargar desde archivo local primero
            const script = document.createElement('script');
            script.src = '/libs/ffmpeg/ffmpeg.min.js';

            script.onload = () => {
                if (window.FFmpegWASM) {
                    this.inicializarFFMPEGReal();
                    resolve();
                } else {
                    // Fallback a CDN
                    this.cargarFFMPEGDesdeCDN(resolve, reject);
                }
            };

            script.onerror = () => {
                console.warn('⚠️ No se pudo cargar FFMPEG localmente');
                // Intentar desde CDN como fallback
                this.cargarFFMPEGDesdeCDN(resolve, reject);
            };
            
            document.head.appendChild(script);
        });
    }

    cargarFFMPEGDesdeCDN(resolve, reject) {
        console.log('🔄 Intentando cargar FFMPEG desde CDN...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/ffmpeg.min.js';

        script.onload = () => {
            if (window.FFmpegWASM) {
                this.inicializarFFMPEGReal();
                resolve();
            } else {
                reject(new Error('FFmpegWASM no disponible'));
            }
        };

        script.onerror = () => {
            console.warn('⚠️ No se pudo cargar FFMPEG desde CDN');
            reject(new Error('Error cargando ffmpeg'));
        };
        
        document.head.appendChild(script);
    }

    async inicializarFFMPEGReal() {
        try {
            const { FFmpeg } = window.FFmpegWASM;
            this.ffmpeg = new FFmpeg();

            console.log('🔄 Inicializando FFMPEG...');
            
            // Intentar cargar desde archivos locales primero
            try {
                await this.ffmpeg.load({
                    coreURL: '/libs/ffmpeg/ffmpeg-core.js',
                    wasmURL: '/libs/ffmpeg/ffmpeg-core.wasm'
                });
                console.log('✅ FFMPEG cargado correctamente desde archivos locales');
            } catch (localError) {
                console.warn('⚠️ No se pudieron cargar archivos locales, intentando CDN...', localError);
                // Fallback a CDN
                await this.ffmpeg.load({
                    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
                    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm'
                });
                console.log('✅ FFMPEG cargado correctamente desde CDN');
            }

            this.estaCargado = true;
            console.log('✅ FFMPEG inicializado correctamente');
            this.mostrarMensaje('✅ FFMPEG cargado - Modo completo activado', 'success', 3000);

            // Reemplazar procesador simulado con real
            this.crearProcesadorReal();

        } catch (e) {
            console.error('❌ Error inicializando FFMPEG:', e);
            // No lanzar el error, mantener en modo demo
            this.mostrarMensaje('Modo demo activado - FFMPEG no disponible', 'info', 3000);
        }
    }

    crearProcesadorReal() {
        window.procesadorVideo = {
            estaCargado: true,
            
            reducirTamanio: async (archivo, calidad, carpetaDestino) => {
                return await this.reducirVideoReal(archivo, calidad);
            },
            
            cortarVideo: async (archivo, inicio, fin, carpetaDestino) => {
                return await this.cortarVideoReal(archivo, inicio, fin);
            },
            
            obtenerDuracionVideo: async (file) => {
                return new Promise((resolve) => {
                    const video = document.createElement('video');
                    video.preload = 'metadata';
                    video.onloadedmetadata = () => {
                        window.URL.revokeObjectURL(video.src);
                        const segundos = video.duration;
                        const horas = Math.floor(segundos / 3600);
                        const minutos = Math.floor((segundos % 3600) / 60);
                        const segs = Math.floor(segundos % 60);
                        resolve(`${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`);
                    };
                    video.onerror = () => resolve('00:05:00');
                    video.src = URL.createObjectURL(file);
                });
            },
            
            convertirFormato: async (archivo, formato, carpetaDestino) => {
                return await this.convertirFormatoReal(archivo, formato);
            }
        };
        
        console.log('✅ Procesador de video real inicializado');
    }

    // ===========================================
    // FUNCIONES REALES DE FFMPEG
    // ===========================================

    async reducirVideoReal(archivo, calidad) {
        if (!this.estaCargado || !this.ffmpeg) {
            throw new Error('FFMPEG no está disponible');
        }

        console.log(`📹 Reduciendo video: ${archivo.name} a calidad: ${calidad}`);
        
        // Convertir archivo a Uint8Array
        const arrayBuffer = await archivo.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        
        // Escribir archivo en FFMPEG
        await this.ffmpeg.writeFile('input.mp4', data);

        // Configurar parámetros según calidad
        let bitrate = '1M';
        let crf = '23';
        
        switch(calidad) {
            case 'baja': 
                bitrate = '500k';
                crf = '28';
                break;
            case 'media': 
                bitrate = '1M';
                crf = '23';
                break;
            case 'alta': 
                bitrate = '2M';
                crf = '20';
                break;
        }

        console.log(`⚙️ Parámetros FFMPEG: bitrate=${bitrate}, crf=${crf}`);
        
        // Ejecutar FFMPEG para reducir tamaño
        await this.ffmpeg.exec([
            '-i', 'input.mp4',
            '-c:v', 'libx264',
            '-b:v', bitrate,
            '-preset', 'medium',
            '-crf', crf,
            '-c:a', 'aac',
            '-b:a', '128k',
            'output.mp4'
        ]);
        
        // Leer resultado
        const outputData = await this.ffmpeg.readFile('output.mp4');
        
        // Crear blob para descarga
        const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
        console.log(`✅ Video reducido: ${outputBlob.size} bytes`);
        return outputBlob;
    }

    async cortarVideoReal(archivo, inicio, fin) {
        if (!this.estaCargado || !this.ffmpeg) {
            throw new Error('FFMPEG no está disponible');
        }

        console.log(`✂️ Cortando video: ${archivo.name} de ${inicio} a ${fin}`);
        
        // Convertir tiempos a segundos
        const tiempoInicio = this.tiempoASegundos(inicio);
        const tiempoFin = this.tiempoASegundos(fin);
        const duracion = tiempoFin - tiempoInicio;

        if (duracion <= 0) {
            throw new Error('El tiempo final debe ser mayor al tiempo inicial');
        }

        // Convertir archivo a Uint8Array
        const arrayBuffer = await archivo.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        
        // Escribir archivo en FFMPEG
        await this.ffmpeg.writeFile('input.mp4', data);

        // Ejecutar FFMPEG para cortar
        await this.ffmpeg.exec([
            '-i', 'input.mp4',
            '-ss', tiempoInicio.toString(),
            '-t', duracion.toString(),
            '-c', 'copy',
            'output.mp4'
        ]);
        
        // Leer resultado
        const outputData = await this.ffmpeg.readFile('output.mp4');
        
        // Crear blob para descarga
        const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
        console.log(`✅ Video cortado: ${outputBlob.size} bytes`);
        return outputBlob;
    }

    async convertirFormatoReal(archivo, formato) {
        if (!this.estaCargado || !this.ffmpeg) {
            throw new Error('FFMPEG no está disponible');
        }

        console.log(`🔄 Convirtiendo video: ${archivo.name} a formato: ${formato}`);
        
        // Convertir archivo a Uint8Array
        const arrayBuffer = await archivo.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        
        // Obtener extensión original
        const nombreOriginal = archivo.name.toLowerCase();
        let extensionOriginal = 'mp4';
        if (nombreOriginal.endsWith('.avi')) extensionOriginal = 'avi';
        if (nombreOriginal.endsWith('.mov')) extensionOriginal = 'mov';
        if (nombreOriginal.endsWith('.webm')) extensionOriginal = 'webm';
        if (nombreOriginal.endsWith('.mkv')) extensionOriginal = 'mkv';
        
        const inputName = `input.${extensionOriginal}`;
        await this.ffmpeg.writeFile(inputName, data);

        // Configurar códec según formato
        let codecVideo = 'libx264';
        let codecAudio = 'aac';
        let extension = formato.toLowerCase();
        
        switch(extension) {
            case 'avi':
                codecVideo = 'mpeg4';
                codecAudio = 'mp3';
                break;
            case 'mov':
                codecVideo = 'libx264';
                codecAudio = 'aac';
                break;
            case 'webm':
                codecVideo = 'libvpx-vp9';
                codecAudio = 'libopus';
                break;
            case 'mkv':
                codecVideo = 'libx264';
                codecAudio = 'aac';
                break;
        }

        console.log(`⚙️ Convirtiendo a: ${extension}, códec video: ${codecVideo}, códec audio: ${codecAudio}`);
        
        // Ejecutar FFMPEG para convertir
        await this.ffmpeg.exec([
            '-i', inputName,
            '-c:v', codecVideo,
            '-c:a', codecAudio,
            `output.${extension}`
        ]);
        
        // Leer resultado
        const outputData = await this.ffmpeg.readFile(`output.${extension}`);
        
        // Crear blob para descarga
        const outputBlob = new Blob([outputData.buffer], { type: `video/${extension}` });
        console.log(`✅ Video convertido: ${outputBlob.size} bytes`);
        return outputBlob;
    }

    tiempoASegundos(tiempo) {
        const partes = tiempo.split(':');
        if (partes.length === 3) {
            return parseInt(partes[0]) * 3600 + parseInt(partes[1]) * 60 + parseInt(partes[2]);
        } else if (partes.length === 2) {
            return parseInt(partes[0]) * 60 + parseInt(partes[1]);
        }
        return parseInt(tiempo);
    }

    // ===========================================
    // CONFIGURACIÓN DE EVENTOS
    // ===========================================

    configurarEventos() {
        console.log('🔧 Configurando eventos...');
        
        this.configurarEventosMenu();
        this.configurarEventosModales();
        this.configurarEventosPWA();
        this.configurarEventosAyuda();
        this.configurarEventosGenerales();
        this.configurarSelectoresArchivos();
        this.configurarBotonesProcesamiento();
        
        console.log('✅ Eventos configurados');
    }

    configurarEventosMenu() {
        const menuCards = [
            { id: 'reduce-size-card', modal: 'reduce-size-modal' },
            { id: 'cut-video-card', modal: 'cut-video-modal' },
            { id: 'convert-format-card', modal: 'convert-format-modal' },
            { id: 'reverse-video-card', modal: 'reverse-video-modal' },
            { id: 'to-jpg-card', modal: 'to-jpg-modal' },
            { id: 'join-videos-card', modal: 'join-videos-modal' }
        ];

        menuCards.forEach(({ id, modal }) => {
            const card = document.getElementById(id);
            if (card) {
                card.addEventListener('click', () => this.abrirModal(modal));
            }
        });
    }

    configurarEventosModales() {
        // Configurar todos los botones de cerrar (X)
        document.querySelectorAll('.modal-close').forEach(btn => {
            if (btn.id) {
                const modalId = btn.id.replace('-close', '');
                btn.addEventListener('click', () => this.cerrarModal(modalId));
            }
        });

        // Configurar botones de cancelar
        const cancelButtons = [
            'reduce-cancel-btn', 'cut-cancel-btn', 'format-cancel-btn',
            'reverse-cancel-btn', 'jpg-cancel-btn', 'join-cancel-btn',
            'cancel-cuts-btn', 'playback-cancel-btn', 'cancel-suggestion-btn'
        ];

        cancelButtons.forEach(btnId => {
            const button = document.getElementById(btnId);
            if (button) {
                const modalId = this.obtenerModalDesdeBoton(btnId);
                button.addEventListener('click', () => this.cerrarModal(modalId));
            }
        });

        // Botón OK de ayuda
        const helpOkBtn = document.getElementById('help-modal-ok');
        if (helpOkBtn) {
            helpOkBtn.addEventListener('click', () => this.cerrarModal('help-modal'));
        }
    }

    obtenerModalDesdeBoton(btnId) {
        const mapa = {
            'reduce-cancel-btn': 'reduce-size-modal',
            'cut-cancel-btn': 'cut-video-modal',
            'format-cancel-btn': 'convert-format-modal',
            'reverse-cancel-btn': 'reverse-video-modal',
            'jpg-cancel-btn': 'to-jpg-modal',
            'join-cancel-btn': 'join-videos-modal',
            'cancel-cuts-btn': 'multiple-cuts-modal',
            'playback-cancel-btn': 'playback-modal',
            'cancel-suggestion-btn': 'suggestions-modal'
        };
        return mapa[btnId] || btnId.replace('-cancel-btn', '-modal');
    }

    configurarEventosPWA() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.mostrarInstalacionPWA());
        }
    }

    configurarEventosAyuda() {
        const helpBtns = [
            document.getElementById('footer-help-btn'),
            document.getElementById('help-icon-header')
        ];
        
        helpBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', () => this.abrirModal('help-modal'));
        });
        
        const suggestionsBtn = document.getElementById('suggestions-btn');
        if (suggestionsBtn) {
            suggestionsBtn.addEventListener('click', () => this.abrirModal('suggestions-modal'));
        }
    }

    configurarEventosGenerales() {
        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cerrarTodosModales();
        });

        // Prevenir submit de formularios
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => e.preventDefault());
        });

        // Cerrar modales al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.cerrarModal(modal.id);
            });
        });
    }

    configurarSelectoresArchivos() {
        const configuraciones = [
            { browse: 'reduce-browse-btn', input: 'reduce-file-input', display: 'reduce-file-path', dest: 'reduce-dest-folder' },
            { browse: 'cut-browse-btn', input: 'cut-file-input', display: 'cut-file-path', dest: 'cut-dest-folder' },
            { browse: 'convert-browse-btn', input: 'convert-file-input', display: 'convert-file-path', dest: 'convert-dest-folder' },
            { browse: 'reverse-browse-btn', input: 'reverse-file-input', display: 'reverse-file-path', dest: 'reverse-dest-folder' },
            { browse: 'jpg-browse-btn', input: 'jpg-file-input', display: 'jpg-file-path', dest: 'jpg-dest-folder' }
        ];

        configuraciones.forEach(config => {
            const browseBtn = document.getElementById(config.browse);
            const fileInput = document.getElementById(config.input);
            const displayField = document.getElementById(config.display);
            const destInput = document.getElementById(config.dest);

            if (browseBtn && fileInput && displayField) {
                browseBtn.addEventListener('click', () => fileInput.click());
                
                fileInput.addEventListener('change', () => {
                    if (fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        displayField.value = file.name;
                        
                        if (destInput) {
                            const ruta = fileInput.value;
                            const carpeta = ruta.substring(0, ruta.lastIndexOf('\\')) || 
                                          ruta.substring(0, ruta.lastIndexOf('/')) || 
                                          '.';
                            destInput.value = carpeta;
                        }
                    }
                });
            }
        });
    }

    configurarBotonesProcesamiento() {
        // Reducir tamaño
        const reduceBtn = document.getElementById('reduce-convert-btn');
        if (reduceBtn) {
            reduceBtn.addEventListener('click', () => this.procesarReduccion());
        }

        // Cortar video
        const cutBtn = document.getElementById('cut-convert-btn');
        if (cutBtn) {
            cutBtn.addEventListener('click', () => this.procesarCorte());
        }

        // Convertir formato
        const convertBtn = document.getElementById('format-convert-btn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.procesarConversion());
        }

        // Revertir video
        const reverseBtn = document.getElementById('reverse-convert-btn');
        if (reverseBtn) {
            reverseBtn.addEventListener('click', () => this.procesarReversion());
        }

        // Extraer JPG
        const jpgBtn = document.getElementById('jpg-convert-btn');
        if (jpgBtn) {
            jpgBtn.addEventListener('click', () => this.procesarExtraccionJPG());
        }

        // Unir videos
        const joinBtn = document.getElementById('join-videos-btn');
        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.unirVideos());
        }

        // Sugerencias
        const sendSuggestionBtn = document.getElementById('send-suggestion-btn');
        if (sendSuggestionBtn) {
            sendSuggestionBtn.addEventListener('click', () => this.enviarSugerencia());
        }

        // Múltiples cortes
        const addCutBtn = document.getElementById('add-cut-btn');
        if (addCutBtn) {
            addCutBtn.addEventListener('click', () => this.agregarCorteMultiple());
        }

        const saveCutsBtn = document.getElementById('save-cuts-btn');
        if (saveCutsBtn) {
            saveCutsBtn.addEventListener('click', () => this.guardarCortesMultiples());
        }
    }

    // ===========================================
    // GESTIÓN DE MODALES
    // ===========================================

    abrirModal(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) {
            modal.style.display = 'block';
            this.modalesAbiertos.add(idModal);
            document.body.style.overflow = 'hidden';
            
            // Inicializar modal específico
            this.inicializarModalEspecifico(idModal);
        }
    }

    cerrarModal(idModal) {
        const modal = document.getElementById(idModal);
        if (modal) {
            modal.style.display = 'none';
            this.modalesAbiertos.delete(idModal);
            
            if (this.modalesAbiertos.size === 0) {
                document.body.style.overflow = 'auto';
            }
        }
    }

    cerrarTodosModales() {
        this.modalesAbiertos.forEach(modalId => this.cerrarModal(modalId));
        this.modalesAbiertos.clear();
        document.body.style.overflow = 'auto';
    }

    inicializarModalEspecifico(idModal) {
        // Inicialización específica si es necesaria
    }

    // ===========================================
    // PROCESAMIENTO DE VIDEOS
    // ===========================================

    async procesarReduccion() {
        const fileInput = document.getElementById('reduce-file-input');
        if (!fileInput?.files[0]) {
            this.mostrarMensaje('Selecciona un archivo de video', 'warning');
            return;
        }

        try {
            const calidad = document.getElementById('quality-select').value;
            const archivo = fileInput.files[0];
            
            this.mostrarProgreso('reduce-progress-container', 0, 'Iniciando...');
            
            let resultado;
            if (this.estaCargado && this.ffmpeg) {
                // Modo real con FFMPEG
                this.mostrarProgreso('reduce-progress-container', 30, 'Procesando con FFMPEG...');
                resultado = await this.reducirVideoReal(archivo, calidad);
                this.mostrarProgreso('reduce-progress-container', 90, 'Creando archivo...');
                this.descargarArchivo(resultado, `video_reducido_${calidad}.mp4`);
                this.mostrarProgreso('reduce-progress-container', 100, 'Completado');
                this.mostrarMensaje(`✅ Video optimizado para ${calidad}`, 'success');
            } else {
                // Modo demo
                for (let i = 0; i <= 100; i += 10) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    this.mostrarProgreso('reduce-progress-container', i, `Procesando... ${i}%`);
                }
                this.mostrarMensaje(`✅ Video optimizado para ${calidad} (demo)`, 'success');
            }
            
            this.cerrarModal('reduce-size-modal');
            
        } catch (error) {
            console.error('Error reduciendo video:', error);
            this.mostrarMensaje('Error procesando video: ' + error.message, 'error');
        } finally {
            setTimeout(() => this.ocultarProgreso('reduce-progress-container'), 1000);
        }
    }

    async procesarCorte() {
        const fileInput = document.getElementById('cut-file-input');
        if (!fileInput?.files[0]) {
            this.mostrarMensaje('Selecciona un archivo de video', 'warning');
            return;
        }

        try {
            const inicio = document.getElementById('cut-start-time').value;
            const fin = document.getElementById('cut-end-time').value;
            
            if (!this.validarFormatoTiempo(inicio) || !this.validarFormatoTiempo(fin)) {
                this.mostrarMensaje('Formato de tiempo inválido. Usa HH:MM:SS', 'error');
                return;
            }
            
            const archivo = fileInput.files[0];
            this.mostrarProgreso('cut-progress-container', 0, 'Iniciando corte...');
            
            let resultado;
            if (this.estaCargado && this.ffmpeg) {
                // Modo real con FFMPEG
                this.mostrarProgreso('cut-progress-container', 30, 'Cortando con FFMPEG...');
                resultado = await this.cortarVideoReal(archivo, inicio, fin);
                this.mostrarProgreso('cut-progress-container', 90, 'Creando archivo...');
                this.descargarArchivo(resultado, `video_cortado_${inicio}_${fin}.mp4`);
                this.mostrarProgreso('cut-progress-container', 100, 'Completado');
                this.mostrarMensaje(`✅ Video cortado de ${inicio} a ${fin}`, 'success');
            } else {
                // Modo demo
                for (let i = 0; i <= 100; i += 20) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    this.mostrarProgreso('cut-progress-container', i, `Cortando... ${i}%`);
                }
                this.mostrarMensaje(`✅ Video cortado de ${inicio} a ${fin} (demo)`, 'success');
            }
            
            this.cerrarModal('cut-video-modal');
            
        } catch (error) {
            console.error('Error cortando video:', error);
            this.mostrarMensaje('Error cortando video: ' + error.message, 'error');
        } finally {
            setTimeout(() => this.ocultarProgreso('cut-progress-container'), 1000);
        }
    }

    async procesarConversion() {
        const fileInput = document.getElementById('convert-file-input');
        if (!fileInput?.files[0]) {
            this.mostrarMensaje('Selecciona un archivo de video', 'warning');
            return;
        }

        try {
            const formato = document.getElementById('format-select').value;
            const archivo = fileInput.files[0];
            
            this.mostrarProgreso('format-progress-container', 0, 'Iniciando conversión...');
            
            if (this.estaCargado && this.ffmpeg) {
                // Modo real con FFMPEG
                this.mostrarProgreso('format-progress-container', 30, 'Convirtiendo con FFMPEG...');
                const resultado = await this.convertirFormatoReal(archivo, formato);
                this.mostrarProgreso('format-progress-container', 90, 'Creando archivo...');
                this.descargarArchivo(resultado, `video_convertido.${formato}`);
                this.mostrarProgreso('format-progress-container', 100, 'Completado');
                this.mostrarMensaje(`✅ Video convertido a ${formato.toUpperCase()}`, 'success');
                this.cerrarModal('convert-format-modal');
            } else {
                this.mostrarMensaje('🔨 Conversión de formato requiere FFMPEG', 'info');
            }
            
        } catch (error) {
            console.error('Error convirtiendo video:', error);
            this.mostrarMensaje('Error convirtiendo video: ' + error.message, 'error');
        } finally {
            setTimeout(() => this.ocultarProgreso('format-progress-container'), 1000);
        }
    }

    async procesarReversion() {
        this.mostrarMensaje('🔨 Reversión de video en desarrollo', 'info');
    }

    async procesarExtraccionJPG() {
        this.mostrarMensaje('🔨 Extracción JPG en desarrollo', 'info');
    }

    // ===========================================
    // UTILIDADES
    // ===========================================

    descargarArchivo(blob, nombre) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    mostrarMensaje(texto, tipo = 'info', duracion = 5000) {
        const mensaje = document.getElementById('message');
        if (mensaje) {
            mensaje.textContent = texto;
            mensaje.className = `message ${tipo}`;
            mensaje.style.display = 'block';
            
            setTimeout(() => {
                mensaje.style.display = 'none';
            }, duracion);
        }
    }

    mostrarProgreso(idContenedor, porcentaje, texto) {
        const contenedor = document.getElementById(idContenedor);
        const barra = document.getElementById(idContenedor.replace('-container', '-fill'));
        const textoElem = document.getElementById(idContenedor.replace('-container', '-text'));
        
        if (contenedor && barra && textoElem) {
            contenedor.style.display = 'block';
            barra.style.width = `${porcentaje}%`;
            textoElem.textContent = texto || `${Math.round(porcentaje)}%`;
        }
    }

    ocultarProgreso(idContenedor) {
        const contenedor = document.getElementById(idContenedor);
        if (contenedor) {
            setTimeout(() => {
                contenedor.style.display = 'none';
            }, 500);
        }
    }

    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    validarFormatoTiempo(tiempo) {
        const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return regex.test(tiempo);
    }

    cargarSesionPorDefecto() {
        if (window.almacenamiento) {
            const sesiones = window.almacenamiento.obtenerSesiones();
            if (sesiones.length > 0) {
                this.sesionActual = sesiones[0];
            }
        }
    }

    verificarInstalacionPWA() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            const installBtn = document.getElementById('install-btn');
            if (installBtn) installBtn.style.display = 'none';
        }
    }

    async mostrarInstalacionPWA() {
        if (window.deferredPrompt) {
            try {
                window.deferredPrompt.prompt();
                const { outcome } = await window.deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.mostrarMensaje('✅ ¡Aplicación instalada!', 'success');
                    const installBtn = document.getElementById('install-btn');
                    if (installBtn) installBtn.style.display = 'none';
                }
                
                window.deferredPrompt = null;
            } catch (error) {
                this.mostrarMensaje('❌ Error instalando', 'error');
            }
        } else {
            this.mostrarMensaje('ℹ️ La app ya está instalada', 'info');
        }
    }

    // ===========================================
    // UNIÓN DE VIDEOS
    // ===========================================

    agregarArchivoUnir() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.multiple = true;
        
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                Array.from(input.files).forEach(file => {
                    this.agregarFilaVideoUnir(file);
                });
            }
        });
        
        input.click();
    }

    agregarFilaVideoUnir(file) {
        const tbody = document.getElementById('videos-table-body');
        if (!tbody) return;
        
        const orden = tbody.children.length + 1;
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${orden}</td>
            <td>${file.name}</td>
            <td>${new Date().toLocaleDateString()}</td>
            <td>${this.formatearTamano(file.size)}</td>
            <td>--:--:--</td>
            <td><input type="text" class="form-control form-control-sm time-input" value="00:00:00"></td>
            <td><input type="text" class="form-control form-control-sm time-input" value="00:00:00"></td>
            <td>${file.name}</td>
            <td class="actions">
                <button class="btn btn-sm btn-info play-btn" title="Reproducir">
                    <i class="fas fa-play"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(fila);
        
        const playBtn = fila.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.reproducirVideo(file));
        }
    }

    eliminarSeleccionadosUnir() {
        const checkboxes = document.querySelectorAll('#videos-table-body input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            this.mostrarMensaje('Selecciona videos para eliminar', 'warning');
            return;
        }
        
        if (confirm(`¿Eliminar ${checkboxes.length} video(s)?`)) {
            checkboxes.forEach(cb => {
                const fila = cb.closest('tr');
                if (fila) fila.remove();
            });
            this.renumerarFilasUnir();
        }
    }

    vaciarTablaUnir() {
        const tbody = document.getElementById('videos-table-body');
        if (!tbody || tbody.children.length === 0) {
            this.mostrarMensaje('La tabla ya está vacía', 'info');
            return;
        }
        
        if (confirm('¿Vaciar toda la tabla? Esta acción no se puede deshacer.')) {
            tbody.innerHTML = '';
            this.mostrarMensaje('✅ Tabla vaciada', 'success');
        }
    }

    renumerarFilasUnir() {
        const filas = document.querySelectorAll('#videos-table-body tr');
        filas.forEach((fila, index) => {
            const celdaOrden = fila.querySelector('td:nth-child(2)');
            if (celdaOrden) celdaOrden.textContent = index + 1;
        });
    }

    async unirVideos() {
        this.mostrarMensaje('🔨 Unión de videos en desarrollo', 'info');
    }

    // ===========================================
    // MÚLTIPLES CORTES
    // ===========================================

    agregarCorteMultiple() {
        const container = document.getElementById('cuts-container');
        if (!container) return;
        
        const corteDiv = document.createElement('div');
        corteDiv.className = 'cut-item';
        corteDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Tiempo Inicio:</label>
                    <input type="text" class="form-control cut-start" value="00:00:00">
                </div>
                <div class="form-group">
                    <label>Tiempo Final:</label>
                    <input type="text" class="form-control cut-end" value="00:00:00">
                </div>
                <button class="btn btn-danger remove-cut-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(corteDiv);
        
        const removeBtn = corteDiv.querySelector('.remove-cut-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => container.removeChild(corteDiv));
        }
    }

    guardarCortesMultiples() {
        this.mostrarMensaje('✅ Cortes guardados', 'success');
        this.cerrarModal('multiple-cuts-modal');
    }

    // ===========================================
    // REPRODUCCIÓN DE VIDEO
    // ===========================================

    reproducirVideo(file) {
        const modal = document.getElementById('playback-modal');
        const videoPlayer = document.getElementById('video-player');
        
        if (modal && videoPlayer) {
            const url = URL.createObjectURL(file);
            videoPlayer.src = url;
            this.abrirModal('playback-modal');
        }
    }

    // ===========================================
    // SUGERENCIAS
    // ===========================================

    enviarSugerencia() {
        const email = document.getElementById('suggestion-email').value;
        const texto = document.getElementById('suggestion-text').value;
        
        if (!texto.trim()) {
            this.mostrarMensaje('Escribe una sugerencia', 'warning');
            return;
        }
        
        this.mostrarMensaje('✅ ¡Gracias por tu sugerencia!', 'success');
        this.cerrarModal('suggestions-modal');
        
        document.getElementById('suggestion-email').value = '';
        document.getElementById('suggestion-text').value = '';
    }
}

// ===========================================
// INICIALIZACIÓN
// ===========================================

// Registrar Service Worker solo si estamos en servidor
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('Video_Gestion_serviceWorker.js')
            .then(reg => {
                console.log('✅ Service Worker registrado');
            })
            .catch(err => {
                console.log('ℹ️ Service Worker no registrado - La app funciona igual');
            });
    });
}

// Detectar evento de instalación PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'flex';
    }
});

// Crear instancia global cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VideoGestionApp();
    window.deferredPrompt = deferredPrompt;
    console.log('🎬 Video Gestión App cargada. Accede con "app" en la consola.');
});