// ===========================================
// TRADUCCIONES MULTI-IDIOMA
// ===========================================
const translations = {
    es: {
        // Títulos generales
        appTitle: "Crono CRI - en Construcción",
        languagesLabel: "Idioma / Language",
        
        // Tarjetas
        cardRaceTitle: "Gestión de Carrera",
        cardTimeTitle: "Configuración de Tiempo",
        cardDeparturesTitle: "Salidas Registradas",
        audioConfigTitle: "Configuración de Audio",
        cardStartOrderTitle: "Orden de Salida",

        modeSalidaText: "SALIDAS",
        modeLlegadasText: "LLEGADAS",
        
        // Botones de carrera
        newRaceText: "Nueva",
        deleteRaceText: "Eliminar",
        deleteRaceConfirmBtn: "Eliminar",
        deleteRaceCancelBtn: 'Cancelar',

        // Configuración de audio
        beepOptionTitle: "Sonidos Beep",
        voiceOptionTitle: "Voz grabada",
        muteOptionTitle: "Sin sonido",
        testAudioText: "Probar sonido actual",
        
        // Configuración de tiempo
        intervalTimeLabel: "Tiempo entre salidas",
        minutesText: "minutos",
        secondsText: "segundos",
        
        // Posición inicial
        startFromXText: "Posición actual:",
        startCountdownText: "INICIAR CUENTA ATRÁS",
        exitCompleteText: "REINICIAR",
        
        // Lista de salidas
        clearDeparturesText: "Limpiar lista",
        exportExcelText: "Exportar Excel",
        noDeparturesText: "No hay salidas registradas",
        departureHeaderDorsal: "Salida",
        departureHeaderTime: "Tiempo",
        departureHeaderNotes: "Nota",
        departureHeaderDate: "Hora",
        
        // Footer
        helpText: "Ayuda",
        suggestionsText: "Sugerencias",
        installText: "Instalar App",
        updateText: "Buscar actualizaciones",
        copyrightText: "2025 © Copyright ",
        copyrightLink: "Roberto Benet - rbenet71@gmail.com - V_18_12_2025",
        
        // Modal de ayuda
        helpModalTitle: "Ayuda de Crono CRI",
        helpModalText1: "Crono CRI es una aplicación para controlar las salidas en carreras con cuenta atrás visual y sonora.",
        helpModalSubtitle1: "Cómo usar:",
        helpModalList: `<li><strong>Selecciona una carrera</strong> o crea una nueva</li>
                        <li><strong>Configura la cadencia de salida</strong> (siempre igual o por tramos)</li>
                        <li><strong>Inicia desde el corredor 1</strong> o desde una posición específica</li>
                        <li><strong>Pulsa "INICIAR CUENTA ATRÁS"</strong> para comenzar</li>
                        <li><strong>La pantalla cambiará</strong> mostrando la cuenta atrás grande</li>
                        <li><strong>Cuando llegue a cero</strong> se mostrará "SALIDA" y comenzará la cuenta para el siguiente</li>`,
        helpModalSubtitle2: "Indicadores visuales:",
        redBackgroundText: "Fondo ROJO:",
        countdownNormalDesc: "Cuenta atrás normal",
        yellowBackgroundText: "Fondo AMARILLO:",
        countdownWarningDesc: "Últimos 10 segundos",
        greenBackgroundText: "Fondo VERDE:",
        countdownSalidaDesc: "Momento de salida (2 segundos)",
        redNumbersText: "Números ROJOS pulsantes:",
        countdownCriticalDesc: "Últimos 5 segundos",
        helpModalSubtitle3: "Sonidos:",
        beepHighText: "Beep agudo:",
        beepHighDesc: "Al llegar a 10 segundos",
        beepEverySecondText: "Beep cada segundo:",
        beepEverySecondDesc: "Últimos 5 segundos",
        beepLowText: "Beep grave:",
        beepLowDesc: "Al llegar a cero",
        helpModalText2: "Los 2 segundos de \"SALIDA\" se restan automáticamente del tiempo de la siguiente cuenta atrás.",
        
        // Modal nueva carrera
        newRaceModalTitle: "Nueva carrera",
        newRaceNameLabel: "Nombre de la carrera:",
        newRaceDescLabel: "Descripción (opcional):",
        
        // Modal eliminar carrera
        deleteRaceModalTitle: "Confirmar eliminación",
        deleteRaceModalText: "¿Estás seguro de que quieres eliminar esta carrera? Todos los datos se perderán.",
        
        // Modal limpiar salidas
        clearDeparturesModalTitle: "Confirmar limpieza",
        clearDeparturesModalText: "¿Estás seguro de que quieres limpiar la lista de salidas? Esta acción no se puede deshacer.",
        
        // Modal sugerencias
        suggestionsModalTitle: "Enviar sugerencias",
        suggestionEmailLabel: "Email (opcional):",
        suggestionTextLabel: "Sugerencias:",
        
        // Modal reiniciar
        restartModalTitle: "Confirmar reinicio completo",
        restartModalText: "¿Estás seguro de que quieres reiniciar completamente? Esta acción:",
        
        // Mensajes
        raceCreated: "Carrera creada correctamente",
        raceDeleted: "Carrera eliminada",
        departuresCleared: "Lista de salidas limpiada",
        excelExported: "Datos exportados a Excel",
        sessionRestarted: "Sesión reiniciada completamente",
        countdownStarted: "Cuenta atrás iniciada",
        countdownStopped: "Cuenta atrás detenida",
        updateChecked: "Buscando actualizaciones...",
        adjustmentsSaved: "Ajustes guardados. Próximo corredor ({corredor}) saldrá en {seconds} segundos",
        timeUpdated: "Tiempo actualizado. Próximo corredor ({corredor}) saldrá en {seconds} segundos",
        enterValidTime: "Introduce un tiempo válido",
        selectRaceFirst: "Selecciona una carrera primero",
        enterRaceName: "Introduce un nombre para la carrera",
        listAlreadyEmpty: "La lista ya está vacía",
        noDataToExport: "No hay datos para exportar",
        waitCountdownEnd: "Espera a que termine la cuenta atrás actual",
        countdownNotActive: "La cuenta atrás no está activa",
        invalidValues: "Valores inválidos",
        importError: "Error al importar el archivo",
        
        // Pantalla de ejecución
        salidaText: "SALIDA",
        totalTimeLabel: "Tiempo total",
        nextCorredorLabel: "Próximo sale a",
        departedLabel: "Salidos",
        
        // Orden de salida
        timeConfigLabel: "Configuración de Horarios",
        firstStartLabel: "Salida Primero:",
        currentTimeLabel: "Hora:",
        timeDiffLabel: "Cuenta atrás en:",
        totalRidersLabel: "Total Corredores:",
        actionsLabel: "Acciones",
        orderTableLabel: "Orden de Salida",
        createTemplateText: "Crear Plantilla",
        importOrderText: "Importar Orden",
        deleteOrderText: "Eliminar Orden",
        exportOrderText: "Exportar Excel",
        addRiderText: "Añadir Corredor",
        noStartOrderText: "No hay corredores en el orden de salida",
        
        // Headers de tabla orden de salida
        orderHeader: "Orden",
        dorsalHeader: "Dorsal",
        cronoSalidaHeader: "Crono Salida",
        horaSalidaHeader: "Hora Salida",
        nombreHeader: "Nombre",
        apellidosHeader: "Apellidos",
        chipHeader: "Chip",
        horaRealHeader: "Hora Salida Real",
        cronoRealHeader: "Crono Salida Real",
        horaPrevistaHeader: "Hora Salida Prevista",
        cronoPrevistaHeader: "Crono Salida Prevista",
        horaImportadoHeader: "Hora Salida Importado",
        cronoImportadoHeader: "Crono Salida Importado",
        cronoSegundosHeader: "Crono Segundos",
        horaSegundosHeader: "Hora Segundos",
        
        // Mensajes orden de salida
        templateCreated: "Plantilla Excel creada correctamente",
        orderImported: "Orden de salida importado correctamente ({count} corredores)",
        orderDeleted: "Orden de salida eliminado",
        orderExported: "Orden de salida exportado a Excel",
        riderAdded: "Corredor añadido al orden de salida",
        riderDeleted: "Corredor eliminado",
        enterValidTimeOrder: "Introduce una hora válida",
        selectOrderFirst: "Selecciona un orden de salida primero",
        dataSaved: "Datos guardados correctamente",
        confirmDeleteOrder: "¿Estás seguro de eliminar el orden de salida?",
        
        // Mensajes de error/success
        success: "¡Éxito!",
        error: "Error",
        warning: "Advertencia",
        info: "Información",

        // Para los botones de acción:
        understood: "Entendido",
        saveButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        clear: "Limpiar",
        deleteConfirm: "Eliminar",
        sendSuggestion: "Enviar",
        createRace: "Crear carrera",
        restartConfirm: "Sí, reiniciar completamente",
        cancel: "Cancelar",

        // Para las notas de salidas:
        departurePlaceholder: "Escribe una nota...",

        // Para etiquetas de cuenta atrás:
        countdownlabel: "Salida en",
        currentPositionText: "Posición actual:",
        
        // Para compatibilidad
        startTimeUpdated: "Hora de inicio actualizada y guardada",
        
        // Selector de modo
        modeSelectorTitle: "Modo de Operación",
        modeSalidaDesc: "Control de salidas con cuenta atrás",
        modeLlegadasTitle: "Modo Llegadas",
        modeLlegadasDesc: "Control de tiempos de llegada",
        modeChanged: "Cambiado al modo {mode}",
        modeSalidaTitle: "Salidas",
        modeLlegadasTitle: "Llegadas",
        
        // Modo llegadas
        llegadasTimerTitle: "Cronómetro de Llegadas",
        llegadasTimerLabel: "Tiempo desde salida del primer corredor:",
        startLlegadasText: "Iniciar Cronómetro",
        stopLlegadasText: "Detener",
        registerLlegadaText: "Registrar Llegada",
        importLlegadasText: "Importar Salidas",
        llegadasListTitle: "Llegadas Registradas",
        clearLlegadasText: "Limpiar llegadas",
        exportLlegadasText: "Exportar Excel",
        showRankingText: "Ver Clasificación",
        noLlegadasText: "No hay llegadas registradas",
        
        // Registro de llegadas
        registerLlegadaModalTitle: "Registrar Llegada",
        llegadaDorsalLabel: "Dorsal del corredor:",
        llegadaHoraLabel: "Hora de llegada:",
        llegadaNotasLabel: "Notas (opcional):",
        confirmLlegadaBtn: "Registrar Llegada",
        cancelLlegadaBtn: "Cancelar",
        quickRegisterTitle: "Registrar llegada rápida",
        
        // Importación de salidas
        importSalidasModalTitle: "Importar Datos de Salidas",
        importSalidasModalText: "Selecciona el archivo Excel con los datos de salidas de los corredores.",
        confirmImportSalidasBtn: "Importar",
        cancelImportSalidasBtn: "Cancelar",
        importPreviewTitle: "Vista previa de datos:",
        importSuccess: "Datos de salidas importados correctamente ({count} corredores)",
        startTimerFirst: "Primero inicia el cronómetro de llegadas",
        noDataImported: "No se pudieron importar datos de salidas",
        
        // Clasificación
        rankingModalTitle: "Clasificación de la Carrera",
        noRankingText: "No hay suficientes datos para generar la clasificación",
        rankingPos: "Pos",
        rankingDorsal: "Dorsal",
        rankingNombre: "Nombre",
        rankingTiempo: "Tiempo Crono",
        rankingDiferencia: "Diferencia",
        exportRankingBtn: "Exportar Clasificación",
        closeRankingBtn: "Cerrar",
        
        // Cabeceras de tablas (llegadas)
        llegadaHeaderDorsal: "Dorsal",
        llegadaHeaderNombre: "Nombre",
        llegadaHeaderSalida: "Hora Salida",
        llegadaHeaderLlegada: "Hora Llegada",
        llegadaHeaderCrono: "Tiempo Crono",
        llegadaHeaderNotas: "Notas",
        
        // Mensajes de estado (llegadas)
        llegadaRegistered: "Llegada registrada para dorsal {dorsal}",
        llegadaAlreadyExists: "Ya existe una llegada registrada para el dorsal {dorsal}",
        llegadasCleared: "Lista de llegadas limpiada",
        timerStarted: "Cronómetro de llegadas iniciado",
        timerStopped: "Cronómetro detenido",
        rankingGenerated: "Clasificación generada con {count} corredores",
        llegadasExported: "Llegadas exportadas a Excel",
        rankingExported: "Clasificación exportada a Excel",
        
        // Validaciones
        enterDorsal: "Introduce un número de dorsal válido",
        invalidDorsal: "Dorsal no válido",
        noStartTimeData: "No hay datos de hora de salida para este dorsal",
        confirmClearLlegadas: "¿Estás seguro de que quieres limpiar todas las llegadas registradas?",
        selectFileFirst: "Primero selecciona un archivo",
        
        // Exporta Excel
        templateCreatedCustom: "Plantilla creada con {count} corredores, intervalo {interval}, inicio {startTime}",
        enterValidRiders: "Por favor, introduce un número válido de corredores (1-1000)",
        enterValidInterval: "Por favor, introduce un intervalo válido (HH:MM:SS)",
        enterValidStartTime: "Por favor, introduce una hora de inicio válida (HH:MM:SS)",
        configTemplateTitle: "Configurar Plantilla de Salida",
        numRidersLabel: "Número de corredores:",
        intervalLabel: "Intervalo entre salidas (HH:MM:SS):",
        startTimeLabel: "Hora de inicio (HH:MM:SS):",
        intervalExample: "Ej: 00:01:00 para 1 minuto, 00:02:30 para 2 minutos y 30 segundos",
        startTimeExample: "Ej: 09:00:00 para las 9 de la mañana",
        timeChangeTitle: "Cambiar hora de inicio",
        timeChangeWarning: "¿Estás seguro? Esto actualizará todas las horas de salida en la tabla.",
        timeChangeRiders: "Corredores afectados:",
        timeChangeFirst: "Primer corredor:",
        confirmChange: "Sí, actualizar todo",
        cancelChange: "Cancelar",
        onlyFirst: "Solo el primero",
        allTimesUpdated: "Todas las horas de salida actualizadas",
        timeChangeCancelled: "Cambio cancelado",
        onlyFirstUpdated: "Solo se actualizó el primer corredor",
        
        // Botones de copia de seguridad en gestión de carrera
        backupRaceText: "Copia Seguridad",
        restoreRaceText: "Restaurar",

        // Mensajes específicos de copia por carrera
        backupRaceSuccess: "Copia de seguridad de la carrera creada exitosamente",
        restoreRaceSuccess: "Carrera restaurada exitosamente",
        noRaceSelectedForBackup: "Selecciona una carrera primero para hacer la copia",
        backupRaceContains: "La copia contiene: {departures} salidas, {order} en orden, {llegadas} llegadas",
        restoreOptionsTitle: "Opciones de restauración",
        whatToRestore: "¿Qué datos restaurar?",
        restoreDepartures: "Datos de salidas",
        restoreStartOrder: "Orden de salida",
        restoreLlegadas: "Datos de llegadas",
        restoreConfig: "Configuración",
        restoreOptionReplace: "Reemplazar carrera existente",
        restoreOptionRename: "Crear como nueva carrera",
        raceAlreadyExists: "Ya existe una carrera con este nombre",
        restoringToNewRace: "Se creará como nueva carrera",
        restoringToExisting: "Se reemplazará la carrera existente",

        // Modal nueva carrera - campos extendidos
        newRaceDateLabel: "Fecha de la carrera:",
        newRaceCategoryLabel: "Categoría:",
        newRaceOrganizerLabel: "Organizador/Club:",
        newRaceLocationLabel: "Población/Lugar:",
        newRaceModalityLabel: "Modalidad de carrera:",
        newRaceOtherModalityLabel: "Especificar modalidad:",
        newRaceDescriptionLabel: "Descripción/Notas:",

        // Opciones de categoría
        categorySelect: "-- Selecciona categoría --",
        categoryElite: "Élite",
        categoryMaster: "Master",
        categoryJunior: "Junior",
        categoryCadete: "Cadete",
        categoryInfantil: "Infantil",
        categoryFemenino: "Femenino",
        categoryMixto: "Mixto",
        categoryAficionado: "Aficionado",
        categoryOtro: "Otro",

        // Modalidades
        modalityCri: "CRI (Contrarreloj Individual)",
        modalityCre: "CRE (Contrarreloj por Equipos)",
        modalityDescenso: "Descenso (Downhill)",
        modalityOtras: "Otras modalidades",
        modalityOtherPlaceholder: "Ej: Maratón, Enduro, XCO...",

        // Secciones del formulario
        formSectionBasic: "Información básica",
        formSectionOrganization: "Organización",
        formSectionModality: "Modalidad de carrera",
        formSectionAdditional: "Información adicional",

        // Mensajes de validación
        requiredField: "Campo obligatorio",
        enterValidDate: "Introduce una fecha válida",

        editRaceText: "Editar",
        editRaceTitle: "Editar carrera",
        saveChanges: "Guardar cambios",
        raceUpdated: "Carrera actualizada correctamente",

        backupCreated: "Copia de seguridad guardada como {filename}",
        creatingBackup: "Creando copia de seguridad...",
        noRaceSelected: "Selecciona una carrera primero",

        // PDF Export
        creatingPDF: "Generando PDF...",
        exportPDF: "Exportar PDF",
        pdfGenerated: "PDF generado: {filename} - {count} corredores",
        
        // Backup/restore (por si faltan)
        backupCreated: "Copia de seguridad guardada como {filename}",
        creatingBackup: "Creando copia de seguridad...",
        noRaceSelected: "Selecciona una carrera primero",
        restoreTitle: "Restaurar carrera desde copia",
        restoreWarning: "Esta acción reemplazará los datos actuales de la carrera",
        restoreSuccess: "Carrera restaurada correctamente",
        restoreError: "Error al restaurar la carrera",
        confirmRestore: "¿Confirmar restauración?",
        cancel: "Cancelar",
        
        // Race management (por si faltan)
        enterRaceName: "Introduce un nombre para la carrera",
        enterValidDate: "Introduce una fecha válida",
        raceCreated: "Carrera creada correctamente",
        raceUpdated: "Carrera actualizada correctamente",
        raceDeleted: "Carrera eliminada correctamente",
        selectRaceFirst: "Selecciona una carrera primero",
        departuresCleared: "Salidas reiniciadas correctamente",
        sessionRestarted: "Sesión reiniciada completamente",
        
        // Start order
        listAlreadyEmpty: "La lista ya está vacía",
        confirmDeleteOrder: "¿Eliminar TODO el orden de salida? Esta acción no se puede deshacer.",
        orderDeleted: "Orden de salida eliminado",
        riderAdded: "Corredor añadido",
        
        // Modals
        editRaceTitle: "Editar carrera",
        saveChanges: "Guardar cambios",
        createRace: "Crear carrera",
        newRaceModalTitle: "Nueva carrera",
        
        // Suggestions
        suggestionTextLabel: "Introduce tu sugerencia",
        suggestionSent: "Sugerencia enviada",
        
        // Time management
        timeChangeCancelled: "Cambio de hora cancelado",
        
        // Update notification
        updateAvailable: "Nueva versión disponible",

        creatingPDF: 'Generando PDF del orden de salida...',
        pdfGenerated: 'PDF generado: {filename} ({count} corredores)',
        pdfError: 'Error al generar el PDF',
        pdfLibraryMissing: 'La librería PDF no está cargada',
        noStartOrderData: 'No hay datos de orden de salida para generar PDF',
        pdfOrderOfStart: "ORDEN DE SALIDA",
        position: "POS",
        number: "DORSAL",
        name: "NOMBRE",
        surname: "APELLIDOS",
        startTime: "HORA SALIDA",
        crono: "CRONO",
        riders: "Corredores",
        start: "Inicio",
        final: "Final",
        generated: "Generado",
        page: "Página",
        of: "de",
        pdfGenerated: "PDF generado",
        pdfError: "Error al generar PDF",
        cronoRealSegundosHeader: "Crono Salida Real Segundos",
        horaRealSegundosHeader: "Hora Salida Real Segundos",

        // Agregar en cada objeto de idioma (es, ca, en, fr) esta sección:

        // Tooltips para columnas de orden de salida
        orderTooltip: "Posición en la que saldrá el corredor",
        dorsalTooltip: "Número de dorsal del corredor",
        cronosalidaTooltip: "Tiempo de Cronómetro en el que saldrá el corredor. El programa utiliza este valor para dar las salidas.",
        horasalidaTooltip: "Hora prevista de salida, es información, no se utiliza para controlar salidas.",
        nombreTooltip: "Nombre del corredor",
        apellidosTooltip: "Apellidos del corredor",
        chipTooltip: "Número de chip del corredor",
        horarealTooltip: "Hora del día en la que efectivamente salió el corredor",
        cronorealTooltip: "Hora del cronómetro en la que efectivamente salió el corredor",
        horaprevistaTooltip: "Hora del día prevista de salida. Variará si se modifica la hora de salida del corredor individual.",
        cronoprevistaTooltip: "Hora del cronómetro prevista de salida. Variará si se modifica la hora de salida del corredor individual.",
        horaimportadoTooltip: "Hora del día que estaba en el Excel importado",
        cronoimportadoTooltip: "Hora del cronómetro que estaba en el Excel importado",
        cronosegundosTooltip: "Crono Salida en segundos (para cálculos internos)",
        horasegundosTooltip: "Hora Salida en segundos (para cálculos internos)",
        horarealsegundosTooltip: "Hora Salida Real en segundos (para cálculos internos)",

        addRiderTitle: 'Añadir corredor',
        selectPosition: 'Seleccionar posición:',
        positionEnd: 'Al final de la lista',
        positionBeginning: 'Al principio de la lista',
        positionSpecific: 'En una posición específica...',
        specificPosition: 'Posición:',
        positionInfo: 'Los corredores desde esta posición se desplazarán hacia abajo.',
        riderPreview: 'Nuevo corredor',
        positionLabel: 'Posición:',
        timeLabel: 'Hora salida:',
        addRiderButton: 'Añadir corredor',
        firstRiderCreated: 'Primer corredor creado correctamente',
        riderAddedAtPosition: 'Corredor añadido en la posición {position}',
        invalidValue: 'Valor inválido',
        confirmChange: 'Sí, actualizar todo',
        cancelChange: 'Cancelar',
        timeChangeTitle: 'Cambiar hora de inicio',
        timeChangeWarning: '¿Estás seguro que quieres actualizar todas las horas de salida?',
        timeChangeCancelled: 'Cambio cancelado',
        allTimesUpdated: 'Todas las horas de salida actualizadas',

        positionSection: 'Posición del corredor',
        riderDataSection: 'Datos del corredor',
        dorsalLabel: 'Dorsal:',
        dorsalPlaceholder: 'Número de dorsal',
        dorsalRequired: 'El dorsal es obligatorio',
        chipLabel: 'Chip:',
        chipPlaceholder: 'Número de chip',
        nameLabel: 'Nombre:',
        namePlaceholder: 'Nombre del corredor',
        surnameLabel: 'Apellidos:',
        surnamePlaceholder: 'Apellidos del corredor',
        previewSection: 'Vista previa',
        confirmAddRider: 'Confirmar y añadir',
        riderAddedDetails: 'Corredor #{dorsal} ({name}) añadido en posición {position} a las {time}',
        
        importWarningTitle: '¡Atención!',
        importWarning: 'Los datos actuales se borrarán',
        importWarningDetails: 'Actualmente tienes',
        importWarningRiders: 'corredores en la tabla',
        importWarningQuestion: '¿Estás seguro de que quieres continuar con la importación?',
        currentDataPreview: 'Vista previa de datos actuales',
        moreRiders: 'más corredores...',
        confirmImport: 'Sí, importar y reemplazar',
        cancelImport: 'Cancelar',
        importCancelled: 'Importación cancelada',
        ridersWillBeDeleted: 'corredores serán eliminados',
        importProceedWarning: 'Todos los datos actuales serán reemplazados por los del archivo Excel',

        deleteOrderTitle: 'Eliminar Orden de Salida',
        confirmDeleteOrder: '¿Estás seguro de que quieres eliminar TODO el orden de salida?',
        deleteWarning: 'Esta acción no se puede deshacer.',
        confirmDelete: 'Sí, eliminar todo',
        deleteCancelled: 'Eliminación cancelada',
        moreRiders: 'más corredores...',

        startOrder: "ORDEN DE SALIDA",
        location: "Lugar",
        date: "Fecha",
        totalRiders: "Total Corredores",
        firstDeparture: "Salida Primer Corredor",
        lastDeparture: "Salida Último Corredor",
        position: "POS",
        bibNumber: "DORSAL",
        name: "NOMBRE",
        surname: "APELLIDOS",
        startTime: "HORA SALIDA",
        time: "CRONO",
        page: "Página",
        of: "de",
    
        "confirmChange": "Confirmar Cambio",
        "changeDifferenceQuestion": "¿Cambiar diferencia de",
        "toText": "a",
        "willUpdateTimes": "Se actualizarán las horas y crono de salida de este corredor y los siguientes.",
        "yesChange": "Sí, cambiar",
        "noCancel": "No, cancelar",
        "differenceUpdated": "Diferencia actualizada correctamente",
        "changeCancelled": "Cambio cancelado",
        "errorIndexOutOfRange": "Error: Índice de corredor inválido",
        diferenciaHeader: "Diferencia",

    },

    ca: {
        // Títulos generales
        appTitle: "Crono CRI - en construcció",
        languagesLabel: "Idioma / Language",
        
        // Tarjetas
        cardRaceTitle: "Gestió de Cursa",
        cardTimeTitle: "Configuració de Temps",
        cardDeparturesTitle: "Sortides Registrades",
        audioConfigTitle: "Configuració d'Àudio",
        cardStartOrderTitle: "Ordre de Sortida",
        
        modeSalidaText: "SORTIDES",        // Catalán
        modeLlegadasText: "ARRIBADES",     // Catalán

        // Botones de carrera
        newRaceText: "Nova",
        deleteRaceText: "Eliminar",
        deleteRaceConfirmBtn: "Eliminar",
        deleteRaceCancelBtn:'Cancelar',
        
        // Configuración de audio
        beepOptionTitle: "Sons Beep",
        voiceOptionTitle: "Veü gravada",
        muteOptionTitle: "Sense so",
        testAudioText: "Provar so actual",
        
        // Configuración de tiempo
        intervalTimeLabel: "Temps entre sortides",
        minutesText: "minuts",
        secondsText: "segons",
        
        // Posición inicial
        startFromXText: "Posició actual:",
        startCountdownText: "INICIAR COMPTE ENRERE",
        exitCompleteText: "REINICIAR",
        
        // Lista de salidas
        clearDeparturesText: "Netejar llista",
        exportExcelText: "Exportar Excel",
        noDeparturesText: "No hi ha sortides registrades",
        departureHeaderDorsal: "Sortida",
        departureHeaderTime: "Temps",
        departureHeaderNotes: "Nota",
        departureHeaderDate: "Hora",
        
        // Footer
        helpText: "Ajuda",
        suggestionsText: "Suggeriments",
        installText: "Instal·lar App",
        updateText: "Buscar actualitzacions",
        copyrightText: "2025 © Copyright ",
        copyrightLink: "Roberto Benet - rbenet71@gmail.com - V_18_12_2025",
        
        // Modal de ayuda
        helpModalTitle: "Ajuda de Crono CRI",
        helpModalText1: "Crono CRI és una aplicació per controlar les sortides en curses amb compte enrere visual i sonor.",
        helpModalSubtitle1: "Com usar:",
        helpModalList: `<li><strong>Selecciona una cursa</strong> o crea una de nova</li>
                        <li><strong>Configura la cadència de sortida</strong> (sempre igual o per trams)</li>
                        <li><strong>Inicia des del corredor 1</strong> o des d'una posició específica</li>
                        <li><strong>Prem \"INICIAR COMPTE ENRERE\"</strong> per començar</li>
                        <li><strong>La pantalla canviarà</strong> mostrant el compte enrere gran</li>
                        <li><strong>Quan arribi a zero</strong> es mostrarà \"SORTIDA\" i començarà el compte per al següent</li>`,
        helpModalSubtitle2: "Indicadors visuals:",
        redBackgroundText: "Fons VERMELL:",
        countdownNormalDesc: "Compte enrere normal",
        yellowBackgroundText: "Fons GROC:",
        countdownWarningDesc: "Últims 10 segons",
        greenBackgroundText: "Fons VERD:",
        countdownSalidaDesc: "Moment de sortida (2 segons)",
        redNumbersText: "Números VERMELLS pulsants:",
        countdownCriticalDesc: "Últims 5 segons",
        helpModalSubtitle3: "Sons:",
        beepHighText: "Beep agut:",
        beepHighDesc: "En arribar a 10 segons",
        beepEverySecondText: "Beep cada segon:",
        beepEverySecondDesc: "Últims 5 segons",
        beepLowText: "Beep greu:",
        beepLowDesc: "En arribar a zero",
        helpModalText2: "Els 2 segons de \"SORTIDA\" es resten automàticament del temps del següent compte enrere.",
        
        // Modal nueva carrera
        newRaceModalTitle: "Nova cursa",
        newRaceNameLabel: "Nom de la cursa:",
        newRaceDescLabel: "Descripció (opcional):",
        
        // Modal eliminar carrera
        deleteRaceModalTitle: "Confirmar eliminació",
        deleteRaceModalText: "Esteu segur que voleu eliminar aquesta cursa? Totes les dades es perdran.",
        
        // Modal limpiar salidas
        clearDeparturesModalTitle: "Confirmar neteja",
        clearDeparturesModalText: "Esteu segur que voleu netejar la llista de sortides? Aquesta acció no es pot desfer.",
        
        // Modal sugerencias
        suggestionsModalTitle: "Enviar suggeriments",
        suggestionEmailLabel: "Email (opcional):",
        suggestionTextLabel: "Suggeriments:",
        
        // Modal reiniciar
        restartModalTitle: "Confirmar reinici complet",
        restartModalText: "Esteu segur que voleu reiniciar completament? Aquesta acció:",
        
        // Mensajes
        raceCreated: "Cursa creada correctament",
        raceDeleted: "Cursa eliminada",
        departuresCleared: "Llista de sortides netejada",
        excelExported: "Dades exportades a Excel",
        sessionRestarted: "Sessió reiniciada completament",
        countdownStarted: "Compte enrere iniciat",
        countdownStopped: "Compte enrere aturat",
        updateChecked: "Buscant actualitzacions...",
        adjustmentsSaved: "Ajustos guardats. Proper corredor ({corredor}) sortirà en {seconds} segons",
        timeUpdated: "Temps actualitzat. Proper corredor ({corredor}) sortirà en {seconds} segons",
        enterValidTime: "Introdueix un temps vàlid",
        selectRaceFirst: "Selecciona una cursa primer",
        enterRaceName: "Introdueix un nom per a la cursa",
        listAlreadyEmpty: "La llista ja està buida",
        noDataToExport: "No hi ha dades per exportar",
        waitCountdownEnd: "Espera que acabi el compte enrere actual",
        countdownNotActive: "El compte enrere no està actiu",
        invalidValues: "Valors invàlids",
        importError: "Error en importar el fitxer",
        
        // Pantalla de ejecución
        salidaText: "SORTIDA",
        totalTimeLabel: "Temps total",
        nextCorredorLabel: "Proper surt a",
        departedLabel: "Sortits",
        
        // Orden de salida (CAMELCASE)
        timeConfigLabel: "Configuració d'Horaris",
        firstStartLabel: "Sortida Primer:",
        currentTimeLabel: "Hora:",
        timeDiffLabel: "Compte enrere en:",
        totalRidersLabel: "Total Corredors:",
        actionsLabel: "Accions",
        orderTableLabel: "Ordre de Sortida",
        createTemplateText: "Crear Plantilla",
        importOrderText: "Importar Ordre",
        deleteOrderText: "Eliminar Ordre",
        exportOrderText: "Exportar Excel",
        addRiderText: "Afegir Corredor",
        noStartOrderText: "No hi ha corredors en l'ordre de sortida",
        
        // Headers de tabla orden de salida (CAMELCASE)
        orderHeader: "Ordre",
        dorsalHeader: "Dorsal",
        cronoSalidaHeader: "Crono Sortida",
        horaSalidaHeader: "Hora Sortida",
        nombreHeader: "Nom",
        apellidosHeader: "Cognoms",
        chipHeader: "Xip",
        horaRealHeader: "Hora Sortida Real",
        cronoRealHeader: "Crono Sortida Real",
        horaPrevistaHeader: "Hora Sortida Prevista",
        cronoPrevistaHeader: "Crono Sortida Prevista",
        horaImportadoHeader: "Hora Sortida Importat",
        cronoImportadoHeader: "Crono Sortida Importat",
        cronoSegundosHeader: "Crono Segons",
        horaSegundosHeader: "Hora Segons",
        
        // Mensajes orden de salida
        templateCreated: "Plantilla Excel creada correctament",
        orderImported: "Ordre de sortida importat correctament ({count} corredors)",
        orderDeleted: "Ordre de sortida eliminat",
        orderExported: "Ordre de sortida exportat a Excel",
        riderAdded: "Corredor afegit a l'ordre de sortida",
        riderDeleted: "Corredor eliminat",
        enterValidTimeOrder: "Introdueix una hora vàlida",
        selectOrderFirst: "Selecciona un ordre de sortida primer",
        dataSaved: "Dades guardades correctament",
        confirmDeleteOrder: "Esteu segur d'eliminar l'ordre de sortida?",
        
        // Mensajes de error/success
        success: "Èxit!",
        error: "Error",
        warning: "Advertència",
        info: "Informació",

        // Para los botones de acción:
        understood: "Entès",
        saveButtonText: "Guardar",
        cancelButtonText: "Cancel·lar",
        clear: "Netejar",
        deleteConfirm: "Eliminar",
        sendSuggestion: "Enviar",
        createRace: "Crear cursa",
        restartConfirm: "Sí, reiniciar completament",
        cancel: "Cancel·lar",

        // Para las notas de salidas:
        departurePlaceholder: "Escriu una nota...",

        // Para etiquetas de cuenta atrás:
        countdownlabel: "Sortida en",
        currentPositionText: "Posició actual:",
        startTimeUpdated: "Hora d'inici actualitzada i guardada",
        
        // ============================================
        // NUEVAS TRADUCCIONES PARA SELECTOR DE MODO
        // ============================================
        modeSelectorTitle: "Mode d'Operació",
        modeSalidaDesc: "Control de sortides amb compte enrere",
        modeLlegadasTitle: "Mode Arribades",
        modeLlegadasDesc: "Control de temps d'arribada",
        modeChanged: "Canviat al mode {mode}",
        
        // ============================================
        // NUEVAS TRADUCCIONES PARA MODO LLEGADAS
        // ============================================
        llegadasTimerTitle: "Cronòmetre d'Arribades",
        llegadasTimerLabel: "Temps des de sortida del primer corredor:",
        startLlegadasText: "Iniciar Cronòmetre",
        stopLlegadasText: "Aturar",
        registerLlegadaText: "Registrar Arribada",
        importLlegadasText: "Importar Sortides",
        llegadasListTitle: "Arribades Registrades",
        clearLlegadasText: "Netejar arribades",
        exportLlegadasText: "Exportar Excel",
        showRankingText: "Veure Classificació",
        noLlegadasText: "No hi ha arribades registrades",
        
        // ============================================
        // TRADUCCIONES PARA REGISTRO DE LLEGADAS
        // ============================================
        registerLlegadaModalTitle: "Registrar Arribada",
        llegadaDorsalLabel: "Dorsal del corredor:",
        llegadaHoraLabel: "Hora d'arribada:",
        llegadaNotasLabel: "Notes (opcional):",
        confirmLlegadaBtn: "Registrar Arribada",
        cancelLlegadaBtn: "Cancel·lar",
        quickRegisterTitle: "Registrar arribada ràpida",
        
        // ============================================
        // TRADUCCIONES PARA IMPORTACIÓN DE SALIDAS
        // ============================================
        importSalidasModalTitle: "Importar Dades de Sortides",
        importSalidasModalText: "Selecciona el fitxer Excel amb les dades de sortides dels corredors.",
        confirmImportSalidasBtn: "Importar",
        cancelImportSalidasBtn: "Cancel·lar",
        importPreviewTitle: "Vista prèvia de dades:",
        importSuccess: "Dades de sortides importades correctament ({count} corredors)",
        importError: "Error en importar les dades",
        startTimerFirst: "Primer inicia el cronòmetre d'arribades",
        noDataImported: "No es van poder importar dades de sortides",
        
        // ============================================
        // TRADUCCIONES PARA CLASIFICACIÓN
        // ============================================
        rankingModalTitle: "Classificació de la Cursa",
        noRankingText: "No hi ha suficients dades per generar la classificació",
        rankingPos: "Pos",
        rankingDorsal: "Dorsal",
        rankingNombre: "Nom",
        rankingTiempo: "Temps Crono",
        rankingDiferencia: "Diferència",
        exportRankingBtn: "Exportar Classificació",
        closeRankingBtn: "Tancar",
        
        // ============================================
        // TRADUCCIONES PARA CABECERAS DE TABLAS (LLEGADAS)
        // ============================================
        llegadaHeaderDorsal: "Dorsal",
        llegadaHeaderNombre: "Nom",
        llegadaHeaderSalida: "Hora Sortida",
        llegadaHeaderLlegada: "Hora Arribada",
        llegadaHeaderCrono: "Temps Crono",
        llegadaHeaderNotas: "Notes",
        
        // ============================================
        // TRADUCCIONES PARA CONFIGURACIÓN DE AUDIO
        // ============================================
        audioConfigTitle: "Configuració d'Àudio per a Sortides",
        beepOptionTitle: "Sons Beep",
        voiceOptionTitle: "Veu gravada",
        muteOptionTitle: "Sense so",
        testAudioText: "Provar so actual",
        
        // ============================================
        // TRADUCCIONES PARA CONFIGURACIÓN DE TIEMPO
        // ============================================
        cardTimeTitle: "Configuració de Temps per a Sortides",
        
        // ============================================
        // TRADUCCIONES PARA MENSAJES DE ESTADO (LLEGADAS)
        // ============================================
        llegadaRegistered: "Arribada registrada per a dorsal {dorsal}",
        llegadaAlreadyExists: "Ja existeix una arribada registrada per al dorsal {dorsal}",
        llegadasCleared: "Llista d'arribades netejada",
        timerStarted: "Cronòmetre d'arribades iniciat",
        timerStopped: "Cronòmetre aturat",
        rankingGenerated: "Classificació generada amb {count} corredors",
        llegadasExported: "Arribades exportades a Excel",
        rankingExported: "Classificació exportada a Excel",
        
        // ============================================
        // TRADUCCIONES PARA VALIDACIONES
        // ============================================
        enterDorsal: "Introdueix un número de dorsal vàlid",
        invalidDorsal: "Dorsal no vàlid",
        noStartTimeData: "No hi ha dades d'hora de sortida per a aquest dorsal",
        confirmClearLlegadas: "Estàs segur que vols netejar totes les arribades registrades?",
        selectFileFirst: "Primer selecciona un fitxer",

        // ============================================
        // EXPORTA EXCEL
        // ============================================
        templateCreatedCustom: "Plantilla creada amb {count} corredors, interval {interval}, inici {startTime}",
        enterValidRiders: "Si us plau, introdueix un nombre vàlid de corredors (1-1000)",
        enterValidInterval: "Si us plau, introdueix un interval vàlid (HH:MM:SS)",
        enterValidStartTime: "Si us plau, introdueix una hora d'inici vàlida (HH:MM:SS)",
        configTemplateTitle: "Configurar Plantilla de Sortida",
        numRidersLabel: "Nombre de corredors:",
        intervalLabel: "Interval entre sortides (HH:MM:SS):",
        startTimeLabel: "Hora d'inici (HH:MM:SS):",
        intervalExample: "Ex: 00:01:00 per a 1 minut, 00:02:30 per a 2 minuts i 30 segons",
        startTimeExample: "Ex: 09:00:00 per a les 9 del matí",

        cardRaceTitle: "Gestió de Cursa",
        modeSelectorTitle: "Mode d'Operació",
        cardStartOrderTitle: "Ordre de Sortida",
        modeSalidaTitle: "Sortides",  // Para catalán  
        modeLlegadasTitle: "Arribades", // Para catalán

        timeChangeTitle: "Canviar hora d'inici",
        timeChangeWarning: "Estàs segur? Això actualitzarà totes les hores de sortida a la taula.",
        timeChangeRiders: "Corredors afectats:",
        timeChangeFirst: "Primer corredor:",
        confirmChange: "Sí, actualitzar tot",
        cancelChange: "Cancel·lar",
        onlyFirst: "Només el primer",
        allTimesUpdated: "Totes les hores de sortida actualitzades",
        timeChangeCancelled: "Canvi cancel·lat",
        onlyFirstUpdated: "Només s'ha actualitzat el primer corredor",

        // Botones de copia de seguridad en gestión de carrera
        backupRaceText: "Còpia Seguretat",
        restoreRaceText: "Restaurar",
        
        // Mensajes de copia de seguridad
        backupRaceSuccess: "Còpia de seguretat de la cursa creada exitosament",
        restoreRaceSuccess: "Cursa restaurada exitosament",
        noRaceSelectedForBackup: "Selecciona una cursa primer per a fer la còpia",
        backupRaceContains: "La còpia conté: {departures} sortides, {order} en ordre, {llegadas} arribades",
        restoreOptionsTitle: "Opcions de restauració",
        whatToRestore: "Quines dades restaurar?",
        restoreDepartures: "Dades de sortides",
        restoreStartOrder: "Ordre de sortida",
        restoreLlegadas: "Dades d'arribades",
        restoreConfig: "Configuració",
        restoreOptionReplace: "Reemplaçar cursa existent",
        restoreOptionRename: "Crear com a nova cursa",
        raceAlreadyExists: "Ja existeix una cursa amb aquest nom",
        restoringToNewRace: "Es crearà com a nova cursa",
        restoringToExisting: "Es reemplaçarà la cursa existent",

        // Modal nueva carrera - campos extendidos
        newRaceDateLabel: "Data de la cursa:",
        newRaceCategoryLabel: "Categoria:",
        newRaceOrganizerLabel: "Organitzador/Club:",
        newRaceLocationLabel: "Població/Lloc:",
        newRaceModalityLabel: "Modalitat de cursa:",
        newRaceOtherModalityLabel: "Especificar modalitat:",
        newRaceDescriptionLabel: "Descripció/Notes:",

        // Opciones de categoría
        categorySelect: "-- Selecciona categoria --",
        categoryElite: "Èlite",
        categoryMaster: "Master",
        categoryJunior: "Junior",
        categoryCadete: "Cadet",
        categoryInfantil: "Infantil",
        categoryFemenino: "Femení",
        categoryMixto: "Mixt",
        categoryAficionado: "Aficionat",
        categoryOtro: "Altres",

        // Modalidades
        modalityCri: "CRI (Contrarellotge Individual)",
        modalityCre: "CRE (Contrarellotge per Equips)",
        modalityDescenso: "Descens (Downhill)",
        modalityOtras: "Altres modalitats",
        modalityOtherPlaceholder: "Ex: Marató, Enduro, XCO...",

        // Secciones del formulario
        formSectionBasic: "Informació bàsica",
        formSectionOrganization: "Organització",
        formSectionModality: "Modalitat de cursa",
        formSectionAdditional: "Informació adicional",

        // Mensajes de validación
        requiredField: "Camp obligatori",
        enterValidDate: "Introdueix una data vàlida",
        editRaceText: "Editar",
        editRaceTitle: "Editar cursa",
        saveChanges: "Guardar canvis",
        raceUpdated: "Cursa actualitzada correctament",
        
        backupCreated: "Còpia de seguretat guardada com {filename}",
        creatingBackup: "Creant còpia de seguretat...",
        noRaceSelected: "Selecciona una cursa primer",

        // PDF Export
        creatingPDF: "Generant PDF...",
        exportPDF: "Exportar PDF",
        pdfGenerated: "PDF generat: {filename} - {count} corredors",
        
        // Backup/restore
        backupCreated: "Còpia de seguretat guardada com {filename}",
        creatingBackup: "Creant còpia de seguretat...",
        noRaceSelected: "Selecciona una cursa primer",
        restoreTitle: "Restaurar cursa des de còpia",
        restoreWarning: "Aquesta acció reemplaçarà les dades actuals de la cursa",
        restoreSuccess: "Cursa restaurada correctament",
        restoreError: "Error al restaurar la cursa",
        confirmRestore: "¿Confirmar restauració?",
        cancel: "Cancel·lar",
        
        // Race management
        enterRaceName: "Introdueix un nom per a la cursa",
        enterValidDate: "Introdueix una data vàlida",
        raceCreated: "Cursa creada correctament",
        raceUpdated: "Cursa actualitzada correctament",
        raceDeleted: "Cursa eliminada correctament",
        selectRaceFirst: "Selecciona una cursa primer",
        departuresCleared: "Sortides reiniciades correctament",
        sessionRestarted: "Sessió reiniciada completament",
        
        // Start order
        listAlreadyEmpty: "La llista ja està buida",
        confirmDeleteOrder: "¿Eliminar TOT l'ordre de sortida? Aquesta acció no es pot desfer.",
        orderDeleted: "Ordre de sortida eliminat",
        riderAdded: "Corredor afegit",
        
        // Modals
        editRaceTitle: "Editar cursa",
        saveChanges: "Guardar canvis",
        createRace: "Crear cursa",
        newRaceModalTitle: "Nova cursa",
        
        // Suggestions
        suggestionTextLabel: "Introdueix la teva suggerència",
        suggestionSent: "Suggerència enviada",
        
        // Time management
        timeChangeCancelled: "Canvi d'hora cancel·lat",
        
        // Update notification
        updateAvailable: "Nova versió disponible",

        creatingPDF: 'Generant PDF de l\'ordre de sortida...',
        pdfGenerated: 'PDF generat: {filename} ({count} corredors)',
        pdfError: 'Error al generar el PDF',
        pdfLibraryMissing: 'La llibreria PDF no està carregada',
        noStartOrderData: 'No hi ha dades d\'ordre de sortida per generar PDF',

        pdfOrderOfStart: "ORDRE DE SORTIDA",
        position: "POS",
        number: "DORSAL",
        name: "NOM",
        surname: "COGNOMS",
        startTime: "HORA SORTIDA",
        crono: "CRONO",
        riders: "Corredors",
        start: "Inici",
        final: "Final",
        generated: "Generat",
        page: "Pàgina",
        of: "de",
        pdfGenerated: "PDF generat",
        pdfError: "Error generant PDF",
        cronoRealSegundosHeader: "Crono Sortida Real Segons",
        horaRealSegundosHeader: "Hora Sortida Real Segons",

        // Tooltips para columnas de orden de salida
        orderTooltip: "Posició en la que sortirà el corredor",
        dorsalTooltip: "Número de dorsal del corredor",
        cronosalidaTooltip: "Temps de Cronòmetre en el que sortirà el corredor. El programa utilitza aquest valor per donar les sortides.",
        horasalidaTooltip: "Hora prevista de sortida, és informació, no s'utilitza per controlar sortides.",
        nombreTooltip: "Nom del corredor",
        apellidosTooltip: "Cognoms del corredor",
        chipTooltip: "Número de xip del corredor",
        horarealTooltip: "Hora del dia en la que efectivament sortí el corredor",
        cronorealTooltip: "Hora del cronòmetre en la que efectivament sortí el corredor",
        horaprevistaTooltip: "Hora del dia prevista de sortida. Variarà si es modifica l'hora de sortida del corredor individual.",
        cronoprevistaTooltip: "Hora del cronòmetre prevista de sortida. Variarà si es modifica l'hora de sortida del corredor individual.",
        horaimportadoTooltip: "Hora del dia que estava en l'Excel importat",
        cronoimportadoTooltip: "Hora del cronòmetre que estava en l'Excel importat",
        cronosegundosTooltip: "Crono Sortida en segons (per a càlculs interns)",
        horasegundosTooltip: "Hora Sortida en segons (per a càlculs interns)",
        horarealsegundosTooltip: "Hora Sortida Real en segons (per a càlculs interns)",

        addRiderTitle: 'Afegir corredor',
        selectPosition: 'Seleccionar posició:',
        positionEnd: 'Al final de la llista',
        positionBeginning: 'Al principi de la llista',
        positionSpecific: 'En una posició específica...',
        specificPosition: 'Posició:',
        positionInfo: 'Els corredors des d\'aquesta posició es desplaçaran cap avall.',
        riderPreview: 'Nou corredor',
        positionLabel: 'Posició:',
        timeLabel: 'Hora sortida:',
        addRiderButton: 'Afegir corredor',
        firstRiderCreated: 'Primer corredor creat correctament',
        riderAddedAtPosition: 'Corredor afegit a la posició {position}',
        invalidValue: 'Valor invàlid',
        confirmChange: 'Sí, actualitzar tot',
        cancelChange: 'Cancel·lar',
        timeChangeTitle: 'Canviar hora d\'inici',
        timeChangeWarning: 'Estàs segur que vols actualitzar totes les hores de sortida?',
        timeChangeCancelled: 'Canvi cancel·lat',
        allTimesUpdated: 'Totes les hores de sortida actualitzades',
        enterValidTime: 'Formato de hora invàlid. Utilitza HH:MM o HH:MM:SS',
        timeChangeTitle: 'Canviar hora d\'inici',
        timeChangeWarning: 'Estàs segur que vols actualitzar totes les hores de sortida?',
        timeChangeCancelled: 'Canvi cancel·lat',
        allTimesUpdated: 'Totes les hores de sortida actualitzades',

        positionSection: 'Posició del corredor',
        riderDataSection: 'Dades del corredor',
        dorsalLabel: 'Dorsal:',
        dorsalPlaceholder: 'Número de dorsal',
        dorsalRequired: 'El dorsal és obligatori',
        chipLabel: 'Xip:',
        chipPlaceholder: 'Número de xip',
        nameLabel: 'Nom:',
        namePlaceholder: 'Nom del corredor',
        surnameLabel: 'Cognoms:',
        surnamePlaceholder: 'Cognoms del corredor',
        previewSection: 'Vista prèvia',
        confirmAddRider: 'Confirmar i afegir',
        riderAddedDetails: 'Corredor #{dorsal} ({name}) afegit a la posició {position} a les {time}',

        importWarningTitle: 'Atenció!',
        importWarning: 'Les dades actuals s\'esborraran',
        importWarningDetails: 'Actualment tens',
        importWarningRiders: 'corredors a la taula',
        importWarningQuestion: 'Estàs segur que vols continuar amb la importació?',
        currentDataPreview: 'Vista prèvia de les dades actuals',
        moreRiders: 'més corredors...',
        confirmImport: 'Sí, importar i reemplaçar',
        cancelImport: 'Cancel·lar',
        importCancelled: 'Importació cancel·lada',
        ridersWillBeDeleted: 'corredors seran eliminats',
        importProceedWarning: 'Totes les dades actuals seran reemplaçades per les del fitxer Excel',
        
        deleteOrderTitle:"Eliminar Ordre de Sortida",
        confirmDeleteOrder:"Estàs segur que vols eliminar TOT l'ordre de sortida?",
        deleteWarning:"Aquesta acció no es pot desfer.",
        confirmDelete:"Sí, eliminar tot",
        deleteCancelled:"Eliminació cancel·lada",
        moreRiders:"més corredors...",
        
        startOrder:"ORDRE DE SORTIDA",
        location:"Lloc",
        date:"Data",
        totalRiders:"Total Corredors",
        firstDeparture:"Sortida Primer Corredor",
        lastDeparture:"Sortida Últim Corredor",
        position:"POS",
        bibNumber:"DORSAL",
        name:"NOM",
        surname:"COGNOMS",
        startTime:"HORA SORTIDA",
        time:"CRONO",
        page:"Pàgina",
        of:"de",   
        diferenciaHeader: "Diferència",
    },

    en: {
        appTitle: "Crono CRI - under construction",
        languagesLabel: "Language / Idioma",
        
        // Tarjetas
        cardRaceTitle: "Race Management",
        cardTimeTitle: "Time Configuration",
        cardDeparturesTitle: "Registered Departures",
        audioConfigTitle: "Audio Configuration",
        cardStartOrderTitle: "Start Order",
        
        // Botones de carrera
        newRaceText: "New",
        deleteRaceText: "Delete",
        deleteRaceConfirmBtn: "Delete",
        deleteRaceCancelBtn:'Cancel',

        modeSalidaText: "STARTS",          // Inglés
        modeLlegadasText: "FINISHES",      // Inglés

        // Configuración de audio
        beepOptionTitle: "Beep Sounds",
        voiceOptionTitle: "Recorded Voice",
        muteOptionTitle: "No Sound",
        testAudioText: "Test Current Sound",
        
        // Configuración de tiempo
        intervalTimeLabel: "Time between departures",
        minutesText: "minutes",
        secondsText: "seconds",
        
        // Posición inicial
        startFromXText: "Current position:",
        startCountdownText: "START COUNTDOWN",
        exitCompleteText: "RESET",
        
        // Lista de salidas
        clearDeparturesText: "Clear list",
        exportExcelText: "Export Excel",
        noDeparturesText: "No departures registered",
        departureHeaderDorsal: "Departure",
        departureHeaderTime: "Time",
        departureHeaderNotes: "Note",
        departureHeaderDate: "Time",
        
        // Footer
        helpText: "Help",
        suggestionsText: "Suggestions",
        installText: "Install App",
        updateText: "Check for Updates",

        copyrightText: "2025 © Copyright ",
        copyrightLink: "Roberto Benet - rbenet71@gmail.com - V_18_12_2025",
        
        // Modal de ayuda
        helpModalTitle: "Crono CRI Help",
        helpModalText1: "Crono CRI is an application to control race departures with visual and sound countdown.",
        helpModalSubtitle1: "How to use:",
        helpModalList: `<li><strong>Select a race</strong> or create a new one</li>
                        <li><strong>Configure departure cadence</strong> (always same or by segments)</li>
                        <li><strong>Start from rider 1</strong> or from a specific position</li>
                        <li><strong>Press \"START COUNTDOWN\"</strong> to begin</li>
                        <li><strong>The screen will change</strong> showing the big countdown</li>
                        <li><strong>When it reaches zero</strong> it will show \"DEPARTURE\" and start the count for the next</li>`,
        helpModalSubtitle2: "Visual indicators:",
        redBackgroundText: "RED background:",
        countdownNormalDesc: "Normal countdown",
        yellowBackgroundText: "YELLOW background:",
        countdownWarningDesc: "Last 10 seconds",
        greenBackgroundText: "GREEN background:",
        countdownSalidaDesc: "Departure moment (2 seconds)",
        redNumbersText: "RED pulsing numbers:",
        countdownCriticalDesc: "Last 5 seconds",
        helpModalSubtitle3: "Sounds:",
        beepHighText: "High beep:",
        beepHighDesc: "When reaching 10 seconds",
        beepEverySecondText: "Beep every second:",
        beepEverySecondDesc: "Last 5 seconds",
        beepLowText: "Low beep:",
        beepLowDesc: "When reaching zero",
        helpModalText2: "The 2 seconds of \"DEPARTURE\" are automatically subtracted from the next countdown time.",
        
        // Modal nueva carrera
        newRaceModalTitle: "New Race",
        newRaceNameLabel: "Race name:",
        newRaceDescLabel: "Description (optional):",
        
        // Modal eliminar carrera
        deleteRaceModalTitle: "Confirm deletion",
        deleteRaceModalText: "Are you sure you want to delete this race? All data will be lost.",
        
        // Modal limpiar salidas
        clearDeparturesModalTitle: "Confirm cleanup",
        clearDeparturesModalText: "Are you sure you want to clear the departures list? This action cannot be undone.",
        
        // Modal sugerencias
        suggestionsModalTitle: "Send Suggestions",
        suggestionEmailLabel: "Email (optional):",
        suggestionTextLabel: "Suggestions:",
        
        // Modal reiniciar
        restartModalTitle: "Confirm complete reset",
        restartModalText: "Are you sure you want to completely reset? This action:",
        
        // Mensajes
        raceCreated: "Race created successfully",
        raceDeleted: "Race deleted",
        departuresCleared: "Departures list cleared",
        excelExported: "Data exported to Excel",
        sessionRestarted: "Session completely restarted",
        countdownStarted: "Countdown started",
        countdownStopped: "Countdown stopped",
        updateChecked: "Checking for updates...",
        adjustmentsSaved: "Adjustments saved. Next rider ({corredor}) will depart in {seconds} seconds",
        timeUpdated: "Time updated. Next rider ({corredor}) will depart in {seconds} seconds",
        enterValidTime: "Enter a valid time",
        selectRaceFirst: "Select a race first",
        enterRaceName: "Enter a name for the race",
        listAlreadyEmpty: "The list is already empty",
        noDataToExport: "No data to export",
        waitCountdownEnd: "Wait for the current countdown to end",
        countdownNotActive: "Countdown is not active",
        invalidValues: "Invalid values",
        importError: "Error importing file",
        
        // Pantalla de ejecución
        salidaText: "DEPARTURE",
        totalTimeLabel: "Total time",
        nextCorredorLabel: "Next departs at",
        departedLabel: "Departed",
        
        // Orden de salida (CAMELCASE)
        timeConfigLabel: "Schedule Configuration",
        firstStartLabel: "First Starts:",
        currentTimeLabel: "Time:",
        timeDiffLabel: "Countdown in:",
        totalRidersLabel: "Total Riders:",
        actionsLabel: "Actions",
        orderTableLabel: "Start Order",
        createTemplateText: "Create Template",
        importOrderText: "Import Order",
        deleteOrderText: "Delete Order",
        exportOrderText: "Export Excel",
        addRiderText: "Add Rider",
        noStartOrderText: "No riders in start order",
        
        // Headers de tabla orden de salida (CAMELCASE)
        orderHeader: "Order",
        dorsalHeader: "Number",
        cronoSalidaHeader: "Departure Time",
        horaSalidaHeader: "Departure Hour",
        nombreHeader: "First Name",
        apellidosHeader: "Last Name",
        chipHeader: "Chip",
        horaRealHeader: "Real Departure Hour",
        cronoRealHeader: "Real Departure Time",
        horaPrevistaHeader: "Scheduled Hour",
        cronoPrevistaHeader: "Scheduled Time",
        horaImportadoHeader: "Imported Hour",
        cronoImportadoHeader: "Imported Time",
        cronoSegundosHeader: "Time Seconds",
        horaSegundosHeader: "Hour Seconds",
        
        // Mensajes orden de salida
        templateCreated: "Excel template created successfully",
        orderImported: "Start order imported successfully ({count} riders)",
        orderDeleted: "Start order deleted",
        orderExported: "Start order exported to Excel",
        riderAdded: "Rider added to start order",
        riderDeleted: "Rider deleted",
        enterValidTimeOrder: "Enter a valid time",
        selectOrderFirst: "Select a start order first",
        dataSaved: "Data saved successfully",
        confirmDeleteOrder: "Are you sure to delete the start order?",
        
        // Mensajes de error/success
        success: "Success!",
        error: "Error",
        warning: "Warning",
        info: "Information",

        // Para los botones de acción:
        understood: "Understood",
        saveButtonText: "Save",
        cancelButtonText: "Cancel",
        clear: "Clear",
        deleteConfirm: "Delete",
        sendSuggestion: "Send",
        createRace: "Create race",
        restartConfirm: "Yes, reset completely",
        cancel: "Cancel",

        // Para las notas de salidas:
        departurePlaceholder: "Write a note...",

        // Para etiquetas de cuenta atrás:
        countdownlabel: "Departure in",
        currentPositionText: "Current position:",
        startTimeUpdated: "Start time updated and saved",
        
        // ============================================
        // NEW TRANSLATIONS FOR MODE SELECTOR
        // ============================================
        modeSelectorTitle: "Operation Mode",
        modeSalidaDesc: "Start control with countdown",
        modeLlegadasTitle: "Finish Mode",
        modeLlegadasDesc: "Finish time control",
        modeChanged: "Switched to {mode} mode",
        
        // ============================================
        // NEW TRANSLATIONS FOR FINISH MODE
        // ============================================
        llegadasTimerTitle: "Finish Timer",
        llegadasTimerLabel: "Time since first rider start:",
        startLlegadasText: "Start Timer",
        stopLlegadasText: "Stop",
        registerLlegadaText: "Register Finish",
        importLlegadasText: "Import Starts",
        llegadasListTitle: "Registered Finishes",
        clearLlegadasText: "Clear finishes",
        exportLlegadasText: "Export Excel",
        showRankingText: "View Ranking",
        noLlegadasText: "No finishes registered",
        
        // ============================================
        // TRANSLATIONS FOR FINISH REGISTRATION
        // ============================================
        registerLlegadaModalTitle: "Register Finish",
        llegadaDorsalLabel: "Rider number:",
        llegadaHoraLabel: "Finish time:",
        llegadaNotasLabel: "Notes (optional):",
        confirmLlegadaBtn: "Register Finish",
        cancelLlegadaBtn: "Cancel",
        quickRegisterTitle: "Quick finish registration",
        
        // ============================================
        // TRANSLATIONS FOR START DATA IMPORT
        // ============================================
        importSalidasModalTitle: "Import Start Data",
        importSalidasModalText: "Select the Excel file with riders start data.",
        confirmImportSalidasBtn: "Import",
        cancelImportSalidasBtn: "Cancel",
        importPreviewTitle: "Data preview:",
        importSuccess: "Start data imported successfully ({count} riders)",
        importError: "Error importing data",
        startTimerFirst: "First start the finish timer",
        noDataImported: "Could not import start data",
        
        // ============================================
        // TRANSLATIONS FOR RANKING
        // ============================================
        rankingModalTitle: "Race Ranking",
        noRankingText: "Not enough data to generate ranking",
        rankingPos: "Pos",
        rankingDorsal: "Number",
        rankingNombre: "Name",
        rankingTiempo: "Time",
        rankingDiferencia: "Gap",
        exportRankingBtn: "Export Ranking",
        closeRankingBtn: "Close",
        
        // ============================================
        // TRANSLATIONS FOR TABLE HEADERS (FINISHES)
        // ============================================
        llegadaHeaderDorsal: "Number",
        llegadaHeaderNombre: "Name",
        llegadaHeaderSalida: "Start Time",
        llegadaHeaderLlegada: "Finish Time",
        llegadaHeaderCrono: "Race Time",
        llegadaHeaderNotas: "Notes",
        
        // ============================================
        // TRANSLATIONS FOR AUDIO CONFIGURATION
        // ============================================
        audioConfigTitle: "Audio Configuration for Starts",
        beepOptionTitle: "Beep Sounds",
        voiceOptionTitle: "Recorded Voice",
        muteOptionTitle: "No Sound",
        testAudioText: "Test current sound",
        
        // ============================================
        // TRANSLATIONS FOR TIME CONFIGURATION
        // ============================================
        cardTimeTitle: "Time Configuration for Starts",
        
        // ============================================
        // TRANSLATIONS FOR STATUS MESSAGES (FINISHES)
        // ============================================
        llegadaRegistered: "Finish registered for number {dorsal}",
        llegadaAlreadyExists: "Finish already registered for number {dorsal}",
        llegadasCleared: "Finish list cleared",
        timerStarted: "Finish timer started",
        timerStopped: "Timer stopped",
        rankingGenerated: "Ranking generated with {count} riders",
        llegadasExported: "Finishes exported to Excel",
        rankingExported: "Ranking exported to Excel",
        
        // ============================================
        // TRANSLATIONS FOR VALIDATIONS
        // ============================================
        enterDorsal: "Enter a valid rider number",
        invalidDorsal: "Invalid rider number",
        noStartTimeData: "No start time data for this rider number",
        confirmClearLlegadas: "Are you sure you want to clear all registered finishes?",
        selectFileFirst: "First select a file",

        // ============================================
        // EXPORTA EXCEL
        // ============================================
        templateCreatedCustom: "Template created with {count} riders, interval {interval}, start {startTime}",
        enterValidRiders: "Please enter a valid number of riders (1-1000)",
        enterValidInterval: "Please enter a valid interval (HH:MM:SS)",
        enterValidStartTime: "Please enter a valid start time (HH:MM:SS)",
        configTemplateTitle: "Configure Start Template",
        numRidersLabel: "Number of riders:",
        intervalLabel: "Interval between starts (HH:MM:SS):",
        startTimeLabel: "Start time (HH:MM:SS):",
        intervalExample: "Ex: 00:01:00 for 1 minute, 00:02:30 for 2 minutes and 30 seconds",
        startTimeExample: "Ex: 09:00:00 for 9 AM",

        cardRaceTitle: "Race Management",
        modeSelectorTitle: "Operation Mode",
        cardStartOrderTitle: "Start Order",
        modeSalidaTitle: "Starts",  // Para inglés
        modeLlegadasTitle: "Finishes", // Para inglés

        timeChangeTitle: "Change start time",
        timeChangeWarning: "Are you sure? This will update all departure times in the table.",
        timeChangeRiders: "Affected riders:",
        timeChangeFirst: "First rider:",
        confirmChange: "Yes, update all",
        cancelChange: "Cancel",
        onlyFirst: "Only the first one",
        allTimesUpdated: "All departure times updated",
        timeChangeCancelled: "Change cancelled",
        onlyFirstUpdated: "Only the first rider updated",

        // Botones de copia de seguridad en gestión de carrera
        backupRaceText: "Backup",
        restoreRaceText: "Restore",
        
        // Mensajes específicos de copia por carrera
        backupRaceSuccess: "Race backup created successfully",
        restoreRaceSuccess: "Race restored successfully",
        noRaceSelectedForBackup: "Select a race first to make the backup",
        backupRaceContains: "Backup contains: {departures} departures, {order} in order, {llegadas} finishes",
        restoreOptionsTitle: "Restoration options",
        whatToRestore: "What data to restore?",
        restoreDepartures: "Departures data",
        restoreStartOrder: "Start order",
        restoreLlegadas: "Finish data",
        restoreConfig: "Configuration",
        restoreOptionReplace: "Replace existing race",
        restoreOptionRename: "Create as new race",
        raceAlreadyExists: "A race with this name already exists",
        restoringToNewRace: "Will be created as a new race",
        restoringToExisting: "Will replace the existing race",

        // Modal nueva carrera - campos extendidos
        newRaceDateLabel: "Race date:",
        newRaceCategoryLabel: "Category:",
        newRaceOrganizerLabel: "Organizer/Club:",
        newRaceLocationLabel: "Location/Place:",
        newRaceModalityLabel: "Race modality:",
        newRaceOtherModalityLabel: "Specify modality:",
        newRaceDescriptionLabel: "Description/Notes:",

        // Opciones de categoría
        categorySelect: "-- Select category --",
        categoryElite: "Elite",
        categoryMaster: "Master",
        categoryJunior: "Junior",
        categoryCadete: "Cadet",
        categoryInfantil: "Youth",
        categoryFemenino: "Women",
        categoryMixto: "Mixed",
        categoryAficionado: "Amateur",
        categoryOtro: "Other",

        // Modalidades
        modalityCri: "CRI (Individual Time Trial)",
        modalityCre: "CRE (Team Time Trial)",
        modalityDescenso: "Downhill",
        modalityOtras: "Other modalities",
        modalityOtherPlaceholder: "Ex: Marathon, Enduro, XCO...",

        // Secciones del formulario
        formSectionBasic: "Basic information",
        formSectionOrganization: "Organization",
        formSectionModality: "Race modality",
        formSectionAdditional: "Additional information",

        // Mensajes de validación
        requiredField: "Required field",
        enterValidDate: "Enter a valid date",
        editRaceText: "Edit",
        editRaceTitle: "Edit race",
        saveChanges: "Save changes",
        raceUpdated: "Race updated successfully",

        backupCreated: "Backup saved as {filename}",
        creatingBackup: "Creating backup...",
        noRaceSelected: "Select a race first",

        creatingPDF: "Generating PDF...",
        exportPDF: "Export PDF",
        pdfGenerated: "PDF generated: {filename} - {count} riders",
        
        // Backup/restore
        backupCreated: "Backup saved as {filename}",
        creatingBackup: "Creating backup...",
        noRaceSelected: "Select a race first",
        restoreTitle: "Restore race from backup",
        restoreWarning: "This action will replace current race data",
        restoreSuccess: "Race restored successfully",
        restoreError: "Error restoring race",
        confirmRestore: "Confirm restoration?",
        cancel: "Cancel",
        
        // Race management
        enterRaceName: "Enter a race name",
        enterValidDate: "Enter a valid date",
        raceCreated: "Race created successfully",
        raceUpdated: "Race updated successfully",
        raceDeleted: "Race deleted successfully",
        selectRaceFirst: "Select a race first",
        departuresCleared: "Departures reset successfully",
        sessionRestarted: "Session completely restarted",
        
        // Start order
        listAlreadyEmpty: "The list is already empty",
        confirmDeleteOrder: "Delete ALL start order? This action cannot be undone.",
        orderDeleted: "Start order deleted",
        riderAdded: "Rider added",
        
        // Modals
        editRaceTitle: "Edit race",
        saveChanges: "Save changes",
        createRace: "Create race",
        newRaceModalTitle: "New race",
        
        // Suggestions
        suggestionTextLabel: "Enter your suggestion",
        suggestionSent: "Suggestion sent",
        
        // Time management
        timeChangeCancelled: "Time change cancelled",
        
        // Update notification
        updateAvailable: "New version available",

        creatingPDF: 'Generating start order PDF...',
        pdfGenerated: 'PDF generated: {filename} ({count} riders)',
        pdfError: 'Error generating PDF',
        pdfLibraryMissing: 'PDF library not loaded',
        noStartOrderData: 'No start order data to generate PDF',

        pdfOrderOfStart: "START ORDER",
        position: "POS",
        number: "NUMBER",
        name: "NAME",
        surname: "SURNAME",
        startTime: "START TIME",
        crono: "TIME",
        riders: "Riders",
        start: "Start",
        final: "Final",
        generated: "Generated",
        page: "Page",
        of: "of",
        pdfGenerated: "PDF generated",
        pdfError: "Error generating PDF",

        cronoRealSegundosHeader: "Crono Departure Real Seconds",
        horaRealSegundosHeader: "Hour Departure Real Seconds",

        // Tooltips para columnas de orden de salida
        orderTooltip: "Position in which the rider will start",
        dorsalTooltip: "Rider's bib number",
        cronosalidaTooltip: "Stopwatch time at which the rider will start. The program uses this value to give the starts.",
        horasalidaTooltip: "Scheduled departure time, it's information only, not used to control starts.",
        nombreTooltip: "Rider's first name",
        apellidosTooltip: "Rider's last name",
        chipTooltip: "Chip number of the rider",
        horarealTooltip: "Actual time of day when the rider started",
        cronorealTooltip: "Actual stopwatch time when the rider started",
        horaprevistaTooltip: "Scheduled time of day for departure. Will vary if the individual rider's start time is modified.",
        cronoprevistaTooltip: "Scheduled stopwatch time for departure. Will vary if the individual rider's start time is modified.",
        horaimportadoTooltip: "Time of day from the imported Excel file",
        cronoimportadoTooltip: "Stopwatch time from the imported Excel file",
        cronosegundosTooltip: "Departure Time in seconds (for internal calculations)",
        horasegundosTooltip: "Departure Hour in seconds (for internal calculations)",
        horarealsegundosTooltip: "Real Departure Hour in seconds (for internal calculations)",

        addRiderTitle: 'Add Rider',
        selectPosition: 'Select position:',
        positionEnd: 'At the end of the list',
        positionBeginning: 'At the beginning of the list',
        positionSpecific: 'At a specific position...',
        specificPosition: 'Position:',
        positionInfo: 'Riders from this position will be shifted down.',
        riderPreview: 'New Rider',
        positionLabel: 'Position:',
        timeLabel: 'Start time:',
        addRiderButton: 'Add Rider',
        firstRiderCreated: 'First rider created successfully',
        riderAddedAtPosition: 'Rider added at position {position}',
        invalidValue: 'Invalid value',
        confirmChange: 'Yes, update all',
        cancelChange: 'Cancel',
        timeChangeTitle: 'Change start time',
        timeChangeWarning: 'Are you sure you want to update all start times?',
        timeChangeCancelled: 'Change cancelled',
        allTimesUpdated: 'All start times updated',

        positionSection: 'Rider Position',
        riderDataSection: 'Rider Data',
        dorsalLabel: 'Bib:',
        dorsalPlaceholder: 'Bib',
        dorsalRequired: 'Bib number is required',
        chipLabel: 'Chip:',
        chipPlaceholder: 'Chip number',
        nameLabel: 'Name:',
        namePlaceholder: 'Rider name',
        surnameLabel: 'Surname:',
        surnamePlaceholder: 'Rider surname',
        previewSection: 'Preview',
        confirmAddRider: 'Confirm and Add',
        riderAddedDetails: 'Rider #{dorsal} ({name}) added at position {position} at {time}',

        importWarningTitle: 'Attention!',
        importWarning: 'Current data will be erased',
        importWarningDetails: 'You currently have',
        importWarningRiders: 'riders in the table',
        importWarningQuestion: 'Are you sure you want to proceed with the import?',
        currentDataPreview: 'Preview of current data',
        moreRiders: 'more riders...',
        confirmImport: 'Yes, import and replace',
        cancelImport: 'Cancel',
        importCancelled: 'Import cancelled',
        ridersWillBeDeleted: 'riders will be deleted',
        importProceedWarning: 'All current data will be replaced by the Excel file data',  

        deleteOrderTitle:"Delete Start Order",
        confirmDeleteOrder:"Are you sure you want to delete ALL the start order?",
        deleteWarning:"This action cannot be undone.",
        confirmDelete:"Yes, delete all",
        deleteCancelled:"Deletion cancelled",
        moreRiders:"more riders...",

        startOrder:"START ORDER",
        location:"Location",
        date:"Date",
        totalRiders:"Total Riders",
        firstDeparture:"First Rider Start",
        lastDeparture:"Last Rider Start",
        position:"POS",
        bibNumber:"BIB",
        name:"NAME",
        surname:"SURNAME",
        startTime:"START TIME",
        time:"TIME",
        page:"Page",
        of:"of",

        diferenciaHeader: "Gap",
    },

    fr: {
        appTitle: "Crono CRI - under construction",
        languagesLabel: "Langue / Language",
        
        // Tarjetas
        cardRaceTitle: "Gestion de Course",
        cardTimeTitle: "Configuration du Temps",
        cardDeparturesTitle: "Départs Enregistrés",
        audioConfigTitle: "Configuration Audio",
        cardStartOrderTitle: "Ordre de Départ",
        
        // Botones de carrera
        newRaceText: "Nouvelle",
        deleteRaceText: "Supprimer",
        deleteRaceConfirmBtn: "Supprimer",
        deleteRaceCancelBtn:'Cancel',
        
        modeSalidaText: "DÉPARTS",         // Francés
        modeLlegadasText: "ARRIVÉES",      // Francés

        // Configuración de audio
        beepOptionTitle: "Sons Beep",
        voiceOptionTitle: "Voix enregistrée",
        muteOptionTitle: "Sans son",
        testAudioText: "Tester le son actuel",
        
        // Configuración de tiempo
        intervalTimeLabel: "Temps entre départs",
        minutesText: "minutes",
        secondsText: "secondes",
        
        // Posición inicial
        startFromXText: "Position actuelle:",
        startCountdownText: "DÉMARRER LE COMPTE À REBOURS",
        exitCompleteText: "RÉINITIALISER",
        
        // Lista de salidas
        clearDeparturesText: "Effacer la liste",
        exportExcelText: "Exporter Excel",
        noDeparturesText: "Aucun départ enregistré",
        departureHeaderDorsal: "Départ",
        departureHeaderTime: "Temps",
        departureHeaderNotes: "Note",
        departureHeaderDate: "Heure",
        
        // Footer
        helpText: "Aide",
        suggestionsText: "Suggestions",
        installText: "Installer App",
        updateText: "Rechercher mises à jour",
        copyrightText: "2025 © Copyright ",
        copyrightLink: "Roberto Benet - rbenet71@gmail.com - V_18_12_2025",
        
        // Modal de ayuda
        helpModalTitle: "Aide de Crono CRI",
        helpModalText1: "Crono CRI est une application pour contrôler les départs de courses avec compte à rebours visuel et sonore.",
        helpModalSubtitle1: "Comment utiliser:",
        helpModalList: `<li><strong>Sélectionnez une course</strong> ou créez-en une nouvelle</li>
                        <li><strong>Configurez la cadence de départ</strong> (toujours égale ou par tronçons)</li>
                        <li><strong>Commencez depuis le coureur 1</strong> ou depuis une position spécifique</li>
                        <li><strong>Appuyez sur \"DÉMARRER LE COMPTE À REBOURS\"</strong> pour commencer</li>
                        <li><strong>L'écran changera</strong> affichant le grand compte à rebours</li>
                        <li><strong>Quand il atteint zéro</strong> il affichera \"DÉPART\" et commencera le compte pour le suivant</li>`,
        helpModalSubtitle2: "Indicateurs visuels:",
        redBackgroundText: "Fond ROUGE:",
        countdownNormalDesc: "Compte à rebours normal",
        yellowBackgroundText: "Fond JAUNE:",
        countdownWarningDesc: "Dernières 10 secondes",
        greenBackgroundText: "Fond VERT:",
        countdownSalidaDesc: "Moment du départ (2 secondes)",
        redNumbersText: "Nombres ROUGES pulsants:",
        countdownCriticalDesc: "Dernières 5 secondes",
        helpModalSubtitle3: "Sons:",
        beepHighText: "Bip aigu:",
        beepHighDesc: "En atteignant 10 secondes",
        beepEverySecondText: "Bip chaque seconde:",
        beepEverySecondDesc: "Dernières 5 secondes",
        beepLowText: "Bip grave:",
        beepLowDesc: "En atteignant zéro",
        helpModalText2: "Les 2 secondes de \"DÉPART\" sont automatiquement soustraites du temps du prochain compte à rebours.",
        
        // Modal nueva carrera
        newRaceModalTitle: "Nouvelle course",
        newRaceNameLabel: "Nom de la course:",
        newRaceDescLabel: "Description (optionnel):",
        
        // Modal eliminar carrera
        deleteRaceModalTitle: "Confirmer la suppression",
        deleteRaceModalText: "Êtes-vous sûr de vouloir supprimer cette course? Toutes les données seront perdues.",
        
        // Modal limpiar salidas
        clearDeparturesModalTitle: "Confirmer le nettoyage",
        clearDeparturesModalText: "Êtes-vous sûr de vouloir effacer la liste des départs? Cette action ne peut pas être annulée.",
        
        // Modal sugerencias
        suggestionsModalTitle: "Envoyer des suggestions",
        suggestionEmailLabel: "Email (optionnel):",
        suggestionTextLabel: "Suggestions:",
        
        // Modal reiniciar
        restartModalTitle: "Confirmer la réinitialisation complète",
        restartModalText: "Êtes-vous sûr de vouloir réinitialiser complètement? Cette action:",
        
        // Mensajes
        raceCreated: "Course créée avec succès",
        raceDeleted: "Course supprimée",
        departuresCleared: "Liste des départs effacée",
        excelExported: "Données exportées vers Excel",
        sessionRestarted: "Session complètement réinitialisée",
        countdownStarted: "Compte à rebours démarré",
        countdownStopped: "Compte à rebours arrêté",
        updateChecked: "Recherche de mises à jour...",
        adjustmentsSaved: "Ajustements enregistrés. Prochain coureur ({corredor}) partira dans {seconds} secondes",
        timeUpdated: "Temps mis à jour. Prochain coureur ({corredor}) partira dans {seconds} secondes",
        enterValidTime: "Entrez un temps valide",
        selectRaceFirst: "Sélectionnez d'abord une course",
        enterRaceName: "Entrez un nom pour la course",
        listAlreadyEmpty: "La liste est déjà vide",
        noDataToExport: "Aucune donnée à exporter",
        waitCountdownEnd: "Attendez que le compte à rebours actuel se termine",
        countdownNotActive: "Le compte à rebours n'est pas actif",
        invalidValues: "Valeurs invalides",
        importError: "Erreur lors de l'importation du fichier",
        
        // Pantalla de ejecución
        salidaText: "DÉPART",
        totalTimeLabel: "Temps total",
        nextCorredorLabel: "Prochain départ à",
        departedLabel: "Partis",
        
        // Orden de salida (CAMELCASE)
        timeConfigLabel: "Configuration des Horaires",
        firstStartLabel: "Départ Premier:",
        currentTimeLabel: "Heure:",
        timeDiffLabel: "compte à rebours:",
        totalRidersLabel: "Total Coureurs:",
        actionsLabel: "Actions",
        orderTableLabel: "Ordre de Départ",
        createTemplateText: "Créer Modèle",
        importOrderText: "Importer Ordre",
        deleteOrderText: "Supprimer Ordre",
        exportOrderText: "Exporter Excel",
        addRiderText: "Ajouter Coureur",
        noStartOrderText: "Aucun coureur dans l'ordre de départ",
        
        // Headers de tabla orden de salida (CAMELCASE)
        orderHeader: "Ordre",
        dorsalHeader: "Dossard",
        cronoSalidaHeader: "Chrono Départ",
        horaSalidaHeader: "Heure Départ",
        nombreHeader: "Prénom",
        apellidosHeader: "Nom",
        chipHeader: "Puce",
        horaRealHeader: "Heure Départ Réel",
        cronoRealHeader: "Chrono Départ Réel",
        horaPrevistaHeader: "Heure Prévue",
        cronoPrevistaHeader: "Chrono Prévu",
        horaImportadoHeader: "Heure Importée",
        cronoImportadoHeader: "Chrono Importé",
        cronoSegundosHeader: "Chrono Secondes",
        horaSegundosHeader: "Heure Secondes",
        
        // Mensajes orden de salida
        templateCreated: "Modèle Excel créé avec succès",
        orderImported: "Ordre de départ importé avec succès ({count} coureurs)",
        orderDeleted: "Ordre de départ supprimé",
        orderExported: "Ordre de départ exporté vers Excel",
        riderAdded: "Coureur ajouté à l'ordre de départ",
        riderDeleted: "Coureur supprimé",
        enterValidTimeOrder: "Entrez une heure valide",
        selectOrderFirst: "Sélectionnez d'abord un ordre de départ",
        dataSaved: "Données enregistrées avec succès",
        confirmDeleteOrder: "Êtes-vous sûr de supprimer l'ordre de départ?",
        
        // Mensajes de error/success
        success: "Succès!",
        error: "Erreur",
        warning: "Avertissement",
        info: "Information",

        // Para los botones de acción:
        understood: "Compris",
        saveButtonText: "Enregistrer",
        cancelButtonText: "Annuler",
        clear: "Effacer",
        deleteConfirm: "Supprimer",
        sendSuggestion: "Envoyer",
        createRace: "Créer course",
        restartConfirm: "Oui, réinitialiser complètement",
        cancel: "Annuler",

        // Para las notas de salidas:
        departurePlaceholder: "Écrire une note...",

        // Para etiquetas de cuenta atrás:
        countdownlabel: "Départ dans",
        currentPositionText: "Position actuelle:",
        startTimeUpdated: "Heure de départ mise à jour et enregistrée",
        
        // ============================================
        // NOUVELLES TRADUCTIONS POUR LE SELECTEUR DE MODE
        // ============================================
        modeSelectorTitle: "Mode d'Opération",
        modeSalidaDesc: "Contrôle des départs avec compte à rebours",
        modeLlegadasTitle: "Mode Arrivée",
        modeLlegadasDesc: "Contrôle des temps d'arrivée",
        modeChanged: "Passé en mode {mode}",
        
        // ============================================
        // NOUVELLES TRADUCTIONS POUR LE MODE ARRIVÉES
        // ============================================
        llegadasTimerTitle: "Chronomètre d'Arrivées",
        llegadasTimerLabel: "Temps depuis le départ du premier coureur :",
        startLlegadasText: "Démarrer Chronomètre",
        stopLlegadasText: "Arrêter",
        registerLlegadaText: "Enregistrer Arrivée",
        importLlegadasText: "Importer Départs",
        llegadasListTitle: "Arrivées Enregistrées",
        clearLlegadasText: "Effacer les arrivées",
        exportLlegadasText: "Exporter Excel",
        showRankingText: "Voir Classement",
        noLlegadasText: "Aucune arrivée enregistrée",
        
        // ============================================
        // TRADUCTIONS POUR L'ENREGISTREMENT DES ARRIVÉES
        // ============================================
        registerLlegadaModalTitle: "Enregistrer Arrivée",
        llegadaDorsalLabel: "Dossard du coureur :",
        llegadaHoraLabel: "Heure d'arrivée :",
        llegadaNotasLabel: "Notes (optionnel) :",
        confirmLlegadaBtn: "Enregistrer Arrivée",
        cancelLlegadaBtn: "Annuler",
        quickRegisterTitle: "Enregistrement rapide d'arrivée",
        
        // ============================================
        // TRADUCTIONS POUR L'IMPORTATION DES DÉPARTS
        // ============================================
        importSalidasModalTitle: "Importer Données de Départs",
        importSalidasModalText: "Sélectionnez le fichier Excel avec les données de départ des coureurs.",
        confirmImportSalidasBtn: "Importer",
        cancelImportSalidasBtn: "Annuler",
        importPreviewTitle: "Aperçu des données :",
        importSuccess: "Données de départ importées avec succès ({count} coureurs)",
        importError: "Erreur lors de l'importation des données",
        startTimerFirst: "D'abord démarrez le chronomètre d'arrivées",
        noDataImported: "Impossible d'importer les données de départ",
        
        // ============================================
        // TRADUCTIONS POUR LE CLASSEMENT
        // ============================================
        rankingModalTitle: "Classement de la Course",
        noRankingText: "Pas assez de données pour générer le classement",
        rankingPos: "Pos",
        rankingDorsal: "Dossard",
        rankingNombre: "Nom",
        rankingTiempo: "Temps Chrono",
        rankingDiferencia: "Écart",
        exportRankingBtn: "Exporter Classement",
        closeRankingBtn: "Fermer",
        
        // ============================================
        // TRADUCTIONS POUR LES EN-TÊTES DE TABLEAU (ARRIVÉES)
        // ============================================
        llegadaHeaderDorsal: "Dossard",
        llegadaHeaderNombre: "Nom",
        llegadaHeaderSalida: "Heure Départ",
        llegadaHeaderLlegada: "Heure Arrivée",
        llegadaHeaderCrono: "Temps Chrono",
        llegadaHeaderNotas: "Notes",
        
        // ============================================
        // TRADUCTIONS POUR LA CONFIGURATION AUDIO
        // ============================================
        audioConfigTitle: "Configuration Audio pour les Départs",
        beepOptionTitle: "Sons Beep",
        voiceOptionTitle: "Voix enregistrée",
        muteOptionTitle: "Sans son",
        testAudioText: "Tester le son actuel",
        
        // ============================================
        // TRADUCTIONS POUR LA CONFIGURATION DU TEMPS
        // ============================================
        cardTimeTitle: "Configuration du Temps pour les Départs",
        
        // ============================================
        // TRADUCTIONS POUR LES MESSAGES D'ÉTAT (ARRIVÉES)
        // ============================================
        llegadaRegistered: "Arrivée enregistrée pour le dossard {dorsal}",
        llegadaAlreadyExists: "Arrivée déjà enregistrée pour le dossard {dorsal}",
        llegadasCleared: "Liste des arrivées effacée",
        timerStarted: "Chronomètre d'arrivées démarré",
        timerStopped: "Chronomètre arrêté",
        rankingGenerated: "Classement généré avec {count} coureurs",
        llegadasExported: "Arrivées exportées vers Excel",
        rankingExported: "Classement exportée vers Excel",
        
        // ============================================
        // TRADUCTIONS POUR LES VALIDATIONS
        // ============================================
        enterDorsal: "Entrez un numéro de dossard valide",
        invalidDorsal: "Dossard non valide",
        noStartTimeData: "Pas de données d'heure de départ pour ce dossard",
        confirmClearLlegadas: "Êtes-vous sûr de vouloir effacer toutes les arrivées enregistrées?",
        selectFileFirst: "Sélectionnez d'abord un fichier",
        
        // ============================================
        // EXPORTA EXCEL
        // ============================================

        templateCreatedCustom: "Modèle créé avec {count} coureurs, intervalle {interval}, début {startTime}",
        enterValidRiders: "Veuillez entrer un nombre valide de coureurs (1-1000)",
        enterValidInterval: "Veuillez entrer un intervalle valide (HH:MM:SS)",
        enterValidStartTime: "Veuillez entrer une heure de début valide (HH:MM:SS)",
        configTemplateTitle: "Configurer le Modèle de Départ",
        numRidersLabel: "Nombre de coureurs :",
        intervalLabel: "Intervalle entre les départs (HH:MM:SS) :",
        startTimeLabel: "Heure de début (HH:MM:SS) :",
        intervalExample: "Ex : 00:01:00 pour 1 minute, 00:02:30 pour 2 minutes et 30 secondes",
        startTimeExample: "Ex : 09:00:00 pour 9 heures du matin",

        cardRaceTitle: "Gestion de Course",
        modeSelectorTitle: "Mode d'Opération",
        cardStartOrderTitle: "Ordre de Départ",
        modeSalidaTitle: "Départs",  // Para francés
        modeLlegadasTitle: "Arrivées", // Para francés

        timeChangeTitle: "Changer l'heure de départ",
        timeChangeWarning: "Êtes-vous sûr ? Cela mettra à jour toutes les heures de départ dans le tableau.",
        timeChangeRiders: "Coureurs affectés:",
        timeChangeFirst: "Premier coureur:",
        confirmChange: "Oui, tout mettre à jour",
        cancelChange: "Annuler",
        onlyFirst: "Seulement le premier",
        allTimesUpdated: "Toutes les heures de départ mises à jour",
        timeChangeCancelled: "Changement annulé",
        onlyFirstUpdated: "Seul le premier coureur a été mis à jour",

        // Botones de copia de seguridad en gestión de carrera
        backupRaceText: "Sauvegarde",
        restoreRaceText: "Restaurer",
        
        // Mensajes específicos de copia por carrera
        backupRaceSuccess: "Sauvegarde de la course créée avec succès",
        restoreRaceSuccess: "Course restaurée avec succès",
        noRaceSelectedForBackup: "Sélectionnez d'abord une course pour faire la sauvegarde",
        backupRaceContains: "La sauvegarde contient: {departures} départs, {order} en ordre, {llegadas} arrivées",
        restoreOptionsTitle: "Options de restauration",
        whatToRestore: "Quelles données restaurer?",
        restoreDepartures: "Données des départs",
        restoreStartOrder: "Ordre de départ",
        restoreLlegadas: "Données d'arrivées",
        restoreConfig: "Configuration",
        restoreOptionReplace: "Remplacer la course existante",
        restoreOptionRename: "Créer comme nouvelle course",
        raceAlreadyExists: "Une course avec ce nom existe déjà",
        restoringToNewRace: "Sera créée comme nouvelle course",
        restoringToExisting: "Remplacera la course existante",

        // Modal nueva carrera - campos extendidos
        newRaceDateLabel: "Date de la course:",
        newRaceCategoryLabel: "Catégorie:",
        newRaceOrganizerLabel: "Organisateur/Club:",
        newRaceLocationLabel: "Lieu:",
        newRaceModalityLabel: "Modalité de course:",
        newRaceOtherModalityLabel: "Préciser la modalité:",
        newRaceDescriptionLabel: "Description/Notes:",

        // Opciones de categoría
        categorySelect: "-- Sélectionnez une catégorie --",
        categoryElite: "Élite",
        categoryMaster: "Master",
        categoryJunior: "Junior",
        categoryCadete: "Cadet",
        categoryInfantil: "Jeune",
        categoryFemenino: "Féminin",
        categoryMixto: "Mixte",
        categoryAficionado: "Amateur",
        categoryOtro: "Autre",

        // Modalidades
        modalityCri: "CRI (Contre-la-montre Individuel)",
        modalityCre: "CRE (Contre-la-montre par Équipes)",
        modalityDescenso: "Descente (Downhill)",
        modalityOtras: "Autres modalités",
        modalityOtherPlaceholder: "Ex: Marathon, Enduro, XCO...",

        // Secciones del formulario
        formSectionBasic: "Informations de base",
        formSectionOrganization: "Organisation",
        formSectionModality: "Modalité de course",
        formSectionAdditional: "Informations supplémentaires",

        // Mensajes de validación
        requiredField: "Champ obligatoire",
        enterValidDate: "Entrez une date valide",

        editRaceText: "Modifier",
        editRaceTitle: "Modifier la course",
        saveChanges: "Enregistrer les modifications",
        raceUpdated: "Course mise à jour avec succès",

        backupCreated: "Sauvegarde enregistrée sous {filename}",
        creatingBackup: "Création de la sauvegarde...",
        noRaceSelected: "Sélectionnez d'abord une course",

        creatingPDF: "Génération du PDF...",
        exportPDF: "Exporter PDF",
        pdfGenerated: "PDF généré: {filename} - {count} coureurs",
        
        // Backup/restore
        backupCreated: "Sauvegarde enregistrée sous {filename}",
        creatingBackup: "Création de la sauvegarde...",
        noRaceSelected: "Sélectionnez d'abord une course",
        restoreTitle: "Restaurer la course depuis la sauvegarde",
        restoreWarning: "Cette action remplacera les données actuelles de la course",
        restoreSuccess: "Course restaurée avec succès",
        restoreError: "Erreur lors de la restauration de la course",
        confirmRestore: "Confirmer la restauration?",
        cancel: "Annuler",
        
        // Race management
        enterRaceName: "Entrez un nom pour la course",
        enterValidDate: "Entrez une date valide",
        raceCreated: "Course créée avec succès",
        raceUpdated: "Course mise à jour avec succès",
        raceDeleted: "Course supprimée avec succès",
        selectRaceFirst: "Sélectionnez d'abord une course",
        departuresCleared: "Départs réinitialisés avec succès",
        sessionRestarted: "Session complètement redémarrée",
        
        // Start order
        listAlreadyEmpty: "La liste est déjà vide",
        confirmDeleteOrder: "Supprimer TOUT l'ordre de départ? Cette action ne peut pas être annulée.",
        orderDeleted: "Ordre de départ supprimé",
        riderAdded: "Coureur ajouté",
        
        // Modals
        editRaceTitle: "Modifier la course",
        saveChanges: "Enregistrer les modifications",
        createRace: "Créer une course",
        newRaceModalTitle: "Nouvelle course",
        
        // Suggestions
        suggestionTextLabel: "Entrez votre suggestion",
        suggestionSent: "Suggestion envoyée",
        
        // Time management
        timeChangeCancelled: "Changement d'heure annulé",
        
        // Update notification
        updateAvailable: "Nouvelle version disponible",      

        creatingPDF: 'Génération du PDF de l\'ordre de départ...',
        pdfGenerated: 'PDF généré: {filename} ({count} coureurs)',
        pdfError: 'Erreur lors de la génération du PDF',
        pdfLibraryMissing: 'La bibliothèque PDF n\'est pas chargée',
        noStartOrderData: 'Aucune donnée d\'ordre de départ pour générer le PDF',

        pdfOrderOfStart: "ORDRE DE SORTIDA",
        position: "POS",
        number: "DORSAL",
        name: "NOM",
        surname: "COGNOMS",
        startTime: "HORA SORTIDA",
        crono: "CRONO",
        riders: "Corredors",
        start: "Inici",
        final: "Final",
        generated: "Generat",
        page: "Pàgina",
        of: "de",
        pdfGenerated: "PDF generat",
        pdfError: "Error generant PDF",

        // Para francés (fr):
        pdfOrderOfStart: "ORDRE DE DÉPART",
        position: "POS",
        number: "DOSSARD",
        name: "NOM",
        surname: "PRÉNOM",
        startTime: "HEURE DÉPART",
        crono: "CHRONO",
        riders: "Coureurs",
        start: "Début",
        final: "Fin",
        generated: "Généré",
        page: "Page",
        of: "de",
        pdfGenerated: "PDF généré",
        pdfError: "Erreur génération PDF",
        cronoRealSegundosHeader: "Crono Départ Réel Secondes",
        horaRealSegundosHeader: "Heure Départ Réel Secondes",

        // Tooltips para columnas de orden de salida
        orderTooltip: "Position à laquelle le coureur partira",
        dorsalTooltip: "Numéro de dossard du coureur",
        cronosalidaTooltip: "Temps du chronomètre auquel le coureur partira. Le programme utilise cette valeur pour donner les départs.",
        horasalidaTooltip: "Heure de départ prévue, c'est une information uniquement, non utilisée pour contrôler les départs.",
        nombreTooltip: "Prénom du coureur",
        apellidosTooltip: "Nom du coureur",
        chipTooltip: "Numéro de puce du coureur",
        horarealTooltip: "Heure réelle du jour à laquelle le coureur est parti",
        cronorealTooltip: "Temps réel du chronomètre auquel le coureur est parti",
        horaprevistaTooltip: "Heure prévue du jour pour le départ. Variera si l'heure de départ individuelle du coureur est modifiée.",
        cronoprevistaTooltip: "Temps prévu du chronomètre pour le départ. Variera si l'heure de départ individuelle du coureur est modifiée.",
        horaimportadoTooltip: "Heure du jour provenant du fichier Excel importé",
        cronoimportadoTooltip: "Temps du chronomètre provenant du fichier Excel importé",
        cronosegundosTooltip: "Temps de départ en secondes (pour calculs internes)",
        horasegundosTooltip: "Heure de départ en secondes (pour calculs internes)",
        horarealsegundosTooltip: "Heure réelle de départ en secondes (pour calculs internes)",

        addRiderTitle: 'Ajouter un coureur',
        selectPosition: 'Sélectionner la position:',
        positionEnd: 'À la fin de la liste',
        positionBeginning: 'Au début de la liste',
        positionSpecific: 'À une position spécifique...',
        specificPosition: 'Position:',
        positionInfo: 'Les coureurs à partir de cette position seront déplacés vers le bas.',
        riderPreview: 'Nouveau coureur',
        positionLabel: 'Position:',
        timeLabel: 'Heure de départ:',
        addRiderButton: 'Ajouter le coureur',
        firstRiderCreated: 'Premier coureur créé avec succès',
        riderAddedAtPosition: 'Coureur ajouté à la position {position}',
        invalidValue: 'Valeur invalide',
        confirmChange: 'Oui, tout mettre à jour',
        cancelChange: 'Annuler',
        timeChangeTitle: 'Changer l\'heure de début',
        timeChangeWarning: 'Êtes-vous sûr de vouloir mettre à jour toutes les heures de départ?',
        timeChangeCancelled: 'Changement annulé',
        allTimesUpdated: 'Toutes les heures de départ mises à jour',
        enterValidTime: 'Format d\'heure invalide. Utilisez HH:MM ou HH:MM:SS',
        timeChangeTitle: 'Changer l\'heure de début',
        timeChangeWarning: 'Êtes-vous sûr de vouloir mettre à jour toutes les heures de départ?',
        timeChangeCancelled: 'Changement annulé',
        allTimesUpdated: 'Toutes les heures de départ mises à jour',

        positionSection: 'Position du coureur',
        riderDataSection: 'Données du coureur',
        dorsalLabel: 'Dossard:',
        dorsalPlaceholder: 'Numéro de dossard',
        dorsalRequired: 'Le dossard est obligatoire',
        chipLabel: 'Puce:',
        chipPlaceholder: 'Numéro de puce',
        nameLabel: 'Nom:',
        namePlaceholder: 'Nom du coureur',
        surnameLabel: 'Prénom:',
        surnamePlaceholder: 'Prénom du coureur',
        previewSection: 'Aperçu',
        confirmAddRider: 'Confirmer et ajouter',
        riderAddedDetails: 'Coureur #{dorsal} ({name}) ajouté à la position {position} à {time}',
        importWarningTitle: 'Attention!',
        importWarning: 'Les données actuelles seront effacées',
        importWarningDetails: 'Vous avez actuellement',
        importWarningRiders: 'coureurs dans le tableau',
        importWarningQuestion: 'Êtes-vous sûr de vouloir procéder à l\'importation?',
        currentDataPreview: 'Aperçu des données actuelles',
        moreRiders: 'plus de coureurs...',
        confirmImport: 'Oui, importer et remplacer',
        cancelImport: 'Annuler',
        importCancelled: 'Importation annulée',
        ridersWillBeDeleted: 'coureurs seront supprimés',
        importProceedWarning: 'Toutes les données actuelles seront remplacées par les données du fichier Excel',    

        deleteOrderTitle:"Supprimer l'Ordre de Départ",
        confirmDeleteOrder:"Êtes-vous sûr de vouloir supprimer TOUT l'ordre de départ?",
        deleteWarning:"Cette action ne peut pas être annulée.",
        confirmDelete:"Oui, tout supprimer",
        deleteCancelled:"Suppression annulée",
        moreRiders:"plus de coureurs...",
        
        startOrder:"ORDRE DE DÉPART",
        location:"Lieu",
        date:"Date",
        totalRiders:"Total Coureurs",
        firstDeparture:"Départ Premier Coureur",
        lastDeparture:"Départ Dernier Coureur",
        position:"POS",
        bibNumber:"DORSAL",
        name:"NOM",
        surname:"PRÉNOMS",
        startTime:"HEURE DE DÉPART",
        time:"CRONO",
        page:"Page",
        of:"de",
        diferenciaHeader:"Diferencia"

    }
};

