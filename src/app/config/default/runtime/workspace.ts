import { z } from "zod";
import { workspaceSettingSchema } from "../../types/runtime/workspace";

export default {
    workspace: ''
} satisfies z.infer<typeof workspaceSettingSchema>;