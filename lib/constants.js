'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PROJECTS = exports.YARN_REPO = exports.NPM_REPO = exports.YARN_BIN = exports.NPM_BIN = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NPM_BIN = exports.NPM_BIN = _path2.default.join(__dirname, '../tools/npm.js');
const YARN_BIN = exports.YARN_BIN = _path2.default.join(__dirname, '../tools/yarn.js');

const NPM_REPO = exports.NPM_REPO = _path2.default.join(__dirname, '../tools/npm');
const YARN_REPO = exports.YARN_REPO = _path2.default.join(__dirname, '../tools/yarn');

const PROJECTS = exports.PROJECTS = ['react-native', 'ember-cli'];