// ===========================================
// FUNCIÓN UNIFICADA DE ACTUALIZACIÓN DE IDIOMA
// ===========================================
function updateLanguageUI() {
    const lang = appState.currentLanguage;
    const t = translations[lang];
    
    console.log(`Actualizando UI al idioma: ${lang}`);
    
    // 1. Actualizar banderas activas
    document.querySelectorAll('.flag').forEach(flag => {
        flag.classList.remove('active');
    });
    const activeFlag = document.getElementById(`flag-${lang}`);
    if (activeFlag) {
        activeFlag.classList.add('active');
    }
    
    // 2. Actualizar título principal
    updateAppTitle(t);
    
    // 3. Actualizar tarjetas principales
    updateRaceManagementCard(t);
    updateStartOrderCard(t);
    updateModeContent(t);
    
    // 4. Actualizar pies de página
    updateFooter(t);
    
    // 5. Actualizar textos en la pantalla de cuenta atrás
    updateSalidaText();
    
    // 6. Actualizar textos de modales
    updateModalTexts(t);
    
    // 7. Actualizar títulos de tablas
    updateTableHeaders(t);
    
    // 8. Actualizar tooltips de tablas (NUEVO)
    updateTableTooltips();
    
    // 9. Actualizar botones y elementos específicos
    updateButtonsAndSpecificElements(t);
    
    // 10. Forzar actualización de títulos de tarjetas
    updateCardTitles();
    
    console.log("UI completamente actualizada al idioma:", lang);
}
// ===========================================
// FUNCIONES AUXILIARES PARA ACTUALIZACIÓN
// ===========================================
function updateAppTitle(t) {
    const appTitle = document.getElementById('app-title-text');
    const languagesLabel = document.getElementById('languages-label');
    
    if (appTitle) appTitle.textContent = t.appTitle;
    if (languagesLabel) languagesLabel.textContent = t.languagesLabel;
}

