// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
const appState = {
    audioType: 'beep', // 'beep', 'voice', o 'none'

    // Para almacenar los audios precargados
    voiceAudioCache: {},
    
    // Para el audio de salida
    currentLanguage: 'es',
    currentRace: null,
    races: [],
    countdownActive: false,
    countdownValue: 0,
    countdownInterval: null,
    raceStartTime: null,
    departedCount: 0,
    nextCorredorTime: 60,
    intervals: [],
    currentIntervalIndex: 0,
    departureTimes: [],
    audioContext: null,
    isSalidaShowing: false,
    salidaTimeout: null,
    deferredPrompt: null,
    updateAvailable: false,
    countdownPaused: false,
    accumulatedTime: 0,
    configModalOpen: false,
    variableIntervalConfig: {
        intervals: [],
        saved: false
    },
    soundEnabled: true,
    aggressiveMode: false,
    // NUEVA PROPIEDAD: Para saber si estamos en modo variable
    isVariableMode: false
};
window.savingNotesIndex = null;

// ============================================
// TRADUCCIONES ACTUALIZADAS COMPLETAS
// ============================================
const translations = {
    es: {
        appTitle: "Crono Cuenta Atrás",
        languagesLabel: "Idioma / Language",
        cardRaceTitle: "Gestión de Carrera",
        newRaceText: "Nueva",
        deleteRaceText: "Eliminar",
        cardTimeTitle: "Configuración de Tiempos",
        cadenceTitle: "Cadencia de salida",
        sameIntervalText: "Siempre igual",
        variableIntervalText: "Varios tramos",
        intervalTimeLabel: "Tiempo entre salidas",
        minutesText: "minutos",
        secondsText: "segundos",
        addIntervalLabel: "Añadir nuevo tramo",
        toText: "hasta",
        addIntervalText: "Añadir",
        currentPositionText: "Posición actual:",
        cardStartTitle: "Punto de Inicio",
        startFromLabel: "Iniciar desde",
        startFromZeroText: "Comenzar desde el corredor 1",
        startFromXText: "O desde la posición:",
        cardDeparturesTitle: "Salidas Registradas",
        clearDeparturesText: "Limpiar lista",
        exportExcelText: "Exportar Excel",
        startCountdownText: "INICIAR CUENTA ATRÁS",
        exitCompleteText: "REINICIAR",
        totalTimeLabel: "Tiempo total",
        countdownlabel: "Salida en",
        nextCorredorLabel: "Próximo sale a",
        departedLabel: "Salidos",
        helpText: "Ayuda",
        suggestionsText: "Sugerencias",
        installText: "Instalar App",
        updateText: "Buscar actualizaciones",
        helpModalTitle: "Ayuda de Crono Cuenta Atrás",
        helpModalText1: "Crono Cuenta Atrás es una aplicación para controlar las salidas en carreras con cuenta atrás visual y sonora.",
        helpModalSubtitle1: "Cómo usar:",
        helpModalList: [
            "Selecciona una carrera o crea una nueva",
            "Configura la cadencia de salida (siempre igual o por tramos)",
            "Inicia desde el corredor 1 o desde una posición específica",
            "Pulsa 'INICIAR CUENTA ATRÁS' para comenzar",
            "La pantalla cambiará mostrando la cuenta atrás grande",
            "Cuando llegue a cero se mostrará 'SALIDA' y comenzará la cuenta para el siguiente"
        ],
        helpModalSubtitle2: "Indicadores visuales:",
        helpModalSubtitle3: "Sonidos:",
        helpModalText2: "Los 2 segundos de 'SALIDA' se restan automáticamente del tiempo de la siguiente cuenta atrás.",
        deleteRaceModalTitle: "Confirmar eliminación",
        deleteRaceModalText: "¿Estás seguro de que quieres eliminar esta carrera? Todos los datos se perderán.",
        clearDeparturesModalTitle: "Confirmar limpieza",
        clearDeparturesModalText: "¿Estás seguro de que quieres limpiar la lista de salidas? Esta acción no se puede deshacer.",
        suggestionsModalTitle: "Enviar sugerencias",
        suggestionEmailLabel: "Email (opcional):",
        suggestionTextLabel: "Sugerencias:",
        newRaceModalTitle: "Nueva carrera",
        newRaceNameLabel: "Nombre de la carrera:",
        newRaceDescLabel: "Descripción (opcional):",
        restartModalTitle: "Confirmar reinicio completo",
        restartModalText: "¿Estás seguro de que quieres reiniciar completamente? Esta acción:",
        deleteConfirm: "Eliminar",
        cancel: "Cancelar",
        understood: "Entendido",
        createRace: "Crear carrera",
        sendSuggestion: "Enviar",
        clear: "Limpiar",
        restartConfirm: "Sí, reiniciar completamente",
        selectRaceFirst: "Por favor, selecciona una carrera primero",
        countdownStarted: "Cuenta atrás iniciada",
        countdownStopped: "Cuenta atrás detenida",
        raceCreated: "Carrera creada correctamente",
        raceDeleted: "Carrera eliminada",
        departuresCleared: "Lista de salidas limpiada",
        intervalAdded: "Tramo añadido",
        excelExported: "Excel exportado correctamente",
        suggestionSent: "Sugerencia enviada",
        updateChecked: "Actualización verificada",
        intervalSaved: "Configuración de tramos guardada",
        intervalLoaded: "Configuración de tramos cargada",
        sessionRestarted: "Sesión reiniciada completamente",
        departureHeaderDorsal: "Salida",
        departureHeaderTime: "Tiempo",
        departureHeaderNotes: "Nota",
        departureHeaderDate: "Hora",
        departurePlaceholder: "Dorsal o aclaración",
        noDeparturesText: "No hay salidas registradas",
        saveButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        editIntervalModalTitle: "Editar Tiempo por Tramo",
        salidaText: "SALIDA",
        
        // NUEVAS TRADUCCIONES AÑADIDAS:
        beepHigh: "Beep agudo",
        beepHighDesc: "Al llegar a 10 segundos",
        beepEverySecond: "Beep cada segundo",
        beepEverySecondDesc: "Últimos 5 segundos",
        beepLow: "Beep grave",
        beepLowDesc: "Al llegar a cero",
        configureAtLeastOneInterval: "Debes configurar al menos un tramo para el modo 'Varios tramos'",
        noIntervalsConfigured: "Error: No hay intervalos configurados",
        noDataToExport: "No hay datos para exportar",
        listAlreadyEmpty: "La lista ya está vacía",
        cannotModifyLastSeconds: "No se puede modificar durante los últimos 12 segundos",
        countdownNotActive: "La cuenta atrás no está activa",
        enterValidTime: "Ingresa un tiempo válido (mayor que 0)",
        enterRaceName: "Ingresa un nombre para la carrera",
        fromMustBeLessThanTo: "El corredor 'desde' debe ser menor o igual que 'hasta'",
        enterValidTimeValue: "Ingresa un tiempo válido",
        intervalOverlaps: "Este tramo se solapa con el tramo existente",
        invalidValues: "Valores no válidos",
        adjustmentsSaved: "Ajustes guardados. Tiempo: {seconds}s desde corredor {corredor}",
        waitCountdownEnd: "Espera a que termine la cuenta atrás (menos de 12 segundos)",
        timeUpdated: "Tiempo actualizado a {seconds}s para corredores desde {corredor} en adelante",
        noIntervalSelected: "No hay tramo seleccionado para editar",
        intervalUpdated: "Tramo actualizado correctamente",
        intervalDeleted: "Tramo eliminado correctamente",
        confirmDeleteInterval: "¿Estás seguro de que quieres eliminar el tramo {from}-{to}?",
        redBackground: "Fondo ROJO:",
        yellowBackground: "Fondo AMARILLO:",
        greenBackground: "Fondo VERDE:",
        redNumbers: "Números ROJOS pulsantes:",
        countdownNormalDesc: "Cuenta atrás normal",
        countdownWarningDesc: "Últimos 10 segundos",
        countdownCriticalDesc: "Últimos 5 segundos",
        countdownSalidaDesc: "Momento de salida (2 segundos)",
        configuredSections: "Tramos configurados",        
        audioConfigTitle: "Configuración de Audio",
        audioModeLabel: "Tipo de sonido para cuenta atrás",
        beepOptionTitle: "Sonidos Beep",
        beepOptionDesc: "Beeps electrónicos para cada segundo",
        voiceOptionTitle: "Voz grabada",
        voiceOptionDesc: "Voz humana contando en tu idioma",
        muteOptionTitle: "Sin sonido",
        muteOptionDesc: "Solo efectos visuales",
        testAudioText: "Probar sonido actual"
    },
    ca: {
        appTitle: "Crono Compte Enrere",
        languagesLabel: "Idioma / Language",
        cardRaceTitle: "Gestió de Cursa",
        newRaceText: "Nova",
        deleteRaceText: "Eliminar",
        cardTimeTitle: "Configuració de Temps",
        cadenceTitle: "Cadència de sortida",
        sameIntervalText: "Sempre igual",
        variableIntervalText: "Varis trams",
        intervalTimeLabel: "Temps entre sortides",
        minutesText: "minuts",
        secondsText: "segons",
        addIntervalLabel: "Afegir nou tram",
        toText: "fins a",
        addIntervalText: "Afegir",
        currentPositionText: "Posició actual:",
        cardStartTitle: "Punt d'Inici",
        startFromLabel: "Iniciar des de",
        startFromZeroText: "Començar des del corredor 1",
        startFromXText: "O des de la posició:",
        cardDeparturesTitle: "Sortides Registrades",
        clearDeparturesText: "Netejar llista",
        exportExcelText: "Exportar Excel",
        startCountdownText: "INICIAR COMPTE ENRERE",
        exitCompleteText: "REINICIAR",
        totalTimeLabel: "Temps total",
        countdownlabel: "Sortida en",
        nextCorredorLabel: "Pròxim surt a",
        departedLabel: "Sortits",
        helpText: "Ajuda",
        suggestionsText: "Suggeriments",
        installText: "Instal·lar App",
        updateText: "Cercar actualitzacions",
        helpModalTitle: "Ajuda de Crono Compte Enrere",
        helpModalText1: "Crono Compte Enrere és una aplicació per controlar les sortides en curses amb compte enrere visual i sonor.",
        helpModalSubtitle1: "Com usar:",
        helpModalList: [
            "Selecciona una cursa o crea'n una de nova",
            "Configura la cadència de sortida (sempre igual o per trams)",
            "Inicia des del corredor 1 o des d'una posició específica",
            "Prem 'INICIAR COMPTE ENRERE' per començar",
            "La pantalla canviarà mostrant el compte enrere gran",
            "Quan arribi a zero es mostrarà 'SORTIDA' i començarà el compte per al següent"
        ],
        helpModalSubtitle2: "Indicadors visuals:",
        helpModalSubtitle3: "Sons:",
        helpModalText2: "Els 2 segons de 'SORTIDA' es resten automàticament del temps del compte enrere següent.",
        deleteRaceModalTitle: "Confirmar eliminació",
        deleteRaceModalText: "Estàs segur que vols eliminar aquesta cursa? Totes les dades es perdran.",
        clearDeparturesModalTitle: "Confirmar neteja",
        clearDeparturesModalText: "Estàs segur que vols netejar la llista de sortides? Aquesta acció no es pot desfer.",
        suggestionsModalTitle: "Enviar suggeriments",
        suggestionEmailLabel: "Email (opcional):",
        suggestionTextLabel: "Suggeriments:",
        newRaceModalTitle: "Nova cursa",
        newRaceNameLabel: "Nom de la cursa:",
        newRaceDescLabel: "Descripció (opcional):",
        restartModalTitle: "Confirmar reinici complet",
        restartModalText: "Estàs segur que vols reiniciar completament? Aquesta acció:",
        deleteConfirm: "Eliminar",
        cancel: "Cancel·lar",
        understood: "Entès",
        createRace: "Crear cursa",
        sendSuggestion: "Enviar",
        clear: "Netejar",
        restartConfirm: "Sí, reiniciar completament",
        selectRaceFirst: "Si us plau, selecciona una cursa primer",
        countdownStarted: "Compte enrere iniciat",
        countdownStopped: "Compte enrere aturat",
        raceCreated: "Cursa creada correctament",
        raceDeleted: "Cursa eliminada",
        departuresCleared: "Llista de sortides netejada",
        intervalAdded: "Tram afegit",
        excelExported: "Excel exportat correctament",
        suggestionSent: "Suggeriment enviat",
        updateChecked: "Actualització verificada",
        intervalSaved: "Configuració de trams guardada",
        intervalLoaded: "Configuració de trams carregada",
        sessionRestarted: "Sessió reiniciada completament",
        departureHeaderDorsal: "Sortida",
        departureHeaderTime: "Temps",
        departureHeaderNotes: "Nota",
        departureHeaderDate: "Hora",
        departurePlaceholder: "Dorsal o aclaració",
        noDeparturesText: "No hi ha sortides registrades",
        saveButtonText: "Desar",
        cancelButtonText: "Cancel·lar",
        editIntervalModalTitle: "Editar Temps per Tram",
        salidaText: "SORTIDA",
        
        // NUEVAS TRADUCCIONES AÑADIDAS:
        beepHigh: "Beep agut",
        beepHighDesc: "En arribar a 10 segons",
        beepEverySecond: "Beep cada segon",
        beepEverySecondDesc: "Últims 5 segons",
        beepLow: "Beep greu",
        beepLowDesc: "En arribar a zero",
        configureAtLeastOneInterval: "Has de configurar almenys un tram per al mode 'Varis trams'",
        noIntervalsConfigured: "Error: No hi ha trams configurats",
        noDataToExport: "No hi ha dades per exportar",
        listAlreadyEmpty: "La llista ja està buida",
        cannotModifyLastSeconds: "No es pot modificar durant els últims 12 segons",
        countdownNotActive: "El compte enrere no està actiu",
        enterValidTime: "Introdueix un temps vàlid (major que 0)",
        enterRaceName: "Introdueix un nom per a la cursa",
        fromMustBeLessThanTo: "El corredor 'des de' ha de ser menor o igual que 'fins a'",
        enterValidTimeValue: "Introdueix un temps vàlid",
        intervalOverlaps: "Aquest tram se solapa amb el tram existent",
        invalidValues: "Valors no vàlids",
        adjustmentsSaved: "Ajustos desats. Temps: {seconds}s des del corredor {corredor}",
        waitCountdownEnd: "Espera que acabi el compte enrere (menys de 12 segons)",
        timeUpdated: "Temps actualitzat a {seconds}s per a corredors des del {corredor} en endavant",
        noIntervalSelected: "No hi ha tram seleccionat per editar",
        intervalUpdated: "Tram actualitzat correctament",
        intervalDeleted: "Tram eliminat correctament",
        confirmDeleteInterval: "Estàs segur que vols eliminar el tram {from}-{to}?",
        redBackground: "Fons VERMELL:",
        yellowBackground: "Fons GROC:",
        greenBackground: "Fons VERD:",
        redNumbers: "Números VERMELLS pulsants:",
        countdownNormalDesc: "Compte enrere normal",
        countdownWarningDesc: "Últims 10 segons",
        countdownCriticalDesc: "Últims 5 segons",
        countdownSalidaDesc: "Momento de sortida (2 segons)",
        configuredSections: "Trams configurats",
        audioConfigTitle: "Configuració d'Àudio",
        audioModeLabel: "Tipus de so per al compte enrere",
        beepOptionTitle: "Sons Beep",
        beepOptionDesc: "Beeps electrònics per a cada segon",
        voiceOptionTitle: "Veure enregistrada",
        voiceOptionDesc: "Veure humana comptant en la teva llengua",
        muteOptionTitle: "Sense so",
        muteOptionDesc: "Només efectes visuals",
        testAudioText: "Provar so actual"
    },
    en: {
        appTitle: "Countdown Timer",
        languagesLabel: "Language / Idioma",
        cardRaceTitle: "Race Management",
        newRaceText: "New",
        deleteRaceText: "Delete",
        cardTimeTitle: "Time Configuration",
        cadenceTitle: "Start cadence",
        sameIntervalText: "Always the same",
        variableIntervalText: "Multiple intervals",
        intervalTimeLabel: "Time between starts",
        minutesText: "minutes",
        secondsText: "seconds",
        addIntervalLabel: "Add new interval",
        toText: "to",
        addIntervalText: "Add",
        currentPositionText: "Current position:",
        cardStartTitle: "Starting Point",
        startFromLabel: "Start from",
        startFromZeroText: "Start from racer 1",
        startFromXText: "Or from position:",
        cardDeparturesTitle: "Registered Departures",
        clearDeparturesText: "Clear list",
        exportExcelText: "Export Excel",
        startCountdownText: "START COUNTDOWN",
        exitCompleteText: "RESTART",
        totalTimeLabel: "Total time",
        countdownlabel: "Starts in",
        nextCorredorLabel: "Next starts in",
        departedLabel: "Departed",
        helpText: "Help",
        suggestionsText: "Suggestions",
        installText: "Install App",
        updateText: "Check for updates",
        helpModalTitle: "Countdown Timer Help",
        helpModalText1: "Countdown Timer is an application to control race starts with visual and sound countdown.",
        helpModalSubtitle1: "How to use:",
        helpModalList: [
            "Select a race or create a new one",
            "Configure start cadence (same or multiple intervals)",
            "Start from racer 1 or from specific position",
            "Press 'START COUNTDOWN' to begin",
            "Screen will change showing big countdown",
            "When it reaches zero 'START' will show and countdown for next begins"
        ],
        helpModalSubtitle2: "Visual indicators:",
        helpModalSubtitle3: "Sounds:",
        helpModalText2: "The 2 seconds of 'START' are automatically subtracted from the next countdown time.",
        deleteRaceModalTitle: "Confirm deletion",
        deleteRaceModalText: "Are you sure you want to delete this race? All data will be lost.",
        clearDeparturesModalTitle: "Confirm cleanup",
        clearDeparturesModalText: "Are you sure you want to clear the starts list? This action cannot be undone.",
        suggestionsModalTitle: "Send suggestions",
        suggestionEmailLabel: "Email (optional):",
        suggestionTextLabel: "Suggestions:",
        newRaceModalTitle: "New race",
        newRaceNameLabel: "Race name:",
        newRaceDescLabel: "Description (optional):",
        restartModalTitle: "Confirm complete restart",
        restartModalText: "Are you sure you want to restart completely? This action:",
        deleteConfirm: "Delete",
        cancel: "Cancel",
        understood: "Understood",
        createRace: "Create race",
        sendSuggestion: "Send",
        clear: "Clear",
        restartConfirm: "Yes, restart completely",
        selectRaceFirst: "Please select a race first",
        countdownStarted: "Countdown started",
        countdownStopped: "Countdown stopped",
        raceCreated: "Race created successfully",
        raceDeleted: "Race deleted",
        departuresCleared: "Starts list cleared",
        intervalAdded: "Interval added",
        excelExported: "Excel exported successfully",
        suggestionSent: "Suggestion sent",
        updateChecked: "Update checked",
        intervalSaved: "Interval configuration saved",
        intervalLoaded: "Interval configuration loaded",
        sessionRestarted: "Session restarted completely",
        departureHeaderDorsal: "Start",
        departureHeaderTime: "Time",
        departureHeaderNotes: "Note",
        departureHeaderDate: "Time",
        departurePlaceholder: "Bib number or note",
        noDeparturesText: "No departures recorded",
        saveButtonText: "Save",
        cancelButtonText: "Cancel",
        editIntervalModalTitle: "Edit Time per Interval",
        salidaText: "GO !!!!",
        
        // NUEVAS TRADUCCIONES AÑADIDAS:
        beepHigh: "High beep",
        beepHighDesc: "When reaching 10 seconds",
        beepEverySecond: "Beep every second",
        beepEverySecondDesc: "Last 5 seconds",
        beepLow: "Low beep",
        beepLowDesc: "When reaching zero",
        configureAtLeastOneInterval: "You must configure at least one interval for 'Multiple intervals' mode",
        noIntervalsConfigured: "Error: No intervals configured",
        noDataToExport: "No data to export",
        listAlreadyEmpty: "The list is already empty",
        cannotModifyLastSeconds: "Cannot modify during the last 12 seconds",
        countdownNotActive: "Countdown is not active",
        enterValidTime: "Enter a valid time (greater than 0)",
        enterRaceName: "Enter a race name",
        fromMustBeLessThanTo: "From' corredor must be less than or equal to 'To'",
        enterValidTimeValue: "Enter a valid time",
        intervalOverlaps: "This interval overlaps with existing interval",
        invalidValues: "Invalid values",
        adjustmentsSaved: "Adjustments saved. Time: {seconds}s from corredor {corredor}",
        waitCountdownEnd: "Wait for countdown to end (less than 12 seconds)",
        timeUpdated: "Time updated to {seconds}s for corredors from {corredor} onwards",
        noIntervalSelected: "No interval selected for editing",
        intervalUpdated: "Interval updated successfully",
        intervalDeleted: "Interval deleted successfully",
        confirmDeleteInterval: "Are you sure you want to delete interval {from}-{to}?",
        redBackground: "RED background:",
        yellowBackground: "YELLOW background:",
        greenBackground: "GREEN background:",
        redNumbers: "RED pulsing numbers:",
        countdownNormalDesc: "Normal countdown",
        countdownWarningDesc: "Last 10 seconds",
        countdownCriticalDesc: "Last 5 seconds",
        countdownSalidaDesc: "Start moment (2 seconds)",
        configuredSections: "Configured intervals",
        audioConfigTitle: "Audio Configuration",
        audioModeLabel: "Sound type for countdown",
        beepOptionTitle: "Beep Sounds",
        beepOptionDesc: "Electronic beeps for each second",
        voiceOptionTitle: "Recorded Voice",
        voiceOptionDesc: "Human voice counting in your language",
        muteOptionTitle: "No Sound",
        muteOptionDesc: "Visual effects only",
        testAudioText: "Test current sound"
    },
    fr: {
        appTitle: "Compte à Rebours",
        languagesLabel: "Langue / Language",
        cardRaceTitle: "Gestion de Course",
        newRaceText: "Nouvelle",
        deleteRaceText: "Supprimer",
        cardTimeTitle: "Configuration des Temps",
        cadenceTitle: "Cadence de départ",
        sameIntervalText: "Toujours égal",
        variableIntervalText: "Plusieurs intervalles",
        intervalTimeLabel: "Temps entre départs",
        minutesText: "minutes",
        secondsText: "secondes",
        addIntervalLabel: "Ajouter nouvel intervalle",
        toText: "à",
        addIntervalText: "Ajouter",
        currentPositionText: "Position actuelle:",
        cardStartTitle: "Point de Départ",
        startFromLabel: "Démarrer depuis",
        startFromZeroText: "Démarrer depuis le coureur 1",
        startFromXText: "Ou desde la posición:",
        cardDeparturesTitle: "Départs Enregistrés",
        clearDeparturesText: "Effacer liste",
        exportExcelText: "Exporter Excel",
        startCountdownText: "DÉMARRER COMPTE À REBOURS",
        exitCompleteText: "REDÉMARRER",
        totalTimeLabel: "Temps total",
        countdownlabel: "Départ dans",
        nextCorredorLabel: "Prochain départ dans",
        departedLabel: "Partis",
        helpText: "Aide",
        suggestionsText: "Suggestions",
        installText: "Installer App",
        updateText: "Vérifier mises à jour",
        helpModalTitle: "Aide Compte à Rebours",
        helpModalText1: "Compte à Rebours est une application pour contrôler les départs de course con cuenta atrás visuel et sonore.",
        helpModalSubtitle1: "Comment utiliser:",
        helpModalList: [
            "Sélectionnez une course ou créez-en une nouvelle",
            "Configurez la cadence de départ (toujours égal ou plusieurs intervalles)",
            "Démarrez depuis le coureur 1 ou desde una position específica",
            "Appuyez sur 'DÉMARRER COMPTE À REBOURS' pour commencer",
            "L'écran changera montrant le compte à rebours grand",
            "Quand il atteint zéro 'DÉPART' s'affichera et le compte pour le suivant commencera"
        ],
        helpModalSubtitle2: "Indicateurs visuels:",
        helpModalSubtitle3: "Sons:",
        helpModalText2: "Les 2 secondes de 'DÉPART' sont automatiquement soustraites du temps du compte à rebours suivant.",
        deleteRaceModalTitle: "Confirmer suppression",
        deleteRaceModalText: "Êtes-vous sûr de vouloir supprimer cette course? Toutes les données seront perdues.",
        clearDeparturesModalTitle: "Confirmer nettoyage",
        clearDeparturesModalText: "Êtes-vous sûr de vouloir nettoyer la liste des départs? Cette action ne peut pas être annulée.",
        suggestionsModalTitle: "Envoyer suggestions",
        suggestionEmailLabel: "Email (optionnel):",
        suggestionTextLabel: "Suggestions:",
        newRaceModalTitle: "Nouvelle course",
        newRaceNameLabel: "Nom de la course:",
        newRaceDescLabel: "Description (optionnel):",
        restartModalTitle: "Confirmer redémarrage complet",
        restartModalText: "Êtes-vous sûr de vouloir redémarrer complètement? Cette action:",
        deleteConfirm: "Supprimer",
        cancel: "Annuler",
        understood: "Compris",
        createRace: "Créer course",
        sendSuggestion: "Envoyer",
        clear: "Nettoyer",
        restartConfirm: "Oui, redémarrer completement",
        selectRaceFirst: "Veuillez sélectionner une course d'abord",
        countdownStarted: "Compte à rebours démarré",
        countdownStopped: "Compte à rebours arrêté",
        raceCreated: "Course créée avec succès",
        raceDeleted: "Course supprimée",
        departuresCleared: "Liste des départs nettoyée",
        intervalAdded: "Intervalle ajouté",
        excelExported: "Excel exporté avec succès",
        suggestionSent: "Suggestion envoyée",
        updateChecked: "Mise à jour vérifiée",
        intervalSaved: "Configuration des intervalles sauvegardée",
        intervalLoaded: "Configuration des intervalles chargée",
        sessionRestarted: "Session redémarrée complètement",
        departureHeaderDorsal: "Départ",
        departureHeaderTime: "Temps",
        departureHeaderNotes: "Note",
        departureHeaderDate: "Heure",
        departurePlaceholder: "Dossard ou remarque",
        noDeparturesText: "Aucun départ enregistré",
        saveButtonText: "Enregistrer",
        cancelButtonText: "Annuler",
        editIntervalModalTitle: "Modifier Temps par Intervalle",
        salidaText: "DÉPART",
        
        // NUEVAS TRADUCCIONES AÑADIDAS:
        beepHigh: "Beep aigu",
        beepHighDesc: "En atteignant 10 secondes",
        beepEverySecond: "Beep chaque seconde",
        beepEverySecondDesc: "Dernières 5 secondes",
        beepLow: "Beep grave",
        beepLowDesc: "En atteignant zéro",
        configureAtLeastOneInterval: "Vous devez configurer au moins un intervalle pour le mode 'Plusieurs intervalles'",
        noIntervalsConfigured: "Erreur: Aucun intervalle configuré",
        noDataToExport: "Aucune donnée à exporter",
        listAlreadyEmpty: "La liste est déjà vide",
        cannotModifyLastSeconds: "Impossible de modifier pendant les 12 dernières secondes",
        countdownNotActive: "Le compte à rebours n'est pas actif",
        enterValidTime: "Entrez un temps valide (supérieur à 0)",
        enterRaceName: "Entrez un nom de course",
        fromMustBeLessThanTo: "Le corredor 'De' doit être inférieur ou égal à 'À'",
        enterValidTimeValue: "Entrez un temps valide",
        intervalOverlaps: "Cet intervalle chevauche l'intervalle existant",
        invalidValues: "Valeurs non valides",
        adjustmentsSaved: "Ajustements enregistrés. Temps: {seconds}s depuis le corredor {corredor}",
        waitCountdownEnd: "Attendez la fin du compte à rebours (moins de 12 secondes)",
        timeUpdated: "Temps mis à jour à {seconds}s pour les corredors à partir de {corredor}",
        noIntervalSelected: "Aucun intervalle sélectionné pour modification",
        intervalUpdated: "Intervalle mis à jour avec succès",
        intervalDeleted: "Intervalle supprimé avec succès",
        confirmDeleteInterval: "Êtes-vous sûr de vouloir supprimer l'intervalle {from}-{to}?",
        redBackground: "Fond ROUGE:",
        yellowBackground: "Fond JAUNE:",
        greenBackground: "Fond VERT:",
        redNumbers: "Chiffres ROUGES pulsants:",
        countdownNormalDesc: "Compte à rebours normal",
        countdownWarningDesc: "Dernières 10 secondes",
        countdownCriticalDesc: "Dernières 5 secondes",
        countdownSalidaDesc: "Moment de départ (2 secondes)",
        configuredSections: "Intervalles configurés",
        audioConfigTitle: "Configuration Audio",
        audioModeLabel: "Type de son pour le compte à rebours",
        beepOptionTitle: "Sons Beep",
        beepOptionDesc: "Bips électroniques pour chaque seconde",
        voiceOptionTitle: "Voix enregistrée",
        voiceOptionDesc: "Voix humaine comptant dans votre langue",
        muteOptionTitle: "Sans son",
        muteOptionDesc: "Effets visuels seulement",
        testAudioText: "Tester le son actuel"
    }
};

