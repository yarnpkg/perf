// @flow
import { series, retry, run } from "./utils";
import { NPM_REPO, YARN_REPO } from "./constants";
import type { Callback } from "./types";

let updateCliRepo = (repo: string, callback: Callback<Error, null>) => {
  series(
    [
      cb => run("git", ["pull", "origin", "master"], repo, cb),
      cb => run("npm", ["install"], repo, cb)
    ],
    err => callback(err, null)
  );
};

export let updateNpm = (callback: Callback<Error, null>) => {
  retry(
    4,
    retryCb => series([cb => updateCliRepo(NPM_REPO, cb)], retryCb),
    err => callback(err, null)
  );
};

export let updateYarn = (callback: Callback<Error, null>) => {
  retry(
    4,
    retryCb => {
      series(
        [
          cb => updateCliRepo(YARN_REPO, cb),
          cb => run("npm", ["run", "build"], YARN_REPO, cb)
        ],
        retryCb
      );
    },
    err => callback(err, null)
  );
};