function updateRaceManagementCard(t) {
    const elements = {
        'card-race-title': t.cardRaceTitle,
        'new-race-text': t.newRaceText,
        'edit-race-text': t.editRaceText || 'Editar',
        'delete-race-text': t.deleteRaceText,
        'backup-race-text': t.backupRaceText || 'Copia Seguridad',
        'restore-race-text': t.restoreRaceText || 'Restaurar'
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = elements[id];
    });
}

function updateStartOrderCard(t) {
    const elements = {
        'card-start-order-title': t.cardStartOrderTitle,
        'first-start-label': t.firstStartLabel,
        'current-time-label': t.currentTimeLabel,
        'time-diff-label': t.timeDiffLabel,
        'total-riders-label': t.totalRidersLabel,
        'create-template-text': t.createTemplateText,
        'import-order-text': t.importOrderText,
        'delete-order-text': t.deleteOrderText,
        'export-order-text': t.exportOrderText,
        'add-rider-text': t.addRiderText,
        'order-table-label': t.orderTableLabel,
        'no-start-order-text': t.noStartOrderText,
        'export-pdf-btn': t.exportPDF || 'Exportar PDF'
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'BUTTON' && element.querySelector('i')) {
                // Preservar el ícono si existe
                const icon = element.querySelector('i').cloneNode(true);
                element.textContent = '';
                element.appendChild(icon);
                element.appendChild(document.createTextNode(` ${elements[id]}`));
            } else {
                element.textContent = elements[id];
            }
        }
    });
}

