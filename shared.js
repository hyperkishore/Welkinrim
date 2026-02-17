// Shared Navigation & Footer - WelkinRim
(function() {
    'use strict';

    // Detect relative path prefix based on page location
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/products/') || path.includes('/tools/') || path.includes('/applications/')) {
            return '../';
        }
        return '';
    }

    const base = getBasePath();

    // Determine active page
    function getActivePage() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('product') || path.includes('micro-motor') || path.includes('industrial-motor') || path.includes('commercial-motor') || path.includes('defence-motor') || path.includes('agriculture-motor') || path.includes('propulsion') || path.includes('configurator')) return 'products';
        if (path.includes('calculator') || path.includes('resource') || path.includes('case-stud') || path.includes('certification')) return 'resources';
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
                        <p>&copy; 2025 WelkinRim Technologies. All rights reserved.</p>
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
