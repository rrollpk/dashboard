const logs_API = 'https://api-dashboard-production-fc05.up.railway.app/logs'

async function loadLogs() {
  try {
    const res = await fetch(logs_API);
    const logs = await res.json();
    
    console.log('Logs received:', logs); 
    
    const logsList = document.getElementById('logs');
    if (!logs) {
      console.error('logsList element not found');
      return;
    }
    
    // Limpiar lista
    logsList.innerHTML = '';
    
    // Renderizar cada log
    logs.forEach(log => {
      const li = document.createElement('li');
      li.className = 'log-item';
      li.innerHTML = `
        <span class="log-message">${log.message}</span>
        <span class="log-time">${formatTime(log.timestamp)}</span>
      `;
      logsList.appendChild(li);
    });
    
  } catch (error) {
    console.error('Error:', error);
    const logsList = document.getElementById('logsList');
    if (logsList) {
      logsList.innerHTML = '<li class="log-item">Error loading logs</li>';
    }
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadLogs);
} else {
  loadLogs();
}

// Actualizar cada 30 segundos
setInterval(loadLogs, 30000);