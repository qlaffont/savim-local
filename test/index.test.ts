import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { access, constants, readFile, rm, writeFile } from 'fs/promises';
import path from 'path';
const Readable = require('stream').Readable;
import { Savim } from 'savim';

import { SavimLocalProvider, SavimLocalProviderConfig } from '../src';

describe('Savim Local', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be Defined', () => {
    expect(Savim).toBeDefined();
  });

  it('should be able to define log', () => {
    expect(new Savim('debug')).toBeDefined();
  });

  it('should be able to add provider', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: '/',
    });

    expect(savim).toBeDefined();
    expect(savim.providers).toBeDefined();
    expect(Object.keys(savim.providers)).toHaveLength(0);

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: __dirname,
    });

    expect(savim).toBeDefined();
    expect(savim.providers).toBeDefined();
    expect(Object.keys(savim.providers)).toHaveLength(1);
  });

  it('should be able to upload file (string)', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: __dirname,
    });

    const fileName = 'testupload.txt';
    const fullPath = path.join(__dirname, fileName);
    const fileContent = 'test';

    await savim.uploadFile(fileName, fileContent);

    await access(fullPath, constants.F_OK);
    expect((await readFile(fullPath)).toString()).toEqual(fileContent);

    await rm(fullPath);
  });

  it('should be able to upload file (buffer)', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: __dirname,
    });

    const fileName = 'testuploadbuffer.txt';
    const fullPath = path.join(__dirname, fileName);
    const fileContent = 'test';

    await savim.uploadFile(fileName, Buffer.from(fileContent, 'utf8'));

    await access(fullPath, constants.F_OK);
    expect((await readFile(fullPath)).toString()).toEqual(fileContent);

    await rm(fullPath);
  });

  it('should be able to upload file (stream)', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: __dirname,
    });

    const fileName = 'testuploadstream.txt';
    const fullPath = path.join(__dirname, fileName);
    const fileContent = 'test';

    const s = new Readable();
    s.push(fileContent);
    s.push(null);

    await savim.uploadFile(fileName, s);

    await access(fullPath, constants.F_OK);
    expect((await readFile(fullPath)).toString()).toEqual(fileContent);

    await rm(fullPath);
  });

  it('should be able to get file', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: __dirname,
    });

    const fileName = 'testget.txt';
    const fullPath = path.join(__dirname, fileName);
    const fileContent = 'test';

    await writeFile(fullPath, fileContent);

    expect(await savim.getFile(fileName)).toEqual(fileContent);

    await rm(fullPath);
  });

  it('should be able to delete file', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: __dirname,
    });

    const fileName = 'testdelete.txt';
    const fullPath = path.join(__dirname, fileName);
    const fileContent = 'test';

    await writeFile(fullPath, fileContent);

    await savim.deleteFile(fileName);

    await expect(access(fullPath, constants.F_OK)).rejects.toThrow();
  });
});
