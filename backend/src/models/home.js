async function loadHomePage() {
    try {
        const response = await fetch('featured-items.json');
        const data = await response.json();
        displayHeroSection(data.hero);
        displayFeaturedItems(data.featuredItems);
    } catch (error) {
        console.error('Error loading home page data:', error);
        displayFallbackContent();
    }
}

function displayHeroSection(hero) {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.innerHTML = `
            <h1 class="hero-title">${hero.title}</h1>
            <p class="hero-subtitle">${hero.subtitle}</p>
            <p class="welcome-text">${hero.description}</p>
        `;
    }
}

function displayFeaturedItems(featuredItems) {
    const container = document.getElementById('featured-items-container');
    if (!container) return;
    
    container.innerHTML = '';

    featuredItems.forEach(item => {
        const itemCard = createFeaturedItemCard(item);
        container.appendChild(itemCard);
    });
}

function createFeaturedItemCard(item) {
    const col = document.createElement('div');
    col.className = 'col';

    col.innerHTML = `
        <a href="${item.link}" class="featured-item">
            <div class="card">
                <div class="position-relative">
                    <img src="${item.image}" class="card-img-top" alt="${item.alt}">
                    <span class="featured-badge">${item.badge}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <p class="card-text"><strong>Price:</strong> $${item.price.toFixed(2)}</p>
                    <small class="text-muted">${item.linkText}</small>
                </div>
            </div>
        </a>
    `;

    return col;
}

function displayFallbackContent() {
    const container = document.getElementById('featured-items-container');
    if (container) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center">
                    <h4>Unable to load featured items</h4>
                    <p>Please refresh the page or try again later.</p>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', loadHomePage);
