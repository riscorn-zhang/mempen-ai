import { z } from "zod";

export const displaySettingSchema = z.object({
    theme: z.enum(["light", "dark", "system"]),
});