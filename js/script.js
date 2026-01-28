// ---------------- TASKS ----------------

const API_URL = "https://api-dashboard-production-fc05.up.railway.app/task/log/today";
const API_UPDATE_URL = "https://api-dashboard-production-fc05.up.railway.app/tasks/log/today/status";
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
  fetch(API_UPDATE_URL, {
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
