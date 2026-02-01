// ---------------- PROJECTS ----------------

const PROJECTS_URL = "https://api-dashboard-production-fc05.up.railway.app/projects";
const projectsList = document.getElementById("projects");
const pomodoroProjectsList = document.getElementById("pomodoroProjects");

// Función para renderizar proyectos
function renderProjects(container, clickable = false) {
  if (!container) return;

  fetch(PROJECTS_URL)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(projects => {
      console.log("Projects recibidos:", projects);
      
      if (!Array.isArray(projects) || projects.length === 0) {
        container.innerHTML = '<li class="no-data">No active projects</li>';
        return;
      }

      // Limpiar lista
      container.innerHTML = '';

      // Organizar por jerarquía usando path
      projects.forEach(project => {
        const li = document.createElement("li");
        li.classList.add("project-item");
        li.dataset.projectId = project.id;
        li.dataset.type = project.type;

        if (clickable) {
          li.classList.add("clickable");
          li.addEventListener('click', () => {
            // Auto-fill pomodoro form
            const focusRefType = document.getElementById('focusRefType');
            const focusRefId = document.getElementById('focusRefId');
            if (focusRefType && focusRefId) {
              focusRefType.value = project.type;
              focusRefId.value = project.id;
              // Scroll to form
              document.getElementById('startForm')?.scrollIntoView({ behavior: 'smooth' });
            }
          });
        }

        // Calcular indentación basado en el nivel del path
        const pathStr = project.path ? String(project.path) : '';
        const level = (pathStr.match(/\./g) || []).length;
        li.style.paddingLeft = `${level * 1.5}rem`;

        // Icono según tipo
        const icon = project.type === 'project' ? '📁' : '📄';
        
        // Contenido
        const content = document.createElement('div');
        content.className = 'project-content';
        content.innerHTML = `
          <span class="project-icon">${icon}</span>
          <span class="project-name">${project.name}</span>
          ${project.description ? `<span class="project-desc">${project.description}</span>` : ''}
        `;

        li.appendChild(content);
        container.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Error cargando projects:", err);
      if (container) {
        container.innerHTML = `<li class="error">Error loading projects: ${err.message}</li>`;
      }
    });
}

// Cargar en Daily Notes (no clickable)
if (projectsList) {
  renderProjects(projectsList, false);
}

// Cargar en Pomodoro tab (clickable)
if (pomodoroProjectsList) {
  renderProjects(pomodoroProjectsList, true);
}
