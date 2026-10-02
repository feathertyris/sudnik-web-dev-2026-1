// ============================================================
// render.js
// ЛАБА № 4: сортировка, рендер карточек, выбор блюда,
// обновление формы заказа, скрытые поля, подсветка.
// ЛАБА № 5: добавлены фильтры, новые категории,
// свойство kind, класс active, сохранение заказа,
// обработчик кнопки «Сбросить».
// ЛАБА № 6: рендер вариантов ланчей, рендер блока десертов,
// валидация состава ланча при submit,
// динамическое создание уведомлений.
// ЛАБА № 7: загрузка блюд с API через loadDishes(),
// картинки берутся с GitHub Pages.
// ============================================================

// ============================================================
// ЛАБА № 7: НАСТРОЙКИ КАРТИНОК
// Картинки лежат в репозитории GitHub Pages:
// https://feathertyris.github.io/sudnik-web-dev-2026-1/lab7/images/
// ============================================================

const IMAGE_BASE_URL =
  "https://feathertyris.github.io/sudnik-web-dev-2026-1/lab7/images";

// Соответствие: категория блюда → имя папки с картинками
const IMAGE_FOLDER_BY_CATEGORY = {
  soup: "soups",
  main: "mains",
  salad: "salads",
  drink: "drinks",
  dessert: "desserts"
};

/**
 * Строит абсолютный URL картинки блюда на GitHub Pages.
 * Если у блюда есть абсолютный URL в поле image — использует его.
 * Иначе собирает путь: <base>/<folder>/<keyword>.jpg
 */
function buildImageUrl(dish) {
  if (dish.image && /^https?:\/\//i.test(dish.image)) {
    return dish.image;
  }
  const folder = IMAGE_FOLDER_BY_CATEGORY[dish.category];
  if (!folder) {
    return `${IMAGE_BASE_URL}/placeholder.jpg`;
  }
  return `${IMAGE_BASE_URL}/${folder}/${dish.keyword}.jpg`;
}

/**
 * Возвращает строку для onerror — заглушку.
 */
const PLACEHOLDER_URL = `${IMAGE_BASE_URL}/placeholder.jpg`;

// ============================================================
// ЛАБА № 7: URL API
// ============================================================

const DISHES_API_URL =
  "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";

// ============================================================
// СЛОВАРИ И СОСТОЯНИЕ
// ============================================================

const categoryTitles = {
  soup: "Суп",
  main: "Главное блюдо",
  salad: "Салат или стартер",
  drink: "Напиток",
  dessert: "Десерт"
};

const categoryFilters = {
  soup: [
    { kind: "fish", label: "рыбный" },
    { kind: "meat", label: "мясной" },
    { kind: "veg", label: "вегетарианский" }
  ],
  main: [
    { kind: "fish", label: "рыбное" },
    { kind: "meat", label: "мясное" },
    { kind: "veg", label: "вегетарианское" }
  ],
  salad: [
    { kind: "fish", label: "рыбный" },
    { kind: "meat", label: "мясной" },
    { kind: "veg", label: "вегетарианский" }
  ],
  drink: [
    { kind: "cold", label: "холодный" },
    { kind: "hot", label: "горячий" }
  ],
  dessert: [
    { kind: "small", label: "маленькая порция" },
    { kind: "medium", label: "средняя порция" },
    { kind: "big", label: "большая порция" }
  ]
};

const order = {
  soup: null,
  main: null,
  salad: null,
  drink: null,
  dessert: null
};

const activeFilters = {
  soup: null,
  main: null,
  salad: null,
  drink: null,
  dessert: null
};

// ============================================================
// ЛАБА № 7: ЗАГРУЗКА БЛЮД С API
// ============================================================

async function loadDishes() {
  try {
    const response = await fetch(DISHES_API_URL);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки блюд: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("API вернул данные в неожиданном формате");
    }

    dishes = data;

    dessertKeywords = dishes
      .filter(d => d.category === "dessert")
      .map(d => d.keyword);

    renderFilters();
    renderDishes();
    updateOrderForm();

    renderLunchVariants();
    renderDesserts();
  } catch (error) {
    console.error("Не удалось загрузить блюда:", error);
    showNotification(
      "Ошибка загрузки",
      "Не удалось загрузить список блюд. Проверьте соединение и обновите страницу.",
      []
    );
  }
}

