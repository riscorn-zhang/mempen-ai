// import { invoke } from '@tauri-apps/api/core';
import { writeTextFile, readTextFile, exists, mkdir, BaseDirectory, watch } from '@tauri-apps/plugin-fs';
/**
 * 通用文件读取接口
 * @param filepath 相对于应用数据目录的文件路径（支持 .yaml/.yml/.json）
 * @returns 解析后的 JSON 对象
 */
// async function loadData<T = unknown>(filepath: string): Promise<T> {
//     return invoke<T>('load_data', { filepath });
// }

// /**
//  * 通用文件写入接口
//  * @param filepath 相对于应用数据目录的文件路径（支持 .yaml/.yml/.json）
//  * @param data 要写入的 JSON 对象
//  */
// async function saveData<T = unknown>(filepath: string, data: T): Promise<void> {
//     return invoke<void>('save_data', { filepath, data });
// }

/**
 * 确保目录存在，不存在则创建
 * @param dirpath 目录路径
 * @param baseDir 基础目录
 */
async function ensureDir(dirpath: string, baseDir: BaseDirectory = BaseDirectory.AppData): Promise<void> {
    try {
        await mkdir(dirpath, { baseDir, recursive: true });
    } catch (error) {
        // 目录已存在会抛出错误，忽略
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
    watch
    // loadData,
    // saveData,

}

BaseDirectory.LocalData