// ============================================
// FUNCIONES DE SONIDO
// ============================================

function generateBeep(frequency, duration, type = 'sine') {
    try {
        if (!appState.audioContext) {
            appState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (appState.audioContext.state === 'suspended') {
            appState.audioContext.resume();
        }
        
        const oscillator = appState.audioContext.createOscillator();
        const gainNode = appState.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(appState.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, appState.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, appState.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, appState.audioContext.currentTime + duration);
        
        oscillator.start(appState.audioContext.currentTime);
        oscillator.stop(appState.audioContext.currentTime + duration);
        
    } catch (error) {
        console.log("Error generando beep:", error);
    }
}

function playSound(type) {
    if (!appState.soundEnabled) return;
    
    try {
        switch(type) {
            case 'warning':
                generateBeep(300, 1.5, 'square');
                break;
            case 'critical':
                generateBeep(500, 0.3, 'sine');
                break;
            case 'salida':
                generateBeep(800, 1.5, 'sine');
                break;
            case 'beep':
                generateBeep(500, 0.3, 'sine');
                break;
        }
    } catch (error) {
        console.log("Error reproduciendo sonido:", error);
    }
}

function initAudioOnInteraction() {
    if (!appState.audioContext) {
        appState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (appState.audioContext.state === 'suspended') {
        appState.audioContext.resume().then(() => {
            generateBeep(440, 0.1);
        });
    }
    
    document.removeEventListener('click', initAudioOnInteraction);
    document.removeEventListener('keydown', initAudioOnInteraction);
}

// ============================================
// FUNCIONES DE AUDIO MEJORADAS
// ============================================

// Precarga de audios de voz
// ============================================
// FUNCIÓN MEJORADA PARA PRECARGAR AUDIOS
// ============================================
function preloadVoiceAudios() {
    console.log("Precargando audios de voz .ogg...");
    
    const languages = ['es', 'en', 'ca', 'fr'];
    const numbers = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]; // ¡0 ahora es "salida"!
    
    // Contador para audios cargados
    let loadedCount = 0;
    const totalToLoad = languages.length * numbers.length;
    
    languages.forEach(lang => {
        appState.voiceAudioCache[lang] = {};
        
        // Precargar TODOS los números incluyendo 0
        numbers.forEach(num => {
            const audio = new Audio();
            audio.preload = 'auto';
            
            // Formato consistente: idioma_número.ogg
            audio.src = `audio/${lang}_${num}.ogg`;
            
            audio.addEventListener('canplaythrough', () => {
                appState.voiceAudioCache[lang][num] = audio;
                loadedCount++;
                console.log(`✅ Audio cargado: ${lang}_${num}.ogg (${loadedCount}/${totalToLoad})`);
                
                // El 0 es especial - es la "salida"
                if (num === 0) {
                    console.log(`   (Este es el audio de SALIDA para ${lang})`);
                }
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`❌ ERROR cargando ${audio.src}:`, e.type);
                console.error("  Verifica que exista: audio/" + lang + "_" + num + ".ogg");
                
                // Si es el 0 y falla, dar un mensaje específico
                if (num === 0) {
                    console.error("  IMPORTANTE: El archivo 0.ogg es para 'SALIDA'/'GO'/'DÉPART'");
                }
                
                loadedCount++;
            });
            
            audio.load();
        });
    });
    
    // Verificar carga después de un tiempo
    setTimeout(() => {
        console.log(`\n=== RESUMEN DE CARGA DE AUDIOS ===`);
        console.log(`Cargados: ${loadedCount}/${totalToLoad}`);
        
        languages.forEach(lang => {
            console.log(`\nIdioma: ${lang}`);
            const loadedNumbers = Object.keys(appState.voiceAudioCache[lang] || {}).length;
            console.log(`  Números cargados: ${loadedNumbers}/11`);
            
            // Verificar si el 0 (salida) está cargado
            if (appState.voiceAudioCache[lang][0]) {
                console.log(`  ✅ Audio de SALIDA (0.ogg): CARGADO`);
            } else {
                console.log(`  ❌ Audio de SALIDA (0.ogg): FALTA`);
            }
        });
    }, 3000);
}

