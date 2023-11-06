import {expect} from 'chai';

import {add, subtract} from '../src/index.js';


describe('Index tests', () => {
  it('2 + 2 should return 4', () => {
    expect(add(2, 2)).to.equal(4);
  });
  it('2 - 2 should return 0', () => {
    expect(subtract(2, 2)).to.equal(0);
  });
});
