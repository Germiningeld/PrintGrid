function calculateGridDimensions() {
    const format = getValue('pageSize', 'A4');
    const orientation = getValue('pageOrientation', 'portrait');
    const dimensions = PAGE_SIZES[format];

    let pageWidth = orientation === 'landscape' ? dimensions.height : dimensions.width;
    let pageHeight = orientation === 'landscape' ? dimensions.width : dimensions.height;

    const dotSpacingX = parseFloat(getValue('dotSpacingX', 1)) * 10;
    const dotSpacingY = parseFloat(getValue('dotSpacingY', 1)) * 10;
    const multiplier = parseFloat(getValue('sizeMultiplier', 1));
    const margin = parseFloat(getValue('pageMargin', 0.5)) * 10;

    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    const finalDotSpacingX = dotSpacingX * multiplier;
    const finalDotSpacingY = dotSpacingY * multiplier;

    // For dot grid, we count the number of dots, not cells
    const columns = Math.floor(availableWidth / finalDotSpacingX) + 1;
    const rows = Math.floor(availableHeight / finalDotSpacingY) + 1;

    return { columns, rows };
}

function updateGrid() {
    const root = document.documentElement;
    const container = document.querySelector('.dot-grid-container');
    if (!container) return;

    const parentContainer = container.parentElement;

    root.style.setProperty('--dot-spacing-x', getValue('dotSpacingX', 1));
    root.style.setProperty('--dot-spacing-y', getValue('dotSpacingY', 1));
    root.style.setProperty('--size-multiplier', getValue('sizeMultiplier', 1));
    root.style.setProperty('--dot-color', getValue('dotColor', '#CCCCCC'));
    root.style.setProperty('--dot-size', getValue('dotSize', 3) + 'px');
    root.style.setProperty('--page-margin', getValue('pageMargin', 0.5));

    updatePageSize();

    const { columns, rows } = calculateGridDimensions();
    root.style.setProperty('--grid-columns', columns);
    root.style.setProperty('--grid-rows', rows);

    const gridSizeElement = getElement('gridSize');
    if (gridSizeElement) {
        gridSizeElement.textContent = `${columns} × ${rows}`;
    }

    if (parentContainer) {
        parentContainer.style.justifyContent = getValue('horizontalAlign', 'center');
        parentContainer.style.alignItems = getValue('verticalAlign', 'center');
    }

    updateDisplayValues();
    createDotGrid(columns, rows);
}

function updateDisplayValues() {
    const multiplierValue = getElement('multiplierValue');
    const dotSizeValue = getElement('dotSizeValue');
    const marginValue = getElement('marginValue');

    if (multiplierValue) multiplierValue.textContent = getValue('sizeMultiplier', 1);
    if (dotSizeValue) dotSizeValue.textContent = getValue('dotSize', 3);
    if (marginValue) marginValue.textContent = getValue('pageMargin', 0.5);
}

function createDotGrid(columns, rows) {
    const container = document.querySelector('.dot-grid-container');
    if (!container) return;

    container.innerHTML = '';

    const dotSpacingX = parseFloat(getValue('dotSpacingX', 1));
    const dotSpacingY = parseFloat(getValue('dotSpacingY', 1));
    const multiplier = parseFloat(getValue('sizeMultiplier', 1));

    const finalDotSpacingX = dotSpacingX * multiplier;
    const finalDotSpacingY = dotSpacingY * multiplier;

    // Update container dimensions
    container.style.width = `calc(${finalDotSpacingX} * ${columns - 1}cm)`;
    container.style.height = `calc(${finalDotSpacingY} * ${rows - 1}cm)`;

    // Create dots
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = `calc(${x} * ${finalDotSpacingX}cm)`;
            dot.style.top = `calc(${y} * ${finalDotSpacingY}cm)`;
            container.appendChild(dot);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', updateGrid);
        input.addEventListener('change', updateGrid);
    });

    updateGrid();
}); 