// ============================================================
// ЛАБА № 4: РЕНДЕР КАРТОЧЕК БЛЮД
// ============================================================

function getSortedDishes() {
  return [...dishes].sort((a, b) =>
    a.name.localeCompare(b.name, "ru")
  );
}

function renderDishes() {
  const sorted = getSortedDishes();

  const containers = {
    soup: document.querySelector('[data-category="soup"]'),
    main: document.querySelector('[data-category="main"]'),
    salad: document.querySelector('[data-category="salad"]'),
    drink: document.querySelector('[data-category="drink"]'),
    dessert: document.querySelector('[data-category="dessert"]')
  };

  Object.values(containers).forEach(c => {
    if (c) c.innerHTML = "";
  });

  sorted.forEach(dish => {
    const container = containers[dish.category];
    if (!container) return;

    const currentFilter = activeFilters[dish.category];
    if (currentFilter && dish.kind !== currentFilter) {
      return;
    }

    const card = document.createElement("article");
    card.className = "dish-card";
    card.dataset.dish = dish.keyword;

    const imageSrc = buildImageUrl(dish);

    card.innerHTML = `
      <img src="${imageSrc}" alt="${dish.name}" class="dish-image"
           onerror="this.onerror=null; this.src='${PLACEHOLDER_URL}';">
      <h4 class="dish-name">${dish.name}</h4>
      <p class="dish-count">${dish.count}</p>
      <p class="dish-price">${dish.price} ₽</p>
      <button type="button" class="dish-add">Добавить</button>
    `;

    card.querySelector(".dish-add").addEventListener("click", () => {
      selectDishByKeyword(card.dataset.dish);
    });

    container.appendChild(card);
  });

  updateHighlight();
}

// ============================================================
// ЛАБА № 5: РЕНДЕР ФИЛЬТРОВ
// ============================================================

function renderFilters() {
  const categories = ["soup", "main", "salad", "drink", "dessert"];

  categories.forEach(cat => {
    const container = document.querySelector(`[data-category="${cat}"]`);
    if (!container) return;

    const menuCategory = container.closest(".menu-category");
    if (!menuCategory) return;

    let filterBlock = menuCategory.querySelector(".filters");
    if (!filterBlock) {
      filterBlock = document.createElement("div");
      filterBlock.className = "filters";
      menuCategory.insertBefore(filterBlock, container);
    }

    filterBlock.innerHTML = "";
    const filters = categoryFilters[cat] || [];

    filters.forEach(filter => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn";
      btn.textContent = filter.label;
      btn.dataset.kind = filter.kind;

      if (activeFilters[cat] === filter.kind) {
        btn.classList.add("active");
      }

      btn.addEventListener("click", () => toggleFilter(cat, filter.kind));
      filterBlock.appendChild(btn);
    });
  });
}

function toggleFilter(category, kind) {
  if (activeFilters[category] === kind) {
    activeFilters[category] = null;
  } else {
    activeFilters[category] = kind;
  }

  renderFilters();
  renderDishes();
}

// ============================================================
// ЛАБА № 4: ВЫБОР БЛЮДА И ОБНОВЛЕНИЕ ФОРМЫ ЗАКАЗА
// ============================================================

function selectDishByKeyword(keyword) {
  const dish = dishes.find(d => d.keyword === keyword);
  if (!dish) return;

  order[dish.category] = dish;

  updateOrderForm();
  updateHighlight();
}

