/**
 * Theme Management for Scratch Vibe Coding IDE
 * Handles theme switching and CSS variable updates
 */

// Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themes = {
            dark: this.getDarkTheme(),
            light: this.getLightTheme(),
            'high-contrast': this.getHighContrastTheme()
        };
        this.initialized = false;
    }

    // Initialize theme manager
    init() {
        if (this.initialized) return;

        // Load saved theme
        const savedTheme = localStorage.getItem('vibe-ide-theme') || 'dark';
        this.setTheme(savedTheme);

        this.initialized = true;
    }

    // Get dark theme variables
    getDarkTheme() {
        return {
            // Background colors
            '--bg-primary': '#1e1e1e',
            '--bg-secondary': '#252526',
            '--bg-tertiary': '#2d2d30',
            '--bg-hover': '#2a2d2e',
            '--bg-active': '#3e3e42',
            '--bg-input': '#2d2d30',
            '--bg-input-hover': '#383838',
            '--bg-panel': '#252526',
            '--bg-toolbar': '#2d2d30',
            '--bg-statusbar': '#252526',
            '--bg-modal': '#2d2d30',
            '--bg-code': '#1e1e1e',

            // Text colors
            '--text-primary': '#d4d4d4',
            '--text-secondary': '#9cdcfe',
            '--text-muted': '#6a9955',
            '--text-disabled': '#576367',
            '--text-inverse': '#ffffff',
            '--text-link': '#569cd6',
            '--text-link-hover': '#78b8e0',

            // Border colors
            '--border-color': '#3e3e42',
            '--border-color-light': '#505050',
            '--border-color-dark': '#1e1e1e',
            '--border-radius': '4px',
            '--border-radius-sm': '2px',
            '--border-width': '1px',

            // Scratch colors
            '--scratch-red': '#ff0000',
            '--scratch-orange': '#ff7f00',
            '--scratch-yellow': '#ffff00',
            '--scratch-green': '#00ff00',
            '--scratch-light-green': '#90ee90',
            '--scratch-blue': '#0078ff',
            '--scratch-light-blue': '#add8e6',
            '--scratch-purple': '#9900ff',
            '--scratch-pink': '#ff00ff',

            // UI colors
            '--color-primary': '#569cd6',
            '--color-primary-hover': '#78b8e0',
            '--color-primary-active': '#3b88d8',
            '--color-secondary': '#9cdcfe',
            '--color-success': '#4ec9b0',
            '--color-warning': '#f4bf75',
            '--color-danger': '#d55f5f',
            '--color-info': '#569cd6',

            // Button colors
            '--btn-bg-primary': '#569cd6',
            '--btn-bg-primary-hover': '#78b8e0',
            '--btn-bg-primary-active': '#3b88d8',
            '--btn-bg-secondary': '#3e3e42',
            '--btn-bg-secondary-hover': '#4e4e52',
            '--btn-bg-secondary-active': '#2e2e32',
            '--btn-bg-success': '#4ec9b0',
            '--btn-bg-success-hover': '#68d5c0',
            '--btn-bg-success-active': '#38a58a',
            '--btn-bg-danger': '#d55f5f',
            '--btn-bg-danger-hover': '#e07070',
            '--btn-bg-danger-active': '#b54040',

            // Status colors
            '--status-bg-error': 'rgba(255, 0, 0, 0.2)',
            '--status-bg-warning': 'rgba(255, 255, 0, 0.2)',
            '--status-bg-success': 'rgba(0, 255, 0, 0.2)',
            '--status-text-error': '#ff0000',
            '--status-text-warning': '#ffff00',
            '--status-text-success': '#00ff00',

            // Selection
            '--selection-bg': 'rgba(86, 156, 214, 0.3)',
            '--selection-text': '#ffffff',

            // Cursor
            '--cursor-color': '#d4d4d4',

            // Shadows
            '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
            '--shadow-md': '0 2px 4px rgba(0, 0, 0, 0.3)',
            '--shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.3)',

            // Transitions
            '--transition-fast': '0.1s ease',
            '--transition-normal': '0.2s ease',
            '--transition-slow': '0.3s ease',

            // Font
            '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
            '--font-mono': '"Fira Code", "Consolas", "Monaco", "Andale Mono", "Ubuntu Mono", monospace',
            '--font-size': '14px',
            '--font-size-sm': '12px',
            '--font-size-lg': '16px',
            '--font-size-code': '13px',
            '--font-weight-normal': '400',
            '--font-weight-bold': '600',

            // Spacing
            '--spacing-xs': '4px',
            '--spacing-sm': '8px',
            '--spacing-md': '12px',
            '--spacing-lg': '16px',
            '--spacing-xl': '24px',
            '--spacing-xxl': '32px',

            // Layout
            '--header-height': '50px',
            '--sidebar-width': '250px',
            '--sidebar-collapsed-width': '50px',
            '--preview-width': '300px',
            '--statusbar-height': '24px',
            '--editor-tab-height': '35px',

            // Preview
            '--preview-bg': '#1e1e1e',
            '--preview-border': '#3e3e42',

            // Scrollbar
            '--scrollbar-width': '10px',
            '--scrollbar-thumb': '#404040',
            '--scrollbar-track': '#252526',
            '--scrollbar-thumb-hover': '#505050',

            // Minimap
            '--minimap-width': '100px',
            '--minimap-bg': '#252526',
            '--minimap-code-bg': '#1e1e1e',
            '--minimap-selection': '#569cd6',

            // Notification
            '--notification-bg-info': '#2d2d30',
            '--notification-bg-success': '#2d4a3a',
            '--notification-bg-warning': '#4a412d',
            '--notification-bg-error': '#4a2d2d',
            '--notification-text-info': '#d4d4d4',
            '--notification-text-success': '#4ec9b0',
            '--notification-text-warning': '#f4bf75',
            '--notification-text-error': '#d55f5f',

            // Modal
            '--modal-bg': '#2d2d30',
            '--modal-border': '#3e3e42',
            '--modal-overlay': 'rgba(0, 0, 0, 0.7)',

            // Tooltip
            '--tooltip-bg': '#2d2d30',
            '--tooltip-text': '#d4d4d4',
            '--tooltip-border': '#3e3e42',

            // Input
            '--input-bg': '#2d2d30',
            '--input-border': '#3e3e42',
            '--input-text': '#d4d4d4',
            '--input-placeholder': '#6a9955',
            '--input-focus-border': '#569cd6',
            '--input-error-border': '#d55f5f',

            // Loading
            '--loading-spinner': '#569cd6',
            '--loading-text': '#d4d4d4',

            // Debug
            '--debug-bg': '#1e1e1e',
            '--debug-text': '#d4d4d4',
            '--debug-border': '#3e3e42',
            '--debug-error': '#ff0000',
            '--debug-warning': '#ffff00',
            '--debug-log': '#9cdcfe',

            // Breakpoint
            '--breakpoint-bg': 'rgba(255, 0, 0, 0.3)',
            '--breakpoint-border': '#ff0000',

            // Watch expression
            '--watch-bg': 'rgba(0, 255, 0, 0.1)',
            '--watch-border': '#00ff00',
            '--watch-text': '#00ff00'
        };
    }

    // Get light theme variables
    getLightTheme() {
        return {
            // Background colors
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f5f5f5',
            '--bg-tertiary': '#e8e8e8',
            '--bg-hover': '#f0f0f0',
            '--bg-active': '#e0e0e0',
            '--bg-input': '#f5f5f5',
            '--bg-input-hover': '#e8e8e8',
            '--bg-panel': '#f5f5f5',
            '--bg-toolbar': '#e8e8e8',
            '--bg-statusbar': '#f5f5f5',
            '--bg-modal': '#ffffff',
            '--bg-code': '#f5f5f5',

            // Text colors
            '--text-primary': '#24292e',
            '--text-secondary': '#005cc5',
            '--text-muted': '#6a737d',
            '--text-disabled': '#8b949e',
            '--text-inverse': '#ffffff',
            '--text-link': '#005cc5',
            '--text-link-hover': '#0366d6',

            // Border colors
            '--border-color': '#e1e4e8',
            '--border-color-light': '#f1f1f1',
            '--border-color-dark': '#d1d9e0',
            '--border-radius': '4px',
            '--border-radius-sm': '2px',
            '--border-width': '1px',

            // Scratch colors (same as dark theme)
            '--scratch-red': '#ff0000',
            '--scratch-orange': '#ff7f00',
            '--scratch-yellow': '#ffc107',
            '--scratch-green': '#4caf50',
            '--scratch-light-green': '#8bc34a',
            '--scratch-blue': '#2196f3',
            '--scratch-light-blue': '#64b5f6',
            '--scratch-purple': '#9c27b0',
            '--scratch-pink': '#e91e63',

            // UI colors
            '--color-primary': '#005cc5',
            '--color-primary-hover': '#0366d6',
            '--color-primary-active': '#0045a3',
            '--color-secondary': '#005cc5',
            '--color-success': '#22863a',
            '--color-warning': '#b08800',
            '--color-danger': '#cb2431',
            '--color-info': '#005cc5',

            // Button colors
            '--btn-bg-primary': '#005cc5',
            '--btn-bg-primary-hover': '#0366d6',
            '--btn-bg-primary-active': '#0045a3',
            '--btn-bg-secondary': '#f1f1f1',
            '--btn-bg-secondary-hover': '#e1e4e8',
            '--btn-bg-secondary-active': '#d1d9e0',
            '--btn-bg-success': '#22863a',
            '--btn-bg-success-hover': '#28a745',
            '--btn-bg-success-active': '#1b6f37',
            '--btn-bg-danger': '#cb2431',
            '--btn-bg-danger-hover': '#d73a49',
            '--btn-bg-danger-active': '#a01d2e',

            // Status colors
            '--status-bg-error': 'rgba(203, 36, 49, 0.1)',
            '--status-bg-warning': 'rgba(240, 173, 78, 0.1)',
            '--status-bg-success': 'rgba(34, 134, 58, 0.1)',
            '--status-text-error': '#cb2431',
            '--status-text-warning': '#b08800',
            '--status-text-success': '#22863a',

            // Selection
            '--selection-bg': 'rgba(0, 92, 197, 0.3)',
            '--selection-text': '#ffffff',

            // Cursor
            '--cursor-color': '#24292e',

            // Shadows
            '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
            '--shadow-md': '0 2px 4px rgba(0, 0, 0, 0.1)',
            '--shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.1)',

            // Scrollbar
            '--scrollbar-width': '10px',
            '--scrollbar-thumb': '#c1c1c1',
            '--scrollbar-track': '#f5f5f5',
            '--scrollbar-thumb-hover': '#a1a1a1',

            // Notification
            '--notification-bg-info': '#ffffff',
            '--notification-bg-success': '#d4edda',
            '--notification-bg-warning': '#fff3cd',
            '--notification-bg-error': '#f8d7da',
            '--notification-text-info': '#24292e',
            '--notification-text-success': '#155724',
            '--notification-text-warning': '#856404',
            '--notification-text-error': '#721c24',

            // Modal
            '--modal-bg': '#ffffff',
            '--modal-border': '#e1e4e8',
            '--modal-overlay': 'rgba(0, 0, 0, 0.5)',

            // Tooltip
            '--tooltip-bg': '#24292e',
            '--tooltip-text': '#ffffff',
            '--tooltip-border': '#e1e4e8',

            // Input
            '--input-bg': '#ffffff',
            '--input-border': '#e1e4e8',
            '--input-text': '#24292e',
            '--input-placeholder': '#8b949e',
            '--input-focus-border': '#005cc5',
            '--input-error-border': '#cb2431',

            // Preview
            '--preview-bg': '#ffffff',
            '--preview-border': '#e1e4e8',

            // Minimap
            '--minimap-width': '100px',
            '--minimap-bg': '#f5f5f5',
            '--minimap-code-bg': '#ffffff',
            '--minimap-selection': '#005cc5',

            // Debug
            '--debug-bg': '#ffffff',
            '--debug-text': '#24292e',
            '--debug-border': '#e1e4e8',
            '--debug-error': '#cb2431',
            '--debug-warning': '#b08800',
            '--debug-log': '#005cc5'
        };
    }

    // Get high contrast theme variables
    getHighContrastTheme() {
        return {
            // Background colors
            '--bg-primary': '#000000',
            '--bg-secondary': '#1a1a1a',
            '--bg-tertiary': '#333333',
            '--bg-hover': '#262626',
            '--bg-active': '#404040',
            '--bg-input': '#000000',
            '--bg-input-hover': '#262626',
            '--bg-panel': '#1a1a1a',
            '--bg-toolbar': '#000000',
            '--bg-statusbar': '#1a1a1a',
            '--bg-modal': '#000000',
            '--bg-code': '#000000',

            // Text colors
            '--text-primary': '#ffffff',
            '--text-secondary': '#ffff00',
            '--text-muted': '#00ff00',
            '--text-disabled': '#808080',
            '--text-inverse': '#000000',
            '--text-link': '#00ffff',
            '--text-link-hover': '#80ffff',

            // Border colors
            '--border-color': '#ffff00',
            '--border-color-light': '#ffff00',
            '--border-color-dark': '#ffffff',
            '--border-radius': '4px',
            '--border-radius-sm': '2px',
            '--border-width': '2px',

            // Scratch colors
            '--scratch-red': '#ff0000',
            '--scratch-orange': '#ff7f00',
            '--scratch-yellow': '#ffff00',
            '--scratch-green': '#00ff00',
            '--scratch-light-green': '#00ff80',
            '--scratch-blue': '#0078ff',
            '--scratch-light-blue': '#80b8ff',
            '--scratch-purple': '#ff00ff',
            '--scratch-pink': '#ff0080',

            // UI colors
            '--color-primary': '#00ffff',
            '--color-primary-hover': '#80ffff',
            '--color-primary-active': '#008080',
            '--color-secondary': '#ffff00',
            '--color-success': '#00ff00',
            '--color-warning': '#ffff00',
            '--color-danger': '#ff0000',
            '--color-info': '#00ffff',

            // Button colors
            '--btn-bg-primary': '#008080',
            '--btn-bg-primary-hover': '#00a0a0',
            '--btn-bg-primary-active': '#006060',
            '--btn-bg-secondary': '#404040',
            '--btn-bg-secondary-hover': '#606060',
            '--btn-bg-secondary-active': '#202020',
            '--btn-bg-success': '#008000',
            '--btn-bg-success-hover': '#00a000',
            '--btn-bg-success-active': '#006000',
            '--btn-bg-danger': '#800000',
            '--btn-bg-danger-hover': '#a00000',
            '--btn-bg-danger-active': '#600000',

            // Status colors
            '--status-bg-error': 'rgba(255, 0, 0, 0.4)',
            '--status-bg-warning': 'rgba(255, 255, 0, 0.4)',
            '--status-bg-success': 'rgba(0, 255, 0, 0.4)',
            '--status-text-error': '#ff0000',
            '--status-text-warning': '#ffff00',
            '--status-text-success': '#00ff00',

            // Selection
            '--selection-bg': 'rgba(0, 255, 255, 0.5)',
            '--selection-text': '#000000',

            // Cursor
            '--cursor-color': '#ffffff',

            // Shadows
            '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.5)',
            '--shadow-md': '0 4px 8px rgba(0, 0, 0, 0.5)',
            '--shadow-lg': '0 8px 16px rgba(0, 0, 0, 0.5)',

            // Scrollbar
            '--scrollbar-width': '12px',
            '--scrollbar-thumb': '#ffff00',
            '--scrollbar-track': '#000000',
            '--scrollbar-thumb-hover': '#ffff80',

            // Notification
            '--notification-bg-info': '#000000',
            '--notification-bg-success': '#004000',
            '--notification-bg-warning': '#404000',
            '--notification-bg-error': '#400000',
            '--notification-text-info': '#ffffff',
            '--notification-text-success': '#00ff00',
            '--notification-text-warning': '#ffff00',
            '--notification-text-error': '#ff0000',

            // Modal
            '--modal-bg': '#000000',
            '--modal-border': '#ffff00',
            '--modal-overlay': 'rgba(0, 0, 0, 0.8)',

            // Tooltip
            '--tooltip-bg': '#000000',
            '--tooltip-text': '#ffffff',
            '--tooltip-border': '#ffff00',

            // Input
            '--input-bg': '#000000',
            '--input-border': '#ffff00',
            '--input-text': '#ffffff',
            '--input-placeholder': '#808080',
            '--input-focus-border': '#00ffff',
            '--input-error-border': '#ff0000',

            // Preview
            '--preview-bg': '#000000',
            '--preview-border': '#ffff00',

            // Minimap
            '--minimap-width': '100px',
            '--minimap-bg': '#1a1a1a',
            '--minimap-code-bg': '#000000',
            '--minimap-selection': '#00ffff',

            // Debug
            '--debug-bg': '#000000',
            '--debug-text': '#ffffff',
            '--debug-border': '#ffff00',
            '--debug-error': '#ff0000',
            '--debug-warning': '#ffff00',
            '--debug-log': '#00ffff',

            // Breakpoint
            '--breakpoint-bg': 'rgba(255, 0, 0, 0.5)',
            '--breakpoint-border': '#ff0000',

            // Watch expression
            '--watch-bg': 'rgba(0, 255, 0, 0.3)',
            '--watch-border': '#00ff00',
            '--watch-text': '#00ff00'
        };
    }

    // Set theme
    setTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme "${themeName}" not found, using default`);
            themeName = 'dark';
        }

        this.currentTheme = themeName;
        const theme = this.themes[themeName];

        // Apply theme variables
        const root = document.documentElement;
        for (const [key, value] of Object.entries(theme)) {
            root.style.setProperty(key, value);
        }

        // Update CodeMirror theme
        this.updateCodeMirrorTheme();

        // Save theme preference
        localStorage.setItem('vibe-ide-theme', themeName);

        // Update UI
        this.updateUI();
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Get theme variables
    getThemeVariables(themeName) {
        return this.themes[themeName || this.currentTheme];
    }

    // Update CodeMirror theme
    updateCodeMirrorTheme() {
        if (typeof CodeMirror !== 'undefined') {
            const editors = document.querySelectorAll('.CodeMirror');
            editors.forEach(editor => {
                const cm = editor.CodeMirror;
                if (cm) {
                    // Set theme based on current theme
                    switch (this.currentTheme) {
                        case 'dark':
                            cm.setOption('theme', 'vibe-dark');
                            break;
                        case 'light':
                            cm.setOption('theme', 'vibe-light');
                            break;
                        case 'high-contrast':
                            cm.setOption('theme', 'vibe-high-contrast');
                            break;
                        default:
                            cm.setOption('theme', 'vibe-dark');
                    }
                }
            });
        }
    }

    // Toggle theme
    toggleTheme() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }

    // Update UI for theme change
    updateUI() {
        // Update body class
        document.body.className = `theme-${this.currentTheme}`;

        // Update editor background
        const editor = document.getElementById('codeEditor');
        if (editor) {
            editor.style.background = getComputedStyle(document.documentElement)
                .getPropertyValue('--bg-code');
        }
    }

    // Get all available themes
    getAvailableThemes() {
        return Object.keys(this.themes);
    }

    // Add custom theme
    addTheme(name, variables) {
        this.themes[name] = variables;
    }

    // Remove theme
    removeTheme(name) {
        if (name !== 'dark' && name !== 'light' && name !== 'high-contrast') {
            delete this.themes[name];
            if (this.currentTheme === name) {
                this.setTheme('dark');
            }
        }
    }
}

// Create theme manager instance
const themeManager = new ThemeManager();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            themeManager.init();
        });
    } else {
        themeManager.init();
    }
    
    window.ThemeManager = themeManager;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = themeManager;
}
