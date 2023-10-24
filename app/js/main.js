console.clear();

class Stories {
  el = {}; // Сюда будем закидывать элементы, там будет проще ими управлять
  autoDelay = 5000; // Сколько мс нужно для показа сторис.
  // p.s. для видео берётся время самого видео, а не autoDelay.
  timer = null; // Для таймера
  isPause = false; // флаг о паузе сторис

  constructor() {
    this.el.demo = document.querySelector('.demo-stories'); // Элемент с аватарками, при нажатии на них будет запускаться модалка со сторис
    this.el.stories = document.querySelector('.stories-slider'); // Модалка со сторис
    if (!this.el.demo && !this.el.stories) return false; // Если аватарки или модалка отсутствует, то скрипт не будет работать.

    this.initDemo(); // Инициализация аватарок
    this.initStories(); // Инициализация модалки
  }

  // Инициализация аватарок
  initDemo() {
    const _self = this;

    // На блок с аватарками вешает слушатель, это будет делегирования событий
    _self.el.demo.addEventListener('click', (event) => {
      const target = event.target.closest('a'); // Если нажата ссылка..
      if (target) {
        // .. то выполняем код ниже:
        event.preventDefault(); // отменяем действия ссылки
        const index = target.dataset.storiesIndex; // Получаем index сторис
        if (!index || !(+index >= 0)) return false; // Если индекса нет, или он не больше или равен нулю, то код ниже не выполнится
        _self.storiesOpenUser(+index); // Открываем модалку пользователя
      }
    });
  }

  // Инициализация модалки
  initStories() {
    const _self = this;

    // Вешаем делегирование событие по клику
    _self.el.stories.addEventListener('click', (event) => {
      const targetClose = event.target.closest(
        'button.stories-slider-close-button'
      ); // если нажата кнопка закрытия..
      if (targetClose) _self.storiesModalClose(); // .. то закрываем модалку

      const buttonPrev = event.target.closest(
        '.stories-slider-button.stories-slider-button-prev'
      );
      if (buttonPrev) _self.buttonPrev();

      const buttonNext = event.target.closest(
        '.stories-slider-button.stories-slider-button-next'
      );
      if (buttonNext) _self.buttonNext();
    });

    // Вешаем событие окончания анимации на модалку
    _self.el.stories.addEventListener('animationend', (event) => {
      if (_self.el.stories.classList.contains('stories-slider-out')) {
        // Если у нас анимация закрытия модалки..
        _self.el.stories.classList.remove('stories-slider-out'); // .. то после окончания анимации класс удалится.
      }

      if (
        _self.el.stories.classList.contains('stories-slider-in') &&
        _self.swiperStories
      ) {
        // Если анимация появления..
        _self.checkContent();
        _self.startProgress();
      }
    });

    // Создаём слайдер с пользователя (3д)
    _self.swiperUsers = new Swiper(
      _self.el.stories.querySelector(
        '.js-swiper-pagination-progress-with-thumbs-main-2'
      ),
      {
        effect: 'cube',
        cubeEffect: {
          shadow: false,
          slideShadows: true,
        },
        on: {
          transitionEnd: (swiper) => {
            // При переключении слайда выполняем следующие действия:
            _self.changeSlide(swiper); // триггерим смену слайда
            _self.checkContent(); // определяем содержимое активного слайда сторис
          },
          touchStart: () => {
            // При событии нажатия..
            _self.isPause = true; // .. будем останавливать показ сторис ..
            if (_self.video) _self.video.pause(); // .. если в активном слайде видео, то останавливаем его

            // Чтобы нормально регистрировать переключение на следующий слайд или зажатие для паузы
            if (_self.timerTouch) clearTimeout(_self.timerTouch); // Очищаем таймер, если был
            _self.timerTouch = setTimeout(() => {
              // запускаем таймер
              _self.isTouch = true; // по истечению ставим флагу true, это значит что пользователь зажал
            }, 250);
          },
          touchEnd: () => {
            // При событии "отжатия"..
            _self.isPause = false; // .. будем продолжать показ сторис ..
            if (_self.video) _self.video.play(); // .. если в активном слайде видео, то продолжаем его

            // Чтобы нормально регистрировать переключение на следующий слайд или зажатие для паузы
            if (_self.timerTouch) clearTimeout(_self.timerTouch);
            _self.timerTouch = setTimeout(() => {
              // запускаем таймер
              _self.isTouch = false; // по истечению ставим флагу false, это значит что пользователь перестал держать
            }, 100);
          },
        },
      }
    );

    // Проходим по всем слайдерам сторис
    _self.el.stories
      .querySelectorAll(
        '.js-swiper-pagination-progress-with-thumbs-main-2 .swiper'
      )
      .forEach((el) => {
        new Swiper(el, {
          slidesPerView: 1,
          effect: 'fade',
          speed: 1,
          pagination: {
            // Создаём кастомную пагинацию
            type: 'custom',
            el: el.querySelector('.stories-slider-pagination'),
            bulletClass: 'stories-slider-pagination-bullet',
            bulletActiveClass: 'stories-slider-pagination-bullet-active',
            renderCustom: (swiper, current, total) => {
              current--;
              const pagination = swiper.originalParams.pagination;
              return Array(total)
                .fill('')
                .map((el, i) => {
                  const classes = [pagination.bulletClass]; // У каждой "точки" пагинации будет свой класс, который указан в параметрах свайпера
                  if (i === current) classes.push(pagination.bulletActiveClass); // Если "точка" активная, то выдаётся ей нужный класс
                  if (i < current)
                    classes.push(pagination.bulletClass + '-viewed'); // Все предыдущие до активной будут иметь другой класс
                  return `<div class="${classes.join(' ')}"></div>`; // HTML код точки.
                })
                .join('');
            },
          },
          on: {
            slideChange: (swiper) => {
              // При переключении слайда выполняем следующие действия:
              _self.changeSlide(swiper); // триггерим смену слайда
              _self.checkContent(); // определяем содержимое активного слайда сторис
            },
          },
        });
      });
  }

