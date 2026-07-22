import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
    Bot, Info, Settings, Monitor, Database, Menu, Search,
    type LucideIcon,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import useNavStore from '@/stores/nav';
import { useState } from 'react';

import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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
        <div className="w-44 shrink-0 border-r px-2 py-4 space-y-1">
            <h2 className="px-3 mb-3 text-lg font-bold">设置</h2>
            {sections.map(({ id, label, icon: Icon, path }) => {
                const isActive = location.pathname.endsWith(`/${path}`);
                return (
                    <Button
                        key={id}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2.5 h-9 text-sm"
                        onClick={() => replace(`/settings/${path}`)}
                    >
                        <Icon className="size-4" />
                        {label}
                    </Button>
                );
            })}
        </div>
    );
}

function MobileMenuContent({ onNavigate }: { onNavigate: () => void }) {
    const location = useLocation();
    const { replace } = useNavStore();

    return (
        <>
            <SheetHeader>
                <SheetTitle>设置</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-1">
                {sections.map(({ id, label, icon: Icon, path }) => {
                    const isActive = location.pathname.endsWith(`/${path}`);
                    return (
                        <Button
                            key={id}
                            variant={isActive ? 'secondary' : 'ghost'}
                            className="w-full justify-start gap-2.5 h-10 text-sm"
                            onClick={() => {
                                replace(`/settings/${path}`);
                                onNavigate();
                            }}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Button>
                    );
                })}
            </div>
        </>
    );
}

export default function SettingsPage() {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    if (isMobile === undefined) return null;

    if (isMobile) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64">
                                <MobileMenuContent onNavigate={() => setOpen(false)} />
                            </SheetContent>
                        </Sheet>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Search className="size-5" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </div>
            </div>
        );
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
    children: [
        { index: true, element: <Navigate to="model" replace /> },
        ...sections.map(({ id, path }) => ({
            path,
            element: settingsPanels[id],
        })),
    ],
};
