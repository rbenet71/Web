// ============================================
// CLASE PRINCIPAL CRONO CRI
// ============================================
class CronoCRI {
    constructor() {
        // Estado principal de la aplicación
        this.state = {
            // Datos de corredores
            corredores: [],
            resultados: [],
            
            // Estado del cronómetro
            cronoActivo: false,
            cronoPausado: false,
            tiempoInicio: null,
            tiempoTotal: 0,
            
            // Contador actual
            indiceActual: 0,
            tiempoRestante: 0,
            intervalo: null,
            
            // Configuración
            audioActivo: true,
            tipoAudio: 'beep', // 'beep', 'voice', 'none'
            temaOscuro: false,
            
            // PWA
            deferredPrompt: null,
            
            // Excel
            archivoExcel: null
        };
        
        // Referencias a elementos DOM
        this.refs = {};
        
        // Audio Context para sonidos
        this.audioContext = null;
        this.gainNode = null;
    }
    
    // ============================================
    // INICIALIZACIÓN
    // ============================================
    async init() {
        console.log('Inicializando Crono CRI...');
        
        // Cargar referencias DOM
        this.cargarReferencias();
        
        // Cargar datos guardados
        this.cargarDatos();
        
        // Configurar eventos
        this.configurarEventos();
        
        // Configurar PWA
        this.configurarPWA();
        
        // Inicializar audio
        this.inicializarAudio();
        
        // Actualizar interfaz
        this.actualizarInterfaz();
        
        console.log('Crono CRI inicializado correctamente');
    }
    
    cargarReferencias() {
        // Navegación
        this.refs.navBtns = {
            corredores: document.getElementById('btn-corredores'),
            config: document.getElementById('btn-config'),
            crono: document.getElementById('btn-crono'),
            resultados: document.getElementById('btn-resultados')
        };
        
        this.refs.sections = {
            corredores: document.getElementById('section-corredores'),
            config: document.getElementById('section-config'),
            crono: document.getElementById('section-crono'),
            resultados: document.getElementById('section-resultados')
        };
        
        // Elementos de corredores
        this.refs.corredoresList = document.getElementById('corredores-list');
        this.refs.searchCorredor = document.getElementById('search-corredor');
        this.refs.filterOrden = document.getElementById('filter-orden');
        this.refs.btnImportarExcel = document.getElementById('btn-importar-excel');
        this.refs.btnCrearPlantilla = document.getElementById('btn-crear-plantilla');
        this.refs.btnNuevoCorredor = document.getElementById('btn-nuevo-corredor');
        
        // Elementos del crono
        this.refs.countdownDisplay = document.getElementById('countdown-display');
        this.refs.nextCorredorInfo = document.getElementById('next-corredor-info');
        this.refs.currentCorredorInfo = document.getElementById('current-corredor-info');
        this.refs.currentDorsal = document.getElementById('current-dorsal');
        this.refs.currentName = document.getElementById('current-name');
        this.refs.btnStartCrono = document.getElementById('btn-start-crono');
        this.refs.btnPauseCrono = document.getElementById('btn-pause-crono');
        this.refs.btnStopCrono = document.getElementById('btn-stop-crono');
        
        // Opciones de inicio
        this.refs.startOptions = document.querySelectorAll('.start-option');
        this.refs.customStartInput = document.getElementById('custom-start-input');
        this.refs.customDorsal = document.getElementById('custom-dorsal');
        this.refs.btnSetCustom = document.getElementById('btn-set-custom');
        
        // Elementos de información
        this.refs.currentCorredor = document.getElementById('current-corredor');
        this.refs.nextTime = document.getElementById('next-time');
        this.refs.totalDeparted = document.getElementById('total-departed');
        this.refs.cronoTotalTime = document.getElementById('crono-total-time');
        this.refs.footerTotalTime = document.getElementById('footer-total-time');
        this.refs.footerDeparted = document.getElementById('footer-departed');
        this.refs.footerNextTime = document.getElementById('footer-next-time');
        
        // Estadísticas
        this.refs.totalCorredores = document.getElementById('total-corredores');
        this.refs.corredoresSalidos = document.getElementById('corredores-salidos');
        this.refs.tiempoTotal = document.getElementById('tiempo-total');
        this.refs.intervaloPromedio = document.getElementById('intervalo-promedio');
        
        // Modales
        this.refs.modalImportar = document.getElementById('modal-importar');
        this.refs.modalCorredor = document.getElementById('modal-corredor');
        this.refs.modalConfirm = document.getElementById('modal-confirm');
        this.refs.modalHelp = document.getElementById('modal-help');
        
        // Formularios
        this.refs.formCorredor = document.getElementById('form-corredor');
        this.refs.corredorDorsal = document.getElementById('corredor-dorsal');
        this.refs.corredorOrden = document.getElementById('corredor-orden');
        this.refs.corredorNombre = document.getElementById('corredor-nombre');
        this.refs.corredorApellido = document.getElementById('corredor-apellido');
        this.refs.corredorTiempo = document.getElementById('corredor-tiempo');
        this.refs.corredorHora = document.getElementById('corredor-hora');
        this.refs.corredorNotas = document.getElementById('corredor-notas');
        
        // Exportación
        this.refs.btnExportResultados = document.getElementById('btn-export-resultados');
        this.refs.btnClearResultados = document.getElementById('btn-clear-resultados');
        
        // Audio
        this.refs.audioOptions = document.querySelectorAll('.audio-option');
        this.refs.testAudio = document.getElementById('test-audio');
    }
    
    // ============================================
    // GESTIÓN DE DATOS
    // ============================================
    cargarDatos() {
        // Cargar corredores
        const corredoresGuardados = localStorage.getItem('crono-cri-corredores');
        if (corredoresGuardados) {
            this.state.corredores = JSON.parse(corredoresGuardados);
        }
        
        // Cargar resultados
        const resultadosGuardados = localStorage.getItem('crono-cri-resultados');
        if (resultadosGuardados) {
            this.state.resultados = JSON.parse(resultadosGuardados);
        }
        
        // Cargar configuración
        const configGuardada = localStorage.getItem('crono-cri-config');
        if (configGuardada) {
            const config = JSON.parse(configGuardada);
            this.state.audioActivo = config.audioActivo !== undefined ? config.audioActivo : true;
            this.state.tipoAudio = config.tipoAudio || 'beep';
            this.state.temaOscuro = config.temaOscuro || false;
        }
        
        // Aplicar tema oscuro
        if (this.state.temaOscuro) {
            document.body.classList.add('dark-mode');
            document.getElementById('dark-mode').checked = true;
        }
        
        // Aplicar configuración de audio
        this.aplicarConfigAudio();
        
        console.log('Datos cargados:', {
            corredores: this.state.corredores.length,
            resultados: this.state.resultados.length,
            config: this.state
        });
    }
    
    guardarDatos() {
        // Guardar corredores
        localStorage.setItem('crono-cri-corredores', JSON.stringify(this.state.corredores));
        
        // Guardar resultados
        localStorage.setItem('crono-cri-resultados', JSON.stringify(this.state.resultados));
        
        // Guardar configuración
        const config = {
            audioActivo: this.state.audioActivo,
            tipoAudio: this.state.tipoAudio,
            temaOscuro: this.state.temaOscuro
        };
        localStorage.setItem('crono-cri-config', JSON.stringify(config));
        
        console.log('Datos guardados');
    }
    
    limpiarDatos() {
        if (confirm('¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.')) {
            this.state.corredores = [];
            this.state.resultados = [];
            localStorage.removeItem('crono-cri-corredores');
            localStorage.removeItem('crono-cri-resultados');
            this.actualizarInterfaz();
            this.mostrarNotificacion('Datos limpiados correctamente', 'success');
        }
    }
    
