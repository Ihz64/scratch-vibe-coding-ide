// Context Menu Component
// Handles right-click context menus for the IDE

class ContextMenu {
    constructor() {
        this.element = null;
        this.items = [];
        this.position = { x: 0, y: 0 };
        this.target = null;
        this.onSelect = null;
        this.onClose = null;
        this.initialized = false;
        this.visible = false;
    }

    // Initialize context menu
    init() {
        if (this.initialized) return;

        this.element = document.createElement('div');
        this.element.className = 'context-menu';
        this.element.style.display = 'none';
        
        // Prevent context menu on the menu itself
        this.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (this.visible && !this.element.contains(e.target)) {
                this.hide();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (this.visible && e.key === 'Escape') {
                this.hide();
                e.preventDefault();
            }
        });

        document.body.appendChild(this.element);
        this.initialized = true;
    }

    // Show context menu at position
    show(items, position, target = null, onSelect = null, onClose = null) {
        if (!this.initialized) {
            this.init();
        }

        this.items = items;
        this.position = position;
        this.target = target;
        this.onSelect = onSelect;
        this.onClose = onClose;

        // Clear existing items
        this.element.innerHTML = '';

        // Create menu items
        items.forEach((item, index) => {
            const itemElement = this.createMenuItem(item, index);
            this.element.appendChild(itemElement);
        });

        // Position the menu
        this.updatePosition();

        // Show the menu
        this.element.style.display = 'block';
        this.visible = true;

        // Add show animation
        setTimeout(() => {
            this.element.classList.add('context-menu-show');
        }, 10);

        // Focus for keyboard navigation
        setTimeout(() => {
            const firstItem = this.element.querySelector('.context-menu-item');
            if (firstItem) {
                firstItem.focus();
            }
        }, 50);
    }

    // Create a menu item
    createMenuItem(item, index) {
        const itemElement = document.createElement('div');
        itemElement.className = 'context-menu-item';
        itemElement.dataset.index = index;
        
        // Disabled state
        if (item.disabled) {
            itemElement.classList.add('context-menu-item-disabled');
        }

        // Icon
        if (item.icon) {
            const iconElement = document.createElement('i');
            iconElement.className = `context-menu-icon ${item.icon}`;
            itemElement.appendChild(iconElement);
        }

        // Label
        const labelElement = document.createElement('span');
        labelElement.className = 'context-menu-label';
        labelElement.textContent = item.label;
        itemElement.appendChild(labelElement);

        // Shortcut
        if (item.shortcut) {
            const shortcutElement = document.createElement('span');
            shortcutElement.className = 'context-menu-shortcut';
            shortcutElement.textContent = item.shortcut;
            itemElement.appendChild(shortcutElement);
        }

        // Submenu indicator
        if (item.children && item.children.length > 0) {
            const arrowElement = document.createElement('i');
            arrowElement.className = 'context-menu-arrow fa fa-chevron-right';
            itemElement.appendChild(arrowElement);
            
            // Handle submenu hover
            itemElement.addEventListener('mouseenter', () => {
                this.showSubmenu(itemElement, item.children);
            });
        }

        // Click handler
        if (!item.disabled) {
            itemElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (item.action) {
                    item.action(this.target, e);
                }
                if (this.onSelect) {
                    this.onSelect(item, this.target, e);
                }
                this.hide();
            });

            // Keyboard navigation
            itemElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    itemElement.click();
                }
            });
        }

        // Tab index for keyboard navigation
        itemElement.tabIndex = item.disabled ? -1 : 0;

        return itemElement;
    }

    // Show submenu
    showSubmenu(parentItem, children) {
        // Hide any existing submenu
        this.hideSubmenu();

        // Create submenu
        const submenu = document.createElement('div');
        submenu.className = 'context-submenu';

        children.forEach((child, index) => {
            const childElement = this.createMenuItem(child, index);
            submenu.appendChild(childElement);
        });

        // Position submenu
        const parentRect = parentItem.getBoundingClientRect();
        submenu.style.left = `${parentRect.right}px`;
        submenu.style.top = `${parentRect.top}px`;

        // Add to document
        document.body.appendChild(submenu);
        parentItem.classList.add('context-menu-item-hover');

        // Store reference
        parentItem.dataset.submenu = 'true';
        submenu.dataset.parent = parentItem.dataset.index;

        // Close on mouse leave
        parentItem.addEventListener('mouseleave', () => {
            this.hideSubmenu();
        }, { once: true });
    }

    // Hide submenu
    hideSubmenu() {
        const submenus = document.querySelectorAll('.context-submenu');
        submenus.forEach(submenu => {
            submenu.remove();
        });

        const hoverItems = document.querySelectorAll('.context-menu-item-hover');
        hoverItems.forEach(item => {
            item.classList.remove('context-menu-item-hover');
        });
    }

    // Update menu position
    updatePosition() {
        if (!this.element) return;

        const { x, y } = this.position;
        const elementRect = this.element.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Check if menu would go off screen
        let left = x;
        let top = y;

        if (x + elementRect.width > windowWidth) {
            left = windowWidth - elementRect.width - 10;
        }

        if (y + elementRect.height > windowHeight) {
            top = windowHeight - elementRect.height - 10;
        }

        // Ensure minimum position
        left = Math.max(10, left);
        top = Math.max(10, top);

        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;
    }

    // Hide context menu
    hide() {
        this.hideSubmenu();
        
        if (this.element) {
            this.element.classList.remove('context-menu-show');
            setTimeout(() => {
                this.element.style.display = 'none';
            }, 200);
        }

        this.visible = false;
        
        if (this.onClose) {
            this.onClose();
        }
    }

    // Toggle context menu
    toggle(items, position, target, onSelect, onClose) {
        if (this.visible) {
            this.hide();
        } else {
            this.show(items, position, target, onSelect, onClose);
        }
    }

    // Check if visible
    isVisible() {
        return this.visible;
    }

    // Clear all items
    clear() {
        this.items = [];
        if (this.element) {
            this.element.innerHTML = '';
        }
    }

    // Destroy context menu
    destroy() {
        this.hide();
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        this.initialized = false;
        this.visible = false;
    }

    // Create separator
    createSeparator() {
        const separator = document.createElement('div');
        separator.className = 'context-menu-separator';
        return separator;
    }

    // Helper to create context menu items
    createItems(items) {
        return items;
    }
}

