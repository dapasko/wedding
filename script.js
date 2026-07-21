// ===================================
// Свадебный сайт Даниила и Ирины
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех модулей
    initNavbar();
    initCountdown();
    initMobileMenu();
    initSmoothScroll();
    initMusicPlayer();
    initRSVPForm();
    initFAQ();
    initScrollAnimations();
    initMap();
    initVenueMap();
    initPhoneMask();
});

// ===================================
// Навигация
// ===================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ===================================
// Таймер обратного отсчёта
// ===================================
function initCountdown() {
    const weddingDate = new Date('2026-09-19T14:50:00');
    const countdownElement = document.getElementById('countdown');
    
    if (!countdownElement) return;
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    function updateCountdown() {
        const now = new Date();
        const difference = weddingDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        } else {
            // Свадьба уже состоялась
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ===================================
// Мобильное меню
// ===================================
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navToggle || !navMenu) return;
    
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Закрытие меню при клике на ссылку
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ===================================
// Плавный скролл
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// Музыкальный плеер
// ===================================
function initMusicPlayer() {
    const musicControl = document.getElementById('musicControl');
    const audio = document.getElementById('weddingMusic');

    if (!musicControl || !audio) return;

    // Устанавливаем громкость
    audio.volume = 0.3;

    // Проверяем сохранённое состояние
    const isPlaying = localStorage.getItem('musicPlaying') === 'true';
    if (isPlaying) {
        audio.play().then(() => {
            musicControl.classList.add('playing');
        }).catch(e => {
            console.log('Автовоспроизведение заблокировано:', e);
            localStorage.removeItem('musicPlaying');
        });
    }

    musicControl.addEventListener('click', function() {
        if (audio.paused) {
            audio.play().then(() => {
                musicControl.classList.add('playing');
                localStorage.setItem('musicPlaying', 'true');
                showNotification('🎵 Музыка включена', 'success');
            }).catch(e => {
                console.error('Ошибка воспроизведения:', e);
                showNotification('⚠️ Ошибка воспроизведения музыки', 'error');
            });
        } else {
            audio.pause();
            musicControl.classList.remove('playing');
            localStorage.setItem('musicPlaying', 'false');
            showNotification('🔇 Музыка выключена', 'success');
        }
    });
    
    // Обработка окончания трека
    audio.addEventListener('ended', function() {
        // Трек зациклен, но на всякий случай
        musicControl.classList.remove('playing');
        localStorage.setItem('musicPlaying', 'false');
    });
    
    // Обработка ошибок загрузки
    audio.addEventListener('error', function(e) {
        console.error('Ошибка загрузки аудио:', e);
        musicControl.style.display = 'none';
    });
}

// ===================================
// RSVP Форма
// ===================================
function initRSVPForm() {
    const form = document.getElementById('rsvpForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const formData = new FormData(form);
        
        // Валидация
        const name = formData.get('name')?.trim();
        const attendance = formData.get('attendance');
        const phone = formData.get('phone')?.trim();
        
        if (!name || !attendance || !phone) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }
        
        // Показываем состояние загрузки
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Собираем данные
        const data = {
            name: name,
            attendance: attendance,
            phone: phone,
            email: formData.get('email')?.trim() || '',
            guests: formData.get('guests') || '1',
            message: formData.get('message')?.trim() || ''
        };
        
        console.log('RSVP данные:', data);
        
        // Имитация отправки (замените на реальный API)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Здесь можно добавить реальную отправку
            // await sendToTelegram(data);
            
            showNotification('Спасибо! Ваше подтверждение отправлено 🎉', 'success');
            form.reset();
        } catch (error) {
            console.error('Ошибка отправки:', error);
            showNotification('Ошибка при отправке. Пожалуйста, свяжитесь с нами напрямую', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// ===================================
// Маска для телефона
// ===================================
function initPhoneMask() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value[0] === '7' || value[0] === '8') {
                value = value.substring(1);
            }
        }
        
        let formattedValue = '+7';
        if (value.length > 0) formattedValue += ' (' + value.substring(0, 3);
        if (value.length >= 3) formattedValue += ') ' + value.substring(3, 6);
        if (value.length >= 6) formattedValue += '-' + value.substring(6, 8);
        if (value.length >= 8) formattedValue += '-' + value.substring(8, 10);
        
        e.target.value = formattedValue.substring(0, 18);
    });
}

// ===================================
// FAQ Аккордеон
// ===================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Закрываем все остальные
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Переключаем текущий
            item.classList.toggle('active', !isActive);
        });
    });
}

