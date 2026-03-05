async function loadDesserts() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        displayDesserts(data.Desserts);
    } catch (error) {
        console.error('Error loading desserts data:', error);
        displayFallbackContent();
    }
}

function displayDesserts(desserts) {
    const container = document.getElementById('desserts-drinks-container');
    container.innerHTML = '';

    desserts.forEach(dessert => {
        const dessertCard = createDessertCard(dessert);
        container.appendChild(dessertCard);
    });
}

function createDessertCard(dessert) {
    const col = document.createElement('div');
    col.className = 'col';

    col.innerHTML = `
        <div class="card h-100">
            <img src="${dessert.image_url}" class="card-img-top" alt="${dessert.alt || dessert.name}">
            <div class="card-body">
                <h5 class="card-title">${dessert.name}</h5>
                <p class="card-text">${dessert.description}</p>
                <p class="card-text"><strong>Price:</strong> $${dessert.price.toFixed(2)}</p>
                <button type="button" class="btn btn-ingredients" data-bs-toggle="modal" data-bs-target="#modal${dessert.id}">Ingredients</button>
            </div>
        </div>
    `;

    createIngredientsModal(dessert);

    return col;
}

function createIngredientsModal(dessert) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = `modal${dessert.id}`;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', `modal${dessert.id}Label`);
    modal.setAttribute('aria-hidden', 'true');

    // ingredients가 문자열인 경우 배열로 변환
    const ingredientsArray = typeof dessert.ingredients === 'string' 
        ? dessert.ingredients.split(',').map(item => item.trim()) 
        : dessert.ingredients;

    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal${dessert.id}Label">Ingredients - ${dessert.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p><strong>Ingredients:</strong></p>
                    <ul>
                        ${ingredientsArray.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function displayFallbackContent() {
    const container = document.getElementById('desserts-drinks-container');
    container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-warning text-center">
                <h4>Unable to load menu data</h4>
                <p>Please refresh the page or try again later.</p>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', loadDesserts);