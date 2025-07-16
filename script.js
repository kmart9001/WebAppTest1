import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvwgGT9YhOcVK3cIjVB9CsuILJP8lNYM8",
  authDomain: "webapptest1-todolist.firebaseapp.com",
  projectId: "webapptest1-todolist",
  storageBucket: "webapptest1-todolist.firebasestorage.app",
  messagingSenderId: "208219480425",
  appId: "1:208219480425:web:3aecb437ee572f4d915df8",
  measurementId: "G-JLYTYMZ7TR"
};

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

let currentUser = null;
let loginType = null; // 'google' or 'local'

// Declare DOM Elements (will be assigned in DOMContentLoaded)
let loginButtons;
let localLoginForm;
let usernameInput;
let todoForm;
let todoInput;
let todoList;
let signOutBtn;
let userInfo;
let darkModeToggle;
let googleLoginButton;

// Function to handle successful login (both Google and local)
async function handleLoginSuccess(usernameDisplay) {
    userInfo.innerText = `Welcome, ${usernameDisplay}!`;
    updateUIVisibility(); // Ensure UI is updated consistently
    await loadTodos();
}

// Function to handle local login
async function localLogin(username) {
    if (username.trim() === '') return;

    // Easter egg: Redirect for 'innova' username
    if (username.toLowerCase() === 'innova') {
        window.location.href = 'https://proshop.innovadisc.com/factory-second/';
        return; // Stop further execution of localLogin
    }

    // For simplicity, using a placeholder password. In a real app, you'd have a password input.
    const password = "password123"; // Placeholder password
    const email = `${username}@example.com`; // Using username as part of email

    try {
        console.log("localLogin: Attempting signInWithEmailAndPassword for email:", email);
        // Try to sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user.uid;
        loginType = 'email';
        console.log("localLogin: Signed in with email. currentUser:", currentUser);
        handleLoginSuccess(username);
    } catch (error) {
        console.log("localLogin: signInWithEmailAndPassword failed. Error code:", error.code);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-login-credentials') {
            console.log("localLogin: Attempting createUserWithEmailAndPassword for email:", email);
            // If user not found or wrong password, try to create a new user
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                currentUser = userCredential.user.uid;
                loginType = 'email';
                console.log("localLogin: Created new user with email. currentUser:", currentUser);
                handleLoginSuccess(username);
            } catch (createError) {
                console.error("Error creating user:", createError);
                alert(`Error: ${createError.message}`);
            }
        } else {
            console.error("Error signing in:", error);
            alert(`Error: ${error.message}`);
        }
    }
}

// Function to handle sign out
async function signOut() {
    await firebaseSignOut(auth);
    // onAuthStateChanged listener will handle UI update
}

function updateUIVisibility() {
    try {
        console.log("updateUIVisibility called. currentUser:", currentUser);
        if (currentUser) {
            loginButtons.classList.add('hidden');
            signOutBtn.classList.remove('hidden');
            todoForm.classList.remove('hidden');
        } else {
            loginButtons.classList.remove('hidden');
            signOutBtn.classList.add('hidden');
            todoForm.classList.add('hidden');
            userInfo.innerText = '';
            todoList.innerHTML = '';
        }
    } catch (error) {
        console.error("updateUIVisibility error:", error);
    }
}

async function loadTodos() {
    todoList.innerHTML = '';
    if (currentUser) {
        console.log("loadTodos: Attempting to load for currentUser:", currentUser);
        const docRef = doc(db, "todos", currentUser);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const todos = docSnap.data().items || [];
            console.log("loadTodos: Loaded todos:", todos);
            todos.forEach(addTodo);
        } else {
            console.log("loadTodos: No document found for currentUser:", currentUser);
        }
    }
}

async function saveTodos() {
    if (currentUser) {
        const todos = [];
        document.querySelectorAll('#todo-list li').forEach(li => {
            todos.push(li.firstChild.textContent);
        });
        const docRef = doc(db, "todos", currentUser);
        console.log("saveTodos: Attempting to save for currentUser:", currentUser, "todos:", todos);
        await setDoc(docRef, { items: todos });
        console.log("saveTodos: Save operation completed.");
    } else {
        console.log("saveTodos: No currentUser, skipping save.");
    }
}

function addTodo(task) {
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
    // Assign DOM elements
    loginButtons = document.getElementById('login-buttons');
    localLoginForm = document.getElementById('local-login-form');
    usernameInput = document.getElementById('username-input');
    todoForm = document.getElementById('todo-form');
    todoInput = document.getElementById('todo-input');
    todoList = document.getElementById('todo-list');
    signOutBtn = document.getElementById('sign-out-btn');
    userInfo = document.getElementById('user-info');
    darkModeToggle = document.getElementById('dark-mode-toggle');
    googleLoginButton = document.getElementById('google-login-button');

    // Dark Mode Logic
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

    // Event Listeners
    localLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localLogin(usernameInput.value);
    });

    signOutBtn.addEventListener('click', signOut);

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTodo(todoInput.value);
        todoInput.value = '';
        saveTodos();
    });

    googleLoginButton.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).catch((error) => {
            console.error("Google Sign-In Error:", error);
        });
    });

    // Firebase Auth State Change Listener
    onAuthStateChanged(auth, (user) => {
        try {
            console.log("onAuthStateChanged: user object:", user);
            if (user) {
                currentUser = user.uid;
                loginType = user.providerData[0].providerId === 'google.com' ? 'google' : 'email';
                console.log("onAuthStateChanged: User logged in. currentUser:", currentUser, "loginType:", loginType);
                handleLoginSuccess(user.displayName || user.email);
            } else {
                // This will be triggered on sign-out
                console.log("onAuthStateChanged: User logged out.");
                currentUser = null;
                loginType = null;
                updateUIVisibility();
            }
        } catch (error) {
            console.error("onAuthStateChanged error:", error);
        }
    });

    // Initial UI state
    updateUIVisibility();
});