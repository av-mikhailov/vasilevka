(function() {
    "use strict";

    // --- КОНСТАНТЫ И ХЕЛПЕРЫ ---
    const ACCENT_COLOR_HEX = "#917A5A"; 
    const select = (el, all = false) => {
        el = el.trim();
        const node = document.querySelector(el);
        if (all) {
            return [...document.querySelectorAll(el)];
        } else {
            return node;
        }
    }
    
    // --- ФУНКЦИЯ ДЛЯ ВЫДЕЛЕНИЯ АКТИВНОГО ПУНКТА МЕНЮ (НАВИГАЦИИ) ---
    // Вынесена из DOMContentLoaded, чтобы класс 'active' применялся как можно раньше
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Нормализация пути: удаляем слэши в начале и конце
        const normalizedCurrentPath = currentPath.replace(/^\/|\/$/g, '');

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            
            if (!linkHref) return; 

            // Нормализация пути ссылки
            const normalizedLinkHref = linkHref.replace(/^\/|\/$/g, '');
            
            // Проверка для главной страницы (index.html или '/')
            if (normalizedLinkHref === '' && (normalizedCurrentPath === '' || normalizedCurrentPath === 'index.html')) {
                 link.classList.add('active');
                 return;
            }

            // Проверка на точное совпадение
            if (normalizedCurrentPath === normalizedLinkHref) {
                link.classList.add('active');
                return;
            }
            
            // Проверка для внутренних страниц (URL содержит имя раздела)
            const sectionName = normalizedLinkHref.replace('.html', '');
            if (sectionName !== '' && normalizedCurrentPath.startsWith(sectionName) && sectionName !== 'index') {
                link.classList.add('active');
            }
        });
    }

    // 🚀 ВЫЗЫВАЕМ СРАЗУ, чтобы класс active добавился до рендеринга страницы
    setActiveNavLink();


    // --- ФУНКЦИИ КОМПОНЕНТОВ (Header, Typing Effect, Scroll Top) ---

    const selectBody = select('body');
    const selectHeader = select('#header');
    
    /**
     * Применение класса 'scrolled' к <body> при прокрутке
     */
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
        if (!scrollTop) return;
        window.scrollY > 100 
            ? scrollTop.classList.add('active') 
            : scrollTop.classList.remove('active');
    }
    
    /**
     * Эффект печатания (Typing Effect)
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
        
        // 2. Добавление @keyframes (если их нет)
        const styleSheet = document.styleSheets[0];
        let hasTypingKeyframes = false;
        
        // Проверяем, есть ли уже правила typing и blink
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

    // --- ФУНКЦИИ ФОРМЫ (Ваша оригинальная логика) ---
    function setupMultiStepForm() {
        const form = document.getElementById('eventSubmitForm');
        if (!form) return;
        
        const steps = form.querySelectorAll('.form-step');
        const nextBtn = document.getElementById('next-step-btn');
        const prevBtn = document.getElementById('prev-step-btn');
        const submitBtn = document.getElementById('submit-form-btn');
        const indicator = document.getElementById('step-indicator');
        
        let currentStep = 0; // Начинаем с первого шага (индекс 0)

        function getStepTitle(index) {
            switch(index) {
                case 0: return 'Контакты';
                case 1: return 'Описание мероприятия';
                case 2: return 'Требования и согласие';
                default: return '';
            }
        }
        
        function validateStep(stepIndex) {
            const currentStepEl = steps[stepIndex];
            const requiredInputs = currentStepEl.querySelectorAll('[required]');
            let isValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
                    isValid = false;
                }
            });
            return isValid;
        }

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
    }


    // --- ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРОВ И AOS (DOMContentLoaded) ---
    
    document.addEventListener('DOMContentLoaded', () => {

        // 1. Инициализация AOS 
        AOS.init({
            duration: 800, 
            once: true,   
            mirror: false, 
            offset: 150,   
        });
        
        // 2. Инициализация Pure Counter
        if (typeof PureCounter !== 'undefined') {
             new PureCounter();
        }

        // 3. Инициализация Glightbox для лайтбокса галереи
        if (typeof GLightbox !== 'undefined') {
            GLightbox({
                selector: '.glightbox',
                touchNavigation: true,
                loop: true,
                autoplayVideos: true,
            });
        }
        
        // 4. Инициализация Swiper для блока Особенностей (Features Grid)
        if (select('.features-grid')) {
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
        }

        // 5. Инициализация Swiper для Фотогалереи (Gallery)
        if (select('.gallery-slider')) {
            new Swiper('.gallery-slider', {
                speed: 600,
                loop: true,
                autoplay: {
                    delay: 10000,
                    disableOnInteraction: false
                },
                slidesPerView: 'auto',
                breakpoints: {
                    320: { slidesPerView: 1.2, spaceBetween: 5 },
                    768: { slidesPerView: 2.5, spaceBetween: 10 },
                    1024: { slidesPerView: 3, spaceBetween: 15 }
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
        }


        // 6. ИНИЦИАЛИЗАЦИЯ ТАЙМЛАЙНА С ТРЕМЯ СЛАЙДЕРАМИ 🔥
        
        const imageSliderEl = document.getElementById('HistoryImageSlider');
        const textSliderEl = document.getElementById('HistoryTextSlider');
        const yearSliderEl = document.getElementById('HistoryYearSlider'); 
        
        if (imageSliderEl && textSliderEl && yearSliderEl) {
            
            // --- СЛАЙДЕРЫ ---

            // 1. Изображения (Основной)
            const imageSlider = new Swiper(imageSliderEl, {
                loop: false,
                effect: 'fade',
                fadeEffect: { crossFade: true },
                speed: 500,
                allowTouchMove: false,
            });

            // 2. Текст (Синхронизирован с Изображениями)
            const textSlider = new Swiper(textSliderEl, {
                loop: false,
                effect: 'fade',
                fadeEffect: { crossFade: true },
                speed: 500,
                autoHeight: true, 
                allowTouchMove: false,
                controller: {
                    control: imageSlider
                }
            });

            // 3. Вертикальный Год (Одометр)
            const navPoints = document.querySelectorAll('#HistoryTimelineNav .timeline-nav-point');
            const yearSwiperWrapper = yearSliderEl.querySelector('.swiper-wrapper');

            // Наполняем Year Slider данными из навигации
            navPoints.forEach(point => {
                const year = point.getAttribute('data-year');
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                slide.textContent = year;
                yearSwiperWrapper.appendChild(slide);
            });

            const yearSlider = new Swiper(yearSliderEl, {
                direction: 'vertical', // 💡 КЛЮЧ: вертикальное перелистывание
                loop: false,
                speed: 500,
                allowTouchMove: false,
                // Синхронизация с текстовым слайдером
                controller: {
                    control: textSlider
                }
            });

            // --- ОБРАБОТЧИКИ ---

            // Обработка кликов по точкам таймлайна
            navPoints.forEach((point, index) => {
                // Преобразуем <div> или <button> в рабочие кнопки
                if (point.tagName.toLowerCase() !== 'button') {
                    point.outerHTML = `<button class="timeline-nav-point" data-year="${point.dataset.year}">${point.innerHTML}</button>`;
                }
                
                // Перезагружаем коллекцию после возможной замены тегов
                const currentPoint = document.querySelectorAll('#HistoryTimelineNav .timeline-nav-point')[index];

                currentPoint.addEventListener('click', () => {
                    // Сброс и установка активного состояния точки
                    navPoints.forEach(p => p.classList.remove('active'));
                    currentPoint.classList.add('active');
                    
                    // Переключение всех трех слайдеров
                    imageSlider.slideTo(index);
                    textSlider.slideTo(index);
                    yearSlider.slideTo(index); 
                });
            });

            // Обработка смены слайда (синхронизация активной точки)
            textSlider.on('slideChange', function () {
                const activeIndex = textSlider.activeIndex;
                
                // Обновляем активную точку
                navPoints.forEach(p => p.classList.remove('active'));
                navPoints[activeIndex].classList.add('active');
                
                // Синхронизация года (если сменилось не через клик)
                yearSlider.slideTo(activeIndex);
            });
            
            // Инициализация первого активного состояния
            if (!document.querySelector('#HistoryTimelineNav .active')) {
                // Если активный класс не установлен в HTML, устанавливаем на первом элементе
                navPoints[0].classList.add('active');
            } else {
                 // Убеждаемся, что слайдеры стоят на активном элементе
                 const activeIndex = Array.from(navPoints).findIndex(p => p.classList.contains('active'));
                 if (activeIndex !== -1) {
                     imageSlider.slideTo(activeIndex, 0); // Без анимации
                     textSlider.slideTo(activeIndex, 0);
                     yearSlider.slideTo(activeIndex, 0);
                 }
            }
        }
        
    });

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.addEventListener('load', toggleScrollTop);
        document.addEventListener('scroll', toggleScrollTop);
    }

    // Слушатель для эффекта печатания
    window.addEventListener('load', setupTypingEffect);
    
    // Слушатель для многошаговой формы
    document.addEventListener('DOMContentLoaded', setupMultiStepForm);
    
})();