function playVoiceAudio(number) {
    if (appState.audioType !== 'voice') return;
    
    console.log(`🔊 Reproduciendo: ${appState.currentLanguage}_${number}.ogg`);
    
    try {
        const lang = appState.currentLanguage;
        
        // Primero intentar usar el audio precargado
        if (appState.voiceAudioCache[lang] && appState.voiceAudioCache[lang][number]) {
            const audio = appState.voiceAudioCache[lang][number];
            audio.currentTime = 0; // Reiniciar al inicio
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error reproduciendo audio precargado ${lang}_${number}:`, error);
                    // Fallback: cargar directamente
                    loadAndPlayAudioDirectly(lang, number);
                });
            }
        } else {
            // Si no está precargado, cargar directamente
            loadAndPlayAudioDirectly(lang, number);
        }
        
    } catch (error) {
        console.error("❌ Error crítico en playVoiceAudio:", error);
        // Fallback a beep
        generateBeep(500, 0.3, 'sine');
    }
}

function loadAndPlayAudioDirectly(lang, number) {
    console.log(`📥 Cargando directamente: ${lang}_${number}.ogg`);
    
    const audio = new Audio();
    audio.src = `audio/${lang}_${number}.ogg`;
    
    // Intentar reproducir inmediatamente
    audio.play().then(() => {
        console.log(`✅ Audio reproducido directamente: ${lang}_${number}.ogg`);
    }).catch(error => {
        console.error(`❌ Error reproduciendo ${lang}_${number}.ogg:`, error);
        
        // Si hay error, mostrar información de depuración
        if (error.name === 'NotAllowedError') {
            console.error("  El usuario no ha interactuado con la página");
            console.error("  Haz clic en la página primero");
        } else if (error.name === 'NotFoundError') {
            console.error("  El archivo no se encuentra");
            console.error("  Verifica la ruta: " + audio.src);
        }
        
        // Fallback a beep
        generateBeep(500, 0.3, 'sine');
    });
}

function playSalidaVoice() {
    if (appState.audioType !== 'voice') return;
    
    console.log(`🔊 Reproduciendo SALIDA (${appState.currentLanguage}_0.ogg)`);
    
    // ¡Simplemente usar playVoiceAudio con número 0!
    playVoiceAudio(0);
}

function loadAndPlaySalidaDirectly(lang) {
    const audio = new Audio();
    audio.src = `audio/${lang}_salida.ogg`;
    
    audio.play().catch(error => {
        console.error(`❌ Error reproduciendo salida ${lang}:`, error);
        generateBeep(800, 1.5, 'sine');
    });
}

function verifyAudioFiles() {
    console.log("=== VERIFICACIÓN DE ARCHIVOS .ogg ===");
    console.log("CONVENCIÓN: 0.ogg = audio de SALIDA\n");
    
    const languages = ['es', 'en', 'ca', 'fr'];
    const requiredNumbers = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    
    languages.forEach(lang => {
        console.log(`\n📁 Idioma: ${lang.toUpperCase()}`);
        
        // Verificar archivos de números
        requiredNumbers.forEach(num => {
            const audio = new Audio();
            const url = `audio/${lang}_${num}.ogg`;
            audio.src = url;
            
            audio.addEventListener('canplaythrough', () => {
                if (num === 0) {
                    console.log(`  ✅ ${lang}_${num}.ogg - SALIDA ✓`);
                } else {
                    console.log(`  ✅ ${lang}_${num}.ogg`);
                }
            });
            
            audio.addEventListener('error', (e) => {
                if (num === 0) {
                    console.log(`  ❌ ${lang}_${num}.ogg - SALIDA (FALTA!)`);
                } else {
                    console.log(`  ❌ ${lang}_${num}.ogg`);
                }
                console.log(`      Ruta probada: ${url}`);
            });
            
            audio.load();
        });
    });
}


// Función de fallback para cargar audio directamente
function fallbackVoiceAudio(number, lang) {
    console.log(`Usando fallback para: ${lang}_${number}`);
    
    const audio = new Audio();
    const formats = ['.mp3', '.ogg', '.wav'];
    
    // Intentar diferentes formatos
    for (const format of formats) {
        audio.src = `audio/${lang}_${number}${format}`;
        
        audio.addEventListener('error', () => {
            console.log(`Formato ${format} no funciona para ${lang}_${number}`);
        });
        
        audio.addEventListener('canplaythrough', () => {
            console.log(`Formato ${format} funciona para ${lang}_${number}`);
            audio.play().catch(e => {
                console.warn("Error reproduciendo fallback:", e);
                generateBeep(500, 0.3, 'sine');
            });
            return; // Salir del bucle si funciona
        });
        
        audio.load();
    }
}

function fallbackSalidaVoice(lang) {
    const audio = new Audio();
    const formats = ['.mp3', '.ogg', '.wav'];
    
    for (const format of formats) {
        audio.src = `audio/${lang}_salida${format}`;
        
        audio.addEventListener('canplaythrough', () => {
            audio.play().catch(e => {
                console.warn("Error reproduciendo salida fallback:", e);
                generateBeep(800, 1.5, 'sine');
            });
            return;
        });
        
        audio.addEventListener('error', () => {
            console.log(`Formato ${format} no funciona para salida ${lang}`);
        });
        
        audio.load();
    }
}

function playSound(type) {
    if (appState.audioType === 'none') return;
    
    try {
        switch(type) {
            case 'warning': // 10 segundos
                if (appState.audioType === 'beep') {
                    generateBeep(300, 1.5, 'square');
                } else if (appState.audioType === 'voice') {
                    playVoiceAudio(10); // "diez", "ten", etc.
                }
                break;
                
            case 'critical': // 5 segundos
                if (appState.audioType === 'beep') {
                    generateBeep(500, 0.3, 'sine');
                } else if (appState.audioType === 'voice') {
                    playVoiceAudio(5); // "cinco", "five", etc.
                }
                break;
                
            case 'salida': // 0 segundos - ¡SALIDA!
                if (appState.audioType === 'beep') {
                    generateBeep(800, 1.5, 'sine');
                } else if (appState.audioType === 'voice') {
                    playVoiceAudio(0); // ¡Usar el 0 para salida!
                }
                break;
                
            case 'beep': // Beeps normales
                if (appState.audioType === 'beep') {
                    generateBeep(500, 0.3, 'sine');
                }
                break;
                
            case 'number': // Números del 4 al 1
                if (appState.audioType === 'voice' && appState.countdownValue >= 0) {
                    // Solo decir números del 4 al 1
                    if (appState.countdownValue <= 4 && appState.countdownValue > 0) {
                        playVoiceAudio(appState.countdownValue);
                    }
                }
                break;
        }
    } catch (error) {
        console.log("Error en playSound:", error);
    }
}

function testCurrentAudio() {
    const t = translations[appState.currentLanguage];
    
    console.clear();
    console.log("=== PRUEBA COMPLETA DE AUDIO ===");
    console.log("Idioma:", appState.currentLanguage);
    console.log("Tipo de audio:", appState.audioType);
    console.log("Convención: 0.ogg = SALIDA/GO/DÉPART/SORTIDA\n");
    
    if (appState.audioType === 'none') {
        showMessage("Modo sin sonido activado", 'info');
        return;
    }
    
    if (appState.audioType === 'beep') {
        console.log("Probando beeps...");
        generateBeep(300, 0.5, 'square');
        setTimeout(() => generateBeep(500, 0.3, 'sine'), 600);
        setTimeout(() => generateBeep(800, 1.5, 'sine'), 1200);
        
        showMessage("Probando sonido beep", 'info');
        
    } else if (appState.audioType === 'voice') {
        console.log("Probando secuencia de carrera completa:");
        
        // Simular una secuencia de cuenta atrás real
        console.log("1. Advertencia (10 segundos)...");
        playVoiceAudio(10);
        
        setTimeout(() => {
            console.log("2. Cinco segundos...");
            playVoiceAudio(5);
        }, 1500);
        
        setTimeout(() => {
            console.log("3. Cuatro...");
            playVoiceAudio(4);
        }, 3000);
        
        setTimeout(() => {
            console.log("4. Tres...");
            playVoiceAudio(3);
        }, 4500);
        
        setTimeout(() => {
            console.log("5. Dos...");
            playVoiceAudio(2);
        }, 6000);
        
        setTimeout(() => {
            console.log("6. Uno...");
            playVoiceAudio(1);
        }, 7500);
        
        setTimeout(() => {
            console.log("7. ¡SALIDA! (0)...");
            playVoiceAudio(0); // ¡Este es el audio de salida!
        }, 9000);
        
        showMessage(`Probando voz en ${appState.currentLanguage}`, 'info');
    }
}
// Añadir esta función y llamarla en initApp
function checkAvailableAudioFiles() {
    console.log("=== VERIFICANDO ARCHIVOS DE AUDIO ===");
    
    const languages = ['es', 'en', 'ca', 'fr'];
    const testNumbers = [10, 5, 1];
    
    languages.forEach(lang => {
        console.log(`\n📁 Idioma: ${lang}`);
        
        // Verificar números
        testNumbers.forEach(num => {
            const formats = ['.mp3', '.ogg', '.wav'];
            formats.forEach(format => {
                const audio = new Audio();
                const url = `audio/${lang}_${num}${format}`;
                
                audio.addEventListener('canplaythrough', () => {
                    console.log(`  ✅ ${lang}_${num}${format} - DISPONIBLE`);
                });
                
                audio.addEventListener('error', (e) => {
                    console.log(`  ❌ ${lang}_${num}${format} - NO DISPONIBLE (${e.type})`);
                });
                
                audio.src = url;
                audio.load();
            });
        });
        
        // Verificar "salida"
        const formats = ['.mp3', '.ogg', '.wav'];
        formats.forEach(format => {
            const audio = new Audio();
            const url = `audio/${lang}_salida${format}`;
            
            audio.addEventListener('canplaythrough', () => {
                console.log(`  ✅ ${lang}_salida${format} - DISPONIBLE`);
            });
            
            audio.addEventListener('error', (e) => {
                console.log(`  ❌ ${lang}_salida${format} - NO DISPONIBLE (${e.type})`);
            });
            
            audio.src = url;
            audio.load();
        });
    });
}
// Función para seleccionar tipo de audio
function selectAudioType(audioType) {
    appState.audioType = audioType;
    
    // Actualizar interfaz
    document.querySelectorAll('.audio-option').forEach(option => {
        option.classList.remove('active');
    });
    
    document.querySelector(`.audio-option[data-audio-type="${audioType}"]`).classList.add('active');
    
    // Guardar preferencia
    localStorage.setItem('countdown-audio-type', audioType);
    
    console.log("Tipo de audio seleccionado:", audioType);
}

// Cargar preferencias de audio guardadas
function loadAudioPreferences() {
    const savedAudioType = localStorage.getItem('countdown-audio-type');
    if (savedAudioType && ['beep', 'voice', 'none'].includes(savedAudioType)) {
        appState.audioType = savedAudioType;
    }
}
function showExpectedFilenames() {
    console.log("=== NOMBRES DE ARCHIVOS ESPERADOS ===");
    console.log("(Para carpeta audio/)\n");
    
    const languages = {
        'es': 'Español',
        'en': 'English', 
        'ca': 'Català',
        'fr': 'Français'
    };
    
    Object.entries(languages).forEach(([code, name]) => {
        console.log(`\n${name} (${code}):`);
        console.log(`  ${code}_10.ogg  → "diez" / "ten" / "deu" / "dix"`);
        console.log(`  ${code}_9.ogg   → "nueve" / "nine" / "nou" / "neuf"`);
        console.log(`  ${code}_8.ogg   → "ocho" / "eight" / "vuit" / "huit"`);
        console.log(`  ${code}_7.ogg   → "siete" / "seven" / "set" / "sept"`);
        console.log(`  ${code}_6.ogg   → "seis" / "six" / "sis" / "six"`);
        console.log(`  ${code}_5.ogg   → "cinco" / "five" / "cinc" / "cinq"`);
        console.log(`  ${code}_4.ogg   → "cuatro" / "four" / "quatre" / "quatre"`);
        console.log(`  ${code}_3.ogg   → "tres" / "three" / "tres" / "trois"`);
        console.log(`  ${code}_2.ogg   → "dos" / "two" / "dos" / "deux"`);
        console.log(`  ${code}_1.ogg   → "uno" / "one" / "un" / "un"`);
        console.log(`  ${code}_0.ogg   → "¡SALIDA!" / "GO!" / "SORTIDA!" / "DÉPART!"`);
    });
    
    console.log("\n=== TOTAL DE ARCHIVOS NECESARIOS ===");
    console.log("4 idiomas × 11 números = 44 archivos .ogg");
}

// ============================================
// VARIABLES PARA ORDENACIÓN
// ============================================
let sortState = {
    column: 'time',
    direction: 'desc' // 'asc' o 'desc'
};

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

function initApp() {
    console.log("Inicializando aplicación...");
    
    loadLanguagePreference();
    loadRacesFromStorage();
    loadAppState();
    loadIntervalConfig();
    loadAudioPreferences(); // Cargar preferencias de audio
    
    // Verificar archivos de audio
    setTimeout(() => {
        verifyAudioFiles();
    }, 500);
    
    // Precargar audios
    setTimeout(() => {
        preloadVoiceAudios();
    }, 1000);

    // Cargar datos de la carrera actual
    loadRaceData();
    
    updateLanguageUI();
    updateSalidaText();
    renderRacesSelect();
    setupSorting();
    
    setInterval(updateTotalTime, 1000);
    setInterval(updateCurrentTime, 1000);
    
    setupServiceWorker();
    setupPWA();
    setupCountdownResize();
    adjustCountdownSize();
    adjustInfoCornersSize();
    
    // Precargar audios de voz
    preloadVoiceAudios();
    
    // Configurar eventos - PRIMERO los de intervalos
    setupIntervalsEvents();
    setupEditIntervalModalEvents();
    setupEventListeners();
    setupAudioEventListeners(); // Configurar eventos de audio
    
    // Configurar listeners adicionales específicos para intervalos
    setTimeout(() => {
        setupSpecificIntervalListeners();
    }, 500);
    
    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
    
    console.log("Aplicación inicializada.");
    console.log(`Idioma inicial: ${appState.currentLanguage}`);
    console.log(`Tipo de audio: ${appState.audioType}`);
    console.log(`Texto SALIDA: ${translations[appState.currentLanguage].salidaText}`);
}

function setupAudioEventListeners() {
    // Configurar selección de tipo de audio
    document.querySelectorAll('.audio-option').forEach(option => {
        option.addEventListener('click', function() {
            const audioType = this.getAttribute('data-audio-type');
            selectAudioType(audioType);
        });
    });
    
    // Botón de prueba de audio
    document.getElementById('test-audio-btn').addEventListener('click', testCurrentAudio);
}

function setupSpecificIntervalListeners() {
    console.log("Configurando listeners específicos para intervalos...");
    
    // Agregar listeners directos a los botones existentes
    document.querySelectorAll('.remove-interval-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            console.log("Evento click directo en botón eliminar");
            e.preventDefault();
            e.stopPropagation();
            
            const index = parseInt(this.getAttribute('data-index'));
            handleRemoveInterval(index);
        });
    });
    
    document.querySelectorAll('.edit-interval-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            console.log("Evento click directo en botón editar");
            e.preventDefault();
            e.stopPropagation();
            
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index)) {
                openEditIntervalModal(index);
            }
        });
    });
}

function handleRemoveInterval(index) {
    const t = translations[appState.currentLanguage];
    
    if (!isNaN(index) && index >= 0 && index < appState.intervals.length) {
        const interval = appState.intervals[index];
        const confirmMessage = t.confirmDeleteInterval.replace('{from}', interval.from).replace('{to}', interval.to);
        
        if (confirm(confirmMessage)) {
            appState.intervals.splice(index, 1);
            
            renderIntervalsList();
            
            intervalConfig.variableMode = {
                intervals: [...appState.intervals],
                saved: true
            };
            saveIntervalConfig();
            
            if (appState.currentRace) {
                appState.currentRace.intervals = [...appState.intervals];
                saveRaceData();
            }
            
            if (appState.countdownActive) {
                updateCurrentInterval();
                saveAppState();
            }
            
            showMessage(t.intervalDeleted, 'success');
            console.log("Intervalo eliminado. Total restante:", appState.intervals.length);
            
            // Reconfigurar listeners después de renderizar
            setTimeout(() => {
                setupSpecificIntervalListeners();
            }, 100);
        }
    }
}
function refreshIntervalButtons() {
    // Limpiar eventos antiguos
    document.querySelectorAll('.remove-interval-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    document.querySelectorAll('.edit-interval-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // Agregar nuevos listeners
    setupSpecificIntervalListeners();
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem('countdown-language');
    if (savedLang && translations[savedLang]) {
        appState.currentLanguage = savedLang;
    }
}

function loadRacesFromStorage() {
    const savedRaces = localStorage.getItem('countdown-races');
    if (savedRaces) {
        appState.races = JSON.parse(savedRaces);
    }
    
    const savedCurrentRace = localStorage.getItem('countdown-current-race');
    if (savedCurrentRace) {
        appState.currentRace = JSON.parse(savedCurrentRace);
    }
}

function loadAppState() {
    const savedState = localStorage.getItem('countdown-app-state');
    if (savedState) {
        const state = JSON.parse(savedState);
        
        appState.departedCount = state.departedCount || 0;
        appState.nextCorredorTime = state.nextCorredorTime || 60;
        appState.intervals = state.intervals || [];
        appState.currentIntervalIndex = state.currentIntervalIndex || 0;
        appState.accumulatedTime = state.accumulatedTime || 0;
        appState.raceStartTime = state.raceStartTime || null;
        appState.isVariableMode = state.isVariableMode || false;
        
        // Asegurarse de que los tiempos de salida existentes tengan timeValue
        if (state.departureTimes && state.departureTimes.length > 0 && state.raceStartTime) {
            appState.departureTimes = state.departureTimes.map(departure => {
                if (departure.timeValue) return departure;
                
                const elapsedSeconds = Math.floor((departure.timestamp - state.raceStartTime) / 1000);
                const hours = Math.floor(elapsedSeconds / 3600);
                const minutes = Math.floor((elapsedSeconds % 3600) / 60);
                const seconds = elapsedSeconds % 60;
                
                return {
                    ...departure,
                    timeValue: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                    elapsedSeconds: elapsedSeconds
                };
            });
        } else {
            appState.departureTimes = state.departureTimes || [];
        }
        
        appState.countdownActive = false;
        appState.countdownValue = 0;
        appState.countdownPaused = false;
        
        document.getElementById('start-position').value = appState.departedCount + 1;
        
        console.log("Estado cargado, salidos:", appState.departedCount);
    }
}

function loadRaceData() {
    if (!appState.currentRace) {
        appState.departureTimes = [];
        appState.departedCount = 0;
        appState.intervals = [];
        appState.isVariableMode = false;
        
        document.getElementById('departed-count').textContent = appState.departedCount;
        document.getElementById('start-position').value = appState.departedCount + 1;
        renderDeparturesList();
        return;
    }
    
    appState.departureTimes = appState.currentRace.departures || [];
    appState.departedCount = appState.departureTimes.length > 0 ? 
        Math.max(...appState.departureTimes.map(d => d.corredor)) : 0;
    appState.intervals = appState.currentRace.intervals || [];
    
    document.getElementById('departed-count').textContent = appState.departedCount;
    document.getElementById('start-position').value = appState.departedCount + 1;
    
    const cadenceMode = appState.currentRace.cadenceMode || 'single';
    appState.isVariableMode = (cadenceMode === 'variable');
    
    if (appState.isVariableMode) {
        document.getElementById('single-interval-config').style.display = 'none';
        document.getElementById('variable-interval-config').style.display = 'block';
        document.getElementById('same-interval-btn').classList.remove('active');
        document.getElementById('variable-interval-btn').classList.add('active');
        
        if (appState.intervals.length > 0) {
            intervalConfig.variableMode = {
                intervals: [...appState.intervals],
                saved: true
            };
            updateCurrentInterval();
            renderIntervalsList();
        } else {
            appState.intervals = [];
            renderIntervalsList();
        }
    } else {
        document.getElementById('single-interval-config').style.display = 'block';
        document.getElementById('variable-interval-config').style.display = 'none';
        document.getElementById('same-interval-btn').classList.add('active');
        document.getElementById('variable-interval-btn').classList.remove('active');
        
        if (appState.intervals.length > 0 && appState.intervals[0]) {
            const firstInterval = appState.intervals[0];
            document.getElementById('interval-minutes').value = firstInterval.minutes;
            document.getElementById('interval-seconds').value = firstInterval.seconds;
            
            intervalConfig.singleMode = {
                minutes: firstInterval.minutes,
                seconds: firstInterval.seconds,
                saved: true
            };
            appState.nextCorredorTime = firstInterval.totalSeconds;
        } else {
            const defaultMinutes = intervalConfig.singleMode.minutes || 1;
            const defaultSeconds = intervalConfig.singleMode.seconds || 0;
            const defaultTotalSeconds = defaultMinutes * 60 + defaultSeconds;
            
            document.getElementById('interval-minutes').value = defaultMinutes;
            document.getElementById('interval-seconds').value = defaultSeconds;
            
            appState.intervals = [];
            appState.nextCorredorTime = defaultTotalSeconds;
            
            console.log("Modo single sin intervalos guardados - usando valores por defecto");
        }
    }
    
    updateCurrentInterval();
    updateNextCorredorDisplay();
    renderDeparturesList();
    
    console.log("Datos cargados para carrera:", appState.currentRace.name);
    console.log("Modo:", cadenceMode);
    console.log("Salidas:", appState.departureTimes.length);
    console.log("Intervalos en appState:", appState.intervals.length);
}

function saveAppState() {
    if (appState.countdownActive) {
        localStorage.setItem('countdown-app-state', JSON.stringify({
            countdownActive: appState.countdownActive,
            countdownValue: appState.countdownValue,
            departedCount: appState.departedCount,
            nextCorredorTime: appState.nextCorredorTime,
            intervals: appState.intervals,
            currentIntervalIndex: appState.currentIntervalIndex,
            departureTimes: appState.departureTimes,
            raceStartTime: appState.raceStartTime,
            accumulatedTime: appState.accumulatedTime,
            countdownPaused: appState.countdownPaused,
            isVariableMode: appState.isVariableMode
        }));
    } else {
        localStorage.removeItem('countdown-app-state');
    }
}

function saveRaceData() {
    if (!appState.currentRace) {
        console.log("No hay carrera actual para guardar datos");
        return;
    }
    
    const cadenceMode = appState.isVariableMode ? 'variable' : 'single';
    
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex === -1) {
        console.log("Carrera no encontrada en el array");
        return;
    }
    
    let intervalsToSave = [];
    
    if (cadenceMode === 'variable') {
        intervalsToSave = [...appState.intervals];
    } else {
        intervalsToSave = appState.intervals.length > 0 ? [...appState.intervals] : [];
    }
    
    appState.races[raceIndex] = {
        ...appState.currentRace,
        cadenceMode: cadenceMode,
        departures: [...appState.departureTimes],
        intervals: intervalsToSave,
        lastModified: new Date().toISOString()
    };
    
    appState.currentRace = appState.races[raceIndex];
    
    saveRacesToStorage();
    
    console.log("Datos guardados para carrera:", appState.currentRace.name);
    console.log("Modo:", cadenceMode);
    console.log("Salidas con notas:", appState.departureTimes.length);
    console.log("Intervalos guardados:", intervalsToSave.length);
}

function saveRacesToStorage() {
    localStorage.setItem('countdown-races', JSON.stringify(appState.races));
    if (appState.currentRace) {
        localStorage.setItem('countdown-current-race', JSON.stringify(appState.currentRace));
    }
}

function updateLanguageUI() {
    const lang = appState.currentLanguage;
    const t = translations[lang];

    document.getElementById('audio-config-title').textContent = t.audioConfigTitle;
    document.getElementById('beep-option-title').textContent = t.beepOptionTitle;
    document.getElementById('test-audio-text').textContent = t.testAudioText;

    // Actualizar selección de audio
    document.querySelectorAll('.audio-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`.audio-option[data-audio-type="${appState.audioType}"]`).classList.add('active');

    document.getElementById('app-title-text').textContent = t.appTitle;
    document.getElementById('languages-label').textContent = t.languagesLabel;
    document.getElementById('card-race-title').textContent = t.cardRaceTitle;
    document.getElementById('new-race-text').textContent = t.newRaceText;
    document.getElementById('delete-race-text').textContent = t.deleteRaceText;
    document.getElementById('card-time-title').textContent = t.cardTimeTitle;
    document.getElementById('same-interval-text').textContent = t.sameIntervalText;
    document.getElementById('variable-interval-text').textContent = t.variableIntervalText;
    document.getElementById('interval-time-label').textContent = t.intervalTimeLabel;
    document.getElementById('minutes-text').textContent = t.minutesText;
    document.getElementById('seconds-text').textContent = t.secondsText;
    document.getElementById('add-interval-label').textContent = t.addIntervalLabel;
    document.getElementById('to-text').textContent = t.toText;
    document.getElementById('add-interval-text').textContent = t.addIntervalText;
    
    document.getElementById('start-from-x-text').textContent = t.currentPositionText;
    
    document.getElementById('card-departures-title').textContent = t.cardDeparturesTitle;
    document.getElementById('clear-departures-text').textContent = t.clearDeparturesText;
    document.getElementById('export-excel-text').textContent = t.exportExcelText;
    document.getElementById('start-countdown-text').textContent = t.startCountdownText;
    document.getElementById('exit-complete-text').textContent = t.exitCompleteText;
    document.getElementById('total-time-label').textContent = t.totalTimeLabel;
    document.getElementById('countdown-label').textContent = t.countdownlabel;
    
    document.getElementById('next-corredor-label').textContent = t.nextCorredorLabel;
    document.getElementById('departed-label').textContent = t.departedLabel;
    document.getElementById('help-text').textContent = t.helpText;
    document.getElementById('suggestions-text').textContent = t.suggestionsText;
    document.getElementById('install-text').textContent = t.installText;
    document.getElementById('update-text').textContent = t.updateText;

    // Actualizar el texto "SALIDA" en la pantalla de cuenta atrás
    const salidaDisplay = document.getElementById('salida-display');
    if (salidaDisplay) {
        salidaDisplay.textContent = t.salidaText;
    }
    
    document.querySelectorAll('.flag').forEach(flag => {
        flag.classList.remove('active');
    });
    document.getElementById('flag-' + lang).classList.add('active');
    
    updateModalTexts();
}



function updateSalidaText() {
    const lang = appState.currentLanguage;
    const t = translations[lang];
    const salidaDisplay = document.getElementById('salida-display');
    
    if (salidaDisplay) {
        salidaDisplay.textContent = t.salidaText;
    }
}

function updateModalTexts() {
    const t = translations[appState.currentLanguage];
    
    // Modal de ayuda
    document.getElementById('help-modal-title').textContent = t.helpModalTitle;
    document.getElementById('help-modal-text1').textContent = t.helpModalText1;
    document.getElementById('help-modal-subtitle1').textContent = t.helpModalSubtitle1;
    document.getElementById('help-modal-subtitle2').textContent = t.helpModalSubtitle2;
    document.getElementById('help-modal-subtitle3').textContent = t.helpModalSubtitle3;
    document.getElementById('help-modal-text2').textContent = t.helpModalText2;
    document.getElementById('help-modal-ok').textContent = t.understood;
    
    // Indicadores visuales en modal de ayuda
    document.getElementById('red-background-text').textContent = t.redBackground;
    document.getElementById('yellow-background-text').textContent = t.yellowBackground;
    document.getElementById('green-background-text').textContent = t.greenBackground;
    document.getElementById('red-numbers-text').textContent = t.redNumbers;
    document.getElementById('countdown-normal-desc').textContent = t.countdownNormalDesc;
    document.getElementById('configured-sections-label').textContent = t.configuredSections;
    document.getElementById('countdown-warning-desc').textContent = t.countdownWarningDesc;
    document.getElementById('countdown-critical-desc').textContent = t.countdownCriticalDesc;
    document.getElementById('countdown-salida-desc').textContent = t.countdownSalidaDesc;
    
    // Sonidos en modal de ayuda
    document.getElementById('beep-high-text').textContent = t.beepHigh;
    document.getElementById('beep-high-desc').textContent = t.beepHighDesc;
    document.getElementById('beep-every-second-text').textContent = t.beepEverySecond;
    document.getElementById('beep-every-second-desc').textContent = t.beepEverySecondDesc;
    document.getElementById('beep-low-text').textContent = t.beepLow;
    document.getElementById('beep-low-desc').textContent = t.beepLowDesc;
    
    const helpList = document.getElementById('help-modal-list');
    if (helpList) {
        helpList.innerHTML = '';
        t.helpModalList.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.style.marginBottom = '8px';
            helpList.appendChild(li);
        });
    }
    
    // Tabla de salidas
    document.getElementById('edit-interval-modal-title').textContent = t.editIntervalModalTitle;
    document.getElementById('departure-header-dorsal').textContent = t.departureHeaderDorsal;
    document.getElementById('departure-header-time').textContent = t.departureHeaderTime;
    document.getElementById('departure-header-notes').textContent = t.departureHeaderNotes;
    document.getElementById('departure-header-date').textContent = t.departureHeaderDate;
    document.getElementById('no-departures-text').textContent = t.noDeparturesText;
    
    if (appState.departureTimes.length > 0) {
        renderDeparturesList();
    }
    
    // Modal eliminar carrera
    document.getElementById('delete-race-modal-title').textContent = t.deleteRaceModalTitle;
    document.getElementById('delete-race-modal-text').textContent = t.deleteRaceModalText;
    document.getElementById('delete-race-confirm-btn').textContent = t.deleteConfirm;
    document.getElementById('delete-race-cancel-btn').textContent = t.cancel;
    
    // Modal limpiar salidas
    document.getElementById('clear-departures-modal-title').textContent = t.clearDeparturesModalTitle;
    document.getElementById('clear-departures-modal-text').textContent = t.clearDeparturesModalText;
    document.getElementById('clear-departures-confirm-btn').textContent = t.clear;
    document.getElementById('clear-departures-cancel-btn').textContent = t.cancel;
    
    // Modal sugerencias
    document.getElementById('suggestions-modal-title').textContent = t.suggestionsModalTitle;
    document.getElementById('suggestion-email-label').textContent = t.suggestionEmailLabel;
    document.getElementById('suggestion-text-label').textContent = t.suggestionTextLabel;
    document.getElementById('send-suggestion-btn').textContent = t.sendSuggestion;
    document.getElementById('cancel-suggestion-btn').textContent = t.cancel;
    
    // Modal nueva carrera
    document.getElementById('new-race-modal-title').textContent = t.newRaceModalTitle;
    document.getElementById('new-race-name-label').textContent = t.newRaceNameLabel;
    document.getElementById('new-race-desc-label').textContent = t.newRaceDescLabel;
    document.getElementById('create-race-btn').textContent = t.createRace;
    document.getElementById('cancel-create-race-btn').textContent = t.cancel;
    
    // Modal reiniciar
    document.getElementById('restart-modal-title').textContent = t.restartModalTitle;
    document.getElementById('restart-modal-text').textContent = t.restartModalText;
    document.getElementById('restart-confirm-btn').textContent = t.restartConfirm;
    document.getElementById('restart-cancel-btn').textContent = t.cancel;

    const helpModalText = document.querySelector('#help-modal .modal-body');
    if (helpModalText) {
        // Asegúrate de que se incluye esta sección:
        const audioSection = document.createElement('div');
        audioSection.innerHTML = `
            <h4 id="help-modal-subtitle3">Opciones de sonido:</h4>
            <ul>
                <li><strong>Sonidos Beep:</strong> Beeps electrónicos para cada segundo</li>
                <li><strong>Voz grabada:</strong> Voz humana contando en tu idioma (es, en, ca, fr)</li>
                <li><strong>Sin sonido:</strong> Solo efectos visuales</li>
            </ul>
        `;
        // Insertar en la posición adecuada
        helpModalText.appendChild(audioSection);
    }
}

function renderRacesSelect() {
    const select = document.getElementById('race-select');
    select.innerHTML = '<option value="">-- Selecciona una carrera --</option>';
    
    appState.races.forEach((race, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = race.name;
        if (appState.currentRace && race.id === appState.currentRace.id) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// ============================================
// FUNCIONES PARA EL HISTORIAL DE SALIDAS
// ============================================
function registerDeparture() {
    // El número de salida es el valor ACTUAL de departedCount
    const salidaNumber = appState.departedCount + 1; // +1 porque departedCount es 0-indexed
    
    // Incrementar el contador de corredores salidos
    appState.departedCount++;
    
    let accumulatedSeconds = 0;
    
    if (appState.raceStartTime) {
        accumulatedSeconds = Math.floor((Date.now() - appState.raceStartTime) / 1000);
    }
    
    const hours = Math.floor(accumulatedSeconds / 3600);
    const minutes = Math.floor((accumulatedSeconds % 3600) / 60);
    const seconds = accumulatedSeconds % 60;
    const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const departure = {
        corredor: salidaNumber, // Usar el número de salida correcto
        timestamp: Date.now(),
        notes: '',
        editing: false,
        timeValue: timeValue,
        elapsedSeconds: accumulatedSeconds
    };
    
    appState.departureTimes.push(departure);
    
    // Actualizar displays
    document.getElementById('departed-count').textContent = appState.departedCount;
    document.getElementById('start-position').value = appState.departedCount + 1;
    
    renderDeparturesList();
    saveRaceData();
    saveAppState();
    
    console.log("Salida registrada - Número de salida:", salidaNumber, "Tiempo:", timeValue);
}

function renderDeparturesList() {
    const tableBody = document.getElementById('departures-table-body');
    const emptyState = document.getElementById('departures-empty');
    
    if (appState.departureTimes.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    const sortedDepartures = [...appState.departureTimes].sort((a, b) => {
        let valueA, valueB;
        
        switch(sortState.column) {
            case 'dorsal':
                valueA = a.corredor;
                valueB = b.corredor;
                break;
            case 'timeValue':
                valueA = a.elapsedSeconds || 0;
                valueB = b.elapsedSeconds || 0;
                break;
            case 'notes':
                valueA = (a.notes || '').toLowerCase();
                valueB = (b.notes || '').toLowerCase();
                break;
            case 'date':
                valueA = a.timestamp;
                valueB = b.timestamp;
                break;
            default:
                valueA = a.timestamp;
                valueB = b.timestamp;
        }
        
        if (sortState.direction === 'asc') {
            return valueA > valueB ? 1 : (valueA < valueB ? -1 : 0);
        } else {
            return valueA < valueB ? 1 : (valueA > valueB ? -1 : 0);
        }
    });
    
    tableBody.innerHTML = '';
    
    sortedDepartures.forEach((departure, displayIndex) => {
        // Encontrar el índice REAL en el array original
        const originalIndex = appState.departureTimes.findIndex(d => 
            d.corredor === departure.corredor && d.timestamp === departure.timestamp
        );
        
        const row = document.createElement('tr');
        
        const time = new Date(departure.timestamp);
        const timeStr = time.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        const dateStr = time.toLocaleDateString('es-ES');
        
        const t = translations[appState.currentLanguage];
        
        // Usar el índice ORIGINAL, no el de display
        const actualIndex = originalIndex !== -1 ? originalIndex : displayIndex;
        
        row.innerHTML = `
            <td class="departure-dorsal-cell">${departure.corredor}</td>
            <td class="departure-time-value-cell">
                ${departure.timeValue || '--:--:--'}
            </td>
            <td class="departure-notes-cell">
                ${departure.editing ? 
                    `<div class="notes-edit-container">
                        <textarea id="notes-input-${actualIndex}" class="departure-notes-input" rows="2" placeholder="${t.departurePlaceholder}" data-index="${actualIndex}">${departure.notes || ''}</textarea>
                        <div class="notes-buttons">
                            <button class="save-notes-btn" data-index="${actualIndex}">${t.saveButtonText}</button>
                            <button class="cancel-notes-btn" data-index="${actualIndex}">${t.cancelButtonText}</button>
                        </div>
                    </div>` :
                    `<div class="departure-notes-display ${!departure.notes ? 'empty' : ''}" data-index="${actualIndex}">
                        ${departure.notes || t.departurePlaceholder + '...'}
                    </div>`
                }
            </td>
            <td class="departure-date-cell">
                ${dateStr}<br>${timeStr}
            </td>
        `;
        
        tableBody.appendChild(row);
        
        if (departure.editing) {
            setupEditingMode(actualIndex);
        } else {
            const displayElement = row.querySelector('.departure-notes-display');
            if (displayElement) {
                displayElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const idx = parseInt(this.getAttribute('data-index'));
                    if (idx >= 0 && idx < appState.departureTimes.length) {
                        appState.departureTimes[idx].editing = true;
                        renderDeparturesList();
                    }
                });
            }
        }
    });
    
    updateSortIndicators();
}


function setupEditingMode(index) {
    // Usar el índice directamente del atributo data-index
    const inputElement = document.querySelector(`.departure-notes-input[data-index="${index}"]`);
    const saveButton = document.querySelector(`.save-notes-btn[data-index="${index}"]`);
    const cancelButton = document.querySelector(`.cancel-notes-btn[data-index="${index}"]`);
    
    if (inputElement) {
        inputElement.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        inputElement.addEventListener('focus', function(e) {
            e.stopPropagation();
        });
        
        inputElement.addEventListener('blur', function(e) {
            e.stopPropagation();
            // Solo guardar si el blur no fue causado por hacer clic en save/cancel
            if (!e.relatedTarget || 
                (!e.relatedTarget.classList.contains('save-notes-btn') && 
                !e.relatedTarget.classList.contains('cancel-notes-btn'))) {
                saveNotes(index);
            }
        });
        
        inputElement.addEventListener('keydown', function(e) {
            e.stopPropagation();
            if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey)) {
                e.preventDefault();
                saveNotes(index);
            }
        });
        
        setTimeout(() => {
            inputElement.focus();
            inputElement.select();
        }, 100);
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveNotes(index);
        });
        
        // También agregar event listener al contenedor de botones para prevenir propagación
        const buttonContainer = saveButton.closest('.notes-buttons');
        if (buttonContainer) {
            buttonContainer.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (index >= 0 && index < appState.departureTimes.length) {
                appState.departureTimes[index].editing = false;
                renderDeparturesList();
            }
        });
    }
}


function saveNotes(index) {
    // Verificar que el índice sea válido
    if (index < 0 || index >= appState.departureTimes.length) {
        console.error("Índice inválido en saveNotes:", index);
        return;
    }
    
    const inputElement = document.querySelector(`.departure-notes-input[data-index="${index}"]`);
    if (!inputElement) {
        console.error("Elemento input no encontrado para índice:", index);
        return;
    }
    
    const newNotes = inputElement.value.trim();
    
    appState.departureTimes[index].notes = newNotes;
    appState.departureTimes[index].editing = false;
    
    saveRaceData();
    
    if (appState.currentRace) {
        const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
        if (raceIndex !== -1) {
            appState.races[raceIndex].departures = [...appState.departureTimes];
            saveRacesToStorage();
            console.log("Nota guardada para corredor:", appState.departureTimes[index].corredor);
        }
    }
    
    setTimeout(() => {
        renderDeparturesList();
    }, 50);
}

function updateSortIndicators() {
    document.querySelectorAll('.departures-table th.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
        const column = th.getAttribute('data-sort');
        if (column === sortState.column) {
            th.classList.add(sortState.direction);
        }
    });
}

function setupSorting() {
    document.querySelectorAll('.departures-table th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            
            if (sortState.column === column) {
                sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.column = column;
                sortState.direction = 'asc';
            }
            
            renderDeparturesList();
        });
    });
}

function exportToExcel() {
    const t = translations[appState.currentLanguage];
    
    if (appState.departureTimes.length === 0) {
        showMessage(t.noDataToExport, 'warning');
        return;
    }
    
    const sortedForExport = [...appState.departureTimes].sort((a, b) => a.corredor - b.corredor);
    
    const data = [
        ['Carrera', appState.currentRace ? appState.currentRace.name : 'Sin nombre'],
        ['Descripción', appState.currentRace ? (appState.currentRace.description || 'Sin descripción') : ''],
        ['Fecha de exportación', new Date().toLocaleDateString()],
        ['Hora de exportación', new Date().toLocaleTimeString()],
        ['Total de salidas', appState.departureTimes.length],
        [''],
        ['Salida', 'Tiempo', 'Nota', 'Fecha', 'Hora', 'Timestamp']
    ];
    
    sortedForExport.forEach(departure => {
        const date = new Date(departure.timestamp);
        const timeValue = departure.timeValue || '--:--:--';
        
        data.push([
            departure.corredor,
            timeValue,
            departure.notes || '',
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            departure.timestamp
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salidas");
    
    const colWidths = [
        {wch: 8},
        {wch: 10},
        {wch: 50},
        {wch: 12},
        {wch: 10},
        {wch: 15}
    ];
    ws['!cols'] = colWidths;
    
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 0; R <= 4; R++) {
        for (let C = 0; C <= 1; C++) {
            const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E0E0E0" } }
            };
        }
    }
    
    const headerRow = 6;
    for (let C = 0; C <= 5; C++) {
        const cellAddress = XLSX.utils.encode_cell({r: headerRow, c: C});
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2C3E50" } },
            alignment: { horizontal: "center" }
        };
    }
    
    ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({
            s: { r: headerRow, c: 0 },
            e: { r: headerRow + sortedForExport.length, c: 5 }
        })
    };
    
    const raceName = appState.currentRace ? 
        appState.currentRace.name.replace(/[^a-z0-9]/gi, '_').substring(0, 50) : 'carrera';
    const date = new Date().toISOString().split('T')[0];
    const filename = `salidas_${raceName}_${date}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    showMessage(t.excelExported, 'success');
}

function clearRaceDepartures() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst, 'error');
        return;
    }
    
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.raceStartTime = null;
    document.getElementById('start-position').value = 1;
    document.getElementById('departed-count').textContent = 0;
    document.getElementById('total-time-value').textContent = '00:00:00';
    
    saveRaceData();
    renderDeparturesList();
    
    showMessage(t.departuresCleared, 'success');
}

