const tape = require('tape-async');
const { runOne } = require('./helper');
const {EOL} = require('os');
const path = require('path');

const cwd = process.cwd();
const replaceCwd = (str, replaceWith) => str.replace(cwd, replaceWith);

// Remove empty lines, but keep all meaningful output
const sanitizeLintOutput = (lintOutput) => lintOutput.split(EOL).filter(Boolean).join(EOL);

tape('test/01 camelCase', async test => {
  const { output } = await runOne(path.join(cwd, '/lib/tslint/test/01'));

  test.deepEqual(
    replaceCwd(sanitizeLintOutput(output), '???'),
    'ERROR: ???/lib/tslint/test/01/badModule.ts[1, 1]: module must have an export corresponding to file name (expected export name "badModule")'
  );
});

tape('test/02 pascalCase', async test => {
  const { output } = await runOne(path.join(cwd, '/lib/tslint/test/02'));

  test.deepEqual(
    replaceCwd(sanitizeLintOutput(output), '???'),
    'ERROR: ???/lib/tslint/test/02/badModule.ts[1, 1]: module must have an export corresponding to file name (expected export name "BadModule")'
  );
});
