import { z } from "zod";
import { displaySettingSchema } from "./display";
import { generalSettingSchema } from "./general";
import { modelSettingsSchema } from "./model";

export const settingsSchema = z.object({
    display: displaySettingSchema,
    general: generalSettingSchema,
    model: modelSettingsSchema,
});