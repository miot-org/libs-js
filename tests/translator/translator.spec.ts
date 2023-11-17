import {expect} from 'chai';

import {Translator} from '../../src/index.js';

describe('Translator', () => {
  const translator = new Translator([{pattern: './tests/translator/*.locale.json'}]);
  it('should load files', () => {
    expect(translator.lookup('en-US', '_metre')).to.equal('meter');
  });
  it('should keep a trace of the source', () => {
    expect(translator.trace('en-US', '_imperial_gallons')).to.equal('Gallons (tests/translator/en.locale.json:en-GB)\nimperial gallons (tests/translator/en.locale.json:en-US)\nWonderful Gallons (tests/translator/2.locale.json:en-US)\n');
  });
  it('should fallback correctly', () => {
    expect(translator.lookup('en-US', '_a_test_phrase')).to.equal('a test phrase');
  });
  it('should report a correct trace when using fallback', () => {
    expect(translator.trace('en-US', '_a_test_phrase')).to.equal('a test phrase (fallback)\n');
  });
  it('should work on more than one locale', () => {
    expect(translator.lookup('en-GB', '_imperial_gallons')).to.equal('Gallons');
    translator.dropLocale('en-GB');
  });
  it('should log lookups correctly', () => {
    translator.startLogging();
    translator.lookup('en-US', '_imperial_gallons');
    translator.lookup('en-US', '_Imp_Gal');
    translator.lookup('en-GB', '_Imp_Gal');
    translator.stopLogging();
    translator.lookup('en-GB', '_should_not_log');
    translator.startLogging();
    translator.lookup('en-GB', '_Not_in_Dictionary');
    expect(translator.getLog('en-US')).to.eql(['_imperial_gallons', '_Imp_Gal']);
    expect(translator.getLog('en-GB')).to.eql(['_Imp_Gal', '_Not_in_Dictionary']);
    expect(translator.getLog('dummy')).to.eql([]);
    // combined log for all dictionaries
    expect(translator.getLog()).to.eql(['_imperial_gallons', '_Imp_Gal', '_Not_in_Dictionary']);
    translator.clearLog('en-US');
    expect(translator.getLog()).to.eql(['_Imp_Gal', '_Not_in_Dictionary']);
    translator.lookup('en-US', '_this_should_log');
    expect(translator.getLog('en-US')).to.eql(['_this_should_log']);
    translator.clearLog();
    expect(translator.getLog('en-GB')).to.eql([]);
    expect(translator.getLog('en-US')).to.eql([]);
  });
  it('should return trace on unknown locale', () => {
    expect(translator.trace('unknown', '_some_phrase')).to.equal('some phrase (fallback)\n');
  });
});
