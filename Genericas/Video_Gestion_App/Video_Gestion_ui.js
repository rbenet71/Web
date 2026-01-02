// Gestión de interfaz de usuario
class UIManager {
    constructor() {
        this.modalesAbiertos = new Set();
        this.contadorProgreso = 0;
    }

    inicializar() {
        this.configurarEventosGenerales();
        this.inicializarComponentes();
        this.actualizarInterfaz();
    }

    configurarEventosGenerales() {
        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarTodosModales();
            }
        });

        // Prevenir comportamiento por defecto en formularios
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => e.preventDefault());
        });
    }

    inicializarComponentes() {
        // Inicializar selectores de archivos
        this.inicializarSelectoresArchivos();
        
        // Inicializar tablas
        this.inicializarTablas();
        
        // Inicializar controles de tiempo
        this.inicializarControlesTiempo();
    }

    inicializarSelectoresArchivos() {
        document.querySelectorAll('.file-input-group .btn').forEach(btn => {
            const inputId = btn.id.replace('-browse-btn', '-input');
            const input = document.getElementById(inputId);
            const display = document.getElementById(inputId.replace('-input', '-path'));
            
            if (input && display) {
                btn.addEventListener('click', () => input.click());
                
                input.addEventListener('change', () => {
                    if (input.files.length > 0) {
                        display.value = input.files[0].name;
                    }
                });
            }
        });
    }

    inicializarTablas() {
        // Tabla de videos para unión
        const tablaVideos = document.getElementById('videos-table');
        if (tablaVideos) {
            this.configurarTablaVideos(tablaVideos);
        }
    }

    configurarTablaVideos(tabla) {
        // Seleccionar/deseleccionar todos
        const selectAll = document.getElementById('select-all');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = tabla.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                });
            });
        }

        // Ordenar tabla
        const headers = tabla.querySelectorAll('th.sortable');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                this.ordenarTabla(tabla, header.dataset.sort);
            });
        });
    }

    ordenarTabla(tabla, columna) {
        const tbody = tabla.querySelector('tbody');
        const filas = Array.from(tbody.querySelectorAll('tr'));
        const direccion = tabla.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
        
        filas.sort((a, b) => {
            const aVal = a.querySelector(`td[data-sort="${columna}"]`).textContent;
            const bVal = b.querySelector(`td[data-sort="${columna}"]`).textContent;
            
            if (direccion === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });
        
        // Reorganizar filas
        filas.forEach(fila => tbody.appendChild(fila));
        tabla.dataset.sortDirection = direccion;
    }

    inicializarControlesTiempo() {
        document.querySelectorAll('.time-input').forEach(input => {
            input.addEventListener('input', (e) => {
                this.validarFormatoTiempo(e.target);
            });
        });
    }

    validarFormatoTiempo(input) {
        const valor = input.value;
        const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        
        if (!regex.test(valor) && valor !== '') {
            input.style.borderColor = 'var(--danger)';
        } else {
            input.style.borderColor = '';
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
            contenedor.style.display = 'none';
        }
    }

    mostrarModalConfirmacion(mensaje, titulo = 'Confirmar') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${titulo}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${mensaje}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-danger" id="confirm-btn">Sí</button>
                        <button class="btn" id="cancel-btn">No</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
            const closeBtn = modal.querySelector('.modal-close');
            const confirmBtn = modal.querySelector('#confirm-btn');
            const cancelBtn = modal.querySelector('#cancel-btn');
            
            const cerrar = (resultado) => {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
                resolve(resultado);
            };
            
            closeBtn.addEventListener('click', () => cerrar(false));
            cancelBtn.addEventListener('click', () => cerrar(false));
            confirmBtn.addEventListener('click', () => cerrar(true));
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cerrar(false);
                }
            });
        });
    }

    mostrarModalError(mensaje, titulo = 'Error') {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${titulo}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color: var(--danger);">${mensaje}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="ok-btn">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        const closeBtn = modal.querySelector('.modal-close');
        const okBtn = modal.querySelector('#ok-btn');
        
        const cerrar = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        };
        
        closeBtn.addEventListener('click', cerrar);
        okBtn.addEventListener('click', cerrar);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrar();
            }
        });
    }

    actualizarInterfaz() {
        // Actualizar estado de botones según condiciones
        this.actualizarEstadoBotones();
        
        // Actualizar contadores
        this.actualizarContadores();
        
        // Aplicar tema si existe
        this.aplicarTema();
    }

    actualizarEstadoBotones() {
        // Implementar lógica para habilitar/deshabilitar botones según estado
    }

    actualizarContadores() {
        // Actualizar contadores de progreso, archivos, etc.
    }

    aplicarTema() {
        const config = window.almacenamiento.obtenerConfiguracion();
        const tema = config.tema || 'claro';
        
        if (tema === 'oscuro') {
            document.body.classList.add('tema-oscuro');
        } else {
            document.body.classList.remove('tema-oscuro');
        }
    }

    cerrarTodosModales() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
        this.modalesAbiertos.clear();
    }

    // Métodos para manejar la tabla de unión de videos
    agregarFilaVideo(videoData) {
        const tbody = document.getElementById('videos-table-body');
        if (!tbody) return;
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${videoData.orden}</td>
            <td>${videoData.nombre}</td>
            <td>${videoData.fecha}</td>
            <td>${videoData.tamanio}</td>
            <td>${videoData.duracion}</td>
            <td><input type="text" class="form-control form-control-sm time-input" value="${videoData.inicio}"></td>
            <td><input type="text" class="form-control form-control-sm time-input" value="${videoData.fin}"></td>
            <td>${videoData.ruta}</td>
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
        
        // Configurar eventos de los botones
        this.configurarEventosFila(fila);
        
        return fila;
    }

    configurarEventosFila(fila) {
        const playBtn = fila.querySelector('.play-btn');
        const editBtn = fila.querySelector('.edit-btn');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                const ruta = fila.querySelector('td:nth-child(9)').textContent;
                this.reproducirVideo(ruta);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editarVideo(fila);
            });
        }
    }

    reproducirVideo(ruta) {
        // Implementar reproducción de video
        const modal = document.getElementById('playback-modal');
        const videoPlayer = document.getElementById('video-player');
        
        if (modal && videoPlayer) {
            // En una implementación real, cargaríamos el video
            // Por ahora mostramos el modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Configurar controles de velocidad
            document.querySelectorAll('.speed-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const velocidad = parseFloat(btn.dataset.speed);
                    videoPlayer.playbackRate = velocidad;
                    
                    // Actualizar estado de botones
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

    editarVideo(fila) {
        // Implementar edición de video
        const inicioInput = fila.querySelector('td:nth-child(7) input');
        const finInput = fila.querySelector('td:nth-child(8) input');
        
        if (inicioInput && finInput) {
            inicioInput.focus();
        }
    }

    // Métodos para el modal de múltiples cortes
    agregarCorte() {
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
        
        // Configurar evento para eliminar corte
        const removeBtn = corteDiv.querySelector('.remove-cut-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                container.removeChild(corteDiv);
            });
        }
    }
}

// Crear instancia global
window.uiManager = new UIManager();