    // ============================================
    // GESTIÓN DE CORREDORES
    // ============================================
    async importarExcel(archivo) {
        try {
            this.mostrarLoader('Importando archivo Excel...');
            
            const data = await this.leerArchivoExcel(archivo);
            
            // Validar datos
            if (!data || data.length === 0) {
                throw new Error('El archivo no contiene datos válidos');
            }
            
            // Procesar datos
            const corredores = this.procesarDatosExcel(data);
            
            if (corredores.length === 0) {
                throw new Error('No se pudieron procesar los datos del archivo');
            }
            
            // Agregar corredores
            const corredoresExistentes = this.state.corredores.length;
            this.state.corredores = [...this.state.corredores, ...corredores];
            
            // Ordenar por tiempo de salida
            this.ordenarCorredores();
            
            // Guardar datos
            this.guardarDatos();
            
            // Actualizar interfaz
            this.actualizarListaCorredores();
            this.actualizarEstadisticas();
            
            this.ocultarLoader();
            this.mostrarNotificacion(
                `Importados ${corredores.length} corredores correctamente. Total: ${this.state.corredores.length}`,
                'success'
            );
            
            return corredores;
            
        } catch (error) {
            this.ocultarLoader();
            this.mostrarNotificacion(`Error al importar: ${error.message}`, 'error');
            console.error('Error importando Excel:', error);
            return null;
        }
    }
    
