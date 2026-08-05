import { useEffect, useRef, useCallback } from 'react';
import { useImmer } from 'use-immer';
import type { Store } from '@tauri-apps/plugin-store';
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
import { openStore } from '@/stores/settings';

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

function createConfig(name: string, patch?: Partial<ModelConfig>): ModelConfig {
    return {
        id: crypto.randomUUID(),
        name,
        apiType: 'openai',
        apiKey: '',
        apiUrl: '',
        apiModel: '',
        ...patch,
    };
}

interface State {
    configs: ModelConfig[];
    selectedId: string;
    loaded: boolean;
    renameOpen: boolean;
    renameValue: string;
    newConfigOpen: boolean;
    newConfigName: string;
    templateOpen: boolean;
    templateName: string;
    templateSourceId: string;
}

export default function ModelService() {
    const storeRef = useRef<Store | null>(null);
    const [s, update] = useImmer<State>({
        configs: [],
        selectedId: '',
        loaded: false,
        renameOpen: false,
        renameValue: '',
        newConfigOpen: false,
        newConfigName: '',
        templateOpen: false,
        templateName: '',
        templateSourceId: '',
    });


    useEffect(() => {
        let cancelled = false;
        openStore('model').then(async (store) => {
            if (cancelled) return;
            storeRef.current = store;
            const configs = await store.get<ModelConfig[]>('configs') ?? [];
            const selectedId = await store.get<string>('selectedId') ?? '';
            update((d) => {
                d.configs = configs;
                d.selectedId = configs.some((c) => c.id === selectedId)
                    ? selectedId
                    : (configs[0]?.id ?? '');
                d.loaded = true;
            });
        }).catch(() => {
            if (!cancelled) update((d) => { d.loaded = true; });
        });
        return () => { cancelled = true; };
    }, [update]);

    const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const persist = useCallback((cfgs: ModelConfig[], selId: string) => {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            const store = storeRef.current;
            if (!store) return;
            await store.set('configs', cfgs);
            await store.set('selectedId', selId);
            await store.save();
        }, 300);
    }, []);

    useEffect(() => {
        if (!s.loaded) return;
        persist(s.configs, s.selectedId);
    }, [s.configs, s.selectedId, s.loaded, persist]);

    const selected = s.configs.find((c) => c.id === s.selectedId);

    const addConfig = (name: string) => {
        const newCfg = createConfig(name);
        update((d) => {
            d.configs.push(newCfg);
            d.selectedId = newCfg.id;
            d.newConfigOpen = false;
        });
    };

    const addFromTemplate = (name: string, sourceId: string) => {
        const source = s.configs.find((c) => c.id === sourceId);
        if (!source) return;
        const { id: _id, ...rest } = source;
        const newCfg = createConfig(name, rest);
        update((d) => {
            d.configs.push(newCfg);
            d.selectedId = newCfg.id;
            d.templateOpen = false;
        });
    };

    const removeConfig = (id: string) => {
        update((d) => {
            d.configs = d.configs.filter((c) => c.id !== id);
            if (d.selectedId === id) d.selectedId = d.configs[0]?.id ?? '';
        });
    };

    const updateConfig = (field: keyof ModelConfig, value: string) => {
        update((d) => {
            const c = d.configs.find((x) => x.id === d.selectedId);
            if (!c) return;
            c[field] = value;
        });
    };

    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center gap-3">
                {s.configs.length > 0 ? (
                    <Select value={s.selectedId} onValueChange={(v) => update((d) => { d.selectedId = v; })}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="选择配置" />
                        </SelectTrigger>
                        <SelectContent>
                            {s.configs.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
                        update((d) => {
                            d.renameValue = selected.name;
                            d.renameOpen = true;
                        });
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
                        <DropdownMenuItem onClick={() => update((d) => {
                            d.newConfigName = `配置 ${d.configs.length + 1}`;
                            d.newConfigOpen = true;
                        })}>
                            <Plus className="size-4 mr-2" />
                            从新创建
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!selected} onClick={() => {
                            if (!selected) return;
                            update((d) => {
                                d.templateName = `配置 ${d.configs.length + 1}`;
                                d.templateSourceId = selected.id;
                                d.templateOpen = true;
                            });
                        }}>
                            <Copy className="size-4 mr-2" />
                            从模板创建
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {selected && (
                    <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => removeConfig(selected.id)}>
                        <Trash2 />
                        删除
                    </Button>
                )}
            </div>

            <Dialog open={s.renameOpen} onOpenChange={(open) => update((d) => { d.renameOpen = open; })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>重命名配置</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={s.renameValue}
                        onChange={(e) => update((d) => { d.renameValue = e.target.value; })}
                        placeholder="输入新名称"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => update((d) => { d.renameOpen = false; })}>取消</Button>
                        <Button
                            disabled={!s.renameValue.trim()}
                            onClick={() => {
                                updateConfig('name', s.renameValue.trim());
                                update((d) => { d.renameOpen = false; });
                            }}
                        >
                            确认
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={s.newConfigOpen} onOpenChange={(open) => update((d) => { d.newConfigOpen = open; })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>从新创建配置</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={s.newConfigName}
                        onChange={(e) => update((d) => { d.newConfigName = e.target.value; })}
                        placeholder="输入配置名称"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => update((d) => { d.newConfigOpen = false; })}>取消</Button>
                        <Button
                            disabled={!s.newConfigName.trim()}
                            onClick={() => addConfig(s.newConfigName.trim())}
                        >
                            创建
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={s.templateOpen} onOpenChange={(open) => update((d) => { d.templateOpen = open; })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>从模板创建配置</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5 flex flex-col gap-2">
                            <label className="text-sm font-medium">配置名称</label>
                            <Input
                                value={s.templateName}
                                onChange={(e) => update((d) => { d.templateName = e.target.value; })}
                                placeholder="输入配置名称"
                            />
                        </div>
                        <div className="space-y-1.5 flex flex-col gap-2">
                            <label className="text-sm font-medium">模板来源</label>
                            <Select value={s.templateSourceId} onValueChange={(v) => update((d) => { d.templateSourceId = v; })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {s.configs.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => update((d) => { d.templateOpen = false; })}>取消</Button>
                        <Button
                            disabled={!s.templateName.trim()}
                            onClick={() => addFromTemplate(s.templateName.trim(), s.templateSourceId)}
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
            ) : (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    还没有模型配置，点击上方「新建」开始添加
                </div>
            )}
        </div>
    );
}
