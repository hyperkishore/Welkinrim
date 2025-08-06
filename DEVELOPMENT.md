# WelkinRim Website - Development Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.6+ (for local server)
- Modern web browser
- Git (for version control)

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd welkinrim
   ```

2. **Start the local server:**
   ```bash
   # Using Python (recommended)
   python3 serve.py
   
   # Or using npm scripts
   npm run start
   
   # Custom port
   python3 serve.py 3000
   ```

3. **Open in browser:**
   - Server will automatically open http://localhost:8000
   - If not, manually navigate to the URL shown in terminal

## 📁 Project Structure

```
welkinrim/
├── index.html              # Main homepage
├── styles.css              # Global styles and responsive design
├── scripts.js              # Main JavaScript functionality
├── serve.py                # Local development server
├── package.json            # Project metadata and scripts
├── .gitignore              # Git ignore rules
├── README.md               # Project overview and documentation
├── DEVELOPMENT.md          # This development guide
├── site-architecture.md    # Information architecture
├── content-strategy.md     # Content strategy and messaging
├── assets/                 # Images, icons, and media files
│   └── placeholder-info.txt
├── products/               # Product catalog pages
│   ├── commercial-motors.html
│   ├── product-pages.css
│   └── product-catalog.js
├── tools/                  # Interactive tools
│   ├── calculator.html
│   ├── calculator.js
│   └── tools.css
├── resources/              # Technical documentation
└── motordrive/             # Motor control firmware (separate project)
```

## 🛠️ Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Edit HTML, CSS, or JavaScript files
   - Server will automatically serve updated files (no restart needed)
   - Refresh browser to see changes

3. **Test your changes:**
   - Check functionality in multiple browsers
   - Test responsive design on different screen sizes
   - Validate HTML and check for JavaScript errors

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push to repository:**
   ```bash
   git push origin feature/your-feature-name
   ```

### File Organization

- **Global styles:** Add to `styles.css`
- **Page-specific styles:** Create separate CSS files in relevant directories
- **JavaScript functionality:** Add to `scripts.js` or create separate files for complex features
- **New pages:** Follow the existing structure and naming conventions

## 🎨 Design System

### Colors
- **Primary Blue:** `#0066cc`
- **Dark Blue:** `#0052a3` 
- **Light Blue:** `#e3f2fd`
- **Background:** `#f8f9ff`
- **Text:** `#1a1a1a`
- **Secondary Text:** `#666`
- **Border:** `#e9ecef`

### Typography
- **Font Family:** Inter (loaded from Google Fonts)
- **Headings:** 600-700 weight
- **Body Text:** 400-500 weight
- **Small Text:** 300-400 weight

### Breakpoints
- **Mobile:** `< 768px`
- **Tablet:** `768px - 1024px`
- **Desktop:** `> 1024px`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Homepage loads correctly
- [ ] Motor selector tool functions
- [ ] Product pages display properly
- [ ] Calculator performs calculations
- [ ] Forms validate input
- [ ] Responsive design works on mobile
- [ ] Navigation functions on all pages
- [ ] Links work correctly

### Browser Testing
Test in these browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance Testing
- Check page load speeds
- Verify image optimization
- Test on slower connections
- Monitor JavaScript performance

## 🐛 Debugging

### Common Issues

1. **Images not loading:**
   - Check file paths in HTML/CSS
   - Ensure images exist in assets directory
   - Verify file extensions match

2. **JavaScript errors:**
   - Open browser Developer Tools (F12)
   - Check Console tab for errors
   - Verify function names and syntax

3. **CSS not applying:**
   - Check CSS syntax
   - Verify selectors are correct
   - Clear browser cache (Ctrl/Cmd + F5)

4. **Server not starting:**
   - Check if port is already in use
   - Try different port: `python3 serve.py 3000`
   - Verify Python 3 is installed

### Development Tools
- **Browser DevTools:** F12 or Ctrl/Cmd + Shift + I
- **Mobile testing:** Browser device simulation
- **Performance:** Lighthouse in Chrome DevTools

## 📱 Responsive Design

### Mobile-First Approach
1. Design for mobile screens first
2. Use `min-width` media queries for larger screens
3. Test on actual devices when possible

### Key Considerations
- Touch-friendly button sizes (minimum 44px)
- Readable text without zooming (16px minimum)
- Horizontal scrolling should be avoided
- Forms should be easy to use on mobile

## 🚀 Deployment

### Preparation
1. Minify CSS and JavaScript for production
2. Optimize images (WebP format recommended)
3. Test all functionality one final time
4. Update any hardcoded URLs

### Static Hosting
This website can be deployed to:
- **Netlify:** Drag and drop deployment
- **Vercel:** Git-based deployment
- **GitHub Pages:** Direct from repository
- **AWS S3:** Static website hosting

### Custom Server
- Use Nginx or Apache for production
- Set up SSL certificate (Let's Encrypt recommended)
- Configure proper caching headers
- Set up CDN for global performance

## 🔧 Advanced Features

### Adding New Interactive Tools
1. Create HTML file in `tools/` directory
2. Add JavaScript functionality
3. Include in main navigation
4. Test calculations thoroughly

### Extending Product Catalog
1. Add new products to JavaScript data
2. Create product detail pages
3. Update filtering options
4. Add comparison functionality

### Performance Optimization
- Implement image lazy loading
- Add service worker for caching
- Minify and compress assets
- Use modern image formats (WebP, AVIF)

## 📊 Analytics

### Recommended Tracking
- Page views and user behavior
- Calculator tool usage
- Quote request conversions
- Mobile vs desktop usage
- Popular product categories

### Implementation
Add Google Analytics or similar tracking:
```html
<!-- Add to <head> section -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🆘 Support

### Getting Help
- Check this documentation first
- Search existing GitHub issues
- Create new issue with detailed description
- Include browser, OS, and steps to reproduce

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Wait for review and approval