// ============================================
// FUNCIONES DE CUENTA ATRÁS
// ============================================

function startCountdown() {
    console.log("Iniciando cuenta atrás...");
    
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst, 'error');
        return;
    }
    
    const isVariableMode = document.getElementById('variable-interval-config').style.display !== 'none';
    appState.isVariableMode = isVariableMode;
    
    if (isVariableMode && appState.intervals.length === 0) {
        showMessage(t.configureAtLeastOneInterval, 'error');
        return;
    }
    
    updateCadenceTime();
    
    if (appState.intervals.length === 0) {
        showMessage(t.noIntervalsConfigured, 'error');
        return;
    }
    
    document.querySelectorAll('.hide-on-countdown').forEach(el => {
        el.style.display = 'none';
    });
    
    const countdownScreen = document.getElementById('countdown-screen');
    countdownScreen.classList.add('active');
    countdownScreen.classList.remove('aggressive-numbers');
    
    appState.raceStartTime = Date.now();
    appState.accumulatedTime = 0;
    
    // Si empezamos desde una posición diferente, ajustar departedCount
    const startPosition = parseInt(document.getElementById('start-position').value) || 1;
    appState.departedCount = startPosition - 1;
    document.getElementById('departed-count').textContent = appState.departedCount;
    
    // Asegurar que el array departureTimes esté vacío si empezamos desde una nueva posición
    if (startPosition > 1) {
        appState.departureTimes = [];
        if (appState.currentRace) {
            appState.currentRace.departures = [];
            saveRaceData();
        }
    }
    
    updateCurrentInterval();
    
    appState.countdownActive = true;
    appState.countdownPaused = false;
    appState.countdownValue = appState.nextCorredorTime;
    appState.aggressiveMode = false;
    
    document.body.classList.remove('countdown-warning', 'countdown-critical', 'countdown-salida');
    document.body.classList.add('countdown-normal');
    
    countdownScreen.classList.remove('countdown-salida-active');
    
    document.getElementById('countdown-label').style.opacity = '1';
    document.getElementById('countdown-label').style.visibility = 'visible';
    
    updateCountdownDisplay();
    
    if (appState.countdownInterval) {
        clearInterval(appState.countdownInterval);
    }
    
    appState.countdownInterval = setInterval(updateCountdown, 1000);
    
    keepScreenAwake();
    
    if (!isVariableMode && appState.currentRace) {
        appState.currentRace.intervals = [...appState.intervals];
        saveRaceData();
    }
    
    saveAppState();
    
    showMessage(t.countdownStarted, 'success');
    console.log("Cuenta atrás iniciada correctamente.");
    console.log("Posición inicial:", startPosition, "Salidos:", appState.departedCount);
    console.log("Tiempo inicial:", appState.nextCorredorTime, "segundos");
}

