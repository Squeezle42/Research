/**
 * Main JavaScript Entry Point
 * Gaza War Documentation Website
 * 
 * This file initializes all modules and coordinates the application
 * 
 * @author Gaza War Documentation Team
 * @version 1.0.0
 */

import { Timeline } from './modules/timeline.js';
import { InteractiveMap } from './modules/map.js';
import { NewsIntegration } from './modules/news.js';
import { SatelliteImagery } from './modules/satellite.js';
import { SourcesManager } from './modules/sources.js';
import { EventBus } from './modules/utils.js';

/**
 * Main Application Class
 * Coordinates all modules and manages global state
 */
class GazaWarDocumentation {
    constructor() {
        this.eventBus = new EventBus();
        this.modules = new Map();
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.showLoading = this.showLoading.bind(this);
        this.hideLoading = this.hideLoading.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Gaza War Documentation...');
            
            // Show loading indicator
            this.showLoading();
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize navigation
            this.initializeNavigation();
            
            // Initialize modules
            await this.initializeModules();
            
            // Setup inter-module communication
            this.setupModuleCommunication();
            
            // Hide loading indicator
            this.hideLoading();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('Gaza War Documentation initialized successfully');
            
            // Emit ready event
            this.eventBus.emit('app:ready');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleError(error);
        }
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        const moduleConfigs = [
            {
                name: 'timeline',
                class: Timeline,
                container: '#timeline-container',
                config: {
                    dataSource: 'src/data/events.json',
                    autoPlay: false,
                    showControls: true
                }
            },
            {
                name: 'map',
                class: InteractiveMap,
                container: '#map',
                config: {
                    center: [31.5, 34.5], // Gaza coordinates
                    zoom: 10,
                    layers: ['events', 'infrastructure', 'humanitarian', 'borders']
                }
            },
            {
                name: 'news',
                class: NewsIntegration,
                container: '#news-grid',
                config: {
                    sources: ['bbc', 'reuters', 'ap', 'aljazeera'],
                    updateInterval: 300000, // 5 minutes
                    maxArticles: 12
                }
            },
            {
                name: 'satellite',
                class: SatelliteImagery,
                container: '#satellite-viewer',
                config: {
                    providers: ['nasa', 'esa', 'planet'],
                    defaultLocation: 'gaza-strip',
                    timelapseInterval: 1000
                }
            },
            {
                name: 'sources',
                class: SourcesManager,
                container: '#sources',
                config: {
                    categorize: true,
                    showCredibility: true,
                    verificationLevel: 'high'
                }
            }
        ];

        // Initialize modules sequentially
        for (const moduleConfig of moduleConfigs) {
            try {
                console.log(`Initializing ${moduleConfig.name} module...`);
                
                const ModuleClass = moduleConfig.class;
                const module = new ModuleClass(
                    moduleConfig.container,
                    moduleConfig.config,
                    this.eventBus
                );
                
                await module.init();
                this.modules.set(moduleConfig.name, module);
                
                console.log(`${moduleConfig.name} module initialized successfully`);
                
            } catch (error) {
                console.error(`Failed to initialize ${moduleConfig.name} module:`, error);
                // Continue with other modules
            }
        }
    }

    /**
     * Setup communication between modules
     */
    setupModuleCommunication() {
        // Timeline -> Map synchronization
        this.eventBus.on('timeline:dateChanged', (date) => {
            const mapModule = this.modules.get('map');
            if (mapModule) {
                mapModule.filterByDate(date);
            }
        });

        // Map -> Satellite synchronization
        this.eventBus.on('map:locationSelected', (location) => {
            const satelliteModule = this.modules.get('satellite');
            if (satelliteModule) {
                satelliteModule.showLocation(location);
            }
        });

        // News -> Timeline synchronization
        this.eventBus.on('news:articleSelected', (article) => {
            const timelineModule = this.modules.get('timeline');
            if (timelineModule && article.date) {
                timelineModule.navigateToDate(article.date);
            }
        });

        // Global date filter
        this.eventBus.on('filter:dateRange', (startDate, endDate) => {
            this.modules.forEach((module) => {
                if (typeof module.filterByDateRange === 'function') {
                    module.filterByDateRange(startDate, endDate);
                }
            });
        });
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // Page visibility
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Before unload
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    /**
     * Initialize navigation functionality
     */
    initializeNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav__link');
        
        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
            });
        }
        
        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Close mobile menu
                        if (navMenu) {
                            navMenu.classList.remove('active');
                            navToggle.setAttribute('aria-expanded', 'false');
                        }
                    }
                }
            });
        });
        
        // Back to top button
        this.initializeBackToTop();
    }

    /**
     * Initialize back to top functionality
     */
    initializeBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');
        
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.eventBus.emit('window:resize', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }, 250);
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollY = window.scrollY;
        const backToTopBtn = document.getElementById('back-to-top');
        
        // Show/hide back to top button
        if (backToTopBtn) {
            if (scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
        
        // Update last updated time
        this.updateLastUpdatedTime();
        
        // Emit scroll event for modules
        this.eventBus.emit('window:scroll', scrollY);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Escape key - close modals/menus
        if (e.key === 'Escape') {
            const navMenu = document.getElementById('nav-menu');
            const navToggle = document.querySelector('.nav__toggle');
            
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (navToggle) {
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
        }
        
        // Ctrl/Cmd + shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'h':
                    e.preventDefault();
                    document.querySelector('#overview')?.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 't':
                    e.preventDefault();
                    document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'm':
                    e.preventDefault();
                    document.querySelector('#maps')?.scrollIntoView({ behavior: 'smooth' });
                    break;
            }
        }
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause auto-updates when page is hidden
            this.modules.forEach(module => {
                if (typeof module.pause === 'function') {
                    module.pause();
                }
            });
        } else {
            // Resume auto-updates when page becomes visible
            this.modules.forEach(module => {
                if (typeof module.resume === 'function') {
                    module.resume();
                }
            });
        }
    }

    /**
     * Handle before page unload
     */
    handleBeforeUnload() {
        // Clean up modules
        this.modules.forEach(module => {
            if (typeof module.destroy === 'function') {
                module.destroy();
            }
        });
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleError(e.reason);
        });
    }

    /**
     * Handle application errors
     */
    handleError(error) {
        console.error('Application error:', error);
        
        // Show user-friendly error message
        this.showErrorMessage('An error occurred. Please refresh the page and try again.');
        
        // Report error (in production, send to logging service)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            setTimeout(() => {
                loadingElement.classList.add('hidden');
            }, 500);
        }
    }

    /**
     * Show error message to user
     */
    showErrorMessage(message) {
        // Create or update error message element
        let errorElement = document.getElementById('error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'error-message';
            errorElement.className = 'error-message';
            errorElement.setAttribute('role', 'alert');
            document.body.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    /**
     * Update last updated timestamp
     */
    updateLastUpdatedTime() {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = now.toLocaleString();
        }
    }

    /**
     * Get module instance
     */
    getModule(name) {
        return this.modules.get(name);
    }

    /**
     * Check if application is initialized
     */
    isReady() {
        return this.isInitialized;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.GazaWarApp = new GazaWarDocumentation();
    
    // Initialize the application
    window.GazaWarApp.init().catch(error => {
        console.error('Failed to initialize application:', error);
    });
});

// Export for module use
export default GazaWarDocumentation;
