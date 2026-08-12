import { z } from "zod";
import { displaySettingSchema } from "@/app/config/types/settings/display"

export default {
    theme: "system"
} satisfies z.infer<typeof displaySettingSchema>;