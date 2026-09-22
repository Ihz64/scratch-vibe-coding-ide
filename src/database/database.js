/**
 * Scratch Vibe Coding IDE - Database Module
 * Handles project, file, and asset storage using IndexedDB
 */

// ============================================
// Database Configuration
// ============================================

const DB_CONFIG = {
    name: 'ScratchVibeDB',
    version: 1,
    stores: {
        projects: '++id, name, description, template, createdAt, updatedAt, userId',
        files: '++id, projectId, name, type, content, createdAt, updatedAt, isOpen',
        assets: '++id, projectId, name, type, data, createdAt, updatedAt',
        history: '++id, projectId, fileId, content, timestamp, type',
        settings: '++id, userId, key, value, updatedAt'
    }
};

// ============================================
// Database State
// ============================================

const DBState = {
    db: null,
    isReady: false,
    projects: [],
    files: [],
    assets: [],
    history: [],
    settings: []
};

// ============================================
// Database Module
// ============================================

const Database = {
    // ============================================
    // Initialization
    // ============================================
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
            
            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                DBState.db = event.target.result;
                DBState.isReady = true;
                
                // Load all data
                this.loadAllData().then(() => {
                    resolve(DBState.db);
                }).catch(reject);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                for (const [storeName, keyPath] of Object.entries(DB_CONFIG.stores)) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: keyPath });
                    }
                }
            };
        });
    },
    
    async loadAllData() {
        try {
            DBState.projects = await this.getAll('projects');
            DBState.files = await this.getAll('files');
            DBState.assets = await this.getAll('assets');
            DBState.history = await this.getAll('history');
            DBState.settings = await this.getAll('settings');
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    },
    
    // ============================================
    // Generic Database Operations
    // ============================================
    
    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = DBState.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },
    
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = DBState.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },
    
    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = DBState.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },
    
    async update(storeName, id, updates) {
        const existing = await this.get(storeName, id);
        if (!existing) {
            throw new Error(`${storeName} with id ${id} not found`);
        }
        
        const updated = { ...existing, ...updates };
        return this.put(storeName, updated);
    },
    
    async remove(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = DBState.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
        });
    },
    
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = DBState.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
        });
    },
    
    // ============================================
    // Project Operations
    // ============================================
    
    async createProject(projectData) {
        const user = Auth.getCurrentUser();
        const project = {
            ...projectData,
            userId: user ? user.id : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const id = await this.put('projects', project);
        project.id = id;
        
        // Add to state
        DBState.projects.push(project);
        
        return project;
    },
    
    async getProject(projectId) {
        const project = await this.get('projects', projectId);
        if (!project) return null;
        
        // Load files for this project
        const files = await this.getFilesByProject(projectId);
        project.files = files;
        
        return project;
    },
    
    async getAllProjects() {
        const user = Auth.getCurrentUser();
        const allProjects = await this.getAll('projects');
        
        if (!user) {
            return allProjects; // In demo mode, return all projects
        }
        
        return allProjects.filter(p => p.userId === user.id);
    },
    
    async updateProject(projectId, updates) {
        const updatedAt = new Date().toISOString();
        const result = await this.update('projects', projectId, {
            ...updates,
            updatedAt
        });
        
        // Update in state
        const index = DBState.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            DBState.projects[index] = { ...DBState.projects[index], ...updates, updatedAt };
        }
        
        return result;
    },
    
    async deleteProject(projectId) {
        // Delete all files in the project
        const files = await this.getFilesByProject(projectId);
        for (const file of files) {
            await this.remove('files', file.id);
        }
        
        // Delete all assets in the project
        const assets = await this.getAssetsByProject(projectId);
        for (const asset of assets) {
            await this.remove('assets', asset.id);
        }
        
        // Delete all history entries for the project
        const history = await this.getHistoryByProject(projectId);
        for (const entry of history) {
            await this.remove('history', entry.id);
        }
        
        // Delete the project
        const result = await this.remove('projects', projectId);
        
        // Remove from state
        DBState.projects = DBState.projects.filter(p => p.id !== projectId);
        DBState.files = DBState.files.filter(f => f.projectId !== projectId);
        DBState.assets = DBState.assets.filter(a => a.projectId !== projectId);
        DBState.history = DBState.history.filter(h => h.projectId !== projectId);
        
        return result;
    }
    
    async getLastProject() {
        const projects = await this.getAllProjects();
        if (projects.length === 0) return null;
        
        // Sort by updatedAt and get the most recent
        projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        return projects[0];
    }
    
    // ============================================
    // File Operations
    // ============================================
    
    async createFile(projectId, fileData) {
        const file = {
            ...fileData,
            projectId: projectId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOpen: false
        };
        
        const id = await this.put('files', file);
        file.id = id;
        
        // Add to state
        DBState.files.push(file);
        
        return file;
    },
    
    async getFile(projectId, fileId) {
        const file = await this.get('files', fileId);
        if (!file || file.projectId !== projectId) return null;
        return file;
    },
    
    async getFilesByProject(projectId) {
        const allFiles = await this.getAll('files');
        return allFiles.filter(f => f.projectId === projectId);
    },
    
    async updateFile(fileId, updates) {
        const updatedAt = new Date().toISOString();
        const result = await this.update('files', fileId, {
            ...updates,
            updatedAt
        });
        
        // Update in state
        const index = DBState.files.findIndex(f => f.id === fileId);
        if (index !== -1) {
            DBState.files[index] = { ...DBState.files[index], ...updates, updatedAt };
        }
        
        return result;
    }
    
    async deleteFile(fileId) {
        const file = await this.get('files', fileId);
        if (!file) return false;
        
        const result = await this.remove('files', fileId);
        
        // Remove from state
        DBState.files = DBState.files.filter(f => f.id !== fileId);
        
        return result;
    }
    
    async duplicateFile(fileId) {
        const file = await this.get('files', fileId);
        if (!file) return null;
        
        const newFile = {
            ...file,
            id: null,
            name: file.name.replace(/(\.\w+)$/, '(Kopie)$1'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const id = await this.put('files', newFile);
        newFile.id = id;
        
        // Add to state
        DBState.files.push(newFile);
        
        return newFile;
    }
    
    // ============================================
    // Asset Operations
    // ============================================
    
    async createAsset(projectId, assetData) {
        const asset = {
            ...assetData,
            projectId: projectId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const id = await this.put('assets', asset);
        asset.id = id;
        
        // Add to state
        DBState.assets.push(asset);
        
        return asset;
    },
    
    async getAsset(projectId, assetId) {
        const asset = await this.get('assets', assetId);
        if (!asset || asset.projectId !== projectId) return null;
        return asset;
    },
    
    async getAssetsByProject(projectId) {
        const allAssets = await this.getAll('assets');
        return allAssets.filter(a => a.projectId === projectId);
    },
    
    async updateAsset(assetId, updates) {
        const updatedAt = new Date().toISOString();
        const result = await this.update('assets', assetId, {
            ...updates,
            updatedAt
        });
        
        // Update in state
        const index = DBState.assets.findIndex(a => a.id === assetId);
        if (index !== -1) {
            DBState.assets[index] = { ...DBState.assets[index], ...updates, updatedAt };
        }
        
        return result;
    }
    
    async deleteAsset(assetId) {
        const asset = await this.get('assets', assetId);
        if (!asset) return false;
        
        const result = await this.remove('assets', assetId);
        
        // Remove from state
        DBState.assets = DBState.assets.filter(a => a.id !== assetId);
        
        return result;
    }
    
    // ============================================
    // History Operations
    // ============================================
    
    async saveHistory(projectId, fileId, content, type = 'edit') {
        const historyEntry = {
            projectId: projectId,
            fileId: fileId,
            content: content,
            timestamp: new Date().toISOString(),
            type: type
        };
        
        const id = await this.put('history', historyEntry);
        historyEntry.id = id;
        
        // Add to state
        DBState.history.push(historyEntry);
        
        return historyEntry;
    }
    
    async getHistoryByProject(projectId) {
        const allHistory = await this.getAll('history');
        return allHistory.filter(h => h.projectId === projectId);
    }
    
    async getHistoryByFile(fileId) {
        const allHistory = await this.getAll('history');
        return allHistory.filter(h => h.fileId === fileId);
    }
    
    async restoreFromHistory(historyId) {
        const entry = await this.get('history', historyId);
        if (!entry) return null;
        
        // Update the file with the historical content
        await this.updateFile(entry.fileId, {
            content: entry.content,
            updatedAt: new Date().toISOString()
        });
        
        return entry;
    }
    
    // ============================================
    // Settings Operations
    // ============================================
    
    async saveSetting(userId, key, value) {
        const setting = {
            userId: userId,
            key: key,
            value: value,
            updatedAt: new Date().toISOString()
        };
        
        const id = await this.put('settings', setting);
        setting.id = id;
        
        // Add to state
        DBState.settings.push(setting);
        
        return setting;
    }
    
    async getSetting(userId, key) {
        const allSettings = await this.getAll('settings');
        const setting = allSettings.find(s => s.userId === userId && s.key === key);
        return setting ? setting.value : null;
    }
    
    async getAllSettings(userId) {
        const allSettings = await this.getAll('settings');
        return allSettings
            .filter(s => s.userId === userId)
            .reduce((acc, s) => {
                acc[s.key] = s.value;
                return acc;
            }, {});
    }
    
    async updateSetting(userId, key, value) {
        const allSettings = await this.getAll('settings');
        const existing = allSettings.find(s => s.userId === userId && s.key === key);
        
        if (existing) {
            return this.update('settings', existing.id, {
                value: value,
                updatedAt: new Date().toISOString()
            });
        } else {
            return this.saveSetting(userId, key, value);
        }
    }
    
    // ============================================
    // Export/Import Operations
    // ============================================
    
    async exportProject(projectId) {
        const project = await this.getProject(projectId);
        if (!project) return null;
        
        const files = await this.getFilesByProject(projectId);
        const assets = await this.getAssetsByProject(projectId);
        
        return {
            project: project,
            files: files,
            assets: assets
        };
    }
    
    async importProject(projectData) {
        const user = Auth.getCurrentUser();
        const userId = user ? user.id : null;
        
        // Create project
        const project = await this.createProject({
            name: projectData.project.name + ' (Importiert)',
            description: projectData.project.description,
            template: projectData.project.template,
            userId: userId
        });
        
        // Create files
        for (const file of projectData.files) {
            await this.createFile(project.id, {
                name: file.name,
                type: file.type,
                content: file.content
            });
        }
        
        // Create assets
        for (const asset of projectData.assets) {
            await this.createAsset(project.id, {
                name: asset.name,
                type: asset.type,
                data: asset.data
            });
        }
        
        return project;
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    
    async clearAll() {
        for (const storeName of Object.keys(DB_CONFIG.stores)) {
            await this.clear(storeName);
        }
        
        // Reset state
        DBState.projects = [];
        DBState.files = [];
        DBState.assets = [];
        DBState.history = [];
        DBState.settings = [];
    }
    
    async getStats() {
        const projects = await this.getAllProjects();
        const files = await this.getAll('files');
        const assets = await this.getAll('assets');
        const history = await this.getAll('history');
        
        return {
            projectCount: projects.length,
            fileCount: files.length,
            assetCount: assets.length,
            historyCount: history.length
        };
    }
};

// ============================================
// Initialize Module
// ============================================

// Initialize database when the app starts
Database.init().then(() => {
    console.log('Database initialized');
}).catch(error => {
    console.error('Error initializing database:', error);
});

// Export for use in other modules
window.Database = Database;
window.DBState = DBState;
window.DB_CONFIG = DB_CONFIG;
