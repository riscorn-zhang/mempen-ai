// import Editor from '@monaco-editor/react';
// import type { BeforeMount, OnChange } from '@monaco-editor/react';
// import type * as Monaco from 'monaco-editor';

// const registerYamlSnippet: BeforeMount = (monaco) => {
//     monaco.languages.registerCompletionItemProvider('markdown', {
//         triggerCharacters: ['-', '{'],

//         provideCompletionItems: (
//             model: Monaco.editor.ITextModel,
//             position: Monaco.Position
//         ) => {
//             const lines = model.getValue().split('\n');

//             const currentLine =
//                 lines[position.lineNumber - 1] || '';

//             const textBeforeCursor =
//                 currentLine.slice(0, position.column - 1);


//             // ================================
//             // 1. {{ Front }} / {{ Back }}
//             // 仅允许行首输入
//             // ================================

//             const placeholderMatch =
//                 textBeforeCursor.match(/^\s*\{\{?$/);


//             if (placeholderMatch) {

//                 return {
//                     suggestions: [
//                         {
//                             label: '{{ Front }}',

//                             kind:
//                                 monaco.languages.CompletionItemKind.Snippet,

//                             documentation:
//                                 'Insert Front placeholder',

//                             insertText:
//                                 '{{ Front }}',

//                             range: {
//                                 startLineNumber:
//                                     position.lineNumber,

//                                 endLineNumber:
//                                     position.lineNumber,

//                                 startColumn:
//                                     1,

//                                 endColumn:
//                                     currentLine.length + 1,
//                             }
//                         },

//                         {
//                             label: '{{ Back }}',

//                             kind:
//                                 monaco.languages.CompletionItemKind.Snippet,

//                             documentation:
//                                 'Insert Back placeholder',

//                             insertText:
//                                 '{{ Back }}',

//                             range: {
//                                 startLineNumber:
//                                     position.lineNumber,

//                                 endLineNumber:
//                                     position.lineNumber,

//                                 startColumn:
//                                     1,

//                                 endColumn:
//                                     currentLine.length + 1,
//                             }
//                         }
//                     ]
//                 };
//             }


//             // ================================
//             // 2. YAML Frontmatter
//             // ================================

//             const trimmedBefore =
//                 textBeforeCursor.trim();


//             const dashMatch =
//                 trimmedBefore.match(/^\-{1,3}$/);


//             if (dashMatch) {

//                 const beforeLines =
//                     lines.slice(0, position.lineNumber - 1);

//                 const beforeContent =
//                     beforeLines.join('\n').trim();


//                 const isTopOfFile =
//                     beforeContent === '';


//                 const isOnlyFrontmatter =
//                     /^---\n[\s\S]*\n---$/
//                         .test(beforeContent);


//                 if (isTopOfFile || isOnlyFrontmatter) {

//                     return {
//                         suggestions: [
//                             {
//                                 label:
//                                     '--- YAML Frontmatter',

//                                 kind:
//                                     monaco.languages
//                                         .CompletionItemKind.Snippet,

//                                 documentation:
//                                     'Insert YAML frontmatter block',

//                                 insertText:
//                                     `---
// tags: \${1:}
// group: \${2:}
// type: \${3:knowledge}
// # Tip: [knowledge, qa, double-qa] are allowed to use
// ---
// `,

//                                 insertTextRules:
//                                     monaco.languages
//                                         .CompletionItemInsertTextRule
//                                         .InsertAsSnippet,


//                                 range: {
//                                     startLineNumber:
//                                         position.lineNumber,

//                                     endLineNumber:
//                                         position.lineNumber,

//                                     startColumn:
//                                         1,

//                                     endColumn:
//                                         position.column,
//                                 }
//                             }
//                         ]
//                     };
//                 }
//             }


//             return {
//                 suggestions: []
//             };
//         },
//     });
// };


// interface Props {
//     className?: string;
//     value?: string;
//     onChange?: OnChange;
// }


// export function CardMonacoEditor({
//     className,
//     value,
//     onChange,
//     ...restProps
// }: Props) {

//     return (
//         <Editor
//             beforeMount={registerYamlSnippet}

//             className={className}

//             value={value}

//             onChange={onChange}

//             {...restProps}

//             height="100%"

//             defaultLanguage="markdown"

//             options={{

//                 wordWrap: 'on',

//                 wrappingIndent: 'indent',

//                 minimap: {
//                     enabled: false
//                 },

//                 fontSize: 14,

//                 lineNumbers: 'on',

//                 scrollBeyondLastLine: false,

//                 automaticLayout: true,


//                 // 关键：
//                 // 防止输入 { 自动生成 }
//                 autoClosingBrackets: 'never',

//                 autoClosingQuotes: 'never',
//             }}

//             theme="vs-dark"
//         />
//     );
// }