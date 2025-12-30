    calculateGPXStats(points) {
        if (!points || points.length === 0) {
            return {
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
            };
        }
        
        let totalDistance = 0;
        let totalElevationGain = 0;
        let totalElevationLoss = 0;
        let minElevation = Infinity;
        let maxElevation = -Infinity;
        let maxSpeed = 0;
        let startTime = null;
        let endTime = null;
        
        // Filtrar solo puntos válidos con tiempo
        const validPoints = points.filter(p => p && p.time);
        
        // Encontrar tiempos de inicio y fin
        if (validPoints.length > 0) {
            // Ordenar por tiempo para asegurar correcto orden
            validPoints.sort((a, b) => a.time - b.time);
            startTime = validPoints[0].time;
            endTime = validPoints[validPoints.length - 1].time;
        }
        
        // Calcular estadísticas
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (!point) continue;
            
            // Elevación
            if (point.ele !== undefined) {
                if (point.ele < minElevation) minElevation = point.ele;
                if (point.ele > maxElevation) maxElevation = point.ele;
                
                // Ganancia/pérdida de elevación
                if (i > 0 && points[i-1] && points[i-1].ele !== undefined) {
                    const prevEle = points[i-1].ele;
                    const eleDiff = point.ele - prevEle;
                    if (eleDiff > 0) totalElevationGain += eleDiff;
                    else totalElevationLoss += Math.abs(eleDiff);
                }
            }
            
            // Velocidad
            if (point.speed && point.speed > maxSpeed) {
                maxSpeed = point.speed;
            }
            
            // Distancia
            if (i > 0 && points[i-1]) {
                const prevPoint = points[i-1];
                const distance = this.calculateDistance(
                    prevPoint.lat, prevPoint.lon,
                    point.lat, point.lon
                );
                totalDistance += distance;
                
                // Calcular velocidad entre puntos si tenemos tiempo
                if (point.time && prevPoint.time && distance > 0) {
                    const timeDiff = (point.time - prevPoint.time) / 1000; // en segundos
                    if (timeDiff > 0) {
                        const speed = distance / (timeDiff / 3600); // km/h
                        if (speed > maxSpeed) maxSpeed = speed;
                        
                        // Si el punto no tenía velocidad, asignar la calculada
                        if (!point.speed || point.speed === 0) {
                            point.speed = speed / 3.6; // convertir a m/s para consistencia
                        }
                    }
                }
            }
        }
        
        // Calcular tiempo total
        const totalTimeMs = startTime && endTime ? endTime - startTime : 0;
        
        // Calcular velocidad promedio
        const totalTimeHours = totalTimeMs / (1000 * 60 * 60);
        const avgSpeedKmh = totalTimeHours > 0 ? totalDistance / totalTimeHours : 0;
        
        return {
            totalPoints: points.length,
            totalDistance: totalDistance,
            totalTime: totalTimeMs,
            totalTimeFormatted: this.formatTime(totalTimeMs),
            avgSpeed: avgSpeedKmh / 3.6, // en m/s
            avgSpeedKmh: avgSpeedKmh,
            maxSpeed: maxSpeed,
            minElevation: minElevation === Infinity ? 0 : minElevation,
            maxElevation: maxElevation === -Infinity ? 0 : maxElevation,
            elevationGain: totalElevationGain,
            elevationLoss: totalElevationLoss,
            startTime: startTime,
            endTime: endTime
        };
    }
    
    extractPointData(pointElement) {
        try {
            const lat = parseFloat(pointElement.getAttribute('lat'));
            const lon = parseFloat(pointElement.getAttribute('lon'));
            
            // Validar coordenadas
            if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                console.warn('⚠️ Coordenadas inválidas:', lat, lon);
                return null;
            }
            
            const point = {
                lat: lat,
                lon: lon,
                ele: 0,
                time: null,
                speed: 0,
                timestamp: Date.now()
            };
            
            // Extraer elevación
            const eleElement = pointElement.querySelector('ele');
            if (eleElement && eleElement.textContent) {
                const eleValue = parseFloat(eleElement.textContent);
                if (!isNaN(eleValue)) point.ele = eleValue;
            }
            
            // MEJORADA: Extraer tiempo con múltiples formatos
            const timeElement = pointElement.querySelector('time');
            if (timeElement && timeElement.textContent) {
                try {
                    // Intentar parsear diferentes formatos de tiempo
                    let timeString = timeElement.textContent.trim();
                    
                    // Ajustar para formato ISO con 'Z' o sin ella
                    if (timeString.endsWith('Z')) {
                        point.time = new Date(timeString);
                    } else {
                        // Si no tiene 'Z', asumir UTC o añadirla
                        if (timeString.includes('T')) {
                            // Formato ISO sin Z: "2023-10-15T14:30:00"
                            point.time = new Date(timeString + 'Z');
                        } else {
                            // Otros formatos
                            point.time = new Date(timeString);
                        }
                    }
                    
                    if (!isNaN(point.time.getTime())) {
                        point.timestamp = point.time.getTime();
                        // Debug: mostrar algunos tiempos
                        if (Math.random() < 0.001) { // Solo para algunos puntos
                            console.log('⏰ Tiempo extraído:', point.time.toISOString());
                        }
                    } else {
                        console.warn('⚠️ Tiempo inválido:', timeString);
                    }
                } catch (e) {
                    console.warn('⚠️ Error parseando tiempo:', e);
                }
            }
            
            // Extraer velocidad (puede estar como 'speed' o 'gpxtpx:speed')
            const speedElements = [
                pointElement.querySelector('speed'),
                pointElement.querySelector('gpxtpx\\:speed'),
                pointElement.querySelector('[speed]'),
                pointElement.querySelector('extensions > speed'),
                pointElement.querySelector('extensions > gpxtpx\\:speed')
            ];
            
            for (const speedEl of speedElements) {
                if (speedEl && speedEl.textContent) {
                    const speedValue = parseFloat(speedEl.textContent);
                    if (!isNaN(speedValue)) {
                        point.speed = speedValue;
                        break;
                    }
                }
            }
            
            // Si no hay velocidad en los datos, calcularla basada en posición y tiempo
            if (point.speed === 0 && point.time) {
                // La velocidad se calculará después cuando procesemos todos los puntos
            }
            
            // Extraer frecuencia cardíaca
            const hrElements = [
                pointElement.querySelector('gpxtpx\\:hr'),
                pointElement.querySelector('hr'),
                pointElement.querySelector('[hr]'),
                pointElement.querySelector('extensions > gpxtpx\\:hr'),
                pointElement.querySelector('extensions > hr')
            ];
            
            for (const hrEl of hrElements) {
                if (hrEl && hrEl.textContent) {
                    const hrValue = parseInt(hrEl.textContent);
                    if (!isNaN(hrValue)) {
                        point.hr = hrValue;
                        break;
                    }
                }
            }
            
            // Extraer cadencia
            const cadElements = [
                pointElement.querySelector('gpxtpx\\:cad'),
                pointElement.querySelector('cad'),
                pointElement.querySelector('[cad]'),
                pointElement.querySelector('extensions > gpxtpx\\:cad'),
                pointElement.querySelector('extensions > cad')
            ];
            
            for (const cadEl of cadElements) {
                if (cadEl && cadEl.textContent) {
                    const cadValue = parseInt(cadEl.textContent);
                    if (!isNaN(cadValue)) {
                        point.cad = cadValue;
                        break;
                    }
                }
            }
            
            return point;
            
        } catch (error) {
            console.warn('⚠️ Error extrayendo datos de punto:', error);
            return null;
        }
    }

    async downloadGPX(gpxId, source = 'gpxTracks') {
        try {
            console.log('📥 Descargando GPX:', gpxId, 'fuente:', source);
            
            let blob;
            let filename = 'ruta.gpx';
            
            if (source === 'gpxFiles') {
                // 1. Obtener datos de la base de datos
                const gpxData = await this.getFromStore('gpxFiles', parseInt(gpxId));
                
                if (gpxData) {
                    console.log('✅ GPX encontrado en gpxFiles:', {
                        name: gpxData.name,
                        filename: gpxData.filename,
                        tieneBlob: !!gpxData.blob,
                        fileSize: gpxData.fileSize
                    });
                    
                    // 2. Si tiene blob, usarlo
                    if (gpxData.blob) {
                        blob = gpxData.blob;
                        filename = gpxData.filename || `${gpxData.name}.gpx`;
                        console.log('✅ Usando blob existente');
                    }
                    // 3. Si NO tiene blob pero tiene gpxData con puntos
                    else if (gpxData.gpxData && gpxData.gpxData.points) {
                        console.log('🔄 Creando blob desde puntos GPX...');
                        const gpxContent = this.generateGPXFromPoints(gpxData.gpxData.points, gpxData.name);
                        blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
                        filename = gpxData.filename || `${gpxData.name}.gpx`;
                        console.log('✅ Blob creado desde puntos');
                    }
                    // 4. Si tiene fileSize pero no blob ni puntos, es un GPX externo
                    else if (gpxData.fileSize && gpxData.fileSize > 0) {
                        console.log('🔄 Es un GPX externo, intentando obtener del sistema de archivos...');
                        
                        // Buscar en la carpeta local
                        if (this.localFolderHandle) {
                            try {
                                // Intentar encontrar el archivo por nombre
                                const fileHandle = await this.localFolderHandle.getFileHandle(gpxData.filename);
                                const file = await fileHandle.getFile();
                                blob = file;
                                filename = gpxData.filename;
                                console.log('✅ Archivo encontrado en carpeta local');
                                
                                // Actualizar la base de datos con el blob
                                gpxData.blob = blob;
                                await this.saveToDatabase('gpxFiles', gpxData);
                                console.log('✅ Base de datos actualizada con blob');
                            } catch (fsError) {
                                console.warn('⚠️ No se encontró en carpeta local:', fsError);
                            }
                        }
                    }
                }
            }
            
            // Si aún no tenemos blob, probar otras fuentes
            if (!blob) {
                // Intentar desde gpxTracks
                const gpxTracksData = await this.getFromStore('gpxTracks', parseInt(gpxId));
                if (gpxTracksData?.blob) {
                    blob = gpxTracksData.blob;
                    filename = gpxTracksData.filename || 'ruta.gpx';
                    console.log('✅ Usando blob de gpxTracks');
                }
            }
            
            // SI NADA FUNCIONA, crear un GPX básico
            if (!blob) {
                console.log('⚠️ Creando GPX básico como último recurso...');
                const basicGPX = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="Dashcam PWA Pro">
    <metadata>
        <name>Ruta Exportada</name>
        <time>${new Date().toISOString()}</time>
    </metadata>
    <trk>
        <name>Ruta Exportada</name>
        <desc>Exportado desde Dashcam PWA</desc>
    </trk>
    </gpx>`;
                
                blob = new Blob([basicGPX], { type: 'application/gpx+xml' });
                filename = `ruta_exportada_${Date.now()}.gpx`;
                console.log('✅ GPX básico creado');
            }
            
            // Verificar y descargar
            if (blob && blob.size > 0) {
                console.log(`✅ Descargando: ${filename} (${Math.round(blob.size / 1024)} KB)`);
                this.downloadBlob(blob, filename);
                this.showNotification('🗺️ GPX descargado');
            } else {
                console.error('❌ Blob inválido o vacío');
                this.showNotification('❌ Error: Archivo GPX inválido');
            }
            
        } catch (error) {
            console.error('❌ Error descargando GPX:', error);
            this.showNotification('❌ Error al descargar GPX');
        }
    }

    // Función para generar GPX desde puntos (si no la tienes)
    generateGPXFromPoints(points, name = 'Ruta GPX') {
        if (!points || points.length === 0) {
            return `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="Dashcam PWA Pro">
    <metadata>
        <name>${name}</name>
        <time>${new Date().toISOString()}</time>
    </metadata>
    <trk>
        <name>${name}</name>
        <desc>Sin puntos de track</desc>
    </trk>
    </gpx>`;
        }
        
        let gpx = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="Dashcam PWA Pro">
    <metadata>
        <name>${name}</name>
        <time>${new Date().toISOString()}</time>
    </metadata>
    <trk>
        <name>${name}</name>
        <trkseg>`;
        
        points.forEach(point => {
            const time = point.time ? point.time.toISOString() : new Date().toISOString();
            
            gpx += `
        <trkpt lat="${point.lat}" lon="${point.lon}">`;
            
            if (point.ele !== undefined) {
                gpx += `
            <ele>${point.ele}</ele>`;
            }
            
            gpx += `
            <time>${time}</time>`;
            
            if (point.speed !== undefined) {
                gpx += `
            <speed>${point.speed}</speed>`;
            }
            
            gpx += `
        </trkpt>`;
        });
        
        gpx += `
        </trkseg>
    </trk>
    </gpx>`;
        
        return gpx;
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async loadGPXFromFileSystem(filename, path) {
        try {
            console.log('📤 Cargando GPX desde sistema de archivos:', filename);
            
            if (!this.localFolderHandle) {
                this.showNotification('❌ No hay carpeta local seleccionada');
                return;
            }
            
            // Obtener archivo
            const parts = path.split('/');
            let currentHandle = this.localFolderHandle;
            
            for (const part of parts) {
                if (part && part !== filename) {
                    currentHandle = await currentHandle.getDirectoryHandle(part);
                }
            }
            
            const fileHandle = await currentHandle.getFileHandle(filename);
            const file = await fileHandle.getFile();
            
            // LEER EL ARCHIVO COMPLETO COMO BLOB
            const blob = new Blob([await file.arrayBuffer()], { type: 'application/gpx+xml' });
            
            // Crear datos del GPX
            const gpxData = {
                id: Date.now(),
                name: filename.replace('.gpx', '').replace('.GPX', ''),
                filename: filename,
                uploadDate: Date.now(),
                fileSize: file.size,
                blob: blob, // ←←← ¡ESTO ES LO IMPORTANTE QUE FALTABA!
                lastModified: file.lastModified,
                source: 'filesystem'
            };
            
            // Guardar en la base de datos
            if (this.db) {
                await this.saveToDatabase('gpxFiles', gpxData);
                
                // Actualizar lista en memoria
                this.state.loadedGPXFiles.push(gpxData);
                this.updateGpxSelect();
                
                this.showNotification(`✅ GPX cargado: ${gpxData.name}`);
                
                // Recargar la lista
                this.loadGPXFromStore();
            }
            
        } catch (error) {
            console.error('❌ Error cargando GPX desde sistema de archivos:', error);
            this.showNotification('❌ Error al cargar GPX');
        }
    }
    showGPXViewer(gpxData) {
        try {
            console.log('🗺️ Mostrando visualizador GPX:', gpxData.name);
            
            // Crear o mostrar panel de visualización
            let viewerPanel = document.getElementById('gpxViewerPanel');
            
            if (!viewerPanel) {
                // Crear panel si no existe
                viewerPanel = document.createElement('div');
                viewerPanel.id = 'gpxViewerPanel';
                viewerPanel.className = 'fullscreen-panel hidden';
                viewerPanel.innerHTML = `
                    <div class="panel-header">
                        <h2>🗺️ Visualizador GPX</h2>
                        <button id="closeGpxViewer" class="close-btn">✕</button>
                    </div>
                    <div class="panel-content">
                        <div class="gpx-viewer-container">
                            <div class="gpx-info-panel">
                                <div class="gpx-header">
                                    <h3 id="gpxViewerTitle">Cargando...</h3>
                                    <div class="gpx-meta">
                                        <span id="gpxViewerFilename"></span>
                                        <span id="gpxViewerDate"></span>
                                    </div>
                                </div>
                                
                                <div class="gpx-stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-icon">📍</div>
                                        <div class="stat-value" id="gpxPoints2">0</div>
                                        <div class="stat-label">Puntos</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">📏</div>
                                        <div class="stat-value" id="gpxDistance2">0 km</div>
                                        <div class="stat-label">Distancia</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">⏱️</div>
                                        <div class="stat-value" id="gpxDuration2">00:00</div>
                                        <div class="stat-label">Duración</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">⚡</div>
                                        <div class="stat-value" id="gpxAvgSpeed2">0 km/h</div>
                                        <div class="stat-label">Velocidad</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">⬆️</div>
                                        <div class="stat-value" id="gpxElevationGain">0 m</div>
                                        <div class="stat-label">Subida</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">⬇️</div>
                                        <div class="stat-value" id="gpxElevationLoss">0 m</div>
                                        <div class="stat-label">Bajada</div>
                                    </div>
                                </div>
                                
                                <div class="gpx-details">
                                    <div class="detail-row">
                                        <span>📅 Inicio:</span>
                                        <span id="gpxStartTime">--:--</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>📅 Fin:</span>
                                        <span id="gpxEndTime">--:--</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>📈 Elevación min:</span>
                                        <span id="gpxMinElevation">0 m</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>📉 Elevación max:</span>
                                        <span id="gpxMaxElevation">0 m</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>🚀 Velocidad max:</span>
                                        <span id="gpxMaxSpeed">0 km/h</span>
                                    </div>
                                </div>
                                
                                <div class="gpx-actions">
                                    <button id="exportGpxAsKml" class="btn action-btn">
                                        📤 Exportar KML
                                    </button>
                                    <button id="exportGpxAsJson" class="btn action-btn">
                                        📊 Exportar JSON
                                    </button>
                                    <button id="showGpxOnMap" class="btn primary-btn">
                                        🗺️ Ver en mapa grande
                                    </button>
                                </div>
                            </div>
                            
                            <div class="gpx-map-container">
                                <div id="gpxViewerMap"></div>
                                <div class="map-controls">
                                    <button id="zoomInBtn" class="map-btn">+</button>
                                    <button id="zoomOutBtn" class="map-btn">-</button>
                                    <button id="fitBoundsBtn" class="map-btn">🗺️</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(viewerPanel);
                
                // Configurar eventos del panel
                document.getElementById('closeGpxViewer').addEventListener('click', () => {
                    this.hideGPXViewer();
                });
                
                document.getElementById('exportGpxAsKml').addEventListener('click', () => {
                    this.exportGPXAsKML(gpxData);
                });
                
                document.getElementById('exportGpxAsJson').addEventListener('click', () => {
                    this.exportGPXAsJSON(gpxData);
                });
                
                document.getElementById('showGpxOnMap').addEventListener('click', () => {
                    this.showFullscreenMap(gpxData);
                });
            }
            
            // Actualizar datos en el panel
            this.updateGPXViewerData(gpxData);
            
            // Mostrar panel
            viewerPanel.classList.remove('hidden');
            
            // Inicializar mapa después de que el panel esté visible
            setTimeout(() => {
                this.initGPXViewerMap(gpxData);
            }, 100);
            
        } catch (error) {
            console.error('❌ Error mostrando visualizador GPX:', error);
            this.showNotification('❌ Error al mostrar GPX');
        }
    }

    updateGPXViewerData(gpxData) {
        try {
            const stats = gpxData.stats;
            
            // Actualizar información básica
            document.getElementById('gpxViewerTitle').textContent = gpxData.name;
            document.getElementById('gpxViewerFilename').textContent = gpxData.filename;
            
            if (gpxData.metadata && gpxData.metadata.timestamp) {
                const date = new Date(gpxData.metadata.timestamp);
                document.getElementById('gpxViewerDate').textContent = 
                    date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            }
            
            // Actualizar estadísticas - CORREGIDO: usar 'gpxDistance2' en lugar de 'gpxDistance'
            document.getElementById('gpxPoints2').textContent = stats.totalPoints.toLocaleString();
            document.getElementById('gpxDistance2').textContent = stats.totalDistance.toFixed(2) + ' km';
            document.getElementById('gpxDuration2').textContent = stats.totalTimeFormatted;
            document.getElementById('gpxAvgSpeed2').textContent = stats.avgSpeedKmh.toFixed(1) + ' km/h';
            document.getElementById('gpxElevationGain').textContent = stats.elevationGain.toFixed(0) + ' m';
            document.getElementById('gpxElevationLoss').textContent = stats.elevationLoss.toFixed(0) + ' m';
            
            // Actualizar detalles
            if (stats.startTime) {
                document.getElementById('gpxStartTime').textContent = 
                    stats.startTime.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            }
            
            if (stats.endTime) {
                document.getElementById('gpxEndTime').textContent = 
                    stats.endTime.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            }
            
            document.getElementById('gpxMinElevation').textContent = stats.minElevation.toFixed(0) + ' m';
            document.getElementById('gpxMaxElevation').textContent = stats.maxElevation.toFixed(0) + ' m';
            document.getElementById('gpxMaxSpeed').textContent = (stats.maxSpeed * 3.6).toFixed(1) + ' km/h';
            
        } catch (error) {
            console.error('❌ Error actualizando datos del visualizador GPX:', error);
        }
    }
    
    initGPXViewerMap(gpxData) {
        try {
            const mapContainer = document.getElementById('gpxViewerMap');
            if (!mapContainer) {
                console.error('❌ No se encontró el contenedor del mapa');
                return;
            }
            
            // Limpiar contenido anterior
            mapContainer.innerHTML = '';
            
            if (!gpxData.points || gpxData.points.length === 0) {
                mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ No hay datos GPS para mostrar</span></div>';
                return;
            }
            
            if (typeof L === 'undefined') {
                mapContainer.innerHTML = '<div class="map-loading"><span>❌ Leaflet no está disponible</span></div>';
                return;
            }
            
            // Calcular centro y bounds
            const points = gpxData.points;
            const bounds = this.calculateTrackBounds(points);
            const center = this.calculateTrackCenter(points);
            
            // Crear mapa
            const map = L.map('gpxViewerMap', {
                center: center,
                zoom: 13,
                zoomControl: false, // Usaremos controles personalizados
                attributionControl: true
            });
            
            // Añadir capa base
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);
            
            // Añadir capa de relieve (opcional)
            L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 17,
                opacity: 0.3
            }).addTo(map);
            
            // Dibujar la ruta
            const latLngs = points.map(point => [point.lat, point.lon]);
            const routeLine = L.polyline(latLngs, {
                color: '#00a8ff',
                weight: 4,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
            }).addTo(map);
            
            // Añadir marcador de inicio
            const startPoint = points[0];
            const startMarker = L.marker([startPoint.lat, startPoint.lon], {
                icon: L.divIcon({
                    className: 'start-marker',
                    html: '<div>🚩</div>',
                    iconSize: [30, 30]
                })
            }).addTo(map);
            startMarker.bindTooltip('📍 Punto de inicio', { direction: 'top' });
            
            // Añadir marcador de fin
            const endPoint = points[points.length - 1];
            const endMarker = L.marker([endPoint.lat, endPoint.lon], {
                icon: L.divIcon({
                    className: 'end-marker',
                    html: '<div>🏁</div>',
                    iconSize: [30, 30]
                })
            }).addTo(map);
            endMarker.bindTooltip('🏁 Punto final', { direction: 'top' });
            
            // Añadir controles de zoom personalizados
            L.control.zoom({
                position: 'topright'
            }).addTo(map);
            
            // Ajustar vista
            map.fitBounds(bounds, { padding: [30, 30] });
            
            // Forzar redibujado
            setTimeout(() => {
                map.invalidateSize();
                
                // Configurar controles personalizados
                document.getElementById('zoomInBtn').addEventListener('click', () => {
                    map.zoomIn();
                });
                
                document.getElementById('zoomOutBtn').addEventListener('click', () => {
                    map.zoomOut();
                });
                
                document.getElementById('fitBoundsBtn').addEventListener('click', () => {
                    map.fitBounds(bounds, { padding: [30, 30] });
                });
            }, 300);
            
            // Guardar referencia al mapa
            this.gpxViewerMap = map;
            
            console.log('✅ Mapa GPX inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando mapa GPX:', error);
            const mapContainer = document.getElementById('gpxViewerMap');
            if (mapContainer) {
                mapContainer.innerHTML = `
                    <div class="map-loading">
                        <span>❌ Error cargando mapa</span>
                        <br>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        }
    }
    exportGPXAsKML(gpxData) {
        try {
            console.log('📤 Exportando GPX como KML...');
            
            // Crear KML básico
            let kml = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
        <name>${gpxData.name || 'Ruta'}</name>
        <description>Exportado desde Dashcam PWA</description>
        <Style id="trackStyle">
        <LineStyle>
            <color>ff00a8ff</color>
            <width>4</width>
        </LineStyle>
        </Style>
        <Placemark>
        <name>${gpxData.name || 'Ruta'}</name>
        <styleUrl>#trackStyle</styleUrl>
        <LineString>
            <extrude>1</extrude>
            <tessellate>1</tessellate>
            <altitudeMode>absolute</altitudeMode>
            <coordinates>`;
            
            // Añadir coordenadas
            gpxData.points.forEach(point => {
                kml += `
            ${point.lon},${point.lat},${point.ele || 0}`;
            });
            
            kml += `
            </coordinates>
        </LineString>
        </Placemark>
    </Document>
    </kml>`;
            
            const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
            this.downloadBlob(blob, `${gpxData.name || 'ruta'}.kml`);
            
            this.showNotification('✅ GPX exportado como KML');
            
        } catch (error) {
            console.error('❌ Error exportando KML:', error);
            this.showNotification('❌ Error al exportar KML');
        }
    }

    exportGPXAsJSON(gpxData) {
        try {
            console.log('📊 Exportando GPX como JSON...');
            
            // Preparar datos para JSON
            const exportData = {
                name: gpxData.name,
                filename: gpxData.filename,
                stats: gpxData.stats,
                points: gpxData.points.map(point => ({
                    lat: point.lat,
                    lon: point.lon,
                    ele: point.ele,
                    time: point.time ? point.time.toISOString() : null,
                    speed: point.speed,
                    hr: point.hr,
                    cad: point.cad
                })),
                exportDate: new Date().toISOString(),
                appVersion: APP_VERSION
            };
            
            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            this.downloadBlob(blob, `${gpxData.name || 'ruta'}_data.json`);
            
            this.showNotification('✅ GPX exportado como JSON');
            
        } catch (error) {
            console.error('❌ Error exportando JSON:', error);
            this.showNotification('❌ Error al exportar JSON');
        }
    }
    hideGPXViewer() {
        const viewerPanel = document.getElementById('gpxViewerPanel');
        if (viewerPanel) {
            viewerPanel.classList.add('hidden');
        }
        
        // Limpiar mapa si existe
        if (this.gpxViewerMap) {
            this.gpxViewerMap.remove();
            this.gpxViewerMap = null;
        }
        
        console.log('🗺️ Visualizador GPX cerrado');
    }

    calculateTrackBounds(points) {
        if (!points || points.length === 0) {
            return [[0, 0], [0, 0]];
        }
        
        let minLat = 90, maxLat = -90;
        let minLon = 180, maxLon = -180;
        
        points.forEach(point => {
            if (point.lat < minLat) minLat = point.lat;
            if (point.lat > maxLat) maxLat = point.lat;
            if (point.lon < minLon) minLon = point.lon;
            if (point.lon > maxLon) maxLon = point.lon;
        });
        
        return [[minLat, minLon], [maxLat, maxLon]];
    }

    calculateTrackCenter(points) {
        if (!points || points.length === 0) {
            return [0, 0];
        }
        
        const bounds = this.calculateTrackBounds(points);
        const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
        const centerLon = (bounds[0][1] + bounds[1][1]) / 2;
        
        return [centerLat, centerLon];
    }

    updateGpxSelect() {
        if (!this.elements.activeGpxRoute) return;
        
        // Limpiar opciones excepto la primera
        while (this.elements.activeGpxRoute.options.length > 1) {
            this.elements.activeGpxRoute.remove(1);
        }
        
        // Agregar opciones para cada GPX cargado
        this.state.loadedGPXFiles.forEach(gpx => {
            const option = document.createElement('option');
            option.value = gpx.id;
            option.textContent = gpx.name;
            this.elements.activeGpxRoute.appendChild(option);
        });
    }


    async exportSelected() {
        if (this.state.selectedVideos.size === 0 && this.state.selectedGPX.size === 0) {
            this.showNotification('❌ No hay elementos seleccionados');
            return;
        }
        
        try {
            for (const videoId of this.state.selectedVideos) {
                let video;
                if (this.db) {
                    video = await this.getFromStore('videos', videoId);
                } else {
                    const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
                    video = videos.find(v => v.id === videoId);
                }
                
                if (video && video.blob) {
                    this.downloadBlob(video.blob, `${video.title || 'grabacion'}.${video.format || 'mp4'}`);
                }
            }
            
            for (const gpxId of this.state.selectedGPX) {
                const gpx = await this.getFromStore('gpxTracks', gpxId);
                if (gpx && gpx.blob) {
                    this.downloadBlob(gpx.blob, `${gpx.title || 'ruta'}.gpx`);
                }
            }
            
            this.showNotification('📤 Elementos exportados');
            
        } catch (error) {
            console.error('❌ Error exportando:', error);
            this.showNotification('❌ Error al exportar');
        }
    }

    async deleteSelected() {
        if (this.state.selectedVideos.size === 0 && this.state.selectedGPX.size === 0) {
            this.showNotification('❌ No hay elementos seleccionados');
            return;
        }
        
        if (!confirm(`¿Eliminar ${this.state.selectedVideos.size + this.state.selectedGPX.size} elementos?`)) {
            return;
        }
        
        try {
            let deletedFromFS = 0;
            let deletedFromDB = 0;
            let errors = 0;
            
            // Procesar videos seleccionados
            for (const videoId of this.state.selectedVideos) {
                try {
                    // Buscar el video en el estado actual
                    const video = this.state.videos.find(v => v.id == videoId);
                    
                    if (video) {
                        // Si es un archivo físico (de carpeta local), borrarlo del sistema de archivos
                        if (video.source === 'filesystem' || video.isPhysical) {
                            console.log(`🗑️ Intentando borrar archivo físico: ${video.filename}`);
                            
                            if (video.fileHandle) {
                                try {
                                    // Borrar el archivo físico
                                    await video.fileHandle.remove();
                                    console.log(`✅ Archivo físico borrado: ${video.filename}`);
                                    deletedFromFS++;
                                } catch (fsError) {
                                    console.error(`❌ Error borrando archivo físico ${video.filename}:`, fsError);
                                    errors++;
                                }
                            }
                        }
                        
                        // También borrar de la base de datos si existe allí
                        if (this.db) {
                            try {
                                await this.deleteFromStore('localFiles', videoId);
                                console.log(`🗑️ Eliminado de base de datos: ${video.filename}`);
                                deletedFromDB++;
                            } catch (dbError) {
                                console.warn(`⚠️ Error eliminando de BD ${video.filename}:`, dbError);
                            }
                        }
                    } else {
                        // Si no está en el estado actual, podría ser un video de la app
                        if (this.db) {
                            await this.deleteFromStore('videos', videoId);
                            deletedFromDB++;
                        } else {
                            const videos = JSON.parse(localStorage.getItem('dashcam_videos') || '[]');
                            const filteredVideos = videos.filter(v => v.id !== videoId);
                            localStorage.setItem('dashcam_videos', JSON.stringify(filteredVideos));
                            deletedFromDB++;
                        }
                    }
                    
                } catch (error) {
                    console.error(`❌ Error eliminando elemento ${videoId}:`, error);
                    errors++;
                }
            }
            
            // Procesar GPX seleccionados
            for (const gpxId of this.state.selectedGPX) {
                try {
                    // Buscar el GPX en el estado actual
                    const gpx = this.state.gpxTracks.find(g => g.id == gpxId);
                    
                    if (gpx) {
                        // Si es un archivo físico, borrarlo del sistema de archivos
                        if (gpx.source === 'filesystem' || gpx.fileHandle) {
                            try {
                                await gpx.fileHandle.remove();
                                console.log(`🗑️ Archivo GPX físico borrado: ${gpx.filename}`);
                                deletedFromFS++;
                            } catch (fsError) {
                                console.error(`❌ Error borrando GPX físico ${gpx.filename}:`, fsError);
                                errors++;
                            }
                        }
                        
                        // Borrar de la base de datos
                        if (this.db) {
                            await this.deleteFromStore('gpxTracks', gpxId);
                            deletedFromDB++;
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error eliminando GPX ${gpxId}:`, error);
                    errors++;
                }
            }
            
            // Limpiar selección
            this.state.selectedVideos.clear();
            this.state.selectedGPX.clear();
            
            // Recargar galería para reflejar los cambios
            await this.loadGallery();
            
            // Mostrar resumen
            let message = '';
            if (deletedFromFS > 0) {
                message += `🗑️ ${deletedFromFS} archivos físicos borrados. `;
            }
            if (deletedFromDB > 0) {
                message += `📱 ${deletedFromDB} eliminados de la app. `;
            }
            if (errors > 0) {
                message += `❌ ${errors} errores.`;
            }
            
            if (message) {
                this.showNotification(message);
            } else {
                this.showNotification('🗑️ Elementos eliminados');
            }
            
        } catch (error) {
            console.error('❌ Error eliminando:', error);
            this.showNotification('❌ Error al eliminar');
        }
    }

    async deletePhysicalFile(fileHandle) {
        try {
            if (!fileHandle) {
                console.warn('⚠️ No hay fileHandle para borrar');
                return false;
            }
            
            // Verificar que tenemos permiso de escritura
            try {
                const permission = await fileHandle.queryPermission({ mode: 'readwrite' });
                if (permission !== 'granted') {
                    const newPermission = await fileHandle.requestPermission({ mode: 'readwrite' });
                    if (newPermission !== 'granted') {
                        console.warn('⚠️ Permiso denegado para borrar archivo');
                        return false;
                    }
                }
            } catch (error) {
                console.warn('⚠️ Error verificando permiso:', error);
            }
            
            // Borrar el archivo
            await fileHandle.remove();
            console.log(`✅ Archivo físico borrado exitosamente`);
            return true;
            
        } catch (error) {
            console.error('❌ Error borrando archivo físico:', error);
            
            // Intentar método alternativo si remove() no funciona
            try {
                // Algunos navegadores pueden requerir un enfoque diferente
                console.log('🔄 Intentando método alternativo para borrar...');
                
                // Si estamos en la misma carpeta, podemos intentar sobreescribir
                if (fileHandle.kind === 'file') {
                    const writable = await fileHandle.createWritable();
                    await writable.write(new Uint8Array(0)); // Escribir 0 bytes
                    await writable.close();
                    console.log('✅ Archivo truncado a 0 bytes (eliminado efectivamente)');
                    return true;
                }
            } catch (altError) {
                console.error('❌ Error con método alternativo:', altError);
            }
            
            return false;
        }
    }



    async moveSelectedToLocalFolder() {
        if (this.state.selectedVideos.size === 0) {
            this.showNotification('❌ No hay videos seleccionados');
            return;
        }
        
        if (!this.localFolderHandle && !this.isIOS) {
            this.showNotification('❌ Selecciona una carpeta local primero');
            return;
        }
        
        try {
            this.showNotification(`📂 Moviendo ${this.state.selectedVideos.size} videos...`);
            
            let moved = 0;
            let errors = 0;
            
            for (const videoId of this.state.selectedVideos) {
                try {
                    // Obtener video de la app
                    const video = await this.getFromStore('videos', parseInt(videoId));
                    
                    if (video && video.blob) {
                        const filename = `dashcam_${video.timestamp}.${video.format || 'mp4'}`;
                        
                        // Guardar en carpeta local
                        const success = await this.saveToLocalFolder(video.blob, filename);
                        
                        if (success) {
                            console.log(`✅ Video ${videoId} movido a carpeta local`);
                            
                            // Si está configurado para NO mantener copia en app, eliminar
                            if (!this.state.settings.keepAppCopy) {
                                await this.deleteFromStore('videos', parseInt(videoId));
                                console.log(`🗑️ Video ${videoId} eliminado de la app`);
                            }
                            
                            moved++;
                        } else {
                            errors++;
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error moviendo video ${videoId}:`, error);
                    errors++;
                }
            }
            
            // Limpiar selección y recargar
            this.state.selectedVideos.clear();
            await this.loadGallery();
            
            if (errors > 0) {
                this.showNotification(`✅ ${moved} movidos, ❌ ${errors} errores`);
            } else {
                this.showNotification(`✅ ${moved} videos movidos a carpeta local`);
            }
            
        } catch (error) {
            console.error('❌ Error moviendo videos:', error);
            this.showNotification('❌ Error al mover videos');
        }
    }


    async combineSelectedVideos() {
        if (this.state.selectedVideos.size < 2) {
            this.showNotification('❌ Selecciona al menos 2 videos para combinar');
            return;
        }
        
        // Mostrar modal de combinación
        this.showCombineModal();
    }

    showCombineModal() {
        // Crear lista de videos seleccionados
        const container = document.getElementById('combineVideosList');
        if (!container) return;
        
        const selectedVideos = Array.from(this.state.selectedVideos)
            .map(id => this.state.videos.find(v => v.id === id))
            .filter(v => v);
        
        if (selectedVideos.length === 0) {
            this.showNotification('❌ No hay videos seleccionados');
            return;
        }
        
        let html = '<div class="file-list">';
        
        selectedVideos.forEach(video => {
            const date = new Date(video.timestamp);
            const dateStr = date.toLocaleDateString('es-ES');
            const timeStr = date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            
            html += `
                <div class="file-item">
                    <div class="file-header">
                        <div class="file-title">${video.title || 'Grabación'}</div>
                        <div class="file-time">${timeStr}</div>
                    </div>
                    <div class="file-details">
                        <div>📅 ${dateStr}</div>
                        <div>⏱️ ${this.formatTime(video.duration)}</div>
                        <div>💾 ${Math.round(video.size / (1024 * 1024))} MB</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Mostrar modal
        const modal = document.getElementById('combineVideosModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideCombineModal() {
        const modal = document.getElementById('combineVideosModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showGpxManager() {
        console.log('🗺️ Mostrando gestor GPX');
        if (this.elements.gpxManagerPanel) {
            this.elements.gpxManagerPanel.classList.remove('hidden');
        }
    }

    hideGpxManager() {
        if (this.elements.gpxManagerPanel) {
            this.elements.gpxManagerPanel.classList.add('hidden');
        }
    }

    async loadGPXFromStore() {
        try {
            console.log('🗺️ Cargando rutas GPX desde fuentes reales...');
            
            let allGPX = [];
            
            if (this.state.viewMode === 'default') {
                allGPX = await this.scanAppGPXFiles();
                console.log(`📱 ${allGPX.length} GPX en la app`);
            } else if (this.state.viewMode === 'localFolder') {
                allGPX = await this.scanLocalFolderGPXFiles();
                console.log(`📂 ${allGPX.length} GPX en carpeta local`);
                
                const appGPX = await this.scanAppGPXFiles();
                const localGPX = allGPX.map(g => g.filename || g.title);
                
                appGPX.forEach(gpx => {
                    if (!localGPX.includes(gpx.filename || gpx.title)) {
                        allGPX.push(gpx);
                    }
                });
            }
            
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

    initPlaybackMap() {
        console.log('🗺️ Inicializando mapa Leaflet...');
        
        if (!this.state.currentVideo || !this.state.currentVideo.gpsTrack) {
            console.log('⚠️ No hay datos GPS para mostrar en el mapa');
            return;
        }
        
        const mapContainer = document.getElementById('playbackMap');
        if (!mapContainer) {
            console.error('❌ No se encontró el contenedor del mapa');
            return;
        }
        
        // Limpiar mapa existente
        this.cleanupMap();
        
        const points = this.state.currentVideo.gpsTrack;
        if (points.length === 0) {
            console.log('⚠️ El track GPS está vacío');
            mapContainer.innerHTML = '<div class="map-loading"><span>⚠️ No hay datos GPS</span></div>';
            return;
        }
        
        // Mostrar mensaje de carga
        mapContainer.innerHTML = '<div class="map-loading"><span>🔄 Cargando mapa...</span></div>';
        
        // Esperar a que Leaflet esté disponible
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet no está cargado');
            mapContainer.innerHTML = '<div class="map-loading"><span>❌ Error cargando mapa</span></div>';
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
                scrollWheelZoom: false, // Desactivar zoom con rueda en móvil
                dragging: !this.isIOS,  // Desactivar arrastre en iOS si causa problemas
                tap: !this.isIOS,
                touchZoom: true,
                boxZoom: false,
                doubleClickZoom: true,
                keyboard: false,
                fadeAnimation: true,
                zoomAnimation: true
            });
            
            // Añadir capas de mapa
            this.addMapTileLayers();
            
            // Dibujar la ruta
            this.drawRouteOnMap(points);
            
            // Añadir marcadores de inicio y fin
            this.addStartEndMarkers(points);
            
            // Ajustar vista para mostrar toda la ruta
            this.playbackMap.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 16
            });
            
            // Añadir botón para centrar
            this.addMapControls();
            
            // Forzar redibujado del mapa después de un breve delay
            setTimeout(() => {
                if (this.playbackMap) {
                    this.playbackMap.invalidateSize();
                    console.log('✅ Mapa Leaflet inicializado correctamente');
                }
            }, 300);
            
            // Actualizar información de distancia
            this.updateMapStats(points);
            
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

    // Función auxiliar para calcular límites del track
    calculateTrackBounds(points) {
        let minLat = Infinity, maxLat = -Infinity;
        let minLon = Infinity, maxLon = -Infinity;
        
        points.forEach(point => {
            minLat = Math.min(minLat, point.lat);
            maxLat = Math.max(maxLat, point.lat);
            minLon = Math.min(minLon, point.lon);
            maxLon = Math.max(maxLon, point.lon);
        });
        
        // Añadir un margen del 10%
        const latMargin = (maxLat - minLat) * 0.1;
        const lonMargin = (maxLon - minLon) * 0.1;
        
        return [
            [minLat - latMargin, minLon - lonMargin],
            [maxLat + latMargin, maxLon + lonMargin]
        ];
    }

    // Función auxiliar para calcular centro del track
    calculateTrackCenter(points) {
        let latSum = 0, lonSum = 0;
        points.forEach(point => {
            latSum += point.lat;
            lonSum += point.lon;
        });
        
        return [latSum / points.length, lonSum / points.length];
    }

    // Añadir capas de mapa
    addMapTileLayers() {
        if (!this.playbackMap) return;
        
        // Capa principal: OpenStreetMap Standard
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 2,
            subdomains: ['a', 'b', 'c']
        });
        
        // Capa alternativa: CartoDB Voyager
        const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20,
            subdomains: ['a', 'b', 'c']
        });
        
        // Capa satélite: ESRI World Imagery
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 19
        });
        
        // Añadir capas al mapa
        osmLayer.addTo(this.playbackMap);
        
        // Guardar referencia a las capas
        this.mapTileLayers = {
            "OpenStreetMap": osmLayer,
            "CartoDB Voyager": cartoLayer,
            "Satélite": satelliteLayer
        };
        
        // Añadir control de capas
        L.control.layers(this.mapTileLayers, null, {
            collapsed: true,
            position: 'topright'
        }).addTo(this.playbackMap);
    }

    // Dibujar ruta en el mapa
    drawRouteOnMap(points) {
        if (!this.playbackMap || points.length < 2) return;
        
        // Convertir puntos a formato [lat, lng] para Leaflet
        const latLngs = points.map(point => [point.lat, point.lon]);
        
        // Crear línea para la ruta
        this.mapRouteLayer = L.polyline(latLngs, {
            color: '#00a8ff',
            weight: 4,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            className: 'leaflet-polyline-path'
        }).addTo(this.playbackMap);
        
        // Añadir sombra para mejor visibilidad
        L.polyline(latLngs, {
            color: '#000',
            weight: 6,
            opacity: 0.3,
            lineJoin: 'round',
            lineCap: 'round'
        }).addTo(this.playbackMap);
        
        console.log(`🗺️ Ruta dibujada con ${points.length} puntos`);
    }

    // Añadir marcadores de inicio y fin
    addStartEndMarkers(points) {
        if (!this.playbackMap || points.length === 0) return;
        
        // Marcador de inicio
        const startPoint = points[0];
        this.startMarker = L.marker([startPoint.lat, startPoint.lon], {
            icon: L.divIcon({
                className: 'start-marker',
                iconSize: [12, 12],
                html: '<div></div>'
            }),
            title: 'Punto de inicio',
            alt: 'Punto de inicio'
        }).addTo(this.playbackMap);
        
        this.startMarker.bindTooltip('📍 Punto de inicio', {
            permanent: false,
            direction: 'top',
            offset: [0, -10]
        });
        
        // Marcador de fin (si hay más de un punto)
        if (points.length > 1) {
            const endPoint = points[points.length - 1];
            this.endMarker = L.marker([endPoint.lat, endPoint.lon], {
                icon: L.divIcon({
                    className: 'end-marker',
                    iconSize: [12, 12],
                    html: '<div></div>'
                }),
                title: 'Punto final',
                alt: 'Punto final'
            }).addTo(this.playbackMap);
            
            this.endMarker.bindTooltip('🏁 Punto final', {
                permanent: false,
                direction: 'top',
                offset: [0, -10]
            });
        }
    }

    // Añadir controles al mapa
    addMapControls() {
        if (!this.playbackMap) return;
        
        // Botón para centrar en la ruta
        const centerControl = L.Control.extend({
            options: {
                position: 'bottomright'
            },
            
            onAdd: function() {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                const button = L.DomUtil.create('a', '', container);
                button.innerHTML = '🗺️';
                button.title = 'Centrar en ruta';
                button.style.cssText = `
                    width: 32px;
                    height: 32px;
                    line-height: 30px;
                    text-align: center;
                    background: rgba(30, 39, 46, 0.95);
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                `;
                
                L.DomEvent.on(button, 'click', () => {
                    if (this.playbackMap && this.mapRouteLayer) {
                        this.playbackMap.fitBounds(this.mapRouteLayer.getBounds(), {
                            padding: [30, 30],
                            maxZoom: 16
                        });
                    }
                });
                
                return container;
            }
        });
        
        this.playbackMap.addControl(new centerControl());
    }

    // Actualizar estadísticas del mapa
    updateMapStats(points) {
        if (points.length < 2) return;
        
        // Calcular distancia total
        let totalDistance = 0;
        for (let i = 1; i < points.length; i++) {
            totalDistance += this.calculateDistance(
                points[i-1].lat, points[i-1].lon,
                points[i].lat, points[i].lon
            );
        }
        
        // Calcular tiempo total
        let totalTime = 0;
        if (points[0].timestamp && points[points.length-1].timestamp) {
            totalTime = points[points.length-1].timestamp - points[0].timestamp;
        }
        
        // Actualizar UI
        const distanceElement = document.getElementById('mapDistance');
        const timeElement = document.getElementById('mapTime');
        
        if (distanceElement) {
            distanceElement.textContent = `${totalDistance.toFixed(2)} km`;
        }
        
        if (timeElement) {
            timeElement.textContent = this.formatTime(totalTime);
        }
    }

    // Actualizar marcador de posición actual durante reproducción
    updatePlaybackMap() {
        if (!this.state.currentVideo || !this.state.currentVideo.gpsTrack || !this.playbackMap) return;
        
        const video = this.elements.playbackVideo;
        if (!video || !video.duration) return;
        
        const currentTime = video.currentTime;
        const totalTime = video.duration;
        const progress = currentTime / totalTime;
        
        const points = this.state.currentVideo.gpsTrack;
        const pointIndex = Math.min(Math.floor(progress * points.length), points.length - 1);
        const currentPoint = points[pointIndex];
        
        if (currentPoint) {
            // Actualizar información textual
            this.updateMapInfo(currentPoint);
            
            // Actualizar marcador en el mapa
            this.updateCurrentPositionMarker(currentPoint);
            
            // Actualizar tiempo en el mapa
            const timeElement = document.getElementById('mapTime');
            if (timeElement) {
                timeElement.textContent = this.formatTime(currentTime * 1000);
            }
        }
    }

    // Actualizar información del mapa
    updateMapInfo(point) {
        this.elements.mapLat.textContent = point.lat.toFixed(6);
        this.elements.mapLon.textContent = point.lon.toFixed(6);
        this.elements.mapSpeed.textContent = `${(point.speed * 3.6 || 0).toFixed(1)} km/h`;
        
        if (point.locationName) {
            this.elements.mapCity.textContent = point.locationName;
        } else if (point.city) {
            this.elements.mapCity.textContent = point.city;
        }
    }

    // Actualizar marcador de posición actual
    updateCurrentPositionMarker(point) {
        if (!this.playbackMap || !point) return;
        
        const latLng = [point.lat, point.lon];
        
        // Crear o actualizar marcador
        if (!this.currentPositionMarker) {
            this.currentPositionMarker = L.marker(latLng, {
                icon: L.divIcon({
                    className: 'current-position-marker',
                    iconSize: [16, 16],
                    html: '<div></div>'
                }),
                title: 'Posición actual',
                alt: 'Posición actual',
                zIndexOffset: 1000
            }).addTo(this.playbackMap);
            
            this.currentPositionMarker.bindTooltip('📍 Posición actual', {
                permanent: false,
                direction: 'top',
                offset: [0, -10]
            });
        } else {
            this.currentPositionMarker.setLatLng(latLng);
        }
        
        // Actualizar tooltip con más información
        const tooltipText = `
            <strong>📍 Posición actual</strong><br>
            Lat: ${point.lat.toFixed(6)}<br>
            Lon: ${point.lon.toFixed(6)}<br>
            Vel: ${(point.speed * 3.6 || 0).toFixed(1)} km/h
        `;
        
        this.currentPositionMarker.setTooltipContent(tooltipText);
    }

    // Limpiar mapa
    cleanupMap() {
        if (this.playbackMap) {
            this.playbackMap.remove();
            this.playbackMap = null;
        }
        
        this.mapRouteLayer = null;
        this.startMarker = null;
        this.endMarker = null;
        this.currentPositionMarker = null;
        this.mapMarkers = [];
        this.mapTileLayers = {};
    }



    // ============ EVENTOS ============

    setupEventListeners() {
        // Botones iniciales
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => {
                if (this.elements.startBtn.disabled) return;
                this.startRecording();
            });
        }
        this.setupCompactSelectors();
        if (this.elements.galleryBtn) {
            this.elements.galleryBtn.addEventListener('click', () => this.showGallery());
        }
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        }
        if (this.elements.gpxManagerBtn) {
            this.elements.gpxManagerBtn.addEventListener('click', () => this.showGpxManager());
        }

        // Reproductor
        if (this.elements.closePlayer) {
            this.elements.closePlayer.addEventListener('click', () => this.hideVideoPlayer());
        }
        if (this.elements.moveToLocalFolderBtn) {
            this.elements.moveToLocalFolderBtn.addEventListener('click', () => {
                if (this.state.currentVideo) {
                    this.moveToLocalFolder();
                }
            });
        }
        if (this.elements.extractGpxBtn) {
            this.elements.extractGpxBtn.addEventListener('click', () => this.extractGpxFromVideo());
        }
        if (this.elements.exportVideo) {
            this.elements.exportVideo.addEventListener('click', () => this.exportSingleVideo());
        }
        if (this.elements.deleteVideo) {
            this.elements.deleteVideo.addEventListener('click', () => this.deleteSingleVideo());
        }


        // Controles de grabación
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => {
                if (this.state.isPaused) {
                    this.resumeRecording();
                } else {
                    this.pauseRecording();
                }
            });
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        }
        
        if (this.elements.newSegmentBtn) {
            this.elements.newSegmentBtn.addEventListener('click', () => this.startNewSegment());
        }
        
        // Modal landscape
        if (this.elements.continueBtn) {
            this.elements.continueBtn.addEventListener('click', () => {
                this.hideLandscapeModal();
                this.startRecording();
            });
        }
        
        // Botón para girar dispositivo
        const rotateBtn = document.getElementById('rotateDevice');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {
                        this.showNotification('Gira tu dispositivo manualmente');
                    });
                } else {
                    this.showNotification('Gira tu dispositivo manualmente');
                }
                this.hideLandscapeModal();
                setTimeout(() => this.startRecording(), 500);
            });
        }
        
        // Galería mejorada
        if (this.elements.closeGallery) {
            this.elements.closeGallery.addEventListener('click', () => this.hideGallery());
        }
        if (this.elements.selectAllVideos) {
            this.elements.selectAllVideos.addEventListener('click', () => this.selectAll('video'));
        }
        if (this.elements.deselectAllVideos) {
            this.elements.deselectAllVideos.addEventListener('click', () => this.deselectAll('video'));
        }
        
        if (this.elements.galleryDropdownToggle) {
            this.elements.galleryDropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.elements.galleryDropdownMenu) {
                    this.elements.galleryDropdownMenu.classList.toggle('show');
                }
            });
        }
        
        // Cerrar menú desplegable al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.elements.galleryDropdownMenu && this.elements.galleryDropdownMenu.classList.contains('show')) {
                if (!this.elements.galleryDropdownToggle.contains(e.target) && 
                    !this.elements.galleryDropdownMenu.contains(e.target)) {
                    this.elements.galleryDropdownMenu.classList.remove('show');
                }
            }
        });
        
        // Botones de acción en la galería
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportSelected());
        }
        if (this.elements.deleteBtn) {
            this.elements.deleteBtn.addEventListener('click', () => this.deleteSelected());
        }
        if (this.elements.moveToLocalBtn) {
            this.elements.moveToLocalBtn.addEventListener('click', () => this.moveSelectedToLocalFolder());
        }
        if (this.elements.combineVideosBtn) {
            this.elements.combineVideosBtn.addEventListener('click', () => this.combineSelectedVideos());
        }
        
        // Configuración
        if (this.elements.saveSettings) {
            this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        }
        if (this.elements.resetSettingsBtn) {
            this.elements.resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }
        if (this.elements.closeSettings) {
            this.elements.closeSettings.addEventListener('click', () => this.hideSettings());
        }
        
        // Configuración de almacenamiento
        if (this.elements.storageLocation) {
            this.elements.storageLocation.addEventListener('change', () => this.toggleStorageSettings());
        }
        
        if (this.elements.selectLocalFolderBtn) {
            this.elements.selectLocalFolderBtn.addEventListener('click', () => this.selectLocalFolder());
        }
        
        if (this.elements.uploadLogoBtn) {
            this.elements.uploadLogoBtn.addEventListener('click', () => this.uploadCustomLogo());
        }
        
        // Detener grabación al salir de la página
        window.addEventListener('beforeunload', () => {
            if (this.state.isRecording) {
                this.stopRecording();
            }
        });
    }
    // Añade esta función en la clase DashcamApp, justo después de detectIOS():

    async clearCacheIfNeeded() {
        const lastVersion = localStorage.getItem('dashcam_version');
        
        if (lastVersion !== APP_VERSION) {
            console.log(`🔄 Nueva versión detectada: ${lastVersion || 'ninguna'} → ${APP_VERSION}`);
            
            // Limpiar service workers
            if ('serviceWorker' in navigator) {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (let registration of registrations) {
                        await registration.unregister();
                        console.log('🗑️ Service Worker desregistrado');
                    }
                } catch (error) {
                    console.warn('⚠️ Error limpiando service workers:', error);
                }
            }
            
            // Limpiar caché
            if (caches) {
                try {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                    console.log('🗑️ Caché limpiada');
                } catch (error) {
                    console.warn('⚠️ Error limpiando caché:', error);
                }
            }
            
            // Si hay error de versión, corregir base de datos
            if (lastVersion && parseInt(lastVersion.replace('.', '')) < 30) { // Versión anterior a 3.0
                console.log('🔧 Versión anterior detectada, corregiendo base de datos...');
                await this.fixDatabaseVersion();
            }
            
            // Guardar nueva versión
            localStorage.setItem('dashcam_version', APP_VERSION);
            
            // Recargar si había una versión anterior
            if (lastVersion) {
                this.showNotification('🔄 Aplicación actualizada', 2000);
                setTimeout(() => location.reload(), 2000);
            }
        }
    }

    // También necesitas la función fixDatabaseVersion():

    async fixDatabaseVersion() {
        try {
            console.log('🔧 Intentando corregir versión de base de datos...');
            
            // Cerrar conexión si existe
            if (this.db) {
                this.db.close();
                this.db = null;
            }
            
            // Eliminar base de datos existente
            await new Promise((resolve, reject) => {
                const deleteRequest = indexedDB.deleteDatabase('DashcamDB_Pro');
                deleteRequest.onsuccess = () => {
                    console.log('🗑️ Base de datos eliminada');
                    resolve();
                };
                deleteRequest.onerror = (error) => {
                    console.warn('⚠️ Error eliminando base de datos:', error);
                    reject(error);
                };
                deleteRequest.onblocked = () => {
                    console.warn('⚠️ Base de datos bloqueada, intentando cerrar conexiones...');
                    resolve();
                };
            });
            
            // Crear nueva base de datos
            await this.initDatabase();
            console.log('✅ Base de datos corregida');
            return true;
            
        } catch (error) {
            console.error('❌ Error corrigiendo base de datos:', error);
            return false;
        }
    }

}

// Inicializar la app
document.addEventListener('DOMContentLoaded', () => {
    window.dashcamApp = new DashcamApp();
    
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);
            })
            .catch(error => {
                console.log('⚠️ Service Worker no registrado:', error.message);
            });
    }
});