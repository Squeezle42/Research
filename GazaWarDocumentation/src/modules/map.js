/**
 * Interactive Map Module
 * Gaza War Documentation Website
 * 
 * Map component for displaying geographic data and events
 * 
 * @author Gaza War Documentation Team
 * @version 1.0.0
 */

import { HttpClient, DateUtils, GeoUtils, PerformanceUtils } from './utils.js';

/**
 * Interactive Map class using Leaflet.js
 */
export class InteractiveMap {
    /**
     * Initialize Interactive Map
     * @param {string} container - Container selector
     * @param {Object} config - Configuration options
     * @param {EventBus} eventBus - Event bus for communication
     */
    constructor(container, config = {}, eventBus = null) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            throw new Error('Map container not found');
        }

        this.config = {
            center: [31.5, 34.5], // Gaza coordinates
            zoom: 10,
            minZoom: 8,
            maxZoom: 18,
            layers: ['events', 'infrastructure', 'humanitarian', 'borders'],
            tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors',
            dataSource: 'data/locations.json',
            ...config
        };

        this.eventBus = eventBus;
        this.map = null;
        this.layerGroups = new Map();
        this.markers = new Map();
        this.currentFilter = null;
        this.locationData = [];
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
        this.createMap = this.createMap.bind(this);
        this.setupLayers = this.setupLayers.bind(this);
        this.addMarker = this.addMarker.bind(this);
        this.filterByDate = this.filterByDate.bind(this);
    }

    /**
     * Initialize the map
     */
    async init() {
        try {
            console.log('Initializing Interactive Map module...');
            PerformanceUtils.start('map-init');

            // Load location data
            await this.loadData();

            // Create the map
            this.createMap();

            // Setup map layers
            this.setupLayers();

            // Add location markers
            this.addLocationMarkers();

            // Setup controls
            this.setupControls();

            // Setup event listeners
            this.setupEventListeners();

            PerformanceUtils.end('map-init');
            console.log('Interactive Map module initialized successfully');

        } catch (error) {
            console.error('Failed to initialize Interactive Map:', error);
            throw error;
        }
    }

    /**
     * Load location data
     */
    async loadData() {
        try {
            const httpClient = new HttpClient();
            const data = await httpClient.get(this.config.dataSource);
            
            // Handle nested location data structure
            let locationData = [];
            if (Array.isArray(data)) {
                locationData = data;
            } else if (data && data.locations) {
                // Combine all location types into one array
                locationData = [
                    ...(data.locations.regions || []),
                    ...(data.locations.cities || []),
                    ...(data.locations.military_sites || []),
                    ...(data.locations.infrastructure || []),
                    ...(data.locations.refugee_camps || []),
                    ...(data.locations.crossing_points || []),
                    ...(data.locations.damage_zones || []),
                    ...(data.locations.evacuation_zones || [])
                ];
            } else {
                throw new Error('Location data must be an array or contain locations object');
            }

            this.locationData = locationData.map(location => ({
                ...location,
                date: location.date ? new Date(location.date) : null,
                coordinates: location.coordinates || [location.lat, location.lng]
            }));

            console.log(`Loaded ${this.locationData.length} location markers`);

        } catch (error) {
            console.error('Failed to load location data:', error);
            this.loadFallbackData();
        }
    }

    /**
     * Load fallback location data
     */
    loadFallbackData() {
        this.locationData = [
            {
                id: 'gaza-city',
                name: 'Gaza City',
                lat: 31.5017,
                lng: 34.4668,
                type: 'city',
                description: 'Largest city in Gaza Strip',
                population: 700000,
                status: 'active',
                coordinates: [31.5017, 34.4668]
            },
            {
                id: 'rafah',
                name: 'Rafah',
                lat: 31.3054,
                lng: 34.2501,
                type: 'city',
                description: 'Southern Gaza city near Egyptian border',
                population: 152000,
                status: 'active',
                coordinates: [31.3054, 34.2501]
            },
            {
                id: 'khan-younis',
                name: 'Khan Younis',
                lat: 31.3389,
                lng: 34.3063,
                type: 'city',
                description: 'City in southern Gaza Strip',
                population: 205000,
                status: 'active',
                coordinates: [31.3389, 34.3063]
            },
            {
                id: 'al-shifa-hospital',
                name: 'Al-Shifa Hospital',
                lat: 31.5052,
                lng: 34.4511,
                type: 'humanitarian',
                description: 'Largest hospital in Gaza',
                category: 'medical',
                status: 'critical',
                coordinates: [31.5052, 34.4511]
            }
        ];
    }

    /**
     * Create the Leaflet map
     */
    createMap() {
        // Initialize map
        this.map = L.map(this.container, {
            center: this.config.center,
            zoom: this.config.zoom,
            minZoom: this.config.minZoom,
            maxZoom: this.config.maxZoom,
            zoomControl: true,
            attributionControl: true
        });

        // Add tile layer
        L.tileLayer(this.config.tileLayer, {
            attribution: this.config.attribution,
            maxZoom: this.config.maxZoom
        }).addTo(this.map);

        // Add scale control
        L.control.scale().addTo(this.map);
    }

    /**
     * Setup map layers
     */
    setupLayers() {
        const layerTypes = ['events', 'infrastructure', 'humanitarian', 'borders'];
        
        layerTypes.forEach(layerType => {
            const layerGroup = L.layerGroup();
            this.layerGroups.set(layerType, layerGroup);
            
            // Add to map if enabled in config
            if (this.config.layers.includes(layerType)) {
                layerGroup.addTo(this.map);
            }
        });

        // Create layer control
        this.createLayerControl();
    }

    /**
     * Create layer control UI
     */
    createLayerControl() {
        // This integrates with the HTML controls in the interface
        const layerCheckboxes = document.querySelectorAll('[id^="layer-"]');
        
        layerCheckboxes.forEach(checkbox => {
            const layerName = checkbox.id.replace('layer-', '');
            const layerGroup = this.layerGroups.get(layerName);
            
            if (layerGroup) {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        layerGroup.addTo(this.map);
                    } else {
                        this.map.removeLayer(layerGroup);
                    }
                });
                
                // Set initial state
                checkbox.checked = this.config.layers.includes(layerName);
            }
        });
    }

    /**
     * Add location markers to the map
     */
    addLocationMarkers() {
        this.locationData.forEach(location => {
            this.addMarker(location);
        });
    }

    /**
     * Add a single marker to the map
     */
    addMarker(location) {
        const marker = L.marker(location.coordinates, {
            icon: this.getMarkerIcon(location)
        });

        // Create popup content
        const popupContent = this.createPopupContent(location);
        marker.bindPopup(popupContent);

        // Add click handler
        marker.on('click', () => {
            if (this.eventBus) {
                this.eventBus.emit('map:locationSelected', location);
            }
        });

        // Add to appropriate layer
        const layerType = this.getLocationLayerType(location);
        const layerGroup = this.layerGroups.get(layerType);
        
        if (layerGroup) {
            layerGroup.addLayer(marker);
        }

        // Store marker reference
        this.markers.set(location.id, marker);
    }

    /**
     * Get marker icon based on location type
     */
    getMarkerIcon(location) {
        const iconMap = {
            city: {
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            },
            humanitarian: {
                iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#e74c3c"/>
                        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
                        <path d="M10 10h5v1h-2v4h-1v-4h-2z M11 8h3v1h-3z" fill="#e74c3c"/>
                    </svg>
                `),
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            },
            infrastructure: {
                iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#3498db"/>
                        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
                        <rect x="9" y="9" width="7" height="7" fill="#3498db"/>
                    </svg>
                `),
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            },
            events: {
                iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#f39c12"/>
                        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
                        <circle cx="12.5" cy="12.5" r="3" fill="#f39c12"/>
                    </svg>
                `),
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }
        };

        const iconConfig = iconMap[location.type] || iconMap.city;
        return L.icon(iconConfig);
    }

    /**
     * Get layer type for location
     */
    getLocationLayerType(location) {
        const typeMap = {
            city: 'infrastructure',
            humanitarian: 'humanitarian',
            medical: 'humanitarian',
            school: 'humanitarian',
            military: 'events',
            infrastructure: 'infrastructure',
            event: 'events'
        };

        return typeMap[location.type] || 'events';
    }

    /**
     * Create popup content for location
     */
    createPopupContent(location) {
        const content = document.createElement('div');
        content.className = 'map-popup';
        
        content.innerHTML = `
            <div class="map-popup__header">
                <h3 class="map-popup__title">${location.name}</h3>
                <span class="map-popup__type map-popup__type--${location.type}">${location.type}</span>
            </div>
            <div class="map-popup__content">
                <p class="map-popup__description">${location.description || 'No description available'}</p>
                ${location.population ? `<p class="map-popup__population"><strong>Population:</strong> ${location.population.toLocaleString()}</p>` : ''}
                ${location.status ? `<p class="map-popup__status"><strong>Status:</strong> <span class="status-badge status-badge--${location.status}">${location.status}</span></p>` : ''}
                ${location.date ? `<p class="map-popup__date"><strong>Date:</strong> ${DateUtils.format(location.date, 'long')}</p>` : ''}
                <div class="map-popup__coordinates">
                    <strong>Coordinates:</strong> 
                    ${location.lat && location.lng 
                        ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                        : location.coordinates 
                            ? `${location.coordinates[0].toFixed(4)}, ${location.coordinates[1].toFixed(4)}`
                            : 'Coordinates not available'
                    }
                </div>
            </div>
            <div class="map-popup__actions">
                <button class="map-popup__btn" onclick="navigator.clipboard.writeText('${
                    location.lat && location.lng 
                        ? `${location.lat}, ${location.lng}`
                        : location.coordinates 
                            ? `${location.coordinates[0]}, ${location.coordinates[1]}`
                            : ''
                }')">>
                    Copy Coordinates
                </button>
                ${location.sources ? `
                    <div class="map-popup__sources">
                        <strong>Sources:</strong> ${location.sources.join(', ')}
                    </div>
                ` : ''}
            </div>
        `;

        return content;
    }

    /**
     * Setup map controls
     */
    setupControls() {
        // Date filter controls
        const startDateInput = document.getElementById('maps-start-date');
        const endDateInput = document.getElementById('maps-end-date');
        const applyFiltersBtn = document.getElementById('apply-filters');

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                const startDate = startDateInput ? startDateInput.value : null;
                const endDate = endDateInput ? endDateInput.value : null;
                
                this.filterByDateRange(startDate, endDate);
            });
        }

        // Add custom control for Gaza bounds
        const gazaBoundsControl = L.control({ position: 'topleft' });
        
        gazaBoundsControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-control-gaza-bounds');
            div.innerHTML = '<button title="Zoom to Gaza">🎯</button>';
            
            div.addEventListener('click', () => {
                this.zoomToGaza();
            });
            
            return div;
        };
        
        gazaBoundsControl.addTo(this.map);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Map click handler
        this.map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            if (this.eventBus) {
                this.eventBus.emit('map:clicked', { lat, lng });
            }
        });

        // Map move handler
        this.map.on('moveend', () => {
            const center = this.map.getCenter();
            const zoom = this.map.getZoom();
            
            if (this.eventBus) {
                this.eventBus.emit('map:moved', { center, zoom });
            }
        });

        // Zoom handler
        this.map.on('zoomend', () => {
            const zoom = this.map.getZoom();
            
            if (this.eventBus) {
                this.eventBus.emit('map:zoomed', zoom);
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
        });
    }

    /**
     * Filter markers by date
     */
    filterByDate(date) {
        const targetDate = new Date(date);
        
        this.markers.forEach((marker, locationId) => {
            const location = this.locationData.find(loc => loc.id === locationId);
            
            if (location && location.date) {
                const daysDiff = Math.abs(targetDate - location.date) / (1000 * 60 * 60 * 24);
                
                // Show markers within 7 days of target date
                if (daysDiff <= 7) {
                    marker.setOpacity(1);
                } else {
                    marker.setOpacity(0.3);
                }
            }
        });
    }

    /**
     * Filter markers by date range
     */
    filterByDateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            // Reset all markers to full opacity
            this.markers.forEach(marker => {
                marker.setOpacity(1);
            });
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        this.markers.forEach((marker, locationId) => {
            const location = this.locationData.find(loc => loc.id === locationId);
            
            if (location && location.date) {
                if (DateUtils.isInRange(location.date, start, end)) {
                    marker.setOpacity(1);
                } else {
                    marker.setOpacity(0.3);
                }
            }
        });

        this.currentFilter = { startDate, endDate };
    }

    /**
     * Show specific location
     */
    showLocation(location) {
        const marker = this.markers.get(location.id);
        
        if (marker) {
            // Zoom to marker
            this.map.setView(marker.getLatLng(), 14);
            
            // Open popup
            marker.openPopup();
            
            // Highlight marker temporarily
            const originalIcon = marker.getIcon();
            const highlightIcon = this.getHighlightIcon(location);
            
            marker.setIcon(highlightIcon);
            
            setTimeout(() => {
                marker.setIcon(originalIcon);
            }, 3000);
        }
    }

    /**
     * Get highlight icon for temporary emphasis
     */
    getHighlightIcon(location) {
        return L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#e74c3c"/>
                    <circle cx="12.5" cy="12.5" r="8" fill="white" stroke="#e74c3c" stroke-width="2"/>
                    <circle cx="12.5" cy="12.5" r="4" fill="#e74c3c"/>
                </svg>
            `),
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }

    /**
     * Zoom to Gaza Strip bounds
     */
    zoomToGaza() {
        const gazaBounds = [
            [31.22, 34.22], // Southwest
            [31.59, 34.57]  // Northeast
        ];
        
        this.map.fitBounds(gazaBounds, {
            padding: [20, 20]
        });
    }

    /**
     * Add GeoJSON layer
     */
    addGeoJSONLayer(geoJsonData, layerType = 'events') {
        const layer = L.geoJSON(geoJsonData, {
            style: (feature) => ({
                color: this.getFeatureColor(feature),
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.5
            }),
            onEachFeature: (feature, layer) => {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(feature.properties.name);
                }
            }
        });

        const layerGroup = this.layerGroups.get(layerType);
        if (layerGroup) {
            layerGroup.addLayer(layer);
        }
    }

    /**
     * Get feature color based on properties
     */
    getFeatureColor(feature) {
        const colorMap = {
            high: '#e74c3c',
            medium: '#f39c12',
            low: '#27ae60',
            default: '#3498db'
        };

        const severity = feature.properties?.severity || 'default';
        return colorMap[severity] || colorMap.default;
    }

    /**
     * Export map as image
     */
    exportAsImage() {
        // This would require additional libraries like leaflet-image
        console.log('Map export functionality would be implemented here');
    }

    /**
     * Get current map bounds
     */
    getCurrentBounds() {
        return this.map.getBounds();
    }

    /**
     * Get visible markers
     */
    getVisibleMarkers() {
        const bounds = this.getCurrentBounds();
        const visibleMarkers = [];

        this.markers.forEach((marker, locationId) => {
            if (bounds.contains(marker.getLatLng())) {
                const location = this.locationData.find(loc => loc.id === locationId);
                visibleMarkers.push(location);
            }
        });

        return visibleMarkers;
    }

    /**
     * Module cleanup
     */
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        this.layerGroups.clear();
        this.markers.clear();

        console.log('Interactive Map module destroyed');
    }
}

export default InteractiveMap;
