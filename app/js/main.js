function nextSw() {
  galleryTop3.slideNext();
}

const myCustomSliders = document.querySelectorAll(
  '.js-swiper-pagination-progress-with-thumbs-main'
);
myCustomSliders.forEach(function (slider, index) {
  const customSlider = new Swiper(slider, {
    init: true,
    initialSlide: 0,
    direction: 'horizontal',
    effect: 'fade',
    allowTouchMove: false,
    loop: false,
    hashNavigation: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      stopOnLastSlide: true,
    },
    navigation: {
      nextEl: '.stories-slider-button-next',
      prevEl: '.stories-slider-button-prev',
    },
    observer: true,
    observeParents: true,
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
    history: false,
    pagination: {
      el: '.stories-slider-pagination',
      bulletClass: 'swiper-pagination-bullet-custom',
      bulletActiveClass: 'swiper-pagination-bullet-custom--active',
      renderBullet: function (index, className) {
        return `<div class="stories-slider-pagination-bullet" data-index="${index}">
        <span class="${className}"></span>
        </div>`;
      },
    },
    on: {
      init: function () {
        const _self = this;
        _self.el.style.setProperty('--delay', _self.params.autoplay.delay);
        const videos = slider.querySelectorAll('.mainscreen__video');
        videos.forEach(function (video) {
          video.currentTime = 0;
        });
      },
      reachEnd: function () {
        setTimeout(nextSw, 5000);
      },
      slideChange: function () {
        let videos = document.querySelector('.mainscreen__video');
        videos.currentTime = 0;
        $('span.swiper-pagination-bullet-custom--active')
          .parent()
          .removeClass('stories-slider-pagination-bullet-viewed');
        $('span.swiper-pagination-bullet-custom--active')
          .parent()
          .prev()
          .addClass('stories-slider-pagination-bullet-viewed');
      },
      destroy: function () {
        console.log('слайдер убит');
        
      },
    },
  });
});

const galleryTop3 = new Swiper(
  '.js-swiper-pagination-progress-with-thumbs-main-2',
  {
    init: true,
    hashNavigation: {
      watchState: true,
    },
    effect: 'cube',
    grabCursor: true,
    direction: 'horizontal',
    watchSlidesProgress: true,
    observer: true,
    observeParents: true,
  }
);

$(function () {
  // INITIALIZATION OF SWIPER
  // =======================================================

  const demoStoriesLinks = $('.demo-stories a');
  const storiesSlider = $('.stories-slider');
  const closeButton = $('.stories-slider-close-button');
  const mainscreenVideo = $('.mainscreen__video');
  const paginationBullets = $('.swiper-pagination-bullet-custom');

  demoStoriesLinks.click(function () {
    storiesSlider.addClass('stories-slider-in');
  });
  closeButton.click(function () {
    storiesSlider.removeClass('stories-slider-in');
  });
});
