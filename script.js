import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let loginType = null; // 'google' or 'local'

console.log("Script loaded. Initial currentUser:", currentUser, "loginType:", loginType);

// DOM Elements
const loginButtons = document.getElementById('login-buttons');
const localLoginForm = document.getElementById('local-login-form');
const usernameInput = document.getElementById('username-input');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const signOutBtn = document.getElementById('sign-out-btn');
const userInfo = document.getElementById('user-info');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const googleLoginButton = document.getElementById('google-login-button');

// Function to handle successful login (both Google and local)
async function handleLoginSuccess(usernameDisplay) {
    console.log("handleLoginSuccess called. currentUser:", currentUser, "loginType:", loginType);
    userInfo.innerText = `Welcome, ${usernameDisplay}!`;
    updateUIVisibility(); // Ensure UI is updated consistently
    await loadTodos();
}

// Function to handle local login
function localLogin(username) {
    console.log("localLogin called with username:", username);
    if (username.trim() === '') return;

    // Easter egg: Redirect for 'innova' username
    if (username.toLowerCase() === 'innova') {
        window.location.href = 'https://proshop.innovadisc.com/factory-second/';
        return; // Stop further execution of localLogin
    }

    currentUser = `local_${username}`;
    loginType = 'local';
    handleLoginSuccess(username);
}

// Function to handle sign out
async function signOut() {
    console.log("signOut called. currentUser before signOut:", currentUser, "loginType:", loginType);
    if (loginType === 'google') {
        await firebaseSignOut(auth);
    } else {
        // For local sign out, we just reset the state
        currentUser = null;
        loginType = null;
        updateUIVisibility();
    }
    console.log("signOut finished. currentUser after signOut:", currentUser, "loginType:", loginType);
}

function updateUIVisibility() {
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
}

async function loadTodos() {
    todoList.innerHTML = '';
    if (currentUser) {
        const docRef = doc(db, "todos", currentUser);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const todos = docSnap.data().items || [];
            todos.forEach(addTodo);
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
        await setDoc(docRef, { items: todos });
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
        if (user) {
            currentUser = user.uid;
            loginType = 'google';
            handleLoginSuccess(user.displayName || user.email);
        } else {
            // This will be triggered on sign-out
            currentUser = null;
            loginType = null;
            updateUIVisibility();
        }
    });

    // Initial UI state
    updateUIVisibility();
});