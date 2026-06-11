import Editor from '@monaco-editor/react';
import { rulesEngineWorkflowSchema } from '../services/schema';

export default function RulesEditorPane({ value, onChange }) {
  const handleEditorBeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        uri: 'http://rulesengine/rules-schema.json',
        fileMatch: ['rules.json'],
        schema: rulesEngineWorkflowSchema
      }]
    });
  };

  return (
    <div data-testid="rules-editor-pane" className="flex flex-col h-full bg-slate-900 border-r border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/50">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Rules (JSON)</h2>
        <span className="text-xs text-slate-400">Microsoft.RulesEngine Workflow</span>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          path="rules.json"
          defaultLanguage="json"
          theme="vs-dark"
          value={value}
          onChange={(val) => onChange(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
}
