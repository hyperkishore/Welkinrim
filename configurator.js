// Propulsion System Configurator - WelkinRim
(function() {
    'use strict';

    // ── State ──────────────────────────────────────────────
    let currentStep = 1;
    let selectedMission = null;
    let selectedMotor = null;
    let filteredResults = [];

    const config = {
        mission: null,
        subCategory: null,
        environment: 'temperate',
        payload: 5,
        flightTime: 30,
        altitude: 500,
        motorCount: 4
    };

    // ── Sub-category options per mission ───────────────────
    const SUB_CATEGORIES = {
        defence: [
            { value: 'surveillance', label: 'Surveillance & Reconnaissance' },
            { value: 'cargo', label: 'Heavy Cargo & Logistics' },
            { value: 'search-rescue', label: 'Search & Rescue' },
            { value: 'mine-detection', label: 'Mine Detection & EOD' },
            { value: 'comms-relay', label: 'Communications Relay' },
            { value: 'border-security', label: 'Border Security' }
        ],
        agriculture: [
            { value: 'crop-spraying', label: 'Precision Crop Spraying' },
            { value: 'field-mapping', label: 'Field Mapping & Survey' },
            { value: 'livestock', label: 'Livestock Monitoring' },
            { value: 'seeding', label: 'Seeding & Fertilizing' },
            { value: 'crop-health', label: 'Crop Health Analysis' },
            { value: 'large-scale-farming', label: 'Large-Scale Farm Management' }
        ],
        commercial: [
            { value: 'delivery', label: 'Package Delivery' },
            { value: 'photography', label: 'Aerial Photography' },
            { value: 'inspection', label: 'Infrastructure Inspection' },
            { value: 'mapping', label: 'Mapping & Survey' }
        ],
        custom: [
            { value: 'research', label: 'Academic Research' },
            { value: 'racing', label: 'Racing & FPV' },
            { value: 'prototype', label: 'Prototype Development' },
            { value: 'other', label: 'Other / Custom' }
        ]
    };

    // ── DOM References ─────────────────────────────────────
    const stepsBar = document.getElementById('config-steps-bar');
    const panels = document.querySelectorAll('.config-panel');
    const missionGrid = document.getElementById('mission-grid');
    const subCategorySelect = document.getElementById('sub-category');
    const environmentSelect = document.getElementById('environment');
    const payloadSlider = document.getElementById('payload-slider');
    const flightTimeSlider = document.getElementById('flight-time-slider');
    const altitudeSlider = document.getElementById('altitude-slider');
    const motorCountSelect = document.getElementById('motor-count');
    const resultsListEl = document.getElementById('motor-results-list');

    // ── URL Preset Handling ────────────────────────────────
    function applyPreset() {
        const params = new URLSearchParams(window.location.search);
        const preset = params.get('preset');
        if (preset && SUB_CATEGORIES[preset]) {
            selectMission(preset);
            const card = missionGrid.querySelector('[data-mission="' + preset + '"]');
            if (card) card.classList.add('selected');
        }
    }

    // ── Step Navigation ────────────────────────────────────
    function goToStep(step) {
        if (step < 1 || step > 4) return;
        currentStep = step;
        updateStepIndicators();
        panels.forEach(p => p.classList.remove('active'));
        document.getElementById('step-' + step).classList.add('active');

        if (step === 3) runSearch();
        if (step === 4) renderSummary();
    }

    function updateStepIndicators() {
        stepsBar.querySelectorAll('.config-step-indicator').forEach(el => {
            const s = parseInt(el.dataset.step);
            el.classList.remove('active', 'completed');
            if (s === currentStep) el.classList.add('active');
            else if (s < currentStep) el.classList.add('completed');
        });
    }

    // ── Step 1: Mission Selection ──────────────────────────
    function selectMission(mission) {
        selectedMission = mission;
        config.mission = mission;
        missionGrid.querySelectorAll('.mission-card').forEach(c => c.classList.remove('selected'));

        // Populate sub-categories
        const options = SUB_CATEGORIES[mission] || [];
        subCategorySelect.innerHTML = '<option value="">Select sub-category...</option>' +
            options.map(o => '<option value="' + o.value + '">' + o.label + '</option>').join('');

        document.getElementById('btn-next-1').disabled = false;
    }

    missionGrid.addEventListener('click', function(e) {
        const card = e.target.closest('.mission-card');
        if (!card) return;
        selectMission(card.dataset.mission);
        card.classList.add('selected');
    });

    subCategorySelect.addEventListener('change', function() {
        config.subCategory = this.value;
    });

    environmentSelect.addEventListener('change', function() {
        config.environment = this.value;
    });

    // ── Step 2: Sliders ────────────────────────────────────
    function updateSliderDisplays() {
        document.getElementById('payload-val').textContent = parseFloat(payloadSlider.value).toFixed(1) + ' kg';
        document.getElementById('flight-time-val').textContent = flightTimeSlider.value + ' min';
        document.getElementById('altitude-val').textContent = parseInt(altitudeSlider.value).toLocaleString() + ' m';
    }

    payloadSlider.addEventListener('input', function() {
        config.payload = parseFloat(this.value);
        updateSliderDisplays();
    });
    flightTimeSlider.addEventListener('input', function() {
        config.flightTime = parseInt(this.value);
        updateSliderDisplays();
    });
    altitudeSlider.addEventListener('input', function() {
        config.altitude = parseInt(this.value);
        updateSliderDisplays();
    });
    motorCountSelect.addEventListener('change', function() {
        config.motorCount = parseInt(this.value);
    });

    // ── Step 3: Search & Score ─────────────────────────────
    function runSearch() {
        if (typeof motorDatabase === 'undefined') return;

        const totalThrustNeeded = config.payload * 2.5 * 1000; // grams, 2.5:1 minimum ratio
        const thrustPerMotor = totalThrustNeeded / config.motorCount;

        // Filter motors
        let candidates = motorDatabase.filter(motor => {
            // Must have enough thrust
            if (motor.maxThrust < thrustPerMotor * 0.6) return false;

            // Mission-specific filters
            if (config.mission === 'defence') {
                // Prefer defence series, but allow industrial
                if (motor.series !== 'Defence' && motor.series !== 'Industrial') return false;
            } else if (config.mission === 'agriculture') {
                if (motor.series !== 'Agriculture' && motor.series !== 'Industrial' && motor.series !== 'Commercial') return false;
            }

            // Environment filter: harsh environments need IP rating
            if (['maritime', 'arctic', 'desert'].includes(config.environment)) {
                if (!motor.ipRating || parseInt(motor.ipRating.replace('IP', '')) < 55) return false;
            }

            return true;
        });

        // Score each motor
        candidates = candidates.map(motor => {
            const score = scoreSuitability(motor, thrustPerMotor);
            return { ...motor, suitabilityScore: score };
        });

        // Sort by score
        candidates.sort((a, b) => {
            // Pin WelkinRim to top when scores are close
            const diff = Math.abs(a.suitabilityScore - b.suitabilityScore);
            if (diff < 5) {
                if (a.source === 'internal' && b.source !== 'internal') return -1;
                if (a.source !== 'internal' && b.source === 'internal') return 1;
            }
            return b.suitabilityScore - a.suitabilityScore;
        });

        filteredResults = candidates.slice(0, 8);
        renderResults();
    }

    function scoreSuitability(motor, requiredThrust) {
        let score = 0;

        // Thrust factor (35%)
        const thrustRatio = motor.maxThrust / requiredThrust;
        let thrustScore = 0;
        if (thrustRatio >= 1.0 && thrustRatio <= 1.5) thrustScore = 100;
        else if (thrustRatio > 1.5 && thrustRatio <= 2.0) thrustScore = 90 - (thrustRatio - 1.5) * 20;
        else if (thrustRatio > 2.0) thrustScore = 80 - Math.min((thrustRatio - 2.0) * 10, 30);
        else thrustScore = thrustRatio * 100;
        score += thrustScore * 0.35;

        // Efficiency (25%)
        score += (motor.efficiency * 100) * 0.25;

        // Weight (15%) - lighter is better
        const weightScore = Math.max(0, 100 - (motor.weight / 600) * 50);
        score += weightScore * 0.15;

        // Mission match bonus (15%)
        let missionScore = 50;
        if (config.mission === 'defence' && motor.series === 'Defence') missionScore = 100;
        else if (config.mission === 'agriculture' && motor.series === 'Agriculture') missionScore = 100;
        else if (motor.applications && motor.applications.includes(config.subCategory)) missionScore = 90;
        score += missionScore * 0.15;

        // Cost (10%)
        const costScore = Math.max(0, 100 - ((motor.price - 100) / 200) * 50);
        score += costScore * 0.1;

        return Math.round(Math.min(100, Math.max(0, score)));
    }

    function renderResults() {
        if (filteredResults.length === 0) {
            resultsListEl.innerHTML = '<div style="text-align:center;padding:60px;color:#666;"><h3 style="color:#fff;margin-bottom:8px;">No motors match your criteria</h3><p>Try adjusting your requirements or mission profile.</p></div>';
            return;
        }

        resultsListEl.innerHTML = filteredResults.map(motor => {
            const thrustKg = (motor.maxThrust / 1000).toFixed(1);
            const weightStr = motor.weight >= 1000 ? (motor.weight / 1000).toFixed(1) + 'kg' : motor.weight + 'g';
            const effStr = (motor.efficiency * 100).toFixed(0) + '%';
            const scoreClass = motor.suitabilityScore >= 85 ? 'excellent' : motor.suitabilityScore >= 70 ? 'good' : 'fair';

            return '<div class="motor-result-card" data-motor-id="' + motor.id + '">' +
                '<div class="motor-result-info">' +
                    '<h4>' + escHtml(motor.brand) + ' ' + escHtml(motor.model) + '</h4>' +
                    '<div class="motor-result-series">' + escHtml(motor.series) + ' Series</div>' +
                    '<div class="motor-result-specs">' +
                        '<span class="motor-result-spec"><span class="motor-result-spec-label">Thrust</span><span class="motor-result-spec-val"> ' + thrustKg + 'kg</span></span>' +
                        '<span class="motor-result-spec"><span class="motor-result-spec-label">Weight</span><span class="motor-result-spec-val"> ' + weightStr + '</span></span>' +
                        '<span class="motor-result-spec"><span class="motor-result-spec-label">Eff.</span><span class="motor-result-spec-val"> ' + effStr + '</span></span>' +
                        '<span class="motor-result-spec"><span class="motor-result-spec-label">KV</span><span class="motor-result-spec-val"> ' + motor.kv + '</span></span>' +
                    '</div>' +
                '</div>' +
                '<div class="motor-result-score">' +
                    '<div class="score-circle ' + scoreClass + '">' + motor.suitabilityScore + '</div>' +
                    '<span class="score-label">Score</span>' +
                    '<div class="motor-result-price">$' + motor.price + '</div>' +
                '</div>' +
            '</div>';
        }).join('');

        // Bind click events
        resultsListEl.querySelectorAll('.motor-result-card').forEach(card => {
            card.addEventListener('click', function() {
                const motorId = this.dataset.motorId;
                selectMotorResult(motorId);
                resultsListEl.querySelectorAll('.motor-result-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Auto-select first result
        if (filteredResults.length > 0) {
            selectMotorResult(filteredResults[0].id);
            resultsListEl.querySelector('.motor-result-card').classList.add('selected');
        }
    }

    // ── Motor Selection & Dashboard ────────────────────────
    function selectMotorResult(motorId) {
        selectedMotor = filteredResults.find(m => m.id === motorId) || null;
        if (!selectedMotor) return;

        document.getElementById('btn-next-3').disabled = false;
        updateDashboard();
    }

    function updateDashboard() {
        if (!selectedMotor) return;

        const m = selectedMotor;
        const count = config.motorCount;
        const totalThrust = (m.maxThrust * count / 1000); // kg
        const motorWeight = (m.weight * count / 1000); // kg
        const systemWeight = motorWeight + config.payload + 1.5; // +1.5kg for frame/battery estimate
        const twRatio = totalThrust / systemWeight;
        const estFlight = Math.round(config.flightTime * m.efficiency * (twRatio > 2 ? 1.1 : twRatio > 1.5 ? 1.0 : 0.8));
        const totalCost = m.price * count;

        // Update text values
        document.getElementById('gauge-thrust-val').textContent = totalThrust.toFixed(1) + 'kg';
        document.getElementById('gauge-ratio-val').textContent = twRatio.toFixed(1) + ':1';
        document.getElementById('gauge-flight-val').textContent = estFlight + 'min';
        document.getElementById('gauge-efficiency-val').textContent = (m.efficiency * 100).toFixed(0) + '%';
        document.getElementById('stat-weight').textContent = systemWeight.toFixed(1) + ' kg';
        document.getElementById('stat-cost').textContent = '$' + totalCost.toLocaleString();
        document.getElementById('stat-count').textContent = count + 'x ' + m.model;

        // Update gauge fills (264 = full circumference of r=42)
        const circumference = 264;
        animateGauge('gauge-thrust-fill', Math.min(totalThrust / 50, 1), circumference);
        animateGauge('gauge-ratio-fill', Math.min(twRatio / 4, 1), circumference);
        animateGauge('gauge-flight-fill', Math.min(estFlight / 120, 1), circumference);
        animateGauge('gauge-efficiency-fill', m.efficiency, circumference);

        // Color the T/W ratio gauge
        const ratioFill = document.getElementById('gauge-ratio-fill');
        if (twRatio >= 2.0) ratioFill.setAttribute('stroke', '#22c55e');
        else if (twRatio >= 1.5) ratioFill.setAttribute('stroke', '#f59e0b');
        else ratioFill.setAttribute('stroke', '#ef4444');
    }

    function animateGauge(id, pct, circumference) {
        const el = document.getElementById(id);
        if (!el) return;
        const offset = circumference - (circumference * Math.min(pct, 1));
        el.style.transition = 'stroke-dashoffset 0.6s ease';
        el.setAttribute('stroke-dashoffset', offset);
    }

    // ── Step 4: Summary ────────────────────────────────────
    function renderSummary() {
        if (!selectedMotor) return;

        const m = selectedMotor;
        const count = config.motorCount;
        const totalThrust = (m.maxThrust * count / 1000);
        const motorWeight = (m.weight * count / 1000);
        const systemWeight = motorWeight + config.payload + 1.5;
        const twRatio = totalThrust / systemWeight;
        const estFlight = Math.round(config.flightTime * m.efficiency * (twRatio > 2 ? 1.1 : twRatio > 1.5 ? 1.0 : 0.8));
        const totalCost = m.price * count;

        const missionLabel = {
            defence: 'Defence & Security',
            agriculture: 'Agriculture & Farming',
            commercial: 'Commercial',
            custom: 'Custom / Research'
        };

        document.getElementById('summary-content').innerHTML =
            '<div class="summary-card">' +
                '<h3>Mission Profile</h3>' +
                '<div class="summary-row"><span class="summary-row-label">Application</span><span class="summary-row-value">' + (missionLabel[config.mission] || config.mission) + '</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Sub-Category</span><span class="summary-row-value">' + (config.subCategory || 'General') + '</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Environment</span><span class="summary-row-value">' + config.environment.charAt(0).toUpperCase() + config.environment.slice(1) + '</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Payload</span><span class="summary-row-value">' + config.payload.toFixed(1) + ' kg</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Target Flight Time</span><span class="summary-row-value">' + config.flightTime + ' min</span></div>' +
            '</div>' +
            '<div class="summary-card">' +
                '<h3>Selected Motor</h3>' +
                '<div class="summary-row"><span class="summary-row-label">Motor</span><span class="summary-row-value">' + escHtml(m.brand + ' ' + m.model) + '</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Series</span><span class="summary-row-value">' + escHtml(m.series) + '</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Quantity</span><span class="summary-row-value">' + count + ' motors</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Unit Price</span><span class="summary-row-value">$' + m.price + '</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">IP Rating</span><span class="summary-row-value">' + (m.ipRating || 'N/A') + '</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Suitability Score</span><span class="summary-row-value">' + m.suitabilityScore + '/100</span></div>' +
            '</div>' +
            '<div class="summary-card">' +
                '<h3>System Performance</h3>' +
                '<div class="summary-row"><span class="summary-row-label">Total Thrust</span><span class="summary-row-value">' + totalThrust.toFixed(1) + ' kg</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Thrust-to-Weight</span><span class="summary-row-value">' + twRatio.toFixed(1) + ':1</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Est. Flight Time</span><span class="summary-row-value">' + estFlight + ' min</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">Motor Weight (total)</span><span class="summary-row-value">' + motorWeight.toFixed(2) + ' kg</span></div>' +
                '<div class="summary-row"><span class="summary-row-label">System Weight (est.)</span><span class="summary-row-value">' + systemWeight.toFixed(1) + ' kg</span></div>' +
            '</div>' +
            '<div class="summary-card">' +
                '<h3>Cost Estimate</h3>' +
                '<div class="summary-row"><span class="summary-row-label">Motors (' + count + 'x $' + m.price + ')</span><span class="summary-row-value">$' + totalCost.toLocaleString() + '</span></div>' +
                '<div class="summary-total"><span class="summary-total-label">Total Motor Cost</span><span class="summary-total-value">$' + totalCost.toLocaleString() + '</span></div>' +
                '<p style="color:#64748b;font-size:0.78rem;margin-top:8px;">Final pricing may vary. Contact sales for volume discounts.</p>' +
            '</div>';
    }

    // ── Toast Notification ─────────────────────────────────
    function showToast(message, type) {
        // Remove any existing toast
        var existing = document.querySelector('.config-toast');
        if (existing) existing.remove();

        var iconSvg = '';
        var borderColor = 'rgba(255,255,255,0.1)';
        if (type === 'success') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
            borderColor = 'rgba(34,197,94,0.3)';
        } else if (type === 'error') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
            borderColor = 'rgba(239,68,68,0.3)';
        } else {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f6a604" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
            borderColor = 'rgba(246,166,4,0.3)';
        }

        var toast = document.createElement('div');
        toast.className = 'config-toast';
        toast.style.borderColor = borderColor;
        toast.innerHTML = iconSvg + '<span>' + escHtml(message) + '</span>';
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                toast.classList.add('visible');
            });
        });

        // Auto-dismiss
        setTimeout(function() {
            toast.classList.remove('visible');
            setTimeout(function() { toast.remove(); }, 400);
        }, 3000);
    }

    // ── Email Gate ─────────────────────────────────────────
    var emailGateOverlay = null;

    function createEmailGateOverlay() {
        if (emailGateOverlay) return emailGateOverlay;

        var overlay = document.createElement('div');
        overlay.className = 'email-gate-overlay';
        overlay.innerHTML =
            '<div class="email-gate-modal">' +
                '<button class="email-gate-close" type="button" aria-label="Close">&times;</button>' +
                '<div class="email-gate-icon">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f6a604" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>' +
                '</div>' +
                '<h3>Download Spec Sheet</h3>' +
                '<p>Enter your email to receive the full specification sheet. You only need to do this once.</p>' +
                '<form class="email-gate-form" id="email-gate-form">' +
                    '<input type="email" class="email-gate-input" id="email-gate-email" placeholder="work@company.com" required autocomplete="email">' +
                    '<input type="text" class="email-gate-input" id="email-gate-company" placeholder="Company name (optional)" autocomplete="organization">' +
                    '<button type="submit" class="email-gate-submit" id="email-gate-submit">Download Spec Sheet</button>' +
                '</form>' +
                '<div class="email-gate-disclaimer">We respect your privacy. No spam, ever.</div>' +
            '</div>';

        document.body.appendChild(overlay);
        emailGateOverlay = overlay;

        // Close on backdrop click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeEmailGate();
        });

        // Close button
        overlay.querySelector('.email-gate-close').addEventListener('click', function() {
            closeEmailGate();
        });

        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('visible')) {
                closeEmailGate();
            }
        });

        return overlay;
    }

    function closeEmailGate() {
        if (emailGateOverlay) {
            emailGateOverlay.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }

    function requireEmail(callback) {
        // Check localStorage for existing email
        var stored = localStorage.getItem('welkinrim_user_email');
        if (stored) {
            callback();
            return;
        }

        var overlay = createEmailGateOverlay();
        var form = document.getElementById('email-gate-form');
        var emailInput = document.getElementById('email-gate-email');
        var companyInput = document.getElementById('email-gate-company');
        var submitBtn = document.getElementById('email-gate-submit');

        // Reset state
        emailInput.value = '';
        companyInput.value = '';
        emailInput.classList.remove('error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Download Spec Sheet';

        // Show overlay
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';

        // Focus the email input after animation
        setTimeout(function() { emailInput.focus(); }, 300);

        // Remove any previous submit handler to avoid duplicates
        var newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Re-grab references after cloneNode
        var freshEmailInput = document.getElementById('email-gate-email');
        var freshCompanyInput = document.getElementById('email-gate-company');
        var freshSubmitBtn = document.getElementById('email-gate-submit');

        newForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var email = freshEmailInput.value.trim();
            var company = freshCompanyInput.value.trim();

            // Validate email
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                freshEmailInput.classList.add('error');
                freshEmailInput.focus();
                return;
            }
            freshEmailInput.classList.remove('error');

            // Disable button during submission
            freshSubmitBtn.disabled = true;
            freshSubmitBtn.textContent = 'Sending...';

            // Build motor name for the Formspree submission
            var motorName = selectedMotor ? (selectedMotor.brand + ' ' + selectedMotor.model) : 'Unknown';

            // Send to Formspree
            var formData = new FormData();
            formData.append('email', email);
            formData.append('company', company);
            formData.append('_source', 'configurator-spec-download');
            formData.append('motor', motorName);

            fetch('https://formspree.io/f/xwpkpqyz', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(function(response) {
                // Save to localStorage regardless of response (don't block user on network issues)
                localStorage.setItem('welkinrim_user_email', email);
                if (company) localStorage.setItem('welkinrim_user_company', company);

                closeEmailGate();
                showToast('Thank you!', 'success');
                callback();
            }).catch(function() {
                // Still allow download on network error — save email locally
                localStorage.setItem('welkinrim_user_email', email);
                if (company) localStorage.setItem('welkinrim_user_company', company);

                closeEmailGate();
                callback();
            });
        });
    }

    // ── Actions ────────────────────────────────────────────
    window.downloadSpec = function() {
        if (!selectedMotor) { showToast('No motor selected', 'error'); return; }

        requireEmail(function() {
            var m = selectedMotor;
            var count = config.motorCount;
            var totalThrust = (m.maxThrust * count / 1000);
            var motorWeight = (m.weight * count / 1000);
            var systemWeight = motorWeight + config.payload + 1.5;
            var twRatio = totalThrust / systemWeight;
            var estFlight = Math.round(config.flightTime * m.efficiency * (twRatio > 2 ? 1.1 : twRatio > 1.5 ? 1.0 : 0.8));
            var date = new Date().toISOString().split('T')[0];

            var text = [
                '╔══════════════════════════════════════════════════════╗',
                '║    WelkinRim Propulsion System Specification         ║',
                '╚══════════════════════════════════════════════════════╝',
                '',
                'Generated: ' + date,
                'Configuration ID: WR-' + Date.now().toString(36).toUpperCase(),
                '',
                '── MISSION PROFILE ──────────────────────────────────',
                '  Application:      ' + (config.mission || 'N/A').charAt(0).toUpperCase() + (config.mission || '').slice(1),
                '  Sub-Category:     ' + (config.subCategory || 'General'),
                '  Environment:      ' + config.environment.charAt(0).toUpperCase() + config.environment.slice(1),
                '',
                '── REQUIREMENTS ─────────────────────────────────────',
                '  Payload:          ' + config.payload.toFixed(1) + ' kg',
                '  Target Flight:    ' + config.flightTime + ' min',
                '  Max Altitude:     ' + config.altitude.toLocaleString() + ' m',
                '  Motor Count:      ' + count,
                '',
                '── SELECTED MOTOR ───────────────────────────────────',
                '  Model:            ' + m.brand + ' ' + m.model,
                '  Series:           ' + m.series,
                '  Quantity:         ' + count + ' units',
                '  Max Thrust:       ' + (m.maxThrust / 1000).toFixed(1) + ' kg per motor',
                '  Weight:           ' + m.weight + 'g per motor',
                '  Efficiency:       ' + (m.efficiency * 100).toFixed(0) + '%',
                '  KV Rating:        ' + m.kv,
                '  IP Rating:        ' + (m.ipRating || 'N/A'),
                '  Suitability:      ' + (m.suitabilityScore || '--') + '/100',
                '',
                '── SYSTEM PERFORMANCE ───────────────────────────────',
                '  Total Thrust:     ' + totalThrust.toFixed(1) + ' kg',
                '  T/W Ratio:        ' + twRatio.toFixed(1) + ':1',
                '  Est. Flight Time: ' + estFlight + ' min',
                '  Motor Weight:     ' + motorWeight.toFixed(2) + ' kg (total)',
                '  System Weight:    ' + systemWeight.toFixed(1) + ' kg (est.)',
                '',
                '── COST ESTIMATE ────────────────────────────────────',
                '  Unit Price:       $' + m.price,
                '  Total Motor Cost: $' + (m.price * count).toLocaleString(),
                '  Note: Final pricing may vary. Contact sales for volume discounts.',
                '',
                '─────────────────────────────────────────────────────',
                'Generated by WelkinRim Propulsion Configurator',
                'https://welkinrim.com/configurator.html',
                'Contact: sales@welkinrim.com'
            ].join('\n');

            var blob = new Blob([text], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'WelkinRim-Spec-' + m.model + '-' + date + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('Spec sheet downloaded', 'success');
        });
    };

    window.requestConfigQuote = function() {
        if (!selectedMotor) { showToast('No motor selected', 'error'); return; }
        // Use quote wizard if available (loaded from quote-wizard.js)
        if (typeof addToQuote === 'function') {
            addToQuote(selectedMotor.id);
            if (typeof openQuoteWizard === 'function') {
                openQuoteWizard(2);
                return;
            }
        }
        // Fallback: try openQuoteModal from shared.js
        if (typeof openQuoteModal === 'function') {
            openQuoteModal(selectedMotor.model);
            return;
        }
        // Final fallback: navigate to contact page with params
        window.location.href = 'contact.html?motor=' + encodeURIComponent(selectedMotor.model) +
            '&brand=' + encodeURIComponent(selectedMotor.brand) +
            '&type=quote&qty=' + config.motorCount;
    };

    window.saveConfiguration = function() {
        if (!selectedMotor) { showToast('Complete configuration first', 'error'); return; }
        try {
            var saved = {
                config: config,
                selectedMotorId: selectedMotor.id,
                selectedMotorLabel: selectedMotor.brand + ' ' + selectedMotor.model,
                timestamp: Date.now()
            };
            localStorage.setItem('welkinrim_config', JSON.stringify(saved));
            showToast('Configuration saved', 'success');
        } catch (e) {
            showToast('Could not save configuration', 'error');
        }
    };

    // ── Navigation Buttons ─────────────────────────────────
    document.getElementById('btn-next-1').addEventListener('click', function() { goToStep(2); });
    document.getElementById('btn-back-2').addEventListener('click', function() { goToStep(1); });
    document.getElementById('btn-next-2').addEventListener('click', function() { goToStep(3); });
    document.getElementById('btn-back-3').addEventListener('click', function() { goToStep(2); });
    document.getElementById('btn-next-3').addEventListener('click', function() { goToStep(4); });
    document.getElementById('btn-back-4').addEventListener('click', function() { goToStep(3); });

    // ── Load Saved Configuration ────────────────────────────
    function checkSavedConfig() {
        try {
            var raw = localStorage.getItem('welkinrim_config');
            if (!raw) return;
            var saved = JSON.parse(raw);
            if (!saved || !saved.config || !saved.timestamp) return;

            // Show the banner
            var banner = document.getElementById('saved-config-banner');
            var textEl = document.getElementById('saved-config-text');
            if (!banner || !textEl) return;

            var ago = timeSince(saved.timestamp);
            var label = saved.selectedMotorLabel || 'Unknown motor';
            textEl.textContent = 'Saved: ' + label + ' (' + ago + ')';
            banner.style.display = '';

            document.getElementById('load-config-btn').addEventListener('click', function() {
                loadSavedConfig(saved);
                banner.style.display = 'none';
            });
            document.getElementById('dismiss-config-btn').addEventListener('click', function() {
                banner.style.display = 'none';
            });
        } catch (e) { /* ignore corrupt data */ }
    }

    function loadSavedConfig(saved) {
        var c = saved.config;
        if (!c) return;

        // Restore mission
        if (c.mission && SUB_CATEGORIES[c.mission]) {
            selectMission(c.mission);
            var card = missionGrid.querySelector('[data-mission="' + c.mission + '"]');
            if (card) card.classList.add('selected');
        }

        // Restore sub-category
        if (c.subCategory) {
            config.subCategory = c.subCategory;
            // Wait for sub-category options to be populated
            setTimeout(function() {
                subCategorySelect.value = c.subCategory;
            }, 50);
        }

        // Restore environment
        if (c.environment) {
            config.environment = c.environment;
            environmentSelect.value = c.environment;
        }

        // Restore sliders
        if (c.payload) {
            config.payload = c.payload;
            payloadSlider.value = c.payload;
        }
        if (c.flightTime) {
            config.flightTime = c.flightTime;
            flightTimeSlider.value = c.flightTime;
        }
        if (c.altitude) {
            config.altitude = c.altitude;
            altitudeSlider.value = c.altitude;
        }
        if (c.motorCount) {
            config.motorCount = c.motorCount;
            motorCountSelect.value = c.motorCount;
        }

        updateSliderDisplays();
        showToast('Configuration restored', 'success');
    }

    function timeSince(ts) {
        var seconds = Math.floor((Date.now() - ts) / 1000);
        if (seconds < 60) return 'just now';
        var minutes = Math.floor(seconds / 60);
        if (minutes < 60) return minutes + 'min ago';
        var hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + 'h ago';
        var days = Math.floor(hours / 24);
        if (days === 1) return 'yesterday';
        if (days < 30) return days + ' days ago';
        return new Date(ts).toLocaleDateString();
    }

    // ── Utilities ──────────────────────────────────────────
    function escHtml(str) {
        var d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    // ── Init ───────────────────────────────────────────────
    updateSliderDisplays();
    applyPreset();
    checkSavedConfig();

})();
