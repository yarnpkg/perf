'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.repeat = exports.retry = exports.run = exports.series = undefined;

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _log = require('./log');

var log = _interopRequireWildcard(_log);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let series = exports.series = (funcs, callback) => {
  const results = [];
  let index = 0;

  let next = () => {
    const func = funcs[index++];

    if (!func) {
      callback(null, results);
      return;
    }

    let called = false;

    func((error, result) => {
      if (called) {
        throw new Error('A callback can only be called once in series()');
      } else {
        called = true;
      }

      if (error) {
        callback(error, null);
      } else {
        results.push(result);
        next();
      }
    });
  };

  next();
};

let run = exports.run = (command, args, dir, callback) => {
  log.err(`      (running ${command} ${args.join(" ")} in ${dir})`);

  let start = Date.now();

  let cmd = _child_process2.default.spawn(command, args, {
    stdio: ['ignore', 'ignore', 'inherit'],
    cwd: _path2.default.resolve(__dirname, dir)
  });

  cmd.on('exit', code => {
    let time = Date.now() - start;

    if (code !== 0) {
      callback(new Error(`Command exited with ${code}: ${command} ${args.join(' ')}`), null);
    } else {
      callback(null, time);
    }
  });
};

let retry = exports.retry = (retries, func, callback) => {
  let next = retry => {
    func((err, result) => {
      if (err && retry < retries) {
        next(retry + 1);
      } else {
        callback(err, result);
      }
    });
  };

  next(1);
};

let repeat = exports.repeat = (attempts, func, callback) => {
  let next = attempt => {
    func(err => {
      if (err) {
        callback(err, null);
      } else if (attempt === attempts) {
        callback(null, null);
      } else {
        next(attempt + 1);
      }
    });
  };

  next(1);
};