function updateModeContent(t) {
    // Selector de modo
    setTextIfExists('mode-selector-title', t.modeSelectorTitle);
    setTextIfExists('mode-salida-text', t.modeSalidaText);
    setTextIfExists('mode-llegadas-text', t.modeLlegadasText);
    
    // Contenido salidas
    setTextIfExists('card-time-title', t.cardTimeTitle);
    setTextIfExists('interval-time-label', t.intervalTimeLabel);
    setTextIfExists('minutes-text', t.minutesText);
    setTextIfExists('seconds-text', t.secondsText);
    setTextIfExists('audio-config-title', t.audioConfigTitle);
    setTextIfExists('beep-option-title', t.beepOptionTitle);
    setTextIfExists('voice-option-title', t.voiceOptionTitle);
    setTextIfExists('mute-option-title', t.muteOptionTitle);
    setTextIfExists('test-audio-text', t.testAudioText);
    setTextIfExists('start-countdown-text', t.startCountdownText);
    setTextIfExists('start-from-x-text', t.startFromXText);
    setTextIfExists('exit-complete-text', t.exitCompleteText);
    setTextIfExists('card-departures-title', t.cardDeparturesTitle);
    setTextIfExists('clear-departures-text', t.clearDeparturesText);
    setTextIfExists('export-excel-text', t.exportExcelText);
    setTextIfExists('no-departures-text', t.noDeparturesText);
    
    // Contenido llegadas
    setTextIfExists('llegadas-timer-title', t.llegadasTimerTitle);
    setTextIfExists('llegadas-timer-label', t.llegadasTimerLabel);
    setTextIfExists('start-llegadas-text', t.startLlegadasText);
    setTextIfExists('stop-llegadas-text', t.stopLlegadasText);
    setTextIfExists('register-llegada-text', t.registerLlegadaText);
    setTextIfExists('import-llegadas-text', t.importLlegadasText);
    setTextIfExists('llegadas-list-title', t.llegadasListTitle);
    setTextIfExists('clear-llegadas-text', t.clearLlegadasText);
    setTextIfExists('export-llegadas-text', t.exportLlegadasText);
    setTextIfExists('show-ranking-text', t.showRankingText);
    setTextIfExists('no-llegadas-text', t.noLlegadasText);
}

