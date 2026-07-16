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
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { title: '首页', icon: Home, path: '/' },
    { title: '知识库', icon: BookOpen, path: '/knowledge' },
    { title: '学习计划', icon: Calendar, path: '/plan' },
    { title: '聊天', icon: MessageCircle, path: '/chat' },
    { title: '设置', icon: Settings, path: '/settings' },
];

export function AppSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="h-14 flex justify-center">
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <PencilSparkles className="w-4 h-4" />
                        <span>MemPen AI</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        isActive={location.pathname === item.path}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.title}</span>
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