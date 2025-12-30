    async scanSessionFolder(folderHandle, sessionName) {
        try {
            console.log(`📂 Escaneando carpeta de sesión: ${sessionName}`);
            let videos = [];
            
            const entries = [];
            for await (const entry of folderHandle.values()) {
                entries.push(entry);
            }
            
            console.log(`📄 Archivos en sesión ${sessionName}: ${entries.length}`);
            
            // Buscar videos en esta carpeta
            for (const entry of entries) {
                if (entry.kind === 'file') {
                    const fileName = entry.name.toLowerCase();
                    
                    if (fileName.endsWith('.mp4') || fileName.endsWith('.webm')) {
                        try {
                            const file = await entry.getFile();
                            
                            // Extraer duración del video
                            const duration = await this.extractVideoDuration(file);
                            
                            // Crear ID único como STRING
                            const uniqueId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            
                            const video = {
                                id: uniqueId,
                                filename: entry.name,
                                title: `${sessionName}/${entry.name}`,
                                timestamp: file.lastModified,
                                size: file.size,
                                duration: duration, // Duración extraída
                                location: 'localFolder',
                                source: 'filesystem',
                                session: sessionName,
                                fileHandle: entry,
                                blob: file,
                                format: fileName.endsWith('.mp4') ? 'mp4' : 'webm',
                                isPhysical: true,
                                lastModified: file.lastModified,
                                hasDuration: duration > 0
                            };
                            
                            console.log(`📄 Video en sesión ${sessionName}: ${entry.name} - ${this.formatTime(duration)}`);
                            
                            videos.push(video);
                            
                        } catch (error) {
                            console.warn(`⚠️ Error leyendo archivo ${entry.name}:`, error);
                        }
                    }
                } else if (entry.kind === 'directory') {
                    console.log(`📁 Subcarpeta en ${sessionName}: ${entry.name}`);
                    // Opcional: escanear recursivamente
                    const subVideos = await this.scanSessionFolder(entry, `${sessionName}/${entry.name}`);
                    videos = videos.concat(subVideos);
                }
            }
            
            return videos;
            
        } catch (error) {
            console.error(`❌ Error escaneando carpeta ${sessionName}:`, error);
            return [];
        }
    }
    // Helper para leer strings del array buffer (si no la tienes)
    readString(arrayBuffer, offset, length) {
        try {
            const bytes = new Uint8Array(arrayBuffer, offset, length);
            let str = '';
            for (let i = 0; i < length; i++) {
                str += String.fromCharCode(bytes[i]);
            }
            return str;
        } catch (error) {
            console.warn('⚠️ Error leyendo string:', error);
            return '';
        }
    }

    // Método alternativo para extraer duración
