const fs = require('fs');
const gulp = require('gulp');
const path = require('path');

const cleanFnc = require('./gulp-tasks/gulp-clean');
const copyStaticFnc = require('./gulp-tasks/gulp-copy-static');
const cssCompileFnc = require('./gulp-tasks/gulp-compile-sass');
const fontLoadFnc = require('./gulp-tasks/gulp-font-load');
const hotReload = require('./gulp-tasks/gulp-hotreload');
const htmlBuildFnc = require('./gulp-tasks/gulp-html-build');
const imagesOptimizeFnc = require('./gulp-tasks/gulp-optimize-images');
const jsProcessFnc = require('./gulp-tasks-export/gulp-process-js');

// Variables
// --------------

const config = require('./gulpconfig');

// Gulp functions
// --------------

function cleanFolders() {
  return cleanFnc(config.buildBase);
}

function copyStatic(done) {
  return copyStaticFnc('./static/**/*', './static', config.buildBase, () => {
    done();
  });
}

// SASS

function compileSassCore() {
  return cssCompileFnc(
    config.sassCore,
    config.sassBuild,
    'bootstrap.css',
    config.postcssPluginsBase
  );
}

function compileSassCustom() {
  return cssCompileFnc(
    config.sassCustom,
    config.sassBuild,
    'custom.css',
    config.postcssPluginsBase
  );
}

function compileSassUtils() {
  return cssCompileFnc(
    config.sassUtils,
    config.sassBuild,
    'utils.css',
    config.postcssPluginsBase
  );
}

// JS

function processJs() {
  return jsProcessFnc(config.jsFiles, config.jsBuild, {
    concatFiles: true,
    outputConcatPrefixFileName: 'app',
  });
}

// Templates

function buildPages(done) {
  const params = {
    input: `${config.tplPagesBase}/**/*.html`,
    output: config.tplBuild,
    templates: config.tplTemplatesBase,
    processPaths: [config.tplPagesBase, config.tplTemplatesBase],
    injectCdnJs: config.injectCdnJs,
    injectJs: config.injectJs,
    injectCss: config.injectCss,
    injectIgnorePath: config.buildBase.replace('./', ''),
    cb: () => {
      done();
    },
  };
  htmlBuildFnc(params);
}

// GFX

function images(done) {
  imagesOptimizeFnc.optimizeJpg(config.imagesJpg, config.gfxBuild, {
    rewriteExisting: true,
  });
  imagesOptimizeFnc.optimizePng(config.imagesPng, config.gfxBuild, {
    rewriteExisting: true,
  });
  imagesOptimizeFnc.optimizeSvg(config.imagesSvg, config.gfxBuild, {
    rewriteExisting: true,
  });
  done();
}

// Fonts

function fontLoad(done) {
  fontLoadFnc(
    config.fontloadFile,
    config.tempBase,
    config.fontLoadConfig,
    () => {
      done();
    }
  );
}

// Watch
// --------------

function watchFiles() {
  // Watch SASS

  gulp.watch(
    config.sassCustom,
    gulp.series(compileSassCustom, hotReload.browserSyncRefresh)
  );

  gulp.watch(
    config.sassCore,
    gulp.series(compileSassCore, hotReload.browserSyncRefresh)
  );

  gulp.watch(
    config.sassUtils,
    gulp.series(compileSassUtils, hotReload.browserSyncRefresh)
  );

  // Watch JS

  gulp.watch(
    config.jsFiles,
    gulp.series(processJs, hotReload.browserSyncRefresh)
  );

  // Watch Templates

  gulp
    .watch(['./src/templates/**/*.*', './src/pages/**/*.*'], buildPages)
    .on('change', hotReload.browserSyncReload);

  // Watch GFX

  gulp.watch(config.gfxBase, gulp.series(images, hotReload.browserSyncRefresh));
}

// Gulp tasks
// --------------

gulp.task(
  'css',
  gulp.parallel(compileSassCore, compileSassCustom, compileSassUtils)
);

gulp.task('js', processJs);

gulp.task('html', gulp.series(buildPages));

gulp.task('images', images);

gulp.task('fonts', fontLoad);

gulp.task(
  'serve',
  gulp.series(
    cleanFolders,
    copyStatic,
    fontLoad,
    compileSassCore,
    compileSassCustom,
    compileSassUtils,
    processJs,
    buildPages,
    images,
    gulp.parallel(watchFiles, hotReload.browserSync)
  )
);

// Aliases

gulp.task('watch', gulp.series('serve'));
gulp.task('default', gulp.series('serve'));
