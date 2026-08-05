import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/components/theme-provider';
import { useSetting } from '@/stores/settings';

type Theme = 'light' | 'dark' | 'system'

const THEMES = [
    { value: 'system', label: '跟随系统' },
    { value: 'light', label: '浅色' },
    { value: 'dark', label: '深色' },
] as const;

export default function DisplaySettings() {
    const [theme, setThemeSetting] = useSetting<Theme>('theme', 'system');
    const { setTheme } = useTheme();

    const onThemeChange = (value: string) => {
        const next = value as Theme;
        setThemeSetting(next);
        setTheme(next);
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
                <Select value={theme} onValueChange={onThemeChange}>
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
