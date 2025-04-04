document.addEventListener('DOMContentLoaded', () => {
    const pizzaElement = document.getElementById('pizza');
    const pizza = new PizzaBuilder(pizzaElement);

    const SIZE_PREFERENCE_KEY = 'size';
    const SIZE_PREFERENCE_DEFAULT = 'medium';

    const pizzaSizesInfo = {
        'small': {
            slicesAmount: 4,
            maxToppings: 1,
            description: 'Just the right size for a solo pizza night.',
            serving: '1-2',
            toppingPickerText: 'Choose a topping:',
            sliceGapWidth: 6,
            textureSize: 450,
        },
        'medium': {
            slicesAmount: 6,
            maxToppings: 2,
            description: 'Ideal for sharing with friends.',
            serving: '2-3',
            toppingPickerText: 'Choose up to 2 toppings:',
            sliceGapWidth: 5,
            textureSize: 400,
        },
        'large': {
            slicesAmount: 8,
            maxToppings: 2,
            description: 'Perfect for gatherings and satisfying appetites.',
            serving: '3-4',
            toppingPickerText: 'Choose up to 2 toppings:',
            sliceGapWidth: 4,
            textureSize: 350,
        },
        'extra-large': {
            slicesAmount: 12,
            maxToppings: 3,
            description: 'The ultimate choice for big celebrations.',
            serving: '4-6',
            toppingPickerText: 'Choose up to 3 toppings:',
            sliceGapWidth: 4,
            textureSize: 300,
        },
    };

    const sizesParent = document.getElementById('sizes');
    let currentlySelectedSize = null;
    let currentTextureSize = null;
    const toppingsParent = document.getElementById('toppings');
    let currentlySelectedToppings = [];
    let maxPizzaToppings = null;

    pizzaSizeDescription = document.getElementById('pizza-size-description');
    pizzaServingValue = document.getElementById('pizza-serving-value');
    pizzaMaxToppingsValue = document.getElementById('pizza-topping-value');
    toppingPickerText = document.getElementById('topping-text');

    function updatePizzaBySize(size) {
        const sizeInfo = pizzaSizesInfo[size];

        pizzaSizeDescription.textContent = sizeInfo.description;

        pizzaServingValue.textContent = sizeInfo.serving;

        maxPizzaToppings = sizeInfo.maxToppings;
        pizzaMaxToppingsValue.textContent = sizeInfo.maxToppings;


        let toppingText = null;
        if (sizeInfo.maxToppings === 1) {
            toppingText = 'Choose a topping:';
        } else {
            toppingText = `Choose up to ${sizeInfo.maxToppings} toppings:`;
        }
        toppingPickerText.textContent = toppingText;

        // reset toppings
        for (const topping of currentlySelectedToppings) {
            topping.classList.remove('selected');
        }
        currentlySelectedToppings = [];
        toppingsParent.classList.remove('maxed-out');
        updatePizzaTextures([]);

        pizza.setSlicesAmount(sizeInfo.slicesAmount)
        currentTextureSize = sizeInfo.textureSize;
        pizzaElement.dataset.size = size;
        pizza.setSliceGapWidth(sizeInfo.sliceGapWidth);
    }

    let sizePreference = localStorage.getItem(SIZE_PREFERENCE_KEY);
    if (!sizePreference) {
        localStorage.setItem(SIZE_PREFERENCE_KEY, SIZE_PREFERENCE_DEFAULT);
        sizePreference = SIZE_PREFERENCE_DEFAULT;
    }

    for (const size of sizesParent.children) {
        if (size.dataset.size === sizePreference) {
            size.classList.add('selected');
            currentlySelectedSize = size;
        }

        size.addEventListener('click', () => {
            // save preference
            localStorage.setItem(SIZE_PREFERENCE_KEY, size.dataset.size);

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


    async function updatePizzaTextures(textureUrls) {
        if (textureUrls.length === 0) {
            pizza.setToppingTextures(null, 0);
            return;
        }

        pizza.setToppingTextures(textureUrls, currentTextureSize);
    }

    for (const topping of toppingsParent.children) {
        topping.addEventListener('click', () => {
            if (topping.classList.contains('selected')) {
                // deselect
                topping.classList.remove('selected');
                currentlySelectedToppings = currentlySelectedToppings
                    .filter(f => f.dataset.topping !== topping.dataset.topping);

                // in case it was maxed out before
                toppingsParent.classList.remove('maxed-out');

                updatePizzaTextures(
                    currentlySelectedToppings.map(f => f.dataset.textureUrl)
                );
                return;
            }

            const isSingleChoice = maxPizzaToppings === 1;
            if (isSingleChoice) {
                const isMaxedOut =
                    currentlySelectedToppings.length === maxPizzaToppings;
                if (isMaxedOut) {
                    /* when it's single choice and it's maxed out, simply deselect the
                       old one */
                    currentlySelectedToppings[0].classList.remove('selected');
                    currentlySelectedToppings.shift();
                }
            } else {
                const willMaxOut =
                    currentlySelectedToppings.length+1 === maxPizzaToppings;
                if (willMaxOut) {
                    /* when it's single choice and it'll max out, disallow any further
                       selections until at least one of them is deselected */
                    toppingsParent.classList.add('maxed-out');
                }
            }

            currentlySelectedToppings.push(topping);
            topping.classList.add('selected');

            updatePizzaTextures(
                currentlySelectedToppings.map(f => f.dataset.textureUrl)
            );

        });
    }

    updatePizzaBySize(currentlySelectedSize.dataset.size);
    updatePizzaTextures([]);

    function getFullOrder() {
        return {
            size: currentlySelectedSize.dataset.size,
            toppings: currentlySelectedToppings.map(topping => topping.dataset.topping),
        }
    }

    const addToCardButton = document.getElementById('add-to-cart');
    addToCardButton.addEventListener('click', () => {
        const hasSelectedTopping = currentlySelectedToppings.length !== 0;
        if (!hasSelectedTopping) {
            addToCardButton.setCustomValidity('Please select at least 1 topping.');
            addToCardButton.reportValidity();
            return;
        }

        addToCardButton.setCustomValidity('');
        const overview = getFullOrder();
        console.log(overview);
        alert(JSON.stringify(overview));
    });
});
