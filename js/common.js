// Константы для размеров страниц
const PAGE_SIZES = {
    'A4': { width: 210, height: 297 },
    'A3': { width: 297, height: 420 },
    'A5': { width: 148, height: 210 },
    'Letter': { width: 216, height: 279 },
    'Legal': { width: 216, height: 356 }
};

// Вспомогательные функции
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id "${id}" not found`);
        return null;
    }
    return element;
}

function getValue(id, defaultValue = 0) {
    const element = getElement(id);
    return element ? element.value : defaultValue;
}

function updatePageSize() {
    const format = getValue('pageSize', 'A4');
    const orientation = getValue('pageOrientation', 'portrait');
    const dimensions = PAGE_SIZES[format];
    
    let width = dimensions.width + 'mm';
    let height = dimensions.height + 'mm';
    
    if (orientation === 'landscape') {
        [width, height] = [height, width];
    }
    
    document.documentElement.style.setProperty('--page-width', width);
    document.documentElement.style.setProperty('--page-height', height);
}

// Обработка активного состояния навигации
function updateActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath === linkPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNavLink();
}); 