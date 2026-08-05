import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
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
    Key, Globe, Bot, Plus, Trash2, RefreshCw, Copy, Edit, EyeOffIcon
} from 'lucide-react';
import { useSetting } from '@/hooks/use-setting';

const API_TYPES = [
    { id: 'openai', label: 'OpenAI 兼容' },
    { id: 'aliyun', label: '阿里云百炼' },
    { id: 'deepseek', label: 'DeepSeek' },
    { id: 'ollama', label: 'Ollama' },
    { id: 'custom', label: '自定义' },
] as const;

interface ModelConfig {
    name: string;
    apiType: string;
    apiKey: string;
    apiUrl: string;
    apiModel: string;
}

interface ModelSettings {
    configs: ModelConfig[];
    selectedName: string;
}

const DEFAULT_MODEL_SETTINGS: ModelSettings = {
    configs: [],
    selectedName: '',
};

export default function ModelService() {
    const [s, update] = useSetting<ModelSettings>('model', DEFAULT_MODEL_SETTINGS);

    const [renameOpen, setRenameOpen] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [renameError, setRenameError] = useState('');
    const [newConfigOpen, setNewConfigOpen] = useState(false);
    const [newConfigName, setNewConfigName] = useState('');
    const [newConfigError, setNewConfigError] = useState('');
    const [templateOpen, setTemplateOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateError, setTemplateError] = useState('');
    const [templateSourceId, setTemplateSourceId] = useState('');

    const selected = s.configs.find((c) => c.name === s.selectedName);

    function createConfig(name: string, patch?: Partial<ModelConfig>): ModelConfig {
        return {
            name,
            apiType: 'openai',
            apiKey: '',
            apiUrl: '',
            apiModel: '',
            ...patch,
        };
    }

    const addConfig = (name: string) => {
        if (s.configs.some((c) => c.name === name)) {
            setNewConfigError('配置名称已存在');
            return;
        }
        const newCfg = createConfig(name);
        update((d) => {
            d.configs.push(newCfg);
            d.selectedName = newCfg.name;
        });
        setNewConfigOpen(false);
        setNewConfigError('');
    };

    const addFromTemplate = (name: string, sourceName: string) => {
        if (s.configs.some((c) => c.name === name)) {
            setTemplateError('配置名称已存在');
            return;
        }
        const source = s.configs.find((c) => c.name === sourceName);
        if (!source) return;
        const newCfg = createConfig(name, source);
        update((d) => {
            d.configs.push(newCfg);
            d.selectedName = newCfg.name;
        });
        setTemplateOpen(false);
        setTemplateError('');
    };

    const removeConfig = (name: string) => {
        update((d) => {
            d.configs = d.configs.filter((c) => c.name !== name);
            if (d.selectedName === name) d.selectedName = d.configs[0]?.name ?? '';
        });
    };

    const updateConfig = (field: keyof ModelConfig, value: string) => {
        update((d) => {
            const c = d.configs.find((x) => x.name === d.selectedName);
            if (!c) return;
            c[field] = value;
        });
    };

    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center gap-3">
                {s.configs.length > 0 ? (
                    <Select value={s.selectedName} onValueChange={(v) => update((d) => { d.selectedName = v; })}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="选择配置" />
                        </SelectTrigger>
                        <SelectContent>
                            {s.configs.map((c) => (
                                <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="flex-1 text-sm text-muted-foreground">暂无配置</div>
                )}

                <Button
                    variant="outline" size="sm" className="gap-1.5"
                    disabled={!selected}
                    onClick={() => {
                        if (!selected) return;
                        setRenameValue(selected.name);
                        setRenameOpen(true);
                    }}
                >
                    <Edit className="size-4" />
                    重命名
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Plus className="size-4" />
                            新建
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => {
                            setNewConfigName(`配置 ${s.configs.length + 1}`);
                            setNewConfigOpen(true);
                        }}>
                            <Plus className="size-4 mr-2" />
                            从新创建
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!selected} onClick={() => {
                            if (!selected) return;
                            setTemplateName(`配置 ${s.configs.length + 1}`);
                            setTemplateSourceId(selected.name);
                            setTemplateOpen(true);
                        }}>
                            <Copy className="size-4 mr-2" />
                            从模板创建
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {selected && (
                    <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => removeConfig(selected.name)}>
                        <Trash2 />
                        删除
                    </Button>
                )}
            </div>

            <Dialog open={renameOpen} onOpenChange={(open) => {
                setRenameOpen(open);
                if (!open) setRenameError('');
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>重命名配置</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        placeholder="输入新名称"
                    />
                    {renameError && <p className="text-sm text-destructive">{renameError}</p>}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)}>取消</Button>
                        <Button
                            disabled={!renameValue.trim()}
                            onClick={() => {
                                const newName = renameValue.trim();
                                if (newName !== selected?.name && s.configs.some((c) => c.name === newName)) {
                                    setRenameError('配置名称已存在');
                                    return;
                                }
                                update((d) => {
                                    const c = d.configs.find((x) => x.name === d.selectedName);
                                    if (c) {
                                        c.name = newName;
                                    }
                                    d.selectedName = newName;
                                });
                                setRenameOpen(false);
                                setRenameError('');
                            }}
                        >
                            确认
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={newConfigOpen} onOpenChange={(open) => {
                setNewConfigOpen(open);
                if (!open) setNewConfigError('');
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>从新创建配置</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newConfigName}
                        onChange={(e) => setNewConfigName(e.target.value)}
                        placeholder="输入配置名称"
                    />
                    {newConfigError && <p className="text-sm text-destructive">{newConfigError}</p>}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewConfigOpen(false)}>取消</Button>
                        <Button
                            disabled={!newConfigName.trim()}
                            onClick={() => addConfig(newConfigName.trim())}
                        >
                            创建
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={templateOpen} onOpenChange={(open) => {
                setTemplateOpen(open);
                if (!open) setTemplateError('');
            }}>
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
                                    {s.configs.map((c) => (
                                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {templateError && <p className="text-sm text-destructive">{templateError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTemplateOpen(false)}>取消</Button>
                        <Button
                            disabled={!templateName.trim()}
                            onClick={() => addFromTemplate(templateName.trim(), templateSourceId)}
                        >
                            创建
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {selected ? (
                <div className="space-y-4">
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
                        <InputGroup>
                            <InputGroupInput
                                type="password"
                                placeholder="sk-..."
                                value={selected.apiKey}
                                onChange={(e) => updateConfig('apiKey', e.target.value)}
                            />
                            <InputGroupAddon align="inline-end">
                                <EyeOffIcon />
                            </InputGroupAddon>
                        </InputGroup>
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
            ) : (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    还没有模型配置，点击上方「新建」开始添加
                </div>
            )}
        </div>
    );
}
