/**
 * News Integration Module
 * Gaza War Documentation Website
 * 
 * Integrates real-time news from credible sources with proper attribution
 * 
 * @author Gaza War Documentation Team
 * @version 1.0.0
 */

import { HttpClient, DateUtils, ValidationUtils, PerformanceUtils } from './utils.js';

/**
 * News Integration class for managing news sources and articles
 */
export class NewsIntegration {
    /**
     * Initialize News Integration
     * @param {string} container - Container selector
     * @param {Object} config - Configuration options
     * @param {EventBus} eventBus - Event bus for communication
     */
    constructor(container, config = {}, eventBus = null) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            throw new Error('News container not found');
        }

        this.config = {
            sources: ['bbc', 'reuters', 'ap', 'aljazeera'],
            updateInterval: 300000, // 5 minutes
            maxArticles: 12,
            apiEndpoint: '/api/news', // Would be your backend API
            keywords: ['gaza', 'palestine', 'israel', 'conflict', 'humanitarian'],
            ...config
        };

        this.eventBus = eventBus;
        this.articles = [];
        this.filteredArticles = [];
        this.updateTimer = null;
        this.isLoading = false;
        this.currentPage = 1;
        
        // News source configurations
        this.sources = new Map([
            ['bbc', {
                name: 'BBC News',
                url: 'https://www.bbc.com',
                credibility: 'high',
                bias: 'center',
                color: '#bb1919'
            }],
            ['reuters', {
                name: 'Reuters',
                url: 'https://www.reuters.com',
                credibility: 'high',
                bias: 'center',
                color: '#ff6600'
            }],
            ['ap', {
                name: 'Associated Press',
                url: 'https://apnews.com',
                credibility: 'high',
                bias: 'center',
                color: '#0066cc'
            }],
            ['aljazeera', {
                name: 'Al Jazeera',
                url: 'https://www.aljazeera.com',
                credibility: 'high',
                bias: 'center-left',
                color: '#e4621b'
            }],
            ['times', {
                name: 'The Times',
                url: 'https://www.thetimes.co.uk',
                credibility: 'high',
                bias: 'center-right',
                color: '#000000'
            }],
            ['cbc', {
                name: 'CBC News',
                url: 'https://www.cbc.ca',
                credibility: 'high',
                bias: 'center-left',
                color: '#000000'
            }]
        ]);
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadNews = this.loadNews.bind(this);
        this.renderArticles = this.renderArticles.bind(this);
        this.startAutoUpdate = this.startAutoUpdate.bind(this);
        this.stopAutoUpdate = this.stopAutoUpdate.bind(this);
    }

    /**
     * Initialize the news module
     */
    async init() {
        try {
            console.log('Initializing News Integration module...');
            PerformanceUtils.start('news-init');

            // Setup filters
            this.setupFilters();

            // Load initial news
            await this.loadNews();

            // Render articles
            this.renderArticles();

            // Setup event listeners
            this.setupEventListeners();

            // Start auto-update
            this.startAutoUpdate();

            PerformanceUtils.end('news-init');
            console.log('News Integration module initialized successfully');

        } catch (error) {
            console.error('Failed to initialize News Integration:', error);
            this.loadFallbackNews();
        }
    }

    /**
     * Load news from configured sources
     */
    async loadNews() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            // In a real implementation, this would call your backend API
            // which would then fetch from news APIs with proper authentication
            const articles = await this.fetchNewsFromAPI();
            
            // Process and validate articles
            this.articles = this.processArticles(articles);
            
            // Apply current filters
            this.applyFilters();

            this.hideLoadingState();

        } catch (error) {
            console.error('Failed to load news:', error);
            this.hideLoadingState();
            this.showErrorState();
        }

        this.isLoading = false;
    }

    /**
     * Fetch news from API (mock implementation)
     */
    async fetchNewsFromAPI() {
        // This is a mock implementation
        // In production, you would have a backend API that:
        // 1. Fetches from news APIs (BBC, Reuters, etc.)
        // 2. Filters for relevant content
        // 3. Adds source attribution
        // 4. Caches results

        return this.getMockNewsData();
    }

    /**
     * Get mock news data for demonstration
     */
    getMockNewsData() {
        const baseDate = new Date();
        
        return [
            {
                id: 'bbc-1',
                title: 'Gaza Ceasefire Talks Continue in Qatar',
                summary: 'International mediators work to broker extended ceasefire agreement between Israel and Hamas.',
                content: 'Detailed article content would be here...',
                source: 'bbc',
                author: 'BBC News Reporter',
                publishedAt: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
                url: 'https://www.bbc.com/news/example-1',
                imageUrl: 'https://via.placeholder.com/400x225/ddd/666?text=News+Image',
                tags: ['ceasefire', 'diplomacy', 'qatar'],
                verified: true,
                credibility: 'high'
            },
            {
                id: 'reuters-1',
                title: 'Humanitarian Aid Delivery Increases to Gaza Strip',
                summary: 'UN agencies report successful delivery of medical supplies and food aid through multiple crossing points.',
                content: 'Detailed article content would be here...',
                source: 'reuters',
                author: 'Reuters Staff',
                publishedAt: new Date(baseDate.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
                url: 'https://www.reuters.com/example-1',
                imageUrl: 'https://via.placeholder.com/400x225/eee/777?text=Aid+Delivery',
                tags: ['humanitarian', 'aid', 'un'],
                verified: true,
                credibility: 'high'
            },
            {
                id: 'ap-1',
                title: 'International Court Reviews Gaza Conflict Evidence',
                summary: 'The International Court of Justice examines submissions regarding alleged violations of international law.',
                content: 'Detailed article content would be here...',
                source: 'ap',
                author: 'Associated Press',
                publishedAt: new Date(baseDate.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
                url: 'https://apnews.com/example-1',
                imageUrl: 'https://via.placeholder.com/400x225/ccc/555?text=Court+Building',
                tags: ['legal', 'icj', 'international law'],
                verified: true,
                credibility: 'high'
            },
            {
                id: 'aljazeera-1',
                title: 'Gaza Residents Describe Living Conditions',
                summary: 'First-hand accounts from Gaza residents detail daily challenges amid ongoing conflict.',
                content: 'Detailed article content would be here...',
                source: 'aljazeera',
                author: 'Al Jazeera Correspondent',
                publishedAt: new Date(baseDate.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
                url: 'https://www.aljazeera.com/example-1',
                imageUrl: 'https://via.placeholder.com/400x225/ddd/888?text=Gaza+Street',
                tags: ['residents', 'living conditions', 'daily life'],
                verified: true,
                credibility: 'high'
            },
            {
                id: 'times-1',
                title: 'European Leaders Discuss Middle East Peace Process',
                summary: 'EU foreign ministers meet to coordinate response and explore diplomatic solutions.',
                content: 'Detailed article content would be here...',
                source: 'times',
                author: 'Times Foreign Correspondent',
                publishedAt: new Date(baseDate.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
                url: 'https://www.thetimes.co.uk/example-1',
                imageUrl: 'https://via.placeholder.com/400x225/aaa/333?text=EU+Meeting',
                tags: ['diplomacy', 'europe', 'peace process'],
                verified: true,
                credibility: 'high'
            },
            {
                id: 'cbc-1',
                title: 'Canada Increases Humanitarian Aid to Region',
                summary: 'Canadian government announces additional funding for humanitarian organizations operating in Gaza.',
                content: 'Detailed article content would be here...',
                source: 'cbc',
                author: 'CBC News',
                publishedAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                url: 'https://www.cbc.ca/example-1',
                imageUrl: 'https://via.placeholder.com/400x225/bbb/444?text=Canadian+Flag',
                tags: ['canada', 'aid', 'funding'],
                verified: true,
                credibility: 'high'
            }
        ];
    }

    /**
     * Process and validate articles
     */
    processArticles(articles) {
        return articles
            .filter(article => this.validateArticle(article))
            .map(article => this.enrichArticle(article))
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    /**
     * Validate article data
     */
    validateArticle(article) {
        return article &&
               article.title &&
               article.source &&
               article.publishedAt &&
               ValidationUtils.isValidURL(article.url) &&
               this.sources.has(article.source);
    }

    /**
     * Enrich article with additional metadata
     */
    enrichArticle(article) {
        const sourceInfo = this.sources.get(article.source);
        
        return {
            ...article,
            sourceInfo,
            relativeTime: DateUtils.getRelativeTime(article.publishedAt),
            formattedDate: DateUtils.format(article.publishedAt, 'datetime'),
            readingTime: this.calculateReadingTime(article.content || article.summary)
        };
    }

    /**
     * Calculate estimated reading time
     */
    calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const wordCount = text.split(' ').length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    }

    /**
     * Setup filter controls
     */
    setupFilters() {
        const sourceCheckboxes = document.querySelectorAll('input[name="news-source"]');
        const startDateInput = document.getElementById('news-start-date');
        const endDateInput = document.getElementById('news-end-date');
        const filterButton = document.getElementById('filter-news');

        // Source filter handlers
        sourceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // Date filter handler
        if (filterButton) {
            filterButton.addEventListener('click', () => {
                this.applyFilters();
            });
        }
    }

    /**
     * Apply current filters to articles
     */
    applyFilters() {
        const selectedSources = this.getSelectedSources();
        const dateRange = this.getDateRange();
        
        this.filteredArticles = this.articles.filter(article => {
            // Source filter
            if (!selectedSources.includes(article.source)) {
                return false;
            }
            
            // Date filter
            if (dateRange.start || dateRange.end) {
                const articleDate = new Date(article.publishedAt);
                
                if (dateRange.start && articleDate < dateRange.start) {
                    return false;
                }
                
                if (dateRange.end && articleDate > dateRange.end) {
                    return false;
                }
            }
            
            return true;
        });

        this.renderArticles();
    }

    /**
     * Get selected news sources
     */
    getSelectedSources() {
        const checkboxes = document.querySelectorAll('input[name="news-source"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * Get selected date range
     */
    getDateRange() {
        const startDateInput = document.getElementById('news-start-date');
        const endDateInput = document.getElementById('news-end-date');
        
        return {
            start: startDateInput?.value ? new Date(startDateInput.value) : null,
            end: endDateInput?.value ? new Date(endDateInput.value) : null
        };
    }

    /**
     * Render news articles
     */
    renderArticles() {
        if (!this.container) return;

        PerformanceUtils.start('news-render');

        const articlesToShow = this.filteredArticles.slice(0, this.config.maxArticles);
        
        this.container.innerHTML = articlesToShow
            .map(article => this.createArticleHTML(article))
            .join('');

        // Update load more button
        this.updateLoadMoreButton();

        PerformanceUtils.end('news-render');
    }

    /**
     * Create HTML for a single article
     */
    createArticleHTML(article) {
        const sourceInfo = article.sourceInfo;
        
        return `
            <article class="news__article" data-article-id="${article.id}">
                <div class="news__article-header">
                    <div class="news__source-info">
                        <img src="https://www.google.com/s2/favicons?domain=${sourceInfo.url}" 
                             alt="${sourceInfo.name} favicon" 
                             class="news__source-icon"
                             onerror="this.style.display='none'">
                        <span class="news__source-name" style="color: ${sourceInfo.color}">
                            ${sourceInfo.name}
                        </span>
                        <span class="news__credibility-badge news__credibility-badge--${sourceInfo.credibility}">
                            ${sourceInfo.credibility} credibility
                        </span>
                    </div>
                    <time class="news__publish-time" datetime="${article.publishedAt}">
                        ${article.relativeTime}
                    </time>
                </div>
                
                <div class="news__article-content">
                    ${article.imageUrl ? `
                        <div class="news__article-image">
                            <img src="${article.imageUrl}" 
                                 alt="Article image" 
                                 loading="lazy"
                                 onerror="this.parentElement.style.display='none'">
                        </div>
                    ` : ''}
                    
                    <div class="news__article-text">
                        <h3 class="news__article-title">
                            <a href="${article.url}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="news__article-link">
                                ${article.title}
                            </a>
                        </h3>
                        
                        <p class="news__article-summary">
                            ${article.summary}
                        </p>
                        
                        <div class="news__article-meta">
                            <span class="news__reading-time">${article.readingTime}</span>
                            ${article.author ? `<span class="news__author">By ${article.author}</span>` : ''}
                            ${article.verified ? '<span class="news__verified-badge">✓ Verified</span>' : ''}
                        </div>
                        
                        ${article.tags && article.tags.length > 0 ? `
                            <div class="news__tags">
                                ${article.tags.map(tag => `<span class="news__tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="news__article-actions">
                    <button class="news__action-btn" onclick="this.shareArticle('${article.id}')">
                        Share
                    </button>
                    <button class="news__action-btn" onclick="this.saveArticle('${article.id}')">
                        Save
                    </button>
                    <a href="${article.url}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="news__action-btn news__action-btn--external">
                        Read Full Article →
                    </a>
                </div>
            </article>
        `;
    }

    /**
     * Update load more button state
     */
    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-news');
        
        if (loadMoreBtn) {
            const hasMore = this.filteredArticles.length > this.config.maxArticles;
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Load more button
        const loadMoreBtn = document.getElementById('load-more-news');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }

        // Article click handlers
        this.container.addEventListener('click', (e) => {
            const article = e.target.closest('.news__article');
            if (article && !e.target.closest('a, button')) {
                const articleId = article.dataset.articleId;
                this.selectArticle(articleId);
            }
        });

        // Refresh news button (if exists)
        const refreshBtn = document.getElementById('refresh-news');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadNews();
            });
        }
    }

    /**
     * Load more articles
     */
    loadMoreArticles() {
        this.config.maxArticles += 6;
        this.renderArticles();
    }

    /**
     * Select an article and emit event
     */
    selectArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        
        if (article && this.eventBus) {
            this.eventBus.emit('news:articleSelected', article);
        }
    }

    /**
     * Share article functionality
     */
    shareArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        
        if (article && navigator.share) {
            navigator.share({
                title: article.title,
                text: article.summary,
                url: article.url
            });
        } else if (article) {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(article.url);
            this.showNotification('Article URL copied to clipboard');
        }
    }

    /**
     * Save article functionality
     */
    saveArticle(articleId) {
        // This would integrate with local storage or user account
        const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
        
        if (!savedArticles.includes(articleId)) {
            savedArticles.push(articleId);
            localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
            this.showNotification('Article saved');
        } else {
            this.showNotification('Article already saved');
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="news__loading">
                    <div class="news__loading-spinner"></div>
                    <p>Loading latest news...</p>
                </div>
            `;
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loadingElement = this.container.querySelector('.news__loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    /**
     * Show error state
     */
    showErrorState() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="news__error">
                    <h3>Unable to load news</h3>
                    <p>Please check your connection and try again.</p>
                    <button onclick="window.GazaWarApp.getModule('news').loadNews()">
                        Retry
                    </button>
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
        notification.className = 'news__notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Start auto-update timer
     */
    startAutoUpdate() {
        if (this.config.updateInterval > 0) {
            this.updateTimer = setInterval(() => {
                this.loadNews();
            }, this.config.updateInterval);
        }
    }

    /**
     * Stop auto-update timer
     */
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    /**
     * Load fallback news for offline/error scenarios
     */
    loadFallbackNews() {
        console.log('Loading fallback news data...');
        this.articles = this.getMockNewsData();
        this.applyFilters();
    }

    /**
     * Pause updates (called when page becomes hidden)
     */
    pause() {
        this.stopAutoUpdate();
    }

    /**
     * Resume updates (called when page becomes visible)
     */
    resume() {
        this.startAutoUpdate();
    }

    /**
     * Get articles for a specific date range
     */
    getArticlesByDateRange(startDate, endDate) {
        return this.articles.filter(article => {
            const articleDate = new Date(article.publishedAt);
            return DateUtils.isInRange(articleDate, startDate, endDate);
        });
    }

    /**
     * Get articles by source
     */
    getArticlesBySource(source) {
        return this.articles.filter(article => article.source === source);
    }

    /**
     * Search articles
     */
    searchArticles(query) {
        const searchTerm = query.toLowerCase();
        
        return this.articles.filter(article => {
            return article.title.toLowerCase().includes(searchTerm) ||
                   article.summary.toLowerCase().includes(searchTerm) ||
                   (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        });
    }

    /**
     * Module cleanup
     */
    destroy() {
        this.stopAutoUpdate();
        console.log('News Integration module destroyed');
    }
}

export default NewsIntegration;
