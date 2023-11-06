# Instructions for using this template to create a new project

## How to setup a package from this template

1. in github create a new project from this template with the `Use this template` button. NB the Coveralls git Action running from this commit will fail because the secret will not be present yet (see below) 
1. In package.json change the following to the values you need:
    - name
    - version
    - description
    - repository
    - keywords
    - author
    - license
1. Delete the package-lock.json file (a new one will be automatically created)
1. In README.md replace all references to `template-typescript-node-library`. A find replace on `x-ware-ltd/template-typescript-node-library` may be sufficient, but review each change. The badges ill start working again once all the steps below have been completed.
1. In a terminal run `> npm install` which will install all the dependencies and recreate the package-lock.json file. It will also run tests which should all pass.
1. visit [coveralls.io](https://coveralls.io/), create an account if you don't already have one, and add the project. Find the Token in coveralls.io and add it to github secrets: Settings/Secrets and variables/Actions/Repository secret (COVERALLS_REPO_TOKEN).
1. create a classic Personal Access Token in github to allow packages to be published (write:packages). Put this in the repository action secrets under `PUBLISH_PACKAGES_TOKEN`. You will now have 2 Repository secrets.
1. Write and test your code:
    - install types depending on your target eg. `> npm install @types/node --save-dev` or `> npm install @types/web --save-dev`
    - edit/replace/remove the `./src/add.ts` and `./src/subtract.ts` files with the functionality you require
    - edit `./index.ts` to export your new functionality
    - replace test files in `./tests` with your own tests
    - update README.md to reflect your functionality - remove explanation regarding the template and use the `Install` and subsequent sections as guidance for your documenting package
1. Delete `./INSTRUCTIONS.md` file (these instructions for using the template)
1. Commit, Push and Release your package (see the steps set out in the Development section below)

## What's Included in the Template

### Typescript, ECM and CommonJS

Node modules `ts-node` and `typescript` provide compilation of Typescript to Javascript. Settings within `tsconfig.json` allow for ESM style Typescript (including linting) in the `/src` and `/tests` directories.

For compilation there are `tsconfig-cjs.json` and `tsconfig-esm.json` which are used to transpile identical source to CommonJS and ESM respectively into the `/build/cjs` and `/build/esm` directories with strict type checking.

The script `tsc` produces both ESM and the CommonJS output which is run by:

```cmd
> npm run tsc
```

Typescript declaration (*.d.ts) files are produced in both cases. For any other compilation options the tsconfig files can be modified accordingly.

### Test

To run Tests including Spell check and code coverage:

```
> npm test
```

Test is facilitated by the `chai` and `mocha` node modules. Tests are written as ESM, stored in the `/tests` directory with `*.spec.ts` filenames. There are sample tests on the file `/tests/test1.spec.ts`. 

There is a `mocha` script which just runs all tests:

```cmd
> npm run mocha
```

To view the html test output by opening it in a browser window:
```
> npm run mocha:view
```

If html output of test results is not required remove `html` from the `./.c8rc` file.

### Test Coverage

Test coverage is facilitated by the `c8` node module. The `.c8rc` file contains the settings for Coverage which is set up to produce lcov, html and inline text output into the `/coverage` directory. Coverage is run with testing by:

```cmd
> npm run mocha:cov
```

In this boilerplate the tests cover `add.ts` and `index.ts`, but not `subtract.ts`, giving a partial Coverage output.

### Coveralls.io

Coveralls is already set up and this provides a coverage report when commits are made to github. Coverage.io is free for public repositories. To set up Coverage on a new project created from this template:

    1 at [coveralls.io](http://coveralls.io), obtain a repo_token for your new repository and paste it into `/.coveralls.yml`
    2 in the /README.md file, change the link to the coveralls badge 

### Typescript Linting

Linting is provided by the `eslint` and `@shopify/eslint-plugin` node modules. The configuration is in the `./.eslintrc` file. To run the linter:

```
> npm run eslint
```

Some errors may be fixed with:
```
> npm run eslint:fix
```

### TSDoc

<!--- cspell:disable-next-line --->
TSDoc linting is provided by the `eslint-plugin-tsdoc` eslint plugin. The config in `./.eslintrc` is set to `warn` rather than `error`.

TSDoc will be run as put of eslint so TSDoc and Typescript linting are done together. 

### Spelling

Spell checking is provided by the `cspell` node module. The `.cspell.config.json` contains the settings for cspell.

The script to run spell check is:

```
> npm run spellcheck
```

A Visual Studio extensions recommendation for Code Spell CHecker is included which highlights spelling errors live in visual studio using the same system and configuration file.

## Development

During development it may not be desirable to meet all the linting and spelling requirements. In which case code can be just built (transpiled) using the `npm run tsc` script, and can be tested using the `npm run mocha` script, neither of which run the linter or spellcheck.

To see what will be published without actually publishing:
```
> npm publish --dry-run
```

To create a package locally:
```
> npm pack
```

Then install that in another npm package using:
```
> npm install path/to/my-package-1.0.0.tgz
```

### How to publish

1. Ensure `version` within `package.json` has been incremented
1. Check that a publish will be successful
    ```
    > npm publish --dry-run
    ```
1. Commit changes, push to github and create pull request
1. After committing to main branch in github, create a release with a name which matches the version number (ie. if version number is `1.0.0`, release name **MUST** be `v1.0.0`)
1. Check that the publish action has published the package from the release


## Visual Studio Extensions

The following recommendations are made:

- `Code Spell Checker` - see above section on Spelling
- `MyST-Markdown` - provides MyST syntax extensions for markdown in the markdown preview
<!--- cspell:disable-next-line --->
- `ryanluker.vscode-coverage-gutters` - provides live coverage info in the left gutter.
    - Command Palette `Coverage Gutters: Display Coverage` to start
    - Command Palette `Coverage Gutters: Watch` to watch for changes
<!--- cspell:disable-next-line --->

### devDependencies List

- Typescript:
    - `typescript`
    - `ts-node`
- Testing:
    - `@types/chai`
    - `@types/mocha`
    - `chai`
    - `mocha`
- Test Coverage:
    - `c8`
- Linting:
    - `eslint`
    - `@shopify/eslint-plugin` (typescript)
    - `eslint-plugin-tsdoc` (TSDoc)
- Spelling:
    - `cspell`