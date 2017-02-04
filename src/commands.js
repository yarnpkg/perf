// @flow
import {run, series} from './utils';
import {NPM_BIN, YARN_BIN} from './constants';
import type {Callback, ScenarioOptions} from './types';

let maybe = (func, dir, callback: Callback<Error, number>, condition) =>
  condition
    ? func(dir, callback)
    : callback(null, 0);

// Runs

export let runNpmInstall = (dir: string, callback: Callback<Error, number>) =>
  run(NPM_BIN, ['install', '--silent'], dir, callback);
export let runYarnInstall = (dir: string, callback: Callback<Error, number>) =>
  run(YARN_BIN, ['install'], dir, callback);

let runNpmShrinkwrap = (dir, callback) =>
  run(NPM_BIN, ['shrinkwrap', '--silent'], dir, callback);
let runNpmCacheClean = (dir, callback) =>
  run(NPM_BIN, ['cache', 'clean'], dir, callback);
let runYarnCacheClean = (dir, callback) =>
  run(YARN_BIN, ['cache', 'clean'], dir, callback);
let runRmRfNodeModules = (dir, callback) =>
  run('rm', ['-rf', 'node_modules'], dir, callback);
let runRmNpmShrinkwrap = (dir, callback) =>
  run('rm', ['npm-shrinkwrap.json'], dir, callback);
let runRmYarnLock = (dir, callback) =>
  run('rm', ['yarn.lock'], dir, callback);

// Maybes

let maybeRunNpmInstall = (dir, opts, callback) =>
  maybe(runNpmInstall, dir, callback, opts.warmCache || opts.nodeModules || opts.lockfile);
let maybeRunNpmShrinkwrap = (dir, opts, callback) =>
  maybe(runNpmShrinkwrap, dir, callback, opts.lockfile);
let maybeRunNpmCacheClean = (dir, opts, callback) =>
  maybe(runNpmCacheClean, dir, callback, !opts.warmCache);
let maybeRunYarnInstall = (dir, opts, callback) =>
  maybe(runYarnInstall, dir, callback, opts.warmCache || opts.nodeModules || opts.lockfile);
let maybeRunYarnCacheClean = (dir, opts, callback) =>
  maybe(runYarnCacheClean, dir, callback, !opts.warmCache);
let maybeRunRmRfNodeModules = (dir, opts, callback) =>
  maybe(runRmRfNodeModules, dir, callback, !opts.nodeModules);
let maybeRunRmNpmShrinkwrap = (dir, opts, callback) =>
  maybe(runRmNpmShrinkwrap, dir, callback, !opts.lockfile);
let maybeRunRmYarnLock = (dir, opts, callback) =>
  maybe(runRmYarnLock, dir, callback, !opts.lockfile);

// Prepares

export let prepareNpm = (dir: string, opts: ScenarioOptions, callback: Callback<Error, null>) => {
  series([
    cb => maybeRunNpmInstall(dir, opts, cb),
    cb => maybeRunNpmShrinkwrap(dir, opts, cb),
    cb => maybeRunRmRfNodeModules(dir, opts, cb),
    cb => maybeRunNpmCacheClean(dir, opts, cb),
    cb => maybeRunRmNpmShrinkwrap(dir, opts, cb),
  ], err => callback(err, null));
};

export let prepareYarn = (dir: string, opts: ScenarioOptions, callback: Callback<Error, null>) => {
  series([
    cb => maybeRunYarnInstall(dir, opts, cb),
    cb => maybeRunRmRfNodeModules(dir, opts, cb),
    cb => maybeRunYarnCacheClean(dir, opts, cb),
    cb => maybeRunRmYarnLock(dir, opts, cb),
  ], err => callback(err, null));
};
