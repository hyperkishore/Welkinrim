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

    // ── Actions ────────────────────────────────────────────
    window.downloadSpec = function() {
        if (!selectedMotor) return;
        const m = selectedMotor;
        const count = config.motorCount;
        const totalThrust = (m.maxThrust * count / 1000);
        const motorWeight = (m.weight * count / 1000);
        const systemWeight = motorWeight + config.payload + 1.5;
        const twRatio = totalThrust / systemWeight;

        const text = [
            'WelkinRim Propulsion System Specification',
            '==========================================',
            '',
            'Mission: ' + (config.mission || 'N/A'),
            'Sub-Category: ' + (config.subCategory || 'General'),
            'Environment: ' + config.environment,
            '',
            'REQUIREMENTS',
            '  Payload: ' + config.payload.toFixed(1) + ' kg',
            '  Target Flight Time: ' + config.flightTime + ' min',
            '  Max Altitude: ' + config.altitude + ' m',
            '',
            'SELECTED MOTOR',
            '  Model: ' + m.brand + ' ' + m.model,
            '  Series: ' + m.series,
            '  Quantity: ' + count,
            '  Max Thrust: ' + (m.maxThrust / 1000).toFixed(1) + ' kg per motor',
            '  Weight: ' + m.weight + 'g per motor',
            '  Efficiency: ' + (m.efficiency * 100).toFixed(0) + '%',
            '  KV: ' + m.kv,
            '  IP Rating: ' + (m.ipRating || 'N/A'),
            '',
            'SYSTEM PERFORMANCE',
            '  Total Thrust: ' + totalThrust.toFixed(1) + ' kg',
            '  Thrust-to-Weight Ratio: ' + twRatio.toFixed(1) + ':1',
            '  Estimated System Weight: ' + systemWeight.toFixed(1) + ' kg',
            '',
            'COST',
            '  Unit Price: $' + m.price,
            '  Total Motor Cost: $' + (m.price * count).toLocaleString(),
            '',
            'Generated by WelkinRim Configurator',
            'https://welkinrim.com/configurator.html'
        ].join('\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'WelkinRim-System-Spec-' + m.model + '.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    window.requestConfigQuote = function() {
        if (!selectedMotor) return;
        // Use quote wizard if available
        if (typeof addToQuote === 'function') {
            addToQuote(selectedMotor.id);
            if (typeof openQuoteWizard === 'function') {
                openQuoteWizard(2);
            }
        } else {
            window.location.href = 'contact.html?motor=' + encodeURIComponent(selectedMotor.model) + '&brand=' + encodeURIComponent(selectedMotor.brand) + '&type=quote&qty=' + config.motorCount;
        }
    };

    window.saveConfiguration = function() {
        try {
            sessionStorage.setItem('welkinrim_config', JSON.stringify({
                config: config,
                selectedMotorId: selectedMotor ? selectedMotor.id : null,
                timestamp: Date.now()
            }));
            // Visual feedback
            var btn = event.target;
            var orig = btn.textContent;
            btn.textContent = 'Saved!';
            btn.style.borderColor = '#22c55e';
            btn.style.color = '#22c55e';
            setTimeout(function() {
                btn.textContent = orig;
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2000);
        } catch (e) { /* ignore */ }
    };

    // ── Navigation Buttons ─────────────────────────────────
    document.getElementById('btn-next-1').addEventListener('click', function() { goToStep(2); });
    document.getElementById('btn-back-2').addEventListener('click', function() { goToStep(1); });
    document.getElementById('btn-next-2').addEventListener('click', function() { goToStep(3); });
    document.getElementById('btn-back-3').addEventListener('click', function() { goToStep(2); });
    document.getElementById('btn-next-3').addEventListener('click', function() { goToStep(4); });
    document.getElementById('btn-back-4').addEventListener('click', function() { goToStep(3); });

    // ── Utilities ──────────────────────────────────────────
    function escHtml(str) {
        var d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    // ── Init ───────────────────────────────────────────────
    updateSliderDisplays();
    applyPreset();

})();
