async function loadFAQs() {
    try {
        const response = await fetch('faq.json');
        if (!response.ok) {
            throw new Error('Failed to load FAQ data');
        }
        const data = await response.json();
        displayFAQs(data); // Use data directly, as faq.json is an array
    } catch (error) {
        console.error('Error loading FAQ data:', error);
        displayFallbackContent();
    }
}

function displayFAQs(faqs) {
    const container = document.getElementById('faqAccordion');
    container.innerHTML = '';

    faqs.forEach((faq, index) => {
        const faqItem = createFAQItem(faq, index);
        container.appendChild(faqItem);
    });
}

function createFAQItem(faq, index) {
    const isFirst = index === 0; // Expand first item by default
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';

    accordionItem.innerHTML = `
        <h2 class="accordion-header" id="heading${index + 1}">
            <button class="accordion-button ${isFirst ? '' : 'collapsed'}" type="button" 
                    data-bs-toggle="collapse" data-bs-target="#collapse${index + 1}" 
                    aria-expanded="${isFirst ? 'true' : 'false'}" 
                    aria-controls="collapse${index + 1}">
                ${faq.question}
            </button>
        </h2>
        <div id="collapse${index + 1}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" 
             aria-labelledby="heading${index + 1}" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
                ${faq.answer}
            </div>
        </div>
    `;

    return accordionItem;
}

function displayFallbackContent() {
    const container = document.getElementById('faqAccordion');
    container.innerHTML = `
        <div class="alert alert-warning text-center">
            <h4>Unable to load FAQ data</h4>
            <p>Please refresh the page or try again later.</p>
            <button class="btn btn-primary mt-2" onclick="loadFAQs()">Try Again</button>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', loadFAQs);