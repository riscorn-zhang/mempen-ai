export default interface ModelSettings {
    configs: ModelConfig[];
    selectedName: string;
}

export interface ModelConfig {
    name: string;
    apiType: string;
    apiKey: string;
    apiUrl: string;
    apiModel: string;
}