function updateCadenceTime() {
    const isVariableMode = document.getElementById('variable-interval-config').style.display !== 'none';
    appState.isVariableMode = isVariableMode;
    
    if (!isVariableMode) {
        const minutes = parseInt(document.getElementById('interval-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('interval-seconds').value) || 0;
        const totalSeconds = minutes * 60 + seconds;
        
        appState.nextCorredorTime = totalSeconds;
        
        appState.intervals = [{
            from: 1,
            to: 9999,
            minutes: minutes,
            seconds: seconds,
            totalSeconds: totalSeconds
        }];
        
        console.log("Intervalo único creado para cuenta atrás:", minutes, "min", seconds, "seg");
    } else {
        updateCurrentInterval();
    }
    
    updateNextCorredorDisplay();
}

function updateCountdown() {
    if (!appState.countdownActive || appState.countdownPaused) return;
    
    const currentTime = Date.now();
    const elapsedFromRaceStart = Math.floor((currentTime - appState.raceStartTime) / 1000);
    
    const expectedElapsedTime = appState.accumulatedTime + 
        (appState.nextCorredorTime - appState.countdownValue);
    
    if (Math.abs(elapsedFromRaceStart - expectedElapsedTime) > 1) {
        appState.countdownValue = Math.max(0, appState.nextCorredorTime - 
            (elapsedFromRaceStart - appState.accumulatedTime));
    } else {
        appState.countdownValue--;
    }
    
    if (appState.countdownValue <= 0) {
        handleCountdownZero();
        return;
    }
    
    updateCountdownDisplay();
    
    // Reproducir sonidos según el tipo seleccionado
    if (appState.countdownValue === 10) {
        document.body.classList.remove('countdown-normal');
        document.body.classList.add('countdown-warning');
        playSound('warning');
        
        const countdownScreen = document.getElementById('countdown-screen');
        countdownScreen.classList.remove('aggressive-numbers');
        appState.aggressiveMode = false;
    } else if (appState.countdownValue === 5) {
        document.body.classList.remove('countdown-warning');
        document.body.classList.add('countdown-critical');
        playSound('critical');
        
        const countdownScreen = document.getElementById('countdown-screen');
        countdownScreen.classList.add('aggressive-numbers');
        appState.aggressiveMode = true;
    } else if (appState.countdownValue < 5 && appState.countdownValue > 0) {
        // Reproducir beep para modo beep o número para modo voz
        if (appState.audioType === 'beep') {
            playSound('beep');
        } else if (appState.audioType === 'voice') {
            playSound('number');
        }
        
        if (!appState.aggressiveMode) {
            const countdownScreen = document.getElementById('countdown-screen');
            countdownScreen.classList.add('aggressive-numbers');
            appState.aggressiveMode = true;
        }
    } else if (appState.countdownValue > 5 && appState.aggressiveMode) {
        const countdownScreen = document.getElementById('countdown-screen');
        countdownScreen.classList.remove('aggressive-numbers');
        appState.aggressiveMode = false;
    }
    
    if (appState.countdownValue % 10 === 0) {
        saveAppState();
    }
}

function updateCountdownDisplay() {
    const display = document.getElementById('countdown-display');
    
    if (appState.countdownValue >= 60) {
        const minutes = Math.floor(appState.countdownValue / 60);
        const seconds = appState.countdownValue % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        display.textContent = appState.countdownValue.toString();
    }
    
    updateNextCorredorDisplay();
    adjustCountdownSize();
}

function handleCountdownZero() {
    clearInterval(appState.countdownInterval);
    
    const countdownScreen = document.getElementById('countdown-screen');
    countdownScreen.classList.add('countdown-salida-active');
    
    countdownScreen.classList.remove('aggressive-numbers');
    appState.aggressiveMode = false;
    
    document.body.classList.remove('countdown-critical', 'countdown-warning', 'countdown-normal');
    document.body.classList.add('countdown-salida');
    
    const salidaDisplay = document.getElementById('salida-display');
    salidaDisplay.classList.add('show');
    
    playSound('salida'); // USANDO LA NUEVA FUNCIÓN
    
    // Registrar la salida
    registerDeparture();
    
    appState.accumulatedTime += appState.nextCorredorTime;
    
    appState.salidaTimeout = setTimeout(() => {
        salidaDisplay.classList.remove('show');
        countdownScreen.classList.remove('countdown-salida-active');
        prepareNextCountdown();
    }, 2000);
}

function canModifyDuringCountdown() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.countdownActive) return true;
    
    // No permitir modificar si faltan menos de 12 segundos
    if (appState.countdownValue <= 15) {
        showMessage(t.waitCountdownEnd, 'warning');
        return false;
    }
    
    return true;
}

function prepareNextCountdown() {
    // ¡IMPORTANTE! NO incrementar departedCount aquí
    // departedCount ya fue incrementado en registerDeparture()
    
    // Solo actualizar qué intervalo corresponde al PRÓXIMO corredor
    // El próximo corredor es el actual + 1 (departedCount ya fue incrementado)
    updateCurrentInterval(); // Esto debe encontrar el intervalo para el NUEVO corredor
    
    // IMPORTANTE: Usar el tiempo del intervalo encontrado
    // NO usar appState.nextCorredorTime directamente porque puede haber cambiado
    
    // Restar los 2 segundos de "SALIDA" del tiempo del intervalo
    appState.countdownValue = Math.max(0, appState.nextCorredorTime - 2);
    
    document.body.classList.remove('countdown-salida');
    document.body.classList.add('countdown-normal');
    
    document.getElementById('countdown-label').style.opacity = '1';
    document.getElementById('countdown-label').style.visibility = 'visible';
    
    updateCountdownDisplay();
    
    appState.countdownInterval = setInterval(updateCountdown, 1000);
    
    saveAppState();
}

function updateCurrentInterval() {
    const currentCorredor = appState.departedCount + 1; // El próximo a salir
    
    const sortedIntervals = [...appState.intervals].sort((a, b) => a.from - b.from);
    
    for (let i = 0; i < sortedIntervals.length; i++) {
        const interval = sortedIntervals[i];
        
        if (currentCorredor >= interval.from && currentCorredor <= interval.to) {
            appState.currentIntervalIndex = i;
            appState.nextCorredorTime = interval.totalSeconds; // Usar el tiempo del intervalo
            return;
        }
    }
    
    // Si no encuentra intervalo, usar el último o por defecto
    if (sortedIntervals.length > 0) {
        const lastInterval = sortedIntervals[sortedIntervals.length - 1];
        if (currentCorredor > lastInterval.to) {
            appState.nextCorredorTime = lastInterval.totalSeconds;
            appState.currentIntervalIndex = sortedIntervals.length - 1;
        }
    } else {
        appState.nextCorredorTime = 60; // Valor por defecto
    }
}

