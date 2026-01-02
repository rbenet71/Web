// Gestión de almacenamiento para Video Gestión
class Almacenamiento {
    constructor() {
        this.prefijo = 'video_gestion_';
        this.sesionesKey = this.prefijo + 'sesiones';
        this.ultimaCarpetaKey = this.prefijo + 'ultima_carpeta';
        this.configuracionKey = this.prefijo + 'configuracion';
    }

    inicializar() {
        // Crear estructura inicial si no existe
        if (!this.obtenerSesiones()) {
            this.guardarSesiones([]);
        }
        
        if (!this.obtenerConfiguracion()) {
            this.guardarConfiguracion({
                idioma: 'es',
                tema: 'claro',
                notificaciones: true
            });
        }
    }

    // SESIONES DE UNIÓN DE VIDEOS
    obtenerSesiones() {
        try {
            const sesiones = localStorage.getItem(this.sesionesKey);
            return sesiones ? JSON.parse(sesiones) : [];
        } catch (error) {
            console.error('Error obteniendo sesiones:', error);
            return [];
        }
    }

    guardarSesiones(sesiones) {
        try {
            localStorage.setItem(this.sesionesKey, JSON.stringify(sesiones));
        } catch (error) {
            console.error('Error guardando sesiones:', error);
        }
    }

    obtenerSesion(id) {
        const sesiones = this.obtenerSesiones();
        return sesiones.find(s => s.id === id);
    }

    guardarSesion(sesion) {
        const sesiones = this.obtenerSesiones();
        const index = sesiones.findIndex(s => s.id === sesion.id);
        
        if (index >= 0) {
            sesiones[index] = sesion;
        } else {
            sesiones.push(sesion);
        }
        
        this.guardarSesiones(sesiones);
    }

    eliminarSesion(id) {
        const sesiones = this.obtenerSesiones();
        const nuevasSesiones = sesiones.filter(s => s.id !== id);
        this.guardarSesiones(nuevasSesiones);
        return nuevasSesiones;
    }

    crearNuevaSesion(nombre) {
        const nuevaSesion = {
            id: Date.now().toString(),
            nombre: nombre,
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString(),
            videos: [],
            archivoSalida: '',
            configuracion: {
                preservarMetadatos: true,
                calidad: 'maxima',
                formato: 'mp4'
            }
        };
        
        this.guardarSesion(nuevaSesion);
        return nuevaSesion;
    }

    // PREFERENCIAS DE USUARIO
    obtenerConfiguracion() {
        try {
            const config = localStorage.getItem(this.configuracionKey);
            return config ? JSON.parse(config) : {};
        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            return {};
        }
    }

    guardarConfiguracion(config) {
        try {
            localStorage.setItem(this.configuracionKey, JSON.stringify(config));
        } catch (error) {
            console.error('Error guardando configuración:', error);
        }
    }

    actualizarConfiguracion(nuevaConfig) {
        const configActual = this.obtenerConfiguracion();
        const configActualizada = { ...configActual, ...nuevaConfig };
        this.guardarConfiguracion(configActualizada);
        return configActualizada;
    }

    // PREFERENCIAS GENERALES
    guardarPreferencia(clave, valor) {
        try {
            localStorage.setItem(this.prefijo + clave, valor);
        } catch (error) {
            console.error('Error guardando preferencia:', error);
        }
    }

    obtenerPreferencia(clave, valorPorDefecto = null) {
        try {
            const valor = localStorage.getItem(this.prefijo + clave);
            return valor !== null ? valor : valorPorDefecto;
        } catch (error) {
            console.error('Error obteniendo preferencia:', error);
            return valorPorDefecto;
        }
    }

    // ARCHIVOS RECIENTES
    agregarArchivoReciente(rutaArchivo, tipo) {
        const recientes = this.obtenerArchivosRecientes();
        const nuevoArchivo = {
            ruta: rutaArchivo,
            tipo: tipo,
            fechaAcceso: new Date().toISOString(),
            nombre: rutaArchivo.split('/').pop()
        };
        
        // Eliminar si ya existe
        const index = recientes.findIndex(a => a.ruta === rutaArchivo);
        if (index >= 0) {
            recientes.splice(index, 1);
        }
        
        // Agregar al principio
        recientes.unshift(nuevoArchivo);
        
        // Mantener solo los últimos 10
        if (recientes.length > 10) {
            recientes.pop();
        }
        
        this.guardarPreferencia('archivos_recientes', JSON.stringify(recientes));
    }

    obtenerArchivosRecientes() {
        try {
            const recientes = this.obtenerPreferencia('archivos_recientes', '[]');
            return JSON.parse(recientes);
        } catch (error) {
            console.error('Error obteniendo archivos recientes:', error);
            return [];
        }
    }

    // CARPETAS RECIENTES
    guardarUltimaCarpeta(ruta) {
        this.guardarPreferencia('ultima_carpeta', ruta);
    }

    obtenerUltimaCarpeta() {
        return this.obtenerPreferencia('ultima_carpeta', '');
    }

    // BACKUP DE DATOS
    crearBackup() {
        const backup = {
            fecha: new Date().toISOString(),
            version: '1.0',
            datos: {
                sesiones: this.obtenerSesiones(),
                configuracion: this.obtenerConfiguracion(),
                preferencias: {
                    ultimaCarpeta: this.obtenerUltimaCarpeta(),
                    archivosRecientes: this.obtenerArchivosRecientes()
                }
            }
        };
        
        return JSON.stringify(backup, null, 2);
    }

    restaurarBackup(backupData) {
        try {
            const backup = JSON.parse(backupData);
            
            if (backup.datos.sesiones) {
                this.guardarSesiones(backup.datos.sesiones);
            }
            
            if (backup.datos.configuracion) {
                this.guardarConfiguracion(backup.datos.configuracion);
            }
            
            if (backup.datos.preferencias) {
                if (backup.datos.preferencias.ultimaCarpeta) {
                    this.guardarUltimaCarpeta(backup.datos.preferencias.ultimaCarpeta);
                }
                
                if (backup.datos.preferencias.archivosRecientes) {
                    this.guardarPreferencia('archivos_recientes', 
                        JSON.stringify(backup.datos.preferencias.archivosRecientes));
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error restaurando backup:', error);
            return false;
        }
    }

    // LIMPIAR DATOS
    limpiarDatos() {
        const claves = Object.keys(localStorage);
        const clavesApp = claves.filter(clave => clave.startsWith(this.prefijo));
        
        clavesApp.forEach(clave => {
            localStorage.removeItem(clave);
        });
        
        this.inicializar();
    }

    // EXPORTAR/IMPORTAR
    exportarDatos() {
        const datos = {
            sesiones: this.obtenerSesiones(),
            configuracion: this.obtenerConfiguracion()
        };
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_gestion_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importarDatos(archivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const datos = JSON.parse(e.target.result);
                    
                    if (datos.sesiones) {
                        this.guardarSesiones(datos.sesiones);
                    }
                    
                    if (datos.configuracion) {
                        this.guardarConfiguracion(datos.configuracion);
                    }
                    
                    resolve(true);
                } catch (error) {
                    reject(new Error('Formato de archivo inválido'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error leyendo el archivo'));
            };
            
            reader.readAsText(archivo);
        });
    }
}

// Crear instancia global
window.almacenamiento = new Almacenamiento();