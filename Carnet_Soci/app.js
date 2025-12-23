// Configuración global
const CONFIG = {
    fotoPath: 'data/fotos/',      // Ruta a la carpeta de fotos existente
    logoPath: 'logo.jpg',
    emisor: {
        nombre: 'Club Deportivo Ejemplo',
        direccion: 'Calle Principal 123, 28001 Madrid',
        telefono: '912 345 678',
        email: 'info@clubdeportivo.es',
        maps: 'https://maps.google.com/?q=Club+Deportivo+Madrid'
    }
};

class CarnetApp {
    constructor() {
        this.socios = [];
        this.socioActual = null;
        this.init();
    }

    init() {
        this.setupPWA();
        this.bindEvents();
        this.cargarEstado();
    }

    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('PWA: Offline habilitado'))
                .catch(err => console.warn('PWA:', err));
        }
    }

    bindEvents() {
        // Cargar Excel
        document.getElementById('btnCargarExcel').onclick = () => {
            document.getElementById('excelInput').click();
        };
        
        document.getElementById('excelInput').onchange = (e) => {
            this.cargarExcel(e.target.files[0]);
        };

        // Buscar socio
        document.getElementById('searchBox').oninput = (e) => {
            this.filtrarSocios(e.target.value);
        };

        // Generar carnet
        document.getElementById('btnGenerarCarnet').onclick = () => {
            this.generarCarnet();
        };

        // Volver a lista
        document.getElementById('btnVolverLista').onclick = () => {
            this.mostrarPaso(2);
        };
    }

    async cargarExcel(archivo) {
        if (!archivo) return;
        
        this.mostrarEstado('Leyendo archivo Excel...');
        
        try {
            const datos = await this.leerArchivoExcel(archivo);
            this.socios = this.procesarDatosSocios(datos);
            
            // Guardar en localStorage
            localStorage.setItem('socios_cache', JSON.stringify(this.socios));
            localStorage.setItem('excel_nombre', archivo.name);
            localStorage.setItem('excel_fecha', new Date().toISOString());
            
            this.mostrarEstado(`${this.socios.length} socios cargados`);
            this.mostrarListaSocios();
            this.mostrarPaso(2);
            
        } catch (error) {
            this.mostrarError('Error al cargar Excel: ' + error.message);
        }
    }

    leerArchivoExcel(archivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (err) {
                    reject(err);
                }
            };
            
            reader.onerror = reject;
            reader.readAsArrayBuffer(archivo);
        });
    }

    procesarDatosSocios(datos) {
        return datos.map(fila => {
            // Obtener vigencia (online/offline)
            const vigente = this.verificarVigencia(fila);
            
            // Formatear datos
            return {
                // Información principal
                apellidos: (fila.Apellidos || '').trim(),
                nombre: (fila.Nombre || '').trim(),
                foto: `${CONFIG.fotoPath}${fila.Foto || 'default.jpg'}`,
                numeroSocio: fila.NumeroSocio || '000',
                vigente: vigente,
                anio: fila.Anio || new Date().getFullYear(),
                
                // Detalles
                dni: fila.DNI || '',
                direccion: fila.Direccion || '',
                cp: fila.CP || '',
                poblacion: fila.Poblacion || '',
                fechaNacimiento: this.formatearFecha(fila.FechaNacimiento),
                email: fila.Email || '',
                telefono: fila.Telefono || '',
                numeroRegistro: fila.NumeroRegistro || '',
                
                // Para búsqueda
                busqueda: `${fila.Nombre} ${fila.Apellidos} ${fila.NumeroSocio}`.toLowerCase()
            };
        }).sort((a, b) => a.apellidos.localeCompare(b.apellidos));
    }

    async verificarVigencia(socio) {
        const checkOnline = document.getElementById('checkOnline').checked;
        
        if (!checkOnline) return 'Por confirmar';
        
        try {
            // Intentar verificar online
            if (navigator.onLine) {
                // Aquí iría tu lógica de verificación online
                // Por ahora simulamos
                return socio.Vigente === 'Sí' ? 'Sí' : 'No';
            } else {
                return 'Por confirmar (offline)';
            }
        } catch {
            return 'Por confirmar';
        }
    }

    mostrarListaSocios() {
        const contenedor = document.getElementById('sociosList');
        contenedor.innerHTML = '';
        
        this.socios.forEach((socio, index) => {
            const item = document.createElement('div');
            item.className = 'socio-item';
            item.innerHTML = `
                <div class="socio-avatar">
                    <img src="${socio.foto}" alt="${socio.nombre}" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"45\" fill=\"%23ccc\"/></svg>'">
                </div>
                <div class="socio-info">
                    <strong>${socio.apellidos}, ${socio.nombre}</strong>
                    <div class="socio-details">
                        <span class="numero">#${socio.numeroSocio}</span>
                        <span class="vigencia ${socio.vigente === 'Sí' ? 'activo' : 'inactivo'}">
                            ${socio.vigente}
                        </span>
                    </div>
                </div>
                <button class="btn-seleccionar" data-index="${index}">
                    Seleccionar →
                </button>
            `;
            
            item.querySelector('.btn-seleccionar').onclick = () => {
                this.seleccionarSocio(index);
            };
            
            contenedor.appendChild(item);
        });
    }

    filtrarSocios(termino) {
        const items = document.querySelectorAll('.socio-item');
        const busqueda = termino.toLowerCase().trim();
        
        items.forEach(item => {
            const texto = item.textContent.toLowerCase();
            item.style.display = busqueda === '' || texto.includes(busqueda) 
                ? 'flex' 
                : 'none';
        });
    }

    seleccionarSocio(index) {
        this.socioActual = this.socios[index];
        this.mostrarPreview();
        this.mostrarPaso(3);
    }

    mostrarPreview() {
        if (!this.socioActual) return;
        
        const s = this.socioActual;
        
        // Foto
        const imgFoto = document.getElementById('previewFoto');
        imgFoto.src = s.foto;
        imgFoto.onerror = () => {
            imgFoto.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23ccc"/></svg>';
        };
        
        // Datos principales
        document.getElementById('previewNombreCompleto').textContent = 
            `${s.nombre} ${s.apellidos}`;
        document.getElementById('previewNumero').textContent = `#${s.numeroSocio}`;
        document.getElementById('previewVigente').textContent = s.vigente;
        document.getElementById('previewAnio').textContent = s.anio;
        
        // Detalles
        document.getElementById('previewDNI').textContent = s.dni;
        document.getElementById('previewTelefono').textContent = s.telefono;
        document.getElementById('previewEmail').textContent = s.email;
        document.getElementById('previewDireccion').textContent = s.direccion;
        document.getElementById('previewCP').textContent = s.cp;
        document.getElementById('previewPoblacion').textContent = s.poblacion;
        document.getElementById('previewNacimiento').textContent = s.fechaNacimiento;
        document.getElementById('previewRegistro').textContent = s.numeroRegistro;
        
        // Estilo de vigencia
        const badge = document.getElementById('previewVigente');
        badge.className = 'badge ' + (s.vigente === 'Sí' ? 'activo' : 
                                      s.vigente === 'No' ? 'inactivo' : 'pendiente');
    }

    mostrarPaso(numero) {
        [1, 2, 3].forEach(paso => {
            document.getElementById(`step${paso}`).style.display = 
                paso === numero ? 'block' : 'none';
        });
    }

    async generarCarnet() {
        if (!this.socioActual) return;
        
        this.mostrarEstado('Generando carnet PKPASS...');
        
        try {
            // Preparar datos para el generador
            const datosCarnet = {
                socio: this.socioActual,
                emisor: CONFIG.emisor,
                logo: CONFIG.logoPath,
                timestamp: new Date().toISOString()
            };
            
            // Para producción: enviar a servidor/script Node.js
            // Por ahora simulamos
            const nombreArchivo = `${this.socioActual.apellidos},${this.socioActual.nombre}.pkpass`;
            
            this.mostrarEstado(`Carnet listo: ${nombreArchivo}`);
            
            // Mostrar instrucciones para descargar
            alert(`Para generar el PKPASS real necesitas:
1. Ejecutar: node generador.js "${nombreArchivo}"
2. El archivo se guardará en: carnets/${nombreArchivo}
3. Compartir el .pkpass con el socio`);
            
        } catch (error) {
            this.mostrarError('Error al generar: ' + error.message);
        }
    }

    cargarEstado() {
        try {
            const cache = localStorage.getItem('socios_cache');
            if (cache) {
                this.socios = JSON.parse(cache);
                const nombre = localStorage.getItem('excel_nombre');
                if (nombre && this.socios.length > 0) {
                    document.getElementById('fileInfo').textContent = 
                        `Último archivo: ${nombre}`;
                    this.mostrarPaso(1);
                }
            }
        } catch (e) {
            console.warn('No se pudo cargar cache:', e);
        }
    }

    formatearFecha(fecha) {
        if (!fecha) return '-';
        try {
            const d = new Date(fecha);
            return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-ES');
        } catch {
            return fecha;
        }
    }

    mostrarEstado(mensaje, tipo = 'info') {
        const status = document.getElementById('appStatus');
        status.textContent = mensaje;
        status.className = `status ${tipo}`;
    }

    mostrarError(mensaje) {
        this.mostrarEstado('❌ ' + mensaje, 'error');
    }
}

// Iniciar app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CarnetApp();
});