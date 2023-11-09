/* eslint-disable no-process-env */
/**
 * Returns an object containing info about the current configuration
 * The primary purpose is to avoid accessing `process.env` directly
 */
export const config: {env: 'production' | 'development';} = {env: 'development'};

config.env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
