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
        if (path.includes('product') || path.includes('micro-motor') || path.includes('industrial-motor') || path.includes('commercial-motor') || path.includes('propulsion')) return 'products';
        if (path.includes('calculator') || path.includes('resource')) return 'resources';
        if (path.includes('matchmaker')) return 'matchmaker';
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
                    <a href="${base}products.html" class="nav-link${activeClass('products')}">Products</a>
                    <a href="${base}index.html#industries" class="nav-link">Industries</a>
                    <a href="${base}resources.html" class="nav-link${activeClass('resources')}">Resources</a>
                    <a href="${base}motor-matchmaker.html" class="nav-link${activeClass('matchmaker')}">Motor Matchmaker</a>
                    <a href="${base}support.html" class="nav-link${activeClass('support')}">Support</a>
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
                            <li><a href="${base}products/micro-motors.html">Micro Motors</a></li>
                            <li><a href="${base}products/commercial-motors.html">Commercial Motors</a></li>
                            <li><a href="${base}products/industrial-motors.html">Industrial Motors</a></li>
                            <li><a href="${base}products/propulsion-systems.html">Complete Systems</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4 class="footer-title">Resources</h4>
                        <ul class="footer-links">
                            <li><a href="${base}tools/calculator.html">Performance Calculator</a></li>
                            <li><a href="${base}motor-matchmaker.html">Motor Matchmaker</a></li>
                            <li><a href="${base}support.html#faq">FAQ</a></li>
                            <li><a href="${base}resources.html">All Resources</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4 class="footer-title">Support</h4>
                        <ul class="footer-links">
                            <li><a href="${base}support.html">Technical Support</a></li>
                            <li><a href="${base}support.html#warranty">Warranty</a></li>
                            <li><a href="${base}distributors.html">Find Distributor</a></li>
                            <li><a href="${base}contact.html">Contact Us</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4 class="footer-title">Company</h4>
                        <ul class="footer-links">
                            <li><a href="${base}about.html">About WelkinRim</a></li>
                            <li><a href="${base}news.html">News & Updates</a></li>
                            <li><a href="${base}careers.html">Careers</a></li>
                            <li><a href="${base}partners.html">Partners</a></li>
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
            navMenu.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
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
})();
