// Initialize default durations (Global scope)
let focusDuration = 25;
let shortBreakDuration = 5;
let longBreakDuration = 15;
let currentSession = 'focus';
let sessionsCompleted = 0;
let timeLeft = focusDuration * 60;
let timerId = null;
let isRunning = false;

// DOM Elements
const timeLeftEl = document.getElementById('time-left');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const sessionTypeEl = document.getElementById('session-type');
const sessionsCompletedEl = document.getElementById('sessions-completed');
const focusDurationInput = document.getElementById('focus-duration');
const shortBreakInput = document.getElementById('short-break');
const longBreakInput = document.getElementById('long-break');
const ringProgress = document.querySelector('.ring-progress');
const body = document.body;

// Load stored settings/state
function loadSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        focusDuration = parseInt(settings.focusDuration) || 25;
        shortBreakDuration = parseInt(settings.shortBreakDuration) || 5;
        longBreakDuration = parseInt(settings.longBreakDuration) || 15;
    }
}

function loadState() {
    const saved = localStorage.getItem('pomodoroState');
    if (saved) {
        const state = JSON.parse(saved);
        timeLeft = state.timeLeft;
        isRunning = state.isRunning;
        currentSession = state.currentSession;
        sessionsCompleted = state.sessionsCompleted;
    }
}

function saveSettings() {
    localStorage.setItem('pomodoroSettings', JSON.stringify({
        focusDuration, shortBreakDuration, longBreakDuration
    }));
}

function saveState() {
    localStorage.setItem('pomodoroState', JSON.stringify({
        timeLeft, isRunning, currentSession, sessionsCompleted
    }));
}

// Logic
function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timeLeftEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.title = `${timeLeftEl.textContent} - Pomodoro`;
}

function updateUI() {
    updateDisplay();
    sessionTypeEl.textContent = currentSession.charAt(0).toUpperCase() + currentSession.slice(1) + ' Mode';
    sessionsCompletedEl.textContent = sessionsCompleted;
    startBtn.textContent = isRunning ? 'Pause' : 'Start';
    
    // Progress Ring
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const total = currentSession === 'focus' ? focusDuration * 60 : (currentSession === 'long' ? longBreakDuration : shortBreakDuration) * 60;
    const offset = circumference - (timeLeft / total) * circumference;
    ringProgress.style.strokeDasharray = `${circumference} ${circumference}`;
    ringProgress.style.strokeDashoffset = offset;
}

function startTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
    } else {
        isRunning = true;
        timerId = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerId);
                isRunning = false;
                handleComplete();
            }
            updateUI();
            saveState();
        }, 1000);
    }
    updateUI();
    saveState();
}

function handleComplete() {
    if (currentSession === 'focus') {
        sessionsCompleted++;
        const breakIndex = sessionsCompleted % 4;
        currentSession = (breakIndex === 0) ? 'long' : 'short';
    } else {
        currentSession = 'focus';
    }
    
    timeLeft = currentSession === 'focus' ? focusDuration * 60 : (currentSession === 'long' ? longBreakDuration : shortBreakDuration) * 60;
    updateUI();
    saveState();
    
    if (Notification.permission === 'granted') {
        new Notification('Session Complete!', { body: `Time for a ${currentSession}!` });
    }
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = focusDuration * 60;
    currentSession = 'focus';
    updateUI();
    saveState();
}

function handleSettings() {
    focusDuration = parseInt(focusDurationInput.value) || 25;
    shortBreakDuration = parseInt(shortBreakInput.value) || 5;
    longBreakDuration = parseInt(longBreakInput.value) || 15;
    saveSettings();
    if (!isRunning) {
        timeLeft = focusDuration * 60;
        updateUI();
    }
}

// Events
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
focusDurationInput.addEventListener('change', handleSettings);
shortBreakInput.addEventListener('change', handleSettings);
longBreakInput.addEventListener('change', handleSettings);

// Boot
loadSettings();
loadState();
updateUI();