function updateNextCorredorDisplay() {
    const display = document.getElementById('next-corredor-time');
    if (!display) return;
    
    // Calcular qué tiempo le corresponde al SIGUIENTE corredor
    const nextCorredorNumber = appState.departedCount + 2; // El que viene después del actual
    
    let timeForNextCorredor = appState.nextCorredorTime; // Valor por defecto
    
    // Buscar en los intervalos
    if (appState.intervals && appState.intervals.length > 0) {
        const sortedIntervals = [...appState.intervals].sort((a, b) => a.from - b.from);
        
        for (const interval of sortedIntervals) {
            if (nextCorredorNumber >= interval.from && nextCorredorNumber <= interval.to) {
                timeForNextCorredor = interval.totalSeconds;
                break;
            }
        }
        
        // Si no se encuentra, buscar el último intervalo (para corredores más allá del último definido)
        if (timeForNextCorredor === appState.nextCorredorTime) {
            const lastInterval = sortedIntervals[sortedIntervals.length - 1];
            if (lastInterval && nextCorredorNumber > lastInterval.to) {
                timeForNextCorredor = lastInterval.totalSeconds;
            }
        }
    }
    
    // Formatear para mostrar
    if (timeForNextCorredor >= 60) {
        const minutes = Math.floor(timeForNextCorredor / 60);
        const seconds = timeForNextCorredor % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        display.textContent = timeForNextCorredor + "s";
    }
    
    console.log(`Display actualizado: Próximo corredor (${nextCorredorNumber}) sale en ${timeForNextCorredor}s`);
}


function updateTotalTime() {
    if (!appState.raceStartTime) return;
    
    const elapsed = Math.floor((Date.now() - appState.raceStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    const display = document.getElementById('total-time-value');
    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopCountdown() {
    console.log("Deteniendo cuenta atrás...");
    
    if (appState.countdownInterval) {
        clearInterval(appState.countdownInterval);
        appState.countdownInterval = null;
    }
    
    if (appState.salidaTimeout) {
        clearTimeout(appState.salidaTimeout);
        appState.salidaTimeout = null;
    }
    
    appState.countdownActive = false;
    appState.countdownPaused = false;
    appState.raceStartTime = null;
    appState.accumulatedTime = 0;
    appState.aggressiveMode = false;
    appState.configModalOpen = false;
    
    document.body.classList.remove(
        'countdown-normal', 
        'countdown-warning', 
        'countdown-critical', 
        'countdown-salida'
    );
    
    document.getElementById('countdown-screen').classList.remove('aggressive-numbers');
    
    document.body.style.backgroundColor = '';
    document.body.style.background = '';
    document.body.style.animation = '';
    
    document.getElementById('total-time-value').textContent = '00:00:00';
    
    localStorage.removeItem('countdown-app-state');
    
    console.log("Cuenta atrás detenida");
}

function pauseCountdownVisual() {
    appState.countdownPaused = true;
    appState.configModalOpen = true;
}

function resumeCountdownVisual() {
    appState.countdownPaused = false;
    appState.configModalOpen = false;
}


function updateFutureIntervals(startFromCorredor, newSeconds) {
    console.log(`Actualizando intervalos futuros desde corredor ${startFromCorredor} a ${newSeconds}s`);
    
    // Encontrar todos los intervalos que empiezan en o después del corredor de inicio
    const intervalsToModify = [];
    
    // Primero, clonar los intervalos para no modificar el array mientras iteramos
    const originalIntervals = [...appState.intervals];
    appState.intervals = [];
    
    originalIntervals.forEach((interval, originalIndex) => {
        if (interval.from >= startFromCorredor) {
            // Este intervalo está completamente en el futuro - modificar completamente
            appState.intervals.push({
                from: interval.from,
                to: interval.to,
                minutes: Math.floor(newSeconds / 60),
                seconds: newSeconds % 60,
                totalSeconds: newSeconds
            });
        } else if (interval.to >= startFromCorredor) {
            // Este intervalo se solapa parcialmente (comienza antes, termina después)
            // Necesitamos dividirlo
            
            // Parte antes del cambio (mantener tiempo original)
            const beforeInterval = {
                from: interval.from,
                to: startFromCorredor - 1,
                minutes: interval.minutes,
                seconds: interval.seconds,
                totalSeconds: interval.totalSeconds
            };
            
            // Parte después del cambio (nuevo tiempo)
            const afterInterval = {
                from: startFromCorredor,
                to: interval.to,
                minutes: Math.floor(newSeconds / 60),
                seconds: newSeconds % 60,
                totalSeconds: newSeconds
            };
            
            // Añadir ambas partes
            appState.intervals.push(beforeInterval);
            appState.intervals.push(afterInterval);
        } else {
            // Intervalo termina antes de startFromCorredor - mantener sin cambios
            appState.intervals.push({...interval});
        }
    });
    
    // Ordenar intervalos por 'from'
    appState.intervals.sort((a, b) => a.from - b.from);
    
    // Fusionar intervalos adyacentes con el mismo tiempo
    const mergedIntervals = [];
    for (let i = 0; i < appState.intervals.length; i++) {
        if (mergedIntervals.length === 0) {
            mergedIntervals.push({...appState.intervals[i]});
        } else {
            const lastInterval = mergedIntervals[mergedIntervals.length - 1];
            const currentInterval = appState.intervals[i];
            
            // Si los intervalos son adyacentes y tienen el mismo tiempo, fusionarlos
            if (lastInterval.to + 1 === currentInterval.from && 
                lastInterval.totalSeconds === currentInterval.totalSeconds) {
                lastInterval.to = currentInterval.to;
            } else {
                mergedIntervals.push({...currentInterval});
            }
        }
    }
    
    appState.intervals = mergedIntervals;
    
    // Guardar configuración
    intervalConfig.variableMode = {
        intervals: [...appState.intervals],
        saved: true
    };
    saveIntervalConfig();
    
    // Actualizar el display inferior izquierdo
    setTimeout(() => {
        updateNextCorredorDisplay();
    }, 100);
    
    console.log("Intervalos futuros actualizados:", appState.intervals);
}

function updateSingleIntervalForFuture(startFromCorredor, newSeconds) {
    console.log(`Actualizando modo single para futuros desde corredor ${startFromCorredor} a ${newSeconds}s`);
    
    if (appState.intervals.length === 0) {
        // No hay intervalos, crear dos: uno para el actual y otro para futuros
        appState.intervals.push({
            from: 1,
            to: startFromCorredor - 1,
            minutes: Math.floor(appState.nextCorredorTime / 60),
            seconds: appState.nextCorredorTime % 60,
            totalSeconds: appState.nextCorredorTime
        });
        
        appState.intervals.push({
            from: startFromCorredor,
            to: 9999,
            minutes: Math.floor(newSeconds / 60),
            seconds: newSeconds % 60,
            totalSeconds: newSeconds
        });
    } else if (appState.intervals.length === 1) {
        // Ya hay un intervalo único
        const currentInterval = appState.intervals[0];
        
        if (currentInterval.from < startFromCorredor) {
            // El intervalo actual comienza antes, necesitamos dividirlo
            const beforeInterval = {
                from: currentInterval.from,
                to: startFromCorredor - 1,
                minutes: currentInterval.minutes,
                seconds: currentInterval.seconds,
                totalSeconds: currentInterval.totalSeconds
            };
            
            const afterInterval = {
                from: startFromCorredor,
                to: 9999,
                minutes: Math.floor(newSeconds / 60),
                seconds: newSeconds % 60,
                totalSeconds: newSeconds
            };
            
            appState.intervals = [beforeInterval, afterInterval];
        } else {
            // El intervalo ya comienza en el futuro, actualizarlo
            appState.intervals[0] = {
                from: startFromCorredor,
                to: 9999,
                minutes: Math.floor(newSeconds / 60),
                seconds: newSeconds % 60,
                totalSeconds: newSeconds
            };
        }
    } else {
        // Ya hay múltiples intervalos (modo variable activado)
        // Encontrar y modificar los intervalos futuros
        for (let i = 0; i < appState.intervals.length; i++) {
            const interval = appState.intervals[i];
            
            if (interval.from >= startFromCorredor) {
                // Intervalo completamente futuro
                appState.intervals[i] = {
                    from: interval.from,
                    to: interval.to,
                    minutes: Math.floor(newSeconds / 60),
                    seconds: newSeconds % 60,
                    totalSeconds: newSeconds
                };
            } else if (interval.to >= startFromCorredor) {
                // Intervalo se solapa
                const beforeInterval = {
                    from: interval.from,
                    to: startFromCorredor - 1,
                    minutes: interval.minutes,
                    seconds: interval.seconds,
                    totalSeconds: interval.totalSeconds
                };
                
                const afterInterval = {
                    from: startFromCorredor,
                    to: interval.to,
                    minutes: Math.floor(newSeconds / 60),
                    seconds: newSeconds % 60,
                    totalSeconds: newSeconds
                };
                
                // Reemplazar el intervalo original
                appState.intervals.splice(i, 1, beforeInterval, afterInterval);
                i++; // Saltar el intervalo añadido
            }
        }
        
        // Ordenar y fusionar
        appState.intervals.sort((a, b) => a.from - b.from);
        
        const mergedIntervals = [];
        for (let i = 0; i < appState.intervals.length; i++) {
            if (mergedIntervals.length === 0) {
                mergedIntervals.push({...appState.intervals[i]});
            } else {
                const lastInterval = mergedIntervals[mergedIntervals.length - 1];
                const currentInterval = appState.intervals[i];
                
                if (lastInterval.to + 1 === currentInterval.from && 
                    lastInterval.totalSeconds === currentInterval.totalSeconds) {
                    lastInterval.to = currentInterval.to;
                } else {
                    mergedIntervals.push({...currentInterval});
                }
            }
        }
        
        appState.intervals = mergedIntervals;
    }
    
    // Guardar configuración single
    intervalConfig.singleMode = {
        minutes: Math.floor(newSeconds / 60),
        seconds: newSeconds % 60,
        saved: true
    };
    saveIntervalConfig();
    
    // Actualizar el display inferior izquierdo
    setTimeout(() => {
        updateNextCorredorDisplay();
    }, 100);
    
    console.log("Intervalos después de actualización single para futuros:", appState.intervals);
}
    
// ============================================
// FUNCIONES DE CONFIGURACIÓN
// ============================================

function createNewRace() {
    const t = translations[appState.currentLanguage];
    
    const name = document.getElementById('new-race-name').value.trim();
    if (!name) {
        showMessage(t.enterRaceName, 'error');
        return;
    }
    
    const description = document.getElementById('new-race-description').value.trim();
    
    const newRace = {
        id: Date.now(),
        name: name,
        description: description,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        cadenceMode: 'single',
        departures: [],
        intervals: []
    };
    
    appState.races.push(newRace);
    appState.currentRace = newRace;
    
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.intervals = [];
    appState.isVariableMode = false;
    
    switchToSingleMode();
    
    document.getElementById('departed-count').textContent = 0;
    document.getElementById('start-position').value = 1;
    renderDeparturesList();
    
    saveRacesToStorage();
    renderRacesSelect();
    
    document.getElementById('new-race-modal').classList.remove('active');
    document.getElementById('new-race-name').value = '';
    document.getElementById('new-race-description').value = '';
    
    showMessage(t.raceCreated, 'success');
    
    console.log("Nueva carrera creada:", name, "Modo:", 'single');
}
        
function deleteCurrentRace() {
    if (!appState.currentRace) return;
    
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex !== -1) {
        appState.races.splice(raceIndex, 1);
        appState.currentRace = null;
        
        if (appState.countdownActive) {
            stopCountdown();
            document.getElementById('countdown-screen').classList.remove('active');
            document.querySelectorAll('.hide-on-countdown').forEach(el => {
                el.style.display = '';
            });
        }
        
        appState.departureTimes = [];
        appState.departedCount = 0;
        appState.intervals = [];
        appState.isVariableMode = false;
        
        document.getElementById('start-position').value = 1;
        document.getElementById('departed-count').textContent = 0;
        
        document.getElementById('single-interval-config').style.display = 'block';
        document.getElementById('variable-interval-config').style.display = 'none';
        document.getElementById('same-interval-btn').classList.add('active');
        document.getElementById('variable-interval-btn').classList.remove('active');
        
        saveRacesToStorage();
        renderRacesSelect();
        renderDeparturesList();
        
        document.getElementById('delete-race-modal').classList.remove('active');
        
        showMessage(translations[appState.currentLanguage].raceDeleted, 'success');
    }
}    
        
function addVariableInterval() {
    const t = translations[appState.currentLanguage];
    
    const from = parseInt(document.getElementById('from-corredor').value) || 1;
    const to = parseInt(document.getElementById('to-corredor').value) || 10;
    const minutes = parseInt(document.getElementById('var-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('var-seconds').value) || 0;
    
    if (from > to) {
        showMessage(t.fromMustBeLessThanTo, 'error');
        return;
    }
    
    if (minutes === 0 && seconds === 0) {
        showMessage(t.enterValidTimeValue, 'error');
        return;
    }
    
    for (const interval of appState.intervals) {
        if ((from >= interval.from && from <= interval.to) ||
            (to >= interval.from && to <= interval.to) ||
            (from <= interval.from && to >= interval.to)) {
            showMessage(`${t.intervalOverlaps} ${interval.from}-${interval.to}`, 'error');
            return;
        }
    }
    
    const totalSeconds = minutes * 60 + seconds;
    
    const newInterval = {
        from: from,
        to: to,
        minutes: minutes,
        seconds: seconds,
        totalSeconds: totalSeconds
    };
    
    appState.intervals.push(newInterval);
    
    appState.intervals.sort((a, b) => a.from - b.from);
    
    renderIntervalsList();
    
    if (appState.currentRace) {
        appState.currentRace.cadenceMode = 'variable';
        appState.currentRace.intervals = [...appState.intervals];
        saveRaceData();
    }
    
    intervalConfig.variableMode = {
        intervals: [...appState.intervals],
        saved: true
    };
    saveIntervalConfig();
    
    document.getElementById('from-corredor').value = to + 1;
    document.getElementById('to-corredor').value = to + 10;
    document.getElementById('var-minutes').value = 1;
    document.getElementById('var-seconds').value = 0;

    // Refrescar botones
    setTimeout(() => {
        refreshIntervalButtons();
    }, 100);
    
    showMessage(t.intervalAdded, 'success');
}

function renderIntervalsList() {
    const container = document.getElementById('intervals-list');
    container.innerHTML = '';
    
    const sortedIntervals = [...appState.intervals].sort((a, b) => a.from - b.from);
    
    sortedIntervals.forEach((interval, index) => {
        const row = document.createElement('div');
        row.className = 'interval-row';
        row.setAttribute('data-index', index);
        row.innerHTML = `
            <div class="interval-info">
                <div class="interval-range">
                    <strong>${interval.from} - ${interval.to}</strong>
                </div>
                <div class="interval-time">
                    <i class="fas fa-clock"></i> 
                    ${interval.minutes}min ${interval.seconds.toString().padStart(2, '0')}s
                </div>
            </div>
            <div class="interval-actions">
                <button class="btn btn-secondary btn-sm edit-interval-btn" 
                        data-index="${index}" 
                        title="Editar este tramo"
                        onclick="event.stopPropagation();">
                    <i class="fas fa-edit"></i>
                    <span class="btn-text">Editar</span>
                </button>
                <button class="btn btn-danger btn-sm remove-interval-btn" 
                        data-index="${index}" 
                        title="Eliminar este tramo"
                        onclick="event.stopPropagation();">
                    <i class="fas fa-trash"></i>
                    <span class="btn-text">Eliminar</span>
                </button>
            </div>
        `;
        updateIntervalCount();

        // Refrescar botones después de renderizar
        setTimeout(() => {
            refreshIntervalButtons();
        }, 100);
        container.appendChild(row);
    });
    
    if (appState.intervals.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        emptyMessage.innerHTML = `
            <i class="fas fa-plus-circle" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px;"></i>
            <p style="color: var(--gray); font-style: italic;">
                No hay tramos configurados. Añade el primer tramo usando el formulario superior.
            </p>
        `;
        container.appendChild(emptyMessage);
    }
    
    updateIntervalCount();
}    


function setupEditIntervalModalEvents() {
    console.log("Configurando eventos del modal de edición...");
    
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'save-edit-interval-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log("Botón Guardar Cambios clickeado");
            saveEditedInterval();
        }
        
        if (e.target && e.target.id === 'cancel-edit-interval-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log("Botón Cancelar clickeado");
            cancelEditInterval();
        }
        
        if (e.target && e.target.id === 'edit-interval-modal-close') {
            e.preventDefault();
            e.stopPropagation();
            console.log("Botón Cerrar modal clickeado");
            cancelEditInterval();
        }
    });
    
    document.getElementById('edit-interval-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('edit-interval-modal')) {
            cancelEditInterval();
        }
    });
    
    document.getElementById('edit-interval-form').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    document.getElementById('edit-interval-form').addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Formulario de edición enviado");
        saveEditedInterval();
    });
    
    const saveBtn = document.getElementById('save-edit-interval-btn');
    const cancelBtn = document.getElementById('cancel-edit-interval-btn');
    const closeBtn = document.getElementById('edit-interval-modal-close');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            saveEditedInterval();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cancelEditInterval();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cancelEditInterval();
        });
    }
}

