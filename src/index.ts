import { access, constants, readFile, rm, writeFile } from 'fs/promises';
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
}
