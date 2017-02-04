// @flow
import path from 'path';
import * as log from './log';
import {series, repeat, retry} from './utils';
import type {Scenario} from './types';
import {PROJECTS} from './constants';
import {
  updateNpm,
  updateYarn
} from './repos';
import {
  prepareNpm,
  prepareYarn,
  runNpmInstall,
  runYarnInstall
} from './commands';

process.title = 'yarn-perf';

function runScenario(attempts, scenario: Scenario, callback) {
  let command = scenario.command;
  let opts = scenario.opts;
  let dir = scenario.dir;

  log.err(`running ${command} - warm cache: ${String(opts.warmCache)}, node_modules: ${String(opts.nodeModules)}, lockfile: ${String(opts.lockfile)}`);

  let prepare;
  let execute;

  if (command === 'npm') {
    prepare = prepareNpm;
    execute = runNpmInstall;
  } else if (command === 'yarn') {
    prepare = prepareYarn;
    execute = runYarnInstall;
  } else {
    callback(new Error('Invalid scenario command: ' + command), null);
  }

  let total = 0;
  let attemptNum = 0;

  repeat(attempts, cb => {
    log.err(`  attempt #${++attemptNum}`);

    prepare(dir, opts, err => {
      execute(dir, (err, time) => {
        if (err) return cb(err, null);
        time = ((time: any): number);
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

    retry(4, cb => {
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
  }

  next(0);
}

function createScenarios(): Array<Scenario> {
  let scenarios = [];

  for (let project of PROJECTS) {
    let dir = path.resolve(__dirname, '../fixtures', project);
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
  series([
    cb => updateNpm(cb),
    cb => updateYarn(cb),
  ], (err) => {
    if (err) return log.err(err.toString());
    runScenarios(scenarios, 1, (err, results) => {
      if (err) log.err(err.toString());
      log.out(JSON.stringify(results, null, 2));
    });
  });
}

main();
