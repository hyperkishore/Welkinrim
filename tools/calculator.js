// Motor Performance Calculator
class MotorCalculator {
    constructor() {
        // Use global motorDatabase from motor-database.js, transform to calculator format
        this.motorDatabase = (typeof motorDatabase !== 'undefined' ? motorDatabase : [])
            .filter(m => m.source === 'internal') // Calculator only recommends WelkinRim motors
            .map(m => ({
                name: m.model,
                series: m.series || 'Commercial',
                maxThrust: m.maxThrust / 1000, // Convert grams to kg
                maxPower: m.maxPower || (m.maxCurrent * m.voltageMax * 3.7),
                weight: m.weight / 1000, // Convert grams to kg
                efficiency: m.efficiency,
                kv: m.kv,
                voltage: m.voltage || [],
                price: m.price
            }));
    }

    // Main calculation function
    calculatePerformance() {
        const inputs = this.getInputs();
        
        if (!this.validateInputs(inputs)) {
            return null;
        }

        const calculations = this.performCalculations(inputs);
        const recommendations = this.findMotorRecommendations(calculations, inputs);
        
        return {
            inputs,
            calculations,
            recommendations
        };
    }

    // Get all input values
    getInputs() {
        return {
            droneWeight: parseFloat(document.getElementById('drone-weight').value) || 0,
            payloadWeight: parseFloat(document.getElementById('payload-weight').value) || 0,
            motorCount: parseInt(document.getElementById('motor-count').value) || 4,
            safetyFactor: parseFloat(document.getElementById('safety-factor').value) || 2.0,
            batteryVoltage: parseFloat(document.getElementById('battery-voltage').value) || 22.2,
            batteryCapacity: parseFloat(document.getElementById('battery-capacity').value) || 6000,
            targetEfficiency: parseFloat(document.getElementById('target-efficiency').value) || 85,
            dischargeRate: parseFloat(document.getElementById('discharge-rate').value) || 25,
            targetFlightTime: parseFloat(document.getElementById('target-flight-time').value) || 25,
            hoverPercentage: parseFloat(document.getElementById('hover-percentage').value) || 70,
            altitude: parseFloat(document.getElementById('altitude').value) || 100,
            temperature: parseFloat(document.getElementById('temperature').value) || 20
        };
    }

    // Validate input values
    validateInputs(inputs) {
        const errors = [];
        
        if (inputs.droneWeight <= 0) errors.push('Drone weight must be greater than 0');
        if (inputs.payloadWeight < 0) errors.push('Payload weight cannot be negative');
        if (inputs.targetEfficiency < 50 || inputs.targetEfficiency > 99) {
            errors.push('Target efficiency must be between 50-99%');
        }
        
        if (errors.length > 0) {
            alert('Please fix the following errors:\n' + errors.join('\n'));
            return false;
        }
        
        return true;
    }

    // Perform all calculations
    performCalculations(inputs) {
        const totalWeight = inputs.droneWeight + inputs.payloadWeight;
        const totalThrust = totalWeight * inputs.safetyFactor;
        const thrustPerMotor = totalThrust / inputs.motorCount;
        
        // Air density calculation (altitude and temperature effects)
        const airDensity = this.calculateAirDensity(inputs.altitude, inputs.temperature);
        const densityRatio = airDensity / 1.225; // Sea level standard
        
        // Power calculations
        const hoverPowerPerMotor = this.calculateHoverPower(thrustPerMotor, densityRatio);
        const totalHoverPower = hoverPowerPerMotor * inputs.motorCount;
        
        // Forward flight power (typically 60-80% of hover power)
        const forwardPowerPerMotor = hoverPowerPerMotor * 0.7;
        const totalForwardPower = forwardPowerPerMotor * inputs.motorCount;
        
        // Average power consumption
        const hoverFraction = inputs.hoverPercentage / 100;
        const averagePowerPerMotor = (hoverPowerPerMotor * hoverFraction) + 
                                   (forwardPowerPerMotor * (1 - hoverFraction));
        const totalAveragePower = averagePowerPerMotor * inputs.motorCount;
        
        // Flight time calculation
        const batteryEnergy = (inputs.batteryCapacity / 1000) * inputs.batteryVoltage; // Wh
        const systemEfficiency = inputs.targetEfficiency / 100;
        const usableEnergy = batteryEnergy * 0.8; // 80% battery utilization
        const flightTimeHours = (usableEnergy * systemEfficiency) / totalAveragePower;
        const flightTimeMinutes = flightTimeHours * 60;
        
        // Power system analysis
        const currentPerMotor = averagePowerPerMotor / inputs.batteryVoltage;
        const totalCurrent = currentPerMotor * inputs.motorCount;
        const currentDrawC = totalCurrent / (inputs.batteryCapacity / 1000);
        
        // Thrust-to-weight analysis
        const thrustToWeight = totalThrust / (totalWeight * 9.81); // Convert to N
        
        return {
            totalWeight,
            totalThrust,
            thrustPerMotor,
            thrustToWeight,
            airDensity,
            densityRatio,
            hoverPowerPerMotor,
            totalHoverPower,
            forwardPowerPerMotor,
            totalForwardPower,
            averagePowerPerMotor,
            totalAveragePower,
            batteryEnergy,
            flightTimeMinutes,
            currentPerMotor,
            totalCurrent,
            currentDrawC,
            systemEfficiency
        };
    }

