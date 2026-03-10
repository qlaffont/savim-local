import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  access,
  constants,
  mkdir,
  readFile,
  rm,
  rmdir,
  writeFile,
} from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { Savim } from 'savim';

import { SavimLocalProvider, SavimLocalProviderConfig } from '../src';

describe('Savim Local', () => {
  beforeEach(() => {
    mock.restore();
  });

  it('should be Defined', () => {
    expect(Savim).toBeDefined();
  });

  it('should be able to define log', () => {
    expect(new Savim('debug')).toBeDefined();
  });

  it('should be able to add provider', async () => {
    const savim = new Savim();

    try {
      await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
        rootFolderPath: '/',
      });

      expect(savim).toBeDefined();
      expect(savim.providers).toBeDefined();
      expect(Object.keys(savim.providers)).toHaveLength(0);
    } catch (_error) {}

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: import.meta.dir,
    });

    expect(savim).toBeDefined();
    expect(savim.providers).toBeDefined();
    expect(Object.keys(savim.providers)).toHaveLength(1);
  });

  it('isHealthy should return false for non-existent path', async () => {
    const provider = new SavimLocalProvider({
      rootFolderPath: '/nonexistent/path/that/does/not/exist',
    });
    expect(await provider.isHealthy()).toBe(false);
  });

  it('should be able to upload file (string)', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: import.meta.dir,
    });

    const fileName = 'testupload.txt';
    const fullPath = path.join(import.meta.dir, fileName);
    const fileContent = 'test';

    await savim.uploadFile(fileName, fileContent);

    await access(fullPath, constants.F_OK);
    expect((await readFile(fullPath)).toString()).toEqual(fileContent);

    await rm(fullPath);
  });

  it('should be able to upload file (buffer)', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: import.meta.dir,
    });

    const fileName = 'testuploadbuffer.txt';
    const fullPath = path.join(import.meta.dir, fileName);
    const fileContent = 'test';

    await savim.uploadFile(fileName, Buffer.from(fileContent, 'utf8'));

    await access(fullPath, constants.F_OK);
    expect((await readFile(fullPath)).toString()).toEqual(fileContent);

    await rm(fullPath);
  });

  it('should be able to upload file (stream)', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: import.meta.dir,
    });

    const fileName = 'testuploadstream.txt';
    const fullPath = path.join(import.meta.dir, fileName);
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
      rootFolderPath: import.meta.dir,
    });

    const fileName = 'testget.txt';
    const fullPath = path.join(import.meta.dir, fileName);
    const fileContent = 'test';

    await writeFile(fullPath, fileContent);

    expect(await savim.getFile(fileName)).toEqual(fileContent);

    await rm(fullPath);
  });

  it('should be able to get file returning Buffer (coerced to string)', async () => {
    const provider = new SavimLocalProvider({ rootFolderPath: import.meta.dir });
    const fileName = 'testgetbuffer.txt';
    const fullPath = path.join(import.meta.dir, fileName);
    await writeFile(fullPath, 'hello');
    // readFile without encoding returns a Buffer — verify it's coerced to string
    const result = await provider.getFile(fileName);
    expect(typeof result).toBe('string');
    expect(result).toEqual('hello');
    await rm(fullPath);
  });

  it('should be able to delete file', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: import.meta.dir,
    });

    const fileName = 'testdelete.txt';
    const fullPath = path.join(import.meta.dir, fileName);
    const fileContent = 'test';

    await writeFile(fullPath, fileContent);

    await savim.deleteFile(fileName);

    await expect(access(fullPath, constants.F_OK)).rejects.toThrow();
  });

  it('should be able to create folder', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: import.meta.dir,
    });

    const fileName = 'foldertocreate';
    const fullPath = path.join(import.meta.dir, fileName);

    await savim.createFolder(fileName);

    await access(fullPath, constants.F_OK);

    await rmdir(fullPath);
  });

  it('should be able to delete folder', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: import.meta.dir,
    });

    const fileName = 'foldertodelete';
    const fullPath = path.join(import.meta.dir, fileName);

    await mkdir(fullPath);
    await savim.deleteFolder(fileName);
    await expect(access(fullPath, constants.F_OK)).rejects.toThrow();
  });

  it('should be able to list folder', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: import.meta.dir,
    });

    const fileNameFolder = 'foldertoget';
    const fullPathFolder = path.join(import.meta.dir, fileNameFolder);
    const fileNameFile = 'filenottoget.txt';
    const fullPathFile = path.join(import.meta.dir, fileNameFile);

    await mkdir(fullPathFolder);
    await writeFile(fullPathFile, 'test');

    await expect(await savim.getFolders('/')).toContain('/foldertoget');
    await expect(await savim.getFolders('/')).not.toContain(
      '/filenottoget.txt',
    );

    await rm(fullPathFile);
    await rmdir(fullPathFolder);
  });

  it('should be able to list file', async () => {
    const savim = new Savim();

    await savim.addProvider<SavimLocalProviderConfig>(SavimLocalProvider, {
      rootFolderPath: import.meta.dir,
    });

    const fileNameFolder = 'foldertonotget';
    const fullPathFolder = path.join(import.meta.dir, fileNameFolder);
    const fileNameFile = 'filetoget.txt';
    const fullPathFile = path.join(import.meta.dir, fileNameFile);

    await mkdir(fullPathFolder);
    await writeFile(fullPathFile, 'test');

    await expect(await savim.getFiles('/')).toContain('/filetoget.txt');
    await expect(await savim.getFiles('/')).not.toContain('/foldertonotget');

    await rm(fullPathFile);
    await rmdir(fullPathFolder);
  });
});
