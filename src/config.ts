/* eslint-disable no-process-env */
/**
 * Returns an object containing info about the current configuration
 * The primary purpose is to avoid accessing `process.env` directly
 *
 * ```js
 * import {config} from '@ortac/libs-js';
 *
 * console.log(config.env); // => 'development' (or could be 'production')
 * ```
 */
export const config: {env: 'production' | 'development';} = {env: 'development'};

config.env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
