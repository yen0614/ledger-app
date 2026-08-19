const STORAGE_KEY = 'ledger-app-transactions';

export function loadTransactions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('交易資料格式錯誤，已重置存儲。', error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addTransaction(transactions, transaction) {
  const next = [transaction, ...transactions];
  saveTransactions(next);
  return next;
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} 星期${weekdays[date.getDay()]}`;
}

export function getTransactionSummary(transactions) {
  return transactions.reduce(
    (summary, entry) => {
      if (entry.type === 'expense') {
        summary.expense += entry.amount;
      } else {
        summary.income += entry.amount;
      }
      return summary;
    },
    { expense: 0, income: 0 }
  );
}
