class PizzaPicker {
    #chart;
    #data;
    #slicesAmount;
    #flavours;

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
                tooltip: false,
            },
        };

        this.#chart = new Chart(target, config);
    }

    setSlicesAmount(amount) {
        this.#data.datasets[0].data = new Array(amount).fill(1);
        this.#chart.update();
        this.#slicesAmount = amount;
    }

    setFlavours(flavours) {
        if (this.#slicesAmount%flavours.length !== 0) {
            throw new Error(
                'amount of slices must be a multiple of the amount of flavours'
            );
        }

        this.#data.datasets[0].colors = [];

        const slicesPerFlavour = this.#slicesAmount / flavours.length;
        for (const flavor of flavours) {
            for (let j=0; j<slicesPerFlavour; j++) {
                this.#data.datasets[0].backgroundColor.push(flavor.color);
            }
        }
        this.#flavours = flavours;

        this.#chart.update();
    }
}
