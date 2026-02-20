const themes = {
    dark: 'Dark Mode',
    light: 'Light Mode'
}

// Cargar tema guardado o usar dark por defecto
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    return savedTheme;
}

// Aplicar tema
function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
}

// Poblar el selector con las opciones
function populateThemeSelector() {
    const themeSelect = document.getElementById('themeSelect');
    
    if (!themeSelect) {
        console.error('themeSelect element not found');
        return;
    }
    
    // Limpiar opciones existentes
    themeSelect.innerHTML = '';
    
    // Añadir opciones de temas
    Object.entries(themes).forEach(([key, label]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = label;
        themeSelect.appendChild(option);
    });
    
    // Seleccionar tema actual
    themeSelect.value = loadTheme();
    
    // Escuchar cambios
    themeSelect.addEventListener('change', (e) => {
        setTheme(e.target.value);
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateThemeSelector);
} else {
    populateThemeSelector();
}
