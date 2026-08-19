const STORAGE_KEY = 'ledger-app-categories';
const TRANSACTION_KEY = 'ledger-app-transactions';

const DEFAULT_CATEGORIES = {
  expense: [
    { icon: '🏠', label: '房租' },
    { icon: '🍹', label: '飲品' },
    { icon: '🛍️', label: '購物' },
    { icon: '🎮', label: '娛樂' },
    { icon: '💡', label: '水電' },
    { icon: '🍽️', label: '晚餐' },
    { icon: '🍳', label: '早餐' },
    { icon: '🥗', label: '午餐' },
    { icon: '🌙', label: '宵夜' },
    { icon: '🍪', label: '點心' },
    { icon: '☕', label: '咖啡' },
    { icon: '📺', label: '電影' },
    { icon: '🎟️', label: '票券' },
    { icon: '🚗', label: '交通' },
    { icon: '🛋️', label: '生活' },
    { icon: '👕', label: '服飾' },
    { icon: '💻', label: '3C' },
    { icon: '✈️', label: '旅行' },
    { icon: '🏋️', label: '運動' },
    { icon: '🏥', label: '保健' },
    { icon: '🎁', label: '禮物' },
    { icon: '📚', label: '教育' },
    { icon: '🐶', label: '寵物' }
  ],
  income: [
    { icon: '💰', label: '薪水' },
    { icon: '🔖', label: '獎金' },
    { icon: '📈', label: '投資' },
    { icon: '🏠', label: '租金' },
    { icon: '🤝', label: '交易' },
    { icon: '💳', label: '回饋' },
    { icon: '🪙', label: '股息' },
    { icon: '🧧', label: '禮金' },
    { icon: '🎯', label: '獎勵' }
  ]
};

const categories = {
  expense: [...DEFAULT_CATEGORIES.expense, { icon: '➕', label: '新增分類' }],
  income: [...DEFAULT_CATEGORIES.income, { icon: '➕', label: '新增分類' }]
};

function loadCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.expense) {
      categories.expense = [...DEFAULT_CATEGORIES.expense, ...saved.expense.map(item => ({
        ...item,
        icon: item.icon && item.icon !== '⭐' ? item.icon : guessIconFromLabel(item.label)
      })), { icon: '➕', label: '新增分類' }];
    }
    if (saved.income) {
      categories.income = [...DEFAULT_CATEGORIES.income, ...saved.income.map(item => ({
        ...item,
        icon: item.icon && item.icon !== '⭐' ? item.icon : guessIconFromLabel(item.label)
      })), { icon: '➕', label: '新增分類' }];
    }
  } catch (error) {
    console.error('載入分類失敗', error);
  }
}

function saveCategories(saved) {
  const expenseCustom = saved.expense.slice(DEFAULT_CATEGORIES.expense.length).filter(item => item.label !== '新增分類');
  const incomeCustom = saved.income.slice(DEFAULT_CATEGORIES.income.length).filter(item => item.label !== '新增分類');
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ expense: expenseCustom, income: incomeCustom }));
}

function guessIconFromLabel(label) {
  const normalized = label.trim().toLowerCase();
  const iconMap = {
    '早餐': '🍳',
    '午餐': '🥗',
    '晚餐': '🍽️',
    '宵夜': '🌙',
    '點心': '🍪',
    '飲品': '🍹',
    '水電': '💡',
    '房租': '🏠',
    '購物': '🛍️',
    '娛樂': '🎮',
    '交通': '🚗',
    '生活': '🛋️',
    '服飾': '👕',
    '旅行': '✈️',
    '運動': '🏋️',
    '保健': '🏥',
    '禮物': '🎁',
    '教育': '📚',
    '寵物': '🐶',
    '電影': '🎬',
    '影視': '🎬',
    '電影票': '🎬',
    '餐廳': '🍽️',
    '零食': '🍪',
    '咖啡': '☕',
    '薪水': '💰',
    '獎金': '🔖',
    '投資': '📈',
    '租金': '🏠',
    '交易': '🤝',
    '回饋': '💳',
    '股息': '🪙'
  };

  for (const key in iconMap) {
    if (normalized.includes(key)) {
      return iconMap[key];
    }
  }

  return '⭐';
}

function isDefaultCategory(type, label) {
  return DEFAULT_CATEGORIES[type].some(item => item.label === label);
}

function findIconForNote(note) {
  if (!note) return '⭐';
  for (const t of ['expense', 'income']) {
    const found = (categories[t] || []).find(c => c.label === note);
    if (found) return found.icon;
  }
  return '⭐';
}

function addCategory(type, category) {
  const addIndex = categories[type].findIndex(item => item.label === '新增分類');
  if (addIndex >= 0) {
    categories[type].splice(addIndex, 0, category);
  } else {
    categories[type].push(category);
  }
  saveCategories(categories);
}

function deleteCategory(type, label) {
  if (isDefaultCategory(type, label) || label === '新增分類') return;
  categories[type] = categories[type].filter(item => item.label !== label);
  if (!categories[type].some(item => item.label === '新增分類')) {
    categories[type].push({ icon: '➕', label: '新增分類' });
  }
  saveCategories(categories);
}

