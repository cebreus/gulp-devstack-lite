const cleanCSS = require('gulp-clean-css');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const prettify = require('gulp-jsbeautifier');

/**
 * @description Compiling SCSS files into CSS files
 * @param {string} input Path with filter to source files
 * @param {string} output Path to save compiled files
 * @return {stream} Compiled file
 */

const postcssCleanup = (input, output) => {
  return gulp
    .src(input)
    .pipe(plumber())
    .pipe(
      cleanCSS({
        level: {
          2: {
            removeUnusedAtRules: true,
            restructureRules: true,
            mergeSemantically: true,
          },
        },
      })
    )
    .pipe(prettify({ indent_size: 4 }))
    .pipe(gulp.dest(output));
};

module.exports = postcssCleanup;
