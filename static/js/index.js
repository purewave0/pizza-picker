document.addEventListener('DOMContentLoaded', () => {
    const pizzaElement = document.getElementById('pizza');
    const pizza = new PizzaPicker(pizzaElement);

    const pizzaSizeInfo = {
        'small': {
            slicesAmount: 4,
            maxFlavours: 1,
            description: 'Just the right size for a solo pizza night.',
            serving: 'Serves 1-2 people',
        },
        'medium': {
            slicesAmount: 6,
            maxFlavours: 2,
            description: 'Ideal for sharing with friends.',
            serving: 'Serves 2-3 people',
        },
        'large': {
            slicesAmount: 8,
            maxFlavours: 2,
            description: 'Perfect for gatherings and satisfying appetites.',
            serving: 'Serves 3-4 people',
        },
        'extra-large': {
            slicesAmount: 12,
            maxFlavours: 3,
            description: 'The ultimate choice for big celebrations.',
            serving: 'Serves 4-6 people',
        },
    };

    const sizes = document.getElementById('sizes').children;
    let currentlySelectedSize = null;

    pizzaSizeDescription = document.getElementById('pizza-size-description');
    pizzaServing = document.getElementById('pizza-serving');
    pizzaFlavour = document.getElementById('pizza-flavour');

    function updatePizzaBySize(size) {
        const sizeInfo = pizzaSizeInfo[size];

        pizzaSizeDescription.textContent = sizeInfo.description;
        pizzaServing.textContent = sizeInfo.serving;

        let flavourInfo = null;
        if (sizeInfo.maxFlavours === 1) {
            flavourInfo = 'Pick 1 flavour.';
        } else {
            flavourInfo = `Pick up to ${sizeInfo.maxFlavours} flavours.`;
        }
        pizzaFlavour.textContent = flavourInfo;

        pizza.setSlicesAmount(sizeInfo.slicesAmount)
    }

    for (const size of sizes) {
        if (size.classList.contains('selected')) {
            currentlySelectedSize = size;
        }

        size.addEventListener('click', () => {
            if (size.classList.contains('selected')) {
                // nothing to do
                return;
            }

            currentlySelectedSize.classList.remove('selected');
            currentlySelectedSize = size;
            size.classList.add('selected');

            updatePizzaBySize(size.dataset.size);
        });
    }

    updatePizzaBySize(currentlySelectedSize.dataset.size);

    pizza.setFlavours([
        {color: '#ffd94d'},
    ]);
});
