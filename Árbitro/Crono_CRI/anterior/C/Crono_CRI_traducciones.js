
// ===========================================
// TRADUCCIONES MULTI-IDIOMA - COMPLETO Y CORREGIDO
// ===========================================
const translations = {
    es: {
        // Títulos generales
        appTitle: "Crono CRI",
        languagesLabel: "Idioma / Language",
        
        
        // Tarjetas
        cardRaceTitle: "Gestión de Carrera",
        cardTimeTitle: "Configuración de Tiempo",
        cardDeparturesTitle: "Salidas Registradas",
        audioConfigTitle: "Configuración de Audio",
        cardStartOrderTitle: "Orden de Salida",

        modeSalidaText: "SALIDAS",         // Español
        modeLlegadasText: "LLEGADAS",      // Español
        
        // Botones de carrera
        newRaceText: "Nueva",
        deleteRaceText: "Eliminar",
        deleteRaceConfirmBtn: "Eliminar",
        deleteRaceCancelBtn:'Cancelar',

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
        
        // Orden de salida - NUEVAS TRADUCCIONES (EN CAMELCASE)
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
        exportOrderText: "Exportar Orden",
        addRiderText: "Añadir Corredor",
        noStartOrderText: "No hay corredores en el orden de salida",
        
        // Headers de tabla orden de salida (EN CAMELCASE)
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
        
        // Para compatibilidad (manteniendo los alias)
        startTimeUpdated: "Hora de inicio actualizada y guardada",
        
        // ============================================
        // NUEVAS TRADUCCIONES PARA SELECTOR DE MODO
        // ============================================
        modeSelectorTitle: "Modo de Operación",
        modeSalidaDesc: "Control de salidas con cuenta atrás",
        modeLlegadasTitle: "Modo Llegadas",
        modeLlegadasDesc: "Control de tiempos de llegada",
        modeChanged: "Cambiado al modo {mode}",
        
        // ============================================
        // NUEVAS TRADUCCIONES PARA MODO LLEGADAS
        // ============================================
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
        
        // ============================================
        // TRADUCCIONES PARA REGISTRO DE LLEGADAS
        // ============================================
        registerLlegadaModalTitle: "Registrar Llegada",
        llegadaDorsalLabel: "Dorsal del corredor:",
        llegadaHoraLabel: "Hora de llegada:",
        llegadaNotasLabel: "Notas (opcional):",
        confirmLlegadaBtn: "Registrar Llegada",
        cancelLlegadaBtn: "Cancelar",
        quickRegisterTitle: "Registrar llegada rápida",
        
        // ============================================
        // TRADUCCIONES PARA IMPORTACIÓN DE SALIDAS
        // ============================================
        importSalidasModalTitle: "Importar Datos de Salidas",
        importSalidasModalText: "Selecciona el archivo Excel con los datos de salidas de los corredores.",
        confirmImportSalidasBtn: "Importar",
        cancelImportSalidasBtn: "Cancelar",
        importPreviewTitle: "Vista previa de datos:",
        importSuccess: "Datos de salidas importados correctamente ({count} corredores)",
        importError: "Error al importar los datos",
        startTimerFirst: "Primero inicia el cronómetro de llegadas",
        noDataImported: "No se pudieron importar datos de salidas",
        
        // ============================================
        // TRADUCCIONES PARA CLASIFICACIÓN
        // ============================================
        rankingModalTitle: "Clasificación de la Carrera",
        noRankingText: "No hay suficientes datos para generar la clasificación",
        rankingPos: "Pos",
        rankingDorsal: "Dorsal",
        rankingNombre: "Nombre",
        rankingTiempo: "Tiempo Crono",
        rankingDiferencia: "Diferencia",
        exportRankingBtn: "Exportar Clasificación",
        closeRankingBtn: "Cerrar",
        
        // ============================================
        // TRADUCCIONES PARA CABECERAS DE TABLAS (LLEGADAS)
        // ============================================
        llegadaHeaderDorsal: "Dorsal",
        llegadaHeaderNombre: "Nombre",
        llegadaHeaderSalida: "Hora Salida",
        llegadaHeaderLlegada: "Hora Llegada",
        llegadaHeaderCrono: "Tiempo Crono",
        llegadaHeaderNotas: "Notas",
        
        // ============================================
        // TRADUCCIONES PARA CONFIGURACIÓN DE AUDIO
        // ============================================
        audioConfigTitle: "Configuración de Audio para Salidas",
        beepOptionTitle: "Sonidos Beep",
        voiceOptionTitle: "Voz grabada",
        muteOptionTitle: "Sin sonido",
        testAudioText: "Probar sonido actual",
        
        // ============================================
        // TRADUCCIONES PARA CONFIGURACIÓN DE TIEMPO
        // ============================================
        cardTimeTitle: "Configuración de Tiempo para Salidas",
        
        // ============================================
        // TRADUCCIONES PARA MENSAJES DE ESTADO (LLEGADAS)
        // ============================================
        llegadaRegistered: "Llegada registrada para dorsal {dorsal}",
        llegadaAlreadyExists: "Ya existe una llegada registrada para el dorsal {dorsal}",
        llegadasCleared: "Lista de llegadas limpiada",
        timerStarted: "Cronómetro de llegadas iniciado",
        timerStopped: "Cronómetro detenido",
        rankingGenerated: "Clasificación generada con {count} corredores",
        llegadasExported: "Llegadas exportadas a Excel",
        rankingExported: "Clasificación exportada a Excel",
        
        // ============================================
        // TRADUCCIONES PARA VALIDACIONES
        // ============================================
        enterDorsal: "Introduce un número de dorsal válido",
        invalidDorsal: "Dorsal no válido",
        noStartTimeData: "No hay datos de hora de salida para este dorsal",
        confirmClearLlegadas: "¿Estás seguro de que quieres limpiar todas las llegadas registradas?",
        selectFileFirst: "Primero selecciona un archivo",
        
        // ============================================
        // EXPORTA EXCEL
        // ============================================
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


        cardRaceTitle: "Gestión de Carrera",
        modeSelectorTitle: "Modo de Operación",
        cardStartOrderTitle: "Orden de Salida",
        modeSelectorTitle: "Modo de Operación",
        modeSalidaTitle: "Salidas",  // Para español
        modeLlegadasTitle: "Llegadas", // Para español
    },

    ca: {
        // Títulos generales
        appTitle: "Crono CRI",
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
        exportOrderText: "Exportar Ordre",
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
    },

    en: {
        // Títulos generales
        appTitle: "Crono CRI",
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
        exportOrderText: "Export Order",
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
    },

    fr: {
        // Títulos generales
        appTitle: "Crono CRI",
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
        exportOrderText: "Exporter Ordre",
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
    }
};

