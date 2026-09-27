// Заголовки для блока "Ваш заказ". Использую объект, чтобы не писать if/else.
const categoryTitles = {
  soup: "Суп",
  main: "Главное блюдо",
  drink: "Напиток"
};

// Текущий заказ. Храню выбранные блюда по категориям.
// Если null — значит, ничего не выбрано.
const order = {
  soup: null,
  main: null,
  drink: null
};

// ---------- 1. Сортировка блюд по названию ----------
// Вопрос: Почему используем [...]dishes, а не dishes.sort()?
// Ответ: Чтобы не менять исходный массив. sort() мутирует массив, 
// а нам нужно только для отображения отсортировать.
function getSortedDishes() {
  return [...dishes].sort((a, b) =>
    a.name.localeCompare(b.name, "ru")
  );
}

// ---------- 2. Рендер карточек блюд ----------
function renderDishes() {
  const sorted = getSortedDishes();

  // Нахожу контейнеры для каждой категории по data-атрибуту
  const containers = {
    soup: document.querySelector('[data-category="soup"]'),
    main: document.querySelector('[data-category="main"]'),
    drink: document.querySelector('[data-category="drink"]')
  };

  // Очищаю контейнеры перед добавлением (на всякий случай)
  Object.values(containers).forEach(c => {
    if (c) c.innerHTML = "";
  });

  // Перебираю отсортированные блюда и создаю карточки
  sorted.forEach(dish => {
    const container = containers[dish.category];
    if (!container) return;

    const card = document.createElement("article");
    card.className = "dish-card";
    // data-атрибут нужен, чтобы потом найти блюдо в массиве по keyword
    card.dataset.dish = dish.keyword;

    // Внутренняя разметка карточки. Картинку беру из поля image + .jpg
    card.innerHTML = `
      <img src="${dish.image}.jpg" alt="${dish.name}" class="dish-image">
      <h4 class="dish-name">${dish.name}</h4>
      <p class="dish-count">${dish.count}</p>
      <p class="dish-price">${dish.price} ₽</p>
      <button type="button" class="dish-add">Добавить</button>
    `;

    // Вешаю обработчик на кнопку "Добавить"
    card.querySelector(".dish-add").addEventListener("click", () => {
      selectDishByKeyword(card.dataset.dish);
    });

    container.appendChild(card);
  });
}

// ---------- 3. Выбор блюда ----------
// Вопрос: Как мы находим блюдо по data-атрибуту?
// Ответ: В data-dish лежит keyword. Ищем в массиве dishes 
// элемент с таким же keyword через find().
function selectDishByKeyword(keyword) {
  const dish = dishes.find(d => d.keyword === keyword);
  if (!dish) return;

  // Сохраняю блюдо в текущий заказ. Если там уже было блюдо 
  // из этой категории, оно заменяется.
  order[dish.category] = dish;
  
  // Обновляю интерфейс: блок заказа и подсветку карточек
  updateOrderForm();
  updateHighlight();
}

// ---------- 4. Обновление блока "Ваш заказ" ----------
function updateOrderForm() {
  const itemsBlock = document.getElementById("order-items");
  const totalBlock = document.getElementById("order-total");
  const totalValue = document.querySelector(".order-total-value");
  const submitBtn = document.getElementById("order-submit");

  // Проверяю, есть ли хоть что-то в заказе
  const hasAny = Object.values(order).some(Boolean);

  // Если ничего не выбрано — показываю сообщение, скрываю итог и блокирую кнопку
  if (!hasAny) {
    itemsBlock.innerHTML = '<p class="order-empty-all">Ничего не выбрано</p>';
    totalBlock.hidden = true;
    submitBtn.disabled = true;
    updateHiddenFields();
    return;
  }

  // Если есть выбранные блюда — показываю итог и разблокирую кнопку
  totalBlock.hidden = false;
  submitBtn.disabled = false;

  let total = 0;
  let html = "";

  // Прохожу по всем трём категориям в фиксированном порядке
  for (const key of ["soup", "main", "drink"]) {
    const dish = order[key];

    if (dish) {
      // Если блюдо выбрано — добавляю его название и цену
      total += dish.price;
      html += `
        <div class="order-item">
          <h4>${categoryTitles[key]}</h4>
          <p>${dish.name} ${dish.price}₽</p>
        </div>
      `;
    } else {
      // Если не выбрано — пишу "Блюдо не выбрано" или "Напиток не выбран"
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
  totalValue.textContent = `${total}₽`;

  // Обновляю скрытые поля, чтобы при отправке ушли keyword
  updateHiddenFields();
}

// ---------- 5. Скрытые поля с keyword блюд ----------
// Вопрос: Зачем нужны скрытые поля?
// Ответ: По заданию на сервер должны уходить латинские названия (keyword), 
// а не русские имена. Форма отправляет только то, что есть в input'ах.
// Поэтому я создаю скрытые input'ы динамически.
function updateHiddenFields() {
  const form = document.getElementById("order-form");
  if (!form) return;

  // Удаляю старые скрытые поля, чтобы не дублировались
  form.querySelectorAll('input[type="hidden"][data-generated]').forEach(el => el.remove());

  // Создаю новые скрытые поля для каждой категории
  for (const key of ["soup", "main", "drink"]) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = order[key] ? order[key].keyword : "";
    input.dataset.generated = "true";
    form.appendChild(input);
  }
}

// ---------- 6. Подсветка выбранных карточек ----------
// Вопрос: Как работает выделение рамкой?
// Ответ: Добавляю класс .selected той карточке, чей keyword совпадает 
// с выбранным блюдом в заказе. В CSS для .selected прописана рамка.
function updateHighlight() {
  document.querySelectorAll(".dish-card").forEach(card => {
    const keyword = card.dataset.dish;
    const isSelected = Object.values(order).some(
      d => d && d.keyword === keyword
    );
    card.classList.toggle("selected", isSelected);
  });
}

// ---------- Запуск ----------
// Вызываю рендер меню и обновление формы при загрузке скрипта.
// Скрипт подключён в конце body, поэтому DOM уже готов.
renderDishes();
updateOrderForm();