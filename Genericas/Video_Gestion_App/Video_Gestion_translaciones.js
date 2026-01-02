// Traducciones para la aplicación Video Gestión
class Traducciones {
    constructor() {
        this.idiomas = {
            es: this.espanol(),
            ca: this.catalan(),
            en: this.ingles(),
            fr: this.frances()
        };
        this.idiomaActual = 'es';
    }

    espanol() {
        return {
            // Títulos principales
            'app-title-text': 'Video Gestión FFMPEG',
            
            // Menú principal
            'reduce-size-title': 'Reducir Tamaño Video',
            'reduce-size-desc': 'Optimiza videos para diferentes dispositivos',
            'cut-video-title': 'Cortar Video',
            'cut-video-desc': 'Extrae fragmentos específicos del video',
            'convert-format-title': 'Convertir Formato',
            'convert-format-desc': 'Cambia entre MP4, MOV, AVI',
            'reverse-video-title': 'Revertir Video',
            'reverse-video-desc': 'Invierte el orden de los frames',
            'to-jpg-title': 'Convertir a JPG',
            'to-jpg-desc': 'Extrae fotos con datos GPS',
            'join-videos-title': 'Unir Videos',
            'join-videos-desc': 'Combina múltiples videos en uno',
            
            // Modal: Reducir Tamaño
            'reduce-size-modal-title': 'Reducir Tamaño de Video',
            'quality-label': 'Calidad de destino:',
            'quality-pc': 'PC (Alta calidad)',
            'quality-tablet': 'Tablet (Calidad media)',
            'quality-mobile': 'Móvil (Calidad baja)',
            'reduce-file-label': 'Archivo a convertir:',
            'browse-text': 'Examinar',
            'reduce-dest-label': 'Carpeta destino:',
            'folder-text': 'Carpeta',
            'reduce-progress-label': 'Procesando...',
            'convert-btn-text': 'Convertir',
            'cancel-btn-text': 'Cancelar',
            
            // Modal: Cortar Video
            'cut-video-modal-title': 'Cortar Video',
            'cut-file-label': 'Video a cortar:',
            'cut-browse-text': 'Examinar',
            'cut-start-label': 'Tiempo Inicio (HH:MM:SS):',
            'cut-end-label': 'Tiempo Final (HH:MM:SS):',
            'cut-dest-label': 'Carpeta destino:',
            'cut-folder-text': 'Carpeta',
            'cut-progress-label': 'Cortando video...',
            'cut-btn-text': 'Cortar',
            'cut-cancel-text': 'Cancelar',
            
            // Modal: Convertir Formato
            'convert-format-modal-title': 'Convertir Formato de Video',
            'format-label': 'Formato destino:',
            'format-mp4': 'MP4',
            'format-mov': 'MOV',
            'format-avi': 'AVI',
            'convert-file-label': 'Archivo a convertir:',
            'convert-browse-text': 'Examinar',
            'convert-dest-label': 'Carpeta destino:',
            'convert-folder-text': 'Carpeta',
            'convert-progress-label': 'Convirtiendo formato...',
            'format-convert-text': 'Convertir',
            'format-cancel-text': 'Cancelar',
            
            // Modal: Revertir Video
            'reverse-video-modal-title': 'Revertir Video',
            'reverse-file-label': 'Video a revertir:',
            'reverse-browse-text': 'Examinar',
            'reverse-dest-label': 'Carpeta destino:',
            'reverse-folder-text': 'Carpeta',
            'reverse-progress-label': 'Revirtiendo video...',
            'reverse-convert-text': 'Revertir',
            'reverse-cancel-text': 'Cancelar',
            
            // Modal: Convertir a JPG
            'to-jpg-modal-title': 'Convertir Video a JPG con GPS',
            'jpg-file-label': 'Video origen:',
            'jpg-browse-text': 'Examinar',
            'gps-status': 'Cargando información GPS...',
            'jpg-size-label': 'Tamaño JPG:',
            'size-4k': '4K (3840x2160)',
            'size-1024': '1024px (ancho)',
            'size-512': '512px (ancho)',
            'jpg-interval-label': 'JPG cada (segundos):',
            'jpg-dest-label': 'Carpeta destino:',
            'jpg-folder-text': 'Carpeta',
            'jpg-progress-label': 'Extrayendo fotogramas...',
            'jpg-convert-text': 'Extraer JPG',
            'jpg-cancel-text': 'Cancelar',
            
            // Modal: Unir Videos
            'join-videos-modal-title': 'Unir Videos',
            'session-label': 'Sesión:',
            'new-session-option': '-- Nueva sesión --',
            'new-session-text': 'Nueva',
            'delete-session-text': 'Eliminar',
            'output-file-label': 'Archivo de salida:',
            'output-browse-text': 'Examinar',
            'add-file-text': 'Añadir archivo',
            'add-folder-text': 'Añadir carpeta',
            'move-up-text': 'Subir',
            'move-down-text': 'Bajar',
            'remove-file-text': 'Eliminar',
            'clear-table-text': 'Vaciar tabla',
            'backup-text': 'Copia de seguridad',
            'restore-text': 'Restaurar copia',
            'multiple-cuts-text': 'Añadir varios cortes',
            'join-btn-text': 'Unir videos',
            'join-progress-label': 'Uniendo videos...',
            
            // Cabeceras de tabla
            'order-header': 'Orden',
            'name-header': 'Nombre Archivo',
            'date-header': 'Fecha',
            'size-header': 'Tamaño',
            'duration-header': 'Duración',
            'start-header': 'Tiempo Inicio',
            'end-header': 'Tiempo Final',
            'path-header': 'Ruta completa',
            'actions-header': 'Acciones',
            
            // Modal múltiples cortes
            'multiple-cuts-modal-title': 'Añadir Múltiples Cortes',
            'add-cut-text': 'Añadir corte',
            'save-cuts-text': 'Guardar cortes',
            'cancel-cuts-text': 'Cancelar',
            
            // Modal reproducción
            'playback-modal-title': 'Reproducir Video',
            'speed-label': 'Velocidad:',
            
            // Footer
            'help-text': 'Ayuda',
            'suggestions-text': 'Sugerencias',
            'install-text': 'Instalar App',
            'copyright-text': '2025 © Copyright',
            
            // Modal ayuda
            'help-modal-title': 'Ayuda de Video Gestión',
            'help-modal-text1': 'Video Gestión es una aplicación PWA para procesar videos usando FFMPEG directamente en tu navegador.',
            'help-modal-subtitle1': 'Funciones disponibles:',
            'help-modal-subtitle2': 'Requisitos:',
            'help-modal-subtitle3': 'Notas importantes:',
            'help-modal-ok': 'Entendido',
            
            // Modal sugerencias
            'suggestions-modal-title': 'Enviar sugerencias',
            'suggestion-email-label': 'Email (opcional):',
            'suggestion-text-label': 'Sugerencias:',
            'send-suggestion-btn': 'Enviar',
            'cancel-suggestion-btn': 'Cancelar',
            
            // Textos generales
            'languages-label': 'Idioma',
            'yes-text': 'Sí',
            'no-text': 'No',
            'confirm-text': 'Confirmar',
            'loading-text': 'Cargando...',
            'error-text': 'Error',
            'success-text': 'Éxito',
            'warning-text': 'Advertencia',
            'select-all-text': 'Seleccionar todo',
            'deselect-all-text': 'Deseleccionar todo'
        };
    }

