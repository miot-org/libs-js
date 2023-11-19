# Ortac library of useful Javascript/Typescript functions

[![Typescript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF)](https://www.typescriptlang.org/)
[![Node.js CI](https://github.com/ortac-org/libs-js/actions/workflows/linux-ci.yml/badge.svg)](https://github.com/ortac-org/libs-js/actions/workflows/linux-ci.yml)
[![Node.js CI](https://github.com/ortac-org/libs-js/actions/workflows/windows-ci.yml/badge.svg)](https://github.com/ortac-org/libs-js/actions/workflows/windows-ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/ortac-org/libs-js/badge.svg?branch=main)](https://coveralls.io/github/ortac-org/libs-js?branch=main)

## Install

```console
> npm install @ortac/libs-js
```

## Features

- Works with CommonJS and ESM
- Provides Typescript types

## Usage
ESM:
```js
import {argv, log} from '@ortac/libs-js';

log.info('Completed something');
```

CommonJS:
```js
var log = require('@ortac/libs-js').log;

log.info('Completed something');
```

## API Reference

Documentation can be found at:

- [Argv](https://ortac-org.github.io/libs-js/docs/functions/argv.html)
- [Config](https://ortac-org.github.io/libs-js/docs/variables/config.html)
- [Logger](https://ortac-org.github.io/libs-js/docs/variables/log.html)
- [Translator](https://ortac-org.github.io/libs-js/docs/classes/Translator.html)

## Contributing

Make sure your code passes testing, and create a Pull Request
```console
> npm test
```