function calculateLineCount() {
    const format = getValue('pageSize', 'A4');
    const orientation = getValue('pageOrientation', 'portrait');
    const dimensions = PAGE_SIZES[format];

    let pageHeight = orientation === 'landscape' ? dimensions.width : dimensions.height;
    const margin = parseFloat(getValue('pageMargin', 0.5)) * 10;
    const lineSpacing = parseFloat(getValue('lineSpacing', 8));

    const availableHeight = pageHeight - (margin * 2);
    const lineCount = Math.floor(availableHeight / lineSpacing);

    return lineCount;
}

function calculateSlantedLineCount() {
    const format = getValue('pageSize', 'A4');
    const orientation = getValue('pageOrientation', 'portrait');
    const dimensions = PAGE_SIZES[format];

    let pageWidth = orientation === 'landscape' ? dimensions.height : dimensions.width;
    let pageHeight = orientation === 'landscape' ? dimensions.width : dimensions.height;
    
    // Вычисляем длину диагонали - это будет сторона нашего квадрата
    const diagonalLength = Math.sqrt(Math.pow(pageWidth, 2) + Math.pow(pageHeight, 2));
    const slantSpacing = parseFloat(getValue('slantSpacing', 30));

    // Вычисляем количество линий для покрытия квадрата
    const lineCount = Math.ceil(diagonalLength / slantSpacing) * 2 + 1; // Умножаем на 2 для центрирования

    return {
        lineCount,
        diagonalLength
    };
}

function updateLines() {
    const root = document.documentElement;
    const container = document.querySelector('.line-container');
    if (!container) return;

    // Обновляем CSS переменные
    root.style.setProperty('--line-spacing', getValue('lineSpacing', 8) + 'mm');
    root.style.setProperty('--line-color', getValue('lineColor', '#CCCCCC'));
    root.style.setProperty('--line-width', getValue('lineWidth', 1) + 'px');
    root.style.setProperty('--line-style', getValue('lineStyle', 'solid'));
    root.style.setProperty('--slant-angle', getValue('slantAngle', 0) + 'deg');
    root.style.setProperty('--slant-spacing', getValue('slantSpacing', 30) + 'mm');
    root.style.setProperty('--page-margin', getValue('pageMargin', 0.5));
    root.style.setProperty('--additional-line-color', getValue('additionalLineColor', '#808080'));
    root.style.setProperty('--additional-line-width', getValue('additionalLineWidth', 1.5) + 'px');

    // Показываем/скрываем настройки дополнительных линий
    const additionalLineEvery = parseInt(getValue('additionalLineEvery', 0));
    document.querySelectorAll('.additional-line-settings').forEach(el => {
        el.style.display = additionalLineEvery > 0 ? 'block' : 'none';
    });

    // Показываем/скрываем настройки наклонных линий
    const showSlantedLines = getElement('showSlantedLines')?.checked;
    const slantedSettings = document.querySelector('.slanted-settings');
    if (slantedSettings) {
        slantedSettings.style.display = showSlantedLines ? 'block' : 'none';
    }

    updatePageSize();
    createLines();
    updateDisplayValues();
}

function updateDisplayValues() {
    const lineWidthValue = getElement('lineWidthValue');
    const additionalLineWidthValue = getElement('additionalLineWidthValue');
    const slantAngleValue = getElement('slantAngleValue');
    const slantSpacingValue = getElement('slantSpacingValue');
    const marginValue = getElement('marginValue');

    if (lineWidthValue) lineWidthValue.textContent = getValue('lineWidth', 1);
    if (additionalLineWidthValue) additionalLineWidthValue.textContent = getValue('additionalLineWidth', 1.5);
    if (slantAngleValue) slantAngleValue.textContent = getValue('slantAngle', 0);
    if (slantSpacingValue) slantSpacingValue.textContent = getValue('slantSpacing', 30);
    if (marginValue) marginValue.textContent = getValue('pageMargin', 0.5);
}

// Храним наборы дополнительных линий
let additionalLineSets = [];
let additionalLineSetCounter = 0;

function createAdditionalLineSet() {
    const id = additionalLineSetCounter++;
    const lineSet = {
        id,
        color: '#CCCCCC', // Тот же цвет, что и у основных линий
        width: 1.5,
        style: 'solid',
        offset: 4 // Отступ в мм
    };
    additionalLineSets.push(lineSet);
    renderAdditionalLineSet(lineSet);
    updateLines();
}

