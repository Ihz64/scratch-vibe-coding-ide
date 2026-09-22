// Helper Functions Utility
// Collection of utility functions used throughout the application

class Helpers {
    constructor() {
        this.debounceTimers = {};
        this.throttleTimers = {};
    }

    // Debounce function
    debounce(func, wait = 100, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Throttle function
    throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Deep clone an object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        const cloned = {};
        for (const key of Object.keys(obj)) {
            cloned[key] = this.deepClone(obj[key]);
        }
        return cloned;
    }

    // Deep merge objects
    deepMerge(target, source) {
        if (source === null || typeof source !== 'object') {
            return source;
        }
        
        if (Array.isArray(source)) {
            return [...source];
        }
        
        const merged = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                merged[key] = this.deepMerge(merged[key] || {}, source[key]);
            } else {
                merged[key] = source[key];
            }
        }
        return merged;
    }

    // Check if two objects are deeply equal
    deepEqual(a, b) {
        if (a === b) return true;
        
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
            return false;
        }
        
        if (Array.isArray(a) !== Array.isArray(b)) return false;
        
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        for (const key of keysA) {
            if (!keysB.includes(key)) return false;
            if (!this.deepEqual(a[key], b[key])) return false;
        }
        
        return true;
    }

    // Generate a random string
    randomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Generate a random color
    randomColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    }

    // Lighten or darken a color
    adjustColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => 
            ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
        );
    }

    // Convert hex color to RGB
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    // Convert RGB to hex color
    rgbToHex(r, g, b) {
        return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }

    // Clamp a value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Linear interpolation
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    // Map a value from one range to another
    map(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    }

    // Check if value is in range
    inRange(value, min, max) {
        return value >= min && value <= max;
    }

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Format date
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const pad = (num) => num.toString().padStart(2, '0');
        
        const replacements = {
            'YYYY': date.getFullYear(),
            'MM': pad(date.getMonth() + 1),
            'DD': pad(date.getDate()),
            'HH': pad(date.getHours()),
            'mm': pad(date.getMinutes()),
            'ss': pad(date.getSeconds()),
            'SSS': date.getMilliseconds().toString().padStart(3, '0')
        };
        
        return format.replace(/YYYY|MM|DD|HH|mm|ss|SSS/g, match => replacements[match]);
    }

    // Parse query parameters
    parseQueryParams(url = window.location.search) {
        const params = {};
        const query = url.split('?')[1];
        if (!query) return params;
        
        query.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            params[key] = decodeURIComponent(value || '');
        });
        
        return params;
    }

    // String to query parameters
    stringifyQueryParams(params) {
        return '?' + Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
    }

    // Check if object is empty
    isEmpty(obj) {
        if (obj === null || obj === undefined) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        if (typeof obj === 'string') return obj.trim() === '';
        return false;
    }

    // Get object type
    getType(obj) {
        if (obj === null) return 'null';
        if (Array.isArray(obj)) return 'array';
        return typeof obj;
    }

    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Camel case to kebab case
    toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    // Kebab case to camel case
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    // Generate slug from string
    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Truncate string
    truncate(str, length, suffix = '...') {
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    }

    // Escape HTML
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Unescape HTML
    unescapeHtml(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    }

    // Get element offset
    getOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset,
            width: rect.width,
            height: rect.height
        };
    }

    // Check if element is in viewport
    isInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Scroll to element
    scrollToElement(el, behavior = 'smooth', offset = 0) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top,
            behavior
        });
    }

    // Add event listener with cleanup
    addEventListenerWithCleanup(el, event, handler) {
        el.addEventListener(event, handler);
        return () => el.removeEventListener(event, handler);
    }

    // Create element with attributes
    createElement(tag, attributes = {}, children = []) {
        const el = document.createElement(tag);
        
        for (const [key, value] of Object.entries(attributes)) {
            if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.substring(2).toLowerCase(), value);
            } else if (key === 'className') {
                el.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key === 'dataset' && typeof value === 'object') {
                Object.entries(value).forEach(([k, v]) => {
                    el.dataset[k] = v;
                });
            } else {
                el.setAttribute(key, value);
            }
        }
        
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                el.appendChild(child);
            }
        });
        
        return el;
    }

    // Parse CSS size to pixels
    parseCssSize(size) {
        if (typeof size === 'number') return size;
        if (size.endsWith('px')) return parseFloat(size);
        if (size.endsWith('rem')) return parseFloat(size) * parseFloat(getComputedStyle(document.documentElement).fontSize);
        if (size.endsWith('em')) return parseFloat(size) * parseFloat(getComputedStyle(document.body).fontSize);
        if (size.endsWith('%')) return parseFloat(size) * window.innerWidth / 100;
        if (size.endsWith('vh')) return parseFloat(size) * window.innerHeight / 100;
        if (size.endsWith('vw')) return parseFloat(size) * window.innerWidth / 100;
        return parseFloat(size);
    }

    // Sleep function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Retry function with delay
    async retry(fn, retries = 3, delay = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries <= 0) throw error;
            await this.sleep(delay);
            return this.retry(fn, retries - 1, delay);
        }
    }

    // Group array by key
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = typeof key === 'function' ? key(item) : item[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {});
    }

    // Sort array by key
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aValue = typeof key === 'function' ? key(a) : a[key];
            const bValue = typeof key === 'function' ? key(b) : b[key];
            
            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Find in array by key
    findBy(array, key, value) {
        return array.find(item => {
            const itemValue = typeof key === 'function' ? key(item) : item[key];
            return itemValue === value;
        });
    }

    // Filter array by key
    filterBy(array, key, value) {
        return array.filter(item => {
            const itemValue = typeof key === 'function' ? key(item) : item[key];
            return itemValue === value;
        });
    }

    // Remove duplicates from array
    unique(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const keyValue = typeof key === 'function' ? key(item) : item[key];
            if (seen.has(keyValue)) return false;
            seen.add(keyValue);
            return true;
        });
    }

    // Flatten nested arrays
    flatten(array) {
        return array.reduce((result, item) => {
            if (Array.isArray(item)) {
                return result.concat(this.flatten(item));
            }
            return result.concat(item);
        }, []);
    }

    // Chunk array into smaller arrays
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Get first and last elements
    first(array) {
        return array[0];
    }

    last(array) {
        return array[array.length - 1];
    }

    // Remove element from array
    remove(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    }

    // Toggle element in array
    toggle(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        } else {
            array.push(element);
        }
        return array;
    }

    // Check if array contains all elements
    containsAll(array, elements) {
        return elements.every(element => array.includes(element));
    }

    // Check if array contains any element
    containsAny(array, elements) {
        return elements.some(element => array.includes(element));
    }

    // Get difference between arrays
    difference(array1, array2) {
        return array1.filter(item => !array2.includes(item));
    }

    // Get intersection of arrays
    intersection(array1, array2) {
        return array1.filter(item => array2.includes(item));
    }

    // Get union of arrays
    union(array1, array2) {
        return [...new Set([...array1, ...array2])];
    }
}

// Singleton instance
const helpers = new Helpers();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Helpers = helpers;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = helpers;
}
