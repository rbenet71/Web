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
            'join-cancel-text': 'Cancelar',
            
            // Modal múltiples cortes
            'multiple-cuts-modal-title': 'Añadir Múltiples Cortes',
            'add-cut-text': 'Añadir corte',
            'save-cuts-text': 'Guardar cortes',
            'cancel-cuts-text': 'Cancelar',
            
            // Modal reproducción
            'playback-modal-title': 'Reproducir Video',
            'speed-label': 'Velocidad:',
            'playback-cancel-text': 'Cerrar',
            
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
            
            // Footer
            'help-text': 'Ayuda',
            'suggestions-text': 'Sugerencias',
            'install-text': 'Instalar App',
            'copyright-text': '2025 © Copyright',
            
            // Modal ayuda - Títulos
            'help-modal-title': 'Ayuda de Video Gestión',
            'help-modal-text1': 'Video Gestión es una aplicación PWA para procesar videos usando FFMPEG directamente en tu navegador.',
            'help-modal-subtitle1': 'Funciones disponibles:',
            'help-modal-subtitle2': 'Requisitos:',
            'help-modal-subtitle3': 'Notas importantes:',
            'help-modal-subtitle4': 'Cómo usar cada función:',
            'help-modal-subtitle5': 'Indicadores visuales:',
            'help-modal-subtitle6': 'Consejos de rendimiento:',
            'help-modal-subtitle7': 'Solución de problemas:',
            'help-modal-text2': 'La aplicación guarda automáticamente tus preferencias y sesiones. Puedes usar la función "Copia de seguridad" para exportar tus datos.',
            'help-modal-ok': 'Entendido',
            
            // Modal ayuda - Funciones
            'help-reduce-title': 'Reducir tamaño:',
            'help-reduce-desc': 'Optimiza videos para PC, Tablet o Móvil',
            'help-cut-title': 'Cortar video:',
            'help-cut-desc': 'Extrae fragmentos específicos entre tiempos definidos',
            'help-convert-title': 'Convertir formato:',
            'help-convert-desc': 'Cambia entre MP4, MOV, AVI preservando calidad',
            'help-reverse-title': 'Revertir video:',
            'help-reverse-desc': 'Invierte el orden de los fotogramas',
            'help-jpg-title': 'Convertir a JPG:',
            'help-jpg-desc': 'Extrae fotos con datos GPS si están disponibles',
            'help-join-title': 'Unir videos:',
            'help-join-desc': 'Combina múltiples videos en uno con cortes personalizados',
            
            // Modal ayuda - Requisitos
            'help-req1': 'Navegador moderno (Chrome 80+, Firefox 75+, Edge 80+)',
            'help-req2': 'Soporte para WebAssembly',
            'help-req3': 'Permisos para acceder al sistema de archivos',
            'help-req4': 'Espacio suficiente en disco para archivos temporales',
            
            // Modal ayuda - Notas
            'help-note1': 'Los procesamientos se realizan en el navegador (puede ser lento para videos grandes)',
            'help-note2': 'Se preservan los metadatos GPS cuando es posible',
            'help-note3': 'La aplicación funciona offline una vez instalada',
            'help-note4': 'Los archivos procesados se descargan automáticamente',
            'help-note5': 'Las sesiones de unión se guardan automáticamente',
            
            // Modal ayuda - Secciones
            'help-section-reduce': '1. Reducir Tamaño:',
            'help-section-cut': '2. Cortar Video:',
            'help-section-convert': '3. Convertir Formato:',
            'help-section-reverse': '4. Revertir Video:',
            'help-section-jpg': '5. Convertir a JPG:',
            'help-section-join': '6. Unir Videos:',
            
            // Modal ayuda - Pasos Reducir
            'help-reduce-step1': 'Selecciona calidad: PC (alta), Tablet (media) o Móvil (baja)',
            'help-reduce-step2': 'Elige el archivo de video',
            'help-reduce-step3': 'La carpeta destino se autocompleta',
            'help-reduce-step4': 'Haz clic en "Convertir"',
            'help-reduce-step5': 'El archivo se guardará con sufijo _PC, _Tablet o _Movil',
            
            // Modal ayuda - Pasos Cortar
            'help-cut-step1': 'Selecciona el video a cortar',
            'help-cut-step2': 'La duración total se mostrará automáticamente',
            'help-cut-step3': 'Define tiempos de inicio y final (formato HH:MM:SS)',
            'help-cut-step4': 'Haz clic en "Cortar"',
            'help-cut-step5': 'El archivo se guardará con sufijo _Cortado',
            
            // Modal ayuda - Pasos Convertir
            'help-convert-step1': 'Selecciona formato destino: MP4, MOV o AVI',
            'help-convert-step2': 'Elige el archivo a convertir',
            'help-convert-step3': 'Haz clic en "Convertir"',
            'help-convert-step4': 'El archivo se guardará con sufijo _Convertido',
            
            // Modal ayuda - Pasos Revertir
            'help-reverse-step1': 'Selecciona el video a revertir',
            'help-reverse-step2': 'Haz clic en "Revertir"',
            'help-reverse-step3': 'El archivo se guardará con sufijo _Reverse',
            
            // Modal ayuda - Pasos JPG
            'help-jpg-step1': 'Selecciona video con datos GPS (opcional)',
            'help-jpg-step2': 'Elige tamaño: 4K, 1024px o 512px',
            'help-jpg-step3': 'Define intervalo entre fotos (segundos)',
            'help-jpg-step4': 'Haz clic en "Extraer JPG"',
            'help-jpg-step5': 'Las fotos se guardarán con nombres HHMMSSS.jpg',
            
            // Modal ayuda - Pasos Unir
            'help-join-step1': 'Crea o carga una sesión',
            'help-join-step2': 'Añade archivos o carpetas completas',
            'help-join-step3': 'Ordena los videos arrastrando o usando botones',
            'help-join-step4': 'Define cortes específicos para cada video',
            'help-join-step5': 'Guarda copia de seguridad (recomendado)',
            'help-join-step6': 'Haz clic en "Unir videos"',
            
            // Modal ayuda - Indicadores
            'help-indicator1': 'Barra de progreso: Muestra el avance del procesamiento',
            'help-indicator2': 'Info GPS: Indica si el video tiene datos de ubicación',
            'help-indicator3': 'Mensajes flotantes: Notificaciones de éxito/error',
            
            // Modal ayuda - Consejos
            'help-tip1': 'Para videos grandes (>500MB), procesa en segmentos',
            'help-tip2': 'Cierra otras pestañas del navegador',
            'help-tip3': 'Usa calidad más baja para procesamiento más rápido',
            'help-tip4': 'Guarda sesiones de trabajo para recuperarlas luego',
            
            // Modal ayuda - Solución problemas
            'help-trouble1': 'FFMPEG no carga: Verifica conexión a internet y recarga',
            'help-trouble2': 'Procesamiento lento: Reduce calidad o tamaño del video',
            'help-trouble3': 'Error al guardar: Verifica permisos del navegador',
            'help-trouble4': 'Sin datos GPS: El video puede no contener información de ubicación',
            
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
            
            // Modal: Cortar Video
            'cut-video-modal-title': 'Tallar Vídeo',
            'cut-file-label': 'Vídeo a tallar:',
            'cut-browse-text': 'Examinar',
            'cut-start-label': 'Temps Inici (HH:MM:SS):',
            'cut-end-label': 'Temps Final (HH:MM:SS):',
            'cut-dest-label': 'Carpeta destinació:',
            'cut-folder-text': 'Carpeta',
            'cut-progress-label': 'Tallant vídeo...',
            'cut-btn-text': 'Tallar',
            'cut-cancel-text': 'Cancel·lar',
            
            // Footer
            'help-text': 'Ajuda',
            'suggestions-text': 'Suggeriments',
            'install-text': 'Instal·lar App',
            'copyright-text': '2025 © Copyright',
            
            // Modal ayuda
            'help-modal-title': 'Ajuda de Gestió de Vídeo',
            'help-modal-text1': 'Gestió de Vídeo és una aplicació PWA per processar vídeos utilitzant FFMPEG directament al teu navegador.',
            'help-modal-subtitle1': 'Funcions disponibles:',
            'help-modal-subtitle2': 'Requisits:',
            'help-modal-subtitle3': 'Notes importants:',
            'help-modal-ok': 'Entès',
            
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
            
            // Modal: Reducir Tamaño
            'reduce-size-modal-title': 'Reduce Video Size',
            'quality-label': 'Destination quality:',
            'quality-pc': 'PC (High quality)',
            'quality-tablet': 'Tablet (Medium quality)',
            'quality-mobile': 'Mobile (Low quality)',
            'reduce-file-label': 'File to convert:',
            'browse-text': 'Browse',
            'reduce-dest-label': 'Destination folder:',
            'folder-text': 'Folder',
            'reduce-progress-label': 'Processing...',
            'convert-btn-text': 'Convert',
            'cancel-btn-text': 'Cancel',
            
            // Footer
            'help-text': 'Help',
            'suggestions-text': 'Suggestions',
            'install-text': 'Install App',
            'copyright-text': '2025 © Copyright',
            
            // Modal ayuda
            'help-modal-title': 'Video Management Help',
            'help-modal-text1': 'Video Management is a PWA application for processing videos using FFMPEG directly in your browser.',
            'help-modal-subtitle1': 'Available functions:',
            'help-modal-subtitle2': 'Requirements:',
            'help-modal-subtitle3': 'Important notes:',
            'help-modal-ok': 'OK',
            
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
            
            // Modal: Reducir Tamaño
            'reduce-size-modal-title': 'Réduire Taille de Vidéo',
            'quality-label': 'Qualité de destination:',
            'quality-pc': 'PC (Haute qualité)',
            'quality-tablet': 'Tablette (Qualité moyenne)',
            'quality-mobile': 'Mobile (Basse qualité)',
            'reduce-file-label': 'Fichier à convertir:',
            'browse-text': 'Parcourir',
            'reduce-dest-label': 'Dossier de destination:',
            'folder-text': 'Dossier',
            'reduce-progress-label': 'Traitement...',
            'convert-btn-text': 'Convertir',
            'cancel-btn-text': 'Annuler',
            
            // Footer
            'help-text': 'Aide',
            'suggestions-text': 'Suggestions',
            'install-text': 'Installer App',
            'copyright-text': '2025 © Copyright',
            
            // Modal ayuda
            'help-modal-title': 'Aide Gestion Vidéo',
            'help-modal-text1': 'Gestion Vidéo est une application PWA pour traiter des vidéos en utilisant FFMPEG directement dans votre navigateur.',
            'help-modal-subtitle1': 'Fonctions disponibles:',
            'help-modal-subtitle2': 'Exigences:',
            'help-modal-subtitle3': 'Notes importantes:',
            'help-modal-ok': 'Compris',
            
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