function renderAdditionalLineSet(lineSet) {
    const container = document.getElementById('additionalLinesList');
    const setElement = document.createElement('div');
    setElement.className = 'additional-line-set';
    setElement.id = `lineSet_${lineSet.id}`;

    setElement.innerHTML = `
        <button class="remove-button" onclick="removeAdditionalLineSet(${lineSet.id})">×</button>
        <div class="control-item">
            <label>Отступ (мм)</label>
            <input type="number" value="${lineSet.offset}" min="1" max="50" step="0.5" 
                onchange="updateAdditionalLineSet(${lineSet.id}, 'offset', this.value)">
        </div>
        <div class="control-item">
            <label>Цвет линий</label>
            <input type="color" value="${lineSet.color}" 
                onchange="updateAdditionalLineSet(${lineSet.id}, 'color', this.value)">
        </div>
        <div class="control-item">
            <label>Толщина линий (px)</label>
            <input type="range" min="0.5" max="5" step="0.5" value="${lineSet.width}" 
                onchange="updateAdditionalLineSet(${lineSet.id}, 'width', this.value)">
        </div>
        <div class="control-item">
            <label>Стиль линий</label>
            <select onchange="updateAdditionalLineSet(${lineSet.id}, 'style', this.value)">
                <option value="solid" ${lineSet.style === 'solid' ? 'selected' : ''}>Сплошная</option>
                <option value="dashed" ${lineSet.style === 'dashed' ? 'selected' : ''}>Пунктирная</option>
                <option value="dotted" ${lineSet.style === 'dotted' ? 'selected' : ''}>Точечная</option>
            </select>
        </div>
    `;

    container.appendChild(setElement);
}

function updateAdditionalLineSet(id, property, value) {
    const lineSet = additionalLineSets.find(set => set.id === id);
    if (lineSet) {
        lineSet[property] = property === 'offset' ? parseFloat(value) : value;
        updateLines();
    }
}

function removeAdditionalLineSet(id) {
    additionalLineSets = additionalLineSets.filter(set => set.id !== id);
    const element = document.getElementById(`lineSet_${id}`);
    if (element) {
        element.remove();
    }
    updateLines();
}

function calculateTotalHeight() {
    const format = getValue('pageSize', 'A4');
    const orientation = getValue('pageOrientation', 'portrait');
    const dimensions = PAGE_SIZES[format];
    const pageHeight = orientation === 'landscape' ? dimensions.width : dimensions.height;
    const margin = parseFloat(getValue('pageMargin', 0.5)) * 10;
    return pageHeight - (margin * 2);
}

function createLines() {
    const container = document.querySelector('.line-container');
    if (!container) return;

    container.innerHTML = '';

    const baseSpacing = parseFloat(getValue('lineSpacing', 8));
    const containerHeight = calculateTotalHeight();
    let currentPosition = 0;
    const lines = [];

    // Создаем все линии с их позициями
    while (currentPosition <= containerHeight) {
        // Добавляем основную линию
        lines.push({
            position: currentPosition,
            type: 'base',
            style: {
                color: getValue('lineColor', '#CCCCCC'),
                width: getValue('lineWidth', 1),
                style: getValue('lineStyle', 'solid')
            }
        });

        currentPosition += baseSpacing;

        // Добавляем дополнительные линии
        for (const lineSet of additionalLineSets) {
            if (currentPosition <= containerHeight) {
                lines.push({
                    position: currentPosition,
                    type: 'additional',
                    style: {
                        color: lineSet.color,
                        width: lineSet.width,
                        style: lineSet.style
                    }
                });
                currentPosition += lineSet.offset;
            }
        }
    }

    // Центрируем все линии
    const totalHeight = lines[lines.length - 1].position - lines[0].position;
    const startOffset = (containerHeight - totalHeight) / 2;

    // Отрисовываем линии
    lines.forEach(line => {
        const element = document.createElement('div');
        element.className = 'horizontal-line';
        element.style.top = `${startOffset + line.position}mm`;
        element.style.borderTopColor = line.style.color;
        element.style.borderTopWidth = `${line.style.width}px`;
        element.style.borderTopStyle = line.style.style;
        container.appendChild(element);
    });

    // Обновляем счетчик линий
    const lineCountElement = getElement('lineCount');
    if (lineCountElement) {
        lineCountElement.textContent = lines.length;
    }

    // Добавляем наклонные линии если включены
    if (getElement('showSlantedLines')?.checked) {
        const { lineCount: slantedLineCount, diagonalLength } = calculateSlantedLineCount();
        
        const slantedContainer = document.createElement('div');
        slantedContainer.className = 'slanted-lines-container';
        slantedContainer.style.width = `${diagonalLength}mm`;
        slantedContainer.style.height = `${diagonalLength}mm`;
        
        const slantSpacing = parseFloat(getValue('slantSpacing', 30));
        const startOffset = -(slantedLineCount - 1) / 2 * slantSpacing;

        for (let i = 0; i < slantedLineCount; i++) {
            const line = document.createElement('div');
            line.className = 'slanted-line';
            line.style.width = `${diagonalLength}mm`;
            line.style.top = `${startOffset + i * slantSpacing}mm`;
            slantedContainer.appendChild(line);
        }

        container.appendChild(slantedContainer);
    }
}

