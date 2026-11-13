function convertRecipe(recipe, category, index) {
    let dish = {};

    dish.name = recipe.name;
    dish.image = recipe.image;
    dish.category = category;

    dish.price = Math.round(recipe.caloriesPerServing / 2);

    if (dish.price < 50) {
        dish.price = 50;
    }

    if (category === "drink") {
        dish.count = "300 мл";
    } else {
        dish.count = "250 г";
    }

    let ingredientsList = recipe.ingredients || [];
    let ingredients = ingredientsList.join(" ").toLowerCase();

    if (
        ingredients.includes("fish") ||
        ingredients.includes("salmon") ||
        ingredients.includes("shrimp") ||
        ingredients.includes("tuna") ||
        ingredients.includes("cod")
    ) {
        dish.kind = "fish";
    } else if (
        ingredients.includes("chicken") ||
        ingredients.includes("beef") ||
        ingredients.includes("pork") ||
        ingredients.includes("meat") ||
        ingredients.includes("lamb")
    ) {
        dish.kind = "meat";
    } else {
        dish.kind = "veg";
    }

    if (category === "drink") {
        if (index % 2 === 0) {
            dish.kind = "cold";
        } else {
            dish.kind = "hot";
        }
    }

    if (category === "dessert") {
        if (index % 2 === 0) {
            dish.kind = "small";
        } else {
            dish.kind = "large";
        }
    }

    return dish;
}


// Загружаем блюда из API
function loadDishes() {
    fetch("https://dummyjson.com/recipes?limit=30")
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Ошибка загрузки блюд");
            }

            return response.json();
        })
        .then(function(data) {
            dishes = [];
            dessertKeywords = [];

            for (let i = 0; i < data.recipes.length; i++) {
                let recipe = data.recipes[i];

                // Определяем категорию по данным рецепта
                let category = getRecipeCategory(recipe);

                let dish = convertRecipe(recipe, category, i);

                dishes.push(dish);

                if (category === "dessert") {
                    dessertKeywords.push(dish.name);
                }

                // Выводим результат сортировки в консоль
                console.log(dish.name + " — " + category);
            }

            createLunchVariants();
            renderDishesAndFilters();
            renderLunchVariants();
            renderDesserts();
            updateInterface();
        })
        .catch(function(error) {
            console.log("Ошибка загрузки блюд:", error);
            alert("Не удалось загрузить блюда");
        });
}

function createLunchVariants() {
    lunchVariants = [];

    for (let i = 0; i < 3; i++) {
        let soup = getDishByCategory("soup", i);
        let main = getDishByCategory("main", i);
        let salad = getDishByCategory("salad", i);
        let drink = getDishByCategory("drink", i);

        if (soup !== null && main !== null && salad !== null && drink !== null) {
            let variant = {
                name: "Ланч №" + (i + 1),
                soup: soup,
                main: main,
                salad: salad,
                drink: drink,
                price: soup.price + main.price + salad.price + drink.price
            };

            lunchVariants.push(variant);
        }
    }
}


function getDishByCategory(category, number) {
    let currentNumber = 0;

    for (let i = 0; i < dishes.length; i++) {
        if (dishes[i].category === category) {
            if (currentNumber === number) {
                return dishes[i];
            }

            currentNumber++;
        }
    }

    return null;
}


function getFilterTitle(filterName) {
    if (filterName === "all") return "Все";
    if (filterName === "veg") return "Вегетарианские";
    if (filterName === "meat") return "Мясные";
    if (filterName === "fish") return "Рыбные";
    if (filterName === "cold") return "Холодные";
    if (filterName === "hot") return "Горячие";
    if (filterName === "small") return "Маленькие";
    if (filterName === "large") return "Большие";

    return filterName;
}


