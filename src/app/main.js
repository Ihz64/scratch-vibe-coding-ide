/**
 * Scratch Vibe Coding IDE - Main Application
 * Core application logic and initialization
 */

// ============================================
// Application State
// ============================================

const AppState = {
    // User Authentication
    user: null,
    isAuthenticated: false,
    
    // Current Project
    currentProject: null,
    currentProjectId: null,
    currentFile: null,
    currentFileId: null,
    
    // Editor State
    editor: null,
    openFiles: [],
    activeTab: null,
    
    // Runtime State
    isRunning: false,
    isPaused: false,
    isDebugging: false,
    
    // UI State
    sidebarVisible: true,
    previewVisible: true,
    debugConsoleVisible: false,
    commandPaletteVisible: false,
    
    // Settings
    settings: {
        theme: 'dark',
        fontSize: 14,
        tabSize: 4,
        autoSave: true,
        autoSaveInterval: 30,
        showMinimap: true,
        wordWrap: false,
        lineNumbers: true,
        autoComplete: true,
        autoCompile: false,
        strictMode: true,
        optimization: 'basic',
        previewScale: 1,
        showFPS: true,
        showDebug: false
    },
    
    // History
    history: [],
    historyIndex: -1
};

// ============================================
// Application Initialization
// ============================================

class ScratchVibeIDE {
    constructor() {
        this.init();
    }
    
    async init() {
        console.log('Initializing Scratch Vibe Coding IDE...');
        
        // Load settings
        await this.loadSettings();
        
        // Initialize Auth FIRST (before anything else)
        Auth.init();
        
        // Initialize Modals EARLY (so login modal is ready)
        if (typeof Modals !== 'undefined') {
            Modals.init();
        }
        
        // Initialize components
        this.initComponents();
        
        // Initialize editor
        this.initEditor();
        
        // Initialize runtime
        this.initRuntime();
        
        // Initialize event handlers
        this.initEvents();
        
        // Check authentication (this may open login modal)
        await this.checkAuth();
        
        // Load or create project
        await this.loadInitialProject();
        
        // Start autosave
        this.startAutosave();
        
        // Update UI
        this.updateUI();
        
        console.log('Scratch Vibe Coding IDE initialized!');
    }
    
    // ============================================
    // Component Initialization
    // ============================================
    
    initComponents() {
        // Initialize all components
        ProjectExplorer.init();
        Editor.init();
        Preview.init();
        StatusBar.init();
        Modals.init();
        Notifications.init();
        ContextMenu.init();
        Debugger.init();
        Settings.init();
        History.init();
        
        // Initialize command palette
        this.initCommandPalette();
    }
    
    initEditor() {
        // Initialize CodeMirror editor
        if (typeof CodeMirror !== 'undefined') {
            AppState.editor = CodeMirror(document.getElementById('codeEditor'), {
                mode: 'vibe',
                theme: 'dracula',
                lineNumbers: true,
                tabSize: AppState.settings.tabSize,
                indentUnit: AppState.settings.tabSize,
                indentWithTabs: false,
                lineWrapping: AppState.settings.wordWrap,
                autoCloseBrackets: true,
                matchBrackets: true,
                extraKeys: {
                    'Ctrl-S': () => this.saveProject(),
                    'Ctrl-Z': () => History.undo(),
                    'Ctrl-Y': () => History.redo(),
                    'Ctrl-F': () => Editor.search(),
                    'Ctrl-P': () => this.toggleCommandPalette(),
                    'Ctrl-,': () => Modals.openSettings(),
                    'F5': () => this.runProject(),
                    'F6': () => this.stopProject(),
                    'F7': () => this.toggleDebug()
                },
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                lint: true
            });
            
            // Set editor content
            AppState.editor.setValue('// Willkommen bei Scratch Vibe Coding!\n// Beginne mit dem Schreiben von Code...\n\nsprite Player\n  on green_flag:\n    go_to x: 0 y: 0\n    forever:\n      if key("right") pressed:\n        change x by 5\n      if key("left") pressed:\n        change x by -5');
            
            // Update editor settings
            this.updateEditorSettings();
            
            // Handle editor changes
            AppState.editor.on('change', (cm) => {
                this.handleEditorChange(cm);
            });
            
            AppState.editor.on('cursorActivity', (cm) => {
                this.updateCursorPosition(cm);
            });
        } else {
            console.warn('CodeMirror not loaded!');
            // Fallback to textarea
            const textarea = document.getElementById('codeEditor');
            textarea.style.display = 'block';
            textarea.value = '// CodeMirror nicht geladen. Bitte lade die Seite neu.';
        }
    }
    
