import {exec} from 'node:child_process';

import {expect} from 'chai';

describe('Logger command line arguments (slow due to using child processes)', () => {
  it('should accept numeric log level', (done) => {
    exec('node ./node_modules/mocha/bin/mocha.js --loader=ts-node/esm ./tests/logger/logger-test-script-1.ts --loglevel 2', {windowsHide: true, env: {NODE_ENV: 'production'}}, (err, stdOut, stdErr) => {
      expect(err).to.equal(null, 'error on calling child process exec');
      expect(stdOut).to.match(/^[\s\S]*ErRoR/);
      expect(stdOut).to.match(/^[\s\S]*WaRn/);
      expect(stdOut).not.to.match(/^[\s\S]*SuCcEsS/);
      done();
    });
  }).timeout(8000);

  it('should accept string log level', (done) => {
    exec('node ./node_modules/mocha/bin/mocha.js --loader=ts-node/esm ./tests/logger/logger-test-script-1.ts --loglevel success', {windowsHide: true}, (err, stdOut, stdErr) => {
      expect(err).to.equal(null, 'error on calling child process exec');
      expect(stdOut).to.match(/^[\s\S]*ErRoR/);
      expect(stdOut).to.match(/^[\s\S]*WaRn/);
      expect(stdOut).to.match(/^[\s\S]*SuCcEsS/);
      expect(stdOut).to.match(/^[\s\S]*InFo/);
      expect(stdOut).not.to.match(/^[\s\S]*DeBuG/);
      done();
    });
  }).timeout(8000);
});


