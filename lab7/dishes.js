// Массив со всеми блюдами, которые загружаются из API
let dishes = [];

// Массив с готовыми вариантами ланчей
let lunchVariants = [];

// Массив с названиями десертов
let dessertKeywords = [];

let order = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null
};

let activeFilters = {
    soup: "all",
    main: "all",
    salad: "all",
    drink: "all",
    dessert: "all"
};

let categoryTitles = {
    soup: "Суп",
    main: "Основное блюдо",
    salad: "Салат",
    drink: "Напиток",
    dessert: "Десерт"
};

// Фильтры для каждой категории
let categoryFilters = {
    soup: ["all", "veg", "meat", "fish"],
    main: ["all", "veg", "meat", "fish"],
    salad: ["all", "veg", "meat", "fish"],
    drink: ["all", "cold", "hot"],
    dessert: ["all", "small", "large"]
};