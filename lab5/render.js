// ============================================================
// render.js
// ЛАБА № 4: сортировка, рендер карточек, выбор блюда,
// обновление формы заказа, скрытые поля, подсветка.
// ЛАБА № 5: добавлены фильтры, новые категории,
// свойство kind, класс active, сохранение заказа,
// обработчик кнопки «Сбросить».
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

    card.innerHTML = `
      <img src="${dish.image}.jpg" alt="${dish.name}" class="dish-image">
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

function renderFilters() {
  const categories = ['soup', 'main', 'salad', 'drink', 'dessert'];

  categories.forEach(cat => {
    const container = document.querySelector(`[data-category="${cat}"]`);
    if (!container) return;

    const menuCategory = container.closest('.menu-category');
    if (!menuCategory) return;

    let filterBlock = menuCategory.querySelector('.filters');
    if (!filterBlock) {
      filterBlock = document.createElement('div');
      filterBlock.className = 'filters';
      menuCategory.insertBefore(filterBlock, container);
    }

    filterBlock.innerHTML = '';
    const filters = categoryFilters[cat] || [];

    filters.forEach(filter => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn';
      btn.textContent = filter.label;
      btn.dataset.kind = filter.kind;

      if (activeFilters[cat] === filter.kind) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => toggleFilter(cat, filter.kind));
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

renderFilters();
renderDishes();
updateOrderForm();

// ЛАБА № 5: обработчик кнопки «Сбросить».
// Стандартный reset очистит поля формы, но не тронет
// объект order и блок «Ваш заказ». Поэтому чистим вручную.
const orderForm = document.getElementById("order-form");
if (orderForm) {
  orderForm.addEventListener("reset", () => {
    Object.keys(order).forEach(key => {
      order[key] = null;
    });
    updateOrderForm();
    updateHighlight();
  });
}