function loadTransactions() {
  const raw = localStorage.getItem(TRANSACTION_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('交易資料不是陣列');
    }
    const valid = parsed.filter(entry =>
      entry &&
      typeof entry.amount === 'number' &&
      entry.amount > 0 &&
      (entry.type === 'expense' || entry.type === 'income') &&
      typeof entry.note === 'string' &&
      entry.date
    );
    // ensure each entry has a stable id
    let changed = false;
    valid.forEach((entry, i) => {
      if (!entry.id) { entry.id = Date.now() + i; changed = true; }
    });
    if (changed) saveTransactions(valid);
    return valid;
  } catch (error) {
    console.warn('交易資料格式錯誤，已重置存儲。', error);
    localStorage.removeItem(TRANSACTION_KEY);
    return [];
  }
}

function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTION_KEY, JSON.stringify(transactions));
}

function addTransaction(transactions, transaction) {
  if (!transaction.id) transaction.id = Date.now();
  const next = [transaction, ...transactions];
  saveTransactions(next);
  return next;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} 星期${weekdays[date.getDay()]}`;
}

function formatDateShort(dateOrString) {
  const date = dateOrString instanceof Date ? dateOrString : new Date(dateOrString);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} 星期${weekdays[date.getDay()]}`;
}

function parseCurrentDate() {
  const parts = String(currentDate).split(' ')[0].split('/').map(Number);
  if (parts.length !== 3 || !parts.every(p => Number.isFinite(p))) return new Date();
  return new Date(parts[0], parts[1] - 1, parts[2], 12);
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function setCurrentDate(date) {
  const safeDate = date instanceof Date ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12) : parseCurrentDate();
  currentDate = formatDateShort(safeDate);
  updateDateLabel();
  const dateInput = document.getElementById('recordDateInput');
  if (dateInput) dateInput.value = formatDateInputValue(safeDate);
  renderTransactionList(transactions);
}

function setCurrentMonth(date) {
  const safeDate = date instanceof Date ? new Date(date.getFullYear(), date.getMonth(), 1, 12) : new Date();
  currentMonth = safeDate;
  updateDateLabel();
  renderTransactionList(transactions);
  renderSummary(getTransactionSummary(transactions, { month: currentMonth }));
}

function openNativeDatePicker(input) {
  if (!input) return;
  try {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
  } catch (error) {}
  input.focus({ preventScroll: true });
  input.click();
}

function openStatsMonthPicker() {
  if (!statsMonthInput) return;
  statsMonthInput.value = formatMonthInputValue(currentMonth);
  openNativeDatePicker(statsMonthInput);
}

function currentDateToISO() {
  const date = parseCurrentDate();
  return date.toISOString();
}

function getTransactionSummary(transactions, options = {}) {
  const filtered = options.month ? transactions.filter(entry => isSameMonth(entry.date, options.month)) : transactions;
  return filtered.reduce(
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

function getMonthLabel(dateOrString) {
  const date = dateOrString instanceof Date ? dateOrString : new Date(dateOrString);
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`;
}

function isDetailMode() {
  return document.body.classList.contains('detail-mode');
}

function updateDateLabel() {
  const dateLabelEl = document.getElementById('dateLabel');
  if (!dateLabelEl) return;
  dateLabelEl.textContent = isDetailMode() ? getMonthLabel(currentMonth) : currentDate;
  const dateInput = document.getElementById('recordDateInput');
  if (dateInput) dateInput.value = formatDateInputValue(parseCurrentDate());
  const monthInput = document.getElementById('recordMonthInput');
  if (monthInput) monthInput.value = formatMonthInputValue(currentMonth);
}

function isSameMonth(isoString, date) {
  const d = new Date(isoString);
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
}

function setDetailMode(enable) {
  if (enable) {
    document.body.classList.add('detail-mode');
  } else {
    document.body.classList.remove('detail-mode');
  }
  updateDateLabel();
}

function renderTransactionList(transactions) {
  function findIconForNote(note) {
    if (!note) return '⭐';
    for (const t of ['expense', 'income']) {
      const found = (categories[t] || []).find(c => c.label === note);
      if (found) return found.icon;
    }
    return '⭐';
  }

  const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const filteredTransactions = transactions.filter((entry) => {
    if (!entry || typeof entry.amount !== 'number' || !entry.date) return false;
    try {
      if (isDetailMode()) {
        return isSameMonth(entry.date, currentMonth);
      }
      return formatDateShort(entry.date) === currentDate;
    } catch (e) {
      return false;
    }
  });

  let html = '';
  if (!isDetailMode()) {
    const dayTotal = filteredTransactions.reduce((sum, entry) => sum + (entry.type === 'expense' ? -entry.amount : entry.amount), 0);
    const daySummaryLabel = document.querySelector('.transactions-section > .day-summary span:first-child');
    const daySummaryTotal = document.querySelector('.transactions-section > .day-summary .day-total');
    if (daySummaryLabel) daySummaryLabel.textContent = '當日紀錄';
    if (daySummaryTotal) daySummaryTotal.textContent = `${dayTotal >= 0 ? '+ NT$' : '- NT$'}${Math.abs(dayTotal).toLocaleString()}`;
  }
  if (isDetailMode()) {
    const groupedByDay = filteredTransactions.reduce((groups, entry) => {
      const date = new Date(entry.date);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(entry);
      return groups;
    }, {});

    const dayKeys = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));
    dayKeys.forEach((dayKey) => {
      const dayEntries = groupedByDay[dayKey].sort((a, b) => new Date(b.date) - new Date(a.date));
      const [year, month, day] = dayKey.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const dayTotal = dayEntries.reduce((sum, entry) => {
        return sum + (entry.type === 'expense' ? -entry.amount : entry.amount);
      }, 0);
      const dayLabel = `${month}/${day} 星期${weekdayNames[date.getDay()]}`;
      html += `
        <div class="detail-day-group">
          <div class="day-summary day-summary--detail">
            <span>${dayLabel}</span>
            <span class="day-total">${dayTotal >= 0 ? '+ NT$' : '- NT$'}${Math.abs(dayTotal).toLocaleString()}</span>
          </div>
          <div class="detail-day-box">
      `;

      dayEntries.forEach((entry) => {
        const amountClass = entry.type === 'expense' ? 'negative' : 'positive';
        const formattedAmount = entry.amount.toLocaleString();
        const amountText = entry.type === 'expense' ? `- NT$${formattedAmount}` : `+ NT$${formattedAmount}`;
        const icon = findIconForNote(entry.note);
        const isSelected = selectedTransactionId === entry.id ? ' active' : '';
        html += `
            <div class="list-item${isSelected}" data-id="${entry.id}">
              <div class="list-left">
                <div class="list-icon">${icon}</div>
                <div>
                  <p class="list-note">${entry.note}</p>
                </div>
              </div>
              <p class="list-amount ${amountClass}">${amountText}</p>
            </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });
  } else {
    filteredTransactions.forEach((entry) => {
      const amountClass = entry.type === 'expense' ? 'negative' : 'positive';
      const formattedAmount = entry.amount.toLocaleString();
      const amountText = entry.type === 'expense' ? `- NT$${formattedAmount}` : `+ NT$${formattedAmount}`;
      const icon = findIconForNote(entry.note);
      const isSelected = selectedTransactionId === entry.id ? ' active' : '';
      html += `
        <div class="list-item${isSelected}" data-id="${entry.id}">
          <div class="list-left">
            <div class="list-icon">${icon}</div>
            <div>
              <p class="list-date">${formatDate(entry.date)}</p>
              <p class="list-note">${entry.note}</p>
            </div>
          </div>
          <p class="list-amount ${amountClass}">${amountText}</p>
        </div>
      `;
    });
  }

  transactionList.innerHTML = html;
}

