document.addEventListener('DOMContentLoaded', () => {
    const pizzaElement = document.getElementById('pizza');
    const pizza = new PizzaPicker(pizzaElement);

    const pizzaSizesInfo = {
        'small': {
            slicesAmount: 4,
            maxFlavours: 1,
            description: 'Just the right size for a solo pizza night.',
            serving: 'Serves 1-2 people',
            maxFlavoursText: 'Single flavour',
            flavourPickerText: 'Choose a flavour:',
        },
        'medium': {
            slicesAmount: 6,
            maxFlavours: 2,
            description: 'Ideal for sharing with friends.',
            serving: 'Serves 2-3 people',
            maxFlavoursText: 'Up to 2 flavours',
            flavourPickerText: 'Choose up to 2 flavours:',
        },
        'large': {
            slicesAmount: 8,
            maxFlavours: 2,
            description: 'Perfect for gatherings and satisfying appetites.',
            serving: 'Serves 3-4 people',
            maxFlavoursText: 'Up to 2 flavours',
            flavourPickerText: 'Choose up to 2 flavours:',
        },
        'extra-large': {
            slicesAmount: 12,
            maxFlavours: 3,
            description: 'The ultimate choice for big celebrations.',
            serving: 'Serves 4-6 people',
            maxFlavoursText: 'Up to 3 flavours',
            flavourPickerText: 'Choose up to 3 flavours:',
        },
    };

    const sizesParent = document.getElementById('sizes');
    let currentlySelectedSize = null;
    const flavoursParent = document.getElementById('flavours');
    let currentlySelectedFlavours = [];
    let maxPizzaFlavours = null;

    pizzaSizeDescription = document.getElementById('pizza-size-description');
    pizzaServing = document.getElementById('pizza-serving');
    pizzaFlavour = document.getElementById('pizza-flavour');
    flavourPickerText = document.getElementById('flavour-text');

    function updatePizzaBySize(size) {
        const sizeInfo = pizzaSizesInfo[size];

        pizzaSizeDescription.textContent = sizeInfo.description;
        pizzaServing.textContent = sizeInfo.serving;

        let flavourInfo = null;
        if (sizeInfo.maxFlavours === 1) {
            flavourInfo = 'Pick 1 flavour.';
        } else {
            flavourInfo = `Pick up to ${sizeInfo.maxFlavours} flavours.`;
        }
        pizzaFlavour.textContent = sizeInfo.maxFlavoursText;
        maxPizzaFlavours = sizeInfo.maxFlavours;

        // reset flavours
        for (const flavour of currentlySelectedFlavours) {
            flavour.classList.remove('selected');
        }
        currentlySelectedFlavours = [];
        flavoursParent.classList.remove('maxed-out');
        updatePizzaFlavours([]);

        flavourPickerText.textContent = sizeInfo.flavourPickerText;

        pizza.setSlicesAmount(sizeInfo.slicesAmount)
    }

    for (const size of sizesParent.children) {
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

    const pizzaFlavoursInfo = {
            // TODO
        'pepperoni': {
        },
        'buffalo-chicken':{
        },
        'margherita': {
        },
        'cheese': {
        },
        'veggie-supreme': {
        },
        'neapolitan': {
        },
        'sausage': {
        },
        'mushrooms': {
        },
    };

    function updatePizzaFlavours(flavours) {
        if (flavours.length === 0) {
            pizza.setFlavours(null);
            return;
        }

        pizza.setFlavours(flavours);
    }

    for (const flavour of flavoursParent.children) {
        flavour.addEventListener('click', () => {
            if (flavour.classList.contains('selected')) {
                // deselect
                flavour.classList.remove('selected');
                currentlySelectedFlavours = currentlySelectedFlavours
                    .filter(f => f.dataset.flavour !== flavour.dataset.flavour);

                // in case it was maxed out before
                flavoursParent.classList.remove('maxed-out');

                updatePizzaFlavours(
                    currentlySelectedFlavours.map(f => f.dataset.color)
                );
                return;
            }

            const isSingleChoice = maxPizzaFlavours === 1;
            if (isSingleChoice) {
                const isMaxedOut =
                    currentlySelectedFlavours.length === maxPizzaFlavours;
                if (isMaxedOut) {
                    /* when it's single choice and it's maxed out, simply deselect the
                       old one */
                    currentlySelectedFlavours[0].classList.remove('selected');
                    currentlySelectedFlavours.shift();
                }
            } else {
                const willMaxOut =
                    currentlySelectedFlavours.length+1 === maxPizzaFlavours;
                if (willMaxOut) {
                    /* when it's single choice and it'll max out, disallow any further
                       selections until at least one of them is deselected */
                    flavoursParent.classList.add('maxed-out');
                }
            }

            currentlySelectedFlavours.push(flavour);
            flavour.classList.add('selected');

            updatePizzaFlavours(currentlySelectedFlavours.map(f => f.dataset.color));
        });
    }

    updatePizzaBySize(currentlySelectedSize.dataset.size);
    updatePizzaFlavours([]);
});