// Common context menu items
const ContextMenuItems = {
    // File operations
    NEW_FILE: {
        label: 'New File',
        icon: 'fa-file',
        action: (target) => {},
        shortcut: 'Ctrl+N'
    },
    NEW_FOLDER: {
        label: 'New Folder',
        icon: 'fa-folder',
        action: (target) => {},
        shortcut: 'Ctrl+Shift+N'
    },
    RENAME: {
        label: 'Rename',
        icon: 'fa-edit',
        action: (target) => {},
        shortcut: 'F2'
    },
    DELETE: {
        label: 'Delete',
        icon: 'fa-trash',
        action: (target) => {},
        shortcut: 'Del'
    },
    DUPLICATE: {
        label: 'Duplicate',
        icon: 'fa-copy',
        action: (target) => {},
        shortcut: 'Ctrl+D'
    },
    COPY: {
        label: 'Copy',
        icon: 'fa-copy',
        action: (target) => {},
        shortcut: 'Ctrl+C'
    },
    PASTE: {
        label: 'Paste',
        icon: 'fa-paste',
        action: (target) => {},
        shortcut: 'Ctrl+V'
    },
    CUT: {
        label: 'Cut',
        icon: 'fa-cut',
        action: (target) => {},
        shortcut: 'Ctrl+X'
    },
    
    // Separator
    SEPARATOR: {
        type: 'separator'
    },
    
    // Project operations
    NEW_PROJECT: {
        label: 'New Project',
        icon: 'fa-plus',
        action: (target) => {},
        shortcut: 'Ctrl+Shift+N'
    },
    OPEN_PROJECT: {
        label: 'Open Project',
        icon: 'fa-folder-open',
        action: (target) => {},
        shortcut: 'Ctrl+O'
    },
    SAVE_PROJECT: {
        label: 'Save Project',
        icon: 'fa-save',
        action: (target) => {},
        shortcut: 'Ctrl+S'
    },
    EXPORT_SB3: {
        label: 'Export .sb3',
        icon: 'fa-file-export',
        action: (target) => {},
        shortcut: 'Ctrl+Shift+S'
    },
    IMPORT_SB3: {
        label: 'Import .sb3',
        icon: 'fa-file-import',
        action: (target) => {},
        shortcut: 'Ctrl+I'
    },
    
    // Editor operations
    UNDO: {
        label: 'Undo',
        icon: 'fa-undo',
        action: (target) => {},
        shortcut: 'Ctrl+Z'
    },
    REDO: {
        label: 'Redo',
        icon: 'fa-redo',
        action: (target) => {},
        shortcut: 'Ctrl+Y'
    },
    FORMAT: {
        label: 'Format Code',
        icon: 'fa-align-left',
        action: (target) => {},
        shortcut: 'Ctrl+Shift+F'
    },
    
    // Debug operations
    DEBUG: {
        label: 'Debug',
        icon: 'fa-bug',
        action: (target) => {},
        shortcut: 'F5'
    },
    RUN: {
        label: 'Run',
        icon: 'fa-play',
        action: (target) => {},
        shortcut: 'F5'
    },
    STOP: {
        label: 'Stop',
        icon: 'fa-stop',
        action: (target) => {},
        shortcut: 'Shift+F5'
    },
    PAUSE: {
        label: 'Pause',
        icon: 'fa-pause',
        action: (target) => {},
        shortcut: 'F6'
    },
    
    // View operations
    ZOOM_IN: {
        label: 'Zoom In',
        icon: 'fa-search-plus',
        action: (target) => {},
        shortcut: 'Ctrl++'
    },
    ZOOM_OUT: {
        label: 'Zoom Out',
        icon: 'fa-search-minus',
        action: (target) => {},
        shortcut: 'Ctrl+-'
    },
    RESET_ZOOM: {
        label: 'Reset Zoom',
        icon: 'fa-search',
        action: (target) => {},
        shortcut: 'Ctrl+0'
    }
};

// Create context menu instance
const contextMenu = new ContextMenu();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            contextMenu.init();
        });
    } else {
        contextMenu.init();
    }
    
    window.ContextMenu = contextMenu;
    window.ContextMenuItems = ContextMenuItems;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { contextMenu, ContextMenuItems };
}