    leerArchivoExcel(archivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    
                    // Obtener primera hoja
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    
                    // Convertir a JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            reader.readAsBinaryString(archivo);
        });
    }
    
    procesarDatosExcel(data) {
        const corredores = [];
        
        // Buscar encabezados
        let headers = data[0];
        let startRow = 1;
        
        // Si no hay encabezados explícitos, usar primera fila
        if (!headers || headers.length === 0) {
            headers = ['Orden', 'Dorsal', 'TiempoSalida', 'HoraSalida', 'Nombre', 'Apellido'];
            startRow = 0;
        }
        
        // Mapear índices de columnas
        const columnIndices = {
            orden: -1,
            dorsal: -1,
            tiempoSalida: -1,
            horaSalida: -1,
            nombre: -1,
            apellido: -1
        };
        
        headers.forEach((header, index) => {
            if (!header) return;
            
            const headerLower = header.toString().toLowerCase().trim();
            
            if (headerLower.includes('orden') || headerLower.includes('número')) {
                columnIndices.orden = index;
            } else if (headerLower.includes('dorsal') || headerLower.includes('número')) {
                columnIndices.dorsal = index;
            } else if (headerLower.includes('tiempo') || headerLower.includes('salida')) {
                columnIndices.tiempoSalida = index;
            } else if (headerLower.includes('hora')) {
                columnIndices.horaSalida = index;
            } else if (headerLower.includes('nombre')) {
                columnIndices.nombre = index;
            } else if (headerLower.includes('apellido')) {
                columnIndices.apellido = index;
            }
        });
        
        // Validar columnas obligatorias
        if (columnIndices.dorsal === -1 || columnIndices.tiempoSalida === -1) {
            throw new Error('El archivo debe contener las columnas "Dorsal" y "TiempoSalida"');
        }
        
        // Procesar filas
        for (let i = startRow; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            
            try {
                // Extraer datos
                const orden = columnIndices.orden !== -1 ? parseInt(row[columnIndices.orden]) || i + 1 : i + 1;
                const dorsal = row[columnIndices.dorsal]?.toString().trim();
                const tiempoSalidaStr = row[columnIndices.tiempoSalida]?.toString().trim();
                const horaSalida = columnIndices.horaSalida !== -1 ? row[columnIndices.horaSalida]?.toString().trim() : null;
                const nombre = columnIndices.nombre !== -1 ? row[columnIndices.nombre]?.toString().trim() : '';
                const apellido = columnIndices.apellido !== -1 ? row[columnIndices.apellido]?.toString().trim() : '';
                
                // Validar dorsal
                if (!dorsal) {
                    console.warn(`Fila ${i + 1}: Dorsal vacío, se omite`);
                    continue;
                }
                
                // Validar tiempo de salida
                if (!tiempoSalidaStr) {
                    console.warn(`Fila ${i + 1}: Tiempo de salida vacío, se omite`);
                    continue;
                }
                
                // Convertir tiempo a segundos
                const tiempoSalida = this.convertirTiempoASegundos(tiempoSalidaStr);
                if (tiempoSalida === null) {
                    console.warn(`Fila ${i + 1}: Formato de tiempo inválido: "${tiempoSalidaStr}"`);
                    continue;
                }
                
                // Verificar duplicados
                if (this.state.corredores.some(c => c.dorsal === dorsal)) {
                    console.warn(`Fila ${i + 1}: Dorsal ${dorsal} ya existe, se omite`);
                    continue;
                }
                
                // Crear objeto corredor
                const corredor = {
                    id: Date.now() + i,
                    orden: orden,
                    dorsal: dorsal,
                    nombre: nombre,
                    apellido: apellido,
                    tiempoSalida: tiempoSalida,
                    horaSalida: horaSalida || this.calcularHoraSalida(tiempoSalida),
                    notas: '',
                    salidaReal: null,
                    tiempoReal: null,
                    diferencia: null,
                    estado: 'pendiente'
                };
                
                corredores.push(corredor);
                
            } catch (error) {
                console.warn(`Error procesando fila ${i + 1}:`, error);
            }
        }
        
        return corredores;
    }
    
    convertirTiempoASegundos(tiempoStr) {
        // Formato mm:ss o hh:mm:ss
        const partes = tiempoStr.split(':');
        
        if (partes.length === 2) {
            // mm:ss
            const minutos = parseInt(partes[0]);
            const segundos = parseInt(partes[1]);
            
            if (isNaN(minutos) || isNaN(segundos)) return null;
            
            return minutos * 60 + segundos;
        } else if (partes.length === 3) {
            // hh:mm:ss
            const horas = parseInt(partes[0]);
            const minutos = parseInt(partes[1]);
            const segundos = parseInt(partes[2]);
            
            if (isNaN(horas) || isNaN(minutos) || isNaN(segundos)) return null;
            
            return horas * 3600 + minutos * 60 + segundos;
        }
        
        return null;
    }
    
    calcularHoraSalida(tiempoSegundos) {
        // Si no hay hora especificada, calcular desde las 09:00
        const horaBase = new Date();
        horaBase.setHours(9, 0, 0, 0);
        
        const horaSalida = new Date(horaBase.getTime() + tiempoSegundos * 1000);
        return horaSalida.toTimeString().substring(0, 5);
    }
    
    crearPlantillaVacia() {
        const datos = [
            ['Orden', 'Dorsal', 'TiempoSalida', 'HoraSalida', 'Nombre', 'Apellido'],
            [1, '101', '00:00', '09:00', 'Juan', 'Pérez'],
            [2, '102', '01:30', '09:01:30', 'María', 'Gómez'],
            [3, '103', '03:00', '09:03:00', 'Carlos', 'López'],
            [4, '104', '04:30', '09:04:30', 'Ana', 'Rodríguez'],
            [5, '105', '06:00', '09:06:00', 'Pedro', 'Sánchez']
        ];
        
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(datos);
        
        // Aplicar estilos
        const columnWidths = [
            { wch: 8 },   // Orden
            { wch: 10 },  // Dorsal
            { wch: 12 },  // TiempoSalida
            { wch: 12 },  // HoraSalida
            { wch: 20 },  // Nombre
            { wch: 20 }   // Apellido
        ];
        worksheet['!cols'] = columnWidths;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, "Corredores");
        XLSX.writeFile(workbook, 'plantilla-cri.xlsx');
        
        this.mostrarNotificacion('Plantilla descargada correctamente', 'success');
    }
    
    ordenarCorredores() {
        this.state.corredores.sort((a, b) => {
            // Ordenar por tiempo de salida
            return a.tiempoSalida - b.tiempoSalida;
        });
        
        // Actualizar órdenes
        this.state.corredores.forEach((corredor, index) => {
            corredor.orden = index + 1;
        });
    }
    
    buscarCorredorPorDorsal(dorsal) {
        return this.state.corredores.find(c => c.dorsal === dorsal.toString());
    }
    
    // ============================================
    // INTERFAZ DE CORREDORES
    // ============================================
    actualizarListaCorredores() {
        const lista = this.refs.corredoresList;
        const terminoBusqueda = this.refs.searchCorredor.value.toLowerCase();
        const filtroOrden = this.refs.filterOrden.value;
        
        let corredoresFiltrados = [...this.state.corredores];
        
        // Aplicar búsqueda
        if (terminoBusqueda) {
            corredoresFiltrados = corredoresFiltrados.filter(corredor => {
                return corredor.dorsal.toLowerCase().includes(terminoBusqueda) ||
                       corredor.nombre.toLowerCase().includes(terminoBusqueda) ||
                       corredor.apellido.toLowerCase().includes(terminoBusqueda);
            });
        }
        
        // Aplicar orden
        if (filtroOrden === 'dorsal') {
            corredoresFiltrados.sort((a, b) => parseInt(a.dorsal) - parseInt(b.dorsal));
        } else if (filtroOrden === 'nombre') {
            corredoresFiltrados.sort((a, b) => {
                const nombreA = `${a.apellido} ${a.nombre}`.toLowerCase();
                const nombreB = `${b.apellido} ${b.nombre}`.toLowerCase();
                return nombreA.localeCompare(nombreB);
            });
        } else {
            // Orden por tiempo (por defecto)
            corredoresFiltrados.sort((a, b) => a.tiempoSalida - b.tiempoSalida);
        }
        
        // Limpiar lista
        lista.innerHTML = '';
        
        // Mostrar estado vacío si no hay corredores
        if (corredoresFiltrados.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-state';
            emptyRow.innerHTML = `
                <td colspan="8">
                    <i class="fas fa-users-slash"></i>
                    <p>${terminoBusqueda ? 'No se encontraron resultados' : 'No hay corredores cargados'}</p>
                    ${!terminoBusqueda ? `
                        <button id="btn-importar-first" class="btn btn-primary">
                            Importar lista de corredores
                        </button>
                    ` : ''}
                </td>
            `;
            lista.appendChild(emptyRow);
            return;
        }
        
        // Agregar corredores a la tabla
        corredoresFiltrados.forEach((corredor, index) => {
            const row = document.createElement('tr');
            
            // Formatear tiempo
            const tiempoFormateado = this.formatearTiempo(corredor.tiempoSalida);
            
            // Estado
            let estadoHTML = '';
            if (corredor.estado === 'salido') {
                estadoHTML = '<span class="status-badge status-salido">Salido</span>';
            } else if (corredor.estado === 'no-salido') {
                estadoHTML = '<span class="status-badge status-no-salido">No salió</span>';
            } else {
                estadoHTML = '<span class="status-badge status-pendiente">Pendiente</span>';
            }
            
            row.innerHTML = `
                <td>${corredor.orden}</td>
                <td><strong>${corredor.dorsal}</strong></td>
                <td>${corredor.nombre}</td>
                <td>${corredor.apellido}</td>
                <td>${tiempoFormateado}</td>
                <td>${corredor.horaSalida || '--:--'}</td>
                <td>${estadoHTML}</td>
                <td>
                    <button class="btn-icon editar-corredor" data-id="${corredor.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon eliminar-corredor" data-id="${corredor.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            lista.appendChild(row);
        });
        
        // Agregar event listeners a los botones
        this.agregarEventListenersCorredores();
    }
    
    agregarEventListenersCorredores() {
        // Botones editar
        document.querySelectorAll('.editar-corredor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.abrirModalEditarCorredor(id);
            });
        });
        
        // Botones eliminar
        document.querySelectorAll('.eliminar-corredor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.eliminarCorredor(id);
            });
        });
        
        // Botón importar desde estado vacío
        const btnImportarFirst = document.getElementById('btn-importar-first');
        if (btnImportarFirst) {
            btnImportarFirst.addEventListener('click', () => {
                this.abrirModalImportar();
            });
        }
    }
    
    actualizarEstadisticas() {
        // Total corredores
        this.refs.totalCorredores.textContent = this.state.corredores.length;
        
        // Corredores salidos
        const salidos = this.state.corredores.filter(c => c.estado === 'salido').length;
        this.refs.corredoresSalidos.textContent = salidos;
        
        // Tiempo total
        if (this.state.corredores.length > 0) {
            const ultimoTiempo = Math.max(...this.state.corredores.map(c => c.tiempoSalida));
            this.refs.tiempoTotal.textContent = this.formatearTiempo(ultimoTiempo);
            
            // Intervalo promedio
            if (this.state.corredores.length > 1) {
                const intervaloPromedio = ultimoTiempo / (this.state.corredores.length - 1);
                this.refs.intervaloPromedio.textContent = this.formatearTiempo(Math.round(intervaloPromedio));
            }
        } else {
            this.refs.tiempoTotal.textContent = '0:00';
            this.refs.intervaloPromedio.textContent = '0:00';
        }
        
        // Actualizar información en otras secciones
        document.getElementById('info-corredores').textContent = this.state.corredores.length;
        document.getElementById('info-salidas').textContent = salidos;
    }
    
    // ============================================
    // MODALES
    // ============================================
    abrirModalImportar() {
        this.refs.modalImportar.classList.add('active');
        document.getElementById('file-info').textContent = 'No se ha seleccionado ningún archivo';
        document.getElementById('btn-confirm-import').disabled = true;
    }
    
    abrirModalNuevoCorredor() {
        this.refs.modalCorredor.classList.add('active');
        document.getElementById('modal-corredor-title').textContent = 'Nuevo Corredor';
        
        // Limpiar formulario
        this.refs.formCorredor.reset();
        this.refs.corredorDorsal.value = '';
        this.refs.corredorOrden.value = this.state.corredores.length + 1;
        this.refs.corredorTiempo.value = '00:00';
        this.refs.corredorHora.value = '';
        
        // Quitar modo edición
        this.refs.formCorredor.dataset.editing = 'false';
    }
    
    abrirModalEditarCorredor(id) {
        const corredor = this.state.corredores.find(c => c.id === id);
        if (!corredor) return;
        
        this.refs.modalCorredor.classList.add('active');
        document.getElementById('modal-corredor-title').textContent = 'Editar Corredor';
        
        // Llenar formulario
        this.refs.corredorDorsal.value = corredor.dorsal;
        this.refs.corredorOrden.value = corredor.orden;
        this.refs.corredorNombre.value = corredor.nombre;
        this.refs.corredorApellido.value = corredor.apellido;
        this.refs.corredorTiempo.value = this.formatearTiempo(corredor.tiempoSalida);
        this.refs.corredorHora.value = corredor.horaSalida || '';
        this.refs.corredorNotas.value = corredor.notas || '';
        
        // Marcar como edición
        this.refs.formCorredor.dataset.editing = 'true';
        this.refs.formCorredor.dataset.corredorId = id;
    }
    
    abrirModalConfirmacion(mensaje, callback) {
        this.refs.modalConfirm.classList.add('active');
        document.getElementById('confirm-message').textContent = mensaje;
        
        // Configurar callback
        const btnYes = document.getElementById('btn-confirm-yes');
        const btnNo = document.getElementById('btn-confirm-no');
        
        const closeModal = () => {
            this.refs.modalConfirm.classList.remove('active');
            btnYes.onclick = null;
            btnNo.onclick = null;
        };
        
        btnYes.onclick = () => {
            callback();
            closeModal();
        };
        
        btnNo.onclick = closeModal;
    }
    
    abrirModalAyuda() {
        this.refs.modalHelp.classList.add('active');
    }
    
    cerrarModales() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // ============================================
    // GESTIÓN DE CORREDORES (CRUD)
    // ============================================
    guardarCorredor(event) {
        event.preventDefault();
        
        const isEditing = this.refs.formCorredor.dataset.editing === 'true';
        const id = isEditing ? parseInt(this.refs.formCorredor.dataset.corredorId) : Date.now();
        
        // Validar dorsal
        const dorsal = this.refs.corredorDorsal.value.trim();
        if (!dorsal) {
            this.mostrarNotificacion('El dorsal es obligatorio', 'error');
            return;
        }
        
        // Verificar duplicado (solo en nuevo)
        if (!isEditing && this.state.corredores.some(c => c.dorsal === dorsal)) {
            this.mostrarNotificacion(`El dorsal ${dorsal} ya existe`, 'error');
            return;
        }
        
        // Validar tiempo
        const tiempoStr = this.refs.corredorTiempo.value.trim();
        const tiempoSalida = this.convertirTiempoASegundos(tiempoStr);
        if (tiempoSalida === null) {
            this.mostrarNotificacion('Formato de tiempo inválido. Use mm:ss', 'error');
            return;
        }
        
        // Crear/actualizar corredor
        const corredor = {
            id: id,
            orden: parseInt(this.refs.corredorOrden.value) || this.state.corredores.length + 1,
            dorsal: dorsal,
            nombre: this.refs.corredorNombre.value.trim(),
            apellido: this.refs.corredorApellido.value.trim(),
            tiempoSalida: tiempoSalida,
            horaSalida: this.refs.corredorHora.value.trim() || this.calcularHoraSalida(tiempoSalida),
            notas: this.refs.corredorNotas.value.trim(),
            salidaReal: null,
            tiempoReal: null,
            diferencia: null,
            estado: 'pendiente'
        };
        
        if (isEditing) {
            // Actualizar corredor existente
            const index = this.state.corredores.findIndex(c => c.id === id);
            if (index !== -1) {
                // Mantener estado si ya tenía
                corredor.estado = this.state.corredores[index].estado;
                corredor.salidaReal = this.state.corredores[index].salidaReal;
                corredor.tiempoReal = this.state.corredores[index].tiempoReal;
                corredor.diferencia = this.state.corredores[index].diferencia;
                
                this.state.corredores[index] = corredor;
            }
        } else {
            // Agregar nuevo corredor
            this.state.corredores.push(corredor);
        }
        
        // Reordenar
        this.ordenarCorredores();
        
        // Guardar y actualizar
        this.guardarDatos();
        this.actualizarListaCorredores();
        this.actualizarEstadisticas();
        
        // Cerrar modal
        this.cerrarModales();
        
        // Mostrar mensaje
        this.mostrarNotificacion(
            isEditing ? 'Corredor actualizado correctamente' : 'Corredor agregado correctamente',
            'success'
        );
    }
    
    eliminarCorredor(id) {
        this.abrirModalConfirmacion('¿Estás seguro de que quieres eliminar este corredor?', () => {
            const index = this.state.corredores.findIndex(c => c.id === id);
            if (index !== -1) {
                this.state.corredores.splice(index, 1);
                
                // Reordenar
                this.ordenarCorredores();
                
                // Guardar y actualizar
                this.guardarDatos();
                this.actualizarListaCorredores();
                this.actualizarEstadisticas();
                
                this.mostrarNotificacion('Corredor eliminado correctamente', 'success');
            }
        });
    }
    
    // ============================================
    // CRONÓMETRO
    // ============================================
    iniciarCrono() {
        if (this.state.coroActivo) return;
        
        // Validar que haya corredores
        if (this.state.corredores.length === 0) {
            this.mostrarNotificacion('No hay corredores cargados', 'error');
            return;
        }
        
        // Determinar desde dónde empezar
        const startOption = document.querySelector('.start-option.active').dataset.start;
        let indiceInicio = 0;
        
        if (startOption === 'next') {
            // Encontrar el último corredor salido
            const ultimoSalido = this.state.corredores.findIndex(c => c.estado === 'pendiente');
            indiceInicio = ultimoSalido !== -1 ? ultimoSalido : this.state.corredores.length - 1;
        } else if (startOption === 'custom') {
            const dorsal = this.refs.customDorsal.value.trim();
            if (!dorsal) {
                this.mostrarNotificacion('Ingresa un número de dorsal', 'error');
                return;
            }
            
            const corredor = this.buscarCorredorPorDorsal(dorsal);
            if (!corredor) {
                this.mostrarNotificacion(`No se encontró el dorsal ${dorsal}`, 'error');
                return;
            }
            
            indiceInicio = this.state.corredores.findIndex(c => c.dorsal === dorsal);
        }
        
        // Configurar estado
        this.state.cronoActivo = true;
        this.state.cronoPausado = false;
        this.state.indiceActual = indiceInicio;
        this.state.tiempoInicio = Date.now();
        this.state.tiempoTotal = 0;
        
        // Inicializar tiempo restante
        this.actualizarTiempoRestante();
        
        // Actualizar botones
        this.refs.btnStartCrono.disabled = true;
        this.refs.btnPauseCrono.disabled = false;
        this.refs.btnStopCrono.disabled = false;
        
        // Actualizar interfaz
        this.actualizarInterfazCrono();
        this.modoPantallaCompleta(true);
        
        // Iniciar intervalo
        this.state.intervalo = setInterval(() => this.actualizarCrono(), 1000);
        
        // Sonido de inicio
        this.reproducirSonido('start');
        
        this.mostrarNotificacion('Crono iniciado', 'success');
    }
    
    pausarCrono() {
        if (!this.state.cronoActivo || this.state.cronoPausado) return;
        
        this.state.cronoPausado = true;
        this.refs.btnPauseCrono.innerHTML = '<i class="fas fa-play"></i> Continuar';
        
        this.mostrarNotificacion('Crono pausado', 'warning');
    }
    
    continuarCrono() {
        if (!this.state.cronoActivo || !this.state.cronoPausado) return;
        
        this.state.cronoPausado = false;
        this.refs.btnPauseCrono.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        
        this.mostrarNotificacion('Crono continuado', 'success');
    }
    
    detenerCrono() {
        if (!this.state.cronoActivo) return;
        
        // Detener intervalo
        if (this.state.intervalo) {
            clearInterval(this.state.intervalo);
            this.state.intervalo = null;
        }
        
        // Resetear estado
        this.state.cronoActivo = false;
        this.state.cronoPausado = false;
        
        // Actualizar botones
        this.refs.btnStartCrono.disabled = false;
        this.refs.btnPauseCrono.disabled = true;
        this.refs.btnStopCrono.disabled = true;
        this.refs.btnPauseCrono.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        
        // Salir de pantalla completa
        this.modoPantallaCompleta(false);
        
        this.mostrarNotificacion('Crono detenido', 'info');
    }
    
    actualizarCrono() {
        if (!this.state.cronoActivo || this.state.cronoPausado) return;
        
        // Actualizar tiempo total
        const ahora = Date.now();
        this.state.tiempoTotal = Math.floor((ahora - this.state.tiempoInicio) / 1000);
        
        // Actualizar tiempo restante
        this.state.tiempoRestante--;
        
        // Actualizar display
        this.actualizarDisplayCrono();
        
        // Verificar si llegó a cero
        if (this.state.tiempoRestante <= 0) {
            this.registrarSalida();
        }
        
        // Efectos de sonido y visuales
        this.actualizarEfectosCrono();
    }
    
    actualizarDisplayCrono() {
        // Mostrar tiempo restante
        const display = this.refs.countdownDisplay;
        
        if (this.state.tiempoRestante >= 60) {
            const minutos = Math.floor(this.state.tiempoRestante / 60);
            const segundos = this.state.tiempoRestante % 60;
            display.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;
        } else {
            display.textContent = this.state.tiempoRestante.toString();
        }
        
        // Actualizar información del corredor actual
        if (this.state.indiceActual < this.state.corredores.length) {
            const corredor = this.state.corredores[this.state.indiceActual];
            
            this.refs.currentDorsal.textContent = corredor.dorsal;
            this.refs.currentName.textContent = `${corredor.nombre} ${corredor.apellido}`;
            
            this.refs.currentCorredor.textContent = `${corredor.dorsal} - ${corredor.nombre} ${corredor.apellido}`;
        }
        
        // Actualizar información del próximo corredor
        const siguiente = this.obtenerSiguienteCorredor();
        if (siguiente) {
            this.refs.nextTime.textContent = this.formatearTiempo(siguiente.tiempoSalida);
            this.refs.footerNextTime.textContent = this.formatearTiempo(siguiente.tiempoSalida);
            
            // Actualizar información del próximo en la pantalla
            this.actualizarInfoProximoCorredor(siguiente);
        }
        
        // Actualizar contadores
        const salidos = this.state.corredores.filter(c => c.estado === 'salido').length;
        this.refs.totalDeparted.textContent = salidos;
        this.refs.footerDeparted.textContent = salidos;
        
        // Actualizar tiempo total
        const tiempoTotalFormateado = this.formatearTiempo(this.state.tiempoTotal, true);
        this.refs.cronoTotalTime.textContent = tiempoTotalFormateado;
        this.refs.footerTotalTime.textContent = tiempoTotalFormateado;
    }
    
    actualizarInfoProximoCorredor(corredor) {
        if (!corredor) return;
        
        const info = this.refs.nextCorredorInfo;
        info.innerHTML = `
            <div class="next-dorsal">Dorsal: ${corredor.dorsal}</div>
            <div class="next-name">Nombre: ${corredor.nombre} ${corredor.apellido}</div>
            <div class="next-time">Hora Salida: ${corredor.horaSalida || '--:--'}</div>
            <div class="next-planned">Tiempo: ${this.formatearTiempo(corredor.tiempoSalida)}</div>
        `;
    }
    
    actualizarEfectosCrono() {
        const display = this.refs.countdownDisplay;
        const screen = document.getElementById('countdown-screen');
        
        // Remover clases anteriores
        screen.classList.remove('countdown-normal', 'countdown-warning', 'countdown-critical', 'countdown-salida');
        
        if (this.state.tiempoRestante > 10) {
            // Normal
            screen.classList.add('countdown-normal');
        } else if (this.state.tiempoRestante > 5) {
            // Advertencia (10-6 segundos)
            screen.classList.add('countdown-warning');
            
            // Sonido a 10 segundos
            if (this.state.tiempoRestante === 10) {
                this.reproducirSonido('warning');
            }
        } else if (this.state.tiempoRestante > 0) {
            // Crítico (5-1 segundos)
            screen.classList.add('countdown-critical');
            
            // Sonido cada segundo
            this.reproducirSonido('countdown');
        } else if (this.state.tiempoRestante === 0) {
            // Salida (0 segundos)
            screen.classList.add('countdown-salida');
            this.reproducirSonido('salida');
        }
    }
    
    actualizarTiempoRestante() {
        if (this.state.indiceActual >= this.state.corredores.length) {
            this.state.tiempoRestante = 0;
            return;
        }
        
        const corredor = this.state.corredores[this.state.indiceActual];
        
        // Calcular tiempo restante para este corredor
        if (this.state.tiempoInicio) {
            const tiempoTranscurrido = Math.floor((Date.now() - this.state.tiempoInicio) / 1000);
            this.state.tiempoRestante = Math.max(0, corredor.tiempoSalida - tiempoTranscurrido);
        } else {
            this.state.tiempoRestante = corredor.tiempoSalida;
        }
    }
    
    obtenerSiguienteCorredor() {
        // Buscar siguiente corredor pendiente
        for (let i = this.state.indiceActual + 1; i < this.state.corredores.length; i++) {
            if (this.state.corredores[i].estado === 'pendiente') {
                return this.state.corredores[i];
            }
        }
        return null;
    }
    
    registrarSalida() {
        if (this.state.indiceActual >= this.state.corredores.length) {
            this.detenerCrono();
            return;
        }
        
        const corredor = this.state.corredores[this.state.indiceActual];
        
        // Registrar salida real
        const ahora = Date.now();
        const tiempoReal = Math.floor((ahora - this.state.tiempoInicio) / 1000);
        const diferencia = tiempoReal - corredor.tiempoSalida;
        
        corredor.salidaReal = ahora;
        corredor.tiempoReal = tiempoReal;
        corredor.diferencia = diferencia;
        corredor.estado = 'salido';
        
        // Agregar a resultados
        this.state.resultados.push({
            ...corredor,
            registro: Date.now()
        });
        
        // Sonido de confirmación
        this.reproducirSonido('confirm');
        
        // Avanzar al siguiente corredor
        this.state.indiceActual++;
        
        // Actualizar tiempo restante para el siguiente
        this.actualizarTiempoRestante();
        
        // Si no hay más corredores, detener
        if (this.state.indiceActual >= this.state.corredores.length) {
            setTimeout(() => {
                this.detenerCrono();
                this.mostrarNotificacion('¡Todas las salidas completadas!', 'success');
            }, 2000);
        }
        
        // Guardar datos
        this.guardarDatos();
        
        // Actualizar interfaz
        this.actualizarListaCorredores();
        this.actualizarEstadisticas();
    }
    
    // ============================================
    // RESULTADOS Y EXPORTACIÓN
    // ============================================
    exportarResultados() {
        if (this.state.resultados.length === 0) {
            this.mostrarNotificacion('No hay resultados para exportar', 'warning');
            return;
        }
        
        try {
            // Preparar datos
            const datos = [
                ['Crono CRI - Resultados de Contrarreloj'],
                ['Fecha de exportación:', new Date().toLocaleDateString()],
                ['Hora de exportación:', new Date().toLocaleTimeString()],
                ['Total corredores:', this.state.corredores.length],
                ['Corredores salidos:', this.state.resultados.length],
                [''],
                ['Pos.', 'Dorsal', 'Nombre', 'Apellido', 'Tiempo Previsto', 'Hora Prevista', 
                 'Hora Real', 'Tiempo Real', 'Diferencia', 'Estado']
            ];
            
            // Ordenar resultados por tiempo real
            const resultadosOrdenados = [...this.state.resultados].sort((a, b) => {
                if (a.tiempoReal && b.tiempoReal) {
                    return a.tiempoReal - b.tiempoReal;
                }
                return 0;
            });
            
            // Agregar resultados
            resultadosOrdenados.forEach((resultado, index) => {
                const horaReal = resultado.salidaReal ? 
                    new Date(resultado.salidaReal).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                    '--:--';
                
                const tiempoReal = resultado.tiempoReal ? 
                    this.formatearTiempo(resultado.tiempoReal, true) : '--:--:--';
                
                const diferencia = resultado.diferencia ? 
                    (resultado.diferencia > 0 ? '+' : '') + this.formatearTiempo(Math.abs(resultado.diferencia)) : 
                    '--:--';
                
                datos.push([
                    index + 1,
                    resultado.dorsal,
                    resultado.nombre,
                    resultado.apellido,
                    this.formatearTiempo(resultado.tiempoSalida),
                    resultado.horaSalida || '--:--',
                    horaReal,
                    tiempoReal,
                    diferencia,
                    resultado.estado === 'salido' ? 'Salido' : 'No salido'
                ]);
            });
            
            // Agregar corredores no salidos
            const noSalidos = this.state.corredores.filter(c => c.estado !== 'salido');
            if (noSalidos.length > 0) {
                datos.push(['']);
                datos.push(['CORREDORES NO SALIDOS']);
                datos.push(['Dorsal', 'Nombre', 'Apellido', 'Tiempo Previsto', 'Hora Prevista', 'Estado']);
                
                noSalidos.forEach(corredor => {
                    datos.push([
                        corredor.dorsal,
                        corredor.nombre,
                        corredor.apellido,
                        this.formatearTiempo(corredor.tiempoSalida),
                        corredor.horaSalida || '--:--',
                        'No salió'
                    ]);
                });
            }
            
            // Crear hoja de cálculo
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(datos);
            
            // Aplicar estilos
            const columnWidths = [
                { wch: 6 },   // Pos.
                { wch: 8 },   // Dorsal
                { wch: 15 },  // Nombre
                { wch: 15 },  // Apellido
                { wch: 12 },  // Tiempo Previsto
                { wch: 12 },  // Hora Prevista
                { wch: 12 },  // Hora Real
                { wch: 12 },  // Tiempo Real
                { wch: 10 },  // Diferencia
                { wch: 10 }   // Estado
            ];
            worksheet['!cols'] = columnWidths;
            
            // Formato para encabezados
            const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
            for (let row = 0; row <= 6; row++) {
                for (let col = 0; col <= 9; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    if (worksheet[cellAddress]) {
                        worksheet[cellAddress].s = {
                            font: { bold: true }
                        };
                    }
                }
            }
            
            XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
            
            // Generar nombre de archivo
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `resultados-cri_${fecha}.xlsx`;
            
            // Descargar
            XLSX.writeFile(workbook, nombreArchivo);
            
            this.mostrarNotificacion('Resultados exportados correctamente', 'success');
            
        } catch (error) {
            console.error('Error exportando resultados:', error);
            this.mostrarNotificacion('Error al exportar resultados', 'error');
        }
    }
    
    // ============================================
    // AUDIO
    // ============================================
    inicializarAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0.5;
            
            console.log('Audio inicializado correctamente');
        } catch (error) {
            console.warn('No se pudo inicializar audio:', error);
            this.state.audioActivo = false;
        }
    }
    
    reproducirSonido(tipo) {
        if (!this.state.audioActivo || this.state.tipoAudio === 'none' || !this.audioContext) {
            return;
        }
        
        try {
            switch(tipo) {
                case 'start':
                    this.generarBeep(440, 0.5);
                    break;
                case 'warning':
                    this.generarBeep(880, 1);
                    break;
                case 'countdown':
                    this.generarBeep(660, 0.3);
                    break;
                case 'salida':
                    this.generarBeep(220, 2);
                    break;
                case 'confirm':
                    this.generarBeep(550, 0.2);
                    break;
            }
        } catch (error) {
            console.warn('Error reproduciendo sonido:', error);
        }
    }
    
    generarBeep(frecuencia, duracion) {
        if (!this.audioContext) return;
        
        const oscilador = this.audioContext.createOscillator();
        const ganancia = this.audioContext.createGain();
        
        oscilador.connect(ganancia);
        ganancia.connect(this.gainNode);
        
        oscilador.frequency.value = frecuencia;
        oscilador.type = 'sine';
        
        ganancia.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        ganancia.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duracion);
        
        oscilador.start(this.audioContext.currentTime);
        oscilador.stop(this.audioContext.currentTime + duracion);
    }
    
    probarAudio() {
        if (this.state.tipoAudio === 'none') {
            this.mostrarNotificacion('El audio está desactivado', 'info');
            return;
        }
        
        // Reproducir secuencia de prueba
        this.reproducirSonido('start');
        
        setTimeout(() => this.reproducirSonido('warning'), 600);
        setTimeout(() => this.reproducirSonido('countdown'), 1200);
        setTimeout(() => this.reproducirSonido('salida'), 1800);
        
        this.mostrarNotificacion('Probando sonidos...', 'info');
    }
    
    aplicarConfigAudio() {
        // Actualizar botones de audio
        this.refs.audioOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.audio === this.state.tipoAudio) {
                option.classList.add('active');
            }
        });
    }
    
    // ============================================
    // INTERFAZ Y UTILIDADES
    // ============================================
    actualizarInterfaz() {
        // Actualizar lista de corredores
        this.actualizarListaCorredores();
        
        // Actualizar estadísticas
        this.actualizarEstadisticas();
        
        // Actualizar sección de resultados
        this.actualizarResultados();
        
        // Actualizar configuración
        this.actualizarConfiguracion();
    }
    
    actualizarInterfazCrono() {
        // Mostrar información inicial
        if (this.state.indiceActual < this.state.corredores.length) {
            const corredor = this.state.corredores[this.state.indiceActual];
            
            this.refs.currentDorsal.textContent = corredor.dorsal;
            this.refs.currentName.textContent = `${corredor.nombre} ${corredor.apellido}`;
            
            this.actualizarInfoProximoCorredor(corredor);
        }
        
        // Actualizar display inicial
        this.actualizarDisplayCrono();
    }
    
    actualizarResultados() {
        const lista = document.getElementById('results-list');
        const fastestList = document.getElementById('fastest-list');
        const deviationsList = document.getElementById('deviations-list');
        
        if (this.state.resultados.length === 0) {
            // Mostrar estado vacío
            if (lista) {
                lista.innerHTML = `
                    <tr class="empty-state">
                        <td colspan="9">
                            <i class="fas fa-chart-line"></i>
                            <p>No hay resultados registrados</p>
                        </td>
                    </tr>
                `;
            }
            
            if (fastestList) {
                fastestList.innerHTML = '<div class="empty-ranking">No hay datos</div>';
            }
            
            if (deviationsList) {
                deviationsList.innerHTML = '<div class="empty-ranking">No hay datos</div>';
            }
            
            // Actualizar resumen
            document.getElementById('summary-total').textContent = this.state.corredores.length;
            document.getElementById('summary-departed').textContent = this.state.resultados.length;
            document.getElementById('summary-avg-time').textContent = '--:--';
            document.getElementById('summary-avg-diff').textContent = '--:--';
            
            return;
        }
        
        // Ordenar resultados por tiempo real
        const resultadosOrdenados = [...this.state.resultados].sort((a, b) => {
            if (a.tiempoReal && b.tiempoReal) {
                return a.tiempoReal - b.tiempoReal;
            }
            return 0;
        });
        
        // Actualizar tabla de resultados
        if (lista) {
            lista.innerHTML = '';
            
            resultadosOrdenados.forEach((resultado, index) => {
                const horaReal = resultado.salidaReal ? 
                    new Date(resultado.salidaReal).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                    '--:--';
                
                const tiempoReal = resultado.tiempoReal ? 
                    this.formatearTiempo(resultado.tiempoReal, true) : '--:--:--';
                
                const diferencia = resultado.diferencia;
                let diffClass = '';
                let diffText = '--:--';
                
                if (diferencia !== null && diferencia !== undefined) {
                    diffText = (diferencia > 0 ? '+' : '') + this.formatearTiempo(Math.abs(diferencia));
                    diffClass = diferencia > 0 ? 'positive-diff' : 'negative-diff';
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><strong>${resultado.dorsal}</strong></td>
                    <td>${resultado.nombre}</td>
                    <td>${resultado.apellido}</td>
                    <td>${this.formatearTiempo(resultado.tiempoSalida)}</td>
                    <td>${resultado.horaSalida || '--:--'}</td>
                    <td>${horaReal}</td>
                    <td>${tiempoReal}</td>
                    <td class="${diffClass}">${diffText}</td>
                    <td><span class="status-badge status-salido">Salido</span></td>
                `;
                
                lista.appendChild(row);
            });
        }
        
        // Actualizar más rápidos
        if (fastestList) {
            fastestList.innerHTML = '';
            
            const top5 = resultadosOrdenados.slice(0, 5);
            top5.forEach((resultado, index) => {
                const item = document.createElement('div');
                item.className = 'ranking-item';
                item.innerHTML = `
                    <div class="ranking-position">${index + 1}</div>
                    <div class="ranking-dorsal">${resultado.dorsal}</div>
                    <div class="ranking-name">${resultado.nombre} ${resultado.apellido}</div>
                    <div class="ranking-time">${this.formatearTiempo(resultado.tiempoReal)}</div>
                `;
                fastestList.appendChild(item);
            });
        }
        
        // Actualizar mayores desviaciones
        if (deviationsList) {
            deviationsList.innerHTML = '';
            
            const conDiferencia = resultadosOrdenados.filter(r => r.diferencia !== null);
            const ordenadosPorDiferencia = [...conDiferencia].sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia));
            const top5Deviations = ordenadosPorDiferencia.slice(0, 5);
            
            top5Deviations.forEach((resultado, index) => {
                const item = document.createElement('div');
                item.className = 'ranking-item';
                item.innerHTML = `
                    <div class="ranking-position">${index + 1}</div>
                    <div class="ranking-dorsal">${resultado.dorsal}</div>
                    <div class="ranking-name">${resultado.nombre} ${resultado.apellido}</div>
                    <div class="ranking-time ${resultado.diferencia > 0 ? 'positive-diff' : 'negative-diff'}">
                        ${resultado.diferencia > 0 ? '+' : ''}${this.formatearTiempo(Math.abs(resultado.diferencia))}
                    </div>
                `;
                deviationsList.appendChild(item);
            });
        }
        
        // Actualizar resumen
        document.getElementById('summary-total').textContent = this.state.corredores.length;
        document.getElementById('summary-departed').textContent = this.state.resultados.length;
        
        // Calcular promedio
        if (resultadosOrdenados.length > 0) {
            const tiemposReales = resultadosOrdenados.map(r => r.tiempoReal).filter(t => t);
            const diferencias = resultadosOrdenados.map(r => r.diferencia).filter(d => d !== null);
            
            if (tiemposReales.length > 0) {
                const promedio = tiemposReales.reduce((a, b) => a + b, 0) / tiemposReales.length;
                document.getElementById('summary-avg-time').textContent = this.formatearTiempo(Math.round(promedio), true);
            }
            
            if (diferencias.length > 0) {
                const avgDiff = diferencias.reduce((a, b) => a + b, 0) / diferencias.length;
                document.getElementById('summary-avg-diff').textContent = 
                    (avgDiff > 0 ? '+' : '') + this.formatearTiempo(Math.abs(Math.round(avgDiff)));
            }
        }
    }
    
    actualizarConfiguracion() {
        // Actualizar versión
        document.getElementById('app-version').textContent = '1.0.0';
        document.getElementById('last-update').textContent = new Date().toLocaleDateString();
        
        // Actualizar tema oscuro
        const darkModeToggle = document.getElementById('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.checked = this.state.temaOscuro;
        }
    }
    
    modoPantallaCompleta(activar) {
        if (activar) {
            document.body.classList.add('crono-active');
        } else {
            document.body.classList.remove('crono-active');
        }
    }
    
    formatearTiempo(segundos, incluirHoras = false) {
        if (segundos === null || segundos === undefined) return '--:--';
        
        if (incluirHoras) {
            const horas = Math.floor(segundos / 3600);
            const minutos = Math.floor((segundos % 3600) / 60);
            const segs = segundos % 60;
            
            return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
        } else {
            const minutos = Math.floor(segundos / 60);
            const segs = segundos % 60;
            
            return `${minutos}:${segs.toString().padStart(2, '0')}`;
        }
    }
    
    // ============================================
    // PWA
    // ============================================
    configurarPWA() {
        // Detectar si la app está instalada
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('Aplicación ejecutándose en modo standalone');
        }
        
        // Detectar evento de instalación
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.state.deferredPrompt = e;
            
            // Mostrar botón de instalación
            const installBtn = document.getElementById('btn-install');
            if (installBtn) {
                installBtn.style.display = 'flex';
                installBtn.addEventListener('click', () => this.instalarApp());
            }
        });
        
        // Detectar si la app fue instalada
        window.addEventListener('appinstalled', () => {
            console.log('App instalada');
            this.state.deferredPrompt = null;
            
            // Ocultar botón de instalación
            const installBtn = document.getElementById('btn-install');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        });
        
        // Registrar Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('Error registrando Service Worker:', error);
                });
        }
    }
    
    instalarApp() {
        if (this.state.deferredPrompt) {
            this.state.deferredPrompt.prompt();
            
            this.state.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuario aceptó instalar la app');
                }
                this.state.deferredPrompt = null;
            });
        }
    }
    
    // ============================================
    // EVENTOS
    // ============================================
    configurarEventos() {
        // Navegación
        Object.keys(this.refs.navBtns).forEach(key => {
            this.refs.navBtns[key].addEventListener('click', () => {
                this.cambiarSeccion(key);
            });
        });
        
        // Búsqueda y filtros
        this.refs.searchCorredor.addEventListener('input', () => {
            this.actualizarListaCorredores();
        });
        
        this.refs.filterOrden.addEventListener('change', () => {
            this.actualizarListaCorredores();
        });
        
        // Botón limpiar filtros
        document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
            this.refs.searchCorredor.value = '';
            this.refs.filterOrden.value = 'tiempo';
            this.actualizarListaCorredores();
        });
        
        // Importar Excel
        this.refs.btnImportarExcel.addEventListener('click', () => this.abrirModalImportar());
        this.refs.btnCrearPlantilla.addEventListener('click', () => this.crearPlantillaVacia());
        this.refs.btnNuevoCorredor.addEventListener('click', () => this.abrirModalNuevoCorredor());
        
        // Gestión de archivos
        const fileInput = document.getElementById('file-input');
        const dropArea = document.getElementById('drop-area');
        const btnSelectFile = document.getElementById('btn-select-file');
        
        btnSelectFile.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.state.archivoExcel = file;
                document.getElementById('file-info').textContent = `Archivo: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
                document.getElementById('btn-confirm-import').disabled = false;
            }
        });
        
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = 'var(--secondary-color)';
            dropArea.style.background = 'rgba(52, 152, 219, 0.1)';
        });
        
        dropArea.addEventListener('dragleave', () => {
            dropArea.style.borderColor = '#e0e0e0';
            dropArea.style.background = '';
        });
        
        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = '#e0e0e0';
            dropArea.style.background = '';
            
            const file = e.dataTransfer.files[0];
            if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                this.state.archivoExcel = file;
                document.getElementById('file-info').textContent = `Archivo: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
                document.getElementById('btn-confirm-import').disabled = false;
            } else {
                this.mostrarNotificacion('Por favor, sube un archivo Excel (.xlsx o .xls)', 'error');
            }
        });
        
        // Confirmar importación
        document.getElementById('btn-confirm-import').addEventListener('click', () => {
            if (this.state.archivoExcel) {
                this.importarExcel(this.state.archivoExcel);
                this.cerrarModales();
            }
        });
        
        // Cancelar importación
        document.querySelectorAll('.cancel-import').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModales());
        });
        
        // Formulario corredor
        this.refs.formCorredor.addEventListener('submit', (e) => this.guardarCorredor(e));
        
        // Cancelar formulario corredor
        document.querySelectorAll('.cancel-corredor').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModales());
        });
        
        // Opciones de audio
        this.refs.audioOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.state.tipoAudio = option.dataset.audio;
                this.aplicarConfigAudio();
                this.guardarDatos();
            });
        });
        
        // Probar audio
        this.refs.testAudio.addEventListener('click', () => this.probarAudio());
        
        // Tema oscuro
        document.getElementById('dark-mode')?.addEventListener('change', (e) => {
            this.state.temaOscuro = e.target.checked;
            
            if (this.state.temaOscuro) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            
            this.guardarDatos();
        });
        
        // Opciones de color
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                // Quitar activo de todos
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                // Activar este
                option.classList.add('active');
                
                // Cambiar color de tema (implementación básica)
                const color = option.dataset.color;
                // Aquí podrías cambiar variables CSS según el color
            });
        });
        
        // Gestión de datos
        document.getElementById('btn-backup')?.addEventListener('click', () => {
            this.backupDatos();
        });
        
        document.getElementById('btn-restore')?.addEventListener('click', () => {
            this.restaurarDatos();
        });
        
        document.getElementById('btn-clear-data')?.addEventListener('click', () => {
            this.limpiarDatos();
        });
        
        // Crono
        this.refs.btnStartCrono.addEventListener('click', () => this.iniciarCrono());
        
        this.refs.btnPauseCrono.addEventListener('click', () => {
            if (this.state.cronoPausado) {
                this.continuarCrono();
            } else {
                this.pausarCrono();
            }
        });
        
        this.refs.btnStopCrono.addEventListener('click', () => this.detenerCrono());
        
        // Opciones de inicio
        this.refs.startOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Quitar activo de todos
                this.refs.startOptions.forEach(o => o.classList.remove('active'));
                // Activar este
                option.classList.add('active');
                
                // Mostrar/ocultar entrada personalizada
                if (option.dataset.start === 'custom') {
                    this.refs.customStartInput.style.display = 'flex';
                } else {
                    this.refs.customStartInput.style.display = 'none';
                }
            });
        });
        
        // Establecer dorsal personalizado
        this.refs.btnSetCustom.addEventListener('click', () => {
            const dorsal = this.refs.customDorsal.value.trim();
            if (!dorsal) {
                this.mostrarNotificacion('Ingresa un número de dorsal', 'error');
                return;
            }
            
            const corredor = this.buscarCorredorPorDorsal(dorsal);
            if (!corredor) {
                this.mostrarNotificacion(`No se encontró el dorsal ${dorsal}`, 'error');
                return;
            }
            
            this.mostrarNotificacion(`Dorsal ${dorsal} establecido`, 'success');
        });
        
        // Configuración durante crono
        document.getElementById('config-toggle')?.addEventListener('click', () => {
            this.abrirModalAyuda();
        });
        
        // Exportación de resultados
        this.refs.btnExportResultados?.addEventListener('click', () => this.exportarResultados());
        
        this.refs.btnClearResultados?.addEventListener('click', () => {
            this.abrirModalConfirmacion('¿Estás seguro de que quieres limpiar todos los resultados?', () => {
                this.state.resultados = [];
                this.guardarDatos();
                this.actualizarResultados();
                this.mostrarNotificacion('Resultados limpiados', 'success');
            });
        });
        
        // Ayuda
        document.getElementById('help-btn')?.addEventListener('click', () => this.abrirModalAyuda());
        document.getElementById('btn-feedback')?.addEventListener('click', () => {
            this.mostrarNotificacion('Función de feedback en desarrollo', 'info');
        });
        
        // Cerrar modales con botón X
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModales());
        });
        
        // Cerrar modal ayuda
        document.querySelector('.close-help')?.addEventListener('click', () => this.cerrarModales());
        
        // Cerrar modales al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModales();
                }
            });
        });
        
        // Idioma
        document.getElementById('language-toggle')?.addEventListener('click', () => {
            this.mostrarNotificacion('Cambio de idioma en desarrollo', 'info');
        });
        
        // Teclas de acceso rápido
        document.addEventListener('keydown', (e) => {
            // Espacio: Pausar/Continuar crono
            if (e.code === 'Space' && this.state.cronoActivo) {
                e.preventDefault();
                if (this.state.cronoPausado) {
                    this.continuarCrono();
                } else {
                    this.pausarCrono();
                }
            }
            
            // Escape: Salir de pantalla completa
            if (e.code === 'Escape' && document.body.classList.contains('crono-active')) {
                this.detenerCrono();
            }
            
            // F1: Ayuda
            if (e.code === 'F1') {
                e.preventDefault();
                this.abrirModalAyuda();
            }
        });
        
        // Actualizar al cambiar tamaño de ventana
        window.addEventListener('resize', () => {
            this.actualizarTamañoDisplay();
        });
    }
    
    cambiarSeccion(seccion) {
        // Quitar activo de todas las secciones y botones
        Object.values(this.refs.sections).forEach(section => {
            section.classList.remove('active');
        });
        
        Object.values(this.refs.navBtns).forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activar sección y botón seleccionados
        this.refs.sections[seccion].classList.add('active');
        this.refs.navBtns[seccion].classList.add('active');
    }
    
    // ============================================
    // UTILIDADES DE INTERFAZ
    // ============================================
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getIconoNotificacion(tipo)}"></i>
            <span>${mensaje}</span>
        `;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    getIconoNotificacion(tipo) {
        switch(tipo) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
    
    mostrarLoader(mensaje) {
        // Crear overlay de loader
        const overlay = document.createElement('div');
        overlay.className = 'loader-overlay';
        overlay.innerHTML = `
            <div class="loader-content">
                <div class="loader"></div>
                <p>${mensaje}</p>
            </div>
        `;
        
        overlay.id = 'loader-overlay';
        document.body.appendChild(overlay);
    }
    
    ocultarLoader() {
        const overlay = document.getElementById('loader-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    actualizarTamañoDisplay() {
        // Ajustar tamaño del display según el tamaño de la pantalla
        const display = this.refs.countdownDisplay;
        if (!display) return;
        
        const container = display.parentElement;
        const containerWidth = container.offsetWidth;
        
        // Tamaño base para el display
        let fontSize = Math.min(containerWidth * 0.3, 200); // 30% del ancho, máximo 200px
        
        // Ajustar para móviles
        if (window.innerWidth < 768) {
            fontSize = Math.min(containerWidth * 0.4, 150);
        }
        
        display.style.fontSize = `${fontSize}px`;
        
        // Ajustar tamaño de la información del corredor (1/5 del tamaño del crono)
        const infoCorredor = document.getElementById('current-corredor-info');
        if (infoCorredor) {
            const infoFontSize = fontSize / 5;
            infoCorredor.style.fontSize = `${infoFontSize}px`;
        }
    }
    
    // ============================================
    // BACKUP Y RESTAURACIÓN
    // ============================================
    backupDatos() {
        const datos = {
            corredores: this.state.corredores,
            resultados: this.state.resultados,
            config: {
                audioActivo: this.state.audioActivo,
                tipoAudio: this.state.tipoAudio,
                temaOscuro: this.state.temaOscuro
            },
            fecha: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-crono-cri_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion('Backup creado correctamente', 'success');
    }
    
    restaurarDatos() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const datos = JSON.parse(e.target.result);
                    
                    // Validar datos
                    if (!datos.corredores || !Array.isArray(datos.corredores)) {
                        throw new Error('Archivo de backup inválido');
                    }
                    
                    // Restaurar datos
                    this.state.corredores = datos.corredores;
                    this.state.resultados = datos.resultados || [];
                    
                    if (datos.config) {
                        this.state.audioActivo = datos.config.audioActivo !== undefined ? datos.config.audioActivo : true;
                        this.state.tipoAudio = datos.config.tipoAudio || 'beep';
                        this.state.temaOscuro = datos.config.temaOscuro || false;
                        
                        // Aplicar configuración
                        if (this.state.temaOscuro) {
                            document.body.classList.add('dark-mode');
                        } else {
                            document.body.classList.remove('dark-mode');
                        }
                        
                        this.aplicarConfigAudio();
                    }
                    
                    // Guardar y actualizar
                    this.guardarDatos();
                    this.actualizarInterfaz();
                    
                    this.mostrarNotificacion('Datos restaurados correctamente', 'success');
                    
                } catch (error) {
                    console.error('Error restaurando backup:', error);
                    this.mostrarNotificacion('Error al restaurar backup: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new CronoCRI();
    app.init();
});

// Hacer disponible globalmente para debugging
window.CronoCRI = app;