function updateFooter(t) {
    setTextIfExists('help-text', t.helpText);
    setTextIfExists('suggestions-text', t.suggestionsText);
    setTextIfExists('install-text', t.installText);
    setTextIfExists('update-text', t.updateText);
    setTextIfExists('copyright-text', t.copyrightText);
    setTextIfExists('copyright-link', t.copyrightLink);
}

function updateSalidaText() {
    const t = translations[appState.currentLanguage];
    const salidaDisplay = document.getElementById('salida-display');
    if (salidaDisplay) {
        salidaDisplay.textContent = t.salidaText;
    }
}

function updateModalTexts(t) {
    // Función auxiliar reutilizable
    function setTextIfExists(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = text;
    }
    
    function setPlaceholderIfExists(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) element.placeholder = text;
    }
    
    function setHTMLIfExists(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) element.innerHTML = html;
    }
    
    // Modal de ayuda
    setTextIfExists('help-modal-title', t.helpModalTitle);
    setTextIfExists('help-modal-text1', t.helpModalText1);
    setTextIfExists('help-modal-subtitle1', t.helpModalSubtitle1);
    setHTMLIfExists('help-modal-list', t.helpModalList);
    setTextIfExists('help-modal-subtitle2', t.helpModalSubtitle2);
    setTextIfExists('help-modal-subtitle3', t.helpModalSubtitle3);
    setTextIfExists('help-modal-text2', t.helpModalText2);
    setTextIfExists('help-modal-ok', t.understood || 'Entendido');
    
    // Modal nueva carrera
    setTextIfExists('new-race-modal-title', t.newRaceModalTitle);
    setTextIfExists('new-race-name-label', t.newRaceNameLabel);
    setPlaceholderIfExists('new-race-name', t.enterRaceName);
    setTextIfExists('new-race-date-label', t.newRaceDateLabel);
    setTextIfExists('new-race-category-label', t.newRaceCategoryLabel);
    setTextIfExists('new-race-organizer-label', t.newRaceOrganizerLabel);
    setTextIfExists('new-race-location-label', t.newRaceLocationLabel);
    setTextIfExists('new-race-modality-label', t.newRaceModalityLabel);
    setTextIfExists('new-race-description-label', t.newRaceDescriptionLabel);
    setTextIfExists('create-race-btn', t.createRace);
    setTextIfExists('cancel-create-race-btn', t.cancel);
    
    // Modal eliminar carrera
    setTextIfExists('delete-race-modal-title', t.deleteRaceModalTitle);
    setTextIfExists('delete-race-modal-text', t.deleteRaceModalText);
    setTextIfExists('delete-race-confirm-btn', t.deleteConfirm);
    setTextIfExists('delete-race-cancel-btn', t.cancel);
    
    // Modal limpiar salidas
    setTextIfExists('clear-departures-modal-title', t.clearDeparturesModalTitle);
    setTextIfExists('clear-departures-modal-text', t.clearDeparturesModalText);
    setTextIfExists('clear-departures-confirm-btn', t.clear);
    setTextIfExists('clear-departures-cancel-btn', t.cancel);
    
    // Modal sugerencias
    setTextIfExists('suggestions-modal-title', t.suggestionsModalTitle);
    setTextIfExists('suggestion-email-label', t.suggestionEmailLabel);
    setTextIfExists('suggestion-text-label', t.suggestionTextLabel);
    setTextIfExists('send-suggestion-btn', t.sendSuggestion);
    setTextIfExists('cancel-suggestion-btn', t.cancel);
    
    // Modal reiniciar
    setTextIfExists('restart-modal-title', t.restartModalTitle);
    setTextIfExists('restart-modal-text', t.restartModalText);
    setTextIfExists('restart-confirm-btn', t.restartConfirm);
    setTextIfExists('restart-cancel-btn', t.cancel);
    
    // Modal llegadas
    setTextIfExists('register-llegada-modal-title', t.registerLlegadaModalTitle);
    setTextIfExists('llegada-dorsal-label', t.llegadaDorsalLabel);
    setTextIfExists('llegada-hora-label', t.llegadaHoraLabel);
    setTextIfExists('llegada-notas-label', t.llegadaNotasLabel);
    setTextIfExists('confirm-llegada-btn', t.confirmLlegadaBtn);
    setTextIfExists('cancel-llegada-btn', t.cancelLlegadaBtn);
    
    // Modal importación salidas
    setTextIfExists('import-salidas-modal-title', t.importSalidasModalTitle);
    setTextIfExists('import-salidas-modal-text', t.importSalidasModalText);
    setTextIfExists('import-preview-title', t.importPreviewTitle);
    setTextIfExists('confirm-import-salidas-btn', t.confirmImportSalidasBtn);
    setTextIfExists('cancel-import-salidas-btn', t.cancelImportSalidasBtn);
    
    // Modal clasificación
    setTextIfExists('ranking-modal-title', t.rankingModalTitle);
    setTextIfExists('no-ranking-text', t.noRankingText);
    setTextIfExists('export-ranking-btn', t.exportRankingBtn);
    setTextIfExists('close-ranking-btn', t.closeRankingBtn);
}

