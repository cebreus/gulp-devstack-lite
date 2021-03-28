const fs = require('fs');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const prettify = require('gulp-html-beautify');

/**
 * @description Compile Nunjucks templates and replaces variable from JSON
 * @param {string} input Path with filter to source files
 * @param {string} output Path to save compiled files
 * @return {stream} Compiled file
 */

const prettifyHtml = (params) => {
  return gulp
    .src(params.input)
    .pipe(plumber())
    .pipe(
      prettify({
        indentSize: 4,
        indent_char: ' ',
        indent_with_tabs: false,
        preserve_newlines: false,
      })
    )
    .pipe(gulp.dest(params.output))
    .on('end', params.cb);
};

module.exports = prettifyHtml;
