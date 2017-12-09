/* eslint-env node, es6 */

'use strict';

const
  path = require('path'),
  SRC_PATH = path.resolve(__dirname, 'src'),
  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',
  BABEL_RULE = {
    loader: 'babel-loader',
    options: {
      presets: ['es2015'],
      plugins: ['add-module-exports']
    }
  },

  LIMIT_TAGS = ['SNAP', 'SVG', 'LEFTTOP'],
  BASE_NAME = 'plain-draggable',
  ENTRY_PATH = path.resolve(SRC_PATH, `${BASE_NAME}.js`);

module.exports = [
  {
    resource: {and: [SRC_PATH, /\.js$/]},
    use: [
      BABEL_RULE,
      BUILD ? {
        loader: 'pre-proc-loader',
        options: {
          removeTag: {tag: ['DEBUG'].concat(LIMIT ? LIMIT_TAGS : [])}
        }
      } : {
        loader: 'skeleton-loader',
        options: {
          procedure: function(content) {
            const preProc = require('pre-proc');
            if (LIMIT) { content = preProc.removeTag(LIMIT_TAGS, content); }
            if (this.resourcePath === ENTRY_PATH) {
              // Save the source code after preProc has been applied.
              const destPath = path.resolve(SRC_PATH,
                `${BASE_NAME}${LIMIT ? '-limit' : ''}.proc.js`);
              require('fs').writeFileSync(destPath,
                '/*\n    DON\'T MANUALLY EDIT THIS FILE\n*/\n\n' +
                preProc.removeTag('DEBUG', content));
              console.log(`Output: ${destPath}`);
            }
            return content;
          }
        }
      }
    ]
  }
];
