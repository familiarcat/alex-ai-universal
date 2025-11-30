const path = require('path');
const Mocha = require('mocha');

function run() {
  const mocha = new Mocha({ ui: 'tdd', color: true });
  const testsRoot = path.resolve(__dirname, '..');

  mocha.addFile(path.resolve(testsRoot, 'extension.test.js'));

  return new Promise((c, e) => {
    try {
      mocha.run(failures => {
        if (failures > 0) {
          e(new Error(`${failures} tests failed.`));
        } else {
          c();
        }
      });
    } catch (err) {
      e(err);
    }
  });
}

module.exports = { run };
