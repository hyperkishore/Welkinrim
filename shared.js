// ── Google Analytics 4 ─────────────────────────────────
// Replace G-XXXXXXXXXX with your actual GA4 Measurement ID
// Get yours at: https://analytics.google.com → Admin → Data Streams → Measurement ID
(function initGA4() {
    var GA4_ID = 'G-XXXXXXXXXX'; // ← REPLACE with your real Measurement ID
    if (GA4_ID === 'G-XXXXXXXXXX') return; // Skip if not configured
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA4_ID, { send_page_view: true });
})();

// ── Global Analytics Helpers ───────────────────────────
window.wrTrack = function(eventName, params) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params || {});
    }
};

// Auto-track Formspree form submissions as conversions
document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form && form.action && form.action.indexOf('formspree.io') !== -1) {
        var source = '';
        var srcEl = form.querySelector('input[name="_source"]');
        if (srcEl) source = srcEl.value;
        wrTrack('generate_lead', {
            event_category: 'Form',
            event_label: source || 'unknown',
            form_source: source,
            page: window.location.pathname
        });
    }
});

// Auto-track outbound link clicks
document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href]');
    if (link && link.hostname && link.hostname !== window.location.hostname) {
        wrTrack('outbound_click', {
            event_category: 'Outbound',
            event_label: link.href,
            url: link.href
        });
    }
});

