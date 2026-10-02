// ============================================================
// dishes.js
// Здесь я храню все блюда, которые есть в меню.
// Вынес в отдельный файл, как требовалось в задании.
//
// ЛАБА № 5: добавлено свойство kind (для фильтрации),
// добавлены категории salad и dessert,
// в каждой категории теперь по 6 блюд.
//
// ЛАБА № 6: добавлены варианты ланчей (lunchVariants)
// и список keyword'ов десертов (dessertKeywords).
// ============================================================

// Массив объектов. Каждое блюдо — это объект с полями:
// keyword — латинское название, оно уникально и уходит на сервер
// name — то, что видит пользователь
// price — цена в рублях
// category — категория: soup, main, drink, salad, dessert
// count — вес или объём порции
// image — путь к картинке (без расширения, .jpg добавлю в render.js)
// kind — тип блюда для фильтрации (ЛАБА № 5)

const dishes = [
  // ---------- Супы (6 блюд: 2 рыбных, 2 мясных, 2 вег) ----------
  {
    keyword: "tom_yam",
    name: "Том Ям с креветками",
    price: 365,
    category: "soup",
    count: "300 мл",
    image: "images/soups/tom-yam",
    kind: "fish"
  },
  {
    keyword: "norwegian_soup",
    name: "Норвежский суп",
    price: 270,
    category: "soup",
    count: "300 мл",
    image: "images/soups/norwegian",
    kind: "fish"
  },
  {
    keyword: "gazpacho",
    name: "Гаспачо",
    price: 350,
    category: "soup",
    count: "300 мл",
    image: "images/soups/gazpacho",
    kind: "veg"
  },
  {
    keyword: "mushroom_soup",
    name: "Грибной суп-пюре",
    price: 185,
    category: "soup",
    count: "330 г",
    image: "images/soups/mushroom",
    kind: "veg"
  },
  {
    keyword: "ramen",
    name: "Рамен",
    price: 375,
    category: "soup",
    count: "425 г",
    image: "images/soups/ramen",
    kind: "meat"
  },
  {
    keyword: "chicken_soup",
    name: "Куриный суп",
    price: 330,
    category: "soup",
    count: "350 г",
    image: "images/soups/chicken",
    kind: "meat"
  },

  // ---------- Основные блюда (6 блюд: 2 рыбных, 2 мясных, 2 вег) ----------
  {
    keyword: "lasagna",
    name: "Лазанья",
    price: 385,
    category: "main",
    count: "350 г",
    image: "images/mains/lasagna",
    kind: "meat"
  },
  {
    keyword: "fried_potato_mushrooms",
    name: "Жареная картошка с грибами",
    price: 150,
    category: "main",
    count: "250 г",
    image: "images/mains/potato-mushrooms",
    kind: "veg"
  },
  {
    keyword: "chicken_cutlets_mashed",
    name: "Котлеты из курицы с картофельным пюре",
    price: 225,
    category: "main",
    count: "300 г",
    image: "images/mains/chicken-cutlets",
    kind: "meat"
  },
  {
    keyword: "fish_cutlet_rice",
    name: "Рыбная котлета с рисом и спаржей",
    price: 320,
    category: "main",
    count: "270 г",
    image: "images/mains/fish-cutlet",
    kind: "fish"
  },
  {
    keyword: "pizza_margherita",
    name: "Пицца Маргарита",
    price: 450,
    category: "main",
    count: "470 г",
    image: "images/mains/pizza",
    kind: "veg"
  },
  {
    keyword: "pasta_shrimp",
    name: "Паста с креветками",
    price: 340,
    category: "main",
    count: "280 г",
    image: "images/mains/pasta",
    kind: "fish"
  },

  // ---------- Салаты и стартеры (6 блюд: 1 рыбный, 1 мясной, 4 вег) ----------
  {
    keyword: "korean_salad",
    name: "Корейский салат с овощами и яйцом",
    price: 330,
    category: "salad",
    count: "250 г",
    image: "images/salads/korean",
    kind: "veg"
  },
  {
    keyword: "caesar_chicken",
    name: "Цезарь с цыпленком",
    price: 370,
    category: "salad",
    count: "220 г",
    image: "images/salads/caesar",
    kind: "meat"
  },
  {
    keyword: "caprese",
    name: "Капрезе с моцареллой",
    price: 350,
    category: "salad",
    count: "200 г",
    image: "images/salads/caprese",
    kind: "veg"
  },
  {
    keyword: "tuna_salad",
    name: "Салат с тунцом",
    price: 400,
    category: "salad",
    count: "230 г",
    image: "images/salads/tuna",
    kind: "fish"
  },
  {
    keyword: "greek_salad",
    name: "Греческий салат",
    price: 320,
    category: "salad",
    count: "210 г",
    image: "images/salads/greek",
    kind: "veg"
  },
  {
    keyword: "vegetable_mix",
    name: "Овощной микс",
    price: 290,
    category: "salad",
    count: "180 г",
    image: "images/salads/vegetable-mix",
    kind: "veg"
  },

  // ---------- Напитки (6 блюд: 3 холодных, 3 горячих) ----------
  {
    keyword: "lemonade",
    name: "Лимонад",
    price: 150,
    category: "drink",
    count: "300 мл",
    image: "images/drinks/lemonade",
    kind: "cold"
  },
  {
    keyword: "coffee",
    name: "Кофе",
    price: 200,
    category: "drink",
    count: "200 мл",
    image: "images/drinks/coffee",
    kind: "hot"
  },
  {
    keyword: "orange_juice",
    name: "Апельсиновый сок",
    price: 180,
    category: "drink",
    count: "250 мл",
    image: "images/drinks/orange-juice",
    kind: "cold"
  },
  {
    keyword: "tea",
    name: "Чай",
    price: 100,
    category: "drink",
    count: "300 мл",
    image: "images/drinks/tea",
    kind: "hot"
  },
  {
    keyword: "milkshake",
    name: "Молочный коктейль",
    price: 220,
    category: "drink",
    count: "400 мл",
    image: "images/drinks/milkshake",
    kind: "cold"
  },
  {
    keyword: "cocoa",
    name: "Какао",
    price: 180,
    category: "drink",
    count: "250 мл",
    image: "images/drinks/cocoa",
    kind: "hot"
  },

  // ---------- Десерты (6 блюд: 3 маленьких, 2 средних, 1 большой) ----------
  {
    keyword: "cheesecake",
    name: "Чизкейк",
    price: 250,
    category: "dessert",
    count: "120 г",
    image: "images/desserts/cheesecake",
    kind: "small"
  },
  {
    keyword: "brownie",
    name: "Брауни",
    price: 200,
    category: "dessert",
    count: "100 г",
    image: "images/desserts/brownie",
    kind: "small"
  },
  {
    keyword: "eclair",
    name: "Эклер",
    price: 150,
    category: "dessert",
    count: "80 г",
    image: "images/desserts/eclair",
    kind: "small"
  },
  {
    keyword: "tiramisu",
    name: "Тирамису",
    price: 280,
    category: "dessert",
    count: "150 г",
    image: "images/desserts/tiramisu",
    kind: "medium"
  },
  {
    keyword: "chocolate_cake",
    name: "Шоколадный торт",
    price: 350,
    category: "dessert",
    count: "180 г",
    image: "images/desserts/chocolate",
    kind: "medium"
  },
  {
    keyword: "apple_pie",
    name: "Яблочный пирог",
    price: 300,
    category: "dessert",
    count: "200 г",
    image: "images/desserts/apple-pie",
    kind: "big"
  }
];

