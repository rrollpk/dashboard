// ---------------- TASKS ----------------


const API_URL = "https://api-dashboard-production-fc05.up.railway.app/tasks/today";
const taskList = document.getElementById("tasks");

fetch(API_URL)
  .then(res => res.json())
  .then(tasks => {
    tasks.forEach(task => {
      // li principal
      const li = document.createElement("li");
      li.dataset.taskId = task.task_id;   // 🔑 CLAVE
      li.classList.add("task-item");

      // checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.dataset.taskId = task.task_id; // 🔑 CLAVE

      // label
      const label = document.createElement("span");
      label.textContent = task.name.trim();

      // estado visual inicial
      if (task.completed) {
        li.classList.add("completed");
      }

      // evento (ya ligado al ID real)
      checkbox.addEventListener("change", () => {
        const taskId = checkbox.dataset.taskId;
        const completed = checkbox.checked;

        li.classList.toggle("completed", completed);

        // 👉 aquí tu dashboard ya puede usar taskId
        console.log(
          "UPDATE TASK",
          taskId,
          "completed =",
          completed
        );

        // más adelante:
        // updateTask(taskId, completed)
      });

      li.appendChild(checkbox);
      li.appendChild(label);
      taskList.appendChild(li);
    });
  })
  .catch(err => {
    console.error("Error cargando tasks:", err);
  });

// Pomodoro Timer



// ---------------- HELPERS ----------------
const pad = n => String(n).padStart(2, "0");
const format = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

// ---------------- AUDIO (DESBLOQUEADO) ----------------
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

// ---------------- STATE ----------------
let mode = "work"; // work | break
let running = false;
let workSec = 25 * 60;
let breakSec = 5 * 60;
let remaining = workSec;
let interval = null;

// ---------------- DOM ----------------
const timeEl = document.getElementById("time");
const modeEl = document.getElementById("mode");
const startPause = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const skipBtn = document.getElementById("skip");
const workMin = document.getElementById("workMin");
const breakMin = document.getElementById("breakMin");
const applyBtn = document.getElementById("apply");

// ---------------- RENDER ----------------
function render() {
  timeEl.textContent = format(remaining);
  modeEl.textContent = mode === "work" ? "Trabajo" : "Descanso";
  startPause.textContent = running ? "Pause" : "Start";
}

// ---------------- LOGIC ----------------
function tick() {
  remaining--;
  render();

  if (remaining <= 0) {
    // 🔔 SUENA SOLO CUANDO ACABA
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
  initAudio(); // 🔓 desbloquea audio (CLAVE)
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
