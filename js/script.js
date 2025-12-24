// ---------------- TASKS ----------------

const API_URL = "https://api-dashboard-production-fc05.up.railway.app/tasks/today";
const taskList = document.getElementById("tasks");

// Cargar tareas de hoy
fetch(API_URL)
  .then(res => res.json())
  .then(tasks => {
    console.log("Tasks recibidas:", tasks); // 👈 Debug
    tasks.forEach(task => {
      console.log(`Task ${task.task_id}: completed =`, task.completed, typeof task.completed); // 👈 Debug
      const li = document.createElement("li");
      li.classList.add("task-item");
      li.dataset.taskId = task.task_id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(task.completed); // 👈 Forzar a boolean
      checkbox.dataset.taskId = task.task_id;

      const label = document.createElement("span");
      label.textContent = task.name.trim();

      if (task.completed) { // 👈 Esto también debería marcar como completed
        li.classList.add("completed");
      }

      checkbox.addEventListener("change", () => {
        const taskId = Number(checkbox.dataset.taskId); // 👈 int real
        const completed = checkbox.checked;              // 👈 bool real

        // UI optimista
        li.classList.toggle("completed", completed);

        updateTask(taskId, completed);
      });

      li.appendChild(checkbox);
      li.appendChild(label);
      taskList.appendChild(li);
    });
  })
  .catch(err => {
    console.error("Error cargando tasks:", err);
  });

// ---------------- API WRITE ----------------

function updateTask(taskId, completed) {
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      task_id: taskId,
      completed: completed
    })
  })
  .then(res => {
    if (!res.ok) {
      throw new Error("POST failed");
    }
  })
  .catch(err => {
    console.error("Error actualizando task:", err);
  });
}

// ---------------- HELPERS ----------------

const pad = n => String(n).padStart(2, "0");
const format = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

// ---------------- AUDIO ----------------

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playBeep(freq = 880, duration = 300) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0.08;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  setTimeout(() => osc.stop(), duration);
}

// ---------------- POMODORO ----------------

let mode = "work";
let running = false;
let workSec = 25 * 60;
let breakSec = 5 * 60;
let remaining = workSec;
let interval = null;

const timeEl = document.getElementById("time");
const modeEl = document.getElementById("mode");
const startPause = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const skipBtn = document.getElementById("skip");
const workMin = document.getElementById("workMin");
const breakMin = document.getElementById("breakMin");
const applyBtn = document.getElementById("apply");

function render() {
  timeEl.textContent = format(remaining);
  modeEl.textContent = mode === "work" ? "Trabajo" : "Descanso";
  startPause.textContent = running ? "Pause" : "Start";
}

function tick() {
  remaining--;
  render();

  if (remaining <= 0) {
    playBeep(mode === "work" ? 880 : 660);
    switchMode();
  }
}

function start() {
  if (running) return;
  running = true;
  interval = setInterval(tick, 1000);
  render();
}

function pause() {
  running = false;
  clearInterval(interval);
  render();
}

function switchMode() {
  pause();
  mode = mode === "work" ? "break" : "work";
  remaining = mode === "work" ? workSec : breakSec;
  start();
}

function reset() {
  pause();
  remaining = mode === "work" ? workSec : breakSec;
  render();
}

// ---------------- EVENTS ----------------

startPause.onclick = () => {
  initAudio();
  running ? pause() : start();
};

resetBtn.onclick = reset;
skipBtn.onclick = switchMode;

applyBtn.onclick = () => {
  workSec = Math.max(1, workMin.value) * 60;
  breakSec = Math.max(1, breakMin.value) * 60;
  reset();
};

// ---------------- INIT ----------------

render();
