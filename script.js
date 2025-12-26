const API_BASE_URL = 'http://localhost:3000/api';
let currentUser = null;
let currentFilter = 'all';

// DOM Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        loadUserFromToken();
    }
});

// Auth Functions
function showRegister() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

function showLogin() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
}

async function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showApp();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showApp();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    showAuth();
}

function loadUserFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = { id: payload.userId, username: payload.username };
        showApp();
    }
}

function showApp() {
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.username}!`;
    loadTasks();
    loadStats();
}

function showAuth() {
    appSection.style.display = 'none';
    authSection.style.display = 'block';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    showLogin();
}

// Task Functions
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const tasks = await response.json();
            renderTasks(tasks);
        }
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }
}

async function addTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const priority = parseInt(document.getElementById('task-priority').value);
    const status = document.getElementById('task-status').value;

    if (!title.trim()) {
        alert('Please enter a task title');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, description, priority, status })
        });

        if (response.ok) {
            document.getElementById('task-title').value = '';
            document.getElementById('task-description').value = '';
            loadTasks();
            loadStats();
        }
    } catch (error) {
        console.error('Failed to add task:', error);
    }
}

async function updateTaskStatus(taskId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadTasks();
            loadStats();
        }
    } catch (error) {
        console.error('Failed to update task:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            loadTasks();
            loadStats();
        }
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            document.getElementById('total-tasks').textContent = stats.totalTasks;
            document.getElementById('completed-tasks').textContent = stats.completedTasks;
            document.getElementById('pending-tasks').textContent = stats.pendingTasks;
            document.getElementById('inprogress-tasks').textContent = stats.inProgressTasks;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function filterTasks(status) {
    currentFilter = status;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter and render tasks
    loadTasks();
}

function renderTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    // Apply filter
    const filteredTasks = currentFilter === 'all' 
        ? tasks 
        : tasks.filter(task => task.status === currentFilter);

    filteredTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item priority-${task.priority} ${task.status === 'completed' ? 'completed' : ''}`;
        
        const priorityLabels = {
            1: 'High',
            2: 'Medium',
            3: 'Low'
        };
        
        const statusLabels = {
            'pending': 'Pending',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        
        const statusColors = {
            'pending': 'status-pending',
            'in-progress': 'status-in-progress',
            'completed': 'status-completed'
        };

        taskItem.innerHTML = `
            <div class="task-content">
                <div class="task-title">
                    ${task.title}
                    <span class="status-badge ${statusColors[task.status]}">
                        ${statusLabels[task.status]}
                    </span>
                    <span class="priority-badge">
                        Priority: ${priorityLabels[task.priority]}
                    </span>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    <span>Created: ${new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="task-actions">
                ${task.status !== 'completed' ? `
                    <button class="complete-btn" onclick="updateTaskStatus('${task._id}', 'completed')">
                        <i class="fas fa-check"></i> Complete
                    </button>
                ` : ''}
                ${task.status === 'pending' ? `
                    <button class="edit-btn" onclick="updateTaskStatus('${task._id}', 'in-progress')">
                        <i class="fas fa-play"></i> Start
                    </button>
                ` : ''}
                ${task.status === 'in-progress' ? `
                    <button class="edit-btn" onclick="updateTaskStatus('${task._id}', 'pending')">
                        <i class="fas fa-pause"></i> Pause
                    </button>
                ` : ''}
                <button class="delete-btn" onclick="deleteTask('${task._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
}