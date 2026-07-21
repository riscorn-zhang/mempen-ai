import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { ImagePlus, Loader2, Send, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { appFetch } from '@/lib/fetch';

const DEFAULT_MODEL = import.meta.env.VITE_API_MODEL ?? 'qwen/qwen3.7-plus';
const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY ?? '';
// ponytail: use tauri native fetch (no CORS)
const DEFAULT_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://openrouter.ai/api/v1').replace(/\/$/, '');

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    images?: { name: string; url: string }[];
    isStreaming?: boolean;
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

// 压缩图片到指定质量
async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            // 计算缩放比例
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            if (!ctx) {
                reject(new Error('无法创建 canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
        };

        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = URL.createObjectURL(file);
    });
}

let msgId = 0;
function nextId() {
    return `msg-${++msgId}`;
}

export default function OCRPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [apiKey] = useState(DEFAULT_API_KEY);
    const [model] = useState(DEFAULT_MODEL);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleFiles = (selectedFiles: FileList | File[]) => {
        const nextFiles = Array.from(selectedFiles).filter((file) => file.type.startsWith('image/'));
        if (nextFiles.length === 0) return;
        setFiles((prev) => [...prev, ...nextFiles]);
    };

    const removeFile = (name: string) => {
        setFiles((prev) => prev.filter((file) => file.name !== name));
    };

    const handleSend = async () => {
        if (!files.length || isGenerating) return;
        if (!apiKey.trim()) return;

        console.time('⏱️ 总耗时');
        console.time('📷 图片压缩');
        const images = await Promise.all(
            files.map(async (file) => ({
                name: file.name,
                url: await compressImage(file),
            })),
        );
        console.timeEnd('📷 图片压缩');
        console.log(`📊 图片数量: ${images.length}, 总大小: ${(images.reduce((sum, img) => sum + img.url.length, 0) / 1024).toFixed(1)} KB`);

        const userMsg: Message = {
            id: nextId(),
            role: 'user',
            content: '请识别这些图片中的文字内容，整理成 Markdown 文档。',
            images,
        };
        const aiMsg: Message = {
            id: nextId(),
            role: 'assistant',
            content: '',
            isStreaming: true,
        };

        setMessages((prev) => [...prev, userMsg, aiMsg]);
        setFiles([]);
        setIsGenerating(true);

        try {
            const prompt = [
                '你是一名专业的 OCR 与文档整理助手。',
                '请将给定的图片中的手写笔记、扫描文稿或截图内容，整理成一份清晰的 Markdown 文档。',
                '要求：',
                '- 保留标题、列表、编号、重点内容',
                '- 输出纯 Markdown 文本，不要附加解释',
                '- 如果图片包含多页内容，请合并成一份完整文档',
            ].join('\n');

            const imageParts = images.map((img) => ({
                type: 'file' as const,
                data: img.url,
                mediaType: 'image/jpeg',
            }));

            console.log(`🔧 模型: ${model || DEFAULT_MODEL}`);
            console.log(`🌐 API: ${DEFAULT_BASE_URL}`);
            console.log(`🧠 思考模式: 已关闭`);

            // 包装 fetch，强制注入 enable_thinking: false（阿里云百炼兼容接口）
            const fetchWithNoThinking: typeof appFetch = async (input, init) => {
                if (init?.body && typeof init.body === 'string') {
                    try {
                        const body = JSON.parse(init.body);
                        body.enable_thinking = false;
                        init = { ...init, body: JSON.stringify(body) };
                        console.log('✅ 已注入 enable_thinking: false');
                    } catch {
                        // ignore
                    }
                }
                return appFetch(input, init);
            };

            console.time('🔌 创建 OpenAI 客户端');
            const openai = createOpenAI({
                apiKey: apiKey.trim(),
                baseURL: DEFAULT_BASE_URL,
                fetch: fetchWithNoThinking,
            });
            console.timeEnd('🔌 创建 OpenAI 客户端');

            console.time('🚀 首 token 延迟 (TTFT)');
            let isFirstChunk = true;

            const result = streamText({
                model: openai(model || DEFAULT_MODEL),
                messages: [
                    {
                        role: 'user',
                        content: [{ type: 'text', text: prompt }, ...imageParts],
                    },
                ],
            });

            let fullText = '';
            for await (const chunk of result.textStream) {
                if (isFirstChunk) {
                    console.timeEnd('🚀 首 token 延迟 (TTFT)');
                    isFirstChunk = false;
                }
                fullText += chunk;
                setMessages((prev) =>
                    prev.map((m) => (m.id === aiMsg.id ? { ...m, content: fullText } : m)),
                );
            }

            if (!fullText) {
                throw new Error('模型没有返回内容。');
            }

            console.log(`📝 输出长度: ${fullText.length} 字符`);
            console.timeEnd('⏱️ 总耗时');

            setMessages((prev) =>
                prev.map((m) => (m.id === aiMsg.id ? { ...m, isStreaming: false } : m)),
            );
        } catch (err) {
            console.timeEnd('🚀 首 token 延迟 (TTFT)');
            console.timeEnd('⏱️ 总耗时');
            console.error(err);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === aiMsg.id
                        ? { ...m, content: err instanceof Error ? err.message : '生成失败，请检查 API 配置或网络连接。', isStreaming: false }
                        : m,
                ),
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files) {
            handleFiles(event.dataTransfer.files);
        }
    };

    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    return (
        <div className="flex h-full flex-col" onDrop={onDrop} onDragOver={onDragOver}>
            {/* 标题栏 */}
            <div className="shrink-0 space-y-2 px-1 pb-4">
                <h2 className="text-2xl font-bold">OCR / Markdown 生成</h2>
                <p className="text-sm text-muted-foreground">
                    上传图片，AI 自动识别并整理为结构化 Markdown 文档。
                </p>
            </div>

            {/* 消息列表 */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-1 pb-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Sparkles className="mb-3 size-10 opacity-30" />
                        <p className="text-sm">上传图片后发送，AI 将为你识别文字内容</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-3xl px-4 py-3 ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                                }`}
                        >
                            {/* 用户消息中的图片 */}
                            {msg.images && msg.images.length > 0 && (
                                <div className="mb-2 grid gap-2 sm:grid-cols-2">
                                    {msg.images.map((img) => (
                                        <img
                                            key={img.name}
                                            src={img.url}
                                            alt={img.name}
                                            className="max-h-40 w-full rounded-xl object-cover"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* AI 消息中的 Markdown */}
                            {msg.role === 'assistant' ? (
                                msg.content ? (
                                    <div className="markdown-body text-sm">
                                        <Markdown>{msg.content}</Markdown>
                                    </div>
                                ) : msg.isStreaming ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="size-4 animate-spin" />
                                        <span className="text-sm">正在识别...</span>
                                    </div>
                                ) : null
                            ) : (
                                <p className="text-sm">{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 底部输入栏 */}
            <div className="shrink-0 border-t pt-4">
                {/* 已选文件预览 */}
                {files.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {files.map((file) => {
                            const previewUrl = URL.createObjectURL(file);
                            return (
                                <div key={`${file.name}-${file.size}`} className="relative">
                                    <img
                                        src={previewUrl}
                                        alt={file.name}
                                        className="h-16 w-16 rounded-xl object-cover"
                                    />
                                    <button
                                        type="button"
                                        className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs"
                                        onClick={() => removeFile(file.name)}
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="shrink-0 rounded-2xl"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isGenerating}
                    >
                        <ImagePlus className="size-5" />
                    </Button>
                    <Input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                            if (event.target.files) handleFiles(event.target.files);
                        }}
                    />

                    <Input
                        ref={inputRef}
                        placeholder="拖放图片或点击 + 选择图片，然后发送..."
                        className="rounded-2xl"
                        disabled={isGenerating}
                        onKeyDown={onKeyDown}
                    />

                    <Button
                        type="button"
                        size="icon"
                        className="shrink-0 rounded-2xl"
                        onClick={handleSend}
                        disabled={files.length === 0 || isGenerating}
                    >
                        {isGenerating ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}