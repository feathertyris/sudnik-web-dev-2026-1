const order = { soup: null, main: null, drink: null };
const categoryTitles = { soup: "Суп", main: "Главное блюдо", drink: "Напиток" };

function renderDishes() {
  const sorted = [...dishes].sort((a, b) => a.name.localeCompare(b.name, "ru"));

  sorted.forEach(dish => {
    const container = document.querySelector(`[data-category="${dish.category}"]`);
    if (!container) return;

    const card = document.createElement("article");
    card.className = "dish-card";
    card.innerHTML = `
      <img src="${dish.image}.jpg" alt="${dish.name}" class="dish-image">
      <h4 class="dish-name">${dish.name}</h4>
      <p class="dish-count">${dish.count}</p>
      <p class="dish-price">${dish.price} ₽</p>
      <button type="button" class="dish-add">Добавить</button>
    `;

    card.querySelector(".dish-add").addEventListener("click", () => {
      order[dish.category] = dish;
      updateInterface();
    });

    container.appendChild(card);
  });
}

function updateInterface() {
  const itemsBlock = document.getElementById("order-items");
  const totalBlock = document.getElementById("order-total");
  const submitBtn = document.getElementById("order-submit");
  const form = document.getElementById("order-form");

  const hasAny = order.soup || order.main || order.drink;

  if (!hasAny) {
    itemsBlock.innerHTML = '<p class="order-empty-all">Ничего не выбрано</p>';
    totalBlock.hidden = true;
    submitBtn.disabled = true;
    return;
  }

  totalBlock.hidden = false;
  submitBtn.disabled = false;

  let total = 0;
  let html = "";

  form.querySelectorAll('input[type="hidden"]').forEach(el => el.remove());

  for (const key in order) {
    const dish = order[key];

    if (dish) {
      total += dish.price;
      html += `
        <div class="order-item">
          <h4>${categoryTitles[key]}</h4>
          <p>${dish.name} ${dish.price}₽</p>
        </div>
      `;
      
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = dish.keyword;
      form.appendChild(input);
    } else {
      const emptyText = key === "drink" ? "Напиток не выбран" : "Блюдо не выбрано";
      html += `
        <div class="order-item order-item-empty">
          <h4>${categoryTitles[key]}</h4>
          <p>${emptyText}</p>
        </div>
      `;
    }
  }

  itemsBlock.innerHTML = html;
  document.querySelector(".order-total-value").textContent = `${total}₽`;

  document.querySelectorAll(".dish-card").forEach(card => {
    const cardName = card.querySelector(".dish-name").textContent;
    const isSelected = Object.values(order).some(d => d && d.name === cardName);
    card.classList.toggle("selected", isSelected);
  });
}

renderDishes();
updateInterface();
