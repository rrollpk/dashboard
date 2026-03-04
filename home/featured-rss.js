async function loadFeaturedNews() {
    const container = document.getElementById('featuredNews');
    if (!container) return;

    try {
        const res = await fetch('https://api-dashboard-production-fc05.up.railway.app/rss/top-global?limit=3');
        if (!res.ok) throw new Error('No se pudieron cargar las noticias destacadas');
        const data = await res.json();

        container.innerHTML = '';
        data.articles.forEach(article => {
            const link = document.createElement('a');
            link.href = article.link;
            link.target = '_blank';
            link.textContent = article.title;
            link.className = 'featured-news-link';
            container.appendChild(link);
            container.appendChild(document.createElement('br'));
        });
    } catch (err) {
        container.innerHTML = '<p>Error cargando noticias destacadas.</p>';
    }
}

function formatEventWhen(iso) {
    if (!iso) return '';
    const dt = new Date(iso);
    return dt.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function loadFeaturedEvents() {
    const container = document.getElementById('featuredEvents');
    if (!container) return;

    try {
        const res = await fetch('https://api-dashboard-production-fc05.up.railway.app/calendar/upcoming?days=7&limit=8');
        if (!res.ok) throw new Error('Could not load upcoming events');
        const payload = await res.json();
        const events = Array.isArray(payload.events) ? payload.events : [];

        if (!events.length) {
            container.innerHTML = '<p class="featured-events-empty">No upcoming events in the next 7 days.</p>';
            return;
        }

        container.innerHTML = '';
        events.forEach(evt => {
            const row = document.createElement('div');
            row.className = 'featured-event-row';

            const title = document.createElement('div');
            title.className = 'featured-event-title';
            title.textContent = evt.title || '(untitled event)';

            const when = document.createElement('div');
            when.className = 'featured-event-when';
            when.textContent = formatEventWhen(evt.start_time);

            row.appendChild(title);
            row.appendChild(when);
            container.appendChild(row);
        });
    } catch (err) {
        container.innerHTML = '<p class="featured-events-empty">Error loading upcoming events.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedNews();
    loadFeaturedEvents();
});