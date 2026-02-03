const API = "https://api-dashboard-production-fc05.up.railway.app/task/today";
const API_CHECKBOX = "https://api-dashboard-production-fc05.up.railway.app/task/today/checkbox";
const taskList = document.getElementById("task");

let draggedTaskId = null;

const OccurrenceSections = {
    morning: createOccurrenceSection("Morning"),
    afternoon: createOccurrenceSection("Afternoon"),
    night: createOccurrenceSection("Night")
}

Object.values(OccurrenceSections).forEach(section => taskList.appendChild(section));

function getOccurrence() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "night";
}
function createOccurrenceSection(titleText) {
    const section = document.createElement("div");
    section.classList.add("task-section");

    const title = document.createElement("h3");
    title.textContent = titleText;
    title.classList.add("task-section-title");

    const ul = document.createElement("ul");
    ul.classList.add("task-list");

    title.addEventListener("click", () => {
        section.classList.toggle("collapsed");
    });

    section.appendChild(title);
    section.appendChild(ul);

    return section;
}


function renderTasks(tasks) {
    Object.values(OccurrenceSections).forEach(section => {
    section.querySelector("ul").innerHTML = "";
    });
    tasks.forEach(task => {
        renderTask(task);
    });
}

function renderTask(task) {
    const li = document.createElement("li");
    li.classList.add("task-item");
    li.dataset.taskId = task.task_id;
    
    const task_span = document.createElement("span");
    task_span.textContent = task.name.trim();

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.completed);
    checkbox.dataset.taskId = task.task_id;

    li.appendChild(checkbox);
    li.appendChild(task_span);

    if (task.completed) {
        li.classList.add("completed");
    }
    checkbox.addEventListener("change", () => {
        const completed = checkbox.checked;

        li.classList.toggle("completed", completed);

        updateTaskCheckbox(task.task_id, completed)
    });

    const context = task.day_context; // 👈 CLAVE
    OccurrenceSections[context].querySelector("ul").appendChild(li);
    };

function showOccurrenceTasks(activeContext) {
    Object.entries(OccurrenceSections).forEach(([context, section]) => {
        if (context === activeContext) {
            section.classList.remove("collapsed");
        } else {
            section.classList.add("collapsed");
        }
    });
}


fetch(API)
  .then(res => {
    if (!res.ok) throw new Error("Error loading tasks");
    return res.json();
  })
  .then(tasks => {
      renderTasks(tasks);

      const activeContext = getOccurrence();
      showOccurrenceTasks(activeContext);
  })


function updateTaskCheckbox(taskId, completed) {
  fetch(API_CHECKBOX, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_id: taskId, completed })
  }).catch(err => {
    console.error("Error updating task", err);
  });
}