function setupIntervalsEvents() {
    console.log("Configurando eventos de intervalos...");
    
    // Delegación de eventos más segura con verificación específica
    document.addEventListener('click', function(e) {
        // Verificar primero si estamos en el contenedor de notas
        const isInNotesContainer = e.target.closest('.notes-edit-container');
        const isNotesButton = e.target.closest('.save-notes-btn') || e.target.closest('.cancel-notes-btn');
        const isNotesInput = e.target.closest('.departure-notes-input');
        
        // Si estamos en el área de notas, NO procesar eventos de intervalos
        if (isInNotesContainer || isNotesButton || isNotesInput) {
            console.log("Evento en área de notas - ignorando eventos de intervalos");
            return;
        }
        
        // Verificar si es botón de eliminar intervalo
        const deleteButton = e.target.closest('.remove-interval-btn');
        if (deleteButton) {
            console.log("Botón ELIMINAR detectado (después de verificación de notas)");
            e.preventDefault();
            e.stopPropagation();
            
            const index = parseInt(deleteButton.getAttribute('data-index'));
            console.log("Índice del intervalo a eliminar:", index);
            
            if (!isNaN(index) && index >= 0 && index < appState.intervals.length) {
                console.log("Procesando eliminación para índice:", index);
                
                const interval = appState.intervals[index];
                const t = translations[appState.currentLanguage];
                const confirmMessage = t.confirmDeleteInterval.replace('{from}', interval.from).replace('{to}', interval.to);
                
                if (confirm(confirmMessage)) {
                    appState.intervals.splice(index, 1);
                    
                    renderIntervalsList();
                    
                    intervalConfig.variableMode = {
                        intervals: [...appState.intervals],
                        saved: true
                    };
                    saveIntervalConfig();
                    
                    if (appState.currentRace) {
                        appState.currentRace.intervals = [...appState.intervals];
                        saveRaceData();
                    }
                    
                    if (appState.countdownActive) {
                        updateCurrentInterval();
                        saveAppState();
                    }
                    
                    showMessage(t.intervalDeleted, 'success');
                    console.log("Intervalo eliminado. Total restante:", appState.intervals.length);
                }
            } else {
                console.error("Índice inválido:", index);
            }
            return false;
        }
        
        // Verificar si es botón de editar
        const editButton = e.target.closest('.edit-interval-btn');
        if (editButton) {
            console.log("Botón EDITAR detectado (después de verificación de notas)");
            e.preventDefault();
            e.stopPropagation();
            
            const index = parseInt(editButton.getAttribute('data-index'));
            console.log("Índice del intervalo a editar:", index);
            
            if (!isNaN(index) && index >= 0 && index < appState.intervals.length) {
                console.log("Abriendo modal para editar intervalo:", index);
                openEditIntervalModal(index);
            } else {
                console.error("Índice inválido para editar:", index);
            }
            return false;
        }
    });
    
    // Doble clic en la fila para editar (solo si no es en notas)
    document.addEventListener('dblclick', function(e) {
        // Verificar si estamos en el área de notas
        const isInNotesContainer = e.target.closest('.notes-edit-container');
        const isNotesButton = e.target.closest('.save-notes-btn') || e.target.closest('.cancel-notes-btn');
        const isNotesInput = e.target.closest('.departure-notes-input');
        
        if (isInNotesContainer || isNotesButton || isNotesInput) {
            console.log("Doble clic en área de notas - ignorando");
            return;
        }
        
        const row = e.target.closest('.interval-row');
        if (row && !e.target.closest('button')) {
            e.preventDefault();
            e.stopPropagation();
            
            const index = parseInt(row.getAttribute('data-index'));
            
            if (!isNaN(index) && index >= 0 && index < appState.intervals.length) {
                console.log("DOBLE CLIC en fila para editar intervalo:", index);
                openEditIntervalModal(index);
            }
        }
    });
    
    console.log("Eventos de intervalos configurados correctamente");
}        

function updateIntervalCount() {
    const count = appState.intervals.length;
    console.log("Total de intervalos configurados:", count);
}

function sendSuggestion() {
    const t = translations[appState.currentLanguage];
    
    const email = document.getElementById('suggestion-email').value.trim();
    const text = document.getElementById('suggestion-text').value.trim();
    
    if (!text) {
        showMessage(t.suggestionTextLabel, 'error');
        return;
    }
    
    console.log('Sugerencia enviada:', { email, text });
    
    document.getElementById('suggestions-modal').classList.remove('active');
    document.getElementById('suggestion-email').value = '';
    document.getElementById('suggestion-text').value = '';
    
    showMessage(t.suggestionSent, 'success');
}

// ============================================
// UTILIDADES
// ============================================

function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function saveLastUpdate() {
    localStorage.setItem('countdown-last-update', Date.now().toString());
}

// ============================================
// CONFIGURACIÓN MEJORADA DE INTERVALOS
// ============================================

const intervalConfig = {
    singleMode: {
        minutes: 1,
        seconds: 0,
        saved: false
    },
    variableMode: {
        intervals: [],
        saved: false
    }
};

function loadIntervalConfig() {
    const savedConfig = localStorage.getItem('countdown-interval-config');
    
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            
            if (config.singleMode) {
                intervalConfig.singleMode = config.singleMode;
            }
            
            if (config.variableMode) {
                intervalConfig.variableMode = config.variableMode;
            }
        } catch (e) {
            console.error("Error cargando configuración:", e);
        }
    }
}

function saveIntervalConfig() {
    localStorage.setItem('countdown-interval-config', JSON.stringify(intervalConfig));
}

function switchToSingleMode() {
    if (document.getElementById('variable-interval-config').style.display !== 'none') {
        if (appState.currentRace) {
            appState.currentRace.intervals = [...appState.intervals];
            appState.currentRace.cadenceMode = 'variable';
            saveRaceData();
        }
        
        intervalConfig.variableMode = {
            intervals: [...appState.intervals],
            saved: true
        };
        saveIntervalConfig();
    }
    
    document.getElementById('interval-minutes').value = intervalConfig.singleMode.minutes;
    document.getElementById('interval-seconds').value = intervalConfig.singleMode.seconds;
    
    document.getElementById('single-interval-config').style.display = 'block';
    document.getElementById('variable-interval-config').style.display = 'none';
    
    document.getElementById('same-interval-btn').classList.add('active');
    document.getElementById('variable-interval-btn').classList.remove('active');
    
    const totalSeconds = intervalConfig.singleMode.minutes * 60 + intervalConfig.singleMode.seconds;
    
    appState.isVariableMode = false;
    
    if (appState.currentRace) {
        appState.currentRace.cadenceMode = 'single';
        if (appState.intervals.length > 0) {
            appState.currentRace.intervals = [...appState.intervals];
        } else {
            appState.currentRace.intervals = [];
        }
        saveRaceData();
    }
    
    appState.nextCorredorTime = totalSeconds;
    updateNextCorredorDisplay();
    
    console.log("Modo single activado. Intervalos:", appState.intervals.length);
}

function switchToVariableMode() {
    const currentMinutes = parseInt(document.getElementById('interval-minutes').value) || 0;
    const currentSeconds = parseInt(document.getElementById('interval-seconds').value) || 0;
    
    intervalConfig.singleMode = {
        minutes: currentMinutes,
        seconds: currentSeconds,
        saved: true
    };
    saveIntervalConfig();
    
    document.getElementById('single-interval-config').style.display = 'none';
    document.getElementById('variable-interval-config').style.display = 'block';
    
    document.getElementById('same-interval-btn').classList.remove('active');
    document.getElementById('variable-interval-btn').classList.add('active');
    
    appState.isVariableMode = true;
    
    if (appState.currentRace && appState.currentRace.intervals && appState.currentRace.intervals.length > 0) {
        appState.intervals = [...appState.currentRace.intervals];
        renderIntervalsList();
    } else if (intervalConfig.variableMode.saved && intervalConfig.variableMode.intervals.length > 0) {
        appState.intervals = [...intervalConfig.variableMode.intervals];
        renderIntervalsList();
        
        if (appState.currentRace) {
            appState.currentRace.cadenceMode = 'variable';
            appState.currentRace.intervals = [...appState.intervals];
            saveRaceData();
        }
    } else {
        appState.intervals = [];
        renderIntervalsList();
    }
    
    console.log("Modo variable activado. Intervalos:", appState.intervals.length);
}   

function setupEditIntervalModalEvents() {
    console.log("Configurando eventos del modal de edición...");
    
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'save-edit-interval-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log("Botón Guardar Cambios clickeado");
            saveEditedInterval();
        }
        
        if (e.target && e.target.id === 'cancel-edit-interval-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log("Botón Cancelar clickeado");
            cancelEditInterval();
        }
        
        if (e.target && e.target.id === 'edit-interval-modal-close') {
            e.preventDefault();
            e.stopPropagation();
            console.log("Botón Cerrar modal clickeado");
            cancelEditInterval();
        }
    });
    
    document.getElementById('edit-interval-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('edit-interval-modal')) {
            cancelEditInterval();
        }
    });
    
    document.getElementById('edit-interval-form').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    document.querySelectorAll('.edit-interval-input').forEach(input => {
        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    
    document.getElementById('edit-interval-form').addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Formulario de edición enviado");
        saveEditedInterval();
    });
    
    const saveBtn = document.getElementById('save-edit-interval-btn');
    const cancelBtn = document.getElementById('cancel-edit-interval-btn');
    const closeBtn = document.getElementById('edit-interval-modal-close');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            saveEditedInterval();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cancelEditInterval();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cancelEditInterval();
        });
    }
}

// ============================================
// EVENT LISTENERS - FUNCIÓN CORREGIDA
// ============================================

