/* eslint-env node, es6 */

'use strict';

const webpack = require('webpack'),
  path = require('path'),
  PKG = require('./package'),

  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',
  SRC = process.env.SRC === 'yes',

  SRC_PATH = path.resolve(__dirname, 'src'),
  ENTRY_PATH = path.resolve(SRC_PATH, 'plain-draggable.js'),
  BUILD_PATH = BUILD ? __dirname : path.resolve(__dirname, 'test'),
  BUILD_FILE = 'plain-draggable' + (LIMIT ? '-limit' : '') + (BUILD ? '.min.js' : '.js'),

  IMPORTED_PACKAGES_PATH = [
    'cssprefix',
    'anim-event',
    'm-class-list'
  ].map(packageName => require.resolve(packageName) // Get package root path
    .replace(new RegExp(`^(.*[/\\\\]node_modules[/\\\\]${packageName}[/\\\\]).*$`), '$1')),

  LIMIT_TAGS = ['SNAP', 'SVG'],

  BABEL_RULE = {
    loader: 'babel-loader',
    options: {
      presets: ['es2015'],
      plugins: ['add-module-exports']
    }
  };

/**
 * @param {(string|string[])} tag - A tag or an array of tags that are removed.
 * @param {string} content - A content that is processed.
 * @param {string} srcPath - A full path to the source file.
 * @param {(string|RegExp|Array)} pathTest - The content is changed when any test passed.
 *     A string which must be at the start of it, a RegExp which tests it or an array of these.
 * @returns {string} - A content that might have been changed.
 */
function preProc(tag, content, srcPath, pathTest) {
  if (srcPath && pathTest &&
      !(Array.isArray(pathTest) ? pathTest : [pathTest]).some(test =>
        test instanceof RegExp ? test.test(srcPath) : srcPath.indexOf(test) === 0)) {
    return content;
  }
  content = content ? content + '' : '';
  return (Array.isArray(tag) ? tag : [tag]).reduce((content, tag) => content
    .replace(new RegExp(`[^\\n]*\\[${tag}/\\][^\\n]*\\n?`, 'g'), '')
    .replace(new RegExp(`/\\*\\s*\\[${tag}\\]\\s*\\*/[\\s\\S]*?/\\*\\s*\\[/${tag}\\]\\s*\\*/`, 'g'), '')
    .replace(new RegExp(`[^\\n]*\\[${tag}\\][\\s\\S]*?\\[/${tag}\\][^\\n]*\\n?`, 'g'), ''), content);
}

if (!LIMIT && SRC) { throw new Error('This options break source file.'); }

module.exports = {
  entry: ENTRY_PATH,
  output: {
    path: BUILD_PATH,
    filename: BUILD_FILE,
    library: 'PlainDraggable',
    libraryTarget: 'var'
  },
  resolve: {mainFields: ['jsnext:main', 'browser', 'module', 'main']},
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: absPath => !IMPORTED_PACKAGES_PATH.find(packagePath => absPath.indexOf(packagePath) === 0) &&
          absPath.split(path.sep).includes('node_modules'),
        use: [
          BABEL_RULE,
          {
            loader: 'skeleton-loader',
            options: {
              procedure: function(content) {
                if (LIMIT) {
                  content = preProc(LIMIT_TAGS, content, this.resourcePath, SRC_PATH);
                  if (!BUILD && SRC && this.resourcePath === ENTRY_PATH) { // source for limit edition
                    const destPath = path.resolve(SRC_PATH, BUILD_FILE);
                    require('fs').writeFileSync(destPath, content);
                    console.log(`Output: ${destPath}`);
                  }
                }
                return BUILD ?
                  preProc('DEBUG', content, this.resourcePath, IMPORTED_PACKAGES_PATH.concat(SRC_PATH)) :
                  content;
              }
            }
          }
        ]
      }
    ]
  },
  devtool: BUILD ? false : 'source-map',
  plugins: BUILD ? [
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: true}}),
    new webpack.BannerPlugin({raw: true,
      banner: `/*! ${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage} */`})
  ] : []
};
