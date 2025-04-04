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

    static #COLOR_NO_FLAVOUR_SELECTED = 'rgba(127, 127, 127, 0.7)';

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
     * @param {?Array<string>} textureUrls The array of texture URLs. If null, the whole
     *     pizza's background will be set to a default color.
     * @param {number} textureSize The size, in pixels, for the texture's width and
     *     height.
     */
    setToppingTextures(textureUrls, textureSize) {
        if (textureUrls === null) {
            this.#data.datasets[0].backgroundColor =
                new Array(this.#slicesAmount)
                .fill(PizzaBuilder.#COLOR_NO_FLAVOUR_SELECTED);
            this.#chart.update();
            return;
        }

        if (this.#slicesAmount%textureUrls.length !== 0) {
            throw new Error(
                'amount of slices must be a multiple of the amount of textures'
            );
        }

        this.#data.datasets[0].backgroundColor = [];

        let textureUpdatePromises = [];

        const slicesPerTopping = this.#slicesAmount / textureUrls.length;
        for (const textureUrl of textureUrls) {
            for (let j=0; j<slicesPerTopping; j++) {
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
        });
    }
}
