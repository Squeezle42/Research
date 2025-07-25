# Gaza War Documentation Website

## Project Overview

A comprehensive, interactive website documenting the Gaza conflict with real-time news integration, satellite imagery timelines, interactive maps, and credible source attribution.

## Features

- **Interactive Timeline**: Visual timeline of key events with satellite imagery
- **Interactive Maps**: Real-time mapping with geographical data
- **News Integration**: Credible news sources with proper attribution
- **Satellite Imagery**: Time-lapse satellite imagery showing conflict progression
- **Modular Architecture**: Clean, maintainable code structure
- **Responsive Design**: Mobile-first responsive design
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized loading and caching

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Maps**: Leaflet.js with OpenStreetMap
- **Charts/Timeline**: D3.js
- **Satellite Imagery**: NASA Earth API, ESA Sentinel Hub
- **News APIs**: BBC, Reuters, AP News APIs
- **Build Tools**: Webpack, Babel, ESLint
- **Styling**: SCSS/Sass
- **Testing**: Jest for unit tests

## Project Structure

```
GazaWarDocumentation/
├── README.md                 # This file
├── package.json             # Dependencies and scripts
├── webpack.config.js        # Build configuration
├── .eslintrc.js            # Linting rules
├── .gitignore              # Git ignore rules
├── index.html              # Main entry point
├── src/                    # Source code
│   ├── main.js            # Application entry point
│   ├── modules/           # Modular components
│   │   ├── timeline.js    # Timeline component
│   │   ├── map.js         # Interactive map component
│   │   ├── news.js        # News integration component
│   │   ├── satellite.js   # Satellite imagery component
│   │   ├── sources.js     # Source attribution component
│   │   └── utils.js       # Utility functions
│   ├── styles/            # Stylesheets
│   │   ├── main.scss      # Main stylesheet
│   │   ├── components/    # Component-specific styles
│   │   ├── layouts/       # Layout styles
│   │   └── variables.scss # SCSS variables
│   └── data/              # Static data files
│       ├── events.json    # Timeline events
│       ├── locations.json # Geographic data
│       └── sources.json   # News sources metadata
├── assets/                # Static assets
│   ├── images/           # Images and icons
│   └── satellite/        # Satellite imagery cache
├── docs/                 # Documentation
│   ├── DEVELOPMENT.md    # Development guide
│   ├── DEPLOYMENT.md     # Deployment instructions
│   └── API.md           # API documentation
└── tests/               # Test files
    ├── unit/           # Unit tests
    └── integration/    # Integration tests
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser
- API keys for:
  - NASA Earth API
  - ESA Sentinel Hub
  - News APIs (BBC, Reuters, AP)

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Add your API keys to `.env` file

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open browser to `http://localhost:3000`

## Development Guidelines

### Code Style
- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable names
- Document all functions with JSDoc
- Write unit tests for new features

### Modular Architecture
- Each feature is a separate module
- Use dependency injection
- Implement pub/sub pattern for component communication
- Keep modules loosely coupled

### Performance
- Lazy load images and satellite data
- Implement caching strategies
- Minimize API calls
- Use requestAnimationFrame for animations

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## Data Sources and Attribution

### News Sources
- **BBC News**: Real-time conflict reporting
- **Reuters**: International news coverage
- **Associated Press**: Breaking news and analysis
- **Al Jazeera**: Regional perspective and coverage
- **The Times**: International analysis

### Satellite Imagery
- **NASA Earth Observing System**: Landsat and MODIS imagery
- **ESA Sentinel Program**: Copernicus satellite data
- **Planet Labs**: High-resolution commercial imagery
- **Maxar Technologies**: WorldView satellite imagery

### Geographic Data
- **OpenStreetMap**: Base map tiles and geographic data
- **Natural Earth**: Administrative boundaries
- **UN OCHA**: Humanitarian data and boundaries

### Geneva Convention Sources
- **International Committee of the Red Cross (ICRC)**: Official Geneva Convention texts
- **UN Human Rights Office**: Violation reports and documentation
- **International Court of Justice**: Legal proceedings and rulings

## License and Ethics

This project is created for educational and humanitarian documentation purposes. All news sources, satellite imagery, and data are properly attributed and used under fair use guidelines.

### Ethical Considerations
- Accurate representation of events
- Balanced reporting from multiple sources
- Respect for victims and affected communities
- Transparent source attribution
- Regular fact-checking and verification

## Contributing

Please read `docs/DEVELOPMENT.md` for contribution guidelines.

## Support

For questions or issues, please create an issue in the project repository.
