import * as fse from 'fs-extra';
import * as _ from 'lodash';
import * as  underscore from 'underscore';
import * as path from 'path';
import { sleep } from 'sleep';
import * as rimraf from 'rimraf';
import * as os from 'os';

import { Helpers } from './index';
import { config } from '../config';


export class HelpersFileFolders {


  isLink(filePath: string) {

    if (os.platform() === 'win32') {
      filePath = path.win32.normalize(filePath);
      // console.log('extename: ', path.extname(filePath))
      return path.extname(filePath) === '.lnk';
    } else {
      if (!fse.existsSync(filePath)) {
        Helpers.error(`File or folder "${filePath}" doesn't exist.`)
      }
      try {
        filePath = Helpers.removeSlashAtEnd(filePath);
        const command = `[[ -L "${filePath}" && -d "${filePath}" ]] && echo "symlink"`;
        // console.log(command)
        const res = Helpers.run(command, { output: false }).sync().toString()
        return res.trim() === 'symlink'
      } catch (error) {
        return false;
      }
    }
  }

  createSymLink(existedFileOrFolder: string, destinationPath: string,
    options?: { continueWhenExistedFolderDoesntExists?: boolean }) {

    const { continueWhenExistedFolderDoesntExists = false } = options || {};

    // console.log('Create link!')

    let target = existedFileOrFolder;
    let link = destinationPath;

    if (!fse.existsSync(existedFileOrFolder)) {
      if (continueWhenExistedFolderDoesntExists) {
        // just continue and create link to not existed folder
      } else {
        Helpers.error(`[helpers.createLink] target path doesn't exist: ${existedFileOrFolder}`)
      }
    }

    if (link === '.' || link === './') {
      link = process.cwd()
    }

    if (!path.isAbsolute(link)) {
      link = path.join(process.cwd(), link);
    }

    if (!path.isAbsolute(target)) {
      target = path.join(process.cwd(), target);
    }

    if (link.endsWith('/')) {
      link = path.join(link, path.basename(target))
    }

    if (!fse.existsSync(path.dirname(link))) {
      fse.mkdirpSync(path.dirname(link))
    }


    rimraf.sync(link);
    // log(`target ${target}`)
    // log(`link ${link}`)
    fse.symlinkSync(target, link)
  }

  tryCopyFrom(source, destination, options = {}) {
    // console.log(`Trying to copy from hahah: ${source} to ${destination}`)
    try {
      fse.copySync(source, destination, _.merge({
        overwrite: true,
        recursive: true
      }, options))
    } catch (e) {
      console.log(e)
      sleep(1);
      Helpers.tryCopyFrom(source, destination, options)
    }
  }
  removeFileIfExists(absoluteFilePath: string) {
    if (fse.existsSync(absoluteFilePath)) {
      fse.unlinkSync(absoluteFilePath);
    }
  }

  tryRemoveDir(dirpath: string, contentOnly = false) {
    try {
      if (contentOnly) {
        rimraf.sync(`${dirpath}/*`)
      } else {
        rimraf.sync(dirpath)
      }
    } catch (e) {
      Helpers.log(`Trying to remove directory: ${dirpath}`)
      sleep(1);
      Helpers.tryRemoveDir(dirpath, contentOnly);
    }
  }


  findChildren<T>(location, createFn: (childLocation: string) => T): T[] {

    const notAllowed: RegExp[] = [
      '\.vscode', 'node\_modules',
      ..._.values(config.folder),
      'e2e', 'tmp.*', 'dist.*', 'tests', 'module', 'browser', 'bundle*',
      'components', '\.git', 'bin', 'custom'
    ].map(s => new RegExp(s))

    const isDirectory = source => fse.lstatSync(source).isDirectory()
    const getDirectories = source =>
      fse.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

    let subdirectories = getDirectories(location)
      .filter(f => {
        const folderNam = path.basename(f);
        return (notAllowed.filter(p => p.test(folderNam)).length === 0);
      })

    return subdirectories
      .map(dir => {
        // console.log('child:', dir)
        return createFn(dir);
      })
      .filter(c => !!c)
  }


  getRecrusiveFilesFrom(dir): string[] {
    let files = [];
    const readed = fse.readdirSync(dir).map(f => {
      const fullPath = path.join(dir, f);
      // console.log(`is direcotry ${fs.lstatSync(fullPath).isDirectory()} `, fullPath)
      if (fse.lstatSync(fullPath).isDirectory()) {
        Helpers.getRecrusiveFilesFrom(fullPath).forEach(aa => files.push(aa))
      }
      return fullPath;
    })
    if (Array.isArray(readed)) {
      readed.forEach(r => files.push(r))
    }
    return files;
  }

