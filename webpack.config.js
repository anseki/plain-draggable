/* eslint-env node, es6 */

'use strict';

const
  BASE_NAME = 'plain-draggable',
  OBJECT_NAME = 'PlainDraggable',

  webpack = require('webpack'),
  path = require('path'),
  PKG = require('./package'),

  RULES = require('./webpack.config.rules.js').concat([ // Join `webpack.config.rules.js` files
    'cssprefix',
    'anim-event',
    'm-class-list'
  ].reduce((rules, packageName) =>
    rules.concat(require(`./node_modules/${packageName}/webpack.config.rules.js`)), [])),

  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',

  SRC_PATH = path.resolve(__dirname, 'src'),
  ENTRY_PATH = path.resolve(SRC_PATH, `${BASE_NAME}.js`),
  BUILD_PATH = BUILD ? __dirname : path.resolve(__dirname, 'test'),
  BUILD_FILE = `${BASE_NAME}${LIMIT ? '-limit' : ''}${BUILD ? '.min' : ''}.js`;

module.exports = {
  entry: ENTRY_PATH,
  output: {
    path: BUILD_PATH,
    filename: BUILD_FILE,
    library: OBJECT_NAME,
    libraryTarget: 'var'
  },
  resolve: {mainFields: ['jsnext:main', 'browser', 'module', 'main']},
  module: {rules: RULES},
  devtool: BUILD ? false : 'source-map',
  plugins: BUILD ? [
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: true}}),
    new webpack.BannerPlugin(
      `${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage}`)
  ] : []
};
