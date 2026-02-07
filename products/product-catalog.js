// Product Catalog - Filter and Sort Logic
(function() {
    'use strict';

    const filterSelects = {
        thrust: document.getElementById('thrust-filter'),
        voltage: document.getElementById('voltage-filter'),
        application: document.getElementById('application-filter'),
        sort: document.getElementById('sort-by')
    };

    const productGrid = document.getElementById('product-grid');

    if (!productGrid) return;

    function getProductCards() {
        return Array.from(productGrid.querySelectorAll('.product-card-detailed'));
    }

    function applyFilters() {
        const cards = getProductCards();
        const thrustFilter = filterSelects.thrust ? filterSelects.thrust.value : '';
        const voltageFilter = filterSelects.voltage ? filterSelects.voltage.value : '';
        const appFilter = filterSelects.application ? filterSelects.application.value : '';

        cards.forEach(card => {
            let visible = true;

            // Thrust filter
            if (thrustFilter) {
                const thrust = parseFloat(card.dataset.thrust) || 0;
                switch (thrustFilter) {
                    case '5-10':
                        visible = thrust >= 5 && thrust <= 10;
                        break;
                    case '10-15':
                        visible = thrust > 10 && thrust <= 15;
                        break;
                    case '15-25':
                        visible = thrust > 15 && thrust <= 25;
                        break;
                    case '25+':
                        visible = thrust > 25;
                        break;
                }
            }

            // Voltage filter
            if (visible && voltageFilter) {
                const voltage = (card.dataset.voltage || '').toLowerCase();
                visible = voltage.includes(voltageFilter);
            }

            // Application filter
            if (visible && appFilter) {
                const applications = (card.dataset.application || '').toLowerCase();
                visible = applications.includes(appFilter);
            }

            card.style.display = visible ? '' : 'none';
        });

        // Sort visible cards
        sortCards();

        // Show "no results" message if all hidden
        showNoResultsMessage(cards);
    }

    function sortCards() {
        const sortBy = filterSelects.sort ? filterSelects.sort.value : 'efficiency';
        const cards = getProductCards().filter(c => c.style.display !== 'none');

        cards.sort((a, b) => {
            const aThrust = parseFloat(a.dataset.thrust) || 0;
            const bThrust = parseFloat(b.dataset.thrust) || 0;

            switch (sortBy) {
                case 'thrust':
                    return bThrust - aThrust;
                case 'weight': {
                    const aWeight = parseFloat(a.querySelector('.spec-value')?.textContent) || 0;
                    const bWeight = parseFloat(b.querySelector('.spec-value')?.textContent) || 0;
                    return aWeight - bWeight;
                }
                case 'price': {
                    const aPrice = parseFloat((a.querySelector('.price')?.textContent || '0').replace(/[^0-9.]/g, ''));
                    const bPrice = parseFloat((b.querySelector('.price')?.textContent || '0').replace(/[^0-9.]/g, ''));
                    return aPrice - bPrice;
                }
                case 'efficiency':
                default:
                    // Keep original order for efficiency (already sorted)
                    return 0;
            }
        });

        // Re-append sorted cards
        cards.forEach(card => productGrid.appendChild(card));
    }

    function showNoResultsMessage(cards) {
        const visibleCount = cards.filter(c => c.style.display !== 'none').length;
        let noResults = productGrid.querySelector('.no-results-message');

        if (visibleCount === 0) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'no-results-message';
                noResults.style.cssText = 'text-align:center;padding:60px 20px;color:#666;grid-column:1/-1;';
                noResults.innerHTML = '<h3 style="margin-bottom:12px;color:#1a1a1a;">No motors match your filters</h3><p>Try adjusting your filter criteria or <a href="javascript:clearFilters()" style="color:#f6a604;font-weight:500;">clear all filters</a>.</p>';
                productGrid.appendChild(noResults);
            }
        } else if (noResults) {
            noResults.remove();
        }
    }

    // Attach event listeners
    Object.values(filterSelects).forEach(select => {
        if (select) {
            select.addEventListener('change', applyFilters);
        }
    });

})();

// Global clearFilters function (referenced in HTML onclick)
function clearFilters() {
    const selects = document.querySelectorAll('.filter-select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });

    // Show all cards
    const cards = document.querySelectorAll('.product-card-detailed');
    cards.forEach(card => {
        card.style.display = '';
    });

    // Remove no-results message
    const noResults = document.querySelector('.no-results-message');
    if (noResults) noResults.remove();
}
