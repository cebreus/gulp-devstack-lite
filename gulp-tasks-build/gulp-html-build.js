const fs = require('fs');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const inject = require('gulp-inject');
const minify = require('gulp-htmlmin');
const nunjucksRender = require('gulp-nunjucks-render');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

require('dotenv').config();

/**
 * @description Compile Nunjucks templates and replaces variable from JSON
 * @param {string} input Path with filter to source files
 * @param {string} output Path to save compiled files
 * @param {string} rename Custom name of file
 * @param {string} injectCss Path to css files which you want inject
 * @param {array} injectJs Path to JS files which you want inject
 * @param {array} injectCdnJs Path to CDN JS files which you want inject
 * @return {stream} Compiled file
 */

const buildHtml = (params) => {
  const dateFilter = require('nunjucks-date-filter-locale');
  const markdown = require('nunjucks-markdown-filter');

  const nunjucksData = {
    baseurl: process.env.SITE_BASE_URL,
    charset: process.env.CHARSET,
  };
  let renameCondition = params.rename ? true : false;

  nunjucksRender.nunjucks.configure(params.templates, {
    watch: false,
    lstripBlocks: true,
    throwOnUndefined: true,
    trimBlocks: true,
    stream: true,
  });

  return gulp
    .src(params.input)
    .pipe(plumber())
    .pipe(
      nunjucksRender({
        data: nunjucksData,
        path: params.processPaths,
        manageEnv: (enviroment) => {
          enviroment.addFilter('md', markdown);
          enviroment.addGlobal('toDate', function (date) {
            return date ? new Date(date) : new Date();
          });
        },
      })
    )
    .pipe(
      inject(gulp.src(params.injectCss, { read: false }), {
        relative: false,
        ignorePath: params.injectIgnorePath,
        addRootSlash: true,
        removeTags: true,
      })
    )
    .pipe(
      inject(gulp.src(params.injectJs, { read: false }), {
        relative: false,
        ignorePath: params.injectIgnorePath,
        addRootSlash: true,
        removeTags: true,
      })
    )
    .pipe(
      replace(
        '<!-- inject: bootstrap js -->',
        params.injectCdnJs.toString().replace(/[, ]+/g, ' ')
      )
    )
    .pipe(minify({ collapseWhitespace: true }))
    .pipe(
      gulpif(
        renameCondition,
        rename({
          dirname: '/',
          basename: params.rename,
          extname: '.html',
        })
      )
    )
    .pipe(gulp.dest(params.output))
    .on('end', params.cb);
};

module.exports = buildHtml;
