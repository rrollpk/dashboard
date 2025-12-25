// ---------------- DAILY SCHEDULE ----------------

const scheduleDate = document.getElementById('scheduleDate');
const scheduleHours = document.getElementById('scheduleHours');

let draggedElement = null;
let draggedHour = null;

// Load activities from localStorage
function loadActivities() {
  const stored = localStorage.getItem('dailySchedule');
  return stored ? JSON.parse(stored) : {};
}

// Save activities to localStorage
function saveActivities(activities) {
  localStorage.setItem('dailySchedule', JSON.stringify(activities));
}

function renderSchedule() {
  if (!scheduleDate || !scheduleHours) return;
  
  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  scheduleDate.textContent = today.toLocaleDateString('en-US', options);
  
  scheduleHours.innerHTML = '';
  const activities = loadActivities();
  
  // Create hourly slots from 5 to 21
  for (let hour = 5; hour <= 21; hour++) {
    const hourSlot = document.createElement('div');
    hourSlot.classList.add('hour-slot');
    hourSlot.dataset.hour = hour;
    
    const hourLabel = document.createElement('div');
    hourLabel.classList.add('hour-label');
    hourLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
    
    const activityInput = document.createElement('input');
    activityInput.type = 'text';
    activityInput.classList.add('activity-input');
    activityInput.placeholder = 'Activity';
    activityInput.value = activities[hour] || '';
    activityInput.dataset.hour = hour;
    
    // Make draggable if has content
    if (activityInput.value.trim()) {
      activityInput.draggable = true;
      activityInput.classList.add('has-content');
    }
    
    // Drag events
    activityInput.addEventListener('dragstart', (e) => {
      draggedElement = e.target;
      draggedHour = parseInt(e.target.dataset.hour);
      e.target.classList.add('dragging');
    });
    
    activityInput.addEventListener('dragend', (e) => {
      e.target.classList.remove('dragging');
      draggedElement = null;
      draggedHour = null;
    });
    
    // Save on input
    activityInput.addEventListener('input', (e) => {
      const allActivities = loadActivities();
      if (e.target.value.trim()) {
        allActivities[hour] = e.target.value;
        e.target.draggable = true;
        e.target.classList.add('has-content');
      } else {
        delete allActivities[hour];
        e.target.draggable = false;
        e.target.classList.remove('has-content');
      }
      saveActivities(allActivities);
    });
    
    // Drop zone events
    hourSlot.addEventListener('dragover', (e) => {
      e.preventDefault();
      hourSlot.classList.add('drag-over');
    });
    
    hourSlot.addEventListener('dragleave', (e) => {
      hourSlot.classList.remove('drag-over');
    });
    
    hourSlot.addEventListener('drop', (e) => {
      e.preventDefault();
      hourSlot.classList.remove('drag-over');
      
      const targetHour = parseInt(hourSlot.dataset.hour);
      
      if (draggedHour !== null && draggedHour !== targetHour) {
        const allActivities = loadActivities();
        const draggedActivity = allActivities[draggedHour];
        
        // Swap activities
        if (allActivities[targetHour]) {
          allActivities[draggedHour] = allActivities[targetHour];
        } else {
          delete allActivities[draggedHour];
        }
        
        allActivities[targetHour] = draggedActivity;
        saveActivities(allActivities);
        renderSchedule();
      }
    });
    
    // Highlight current hour
    const currentHour = today.getHours();
    if (hour === currentHour) {
      hourSlot.classList.add('current-hour');
    }
    
    hourSlot.appendChild(hourLabel);
    hourSlot.appendChild(activityInput);
    scheduleHours.appendChild(hourSlot);
  }
  
  // Scroll to current hour
  setTimeout(() => {
    const currentSlot = scheduleHours.querySelector('.current-hour');
    if (currentSlot) {
      currentSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}

// Initial render
renderSchedule();
