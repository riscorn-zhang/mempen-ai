import { Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Outlet, useNavigate } from "react-router-dom";
import { ChevronLeft, Ellipsis, EllipsisVertical, Home, Settings } from "lucide-react";

import useNavStore from "@/stores/nav";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import WorkspaceIndicator from "@/components/common/workspace-indicator";

export default function MainLayout() {
    const navigate = useNavigate();
    const nav = useNavStore();

    useEffect(() => {
        nav.setNavigate(navigate);
    }, [navigate, nav.setNavigate]);

    return (
        <div className="h-full">
            {/* 顶部 Header */}
            <header data-tauri-drag-region className="flex h-12 items-center border-b bg-background px-4 sticky top-0 z-50 gap-4">

                {nav.canGoBack && (
                    <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                            nav.back();
                        }}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                )}

                <div className="flex-1" />

                <WorkspaceIndicator />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size={"icon"} variant={"ghost"}>
                            <EllipsisVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => nav.home("/")}>
                            <Home />
                            主页
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => nav.forward("/settings")}>
                            <Settings />
                            设置...
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {/* 主内容区域 */}
            <main className="flex flex-1 flex-col overflow-auto h-full">
                <Suspense fallback={null}>
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
}