// Shared Navigation & Footer - WelkinRim
(function() {
    'use strict';

    // Detect relative path prefix based on page location
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/products/') || path.includes('/tools/') || path.includes('/applications/') || path.includes('/compare/')) {
            return '../';
        }
        return '';
    }

    const base = getBasePath();

    // Determine active page
    function getActivePage() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('product') || path.includes('micro-motor') || path.includes('industrial-motor') || path.includes('commercial-motor') || path.includes('defence-motor') || path.includes('agriculture-motor') || path.includes('propulsion') || path.includes('configurator')) return 'products';
        if (path.includes('calculator') || path.includes('resource') || path.includes('case-stud') || path.includes('certification') || path.includes('datasheet')) return 'resources';
        if (path.includes('matchmaker')) return 'matchmaker';
        if (path.includes('defence') || path.includes('agriculture') || path.includes('delivery') || path.includes('inspection') || path.includes('racing')) return 'solutions';
        if (path.includes('support') || path.includes('faq') || path.includes('warranty')) return 'support';
        if (path.includes('about') || path.includes('career') || path.includes('news') || path.includes('partner')) return 'company';
        if (path.includes('contact')) return 'contact';
        return '';
    }

    const activePage = getActivePage();

    function activeClass(page) {
        return activePage === page ? ' nav-link-active' : '';
    }

    // Inject Navigation
    const navPlaceholder = document.getElementById('main-nav');
    if (navPlaceholder) {
        navPlaceholder.className = 'nav';
        navPlaceholder.setAttribute('role', 'navigation');
        navPlaceholder.setAttribute('aria-label', 'Main navigation');
        navPlaceholder.innerHTML = `
            <!-- Scroll Progress Indicator -->
            <div class="scroll-progress" id="scroll-progress"></div>
            <div class="nav-container">
                <div class="nav-brand">
                    <a href="${base}index.html" aria-label="WelkinRim Home">
                        <img src="${base}assets/Welkinrim logo.png" alt="WelkinRim" class="nav-logo">
                    </a>
                </div>
                <div class="nav-menu" id="nav-menu">
                    <div class="nav-dropdown">
                        <a href="${base}products.html" class="nav-link${activeClass('products')}">Products</a>
                        <div class="nav-dropdown-menu">
                            <a href="${base}products/commercial-motors.html" class="nav-dropdown-link">Motors</a>
                            <a href="${base}products/defence-motors.html" class="nav-dropdown-link">Defence Series</a>
                            <a href="${base}products/agriculture-motors.html" class="nav-dropdown-link">Agriculture Series</a>
                            <a href="${base}configurator.html" class="nav-dropdown-link">Configurator</a>
                            <a href="${base}motor-matchmaker.html" class="nav-dropdown-link">Motor Matchmaker</a>
                        </div>
                    </div>
                    <div class="nav-dropdown">
                        <a href="${base}index.html#solutions" class="nav-link${activeClass('solutions')}">Solutions</a>
                        <div class="nav-dropdown-menu">
                            <a href="${base}applications/defence.html" class="nav-dropdown-link">Defence</a>
                            <a href="${base}applications/agriculture.html" class="nav-dropdown-link">Agriculture</a>
                            <a href="${base}applications/delivery.html" class="nav-dropdown-link">Commercial</a>
                            <a href="${base}applications/inspection.html" class="nav-dropdown-link">Industrial</a>
                        </div>
                    </div>
                    <div class="nav-dropdown">
                        <a href="${base}resources.html" class="nav-link${activeClass('resources')}">Resources</a>
                        <div class="nav-dropdown-menu">
                            <a href="${base}case-studies.html" class="nav-dropdown-link">Case Studies</a>
                            <a href="${base}certifications.html" class="nav-dropdown-link">Certifications</a>
                            <a href="${base}tools/calculator.html" class="nav-dropdown-link">Performance Tools</a>
                            <a href="${base}support.html" class="nav-dropdown-link">Documentation</a>
                        </div>
                    </div>
                    <a href="${base}about.html" class="nav-link${activeClass('company')}">Company</a>
                    <a href="${base}contact.html" class="nav-cta">Get Quote</a>
                </div>
                <div class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" role="button" tabindex="0">
                    <span class="nav-toggle-bar"></span>
                    <span class="nav-toggle-bar"></span>
                    <span class="nav-toggle-bar"></span>
                </div>
            </div>
        `;
    }

    // Inject Footer
    const footerPlaceholder = document.getElementById('main-footer');
    if (footerPlaceholder) {
        footerPlaceholder.className = 'footer';
        footerPlaceholder.innerHTML = `
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h4 class="footer-title">Products</h4>
                        <ul class="footer-links">
                            <li><a href="${base}products/commercial-motors.html">Commercial Motors</a></li>
                            <li><a href="${base}products/defence-motors.html">Defence Motors</a></li>
                            <li><a href="${base}products/agriculture-motors.html">Agriculture Motors</a></li>
                            <li><a href="${base}products/industrial-motors.html">Industrial Motors</a></li>
                            <li><a href="${base}configurator.html">Configurator</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4 class="footer-title">Solutions</h4>
                        <ul class="footer-links">
                            <li><a href="${base}applications/defence.html">Defence</a></li>
                            <li><a href="${base}applications/agriculture.html">Agriculture</a></li>
                            <li><a href="${base}applications/delivery.html">Commercial</a></li>
                            <li><a href="${base}applications/inspection.html">Industrial</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4 class="footer-title">Resources</h4>
                        <ul class="footer-links">
                            <li><a href="${base}case-studies.html">Case Studies</a></li>
                            <li><a href="${base}certifications.html">Certifications</a></li>
                            <li><a href="${base}tools/calculator.html">Performance Calculator</a></li>
                            <li><a href="${base}motor-matchmaker.html">Motor Matchmaker</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4 class="footer-title">Company</h4>
                        <ul class="footer-links">
                            <li><a href="${base}about.html">About WelkinRim</a></li>
                            <li><a href="${base}news.html">News & Updates</a></li>
                            <li><a href="${base}careers.html">Careers</a></li>
                            <li><a href="${base}contact.html">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div class="footer-legal">
                        <p>&copy; 2026 WelkinRim Technologies. All rights reserved.</p>
                        <div class="footer-legal-links">
                            <a href="${base}privacy.html">Privacy Policy</a>
                            <a href="${base}terms.html">Terms of Service</a>
                        </div>
                    </div>
                    <div class="footer-certifications">
                        <img src="${base}assets/iso-9001.svg" alt="ISO 9001 Certified" class="cert-badge">
                        <img src="${base}assets/ce-mark.svg" alt="CE Certified" class="cert-badge">
                        <img src="${base}assets/fcc-cert.svg" alt="FCC Certified" class="cert-badge">
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize mobile navigation toggle
    function initMobileNav() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                navMenu.classList.toggle('nav-menu-active');
                navToggle.classList.toggle('nav-toggle-active');
                document.body.classList.toggle('menu-open');
                const expanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !expanded);
            });

            // Also support keyboard activation
            navToggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navToggle.click();
                }
            });

            // Close menu when clicking a nav link
            navMenu.querySelectorAll('.nav-link, .nav-cta, .nav-dropdown-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('nav-menu-active');
                    navToggle.classList.remove('nav-toggle-active');
                    document.body.classList.remove('menu-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    initMobileNav();

    // ==========================================
    // QUICK QUOTE MODAL
    // ==========================================

    // Inject modal styles
    var qqStyleEl = document.createElement('style');
    qqStyleEl.textContent = `
        .qq-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.25s ease, visibility 0.25s ease;
        }
        .qq-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        .qq-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.92);
            z-index: 10001;
            background: #0f0f16;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            width: 90%;
            max-width: 440px;
            padding: 36px 32px 32px;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease;
            box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(246,166,4,0.06);
        }
        .qq-modal.active {
            opacity: 1;
            visibility: visible;
            transform: translate(-50%, -50%) scale(1);
        }
        .qq-close {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 32px;
            height: 32px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            color: rgba(255,255,255,0.5);
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, color 0.2s;
            line-height: 1;
        }
        .qq-close:hover {
            background: rgba(255,255,255,0.1);
            color: #fff;
        }
        .qq-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 1.35rem;
            font-weight: 700;
            color: #fff;
            margin: 0 0 4px;
        }
        .qq-subtitle {
            font-size: 0.9rem;
            color: rgba(255,255,255,0.5);
            margin: 0 0 24px;
        }
        .qq-motor-badge {
            display: inline-block;
            background: rgba(246,166,4,0.12);
            color: #f6a604;
            padding: 2px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-left: 4px;
        }
        .qq-field {
            margin-bottom: 16px;
        }
        .qq-label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: rgba(255,255,255,0.6);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .qq-input {
            width: 100%;
            padding: 12px 14px;
            background: #0a0a0f;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            color: #fff;
            font-size: 0.95rem;
            font-family: 'Inter', sans-serif;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
            box-sizing: border-box;
        }
        .qq-input::placeholder {
            color: rgba(255,255,255,0.25);
        }
        .qq-input:focus {
            border-color: rgba(246,166,4,0.5);
            box-shadow: 0 0 0 3px rgba(246,166,4,0.1);
        }
        .qq-submit {
            width: 100%;
            padding: 14px 24px;
            background: #f6a604;
            color: #0a0a0f;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 700;
            font-family: 'Plus Jakarta Sans', sans-serif;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            margin-top: 8px;
        }
        .qq-submit:hover {
            background: #e09800;
        }
        .qq-submit:active {
            transform: scale(0.98);
        }
        .qq-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .qq-success {
            text-align: center;
            padding: 20px 0;
        }
        .qq-success-icon {
            width: 56px;
            height: 56px;
            background: rgba(34,197,94,0.12);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
        }
        .qq-success-icon svg {
            width: 28px;
            height: 28px;
            color: #22c55e;
        }
        .qq-success-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 1.2rem;
            font-weight: 700;
            color: #fff;
            margin: 0 0 8px;
        }
        .qq-success-text {
            font-size: 0.9rem;
            color: rgba(255,255,255,0.5);
            margin: 0;
        }
        @media (max-width: 480px) {
            .qq-modal {
                width: 95%;
                padding: 28px 20px 24px;
            }
        }
    `;
    document.head.appendChild(qqStyleEl);

    // Inject modal HTML into body
    var qqOverlayEl = document.createElement('div');
    qqOverlayEl.className = 'qq-overlay';
    qqOverlayEl.id = 'qq-overlay';
    document.body.appendChild(qqOverlayEl);

    var qqModalEl = document.createElement('div');
    qqModalEl.className = 'qq-modal';
    qqModalEl.id = 'qq-modal';
    qqModalEl.setAttribute('role', 'dialog');
    qqModalEl.setAttribute('aria-label', 'Request a Quote');
    qqModalEl.innerHTML = '<button class="qq-close" id="qq-close" aria-label="Close">&times;</button>'
        + '<div id="qq-form-view">'
        + '<h2 class="qq-title">Request a Quote</h2>'
        + '<p class="qq-subtitle" id="qq-subtitle">Tell us what you need</p>'
        + '<form id="qq-form" action="https://formspree.io/f/xwpkpqyz" method="POST">'
        + '<input type="hidden" name="_source" value="quick-quote-modal">'
        + '<input type="hidden" name="motor" id="qq-motor-hidden" value="">'
        + '<div class="qq-field"><label class="qq-label" for="qq-email">Email *</label>'
        + '<input class="qq-input" type="email" id="qq-email" name="email" placeholder="you@company.com" required></div>'
        + '<div class="qq-field"><label class="qq-label" for="qq-company">Company Name</label>'
        + '<input class="qq-input" type="text" id="qq-company" name="company" placeholder="Your company"></div>'
        + '<div class="qq-field"><label class="qq-label" for="qq-quantity">Quantity Needed</label>'
        + '<input class="qq-input" type="text" id="qq-quantity" name="quantity" placeholder="e.g. 50 units"></div>'
        + '<button type="submit" class="qq-submit" id="qq-submit">Get Quote</button>'
        + '</form></div>'
        + '<div id="qq-success-view" class="qq-success" style="display:none;">'
        + '<div class="qq-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>'
        + '<h3 class="qq-success-title">Quote Request Sent</h3>'
        + '<p class="qq-success-text">We\'ll get back to you within 24 hours.</p>'
        + '</div>';
    document.body.appendChild(qqModalEl);

    // Modal open/close logic
    function qqOpen(motorName) {
        var subtitle = document.getElementById('qq-subtitle');
        var hiddenMotor = document.getElementById('qq-motor-hidden');
        var formView = document.getElementById('qq-form-view');
        var successView = document.getElementById('qq-success-view');
        var form = document.getElementById('qq-form');

        // Reset to form state
        formView.style.display = '';
        successView.style.display = 'none';
        form.reset();

        if (motorName) {
            subtitle.innerHTML = 'Motor: <span class="qq-motor-badge">' + motorName + '</span>';
            hiddenMotor.value = motorName;
        } else {
            subtitle.textContent = 'Tell us what you need';
            hiddenMotor.value = '';
        }

        qqOverlayEl.classList.add('active');
        qqModalEl.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input after animation
        setTimeout(function() {
            document.getElementById('qq-email').focus();
        }, 300);
    }

    function qqClose() {
        qqOverlayEl.classList.remove('active');
        qqModalEl.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close handlers
    document.getElementById('qq-close').addEventListener('click', qqClose);
    qqOverlayEl.addEventListener('click', qqClose);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && qqModalEl.classList.contains('active')) {
            qqClose();
        }
    });

    // Form submission via fetch
    document.getElementById('qq-form').addEventListener('submit', function(e) {
        e.preventDefault();
        var form = this;
        var submitBtn = document.getElementById('qq-submit');
        var originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        fetch('https://formspree.io/f/xwpkpqyz', {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        })
        .then(function(response) {
            if (response.ok) {
                document.getElementById('qq-form-view').style.display = 'none';
                document.getElementById('qq-success-view').style.display = '';
                // Auto-close after 3 seconds
                setTimeout(qqClose, 3000);
            } else {
                submitBtn.textContent = 'Error \u2013 Try Again';
                submitBtn.disabled = false;
                setTimeout(function() { submitBtn.textContent = originalText; }, 2000);
            }
        })
        .catch(function() {
            submitBtn.textContent = 'Error \u2013 Try Again';
            submitBtn.disabled = false;
            setTimeout(function() { submitBtn.textContent = originalText; }, 2000);
        });
    });

    // Expose globally so any page can call openQuoteModal(motorName)
    window.openQuoteModal = qqOpen;

    // Intercept nav CTA "Get Quote" button to open modal instead of navigating
    if (navPlaceholder) {
        var navCtaBtn = navPlaceholder.querySelector('.nav-cta');
        if (navCtaBtn) {
            navCtaBtn.addEventListener('click', function(e) {
                e.preventDefault();
                qqOpen();
            });
            navCtaBtn.href = '#';
        }
    }

    // ─── WhatsApp Floating Button ───
    (function injectWhatsApp() {
        var style = document.createElement('style');
        style.textContent = `
            .wa-float {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 999;
                display: flex;
                align-items: center;
                gap: 0;
                direction: rtl;
            }
            .wa-float-btn {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: #25D366;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                cursor: pointer;
                flex-shrink: 0;
                text-decoration: none;
            }
            .wa-float-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 24px rgba(37,211,102,0.4);
            }
            .wa-float-btn svg {
                width: 28px;
                height: 28px;
                fill: #fff;
            }
            .wa-float-tooltip {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                color: #fff;
                font-size: 0.8rem;
                font-family: 'Inter', sans-serif;
                font-weight: 500;
                padding: 6px 12px;
                border-radius: 6px;
                white-space: nowrap;
                opacity: 0;
                transform: translateX(8px);
                transition: opacity 0.2s ease, transform 0.2s ease;
                pointer-events: none;
                margin-right: 10px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .wa-float:hover .wa-float-tooltip {
                opacity: 1;
                transform: translateX(0);
            }
            @media (max-width: 768px) {
                .wa-float-btn {
                    width: 48px;
                    height: 48px;
                }
                .wa-float-btn svg {
                    width: 24px;
                    height: 24px;
                }
                .wa-float {
                    bottom: 20px;
                    right: 16px;
                }
                .wa-float-tooltip {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);

        var waDiv = document.createElement('div');
        waDiv.className = 'wa-float';
        waDiv.innerHTML = '<a class="wa-float-btn" href="https://wa.me/919876543210?text=Hi%20WelkinRim%2C%20I%27m%20interested%20in%20your%20drone%20motors." target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a><span class="wa-float-tooltip">Chat with us</span>';
        document.body.appendChild(waDiv);
    })();

    // ─── UTM Capture & Form Injection ───
    (function captureUTMs() {
        var params = new URLSearchParams(window.location.search);
        var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign'];
        utmKeys.forEach(function(key) {
            var val = params.get(key);
            if (val) {
                try { sessionStorage.setItem(key, val); } catch(e) {}
            }
        });

        // Inject stored UTM values into Formspree forms
        function injectUTMFields() {
            var forms = document.querySelectorAll('form[action*="formspree.io"]');
            forms.forEach(function(form) {
                utmKeys.forEach(function(key) {
                    var val;
                    try { val = sessionStorage.getItem(key); } catch(e) {}
                    if (val && !form.querySelector('input[name="' + key + '"]')) {
                        var input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = val;
                        form.appendChild(input);
                    }
                });
            });
        }

        // Run after DOM is ready (shared.js loads early, forms may not exist yet)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectUTMFields);
        } else {
            injectUTMFields();
        }
    })();
})();
