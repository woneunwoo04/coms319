function createHeader(activePage = '') {
    const header = document.createElement('header');
    header.className = 'bg-dark text-white py-3';
    
    header.innerHTML = `
        <div class="container">
            <h1 class="text-center">Cafe</h1>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">
                        <img src="assets/myotherimages/logo.png" alt="Cafe Logo" style="height: 60px; width: auto;">
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav mx-auto">
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="index.html">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'hot-drinks' ? 'active' : ''}" href="hot-drinks.html">Hot Drinks</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'cold-drinks' ? 'active' : ''}" href="cold-drinks.html">Cold Drinks</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'desserts' ? 'active' : ''}" href="desserts.html">Desserts</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'authors' ? 'active' : ''}" href="authors.html">Authors</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'faq' ? 'active' : ''}" href="faq.html">FAQ</a>
                            </li>
                            
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    `;
    
    return header;
}

function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'bg-dark text-white py-3';
    
    footer.innerHTML = `
        <div class="container text-center">
            <p>&copy; 2025 Cafe Delight Team. All rights reserved.</p>
        </div>
    `;
    
    return footer;
}

function initializeSharedComponents(activePage = '') {
    const header = createHeader(activePage);
    document.body.insertBefore(header, document.body.firstChild);
    
    const footer = createFooter();
    document.body.appendChild(footer);
}

function addBootstrapJS() {
    if (!document.querySelector('script[src*="bootstrap"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
        script.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let activePage = '';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            activePage = 'home';
            break;
        case 'hot-drinks.html':
            activePage = 'hot-drinks';
            break;
        case 'cold-drinks.html':
            activePage = 'cold-drinks';
            break;
        case 'desserts.html':
            activePage = 'desserts';
            break;
        case 'authors.html':
            activePage = 'authors';
            break;
        case 'faq.html':
            activePage = 'faq';
            break;
    }
    
    initializeSharedComponents(activePage);
    addBootstrapJS();
});
