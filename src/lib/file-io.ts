import { invoke } from '@tauri-apps/api/core';

/**
 * 通用文件读取接口
 * @param filepath 相对于应用数据目录的文件路径（支持 .yaml/.yml/.json）
 * @returns 解析后的 JSON 对象
 */
export async function loadData<T = unknown>(filepath: string): Promise<T> {
    return invoke<T>('load_data', { filepath });
}

/**
 * 通用文件写入接口
 * @param filepath 相对于应用数据目录的文件路径（支持 .yaml/.yml/.json）
 * @param data 要写入的 JSON 对象
 */
export async function saveData<T = unknown>(filepath: string, data: T): Promise<void> {
