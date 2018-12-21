'use strict';

// Variables

var
  autoprefixer = require('autoprefixer'),
  browserSync = require('browser-sync').create(),
  del = require('del'),
  gulp = require('gulp'),
  mincss = require('gulp-csso'),
  minimage = require('gulp-imagemin'),
  minjs = require('gulp-terser'),
  mozjpeg = require('imagemin-mozjpeg'),
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  pngquant = require('imagemin-pngquant'),
  postcss = require('gulp-postcss'),
  pug = require('gulp-pug'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  sassglob = require('gulp-sass-glob'),
  zopfli = require('imagemin-zopfli');

// Task functions

var minsvg = function () {
  return gulp.src('./specification/img-raw/*.svg')
    .pipe(minimage([
      minimage.svgo({
        plugins: [
          {cleanupAttrs: false},
          {inlineStyles: false},
          {removeDoctype: true},
          {removeXMLProcInst: true},
          {removeComments: true},
          {removeMetadata: true},
          {removeTitle: true},
          {removeDesc: true},
          {removeUselessDefs: false},
          {removeXMLNS: false},
          {removeEditorsNSData: true},
          {removeEmptyAttrs: true},
          {removeHiddenElems: true},
          {removeEmptyText: true},
          {removeEmptyContainers: true},
          {removeViewBox: false},
          {cleanupEnableBackground: true},
          {minifyStyles: false},
          {convertStyleToAttrs: false},
          {convertColors: true},
          {convertPathData: true},
          {convertTransform: true},
          {removeUnknownsAndDefaults: true},
          {removeNonInheritableGroupAttrs: true},
          {removeUselessStrokeAndFill: true},
          {removeUnusedNS: true},
          {cleanupIDs: false},
          {cleanupNumericValues: true},
          {cleanupListOfValues: true},
          {moveElemsAttrsToGroup: true},
          {moveGroupAttrsToElems: false},
          {collapseGroups: true},
          {removeRasterImages: false},
          {mergePaths: true},
          {convertShapeToPath: false},
          {sortAttrs: false},
          {removeDimensions: true},
          {removeAttrs: true},
          {removeElementsByAttr: false},
          {addClassesToSVGElement: false},
          {addAttributesToSVGElement: false},
          {removeStyleElement: true},
          {removeScriptElement: true}
      ]})
    ]))
    .pipe(gulp.dest('./source/img/'));
}

var minbitmap = function () {
  return gulp.src('./specification/img-raw/*.{jpg,png}')
    .pipe(minimage([
      pngquant({
        speed: 1,
        quality: 80
      }),
      zopfli({
        more: true
      }),
      minimage.jpegtran({
        progressive: true
      }),
      mozjpeg({
        quality: 90
      })
    ]))
    .pipe(gulp.dest('./source/img/'));
}

var cleanbuild = function () {
  return del('./build/');
}

var copyfonts = function () {
  return gulp.src('./source/fonts/*.{woff,woff2}')
    .pipe(gulp.dest('./build/fonts/'));
}

var copysvg = function () {
  return gulp.src('./source/img/*.svg')
    .pipe(gulp.dest('./build/img/'));
}

var copybitmap = function () {
  return gulp.src('./source/img/*.{jpg,png}')
    .pipe(gulp.dest('./build/img/'));
}

var scripts = function () {
  return gulp.src('./source/js/*.js')
    .pipe(minjs())
    .pipe(gulp.dest('./build/js/'));
}

var style = function () {
  return gulp.src('./source/sass/main.scss')
    .pipe(plumber())
    .pipe(sassglob())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('./build/css/'))
    .pipe(mincss())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest('./build/css/'))
    .pipe(browserSync.stream());
}

var html = function () {
    return gulp.src('./source/pug/*.pug')
      .pipe(plumber())
      .pipe(pug())
      .pipe(gulp.dest('./build/'))
      .pipe(browserSync.stream());
  }

var serve = function () {
  browserSync.init({
    server: './build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch('./source/js/*.js', scripts).on('change', browserSync.reload);
  gulp.watch('./source/sass/**/*.scss', style);
  gulp.watch('./source/pug/**/*.pug', html);
}

// Gulp tasks

gulp.task('build', gulp.series(cleanbuild, copyfonts, copysvg, copybitmap, scripts, style, html));
gulp.task('serve', serve);

gulp.task('imagemin', gulp.parallel(minsvg, minbitmap));
gulp.task('imagecopy', gulp.parallel(copysvg, copybitmap));
gulp.task('imagerenew', gulp.series(gulp.parallel(minsvg, minbitmap), gulp.parallel(copysvg, copybitmap)));

gulp.task('svgmin', minsvg);
gulp.task('svgcopy', copysvg);
gulp.task('svgrenew', gulp.series(minsvg, copysvg));

gulp.task('bitmapmin', minbitmap);
gulp.task('bitmapcopy', copybitmap);
gulp.task('bitmaprenew', gulp.series(minbitmap, copybitmap));
