import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layouts/AppSideBar';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                {/* 顶部 Header */}
                <header className="flex h-14 items-center border-b bg-background px-4 sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-5 w-px bg-border" />
                        {/* 这里可以根据路由动态显示标题，后面再优化 */}
                        <h1 className="font-medium text-lg">MemPen AI</h1>
                    </div>
                </header>

                {/* 主内容区域 */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}