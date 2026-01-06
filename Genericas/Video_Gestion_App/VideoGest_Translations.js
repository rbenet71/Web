// VideoGest_Translations.js - VERSIÓN COMPLETA MODIFICADA
class VideoGestTranslations {
    constructor() {
        this.translations = {
            es: {
                // General
                "appTitle": "VideoGest - Gestor de Vídeos",
                "selectLanguage": "Seleccionar Idioma",
                "help": "Ayuda",
                "close": "Cerrar",
                "back": "Volver",
                "cancel": "Cancelar",
                "execute": "Ejecutar",
                "convert": "Convertir",
                "continue": "Continuar",
                "processing": "Procesando...",
                "preparing": "Preparando...",
                "selectOperation": "Seleccionar Operación",
                "installApp": "Instalar App",
                
                // Operaciones
                "reduceSize": "Reducir Tamaño",
                "cutVideo": "Cortar Video",
                "convertVideo": "Convertir Video",
                "reverseVideo": "Revertir Video",
                "convertToJPG": "Convertir a JPG",
                "mergeVideos": "Unir Videos",
                
                // Títulos de paneles
                "reduceVideoSize": "Reducir Tamaño de Video",
                "cutVideoTitle": "Cortar Video",
                "convertVideoTitle": "Convertir Formato de Video",
                "reverseVideoTitle": "Revertir Video",
                
                // Campos comunes
                "selectVideo": "Seleccionar Video:",
                "quality": "Calidad:",
                "outputFormat": "Formato de Salida:",
                "keepBackup": "Mantener copia del original",
                "fileSelected": "Archivo seleccionado:",
                
                // Reducción de tamaño
                "pcQuality": "Calidad PC",
                "tabletQuality": "Calidad Tablet", 
                "mobileQuality": "Calidad Móvil",
                "highQuality": "Alta (reducción mínima)",
                "mediumQuality": "Media (reducción equilibrada)",
                "lowQuality": "Baja (máxima reducción)",
                
                // Cortar video
                "startTime": "Tiempo Inicio:",
                "endTime": "Tiempo Final:",
                "duration": "Duración:",
                "timeFormat": "Formato HH:MM:SS",
                "timeExample": "Ejemplo: 00:01:30",
                "getDuration": "Obtener Duración",
                "fullVideo": "Video completo",
                "cutSettings": "Configuración de Corte",
                
                // Convertir video
                "selectFormat": "Seleccionar Formato:",
                "outputDirectory": "Directorio Destino:",
                "sameDirectory": "Misma carpeta que original",
                "browseDirectory": "Buscar carpeta...",
                "supportedFormats": "Formatos soportados:",
                "formatMP4": "MP4 - Formato estándar",
                "formatMOV": "MOV - Formato Apple",
                "formatAVI": "AVI - Formato contenedor",
                "formatMKV": "MKV - Formato abierto",
                "formatWEBM": "WebM - Para web",
                "formatFLV": "FLV - Flash Video",
                "formatWMV": "WMV - Windows Media",
                "formatM4V": "M4V - iTunes",
                "formatMPG": "MPG - MPEG",
                "formatMPEG": "MPEG - MPEG",
                
                // Revertir video
                "reverseDescription": "El video se reproducirá en reversa",
                "preserveMetadata": "Preservar metadatos",
                "includeAudio": "Incluir audio",
                
                // Instrucciones FFMPEG
                "ffmpegInstructions": "Instrucciones FFMPEG",
                "instruction1": "Debido a las limitaciones de JavaScript, necesitamos su intervención para ejecutar FFMPEG.",
                "instruction2": "Por favor, siga estos pasos:",
                "instruction3": "Haga clic en 'Continuar' para seleccionar el directorio",
                "instruction4": "Seleccione la carpeta donde está su archivo de video",
                "instruction5": "En el explorador, en la barra de dirección escriba: CMD",
                "instruction6": "En la terminal, pegue el comando con Ctrl+V y presione Enter",
                "commandToExecute": "Comando a ejecutar:",
                "copyCommand": "Copiar Comando",
                "openExplorer": "Abrir Explorador en Directorio",
                "note": "Nota: El comando será copiado automáticamente al hacer clic en 'Continuar'",
                
                // Ayuda
                "helpContent": `
                    <p>Esta aplicación permite realizar diferentes operaciones sobre vídeos utilizando FFMPEG.</p>
                    <p><strong>Funciones disponibles:</strong></p>
                    <ul>
                        <li>Reducir tamaño del vídeo</li>
                        <li>Cortar vídeo (extraer fragmento)</li>
                        <li>Convertir formato (MP4, MOV, AVI, etc.)</li>
                        <li>Revertir vídeo (playback inverso)</li>
                        <li>Convertir a JPG</li>
                        <li>Unir vídeos</li>
                    </ul>
                    <p>Para realizar cualquier operación, necesitarás tener permiso para ejecutar FFMPEG en tu sistema.</p>
                    <p><strong>Requisitos:</strong></p>
                    <ul>
                        <li>Windows 7 o superior</li>
                        <li>Permisos de administrador (recomendado)</li>
                        <li>Espacio suficiente en disco</li>
                    </ul>
                    <p><strong>Instrucciones importantes:</strong></p>
                    <ol>
                        <li>Seleccione el archivo de video que desea procesar</li>
                        <li>Configure los parámetros según sus necesidades</li>
                        <li>Haga clic en "Ejecutar" para generar el comando FFMPEG</li>
                        <li>Haga clic en "Continuar" para copiar el comando y abrir el explorador</li>
                        <li>Seleccione la carpeta donde está su archivo de video</li>
                        <li>En la barra de dirección del explorador, escriba: CMD</li>
                        <li>En la terminal, pegue el comando (Ctrl+V) y presione Enter</li>
                    </ol>
                `,
                
                // Mensajes
                "selectFileFirst": "Por favor, seleccione un archivo primero",
                "commandCopied": "Comando copiado al portapapeles",
                "operationCompleted": "Operación completada exitosamente",
                "errorOccurred": "Ocurrió un error",
                "noFFMPEG": "No se encontró ffmpeg.exe. Se copiará automáticamente.",
                "explorerOpened": "Explorador abierto. Seleccione la carpeta del video.",
                "directorySelected": "Directorio seleccionado:",
                "navigateToDirectory": "Navegue al directorio:",
                "openCmdHere": "Escriba CMD en la barra de dirección",
                "pasteCommand": "Pegue el comando (Ctrl+V)",
                "executeCommand": "Ejecute el comando (Enter)",
                "fullCommandCopied": "Comando completo copiado (incluye cd)",
                "commandAutoCopied": "Comando copiado automáticamente",
                "readyToPaste": "El comando ya está en su portapapeles",
                "justOpenCmdAndPaste": "Solo abra CMD y pegue (Ctrl+V)",
                
                // Validaciones
                "invalidTimeFormat": "Formato de tiempo inválido. Use HH:MM:SS",
                "startAfterEnd": "El tiempo de inicio debe ser anterior al tiempo final",
                "invalidDuration": "Duración inválida",
                "selectFormatFirst": "Por favor, seleccione un formato primero",
                "processingVideo": "Procesando video...",
                "estimatingTime": "Estimando tiempo de procesamiento...",
                "preservingMetadata": "Preservando metadatos...",
                "includingGPS": "Incluyendo datos GPS...",
                
                // Información de operación
                "operationInfoCut": "Cortando video desde {start} hasta {end}",
                "operationInfoConvert": "Convirtiendo a formato {format}",
                "operationInfoReverse": "Revirtiendo video",
                "outputFileWillBe": "El archivo de salida será:",
                "originalPreserved": "El archivo original se preservará",
                "metadataPreserved": "Metadatos (incluyendo GPS) preservados",

                "analyzing": "Analizando...",
                "durationDetected": "Duración detectada",
                "analysisFailed": "Análisis falló",
                
            },
            ca: {
                // General
                "appTitle": "VideoGest - Gestor de Vídeos",
                "selectLanguage": "Seleccionar Idioma",
                "help": "Ajuda",
                "close": "Tancar",
                "back": "Tornar",
                "cancel": "Cancel·lar",
                "execute": "Executar",
                "convert": "Convertir",
                "continue": "Continuar",
                "processing": "Processant...",
                "preparing": "Preparant...",
                "selectOperation": "Seleccionar Operació",
                "installApp": "Instal·lar App",
                
                // Operaciones
                "reduceSize": "Reduir Mida",
                "cutVideo": "Tallar Video",
                "convertVideo": "Convertir Video",
                "reverseVideo": "Revertir Video",
                "convertToJPG": "Convertir a JPG",
                "mergeVideos": "Unir Videos",
                
                // Títulos de paneles
                "reduceVideoSize": "Reduir Mida del Video",
                "cutVideoTitle": "Tallar Video",
                "convertVideoTitle": "Convertir Format de Video",
                "reverseVideoTitle": "Revertir Video",
                
                // Campos comunes
                "selectVideo": "Seleccionar Video:",
                "quality": "Qualitat:",
                "outputFormat": "Format de Sortida:",
                "keepBackup": "Mantenir còpia de l'original",
                "fileSelected": "Arxiu seleccionat:",
                
                // Reducción de tamaño
                "pcQuality": "Qualitat PC",
                "tabletQuality": "Qualitat Tablet", 
                "mobileQuality": "Qualitat Mòbil",
                "highQuality": "Alta (reducció mínima)",
                "mediumQuality": "Mitjana (reducció equilibrada)",
                "lowQuality": "Baixa (màxima reducció)",
                
                // Cortar video
                "startTime": "Temps Inici:",
                "endTime": "Temps Final:",
                "duration": "Durada:",
                "timeFormat": "Format HH:MM:SS",
                "timeExample": "Exemple: 00:01:30",
                "getDuration": "Obtenir Durada",
                "fullVideo": "Vídeo complet",
                "cutSettings": "Configuració de Tall",
                
                // Convertir video
                "selectFormat": "Seleccionar Format:",
                "outputDirectory": "Directori Destí:",
                "sameDirectory": "Mateixa carpeta que original",
                "browseDirectory": "Buscar carpeta...",
                "supportedFormats": "Formats suportats:",
                "formatMP4": "MP4 - Format estàndard",
                "formatMOV": "MOV - Format Apple",
                "formatAVI": "AVI - Format contenidor",
                "formatMKV": "MKV - Format obert",
                "formatWEBM": "WebM - Per web",
                "formatFLV": "FLV - Flash Video",
                "formatWMV": "WMV - Windows Media",
                "formatM4V": "M4V - iTunes",
                "formatMPG": "MPG - MPEG",
                "formatMPEG": "MPEG - MPEG",
                
                // Revertir video
                "reverseDescription": "El vídeo es reproduirà al revés",
                "preserveMetadata": "Preservar metadades",
                "includeAudio": "Incloure àudio",
                
                // Instrucciones FFMPEG
                "ffmpegInstructions": "Instruccions FFMPEG",
                "instruction1": "A causa de les limitacions de JavaScript, necessitem la seva intervenció per executar FFMPEG.",
                "instruction2": "Si us plau, segueixi aquests passos:",
                "instruction3": "Faci clic a 'Continuar' per seleccionar el directori",
                "instruction4": "Seleccioni la carpeta on està el seu arxiu de vídeo",
                "instruction5": "A l'explorador, a la barra d'adreça escrigui: CMD",
                "instruction6": "A la terminal, enganxi la comanda amb Ctrl+V i premi Enter",
                "commandToExecute": "Comanda a executar:",
                "copyCommand": "Copiar Comanda",
                "openExplorer": "Obrir Explorador al Directori",
                "note": "Nota: La comanda es copiarà automàticament en fer clic a 'Continuar'",
                
                // Ayuda
                "helpContent": `
                    <p>Aquesta aplicació permet realitzar diferents operacions sobre vídeos utilitzant FFMPEG.</p>
                    <p><strong>Funcions disponibles:</strong></p>
                    <ul>
                        <li>Reduir mida del vídeo</li>
                        <li>Tallar vídeo (extraure fragment)</li>
                        <li>Convertir format (MP4, MOV, AVI, etc.)</li>
                        <li>Revertir vídeo (reproducció inversa)</li>
                        <li>Convertir a JPG</li>
                        <li>Unir vídeos</li>
                    </ul>
                    <p>Per realitzar qualsevol operació, necessitaràs tenir permís per executar FFMPEG al teu sistema.</p>
                    <p><strong>Requisits:</strong></p>
                    <ul>
                        <li>Windows 7 o superior</li>
                        <li>Permisos d'administrador (recomanat)</li>
                        <li>Espai suficient al disc</li>
                    </ul>
                    <p><strong>Instruccions importants:</strong></p>
                    <ol>
                        <li>Seleccioni l'arxiu de vídeo que vol processar</li>
                        <li>Configuri els paràmetres segons les seves necessitats</li>
                        <li>Faci clic a "Executar" per generar la comanda FFMPEG</li>
                        <li>Faci clic a "Continuar" per copiar la comanda i obrir l'explorador</li>
                        <li>Seleccioni la carpeta on està el seu arxiu de vídeo</li>
                        <li>A la barra d'adreça de l'explorador, escrigui: CMD</li>
                        <li>A la terminal, enganxi la comanda (Ctrl+V) i premi Enter</li>
                    </ol>
                `,
                
                // Mensajes
                "selectFileFirst": "Si us plau, seleccioni un arxiu primer",
                "commandCopied": "Comanda copiada al porta-retalls",
                "operationCompleted": "Operació completada amb èxit",
                "errorOccurred": "Hi ha hagut un error",
                "noFFMPEG": "No s'ha trobat ffmpeg.exe. Es copiarà automàticament.",
                "explorerOpened": "Explorador obert. Seleccioni la carpeta del vídeo.",
                "directorySelected": "Directori seleccionat:",
                "navigateToDirectory": "Navegui al directori:",
                "openCmdHere": "Escrigui CMD a la barra d'adreça",
                "pasteCommand": "Enganxi la comanda (Ctrl+V)",
                "executeCommand": "Executi la comanda (Enter)",
                "fullCommandCopied": "Comanda completa copiada (inclou cd)",
                "commandAutoCopied": "Comando copiado automáticamente",
                "readyToPaste": "El comando ya está en su portapapeles",
                "justOpenCmdAndPaste": "Solo abra CMD y pegue (Ctrl+V)",
                
                // Validaciones
                "invalidTimeFormat": "Format de temps invàlid. Utilitzi HH:MM:SS",
                "startAfterEnd": "El temps d'inici ha de ser anterior al temps final",
                "invalidDuration": "Durada invàlida",
                "selectFormatFirst": "Si us plau, seleccioni un format primer",
                "processingVideo": "Processant vídeo...",
                "estimatingTime": "Estimant temps de processament...",
                "preservingMetadata": "Preservant metadades...",
                "includingGPS": "Incloent dades GPS...",
                
                // Información de operación
                "operationInfoCut": "Tallant vídeo des de {start} fins a {end}",
                "operationInfoConvert": "Convertint a format {format}",
                "operationInfoReverse": "Revertint vídeo",
                "outputFileWillBe": "L'arxiu de sortida serà:",
                "originalPreserved": "L'arxiu original es preservarà",
                "metadataPreserved": "Metadades (incloent GPS) preservades",

                
                "analyzing": "Analizando...",
                "durationDetected": "Duración detectada",
                "analysisFailed": "Análisis falló",

            },
            en: {
                // General
                "appTitle": "VideoGest - Video Manager",
                "selectLanguage": "Select Language",
                "help": "Help",
                "close": "Close",
                "back": "Back",
                "cancel": "Cancel",
                "execute": "Execute",
                "convert": "Convert",
                "continue": "Continue",
                "processing": "Processing...",
                "preparing": "Preparing...",
                "selectOperation": "Select Operation",
                "installApp": "Install App",
                
                // Operations
                "reduceSize": "Reduce Size",
                "cutVideo": "Cut Video",
                "convertVideo": "Convert Video",
                "reverseVideo": "Reverse Video",
                "convertToJPG": "Convert to JPG",
                "mergeVideos": "Merge Videos",
                
                // Panel titles
                "reduceVideoSize": "Reduce Video Size",
                "cutVideoTitle": "Cut Video",
                "convertVideoTitle": "Convert Video Format",
                "reverseVideoTitle": "Reverse Video",
                
                // Common fields
                "selectVideo": "Select Video:",
                "quality": "Quality:",
                "outputFormat": "Output Format:",
                "keepBackup": "Keep original backup",
                "fileSelected": "File selected:",
                
                // Size reduction
                "pcQuality": "PC Quality",
                "tabletQuality": "Tablet Quality", 
                "mobileQuality": "Mobile Quality",
                "highQuality": "High (minimum reduction)",
                "mediumQuality": "Medium (balanced reduction)",
                "lowQuality": "Low (maximum reduction)",
                
                // Cut video
                "startTime": "Start Time:",
                "endTime": "End Time:",
                "duration": "Duration:",
                "timeFormat": "Format HH:MM:SS",
                "timeExample": "Example: 00:01:30",
                "getDuration": "Get Duration",
                "fullVideo": "Full video",
                "cutSettings": "Cut Settings",
                
                // Convert video
                "selectFormat": "Select Format:",
                "outputDirectory": "Output Directory:",
                "sameDirectory": "Same folder as original",
                "browseDirectory": "Browse folder...",
                "supportedFormats": "Supported formats:",
                "formatMP4": "MP4 - Standard format",
                "formatMOV": "MOV - Apple format",
                "formatAVI": "AVI - Container format",
                "formatMKV": "MKV - Open format",
                "formatWEBM": "WebM - For web",
                "formatFLV": "FLV - Flash Video",
                "formatWMV": "WMV - Windows Media",
                "formatM4V": "M4V - iTunes",
                "formatMPG": "MPG - MPEG",
                "formatMPEG": "MPEG - MPEG",
                
                // Reverse video
                "reverseDescription": "The video will play in reverse",
                "preserveMetadata": "Preserve metadata",
                "includeAudio": "Include audio",
                
                // FFMPEG Instructions
                "ffmpegInstructions": "FFMPEG Instructions",
                "instruction1": "Due to JavaScript limitations, we need your intervention to execute FFMPEG.",
                "instruction2": "Please follow these steps:",
                "instruction3": "Click 'Continue' to select the directory",
                "instruction4": "Select the folder where your video file is located",
                "instruction5": "In the explorer, in the address bar type: CMD",
                "instruction6": "In the terminal, paste the command with Ctrl+V and press Enter",
                "commandToExecute": "Command to execute:",
                "copyCommand": "Copy Command",
                "openExplorer": "Open Explorer in Directory",
                "note": "Note: The command will be automatically copied when clicking 'Continue'",
                
                // Help
                "helpContent": `
                    <p>This application allows you to perform different operations on videos using FFMPEG.</p>
                    <p><strong>Available functions:</strong></p>
                    <ul>
                        <li>Reduce video size</li>
                        <li>Cut video (extract fragment)</li>
                        <li>Convert format (MP4, MOV, AVI, etc.)</li>
                        <li>Reverse video (reverse playback)</li>
                        <li>Convert to JPG</li>
                        <li>Merge videos</li>
                    </ul>
                    <p>To perform any operation, you will need permission to execute FFMPEG on your system.</p>
                    <p><strong>Requirements:</strong></p>
                    <ul>
                        <li>Windows 7 or higher</li>
                        <li>Administrator permissions (recommended)</li>
                        <li>Sufficient disk space</li>
                    </ul>
                    <p><strong>Important instructions:</strong></p>
                    <ol>
                        <li>Select the video file you want to process</li>
                        <li>Configure the parameters according to your needs</li>
                        <li>Click "Execute" to generate the FFMPEG command</li>
                        <li>Click "Continue" to copy the command and open the explorer</li>
                        <li>Select the folder where your video file is located</li>
                        <li>In the explorer address bar, type: CMD</li>
                        <li>In the terminal, paste the command (Ctrl+V) and press Enter</li>
                    </ol>
                `,
                
                // Messages
                "selectFileFirst": "Please select a file first",
                "commandCopied": "Command copied to clipboard",
                "operationCompleted": "Operation completed successfully",
                "errorOccurred": "An error occurred",
                "noFFMPEG": "ffmpeg.exe not found. It will be copied automatically.",
                "explorerOpened": "Explorer opened. Select the video folder.",
                "directorySelected": "Directory selected:",
                "navigateToDirectory": "Navigate to directory:",
                "openCmdHere": "Type CMD in the address bar",
                "pasteCommand": "Paste the command (Ctrl+V)",
                "executeCommand": "Execute the command (Enter)",
                "fullCommandCopied": "Full command copied (includes cd)",
                "commandAutoCopied": "Command automatically copied",
                "readyToPaste": "The command is already in your clipboard",
                "justOpenCmdAndPaste": "Just open CMD and paste (Ctrl+V)",
                
                // Validations
                "invalidTimeFormat": "Invalid time format. Use HH:MM:SS",
                "startAfterEnd": "Start time must be before end time",
                "invalidDuration": "Invalid duration",
                "selectFormatFirst": "Please select a format first",
                "processingVideo": "Processing video...",
                "estimatingTime": "Estimating processing time...",
                "preservingMetadata": "Preserving metadata...",
                "includingGPS": "Including GPS data...",
                
                // Operation information
                "operationInfoCut": "Cutting video from {start} to {end}",
                "operationInfoConvert": "Converting to {format} format",
                "operationInfoReverse": "Reversing video",
                "outputFileWillBe": "Output file will be:",
                "originalPreserved": "Original file will be preserved",
                "metadataPreserved": "Metadata (including GPS) preserved",
                

                "analyzing": "Analizando...",
                "durationDetected": "Duración detectada",
                "analysisFailed": "Análisis falló", 
            },
            fr: {
                // General
                "appTitle": "VideoGest - Gestionnaire de Vidéos",
                "selectLanguage": "Sélectionner la Langue",
                "help": "Aide",
                "close": "Fermer",
                "back": "Retour",
                "cancel": "Annuler",
                "execute": "Exécuter",
                "convert": "Convertir",
                "continue": "Continuer",
                "processing": "Traitement...",
                "preparing": "Préparation...",
                "selectOperation": "Sélectionner l'Opération",
                "installApp": "Installer App",
                
                // Opérations
                "reduceSize": "Réduire la Taille",
                "cutVideo": "Couper la Vidéo",
                "convertVideo": "Convertir la Vidéo",
                "reverseVideo": "Inverser la Vidéo",
                "convertToJPG": "Convertir en JPG",
                "mergeVideos": "Fusionner les Vidéos",
                
                // Titres des panneaux
                "reduceVideoSize": "Réduire la Taille de la Vidéo",
                "cutVideoTitle": "Couper la Vidéo",
                "convertVideoTitle": "Convertir le Format de Vidéo",
                "reverseVideoTitle": "Inverser la Vidéo",
                
                // Champs communs
                "selectVideo": "Sélectionner la Vidéo:",
                "quality": "Qualité:",
                "outputFormat": "Format de Sortie:",
                "keepBackup": "Garder une copie de l'original",
                "fileSelected": "Fichier sélectionné:",
                
                // Réduction de taille
                "pcQuality": "Qualité PC",
                "tabletQuality": "Qualité Tablet", 
                "mobileQuality": "Qualité Mobile",
                "highQuality": "Haute (réduction minimale)",
                "mediumQuality": "Moyenne (réduction équilibrée)",
                "lowQuality": "Basse (réduction maximale)",
                
                // Couper vidéo
                "startTime": "Heure de Début:",
                "endTime": "Heure de Fin:",
                "duration": "Durée:",
                "timeFormat": "Format HH:MM:SS",
                "timeExample": "Exemple: 00:01:30",
                "getDuration": "Obtenir la Durée",
                "fullVideo": "Vidéo complète",
                "cutSettings": "Paramètres de Coupe",
                
                // Convertir vidéo
                "selectFormat": "Sélectionner le Format:",
                "outputDirectory": "Répertoire de Destination:",
                "sameDirectory": "Même dossier que l'original",
                "browseDirectory": "Parcourir le dossier...",
                "supportedFormats": "Formats supportés:",
                "formatMP4": "MP4 - Format standard",
                "formatMOV": "MOV - Format Apple",
                "formatAVI": "AVI - Format conteneur",
                "formatMKV": "MKV - Format ouvert",
                "formatWEBM": "WebM - Pour le web",
                "formatFLV": "FLV - Flash Video",
                "formatWMV": "WMV - Windows Media",
                "formatM4V": "M4V - iTunes",
                "formatMPG": "MPG - MPEG",
                "formatMPEG": "MPEG - MPEG",
                
                // Inverser vidéo
                "reverseDescription": "La vidéo sera lue à l'envers",
                "preserveMetadata": "Préserver les métadonnées",
                "includeAudio": "Inclure l'audio",
                
                // Instructions FFMPEG
                "ffmpegInstructions": "Instructions FFMPEG",
                "instruction1": "En raison des limitations de JavaScript, nous avons besoin de votre intervention pour exécuter FFMPEG.",
                "instruction2": "Veuillez suivre ces étapes:",
                "instruction3": "Cliquez sur 'Continuer' pour sélectionner le répertoire",
                "instruction4": "Sélectionnez le dossier où se trouve votre fichier vidéo",
                "instruction5": "Dans l'explorateur, dans la barre d'adresse tapez: CMD",
                "instruction6": "Dans le terminal, collez la commande avec Ctrl+V et appuyez sur Entrée",
                "commandToExecute": "Commande à exécuter:",
                "copyCommand": "Copier la Commande",
                "openExplorer": "Ouvrir l'Explorateur dans le Répertoire",
                "note": "Note: La commande sera automatiquement copiée en cliquant sur 'Continuer'",
                
                // Aide
                "helpContent": `
                    <p>Cette application permet d'effectuer différentes opérations sur les vidéos en utilisant FFMPEG.</p>
                    <p><strong>Fonctions disponibles:</strong></p>
                    <ul>
                        <li>Réduire la taille de la vidéo</li>
                        <li>Couper la vidéo (extraire un fragment)</li>
                        <li>Convertir le format (MP4, MOV, AVI, etc.)</li>
                        <li>Inverser la vidéo (lecture inversée)</li>
                        <li>Convertir en JPG</li>
                        <li>Fusionner les vidéos</li>
                    </ul>
                    <p>Pour effectuer une opération, vous aurez besoin d'une autorisation pour exécuter FFMPEG sur votre système.</p>
                    <p><strong>Exigences:</strong></p>
                    <ul>
                        <li>Windows 7 ou supérieur</li>
                        <li>Permissions d'administrateur (recommandé)</li>
                        <li>Espace disque suffisant</li>
                    </ul>
                    <p><strong>Instructions importantes:</strong></p>
                    <ol>
                        <li>Sélectionnez le fichier vidéo que vous souhaitez traiter</li>
                        <li>Configurez les paramètres selon vos besoins</li>
                        <li>Cliquez sur "Exécuter" pour générer la commande FFMPEG</li>
                        <li>Cliquez sur "Continuer" pour copier la commande et ouvrir l'explorateur</li>
                        <li>Sélectionnez le dossier où se trouve votre fichier vidéo</li>
                        <li>Dans la barre d'adresse de l'explorateur, tapez: CMD</li>
                        <li>Dans le terminal, collez la commande (Ctrl+V) et appuyez sur Entrée</li>
                    </ol>
                `,
                
                // Messages
                "selectFileFirst": "Veuillez d'abord sélectionner un fichier",
                "commandCopied": "Commande copiée dans le presse-papiers",
                "operationCompleted": "Opération terminée avec succès",
                "errorOccurred": "Une erreur s'est produite",
                "noFFMPEG": "ffmpeg.exe introuvable. Il sera copié automatiquement.",
                "explorerOpened": "Explorateur ouvert. Sélectionnez le dossier vidéo.",
                "directorySelected": "Répertoire sélectionné:",
                "navigateToDirectory": "Accédez au répertoire:",
                "openCmdHere": "Tapez CMD dans la barre d'adresse",
                "pasteCommand": "Collez la commande (Ctrl+V)",
                "executeCommand": "Exécutez la commande (Entrée)",
                "fullCommandCopied": "Commande complète copiée (inclut cd)",
                "commandAutoCopied": "Commande automatiquement copiée",
                "readyToPaste": "La commande est déjà dans votre presse-papiers",
                "justOpenCmdAndPaste": "Ouvrez simplement CMD et collez (Ctrl+V)",
                
                // Validations
                "invalidTimeFormat": "Format d'heure invalide. Utilisez HH:MM:SS",
                "startAfterEnd": "L'heure de début doit être antérieure à l'heure de fin",
                "invalidDuration": "Durée invalide",
                "selectFormatFirst": "Veuillez d'abord sélectionner un format",
                "processingVideo": "Traitement de la vidéo...",
                "estimatingTime": "Estimation du temps de traitement...",
                "preservingMetadata": "Préservation des métadonnées...",
                "includingGPS": "Inclusion des données GPS...",
                
                // Informations sur l'opération
                "operationInfoCut": "Découpage de la vidéo de {start} à {end}",
                "operationInfoConvert": "Conversion au format {format}",
                "operationInfoReverse": "Inversion de la vidéo",
                "outputFileWillBe": "Le fichier de sortie sera:",
                "originalPreserved": "Le fichier original sera préservé",
                "metadataPreserved": "Métadonnées (incluant GPS) préservées",
                


                "analyzing": "Analizando...",
                "durationDetected": "Duración detectada",
                "analysisFailed": "Análisis falló",

     
            }
        };
        
        this.currentLang = 'es';
        this.init();
    }
    
