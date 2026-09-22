// History Module
// Manages undo/redo functionality for the application

class History {
    constructor(maxHistory = 100) {
        this.maxHistory = maxHistory;
        this.history = [];
        this.currentIndex = -1;
        this.isBatch = false;
        this.batchChanges = [];
    }

    // Add a new state to history
    push(state, action = null) {
        if (this.isBatch) {
            this.batchChanges.push({ state, action });
            return;
        }

        // If we're not at the end of history, truncate
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new state
        this.history.push({ state, action });
        this.currentIndex = this.history.length - 1;

        // Enforce max history limit
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentIndex--;
        }
    }

    // Start a batch of changes
    startBatch() {
        this.isBatch = true;
        this.batchChanges = [];
    }

    // End a batch of changes and add as single history entry
    endBatch(action = null) {
        if (!this.isBatch) return;

        this.isBatch = false;
        
        if (this.batchChanges.length === 0) return;
        if (this.batchChanges.length === 1) {
            this.push(this.batchChanges[0].state, this.batchChanges[0].action || action);
        } else {
            // Merge batch changes into a single state
            const mergedState = this.mergeStates(this.batchChanges.map(c => c.state));
            this.push(mergedState, action);
        }
        
        this.batchChanges = [];
    }

    // Merge multiple states into one
    mergeStates(states) {
        if (states.length === 0) return null;
        if (states.length === 1) return states[0];
        
        // For now, just return the last state
        // This can be customized based on application needs
        return states[states.length - 1];
    }

    // Undo the last action
    undo() {
        if (this.currentIndex < 0) return null;

        const previousState = this.history[this.currentIndex - 1];
        if (!previousState) return null;

        this.currentIndex--;
        return previousState;
    }

    // Redo the last undone action
    redo() {
        if (this.currentIndex >= this.history.length - 1) return null;

        const nextState = this.history[this.currentIndex + 1];
        if (!nextState) return null;

        this.currentIndex++;
        return nextState;
    }

    // Get current state
    getCurrentState() {
        if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
            return null;
        }
        return this.history[this.currentIndex].state;
    }

    // Get current action
    getCurrentAction() {
        if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
            return null;
        }
        return this.history[this.currentIndex].action;
    }

    // Clear all history
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.isBatch = false;
        this.batchChanges = [];
    }

    // Get history size
    get size() {
        return this.history.length;
    }

    // Check if undo is available
    get canUndo() {
        return this.currentIndex > 0;
    }

    // Check if redo is available
    get canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    // Get undo stack size
    get undoStackSize() {
        return this.currentIndex;
    }

    // Get redo stack size
    get redoStackSize() {
        return this.history.length - this.currentIndex - 1;
    }

    // Get all history
    getAll() {
        return this.history.map((entry, index) => ({
            index,
            state: entry.state,
            action: entry.action,
            isCurrent: index === this.currentIndex
        }));
    }

    // Go to specific history index
    goTo(index) {
        if (index < 0 || index >= this.history.length) return null;
        this.currentIndex = index;
        return this.history[index];
    }

    // Find first state matching condition
    find(condition) {
        for (let i = 0; i < this.history.length; i++) {
            if (condition(this.history[i].state, i)) {
                return {
                    index: i,
                    state: this.history[i].state,
                    action: this.history[i].action
                };
            }
        }
        return null;
    }

    // Filter history by action type
    filterByAction(actionType) {
        return this.history
            .map((entry, index) => ({ index, ...entry }))
            .filter(entry => entry.action && entry.action.type === actionType);
    }

    // Get history statistics
    getStats() {
        return {
            total: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo,
            canRedo: this.canRedo,
            undoStackSize: this.undoStackSize,
            redoStackSize: this.redoStackSize
        };
    }

    // Export history for persistence
    export() {
        return {
            history: this.history,
            currentIndex: this.currentIndex
        };
    }

    // Import history from exported data
    import(data) {
        if (data && data.history) {
            this.history = data.history;
            this.currentIndex = data.currentIndex || this.history.length - 1;
        }
    }
}

// Action types for better tracking
const ActionTypes = {
    CREATE: 'create',
    DELETE: 'delete',
    UPDATE: 'update',
    RENAME: 'rename',
    MOVE: 'move',
    COPY: 'copy',
    PASTE: 'paste',
    UNDO: 'undo',
    REDO: 'redo',
    IMPORT: 'import',
    EXPORT: 'export',
    COMPILE: 'compile',
    RUN: 'run',
    STOP: 'stop',
    PAUSE: 'pause',
    DEBUG: 'debug',
    SAVE: 'save',
    LOAD: 'load',
    SETTINGS: 'settings'
};

// Create a history instance for the application
const history = new History();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.History = history;
    window.ActionTypes = ActionTypes;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { history, ActionTypes };
}