function setupEventListeners() {
    console.log("Configurando event listeners...");
    
    document.querySelectorAll('.flag').forEach(flag => {
        flag.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            appState.currentLanguage = lang;
            localStorage.setItem('countdown-language', lang);
            updateLanguageUI();      // Actualiza toda la interfaz
            updateSalidaText();      // Actualiza específicamente el texto "SALIDA"
            console.log(`Idioma cambiado a: ${lang}`);
        });
    });
    document.getElementById('exit-complete-btn').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.add('active');
    });

    document.getElementById('restart-modal-close').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.remove('active');
    });

    document.getElementById('restart-cancel-btn').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.remove('active');
    });

    // En setupEventListeners(), modificar el evento del botón de reinicio:
    document.getElementById('restart-confirm-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        
        if (appState.countdownActive) {
            stopCountdown();
            document.getElementById('countdown-screen').classList.remove('active');
            document.querySelectorAll('.hide-on-countdown').forEach(el => {
                el.style.display = '';
            });
        }
        
        // RESET COMPLETO - AÑADIR ESTAS LÍNEAS:
        appState.departedCount = 0;
        appState.departureTimes = [];
        
        if (appState.currentRace) {
            appState.currentRace.departures = [];
            saveRaceData();
        }
        
        appState.nextCorredorTime = 60;
        appState.currentIntervalIndex = 0;
        appState.accumulatedTime = 0;
        appState.raceStartTime = null;
        appState.countdownActive = false;
        appState.countdownPaused = false;
        
        document.getElementById('departed-count').textContent = '0';
        document.getElementById('start-position').value = 1;
        updateNextCorredorDisplay();
        
        renderDeparturesList(); // Esto mostrará la lista vacía
        document.getElementById('total-time-value').textContent = '00:00:00';
        
        localStorage.removeItem('countdown-app-state');
        
        document.getElementById('restart-confirm-modal').classList.remove('active');
        
        showMessage(t.sessionRestarted, 'success');
        console.log("Sesión reiniciada, TODOS los datos borrados");
    });


    document.getElementById('help-icon-header').addEventListener('click', function() {
        window.open('Crono_cuenta_atras_ayuda.html', '_blank');
    });

    document.getElementById('footer-help-btn').addEventListener('click', function() {
        window.open('Crono_cuenta_atras_ayuda.html', '_blank');
    });
    
    document.getElementById('help-modal-close').addEventListener('click', () => {
        document.getElementById('help-modal').classList.remove('active');
    });
    
    document.getElementById('help-modal-ok').addEventListener('click', () => {
        document.getElementById('help-modal').classList.remove('active');
    });
    
    document.getElementById('delete-race-modal-close').addEventListener('click', () => {
        document.getElementById('delete-race-modal').classList.remove('active');
    });
    
    document.getElementById('delete-race-cancel-btn').addEventListener('click', () => {
        document.getElementById('delete-race-modal').classList.remove('active');
    });
    
    document.getElementById('clear-departures-modal-close').addEventListener('click', () => {
        document.getElementById('clear-departures-modal').classList.remove('active');
    });
    
    document.getElementById('clear-departures-cancel-btn').addEventListener('click', () => {
        document.getElementById('clear-departures-modal').classList.remove('active');
    });
    
    document.getElementById('suggestions-modal-close').addEventListener('click', () => {
        document.getElementById('suggestions-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-suggestion-btn').addEventListener('click', () => {
        document.getElementById('suggestions-modal').classList.remove('active');
    });
    
    document.getElementById('new-race-modal-close').addEventListener('click', () => {
        document.getElementById('new-race-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-create-race-btn').addEventListener('click', () => {
        document.getElementById('new-race-modal').classList.remove('active');
    });
    
    document.getElementById('config-during-countdown-close').addEventListener('click', () => {
        document.getElementById('config-during-countdown-modal').classList.remove('active');
        resumeCountdownVisual();
    });
    
    document.getElementById('resume-countdown-btn').addEventListener('click', () => {
        document.getElementById('config-during-countdown-modal').classList.remove('active');
        resumeCountdownVisual();
    });
    
    document.getElementById('stop-countdown-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        stopCountdown();
        document.getElementById('countdown-screen').classList.remove('active');
        document.querySelectorAll('.hide-on-countdown').forEach(el => {
            el.style.display = '';
        });
        document.getElementById('config-during-countdown-modal').classList.remove('active');
        showMessage(t.countdownStopped, 'info');
    });
    
    document.getElementById('adjust-times-btn').addEventListener('click', () => {
        document.getElementById('config-during-countdown-modal').classList.remove('active');
        document.getElementById('adjust-times-modal').classList.add('active');
        
        document.getElementById('adjust-next-time').value = appState.nextCorredorTime;
        document.getElementById('adjust-departed').value = appState.departedCount;
        // Eliminar esta línea:
        // document.getElementById('adjust-current-time').value = appState.countdownValue;
    });

    document.getElementById('adjust-times-close').addEventListener('click', () => {
        document.getElementById('adjust-times-modal').classList.remove('active');
        resumeCountdownVisual();
    });
    
    document.getElementById('cancel-adjustments-btn').addEventListener('click', () => {
        document.getElementById('adjust-times-modal').classList.remove('active');
        resumeCountdownVisual();
    });
    
    document.getElementById('save-adjustments-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        
        const newNextTime = parseInt(document.getElementById('adjust-next-time').value) || 60;
        const newDeparted = parseInt(document.getElementById('adjust-departed').value) || 0;
        
        if (newNextTime <= 0 || newDeparted < 0) {
            showMessage(t.invalidValues, 'error');
            return;
        }
        
        // Solo cambiar el tiempo para futuros corredores
        // El tiempo actual NO se modifica
        appState.departedCount = newDeparted;
        
        // Aplicar nuevo tiempo desde el SIGUIENTE corredor
        const currentCorredor = appState.departedCount + 1; // Corredor actual en cuenta atrás
        const startFromCorredor = currentCorredor + 1; // Aplicar desde el siguiente
        
        if (appState.isVariableMode) {
            updateFutureIntervals(startFromCorredor, newNextTime);
        } else {
            updateSingleIntervalForFuture(startFromCorredor, newNextTime);
        }
        
        document.getElementById('start-position').value = newDeparted + 1;
        
        // ACTUALIZAR EL DISPLAY INFERIOR IZQUIERDO (Próximo sale a)
        const displayElement = document.getElementById('next-corredor-time');
        if (displayElement) {
            if (newNextTime >= 60) {
                const minutes = Math.floor(newNextTime / 60);
                const seconds = newNextTime % 60;
                displayElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                displayElement.textContent = newNextTime + "s";
            }
        }
        
        updateCurrentInterval(); // Actualizar el intervalo actual
        updateNextCorredorDisplay();
        document.getElementById('departed-count').textContent = newDeparted;
        updateCountdownDisplay();
        
        document.getElementById('adjust-times-modal').classList.remove('active');
        resumeCountdownVisual();
        saveAppState();
        
        const message = t.adjustmentsSaved
            .replace('{seconds}', newNextTime)
            .replace('{corredor}', startFromCorredor);
        showMessage(message, 'success');
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (modal.id === 'config-during-countdown-modal' || 
                    modal.id === 'adjust-times-modal') {
                    resumeCountdownVisual();
                }
            }
        });
    });
    
    document.getElementById('race-select').addEventListener('change', function() {
        const index = parseInt(this.value);
        if (index >= 0 && index < appState.races.length) {
            if (appState.currentRace) {
                saveRaceData();
            }
            
            appState.currentRace = appState.races[index];
            
            loadRaceData();
            
            saveRacesToStorage();
            
            console.log("Cambiada a carrera:", appState.currentRace.name);
            console.log("Modo:", appState.currentRace.cadenceMode || 'single');
            console.log("Salidas:", appState.departureTimes.length);
            console.log("Intervalos:", appState.intervals.length);
        } else {
            appState.currentRace = null;
            appState.departureTimes = [];
            appState.departedCount = 0;
            appState.intervals = [];
            appState.isVariableMode = false;
            
            document.getElementById('departed-count').textContent = 0;
            document.getElementById('start-position').value = 1;
            renderDeparturesList();
            
            document.getElementById('single-interval-config').style.display = 'block';
            document.getElementById('variable-interval-config').style.display = 'none';
            document.getElementById('same-interval-btn').classList.add('active');
            document.getElementById('variable-interval-btn').classList.remove('active');
        }
    });          
    document.getElementById('new-race-btn').addEventListener('click', () => {
        document.getElementById('new-race-modal').classList.add('active');
        document.getElementById('new-race-name').focus();
    });
    
    document.getElementById('create-race-btn').addEventListener('click', createNewRace);
    
    document.getElementById('delete-race-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        if (!appState.currentRace) {
            showMessage(t.selectRaceFirst, 'error');
            return;
        }
        document.getElementById('delete-race-modal').classList.add('active');
    });
    
    document.getElementById('delete-race-confirm-btn').addEventListener('click', () => {
        deleteCurrentRace();
    });

    document.getElementById('same-interval-btn').addEventListener('click', function() {
        switchToSingleMode();
        if (appState.currentRace) {
            saveRaceData();
        }
    });
    document.getElementById('variable-interval-btn').addEventListener('click', function() {
        switchToVariableMode();
        if (appState.currentRace) {
            saveRaceData();
        }
    });
    document.getElementById('add-interval-btn').addEventListener('click', addVariableInterval);
    
    document.getElementById('start-position').addEventListener('change', function() {
        const position = parseInt(this.value) || 1;
        appState.departedCount = Math.max(0, position - 1);
        document.getElementById('departed-count').textContent = appState.departedCount;
        updateCurrentInterval();
        saveAppState();
        console.log("Posición actualizada:", position, "Salidos:", appState.departedCount);
    });
    
    document.getElementById('start-position').addEventListener('blur', function() {
        const position = parseInt(this.value) || 1;
        appState.departedCount = Math.max(0, position - 1);
        document.getElementById('departed-count').textContent = appState.departedCount;
        updateCurrentInterval();
        saveAppState();
    });
    
    document.getElementById('clear-departures-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        if (appState.departureTimes.length === 0) {
            showMessage(t.listAlreadyEmpty, 'info');
            return;
        }
        document.getElementById('clear-departures-modal').classList.add('active');
    });
    
    document.getElementById('clear-departures-confirm-btn').addEventListener('click', () => {
        clearRaceDepartures();
        document.getElementById('clear-departures-modal').classList.remove('active');
    });
    
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    
    document.getElementById('start-countdown-btn').addEventListener('click', startCountdown);
    
    document.getElementById('config-toggle').addEventListener('click', function(e) {
        e.stopPropagation();
        
        const t = translations[appState.currentLanguage];
        
        // VALIDACIÓN AÑADIDA:
        if (appState.countdownActive && appState.countdownValue <= 12) {
            showMessage(t.waitCountdownEnd, 'warning');
            return;
        }
        
        if (appState.countdownActive && !appState.configModalOpen) {
            pauseCountdownVisual();
            document.getElementById('config-during-countdown-modal').classList.add('active');
        }
    });

    document.getElementById('config-toggle').addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (appState.countdownActive && !appState.configModalOpen) {
            pauseCountdownVisual();
            document.getElementById('config-during-countdown-modal').classList.add('active');
        }
    });


    document.getElementById('next-corredor-time').addEventListener('dblclick', function(e) {
        e.stopPropagation();

        if (!canModifyDuringCountdown()) {
            return;
        }

        const t = translations[appState.currentLanguage];

        // Si la cuenta atrás no está activa, no permitir editar
        if (!appState.countdownActive) {
            showMessage(t.countdownNotActive, 'warning');
            return;
        }
        
        const currentText = this.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'inline-edit-input';
        input.value = currentText;
        input.placeholder = 'Ej: 1:30 o 90';
        
        this.innerHTML = '';
        this.appendChild(input);
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const value = input.value.trim();
            let seconds = 0;
            
            // Parsear el valor ingresado
            if (value.includes(':')) {
                const parts = value.split(':');
                const mins = parseInt(parts[0]) || 0;
                const secs = parseInt(parts[1]) || 0;
                seconds = mins * 60 + secs;
            } else if (value.toLowerCase().includes('min')) {
                const mins = parseInt(value) || 0;
                seconds = mins * 60;
            } else {
                seconds = parseInt(value) || 0;
            }
            
            if (seconds <= 0) {
                showMessage(t.enterValidTime, 'error');
                this.textContent = currentText;
                return;
            }
            
            // CORRECCIÓN: NO modificar appState.nextCorredorTime directamente
            // porque eso afectaría al corredor actual
            
            // El corredor actual es: departedCount + 1 (el que está en cuenta atrás)
            const currentCorredor = appState.departedCount + 1;
            
            // El nuevo tiempo debe aplicarse desde el SIGUIENTE corredor
            const startFromCorredor = currentCorredor + 1;
            
            console.log(`Corredor actual: ${currentCorredor}, Aplicar desde: ${startFromCorredor}`);
            
            // ACTUALIZAR INTERVALOS FUTUROS (NO el actual)
            if (appState.isVariableMode) {
                // En modo variable, modificar intervalos futuros
                updateFutureIntervals(startFromCorredor, seconds);
            } else {
                // En modo single, crear un nuevo intervalo desde el siguiente corredor
                updateSingleIntervalForFuture(startFromCorredor, seconds);
            }
            
            // IMPORTANTE: NO cambiar appState.nextCorredorTime
            // porque eso cambiaría el tiempo del corredor actual
            
            // Solo actualizar el display para mostrar el nuevo tiempo futuro
            // Pero mantener el tiempo actual intacto
            const displayText = seconds >= 60 ? 
                `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}` : 
                seconds + "s";
            
            this.textContent = displayText;
            
            // Guardar cambios
            saveAppState();
            if (appState.currentRace) {
                saveRaceData();
            }
            
            // Mostrar mensaje informativo
            const message = t.timeUpdated
                .replace('{seconds}', seconds)
                .replace('{corredor}', startFromCorredor);
            showMessage(message, 'success');
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });
    });
    
    
    document.getElementById('departed-count').addEventListener('dblclick', function(e) {
        e.stopPropagation();
        if (!canModifyDuringCountdown()) {
            return;
        }
        
        const currentValue = parseInt(this.textContent) || 0;
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'inline-edit-input';
        input.value = currentValue;
        input.min = 0;
        
        this.innerHTML = '';
        this.appendChild(input);
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const newValue = parseInt(input.value) || 0;
            appState.departedCount = newValue;
            document.getElementById('start-position').value = newValue + 1;
            this.textContent = newValue;
            updateCurrentInterval();
            saveAppState();
            renderDeparturesList();
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });
    });
    
    document.getElementById('suggestions-btn').addEventListener('click', () => {
        document.getElementById('suggestions-modal').classList.add('active');
        document.getElementById('suggestion-text').focus();
    });
    
    document.getElementById('send-suggestion-btn').addEventListener('click', sendSuggestion);
    
    document.getElementById('install-btn').addEventListener('click', installPWA);
    
    document.getElementById('update-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update();
                showMessage(t.updateChecked, 'info');
            });
        }
    });
    
    document.getElementById('interval-minutes').addEventListener('change', function() {
        intervalConfig.singleMode.minutes = parseInt(this.value) || 0;
        saveIntervalConfig();
        updateCadenceTime();
    });

    document.getElementById('interval-seconds').addEventListener('change', function() {
        intervalConfig.singleMode.seconds = parseInt(this.value) || 0;
        saveIntervalConfig();
        updateCadenceTime();
    });
    
    
    document.getElementById('adjust-next-time').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.getElementById('adjust-departed').addEventListener('click', function(e) {
        e.stopPropagation();
    });

}
        
// ============================================
// FUNCIONES DE MANTENIMIENTO DE PANTALLA
// ============================================

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('https://rbenet71.github.io/Web/unified-sw.js', {scope: '/Web/'})
            .then(registration => {
                console.log('ServiceWorker registrado:', registration.scope);
                
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
            })
            .catch(error => {
                console.log('Error registrando ServiceWorker:', error);
            });
    }
}

function setupPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        appState.deferredPrompt = e;
        
        const installBtn = document.getElementById('install-btn');
        installBtn.style.display = 'flex';
    });
}

function installPWA() {
    if (appState.deferredPrompt) {
        appState.deferredPrompt.prompt();
        appState.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showMessage('Aplicación instalada', 'success');
            }
            appState.deferredPrompt = null;
        });
    }
}

function keepScreenAwake() {
    if (!appState.countdownActive) return;
    
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen')
            .then(wakeLock => {
                console.log('Wake Lock activado');
            })
            .catch(err => {
                console.log('Wake Lock no disponible:', err);
            });
    }
    
    const video = document.getElementById('keep-alive-video');
    if (video) {
        video.loop = true;
        video.play().catch(e => console.log('Video keep-alive falló:', e));
    }
    
    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
}

function adjustCountdownSize() {
    const display = document.getElementById('countdown-display');
    if (!display) return;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isAggressive = document.getElementById('countdown-screen').classList.contains('aggressive-numbers');
    
    let fontSize;
    const minDimension = Math.min(screenWidth, screenHeight);
    
    if (isAggressive) {
        if (minDimension < 400) {
            fontSize = minDimension * 0.35;
        } else if (minDimension < 768) {
            fontSize = minDimension * 0.30;
        } else if (minDimension < 1024) {
            fontSize = minDimension * 0.25;
        } else {
            fontSize = minDimension * 0.20;
        }
    } else {
        if (minDimension < 400) {
            fontSize = minDimension * 0.30;
        } else if (minDimension < 768) {
            fontSize = minDimension * 0.25;
        } else if (minDimension < 1024) {
            fontSize = minDimension * 0.20;
        } else {
            fontSize = minDimension * 0.15;
        }
    }
    
    fontSize = Math.max(80, Math.min(fontSize, 500));
    display.style.fontSize = `${fontSize}px`;
    display.style.lineHeight = `${fontSize * 0.9}px`;
}

function adjustInfoCornersSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minDimension = Math.min(screenWidth, screenHeight);
    
    const infoCorners = document.querySelectorAll('.info-corner');
    infoCorners.forEach(corner => {
        if (minDimension < 400) {
            corner.style.maxWidth = '40vw';
        } else if (minDimension < 768) {
            corner.style.maxWidth = '35vw';
        } else if (minDimension < 1024) {
            corner.style.maxWidth = '30vw';
        } else {
            corner.style.maxWidth = '25vw';
        }
        
        if (minDimension < 400) {
            corner.style.padding = '0.6vw 1vw';
        } else if (minDimension < 768) {
            corner.style.padding = '0.7vw 1.1vw';
        } else {
            corner.style.padding = '0.8vw 1.2vw';
        }
    });
}

function setupCountdownResize() {
    window.addEventListener('load', function() {
        adjustCountdownSize();
        adjustInfoCornersSize();
    });
    window.addEventListener('resize', function() {
        adjustCountdownSize();
        adjustInfoCornersSize();
    });
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            adjustCountdownSize();
            adjustInfoCornersSize();
        }, 300);
    });
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', initApp);

window.addEventListener('beforeunload', () => {
    if (appState.countdownActive) {
        saveLastUpdate();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && appState.countdownActive && !appState.configModalOpen) {
        pauseCountdownVisual();
        document.getElementById('config-during-countdown-modal').classList.add('active');
    }
    
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('start-countdown-btn').click();
    }
});

// ============================================
// FUNCIÓN PARA ACTUALIZAR HORA ACTUAL
function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    
    // Actualizar en la pantalla de cuenta atrás (si existe)
    const countdownDisplay = document.getElementById('current-time-value');
    if (countdownDisplay) {
        countdownDisplay.textContent = timeStr;
    }
    
    // Actualizar encima del botón (si existe)
    const systemTimeDisplay = document.getElementById('current-system-time');
    if (systemTimeDisplay) {
        systemTimeDisplay.textContent = timeStr;
    }
}
updateCurrentTime()

let editingIntervalIndex = -1;

function openEditIntervalModal(index) {
    console.log("Abriendo modal de edición para índice:", index);
    
    const t = translations[appState.currentLanguage];
    
    if (index < 0 || index >= appState.intervals.length) {
        console.error("Índice inválido:", index);
        showMessage(t.noIntervalSelected, 'error');
        return;
    }
    
    const interval = appState.intervals[index];
    console.log("Intervalo a editar:", interval);
    
    editingIntervalIndex = index;
    
    document.getElementById('edit-from-corredor').value = interval.from;
    document.getElementById('edit-to-corredor').value = interval.to;
    document.getElementById('edit-interval-minutes').value = interval.minutes;
    document.getElementById('edit-interval-seconds').value = interval.seconds;
    
    document.getElementById('edit-interval-modal').classList.add('active');
    document.getElementById('edit-from-corredor').focus();
    
    console.log("Modal abierto correctamente");
}

function closeEditIntervalModal() {
    console.log("Cerrando modal de edición de intervalo");
    
    editingIntervalIndex = -1;
    
    document.getElementById('edit-from-corredor').value = '';
    document.getElementById('edit-to-corredor').value = '';
    document.getElementById('edit-interval-minutes').value = '';
    document.getElementById('edit-interval-seconds').value = '';
    
    document.getElementById('edit-interval-modal').classList.remove('active');
    
    console.log("Modal cerrado");
}

function saveEditedInterval() {
    console.log("saveEditedInterval iniciado, índice:", editingIntervalIndex);
    
    const t = translations[appState.currentLanguage];
    
    if (editingIntervalIndex < 0 || editingIntervalIndex >= appState.intervals.length) {
        console.error("No hay tramo seleccionado para editar");
        showMessage(t.noIntervalSelected, 'error');
        closeEditIntervalModal();
        return;
    }
    
    const from = parseInt(document.getElementById('edit-from-corredor').value) || 1;
    const to = parseInt(document.getElementById('edit-to-corredor').value) || 10;
    const minutes = parseInt(document.getElementById('edit-interval-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('edit-interval-seconds').value) || 0;
    
    console.log("Valores del formulario:", {from, to, minutes, seconds});
    
    if (from > to) {
        showMessage(t.fromMustBeLessThanTo, 'error');
        return;
    }
    
    if (minutes === 0 && seconds === 0) {
        showMessage(t.enterValidTimeValue, 'error');
        return;
    }
    
    for (let i = 0; i < appState.intervals.length; i++) {
        if (i === editingIntervalIndex) continue;
        
        const interval = appState.intervals[i];
        if ((from >= interval.from && from <= interval.to) ||
            (to >= interval.from && to <= interval.to) ||
            (from <= interval.from && to >= interval.to)) {
            showMessage(`${t.intervalOverlaps} ${interval.from}-${interval.to}`, 'error');
            return;
        }
    }
    
    const totalSeconds = minutes * 60 + seconds;
    
    const updatedInterval = {
        from: from,
        to: to,
        minutes: minutes,
        seconds: seconds,
        totalSeconds: totalSeconds
    };
    
    console.log("Intervalo actualizado:", updatedInterval);
    
    appState.intervals[editingIntervalIndex] = updatedInterval;
    
    appState.intervals.sort((a, b) => a.from - b.from);
    
    const newIndex = appState.intervals.findIndex(interval => 
        interval.from === from && interval.to === to && interval.totalSeconds === totalSeconds
    );
    
    console.log("Nuevo índice después de ordenar:", newIndex);
    
    renderIntervalsList();
    
    intervalConfig.variableMode = {
        intervals: [...appState.intervals],
        saved: true
    };
    saveIntervalConfig();
    
    if (appState.currentRace) {
        appState.currentRace.intervals = [...appState.intervals];
        saveRaceData();
    }
    
    if (appState.countdownActive) {
        updateCurrentInterval();
        saveAppState();
    }
    
    closeEditIntervalModal();
    showMessage(t.intervalUpdated, 'success');
    console.log("Intervalo guardado correctamente");
}

function cancelEditInterval() {
    console.log("Cancelando edición de intervalo");
    closeEditIntervalModal();
}

updateCurrentTime();