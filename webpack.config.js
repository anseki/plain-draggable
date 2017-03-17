/* eslint-env node, es6 */

'use strict';

const
  BASE_NAME = 'plain-draggable',
  OBJECT_NAME = 'PlainDraggable',

  IMPORTED_PACKAGES_PATH = [
    'cssprefix',
    'anim-event',
    'm-class-list'
  ].map(packageName => require.resolve(packageName) // Get package root path
    .replace(new RegExp(`^(.*[/\\\\]node_modules[/\\\\]${packageName}[/\\\\]).*$`), '$1')),

  LIMIT_TAGS = ['SNAP', 'SVG', 'LEFTTOP'],

  webpack = require('webpack'),
  path = require('path'),
  PKG = require('./package'),
  preProc = require('pre-proc'),

  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',
  SRC = process.env.SRC === 'yes',

  SRC_PATH = path.resolve(__dirname, 'src'),
  ENTRY_PATH = path.resolve(SRC_PATH, `${BASE_NAME}.js`),
  BUILD_PATH = BUILD ? __dirname : path.resolve(__dirname, 'test'),
  BUILD_FILE = `${BASE_NAME}${LIMIT ? '-limit' : ''}${BUILD ? '.min' : ''}.js`,

  BABEL_RULE = {
    loader: 'babel-loader',
    options: {
      presets: ['es2015'],
      plugins: ['add-module-exports']
    }
  };

if (!LIMIT && SRC) { throw new Error('This options break source file.'); }

module.exports = {
  entry: ENTRY_PATH,
  output: {
    path: BUILD_PATH,
    filename: BUILD_FILE,
    library: OBJECT_NAME,
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
                  content = preProc.removeTag(LIMIT_TAGS, content, this.resourcePath, SRC_PATH);
                  if (!BUILD && SRC && this.resourcePath === ENTRY_PATH) {
                    // Save the source code of limited function, to check.
                    const destPath = path.resolve(SRC_PATH, BUILD_FILE);
                    require('fs').writeFileSync(destPath, content);
                    console.log(`Output: ${destPath}`);
                  }
                }
                return BUILD ?
                  preProc.removeTag('DEBUG', content, this.resourcePath, IMPORTED_PACKAGES_PATH.concat(SRC_PATH)) :
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
