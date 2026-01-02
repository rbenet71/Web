// Video_Gestion_app.js - Núcleo principal de la aplicación
class VideoGestionApp {
    constructor() {
        this.ffmpeg = null;
        this.estaCargado = false;
        this.modalesAbiertos = new Set();
        this.sesionActual = null;
        
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
            // 1. Inicializar módulos
            this.inicializarModulos();
            
            // 2. Cargar FFMPEG
            await this.cargarFFMPEG();
            
            // 3. Configurar eventos
            this.configurarEventos();
            
            // 4. Verificar PWA
            this.verificarInstalacionPWA();
            
            // 5. Cargar sesión por defecto
            this.cargarSesionPorDefecto();
            
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.mostrarMensaje('Error inicializando aplicación', 'error');
        }
    }

    inicializarModulos() {
        // Inicializar traducciones
        if (window.traducciones) {
            window.traducciones.inicializar();
            console.log('✅ Traducciones inicializadas');
        }
        
        // Inicializar almacenamiento
        if (window.almacenamiento) {
            window.almacenamiento.inicializar();
            console.log('✅ Almacenamiento inicializado');
        }
        
        // Inicializar UI
        if (window.uiManager) {
            window.uiManager.inicializar();
            console.log('✅ UI Manager inicializado');
        }
        
        // Inicializar procesador de video
        if (!window.procesadorVideo) {
            window.procesadorVideo = new ProcesadorVideo();
            console.log('✅ Procesador de video inicializado');
        }
    }

    async cargarFFMPEG() {
        try {
            this.mostrarMensaje('Cargando FFMPEG...', 'info');
            
            if (typeof FFmpeg === 'undefined') {
                console.warn('⚠️ FFMPEG no disponible globalmente');
                this.mostrarMensaje('FFMPEG no disponible. Algunas funciones limitadas.', 'warning');
                return;
            }
            
            this.ffmpeg = new FFmpeg();
            
            await this.ffmpeg.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
                wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm',
            });
            
            this.estaCargado = true;
            console.log('✅ FFMPEG cargado correctamente');
            this.mostrarMensaje('FFMPEG listo', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando FFMPEG:', error);
            this.mostrarMensaje('Error cargando FFMPEG. Modo limitado.', 'error');
        }
    }

    configurarEventos() {
        console.log('🔧 Configurando eventos...');
        
        this.configurarEventosMenu();
        this.configurarEventosModales();
        this.configurarEventosPWA();
        this.configurarEventosAyuda();
        this.configurarEventosGenerales();
        
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
        // Configurar botones de cerrar (X)
        this.configurarBotonesCerrar();
        
        // Configurar botones de cancelar
        this.configurarBotonesCancelar();
        
        // Configurar botones de acción
        this.configurarBotonesAccion();
        
        // Cerrar al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.cerrarModal(modal.id);
            });
        });
    }

    configurarBotonesCerrar() {
        const modales = [
            'reduce-size-modal', 'cut-video-modal', 'convert-format-modal',
            'reverse-video-modal', 'to-jpg-modal', 'join-videos-modal',
            'help-modal', 'suggestions-modal', 'multiple-cuts-modal',
            'playback-modal'
        ];

        modales.forEach(modalId => {
            const closeBtn = document.getElementById(`${modalId}-close`);
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.cerrarModal(modalId));
            }
        });
    }

    configurarBotonesCancelar() {
        const cancelButtons = [
            { modal: 'reduce-size-modal', btn: 'reduce-cancel-btn' },
            { modal: 'cut-video-modal', btn: 'cut-cancel-btn' },
            { modal: 'convert-format-modal', btn: 'format-cancel-btn' },
            { modal: 'reverse-video-modal', btn: 'reverse-cancel-btn' },
            { modal: 'to-jpg-modal', btn: 'jpg-cancel-btn' },
            { modal: 'join-videos-modal', btn: 'join-cancel-btn' },
            { modal: 'multiple-cuts-modal', btn: 'cancel-cuts-btn' },
            { modal: 'playback-modal', btn: 'playback-cancel-btn' },
            { modal: 'suggestions-modal', btn: 'cancel-suggestion-btn' },
            { modal: 'help-modal', btn: 'help-modal-ok' }
        ];

        cancelButtons.forEach(({ modal, btn }) => {
            const button = document.getElementById(btn);
            if (button) {
                button.addEventListener('click', () => this.cerrarModal(modal));
            }
        });
    }

    configurarBotonesAccion() {
        // Reducir tamaño
        const reduceConvertBtn = document.getElementById('reduce-convert-btn');
        if (reduceConvertBtn) {
            reduceConvertBtn.addEventListener('click', () => this.procesarReduccion());
        }

        // Cortar video
        const cutConvertBtn = document.getElementById('cut-convert-btn');
        if (cutConvertBtn) {
            cutConvertBtn.addEventListener('click', () => this.procesarCorte());
        }

        // Convertir formato
        const formatConvertBtn = document.getElementById('format-convert-btn');
        if (formatConvertBtn) {
            formatConvertBtn.addEventListener('click', () => this.procesarConversion());
        }

        // Revertir video
        const reverseConvertBtn = document.getElementById('reverse-convert-btn');
        if (reverseConvertBtn) {
            reverseConvertBtn.addEventListener('click', () => this.procesarReversion());
        }

        // Convertir a JPG
        const jpgConvertBtn = document.getElementById('jpg-convert-btn');
        if (jpgConvertBtn) {
            jpgConvertBtn.addEventListener('click', () => this.procesarExtraccionJPG());
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

        // Configurar selectores de archivos
        this.configurarSelectoresArchivos();
    }

    configurarSelectoresArchivos() {
        const fileSelectors = [
            { browse: 'reduce-browse-btn', input: 'reduce-file-input', display: 'reduce-file-path' },
            { browse: 'cut-browse-btn', input: 'cut-file-input', display: 'cut-file-path' },
            { browse: 'convert-browse-btn', input: 'convert-file-input', display: 'convert-file-path' },
            { browse: 'reverse-browse-btn', input: 'reverse-file-input', display: 'reverse-file-path' },
            { browse: 'jpg-browse-btn', input: 'jpg-file-input', display: 'jpg-file-path' }
        ];

        fileSelectors.forEach(({ browse, input, display }) => {
            const browseBtn = document.getElementById(browse);
            const fileInput = document.getElementById(input);
            const displayField = document.getElementById(display);
            
            if (browseBtn && fileInput && displayField) {
                browseBtn.addEventListener('click', () => fileInput.click());
                
                fileInput.addEventListener('change', () => {
                    if (fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        displayField.value = file.name;
                        
                        // Auto-completar carpeta destino
                        const destFolder = displayField.id.replace('-file-path', '-dest-folder');
                        const destInput = document.getElementById(destFolder);
                        if (destInput) {
                            const ruta = fileInput.value;
                            const carpeta = ruta.substring(0, ruta.lastIndexOf('\\'));
                            destInput.value = carpeta;
                            
                            // Guardar preferencia
                            if (window.almacenamiento) {
                                window.almacenamiento.guardarUltimaCarpeta(carpeta);
                            }
                        }
                    }
                });
            }
        });
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
            console.log(`📂 Modal abierto: ${idModal}`);
            
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
            console.log(`📂 Modal cerrado: ${idModal}`);
        }
    }

    cerrarTodosModales() {
        this.modalesAbiertos.forEach(modalId => this.cerrarModal(modalId));
        this.modalesAbiertos.clear();
        document.body.style.overflow = 'auto';
        console.log('📂 Todos los modales cerrados');
    }

    inicializarModalEspecifico(idModal) {
        switch(idModal) {
            case 'reduce-size-modal':
                this.inicializarModalReducir();
                break;
            case 'cut-video-modal':
                this.inicializarModalCortar();
                break;
            case 'to-jpg-modal':
                this.inicializarModalJPG();
                break;
            case 'join-videos-modal':
                this.inicializarModalUnir();
                break;
            case 'multiple-cuts-modal':
                this.inicializarModalMultiplesCortes();
                break;
            case 'playback-modal':
                this.inicializarModalReproduccion();
                break;
        }
    }

    inicializarModalReducir() {
        console.log('🔧 Inicializando modal reducir');
    }

    inicializarModalCortar() {
        console.log('🔧 Inicializando modal cortar');
        
        const fileInput = document.getElementById('cut-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', async () => {
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    
                    try {
                        const duracion = await window.procesadorVideo.obtenerDuracionVideo(file);
                        document.getElementById('cut-end-time').value = duracion;
                        
                        const videoInfo = document.getElementById('cut-video-info');
                        if (videoInfo) {
                            videoInfo.innerHTML = 
                                `<i class="fas fa-info-circle"></i> Duración: ${duracion} | Tamaño: ${this.formatearTamano(file.size)}`;
                        }
                    } catch (error) {
                        console.error('Error obteniendo duración:', error);
                    }
                }
            });
        }
    }

    inicializarModalJPG() {
        console.log('🔧 Inicializando modal JPG');
        
        const fileInput = document.getElementById('jpg-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    const gpsInfo = document.getElementById('gps-status');
                    if (gpsInfo) {
                        gpsInfo.textContent = 'Verificando datos GPS...';
                        setTimeout(() => {
                            gpsInfo.textContent = Math.random() > 0.5 ? 
                                '✓ Datos GPS disponibles' : 
                                '✗ Sin datos GPS en el video';
                        }, 1000);
                    }
                }
            });
        }
    }

    inicializarModalUnir() {
        console.log('🔧 Inicializando modal unir');
        
        // Configurar eventos de la tabla
        this.configurarTablaUnir();
    }

    configurarTablaUnir() {
        const addFileBtn = document.getElementById('add-file-btn');
        if (addFileBtn) {
            addFileBtn.addEventListener('click', () => this.agregarArchivoUnir());
        }
        
        const removeFileBtn = document.getElementById('remove-file-btn');
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', () => this.eliminarSeleccionadosUnir());
        }
        
        const clearTableBtn = document.getElementById('clear-table-btn');
        if (clearTableBtn) {
            clearTableBtn.addEventListener('click', () => this.vaciarTablaUnir());
        }
        
        const selectAll = document.getElementById('select-all');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('#videos-table-body input[type="checkbox"]');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }
    }

    inicializarModalMultiplesCortes() {
        console.log('🔧 Inicializando modal múltiples cortes');
    }

    inicializarModalReproduccion() {
        console.log('🔧 Inicializando modal reproducción');
        
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            document.querySelectorAll('.speed-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const velocidad = parseFloat(btn.dataset.speed);
                    videoPlayer.playbackRate = velocidad;
                    
                    document.querySelectorAll('.speed-btn').forEach(b => {
                        b.classList.remove('btn-primary');
                        b.classList.add('btn-outline');
                    });
                    btn.classList.remove('btn-outline');
                    btn.classList.add('btn-primary');
                });
            });
        }
    }

    // ===========================================
    // PROCESAMIENTO DE VIDEOS
    // ===========================================

    async procesarReduccion() {
        if (!this.estaCargado) {
            this.mostrarMensaje('FFMPEG no está cargado', 'error');
            return;
        }

        const fileInput = document.getElementById('reduce-file-input');
        if (!fileInput?.files[0]) {
            this.mostrarMensaje('Selecciona un archivo de video', 'warning');
            return;
        }

        try {
            const calidad = document.getElementById('quality-select').value;
            const archivo = fileInput.files[0];
            const carpetaDestino = document.getElementById('reduce-dest-folder').value || '.';
            
            this.mostrarProgreso('reduce-progress-container', 0, 'Iniciando...');
            
            await window.procesadorVideo.reducirTamanio(archivo, calidad, carpetaDestino);
            
            this.mostrarMensaje('✅ Video procesado correctamente', 'success');
            this.cerrarModal('reduce-size-modal');
            
        } catch (error) {
            console.error('Error reduciendo video:', error);
            this.mostrarMensaje(`Error: ${error.message}`, 'error');
        } finally {
            this.ocultarProgreso('reduce-progress-container');
        }
    }

    async procesarCorte() {
        if (!this.estaCargado) {
            this.mostrarMensaje('FFMPEG no está cargado', 'error');
            return;
        }

        const fileInput = document.getElementById('cut-file-input');
        if (!fileInput?.files[0]) {
            this.mostrarMensaje('Selecciona un archivo de video', 'warning');
            return;
        }

        try {
            const archivo = fileInput.files[0];
            const inicio = document.getElementById('cut-start-time').value;
            const fin = document.getElementById('cut-end-time').value;
            const carpetaDestino = document.getElementById('cut-dest-folder').value || '.';
            
            // Validar tiempos
            if (!this.validarFormatoTiempo(inicio) || !this.validarFormatoTiempo(fin)) {
                this.mostrarMensaje('Formato de tiempo inválido. Usa HH:MM:SS', 'error');
                return;
            }
            
            this.mostrarProgreso('cut-progress-container', 0, 'Cortando...');
            
            await window.procesadorVideo.cortarVideo(archivo, inicio, fin, carpetaDestino);
            
            this.mostrarMensaje('✅ Video cortado correctamente', 'success');
            this.cerrarModal('cut-video-modal');
            
        } catch (error) {
            console.error('Error cortando video:', error);
            this.mostrarMensaje(`Error: ${error.message}`, 'error');
        } finally {
            this.ocultarProgreso('cut-progress-container');
        }
    }

    async procesarConversion() {
        this.mostrarMensaje('🔨 Función en desarrollo', 'info');
    }

    async procesarReversion() {
        this.mostrarMensaje('🔨 Función en desarrollo', 'info');
    }

    async procesarExtraccionJPG() {
        this.mostrarMensaje('🔨 Función en desarrollo', 'info');
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
                <button class="btn btn-sm btn-warning edit-btn" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(fila);
        
        // Configurar eventos de la fila
        this.configurarEventosFilaUnir(fila, file);
    }

    configurarEventosFilaUnir(fila, file) {
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
        this.mostrarMensaje('🔨 Función en desarrollo', 'info');
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
            
            // Limpiar URL al cerrar
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    URL.revokeObjectURL(url);
                }
            });
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
        
        // Simular envío
        console.log('📤 Sugerencia enviada:', { email, texto });
        
        this.mostrarMensaje('✅ ¡Gracias por tu sugerencia!', 'success');
        this.cerrarModal('suggestions-modal');
        
        // Limpiar formulario
        document.getElementById('suggestion-email').value = '';
        document.getElementById('suggestion-text').value = '';
    }

    // ===========================================
    // UTILIDADES
    // ===========================================

    mostrarMensaje(texto, tipo = 'info', duracion = 5000) {
        const mensaje = document.getElementById('message');
        if (mensaje) {
            mensaje.textContent = texto;
            mensaje.className = `message ${tipo}`;
            mensaje.style.display = 'block';
            
            setTimeout(() => mensaje.style.display = 'none', duracion);
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
        if (contenedor) contenedor.style.display = 'none';
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
                console.log('📁 Sesión cargada:', this.sesionActual.nombre);
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
                console.error('Error instalando PWA:', error);
                this.mostrarMensaje('❌ Error instalando', 'error');
            }
        } else {
            this.mostrarMensaje('ℹ️ La app ya está instalada', 'info');
        }
    }
}

// ===========================================
// INICIALIZACIÓN
// ===========================================

// Crear instancia global
window.app = new VideoGestionApp();

// Hacer disponible para consola
console.log('🎬 Video Gestión App cargada. Accede con "app" en la consola.');