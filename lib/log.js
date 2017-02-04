'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
let err = exports.err = str => process.stderr.write(str + '\n');
let out = exports.out = str => process.stdout.write(str + '\n');