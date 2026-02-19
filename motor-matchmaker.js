// Motor Matchmaker - Main JavaScript functionality

// Global variables
let searchResults = [];
let selectedMotors = new Set();
let currentSortMethod = 'score';

// DOM Elements
const form = document.getElementById('motor-search-form');
const searchButton = document.getElementById('search-button');
const initialState = document.getElementById('initial-state');
const loadingState = document.getElementById('loading-state');
const resultsHeader = document.getElementById('results-header');
const resultsContainer = document.getElementById('results-container');
const noResults = document.getElementById('no-results');
const resultsTbody = document.getElementById('results-tbody');
const resultCount = document.getElementById('result-count');
const compareButton = document.getElementById('compare-button');
const compareCount = document.getElementById('compare-count');
const sortSelect = document.getElementById('sort-select');
const selectAllCheckbox = document.getElementById('select-all');
const comparisonDrawer = document.getElementById('comparison-drawer');
const drawerClose = document.getElementById('drawer-close');
const comparisonContent = document.getElementById('comparison-content');
const quoteModal = document.getElementById('quote-modal');
const modalClose = document.getElementById('modal-close');
const quoteModalBody = document.getElementById('quote-modal-body');

// Track trigger elements for focus restoration
let drawerTriggerElement = null;
let modalTriggerElement = null;

// Initialize event listeners
function initializeEventListeners() {
    // Form submission
    form.addEventListener('submit', handleSearch);

    // Sort selection
    sortSelect.addEventListener('change', (e) => {
        currentSortMethod = e.target.value;
        displayResults(searchResults);
    });

    // Select all checkbox
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.motor-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = e.target.checked;
            handleMotorSelection(cb);
        });
    });

    // Compare button
    compareButton.addEventListener('click', () => {
        drawerTriggerElement = document.activeElement;
        showComparison();
    });

    // Drawer close
    drawerClose.addEventListener('click', () => {
        closeDrawer();
    });

    // Modal close
    modalClose.addEventListener('click', () => {
        closeModal();
    });

    // Click outside modal to close
    quoteModal.addEventListener('click', (e) => {
        if (e.target === quoteModal) {
            closeModal();
        }
    });

    // Escape key to close modals/drawer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (quoteModal.classList.contains('open')) {
                closeModal();
            } else if (comparisonDrawer.classList.contains('open')) {
                closeDrawer();
            }
        }
    });

    // Focus trap for quote modal
    quoteModal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            trapFocus(e, quoteModal.querySelector('.modal-content'));
        }
    });

    // Focus trap for comparison drawer
    comparisonDrawer.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            trapFocus(e, comparisonDrawer);
        }
    });

    // Enable/disable search button based on required fields
    form.addEventListener('input', validateForm);
}

// Close comparison drawer and restore focus
function closeDrawer() {
    comparisonDrawer.classList.remove('open');
    if (drawerTriggerElement) {
        drawerTriggerElement.focus();
        drawerTriggerElement = null;
    }
}

// Close quote modal and restore focus
function closeModal() {
    quoteModal.classList.remove('open');
    if (modalTriggerElement) {
        modalTriggerElement.focus();
        modalTriggerElement = null;
    }
}

// Trap focus within a container (Tab cycles within modal)
function trapFocus(e, container) {
    const focusable = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
        if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
    } else {
        if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
}

// Validate form and enable/disable search button
function validateForm() {
    const requiredFields = form.querySelectorAll('[required]');
    let allValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value) {
            allValid = false;
        }
    });
    
    searchButton.disabled = !allValid;
}

