/**
 * Scratch Vibe Coding IDE - Debugger
 * Provides debugging capabilities for Scratch projects
 */

// ============================================
// Debugger State
// ============================================

const DebuggerState = {
    isEnabled: false,
    isPaused: false,
    breakpoints: new Set(),
    watchExpressions: [],
    callStack: [],
    variables: new Map(),
    logs: [],
    errors: [],
    warnings: [],
    
    // Visual debug
    showHitboxes: false,
    showCollisionBoxes: false,
    showPositions: false,
    showDirections: false,
    showLayers: false,
    showCamera: false,
    showFPS: true
};

// ============================================
// Log Entry Class
// ============================================

class DebugLogEntry {
    constructor(type, message, data = {}, timestamp = Date.now()) {
        this.id = this.generateId();
        this.type = type; // 'log', 'error', 'warning', 'info', 'debug'
        this.message = message;
        this.data = data;
        this.timestamp = timestamp;
        this.formattedTime = new Date(timestamp).toLocaleTimeString();
    }
    
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    toString() {
        return `[${this.formattedTime}] [${this.type.toUpperCase()}] ${this.message}`;
    }
    
    toHTML() {
        const typeClass = this.type;
        return `<div class="debug-log-entry ${typeClass}">
            <span class="debug-time">[${this.formattedTime}]</span>
            <span class="debug-type">[${this.type.toUpperCase()}]</span>
            <span class="debug-message">${this.escapeHtml(this.message)}</span>
        </div>`;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// Debugger Class
// ============================================

class Debugger {
    constructor() {
        this.init();
    }
    
    // ============================================
    // Initialization
    // ============================================
    
    static init() {
        console.log('Initializing Debugger...');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Setup event listeners
        this.setupEvents();
        
        // Initialize console
        this.initConsole();
        
        console.log('Debugger initialized');
    }
    
    static cacheElements() {
        this.debugConsole = document.getElementById('debugConsole');
        this.debugOutput = document.getElementById('debugOutput');
        this.debugConsoleModal = document.getElementById('debugConsoleModal');
    }
    
    static setupEvents() {
        // Close console
        const closeBtn = document.getElementById('debugConsoleClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeConsole();
            });
        }
        
        // Close console button
        const closeBtn2 = document.getElementById('debugConsoleCloseBtn');
        if (closeBtn2) {
            closeBtn2.addEventListener('click', () => {
                this.closeConsole();
            });
        }
        
        // Clear console
        const clearBtn = document.getElementById('debugConsoleClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clear();
            });
        }
    }
    
    static initConsole() {
        // Clear existing logs
        this.clear();
        
        // Add welcome message
        this.logInfo('Scratch Vibe Coding IDE Debug Console');
        this.logInfo('Ready for debugging!');
    }
    
    // ============================================
    // Main Debugger Functions
    // ============================================
    
    static toggle() {
        DebuggerState.isEnabled = !DebuggerState.isEnabled;
        
        if (DebuggerState.isEnabled) {
            this.openConsole();
            this.logInfo('Debugger enabled');
        } else {
            this.logInfo('Debugger disabled');
        }
        
        // Update UI
        this.updateUI();
    }
    
    static enable() {
        DebuggerState.isEnabled = true;
        this.logInfo('Debugger enabled');
        this.updateUI();
    }
    
    static disable() {
        DebuggerState.isEnabled = false;
        this.logInfo('Debugger disabled');
        this.updateUI();
    }
    
    static isEnabled() {
        return DebuggerState.isEnabled;
    }
    
    // ============================================
    // Logging Functions
    // ============================================
    
    static log(message, type = 'log', data = {}) {
        if (!DebuggerState.isEnabled) return;
        
        const entry = new DebugLogEntry(type, message, data);
        
        // Add to logs
        DebuggerState.logs.push(entry);
        
        // Limit logs to 1000 entries
        if (DebuggerState.logs.length > 1000) {
            DebuggerState.logs.shift();
        }
        
        // Update console
        this.updateConsole();
        
        // Also log to browser console
        switch (type) {
            case 'error':
                console.error(`[Scratch Debug] ${message}`, data);
                break;
            case 'warning':
                console.warn(`[Scratch Debug] ${message}`, data);
                break;
            case 'info':
                console.info(`[Scratch Debug] ${message}`, data);
                break;
            case 'debug':
                console.debug(`[Scratch Debug] ${message}`, data);
                break;
            default:
                console.log(`[Scratch Debug] ${message}`, data);
        }
    }
    
    static logInfo(message, data = {}) {
        this.log(message, 'info', data);
    }
    
    static logError(message, data = {}) {
        this.log(message, 'error', data);
    }
    
    static logWarning(message, data = {}) {
        this.log(message, 'warning', data);
    }
    
    static logDebug(message, data = {}) {
        this.log(message, 'debug', data);
    }
    
    static logEvent(eventType, data = {}) {
        if (!DebuggerState.isEnabled) return;
        
        this.log(`Event: ${eventType}`, 'info', data);
    }
    
    static logVariableChange(name, oldValue, newValue, sprite = null) {
        if (!DebuggerState.isEnabled) return;
        
        const scope = sprite ? `Sprite "${sprite.name}"` : 'Global';
        this.log(`${scope}: Variable "${name}" changed from ${oldValue} to ${newValue}`, 'debug', {
            variable: name,
            oldValue: oldValue,
            newValue: newValue,
            sprite: sprite?.name
        });
    }
    
    static logBroadcast(message, sender = null) {
        if (!DebuggerState.isEnabled) return;
        
        const scope = sender ? `Sprite "${sender.name}"` : 'Stage';
        this.log(`Broadcast: "${message}" from ${scope}`, 'info', {
            message: message,
            sender: sender?.name
        });
    }
    
    static logCollision(sprite1, sprite2) {
        if (!DebuggerState.isEnabled) return;
        
        this.log(`Collision: ${sprite1.name} -> ${sprite2.name}`, 'info', {
            sprite1: sprite1.name,
            sprite2: sprite2.name
        });
    }
    
    // ============================================
    // Breakpoints
    // ============================================
    
    static addBreakpoint(fileId, line, column = 0) {
        const key = `${fileId}:${line}:${column}`;
        DebuggerState.breakpoints.add(key);
        this.logInfo(`Breakpoint set at ${fileId}:${line}:${column}`);
    }
    
    static removeBreakpoint(fileId, line, column = 0) {
        const key = `${fileId}:${line}:${column}`;
        DebuggerState.breakpoints.delete(key);
        this.logInfo(`Breakpoint removed from ${fileId}:${line}:${column}`);
    }
    
    static hasBreakpoint(fileId, line, column = 0) {
        const key = `${fileId}:${line}:${column}`;
        return DebuggerState.breakpoints.has(key);
    }
    
    static clearBreakpoints() {
        DebuggerState.breakpoints.clear();
        this.logInfo('All breakpoints cleared');
    }
    
    static getBreakpoints() {
        return Array.from(DebuggerState.breakpoints);
    }
    
    // ============================================
    // Watch Expressions
    // ============================================
    
    static addWatchExpression(expression) {
        DebuggerState.watchExpressions.push(expression);
        this.logInfo(`Watch expression added: ${expression}`);
    }
    
    static removeWatchExpression(index) {
        if (index >= 0 && index < DebuggerState.watchExpressions.length) {
            const expression = DebuggerState.watchExpressions[index];
            DebuggerState.watchExpressions.splice(index, 1);
            this.logInfo(`Watch expression removed: ${expression}`);
        }
    }
    
    static clearWatchExpressions() {
        DebuggerState.watchExpressions = [];
        this.logInfo('All watch expressions cleared');
    }
    
    static getWatchExpressions() {
        return [...DebuggerState.watchExpressions];
    }
    
    static evaluateWatchExpressions() {
        const results = [];
        
        for (const expr of DebuggerState.watchExpressions) {
            try {
                // In a real implementation, we would evaluate the expression
                // For now, just return the expression itself
                results.push({
                    expression: expr,
                    value: expr
                });
            } catch (error) {
                results.push({
                    expression: expr,
                    value: `Error: ${error.message}`
                });
            }
        }
        
        return results;
    }
    
    // ============================================
    // Call Stack
    // ============================================
    
    static pushCallStack(frame) {
        DebuggerState.callStack.push(frame);
    }
    
    static popCallStack() {
        return DebuggerState.callStack.pop();
    }
    
    static getCallStack() {
        return [...DebuggerState.callStack];
    }
    
    static clearCallStack() {
        DebuggerState.callStack = [];
    }
    
    // ============================================
    // Console Management
    // ============================================
    
    static openConsole() {
        if (this.debugConsoleModal) {
            this.debugConsoleModal.style.display = 'flex';
        }
    }
    
    static closeConsole() {
        if (this.debugConsoleModal) {
            this.debugConsoleModal.style.display = 'none';
        }
    }
    
    static clear() {
        DebuggerState.logs = [];
        DebuggerState.errors = [];
        DebuggerState.warnings = [];
        
        // Update console
        this.updateConsole();
    }
    
    static updateConsole() {
        if (!this.debugOutput) return;
        
        // Sort logs by timestamp (newest first)
        const logs = [...DebuggerState.logs].sort((a, b) => b.timestamp - a.timestamp);
        
        // Generate HTML
        let html = '';
        for (const log of logs) {
            html += log.toHTML();
        }
        
        // Update output
        this.debugOutput.innerHTML = html || '<div class="debug-empty">No logs yet...</div>';
        
        // Scroll to bottom
        this.debugOutput.scrollTop = this.debugOutput.scrollHeight;
    }
    
    // ============================================
    // Visual Debugging
    // ============================================
    
    static toggleHitboxes() {
        DebuggerState.showHitboxes = !DebuggerState.showHitboxes;
        this.logInfo(`Hitboxes ${DebuggerState.showHitboxes ? 'shown' : 'hidden'}`);
    }
    
    static toggleCollisionBoxes() {
        DebuggerState.showCollisionBoxes = !DebuggerState.showCollisionBoxes;
        this.logInfo(`Collision boxes ${DebuggerState.showCollisionBoxes ? 'shown' : 'hidden'}`);
    }
    
    static togglePositions() {
        DebuggerState.showPositions = !DebuggerState.showPositions;
        this.logInfo(`Positions ${DebuggerState.showPositions ? 'shown' : 'hidden'}`);
    }
    
    static toggleDirections() {
        DebuggerState.showDirections = !DebuggerState.showDirections;
        this.logInfo(`Directions ${DebuggerState.showDirections ? 'shown' : 'hidden'}`);
    }
    
    static toggleLayers() {
        DebuggerState.showLayers = !DebuggerState.showLayers;
        this.logInfo(`Layers ${DebuggerState.showLayers ? 'shown' : 'hidden'}`);
    }
    
    static toggleCamera() {
        DebuggerState.showCamera = !DebuggerState.showCamera;
        this.logInfo(`Camera info ${DebuggerState.showCamera ? 'shown' : 'hidden'}`);
    }
    
    static toggleFPS() {
        DebuggerState.showFPS = !DebuggerState.showFPS;
        this.logInfo(`FPS ${DebuggerState.showFPS ? 'shown' : 'hidden'}`);
    }
    
    // ============================================
    // Error Handling
    // ============================================
    
    static captureError(error, file, line, column) {
        DebuggerState.errors.push({
            error: error,
            file: file,
            line: line,
            column: column,
            timestamp: Date.now()
        });
        
        this.logError(`${file}:${line}:${column} - ${error.message}`);
    }
    
    static captureWarning(warning, file, line, column) {
        DebuggerState.warnings.push({
            warning: warning,
            file: file,
            line: line,
            column: column,
            timestamp: Date.now()
        });
        
        this.logWarning(`${file}:${line}:${column} - ${warning}`);
    }
    
    static getErrors() {
        return [...DebuggerState.errors];
    }
    
    static getWarnings() {
        return [...DebuggerState.warnings];
    }
    
    static clearErrors() {
        DebuggerState.errors = [];
    }
    
    static clearWarnings() {
        DebuggerState.warnings = [];
    }
    
    // ============================================
    // UI Updates
    // ============================================
    
    static updateUI() {
        // Update debug button in header
        const debugBtn = document.getElementById('btnDebug');
        if (debugBtn) {
            if (DebuggerState.isEnabled) {
                debugBtn.classList.remove('btn-secondary');
                debugBtn.classList.add('btn-success');
            } else {
                debugBtn.classList.remove('btn-success');
                debugBtn.classList.add('btn-secondary');
            }
        }
        
        // Update debug console visibility
        if (this.debugConsoleModal) {
            if (DebuggerState.isEnabled && this.debugConsoleModal.style.display !== 'flex') {
                this.debugConsoleModal.style.display = 'flex';
            }
        }
    }
    
    // ============================================
    // Utility Methods
    // ============================================
    
    static formatStackTrace(stackTrace) {
        if (!stackTrace) return 'No stack trace available';
        
        return stackTrace.split('\n').map(line => {
            return line.trim();
        }).filter(line => line).join('\n');
    }
    
    static getVariableValue(name, sprite = null) {
        const key = sprite ? `${sprite.name}:${name}` : name;
        const variable = RuntimeState.variables.get(key);
        return variable ? variable.value : null;
    }
    
    static getAllVariables() {
        return Object.fromEntries(RuntimeState.variables.entries());
    }
}

// ============================================
// Initialize Debugger
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Debugger.init();
    });
} else {
    Debugger.init();
}

// Export
window.Debugger = Debugger;
window.DebuggerState = DebuggerState;
window.DebugLogEntry = DebugLogEntry;
