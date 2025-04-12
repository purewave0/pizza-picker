/**
 * Allows viewing and customizing a pizza. Customizable aspects include:
 *
 * - amount of slices
 * - slices' gap width
 * - topping image textures
 */
class PizzaBuilder {
    #chart;
    #data;
    #slicesAmount;

    static #PLACEHOLDER_SLICE_COLOR = 'rgba(127, 127, 127, 0.7)';

    /**
     * @param {Node} target The target element. Must be a Canvas.
     */
    constructor(target) {
        this.#data = {
            datasets: [{
                data: [],
            }],
        }

        const config = {
            type: 'pie',
            data: this.#data,
            options: {
                animation: false,
                legend: false,
                events: [],
                borderWidth: 6,
                borderColor: 'white',
            },
        };

        this.#chart = new Chart(target, config);
    }

    /**
     * Set the width, in pixels, of the gap between each slice.
     */
    setSliceGapWidth(gapWidth) {
        this.#chart.options.borderWidth = gapWidth;
        this.#chart.update();
    }

    /**
     * Set the amount of slices. Each slice will be of equal size.
     */
    setSlicesAmount(amount) {
        this.#data.datasets[0].data = new Array(amount).fill(1);
        this.#chart.update();
        this.#slicesAmount = amount;
    }

    /**
     * Return a CanvasPattern of the given size out of the given URL. This is meant to
     * be used when setting the "backgroundColor" of the underlying chart, as ChartJS
     * allows setting CanvasPatterns as the chart background.
     *
     * @param {string} imageURL The URL to the image.
     * @param {number} size The size, in pixels, for the CanvasPattern's width and
     *     height.
     */
    static #createCanvasPatternFromImageUrl(imageUrl, size) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;

            let ctx = canvas.getContext('2d');

            const image = new Image();
            image.src = imageUrl;

            image.onload = function() {
                ctx.drawImage(image, 0, 0, size, size);

                const pattern = ctx.createPattern(canvas, 'repeat');
                resolve(pattern);
            };
        });
    }

    /**
     * Set the pizza's topping texture(s). If more than 1 texture is given, the amount
     * of slices must be a multiple of the amount of textures. This ensures that each
     * topping is distributed evenly across the number of slices.
     *
     * While textures are loading, the `loading-pizza-textures` class will be appended
     * to the document body.
     *
     * @param {?Array<string>} textureUrls The array of texture URLs. If null, the whole
     *     pizza's background will be set to a placeholder color.
     * @param {number} textureSize The size, in pixels, for the texture's width and
     *     height.
     */
    setToppingTextures(textureUrls, textureSize) {
        if (textureUrls === null) {
            this.#data.datasets[0].backgroundColor =
                new Array(this.#slicesAmount)
                .fill(PizzaBuilder.#PLACEHOLDER_SLICE_COLOR);
            this.#chart.update();
            return;
        }

        // cloning as we may need to pad it if topping distribution is unequal
        const urls = textureUrls.slice();

        if ((this.#slicesAmount % urls.length) !== 0) {
            // unequal topping distribution. pad with null, so there'll be 1 topping per
            // slice, and the remaining (null) slices will be placeholders.
            const remainingAmount = this.#slicesAmount - urls.length;
            for (let i=0; i<remainingAmount; i++) {
                urls.push(null);
            }
        }

        this.#data.datasets[0].backgroundColor = [];

        let textureUpdatePromises = [];

        document.body.classList.add('loading-pizza-textures');
        const slicesPerTopping = this.#slicesAmount / urls.length;
        for (const textureUrl of urls) {
            for (let j=0; j<slicesPerTopping; j++) {
                if (textureUrl === null) {
                    this.#data.datasets[0].backgroundColor.push(
                        PizzaBuilder.#PLACEHOLDER_SLICE_COLOR
                    );
                    continue;
                }

                const promise = PizzaBuilder.#createCanvasPatternFromImageUrl(
                    textureUrl, textureSize
                ).then((canvasPattern) => {
                    this.#data.datasets[0].backgroundColor.push(canvasPattern);
                });

                textureUpdatePromises.push(promise);
            }
        }

        // update once all textures load
        Promise.all(textureUpdatePromises).then(() => {
            this.#chart.update();
            document.body.classList.remove('loading-pizza-textures');
        });
    }
}
