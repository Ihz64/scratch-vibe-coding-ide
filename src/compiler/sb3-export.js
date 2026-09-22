/**
 * Scratch Vibe Coding IDE - .sb3 Export Module
 * Handles creation and export of .sb3 files
 */

// ============================================
// SB3 Export Configuration
// ============================================

const SB3Config = {
    // Scratch project metadata
    semver: '3.0.0',
    vm: '0.2.0-prerelease.20210419103757',
    agent: 'Scratch Vibe Coding IDE',
    
    // Default stage dimensions
    stageWidth: 480,
    stageHeight: 360,
    
    // Default sprite dimensions
    spriteWidth: 48,
    spriteHeight: 48
};

// ============================================
// SB3 Export Module
// ============================================

const SB3Export = {
    // ============================================
    // Main Export Method
    // ============================================
    
    async exportProject(scratchProject, options = {}) {
        const {
            includeAssets = true,
            includeSounds = true,
            includeCostumes = true,
            prettyPrint = false
        } = options;
        
        // Create ZIP archive
        const zip = new JSZip();
        
        // Add project.json
        const projectJson = this.createProjectJson(scratchProject, prettyPrint);
        zip.file('project.json', projectJson);
        
        // Add stage assets
        await this.addStageAssets(zip, scratchProject, includeCostumes, includeSounds);
        
        // Add sprite assets
        await this.addSpriteAssets(zip, scratchProject, includeCostumes, includeSounds);
        
        // Generate ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        
        return content;
    },
    
    // ============================================
    // Project JSON Creation
    // ============================================
    
    createProjectJson(scratchProject, prettyPrint = false) {
        // Clone the project to avoid modifying the original
        const project = JSON.parse(JSON.stringify(scratchProject));
        
        // Ensure required structure
        this.ensureProjectStructure(project);
        
        // Add metadata
        project.meta = {
            ...project.meta,
            semver: SB3Config.semver,
            vm: SB3Config.vm,
            agent: SB3Config.agent
        };
        
        // Convert to JSON
        const space = prettyPrint ? 2 : 0;
        return JSON.stringify(project, null, space);
    },
    
    ensureProjectStructure(project) {
        // Ensure editorData exists
        if (!project.editorData) {
            project.editorData = {
                stage: { costumes: [], sounds: [], code: [] },
                sprites: [],
                variables: [],
                lists: [],
                broadcasts: []
            };
        }
        
        // Ensure stage exists
        if (!project.editorData.stage) {
            project.editorData.stage = { costumes: [], sounds: [], code: [] };
        }
        
        // Ensure sprites array exists
        if (!project.editorData.sprites) {
            project.editorData.sprites = [];
        }
        
        // Ensure variables array exists
        if (!project.editorData.variables) {
            project.editorData.variables = [];
        }
        
        // Ensure lists array exists
        if (!project.editorData.lists) {
            project.editorData.lists = [];
        }
        
        // Ensure broadcasts array exists
        if (!project.editorData.broadcasts) {
            project.editorData.broadcasts = [];
        }
        
        // Add default stage costume if none exists
        if (project.editorData.stage.costumes.length === 0) {
            project.editorData.stage.costumes.push({
                name: 'backdrop1',
                data: this.createEmptyCostume(SB3Config.stageWidth, SB3Config.stageHeight)
            });
        }
        
        // Ensure each sprite has required properties
        for (const sprite of project.editorData.sprites) {
            if (!sprite.costumes || sprite.costumes.length === 0) {
                sprite.costumes = [{
                    name: `${sprite.name}_costume1`,
                    data: this.createEmptyCostume(SB3Config.spriteWidth, SB3Config.spriteHeight)
                }];
            }
            
            if (!sprite.sounds) {
                sprite.sounds = [];
            }
            
            if (!sprite.code) {
                sprite.code = [];
            }
            
            // Add default sprite properties
            if (sprite.x === undefined) sprite.x = 0;
            if (sprite.y === undefined) sprite.y = 0;
            if (sprite.size === undefined) sprite.size = 100;
            if (sprite.direction === undefined) sprite.direction = 90;
            if (sprite.rotation === undefined) sprite.rotation = 0;
            if (sprite.visible === undefined) sprite.visible = true;
            if (sprite.draggable === undefined) sprite.draggable = false;
        }
    }
    
    // ============================================
    // Asset Management
    // ============================================
    
    async addStageAssets(zip, project, includeCostumes, includeSounds) {
        const stage = project.editorData.stage;
        
        if (!stage) return;
        
        // Add costumes
        if (includeCostumes && stage.costumes) {
            for (const costume of stage.costumes) {
                await this.addCostume(zip, costume, 'stage');
            }
        }
        
        // Add sounds
        if (includeSounds && stage.sounds) {
            for (const sound of stage.sounds) {
                await this.addSound(zip, sound, 'stage');
            }
        }
    }
    
    async addSpriteAssets(zip, project, includeCostumes, includeSounds) {
        const sprites = project.editorData.sprites;
        
        if (!sprites) return;
        
        for (const sprite of sprites) {
            const spriteFolder = zip.folder(sprite.name);
            
            // Add costumes
            if (includeCostumes && sprite.costumes) {
                for (const costume of sprite.costumes) {
                    await this.addCostume(zip, costume, sprite.name);
                }
            }
            
            // Add sounds
            if (includeSounds && sprite.sounds) {
                for (const sound of sprite.sounds) {
                    await this.addSound(zip, sound, sprite.name);
                }
            }
        }
    }
    
    async addCostume(zip, costume, spriteName) {
        // Extract costume data
        const data = costume.data || costume.base64Data || costume.assetId;
        
        if (!data) {
            // Use empty costume
            costume.data = this.createEmptyCostume(SB3Config.spriteWidth, SB3Config.spriteHeight);
        }
        
        // Determine file extension
        let extension = 'png';
        if (typeof data === 'string') {
            if (data.startsWith('data:image/svg+xml')) {
                extension = 'svg';
            } else if (data.startsWith('data:image/')) {
                const match = data.match(/data:image\/(\w+);/);
                if (match) {
                    extension = match[1];
                }
            }
        }
        
        // Create costume folder if needed
        const costumeFolder = spriteName === 'stage' ? 
            zip.folder('stage/costumes') : 
            zip.folder(`${spriteName}/costumes`);
        
        // Add costume file
        if (typeof data === 'string' && data.startsWith('data:')) {
            // Extract base64 data
            const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
            costumeFolder.file(`${costume.name}.${extension}`, base64Data, { base64: true });
        } else if (typeof data === 'string') {
            // Assume it's a file path or ID
            // In a real implementation, we would fetch the actual data
            costumeFolder.file(`${costume.name}.${extension}`, data);
        } else if (data instanceof Blob || data instanceof File) {
            costumeFolder.file(`${costume.name}.${extension}`, data);
        } else {
            // Use empty costume
            costumeFolder.file(`${costume.name}.png`, 
                this.createEmptyCostume(SB3Config.spriteWidth, SB3Config.spriteHeight), 
                { base64: true });
        }
    }
    
    async addSound(zip, sound, spriteName) {
        // Extract sound data
        const data = sound.data || sound.base64Data || sound.assetId;
        
        if (!data) return;
        
        // Determine file extension
        let extension = 'wav';
        if (typeof data === 'string') {
            if (data.startsWith('data:audio/')) {
                const match = data.match(/data:audio\/(\w+);/);
                if (match) {
                    extension = match[1];
                }
            }
        }
        
        // Create sound folder if needed
        const soundFolder = spriteName === 'stage' ? 
            zip.folder('stage/sounds') : 
            zip.folder(`${spriteName}/sounds`);
        
        // Add sound file
        if (typeof data === 'string' && data.startsWith('data:')) {
            // Extract base64 data
            const base64Data = data.replace(/^data:audio\/\w+;base64,/, '');
            soundFolder.file(`${sound.name}.${extension}`, base64Data, { base64: true });
        } else if (typeof data === 'string') {
            // Assume it's a file path or ID
            soundFolder.file(`${sound.name}.${extension}`, data);
        } else if (data instanceof Blob || data instanceof File) {
            soundFolder.file(`${sound.name}.${extension}`, data);
        }
    }
    
    // ============================================
    // Import Methods
    // ============================================
    
    async importSB3(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onerror = (event) => {
                reject(new Error('Fehler beim Lesen der Datei'));
            };
            
            reader.onload = async (event) => {
                try {
                    const result = event.target.result;
                    const project = await this.parseSB3(result);
                    resolve(project);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    async parseSB3(arrayBuffer) {
        // Parse the ZIP archive
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        // Read project.json
        const projectJsonFile = zip.file('project.json');
        if (!projectJsonFile) {
            throw new Error('Ungültige .sb3 Datei: project.json nicht gefunden');
        }
        
        const projectJson = await projectJsonFile.async('text');
        const project = JSON.parse(projectJson);
        
        // Process assets
        await this.processAssets(zip, project);
        
        return project;
    }
    
    async processAssets(zip, project) {
        // Process stage costumes
        if (project.editorData && project.editorData.stage && project.editorData.stage.costumes) {
            for (const costume of project.editorData.stage.costumes) {
                await this.processCostume(zip, costume, 'stage');
            }
        }
        
        // Process sprite costumes and sounds
        if (project.editorData && project.editorData.sprites) {
            for (const sprite of project.editorData.sprites) {
                if (sprite.costumes) {
                    for (const costume of sprite.costumes) {
                        await this.processCostume(zip, costume, sprite.name);
                    }
                }
                
                if (sprite.sounds) {
                    for (const sound of sprite.sounds) {
                        await this.processSound(zip, sound, sprite.name);
                    }
                }
            }
        }
    }
    
    async processCostume(zip, costume, spriteName) {
        const costumePath = spriteName === 'stage' ? 
            `stage/costumes/${costume.name}.png` : 
            `${spriteName}/costumes/${costume.name}.png`;
        
        const costumeFile = zip.file(costumePath);
        if (costumeFile) {
            const data = await costumeFile.async('base64');
            costume.data = `data:image/png;base64,${data}`;
        }
    }
    
    async processSound(zip, sound, spriteName) {
        const soundPath = spriteName === 'stage' ? 
            `stage/sounds/${sound.name}.wav` : 
            `${spriteName}/sounds/${sound.name}.wav`;
        
        const soundFile = zip.file(soundPath);
        if (soundFile) {
            const data = await soundFile.async('base64');
            sound.data = `data:audio/wav;base64,${data}`;
        }
    }
    
    // ============================================
    // Download Methods
    // ============================================
    
    downloadSB3(blob, filename) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = filename || 'project.sb3';
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            }, 100);
        });
    }
    
    async exportAndDownload(scratchProject, filename, options) {
        try {
            const blob = await this.exportProject(scratchProject, options);
            await this.downloadSB3(blob, filename);
            return true;
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }
    
    // ============================================
    // Helper Methods
    // ============================================
    
    createEmptyCostume(width = 48, height = 48) {
        // Create a simple white PNG as base64
        // This is a minimal 1x1 white PNG
        return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
    
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

// ============================================
// Export
// ============================================

window.SB3Export = SB3Export;
window.SB3Config = SB3Config;
