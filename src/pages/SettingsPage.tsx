import { useState } from 'react';
import {
    Bot, Info, Settings, Monitor, Database,
    type LucideIcon,
} from 'lucide-react';

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
}

const sections: SectionItem[] = [
    { id: 'model', label: '模型服务', icon: Bot },
    { id: 'general', label: '常规设置', icon: Settings },
    { id: 'display', label: '显示设置', icon: Monitor },
    { id: 'data', label: '数据设置', icon: Database },
    { id: 'about', label: '关于软件', icon: Info },
];

const panels: Record<SectionId, React.ReactNode> = {
    model: <ModelService />,
    general: <GeneralSettings />,
    display: <DisplaySettings />,
    data: <DataSettings />,
    about: <About />,
};

export default function SettingsPage() {
    const [active, setActive] = useState<SectionId>('model');

    return (
        <div className="flex h-full">
            {/* 左侧菜单 */}
            <div className="w-52 shrink-0 border-r pr-2 py-4 space-y-1">
                <h2 className="px-3 mb-3 text-lg font-bold">设置</h2>
                {sections.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActive(id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active === id
                            ? 'bg-muted font-medium'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }`}
                    >
                        <Icon className="size-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* 右侧主面板 */}
            <div className="flex-1 overflow-y-auto p-6">
                {panels[active]}
            </div>
        </div>
    );
}