// Handle search form submission
async function handleSearch(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const searchParams = {
        allUpWeight: parseFloat(formData.get('allUpWeight')),
        thrustRatio: parseFloat(formData.get('thrustRatio')),
        batteryVoltage: parseInt(formData.get('batteryVoltage')),
        propMin: parseFloat(formData.get('propMin')),
        propMax: parseFloat(formData.get('propMax')),
        flightTime: formData.get('flightTime') ? parseInt(formData.get('flightTime')) : null,
        payloadMass: formData.get('payloadMass') ? parseFloat(formData.get('payloadMass')) : null,
        motorWeight: formData.get('motorWeight') ? parseInt(formData.get('motorWeight')) : null,
        kvPreference: formData.get('kvPreference') ? parseInt(formData.get('kvPreference')) : null,
        ipRating: formData.get('ipRating') || null,
        annualVolume: formData.get('annualVolume') ? parseInt(formData.get('annualVolume')) : null,
        vendors: Array.from(formData.getAll('vendors')),
        missionType: formData.get('missionType') || null
    };
    
    // Show loading state
    showLoadingState();
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Perform search
    searchResults = searchMotors(searchParams);
    
    // Display results
    if (searchResults.length > 0) {
        displayResults(searchResults);
    } else {
        showNoResults();
    }
}

// Mission type series mapping
const missionSeriesMap = {
    defence: ['Defence', 'Industrial'],
    agriculture: ['Agriculture', 'Commercial', 'Industrial'],
    commercial: ['Commercial', 'Industrial'],
    industrial: ['Industrial', 'Commercial']
};

// Search algorithm
function searchMotors(params) {
    let results = [];

    // Calculate required thrust per motor (assuming quadcopter by default)
    const motorCount = 4;
    const totalThrust = params.allUpWeight * params.thrustRatio * 1000;
    const thrustPerMotor = totalThrust / motorCount;

    // Filter motors
    const filteredMotors = motorDatabase.filter(motor => {
        // Mission type filter — prioritize but don't exclude
        // (scoring will boost mission-matched motors instead)

        // Voltage compatibility
        if (motor.voltageMin > params.batteryVoltage || motor.voltageMax < params.batteryVoltage) {
            return false;
        }
        
        // Propeller range
        const [motorPropMin, motorPropMax] = motor.propRange.split('-').map(Number);
        if (motorPropMax < params.propMin || motorPropMin > params.propMax) {
            return false;
        }
        
        // Thrust capability
        if (motor.maxThrust < thrustPerMotor * 0.8) { // 80% minimum threshold
            return false;
        }
        
        // IP Rating
        if (params.ipRating && motor.ipRating) {
            const requiredRating = parseInt(params.ipRating.replace('IP', ''));
            const motorRating = parseInt(motor.ipRating.replace('IP', ''));
            if (motorRating < requiredRating) {
                return false;
            }
        }
        
        // Vendor filter
        if (params.vendors.length > 0) {
            const motorVendor = motor.brand.toLowerCase().replace(' ', '-');
            if (!params.vendors.includes(motorVendor)) {
                return false;
            }
        }
        
        // KV preference (±15% tolerance)
        if (params.kvPreference) {
            const kvTolerance = params.kvPreference * 0.15;
            if (Math.abs(motor.kv - params.kvPreference) > kvTolerance) {
                return false;
            }
        }
        
        return true;
    });
    
    // Calculate suitability scores
    results = filteredMotors.map(motor => {
        const score = calculateSuitabilityScore(motor, params, thrustPerMotor);
        return { ...motor, score };
    });
    
    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);
    
    // Pin internal motors to top when score difference < 5 points
    results = prioritizeInternalMotors(results);
    
    // Return top 10 results
    return results.slice(0, 10);
}

