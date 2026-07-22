import { loadData, saveData } from './file-io';

export interface ModelConfig {
    id: string;
    name: string;
    api_type: string;
    api_key: string;
    api_url: string;
    api_model: string;
}

export interface ModelConfigs {
    configs: ModelConfig[];
    selected_id: string;
}

const MODEL_CONFIG_PATH = 'config/model.yaml';

export async function loadModelConfigs(): Promise<ModelConfigs> {
    const data = await loadData<ModelConfigs>(MODEL_CONFIG_PATH);
    return data || { configs: [], selected_id: '' };
}

export async function saveModelConfigs(data: ModelConfigs): Promise<void> {
    await saveData(MODEL_CONFIG_PATH, data);
