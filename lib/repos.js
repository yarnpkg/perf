'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateYarn = exports.updateNpm = undefined;

var _utils = require('./utils');

var _constants = require('./constants');

let updateCliRepo = (repo, callback) => {
  (0, _utils.series)([cb => (0, _utils.run)('git', ['pull', 'origin', 'master'], repo, cb), cb => (0, _utils.run)('npm', ['install'], repo, cb)], err => callback(err, null));
};

let updateNpm = exports.updateNpm = callback => {
  (0, _utils.retry)(4, retryCb => {
    (0, _utils.series)([cb => updateCliRepo(_constants.NPM_REPO, cb)], retryCb);
  }, err => callback(err, null));
};

let updateYarn = exports.updateYarn = callback => {
  (0, _utils.retry)(4, retryCb => {
    (0, _utils.series)([cb => updateCliRepo(_constants.YARN_REPO, cb), cb => (0, _utils.run)('npm', ['run', 'build'], _constants.YARN_REPO, cb)], retryCb);
  }, err => callback(err, null));
};