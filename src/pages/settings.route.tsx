import { Outlet, useLocation } from 'react-router-dom';
import {
    Bot, Info, Settings, Monitor, Database,
    type LucideIcon,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import useNavStore from '@/stores/nav';

import ModelService from './settings/ModelService';
import GeneralSettings from './settings/GeneralSettings';
import DisplaySettings from './settings/DisplaySettings';
import DataSettings from './settings/DataSettings';
import About from './settings/About';

type SectionId = 'model' | 'general' | 'display' | 'data' | 'about';

interface SectionItem {
    id: SectionId;
    label: string;
    icon: LucideIcon;
    path: string;
}

export const sections: SectionItem[] = [
    { id: 'model', label: '模型服务', icon: Bot, path: 'model' },
    { id: 'general', label: '常规设置', icon: Settings, path: 'general' },
    { id: 'display', label: '显示设置', icon: Monitor, path: 'display' },
    { id: 'data', label: '数据设置', icon: Database, path: 'data' },
    { id: 'about', label: '关于软件', icon: Info, path: 'about' },
];

export const settingsPanels: Record<SectionId, React.ReactNode> = {
    model: <ModelService />,
    general: <GeneralSettings />,
    display: <DisplaySettings />,
    data: <DataSettings />,
    about: <About />,
};

function SettingsMenu() {
    const location = useLocation();
    const { replace } = useNavStore();

    return (
        <div className="w-52 shrink-0 border-r pr-2 py-4 space-y-1">
            <h2 className="px-3 mb-3 text-lg font-bold">设置</h2>
            {sections.map(({ id, label, icon: Icon, path }) => {
                const isActive = location.pathname.endsWith(`/${path}`);
                return (
                    <button
                        key={id}
                        onClick={() => replace(`/settings/${path}`)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                            ? 'bg-muted font-medium'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }`}
                    >
                        <Icon className="size-4" />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

export default function SettingsPage() {
    const isMobile = useIsMobile();
    const location = useLocation();
    const { forward } = useNavStore();

    // 检查是否在子路由上（如 /settings/model）
    const isSubRoute = location.pathname !== '/settings';

    if (isMobile) {
        if (isSubRoute) {
            return <Outlet />;
        }

        return (
            <div className="py-4 space-y-1">
                <h2 className="px-3 mb-3 text-lg font-bold">设置</h2>
                {sections.map(({ id, label, icon: Icon, path }) => (
                    <button
                        key={id}
                        onClick={() => forward(`/settings/${path}`)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                        <Icon className="size-4" />
                        {label}
                    </button>
                ))}
            </div>
        );
    }

    // 桌面端：/settings 自动跳转到第一个子页面
    if (!isSubRoute) {
        forward(`/settings/${sections[0].path}`);
        return null;
    }

    return (
        <div className="flex h-full">
            <SettingsMenu />
            <div className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </div>
        </div>
    );
}

export const settingsRoute = {
    path: 'settings',
    element: <SettingsPage />,
    children: sections.map(({ id, path }) => ({
        path,
        element: settingsPanels[id],
    })),
};
