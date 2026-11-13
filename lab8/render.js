let dishes = [];
let order = createEmptyOrder();

const categoryTitles = {
    soup: "Суп",
    main: "Основное блюдо",
    salad: "Салат",
    drink: "Напиток",
    dessert: "Десерт"
};

const categoryFilters = {
    soup: ["all", "veg", "meat", "fish"],
    main: ["all", "veg", "meat", "fish"],
    salad: ["all", "veg", "meat", "fish"],
    drink: ["all", "cold", "hot"],
    dessert: ["all", "small", "large"]
};

const filterTitles = {
    all: "Все",
    veg: "Вегетарианское",
    meat: "Мясное",
    fish: "Рыбное",
    cold: "Холодное",
    hot: "Горячее",
    small: "До 250 ккал",
    large: "Более 250 ккал"
};

let activeFilters = {
    soup: "all",
    main: "all",
    salad: "all",
    drink: "all",
    dessert: "all"
};


// Проверка обязательного набора блюд
function isOrderComplete() {
    return Boolean(
        order.soup &&
        order.main &&
        order.salad &&
        order.drink
    );
}


// Подсчёт общей стоимости
function calculateTotal() {
    return Object.values(order).reduce(function(total, dish) {
        return total + (dish ? dish.price : 0);
    }, 0);
}


// Сохранение и обновление интерфейса
function selectDish(dish) {
    order[dish.category] = dish;

    saveOrderToStorage(order);

    renderDishesAndFilters();
    updateOrderPanel();
}


// Создание фильтров

function createFilters(category) {
    const container = document.querySelector(
        '[data-category="' + category + '"]'
    );

    if (!container) {
        return;
    }

    const menuCategory = container.closest(".menu-category");

    let filters = menuCategory.querySelector(".filters");

    if (!filters) {
        filters = document.createElement("div");
        filters.className = "filters";
        menuCategory.insertBefore(filters, container);
    }

    filters.innerHTML = "";

    // Оставляем только фильтры, для которых есть блюда
    const availableFilters = categoryFilters[category].filter(
        function(filter) {
            if (filter === "all") {
                return true;
            }

            return dishes.some(function(dish) {
                return dish.category === category &&
                    dish.filterType === filter;
            });
        }
    );

    // Если выбранный фильтр больше недоступен,
    // возвращаем фильтр "Все"
    if (!availableFilters.includes(activeFilters[category])) {
        activeFilters[category] = "all";
    }

    availableFilters.forEach(function(filter) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "filter-btn";

        if (activeFilters[category] === filter) {
            button.classList.add("active");
        }

        button.textContent = filterTitles[filter];

        button.addEventListener("click", function() {
            activeFilters[category] = filter;
            renderDishesAndFilters();
        });

        filters.appendChild(button);
    });
}


// Создание карточки блюда
function createDishCard(dish) {
    const card = document.createElement("article");
    card.className = "dish-card";

    if (
        order[dish.category] &&
        order[dish.category].id === dish.id
    ) {
        card.classList.add("selected");
    }

    const image = document.createElement("img");
    image.className = "dish-image";
    image.src = dish.image;
    image.alt = dish.name;
    image.loading = "lazy";

    const name = document.createElement("h4");
    name.className = "dish-name";
    name.textContent = dish.name;

    const count = document.createElement("p");
    count.className = "dish-count";
    count.textContent = dish.count;

    const price = document.createElement("p");
    price.className = "dish-price";
    price.textContent = dish.price + "₽";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "dish-add";

    button.textContent =
        order[dish.category] &&
        order[dish.category].id === dish.id
            ? "Выбрано"
            : "Добавить";

    button.addEventListener("click", function() {
        selectDish(dish);
    });

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(count);
    card.appendChild(price);
    card.appendChild(button);

    return card;
}


