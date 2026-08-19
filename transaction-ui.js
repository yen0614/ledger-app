import { formatDate } from './transaction-store.js';

const transactionList = document.querySelector('.transaction-list');
const summaryExpense = document.querySelector('.summary-value.expense');
const summaryIncome = document.querySelector('.summary-value.income');
const donutCenter = document.querySelector('.donut-center strong');

export function renderTransactionList(transactions) {
  transactionList.innerHTML = transactions.map(entry => {
    const amountClass = entry.type === 'expense' ? 'negative' : 'positive';
    const amountText = entry.type === 'expense' ? `- NT$${entry.amount.toLocaleString()}` : `+ NT$${entry.amount.toLocaleString()}`;
    return `
      <div class="list-item">
        <div>
          <p class="list-date">${formatDate(entry.date)}</p>
          <p class="list-note">${entry.note}</p>
        </div>
        <p class="list-amount ${amountClass}">${amountText}</p>
      </div>
    `;
  }).join('');
}

export function renderSummary(summary) {
  summaryExpense.textContent = `- NT$${summary.expense.toLocaleString()}`;
  summaryIncome.textContent = `+ NT$${summary.income.toLocaleString()}`;
  const balance = summary.income - summary.expense;
  donutCenter.textContent = `NT$${balance.toLocaleString()}`;
}
