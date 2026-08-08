import { Suspense, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import useNavStore from "@/stores/nav";

export default function MainLayout() {
    const navigate = useNavigate();
    const { canGoBack, back, setNavigate } = useNavStore();

    useEffect(() => {
        setNavigate(navigate);
    }, [navigate, setNavigate]);

    return (
        <SidebarProvider className="h-svh transition-all">
            <AppSidebar data-tauri-drag-region />

            <SidebarInset className="bg-background">
                {/* 顶部 Header */}
                <header data-tauri-drag-region className="flex h-12 items-center border-b bg-background px-4 sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        {canGoBack && <div className="h-5 w-px bg-border" />}
                        {canGoBack && (
                            <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => {
                                    back();
                                }}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                        )}

                        <div className="min-h-6" />
                    </div>
                </header>

                {/* 主内容区域 */}
                <main className="flex flex-1 flex-col overflow-auto">
                    <Suspense fallback={null}>
                        <Outlet />
                    </Suspense>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
