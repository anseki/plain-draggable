/* eslint-env node, es6 */

'use strict';

const
  DOC_ROOT = __dirname,
  PORT = 8080,

  http = require('http'),
  staticAlias = require('node-static-alias'),
  log4js = require('log4js'),
  filelist = require('stats-filelist'),
  path = require('path'),
  fs = require('fs'),

  MODULE_PACKAGES = [
    'jasmine-core',
    'test-page-loader'
  ],

  EXT_DIR = path.resolve('../../test-ext');

log4js.configure({
  appenders: [
    {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[[%r]%] %m' // Super simple format
      }
    }
  ]
});
let logger = log4js.getLogger('node-static-alias');
logger.setLevel(log4js.levels.INFO);

http.createServer((request, response) => {
  request.addListener('end', () => {
    (new staticAlias.Server(DOC_ROOT, {
      cache: false,
      alias: MODULE_PACKAGES.map(modulePackage => (
        { // node_modules
          match: new RegExp(`^/${modulePackage}/.+`),
          serve: `${require.resolve(modulePackage).replace(/([\/\\]node_modules)[\/\\].*$/, '$1')}<% reqPath %>`,
          allowOutside: true
        })).concat([
          // test-ext
          {
            match: /^\/ext\/.+/,
            serve: params => params.reqPath.replace(/^\/ext/, EXT_DIR),
            allowOutside: true
          },
          // test-ext index
          {
            match: /^\/ext\/?$/,
            serve: () => {
              const indexPath = path.join(EXT_DIR, '.index.html');
              fs.writeFileSync(indexPath,
                `<html><head><meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"></head><body><ul>${
                  filelist.getSync(EXT_DIR, {
                    filter: stats => /^[^\.].*\.html$/.test(stats.name),
                    listOf: 'fullPath'
                  }).sort()
                  .map(fullPath => {
                    const htmlPath = path.relative(EXT_DIR, fullPath).replace(path.sep, '/');
                    return `<li><a href="${htmlPath}">${htmlPath}</a></li>`;
                  }).join('')
                }</ul></body></html>`);
              return indexPath;
            },
            allowOutside: true
          }
        ]),
      logger: logger
    }))
    .serve(request, response, e => {
      if (e) {
        response.writeHead(e.status, e.headers);
        logger.error('(%s) %s', request.url, response.statusCode);
        if (e.status === 404) {
          response.end('Not Found');
        }
      } else {
        logger.info('(%s) %s', request.url, response.statusCode);
      }
    });
  }).resume();
}).listen(PORT);

console.log(`START: http://localhost:${PORT}/\nROOT: ${DOC_ROOT}`);
console.log('(^C to stop)');
