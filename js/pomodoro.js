// ---------------- CONFIG ----------------

const API_BASE = "https://api-dashboard-production-fc05.up.railway.app";

const STUDY_DURATION = 3 * 60 * 60; // 3h
const REST_DURATION  = 30 * 60;     // 30m

// ---------------- HELPERS ----------------

const pad = n => String(n).padStart(2, "0");

function format(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${pad(m)}:${pad(s)}`;
}

// ---------------- AUDIO ----------------

let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playBeep(freq = 800, duration = 300) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = 0.07;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  setTimeout(() => osc.stop(), duration);
}

// ---------------- STATE ----------------

let current = {
  pomodoro_id: null,
  state: null // { type, started }
};

let uiInterval = null;

// ---------------- DOM ----------------

const timeEl  = document.getElementById("time");
const modeEl  = document.getElementById("mode");
const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");
const endBtn   = document.getElementById("endBtn");

console.log("Pomodoro elements:", { timeEl, modeEl, startBtn, stopBtn, endBtn });

// ---------------- CORE LOGIC ----------------

function getRemainingSeconds() {
  if (!current.state) return null;

  const started = new Date(current.state.started).getTime();
  const elapsed = Math.floor((Date.now() - started) / 1000);

  const total =
    current.state.type === "study"
      ? STUDY_DURATION
      : REST_DURATION;

  return Math.max(0, total - elapsed);
}

function render() {
  console.log("Rendering - current state:", current);
  
  if (!current.state) {
    timeEl.textContent = "--:--";
    modeEl.textContent = "Idle";
    console.log("No active pomodoro");
    return;
  }

  const remaining = getRemainingSeconds();
  timeEl.textContent = format(remaining);
  modeEl.textContent =
    current.state.type === "study" ? "Study (3h)" : "Rest (30m)";
  
  console.log("Updated timer:", timeEl.textContent, modeEl.textContent);

  if (remaining === 0) {
    playBeep(current.state.type === "study" ? 700 : 900);
  }
}

// ---------------- BACKEND SYNC ----------------

async function fetchStatus() {
  try {
    const res = await fetch(`${API_BASE}/pomodoro/status`);
    const data = await res.json();

    if (!data || !data.pomodoro_id) {
      current = { pomodoro_id: null, state: null };
      return;
    }

    current.pomodoro_id = data.pomodoro_id;
    current.state = data.state;
  } catch (error) {
    console.error("Error fetching status:", error);
    current = { pomodoro_id: null, state: null };
  }
}

// ---------------- ACTIONS ----------------

async function startPomodoro() {
  console.log("Start button clicked!");
  initAudio();

  try {
    console.log("Calling API:", `${API_BASE}/pomodoro/start`);
    const res = await fetch(
      `${API_BASE}/pomodoro/start?ref_type=general&ref_id=0`,
      { method: "POST" }
    );
    
    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Response data:", data);

    await fetchStatus();
  } catch (error) {
    console.error("Error starting pomodoro:", error);
  }
}

async function stopAndSwitch() {
  if (!current.pomodoro_id || !current.state) return;

  const newType =
    current.state.type === "study" ? "rest" : "study";

  await fetch(
    `${API_BASE}/pomodoro/state?pomodoro_id=${current.pomodoro_id}&new_type=${newType}`,
    { method: "POST" }
  );

  await fetchStatus();
}

async function endPomodoro() {
  if (!current.pomodoro_id) return;

  await fetch(
    `${API_BASE}/pomodoro/end?pomodoro_id=${current.pomodoro_id}`,
    { method: "POST" }
  );

  current = { pomodoro_id: null, state: null };
}

// ---------------- LOOP ----------------

function startUI() {
  fetchStatus().then(() => {
    render();
    uiInterval = setInterval(() => {
      render();
    }, 1000);
  });
}

// ---------------- EVENTS ----------------

startBtn.onclick = startPomodoro;
stopBtn.onclick  = stopAndSwitch;
endBtn.onclick   = endPomodoro;

// ---------------- INIT ----------------

startUI();
