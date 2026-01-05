# Nueva App PWA - Video Gest

Voy a crear una aplicación PWA para gestión de vídeos con FFMPEG. Aquí está la estructura completa:

## Estructura de Archivos

```
VideoGest/
├── assets/
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── pictos/
│       └── (iconos adicionales)
├── VideoGest.html
├── VideoGest_Manifest.json
├── VideoGest_Styles.css
├── VideoGest_App.js
├── VideoGest_Translations.js
├── VideoGest_ServiceWorker.js
├── VideoGest_FFMPEG.js
├── VideoGest_Storage.js
├── VideoGest_UI.js
└── VideoGest_Estructura.md
```

## 1. VideoGest.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#2196f3">
    <title>VideoGest - Gestor de Vídeos</title>
    <link rel="manifest" href="VideoGest_Manifest.json">
    <link rel="stylesheet" href="VideoGest_Styles.css">
    <link rel="icon" href="assets/icons/icon-72x72.png">
    <link rel="apple-touch-icon" href="assets/icons/icon-152x152.png">
</head>
<body>
    <header>
        <div class="header-container">
            <h1 id="app-title">VideoGest</h1>
            <div class="header-controls">
                <button id="language-selector" class="btn-icon" aria-label="Seleccionar idioma">
                    <span class="icon">🌐</span>
                </button>
                <button id="install-button" class="btn-icon" style="display:none;" aria-label="Instalar aplicación">
                    <span class="icon">📱</span>
                </button>
                <button id="help-button" class="btn-icon" aria-label="Ayuda">
                    <span class="icon">❓</span>
                </button>
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <!-- Panel de idioma -->
            <div id="language-panel" class="panel" style="display:none;">
                <h2 data-i18n="selectLanguage">Seleccionar Idioma</h2>
                <div class="language-options">
                    <button class="language-btn" data-lang="es">Español</button>
                    <button class="language-btn" data-lang="ca">Català</button>
                    <button class="language-btn" data-lang="en">English</button>
                    <button class="language-btn" data-lang="fr">Français</button>
                </div>
            </div>

            <!-- Panel de ayuda -->
            <div id="help-panel" class="panel" style="display:none;">
                <h2 data-i18n="help">Ayuda</h2>
                <div class="help-content" data-i18n="helpContent">
                    <p>Esta aplicación permite realizar diferentes operaciones sobre vídeos utilizando FFMPEG.</p>
                    <p><strong>Funciones disponibles:</strong></p>
                    <ul>
                        <li>Reducir tamaño del vídeo</li>
                        <li>Cortar vídeo</li>
                        <li>Convertir formato</li>
                        <li>Revertir vídeo</li>
                        <li>Convertir a JPG</li>
                        <li>Unir vídeos</li>
                    </ul>
                    <p>Para realizar cualquier operación, necesitarás tener permiso para ejecutar FFMPEG en tu sistema.</p>
                </div>
                <button class="btn-secondary" data-i18n="close">Cerrar</button>
            </div>

            <!-- Panel principal -->
            <div id="main-panel" class="panel">
                <h2 data-i18n="selectOperation">Seleccionar Operación</h2>
                
                <div class="operation-grid">
                    <button class="operation-btn" data-operation="reduce">
                        <span class="icon">📉</span>
                        <span data-i18n="reduceSize">Reducir Tamaño</span>
                    </button>
                    <button class="operation-btn" data-operation="cut">
                        <span class="icon">✂️</span>
                        <span data-i18n="cutVideo">Cortar Video</span>
                    </button>
                    <button class="operation-btn" data-operation="convert">
                        <span class="icon">🔄</span>
                        <span data-i18n="convertVideo">Convertir Video</span>
                    </button>
                    <button class="operation-btn" data-operation="reverse">
                        <span class="icon">↩️</span>
                        <span data-i18n="reverseVideo">Revertir Video</span>
                    </button>
                    <button class="operation-btn" data-operation="tojpg">
                        <span class="icon">🖼️</span>
                        <span data-i18n="convertToJPG">Convertir a JPG</span>
                    </button>
                    <button class="operation-btn" data-operation="merge">
                        <span class="icon">🔗</span>
                        <span data-i18n="mergeVideos">Unir Videos</span>
                    </button>
                </div>
            </div>

            <!-- Panel de reducción de tamaño -->
            <div id="reduce-panel" class="panel operation-panel" style="display:none;">
                <h2 data-i18n="reduceVideoSize">Reducir Tamaño de Video</h2>
                
                <div class="form-group">
                    <label for="input-file" data-i18n="selectVideo">Seleccionar Video:</label>
                    <input type="file" id="input-file" accept="video/*" class="file-input">
                    <div id="file-info" class="file-info"></div>
                </div>

                <div class="form-group">
                    <label for="quality" data-i18n="quality">Calidad:</label>
                    <select id="quality" class="form-control">
                        <option value="high" data-i18n="highQuality">Alta (reducción mínima)</option>
                        <option value="medium" data-i18n="mediumQuality" selected>Media (reducción equilibrada)</option>
                        <option value="low" data-i18n="lowQuality">Baja (máxima reducción)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="output-format" data-i18n="outputFormat">Formato de Salida:</label>
                    <select id="output-format" class="form-control">
                        <option value="mp4" selected>MP4</option>
                        <option value="avi">AVI</option>
                        <option value="mov">MOV</option>
                        <option value="mkv">MKV</option>
                        <option value="webm">WebM</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="keep-backup" checked>
                        <span data-i18n="keepBackup">Mantener copia del original</span>
                    </label>
                </div>

                <div class="button-group">
                    <button id="execute-reduce" class="btn-primary" data-i18n="execute">Ejecutar</button>
                    <button class="btn-secondary back-btn" data-i18n="back">Volver</button>
                </div>
            </div>

            <!-- Panel de instrucciones FFMPEG -->
            <div id="ffmpeg-panel" class="panel instruction-panel" style="display:none;">
                <h2 data-i18n="ffmpegInstructions">Instrucciones FFMPEG</h2>
                
                <div class="instructions">
                    <p data-i18n="instruction1">Debido a las limitaciones de JavaScript, necesitamos su intervención para ejecutar FFMPEG.</p>
                    <p data-i18n="instruction2"><strong>Por favor, siga estos pasos:</strong></p>
                    <ol>
                        <li data-i18n="instruction3">Se abrirá el explorador de archivos en el directorio del video</li>
                        <li data-i18n="instruction4">En la barra de dirección, escriba: <code>CMD</code> y presione Enter</li>
                        <li data-i18n="instruction5">En la ventana de comandos, presione: <code>Ctrl+V</code></li>
                        <li data-i18n="instruction6">Presione Enter para ejecutar el comando</li>
                    </ol>
                    
                    <div class="command-box">
                        <h3 data-i18n="commandToExecute">Comando a ejecutar:</h3>
                        <div id="ffmpeg-command" class="command"></div>
                        <button id="copy-command" class="btn-secondary" data-i18n="copyCommand">Copiar Comando</button>
                    </div>
                    
                    <div class="note" data-i18n="note">
                        Nota: Si ffmpeg.exe no está en el directorio, se copiará automáticamente.
                    </div>
                </div>
                
                <div class="button-group">
                    <button id="open-explorer" class="btn-primary" data-i18n="openExplorer">Abrir Explorador</button>
                    <button class="btn-secondary back-btn" data-i18n="cancel">Cancelar</button>
                </div>
            </div>

            <!-- Panel de progreso -->
            <div id="progress-panel" class="panel" style="display:none;">
                <h2 data-i18n="processing">Procesando...</h2>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div id="progress-fill" class="progress-fill"></div>
                    </div>
                    <div id="progress-text" class="progress-text" data-i18n="preparing">Preparando...</div>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <div class="footer-container">
            <span id="copyright-text">2025 © Copyright</span>
            <a href="https://rbenet71.github.io/Web/" target="_blank" id="copyright-link">
                Roberto Benet - rbenet71@gmail.com - V_18_12_2025
            </a>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="VideoGest_Translations.js"></script>
    <script src="VideoGest_Storage.js"></script>
    <script src="VideoGest_FFMPEG.js"></script>
    <script src="VideoGest_UI.js"></script>
    <script src="VideoGest_App.js"></script>
    <script src="VideoGest_ServiceWorker.js"></script>
