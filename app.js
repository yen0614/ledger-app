import { renderCategories, bindTabs, setAmountText, getActiveCategoryLabel, resetActiveCategory } from './ui.js';
import { createCalculatorHandlers } from './calculator.js';
import { showLoader } from './loader.js';
import { loadTransactions, addTransaction, getTransactionSummary } from './transaction-store.js';
import { renderTransactionList, renderSummary } from './transaction-ui.js';
import { loadCategories, addCategory, deleteCategory, guessIconFromLabel } from './category-data.js';

const noteInput = document.getElementById('noteInput');
const loaderScreen = document.getElementById('loader');
const entryTabs = document.getElementById('entryTabs');
const entryPanel = document.getElementById('entryPanel');
const mainAddBtn = document.getElementById('mainAddBtn');

let transactions = [];
let activeType = 'expense';
let isEntryOpen = false;

const calculator = createCalculatorHandlers(
  displayText => setAmountText(displayText),
  amount => {
    const categoryLabel = getActiveCategoryLabel();
    const noteText = noteInput.value.trim() || categoryLabel;
    transactions = addTransaction(transactions, {
      type: activeType,
      amount: Number(amount),
      note: noteText,
      date: new Date().toISOString()
    });
    renderTransactionList(transactions);
    renderSummary(getTransactionSummary(transactions));
    noteInput.value = '';
  }
);

function bindCalculatorButtons() {
  document.querySelectorAll('.calc-btn').forEach(button => {
    button.addEventListener('click', () => calculator.handle(button.dataset.value));
  });
}

function toggleEntryPanel() {
  isEntryOpen = !isEntryOpen;
  entryTabs.classList.toggle('hidden', !isEntryOpen);
  entryPanel.classList.toggle('hidden', !isEntryOpen);
  mainAddBtn.textContent = isEntryOpen ? '×' : '+';
}

function guessIconFromLabel(label) {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes('早餐')) return '🍳';
  if (normalized.includes('午餐')) return '🥗';
  if (normalized.includes('宵夜')) return '🌙';
  if (normalized.includes('點心')) return '🍪';
  if (normalized.includes('飲品')) return '🍹';
  if (normalized.includes('交通')) return '🚗';
  return '⭐';
}

function handleAddCategory() {
  const label = window.prompt('請輸入新分類名稱，例如 早餐、電影', '早餐');
  if (!label) return;
  const icon = guessIconFromLabel(label);
  addCategory(activeType, { icon, label: label.trim() });
  resetActiveCategory();
  renderCategories(handleAddCategory, handleDeleteCategory);
}

function handleDeleteCategory(label) {
  if (!confirm(`確定刪除分類「${label}」嗎？`)) return;
  deleteCategory(activeType, label);
  resetActiveCategory();
  renderCategories(handleAddCategory, handleDeleteCategory);
}

mainAddBtn.addEventListener('click', toggleEntryPanel);

function hideLoader() {
  loaderScreen.style.display = 'none';
}

window.addEventListener('error', event => {
  console.error('Unhandled error:', event.error);
  hideLoader();
});

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  hideLoader();
});

window.addEventListener('load', async () => {
  loadCategories();
  transactions = loadTransactions();
  renderTransactionList(transactions);
  renderSummary(getTransactionSummary(transactions));
  renderCategories(handleAddCategory, handleDeleteCategory);
  bindTabs(type => { activeType = type; });
  bindCalculatorButtons();
  try {
    await showLoader(loaderScreen);
  } catch (error) {
    console.error('載入動畫錯誤', error);
  } finally {
    setAmountText('NT$0');
  }
});
