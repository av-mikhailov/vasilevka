(function() {
    "use strict";

    // --- КОНСТАНТЫ И ХЕЛПЕРЫ ---
    
    // HEX-код для $color-accent-alt, используется для цвета мигающего курсора.
    // Если ACCENT_COLOR_HEX не используется в других местах, его можно удалить.
    const ACCENT_COLOR_HEX = "#917A5A"; 

    // Хелпер для выбора элемента (улучшено)
    const select = (el, all = false) => {
        el = el.trim();
        const node = document.querySelector(el);
        if (all) {
            return [...document.querySelectorAll(el)];
        } else {
            return node;
        }
    }

    // --- ФУНКЦИИ КОМПОНЕНТОВ ---

    /**
     * Применение класса 'scrolled' к <body> при прокрутке
     */
    const selectBody = select('body');
    const selectHeader = select('#header');
    
    function toggleScrolled() {
        if (!selectBody || !selectHeader) return; 
        
        window.scrollY > 100 
            ? selectBody.classList.add('scrolled') 
            : selectBody.classList.remove('scrolled');
    }

    /**
     * Открытие/закрытие мобильного меню
     */
    const mobileNavToggleBtn = select('.mobile-nav-toggle');

    function mobileNavToogle() {
        if (!selectBody || !mobileNavToggleBtn) return;
        
        selectBody.classList.toggle('mobile-nav-active');
        mobileNavToggleBtn.classList.toggle('bx-menu');
        mobileNavToggleBtn.classList.toggle('bx-x');
    }


    /**
     * Scroll top button (Кнопка "Наверх")
     */
    const scrollTop = select('.scroll-top');

    function toggleScrollTop() {
        // Проверка на scrollTop не нужна, т.к. она есть в блоке навешивания слушателей
        window.scrollY > 100 
            ? scrollTop.classList.add('active') 
            : scrollTop.classList.remove('active');
    }
    

    /**
     * Эффект печатания (Typing Effect)
     * (Логика оставлена без изменений, т.к. она правильно рассчитывает динамическую ширину)
     */
    function setupTypingEffect() {
        const el = document.querySelector('.typed-text');
        if (!el) return;

        const text = el.textContent.trim();
        const charCount = text.length;
        
        // 1. Измеряем точную финальную ширину текста
        el.style.visibility = 'hidden'; 
        el.style.width = 'auto'; 
        
        const finalWidth = el.offsetWidth + 'px';
        
        el.style.width = '0';
        el.style.visibility = 'visible';
        
        // 2. Добавление @keyframes
        const styleSheet = document.styleSheets[0];
        let hasTypingKeyframes = false;
        
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].name === 'typing' || styleSheet.cssRules[i].name === 'blink') {
                hasTypingKeyframes = true;
                break;
            }
        }

        if (!hasTypingKeyframes) {
            styleSheet.insertRule(`
                @keyframes typing {
                    from { width: 0 }
                    to { width: ${finalWidth} } 
                }
            `, styleSheet.cssRules.length);

            styleSheet.insertRule(`
                @keyframes blink {
                    from, to { border-color: transparent }
                    50% { border-color: ${ACCENT_COLOR_HEX} } 
                }
            `, styleSheet.cssRules.length);
        }
        
        // 3. Применяем анимацию
        const animationDuration = `${charCount * 0.15}s`; 
        
        el.classList.remove('typing-complete');
        el.style.animation = `typing ${animationDuration} steps(${charCount}, end) forwards, blink .75s step-end infinite`;
        
        // 4. Обработчик завершения анимации печатания
        el.addEventListener('animationend', (e) => {
            if (e.animationName === 'typing') {
                el.style.animation = `none`; 
                el.classList.add('typing-complete');
                el.style.animation = `blink .75s step-end infinite`; 
            }
        }, { once: true });
    }

    // --- НАВЕШИВАНИЕ СЛУШАТЕЛЕЙ (SCROLL, LOAD, CLICK) ---
    
    // Общие слушатели для прокрутки и загрузки (Scrolled Class, Scroll Top)
    document.addEventListener('scroll', toggleScrolled);
    window.addEventListener('load', toggleScrolled);

    if (mobileNavToggleBtn) {
        mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    }
    
    // Слушатели для кнопки "Наверх"
    if (scrollTop) {
        scrollTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        window.addEventListener('load', toggleScrollTop);
        document.addEventListener('scroll', toggleScrollTop);
    }

    // Слушатель для эффекта печатания (должен быть после загрузки DOM)
    window.addEventListener('load', setupTypingEffect);

    // --- ИНИЦИАЛИЗАЦИЯ (DOMContentLoaded) ---
    
    document.addEventListener('DOMContentLoaded', () => {

        // 1. Инициализация AOS (Оставлена одна, более полная версия)
        AOS.init({
            duration: 800, 
            once: true,    
            mirror: false, 
            offset: 150,   
        });
        
        // 2. Инициализация Pure Counter
        new PureCounter();

        // 3. Инициализация Swiper для блока Особенностей (Features Grid)
        new Swiper('.features-grid', {
            slidesPerView: 'auto',
            spaceBetween: 10,
            grabCursor: true,
            freeMode: true,
            loop: false, 
            breakpoints: {
                992: { 
                    slidesPerView: 6,
                    spaceBetween: 20,
                    allowTouchMove: false,
                    grabCursor: false,
                    freeMode: false,
                }
            }
        });
        
        // 4. Инициализация Swiper для Фотогалереи (Gallery)
        new Swiper('.gallery-slider', {
            speed: 600,
            loop: true,
            autoplay: {
                delay: 10000,
                disableOnInteraction: false
            },
            slidesPerView: 'auto',
            breakpoints: {
                320: {
                    slidesPerView: 1.2,
                    spaceBetween: 5
                },
                768: {
                    slidesPerView: 2.5,
                    spaceBetween: 10
                },
                1024: {
                    slidesPerView: 3, 
                    spaceBetween: 15
                }
            },
            pagination: {
                el: '.gallery-navigation .swiper-pagination',
                type: 'bullets',
                clickable: true
            },
            navigation: {
                nextEl: '.gallery-navigation .swiper-button-next',
                prevEl: '.gallery-navigation .swiper-button-prev'
            }
        });


        // 5. Инициализация Glightbox для лайтбокса галереи
        GLightbox({
            selector: '.glightbox',
            touchNavigation: true,
            loop: true,
            autoplayVideos: true,
        });
    });

    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('eventSubmitForm');
        const steps = form.querySelectorAll('.form-step');
        const nextBtn = document.getElementById('next-step-btn');
        const prevBtn = document.getElementById('prev-step-btn');
        const submitBtn = document.getElementById('submit-form-btn');
        const indicator = document.getElementById('step-indicator');
        
        let currentStep = 0; // Начинаем с первого шага (индекс 0)

        function updateForm() {
            // 1. Скрываем/показываем шаги
            steps.forEach((step, index) => {
                step.style.display = (index === currentStep) ? 'block' : 'none';
            });

            // 2. Обновляем индикатор
            indicator.textContent = `Шаг ${currentStep + 1} из ${steps.length}: ${getStepTitle(currentStep)}`;

            // 3. Управляем кнопками "Назад"
            prevBtn.style.display = (currentStep === 0) ? 'none' : 'block';

            // 4. Управляем кнопками "Далее"/"Отправить"
            if (currentStep === steps.length - 1) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }

        function getStepTitle(index) {
            // Удобная функция для индикатора
            switch(index) {
                case 0: return 'Контакты';
                case 1: return 'Описание мероприятия';
                case 2: return 'Требования и согласие';
                default: return '';
            }
        }

        function validateStep(stepIndex) {
            // Простая валидация (нужно улучшить для полной проверки)
            const currentStepEl = steps[stepIndex];
            const requiredInputs = currentStepEl.querySelectorAll('[required]');
            
            let isValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
                    // В реальном проекте здесь нужно добавить Bootstrap-класс invalid-feedback
                    isValid = false;
                }
            });
            
            return isValid;
        }

        // Обработчики кнопок
        nextBtn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                updateForm();
            } else {
                alert('Пожалуйста, заполните все обязательные поля.');
            }
        });

        prevBtn.addEventListener('click', () => {
            currentStep--;
            updateForm();
        });

        // Инициализация формы
        updateForm(); 
    });

   // Этот код должен быть в вашем основном файле JS (например, main.js)
