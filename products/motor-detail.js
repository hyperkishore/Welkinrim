// Motor Detail Modal - Rich product detail overlay
(function() {
    'use strict';

    // Inject modal HTML container
    const modalHTML = `
        <div class="motor-detail-overlay" id="motor-detail-overlay" style="display:none;">
            <div class="motor-detail-modal" id="motor-detail-modal">
                <button class="mdm-close" id="mdm-close" aria-label="Close">&times;</button>
                <div class="mdm-content" id="mdm-content"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        .motor-detail-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            padding: 20px;
        }
        .motor-detail-overlay.active {
            opacity: 1;
        }
        .motor-detail-modal {
            background: white;
            border-radius: 16px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        .motor-detail-overlay.active .motor-detail-modal {
            transform: translateY(0);
        }
        .mdm-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: #f0f0f0;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
        }
        .mdm-close:hover {
            background: #e0e0e0;
        }
        .mdm-content {
            padding: 0;
        }
        .mdm-hero {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
        }
        .mdm-image {
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            min-height: 300px;
        }
        .mdm-image img {
            max-width: 100%;
            max-height: 250px;
            object-fit: contain;
        }
        .mdm-header {
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .mdm-brand-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .mdm-brand-internal {
            background: #f6a604;
            color: white;
        }
        .mdm-brand-external {
            background: #e0e0e0;
            color: #333;
        }
        .mdm-model {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 4px;
        }
        .mdm-series {
            color: #f6a604;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.875rem;
            margin-bottom: 16px;
        }
        .mdm-desc {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .mdm-price-row {
            display: flex;
            align-items: baseline;
            gap: 12px;
            margin-bottom: 16px;
        }
        .mdm-price {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
        }
        .mdm-price-note {
            color: #666;
            font-size: 0.875rem;
        }
        .mdm-ctas {
            display: flex;
            gap: 12px;
        }
        .mdm-body {
            padding: 0 40px 40px;
        }
        .mdm-specs-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 16px;
            padding-top: 24px;
            border-top: 1px solid #e9ecef;
        }
        .mdm-specs-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
        }
        .mdm-spec-card {
            background: #f8f9ff;
            padding: 16px;
            border-radius: 8px;
            border-left: 3px solid #f6a604;
        }
        .mdm-spec-label {
            font-size: 0.75rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 4px;
        }
        .mdm-spec-val {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 1.1rem;
        }
        .mdm-viz {
            margin-bottom: 24px;
        }
        .mdm-bar-container {
            margin-bottom: 12px;
        }
        .mdm-bar-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 0.875rem;
        }
        .mdm-bar-label span:first-child {
            color: #666;
        }
        .mdm-bar-label span:last-child {
            font-weight: 600;
            color: #1a1a1a;
        }
        .mdm-bar {
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        .mdm-bar-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.6s ease;
        }
        .mdm-bar-fill.thrust { background: #f6a604; }
        .mdm-bar-fill.efficiency { background: #22c55e; }
        .mdm-bar-fill.weight { background: #3b82f6; }
        .mdm-bar-fill.power { background: #8b5cf6; }
        .mdm-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 24px;
        }
        .mdm-tag {
            background: rgba(246,166,4,0.1);
            color: #f6a604;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .mdm-extra {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        .mdm-extra-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        .mdm-extra-card h4 {
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 8px;
        }
        .mdm-extra-card p {
            font-weight: 500;
            color: #1a1a1a;
        }
        @media (max-width: 768px) {
            .mdm-hero { grid-template-columns: 1fr; }
            .mdm-specs-grid { grid-template-columns: repeat(2, 1fr); }
            .mdm-extra { grid-template-columns: 1fr; }
            .mdm-header, .mdm-body { padding: 24px; }
            .mdm-model { font-size: 1.5rem; }
        }
    `;
    document.head.appendChild(style);

    const overlay = document.getElementById('motor-detail-overlay');
    const closeBtn = document.getElementById('mdm-close');
    const content = document.getElementById('mdm-content');

    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/products/') || path.includes('/tools/') || path.includes('/applications/')) return '../';
        return '';
    }

    function closeModal() {
        overlay.classList.remove('active');
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.style.display !== 'none') closeModal();
    });

    // Global function to open motor detail
    window.showMotorDetail = function(motorId) {
        if (typeof motorDatabase === 'undefined') return;
        const motor = motorDatabase.find(m => m.id === motorId);
        if (!motor) return;

        const base = getBasePath();
        const imgSrc = motor.image ? (base + motor.image) : (base + 'assets/commercial-motor.svg');
        const thrustKg = (motor.maxThrust / 1000).toFixed(1);
        const powerW = motor.maxPower || (motor.maxCurrent * motor.voltageMax * 3.7);
        const powerStr = powerW >= 1000 ? (powerW / 1000).toFixed(1) + ' kW' : Math.round(powerW) + 'W';
        const weightStr = motor.weight >= 1000 ? (motor.weight / 1000).toFixed(1) + ' kg' : motor.weight + 'g';
        const effPct = (motor.efficiency * 100).toFixed(0);
        const brandClass = motor.source === 'internal' ? 'mdm-brand-internal' : 'mdm-brand-external';

        // Normalize values for bars (0-100)
        const thrustPct = Math.min(100, (motor.maxThrust / 12000) * 100);
        const effBarPct = motor.efficiency * 100;
        const weightPct = Math.min(100, (motor.weight / 900) * 100);
        const powerPct = Math.min(100, (powerW / 7000) * 100);

        content.innerHTML = `
            <div class="mdm-hero">
                <div class="mdm-image">
                    <img src="${imgSrc}" alt="${motor.model}">
                </div>
                <div class="mdm-header">
                    <span class="mdm-brand-badge ${brandClass}">${motor.brand}</span>
                    <h2 class="mdm-model">${motor.model}</h2>
                    <p class="mdm-series">${motor.series || ''} Series</p>
                    ${motor.description ? '<p class="mdm-desc">' + motor.description + '</p>' : ''}
                    <div class="mdm-price-row">
                        <span class="mdm-price">$${motor.price}</span>
                        <span class="mdm-price-note">${motor.moq > 1 ? 'MOQ: ' + motor.moq + ' units' : 'per unit'}</span>
                    </div>
                    <div class="mdm-ctas">
                        <button class="btn btn-primary" onclick="if(typeof openQuoteModal==='function'){openQuoteModal('${motor.model}')}else{window.location.href='${base}contact.html?motor=${encodeURIComponent(motor.model)}&brand=${encodeURIComponent(motor.brand)}&type=quote'}">Get Quote</button>
                        ${motor.datasheetUrl ? '<a href="' + motor.datasheetUrl + '" class="btn btn-outline" target="_blank">Datasheet</a>' : ''}
                        <button class="btn btn-secondary" onclick="closeMotorDetail()">Close</button>
                    </div>
                </div>
            </div>
            <div class="mdm-body">
                <h3 class="mdm-specs-title">Specifications</h3>
                <div class="mdm-specs-grid">
                    <div class="mdm-spec-card"><div class="mdm-spec-label">Max Thrust</div><div class="mdm-spec-val">${thrustKg} kg</div></div>
                    <div class="mdm-spec-card"><div class="mdm-spec-label">Max Power</div><div class="mdm-spec-val">${powerStr}</div></div>
                    <div class="mdm-spec-card"><div class="mdm-spec-label">Weight</div><div class="mdm-spec-val">${weightStr}</div></div>
                    <div class="mdm-spec-card"><div class="mdm-spec-label">Efficiency</div><div class="mdm-spec-val">${effPct}%</div></div>
                    <div class="mdm-spec-card"><div class="mdm-spec-label">KV Rating</div><div class="mdm-spec-val">${motor.kv}</div></div>
                    <div class="mdm-spec-card"><div class="mdm-spec-label">Voltage</div><div class="mdm-spec-val">${motor.voltageMin}S-${motor.voltageMax}S</div></div>
                    <div class="mdm-spec-card"><div class="mdm-spec-label">Max Current</div><div class="mdm-spec-val">${motor.maxCurrent}A</div></div>
                    <div class="mdm-spec-card"><div class="mdm-spec-label">Prop Range</div><div class="mdm-spec-val">${motor.propRange}"</div></div>
                </div>

                <h3 class="mdm-specs-title">Performance Visualization</h3>
                <div class="mdm-viz">
                    <div class="mdm-bar-container">
                        <div class="mdm-bar-label"><span>Thrust</span><span>${thrustKg} kg</span></div>
                        <div class="mdm-bar"><div class="mdm-bar-fill thrust" style="width:${thrustPct}%"></div></div>
                    </div>
                    <div class="mdm-bar-container">
                        <div class="mdm-bar-label"><span>Efficiency</span><span>${effPct}%</span></div>
                        <div class="mdm-bar"><div class="mdm-bar-fill efficiency" style="width:${effBarPct}%"></div></div>
                    </div>
                    <div class="mdm-bar-container">
                        <div class="mdm-bar-label"><span>Weight</span><span>${weightStr}</span></div>
                        <div class="mdm-bar"><div class="mdm-bar-fill weight" style="width:${weightPct}%"></div></div>
                    </div>
                    <div class="mdm-bar-container">
                        <div class="mdm-bar-label"><span>Power</span><span>${powerStr}</span></div>
                        <div class="mdm-bar"><div class="mdm-bar-fill power" style="width:${powerPct}%"></div></div>
                    </div>
                </div>

                ${motor.applications ? '<h3 class="mdm-specs-title">Applications</h3><div class="mdm-tags">' + motor.applications.map(a => '<span class="mdm-tag">' + a.charAt(0).toUpperCase() + a.slice(1) + '</span>').join('') + '</div>' : ''}

                <div class="mdm-extra">
                    <div class="mdm-extra-card"><h4>IP Rating</h4><p>${motor.ipRating || 'Not rated'}</p></div>
                    <div class="mdm-extra-card"><h4>Lead Time</h4><p>${motor.stockQty > 0 ? motor.leadTimeWeeks + ' week(s) - In Stock' : motor.leadTimeWeeks + ' weeks'}</p></div>
                    <div class="mdm-extra-card"><h4>Stock</h4><p>${motor.stockQty > 0 ? motor.stockQty + ' units available' : 'Made to order'}</p></div>
                    <div class="mdm-extra-card"><h4>Minimum Order</h4><p>${motor.moq} unit${motor.moq > 1 ? 's' : ''}</p></div>
                </div>
            </div>
        `;

        overlay.style.display = 'flex';
        requestAnimationFrame(() => { overlay.classList.add('active'); });
        document.body.style.overflow = 'hidden';
    };

    window.closeMotorDetail = function() {
        closeModal();
    };

})();
