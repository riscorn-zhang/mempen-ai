import { z } from "zod";
import { settingsSchema } from "../../types/settings";
import display from "./display";
import model from "./model";
import general from "./general";


export default {
    display,
    model,
    general,
} satisfies z.infer<typeof settingsSchema>;