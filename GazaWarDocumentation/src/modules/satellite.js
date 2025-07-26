/**
 * Satellite Imagery Module
 * Gaza War Documentation Website
 * 
 * Handles satellite imagery display, time-lapse functionality, and before/after comparisons
 * 
 * @author Gaza War Documentation Team
 * @version 1.0.0
 */

import { HttpClient, DateUtils, ImageUtils, PerformanceUtils } from './utils.js';

/**
 * Satellite Imagery class for managing satellite data and visualizations
 */
export class SatelliteImagery {
    /**
     * Initialize Satellite Imagery module
     * @param {string} container - Container selector
     * @param {Object} config - Configuration options
     * @param {EventBus} eventBus - Event bus for communication
     */
    constructor(container, config = {}, eventBus = null) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            throw new Error('Satellite container not found');
        }

        this.config = {
            providers: ['nasa', 'esa', 'planet'],
            defaultLocation: 'gaza-strip',
            timelapseInterval: 1000,
            maxImages: 50,
            imageFormat: 'jpeg',
            resolution: 'medium',
            ...config
        };

        this.eventBus = eventBus;
        this.imageData = new Map();
        this.currentLocation = this.config.defaultLocation;
        this.currentImages = [];
        this.timelapseIndex = 0;
        this.isPlaying = false;
        this.playInterval = null;
        
        // Predefined locations with coordinates
        this.locations = new Map([
            ['gaza-strip', {
                name: 'Gaza Strip',
                bounds: {
                    north: 31.59,
                    south: 31.22,
                    east: 34.57,
                    west: 34.22
                },
                center: [31.4, 34.4],
                description: 'Overview of the entire Gaza Strip'
            }],
            ['gaza-city', {
                name: 'Gaza City',
                bounds: {
                    north: 31.52,
                    south: 31.48,
                    east: 34.48,
                    west: 34.44
                },
                center: [31.5, 34.46],
                description: 'Gaza City metropolitan area'
            }],
            ['rafah', {
                name: 'Rafah',
                bounds: {
                    north: 31.32,
                    south: 31.28,
                    east: 34.26,
                    west: 34.22
                },
                center: [31.3, 34.24],
                description: 'Rafah border crossing area'
            }],
            ['khan-younis', {
                name: 'Khan Younis',
                bounds: {
                    north: 31.36,
                    south: 31.32,
                    east: 34.32,
                    west: 34.28
                },
                center: [31.34, 34.3],
                description: 'Khan Younis urban area'
            }]
        ]);
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadImageData = this.loadImageData.bind(this);
        this.playTimelapse = this.playTimelapse.bind(this);
        this.pauseTimelapse = this.pauseTimelapse.bind(this);
        this.updateTimelapse = this.updateTimelapse.bind(this);
    }

    /**
     * Initialize the satellite imagery module
     */
    async init() {
        try {
            console.log('Initializing Satellite Imagery module...');
            PerformanceUtils.start('satellite-init');

            // Setup location selector
            this.setupLocationSelector();

            // Setup controls
            this.setupControls();

            // Load initial data
            await this.loadImageData(this.currentLocation);

            // Setup event listeners
            this.setupEventListeners();

            // Initialize viewer
            this.initializeViewer();

            PerformanceUtils.end('satellite-init');
            console.log('Satellite Imagery module initialized successfully');

        } catch (error) {
            console.error('Failed to initialize Satellite Imagery:', error);
            this.showErrorState();
        }
    }

    /**
     * Setup location selector
     */
    setupLocationSelector() {
        const locationSelect = document.getElementById('satellite-location');
        
        if (locationSelect) {
            // Clear existing options
            locationSelect.innerHTML = '';
            
            // Add location options
            this.locations.forEach((location, key) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = location.name;
                option.selected = key === this.currentLocation;
                locationSelect.appendChild(option);
            });

            // Add change handler
            locationSelect.addEventListener('change', (e) => {
                this.changeLocation(e.target.value);
            });
        }
    }

    /**
     * Setup satellite controls
     */
    setupControls() {
        // Date inputs
        const startDateInput = document.getElementById('satellite-start');
        const endDateInput = document.getElementById('satellite-end');
        
        if (startDateInput && endDateInput) {
            // Set default date range (last 30 days)
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            
            startDateInput.value = DateUtils.format(startDate, 'iso');
            endDateInput.value = DateUtils.format(endDate, 'iso');
        }

        // Load data button
        const loadButton = document.getElementById('load-satellite-data');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                this.loadImageryForDateRange();
            });
        }

        // Timelapse controls
        const playButton = document.getElementById('satellite-play');
        const pauseButton = document.getElementById('satellite-pause');
        const progressSlider = document.getElementById('satellite-progress');

        if (playButton) {
            playButton.addEventListener('click', this.playTimelapse);
        }

        if (pauseButton) {
            pauseButton.addEventListener('click', this.pauseTimelapse);
        }

        if (progressSlider) {
            progressSlider.addEventListener('input', (e) => {
                this.goToTimelapseFrame(parseInt(e.target.value));
            });
        }
    }

    /**
     * Load satellite imagery data
     */
    async loadImageData(location, startDate = null, endDate = null) {
        try {
            this.showLoadingState();

            // In a real implementation, this would call satellite imagery APIs
            // For demonstration, we'll use mock data
            const imageData = await this.fetchSatelliteData(location, startDate, endDate);
            
            this.imageData.set(location, imageData);
            this.currentImages = imageData;
            
            this.updateViewer();
            this.hideLoadingState();

        } catch (error) {
            console.error('Failed to load satellite imagery:', error);
            this.hideLoadingState();
            this.showErrorState();
        }
    }

    /**
     * Fetch satellite data (mock implementation)
     */
    async fetchSatelliteData(location, startDate = null, endDate = null) {
        // Mock satellite imagery data
        // In production, this would integrate with:
        // - NASA Earth API
        // - ESA Sentinel Hub
        // - Planet Labs API
        // - Maxar/DigitalGlobe API

        const locationInfo = this.locations.get(location);
        if (!locationInfo) {
            throw new Error('Unknown location');
        }

        // Generate mock imagery data
        const images = [];
        const baseDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const finalDate = endDate ? new Date(endDate) : new Date();
        
        // Generate images every 3-7 days
        let currentDate = new Date(baseDate);
        let imageIndex = 1;

        while (currentDate <= finalDate && images.length < this.config.maxImages) {
            const daysToAdd = 3 + Math.floor(Math.random() * 4); // 3-7 days
            
            images.push({
                id: `${location}-${currentDate.toISOString().split('T')[0]}`,
                date: new Date(currentDate),
                location: location,
                locationInfo: locationInfo,
                url: this.generateMockImageUrl(location, currentDate, imageIndex),
                thumbnailUrl: this.generateMockThumbnailUrl(location, currentDate, imageIndex),
                provider: this.config.providers[imageIndex % this.config.providers.length],
                resolution: this.config.resolution,
                cloudCover: Math.random() * 30, // 0-30% cloud cover
                coordinates: locationInfo.bounds,
                metadata: {
                    satellite: `Satellite-${Math.floor(Math.random() * 3) + 1}`,
                    sensor: 'RGB',
                    processingLevel: 'L2A',
                    downloadSize: `${(Math.random() * 10 + 5).toFixed(1)}MB`
                }
            });

            currentDate.setDate(currentDate.getDate() + daysToAdd);
            imageIndex++;
        }

        return images.sort((a, b) => a.date - b.date);
    }

    /**
     * Generate mock image URL
     */
    generateMockImageUrl(location, date, index) {
        const width = 800;
        const height = 600;
        // Use a simple date format to avoid issues
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const text = `${location}_${dateStr}`;
        const bgColor = ['e3f2fd', 'f3e5f5', 'e8f5e8', 'fff3e0'][index % 4];
        const textColor = ['1976d2', '7b1fa2', '388e3c', 'f57c00'][index % 4];
        
        return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
    }

    /**
     * Generate mock thumbnail URL
     */
    generateMockThumbnailUrl(location, date, index) {
        const width = 200;
        const height = 150;
        const dateStr = date.toISOString().split('T')[0];
        const text = dateStr;
        const bgColor = ['e3f2fd', 'f3e5f5', 'e8f5e8', 'fff3e0'][index % 4];
        
        return `https://via.placeholder.com/${width}x${height}/${bgColor}/666?text=${encodeURIComponent(text)}`;
    }

    /**
     * Initialize viewer components
     */
    initializeViewer() {
        if (this.currentImages.length === 0) {
            this.showNoDataState();
            return;
        }

        this.updateBeforeAfterComparison();
        this.updateTimelapsePlayer();
    }

    /**
     * Update before/after comparison
     */
    updateBeforeAfterComparison() {
        const beforeContainer = document.getElementById('satellite-before');
        const afterContainer = document.getElementById('satellite-after');

        if (!beforeContainer || !afterContainer || this.currentImages.length < 2) {
            return;
        }

        const firstImage = this.currentImages[0];
        const lastImage = this.currentImages[this.currentImages.length - 1];

        // Create before image
        beforeContainer.innerHTML = this.createImageHTML(firstImage, 'Before');

        // Create after image
        afterContainer.innerHTML = this.createImageHTML(lastImage, 'After');
    }

    /**
     * Update timelapse player
     */
    updateTimelapsePlayer() {
        const playerContainer = document.getElementById('satellite-current');
        const progressSlider = document.getElementById('satellite-progress');

        if (!playerContainer || this.currentImages.length === 0) {
            return;
        }

        // Set up progress slider
        if (progressSlider) {
            progressSlider.min = 0;
            progressSlider.max = this.currentImages.length - 1;
            progressSlider.value = this.timelapseIndex;
        }

        // Display current image
        this.updateCurrentImage();
    }

    /**
     * Update current timelapse image
     */
    updateCurrentImage() {
        const playerContainer = document.getElementById('satellite-current');
        
        if (!playerContainer || this.currentImages.length === 0) {
            return;
        }

        const currentImage = this.currentImages[this.timelapseIndex];
        playerContainer.innerHTML = this.createImageHTML(currentImage, 'Current View');
    }

    /**
     * Create HTML for satellite image display
     */
    createImageHTML(imageData, label) {
        return `
            <div class="satellite__image-wrapper">
                <div class="satellite__image-label">
                    <h4>${label}</h4>
                    <p class="satellite__image-date">${DateUtils.format(imageData.date, 'long')}</p>
                </div>
                <div class="satellite__image-container">
                    <img src="${imageData.url}" 
                         alt="Satellite imagery of ${imageData.locationInfo.name} on ${DateUtils.format(imageData.date, 'short')}"
                         class="satellite__image"
                         loading="lazy"
                         onload="this.classList.add('loaded')"
                         onerror="this.parentElement.innerHTML = '<div class=&quot;satellite__error&quot;>Failed to load image</div>'">
                    <div class="satellite__image-overlay">
                        <div class="satellite__image-meta">
                            <span class="satellite__provider">${imageData.provider.toUpperCase()}</span>
                            <span class="satellite__resolution">${imageData.resolution}</span>
                            <span class="satellite__cloud-cover">☁ ${Math.round(imageData.cloudCover)}%</span>
                        </div>
                    </div>
                </div>
                <div class="satellite__image-info">
                    <div class="satellite__metadata">
                        <div class="satellite__metadata-item">
                            <strong>Satellite:</strong> ${imageData.metadata.satellite}
                        </div>
                        <div class="satellite__metadata-item">
                            <strong>Sensor:</strong> ${imageData.metadata.sensor}
                        </div>
                        <div class="satellite__metadata-item">
                            <strong>Processing:</strong> ${imageData.metadata.processingLevel}
                        </div>
                        <div class="satellite__metadata-item">
                            <strong>Size:</strong> ${imageData.metadata.downloadSize}
                        </div>
                    </div>
                    <div class="satellite__actions">
                        <button class="satellite__action-btn" onclick="window.open('${imageData.url}', '_blank')">
                            View Full Size
                        </button>
                        <button class="satellite__action-btn" onclick="this.downloadImage('${imageData.id}')">
                            Download
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard controls for timelapse
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('#satellite-viewer')) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousFrame();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextFrame();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.isPlaying ? this.pauseTimelapse() : this.playTimelapse();
                        break;
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.updateViewer();
        });
    }

    /**
     * Change location
     */
    async changeLocation(location) {
        if (this.locations.has(location)) {
            this.currentLocation = location;
            this.timelapseIndex = 0;
            
            // Load data for new location
            await this.loadImageData(location);
            
            if (this.eventBus) {
                this.eventBus.emit('satellite:locationChanged', {
                    location,
                    locationInfo: this.locations.get(location)
                });
            }
        }
    }

    /**
     * Load imagery for specific date range
     */
    async loadImageryForDateRange() {
        const startDateInput = document.getElementById('satellite-start');
        const endDateInput = document.getElementById('satellite-end');

        if (startDateInput && endDateInput) {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;

            if (startDate && endDate) {
                await this.loadImageData(this.currentLocation, startDate, endDate);
            } else {
                this.showNotification('Please select both start and end dates');
            }
        }
    }

    /**
     * Play timelapse
     */
    playTimelapse() {
        if (this.isPlaying || this.currentImages.length <= 1) return;

        this.isPlaying = true;
        this.playInterval = setInterval(() => {
            if (this.timelapseIndex < this.currentImages.length - 1) {
                this.nextFrame();
            } else {
                // Loop back to beginning
                this.timelapseIndex = 0;
                this.updateTimelapse();
            }
        }, this.config.timelapseInterval);

        this.updatePlaybackControls();
    }

    /**
     * Pause timelapse
     */
    pauseTimelapse() {
        this.isPlaying = false;
        
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }

        this.updatePlaybackControls();
    }

    /**
     * Go to specific timelapse frame
     */
    goToTimelapseFrame(index) {
        if (index >= 0 && index < this.currentImages.length) {
            this.timelapseIndex = index;
            this.updateTimelapse();
        }
    }

    /**
     * Go to next frame
     */
    nextFrame() {
        if (this.timelapseIndex < this.currentImages.length - 1) {
            this.timelapseIndex++;
            this.updateTimelapse();
        }
    }

    /**
     * Go to previous frame
     */
    previousFrame() {
        if (this.timelapseIndex > 0) {
            this.timelapseIndex--;
            this.updateTimelapse();
        }
    }

    /**
     * Update timelapse display
     */
    updateTimelapse() {
        this.updateCurrentImage();
        
        // Update progress slider
        const progressSlider = document.getElementById('satellite-progress');
        if (progressSlider) {
            progressSlider.value = this.timelapseIndex;
        }

        // Emit event
        if (this.eventBus && this.currentImages[this.timelapseIndex]) {
            this.eventBus.emit('satellite:frameChanged', {
                index: this.timelapseIndex,
                image: this.currentImages[this.timelapseIndex],
                total: this.currentImages.length
            });
        }
    }

    /**
     * Update playback control buttons
     */
    updatePlaybackControls() {
        const playButton = document.getElementById('satellite-play');
        const pauseButton = document.getElementById('satellite-pause');

        if (playButton) {
            playButton.disabled = this.isPlaying;
        }

        if (pauseButton) {
            pauseButton.disabled = !this.isPlaying;
        }
    }

    /**
     * Update viewer layout
     */
    updateViewer() {
        this.updateBeforeAfterComparison();
        this.updateTimelapsePlayer();
    }

    /**
     * Show specific location
     */
    showLocation(location) {
        if (location.coordinates) {
            const locationKey = this.findLocationByCoordinates(location.coordinates);
            if (locationKey) {
                this.changeLocation(locationKey);
            }
        }
    }

    /**
     * Find location by coordinates
     */
    findLocationByCoordinates(coordinates) {
        const [lat, lng] = coordinates;
        
        for (const [key, location] of this.locations) {
            const bounds = location.bounds;
            if (lat >= bounds.south && lat <= bounds.north &&
                lng >= bounds.west && lng <= bounds.east) {
                return key;
            }
        }
        
        return null;
    }

    /**
     * Download image
     */
    downloadImage(imageId) {
        const image = this.currentImages.find(img => img.id === imageId);
        if (image) {
            // Create download link
            const link = document.createElement('a');
            link.href = image.url;
            link.download = `satellite-${image.location}-${DateUtils.format(image.date, 'iso')}.jpg`;
            link.click();
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const viewer = document.getElementById('satellite-viewer');
        if (viewer) {
            viewer.classList.add('loading');
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const viewer = document.getElementById('satellite-viewer');
        if (viewer) {
            viewer.classList.remove('loading');
        }
    }

    /**
     * Show error state
     */
    showErrorState() {
        const viewer = document.getElementById('satellite-viewer');
        if (viewer) {
            viewer.innerHTML = `
                <div class="satellite__error-state">
                    <h3>Unable to load satellite imagery</h3>
                    <p>Satellite imagery services may be temporarily unavailable.</p>
                    <button onclick="window.GazaWarApp.getModule('satellite').init()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    /**
     * Show no data state
     */
    showNoDataState() {
        const viewer = document.getElementById('satellite-viewer');
        if (viewer) {
            viewer.innerHTML = `
                <div class="satellite__no-data">
                    <h3>No satellite imagery available</h3>
                    <p>Try selecting a different location or date range.</p>
                </div>
            `;
        }
    }

    /**
     * Show notification
     */
    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = 'satellite__notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Get current images
     */
    getCurrentImages() {
        return this.currentImages;
    }

    /**
     * Get current image
     */
    getCurrentImage() {
        return this.currentImages[this.timelapseIndex];
    }

    /**
     * Export timelapse as GIF (placeholder)
     */
    exportAsGif() {
        console.log('GIF export functionality would be implemented here');
        this.showNotification('GIF export feature coming soon');
    }

    /**
     * Module cleanup
     */
    destroy() {
        this.pauseTimelapse();
        console.log('Satellite Imagery module destroyed');
    }
}

export default SatelliteImagery;
