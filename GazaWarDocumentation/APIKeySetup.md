# API Key Setup Guide
## Gaza War Documentation Website

This guide explains how to set up API keys for external services used by the Gaza War Documentation website.

## 🔑 Required API Keys

### 1. News API (newsapi.org)
**Purpose**: Real-time news aggregation from multiple sources
**Free Tier**: 1,000 requests/day
**Cost**: Free tier available, paid plans start at $449/month

**Setup Steps**:
1. Visit [https://newsapi.org/register](https://newsapi.org/register)
2. Create a free account
3. Verify your email address
4. Copy your API key from the dashboard
5. Add to `config/api-keys.js` (see configuration section below)

**Usage**: Fetches real-time news articles from BBC, Reuters, Associated Press, and other sources.

### 2. NASA Earth Imagery API
**Purpose**: Satellite imagery and earth observation data
**Free Tier**: Unlimited with rate limiting
**Cost**: Free

**Setup Steps**:
1. Visit [https://api.nasa.gov/](https://api.nasa.gov/)
2. Request an API key (instant approval)
3. Use the provided demo key: `DEMO_KEY` (limited requests)
4. For production, register for a personal key
5. Add to `config/api-keys.js`

**Usage**: Provides satellite imagery for the Gaza region with time-lapse capabilities.

### 3. ESA Sentinel Hub API
**Purpose**: High-resolution satellite imagery from Sentinel satellites
**Free Tier**: 5,000 processing units/month
**Cost**: Free tier available, paid plans available

**Setup Steps**:
1. Visit [https://www.sentinel-hub.com/](https://www.sentinel-hub.com/)
2. Create a free account
3. Create a new configuration in the dashboard
4. Generate OAuth credentials
5. Add client ID and secret to configuration

**Usage**: Provides detailed satellite imagery and analysis capabilities.

### 4. Planet Labs API (Optional)
**Purpose**: Daily satellite imagery updates
**Free Tier**: Limited research access
**Cost**: Commercial license required

**Setup Steps**:
1. Visit [https://www.planet.com/](https://www.planet.com/)
2. Apply for research/educational access
3. Once approved, get API key from account dashboard
4. Add to configuration

**Usage**: High-frequency satellite imagery updates for conflict monitoring.

### 5. Mapbox API (Optional - Alternative to OpenStreetMap)
**Purpose**: Enhanced mapping capabilities and custom map tiles
**Free Tier**: 50,000 map loads/month
**Cost**: Free tier available, usage-based pricing

**Setup Steps**:
1. Visit [https://account.mapbox.com/](https://account.mapbox.com/)
2. Create account and verify email
3. Generate access token
4. Add to configuration

**Usage**: Enhanced mapping with custom styling and better performance.

## 📁 Configuration Setup

### Step 1: Create API Keys Configuration File

Create a file at `config/api-keys.js`:

```javascript
/**
 * API Keys Configuration
 * Gaza War Documentation Website
 * 
 * SECURITY WARNING: Never commit this file to version control!
 * Add 'config/api-keys.js' to your .gitignore file.
 */

export const API_KEYS = {
    // News API Configuration
    newsApi: {
        key: 'YOUR_NEWS_API_KEY_HERE',
        baseUrl: 'https://newsapi.org/v2',
        maxRequestsPerDay: 1000
    },
    
    // NASA Earth Imagery API
    nasa: {
        key: 'DEMO_KEY', // Replace with your API key
        baseUrl: 'https://api.nasa.gov/planetary/earth',
        endpoints: {
            imagery: '/imagery',
            assets: '/assets'
        }
    },
    
    // ESA Sentinel Hub API
    sentinelHub: {
        clientId: 'YOUR_SENTINEL_CLIENT_ID',
        clientSecret: 'YOUR_SENTINEL_CLIENT_SECRET',
        baseUrl: 'https://services.sentinel-hub.com',
        instanceId: 'YOUR_INSTANCE_ID'
    },
    
    // Planet Labs API (Optional)
    planet: {
        key: 'YOUR_PLANET_API_KEY',
        baseUrl: 'https://api.planet.com/data/v1'
    },
    
    // Mapbox API (Optional)
    mapbox: {
        accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
        baseUrl: 'https://api.mapbox.com'
    }
};

// Rate limiting configuration
export const RATE_LIMITS = {
    newsApi: {
        requestsPerHour: 100,
        requestsPerDay: 1000
    },
    nasa: {
        requestsPerHour: 1000,
        requestsPerSecond: 10
    },
    sentinelHub: {
        processingUnitsPerMonth: 5000
    }
};

// Cache configuration
export const CACHE_CONFIG = {
    newsArticles: 300000, // 5 minutes
    satelliteImagery: 3600000, // 1 hour
    mapTiles: 86400000, // 24 hours
    sourceData: 600000 // 10 minutes
};

export default API_KEYS;
```

### Step 2: Create Environment Configuration

Create a file at `config/environment.js`:

```javascript
/**
 * Environment Configuration
 * Gaza War Documentation Website
 */

export const ENVIRONMENT = {
    development: {
        apiBaseUrl: 'http://localhost:8080',
        enableLogging: true,
        enableCache: false,
        enableMockData: true
    },
    
    production: {
        apiBaseUrl: 'https://gaza-documentation.org',
        enableLogging: false,
        enableCache: true,
        enableMockData: false
    }
};

export const getCurrentEnvironment = () => {
    return window.location.hostname === 'localhost' 
        ? ENVIRONMENT.development 
        : ENVIRONMENT.production;
};

export default ENVIRONMENT;
```

### Step 3: Update Module Imports

Update each module to import the API configuration:

```javascript
// In src/modules/news.js
import { API_KEYS, RATE_LIMITS } from '../config/api-keys.js';

// In src/modules/satellite.js  
import { API_KEYS, CACHE_CONFIG } from '../config/api-keys.js';
```

### Step 4: Security Setup

1. **Create `.gitignore`** (if not exists):
```
# API Keys and Secrets
config/api-keys.js
.env
*.env

# Dependencies
node_modules/

# Logs
*.log
logs/

# OS Files
.DS_Store
Thumbs.db
```

2. **Create `config/api-keys.example.js`**:
```javascript
// Example API keys file - copy to api-keys.js and add real keys
export const API_KEYS = {
    newsApi: {
        key: 'your_news_api_key_here'
    },
    nasa: {
        key: 'your_nasa_api_key_here'
    }
    // ... etc
};
```

## 🔒 Security Best Practices

### 1. Never Commit API Keys
- Add `config/api-keys.js` to `.gitignore`
- Use environment variables in production
- Rotate keys regularly

### 2. Rate Limiting
- Implement client-side rate limiting
- Cache responses to reduce API calls
- Monitor API usage dashboards

### 3. Error Handling
- Graceful fallbacks when APIs are unavailable
- User-friendly error messages
- Automatic retry with exponential backoff

### 4. Production Deployment
- Use environment variables for API keys
- Implement server-side proxy for sensitive APIs
- Enable CORS restrictions
- Use HTTPS for all API calls

## 📊 Monitoring and Usage

### API Usage Tracking
```javascript
// Example usage tracking
const trackApiUsage = (apiName, endpoint, responseTime) => {
    console.log(`API: ${apiName}, Endpoint: ${endpoint}, Time: ${responseTime}ms`);
    // Send to analytics service
};
```

### Error Monitoring
```javascript
// Example error tracking
const trackApiError = (apiName, error, context) => {
    console.error(`API Error: ${apiName}`, error, context);
    // Send to error tracking service
};
```

## 🚀 Testing

### 1. Test with Demo Keys
Use provided demo keys to test functionality before purchasing premium access.

### 2. Mock Data Fallback
Ensure the website works without API keys by using mock data during development.

### 3. API Health Checks
Implement automated testing of API endpoints.

## 📞 Support

### News API Support
- Documentation: [https://newsapi.org/docs](https://newsapi.org/docs)
- Email: support@newsapi.org

### NASA API Support  
- Documentation: [https://api.nasa.gov/](https://api.nasa.gov/)
- GitHub: [https://github.com/nasa/api-docs](https://github.com/nasa/api-docs)

### ESA Sentinel Hub Support
- Documentation: [https://docs.sentinel-hub.com/](https://docs.sentinel-hub.com/)
- Forum: [https://forum.sentinel-hub.com/](https://forum.sentinel-hub.com/)

## 🔄 Updates and Maintenance

### Regular Tasks
1. **Monthly**: Review API usage and costs
2. **Quarterly**: Rotate API keys for security
3. **As Needed**: Update rate limits based on usage patterns
4. **Version Updates**: Check for API version updates and deprecations

### Backup Plans
- Always have fallback data sources
- Implement graceful degradation
- Monitor API status pages
- Have emergency contact information

---

**Last Updated**: July 25, 2025  
**Version**: 1.0.0  
**Maintainer**: Gaza War Documentation Team
