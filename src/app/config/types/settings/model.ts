import { z } from "zod";

export const modelConfigSchema = z.object({
    name: z.string(),
    apiType: z.string(),
    apiKey: z.string(),
    apiUrl: z.string(),
    apiModel: z.string(),
});

export const modelSettingsSchema = z.object({
    configs: z.array(modelConfigSchema),
    selectedName: z.string(),
});