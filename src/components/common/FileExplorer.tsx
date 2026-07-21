import { useState, useCallback, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import useNavStore from "@/stores/nav";
import {
    Folder,
    File,
    Plus,
    Home,
    TextCursor,
    Trash2,
    FolderPlus,
    FilePlus,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Signature,
    Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ==================== Types ====================

export interface FSNode {
    name: string;
    icon?: ReactNode;
    children?: FSNode[];
    chunk?: string;
}

export interface FileExplorerProps {
    tree: FSNode;
    initialPath?: string[];
    onFileOpen?: (node: FSNode) => void;
    onNavigate?: (pathStack: string[]) => void;
}

type SortKey = "name" | "type";
type SortDirection = "asc" | "desc";

// ==================== Helpers ====================

function generateId(): string {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

/** Walk the tree from root to the node at the given path segments; returns the children array at that path, or null */
function resolvePath(
    root: FSNode,
    path: string[]
): FSNode[] | null {
    if (path.length === 0) {
        // root level: return root.children if root is a folder, or wrap root
        return root.children ?? null;
    }
    let current: FSNode[] | undefined = root.children;
    for (const segment of path) {
        if (!current) return null;
        const found = current.find((n) => n.name === segment && n.children !== undefined);
        if (!found) return null;
        current = found.children;
    }
    return current ?? null;
}

function cloneNode(node: FSNode): FSNode {
    return JSON.parse(JSON.stringify(node));
}

// ==================== Component ====================

export default function FileExplorer({ tree, initialPath, onFileOpen, onNavigate }: FileExplorerProps) {
    // ---- state ----
    const [rootNode, setRootNode] = useState<FSNode>(tree);
    const [pathStack, setPathStack] = useState<string[]>(initialPath ?? []);
    const [selectedNode, setSelectedNode] = useState<FSNode | null>(null);

    // sorting
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDirection>("asc");

    // create dialog
    const [createType, setCreateType] = useState<"file" | "folder" | null>(null);
    const [newName, setNewName] = useState("");

    // delete confirm
    const [deleteTarget, setDeleteTarget] = useState<FSNode | null>(null);

    // rename
    const [renameTarget, setRenameTarget] = useState<FSNode | null>(null);
    const [renameName, setRenameName] = useState("");

    const { forward } = useNavStore();

    // Sync initialPath from parent (e.g. URL change)
    useEffect(() => {
        if (initialPath) {
            setPathStack(initialPath);
        }
    }, [initialPath]);

    // ---- derived ----
    const currentItems: FSNode[] = useMemo(
        () => resolvePath(rootNode, pathStack) ?? [],
        [rootNode, pathStack]
    );

    const sortedItems = useMemo(() => {
        const arr = [...currentItems];
        arr.sort((a, b) => {
            // folders first unless sorting by type explicitly
            if (sortKey !== "type") {
                const aFolder = a.children !== undefined;
                const bFolder = b.children !== undefined;
                if (aFolder !== bFolder) return aFolder ? -1 : 1;
            }
            let cmp = 0;
            if (sortKey === "name") {
                cmp = a.name.localeCompare(b.name);
            } else {
                cmp = (a.children !== undefined ? "文件夹" : "文件").localeCompare(
                    b.children !== undefined ? "文件夹" : "文件"
                );
            }
            return sortDir === "asc" ? cmp : -cmp;
        });
        return arr;
    }, [currentItems, sortKey, sortDir]);

    // ---- navigation ----
    const navigateInto = useCallback((name: string) => {
        setPathStack((prev) => {
            const next = [...prev, name];
            onNavigate?.(next);
            return next;
        });
    }, [onNavigate]);

    const navigateToIndex = useCallback((idx: number) => {
        setPathStack((prev) => {
            const next = prev.slice(0, idx);
            onNavigate?.(next);
            return next;
        });
    }, [onNavigate]);

    // ---- actions ----
    const handleItemClick = useCallback(
        (node: FSNode) => {
            if (node.children !== undefined) {
                // folder: enter
                navigateInto(node.name);
            } else {
                // file: open
                setSelectedNode(node);
                onFileOpen?.(node);
            }
        },
        [navigateInto, onFileOpen]
    );

    const createItem = useCallback(() => {
        if (!newName.trim() || !createType) return;
        const newNode: FSNode = {
            name: createType === "file" ? newName.trim() + ".md" : newName.trim(),
            children: createType === "folder" ? [] : undefined,
            chunk: createType === "file" ? generateId() : undefined,
        };
        setRootNode((prev) => {
            const cloned = cloneNode(prev);
            const target = resolvePath(cloned, pathStack);
            if (target) {
                target.push(newNode);
            }
            return cloned;
        });
        setCreateType(null);
        setNewName("");
    }, [newName, createType, pathStack]);

    const renameItem = useCallback(() => {
        if (!renameTarget || !renameName.trim()) return;
        const oldName = renameTarget.name;
        setRootNode((prev) => {
            const cloned = cloneNode(prev);
            const rename = (items: FSNode[]): boolean => {
                for (const child of items) {
                    if (child.name === oldName) {
                        child.name = renameName.trim();
                        if (child.children === undefined && !renameName.trim().endsWith(".md")) {
                            child.name = renameName.trim() + ".md";
                        }
                        return true;
                    }
                    if (child.children && rename(child.children)) return true;
                }
                return false;
            };
            if (cloned.children) rename(cloned.children);
            return cloned;
        });
        if (selectedNode && selectedNode.name === oldName) {
            setSelectedNode(null);
        }
        setRenameTarget(null);
        setRenameName("");
    }, [renameTarget, renameName, selectedNode]);

    const deleteItem = useCallback(
        (node: FSNode) => {
            setRootNode((prev) => {
                const cloned = cloneNode(prev);
                const remove = (items: FSNode[]): boolean => {
                    const idx = items.findIndex(
                        (n) => n.name === node.name && (n.children !== undefined) === (node.children !== undefined)
                    );
                    if (idx !== -1) {
                        items.splice(idx, 1);
                        return true;
                    }
                    for (const child of items) {
                        if (child.children && remove(child.children)) return true;
                    }
                    return false;
                };
                // start from root children
                if (cloned.children) remove(cloned.children);
                return cloned;
            });
            if (selectedNode && selectedNode.name === node.name) setSelectedNode(null);
            setDeleteTarget(null);
        },
        [selectedNode]
    );

    // ---- sort toggle ----
    const toggleSort = useCallback(
        (key: SortKey) => {
            if (sortKey === key) {
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            } else {
                setSortKey(key);
                setSortDir("asc");
            }
        },
        [sortKey]
    );

    const sortIcon = (key: SortKey) => {
        if (sortKey !== key)
            return <ArrowUpDown className="ml-1 size-3 text-muted-foreground/40" />;
        if (sortDir === "asc") return <ArrowUp className="ml-1 size-3" />;
        return <ArrowDown className="ml-1 size-3" />;
    };

    // ---- render helpers ----
    const defaultIcon = (node: FSNode) => {
        if (node.icon) return node.icon;
        if (node.children !== undefined) {
            return <Folder className="size-4 shrink-0 text-amber-500" />;
        }
        return <File className="size-4 shrink-0 text-blue-500" />;
    };

    const isFolder = (node: FSNode) => node.children !== undefined;

    return (
        <div className="flex h-full flex-col gap-2">
            {/* ===== Toolbar: Breadcrumb only ===== */}
            <div className="px-2 py-2">
                <Breadcrumb>
                    <BreadcrumbList className="flex-wrap">
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                onClick={() => navigateToIndex(0)}
                                className={cn(
                                    "inline-flex items-center gap-1",
                                    pathStack.length === 0 && "font-medium text-foreground"
                                )}
                            >
                                <Home className="size-3.5 shrink-0" />
                                {rootNode.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        {pathStack.map((seg, idx) => {
                            const isLast = idx === pathStack.length - 1;
                            return (
                                <BreadcrumbItem key={idx}>
                                    <BreadcrumbSeparator className="px-1">/</BreadcrumbSeparator>
                                    {isLast ? (
                                        <BreadcrumbPage>{seg}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink
                                            onClick={() => navigateToIndex(idx + 1)}
                                        >
                                            {seg}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* ===== DataGrid ===== */}
            <div className="relative flex-1 overflow-auto">
                {sortedItems.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-sm text-muted-foreground">
                        空内容

                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>
                                    <button
                                        className="inline-flex items-center text-foreground hover:text-foreground/80"
                                        onClick={() => toggleSort("name")}
                                    >
                                        名称
                                        {sortIcon("name")}
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button
                                        className="inline-flex items-center text-foreground hover:text-foreground/80"
                                        onClick={() => toggleSort("type")}
                                    >
                                        类型
                                        {sortIcon("type")}
                                    </button>
                                </TableHead>
                                <TableHead className="w-24">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedItems.map((item, idx) => (
                                <TableRow
                                    key={item.name + "-" + idx}
                                    className={cn(selectedNode === item && "bg-muted/80")}
                                >
                                    <TableCell className="w-10 text-xs text-muted-foreground">
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto gap-2 p-0 text-sm text-inherit"
                                            onClick={() => handleItemClick(item)}
                                        >
                                            {defaultIcon(item)}
                                            {item.name}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                "inline-block rounded-md px-2 py-0.5 text-xs",
                                                isFolder(item)
                                                    ? "bg-amber-500/10 text-amber-600"
                                                    : "bg-blue-500/10 text-blue-600"
                                            )}
                                        >
                                            {isFolder(item) ? "文件夹" : "文件"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="w-24">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => {
                                                    setRenameTarget(item);
                                                    setRenameName(item.name.replace(/\.md$/, ""));
                                                }}
                                                title="重命名"
                                            >
                                                <TextCursor className="size-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(item)}
                                                title="删除"
                                            >
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* ===== FAB: New Button ===== */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        className="fixed bottom-6 right-6 z-40 size-12 rounded-full shadow-lg"
                    >
                        <Plus className="size-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" sideOffset={8}>
                    <DropdownMenuItem
                        onClick={() => {
                            forward("/ocr");
                        }}
                    >
                        <Signature className="size-4 text-green-500" />
                        手写笔记转文档
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setCreateType("file");
                            setNewName("");
                        }}
                    >
                        <FilePlus className="size-4 text-blue-500" />
                        新建文件
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setCreateType("folder");
                            setNewName("");
                        }}
                    >
                        <FolderPlus className="size-4 text-amber-500" />
                        新建文件夹
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => { }}
                    >
                        <Tag className="size-4 text-purple-500" />
                        新建标签
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* ===== Create Dialog ===== */}
            <Dialog
                open={createType !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setCreateType(null);
                        setNewName("");
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {createType === "folder" ? "新建文件夹" : "新建文件"}
                        </DialogTitle>
                    </DialogHeader>
                    <Input
                        autoFocus
                        placeholder={
                            createType === "folder" ? "文件夹名称" : "文件名称（不含扩展名）"
                        }
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") createItem();
                            if (e.key === "Escape") {
                                setCreateType(null);
                                setNewName("");
                            }
                        }}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setCreateType(null);
                                setNewName("");
                            }}
                        >
                            取消
                        </Button>
                        <Button size="sm" onClick={createItem} disabled={!newName.trim()}>
                            创建
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===== Rename Dialog ===== */}
            <Dialog
                open={renameTarget !== null}
                onOpenChange={(o) => {
                    if (!o) {
                        setRenameTarget(null);
                        setRenameName("");
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>重命名</DialogTitle>
                        <DialogDescription>
                            重命名{" "}
                            <span className="font-medium text-foreground">
                                {renameTarget?.name}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        autoFocus
                        placeholder={
                            renameTarget && isFolder(renameTarget)
                                ? "文件夹名称"
                                : "文件名称（不含扩展名）"
                        }
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") renameItem();
                            if (e.key === "Escape") {
                                setRenameTarget(null);
                                setRenameName("");
                            }
                        }}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setRenameTarget(null);
                                setRenameName("");
                            }}
                        >
                            取消
                        </Button>
                        <Button size="sm" onClick={renameItem} disabled={!renameName.trim()}>
                            确定
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===== Delete Confirm Dialog ===== */}
            <Dialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>确认删除</DialogTitle>
                        <DialogDescription>
                            确定要删除{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget?.name}
                            </span>{" "}
                            吗？
                            {deleteTarget && isFolder(deleteTarget) &&
                                " 文件夹内所有内容将被一并删除。"}
                            此操作不可撤销。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                            取消
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTarget && deleteItem(deleteTarget)}
                        >
                            删除
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}