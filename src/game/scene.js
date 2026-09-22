// Scene Module
// Manages game scenes/levels for Scratch projects

class Scene {
    constructor(name) {
        this.id = UUID.generate();
        this.name = name || 'Untitled Scene';
        this.backdrop = null;
        this.backdropName = '';
        this.backdropPath = '';
        this.sprites = [];
        this.scripts = [];
        this.variables = [];
        this.lists = [];
        this.broadcasts = [];
        this.properties = {
            visible: true,
            order: 0,
            sounds: [],
            volume: 100
        };
        this.metadata = {
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
    }

    // Set the backdrop
    setBackdrop(backdrop) {
        this.backdrop = backdrop;
        this.backdropName = backdrop ? backdrop.name : '';
        this.backdropPath = backdrop ? backdrop.path : '';
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Set backdrop by name
    setBackdropByName(name) {
        this.backdropName = name;
        this.backdrop = null; // Will be resolved at runtime
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Add a sprite to the scene
    addSprite(sprite) {
        this.sprites.push(sprite);
        sprite.scene = this;
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Remove a sprite from the scene
    removeSprite(sprite) {
        const index = this.sprites.indexOf(sprite);
        if (index > -1) {
            this.sprites.splice(index, 1);
            sprite.scene = null;
            this.metadata.modified = new Date().toISOString();
        }
        return this;
    }

    // Get sprite by name
    getSprite(name) {
        return this.sprites.find(s => s.name === name);
    }

    // Get sprite by ID
    getSpriteById(id) {
        return this.sprites.find(s => s.id === id);
    }

    // Add a script to the scene
    addScript(script) {
        this.scripts.push(script);
        script.scene = this;
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Remove a script from the scene
    removeScript(script) {
        const index = this.scripts.indexOf(script);
        if (index > -1) {
            this.scripts.splice(index, 1);
            script.scene = null;
            this.metadata.modified = new Date().toISOString();
        }
        return this;
    }

    // Add a variable
    addVariable(variable) {
        this.variables.push(variable);
        variable.scene = this;
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Remove a variable
    removeVariable(variable) {
        const index = this.variables.indexOf(variable);
        if (index > -1) {
            this.variables.splice(index, 1);
            variable.scene = null;
            this.metadata.modified = new Date().toISOString();
        }
        return this;
    }

    // Get variable by name
    getVariable(name) {
        return this.variables.find(v => v.name === name);
    }

    // Add a list
    addList(list) {
        this.lists.push(list);
        list.scene = this;
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Remove a list
    removeList(list) {
        const index = this.lists.indexOf(list);
        if (index > -1) {
            this.lists.splice(index, 1);
            list.scene = null;
            this.metadata.modified = new Date().toISOString();
        }
        return this;
    }

    // Get list by name
    getList(name) {
        return this.lists.find(l => l.name === name);
    }

    // Add a broadcast
    addBroadcast(broadcast) {
        this.broadcasts.push(broadcast);
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Remove a broadcast
    removeBroadcast(broadcast) {
        const index = this.broadcasts.indexOf(broadcast);
        if (index > -1) {
            this.broadcasts.splice(index, 1);
            this.metadata.modified = new Date().toISOString();
        }
        return this;
    }

    // Get broadcast by name
    getBroadcast(name) {
        return this.broadcasts.find(b => b.name === name);
    }

    // Set property
    setProperty(name, value) {
        this.properties[name] = value;
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Get property
    getProperty(name) {
        return this.properties[name];
    }

    // Set visibility
    setVisible(visible) {
        this.properties.visible = visible;
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Set order (layer)
    setOrder(order) {
        this.properties.order = order;
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Add sound
    addSound(sound) {
        this.properties.sounds.push(sound);
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Remove sound
    removeSound(sound) {
        const index = this.properties.sounds.indexOf(sound);
        if (index > -1) {
            this.properties.sounds.splice(index, 1);
            this.metadata.modified = new Date().toISOString();
        }
        return this;
    }

    // Set volume
    setVolume(volume) {
        this.properties.volume = Helpers.clamp(volume, 0, 100);
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Rename the scene
    rename(name) {
        this.name = name;
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Get all sprites
    getAllSprites() {
        return [...this.sprites];
    }

    // Get all scripts
    getAllScripts() {
        return [...this.scripts];
    }

    // Get all variables
    getAllVariables() {
        return [...this.variables];
    }

    // Get all lists
    getAllLists() {
        return [...this.lists];
    }

    // Get all broadcasts
    getAllBroadcasts() {
        return [...this.broadcasts];
    }

    // Clear all sprites
    clearSprites() {
        this.sprites = [];
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Clear all scripts
    clearScripts() {
        this.scripts = [];
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Clear all variables
    clearVariables() {
        this.variables = [];
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Clear all lists
    clearLists() {
        this.lists = [];
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Clear all broadcasts
    clearBroadcasts() {
        this.broadcasts = [];
        this.metadata.modified = new Date().toISOString();
        return this;
    }

    // Convert to JSON
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            backdrop: this.backdrop ? this.backdrop.toJSON() : null,
            backdropName: this.backdropName,
            backdropPath: this.backdropPath,
            sprites: this.sprites.map(s => s.toJSON()),
            scripts: this.scripts.map(s => s.toJSON()),
            variables: this.variables.map(v => v.toJSON()),
            lists: this.lists.map(l => l.toJSON()),
            broadcasts: this.broadcasts.map(b => b.toJSON()),
            properties: { ...this.properties },
            metadata: { ...this.metadata }
        };
    }

    // Create from JSON
    static fromJSON(data) {
        const scene = new Scene(data.name);
        scene.id = data.id || scene.id;
        scene.backdropName = data.backdropName || '';
        scene.backdropPath = data.backdropPath || '';
        scene.properties = data.properties || scene.properties;
        scene.metadata = data.metadata || scene.metadata;

        // Sprites would be loaded separately
        // Scripts would be loaded separately
        // Variables would be loaded separately
        // Lists would be loaded separately
        // Broadcasts would be loaded separately

        return scene;
    }

    // Clone the scene
    clone() {
        const cloned = new Scene(this.name);
        cloned.id = UUID.generate();
        cloned.backdropName = this.backdropName;
        cloned.backdropPath = this.backdropPath;
        cloned.properties = Helpers.deepClone(this.properties);
        
        // Clone sprites, scripts, variables, lists, broadcasts
        cloned.sprites = this.sprites.map(s => s.clone());
        cloned.scripts = this.scripts.map(s => s.clone());
        cloned.variables = this.variables.map(v => v.clone());
        cloned.lists = this.lists.map(l => l.clone());
        cloned.broadcasts = this.broadcasts.map(b => b.clone());
        
        cloned.metadata = Helpers.deepClone(this.metadata);
        cloned.metadata.modified = new Date().toISOString();
        
        return cloned;
    }

    // Get scene info
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            spriteCount: this.sprites.length,
            scriptCount: this.scripts.length,
            variableCount: this.variables.length,
            listCount: this.lists.length,
            broadcastCount: this.broadcasts.length,
            backdrop: this.backdropName,
            visible: this.properties.visible,
            order: this.properties.order,
            created: this.metadata.created,
            modified: this.metadata.modified
        };
    }
}

// Scene Manager
class SceneManager {
    constructor() {
        this.scenes = [];
        this.currentScene = null;
        this.currentSceneIndex = -1;
        this.history = [];
    }

    // Add a scene
    addScene(scene) {
        this.scenes.push(scene);
        if (this.currentScene === null) {
            this.setCurrentScene(scene);
        }
        return this;
    }

    // Remove a scene
    removeScene(scene) {
        const index = this.scenes.indexOf(scene);
        if (index > -1) {
            this.scenes.splice(index, 1);
            
            // Update current scene if needed
            if (this.currentScene === scene) {
                if (this.scenes.length > 0) {
                    this.setCurrentScene(this.scenes[0]);
                } else {
                    this.currentScene = null;
                    this.currentSceneIndex = -1;
                }
            } else if (index < this.currentSceneIndex) {
                this.currentSceneIndex--;
            }
        }
        return this;
    }

    // Set current scene
    setCurrentScene(scene) {
        const index = this.scenes.indexOf(scene);
        if (index > -1) {
            this.currentScene = scene;
            this.currentSceneIndex = index;
            this.history.push(scene);
        }
        return this;
    }

    // Set current scene by index
    setCurrentSceneByIndex(index) {
        if (index >= 0 && index < this.scenes.length) {
            this.currentScene = this.scenes[index];
            this.currentSceneIndex = index;
            this.history.push(this.currentScene);
        }
        return this;
    }

    // Set current scene by name
    setCurrentSceneByName(name) {
        const scene = this.getScene(name);
        if (scene) {
            this.setCurrentScene(scene);
        }
        return this;
    }

    // Get scene by name
    getScene(name) {
        return this.scenes.find(s => s.name === name);
    }

    // Get scene by ID
    getSceneById(id) {
        return this.scenes.find(s => s.id === id);
    }

    // Get current scene
    getCurrentScene() {
        return this.currentScene;
    }

    // Get current scene index
    getCurrentSceneIndex() {
        return this.currentSceneIndex;
    }

    // Get next scene
    getNextScene() {
        if (this.currentSceneIndex < this.scenes.length - 1) {
            return this.scenes[this.currentSceneIndex + 1];
        }
        return null;
    }

    // Get previous scene
    getPreviousScene() {
        if (this.currentSceneIndex > 0) {
            return this.scenes[this.currentSceneIndex - 1];
        }
        return null;
    }

    // Go to next scene
    nextScene() {
        const next = this.getNextScene();
        if (next) {
            this.setCurrentScene(next);
        }
        return this;
    }

    // Go to previous scene
    previousScene() {
        const prev = this.getPreviousScene();
        if (prev) {
            this.setCurrentScene(prev);
        }
        return this;
    }

    // Go to first scene
    firstScene() {
        if (this.scenes.length > 0) {
            this.setCurrentScene(this.scenes[0]);
        }
        return this;
    }

    // Go to last scene
    lastScene() {
        if (this.scenes.length > 0) {
            this.setCurrentScene(this.scenes[this.scenes.length - 1]);
        }
        return this;
    }

    // Switch to scene
    switchTo(name) {
        const scene = this.getScene(name);
        if (scene) {
            this.setCurrentScene(scene);
        }
        return this;
    }

    // Get all scenes
    getAllScenes() {
        return [...this.scenes];
    }

    // Get scene count
    getSceneCount() {
        return this.scenes.length;
    }

    // Clear all scenes
    clearScenes() {
        this.scenes = [];
        this.currentScene = null;
        this.currentSceneIndex = -1;
        this.history = [];
        return this;
    }

    // Reorder scenes
    reorderScenes(newOrder) {
        this.scenes = newOrder;
        
        // Update current scene index
        if (this.currentScene) {
            this.currentSceneIndex = this.scenes.indexOf(this.currentScene);
        }
        
        return this;
    }

    // Move scene up
    moveSceneUp(scene) {
        const index = this.scenes.indexOf(scene);
        if (index > 0) {
            this.scenes.splice(index, 1);
            this.scenes.splice(index - 1, 0, scene);
            
            if (this.currentScene === scene) {
                this.currentSceneIndex--;
            }
        }
        return this;
    }

    // Move scene down
    moveSceneDown(scene) {
        const index = this.scenes.indexOf(scene);
        if (index < this.scenes.length - 1) {
            this.scenes.splice(index, 1);
            this.scenes.splice(index + 1, 0, scene);
            
            if (this.currentScene === scene) {
                this.currentSceneIndex++;
            }
        }
        return this;
    }

    // Convert to JSON
    toJSON() {
        return {
            scenes: this.scenes.map(s => s.toJSON()),
            currentSceneIndex: this.currentSceneIndex,
            history: this.history.map(s => s.id)
        };
    }

    // Create from JSON
    static fromJSON(data) {
        const manager = new SceneManager();
        manager.scenes = data.scenes ? data.scenes.map(s => Scene.fromJSON(s)) : [];
        manager.currentSceneIndex = data.currentSceneIndex || -1;
        
        if (manager.currentSceneIndex >= 0 && manager.currentSceneIndex < manager.scenes.length) {
            manager.currentScene = manager.scenes[manager.currentSceneIndex];
        }
        
        return manager;
    }

    // Get scene info for all scenes
    getAllSceneInfo() {
        return this.scenes.map(s => s.getInfo());
    }

    // Find scene by various criteria
    findScene(criteria) {
        return this.scenes.find(s => {
            for (const [key, value] of Object.entries(criteria)) {
                if (s[key] !== value) return false;
            }
            return true;
        });
    }

    // Filter scenes by criteria
    filterScenes(criteria) {
        return this.scenes.filter(s => {
            for (const [key, value] of Object.entries(criteria)) {
                if (s[key] !== value) return false;
            }
            return true;
        });
    }

    // Sort scenes by property
    sortScenesBy(property, order = 'asc') {
        this.scenes.sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
        
        if (this.currentScene) {
            this.currentSceneIndex = this.scenes.indexOf(this.currentScene);
        }
        
        return this;
    }
}

// Create scene manager instance
const sceneManager = new SceneManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Scene = Scene;
    window.SceneManager = sceneManager;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Scene, SceneManager: sceneManager };
}