function updateTableHeaders(t) {
    console.log("=== ACTUALIZANDO CABECERAS DE TABLA ===");
    console.log("Idioma:", appState.currentLanguage);
    
    // Lista completa de IDs
    const headerIds = [
        'orderHeader', 'dorsalHeader', 'cronoSalidaHeader', 'horaSalidaHeader',
        'diferenciaHeader', 'nombreHeader', 'apellidosHeader', 'chipHeader',
        'horaRealHeader', 'cronoRealHeader', 'horaPrevistaHeader', 'cronoPrevistaHeader',
        'horaImportadoHeader', 'cronoImportadoHeader', 'cronoSegundosHeader',
        'horaSegundosHeader', 'cronoRealSegundosHeader', 'horaRealSegundosHeader'
    ];
    
    let updated = 0;
    headerIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const translation = t[id];
            if (translation) {
                element.textContent = translation;
                updated++;
            }
        }
    });
    
    console.log(`Cabeceras de tabla actualizadas: ${updated} de ${headerIds.length} columnas`);
    
    // También actualizar tooltips si existen
    if (typeof updateTableTooltips === 'function') {
        updateTableTooltips(t);
    }
}


function updateButtonsAndSpecificElements(t) {
    // Actualizar botones de acción generales
    setTextIfExists('save-button', t.saveButtonText);
    setTextIfExists('cancel-button', t.cancelButtonText);
    setTextIfExists('clear-button', t.clear);
    setTextIfExists('delete-button', t.deleteConfirm);
    
    // Actualizar textos específicos
    setTextIfExists('departure-placeholder', t.departurePlaceholder);
    setTextIfExists('countdown-label', t.countdownlabel);
    setTextIfExists('current-position-text', t.currentPositionText);
    setTextIfExists('total-time-label', t.totalTimeLabel);
    setTextIfExists('next-corredor-label', t.nextCorredorLabel);
    setTextIfExists('departed-label', t.departedLabel);
}

