// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('nav-menu-active');
            navToggle.classList.toggle('nav-toggle-active');
        });
    }
});

// Motor Selector Tool
function findMotors() {
    const application = document.getElementById('application').value;
    const payload = document.getElementById('payload').value;
    const flightTime = document.getElementById('flight-time').value;
    
    if (!application || !payload || !flightTime) {
        alert('Please fill in all fields to get motor recommendations');
        return;
    }
    
    // Motor recommendation logic
    const recommendations = getMotorRecommendations(application, payload, flightTime);
    displayResults(recommendations);
}

function getMotorRecommendations(application, payload, flightTime) {
    // Motor database (in production, this would come from an API)
    const motors = [
        {
            name: 'WR1806-2300',
            series: 'Micro',
            thrust: '2.1kg',
            power: '380W',
            weight: '28g',
            applications: ['racing', 'photography'],
            payloadRange: '0-1',
            efficiency: '94%',
            price: '$89',
            image: 'assets/wr1806-motor.jpg'
        },
        {
            name: 'WR2212-1000',
            series: 'Commercial',
            thrust: '8.5kg',
            power: '750W',
            weight: '135g',
            applications: ['commercial', 'photography', 'inspection'],
            payloadRange: '1-5',
            efficiency: '96%',
            price: '$149',
            image: 'assets/wr2212-motor.jpg'
        },
        {
            name: 'WR2815-900',
            series: 'Commercial',
            thrust: '25.4kg',
            power: '3.2kW',
            weight: '485g',
            applications: ['commercial', 'agriculture', 'inspection'],
            payloadRange: '5-15',
            efficiency: '98%',
            price: '$389',
            image: 'assets/wr2815-motor.jpg'
        },
        {
            name: 'WR4020-400',
            series: 'Industrial',
            thrust: '45.2kg',
            power: '6.8kW',
            weight: '1.2kg',
            applications: ['agriculture', 'inspection', 'research'],
            payloadRange: '15+',
            efficiency: '99%',
            price: '$749',
            image: 'assets/wr4020-motor.jpg'
        }
    ];
    
    // Filter motors based on criteria
    let filtered = motors.filter(motor => {
        return motor.applications.includes(application) && 
               motor.payloadRange === payload;
    });
    
    // If no exact matches, provide similar alternatives
    if (filtered.length === 0) {
        filtered = motors.filter(motor => motor.payloadRange === payload);
    }
    
    // Sort by efficiency (best first)
    filtered.sort((a, b) => parseFloat(b.efficiency) - parseFloat(a.efficiency));
    
    return filtered.slice(0, 3); // Return top 3 recommendations
}

function displayResults(motors) {
    const resultsContainer = document.getElementById('selector-results');
    
    if (motors.length === 0) {
        resultsContainer.innerHTML = `
            <div class="results-message">
                <h3>No exact matches found</h3>
                <p>Please contact our technical team for custom motor recommendations.</p>
                <a href="contact.html" class="btn btn-primary">Contact Engineering</a>
            </div>
        `;
    } else {
        const resultsHTML = `
            <div class="results-header">
                <h3>Recommended Motors</h3>
                <p>Based on your requirements, here are our top recommendations:</p>
            </div>
            <div class="results-grid">
                ${motors.map(motor => `
                    <div class="result-card">
                        <div class="result-image">
                            <img src="${motor.image}" alt="${motor.name}" loading="lazy">
                        </div>
                        <div class="result-info">
                            <h4 class="result-name">${motor.name}</h4>
                            <p class="result-series">${motor.series} Series</p>
                            <div class="result-specs">
                                <div class="result-spec">
                                    <span class="spec-label">Thrust</span>
                                    <span class="spec-value">${motor.thrust}</span>
                                </div>
                                <div class="result-spec">
                                    <span class="spec-label">Power</span>
                                    <span class="spec-value">${motor.power}</span>
                                </div>
                                <div class="result-spec">
                                    <span class="spec-label">Weight</span>
                                    <span class="spec-value">${motor.weight}</span>
                                </div>
                                <div class="result-spec">
                                    <span class="spec-label">Efficiency</span>
                                    <span class="spec-value">${motor.efficiency}</span>
                                </div>
                            </div>
                            <div class="result-price">${motor.price}</div>
                            <div class="result-actions">
                                <button class="btn btn-outline btn-small" onclick="viewSpecs('${motor.name}')">View Specs</button>
                                <button class="btn btn-primary btn-small" onclick="requestQuote('${motor.name}')">Get Quote</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="results-footer">
                <p>Need help choosing? <a href="contact.html">Contact our technical team</a> for personalized recommendations.</p>
            </div>
        `;
        
        resultsContainer.innerHTML = resultsHTML;
    }
    
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Placeholder functions for motor actions
function viewSpecs(motorName) {
    // In production, this would navigate to the specific motor page
    window.open(`products/motors/${motorName.toLowerCase().replace('-', '')}.html`, '_blank');
}

function requestQuote(motorName) {
    // In production, this would open a quote form with pre-filled motor info
    const subject = encodeURIComponent(`Quote Request for ${motorName}`);
    const body = encodeURIComponent(`Hi WelkinRim team,\n\nI'm interested in getting a quote for the ${motorName} motor.\n\nPlease provide pricing and availability information.\n\nThank you!`);
    window.open(`mailto:sales@welkinrim.com?subject=${subject}&body=${body}`);
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.value-card, .category-card, .product-card, .industry-card, .resource-card');
    
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// Form validation and enhancement
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    document.addEventListener('DOMContentLoaded', function() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    });
}

// Add loading states for interactive elements
function addLoadingState(element) {
    element.classList.add('loading');
    element.disabled = true;
    
    const originalText = element.textContent;
    element.textContent = 'Loading...';
    
    return () => {
        element.classList.remove('loading');
        element.disabled = false;
        element.textContent = originalText;
    };
}

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // In production, you might want to send this to an error tracking service
    // trackError(e.error);
});

// Newsletter signup (if implemented)
function subscribeNewsletter(email) {
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // In production, this would make an API call
    alert('Thank you for subscribing! You will receive updates about our latest products and innovations.');
}

// Analytics tracking helpers (for Google Analytics, etc.)
function trackEvent(category, action, label, value) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
    }
}

// Track important user interactions
document.addEventListener('DOMContentLoaded', function() {
    // Track motor selector usage
    const selectorForm = document.querySelector('.selector-form');
    if (selectorForm) {
        selectorForm.addEventListener('submit', function() {
            trackEvent('Tools', 'Motor Selector', 'Used');
        });
    }
    
    // Track CTA clicks
    const ctaButtons = document.querySelectorAll('.btn-primary, .nav-cta');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('CTA', 'Click', this.textContent.trim());
        });
    });
});

// Accessibility improvements
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard navigation for custom elements
    const selectElements = document.querySelectorAll('.form-select');
    
    selectElements.forEach(select => {
        select.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.click();
            }
        });
    });
    
    // Add focus indicators for keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
});

// Dynamic content loading for better performance
function loadDynamicContent() {
    // This could load testimonials, case studies, or other dynamic content
    // In production, this would fetch from an API
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    loadDynamicContent();
    
    // Set up progressive enhancement
    document.body.classList.add('js-enabled');
    
    console.log('WelkinRim website initialized successfully');
});