document.addEventListener('DOMContentLoaded', () => {
    
    // Проверяем, существуют ли элементы перед инициализацией
    const imageSliderEl = document.getElementById('HistoryImageSlider');
    const textSliderEl = document.getElementById('HistoryTextSlider');
    if (!imageSliderEl || !textSliderEl) return;

    // 1. Инициализируем Swiper для изображений (основной)
    const imageSlider = new Swiper(imageSliderEl, {
        loop: false,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        speed: 500,
        allowTouchMove: false, // Запрещаем перетаскивание
    });

    // 2. Инициализируем Swiper для текста (синхронизируется с изображениями)
    const textSlider = new Swiper(textSliderEl, {
        loop: false,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        speed: 500,
        autoHeight: true, // Адаптируем высоту под текст
        allowTouchMove: false,
        // Синхронизация:
        controller: {
            control: imageSlider
        }
    });

    // 3. Обработка кликов по точкам таймлайна
    const navPoints = document.querySelectorAll('#HistoryTimelineNav .timeline-nav-point');
    navPoints.forEach((point, index) => {
        point.addEventListener('click', () => {
            // Сброс активного состояния
            navPoints.forEach(p => p.classList.remove('active'));
            // Установка активного состояния
            point.classList.add('active');
            
            // Переключение слайдеров
            imageSlider.slideTo(index);
            textSlider.slideTo(index);
        });
    });

    // Дополнительно: Обработка свайпа (хотя разрешено только через точки)
    // Если слайдер сменится (например, при смене размера окна), обновить точки
    textSlider.on('slideChange', function () {
        navPoints.forEach(p => p.classList.remove('active'));
        navPoints[textSlider.activeIndex].classList.add('active');
    });

    // Устанавливаем активное состояние при первой загрузке (если не установлено в HTML)
    if (!document.querySelector('#HistoryTimelineNav .active')) {
        navPoints[0].classList.add('active');
    }
});

})();