    // Calculate air density based on altitude and temperature
    calculateAirDensity(altitude, temperature) {
        const seaLevelDensity = 1.225; // kg/m³
        const temperatureK = temperature + 273.15;
        const seaLevelTemp = 288.15; // 15°C in Kelvin
        
        // Simplified atmospheric model
        const pressureRatio = Math.pow(1 - (0.0065 * altitude) / seaLevelTemp, 5.255);
        const densityRatio = pressureRatio * (seaLevelTemp / temperatureK);
        
        return seaLevelDensity * densityRatio;
    }

    // Calculate hover power using momentum theory
    calculateHoverPower(thrust, densityRatio) {
        // Simplified power calculation: P = T^1.5 / sqrt(2*rho*A)
        // Using empirical factor for typical propeller disk loading
        const diskLoading = 20; // N/m² typical for multirotor
        const thrustNewtons = thrust * 9.81;
        const idealPower = Math.pow(thrustNewtons, 1.5) / Math.sqrt(2 * 1.225 * densityRatio * (thrustNewtons / diskLoading));
        
        // Add realistic losses (motor, ESC, propeller efficiency)
        const figureOfMerit = 0.7; // Typical propeller efficiency
        const electricalEfficiency = 0.9; // Motor + ESC efficiency
        
        return idealPower / (figureOfMerit * electricalEfficiency);
    }

