/**
 * Game Theory Analysis Interactive Module
 * Gaza War Documentation Website
 */

class GameTheoryAnalyzer {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.setupInteractiveElements();
        this.setupPayoffCalculator();
        this.setupEquilibriumVisualizer();
        this.animateElements();
    }

    setupInteractiveElements() {
        // Add hover effects to payoff matrices
        const matrices = document.querySelectorAll('.game-matrix, .dilemma-matrix');
        matrices.forEach(matrix => {
            this.addMatrixInteractivity(matrix);
        });

        // Add equation explanation tooltips
        this.setupEquationTooltips();
    }

    addMatrixInteractivity(matrix) {
        const cells = matrix.querySelectorAll('td:not(:first-child)');
        
        cells.forEach(cell => {
            cell.addEventListener('mouseenter', (e) => {
                this.highlightPayoff(e.target);
            });
            
            cell.addEventListener('mouseleave', (e) => {
                this.removeHighlight(e.target);
            });
            
            cell.addEventListener('click', (e) => {
                this.explainPayoff(e.target);
            });
        });
    }

    highlightPayoff(cell) {
        cell.style.backgroundColor = '#e3f2fd';
        cell.style.transform = 'scale(1.05)';
        cell.style.transition = 'all 0.3s ease';
        cell.style.cursor = 'pointer';
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'payoff-tooltip';
        tooltip.textContent = 'Click for detailed analysis';
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            z-index: 1000;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = cell.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - 40) + 'px';
        
        cell.tooltip = tooltip;
    }

    removeHighlight(cell) {
        cell.style.backgroundColor = '';
        cell.style.transform = '';
        
        if (cell.tooltip) {
            document.body.removeChild(cell.tooltip);
            cell.tooltip = null;
        }
    }

    explainPayoff(cell) {
        const payoffText = cell.textContent.trim();
        const explanation = this.generatePayoffExplanation(payoffText);
        
        // Create modal with explanation
        this.showPayoffModal(payoffText, explanation);
    }

    generatePayoffExplanation(payoffText) {
        const payoffExplanations = {
            '(8, 6)': {
                scenario: 'Netanyahu Escalates + Trump Full Support',
                netanyahu: 'High political survival (8/10) - maximizes rally effect and delays legal proceedings',
                trump: 'Good electoral benefits (6/10) - strong evangelical support but some international criticism',
                analysis: 'This represents the current equilibrium - both players benefit from continued conflict'
            },
            '(5, 4)': {
                scenario: 'Netanyahu Escalates + Trump Conditional Support',
                netanyahu: 'Moderate political survival (5/10) - some domestic support but international pressure',
                trump: 'Limited benefits (4/10) - mixed signals hurt with all constituencies',
                analysis: 'Unstable position - likely to shift toward full support or pressure for peace'
            },
            '(2, 2)': {
                scenario: 'Netanyahu Escalates + Trump Pressures for Peace',
                netanyahu: 'Low survival (2/10) - isolated internationally and domestically criticized',
                trump: 'Low benefits (2/10) - loses pro-Israel voters without gaining peace constituency',
                analysis: 'Worst outcome for both - represents breakdown of alliance'
            },
            '(7, 8)': {
                scenario: 'Netanyahu De-escalates + Trump Pressures for Peace',
                netanyahu: 'Good long-term position (7/10) - international rehabilitation',
                trump: 'High benefits (8/10) - credit for peace-making, broader electoral appeal',
                analysis: 'Optimal social outcome but requires coordination and trust'
            },
            '(7, 6)': {
                scenario: 'Netanyahu Status Quo + Trump Full Support',
                netanyahu: 'Stable position (7/10) - maintains control without escalation costs',
                trump: 'Solid benefits (6/10) - satisfies base without major risks',
                analysis: 'Likely equilibrium - sustainable for both parties'
            }
        };

        return payoffExplanations[payoffText] || {
            scenario: 'Strategic Interaction',
            analysis: 'This payoff represents the utility each player receives from their strategic choices'
        };
    }

    showPayoffModal(payoffText, explanation) {
        // Remove existing modal if present
        const existingModal = document.querySelector('.payoff-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'payoff-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Payoff Analysis: ${payoffText}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>${explanation.scenario}</h4>
                    ${explanation.netanyahu ? `<p><strong>Netanyahu (${payoffText.split(',')[0].replace('(', '')}):</strong> ${explanation.netanyahu}</p>` : ''}
                    ${explanation.trump ? `<p><strong>Trump/US (${payoffText.split(',')[1].replace(')', '')}):</strong> ${explanation.trump}</p>` : ''}
                    <p><strong>Strategic Analysis:</strong> ${explanation.analysis}</p>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        const closeButton = modal.querySelector('.close-modal');
        closeButton.style.cssText = `
            float: right;
            font-size: 2rem;
            cursor: pointer;
            border: none;
            background: none;
            color: #666;
        `;

        document.body.appendChild(modal);

        // Close modal events
        closeButton.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });
    }

    setupPayoffCalculator() {
        // Add interactive payoff calculator
        const calculatorSection = this.createPayoffCalculator();
        const equilibriumSection = document.getElementById('equilibrium');
        if (equilibriumSection) {
            equilibriumSection.appendChild(calculatorSection);
        }
    }

    createPayoffCalculator() {
        const calculator = document.createElement('div');
        calculator.className = 'payoff-calculator';
        calculator.innerHTML = `
            <h3>Interactive Payoff Calculator</h3>
            <div class="calculator-controls">
                <div class="control-group">
                    <label>Netanyahu's Political Pressure (α):</label>
                    <input type="range" id="alpha" min="0" max="1" step="0.1" value="0.7">
                    <span id="alpha-value">0.7</span>
                </div>
                <div class="control-group">
                    <label>Security Narrative Weight (β):</label>
                    <input type="range" id="beta" min="0" max="1" step="0.1" value="0.2">
                    <span id="beta-value">0.2</span>
                </div>
                <div class="control-group">
                    <label>Coalition Stability (γ):</label>
                    <input type="range" id="gamma" min="0" max="1" step="0.1" value="0.1">
                    <span id="gamma-value">0.1</span>
                </div>
                <div class="control-group">
                    <label>US Electoral Pressure (δ):</label>
                    <input type="range" id="delta" min="0" max="1" step="0.1" value="0.6">
                    <span id="delta-value">0.6</span>
                </div>
            </div>
            <div class="calculator-results">
                <div class="result-display">
                    <h4>Calculated Utilities:</h4>
                    <div id="utility-results"></div>
                </div>
                <div class="equilibrium-prediction">
                    <h4>Predicted Strategy:</h4>
                    <div id="strategy-prediction"></div>
                </div>
            </div>
        `;

        calculator.style.cssText = `
            background: #f8f9fa;
            border: 2px solid #007bff;
            border-radius: 10px;
            padding: 2rem;
            margin: 2rem 0;
        `;

        // Add event listeners for sliders
        this.setupCalculatorControls(calculator);

        return calculator;
    }

    setupCalculatorControls(calculator) {
        const sliders = calculator.querySelectorAll('input[type="range"]');
        
        sliders.forEach(slider => {
            const valueSpan = calculator.querySelector(`#${slider.id}-value`);
            
            slider.addEventListener('input', (e) => {
                valueSpan.textContent = e.target.value;
                this.updateCalculations(calculator);
            });
        });

        // Initial calculation
        this.updateCalculations(calculator);
    }

    updateCalculations(calculator) {
        const alpha = parseFloat(calculator.querySelector('#alpha').value);
        const beta = parseFloat(calculator.querySelector('#beta').value);
        const gamma = parseFloat(calculator.querySelector('#gamma').value);
        const delta = parseFloat(calculator.querySelector('#delta').value);

        // Calculate utilities for different strategies
        const utilities = this.calculateStrategicUtilities(alpha, beta, gamma, delta);
        
        // Display results
        this.displayUtilityResults(calculator, utilities);
        this.displayStrategyPrediction(calculator, utilities);
    }

    calculateStrategicUtilities(alpha, beta, gamma, delta) {
        // Multi-player utility calculations based on the expanded game theory model
        const scenarios = {
            current_equilibrium: {
                netanyahu: alpha * 0.85 + beta * 0.8 + gamma * 0.9,
                us: delta * 0.8 + 0.3 * 0.7 + 0.1 * 0.6,
                palestinians: 0.2 * 0.3 + 0.3 * 0.4 + 0.5 * 0.2,
                hamas: 0.4 * 0.8 + 0.3 * 0.7 + 0.3 * 0.6,
                iran: 0.5 * 0.9 + 0.3 * 0.8 + 0.2 * 0.7,
                eu: 0.3 * 0.4 + 0.4 * 0.6 + 0.3 * 0.5,
                canada: 0.3 * 0.5 + 0.4 * 0.7 + 0.3 * 0.6,
                uae: 0.4 * 0.8 + 0.3 * 0.9 + 0.3 * 0.7,
                china: 0.4 * 0.7 + 0.3 * 0.8 + 0.3 * 0.6,
                russia: 0.5 * 0.8 + 0.3 * 0.7 + 0.2 * 0.6,
                ukraine: 0.3 * 0.5 + 0.4 * 0.6 + 0.3 * 0.4,
                media: 0.4 * 0.6 + 0.3 * 0.7 + 0.3 * 0.5
            },
            
            escalation_scenario: {
                netanyahu: alpha * 0.9 + beta * 0.9 + gamma * 0.7,
                us: delta * 0.6 + 0.3 * 0.8 + 0.1 * 0.7,
                palestinians: 0.2 * 0.1 + 0.3 * 0.2 + 0.5 * 0.1,
                hamas: 0.4 * 0.9 + 0.3 * 0.8 + 0.3 * 0.7,
                iran: 0.5 * 0.95 + 0.3 * 0.9 + 0.2 * 0.8,
                eu: 0.3 * 0.2 + 0.4 * 0.3 + 0.3 * 0.4,
                canada: 0.3 * 0.3 + 0.4 * 0.4 + 0.3 * 0.5,
                uae: 0.4 * 0.6 + 0.3 * 0.7 + 0.3 * 0.5,
                china: 0.4 * 0.8 + 0.3 * 0.6 + 0.3 * 0.7,
                russia: 0.5 * 0.9 + 0.3 * 0.8 + 0.2 * 0.7,
                ukraine: 0.3 * 0.3 + 0.4 * 0.4 + 0.3 * 0.2,
                media: 0.4 * 0.8 + 0.3 * 0.5 + 0.3 * 0.6
            },
            
            peace_scenario: {
                netanyahu: alpha * 0.3 + beta * 0.4 + gamma * 0.4,
                us: delta * 0.9 + 0.3 * 0.8 + 0.1 * 0.9,
                palestinians: 0.2 * 0.9 + 0.3 * 0.8 + 0.5 * 0.9,
                hamas: 0.4 * 0.3 + 0.3 * 0.4 + 0.3 * 0.2,
                iran: 0.5 * 0.4 + 0.3 * 0.5 + 0.2 * 0.3,
                eu: 0.3 * 0.8 + 0.4 * 0.9 + 0.3 * 0.8,
                canada: 0.3 * 0.8 + 0.4 * 0.9 + 0.3 * 0.8,
                uae: 0.4 * 0.7 + 0.3 * 0.8 + 0.3 * 0.9,
                china: 0.4 * 0.6 + 0.3 * 0.7 + 0.3 * 0.8,
                russia: 0.5 * 0.4 + 0.3 * 0.5 + 0.2 * 0.3,
                ukraine: 0.3 * 0.7 + 0.4 * 0.8 + 0.3 * 0.6,
                media: 0.4 * 0.7 + 0.3 * 0.8 + 0.3 * 0.9
            },
            
            coalition_breakdown: {
                netanyahu: alpha * 0.4 + beta * 0.5 + gamma * 0.3,
                us: delta * 0.5 + 0.3 * 0.4 + 0.1 * 0.5,
                palestinians: 0.2 * 0.6 + 0.3 * 0.5 + 0.5 * 0.4,
                hamas: 0.4 * 0.5 + 0.3 * 0.6 + 0.3 * 0.4,
                iran: 0.5 * 0.6 + 0.3 * 0.7 + 0.2 * 0.5,
                eu: 0.3 * 0.6 + 0.4 * 0.7 + 0.3 * 0.6,
                canada: 0.3 * 0.6 + 0.4 * 0.7 + 0.3 * 0.6,
                uae: 0.4 * 0.5 + 0.3 * 0.6 + 0.3 * 0.6,
                china: 0.4 * 0.8 + 0.3 * 0.7 + 0.3 * 0.7,
                russia: 0.5 * 0.7 + 0.3 * 0.6 + 0.2 * 0.5,
                ukraine: 0.3 * 0.4 + 0.4 * 0.5 + 0.3 * 0.3,
                media: 0.4 * 0.5 + 0.3 * 0.6 + 0.3 * 0.4
            }
        };

        return scenarios;
    }

    displayUtilityResults(calculator, utilities) {
        const resultsDiv = calculator.querySelector('#utility-results');
        
        let html = '<div class="multi-player-results">';
        html += '<h5>Multi-Player Utility Analysis</h5>';
        
        // Create tabs for different scenarios
        html += '<div class="scenario-tabs">';
        html += '<button class="tab-button active" data-scenario="current_equilibrium">Current Equilibrium</button>';
        html += '<button class="tab-button" data-scenario="escalation_scenario">Escalation</button>';
        html += '<button class="tab-button" data-scenario="peace_scenario">Peace</button>';
        html += '<button class="tab-button" data-scenario="coalition_breakdown">Coalition Breakdown</button>';
        html += '</div>';
        
        // Create content for each scenario
        Object.entries(utilities).forEach(([scenario, values]) => {
            const isActive = scenario === 'current_equilibrium' ? 'active' : '';
            html += `<div class="scenario-content ${isActive}" data-scenario="${scenario}">`;
            html += '<table class="multi-utility-table">';
            html += '<tr><th>Player</th><th>Utility</th><th>Relative Strength</th></tr>';
            
            // Sort players by utility for this scenario
            const sortedPlayers = Object.entries(values).sort(([,a], [,b]) => b - a);
            
            sortedPlayers.forEach(([player, utility], index) => {
                const playerName = player.charAt(0).toUpperCase() + player.slice(1);
                const relativeStrength = this.calculateRelativeStrength(utility, values);
                const rankClass = index < 3 ? 'top-rank' : index > sortedPlayers.length - 4 ? 'bottom-rank' : 'mid-rank';
                
                html += `<tr class="${rankClass}">
                    <td>${playerName}</td>
                    <td>${utility.toFixed(3)}</td>
                    <td>${relativeStrength}%</td>
                </tr>`;
            });
            
            html += '</table></div>';
        });
        
        html += '</div>';
        resultsDiv.innerHTML = html;
        
        // Add tab functionality
        this.setupScenarioTabs(calculator);
    }

    calculateRelativeStrength(playerUtility, allUtilities) {
        const maxUtility = Math.max(...Object.values(allUtilities));
        const minUtility = Math.min(...Object.values(allUtilities));
        const range = maxUtility - minUtility;
        
        if (range === 0) return 50;
        
        return Math.round(((playerUtility - minUtility) / range) * 100);
    }

    setupScenarioTabs(calculator) {
        const tabButtons = calculator.querySelectorAll('.tab-button');
        const scenarioContents = calculator.querySelectorAll('.scenario-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const scenario = e.target.dataset.scenario;
                
                // Update active tab
                tabButtons.forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update active content
                scenarioContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.dataset.scenario === scenario) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    displayStrategyPrediction(calculator, utilities) {
        const predictionDiv = calculator.querySelector('#strategy-prediction');
        
        // Calculate coalition strengths for each scenario
        const coalitionAnalysis = this.analyzeCoalitions(utilities);
        
        predictionDiv.innerHTML = `
            <div class="multi-prediction-result">
                <h5>Multi-Player Equilibrium Analysis</h5>
                
                <div class="coalition-strengths">
                    <h6>Coalition Power Rankings</h6>
                    ${this.generateCoalitionRankings(coalitionAnalysis)}
                </div>
                
                <div class="stability-prediction">
                    <h6>Equilibrium Stability Prediction</h6>
                    <div class="stability-metrics">
                        <div class="metric">
                            <span class="metric-label">Overall Stability:</span>
                            <span class="metric-value">${coalitionAnalysis.overallStability.toFixed(2)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Coalition Cohesion:</span>
                            <span class="metric-value">${coalitionAnalysis.cohesion.toFixed(2)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Conflict Likelihood:</span>
                            <span class="metric-value">${coalitionAnalysis.conflictProbability.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="scenario-recommendation">
                    <h6>Most Likely Outcome</h6>
                    <p><strong>${coalitionAnalysis.likelyOutcome.scenario}</strong></p>
                    <p>${coalitionAnalysis.likelyOutcome.explanation}</p>
                    <div class="outcome-probability">
                        Probability: ${(coalitionAnalysis.likelyOutcome.probability * 100).toFixed(1)}%
                    </div>
                </div>
            </div>
        `;
    }

    analyzeCoalitions(utilities) {
        const scenarios = Object.keys(utilities);
        
        // Calculate average utilities for coalition groups
        const coalitionStrengths = {};
        
        scenarios.forEach(scenario => {
            const values = utilities[scenario];
            
            coalitionStrengths[scenario] = {
                proIsrael: (values.netanyahu + values.us + values.uae) / 3,
                resistanceAxis: (values.hamas + values.iran + values.russia) / 3,
                moderates: (values.eu + values.canada + values.palestinians) / 3,
                opportunists: (values.china + values.media + (values.ukraine || 0.5)) / 3
            };
        });
        
        // Calculate stability metrics
        const currentEquilibrium = utilities.current_equilibrium;
        const totalUtility = Object.values(currentEquilibrium).reduce((sum, val) => sum + val, 0);
        const averageUtility = totalUtility / Object.keys(currentEquilibrium).length;
        
        // Calculate variance (lower variance = higher stability)
        const variance = Object.values(currentEquilibrium)
            .reduce((sum, val) => sum + Math.pow(val - averageUtility, 2), 0) / Object.keys(currentEquilibrium).length;
        
        const stability = Math.max(0, 1 - variance);
        
        // Calculate cohesion (how aligned coalition members are)
        const proIsraelCohesion = this.calculateCohesion([
            currentEquilibrium.netanyahu, 
            currentEquilibrium.us, 
            currentEquilibrium.uae
        ]);
        
        const resistanceCohesion = this.calculateCohesion([
            currentEquilibrium.hamas, 
            currentEquilibrium.iran, 
            currentEquilibrium.russia
        ]);
        
        const overallCohesion = (proIsraelCohesion + resistanceCohesion) / 2;
        
        // Predict most likely outcome
        const scenarioScores = scenarios.map(scenario => {
            const values = utilities[scenario];
            const topPlayers = Object.entries(values)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 4);
            
            const score = topPlayers.reduce((sum, [, utility]) => sum + utility, 0);
            return { scenario, score, values };
        });
        
        const bestScenario = scenarioScores.reduce((best, current) => 
            current.score > best.score ? current : best
        );
        
        return {
            coalitionStrengths,
            overallStability: stability,
            cohesion: overallCohesion,
            conflictProbability: Math.max(0, 1 - stability - overallCohesion + 0.3),
            likelyOutcome: {
                scenario: bestScenario.scenario.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                explanation: this.getScenarioExplanation(bestScenario.scenario),
                probability: Math.min(0.95, stability + overallCohesion)
            }
        };
    }

    calculateCohesion(utilities) {
        const average = utilities.reduce((sum, val) => sum + val, 0) / utilities.length;
        const variance = utilities.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / utilities.length;
        return Math.max(0, 1 - variance);
    }

    getScenarioExplanation(scenario) {
        const explanations = {
            current_equilibrium: "Continuation of status quo with controlled escalation, maintaining current coalition structures and strategic relationships.",
            escalation_scenario: "Significant increase in conflict intensity driven by hardline coalitions, with higher stakes for all players.",
            peace_scenario: "Coordinated peace effort led by moderate coalitions, requiring significant concessions from primary conflict actors.",
            coalition_breakdown: "Fragmentation of existing alliances leading to unpredictable strategic realignments and potential new conflicts."
        };
        
        return explanations[scenario] || "Strategic outcome based on current utility maximization calculations.";
    }

    generateCoalitionRankings(analysis) {
        const currentStrengths = analysis.coalitionStrengths.current_equilibrium;
        
        const rankings = Object.entries(currentStrengths)
            .sort(([,a], [,b]) => b - a)
            .map(([coalition, strength], index) => {
                const coalitionNames = {
                    proIsrael: "Pro-Israel Coalition",
                    resistanceAxis: "Resistance Axis",
                    moderates: "Moderate Coalition",
                    opportunists: "Opportunistic Players"
                };
                
                return `
                    <div class="coalition-rank rank-${index + 1}">
                        <span class="rank-number">${index + 1}</span>
                        <span class="coalition-name">${coalitionNames[coalition]}</span>
                        <span class="strength-score">${strength.toFixed(3)}</span>
                    </div>
                `;
            });
        
        return rankings.join('');
    }

    setupEquationTooltips() {
        // Add explanatory tooltips to mathematical equations
        const equations = document.querySelectorAll('.equation-block');
        
        equations.forEach(block => {
            const mathElements = block.querySelectorAll('span, p');
            mathElements.forEach(element => {
                if (this.containsMath(element.textContent)) {
                    this.addMathTooltip(element);
                }
            });
        });
    }

    containsMath(text) {
        return /[αβγδεζθφσ]|U_|BR_|max_/.test(text);
    }

    addMathTooltip(element) {
        element.style.cursor = 'help';
        element.style.borderBottom = '1px dotted #666';
        
        element.addEventListener('mouseenter', (e) => {
            const explanation = this.getMathExplanation(e.target.textContent);
            if (explanation) {
                this.showMathTooltip(e.target, explanation);
            }
        });

        element.addEventListener('mouseleave', (e) => {
            this.hideMathTooltip();
        });
    }

    getMathExplanation(text) {
        const explanations = {
            'α': 'Alpha: Weight given to political survival considerations',
            'β': 'Beta: Weight given to security narrative importance',
            'γ': 'Gamma: Weight given to coalition stability factors',
            'δ': 'Delta: Weight given to electoral benefits',
            'ε': 'Epsilon: Weight given to geopolitical influence',
            'ζ': 'Zeta: Weight given to economic returns',
            'θ': 'Theta: Private information about domestic constraints',
            'φ': 'Phi: Private information about political pressures',
            'σ': 'Sigma: Stability coefficient for equilibrium analysis',
            'U_N': 'Utility function for Netanyahu',
            'U_US': 'Utility function for Trump/US',
            'BR_': 'Best Response function',
            'max_': 'Maximization operator'
        };

        for (const [symbol, explanation] of Object.entries(explanations)) {
            if (text.includes(symbol)) {
                return explanation;
            }
        }
        return null;
    }

    showMathTooltip(element, explanation) {
        const tooltip = document.createElement('div');
        tooltip.className = 'math-tooltip';
        tooltip.textContent = explanation;
        tooltip.style.cssText = `
            position: absolute;
            background: #2c3e50;
            color: white;
            padding: 0.8rem;
            border-radius: 6px;
            font-size: 0.9rem;
            max-width: 250px;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            pointer-events: none;
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 10) + 'px';

        this.currentTooltip = tooltip;
    }

    hideMathTooltip() {
        if (this.currentTooltip) {
            document.body.removeChild(this.currentTooltip);
            this.currentTooltip = null;
        }
    }

    animateElements() {
        // Animate elements as they come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        const animatedElements = document.querySelectorAll('.model-container, .actor-card, .implication-card');
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }

    setupEquilibriumVisualizer() {
        // Create visual representation of Nash equilibrium
        const visualizer = this.createEquilibriumVisualizer();
        const equilibriumSection = document.getElementById('equilibrium');
        if (equilibriumSection) {
            equilibriumSection.appendChild(visualizer);
        }
    }

    createEquilibriumVisualizer() {
        const visualizer = document.createElement('div');
        visualizer.className = 'equilibrium-visualizer';
        visualizer.innerHTML = `
            <h3>Nash Equilibrium Visualization</h3>
            <div class="visualization-container">
                <canvas id="equilibrium-canvas" width="600" height="400"></canvas>
                <div class="visualization-controls">
                    <button id="animate-equilibrium">Animate Convergence</button>
                    <button id="reset-visualization">Reset</button>
                </div>
            </div>
            <div class="visualization-explanation">
                <p>This visualization shows how different starting positions converge to the Nash equilibrium through best response dynamics.</p>
            </div>
        `;

        visualizer.style.cssText = `
            background: white;
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 2rem;
            margin: 2rem 0;
            text-align: center;
        `;

        // Initialize canvas visualization
        setTimeout(() => this.initializeVisualization(visualizer), 100);

        return visualizer;
    }

    initializeVisualization(visualizer) {
        const canvas = visualizer.querySelector('#equilibrium-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Draw coordinate system
        this.drawCoordinateSystem(ctx, canvas.width, canvas.height);
        
        // Draw payoff regions
        this.drawPayoffRegions(ctx, canvas.width, canvas.height);
        
        // Draw equilibrium point
        this.drawEquilibriumPoint(ctx, canvas.width, canvas.height);

        // Setup animation controls
        const animateButton = visualizer.querySelector('#animate-equilibrium');
        const resetButton = visualizer.querySelector('#reset-visualization');

        animateButton.addEventListener('click', () => {
            this.animateConvergence(ctx, canvas.width, canvas.height);
        });

        resetButton.addEventListener('click', () => {
            this.resetVisualization(ctx, canvas.width, canvas.height);
        });
    }

    drawCoordinateSystem(ctx, width, height) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // X-axis (US utility)
        ctx.beginPath();
        ctx.moveTo(50, height - 50);
        ctx.lineTo(width - 50, height - 50);
        ctx.stroke();
        
        // Y-axis (Netanyahu utility)
        ctx.beginPath();
        ctx.moveTo(50, height - 50);
        ctx.lineTo(50, 50);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText('US Utility', width - 100, height - 20);
        ctx.save();
        ctx.translate(20, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Netanyahu Utility', 0, 0);
        ctx.restore();
    }

    drawPayoffRegions(ctx, width, height) {
        // Draw different strategy regions with different colors
        const regions = [
            { x: 100, y: 100, w: 150, h: 150, color: '#ffebee', label: 'Mutual Escalation' },
            { x: 300, y: 100, w: 150, h: 150, color: '#e8f5e8', label: 'Mutual Peace' },
            { x: 100, y: 300, w: 150, h: 150, color: '#fff3e0', label: 'Status Quo' },
            { x: 300, y: 300, w: 150, h: 150, color: '#f3e5f5', label: 'Mixed Strategy' }
        ];

        regions.forEach(region => {
            ctx.fillStyle = region.color;
            ctx.fillRect(region.x, region.y, region.w, region.h);
            
            ctx.strokeStyle = '#999';
            ctx.strokeRect(region.x, region.y, region.w, region.h);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.fillText(region.label, region.x + 10, region.y + 20);
        });
    }

    drawEquilibriumPoint(ctx, width, height) {
        // Draw Nash equilibrium point
        const eqX = 350;
        const eqY = 200;
        
        ctx.fillStyle = '#d32f2f';
        ctx.beginPath();
        ctx.arc(eqX, eqY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Nash Equilibrium', eqX + 15, eqY - 5);
        ctx.fillText('(Status Quo, Full Support)', eqX + 15, eqY + 10);
    }

    animateConvergence(ctx, width, height) {
        // Animate how different starting points converge to equilibrium
        const startingPoints = [
            { x: 100, y: 100 },
            { x: 400, y: 100 },
            { x: 100, y: 350 },
            { x: 400, y: 350 }
        ];

        const equilibrium = { x: 350, y: 200 };
        
        startingPoints.forEach((point, index) => {
            setTimeout(() => {
                this.animatePoint(ctx, point, equilibrium, index);
            }, index * 500);
        });
    }

    animatePoint(ctx, start, end, colorIndex) {
        const colors = ['#f44336', '#2196f3', '#4caf50', '#ff9800'];
        const steps = 50;
        let currentStep = 0;

        const animate = () => {
            if (currentStep >= steps) return;

            const progress = currentStep / steps;
            const currentX = start.x + (end.x - start.x) * progress;
            const currentY = start.y + (end.y - start.y) * progress;

            ctx.fillStyle = colors[colorIndex];
            ctx.beginPath();
            ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
            ctx.fill();

            currentStep++;
            setTimeout(animate, 50);
        };

        animate();
    }

    resetVisualization(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
        this.drawCoordinateSystem(ctx, width, height);
        this.drawPayoffRegions(ctx, width, height);
        this.drawEquilibriumPoint(ctx, width, height);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameTheoryAnalyzer();
});

export default GameTheoryAnalyzer;