function renderSummary(summary) {
  if (isDetailMode()) {
    if (summaryExpense) summaryExpense.textContent = `NT$${summary.expense.toLocaleString()}`;
    if (summaryIncome) summaryIncome.textContent = `NT$${summary.income.toLocaleString()}`;
  } else {
    if (summaryExpense) summaryExpense.textContent = `- NT$${summary.expense.toLocaleString()}`;
    if (summaryIncome) summaryIncome.textContent = `+ NT$${summary.income.toLocaleString()}`;
  }
  const balance = summary.income - summary.expense;
  const balanceEl = document.querySelector('.summary-value.balance');
  if (balanceEl) balanceEl.textContent = `NT$${balance.toLocaleString()}`;
  if (donutCenter) donutCenter.textContent = `NT$${balance.toLocaleString()}`;
}

function formatStatsCurrency(value) {
  return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function getStatsFilteredTransactions() {
  return transactions.filter(entry => {
    if (!entry || typeof entry.amount !== 'number' || !entry.date) return false;
    const date = new Date(entry.date);
    if (Number.isNaN(date.getTime())) return false;
    if (statsPeriod === 'year') {
      return date.getFullYear() === currentMonth.getFullYear();
    }
    return isSameMonth(entry.date, currentMonth);
  });
}

function getStatsPeriodTitle() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  return statsPeriod === 'year' ? `${year}年` : `${year}年 ${month}月`;
}

function getStatsPeriodRangeLabel() {
  return statsPeriod === 'year' ? `${currentMonth.getFullYear()}年` : `${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`;
}

function getStatsSummary() {
  const filtered = getStatsFilteredTransactions();
  return filtered.reduce((summary, entry) => {
    if (entry.type === 'expense') {
      summary.expense += entry.amount;
    } else {
      summary.income += entry.amount;
    }
    return summary;
  }, { expense: 0, income: 0, filtered });
}

