let dishes = [];
let order = createEmptyOrder();

const categoryTitles = {
    soup: "Суп",
    main: "Основное блюдо",
    salad: "Салат",
    drink: "Напиток",
    dessert: "Десерт"
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


// Удаление блюда
function removeDish(category) {
    order[category] = null;

    removeDishFromStorage(category);

    renderOrder();
}


// Создание карточки выбранного блюда
function createOrderDishCard(dish) {
    const card = document.createElement("article");
    card.className = "order-dish-card";

    const image = document.createElement("img");
    image.src = dish.image;
    image.alt = dish.name;
    image.className = "dish-image";

    const name = document.createElement("h4");
    name.className = "dish-name";
    name.textContent = dish.name;

    const count = document.createElement("p");
    count.className = "dish-count";
    count.textContent = dish.count;

    const price = document.createElement("p");
    price.className = "dish-price";
    price.textContent = dish.price + "₽";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "order-remove";
    removeButton.textContent = "Удалить";

    removeButton.addEventListener("click", function() {
        removeDish(dish.category);
    });

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(count);
    card.appendChild(price);
    card.appendChild(removeButton);

    return card;
}


// Обновление строк с составом заказа
function updateOrderSummary() {
    const summary = {
        soup: document.getElementById("summary-soup"),
        main: document.getElementById("summary-main"),
        salad: document.getElementById("summary-salad"),
        drink: document.getElementById("summary-drink"),
        dessert: document.getElementById("summary-dessert")
    };

    Object.keys(summary).forEach(function(category) {
        const dish = order[category];

        if (dish) {
            summary[category].textContent =
                dish.name + " — " + dish.price + "₽";
        } else if (category === "main") {
            summary[category].textContent = "Не выбрано";
        } else {
            summary[category].textContent = "Не выбран";
        }
    });
}


// Обновление всей страницы заказа
function renderOrder() {
    const container = document.getElementById(
        "order-composition-grid"
    );

    const emptyMessage = document.getElementById(
        "order-empty-message"
    );

    const compositionContent = document.getElementById(
        "order-composition-content"
    );

    const formSection = document.getElementById(
        "order-form-section"
    );

    const totalElement = document.getElementById(
        "order-total-value"
    );

    const submitButton = document.getElementById(
        "order-submit"
    );

    container.innerHTML = "";

    const selectedDishes = Object.values(order).filter(Boolean);

    if (selectedDishes.length === 0) {
        emptyMessage.hidden = false;
        compositionContent.hidden = true;
        formSection.hidden = true;
        return;
    }

    emptyMessage.hidden = true;
    compositionContent.hidden = false;
    formSection.hidden = false;

    selectedDishes.forEach(function(dish) {
        container.appendChild(createOrderDishCard(dish));
    });

    totalElement.textContent = calculateTotal() + "₽";

    updateOrderSummary();

    submitButton.disabled = !isOrderComplete();
}


// Переключение поля времени доставки
function setupDeliveryTime() {
    const deliveryRadios = document.querySelectorAll(
        'input[name="delivery_type"]'
    );

    const timeGroup = document.getElementById(
        "delivery-time-group"
    );

    const timeInput = document.getElementById(
        "delivery-time"
    );

    deliveryRadios.forEach(function(radio) {
        radio.addEventListener("change", function() {
            const scheduled = this.value === "by_time";

            timeGroup.hidden = !scheduled;
            timeInput.required = scheduled;

            if (!scheduled) {
                timeInput.value = "";
            }
        });
    });
}


// Проверка времени доставки
function validateDeliveryTime() {
    const deliveryType = document.querySelector(
        'input[name="delivery_type"]:checked'
    ).value;

    if (deliveryType === "now") {
        return true;
    }

    const timeInput = document.getElementById("delivery-time");
    const selectedTime = timeInput.value;

    if (!selectedTime) {
        alert("Укажите время доставки.");
        return false;
    }

    const parts = selectedTime.split(":");
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
        hours < 7 ||
        hours > 23 ||
        (hours === 23 && minutes > 0)
    ) {
        alert("Время доставки должно быть с 7:00 до 23:00.");
        return false;
    }

    if (minutes % 5 !== 0) {
        alert("Выберите время с интервалом в 5 минут.");
        return false;
    }

    const now = new Date();
    const selectedDate = new Date();

    selectedDate.setHours(hours, minutes, 0, 0);

    if (selectedDate <= now) {
        alert("Указанное время уже прошло. Выберите более позднее.");
        return false;
    }

    return true;
}


// Отправка заказа
function handleOrderSubmit(event) {
    event.preventDefault();

    if (!isOrderComplete()) {
        alert(
            "Для оформления заказа выберите суп, основное блюдо, салат и напиток."
        );
        return;
    }

    if (!validateDeliveryTime()) {
        return;
    }

    const form = document.getElementById("order-form");

    if (!form.reportValidity()) {
        return;
    }

    const formData = new FormData(form);

    const deliveryType = formData.get("delivery_type");

    const orderData = {
        full_name: formData.get("full_name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        delivery_address: formData.get("delivery_address"),

        delivery_type: deliveryType,

        delivery_time: deliveryType === "by_time"
            ? formData.get("delivery_time")
            : null,

        comment: formData.get("comment"),

        subscribe: formData.get("subscribe") === "on",

        soup_id: order.soup.id,
        main_course_id: order.main.id,
        salad_id: order.salad.id,
        drink_id: order.drink.id,

        dessert_id: order.dessert
            ? order.dessert.id
            : null,

        total: calculateTotal()
    };

    const submitButton = document.getElementById("order-submit");

    submitButton.disabled = true;
    submitButton.textContent = "Отправка...";

    sendOrder(orderData)
        .then(function(response) {
            console.log("Ответ сервера:", response);

            alert("Заказ успешно отправлен!");

            clearOrderStorage();

            order = createEmptyOrder();

            form.reset();

            const timeGroup = document.getElementById(
                "delivery-time-group"
            );

            const timeInput = document.getElementById(
                "delivery-time"
            );

            timeGroup.hidden = true;
            timeInput.required = false;

            renderOrder();
        })
        .catch(function(error) {
            console.error(error);

            alert(
                "Не удалось отправить заказ. Попробуйте ещё раз."
            );
        })
        .finally(function() {
            submitButton.textContent = "Отправить";
            submitButton.disabled = !isOrderComplete();
        });
}


// Инициализация страницы оформления
function initOrderPage() {
    fetchDishes()
        .then(function(loadedDishes) {
            dishes = loadedDishes;

            order = restoreOrderFromStorage(dishes);

            renderOrder();

            setupDeliveryTime();

            const form = document.getElementById("order-form");

            form.addEventListener("submit", handleOrderSubmit);
        })
        .catch(function(error) {
            console.error(error);

            alert(
                "Не удалось загрузить данные заказа. Попробуйте обновить страницу."
            );
        });
}


initOrderPage();