// lib/settings/index.ts

import { useCallback, useEffect, useState } from "react";
import { produce } from "immer";
import { readTextFile, writeTextFile, exists, ensureDir, BaseDirectory } from "@/lib/fs";

import type Settings from "@/lib/settings/types"
import defaultValues from "@/lib/settings/default"

const SETTINGS_DIR = "settings";

type Entry<T> = {
    value: T;
    loaded: boolean;
    listeners: Set<() => void>;
    saveTimer?: ReturnType<typeof setTimeout>;
};

const CACHE = new Map<string, Entry<any>>();

async function loadFile<T>(name: string): Promise<T | null> {
    const path = `${SETTINGS_DIR}/${name}.json`;

    try {
        if (!(await exists(path, { baseDir: BaseDirectory.AppData }))) {
            return null;
        }

        const text = await readTextFile(path, {
            baseDir: BaseDirectory.AppData
        });

        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function saveFile<T>(name: string, value: T) {
    await ensureDir(SETTINGS_DIR, BaseDirectory.AppData);

    await writeTextFile(
        `${SETTINGS_DIR}/${name}.json`,
        JSON.stringify(value, null, 2),
        {
            baseDir: BaseDirectory.AppData
        }
    );
}

export function useSetting<K extends keyof Settings>(
    name: K
) {
    const [, refresh] = useState(0);

    if (!CACHE.has(name)) {
        CACHE.set(name, {
            value: defaultValues[name],
            loaded: false,
            listeners: new Set()
        });
    }

    const entry = CACHE.get(name) as Entry<Settings[K]>;

    useEffect(() => {
        const listener = () => refresh(v => v + 1);
        entry.listeners.add(listener);

        if (!entry.loaded) {
            entry.loaded = true;

            loadFile<Settings[K]>(name).then(data => {
                if (data !== null) {
                    entry.value = data;
                    entry.listeners.forEach(l => l());
                }
            });
        }

        return () => {
            entry.listeners.delete(listener);
        };
    }, [name]);

    const update = useCallback(
        (updater: Settings[K] | ((draft: Settings[K]) => void)) => {
            entry.value =
                typeof updater === "function"
                    ? produce(entry.value, updater as any)
                    : updater;

            entry.listeners.forEach(l => l());

            if (entry.saveTimer) {
                clearTimeout(entry.saveTimer);
            }

            entry.saveTimer = setTimeout(() => {
                saveFile(name, entry.value);
            }, 300);
        },
        [name]
    );

    return [entry.value, update] as const;
}