function getStatsCategoryRows(transactionsList, categoryType) {
  const grouped = new Map();
  transactionsList
    .filter(entry => entry.type === categoryType)
    .forEach(entry => {
      const label = entry.note || '未分類';
      grouped.set(label, (grouped.get(label) || 0) + entry.amount);
    });

  const rows = Array.from(grouped.entries())
    .map(([label, amount]) => {
      const category = (categories[categoryType] || []).find(item => item.label === label);
      return {
        label,
        amount,
        icon: category ? category.icon : findIconForNote(label)
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  return { rows, total };
}

function buildRingBackground(rows, total, baseColor) {
  if (!total) return `conic-gradient(${baseColor} 0 100%)`;
  let cursor = 0;
  const parts = [];
  const palette = ['#d6ab2c', '#2f9f8a', '#ea6f5d', '#5b8fd8', '#b66ad1', '#e38b3c'];
  rows.forEach((row, index) => {
    const next = cursor + (row.amount / total) * 100;
    parts.push(`${palette[index % palette.length]} ${cursor}% ${next}%`);
    cursor = next;
  });
  if (cursor < 100) {
    parts.push(`${baseColor} ${cursor}% 100%`);
  }
  return `conic-gradient(${parts.join(', ')})`;
}

function buildSummaryRingBackground(summary) {
  const total = summary.expense + summary.income;
  if (!total) return 'conic-gradient(#2f9f8a 0 100%)';
  const expensePercent = (summary.expense / total) * 100;
  return `conic-gradient(#ea6f5d 0 ${expensePercent}%, #2f9f8a ${expensePercent}% 100%)`;
}

function renderStatsView() {
  if (!statsScreen) return;
  const summary = getStatsSummary();
  const categoryData = getStatsCategoryRows(summary.filtered, statsCategoryType);
  const isExpenseCategory = statsCategoryType === 'expense';
  const categoryTitle = isExpenseCategory ? '總支出' : '總收入';
  const categoryColors = ['#d6ab2c', '#2f9f8a', '#ea6f5d', '#5b8fd8', '#b66ad1', '#e38b3c'];

  if (statsMonthLabel) statsMonthLabel.textContent = getStatsPeriodRangeLabel();
  if (statsBalanceText) statsBalanceText.textContent = formatStatsCurrency(summary.income - summary.expense);
  if (statsExpenseLegend) statsExpenseLegend.textContent = `支出 ${formatStatsCurrency(summary.expense)}`;
  if (statsIncomeLegend) statsIncomeLegend.textContent = `收入 ${formatStatsCurrency(summary.income)}`;
  if (statsSummaryDonut) statsSummaryDonut.style.background = buildSummaryRingBackground(summary);

  if (statsCategoryCenterLabel) statsCategoryCenterLabel.textContent = categoryTitle;
  if (statsCategoryCenterAmount) statsCategoryCenterAmount.textContent = formatStatsCurrency(categoryData.total);
  if (statsCategoryDonut) statsCategoryDonut.style.background = buildRingBackground(categoryData.rows, categoryData.total, '#d4a723');

  if (statsCategoryList) {
    statsCategoryList.innerHTML = categoryData.rows.length ? categoryData.rows.map((row, index) => {
      const percent = categoryData.total ? ((row.amount / categoryData.total) * 100).toFixed(1) : '0.0';
      return `
        <div class="stats-category-row">
          <span class="stats-category-dot" style="background: ${categoryColors[index % categoryColors.length]};"></span>
          <span class="stats-category-name">${row.icon} ${row.label}</span>
          <span class="stats-category-percent">${percent}%</span>
        </div>
      `;
    }).join('') : '<div class="stats-category-empty">暫無資料</div>';
  }

  statsPeriodButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.period === statsPeriod);
  });
  statsCategoryButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.categoryType === statsCategoryType);
  });
}

function setStatsPeriod(period) {
  statsPeriod = period === 'year' ? 'year' : 'month';
  renderStatsView();
}

function setStatsCategoryType(type) {
  statsCategoryType = type === 'income' ? 'income' : 'expense';
  renderStatsView();
}

function shiftStatsPeriod(direction) {
  if (statsPeriod === 'year') {
    currentMonth = new Date(currentMonth.getFullYear() + direction, 0, 1, 12);
  } else {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1, 12);
  }
  updateDateLabel();
  renderStatsView();
}

function showStatsView() {
  const txSection = document.querySelector('.transactions-section');
  const entryTabsEl = document.getElementById('entryTabs');
  const entryPanelEl = document.getElementById('entryPanel');
  if (entryTabsEl) { entryTabsEl.classList.add('hidden'); entryTabsEl.style.display = 'none'; }
  if (entryPanelEl) { entryPanelEl.classList.add('hidden'); entryPanelEl.style.display = 'none'; }
  if (txSection) txSection.style.display = 'none';
  isEntryOpen = false;
  if (mainAddBtn) mainAddBtn.textContent = '+';
  document.body.classList.add('show-stats');
  document.body.classList.remove('detail-mode');
  if (donutCard) donutCard.style.display = 'none';
  if (noteWrapper) noteWrapper.style.display = 'none';
  if (calculatorGridEl) calculatorGridEl.style.display = 'none';
  renderStatsView();
}

function showRecordView() {
  const txSection = document.querySelector('.transactions-section');
  const entryTabsEl = document.getElementById('entryTabs');
  const entryPanelEl = document.getElementById('entryPanel');
  if (entryTabsEl) { entryTabsEl.classList.remove('hidden'); entryTabsEl.style.display = ''; }
  if (entryPanelEl) { entryPanelEl.classList.remove('hidden'); entryPanelEl.style.display = ''; }
  if (txSection) { txSection.style.display = ''; txSection.classList.remove('hidden'); }
  if (summaryGrid) summaryGrid.style.display = 'none';
  if (categoryGrid) categoryGrid.style.display = '';
  isEntryOpen = true;
  if (mainAddBtn) mainAddBtn.textContent = '×';
  document.body.classList.remove('show-stats');
  setDetailMode(false);
  renderTransactionList(transactions);
  renderSummary(getTransactionSummary(transactions));
  document.body.classList.remove('awaiting-category');
  if (donutCard) donutCard.style.display = 'none';
  if (noteWrapper) noteWrapper.style.display = 'none';
  if (calculatorGridEl) calculatorGridEl.style.display = 'none';
}

function showDetailView() {
  const txSection = document.querySelector('.transactions-section');
  const entryTabsEl = document.getElementById('entryTabs');
  const entryPanelEl = document.getElementById('entryPanel');
  if (entryTabsEl) { entryTabsEl.classList.add('hidden'); entryTabsEl.style.display = 'none'; }
  if (entryPanelEl) { entryPanelEl.classList.add('hidden'); entryPanelEl.style.display = 'none'; }
  if (txSection) { txSection.style.display = ''; txSection.classList.remove('hidden'); }
  if (summaryGrid) summaryGrid.style.display = '';
  isEntryOpen = false;
  if (mainAddBtn) mainAddBtn.textContent = '+';
  document.body.classList.remove('show-stats');
  setDetailMode(true);
  renderTransactionList(transactions);
  renderSummary(getTransactionSummary(transactions, { month: currentMonth }));
  if (donutCard) donutCard.style.display = '';
  if (noteWrapper) noteWrapper.style.display = '';
  if (calculatorGridEl) calculatorGridEl.style.display = '';
}

