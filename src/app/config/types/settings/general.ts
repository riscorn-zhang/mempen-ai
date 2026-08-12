import { z } from "zod";

export const generalSettingSchema = z.object({
    language: z.string(),
    autoSave: z.boolean(),
});