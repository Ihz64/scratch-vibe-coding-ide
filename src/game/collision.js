/**
 * Scratch Vibe Coding IDE - Collision System
 * Handles collision detection between sprites and objects
 */

// ============================================
// Collision Configuration
// ============================================

const CollisionConfig = {
    // Default collision box size
    defaultWidth: 48,
    defaultHeight: 48,
    
    // Collision detection methods
    methods: {
        rectangle: 'Rectangle',
        circle: 'Circle',
        polygon: 'Polygon',
        pixel: 'Pixel Perfect'
    },
    
    // Collision layers
    layers: {
        default: 0,
        foreground: 1,
        background: -1,
        ignore: -2
    }
};

// ============================================
// Collision Box Class
// ============================================

class CollisionBox {
    constructor(sprite, options = {}) {
        this.sprite = sprite;
        this.width = options.width || CollisionConfig.defaultWidth;
        this.height = options.height || CollisionConfig.defaultHeight;
        this.offsetX = options.offsetX || 0;
        this.offsetY = options.offsetY || 0;
        this.type = options.type || CollisionConfig.methods.rectangle;
        this.layer = options.layer || CollisionConfig.layers.default;
    }
    
    getBounds() {
        return {
            x: this.sprite.x + this.offsetX - this.width / 2,
            y: this.sprite.y + this.offsetY - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    getCenter() {
        return {
            x: this.sprite.x + this.offsetX,
            y: this.sprite.y + this.offsetY
        };
    }
    
    containsPoint(x, y) {
        const bounds = this.getBounds();
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
    
    intersects(other) {
        const thisBounds = this.getBounds();
        const otherBounds = other.getBounds();
        
        return !(thisBounds.x + thisBounds.width < otherBounds.x ||
                 otherBounds.x + otherBounds.width < thisBounds.x ||
                 thisBounds.y + thisBounds.height < otherBounds.y ||
                 otherBounds.y + otherBounds.height < thisBounds.y);
    }
    
    distanceTo(other) {
        const thisCenter = this.getCenter();
        const otherCenter = other.getCenter();
        
        return Math.sqrt(
            Math.pow(otherCenter.x - thisCenter.x, 2) +
            Math.pow(otherCenter.y - thisCenter.y, 2)
        );
    }
    
    circleIntersects(other) {
        const thisCenter = this.getCenter();
        const otherCenter = other.getCenter();
        const distance = this.distanceTo(other);
        
        return distance < (this.width / 2 + other.width / 2);
    }
    
    toString() {
        return `CollisionBox(sprite: ${this.sprite.name}, type: ${this.type})`;
    }
}

// ============================================
// Collision System
// ============================================

const CollisionSystem = {
    // Collision matrix for optimization
    collisionMatrix: new Map(),
    
    // Collision callbacks
    callbacks: new Map(),
    
    // ============================================
    // Initialization
    // ============================================
    
    init() {
        console.log('Initializing Collision System...');
        
        // Initialize collision matrix
        this.collisionMatrix.clear();
        this.callbacks.clear();
    }
    
    // ============================================
    // Collision Detection
    // ============================================
    
    checkCollisions() {
        const sprites = Array.from(RuntimeState.sprites.values());
        const collisions = [];
        
        // Check all pairs of sprites
        for (let i = 0; i < sprites.length; i++) {
            for (let j = i + 1; j < sprites.length; j++) {
                const sprite1 = sprites[i];
                const sprite2 = sprites[j];
                
                // Skip if either sprite is not visible
                if (!sprite1.visible || !sprite2.visible) continue;
                
                // Skip if sprites are in different layers that don't collide
                if (!this.canCollide(sprite1, sprite2)) continue;
                
                // Check collision
                const collision = this.checkSpriteCollision(sprite1, sprite2);
                if (collision) {
                    collisions.push(collision);
                    
                    // Trigger callbacks
                    this.triggerCallbacks(sprite1, sprite2, collision);
                }
            }
        }
        
        return collisions;
    }
    
    checkSpriteCollision(sprite1, sprite2) {
        // Get collision boxes
        const box1 = sprite1.collisionBox || this.getCollisionBox(sprite1);
        const box2 = sprite2.collisionBox || this.getCollisionBox(sprite2);
        
        // Check collision based on type
        switch (box1.type) {
            case CollisionConfig.methods.circle:
                return box1.circleIntersects(box2);
            case CollisionConfig.methods.polygon:
                return this.polygonIntersects(box1, box2);
            case CollisionConfig.methods.pixel:
                return this.pixelPerfectCollision(sprite1, sprite2);
            default:
                return box1.intersects(box2);
        }
    }
    
    canCollide(sprite1, sprite2) {
        // Check layers
        const layer1 = sprite1.collisionBox ? sprite1.collisionBox.layer : CollisionConfig.layers.default;
        const layer2 = sprite2.collisionBox ? sprite2.collisionBox.layer : CollisionConfig.layers.default;
        
        // Ignore if either is in ignore layer
        if (layer1 === CollisionConfig.layers.ignore || layer2 === CollisionConfig.layers.ignore) {
            return false;
        }
        
        // Check if layers can collide
        // Layers can only collide if they are the same or adjacent
        return Math.abs(layer1 - layer2) <= 1;
    }
    
    getCollisionBox(sprite) {
        // Create a default collision box if sprite doesn't have one
        return new CollisionBox(sprite, {
            width: sprite.size / 100 * CollisionConfig.defaultWidth,
            height: sprite.size / 100 * CollisionConfig.defaultHeight
        });
    }
    
    polygonIntersects(poly1, poly2) {
        // Simple polygon collision (AABB for now)
        // In a real implementation, this would use SAT (Separating Axis Theorem)
        return poly1.intersects(poly2);
    }
    
    pixelPerfectCollision(sprite1, sprite2) {
        // Placeholder for pixel-perfect collision
        // This would require checking actual pixel data
        return this.checkSpriteCollision(sprite1, sprite2);
    }
    
    // ============================================
    // Collision Callbacks
    // ============================================
    
    onCollision(sprite1, sprite2, callback) {
        const key1 = `${sprite1.id}:${sprite2.id}`;
        const key2 = `${sprite2.id}:${sprite1.id}`;
        
        this.callbacks.set(key1, callback);
        this.callbacks.set(key2, callback);
    }
    
    onCollisionOnce(sprite1, sprite2, callback) {
        const key1 = `${sprite1.id}:${sprite2.id}:once`;
        const key2 = `${sprite2.id}:${sprite1.id}:once`;
        
        const wrappedCallback = () => {
            callback();
            this.callbacks.delete(key1);
            this.callbacks.delete(key2);
        };
        
        this.callbacks.set(key1, wrappedCallback);
        this.callbacks.set(key2, wrappedCallback);
    }
    
    onCollisionEnter(sprite1, sprite2, callback) {
        const key = `${sprite1.id}:${sprite2.id}:enter`;
        
        // Store original callback
        const originalCallbacks = this.callbacks.get(key) || [];
        originalCallbacks.push(callback);
        this.callbacks.set(key, originalCallbacks);
    }
    
    onCollisionExit(sprite1, sprite2, callback) {
        const key = `${sprite1.id}:${sprite2.id}:exit`;
        
        // Store original callback
        const originalCallbacks = this.callbacks.get(key) || [];
        originalCallbacks.push(callback);
        this.callbacks.set(key, originalCallbacks);
    }
    
    triggerCallbacks(sprite1, sprite2, collision) {
        const key1 = `${sprite1.id}:${sprite2.id}`;
        const key2 = `${sprite2.id}:${sprite1.id}`;
        const enterKey1 = `${sprite1.id}:${sprite2.id}:enter`;
        const enterKey2 = `${sprite2.id}:${sprite1.id}:enter`;
        
        // Trigger regular callbacks
        const callback1 = this.callbacks.get(key1);
        const callback2 = this.callbacks.get(key2);
        
        if (callback1) {
            if (Array.isArray(callback1)) {
                callback1.forEach(cb => cb(collision));
            } else {
                callback1(collision);
            }
        }
        
        if (callback2 && callback2 !== callback1) {
            if (Array.isArray(callback2)) {
                callback2.forEach(cb => cb(collision));
            } else {
                callback2(collision);
            }
        }
        
        // Check for enter callbacks
        const wasColliding = this.collisionMatrix.get(key1);
        
        if (!wasColliding) {
            // First collision
            this.collisionMatrix.set(key1, true);
            this.collisionMatrix.set(key2, true);
            
            const enterCallback1 = this.callbacks.get(enterKey1);
            const enterCallback2 = this.callbacks.get(enterKey2);
            
            if (enterCallback1) {
                if (Array.isArray(enterCallback1)) {
                    enterCallback1.forEach(cb => cb(collision));
                } else {
                    enterCallback1(collision);
                }
            }
            
            if (enterCallback2 && enterCallback2 !== enterCallback1) {
                if (Array.isArray(enterCallback2)) {
                    enterCallback2.forEach(cb => cb(collision));
                } else {
                    enterCallback2(collision);
                }
            }
        }
    }
    
    // ============================================
    // Collision Types
    // ============================================
    
    checkPointCollision(x, y, sprite) {
        if (!sprite.visible) return false;
        
        const box = sprite.collisionBox || this.getCollisionBox(sprite);
        return box.containsPoint(x, y);
    }
    
    checkMouseCollision(sprite) {
        return this.checkPointCollision(RuntimeState.mouseX, RuntimeState.mouseY, sprite);
    }
    
    checkEdgeCollision(sprite) {
        const canvas = RuntimeState.canvas;
        if (!canvas) return false;
        
        const box = sprite.collisionBox || this.getCollisionBox(sprite);
        const bounds = box.getBounds();
        
        return bounds.x < -canvas.width / 2 ||
               bounds.x + bounds.width > canvas.width / 2 ||
               bounds.y < -canvas.height / 2 ||
               bounds.y + bounds.height > canvas.height / 2;
    }
    
    checkColorCollision(sprite, color) {
        // Placeholder for color collision
        return false;
    }
    
    // ============================================
    // Collision Groups
    // ============================================
    
    createCollisionGroup(name) {
        return {
            name: name,
            sprites: new Set(),
            collisions: new Map()
        };
    }
    
    addToGroup(group, sprite) {
        group.sprites.add(sprite);
    }
    
    removeFromGroup(group, sprite) {
        group.sprites.delete(sprite);
    }
    
    checkGroupCollisions(group1, group2) {
        const collisions = [];
        
        for (const sprite1 of group1.sprites) {
            for (const sprite2 of group2.sprites) {
                if (sprite1 !== sprite2) {
                    const collision = this.checkSpriteCollision(sprite1, sprite2);
                    if (collision) {
                        collisions.push(collision);
                    }
                }
            }
        }
        
        return collisions;
    }
    
    // ============================================
    // Raycasting
    // ============================================
    
    raycast(startX, startY, endX, endY, options = {}) {
        const sprites = Array.from(RuntimeState.sprites.values());
        const results = [];
        
        // Calculate ray direction
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const stepX = dx / length;
        const stepY = dy / length;
        
        // Step along the ray
        let x = startX;
        let y = startY;
        let distance = 0;
        const maxDistance = options.maxDistance || length;
        const stepSize = options.stepSize || 1;
        
        while (distance < maxDistance) {
            x += stepX * stepSize;
            y += stepY * stepSize;
            distance += stepSize;
            
            // Check collision with sprites
            for (const sprite of sprites) {
                if (sprite.visible && this.checkPointCollision(x, y, sprite)) {
                    results.push({
                        sprite: sprite,
                        x: x,
                        y: y,
                        distance: distance
                    });
                    
                    if (options.stopAtFirstHit) {
                        return results;
                    }
                }
            }
        }
        
        return results;
    }
    
    // ============================================
    // Distance Checks
    // ============================================
    
    distanceBetween(sprite1, sprite2) {
        const box1 = sprite1.collisionBox || this.getCollisionBox(sprite1);
        const box2 = sprite2.collisionBox || this.getCollisionBox(sprite2);
        return box1.distanceTo(box2);
    }
    
    distanceToPoint(sprite, x, y) {
        const box = sprite.collisionBox || this.getCollisionBox(sprite);
        const center = box.getCenter();
        return Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
    }
    
    distanceToMouse(sprite) {
        return this.distanceToPoint(sprite, RuntimeState.mouseX, RuntimeState.mouseY);
    }
    
    // ============================================
    // Utility Methods
    // ============================================
    
    getCollidingSprites(sprite) {
        const colliding = [];
        const sprites = Array.from(RuntimeState.sprites.values());
        
        for (const other of sprites) {
            if (other !== sprite && this.checkSpriteCollision(sprite, other)) {
                colliding.push(other);
            }
        }
        
        return colliding;
    }
    
    isColliding(sprite1, sprite2) {
        return this.checkSpriteCollision(sprite1, sprite2);
    }
    
    clearCallbacks() {
        this.callbacks.clear();
        this.collisionMatrix.clear();
    }
    
    // ============================================
    // Visualization (for debugging)
    // ============================================
    
    drawCollisionBoxes(context) {
        const sprites = Array.from(RuntimeState.sprites.values());
        
        context.save();
        context.globalAlpha = 0.5;
        
        for (const sprite of sprites) {
            if (sprite.visible && sprite.collisionBox) {
                const box = sprite.collisionBox;
                const bounds = box.getBounds();
                
                // Draw collision box
                context.strokeStyle = '#ff0000';
                context.lineWidth = 1;
                context.strokeRect(
                    bounds.x,
                    bounds.y,
                    bounds.width,
                    bounds.height
                );
            }
        }
        
        context.restore();
    }
}

// ============================================
// Collision Types
// ============================================

// Add collision types to Sprite prototype
if (typeof Sprite !== 'undefined') {
    Sprite.prototype.isTouching = function(target) {
        return CollisionSystem.isColliding(this, target);
    };
    
    Sprite.prototype.isTouchingPoint = function(x, y) {
        return CollisionSystem.checkPointCollision(x, y, this);
    };
    
    Sprite.prototype.isTouchingMouse = function() {
        return CollisionSystem.checkMouseCollision(this);
    };
    
    Sprite.prototype.isTouchingEdge = function() {
        return CollisionSystem.checkEdgeCollision(this);
    };
    
    Sprite.prototype.distanceTo = function(other) {
        return CollisionSystem.distanceBetween(this, other);
    };
}

// ============================================
// Export
// ============================================

window.CollisionSystem = CollisionSystem;
window.CollisionBox = CollisionBox;
window.CollisionConfig = CollisionConfig;
