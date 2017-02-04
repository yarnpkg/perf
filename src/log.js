// @flow
export let err = (str: string) => process.stderr.write(str + '\n');
export let out = (str: string) => process.stdout.write(str + '\n');
