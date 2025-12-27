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
    compareButton.addEventListener('click', showComparison);
    
    // Drawer close
    drawerClose.addEventListener('click', () => {
        comparisonDrawer.classList.remove('open');
    });
    
    // Modal close
    modalClose.addEventListener('click', () => {
        quoteModal.classList.remove('open');
    });
    
    // Click outside modal to close
    quoteModal.addEventListener('click', (e) => {
        if (e.target === quoteModal) {
            quoteModal.classList.remove('open');
        }
    });
    
    // Enable/disable search button based on required fields
    form.addEventListener('input', validateForm);
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
        vendors: Array.from(formData.getAll('vendors'))
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

// Search algorithm
function searchMotors(params) {
    let results = [];
    
    // Calculate required thrust per motor (assuming quadcopter by default)
    const motorCount = 4; // Could be made dynamic based on form input
    const totalThrust = params.allUpWeight * params.thrustRatio * 1000; // Convert to grams
    const thrustPerMotor = totalThrust / motorCount;
    
    // Filter motors
    const filteredMotors = motorDatabase.filter(motor => {
        // Hard filters
        
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
    
    // Thrust factor (40%)
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
    score += thrustScore * 0.4;
    
    // Efficiency (20%)
    const efficiencyScore = motor.efficiency * 100;
    score += efficiencyScore * 0.2;
    
    // Weight penalty (15%)
    let weightScore = 100;
    if (params.motorWeight) {
        const weightDiff = Math.abs(motor.weight - params.motorWeight) / params.motorWeight;
        weightScore = Math.max(0, 100 - weightDiff * 100);
    } else {
        // Lighter is better if no preference
        weightScore = Math.max(0, 100 - (motor.weight / 500) * 50);
    }
    score += weightScore * 0.15;
    
    // Flight time bonus (15%)
    let flightTimeScore = 80; // Default decent score
    if (params.flightTime) {
        // Estimate based on efficiency and weight
        const estimatedFlightTime = (30 * motor.efficiency) / (motor.weight / 100);
        flightTimeScore = Math.min(100, (estimatedFlightTime / params.flightTime) * 100);
    }
    score += flightTimeScore * 0.15;
    
    // Cost penalty (10%)
    const avgPrice = 100; // Baseline price
    const costScore = Math.max(0, 100 - ((motor.price - avgPrice) / avgPrice) * 50);
    score += costScore * 0.1;
    
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

// Show comparison drawer
function showComparison() {
    if (selectedMotors.size === 0) return;
    
    const motors = Array.from(selectedMotors).map(id => 
        searchResults.find(m => m.id === id)
    ).filter(Boolean);
    
    // Build comparison table
    let html = `
        <h4>Comparing ${motors.length} Motors</h4>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Specification</th>
                    ${motors.map(m => `<th>${m.model}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Brand</td>
                    ${motors.map(m => `<td>${m.brand}</td>`).join('')}
                </tr>
                <tr>
                    <td>Score</td>
                    ${motors.map(m => `<td><strong>${m.score}</strong></td>`).join('')}
                </tr>
                <tr>
                    <td>Max Thrust</td>
                    ${motors.map(m => `<td>${m.maxThrust}g</td>`).join('')}
                </tr>
                <tr>
                    <td>Weight</td>
                    ${motors.map(m => `<td>${m.weight}g</td>`).join('')}
                </tr>
                <tr>
                    <td>KV Rating</td>
                    ${motors.map(m => `<td>${m.kv}</td>`).join('')}
                </tr>
                <tr>
                    <td>Efficiency</td>
                    ${motors.map(m => `<td>${(m.efficiency * 100).toFixed(0)}%</td>`).join('')}
                </tr>
                <tr>
                    <td>Voltage Range</td>
                    ${motors.map(m => `<td>${m.voltageMin}S-${m.voltageMax}S</td>`).join('')}
                </tr>
                <tr>
                    <td>Prop Range</td>
                    ${motors.map(m => `<td>${m.propRange}"</td>`).join('')}
                </tr>
                <tr>
                    <td>IP Rating</td>
                    ${motors.map(m => `<td>${m.ipRating || 'N/A'}</td>`).join('')}
                </tr>
                <tr>
                    <td>Price</td>
                    ${motors.map(m => `<td>$${m.price}</td>`).join('')}
                </tr>
                <tr>
                    <td>MOQ</td>
                    ${motors.map(m => `<td>${m.moq}</td>`).join('')}
                </tr>
                <tr>
                    <td>Lead Time</td>
                    ${motors.map(m => `<td>${m.leadTimeWeeks}w</td>`).join('')}
                </tr>
            </tbody>
        </table>
        <div class="comparison-actions">
            <button class="btn btn-primary" onclick="exportComparison()">Export PDF</button>
            <button class="btn btn-secondary" onclick="clearSelection()">Clear Selection</button>
        </div>
    `;
    
    comparisonContent.innerHTML = html;
    comparisonDrawer.classList.add('open');
}

// View motor details (placeholder)
function viewMotorDetails(motorId) {
    const motor = motorDatabase.find(m => m.id === motorId);
    if (motor) {
        alert(`Motor Details:\n\nModel: ${motor.model}\nBrand: ${motor.brand}\nMax Thrust: ${motor.maxThrust}g\nEfficiency: ${(motor.efficiency * 100).toFixed(0)}%\n\nDatasheet: ${motor.datasheetUrl || 'Contact sales for details'}`);
    }
}

// Request quote
function requestQuote(motorId) {
    const motor = motorDatabase.find(m => m.id === motorId);
    if (!motor) return;
    
    const html = `
        <h4>Request Quote for ${motor.model}</h4>
        <form id="quote-form">
            <div class="form-group">
                <label>Motor Model</label>
                <input type="text" value="${motor.brand} ${motor.model}" readonly>
            </div>
            <div class="form-group">
                <label>Quantity Required</label>
                <input type="number" id="quote-quantity" min="${motor.moq}" value="${motor.moq}" required>
                <small>Minimum order quantity: ${motor.moq}</small>
            </div>
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" id="quote-company" required>
            </div>
            <div class="form-group">
                <label>Contact Email</label>
                <input type="email" id="quote-email" required>
            </div>
            <div class="form-group">
                <label>Additional Requirements</label>
                <textarea id="quote-notes" rows="3"></textarea>
            </div>
            <div class="quote-summary">
                <p>Estimated Unit Price: $${motor.price}</p>
                <p>Estimated Lead Time: ${motor.leadTimeWeeks} weeks</p>
            </div>
            <button type="submit" class="btn btn-primary">Submit Quote Request</button>
        </form>
    `;
    
    quoteModalBody.innerHTML = html;
    quoteModal.classList.add('open');
    
    // Handle quote form submission
    document.getElementById('quote-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Quote request submitted! Our sales team will contact you within 24 hours.');
        quoteModal.classList.remove('open');
    });
}

// Export comparison (placeholder)
function exportComparison() {
    alert('PDF export feature coming soon! For now, you can take a screenshot of the comparison.');
}

// Clear selection
function clearSelection() {
    selectedMotors.clear();
    document.querySelectorAll('.motor-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('tr.selected').forEach(row => row.classList.remove('selected'));
    updateCompareButton();
    comparisonDrawer.classList.remove('open');
}

// Add active navigation state
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('motor-matchmaker')) {
        document.querySelector('.nav-link[href="motor-matchmaker.html"]').classList.add('nav-link-active');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    validateForm();
    setActiveNavigation();
});