function createCalculatorHandlers(onUpdate, onSubmit) {
  let calculatorValue = '';
  let replaceNextInput = false;

  function update(amount) {
    calculatorValue = amount;
    onUpdate(calculatorValue ? `NT$${calculatorValue}` : 'NT$0');
  }

  function set(value) {
    calculatorValue = String(value ?? '');
    replaceNextInput = true;
    update(calculatorValue);
  }

  function handle(value) {
    if (value === 'AC') {
      replaceNextInput = false;
      update('');
      return;
    }

    if (value === 'OK') {
      if (!calculatorValue) return;
      const amount = parseCalculatorValue(calculatorValue);
      if (amount === null) return;
      onSubmit(amount);
      replaceNextInput = false;
      update('');
      return;
    }

    if (value === '÷') value = '/';
    if (value === '×') value = '*';

    if (replaceNextInput && /^[0-9.]$/.test(value)) {
      replaceNextInput = false;
      if (value === '.' && calculatorValue.includes('.')) return;
      update(value === '0' ? '0' : value);
      return;
    }

    replaceNextInput = false;

    if (value === '.' && calculatorValue.includes('.')) return;
    if (value === '0' && calculatorValue === '0') return;
    if (calculatorValue.length >= 12) return;

    update(calculatorValue + value);
  }

  return { handle, reset: () => update(''), set };
}

function showLoader(loaderElement) {
  return new Promise(resolve => {
    loaderElement.style.display = 'grid';
    setTimeout(() => {
      loaderElement.classList.add('loaded');
      loaderElement.style.opacity = '0';
      setTimeout(() => {
        loaderElement.style.display = 'none';
        resolve();
      }, 500);
    }, 1200);
  });
}

const categoryGrid = document.getElementById('categoryGrid');
const amountDisplay = document.getElementById('amountInput') || document.querySelector('.amount-display');
const tabButtons = document.querySelectorAll('.tab-button');
const transactionList = document.querySelector('.transaction-list');
const summaryGrid = document.querySelector('.summary-grid');
const summaryExpense = document.querySelector('.summary-value.expense');
const summaryIncome = document.querySelector('.summary-value.income');
const donutCenter = document.querySelector('.donut-center strong');
const noteInput = document.getElementById('noteInput');
const loaderScreen = document.getElementById('loader');
const entryTabs = document.getElementById('entryTabs');
const entryPanel = document.getElementById('entryPanel');
const mainAddBtn = document.getElementById('mainAddBtn');
const deleteTransactionBtn = document.getElementById('deleteTransactionBtn');
const categoryModal = document.getElementById('categoryModal');
const categoryNameInput = document.getElementById('categoryNameInput');
const categoryIconPreview = document.getElementById('categoryIconPreview');
const categoryConfirmBtn = document.getElementById('categoryConfirmBtn');
const categoryCancelBtn = document.getElementById('categoryCancelBtn');
const noteWrapper = document.querySelector('.note-input');
const calculatorGridEl = document.querySelector('.calculator-grid');
const donutCard = document.querySelector('.donut-card');
const statsScreen = document.getElementById('statsScreen');
const statsPrevBtn = document.getElementById('statsPrevBtn');
const statsNextBtn = document.getElementById('statsNextBtn');
const statsMonthLabel = document.getElementById('statsMonthLabel');
const statsMonthInput = document.getElementById('statsMonthInput');
const statsSummaryDonut = document.getElementById('statsSummaryDonut');
const statsBalanceText = document.getElementById('statsBalanceText');
const statsExpenseLegend = document.getElementById('statsExpenseLegend');
const statsIncomeLegend = document.getElementById('statsIncomeLegend');
const statsCategoryDonut = document.getElementById('statsCategoryDonut');
const statsCategoryCenterLabel = document.getElementById('statsCategoryCenterLabel');
const statsCategoryCenterAmount = document.getElementById('statsCategoryCenterAmount');
const statsCategoryList = document.getElementById('statsCategoryList');
const statsPeriodButtons = document.querySelectorAll('.stats-period-btn');
const statsCategoryButtons = document.querySelectorAll('.stats-category-btn');

