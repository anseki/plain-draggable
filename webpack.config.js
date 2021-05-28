/* eslint-env node, es6 */

'use strict';

const
  BASE_NAME = 'plain-draggable',
  OBJECT_NAME = 'PlainDraggable',
  LIMIT_TAGS = ['SNAP', 'AUTO-SCROLL', 'SVG', 'LEFTTOP'],
  BUILD_MODE = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',
  BUILD_BASE_NAME = `${BASE_NAME}${LIMIT ? '-limit' : ''}`,
  PREPROC_REMOVE_TAGS = (BUILD_MODE ? ['DEBUG'] : []).concat(LIMIT ? LIMIT_TAGS : []),

  webpack = require('webpack'),
  preProc = require('pre-proc'),
  path = require('path'),
  fs = require('fs'),
  PKG = require('./package'),

  SRC_DIR_PATH = path.resolve(__dirname, 'src'),
  BUILD_DIR_PATH = BUILD_MODE ? __dirname : path.resolve(__dirname, 'test'),
  ESM_DIR_PATH = __dirname,
  ENTRY_PATH = path.join(SRC_DIR_PATH, `${BASE_NAME}.js`);

function writeFile(filePath, content, messageClass) {
  const HL = '='.repeat(48);
  fs.writeFileSync(filePath,
    `/* ${HL}\n        DON'T MANUALLY EDIT THIS FILE\n${HL} */\n\n${content}`);
  console.log(`Output (${messageClass}): ${filePath}`);
}

module.exports = {
  mode: BUILD_MODE ? 'production' : 'development',
  entry: ENTRY_PATH,
  output: {
    path: BUILD_DIR_PATH,
    filename: `${BUILD_BASE_NAME}${BUILD_MODE ? '.min' : ''}.js`,
    library: OBJECT_NAME,
    libraryTarget: 'var',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        resource: {and: [SRC_DIR_PATH, /\.js$/]},
        use: [
          // ================================ Save ESM file
          {
            loader: 'skeleton-loader',
            options: {
              procedure(content) {
                if (this.resourcePath === ENTRY_PATH) {
                  writeFile(
                    path.join(ESM_DIR_PATH, `${BUILD_BASE_NAME}${BUILD_MODE ? '' : '-debug'}.esm.js`),
                    content, 'ESM');
                }
                return content;
              }
            }
          },
          // ================================ Babel
          {
            loader: 'babel-loader',
            options: {presets: [['@babel/preset-env', {targets: 'defaults', modules: false}]]}
          },
          // ================================ Preprocess
          PREPROC_REMOVE_TAGS.length ? {
            loader: 'skeleton-loader',
            options: {
              procedure(content) {
                content = preProc.removeTag(PREPROC_REMOVE_TAGS, content);
                if (BUILD_MODE && this.resourcePath === ENTRY_PATH) {
                  writeFile(path.join(SRC_DIR_PATH, `${BUILD_BASE_NAME}.proc.js`), content, 'PROC');
                }
                return content;
              }
            }
          } : null
        ].filter(loader => !!loader)
      }
    ]
  },
  devtool: BUILD_MODE ? false : 'source-map',
  plugins: BUILD_MODE ? [
    new webpack.BannerPlugin(
      `${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage}`)
  ] : []
};
