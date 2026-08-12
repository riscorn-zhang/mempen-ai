import { z } from "zod";
import { modelSettingsSchema } from "../../types/settings/model";

export default {
    configs: [],
    selectedName: '',
} satisfies z.infer<typeof modelSettingsSchema>;