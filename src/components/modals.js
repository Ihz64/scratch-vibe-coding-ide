/**
 * Scratch Vibe Coding IDE - Modals Component
 * Handles all modal dialogs
 */

// ============================================
// Modals State
// ============================================

const ModalsState = {
    activeModal: null,
    modalStack: []
};

// ============================================
// Modals Component
// ============================================

const Modals = {
    // ============================================
    // Initialization
    // ============================================
    
    init() {
        console.log('Initializing Modals...');
        
        this.cacheElements();
        this.setupEvents();
        
        console.log('Modals initialized');
    },
    
    cacheElements() {
        // Login Modal
        this.loginModal = document.getElementById('loginModal');
        this.loginForm = document.getElementById('loginForm');
        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');
        this.loginRemember = document.getElementById('loginRemember');
        
        // Prefill with demo credentials
        if (this.loginEmail && !this.loginEmail.value) {
            this.loginEmail.value = 'demo@scratchvibe.com';
            this.loginEmail.placeholder = 'demo@scratchvibe.com';
        }
        if (this.loginPassword && !this.loginPassword.value) {
            this.loginPassword.value = 'demo123';
            this.loginPassword.placeholder = 'demo123';
        }
        this.loginModalClose = document.getElementById('loginModalClose');
        this.loginModalCancel = document.getElementById('loginModalCancel');
        this.loginModalSubmit = document.getElementById('loginModalSubmit');
        
        // Register Modal
        this.registerModal = document.getElementById('registerModal');
        this.registerForm = document.getElementById('registerForm');
        this.registerName = document.getElementById('registerName');
        this.registerEmail = document.getElementById('registerEmail');
        this.registerPassword = document.getElementById('registerPassword');
        this.registerConfirmPassword = document.getElementById('registerConfirmPassword');
        this.registerModalClose = document.getElementById('registerModalClose');
        this.registerModalCancel = document.getElementById('registerModalCancel');
        this.registerModalSubmit = document.getElementById('registerModalSubmit');
        
        // New Project Modal
        this.newProjectModal = document.getElementById('newProjectModal');
        this.newProjectForm = document.getElementById('newProjectForm');
        this.newProjectName = document.getElementById('newProjectName');
        this.newProjectTemplate = document.getElementById('newProjectTemplate');
        this.newProjectDescription = document.getElementById('newProjectDescription');
        this.newProjectModalClose = document.getElementById('newProjectModalClose');
        this.newProjectModalCancel = document.getElementById('newProjectModalCancel');
        this.newProjectModalSubmit = document.getElementById('newProjectModalSubmit');
        
        // Settings Modal
        this.settingsModal = document.getElementById('settingsModal');
        this.settingsModalClose = document.getElementById('settingsModalClose');
        this.settingsModalCancel = document.getElementById('settingsModalCancel');
        this.settingsModalSave = document.getElementById('settingsModalSave');
        
        // Export Modal
        this.exportModal = document.getElementById('exportModal');
        this.exportFilename = document.getElementById('exportFilename');
        this.exportWithAssets = document.getElementById('exportWithAssets');
        this.exportProjectName = document.getElementById('exportProjectName');
        this.exportFileSize = document.getElementById('exportFileSize');
        this.exportSpriteCount = document.getElementById('exportSpriteCount');
        this.exportSceneCount = document.getElementById('exportSceneCount');
        this.exportModalClose = document.getElementById('exportModalClose');
        this.exportModalCancel = document.getElementById('exportModalCancel');
        this.exportModalSubmit = document.getElementById('exportModalSubmit');
        
        // Import Modal
        this.importModal = document.getElementById('importModal');
        this.importFileInput = document.getElementById('importFileInput');
        this.importFileBtn = document.getElementById('importFileBtn');
        this.importDropZone = document.getElementById('importDropZone');
        this.importPreview = document.getElementById('importPreview');
        this.importProjectName = document.getElementById('importProjectName');
        this.importSpriteCount = document.getElementById('importSpriteCount');
        this.importSceneCount = document.getElementById('importSceneCount');
        this.importModalClose = document.getElementById('importModalClose');
        this.importModalCancel = document.getElementById('importModalCancel');
        this.importModalSubmit = document.getElementById('importModalSubmit');
        
        // Debug Console Modal
        this.debugConsoleModal = document.getElementById('debugConsoleModal');
        this.debugConsole = document.getElementById('debugConsole');
        this.debugOutput = document.getElementById('debugOutput');
        this.debugConsoleClose = document.getElementById('debugConsoleClose');
        this.debugConsoleCloseBtn = document.getElementById('debugConsoleCloseBtn');
        this.debugConsoleClear = document.getElementById('debugConsoleClear');
        
        // Command Palette Modal
        this.commandPaletteModal = document.getElementById('commandPaletteModal');
        this.commandPaletteSearch = document.getElementById('commandPaletteSearch');
        this.commandList = document.getElementById('commandList');
        this.commandPaletteClose = document.getElementById('commandPaletteClose');
        
        // Notification Container
        this.notificationContainer = document.getElementById('notificationContainer');
    },
    
    setupEvents() {
        // Close modals on overlay click
        this.setupOverlayClicks();
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });
        
        // Login Modal
        this.setupLoginModal();
        
        // Register Modal
        this.setupRegisterModal();
        
        // New Project Modal
        this.setupNewProjectModal();
        
        // Export Modal
        this.setupExportModal();
        
        // Import Modal
        this.setupImportModal();
        
        // Debug Console Modal
        this.setupDebugConsoleModal();
        
        // Command Palette Modal
        this.setupCommandPaletteModal();
    },
    
    setupOverlayClicks() {
        // Get all modal overlays
        const overlays = document.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay);
                }
            });
        });
    },
    
    // ============================================
    // Modal Management
    // ============================================
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Close active modal
        this.closeActiveModal();
        
        // Show new modal
        modal.style.display = 'flex';
        ModalsState.activeModal = modal;
        
        // Add to stack
        ModalsState.modalStack.push(modal);
        
        // Focus first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            firstInput.focus();
        }
    }
    
    closeModal(modal) {
        if (!modal) return;
        
        modal.style.display = 'none';
        
        // Remove from stack
        const index = ModalsState.modalStack.indexOf(modal);
        if (index !== -1) {
            ModalsState.modalStack.splice(index, 1);
        }
        
        // Set active modal
        ModalsState.activeModal = ModalsState.modalStack[ModalsState.modalStack.length - 1] || null;
    }
    
    closeActiveModal() {
        if (ModalsState.activeModal) {
            this.closeModal(ModalsState.activeModal);
        }
    }
    
    closeAll() {
        ModalsState.modalStack.forEach(modal => {
            modal.style.display = 'none';
        });
        
        ModalsState.modalStack = [];
        ModalsState.activeModal = null;
    }
    
    // ============================================
    // Login Modal
    // ============================================
    
    setupLoginModal() {
        if (!this.loginModal) return;
        
        // Close button
        if (this.loginModalClose) {
            this.loginModalClose.addEventListener('click', () => this.closeLogin());
        }
        
        // Cancel button
        if (this.loginModalCancel) {
            this.loginModalCancel.addEventListener('click', () => this.closeLogin());
        }
        
        // Submit button
        if (this.loginModalSubmit) {
            this.loginModalSubmit.addEventListener('click', () => this.submitLogin());
        }
        
        // Add Enter key support
        if (this.loginForm) {
            this.loginForm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submitLogin();
                }
            });
        }
        
        // Form submit
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitLogin();
            });
        }
    }
    
    openLogin() {
        this.openModal('loginModal');
        
        // Auto-focus on email field
        setTimeout(() => {
            if (this.loginEmail) {
                this.loginEmail.focus();
                this.loginEmail.select();
            }
        }, 100);
    }
    
    closeLogin() {
        this.closeModal(this.loginModal);
        
        // Reset form
        if (this.loginForm) {
            this.loginForm.reset();
        }
    }
    
    async submitLogin() {
        if (!this.loginForm) return;
        
        const email = this.loginEmail.value;
        const password = this.loginPassword.value;
        const remember = this.loginRemember.checked;
        
        if (!email || !password) {
            Notifications.show('Bitte E-Mail und Passwort eingeben', 'error');
            return;
        }
        
        try {
            // Show loading state
            this.loginModalSubmit.disabled = true;
            this.loginModalSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmelden...';
            
            // Login
            const user = await Auth.login(email, password);
            
            if (user) {
                // Success
                Notifications.show(`Willkommen, ${user.name || user.email}!`, 'success');
                
                // Close modal
                this.closeLogin();
                
                // Update UI
                App.updateUserUI();
                
                // Load projects
                await App.loadInitialProject();
            } else {
                Notifications.show('Anmeldung fehlgeschlagen - Benutzer nicht gefunden', 'error');
            }
        } catch (error) {
            Notifications.show(error.message || 'Anmeldung fehlgeschlagen', 'error');
        } finally {
            // Reset button
            this.loginModalSubmit.disabled = false;
            this.loginModalSubmit.innerHTML = '<i class="fas fa-user"></i> Anmelden';
        }
    }
    
    // ============================================
    // Register Modal
    // ============================================
    
    setupRegisterModal() {
        if (!this.registerModal) return;
        
        // Close button
        if (this.registerModalClose) {
            this.registerModalClose.addEventListener('click', () => this.closeRegister());
        }
        
        // Cancel button
        if (this.registerModalCancel) {
            this.registerModalCancel.addEventListener('click', () => this.closeRegister());
        }
        
        // Submit button
        if (this.registerModalSubmit) {
            this.registerModalSubmit.addEventListener('click', () => this.submitRegister());
        }
        
        // Form submit
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRegister();
            });
        }
    }
    
    openRegister() {
        this.openModal('registerModal');
    }
    
    closeRegister() {
        this.closeModal(this.registerModal);
        
        // Reset form
        if (this.registerForm) {
            this.registerForm.reset();
        }
    }
    
    async submitRegister() {
        if (!this.registerForm) return;
        
        const name = this.registerName.value;
        const email = this.registerEmail.value;
        const password = this.registerPassword.value;
        const confirmPassword = this.registerConfirmPassword.value;
        
        if (!name || !email || !password) {
            Notifications.show('Bitte alle Felder ausfüllen', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            Notifications.show('Passwörter stimmen nicht überein', 'error');
            return;
        }
        
        try {
            // Show loading state
            this.registerModalSubmit.disabled = true;
            this.registerModalSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrieren...';
            
            // Register
            const user = await Auth.register(name, email, password);
            
            if (user) {
                // Success
                Notifications.show('Registrierung erfolgreich!', 'success');
                
                // Close modal
                this.closeRegister();
                
                // Open login modal
                this.openLogin();
            } else {
                Notifications.show('Registrierung fehlgeschlagen', 'error');
            }
        } catch (error) {
            Notifications.show(error.message, 'error');
        } finally {
            // Reset button
            this.registerModalSubmit.disabled = false;
            this.registerModalSubmit.innerHTML = '<i class="fas fa-user-plus"></i> Registrieren';
        }
    }
    
    // ============================================
    // New Project Modal
    // ============================================
    
    setupNewProjectModal() {
        if (!this.newProjectModal) return;
        
        // Close button
        if (this.newProjectModalClose) {
            this.newProjectModalClose.addEventListener('click', () => this.closeNewProject());
        }
        
        // Cancel button
        if (this.newProjectModalCancel) {
            this.newProjectModalCancel.addEventListener('click', () => this.closeNewProject());
        }
        
        // Submit button
        if (this.newProjectModalSubmit) {
            this.newProjectModalSubmit.addEventListener('click', () => this.submitNewProject());
        }
        
        // Form submit
        if (this.newProjectForm) {
            this.newProjectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitNewProject();
            });
        }
    }
    
    openNewProject() {
        this.openModal('newProjectModal');
        
        // Set default name
        if (this.newProjectName) {
            this.newProjectName.value = `Projekt ${AppState.currentProject ? Object.keys(AppState.currentProject).length + 1 : 1}`;
        }
    }
    
    closeNewProject() {
        this.closeModal(this.newProjectModal);
        
        // Reset form
        if (this.newProjectForm) {
            this.newProjectForm.reset();
        }
    }
    
    async submitNewProject() {
        if (!this.newProjectForm) return;
        
        const name = this.newProjectName.value.trim();
        const template = this.newProjectTemplate.value;
        const description = this.newProjectDescription.value;
        
        if (!name) {
            Notifications.show('Bitte einen Projekt-Namen eingeben', 'error');
            return;
        }
        
        try {
            // Close current project first
            await App.closeProject();
            
            // Create new project
            await App.createNewProject(name, template);
            
            // Update project description
            if (AppState.currentProject) {
                AppState.currentProject.description = description;
                await Database.updateProject(AppState.currentProject.id, { description });
            }
            
            // Close modal
            this.closeNewProject();
            
            Notifications.show(`Projekt "${name}" erstellt`, 'success');
        } catch (error) {
            Notifications.show(error.message, 'error');
        }
    }
    
    // ============================================
    // Settings Modal
    // ============================================
    
    setupSettingsModal() {
        // Settings are handled in the Settings module
    }
    
    openSettings() {
        Settings.openModal();
    }
    
    closeSettings() {
        Settings.closeModal();
    }
    
    // ============================================
    // Export Modal
    // ============================================
    
    setupExportModal() {
        if (!this.exportModal) return;
        
        // Close button
        if (this.exportModalClose) {
            this.exportModalClose.addEventListener('click', () => this.closeExport());
        }
        
        // Cancel button
        if (this.exportModalCancel) {
            this.exportModalCancel.addEventListener('click', () => this.closeExport());
        }
        
        // Submit button
        if (this.exportModalSubmit) {
            this.exportModalSubmit.addEventListener('click', () => this.submitExport());
        }
        
        // Filename change
        if (this.exportFilename) {
            this.exportFilename.addEventListener('input', () => this.updateExportInfo());
        }
    }
    
    openExport() {
        if (!AppState.currentProject) {
            Notifications.show('Kein Projekt zum Exportieren', 'error');
            return;
        }
        
        // Set default filename
        if (this.exportFilename) {
            this.exportFilename.value = AppState.currentProject.name || 'mein_projekt';
        }
        
        // Update info
        this.updateExportInfo();
        
        this.openModal('exportModal');
    }
    
    closeExport() {
        this.closeModal(this.exportModal);
    }
    
    updateExportInfo() {
        if (!AppState.currentProject) return;
        
        // Update project name
        if (this.exportProjectName) {
            this.exportProjectName.textContent = AppState.currentProject.name || 'Unbenannt';
        }
        
        // Calculate file size
        const projectSize = JSON.stringify(AppState.currentProject).length;
        const sizeInKB = Math.round(projectSize / 1024);
        if (this.exportFileSize) {
            this.exportFileSize.textContent = `${sizeInKB} KB`;
        }
        
        // Count sprites and scenes
        const spriteCount = AppState.currentProject.files ? 
            AppState.currentProject.files.filter(f => f.type === 'sprite').length : 0;
        const sceneCount = AppState.currentProject.files ? 
            AppState.currentProject.files.filter(f => f.type === 'scene' || f.type === 'level').length : 0;
        
        if (this.exportSpriteCount) {
            this.exportSpriteCount.textContent = spriteCount;
        }
        
        if (this.exportSceneCount) {
            this.exportSceneCount.textContent = sceneCount;
        }
    }
    
    async submitExport() {
        if (!AppState.currentProject) return;
        
        const filename = this.exportFilename.value.trim();
        const withAssets = this.exportWithAssets.checked;
        
        if (!filename) {
            Notifications.show('Bitte einen Dateinamen eingeben', 'error');
            return;
        }
        
        try {
            // Show loading state
            this.exportModalSubmit.disabled = true;
            this.exportModalSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportieren...';
            
            // Compile project
            const result = Compiler.compile(AppState.currentProject);
            
            if (result.errors && result.errors.length > 0) {
                Notifications.show('Kompilierungsfehler: ' + result.errors[0].message, 'error');
                return;
            }
            
            // Export as .sb3
            const blob = await SB3Export.exportProject(result.project, { includeAssets: withAssets });
            await SB3Export.downloadSB3(blob, `${filename}.sb3`);
            
            Notifications.show('Projekt exportiert', 'success');
            
            // Close modal
            this.closeExport();
        } catch (error) {
            Notifications.show(error.message, 'error');
        } finally {
            // Reset button
            this.exportModalSubmit.disabled = false;
            this.exportModalSubmit.innerHTML = '<i class="fas fa-file-export"></i> Exportieren';
        }
    }
    
    // ============================================
    // Import Modal
    // ============================================
    
    setupImportModal() {
        if (!this.importModal) return;
        
        // Close button
        if (this.importModalClose) {
            this.importModalClose.addEventListener('click', () => this.closeImport());
        }
        
        // Cancel button
        if (this.importModalCancel) {
            this.importModalCancel.addEventListener('click', () => this.closeImport());
        }
        
        // Submit button
        if (this.importModalSubmit) {
            this.importModalSubmit.addEventListener('click', () => this.submitImport());
        }
        
        // File button
        if (this.importFileBtn) {
            this.importFileBtn.addEventListener('click', () => this.importFileInput.click());
        }
        
        // File input change
        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', (e) => this.handleImportFile(e));
        }
        
        // Drop zone events
        if (this.importDropZone) {
            this.importDropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.importDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.importDropZone.addEventListener('drop', (e) => this.handleDrop(e));
        }
    }
    
    openImport() {
        this.openModal('importModal');
        
        // Reset preview
        if (this.importPreview) {
            this.importPreview.style.display = 'none';
        }
        
        // Reset submit button
        if (this.importModalSubmit) {
            this.importModalSubmit.disabled = true;
        }
    }
    
    closeImport() {
        this.closeModal(this.importModal);
        
        // Reset file input
        if (this.importFileInput) {
            this.importFileInput.value = '';
        }
        
        // Reset preview
        if (this.importPreview) {
            this.importPreview.style.display = 'none';
        }
    }
    
    handleImportFile(e) {
        const files = e.target.files;
        if (files && files.length > 0) {
            this.handleImportDrop(files);
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.importDropZone) {
            this.importDropZone.classList.add('drag-over');
        }
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.importDropZone) {
            this.importDropZone.classList.remove('drag-over');
        }
    }
    
    async handleDrop(files) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.importDropZone) {
            this.importDropZone.classList.remove('drag-over');
        }
        
        if (files && files.length > 0) {
            await this.processImportFile(files[0]);
        }
    }
    
    async processImportFile(file) {
        if (!file) return;
        
        try {
            // Check file type
            if (!file.name.endsWith('.sb3') && !file.name.endsWith('.json')) {
                Notifications.show('Bitte wähle eine .sb3 oder .json Datei', 'error');
                return;
            }
            
            // Parse the file
            const projectData = await SB3Export.importSB3(file);
            
            // Show preview
            if (this.importPreview) {
                this.importPreview.style.display = 'block';
            }
            
            if (this.importProjectName) {
                this.importProjectName.textContent = projectData.objName || 'Unbenannt';
            }
            
            // Count sprites and scenes
            const spriteCount = projectData.editorData && projectData.editorData.sprites ? 
                projectData.editorData.sprites.length : 0;
            const sceneCount = projectData.editorData && projectData.editorData.stage && 
                projectData.editorData.stage.costumes ? 
                projectData.editorData.stage.costumes.length : 0;
            
            if (this.importSpriteCount) {
                this.importSpriteCount.textContent = spriteCount;
            }
            
            if (this.importSceneCount) {
                this.importSceneCount.textContent = sceneCount;
            }
            
            // Enable submit button
            if (this.importModalSubmit) {
                this.importModalSubmit.disabled = false;
            }
            
            // Store project data for import
            this.importProjectData = projectData;
            
        } catch (error) {
            Notifications.show('Fehler beim Import: ' + error.message, 'error');
        }
    }
    
    async submitImport() {
        if (!this.importProjectData) return;
        
        try {
            // Show loading state
            this.importModalSubmit.disabled = true;
            this.importModalSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importieren...';
            
            // Import project
            const project = await Database.importProject(this.importProjectData);
            
            // Load the imported project
            await App.loadProject(project.id);
            
            Notifications.show('Projekt importiert', 'success');
            
            // Close modal
            this.closeImport();
            
            // Clear import data
            this.importProjectData = null;
        } catch (error) {
            Notifications.show(error.message, 'error');
        } finally {
            // Reset button
            this.importModalSubmit.disabled = false;
            this.importModalSubmit.innerHTML = '<i class="fas fa-file-import"></i> Importieren';
        }
    }
    
    // ============================================
    // Debug Console Modal
    // ============================================
    
    setupDebugConsoleModal() {
        if (!this.debugConsoleModal) return;
        
        // Close buttons
        if (this.debugConsoleClose) {
            this.debugConsoleClose.addEventListener('click', () => this.closeDebugConsole());
        }
        
        if (this.debugConsoleCloseBtn) {
            this.debugConsoleCloseBtn.addEventListener('click', () => this.closeDebugConsole());
        }
        
        // Clear button
        if (this.debugConsoleClear) {
            this.debugConsoleClear.addEventListener('click', () => Debugger.clear());
        }
    }
    
    openDebugConsole() {
        this.openModal('debugConsoleModal');
    }
    
    closeDebugConsole() {
        this.closeModal(this.debugConsoleModal);
    }
    
    // ============================================
    // Command Palette Modal
    // ============================================
    
    setupCommandPaletteModal() {
        if (!this.commandPaletteModal) return;
        
        // Close button
        if (this.commandPaletteClose) {
            this.commandPaletteClose.addEventListener('click', () => Settings.closeCommandPalette());
        }
    }
    
    openCommandPalette() {
        Settings.openCommandPalette();
    }
    
    closeCommandPalette() {
        Settings.closeCommandPalette();
    }
    
    // ============================================
    // Confirmation Dialog
    // ============================================
    
    static async showConfirm(title, message, confirmText = 'OK', cancelText = 'Abbrechen') {
        return new Promise((resolve) => {
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal';
            modalContent.style.maxWidth = '500px';
            
            // Header
            const header = document.createElement('div');
            header.className = 'modal-header';
            
            const titleEl = document.createElement('h2');
            titleEl.className = 'modal-title';
            titleEl.textContent = title;
            header.appendChild(titleEl);
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
            header.appendChild(closeBtn);
            modalContent.appendChild(header);
            
            // Body
            const body = document.createElement('div');
            body.className = 'modal-body';
            body.textContent = message;
            modalContent.appendChild(body);
            
            // Footer
            const footer = document.createElement('div');
            footer.className = 'modal-footer';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = cancelText;
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
            footer.appendChild(cancelBtn);
            
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn btn-primary';
            confirmBtn.textContent = confirmText;
            confirmBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(true);
            });
            footer.appendChild(confirmBtn);
            
            modalContent.appendChild(footer);
            modal.appendChild(modalContent);
            
            // Add to body
            document.body.appendChild(modal);
            
            // Focus confirm button
            confirmBtn.focus();
        });
    }
    
    // ============================================
    // Utility Methods
    // ============================================
    
    isModalOpen() {
        return ModalsState.modalStack.length > 0;
    }
    
    getActiveModal() {
        return ModalsState.activeModal;
    }
    
    getModalStack() {
        return [...ModalsState.modalStack];
    }
};

// ============================================
// Initialize Modals
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Modals.init();
    });
} else {
    Modals.init();
}

// Export
window.Modals = Modals;
window.ModalsState = ModalsState;
