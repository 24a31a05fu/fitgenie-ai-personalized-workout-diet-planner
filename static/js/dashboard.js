// Dashboard Controller & Real-Time Calculation Renderer
const DashboardModule = {
    updateUI() {
        if (!window.AppState || !window.AppState.isProfileCompleted) return;

        const profile = window.AppState.profile;
        const telemetry = window.AppState.telemetry;

        // 1. Update BMI Card
        const bmiVal = document.getElementById('db-val-bmi');
        const bmiStatus = document.getElementById('db-status-bmi');
        if (bmiVal && bmiStatus) {
            bmiVal.innerText = telemetry.bmi;
            
            let statusText = '';
            let statusClass = '';
            if (telemetry.bmi < 18.5) {
                statusText = '<i class="fa-solid fa-circle-exclamation"></i> Underweight';
                statusClass = 'status-alert';
            } else if (telemetry.bmi <= 24.9) {
                statusText = '<i class="fa-solid fa-circle-check"></i> Normal weight';
                statusClass = 'status-good';
            } else if (telemetry.bmi <= 29.9) {
                statusText = '<i class="fa-solid fa-circle-exclamation"></i> Overweight';
                statusClass = 'status-warn';
            } else {
                statusText = '<i class="fa-solid fa-circle-xmark"></i> Obese';
                statusClass = 'status-alert';
            }
            
            bmiStatus.className = `db-status ${statusClass}`;
            bmiStatus.innerHTML = statusText;
        }

        // 2. Update Calories Card
        const calVal = document.getElementById('db-val-calories');
        const maintVal = document.getElementById('db-val-maintenance');
        if (calVal && maintVal) {
            calVal.innerText = `${telemetry.goal_calories.toLocaleString()} kcal`;
            maintVal.innerText = telemetry.maintenance_calories.toLocaleString();
        }

        // 3. Update Protein Goal
        const proteinVal = document.getElementById('db-val-protein');
        const proteinStatus = document.getElementById('db-status-protein');
        if (proteinVal && proteinStatus) {
            proteinVal.innerText = `${telemetry.protein_req}g`;
            
            if (profile.goal === 'Muscle Gain') {
                proteinStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Hypertrophy target';
                proteinStatus.className = 'db-status status-good';
            } else {
                proteinStatus.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Daily macro target';
                proteinStatus.className = 'db-status status-warn';
            }
        }

        // 4. Update Water Card & Logger
        const waterVal = document.getElementById('db-val-water');
        if (waterVal) {
            waterVal.innerText = `${telemetry.water_req} Liters`;
        }
        this.updateWaterProgressBar();

        // 5. Update Fitness Score SVG Radial
        const scoreText = document.getElementById('fitness-score-text');
        const radialBar = document.getElementById('fitness-radial-bar');
        const guidance = document.getElementById('fitness-score-guidance');
        
        if (scoreText && radialBar) {
            const score = telemetry.fitness_score;
            scoreText.innerText = score;

            const circumference = 440;
            const offset = circumference - (score / 100) * circumference;
            radialBar.style.strokeDasharray = circumference;
            radialBar.style.strokeDashoffset = offset;

            if (score >= 90) {
                guidance.innerText = "Elite status! Your current biometric and study habits are in absolute synergy.";
            } else if (score >= 75) {
                guidance.innerText = "Good range. Try logging regular gym sessions and 7-8h sleep to reach Elite status.";
            } else {
                guidance.innerText = "Needs focus. Improving water levels and light daily walks will rapidly boost score.";
            }
        }

        // 6. Update Workout Progress Card
        const workoutCompletionVal = document.getElementById('db-val-workout-completion');
        const streakVal = document.getElementById('db-val-streak-count');
        if (workoutCompletionVal && streakVal) {
            const completedCount = localStorage.getItem('fitgenie_completed_workouts') || '8';
            const currentStreak = localStorage.getItem('fitgenie_streak') || '5';
            workoutCompletionVal.innerText = `${completedCount} Sessions`;
            streakVal.innerText = currentStreak;
        }

        // 7. Generate Contextual AI Suggestions
        this.renderAISuggestions();
    },

    updateWaterProgressBar() {
        const progressFill = document.getElementById('water-progress-fill-bar');
        if (!progressFill) return;

        const currentLog = window.AppState.profile.water_logged || 0;
        const targetLitres = window.AppState.telemetry.water_req || 3.2;
        const targetMl = targetLitres * 1000;

        const percentage = Math.min((currentLog / targetMl) * 100, 100);
        progressFill.style.width = `${percentage}%`;

        const waterCard = document.getElementById('db-card-water');
        if (waterCard) {
            let statusNode = waterCard.querySelector('.water-log-status');
            if (!statusNode) {
                statusNode = document.createElement('div');
                statusNode.className = 'water-log-status';
                statusNode.style.fontSize = '0.75rem';
                statusNode.style.marginTop = '8px';
                statusNode.style.fontWeight = '700';
                waterCard.querySelector('.water-log-area').appendChild(statusNode);
            }
            statusNode.style.color = percentage >= 100 ? 'var(--secondary)' : 'var(--text-secondary)';
            statusNode.innerHTML = `<i class="fa-solid fa-glass-water"></i> Logged: ${(currentLog / 1000).toFixed(2)}L / ${targetLitres}L (${Math.round(percentage)}%)`;
        }
    },

    logWater(amountMl) {
        if (!window.AppState || !window.AppState.isProfileCompleted) return;
        
        if (!window.AppState.profile.water_logged) {
            window.AppState.profile.water_logged = 0;
        }

        window.AppState.profile.water_logged += amountMl;
        window.AppState.saveState();
        this.updateWaterProgressBar();
        window.Toast.show(`Hydration logged +${amountMl}ml! Keep drinking.`, "success");
    },

    renderAISuggestions() {
        const container = document.getElementById('dashboard-suggestions-box');
        if (!container) return;

        const profile = window.AppState.profile;
        const suggestions = [];

        // 1. Budget Suggestion
        if (profile.budget === 'Low') {
            suggestions.push({
                icon: 'fa-wallet',
                color: 'var(--secondary)',
                title: 'Student Budget Hack',
                text: `Since you're on a Low Budget, source protein from whole eggs, store-brand peanut butter, and bulk oats. Plan your groceries around frozen spinach instead of fresh avocados.`
            });
        } else {
            suggestions.push({
                icon: 'fa-store',
                color: 'var(--primary)',
                title: 'Premium Nutrition Tip',
                text: `With a ${profile.budget} Budget, consider adding a high-quality Whey Protein isolate and omega-3 fish oil to simplify hitting your daily ${window.AppState.telemetry.protein_req}g target.`
            });
        }

        // 2. Goal / Study Suggestion
        if (profile.goal === 'Weight Loss') {
            suggestions.push({
                icon: 'fa-brain',
                color: 'var(--accent)',
                title: 'Caloric Deficit & Exams',
                text: 'Don\'t study on an empty stomach. Eat high-volume low-calorie foods (like air-popped popcorn or cucumber sticks) to satisfy hunger cravings during late-night study sessions.'
            });
        } else {
            suggestions.push({
                icon: 'fa-dumbbell',
                color: 'var(--primary)',
                title: 'Muscle Hypertrophy Hack',
                text: 'Ensure progressive overload in your workouts. Since your goal is Muscle Gain, aim to increase weight or reps every week, and eat a high-carb meal 90 mins before training.'
            });
        }

        // 3. General Health / Study Synergy
        suggestions.push({
            icon: 'fa-bolt',
            color: 'var(--secondary)',
            title: 'Active Study Breaks',
            text: `After 90 minutes of study, do a 5-minute break of squats or desk push-ups. This boosts blood flow to your prefrontal cortex, enhancing memory recall and cognitive performance.`
        });

        container.innerHTML = suggestions.map(s => `
            <div class="mockup-item" style="background:var(--bg-primary); padding:12px; margin-top:0;">
                <div class="fc-icon" style="background:${s.color}; color:white; min-width:32px; font-size:0.95rem; margin-right:4px;">
                    <i class="fa-solid ${s.icon}"></i>
                </div>
                <div style="flex-grow:1;">
                    <p style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-bottom:2px;">${s.title}</p>
                    <span style="font-size:0.75rem; line-height:1.4; color:var(--text-secondary); display:block;">${s.text}</span>
                </div>
            </div>
        `).join('');
    }
};

// Hook Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const btn250 = document.getElementById('log-water-btn-250');
    const btn500 = document.getElementById('log-water-btn-500');

    if (btn250) {
        btn250.addEventListener('click', () => {
            if (window.Auth && window.Auth.isLoggedIn()) {
                DashboardModule.logWater(250);
            }
        });
    }
    if (btn500) {
        btn500.addEventListener('click', () => {
            if (window.Auth && window.Auth.isLoggedIn()) {
                DashboardModule.logWater(500);
            }
        });
    }

    const btnWork = document.getElementById('db-btn-workout-gen');
    const btnDiet = document.getElementById('db-btn-diet-gen');

    if (btnWork) {
        btnWork.addEventListener('click', () => {
            if (window.Router) window.Router.navigate('workout-page');
        });
    }

    if (btnDiet) {
        btnDiet.addEventListener('click', () => {
            if (window.Router) window.Router.navigate('diet-page');
        });
    }
});

// Bind globally
window.DashboardModule = DashboardModule;
