const STORAGE_KEY = 'ledger-app-categories';

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

export const categories = {
  expense: [...DEFAULT_CATEGORIES.expense, { icon: '➕', label: '新增分類' }],
  income: [...DEFAULT_CATEGORIES.income, { icon: '➕', label: '新增分類' }]
};

export function loadCategories() {
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

export function saveCategories(saved) {
  const expenseCustom = saved.expense.slice(DEFAULT_CATEGORIES.expense.length).filter(item => item.label !== '新增分類');
  const incomeCustom = saved.income.slice(DEFAULT_CATEGORIES.income.length).filter(item => item.label !== '新增分類');
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ expense: expenseCustom, income: incomeCustom }));
}

export function guessIconFromLabel(label) {
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
    '保健': '🏥',
    '禮物': '🎁',
    '教育': '📚',
    '寵物': '🐶',
    '咖啡': '☕',
    '電影': '🎬',
    '影視': '🎬',
    '票券': '🎟️',
    '帳單': '🧾',
    '網路': '🌐',
    '手機': '📱',
    '3c': '💻',
    '運動': '🏋️',
    '音樂': '🎵',
    '禮金': '🧧',
    '補助': '🛒',
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

export function isDefaultCategory(type, label) {
  return DEFAULT_CATEGORIES[type].some(item => item.label === label);
}

export function addCategory(type, category) {
  const addIndex = categories[type].findIndex(item => item.label === '新增分類');
  if (addIndex >= 0) {
    categories[type].splice(addIndex, 0, category);
  } else {
    categories[type].push(category);
  }
  saveCategories(categories);
}

export function deleteCategory(type, label) {
  const defaultMatch = isDefaultCategory(type, label);
  if (defaultMatch || label === '新增分類') return;
  categories[type] = categories[type].filter(item => item.label !== label);
  if (!categories[type].some(item => item.label === '新增分類')) {
    categories[type].push({ icon: '➕', label: '新增分類' });
  }
  saveCategories(categories);
}