  // Переход по кнопке "назад"
  buttonPrev() {
    if (this.isTouch) return false;
    if (!this.swiperStories.isBeginning) {
      // Если главный слайдер не на начальной позиции, то ..
      this.swiperStories.slidePrev(); // .. выполняем перелистывание слайдера со сторис назад ..
      return; // .. и прекращаем выполнения функции
    }
    // .. а если на начальной позиции, то ..
    this.swiperUsers.slidePrev(); // .. переключаем слайд главного слайдера назад
  }

  // Переход по кнопке "вперёд"
  buttonNext() {
    if (this.isTouch) return false;
    if (!this.swiperStories.isEnd) {
      // Если главный слайдер не на конечной позиции, то ..
      this.swiperStories.slideNext(); // .. выполняем перелистывание слайдера со сторис вперёд ..
      return; // .. и прекращаем выполнения функции
    }
    // .. а если на конечной позиции, то ..
    this.swiperUsers.slideNext(); // .. переключаем слайд главного слайдера вперёд
  }

  // Заполнение "точки" пагинации (прогресс-бар)
  startProgress() {
    const _self = this;
    if (!_self.swiperStories) {
      // Если слайдер со сторис не определён, то ..
      return; // .. и код ниже не выполнится.
    }

    _self.stopProgress(); // завершим просчёт прогресса

    const time = _self.autoDelay / 100; // время за какое кол-во секунд будем обновлять заполнение прогресс бара, относительно времени для проигрывания слайда
    _self.progress = 0; // Обнуляем прогресс
    _self.swiperStories?.el.style.setProperty('--progress', _self.progress); // Отображаем прогресс на активной "точке" пагинации (через переменные CSS)

    // Запускаем интервал
    _self.timer = setInterval(() => {
      if (_self.video) {
        // Если запущено видео, то
        _self.stopProgress(); // .. очищаем прогресс ..
        return false; // .. прекращаем выполнение кода ниже
      }
      _self.progress <= 100 && !_self.isPause ? (_self.progress += 1) : false; // Если прогресс НЕ заполнен на 100 или сейчас НЕ включена пауза, то мы заполняем прогресс, иначе код ниже не выполнился
      _self.swiperStories?.el.style.setProperty('--progress', _self.progress); // Отображаем прогресс на активной "точке" пагинации

      if (_self.swiperStories?.isEnd && _self.progress === 100) {
        // Если слайдер со сторис на конечной позиции и прогресс заполнен на 100, то ..
        _self.stopProgress(); // .. останавливаем просчёт прогресса ..
        _self.swiperUsers.isEnd ? _self.storiesModalClose() : false; // если слайдер пользователя на конечной позиции, то закрываем модалку
        _self.swiperUsers.slideNext(); // .. переключаем слайдер пользователя вперёд
      } else if (_self.progress === 100) {
        // Если только прогресс заполнен на 100, то ..
        _self.swiperStories?.slideNext(); // .. переключаем сторис на следующий
      }
    }, time);
  }