  getLinesFromFiles(filename: string, lineCount?: number) {
    return new Promise<string[]>((resolve, reject) => {
      let stream = fse.createReadStream(filename, {
        flags: 'r',
        encoding: 'utf-8',
        fd: null,
        mode: 438, // 0666 in Octal
        // bufferSize: 64 * 1024 as any
      });

      let data = '';
      let lines = [];
      stream.on('data', function (moreData) {
        data += moreData;
        lines = data.split('\n');
        // probably that last line is "corrupt" - halfway read - why > not >=
        if (lines.length > lineCount + 1) {
          stream.destroy();
          lines = lines.slice(0, lineCount); // junk as above
          resolve(lines);
        }
      });

      stream.on('error', function () {
        reject(`Error reading ${filename}`);
      });

      stream.on('end', function () {
        resolve(lines);
      });
    })

  };


  /**
   * Get the most recent changes file in direcory
   * @param dir absoulute path to file
   */
  getMostRecentFileName(dir): string {
    let files = Helpers.getRecrusiveFilesFrom(dir);

    // use underscore for max()
    return underscore.max(files, (f) => {
      // console.log(f);
      // ctime = creation time is used
      // replace with mtime for modification time
      // console.log( `${fs.statSync(f).mtimeMs} for ${f}`   )
      return fse.statSync(f).mtimeMs;

    });
  }

  getMostRecentFilesNames(dir): string[] {

    const allFiles = Helpers.getRecrusiveFilesFrom(dir);
    const mrf = Helpers.getMostRecentFileName(dir);
    const mfrMtime = fse.lstatSync(mrf).mtimeMs;

    return allFiles.filter(f => {
      const info = fse.lstatSync(f);
      return (info.mtimeMs === mfrMtime && !info.isDirectory())
    })
  }


  copyFile(sourcePath: string, destinationPath: string,
    options?: {
      transformTextFn?: (input: string) => string;
      debugMode?: boolean;
      fast?: boolean;
      dontCopySameContent?: boolean;
    }): boolean {

    if (_.isUndefined(options)) {
      options = {} as any;
    }
    if (_.isUndefined(options.debugMode)) {
      options.debugMode = false;
    }
    if (_.isUndefined(options.debugMode)) {
      options.fast = true;
    }
    if (_.isUndefined(options.dontCopySameContent)) {
      options.dontCopySameContent = true;
    }
    const { debugMode, fast, transformTextFn, dontCopySameContent } = options;
    if (_.isFunction(transformTextFn) && fast) {
      Helpers.error(`[copyFile] You cannot use  transformTextFn in fast mode`);
    }

    if (!fse.existsSync(sourcePath)) {
      Helpers.warn(`[copyFile] No able to find source of ${sourcePath}`);
      return false;
    }
    if (fse.lstatSync(sourcePath).isDirectory()) {
      Helpers.warn(`[copyFile] Trying to copy directory as file: ${sourcePath}`, false)
      return false;
    }

    if (sourcePath === destinationPath) {
      Helpers.warn(`[copyFile] Trying to copy same file ${sourcePath}`);
      return false;
    }
    const destDirPath = path.dirname(destinationPath);
    debugMode && Helpers.log(`destDirPath: ${destDirPath}`);
    if (!fse.existsSync(destDirPath)) {
      fse.mkdirpSync(destDirPath);
    }

    if (dontCopySameContent && fse.existsSync(destinationPath)) {
      const destinationContent = fse.readFileSync(destinationPath, { encoding: 'utf8' }).toString();
      const sourceContent = fse.readFileSync(sourcePath, { encoding: 'utf8' }).toString();
      if (destinationContent === sourceContent) {
        Helpers.log(`Destination has the same content as source: ${path.basename(sourcePath)}`);
        return false;
      }
    }

    debugMode && Helpers.log(`path.extname(sourcePath) ${path.extname(sourcePath)}`);
    debugMode && Helpers.log(`config.fileExtensionsText ${config.fileExtensionsText}`);

    if (fast || !config.fileExtensionsText.includes(path.extname(sourcePath))) {
      fse.copyFileSync(sourcePath, destinationPath);
    } else {
      let sourceData = fse.readFileSync(sourcePath, { encoding: 'utf8' }).toString();
      if (_.isFunction(transformTextFn)) {
        sourceData = transformTextFn(sourceData);
      }

      debugMode && Helpers.log(`
        Write to: ${destinationPath} file:
        ============================================================================================
        ${sourceData}
        ============================================================================================
        `);

      fse.writeFileSync(destinationPath, sourceData, 'utf8');
    }

  }

}