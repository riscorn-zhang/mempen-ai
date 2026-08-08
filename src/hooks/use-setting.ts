import { useCallback, useEffect, useRef, useState } from 'react';
import { produce } from 'immer';
import { readTextFile, writeTextFile, exists, ensureDir, BaseDirectory } from '@/lib/fs';

const SETTINGS_DIR = 'settings';

type Entry<T> = {
    value: T
    loaded: boolean
    listeners: Set<(v: T) => void>
    saveTimer?: ReturnType<typeof setTimeout>
}

const SETTINGS_CACHE = new Map<string, Entry<any>>()

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
    const [, forceState] = useState(0)
    const mountedRef = useRef(false)

    // ensure cache entry
    if (!SETTINGS_CACHE.has(name)) {
        SETTINGS_CACHE.set(name, {
            value: defaultValue,
            loaded: false,
            listeners: new Set(),
            saveTimer: undefined
        })
    }

    const entry = SETTINGS_CACHE.get(name) as Entry<T>

    // local getter
    const getValue = useCallback(() => entry.value as T, [entry])

    // subscribe on mount
    useEffect(() => {
        mountedRef.current = true

        const listener = () => {
            // trigger re-render
            if (mountedRef.current) forceState((s) => s + 1)
        }

        entry.listeners.add(listener)

        // load from file once
        if (!entry.loaded) {
            loadSettingFile<T>(name).then((data) => {
                if (data !== null && typeof data === typeof defaultValue) {
                    entry.value = data
                }
                entry.loaded = true
                // notify subscribers
                entry.listeners.forEach((l) => l(entry.value))
                // no immediate save here
            })
        }

        return () => {
            mountedRef.current = false
            entry.listeners.delete(listener)
        }
    }, [name])

    const update = useCallback((updater: ((draft: T) => void) | T) => {
        const next = typeof updater === 'function' ? produce(entry.value as T, updater as (d: T) => void) : updater

        entry.value = next

        // notify listeners (including this hook)
        entry.listeners.forEach((l) => l(entry.value))

        // debounce save per key
        if (entry.saveTimer) clearTimeout(entry.saveTimer)
        entry.saveTimer = setTimeout(() => {
            saveSettingFile(name, entry.value)
        }, 300)
    }, [name, entry])

    // return current value and updater
    return [getValue(), update] as const
}