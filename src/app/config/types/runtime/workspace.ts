import { z } from "zod";

export const workspaceSettingSchema = z.object({
    workspace: z.string(),
});