// Método alternativo para extraer duración
    async getVideoDurationAlternative(blob) {
        return new Promise((resolve) => {
            try {
                console.log('🔄 Usando método alternativo para duración...');
                
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const arrayBuffer = e.target.result;
                        const dataView = new DataView(arrayBuffer);
                        
                        let duration = 0;
                        
                        // Para MP4 files
                        if (blob.type.includes('mp4') || blob.name?.includes('.mp4')) {
                            duration = this.extractMP4Duration(arrayBuffer, dataView);
                        }
                        // Para WebM files
                        else if (blob.type.includes('webm') || blob.name?.includes('.webm')) {
                            duration = this.extractWebMDuration(arrayBuffer, dataView);
                        }
                        
                        if (duration > 0) {
                            console.log(`✅ Duración encontrada (alternativo): ${duration}ms`);
                            resolve(duration);
                        } else {
                            console.log('⚠️ No se pudo extraer duración con método alternativo');
                            resolve(0);
                        }
                        
                    } catch (error) {
                        console.warn('⚠️ Error en método alternativo:', error);
                        resolve(0);
                    }
                };
                
                reader.onerror = () => {
                    console.warn('⚠️ Error leyendo archivo para método alternativo');
                    resolve(0);
                };
                
                // Leer solo los primeros 100KB (donde suele estar la metadata)
                reader.readAsArrayBuffer(blob.slice(0, 100000));
                
            } catch (error) {
                console.warn('⚠️ Error en getVideoDurationAlternative:', error);
                resolve(0);
            }
        });
    }

    // Extraer duración de archivos MP4
    extractMP4Duration(arrayBuffer, dataView) {
        try {
            // Buscar átomo 'moov' que contiene la duración
            for (let i = 0; i < arrayBuffer.byteLength - 16; i++) {
                const size = dataView.getUint32(i);
                const type = this.readString(arrayBuffer, i + 4, 4);
                
                if (type === 'moov') {
                    // Buscar átomo 'mvhd' (movie header) dentro de moov
                    for (let j = i + 8; j < i + size; j++) {
                        const subSize = dataView.getUint32(j);
                        const subType = this.readString(arrayBuffer, j + 4, 4);
                        
                        if (subType === 'mvhd') {
                            const version = dataView.getUint8(j + 8);
                            let timescale, duration;
                            
                            if (version === 1) {
                                // Versión 1 (64-bit)
                                timescale = dataView.getUint32(j + 20);
                                duration = Number(dataView.getBigUint64(j + 24));
                            } else {
                                // Versión 0 (32-bit)
                                timescale = dataView.getUint32(j + 12);
                                duration = dataView.getUint32(j + 16);
                            }
                            
                            if (timescale > 0 && duration > 0) {
                                const durationMs = (duration / timescale) * 1000;
                                console.log(`📹 MP4: timescale=${timescale}, duration=${duration}, ms=${durationMs}`);
                                return Math.round(durationMs);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error extrayendo duración MP4:', error);
        }
        return 0;
    }

    // Extraer duración de archivos WebM
    extractWebMDuration(arrayBuffer, dataView) {
        try {
            // WebM es más complejo, buscar segmentos de información
            // Para simplificar, podemos usar una estimación basada en el tamaño
            const fileSize = arrayBuffer.byteLength;
            
            // Estimación aproximada: 1MB ≈ 5-10 segundos en calidad media
            // Esto es solo una estimación de respaldo
            const estimatedDuration = Math.round((fileSize / (1024 * 1024)) * 8000); // 8 segundos por MB
            
            console.log(`🎬 WebM: tamaño=${Math.round(fileSize/1024/1024)}MB, duración estimada=${estimatedDuration}ms`);
            
            return estimatedDuration;
        } catch (error) {
            console.warn('⚠️ Error extrayendo duración WebM:', error);
        }
        return 0;
    }

    // Helper para leer strings del array buffer (si no la tienes)
    readString(arrayBuffer, offset, length) {
        const bytes = new Uint8Array(arrayBuffer, offset, length);
        let str = '';
        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return str;
    }
    

    // Añade esta función a tu clase DashcamApp (puede ir en la sección UTILIDADES)
    async extractVideoDuration(blob) {
        return new Promise((resolve) => {
            try {
                console.log('⏱️ Extrayendo duración del video...');
                
                // Si estamos en file:// protocol, usar método alternativo
                if (window.location.protocol === 'file:') {
                    console.log('⚠️ file:// protocol detectado, usando método alternativo');
                    this.getVideoDurationAlternative(blob).then(duration => {
                        console.log(`✅ Duración extraída (alternativo): ${duration}ms (${this.formatTime(duration)})`);
                        resolve(duration);
                    });
                    return;
                }
                
                // Método normal para http/https
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.muted = true;
                video.playsInline = true;
                
                let durationExtracted = false;
                let fallbackTimeout;
                
                video.onloadedmetadata = () => {
                    if (durationExtracted) return;
                    durationExtracted = true;
                    
                    const duration = Math.round(video.duration * 1000);
                    
                    // Verificar que la duración no sea Infinity o NaN
                    if (!isFinite(duration) || isNaN(duration) || duration === Infinity) {
                        console.warn('⚠️ Duración inválida del video:', video.duration);
                        this.getVideoDurationAlternative(blob).then(altDuration => {
                            console.log(`✅ Duración alternativa: ${altDuration}ms`);
                            URL.revokeObjectURL(video.src);
                            video.remove();
                            clearTimeout(fallbackTimeout);
                            resolve(altDuration);
                        });
                        return;
                    }
                    
                    console.log(`✅ Duración extraída: ${duration}ms (${this.formatTime(duration)})`);
                    
                    URL.revokeObjectURL(video.src);
                    video.remove();
                    clearTimeout(fallbackTimeout);
                    resolve(duration);
                };
                
                video.onerror = (error) => {
                    console.warn('⚠️ Error extrayendo duración del video:', error);
                    this.getVideoDurationAlternative(blob).then(altDuration => {
                        console.log(`✅ Duración alternativa (error): ${altDuration}ms`);
                        URL.revokeObjectURL(video.src);
                        video.remove();
                        clearTimeout(fallbackTimeout);
                        resolve(altDuration);
                    });
                };
                
                // Timeout de respaldo
                fallbackTimeout = setTimeout(() => {
                    if (!durationExtracted) {
                        console.log('⏱️ Timeout extrayendo duración, usando método alternativo');
                        this.getVideoDurationAlternative(blob).then(altDuration => {
                            console.log(`✅ Duración alternativa (timeout): ${altDuration}ms`);
                            URL.revokeObjectURL(video.src);
                            video.remove();
                            resolve(altDuration);
                        });
                    }
                }, 3000);
                
                // Crear URL del blob
                const videoUrl = URL.createObjectURL(blob);
                video.src = videoUrl;
                
                // Forzar carga de metadatos
                video.load();
                
            } catch (error) {
                console.warn('⚠️ Error en extractVideoDuration:', error);
                // Usar método alternativo como último recurso
                this.getVideoDurationAlternative(blob).then(duration => {
                    console.log(`✅ Duración alternativa (catch): ${duration}ms`);
                    resolve(duration);
                });
            }
        });
    }



    renderVideosList() {
        const container = this.elements.videosList;
        if (!container) return;
        
        if (this.state.videos.length === 0) {
            let message = 'No hay vídeos en esta ubicación';
            let submessage = '';
            
            if (this.state.viewMode === 'default') {
                submessage = 'Inicia una grabación para comenzar';
            } else if (this.state.viewMode === 'localFolder') {
                if (!this.localFolderHandle) {
                    message = 'No hay carpeta local seleccionada';
                    submessage = 'Haz clic en "Elegir carpeta" en Configuración';
                } else {
                    message = 'No hay vídeos en la carpeta local';
                    submessage = 'Mueve videos aquí desde la app o graba directamente';
                }
            }
            
            container.innerHTML = `
                <div class="empty-state">
                    <div>📁</div>
                    <p>${message}</p>
                    <p>${submessage}</p>
                    ${this.state.viewMode === 'localFolder' && !this.localFolderHandle ? `
                        <button class="btn open-btn" onclick="dashcamApp.showSettings()" style="margin-top: 15px;">
                            ⚙️ Ir a Configuración
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }
        
        let html = '<div class="file-list">';
        
        this.state.videos.forEach(video => {
            const date = new Date(video.timestamp);
            const sizeMB = video.size ? Math.round(video.size / (1024 * 1024)) : 0;
            const duration = this.formatTime(video.duration || 0);
            const dateStr = date.toLocaleDateString('es-ES');
            const timeStr = date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            const location = video.location || 'app';
            const format = video.format || 'mp4';
            const segment = video.segment || 1;
            const normalizedId = this.normalizeId(video.id);
            
            // Determinar icono y texto según ubicación real
            let locationIcon, locationText, locationClass;
            if (video.source === 'filesystem' || video.isPhysical || 
                location === 'localFolder' || location === 'desktop_folder' || location === 'ios_local') {
                locationIcon = '📂';
                locationText = 'Carpeta Local';
                locationClass = 'local-file';
                
                if (video.session) {
                    locationText += ` (${video.session})`;
                }
            } else {
                locationIcon = '📱';
                locationText = 'App';
                locationClass = 'app-file';
            }
            
            html += `
                <div class="file-item video-file ${locationClass} ${this.state.selectedVideos.has(normalizedId) ? 'selected' : ''}" 
                    data-id="${video.id}" 
                    data-type="video"
                    data-location="${location}"
                    data-format="${format}"
                    data-source="${video.source || 'app'}">
                    <div class="file-header">
                        <div class="file-title">${this.escapeHTML(video.title || video.filename || 'Grabación')}</div>
                        <div class="file-location" title="${locationText}">${locationIcon}</div>
                        <div class="file-format" data-format="${format}">${format.toUpperCase()}</div>
                        <div class="file-time">${timeStr}</div>
                    </div>
                    <div class="file-details">
                        <div>📅 ${dateStr}</div>
                        <div>⏱️ ${duration}</div>
                        <div>💾 ${sizeMB} MB</div>
                        <div>📍 ${video.gpsPoints || 0} puntos</div>
                        ${segment > 1 ? `<div>📹 Segmento ${segment}</div>` : ''}
                        ${video.isPhysical ? `<div>📄 Archivo físico</div>` : ''}
                    </div>
                    <div class="file-footer">
                        <div class="file-checkbox">
                            <input type="checkbox" ${this.state.selectedVideos.has(normalizedId) ? 'checked' : ''}>
                            <span>Seleccionar</span>
                        </div>
                        <button class="play-btn" data-id="${video.id}" title="Reproducir ${locationText}">
                            ▶️ Reproducir
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // DEBUG: Ver qué HTML se está generando
        console.log('🔄 HTML generado (primeras 500 chars):', html.substring(0, 500));
        
        container.innerHTML = html;
        
        // Configurar eventos
        this.setupGalleryEventListeners();
    }

    setupGalleryEventListeners() {
        const container = this.elements.videosList;
        if (!container) return;
        
        console.log('🔄 Configurando eventos para', container.querySelectorAll('.file-item').length, 'videos');
        
        container.querySelectorAll('.file-item').forEach(item => {
            // Click en el item (excepto en botones y checkboxes)
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.play-btn') && !(e.target.type === 'checkbox')) {
                    const id = item.dataset.id;
                    this.toggleSelection(id, 'video');
                }
            });
            
            // Checkbox
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = item.dataset.id;
                    this.toggleSelection(id, 'video');
                });
            }
            
            // Botón de reproducir
            const playBtn = item.querySelector('.play-btn');
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const id = item.dataset.id;
                    console.log('▶️ Clic en botón reproducir, ID:', id, 'Tipo:', typeof id);
                    
                    // Buscar video en el estado
                    const video = this.findVideoInState(id);
                    if (video) {
                        console.log('✅ Video encontrado en estado, reproduciendo...');
                        this.playVideoFromCurrentLocation(id);
                    } else {
                        console.error('❌ Video no encontrado en estado');
                        console.error('ID buscado:', id);
                        console.error('IDs disponibles:', this.state.videos.map(v => v.id));
                        this.showNotification('❌ Video no disponible');
                    }
                });
            }
        });
    }
    // Añade esta función para buscar videos correctamente
    findVideoInState(id) {
        console.log('🔍 Buscando video en estado con ID:', id, 'Tipo:', typeof id);
        console.log('📊 Videos disponibles:', this.state.videos.length);
        
        if (!id) {
            console.error('❌ ID vacío recibido');
            return null;
        }
        
        // Normalizar ID
        const normalizedSearchId = this.normalizeId(id);
        console.log('🔍 ID normalizado para búsqueda:', normalizedSearchId);
        
        // Primero buscar por ID exacto
        let video = this.state.videos.find(v => {
            const videoId = this.normalizeId(v.id);
            return videoId === normalizedSearchId;
        });
        
        if (!video) {
            // Buscar por comparación flexible
            video = this.state.videos.find(v => {
                const videoId = this.normalizeId(v.id);
                return videoId == normalizedSearchId; // Comparación con == para tipos diferentes
            });
        }
        
        if (!video) {
            // Buscar por ID string en número
            const numId = Number(id);
            if (!isNaN(numId)) {
                video = this.state.videos.find(v => {
                    const videoId = this.normalizeId(v.id);
                    return videoId === numId;
                });
            }
        }
        
        if (video) {
            console.log('✅ Video encontrado:', {
                id: video.id,
                filename: video.filename,
                title: video.title,
                hasBlob: !!video.blob
            });
        } else {
            console.error('❌ Video NO encontrado');
            console.error('IDs disponibles:', this.state.videos.map(v => ({id: v.id, filename: v.filename})));
        }
        
        return video;
    }

    async playVideoFromCurrentLocation(videoId) {
        try {
            console.log('🎬 Reproduciendo video desde ubicación actual:', this.state.viewMode);
            console.log('📊 Videos disponibles en estado:', this.state.videos.length);
            console.log('ID recibido:', videoId, 'Tipo:', typeof videoId);
            
            // Buscar video usando la función mejorada
            const video = this.findVideoInState(videoId);
            
            if (!video) {
                console.error('❌ Video no encontrado en estado actual');
                
                // Intentar cargar desde la base de datos si es modo "default"
                if (this.state.viewMode === 'default' && this.db) {
                    console.log('📱 Intentando cargar desde base de datos...');
                    const idToSearch = this.normalizeId(videoId);
                    const dbVideo = await this.getFromStore('videos', idToSearch);
                    
                    if (dbVideo) {
                        // Asegurar que tenga título y filename
                        dbVideo.title = dbVideo.title || `Grabación ${new Date(dbVideo.timestamp).toLocaleString('es-ES')}`;
                        dbVideo.filename = dbVideo.filename || `grabacion_${dbVideo.id}.mp4`;
                        
                        // Llamar a playVideo con el video de la BD
                        await this.playVideo(dbVideo);
                        return;
                    }
                }
                
                this.showNotification('❌ Video no disponible');
                return;
            }
            
            // Verificar que el video tenga los datos mínimos necesarios
            if (!video.blob) {
                console.error('❌ Video no tiene blob');
                this.showNotification('❌ Video dañado o no disponible');
                return;
            }
            
            // Asegurar título y filename
            if (!video.title) {
                video.title = `Grabación ${new Date(video.timestamp).toLocaleString('es-ES')}`;
            }
            if (!video.filename) {
                video.filename = `grabacion_${video.id}.${video.format || 'mp4'}`;
            }
            
            console.log('✅ Video válido encontrado, reproduciendo...');
            await this.playVideo(video);
            
        } catch (error) {
            console.error('❌ Error reproduciendo video:', error);
            this.showNotification('❌ Error al reproducir');
        }
    }

    // Función helper para identificar IDs locales
    isLocalId(id) {
        return typeof id === 'string' && id.startsWith('local_');
    }

    async playVideo(video) {
        try {
            console.log('🎬 Reproduciendo video:', video);
            console.log('🎬 Nombre del video:', video.filename);
            console.log('🎬 ID del video:', video.id);
            
            if (!video || !video.blob) {
                console.error('❌ Video o blob inválido en playVideo');
                console.error('Video:', video);
                this.showNotification('❌ Video no disponible para reproducción');
                return;
            }
            
            // EXTRAER METADATOS GPS DEL MP4 si es necesario
            if (!video.gpsTrack || video.gpsTrack.length === 0) {
                await this.extractGPSMetadataFromMP4(video);
            }
            
            this.state.currentVideo = video;
            
            // Crear URL del blob
            const videoUrl = URL.createObjectURL(video.blob);
            console.log('🎬 URL de video creada:', videoUrl.substring(0, 50) + '...');
            
            // Configurar elemento de video
            this.elements.playbackVideo.src = videoUrl;
            this.elements.videoTitle.textContent = video.title || video.filename || 'Grabación';
            
            const date = new Date(video.timestamp);
            const sizeMB = Math.round(video.size / (1024 * 1024));
            const duration = this.formatTime(video.duration || 0);
            const location = video.location || 'app';
            
            // Actualizar información en la UI
            this.elements.videoDate.textContent = date.toLocaleString('es-ES');
            this.elements.videoDuration.textContent = duration;
            this.elements.videoSize.textContent = `${sizeMB} MB`;
            this.elements.videoGpsPoints.textContent = video.gpsPoints || 0;
            
            // Determinar ubicación y mostrar icono apropiado
            let locationText = 'Almacenado en la app';
            let locationIcon = '📱';
            
            if (location === 'localFolder' || location === 'desktop_folder' || 
                video.source === 'filesystem' || video.isPhysical) {
                locationText = `Almacenado en carpeta local${video.session ? ` (${video.session})` : ''}`;
                locationIcon = '📂';
            }
            
            this.elements.locationIcon.textContent = locationIcon;
            this.elements.locationText.textContent = locationText;
            
            // Limpiar mapa existente antes de inicializar uno nuevo
            this.cleanupMap();
            
            // Mostrar reproductor
            this.elements.videoPlayer.classList.remove('hidden');
            this.elements.videoPlayer.classList.add('mobile-view');
            
            // Inicializar mapa si hay datos GPS
            setTimeout(() => {
                if (video.gpsTrack && video.gpsTrack.length > 0) {
                    this.initLeafletMap();
                    console.log('🗺️ Inicializando mapa con', video.gpsTrack.length, 'puntos GPS');
                } else {
                    const mapContainer = this.elements.playbackMap;
                    if (mapContainer) {
                        mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ Este video no tiene datos GPS</span></div>';
                    }
                    console.log('⚠️ Video sin datos GPS para mostrar en mapa');
                }
            }, 300);
            
            // Configurar eventos de reproducción
            this.elements.playbackVideo.addEventListener('timeupdate', () => {
                this.updatePlaybackMap();
            });
            
            // Intentar reproducir automáticamente
            setTimeout(() => {
                this.elements.playbackVideo.play().catch(error => {
                    console.log('⚠️ No se pudo autoplay:', error.message);
                    // Mostrar controles para que el usuario pueda reproducir manualmente
                    this.elements.playbackVideo.controls = true;
                });
            }, 300);
            
        } catch (error) {
            console.error('❌ Error en playVideo:', error);
            this.showNotification('❌ Error al reproducir el video');
        }
    }

    async cleanupLocalFilesDatabase() {
        try {
            console.log('🧹 Limpiando base de datos de archivos locales...');
            
            if (!this.db) return;
            
            const localFiles = await this.getAllFromStore('localFiles');
            console.log(`📊 Archivos locales en BD: ${localFiles.length}`);
            
            if (!this.localFolderHandle) {
                console.log('⚠️ No hay carpeta local para verificar');
                return;
            }
            
            let deletedCount = 0;
            let keptCount = 0;
            
            // Verificar cada archivo
            for (const file of localFiles) {
                try {
                    const fileName = file.filename || file.title;
                    
                    if (!fileName) {
                        // Sin nombre, eliminar
                        await this.deleteFromStore('localFiles', file.id);
                        deletedCount++;
                        continue;
                    }
                    
                    // Intentar encontrar el archivo físicamente
                    let exists = false;
                    
                    try {
                        // Buscar en raíz
                        await this.localFolderHandle.getFileHandle(fileName, { create: false });
                        exists = true;
                    } catch {
                        // Buscar en sesiones
                        if (file.session) {
                            try {
                                const sessionFolder = await this.localFolderHandle.getDirectoryHandle(file.session, { create: false });
                                await sessionFolder.getFileHandle(fileName, { create: false });
                                exists = true;
                            } catch {
                                exists = false;
                            }
                        }
                    }
                    
                    if (!exists) {
                        console.log(`🗑️ Eliminando archivo inexistente de BD: ${fileName}`);
                        await this.deleteFromStore('localFiles', file.id);
                        deletedCount++;
                    } else {
                        keptCount++;
                    }
                    
                } catch (error) {
                    console.warn(`⚠️ Error verificando archivo ${file.id}:`, error);
                    keptCount++;
                }
            }
            
            console.log(`✅ Limpieza completada: ${deletedCount} eliminados, ${keptCount} conservados`);
            
            if (deletedCount > 0) {
                this.showNotification(`🧹 Limpiados ${deletedCount} archivos inexistentes de la BD`);
            }
            
        } catch (error) {
            console.error('❌ Error limpiando base de datos local:', error);
        }
    }

    async syncPhysicalFilesWithDatabase() {
        try {
            console.log('🔄 Sincronizando archivos físicos con base de datos...');
            
            if (!this.localFolderHandle) return;
            
            // Escanear archivos físicos
            const physicalFiles = await this.scanLocalFolderForVideos();
            
            // Obtener archivos de la base de datos
            const dbFiles = await this.getAllFromStore('localFiles');
            
            // Buscar archivos físicos que no están en la BD
            const dbFilenames = dbFiles.map(f => f.filename).filter(Boolean);
            const newFiles = physicalFiles.filter(file => 
                !dbFilenames.includes(file.filename)
            );
            
            // Agregar nuevos archivos a la BD
            for (const file of newFiles) {
                if (file.filename) {
                    const fileRef = {
                        id: file.id || Date.now(),
                        filename: file.filename,
                        folderName: this.state.settings.localFolderName,
                        timestamp: file.timestamp || Date.now(),
                        size: file.size || 0,
                        location: 'localFolder',
                        session: file.session,
                        source: 'filesystem'
                    };
                    
                    await this.saveToDatabase('localFiles', fileRef);
                    console.log(`✅ Añadido a BD: ${file.filename}`);
                }
            }
            
            console.log(`🔄 Sincronización completada: ${newFiles.length} nuevos archivos añadidos a BD`);
            
        } catch (error) {
            console.error('❌ Error sincronizando archivos:', error);
        }
    }

    // AÑADE ESTA NUEVA FUNCIÓN PARA EXTRAER METADATOS GPS:

    async extractGPSMetadataFromMP4(video) {
        try {
            console.log('📍 Extrayendo metadatos GPS del video...');
            
            // Si ya tiene datos GPS, no hacer nada
            if (video.gpsTrack && video.gpsTrack.length > 0) {
                console.log('✅ Video ya tiene datos GPS');
                return video.gpsTrack;
            }
            
            if (!video.blob) {
                console.log('⚠️ Video no tiene blob para extraer metadatos');
                return [];
            }
            
            // Leer el blob como texto para buscar metadatos
            const reader = new FileReader();
            
            return new Promise((resolve) => {
                reader.onload = (event) => {
                    try {
                        const arrayBuffer = event.target.result;
                        
                        // Convertir a texto para buscar JSON
                        const textDecoder = new TextDecoder('utf-8');
                        const tailSize = Math.min(100000, arrayBuffer.byteLength); // Últimos 100KB
                        const tailStart = arrayBuffer.byteLength - tailSize;
                        const tailData = new Uint8Array(arrayBuffer, tailStart, tailSize);
                        const tailText = textDecoder.decode(tailData);
                        
                        console.log('🔍 Buscando metadatos GPS en el video...');
                        
                        // Buscar marcador de metadatos
                        const markerIndex = tailText.lastIndexOf('GPXMETADATA:');
                        if (markerIndex !== -1) {
                            const jsonStart = markerIndex + 'GPXMETADATA:'.length;
                            const jsonText = tailText.substring(jsonStart);
                            
                            // Intentar parsear como JSON
                            try {
                                const metadata = JSON.parse(jsonText);
                                console.log('✅ Metadatos GPS encontrados:', metadata.gpsPoints, 'puntos');
                                
                                // Actualizar video con los metadatos extraídos
                                video.gpsTrack = metadata.track || [];
                                video.gpsPoints = metadata.gpsPoints || 0;
                                
                                // También agregar nombres de ubicación a cada punto
                                if (video.gpsTrack.length > 0) {
                                    this.addLocationNamesToTrack(video.gpsTrack);
                                }
                                
                                resolve(video.gpsTrack);
                                return;
                                
                            } catch (jsonError) {
                                console.warn('⚠️ Error parseando metadatos JSON:', jsonError);
                            }
                        }
                        
                        // También buscar marcador WebM
                        const webmMarkerIndex = tailText.lastIndexOf('WEBM_METADATA:');
                        if (webmMarkerIndex !== -1) {
                            const jsonStart = webmMarkerIndex + 'WEBM_METADATA:'.length;
                            const jsonText = tailText.substring(jsonStart);
                            
                            try {
                                const metadata = JSON.parse(jsonText);
                                console.log('✅ Metadatos GPS encontrados en WebM:', metadata.gpsPoints, 'puntos');
                                
                                video.gpsTrack = metadata.track || [];
                                video.gpsPoints = metadata.gpsPoints || 0;
                                
                                if (video.gpsTrack.length > 0) {
                                    this.addLocationNamesToTrack(video.gpsTrack);
                                }
                                
                                resolve(video.gpsTrack);
                                return;
                                
                            } catch (jsonError) {
                                console.warn('⚠️ Error parseando metadatos WebM JSON:', jsonError);
                            }
                        }
                        
                        console.log('ℹ️ No se encontraron metadatos GPS en el video');
                        resolve([]);
                        
                    } catch (error) {
                        console.warn('⚠️ Error procesando metadatos:', error);
                        resolve([]);
                    }
                };
                
                reader.onerror = () => {
                    console.warn('⚠️ Error leyendo archivo para extraer metadatos');
                    resolve([]);
                };
                
                // Leer todo el archivo (los metadatos están al final)
                reader.readAsArrayBuffer(video.blob);
            });
            
        } catch (error) {
            console.error('❌ Error en extractGPSMetadataFromMP4:', error);
            return [];
        }
    }

    async migrateIOSVideoToWindows(video) {
        try {
            console.log('🔄 Migrando video de iOS a Windows...');
            
            if (!video.blob) {
                console.error('❌ Video no tiene blob');
                return null;
            }
            
            // Leer el blob completo
            const arrayBuffer = await video.blob.arrayBuffer();
            const dataView = new DataView(arrayBuffer);
            
            // Buscar átomos MP4 que contengan metadatos GPS
            let gpsData = null;
            let videoData = null;
            
            // Buscar átomo 'moov' (contiene metadatos)
            for (let i = 0; i < arrayBuffer.byteLength - 8; i++) {
                const size = dataView.getUint32(i);
                const type = this.readString(arrayBuffer, i + 4, 4);
                
                if (type === 'moov') {
                    console.log('✅ Encontrado átomo moov en posición:', i);
                    videoData = await this.extractIOSMetadata(arrayBuffer.slice(i, i + size));
                    break;
                }
                
                // Saltar al siguiente átomo
                i += size - 1;
            }
            
            // Si no encontramos en MP4, buscar JSON al final (nuestro formato)
            if (!videoData) {
                const textDecoder = new TextDecoder('utf-8');
                const tailData = new Uint8Array(arrayBuffer.slice(-100000)); // Últimos 100KB
                const tailText = textDecoder.decode(tailData);
                
                // Buscar nuestros marcadores
                const gpxIndex = tailText.lastIndexOf('GPXMETADATA:');
                const webmIndex = tailText.lastIndexOf('WEBM_METADATA:');
                
                if (gpxIndex !== -1) {
                    const jsonText = tailText.substring(gpxIndex + 'GPXMETADATA:'.length);
                    try {
                        videoData = JSON.parse(jsonText);
                        console.log('✅ Encontrados metadatos GPS en marcador personalizado');
                    } catch (e) {}
                }
            }
            
            if (videoData && videoData.track) {
                console.log(`✅ Metadatos encontrados: ${videoData.track.length} puntos GPS`);
                
                // Recrear el video con metadatos en nuestro formato
                const cleanBlob = await this.removeOldMetadata(video.blob);
                const newBlob = await this.addGpsMetadataToMP4(cleanBlob, videoData.track);
                
                // Actualizar el video
                video.blob = newBlob;
                video.gpsTrack = videoData.track;
                video.gpsPoints = videoData.track.length;
                video.hasMetadata = true;
                
                console.log('✅ Video migrado exitosamente');
                return video;
            } else {
                console.log('⚠️ No se encontraron metadatos GPS en el video iOS');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error migrando video iOS:', error);
            return null;
        }
    }

    async checkAndMigrateIOSVideos() {
        try {
            console.log('🔍 Verificando videos iOS para migración...');
            
            let migratedCount = 0;
            let videosToUpdate = [];
            
            for (const video of this.state.videos) {
                // Si es un video de iOS sin metadatos GPS
                if ((video.source === 'filesystem' || video.isPhysical) && 
                    (!video.gpsTrack || video.gpsTrack.length === 0)) {
                    
                    console.log(`🔄 Verificando video iOS: ${video.filename}`);
                    
                    // Primero intentar extraer metadatos del video
                    const extractedTrack = await this.extractGPSMetadataFromMP4(video);
                    
                    if (extractedTrack && extractedTrack.length > 0) {
                        console.log(`✅ Metadatos extraídos: ${extractedTrack.length} puntos GPS`);
                        
                        // Actualizar el video con los metadatos extraídos
                        video.gpsTrack = extractedTrack;
                        video.gpsPoints = extractedTrack.length;
                        video.hasMetadata = true;
                        
                        migratedCount++;
                        videosToUpdate.push(video);
                        
                    } else {
                        // Si no se pudieron extraer, intentar migración completa
                        console.log('🔄 Intentando migración completa...');
                        const migrated = await this.migrateIOSVideoToWindows(video);
                        
                        if (migrated && migrated.gpsTrack && migrated.gpsTrack.length > 0) {
                            migratedCount++;
                            videosToUpdate.push(migrated);
                        }
                    }
                }
            }
            
            // Actualizar videos en el estado
            if (migratedCount > 0) {
                console.log(`✅ ${migratedCount} videos iOS procesados`);
                
                // Reemplazar videos en el estado
                this.state.videos = this.state.videos.map(video => {
                    const updatedVideo = videosToUpdate.find(v => v.id === video.id);
                    return updatedVideo || video;
                });
                
                this.showNotification(`✅ ${migratedCount} videos iOS procesados`);
                
                // Si estamos en la galería, actualizar la vista
                if (this.elements.galleryPanel && !this.elements.galleryPanel.classList.contains('hidden')) {
                    this.renderVideosList();
                }
            } else {
                console.log('ℹ️ No se encontraron videos iOS para migrar');
            }
            
        } catch (error) {
            console.error('❌ Error en verificación automática iOS:', error);
        }
    }

    // Helper para leer strings del array buffer
    readString(arrayBuffer, offset, length) {
        const bytes = new Uint8Array(arrayBuffer, offset, length);
        let str = '';
        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return str;
    }

    // Extraer metadatos de video iOS
    async extractIOSMetadata(moovData) {
        try {
            const textDecoder = new TextDecoder('utf-8');
            const text = textDecoder.decode(moovData);
            
            // Buscar datos GPS en formato iOS
            // iOS puede almacenar GPS en átomos '©xyz' o '©gps'
            const patterns = [
                /"gps":\s*(\[[^\]]+\])/,
                /"track":\s*(\[[^\]]+\])/,
                /"locations":\s*(\[[^\]]+\])/
            ];
            
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    try {
                        const trackData = JSON.parse(match[1]);
                        if (Array.isArray(trackData) && trackData.length > 0) {
                            console.log(`✅ Encontrados ${trackData.length} puntos GPS en formato iOS`);
                            return { track: trackData };
                        }
                    } catch (e) {}
                }
            }
            
            return null;
        } catch (error) {
            console.warn('⚠️ Error extrayendo metadatos iOS:', error);
            return null;
        }
    }

    // Remover metadatos antiguos
    async removeOldMetadata(blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const textDecoder = new TextDecoder('utf-8');
            const text = textDecoder.decode(arrayBuffer);
            
            // Buscar y remover nuestros marcadores
            const gpxIndex = text.lastIndexOf('GPXMETADATA:');
            const webmIndex = text.lastIndexOf('WEBM_METADATA:');
            
            let cleanData = arrayBuffer;
            
            if (gpxIndex !== -1) {
                console.log('🗑️ Removiendo marcador GPXMETADATA antiguo');
                cleanData = arrayBuffer.slice(0, gpxIndex);
            } else if (webmIndex !== -1) {
                console.log('🗑️ Removiendo marcador WEBM_METADATA antiguo');
                cleanData = arrayBuffer.slice(0, webmIndex);
            }
            
            return new Blob([cleanData], { type: blob.type });
        } catch (error) {
            console.warn('⚠️ Error removiendo metadatos antiguos:', error);
            return blob;
        }
    }
    // FUNCIÓN PARA AÑADIR NOMBRES DE UBICACIÓN:

    async addLocationNamesToTrack(gpsTrack) {
        if (!gpsTrack || gpsTrack.length === 0) return;
        
        console.log('🏙️ Añadiendo nombres de ubicación al track...');
        
        // Tomar muestras para no sobrecargar la API
        const samplePoints = [];
        const step = Math.max(1, Math.floor(gpsTrack.length / 10)); // 10 puntos máximo
        
        for (let i = 0; i < gpsTrack.length; i += step) {
            samplePoints.push(gpsTrack[i]);
        }
        
        // Procesar puntos en paralelo
        const promises = samplePoints.map(async (point, index) => {
            try {
                const locationName = await this.getLocationName(point.lat, point.lon);
                point.locationName = locationName;
                
                // Asignar el mismo nombre a puntos cercanos
                const startIdx = index * step;
                const endIdx = Math.min((index + 1) * step, gpsTrack.length);
                
                for (let j = startIdx; j < endIdx; j++) {
                    if (gpsTrack[j]) {
                        gpsTrack[j].locationName = locationName;
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error obteniendo ubicación para punto ${index}:`, error);
            }
        });
        
        await Promise.all(promises);
        console.log('✅ Nombres de ubicación añadidos al track');
    }




    initLeafletMap() {
        console.log('🗺️ Inicializando mapa Leaflet...');
        
        if (!this.state.currentVideo || !this.state.currentVideo.gpsTrack) {
            console.log('⚠️ No hay datos GPS para mostrar en el mapa');
            const mapContainer = document.getElementById('playbackMap');
            if (mapContainer) {
                mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ No hay datos GPS disponibles</span></div>';
            }
            return;
        }
        
        const mapContainer = document.getElementById('playbackMap');
        if (!mapContainer) {
            console.error('❌ No se encontró el contenedor del mapa');
            return;
        }
        
        // Limpiar contenido anterior
        mapContainer.innerHTML = '';
        
        const points = this.state.currentVideo.gpsTrack;
        if (points.length === 0) {
            console.log('⚠️ El track GPS está vacío');
            mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ No hay datos GPS para mostrar</span></div>';
            return;
        }
        
        // Verificar si Leaflet está disponible
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet no está cargado');
            mapContainer.innerHTML = '<div class="map-loading" style="color: #ff7675;"><span>❌ Error: Leaflet no está disponible</span></div>';
            return;
        }
        
        try {
            // Calcular centro y área del recorrido
            const bounds = this.calculateTrackBounds(points);
            const center = this.calculateTrackCenter(points);
            
            // Crear mapa Leaflet
            this.playbackMap = L.map('playbackMap', {
                center: center,
                zoom: 13,
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: false,
                dragging: !this.isIOS,
                tap: !this.isIOS,
                touchZoom: true,
                boxZoom: false,
                doubleClickZoom: true,
                keyboard: false
            });
            
            // Añadir capa de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
            }).addTo(this.playbackMap);
            
            // Dibujar la ruta
            const latLngs = points.map(point => [point.lat, point.lon]);
            
            // Crear línea para la ruta
            this.mapRouteLayer = L.polyline(latLngs, {
                color: '#00a8ff',
                weight: 4,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
            }).addTo(this.playbackMap);
            
            // Añadir marcador de inicio
            const startPoint = points[0];
            this.startMarker = L.marker([startPoint.lat, startPoint.lon]).addTo(this.playbackMap);
            this.startMarker.bindTooltip('📍 Punto de inicio', { direction: 'top' });
            
            // Añadir marcador de fin
            const endPoint = points[points.length - 1];
            this.endMarker = L.marker([endPoint.lat, endPoint.lon]).addTo(this.playbackMap);
            this.endMarker.bindTooltip('🏁 Punto final', { direction: 'top' });
            
            // Ajustar vista para mostrar toda la ruta
            this.playbackMap.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 16
            });
            
            // Forzar redibujado del mapa
            setTimeout(() => {
                if (this.playbackMap) {
                    this.playbackMap.invalidateSize();
                    console.log('✅ Mapa Leaflet inicializado correctamente');
                }
            }, 300);
            
            // Crear marcador de posición actual (será actualizado durante reproducción)
            if (points.length > 0) {
                const firstPoint = points[0];
                this.currentPositionMarker = L.marker([firstPoint.lat, firstPoint.lon], {
                    icon: L.divIcon({
                        className: 'current-position-marker',
                        iconSize: [16, 16],
                        html: '<div></div>'
                    }),
                    zIndexOffset: 1000
                }).addTo(this.playbackMap);
            }
            
        } catch (error) {
            console.error('❌ Error inicializando mapa Leaflet:', error);
            mapContainer.innerHTML = `
                <div class="map-loading" style="color: #ff7675;">
                    <span>❌ Error cargando mapa</span>
                    <br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
    updatePlaybackMap() {
        if (!this.state.currentVideo || !this.state.currentVideo.gpsTrack) return;
        
        const video = this.elements.playbackVideo;
        if (!video || !video.duration) return;
        
        const currentTime = video.currentTime;
        const totalTime = video.duration;
        const progress = currentTime / totalTime;
        
        const points = this.state.currentVideo.gpsTrack;
        const pointIndex = Math.min(Math.floor(progress * points.length), points.length - 1);
        const currentPoint = points[pointIndex];
        
        if (currentPoint) {
            this.elements.mapLat.textContent = currentPoint.lat.toFixed(4);
            this.elements.mapLon.textContent = currentPoint.lon.toFixed(4);
            this.elements.mapSpeed.textContent = `${(currentPoint.speed * 3.6 || 0).toFixed(1)} km/h`;
            
            if (currentPoint.locationName) {
                this.elements.mapCity.textContent = currentPoint.locationName;
            }
        }
    }

    hideVideoPlayer() {
        // Limpiar mapa Leaflet
        this.cleanupMap();
        
        // Limpiar el contenedor del mapa
        const mapContainer = this.elements.playbackMap;
        if (mapContainer) {
            mapContainer.innerHTML = '<div class="map-loading"><span>🔄 Cargando mapa...</span></div>';
        }
        
        // Ocultar el panel
        if (this.elements.videoPlayer) {
            this.elements.videoPlayer.classList.add('hidden');
            this.elements.videoPlayer.classList.remove('mobile-view');
        }
        
        // Detener y limpiar el video
        if (this.elements.playbackVideo) {
            this.elements.playbackVideo.pause();
            
            // Liberar URL del blob para liberar memoria
            if (this.elements.playbackVideo.src && this.elements.playbackVideo.src.startsWith('blob:')) {
                URL.revokeObjectURL(this.elements.playbackVideo.src);
            }
            
            this.elements.playbackVideo.src = '';
            this.elements.playbackVideo.load();
        }
        
        // Limpiar datos del video actual
        this.state.currentVideo = null;
        
        console.log('🎬 Reproductor de video cerrado');
    }
    
    async moveToLocalFolder() {
        if (!this.state.currentVideo) {
            this.showNotification('❌ No hay video seleccionado');
            return;
        }
        
        if (!this.localFolderHandle && !this.isIOS) {
            this.showNotification('❌ Selecciona una carpeta local primero');
            return;
        }
        
        try {
            this.showNotification('📂 Moviendo a carpeta local...');
            
            const video = this.state.currentVideo;
            const filename = `dashcam_${video.timestamp}.${video.format || 'mp4'}`;
            
            const success = await this.saveToLocalFolder(video.blob, filename);
            
            if (success) {
                console.log('✅ Video movido a carpeta local');
                
                // Si está configurado para NO mantener copia en app, eliminar
                if (!this.state.settings.keepAppCopy) {
                    await this.deleteFromStore('videos', video.id);
                    console.log('🗑️ Video eliminado de la app');
                    
                    // Cerrar reproductor si estaba abierto
                    this.hideVideoPlayer();
                }
                
                // Recargar galería
                await this.loadGallery();
                this.showNotification('✅ Movido a carpeta local');
            } else {
                this.showNotification('❌ Error al mover');
            }
            
        } catch (error) {
            console.error('❌ Error moviendo a carpeta local:', error);
            this.showNotification('❌ Error al mover');
        }
    }
    async extractGpxFromVideo() {
        if (!this.state.currentVideo) {
            this.showNotification('❌ No hay video seleccionado');
            return;
        }
        
        try {
            if (this.state.currentVideo.gpsTrack && this.state.currentVideo.gpsTrack.length > 0) {
                const gpxContent = this.generateGPX(this.state.currentVideo.gpsTrack);
                const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
                
                const gpxData = {
                    id: Date.now(),
                    blob: blob,
                    timestamp: this.state.currentVideo.timestamp,
                    points: this.state.currentVideo.gpsTrack.length,
                    title: `Ruta_${this.state.currentVideo.title.replace(/[^a-z0-9]/gi, '_')}`,
                    size: blob.size,
                    location: 'extracted'
                };
                
                if (this.db) {
                    await this.saveToDatabase('gpxTracks', gpxData);
                }
                
                this.downloadBlob(blob, `${gpxData.title}.gpx`);
                this.showNotification('🗺️ Ruta GPX extraída y descargada');
                
            } else {
                this.showNotification('⚠️ Este video no tiene metadatos GPS');
            }
            
        } catch (error) {
            console.error('❌ Error extrayendo GPX:', error);
            this.showNotification('❌ Error al extraer GPX');
        }
    }

    async exportSingleVideo() {
        if (!this.state.currentVideo) return;
        
        try {
            if (this.state.currentVideo.blob) {
                this.downloadBlob(
                    this.state.currentVideo.blob, 
                    `${this.state.currentVideo.title || 'grabacion'}.${this.state.currentVideo.format || 'mp4'}`
                );
                this.showNotification('📤 Video exportado');
            } else {
                this.showNotification('❌ Video no disponible para exportar');
            }
        } catch (error) {
            console.error('❌ Error exportando video:', error);
            this.showNotification('❌ Error al exportar');
        }
    }

    async deleteSingleVideo() {
        if (!this.state.currentVideo) return;
        
        if (!confirm('¿Eliminar este video?')) {
            return;
        }
        
        try {
            const video = this.state.currentVideo;
            let deletedFromFS = false;
            let deletedFromDB = false;
            
            // Si es un archivo físico, borrarlo del sistema de archivos
            if (video.source === 'filesystem' || video.isPhysical) {
                console.log(`🗑️ Borrando archivo físico: ${video.filename}`);
                
                if (video.fileHandle) {
                    deletedFromFS = await this.deletePhysicalFile(video.fileHandle);
                }
            }
            
            // Borrar de la base de datos
            if (this.db) {
                await this.deleteFromStore('videos', video.id);
                deletedFromDB = true;
            } else {
                const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
                const filteredVideos = videos.filter(v => v.id !== video.id);
                localStorage.setItem('dashcam_videos', JSON.stringify(filteredVideos));
                deletedFromDB = true;
            }
            
            this.hideVideoPlayer();
            await this.loadGallery();
            
            // Mostrar mensaje apropiado
            if (deletedFromFS && deletedFromDB) {
                this.showNotification('🗑️ Video eliminado (físico y de la app)');
            } else if (deletedFromFS) {
                this.showNotification('🗑️ Archivo físico eliminado');
            } else if (deletedFromDB) {
                this.showNotification('🗑️ Video eliminado de la app');
            } else {
                this.showNotification('⚠️ No se pudo eliminar completamente');
            }
            
        } catch (error) {
            console.error('❌ Error eliminando video:', error);
            this.showNotification('❌ Error al eliminar');
        }
    }
    async deleteFileByPath(filename, sessionName = null) {
        try {
            if (!this.localFolderHandle) {
                console.error('❌ No hay carpeta local seleccionada');
                return false;
            }
            
            let fileHandle;
            
            if (sessionName) {
                // Buscar en subcarpeta de sesión
                try {
                    const sessionFolder = await this.localFolderHandle.getDirectoryHandle(sessionName, { create: false });
                    fileHandle = await sessionFolder.getFileHandle(filename, { create: false });
                } catch (error) {
                    console.warn(`⚠️ No se encontró sesión ${sessionName}:`, error);
                    return false;
                }
            } else {
                // Buscar en carpeta raíz
                try {
                    fileHandle = await this.localFolderHandle.getFileHandle(filename, { create: false });
                } catch (error) {
                    console.warn(`⚠️ No se encontró archivo ${filename}:`, error);
                    return false;
                }
            }
            
            // Borrar el archivo
            await this.deletePhysicalFile(fileHandle);
            console.log(`✅ Archivo borrado por ruta: ${sessionName ? `${sessionName}/` : ''}${filename}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Error borrando archivo por ruta:`, error);
            return false;
        }
    }
    // ============ SELECTORES Y UI ============

    setupCompactSelectors() {
        if (this.elements.locationHeader) {
            this.elements.locationHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSelect('location');
            });
        }
        
        if (this.elements.typeHeader) {
            this.elements.typeHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSelect('type');
            });
        }
        
        if (this.elements.locationOptions) {
            this.elements.locationOptions.querySelectorAll('.select-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const value = e.currentTarget.dataset.value;
                    this.selectLocation(value);
                    this.closeAllSelects();
                });
            });
        }
        
        if (this.elements.typeOptions) {
            this.elements.typeOptions.querySelectorAll('.select-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const value = e.currentTarget.dataset.value;
                    this.selectType(value);
                    this.closeAllSelects();
                });
            });
        }
        
        document.addEventListener('click', () => {
            this.closeAllSelects();
        });
    }

    toggleSelect(type) {
        const options = type === 'location' ? this.elements.locationOptions : this.elements.typeOptions;
        const header = type === 'location' ? this.elements.locationHeader : this.elements.typeHeader;
        
        this.closeAllSelects();
        
        if (options && header) {
            options.classList.add('show');
            header.classList.add('active');
        }
    }

    closeAllSelects() {
        if (this.elements.locationOptions) this.elements.locationOptions.classList.remove('show');
        if (this.elements.locationHeader) this.elements.locationHeader.classList.remove('active');
        if (this.elements.typeOptions) this.elements.typeOptions.classList.remove('show');
        if (this.elements.typeHeader) this.elements.typeHeader.classList.remove('active');
    }

    selectLocation(value) {
        this.state.viewMode = value;
        
        const header = this.elements.locationHeader;
        const options = this.elements.locationOptions;
        
        if (header && options) {
            const selectedOption = options.querySelector(`.select-option[data-value="${value}"]`);
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                header.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
                
                options.querySelectorAll('.select-option').forEach(option => {
                    option.classList.remove('active');
                });
                selectedOption.classList.add('active');
            }
        }
        
        // FORZAR RECARGA de la galería
        console.log(`📍 Cambiando a vista: ${value}`);
        this.loadGallery();
    }

    selectType(value) {
        this.state.activeTab = value;
        
        const header = this.elements.typeHeader;
        const options = this.elements.typeOptions;
        
        if (header && options) {
            const selectedOption = options.querySelector(`.select-option[data-value="${value}"]`);
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                header.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
                
                options.querySelectorAll('.select-option').forEach(option => {
                    option.classList.remove('active');
                });
                selectedOption.classList.add('active');
            }
        }
        
        this.switchTab(value);
    }

    switchTab(tabName) {
        console.log(`↔️ Cambiando a tab: ${tabName}`);
        this.state.activeTab = tabName;
        
        const tabVideos = document.getElementById('tabVideos');
        const tabGPX = document.getElementById('tabGPX');
        
        if (tabVideos && tabGPX) {
            tabVideos.classList.toggle('active', tabName === 'videos');
            tabGPX.classList.toggle('active', tabName === 'gpx');
        }
        
        const videosTab = document.getElementById('videosTab');
        const gpxTab = document.getElementById('gpxTab');
        
        if (videosTab && gpxTab) {
            videosTab.classList.toggle('active', tabName === 'videos');
            gpxTab.classList.toggle('active', tabName === 'gpx');
            
            if (tabName === 'videos') {
                videosTab.style.display = 'block';
                gpxTab.style.display = 'none';
            } else {
                videosTab.style.display = 'none';
                gpxTab.style.display = 'block';
                this.loadGPXFromStore();
            }
        }
        
        this.updateSelectionButtons();
    }

    showGallery() {
        console.log('📁 Mostrando galería');
        if (this.elements.galleryPanel) {
            this.elements.galleryPanel.classList.remove('hidden');
        }
        this.updateCompactSelectors();
        this.switchTab(this.state.activeTab);
        this.updateGalleryActions();
    }

    hideGallery() {
        if (this.elements.galleryPanel) {
            this.elements.galleryPanel.classList.add('hidden');
        }
        this.state.selectedVideos.clear();
        this.state.selectedGPX.clear();
        
        if (this.elements.galleryDropdownMenu) {
            this.elements.galleryDropdownMenu.classList.remove('show');
        }
    }

    updateCompactSelectors() {
        if (this.elements.locationHeader && this.elements.locationOptions) {
            const value = this.state.viewMode;
            const selectedOption = this.elements.locationOptions.querySelector(`.select-option[data-value="${value}"]`);
            
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                this.elements.locationHeader.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
                
                this.elements.locationOptions.querySelectorAll('.select-option').forEach(option => {
                    option.classList.remove('active');
                });
                selectedOption.classList.add('active');
            }
        }
        
        if (this.elements.typeHeader && this.elements.typeOptions) {
            const value = this.state.activeTab;
            const selectedOption = this.elements.typeOptions.querySelector(`.select-option[data-value="${value}"]`);
            
            if (selectedOption) {
                const icon = selectedOption.querySelector('span:first-child').textContent;
                const text = selectedOption.querySelector('span:last-child').textContent;
                this.elements.typeHeader.innerHTML = `<span>${icon} ${text}</span><span>▼</span>`;
                
                this.elements.typeOptions.querySelectorAll('.select-option').forEach(option => {
                    option.classList.remove('active');
                });
                selectedOption.classList.add('active');
            }
        }
    }

    // ============ SELECCIÓN Y ACCIONES ============

    toggleSelection(id, type) {
        // Normalizar ID (convertir a número si es posible)
        const normalizedId = this.normalizeId(id);
        
        if (type === 'video') {
            if (this.state.selectedVideos.has(normalizedId)) {
                this.state.selectedVideos.delete(normalizedId);
            } else {
                this.state.selectedVideos.add(normalizedId);
            }
            this.renderVideosList();
        } else if (type === 'gpx') {
            if (this.state.selectedGPX.has(normalizedId)) {
                this.state.selectedGPX.delete(normalizedId);
            } else {
                this.state.selectedGPX.add(normalizedId);
            }
        }
        
        this.updateGalleryActions();
    }

    // Añade esta función helper
// ============ FUNCIONES HELPER PARA HTML ============

    // Función para normalizar IDs (números vs strings)
    normalizeId(id) {
        if (id === null || id === undefined) {
            return null;
        }
        
        // Si es un ID local (string que empieza con "local_"), mantenerlo como string
        if (typeof id === 'string') {
            if (id.startsWith('local_')) {
                return id;
            }
            // Si es un string numérico, convertirlo
            const numId = Number(id);
            return isNaN(numId) ? id : numId;
        }
        
        // Si es número, mantenerlo
        if (typeof id === 'number') {
            return id;
        }
        
        // Para cualquier otro tipo, intentar convertir a string
        return String(id);
    }

    // Función para escapar HTML y prevenir inyección XSS
    escapeHTML(text) {
        if (text === null || text === undefined) {
            return '';
        }
        
        // Convertir a string si no lo es
        const str = String(text);
        
        // Reemplazar caracteres especiales
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Función para buscar videos en el estado
    findVideoInState(id) {
        console.log('🔍 Buscando video en estado con ID:', id);
        console.log('📊 Videos en estado:', this.state.videos.length);
        
        // Normalizar el ID de búsqueda
        const normalizedSearchId = this.normalizeId(id);
        console.log('🔍 ID normalizado para búsqueda:', normalizedSearchId);
        
        // Primero buscar coincidencia exacta
        let video = this.state.videos.find(v => {
            const normalizedVideoId = this.normalizeId(v.id);
            const found = normalizedVideoId === normalizedSearchId;
            console.log(`🔍 Comparando "${normalizedVideoId}" === "${normalizedSearchId}" -> ${found}`);
            return found;
        });
        
        if (!video) {
            console.log('🔍 No encontrado con ===, intentando con ==');
            // Si no se encuentra, intentar comparación flexible
            video = this.state.videos.find(v => {
                const normalizedVideoId = this.normalizeId(v.id);
                const found = normalizedVideoId == normalizedSearchId;
                console.log(`🔍 Comparando "${normalizedVideoId}" == "${normalizedSearchId}" -> ${found}`);
                return found;
            });
        }
        
        if (video) {
            console.log('✅ Video encontrado en estado:', video.filename);
        } else {
            console.log('❌ Video NO encontrado en estado');
        }
        
        return video;
    }

    selectAll(type) {
        if (type === 'video') {
            this.state.selectedVideos.clear();
            this.state.videos.forEach(video => this.state.selectedVideos.add(video.id));
            this.renderVideosList();
        } else {
            this.state.selectedGPX.clear();
            this.state.gpxTracks.forEach(track => this.state.selectedGPX.add(track.id));
        }
        
        this.updateGalleryActions();
    }

    deselectAll(type) {
        if (type === 'video' || this.state.activeTab === 'videos') {
            this.state.selectedVideos.clear();
            this.renderVideosList();
        } else {
            this.state.selectedGPX.clear();
        }
        
        this.updateSelectionButtons();
    }

    updateSelectionButtons() {
        const hasSelected = this.state.activeTab === 'videos' 
            ? this.state.selectedVideos.size > 0 
            : this.state.selectedGPX.size > 0;
        
        const totalItems = this.state.activeTab === 'videos'
            ? this.state.videos.length
            : this.state.gpxTracks.length;
        
        if (this.elements.selectAllVideos) {
            this.elements.selectAllVideos.disabled = totalItems === 0;
            this.elements.selectAllVideos.textContent = this.state.activeTab === 'videos' 
                ? 'Seleccionar todos' 
                : 'Seleccionar todos';
        }
        
        if (this.elements.deselectAllVideos) {
            this.elements.deselectAllVideos.disabled = !hasSelected;
            this.elements.deselectAllVideos.textContent = this.state.activeTab === 'videos'
                ? 'Deseleccionar todos'
                : 'Deseleccionar todos';
        }
        
        const exportBtn = document.getElementById('exportBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const moveToLocalBtn = document.getElementById('moveToLocalBtn');
        const combineVideosBtn = document.getElementById('combineVideosBtn');
        
        if (exportBtn) {
            exportBtn.disabled = !hasSelected;
            exportBtn.textContent = this.state.activeTab === 'videos' ? '📤 Exportar' : '📤 Exportar GPX';
        }
        
        if (deleteBtn) {
            deleteBtn.disabled = !hasSelected;
            deleteBtn.textContent = this.state.activeTab === 'videos' ? '🗑️ Eliminar' : '🗑️ Eliminar GPX';
        }
        
        if (moveToLocalBtn) {
            moveToLocalBtn.disabled = this.state.activeTab === 'gpx' || !hasSelected;
            moveToLocalBtn.style.display = this.state.activeTab === 'videos' ? 'block' : 'none';
        }
        
        if (combineVideosBtn) {
            combineVideosBtn.disabled = this.state.activeTab === 'gpx' || !hasSelected || this.state.selectedVideos.size < 2;
            combineVideosBtn.style.display = this.state.activeTab === 'videos' ? 'block' : 'none';
        }
    }

    selectAll(type = null) {
        const tabType = type || this.state.activeTab;
        
        if (tabType === 'videos') {
            this.state.selectedVideos.clear();
            this.state.videos.forEach(video => this.state.selectedVideos.add(video.id));
            this.renderVideosList();
        } else if (tabType === 'gpx') {
            this.state.selectedGPX.clear();
            this.state.gpxTracks.forEach(track => this.state.selectedGPX.add(track.id));
            this.renderGPXList();
        }
        
        this.updateSelectionButtons();
    }

    deselectAll(type = null) {
        const tabType = type || this.state.activeTab;
        
        if (tabType === 'videos') {
            this.state.selectedVideos.clear();
            this.renderVideosList();
        } else if (tabType === 'gpx') {
            this.state.selectedGPX.clear();
            this.renderGPXList();
        }
        
        this.updateSelectionButtons();
    }

    updateGalleryActions() {
        const hasSelectedVideos = this.state.selectedVideos.size > 0;
        
        const moveBtn = document.getElementById('moveToLocalBtn');
        const combineBtn = document.getElementById('combineVideosBtn');
        const exportBtn = document.getElementById('exportBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        
        if (moveBtn) moveBtn.disabled = !hasSelectedVideos;
        if (combineBtn) combineBtn.disabled = !hasSelectedVideos || this.state.selectedVideos.size < 2;
        if (exportBtn) exportBtn.disabled = !hasSelectedVideos;
        if (deleteBtn) deleteBtn.disabled = !hasSelectedVideos;
    }

    // ============ CONFIGURACIÓN ============

    async saveSettings() {
        try {
            const settings = {
                recordingMode: this.elements.recordingMode.value,
                segmentDuration: parseInt(this.elements.segmentDuration.value),
                videoQuality: this.elements.videoQuality.value,
                videoFormat: this.elements.videoFormat.value,
                gpxInterval: parseInt(this.elements.gpxInterval.value),
                overlayEnabled: this.elements.overlayEnabled.checked,
                audioEnabled: this.elements.audioEnabled.checked,
                reverseGeocodeEnabled: this.elements.reverseGeocodeEnabled.checked,
                watermarkOpacity: parseFloat(this.elements.watermarkOpacity.value),
                watermarkFontSize: this.state.settings.watermarkFontSize,
                watermarkPosition: this.state.settings.watermarkPosition,
                storageLocation: this.elements.storageLocation.value,
                keepAppCopy: this.elements.keepAppCopy.checked,
                showWatermark: this.elements.showWatermark.checked,
                logoPosition: this.elements.logoPosition.value,
                logoSize: this.elements.logoSize.value,
                customWatermarkText: this.state.settings.customWatermarkText,
                textPosition: this.elements.textPosition.value,
                gpxOverlayEnabled: this.elements.gpxOverlayEnabled.checked,
                showGpxDistance: this.elements.showGpxDistance.checked,
                showGpxSpeed: this.elements.showGpxSpeed.checked,
                embedGpsMetadata: this.elements.embedGpsMetadata.checked,
                metadataFrequency: parseInt(this.elements.metadataFrequency.value),
                localFolderName: this.state.settings.localFolderName,
                localFolderPath: this.state.settings.localFolderPath
            };
            
            this.state.settings = { 
                ...this.state.settings, 
                ...settings,
                localFolderHandle: this.state.settings.localFolderHandle
            };
            
            // Guardar en IndexedDB
            if (this.db) {
                try {
                    const transaction = this.db.transaction(['settings'], 'readwrite');
                    const store = transaction.objectStore('settings');
                    await store.put({ name: 'appSettings', value: settings });
                    console.log('⚙️ Configuración guardada en IndexedDB');
                } catch (error) {
                    console.warn('⚠️ Error guardando en IndexedDB:', error);
                }
            }
            
            // Guardar en localStorage como backup
            try {
                localStorage.setItem('dashcam_settings', JSON.stringify(settings));
                console.log('⚙️ Configuración guardada en localStorage');
            } catch (error) {
                console.warn('⚠️ Error guardando en localStorage:', error);
            }
            
            this.updateStorageStatus();
            this.updateSettingsUI();
            this.showNotification('⚙️ Configuración guardada');
            this.hideSettings();
            
        } catch (error) {
            console.error('❌ Error guardando configuración:', error);
            this.showNotification('❌ Error al guardar configuración');
        }
    }

    showSettings() {
        this.updateSettingsUI();
        if (this.elements.settingsPanel) {
            this.elements.settingsPanel.classList.remove('hidden');
        }
    }

    hideSettings() {
        if (this.elements.settingsPanel) {
            this.elements.settingsPanel.classList.add('hidden');
        }
    }

    async resetSettings() {
        if (!confirm('¿Restaurar configuración predeterminada?')) return;
        
        try {
            this.state.settings = {
                recordingMode: 'segmented',
                segmentDuration: 5,
                videoQuality: '720p',
                videoFormat: 'mp4',
                gpxInterval: 5,
                overlayEnabled: true,
                audioEnabled: false,
                reverseGeocodeEnabled: true,
                watermarkOpacity: 0.7,
                watermarkFontSize: 16,
                watermarkPosition: 'bottom',
                storageLocation: 'default',
                keepAppCopy: true,
                showWatermark: true,
                logoPosition: 'top-left',
                logoSize: 'medium',
                customWatermarkText: 'Powered By Roberto Benet - rbenet71@gmail.com',
                textPosition: 'bottom-right',
                gpxOverlayEnabled: false,
                showGpxDistance: true,
                showGpxSpeed: true,
                embedGpsMetadata: true,
                metadataFrequency: 2,
                localFolderHandle: null,
                localFolderName: null,
                localFolderPath: null
            };
            
            if (this.db) {
                const transaction = this.db.transaction(['settings'], 'readwrite');
                const store = transaction.objectStore('settings');
                await store.put({ name: 'appSettings', value: this.state.settings });
            } else {
                localStorage.setItem('dashcam_settings', JSON.stringify(this.state.settings));
            }
            
            this.updateSettingsUI();
            this.showNotification('🔄 Configuración restablecida');
            
        } catch (error) {
            console.error('❌ Error restableciendo configuración:', error);
            this.showNotification('❌ Error al restablecer configuración');
        }
    }

    // Estimación de duración basada en tamaño de archivo (último recurso)
    estimateDurationByFileSize(fileSize, format) {
        // Tabla de estimaciones (valores aproximados)
        const estimates = {
            'mp4': {
                '480p': 8000,  // 8 segundos por MB
                '720p': 5000,  // 5 segundos por MB
                '1080p': 3000, // 3 segundos por MB
                '4k': 1500     // 1.5 segundos por MB
            },
            'webm': {
                'default': 6000 // 6 segundos por MB
            }
        };
        
        const sizeMB = fileSize / (1024 * 1024);
        let secondsPerMB = 6000; // Valor por defecto
        
        if (format === 'mp4') {
            const quality = this.state.settings.videoQuality || '720p';
            secondsPerMB = estimates.mp4[quality] || estimates.mp4['720p'];
        } else {
            secondsPerMB = estimates.webm.default;
        }
        
        const estimatedMs = Math.round(sizeMB * secondsPerMB);
        console.log(`📏 Estimación por tamaño: ${sizeMB.toFixed(2)}MB × ${secondsPerMB}ms/MB = ${estimatedMs}ms`);
        
        return estimatedMs;
    }

    // ============ UTILIDADES ============

    formatTime(ms) {
        // Verificar si el valor es válido
        if (!ms || !isFinite(ms) || isNaN(ms) || ms === Infinity) {
            return '00:00';
        }
        
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }

    updateUI() {
        if (this.state.isRecording) {
            this.state.currentTime = Date.now() - this.state.startTime;
            
            if (this.elements.recordingTimeEl) {
                this.elements.recordingTimeEl.textContent = this.formatTime(this.state.currentTime);
            }
        }
    }

    startMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.updateInterval = setInterval(() => this.updateUI(), 1000);
    }

    showSavingStatus(message = '💾 Guardando...') {
        if (this.elements.savingStatus && this.elements.savingText) {
            this.elements.savingText.textContent = message;
            this.elements.savingStatus.classList.remove('hidden');
        }
    }

    hideSavingStatus() {
        if (this.elements.savingStatus) {
            this.elements.savingStatus.classList.add('hidden');
        }
    }

    updateStorageStatus() {
        const storageLocation = this.state.settings.storageLocation;
        let statusText = '';
        
        switch(storageLocation) {
            case 'default':
                statusText = '📱 Almacenando en la app';
                break;
            case 'localFolder':
                const folderName = this.state.settings.localFolderName || 'No seleccionada';
                statusText = `📂 Almacenando en: ${folderName}`;
                break;
        }
        
        if (this.elements.storageStatusText) {
            this.elements.storageStatusText.textContent = statusText;
            this.elements.storageStatus.classList.remove('hidden');
        }
    }

    checkOrientation() {
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return false;
        }
        
        if (sessionStorage.getItem('landscape_shown')) {
            return false;
        }
        
        const isVertical = window.innerHeight > window.innerWidth;
        
        if (isVertical) {
            sessionStorage.setItem('landscape_shown', 'true');
        }
        
        return isVertical;
    }

    showLandscapeModal() {
        this.state.showLandscapeModal = true;
        if (this.elements.landscapeModal) {
            this.elements.landscapeModal.classList.add('active');
        }
    }

    hideLandscapeModal() {
        this.state.showLandscapeModal = false;
        if (this.elements.landscapeModal) {
            this.elements.landscapeModal.classList.remove('active');
        }
    }

    // ============ BASE DE DATOS - UTILIDADES ============

    async saveToDatabase(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.log(`⚠️ Base de datos no disponible para ${storeName}`);
                resolve(null);
                return;
            }
            
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // Usar put() en lugar de add() para actualizar si ya existe
                const request = store.put(data);
                
                request.onsuccess = () => {
                    console.log(`✅ Guardado/Actualizado en ${storeName}:`, data.id || 'N/A');
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.warn(`⚠️ Error guardando en ${storeName}:`, request.error?.message);
                    
                    // Intentar con put() si add() falló por duplicado
                    if (request.error?.name === 'ConstraintError') {
                        console.log(`🔄 Intentando actualizar en ${storeName}...`);
                        const updateRequest = store.put(data);
                        updateRequest.onsuccess = () => {
                            console.log(`✅ Actualizado en ${storeName}:`, data.id || 'N/A');
                            resolve(updateRequest.result);
                        };
                        updateRequest.onerror = () => {
                            console.warn(`⚠️ Error actualizando en ${storeName}:`, updateRequest.error?.message);
                            resolve(null);
                        };
                    } else {
                        resolve(null);
                    }
                };
            } catch (error) {
                console.warn(`⚠️ Excepción guardando en ${storeName}:`, error.message);
                resolve(null);
            }
        });
    }

    async getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.log(`⚠️ Base de datos no inicializada para ${storeName}`);
                resolve([]);
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                console.log(`📊 ${storeName}: ${request.result.length} elementos`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error(`❌ Error obteniendo de ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    async getFromStore(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.log(`⚠️ Base de datos no inicializada para ${storeName}`);
                resolve(null);
                return;
            }
            
            // Verificar si el store existe
            if (!this.db.objectStoreNames.contains(storeName)) {
                console.warn(`⚠️ Store ${storeName} no existe`);
                resolve(null);
                return;
            }
            
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => {
                    console.warn(`⚠️ Error obteniendo de ${storeName}:`, request.error);
                    resolve(null);
                };
            } catch (error) {
                console.error(`❌ Excepción en getFromStore ${storeName}:`, error);
                resolve(null);
            }
        });
    }

    async deleteFromStore(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de datos no inicializada'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Añade esta función en la clase DashcamApp, por ejemplo después de loadGPXFiles()

    async loadGPXFromStore() {
        try {
            console.log('🗺️ Cargando rutas GPX desde fuentes reales...');
            
            let allGPX = [];
            
            // Escanear según el modo de vista
            if (this.state.viewMode === 'default') {
                // Mostrar GPX de la app
                allGPX = await this.scanAppGPXFiles();
                console.log(`📱 ${allGPX.length} GPX en la app`);
                
            } else if (this.state.viewMode === 'localFolder') {
                // Mostrar GPX de carpeta local
                allGPX = await this.scanLocalFolderGPXFiles();
                console.log(`📂 ${allGPX.length} GPX en carpeta local`);
                
                // También mostrar GPX de la app que están relacionados con videos locales
                const appGPX = await this.scanAppGPXFiles();
                const localGPX = allGPX.map(g => g.filename || g.title);
                
                // Agregar GPX de app que no están duplicados
                appGPX.forEach(gpx => {
                    if (!localGPX.includes(gpx.filename || gpx.title)) {
                        allGPX.push(gpx);
                    }
                });
            }
            
            // Ordenar por fecha (más recientes primero)
            this.state.gpxTracks = allGPX.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            console.log(`🗺️ Total GPX a mostrar: ${this.state.gpxTracks.length}`);
            
            this.renderGPXList();
            
        } catch (error) {
            console.error('❌ Error cargando GPX:', error);
            this.state.gpxTracks = [];
            this.renderGPXList();
        }
    }

    async scanAppGPXFiles() {
        try {
            console.log('🔍 Escaneando GPX en la app...');
            let gpxList = [];
            
            if (this.db) {
                // Buscar en gpxTracks (GPX generados automáticamente)
                const gpxTracks = await this.getAllFromStore('gpxTracks');
                gpxList = gpxList.concat(gpxTracks.map(gpx => ({
                    id: gpx.id,
                    title: gpx.title || 'Ruta GPX',
                    timestamp: gpx.timestamp,
                    size: gpx.size,
                    points: gpx.points,
                    location: 'app',
                    source: 'gpxTracks',
                    blob: gpx.blob,
                    gpxPoints: gpx.gpxPoints
                })));
                
                // También buscar en gpxFiles (GPX cargados manualmente)
                const gpxFiles = await this.getAllFromStore('gpxFiles');
                gpxList = gpxList.concat(gpxFiles.map(file => ({
                    id: file.id,
                    title: file.name || file.filename || 'GPX Cargado',
                    timestamp: file.uploadDate || file.timestamp,
                    size: file.fileSize,
                    points: file.points?.length || 0,
                    location: 'app',
                    source: 'gpxFiles',
                    blob: file.blob,
                    gpxData: file
                })));
                
                console.log(`📊 ${gpxList.length} GPX encontrados en la app`);
            }
            
            return gpxList;
            
        } catch (error) {
            console.error('❌ Error escaneando GPX de app:', error);
            return [];
        }
    }

    async scanLocalFolderGPXFiles() {
        try {
            console.log('🔍 Escaneando GPX en carpeta local...');
            let gpxList = [];
            
            if (!this.localFolderHandle) {
                console.log('⚠️ No hay carpeta local seleccionada');
                return [];
            }
            
            // Escanear carpeta raíz
            await this.scanFolderForGPX(this.localFolderHandle, '', gpxList);
            
            console.log(`📂 ${gpxList.length} GPX encontrados en carpeta local`);
            return gpxList;
            
        } catch (error) {
            console.error('❌ Error escaneando carpeta local:', error);
            return [];
        }
    }

    async scanFolderForGPX(folderHandle, path, gpxList) {
        try {
            const entries = [];
            
            // Leer directorio
            for await (const entry of folderHandle.values()) {
                entries.push(entry);
            }
            
            // Procesar archivos .gpx
            for (const entry of entries) {
                if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.gpx')) {
                    try {
                        const file = await entry.getFile();
                        const fileInfo = await this.getGPXFileInfo(file, path);
                        gpxList.push({
                            id: Date.now() + Math.random(), // ID temporal
                            title: entry.name.replace('.gpx', '').replace('.GPX', ''),
                            filename: entry.name,
                            path: path ? `${path}/${entry.name}` : entry.name,
                            timestamp: file.lastModified,
                            size: file.size,
                            location: 'localFolder',
                            source: 'filesystem',
                            fileHandle: entry, // Guardar referencia al archivo
                            file: file
                        });
                    } catch (error) {
                        console.warn(`⚠️ Error leyendo archivo ${entry.name}:`, error);
                    }
                }
                // También escanear subcarpetas (sesiones)
                else if (entry.kind === 'directory') {
                    const subPath = path ? `${path}/${entry.name}` : entry.name;
                    await this.scanFolderForGPX(entry, subPath, gpxList);
                }
            }
            
        } catch (error) {
            console.error(`❌ Error escaneando carpeta ${path}:`, error);
        }
    }

    async getGPXFileInfo(file, path) {
        try {
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            // Extraer información básica del GPX
            const nameElement = xmlDoc.querySelector('name, metadata > name');
            const points = xmlDoc.querySelectorAll('trkpt, wpt').length;
            
            return {
                name: nameElement ? nameElement.textContent : file.name.replace('.gpx', ''),
                points: points,
                path: path
            };
            
        } catch (error) {
            console.warn('⚠️ Error parseando GPX:', error);
            return {
                name: file.name.replace('.gpx', ''),
                points: 0,
                path: path
            };
        }
    }

    renderGPXList() {
        const container = this.elements.gpxList;
        if (!container) return;
        
        console.log('🗺️ Renderizando lista GPX:', this.state.gpxTracks.length);
        
        if (this.state.gpxTracks.length === 0) {
            let message = 'No hay rutas GPX';
            let submessage = 'Las rutas se crearán automáticamente al grabar videos con GPS';
            
            if (this.state.viewMode === 'localFolder') {
                message = 'No hay archivos GPX en la carpeta';
                submessage = 'Los archivos .gpx aparecerán aquí automáticamente';
            }
            
            container.innerHTML = `
                <div class="empty-state">
                    <div>🗺️</div>
                    <p>${message}</p>
                    <p>${submessage}</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="file-list">';
        
        this.state.gpxTracks.forEach((gpx, index) => {
            const date = new Date(gpx.timestamp || Date.now());
            const sizeKB = gpx.size ? Math.round(gpx.size / 1024) : 0;
            const dateStr = date.toLocaleDateString('es-ES');
            const timeStr = date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            const location = gpx.location || 'app';
            const source = gpx.source || 'unknown';
            const normalizedId = this.normalizeId(gpx.id || index);
            const isSelected = this.state.selectedGPX.has(normalizedId);
            
            // Icono según ubicación
            let locationIcon = '📱';
            let locationText = 'App';
            let locationClass = 'app-file';
            if (location === 'localFolder' || source === 'filesystem') {
                locationIcon = '📂';
                locationText = 'Local';
                locationClass = 'local-file';
            }
            
            // Información específica según fuente
            let detailsHTML = '';
            if (gpx.points) {
                detailsHTML += `<div>📍 ${gpx.points} puntos</div>`;
            }
            if (gpx.path) {
                detailsHTML += `<div>📁 ${gpx.path}</div>`;
            }
            if (gpx.distance) {
                detailsHTML += `<div>📏 ${gpx.distance.toFixed(2)} km</div>`;
            }
            
            html += `
                <div class="file-item gpx-file ${locationClass} ${isSelected ? 'selected' : ''}" 
                    data-id="${gpx.id || index}" 
                    data-type="gpx"
                    data-location="${location}"
                    data-source="${source}">
                    <div class="file-header">
                        <div class="file-title">${gpx.title || gpx.filename || 'Archivo GPX'}</div>
                        <div class="file-location" title="${locationText}">${locationIcon}</div>
                        <div class="file-format">GPX</div>
                        <div class="file-time">${timeStr}</div>
                    </div>
                    <div class="file-details">
                        <div>📅 ${dateStr}</div>
                        ${detailsHTML}
                        <div>💾 ${sizeKB} KB</div>
                        <div>${locationIcon} ${locationText}</div>
                    </div>
                    <div class="file-footer">
                        <div class="file-checkbox">
                            <input type="checkbox" ${isSelected ? 'checked' : ''}>
                            <span>Seleccionar</span>
                        </div>
                        <button class="play-btn view-gpx" data-id="${gpx.id || index}" data-source="${source}">
                            👁️ Ver
                        </button>
                        <button class="play-btn download-gpx" data-id="${gpx.id || index}" data-source="${source}">
                            📥 Descargar
                        </button>
                        ${source === 'filesystem' ? `
                            <button class="play-btn load-gpx" data-filename="${gpx.filename}" data-path="${gpx.path}">
                                📤 Cargar a App
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Configurar eventos
        this.setupGPXEventListeners();
    }

    setupGPXEventListeners() {
        const container = this.elements.gpxList;
        if (!container) return;
        
        console.log('🔄 Configurando eventos para GPX...');
        
        container.querySelectorAll('.gpx-file').forEach(item => {
            // Click en el item (excepto en botones y checkboxes)
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.play-btn') && !(e.target.type === 'checkbox')) {
                    const id = item.dataset.id;
                    this.toggleSelection(id, 'gpx');
                }
            });
            
            // Checkbox
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = item.dataset.id;
                    this.toggleSelection(id, 'gpx');
                });
            }
            
            // Botón de ver GPX
            const viewBtn = item.querySelector('.view-gpx');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const id = e.target.dataset.id;
                    const source = e.target.dataset.source;
                    console.log('👁️ Ver GPX clickeado, ID:', id, 'Fuente:', source);
                    this.viewGPX(id, source);
                });
            }
            
            // Botón de descargar GPX
            const downloadBtn = item.querySelector('.download-gpx');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = e.target.dataset.id;
                    const source = e.target.dataset.source;
                    await this.downloadGPX(id, source);
                });
            }
            
            // Botón de cargar a app
            const loadBtn = item.querySelector('.load-gpx');
            if (loadBtn) {
                loadBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const filename = e.target.dataset.filename;
                    const path = e.target.dataset.path;
                    await this.loadGPXFromFileSystem(filename, path);
                });
            }
        });
    }


    async viewGPX(gpxId, source = 'gpxTracks') {
        try {
            console.log('🗺️ Visualizando GPX:', gpxId, 'fuente:', source);
            
            let gpxData;
            
            if (source === 'filesystem') {
                // Para GPX del sistema de archivos
                gpxData = this.state.gpxTracks.find(g => (g.id == gpxId || g.filename === gpxId));
                
                if (gpxData) {
                    try {
                        if (gpxData.file) {
                            // Procesar el archivo GPX
                            const text = await gpxData.file.text();
                            gpxData = await this.parseGPXData(text, gpxData);
                        } else if (gpxData.blob) {
                            // Si ya tiene blob
                            const text = await gpxData.blob.text();
                            gpxData = await this.parseGPXData(text, gpxData);
                        }
                    } catch (parseError) {
                        console.error('❌ Error parseando archivo GPX:', parseError);
                        this.showNotification('❌ Formato GPX no compatible');
                        return;
                    }
                }
            } else {
                // Para GPX de la app
                let rawData = await this.getFromStore('gpxTracks', parseInt(gpxId));
                
                if (!rawData) {
                    // Intentar desde gpxFiles
                    rawData = await this.getFromStore('gpxFiles', parseInt(gpxId));
                }
                
                if (rawData) {
                    try {
                        if (rawData.blob) {
                            const text = await rawData.blob.text();
                            gpxData = await this.parseGPXData(text, rawData);
                        } else if (rawData.gpxData) {
                            // Si ya tiene datos procesados
                            gpxData = rawData.gpxData;
                        }
                    } catch (parseError) {
                        console.error('❌ Error parseando GPX de BD:', parseError);
                        this.showNotification('❌ Error al procesar GPX');
                        return;
                    }
                }
            }
            
            if (!gpxData) {
                this.showNotification('❌ No se pudo cargar el archivo GPX');
                return;
            }
            
            // Verificar si tiene puntos
            if (!gpxData.points || gpxData.points.length === 0) {
                console.warn('⚠️ GPX sin puntos válidos:', gpxData);
                this.showNotification('⚠️ GPX no contiene datos de ruta válidos');
                
                // Mostrar información básica aunque no tenga puntos
                this.showGPXViewer(gpxData);
                return;
            }
            
            console.log('✅ GPX cargado para visualización:', {
                name: gpxData.name,
                points: gpxData.points.length,
                distance: gpxData.stats.totalDistance.toFixed(2) + ' km'
            });
            
            // Mostrar panel de visualización
            this.showGPXViewer(gpxData);
            
        } catch (error) {
            console.error('❌ Error visualizando GPX:', error);
            this.showNotification('❌ Error al cargar GPX: ' + error.message);
        }
    }

    async debugGPXFile(file) {
        try {
            console.log('🐛 Debuggeando archivo GPX:', file.name);
            
            const text = await file.text();
            console.log('📄 Primeros 1000 caracteres del GPX:', text.substring(0, 1000));
            
            // Verificar estructura
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            // Verificar errores de parseo
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                console.error('❌ Error de parseo XML:', parserError.textContent);
            }
            
            // Contar diferentes tipos de elementos
            const counts = {
                trkpt: xmlDoc.getElementsByTagName('trkpt').length,
                wpt: xmlDoc.getElementsByTagName('wpt').length,
                rtept: xmlDoc.getElementsByTagName('rtept').length,
                trk: xmlDoc.getElementsByTagName('trk').length,
                rte: xmlDoc.getElementsByTagName('rte').length
            };
            
            console.log('📊 Conteo de elementos:', counts);
            
            // Extraer metadatos
            const metadata = {
                name: xmlDoc.querySelector('name')?.textContent,
                desc: xmlDoc.querySelector('desc')?.textContent,
                author: xmlDoc.querySelector('author')?.textContent,
                time: xmlDoc.querySelector('time')?.textContent
            };
            
            console.log('📝 Metadatos:', metadata);
            
            // Mostrar primeros puntos
            const firstPoints = [];
            const trkpts = xmlDoc.getElementsByTagName('trkpt');
            for (let i = 0; i < Math.min(3, trkpts.length); i++) {
                const trkpt = trkpts[i];
                firstPoints.push({
                    lat: trkpt.getAttribute('lat'),
                    lon: trkpt.getAttribute('lon'),
                    ele: trkpt.querySelector('ele')?.textContent,
                    time: trkpt.querySelector('time')?.textContent
                });
            }
            
            console.log('📍 Primeros puntos:', firstPoints);
            
            return { counts, metadata, firstPoints };
            
        } catch (error) {
            console.error('❌ Error debuggeando GPX:', error);
            return null;
        }
    }

    async parseGPXData(gpxText, originalData) {
        try {
            console.log('🔍 Parseando datos GPX...');
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(gpxText, 'text/xml');
            
            // Verificar si el XML es válido
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                console.error('❌ Error parseando XML GPX:', parserError.textContent);
                throw new Error('Formato GPX inválido');
            }
            
            // Extraer nombre (probar diferentes ubicaciones)
            let name = originalData.name || originalData.filename || 'Ruta GPX';
            const nameElements = [
                xmlDoc.querySelector('metadata > name'),
                xmlDoc.querySelector('trk > name'),
                xmlDoc.querySelector('rte > name'),
                xmlDoc.querySelector('gpx > name'),
                xmlDoc.querySelector('name')
            ];
            
            for (const nameElement of nameElements) {
                if (nameElement && nameElement.textContent && nameElement.textContent.trim()) {
                    name = nameElement.textContent.trim();
                    break;
                }
            }
            
            // Extraer puntos de diferentes tipos
            const trackPoints = [];
            
            // Intentar extraer puntos de track (trkseg > trkpt)
            const trkpts = xmlDoc.getElementsByTagName('trkpt');
            if (trkpts.length > 0) {
                console.log(`📍 Encontrados ${trkpts.length} puntos de track (trkpt)`);
                for (let i = 0; i < trkpts.length; i++) {
                    const trkpt = trkpts[i];
                    const point = this.extractPointData(trkpt);
                    if (point) trackPoints.push(point);
                }
            }
            
            // Si no hay puntos de track, intentar con waypoints (wpt)
            if (trackPoints.length === 0) {
                const wpts = xmlDoc.getElementsByTagName('wpt');
                if (wpts.length > 0) {
                    console.log(`📍 Encontrados ${wpts.length} waypoints (wpt)`);
                    for (let i = 0; i < wpts.length; i++) {
                        const wpt = wpts[i];
                        const point = this.extractPointData(wpt);
                        if (point) trackPoints.push(point);
                    }
                }
            }
            
            // Si aún no hay puntos, intentar con puntos de ruta (rtept)
            if (trackPoints.length === 0) {
                const rtepts = xmlDoc.getElementsByTagName('rtept');
                if (rtepts.length > 0) {
                    console.log(`📍 Encontrados ${rtepts.length} puntos de ruta (rtept)`);
                    for (let i = 0; i < rtepts.length; i++) {
                        const rtept = rtepts[i];
                        const point = this.extractPointData(rtept);
                        if (point) trackPoints.push(point);
                    }
                }
            }
            
            // Si no hay puntos en absoluto, lanzar error
            if (trackPoints.length === 0) {
                console.warn('⚠️ No se encontraron puntos en el archivo GPX');
                
                // Intentar método alternativo: buscar coordenadas en el texto
                const coordMatches = gpxText.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/g);
                if (coordMatches && coordMatches.length > 0) {
                    console.log(`🔄 Encontradas ${coordMatches.length} coordenadas por regex`);
                    coordMatches.forEach((match, index) => {
                        const coords = match.split(/[,\s]+/).map(Number);
                        if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                            trackPoints.push({
                                lat: coords[0],
                                lon: coords[1],
                                ele: 0,
                                time: null,
                                speed: 0,
                                timestamp: Date.now() + index
                            });
                        }
                    });
                }
            }
            
            console.log(`✅ Puntos extraídos: ${trackPoints.length}`);
            
            // Calcular estadísticas
            const stats = this.calculateGPXStats(trackPoints);
            
            // Preparar datos finales
            const gpxData = {
                id: originalData.id || Date.now(),
                name: name,
                filename: originalData.filename || 'ruta.gpx',
                points: trackPoints,
                stats: stats,
                metadata: originalData,
                rawText: gpxText.substring(0, 500) + '...' // Guardar parte del texto para debugging
            };
            
            console.log('📊 Estadísticas GPX calculadas:', {
                puntos: stats.totalPoints,
                distancia: stats.totalDistance.toFixed(2) + ' km',
                tiempo: stats.totalTimeFormatted,
                elevacion: `${stats.minElevation.toFixed(0)}-${stats.maxElevation.toFixed(0)} m`
            });
            
            return gpxData;
            
        } catch (error) {
            console.error('❌ Error parseando GPX:', error);
            
            // Devolver datos básicos si hay error
            return {
                id: originalData.id || Date.now(),
                name: originalData.name || originalData.filename || 'Ruta GPX',
                filename: originalData.filename || 'ruta.gpx',
                points: [],
                stats: {
                    totalPoints: 0,
                    totalDistance: 0,
                    totalTime: 0,
                    totalTimeFormatted: '00:00',
                    avgSpeed: 0,
                    avgSpeedKmh: 0,
                    maxSpeed: 0,
                    minElevation: 0,
                    maxElevation: 0,
                    elevationGain: 0,
                    elevationLoss: 0,
                    startTime: null,
                    endTime: null
                },
                metadata: originalData,
                error: error.message
            };
        }
    }

