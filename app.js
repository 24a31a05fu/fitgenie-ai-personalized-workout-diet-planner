
// Core Application State
const AppState = {
    profile: {
        name: 'Student',
        age: 21,
        gender: 'Male',
        height: 175,
        weight: 70,
        activity: 'Active',
        goal: 'Weight Loss',
        dietary_pref: 'Veg',
        budget: 'Low',
        water_logged: 0
    },
    telemetry: {
        bmi: 22.9,
        bmr: 1640,
        maintenance_calories: 2540,
        goal_calories: 1950,
        protein_req: 140,
        water_req: 3.2,
        fitness_score: 85
    },
    isProfileCompleted: false,

    loadState() {
        const savedProfile = localStorage.getItem('fitgenie_profile');
        if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
            this.isProfileCompleted = true;
            this.syncProfileToForm();
            return true;
        }
        return false;
    },

    saveState() {
        localStorage.setItem('fitgenie_profile', JSON.stringify(this.profile));
        this.isProfileCompleted = true;
    },

    syncProfileToForm() {
        const fields = {
            'pf-name': this.profile.name,
            'pf-age': this.profile.age,
            'pf-height': this.profile.height,
            'pf-weight': this.profile.weight,
            'pf-activity': this.profile.activity,
            'pf-goal': this.profile.goal,
            'pf-diet': this.profile.dietary_pref
        };
        for (const [id, val] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }

        const genderRadio = document.querySelector(`input[name="gender"][value="${this.profile.gender}"]`);
        if (genderRadio) genderRadio.checked = true;

        const budgetRadio = document.querySelector(`input[name="budget"][value="${this.profile.budget}"]`);
        if (budgetRadio) budgetRadio.checked = true;
    }
};

