const themes = {
    'dark-cyan': 'Dark - Cyan',
    'light-cyan': 'Light - Cyan',
    'dark-purple': 'Dark - Purple'
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark-cyan';
    setTheme(savedTheme);
    return savedTheme;
}

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
}


function populateThemeSelector() {
    const themeSelect = document.getElementById('themeSelect');
    
    if (!themeSelect) {
        console.error('themeSelect element not found');
        return;
    }
    
    themeSelect.innerHTML = '';
    
    Object.entries(themes).forEach(([key, label]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = label;
        themeSelect.appendChild(option);
    });
    
    themeSelect.value = loadTheme();
    
    themeSelect.addEventListener('change', (e) => {
        setTheme(e.target.value);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateThemeSelector);
} else {
    populateThemeSelector();
}
