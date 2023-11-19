/* eslint-disable no-console */
import isUnicodeSupported from 'is-unicode-supported';

import {config} from './config.js';
import {argv} from './argv.js';

// we implement 6 levels of logging: 'silent', 'error', 'warn', 'info', 'debug', 'trace',
// but we also allow aliases 'notice', 'http', 'verbose', 'silly' so that npm loglevel words will also work
const PERMITTED_LOG_LEVELS = {
  silent: [0, 'silent'],
  error: [1, 'error'],
  warn: [2, 'warn'],
  notice: [3, 'info'],
  http: [3, 'info'],
  info: [3, 'info'],
  success: [3, 'success'],
  debug: [4, 'debug'],
  verbose: [4, 'debug'],
  trace: [5, 'trace'],
  silly: [5, 'trace'],
} as const;

/**
 * Logger provides a way to annotate code to provide logging, but also allows logging to be turned off (or
 * down) depending on requirements.
 *
 * The Log Level (detail of logging reported) is taken from command line argument eg.
 * ```cmd
 * --loglevel warn
 * ```
 * or can be selected in code with log.setLevel()
 *
 * Example:
 * ```js
 * import {log} from 'libs-js';
 *
 * log.warn('Something not quite going to plan');
 * log.success('Completed', 'sorting');
 * ```
 *
 * <b>Using logger in your code:</b>
 *
 * Place log messages at the appropriate level throughout your code. If they don't log anything, they will run very quickly.
 *
 * ```js
 * import {log} from '@ortac/libs-js';
 *
 * log.warn('file failed to download');
 * log.success('task completed');
 * const i = 5;
 * log.debug('i:', i);
 * ```
 *
 * Assuming your application is started with a logging level of 'warn' or 2, the following will be output from the above code:
 * <pre style="background-color: Black; color: White">
 *   0:00:00.071 <span style="color:yellow;">⚠</span> file failed to download
 * </pre>
 *
 * Whereas if your application is started with a logging level of 'debug' or 5:
 *
 * <pre style="background-color: Black; color: White">
 *   0:00:00.071 <span style="color:yellow;">⚠</span> file failed to download
 *   0:00:00.074 <span style="color:green;">✔</span> task completed
 *   0:00:00.074 <span style="color:cyan;">●</span> i: 5
 * </pre>
 *
 * <b>Initialising log level on the command line</b>
 *
 * When you start your code, the command line setting will determine the logging level. If none is set on the command line the default is 2 (warn) if in a 'production' environment, or 3 (info/success) if not.
 *
 * ```cmd
 * > node ./src/temp.js --loglevel 2
 * > node ./src/temp.js --loglevel debug
 * ```
 */
export const log = {
  _level: _parseLogLevel(argv('--loglevel')),

  /**
   * Displays the passed in strings on the console together with the stack trace provided log level is 5
   * @param values - strings, numbers, nulls, undefined all concatenated with space separator to form the log message
   */
  trace: (...values: (string | number | null | undefined)[]) => {
    if (log._level === 5) {
      console.log(_concat([_uptime(), _symbols().trace], values, `${ANSI_ESC.brightBlack}\n${_getStackTrace()}${ANSI_ESC.reset}`));
    }
  },

  /**
   * Displays the passed in strings on the console provided log level is 4 or higher
   * @param values - strings, numbers, nulls, undefined all concatenated with space separator to form the log message
   */
  debug: (...values: (string | number | null | undefined)[]) => {
    if (log._level >= 4) {
      console.log(_concat([_uptime(), _symbols().debug], values));
    }
  },

  /**
   * Displays the passed in strings on the console provided log level is 3 or higher
   * @param values - strings, numbers, nulls, undefined all concatenated with space separator to form the log message
   */
  info: (...values: (string | number | null | undefined)[]) => {
    if (log._level >= 3) {
      console.log(_concat([_uptime(), _symbols().info], values));
    }
  },

  /**
   * Displays the passed in strings on the console provided log level is 3 or higher
   * @param values - strings, numbers, nulls, undefined all concatenated with space separator to form the log message
   */
  success: (...values: (string | number | null | undefined)[]) => {
    if (log._level >= 3) {
      console.log(_concat([_uptime(), _symbols().success], values));
    }
  },

  /**
   * Displays the passed in strings on the console provided log level is 2 or higher
   * @param values - strings, numbers, nulls, undefined all concatenated with space separator to form the log message
   */
  warn: (...values: (string | number | null | undefined)[]) => {
    if (log._level >= 2) {
      console.log(_concat([_uptime(), _symbols().warning], values));
    }
  },

  /**
   * Displays the passed in strings on the console provided log level is 1 or higher
   * @param values - strings, numbers, nulls, undefined all concatenated with space separator to form the log message
   */
  error: (...values: (string | number | null | undefined)[]) => {
    if (log._level >= 1) {
      console.log(_concat([_uptime(), _symbols().error], values));
    }
  },

  /**
   * Current Logging Level:
   * - 0 silent
   * - 1 errors
   * - 2 warnings & errors
   * - 3 info, success, warnings & errors
   * - 4 debug and level 3
   * - 5 all including trace
   * @returns current logging level as a numeric (0 - 5)
   */
  getLevel: () => log._level,

  /**
   * Sets the current logging level. Possible values are:
   *
   * 0. 'silent' or 0
   * 1. 'error' or 1
   * 2. 'warn' or 2
   * 3. 'notice', 'http', 'info', 'success' or 3
   * 4. 'debug', 'verbose' or 4
   * 5. 'trace', 'silly' or 5
   * -1 resets log level to that set by the command line
   * @param level - string or numeric representing the required level of logging
   *
   */
  setLevel: (level: number | string | boolean) => {
    if (level === -1) {
      log._level = _parseLogLevel(argv('--loglevel'));
    } else {
      log._level = _parseLogLevel(level);
    }
  },
};