// Función auxiliar genérica
function setTextIfExists(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        // Para elementos de entrada, actualizar placeholder si es apropiado
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (!element.value || element.value === element.placeholder) {
                element.placeholder = text;
            }
        } else {
            element.textContent = text;
        }
    }
}

function updateTableTooltips() {
    const t = translations[appState.currentLanguage];
    
    // Mapeo de IDs de columnas a claves de traducción
    const tooltipMap = {
        'orderHeader': t.orderTooltip,
        'dorsalHeader': t.dorsalTooltip,
        'cronosalidaHeader': t.cronosalidaTooltip,
        'horasalidaHeader': t.horasalidaTooltip,
        'nombreHeader': t.nombreTooltip,
        'apellidosHeader': t.apellidosTooltip,
        'chipHeader': t.chipTooltip,
        'horarealHeader': t.horarealTooltip,
        'cronorealHeader': t.cronorealTooltip,
        'horaprevistaHeader': t.horaprevistaTooltip,
        'cronoprevistaHeader': t.cronoprevistaTooltip,
        'horaimportadoHeader': t.horaimportadoTooltip,
        'cronoimportadoHeader': t.cronoimportadoTooltip,
        'cronosegundosHeader': t.cronosegundosTooltip,
        'horasegundosHeader': t.horasegundosTooltip,
        'horarealsegundosHeader': t.horarealsegundosTooltip
    };
    
    Object.keys(tooltipMap).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltipMap[id];
        }
    });
    
    console.log("Tooltips de tabla actualizados");
}