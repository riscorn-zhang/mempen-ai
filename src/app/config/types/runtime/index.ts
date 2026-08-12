import { z } from 'zod';
import { workspaceSettingSchema } from './workspace';

export const runtimeSchema = z.object({
    workspace: workspaceSettingSchema
})