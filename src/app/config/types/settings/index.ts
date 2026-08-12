import type DisplaySetting from "./display";
import type GeneralSetting from "./general";
import type ModelSettings from "./model";

export default interface Settings {
    display: DisplaySetting;
    model: ModelSettings;
    general: GeneralSetting;
}