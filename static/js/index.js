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
            sliceGapWidth: 6,
            textureSize: 450,
        },
        'medium': {
            slicesAmount: 6,
            maxFlavours: 2,
            description: 'Ideal for sharing with friends.',
            serving: 'Serves 2-3 people',
            maxFlavoursText: 'Up to 2 flavours',
            flavourPickerText: 'Choose up to 2 flavours:',
            sliceGapWidth: 5,
            textureSize: 400,
        },
        'large': {
            slicesAmount: 8,
            maxFlavours: 2,
            description: 'Perfect for gatherings and satisfying appetites.',
            serving: 'Serves 3-4 people',
            maxFlavoursText: 'Up to 2 flavours',
            flavourPickerText: 'Choose up to 2 flavours:',
            sliceGapWidth: 4,
            textureSize: 350,
        },
        'extra-large': {
            slicesAmount: 12,
            maxFlavours: 3,
            description: 'The ultimate choice for big celebrations.',
            serving: 'Serves 4-6 people',
            maxFlavoursText: 'Up to 3 flavours',
            flavourPickerText: 'Choose up to 3 flavours:',
            sliceGapWidth: 4,
            textureSize: 300,
        },
    };

    const sizesParent = document.getElementById('sizes');
    let currentlySelectedSize = null;
    let currentTextureSize = null;
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
        updatePizzaTextures([]);

        flavourPickerText.textContent = sizeInfo.flavourPickerText;


        pizza.setSlicesAmount(sizeInfo.slicesAmount)
        currentTextureSize = sizeInfo.textureSize;
        pizzaElement.dataset.size = size;
        pizza.setSliceGapWidth(sizeInfo.sliceGapWidth);
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


    async function updatePizzaTextures(textureUrls) {
        if (textureUrls.length === 0) {
            pizza.setFlavourTextures(null, 0);
            return;
        }

        pizza.setFlavourTextures(textureUrls, currentTextureSize);
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

                updatePizzaTextures(
                    currentlySelectedFlavours.map(f => f.dataset.textureUrl)
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

            updatePizzaTextures(
                currentlySelectedFlavours.map(f => f.dataset.textureUrl)
            );

        });
    }


    updatePizzaBySize(currentlySelectedSize.dataset.size);
    updatePizzaTextures([]);
});
