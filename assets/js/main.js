(function() {
    "use strict";

    // --- КОНСТАНТЫ И ХЕЛПЕРЫ ---
    const ACCENT_COLOR_HEX = "#917A5A"; 

    /**
     * Хелпер для выбора DOM-элементов.
     * @param {string} el - CSS-селектор
     * @param {boolean} [all=false] - Возвращать все элементы
     */
    const select = (el, all = false) => {
        el = el.trim();
        if (all) {
            return [...document.querySelectorAll(el)];
        } else {
            return document.querySelector(el);
        }
    }
    
    // --- ФУНКЦИЯ ДЛЯ ВЫДЕЛЕНИЯ АКТИВНОГО ПУНКТА МЕНЮ (НАВИГАЦИИ) ---
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        const normalizedCurrentPath = currentPath.replace(/^\/|\/$/g, '');

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref) return; 

            const normalizedLinkHref = linkHref.replace(/^\/|\/$/g, '');
            
            if (normalizedLinkHref === '' && (normalizedCurrentPath === '' || normalizedCurrentPath === 'index.html')) {
                 link.classList.add('active');
                 return;
            }

            if (normalizedCurrentPath === normalizedLinkHref) {
                link.classList.add('active');
                return;
            }
            
            const sectionName = normalizedLinkHref.replace('.html', '');
            if (sectionName !== '' && normalizedCurrentPath.startsWith(sectionName) && sectionName !== 'index') {
                link.classList.add('active');
            }
        });
    }

    // 🚀 ВЫЗЫВАЕМ СРАЗУ
    setActiveNavLink();


    // --- ФУНКЦИИ КОМПОНЕНТОВ (Header, Typing Effect, Scroll Top) ---

    const selectBody = select('body');
    const selectHeader = select('#header');
    const mobileNavToggleBtn = select('.mobile-nav-toggle');
    const scrollTop = select('.scroll-top');
    
    /** Применение класса 'scrolled' к <body> при прокрутке */
    function toggleScrolled() {
        if (!selectBody || !selectHeader) return; 
        
        window.scrollY > 100 
            ? selectBody.classList.add('scrolled') 
            : selectBody.classList.remove('scrolled');
    }

    /** Открытие/закрытие мобильного меню */
    function mobileNavToogle() {
        if (!selectBody || !mobileNavToggleBtn) return;
        
        selectBody.classList.toggle('mobile-nav-active');
        mobileNavToggleBtn.classList.toggle('bx-menu');
        mobileNavToggleBtn.classList.toggle('bx-x');
    }

    /** Scroll top button (Кнопка "Наверх") */
    function toggleScrollTop() {
        if (!scrollTop) return;
        window.scrollY > 100 
            ? scrollTop.classList.add('active') 
            : scrollTop.classList.remove('active');
    }
    
    /** Эффект печатания (Typing Effect) */
    function setupTypingEffect() {
        const el = document.querySelector('.typed-text');
        if (!el) return;

        const text = el.textContent.trim();
        const charCount = text.length;
        const styleSheet = document.styleSheets[0];
        let hasTypingKeyframes = false;
        
        // Измерение точной финальной ширины текста
        el.style.visibility = 'hidden'; 
        el.style.width = 'auto'; 
        const finalWidth = el.offsetWidth + 'px';
        el.style.width = '0';
        el.style.visibility = 'visible';
        
        // Проверка и добавление @keyframes
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].name === 'typing' || styleSheet.cssRules[i].name === 'blink') {
                hasTypingKeyframes = true;
                break;
            }
        }

        if (!hasTypingKeyframes) {
            styleSheet.insertRule(`@keyframes typing { from { width: 0 } to { width: ${finalWidth} } }`, styleSheet.cssRules.length);
            styleSheet.insertRule(`@keyframes blink { from, to { border-color: transparent } 50% { border-color: ${ACCENT_COLOR_HEX} } }`, styleSheet.cssRules.length);
        }
        
        // Применение анимации
        const animationDuration = `${charCount * 0.15}s`; 
        
        el.classList.remove('typing-complete');
        el.style.animation = `typing ${animationDuration} steps(${charCount}, end) forwards, blink .75s step-end infinite`;
        
        // Обработчик завершения анимации печатания
        el.addEventListener('animationend', (e) => {
            if (e.animationName === 'typing') {
                el.style.animation = `none`; 
                el.classList.add('typing-complete');
                el.style.animation = `blink .75s step-end infinite`; 
            }
        }, { once: true });
    }
    
    // --- НОВАЯ ФУНКЦИЯ: ПЛАВНЫЙ ПЕРЕХОД ВИДЕО/ПОСТЕРА ---
    function setupHeroVideoTransition() {
        const video = select('#hero-video');
        const heroContainer = select('.hero'); // Ваш контейнер, куда добавляем класс is-ready

        if (!video || !heroContainer) return;

        // Событие срабатывает, когда видео загружено достаточно,
        // чтобы воспроизвести его до конца без прерываний
        video.addEventListener('canplaythrough', function() {
            // Добавляем класс, который запускает CSS-переход
            heroContainer.classList.add('is-ready');
        }, { once: true });
        
        // Если видео уже воспроизводится, но событие не сработало (иногда бывает в Safari),
        // можно добавить проверку:
        if (video.readyState >= 4) { // 4 = HAVE_ENOUGH_DATA
             heroContainer.classList.add('is-ready');
        } else {
             // Принудительно запускаем загрузку/буферизацию, чтобы canplaythrough сработало
             video.load(); 
        }
    }


    // --- ФУНКЦИИ ФОРМЫ ---
    function setupMultiStepForm() {
        const form = document.getElementById('eventSubmitForm');
        if (!form) return;
        
        const steps = form.querySelectorAll('.form-step');
        const nextBtn = document.getElementById('next-step-btn');
        const prevBtn = document.getElementById('prev-step-btn');
        const submitBtn = document.getElementById('submit-form-btn');
        const indicator = document.getElementById('step-indicator');
        
        let currentStep = 0; 

        const getStepTitle = (index) => {
            switch(index) {
                case 0: return 'Контакты';
                case 1: return 'Описание мероприятия';
                case 2: return 'Требования и согласие';
                default: return '';
            }
        }
        
        const validateStep = (stepIndex) => {
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

        const updateForm = () => {
            steps.forEach((step, index) => {
                step.style.display = (index === currentStep) ? 'block' : 'none';
            });

            indicator.textContent = `Шаг ${currentStep + 1} из ${steps.length}: ${getStepTitle(currentStep)}`;

            prevBtn.style.display = (currentStep === 0) ? 'none' : 'block';

            if (currentStep === steps.length - 1) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }

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

        updateForm();
    }
    
    // --- ФУНКЦИЯ ДЛЯ АККОРДЕОНА ПРОСТРАНСТВ (DESKTOP) ---
    function setupSpacesAccordion() {
        const spacesRow = document.querySelector('.spaces-row');
        if (!spacesRow) return;

        const spaceItems = spacesRow.querySelectorAll('.space-item');

        spaceItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('space-item-active')) {
                    return; 
                }

                const currentActive = spacesRow.querySelector('.space-item-active');

                // 3. Сворачиваем текущий активный элемент (col-lg-5 -> col-lg-1)
                if (currentActive) {
                    currentActive.classList.remove('space-item-active', 'col-lg-5');
                    currentActive.classList.add('col-lg-1');
                    
                    // Показываем вертикальные элементы, скрываем широкий заголовок
                    currentActive.querySelector('.space-title').style.display = 'none';
                    currentActive.querySelector('.space-vertical-title').style.display = '';
                    currentActive.querySelector('.space-action-button').style.display = '';
                }

                // 4. Разворачиваем кликнутый элемент (col-lg-1 -> col-lg-5)
                item.classList.add('space-item-active', 'col-lg-5');
                item.classList.remove('col-lg-1');
                
                // Скрываем вертикальные элементы, показываем широкий заголовок
                item.querySelector('.space-title').style.display = '';
                item.querySelector('.space-vertical-title').style.display = 'none';
                item.querySelector('.space-action-button').style.display = 'none';
            });
        });
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

        // 6. ИНИЦИАЛИЗАЦИЯ АККОРДЕОНА ПРОСТРАНСТВ (DESKTOP)
        setupSpacesAccordion();
        
        // 7. ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРА ПРОСТРАНСТВ (MOBILE)
        if (select('.swiper-spaces')) {
            new Swiper('.swiper-spaces', {
                speed: 600,
                loop: true,
                slidesPerView: 'auto',
                // Частичное отображение следующего слайда
                breakpoints: {
                    320: { slidesPerView: 1.1, spaceBetween: 10 }, 
                    576: { slidesPerView: 1.5, spaceBetween: 15 },
                    768: { slidesPerView: 2.2, spaceBetween: 20 }
                },
                pagination: {
                    el: '.spaces-swiper-mobile .swiper-pagination',
                    type: 'bullets',
                    clickable: true
                },
                // 💡 ДОБАВЛЕНО: Навигационные кнопки
                navigation: {
                    nextEl: '.spaces-swiper-mobile .swiper-button-next', // Используем специфичный селектор для мобильного контейнера
                    prevEl: '.spaces-swiper-mobile .swiper-button-prev'
                }
            });
        }

        // 8. ИНИЦИАЛИЗАЦИЯ ТАЙМЛАЙНА С ТРЕМЯ СЛАЙДЕРАМИ
        const imageSliderEl = document.getElementById('HistoryImageSlider');
        const textSliderEl = document.getElementById('HistoryTextSlider');
        const yearSliderEl = document.getElementById('HistoryYearSlider'); 
        
        if (imageSliderEl && textSliderEl && yearSliderEl) {
            
            // --- СЛАЙДЕРЫ ---

            const imageSlider = new Swiper(imageSliderEl, {
                loop: false, effect: 'fade', fadeEffect: { crossFade: true },
                speed: 500, allowTouchMove: false,
            });

            const textSlider = new Swiper(textSliderEl, {
                loop: false, effect: 'fade', fadeEffect: { crossFade: true },
                speed: 500, autoHeight: true, allowTouchMove: false,
                controller: { control: imageSlider }
            });

            const navPoints = document.querySelectorAll('#HistoryTimelineNav .timeline-nav-point');
            const yearSwiperWrapper = yearSliderEl.querySelector('.swiper-wrapper');

            navPoints.forEach(point => {
                const year = point.getAttribute('data-year');
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                slide.textContent = year;
                yearSwiperWrapper.appendChild(slide);
            });

            const yearSlider = new Swiper(yearSliderEl, {
                direction: 'vertical', 
                loop: false, speed: 500, allowTouchMove: false,
                controller: { control: textSlider }
            });

            // --- ОБРАБОТЧИКИ ---
            navPoints.forEach((point, index) => {
                // Коррекция тега, если это не кнопка
                if (point.tagName.toLowerCase() !== 'button') {
                    point.outerHTML = `<button class="timeline-nav-point" data-year="${point.dataset.year}">${point.innerHTML}</button>`;
                }
                
                const currentPoint = document.querySelectorAll('#HistoryTimelineNav .timeline-nav-point')[index];

                currentPoint.addEventListener('click', () => {
                    navPoints.forEach(p => p.classList.remove('active'));
                    currentPoint.classList.add('active');
                    
                    imageSlider.slideTo(index);
                    textSlider.slideTo(index);
                    yearSlider.slideTo(index); 
                });
            });

            textSlider.on('slideChange', function () {
                const activeIndex = textSlider.activeIndex;
                
                navPoints.forEach(p => p.classList.remove('active'));
                navPoints[activeIndex].classList.add('active');
                
                yearSlider.slideTo(activeIndex);
            });
            
            // Инициализация первого активного состояния
            if (!document.querySelector('#HistoryTimelineNav .active')) {
                navPoints[0].classList.add('active');
            } else {
                 const activeIndex = Array.from(navPoints).findIndex(p => p.classList.contains('active'));
                 if (activeIndex !== -1) {
                     imageSlider.slideTo(activeIndex, 0); 
                     textSlider.slideTo(activeIndex, 0);
                     yearSlider.slideTo(activeIndex, 0);
                 }
            }
        }
        
        // 9. ИНИЦИАЛИЗАЦИЯ ПЛАВНОГО ПЕРЕХОДА ВИДЕО
        setupHeroVideoTransition();
        
    });

    // --- НАВЕШИВАНИЕ СЛУШАТЕЛЕЙ (SCROLL, LOAD, CLICK) ---
    
    document.addEventListener('scroll', toggleScrolled);
    window.addEventListener('load', toggleScrolled);

    if (mobileNavToggleBtn) {
        mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    }
    
    if (scrollTop) {
        scrollTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.addEventListener('load', toggleScrollTop);
        document.addEventListener('scroll', toggleScrollTop);
    }

    window.addEventListener('load', setupTypingEffect);
    
    document.addEventListener('DOMContentLoaded', setupMultiStepForm);
    
})();