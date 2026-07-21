import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { BookOpen, Calendar, MessageCircle, Settings, PencilSparkles, Home } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import useNavStore from '@/stores/nav';

const navItems = [
    { title: '首页', icon: Home, path: '/' },
    { title: '知识库', icon: BookOpen, path: '/knowledge' },
    { title: '学习计划', icon: Calendar, path: '/plan' },
    { title: '聊天', icon: MessageCircle, path: '/chat' },
    { title: '设置', icon: Settings, path: '/settings' },
];

export function AppSidebar() {
    const location = useLocation();

    const { goto } = useNavStore();

    return (
        <Sidebar variant="sidebar" collapsible="none" className="w-14 border-r">
            <SidebarHeader className="h-14 flex items-center justify-center">
                <SidebarMenuItem>
                    <SidebarMenuButton className="justify-center">
                        <PencilSparkles className="w-5 h-5" />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="flex flex-col items-center gap-1">
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        isActive={location.pathname === item.path}
                                        onClick={() => { goto(item.path); }}
                                        className="justify-center"
                                        title={item.title}
                                    >
                                        <item.icon className="w-5 h-5" />
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}