function createDishCard(dish, category) {
    let card = document.createElement("div");
    card.className = "dish-card";

    let image = document.createElement("img");
    image.src = dish.image;
    image.alt = dish.name;
    image.className = "dish-image";

    image.onerror = function() {
        this.onerror = null;
        this.src = "https://placehold.co/400x300?text=No+Image";
    };

    let name = document.createElement("h4");
    name.className = "dish-name";
    name.textContent = dish.name;

    let count = document.createElement("p");
    count.className = "dish-count";
    count.textContent = dish.count;

    let price = document.createElement("p");
    price.className = "dish-price";
    price.textContent = dish.price + " ₽";

    let button = document.createElement("button");
    button.type = "button";
    button.className = "dish-add";
    button.textContent = "Добавить";

    button.addEventListener("click", function() {
        order[category] = dish;
        updateInterface();
        renderDishesAndFilters();
    });

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(count);
    card.appendChild(price);
    card.appendChild(button);

    return card;
}


function renderDishesAndFilters() {
    let categories = ["soup", "main", "salad", "drink", "dessert"];

    for (let i = 0; i < categories.length; i++) {
        let category = categories[i];

        let container = document.querySelector('[data-category="' + category + '"]');
        if (container === null) {
            continue;
        }

        let menuCategory = container.closest(".menu-category");
        if (menuCategory === null) {
            continue;
        }

        let filters = menuCategory.querySelector(".filters");
        if (filters === null) {
            filters = document.createElement("div");
            filters.className = "filters";
            menuCategory.insertBefore(filters, container);
        }

        filters.innerHTML = "";

        for (let j = 0; j < categoryFilters[category].length; j++) {
            let filterName = categoryFilters[category][j];

            let filterButton = document.createElement("button");
            filterButton.type = "button";
            filterButton.className = "filter-btn";
            filterButton.textContent = getFilterTitle(filterName);

            if (activeFilters[category] === filterName) {
                filterButton.classList.add("active");
            }

            filterButton.addEventListener("click", function() {
                activeFilters[category] = filterName;
                renderDishesAndFilters();
            });

            filters.appendChild(filterButton);
        }

        container.innerHTML = "";

        for (let j = 0; j < dishes.length; j++) {
            let dish = dishes[j];

            if (dish.category !== category) {
                continue;
            }

            if (
                activeFilters[category] !== "all" &&
                dish.kind !== activeFilters[category]
            ) {
                continue;
            }

            let card = createDishCard(dish, category);

            if (order[category] !== null && order[category].name === dish.name) {
                card.classList.add("selected");
            }

            container.appendChild(card);
        }
    }
}


function renderLunchVariants() {
    let container = document.getElementById("variants-grid");

    if (container === null) {
        return;
    }

    container.innerHTML = "";

    for (let i = 0; i < lunchVariants.length; i++) {
        let variant = lunchVariants[i];
        let card = document.createElement("div");
        card.className = "variant-card";

        let title = document.createElement("h3");
        title.className = "variant-title";
        title.textContent = variant.name;

        let description = document.createElement("p");
        description.textContent =
            variant.soup.name + ", " +
            variant.main.name + ", " +
            variant.salad.name + ", " +
            variant.drink.name;

        let price = document.createElement("p");
        price.textContent = "Цена: " + variant.price + " ₽";

        let button = document.createElement("button");
        button.type = "button";
        button.className = "dish-add";
        button.textContent = "Выбрать ланч";

        button.addEventListener("click", function() {
            order.soup = variant.soup;
            order.main = variant.main;
            order.salad = variant.salad;
            order.drink = variant.drink;
            updateInterface();
            renderDishesAndFilters();
        });

        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(price);
        card.appendChild(button);

        container.appendChild(card);
    }
}


function renderDesserts() {
    let container = document.getElementById("desserts-grid");

    if (container === null) {
        return;
    }

    container.innerHTML = "";

    for (let i = 0; i < dishes.length; i++) {
        let dish = dishes[i];

        if (dish.category === "dessert") {
            let card = createDishCard(dish, "dessert");
            container.appendChild(card);
        }
    }
}


