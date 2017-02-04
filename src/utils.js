// @flow
import type {Callback, Func, Funcs} from './types';
import child from 'child_process';
import path from 'path';
import * as log from './log';

export let series = <Err, Res>(
  funcs: Funcs<Err, Res>,
  callback: Callback<Err, Array<Res>>
) => {
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

export let run = (command: string, args: Array<string>, dir: string, callback: Callback<Error, number>) => {
  log.err(`      (running ${command} ${args.join(" ")} in ${dir})`);

  let start = Date.now();

  let cmd = child.spawn(command, args, {
    stdio: ['ignore', 'ignore', 'inherit'],
    cwd: path.resolve(__dirname, dir)
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

export let retry = <Err, Res>(retries: number, func: Func<Err, Res>, callback: Callback<Err, Res>) => {
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

export let repeat = <Err, Res>(attempts: number, func: Func<Err, Res>, callback: Callback<Err, Res>) => {
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
