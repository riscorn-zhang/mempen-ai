import { z } from "zod";
import { configSchema } from "../types"
import settings from "./settings"
import runtime from "./runtime";


export default {
    settings,
    runtime
} satisfies z.infer<typeof configSchema>;