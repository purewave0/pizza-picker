document.addEventListener('DOMContentLoaded', () => {
    const pizzaElement = document.getElementById('pizza');
    const pizza = new PizzaPicker(pizzaElement);

    pizza.setSlicesAmount(12);
    pizza.setFlavours([
        {color: '#ff0000'},
        {color: '#f0ff0f'},
        {color: '#00ff00'},
    ]);
});
