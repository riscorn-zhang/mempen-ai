import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useConfig } from '@/lib/config';

type Theme = 'light' | 'dark' | 'system'

const THEMES = [
    { value: 'system', label: '跟随系统' },
    { value: 'light', label: '浅色' },
    { value: 'dark', label: '深色' },
] as const;


export default function DisplaySettings() {
    const [setting, update] = useConfig(["settings", 'display']);

    const onThemeChange = (value: string) => {
        const next = value as Theme;
        update((d) => { d.theme = next; });
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h3 className="text-xl font-bold">显示设置</h3>
                <p className="text-sm text-muted-foreground">界面与主题配置</p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <p className="text-sm font-medium">主题</p>
                    <p className="text-xs text-muted-foreground">选择浅色、深色或跟随系统</p>
                </div>
                <Select value={setting.theme} onValueChange={onThemeChange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {THEMES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
