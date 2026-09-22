/**
 * Scratch Vibe Coding IDE - Animation System
 * Handles sprite animations, transitions, and effects
 */

// ============================================
// Animation Configuration
// ============================================

const AnimationConfig = {
    defaultFPS: 60,
    defaultDuration: 1000, // 1 second
    easingFunctions: {
        linear: (t) => t,
        easeInQuad: (t) => t * t,
        easeOutQuad: (t) => t * (2 - t),
        easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: (t) => t * t * t,
        easeOutCubic: (t) => (--t) * t * t + 1,
        easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: (t) => t * t * t * t,
        easeOutQuart: (t) => 1 - (--t) * t * t * t,
        easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
        easeInQuint: (t) => t * t * t * t * t,
        easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
        easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
        easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
        easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
        easeInOutSine: (t) => -(Math.cos(t * Math.PI) - 1) / 2,
        easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
        easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeInOutExpo: (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
        easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
        easeOutCirc: (t) => Math.sqrt(1 - (t = t - 1) * t),
        easeInOutCirc: (t) => t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
        easeInElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3),
        easeOutElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
        easeInOutElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 + 1,
        easeInBack: (t) => t * t * ((1.70158 + 1) * t - 1.70158),
        easeOutBack: (t) => (t = t - 1) * t * ((1.70158 + 1) * t + 1.70158) + 1,
        easeInOutBack: (t) => t < 0.5 ? (t * t * ((1.70158 * 1.525 + 1) * t - 1.70158 * 1.525)) / 2 : ((t - 2) * t * ((1.70158 * 1.525 + 1) * (t + 2) + 1.70158 * 1.525) + 2) / 2,
        easeInBounce: (t) => 1 - this.easeOutBounce(1 - t),
        easeOutBounce: (t) => t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
};

// ============================================
// Animation Class
// ============================================

class Animation {
    constructor(sprite, properties, options = {}) {
        this.sprite = sprite;
        this.properties = properties;
        this.options = {
            duration: options.duration || AnimationConfig.defaultDuration,
            easing: options.easing || 'linear',
            delay: options.delay || 0,
            repeat: options.repeat || 1,
            yoyo: options.yoyo || false,
            onStart: options.onStart || null,
            onUpdate: options.onUpdate || null,
            onComplete: options.onComplete || null,
            ...options
        };
        
        // State
        this.startTime = 0;
        this.currentTime = 0;
        this.elapsedTime = 0;
        this.progress = 0;
        this.isPlaying = false;
        this.isComplete = false;
        this.isReversed = false;
        this.repeatCount = 0;
        
        // Initial values
        this.initialValues = {};
        this.targetValues = {};
        
        // Initialize
        this.initialize();
    }
    
    initialize() {
        // Store initial values
        for (const prop in this.properties) {
            if (this.properties.hasOwnProperty(prop)) {
                this.initialValues[prop] = this.sprite[prop];
                this.targetValues[prop] = this.properties[prop];
            }
        }
    }
    
    start() {
        this.isPlaying = true;
        this.isComplete = false;
        this.startTime = performance.now();
        this.currentTime = 0;
        this.elapsedTime = 0;
        this.progress = 0;
        this.repeatCount = 0;
        this.isReversed = false;
        
        // Call onStart callback
        if (this.options.onStart) {
            this.options.onStart(this);
        }
        
        // Add to sprite animations
        this.sprite.animations.push(this);
        
        // If there's a delay, set timeout
        if (this.options.delay > 0) {
            setTimeout(() => {
                this.update(0);
            }, this.options.delay);
        }
    }
    
    stop() {
        this.isPlaying = false;
        
        // Remove from sprite animations
        const index = this.sprite.animations.indexOf(this);
        if (index !== -1) {
            this.sprite.animations.splice(index, 1);
        }
    }
    
    pause() {
        this.isPlaying = false;
    }
    
    resume() {
        this.isPlaying = true;
        this.startTime = performance.now() - this.currentTime;
    }
    
    update(deltaTime) {
        if (!this.isPlaying) return;
        
        this.currentTime = performance.now() - this.startTime;
        this.elapsedTime = this.currentTime;
        
        // Calculate progress
        const totalDuration = this.options.duration * (this.options.repeat || 1);
        this.progress = Math.min(this.elapsedTime / this.options.duration, 1);
        
        // Apply easing
        const easing = AnimationConfig.easingFunctions[this.options.easing] || AnimationConfig.easingFunctions.linear;
        const easedProgress = easing(this.progress);
        
        // Calculate current values
        for (const prop in this.properties) {
            if (this.properties.hasOwnProperty(prop)) {
                const startValue = this.initialValues[prop];
                const endValue = this.targetValues[prop];
                const currentValue = startValue + (endValue - startValue) * easedProgress;
                
                // Apply value based on property type
                this.applyProperty(prop, currentValue);
            }
        }
        
        // Call onUpdate callback
        if (this.options.onUpdate) {
            this.options.onUpdate(this);
        }
        
        // Check if animation is complete
        if (this.elapsedTime >= this.options.duration) {
            this.repeatCount++;
            
            if (this.repeatCount >= this.options.repeat) {
                // Animation complete
                this.isComplete = true;
                this.isPlaying = false;
                
                // Remove from sprite animations
                const index = this.sprite.animations.indexOf(this);
                if (index !== -1) {
                    this.sprite.animations.splice(index, 1);
                }
                
                // Call onComplete callback
                if (this.options.onComplete) {
                    this.options.onComplete(this);
                }
            } else {
                // Repeat animation
                if (this.options.yoyo) {
                    this.isReversed = !this.isReversed;
                }
                
                this.startTime = performance.now();
                this.currentTime = 0;
            }
        }
    }
    
    applyProperty(prop, value) {
        switch (prop) {
            case 'x':
            case 'y':
            case 'size':
            case 'direction':
            case 'rotation':
                this.sprite[prop] = value;
                break;
            case 'opacity':
                this.sprite.opacity = value;
                break;
            case 'visible':
                this.sprite.visible = value;
                break;
            default:
                // Custom property
                this.sprite[prop] = value;
        }
    }
    
    isComplete() {
        return this.isComplete;
    }
    
    reverse() {
        this.isReversed = !this.isReversed;
        
        // Swap initial and target values
        const temp = this.initialValues;
        this.initialValues = this.targetValues;
        this.targetValues = temp;
        
        // Reset start time
        this.startTime = performance.now();
        this.currentTime = 0;
    }
    
    // ============================================
    // Static Animation Methods
    // ============================================
    
    static animate(sprite, properties, options = {}) {
        const animation = new Animation(sprite, properties, options);
        animation.start();
        return animation;
    }
    
    static fadeIn(sprite, options = {}) {
        return this.animate(sprite, { opacity: 1 }, {
            duration: options.duration || 500,
            easing: options.easing || 'easeInQuad',
            ...options
        });
    }
    
    static fadeOut(sprite, options = {}) {
        return this.animate(sprite, { opacity: 0 }, {
            duration: options.duration || 500,
            easing: options.easing || 'easeOutQuad',
            ...options
        });
    }
    
    static moveTo(sprite, x, y, options = {}) {
        return this.animate(sprite, { x: x, y: y }, {
            duration: options.duration || 1000,
            easing: options.easing || 'easeOutQuad',
            ...options
        });
    }
    
    static glideTo(sprite, x, y, options = {}) {
        return this.moveTo(sprite, x, y, {
            easing: 'linear',
            ...options
        });
    }
    
    static scaleTo(sprite, size, options = {}) {
        return this.animate(sprite, { size: size }, {
            duration: options.duration || 500,
            easing: options.easing || 'easeOutQuad',
            ...options
        });
    }
    
    static rotateTo(sprite, direction, options = {}) {
        return this.animate(sprite, { direction: direction }, {
            duration: options.duration || 500,
            easing: options.easing || 'easeOutQuad',
            ...options
        });
    }
    
    static pulse(sprite, options = {}) {
        const originalSize = sprite.size;
        const scale = options.scale || 1.2;
        const duration = options.duration || 500;
        
        return this.animate(sprite, { size: originalSize * scale }, {
            duration: duration / 2,
            easing: 'easeOutQuad',
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                sprite.size = originalSize;
            }
        });
    }
    
    static shake(sprite, options = {}) {
        const originalX = sprite.x;
        const originalY = sprite.y;
        const intensity = options.intensity || 5;
        const duration = options.duration || 500;
        const steps = options.steps || 10;
        
        let step = 0;
        const interval = duration / steps;
        
        const shakeInterval = setInterval(() => {
            step++;
            
            if (step >= steps) {
                clearInterval(shakeInterval);
                sprite.x = originalX;
                sprite.y = originalY;
                
                if (options.onComplete) {
                    options.onComplete();
                }
            } else {
                const offsetX = (Math.random() - 0.5) * intensity * 2;
                const offsetY = (Math.random() - 0.5) * intensity * 2;
                sprite.x = originalX + offsetX;
                sprite.y = originalY + offsetY;
            }
        }, interval);
        
        return {
            stop: () => clearInterval(shakeInterval)
        };
    }
    
    static bounce(sprite, options = {}) {
        const originalY = sprite.y;
        const height = options.height || 50;
        const duration = options.duration || 1000;
        const bounces = options.bounces || 3;
        
        let bounceCount = 0;
        let direction = -1; // Up
        let startTime = performance.now();
        
        const bounce = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / (duration / bounces / 2), 1);
            
            // Ease out bounce
            const eased = 1 - Math.pow(1 - progress, 4);
            sprite.y = originalY + direction * height * eased;
            
            if (progress < 1) {
                requestAnimationFrame(bounce);
            } else {
                bounceCount++;
                
                if (bounceCount < bounces) {
                    direction *= -0.5; // Reduce bounce height
                    startTime = performance.now();
                    requestAnimationFrame(bounce);
                } else {
                    sprite.y = originalY;
                    
                    if (options.onComplete) {
                        options.onComplete();
                    }
                }
            }
        };
        
        requestAnimationFrame(bounce);
        
        return {
            stop: () => { /* Can't stop easily */ }
        };
    }
    
    static spin(sprite, options = {}) {
        const originalDirection = sprite.direction;
        const rotations = options.rotations || 1;
        const duration = options.duration || 1000;
        
        const startTime = performance.now();
        
        const spin = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            sprite.direction = originalDirection + progress * rotations * 360;
            
            if (progress < 1) {
                requestAnimationFrame(spin);
            } else {
                sprite.direction = originalDirection + rotations * 360;
                
                if (options.onComplete) {
                    options.onComplete();
                }
            }
        };
        
        requestAnimationFrame(spin);
        
        return {
            stop: () => { /* Can't stop easily */ }
        };
    }
}