  // Ивент смены слайда
  changeSlide(swiper) {
    this.stopProgress(); // Останавливаем прогресс ..
    this.startProgress(); // .. запускаем прогресс заново ..
    this.getActiveSwiperStoriesInSwiperUsers(); // .. получаем активный слайдер сторис
  }

  // Останавливаем прогресс
  stopProgress() {
    clearInterval(this.timer); // очищаем интервал
    this.progress = 0; // Очищаем прогресс ..
    this.swiperStories?.el.style.setProperty('--progress', this.progress); // .. визуально тоже
  }

  // Определение контента слайда сторис
  checkContent() {
    const _self = this;
    const activeSlide =
      _self.swiperStories.slides[_self.swiperStories.activeIndex]; // Получаем элемент активного слайда
    const video = activeSlide.querySelector('.stories-slider-content video'); // Получаем видео

    _self.stopVideo(); // останавливаем видео

    if (video) {
      // Если видео присутствует, то ..
      _self.stopProgress(); // .. останавливаем прогресс ..
      _self.video = video; // .. сохраняем видео в переменную ..
      _self.video.addEventListener(
        'timeupdate',
        _self.videoProgress.bind(_self)
      ); // .. вешаем слушатель на обновление времени видео ..
      video.play(); // .. запускаем видео
    } else {
      // Если видео нету..
      _self.video = null; // .. очищаем переменную
    }
  }

  // прогресс от видео
  videoProgress(event) {
    this.progress =
      (event.target.currentTime / (event.target.duration % 60)) * 100; // получаем процент, на сколько видео просмотрено
    this.swiperStories?.el.style.setProperty('--progress', this.progress); // отображаем его на пагинации

    if (this.swiperStories?.isEnd && this.progress >= 100) {
      // если прогресс заполнен, то ..
      this.stopProgress(); // .. останавливаем просчёт прогресса ..
      this.swiperUsers.isEnd ? this.storiesModalClose() : false; // если слайдер пользователя на конечной позиции, то закрываем модалку
      this.swiperUsers.slideNext(); // .. переключаем слайдер пользователя на следующей слайд
    } else if (this.progress >= 100) {
      this.swiperStories?.slideNext(); // .. переключаем на следующий слайд со сторис
    }
  }

  // остановка видео
  stopVideo() {
    if (!this.video) return false; // проверяем, активно ли сейчас видео, если нет, то код ниже не выполнится.
    this.video.pause(); // останавливаем видео
    this.video.currentTime = 0; // возвращаем в начальную позицию
    this.video.removeEventListener('timeupdate', this.videoProgress); // удаляем слушатель
  }

  // Открыть модалку юзера
  storiesOpenUser(index) {
    this.swiperUsers.slideTo(index, 0, true); // Переключаем слайд юзера
    this.getActiveSwiperStoriesInSwiperUsers(); // Получаем активный слайдер сторис
    this.swiperStories.slideTo(0, 0, true); // запускаем слайдер со сторис с самого начала
    this.storiesModalOpen(); // Открываем модалку
  }

  // Получаем активный слайдер сторис
  getActiveSwiperStoriesInSwiperUsers() {
    const swiper =
      this.swiperUsers.slides[this.swiperUsers.activeIndex].querySelector(
        '.swiper'
      ); // в слайдере пользователей находим активный слайд и в нём слайдер
    swiper ? (this.swiperStories = swiper.swiper) : this.storiesModalClose(); // Если он найден, то записываем его в переменную, если нет, закрываем модалку
  }

  // Открытие модалки
  storiesModalOpen() {
    if (this.el.stories.classList.contains('stories-slider-in')) return false; // Если на модалке есть класс, который отвечает за открытую модалку, то код ниже не выолнится

    document.body.style.overflow = 'hidden'; // Отключаем скролл страницы
    this.el.stories.classList.add('stories-slider-in'); // Анимация появления модалки
  }

  // Закрытие модалки
  storiesModalClose() {
    if (!this.el.stories.classList.contains('stories-slider-in')) return false; // Если на модалке нету класс открытой модалки, то код ниже не выполнится

    this.stopProgress(); // Останавливаем прогресс
    this.stopVideo(); // Останавливаем видео

    document.body.style.overflow = ''; // Возвращаем скролл страницы
    this.el.stories.classList.remove('stories-slider-in'); // Удаляем анимацию появления модалки
    this.el.stories.classList.add('stories-slider-out'); // Добавлявляем анимацю удаления модалки.

    // Обнуляем слайд со сторис
    this.swiperStories = null;
  }
}

new Stories();
