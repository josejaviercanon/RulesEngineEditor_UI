import { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Plus, Trash2 } from 'lucide-react';
import { rulesEngineSettingsSchema } from '../services/schema';

const TABS = [
  { id: 'facts', label: 'Mock Facts (JSON)', subtitle: 'Input Data' },
  { id: 'settings', label: 'Settings (JSON)', subtitle: 'ReSettings Configuration' },
];

export default function FactsEditorPane({ value, onChange, currentSettings, onSettingsChange }) {
  const [activeTab, setActiveTab] = useState('facts');

  const parsedSettings = useMemo(() => {
    try { return JSON.parse(currentSettings || '{}'); } catch { return {}; }
  }, [currentSettings]);

  const customTypes = parsedSettings.CustomTypes || [];

  const handleAddCustomType = () => {
    const updated = { ...parsedSettings, CustomTypes: [...customTypes, ''] };
    onSettingsChange(JSON.stringify(updated, null, 2));
  };

  const handleUpdateCustomType = (index, newValue) => {
    const updated = { ...parsedSettings, CustomTypes: customTypes.map((t, i) => i === index ? newValue : t) };
    onSettingsChange(JSON.stringify(updated, null, 2));
  };

  const handleRemoveCustomType = (index) => {
    const updated = { ...parsedSettings, CustomTypes: customTypes.filter((_, i) => i !== index) };
    onSettingsChange(JSON.stringify(updated, null, 2));
  };

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
    <div data-testid="facts-editor-pane" className="flex flex-col h-full bg-slate-900 border-r border-slate-700/50">
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
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
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
            </div>
            {/* Custom Types Widget */}
            <div className="shrink-0 border-t border-slate-700/50 bg-slate-900 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custom Types</h3>
                <button
                  onClick={handleAddCustomType}
                  className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300"
                  title="Add custom type assembly"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              {customTypes.length === 0 ? (
                <p className="text-xs text-slate-600 italic">No custom types registered. Add one to use custom classes in rule expressions.</p>
              ) : (
                <div className="space-y-1.5">
                  {customTypes.map((type, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={type}
                        onChange={(e) => handleUpdateCustomType(idx, e.target.value)}
                        placeholder="Namespace.ClassName, Assembly"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-lime-500 transition-colors"
                      />
                      <button
                        onClick={() => handleRemoveCustomType(idx)}
                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                        title="Remove custom type"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