    catalan() {
        return {
            // Títulos principales
            'app-title-text': 'Gestió de Vídeo FFMPEG',
            
            // Menú principal
            'reduce-size-title': 'Reduir Mida Vídeo',
            'reduce-size-desc': 'Optimitza vídeos per a diferents dispositius',
            'cut-video-title': 'Tallar Vídeo',
            'cut-video-desc': 'Extreu fragments específics del vídeo',
            'convert-format-title': 'Convertir Format',
            'convert-format-desc': 'Canvia entre MP4, MOV, AVI',
            'reverse-video-title': 'Revertir Vídeo',
            'reverse-video-desc': 'Inverteix l\'ordre dels fotogrames',
            'to-jpg-title': 'Convertir a JPG',
            'to-jpg-desc': 'Extreu fotos amb dades GPS',
            'join-videos-title': 'Unir Vídeos',
            'join-videos-desc': 'Combina múltiples vídeos en un',
            
            // Modal: Reducir Tamaño
            'reduce-size-modal-title': 'Reduir Mida de Vídeo',
            'quality-label': 'Qualitat de destinació:',
            'quality-pc': 'PC (Alta qualitat)',
            'quality-tablet': 'Tableta (Qualitat mitjana)',
            'quality-mobile': 'Mòbil (Qualitat baixa)',
            'reduce-file-label': 'Arxiu a convertir:',
            'browse-text': 'Examinar',
            'reduce-dest-label': 'Carpeta destinació:',
            'folder-text': 'Carpeta',
            'reduce-progress-label': 'Processant...',
            'convert-btn-text': 'Convertir',
            'cancel-btn-text': 'Cancel·lar',
            
            // Footer
            'help-text': 'Ajuda',
            'suggestions-text': 'Suggeriments',
            'install-text': 'Instal·lar App',
            'copyright-text': '2025 © Copyright',
            
            // Textos generales
            'languages-label': 'Idioma',
            'yes-text': 'Sí',
            'no-text': 'No',
            'confirm-text': 'Confirmar',
            'loading-text': 'Carregant...'
        };
    }

