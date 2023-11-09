import {expect} from 'chai';

import {config, log} from '../../src/index.js';

import {callLogWarn} from './logger-test-script-2.js';

describe('Logger', () => {
  let hook: {
    unhook: () => void;
    captured: () => string;
    clear: () => void;
    suspend: () => void;
    resume: () => void;
    forward: (setting: boolean) => void;
  };

  beforeEach(() => {
    hook = captureStream(process.stdout, false);
  });

  afterEach(() => {
    hook.unhook();
  });

  const tests = [
    {fn: log.error, level: 1, glyph: '[31m✖', regex: '^ {2}0:00:\\d{2}\\.\\d{3} \u001b\\[31m✖\u001b\\[0m {2}some text\\n$'},
    {fn: log.warn, level: 2, glyph: '[33m⚠', regex: '^ {2}0:00:\\d{2}\\.\\d{3} \u001b\\[33m⚠\u001b\\[0m {2}some text\\n$'},
    {fn: log.info, level: 3, glyph: '[34mℹ', regex: '^ {2}0:00:\\d{2}\\.\\d{3} \u001b\\[34mℹ\u001b\\[0m {2}some text\\n$'},
    {fn: log.success, level: 3, glyph: '[32m✔', regex: '^ {2}0:00:\\d{2}\\.\\d{3} \u001b\\[32m✔\u001b\\[0m {2}some text\\n$'},
    {fn: log.debug, level: 4, glyph: '[36m●', regex: '^ {2}0:00:\\d{2}\\.\\d{3} \u001b\\[36m●\u001b\\[0m {2}some text\\n$'},
    {fn: log.trace, level: 5, glyph: '[90m☰', regex: '^ {2}0:00:\\d{2}\\.\\d{3} \u001b\\[90m☰\u001b\\[0m {2}some text[\\s\\S]*$'},
  ];

  tests.forEach((test) => {
    it(`log.${test.fn.name}() should only log at levels ${test.level}+`, () => {
      for (let i = 0; i <= 5; i++) {
        hook.clear();
        log.setLevel(i);
        hook.resume();
        test.fn('some text');
        hook.suspend();
        if (i < test.level) {
          expect(hook.captured()).to.equal('', `log level: ${i}, log.${test.fn.name}() shouldn't run for log levels <= ${test.level}`);
        } else {
          expect(hook.captured()).to.match(new RegExp(test.regex), `i = ${i}`);
        }
      }
    });
  });

  it('log.xxx() should use extended Unicode characters on supported consoles', () => {
    hook.clear();
    log.setLevel('warn');
    /* eslint-disable no-process-env */
    const temp = process.env.TERM_PROGRAM;
    process.env.TERM_PROGRAM = 'vscode';
    hook.resume();
    log.warn('Unicode Glyph');
    hook.suspend();
    process.env.TERM_PROGRAM = temp;
    /* eslint-enable no-process-env */
    // eslint-disable-next-line no-control-regex
    expect(hook.captured()).to.match(new RegExp('^ {2}0:00:\\d{2}\\.\\d{3} \u001b\\[33m⚠\u001b\\[0m {2}Unicode Glyph\n$'));
  });

  it('log.xxx() should use ascii Code Page 437 characters only (no extended Unicode) on unsupported consoles', () => {
    hook.clear();
    log.setLevel('warn');
    /* eslint-disable no-process-env */
    const temp = process.env.TERM_PROGRAM;
    process.env.TERM_PROGRAM = 'rubbish';
    hook.resume();
    log.warn('Ascii Glyph');
    hook.suspend();
    process.env.TERM_PROGRAM = temp;
    /* eslint-enable no-process-env */
    // eslint-disable-next-line no-control-regex
    expect(hook.captured()).to.match(new RegExp('^ {2}0:00:\\d{2}\\.\\d{3} \u001b\\[33m‼\u001b\\[0m {2}Ascii Glyph\n$'));
  });

  it('log.setLevel("some rubbish") in production should set the default log level to 2 (warn)', () => {
    const temp = config.env;
    config.env = 'production';
    log.setLevel('some rubbish');
    config.env = temp;
    expect(log.getLevel()).to.equal(2, 'should be default level 2 in production environment');
  });

  it('log.setLevel("some rubbish") in development should set the default log level to 3 (info)', () => {
    const temp = config.env;
    config.env = 'development';
    log.setLevel('some rubbish');
    config.env = temp;
    expect(log.getLevel()).to.equal(3, 'should be default level 3 in development environment');
  });

  it('should have global scope', () => {
    hook.clear();
    log.setLevel('error');
    hook.resume();
    callLogWarn();
    hook.suspend();
    expect(hook.captured()).to.equal('');
    log.setLevel('warn');
    hook.resume();
    callLogWarn();
    hook.suspend();
    expect(hook.captured()).to.match(new RegExp('^[\\s\\S]*My Test\\n$'));
  });

  it('should trace correctly if called in a catch', () => {
    hook.clear();
    log.setLevel('silly');
    hook.resume();
    try {
      myErr();
    } catch {
      log.trace('Error happened');
    }
    hook.suspend();
    // eslint-disable-next-line no-control-regex
    expect(hook.captured()).to.match(new RegExp('^ {2}0:00:\\d{2}\\.\\d{3} \u001b\\[90m☰\u001b\\[0m {2}Error happened[\\s\\S]*$'));
  });
});

function myErr(): void {
  throw new Error('My Error');
}

// captureStream code - inserts a new stream.write function which logs everything sent to write
let buf = '';

function captureStream(stream: NodeJS.WriteStream & {fd: 1;}, forward = true) {
  let _suspended = false;
  let _forward = forward;

  // store the existing (old) write function
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const oldWrite = stream.write;

  // create a new replacement function
  function newWrite(chunk: Uint8Array | string, cb?: (err?: Error) => void): boolean;
  function newWrite(chunk: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
  function newWrite(chunk: Uint8Array | string, arg2?: ((err?: Error) => void) | BufferEncoding, arg3?: (err?: Error) => void): boolean {
    // chunk is a String or Buffer
    if (!_suspended) {
      buf += chunk.toString();
    }

    if (_suspended || _forward) {
      if (typeof arg2 === 'function') {
        return oldWrite.apply(stream, [chunk, undefined, arg2]);
      } else {
        return oldWrite.apply(stream, [chunk, arg2, arg3]);
      }
    } else {
      // spoof true return value
      return true;
    }
  }

  // set stream.write to the new capturing function
  stream.write = newWrite;

  return {
    unhook: function unhook() {
      // reinstate the previous write function
      stream.write = oldWrite;
    },
    captured: () => {
      return buf;
    },
    clear: () => {
      buf = '';
    },
    suspend: () => {
      _suspended = true;
    },
    resume: () => {
      _suspended = false;
    },
    forward: (setting: boolean) => {
      _forward = setting;
    },
  };
}
