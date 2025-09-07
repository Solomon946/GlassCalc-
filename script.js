//Scripting for JavaScript Calculator

let expression = '';
let currentResult = '0';
let theme = 'dark';

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('calculatorTheme') || 'dark';
    theme = savedTheme;
    applyTheme();
}

// Apply theme
function applyTheme() {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('themeIcon').textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeIcon').textContent = '🌙';
    }
}

// Toggle theme
function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('calculatorTheme', theme);
    applyTheme();
    addRipple(event);
}

// Update display
function updateDisplay() {
    document.getElementById('expression').textContent = expression || '';
    document.getElementById('result').textContent = currentResult;
}

// Append to display
function appendToDisplay(value) {
    // Prevent multiple operators in a row
    const operators = ['+', '-', '×', '÷'];
    const lastChar = expression[expression.length - 1];

    if (operators.includes(value) && operators.includes(lastChar)) {
        expression = expression.slice(0, -1);
    }

    // Prevent multiple decimal points in same number
    if (value === '.') {
        const parts = expression.split(/[\+\-\×\÷\(\)]/);
        const currentNumber = parts[parts.length - 1];
        if (currentNumber.includes('.')) {
            return;
        }
    }

    expression += value;
    updateDisplay();
    addRipple(event);
}

// Clear display
function clearDisplay() {
    expression = '';
    currentResult = '0';
    updateDisplay();
    addRipple(event);
}

// Backspace
function backspace() {
    expression = expression.slice(0, -1);
    if (expression === '') {
        currentResult = '0';
    }
    updateDisplay();
    addRipple(event);
}

// Toggle sign
function toggleSign() {
    if (currentResult !== '0' && currentResult !== 'Error') {
        if (currentResult.startsWith('-')) {
            currentResult = currentResult.slice(1);
        } else {
            currentResult = '-' + currentResult;
        }
        expression = currentResult;
        updateDisplay();
    }
    addRipple(event);
}

// Calculate percentage
function percentage() {
    try {
        const value = parseFloat(currentResult);
        if (!isNaN(value)) {
            currentResult = (value / 100).toString();
            expression = currentResult;
            updateDisplay();
        }
    } catch (e) {
        currentResult = 'Error';
        updateDisplay();
    }
    addRipple(event);
}

// Sanitize expression for safe evaluation
function sanitizeExpression(expr) {
    // Replace display symbols with JavaScript operators
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/');

    // Remove any characters that aren't numbers, operators, parentheses, or decimal points
    expr = expr.replace(/[^0-9+\-*/().\s]/g, '');

    // Ensure expression doesn't start with an operator (except minus)
    if (/^[*/+]/.test(expr)) {
        expr = '0' + expr;
    }

    // Add implied multiplication for parentheses
    expr = expr.replace(/(\d)\(/g, '$1*(');
    expr = expr.replace(/\)(\d)/g, ')*$1');

    return expr;
}

// Calculate result
function calculate() {
    if (!expression) return;

    try {
        const sanitized = sanitizeExpression(expression);

        // Use Function constructor for safer evaluation
        const result = new Function('return ' + sanitized)();

        if (!isFinite(result)) {
            currentResult = 'Error';
        } else {
            // Round to avoid floating point issues
            currentResult = Math.round(result * 100000000) / 100000000;
            currentResult = currentResult.toString();
        }

        // Add highlight animation
        const resultElement = document.getElementById('result');
        resultElement.classList.add('highlight');
        setTimeout(() => resultElement.classList.remove('highlight'), 500);

    } catch (e) {
        currentResult = 'Error';
    }

    updateDisplay();
    addRipple(event);
}

// Add ripple effect
function addRipple(e) {
    if (!e || !e.target) return;

    const button = e.target.closest('.btn, .theme-toggle');
    if (!button) return;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    e.preventDefault();

    if (e.key >= '0' && e.key <= '9') {
        appendToDisplay(e.key);
    } else if (e.key === '.') {
        appendToDisplay('.');
    } else if (e.key === '+') {
        appendToDisplay('+');
    } else if (e.key === '-') {
        appendToDisplay('-');
    } else if (e.key === '*') {
        appendToDisplay('×');
    } else if (e.key === '/') {
        appendToDisplay('÷');
    } else if (e.key === '(') {
        appendToDisplay('(');
    } else if (e.key === ')') {
        appendToDisplay(')');
    } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
    } else if (e.key === 'Backspace') {
        backspace();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clearDisplay();
    } else if (e.key === '%') {
        percentage();
    }
});

// Add ripple effect to all buttons
document.querySelectorAll('.btn, .theme-toggle').forEach(button => {
    button.addEventListener('click', addRipple);
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateDisplay();
});
