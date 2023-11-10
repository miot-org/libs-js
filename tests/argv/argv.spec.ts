import {expect} from 'chai';

import {argv} from '../../src/index.js';

describe('argv()', () => {
  it('it should return a setting after a selection', () => {
    const temp = process.argv;
    process.argv = ['--test1', 'yes'];
    expect(argv('--test1')).to.equal('yes');
    process.argv = temp;
  });

  it('it should return true if a selection is present', () => {
    const temp = process.argv;
    process.argv = ['-t', '-yes'];
    expect(argv('-yes')).to.equal(true);
    process.argv = temp;
  });

  it('it should return false if a selection is not present', () => {
    const temp = process.argv;
    process.argv = ['-t', '-yes'];
    expect(argv('-a')).to.equal(false);
    process.argv = temp;
  });

});
