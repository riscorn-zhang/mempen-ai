
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
    ChevronRight,
    Heart,
    Clock,
    Flag,
    Circle,
    FileText,
    Tag as TagIcon,
    Layers,
    Image,
    Edit3,
    HelpCircle,
    Plus,
    X,
    Moon,
    JapaneseYen,
    Check,
    TableProperties,
    Code,
    View,
    Library,
} from 'lucide-react'

import { Search } from "lucide-react"
import React, { useState } from 'react'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"

import {
    CircleFill,
} from '@gravity-ui/icons';

import { Dialog, DialogContent } from "@/components/ui/dialog";


import { CardEditor } from "@/components/common/card-editor";


interface CardClassification {
    name: string;
    icon?: React.ReactNode;
    children?: CardClassification[];
    filter?: string;
}
export default function CardPage() {

    const classification: CardClassification[] = [
        { name: '库', icon: <Library className="size-4 text-primary" />, filter: "" },
        { name: '收藏夹', icon: <Heart className="size-4 text-red-500" /> },
        {
            name: '今天', icon: <Clock className="size-4" />, children: [
                { name: '今天到期的', icon: <Clock className="size-4" /> },
                { name: '今天添加的', icon: <Clock className="size-4" /> },
                { name: '今天编辑的', icon: <Clock className="size-4" /> },
                { name: '今天学习的', icon: <Clock className="size-4" /> },
                { name: '首次复习的', icon: <Clock className="size-4" /> },
                { name: '已重新排程', icon: <Clock className="size-4" /> },
                { name: '今天重来的', icon: <Clock className="size-4" /> },
                { name: '逾期未复习', icon: <Clock className="size-4" /> },
            ]
        },
        {
            name: '旗标', icon: <Flag className="size-4" />, children: [
                { name: '无旗标', icon: <Flag className="size-4 text-slate-500" /> },
                { name: '红色', icon: <Flag className="size-4 text-red-500" /> },
                { name: '橙色', icon: <Flag className="size-4 text-orange-500" /> },
                { name: '绿色', icon: <Flag className="size-4 text-emerald-500" /> },
                { name: '蓝色', icon: <Flag className="size-4 text-sky-500" /> },
                { name: '粉色', icon: <Flag className="size-4 text-fuchsia-500" /> },
                { name: '青色', icon: <Flag className="size-4 text-cyan-500" /> },
                { name: '紫色', icon: <Flag className="size-4 text-violet-500" /> },
            ]
        },
        {
            name: '状态', icon: <Circle className="size-4" />, children: [
                { name: '未学习', icon: <CircleFill className="size-4 text-slate-400" /> },
                { name: '学习中', icon: <CircleFill className="size-4 text-blue-500" /> },
                { name: '复习中', icon: <CircleFill className="size-4 text-emerald-500" /> },
                { name: '已暂停', icon: <CircleFill className="size-4 text-amber-500" /> },
                { name: '已搁置', icon: <CircleFill className="size-4 text-orange-500" /> },
            ]
        },
        {
            name: '牌组', icon: <Layers className="size-4" />, children: [
                { name: '当前牌组', icon: <Layers className="size-4" /> },
                { name: '系统默认', icon: <Layers className="size-4" /> },
            ]
        },
        {
            name: '笔记模板', icon: <FileText className="size-4" />, children: [
                {
                    name: '图片遮盖', icon: <Image className="size-4" />
                },
                {
                    name: '填空题', icon: <Edit3 className="size-4" />
                },
                {
                    name: '问答题', icon: <HelpCircle className="size-4" />
                },
            ]
        },
        { name: '标签', icon: <TagIcon className="size-4 text-slate-500" />, children: [{ name: '无标签', icon: <Circle className="size-4 text-slate-500" /> }] },
    ]

    const [openCard, setOpenCard] = useState(false);


    return (
        <div className="flex flex-1">
            <div className="flex w-64 border-r">
                <ScrollArea className="flex h-full flex-col overflow-auto text-sm p-2 w-full">
                    <div className="min-w-0 w-full">
                        {
                            // iterative DFS render (no recursion) - ponytail: O(n) stack, upgrade path: recursion if depth > 100
                            (() => {
                                const elements: React.ReactNode[] = []
                                interface Frame {
                                    node: CardClassification
                                    key: string
                                    depth: number
                                    children: CardClassification[]
                                    childIndex: number
                                    content: React.ReactNode[]
                                }
                                const makeNode = (f: Frame, content: React.ReactNode[]) => {
                                    const hasChildren = f.children.length > 0
                                    const trigger = hasChildren ? (
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="icon-sm" className="[&[data-state=open]>svg]:rotate-90">
                                                <ChevronRight className="transition-transform" />
                                            </Button>
                                        </CollapsibleTrigger>
                                    ) : <></>
                                    return (
                                        <Collapsible key={f.key}>
                                            <div className="flex items-center">
                                                {trigger}
                                                <Button variant="ghost" size="sm" className="flex-1 justify-start text-sm gap-2">
                                                    {f.node.icon}{f.node.name}
                                                </Button>
                                            </div>
                                            <CollapsibleContent className="gap-0 flex flex-col pl-4">
                                                {content}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    )
                                }
                                const stack: Frame[] = []
                                classification.forEach(node => {
                                    const content: React.ReactNode[] = []
                                    const frame: Frame = { node, key: node.name, depth: 0, children: node.children || [], childIndex: 0, content }
                                    elements.push(makeNode(frame, content))
                                    if (frame.children.length > 0) stack.push(frame)
                                })
                                while (stack.length > 0) {
                                    const frame = stack[stack.length - 1]
                                    if (frame.childIndex < frame.children.length) {
                                        const child = frame.children[frame.childIndex++]
                                        const childContent: React.ReactNode[] = []
                                        const childKey = `${frame.key}-${child.name}`
                                        const childFrame: Frame = { node: child, key: childKey, depth: frame.depth + 1, children: child.children || [], childIndex: 0, content: childContent }
                                        frame.content.push(makeNode(childFrame, childContent))
                                        if (childFrame.children.length > 0) stack.push(childFrame)
                                    } else {
                                        stack.pop()
                                    }
                                }
                                return elements
                            })()
                        }
                    </div>
                </ScrollArea>
            </div>
            <div className="flex flex-col flex-1 overflow-clip relative">
                <header className="flex items-center gap-2 px-4 h-12">
                    <InputGroup className="flex-1">
                        <InputGroupInput placeholder="Search..." />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                </header>

                <section className="flex-1">
                    {/* <div className="inline-flex items-center border pl-2 rounded-2xl">
                        <small className="">Tag</small>
                        <Button size='icon-xs' variant="ghost">
                            <X />
                        </Button>
                    </div> */}
                </section>
                <Button size="icon-lg" className="absolute bottom-12 right-12 h-18 w-18 active:scale-90" onClick={() => setOpenCard(true)}>
                    <Plus className="size-8" />
                </Button>
            </div>
            <Dialog open={openCard}>
                <DialogContent className="h-[90%] w-[90%] sm:max-w-full flex" showCloseButton={false}>
                    <CardEditor
                        className="flex-1 min-w-0"
                        onDiscard={() => setOpenCard(false)}
                        onSubmit={(text: string) => { setOpenCard(false); console.log(text); }}
                    />
                </DialogContent>
            </Dialog>
        </div>

    )
}