// this provides scripts which are used solely by tests for the logger module
import {log} from '../../src/index.js';

export function callLogWarn() {
  log.warn('My Test');
}