    // Find motor recommendations
    findMotorRecommendations(calc, inputs) {
        const suitableMotors = this.motorDatabase.filter(motor => {
            // Check if motor can handle the thrust requirement
            const thrustMargin = motor.maxThrust / calc.thrustPerMotor;
            
            // Check if voltage is compatible
            const voltageCompatible = motor.voltage.some(v => 
                Math.abs(v - inputs.batteryVoltage) < 3
            );
            
            // Check if power is sufficient
            const powerMargin = motor.maxPower / calc.averagePowerPerMotor;
            
            return thrustMargin >= 1.2 && voltageCompatible && powerMargin >= 1.1;
        });
        
        // Score and sort motors
        return suitableMotors.map(motor => {
            const thrustMargin = motor.maxThrust / calc.thrustPerMotor;
            const powerMargin = motor.maxPower / calc.averagePowerPerMotor;
            const weightEfficiency = motor.maxThrust / motor.weight;
            
            // Calculate match score (0-100)
            let score = 0;
            score += Math.min(thrustMargin * 20, 40); // Thrust adequacy
            score += Math.min(powerMargin * 15, 30); // Power adequacy
            score += motor.efficiency * 20; // Motor efficiency
            score += Math.min(weightEfficiency * 2, 10); // Weight efficiency
            
            return {
                ...motor,
                thrustMargin,
                powerMargin,
                weightEfficiency,
                matchScore: Math.round(score),
                estimatedCurrent: calc.averagePowerPerMotor / inputs.batteryVoltage,
                estimatedRPM: motor.kv * inputs.batteryVoltage * 0.8 // Accounting for voltage sag
            };
        }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
    }

    // Generate status assessment
    getStatusAssessment(calc, inputs) {
        const assessments = [];
        
        // Thrust-to-weight ratio
        if (calc.thrustToWeight > 3) {
            assessments.push({
                type: 'good',
                message: 'Excellent thrust-to-weight ratio for agile flight'
            });
        } else if (calc.thrustToWeight > 2) {
            assessments.push({
                type: 'good',
                message: 'Good thrust-to-weight ratio for stable flight'
            });
        } else if (calc.thrustToWeight > 1.5) {
            assessments.push({
                type: 'warning',
                message: 'Adequate thrust-to-weight ratio'
            });
        } else {
            assessments.push({
                type: 'critical',
                message: 'Low thrust-to-weight ratio - may struggle to fly'
            });
        }
        
        // Current draw
        if (calc.currentDrawC < 10) {
            assessments.push({
                type: 'good',
                message: 'Conservative current draw - good for battery life'
            });
        } else if (calc.currentDrawC < 20) {
            assessments.push({
                type: 'warning',
                message: 'Moderate current draw'
            });
        } else {
            assessments.push({
                type: 'critical',
                message: 'High current draw - check battery C-rating'
            });
        }
        
        // Flight time
        if (calc.flightTimeMinutes >= inputs.targetFlightTime) {
            assessments.push({
                type: 'good',
                message: 'Target flight time achievable'
            });
        } else {
            assessments.push({
                type: 'warning',
                message: 'Flight time below target - consider larger battery'
            });
        }
        
        return assessments;
    }
}

// Global calculator instance
const calculator = new MotorCalculator();

// Main calculation function called by UI
function calculatePerformance() {
    const btn = document.querySelector('.calculate-btn');
    const originalText = btn.textContent;
    
    // Show loading state
    btn.textContent = 'Calculating...';
    btn.disabled = true;
    
    setTimeout(() => {
        try {
            const results = calculator.calculatePerformance();
            
            if (results) {
                displayResults(results);
                showMotorRecommendations(results.recommendations);
            }
        } catch (error) {
            console.error('Calculation error:', error);
            alert('An error occurred during calculation. Please check your inputs.');
        } finally {
            // Reset button
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }, 500);
}

// Display calculation results
function displayResults(results) {
    const { calculations: calc, inputs } = results;
    const assessments = calculator.getStatusAssessment(calc, inputs);
    
    const resultsHTML = `
        <div class="results-grid">
            <div class="result-section">
                <h3 class="result-title">
                    <span class="result-icon">⚡</span>
                    Power Analysis
                </h3>
                <div class="result-metrics">
                    <div class="result-metric">
                        <span class="metric-label">Hover Power per Motor</span>
                        <span class="metric-value">${calc.hoverPowerPerMotor.toFixed(0)}W</span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">Average Power per Motor</span>
                        <span class="metric-value">${calc.averagePowerPerMotor.toFixed(0)}W</span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">Total System Power</span>
                        <span class="metric-value">${calc.totalAveragePower.toFixed(0)}W</span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">Current per Motor</span>
                        <span class="metric-value">${calc.currentPerMotor.toFixed(1)}A</span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">Battery Current Draw</span>
                        <span class="metric-value ${calc.currentDrawC > 20 ? 'critical' : calc.currentDrawC > 10 ? 'warning' : 'good'}">
                            ${calc.currentDrawC.toFixed(1)}C
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="result-section">
                <h3 class="result-title">
                    <span class="result-icon">🚁</span>
                    Flight Performance
                </h3>
                <div class="result-metrics">
                    <div class="result-metric">
                        <span class="metric-label">Required Thrust per Motor</span>
                        <span class="metric-value">${calc.thrustPerMotor.toFixed(1)}kg</span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">Total System Thrust</span>
                        <span class="metric-value">${calc.totalThrust.toFixed(1)}kg</span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">Thrust-to-Weight Ratio</span>
                        <span class="metric-value ${calc.thrustToWeight > 2 ? 'good' : calc.thrustToWeight > 1.5 ? 'warning' : 'critical'}">
                            ${calc.thrustToWeight.toFixed(2)}:1
                        </span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">Estimated Flight Time</span>
                        <span class="metric-value ${calc.flightTimeMinutes >= inputs.targetFlightTime ? 'good' : 'warning'}">
                            ${calc.flightTimeMinutes.toFixed(1)} min
                        </span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">Air Density Factor</span>
                        <span class="metric-value">${calc.densityRatio.toFixed(3)}</span>
                    </div>
                </div>
            </div>
            
            <div class="result-section">
                <h3 class="result-title">
                    <span class="result-icon">📊</span>
                    System Assessment
                </h3>
                <div class="assessment-list">
                    ${assessments.map(assessment => `
                        <div class="result-status status-${assessment.type}">
                            ${assessment.message}
                        </div>
                    `).join('')}
                </div>
                <div class="result-metrics">
                    <div class="result-metric">
                        <span class="metric-label">Total Vehicle Weight</span>
                        <span class="metric-value">${calc.totalWeight.toFixed(1)}kg</span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">Battery Energy</span>
                        <span class="metric-value">${calc.batteryEnergy.toFixed(1)}Wh</span>
                    </div>
                    <div class="result-metric">
                        <span class="metric-label">System Efficiency</span>
                        <span class="metric-value">${(calc.systemEfficiency * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('results-content').innerHTML = resultsHTML;
}

// Show motor recommendations
function showMotorRecommendations(recommendations) {
    if (recommendations.length === 0) {
        document.getElementById('motor-recommendations').style.display = 'none';
        return;
    }
    
    const recommendationsHTML = recommendations.map(motor => `
        <div class="recommendation-card">
            <div class="recommendation-header">
                <div>
                    <div class="motor-name">${motor.name}</div>
                    <div class="motor-series">${motor.series} Series</div>
                </div>
                <div class="match-score">${motor.matchScore}% Match</div>
            </div>
            
            <div class="motor-specs">
                <div class="motor-spec">
                    <span class="spec-label">Max Thrust</span>
                    <span class="spec-value">${motor.maxThrust}kg</span>
                </div>
                <div class="motor-spec">
                    <span class="spec-label">Thrust Margin</span>
                    <span class="spec-value">${motor.thrustMargin.toFixed(1)}x</span>
                </div>
                <div class="motor-spec">
                    <span class="spec-label">Weight</span>
                    <span class="spec-value">${(motor.weight * 1000).toFixed(0)}g</span>
                </div>
                <div class="motor-spec">
                    <span class="spec-label">Efficiency</span>
                    <span class="spec-value">${(motor.efficiency * 100).toFixed(1)}%</span>
                </div>
                <div class="motor-spec">
                    <span class="spec-label">Est. Current</span>
                    <span class="spec-value">${motor.estimatedCurrent.toFixed(1)}A</span>
                </div>
                <div class="motor-spec">
                    <span class="spec-label">Est. RPM</span>
                    <span class="spec-value">${motor.estimatedRPM.toFixed(0)}</span>
                </div>
            </div>
            
            <div class="recommendation-actions">
                <button class="btn btn-outline btn-small" onclick="viewMotorSpecs('${motor.name}')">
                    View Specs
                </button>
                <button class="btn btn-primary btn-small" onclick="requestMotorQuote('${motor.name}')">
                    Get Quote - $${motor.price}
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('recommendations-grid').innerHTML = recommendationsHTML;
    document.getElementById('motor-recommendations').style.display = 'block';
}

// Motor action functions
function viewMotorSpecs(motorName) {
    window.location.href = '../motor-matchmaker.html';
}

function requestMotorQuote(motorName) {
    if (typeof openQuoteModal === 'function') {
        openQuoteModal(motorName);
    } else {
        window.location.href = '../contact.html?motor=' + encodeURIComponent(motorName) + '&type=quote';
    }
}

// Auto-calculate when inputs change (with debounce)
let calculationTimeout;
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form-input, .form-select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(calculationTimeout);
            calculationTimeout = setTimeout(() => {
                // Auto-calculate only if all required fields are filled
                const requiredInputs = ['drone-weight', 'payload-weight', 'battery-capacity'];
                const allFilled = requiredInputs.every(id => 
                    document.getElementById(id).value && 
                    parseFloat(document.getElementById(id).value) > 0
                );
                
                if (allFilled) {
                    calculatePerformance();
                }
            }, 1000);
        });
    });
});