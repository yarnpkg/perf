// @flow
export type Callback<Err, Res> = (err: Err | null, res: Res | null) => mixed;
export type Func<Err, Res> = ((err: Err, res: Res) => void) => mixed;
export type Funcs<Err, Res> = Array<Func<Err, Res>>;

export type ScenarioOptions = {
  warmCache: boolean,
  nodeModules: boolean,
  lockfile: boolean
};

export type Scenario = {
  command: string,
  dir: string,
  opts: ScenarioOptions
};
