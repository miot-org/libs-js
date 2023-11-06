// Removes directories in arguments
// eg. rm-rf.js ./lib ./build

import fs from 'fs';

for (let i = 2; i < process.argv.length; i++) {
  try {
    fs.rmSync(process.argv[i], {recursive: true});
  } catch (err) {
    // check for no such file or directory
    if (err.errno !== -4058 && err.errno !== -2) {
      throw err;
    }
  }
}

