/**
 * Scratch Vibe Coding IDE - Sprite Class
 * Represents a Scratch sprite with all its properties and behaviors
 */

// ============================================
// Sprite Configuration
// ============================================

const SpriteConfig = {
    defaultWidth: 48,
    defaultHeight: 48,
    defaultX: 0,
    defaultY: 0,
    defaultSize: 100,
    defaultDirection: 90,
    defaultRotation: 0,
    defaultVisible: true,
    defaultDraggable: false
};

// ============================================
// Sprite Class
// ============================================

class Sprite {
    constructor(data) {
        // Basic properties
        this.id = data.id || this.generateId();
        this.name = data.name || 'Sprite';
        
        // Position and appearance
        this.x = data.x !== undefined ? data.x : SpriteConfig.defaultX;
        this.y = data.y !== undefined ? data.y : SpriteConfig.defaultY;
        this.size = data.size !== undefined ? data.size : SpriteConfig.defaultSize;
        this.direction = data.direction !== undefined ? data.direction : SpriteConfig.defaultDirection;
        this.rotation = data.rotation !== undefined ? data.rotation : SpriteConfig.defaultRotation;
        this.visible = data.visible !== undefined ? data.visible : SpriteConfig.defaultVisible;
        this.zIndex = data.zIndex || 0;
        
        // Costumes
        this.costumes = data.costumes || [];
        this.currentCostumeIndex = 0;
        this.currentCostume = null;
        
        // Sounds
        this.sounds = data.sounds || [];
        this.currentSound = null;
        
        // Code
        this.code = data.code || [];
        this.scripts = [];
        this.parsedCode = null;
        
        // State
        this.isClone = data.isClone || false;
        this.parentSprite = null;
        this.clones = [];
        
        // Physics
        this.velocityX = 0;
        this.velocityY = 0;
        this.accelerationX = 0;
        this.accelerationY = 0;
        this.mass = 1;
        this.friction = 0;
        
        // Collision
        this.collisionBox = {
            width: SpriteConfig.defaultWidth,
            height: SpriteConfig.defaultHeight,
            offsetX: 0,
            offsetY: 0
        };
        
        // Variables
        this.variables = new Map();
        
        // Animation
        this.animations = [];
        this.currentAnimation = null;
        
        // Event handlers
        this.eventHandlers = new Map();
        
        // Initialize
        this.initialize();
    }
    
    // ============================================
    // Initialization
    // ============================================
    
    initialize() {
        // Initialize costumes
        this.initializeCostumes();
        
        // Initialize sounds
        this.initializeSounds();
        
        // Parse code
        this.parseCode();
        
        // Set default costume
        if (this.costumes.length > 0) {
            this.currentCostumeIndex = 0;
            this.currentCostume = this.costumes[0];
        }
    }
    
    async initializeCostumes() {
        for (const costume of this.costumes) {
            if (costume.data) {
                // Load costume data
                await this.loadCostume(costume);
            }
        }
    }
    
    async loadCostume(costume) {
        // In a real implementation, we would load the costume image
        // For now, we'll just store the data
        costume.loaded = true;
    }
    
    async initializeSounds() {
        for (const sound of this.sounds) {
            if (sound.data) {
                // Load sound data
                await this.loadSound(sound);
            }
        }
    }
    
    async loadSound(sound) {
        // In a real implementation, we would load the sound
        sound.loaded = true;
    }
    
    // ============================================
    // Code Parsing
    // ============================================
    
    async parseCode() {
        this.parsedCode = [];
        this.scripts = [];
        
        // Parse each block in the code
        for (const block of this.code) {
            await this.parseBlock(block);
        }
    }
    
    async parseBlock(block) {
        if (!block || !block.opcode) {
            return;
        }
        
        switch (block.opcode) {
            case 'event_whenflagclicked':
                this.scripts.push({
                    type: 'event',
                    event: 'green_flag',
                    block: block.next,
                    sprite: this
                });
                break;
                
            case 'event_whenkeypressed':
                const key = block.fields?.KEY_OPTION?.value;
                if (key) {
                    this.scripts.push({
                        type: 'event',
                        event: `key_${key}_pressed`,
                        block: block.next,
                        sprite: this
                    });
                }
                break;
                
            case 'event_whenthisspriteclicked':
                this.scripts.push({
                    type: 'event',
                    event: 'clicked',
                    block: block.next,
                    sprite: this
                });
                break;
                
            case 'event_whenbroadcastreceived':
                const broadcast = block.fields?.BROADCAST_OPTION?.value;
                if (broadcast) {
                    this.scripts.push({
                        type: 'event',
                        event: broadcast,
                        block: block.next,
                        sprite: this
                    });
                }
                break;
                
            default:
                // Regular block
                this.parsedCode.push(block);
        }
        
        // Parse next block
        if (block.next) {
            await this.parseBlock(block.next);
        }
    }
    
