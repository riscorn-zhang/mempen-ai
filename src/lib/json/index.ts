import { useCallback, useEffect, useState } from "react";
import { produce } from "immer";
import {
    readTextFile,
    writeTextFile,
    exists,
    ensureDir,
    BaseDirectory
} from "@/lib/fs";
import { dirname } from "@/lib/path";

type Entry<T> = {
    value: T;
    loaded: boolean;
    listeners: Set<() => void>;
    saveTimer?: ReturnType<typeof setTimeout>;
};

const CACHE = new Map<string, Entry<unknown>>();

async function loadJSON<T>(path: string): Promise<T | null> {
    const filePath = `${path}.json`;

    try {
        if (
            !(await exists(filePath, {
                baseDir: BaseDirectory.AppData
            }))
        ) {
            return null;
        }

        const text = await readTextFile(filePath, {
            baseDir: BaseDirectory.AppData
        });

        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}

async function saveJSON<T>(path: string, value: T) {
    const filePath = `${path}.json`;
    const dir = await dirname(filePath);

    if (dir) {
        await ensureDir(dir, BaseDirectory.AppData);
    }

    await writeTextFile(
        filePath,
        JSON.stringify(value, null, 2),
        {
            baseDir: BaseDirectory.AppData
        }
    );
}

export function useJSON<T>(
    path: string,
    defaultValue: T
) {
    const [, refresh] = useState(0);

    if (!CACHE.has(path)) {
        CACHE.set(path, {
            value: defaultValue,
            loaded: false,
            listeners: new Set()
        });
    }

    const entry = CACHE.get(path) as Entry<T>;

    useEffect(() => {
        const listener = () => {
            refresh(v => v + 1);
        };

        entry.listeners.add(listener);

        if (!entry.loaded) {
            entry.loaded = true;

            loadJSON<T>(path).then(data => {
                if (data !== null) {
                    entry.value = data;
                    entry.listeners.forEach(listener => listener());
                }
            });
        }

        return () => {
            entry.listeners.delete(listener);
        };
    }, [path, entry]);

    const update = useCallback(
        (
            updater: T | ((draft: T) => void)
        ) => {
            entry.value =
                typeof updater === "function"
                    ? produce(
                        entry.value,
                        updater as (draft: T) => void
                    )
                    : updater;

            entry.listeners.forEach(listener => listener());

            if (entry.saveTimer) {
                clearTimeout(entry.saveTimer);
            }

            entry.saveTimer = setTimeout(() => {
                void saveJSON(path, entry.value);
            }, 300);
        },
        [path, entry]
    );

    return [entry.value, update] as const;
}