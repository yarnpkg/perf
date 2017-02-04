'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _log = require('./log');

var log = _interopRequireWildcard(_log);

var _utils = require('./utils');

var _constants = require('./constants');

var _repos = require('./repos');

var _commands = require('./commands');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.title = 'yarn-perf';

function runScenario(attempts, scenario, callback) {
  let command = scenario.command;
  let opts = scenario.opts;
  let dir = scenario.dir;

  log.err(`running ${command} - warm cache: ${String(opts.warmCache)}, node_modules: ${String(opts.nodeModules)}, lockfile: ${String(opts.lockfile)}`);

  let prepare;
  let execute;

  if (command === 'npm') {
    prepare = _commands.prepareNpm;
    execute = _commands.runNpmInstall;
  } else if (command === 'yarn') {
    prepare = _commands.prepareYarn;
    execute = _commands.runYarnInstall;
  } else {
    callback(new Error('Invalid scenario command: ' + command), null);
  }

  let total = 0;
  let attemptNum = 0;

  (0, _utils.repeat)(attempts, cb => {
    log.err(`  attempt #${++attemptNum}`);

    prepare(dir, opts, err => {
      execute(dir, (err, time) => {
        if (err) return cb(err, null);
        time = time;
        log.err(`    time: ${time}`);
        total += time;
        cb(null, null);
      });
    });
  }, err => {
    if (err) return callback(err, null);
    callback(null, total / attempts);
  });
}

function runScenarios(scenarios, attempts, callback) {
  let results = [];

  let next = index => {
    let scenario = scenarios[index];

    (0, _utils.retry)(4, cb => {
      runScenario(attempts, scenario, cb);
    }, (err, averageTime) => {
      results.push({ averageTime, scenario });
      if (err) {
        callback(err, null);
      } else if (index === scenarios.length - 1) {
        callback(null, results);
      } else {
        next(index + 1);
      }
    });
  };

  next(0);
}

function createScenarios() {
  let scenarios = [];

  for (let project of _constants.PROJECTS) {
    let dir = _path2.default.resolve(__dirname, '../projects', project);
    for (let warmCache of [true, false]) {
      for (let nodeModules of [true, false]) {
        for (let lockfile of [true, false]) {
          for (let command of ['npm', 'yarn']) {
            scenarios.push({ command, dir, opts: { warmCache, nodeModules, lockfile } });
          }
        }
      }
    }
  }

  return scenarios;
}

function main() {
  let scenarios = createScenarios();
  (0, _utils.series)([cb => (0, _repos.updateNpm)(cb), cb => (0, _repos.updateYarn)(cb)], err => {
    if (err) return log.err(err.toString());
    runScenarios(scenarios, 1, (err, results) => {
      if (err) log.err(err.toString());
      log.out(JSON.stringify(results, null, 2));
    });
  });
}

main();