/**
 * Scratch Vibe Coding IDE - Settings Module
 * Handles application settings and preferences
 */

// ============================================
// Default Settings
// ============================================

const DefaultSettings = {
    // Theme
    theme: 'dark',
    
    // Editor
    fontSize: 14,
    tabSize: 4,
    lineNumbers: true,
    wordWrap: false,
    autoCloseBrackets: true,
    matchBrackets: true,
    showMinimap: true,
    autoComplete: true,
    autoIndent: true,
    
    // Autosave
    autoSave: true,
    autoSaveInterval: 30,
    
    // Compilation
    autoCompile: false,
    strictMode: true,
    optimization: 'basic',
    
    // Preview
    previewScale: 1,
    showFPS: true,
    showDebug: false,
    
    // Language
    language: 'de',
    
    // UI
    uiScale: 1
};

// ============================================
// Settings State
// ============================================

const SettingsState = {
    settings: { ...DefaultSettings },
    isLoaded: false,
    isModified: false
};

// ============================================
// Settings Module
// ============================================

const Settings = {
    // ============================================
    // Initialization
    // ============================================
    
    init() {
        console.log('Initializing Settings...');
        
        this.cacheElements();
        this.setupEvents();
        this.load();
        
        console.log('Settings initialized');
    },
    
    cacheElements() {
        // Settings modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.settingsTabs = document.querySelectorAll('.settings-tab');
        this.settingsPanels = document.querySelectorAll('.settings-panel');
        this.settingsContent = document.getElementById('settingsContent');
        
        // Save button
        this.btnSave = document.getElementById('settingsModalSave');
        this.btnCancel = document.getElementById('settingsModalCancel');
    },
    
    setupEvents() {
        // Settings tabs
        if (this.settingsTabs) {
            this.settingsTabs.forEach(tab => {
                tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
            });
        }
        
        // Save button
        if (this.btnSave) {
            this.btnSave.addEventListener('click', () => this.saveFromForm());
        }
        
        // Cancel button
        if (this.btnCancel) {
            this.btnCancel.addEventListener('click', () => this.closeModal());
        }
        
        // Close button
        const closeBtn = document.getElementById('settingsModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
    },
    
    // ============================================
    // Settings Management
    // ============================================
    
    async load() {
        try {
            // Try to load from localStorage
            const savedSettings = localStorage.getItem('vibeSettings');
            
            if (savedSettings) {
                SettingsState.settings = JSON.parse(savedSettings);
            }
            
            // Apply default values for any missing settings
            for (const key in DefaultSettings) {
                if (SettingsState.settings[key] === undefined) {
                    SettingsState.settings[key] = DefaultSettings[key];
                }
            }
            
            SettingsState.isLoaded = true;
            
            // Apply settings
            this.apply();
            
            console.log('Settings loaded');
        } catch (error) {
            console.error('Error loading settings:', error);
            // Use defaults
            SettingsState.settings = { ...DefaultSettings };
        }
    },
    
    async save() {
        try {
            // Save to localStorage
            localStorage.setItem('vibeSettings', JSON.stringify(SettingsState.settings));
            
            // Apply settings
            this.apply();
            
            SettingsState.isModified = false;
            
            console.log('Settings saved');
            
            Notifications.show('Einstellungen gespeichert', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            Notifications.show('Fehler beim Speichern der Einstellungen', 'error');
        }
    }
    
    apply() {
        // Apply theme
        Theme.applyTheme(SettingsState.settings.theme);
        
        // Update editor settings
        if (AppState.editor) {
            AppState.editor.setOption('lineNumbers', SettingsState.settings.lineNumbers);
            AppState.editor.setOption('lineWrapping', SettingsState.settings.wordWrap);
            AppState.editor.setOption('tabSize', SettingsState.settings.tabSize);
            AppState.editor.setOption('indentUnit', SettingsState.settings.tabSize);
            AppState.editor.setOption('autoCloseBrackets', SettingsState.settings.autoCloseBrackets);
            AppState.editor.setOption('matchBrackets', SettingsState.settings.matchBrackets);
            
            // Update font size
            const editorWrapper = document.querySelector('.CodeMirror');
            if (editorWrapper) {
                editorWrapper.style.fontSize = SettingsState.settings.fontSize + 'px';
            }
        }
        
        // Update autosave
        if (SettingsState.settings.autoSave) {
            App.startAutosave();
        } else {
            App.stopAutosave();
        }
        
        // Update autosave status
        App.updateAutosaveStatus();
        
        // Update minimap visibility
        const minimap = document.getElementById('editorMinimap');
        if (minimap) {
            minimap.style.display = SettingsState.settings.showMinimap ? 'block' : 'none';
        }
        
        // Update AppState settings
        AppState.settings = { ...SettingsState.settings };
    }
    
    reset() {
        SettingsState.settings = { ...DefaultSettings };
        SettingsState.isModified = true;
        
        // Apply default settings
        this.apply();
        
        // Update form
        this.updateForm();
        
        Notifications.show('Einstellungen zurückgesetzt', 'info');
    }
    
    get(key) {
        return SettingsState.settings[key];
    }
    
    set(key, value) {
        SettingsState.settings[key] = value;
        SettingsState.isModified = true;
    }
    
    // ============================================
    // Form Handling
    // ============================================
    
    openModal() {
        if (!this.settingsModal) return;
        
        // Update form with current settings
        this.updateForm();
        
        // Show modal
        this.settingsModal.style.display = 'flex';
    }
    
    closeModal() {
        if (!this.settingsModal) return;
        
        this.settingsModal.style.display = 'none';
    }
    
    updateForm() {
        // General settings
        const themeSelect = document.getElementById('settingTheme');
        if (themeSelect) {
            themeSelect.value = SettingsState.settings.theme;
        }
        
        const languageSelect = document.getElementById('settingLanguage');
        if (languageSelect) {
            languageSelect.value = SettingsState.settings.language;
        }
        
        const autosaveCheckbox = document.getElementById('settingAutosave');
        if (autosaveCheckbox) {
            autosaveCheckbox.checked = SettingsState.settings.autoSave;
        }
        
        const autosaveIntervalInput = document.getElementById('settingAutosaveInterval');
        if (autosaveIntervalInput) {
            autosaveIntervalInput.value = SettingsState.settings.autoSaveInterval;
        }
        
        // Editor settings
        const fontSizeInput = document.getElementById('settingFontSize');
        if (fontSizeInput) {
            fontSizeInput.value = SettingsState.settings.fontSize;
        }
        
        const tabSizeInput = document.getElementById('settingTabSize');
        if (tabSizeInput) {
            tabSizeInput.value = SettingsState.settings.tabSize;
        }
        
        const showMinimapCheckbox = document.getElementById('settingShowMinimap');
        if (showMinimapCheckbox) {
            showMinimapCheckbox.checked = SettingsState.settings.showMinimap;
        }
        
        const wordWrapCheckbox = document.getElementById('settingWordWrap');
        if (wordWrapCheckbox) {
            wordWrapCheckbox.checked = SettingsState.settings.wordWrap;
        }
        
        const lineNumbersCheckbox = document.getElementById('settingLineNumbers');
        if (lineNumbersCheckbox) {
            lineNumbersCheckbox.checked = SettingsState.settings.lineNumbers;
        }
        
        const autoCompleteCheckbox = document.getElementById('settingAutoComplete');
        if (autoCompleteCheckbox) {
            autoCompleteCheckbox.checked = SettingsState.settings.autoComplete;
        }
        
        // Preview settings
        const previewScaleSelect = document.getElementById('settingPreviewScale');
        if (previewScaleSelect) {
            previewScaleSelect.value = SettingsState.settings.previewScale;
        }
        
        const showFPSCheckbox = document.getElementById('settingShowFPS');
        if (showFPSCheckbox) {
            showFPSCheckbox.checked = SettingsState.settings.showFPS;
        }
        
        const showDebugCheckbox = document.getElementById('settingShowDebug');
        if (showDebugCheckbox) {
            showDebugCheckbox.checked = SettingsState.settings.showDebug;
        }
        
        // Compile settings
        const autoCompileCheckbox = document.getElementById('settingAutoCompile');
        if (autoCompileCheckbox) {
            autoCompileCheckbox.checked = SettingsState.settings.autoCompile;
        }
        
        const strictModeCheckbox = document.getElementById('settingStrictMode');
        if (strictModeCheckbox) {
            strictModeCheckbox.checked = SettingsState.settings.strictMode;
        }
        
        const optimizationSelect = document.getElementById('settingOptimization');
        if (optimizationSelect) {
            optimizationSelect.value = SettingsState.settings.optimization;
        }
    }
    
    saveFromForm() {
        // General settings
        const themeSelect = document.getElementById('settingTheme');
        if (themeSelect) {
            SettingsState.settings.theme = themeSelect.value;
        }
        
        const languageSelect = document.getElementById('settingLanguage');
        if (languageSelect) {
            SettingsState.settings.language = languageSelect.value;
        }
        
        const autosaveCheckbox = document.getElementById('settingAutosave');
        if (autosaveCheckbox) {
            SettingsState.settings.autoSave = autosaveCheckbox.checked;
        }
        
        const autosaveIntervalInput = document.getElementById('settingAutosaveInterval');
        if (autosaveIntervalInput) {
            SettingsState.settings.autoSaveInterval = parseInt(autosaveIntervalInput.value);
        }
        
        // Editor settings
        const fontSizeInput = document.getElementById('settingFontSize');
        if (fontSizeInput) {
            SettingsState.settings.fontSize = parseInt(fontSizeInput.value);
        }
        
        const tabSizeInput = document.getElementById('settingTabSize');
        if (tabSizeInput) {
            SettingsState.settings.tabSize = parseInt(tabSizeInput.value);
        }
        
        const showMinimapCheckbox = document.getElementById('settingShowMinimap');
        if (showMinimapCheckbox) {
            SettingsState.settings.showMinimap = showMinimapCheckbox.checked;
        }
        
        const wordWrapCheckbox = document.getElementById('settingWordWrap');
        if (wordWrapCheckbox) {
            SettingsState.settings.wordWrap = wordWrapCheckbox.checked;
        }
        
        const lineNumbersCheckbox = document.getElementById('settingLineNumbers');
        if (lineNumbersCheckbox) {
            SettingsState.settings.lineNumbers = lineNumbersCheckbox.checked;
        }
        
        const autoCompleteCheckbox = document.getElementById('settingAutoComplete');
        if (autoCompleteCheckbox) {
            SettingsState.settings.autoComplete = autoCompleteCheckbox.checked;
        }
        
        // Preview settings
        const previewScaleSelect = document.getElementById('settingPreviewScale');
        if (previewScaleSelect) {
            SettingsState.settings.previewScale = parseFloat(previewScaleSelect.value);
        }
        
        const showFPSCheckbox = document.getElementById('settingShowFPS');
        if (showFPSCheckbox) {
            SettingsState.settings.showFPS = showFPSCheckbox.checked;
        }
        
        const showDebugCheckbox = document.getElementById('settingShowDebug');
        if (showDebugCheckbox) {
            SettingsState.settings.showDebug = showDebugCheckbox.checked;
        }
        
        // Compile settings
        const autoCompileCheckbox = document.getElementById('settingAutoCompile');
        if (autoCompileCheckbox) {
            SettingsState.settings.autoCompile = autoCompileCheckbox.checked;
        }
        
        const strictModeCheckbox = document.getElementById('settingStrictMode');
        if (strictModeCheckbox) {
            SettingsState.settings.strictMode = strictModeCheckbox.checked;
        }
        
        const optimizationSelect = document.getElementById('settingOptimization');
        if (optimizationSelect) {
            SettingsState.settings.optimization = optimizationSelect.value;
        }
        
        // Save settings
        this.save();
        
        // Close modal
        this.closeModal();
    }
    
    switchTab(tabName) {
        if (!this.settingsTabs || !this.settingsPanels) return;
        
        // Update tabs
        this.settingsTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update panels
        this.settingsPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === `settings${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`) {
                panel.classList.add('active');
            }
        });
    }
    
    // ============================================
    // Command Palette
    // ============================================
    
    static openCommandPalette() {
        const modal = document.getElementById('commandPaletteModal');
        const searchInput = document.getElementById('commandPaletteSearch');
        const commandList = document.getElementById('commandList');
        
        if (!modal || !searchInput || !commandList) return;
        
        // Show modal
        modal.style.display = 'flex';
        
        // Focus search input
        searchInput.focus();
        searchInput.value = '';
        
        // Populate command list
        this.populateCommandList('');
        
        // Setup search event
        searchInput.addEventListener('input', (e) => {
            this.populateCommandList(e.target.value);
        });
        
        // Setup keyboard navigation
        let selectedIndex = -1;
        
        const handleKeyDown = (e) => {
            const commands = commandList.querySelectorAll('.command-item');
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, commands.length - 1);
                    this.updateCommandSelection(commands, selectedIndex);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, -1);
                    this.updateCommandSelection(commands, selectedIndex);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && selectedIndex < commands.length) {
                        const command = commands[selectedIndex];
                        const action = command.dataset.action;
                        if (action && window[action]) {
                            window[action]();
                        } else if (command.dataset.command) {
                            const cmd = window.VibeCommands.find(c => c.name === command.dataset.command);
                            if (cmd && cmd.action) {
                                cmd.action();
                            }
                        }
                        this.closeCommandPalette();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.closeCommandPalette();
                    break;
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Store reference to remove event listener later
        modal._commandPaletteKeyHandler = handleKeyDown;
    }
    
    static populateCommandList(query) {
        const commandList = document.getElementById('commandList');
        if (!commandList) return;
        
        // Clear existing commands
        commandList.innerHTML = '';
        
        // Get commands
        const commands = window.VibeCommands || [];
        
        // Filter commands by query
        const filtered = commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            (cmd.category && cmd.category.toLowerCase().includes(query.toLowerCase()))
        );
        
        // Group commands by category
        const categories = {};
        filtered.forEach(cmd => {
            const category = cmd.category || 'Andere';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(cmd);
        });
        
        // Render commands
        for (const category in categories) {
            // Category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'command-category';
            categoryHeader.textContent = category;
            commandList.appendChild(categoryHeader);
            
            // Category commands
            for (const cmd of categories[category]) {
                const commandItem = document.createElement('div');
                commandItem.className = 'command-item';
                commandItem.dataset.command = cmd.name;
                
                // Command name
                const nameSpan = document.createElement('span');
                nameSpan.className = 'command-name';
                nameSpan.textContent = cmd.name;
                commandItem.appendChild(nameSpan);
                
                // Command shortcut
                if (cmd.shortcut) {
                    const shortcutSpan = document.createElement('span');
                    shortcutSpan.className = 'command-shortcut';
                    shortcutSpan.textContent = cmd.shortcut;
                    commandItem.appendChild(shortcutSpan);
                }
                
                // Click handler
                commandItem.addEventListener('click', () => {
                    if (cmd.action) {
                        cmd.action();
                    }
                    this.closeCommandPalette();
                });
                
                commandList.appendChild(commandItem);
            }
        }
        
        // If no commands found
        if (filtered.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'command-no-results';
            noResults.textContent = 'Keine Befehle gefunden';
            commandList.appendChild(noResults);
        }
    }
    
    static updateCommandSelection(commands, selectedIndex) {
        commands.forEach((cmd, index) => {
            if (index === selectedIndex) {
                cmd.classList.add('selected');
                cmd.scrollIntoView({ block: 'nearest' });
            } else {
                cmd.classList.remove('selected');
            }
        });
    }
    
    static closeCommandPalette() {
        const modal = document.getElementById('commandPaletteModal');
        if (!modal) return;
        
        modal.style.display = 'none';
        
        // Remove event listener
        if (modal._commandPaletteKeyHandler) {
            document.removeEventListener('keydown', modal._commandPaletteKeyHandler);
            modal._commandPaletteKeyHandler = null;
        }
    }
    
    // ============================================
    // Theme Management
    // ============================================
    
    setTheme(theme) {
        SettingsState.settings.theme = theme;
        SettingsState.isModified = true;
        
        Theme.applyTheme(theme);
        this.save();
    }
    
    cycleTheme() {
        const themes = ['dark', 'light', 'high-contrast'];
        const currentIndex = themes.indexOf(SettingsState.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        
        this.setTheme(themes[nextIndex]);
    }
    
    // ============================================
    // Language Management
    // ============================================
    
    setLanguage(language) {
        SettingsState.settings.language = language;
        SettingsState.isModified = true;
        
        this.save();
        
        // In a real implementation, we would reload the UI with the new language
        Notifications.show(`Sprache geändert zu: ${language}`, 'info');
    }
};

// ============================================
// Theme Module
// ============================================

const Theme = {
    applyTheme(theme) {
        // Remove existing theme classes
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast');
        
        // Add new theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Set data-theme attribute
        document.body.setAttribute('data-theme', theme);
        
        // Update CodeMirror theme
        if (AppState.editor) {
            AppState.editor.setOption('theme', theme === 'dark' ? 'dracula' : 'default');
        }
        
        // Update status bar
        const statusBar = document.getElementById('statusbar');
        if (statusBar) {
            statusBar.style.background = theme === 'dark' ? 'var(--bg-statusbar)' : 
                theme === 'light' ? '#f6f8fa' : '#1a1a1a';
        }
    }
};

// ============================================
// Initialize Settings
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Settings.init();
    });
} else {
    Settings.init();
}

// Export
window.Settings = Settings;
window.SettingsState = SettingsState;
window.DefaultSettings = DefaultSettings;
window.Theme = Theme;