// Calculate suitability score (0-100)
function calculateSuitabilityScore(motor, params, requiredThrust) {
    let score = 0;

    // Adjust weights based on mission type
    let thrustWeight = 0.35;
    let efficiencyWeight = 0.20;
    let weightWeight = 0.15;
    let flightTimeWeight = 0.15;
    let costWeight = 0.10;
    let missionBonusWeight = 0.05;

    if (params.missionType === 'defence') {
        // Defence: thrust and reliability matter more, cost matters less
        thrustWeight = 0.35;
        efficiencyWeight = 0.15;
        weightWeight = 0.10;
        flightTimeWeight = 0.15;
        costWeight = 0.05;
        missionBonusWeight = 0.20;
    } else if (params.missionType === 'agriculture') {
        // Agriculture: efficiency and flight time matter most
        thrustWeight = 0.25;
        efficiencyWeight = 0.25;
        weightWeight = 0.10;
        flightTimeWeight = 0.20;
        costWeight = 0.05;
        missionBonusWeight = 0.15;
    }

    // Thrust factor
    const thrustRatio = motor.maxThrust / requiredThrust;
    let thrustScore = 0;
    if (thrustRatio >= 1.0 && thrustRatio <= 1.5) {
        thrustScore = 100;
    } else if (thrustRatio > 1.5 && thrustRatio <= 2.0) {
        thrustScore = 90 - (thrustRatio - 1.5) * 20;
    } else if (thrustRatio > 2.0) {
        thrustScore = 80 - Math.min((thrustRatio - 2.0) * 10, 30);
    } else {
        thrustScore = thrustRatio * 100;
    }
    score += thrustScore * thrustWeight;

    // Efficiency
    const efficiencyScore = motor.efficiency * 100;
    score += efficiencyScore * efficiencyWeight;

    // Weight penalty
    let weightScore = 100;
    if (params.motorWeight) {
        const weightDiff = Math.abs(motor.weight - params.motorWeight) / params.motorWeight;
        weightScore = Math.max(0, 100 - weightDiff * 100);
    } else {
        weightScore = Math.max(0, 100 - (motor.weight / 500) * 50);
    }
    score += weightScore * weightWeight;

    // Flight time bonus
    let flightTimeScore = 80;
    if (params.flightTime) {
        const estimatedFlightTime = (30 * motor.efficiency) / (motor.weight / 100);
        flightTimeScore = Math.min(100, (estimatedFlightTime / params.flightTime) * 100);
    }
    score += flightTimeScore * flightTimeWeight;

    // Cost penalty
    const avgPrice = 100;
    const costScore = Math.max(0, 100 - ((motor.price - avgPrice) / avgPrice) * 50);
    score += costScore * costWeight;

    // Mission-type bonus
    let missionScore = 50; // Neutral default
    if (params.missionType) {
        const preferredSeries = missionSeriesMap[params.missionType] || [];
        if (preferredSeries.includes(motor.series)) {
            missionScore = 100;
        }

        // Defence-specific: IP rating and MIL-STD boost
        if (params.missionType === 'defence') {
            if (motor.ipRating) {
                const ipNum = parseInt(motor.ipRating.replace('IP', ''));
                if (ipNum >= 67) missionScore = Math.min(100, missionScore + 15);
                else if (ipNum >= 55) missionScore = Math.min(100, missionScore + 5);
            }
            if (motor.description && motor.description.toLowerCase().includes('mil-std')) {
                missionScore = Math.min(100, missionScore + 10);
            }
        }

        // Agriculture-specific: corrosion resistance and efficiency boost
        if (params.missionType === 'agriculture') {
            if (motor.description && (motor.description.toLowerCase().includes('corrosion') || motor.description.toLowerCase().includes('chemical'))) {
                missionScore = Math.min(100, missionScore + 15);
            }
            if (motor.efficiency >= 0.92) {
                missionScore = Math.min(100, missionScore + 5);
            }
        }
    }
    score += missionScore * missionBonusWeight;

    return Math.round(Math.min(100, Math.max(0, score)));
}

// Prioritize internal motors when scores are close
function prioritizeInternalMotors(results) {
    const scoreDiff = 5;
    const prioritized = [];
    const remaining = [...results];
    
    // First, add all internal motors
    for (let i = remaining.length - 1; i >= 0; i--) {
        if (remaining[i].source === 'internal') {
            prioritized.push(remaining.splice(i, 1)[0]);
        }
    }
    
    // Then add external motors
    prioritized.push(...remaining);
    
    // Re-sort considering the score difference rule
    return prioritized.sort((a, b) => {
        const scoreDifference = Math.abs(a.score - b.score);
        if (scoreDifference < scoreDiff) {
            // Scores are close, prioritize internal
            if (a.source === 'internal' && b.source === 'external') return -1;
            if (a.source === 'external' && b.source === 'internal') return 1;
        }
        return b.score - a.score;
    });
}

