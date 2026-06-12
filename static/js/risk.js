// AI Health Risk Predictor Module
const RiskModule = {
    async loadRisk() {
        if (!window.AppState || !window.AppState.isProfileCompleted) return;

        const profile = window.AppState.profile;

        const statusText = document.getElementById('risk-status-text');
        const statusBadge = document.getElementById('risk-status-badge');
        const scoreText = document.getElementById('risk-score-text');
        const scoreFill = document.getElementById('risk-score-fill');
        const insightsContent = document.getElementById('risk-insights-content');
        const recommendationsList = document.getElementById('risk-recommendations-list');

        if (!statusText || !scoreText || !insightsContent || !recommendationsList) return;

        // Visual loading state
        statusText.innerText = "Analyzing...";
        scoreText.innerText = "0%";
        if (scoreFill) scoreFill.style.width = "0%";
        insightsContent.innerText = "FitGenie AI is compiling diagnostic telemetry...";
        recommendationsList.innerHTML = "<li>Analyzing inputs...</li>";

        try {
            const response = await fetch('/api/risk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            const data = await response.json();

            if (data.success) {
                // Save risk prediction to AppState
                window.AppState.telemetry.risk_level = data.risk_level;
                window.AppState.telemetry.risk_score = data.risk_score;
                window.AppState.telemetry.risk_insights = data.insights;
                window.AppState.telemetry.risk_recommendations = data.recommendations;
                window.AppState.saveState();

                this.renderRiskUI(data);
            } else {
                window.Toast.show("Failed to analyze health risks.", "error");
            }
        } catch (err) {
            console.error("Risk calculation error:", err);
            
            // Offline fallbacks
            const bmi = window.AppState.telemetry.bmi;
            const activity = profile.activity;
            let riskLevel = "Healthy Range";
            let riskScore = 10;
            let insights = "Offline Mode: Your health metrics appear balanced and stable. Re-run analysis once server is online.";
            let recommendations = "Maintain active lifestyle and balanced diet.\nContinue routine logging.";

            if (bmi >= 30.0) {
                riskLevel = "Obesity Risk";
                riskScore = 80;
                insights = "Offline Mode: High BMI indicates Obesity Risk. Focus on low-impact exercise and calorie control.";
                recommendations = "Low impact cardio exercises.\nAdopt caloric deficit.\nEmphasize protein intake.";
            } else if (bmi >= 25.0) {
                riskLevel = "Overweight Risk";
                riskScore = 55;
                insights = "Offline Mode: Elevated BMI indicates Overweight Risk. Moderate deficit and increased activity suggested.";
                recommendations = "Increase daily step counts.\nPreserve lean mass with proteins.\nStrength train 3x weekly.";
            } else if (bmi < 18.5) {
                riskLevel = "Underweight Risk";
                riskScore = 50;
                insights = "Offline Mode: Lower BMI indicates Underweight Risk. Nutrient dense diet and muscle building recommended.";
                recommendations = "Daily calorie surplus.\nFocus on compound resistance exercises.\nHealthy fats intake.";
            } else if (activity === "Sedentary") {
                riskLevel = "Sedentary Lifestyle Risk";
                riskScore = 40;
                insights = "Offline Mode: Sedentary lifestyle with healthy weight. Cardio and active breaks recommended.";
                recommendations = "Walk 5-10 minutes every hour.\nLight home bodyweight exercises.\nAim for 8000+ daily steps.";
            }

            const mockData = {
                risk_level: riskLevel,
                risk_score: riskScore,
                insights: insights,
                recommendations: recommendations
            };

            window.AppState.telemetry.risk_level = riskLevel;
            window.AppState.telemetry.risk_score = riskScore;
            window.AppState.telemetry.risk_insights = insights;
            window.AppState.telemetry.risk_recommendations = recommendations;
            window.AppState.saveState();

            this.renderRiskUI(mockData);
            window.Toast.show("Calculated locally (Offline mode)", "success");
        }
    },

    renderRiskUI(data) {
        const statusText = document.getElementById('risk-status-text');
        const statusBadge = document.getElementById('risk-status-badge');
        const scoreText = document.getElementById('risk-score-text');
        const scoreFill = document.getElementById('risk-score-fill');
        const insightsContent = document.getElementById('risk-insights-content');
        const recommendationsList = document.getElementById('risk-recommendations-list');

        if (!statusText || !scoreText || !insightsContent || !recommendationsList) return;

        statusText.innerText = data.risk_level;
        scoreText.innerText = `${data.risk_score}%`;
        if (scoreFill) scoreFill.style.width = `${data.risk_score}%`;
        insightsContent.innerText = data.insights;

        // Color coding for status badge and level card borders
        let color = '#10b981'; // green for healthy
        let bgClass = 'rgba(16, 185, 129, 0.1)';
        let badgeIcon = '<i class="fa-solid fa-circle-check"></i>';

        if (data.risk_level === 'Obesity Risk') {
            color = '#ef4444'; // red
            bgClass = 'rgba(239, 68, 68, 0.1)';
            badgeIcon = '<i class="fa-solid fa-circle-xmark"></i>';
        } else if (data.risk_level === 'Overweight Risk' || data.risk_level === 'Sedentary Lifestyle Risk') {
            color = '#f59e0b'; // orange/amber
            bgClass = 'rgba(245, 158, 11, 0.1)';
            badgeIcon = '<i class="fa-solid fa-triangle-exclamation"></i>';
        } else if (data.risk_level === 'Underweight Risk') {
            color = '#06b6d4'; // cyan
            bgClass = 'rgba(6, 182, 212, 0.1)';
            badgeIcon = '<i class="fa-solid fa-circle-exclamation"></i>';
        }

        if (statusBadge) {
            statusBadge.style.color = color;
            statusBadge.style.backgroundColor = bgClass;
            statusBadge.innerHTML = `${badgeIcon} ${data.risk_level}`;
        }

        const levelCard = document.getElementById('risk-level-card');
        if (levelCard) {
            levelCard.style.borderColor = color;
        }

        // Render recommendations as list items
        const items = data.recommendations.split('\n').filter(r => r.trim() !== '');
        recommendationsList.innerHTML = items.map(item => {
            // Clean up any prepended bullet symbols
            const cleanItem = item.replace(/^[\s•\-\*]+/, '');
            return `<li><i class="fa-solid fa-circle-dot" style="color:var(--secondary); font-size:0.75rem; margin-right:8px;"></i> ${cleanItem}</li>`;
        }).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('reanalyze-risk-btn');
    if (btn) {
        btn.addEventListener('click', () => RiskModule.loadRisk());
    }
});

window.RiskModule = RiskModule;
