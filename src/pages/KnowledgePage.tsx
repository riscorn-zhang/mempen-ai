import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { File, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import FileExplorer, { type FSNode } from "@/components/common/FileExplorer";

// ==================== Mock Data ====================

/** File content map: chunkId -> content string */
const initialContents: Record<string, string> = {
    "1": "# Q3 规划\n\n- 完成知识库模块\n- 优化搜索功能\n- 发布 v1.0",
    "2": "M1: 7月底 - 核心功能完成\nM2: 8月中 - 测试与修复\nM3: 9月初 - 正式发布",
    "3": "# 会议纪要\n\n**日期**: 2026-07-15\n**参会人**: 全员\n\n## 议题\n1. 进度同步\n2. 问题讨论\n3. 下一步计划",
    "4": "本周完成：\n下周计划：\n风险与问题：",
    "5": "# Rust 所有权系统\n\n1. 每个值有且只有一个所有者\n2. 值在所有者离开作用域时被丢弃\n3. 借用规则：\n   - 任意时刻只能有一个可变引用\n   - 或任意数量的不可变引用",
    "6": "# 生命周期\n\n生命周期标注语法：\n\nfn longest(x: &str, y: &str) -> &str {\n    if x.len() > y.len() { x } else { y }\n}",
    "7": "# TypeScript 泛型\n\nfunction identity<T>(arg: T): T {\n    return arg;\n}\n\n## 约束\n\ninterface Lengthwise {\n    length: number;\n}\n\nfunction loggingIdentity<T extends Lengthwise>(arg: T): T {\n    console.log(arg.length);\n    return arg;\n}",
    "8": "# React 19 新特性\n\n- Actions\n- use() hook\n- Server Components\n- Document Metadata\n- 改进的 Hooks",
    "9": "README.md"
};

const initialTree: FSNode = {
    name: "知识库",
    children: [
        {
            name: "工作文档",
            children: [
                {
                    name: "项目计划",
                    children: [
                        { name: "Q3规划.md", chunk: "1" },
                        { name: "里程碑.txt", chunk: "2" },
                    ],
                },
                { name: "会议纪要.md", chunk: "3" },
                { name: "周报模板.txt", chunk: "4" },
            ],
        },
        {
            name: "学习笔记",
            children: [
                {
                    name: "Rust",
                    children: [
                        { name: "所有权系统.md", chunk: "5" },
                        { name: "生命周期.md", chunk: "6" },
                    ],
                },
                { name: "TypeScript泛型.md", chunk: "7" },
                { name: "React 19 新特性.md", chunk: "8" },
            ],
        },
        { name: "README.md", chunk: "9" },
    ],
};

// ==================== Component ====================

export default function KnowledgePage() {
    const [fileContents, setFileContents] = useState<Record<string, string>>(initialContents);
    const { "*": splat } = useParams();
    const navigate = useNavigate();

    // Read initial path from URL splat
    const initialExplorerPath = useMemo(() => {
        if (!splat) return [];
        return splat.split("/").filter(Boolean);
    }, [splat]);

    // Editor state
    const [selectedFile, setSelectedFile] = useState<{ name: string; chunkId: string } | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    // Sync FileExplorer path to URL
    const handleNavigate = useCallback(
        (pathStack: string[]) => {
            const suffix = pathStack.length > 0 ? "/" + pathStack.join("/") : "";
            navigate("/knowledge" + suffix, { replace: true });
        },
        [navigate]
    );

    // Open file (by chunkId)
    const handleFileOpen = useCallback(
        (node: FSNode) => {
            const chunkId = node.chunk ?? "";
            setSelectedFile({ name: node.name, chunkId });
            setEditContent(chunkId ? (fileContents[chunkId] ?? "") : "");
            setIsDirty(false);
        },
        [fileContents]
    );

    // Close editor
    const closeEditor = useCallback(() => {
        if (isDirty) {
            setShowCloseConfirm(true);
            return;
        }
        setSelectedFile(null);
        setEditContent("");
        setIsDirty(false);
    }, [isDirty]);

    // Confirm close (discard changes)
    const confirmClose = useCallback(() => {
        setSelectedFile(null);
        setEditContent("");
        setIsDirty(false);
        setShowCloseConfirm(false);
    }, []);

    // Save file (by chunkId)
    const saveFile = useCallback(() => {
        if (!selectedFile || !selectedFile.chunkId) return;
        setFileContents((prev) => ({
            ...prev,
            [selectedFile.chunkId]: editContent,
        }));
        setIsDirty(false);
    }, [selectedFile, editContent]);

    // Keyboard shortcut: Ctrl+S to save
    const handleEditorKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                saveFile();
            }
        },
        [saveFile]
    );

    return (
        <div className="flex h-full flex-col">
            <FileExplorer
                tree={initialTree}
                initialPath={initialExplorerPath}
                onFileOpen={handleFileOpen}
                onNavigate={handleNavigate}
            />

            {/* ===== Close Confirmation Dialog ===== */}
            <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>未保存的更改</DialogTitle>
                        <DialogDescription>
                            有未保存的更改，确定关闭吗？
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCloseConfirm(false)}>
                            取消
                        </Button>
                        <Button variant="default" onClick={confirmClose}>
                            确定关闭
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===== File Editor Panel (overlay) ===== */}
            {selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-8">
                    <div className="flex h-[80vh] w-[70vw] flex-col rounded-xl border bg-background shadow-2xl">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div className="flex items-center gap-2">
                                <File className="size-4 text-blue-500" />
                                <span className="font-medium">{selectedFile.name}</span>
                                {isDirty && (
                                    <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-600">
                                        已修改
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={saveFile}
                                    disabled={!isDirty}
                                    className="gap-1.5"
                                >
                                    <Save className="size-3.5" />
                                    保存
                                </Button>
                                <Button size="icon-sm" variant="ghost" onClick={closeEditor}>
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <Textarea
                            className="h-full flex-1 resize-none rounded-none border-0 bg-transparent font-mono text-sm leading-relaxed shadow-none focus-visible:ring-0"
                            value={editContent}
                            onChange={(e) => {
                                setEditContent(e.target.value);
                                setIsDirty(true);
                            }}
                            onKeyDown={handleEditorKeyDown}
                            placeholder="开始编辑..."
                            spellCheck={false}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}