// enable inline editing for transactions (added after DOM refs)
  if (transactionList) {
  transactionList.addEventListener('click', (e) => {
    let node = e.target;
    let item = null;
    while (node && node !== transactionList) {
      if (node.classList && node.classList.contains('list-item')) { item = node; break; }
      node = node.parentNode;
    }
    if (!item) return;
    const id = Number(item.dataset.id);
    if (Number.isNaN(id)) return;
    const entry = transactions.find(t => t.id === id);
    if (!entry) return;
    const isSame = selectedTransactionId === id;
    if (isSame) {
      collapseEntryPanel();
      return;
    }
    selectedTransactionId = id;
    editingTransactionId = id;
    window.selectedTransactionId = id;
    window.editingTransactionId = id;
    activeTab = entry.type || 'expense';
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === activeTab));
    const catIdx = (categories[activeTab] || []).findIndex(c => c.label === entry.note);
    activeCategoryIndex = catIdx >= 0 ? catIdx : 0;
    noteInput.value = entry.note || '';
    setAmountText(`NT$${entry.amount}`);
    pendingPrefillAmount = entry.amount;
    try { if (calculator && typeof calculator.set === 'function') calculator.set(entry.amount); } catch(e) {}
    categoryChosen = true;
    showEntryPanel(true);
    renderCategories(handleAddCategory, handleDeleteCategory);
    renderTransactionList(transactions);
  });

  transactionList.addEventListener('click', (e) => {
    let node2 = e.target;
    if (node2.classList && node2.classList.contains('cancel-edit')) {
      renderTransactionList(transactions);
      return;
    }
    if (node2.classList && node2.classList.contains('save-edit')) {
      // legacy save-edit (shouldn't be used now) - ignore
      return;
    }
  });
}

var categoryChosen = false;

var transactions = [];
var activeTab = 'expense';
var activeCategoryIndex = 0;
var isEntryOpen = false;
var currentDate = formatDateShort(new Date());
var currentMonth = new Date();
var statsPeriod = 'month';
var statsCategoryType = 'expense';
var editingTransactionId = null;
var selectedTransactionId = null;
window.editingTransactionId = editingTransactionId;
window.selectedTransactionId = selectedTransactionId;
var calculator = null; // will be assigned in load
var pendingPrefillAmount = null; // used to prefill calculator after init if needed

function setAmountText(text) {
  if (amountDisplay) {
    if (amountDisplay.tagName === 'INPUT') {
      amountDisplay.value = text;
    } else {
      amountDisplay.textContent = text;
    }
  }
}

function showEntryPanel(forceShowInputs = false) {
  if (entryTabs) entryTabs.classList.remove('hidden');
  if (entryPanel) entryPanel.classList.remove('hidden');
  if (noteWrapper) noteWrapper.style.display = (categoryChosen || forceShowInputs) ? '' : 'none';
  if (calculatorGridEl) calculatorGridEl.style.display = (categoryChosen || forceShowInputs) ? '' : 'none';
  if (categoryGrid) categoryGrid.style.display = '';
  if (deleteTransactionBtn) deleteTransactionBtn.classList.toggle('hidden', !editingTransactionId);
  if (mainAddBtn) mainAddBtn.textContent = '×';
  isEntryOpen = true;
}

function collapseEntryPanel() {
  if (entryTabs) entryTabs.classList.remove('hidden');
  if (entryPanel) entryPanel.classList.add('hidden');
  if (noteWrapper) noteWrapper.style.display = 'none';
  if (calculatorGridEl) calculatorGridEl.style.display = 'none';
  if (categoryGrid) categoryGrid.style.display = 'none';
  if (deleteTransactionBtn) deleteTransactionBtn.classList.add('hidden');
  isEntryOpen = false;
  selectedTransactionId = null;
  editingTransactionId = null;
  window.selectedTransactionId = null;
  window.editingTransactionId = null;
  noteInput.value = '';
  setAmountText('NT$0');
  if (mainAddBtn) mainAddBtn.textContent = '+';
  renderTransactionList(transactions);
}

function hideEntryPanel() {
  if (entryTabs) entryTabs.classList.add('hidden');
  if (entryPanel) entryPanel.classList.add('hidden');
  if (noteWrapper) noteWrapper.style.display = 'none';
  if (calculatorGridEl) calculatorGridEl.style.display = 'none';
  isEntryOpen = false;
  selectedTransactionId = null;
  editingTransactionId = null;
  window.selectedTransactionId = null;
  window.editingTransactionId = null;
  noteInput.value = '';
  setAmountText('NT$0');
  if (mainAddBtn) mainAddBtn.textContent = '+';
  renderTransactionList(transactions);
}

function getActiveCategoryLabel() {
  return categories[activeTab][activeCategoryIndex].label;
}

function openCategoryModal() {
  if (!categoryModal) return;
  categoryNameInput.value = '';
  categoryIconPreview.textContent = '⭐';
  categoryModal.classList.add('active');
  categoryNameInput.focus();
}

function closeCategoryModal() {
  if (!categoryModal) return;
  categoryModal.classList.remove('active');
}

function updateCategoryIconPreview() {
  if (!categoryIconPreview) return;
  categoryIconPreview.textContent = guessIconFromLabel(categoryNameInput.value.trim() || '') || '⭐';
}

function renderCategories(onAddCategory, onDeleteCategory) {
  if (!categoryGrid) return;
  categoryGrid.innerHTML = '';
  const currentCategories = categories[activeTab] || [];
  currentCategories.forEach((category, index) => {
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
      categoryChosen = true;
      if (noteWrapper) noteWrapper.style.display = '';
      if (calculatorGridEl) calculatorGridEl.style.display = '';
      document.body.classList.remove('awaiting-category');
      noteInput.value = category.label;
      renderCategories(onAddCategory, onDeleteCategory);
      if (calculatorGridEl) {
        requestAnimationFrame(() => {
          calculatorGridEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    });
    if (!isAddButton && !isDefault) {
      const deleteButton = button.querySelector('.category-delete');
      if (deleteButton) {
        deleteButton.addEventListener('click', event => {
          event.stopPropagation();
          onDeleteCategory(category.label);
        });
      }
    }
    categoryGrid.appendChild(button);
  });
}

function resetActiveCategory() {
  activeCategoryIndex = 0;
}

function bindTabs() {
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const newTab = button.dataset.tab;
      if (newTab === activeTab && isEntryOpen) {
        collapseEntryPanel();
        return;
      }
      const wasEditing = editingTransactionId != null;
      if (!wasEditing && newTab !== activeTab) {
        selectedTransactionId = null;
        window.selectedTransactionId = null;
      }
      activeTab = newTab;
      activeCategoryIndex = 0;
      tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === activeTab));
      renderCategories(handleAddCategory, handleDeleteCategory);
      categoryChosen = true;
      showEntryPanel(true);
      renderTransactionList(transactions);
    });
  });
}