    ingles() {
        return {
            // Títulos principales
            'app-title-text': 'Video Management FFMPEG',
            
            // Menú principal
            'reduce-size-title': 'Reduce Video Size',
            'reduce-size-desc': 'Optimize videos for different devices',
            'cut-video-title': 'Cut Video',
            'cut-video-desc': 'Extract specific video fragments',
            'convert-format-title': 'Convert Format',
            'convert-format-desc': 'Switch between MP4, MOV, AVI',
            'reverse-video-title': 'Reverse Video',
            'reverse-video-desc': 'Invert frame order',
            'to-jpg-title': 'Convert to JPG',
            'to-jpg-desc': 'Extract photos with GPS data',
            'join-videos-title': 'Join Videos',
            'join-videos-desc': 'Combine multiple videos into one',
            
            // Footer
            'help-text': 'Help',
            'suggestions-text': 'Suggestions',
            'install-text': 'Install App',
            'copyright-text': '2025 © Copyright',
            
            // Textos generales
            'languages-label': 'Language',
            'yes-text': 'Yes',
            'no-text': 'No',
            'confirm-text': 'Confirm',
            'loading-text': 'Loading...'
        };
    }

    frances() {
        return {
            // Títulos principales
            'app-title-text': 'Gestion Vidéo FFMPEG',
            
            // Menú principal
            'reduce-size-title': 'Réduire Taille Vidéo',
            'reduce-size-desc': 'Optimisez les vidéos pour différents appareils',
            'cut-video-title': 'Couper Vidéo',
            'cut-video-desc': 'Extrayez des fragments spécifiques',
            'convert-format-title': 'Convertir Format',
            'convert-format-desc': 'Changez entre MP4, MOV, AVI',
            'reverse-video-title': 'Inverser Vidéo',
            'reverse-video-desc': 'Inversez l\'ordre des images',
            'to-jpg-title': 'Convertir en JPG',
            'to-jpg-desc': 'Extrayez des photos avec données GPS',
            'join-videos-title': 'Joindre Vidéos',
            'join-videos-desc': 'Combine plusieurs vidéos en une',
            
            // Footer
            'help-text': 'Aide',
            'suggestions-text': 'Suggestions',
            'install-text': 'Installer App',
            'copyright-text': '2025 © Copyright',
            
            // Textos generales
            'languages-label': 'Langue',
            'yes-text': 'Oui',
            'no-text': 'Non',
            'confirm-text': 'Confirmer',
            'loading-text': 'Chargement...'
        };
    }

    cambiarIdioma(idioma) {
        if (this.idiomas[idioma]) {
            this.idiomaActual = idioma;
            this.aplicarTraducciones();
            this.guardarPreferencia('idioma', idioma);
        }
    }

    aplicarTraducciones() {
        const textos = this.idiomas[this.idiomaActual];
        
        for (const [id, texto] of Object.entries(textos)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (elemento.tagName === 'INPUT' || elemento.tagName === 'TEXTAREA') {
                    elemento.placeholder = texto;
                } else {
                    elemento.textContent = texto;
                }
            }
        }
        
        // Actualizar banderas activas
        document.querySelectorAll('.flag').forEach(flag => {
            flag.classList.remove('active');
            if (flag.dataset.lang === this.idiomaActual) {
                flag.classList.add('active');
            }
        });
    }

    obtenerTexto(id, defaultValue = '') {
        const textos = this.idiomas[this.idiomaActual];
        return textos[id] || this.idiomas['es'][id] || defaultValue;
    }

    guardarPreferencia(clave, valor) {
        localStorage.setItem(`video_gestion_${clave}`, valor);
    }

    cargarPreferencia(clave, defaultValue) {
        return localStorage.getItem(`video_gestion_${clave}`) || defaultValue;
    }

    inicializar() {
        // Cargar idioma guardado
        const idiomaGuardado = this.cargarPreferencia('idioma', 'es');
        this.cambiarIdioma(idiomaGuardado);
        
        // Configurar eventos de cambio de idioma
        document.querySelectorAll('.flag').forEach(flag => {
            flag.addEventListener('click', () => {
                const idioma = flag.dataset.lang;
                this.cambiarIdioma(idioma);
            });
        });
    }
}

// Crear instancia global
window.traducciones = new Traducciones();