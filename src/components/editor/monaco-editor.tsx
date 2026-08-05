import Editor from '@monaco-editor/react';
import type { BeforeMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

const frontmatterKeySuggestions = [
    {
        label: 'tag',
        kind: 15, // CompletionItemKind.Snippet
        insertText: 'tag: ',
        documentation: 'Document tag',
    },
    {
        label: 'varienty',
        kind: 15,
        insertText: 'varienty: ',
        documentation: 'Document variety',
    },
];

const frontmatterValueSuggestions = [
    {
        label: 'example',
        kind: 12, // CompletionItemKind.Value
        insertText: 'example',
        documentation: 'Example value',
    },
    {
        label: 'default',
        kind: 12,
        insertText: 'default',
        documentation: 'Default value',
    },
];

let completionRegistered = false;

const registerMarkdownFrontmatterCompletions: BeforeMount = (monaco) => {
    if (completionRegistered) {
        return;
    }

    monaco.languages.registerCompletionItemProvider('markdown', {
        triggerCharacters: [':'],
        provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
            const lines = model.getValue().split('\n');
            const currentLine = lines[position.lineNumber - 1] ?? '';
            const trimmedLine = currentLine.slice(0, position.column - 1).trimStart();

            const startBoundary = lines
                .slice(0, position.lineNumber)
                .map((line: string) => line.trim())
                .lastIndexOf('---');
            const endBoundary = lines.slice(position.lineNumber).findIndex((line: string) => line.trim() === '---');
            if (startBoundary === -1 || endBoundary === -1) {
                return { suggestions: [] };
            }

            const inFrontmatter = position.lineNumber - 1 > startBoundary && endBoundary !== -1;
            if (!inFrontmatter) {
                return { suggestions: [] };
            }

            if (trimmedLine === '' || /^[a-zA-Z]*$/.test(trimmedLine)) {
                return { suggestions: frontmatterKeySuggestions };
            }

            if (/^tag\s*:\s*$/.test(trimmedLine) || /^varienty\s*:\s*$/.test(trimmedLine)) {
                return { suggestions: frontmatterValueSuggestions };
            }

            return { suggestions: [] };
        },
    });

    completionRegistered = true;
};

export function MonacoEditor() {
    return (
        <Editor
            height="100%"
            defaultLanguage="markdown"
            defaultValue=""
            theme="vs-dark"
            beforeMount={registerMarkdownFrontmatterCompletions}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
            }}
        />
    );
}
