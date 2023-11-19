import {GlobOptionsWithFileTypesUnset} from 'glob';

import {Dictionary} from './dictionary.js';

import {log} from './index.js';

/**
 * The Translator Class provides translations of phrases used in ortac systems across multiple locales.
 * ```js
 * import {Translator} from '@ortac/libs-js';
 *
 * const translator = new Translator([{pattern: './**&#8205;/localeFiles*.json'}]);
 *
 * console.log(translator.lookup('en-US', '_metres')); // => 'meters'
 * ```
 *
 * The Translator Class uses locale files per the ortac specification, currently supporting v1.0.0. The
 * Class also provides for the ability to trace where the source of a particular translation has come from,
 * and can also log all phrases passed into the translator.
 */
export class Translator {
  private readonly _dictionaries: {[locale: string]: Dictionary;} = {};
  private readonly _globs: {pattern: string | string[]; options?: GlobOptionsWithFileTypesUnset | undefined;}[];
  private _isLogging = false;

  /**
   * @param globs - glob array of glob patterns and options representing files to load
   * @remarks The order of globs/files pass in the array is important. Files are loaded in the order
   *          found with later files overwriting the dictionary value from earlier sources
   * @example
   * ```js
   * import {Translator} from '@ortac/libs-js';
   *
   * const translator = new Translator([{pattern: './localeFiles*.json'}]);
   *
   * console.log(translator.lookup('en-US', '_metres')); // => 'meters'
   * ```
   */
  public constructor(globs: {pattern: string | string[]; options?: GlobOptionsWithFileTypesUnset | undefined;}[]) {
    this._globs = globs;
  }

  /**
   * Starts logging each call to this translator object
   */
  public startLogging(): void {
    Object.keys(this._dictionaries).forEach((locale) => {
      this._dictionaries[locale].startLogging();
    });
    this._isLogging = true;
  }

  /**
   * Stops logging each call to this translator object
   *
   * @remarks
   * This does not empty the log - use clearLog() method
   */
  public stopLogging(): void {
    Object.keys(this._dictionaries).forEach((locale) => {
      this._dictionaries[locale].stopLogging();
    });
    this._isLogging = false;
  }

  /**
   * Clears all entries from the log
   * @param locale - the locale to clear the logs for, or all locales if omitted
   */
  public clearLog(locale?: string) {
    if (typeof locale === 'undefined') {
      // we need to clear the log on all dictionaries
      Object.keys(this._dictionaries).forEach((key) => {
        this._dictionaries[key].clearLog();
      });
    } else if (typeof this._dictionaries[locale] !== 'undefined') {
      this._dictionaries[locale].clearLog();
    }
  }

  /**
   * Gets the log containing a unique list of calls made to this dictionary
   * @param locale - the locale to get the logs for, or all locales if omitted
   * @returns array of phrases passed in for translation in the order first passed (ie no duplications)
   * @remarks The returned array will always be an array of unique phrases even if the same phrase
   *          has been looked up in multiple locales
   */
  public getLog(locale?: string): string[] {
    if (typeof locale === 'undefined') {
      // we need to combine the log from all dictionaries
      const combinedLog = new Set<string>();
      Object.keys(this._dictionaries).forEach((key) => {
        this._dictionaries[key].getLog().forEach((value) => combinedLog.add(value));
      });
      return Array.from(combinedLog);
    } else if (typeof this._dictionaries[locale] === 'undefined') {
      return [];
    } else {
      return this._dictionaries[locale].getLog();
    }
  }

  /**
   * @param locale - BCP47 format
   * @param phrase - the phrase to lookup in this translator
   * @returns translated phrase
   */
  public lookup(locale: string, phrase: string) {
    if (typeof this._dictionaries[locale] === 'undefined') {
      this._addNewDictionary(locale);
    }
    return this._dictionaries[locale].lookup(phrase);
  }

  /**
   * Returns a trace explaining which source(s) have been used by the translator on a particular phrase
   * @param locale - BCP47 format
   * @param phrase - the phrase to get a trace for
   * @returns a multiline string, one line per source with each successive source overriding previous sources for the phrase
   */
  public trace(locale: string, phrase: string) {
    if (typeof this._dictionaries[locale] === 'undefined') {
      this._addNewDictionary(locale);
    }
    return this._dictionaries[locale].trace(phrase);
  }

  /**
   * Clears the cache for the specified locale
   * @param locale - BCP47 format
   */
  public dropLocale(locale: string) {
    delete this._dictionaries[locale];
  }

  private _addNewDictionary(locale: string) {
    log.debug('Translator: adding new dictionary for', locale);
    this._dictionaries[locale] = new Dictionary(locale, this._globs);
    if (this._isLogging) {
      this._dictionaries[locale].startLogging();
    } else {
      this._dictionaries[locale].stopLogging();
    }
  }
}