// Display states
function showLoadingState() {
    initialState.style.display = 'none';
    loadingState.style.display = 'flex';
    resultsHeader.style.display = 'none';
    resultsContainer.style.display = 'none';
    noResults.style.display = 'none';
}

function showNoResults() {
    loadingState.style.display = 'none';
    noResults.style.display = 'flex';
}

// Display search results
function displayResults(results) {
    // Update UI state
    loadingState.style.display = 'none';
    resultsHeader.style.display = 'flex';
    resultsContainer.style.display = 'block';
    
    // Update result count
    resultCount.textContent = results.length;
    
    // Sort results
    const sortedResults = sortResults(results, currentSortMethod);
    
    // Clear previous results
    resultsTbody.innerHTML = '';
    selectedMotors.clear();
    updateCompareButton();
    
    // Populate results table
    sortedResults.forEach(motor => {
        const row = createResultRow(motor);
        resultsTbody.appendChild(row);
    });
}

// Sort results based on selected method
function sortResults(results, method) {
    const sorted = [...results];
    
    switch (method) {
        case 'score':
            sorted.sort((a, b) => b.score - a.score);
            break;
        case 'thrust':
            sorted.sort((a, b) => b.maxThrust - a.maxThrust);
            break;
        case 'efficiency':
            sorted.sort((a, b) => b.efficiency - a.efficiency);
            break;
        case 'price':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'weight':
            sorted.sort((a, b) => a.weight - b.weight);
            break;
    }
    
    return sorted;
}

// Create result row
function createResultRow(motor) {
    const row = document.createElement('tr');
    row.dataset.motorId = motor.id;
    
    // Score class
    let scoreClass = 'score-fair';
    if (motor.score >= 90) scoreClass = 'score-excellent';
    else if (motor.score >= 75) scoreClass = 'score-good';
    
    // Brand class
    const brandClass = motor.source === 'internal' ? 'brand-welkinrim' : 'brand-external';
    
    // Lead time text
    const leadTimeText = motor.stockQty > 0 ? `${motor.leadTimeWeeks}w (In Stock)` : `${motor.leadTimeWeeks}w`;
    
    row.innerHTML = `
        <td>
            <input type="checkbox" class="motor-checkbox" data-motor-id="${motor.id}">
        </td>
        <td>
            <div class="score-badge ${scoreClass}">${motor.score}</div>
        </td>
        <td>
            <span class="brand-badge ${brandClass}">${motor.brand}</span>
        </td>
        <td><strong>${motor.model}</strong></td>
        <td>${motor.maxThrust}g</td>
        <td>${(motor.maxThrust * motor.voltageMin * 11.1 * motor.maxCurrent / 1000).toFixed(0)}W</td>
        <td>${motor.weight}g</td>
        <td>${motor.kv} KV</td>
        <td>$${motor.price}</td>
        <td>${motor.moq}</td>
        <td>${leadTimeText}</td>
        <td>
            <div class="action-buttons">
                <button class="btn-small btn-view" onclick="viewMotorDetails('${motor.id}')">View</button>
                <button class="btn-small btn-quote" onclick="requestQuote('${motor.id}')">Quote</button>
            </div>
        </td>
    `;
    
    // Add checkbox event listener
    const checkbox = row.querySelector('.motor-checkbox');
    checkbox.addEventListener('change', () => handleMotorSelection(checkbox));
    
    return row;
}

// Handle motor selection for comparison
function handleMotorSelection(checkbox) {
    const motorId = checkbox.dataset.motorId;
    const row = checkbox.closest('tr');
    
    if (checkbox.checked) {
        selectedMotors.add(motorId);
        row.classList.add('selected');
    } else {
        selectedMotors.delete(motorId);
        row.classList.remove('selected');
    }
    
    updateCompareButton();
}

// Update compare button state
function updateCompareButton() {
    const count = selectedMotors.size;
    compareCount.textContent = count;
    compareButton.disabled = count === 0 || count > 5;
}

