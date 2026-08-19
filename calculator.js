export function formatAmount(value) {
  return value ? `NT$${value}` : 'NT$0';
}

export function clampCalculatorValue(current, nextChar) {
  if (nextChar === '.' && current.includes('.')) return current;
  if (current === '0' && nextChar === '0') return current;
  if (current.length >= 12) return current;
  return current + nextChar;
}

export function createCalculatorHandlers(onUpdate, onSubmit) {
  let calculatorValue = '';
  let replaceNextInput = false;

  function update(amount) {
    calculatorValue = amount;
    onUpdate(formatAmount(calculatorValue));
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
      onSubmit(calculatorValue);
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

    const next = clampCalculatorValue(calculatorValue, value);
    update(next);
  }

  return { handle, reset: () => update(''), set };
