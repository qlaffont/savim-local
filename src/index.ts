import { MakeDirectoryOptions, ObjectEncodingOptions, RmDirOptions } from 'fs';
import {
  access,
  constants,
  lstat,
  mkdir,
  readdir,
  readFile,
  rm,
  rmdir,
  writeFile,
} from 'fs/promises';
import { join } from 'path';
import { SavimProviderInterface } from 'savim';
import { Stream } from 'stream';

type FileSystemFlag =
  | 'a'
  | 'ax'
  | 'a+'
  | 'ax+'
  | 'as'
  | 'as+'
  | 'r'
  | 'r+'
  | 'rs+'
  | 'w'
  | 'wx'
  | 'w+'
  | 'wx+';

// https://nodejs.org/api/fs.html#fspromisesreadfilepath-options
export interface SavimLocalGetFileParam {
  flag?: FileSystemFlag;
  encoding?: BufferEncoding;
}
// https://nodejs.org/api/fs.html#fspromiseswritefilefile-data-options
export interface SavimLocalUploadFileParam {
  flag?: FileSystemFlag;
  mode?: string;
  encoding?: BufferEncoding;
}
// https://nodejs.org/api/fs.html#fspromisesrmpath-options
export interface SavimLocalDeleteFileParam {
  force?: boolean;
  maxRetries?: number;
  recursive?: boolean;
  retryDelay?: number;
}

export interface SavimLocalProviderConfig {
  rootFolderPath: string;
}

export type SavimLocalCreateFolderParam = MakeDirectoryOptions;
export type SavimLocalDeleteFolderParam = RmDirOptions;
export type SavimLocalGetFoldersParam =
  | (ObjectEncodingOptions & {
      withFileTypes?: false | undefined;
    })
  | BufferEncoding
  | null;

export type SavimLocalGetFilesParam =
  | ObjectEncodingOptions
  | BufferEncoding
  | null;

export class SavimLocalProvider implements SavimProviderInterface {
  name = 'local';

  constructor(public config: SavimLocalProviderConfig) {}

  async isHealthy() {
    try {
      await access(
        this.config.rootFolderPath,
        constants.R_OK | constants.W_OK | constants.F_OK,
      );
      return true;
    } catch {
      return false;
    }
  }

  async getFile(filenameWithPath: string, params?: SavimLocalGetFileParam) {
    let data = await readFile(
      join(this.config.rootFolderPath, filenameWithPath),
      {
        ...params,
      },
    );

    if (Buffer.isBuffer(data)) {
      data = data.toString();
    }

    return data;
  }

  async uploadFile(
    filenameWithPath: string,
    content: string | Buffer | Stream,
    params?: SavimLocalUploadFileParam,
  ) {
    return writeFile(
      join(this.config.rootFolderPath, filenameWithPath),
      content,
      {
        ...params,
      },
    );
  }

  async deleteFile(
    filenameWithPath: string,
    params?: SavimLocalDeleteFileParam,
  ) {
    return rm(join(this.config.rootFolderPath, filenameWithPath), params);
  }

  async createFolder(path: string, params: SavimLocalCreateFolderParam) {
    return mkdir(join(this.config.rootFolderPath, path), params);
  }

  async deleteFolder(
    path: string,
    params: SavimLocalDeleteFolderParam,
  ): Promise<void> {
    return rmdir(join(this.config.rootFolderPath, path), params);
  }

  private async checkIfPathIsFolder(path: string) {
    return (await lstat(path)).isDirectory();
  }

  async getFolders(
    path: string,
    params: SavimLocalGetFoldersParam,
  ): Promise<string[]> {
    const list = await readdir(join(this.config.rootFolderPath, path), params);

    return (
      await Promise.all(
        list.map(async (itemPath) =>
          (await this.checkIfPathIsFolder(
            join(this.config.rootFolderPath, itemPath),
          ))
            ? join(path, itemPath)
            : undefined,
        ),
      )
    ).filter((p) => p !== undefined) as string[];
  }

  async getFiles(
    path: string,
    params: SavimLocalGetFoldersParam,
  ): Promise<string[]> {
    const list = await readdir(join(this.config.rootFolderPath, path), params);

    return (
      await Promise.all(
        list.map(async (itemPath) =>
          (await this.checkIfPathIsFolder(
            join(this.config.rootFolderPath, itemPath),
          ))
            ? undefined
            : join(path, itemPath),
        ),
      )
    ).filter((p) => p !== undefined) as string[];
  }
}
