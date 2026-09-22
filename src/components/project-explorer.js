/**
 * Scratch Vibe Coding IDE - Project Explorer Component
 * Handles the project tree view and file management
 */

// ============================================
// Project Explorer State
// ============================================

const ProjectExplorerState = {
    expandedFolders: new Set(),
    selectedItem: null,
    contextMenuItem: null,
    renameItem: null,
    searchQuery: '',
    filterType: 'all'
};

// ============================================
// Project Explorer Component
// ============================================

const ProjectExplorer = {
    // ============================================
    // Initialization
    // ============================================
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.refresh();
    },
    
    cacheElements() {
        this.container = document.getElementById('projectExplorer');
        this.searchInput = document.getElementById('treeSearch');
        this.newFileBtn = document.getElementById('btnNewFile');
        this.refreshBtn = document.getElementById('btnRefresh');
    },
    
    bindEvents() {
        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                ProjectExplorerState.searchQuery = e.target.value.toLowerCase();
                this.refresh();
            });
        }
        
        // New file button
        if (this.newFileBtn) {
            this.newFileBtn.addEventListener('click', () => {
                this.createNewFile();
            });
        }
        
        // Refresh button
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    },
    
    // ============================================
    // Main Functions
    // ============================================
    
    async refresh() {
        if (!this.container) return;
        
        if (!AppState.currentProject) {
            this.container.innerHTML = '<div class="tree-empty">Kein Projekt geöffnet</div>';
            return;
        }
        
        // Get project structure
        const project = AppState.currentProject;
        const files = await Database.getFilesByProject(project.id);
        const assets = await Database.getAssetsByProject(project.id);
        
        // Build tree structure
        const tree = this.buildTree(files, assets);
        
        // Render tree
        this.container.innerHTML = this.renderTree(tree);
        
        // Expand root folders by default
        this.expandFolder('root');
        this.expandFolder('sprites');
        this.expandFolder('scripts');
    },
    
    buildTree(files, assets) {
        // Organize files and assets into categories
        const tree = {
            id: 'root',
            name: project.name || 'Projekt',
            type: 'root',
            icon: 'fa-folder',
            children: []
        };
        
        // Add folders for different types
        const folders = [
            { id: 'sprites', name: 'Sprites', type: 'folder', icon: 'fa-cube', children: [] },
            { id: 'scripts', name: 'Scripts', type: 'folder', icon: 'fa-file-code', children: [] },
            { id: 'scenes', name: 'Szenen', type: 'folder', icon: 'fa-film', children: [] },
            { id: 'backdrops', name: 'Hintergründe', type: 'folder', icon: 'fa-image', children: [] },
            { id: 'assets', name: 'Assets', type: 'folder', icon: 'fa-folder-open', children: [] },
            { id: 'sounds', name: 'Sounds', type: 'folder', icon: 'fa-volume-up', children: [] },
            { id: 'variables', name: 'Variablen', type: 'folder', icon: 'fa-list', children: [] },
            { id: 'functions', name: 'Funktionen', type: 'folder', icon: 'fa-cog', children: [] }
        ];
        
        // Categorize files
        files.forEach(file => {
            let folder;
            
            switch (file.type) {
                case 'sprite':
                    folder = folders.find(f => f.id === 'sprites');
                    break;
                case 'script':
                case 'vibe':
                    folder = folders.find(f => f.id === 'scripts');
                    break;
                case 'scene':
                case 'level':
                    folder = folders.find(f => f.id === 'scenes');
                    break;
                case 'backdrop':
                    folder = folders.find(f => f.id === 'backdrops');
                    break;
                case 'variable':
                case 'list':
                    folder = folders.find(f => f.id === 'variables');
                    break;
                case 'function':
                    folder = folders.find(f => f.id === 'functions');
                    break;
                default:
                    folder = folders.find(f => f.id === 'scripts');
            }
            
            if (folder) {
                folder.children.push({
                    id: file.id,
                    name: file.name,
                    type: file.type,
                    icon: this.getFileIcon(file.type),
                    file: file
                });
            }
        });
        
        // Categorize assets
        assets.forEach(asset => {
            let folder = folders.find(f => f.id === 'assets');
            
            if (asset.type === 'sound' || asset.type === 'audio') {
                folder = folders.find(f => f.id === 'sounds');
            }
            
            if (folder) {
                folder.children.push({
                    id: asset.id,
                    name: asset.name,
                    type: asset.type,
                    icon: this.getAssetIcon(asset.type),
                    asset: asset
                });
            }
        });
        
        // Add folders to tree
        folders.forEach(folder => {
            // Filter by search query
            if (ProjectExplorerState.searchQuery) {
                folder.children = folder.children.filter(item => 
                    item.name.toLowerCase().includes(ProjectExplorerState.searchQuery)
                );
            }
            
            // Only add folder if it has children or is always visible
            if (folder.children.length > 0 || ['sprites', 'scripts', 'scenes'].includes(folder.id)) {
                tree.children.push(folder);
            }
        });
        
        return tree;
    },
    
    renderTree(tree) {
        let html = '';
        html += this.renderTreeItem(tree, 0);
        return html;
    },
    
    renderTreeItem(item, depth) {
        const indent = depth * 16;
        const isExpanded = ProjectExplorerState.expandedFolders.has(item.id);
        const hasChildren = item.children && item.children.length > 0;
        const isSelected = ProjectExplorerState.selectedItem === item.id;
        const iconClass = this.getIconClass(item);
        
        let html = '';
        
        // Item container
        html += `<div class="tree-item ${isExpanded ? 'expanded' : 'collapsed'} ${isSelected ? 'selected' : ''}" `;
        html += `data-id="${item.id}" data-type="${item.type}" style="padding-left: ${indent}px;">`;
        
        // Item header
        html += `<div class="tree-item-header" draggable="true">`;
        
        // Expand/collapse icon (for folders)
        if (hasChildren) {
            html += `<span class="tree-expand-icon"><i class="fas fa-chevron-right"></i></span>`;
        } else {
            html += `<span class="tree-expand-icon" style="visibility: hidden;"><i class="fas fa-chevron-right"></i></span>`;
        }
        
        // Icon
        html += `<span class="icon"><i class="fas ${iconClass}"></i></span>`;
        
        // Name
        html += `<span class="label">${this.escapeHtml(item.name)}</span>`;
        
        // Actions (for files)
        if (item.type !== 'root' && item.type !== 'folder') {
            html += `<span class="actions">`;
            if (item.file) {
                html += `<button class="action-btn" title="Öffnen" data-action="open"><i class="fas fa-folder-open"></i></button>`;
            }
            html += `<button class="action-btn" title="Mehr" data-action="context"><i class="fas fa-ellipsis-v"></i></button>`;
            html += `</span>`;
        }
        
        html += `</div>`;
        
        // Children (if expanded and has children)
        if (hasChildren && isExpanded) {
            html += `<div class="tree-children">`;
            item.children.forEach(child => {
                html += this.renderTreeItem(child, depth + 1);
            });
            html += `</div>`;
        }
        
        html += `</div>`;
        
        return html;
    },
    
    getIconClass(item) {
        const typeMap = {
            'root': 'fa-folder',
            'folder': 'fa-folder',
            'sprite': 'fa-cube',
            'script': 'fa-file-code',
            'vibe': 'fa-file-code',
            'scene': 'fa-film',
            'level': 'fa-flag',
            'backdrop': 'fa-image',
            'asset': 'fa-file',
            'sound': 'fa-volume-up',
            'audio': 'fa-volume-up',
            'variable': 'fa-list',
            'list': 'fa-list-ul',
            'function': 'fa-cog'
        };
        
        return typeMap[item.type] || 'fa-file';
    },
    
    getFileIcon(type) {
        return this.getIconClass({ type: type });
    },
    
    getAssetIcon(type) {
        const iconMap = {
            'image': 'fa-image',
            'png': 'fa-image',
            'jpg': 'fa-image',
            'jpeg': 'fa-image',
            'svg': 'fa-image',
            'sound': 'fa-volume-up',
            'audio': 'fa-volume-up',
            'wav': 'fa-volume-up',
            'mp3': 'fa-volume-up',
            'costume': 'fa-user',
            'background': 'fa-image'
        };
        
        return iconMap[type] || 'fa-file';
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // ============================================
    // Tree Navigation
    // ============================================
    
    expandFolder(folderId) {
        ProjectExplorerState.expandedFolders.add(folderId);
        this.refresh();
    },
    
    collapseFolder(folderId) {
        ProjectExplorerState.expandedFolders.delete(folderId);
        this.refresh();
    },
    
    toggleFolder(folderId) {
        if (ProjectExplorerState.expandedFolders.has(folderId)) {
            this.collapseFolder(folderId);
        } else {
            this.expandFolder(folderId);
        }
    },
    
    selectItem(itemId) {
        ProjectExplorerState.selectedItem = itemId;
        this.refresh();
    },
    
    // ============================================
    // File Operations
    // ============================================
    
    async createNewFile(type = 'vibe', name = null) {
        if (!AppState.currentProject) {
            Notifications.show('Kein Projekt geöffnet', 'error');
            return;
        }
        
        // Generate name if not provided
        if (!name) {
            const fileCount = (await Database.getFilesByProject(AppState.currentProject.id)).length;
            name = `neu_${type}_${fileCount + 1}.${type}`;
        }
        
        // Create file
        const file = await Database.createFile(AppState.currentProject.id, {
            name: name,
            type: type,
            content: this.getDefaultFileContent(type),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        // Open the new file
        await App.openFile(file.id);
        
        // Refresh tree
        this.refresh();
        
        Notifications.show(`Neue Datei erstellt: ${file.name}`, 'success');
    },
    
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
    },
    
    async createNewFolder(name = 'Neuer Ordner') {
        if (!AppState.currentProject) {
            Notifications.show('Kein Projekt geöffnet', 'error');
            return;
        }
        
        // In our current structure, folders are virtual and defined in the tree
        // For a real implementation, we would need to store folder structure
        Notifications.show('Ordner-Funktion kommt bald!', 'info');
    },
    
    async renameItem(itemId, newName) {
        if (!AppState.currentProject) {
            Notifications.show('Kein Projekt geöffnet', 'error');
            return;
        }
        
        // Find the item (file or asset)
        const files = await Database.getFilesByProject(AppState.currentProject.id);
        const assets = await Database.getAssetsByProject(AppState.currentProject.id);
        
        const allItems = [...files, ...assets];
        const item = allItems.find(i => i.id === itemId);
        
        if (!item) {
            Notifications.show('Element nicht gefunden', 'error');
            return;
        }
        
        // Update name
        if (item.file) {
            await Database.updateFile(itemId, { name: newName });
        } else if (item.asset) {
            await Database.updateAsset(itemId, { name: newName });
        }
        
        // Refresh tree
        this.refresh();
        
        Notifications.show(`Element umbenannt in: ${newName}`, 'success');
    }
    
    async deleteItem(itemId) {
        if (!AppState.currentProject) {
            Notifications.show('Kein Projekt geöffnet', 'error');
            return;
        }
        
        // Confirm deletion
        const confirmed = await Modals.showConfirm(
            'Löschen bestätigen',
            'Möchtest du dieses Element wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
            'Löschen',
            'Abbrechen'
        );
        
        if (!confirmed) return;
        
        // Find and delete the item
        const files = await Database.getFilesByProject(AppState.currentProject.id);
        const assets = await Database.getAssetsByProject(AppState.currentProject.id);
        
        const file = files.find(f => f.id === itemId);
        const asset = assets.find(a => a.id === itemId);
        
        if (file) {
            await Database.deleteFile(itemId);
            
            // Close file if it's open
            if (AppState.currentFileId === itemId) {
                AppState.currentFile = null;
                AppState.currentFileId = null;
                if (AppState.editor) {
                    AppState.editor.setValue('');
                }
                Editor.updateTabs();
            }
        } else if (asset) {
            await Database.deleteAsset(itemId);
        } else {
            Notifications.show('Element nicht gefunden', 'error');
            return;
        }
        
        // Refresh tree
        this.refresh();
        
        Notifications.show('Element gelöscht', 'success');
    }
    
    async duplicateItem(itemId) {
        if (!AppState.currentProject) {
            Notifications.show('Kein Projekt geöffnet', 'error');
            return;
        }
        
        // Find the item
        const files = await Database.getFilesByProject(AppState.currentProject.id);
        const assets = await Database.getAssetsByProject(AppState.currentProject.id);
        
        const file = files.find(f => f.id === itemId);
        const asset = assets.find(a => a.id === itemId);
        
        if (file) {
            const newFile = await Database.duplicateFile(itemId);
            
            // Open the new file
            await App.openFile(newFile.id);
        } else if (asset) {
            // For assets, we need to duplicate the asset
            const newAsset = await Database.createAsset(asset.projectId, {
                name: asset.name.replace(/(\.\w+)$/, '(Kopie)$1'),
                type: asset.type,
                data: asset.data
            });
        } else {
            Notifications.show('Element nicht gefunden', 'error');
            return;
        }
        
        // Refresh tree
        this.refresh();
        
        Notifications.show('Element dupliziert', 'success');
    }
    
    // ============================================
    // Event Handlers
    // ============================================
    
    bindTreeEvents() {
        // Click on tree items
        this.container.addEventListener('click', (e) => {
            const header = e.target.closest('.tree-item-header');
            if (!header) return;
            
            const item = header.parentElement;
            const itemId = item.dataset.id;
            const itemType = item.dataset.type;
            
            // Toggle folder expansion
            if (header.querySelector('.tree-expand-icon') && itemType === 'folder') {
                this.toggleFolder(itemId);
            }
            
            // Select item
            this.selectItem(itemId);
            
            // Handle action buttons
            const actionBtn = e.target.closest('.action-btn');
            if (actionBtn) {
                const action = actionBtn.dataset.action;
                this.handleAction(action, itemId, itemType);
            }
        });
        
        // Double click on tree items
        this.container.addEventListener('dblclick', (e) => {
            const header = e.target.closest('.tree-item-header');
            if (!header) return;
            
            const item = header.parentElement;
            const itemId = item.dataset.id;
            const itemType = item.dataset.type;
            
            // Open file on double click
            if (itemType !== 'root' && itemType !== 'folder') {
                this.openItem(itemId);
            }
        });
        
        // Context menu
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            const header = e.target.closest('.tree-item-header');
            if (!header) return;
            
            const item = header.parentElement;
            const itemId = item.dataset.id;
            const itemType = item.dataset.type;
            
            // Show context menu
            ContextMenu.show(e.clientX, e.clientY, [
                { label: 'Öffnen', action: () => this.openItem(itemId), icon: 'fa-folder-open' },
                { label: 'Umbenennen', action: () => this.startRename(itemId), icon: 'fa-edit' },
                { label: 'Duplizieren', action: () => this.duplicateItem(itemId), icon: 'fa-copy' },
                { label: 'Löschen', action: () => this.deleteItem(itemId), icon: 'fa-trash', danger: true },
                { separator: true },
                { label: 'Neue Datei', action: () => this.createNewFile(), icon: 'fa-plus' },
                { label: 'Neuer Ordner', action: () => this.createNewFolder(), icon: 'fa-folder-plus' }
            ]);
        });
        
        // Drag and drop
        this.container.addEventListener('dragstart', (e) => {
            const header = e.target.closest('.tree-item-header');
            if (!header) return;
            
            const item = header.parentElement;
            const itemId = item.dataset.id;
            
            e.dataTransfer.setData('text/plain', itemId);
            e.dataTransfer.effectAllowed = 'move';
            header.classList.add('dragging');
        });
        
        this.container.addEventListener('dragend', (e) => {
            const header = e.target.closest('.tree-item-header');
            if (header) {
                header.classList.remove('dragging');
            }
        });
        
        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const header = e.target.closest('.tree-item-header');
            if (header) {
                const item = header.parentElement;
                if (item.dataset.type === 'folder') {
                    header.classList.add('drag-over');
                }
            }
        });
        
        this.container.addEventListener('dragleave', (e) => {
            const header = e.target.closest('.tree-item-header');
            if (header) {
                header.classList.remove('drag-over');
            }
        });
        
        this.container.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const header = e.target.closest('.tree-item-header');
            if (header) {
                header.classList.remove('drag-over');
            }
            
            const itemId = e.dataTransfer.getData('text/plain');
            const target = e.target.closest('.tree-item');
            
            if (itemId && target && target.dataset.type === 'folder') {
                // Move item to folder
                this.moveItemToFolder(itemId, target.dataset.id);
            }
        });
    },
    
    async handleAction(action, itemId, itemType) {
        switch (action) {
            case 'open':
                this.openItem(itemId);
                break;
            case 'context':
                // Context menu will be shown by contextmenu event
                break;
            default:
                console.log('Unknown action:', action);
        }
    }
    
    async openItem(itemId) {
        if (!AppState.currentProject) return;
        
        const files = await Database.getFilesByProject(AppState.currentProject.id);
        const file = files.find(f => f.id === itemId);
        
        if (file) {
            await App.openFile(file.id);
        } else {
            // Try to find asset
            const assets = await Database.getAssetsByProject(AppState.currentProject.id);
            const asset = assets.find(a => a.id === itemId);
            
            if (asset) {
                // Open asset in appropriate editor
                Notifications.show(`Asset: ${asset.name} (Öffnen kommt bald!)`);
            }
        }
    }
    
    async moveItemToFolder(itemId, folderId) {
        // This would require implementing folder structure in the database
        Notifications.show('Ordner-Funktion kommt bald!', 'info');
    }
    
    async startRename(itemId) {
        ProjectExplorerState.renameItem = itemId;
        this.refresh();
        
        // Focus on the rename input
        const renameInput = this.container.querySelector(`.tree-item[data-id="${itemId}"] .rename-input`);
        if (renameInput) {
            renameInput.focus();
            renameInput.select();
        }
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }
    
    getFileTypeFromExtension(extension) {
        const typeMap = {
            'vibe': 'vibe',
            'js': 'script',
            'ts': 'script',
            'py': 'script',
            'sprite': 'sprite',
            'scene': 'scene',
            'level': 'level',
            'backdrop': 'backdrop',
            'png': 'asset',
            'jpg': 'asset',
            'jpeg': 'asset',
            'svg': 'asset',
            'gif': 'asset',
            'wav': 'sound',
            'mp3': 'sound',
            'ogg': 'sound'
        };
        
        return typeMap[extension.toLowerCase()] || 'file';
    }
};

// ============================================
// Initialize Component
// ============================================

// Initialize project explorer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ProjectExplorer.init();
    });
} else {
    ProjectExplorer.init();
}

// Export for use in other modules
window.ProjectExplorer = ProjectExplorer;
window.ProjectExplorerState = ProjectExplorerState;
