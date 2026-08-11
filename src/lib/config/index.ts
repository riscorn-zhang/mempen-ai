import { useJSON } from "@/lib/json";

import type ConfigTypes from "./types";
import defaults from "./default";

type ConfigPath<T> =
    T extends object
    ? {
        [K in keyof T & string]:
        T[K] extends object
        ? [K] | [K, ...ConfigPath<T[K]>]
        : [K]
    }[keyof T & string]
    : never;

type ConfigValue<
    T,
    P extends readonly string[]
> =
    P extends readonly [infer K, ...infer R]
    ? K extends keyof T
    ? R extends readonly string[]
    ? R["length"] extends 0
    ? T[K]
    : ConfigValue<T[K], R>
    : never
    : never
    : never;

function getDefault<
    P extends ConfigPath<ConfigTypes>
>(path: P): ConfigValue<ConfigTypes, P> {
    let value: unknown = defaults;

    for (const key of path) {
        value = (value as Record<string, unknown>)[key];
    }

    return value as ConfigValue<ConfigTypes, P>;
}

export function useConfig<
    P extends ConfigPath<ConfigTypes>
>(path: P) {
    type Value = ConfigValue<ConfigTypes, P>;

    return useJSON<Value>(
        path.join("/"),
        getDefault(path)
    );
}