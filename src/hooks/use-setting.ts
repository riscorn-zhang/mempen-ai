import { useEffect, useRef } from 'react';
import { useImmer } from 'use-immer';
import { readTextFile, writeTextFile, exists, ensureDir, BaseDirectory } from '@/lib/fs';

const SETTINGS_DIR = 'settings';

/** 读取单个设置文件 */
async function loadSettingFile<T>(name: string): Promise<T | null> {
    const filepath = `${SETTINGS_DIR}/${name}.json`;
    try {
        if (!(await exists(filepath, { baseDir: BaseDirectory.AppData }))) {
            return null;
        }
        const content = await readTextFile(filepath, { baseDir: BaseDirectory.AppData });
        return JSON.parse(content);
    } catch {
        return null;
    }
}

/** 保存单个设置文件 */
async function saveSettingFile<T>(name: string, data: T): Promise<void> {
    const filepath = `${SETTINGS_DIR}/${name}.json`;
    await ensureDir(SETTINGS_DIR, BaseDirectory.AppData);
    await writeTextFile(filepath, JSON.stringify(data, null, 2), {
        baseDir: BaseDirectory.AppData
    });
}

/**
 * 通用设置 hook - 直接返回 useImmer 格式
 * @param name 配置文件名（对应 settings/{name}.json）
 * @param defaultValue 默认值
 * @returns [value, update] - update 是 immer 的 updater 函数
 */
export function useSetting<T>(name: string, defaultValue: T) {
    const [value, update] = useImmer<T>(defaultValue);
    const loadedRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // 初始化加载
    useEffect(() => {
        loadSettingFile<T>(name).then(data => {
            if (data !== null && typeof data === typeof defaultValue) {
                update(data);
            }
            loadedRef.current = true;
        });
    }, [name, update]);

    // 防抖保存
    useEffect(() => {
        if (!loadedRef.current) return;

        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveSettingFile(name, value);
        }, 300);
    }, [name, value]);

    return [value, update] as const;
}