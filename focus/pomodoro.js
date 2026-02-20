const API_URL = 'https://api-dashboard-production-fc05.up.railway.app';

document.addEventListener('DOMContentLoaded', () => {
    let currentState = null;
    let timerInterval = null;
    let expectations = [];

    // DOM Elements
    const startForm = document.getElementById('startForm');
    const activePomodoro = document.getElementById('activePomodoro');
    const timeDisplay = document.getElementById('time');
    const modeDisplay = document.getElementById('mode');
    const currentFocusDisplay = document.getElementById('currentFocus');
    const todayPomodorosDiv = document.getElementById('todayPomodoros');

    // Start Form
    const startPomodoroBtn = document.getElementById('startPomodoroBtn');
    const addExpectationBtn = document.getElementById('addExpectationBtn');
    const expectationsList = document.getElementById('expectationsList');

    // Active Controls
    const switchBtn = document.getElementById('switchBtn');
    const changeFocusBtn = document.getElementById('changeFocusBtn');
    const endBtn = document.getElementById('endBtn');

    // Change Focus Form
    const changeFocusForm = document.getElementById('changeFocusForm');
    const submitFocusBtn = document.getElementById('submitFocusBtn');
    const cancelFocusBtn = document.getElementById('cancelFocusBtn');

    // Initialize
    checkCurrentPomodoro();
    loadTodayPomodoros();

    // Add Expectation
    addExpectationBtn?.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'expectation-item';
    div.innerHTML = `
        <input type="text" placeholder="ref_type" class="exp-type">
        <input type="number" placeholder="ref_id" class="exp-id">
        <input type="number" placeholder="weight" value="1" class="exp-weight">
        <button class="btn-small remove-exp">×</button>
    `;
    div.querySelector('.remove-exp').addEventListener('click', () => div.remove());
    expectationsList.appendChild(div);
});

// Start Pomodoro
startPomodoroBtn?.addEventListener('click', async () => {
    const focusRefType = document.getElementById('focusRefType').value;
    const focusRefId = parseInt(document.getElementById('focusRefId').value);

    // Collect expectations
    const expItems = expectationsList.querySelectorAll('.expectation-item');
    expectations = Array.from(expItems).map(item => ({
        ref_type: item.querySelector('.exp-type').value,
        ref_id: parseInt(item.querySelector('.exp-id').value),
        weight: parseInt(item.querySelector('.exp-weight').value)
    })).filter(exp => exp.ref_type && !isNaN(exp.ref_id));

    const payload = {
        initial_focus: {
            ref_type: focusRefType,
            ref_id: focusRefId
        },
        expectations: expectations
    };

    try {
        const response = await fetch(`${API_URL}/pomodoro/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Pomodoro started:', data);
            checkCurrentPomodoro();
        }
    } catch (error) {
        console.error('Error starting pomodoro:', error);
    }
});

// Switch State
switchBtn?.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/pomodoro/change_state`, {
            method: 'POST'
        });
        
        if (response.ok) {
            console.log('State changed');
            checkCurrentPomodoro();
        }
    } catch (error) {
        console.error('Error changing state:', error);
    }
});

// Change Focus UI
changeFocusBtn?.addEventListener('click', () => {
    changeFocusForm.style.display = 'block';
});

cancelFocusBtn?.addEventListener('click', () => {
    changeFocusForm.style.display = 'none';
});

submitFocusBtn?.addEventListener('click', async () => {
    const refType = document.getElementById('newFocusRefType').value;
    const refId = parseInt(document.getElementById('newFocusRefId').value);

    if (!refType || isNaN(refId)) {
        alert('Please fill both fields');
        return;
    }

    const payload = {
        focus: { ref_type: refType, ref_id: refId }
    };

    try {
        const response = await fetch(`${API_URL}/pomodoro/change_focus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('Focus changed');
            changeFocusForm.style.display = 'none';
            checkCurrentPomodoro();
        }
    } catch (error) {
        console.error('Error changing focus:', error);
    }
});

// End Pomodoro
endBtn?.addEventListener('click', async () => {
    const contentsInput = prompt('Enter contents (format: type,id,weight separated by semicolons):\nExample: task,5,2;project,3,1');
    
    let contents = [];
    if (contentsInput) {
        contents = contentsInput.split(';').map(item => {
            const [ref_type, ref_id, weight] = item.split(',');
            return {
                ref_type: ref_type.trim(),
                ref_id: parseInt(ref_id),
                weight: parseInt(weight) || 1
            };
        }).filter(c => c.ref_type && !isNaN(c.ref_id));
    }

    const payload = { contents };

    try {
        const response = await fetch(`${API_URL}/pomodoro/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('Pomodoro ended');
            stopTimer();
            startForm.style.display = 'block';
            activePomodoro.style.display = 'none';
            loadTodayPomodoros();
        }
    } catch (error) {
        console.error('Error ending pomodoro:', error);
    }
});

// Check Current Pomodoro
async function checkCurrentPomodoro() {
    try {
        const response = await fetch(`${API_URL}/pomodoro/current`);
        const data = await response.json();

        if (data && data.pomodoro_id) {
            currentState = data;
            startForm.style.display = 'none';
            activePomodoro.style.display = 'block';
            updateDisplay();
            startTimer();
        } else {
            currentState = null;
            startForm.style.display = 'block';
            activePomodoro.style.display = 'none';
            stopTimer();
        }
    } catch (error) {
        console.error('Error checking pomodoro:', error);
    }
}

// Update Display
function updateDisplay() {
    if (!currentState) return;

    const { state, focus_now } = currentState;

    if (state) {
        modeDisplay.textContent = state.type === 'study' ? 'Study' : 'Rest';
        const started = new Date(state.started);
        const elapsed = Math.floor((Date.now() - started.getTime()) / 1000);
        
        // Calculate remaining (this is approximate, real remaining comes from DB)
        const totalDuration = state.type === 'study' ? 3 * 60 * 60 : 30 * 60;
        const remaining = Math.max(0, totalDuration - elapsed);
        updateTimer(remaining);
    }

    if (focus_now) {
        currentFocusDisplay.textContent = `${focus_now.ref_type}#${focus_now.ref_id}`;
    }
}

// Timer
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        updateDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        timeDisplay.textContent = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    } else {
        timeDisplay.textContent = `${pad(mins)}:${pad(secs)}`;
    }
}

function pad(num) {
    return String(num).padStart(2, '0');
}

// Load Today's Pomodoros
async function loadTodayPomodoros() {
    try {
        const response = await fetch(`${API_URL}/pomodoro/today`);
        const pomodoros = await response.json();

        if (pomodoros.length === 0) {
            todayPomodorosDiv.innerHTML = '<p>No pomodoros today yet</p>';
            return;
        }

        todayPomodorosDiv.innerHTML = pomodoros.map(p => {
            const start = new Date(p.start_time).toLocaleTimeString();
            const end = p.end_time ? new Date(p.end_time).toLocaleTimeString() : 'ongoing';
            const duration = p.end_time ? 
                Math.floor((new Date(p.end_time) - new Date(p.start_time)) / 60000) + 'min' : 
                '...';
            
            return `
                <div class="pomodoro-item">
                    <span>${start} - ${end}</span>
                    <span>${duration}</span>
                    <span class="status-${p.status}">${p.status}</span>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading today pomodoros:', error);
    }
}

    // Refresh history every minute
    setInterval(loadTodayPomodoros, 60000);

}); // End DOMContentLoaded