    initRuntime() {
        // Initialize Scratch Runtime
        Runtime.init();
    }
    
    initCommandPalette() {
        // Command palette commands
        const commands = [
            {
                name: 'Neues Projekt',
                category: 'Projekt',
                action: () => Modals.openNewProject(),
                shortcut: 'Ctrl+N'
            },
            {
                name: 'Projekt öffnen',
                category: 'Projekt',
                action: () => Modals.openImport(),
                shortcut: 'Ctrl+O'
            },
            {
                name: 'Projekt speichern',
                category: 'Projekt',
                action: () => this.saveProject(),
                shortcut: 'Ctrl+S'
            },
            {
                name: 'Projekt exportieren',
                category: 'Projekt',
                action: () => Modals.openExport(),
                shortcut: 'Ctrl+E'
            },
            {
                name: 'Projekt beenden',
                category: 'Projekt',
                action: () => this.closeProject(),
                shortcut: 'Ctrl+W'
            },
            {
                name: 'Ausführen',
                category: 'Ausführung',
                action: () => this.runProject(),
                shortcut: 'F5'
            },
            {
                name: 'Stoppen',
                category: 'Ausführung',
                action: () => this.stopProject(),
                shortcut: 'F6'
            },
            {
                name: 'Pausieren',
                category: 'Ausführung',
                action: () => this.pauseProject(),
                shortcut: 'F7'
            },
            {
                name: 'Neu starten',
                category: 'Ausführung',
                action: () => this.restartProject(),
                shortcut: 'Ctrl+R'
            },
            {
                name: 'Debuggen',
                category: 'Ausführung',
                action: () => this.toggleDebug(),
                shortcut: 'F8'
            },
            {
                name: 'Rückgängig',
                category: 'Bearbeiten',
                action: () => History.undo(),
                shortcut: 'Ctrl+Z'
            },
            {
                name: 'Wiederholen',
                category: 'Bearbeiten',
                action: () => History.redo(),
                shortcut: 'Ctrl+Y'
            },
            {
                name: 'Ausschneiden',
                category: 'Bearbeiten',
                action: () => Editor.cut(),
                shortcut: 'Ctrl+X'
            },
            {
                name: 'Kopieren',
                category: 'Bearbeiten',
                action: () => Editor.copy(),
                shortcut: 'Ctrl+C'
            },
            {
                name: 'Einfügen',
                category: 'Bearbeiten',
                action: () => Editor.paste(),
                shortcut: 'Ctrl+V'
            },
            {
                name: 'Alles auswählen',
                category: 'Bearbeiten',
                action: () => Editor.selectAll(),
                shortcut: 'Ctrl+A'
            },
            {
                name: 'Suchen',
                category: 'Bearbeiten',
                action: () => Editor.search(),
                shortcut: 'Ctrl+F'
            },
            {
                name: 'Ersetzen',
                category: 'Bearbeiten',
                action: () => Editor.replace(),
                shortcut: 'Ctrl+H'
            },
            {
                name: 'Code formatieren',
                category: 'Bearbeiten',
                action: () => Editor.format(),
                shortcut: 'Ctrl+Shift+F'
            },
            {
                name: 'Einstellungen',
                category: 'Ansicht',
                action: () => Modals.openSettings(),
                shortcut: 'Ctrl+,'
            },
            {
                name: 'Sidebar umschalten',
                category: 'Ansicht',
                action: () => this.toggleSidebar(),
                shortcut: 'Ctrl+B'
            },
            {
                name: 'Preview umschalten',
                category: 'Ansicht',
                action: () => this.togglePreview(),
                shortcut: 'Ctrl+Shift+B'
            },
            {
                name: 'Debug-Konsole',
                category: 'Ansicht',
                action: () => this.toggleDebugConsole(),
                shortcut: 'Ctrl+Shift+D'
            },
            {
                name: 'Vollbild',
                category: 'Ansicht',
                action: () => Preview.toggleFullscreen(),
                shortcut: 'F11'
            },
            {
                name: 'Hilfe',
                category: 'Hilfe',
                action: () => this.showHelp(),
                shortcut: 'F1'
            },
            {
                name: 'Dokumentation',
                category: 'Hilfe',
                action: () => this.showDocumentation(),
                shortcut: ''
            },
            {
                name: 'Über',
                category: 'Hilfe',
                action: () => this.showAbout(),
                shortcut: ''
            }
        ];
        
        // Store commands for command palette
        window.VibeCommands = commands;
    }
    