/* ********************************** PRIVATE FUNCTIONS *************************************** */

/**
 * @param level - requested log level, accepts numeric, string eg. 'warn', or boolean (which means use default)
 * @returns log level as a numeric value 0 - 5
 */
function _parseLogLevel(level: number | string | boolean): number {
  let output = 0;
  if (typeof level === 'boolean') {
    output = _defaultLogLevel();
  } else if (typeof level === 'string' || typeof level === 'number') {
    if (typeof level === 'string' && Object.prototype.hasOwnProperty.call(PERMITTED_LOG_LEVELS, level)) {
      const strLogLevel = level as keyof typeof PERMITTED_LOG_LEVELS;
      output = PERMITTED_LOG_LEVELS[strLogLevel][0];
    } else {
      const numLogLevel = Number(level);
      if (!isNaN(numLogLevel) && numLogLevel >= 0 && numLogLevel <= 5) {
        output = numLogLevel;
      } else {
        output = _defaultLogLevel();
      }
    }
  }
  return output;
}

/**
 * Concatenates all the parameters passed in, separating each with a space
 * @param args - items to be concatenated
 * @returns concatenated string
 */
function _concat(...args: (string | number | null | undefined | (string | number | null | undefined)[])[]): string {
  let output = '';
  for (const arg of args) {
    if (typeof arg !== 'undefined' && arg !== null) {
      if (typeof arg === 'string' || typeof arg === 'number') {
        output += ` ${arg.toString()}`;
      } else {
        output += ` ${_concat(...arg)}`;
      }
    }
  }
  return output;
}

/**
 * Gets the current Stack Trace
 * @param indentSpaces - optional number of indent spaces (default 4)
 * @returns multiline string Stack trace with space indentation for each line
 */
function _getStackTrace(indentSpaces = 4) {
  const stack = new Error().stack;
  let output = '';
  if (typeof stack !== 'undefined') {
    const indent = ' '.repeat(indentSpaces);
    // create multiline string stack trace
    output = stack
      .split('\n')
      .map((line) => line.trim())
      // remove first 3 lines ('Error' header, plus two lines relating to getStackTrace call)
      .slice(3)
      // rejoin into string with indentSpaces
      .join(`\n${indent}`)
      // prepend with space indentSpaces
      .replace(/^/, indent);
  }
  return output;
}

/**
 * Returns the default log level based on the current environment
 * for 'production' the default is level 2 (warn)
 * for 'development' the default is level 3 (success/info)
 * @returns number representing the appropriate log level
 */
function _defaultLogLevel(): number {
  return config.env === 'production' ? 2 : 3;
}

/**
 * Calculates uptime
 * @returns string in the format (hh)h:mm:ss.sss
 */
function _uptime(): string {
  // returns formatted uptime in hrs:mins:secs.ms eg. 65:05:01.321
  let up = process.uptime();
  const hrs = Math.floor(up / 3600);
  up -= hrs * 3600;
  const mins = Math.floor(up / 60);
  up -= mins * 60;

  return `${hrs.toString()}:${mins.toString().padStart(2, '0')}:${up.toFixed(3).padStart(6, '0')}`;
}

// ANSI colour escape characters
const ANSI_ESC = {
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
  brightBlack: '\x1B[90m',
  reset: '\x1B[0m',
} as const;

/**
 * Symbols for use in the log output
 * @returns object with string representing symbols for each type specified
 */
function _symbols() {
  const symbolsUnicode = {
    // U+2630 Trigram For Heaven
    trace: `${ANSI_ESC.brightBlack}☰${ANSI_ESC.reset}`,
    // U+25CF Black Circle
    debug: `${ANSI_ESC.cyan}●${ANSI_ESC.reset}`,
    // U+2139 Information Source
    info: `${ANSI_ESC.blue}ℹ${ANSI_ESC.reset}`,
    // U+2718 Heavy Ballot X
    success: `${ANSI_ESC.green}✔${ANSI_ESC.reset}`,
    // U+26A0 Warning Sign
    warning: `${ANSI_ESC.yellow}⚠${ANSI_ESC.reset}`,
    // U+2716 Heavy Multiplication
    error: `${ANSI_ESC.red}✖${ANSI_ESC.reset}`,
  };

  // Fallback only uses characters from Code page 437
  const symbolsFallback = {
    // U+2261 Identical To
    trace: `${ANSI_ESC.brightBlack}≡${ANSI_ESC.reset}`,
    // U+2022 Bullet
    debug: `${ANSI_ESC.cyan}•${ANSI_ESC.reset}`,
    // U+0069 Latin Small Letter i
    info: `${ANSI_ESC.blue}i${ANSI_ESC.reset}`,
    // U+221A Square Root
    success: `${ANSI_ESC.green}√${ANSI_ESC.reset}`,
    // U+203C Double Exclamation Mark
    warning: `${ANSI_ESC.yellow}‼${ANSI_ESC.reset}`,
    // U+0078 Latin Small Letter x
    error: `${ANSI_ESC.red}x${ANSI_ESC.reset}`,
  };

  return isUnicodeSupported() ? symbolsUnicode : symbolsFallback;
}
