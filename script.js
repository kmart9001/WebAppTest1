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

// Function to handle successful login (both Google and local)
async function handleLoginSuccess(usernameDisplay) {
    localLoginForm.classList.add('hidden');
    googleSignInDiv.classList.add('hidden');
    signOutBtn.classList.remove('hidden');
    todoForm.classList.remove('hidden');
    userInfo.innerText = `Welcome, ${usernameDisplay}!`;
    await loadTodos();
}

// Function to handle local login
function localLogin(username) {
    if (username.trim() === '') return;
    currentUser = `local_${username}`; // Prefix local users to avoid collision with Google IDs
    loginType = 'local';
    handleLoginSuccess(username);
}

// Function to handle sign out (both Google and local)
async function signOut() {
    if (loginType === 'google') {
        await firebaseSignOut(auth);
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
}

async function loadTodos() {
    todoList.innerHTML = ''; // Clear existing todos before loading
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
    todoInput = document.getElementById('todo-input');
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

    // Firebase Auth State Change Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user.uid;
            loginType = 'google';
            handleLoginSuccess(user.displayName || user.email);
        } else {
            // User is signed out
            currentUser = null;
            loginType = null;
            localLoginForm.classList.remove('hidden');
            googleSignInDiv.classList.remove('hidden');
            signOutBtn.classList.add('hidden');
            todoForm.classList.add('hidden');
            userInfo.innerText = '';
            todoList.innerHTML = '';
        }
    });

    // Initial state: hide todo form and sign out button
    todoForm.classList.add('hidden');
    signOutBtn.classList.add('hidden');

    // Handle Google Sign-In button click (if not using GSI's auto-render)
    // This is handled by the GSI script directly via data-callback="onGoogleSignIn"
});

// Make onGoogleSignIn globally accessible for the Google GSI script
window.onGoogleSignIn = (response) => {
    // Decode the ID token to get user information
    const id_token = response.credential;
    const provider = new GoogleAuthProvider();
    const credential = provider.credential(id_token);

    // Sign in with the credential from the Google ID token.
    signInWithPopup(auth, provider)
        .then((result) => {
            // This will trigger onAuthStateChanged
        })
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
        });
};

// Add jwt_decode library for Google Sign-In (no longer needed with Firebase SDK)
// Keeping a placeholder for now, but it's not used for Firebase auth
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