function updateLanguageUI() {
    const lang = appState.currentLanguage;
    const t = translations[lang];
    
    console.log(`Actualizando UI al idioma: ${lang}`);
    
    // Actualizar banderas activas
    document.querySelectorAll('.flag').forEach(flag => {
        flag.classList.remove('active');
    });
    document.getElementById(`flag-${lang}`).classList.add('active');
    
    // ============================================
    // ACTUALIZAR ELEMENTOS EXISTENTES
    // ============================================
    
    // Header
    document.getElementById('app-title-text').textContent = t.appTitle;
    document.getElementById('languages-label').textContent = t.languagesLabel;
    document.getElementById('help-icon-header').title = t.helpIconTitle;
    
    // Gestión de carrera
    document.getElementById('card-race-title').textContent = t.cardRaceTitle;
    document.getElementById('new-race-text').textContent = t.newRaceText;
    document.getElementById('delete-race-text').textContent = t.deleteRaceText;
    
    // Orden de salida
    document.getElementById('card-start-order-title').textContent = t.cardStartOrderTitle;
    document.getElementById('first-start-label').textContent = t.firstStartLabel;
    document.getElementById('current-time-label').textContent = t.currentTimeLabel;
    document.getElementById('time-diff-label').textContent = t.timeDiffLabel;
    document.getElementById('total-riders-label').textContent = t.totalRidersLabel;
    
    
    // Botones de orden de salida
    document.getElementById('create-template-text').textContent = t.createTemplateText;
    document.getElementById('import-order-text').textContent = t.importOrderText;
    document.getElementById('delete-order-text').textContent = t.deleteOrderText;
    document.getElementById('export-order-text').textContent = t.exportOrderText;
    document.getElementById('add-rider-text').textContent = t.addRiderText;
    document.getElementById('order-table-label').textContent = t.orderTableLabel;
    document.getElementById('no-start-order-text').textContent = t.noStartOrderText;
    
    // Cabeceras de tabla de orden de salida
    document.getElementById('order-header').textContent = t.orderHeader;
    document.getElementById('dorsal-header').textContent = t.dorsalHeader;
    document.getElementById('crono-salida-header').textContent = t.cronoSalidaHeader;
    document.getElementById('hora-salida-header').textContent = t.horaSalidaHeader;
    document.getElementById('nombre-header').textContent = t.nombreHeader;
    document.getElementById('apellidos-header').textContent = t.apellidosHeader;
    document.getElementById('chip-header').textContent = t.chipHeader;
    document.getElementById('hora-real-header').textContent = t.horaRealHeader;
    document.getElementById('crono-real-header').textContent = t.cronoRealHeader;
    document.getElementById('hora-prevista-header').textContent = t.horaPrevistaHeader;
    document.getElementById('crono-prevista-header').textContent = t.cronoPrevistaHeader;
    document.getElementById('hora-importado-header').textContent = t.horaImportadoHeader;
    document.getElementById('crono-importado-header').textContent = t.cronoImportadoHeader;
    document.getElementById('crono-segundos-header').textContent = t.cronoSegundosHeader;
    document.getElementById('hora-segundos-header').textContent = t.horaSegundosHeader;
    
    // ============================================
    // ACTUALIZAR ELEMENTOS DEL MODO SALIDA
    // ============================================
    
    // Configuración de tiempo
    document.getElementById('card-time-title').textContent = t.cardTimeTitle;
    document.getElementById('interval-time-label').textContent = t.intervalTimeLabel;
    document.getElementById('minutes-text').textContent = t.minutesText;
    document.getElementById('seconds-text').textContent = t.secondsText;
    
    // Configuración de audio
    document.getElementById('audio-config-title').textContent = t.audioConfigTitle;
    document.getElementById('beep-option-title').textContent = t.beepOptionTitle;
    document.getElementById('voice-option-title').textContent = t.voiceOptionTitle;
    document.getElementById('mute-option-title').textContent = t.muteOptionTitle;
    document.getElementById('test-audio-text').textContent = t.testAudioText;
    
    // Botón de inicio
    document.getElementById('start-countdown-text').textContent = t.startCountdownText;
    document.getElementById('start-from-x-text').textContent = t.startFromXText;
    document.getElementById('exit-complete-text').textContent = t.exitCompleteText;
    
    // Salidas registradas
    document.getElementById('card-departures-title').textContent = t.cardDeparturesTitle;
    document.getElementById('clear-departures-text').textContent = t.clearDeparturesText;
    document.getElementById('export-excel-text').textContent = t.exportExcelText;
    document.getElementById('no-departures-text').textContent = t.noDeparturesText;
    
    // Cabeceras de tabla de salidas
    document.getElementById('departure-header-dorsal').textContent = t.departureHeaderDorsal;
    document.getElementById('departure-header-time').textContent = t.departureHeaderTime;
    document.getElementById('departure-header-notes').textContent = t.departureHeaderNotes;
    document.getElementById('departure-header-date').textContent = t.departureHeaderDate;
    
    // ============================================
    // ACTUALIZAR ELEMENTOS DEL MODO LLEGADAS
    // ============================================
    
    // Cronómetro principal
    document.getElementById('llegadas-timer-title').textContent = t.llegadasTimerTitle;
    document.getElementById('llegadas-timer-label').textContent = t.llegadasTimerLabel;
    document.getElementById('start-llegadas-text').textContent = t.startLlegadasText;
    document.getElementById('stop-llegadas-text').textContent = t.stopLlegadasText;
    document.getElementById('register-llegada-text').textContent = t.registerLlegadaText;
    document.getElementById('import-llegadas-text').textContent = t.importLlegadasText;
    
    // Tabla de llegadas
    document.getElementById('llegadas-list-title').textContent = t.llegadasListTitle;
    document.getElementById('clear-llegadas-text').textContent = t.clearLlegadasText;
    document.getElementById('export-llegadas-text').textContent = t.exportLlegadasText;
    document.getElementById('show-ranking-text').textContent = t.showRankingText;
    document.getElementById('no-llegadas-text').textContent = t.noLlegadasText;
    
    // Cabeceras de tabla de llegadas
    document.getElementById('llegada-header-dorsal').textContent = t.llegadaHeaderDorsal;
    document.getElementById('llegada-header-nombre').textContent = t.llegadaHeaderNombre;
    document.getElementById('llegada-header-salida').textContent = t.llegadaHeaderSalida;
    document.getElementById('llegada-header-llegada').textContent = t.llegadaHeaderLlegada;
    document.getElementById('llegada-header-crono').textContent = t.llegadaHeaderCrono;
    document.getElementById('llegada-header-notas').textContent = t.llegadaHeaderNotas;
    
    // Botón flotante
    document.getElementById('quick-register-btn').title = t.quickRegisterTitle;
    
    // ============================================
    // ACTUALIZAR PANTALLA DE CUENTA ATRÁS
    // ============================================
    
    document.getElementById('countdown-label').textContent = t.countdownLabel;
    document.getElementById('total-time-label').textContent = t.totalTimeLabel;
    document.getElementById('next-corredor-label').textContent = t.nextCorredorLabel;
    document.getElementById('departed-label').textContent = t.departedLabel;
    
    // ============================================
    // ACTUALIZAR FOOTER
    // ============================================
    
    document.getElementById('help-text').textContent = t.helpText;
    document.getElementById('suggestions-text').textContent = t.suggestionsText;
    document.getElementById('install-text').textContent = t.installText;
    document.getElementById('update-text').textContent = t.updateText;

    
    // ============================================
    // ACTUALIZAR MODALES
    // ============================================
     // Header
    document.getElementById('app-title-text').textContent = t.appTitle;
    document.getElementById('languages-label').textContent = t.languagesLabel;
    
    // ============================================
    // ACTUALIZAR BOTONES DE GESTIÓN DE CARRERA
    // ============================================
    
    // Botones de carrera - IMPORTANTE: actualizar los spans dentro de los botones
    document.getElementById('new-race-text').textContent = t.newRaceText;
    document.getElementById('delete-race-text').textContent = t.deleteRaceText;
    
    // Modal de ayuda
    document.getElementById('help-modal-title').textContent = t.helpModalTitle;
    document.getElementById('help-modal-text1').textContent = t.helpModalText1;
    document.getElementById('help-modal-subtitle1').textContent = t.helpModalSubtitle1;
    document.getElementById('help-modal-list').innerHTML = t.helpModalList;
    document.getElementById('help-modal-subtitle2').textContent = t.helpModalSubtitle2;
    document.getElementById('red-background-text').textContent = t.redBackgroundText;
    document.getElementById('countdown-normal-desc').textContent = t.countdownNormalDesc;
    document.getElementById('yellow-background-text').textContent = t.yellowBackgroundText;
    document.getElementById('countdown-warning-desc').textContent = t.countdownWarningDesc;
    document.getElementById('green-background-text').textContent = t.greenBackgroundText;
    document.getElementById('countdown-salida-desc').textContent = t.countdownSalidaDesc;
    document.getElementById('red-numbers-text').textContent = t.redNumbersText;
    document.getElementById('countdown-critical-desc').textContent = t.countdownCriticalDesc;
    document.getElementById('help-modal-subtitle3').textContent = t.helpModalSubtitle3;
    document.getElementById('beep-high-text').textContent = t.beepHighText;
    document.getElementById('beep-high-desc').textContent = t.beepHighDesc;
    document.getElementById('beep-every-second-text').textContent = t.beepEverySecondText;
    document.getElementById('beep-every-second-desc').textContent = t.beepEverySecondDesc;
    document.getElementById('beep-low-text').textContent = t.beepLowText;
    document.getElementById('beep-low-desc').textContent = t.beepLowDesc;
    document.getElementById('help-modal-text2').textContent = t.helpModalText2;
    document.getElementById('help-modal-ok').textContent = t.helpModalOk;
    
    // Modal de reinicio
    document.getElementById('restart-modal-title').textContent = t.restartModalTitle;
    document.getElementById('restart-modal-text').textContent = t.restartModalText;
    document.getElementById('restart-confirm-btn').textContent = t.restartConfirmBtn;
    document.getElementById('restart-cancel-btn').textContent = t.restartCancelBtn;
    
    // Modal de eliminar carrera
    document.getElementById('delete-race-modal-title').textContent = t.deleteRaceModalTitle;
    document.getElementById('delete-race-modal-text').textContent = t.deleteRaceModalText;
    document.getElementById('delete-race-confirm-btn').textContent = t.deleteRaceConfirmBtn;
    document.getElementById('delete-race-cancel-btn').textContent = t.deleteRaceCancelBtn;
    
    // Modal de limpiar salidas
    document.getElementById('clear-departures-modal-title').textContent = t.clearDeparturesModalTitle;
    document.getElementById('clear-departures-modal-text').textContent = t.clearDeparturesModalText;
    document.getElementById('clear-departures-confirm-btn').textContent = t.clearDeparturesConfirmBtn;
    document.getElementById('clear-departures-cancel-btn').textContent = t.clearDeparturesCancelBtn;
    
    // Modal de nueva carrera
    document.getElementById('new-race-modal-title').textContent = t.newRaceModalTitle;
    document.getElementById('new-race-name-label').textContent = t.newRaceNameLabel;
    document.getElementById('new-race-desc-label').textContent = t.newRaceDescLabel;
    document.getElementById('create-race-btn').textContent = t.createRaceBtn;
    document.getElementById('cancel-create-race-btn').textContent = t.cancelCreateRaceBtn;
    
    // ============================================
    // ACTUALIZAR NUEVOS MODALES (LLEGADAS)
    // ============================================
    
    // Modal de registro de llegada
    document.getElementById('register-llegada-modal-title').textContent = t.registerLlegadaModalTitle;
    document.getElementById('llegada-dorsal-label').textContent = t.llegadaDorsalLabel;
    document.getElementById('llegada-hora-label').textContent = t.llegadaHoraLabel;
    document.getElementById('llegada-notas-label').textContent = t.llegadaNotasLabel;
    document.getElementById('confirm-llegada-btn').textContent = t.confirmLlegadaBtn;
    document.getElementById('cancel-llegada-btn').textContent = t.cancelLlegadaBtn;
    
    // Modal de importación de salidas
    document.getElementById('import-salidas-modal-title').textContent = t.importSalidasModalTitle;
    document.getElementById('import-salidas-modal-text').textContent = t.importSalidasModalText;
    document.getElementById('confirm-import-salidas-btn').textContent = t.confirmImportSalidasBtn;
    document.getElementById('cancel-import-salidas-btn').textContent = t.cancelImportSalidasBtn;
    
    // Modal de clasificación
    document.getElementById('ranking-modal-title').textContent = t.rankingModalTitle;
    document.getElementById('no-ranking-text').textContent = t.noRankingText;
    document.getElementById('export-ranking-btn').textContent = t.exportRankingBtn;
    document.getElementById('close-ranking-btn').textContent = t.closeRankingBtn;

    updateRaceManagementCardTitle();
    updateStartOrderCardTitle();

const rankingTable = document.getElementById('ranking-table');
if (rankingTable) {
    const rankingHeaders = rankingTable.querySelectorAll('th');
    if (rankingHeaders.length >= 5) {
        if (rankingHeaders[0]) rankingHeaders[0].textContent = t.rankingPos || 'Pos';
        if (rankingHeaders[1]) rankingHeaders[1].textContent = t.rankingDorsal || 'Dorsal';
        if (rankingHeaders[2]) rankingHeaders[2].textContent = t.rankingNombre || 'Nombre';
        if (rankingHeaders[3]) rankingHeaders[3].textContent = t.rankingTiempo || 'Tiempo';
        if (rankingHeaders[4]) rankingHeaders[4].textContent = t.rankingDiferencia || 'Diferencia';
    }
}
    
    // ============================================
    // ACTUALIZAR SELECTORES (OPTIONS)
    // ============================================
    
    // Selector de carrera
    const raceSelect = document.getElementById('race-select');
    if (raceSelect && raceSelect.options.length > 0) {
        raceSelect.options[0].text = t.selectRaceOption;
    }
    
    
    // ============================================
    // ACTUALIZAR SALIDA TEXT
    // ============================================
    
    updateSalidaText();
    updateModalTexts();
    
    console.log("UI actualizada al idioma:", lang);
}