// ---------- ЛАБА № 6: ВАРИАНТЫ ЛАНЧЕЙ ----------
// Варианты ланчей (комбо), которые пользователь должен собрать.
// Значения — keyword блюд из массива dishes.
const lunchVariants = [
  {
    id: 1,
    name: "Ланч «Классический»",
    soup: "chicken_soup",
    main: "chicken_cutlets_mashed",
    salad: "caesar_chicken",
    drink: "tea",
    dessert: null
  },
  {
    id: 2,
    name: "Ланч «Рыбный»",
    soup: "norwegian_soup",
    main: "fish_cutlet_rice",
    salad: "tuna_salad",
    drink: "orange_juice",
    dessert: null
  },
  {
    id: 3,
    name: "Ланч «Вегетарианский»",
    soup: "mushroom_soup",
    main: "fried_potato_mushrooms",
    salad: "greek_salad",
    drink: "lemonade",
    dessert: null
  },
  {
    id: 4,
    name: "Ланч «Азиатский»",
    soup: "ramen",
    main: "pasta_shrimp",
    salad: "korean_salad",
    drink: "cocoa",
    dessert: null
  },
  {
    id: 5,
    name: "Ланч «Полный»",
    soup: "gazpacho",
    main: "pizza_margherita",
    salad: "caprese",
    drink: "milkshake",
    dessert: "tiramisu"
  }
];

// Список keyword'ов десертов — чтобы быстро определять,
// является ли блюдо десертом (для отдельного блока).
const dessertKeywords = dishes
  .filter(d => d.category === "dessert")
  .map(d => d.keyword);