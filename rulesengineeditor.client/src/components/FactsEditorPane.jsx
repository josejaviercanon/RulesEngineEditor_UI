import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { rulesEngineSettingsSchema } from '../services/schema';

const TABS = [
  { id: 'facts', label: 'Mock Facts (JSON)', subtitle: 'Input Data' },
  { id: 'settings', label: 'Settings (JSON)', subtitle: 'ReSettings Configuration' },
];

export default function FactsEditorPane({ value, onChange, currentSettings, onSettingsChange }) {
  const [activeTab, setActiveTab] = useState('facts');

  const handleSettingsBeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        uri: 'http://rulesengine/settings-schema.json',
        fileMatch: ['settings.json'],
        schema: rulesEngineSettingsSchema
      }]
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700/50">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-700/50 bg-slate-800/50">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm font-semibold tracking-wide transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-lime-400 border-lime-500 bg-slate-900/50'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <p className="text-xs font-normal text-slate-500 mt-0.5">{tab.subtitle}</p>
            )}
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-h-0">
        {activeTab === 'facts' && (
          <Editor
            key="facts-editor"
            height="100%"
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
        )}
        {activeTab === 'settings' && (
          <Editor
            key="settings-editor"
            height="100%"
            path="settings.json"
            defaultLanguage="json"
            theme="vs-dark"
            value={currentSettings}
            beforeMount={handleSettingsBeforeMount}
            onChange={(val) => onSettingsChange(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 16 }
            }}
          />
        )}
      </div>
    </div>
  );
}
