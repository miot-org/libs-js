import fs from 'fs';

import {globSync, GlobOptionsWithFileTypesUnset} from 'glob';

import {log} from './index.js';

interface Phrase {
  value: string;
  trace: {value: string; source: string;}[];
}

/**
 * Dictionary for looking up individual phrases given a single locale
 */
export class Dictionary {
  private _isLogging = false;
  private readonly _log = new Set<string>([]);
  private readonly _locale: string;
  private readonly _phrases: {[key: string]: Phrase;} = {};

  /**
   * @param locale - a single locale in BCP47 format
   * @param globs - glob array of glob patterns and options representing files to load
   * @remarks The order of globs/files pass in the array is important. Files are loaded in the order
   *          found with later files overwriting the dictionary value from earlier sources
   */
  public constructor(locale: string, globs: {pattern: string | string[]; options?: GlobOptionsWithFileTypesUnset | undefined;}[]) {
    this._locale = locale;
    globs.forEach((glob) => {
      const files = globSync(glob.pattern, glob.options);
      files.forEach((file) => {
        this.loadPhrases(file);
      });
    });
  }

  /**
   * Starts logging each call to this dictionary object
   */
  public startLogging(): void {
    this._isLogging = true;
  }

  /**
   * Stops logging each call to this dictionary object
   *
   * @remarks
   * This does not empty the log - use clearLog() method
   */
  public stopLogging(): void {
    this._isLogging = false;
  }

  /**
   * Clears all entries from this dictionary's log
   */
  public clearLog() {
    this._log.clear();
  }

  /**
   * Gets the log containing a unique list of calls made to this dictionary
   * @returns array of phrases passed in for translation in the order first passed (ie no duplications)
   */
  public getLog(): string[] {
    return Array.from(this._log);
  }

  /**
   * @param phrase - the phrase to lookup in this dictionary
   * @returns translated phrase
   */
  public lookup(phrase: string) {
    if (this._isLogging) {
      this._log.add(phrase);
    }
    let str: string | undefined;
    if (typeof this._phrases[phrase] !== 'undefined') {
      str = this._phrases[phrase].value;
    }
    if (typeof str === 'undefined') {
      // phrase was not in lookup so work it out from itself
      str = basePhrase(phrase);
      // add to the cache
      this._phrases[phrase] = {value: str, trace: [{value: str, source: 'fallback'}]};
    }

    return str;
  }

  /**
   * Returns a trace explaining which source(s) have been used by the dictionary on a particular phrase
   * @param phrase - the phrase to get a trace for
   * @returns a multiline string, one line per source with each successive source overriding previous sources for the phrase
   */
  public trace(phrase: string) {
    // ensure phrase is present
    this.lookup(phrase);
    // build the trace
    let output = '';
    this._phrases[phrase].trace.forEach((source) => {
      // always return Linux style path separators ie / even if in windows
      output += `${source.value} (${source.source.replace(/\\/g, '/')})\n`;
    });
    return output;
  }

  // loads phrases from a file for our locale only
  private loadPhrases(filename: string): void {
    log.debug('loadPhrases() called with', filename);
    const obj = JSON.parse(fs.readFileSync(filename, {encoding: 'utf-8'}));
    log.debug('loadPhrases()', Object.keys(obj.locales).length, 'locales found');
    const localesList = ['*', this._locale];
    localesList.forEach((localeKey) => {
      log.debug('loadPhrases() inspecting locale', localeKey);
      this.loadPhrasesFromLocaleObj(obj.locales, localeKey, filename);
    });
  }

  // loads phrases into this dictionary from a locale object
  // takes account of parent locales
  private loadPhrasesFromLocaleObj(locales: {[key: string]: {parent?: string; phrases?: {[key: string]: string;};};}, localeKey: string, sourceName: string) {
    // check this locales has an object names localeKey
    if (typeof locales[localeKey] !== 'undefined') {
      log.debug(`loadPhrasesFromLocaleObj() localeKey: ${localeKey}, sourceName: ${sourceName}`);
      // if there's a parent reference use that first by calling this function for the parent locale
      const locale = locales[localeKey];
      if (typeof locale.parent !== 'undefined' &&
          typeof locales[locale.parent] !== 'undefined') {
        this.loadPhrasesFromLocaleObj(locales, locale.parent, sourceName);
      }
      // check we have a phrases object and if so load those phrases
      if (typeof locale.phrases !== 'undefined') {
        this.loadPhrasesFromPhrasesObj(locale.phrases, `${sourceName}:${localeKey}`);
      }
    }
  }

  // takes a phrases object from a source file and loads all the phrases into this dictionary
  // overwrites translations which have been loaded by previous calls
  private loadPhrasesFromPhrasesObj(phrases: {[key: string]: string;}, sourceName: string): void {
    log.debug('loadPhrasesFromLocaleObj()', Object.keys(phrases).length, 'phrases found');
    Object.keys(phrases).forEach((phraseKey) => {
      if (Object.prototype.hasOwnProperty.call(this._phrases, phraseKey)) {
        // already have an entry
        log.debug('loadPhrasesFromLocaleObj() updating phrase', phraseKey);
        this._phrases[phraseKey].value = phrases[phraseKey];
        this._phrases[phraseKey].trace.push({value: phrases[phraseKey], source: sourceName});
      } else {
        // create new entry
        log.debug('loadPhrasesFromLocaleObj() adding phrase', phraseKey);
        this._phrases[phraseKey] = {
          value: phrases[phraseKey],
          trace: [{value: phrases[phraseKey], source: sourceName}],
        };
      }
    });
  }
}

function basePhrase(phrase: string): string {
  // takes the phrase key starting with an `_` and returns a cleaned up phrase
  return phrase
    .replace(/^_qty|_knd|_ins|_/, '')
    .replace(/_/g, ' ');
}
