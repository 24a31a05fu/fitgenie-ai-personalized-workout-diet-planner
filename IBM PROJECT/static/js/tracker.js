// Progress Tracking Module utilizing Chart.js
const TrackerModule = {
    weightChart: null,
    bmiChart: null,

    async initCharts() {
        if (!window.AppState || !window.AppState.isProfileCompleted) return;

        const profile = window.AppState.profile;
        
        try {
            const response = await fetch('/api/progress');
            const data = await response.json();

            if (data.success && data.progress) {
                if (data.progress.streak !== undefined) {
                    localStorage.setItem('fitgenie_streak', data.progress.streak.toString());
                }
                if (data.progress.completed_workouts !== undefined) {
                    localStorage.setItem('fitgenie_completed_workouts', data.progress.completed_workouts.toString());
                }
                this.renderCharts(data.progress);
                this.syncCompletedStats();
            }
        } catch (err) {
            console.error("Progress fetch error:", err);
            // Fallback mock values
            const fallbackProgress = {
                streak: parseInt(localStorage.getItem('fitgenie_streak') || '5'),
                weights: [profile.weight - 1.5, profile.weight - 1.1, profile.weight - 0.8, profile.weight - 0.4, profile.weight],
                bmis: [24.5, 24.3, 24.2, 24.1, window.AppState.telemetry.bmi],
                dates: ["Day 1", "Day 2", "Day 3", "Day 4", "Today"],
                completed_workouts: parseInt(localStorage.getItem('fitgenie_completed_workouts') || '8')
            };
            this.renderCharts(fallbackProgress);
            this.syncCompletedStats();
        }
    },

    renderCharts(progressData) {
        const ctxWeight = document.getElementById('weightProgressChart');
        const ctxBmi = document.getElementById('bmiProgressChart');

        if (!ctxWeight || !ctxBmi) return;

        // Is theme dark or light? Configure grid text colors.
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
        const textColor = isDark ? '#94a3b8' : '#475569';

        // 1. Weight Chart
        if (this.weightChart) {
            this.weightChart.destroy();
        }

        const weightGrad = ctxWeight.getContext('2d').createLinearGradient(0, 0, 0, 200);
        weightGrad.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
        weightGrad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

        this.weightChart = new Chart(ctxWeight, {
            type: 'line',
            data: {
                labels: progressData.dates,
                datasets: [{
                    label: 'Weight (kg)',
                    data: progressData.weights,
                    borderColor: '#3b82f6',
                    backgroundColor: weightGrad,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    }
                }
            }
        });

        // 2. BMI Chart
        if (this.bmiChart) {
            this.bmiChart.destroy();
        }

        const bmiGrad = ctxBmi.getContext('2d').createLinearGradient(0, 0, 0, 200);
        bmiGrad.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        bmiGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        this.bmiChart = new Chart(ctxBmi, {
            type: 'line',
            data: {
                labels: progressData.dates,
                datasets: [{
                    label: 'BMI Telemetry',
                    data: progressData.bmis,
                    borderColor: '#10b981',
                    backgroundColor: bmiGrad,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    }
                }
            }
        });

        // Update streak dashboard indicators
        const streakNode = document.getElementById('tr-streak-val');
        if (streakNode) {
            streakNode.innerText = progressData.streak;
        }
    },

    syncCompletedStats() {
        const completedNode = document.getElementById('tr-completed-val');
        if (completedNode) {
            const completedCount = localStorage.getItem('fitgenie_completed_workouts') || '8';
            completedNode.innerText = completedCount;
        }

        const streakNode = document.getElementById('tr-streak-val');
        if (streakNode) {
            const currentStreak = localStorage.getItem('fitgenie_streak') || '5';
            streakNode.innerText = currentStreak;
        }
    },

    async logNewWeight(e) {
        e.preventDefault();
        if (!window.AppState || !window.AppState.isProfileCompleted) return;

        const weightInput = document.getElementById('log-weight-input-field');
        if (!weightInput) return;

        const newWeight = parseFloat(weightInput.value);
        if (isNaN(newWeight) || newWeight <= 0) {
            alert("Please enter a valid weight parameter.");
            return;
        }

        // Calculate corresponding BMI
        const heightM = window.AppState.profile.height / 100.0;
        const newBMI = parseFloat((newWeight / (heightM * heightM)).toFixed(1));

        // Get simple date string
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        const dateStr = `${monthNames[today.getMonth()]} ${today.getDate()}`;

        try {
            // Post weight update to flask
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight: newWeight,
                    bmi: newBMI,
                    date: dateStr
                })
            });
            const data = await response.json();

            if (data.success && data.progress) {
                // Update active state details
                window.AppState.profile.weight = newWeight;
                window.AppState.telemetry.bmi = newBMI;
                window.AppState.saveState();

                // Re-render and clear input
                this.renderCharts(data.progress);
                weightInput.value = '';

                // Increment check-in streak
                localStorage.setItem('fitgenie_streak', data.progress.streak.toString());
                this.syncCompletedStats();
                
                alert("New weight logged! Your BMI has been updated automatically.");
                
                // Update dashboard variables
                if (window.DashboardModule) window.DashboardModule.updateUI();
            }
        } catch (err) {
            console.error("Failed to log progress on backend:", err);
            alert("Connection issue. Logged weight changes locally.");
            
            // Local fallback append
            let currentStreak = parseInt(localStorage.getItem('fitgenie_streak') || '5') + 1;
            localStorage.setItem('fitgenie_streak', currentStreak.toString());
            
            // Save state
            window.AppState.profile.weight = newWeight;
            window.AppState.telemetry.bmi = newBMI;
            window.AppState.saveState();
            
            weightInput.value = '';
            this.initCharts();
            if (window.DashboardModule) window.DashboardModule.updateUI();
        }
    }
};

// Hook Events
document.addEventListener('DOMContentLoaded', () => {
    const weightForm = document.getElementById('log-weight-form');
    if (weightForm) {
        weightForm.addEventListener('submit', (e) => TrackerModule.logNewWeight(e));
    }
});

// Bind globally
window.TrackerModule = TrackerModule;
