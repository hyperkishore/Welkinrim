// Data-Driven Product Page Generator
// Dynamically renders motor product grids from motorDatabase
(function() {
    'use strict';

    // Inject CSS styles for generated product cards
    const style = document.createElement('style');
    style.textContent = `
        #dynamic-product-grid {
            display: grid;
            gap: 32px;
        }
        .product-card-generated {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 0;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid rgba(0,0,0,0.05);
            transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .product-card-generated:hover {
            box-shadow: 0 12px 32px rgba(0,0,0,0.12);
            transform: translateY(-2px);
        }
        .pcg-image {
            position: relative;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 280px;
        }
        .pcg-image img {
            width: 80%;
            height: auto;
            max-height: 220px;
            object-fit: contain;
        }
        .pcg-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: #22c55e;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .pcg-series-badge {
            position: absolute;
            top: 16px;
            right: 16px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .pcg-series-badge--defence {
            background: rgba(246,166,4,0.15);
            color: #f6a604;
            border: 1px solid rgba(246,166,4,0.3);
        }
        .pcg-series-badge--agriculture {
            background: rgba(34,197,94,0.15);
            color: #22c55e;
            border: 1px solid rgba(34,197,94,0.3);
        }
        .pcg-info {
            padding: 32px;
            display: flex;
            flex-direction: column;
        }
        .pcg-header {
            margin-bottom: 12px;
        }
        .pcg-name {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 8px 0 4px;
            color: #1a1a1a;
        }
        .pcg-series {
            color: #f6a604;
            font-weight: 500;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .pcg-desc {
            color: #666;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .pcg-specs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 16px;
        }
        .pcg-spec {
            display: flex;
            flex-direction: column;
            padding: 10px 12px;
            background: #f8f9ff;
            border-radius: 8px;
            border-left: 3px solid #f6a604;
        }
        .pcg-spec-label {
            font-size: 0.75rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .pcg-spec-value {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 0.95rem;
        }
        .pcg-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 16px;
        }
        .pcg-tag {
            background: rgba(246,166,4,0.1);
            color: #f6a604;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        .pcg-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #e9ecef;
            margin-top: auto;
        }
        .pcg-price-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a1a1a;
        }
        .pcg-price-note {
            display: block;
            font-size: 0.8rem;
            color: #666;
        }
        .pcg-buttons {
            display: flex;
            gap: 8px;
        }
        @media (max-width: 768px) {
            .product-card-generated {
                grid-template-columns: 1fr;
            }
            .pcg-specs {
                grid-template-columns: repeat(2, 1fr);
            }
            .pcg-actions {
                flex-direction: column;
                gap: 12px;
            }
            .pcg-buttons {
                width: 100%;
            }
            .pcg-buttons .btn {
                flex: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Main product grid rendering logic
    const grid = document.getElementById('dynamic-product-grid');
    if (!grid || typeof motorDatabase === 'undefined') return;

    const category = grid.dataset.category || 'all';
    const brandFilter = grid.dataset.brand || 'all'; // 'internal', 'external', or 'all'

    function getFilteredMotors() {
        let motors = motorDatabase;

        // Filter by brand
        if (brandFilter === 'internal') {
            motors = motors.filter(m => m.source === 'internal');
        } else if (brandFilter === 'external') {
            motors = motors.filter(m => m.source === 'external');
        }

        // Filter by category
        switch (category) {
            case 'micro':
                motors = motors.filter(m => m.series === 'Micro' || m.series === 'Racing');
                break;
            case 'commercial':
                motors = motors.filter(m => m.series === 'Commercial');
                break;
            case 'industrial':
                motors = motors.filter(m => m.series === 'Industrial');
                break;
            case 'defence':
                motors = motors.filter(m => m.series === 'Defence');
                break;
            case 'agriculture':
                motors = motors.filter(m => m.series === 'Agriculture');
                break;
            case 'all':
            default:
                break;
        }

        return motors;
    }

    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/products/')) return '../';
        return '';
    }

    const base = getBasePath();

    function renderMotorCard(motor) {
        const imageSrc = motor.image ? (base + motor.image) : (base + 'assets/commercial-motor.svg');
        const thrustKg = (motor.maxThrust / 1000).toFixed(1);
        const powerStr = motor.maxPower >= 1000
            ? (motor.maxPower / 1000).toFixed(1) + ' kW'
            : motor.maxPower + 'W';
        const weightStr = motor.weight >= 1000
            ? (motor.weight / 1000).toFixed(1) + ' kg'
            : motor.weight + 'g';
        const efficiencyStr = (motor.efficiency * 100).toFixed(0) + '%';
        const voltageStr = motor.voltageMin + 'S-' + motor.voltageMax + 'S';
        const inStock = motor.stockQty > 0;
        const brandBadge = motor.source === 'internal'
            ? '<span style="background:#f6a604;color:white;padding:4px 10px;border-radius:4px;font-size:0.75rem;font-weight:600;">WelkinRim</span>'
            : '<span style="background:#e0e0e0;color:#333;padding:4px 10px;border-radius:4px;font-size:0.75rem;font-weight:600;">' + motor.brand + '</span>';

        const seriesBadge = motor.series === 'Defence'
            ? '<span class="pcg-series-badge pcg-series-badge--defence">Defence Grade</span>'
            : motor.series === 'Agriculture'
            ? '<span class="pcg-series-badge pcg-series-badge--agriculture">Agriculture</span>'
            : '';

        return `
            <div class="product-card-generated" data-motor-id="${motor.id}">
                <div class="pcg-image">
                    <img src="${imageSrc}" alt="${motor.model}" loading="lazy">
                    ${inStock ? '<div class="pcg-badge">In Stock</div>' : ''}
                    ${seriesBadge}
                </div>
                <div class="pcg-info">
                    <div class="pcg-header">
                        ${brandBadge}
                        <h3 class="pcg-name">${motor.model}</h3>
                        <p class="pcg-series">${motor.series} Series</p>
                    </div>
                    ${motor.description ? '<p class="pcg-desc">' + motor.description + '</p>' : ''}
                    <div class="pcg-specs">
                        <div class="pcg-spec">
                            <span class="pcg-spec-label">Thrust</span>
                            <span class="pcg-spec-value">${thrustKg} kg</span>
                        </div>
                        <div class="pcg-spec">
                            <span class="pcg-spec-label">Power</span>
                            <span class="pcg-spec-value">${powerStr}</span>
                        </div>
                        <div class="pcg-spec">
                            <span class="pcg-spec-label">Weight</span>
                            <span class="pcg-spec-value">${weightStr}</span>
                        </div>
                        <div class="pcg-spec">
                            <span class="pcg-spec-label">Efficiency</span>
                            <span class="pcg-spec-value">${efficiencyStr}</span>
                        </div>
                        <div class="pcg-spec">
                            <span class="pcg-spec-label">KV</span>
                            <span class="pcg-spec-value">${motor.kv}</span>
                        </div>
                        <div class="pcg-spec">
                            <span class="pcg-spec-label">Voltage</span>
                            <span class="pcg-spec-value">${voltageStr}</span>
                        </div>
                    </div>
                    ${motor.applications ? '<div class="pcg-tags">' + motor.applications.slice(0, 3).map(a => '<span class="pcg-tag">' + a.charAt(0).toUpperCase() + a.slice(1) + '</span>').join('') + '</div>' : ''}
                    <div class="pcg-actions">
                        <div class="pcg-price">
                            <span class="pcg-price-value">$${motor.price}</span>
                            ${motor.moq > 1 ? '<span class="pcg-price-note">MOQ: ' + motor.moq + '</span>' : '<span class="pcg-price-note">per unit</span>'}
                        </div>
                        <div class="pcg-buttons">
                            <button class="btn btn-outline btn-small" onclick="showMotorDetail('${motor.id}')">View Details</button>
                            <button class="btn btn-primary btn-small" onclick="if(typeof openQuoteModal==='function'){openQuoteModal('${motor.model}')}else{window.location.href='${base}contact.html?motor=${encodeURIComponent(motor.model)}&brand=${encodeURIComponent(motor.brand)}&type=quote'}">Get Quote</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderGrid(motors) {
        if (motors.length === 0) {
            grid.innerHTML = '<div style="text-align:center;padding:60px;color:#666;"><h3 style="margin-bottom:12px;">No motors found</h3><p>Try adjusting your filters or <a href="' + base + 'motor-matchmaker.html" style="color:#f6a604;">use the Motor Matchmaker</a>.</p></div>';
            return;
        }
        grid.innerHTML = motors.map(renderMotorCard).join('');
    }

    // Initial render
    const allMotors = getFilteredMotors();
    renderGrid(allMotors);

    // Expose filter function for external use
    window.filterProductGrid = function(filterFn) {
        const filtered = filterFn ? allMotors.filter(filterFn) : allMotors;
        renderGrid(filtered);
    };

    window.sortProductGrid = function(sortFn) {
        const sorted = [...allMotors].sort(sortFn);
        renderGrid(sorted);
    };

})();
