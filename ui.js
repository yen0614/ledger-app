import { categories, isDefaultCategory } from './category-data.js';

const categoryGrid = document.getElementById('categoryGrid');
const amountDisplay = document.querySelector('.amount-display');
const tabButtons = document.querySelectorAll('.tab-button');

let activeTab = 'expense';
let activeCategoryIndex = 0;

export function setAmountText(text) {
  amountDisplay.textContent = text;
}

export function getActiveCategoryLabel() {
  return categories[activeTab][activeCategoryIndex].label;
}

export function renderCategories(onAddCategory, onDeleteCategory) {
  categoryGrid.innerHTML = '';
  categories[activeTab].forEach((category, index) => {
    const isAddButton = category.label === '新增分類';
    const isDefault = isDefaultCategory(activeTab, category.label);
    const button = document.createElement('button');
    button.className = 'category-item' + (index === activeCategoryIndex ? ' active' : '');
    button.innerHTML = `
      <div class="category-icon">${category.icon}</div>
      <div class="category-label">${category.label}</div>
      ${!isAddButton && !isDefault ? '<span class="category-delete">×</span>' : ''}
    `;
    button.addEventListener('click', () => {
      if (isAddButton) {
        onAddCategory();
        return;
      }
      activeCategoryIndex = index;
      renderCategories(onAddCategory, onDeleteCategory);
    });

    if (!isAddButton && !isDefault) {
      const deleteButton = button.querySelector('.category-delete');
      deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        onDeleteCategory(category.label);
      });
    }

    categoryGrid.appendChild(button);
  });
}

export function bindTabs(onTabChange) {
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const newTab = button.dataset.tab;
      activeTab = newTab;
      activeCategoryIndex = 0;
      tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === activeTab));
      renderCategories(onTabChange, onTabChange);
      onTabChange(newTab);
    });
  });
}

export function resetActiveCategory() {
  activeCategoryIndex = 0;
}
