// creates 2 build specific package.json files so that both commonjs and esm are supported

import fs from 'fs';

fs.writeFileSync('lib/cjs/package.json', '{"type": "commonjs"}');
fs.writeFileSync('lib/esm/package.json', '{"type": "module"}');