function parseCalculatorValue(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/×/g, '*').replace(/÷/g, '/').trim();
  if (!normalized || !/^[0-9.+\-*/() ]+$/.test(normalized)) return null;
  try {
    const result = Function(`"use strict"; return (${normalized})`)();
    if (typeof result !== 'number' || Number.isNaN(result) || result <= 0) return null;
    return Number(result.toFixed(2));
  } catch (error) {
    return null;
  }
}

function bindCalculatorButtons(calculator) {
  document.querySelectorAll('.calc-btn').forEach(button => {
    button.addEventListener('click', () => calculator.handle(button.dataset.value));
  });
}

function toggleEntryPanel() {
  if (isEntryOpen) {
    collapseEntryPanel();
    return;
  }
  categoryChosen = false;
  showEntryPanel();
}

function handleAddCategory() {
  openCategoryModal();
}

function commitAddCategory() {
  const label = categoryNameInput.value.trim();
  if (!label) return;
  const exists = categories[activeTab].some(item => item.label.toLowerCase() === label.toLowerCase());
  if (exists) {
    closeCategoryModal();
    return;
  }
  const icon = guessIconFromLabel(label);
  addCategory(activeTab, { icon, label });
  activeCategoryIndex = categories[activeTab].findIndex(item => item.label === label);
  categoryChosen = true;
  if (noteWrapper) noteWrapper.style.display = '';
  if (calculatorGridEl) calculatorGridEl.style.display = '';
  noteInput.value = label;
  renderCategories(handleAddCategory, handleDeleteCategory);
  closeCategoryModal();
}

function confirmCategoryAdd() {
  commitAddCategory();
}