// ===========================================
// ACTUALIZAR FUNCIÓN updateModalTexts()
// ===========================================
function updateModalTexts() {
    const t = translations[appState.currentLanguage];
    
    // Función auxiliar para establecer texto
    function setTextIfExists(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }
    
    // Función para establecer placeholder
    function setPlaceholderIfExists(elementId, placeholder) {
        const element = document.getElementById(elementId);
        if (element && placeholder) {
            element.placeholder = placeholder;
        }
    }
    
    // Actualizar modal de ayuda
    setTextIfExists('help-modal-title', t.helpModalTitle);
    setTextIfExists('help-modal-text1', t.helpModalText1);
    setTextIfExists('help-modal-subtitle1', t.helpModalSubtitle1);
    setTextIfExists('help-modal-subtitle2', t.helpModalSubtitle2);
    setTextIfExists('help-modal-subtitle3', t.helpModalSubtitle3);
    setTextIfExists('help-modal-text2', t.helpModalText2);
    setTextIfExists('help-modal-ok', t.understood);
    
    setTextIfExists('mode-selector-title', t.modeSelectorTitle);
    setTextIfExists('mode-salida-text', t.modeSalidaText);
    setTextIfExists('mode-llegadas-text', t.modeLlegadasText);

    setTextIfExists('red-background-text', t.redBackgroundText);
    setTextIfExists('yellow-background-text', t.yellowBackgroundText);
    setTextIfExists('green-background-text', t.greenBackgroundText);
    setTextIfExists('red-numbers-text', t.redNumbersText);
    setTextIfExists('countdown-normal-desc', t.countdownNormalDesc);
    setTextIfExists('countdown-warning-desc', t.countdownWarningDesc);
    setTextIfExists('countdown-critical-desc', t.countdownCriticalDesc);
    setTextIfExists('countdown-salida-desc', t.countdownSalidaDesc);
    
    setTextIfExists('beep-high-text', t.beepHighText);
    setTextIfExists('beep-high-desc', t.beepHighDesc);
    setTextIfExists('beep-every-second-text', t.beepEverySecondText);
    setTextIfExists('beep-every-second-desc', t.beepEverySecondDesc);
    setTextIfExists('beep-low-text', t.beepLowText);
    setTextIfExists('beep-low-desc', t.beepLowDesc);
    
    // Actualizar lista del modal de ayuda
    const helpList = document.getElementById('help-modal-list');
    if (helpList) {
        helpList.innerHTML = t.helpModalList;
    }
    
    // Actualizar headers de la tabla de salidas
    setTextIfExists('departure-header-dorsal', t.departureHeaderDorsal);
    setTextIfExists('departure-header-time', t.departureHeaderTime);
    setTextIfExists('departure-header-notes', t.departureHeaderNotes);
    setTextIfExists('departure-header-date', t.departureHeaderDate);
    setTextIfExists('no-departures-text', t.noDeparturesText);
    
    // Actualizar modales varios
    setTextIfExists('delete-race-modal-title', t.deleteRaceModalTitle);
    setTextIfExists('delete-race-modal-text', t.deleteRaceModalText);
    setTextIfExists('delete-race-confirm-btn', t.deleteConfirm || t.deleteRaceConfirmBtn);
    setTextIfExists('delete-race-cancel-btn', t.deleteRaceCancelBtn || t.cancelButtonText || t.cancel);

    setTextIfExists('new-race-text', t.newRaceText);
    setTextIfExists('delete-race-text', t.deleteRaceText);
    
    setTextIfExists('clear-departures-modal-title', t.clearDeparturesModalTitle);
    setTextIfExists('clear-departures-modal-text', t.clearDeparturesModalText);
    setTextIfExists('clear-departures-confirm-btn', t.clear || t.clearDeparturesText);
    setTextIfExists('clear-departures-cancel-btn', t.cancelButtonText || t.cancel);
    
    setTextIfExists('suggestions-modal-title', t.suggestionsModalTitle);
    setTextIfExists('suggestion-email-label', t.suggestionEmailLabel);
    setTextIfExists('suggestion-text-label', t.suggestionTextLabel);
    setTextIfExists('send-suggestion-btn', t.sendSuggestion);
    setTextIfExists('cancel-suggestion-btn', t.cancelButtonText || t.cancel);
    
    setTextIfExists('new-race-modal-title', t.newRaceModalTitle);
    setTextIfExists('new-race-name-label', t.newRaceNameLabel);
    setTextIfExists('new-race-desc-label', t.newRaceDescLabel);
    setTextIfExists('create-race-btn', t.createRace || "Crear carrera");
    // IMPORTANTE: Aquí está el problema - en HTML el ID es 'cancel-create-race-btn'
    setTextIfExists('cancel-create-race-btn', t.cancelButtonText || t.cancel || "Cancelar");
    
    setTextIfExists('restart-modal-title', t.restartModalTitle);
    setTextIfExists('restart-modal-text', t.restartModalText);
    setTextIfExists('restart-confirm-btn', t.restartConfirm);
    setTextIfExists('restart-cancel-btn', t.cancelButtonText || t.cancel);
    
    // Actualizar placeholders para modal de nueva carrera
    setPlaceholderIfExists('new-race-name', t.newRaceNameLabel || "Ej: Carrera MTB 2025");
    setPlaceholderIfExists('new-race-description', t.newRaceDescLabel || "Información adicional sobre la carrera...");
    
    // ============================================
    // ACTUALIZAR MODALES NUEVOS (LLEGADAS)
    // ============================================
    
    // Modal de registro de llegada
    setTextIfExists('register-llegada-modal-title', t.registerLlegadaModalTitle);
    setTextIfExists('llegada-dorsal-label', t.llegadaDorsalLabel);
    setTextIfExists('llegada-hora-label', t.llegadaHoraLabel);
    setTextIfExists('llegada-notas-label', t.llegadaNotasLabel);
    setTextIfExists('confirm-llegada-btn', t.confirmLlegadaBtn);
    setTextIfExists('cancel-llegada-btn', t.cancelLlegadaBtn || t.cancelButtonText || t.cancel);
    
    // Modal de importación de salidas
    setTextIfExists('import-salidas-modal-title', t.importSalidasModalTitle);
    setTextIfExists('import-salidas-modal-text', t.importSalidasModalText);
    setTextIfExists('confirm-import-salidas-btn', t.confirmImportSalidasBtn);
    setTextIfExists('cancel-import-salidas-btn', t.cancelImportSalidasBtn || t.cancelButtonText || t.cancel);
    
    // Modal de clasificación
    setTextIfExists('ranking-modal-title', t.rankingModalTitle);
    setTextIfExists('no-ranking-text', t.noRankingText);
    setTextIfExists('export-ranking-btn', t.exportRankingBtn);
    setTextIfExists('close-ranking-btn', t.closeRankingBtn);
    
    // Actualizar headers de tabla de ranking
    const rankingTable = document.getElementById('ranking-table');
    if (rankingTable) {
        const rankingHeaders = rankingTable.querySelectorAll('th');
        if (rankingHeaders.length >= 5) {
            if (rankingHeaders[0]) rankingHeaders[0].textContent = t.rankingPos || 'Pos';
            if (rankingHeaders[1]) rankingHeaders[1].textContent = t.rankingDorsal || 'Dorsal';
            if (rankingHeaders[2]) rankingHeaders[2].textContent = t.rankingNombre || 'Nombre';
            if (rankingHeaders[3]) rankingHeaders[3].textContent = t.rankingTiempo || 'Tiempo';
            if (rankingHeaders[4]) rankingHeaders[4].textContent = t.rankingDiferencia || 'Diferencia';
        }
    }
}