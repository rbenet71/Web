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
        timeUpdated: "Tiempo actualizado a {seconds}s para corredors desde {corredor} en adelante",
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
        countdownCriticalDesc: "Últims 5 segundos",
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
        intervalOverlaps: "Cet intervalle chevauche l'intervalle existent",
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
function preloadVoiceAudios() {
    console.log("Precargando audios de voz .ogg...");
    
    const languages = ['es', 'en', 'ca', 'fr'];
    const numbers = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    
    let loadedCount = 0;
    const totalToLoad = languages.length * numbers.length;
    
    languages.forEach(lang => {
        appState.voiceAudioCache[lang] = {};
        
        numbers.forEach(num => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = `audio/${lang}_${num}.ogg`;
            
            audio.addEventListener('canplaythrough', () => {
                appState.voiceAudioCache[lang][num] = audio;
                loadedCount++;
                console.log(`✅ Audio cargado: ${lang}_${num}.ogg (${loadedCount}/${totalToLoad})`);
                
                if (num === 0) {
                    console.log(`   (Este es el audio de SALIDA para ${lang})`);
                }
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`❌ ERROR cargando ${audio.src}:`, e.type);
                console.error("  Verifica que exista: audio/" + lang + "_" + num + ".ogg");
                
                if (num === 0) {
                    console.error("  IMPORTANTE: El archivo 0.ogg es para 'SALIDA'/'GO'/'DÉPART'");
                }
                
                loadedCount++;
            });
            
            audio.load();
        });
    });
    
    setTimeout(() => {
        console.log(`\n=== RESUMEN DE CARGA DE AUDIOS ===`);
        console.log(`Cargados: ${loadedCount}/${totalToLoad}`);
        
        languages.forEach(lang => {
            console.log(`\nIdioma: ${lang}`);
            const loadedNumbers = Object.keys(appState.voiceAudioCache[lang] || {}).length;
            console.log(`  Números cargados: ${loadedNumbers}/11`);
            
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
        
        if (appState.voiceAudioCache[lang] && appState.voiceAudioCache[lang][number]) {
            const audio = appState.voiceAudioCache[lang][number];
            audio.currentTime = 0;
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error reproduciendo audio precargado ${lang}_${number}:`, error);
                    loadAndPlayAudioDirectly(lang, number);
                });
            }
        } else {
            loadAndPlayAudioDirectly(lang, number);
        }
        
    } catch (error) {
        console.error("❌ Error crítico en playVoiceAudio:", error);
        generateBeep(500, 0.3, 'sine');
    }
}

function loadAndPlayAudioDirectly(lang, number) {
    console.log(`📥 Cargando directamente: ${lang}_${number}.ogg`);
    
    const audio = new Audio();
    audio.src = `audio/${lang}_${number}.ogg`;
    
    audio.play().then(() => {
        console.log(`✅ Audio reproducido directamente: ${lang}_${number}.ogg`);
    }).catch(error => {
        console.error(`❌ Error reproduciendo ${lang}_${number}.ogg:`, error);
        
        if (error.name === 'NotAllowedError') {
            console.error("  El usuario no ha interactuado con la página");
            console.error("  Haz clic en la página primero");
        } else if (error.name === 'NotFoundError') {
            console.error("  El archivo no se encuentra");
            console.error("  Verifica la ruta: " + audio.src);
        }
        
        generateBeep(500, 0.3, 'sine');
    });
}

function playSalidaVoice() {
    if (appState.audioType !== 'voice') return;
    
    console.log(`🔊 Reproduciendo SALIDA (${appState.currentLanguage}_0.ogg)`);
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

function fallbackVoiceAudio(number, lang) {
    console.log(`Usando fallback para: ${lang}_${number}`);
    
    const audio = new Audio();
    const formats = ['.mp3', '.ogg', '.wav'];
    
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
            return;
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
            case 'warning':
                if (appState.audioType === 'beep') {
                    generateBeep(300, 1.5, 'square');
                } else if (appState.audioType === 'voice') {
                    playVoiceAudio(10);
                }
                break;
                
            case 'critical':
                if (appState.audioType === 'beep') {
                    generateBeep(500, 0.3, 'sine');
                } else if (appState.audioType === 'voice') {
                    playVoiceAudio(5);
                }
                break;
                
            case 'salida':
                if (appState.audioType === 'beep') {
                    generateBeep(800, 1.5, 'sine');
                } else if (appState.audioType === 'voice') {
                    playVoiceAudio(0);
                }
                break;
                
            case 'beep':
                if (appState.audioType === 'beep') {
                    generateBeep(500, 0.3, 'sine');
                }
                break;
                
            case 'number':
                if (appState.audioType === 'voice' && appState.countdownValue >= 0) {
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
            playVoiceAudio(0);
        }, 9000);
        
        showMessage(`Probando voz en ${appState.currentLanguage}`, 'info');
    }
}

function checkAvailableAudioFiles() {
    console.log("=== VERIFICANDO ARCHIVOS DE AUDIO ===");
    
    const languages = ['es', 'en', 'ca', 'fr'];
    const testNumbers = [10, 5, 1];
    
    languages.forEach(lang => {
        console.log(`\n📁 Idioma: ${lang}`);
        
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

function selectAudioType(audioType) {
    appState.audioType = audioType;
    
    document.querySelectorAll('.audio-option').forEach(option => {
        option.classList.remove('active');
    });
    
    document.querySelector(`.audio-option[data-audio-type="${audioType}"]`).classList.add('active');
    
    localStorage.setItem('countdown-audio-type', audioType);
    
    console.log("Tipo de audio seleccionado:", audioType);
}

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
// CONFIGURACIÓN DE AUDIO
// ============================================
function setupAudioEventListeners() {
    document.querySelectorAll('.audio-option').forEach(option => {
        option.addEventListener('click', function() {
            const audioType = this.getAttribute('data-audio-type');
            selectAudioType(audioType);
        });
    });
    
    document.getElementById('test-audio-btn').addEventListener('click', testCurrentAudio);
}