const Router = {
    init() {
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetPage = link.getAttribute('data-target');
                if (targetPage) {
                    this.navigate(targetPage);
                }
            });
        });
    },

    navigate(pageId) {
        // Protected Route Gate Check
        if (pageId !== 'landing-page' && (!window.Auth || !window.Auth.isLoggedIn())) {
            window.Toast.show("Login required before access!", "error");
            this.navigate('landing-page');
            if (window.AuthModal) {
                window.AuthModal.showLogin();
            }
            return;
        }

        // Onboarding Check
        const secureCalculationPages = ['dashboard-page', 'workout-page', 'diet-page', 'tracker-page', 'report-page', 'risk-page'];
        if (secureCalculationPages.includes(pageId) && !AppState.isProfileCompleted) {
            window.Toast.show("Please complete profile onboarding first!", "warning");
            this.navigate('profile-page');
            return;
        }

        // Hide all pages
        const pages = document.querySelectorAll('.page-section');
        pages.forEach(page => page.classList.remove('active'));

        // Reset nav states
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => link.classList.remove('active'));

        // Show page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            window.location.hash = pageId;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Set active in navbar
        const activeLink = document.querySelector(`.nav-link[data-target="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Page Lifecycle triggers
        if (pageId === 'dashboard-page' && window.DashboardModule) {
            window.DashboardModule.updateUI();
        } else if (pageId === 'workout-page' && window.WorkoutModule) {
            window.WorkoutModule.loadWorkout();
        } else if (pageId === 'diet-page' && window.DietModule) {
            window.DietModule.loadDiet();
        } else if (pageId === 'tracker-page' && window.TrackerModule) {
            window.TrackerModule.initCharts();
        } else if (pageId === 'report-page' && window.PDFModule) {
            window.PDFModule.renderPreview();
        } else if (pageId === 'risk-page' && window.RiskModule) {
            window.RiskModule.loadRisk();
        }
    }
};

// Theme Management
const ThemeManager = {
    init() {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (!toggleBtn) return;

        const savedTheme = localStorage.getItem('fitgenie_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateIcon(savedTheme);

        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('fitgenie_theme', newTheme);
            this.updateIcon(newTheme);
            
            // Re-render progress charts to match text styling of the new theme
            if (window.TrackerModule && document.getElementById('tracker-page').classList.contains('active')) {
                window.TrackerModule.initCharts();
            }
        });
    },

    updateIcon(theme) {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (!toggleBtn) return;
        toggleBtn.innerHTML = theme === 'dark' ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
    }
};

// Authentication Modal Orchestrator
const AuthModal = {
    init() {
        const overlay = document.getElementById('auth-modal-overlay');
        const closeBtn = document.getElementById('auth-modal-close-btn');
        if (!overlay || !closeBtn) return;

        closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });

        this.setupTabs();
        this.setupForms();
    },

    showLogin() {
        const overlay = document.getElementById('auth-modal-overlay');
        const tabLogin = document.getElementById('tab-login-btn');
        const tabSignup = document.getElementById('tab-signup-btn');
        const formLogin = document.getElementById('login-modal-form');
        const formSignup = document.getElementById('signup-modal-form');

        if (overlay && tabLogin && formLogin) {
            overlay.classList.add('active');
            tabLogin.classList.add('active');
            if (tabSignup) tabSignup.classList.remove('active');
            formLogin.style.display = 'flex';
            if (formSignup) formSignup.style.display = 'none';
            document.getElementById('modal-title-text').innerText = "FitGenie Login";
        }
    },

    showSignup() {
        const overlay = document.getElementById('auth-modal-overlay');
        const tabLogin = document.getElementById('tab-login-btn');
        const tabSignup = document.getElementById('tab-signup-btn');
        const formLogin = document.getElementById('login-modal-form');
        const formSignup = document.getElementById('signup-modal-form');

        if (overlay && tabSignup && formSignup) {
            overlay.classList.add('active');
            tabSignup.classList.add('active');
            if (tabLogin) tabLogin.classList.remove('active');
            formSignup.style.display = 'flex';
            if (formLogin) formLogin.style.display = 'none';
            document.getElementById('modal-title-text').innerText = "Create Account";
        }
    },

    setupTabs() {
        const tabLogin = document.getElementById('tab-login-btn');
        const tabSignup = document.getElementById('tab-signup-btn');
        const formLogin = document.getElementById('login-modal-form');
        const formSignup = document.getElementById('signup-modal-form');

        if (!tabLogin || !tabSignup || !formLogin || !formSignup) return;

        tabLogin.addEventListener('click', () => this.showLogin());
        tabSignup.addEventListener('click', () => this.showSignup());
    },

    setupForms() {
        const formLogin = document.getElementById('login-modal-form');
        const formSignup = document.getElementById('signup-modal-form');
        const overlay = document.getElementById('auth-modal-overlay');

        if (formLogin) {
            formLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const pass = document.getElementById('login-password').value;
                
                if (window.Auth) {
                    const res = window.Auth.login(email, pass);
                    if (res.success) overlay.classList.remove('active');
                }
            });
        }

        if (formSignup) {
            formSignup.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const pass = document.getElementById('signup-password').value;
                
                if (window.Auth) {
                    const res = window.Auth.register(name, email, pass);
                    if (res.success) overlay.classList.remove('active');
                }
            });
        }
    }
};

// Onboarding Submission Event & Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Sync onboarding fields
    AppState.loadState();

    // Start UI handlers
    Router.init();
    ThemeManager.init();
    AuthModal.init();

    // Handle initial routing based on login/profile status
    if (window.Auth && window.Auth.isLoggedIn()) {
        const initialHash = window.location.hash.substring(1);
        const validPages = ['dashboard-page', 'workout-page', 'diet-page', 'risk-page', 'tracker-page', 'report-page', 'profile-page'];
        if (validPages.includes(initialHash)) {
            Router.navigate(initialHash);
        } else {
            Router.navigate(AppState.isProfileCompleted ? 'dashboard-page' : 'profile-page');
        }
    } else {
        Router.navigate('landing-page');
    }

    // Binds for landing page triggers
    const startBtn = document.getElementById('hero-get-started-btn');
    const learnBtn = document.getElementById('hero-learn-more-btn');
    const ctaRedirect = document.getElementById('cta-onboard-redirect');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!window.Auth || !window.Auth.isLoggedIn()) {
                window.Toast.show("Please login or create an account to start!", "warning");
                AuthModal.showLogin();
            } else {
                Router.navigate(AppState.isProfileCompleted ? 'dashboard-page' : 'profile-page');
            }
        });
    }

    if (learnBtn) {
        learnBtn.addEventListener('click', () => {
            if (!window.Auth || !window.Auth.isLoggedIn()) {
                window.Toast.show("Please login to access profile onboarding!", "warning");
                AuthModal.showLogin();
            } else {
                Router.navigate('profile-page');
            }
        });
    }

    if (ctaRedirect) {
        ctaRedirect.addEventListener('click', () => {
            if (!window.Auth || !window.Auth.isLoggedIn()) {
                window.Toast.show("Please login to access profile onboarding!", "warning");
                AuthModal.showLogin();
            } else {
                Router.navigate('profile-page');
            }
        });
    }

    // Onboarding Form Submit
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check details
            const name = document.getElementById('pf-name').value;
            const age = parseInt(document.getElementById('pf-age').value);
            const height = parseFloat(document.getElementById('pf-height').value);
            const weight = parseFloat(document.getElementById('pf-weight').value);

            if (!name || isNaN(age) || isNaN(height) || isNaN(weight)) {
                window.Toast.show("Please complete all required information", "error");
                return;
            }

            // Bind values
            AppState.profile.name = name;
            AppState.profile.age = age;
            AppState.profile.height = height;
            AppState.profile.weight = weight;
            AppState.profile.activity = document.getElementById('pf-activity').value;
            AppState.profile.goal = document.getElementById('pf-goal').value;
            AppState.profile.dietary_pref = document.getElementById('pf-diet').value;
            AppState.profile.gender = document.querySelector('input[name="gender"]:checked').value;
            AppState.profile.budget = document.querySelector('input[name="budget"]:checked').value;

            // Submit Button loading animation
            const submitBtn = document.getElementById('profile-submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing AI Telemetry...`;
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(AppState.profile)
                });
                const resData = await response.json();

                if (resData.success) {
                    AppState.telemetry = {
                        bmi: resData.bmi,
                        bmr: resData.bmr,
                        maintenance_calories: resData.maintenance_calories,
                        goal_calories: resData.goal_calories,
                        protein_req: resData.protein_req,
                        water_req: resData.water_req,
                        fitness_score: resData.fitness_score
                    };

                    AppState.saveState();

                    // Pre-generate modules data
                    if (window.WorkoutModule) window.WorkoutModule.loadWorkout();
                    if (window.DietModule) window.DietModule.loadDiet();

                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        window.Toast.show("Telemetry calculated! Loading your dashboard...", "success");
                        Router.navigate('dashboard-page');
                    }, 800);
                } else {
                    window.Toast.show("Failed to process profile data. Please verify your fields.", "error");
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error("Profile calculation error:", err);
                
                // Offline Fallback Calculations
                const hM = AppState.profile.height / 100.0;
                const bmi = parseFloat((AppState.profile.weight / (hM * hM)).toFixed(1));
                const bmr = AppState.profile.gender === 'Male' ? 
                            (10 * AppState.profile.weight + 6.25 * AppState.profile.height - 5 * AppState.profile.age + 5) :
                            (10 * AppState.profile.weight + 6.25 * AppState.profile.height - 5 * AppState.profile.age - 161);
                
                const activityMultipliers = {
                    "Sedentary": 1.2,
                    "Light": 1.375,
                    "Active": 1.55,
                    "Extreme": 1.725
                };
                const multiplier = activityMultipliers[AppState.profile.activity] || 1.55;
                const maint = Math.round(bmr * multiplier);
                
                const gCal = AppState.profile.goal === 'Weight Loss' ? maint - 500 : (AppState.profile.goal === 'Muscle Gain' ? maint + 300 : maint);
                const prot = AppState.profile.goal === 'Weight Loss' || AppState.profile.goal === 'Muscle Gain' ? Math.round(AppState.profile.weight * 2.0) : Math.round(AppState.profile.weight * 1.6);
                const isWaterActive = ['Active', 'Extreme'].includes(AppState.profile.activity);
                const waterVal = (AppState.profile.weight * 0.033) + (isWaterActive ? 0.5 : 0);
                
                // Calculate Fitness Score offline parity
                let bmiScore = 30;
                if (bmi >= 18.5 && bmi <= 24.9) {
                    bmiScore = 30;
                } else if (bmi >= 25.0 && bmi <= 29.9) {
                    bmiScore = 22;
                } else {
                    bmiScore = 15;
                }
                const activityScores = {"Sedentary": 10, "Light": 20, "Active": 35, "Extreme": 40};
                const actScore = activityScores[AppState.profile.activity] || 30;
                const ageScore = (AppState.profile.age >= 18 && AppState.profile.age <= 25) ? 30 : 25;
                const fitnessScore = Math.min(bmiScore + actScore + ageScore, 100);

                AppState.telemetry = {
                    bmi: bmi,
                    bmr: Math.round(bmr),
                    maintenance_calories: maint,
                    goal_calories: gCal,
                    protein_req: prot,
                    water_req: parseFloat(waterVal.toFixed(1)),
                    fitness_score: fitnessScore
                };
                
                AppState.saveState();
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    window.Toast.show("Calculated locally (Offline mode). Loading dashboard...", "success");
                    Router.navigate('dashboard-page');
                }, 800);
            }
        });
    }
});

// Bind globally
window.AppState = AppState;
window.Router = Router;
window.AuthModal = AuthModal;
