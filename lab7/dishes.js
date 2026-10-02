// ============================================================
// dishes.js
// ЛАБА № 7: массив dishes больше не хранится локально —
// он загружается с сервера через loadDishes() (см. render.js).
//
// Здесь остаются только:
//   - пустой массив dishes (заполняется API-запросом),
//   - варианты ланчей (lunchVariants) — данные из ТЗ,
//   - dessertKeywords — вычисляется после загрузки блюд.
// ============================================================

// Массив блюд. Заполняется в loadDishes() (render.js).
let dishes = [];

// ---------- ЛАБА № 6: ВАРИАНТЫ ЛАНЧЕЙ ----------
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

// Список keyword'ов десертов. Заполняется после загрузки блюд.
let dessertKeywords = [];