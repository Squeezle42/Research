/**
 * API Keys Configuration Template
 * Gaza War Documentation Website
 * 
 * SECURITY WARNING: This is a template file. 
 * Copy this file to 'api-keys.js' and add your real API keys.
 * Never commit the actual 'api-keys.js' file to version control!
 */

export const API_KEYS = {
    // News API Configuration
    // Get your key from: https://newsapi.org/register
    newsApi: {
        key: 'your_news_api_key_here',
        baseUrl: 'https://newsapi.org/v2',
        maxRequestsPerDay: 1000,
        endpoints: {
            topHeadlines: '/top-headlines',
            everything: '/everything',
            sources: '/sources'
        }
    },
    
    // NASA Earth Imagery API
    // Get your key from: https://api.nasa.gov/
    nasa: {
        key: 'DEMO_KEY', // Replace with your API key
        baseUrl: 'https://api.nasa.gov/planetary/earth',
        endpoints: {
            imagery: '/imagery',
            assets: '/assets'
        }
    },
    
    // ESA Sentinel Hub API
    // Get your credentials from: https://www.sentinel-hub.com/
    sentinelHub: {
        clientId: 'your_sentinel_client_id_here',
        clientSecret: 'your_sentinel_client_secret_here',
        baseUrl: 'https://services.sentinel-hub.com',
        instanceId: 'your_instance_id_here',
        endpoints: {
            process: '/api/v1/process',
            oauth: '/oauth/token'
        }
    },
    
    // Planet Labs API (Optional - for high-frequency satellite imagery)
    // Apply for access at: https://www.planet.com/
    planet: {
        key: 'your_planet_api_key_here',
        baseUrl: 'https://api.planet.com/data/v1',
        endpoints: {
            search: '/quick-search',
            orders: '/orders'
        }
    },
    
    // Mapbox API (Optional - for enhanced mapping)
    // Get your token from: https://account.mapbox.com/
    mapbox: {
        accessToken: 'your_mapbox_access_token_here',
        baseUrl: 'https://api.mapbox.com',
        endpoints: {
            geocoding: '/geocoding/v5',
            directions: '/directions/v5',
            matrix: '/directions-matrix/v1'
        }
    }
};

// Rate limiting configuration to prevent API quota exhaustion
export const RATE_LIMITS = {
    newsApi: {
        requestsPerHour: 100,
        requestsPerDay: 1000,
        retryAfterMs: 3600000 // 1 hour
    },
    nasa: {
        requestsPerHour: 1000,
        requestsPerSecond: 10,
        retryAfterMs: 1000 // 1 second
    },
    sentinelHub: {
        processingUnitsPerMonth: 5000,
        requestsPerMinute: 120,
        retryAfterMs: 60000 // 1 minute
    },
    planet: {
        requestsPerMinute: 300,
        retryAfterMs: 60000 // 1 minute
    },
    mapbox: {
        requestsPerMinute: 600,
        retryAfterMs: 60000 // 1 minute
    }
};

// Cache configuration to optimize performance and reduce API calls
export const CACHE_CONFIG = {
    newsArticles: {
        duration: 300000, // 5 minutes
        maxSize: 100 // maximum articles to cache
    },
    satelliteImagery: {
        duration: 3600000, // 1 hour
        maxSize: 50 // maximum images to cache
    },
    mapTiles: {
        duration: 86400000, // 24 hours
        maxSize: 200 // maximum tiles to cache
    },
    sourceData: {
        duration: 600000, // 10 minutes
        maxSize: 20 // maximum source records to cache
    },
    geocoding: {
        duration: 2592000000, // 30 days (locations don't change often)
        maxSize: 1000 // maximum geocoded locations
    }
};

// API status monitoring configuration
export const MONITORING_CONFIG = {
    healthCheckInterval: 300000, // 5 minutes
    timeoutMs: 30000, // 30 seconds
    maxRetries: 3,
    retryDelayMs: 1000,
    errorThreshold: 5 // consecutive errors before marking as down
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'GazaWarDocumentation/1.0.0'
};

// Geographic bounds for Gaza and surrounding region
export const GEOGRAPHIC_BOUNDS = {
    gaza: {
        north: 31.6,
        south: 31.2,
        east: 34.6,
        west: 34.2
    },
    extended: {
        north: 33.0,
        south: 29.0,
        east: 36.0,
        west: 32.0
    }
};

export default API_KEYS;
