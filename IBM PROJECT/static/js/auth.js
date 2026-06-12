// Global Toast Alerts System
const Toast = {
    show(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position = 'fixed';
            container.style.top = '80px';
            container.style.right = '20px';
            container.style.zIndex = '99999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-alert ${type}`;
        
        let icon = '<i class="fa-solid fa-circle-check"></i>';
        if (type === 'error') {
            icon = '<i class="fa-solid fa-circle-xmark"></i>';
        } else if (type === 'warning') {
            icon = '<i class="fa-solid fa-circle-exclamation"></i>';
        }

        toast.innerHTML = `
            ${icon}
            <span>${message}</span>
        `;
        
        container.appendChild(toast);

        // Slide out animations
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
};
window.Toast = Toast;

// Strict Session & Login Authentication Controller
const Auth = {
    USER_KEY: 'fitgenie_user_session',
    REGISTERED_USER_KEY: 'fitgenie_registered_user',

    init() {
        this.syncSessionUI();
        this.setupSecurityRedirects();
    },

    register(name, email, password) {
        if (!name || !email || !password) {
            window.Toast.show("Please complete all required information", "error");
            return { success: false };
        }
        if (password.length < 6) {
            window.Toast.show("Password must be at least 6 characters", "error");
            return { success: false };
        }

        const user = { name, email, password };
        localStorage.setItem(this.REGISTERED_USER_KEY, JSON.stringify(user));

        this.createSession(user);
        window.Toast.show("Account created successfully! Welcome to FitGenie.", "success");
        return { success: true };
    },

    login(email, password) {
        if (!email || !password) {
            window.Toast.show("Please complete all required information", "error");
            return { success: false };
        }

        const registered = localStorage.getItem(this.REGISTERED_USER_KEY);
        if (!registered) {
            window.Toast.show("Incorrect email or password", "error");
            return { success: false };
        }

        const userObj = JSON.parse(registered);
        if (userObj.email.toLowerCase() === email.toLowerCase() && userObj.password === password) {
            this.createSession(userObj);
            window.Toast.show("Logged in successfully! Welcome back.", "success");
            return { success: true };
        } else {
            window.Toast.show("Incorrect email or password", "error");
            return { success: false };
        }
    },

    createSession(user) {
        const session = {
            name: user.name,
            email: user.email,
            isLoggedIn: true,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(session));
        this.syncSessionUI();
        
        if (window.Router) {
            if (window.AppState && window.AppState.isProfileCompleted) {
                window.Router.navigate('dashboard-page');
            } else {
                window.Router.navigate('profile-page');
            }
        }
    },

    logout() {
        localStorage.removeItem(this.USER_KEY);
        this.syncSessionUI();
        window.Toast.show("Logged out successfully. See you soon!", "success");
        
        if (window.Router) {
            window.Router.navigate('landing-page');
        }
    },

    getCurrentUser() {
        const data = localStorage.getItem(this.USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    isLoggedIn() {
        const user = this.getCurrentUser();
        return user !== null && user.isLoggedIn === true;
    },

    syncSessionUI() {
        if (this.isLoggedIn()) {
            document.body.classList.add('logged-in');
            document.body.classList.remove('logged-out');
            
            const user = this.getCurrentUser();
            const nameInput = document.getElementById('pf-name');
            if (nameInput && !nameInput.value) {
                nameInput.value = user.name;
            }
        } else {
            document.body.classList.add('logged-out');
            document.body.classList.remove('logged-in');
        }
    },

    setupSecurityRedirects() {
        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash.substring(1);
            const protectedRoutes = ['dashboard-page', 'workout-page', 'diet-page', 'risk-page', 'tracker-page', 'report-page', 'profile-page'];
            
            if (protectedRoutes.includes(currentHash) && !this.isLoggedIn()) {
                window.location.hash = 'landing-page';
                window.Toast.show("Login required before access", "error");
                
                if (window.Router) {
                    window.Router.navigate('landing-page');
                }
                if (window.AuthModal) {
                    window.AuthModal.showLogin();
                }
            }
        });

        const initialHash = window.location.hash.substring(1);
        const protectedRoutes = ['dashboard-page', 'workout-page', 'diet-page', 'risk-page', 'tracker-page', 'report-page', 'profile-page'];
        
        if (protectedRoutes.includes(initialHash) && !this.isLoggedIn()) {
            window.location.hash = 'landing-page';
            setTimeout(() => {
                window.Toast.show("Login required before access", "error");
                if (window.AuthModal) window.AuthModal.showLogin();
            }, 300);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());
window.Auth = Auth;
