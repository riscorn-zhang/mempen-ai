import { useJSON } from "@/app/json";
import type { ZodType, ZodObject } from "zod";
import { z } from "zod";

import { configSchema } from "./types";
import defaults from "./default";

type ConfigTypes = z.infer<typeof configSchema>;

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

function getSchema<
    P extends ConfigPath<ConfigTypes>
>(path: P): ZodType<ConfigValue<ConfigTypes, P>> {
    let schema: ZodObject<any> = configSchema as unknown as ZodObject<any>;

    for (const key of path) {
        schema = (schema as ZodObject<any>).shape[key] as ZodObject<any>;
    }

    return schema as unknown as ZodType<ConfigValue<ConfigTypes, P>>;
}

export function useConfig<
    P extends ConfigPath<ConfigTypes>
>(path: P) {
    type Value = ConfigValue<ConfigTypes, P>;

    return useJSON<Value>(
        path.join("/"),
        getDefault(path),
        getSchema(path)
    );
}