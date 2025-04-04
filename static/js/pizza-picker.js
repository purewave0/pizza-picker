class PizzaPicker {
    #chart;
    #data;
    #slicesAmount;
    #flavours;

    static #COLOR_NO_FLAVOUR_SELECTED = 'rgba(127, 127, 127, 0.7)';

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

    setSliceGapWidth(gapWidth) {
        this.#chart.options.borderWidth = gapWidth;
        this.#chart.update();
    }

    setSlicesAmount(amount) {
        this.#data.datasets[0].data = new Array(amount).fill(1);
        this.#chart.update();
        this.#slicesAmount = amount;
    }

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

    setFlavourTextures(textureUrls, textureSize) {
        if (textureUrls === null) {
            this.#data.datasets[0].backgroundColor =
                new Array(this.#slicesAmount)
                .fill(PizzaPicker.#COLOR_NO_FLAVOUR_SELECTED);
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

        const slicesPerFlavour = this.#slicesAmount / textureUrls.length;
        for (const textureUrl of textureUrls) {
            for (let j=0; j<slicesPerFlavour; j++) {
                const promise = PizzaPicker.#createCanvasPatternFromImageUrl(
                    textureUrl, textureSize
                ).then((canvasPattern) => {
                    this.#data.datasets[0].backgroundColor.push(canvasPattern);
                });

                textureUpdatePromises.push(promise);
            }
        }

        Promise.all(textureUpdatePromises).then(() => {
            this.#chart.update();
        });
    }
}
