// Workout Session Generator & Completion Manager
const WorkoutModule = {
    async loadWorkout() {
        if (!window.AppState || !window.AppState.isProfileCompleted) return;

        const profile = window.AppState.profile;
        const grid = document.getElementById('workout-exercises-grid');
        if (!grid) return;

        // Fetch selections
        const modeSelect = document.getElementById('workout-mode-select');
        const levelSelect = document.getElementById('workout-level-select');
        
        const mode = modeSelect ? modeSelect.value : 'Home';
        const level = levelSelect ? levelSelect.value : 'Beginner';

        // Display dynamic loading spinner inside card grid
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 10px;"></i>
                <p style="color: var(--text-secondary);">FitGenie AI is assembling your routine...</p>
            </div>
        `;

        try {
            const response = await fetch('/api/workout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goal: profile.goal,
                    mode: mode,
                    level: level
                })
            });
            const data = await response.json();

            if (data.success && data.workout_plan) {
                this.renderWorkoutGrid(data.workout_plan);
            } else {
                grid.innerHTML = `<p style="text-align:center; grid-column:1/-1; color:red;">Failed to retrieve workout options.</p>`;
            }
        } catch (err) {
            console.error("Workout fetch error:", err);
            grid.innerHTML = `<p style="text-align:center; grid-column:1/-1; color:var(--text-secondary);">Server connection lost. Please verify you are running Flask.</p>`;
        }
    },

    renderWorkoutGrid(exercises) {
        const grid = document.getElementById('workout-exercises-grid');
        if (!grid) return;

        if (!exercises || exercises.length === 0) {
            grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">No exercises found for your options.</p>`;
            return;
        }

        grid.innerHTML = exercises.map((ex, index) => `
            <div class="glass-card exercise-card glow-hover" id="exercise-card-${index}">
                <div class="ex-header">
                    <h3 id="ex-title-${index}">${ex.name}</h3>
                    <span class="ex-badge" id="ex-badge-${index}">${ex.muscle}</span>
                </div>
                <p class="ex-description" id="ex-desc-${index}">${ex.desc}</p>
                <div class="ex-footer">
                    <div class="ex-metric">
                        <span>Sets</span>
                        <p id="ex-sets-${index}">${ex.sets}</p>
                    </div>
                    <div class="ex-metric">
                        <span>Reps / Vol</span>
                        <p id="ex-reps-${index}">${ex.reps}</p>
                    </div>
                    <div class="ex-metric">
                        <span>Rest / Speed</span>
                        <p id="ex-duration-${index}">${ex.duration}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    markWorkoutCompleted() {
        if (!window.AppState) return;

        const completeBtn = document.getElementById('log-workout-done-btn');
        if (completeBtn) {
            const originalHTML = completeBtn.innerHTML;
            completeBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Logging Session...`;
            completeBtn.disabled = true;

            setTimeout(() => {
                // Fetch current tracker values
                let loggedCompleted = parseInt(localStorage.getItem('fitgenie_completed_workouts') || '8');
                loggedCompleted += 1;
                localStorage.setItem('fitgenie_completed_workouts', loggedCompleted.toString());

                // Streak tracking increase
                let loggedStreak = parseInt(localStorage.getItem('fitgenie_streak') || '5');
                loggedStreak += 1;
                localStorage.setItem('fitgenie_streak', loggedStreak.toString());

                // Show success dialog
                alert("Fantastic job! You've logged another completed session. Keep up the active streak!");

                completeBtn.innerHTML = originalHTML;
                completeBtn.disabled = false;

                // Sync to tracker page if initialized
                if (window.TrackerModule) {
                    window.TrackerModule.syncCompletedStats();
                }
            }, 600);
        }
    }
};

// Hook controls
document.addEventListener('DOMContentLoaded', () => {
    const triggerBtn = document.getElementById('trigger-workout-gen-btn');
    const doneBtn = document.getElementById('log-workout-done-btn');
    const modeSelect = document.getElementById('workout-mode-select');
    const levelSelect = document.getElementById('workout-level-select');

    if (triggerBtn) {
        triggerBtn.addEventListener('click', () => WorkoutModule.loadWorkout());
    }

    if (modeSelect) {
        modeSelect.addEventListener('change', () => WorkoutModule.loadWorkout());
    }

    if (levelSelect) {
        levelSelect.addEventListener('change', () => WorkoutModule.loadWorkout());
    }

    if (doneBtn) {
        doneBtn.addEventListener('click', () => WorkoutModule.markWorkoutCompleted());
    }
});

// Bind globally
window.WorkoutModule = WorkoutModule;
