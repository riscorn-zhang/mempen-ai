import { Outlet, useLocation } from 'react-router-dom';
import {
    Bot, Info, Settings, Monitor, Database,
    type LucideIcon,
} from 'lucide-react';
import useNavStore from '@/stores/nav';
import { Button } from '@/components/ui/button';

const sections: { id: string; label: string; icon: LucideIcon; path: string }[] = [
    { id: 'model', label: '模型服务', icon: Bot, path: 'model' },
    { id: 'general', label: '常规设置', icon: Settings, path: 'general' },
    { id: 'display', label: '显示设置', icon: Monitor, path: 'display' },
    { id: 'data', label: '数据设置', icon: Database, path: 'data' },
    { id: 'about', label: '关于软件', icon: Info, path: 'about' },
];

export default function SettingsPage() {
    const location = useLocation();
    const nav = useNavStore();

    return (
        <div className="flex h-full gap-2">
            <div className="w-44 shrink-0 border-r px-2 py-4 space-y-1">
                <h2 className="px-3 mb-3 text-lg font-bold">设置</h2>
                {sections.map(({ id, label, icon: Icon, path }) => {
                    const isActive = location.pathname.endsWith(`/${path}`);
                    return (
                        <Button
                            key={id}
                            variant={isActive ? 'primary' : 'ghost'}
                            className="w-full justify-start gap-2.5 h-9 text-sm"
                            onClick={() => nav.move(`/settings/${path}`)}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Button>
                    );
                })}
            </div>
            <div className="flex-1 overflow-hidden p-6">
                <Outlet />
            </div>
        </div>
    );
}