// Show comparison drawer with visual bar charts and best-in-class highlights
function showComparison() {
    if (selectedMotors.size === 0) return;

    const motors = Array.from(selectedMotors).map(id =>
        searchResults.find(m => m.id === id)
    ).filter(Boolean);

    // Find best-in-class values (higher is better except weight, price, leadTime)
    const bestValues = {
        score: Math.max(...motors.map(m => m.score)),
        maxThrust: Math.max(...motors.map(m => m.maxThrust)),
        weight: Math.min(...motors.map(m => m.weight)),
        efficiency: Math.max(...motors.map(m => m.efficiency)),
        price: Math.min(...motors.map(m => m.price)),
        leadTimeWeeks: Math.min(...motors.map(m => m.leadTimeWeeks))
    };

    // Helper to mark best value
    function bestClass(motor, key, lowerIsBetter) {
        const val = motor[key];
        const best = bestValues[key];
        if (motors.length < 2) return '';
        return val === best ? ' class="best-value"' : '';
    }

    // Visual bar for a spec (percentage of max in group)
    function specBar(value, maxInGroup, color) {
        const pct = maxInGroup > 0 ? Math.round((value / maxInGroup) * 100) : 0;
        return `<div class="spec-bar-track"><div class="spec-bar-fill" style="width:${pct}%;background:${color}"></div></div>`;
    }

    const maxThrust = Math.max(...motors.map(m => m.maxThrust));
    const maxWeight = Math.max(...motors.map(m => m.weight));
    const maxPrice = Math.max(...motors.map(m => m.price));
    const maxKv = Math.max(...motors.map(m => m.kv));

    // Build visual comparison cards
    let cardsHtml = motors.map(m => {
        const brandClass = m.source === 'internal' ? 'brand-welkinrim' : 'brand-external';
        let scoreClass = 'score-fair';
        if (m.score >= 90) scoreClass = 'score-excellent';
        else if (m.score >= 75) scoreClass = 'score-good';

        return `
            <div class="compare-card">
                <div class="compare-card-header">
                    <span class="brand-badge ${brandClass}">${m.brand}</span>
                    <div class="score-badge ${scoreClass}" style="width:36px;height:36px;font-size:0.85rem;">${m.score}</div>
                </div>
                <h4 class="compare-card-model">${m.model}</h4>

                <div class="compare-bars">
                    <div class="compare-bar-row">
                        <span class="bar-label">Thrust</span>
                        <span class="bar-value"${bestClass(m, 'maxThrust', false)}>${m.maxThrust}g</span>
                    </div>
                    ${specBar(m.maxThrust, maxThrust, '#4caf50')}

                    <div class="compare-bar-row">
                        <span class="bar-label">Efficiency</span>
                        <span class="bar-value"${bestClass(m, 'efficiency', false)}>${(m.efficiency * 100).toFixed(0)}%</span>
                    </div>
                    ${specBar(m.efficiency, 1, '#2196f3')}

                    <div class="compare-bar-row">
                        <span class="bar-label">Weight</span>
                        <span class="bar-value"${bestClass(m, 'weight', true)}>${m.weight}g</span>
                    </div>
                    ${specBar(m.weight, maxWeight, '#ff9800')}

                    <div class="compare-bar-row">
                        <span class="bar-label">KV</span>
                        <span class="bar-value">${m.kv}</span>
                    </div>
                    ${specBar(m.kv, maxKv, '#9c27b0')}
                </div>

                <div class="compare-specs-grid">
                    <div class="compare-spec"><span>Voltage</span><strong>${m.voltageMin}S-${m.voltageMax}S</strong></div>
                    <div class="compare-spec"><span>Props</span><strong>${m.propRange}"</strong></div>
                    <div class="compare-spec"><span>IP</span><strong>${m.ipRating || 'N/A'}</strong></div>
                    <div class="compare-spec"><span>Lead</span><strong${bestClass(m, 'leadTimeWeeks', true)}>${m.leadTimeWeeks}w</strong></div>
                </div>

                <div class="compare-card-footer">
                    <span class="compare-price"${bestClass(m, 'price', true)}>$${m.price}</span>
                    <span class="compare-moq">MOQ: ${m.moq}</span>
                </div>

                <button class="btn btn-primary btn-small" style="width:100%;margin-top:12px;" onclick="requestQuote('${m.id}')">Get Quote</button>
            </div>
        `;
    }).join('');

    let html = `
        <div class="compare-header-row">
            <h4>Comparing ${motors.length} Motors</h4>
            <button class="btn-icon" onclick="shareComparison()" title="Share comparison">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share
            </button>
        </div>
        <div class="compare-cards-grid">
            ${cardsHtml}
        </div>
        <div class="comparison-actions">
            <button class="btn btn-primary" onclick="exportComparison()">Print / Export</button>
            <button class="btn btn-secondary" onclick="clearSelection()">Clear Selection</button>
        </div>
    `;

    comparisonContent.innerHTML = html;
    comparisonDrawer.classList.add('open');
    // Focus the close button inside the drawer for accessibility
    drawerClose.focus();
}