// ============================================
// Animation System
// ============================================

const AnimationSystem = {
    init() {
        console.log('Initializing Animation System...');
    },
    
    update(deltaTime) {
        // Update all sprite animations
        for (const sprite of RuntimeState.sprites.values()) {
            if (sprite.animations) {
                for (const animation of sprite.animations) {
                    animation.update(deltaTime);
                }
            }
        }
    },
    
    stopAll() {
        for (const sprite of RuntimeState.sprites.values()) {
            if (sprite.animations) {
                for (const animation of sprite.animations) {
                    animation.stop();
                }
                sprite.animations = [];
            }
        }
    },
    
    // ============================================
    // Animation Presets
    // ============================================
    
    flyIn(sprite, options = {}) {
        const originalX = sprite.x;
        const originalY = sprite.y;
        const fromX = options.fromX || -RuntimeState.canvas.width / 2 - 50;
        const fromY = options.fromY || sprite.y;
        
        sprite.x = fromX;
        sprite.y = fromY;
        sprite.visible = true;
        
        return Animation.moveTo(sprite, originalX, originalY, {
            duration: options.duration || 1000,
            easing: options.easing || 'easeOutBack',
            onComplete: options.onComplete
        });
    }
    
    flyOut(sprite, options = {}) {
        const toX = options.toX || RuntimeState.canvas.width / 2 + 50;
        const toY = options.toY || sprite.y;
        
        return Animation.moveTo(sprite, toX, toY, {
            duration: options.duration || 1000,
            easing: options.easing || 'easeInBack',
            onComplete: () => {
                sprite.visible = false;
                if (options.onComplete) {
                    options.onComplete();
                }
            }
        });
    }
    
    slideIn(sprite, options = {}) {
        const originalX = sprite.x;
        const originalY = sprite.y;
        const fromX = options.fromX || sprite.x;
        const fromY = options.fromY || -RuntimeState.canvas.height / 2 - 50;
        
        sprite.x = fromX;
        sprite.y = fromY;
        sprite.visible = true;
        
        return Animation.moveTo(sprite, originalX, originalY, {
            duration: options.duration || 1000,
            easing: options.easing || 'easeOutBack',
            onComplete: options.onComplete
        });
    }
    
    slideOut(sprite, options = {}) {
        const toX = options.toX || sprite.x;
        const toY = options.toY || RuntimeState.canvas.height / 2 + 50;
        
        return Animation.moveTo(sprite, toX, toY, {
            duration: options.duration || 1000,
            easing: options.easing || 'easeInBack',
            onComplete: () => {
                sprite.visible = false;
                if (options.onComplete) {
                    options.onComplete();
                }
            }
        });
    }
    
    popIn(sprite, options = {}) {
        sprite.size = 0;
        sprite.visible = true;
        
        return Animation.scaleTo(sprite, 100, {
            duration: options.duration || 500,
            easing: options.easing || 'easeOutBack',
            onComplete: options.onComplete
        });
    }
    
    popOut(sprite, options = {}) {
        return Animation.scaleTo(sprite, 0, {
            duration: options.duration || 500,
            easing: options.easing || 'easeInBack',
            onComplete: () => {
                sprite.visible = false;
                if (options.onComplete) {
                    options.onComplete();
                }
            }
        });
    }
    
    fadeInPop(sprite, options = {}) {
        sprite.size = 0;
        sprite.opacity = 0;
        sprite.visible = true;
        
        const scaleAnim = Animation.scaleTo(sprite, 100, {
            duration: options.duration || 500,
            easing: 'easeOutBack'
        });
        
        const fadeAnim = Animation.fadeIn(sprite, {
            duration: options.duration || 500,
            easing: 'easeInQuad'
        });
        
        return {
            stop: () => {
                scaleAnim.stop();
                fadeAnim.stop();
            }
        };
    }
    
    fadeOutPop(sprite, options = {}) {
        const scaleAnim = Animation.scaleTo(sprite, 0, {
            duration: options.duration || 500,
            easing: 'easeInBack'
        });
        
        const fadeAnim = Animation.fadeOut(sprite, {
            duration: options.duration || 500,
            easing: 'easeOutQuad',
            onComplete: () => {
                sprite.visible = false;
                if (options.onComplete) {
                    options.onComplete();
                }
            }
        });
        
        return {
            stop: () => {
                scaleAnim.stop();
                fadeAnim.stop();
            }
        };
    }
    
    // ============================================
    // Camera Animations
    // ============================================
    
    cameraShake(intensity = 5, duration = 500) {
        const originalX = RuntimeState.offsetX;
        const originalY = RuntimeState.offsetY;
        const steps = 10;
        const interval = duration / steps;
        
        let step = 0;
        const startTime = performance.now();
        
        const shake = () => {
            step++;
            
            if (step >= steps) {
                RuntimeState.offsetX = originalX;
                RuntimeState.offsetY = originalY;
            } else {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const decay = 1 - progress;
                
                RuntimeState.offsetX = originalX + (Math.random() - 0.5) * intensity * 2 * decay;
                RuntimeState.offsetY = originalY + (Math.random() - 0.5) * intensity * 2 * decay;
            }
        };
        
        const shakeInterval = setInterval(shake, interval);
        
        setTimeout(() => {
            clearInterval(shakeInterval);
            RuntimeState.offsetX = originalX;
            RuntimeState.offsetY = originalY;
        }, duration);
        
        return {
            stop: () => clearInterval(shakeInterval)
        };
    }
    
    cameraZoom(targetZoom, options = {}) {
        const startZoom = RuntimeState.scale;
        const startTime = performance.now();
        
        const zoom = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / (options.duration || 500), 1);
            const easing = AnimationConfig.easingFunctions[options.easing || 'easeOutQuad'];
            
            RuntimeState.scale = startZoom + (targetZoom - startZoom) * easing(progress);
            
            if (progress < 1) {
                requestAnimationFrame(zoom);
            } else {
                RuntimeState.scale = targetZoom;
                if (options.onComplete) {
                    options.onComplete();
                }
            }
        };
        
        requestAnimationFrame(zoom);
        
        return {
            stop: () => { /* Can't stop easily */ }
        };
    }
    
    cameraFollow(sprite, options = {}) {
        const targetX = sprite.x;
        const targetY = sprite.y;
        const duration = options.duration || 500;
        const startTime = performance.now();
        
        const originalX = RuntimeState.offsetX;
        const originalY = RuntimeState.offsetY;
        
        const follow = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easing = AnimationConfig.easingFunctions[options.easing || 'easeOutQuad'];
            
            RuntimeState.offsetX = originalX + (targetX - RuntimeState.canvas.width / 2 - originalX) * easing(progress);
            RuntimeState.offsetY = originalY + (targetY - RuntimeState.canvas.height / 2 - originalY) * easing(progress);
            
            if (progress < 1) {
                requestAnimationFrame(follow);
            } else {
                RuntimeState.offsetX = targetX - RuntimeState.canvas.width / 2;
                RuntimeState.offsetY = targetY - RuntimeState.canvas.height / 2;
                if (options.onComplete) {
                    options.onComplete();
                }
            }
        };
        
        requestAnimationFrame(follow);
        
        return {
            stop: () => { /* Can't stop easily */ }
        };
    }
};

// ============================================
// Export
// ============================================

window.Animation = Animation;
window.AnimationSystem = AnimationSystem;
window.AnimationConfig = AnimationConfig;
