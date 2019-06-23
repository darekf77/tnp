const gulp = require('gulp');
const _ = require('lodash');
const sass = require('node-sass');
const inlineTemplates = require('gulp-inline-ng2-template');
const exec = require('child_process').exec;

/**
 * Inline templates configuration.
 * @see  https://github.com/ludohenin/gulp-inline-ng2-template
 */
const INLINE_TEMPLATES_DIST = {
  SRC: './components/**/*.ts',
  SRC_ASSETS: './components/**/*.png',
  DIST: './tmp/inlined-dist/src',
  CONFIG: {
    base: '/components',
    target: 'es6',
    useRelativePaths: true,
    styleProcessor: compileSass
  }
};

const INLINE_TEMPLATES_BUNDLE = _.cloneDeep(INLINE_TEMPLATES_DIST)
INLINE_TEMPLATES_BUNDLE.DIST = './tmp/inlined-bundle/src'

/**
 * Inline external HTML and SCSS templates into Angular component files.
 * @see: https://github.com/ludohenin/gulp-inline-ng2-template
 */
gulp.task('inline-templates-dist', ['copy-assets-dist'], () => {
  return gulp.src(INLINE_TEMPLATES_DIST.SRC)
    .pipe(inlineTemplates(INLINE_TEMPLATES_DIST.CONFIG))
    .pipe(gulp.dest(INLINE_TEMPLATES_DIST.DIST));
});

gulp.task('copy-assets-dist', () => {
  return gulp.src(INLINE_TEMPLATES_DIST.SRC_ASSETS)
    .pipe(gulp.dest(INLINE_TEMPLATES_DIST.DIST));
});

gulp.task('inline-templates-bundle', ['copy-assets-bundle'], () => {
  return gulp.src(INLINE_TEMPLATES_BUNDLE.SRC)
    .pipe(inlineTemplates(INLINE_TEMPLATES_BUNDLE.CONFIG))
    .pipe(gulp.dest(INLINE_TEMPLATES_BUNDLE.DIST));
});

gulp.task('copy-assets-bundle', () => {
  return gulp.src(INLINE_TEMPLATES_DIST.SRC_ASSETS)
    .pipe(gulp.dest(INLINE_TEMPLATES_DIST.DIST));
});

gulp.task('inline-templates-dist-watch', function () {
  gulp.watch('./components/**/*.*', ['inline-templates-dist']);
});

gulp.task('inline-templates-bundle-watch', function () {
  gulp.watch('./components/**/*.*', ['inline-templates-bundle']);
});

/**
 * Compile SASS to CSS.
 * @see https://github.com/ludohenin/gulp-inline-ng2-template
 * @see https://github.com/sass/node-sass
 */
function compileSass(path, ext, file, callback) {
  let compiledCss = sass.renderSync({
    file: path,
    outputStyle: 'compressed',
  });
  callback(null, compiledCss.css);
}