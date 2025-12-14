// helpers
const pad = n => String(n).padStart(2, "0");
const format = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

// state
let mode = "work";
let running = false;
let workSec = 25 * 60;
let breakSec = 5 * 60;
let remaining = workSec;
let interval = null;

// dom
const timeEl = document.getElementById("time");
const modeEl = document.getElementById("mode");
const startPause = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const skipBtn = document.getElementById("skip");
const workMin = document.getElementById("workMin");
const breakMin = document.getElementById("breakMin");
const applyBtn = document.getElementById("apply");

// render
function render() {
  timeEl.textContent = format(remaining);
  modeEl.textContent = mode === "work" ? "Trabajo" : "Descanso";
  startPause.textContent = running ? "Pause" : "Start";
}

// logic
function tick() {
  if (--remaining <= 0) switchMode();
  render();
}

function start() {
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
  playBeep(mode === "work" ? 660 : 880);

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

// events
startPause.onclick = () => running ? pause() : start();
resetBtn.onclick = reset;
skipBtn.onclick = switchMode;
applyBtn.onclick = () => {
  workSec = workMin.value * 60;
  breakSec = breakMin.value * 60;
  reset();
};

function playBeep(freq = 880, duration = 300) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.08;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, duration);
  } catch (e) {
    console.warn("Audio not supported");
  }
}

// init
render();
