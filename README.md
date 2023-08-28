[![Test Coverage](https://api.codeclimate.com/v1/badges/6578843ddab3ca0a2cff/test_coverage)](https://codeclimate.com/github/qlaffont/savim-local/test_coverage) [![Maintainability](https://api.codeclimate.com/v1/badges/6578843ddab3ca0a2cff/maintainability)](https://codeclimate.com/github/qlaffont/savim-local/maintainability) ![npm](https://img.shields.io/npm/v/savim-local) ![npm](https://img.shields.io/npm/dm/savim-local) ![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/savim-local) ![NPM](https://img.shields.io/npm/l/savim-local)

# savim-local

A simple library to save file with Savim in local. Old Owner: [@flexper](https://github.com/flexper)

## Usage

```typescript
import { Savim } from 'savim';
import { SavimLocalProviderConfig, SavimLocalProvider } from 'savim-local';

const savim = new Savim();

await savim.addProvider<SavimLocalProviderConfig>(
  SavimLocalProvider,
  { rootFolderPath: __dirname },
);

await savim.uploadFile('test.txt', 'thisisatest');
```

## Tests

To execute jest tests (all errors, type integrity test)

```
pnpm test
```

## Maintain

This package use [TSdx](https://github.com/jaredpalmer/tsdx). Please check documentation to update this package.
