const assert = require('assert-diff');
const runner = require('tslint/lib/runner');

const optionsFor = dir => ({
  config: `${dir}/tslint.json`,
  exclude: [],
  files: [],
  fix: undefined,
  force: undefined,
  format: 'prose',
  formattersDirectory: undefined,
  init: undefined,
  out: undefined,
  outputAbsolutePaths: undefined,
  project: dir,
  rulesDirectory: undefined,
  test: undefined,
  typeCheck: undefined
});


async function runOne(dir) {
  let rs;
  let rj;
  const p = new Promise((res, rej) => (rs = res, rj = rej));

  let output;
  let error;
  let errorMessage;
  let exitCode;
  const complete = () => (rs({ output, error, errorMessage, exitCode }));
  runner.run(optionsFor(dir), {
    log: function (m) {
      output = m;
    },
    error: function (m) {
      errorMessage = m;
    },
  })
    .then(function (rc) {
      exitCode = rc;
      complete();
    }).catch(function (e) {
    exitCode = 1;
    error = e;
    complete();
  });

  return p;
}

const replaceCwd = (str, replaceWith) => str.replace(process.cwd(), replaceWith);

//
async function runAll() {
  const { output } = await runOne('/Users/iov/git/own/ensure-named-export-rule/lib/tslint/test/01');
  const strings = output.split('\n').filter(Boolean);

  assert.deepEqual(
    replaceCwd(strings[0], '???'),
    'ERROR: ???/lib/tslint/test/01/someModule.ts[1, 1]: module must have an export corresponding to file name (expected export name "someModule")'
  );
}

runAll();

