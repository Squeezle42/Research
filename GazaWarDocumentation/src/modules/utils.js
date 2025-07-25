/**
 * Utility Functions and Classes
 * Gaza War Documentation Website
 * 
 * Common utilities, helpers, and shared functionality
 * 
 * @author Gaza War Documentation Team
 * @version 1.0.0
 */

/**
 * Event Bus for inter-module communication
 */
export class EventBus {
    constructor() {
        this.events = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {...any} args - Arguments to pass to callbacks
     */
    emit(event, ...args) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event callback for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Subscribe to an event only once
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    once(event, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

/**
 * HTTP Client for API requests
 */
export class HttpClient {
    constructor(baseURL = '', options = {}) {
        this.baseURL = baseURL;
        this.defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };
    }

    /**
     * Make a GET request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    async get(url, options = {}) {
        return this.request(url, { method: 'GET', ...options });
    }

    /**
     * Make a POST request
     * @param {string} url - Request URL
     * @param {Object} data - Request body data
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    async post(url, data, options = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    }

    /**
     * Make a generic request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    async request(url, options = {}) {
        const fullURL = this.baseURL + url;
        const requestOptions = {
            ...this.defaultOptions,
            ...options,
            headers: {
                ...this.defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(fullURL, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('HTTP request failed:', error);
            throw error;
        }
    }
}

/**
 * Local Storage Manager
 */
export class StorageManager {
    /**
     * Set an item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    /**
     * Get an item from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Stored value or default
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove an item from localStorage
     * @param {string} key - Storage key
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
        }
    }

    /**
     * Clear all items from localStorage
     */
    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }
}

/**
 * Date utility functions
 */
export class DateUtils {
    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type ('short', 'long', 'iso')
     * @returns {string} Formatted date string
     */
    static format(date, format = 'short') {
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }

        switch (format) {
            case 'short':
                return dateObj.toLocaleDateString();
            case 'long':
                return dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'iso':
                return dateObj.toISOString().split('T')[0];
            case 'datetime':
                return dateObj.toLocaleString();
            default:
                return dateObj.toLocaleDateString();
        }
    }

    /**
     * Check if a date is within a range
     * @param {Date|string} date - Date to check
     * @param {Date|string} startDate - Range start
     * @param {Date|string} endDate - Range end
     * @returns {boolean} Whether date is in range
     */
    static isInRange(date, startDate, endDate) {
        const checkDate = new Date(date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return checkDate >= start && checkDate <= end;
    }

    /**
     * Get relative time string (e.g., "2 hours ago")
     * @param {Date|string} date - Date to compare
     * @returns {string} Relative time string
     */
    static getRelativeTime(date) {
        const now = new Date();
        const dateObj = new Date(date);
        const diffMs = now - dateObj;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        return this.format(date, 'short');
    }
}

/**
 * DOM utility functions
 */
export class DOMUtils {
    /**
     * Create an element with attributes and content
     * @param {string} tag - Element tag name
     * @param {Object} attributes - Element attributes
     * @param {string|Node[]} content - Element content
     * @returns {HTMLElement} Created element
     */
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Set content
        if (typeof content === 'string') {
            element.textContent = content;
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
        } else if (content instanceof Node) {
            element.appendChild(content);
        }
        
        return element;
    }

    /**
     * Add event listener with cleanup tracking
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     * @returns {Function} Cleanup function
     */
    static addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    }

    /**
     * Show element with animation
     * @param {Element} element - Element to show
     * @param {string} animation - Animation type
     */
    static show(element, animation = 'fade') {
        element.style.display = 'block';
        
        if (animation === 'fade') {
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.3s ease-in-out';
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        }
    }

    /**
     * Hide element with animation
     * @param {Element} element - Element to hide
     * @param {string} animation - Animation type
     */
    static hide(element, animation = 'fade') {
        if (animation === 'fade') {
            element.style.transition = 'opacity 0.3s ease-in-out';
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.style.display = 'none';
            }, 300);
        } else {
            element.style.display = 'none';
        }
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        
        return function() {
            const args = arguments;
            const context = this;
            
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} Whether email is valid
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} Whether URL is valid
     */
    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate date string
     * @param {string} dateString - Date string to validate
     * @returns {boolean} Whether date is valid
     */
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    /**
     * Sanitize HTML string
     * @param {string} html - HTML string to sanitize
     * @returns {string} Sanitized HTML
     */
    static sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    }
}

/**
 * Geographic utilities
 */
export class GeoUtils {
    /**
     * Calculate distance between two coordinates (Haversine formula)
     * @param {number} lat1 - First latitude
     * @param {number} lon1 - First longitude
     * @param {number} lat2 - Second latitude
     * @param {number} lon2 - Second longitude
     * @returns {number} Distance in kilometers
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees - Degrees to convert
     * @returns {number} Radians
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Check if coordinates are within Gaza bounds
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {boolean} Whether coordinates are in Gaza
     */
    static isInGaza(lat, lon) {
        // Gaza Strip approximate bounds
        const gazaBounds = {
            north: 31.59,
            south: 31.22,
            east: 34.57,
            west: 34.22
        };
        
        return lat >= gazaBounds.south && lat <= gazaBounds.north &&
               lon >= gazaBounds.west && lon <= gazaBounds.east;
    }
}

/**
 * Image loading utilities
 */
export class ImageUtils {
    /**
     * Load image with promise
     * @param {string} src - Image source URL
     * @returns {Promise<HTMLImageElement>} Promise that resolves with loaded image
     */
    static loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Create placeholder image
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {string} text - Placeholder text
     * @returns {string} Data URL for placeholder image
     */
    static createPlaceholder(width, height, text = 'Loading...') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        // Text
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        
        return canvas.toDataURL();
    }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceUtils {
    static marks = new Map();

    /**
     * Start performance measurement
     * @param {string} name - Measurement name
     */
    static start(name) {
        this.marks.set(name, performance.now());
    }

    /**
     * End performance measurement
     * @param {string} name - Measurement name
     * @returns {number} Duration in milliseconds
     */
    static end(name) {
        const startTime = this.marks.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.marks.delete(name);
            console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
            return duration;
        }
        return 0;
    }

    /**
     * Measure function execution time
     * @param {Function} func - Function to measure
     * @param {string} name - Measurement name
     * @returns {any} Function result
     */
    static async measure(func, name) {
        this.start(name);
        try {
            const result = await func();
            this.end(name);
            return result;
        } catch (error) {
            this.end(name);
            throw error;
        }
    }
}

/**
 * Simple Logger class for development
 */
export class Logger {
    constructor(module = 'App') {
        this.module = module;
    }

    info(message, ...args) {
        console.log(`[${this.module}] INFO:`, message, ...args);
    }

    warn(message, ...args) {
        console.warn(`[${this.module}] WARN:`, message, ...args);
    }

    error(message, ...args) {
        console.error(`[${this.module}] ERROR:`, message, ...args);
    }

    debug(message, ...args) {
        console.debug(`[${this.module}] DEBUG:`, message, ...args);
    }
}

// Export all utilities as default
export default {
    EventBus,
    HttpClient,
    StorageManager,
    DateUtils,
    DOMUtils,
    ValidationUtils,
    GeoUtils,
    ImageUtils,
    PerformanceUtils,
    Logger
};
