import { Separator } from '@/components/ui/separator';

export default function About() {
    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h3 className="text-xl font-bold">关于 MemPen AI</h3>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">版本</span>
                    <span className="text-sm font-medium">0.1.0</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">技术栈</span>
                    <span className="text-sm font-medium">Tauri + React + Vite</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">AI SDK</span>
                    <span className="text-sm font-medium">Vercel AI SDK 7.x</span>
                </div>
                <Separator />
                <div className="pt-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        MemPen AI 是一款基于 AI 的智能笔记与文档整理工具，支持 OCR 识别、
                        知识库管理、智能对话等功能。使用阿里云百炼 Qwen 模型驱动。
                    </p>
                </div>
            </div>
        </div>
    );
}
