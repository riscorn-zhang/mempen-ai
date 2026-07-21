import { useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '@/components/layouts/AppSideBar';
import { Outlet, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import useNavStore from '@/stores/nav'

export default function MainLayout() {
    const navigate = useNavigate();
    const { canGoBack, back, setNavigate } = useNavStore();

    useEffect(() => {
        setNavigate(navigate);
    }, [navigate, setNavigate]);

    return (
        <SidebarProvider className="h-svh">
            <AppSidebar />

            <SidebarInset>
                {/* 顶部 Header */}
                <header className="flex h-14 items-center border-b bg-background px-4 sticky top-0 z-50">
                    <div className="flex items-center gap-3">

                        {
                            canGoBack
                            &&
                            <div className="h-5 w-px bg-border" />
                        }
                        {
                            canGoBack
                            &&
                            <Button size="icon-sm" variant="ghost" onClick={() => {
                                back();

                            }}>
                                <ChevronLeft className="size-4" />
                            </Button>
                        }

                        <div className="min-h-6" />
                    </div>
                </header>

                {/* 主内容区域 */}
                <main className="flex flex-1 flex-col overflow-auto p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}