    startScripts() {
        // Add all scripts to active scripts
        for (const script of this.scripts) {
            RuntimeState.activeScripts.push({
                type: 'event',
                sprite: this,
                context: script,
                event: script.event
            });
        }
    }
    
    stop() {
        // Stop all scripts for this sprite
        for (const script of this.scripts) {
            const scriptKey = this.getScriptKey(script);
            RuntimeState.stoppedScripts.add(scriptKey);
        }
        
        // Stop all clones
        for (const clone of this.clones) {
            clone.stop();
        }
        
        // Clear clones
        this.clones = [];
    }
    
    getScriptKey(script) {
        return `${this.id}:${script.event}`;
    }
    
    // ============================================
    // Update and Rendering
    // ============================================
    
    update(deltaTime) {
        // Update position based on velocity
        this.x += this.velocityX * deltaTime / 16.67; // 16.67ms = 60fps
        this.y += this.velocityY * deltaTime / 16.67;
        
        // Apply acceleration
        this.velocityX += this.accelerationX * deltaTime / 16.67;
        this.velocityY += this.accelerationY * deltaTime / 16.67;
        
        // Apply friction
        if (this.friction > 0) {
            this.velocityX *= (1 - this.friction * deltaTime / 16.67);
            this.velocityY *= (1 - this.friction * deltaTime / 16.67);
        }
        
        // Update animations
        this.updateAnimations(deltaTime);
        
        // Update clones
        for (const clone of this.clones) {
            clone.update(deltaTime);
        }
    }
    
    updateAnimations(deltaTime) {
        if (this.currentAnimation) {
            this.currentAnimation.update(deltaTime);
            
            if (this.currentAnimation.isComplete()) {
                this.currentAnimation = null;
            }
        }
    }
    
    render(context) {
        if (!this.visible) return;
        
        // Save context
        context.save();
        
        // Apply transformations
        context.translate(this.x, this.y);
        context.rotate(this.direction * Math.PI / 180);
        context.scale(this.size / 100, this.size / 100);
        
        // Draw costume
        if (this.currentCostume) {
            this.drawCostume(context, this.currentCostume);
        } else if (this.costumes.length > 0) {
            this.drawCostume(context, this.costumes[0]);
        }
        
        // Restore context
        context.restore();
    }
    
    drawCostume(context, costume) {
        // For now, just draw a colored rectangle
        // In a real implementation, we would draw the actual costume image
        const color = this.getCostumeColor(costume.name);
        
        context.fillStyle = color;
        context.fillRect(-24, -24, 48, 48);
        
        // Draw costume name (for debugging)
        if (RuntimeState.debugMode) {
            context.fillStyle = '#000000';
            context.font = '8px Arial';
            context.fillText(costume.name, -20, -30);
        }
    }
    
