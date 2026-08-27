const MAX_EXPRESSION_LENGTH = 200;

const normalizeExpression = (value) => String(value || '')
  .trim()
  .slice(0, MAX_EXPRESSION_LENGTH)
  .toLowerCase()
  .replace(/multiplied by|times/g, '*')
  .replace(/divided by|over/g, '/')
  .replace(/to the power of|raised to|power/g, '^')
  .replace(/percent of/g, '%of%')
  .replace(/percentage of/g, '%of%')
  .replace(/\bplus\b/g, '+')
  .replace(/\bminus\b/g, '-')
  .replace(/\b(\d+(?:\.\d+)?)\s*percent\b/g, '$1%')
  .replace(/\s+/g, ' ')
  .replace(/\s*%of%\s*/g, '%of%');

const parseNumber = (token) => {
  if (!/^\d+(?:\.\d+)?$/.test(token)) throw new Error('Invalid number');
  return Number(token);
};

const calculate = (input) => {
  let expression = normalizeExpression(input);
  if (!expression) throw new Error('Expression is required');

  const percentOf = expression.match(/^(\d+(?:\.\d+)?)%of%(\d+(?:\.\d+)?)$/);
  if (percentOf) return (parseNumber(percentOf[1]) / 100) * parseNumber(percentOf[2]);

  expression = expression.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
  const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/%^]/g);
  if (!tokens || tokens.join('') !== expression.replace(/\s/g, '')) throw new Error('Invalid expression');

  const values = [];
  const operators = [];
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
  const apply = () => {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    if (left === undefined || right === undefined) throw new Error('Invalid expression');
    if (operator === '+') values.push(left + right);
    if (operator === '-') values.push(left - right);
    if (operator === '*') values.push(left * right);
    if (operator === '/') {
      if (right === 0) throw new Error('Cannot divide by zero');
      values.push(left / right);
    }
    if (operator === '%') values.push(left % right);
    if (operator === '^') values.push(left ** right);
  };

  let expectValue = true;
  for (const token of tokens) {
    if (/^\d/.test(token)) {
      values.push(parseNumber(token));
      expectValue = false;
    } else if (token === '(') {
      operators.push(token);
      expectValue = true;
    } else if (token === ')') {
      while (operators.length && operators.at(-1) !== '(') apply();
      if (operators.pop() !== '(' || expectValue) throw new Error('Invalid expression');
      expectValue = false;
    } else {
      if (expectValue && token === '-') values.push(0);
      else if (expectValue) throw new Error('Invalid expression');
      while (operators.length && operators.at(-1) !== '(' && precedence[operators.at(-1)] >= precedence[token] && token !== '^') apply();
      operators.push(token);
      expectValue = true;
    }
  }
  if (expectValue) throw new Error('Invalid expression');
  while (operators.length) {
    if (operators.at(-1) === '(') throw new Error('Invalid expression');
    apply();
  }
  const result = values[0];
  if (values.length !== 1 || !Number.isFinite(result)) throw new Error('Invalid result');
  return result;
};

module.exports = { calculate, normalizeExpression };