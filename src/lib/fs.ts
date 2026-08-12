import {
    writeTextFile as rawWriteTextFile,
    readTextFile,
    exists,
    mkdir,
    BaseDirectory,
    watch,
    readDir
} from '@tauri-apps/plugin-fs';
import { dirname } from '@tauri-apps/api/path';

async function writeTextFile(
    path: string,
    contents: string,
    options?: { baseDir?: BaseDirectory },
): Promise<void> {
    const dir = await dirname(path);
    if (dir && dir !== '.') {
        try {
            await mkdir(dir, { baseDir: options?.baseDir, recursive: true });
        } catch (e) {
            if (!String(e).includes('already exists')) throw e;
        }
    }
    return rawWriteTextFile(path, contents, options);
}


async function ensureDir(dirpath: string, baseDir: BaseDirectory = BaseDirectory.AppData): Promise<void> {
    try {
        await mkdir(dirpath, { baseDir, recursive: true });
    } catch (error) {
        if (!String(error).includes('already exists')) {
            throw error;
        }
    }
}

export {
    readTextFile,
    writeTextFile,
    BaseDirectory,
    exists,
    mkdir,
    ensureDir,
    watch,
    readDir
}