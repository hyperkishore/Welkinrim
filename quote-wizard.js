// Quote Wizard - Multi-step quote builder with floating badge
// WelkinRim Technologies
(function() {
    'use strict';

    // ── Design Tokens ──────────────────────────────────────────
    const ACCENT = '#f6a604';
    const ACCENT_HOVER = '#e09500';
    const ACCENT_LIGHT = 'rgba(246,166,4,0.1)';
    const DARK = '#171a20';
    const TEXT_LIGHT = '#666';
    const BORDER = '#e9ecef';
    const BG_LIGHT = '#f8f9fa';
    const FONT = "'Plus Jakarta Sans','Inter',sans-serif";
    const RADIUS = '12px';
    const STORAGE_KEY = 'welkinrim_quote';

    // ── Urgency Options ────────────────────────────────────────
    const URGENCY_OPTIONS = [
        { value: 'standard', label: 'Standard (4-6 weeks)', multiplier: 1.0 },
        { value: 'rush',     label: 'Rush (2-3 weeks)',     multiplier: 1.15 },
        { value: 'emergency',label: 'Emergency (1 week)',   multiplier: 1.30 }
    ];

    // ── Session Storage Helpers ────────────────────────────────
    function loadQuote() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return { items: [], contact: { name: '', email: '', company: '', phone: '' } };
    }

    function saveQuote(data) {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    // ── Base Path (mirrors shared.js) ──────────────────────────
    function getBasePath() {
        var path = window.location.pathname;
        if (path.includes('/products/') || path.includes('/tools/') || path.includes('/applications/')) return '../';
        return '';
    }

    // ── Get motor database safely ──────────────────────────────
    function getMotors() {
        if (typeof motorDatabase !== 'undefined' && Array.isArray(motorDatabase)) return motorDatabase;
        return [];
    }

    function findMotor(id) {
        return getMotors().find(function(m) { return m.id === id; }) || null;
    }

    // ── Inject CSS ─────────────────────────────────────────────
    var styleEl = document.createElement('style');
    styleEl.textContent = `
/* ── Quote Badge ─────────────────────────── */
.qw-badge {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9000;
    background: ${DARK};
    color: #fff;
    font-family: ${FONT};
    font-size: 0.9rem;
    font-weight: 600;
    padding: 14px 22px;
    border-radius: 50px;
    cursor: pointer;
    display: none;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
    user-select: none;
    -webkit-user-select: none;
}
.qw-badge:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.35);
    background: #000;
}
.qw-badge-icon {
    width: 22px;
    height: 22px;
    background: ${ACCENT};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
}
.qw-badge.qw-visible {
    display: flex;
}

/* ── Modal Overlay ───────────────────────── */
.qw-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0,0,0,0.55);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-family: ${FONT};
}
.qw-overlay.qw-active {
    display: flex;
    opacity: 1;
}
.qw-overlay.qw-fade-in {
    opacity: 1;
}

/* ── Modal Container ─────────────────────── */
.qw-modal {
    background: #fff;
    border-radius: 16px;
    max-width: 820px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    transform: translateY(24px);
    transition: transform 0.3s ease;
    box-shadow: 0 24px 64px rgba(0,0,0,0.2);
}
.qw-overlay.qw-fade-in .qw-modal {
    transform: translateY(0);
}

/* ── Header ──────────────────────────────── */
.qw-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
    border-bottom: 1px solid ${BORDER};
    flex-shrink: 0;
}
.qw-header-left h2 {
    font-size: 1.35rem;
    font-weight: 700;
    color: ${DARK};
    margin: 0;
}
.qw-header-left p {
    font-size: 0.8rem;
    color: ${TEXT_LIGHT};
    margin: 4px 0 0;
}
.qw-close {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: ${BG_LIGHT};
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${TEXT_LIGHT};
    transition: background 0.2s ease;
    flex-shrink: 0;
}
.qw-close:hover { background: #e0e0e0; }

/* ── Step Indicator ──────────────────────── */
.qw-steps {
    display: flex;
    gap: 0;
    padding: 0 32px;
    background: ${BG_LIGHT};
    flex-shrink: 0;
}
.qw-step-dot {
    flex: 1;
    text-align: center;
    padding: 14px 8px;
    font-size: 0.78rem;
    font-weight: 500;
    color: #aaa;
    position: relative;
    transition: color 0.2s ease;
}
.qw-step-dot.qw-step-active {
    color: ${ACCENT};
    font-weight: 700;
}
.qw-step-dot.qw-step-done {
    color: ${DARK};
}
.qw-step-dot::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 3px;
    border-radius: 3px;
    background: transparent;
    transition: background 0.2s ease;
}
.qw-step-dot.qw-step-active::after {
    background: ${ACCENT};
}
.qw-step-dot.qw-step-done::after {
    background: ${DARK};
}

/* ── Body (scrollable) ───────────────────── */
.qw-body {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    min-height: 0;
}

/* ── Footer ──────────────────────────────── */
.qw-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    border-top: 1px solid ${BORDER};
    flex-shrink: 0;
}
.qw-btn {
    padding: 11px 28px;
    border-radius: 50px;
    font-family: ${FONT};
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
}
.qw-btn-back {
    background: transparent;
    color: ${TEXT_LIGHT};
    border: 2px solid ${BORDER};
}
.qw-btn-back:hover { border-color: #ccc; color: #333; }
.qw-btn-next {
    background: ${DARK};
    color: #fff;
}
.qw-btn-next:hover { background: #000; transform: scale(1.02); }
.qw-btn-next:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
}
.qw-btn-accent {
    background: ${ACCENT};
    color: #fff;
}
.qw-btn-accent:hover { background: ${ACCENT_HOVER}; transform: scale(1.02); }
.qw-footer-left {
    display: flex;
    gap: 12px;
}

/* ── Step 1: Motor Grid ──────────────────── */
.qw-motor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
}
.qw-motor-card {
    background: #fff;
    border: 2px solid ${BORDER};
    border-radius: ${RADIUS};
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}
.qw-motor-card:hover {
    border-color: #ccc;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.qw-motor-card.qw-selected {
    border-color: ${ACCENT};
    background: ${ACCENT_LIGHT};
    box-shadow: 0 0 0 3px rgba(246,166,4,0.15);
}
.qw-motor-check {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid ${BORDER};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: transparent;
    transition: all 0.2s ease;
    background: #fff;
}
.qw-motor-card.qw-selected .qw-motor-check {
    background: ${ACCENT};
    border-color: ${ACCENT};
    color: #fff;
}
.qw-motor-brand {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${TEXT_LIGHT};
    margin-bottom: 4px;
}
.qw-motor-name {
    font-size: 1.05rem;
    font-weight: 700;
    color: ${DARK};
    margin-bottom: 12px;
}
.qw-motor-specs {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
}
.qw-motor-spec {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
}
.qw-motor-spec-label { color: ${TEXT_LIGHT}; }
.qw-motor-spec-val { font-weight: 600; color: ${DARK}; }
.qw-motor-price {
    font-size: 1.15rem;
    font-weight: 700;
    color: ${DARK};
    border-top: 1px solid ${BORDER};
    padding-top: 10px;
}
.qw-motor-moq {
    font-size: 0.72rem;
    color: ${TEXT_LIGHT};
    margin-top: 2px;
}
.qw-search-bar {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid ${BORDER};
    border-radius: ${RADIUS};
    font-family: ${FONT};
    font-size: 0.9rem;
    margin-bottom: 20px;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
}
.qw-search-bar:focus {
    outline: none;
    border-color: ${ACCENT};
    box-shadow: 0 0 0 3px rgba(246,166,4,0.1);
}

/* ── Step 2: Quantity & Timeline ─────────── */
.qw-item-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.qw-item-row {
    background: ${BG_LIGHT};
    border-radius: ${RADIUS};
    padding: 20px 24px;
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr auto;
    gap: 20px;
    align-items: center;
}
.qw-item-info h4 {
    font-size: 0.95rem;
    font-weight: 700;
    color: ${DARK};
    margin: 0 0 2px;
}
.qw-item-info p {
    font-size: 0.78rem;
    color: ${TEXT_LIGHT};
    margin: 0;
}
.qw-item-qty-wrap label,
.qw-item-urgency-wrap label {
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: ${TEXT_LIGHT};
    margin-bottom: 6px;
}
.qw-item-qty {
    width: 80px;
    padding: 10px 12px;
    border: 2px solid ${BORDER};
    border-radius: 8px;
    font-family: ${FONT};
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
}
.qw-item-qty:focus {
    outline: none;
    border-color: ${ACCENT};
}
.qw-item-urgency {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid ${BORDER};
    border-radius: 8px;
    font-family: ${FONT};
    font-size: 0.85rem;
    background: #fff;
    cursor: pointer;
}
.qw-item-urgency:focus {
    outline: none;
    border-color: ${ACCENT};
}
.qw-item-remove {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: #ccc;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}
.qw-item-remove:hover { background: #fee2e2; color: #ef4444; }

/* ── Step 3: Contact Form ────────────────── */
.qw-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.qw-field {
    display: flex;
    flex-direction: column;
}
.qw-field.qw-field-full {
    grid-column: 1 / -1;
}
.qw-field label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
}
.qw-field label .qw-req { color: ${ACCENT}; }
.qw-field input {
    padding: 12px 16px;
    border: 2px solid ${BORDER};
    border-radius: 8px;
    font-family: ${FONT};
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
}
.qw-field input:focus {
    outline: none;
    border-color: ${ACCENT};
    box-shadow: 0 0 0 3px rgba(246,166,4,0.1);
}
.qw-field input.qw-input-error {
    border-color: #ef4444;
}
.qw-field .qw-error-msg {
    font-size: 0.72rem;
    color: #ef4444;
    margin-top: 4px;
    display: none;
}
.qw-field .qw-error-msg.qw-show { display: block; }

/* ── Step 4: Review ──────────────────────── */
.qw-review-section {
    margin-bottom: 28px;
}
.qw-review-section h3 {
    font-size: 1rem;
    font-weight: 700;
    color: ${DARK};
    margin: 0 0 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${BORDER};
}
.qw-review-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}
.qw-review-table th {
    text-align: left;
    font-weight: 600;
    color: ${TEXT_LIGHT};
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.4px;
    padding: 8px 12px;
    border-bottom: 2px solid ${BORDER};
}
.qw-review-table td {
    padding: 12px;
    border-bottom: 1px solid ${BORDER};
    color: ${DARK};
}
.qw-review-table tr:last-child td { border-bottom: none; }
.qw-review-total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 16px 0;
    border-top: 2px solid ${DARK};
    margin-top: 8px;
}
.qw-review-total-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${TEXT_LIGHT};
}
.qw-review-total-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${DARK};
}
.qw-review-total-note {
    font-size: 0.75rem;
    color: ${TEXT_LIGHT};
    text-align: right;
    margin-top: 4px;
}
.qw-review-contact {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.qw-review-contact-item {
    background: ${BG_LIGHT};
    padding: 12px 16px;
    border-radius: 8px;
}
.qw-review-contact-item span:first-child {
    display: block;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: ${TEXT_LIGHT};
    margin-bottom: 2px;
}
.qw-review-contact-item span:last-child {
    font-weight: 600;
    color: ${DARK};
    font-size: 0.9rem;
}

/* ── Empty State ─────────────────────────── */
.qw-empty {
    text-align: center;
    padding: 48px 24px;
    color: ${TEXT_LIGHT};
}
.qw-empty-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
    opacity: 0.4;
}
.qw-empty h3 {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 6px;
}
.qw-empty p {
    font-size: 0.85rem;
}

/* ── Responsive ──────────────────────────── */
@media (max-width: 768px) {
    .qw-badge {
        bottom: 16px;
        right: 16px;
        padding: 12px 18px;
        font-size: 0.82rem;
    }
    .qw-modal {
        max-height: 95vh;
        border-radius: 12px;
    }
    .qw-header { padding: 18px 20px; }
    .qw-steps { padding: 0 20px; }
    .qw-step-dot { font-size: 0.7rem; padding: 10px 4px; }
    .qw-body { padding: 20px; }
    .qw-footer { padding: 16px 20px; }
    .qw-motor-grid { grid-template-columns: 1fr; }
    .qw-item-row {
        grid-template-columns: 1fr;
        gap: 14px;
    }
    .qw-form-grid { grid-template-columns: 1fr; }
    .qw-review-contact { grid-template-columns: 1fr; }
    .qw-btn { padding: 10px 20px; font-size: 0.82rem; }
}
@media (max-width: 480px) {
    .qw-overlay { padding: 8px; }
    .qw-header-left h2 { font-size: 1.1rem; }
}
`;
    document.head.appendChild(styleEl);

    // ── State ──────────────────────────────────────────────────
    var currentStep = 1;
    var quoteData = loadQuote();
    var selectedMotorIds = new Set(quoteData.items.map(function(i) { return i.motorId; }));
    var badgeEl = null;
    var overlayEl = null;

    // ── Badge ──────────────────────────────────────────────────
    function createBadge() {
        badgeEl = document.createElement('div');
        badgeEl.className = 'qw-badge';
        badgeEl.setAttribute('role', 'button');
        badgeEl.setAttribute('aria-label', 'Open quote wizard');
        badgeEl.setAttribute('tabindex', '0');
        badgeEl.innerHTML = '<div class="qw-badge-icon" id="qw-badge-count">0</div><span id="qw-badge-text">Your Quote</span>';
        badgeEl.addEventListener('click', function() { openQuoteWizard(4); });
        badgeEl.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openQuoteWizard(4); }
        });
        document.body.appendChild(badgeEl);
    }

    function updateBadge() {
        if (!badgeEl) return;
        var count = quoteData.items.length;
        var countEl = document.getElementById('qw-badge-count');
        var textEl = document.getElementById('qw-badge-text');
        if (countEl) countEl.textContent = count;
        if (textEl) textEl.textContent = 'Your Quote (' + count + ' item' + (count !== 1 ? 's' : '') + ')';
        if (count > 0) {
            badgeEl.classList.add('qw-visible');
        } else {
            badgeEl.classList.remove('qw-visible');
        }
    }

    // ── Modal DOM ──────────────────────────────────────────────
    function createModal() {
        overlayEl = document.createElement('div');
        overlayEl.className = 'qw-overlay';
        overlayEl.id = 'qw-overlay';
        overlayEl.innerHTML = [
            '<div class="qw-modal">',
            '  <div class="qw-header">',
            '    <div class="qw-header-left">',
            '      <h2 id="qw-title">Build Your Quote</h2>',
            '      <p id="qw-subtitle">Step 1 of 4</p>',
            '    </div>',
            '    <button class="qw-close" id="qw-close" aria-label="Close">&times;</button>',
            '  </div>',
            '  <div class="qw-steps" id="qw-steps"></div>',
            '  <div class="qw-body" id="qw-body"></div>',
            '  <div class="qw-footer">',
            '    <div class="qw-footer-left">',
            '      <button class="qw-btn qw-btn-back" id="qw-back">Back</button>',
            '    </div>',
            '    <button class="qw-btn qw-btn-next" id="qw-next">Next</button>',
            '  </div>',
            '</div>'
        ].join('\n');
        document.body.appendChild(overlayEl);

        // Event: close
        document.getElementById('qw-close').addEventListener('click', closeWizard);
        overlayEl.addEventListener('click', function(e) {
            if (e.target === overlayEl) closeWizard();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlayEl.classList.contains('qw-active')) closeWizard();
        });

        // Event: nav buttons
        document.getElementById('qw-back').addEventListener('click', function() { goToStep(currentStep - 1); });
        document.getElementById('qw-next').addEventListener('click', handleNext);
    }

    // ── Open / Close ───────────────────────────────────────────
    function openQuoteWizard(step) {
        if (!overlayEl) createModal();
        currentStep = step || 1;
        // Reload from storage in case another page wrote
        quoteData = loadQuote();
        selectedMotorIds = new Set(quoteData.items.map(function(i) { return i.motorId; }));
        overlayEl.classList.add('qw-active');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function() {
            overlayEl.classList.add('qw-fade-in');
        });
        renderStep();
    }

    function closeWizard() {
        if (!overlayEl) return;
        overlayEl.classList.remove('qw-fade-in');
        setTimeout(function() {
            overlayEl.classList.remove('qw-active');
            document.body.style.overflow = '';
        }, 300);
    }

    // ── Step Navigation ────────────────────────────────────────
    var STEP_LABELS = ['Select Motors', 'Qty & Timeline', 'Contact Info', 'Review & Submit'];
    var STEP_TITLES = ['Select Your Motors', 'Quantity & Timeline', 'Contact Details', 'Review & Submit'];

    function renderStepIndicator() {
        var el = document.getElementById('qw-steps');
        if (!el) return;
        el.innerHTML = STEP_LABELS.map(function(label, i) {
            var num = i + 1;
            var cls = 'qw-step-dot';
            if (num === currentStep) cls += ' qw-step-active';
            else if (num < currentStep) cls += ' qw-step-done';
            return '<div class="' + cls + '">' + num + '. ' + label + '</div>';
        }).join('');
    }

    function goToStep(step) {
        if (step < 1) step = 1;
        if (step > 4) step = 4;
        currentStep = step;
        renderStep();
    }

    function renderStep() {
        renderStepIndicator();
        var titleEl = document.getElementById('qw-title');
        var subEl = document.getElementById('qw-subtitle');
        var backBtn = document.getElementById('qw-back');
        var nextBtn = document.getElementById('qw-next');

        titleEl.textContent = STEP_TITLES[currentStep - 1];
        subEl.textContent = 'Step ' + currentStep + ' of 4';

        // Back button visibility
        backBtn.style.display = currentStep === 1 ? 'none' : '';

        // Next button label
        if (currentStep === 4) {
            nextBtn.textContent = 'Submit Quote Request';
            nextBtn.className = 'qw-btn qw-btn-accent';
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.className = 'qw-btn qw-btn-next';
        }

        // Render body content
        var body = document.getElementById('qw-body');
        switch (currentStep) {
            case 1: renderStep1(body); break;
            case 2: renderStep2(body); break;
            case 3: renderStep3(body); break;
            case 4: renderStep4(body); break;
        }
        updateNextEnabled();
    }

    function handleNext() {
        if (currentStep === 4) {
            submitQuote();
            return;
        }
        // Save current step data before advancing
        if (currentStep === 2) saveStep2Data();
        if (currentStep === 3) {
            if (!validateStep3()) return;
            saveStep3Data();
        }
        goToStep(currentStep + 1);
    }

    function updateNextEnabled() {
        var nextBtn = document.getElementById('qw-next');
        if (!nextBtn) return;
        if (currentStep === 1) {
            nextBtn.disabled = selectedMotorIds.size === 0;
        } else if (currentStep === 2) {
            nextBtn.disabled = quoteData.items.length === 0;
        } else {
            nextBtn.disabled = false;
        }
    }

    // ── Step 1: Select Motors ──────────────────────────────────
    function renderStep1(container) {
        var motors = getMotors();
        if (motors.length === 0) {
            container.innerHTML = '<div class="qw-empty"><div class="qw-empty-icon">&#9881;</div><h3>Motor catalog not loaded</h3><p>Please try again from a page that includes the motor database.</p></div>';
            return;
        }
        var html = '<input type="text" class="qw-search-bar" id="qw-search" placeholder="Search motors by name, brand, or series...">';
        html += '<div class="qw-motor-grid" id="qw-motor-grid">';
        html += renderMotorCards(motors);
        html += '</div>';
        container.innerHTML = html;

        // Search filter
        document.getElementById('qw-search').addEventListener('input', function() {
            var q = this.value.toLowerCase().trim();
            var filtered = motors.filter(function(m) {
                return m.model.toLowerCase().indexOf(q) !== -1 ||
                       m.brand.toLowerCase().indexOf(q) !== -1 ||
                       (m.series || '').toLowerCase().indexOf(q) !== -1 ||
                       (m.description || '').toLowerCase().indexOf(q) !== -1;
            });
            document.getElementById('qw-motor-grid').innerHTML = renderMotorCards(filtered);
            bindMotorCards();
        });
        bindMotorCards();
    }

    function renderMotorCards(motors) {
        return motors.map(function(m) {
            var selected = selectedMotorIds.has(m.id);
            var thrustKg = (m.maxThrust / 1000).toFixed(1);
            var weightStr = m.weight >= 1000 ? (m.weight / 1000).toFixed(1) + 'kg' : m.weight + 'g';
            return [
                '<div class="qw-motor-card' + (selected ? ' qw-selected' : '') + '" data-motor-id="' + m.id + '">',
                '  <div class="qw-motor-check">&#10003;</div>',
                '  <div class="qw-motor-brand">' + escHtml(m.brand) + '</div>',
                '  <div class="qw-motor-name">' + escHtml(m.model) + '</div>',
                '  <div class="qw-motor-specs">',
                '    <div class="qw-motor-spec"><span class="qw-motor-spec-label">Thrust</span><span class="qw-motor-spec-val">' + thrustKg + ' kg</span></div>',
                '    <div class="qw-motor-spec"><span class="qw-motor-spec-label">KV</span><span class="qw-motor-spec-val">' + m.kv + '</span></div>',
                '    <div class="qw-motor-spec"><span class="qw-motor-spec-label">Weight</span><span class="qw-motor-spec-val">' + weightStr + '</span></div>',
                '  </div>',
                '  <div class="qw-motor-price">$' + m.price + '</div>',
                m.moq > 1 ? '  <div class="qw-motor-moq">MOQ: ' + m.moq + ' units</div>' : '',
                '</div>'
            ].join('\n');
        }).join('');
    }

    function bindMotorCards() {
        var cards = document.querySelectorAll('.qw-motor-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                var id = card.getAttribute('data-motor-id');
                toggleMotor(id);
                card.classList.toggle('qw-selected', selectedMotorIds.has(id));
                updateNextEnabled();
            });
        });
    }

    function toggleMotor(id) {
        if (selectedMotorIds.has(id)) {
            selectedMotorIds.delete(id);
            quoteData.items = quoteData.items.filter(function(i) { return i.motorId !== id; });
        } else {
            selectedMotorIds.add(id);
            // Find existing or create new item with defaults
            var existing = quoteData.items.find(function(i) { return i.motorId === id; });
            if (!existing) {
                var motor = findMotor(id);
                var minQty = motor ? (motor.moq || 1) : 1;
                quoteData.items.push({ motorId: id, quantity: minQty, urgency: 'standard' });
            }
        }
        saveQuote(quoteData);
        updateBadge();
    }

    // ── Step 2: Quantity & Timeline ────────────────────────────
    function renderStep2(container) {
        if (quoteData.items.length === 0) {
            container.innerHTML = '<div class="qw-empty"><div class="qw-empty-icon">&#128230;</div><h3>No motors selected</h3><p>Go back and select at least one motor.</p></div>';
            return;
        }
        var html = '<div class="qw-item-list">';
        quoteData.items.forEach(function(item, idx) {
            var m = findMotor(item.motorId);
            if (!m) return;
            var urgOpts = URGENCY_OPTIONS.map(function(o) {
                return '<option value="' + o.value + '"' + (item.urgency === o.value ? ' selected' : '') + '>' + o.label + '</option>';
            }).join('');
            html += [
                '<div class="qw-item-row" data-idx="' + idx + '">',
                '  <div class="qw-item-info">',
                '    <h4>' + escHtml(m.model) + '</h4>',
                '    <p>' + escHtml(m.brand) + ' &middot; $' + m.price + '/unit' + (m.moq > 1 ? ' &middot; MOQ: ' + m.moq : '') + '</p>',
                '  </div>',
                '  <div class="qw-item-qty-wrap">',
                '    <label>Quantity</label>',
                '    <input type="number" class="qw-item-qty" data-idx="' + idx + '" min="' + (m.moq || 1) + '" value="' + item.quantity + '">',
                '  </div>',
                '  <div class="qw-item-urgency-wrap">',
                '    <label>Timeline</label>',
                '    <select class="qw-item-urgency" data-idx="' + idx + '">' + urgOpts + '</select>',
                '  </div>',
                '  <button class="qw-item-remove" data-idx="' + idx + '" aria-label="Remove">&times;</button>',
                '</div>'
            ].join('\n');
        });
        html += '</div>';
        container.innerHTML = html;

        // Bind events
        container.querySelectorAll('.qw-item-qty').forEach(function(inp) {
            inp.addEventListener('change', function() {
                var idx = parseInt(this.getAttribute('data-idx'));
                var val = parseInt(this.value) || 1;
                if (val < 1) val = 1;
                quoteData.items[idx].quantity = val;
                this.value = val;
                saveQuote(quoteData);
            });
        });
        container.querySelectorAll('.qw-item-urgency').forEach(function(sel) {
            sel.addEventListener('change', function() {
                var idx = parseInt(this.getAttribute('data-idx'));
                quoteData.items[idx].urgency = this.value;
                saveQuote(quoteData);
            });
        });
        container.querySelectorAll('.qw-item-remove').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(this.getAttribute('data-idx'));
                var removedId = quoteData.items[idx].motorId;
                quoteData.items.splice(idx, 1);
                selectedMotorIds.delete(removedId);
                saveQuote(quoteData);
                updateBadge();
                renderStep2(container);
                updateNextEnabled();
            });
        });
    }

    function saveStep2Data() {
        var qtyInputs = document.querySelectorAll('.qw-item-qty');
        var urgSelects = document.querySelectorAll('.qw-item-urgency');
        qtyInputs.forEach(function(inp) {
            var idx = parseInt(inp.getAttribute('data-idx'));
            if (quoteData.items[idx]) {
                quoteData.items[idx].quantity = parseInt(inp.value) || 1;
            }
        });
        urgSelects.forEach(function(sel) {
            var idx = parseInt(sel.getAttribute('data-idx'));
            if (quoteData.items[idx]) {
                quoteData.items[idx].urgency = sel.value;
            }
        });
        saveQuote(quoteData);
    }

    // ── Step 3: Contact Details ────────────────────────────────
    function renderStep3(container) {
        var c = quoteData.contact || {};
        container.innerHTML = [
            '<div class="qw-form-grid">',
            '  <div class="qw-field">',
            '    <label>Full Name <span class="qw-req">*</span></label>',
            '    <input type="text" id="qw-name" placeholder="Your full name" value="' + escAttr(c.name || '') + '">',
            '    <span class="qw-error-msg" id="qw-err-name">Name is required</span>',
            '  </div>',
            '  <div class="qw-field">',
            '    <label>Email Address <span class="qw-req">*</span></label>',
            '    <input type="email" id="qw-email" placeholder="your@email.com" value="' + escAttr(c.email || '') + '">',
            '    <span class="qw-error-msg" id="qw-err-email">Valid email is required</span>',
            '  </div>',
            '  <div class="qw-field">',
            '    <label>Company</label>',
            '    <input type="text" id="qw-company" placeholder="Company name" value="' + escAttr(c.company || '') + '">',
            '  </div>',
            '  <div class="qw-field">',
            '    <label>Phone</label>',
            '    <input type="tel" id="qw-phone" placeholder="+1 (555) 000-0000" value="' + escAttr(c.phone || '') + '">',
            '  </div>',
            '</div>'
        ].join('\n');
    }

    function validateStep3() {
        var name = (document.getElementById('qw-name').value || '').trim();
        var email = (document.getElementById('qw-email').value || '').trim();
        var valid = true;
        var nameEl = document.getElementById('qw-name');
        var emailEl = document.getElementById('qw-email');
        var errName = document.getElementById('qw-err-name');
        var errEmail = document.getElementById('qw-err-email');

        if (!name) {
            nameEl.classList.add('qw-input-error');
            errName.classList.add('qw-show');
            valid = false;
        } else {
            nameEl.classList.remove('qw-input-error');
            errName.classList.remove('qw-show');
        }
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            emailEl.classList.add('qw-input-error');
            errEmail.classList.add('qw-show');
            valid = false;
        } else {
            emailEl.classList.remove('qw-input-error');
            errEmail.classList.remove('qw-show');
        }
        return valid;
    }

    function saveStep3Data() {
        quoteData.contact = {
            name: (document.getElementById('qw-name').value || '').trim(),
            email: (document.getElementById('qw-email').value || '').trim(),
            company: (document.getElementById('qw-company').value || '').trim(),
            phone: (document.getElementById('qw-phone').value || '').trim()
        };
        saveQuote(quoteData);
    }

    // ── Step 4: Review & Submit ────────────────────────────────
    function renderStep4(container) {
        if (quoteData.items.length === 0) {
            container.innerHTML = '<div class="qw-empty"><div class="qw-empty-icon">&#128196;</div><h3>No items in your quote</h3><p>Go back to select motors and configure quantities.</p></div>';
            return;
        }
        var totalEstimate = 0;
        var rowsHtml = quoteData.items.map(function(item) {
            var m = findMotor(item.motorId);
            if (!m) return '';
            var urgOpt = URGENCY_OPTIONS.find(function(o) { return o.value === item.urgency; }) || URGENCY_OPTIONS[0];
            var lineTotal = m.price * item.quantity * urgOpt.multiplier;
            totalEstimate += lineTotal;
            return [
                '<tr>',
                '  <td><strong>' + escHtml(m.model) + '</strong><br><span style="color:' + TEXT_LIGHT + ';font-size:0.78rem">' + escHtml(m.brand) + '</span></td>',
                '  <td style="text-align:center">' + item.quantity + '</td>',
                '  <td>' + urgOpt.label + '</td>',
                '  <td style="text-align:right">$' + m.price + '</td>',
                '  <td style="text-align:right;font-weight:600">$' + lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</td>',
                '</tr>'
            ].join('\n');
        }).join('');

        var contactHtml = '';
        var c = quoteData.contact || {};
        if (c.name || c.email) {
            contactHtml = [
                '<div class="qw-review-section">',
                '  <h3>Contact Information</h3>',
                '  <div class="qw-review-contact">',
                c.name    ? '<div class="qw-review-contact-item"><span>Name</span><span>' + escHtml(c.name) + '</span></div>' : '',
                c.email   ? '<div class="qw-review-contact-item"><span>Email</span><span>' + escHtml(c.email) + '</span></div>' : '',
                c.company ? '<div class="qw-review-contact-item"><span>Company</span><span>' + escHtml(c.company) + '</span></div>' : '',
                c.phone   ? '<div class="qw-review-contact-item"><span>Phone</span><span>' + escHtml(c.phone) + '</span></div>' : '',
                '  </div>',
                '</div>'
            ].join('\n');
        }

        container.innerHTML = [
            '<div class="qw-review-section">',
            '  <h3>Selected Motors</h3>',
            '  <table class="qw-review-table">',
            '    <thead><tr><th>Motor</th><th style="text-align:center">Qty</th><th>Timeline</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Subtotal</th></tr></thead>',
            '    <tbody>' + rowsHtml + '</tbody>',
            '  </table>',
            '  <div class="qw-review-total">',
            '    <span class="qw-review-total-label">Estimated Total</span>',
            '    <span class="qw-review-total-value">$' + totalEstimate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</span>',
            '  </div>',
            '  <div class="qw-review-total-note">Final pricing may vary. Our sales team will confirm exact pricing in your quote.</div>',
            '</div>',
            contactHtml
        ].join('\n');
    }

    // ── Submit ─────────────────────────────────────────────────
    function submitQuote() {
        // Build compact URL param string
        var parts = quoteData.items.map(function(item) {
            return item.motorId + ':' + item.quantity + ':' + item.urgency;
        });
        var c = quoteData.contact || {};
        var params = new URLSearchParams();
        params.set('type', 'quote');
        params.set('motors', parts.join(','));
        if (c.name) params.set('name', c.name);
        if (c.email) params.set('email', c.email);
        if (c.company) params.set('company', c.company);
        if (c.phone) params.set('phone', c.phone);

        // Build motor summary for the message field
        var summary = quoteData.items.map(function(item) {
            var m = findMotor(item.motorId);
            var urgOpt = URGENCY_OPTIONS.find(function(o) { return o.value === item.urgency; }) || URGENCY_OPTIONS[0];
            return (m ? m.brand + ' ' + m.model : item.motorId) + ' x' + item.quantity + ' (' + urgOpt.label + ')';
        }).join(', ');
        params.set('motor', summary);
        params.set('subject', 'Request Quote');

        var base = getBasePath();
        closeWizard();
        window.location.href = base + 'contact.html?' + params.toString();
    }

    // ── Global API ─────────────────────────────────────────────
    window.openQuoteWizard = function(step) {
        openQuoteWizard(step || 1);
    };

    window.addToQuote = function(motorId) {
        var motor = findMotor(motorId);
        if (!motor) return;
        // Only add if not already present
        if (!selectedMotorIds.has(motorId)) {
            selectedMotorIds.add(motorId);
            quoteData.items.push({
                motorId: motorId,
                quantity: motor.moq || 1,
                urgency: 'standard'
            });
            saveQuote(quoteData);
            updateBadge();
        }
    };

    window.removeFromQuote = function(motorId) {
        if (selectedMotorIds.has(motorId)) {
            selectedMotorIds.delete(motorId);
            quoteData.items = quoteData.items.filter(function(i) { return i.motorId !== motorId; });
            saveQuote(quoteData);
            updateBadge();
        }
    };

    window.getQuoteItems = function() {
        return loadQuote().items.slice();
    };

    window.clearQuote = function() {
        quoteData = { items: [], contact: { name: '', email: '', company: '', phone: '' } };
        selectedMotorIds.clear();
        saveQuote(quoteData);
        updateBadge();
    };

    // ── Utilities ──────────────────────────────────────────────
    function escHtml(str) {
        var d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    function escAttr(str) {
        return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Init ───────────────────────────────────────────────────
    function init() {
        createBadge();
        updateBadge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
