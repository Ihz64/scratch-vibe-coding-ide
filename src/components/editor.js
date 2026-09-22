/**
 * Scratch Vibe Coding IDE - Editor Component
 * Handles the code editor functionality
 */

// ============================================
// Editor State
// ============================================

const EditorState = {
    // Editor instances
    editors: new Map(),
    activeEditor: null,
    
    // Open files
    openFiles: new Map(),
    activeFileId: null,
    
    // Tabs
    tabs: [],
    activeTabId: null,
    
    // Settings
    fontSize: 14,
    tabSize: 4,
    theme: 'dracula',
    lineNumbers: true,
    wordWrap: false,
    autoCloseBrackets: true,
    matchBrackets: true,
    showMinimap: true,
    autoComplete: true,
    
    // Search
    searchQuery: '',
    searchIndex: -1,
    searchMatches: [],
    
    // History
    undoStack: [],
    redoStack: []
};

// ============================================
// Editor Component
// ============================================

const Editor = {
    // ============================================
    // Initialization
    // ============================================
    
    init() {
        console.log('Initializing Editor...');
        
        this.cacheElements();
        this.setupEvents();
        this.initCodeMirror();
        
        console.log('Editor initialized');
    },
    
    cacheElements() {
        this.editorContainer = document.getElementById('editor-container');
        this.editorTabs = document.getElementById('editorTabs');
        this.editorWrapper = document.querySelector('.editor-wrapper');
        this.minimap = document.getElementById('editorMinimap');
        this.minimapCanvas = document.getElementById('minimapCanvas');
    },
    
    setupEvents() {
        // Format code button
        const formatBtn = document.getElementById('btnFormatCode');
        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.format());
        }
        
        // Search button
        const searchBtn = document.getElementById('btnSearch');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.search());
        }
        
        // Command palette button
        const commandBtn = document.getElementById('btnCommandPalette');
        if (commandBtn) {
            commandBtn.addEventListener('click', () => this.openCommandPalette());
        }
    },
    
    initCodeMirror() {
        // Check if CodeMirror is loaded
        if (typeof CodeMirror === 'undefined') {
            console.warn('CodeMirror not loaded!');
            return;
        }
        
        // Get the textarea
        const textarea = document.getElementById('codeEditor');
        if (!textarea) {
            console.error('CodeMirror textarea not found!');
            return;
        }
        
        // Create CodeMirror editor
        AppState.editor = CodeMirror.fromTextArea(textarea, {
            mode: 'vibe',
            theme: EditorState.theme,
            lineNumbers: EditorState.lineNumbers,
            tabSize: EditorState.tabSize,
            indentUnit: EditorState.tabSize,
            indentWithTabs: false,
            lineWrapping: EditorState.wordWrap,
            autoCloseBrackets: EditorState.autoCloseBrackets,
            matchBrackets: EditorState.matchBrackets,
            extraKeys: {
                'Ctrl-S': () => App.saveProject(),
                'Ctrl-Z': () => History.undo(),
                'Ctrl-Y': () => History.redo(),
                'Ctrl-F': () => this.search(),
                'Ctrl-H': () => this.replace(),
                'Ctrl-[': () => this.indentLess(),
                'Ctrl-]': () => this.indentMore(),
                'Ctrl-/': () => this.toggleComment(),
                'Tab': (cm) => this.handleTab(cm),
                'Shift-Tab': (cm) => this.handleShiftTab(cm)
            },
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            lint: true,
            lineNumberFormatter: (line) => line.toString()
        });
        
        // Store editor reference
        EditorState.activeEditor = AppState.editor;
        
        // Setup editor events
        this.setupEditorEvents();
        
        // Initialize minimap
        this.initMinimap();
        
        // Set default content
        if (AppState.editor.getValue() === '') {
            AppState.editor.setValue('// Willkommen bei Scratch Vibe Coding!\n// Beginne mit dem Schreiben von Code...\n\nsprite Player\n  on green_flag:\n    go_to x: 0 y: 0\n    forever:\n      if key("right") pressed:\n        change x by 5\n      if key("left") pressed:\n        change x by -5');
        }
        
        // Update editor settings from AppState
        this.updateSettings();
    },
    
    setupEditorEvents() {
        const editor = AppState.editor;
        if (!editor) return;
        
        // Change event
        editor.on('change', (cm, change) => {
            this.handleChange(cm, change);
        });
        
        // Cursor activity
        editor.on('cursorActivity', (cm) => {
            this.handleCursorActivity(cm);
        });
        
        // Focus
        editor.on('focus', (cm) => {
            this.handleFocus(cm);
        });
        
        // Blur
        editor.on('blur', (cm) => {
            this.handleBlur(cm);
        });
        
        // Key down
        editor.on('keydown', (cm, event) => {
            this.handleKeyDown(cm, event);
        });
        
        // Scroll
        editor.on('scroll', (cm) => {
            this.handleScroll(cm);
        });
    },
    
    initMinimap() {
        if (!this.minimap || !this.minimapCanvas || !AppState.editor) return;
        
        // Set minimap size
        this.minimap.style.width = '120px';
        
        // Update minimap on editor changes
        AppState.editor.on('change', () => this.updateMinimap());
        AppState.editor.on('scroll', () => this.updateMinimap());
        AppState.editor.on('cursorActivity', () => this.updateMinimap());
        
        // Initial update
        this.updateMinimap();
    },
    
    updateMinimap() {
        if (!this.minimapCanvas || !AppState.editor) return;
        
        const canvas = this.minimapCanvas;
        const context = canvas.getContext('2d');
        
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set canvas dimensions
        canvas.width = 120;
        canvas.height = this.editorContainer ? this.editorContainer.clientHeight : 300;
        
        // Draw background
        context.fillStyle = '#1e1e1e';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw visible portion
        const scrollInfo = AppState.editor.getScrollInfo();
        const editorHeight = AppState.editor.getWrapperElement().clientHeight;
        const docHeight = AppState.editor.getDoc().height;
        const scale = canvas.height / docHeight;
        
        context.fillStyle = '#30363d';
        context.fillRect(
            0,
            scrollInfo.top * scale,
            canvas.width,
            editorHeight * scale
        );
        
        // Draw cursor
        const cursor = AppState.editor.getCursor();
        const cursorCoords = AppState.editor.cursorCoords();
        const lineHeight = AppState.editor.defaultTextHeight();
        
        context.fillStyle = '#58a6ff';
        context.fillRect(
            0,
            (cursor.line + 1) * lineHeight * scale - scrollInfo.top * scale,
            canvas.width,
            2
        );
    },
    
    // ============================================
    // Event Handlers
    // ============================================
    
    handleChange(cm, change) {
        // Mark current file as modified
        if (AppState.currentFile) {
            AppState.currentFile.isModified = true;
            this.updateTabs();
        }
        
        // Auto compile if enabled
        if (AppState.settings.autoCompile) {
            this.debouncedCompile();
        }
        
        // Update minimap
        this.updateMinimap();
    }
    
    handleCursorActivity(cm) {
        // Update status bar
        const cursor = cm.getCursor();
        const statusCursor = document.getElementById('statusCursor');
        
        if (statusCursor) {
            statusCursor.textContent = `Zeile: ${cursor.line + 1}, Spalte: ${cursor.ch + 1}`;
        }
    }
    
    handleFocus(cm) {
        // Editor has focus
    }
    
    handleBlur(cm) {
        // Editor lost focus
    }
    
    handleKeyDown(cm, event) {
        // Handle special keys
        switch (event.key) {
            case 'Tab':
                event.preventDefault();
                break;
            case 'Enter':
                // Auto-indent
                if (AppState.settings.autoIndent) {
                    this.autoIndent(cm);
                }
                break;
        }
    }
    
    handleScroll(cm) {
        // Update minimap
        this.updateMinimap();
    }
    
    // ============================================
    // Tab Management
    // ============================================
    
    updateTabs() {
        if (!this.editorTabs) return;
        
        // Clear existing tabs
        this.editorTabs.innerHTML = '';
        
        // Get open files
        const openFiles = AppState.openFiles || [];
        
        // Create tabs for each open file
        for (const file of openFiles) {
            const tab = document.createElement('div');
            tab.className = 'editor-tab';
            if (AppState.currentFileId === file.id) {
                tab.classList.add('active');
            }
            
            // File icon
            const icon = document.createElement('span');
            icon.className = 'tab-icon';
            icon.innerHTML = this.getFileIcon(file);
            tab.appendChild(icon);
            
            // File name
            const name = document.createElement('span');
            name.className = 'tab-name';
            name.textContent = file.name;
            tab.appendChild(name);
            
            // Modified indicator
            if (file.isModified) {
                const modified = document.createElement('span');
                modified.className = 'tab-modified';
                modified.textContent = '•';
                tab.appendChild(modified);
            }
            
            // Close button
            const close = document.createElement('span');
            close.className = 'tab-close';
            close.innerHTML = '<i class="fas fa-times"></i>';
            close.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeFile(file.id);
            });
            tab.appendChild(close);
            
            // Tab click handler
            tab.addEventListener('click', () => {
                this.switchToFile(file.id);
            });
            
            this.editorTabs.appendChild(tab);
        }
        
        // Update active tab
        this.updateActiveTab();
    }
    
    getFileIcon(file) {
        const iconMap = {
            'vibe': '<i class="fas fa-code"></i>',
            'script': '<i class="fas fa-file-code"></i>',
            'sprite': '<i class="fas fa-cube"></i>',
            'scene': '<i class="fas fa-film"></i>',
            'level': '<i class="fas fa-flag"></i>',
            'backdrop': '<i class="fas fa-image"></i>',
            'sound': '<i class="fas fa-volume-up"></i>',
            'variable': '<i class="fas fa-list"></i>',
            'function': '<i class="fas fa-cog"></i>'
        };
        
        return iconMap[file.type] || '<i class="fas fa-file"></i>';
    }
    
    switchToFile(fileId) {
        // Check if file is already open
        const file = AppState.openFiles.find(f => f.id === fileId);
        if (!file) {
            // Open the file
            return App.openFile(fileId);
        }
        
        // Switch to the file
        AppState.currentFile = file;
        AppState.currentFileId = file.id;
        
        // Update editor content
        if (AppState.editor) {
            AppState.editor.setValue(file.content || '');
        }
        
        // Update tabs
        this.updateTabs();
        
        // Update status
        App.updateFileStatus();
    }
    
    closeFile(fileId) {
        // Don't close the last file
        if (AppState.openFiles.length <= 1) {
            Notifications.show('Kann die letzte Datei nicht schließen', 'warning');
            return;
        }
        
        // Find the file
        const index = AppState.openFiles.findIndex(f => f.id === fileId);
        if (index === -1) return;
        
        // Close the file
        AppState.openFiles.splice(index, 1);
        
        // If we're closing the current file, switch to another
        if (AppState.currentFileId === fileId) {
            const nextFile = AppState.openFiles[Math.min(index, AppState.openFiles.length - 1)];
            this.switchToFile(nextFile.id);
        }
        
        // Update tabs
        this.updateTabs();
    }
    
    updateActiveTab() {
        // Find active tab
        const tabs = this.editorTabs?.querySelectorAll('.editor-tab') || [];
        
        for (const tab of tabs) {
            tab.classList.remove('active');
        }
        
        // Find tab for current file
        const currentFile = AppState.openFiles.find(f => f.id === AppState.currentFileId);
        if (currentFile) {
            const tab = this.editorTabs?.querySelector(`.editor-tab[data-id="${currentFile.id}"]`);
            if (tab) {
                tab.classList.add('active');
            }
        }
    }
    
    // ============================================
    // File Operations
    // ============================================
    
    async openFile(file) {
        // Check if file is already open
        const existing = AppState.openFiles.find(f => f.id === file.id);
        if (existing) {
            this.switchToFile(file.id);
            return;
        }
        
        // Add to open files
        AppState.openFiles.push(file);
        
        // Switch to the file
        this.switchToFile(file.id);
        
        // Update tabs
        this.updateTabs();
    }
    
    async createNewFile(type = 'vibe', name = null) {
        if (!AppState.currentProject) {
            Notifications.show('Kein Projekt geöffnet', 'error');
            return;
        }
        
        // Generate name if not provided
        if (!name) {
            const fileCount = AppState.openFiles.length + 1;
            name = `neu_${type}_${fileCount}.${type}`;
        }
        
        // Create file in database
        const file = await Database.createFile(AppState.currentProject.id, {
            name: name,
            type: type,
            content: this.getDefaultFileContent(type),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        // Open the file
        await this.openFile(file);
        
        // Refresh project explorer
        ProjectExplorer.refresh();
        
        Notifications.show(`Neue Datei erstellt: ${file.name}`, 'success');
    }
    
    getDefaultFileContent(type) {
        const templates = {
            'vibe': `// Neue Vibe-Datei
// Erstellt am: ${new Date().toLocaleString()}

// Beispiel:
// sprite Player
//   on green_flag:
//     go_to x: 0 y: 0
//     forever:
//       if key("right") pressed:
//         change x by 5`,
            
            'script': `// Neues Skript
// Erstellt am: ${new Date().toLocaleString()}

// Hier dein Code...`,
            
            'sprite': `// Neues Sprite
// Erstellt am: ${new Date().toLocaleString()}

sprite NewSprite
  on green_flag:
    go_to x: 0 y: 0
    show
    
  // Hier deine Sprite-Logik...`,
            
            'scene': `// Neue Szene
// Erstellt am: ${new Date().toLocaleString()}

scene NewScene
  // Hier deine Szenen-Konfiguration...`,
            
            'backdrop': `// Neuer Hintergrund
// Erstellt am: ${new Date().toLocaleString()}

backdrop NewBackdrop
  // Hier deine Hintergrund-Einstellungen...`
        };
        
        return templates[type] || templates.vibe;
    }
    
    // ============================================
    // Editor Actions
    // ============================================
    
    format() {
        if (!AppState.editor) return;
        
        const cursor = AppState.editor.getCursor();
        const selection = AppState.editor.getSelection();
        
        // Format the entire document
        AppState.editor.autoFormatRange(
            { line: 0, ch: 0 },
            { line: AppState.editor.lineCount() - 1, ch: 0 }
        );
        
        // Restore cursor position
        AppState.editor.setCursor(cursor);
        AppState.editor.setSelection(cursor, selection);
        
        Notifications.show('Code formatiert', 'success');
    }
    
    search() {
        if (!AppState.editor) return;
        
        // Open search dialog
        AppState.editor.execCommand('find');
    }
    
    replace() {
        if (!AppState.editor) return;
        
        // Open replace dialog
        AppState.editor.execCommand('replace');
    }
    
    openCommandPalette() {
        Modals.openCommandPalette();
    }
    
    // ============================================
    // Code Editing
    // ============================================
    
    handleTab(cm) {
        if (cm.somethingSelected()) {
            // Indent selection
            cm.indentSelection('add');
        } else {
            // Insert spaces
            const spaces = ' '.repeat(EditorState.tabSize);
            cm.replaceSelection(spaces);
        }
    }
    
    handleShiftTab(cm) {
        if (cm.somethingSelected()) {
            // Unindent selection
            cm.indentSelection('subtract');
        }
    }
    
    autoIndent(cm) {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        
        // Check if line ends with colon (block start)
        if (line.trim().endsWith(':')) {
            // Insert indented line
            cm.replaceRange('\n' + ' '.repeat(EditorState.tabSize), cursor);
        } else {
            // Just insert newline
            cm.replaceRange('\n', cursor);
        }
    }
    
    indentMore() {
        if (!AppState.editor) return;
        
        const selection = AppState.editor.getSelection();
        if (selection) {
            // Indent each line in selection
            const lines = selection.split('\n');
            const indented = lines.map(line => ' '.repeat(EditorState.tabSize) + line).join('\n');
            AppState.editor.replaceSelection(indented);
        } else {
            // Indent current line
            const cursor = AppState.editor.getCursor();
            const line = AppState.editor.getLine(cursor.line);
            AppState.editor.replaceRange(' '.repeat(EditorState.tabSize), { line: cursor.line, ch: 0 });
        }
    }
    
    indentLess() {
        if (!AppState.editor) return;
        
        const selection = AppState.editor.getSelection();
        if (selection) {
            // Unindent each line in selection
            const lines = selection.split('\n');
            const unindented = lines.map(line => {
                if (line.startsWith(' '.repeat(EditorState.tabSize))) {
                    return line.substring(EditorState.tabSize);
                }
                return line;
            }).join('\n');
            AppState.editor.replaceSelection(unindented);
        } else {
            // Unindent current line
            const cursor = AppState.editor.getCursor();
            const line = AppState.editor.getLine(cursor.line);
            if (line.startsWith(' '.repeat(EditorState.tabSize))) {
                AppState.editor.replaceRange('', { line: cursor.line, ch: 0 }, { line: cursor.line, ch: EditorState.tabSize });
            }
        }
    }
    
    toggleComment() {
        if (!AppState.editor) return;
        
        const selection = AppState.editor.getSelection();
        if (selection) {
            // Toggle comment for each line
            const lines = selection.split('\n');
            const toggled = lines.map(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('//')) {
                    return line.replace(/^\s*\/\//, '');
                } else if (trimmed) {
                    return ' '.repeat(line.length - trimmed.length) + '//' + trimmed;
                }
                return line;
            }).join('\n');
            AppState.editor.replaceSelection(toggled);
        } else {
            // Toggle comment for current line
            const cursor = AppState.editor.getCursor();
            const line = AppState.editor.getLine(cursor.line);
            const trimmed = line.trim();
            
            if (trimmed.startsWith('//')) {
                AppState.editor.replaceRange(
                    line.replace(/^\s*\/\//, ''),
                    { line: cursor.line, ch: 0 },
                    { line: cursor.line, ch: line.length }
                );
            } else if (trimmed) {
                AppState.editor.replaceRange(
                    ' '.repeat(line.length - trimmed.length) + '//' + trimmed,
                    { line: cursor.line, ch: 0 },
                    { line: cursor.line, ch: line.length }
                );
            }
        }
    }
    
    // ============================================
    // Text Operations
    // ============================================
    
    cut() {
        if (!AppState.editor) return;
        AppState.editor.execCommand('cut');
    }
    
    copy() {
        if (!AppState.editor) return;
        AppState.editor.execCommand('copy');
    }
    
    paste() {
        if (!AppState.editor) return;
        AppState.editor.execCommand('paste');
    }
    
    selectAll() {
        if (!AppState.editor) return;
        AppState.editor.execCommand('selectAll');
    }
    
    // ============================================
    // Settings
    // ============================================
    
    updateSettings() {
        if (!AppState.editor) return;
        
        // Update editor settings
        AppState.editor.setOption('lineNumbers', AppState.settings.lineNumbers);
        AppState.editor.setOption('lineWrapping', AppState.settings.wordWrap);
        AppState.editor.setOption('tabSize', AppState.settings.tabSize);
        AppState.editor.setOption('indentUnit', AppState.settings.tabSize);
        AppState.editor.setOption('theme', AppState.settings.theme === 'dark' ? 'dracula' : 'default');
        AppState.editor.setOption('autoCloseBrackets', AppState.settings.autoCloseBrackets);
        AppState.editor.setOption('matchBrackets', AppState.settings.matchBrackets);
        
        // Update font size
        const editorWrapper = document.querySelector('.CodeMirror');
        if (editorWrapper) {
            editorWrapper.style.fontSize = AppState.settings.fontSize + 'px';
        }
        
        // Update minimap visibility
        if (this.minimap) {
            this.minimap.style.display = AppState.settings.showMinimap ? 'block' : 'none';
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
                        Debugger.logError(error.message, error.file, error.line, error.column);
                    });
                }
            }
        }, 500);
    }
    
    // ============================================
    // Utility Methods
    // ============================================
    
    getValue() {
        if (!AppState.editor) return '';
        return AppState.editor.getValue();
    }
    
    setValue(content) {
        if (!AppState.editor) return;
        AppState.editor.setValue(content);
    }
    
    getCursor() {
        if (!AppState.editor) return { line: 0, ch: 0 };
        return AppState.editor.getCursor();
    }
    
    setCursor(line, ch) {
        if (!AppState.editor) return;
        AppState.editor.setCursor(line, ch);
    }
    
    getSelection() {
        if (!AppState.editor) return '';
        return AppState.editor.getSelection();
    }
    
    focus() {
        if (!AppState.editor) return;
        AppState.editor.focus();
    }
    
    blur() {
        if (!AppState.editor) return;
        AppState.editor.getInputField().blur();
    }
}

// ============================================
// Initialize Editor
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Editor.init();
    });
} else {
    Editor.init();
}

// Export
window.Editor = Editor;
window.EditorState = EditorState;
