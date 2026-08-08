// import { Button } from "../ui/button"
// import { Toggle } from "../ui/toggle"
// import { Separator } from "../ui/separator"
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable"
// import { CardMonacoEditor } from "./card-monaco-editor"
// import { X, Code, TableProperties, View, CircleQuestionMark, Check } from 'lucide-react'
// import { cn } from "@/lib/utils"

// import ShadowRoot from 'react-shadow';
// import { useState } from "react"

// import Markdown from 'react-markdown';
// import { ScrollArea, ScrollBar } from "../ui/scroll-area"
// import { Input } from "../ui/input"
// import { Label } from "../ui/label"
// import { Field, FieldLabel } from "../ui/field"
// import { TokenInput } from "../ui/token-input"

// interface Props {
//     className?: string;
//     onDiscard?: () => void;
//     onSubmit?: (_: string) => void;
// }

// export function CardEditor(
//     { className, onDiscard, onSubmit }: Props
// ) {

//     const [tags, setTags] = useState([] as string[])

//     function AttrEditor() {
//         return (
//             <div className="flex items-center justify-center gap-4">
//                 <Field className="flex-1" >
//                     <FieldLabel>标题</FieldLabel>
//                     <Input aria-label="标题" className="flex-1" />
//                 </Field>
//                 <Separator orientation="vertical" />
//                 <Field className="flex-1">
//                     <TokenInput value={tags} onChange={setTags} />
//                 </Field>
//             </div>
//         )
//     }

//     const [isCode, setIsCode] = useState(true);
//     const [isPreview, setIsPreview] = useState(true);

//     const [showProp, setShowProp] = useState(false);

//     const [text, setText] = useState("")

//     function toggleIsCode(value: boolean) {
//         if (!(value || isPreview))
//             setIsPreview(true)

//         setIsCode(value)
//     }

//     function toggleIsPreview(value: boolean) {
//         if (!(value || isCode))
//             setIsCode(true)
//         setIsPreview(value)
//     }

//     function handleEditor(value: string | undefined) {
//         setText(value || '')
//     }



//     return (
//         <div className={cn("flex flex-col gap-6 overflow-visible", className)}>
//             <div className="flex items-center flex-row gap-2">
//                 <Button variant={"destructive"} size="icon-lg" onClick={() => onDiscard?.()}>
//                     <X />
//                 </Button>
//                 <span className="flex-1 pl-3">新建卡片</span>
//                 <Toggle size={"icon-lg"} pressed={isCode} onPressedChange={toggleIsCode}>
//                     <Code />
//                 </Toggle>
//                 <Toggle size={"icon-lg"} pressed={isPreview} onPressedChange={toggleIsPreview}>
//                     <View />
//                 </Toggle>
//                 <Separator orientation="vertical" className="my-2" />
//                 <Separator orientation="vertical" />
//                 <Button variant={"ghost"} size={"icon-lg"}>
//                     <CircleQuestionMark />
//                 </Button>
//                 <Button size={"icon-lg"} onClick={() => { onSubmit?.(text) }}>
//                     <Check />
//                 </Button>
//             </div>
//             <ResizablePanelGroup className="flex-1 border rounded-2xl min-w-full" orientation="horizontal">
//                 <ResizablePanel
//                     hidden={!isCode}
//                     defaultSize={"50%"}
//                     minSize={"15em"}
//                     className="flex">
//                     <CardMonacoEditor className="flex-1" value={text} onChange={handleEditor} />
//                 </ResizablePanel>
//                 <ResizableHandle
//                     withHandle
//                     hidden={!(isCode && isPreview)}
//                 />
//                 <ResizablePanel
//                     hidden={!isPreview}
//                     defaultSize={"50%"}
//                     minSize={"15em"}
//                     className="wrap-break-word flex">
//                     <ScrollArea className="flex-1 p-6" >
//                         <div>
//                             <Markdown >
//                                 {text}
//                             </Markdown>
//                         </div>
//                         <ScrollBar />
//                     </ScrollArea>
//                 </ResizablePanel>
//             </ResizablePanelGroup>
//         </div>
//     )
// }