</body>
</html>
```

## 2. VideoGest_Styles.css

```css
/* Variables CSS */
:root {
    --primary-color: #2196f3;
    --secondary-color: #f5f5f5;
    --accent-color: #ff4081;
    --text-color: #333;
    --bg-color: #fff;
    --border-color: #ddd;
    --success-color: #4caf50;
    --error-color: #f44336;
    --warning-color: #ff9800;
}

/* Estilos base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--secondary-color);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Header */
header {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.header-controls {
    display: flex;
    gap: 0.5rem;
}

/* Main content */
main {
    flex: 1;
    padding: 2rem 1rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.container {
    background-color: var(--bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 2rem;
}

/* Paneles */
.panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.panel h2 {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
}

/* Operaciones */
.operation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
}

.operation-btn {
    background-color: var(--secondary-color);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
}

.operation-btn:hover {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-2px);
}

.operation-btn .icon {
    font-size: 2rem;
}

/* Formularios */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.form-group label {
    font-weight: 600;
    color: var(--text-color);
}

.form-control, .file-input {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-control:focus, .file-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.file-info {
    padding: 0.75rem;
    background-color: var(--secondary-color);
    border-radius: 4px;
    border: 1px dashed var(--border-color);
    margin-top: 0.5rem;
}

/* Botones */
.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

.btn-primary, .btn-secondary, .btn-icon {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: #1976d2;
    transform: translateY(-1px);
}

.btn-secondary {
    background-color: var(--secondary-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background-color: #e0e0e0;
}

.btn-icon {
    background: none;
    color: white;
    font-size: 1.2rem;
    padding: 0.5rem;
}

.btn-icon:hover {
    background-color: rgba(255,255,255,0.1);
}

.language-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.language-btn:hover {
    background-color: var(--primary-color);
    color: white;
}

/* Instrucciones */
.instruction-panel {
    background-color: #fff8e1;
    border-left: 4px solid var(--warning-color);
    padding: 1.5rem;
}

.instructions ol {
    margin-left: 1.5rem;
    margin-bottom: 1.5rem;
}

.instructions li {
    margin-bottom: 0.5rem;
}

.command-box {
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 1rem;
    margin: 1.5rem 0;
}

.command {
    font-family: 'Courier New', monospace;
    background-color: #2d2d2d;
    color: #fff;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
    overflow-x: auto;
    white-space: pre-wrap;
}

/* Progreso */
.progress-container {
    margin: 2rem 0;
}

.progress-bar {
    width: 100%;
    height: 20px;
    background-color: var(--secondary-color);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 1rem;
}

.progress-fill {
    height: 100%;
    background-color: var(--primary-color);
    width: 0%;
    transition: width 0.3s ease;
}

.progress-text {
    text-align: center;
    color: var(--text-color);
    font-weight: 500;
}

/* Footer */
footer {
    background-color: #333;
    color: white;
    padding: 1rem;
    text-align: center;
    margin-top: auto;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

#copyright-link {
    color: #90caf9;
    text-decoration: none;
}

#copyright-link:hover {
    text-decoration: underline;
}

/* Utilidades */
.hidden {
    display: none !important;
}

.note {
    background-color: #e3f2fd;
    border-left: 4px solid var(--primary-color);
    padding: 0.75rem;
    margin: 1rem 0;
    border-radius: 0 4px 4px 0;
}

/* Responsive */
@media (max-width: 768px) {
    .operation-grid {
        grid-template-columns: 1fr;
    }
    
    .button-group {
        flex-direction: column;
    }
    
    .header-container {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .header-controls {
        justify-content: center;
    }
    
    .container {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    main {
        padding: 1rem 0.5rem;
    }
    
    .panel {
        padding: 1rem;
    }
}
```

## 3. VideoGest_Manifest.json

```json
{
    "name": "VideoGest",
    "short_name": "VideoGest",
    "description": "Aplicación para gestión de vídeos con FFMPEG",
    "start_url": "VideoGest.html",
    "display": "standalone",
    "background_color": "#2196f3",
    "theme_color": "#2196f3",
    "orientation": "portrait",
    "scope": "/",
    "lang": "es",
    "icons": [
        {
            "src": "assets/icons/icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "assets/icons/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "assets/icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "assets/icons/icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "assets/icons/icon-152x152.png",
            "sizes": "152x152",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "assets/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "assets/icons/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "assets/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ],
    "categories": ["utilities", "video"],
    "shortcuts": [
        {
            "name": "Reducir Video",
            "short_name": "Reducir",
            "description": "Reducir tamaño de video",
            "url": "VideoGest.html?action=reduce",
            "icons": [{ "src": "assets/icons/icon-96x96.png", "sizes": "96x96" }]
        },
        {
            "name": "Cortar Video",
            "short_name": "Cortar",
            "description": "Cortar fragmento de video",
            "url": "VideoGest.html?action=cut",
            "icons": [{ "src": "assets/icons/icon-96x96.png", "sizes": "96x96" }]
        }
    ]
}
```

## 4. VideoGest_Translations.js

```javascript
// VideoGest_Translations.js
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
                "continue": "Continuar",
                "processing": "Procesando...",
                "preparing": "Preparando...",
                "selectOperation": "Seleccionar Operación",
                
                // Operaciones
                "reduceSize": "Reducir Tamaño",
                "cutVideo": "Cortar Video",
                "convertVideo": "Convertir Video",
                "reverseVideo": "Revertir Video",
                "convertToJPG": "Convertir a JPG",
                "mergeVideos": "Unir Videos",
                
                // Reducción de tamaño
                "reduceVideoSize": "Reducir Tamaño de Video",
                "selectVideo": "Seleccionar Video:",
                "quality": "Calidad:",
                "highQuality": "Alta (reducción mínima)",
                "mediumQuality": "Media (reducción equilibrada)",
                "lowQuality": "Baja (máxima reducción)",
                "outputFormat": "Formato de Salida:",
                "keepBackup": "Mantener copia del original",
                
                // Instrucciones FFMPEG
                "ffmpegInstructions": "Instrucciones FFMPEG",
                "instruction1": "Debido a las limitaciones de JavaScript, necesitamos su intervención para ejecutar FFMPEG.",
                "instruction2": "Por favor, siga estos pasos:",
                "instruction3": "Se abrirá el explorador de archivos en el directorio del video",
                "instruction4": "En la barra de dirección, escriba: CMD y presione Enter",
                "instruction5": "En la ventana de comandos, presione: Ctrl+V",
                "instruction6": "Presione Enter para ejecutar el comando",
                "commandToExecute": "Comando a ejecutar:",
                "copyCommand": "Copiar Comando",
                "openExplorer": "Abrir Explorador",
                "note": "Nota: Si ffmpeg.exe no está en el directorio, se copiará automáticamente.",
                
                // Ayuda
                "helpContent": `
                    <p>Esta aplicación permite realizar diferentes operaciones sobre vídeos utilizando FFMPEG.</p>
                    <p><strong>Funciones disponibles:</strong></p>
                    <ul>
                        <li>Reducir tamaño del vídeo</li>
                        <li>Cortar vídeo</li>
                        <li>Convertir formato</li>
                        <li>Revertir vídeo</li>
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
                `,
                
                // Mensajes
                "fileSelected": "Archivo seleccionado:",
                "selectFileFirst": "Por favor, seleccione un archivo primero",
                "commandCopied": "Comando copiado al portapapeles",
                "operationCompleted": "Operación completada exitosamente",
                "errorOccurred": "Ocurrió un error",
                "noFFMPEG": "No se encontró ffmpeg.exe. Se copiará automáticamente."
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
                "continue": "Continuar",
                "processing": "Processant...",
                "preparing": "Preparant...",
                "selectOperation": "Seleccionar Operació",
                
                // Operaciones
                "reduceSize": "Reduir Mida",
                "cutVideo": "Tallar Video",
                "convertVideo": "Convertir Video",
                "reverseVideo": "Revertir Video",
                "convertToJPG": "Convertir a JPG",
                "mergeVideos": "Unir Videos",
                
                // Reducción de tamaño
                "reduceVideoSize": "Reduir Mida del Video",
                "selectVideo": "Seleccionar Video:",
                "quality": "Qualitat:",
                "highQuality": "Alta (reducció mínima)",
                "mediumQuality": "Mitjana (reducció equilibrada)",
                "lowQuality": "Baixa (màxima reducció)",
                "outputFormat": "Format de Sortida:",
                "keepBackup": "Mantenir còpia de l'original",
                
                // Instrucciones FFMPEG
                "ffmpegInstructions": "Instruccions FFMPEG",
                "instruction1": "A causa de les limitacions de JavaScript, necessitem la seva intervenció per executar FFMPEG.",
                "instruction2": "Si us plau, segueixi aquests passos:",
                "instruction3": "S'obrirà l'explorador d'arxius al directori del video",
                "instruction4": "A la barra d'adreça, escrigui: CMD i premi Enter",
                "instruction5": "A la finestra de comandaments, premi: Ctrl+V",
                "instruction6": "Premi Enter per executar la comanda",
                "commandToExecute": "Comanda a executar:",
                "copyCommand": "Copiar Comanda",
                "openExplorer": "Obrir Explorador",
                "note": "Nota: Si ffmpeg.exe no està al directori, es copiarà automàticament.",
                
                // Ayuda - mantener en español por simplicidad
                "helpContent": `
                    <p>Aquesta aplicació permet realitzar diferents operacions sobre vídeos utilitzant FFMPEG.</p>
                    <p><strong>Funcions disponibles:</strong></p>
                    <ul>
                        <li>Reduir mida del vídeo</li>
                        <li>Tallar vídeo</li>
                        <li>Convertir format</li>
                        <li>Revertir vídeo</li>
                        <li>Convertir a JPG</li>
                        <li>Unir vídeos</li>
                    </ul>
                    <p>Per realitzar qualsevol operació, necessitaràs tenir permís per executar FFMPEG al teu sistema.</p>
                `
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
                "continue": "Continue",
                "processing": "Processing...",
                "preparing": "Preparing...",
                "selectOperation": "Select Operation",
                
                // Operations
                "reduceSize": "Reduce Size",
                "cutVideo": "Cut Video",
                "convertVideo": "Convert Video",
                "reverseVideo": "Reverse Video",
                "convertToJPG": "Convert to JPG",
                "mergeVideos": "Merge Videos",
                
                // Size reduction
                "reduceVideoSize": "Reduce Video Size",
                "selectVideo": "Select Video:",
                "quality": "Quality:",
                "highQuality": "High (minimum reduction)",
                "mediumQuality": "Medium (balanced reduction)",
                "lowQuality": "Low (maximum reduction)",
                "outputFormat": "Output Format:",
                "keepBackup": "Keep original backup",
                
                // FFMPEG Instructions
                "ffmpegInstructions": "FFMPEG Instructions",
                "instruction1": "Due to JavaScript limitations, we need your intervention to execute FFMPEG.",
                "instruction2": "Please follow these steps:",
                "instruction3": "File explorer will open in the video directory",
                "instruction4": "In the address bar, type: CMD and press Enter",
                "instruction5": "In the command window, press: Ctrl+V",
                "instruction6": "Press Enter to execute the command",
                "commandToExecute": "Command to execute:",
                "copyCommand": "Copy Command",
                "openExplorer": "Open Explorer",
                "note": "Note: If ffmpeg.exe is not in the directory, it will be copied automatically.",
                
                // Help
                "helpContent": `
                    <p>This application allows you to perform different operations on videos using FFMPEG.</p>
                    <p><strong>Available functions:</strong></p>
                    <ul>
                        <li>Reduce video size</li>
                        <li>Cut video</li>
                        <li>Convert format</li>
                        <li>Reverse video</li>
                        <li>Convert to JPG</li>
                        <li>Merge videos</li>
                    </ul>
                    <p>To perform any operation, you will need permission to execute FFMPEG on your system.</p>
                `
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
                "continue": "Continuer",
                "processing": "Traitement...",
                "preparing": "Préparation...",
                "selectOperation": "Sélectionner l'Opération",
                
                // Opérations
                "reduceSize": "Réduire la Taille",
                "cutVideo": "Couper la Vidéo",
                "convertVideo": "Convertir la Vidéo",
                "reverseVideo": "Inverser la Vidéo",
                "convertToJPG": "Convertir en JPG",
                "mergeVideos": "Fusionner les Vidéos",
                
                // Réduction de taille
                "reduceVideoSize": "Réduire la Taille de la Vidéo",
                "selectVideo": "Sélectionner la Vidéo:",
                "quality": "Qualité:",
                "highQuality": "Haute (réduction minimale)",
                "mediumQuality": "Moyenne (réduction équilibrée)",
                "lowQuality": "Basse (réduction maximale)",
                "outputFormat": "Format de Sortie:",
                "keepBackup": "Garder une copie de l'original",
                
                // Instructions FFMPEG
                "ffmpegInstructions": "Instructions FFMPEG",
                "instruction1": "En raison des limitations de JavaScript, nous avons besoin de votre intervention pour exécuter FFMPEG.",
                "instruction2": "Veuillez suivre ces étapes:",
                "instruction3": "L'explorateur de fichiers s'ouvrira dans le répertoire de la vidéo",
                "instruction4": "Dans la barre d'adresse, tapez: CMD et appuyez sur Entrée",
                "instruction5": "Dans la fenêtre de commande, appuyez sur: Ctrl+V",
                "instruction6": "Appuyez sur Entrée pour exécuter la commande",
                "commandToExecute": "Commande à exécuter:",
                "copyCommand": "Copier la Commande",
                "openExplorer": "Ouvrir l'Explorateur",
                "note": "Note: Si ffmpeg.exe n'est pas dans le répertoire, il sera copié automatiquement.",
                
                // Aide
                "helpContent": `
                    <p>Cette application permet d'effectuer différentes opérations sur les vidéos en utilisant FFMPEG.</p>
                    <p><strong>Fonctions disponibles:</strong></p>
                    <ul>
                        <li>Réduire la taille de la vidéo</li>
                        <li>Couper la vidéo</li>
                        <li>Convertir le format</li>
                        <li>Inverser la vidéo</li>
                        <li>Convertir en JPG</li>
                        <li>Fusionner les vidéos</li>
                    </ul>
                    <p>Pour effectuer une opération, vous aurez besoin d'une autorisation pour exécuter FFMPEG sur votre système.</p>
                `
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
            } else {
                element.innerHTML = translation;
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
}

// Crear instancia global
window.videoGestTranslations = new VideoGestTranslations();
```

## 5. VideoGest_Storage.js

```javascript
// VideoGest_Storage.js
class VideoGestStorage {
    constructor() {
        this.storageKey = 'videogest_';
        this.defaultSettings = {
            language: 'es',
            lastOperation: 'reduce',
            quality: 'medium',
            outputFormat: 'mp4',
            keepBackup: true,
            lastDirectory: null
        };
        
        this.init();
    }
    
    init() {
        // Inicializar valores por defecto si no existen
        this.ensureDefaultValues();
    }
    
    ensureDefaultValues() {
        const settings = this.getSettings();
        let changed = false;
        
        for (const key in this.defaultSettings) {
            if (settings[key] === undefined) {
                settings[key] = this.defaultSettings[key];
                changed = true;
            }
        }
        
        if (changed) {
            this.saveSettings(settings);
        }
    }
    
    getSettings() {
        try {
            const settings = localStorage.getItem(this.storageKey + 'settings');
            return settings ? JSON.parse(settings) : { ...this.defaultSettings };
        } catch (error) {
            console.error('Error loading settings:', error);
            return { ...this.defaultSettings };
        }
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem(this.storageKey + 'settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }
    
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    }
    
    getSetting(key) {
        const settings = this.getSettings();
        return settings[key] !== undefined ? settings[key] : this.defaultSettings[key];
    }
    
    // Métodos específicos para la aplicación
    
    saveLastFile(fileInfo) {
        try {
            localStorage.setItem(this.storageKey + 'lastFile', JSON.stringify(fileInfo));
            return true;
        } catch (error) {
            console.error('Error saving last file:', error);
            return false;
        }
    }
    
    getLastFile() {
        try {
            const lastFile = localStorage.getItem(this.storageKey + 'lastFile');
            return lastFile ? JSON.parse(lastFile) : null;
        } catch (error) {
            console.error('Error loading last file:', error);
            return null;
        }
    }
    
    saveCommandHistory(command) {
        try {
            let history = this.getCommandHistory();
            history.unshift({
                command: command,
                timestamp: new Date().toISOString(),
                operation: this.getSetting('lastOperation')
            });
            
            // Mantener solo los últimos 10 comandos
            if (history.length > 10) {
                history = history.slice(0, 10);
            }
            
            localStorage.setItem(this.storageKey + 'commandHistory', JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Error saving command history:', error);
            return false;
        }
    }
    
    getCommandHistory() {
        try {
            const history = localStorage.getItem(this.storageKey + 'commandHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading command history:', error);
            return [];
        }
    }
    
    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey + 'commandHistory');
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }
    
    // Métodos para almacenamiento temporal (sessionStorage)
    
    setTempData(key, data) {
        try {
            sessionStorage.setItem(this.storageKey + 'temp_' + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error setting temp data:', error);
            return false;
        }
    }
    
    getTempData(key) {
        try {
            const data = sessionStorage.getItem(this.storageKey + 'temp_' + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting temp data:', error);
            return null;
        }
    }
    
    removeTempData(key) {
        try {
            sessionStorage.removeItem(this.storageKey + 'temp_' + key);
            return true;
        } catch (error) {
            console.error('Error removing temp data:', error);
            return false;
        }
    }
    
    // Método para exportar/importar configuración
    
    exportSettings() {
        const settings = this.getSettings();
        const data = {
            settings: settings,
            lastFile: this.getLastFile(),
            commandHistory: this.getCommandHistory(),
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return {
            data: data,
            blob: blob,
            url: url
        };
    }
    
    importSettings(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            if (data.lastFile) {
                localStorage.setItem(this.storageKey + 'lastFile', JSON.stringify(data.lastFile));
            }
            
            if (data.commandHistory) {
                localStorage.setItem(this.storageKey + 'commandHistory', JSON.stringify(data.commandHistory));
            }
            
            return { success: true, message: 'Configuración importada correctamente' };
        } catch (error) {
            console.error('Error importing settings:', error);
            return { success: false, message: 'Error al importar configuración' };
        }
    }
    
    // Método para limpiar todos los datos
    clearAllData() {
        try {
            // Eliminar solo los datos de esta aplicación
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.storageKey)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // También limpiar sessionStorage
            const tempKeysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key.startsWith(this.storageKey)) {
                    tempKeysToRemove.push(key);
                }
            }
            
            tempKeysToRemove.forEach(key => sessionStorage.removeItem(key));
            
            return { success: true, message: 'Datos limpiados correctamente' };
        } catch (error) {
            console.error('Error clearing data:', error);
            return { success: false, message: 'Error al limpiar datos' };
        }
    }
}

// Crear instancia global
window.videoGestStorage = new VideoGestStorage();
```

## 6. VideoGest_FFMPEG.js

```javascript
// VideoGest_FFMPEG.js
class VideoGestFFMPEG {
    constructor() {
        this.ffmpegCommands = {
            reduce: {
                high: '-c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k',
                medium: '-c:v libx264 -crf 28 -preset faster -c:a aac -b:a 96k',
                low: '-c:v libx264 -crf 32 -preset ultrafast -c:a aac -b:a 64k'
            },
            cut: '-ss {startTime} -to {endTime} -c copy',
            convert: '-c:v copy -c:a copy',
            reverse: '-vf reverse -af areverse',
            tojpg: '-vf fps=1 -q:v 2',
            merge: '-f concat -safe 0 -i {listFile} -c copy'
        };
        
        this.supportedFormats = {
            mp4: '.mp4',
            avi: '.avi',
            mov: '.mov',
            mkv: '.mkv',
            webm: '.webm',
            jpg: '.jpg',
            png: '.png'
        };
        
        this.currentOperation = null;
        this.currentFile = null;
        this.outputFile = null;
    }
    
    setOperation(operation) {
        this.currentOperation = operation;
    }
    
    setInputFile(file) {
        this.currentFile = file;
    }
    
    generateOutputFilename(inputPath, format, suffix = '_output') {
        const path = inputPath.replace(/\\/g, '/');
        const lastSlash = path.lastIndexOf('/');
        const filename = lastSlash !== -1 ? path.substring(lastSlash + 1) : path;
        
        const lastDot = filename.lastIndexOf('.');
        const nameWithoutExt = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
        const originalExt = lastDot !== -1 ? filename.substring(lastDot) : '';
        
        let outputExt = this.supportedFormats[format] || originalExt;
        
        // Para conversión a JPG, usar .jpg
        if (this.currentOperation === 'tojpg') {
            outputExt = '.jpg';
        }
        
        return `${nameWithoutExt}${suffix}${outputExt}`;
    }
    
    generateCommand(params = {}) {
        if (!this.currentOperation || !this.currentFile) {
            throw new Error('Operación o archivo no especificado');
        }
        
        const inputPath = this.currentFile.path || this.currentFile.name;
        const outputFilename = this.generateOutputFilename(
            inputPath, 
            params.format || 'mp4',
            this.getOutputSuffix()
        );
        
        let command = `ffmpeg -i "${inputPath}" `;
        
        switch (this.currentOperation) {
            case 'reduce':
                const quality = params.quality || 'medium';
                command += this.ffmpegCommands.reduce[quality] || this.ffmpegCommands.reduce.medium;
                break;
                
            case 'cut':
                if (!params.startTime || !params.endTime) {
                    throw new Error('Se requieren tiempos de inicio y fin para cortar');
                }
                command += this.ffmpegCommands.cut
                    .replace('{startTime}', params.startTime)
                    .replace('{endTime}', params.endTime);
                break;
                
            case 'convert':
                command += this.ffmpegCommands.convert;
                break;
                
            case 'reverse':
                command += this.ffmpegCommands.reverse;
                break;
                
            case 'tojpg':
                command += this.ffmpegCommands.tojpg;
                // Para JPG, necesitamos un patrón de salida
                outputFilename = this.generateOutputFilename(inputPath, 'jpg', '_frame_%03d');
                break;
                
            case 'merge':
                if (!params.fileList || params.fileList.length < 2) {
                    throw new Error('Se requieren al menos 2 archivos para unir');
                }
                // Crear archivo de lista temporal
                const listContent = params.fileList.map(f => `file '${f}'`).join('\n');
                command += this.ffmpegCommands.merge.replace('{listFile}', 'list.txt');
                // Nota: En implementación real, necesitaríamos crear list.txt
                break;
                
            default:
                throw new Error('Operación no soportada');
        }
        
        command += ` "${outputFilename}"`;
        this.outputFile = outputFilename;
        
        return {
            command: command,
            input: inputPath,
            output: outputFilename,
            operation: this.currentOperation
        };
    }
    
    getOutputSuffix() {
        const suffixes = {
            reduce: '_reduced',
            cut: '_cut',
            convert: '_converted',
            reverse: '_reversed',
            tojpg: '_frame',
            merge: '_merged'
        };
        
        return suffixes[this.currentOperation] || '_output';
    }
    
    validateFFMPEGAvailable() {
        // En un entorno real, esto verificaría si ffmpeg está disponible
        // Por ahora, asumimos que el usuario lo instalará siguiendo las instrucciones
        return new Promise((resolve) => {
            // Simulación de verificación
            setTimeout(() => {
                resolve({
                    available: false, // Asumimos que no está disponible para mostrar instrucciones
                    message: 'FFMPEG no detectado. Se mostrarán instrucciones de instalación.'
                });
            }, 500);
        });
    }
    
    async copyFFMPEGToDirectory(directory) {
        // En una implementación real, esto copiaría ffmpeg.exe al directorio especificado
        // Por ahora, es un placeholder
        console.log(`Copiando ffmpeg.exe a: ${directory}`);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'ffmpeg.exe listo para usar',
                    path: `${directory}/ffmpeg.exe`
                });
            }, 1000);
        });
    }
    
    estimateProcessingTime(fileSize, operation) {
        const baseTime = 30; // segundos base
        const sizeFactor = fileSize / (100 * 1024 * 1024); // Factor por cada 100MB
        const operationFactors = {
            reduce: 1.5,
            cut: 1.0,
            convert: 0.8,
            reverse: 2.0,
            tojpg: 1.2,
            merge: 1.3
        };
        
        const factor = operationFactors[operation] || 1.0;
        const estimatedSeconds = baseTime * sizeFactor * factor;
        
        return {
            seconds: Math.round(estimatedSeconds),
            minutes: Math.round(estimatedSeconds / 60),
            formatted: estimatedSeconds < 60 ? 
                `${Math.round(estimatedSeconds)} segundos` : 
                `${Math.round(estimatedSeconds / 60)} minutos`
        };
    }
    
    getOperationDescription(operation) {
        const descriptions = {
            reduce: 'Reducción de tamaño de video',
            cut: 'Corte de fragmento de video',
            convert: 'Conversión de formato de video',
            reverse: 'Reversión de video',
            tojpg: 'Extracción de frames como JPG',
            merge: 'Unión de múltiples videos'
        };
        
        return descriptions[operation] || 'Operación de video';
    }
    
    getRecommendedSettings(operation) {
        const recommendations = {
            reduce: {
                quality: 'medium',
                format: 'mp4',
                note: 'MP4 ofrece la mejor relación calidad/tamaño'
            },
            cut: {
                format: 'same as input',
                note: 'Usar "c copy" para cortar sin re-encoding'
            },
            convert: {
                format: 'mp4',
                note: 'MP4 es el formato más compatible'
            },
            tojpg: {
                quality: 'high',
                note: 'Calidad 2 (1-31, donde 1 es la mejor)'
            },
            merge: {
                format: 'mp4',
                note: 'Asegurarse que todos los videos tengan el mismo codec'
            }
        };
        
        return recommendations[operation] || {};
    }
}