// ===================================
// Анимации при скролле
// ===================================
function initScrollAnimations() {
    // Анимация секций
    const sections = document.querySelectorAll('.story, .gallery, .details, .program, .dresscode, .faq, .rsvp');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-section', 'visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    sections.forEach(section => {
        section.classList.add('fade-in-section');
        sectionObserver.observe(section);
    });
    
    // Анимация timeline отношений
    const timelineItems = document.querySelectorAll('.relationship-timeline .timeline-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 200);
                timelineObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    });
    
    timelineItems.forEach(item => timelineObserver.observe(item));
}

// ===================================
// Карта Яндекс
// ===================================
function initMap() {
    // Проверяем, загрузился ли API Яндекс.Карт
    if (!window.ymaps) {
        console.error('API Яндекс.Карт не загружен');
        return;
    }
    
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    // Координаты ЗАГСА: ул. Ленина, 251, Ставрополь
    // ЗАГС Ставропольского края по Ленинскому району
    // Точные координаты: 45.039469, 41.958052
    const zagrosCoords = [45.039469, 41.958052];
    
    ymaps.ready(init);
    
    function init() {
        const map = new ymaps.Map('map', {
            center: zagrosCoords,
            zoom: 17,
            controls: ['zoomControl']
        });
        
        // Отключаем скролл зума колёсиком
        map.behaviors.disable('scrollZoom');
        
        // Создаём маркер с кастомным содержимым
        const placemark = new ymaps.Placemark(zagrosCoords, {
            balloonContent: `
                <strong>🎉 ЗАГС Ленинского района</strong><br>
                Свадьба Даниила и Ирины<br>
                19 сентября 2026, 14:50<br>
                ул. Ленина, 251, Ставрополь
            `,
            hintContent: 'ЗАГС — место регистрации'
        }, {
            preset: 'islands#weddingIcon'
        });
        
        map.geoObjects.add(placemark);
        
        // Открываем балун при загрузке
        placemark.balloon.open();
    }
}

// ===================================
// Карта ресторана
// ===================================
function initVenueMap() {
    // Проверяем, загрузился ли API Яндекс.Карт
    if (!window.ymaps) {
        console.error('API Яндекс.Карт не загружен');
        return;
    }
    
    const mapElement = document.getElementById('venueMap');
    if (!mapElement) return;
    
    // Координаты ресторана (замените на реальные, когда будут известны)
    // Сейчас стоят примерные координаты центра Ставрополя
    const restaurantCoords = [45.0428, 41.9734];
    
    ymaps.ready(init);
    
    function init() {
        const map = new ymaps.Map('venueMap', {
            center: restaurantCoords,
            zoom: 15,
            controls: ['zoomControl']
        });
        
        // Отключаем скролл зума колёсиком
        map.behaviors.disable('scrollZoom');
        
        // Создаём маркер с кастомным содержимым
        const placemark = new ymaps.Placemark(restaurantCoords, {
            balloonContent: `
                <strong>🍽️ Ресторан</strong><br>
                Свадьба Даниила и Ирины<br>
                19 сентября 2026, 16:00<br>
                Адрес будет указан позже
            `,
            hintContent: 'Ресторан — место банкета'
        }, {
            preset: 'islands#restaurantIcon'
        });
        
        map.geoObjects.add(placemark);
    }
}

// ===================================
// Уведомления
// ===================================
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===================================
// Отправка в Telegram (пример)
// ===================================
async function sendToTelegram(formData) {
    // Замените на ваши данные
    const BOT_TOKEN = 'YOUR_BOT_TOKEN';
    const CHAT_ID = 'YOUR_CHAT_ID';
    
    const message = `
🎉 Новое подтверждение на свадьбу!

👤 Имя: ${formData.name}
✅ Присутствие: ${formData.attendance === 'yes' ? 'Приду 🎉' : 'Не приду 😔'}
📱 Телефон: ${formData.phone}
👥 Гостей: ${formData.guests}
📧 Email: ${formData.email || 'Не указан'}
💬 Сообщение: ${formData.message || 'Нет'}
    `.trim();
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message
        })
    });
    
    if (!response.ok) {
        throw new Error('Ошибка отправки в Telegram');
    }
    
    return response;
}

// ===================================
// Логирование загрузки
// ===================================
console.log('💒 Свадебный сайт Даниила и Ирины загружен!');
console.log('📅 Дата свадьбы: 19 сентября 2026');
console.log('❤️ С любовью...');

// ===================================
// Настройка кнопки связи (замените номер на свой)
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        // Замените на ваш номер телефона
        contactBtn.href = 'tel:+79990000000';
    }
});
