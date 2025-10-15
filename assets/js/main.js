// Инициализация AOS
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        // Настройки по умолчанию:
        duration: 800,       // Продолжительность анимации в мс
        once: true,          // Анимировать только один раз при прокрутке вниз
        mirror: false,       // Анимировать при прокрутке вверх/вниз
        offset: 150,         // Расстояние (в px) от нижнего края окна, с которого начинается анимация
    });
});

(function() {
  "use strict";
  
  // HEX-код для $color-accent-alt (#B08953), используется для цвета мигающего курсора.
  const ACCENT_COLOR_HEX = "#917A5A"; 

  // Хелпер для выбора элемента
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Применение класса 'scrolled' к <body> при прокрутке
   * Управляет инверсией цвета хедера
   */
  function toggleScrolled() {
    const selectBody = select('body');
    const selectHeader = select('#header');
    if (!selectBody || !selectHeader) return; 
    
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);


  /**
   * Открытие/закрытие мобильного меню
   */
  const mobileNavToggleBtn = select('.mobile-nav-toggle');

  function mobileNavToogle() {
    const body = select('body');
    if (!body || !mobileNavToggleBtn) return;
    
    body.classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bx-menu');
    mobileNavToggleBtn.classList.toggle('bx-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
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
      // Временно делаем текст видимым, но скрытым за пределами экрана
      el.style.visibility = 'hidden'; 
      el.style.width = 'auto'; // Позволяем элементу занять естественную ширину
      
      // Читаем финальную ширину
      const finalWidth = el.offsetWidth + 'px';
      
      // Сбрасываем стили для начала анимации
      el.style.width = '0';
      el.style.visibility = 'visible';
      
      // 2. Добавление @keyframes (Оставить без изменений)
      const styleSheet = document.styleSheets[0];
      let hasTypingKeyframes = false;
      
      for (let i = 0; i < styleSheet.cssRules.length; i++) {
          if (styleSheet.cssRules[i].name === 'typing' || styleSheet.cssRules[i].name === 'blink') {
              hasTypingKeyframes = true;
              break;
          }
      }

      if (!hasTypingKeyframes) {
          // Ключевые кадры для анимации печатания
          styleSheet.insertRule(`
              @keyframes typing {
                  from { width: 0 }
                  to { width: ${finalWidth} } /* ИСПОЛЬЗУЕМ ИЗМЕРЕННУЮ ШИРИНУ! */
              }
          `, styleSheet.cssRules.length);

          // Ключевые кадры для мигания курсора
          styleSheet.insertRule(`
              @keyframes blink {
                  from, to { border-color: transparent }
                  50% { border-color: ${ACCENT_COLOR_HEX} } 
              }
          `, styleSheet.cssRules.length);
      } else {
          // Если keyframes уже есть (при повторном вызове), нужно обновить только typing
          // Для простоты, мы полагаемся на однократное добавление keyframes.
      }
      
      // 3. Применяем анимацию
      const animationDuration = `${charCount * 0.15}s`; 
      
      el.classList.remove('typing-complete');
      // Применяем анимацию с ИЗМЕРЕННОЙ ШИРИНОЙ
      el.style.animation = `typing ${animationDuration} steps(${charCount}, end) forwards, blink .75s step-end infinite`;
      
      // 4. Обработчик завершения анимации печатания
      el.addEventListener('animationend', (e) => {
          if (e.animationName === 'typing') {
              
              el.style.animation = `none`; 
              
              // Добавляем класс, чтобы CSS-стили (width: auto; overflow: visible) сработали
              el.classList.add('typing-complete');
              
              // Запускаем только анимацию мигания
              el.style.animation = `blink .75s step-end infinite`; 
          }
      }, { once: true });
  }

  /**
   * Initiate Pure Counter
   */
   function setupCounters() {
    new PureCounter();
  }

  // Вызываем функцию после загрузки страницы
  window.addEventListener('load', setupTypingEffect);
  document.addEventListener('DOMContentLoaded', setupCounters); 

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------
    // Инициализация Swiper для блока Особенностей (Features Grid)
    // -------------------------------------------------------------------

    new Swiper('.features-grid', {

        
        // Устанавливаем настройки для мобильных по умолчанию (меньше 992px)
        slidesPerView: 'auto', // Позволяет Swiper отображать столько слайдов, сколько помещается
        spaceBetween: 10, // Отступ между слайдами (элементами)

        // Дополнительные настройки
        grabCursor: true, // Включает курсор "grab" (перетаскивание)
        freeMode: true, // Позволяет свободно перетаскивать инерционным скроллом
        loop: false, 
        
        // Медиазапросы Swiper (отключаем скролл на десктопе)
        breakpoints: {
            992: { // Когда ширина экрана 992px и более (десктоп)
                slidesPerView: 6, // 6 слайдов в ряд
                spaceBetween: 20, // Увеличиваем отступ
                allowTouchMove: false, // Отключаем перетаскивание
                grabCursor: false,
                freeMode: false,
            }
        }
    });
    
    // -------------------------------------------------------------------
    // Инициализация Swiper для Фотогалереи (Gallery)
    // -------------------------------------------------------------------
    new Swiper('.gallery-slider', {
        speed: 600,
        loop: true,
        autoplay: {
            delay: 10000,
            disableOnInteraction: false
        },
        slidesPerView: 'auto',
        
        // Медиазапросы для адаптивности
        breakpoints: {
            320: { // Мобильные
                slidesPerView: 1.2,
                spaceBetween: 5
            },
            768: { // Планшеты
                slidesPerView: 2.5,
                spaceBetween: 10
            },
            1024: { // Десктоп
                // ИЗМЕНЕНИЕ ЗДЕСЬ: Теперь отображается 3 полных фото, вместо 3.5
                slidesPerView: 3, 
                spaceBetween: 15
            }
        },
        
        // Пагинация (точки)
        pagination: {
            el: '.gallery-navigation .swiper-pagination',
            type: 'bullets',
            clickable: true
        },
        
        // Навигация (стрелки)
        navigation: {
            nextEl: '.gallery-navigation .swiper-button-next',
            prevEl: '.gallery-navigation .swiper-button-prev'
        }
    });


    // -------------------------------------------------------------------
    // Инициализация Glightbox для лайтбокса галереи
    // -------------------------------------------------------------------
    const lightbox = GLightbox({
        selector: '.glightbox', // Выбираем все элементы с классом glightbox
        // Настройка модального окна
        touchNavigation: true,
        loop: true,
        autoplayVideos: true,
        // Связываем элементы, чтобы они переключались как одна галерея
        // data-gallery="libraryGallery" в HTML гарантирует это.
    });


});

})();