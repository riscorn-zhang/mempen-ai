import { useState, useEffect, useCallback } from 'react';
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
 * 通用设置 hook - JSON string 和对象的中间层
 * @param name 配置文件名（对应 settings/{name}.json）
 * @param defaultValue 默认值
 * @returns [value, setValue]
 */
export function useSetting<T>(name: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [value, setValue] = useState<T>(defaultValue);
    const [loaded, setLoaded] = useState(false);

    // 初始化加载
    useEffect(() => {
        loadSettingFile<T>(name).then(data => {
            if (data !== null) {
                setValue(data);
            }
            setLoaded(true);
        });
    }, [name]);

    const setSetting = useCallback(async (newValue: T | ((prev: T) => T)) => {
        if (!loaded) return;

        const resolvedValue = typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(value)
            : newValue;

        setValue(resolvedValue);
        await saveSettingFile(name, resolvedValue);
    }, [name, value, loaded]);

    return [value, setSetting];
}