import Editor from '@monaco-editor/react';
import type { BeforeMount, OnMount, OnChange } from '@monaco-editor/react';
import { cn } from '@/lib/utils';

export interface MonacoEditorProps {
    beforeMount?: BeforeMount;
    onMount?: OnMount;
    className?: string;
    value?: string;
    onChange?: OnChange;
}

export function MonacoEditor({ beforeMount, onMount, className = "", value, onChange, ...restProps }: MonacoEditorProps) {
    return (
        <div className={cn(className)}>
            <Editor
                height="100%"
                defaultLanguage="markdown"
                defaultValue=""
                theme="vs-dark"
                beforeMount={beforeMount}
                onMount={onMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    quickSuggestions: { other: true, comments: false, strings: false },
                    suggestOnTriggerCharacters: true,
                    quickSuggestionsDelay: 100,
                }}
                value={value}
                onChange={onChange}
                {...restProps}

            />
        </div>
    );
}