// Share comparison via URL parameters
function shareComparison() {
    const ids = Array.from(selectedMotors).join(',');
    const url = new URL(window.location.href);
    url.searchParams.set('compare', ids);
    navigator.clipboard.writeText(url.toString()).then(() => {
        const btn = document.querySelector('.btn-icon');
        if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
            setTimeout(() => { btn.innerHTML = original; }, 2000);
        }
    });
}

// Load comparison from URL on page load
function loadComparisonFromURL() {
    const params = new URLSearchParams(window.location.search);
    const compareIds = params.get('compare');
    if (compareIds) {
        compareIds.split(',').forEach(id => selectedMotors.add(id));
    }
}

// View motor details - shows inline modal
function viewMotorDetails(motorId) {
    modalTriggerElement = document.activeElement;
    const motor = motorDatabase.find(m => m.id === motorId);
    if (!motor) return;

    const html = `
        <h4>${motor.brand} ${motor.model}</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">
            <div><strong>Series:</strong> ${motor.series || 'N/A'}</div>
            <div><strong>KV:</strong> ${motor.kv}</div>
            <div><strong>Max Thrust:</strong> ${motor.maxThrust}g</div>
            <div><strong>Weight:</strong> ${motor.weight}g</div>
            <div><strong>Efficiency:</strong> ${(motor.efficiency * 100).toFixed(0)}%</div>
            <div><strong>Max Current:</strong> ${motor.maxCurrent}A</div>
            <div><strong>Voltage:</strong> ${motor.voltageMin}S-${motor.voltageMax}S</div>
            <div><strong>Prop Range:</strong> ${motor.propRange}"</div>
            <div><strong>IP Rating:</strong> ${motor.ipRating || 'N/A'}</div>
            <div><strong>Price:</strong> $${motor.price}</div>
            <div><strong>MOQ:</strong> ${motor.moq}</div>
            <div><strong>Lead Time:</strong> ${motor.leadTimeWeeks}w</div>
        </div>
        ${motor.description ? '<p style="color:#666;margin-bottom:16px;">' + motor.description + '</p>' : ''}
        <div style="display:flex;gap:12px;">
            <button class="btn btn-primary" onclick="requestQuote('${motor.id}')">Get Quote</button>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;

    quoteModalBody.innerHTML = html;
    quoteModal.classList.add('open');
    // Focus the modal close button for accessibility
    modalClose.focus();
}

// Request quote - open Quick Quote modal or redirect to contact page
function requestQuote(motorId) {
    const motor = motorDatabase.find(m => m.id === motorId);
    if (!motor) return;

    if (typeof openQuoteModal === 'function') {
        openQuoteModal(motor.model);
    } else {
        window.location.href = 'contact.html?motor=' + encodeURIComponent(motor.model) + '&brand=' + encodeURIComponent(motor.brand) + '&type=quote';
    }
}

// Export comparison - print-friendly view
function exportComparison() {
    window.print();
}

// Clear selection
function clearSelection() {
    selectedMotors.clear();
    document.querySelectorAll('.motor-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('tr.selected').forEach(row => row.classList.remove('selected'));
    updateCompareButton();
    comparisonDrawer.classList.remove('open');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    validateForm();
    loadComparisonFromURL();
});