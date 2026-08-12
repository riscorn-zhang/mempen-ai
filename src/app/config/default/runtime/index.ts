import { z } from "zod";
import { runtimeSchema } from "../../types/runtime";
import workspace from "./workspace";


export default {
    workspace
} satisfies z.infer<typeof runtimeSchema>