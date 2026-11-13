const STORAGE_KEY = "foodConstructOrder";

const emptyOrder = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null
};


// Получение пустого заказа
function createEmptyOrder() {
    return {
        soup: null,
        main: null,
        salad: null,
        drink: null,
        dessert: null
    };
}


// Сохранение заказа
function saveOrderToStorage(order) {
    const orderIds = {
        soup: order.soup ? order.soup.id : null,
        main: order.main ? order.main.id : null,
        salad: order.salad ? order.salad.id : null,
        drink: order.drink ? order.drink.id : null,
        dessert: order.dessert ? order.dessert.id : null
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(orderIds)
    );
}


// Получение ID из localStorage
function getOrderIdsFromStorage() {
    const savedOrder = localStorage.getItem(STORAGE_KEY);

    if (!savedOrder) {
        return createEmptyOrder();
    }

    try {
        const parsedOrder = JSON.parse(savedOrder);

        return {
            soup: parsedOrder.soup ?? null,
            main: parsedOrder.main ?? null,
            salad: parsedOrder.salad ?? null,
            drink: parsedOrder.drink ?? null,
            dessert: parsedOrder.dessert ?? null
        };
    } catch (error) {
        console.error("Ошибка чтения заказа:", error);
        return createEmptyOrder();
    }
}



function restoreOrderFromStorage(dishes) {
    const savedIds = getOrderIdsFromStorage();
    const restoredOrder = createEmptyOrder();

    Object.keys(restoredOrder).forEach(function(category) {
        const savedId = savedIds[category];

        if (savedId !== null) {
            const dish = dishes.find(function(dish) {
                return String(dish.id) === String(savedId);
            });

            // Проверяем, что категория блюда совпадает
            // с категорией, в которой оно было сохранено
            if (dish && dish.category === category) {
                restoredOrder[category] = dish;
            }
        }
    });

    return restoredOrder;
}


// Удаление блюда из заказа
function removeDishFromStorage(category) {
    const savedIds = getOrderIdsFromStorage();

    if (Object.prototype.hasOwnProperty.call(savedIds, category)) {
        savedIds[category] = null;
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedIds)
    );
}


// Полная очистка заказа
function clearOrderStorage() {
    localStorage.removeItem(STORAGE_KEY);
}