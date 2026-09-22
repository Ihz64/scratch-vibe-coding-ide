// Status Bar Component
// Displays status information at the bottom of the IDE

class StatusBar {
    constructor() {
        this.element = null;
        this.parts = {};
        this.initialized = false;
        this.updateIntervals = {};
    }

    // Initialize the status bar
    init() {
        if (this.initialized) return;

        this.element = document.getElementById('status-bar');
        if (!this.element) {
            console.warn('Status bar element not found');
            return;
        }

        // Create status bar parts
        this.parts = {
            cursor: this.createPart('cursor', 'Cursor: 1:1'),
            errors: this.createPart('errors', 'Errors: 0'),
            warnings: this.createPart('warnings', 'Warnings: 0'),
            time: this.createPart('time', '00:00:00'),
            autosave: this.createPart('autosave', 'Autosave: Off'),
            compile: this.createPart('compile', 'Compile: Ready'),
            fps: this.createPart('fps', 'FPS: 0')
        };

        // Start time updates
        this.startTimeUpdate();

        this.initialized = true;
        this.updateAll();
    }

    // Create a status bar part
    createPart(id, initialText) {
        const part = document.createElement('div');
        part.className = `status-part status-${id}`;
        part.textContent = initialText;
        part.dataset.part = id;
        this.element.appendChild(part);
        return part;
    }

    // Start time updates
    startTimeUpdate() {
        this.updateIntervals.time = setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    // Stop time updates
    stopTimeUpdate() {
        if (this.updateIntervals.time) {
            clearInterval(this.updateIntervals.time);
            this.updateIntervals.time = null;
        }
    }

    // Update time display
    updateTime() {
        if (this.parts.time) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            this.parts.time.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    // Update cursor position
    updateCursor(line, column) {
        if (this.parts.cursor) {
            this.parts.cursor.textContent = `Cursor: ${line + 1}:${column + 1}`;
        }
    }

    // Update error count
    updateErrors(count) {
        if (this.parts.errors) {
            this.parts.errors.textContent = `Errors: ${count}`;
            this.parts.errors.classList.toggle('status-error', count > 0);
        }
    }

    // Update warning count
    updateWarnings(count) {
        if (this.parts.warnings) {
            this.parts.warnings.textContent = `Warnings: ${count}`;
            this.parts.warnings.classList.toggle('status-warning', count > 0);
        }
    }

    // Update autosave status
    updateAutosave(enabled) {
        if (this.parts.autosave) {
            this.parts.autosave.textContent = `Autosave: ${enabled ? 'On' : 'Off'}`;
            this.parts.autosave.classList.toggle('status-success', enabled);
        }
    }

    // Update compile status
    updateCompile(status) {
        if (this.parts.compile) {
            this.parts.compile.textContent = `Compile: ${status}`;
            this.parts.compile.className = `status-part status-compile status-${status.toLowerCase().replace(/\s+/g, '-')}`;
        }
    }

    // Update FPS
    updateFPS(fps) {
        if (this.parts.fps) {
            this.parts.fps.textContent = `FPS: ${Math.round(fps)}`;
        }
    }

    // Update all status parts
    updateAll() {
        this.updateTime();
        this.updateCursor(0, 0);
        this.updateErrors(0);
        this.updateWarnings(0);
        this.updateAutosave(false);
        this.updateCompile('Ready');
        this.updateFPS(0);
    }

    // Set a custom status message
    setMessage(part, message, className = '') {
        if (this.parts[part]) {
            this.parts[part].textContent = message;
            if (className) {
                this.parts[part].className = `status-part status-${part} ${className}`;
            }
        }
    }

    // Clear a status part
    clear(part) {
        if (this.parts[part]) {
            this.parts[part].textContent = '';
            this.parts[part].className = `status-part status-${part}`;
        }
    }

    // Toggle visibility
    show() {
        if (this.element) {
            this.element.style.display = 'flex';
        }
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    // Check if visible
    get isVisible() {
        return this.element && this.element.style.display !== 'none';
    }

    // Add a temporary message
    showTemporaryMessage(message, duration = 3000, className = 'status-info') {
        const tempPart = document.createElement('div');
        tempPart.className = `status-part status-temp ${className}`;
        tempPart.textContent = message;
        
        this.element.insertBefore(tempPart, this.element.firstChild);
        
        setTimeout(() => {
            tempPart.remove();
        }, duration);
    }

    // Destroy the status bar
    destroy() {
        this.stopTimeUpdate();
        
        for (const key in this.updateIntervals) {
            if (this.updateIntervals[key]) {
                clearInterval(this.updateIntervals[key]);
            }
        }
        
        if (this.element) {
            this.element.innerHTML = '';
            this.element = null;
        }
        
        this.parts = {};
        this.initialized = false;
    }

    // Get status bar element
    getElement() {
        return this.element;
    }
}

// Create status bar instance
const statusBar = new StatusBar();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            statusBar.init();
        });
    } else {
        statusBar.init();
    }
    
    window.StatusBar = statusBar;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = statusBar;
}
