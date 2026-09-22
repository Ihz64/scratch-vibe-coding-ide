// UUID Generator Utility
// Generates unique identifiers for projects, files, sprites, etc.

class UUID {
    constructor() {
        this.version = '4.0';
    }

    // Generate a random UUID v4
    generate() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Generate a short UUID (8 characters)
    generateShort() {
        return 'xxxxxxxx'.replace(/[xy]/g, () => {
            const r = Math.random() * 16 | 0;
            return r.toString(16);
        });
    }

    // Generate a numeric ID
    generateNumeric() {
        return Date.now() + Math.floor(Math.random() * 10000);
    }

    // Validate UUID format
    validate(uuid) {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
    }

    // Generate a Scratch-compatible sprite ID
    generateSpriteId() {
        return this.generate();
    }

    // Generate a Scratch-compatible costume ID
    generateCostumeId() {
        return this.generate();
    }

    // Generate a Scratch-compatible sound ID
    generateSoundId() {
        return this.generate();
    }

    // Generate a Scratch-compatible broadcast ID
    generateBroadcastId() {
        return this.generate();
    }

    // Generate a Scratch-compatible variable ID
    generateVariableId() {
        return this.generate();
    }

    // Generate a Scratch-compatible list ID
    generateListId() {
        return this.generate();
    }

    // Generate a Scratch-compatible block ID
    generateBlockId() {
        return this.generate();
    }
}

// Singleton instance
const uuid = new UUID();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.UUID = uuid;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = uuid;
}
