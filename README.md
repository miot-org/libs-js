# Template ESM Typescript library

A template used for projects which produce both CommonJS and ESM packages from a common Typescript ESM codebase.

Includes testing, coverage, coveralls.io, linting, TSDoc and auto creation of a package on creating a github release.

If you are creating a new project from this template, instructions are [here](./INSTRUCTIONS.md).

[![Typescript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF)](https://www.typescriptlang.org/)
[![Node.js CI](https://github.com/x-ware-ltd/template-typescript-node-library/actions/workflows/linux-ci.yml/badge.svg)](https://github.com/x-ware-ltd/template-typescript-node-library/actions/workflows/linux-ci.yml)
[![Node.js CI](https://github.com/x-ware-ltd/template-typescript-node-library/actions/workflows/windows-ci.yml/badge.svg)](https://github.com/x-ware-ltd/template-typescript-node-library/actions/workflows/windows-ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/x-ware-ltd/template-typescript-node-library/badge.svg?branch=main)](https://coveralls.io/github/x-ware-ltd/template-typescript-node-library?branch=main)

## Install

This is a github hosted package so you need to add an entry to your `.npmrc` file so the package manager knows where to download the package from:
        
```ini
@x-ware-ltd:registry=https://npm.pkg.github.com
```
Then:

```console
> npm install @x-ware-ltd/template-typescript-node-library
```

If the package is `private` you need to authenticate to github by getting a Personal Access Token from github with `read:packages` permissions. Either login for the session, which will request your github username, and password (use your Personal Access Token):
```console
> npm login --scope=@x-ware-ltd --registry=https://npm.pkg.github.com
```

Or, create a personal `.npmrc` file in your home directory:
```ini
//npm.pkg.github.com/:_authToken=aaa_abcDeFghIjklMNopqRSTuvWXYz
```

If you are running CI/CD on your package you will need to provide credentials for the server. Save a Personal Access Token in your Github secrets and in your github actions:
```
- name: Authenticate private github packages
  run: echo "//npm.pkg.github.com/:_authToken=${{ secrets.PACKAGE_READ_TOKEN }}" > ~/.npmrc
```

## Features

- Works with CommonJS and ESM
- Provides Typescript types

## Usage
ESM:
```js
import {add} from '@x-ware-ltd/template-typescript-node-library';

console.log(add(3, 5)); // 8
```

CommonJS:
```js
var lib = require('@x-ware-ltd/template-typescript-node-library');

console.log(lib.add(3, -1)); // 2
```

## API Reference

Documentation for `add` and `subtract` methods can be found in TSDoc for each

## Contributing

Make sure your code passes testing, and create a Pull Request
```console
> npm test
```