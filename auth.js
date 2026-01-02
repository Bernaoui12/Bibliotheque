// Stockage des utilisateurs dans localStorage
const USERS_KEY = 'bibliotheca_users';
const CURRENT_USER_KEY = 'bibliotheca_current_user';

// Initialiser les utilisateurs par défaut si nécessaire
function initUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
        const defaultUsers = [
            { username: 'admin', password: 'admin123' }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
}

// Obtenir tous les utilisateurs
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// Enregistrer un nouvel utilisateur
function registerUser(username, password) {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'Ce nom d\'utilisateur existe déjà' };
    }
    users.push({ username, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, message: 'Inscription réussie !' };
}

// Vérifier les identifiants
function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username: user.username }));
        return { success: true };
    }
    return { success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' };
}

// Vérifier si un utilisateur est connecté
function isAuthenticated() {
    return localStorage.getItem(CURRENT_USER_KEY) !== null;
}

// Obtenir l'utilisateur actuel
function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Déconnexion
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
}

// Initialiser
initUsers();

// Gestion du formulaire de connexion
if (document.getElementById('loginFormElement')) {
    document.getElementById('loginFormElement').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        
        const result = loginUser(username, password);
        if (result.success) {
            window.location.href = 'index.html';
        } else {
            errorDiv.textContent = result.message;
            errorDiv.classList.remove('d-none');
        }
    });
}

// Gestion du formulaire d'inscription
if (document.getElementById('registerFormElement')) {
    document.getElementById('registerFormElement').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const errorDiv = document.getElementById('registerError');
        const successDiv = document.getElementById('registerSuccess');
        
        errorDiv.classList.add('d-none');
        successDiv.classList.add('d-none');
        
        if (password !== passwordConfirm) {
            errorDiv.textContent = 'Les mots de passe ne correspondent pas';
            errorDiv.classList.remove('d-none');
            return;
        }
        
        if (password.length < 6) {
            errorDiv.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
            errorDiv.classList.remove('d-none');
            return;
        }
        
        const result = registerUser(username, password);
        if (result.success) {
            successDiv.textContent = result.message;
            successDiv.classList.remove('d-none');
            setTimeout(() => {
                document.getElementById('showLogin').click();
            }, 1500);
        } else {
            errorDiv.textContent = result.message;
            errorDiv.classList.remove('d-none');
        }
    });
}

// Basculer entre connexion et inscription
if (document.getElementById('showRegister')) {
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.add('d-none');
        document.getElementById('registerForm').classList.remove('d-none');
    });
}

if (document.getElementById('showLogin')) {
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').classList.add('d-none');
        document.getElementById('loginForm').classList.remove('d-none');
    });
}