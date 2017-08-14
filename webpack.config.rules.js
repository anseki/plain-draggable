/* eslint-env node, es6 */

'use strict';

const
  path = require('path'),
  SRC_PATH = path.resolve(__dirname, 'src'),
  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',
  SRC = process.env.SRC === 'yes',
  BABEL_RULE = {
    loader: 'babel-loader',
    options: {
      presets: ['es2015'],
      plugins: ['add-module-exports']
    }
  },

  LIMIT_TAGS = ['SNAP', 'SVG', 'LEFTTOP'],
  BASE_NAME = 'plain-draggable',
  ENTRY_PATH = path.resolve(SRC_PATH, `${BASE_NAME}.js`),
  BUILD_FILE = `${BASE_NAME}${LIMIT ? '-limit' : ''}${BUILD ? '.min' : ''}.js`,
  preProc = require('pre-proc');

if (!LIMIT && SRC) { throw new Error('This options break source file.'); }

module.exports = [
  {
    resource: {and: [SRC_PATH, /\.js$/]},
    use: [
      BABEL_RULE,
      {
        loader: 'skeleton-loader',
        options: {
          procedure: function(content) {
            if (LIMIT) {
              content = preProc.removeTag(LIMIT_TAGS, content);
              if (!BUILD && SRC && this.resourcePath === ENTRY_PATH) {
                // Save the source code of limited function, to check.
                const destPath = path.resolve(SRC_PATH, BUILD_FILE);
                require('fs').writeFileSync(destPath, content);
                console.log(`Output: ${destPath}`);
              }
            }
            return BUILD ? preProc.removeTag('DEBUG', content) : content;
          }
        }
      }
    ]
  }
];
