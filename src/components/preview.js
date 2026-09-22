/**
 * Scratch Vibe Coding IDE - Preview Component
 * Handles the live preview of Scratch projects
 */

// ============================================
// Preview State
// ============================================

const PreviewState = {
    isRunning: false,
    isPaused: false,
    isFullscreen: false,
    scale: 1,
    volume: 1,
    showDebug: false,
    fps: 0,
    lastFpsUpdate: 0,
    frameCount: 0
};

// ============================================
// Preview Component
// ============================================

const Preview = {
    // ============================================
    // Initialization
    // ============================================
    
    init() {
        console.log('Initializing Preview...');
        
        this.cacheElements();
        this.setupEvents();
        this.initCanvas();
        
        console.log('Preview initialized');
    },
    
    cacheElements() {
        this.container = document.getElementById('preview-container');
        this.canvas = document.getElementById('scratchCanvas');
        this.previewHeader = document.querySelector('.preview-header');
        this.previewTitle = document.querySelector('.preview-title');
        this.previewStatus = document.querySelector('.preview-status');
        this.previewFPS = document.getElementById('previewFPS');
        this.previewStatusText = document.getElementById('previewStatus');
        this.previewSceneText = document.getElementById('previewScene');
        
        // Buttons
        this.btnRun = document.getElementById('btnPreviewRun');
        this.btnStop = document.getElementById('btnPreviewStop');
        this.btnFullscreen = document.getElementById('btnPreviewFullscreen');
        this.btnVolume = document.getElementById('btnPreviewVolume');
        this.btnDebug = document.getElementById('btnPreviewDebug');
    },
    
    setupEvents() {
        // Run button
        if (this.btnRun) {
            this.btnRun.addEventListener('click', () => this.run());
        }
        
        // Stop button
        if (this.btnStop) {
            this.btnStop.addEventListener('click', () => this.stop());
        }
        
        // Fullscreen button
        if (this.btnFullscreen) {
            this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Volume button
        if (this.btnVolume) {
            this.btnVolume.addEventListener('click', () => this.toggleMute());
        }
        
        // Debug button
        if (this.btnDebug) {
            this.btnDebug.addEventListener('click', () => this.toggleDebug());
        }
        
        // Fullscreen change
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('msfullscreenchange', () => this.handleFullscreenChange());
    },
    
    initCanvas() {
        if (!this.canvas) return;
        
        // Set default size
        this.canvas.width = 480;
        this.canvas.height = 360;
        
        // Set style
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.imageRendering = 'pixelated';
        
        // Get context
        this.context = this.canvas.getContext('2d');
        
        // Clear canvas
        this.clear();
    }
    
    // ============================================
    // Main Preview Functions
    // ============================================
    
    async run(project = null) {
        if (!AppState.currentProject && !project) {
            Notifications.show('Kein Projekt zum Ausführen', 'error');
            return;
        }
        
        const targetProject = project || AppState.currentProject;
        
        // Compile project
        Notifications.show('Kompiliere Projekt...', 'info');
        
        const result = Compiler.compile(targetProject);
        
        if (result.errors && result.errors.length > 0) {
            result.errors.forEach(error => {
                Debugger.logError(error.message, error.file, error.line, error.column);
            });
            Notifications.show('Kompilierungsfehler: ' + result.errors[0].message, 'error');
            return;
        }
        
        // Load project into runtime
        await Runtime.loadProject(result.project);
        
        // Start runtime
        Runtime.run();
        
        // Update state
        PreviewState.isRunning = true;
        PreviewState.isPaused = false;
        
        // Update UI
        this.updateUI();
        
        // Start FPS counter
        this.startFPSCounter();
        
        Notifications.show('Projekt wird ausgeführt', 'success');
    }
    
    stop() {
        Runtime.stop();
        
        // Update state
        PreviewState.isRunning = false;
        PreviewState.isPaused = false;
        
        // Update UI
        this.updateUI();
        
        // Stop FPS counter
        this.stopFPSCounter();
        
        // Clear canvas
        this.clear();
        
        Notifications.show('Projekt gestoppt', 'info');
    }
    
    pause() {
        if (PreviewState.isRunning) {
            Runtime.pause();
            PreviewState.isPaused = true;
            this.updateUI();
            Notifications.show('Projekt pausiert', 'info');
        }
    }
    
    resume() {
        if (PreviewState.isPaused) {
            Runtime.resume();
            PreviewState.isPaused = false;
            this.updateUI();
            Notifications.show('Projekt fortgesetzt', 'info');
        }
    }
    
    restart() {
        this.stop();
        this.run();
    }
    
    // ============================================
    // Fullscreen
    // ============================================
    
    toggleFullscreen() {
        if (!this.container) return;
        
        if (!document.fullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen() {
        if (!this.container) return;
        
        if (this.container.requestFullscreen) {
            this.container.requestFullscreen();
        } else if (this.container.webkitRequestFullscreen) {
            this.container.webkitRequestFullscreen();
        } else if (this.container.msRequestFullscreen) {
            this.container.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        PreviewState.isFullscreen = !!document.fullscreenElement;
        this.updateUI();
    }
    
    // ============================================
    // Volume
    // ============================================
    
    toggleMute() {
        PreviewState.volume = PreviewState.volume === 0 ? 1 : 0;
        this.updateUI();
    }
    
    setVolume(volume) {
        PreviewState.volume = Math.max(0, Math.min(1, volume));
        this.updateUI();
    }
    
    // ============================================
    // Debug
    // ============================================
    
    toggleDebug() {
        PreviewState.showDebug = !PreviewState.showDebug;
        Runtime.toggleDebug();
        this.updateUI();
    }
    
    toggleDebugOverlay(show) {
        PreviewState.showDebug = show;
        this.updateUI();
    }
    
    // ============================================
    // FPS Counter
    // ============================================
    
    startFPSCounter() {
        if (this.fpsInterval) {
            clearInterval(this.fpsInterval);
        }
        
        PreviewState.lastFpsUpdate = performance.now();
        PreviewState.frameCount = 0;
        
        this.fpsInterval = setInterval(() => {
            const now = performance.now();
            const elapsed = now - PreviewState.lastFpsUpdate;
            
            PreviewState.fps = Math.round(PreviewState.frameCount / (elapsed / 1000));
            PreviewState.lastFpsUpdate = now;
            PreviewState.frameCount = 0;
            
            // Update FPS display
            if (this.previewFPS) {
                this.previewFPS.textContent = `FPS: ${PreviewState.fps}`;
            }
        }, 1000);
    }
    
    stopFPSCounter() {
        if (this.fpsInterval) {
            clearInterval(this.fpsInterval);
            this.fpsInterval = null;
        }
        
        if (this.previewFPS) {
            this.previewFPS.textContent = 'FPS: 0';
        }
    }
    
    incrementFrameCount() {
        PreviewState.frameCount++;
    }
    
    // ============================================
    // Rendering
    // ============================================
    
    clear() {
        if (!this.canvas || !this.context) return;
        
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    render() {
        if (!this.canvas || !this.context) return;
        
        // Clear canvas
        this.clear();
        
        // Draw background
        this.drawBackground();
        
        // Draw sprites
        this.drawSprites();
        
        // Draw debug info
        if (PreviewState.showDebug) {
            this.drawDebugInfo();
        }
        
        // Increment frame count
        this.incrementFrameCount();
    }
    
    drawBackground() {
        if (!this.context) return;
        
        // Draw default background
        this.context.fillStyle = '#1e1e1e';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (for debugging)
        if (PreviewState.showDebug) {
            this.context.strokeStyle = '#303030';
            this.context.lineWidth = 1;
            
            const gridSize = 50;
            for (let x = 0; x < this.canvas.width; x += gridSize) {
                this.context.beginPath();
                this.context.moveTo(x, 0);
                this.context.lineTo(x, this.canvas.height);
                this.context.stroke();
            }
            
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                this.context.beginPath();
                this.context.moveTo(0, y);
                this.context.lineTo(this.canvas.width, y);
                this.context.stroke();
            }
        }
    }
    
    drawSprites() {
        if (!this.context) return;
        
        const sprites = Array.from(RuntimeState.sprites.values());
        
        // Sort sprites by z-index
        sprites.sort((a, b) => a.zIndex - b.zIndex);
        
        // Draw each sprite
        for (const sprite of sprites) {
            if (sprite.visible) {
                this.drawSprite(sprite);
            }
        }
        
        // Draw collision boxes if debug is enabled
        if (PreviewState.showDebug) {
            CollisionSystem.drawCollisionBoxes(this.context);
        }
    }
    
    drawSprite(sprite) {
        if (!this.context) return;
        
        this.context.save();
        
        // Apply transformations
        this.context.translate(
            sprite.x + this.canvas.width / 2,
            sprite.y + this.canvas.height / 2
        );
        this.context.rotate(sprite.direction * Math.PI / 180);
        this.context.scale(sprite.size / 100, sprite.size / 100);
        
        // Draw sprite
        this.context.fillStyle = this.getSpriteColor(sprite.name);
        this.context.fillRect(-24, -24, 48, 48);
        
        // Draw sprite name (for debugging)
        if (PreviewState.showDebug) {
            this.context.fillStyle = '#ffffff';
            this.context.font = '8px Arial';
            this.context.fillText(sprite.name, -20, -30);
        }
        
        this.context.restore();
    }
    
    getSpriteColor(spriteName) {
        // Simple hash to get consistent colors
        let hash = 0;
        for (let i = 0; i < spriteName.length; i++) {
            hash = spriteName.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
            '#00FFFF', '#FFA500', '#800080', '#008000', '#800000'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    drawDebugInfo() {
        if (!this.context) return;
        
        // Draw FPS
        this.context.fillStyle = '#ffffff';
        this.context.font = '12px Arial';
        this.context.fillText(`FPS: ${PreviewState.fps}`, 10, 20);
        
        // Draw mouse position
        this.context.fillText(`Mouse: ${Math.round(RuntimeState.mouseX)}, ${Math.round(RuntimeState.mouseY)}`, 10, 35);
        
        // Draw sprite count
        this.context.fillText(`Sprites: ${RuntimeState.sprites.size}`, 10, 50);
        
        // Draw active scripts count
        this.context.fillText(`Scripts: ${RuntimeState.activeScripts.length}`, 10, 65);
    }
    
    // ============================================
    // UI Updates
    // ============================================
    
    updateUI() {
        // Update buttons
        if (this.btnRun) {
            this.btnRun.style.display = PreviewState.isRunning ? 'none' : 'inline-flex';
        }
        
        if (this.btnStop) {
            this.btnStop.style.display = PreviewState.isRunning ? 'inline-flex' : 'none';
        }
        
        if (this.btnFullscreen) {
            this.btnFullscreen.classList.toggle('active', PreviewState.isFullscreen);
        }
        
        if (this.btnDebug) {
            this.btnDebug.classList.toggle('active', PreviewState.showDebug);
        }
        
        // Update volume button icon
        if (this.btnVolume) {
            this.btnVolume.innerHTML = PreviewState.volume === 0 ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        }
        
        // Update status
        if (this.previewStatusText) {
            if (PreviewState.isRunning) {
                this.previewStatusText.textContent = PreviewState.isPaused ? 'Pausiert' : 'Läuft';
            } else {
                this.previewStatusText.textContent = 'Bereit';
            }
        }
        
        // Update scene
        if (this.previewSceneText) {
            // In a real implementation, we would get the current scene
            this.previewSceneText.textContent = 'Szene: Keine';
        }
    }
    
    // ============================================
    // Scale
    // ============================================
    
    setScale(scale) {
        PreviewState.scale = Math.max(0.1, Math.min(2, scale));
        
        if (this.canvas) {
            // Adjust canvas rendering based on scale
        }
    }
    
    zoomIn() {
        this.setScale(PreviewState.scale + 0.1);
    }
    
    zoomOut() {
        this.setScale(PreviewState.scale - 0.1);
    }
    
    resetZoom() {
        this.setScale(1);
    }
    
    // ============================================
    // Utility Methods
    // ============================================
    
    resize(width, height) {
        if (!this.canvas) return;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Clear and redraw
        this.clear();
        this.render();
    }
    
    screenshot() {
        if (!this.canvas) return null;
        
        return this.canvas.toDataURL('image/png');
    }
    
    getCanvas() {
        return this.canvas;
    }
    
    getContext() {
        return this.context;
    }
};

// ============================================
// Initialize Preview
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Preview.init();
    });
} else {
    Preview.init();
}

// Export
window.Preview = Preview;
window.PreviewState = PreviewState;
