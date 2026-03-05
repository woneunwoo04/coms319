async function loadHotDrinks() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        displayHotDrinks(data.hotDrinks);
    } catch (error) {
        console.error('Error loading hot drinks data:', error);
        displayFallbackContent();
    }
}

function displayHotDrinks(hotDrinks) {
    const container = document.getElementById('hot-drinks-container');
    container.innerHTML = '';

    hotDrinks.forEach(drink => {
        const drinkCard = createDrinkCard(drink);
        container.appendChild(drinkCard);
    });
}

function createDrinkCard(drink) {
    const col = document.createElement('div');
    col.className = 'col';

    col.innerHTML = `
        <div class="card h-100">
            <img src="${drink.image}" class="card-img-top" alt="${drink.alt}">
            <div class="card-body">
                <h5 class="card-title">${drink.name}</h5>
                <p class="card-text">${drink.description}</p>
                <p class="card-text"><strong>Price:</strong> $${drink.price.toFixed(2)}</p>
                <button type="button" class="btn btn-ingredients" data-bs-toggle="modal" data-bs-target="#modal${drink.id}">Ingredients</button>
            </div>
        </div>
    `;

    createIngredientsModal(drink);

    return col;
}

function createIngredientsModal(drink) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = `modal${drink.id}`;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', `modal${drink.id}Label`);
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal${drink.id}Label">Ingredients - ${drink.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p><strong>Ingredients:</strong></p>
                    <ul>
                        ${drink.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
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
    const container = document.getElementById('hot-drinks-container');
    container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-warning text-center">
                <h4>Unable to load menu data</h4>
                <p>Please refresh the page or try again later.</p>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', loadHotDrinks);
