// Notifications Module
// Handles toast notifications for the application

class Notifications {
    constructor() {
        this.container = null;
        this.queue = [];
        this.activeNotifications = new Set();
        this.initialized = false;
        this.defaultDuration = 3000;
        this.maxVisible = 5;
    }

    // Initialize notifications
    init() {
        if (this.initialized) return;

        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        document.body.appendChild(this.container);

        this.initialized = true;
    }

    // Show a notification
    show(message, options = {}) {
        const {
            type = 'info',
            duration = this.defaultDuration,
            title = '',
            icon = '',
            action = null,
            actionText = '',
            onClick = null,
            onClose = null,
            id = null
        } = options;

        const notification = {
            id: id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            message,
            type,
            duration,
            title,
            icon,
            action,
            actionText,
            onClick,
            onClose
        };

        // Add to queue
        this.queue.push(notification);

        // Process queue
        this.processQueue();

        return notification.id;
    }

    // Process the notification queue
    processQueue() {
        if (!this.initialized) {
            this.init();
        }

        while (this.queue.length > 0 && this.activeNotifications.size < this.maxVisible) {
            const notification = this.queue.shift();
            this.displayNotification(notification);
        }
    }

    // Display a notification
    displayNotification(notification) {
        const notifElement = document.createElement('div');
        notifElement.className = `notification notification-${notification.type}`;
        notifElement.dataset.id = notification.id;

        // Icon
        if (notification.icon) {
            const iconElement = document.createElement('i');
            iconElement.className = notification.icon;
            notifElement.appendChild(iconElement);
        }

        // Content
        const contentElement = document.createElement('div');
        contentElement.className = 'notification-content';

        if (notification.title) {
            const titleElement = document.createElement('div');
            titleElement.className = 'notification-title';
            titleElement.textContent = notification.title;
            contentElement.appendChild(titleElement);
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        messageElement.textContent = notification.message;
        contentElement.appendChild(messageElement);

        notifElement.appendChild(contentElement);

        // Action button
        if (notification.action && notification.actionText) {
            const actionElement = document.createElement('button');
            actionElement.className = 'notification-action';
            actionElement.textContent = notification.actionText;
            actionElement.addEventListener('click', (e) => {
                e.stopPropagation();
                notification.action();
                this.dismiss(notification.id);
            });
            notifElement.appendChild(actionElement);
        }

        // Close button
        const closeElement = document.createElement('button');
        closeElement.className = 'notification-close';
        closeElement.innerHTML = '&times;';
        closeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dismiss(notification.id);
        });
        notifElement.appendChild(closeElement);

        // Click handler
        if (notification.onClick) {
            notifElement.addEventListener('click', () => {
                notification.onClick();
                this.dismiss(notification.id);
            });
        }

        // Add to container
        this.container.appendChild(notifElement);
        this.activeNotifications.add(notification.id);

        // Auto-dismiss if duration > 0
        if (notification.duration > 0) {
            setTimeout(() => {
                this.dismiss(notification.id);
            }, notification.duration);
        }

        // Animation
        setTimeout(() => {
            notifElement.classList.add('notification-show');
        }, 10);
    }

    // Dismiss a notification
    dismiss(id) {
        const notifElement = this.container.querySelector(`.notification[data-id="${id}"]`);
        if (notifElement) {
            notifElement.classList.remove('notification-show');
            notifElement.classList.add('notification-hide');

            setTimeout(() => {
                notifElement.remove();
                this.activeNotifications.delete(id);
                this.processQueue();
            }, 300);
        }
    }

    // Dismiss all notifications
    dismissAll() {
        const allNotifications = this.container.querySelectorAll('.notification');
        allNotifications.forEach(notif => {
            notif.classList.remove('notification-show');
            notif.classList.add('notification-hide');
        });

        setTimeout(() => {
            this.container.innerHTML = '';
            this.activeNotifications.clear();
            this.queue = [];
        }, 300);
    }

    // Update a notification
    update(id, newOptions) {
        const notifElement = this.container.querySelector(`.notification[data-id="${id}"]`);
        if (notifElement) {
            const notification = this.queue.find(n => n.id === id) || 
                                Array.from(this.activeNotifications).find(id => id === id);
            
            if (notification) {
                Object.assign(notification, newOptions);
                
                // Update message
                const messageElement = notifElement.querySelector('.notification-message');
                if (messageElement && newOptions.message) {
                    messageElement.textContent = newOptions.message;
                }
                
                // Update type (class)
                if (newOptions.type) {
                    notifElement.className = `notification notification-${newOptions.type}`;
                }
            }
        }
    }

    // Show success notification
    success(message, options = {}) {
        return this.show(message, { type: 'success', icon: 'fa-check-circle', ...options });
    }

    // Show error notification
    error(message, options = {}) {
        return this.show(message, { type: 'error', icon: 'fa-exclamation-circle', ...options });
    }

    // Show warning notification
    warning(message, options = {}) {
        return this.show(message, { type: 'warning', icon: 'fa-exclamation-triangle', ...options });
    }

    // Show info notification
    info(message, options = {}) {
        return this.show(message, { type: 'info', icon: 'fa-info-circle', ...options });
    }

    // Show loading notification (persistent until dismissed)
    loading(message, options = {}) {
        return this.show(message, { 
            type: 'loading', 
            icon: 'fa-spinner fa-spin',
            duration: 0, // Never auto-dismiss
            ...options 
        });
    }

    // Hide loading notification
    hideLoading(id) {
        this.dismiss(id);
    }

    // Set default duration
    setDefaultDuration(duration) {
        this.defaultDuration = duration;
    }

    // Set max visible notifications
    setMaxVisible(max) {
        this.maxVisible = max;
    }

    // Get all active notification IDs
    getActiveNotifications() {
        return Array.from(this.activeNotifications);
    }

    // Get notification queue
    getQueue() {
        return [...this.queue];
    }

    // Clear all
    clear() {
        this.dismissAll();
        this.queue = [];
    }

    // Destroy notifications
    destroy() {
        this.clear();
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        this.initialized = false;
    }
}

// Create notifications instance
const notifications = new Notifications();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            notifications.init();
        });
    } else {
        notifications.init();
    }
    
    window.Notifications = notifications;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = notifications;
}
