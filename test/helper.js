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

module.exports.runOne = runOne;