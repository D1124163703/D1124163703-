// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');
const emptyState = document.querySelector('.empty-state');

// State
let tasks = [];
let currentFilter = 'all';

// Local Storage Keys
const STORAGE_KEY = 'todoList_tasks';

// Initialize app
function init() {
    loadTasksFromLocalStorage();
    renderTasks();
    attachEventListeners();
}

// Attach Event Listeners
function attachEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
}

// Add Task
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };

    tasks.push(task);
    saveTasksToLocalStorage();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToLocalStorage();
    renderTasks();
}

// Toggle Task Completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// Clear Completed Tasks
function clearCompleted() {
    if (confirm('Are you sure you want to delete all completed tasks?')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// Clear All Tasks
function clearAll() {
    if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone!')) {
        tasks = [];
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// Render Tasks
function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="task-date">${task.createdAt}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;

        taskList.appendChild(li);
    });

    updateStats();
}

// Update Statistics
function updateStats() {
    const completedCount = tasks.filter(task => task.completed).length;
    totalTasksSpan.textContent = tasks.length;
    completedTasksSpan.textContent = completedCount;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Local Storage Functions
function saveTasksToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            tasks = [];
        }
    }
}

// Start the app
init();