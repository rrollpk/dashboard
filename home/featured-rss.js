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

document.addEventListener('DOMContentLoaded', loadFeaturedNews);