// File Utility Functions
// Handles file operations, path manipulation, and MIME type detection

class FileUtils {
    constructor() {
        this.mimeTypes = {
            // Images
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp',
            
            // Audio
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.aac': 'audio/aac',
            
            // Text
            '.txt': 'text/plain',
            '.json': 'application/json',
            '.xml': 'application/xml',
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            
            // Archives
            '.zip': 'application/zip',
            '.sb3': 'application/zip',
            '.sb2': 'application/zip',
            
            // Scratch specific
            '.sprite': 'application/json',
            '.costume': 'application/json',
            '.sound': 'application/json',
            '.project': 'application/json'
        };
    }

    // Get file extension from filename
    getExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        if (lastDot === -1) return '';
        return filename.slice(lastDot).toLowerCase();
    }

    // Get base filename without extension
    getBasename(filename) {
        const lastDot = filename.lastIndexOf('.');
        if (lastDot === -1) return filename;
        return filename.slice(0, lastDot);
    }

    // Get MIME type from extension
    getMimeType(filename) {
        const ext = this.getExtension(filename);
        return this.mimeTypes[ext] || 'application/octet-stream';
    }

    // Check if file is an image
    isImage(filename) {
        const ext = this.getExtension(filename);
        return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.webp'].includes(ext);
    }

    // Check if file is audio
    isAudio(filename) {
        const ext = this.getExtension(filename);
        return ['.wav', '.mp3', '.ogg', '.m4a', '.aac'].includes(ext);
    }

    // Check if file is a Scratch project
    isScratchProject(filename) {
        const ext = this.getExtension(filename);
        return ['.sb3', '.sb2'].includes(ext);
    }

    // Check if file is JSON
    isJson(filename) {
        const ext = this.getExtension(filename);
        return ['.json', '.sprite', '.costume', '.sound', '.project'].includes(ext);
    }

    // Generate a safe filename from user input
    sanitizeFilename(name) {
        return name
            .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
            .replace(/^\s+|\s+$/g, '')
            .substring(0, 255);
    }

    // Generate a unique filename by adding suffix if needed
    getUniqueFilename(existingFiles, desiredName) {
        let name = desiredName;
        let ext = this.getExtension(desiredName);
        let base = this.getBasename(desiredName);
        let counter = 1;
        
        while (existingFiles.includes(name)) {
            name = `${base}_${counter}${ext}`;
            counter++;
        }
        
        return name;
    }

    // Convert file size to human-readable format
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Read file as text
    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Read file as data URL
    async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    // Read file as array buffer
    async readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }

    // Convert data URL to blob
    dataURLToBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        
        return new Blob([uInt8Array], { type: contentType });
    }

    // Convert blob to data URL
    async blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Download a file
    downloadFile(content, filename, mimeType = 'application/octet-stream') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    // Download a data URL
    downloadDataURL(dataURL, filename) {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
    }

    // Trigger file input dialog and return selected files
    async selectFiles(accept = '*/*', multiple = false) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = multiple;
            input.style.display = 'none';
            
            input.onchange = () => {
                if (input.files.length > 0) {
                    resolve(Array.from(input.files));
                } else {
                    reject(new Error('No files selected'));
                }
                document.body.removeChild(input);
            };
            
            input.onerror = (e) => {
                document.body.removeChild(input);
                reject(e);
            };
            
            document.body.appendChild(input);
            input.click();
        });
    }

    // Trigger save file dialog
    async saveFile(content, filename, mimeType = 'application/octet-stream') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        try {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            return new Promise((resolve) => {
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    resolve();
                }, 100);
            });
        } catch (e) {
            URL.revokeObjectURL(url);
            throw e;
        }
    }

    // Get file icon based on type
    getFileIcon(filename) {
        const ext = this.getExtension(filename);
        
        if (this.isImage(filename)) return 'fa-file-image';
        if (this.isAudio(filename)) return 'fa-file-audio';
        if (this.isScratchProject(filename)) return 'fa-file-archive';
        if (this.isJson(filename)) return 'fa-file-code';
        if (ext === '.txt') return 'fa-file-alt';
        
        return 'fa-file';
    }

    // Get file type description
    getFileType(filename) {
        if (this.isImage(filename)) return 'Image';
        if (this.isAudio(filename)) return 'Audio';
        if (this.isScratchProject(filename)) return 'Scratch Project';
        if (this.isJson(filename)) return 'JSON';
        return 'File';
    }
}

// Singleton instance
const fileUtils = new FileUtils();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.FileUtils = fileUtils;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = fileUtils;
}