function updateInterface() {
    let orderItems = document.getElementById("order-items");
    let orderTotal = document.getElementById("order-total");
    let totalValue = document.querySelector(".order-total-value");
    let submitButton = document.getElementById("order-submit");

    if (orderItems === null || orderTotal === null || totalValue === null) {
        return;
    }

    orderItems.innerHTML = "";

    let total = 0;
    let selectedCount = 0;
    let categories = ["soup", "main", "salad", "drink", "dessert"];

    for (let i = 0; i < categories.length; i++) {
        let category = categories[i];
        let dish = order[category];

        if (dish !== null) {
            selectedCount++;
            total = total + dish.price;

            let item = document.createElement("div");
            item.className = "order-item";

            let title = document.createElement("h4");
            title.textContent = categoryTitles[category];

            let desc = document.createElement("p");
            desc.textContent = dish.name + " — " + dish.price + " ₽";

            item.appendChild(title);
            item.appendChild(desc);

            orderItems.appendChild(item);
        }
    }

    if (selectedCount === 0) {
        let empty = document.createElement("p");
        empty.className = "order-empty-all";
        empty.textContent = "Ничего не выбрано";
        orderItems.appendChild(empty);
    }

    if (selectedCount > 0) {
        orderTotal.hidden = false;
        totalValue.textContent = total + " ₽";
    } else {
        orderTotal.hidden = true;
        totalValue.textContent = "0 ₽";
    }

    let orderIsComplete = true;

    if (order.soup === null) orderIsComplete = false;
    if (order.main === null) orderIsComplete = false;
    if (order.salad === null) orderIsComplete = false;
    if (order.drink === null) orderIsComplete = false;

    if (submitButton !== null) {
        submitButton.disabled = !orderIsComplete;
    }

    let form = document.getElementById("order-form");

    if (form !== null) {
        let oldInputs = form.querySelectorAll(".order-hidden");

        for (let i = 0; i < oldInputs.length; i++) {
            oldInputs[i].remove();
        }

        for (let i = 0; i < categories.length; i++) {
            let category = categories[i];

            if (order[category] !== null) {
                let input = document.createElement("input");
                input.type = "hidden";
                input.name = category;
                input.value = order[category].name;
                input.className = "order-hidden";

                form.appendChild(input);
            }
        }
    }
}


let orderForm = document.getElementById("order-form");

if (orderForm !== null) {
    orderForm.addEventListener("reset", function() {
        order.soup = null;
        order.main = null;
        order.salad = null;
        order.drink = null;
        order.dessert = null;

        updateInterface();
        renderDishesAndFilters();
    });
}

if (orderForm !== null) {
    orderForm.addEventListener("submit", function(event) {
        if (
            order.soup === null ||
            order.main === null ||
            order.salad === null ||
            order.drink === null
        ) {
            event.preventDefault();

            alert("Пожалуйста, выберите суп, основное блюдо, салат и напиток.");
        }
    });
}

function getRecipeCategory(recipe) {
    let name = recipe.name.toLowerCase();
    let tags = recipe.tags.join(" ").toLowerCase();
    let mealType = recipe.mealType.join(" ").toLowerCase();

    // Пицца всегда относится к основным блюдам
    if (name.includes("pizza")) {
        return "main";
    }

    // Напитки
    if (
        mealType.includes("beverage") ||
        name.includes("lassi") ||
        name.includes("smoothie") ||
        name.includes("caipirinha") ||
        tags.includes("cocktail")
    ) {
        return "drink";
    }

    // Десерты
    if (
        mealType.includes("dessert") ||
        tags.includes("dessert") ||
        name.includes("tiramisu") ||
        name.includes("cookies") ||
        name.includes("cake") ||
        name.includes("brownie")
    ) {
        return "dessert";
    }

    // Супы
    if (
        tags.includes("soup") ||
        name.includes("soup") ||
        name.includes("borscht")
    ) {
        return "soup";
    }

    // Салаты
    if (
        tags.includes("salad") ||
        name.includes("salad") ||
        name.includes("bruschetta") ||
        mealType.includes("appetizer")
    ) {
        return "salad";
    }

    // Остальные блюда относятся к основным
    return "main";
}

loadDishes();