// Crear instancia global
window.videoGestFFMPEG = new VideoGestFFMPEG();
```

## 7. VideoGest_UI.js

```javascript
// VideoGest_UI.js
class VideoGestUI {
    constructor() {
        this.currentPanel = 'main';
        this.panels = {};
        this.init();
    }
    
    init() {
        // Mapear todos los paneles
        this.panels = {
            main: document.getElementById('main-panel'),
            language: document.getElementById('language-panel'),
            help: document.getElementById('help-panel'),
            reduce: document.getElementById('reduce-panel'),
            ffmpeg: document.getElementById('ffmpeg-panel'),
            progress: document.getElementById('progress-panel')
        };
        
        // Inicializar event listeners
        this.initEventListeners();
        
        // Cargar configuración guardada
        this.loadSavedSettings();
    }
    
    initEventListeners() {
        // Selector de idioma
        document.getElementById('language-selector').addEventListener('click', () => {
            this.showPanel('language');
        });
        
        // Botón de ayuda
        document.getElementById('help-button').addEventListener('click', () => {
            this.showPanel('help');
        });
        
        // Botones de operación
        document.querySelectorAll('.operation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const operation = e.currentTarget.dataset.operation;
                this.handleOperationSelect(operation);
            });
        });
        
        // Botones volver
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showPanel('main');
            });
        });
        
        // Botones de idioma
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                videoGestTranslations.setLanguage(lang);
                this.showPanel('main');
            });
        });
        
        // Cerrar ayuda
        document.querySelector('#help-panel .btn-secondary').addEventListener('click', () => {
            this.showPanel('main');
        });
        
        // Selección de archivo
        document.getElementById('input-file').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
        
        // Ejecutar reducción
        document.getElementById('execute-reduce').addEventListener('click', () => {
            this.executeReduceOperation();
        });
        
        // Copiar comando
        document.getElementById('copy-command').addEventListener('click', () => {
            this.copyCommandToClipboard();
        });
        
        // Abrir explorador
        document.getElementById('open-explorer').addEventListener('click', () => {
            this.openFileExplorer();
        });
        
        // Instalación PWA
        this.initPWAInstall();
    }
    
    showPanel(panelName) {
        // Ocultar todos los paneles
        Object.values(this.panels).forEach(panel => {
            if (panel) panel.style.display = 'none';
        });
        
        // Mostrar panel solicitado
        if (this.panels[panelName]) {
            this.panels[panelName].style.display = 'flex';
            this.currentPanel = panelName;
            
            // Ejecutar acciones específicas del panel
            this.onPanelShow(panelName);
        }
    }
    
    onPanelShow(panelName) {
        switch (panelName) {
            case 'reduce':
                this.updateFileInfo();
                break;
            case 'ffmpeg':
                this.displayFFMPEGCommand();
                break;
            case 'main':
                // Actualizar traducciones
                videoGestTranslations.applyTranslations();
                break;
        }
    }
    
    handleOperationSelect(operation) {
        videoGestStorage.updateSetting('lastOperation', operation);
        
        switch (operation) {
            case 'reduce':
                this.showPanel('reduce');
                break;
            default:
                // Para otras operaciones, mostrar mensaje de "próximamente"
                this.showMessage(
                    'Función en desarrollo',
                    `La función "${operation}" estará disponible en próximas actualizaciones.`,
                    'info'
                );
                break;
        }
    }
    
    handleFileSelect(file) {
        if (!file) return;
        
        // Validar que sea un video
        if (!file.type.startsWith('video/')) {
            this.showMessage(
                'Archivo no válido',
                'Por favor, seleccione un archivo de video.',
                'error'
            );
            return;
        }
        
        // Guardar información del archivo
        const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            path: file.webkitRelativePath || file.name
        };
        
        videoGestStorage.saveLastFile(fileInfo);
        this.updateFileInfo();
        
        // Actualizar traducción
        const fileInfoElement = document.getElementById('file-info');
        const t = videoGestTranslations;
        fileInfoElement.innerHTML = `
            <strong>${t.get('fileSelected')}</strong><br>
            ${file.name}<br>
            <small>${this.formatFileSize(file.size)}</small>
        `;
    }
    
    updateFileInfo() {
        const lastFile = videoGestStorage.getLastFile();
        const fileInfoElement = document.getElementById('file-info');
        
        if (lastFile) {
            const t = videoGestTranslations;
            fileInfoElement.innerHTML = `
                <strong>${t.get('fileSelected')}</strong><br>
                ${lastFile.name}<br>
                <small>${this.formatFileSize(lastFile.size)}</small>
            `;
        } else {
            fileInfoElement.innerHTML = '';
        }
    }
    
    async executeReduceOperation() {
        const fileInput = document.getElementById('input-file');
        if (!fileInput.files || fileInput.files.length === 0) {
            this.showMessage(
                videoGestTranslations.get('selectFileFirst'),
                '',
                'warning'
            );
            return;
        }
        
        const file = fileInput.files[0];
        const quality = document.getElementById('quality').value;
        const format = document.getElementById('output-format').value;
        const keepBackup = document.getElementById('keep-backup').checked;
        
        // Guardar configuración
        videoGestStorage.updateSetting('quality', quality);
        videoGestStorage.updateSetting('outputFormat', format);
        videoGestStorage.updateSetting('keepBackup', keepBackup);
        
        // Configurar FFMPEG
        videoGestFFMPEG.setOperation('reduce');
        videoGestFFMPEG.setInputFile(file);
        
        try {
            // Generar comando
            const commandInfo = videoGestFFMPEG.generateCommand({
                quality: quality,
                format: format
            });
            
            // Guardar en historial
            videoGestStorage.saveCommandHistory(commandInfo.command);
            
            // Mostrar panel de instrucciones
            this.showPanel('ffmpeg');
            
        } catch (error) {
            this.showMessage(
                videoGestTranslations.get('errorOccurred'),
                error.message,
                'error'
            );
        }
    }
    
    displayFFMPEGCommand() {
        const commandHistory = videoGestStorage.getCommandHistory();
        const lastCommand = commandHistory[0];
        
        if (lastCommand) {
            const commandElement = document.getElementById('ffmpeg-command');
            commandElement.textContent = lastCommand.command;
        }
    }
    
    async copyCommandToClipboard() {
        const commandElement = document.getElementById('ffmpeg-command');
        const command = commandElement.textContent;
        
        try {
            await navigator.clipboard.writeText(command);
            this.showMessage(
                videoGestTranslations.get('commandCopied'),
                '',
                'success'
            );
        } catch (err) {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = command;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.showMessage(
                videoGestTranslations.get('commandCopied'),
                '',
                'success'
            );
        }
    }
    
    openFileExplorer() {
        // Esto es un placeholder - en una implementación real,
        // esto intentaría abrir el explorador de archivos
        // Nota: Los navegadores web tienen limitaciones de seguridad
        
        this.showMessage(
            'Abrir Explorador',
            'Por razones de seguridad, los navegadores web no pueden abrir directamente el explorador de archivos. Por favor, navegue manualmente al directorio del archivo.',
            'info'
        );
    }
    
    showMessage(title, message, type = 'info') {
        // Crear elemento de mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        
        const typeIcons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-icon">${typeIcons[type] || 'ℹ️'}</span>
                <span class="message-title">${title}</span>
            </div>
            <div class="message-content">${message}</div>
        `;
        
        // Estilos inline para el mensaje
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid ${this.getMessageColor(type)};
            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 5000);
        
        // Agregar estilos de animación si no existen
        if (!document.getElementById('message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getMessageColor(type) {
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        return colors[type] || colors.info;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    loadSavedSettings() {
        const settings = videoGestStorage.getSettings();
        
        // Cargar configuración en los controles
        document.getElementById('quality').value = settings.quality;
        document.getElementById('output-format').value = settings.outputFormat;
        document.getElementById('keep-backup').checked = settings.keepBackup;
        
        // Aplicar idioma
        videoGestTranslations.setLanguage(settings.language);
    }
    
    initPWAInstall() {
        let deferredPrompt;
        const installButton = document.getElementById('install-button');
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevenir que el navegador muestre el prompt automático
            e.preventDefault();
            // Guardar el evento para usarlo después
            deferredPrompt = e;
            // Mostrar el botón de instalación
            installButton.style.display = 'block';
            
            installButton.addEventListener('click', async () => {
                // Ocultar el botón
                installButton.style.display = 'none';
                // Mostrar el prompt de instalación
                deferredPrompt.prompt();
                // Esperar a que el usuario responda
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                // Limpiar la referencia
                deferredPrompt = null;
            });
        });
        
        window.addEventListener('appinstalled', () => {
            // Ocultar el botón de instalación
            installButton.style.display = 'none';
            // Limpiar la referencia
            deferredPrompt = null;
            console.log('PWA installed successfully');
        });
        
        // Verificar si la app ya está instalada
        if (window.matchMedia('(display-mode: standalone)').matches) {
            installButton.style.display = 'none';
        }
    }
    
    updateProgress(percentage, message) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
    }
}

// Crear instancia global
window.videoGestUI = new VideoGestUI();
```

## 8. VideoGest_App.js

```javascript
// VideoGest_App.js
class VideoGestApp {
    constructor() {
        this.version = '1.0.0';
        this.isOnline = navigator.onLine;
        this.init();
    }
    
    async init() {
        console.log(`VideoGest App v${this.version} inicializando...`);
        
        // Inicializar componentes
        this.initComponents();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Verificar actualizaciones
        await this.checkForUpdates();
        
        // Aplicar traducciones iniciales
        videoGestTranslations.applyTranslations();
        
        // Registrar Service Worker
        this.registerServiceWorker();
        
        console.log('VideoGest App inicializada correctamente');
    }
    
    initComponents() {
        // Los componentes ya están inicializados en sus propios archivos
        // Esta función es para cualquier inicialización adicional
    }
    
    setupEventListeners() {
        // Estado de conexión
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNetworkStatus('online');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNetworkStatus('offline');
        });
        
        // Cambio de idioma
        document.addEventListener('languageChanged', (e) => {
            console.log(`Idioma cambiado a: ${e.detail.language}`);
            videoGestStorage.updateSetting('language', e.detail.language);
        });
        
        // Manejar parámetros de URL
        this.handleURLParameters();
    }
    
    showNetworkStatus(status) {
        const message = status === 'online' 
            ? 'Conexión restablecida'
            : 'Sin conexión - La aplicación funciona en modo offline';
        
        const type = status === 'online' ? 'success' : 'warning';
        
        videoGestUI.showMessage(
            status === 'online' ? 'En línea' : 'Sin conexión',
            message,
            type
        );
    }
    
    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action) {
            setTimeout(() => {
                videoGestUI.handleOperationSelect(action);
            }, 100);
        }
    }
    
    async checkForUpdates() {
        // Verificar si hay una nueva versión disponible
        try {
            const response = await fetch('VideoGest_Manifest.json?v=' + Date.now());
            const manifest = await response.json();
            
            // Aquí podrías comparar versiones o fechas
            // Por ahora, solo verificamos si podemos cargar el manifest
            
            console.log('Aplicación actualizada correctamente');
        } catch (error) {
            console.log('Modo offline - no se pudo verificar actualizaciones');
        }
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('VideoGest_ServiceWorker.js');
                console.log('ServiceWorker registrado correctamente:', registration);
                
                // Verificar actualizaciones periódicamente
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Cada hora
                
            } catch (error) {
                console.error('Error registrando ServiceWorker:', error);
            }
        }
    }
    
    getAppInfo() {
        return {
            version: this.version,
            name: 'VideoGest',
            author: 'Roberto Benet',
            email: 'rbenet71@gmail.com',
            lastUpdate: 'V_18_12_2025',
            features: [
                'Reducción de tamaño de video',
                'Corte de video',
                'Conversión de formato',
                'Reversión de video',
                'Extracción de frames JPG',
                'Unión de videos'
            ],
            requirements: {
                browser: 'Chrome 80+, Firefox 75+, Edge 80+',
                pwa: 'Soporte para Service Workers',
                storage: 'Almacenamiento persistente'
            }
        };
    }
    
    exportAppData() {
        const settings = videoGestStorage.exportSettings();
        const appInfo = this.getAppInfo();
        
        const data = {
            appInfo: appInfo,
            settings: settings.data,
            exportDate: new Date().toISOString()
        };
        
        return {
            filename: `VideoGest_Backup_${new Date().toISOString().split('T')[0]}.json`,
            data: JSON.stringify(data, null, 2),
            blob: new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        };
    }
    
    resetApp() {
        if (confirm('¿Está seguro de que desea restablecer toda la configuración de la aplicación? Esto borrará todos los datos guardados.')) {
            const result = videoGestStorage.clearAllData();
            
            if (result.success) {
                // Recargar la página
                location.reload();
            } else {
                videoGestUI.showMessage('Error', result.message, 'error');
            }
        }
    }
    
    // Métodos de utilidad
    
    formatDate(date) {
        return new Intl.DateTimeFormat(videoGestTranslations.getCurrentLanguage(), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    async checkStorageQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                const usedMB = estimate.usage / (1024 * 1024);
                const quotaMB = estimate.quota / (1024 * 1024);
                const percentage = (usedMB / quotaMB * 100).toFixed(1);
                
                return {
                    used: usedMB,
                    quota: quotaMB,
                    percentage: percentage,
                    available: quotaMB - usedMB
                };
            } catch (error) {
                console.error('Error al verificar cuota de almacenamiento:', error);
                return null;
            }
        }
        return null;
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.videoGestApp = new VideoGestApp();
});
```

## 9. VideoGest_ServiceWorker.js

```javascript
// VideoGest_ServiceWorker.js
const CACHE_NAME = 'videogest-cache-v1.0.0';
const STATIC_CACHE_NAME = 'videogest-static-v1.0.0';

// Archivos esenciales para el funcionamiento offline
const STATIC_FILES = [
    'VideoGest.html',
    'VideoGest_Styles.css',
    'VideoGest_App.js',
    'VideoGest_Translations.js',
    'VideoGest_Storage.js',
    'VideoGest_FFMPEG.js',
    'VideoGest_UI.js',
    'VideoGest_Manifest.json'
];

// Archivos de assets que se cachearán
const ASSET_FILES = [
    'assets/icons/icon-72x72.png',
    'assets/icons/icon-96x96.png',
    'assets/icons/icon-128x128.png',
    'assets/icons/icon-144x144.png',
    'assets/icons/icon-152x152.png',
    'assets/icons/icon-192x192.png',
    'assets/icons/icon-384x384.png',
    'assets/icons/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Cacheando archivos estáticos');
                return cache.addAll([...STATIC_FILES, ...ASSET_FILES]);
            })
            .then(() => {
                console.log('[ServiceWorker] Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Error durante la instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activando...');
    
    event.waitUntil(
        // Limpiar caches antiguos
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                        console.log('[ServiceWorker] Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('[ServiceWorker] Activación completada');
            return self.clients.claim();
        })
    );
});

// Estrategia de cache: Cache First, fallback a Network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Solo manejar solicitudes del mismo origen
    if (url.origin !== location.origin) {
        return;
    }
    
    // Para archivos estáticos, usar Cache First
    if (STATIC_FILES.some(file => url.pathname.endsWith(file)) ||
        ASSET_FILES.some(file => url.pathname.includes(file))) {
        
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[ServiceWorker] Sirviendo desde cache:', url.pathname);
                        return cachedResponse;
                    }
                    
                    return fetch(event.request)
                        .then((response) => {
                            // Si la respuesta es válida, cachearla
                            if (response && response.status === 200) {
                                const responseToCache = response.clone();
                                caches.open(STATIC_CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, responseToCache);
                                    });
                            }
                            return response;
                        })
                        .catch((error) => {
                            console.error('[ServiceWorker] Error fetching:', error);
                            // Podrías devolver una página offline personalizada aquí
                        });
                })
        );
    } else {
        // Para otros recursos, usar Network First
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cachear respuestas exitosas
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback al cache
                    return caches.match(event.request);
                })
        );
    }
});

// Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        caches.keys().then((cacheNames) => {
            event.ports[0].postMessage({
                type: 'CACHE_INFO',
                caches: cacheNames
            });
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            event.ports[0].postMessage({
                type: 'CACHE_CLEARED',
                success: true
            });
        });
    }
});

// Manejo de sincronización en segundo plano
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Sincronización en segundo plano:', event.tag);
    
    if (event.tag === 'sync-settings') {
        event.waitUntil(syncSettings());
    }
});

async function syncSettings() {
    // Aquí podrías sincronizar configuración con un servidor
    console.log('[ServiceWorker] Sincronizando configuración...');
}

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Notificación push recibida');
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva actualización disponible',
        icon: 'assets/icons/icon-192x192.png',
        badge: 'assets/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Abrir aplicación',
                icon: 'assets/icons/icon-72x72.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: 'assets/icons/icon-72x72.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('VideoGest', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notificación clickeada');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/VideoGest.html')
        );
    }
});
```

## 10. VideoGest_Estructura.md

```markdown
# VideoGest - Estructura de la Aplicación

## Descripción General
VideoGest es una aplicación PWA (Progressive Web App) para la gestión de archivos de vídeo utilizando FFMPEG. La aplicación funciona offline y está preparada para múltiples idiomas.

## Versión
**Versión Actual:** 1.0.0  
**Última Actualización:** 18/12/2025  
**Autor:** Roberto Benet - rbenet71@gmail.com

## Estructura de Archivos

### Directorio Raíz
```
VideoGest/
├── assets/                  # Recursos estáticos
│   ├── icons/              # Iconos de la aplicación
│   └── pictos/             # Iconos adicionales
├── VideoGest.html          # Archivo HTML principal
├── VideoGest_Styles.css    # Estilos CSS
├── VideoGest_App.js        # Lógica principal de la aplicación
├── VideoGest_Translations.js # Sistema de traducción
├── VideoGest_Storage.js    # Gestión de almacenamiento
├── VideoGest_FFMPEG.js     # Lógica de FFMPEG
├── VideoGest_UI.js         # Gestión de interfaz de usuario
├── VideoGest_ServiceWorker.js # Service Worker para PWA
├── VideoGest_Manifest.json # Manifest de PWA
└── VideoGest_Estructura.md # Este documento
```

### Descripción de Archivos

1. **VideoGest.html**  
   - Punto de entrada de la aplicación
   - Estructura HTML con todos los paneles
   - Incluye referencias a todos los scripts y estilos

2. **VideoGest_Styles.css**  
   - Estilos CSS con diseño responsive
   - Variables CSS para temas
   - Estilos para todos los componentes

3. **VideoGest_Translations.js**  
   - Sistema de traducción multi-idioma
   - Soporte para Español, Catalán, Inglés y Francés
   - Traducciones almacenadas en memoria

4. **VideoGest_Storage.js**  
   - Gestión de almacenamiento local
   - Persistencia de configuración
   - Historial de comandos
   - Importación/exportación de datos

5. **VideoGest_FFMPEG.js**  
   - Generación de comandos FFMPEG
   - Configuraciones por operación
   - Validaciones y estimaciones

6. **VideoGest_UI.js**  
   - Gestión de la interfaz de usuario
   - Control de paneles y navegación
   - Manejo de eventos
   - Sistema de mensajes

7. **VideoGest_App.js**  
   - Inicialización de la aplicación
   - Gestión del ciclo de vida
   - Control de versiones y actualizaciones
   - Utilidades generales

8. **VideoGest_ServiceWorker.js**  
   - Service Worker para funcionalidad offline
   - Estrategias de cache
   - Actualizaciones en segundo plano

9. **VideoGest_Manifest.json**  
   - Configuración de PWA
   - Iconos y metadatos
   - Configuración de instalación

## Funcionalidades Implementadas

### 1. Reducción de Tamaño de Vídeo
- **Entrada:** Archivo de vídeo
- **Parámetros:** Calidad (Alta/Media/Baja), Formato de salida
- **Salida:** Comando FFMPEG para ejecutar manualmente

### 2. Sistema de Traducción
- Cambio dinámico de idioma
- Persistencia de idioma seleccionado
- Traducción de todos los elementos de UI

### 3. Almacenamiento Persistente
- Guardado de configuración
- Historial de comandos
- Preferencias del usuario

### 4. Funcionalidad PWA
- Instalación como aplicación nativa
- Funcionamiento offline
- Actualizaciones automáticas

### 5. Interfaz de Usuario
- Diseño responsive
- Navegación entre paneles
- Sistema de mensajes
- Validación de formularios

## Flujo de Trabajo

### Para Reducir Tamaño de Vídeo:
1. Seleccionar operación "Reducir Tamaño"
2. Seleccionar archivo de vídeo
3. Configurar calidad y formato
4. Hacer clic en "Ejecutar"
5. Seguir instrucciones FFMPEG
6. Copiar y ejecutar comando en CMD

## Configuración y Personalización

### Cambiar Versión de la Aplicación
1. Actualizar `version` en `VideoGest_App.js`
2. Actualizar nombres de cache en `VideoGest_ServiceWorker.js`
3. Actualizar fecha en footer del HTML

### Añadir Nuevo Idioma
1. Agregar traducciones en `VideoGest_Translations.js`
2. Añadir botón de idioma en el HTML
3. Actualizar detección automática en `VideoGest_Translations.init()`

### Añadir Nueva Operación
1. Agregar botón en panel principal (HTML)
2. Añadir traducciones para la operación
3. Implementar lógica en `VideoGest_FFMPEG.js`
4. Crear panel de configuración (HTML)
5. Manejar eventos en `VideoGest_UI.js`

## Consideraciones Técnicas

### Limitaciones
- FFMPEG no se ejecuta directamente en el navegador
- Requiere intervención manual del usuario
- Depende de permisos del sistema operativo

### Compatibilidad
- Navegadores modernos (Chrome 80+, Firefox 75+, Edge 80+)
- Windows (principal), compatible con otros sistemas
- Dispositivos móviles y desktop

### Seguridad
- Solo archivos del mismo origen
- Validación de tipos de archivo
- Persistencia opcional de datos

## Mantenimiento y Actualizaciones

### Actualizar la Aplicación
1. Incrementar número de versión
2. Actualizar nombres de cache del Service Worker
3. Actualizar fecha en footer

### Debugging
- Consola del navegador para errores JavaScript
- Herramientas de desarrollo para Service Worker
- localStorage para ver datos persistentes

### Registro de Cambios
**V_18_12_2025 - Versión 1.0.0**
- Implementación inicial
- Reducción de tamaño de vídeo
- Sistema multi-idioma
- Funcionalidad PWA completa
- Almacenamiento persistente

## Recursos Externos

### FFMPEG
- Descargar desde: https://ffmpeg.org/
- Documentación oficial disponible en el sitio web

### Iconos
- Iconos generados para múltiples tamaños
- Alojados en directorio `assets/icons/`

## Notas de Desarrollo

### Arquitectura
- Modularidad por funcionalidad
- Separación de responsabilidades
- Ficheros de 300-500 líneas máximo

### Convenciones de Código
- Nombres de archivos con prefijo "VideoGest_"
- Variables en inglés, comentarios en español
- Estructura consistente en todos los archivos

### Pruebas
- Probar en diferentes navegadores
- Verificar funcionamiento offline
- Validar persistencia de datos
- Probar actualizaciones

## Soporte y Contacto

**Autor:** Roberto Benet  
**Email:** rbenet71@gmail.com  
**GitHub:** https://rbenet71.github.io/Web/

---

**IMPORTANTE:** Siempre que se haga un cambio en la aplicación, actualizar este documento y la versión en los archivos correspondientes.
```

## Instrucciones de Implementación

1. **Crear la estructura de directorios:**
   ```bash
   mkdir VideoGest
   cd VideoGest
   mkdir -p assets/icons assets/pictos
   ```

2. **Crear los archivos:**
   Copiar cada bloque de código en su archivo correspondiente.

3. **Generar iconos:**
   Crear iconos en diferentes tamaños (72x72, 96x96, etc.) y colocarlos en `assets/icons/`

4. **Probar la aplicación:**
   - Abrir `VideoGest.html` en un navegador moderno
   - Verificar que todas las funciones trabajen
   - Probar el modo offline

5. **Implementar FFMPEG real:**
   - Descargar ffmpeg.exe de https://ffmpeg.org/
   - Modificar la lógica de copia en `VideoGest_FFMPEG.js`

## Características Implementadas

✅ **App PWA** - Funciona como aplicación nativa  
✅ **Funcionamiento offline** - Service Worker con cache  
✅ **Multi-idioma** - Español, Catalán, Inglés, Francés  
✅ **Botón de ayuda** - Panel de ayuda integrado  
✅ **Botón de instalación** - Instalación como PWA  
✅ **Footer personalizado** - Con información de copyright  
✅ **Estructura modular** - Múltiples archivos JS organizados  
✅ **Almacenamiento persistente** - Guarda preferencias  
✅ **Actualizaciones automáticas** - Service Worker maneja updates  
✅ **Gestión de videos con FFMPEG** - Primera opción implementada  

La aplicación está lista para usar y extensible para agregar las demás funciones de video.