// Функции для работы с пресетами
function savePreset() {
    const name = prompt('Введите название пресета:');
    if (!name) return;

    const settings = {
        pageSize: getValue('pageSize', 'A4'),
        pageOrientation: getValue('pageOrientation', 'portrait'),
        lineSpacing: getValue('lineSpacing', 8),
        lineColor: getValue('lineColor', '#CCCCCC'),
        lineWidth: getValue('lineWidth', 1),
        lineStyle: getValue('lineStyle', 'solid'),
        showSlantedLines: getElement('showSlantedLines')?.checked || false,
        slantAngle: getValue('slantAngle', 0),
        slantSpacing: getValue('slantSpacing', 30),
        pageMargin: getValue('pageMargin', 0.5)
    };

    const presets = JSON.parse(localStorage.getItem('linePresets') || '{}');
    presets[name] = settings;
    localStorage.setItem('linePresets', JSON.stringify(presets));
    updatePresetList();
}

function loadPreset(name) {
    const presets = JSON.parse(localStorage.getItem('linePresets') || '{}');
    const settings = presets[name];
    if (!settings) return;

    Object.entries(settings).forEach(([key, value]) => {
        const element = getElement(key);
        if (!element) return;

        if (key === 'showSlantedLines') {
            element.checked = value;
        } else {
            element.value = value;
        }
    });

    updateLines();
}

function deletePreset() {
    const select = getElement('presetSelect');
    const name = select.value;
    if (!name) return;

    const presets = JSON.parse(localStorage.getItem('linePresets') || '{}');
    delete presets[name];
    localStorage.setItem('linePresets', JSON.stringify(presets));
    updatePresetList();
}

function updatePresetList() {
    const select = getElement('presetSelect');
    if (!select) return;

    const presets = JSON.parse(localStorage.getItem('linePresets') || '{}');
    select.innerHTML = '<option value="">Выберите пресет...</option>';
    
    Object.keys(presets).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// Функции для печати и экспорта
function printPreview() {
    window.print();
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert('Библиотека jsPDF не загружена. Пожалуйста, обновите страницу.');
        return;
    }

    const format = getValue('pageSize', 'A4');
    const orientation = getValue('pageOrientation', 'portrait');
    const dimensions = PAGE_SIZES[format];

    const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format
    });

    // Конвертируем HTML в canvas
    const container = document.querySelector('.page-preview');
    html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, dimensions.width, dimensions.height);
        pdf.save('lined-paper.pdf');
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Обработчик для чекбокса наклонных линий
    const slantedCheckbox = getElement('showSlantedLines');
    if (slantedCheckbox) {
        slantedCheckbox.addEventListener('change', () => {
            const slantedSettings = document.querySelector('.slanted-settings');
            if (slantedSettings) {
                slantedSettings.style.display = slantedCheckbox.checked ? 'block' : 'none';
            }
            updateLines();
        });
    }

    document.querySelectorAll('input, select').forEach(input => {
        const updateHandler = () => {
            if (input.id === 'lineStyle') {
                document.documentElement.style.setProperty('--line-style', input.value);
            }
            updateLines();
        };
        
        input.addEventListener('input', updateHandler);
        input.addEventListener('change', updateHandler);
    });

    // Добавляем обработчики для новых кнопок
    getElement('printPreview')?.addEventListener('click', printPreview);
    getElement('exportPDF')?.addEventListener('click', exportToPDF);
    getElement('savePreset')?.addEventListener('click', savePreset);
    getElement('deletePreset')?.addEventListener('click', deletePreset);
    getElement('presetSelect')?.addEventListener('change', (e) => {
        if (e.target.value) {
            loadPreset(e.target.value);
        }
    });

    // Добавляем обработчик для кнопки добавления набора линий
    document.getElementById('addLineSet')?.addEventListener('click', createAdditionalLineSet);

    // Загружаем список пресетов
    updatePresetList();

    updateLines();
}); 