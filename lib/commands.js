'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareYarn = exports.prepareNpm = exports.runYarnInstall = exports.runNpmInstall = undefined;

var _utils = require('./utils');

var _constants = require('./constants');

let maybe = (func, dir, callback, condition) => condition ? func(dir, callback) : callback(null, 0);

// Runs

let runNpmInstall = exports.runNpmInstall = (dir, callback) => (0, _utils.run)(_constants.NPM_BIN, ['install', '--silent'], dir, callback);
let runYarnInstall = exports.runYarnInstall = (dir, callback) => (0, _utils.run)(_constants.YARN_BIN, ['install'], dir, callback);

let runNpmShrinkwrap = (dir, callback) => (0, _utils.run)(_constants.NPM_BIN, ['shrinkwrap', '--silent'], dir, callback);
let runNpmCacheClean = (dir, callback) => (0, _utils.run)(_constants.NPM_BIN, ['cache', 'clean'], dir, callback);
let runYarnCacheClean = (dir, callback) => (0, _utils.run)(_constants.YARN_BIN, ['cache', 'clean'], dir, callback);
let runRmRfNodeModules = (dir, callback) => (0, _utils.run)('rm', ['-rf', 'node_modules'], dir, callback);
let runRmNpmShrinkwrap = (dir, callback) => (0, _utils.run)('rm', ['npm-shrinkwrap.json'], dir, callback);
let runRmYarnLock = (dir, callback) => (0, _utils.run)('rm', ['yarn.lock'], dir, callback);

// Maybes

let maybeRunNpmInstall = (dir, opts, callback) => maybe(runNpmInstall, dir, callback, opts.warmCache || opts.nodeModules || opts.lockfile);
let maybeRunNpmShrinkwrap = (dir, opts, callback) => maybe(runNpmShrinkwrap, dir, callback, opts.lockfile);
let maybeRunNpmCacheClean = (dir, opts, callback) => maybe(runNpmCacheClean, dir, callback, !opts.warmCache);
let maybeRunYarnInstall = (dir, opts, callback) => maybe(runYarnInstall, dir, callback, opts.warmCache || opts.nodeModules || opts.lockfile);
let maybeRunYarnCacheClean = (dir, opts, callback) => maybe(runYarnCacheClean, dir, callback, !opts.warmCache);
let maybeRunRmRfNodeModules = (dir, opts, callback) => maybe(runRmRfNodeModules, dir, callback, !opts.nodeModules);
let maybeRunRmNpmShrinkwrap = (dir, opts, callback) => maybe(runRmNpmShrinkwrap, dir, callback, !opts.lockfile);
let maybeRunRmYarnLock = (dir, opts, callback) => maybe(runRmYarnLock, dir, callback, !opts.lockfile);

// Prepares

let prepareNpm = exports.prepareNpm = (dir, opts, callback) => {
  (0, _utils.series)([cb => maybeRunNpmInstall(dir, opts, cb), cb => maybeRunNpmShrinkwrap(dir, opts, cb), cb => maybeRunRmRfNodeModules(dir, opts, cb), cb => maybeRunNpmCacheClean(dir, opts, cb), cb => maybeRunRmNpmShrinkwrap(dir, opts, cb)], err => callback(err, null));
};

let prepareYarn = exports.prepareYarn = (dir, opts, callback) => {
  (0, _utils.series)([cb => maybeRunYarnInstall(dir, opts, cb), cb => maybeRunRmRfNodeModules(dir, opts, cb), cb => maybeRunYarnCacheClean(dir, opts, cb), cb => maybeRunRmYarnLock(dir, opts, cb)], err => callback(err, null));
};