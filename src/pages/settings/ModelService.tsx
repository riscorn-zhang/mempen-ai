import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Key, Globe, Bot, Save, RotateCcw } from 'lucide-react';

export default function ModelService() {
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('https://dashscope.aliyuncs.com/compatible-mode/v1');
    const [model, setModel] = useState('qwen-vl-max');

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h3 className="text-xl font-bold">模型服务</h3>
                <p className="text-sm text-muted-foreground">设置 AI 模型的 API 密钥、端点和模型名称</p>
            </div>

            <div className="space-y-4 w-full">
                {/* API Key */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <Key className="size-4" />
                        API 密钥
                    </label>
                    <Input
                        type="password"
                        placeholder="sk-xxxxxxxxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        阿里云百炼 API 密钥，用于调用 Qwen 模型
                    </p>
                </div>

                {/* Base URL */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <Globe className="size-4" />
                        API 端点
                    </label>
                    <Input
                        placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        默认使用阿里云百炼国际版端点
                    </p>
                </div>

                {/* Model */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <Bot className="size-4" />
                        模型名称
                    </label>
                    <Input
                        placeholder="qwen-vl-max"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        支持 qwen-vl-max、qwen-plus、qwen-max 等
                    </p>
                </div>

                <Separator />

                {/* 操作按钮 */}
                <div className="flex gap-2">
                    <Button className="gap-2">
                        <Save className="size-4" />
                        保存配置
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <RotateCcw className="size-4" />
                        重置默认
                    </Button>
                </div>
            </div>
        </div>
    );
}
