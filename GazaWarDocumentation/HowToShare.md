# How to Share Your Project with GitHub Pages

This guide will walk you through setting up your Gaza War Documentation & Game Theory Analysis project on GitHub Pages so you can share it with your brother and others.

## 🎯 Overview

GitHub Pages is a free hosting service that turns your repository into a live website. Your project will be accessible at:
```
https://yourusername.github.io/Research/GazaWarDocumentation/
```

## 📋 Prerequisites

- [x] GitHub account (you already have this: Squeezle42)
- [x] Git repository with your project (you already have this)
- [x] Project files ready (all your files are complete)

## 🚀 Step-by-Step Setup

### Step 1: Push Your Project to GitHub

1. **Open Terminal/PowerShell** in your project directory:
   ```powershell
   cd "c:\Users\Squeezle\July2025Apps\Research"
   ```

2. **Check your current status**:
   ```powershell
   git status
   git branch
   ```

3. **Add all your files** (if not already committed):
   ```powershell
   git add .
   git commit -m "Complete Gaza War Documentation with Game Theory Analysis"
   ```

4. **Push to GitHub**:
   ```powershell
   git push origin main
   ```

### Step 2: Enable GitHub Pages

1. **Go to your GitHub repository**:
   - Navigate to: `https://github.com/Squeezle42/Research`

2. **Access Settings**:
   - Click the **"Settings"** tab (top right of repository)

3. **Find Pages Section**:
   - Scroll down to **"Pages"** in the left sidebar
   - Click on **"Pages"**

4. **Configure Source**:
   - Under **"Source"**, select **"Deploy from a branch"**
   - Choose **"main"** branch
   - Select **"/ (root)"** folder
   - Click **"Save"**

5. **Wait for Deployment**:
   - GitHub will show a message: "Your site is ready to be published"
   - After 1-2 minutes, it will show: "Your site is live at..."

### Step 3: Access Your Live Site

Your project will be available at:
```
https://squeezle42.github.io/Research/GazaWarDocumentation/
```

**Game Theory Analysis page**:
```
https://squeezle42.github.io/Research/GazaWarDocumentation/game-theory-analysis.html
```

## 🔧 Project-Specific Configuration

### API Keys for GitHub Pages

Your project uses external APIs. For GitHub Pages deployment:

1. **Create a production API keys file**:
   ```powershell
   cd GazaWarDocumentation
   copy config\api-keys.example.js config\api-keys-production.js
   ```

2. **Edit the production file** with working API keys:
   ```javascript
   // config/api-keys-production.js
   window.CONFIG = {
       NEWS_API_KEY: 'your-actual-newsapi-key',
       NASA_API_KEY: 'DEMO_KEY', // NASA allows DEMO_KEY for testing
       ESA_API_KEY: 'your-esa-key',
       MAPBOX_API_KEY: 'your-mapbox-key',
       GUARDIAN_API_KEY: 'your-guardian-key'
   };
   ```

3. **Update your HTML files** to use production keys:
   - In `index.html` and `game-theory-analysis.html`
   - Change: `<script src="config/api-keys.js"></script>`
   - To: `<script src="config/api-keys-production.js"></script>`

### Custom Domain (Optional)

If you want a custom domain like `gazaanalysis.com`:

1. **Buy a domain** from any registrar (GoDaddy, Namecheap, etc.)

2. **Add CNAME file** to your repository root:
   ```powershell
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push origin main
   ```

3. **Configure DNS** at your registrar:
   - Add CNAME record pointing to: `squeezle42.github.io`

## 🔐 Security & Privacy

### API Key Security

**⚠️ Important**: Your `.gitignore` file already protects your private API keys:

```gitignore
# API Keys and sensitive configuration
config/api-keys.js
*.env
.env.*
```

**For GitHub Pages**, you have two options:

#### Option A: Use Demo/Free Tier Keys
- **News API**: Free tier (1,000 requests/day)
- **NASA**: Use `DEMO_KEY` (unlimited with rate limiting)
- **Mapbox**: Free tier (50,000 map loads/month)

