import { z } from "zod";
import { settingsSchema } from "./settings";
import { runtimeSchema } from "./runtime";

export const configSchema = z.object({
    settings: settingsSchema,
    runtime: runtimeSchema,
});