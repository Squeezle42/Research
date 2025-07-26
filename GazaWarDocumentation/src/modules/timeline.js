/**
 * Timeline Module
 * Gaza War Documentation Website
 * 
 * Interactive timeline component for displaying chronological events
 * 
 * @author Gaza War Documentation Team
 * @version 1.0.0
 */

import { HttpClient, DateUtils, DOMUtils, PerformanceUtils } from './utils.js';

/**
 * Timeline class for managing interactive timeline functionality
 */
export class Timeline {
    /**
     * Initialize Timeline
     * @param {string} container - Container selector
     * @param {Object} config - Configuration options
     * @param {EventBus} eventBus - Event bus for communication
     */
    constructor(container, config = {}, eventBus = null) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            throw new Error('Timeline container not found');
        }

        this.config = {
            dataSource: 'data/timeline.json',
            autoPlay: false,
            showControls: true,
            animationDuration: 1000,
            timelineHeight: 400,
            eventSpacing: 100,
            startDate: null,
            endDate: null,
            ...config
        };

        this.eventBus = eventBus;
        this.events = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.playInterval = null;
        this.svg = null;
        this.timeline = null;
        this.eventElements = [];
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
        this.render = this.render.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.goToEvent = this.goToEvent.bind(this);
        this.handleSliderChange = this.handleSliderChange.bind(this);
    }

    /**
     * Initialize the timeline
     */
    async init() {
        try {
            console.log('Initializing Timeline module...');
            PerformanceUtils.start('timeline-init');

            // Load timeline data
            await this.loadData();

            // Create timeline structure
            this.createTimelineStructure();

            // Setup controls
            this.setupControls();

            // Render timeline
            this.render();

            // Setup event listeners
            this.setupEventListeners();

            PerformanceUtils.end('timeline-init');
            console.log('Timeline module initialized successfully');

        } catch (error) {
            console.error('Failed to initialize Timeline:', error);
            throw error;
        }
    }

    /**
     * Load timeline data from source
     */
    async loadData() {
        try {
            const httpClient = new HttpClient();
            const data = await httpClient.get(this.config.dataSource);
            
            // Handle both direct array and nested object structure
            let eventsData;
            if (Array.isArray(data)) {
                eventsData = data;
            } else if (data && data.timeline && Array.isArray(data.timeline.events)) {
                eventsData = data.timeline.events;
            } else {
                throw new Error('Timeline data must be an array or contain timeline.events array');
            }

            // Process and sort events by date
            this.events = eventsData
                .map(event => ({
                    ...event,
                    date: new Date(event.date),
                    formattedDate: DateUtils.format(event.date, 'long')
                }))
                .filter(event => !isNaN(event.date.getTime()))
                .sort((a, b) => a.date - b.date);

            // Set date range if not specified
            if (!this.config.startDate && this.events.length > 0) {
                this.config.startDate = this.events[0].date;
            }
            if (!this.config.endDate && this.events.length > 0) {
                this.config.endDate = this.events[this.events.length - 1].date;
            }

            console.log(`Loaded ${this.events.length} timeline events`);

        } catch (error) {
            console.error('Failed to load timeline data:', error);
            // Load fallback data
            this.loadFallbackData();
        }
    }

    /**
     * Load fallback data when main data source fails
     */
    loadFallbackData() {
        this.events = [
            {
                id: 'event-1',
                date: new Date('2023-10-07'),
                title: 'Conflict Begins',
                description: 'Hamas launches surprise attack on Israel',
                type: 'military',
                severity: 'high',
                location: { lat: 31.5, lng: 34.5 },
                sources: ['BBC', 'Reuters']
            },
            {
                id: 'event-2',
                date: new Date('2023-10-08'),
                title: 'Israeli Response',
                description: 'Israel begins military response operations',
                type: 'military',
                severity: 'high',
                location: { lat: 31.5, lng: 34.5 },
                sources: ['AP', 'Al Jazeera']
            },
            {
                id: 'event-3',
                date: new Date('2023-10-15'),
                title: 'Humanitarian Crisis',
                description: 'UN reports humanitarian crisis in Gaza',
                type: 'humanitarian',
                severity: 'critical',
                location: { lat: 31.5, lng: 34.5 },
                sources: ['UN', 'BBC']
            }
        ].map(event => ({
            ...event,
            formattedDate: DateUtils.format(event.date, 'long')
        }));

        this.config.startDate = this.events[0].date;
        this.config.endDate = this.events[this.events.length - 1].date;
    }

    /**
     * Create timeline HTML structure
     */
    createTimelineStructure() {
        this.container.innerHTML = `
            <div class="timeline__visualization" id="timeline-svg-container">
                <!-- SVG timeline will be inserted here -->
            </div>
            <div class="timeline__event-details" id="timeline-event-details">
                <div class="timeline__event-content">
                    <h3 class="timeline__event-title" id="timeline-event-title">
                        Select an event to view details
                    </h3>
                    <p class="timeline__event-date" id="timeline-event-date"></p>
                    <p class="timeline__event-description" id="timeline-event-description">
                        Navigate through the timeline to explore key events
                    </p>
                    <div class="timeline__event-meta" id="timeline-event-meta">
                        <div class="timeline__event-type" id="timeline-event-type"></div>
                        <div class="timeline__event-sources" id="timeline-event-sources"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup timeline controls
     */
    setupControls() {
        const playButton = document.getElementById('timeline-play');
        const pauseButton = document.getElementById('timeline-pause');
        const slider = document.getElementById('timeline-slider');
        const dateDisplay = document.getElementById('timeline-date');

        if (playButton) {
            playButton.addEventListener('click', this.play);
        }

        if (pauseButton) {
            pauseButton.addEventListener('click', this.pause);
        }

        if (slider) {
            slider.min = 0;
            slider.max = Math.max(0, this.events.length - 1);
            slider.value = 0;
            slider.addEventListener('input', this.handleSliderChange);
        }

        if (dateDisplay) {
            this.updateDateDisplay();
        }
    }

    /**
     * Render the timeline visualization
     */
    render() {
        PerformanceUtils.start('timeline-render');

        const container = document.getElementById('timeline-svg-container');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Create SVG
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', this.config.timelineHeight);
        this.svg.setAttribute('class', 'timeline__svg');

        // Create timeline line
        this.createTimelineLine();

        // Create event markers
        this.createEventMarkers();

        // Create time scale
        this.createTimeScale();

        container.appendChild(this.svg);

        // Update current event display
        this.updateEventDisplay();

        PerformanceUtils.end('timeline-render');
    }

    /**
     * Create the main timeline line
     */
    createTimelineLine() {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '50');
        line.setAttribute('y1', this.config.timelineHeight / 2);
        line.setAttribute('x2', 'calc(100% - 50px)');
        line.setAttribute('y2', this.config.timelineHeight / 2);
        line.setAttribute('stroke', '#34495e');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('class', 'timeline__line');

        this.svg.appendChild(line);
    }

    /**
     * Create event markers on the timeline
     */
    createEventMarkers() {
        if (this.events.length === 0) return;

        const timelineWidth = this.container.clientWidth - 100; // Account for margins
        const timeSpan = this.config.endDate - this.config.startDate;

        this.events.forEach((event, index) => {
            const timeOffset = event.date - this.config.startDate;
            const xPosition = 50 + (timeOffset / timeSpan) * timelineWidth;

            // Create event marker group
            const eventGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            eventGroup.setAttribute('class', 'timeline__event-marker');
            eventGroup.setAttribute('data-event-index', index);

            // Create marker circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', xPosition);
            circle.setAttribute('cy', this.config.timelineHeight / 2);
            circle.setAttribute('r', this.getMarkerRadius(event));
            circle.setAttribute('fill', this.getMarkerColor(event));
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('class', 'timeline__marker-circle');

            // Create event label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', xPosition);
            label.setAttribute('y', this.config.timelineHeight / 2 - 25);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('class', 'timeline__marker-label');
            label.textContent = event.title;

            // Create date label
            const dateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            dateLabel.setAttribute('x', xPosition);
            dateLabel.setAttribute('y', this.config.timelineHeight / 2 + 35);
            dateLabel.setAttribute('text-anchor', 'middle');
            dateLabel.setAttribute('class', 'timeline__marker-date');
            dateLabel.textContent = DateUtils.format(event.date, 'short');

            eventGroup.appendChild(circle);
            eventGroup.appendChild(label);
            eventGroup.appendChild(dateLabel);

            // Add click handler
            eventGroup.addEventListener('click', () => this.goToEvent(index));
            eventGroup.addEventListener('mouseenter', () => this.highlightEvent(index));
            eventGroup.addEventListener('mouseleave', () => this.unhighlightEvent(index));

            this.svg.appendChild(eventGroup);
            this.eventElements.push(eventGroup);
        });
    }

    /**
     * Create time scale markers
     */
    createTimeScale() {
        // Implementation for time scale would go here
        // This could include year/month markers along the timeline
    }

    /**
     * Get marker radius based on event properties
     */
    getMarkerRadius(event) {
        switch (event.severity) {
            case 'critical': return 12;
            case 'high': return 10;
            case 'medium': return 8;
            case 'low': return 6;
            default: return 8;
        }
    }

    /**
     * Get marker color based on event type
     */
    getMarkerColor(event) {
        const colorMap = {
            military: '#e74c3c',
            humanitarian: '#f39c12',
            political: '#3498db',
            economic: '#27ae60',
            social: '#9b59b6',
            default: '#34495e'
        };

        return colorMap[event.type] || colorMap.default;
    }

    /**
     * Highlight an event marker
     */
    highlightEvent(index) {
        const eventElement = this.eventElements[index];
        if (eventElement) {
            const circle = eventElement.querySelector('.timeline__marker-circle');
            if (circle) {
                circle.setAttribute('stroke-width', '4');
                circle.setAttribute('filter', 'drop-shadow(0 0 6px rgba(0,0,0,0.3))');
            }
        }
    }

    /**
     * Remove highlight from event marker
     */
    unhighlightEvent(index) {
        const eventElement = this.eventElements[index];
        if (eventElement) {
            const circle = eventElement.querySelector('.timeline__marker-circle');
            if (circle) {
                circle.setAttribute('stroke-width', '2');
                circle.removeAttribute('filter');
            }
        }
    }

    /**
     * Update event details display
     */
    updateEventDisplay() {
        const currentEvent = this.events[this.currentIndex];
        
        const titleElement = document.getElementById('timeline-event-title');
        const dateElement = document.getElementById('timeline-event-date');
        const descriptionElement = document.getElementById('timeline-event-description');
        const typeElement = document.getElementById('timeline-event-type');
        const sourcesElement = document.getElementById('timeline-event-sources');

        if (currentEvent) {
            if (titleElement) titleElement.textContent = currentEvent.title;
            if (dateElement) dateElement.textContent = currentEvent.formattedDate;
            if (descriptionElement) descriptionElement.textContent = currentEvent.description;
            
            if (typeElement) {
                typeElement.innerHTML = `<span class="timeline__type-badge timeline__type-badge--${currentEvent.type}">${currentEvent.type}</span>`;
            }
            
            if (sourcesElement && currentEvent.sources) {
                sourcesElement.innerHTML = `
                    <strong>Sources:</strong> 
                    ${currentEvent.sources.map(source => `<span class="timeline__source">${source}</span>`).join(', ')}
                `;
            }

            // Update active marker
            this.updateActiveMarker();

            // Emit event change
            if (this.eventBus) {
                this.eventBus.emit('timeline:eventChanged', currentEvent);
                this.eventBus.emit('timeline:dateChanged', currentEvent.date);
            }
        }
    }

    /**
     * Update active marker styling
     */
    updateActiveMarker() {
        // Remove active class from all markers
        this.eventElements.forEach(element => {
            element.classList.remove('timeline__event-marker--active');
        });

        // Add active class to current marker
        const activeElement = this.eventElements[this.currentIndex];
        if (activeElement) {
            activeElement.classList.add('timeline__event-marker--active');
        }
    }

    /**
     * Update date display in controls
     */
    updateDateDisplay() {
        const dateDisplay = document.getElementById('timeline-date');
        if (dateDisplay && this.events[this.currentIndex]) {
            dateDisplay.textContent = this.events[this.currentIndex].formattedDate;
        }
    }

    /**
     * Setup additional event listeners
     */
    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', DOMUtils.debounce(() => {
            this.render();
        }, 250));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.timeline__container')) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousEvent();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextEvent();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.isPlaying ? this.pause() : this.play();
                        break;
                }
            }
        });
    }

    /**
     * Handle timeline slider changes
     */
    handleSliderChange(e) {
        const index = parseInt(e.target.value);
        this.goToEvent(index);
    }

    /**
     * Start timeline playback
     */
    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.playInterval = setInterval(() => {
            if (this.currentIndex < this.events.length - 1) {
                this.nextEvent();
            } else {
                this.pause();
            }
        }, 2000);

        // Update button states
        const playButton = document.getElementById('timeline-play');
        const pauseButton = document.getElementById('timeline-pause');
        
        if (playButton) playButton.disabled = true;
        if (pauseButton) pauseButton.disabled = false;

        if (this.eventBus) {
            this.eventBus.emit('timeline:playStarted');
        }
    }

    /**
     * Pause timeline playback
     */
    pause() {
        this.isPlaying = false;
        
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }

        // Update button states
        const playButton = document.getElementById('timeline-play');
        const pauseButton = document.getElementById('timeline-pause');
        
        if (playButton) playButton.disabled = false;
        if (pauseButton) pauseButton.disabled = true;

        if (this.eventBus) {
            this.eventBus.emit('timeline:playPaused');
        }
    }

    /**
     * Go to specific event
     */
    goToEvent(index) {
        if (index >= 0 && index < this.events.length) {
            this.currentIndex = index;
            this.updateEventDisplay();
            this.updateDateDisplay();

            // Update slider
            const slider = document.getElementById('timeline-slider');
            if (slider) {
                slider.value = index;
            }
        }
    }

    /**
     * Go to next event
     */
    nextEvent() {
        this.goToEvent(this.currentIndex + 1);
    }

    /**
     * Go to previous event
     */
    previousEvent() {
        this.goToEvent(this.currentIndex - 1);
    }

    /**
     * Navigate to specific date
     */
    navigateToDate(date) {
        const targetDate = new Date(date);
        let closestIndex = 0;
        let closestDiff = Math.abs(this.events[0].date - targetDate);

        this.events.forEach((event, index) => {
            const diff = Math.abs(event.date - targetDate);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestIndex = index;
            }
        });

        this.goToEvent(closestIndex);
    }

    /**
     * Filter events by date range
     */
    filterByDateRange(startDate, endDate) {
        // This would filter visible events and re-render
        // Implementation depends on specific requirements
        console.log('Filtering timeline by date range:', startDate, endDate);
    }

    /**
     * Get current event
     */
    getCurrentEvent() {
        return this.events[this.currentIndex];
    }

    /**
     * Get all events
     */
    getAllEvents() {
        return this.events;
    }

    /**
     * Module cleanup
     */
    destroy() {
        this.pause();
        
        // Remove event listeners
        window.removeEventListener('resize', this.render);
        
        // Clear intervals
        if (this.playInterval) {
            clearInterval(this.playInterval);
        }

        console.log('Timeline module destroyed');
    }
}

export default Timeline;
