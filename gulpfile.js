const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const include = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const del = require('del');

// svgSprites
function svgSprites() {
  return src(['src/img/icons/*.svg'])
    .pipe(
      cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: {
          xmlMode: true,
        },
      })
    )

    .pipe(replace('&gt,', '>'))
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg', // sprite file name
          },
        },
      })
    )
    .pipe(dest('src/img'));
}

function fileInclude() {
  return src('src/html/*.html')
    .pipe(
      include({
        prefix: '@',
        basepath: '@file',
      })
    )
    .pipe(dest('src'))
    .pipe(browserSync.stream());
}

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'src/',
    },
    notify: false,
  });
}

function styles() {
  return src('src/scss/style.scss')
    .pipe(
      scss({
        outputStyle: 'expanded',
      })
    )
    .pipe(concat('style.css'))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 10 versions'],
        grid: true,
      })
    )
    .pipe(dest('src/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return (
    src(['src/js/main.js'])
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(dest('src/js'))
      .pipe(browserSync.stream())
  );
}

function images() {
  return src('src/img/**/*.*')
    .pipe(
      imagemin([
        imagemin.gifsicle({
          interlaced: true,
        }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: true,
            },
            {
              cleanupIDs: false,
            },
          ],
        }),
      ])
    )
    .pipe(dest('app/img'));
}

function build() {
  return src(
    [
      'src/**/*.html',
      'src/css/style.css',
      'src/js/main.js',
      'src/js/main.min.js',
      'src/fonts/**',
    ],
    {
      base: 'src',
    }
  ).pipe(dest('app'));
}

function cleanapp() {
  return del('app');
}

function watching() {
  watch(['src/scss/**/*.scss'], styles);
  watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts);
  watch(['src/html/**/*.html'], fileInclude);
  watch(['src/**/*.html']).on('change', browserSync.reload);
  watch(['src/img/icons/*.svg'], svgSprites);
}

exports.svgSprites = svgSprites;
exports.fileInclude = fileInclude;
exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanapp = cleanapp;
exports.build = series(cleanapp, images, build);

exports.default = parallel(
  fileInclude,
  svgSprites,
  styles,
  scripts,
  browsersync,
  watching
);