    // ============================================
    // Event Initialization
    // ============================================
    
    initEvents() {
        // Header buttons
        document.getElementById('btnSave').addEventListener('click', () => this.saveProject());
        document.getElementById('btnUndo').addEventListener('click', () => History.undo());
        document.getElementById('btnRedo').addEventListener('click', () => History.redo());
        document.getElementById('btnRun').addEventListener('click', () => this.runProject());
        document.getElementById('btnStop').addEventListener('click', () => this.stopProject());
        document.getElementById('btnPause').addEventListener('click', () => this.pauseProject());
        document.getElementById('btnRestart').addEventListener('click', () => this.restartProject());
        document.getElementById('btnDebug').addEventListener('click', () => this.toggleDebug());
        document.getElementById('btnExport').addEventListener('click', () => Modals.openExport());
        document.getElementById('btnImport').addEventListener('click', () => Modals.openImport());
        document.getElementById('btnSettings').addEventListener('click', () => Modals.openSettings());
        document.getElementById('btnLogin').addEventListener('click', () => {
            if (AppState.isAuthenticated) {
                this.showLogin();
            } else {
                Modals.openLogin();
            }
        });
        
        // Sidebar toggle
        document.querySelector('.sidebar-toggle').addEventListener('click', () => this.toggleSidebar());
        
        // Theme toggle
        document.getElementById('btnThemeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Drag and drop
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
    }
    
    // ============================================
    // Authentication
    // ============================================
    
    async checkAuth() {
        const user = await Auth.getCurrentUser();
        if (user) {
            AppState.user = user;
            AppState.isAuthenticated = true;
            this.updateUserUI();
        } else {
            // Try auto-login with demo credentials
            try {
                const demoUser = await Auth.login('demo@scratchvibe.com', 'demo123');
                if (demoUser) {
                    AppState.user = demoUser;
                    AppState.isAuthenticated = true;
                    this.updateUserUI();
                    console.log('Auto-login successful with demo user');
                    return;
                }
            } catch (e) {
                console.log('Auto-login failed, showing login modal:', e.message);
            }
            
            // Show login modal after a short delay
            setTimeout(() => {
                if (!AppState.isAuthenticated) {
                    Modals.openLogin();
                }
            }, 500);
        }
    }
    
    async showLogin() {
        if (AppState.isAuthenticated) {
            await Auth.logout();
            AppState.user = null;
            AppState.isAuthenticated = false;
            this.updateUserUI();
            Modals.openLogin();
        } else {
            Modals.openLogin();
        }
    }
    
    updateUserUI() {
        const btnLogin = document.getElementById('btnLogin');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        
        if (AppState.isAuthenticated) {
            btnLogin.innerHTML = '<i class="fas fa-user"></i> <span class="btn-text">' + 
                (AppState.user.name || AppState.user.email) + '</span>';
            userMenu.style.display = 'block';
            if (userName) userName.textContent = AppState.user.name || 'Benutzer';
            if (userEmail) userEmail.textContent = AppState.user.email || '';
        } else {
            btnLogin.innerHTML = '<i class="fas fa-user"></i> <span class="btn-text">Anmelden</span>';
            userMenu.style.display = 'none';
        }
    }
    
    // ============================================
    // Project Management
    // ============================================
    
    async loadInitialProject() {
        // Try to load last project
        const lastProject = await Database.getLastProject();
        if (lastProject) {
            await this.loadProject(lastProject.id);
        } else {
            // Create new project
            await this.createNewProject('Unbenanntes Projekt');
        }
    }
    
    async createNewProject(name = 'Unbenanntes Projekt', template = 'empty') {
        const project = await Database.createProject({
            name: name,
            description: '',
            template: template,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            files: this.getTemplateFiles(template)
        });
        
        AppState.currentProject = project;
        AppState.currentProjectId = project.id;
        
        // Load first file
        if (project.files && project.files.length > 0) {
            await this.openFile(project.files[0].id);
        } else {
            // Create default file
            const file = await Database.createFile(project.id, {
                name: 'main.vibe',
                type: 'script',
                content: '// Willkommen bei Scratch Vibe Coding!\n// Beginne mit dem Schreiben von Code...\n\nsprite Player\n  on green_flag:\n    go_to x: 0 y: 0\n    forever:\n      if key("right") pressed:\n        change x by 5\n      if key("left") pressed:\n        change x by -5',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            await this.openFile(file.id);
        }
        
        // Update UI
        this.updateProjectUI();
        ProjectExplorer.refresh();
        
        // Save to history
        History.addState({
            type: 'project_created',
            projectId: project.id,
            name: project.name
        });
        
        Notifications.show('Projekt erstellt: ' + name, 'success');
    }
    
    getTemplateFiles(template) {
        const templates = {
            empty: [
                {
                    id: 'main',
                    name: 'main.vibe',
                    type: 'script',
                    content: '// Leeres Projekt\n\nsprite Main\n  on green_flag:\n    // Dein Code hier',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            sprite: [
                {
                    id: 'main',
                    name: 'main.vibe',
                    type: 'script',
                    content: '// Einfacher Sprite\n\nsprite Player\n  on green_flag:\n    go_to x: 0 y: 0\n    forever:\n      if key("right") pressed:\n        change x by 5\n      if key("left") pressed:\n        change x by -5\n      if key("up") pressed:\n        change y by 5\n      if key("down") pressed:\n        change y by -5',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            game: [
                {
                    id: 'main',
                    name: 'main.vibe',
                    type: 'script',
                    content: '// Spiel-Template\n\n// Variablen\nvar score = 0\nvar lives = 3\n\n// Sprites\nsprite Player\n  on green_flag:\n    go_to x: 0 y: -150\n    set size to 100%\n    forever:\n      if key("right") pressed:\n        change x by 5\n      if key("left") pressed:\n        change x by -5\n      if touching("Enemy"):\n        change lives by -1\n        if lives = 0:\n          broadcast "gameOver"\n\nsprite Enemy\n  on green_flag:\n    go_to x: 100 y: 100\n    forever:\n      change x by -2\n      if on edge bounce\n      if touching("Player"):\n        go_to x: 100 y: random(50, 200)\n\n// Events\non "gameOver":\n  stop all',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            story: [
                {
                    id: 'main',
                    name: 'main.vibe',
                    type: 'script',
                    content: '// Geschichte-Template\n\n// Charakter\nsprite Character\n  costumes: ["idle", "talk"]\n  on green_flag:\n    go_to x: 0 y: 0\n    switch costume to "idle"\n    say "Hallo!" for 2 secs\n    wait 1 sec\n    switch costume to "talk"\n    say "Wie geht es dir?" for 2 secs\n    wait 1 sec\n    say "Das war eine schöne Geschichte!" for 3 secs',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            platformer: [
                {
                    id: 'main',
                    name: 'main.vibe',
                    type: 'script',
                    content: '// Plattformer-Template\n\n// Physik\nvar gravity = -0.5\nvar jumpForce = 10\nvar isJumping = false\n\n// Sprites\nsprite Player\n  on green_flag:\n    go_to x: -200 y: 0\n    set size to 50%\n    forever:\n      // Bewegung\n      if key("right") pressed:\n        change x by 5\n        point in direction 90\n      if key("left") pressed:\n        change x by -5\n        point in direction -90\n      
      // Springen\n      if key("space") pressed and not isJumping:\n        change y by jumpForce\n        set isJumping to true\n      
      // Gravitation\n      if isJumping:\n        change y by gravity\n        if touching("Platform"):\n          set isJumping to false\n          set y to y + 5\n\nsprite Platform\n  on green_flag:\n    go_to x: 0 y: -100\n    set size to 200%\n    repeat 10:\n      clone\n      change x by 50',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            shooter: [
                {
                    id: 'main',
                    name: 'main.vibe',
                    type: 'script',
                    content: '// Shooter-Template\n\n// Variablen\nvar score = 0\nvar health = 100\nvar ammo = 30\n\n// Sprites\nsprite Player\n  on green_flag:\n    go_to x: 0 y: -180\n    set size to 80%\n    forever:\n      // Bewegung\n      if key("right") pressed:\n        change x by 5\n      if key("left") pressed:\n        change x by -5\n      
      // Schießen\n      if key("space") pressed and ammo > 0:\n        broadcast "shoot"\n        change ammo by -1\n      
      // Treffer\n      if touching("Enemy"):\n        change health by -10\n        if health <= 0:\n          broadcast "gameOver"\n\nsprite Bullet\n  on "shoot":\n    go_to x: Player.x y: Player.y\n    point in direction 90\n    repeat until touching("Enemy") or touching("edge"):\n      change x by 10\n    if touching("Enemy"):\n      broadcast "hit"\n    delete this clone\n\nsprite Enemy\n  on green_flag:\n    go_to x: 200 y: random(-150, 150)\n    set size to 60%\n    forever:\n      change x by -2\n      if on edge:\n        go_to x: 200 y: random(-150, 150)\n      if touching("Bullet"):\n        change score by 10\n        delete this clone\n\non "hit":\n  // Hit animation\n  repeat 5:\n    change size by 10\n    wait 0.1 secs\n  delete this clone\n\non "gameOver":\n  stop all\n  say "Game Over!" for 5 secs',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ]
        };
        
        return templates[template] || templates.empty;
    }
    
    async loadProject(projectId) {
        const project = await Database.getProject(projectId);
        if (!project) {
            Notifications.show('Projekt nicht gefunden', 'error');
            return;
        }
        
        AppState.currentProject = project;
        AppState.currentProjectId = project.id;
        
        // Load first file or last opened file
        if (project.files && project.files.length > 0) {
            // Try to find last opened file
            const lastFile = project.files.find(f => f.isOpen);
            if (lastFile) {
                await this.openFile(lastFile.id);
            } else {
                await this.openFile(project.files[0].id);
            }
        }
        
        // Update UI
        this.updateProjectUI();
        ProjectExplorer.refresh();
        
        Notifications.show('Projekt geladen: ' + project.name, 'success');
    }
    
    async openFile(fileId) {
        const file = await Database.getFile(AppState.currentProjectId, fileId);
        if (!file) {
            Notifications.show('Datei nicht gefunden', 'error');
            return;
        }
        
        AppState.currentFile = file;
        AppState.currentFileId = file.id;
        
        // Update editor content
        if (AppState.editor) {
            AppState.editor.setValue(file.content || '');
        }
        
        // Update tabs
        Editor.updateTabs();
        
        // Update status
        this.updateFileStatus();
        
        // Mark file as open
        await Database.updateFile(file.id, { isOpen: true });
        
        // Add to history
        History.addState({
            type: 'file_opened',
            fileId: file.id,
            fileName: file.name
        });
    }
    
    async saveProject() {
        if (!AppState.currentProject) {
            Notifications.show('Kein Projekt zum Speichern', 'error');
            return;
        }
        
        // Save current file
        if (AppState.currentFile && AppState.editor) {
            const content = AppState.editor.getValue();
            await Database.updateFile(AppState.currentFileId, {
                content: content,
                updatedAt: new Date().toISOString()
            });
            
            AppState.currentFile.content = content;
            AppState.currentFile.updatedAt = new Date().toISOString();
        }
        
        // Update project
        await Database.updateProject(AppState.currentProjectId, {
            updatedAt: new Date().toISOString()
        });
        
        AppState.currentProject.updatedAt = new Date().toISOString();
        
        // Update UI
        this.updateProjectUI();
        this.updateFileStatus();
        
        // Show notification
        Notifications.show('Projekt gespeichert', 'success');
        
        // Update autosave status
        this.updateAutosaveStatus();
    }
    
    async closeProject() {
        if (!AppState.currentProject) return;
        
        // Save current project first
        await this.saveProject();
        
        // Close all files
        AppState.openFiles = [];
        AppState.currentFile = null;
        AppState.currentFileId = null;
        
        // Reset editor
        if (AppState.editor) {
            AppState.editor.setValue('');
        }
        
        // Reset project
        AppState.currentProject = null;
        AppState.currentProjectId = null;
        
        // Update UI
        this.updateProjectUI();
        ProjectExplorer.refresh();
        Editor.updateTabs();
        
        Notifications.show('Projekt geschlossen', 'info');
    }
    
    updateProjectUI() {
        const projectNameDisplay = document.getElementById('projectNameDisplay');
        const projectStatus = document.getElementById('projectStatus');
        
        if (AppState.currentProject) {
            projectNameDisplay.textContent = AppState.currentProject.name;
            projectStatus.textContent = '- ' + 
                (AppState.currentFile ? AppState.currentFile.name : 'Keine Datei ausgewählt');
        } else {
            projectNameDisplay.textContent = 'Unbenanntes Projekt';
            projectStatus.textContent = '- Kein Projekt geöffnet';
        }
    }
    
    updateFileStatus() {
        const projectStatus = document.getElementById('projectStatus');
        
        if (AppState.currentProject && AppState.currentFile) {
            const lastSaved = new Date(AppState.currentFile.updatedAt);
            const now = new Date();
            const diff = Math.floor((now - lastSaved) / 1000);
            
            let status = AppState.currentFile.name;
            if (diff > 60) {
                status += ' - Nicht gespeichert';
            } else if (diff > 0) {
                status += ' - Vor ' + diff + 's gespeichert';
            } else {
                status += ' - Gespeichert';
            }
            
            projectStatus.textContent = '- ' + status;
        }
    }
    
    updateAutosaveStatus() {
        const autosaveStatus = document.getElementById('autosaveStatus');
        
        if (AppState.settings.autoSave) {
            autosaveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Autosave aktiv';
            autosaveStatus.style.color = 'var(--text-success)';
        } else {
            autosaveStatus.innerHTML = '<i class="fas fa-circle"></i> Autosave';
            autosaveStatus.style.color = 'var(--text-muted)';
        }
    }
    
    // ============================================
    // Execution Control
    // ============================================
    
    async runProject() {
        if (!AppState.currentProject) {
            Notifications.show('Kein Projekt zum Ausführen', 'error');
            return;
        }
        
        // Save current file
        await this.saveProject();
        
        // Compile project
        const result = Compiler.compile(AppState.currentProject);
        
        if (result.errors && result.errors.length > 0) {
            // Show errors
            result.errors.forEach(error => {
                Debugger.logError(error.message, error.line, error.column);
            });
            Notifications.show('Kompilierungsfehler: ' + result.errors[0].message, 'error');
            return;
        }
        
        // Run in preview
        Preview.run(result.project);
        
        AppState.isRunning = true;
        this.updateExecutionUI();
        
        Notifications.show('Projekt wird ausgeführt', 'success');
    }
    
    async stopProject() {
        Preview.stop();
        AppState.isRunning = false;
        AppState.isPaused = false;
        this.updateExecutionUI();
        
        Notifications.show('Projekt gestoppt', 'info');
    }
    
    async pauseProject() {
        if (AppState.isRunning) {
            Preview.pause();
            AppState.isPaused = true;
            this.updateExecutionUI();
            
            Notifications.show('Projekt pausiert', 'info');
        } else if (AppState.isPaused) {
            Preview.resume();
            AppState.isPaused = false;
            this.updateExecutionUI();
            
            Notifications.show('Projekt fortgesetzt', 'info');
        }
    }
    
    async restartProject() {
        await this.stopProject();
        await this.runProject();
    }
    
    toggleDebug() {
        AppState.isDebugging = !AppState.isDebugging;
        Debugger.toggle();
        Preview.toggleDebugOverlay(AppState.isDebugging);
        
        this.updateExecutionUI();
        
        if (AppState.isDebugging) {
            Notifications.show('Debug-Modus aktiviert', 'info');
        } else {
            Notifications.show('Debug-Modus deaktiviert', 'info');
        }
    }
    
    updateExecutionUI() {
        const btnRun = document.getElementById('btnRun');
        const btnStop = document.getElementById('btnStop');
        const btnPause = document.getElementById('btnPause');
        const btnDebug = document.getElementById('btnDebug');
        const btnPreviewRun = document.getElementById('btnPreviewRun');
        const btnPreviewStop = document.getElementById('btnPreviewStop');
        
        if (AppState.isRunning) {
            btnRun.classList.remove('btn-success');
            btnRun.classList.add('btn-secondary');
            btnStop.classList.remove('btn-secondary');
            btnStop.classList.add('btn-danger');
            btnPause.style.display = 'inline-flex';
            
            btnPreviewRun.style.display = 'none';
            btnPreviewStop.style.display = 'inline-flex';
        } else {
            btnRun.classList.remove('btn-secondary');
            btnRun.classList.add('btn-success');
            btnStop.classList.remove('btn-danger');
            btnStop.classList.add('btn-secondary');
            btnPause.style.display = 'none';
            
            btnPreviewRun.style.display = 'inline-flex';
            btnPreviewStop.style.display = 'none';
        }
        
        if (AppState.isPaused) {
            btnPause.innerHTML = '<i class="fas fa-play"></i>';
            btnPause.title = 'Fortsetzen';
        } else {
            btnPause.innerHTML = '<i class="fas fa-pause"></i>';
            btnPause.title = 'Pausieren';
        }
        
        if (AppState.isDebugging) {
            btnDebug.classList.remove('btn-secondary');
            btnDebug.classList.add('btn-success');
        } else {
            btnDebug.classList.remove('btn-success');
            btnDebug.classList.add('btn-secondary');
        }
    }
    
    // ============================================
    // UI Toggle Functions
    // ============================================
    
    toggleSidebar() {
        AppState.sidebarVisible = !AppState.sidebarVisible;
        const sidebar = document.getElementById('sidebar');
        
        if (AppState.sidebarVisible) {
            sidebar.style.display = 'block';
        } else {
            sidebar.style.display = 'none';
        }
        
        // Adjust layout
        this.handleResize();
    }
    
    togglePreview() {
        AppState.previewVisible = !AppState.previewVisible;
        const preview = document.getElementById('preview-container');
        
        if (AppState.previewVisible) {
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
        
        // Adjust layout
        this.handleResize();
    }
    
    toggleDebugConsole() {
        AppState.debugConsoleVisible = !AppState.debugConsoleVisible;
        
        if (AppState.debugConsoleVisible) {
            Modals.openDebugConsole();
        } else {
            Modals.closeDebugConsole();
        }
    }
    
    toggleCommandPalette() {
        AppState.commandPaletteVisible = !AppState.commandPaletteVisible;
        
        if (AppState.commandPaletteVisible) {
            Modals.openCommandPalette();
        } else {
            Modals.closeCommandPalette();
        }
    }
    
    toggleTheme() {
        const currentTheme = AppState.settings.theme;
        const themes = ['dark', 'light', 'high-contrast'];
        const nextThemeIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
        AppState.settings.theme = themes[nextThemeIndex];
        
        // Apply theme
        Theme.applyTheme(AppState.settings.theme);
        
        // Save settings
        Settings.save();
        
        Notifications.show('Theme: ' + AppState.settings.theme, 'info');
    }
    
    // ============================================
    // Editor Functions
    // ============================================
    
    handleEditorChange(cm) {
        // Mark file as modified
        if (AppState.currentFile) {
            AppState.currentFile.isModified = true;
            Editor.updateTabs();
        }
        
        // Auto compile if enabled
        if (AppState.settings.autoCompile) {
            this.debouncedCompile();
        }
        
        // Update cursor position
        this.updateCursorPosition(cm);
    }
    
    updateCursorPosition(cm) {
        const cursor = cm.getCursor();
        const statusCursor = document.getElementById('statusCursor');
        
        if (statusCursor) {
            statusCursor.textContent = `Zeile: ${cursor.line + 1}, Spalte: ${cursor.ch + 1}`;
        }
    }
    
    debouncedCompile() {
        // Debounce compilation
        if (this.compileTimeout) {
            clearTimeout(this.compileTimeout);
        }
        
        this.compileTimeout = setTimeout(() => {
            if (AppState.currentProject) {
                const result = Compiler.compile(AppState.currentProject);
                
                if (result.errors && result.errors.length > 0) {
                    result.errors.forEach(error => {
                        Debugger.logError(error.message, error.line, error.column);
                    });
                }
            }
        }, 500);
    }
    
    updateEditorSettings() {
        if (!AppState.editor) return;
        
        AppState.editor.setOption('lineNumbers', AppState.settings.lineNumbers);
        AppState.editor.setOption('lineWrapping', AppState.settings.wordWrap);
        AppState.editor.setOption('tabSize', AppState.settings.tabSize);
        AppState.editor.setOption('indentUnit', AppState.settings.tabSize);
        AppState.editor.setOption('theme', AppState.settings.theme === 'dark' ? 'dracula' : 'default');
        
        // Update font size
        const editorWrapper = document.querySelector('.CodeMirror');
        if (editorWrapper) {
            editorWrapper.style.fontSize = AppState.settings.fontSize + 'px';
        }
    }
    
    // ============================================
    // Settings
    // ============================================
    
    async loadSettings() {
        const savedSettings = await Settings.load();
        if (savedSettings) {
            AppState.settings = { ...AppState.settings, ...savedSettings };
        }
        
        // Apply theme
        Theme.applyTheme(AppState.settings.theme);
        
        // Update editor settings
        this.updateEditorSettings();
        
        // Update autosave status
        this.updateAutosaveStatus();
    }
    
    // ============================================
    // Autosave
    // ============================================
    
    startAutosave() {
        if (!AppState.settings.autoSave) return;
        
        this.stopAutosave();
        
        this.autosaveInterval = setInterval(() => {
            if (AppState.currentProject && AppState.currentFile) {
                this.saveProject();
            }
        }, AppState.settings.autoSaveInterval * 1000);
    }
    
    stopAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
        }
    }
    
    // ============================================
    // Event Handlers
    // ============================================
    
    handleResize() {
        // Adjust layout based on window size
        const app = document.getElementById('app');
        const sidebar = document.getElementById('sidebar');
        const preview = document.getElementById('preview-container');
        
        if (window.innerWidth <= 968) {
            if (AppState.sidebarVisible) {
                sidebar.style.display = 'block';
            }
            preview.style.display = 'none';
        } else if (window.innerWidth <= 1200) {
            if (AppState.sidebarVisible) {
                sidebar.style.display = 'block';
            }
            if (AppState.previewVisible) {
                preview.style.display = 'block';
            }
        } else {
            if (AppState.sidebarVisible) {
                sidebar.style.display = 'block';
            }
            if (AppState.previewVisible) {
                preview.style.display = 'block';
            }
        }
    }
    
    handleBeforeUnload(e) {
        // Check if there are unsaved changes
        if (AppState.currentFile && AppState.currentFile.isModified) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    }
    
    handleKeydown(e) {
        // Ignore if typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Handle shortcuts
        switch (e.key) {
            case 's':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.saveProject();
                }
                break;
            case 'z':
                if (e.ctrlKey) {
                    e.preventDefault();
                    History.undo();
                }
                break;
            case 'y':
                if (e.ctrlKey) {
                    e.preventDefault();
                    History.redo();
                }
                break;
            case 'F5':
                e.preventDefault();
                this.runProject();
                break;
            case 'F6':
                e.preventDefault();
                this.stopProject();
                break;
            case 'F7':
                e.preventDefault();
                this.toggleDebug();
                break;
            case 'F8':
                e.preventDefault();
                this.toggleDebugConsole();
                break;
            case 'F11':
                e.preventDefault();
                Preview.toggleFullscreen();
                break;
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = document.getElementById('importDropZone');
        if (dropZone) {
            dropZone.classList.add('drag-over');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = document.getElementById('importDropZone');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            Modals.handleImportDrop(files);
        }
    }
    
    // ============================================
    // Help & Documentation
    // ============================================
    
    showHelp() {
        Notifications.show('Hilfe wird geöffnet...', 'info');
        // In a real implementation, this would open a help modal or documentation
    }
    
    showDocumentation() {
        Notifications.show('Dokumentation wird geöffnet...', 'info');
    }
    
    showAbout() {
        Notifications.show('Scratch Vibe Coding IDE - Version 1.0.0', 'info');
    }
}

// ============================================
// Initialize Application
// ============================================

// Global application instance
let App;

document.addEventListener('DOMContentLoaded', () => {
    App = new ScratchVibeIDE();
});

// Make App globally accessible
window.ScratchVibeIDE = ScratchVibeIDE;
window.App = App;