// Отображение блюд и фильтров
function renderDishesAndFilters() {
    const categories = [
        "soup",
        "main",
        "salad",
        "drink",
        "dessert"
    ];

    categories.forEach(function(category) {
        const container = document.querySelector(
            '[data-category="' + category + '"]'
        );

        if (!container) {
            return;
        }

        createFilters(category);

        container.innerHTML = "";

        const categoryDishes = dishes.filter(function(dish) {
            if (dish.category !== category) {
                return false;
            }

            if (activeFilters[category] === "all") {
                return true;
            }

            return dish.filterType === activeFilters[category];
        });

        categoryDishes.forEach(function(dish) {
            container.appendChild(createDishCard(dish));
        });

        if (categoryDishes.length === 0) {
            container.innerHTML =
                '<p class="no-dishes">Блюда этой категории пока отсутствуют.</p>';
        }
    });
}


// Создание вариантов ланчей
function renderLunchVariants() {
    const container = document.getElementById("variants-grid");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const soups = dishes.filter(dish => dish.category === "soup");
    const mains = dishes.filter(dish => dish.category === "main");
    const salads = dishes.filter(dish => dish.category === "salad");
    const drinks = dishes.filter(dish => dish.category === "drink");

    const variantsCount = Math.min(
        3,
        soups.length,
        mains.length,
        salads.length,
        drinks.length
    );

    for (let i = 0; i < variantsCount; i++) {
        const variant = [
            soups[i],
            mains[i],
            salads[i],
            drinks[i]
        ];

        const card = document.createElement("article");
        card.className = "variant-card";

        const title = document.createElement("h3");
        title.textContent = "Вариант ланча " + (i + 1);

        const list = document.createElement("ul");

        variant.forEach(function(dish) {
            const item = document.createElement("li");
            item.textContent = dish.name;
            list.appendChild(item);
        });

        const price = variant.reduce(function(total, dish) {
            return total + dish.price;
        }, 0);

        const priceText = document.createElement("p");
        priceText.className = "dish-price";
        priceText.textContent = "Стоимость: " + price + "₽";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "dish-add";
        button.textContent = "Выбрать ланч";

        button.addEventListener("click", function() {
            order.soup = variant[0];
            order.main = variant[1];
            order.salad = variant[2];
            order.drink = variant[3];

            saveOrderToStorage(order);

            renderDishesAndFilters();
            updateOrderPanel();
        });

        card.appendChild(title);
        card.appendChild(list);
        card.appendChild(priceText);
        card.appendChild(button);

        container.appendChild(card);
    }

    if (variantsCount === 0) {
        container.innerHTML =
            '<p>Готовые варианты ланчей пока недоступны.</p>';
    }
}


// Отображение десертов
function renderDesserts() {
    const container = document.getElementById("desserts-grid");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const desserts = dishes.filter(function(dish) {
        return dish.category === "dessert";
    });

    desserts.forEach(function(dish) {
        container.appendChild(createDishCard(dish));
    });

    if (desserts.length === 0) {
        container.innerHTML =
            '<p>Десерты пока недоступны.</p>';
    }
}


// Обновление sticky-панели
function updateOrderPanel() {
    const panel = document.getElementById("order-panel");
    const total = document.getElementById("panel-total");
    const link = document.getElementById("go-to-order");

    if (!panel || !total || !link) {
        return;
    }

    const hasDishes = Object.values(order).some(Boolean);

    panel.hidden = !hasDishes;

    total.textContent = calculateTotal() + "₽";

    if (isOrderComplete()) {
        link.classList.remove("disabled");
        link.removeAttribute("aria-disabled");
        link.href = "order.html";
    } else {
        link.classList.add("disabled");
        link.setAttribute("aria-disabled", "true");
        link.href = "#lunch";
    }
}


// Загрузка главной страницы
function initMainPage() {
    fetchDishes()
        .then(function(loadedDishes) {
            dishes = loadedDishes;

            order = restoreOrderFromStorage(dishes);

            renderDishesAndFilters();
            renderLunchVariants();
            renderDesserts();
            updateOrderPanel();
        })
        .catch(function(error) {
            console.error(error);
            alert("Не удалось загрузить блюда. Попробуйте позже.");
        });
}


// Запуск только на главной странице
if (document.querySelector("[data-category]")) {
    initMainPage();
}