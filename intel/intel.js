
const knowledgeState = {
  concept_id: null,
  project_id: null,
  mode: null,
  block_types: [] // empty array means “all block types”
};

const KNOWLEDGE_API_BASE = "https://api-dashboard-production-fc05.up.railway.app";


const projectSelect = document.getElementById("projectSelect");
const conceptTree = document.getElementById("conceptTree");
const modeSelect = document.getElementById("modeSelect");
const blockTypeFilters = document.getElementById("blockTypeFilters");
const viewer = document.getElementById("knowledgeViewer");

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  setupModeSelector();
  setupBlockTypeFilters();
  setupKnowledgeSidebar();
  loadProjects();
  loadConcepts();
});

function setupKnowledgeSidebar() {
  const sidebar = document.getElementById("knowledgeSidebar");
  const toggleBtn = document.getElementById("knowledgeToggle");
  const layout = document.querySelector(".knowledge-layout");

  if (!sidebar || !toggleBtn || !layout) return;

  toggleBtn.addEventListener("click", () => {
    const collapsed = sidebar.classList.toggle("collapsed");
    layout.classList.toggle("collapsed", collapsed);
    
  });
}

async function loadProjects() {
  if (!projectSelect) return;

  const res = await fetch(`${KNOWLEDGE_API_BASE}/knowledge/projects`);
  const projects = await res.json();

  projectSelect.innerHTML = `<option value="">None</option>`;

  projects.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    projectSelect.appendChild(opt);
  });

  projectSelect.addEventListener("change", () => {
    knowledgeState.project_id = projectSelect.value
      ? Number(projectSelect.value)
      : null;

    loadConcepts();
    fetchKnowledge(); // Reload with new filter
  });
}

