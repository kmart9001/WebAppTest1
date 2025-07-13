let currentUser = null;
let loginType = null; // 'google' or 'local'

// Declare global variables for DOM elements
let localLoginForm;
let usernameInput;
let todoForm;
let todoInput;
let todoList;
let signOutBtn;
let userInfo;
let darkModeToggle;
let googleSignInDiv;

// Google Sign-In callback
function onGoogleSignIn(response) {
    const profile = jwt_decode(response.credential); // Assuming jwt_decode is available or will be added
    currentUser = profile.sub; // Google User ID
    loginType = 'google';
    localStorage.setItem('lastLoggedInUser', currentUser);
    localStorage.setItem('lastLoginType', loginType);
    handleLoginSuccess(profile.name);
}

// Function to handle successful login (both Google and local)
function handleLoginSuccess(usernameDisplay) {
    localLoginForm.classList.add('hidden');
    googleSignInDiv.classList.add('hidden');
    signOutBtn.classList.remove('hidden');
    todoForm.classList.remove('hidden');
    userInfo.innerText = `Welcome, ${usernameDisplay}!`;
    loadTodos();
}

// Function to handle local login
function localLogin(username) {
    if (username.trim() === '') return;
    currentUser = `local_${username}`; // Prefix local users to avoid collision with Google IDs
    loginType = 'local';
    localStorage.setItem('lastLoggedInUser', currentUser);
    localStorage.setItem('lastLoginType', loginType);
    handleLoginSuccess(username);
}

// Function to handle sign out (both Google and local)
function signOut() {
    if (loginType === 'google') {
        // Google Sign-Out
        google.accounts.id.disableAutoSelect(); // Disable auto-login for next time
        // No explicit sign-out needed for GSI, just clear session
    }
    // Clear local session
    currentUser = null;
    loginType = null;

    localLoginForm.classList.remove('hidden');
    googleSignInDiv.classList.remove('hidden');
    signOutBtn.classList.add('hidden');
    todoForm.classList.add('hidden');
    userInfo.innerText = '';
    todoList.innerHTML = ''; // Clear displayed todos
    localStorage.removeItem('lastLoggedInUser'); // Clear last logged in user
    localStorage.removeItem('lastLoginType'); // Clear last login type
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem(currentUser)) || [];
    todoList.innerHTML = ''; // Clear existing todos before loading
    todos.forEach(addTodo);
}

function saveTodos() {
    const todos = [];
    document.querySelectorAll('#todo-list li').forEach(li => {
        todos.push(li.firstChild.textContent);
    });
    localStorage.setItem(currentUser, JSON.stringify(todos));
}

function addTodo(task) {
    console.log("addTodo function called with task:", task);
    if (task.trim() === '') return;

    const li = document.createElement('li');
    li.textContent = task;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
        todoList.removeChild(li);
        saveTodos();
    });

    li.appendChild(deleteBtn);
    todoList.appendChild(li);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded and DOMContentLoaded event fired.");
    // Assign DOM elements to global variables
    localLoginForm = document.getElementById('local-login-form');
    usernameInput = document.getElementById('username-input');
    todoForm = document.getElementById('todo-form');
    todoInput = document.getElementById('todo-input'); // Corrected assignment
    console.log("Value of todoInput after assignment in DOMContentLoaded:", todoInput);
    todoList = document.getElementById('todo-list');
    signOutBtn = document.getElementById('sign-out-btn');
    userInfo = document.getElementById('user-info');
    darkModeToggle = document.getElementById('dark-mode-toggle');
    googleSignInDiv = document.querySelector('.g_id_signin');

    // Dark Mode Logic (existing)
    const enableDarkMode = localStorage.getItem('darkMode') === 'enabled';
    if (enableDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.textContent = '☀️';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.textContent = '🌙';
        }
    });

    // Event listener for local login form
    localLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localLogin(usernameInput.value);
    });

    signOutBtn.addEventListener('click', signOut);

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("Todo form submitted.");
        const taskValue = todoInput.value;
        console.log("Task value:", taskValue);
        addTodo(taskValue);
        todoInput.value = '';
        saveTodos();
    });

    // Initial state: hide todo form and sign out button
    todoForm.classList.add('hidden');
    signOutBtn.classList.add('hidden');

    // Check for previously logged in user (local or Google)
    const lastLoggedInUser = localStorage.getItem('lastLoggedInUser');
    const lastLoginType = localStorage.getItem('lastLoginType');

    if (lastLoggedInUser && lastLoginType) {
        currentUser = lastLoggedInUser;
        loginType = lastLoginType;

        // Attempt to re-login based on type
        if (loginType === 'local') {
            handleLoginSuccess(currentUser.replace('local_', '')); // Remove prefix for display
        } else if (loginType === 'google') {
            // For Google, we rely on GSI's auto-login or user re-clicking
            // We can't programmatically re-authenticate Google here without user interaction
            // So, we'll just show the login options again.
            // A more robust solution would involve server-side token validation.
            // For this client-side app, we'll just show login forms.
            console.log("Google user was previously logged in, please re-authenticate.");
        }
    }
});

// Make onGoogleSignIn globally accessible for the Google GSI script
window.onGoogleSignIn = onGoogleSignIn;

// Add jwt_decode library for Google Sign-In
// This is a simplified version for client-side use.
// In a real app, you'd use a proper library or server-side validation.
function jwt_decode(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT:", e);
        return {};
    }
}