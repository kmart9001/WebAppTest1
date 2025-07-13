let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const signOutBtn = document.getElementById('sign-out-btn');
    const userInfo = document.getElementById('user-info');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

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

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login(usernameInput.value);
    });

    signOutBtn.addEventListener('click', signOut);

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTodo(todoInput.value);
        todoInput.value = '';
        saveTodos();
    });

    function login(username) {
        if (username.trim() === '') return;
        currentUser = username;
        loginForm.classList.add('hidden');
        signOutBtn.classList.remove('hidden');
        todoForm.classList.remove('hidden');
        userInfo.innerText = `Welcome, ${currentUser}!`;
        loadTodos();
    }

    function signOut() {
        currentUser = null;
        loginForm.classList.remove('hidden');
        signOutBtn.classList.add('hidden');
        todoForm.classList.add('hidden');
        userInfo.innerText = '';
        todoList.innerHTML = '';
    }

    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem(currentUser)) || [];
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
});