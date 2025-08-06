# 🚀 WelkinRim Website - Quick Start Guide

## Instant Setup (30 seconds)

### Option 1: Using Python (Recommended)
```bash
# Navigate to project directory
cd /Users/kishore/Desktop/Claude-experiments/welkinrim

# Start the server
python3 serve.py

# That's it! Website will open automatically at http://localhost:8000
```

### Option 2: Using Built-in Python Server
```bash
# Navigate to project directory
cd /Users/kishore/Desktop/Claude-experiments/welkinrim

# Start simple HTTP server
python3 -m http.server 8000

# Open http://localhost:8000 in your browser
```

### Option 3: Using NPM Scripts
```bash
# Navigate to project directory
cd /Users/kishore/Desktop/Claude-experiments/welkinrim

# Start server (requires npm/node)
npm run start
```

## ✅ What You Get

- **Homepage**: Modern landing page with motor selector tool
- **Product Catalog**: Detailed commercial motors page with filtering
- **Performance Calculator**: Advanced engineering tool with motor recommendations
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Interactive Features**: Motor selector, calculator, comparison tools

## 🔧 Development Commands

```bash
# Different ports
python3 serve.py 3000     # Custom port
python3 serve.py 8080     # Alternative port

# Check Git status
git status
git log --oneline

# View project structure
tree                      # If tree is installed
ls -la                    # Basic file listing
```

## 📁 Key Files to Explore

- `index.html` - Main homepage
- `tools/calculator.html` - Performance calculator
- `products/commercial-motors.html` - Product catalog
- `styles.css` - Main stylesheet
- `scripts.js` - Interactive functionality

## 🌐 Live Testing

The website includes:
- ✅ Responsive design (test on mobile)
- ✅ Interactive motor selector
- ✅ Advanced performance calculator
- ✅ Product filtering and comparison
- ✅ Professional styling and animations
- ✅ Cross-browser compatibility

## 🆘 Quick Troubleshooting

**Server won't start?**
```bash
# Check if port is in use
lsof -ti:8000
kill <process-id>        # If needed

# Try different port
python3 serve.py 3000
```

**Website not loading?**
- Check browser console (F12)
- Try hard refresh (Ctrl/Cmd + F5)
- Verify server is running in terminal

**Want to make changes?**
- Edit any HTML/CSS/JS files
- Save the file
- Refresh browser to see changes
- No server restart needed!

---
🎉 **You're all set!** The WelkinRim website is now running locally with full version control.