#### Option B: GitHub Secrets (Advanced)
1. Go to your repository **Settings > Secrets and variables > Actions**
2. Add repository secrets for each API key
3. Use GitHub Actions to inject them during deployment

### Making Repository Private

If you want to share only with specific people:

1. **Go to Settings > General**
2. **Scroll to "Danger Zone"**
3. **Click "Change repository visibility"**
4. **Select "Private"**
5. **Add collaborators**: Settings > Collaborators > Add people

**Note**: GitHub Pages on private repos requires GitHub Pro ($4/month)

## 📤 Sharing with Your Brother

### Method 1: Public Repository
- **URL**: `https://squeezle42.github.io/Research/GazaWarDocumentation/`
- **Repository**: `https://github.com/Squeezle42/Research`
- Anyone can view the site and source code

### Method 2: Private Repository + Collaboration
1. **Make repository private** (see above)
2. **Add your brother as collaborator**:
   - Settings > Collaborators
   - Enter his GitHub username
   - Choose "Write" access level

### Method 3: Share Source Code Only
- **Download ZIP**: GitHub repository > Code > Download ZIP
- **Send files directly** via email/file sharing
- **He can run locally** using: `python -m http.server 8080`

## 🚀 Deployment Checklist

Before going live, verify:

- [ ] All files committed and pushed to GitHub
- [ ] API keys configured (production versions)
- [ ] `.gitignore` protecting sensitive files
- [ ] All links working (relative paths)
- [ ] Images and assets loading correctly
- [ ] Game theory analysis page functional
- [ ] Mobile responsiveness tested

## 🔄 Updating Your Live Site

To update your live GitHub Pages site:

1. **Make changes** to your local files
2. **Commit and push**:
   ```powershell
   git add .
   git commit -m "Update analysis with new data"
   git push origin main
   ```
3. **Wait 1-2 minutes** for GitHub Pages to rebuild
4. **Refresh your browser** to see changes

## 🐛 Troubleshooting

### Common Issues

**Site not loading?**
- Check: Repository is public OR you have GitHub Pro
- Check: GitHub Pages is enabled in Settings
- Wait: Initial deployment takes 5-10 minutes

**API errors on live site?**
- Check: API keys are valid in production config file
- Check: CORS policies allow your domain
- Use browser dev tools (F12) to see error messages

**Game theory page not working?**
- Check: MathJax is loading from CDN
- Check: JavaScript modules are using relative paths
- Check: All dependencies are available

**Styling issues?**
- Check: CSS files are referenced with relative paths
- Check: Font Awesome and other CDN resources loading
- Test: With browser dev tools to identify missing resources

### Getting Help

1. **GitHub Pages Status**: https://www.githubstatus.com/
2. **GitHub Docs**: https://docs.github.com/en/pages
3. **Your Repository Issues**: Create issues for bugs
4. **Browser Dev Tools**: F12 to debug JavaScript/CSS issues

## 🎯 Quick Commands Summary

```powershell
# Navigate to project
cd "c:\Users\Squeezle\July2025Apps\Research"

# Check status
git status

# Add and commit all changes
git add .
git commit -m "Ready for GitHub Pages deployment"

# Push to GitHub
git push origin main

# Test locally anytime
cd GazaWarDocumentation
python -m http.server 8080
# Then visit: http://localhost:8080
```

## 🌟 Next Steps

Once your site is live:

1. **Share the URL** with your brother and others
2. **Add analytics** (Google Analytics) to track usage
3. **Create documentation** for contributors
4. **Set up automated testing** with GitHub Actions
5. **Add more interactive features** based on feedback

---

**Your live site will be at**: `https://squeezle42.github.io/Research/GazaWarDocumentation/`

**Questions?** Create an issue in your GitHub repository or refer to the troubleshooting section above.

**Happy sharing!** 🚀