function updateOrderForm() {
  const itemsBlock = document.getElementById("order-items");
  const totalBlock = document.getElementById("order-total");
  const totalValue = document.querySelector(".order-total-value");
  const submitBtn = document.getElementById("order-submit");

  if (!itemsBlock) return;

  const hasAny = Object.values(order).some(Boolean);

  if (!hasAny) {
    itemsBlock.innerHTML = '<p class="order-empty-all">Ничего не выбрано</p>';
    if (totalBlock) totalBlock.hidden = true;
    if (submitBtn) submitBtn.disabled = true;
    updateHiddenFields();
    return;
  }

  if (totalBlock) totalBlock.hidden = false;
  if (submitBtn) submitBtn.disabled = false;

  let total = 0;
  let html = "";

  for (const key of ["soup", "main", "salad", "drink", "dessert"]) {
    const dish = order[key];

    if (dish) {
      total += dish.price;
      html += `
        <div class="order-item">
          <h4>${categoryTitles[key]}</h4>
          <p>${dish.name} ${dish.price}₽</p>
        </div>
      `;
    } else {
      const emptyText = key === "drink"
        ? "Напиток не выбран"
        : "Блюдо не выбрано";
      html += `
        <div class="order-item order-item-empty">
          <h4>${categoryTitles[key]}</h4>
          <p>${emptyText}</p>
        </div>
      `;
    }
  }

  itemsBlock.innerHTML = html;
  if (totalValue) totalValue.textContent = `${total}₽`;

  updateHiddenFields();
}

function updateHiddenFields() {
  const form = document.getElementById("order-form");
  if (!form) return;

  form.querySelectorAll('input[type="hidden"][data-generated]').forEach(el => el.remove());

  for (const key of ["soup", "main", "salad", "drink", "dessert"]) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = order[key] ? order[key].keyword : "";
    input.dataset.generated = "true";
    form.appendChild(input);
  }
}

function updateHighlight() {
  document.querySelectorAll(".dish-card").forEach(card => {
    const keyword = card.dataset.dish;
    const isSelected = Object.values(order).some(
      d => d && d.keyword === keyword
    );
    card.classList.toggle("selected", isSelected);
  });
}

// ============================================================
// ЛАБА № 6: РЕНДЕР ВАРИАНТОВ ЛАНЧЕЙ
// ============================================================