function handleDeleteCategory(label) {
  if (!confirm(`確定刪除分類「${label}」嗎？`)) return;
  deleteCategory(activeTab, label);
  resetActiveCategory();
  categoryChosen = true;
  if (noteWrapper) noteWrapper.style.display = '';
  if (calculatorGridEl) calculatorGridEl.style.display = '';
  renderCategories(handleAddCategory, handleDeleteCategory);
}

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
  const initialActiveButton = document.querySelector('.bottom-nav .nav-item.active');
  if (initialActiveButton?.querySelector('.nav-label')?.textContent === '明細') {
    setDetailMode(true);
  } else {
    setDetailMode(false);
  }
  renderTransactionList(transactions);
  renderSummary(getTransactionSummary(transactions, { month: currentMonth }));
  renderCategories(handleAddCategory, handleDeleteCategory);
  bindTabs();
  // ensure any lingering awaiting-class from previous sessions is cleared
  document.body.classList.remove('awaiting-category');
  // set the visible date text to today's local date
  try {
    const dateEl = document.querySelector('.date-text');
    if (dateEl) {
      // render interactive date selector with prev/next and a native picker
      function renderDateSelector() {
        dateEl.innerHTML = `
          <button id="datePrev" class="date-nav">‹</button>
          <button id="dateLabel" class="date-label" type="button">${isDetailMode() ? getMonthLabel(currentMonth) : currentDate}</button>
          <input id="recordDateInput" class="date-picker-input" type="date" aria-label="選擇記帳日期" />
          <input id="recordMonthInput" class="date-picker-input" type="month" aria-label="選擇明細月份" />
          <button id="dateNext" class="date-nav">›</button>
        `;
        const prev = document.getElementById('datePrev');
        const next = document.getElementById('dateNext');
        const label = document.getElementById('dateLabel');
        const recordDateInput = document.getElementById('recordDateInput');
        const recordMonthInput = document.getElementById('recordMonthInput');
        if (recordDateInput) recordDateInput.value = formatDateInputValue(parseCurrentDate());
        if (recordMonthInput) recordMonthInput.value = formatMonthInputValue(currentMonth);
        if (label) {
          label.addEventListener('click', () => {
            if (isDetailMode()) {
              if (recordMonthInput) openNativeDatePicker(recordMonthInput);
              return;
            }
            if (recordDateInput) openNativeDatePicker(recordDateInput);
          });
        }
        if (recordDateInput) {
          recordDateInput.addEventListener('change', () => {
            if (!recordDateInput.value) return;
            const picked = new Date(`${recordDateInput.value}T12:00:00`);
            if (!Number.isNaN(picked.getTime())) setCurrentDate(picked);
          });
        }
        if (recordMonthInput) {
          recordMonthInput.addEventListener('change', () => {
            if (!recordMonthInput.value) return;
            const [year, month] = recordMonthInput.value.split('-').map(Number);
            const picked = new Date(year, month - 1, 1, 12);
            if (!Number.isNaN(picked.getTime())) setCurrentMonth(picked);
          });
        }
        if (prev) prev.addEventListener('click', () => {
          if (isDetailMode()) {
            const picked = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1, 12);
            setCurrentMonth(picked);
          } else {
            const d = parseCurrentDate();
            d.setDate(d.getDate() - 1);
            setCurrentDate(d);
          }
        });
        if (next) next.addEventListener('click', () => {
          if (isDetailMode()) {
            const picked = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1, 12);
            setCurrentMonth(picked);
          } else {
            const d = parseCurrentDate();
            d.setDate(d.getDate() + 1);
            setCurrentDate(d);
          }
        });
      }
      renderDateSelector();
    }
  } catch (e) {
    console.error('設定日期文字失敗', e);
  }
  categoryNameInput.addEventListener('input', updateCategoryIconPreview);
  categoryConfirmBtn.addEventListener('click', confirmCategoryAdd);
  categoryCancelBtn.addEventListener('click', closeCategoryModal);
  categoryModal.addEventListener('click', event => {
    if (event.target === categoryModal) closeCategoryModal();
  });
  calculator = createCalculatorHandlers(
    displayText => setAmountText(displayText),
    amount => {
      const categoryLabel = getActiveCategoryLabel();
      const noteText = noteInput.value.trim() || categoryLabel;
      if (editingTransactionId) {
        // update existing transaction
        const idx = transactions.findIndex(t => t.id === editingTransactionId);
        if (idx >= 0) {
          transactions[idx].type = activeTab;
          transactions[idx].amount = Number(amount);
          transactions[idx].note = noteText;
          // set date to currentDate (preserve time at midnight)
          // set date based on currentDate (parse YYYY/MM/DD)
          try {
            transactions[idx].date = currentDateToISO();
          } catch(e) { console.warn('日期轉換失敗', e); }

          saveTransactions(transactions);
        }
        editingTransactionId = null;
      } else {
        transactions = addTransaction(transactions, {
          id: Date.now(),
          type: activeTab,
          amount: Number(amount),
          note: noteText,
          date: currentDateToISO()
        });
      }
      renderTransactionList(transactions);
      renderSummary(isDetailMode() ? getTransactionSummary(transactions, { month: currentMonth }) : getTransactionSummary(transactions));
      noteInput.value = '';
      collapseEntryPanel();
      if (transactionList) transactionList.scrollTop = 0;
    }
  );
  bindCalculatorButtons(calculator);
  if (deleteTransactionBtn) {
    deleteTransactionBtn.addEventListener('click', () => {
      if (!editingTransactionId) return;
      if (!confirm('確定刪除這筆交易嗎？')) return;
      transactions = transactions.filter(entry => entry.id !== editingTransactionId);
      saveTransactions(transactions);
      renderTransactionList(transactions);
      renderSummary(isDetailMode() ? getTransactionSummary(transactions, { month: currentMonth }) : getTransactionSummary(transactions));
      collapseEntryPanel();
    });
  }
  try { window.calculator = calculator; } catch(e) {}
  // if there was a pending prefill (opened before calculator init), apply it now
  try { if (pendingPrefillAmount != null && calculator && typeof calculator.set === 'function') { calculator.set(String(pendingPrefillAmount)); pendingPrefillAmount = null; } } catch(e) {}
  // hide amount/note input until user selects a category
  if (noteWrapper) noteWrapper.style.display = 'none';
  if (calculatorGridEl) calculatorGridEl.style.display = 'none';
  categoryChosen = false;
  try {
    await showLoader(loaderScreen);
  } catch (error) {
    console.error('載入動畫錯誤', error);
  } finally {
    setAmountText('NT$0');
  }

  statsPeriodButtons.forEach(button => {
    button.addEventListener('click', () => setStatsPeriod(button.dataset.period));
  });
  statsCategoryButtons.forEach(button => {
    button.addEventListener('click', () => setStatsCategoryType(button.dataset.categoryType));
  });
  if (statsPrevBtn) statsPrevBtn.addEventListener('click', () => shiftStatsPeriod(-1));
  if (statsNextBtn) statsNextBtn.addEventListener('click', () => shiftStatsPeriod(1));
  if (statsMonthLabel) {
    statsMonthLabel.addEventListener('click', openStatsMonthPicker);
  }
  if (statsMonthInput) {
    statsMonthInput.addEventListener('change', () => {
      if (!statsMonthInput.value) return;
      const [year, month] = statsMonthInput.value.split('-').map(Number);
      const picked = new Date(year, month - 1, 1, 12);
      if (Number.isNaN(picked.getTime())) return;
      currentMonth = picked;
      statsPeriod = 'month';
      renderStatsView();
    });
  }

  // bottom nav interaction
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    bottomNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item');
      if (!btn) return;
      bottomNav.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      btn.classList.add('active');
      const label = btn.querySelector('.nav-label')?.textContent.trim() || '';
      // toggle views: 記帳 shows entry UI; 明細 hides entry UI; 統計 toggles body class
      if (label === '記帳') {
        showRecordView();
      } else if (label === '明細') {
        showDetailView();
      } else if (label === '統計') {
        showStatsView();
      }
    });
    // also bind direct handlers to each item to ensure reliable behavior
    Array.from(bottomNav.querySelectorAll('.nav-item')).forEach(item => {
      item.onclick = () => {
        const label = item.querySelector('.nav-label')?.textContent.trim() || '';
        // reuse same logic as centralized handler
        if (label === '記帳') {
          showRecordView();
        } else if (label === '明細') {
          showDetailView();
        } else if (label === '統計') {
          showStatsView();
        }
        // visually mark active
        bottomNav.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
      };
    });
  }
});
