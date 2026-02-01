// ---------------- TASKS ----------------

const API_URL = "https://api-dashboard-production-fc05.up.railway.app/task/today";
const API_UPDATE_URL = "https://api-dashboard-production-fc05.up.railway.app/tasks/log/today/status";


const taskList = document.getElementById("tasks");

const sections = {
  morning: createSection("Morning"),
  afternoon: createSection("Afternoon"),
  night: createSection("Night")
};

Object.values(sections).forEach(section => taskList.appendChild(section));

function createSection(titleText) {
  const section = document.createElement("div");
  section.classList.add("task-section");

  const title = document.createElement("h3");
  title.textContent = titleText;

  const ul = document.createElement("ul");
  ul.classList.add("task-list");

  section.appendChild(title);
  section.appendChild(ul);

  return section;
}


// Cargar tareas de hoy
fetch(API_URL)
  .then(res => res.json())
  .then(tasks => {
  tasks.forEach(task => {

    const li = document.createElement("li");
    li.classList.add("task-item");
    li.dataset.taskId = task.task_id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.completed);
    checkbox.dataset.taskId = task.task_id;

    const label = document.createElement("span");
    label.textContent = task.name.trim();

    if (task.completed) {
      li.classList.add("completed");
    }

    checkbox.addEventListener("change", () => {
      const taskId = Number(checkbox.dataset.taskId);
      const completed = checkbox.checked;

      li.classList.toggle("completed", completed);
      updateTask(taskId, completed);
    });

    li.appendChild(checkbox);
    li.appendChild(label);

    const context = task.day_context; // 👈 CLAVE
    sections[context].querySelector("ul").appendChild(li);

  });
})
  .catch(err => {
    console.error("Error cargando tasks:", err);
  })


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
