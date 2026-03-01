// Save state to localStorage
function saveState() {
    const state = {
        timeLeft,
        isRunning,
        currentSession,
        sessionsCompleted,
        focusDuration,
        shortBreakDuration,
        longBreakDuration
    };
    localStorage.setItem('pomodoroState', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('pomodoroState');
    if (saved) {
        const state = JSON.parse(saved);
        timeLeft = state.timeLeft;
        isRunning = state.isRunning;
        currentSession = state.currentSession;
        sessionsCompleted = state.sessionsCompleted;
        focusDuration = state.focusDuration || 25;
        shortBreakDuration = state.shortBreakDuration || 5;
        longBreakDuration = state.longBreakDuration || 15;
    }
}

// Update settings inputs from current durations
function updateSettingsInputs() {
    focusDurationInput.value = focusDuration;
    shortBreakInput.value = shortBreakDuration;
    longBreakInput.value = longBreakDuration;
}

// Save settings
function saveSettings() {
    localStorage.setItem('pomodoroSettings', JSON.stringify({
        focusDuration,
        shortBreakDuration,
        longBreakDuration
    }));
}

// Load settings
function loadSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        focusDuration = settings.focusDuration || 25;
        shortBreakDuration = settings.shortBreakDuration || 5;
        longBreakDuration = settings.longBreakDuration || 15;
    }
}

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

// Initialize timer state
let timeLeft = focusDuration * 60;
let timerId;
let isRunning = false;

// Load saved state
loadSettings();
loadState();

// Set initial timeLeft based on current session
if (currentSession === 'short') {
    timeLeft = shortBreakDuration * 60;
} else if (currentSession === 'long') {
    timeLeft = longBreakDuration * 60;
} else {
    timeLeft = focusDuration * 60;
}

// Progress Ring Calculation
const RING_RADIUS = 90;
function setProgress(percent) {
    const circumference = 2 * Math.PI * RING_RADIUS;
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
        saveState(); // Save state when pausing
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
    }

    // Determine next session (reset tracking for next long break cycle)
    if (currentSession === 'focus') {
        // After completing focus session, track to determine break type
        // Use modulo to determine if it's long or short break
        const breakIndex = sessionsCompleted % 4;
        currentSession = breakIndex === 3 ? 'long' : 'short';
    } else {
        // Switch back to focus mode
        currentSession = 'focus';
        sessionsCompleted = 0; // Reset counter for fresh cycle
    }

    timeLeft = currentSession === 'focus'
        ? focusDuration * 60
        : (currentSession === 'long' ? longBreakDuration : shortBreakDuration) * 60;

    saveState();
    updateUI();
}

// Reset Timer
function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = focusDuration * 60;
    saveState(); // Save restored state
    updateUI();
}

// Handle Settings Changes
function handleSettingsChange() {
    focusDuration = parseInt(focusDurationInput.value) || 25;
    shortBreakDuration = parseInt(shortBreakInput.value) || 5;
    longBreakDuration = parseInt(longBreakInput.value) || 15;

    saveSettings(); // Save settings

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