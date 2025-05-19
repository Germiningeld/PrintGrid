function calculateGridDimensions() {
    const format = getValue('pageSize', 'A4');
    const orientation = getValue('pageOrientation', 'portrait');
    const dimensions = PAGE_SIZES[format];
    
    let pageWidth = orientation === 'landscape' ? dimensions.height : dimensions.width;
    let pageHeight = orientation === 'landscape' ? dimensions.width : dimensions.height;
    
    const cellWidth = parseFloat(getValue('cellWidth', 1)) * 10;
    const cellHeight = parseFloat(getValue('cellHeight', 1)) * 10;
    const multiplier = parseFloat(getValue('sizeMultiplier', 1));
    const margin = parseFloat(getValue('pageMargin', 0.5)) * 10;
    
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    const finalCellWidth = cellWidth * multiplier;
    const finalCellHeight = cellHeight * multiplier;
    
    const columns = Math.floor(availableWidth / finalCellWidth);
    const rows = Math.floor(availableHeight / finalCellHeight);
    
    return { columns, rows };
}

function updateGrid() {
    const root = document.documentElement;
    const container = document.querySelector('.grid-container');
    if (!container) return;

    const parentContainer = container.parentElement;
    
    root.style.setProperty('--cell-width', getValue('cellWidth', 1));
    root.style.setProperty('--cell-height', getValue('cellHeight', 1));
    root.style.setProperty('--size-multiplier', getValue('sizeMultiplier', 1));
    root.style.setProperty('--grid-color', getValue('gridColor', '#CCCCCC'));
    root.style.setProperty('--grid-border-width', getValue('borderWidth', 1) + 'px');
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
    createGrid(columns, rows);
}

function updateDisplayValues() {
    const multiplierValue = getElement('multiplierValue');
    const borderWidthValue = getElement('borderWidthValue');
    const marginValue = getElement('marginValue');

    if (multiplierValue) multiplierValue.textContent = getValue('sizeMultiplier', 1);
    if (borderWidthValue) borderWidthValue.textContent = getValue('borderWidth', 1);
    if (marginValue) marginValue.textContent = getValue('pageMargin', 0.5);
}

function createGrid(columns, rows) {
    const container = document.querySelector('.grid-container');
    if (!container) return;

    container.innerHTML = '';
    
    const totalCells = columns * rows;
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        container.appendChild(cell);
    }

    const existingStyle = document.getElementById('dynamic-grid-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'dynamic-grid-style';
    style.textContent = `
        .grid-cell:nth-child(${columns}n) {
            border-right: none;
        }
        .grid-cell:nth-child(n+${columns * (rows - 1) + 1}):nth-child(-n+${totalCells}) {
            border-bottom: none;
        }
    `;
    document.head.appendChild(style);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', updateGrid);
        input.addEventListener('change', updateGrid);
    });

    updateGrid();
}); 