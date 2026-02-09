// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const nav = document.querySelector('.nav');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('nav-menu-active');
            navToggle.classList.toggle('nav-toggle-active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('nav-menu-active');
                navToggle.classList.remove('nav-toggle-active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // Sticky nav + scroll progress (rAF-throttled for performance)
    let lastScroll = 0;
    let scrollTicking = false;

    function onScroll() {
        const currentScroll = window.pageYOffset;

        // Nav background
        if (nav) {
            if (currentScroll > 50) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
            // Hide/show nav on scroll direction
            if (currentScroll > lastScroll && currentScroll > 200) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }
        }

        // Scroll progress indicator
        const scrollProgress = document.getElementById('scroll-progress');
        if (scrollProgress) {
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? (currentScroll / scrollHeight) * 100 : 0;
            scrollProgress.style.width = progress + '%';
        }

        // Back to top button
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            if (currentScroll > window.innerHeight) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Active section highlighting
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (currentScroll >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('nav-link-active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('nav-link-active');
            }
        });

        lastScroll = currentScroll;
        scrollTicking = false;
    }

    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            requestAnimationFrame(onScroll);
            scrollTicking = true;
        }
    });

    // Back to top click handler
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
    // Use global motorDatabase (loaded from motor-database.js)
    const motors = (typeof motorDatabase !== 'undefined' ? motorDatabase : []).map(m => ({
        name: m.model,
        series: m.series || 'Commercial',
        thrust: (m.maxThrust / 1000).toFixed(1) + 'kg',
        power: m.maxPower ? (m.maxPower >= 1000 ? (m.maxPower / 1000).toFixed(1) + 'kW' : m.maxPower + 'W') : 'N/A',
        weight: m.weight >= 1000 ? (m.weight / 1000).toFixed(1) + 'kg' : m.weight + 'g',
        applications: m.applications || [],
        payloadRange: m.payloadRange || '0-1',
        efficiency: ((m.efficiency || 0.85) * 100).toFixed(0) + '%',
        price: '$' + (m.price || 0),
        image: m.image || 'assets/commercial-motor.svg',
        brand: m.brand || 'WelkinRim',
        id: m.id
    }));

    // Filter by application and payload
    let filtered = motors.filter(motor => {
        const appMatch = motor.applications.includes(application);
        const payloadMatch = motor.payloadRange === payload;
        return appMatch && payloadMatch;
    });

    // Fallback: match by payload only
    if (filtered.length === 0) {
        filtered = motors.filter(motor => motor.payloadRange === payload);
    }

    // Fallback: match by application only
    if (filtered.length === 0) {
        filtered = motors.filter(motor => motor.applications.includes(application));
    }

    // Prioritize WelkinRim motors
    filtered.sort((a, b) => {
        if (a.brand === 'WelkinRim' && b.brand !== 'WelkinRim') return -1;
        if (a.brand !== 'WelkinRim' && b.brand === 'WelkinRim') return 1;
        return parseFloat(b.efficiency) - parseFloat(a.efficiency);
    });

    return filtered.slice(0, 3);
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
    // Open motor detail on product page or matchmaker
    window.location.href = 'motor-matchmaker.html';
}

function requestQuote(motorName) {
    window.location.href = 'contact.html?motor=' + encodeURIComponent(motorName) + '&type=quote';
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

// ==========================================
// SCROLL REVEAL SYSTEM
// ==========================================

class ScrollReveal {
    constructor(options = {}) {
        this.threshold = options.threshold || 0.1;
        this.rootMargin = options.rootMargin || '0px 0px -60px 0px';
        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
            threshold: this.threshold,
            rootMargin: this.rootMargin
        });
    }

    handleIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.dataset.delay || 0;
                setTimeout(() => {
                    el.classList.add('reveal-active');
                    el.classList.add('animate-in');
                }, parseInt(delay));
                this.observer.unobserve(el);
            }
        });
    }

    observe(elements) {
        if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
        }
        elements.forEach(el => this.observer.observe(el));
    }
}

// Legacy observer for backward compatibility
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            entry.target.classList.add('reveal-active');
        }
    });
}, observerOptions);

// Initialize ScrollReveal
document.addEventListener('DOMContentLoaded', function() {
    const sr = new ScrollReveal();

    // Observe all revealable elements
    sr.observe('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');

    // Observe card elements
    const animateElements = document.querySelectorAll(
        '.value-card, .category-card, .product-card, .industry-card, .resource-item, .credential-item, .testimonial-card'
    );
    animateElements.forEach(el => observer.observe(el));
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
        return;
    }
    // Show inline success message
    const btn = event && event.target;
    if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Subscribed!';
        btn.disabled = true;
        btn.style.backgroundColor = '#22c55e';
        setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
            btn.style.backgroundColor = '';
        }, 3000);
    }
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
    // Content is loaded statically or via shared.js
}

// Scroll Progress Indicator - handled by unified scroll handler above

// Counter Animation for Stats
function animateCounters() {
    const counters = document.querySelectorAll('.hero-stat-number');

    counters.forEach(counter => {
        const text = counter.textContent;
        const hasPlus = text.includes('+');
        const hasPercent = text.includes('%');
        const hasComma = text.includes(',');

        let target = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (hasComma) target = parseFloat(text.replace(/,/g, ''));

        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                let displayValue = Math.floor(current);
                if (hasComma && displayValue >= 1000) {
                    displayValue = displayValue.toLocaleString();
                }
                counter.textContent = displayValue + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = text;
            }
        };

        updateCounter();
    });
}

// Trigger counter animation when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        heroObserver.observe(heroStats);
    }
});

// ==========================================
// BUTTON RIPPLE EFFECT
// ==========================================
function initRipple() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .btn-primary, .nav-cta');
        if (!btn) return;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    });
}

// ==========================================
// MAGNETIC HOVER ON BUTTONS
// ==========================================
function initMagneticButtons() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) return;

    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-large, .nav-cta');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ==========================================
// 3D TILT EFFECT ON CARDS
// ==========================================
function initCardTilt() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) return;

    const tiltCards = document.querySelectorAll('.product-card, .category-card, .value-card, .testimonial-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -4;
            const rotateY = (x - centerX) / centerX * 4;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    loadDynamicContent();
    initCardTilt();
    initRipple();
    initMagneticButtons();

    // Set up progressive enhancement
    document.body.classList.add('js-enabled');

    // Motor selector button
    const findMotorsBtn = document.getElementById('find-motors-btn');
    if (findMotorsBtn) {
        findMotorsBtn.addEventListener('click', findMotors);
    }

    // Add testimonial cards to animation observer
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(el => observer.observe(el));

    console.log('WelkinRim website initialized successfully');
});