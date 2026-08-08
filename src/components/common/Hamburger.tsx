// "use client"

// import * as React from "react"
// import { Menu } from "lucide-react"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import {
//     Sheet,
//     SheetContent,
//     SheetDescription,
//     SheetHeader,
//     SheetTitle,
// } from "@/components/ui/sheet"

// import { useIsMobile } from "@/hooks/use-mobile"

// export type HamburgerSide = "left" | "right" | "top" | "bottom"

// export interface HamburgerProps {
//     children: React.ReactNode
//     side?: HamburgerSide
//     className?: string
// }

// export interface HamburgerPanelProps {
//     children: React.ReactNode
//     className?: string
//     title?: string
//     description?: string
// }

// export interface HamburgerTriggerProps
//     extends React.ComponentProps<typeof Button> { }

// interface HamburgerContextValue {
//     side: HamburgerSide
//     isMobile: boolean
//     openMobile: boolean
//     setOpenMobile: (open: boolean) => void
//     toggle: () => void
//     close: () => void
// }

// const HamburgerContext =
//     React.createContext<HamburgerContextValue | null>(null)

// export function useHamburger() {
//     const context = React.useContext(HamburgerContext)

//     if (!context) {
//         throw new Error(
//             "useHamburger must be used inside <Hamburger />"
//         )
//     }

//     return context
// }

// /**
//  * HamburgerPanel 只是一个声明式组件。
//  *
//  * 它的 children 会保存在 React Element 的 props 里面，
//  * 最终由 Hamburger 读取并决定渲染位置。
//  *
//  * 因此它本身不直接渲染 DOM。
//  */
// export function HamburgerPanel(
//     _props: HamburgerPanelProps
// ): React.ReactElement | null {
//     return null
// }

// HamburgerPanel.displayName = "HamburgerPanel"

// function isHamburgerPanel(
//     child: React.ReactNode
// ): child is React.ReactElement<HamburgerPanelProps> {
//     return (
//         React.isValidElement(child) &&
//         child.type === HamburgerPanel
//     )
// }

// function getDesktopPanelClassName(
//     className?: string
// ) {
//     return cn(
//         "h-svh w-56 shrink-0 overflow-y-auto bg-background border-r",
//         className
//     )
// }

// function getDesktopRootClassName(
//     className?: string
// ) {
//     return cn(
//         "min-h-svh w-full",
//         "flex",
//         "flex-row",
//         className
//     )
// }

// export function Hamburger({
//     children,
//     side = "left",
//     className,
// }: HamburgerProps) {
//     const isMobile = useIsMobile()
//     const [openMobile, setOpenMobile] = React.useState(false)

//     const toggle = React.useCallback(() => {
//         setOpenMobile((open) => !open)
//     }, [])

//     const close = React.useCallback(() => {
//         setOpenMobile(false)
//     }, [])

//     const childArray = React.Children.toArray(children)

//     const panelElements = childArray.filter(isHamburgerPanel)

//     if (panelElements.length === 0) {
//         throw new Error(
//             "<Hamburger /> requires one direct <HamburgerPanel /> child."
//         )
//     }

//     if (panelElements.length > 1) {
//         throw new Error(
//             "<Hamburger /> only supports one direct <HamburgerPanel /> child."
//         )
//     }

//     const panelElement = panelElements[0]

//     const {
//         children: panelChildren,
//         className: panelClassName,
//         title = "Navigation menu",
//         description = "Use the navigation menu to move between pages.",
//     } = panelElement.props

//     const externalChildren = childArray.filter(
//         (child) => !isHamburgerPanel(child)
//     )

//     const contextValue = React.useMemo<HamburgerContextValue>(
//         () => ({
//             side,
//             isMobile,
//             openMobile,
//             setOpenMobile,
//             toggle,
//             close,
//         }),
//         [
//             side,
//             isMobile,
//             openMobile,
//             toggle,
//             close,
//         ]
//     )

//     const desktopPanel = (
//         <aside
//             data-slot="hamburger-panel"
//             data-side={side}
//             className={getDesktopPanelClassName(
//                 panelClassName
//             )}
//         >
//             {panelChildren}
//         </aside>
//     )

//     const mobilePanel = (
//         <Sheet
//             open={openMobile}
//             onOpenChange={setOpenMobile}
//         >
//             <SheetContent
//                 side={side}
//                 className="p-0"
//                 showCloseButton={false}
//             >
//                 <SheetHeader className="sr-only">
//                     <SheetTitle>{title}</SheetTitle>

//                     <SheetDescription>
//                         {description}
//                     </SheetDescription>
//                 </SheetHeader>

//                 <aside
//                     data-slot="hamburger-panel"
//                     data-side={side}
//                     className={cn(
//                         "h-full w-full overflow-y-auto bg-background",
//                         panelClassName
//                     )}
//                 >
//                     {panelChildren}
//                 </aside>
//             </SheetContent>
//         </Sheet>
//     )

//     const renderedPanel = isMobile
//         ? mobilePanel
//         : desktopPanel

//     return (
//         <HamburgerContext.Provider value={contextValue}>
//             <div
//                 data-slot="hamburger"
//                 data-side={side}
//                 data-mobile={isMobile ? "true" : "false"}
//                 className={
//                     isMobile
//                         ? cn("min-h-svh w-full", className)
//                         : getDesktopRootClassName(className)
//                 }
//             >
//                 {!isMobile && side === "left" && renderedPanel}

//                 <div
//                     data-slot="hamburger-content"
//                     className="min-w-0 flex-1"
//                 >
//                     {isMobile && renderedPanel}

//                     {externalChildren}
//                 </div>

//                 {!isMobile && side === "right" && renderedPanel}
//             </div>
//         </HamburgerContext.Provider>
//     )
// }

// Hamburger.displayName = "Hamburger"

// export function HamburgerTrigger({
//     className,
//     children,
//     onClick,
//     ...props
// }: HamburgerTriggerProps) {
//     const { isMobile, toggle } = useHamburger()

//     if (!isMobile) {
//         return null
//     }

//     return (
//         <Button
//             type="button"
//             variant="ghost"
//             size="icon"
//             aria-label="Open navigation menu"
//             className={cn(className)}
//             onClick={(event) => {
//                 onClick?.(event)

//                 if (!event.defaultPrevented) {
//                     toggle()
//                 }
//             }}
//             {...props}
//         >
//             {children ?? <Menu className="size-5" />}

//             <span className="sr-only">
//                 Open navigation menu
//             </span>
//         </Button>
//     )
// }

// HamburgerTrigger.displayName = "HamburgerTrigger"