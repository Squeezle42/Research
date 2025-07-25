/**
 * Sources Management Module
 * Gaza War Documentation Website
 * 
 * Manages source citations, credibility ratings, and attribution
 * 
 * @author Gaza War Documentation Team
 * @version 1.0.0
 */

import { HttpClient, Logger } from './utils.js';

/**
 * Sources Manager class for handling source citations and credibility
 */
export class SourcesManager {
    /**
     * Initialize Sources Manager
     * @param {string} container - Container selector
     * @param {Object} config - Configuration options
     * @param {EventBus} eventBus - Event bus for communication
     */
    constructor(container, config = {}, eventBus = null) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            throw new Error('Sources container not found');
        }

        this.config = {
            sourcesDataUrl: './data/news_sources.json',
            showCredibilityRatings: true,
            showBiasRatings: true,
            groupByRegion: true,
            ...config
        };

        this.eventBus = eventBus;
        this.logger = new Logger('SourcesManager');
        this.httpClient = new HttpClient();
        this.sources = new Map();
        this.sourceCategories = new Map();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadSources = this.loadSources.bind(this);
        this.renderSources = this.renderSources.bind(this);
    }

    /**
     * Initialize the sources manager
     */
    async init() {
        try {
            this.logger.info('Initializing Sources Manager...');
            
            await this.loadSources();
            this.renderSources();
            this.setupEventListeners();
            
            this.logger.info('Sources Manager initialized successfully');
            
        } catch (error) {
            this.logger.error('Failed to initialize Sources Manager:', error);
            this.showErrorState();
        }
    }

    /**
     * Load sources data
     */
    async loadSources() {
        try {
            const data = await this.httpClient.get(this.config.sourcesDataUrl);
            
            if (data && data.news_sources) {
                this.processSources(data.news_sources);
            } else {
                throw new Error('Invalid sources data format');
            }
            
        } catch (error) {
            this.logger.error('Failed to load sources data:', error);
            throw error;
        }
    }

    /**
     * Process and organize sources data
     */
    processSources(sourcesData) {
        // Clear existing data
        this.sources.clear();
        this.sourceCategories.clear();

        // Process primary sources
        if (sourcesData.primary_sources) {
            sourcesData.primary_sources.forEach(source => {
                source.category = 'primary';
                this.sources.set(source.id, source);
            });
        }

        // Process regional sources
        if (sourcesData.regional_sources) {
            sourcesData.regional_sources.forEach(source => {
                source.category = 'regional';
                this.sources.set(source.id, source);
            });
        }

        // Process fact checking sources
        if (sourcesData.fact_checking) {
            sourcesData.fact_checking.forEach(source => {
                source.category = 'fact_checking';
                this.sources.set(source.id, source);
            });
        }

        // Process international organizations
        if (sourcesData.international_organizations) {
            sourcesData.international_organizations.forEach(source => {
                source.category = 'international';
                this.sources.set(source.id, source);
            });
        }

        // Process source categories
        if (sourcesData.source_categories) {
            Object.entries(sourcesData.source_categories).forEach(([category, sourceIds]) => {
                this.sourceCategories.set(category, sourceIds);
            });
        }

        this.logger.info(`Loaded ${this.sources.size} sources`);
    }

    /**
     * Render sources display
     */
    renderSources() {
        if (this.sources.size === 0) {
            this.showNoSourcesState();
            return;
        }

        const sourcesHTML = this.generateSourcesHTML();
        this.container.innerHTML = sourcesHTML;
    }

    /**
     * Generate HTML for sources display
     */
    generateSourcesHTML() {
        const categories = this.groupSourcesByCategory();
        
        return `
            <div class="sources__header">
                <h2>News Sources & Attribution</h2>
                <p class="sources__description">
                    All information on this website is sourced from credible news organizations and international bodies.
                    Each source is rated for credibility and potential bias to help users evaluate information.
                </p>
            </div>
            
            <div class="sources__categories">
                ${Object.entries(categories).map(([category, sources]) => 
                    this.generateCategoryHTML(category, sources)
                ).join('')}
            </div>
            
            <div class="sources__methodology">
                <h3>Source Evaluation Methodology</h3>
                <div class="methodology__grid">
                    <div class="methodology__item">
                        <h4>Credibility Rating</h4>
                        <ul>
                            <li><strong>Very High:</strong> Consistently accurate, rigorous fact-checking</li>
                            <li><strong>High:</strong> Generally reliable with good editorial standards</li>
                            <li><strong>Medium-High:</strong> Mostly accurate with occasional concerns</li>
                            <li><strong>Medium:</strong> Mixed record, requires verification</li>
                        </ul>
                    </div>
                    <div class="methodology__item">
                        <h4>Bias Assessment</h4>
                        <ul>
                            <li><strong>Center:</strong> Balanced reporting from multiple perspectives</li>
                            <li><strong>Center-Left/Right:</strong> Slight editorial lean but factual reporting</li>
                            <li><strong>Pro-Israeli/Palestinian:</strong> Clear perspective but transparent</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Group sources by category
     */
    groupSourcesByCategory() {
        const categories = {
            'Primary International': [],
            'Regional Middle East': [],
            'Fact Checking': [],
            'International Organizations': []
        };

        this.sources.forEach(source => {
            switch (source.category) {
                case 'primary':
                    categories['Primary International'].push(source);
                    break;
                case 'regional':
                    categories['Regional Middle East'].push(source);
                    break;
                case 'fact_checking':
                    categories['Fact Checking'].push(source);
                    break;
                case 'international':
                    categories['International Organizations'].push(source);
                    break;
            }
        });

        return categories;
    }

    /**
     * Generate HTML for a source category
     */
    generateCategoryHTML(categoryName, sources) {
        return `
            <div class="sources__category">
                <h3 class="sources__category-title">${categoryName}</h3>
                <div class="sources__grid">
                    ${sources.map(source => this.generateSourceCardHTML(source)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Generate HTML for a source card
     */
    generateSourceCardHTML(source) {
        const credibilityClass = this.getCredibilityClass(source.credibility_rating);
        const biasClass = this.getBiasClass(source.bias_rating);
        
        return `
            <div class="source__card" data-source-id="${source.id}">
                <div class="source__header">
                    <h4 class="source__name">${source.name}</h4>
                    <div class="source__ratings">
                        ${this.config.showCredibilityRatings ? `
                            <span class="source__credibility ${credibilityClass}" 
                                  title="Credibility: ${source.credibility_rating}">
                                ${this.getCredibilityIcon(source.credibility_rating)}
                                ${source.credibility_rating}
                            </span>
                        ` : ''}
                        ${this.config.showBiasRatings && source.bias_rating ? `
                            <span class="source__bias ${biasClass}" 
                                  title="Bias: ${source.bias_rating}">
                                ${this.getBiasIcon(source.bias_rating)}
                                ${source.bias_rating}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="source__details">
                    <div class="source__info">
                        <span class="source__region">${this.formatRegion(source.region)}</span>
                        ${source.specialization ? `
                            <span class="source__specialization">${source.specialization.replace(/_/g, ' ')}</span>
                        ` : ''}
                    </div>
                    
                    ${source.gaza_coverage ? `
                        <div class="source__coverage">
                            Gaza Coverage: <strong>${source.gaza_coverage}</strong>
                        </div>
                    ` : ''}
                    
                    ${source.perspective ? `
                        <div class="source__perspective">
                            Perspective: ${source.perspective.replace(/_/g, ' ')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="source__actions">
                    <a href="${source.url}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="source__link">
                        Visit Website
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    ${source.contact && source.contact.twitter ? `
                        <a href="https://twitter.com/${source.contact.twitter.replace('@', '')}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="source__social">
                            <i class="fab fa-twitter"></i>
                        </a>
                    ` : ''}
                </div>
                
                <div class="source__attribution">
                    <small>${source.attribution || `© ${source.name}`}</small>
                </div>
            </div>
        `;
    }

    /**
     * Get credibility CSS class
     */
    getCredibilityClass(rating) {
        switch (rating) {
            case 'very_high': return 'credibility--very-high';
            case 'high': return 'credibility--high';
            case 'medium-high': return 'credibility--medium-high';
            case 'medium': return 'credibility--medium';
            default: return 'credibility--unknown';
        }
    }

    /**
     * Get bias CSS class
     */
    getBiasClass(rating) {
        switch (rating) {
            case 'center': return 'bias--center';
            case 'center-left': return 'bias--center-left';
            case 'center-right': return 'bias--center-right';
            case 'pro-palestinian': return 'bias--pro-palestinian';
            case 'pro-israeli': return 'bias--pro-israeli';
            default: return 'bias--unknown';
        }
    }

    /**
     * Get credibility icon
     */
    getCredibilityIcon(rating) {
        switch (rating) {
            case 'very_high': return '⭐⭐⭐';
            case 'high': return '⭐⭐';
            case 'medium-high': return '⭐';
            case 'medium': return '○';
            default: return '?';
        }
    }

    /**
     * Get bias icon
     */
    getBiasIcon(rating) {
        switch (rating) {
            case 'center': return '⚖️';
            case 'center-left': return '◀️';
            case 'center-right': return '▶️';
            case 'pro-palestinian': return '🇵🇸';
            case 'pro-israeli': return '🇮🇱';
            default: return '❓';
        }
    }

    /**
     * Format region name
     */
    formatRegion(region) {
        return region.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Source card interactions
        this.container.addEventListener('click', (e) => {
            const sourceCard = e.target.closest('.source__card');
            if (sourceCard && !e.target.closest('.source__link, .source__social')) {
                const sourceId = sourceCard.dataset.sourceId;
                this.selectSource(sourceId);
            }
        });

        // Filter sources
        const filterButtons = this.container.querySelectorAll('.sources__filter');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterSources(filter);
            });
        });
    }

    /**
     * Select a source
     */
    selectSource(sourceId) {
        const source = this.sources.get(sourceId);
        if (source && this.eventBus) {
            this.eventBus.emit('sources:sourceSelected', {
                source,
                sourceId
            });
        }
    }

    /**
     * Filter sources by criteria
     */
    filterSources(criteria) {
        const sourceCards = this.container.querySelectorAll('.source__card');
        
        sourceCards.forEach(card => {
            const sourceId = card.dataset.sourceId;
            const source = this.sources.get(sourceId);
            
            let shouldShow = true;
            
            switch (criteria) {
                case 'high-credibility':
                    shouldShow = ['very_high', 'high'].includes(source.credibility_rating);
                    break;
                case 'international':
                    shouldShow = source.region === 'international';
                    break;
                case 'middle-east':
                    shouldShow = ['middle_east', 'israel', 'palestine'].includes(source.region);
                    break;
                case 'extensive-coverage':
                    shouldShow = source.gaza_coverage === 'extensive';
                    break;
                default:
                    shouldShow = true;
            }
            
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    /**
     * Get source by ID
     */
    getSource(sourceId) {
        return this.sources.get(sourceId);
    }

    /**
     * Get sources by category
     */
    getSourcesByCategory(category) {
        const categoryIds = this.sourceCategories.get(category) || [];
        return categoryIds.map(id => this.sources.get(id)).filter(Boolean);
    }

    /**
     * Show error state
     */
    showErrorState() {
        this.container.innerHTML = `
            <div class="sources__error">
                <h3>Unable to load sources</h3>
                <p>There was an error loading the sources information.</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }

    /**
     * Show no sources state
     */
    showNoSourcesState() {
        this.container.innerHTML = `
            <div class="sources__empty">
                <h3>No sources available</h3>
                <p>Source information is currently unavailable.</p>
            </div>
        `;
    }

    /**
     * Module cleanup
     */
    destroy() {
        this.logger.info('Sources Manager destroyed');
    }
}

export default SourcesManager;
