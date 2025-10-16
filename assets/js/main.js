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

})();