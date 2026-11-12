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

function getCategories() {
  return ["soup", "main", "salad", "drink", "dessert"];
}

function isDessertKeyword(keyword) {
  for (let i = 0; i < dessertKeywords.length; i = i + 1) {
    if (dessertKeywords[i] === keyword) {
      return true;
    }
  }
  return false;
}

function getVariantKeys(variant) {
  let keys = [];
  let cats = getCategories();
  for (let i = 0; i < cats.length; i = i + 1) {
    if (variant[cats[i]] !== null && variant[cats[i]] !== undefined) {
      keys.push(variant[cats[i]]);
    }
  }
  return keys;
}

function renderDishesAndFilters() {
  const sorted = [...dishes].sort(function (a, b) {
    return a.name.localeCompare(b.name, "ru");
  });

  let categories = getCategories();

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

  if (form !== null) {
    let hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    for (let i = 0; i < hiddenInputs.length; i = i + 1) {
      hiddenInputs[i].remove();
    }
  }

  if (hasAny === false) {
    itemsBlock.innerHTML = '<p class="order-empty-all">Ничего не выбрано</p>';
    if (totalBlock !== null) { totalBlock.hidden = true; }
    if (submitBtn !== null) { submitBtn.disabled = true; }
    return;
  }

  if (totalBlock !== null) { totalBlock.hidden = false; }
  if (submitBtn !== null) { submitBtn.disabled = false; }

  let total = 0;
  let html = "";

  let categories = getCategories();
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

function renderLunchVariants() {
  let container = document.getElementById("variants-grid");
  if (container === null) {
    return;
  }

  container.innerHTML = '';

  for (let v = 0; v < lunchVariants.length; v = v + 1) {
    let variant = lunchVariants[v];

    let card = document.createElement("article");
    card.className = "variant-card";
    card.dataset.variantId = variant.id;

    let dishesHtml = "";
    let cats = getCategories();
    for (let c = 0; c < cats.length; c = c + 1) {
      let key = variant[cats[c]];
      if (key === null || key === undefined) {
        continue;
      }

      let dish = null;
      for (let d = 0; d < dishes.length; d = d + 1) {
        if (dishes[d].keyword === key) {
          dish = dishes[d];
          break;
        }
      }
      if (dish === null) {
        continue;
      }

      dishesHtml = dishesHtml +
        '<div class="variant-dish">' +
          '<img src="' + dish.image + '.jpg" alt="' + dish.name + '" class="variant-dish-image">' +
          '<div class="variant-dish-info">' +
            '<span class="variant-dish-name">' + dish.name + '</span>' +
            '<span class="variant-dish-price">' + dish.price + ' ₽</span>' +
          '</div>' +
        '</div>';
    }

    card.innerHTML =
      '<h3 class="variant-title">' + variant.name + '</h3>' +
      '<div class="variant-dishes">' + dishesHtml + '</div>';

    container.appendChild(card);
  }
}

function renderDesserts() {
  let container = document.getElementById("desserts-grid");
  if (container === null) {
    return;
  }

  container.innerHTML = '';

  for (let d = 0; d < dishes.length; d = d + 1) {
    let dish = dishes[d];
    if (dish.category !== "dessert") {
      continue;
    }

    let card = document.createElement("article");
    card.className = "dessert-card";
    card.dataset.dish = dish.keyword;

    card.innerHTML =
      '<img src="' + dish.image + '.jpg" alt="' + dish.name + '" class="dessert-image">' +
      '<span class="dessert-name">' + dish.name + '</span>' +
      '<span class="dessert-price">' + dish.price + ' ₽</span>' +
      '<button type="button" class="dessert-add">Добавить</button>';

    let addButton = card.querySelector(".dessert-add");
    addButton.addEventListener("click", function () {
      order["dessert"] = dish;
      updateInterface();
      renderDishesAndFilters();
    });

    container.appendChild(card);
  }
}

function findMatchingVariant(selectedKeywords) {
  for (let v = 0; v < lunchVariants.length; v = v + 1) {
    let variant = lunchVariants[v];
    let variantKeys = getVariantKeys(variant);

    let allPresent = true;
    for (let i = 0; i < variantKeys.length; i = i + 1) {
      if (selectedKeywords.has(variantKeys[i]) === false) {
        allPresent = false;
        break;
      }
    }
    if (allPresent === false) {
      continue;
    }

    let noExtra = true;
    selectedKeywords.forEach(function (key) {
      let inVariant = false;
      for (let i = 0; i < variantKeys.length; i = i + 1) {
        if (variantKeys[i] === key) {
          inVariant = true;
          break;
        }
      }
      if (inVariant === false && isDessertKeyword(key) === false) {
        noExtra = false;
      }
    });

    if (noExtra === true) {
      return variant;
    }
  }
  return null;
}

function findMissingForClosestVariant(selectedKeywords) {
  let bestVariant = null;
  let bestMissing = null;

  for (let v = 0; v < lunchVariants.length; v = v + 1) {
    let variant = lunchVariants[v];
    let variantKeys = getVariantKeys(variant);
    let missing = [];

    for (let i = 0; i < variantKeys.length; i = i + 1) {
      let key = variantKeys[i];
      if (selectedKeywords.has(key) === false && isDessertKeyword(key) === false) {
        missing.push(key);
      }
    }

    if (bestMissing === null || missing.length < bestMissing.length) {
      bestMissing = missing;
      bestVariant = variant;
    }
  }

  if (bestMissing === null) {
    bestMissing = [];
  }
  return { variant: bestVariant, missing: bestMissing };
}

function getMissingDishNames(missingKeys) {
  let names = [];
  for (let i = 0; i < missingKeys.length; i = i + 1) {
    let key = missingKeys[i];
    let dish = null;
    for (let d = 0; d < dishes.length; d = d + 1) {
      if (dishes[d].keyword === key) {
        dish = dishes[d];
        break;
      }
    }
    if (dish !== null) {
      names.push(dish.name);
    } else {
      names.push(key);
    }
  }
  return names;
}

function showNotification(title, message, missingList) {
  let existing = document.querySelector(".notification-overlay");
  if (existing !== null) {
    existing.remove();
  }

  let overlay = document.createElement("div");
  overlay.className = "notification-overlay";

  let missingHtml = "";
  if (missingList !== null && missingList.length > 0) {
    missingHtml = '<ul class="notification-missing">';
    for (let i = 0; i < missingList.length; i = i + 1) {
      missingHtml = missingHtml + '<li>' + missingList[i] + '</li>';
    }
    missingHtml = missingHtml + '</ul>';
  }

  overlay.innerHTML =
    '<div class="notification-box" role="alertdialog" aria-modal="true">' +
      '<h3 class="notification-title">' + title + '</h3>' +
      '<p class="notification-text">' + message + '</p>' +
      missingHtml +
      '<button type="button" class="notification-ok">Окей</button>' +
    '</div>';

  let okBtn = overlay.querySelector(".notification-ok");
  okBtn.addEventListener("click", function () {
    overlay.remove();
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  let onEsc = function (e) {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", onEsc);
    }
  };
  document.addEventListener("keydown", onEsc);

  document.body.appendChild(overlay);
}

function handleOrderSubmit(event) {
  let selectedKeywords = new Set();
  let cats = getCategories();
  for (let i = 0; i < cats.length; i = i + 1) {
    if (order[cats[i]] !== null) {
      selectedKeywords.add(order[cats[i]].keyword);
    }
  }

  if (selectedKeywords.size === 0) {
    event.preventDefault();
    showNotification("Заказ пуст", "Добавьте хотя бы одно блюдо в заказ.", []);
    return;
  }

  let matched = findMatchingVariant(selectedKeywords);
  if (matched !== null) {
    return;
  }

  event.preventDefault();

  let result = findMissingForClosestVariant(selectedKeywords);
  let missingNames = getMissingDishNames(result.missing);

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

const orderForm = document.getElementById("order-form");
if (orderForm !== null) {
  orderForm.addEventListener("submit", handleOrderSubmit);
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
renderLunchVariants();
renderDesserts();