function renderLunchVariants() {
  const container = document.getElementById("variants-grid");
  if (!container) return;

  container.innerHTML = "";

  lunchVariants.forEach(variant => {
    const card = document.createElement("article");
    card.className = "variant-card";
    card.dataset.variantId = variant.id;

    const dishKeys = ["soup", "main", "salad", "drink", "dessert"]
      .map(cat => variant[cat])
      .filter(Boolean);

    let dishesHtml = "";
    dishKeys.forEach(key => {
      const dish = dishes.find(d => d.keyword === key);
      if (!dish) return;

      const imageSrc = buildImageUrl(dish);

      dishesHtml += `
        <div class="variant-dish">
          <img src="${imageSrc}" alt="${dish.name}" class="variant-dish-image"
               onerror="this.onerror=null; this.src='${PLACEHOLDER_URL}';">
          <div class="variant-dish-info">
            <span class="variant-dish-name">${dish.name}</span>
            <span class="variant-dish-price">${dish.price} ₽</span>
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <h3 class="variant-title">${variant.name}</h3>
      <div class="variant-dishes">
        ${dishesHtml}
      </div>
    `;

    container.appendChild(card);
  });
}

// ============================================================
// ЛАБА № 6: РЕНДЕР ОТДЕЛЬНОГО БЛОКА ДЕСЕРТОВ
// ============================================================

function renderDesserts() {
  const container = document.getElementById("desserts-grid");
  if (!container) return;

  container.innerHTML = "";

  const desserts = dishes.filter(d => d.category === "dessert");

  desserts.forEach(dish => {
    const card = document.createElement("article");
    card.className = "dessert-card";
    card.dataset.dish = dish.keyword;

    const imageSrc = buildImageUrl(dish);

    card.innerHTML = `
      <img src="${imageSrc}" alt="${dish.name}" class="dessert-image"
           onerror="this.onerror=null; this.src='${PLACEHOLDER_URL}';">
      <span class="dessert-name">${dish.name}</span>
      <span class="dessert-price">${dish.price} ₽</span>
      <button type="button" class="dessert-add">Добавить</button>
    `;

    card.querySelector(".dessert-add").addEventListener("click", () => {
      selectDishByKeyword(dish.keyword);
    });

    container.appendChild(card);
  });
}

// ============================================================
// ЛАБА № 6: ВАЛИДАЦИЯ СОСТАВА ЛАНЧА
// ============================================================

function isDessertKeyword(keyword) {
  return dessertKeywords.includes(keyword);
}

function findMatchingVariant(selectedKeywords) {
  for (const variant of lunchVariants) {
    const variantKeys = ["soup", "main", "salad", "drink", "dessert"]
      .map(cat => variant[cat])
      .filter(Boolean);

    const allPresent = variantKeys.every(key =>
      selectedKeywords.has(key)
    );

    const extraKeys = [...selectedKeywords].filter(
      key => !variantKeys.includes(key)
    );
    const noExtra = extraKeys.every(key => isDessertKeyword(key));

    if (allPresent && noExtra) {
      return variant;
    }
  }

  return null;
}

function findMissingForClosestVariant(selectedKeywords) {
  let bestVariant = null;
  let bestMissing = null;

  lunchVariants.forEach(variant => {
    const variantKeys = ["soup", "main", "salad", "drink", "dessert"]
      .map(cat => variant[cat])
      .filter(Boolean);

    const missing = variantKeys.filter(
      key => !selectedKeywords.has(key) && !isDessertKeyword(key)
    );

    if (bestMissing === null || missing.length < bestMissing.length) {
      bestMissing = missing;
      bestVariant = variant;
    }
  });

  return { variant: bestVariant, missing: bestMissing || [] };
}

function getMissingDishNames(missingKeys) {
  return missingKeys.map(key => {
    const dish = dishes.find(d => d.keyword === key);
    return dish ? dish.name : key;
  });
}

// ============================================================
// ЛАБА № 6: УВЕДОМЛЕНИЯ
// ============================================================

function showNotification(title, message, missingList) {
  const existing = document.querySelector(".notification-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "notification-overlay";

  let missingHtml = "";
  if (missingList && missingList.length > 0) {
    missingHtml = `
      <ul class="notification-missing">
        ${missingList.map(name => `<li>${name}</li>`).join("")}
      </ul>
    `;
  }

  overlay.innerHTML = `
    <div class="notification-box" role="alertdialog" aria-modal="true">
      <h3 class="notification-title">${title}</h3>
      <p class="notification-text">${message}</p>
      ${missingHtml}
      <button type="button" class="notification-ok">Окей</button>
    </div>
  `;

  overlay.querySelector(".notification-ok").addEventListener("click", () => {
    overlay.remove();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const onEsc = (e) => {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", onEsc);
    }
  };
  document.addEventListener("keydown", onEsc);

  document.body.appendChild(overlay);
}

// ============================================================
// ЛАБА № 6: ОБРАБОТЧИК SUBMIT ФОРМЫ
// ============================================================

function handleOrderSubmit(event) {
  const selectedKeywords = new Set();
  Object.values(order).forEach(dish => {
    if (dish) selectedKeywords.add(dish.keyword);
  });

  if (selectedKeywords.size === 0) {
    event.preventDefault();
    showNotification(
      "Заказ пуст",
      "Добавьте хотя бы одно блюдо в заказ.",
      []
    );
    return;
  }

  const matchedVariant = findMatchingVariant(selectedKeywords);

  if (matchedVariant) {
    return;
  }

  event.preventDefault();

  const { missing } = findMissingForClosestVariant(selectedKeywords);
  const missingNames = getMissingDishNames(missing);

  if (missingNames.length > 0) {
    showNotification(
      "Заказ не соответствует ни одному ланчу",
      "Добавьте недостающие блюда, чтобы оформить заказ:",
      missingNames
    );
  } else {
    showNotification(
      "Заказ не соответствует ни одному ланчу",
      "В заказе есть лишние блюда. Уберите их, чтобы продолжить.",
      []
    );
  }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

const orderFormEl = document.getElementById("order-form");
if (orderFormEl) {
  orderFormEl.addEventListener("submit", handleOrderSubmit);

  orderFormEl.addEventListener("reset", () => {
    Object.keys(order).forEach(key => {
      order[key] = null;
    });
    updateOrderForm();
    updateHighlight();
  });
}

// ЛАБА № 7: сначала загружаем блюда с сервера,
// а затем рендерим меню, варианты ланчей и блок десертов.
loadDishes();