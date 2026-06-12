// Student Budget Diet Module
const DietModule = {
    async loadDiet() {
        if (!window.AppState || !window.AppState.isProfileCompleted) return;

        const profile = window.AppState.profile;
        const telemetry = window.AppState.telemetry;

        const summaryBar = document.getElementById('diet-summary-bar-node');
        if (!summaryBar) return;

        // Visual loading trigger
        summaryBar.style.opacity = '0.5';

        try {
            const response = await fetch('/api/diet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dietary_pref: profile.dietary_pref,
                    budget: profile.budget
                })
            });
            const data = await response.json();

            if (data.success && data.diet_plan) {
                this.renderDietUI(data.diet_plan, telemetry);
            } else {
                console.error("Failed to fetch diet details.");
            }
        } catch (err) {
            console.error("Diet fetch error:", err);
            
            // Fallback render local details
            const fallbackPlan = {
                Breakfast: "Oatmeal with peanut butter and fruit slices.",
                Lunch: "Veggie rice bowl with pan-seared tofu and broccoli.",
                Dinner: "Scrambled eggs (or tofu scrambles) on whole grain toast.",
                Snacks: "Hard boiled eggs or roasted chickpeas.",
                calories: telemetry.goal_calories,
                protein: `${telemetry.protein_req}g`,
                budget_tips: "Buy grains in bulk. Prepare items in advance to avoid buying college canteen takeout."
            };
            this.renderDietUI(fallbackPlan, telemetry);
        } finally {
            summaryBar.style.opacity = '1';
        }
    },

    renderDietUI(plan, telemetry) {
        const profile = window.AppState.profile;

        // 1. Update Summary Indicators
        const prefNode = document.getElementById('diet-summary-pref');
        const budgetNode = document.getElementById('diet-summary-budget');
        const calNode = document.getElementById('diet-summary-cal');
        const proteinNode = document.getElementById('diet-summary-protein');

        if (prefNode) prefNode.innerText = profile.dietary_pref;
        
        if (budgetNode) {
            let budgetSymbol = '$';
            if (profile.budget === 'Medium') budgetSymbol = '$$';
            if (profile.budget === 'High') budgetSymbol = '$$$';
            budgetNode.innerText = `${budgetSymbol} - ${profile.budget} Budget`;
        }

        if (calNode) calNode.innerText = `${telemetry.goal_calories.toLocaleString()} kcal`;
        if (proteinNode) proteinNode.innerText = `${telemetry.protein_req}g`;

        // 2. Update Meal Cards content
        const meals = {
            'meal-desc-breakfast': plan.Breakfast,
            'meal-desc-lunch': plan.Lunch,
            'meal-desc-dinner': plan.Dinner,
            'meal-desc-snacks': plan.Snacks,
            'diet-summary-tips': plan.budget_tips
        };

        for (const [id, content] of Object.entries(meals)) {
            const el = document.getElementById(id);
            if (el) el.innerText = content;
        }
    }
};

// Bind globally
window.DietModule = DietModule;