    getCostumeColor(costumeName) {
        // Simple hash to get consistent colors
        let hash = 0;
        for (let i = 0; i < costumeName.length; i++) {
            hash = costumeName.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
            '#00FFFF', '#FFA500', '#800080', '#008000', '#800000'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    // ============================================
    // Costume Management
    // ============================================
    
    switchCostume(costumeName) {
        const index = this.costumes.findIndex(c => c.name === costumeName);
        if (index !== -1) {
            this.currentCostumeIndex = index;
            this.currentCostume = this.costumes[index];
        }
    }
    
    nextCostume() {
        if (this.costumes.length > 0) {
            this.currentCostumeIndex = (this.currentCostumeIndex + 1) % this.costumes.length;
            this.currentCostume = this.costumes[this.currentCostumeIndex];
        }
    }
    
    previousCostume() {
        if (this.costumes.length > 0) {
            this.currentCostumeIndex = (this.currentCostumeIndex - 1 + this.costumes.length) % this.costumes.length;
            this.currentCostume = this.costumes[this.currentCostumeIndex];
        }
    }
    
    // ============================================
    // Sound Management
    // ============================================
    
    playSound(soundName) {
        const sound = this.sounds.find(s => s.name === soundName);
        if (sound && sound.loaded) {
            // In a real implementation, we would play the sound
            console.log(`Playing sound: ${soundName}`);
        }
    }
    
    stopSound(soundName) {
        // Stop specific sound
    }
    
    stopAllSounds() {
        // Stop all sounds for this sprite
    }
    
    // ============================================
    // Speech Bubbles
    // ============================================
    
    say(message, duration = 0) {
        // Clear any existing speech bubble
        this.clearSpeechBubble();
        
        // Set speech bubble
        this.speechBubble = {
            message: message,
            duration: duration,
            startTime: performance.now()
        };
        
        // Clear after duration if specified
        if (duration > 0) {
            setTimeout(() => {
                this.clearSpeechBubble();
            }, duration);
        }
    }
    
    think(message, duration = 0) {
        // Similar to say but with think bubble
        this.clearSpeechBubble();
        
        this.thinkBubble = {
            message: message,
            duration: duration,
            startTime: performance.now()
        };
        
        if (duration > 0) {
            setTimeout(() => {
                this.clearSpeechBubble();
            }, duration);
        }
    }
    
    clearSpeechBubble() {
        this.speechBubble = null;
        this.thinkBubble = null;
    }
    
    // ============================================
    // Collision Detection
    // ============================================
    
    isTouching(target) {
        // Check if touching another sprite or edge
        if (target === 'edge') {
            const canvas = RuntimeState.canvas;
            if (canvas) {
                const halfWidth = canvas.width / 2;
                const halfHeight = canvas.height / 2;
                
                return this.x < -halfWidth || this.x > halfWidth ||
                       this.y < -halfHeight || this.y > halfHeight;
            }
            return false;
        }
        
        // Check if touching another sprite
        const targetSprite = RuntimeState.sprites.get(target);
        if (targetSprite) {
            return this.isTouchingSprite(targetSprite);
        }
        
        return false;
    }
    
    isTouchingSprite(other) {
        // Simple circle collision
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const thisRadius = 24 * (this.size / 100);
        const otherRadius = 24 * (other.size / 100);
        
        return distance < (thisRadius + otherRadius);
    }
    
    isTouchingColor(color) {
        // Placeholder for touching color
        return false;
    }
    
    // ============================================
    // Cloning
    // ============================================
    
    clone() {
        const clone = new Sprite({
            ...this.getData(),
            id: this.generateId(),
            isClone: true,
            parentSprite: this
        });
        
        // Add to parent's clones
        this.clones.push(clone);
        
        return clone;
    }
    
    // ============================================
    // Serialization
    // ============================================
    
    getData() {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            size: this.size,
            direction: this.direction,
            rotation: this.rotation,
            visible: this.visible,
            zIndex: this.zIndex,
            costumes: this.costumes,
            sounds: this.sounds,
            code: this.code,
            variables: Array.from(this.variables.entries()).map(([key, value]) => value)
        };
    }
    
    // ============================================
    // Utility Methods
    // ============================================
    
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    toString() {
        return `Sprite(${this.name}, x: ${this.x}, y: ${this.y})`;
    }
}

// ============================================
// Sprite Manager
// ============================================

const SpriteManager = {
    init() {
        // Initialize sprite manager
    },
    
    createSprite(data) {
        return new Sprite(data);
    },
    
    getSprite(nameOrId) {
        return RuntimeState.sprites.get(nameOrId);
    },
    
    getAllSprites() {
        return Array.from(RuntimeState.sprites.values());
    },
    
    destroySprite(sprite) {
        if (sprite.isClone && sprite.parentSprite) {
            const index = sprite.parentSprite.clones.indexOf(sprite);
            if (index !== -1) {
                sprite.parentSprite.clones.splice(index, 1);
            }
        }
        
        RuntimeState.sprites.delete(sprite.id);
    },
    
    destroyAllSprites() {
        RuntimeState.sprites.clear();
    }
};

// ============================================
// Export
// ============================================

window.Sprite = Sprite;
window.SpriteManager = SpriteManager;
window.SpriteConfig = SpriteConfig;