async function loadConcepts() {
  if (!conceptTree) return;

  let url = `${KNOWLEDGE_API_BASE}/knowledge/concepts`;
  if (knowledgeState.project_id) {
    url += `?project_id=${knowledgeState.project_id}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    renderConceptTree([]);
    console.error("Error loading concepts:", errorText);
    return;
  }

  const concepts = await res.json();
  if (!Array.isArray(concepts)) {
    renderConceptTree([]);
    console.error("Knowledge concepts invalid response:", concepts);
    return;
  }

  renderConceptTree(concepts);
}

// REVISAR QUE ESTO ES LO DEL BOTON DE ADD CONCEPT

document.getElementById('addConceptBtn').addEventListener('click', async () => {
    const name = prompt('New Concept');
    if (!name) return;

    const parent_concept_id = knowledgeState.concept_id || null;
    console.log("🔵 Parent Concept ID:", parent_concept_id);
    const project_id = knowledgeState.project_id || null;

    

    const res = await fetch(`${KNOWLEDGE_API_BASE}/knowledge/concepts/new`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, parent_concept_id, project_id})
    });

    if (res.ok) {
        loadConcepts();
    } else {
        alert('Error creating concept');
    }
});

document.getElementById('addBlockBtn').addEventListener('click', async () => {
    if (!knowledgeState.concept_id) {
        alert('Select a concept first');
        return;
    }
 
    const content = prompt('Content of the new block:');
    if (!content) return;

    const block_type = prompt('Block type (definition, intuition, formula, etc):');
    if (!block_type) return;

    const res = await fetch(`${KNOWLEDGE_API_BASE}/knowledge/block/new`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            concept_id: knowledgeState.concept_id,
            content,
            block_type,
            project_id: knowledgeState.project_id || null,
            mode: knowledgeState.mode || null
        })
    });

    if (res.ok) {
        fetchKnowledge();
    } else {
        alert('Error creating block');
    }
});

function renderConceptTree(concepts) {
  conceptTree.innerHTML = "";

  if (!Array.isArray(concepts) || concepts.length === 0) {
    const empty = document.createElement("div");
    empty.classList.add("knowledge-empty");
    empty.textContent = "No concepts available";
    conceptTree.appendChild(empty);
    return;
  }

  const byParent = {};
  concepts.forEach(c => {
    const parentKey = c.parent_concept_id ?? "root";
    byParent[parentKey] ||= [];
    byParent[parentKey].push(c);
  });

  function renderNode(parentId, container, depth = 0) {
    (byParent[parentId] || []).forEach(c => {
      const el = document.createElement("div");
      el.textContent = c.name;
      el.style.paddingLeft = `${depth * 12}px`;
      el.classList.add("concept-item");

      el.addEventListener("click", () => {
        document
          .querySelectorAll(".concept-item.active")
          .forEach(x => x.classList.remove("active"));

        el.classList.add("active");
        knowledgeState.concept_id = c.id;
        console.log("🔵 Concepto seleccionado:", c.id, c.name);
        fetchKnowledge();
      });

      container.appendChild(el);
      renderNode(c.id, container, depth + 1);
    });
  }

  renderNode("root", conceptTree);
}

function setupModeSelector() {
  if (!modeSelect) return;
  modeSelect.addEventListener("change", () => {
    console.log("Mode changed to:", modeSelect.value);
    knowledgeState.mode = modeSelect.value || null;
    console.log("Updated knowledgeState:", knowledgeState);
    fetchKnowledge();
  });

  
}


function setupBlockTypeFilters() {
  if (!blockTypeFilters) return;

  const types = [
    "definition",
    "intuition",
    "formula",
    "example",
    "warning",
    "exam"
  ];

  blockTypeFilters.innerHTML = "";

  types.forEach(type => {
    const label = document.createElement("label");
    label.style.marginRight = "8px";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = type;
    cb.checked = true;

    cb.addEventListener("change", () => {
      const checked = [...blockTypeFilters.querySelectorAll("input:checked")]
        .map(x => x.value);

      knowledgeState.block_types =
        checked.length === types.length ? [] : checked;

      fetchKnowledge();
    });

    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + type));
    blockTypeFilters.appendChild(label);
  });
}

// ===============================
// FETCH KNOWLEDGE
// ===============================
async function fetchKnowledge() {
  if (!knowledgeState.concept_id || !viewer) {
    console.log("❌ No hay concept_id, saliendo");  // ← Añade esto
    return;
  }

  const params = new URLSearchParams();
  params.append("concept_id", knowledgeState.concept_id);

  if (knowledgeState.project_id) {
    params.append("project_id", knowledgeState.project_id);
  }

  if (knowledgeState.mode) {
    params.append("mode", knowledgeState.mode);
  }

  console.log("🔵 URL:", `${KNOWLEDGE_API_BASE}/knowledge/query?${params.toString()}`);  // ← Añade esto

  const res = await fetch(`${KNOWLEDGE_API_BASE}/knowledge/query?${params.toString()}`);
  const blocks = await res.json();
  console.log("🔵 Blocks recibidos:", blocks.length); 
  renderKnowledge(blocks);
}

// ===============================
// RENDER: KNOWLEDGE VIEWER
// ===============================
// ...existing code...

function renderKnowledge(blocks) {
    const viewer = document.getElementById('knowledgeViewer');
    viewer.innerHTML = '';
    
    if (blocks.length === 0) {
        viewer.innerHTML = '<p>No blocks available for this concept.</p>';
        return;
    }

    blocks.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.className = `knowledge-block ${block.block_type}`;
        blockDiv.dataset.blockId = block.id;
        
        const header = document.createElement('div');
        header.className = 'block-header';
        header.innerHTML = `
            <strong>${block.block_type.toUpperCase()}</strong>
            ${block.mode ? `<span class="mode-badge">${block.mode}</span>` : ''}
            <button class="edit-btn" data-block-id="${block.id}">Edit</button>
            <button class="delete-btn" data-block-id="${block.id}">Delete</button>
        `;
        
        const content = document.createElement('div');
        content.className = 'block-content';
        content.innerHTML = block.content;
        
        // ✅ GUARDAR CONTENIDO ORIGINAL (antes de renderizar KaTeX)
        content.dataset.originalContent = block.content;
        
        blockDiv.appendChild(header);
        blockDiv.appendChild(content);
        viewer.appendChild(blockDiv);
    });

    // Renderizar KaTeX DESPUÉS de guardar el original
    renderMathInElement(viewer, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ],
        throwOnError: false,
        strict: false
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditClick);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
    });
}

async function handleEditClick(event) {
    const blockId = event.target.dataset.blockId;
    const blockDiv = document.querySelector(`[data-block-id="${blockId}"]`);
    const contentDiv = blockDiv.querySelector('.block-content');
    const editBtn = event.target;
    
    if (editBtn.textContent === 'Save') {
        // GUARDAR
        const textarea = contentDiv.querySelector('textarea');
        const newContent = textarea.value;
        
        try {
            const response = await fetch(`${KNOWLEDGE_API_BASE}/knowledge/block/${blockId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newContent })
            });
            
            if (!response.ok) throw new Error('Failed to update');
            
            // ✅ Guardar el nuevo contenido original
            contentDiv.dataset.originalContent = newContent;
            
            // Renderizar el HTML
            contentDiv.innerHTML = newContent;
            editBtn.textContent = 'Edit';
            
            // Renderizar KaTeX
            renderMathInElement(contentDiv, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ],
                throwOnError: false,
                strict: false
            });
            
        } catch (error) {
            console.error('Error updating block:', error);
            alert('Error al guardar los cambios');
        }
        
    } else {
        // EDITAR
        // ✅ Usar el contenido original (con $ y $$), no el renderizado
        const originalContent = contentDiv.dataset.originalContent || contentDiv.innerHTML;
        
        contentDiv.innerHTML = `<textarea class="block-editor">${originalContent}</textarea>`;
        editBtn.textContent = 'Save';
        
        const textarea = contentDiv.querySelector('textarea');
        textarea.focus();
        
        // ✅ Auto-resize del textarea
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
    }
}

async function handleDeleteClick(event) {
    const blockId = event.target.dataset.blockId;
    if (!confirm('Are you sure you want to delete this block?')) return;

    try {
        const response = await fetch(`${KNOWLEDGE_API_BASE}/knowledge/block/${blockId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete');

        // Eliminar del DOM
        const blockDiv = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockDiv) blockDiv.remove();

    } catch (error) {
        console.error('Error deleting block:', error);
        alert('Error al eliminar el bloque');
    }
}

document.getElementById('modifyBlockBtn').addEventListener('click', () => {
  document.getElementById('relationsModal').style.display = 'flex';
});

document.getElementById('closeRelationsModal').addEventListener('click', () => {
  document.getElementById('relationsModal').style.display = 'none';
});