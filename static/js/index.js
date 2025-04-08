document.addEventListener('DOMContentLoaded', () => {
    const pizzaElement = document.getElementById('pizza');
    const pizza = new PizzaBuilder(pizzaElement);

    const SIZE_PREFERENCE_KEY = 'size';
    const SIZE_PREFERENCE_DEFAULT = 'medium';

    const pizzaSizesInfo = {
        'mini': {
            slicesAmount: 8,
            maxToppings: 8,
            description: 'Tiny enough to share <i>(you might not want to!)</i>',
            serving: '~½',
            sliceGapWidth: 8,
            textureSize: 650,
            isEasterEgg: true,
        },
        'small': {
            slicesAmount: 4,
            maxToppings: 1,
            description: 'Just the right size for a solo pizza night.',
            serving: '1-2',
            sliceGapWidth: 6,
            textureSize: 450,
        },
        'medium': {
            slicesAmount: 6,
            maxToppings: 2,
            description: 'Ideal for sharing with friends.',
            serving: '2-3',
            sliceGapWidth: 5,
            textureSize: 400,
        },
        'large': {
            slicesAmount: 8,
            maxToppings: 2,
            description: 'Perfect for gatherings and satisfying appetites.',
            serving: '3-4',
            sliceGapWidth: 4,
            textureSize: 350,
        },
        'extra-large': {
            slicesAmount: 12,
            maxToppings: 3,
            description: 'The ultimate choice for big celebrations.',
            serving: '4-6',
            sliceGapWidth: 4,
            textureSize: 300,
        },
        'mega': {
            slicesAmount: 24,
            maxToppings: 8,
            description: '<b>M</b>assive <b>E</b>xtra-<b>G</b>reat <b>A</b>ppetite - you\'ll need to call for backup.',
            serving: '10+',
            sliceGapWidth: 2,
            textureSize: 175,
            isEasterEgg: true,
        }
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

    /**
     * Update the interface (the max. amount of toppings, texts, the pizza itself,
     * etc.) according to the given pizza size.
     *
     * Both the selections in the toppings list and the topping textures displayed on
     * the pizza will be reset.
     *
     * @param {string} size The pizza size, according to the selected size's `data-size`
     *     attribute.
     */
    function updatePizzaBySize(size) {
        const sizeInfo = pizzaSizesInfo[size];

        pizzaSizeDescription.innerHTML = sizeInfo.description;

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

    // store/retrieve size preferences
    let sizePreference = localStorage.getItem(SIZE_PREFERENCE_KEY);
    if (
        !sizePreference
        || pizzaSizesInfo[sizePreference].isEasterEgg
    ) {
        // either first access, or had selected a secret size before (which is hidden
        // now). fall back to the default size
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


    /**
     * Set the pizza's topping texture(s). Their size will follow the current pizza
     * size's texture size.
     *
     * @param {Array<string>} textureUrls The array of texture URLs. If empty, the
     *     whole pizza's background will be set to a default color.
     */
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

    function enableEasterEgg() {
        document.body.classList.add('easter-egg-enabled');
    }

    const easterEgg = {
        lastClickTime: 0,
        clickCount: 0,
        // max. milliseconds between clicks to count towards enabling the easter egg
        MAXIMUM_CLICK_INTERVAL: 700,
        // min. amount of clicks (obeying the interval above) to enable the easter egg
        CLICK_THRESHOLD: 5,
        hint: document.getElementById('hint-easter-egg'),
        HINT_DURATION: 5_000,
    };

    function easterEggClickHandler() {
        const now = new Date();

        const clickedWithinInterval =
            (now - easterEgg.lastClickTime) <= easterEgg.MAXIMUM_CLICK_INTERVAL;
        easterEgg.lastClickTime = now;

        if (!clickedWithinInterval) {
            // user took too long between clicks. reset count
            easterEgg.clickCount = 1;
            return;
        }

        ++easterEgg.clickCount;
        if (easterEgg.clickCount === easterEgg.CLICK_THRESHOLD) {
            enableEasterEgg();
            pizzaElement.removeEventListener('click', easterEggClickHandler);
        }
    }


    /**
     * Show for @{link easterEgg.HINT_DURATION} milliseconds a hint about how to enable
     * the easter egg.
     *
     * Since this hint is linked to the Order modal, the modal must be open for the hint
     * to be displayed.
     */
    function hintAboutEasterEgg() {
        easterEgg.hint.classList.add('show');
        setTimeout(() => {
            easterEgg.hint.classList.remove('show');
        }, easterEgg.HINT_DURATION);
    }

    pizzaElement.addEventListener('click', easterEggClickHandler);

    updatePizzaBySize(currentlySelectedSize.dataset.size);
    updatePizzaTextures([]);

    /**
     * Return the full order. The size and at least 1 topping must be selected before
     * calling this.
     *
     * @return {Object} The order, with the following fields:
     *
     * - `size` {string}: the pizza's size, according to the selected size's data-size
     *     attribute.
     * - `toppings` {Array<string>}: an array with each topping's name, according to
     *     the selected topping's data-topping attribute.
     */
    function getFullOrder() {
        return {
            size: currentlySelectedSize.dataset.size,
            toppings: currentlySelectedToppings.map(topping => topping.dataset.topping),
        }
    }

    const jsonOrderOutput = document.getElementById('order-json');
    const JSON_INDENTATION = 4;

    /**
     * Show the Order modal, which displays a pretty-printed JSON of the user's order,
     * along with some GitHub links.
     *
     * @param {Object} order The order. See @{link getFullOrder}.
     */
    function showOrderModal(order) {
        const stringifiedOrder = JSON.stringify(
            order, null, JSON_INDENTATION
        );
        // extremely basic "highlighting"; just the keys
        const highlightedOrder = stringifiedOrder
            .replace('"size"', '<span class="order-key">"size"</span>')
            .replace('"toppings"', '<span class="order-key">"toppings"</span>')

        jsonOrderOutput.innerHTML = highlightedOrder;
        MicroModal.show('modal-order');
    }

    const addToCardButton = document.getElementById('add-to-cart');
    addToCardButton.addEventListener('click', () => {
        const hasSelectedTopping = currentlySelectedToppings.length !== 0;
        if (!hasSelectedTopping) {
            addToCardButton.setCustomValidity('Please select at least 1 topping.');
            addToCardButton.reportValidity();
            return;
        }

        const currentSizeInfo = pizzaSizesInfo[currentlySelectedSize.dataset.size];
        // the amount of toppings selected must be a divisor of the number of slices.
        // for example, if there are 8 slices, it only supports 1, 2, 4 or 8 toppings
        // (all divisors of 8). so if a user were to choose 5 toppings, they couldn't
        // be evenly divided among 8 slices.
        const isDistributionUneven =
            (currentSizeInfo.slicesAmount % currentlySelectedToppings.length) !== 0;
        if (isDistributionUneven) {
            addToCardButton.setCustomValidity(
                'Please select a number of toppings that can be evenly divided among'
                + ` ${currentSizeInfo.slicesAmount} slices.`
            );
            addToCardButton.reportValidity();
            return;
        }

        addToCardButton.setCustomValidity('');
        const order = getFullOrder();
        showOrderModal(order);

        const hasEnabledEasterEgg =
            document.body.classList.contains('easter-egg-enabled')
        if (!hasEnabledEasterEgg) {
            // wait a little bit (so the user has time to read the modal's contents)
            setTimeout(hintAboutEasterEgg, 4_000);
        }
    });
});