    init() {
        // Intentar cargar idioma guardado
        const savedLang = localStorage.getItem('videogest_language');
        if (savedLang && this.translations[savedLang]) {
            this.currentLang = savedLang;
        } else {
            // Detectar idioma del navegador
            const browserLang = navigator.language.substring(0, 2);
            if (this.translations[browserLang]) {
                this.currentLang = browserLang;
            }
        }
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('videogest_language', lang);
            this.applyTranslations();
            return true;
        }
        return false;
    }
    
    get(key) {
        const langData = this.translations[this.currentLang];
        return langData[key] || this.translations['es'][key] || key;
    }
    
    applyTranslations() {
        // Traducir elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.get(key);
            
            if (element.tagName === 'INPUT' && element.type === 'checkbox') {
                // Para checkboxes, traducir el span siguiente
                const span = element.nextElementSibling;
                if (span && span.tagName === 'SPAN') {
                    span.textContent = translation;
                }
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else if (element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', translation);
            } else if (element.hasAttribute('title')) {
                element.setAttribute('title', translation);
            } else if (element.hasAttribute('aria-label')) {
                element.setAttribute('aria-label', translation);
            } else {
                // Para contenido HTML, usar innerHTML solo si la traducción contiene HTML
                if (translation.includes('<') && translation.includes('>')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Actualizar título
        document.title = this.get('appTitle');
        
        // Actualizar el atributo lang del html
        document.documentElement.lang = this.currentLang;
        
        // Disparar evento para notificar cambio de idioma
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        }));
    }
    
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
    
    // Método para traducir texto dinámico
    translateDynamicText(textKey, replacements = {}) {
        let translation = this.get(textKey);
        
        // Reemplazar placeholders si los hay
        Object.keys(replacements).forEach(key => {
            const placeholder = `{${key}}`;
            translation = translation.replace(new RegExp(placeholder, 'g'), replacements[key]);
        });
        
        return translation;
    }
    
    // Método para obtener todas las traducciones de una sección
    getSectionTranslations(sectionPrefix) {
        const sectionTranslations = {};
        const langData = this.translations[this.currentLang];
        
        Object.keys(langData).forEach(key => {
            if (key.startsWith(sectionPrefix)) {
                const cleanKey = key.replace(sectionPrefix, '');
                sectionTranslations[cleanKey] = langData[key];
            }
        });
        
        return sectionTranslations;
    }
}

// Crear instancia global
window.videoGestTranslations = new VideoGestTranslations();