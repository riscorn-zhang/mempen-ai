import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Key, Globe, Bot, Plus, Trash2, RefreshCw, Copy, Edit,
} from 'lucide-react';
import { loadModelConfigs, saveModelConfigs, type ModelConfig as PersistedConfig } from '@/lib/model-config';

const API_TYPES = [
    { id: 'openai', label: 'OpenAI 兼容' },
    { id: 'aliyun', label: '阿里云百炼' },
    { id: 'deepseek', label: 'DeepSeek' },
    { id: 'ollama', label: 'Ollama' },
    { id: 'custom', label: '自定义' },
] as const;

interface ModelConfig {
    id: string;
    name: string;
    apiType: string;
    apiKey: string;
    apiUrl: string;
    apiModel: string;
}

const DEFAULTS: Record<string, { url: string; model: string }> = {
    openai: { url: 'https://api.openai.com/v1', model: 'gpt-4o' },
    aliyun: { url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
    deepseek: { url: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
    ollama: { url: 'http://localhost:11434/v1', model: 'llama3' },
    custom: { url: '', model: '' },
};

const DEFAULT_CONFIG: ModelConfig = {
    id: '1', name: '默认配置', apiType: 'openai', apiKey: '',
    apiUrl: DEFAULTS.openai.url, apiModel: DEFAULTS.openai.model,
};

// ponytail: bidirectional mapping between frontend camelCase and Rust snake_case
function toLocal(p: PersistedConfig): ModelConfig {
    return { id: p.id, name: p.name, apiType: p.api_type, apiKey: p.api_key, apiUrl: p.api_url, apiModel: p.api_model };
}
function toPersisted(c: ModelConfig): PersistedConfig {
    return { id: c.id, name: c.name, api_type: c.apiType, api_key: c.apiKey, api_url: c.apiUrl, api_model: c.apiModel };
}

let nextId = 1;

export default function ModelService() {
    const [configs, setConfigs] = useState<ModelConfig[]>([DEFAULT_CONFIG]);
    const [selectedId, setSelectedId] = useState('1');
    const [loaded, setLoaded] = useState(false);

    // 对话框状态
    const [renameOpen, setRenameOpen] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [newConfigOpen, setNewConfigOpen] = useState(false);
    const [newConfigName, setNewConfigName] = useState('');
    const [templateOpen, setTemplateOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateSourceId, setTemplateSourceId] = useState('');

    // 启动时从 yaml 加载
    useEffect(() => {
        loadModelConfigs().then((data) => {
            if (data.configs.length > 0) {
                const local = data.configs.map(toLocal);
                setConfigs(local);
                setSelectedId(data.selected_id && local.some(c => c.id === data.selected_id) ? data.selected_id : local[0].id);
                nextId = Math.max(...local.map(c => Number(c.id) || 0)) + 1;
            }
            setLoaded(true);
        }).catch(() => {
            setLoaded(true);
        });
    }, []);

    // debounce 保存到 yaml
    const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const persist = useCallback((cfgs: ModelConfig[], selId: string) => {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            saveModelConfigs({ configs: cfgs.map(toPersisted), selected_id: selId }).catch(console.error);
        }, 300);
    }, []);

    useEffect(() => {
        if (!loaded) return;
        persist(configs, selectedId);
    }, [configs, selectedId, loaded, persist]);

    const selected = configs.find((c) => c.id === selectedId)!;

    const addConfig = (name: string) => {
        const id = String(nextId++);
        const newCfg: ModelConfig = { id, name, apiType: 'openai', apiKey: '', apiUrl: DEFAULTS.openai.url, apiModel: DEFAULTS.openai.model };
        setConfigs((prev) => [...prev, newCfg]);
        setSelectedId(id);
    };

    const addFromTemplate = (name: string, sourceId: string) => {
        const source = configs.find((c) => c.id === sourceId);
        if (!source) return;
        const id = String(nextId++);
        const newCfg: ModelConfig = { ...source, id, name };
        setConfigs((prev) => [...prev, newCfg]);
        setSelectedId(id);
    };

    const removeConfig = (id: string) => {
        setConfigs((prev) => {
            const next = prev.filter((c) => c.id !== id);
            if (selectedId === id && next.length > 0) setSelectedId(next[0].id);
            return next;
        });
    };

    const updateConfig = (field: keyof ModelConfig, value: string) => {
        setConfigs((prev) =>
            prev.map((c) => {
                if (c.id !== selectedId) return c;
                const updated = { ...c, [field]: value };
                if (field === 'apiType' && DEFAULTS[value]) {
                    updated.apiUrl = DEFAULTS[value].url;
                    updated.apiModel = DEFAULTS[value].model;
                }
                return updated;
            })
        );
    };

    if (!selected) return null;

    return (
        <div className="space-y-6 w-full">
            {/* 顶部：配置选择 */}
            <div className="flex items-center gap-3">
                <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger className="flex-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {configs.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 重命名 */}
                <Button
                    variant="outline" size="sm" className="gap-1.5"
                    onClick={() => { setRenameValue(selected.name); setRenameOpen(true); }}
                >
                    <Edit className="size-4" />
                    重命名
                </Button>

                {/* 新建下拉 */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Plus className="size-4" />
                            新建
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => { setNewConfigName(`配置 ${nextId}`); setNewConfigOpen(true); }}>
                            <Plus className="size-4 mr-2" />
                            从新创建
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setTemplateName(`配置 ${nextId}`); setTemplateSourceId(selectedId); setTemplateOpen(true); }}>
                            <Copy className="size-4 mr-2" />
                            从模板创建
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {configs.length > 1 && (
                    <Button variant="ghost" size="sm" className="text-destructive gap-1.5" onClick={() => removeConfig(selectedId)}>
                        <Trash2 className="size-4" />
                        删除
                    </Button>
                )}
            </div>

            {/* 重命名对话框 */}
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>重命名配置</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        placeholder="输入新名称"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)}>取消</Button>
                        <Button
                            disabled={!renameValue.trim()}
                            onClick={() => { updateConfig('name', renameValue.trim()); setRenameOpen(false); }}
                        >
                            确认
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 从新创建对话框 */}
            <Dialog open={newConfigOpen} onOpenChange={setNewConfigOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>从新创建配置</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newConfigName}
                        onChange={(e) => setNewConfigName(e.target.value)}
                        placeholder="输入配置名称"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewConfigOpen(false)}>取消</Button>
                        <Button
                            disabled={!newConfigName.trim()}
                            onClick={() => { addConfig(newConfigName.trim()); setNewConfigOpen(false); }}
                        >
                            创建
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 从模板创建对话框 */}
            <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>从模板创建配置</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5 flex flex-col gap-2">
                            <label className="text-sm font-medium">配置名称</label>
                            <Input
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="输入配置名称"
                            />
                        </div>
                        <div className="space-y-1.5 flex flex-col gap-2">
                            <label className="text-sm font-medium">模板来源</label>
                            <Select value={templateSourceId} onValueChange={setTemplateSourceId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {configs.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTemplateOpen(false)}>取消</Button>
                        <Button
                            disabled={!templateName.trim()}
                            onClick={() => { addFromTemplate(templateName.trim(), templateSourceId); setTemplateOpen(false); }}
                        >
                            创建
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 下方：配置表单 */}
            <div className="space-y-4 w-full">
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium">
                        <Globe className="size-3.5" /> API 类型
                    </label>
                    <Select value={selected.apiType} onValueChange={(v) => updateConfig('apiType', v)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {API_TYPES.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium">
                        <Key className="size-3.5" /> API Key
                    </label>
                    <Input
                        type="password"
                        placeholder="sk-..."
                        value={selected.apiKey}
                        onChange={(e) => updateConfig('apiKey', e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium">
                        <Globe className="size-3.5" /> API URL
                    </label>
                    <Input
                        placeholder="https://api.example.com/v1"
                        value={selected.apiUrl}
                        onChange={(e) => updateConfig('apiUrl', e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium">
                        <Bot className="size-3.5" /> 模型
                    </label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="模型名称"
                            value={selected.apiModel}
                            onChange={(e) => updateConfig('apiModel', e.target.value)}
                            className="flex-1"
                        />
                        <Button variant="outline" size="sm" className="shrink-0">
                            <RefreshCw className="size-3.5" />
                            同步
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
