/* eslint-env node, es6 */

'use strict';

const webpack = require('webpack'),
  path = require('path'),
  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.DIV === 'limit',
  SRC = process.env.SRC === 'yes',
  PKG = require('./package'),

  BUILD_PATH = BUILD ? __dirname : path.join(__dirname, 'test'),
  BUILD_FILE = 'plain-draggable' + (LIMIT ? '-limit' : '') + (BUILD ? '.min.js' : '.js'),
  ENTRY_PATH = path.resolve('./src/plain-draggable.js'),

  BABEL_TARGET_PACKAGES = [
    'cssprefix',
    'anim-event',
    'm-class-list'
  ].map(packageName => require.resolve(packageName) // Get package root path
    .replace(new RegExp(`([\\/\\\\]node_modules[\\/\\\\]${packageName}[\\/\\\\]).*$`), '$1')),

  LIMIT_TAGS = ['SNAP', 'SVG'],

  BABEL_PARAMS = {
    presets: ['es2015'],
    plugins: ['add-module-exports']
  },
  BABEL_RULE = {
    loader: 'babel-loader',
    options: BABEL_PARAMS
  };

function preProc(key, content) {
  return (content + '')
    .replace(new RegExp(`[^\\n]*\\[${key}\\/\\][^\\n]*\\n?`, 'g'), '')
    .replace(new RegExp(`\\/\\*\\s*\\[${key}\\]\\s*\\*\\/[\\s\\S]*?\\/\\*\\s*\\[\\/${key}\\]\\s*\\*\\/`, 'g'), '')
    .replace(new RegExp(`[^\\n]*\\[${key}\\][\\s\\S]*?\\[\\/${key}\\][^\\n]*\\n?`, 'g'), '');
}

function limitCode(content) {
  return LIMIT_TAGS.reduce((content, tag) => preProc(tag, content), content);
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
        exclude: absPath => !BABEL_TARGET_PACKAGES.find(target => absPath.indexOf(target) === 0) &&
          absPath.split(path.sep).includes('node_modules'),
        use: BUILD ? [BABEL_RULE, {
          loader: 'skeleton-loader',
          options: {
            procedure: function(content) {
              return preProc('DEBUG', LIMIT && this.resourcePath === ENTRY_PATH ? limitCode(content) : content);
            }
          }
        }] : [BABEL_RULE].concat(LIMIT ? [{
          loader: 'skeleton-loader',
          options: {
            procedure: function(content) {
              if (this.resourcePath === ENTRY_PATH) {
                content = limitCode(content);
                if (SRC) {
                  const destPath = path.join(__dirname, 'src', BUILD_FILE);
                  require('fs').writeFileSync(destPath, content);
                  console.log(`Output: ${destPath}`);
                }
              }
              return content;
            }
          }
        }] : [])
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
