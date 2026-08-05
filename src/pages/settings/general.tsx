import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSetting } from '@/stores/settings';

const LANGUAGES = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' },
] as const;

export default function GeneralSettings() {
    const [language, setLanguage] = useSetting<string>('language', 'zh-CN');
    const [autoSave, setAutoSave] = useSetting<boolean>('autoSave', true);

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h3 className="text-xl font-bold">常规设置</h3>
                <p className="text-sm text-muted-foreground">应用基本配置</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">语言</p>
                        <p className="text-xs text-muted-foreground">界面显示语言</p>
                    </div>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">自动保存</p>
                        <p className="text-xs text-muted-foreground">编辑内容时自动写入本地</p>
                    </div>
                    <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
            </div>
        </div>
    );
}
