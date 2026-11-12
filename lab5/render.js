const order = { soup: null, main: null, salad: null, drink: null, dessert: null };
const activeFilters = { soup: null, main: null, salad: null, drink: null, dessert: null };

const categoryTitles = {
  soup: "Суп",
  main: "Главное блюдо",
  salad: "Салат или стартер",
  drink: "Напиток",
  dessert: "Десерт"
};

const categoryFilters = {
  soup: [{ kind: "fish", label: "рыбный" }, { kind: "meat", label: "мясной" }, { kind: "veg", label: "вегетарианский" }],
  main: [{ kind: "fish", label: "рыбное" }, { kind: "meat", label: "мясное" }, { kind: "veg", label: "вегетарианское" }],
  salad: [{ kind: "fish", label: "рыбный" }, { kind: "meat", label: "мясной" }, { kind: "veg", label: "вегетарианский" }],
  drink: [{ kind: "cold", label: "холодный" }, { kind: "hot", label: "горячий" }],
  dessert: [{ kind: "small", label: "маленькая" }, { kind: "medium", label: "средняя" }, { kind: "big", label: "большая" }]
};

function renderDishesAndFilters() {
  const sorted = [...dishes].sort((a, b) => a.name.localeCompare(b.name, "ru"));

  let categories = ["soup", "main", "salad", "drink", "dessert"];

  for (let i = 0; i < categories.length; i = i + 1) {
    let cat = categories[i];

    let container = document.querySelector('[data-category="' + cat + '"]');
    if (container === null) {
      continue;
    }

    let menuCategory = container.closest('.menu-category');
    if (menuCategory === null) {
      continue;
    }

    let filterBlock = menuCategory.querySelector('.filters');
    if (filterBlock === null) {
      filterBlock = document.createElement('div');
      filterBlock.className = 'filters';
      menuCategory.insertBefore(filterBlock, container);
    }

    filterBlock.innerHTML = '';

    let filtersArray = categoryFilters[cat];
    for (let f = 0; f < filtersArray.length; f = f + 1) {
      let filter = filtersArray[f];

      let btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = filter.label;

      if (activeFilters[cat] === filter.kind) {
        btn.className = 'filter-btn active';
      } else {
        btn.className = 'filter-btn';
      }

      btn.addEventListener('click', function () {
        if (activeFilters[cat] === filter.kind) {
          activeFilters[cat] = null;
        } else {
          activeFilters[cat] = filter.kind;
        }
        renderDishesAndFilters();
      });

      filterBlock.appendChild(btn);
    }

    container.innerHTML = '';

    for (let d = 0; d < sorted.length; d = d + 1) {
      let dish = sorted[d];

      if (dish.category !== cat) {
        continue;
      }

      if (activeFilters[cat] !== null) {
        if (dish.kind !== activeFilters[cat]) {
          continue;
        }
      }

      let isSelected = false;
      if (order.soup !== null && order.soup.keyword === dish.keyword) { isSelected = true; }
      if (order.main !== null && order.main.keyword === dish.keyword) { isSelected = true; }
      if (order.salad !== null && order.salad.keyword === dish.keyword) { isSelected = true; }
      if (order.drink !== null && order.drink.keyword === dish.keyword) { isSelected = true; }
      if (order.dessert !== null && order.dessert.keyword === dish.keyword) { isSelected = true; }

      let card = document.createElement("article");
      if (isSelected === true) {
        card.className = "dish-card selected";
      } else {
        card.className = "dish-card";
      }

      card.innerHTML = 
        '<img src="' + dish.image + '.jpg" alt="' + dish.name + '" class="dish-image">' +
        '<h4 class="dish-name">' + dish.name + '</h4>' +
        '<p class="dish-count">' + dish.count + '</p>' +
        '<p class="dish-price">' + dish.price + ' ₽</p>' +
        '<button type="button" class="dish-add">Добавить</button>';

      let addButton = card.querySelector(".dish-add");
      addButton.addEventListener("click", function () {
        order[cat] = dish;
        updateInterface();
        renderDishesAndFilters();
      });

      container.appendChild(card);
    }
  }
}

function updateInterface() {
  let itemsBlock = document.getElementById("order-items");
  let totalBlock = document.getElementById("order-total");
  let submitBtn = document.getElementById("order-submit");
  let form = document.getElementById("order-form");

  if (itemsBlock === null) {
    return;
  }

  let hasAny = false;
  if (order.soup !== null || order.main !== null || order.salad !== null || order.drink !== null || order.dessert !== null) {
    hasAny = true;
  }

  if (hasAny === false) {
    itemsBlock.innerHTML = '<p class="order-empty-all">Ничего не выбрано</p>';
    if (totalBlock !== null) { totalBlock.hidden = true; }
    if (submitBtn !== null) { submitBtn.disabled = true; }
    
    if (form !== null) {
      let hiddenInputs = form.querySelectorAll('input[type="hidden"]');
      for (let i = 0; i < hiddenInputs.length; i = i + 1) {
        hiddenInputs[i].remove();
      }
    }
    return;
  }

  if (totalBlock !== null) { totalBlock.hidden = false; }
  if (submitBtn !== null) { submitBtn.disabled = false; }

  let total = 0;
  let html = "";

  if (form !== null) {
    let hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    for (let i = 0; i < hiddenInputs.length; i = i + 1) {
      hiddenInputs[i].remove();
    }
  }

  let categories = ["soup", "main", "salad", "drink", "dessert"];
  for (let i = 0; i < categories.length; i = i + 1) {
    let key = categories[i];
    let dish = order[key];

    if (dish !== null) {
      total = total + dish.price;
      
      html = html + 
        '<div class="order-item">' +
          '<h4>' + categoryTitles[key] + '</h4>' +
          '<p>' + dish.name + ' ' + dish.price + '₽</p>' +
        '</div>';

      if (form !== null) {
        let input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = dish.keyword;
        form.appendChild(input);
      }
    } else {
      let emptyText = "Блюдо не выбрано";
      if (key === "drink") {
        emptyText = "Напиток не выбран";
      }

      html = html + 
        '<div class="order-item order-item-empty">' +
          '<h4>' + categoryTitles[key] + '</h4>' +
          '<p>' + emptyText + '</p>' +
        '</div>';
    }
  }

  itemsBlock.innerHTML = html;

  let totalValue = document.querySelector(".order-total-value");
  if (totalValue !== null) {
    totalValue.textContent = total + "₽";
  }
}

const orderForm = document.getElementById("order-form");
if (orderForm !== null) {
  orderForm.addEventListener("reset", function () {
    order.soup = null;
    order.main = null;
    order.salad = null;
    order.drink = null;
    order.dessert = null;

    updateInterface();
    renderDishesAndFilters();
  });
}

renderDishesAndFilters();
updateInterface();
