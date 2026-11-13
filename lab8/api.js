
const API_URL = "https://dummyjson.com/recipes?limit=30";
const ORDER_API_URL = "https://jsonplaceholder.typicode.com/posts";

// Определяем категорию блюда по данным рецепта
function getRecipeCategory(recipe) {
    const tags = Array.isArray(recipe.tags)
        ? recipe.tags.map(tag => tag.toLowerCase())
        : [];

    const mealTypes = Array.isArray(recipe.mealType)
        ? recipe.mealType.map(type => type.toLowerCase())
        : [];

    const name = (recipe.name || "").toLowerCase();

    // Напитки
    if (
        mealTypes.includes("beverage") ||
        tags.some(tag =>
            ["smoothie", "lassi", "cocktail"].includes(tag)
        )
    ) {
        return "drink";
    }

    // Десерты
    if (
        mealTypes.includes("dessert") ||
        tags.includes("dessert") ||
        /\b(cookie|cookies|tiramisu|ice cream|cake|brownie|pudding)\b/.test(name)
    ) {
        return "dessert";
    }

    // Супы
    if (
        tags.includes("soup") ||
        /\b(soup|borscht)\b/.test(name)
    ) {
        return "soup";
    }

    // Салаты и закуски
    if (
        tags.some(tag => tag.includes("salad")) ||
        /\bsalad\b/.test(name) ||
        mealTypes.includes("appetizer") ||
        mealTypes.includes("side dish")
    ) {
        return "salad";
    }

    // Остальные блюда относятся к основным
    return "main";
}


// Определяем тип блюда: овощное, мясное или рыбное
function getDishKind(recipe) {
    const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(" ").toLowerCase()
        : "";

    const tags = Array.isArray(recipe.tags)
        ? recipe.tags.join(" ").toLowerCase()
        : "";

    const foodText = (ingredients + " " + tags)
        .replace(/\bfish sauce\b/g, "");

    const fishPattern =
        /\b(fish|salmon|tuna|shrimp|prawn|crab|lobster|cod|tilapia|anchovy|sardine|seafood)\b/;

    const meatPattern =
        /\b(chicken|beef|pork|lamb|mutton|turkey|duck|bacon|ham|sausage|veal)\b/;

    if (fishPattern.test(foodText)) {
        return "fish";
    }

    if (meatPattern.test(foodText)) {
        return "meat";
    }

    return "veg";
}


// Определяем дополнительный фильтр
function getFilterType(recipe, category, kind) {
    const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(" ").toLowerCase()
        : "";

    const instructions = Array.isArray(recipe.instructions)
        ? recipe.instructions.join(" ").toLowerCase()
        : "";

    const name = (recipe.name || "").toLowerCase();

    const recipeText = name + " " + ingredients + " " + instructions;

    // Для напитков
    if (category === "drink") {
        return /\b(ice|iced|chilled|cold|smoothie|lassi|caipirinha)\b/.test(recipeText)
            ? "cold"
            : "hot";
    }

    // Для десертов: делим по калорийности
    if (category === "dessert") {
        const calories = Number(recipe.caloriesPerServing || 200);

        return calories <= 250 ? "small" : "large";
    }

    // Для супов, основных блюд и салатов
    return kind;
}


// Преобразование рецепта в блюдо сайта
function convertRecipe(recipe) {
    const category = getRecipeCategory(recipe);
    const kind = getDishKind(recipe);

    const count = category === "drink"
        ? "300 мл"
        : "250 г";

    const filterType = getFilterType(recipe, category, kind);

    return {
        id: recipe.id,
        name: recipe.name,
        image: recipe.image,
        category: category,

        price: Math.max(
            50,
            Math.round((recipe.caloriesPerServing || 200) / 2)
        ),

        count: count,
        kind: kind,
        filterType: filterType
    };
}


// Получение списка блюд
function fetchDishes() {
    return fetch(API_URL)
        .then(function(response) {
            if (!response.ok) {
                throw new Error(
                    "Ошибка загрузки блюд: " + response.status
                );
            }

            return response.json();
        })
        .then(function(data) {
            if (!Array.isArray(data.recipes)) {
                throw new Error("Некорректный формат данных API");
            }

            return data.recipes.map(function(recipe) {
                return convertRecipe(recipe);
            });
        });
}


// Отправка заказа
function sendOrder(orderData) {
    return fetch(ORDER_API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(orderData)
    })
        .then(function(response) {
            if (!response.ok) {
                throw new Error(
                    "Ошибка отправки заказа: " + response.status
                );
            }

            return response.json();
        });
}
