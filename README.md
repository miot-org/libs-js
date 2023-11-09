# MIoT library of useful Javascript/Typescript functions

## Install

```console
> npm install @miot-org/libs-js
```

## Features

- Works with CommonJS and ESM
- Provides Typescript types

## Usage
ESM:
```js
import {log} from '@miot-org/libs-js';

log.info('Completed something');
```

CommonJS:
```js
var log = require('@miot-org/libs-js').log;

log.info('Completed something');
```

## API Reference

### argv

The argv function extracts values passed in via the command line

If the command line is `node my-app.js --port 8080 -n -tf`

```js
import {argv} from '@miot-org/libs-js';

console.log(argv('--port')) // => '8080'
console.log(argv('-n')); // => true
console.log(argv('-g')); // => false
console.log(argv('-t')); // => false
console.log(argv('-f')); // => false
console.log(argv('-tf')); // => true
```

### config

config() provides a way to access the current configuration without using `process.env`.

```js
import {config} from '@miot-org/libs-js';

console.log(config.env); // => 'development' (or could be 'production') 
```

### Logger

Logger provides a way to annotate code to provide logging, but also allows logging to be turn off (or down) depending on requirements.

#### Using in your code:

```js
import {log} from '@miot-org/libs-js';

log.warn('file failed to download');
log.success('task completed');
const i = 5;
log.debug('i:', i);
```

Assuming your application is started with a logging level of 'warn' or 2, the following will be output from the above code:

<pre style="background-color: Night;">
  0:00:00.071 <span style="color:yellow;">⚠</span> file failed to download
</pre>

Whereas if your application is started with a logging level of 'debug' or 5:

<pre style="background-color: Night;">
  0:00:00.071 <span style="color:yellow;">⚠</span> file failed to download
  0:00:00.074 <span style="color:green;">✔</span> task completed
  0:00:00.074 <span style="color:cyan;">●</span> i: 5
</pre>

#### Initialising log level on the command line

```command
> node ./src/temp.js --loglevel 2
> node ./src/temp.js --loglevel debug
```

## Contributing

Make sure your code passes testing, and create a Pull Request
```console
> npm test
```