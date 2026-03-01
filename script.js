// Pomodoro Timer Application

// State Management
let timeLeft = 25 * 60; // Default to 25 minutes
let timerId = null;
let isRunning = false;
let currentSession = 'focus'; // 'focus' or 'break'
let sessionsCompleted = 0;

// Durations in minutes
let focusDuration = 25;
let shortBreakDuration = 5;
let longBreakDuration = 15;

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

// Progress Ring Calculation
function setProgress(percent) {
    const circumference = 2 * Math.PI * 90; // 90 is the radius
    const offset = circumference - (percent / 100) * circumference;
    ringProgress.style.strokeDashoffset = offset;
}

// Time Display Format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update Timer Display
function updateDisplay() {
    timeLeftEl.textContent = formatTime(timeLeft);
    document.title = `${formatTime(timeLeft)} - Pomodoro Timer`;
}

// Update Progress Ring
function updateProgress() {
    if (currentSession === 'focus') {
        const totalTime = focusDuration * 60;
        const percent = (timeLeft / totalTime) * 100;
        setProgress(percent);
    } else {
        const totalTime = getCurrentBreakDuration() * 60;
        const percent = (timeLeft / totalTime) * 100;
        setProgress(percent);
    }
}

// Get current break duration based on session type
function getCurrentBreakDuration() {
    if (currentSession === 'short') {
        return shortBreakDuration;
    } else if (currentSession === 'long') {
        return longBreakDuration;
    }
    return shortBreakDuration;
}

// Update UI
function updateUI() {
    updateDisplay();
    updateProgress();
    sessionTypeEl.textContent = currentSession.charAt(0).toUpperCase() + currentSession.slice(1) + ' Mode';
    sessionsCompletedEl.textContent = sessionsCompleted;

    // Update button text and style
    if (isRunning) {
        startBtn.textContent = 'Pause';
        startBtn.classList.remove('btn-primary');
        startBtn.classList.add('btn-secondary');
    } else {
        startBtn.textContent = 'Start';
        startBtn.classList.remove('btn-secondary');
        startBtn.classList.add('btn-primary');
    }

    // Add/remove break mode class
    if (currentSession === 'break') {
        body.classList.add('break-mode');
    } else {
        body.classList.remove('break-mode');
    }
}

// Start Timer
function startTimer() {
    if (isRunning) {
        // Pause timer
        clearInterval(timerId);
        isRunning = false;
    } else {
        // Start timer
        timerId = setInterval(() => {
            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(timerId);
                isRunning = false;
                handleTimerComplete();
                return;
            }

            updateUI();
        }, 1000);
        isRunning = true;
    }

    updateUI();
}

// Handle Timer Complete
function handleTimerComplete() {
    if (currentSession === 'focus') {
        sessionsCompleted++;
        // Switch to short break by default, long break after 4 sessions
        currentSession = sessionsCompleted % 4 === 0 ? 'long' : 'short';
        focusDurationInput.value = focusDuration;
    } else {
        // Switch back to focus mode
        currentSession = 'focus';
    }

    timeLeft = currentSession === 'break'
        ? getCurrentBreakDuration() * 60
        : focusDuration * 60;

    updateUI();
}

// Reset Timer
function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = focusDuration * 60;
    updateUI();
}

// Handle Settings Changes
function handleSettingsChange() {
    focusDuration = parseInt(focusDurationInput.value) || 25;
    shortBreakDuration = parseInt(shortBreakInput.value) || 5;
    longBreakDuration = parseInt(longBreakInput.value) || 15;

    // If timer is running, respect current session type duration
    if (currentSession === 'break') {
        timeLeft = getCurrentBreakDuration() * 60;
    } else {
        timeLeft = focusDuration * 60;
    }

    updateUI();
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

focusDurationInput.addEventListener('change', handleSettingsChange);
shortBreakInput.addEventListener('change', handleSettingsChange);
longBreakInput.addEventListener('change', handleSettingsChange);

// Initialize
updateUI();