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

// ── LinkedIn Insight Tag ──────────────────────────────
// Replace XXXXXXX with your LinkedIn Partner ID
// Get yours at: https://www.linkedin.com/campaignmanager → Account Assets → Insight Tag
(function initLinkedInPixel() {
    var PARTNER_ID = 'XXXXXXX'; // ← REPLACE with your real Partner ID
    if (PARTNER_ID === 'XXXXXXX') return; // Skip if not configured
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(PARTNER_ID);
    (function(l) {
        if (!l) { window.lintrk = function(a, b) { window.lintrk.q.push([a, b]); }; window.lintrk.q = []; }
        var s = document.getElementsByTagName('script')[0];
        var b = document.createElement('script');
        b.type = 'text/javascript'; b.async = true;
        b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
        s.parentNode.insertBefore(b, s);
    })(window.lintrk);
    // noscript fallback
    var ns = document.createElement('noscript');
    ns.innerHTML = '<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=' + PARTNER_ID + '&fmt=gif" />';
    document.body.appendChild(ns);
})();

// Shared Navigation & Footer - WelkinRim
(function() {
    'use strict';

    var _qqTrigger = null;
    var _exitTrigger = null;

    // Focus trap utility for modals
    function trapFocus(container) {
        var focusable = container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        container.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
    }

    // Detect relative path prefix based on page location
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/products/') || path.includes('/tools/') || path.includes('/applications/') || path.includes('/compare/') || path.includes('/landing/')) {
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
                <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
                    <span class="nav-toggle-bar"></span>
                    <span class="nav-toggle-bar"></span>
                    <span class="nav-toggle-bar"></span>
                </button>
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
                            <li><a href="${base}style-guide.html">Style Guide</a></li>
                            <li><a href="${base}asset-library.html">Asset Library</a></li>
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
                        <img src="${base}assets/iso-9001.svg" alt="ISO 9001 Certified" class="cert-badge" width="40" height="40">
                        <img src="${base}assets/ce-mark.svg" alt="CE Certified" class="cert-badge" width="40" height="40">
                        <img src="${base}assets/fcc-cert.svg" alt="FCC Certified" class="cert-badge" width="40" height="40">
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
        .qq-input:focus-visible {
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
        @media (prefers-reduced-motion: reduce) {
            .qq-overlay, .qq-modal { transition-duration: 0.01ms !important; }
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
    qqModalEl.setAttribute('aria-modal', 'true');
    qqModalEl.setAttribute('aria-label', 'Request a Quote');
    qqModalEl.innerHTML = '<button class="qq-close" id="qq-close" aria-label="Close">&times;</button>'
        + '<div id="qq-form-view">'
        + '<h2 class="qq-title">Request a Quote</h2>'
        + '<p class="qq-subtitle" id="qq-subtitle">Tell us what you need</p>'
        + '<form id="qq-form" action="https://formspree.io/f/xwpkpqyz" method="POST">'
        + '<input type="hidden" name="_source" value="quick-quote-modal">'
        + '<input type="hidden" name="motor" id="qq-motor-hidden" value="">'
        + '<div class="qq-field"><label class="qq-label" for="qq-email">Email *</label>'
        + '<input class="qq-input" type="email" id="qq-email" name="email" placeholder="you@company.com" autocomplete="email" required></div>'
        + '<div class="qq-field"><label class="qq-label" for="qq-company">Company Name</label>'
        + '<input class="qq-input" type="text" id="qq-company" name="company" placeholder="Your company\u2026" autocomplete="organization"></div>'
        + '<div class="qq-field"><label class="qq-label" for="qq-quantity">Quantity Needed</label>'
        + '<input class="qq-input" type="text" id="qq-quantity" name="quantity" placeholder="e.g. 50 units\u2026"></div>'
        + '<button type="submit" class="qq-submit" id="qq-submit">Get Quote</button>'
        + '</form></div>'
        + '<div id="qq-success-view" class="qq-success" style="display:none;">'
        + '<div class="qq-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>'
        + '<h3 class="qq-success-title">Quote Request Sent</h3>'
        + '<p class="qq-success-text">We\'ll get back to you within 24 hours.</p>'
        + '</div>';
    document.body.appendChild(qqModalEl);
    trapFocus(qqModalEl);

    // Modal open/close logic
    function qqOpen(motorName) {
        _qqTrigger = document.activeElement;
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
        if (_qqTrigger) { try { _qqTrigger.focus(); } catch(e) {} _qqTrigger = null; }
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
        submitBtn.textContent = 'Sending\u2026';
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
                submitBtn.textContent = 'Network error \u2013 tap to retry';
                submitBtn.disabled = false;
                setTimeout(function() { submitBtn.textContent = originalText; }, 2000);
            }
        })
        .catch(function() {
            submitBtn.textContent = 'Network error \u2013 tap to retry';
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
                    bottom: 80px;
                    right: 16px;
                }
                .wa-float-tooltip {
                    display: none;
                }
            }
            @media (prefers-reduced-motion: reduce) {
                .wa-float-btn { transition-duration: 0.01ms !important; }
                .wa-float-tooltip { transition-duration: 0.01ms !important; }
            }
        `;
        document.head.appendChild(style);

        var waDiv = document.createElement('div');
        waDiv.className = 'wa-float';
        waDiv.innerHTML = '<a class="wa-float-btn" href="https://wa.me/919876543210?text=Hi%20WelkinRim%2C%20I%27m%20interested%20in%20your%20drone%20motors." target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a><span class="wa-float-tooltip">Chat with us</span>';
        document.body.appendChild(waDiv);
    })();

    // ─── Sticky "Get a Quote" Bottom Bar ───
    (function injectStickyBar() {
        var sbarStyle = document.createElement('style');
        sbarStyle.textContent = `
            .wr-sticky-bar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 997;
                background: rgba(10,10,15,0.95);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-top: 1px solid rgba(255,255,255,0.08);
                padding: 12px 24px;
                padding-right: 90px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transform: translateY(100%);
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .wr-sticky-bar.visible { transform: translateY(0); }
            .wr-sticky-bar-text {
                color: rgba(255,255,255,0.7);
                font-size: 0.9rem;
                font-family: 'Inter', sans-serif;
            }
            .wr-sticky-bar-text strong { color: #fff; }
            .wr-sticky-bar-btn {
                background: #f6a604;
                color: #0a0a0f;
                border: none;
                padding: 10px 24px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 0.9rem;
                font-family: 'Plus Jakarta Sans', sans-serif;
                cursor: pointer;
                white-space: nowrap;
                transition: background 0.2s, transform 0.1s;
                flex-shrink: 0;
            }
            .wr-sticky-bar-btn:hover { background: #e09800; }
            .wr-sticky-bar-btn:active { transform: scale(0.97); }
            @media (max-width: 768px) {
                .wr-sticky-bar {
                    padding: 10px 16px;
                    padding-right: 16px;
                    flex-direction: column;
                    gap: 8px;
                    text-align: center;
                }
                .wr-sticky-bar-btn { width: 100%; }
                .wa-float { bottom: 80px !important; }
            }
            @media (prefers-reduced-motion: reduce) {
                .wr-sticky-bar { transition-duration: 0.01ms !important; }
            }
        `;
        document.head.appendChild(sbarStyle);

        var sbar = document.createElement('div');
        sbar.className = 'wr-sticky-bar';
        sbar.id = 'wr-sticky-bar';
        sbar.innerHTML = '<span class="wr-sticky-bar-text"><strong>Ready to upgrade?</strong> Get a custom motor quote in 24 hours.</span><button class="wr-sticky-bar-btn">Get a Quote</button>';
        document.body.appendChild(sbar);
        sbar.querySelector('.wr-sticky-bar-btn').addEventListener('click', function() { openQuoteModal(); });

        var shown = false;
        window.addEventListener('scroll', function() {
            if (!shown && window.scrollY > 500) {
                shown = true;
                sbar.classList.add('visible');
            }
        }, { passive: true });
    })();

    // ─── Calendly "Talk to an Engineer" ───
    window.openCalendly = function() {
        // Lazy-load Calendly assets on first call
        var CALENDLY_URL = 'https://calendly.com/welkinrim-engineering/technical-consultation';
        if (!window._calendlyLoaded) {
            window._calendlyLoaded = true;
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://assets.calendly.com/assets/external/widget.css';
            document.head.appendChild(link);
            var script = document.createElement('script');
            script.src = 'https://assets.calendly.com/assets/external/widget.js';
            script.onload = function() {
                if (window.Calendly) {
                    Calendly.initPopupWidget({ url: CALENDLY_URL });
                    wrTrack('calendly_open', { page: window.location.pathname });
                }
            };
            document.head.appendChild(script);
        } else if (window.Calendly) {
            Calendly.initPopupWidget({ url: CALENDLY_URL });
            wrTrack('calendly_open', { page: window.location.pathname });
        }
    };

    // ─── Exit-Intent Popup (Global) ───
    (function injectExitPopup() {
        var epStyle = document.createElement('style');
        epStyle.textContent = `
            .wr-exit-overlay {
                position: fixed;
                inset: 0;
                z-index: 10002;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            .wr-exit-overlay.active { opacity: 1; visibility: visible; }
            .wr-exit-card {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.92);
                z-index: 10003;
                background: #0f0f16;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 16px;
                width: 90%;
                max-width: 440px;
                padding: 40px 32px 32px;
                text-align: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease;
                box-shadow: 0 24px 64px rgba(0,0,0,0.5);
            }
            .wr-exit-card.active {
                opacity: 1;
                visibility: visible;
                transform: translate(-50%, -50%) scale(1);
            }
            .wr-exit-close {
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
            .wr-exit-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
            .wr-exit-badge {
                display: inline-block;
                background: rgba(246,166,4,0.12);
                color: #f6a604;
                padding: 4px 14px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
                margin-bottom: 16px;
            }
            .wr-exit-title {
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 1.4rem;
                font-weight: 700;
                color: #fff;
                margin: 0 0 8px;
            }
            .wr-exit-desc {
                font-size: 0.92rem;
                color: rgba(255,255,255,0.5);
                line-height: 1.6;
                margin: 0 0 20px;
            }
            .wr-exit-social {
                font-size: 0.8rem;
                color: rgba(255,255,255,0.35);
                margin-bottom: 20px;
            }
            .wr-exit-form { display: flex; gap: 10px; }
            .wr-exit-input {
                flex: 1;
                padding: 12px 16px;
                background: #0a0a0f;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px;
                color: #fff;
                font-size: 0.92rem;
                font-family: 'Inter', sans-serif;
                outline: none;
                transition: border-color 0.2s;
            }
            .wr-exit-input::placeholder { color: rgba(255,255,255,0.25); }
            .wr-exit-input:focus-visible { border-color: rgba(246,166,4,0.5); box-shadow: 0 0 0 3px rgba(246,166,4,0.1); }
            .wr-exit-submit {
                background: #f6a604;
                color: #0a0a0f;
                border: none;
                padding: 12px 20px;
                border-radius: 10px;
                font-weight: 700;
                font-size: 0.9rem;
                font-family: 'Plus Jakarta Sans', sans-serif;
                cursor: pointer;
                white-space: nowrap;
                transition: background 0.2s;
            }
            .wr-exit-submit:hover { background: #e09800; }
            .wr-exit-privacy {
                font-size: 0.75rem;
                color: rgba(255,255,255,0.3);
                margin-top: 12px;
            }
            .wr-exit-guide-link {
                display: none;
                color: #f6a604;
                font-weight: 600;
                font-size: 1rem;
                text-decoration: none;
                margin-top: 16px;
                border-bottom: 1px solid rgba(246,166,4,0.3);
                transition: border-color 0.2s;
            }
            .wr-exit-guide-link:hover { border-color: #f6a604; }
            @media (max-width: 480px) {
                .wr-exit-card { width: 95%; padding: 32px 20px 24px; }
                .wr-exit-form { flex-direction: column; }
            }
            @media (prefers-reduced-motion: reduce) {
                .wr-exit-overlay, .wr-exit-card { transition-duration: 0.01ms !important; }
            }
            .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        `;
        document.head.appendChild(epStyle);

        var overlay = document.createElement('div');
        overlay.className = 'wr-exit-overlay';
        overlay.id = 'wr-exit-overlay';
        document.body.appendChild(overlay);

        var card = document.createElement('div');
        card.className = 'wr-exit-card';
        card.id = 'wr-exit-card';
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-modal', 'true');
        card.setAttribute('aria-label', 'Motor Selection Guide Download');
        card.innerHTML = '<button class="wr-exit-close" id="wr-exit-close" aria-label="Close">&times;</button>'
            + '<div class="wr-exit-badge">Free Download</div>'
            + '<h3 class="wr-exit-title">Before You Go\u2026</h3>'
            + '<p class="wr-exit-desc">Get <strong>The Complete Motor Selection Guide</strong> \u2014 covering KV ratings, stator sizing, and application matching for every drone type.</p>'
            + '<p class="wr-exit-social">Join 2,000+ engineers who downloaded this guide</p>'
            + '<form class="wr-exit-form" id="wr-exit-form">'
            + '<label for="wr-exit-email" class="sr-only">Email address</label>'
            + '<input class="wr-exit-input" type="email" id="wr-exit-email" name="email" placeholder="your@email.com" required autocomplete="email">'
            + '<input type="hidden" name="_source" value="exit-popup-guide">'
            + '<button type="submit" class="wr-exit-submit">Download Guide</button>'
            + '</form>'
            + '<p class="wr-exit-privacy">No spam. Unsubscribe anytime.</p>'
            + '<a href="' + base + 'motor-selection-guide.html" class="wr-exit-guide-link" id="wr-exit-guide-link">View Your Free Guide \u2192</a>';
        document.body.appendChild(card);
        trapFocus(card);

        // Show/close logic
        var exitShown = false;
        var sessionKey = 'welkinrim_exit_shown';
        if (sessionStorage.getItem(sessionKey)) return;

        var canShow = false;
        setTimeout(function() { canShow = true; }, 30000);

        function showExit() {
            if (exitShown || !canShow) return;
            _exitTrigger = document.activeElement;
            exitShown = true;
            sessionStorage.setItem(sessionKey, '1');
            overlay.classList.add('active');
            card.classList.add('active');
            wrTrack('exit_intent_shown', { page: window.location.pathname });
        }

        function hideExit() {
            overlay.classList.remove('active');
            card.classList.remove('active');
            if (_exitTrigger) { try { _exitTrigger.focus(); } catch(e) {} _exitTrigger = null; }
        }

        document.addEventListener('mouseleave', function(e) {
            if (e.clientY <= 0) showExit();
        });

        document.getElementById('wr-exit-close').addEventListener('click', hideExit);
        overlay.addEventListener('click', hideExit);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && card.classList.contains('active')) hideExit();
        });

        // Form submit
        document.getElementById('wr-exit-form').addEventListener('submit', function(e) {
            e.preventDefault();
            var form = this;
            var submitBtn = form.querySelector('.wr-exit-submit');
            submitBtn.textContent = 'Sending\u2026';
            submitBtn.disabled = true;

            fetch('https://formspree.io/f/xwpkpqyz', {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            }).then(function() {
                form.innerHTML = '<p style="color:#22c55e;font-weight:600;font-size:1.1rem;">Check your inbox!</p>';
                var link = document.getElementById('wr-exit-guide-link');
                if (link) { link.style.display = 'inline-block'; }
                try { localStorage.setItem('welkinrim_guide_unlocked', '1'); } catch(ex) {}
                setTimeout(hideExit, 4000);
            }).catch(function() {
                form.innerHTML = '<p style="color:#22c55e;font-weight:600;font-size:1.1rem;">Check your inbox!</p>';
                var link = document.getElementById('wr-exit-guide-link');
                if (link) { link.style.display = 'inline-block'; }
                try { localStorage.setItem('welkinrim_guide_unlocked', '1'); } catch(ex) {}
                setTimeout(hideExit, 4000);
            });
        });
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
