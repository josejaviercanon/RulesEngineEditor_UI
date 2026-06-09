import { useEffect, useState } from 'react';
import { Folder, FileJson, Save, Plus, Play } from 'lucide-react';
import { rulesApi } from '../services/apiClient';

export default function Sidebar({ state, dispatch, onDryRun }) {
  const [workflows, setWorkflows] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  
  const loadData = async () => {
    const wfRes = await rulesApi.getWorkflows();
    setWorkflows(wfRes.data || []);
    
    // For Phase 1 demo, just load all scenarios
    const scRes = await rulesApi.getScenarios();
    setScenarios(scRes.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveWorkflow = async () => {
    try {
      // Parse to ensure valid JSON before saving
      const parsed = JSON.parse(state.currentRules);
      const toSave = Array.isArray(parsed) ? parsed[0] : parsed;
      await rulesApi.saveWorkflow({
        WorkflowName: toSave.WorkflowName || "New Workflow",
        JsonContent: state.currentRules,
        Status: "Draft"
      });
      loadData();
    } catch (e) {
      alert("Invalid JSON rules. Cannot save.");
    }
  };

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full text-slate-300">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-lime-400 font-bold">
          <Folder size={18} />
          <span>RulesEngine Lab</span>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workflows</h3>
            <button onClick={handleSaveWorkflow} className="text-lime-400 hover:text-lime-300" title="Save Current Rules">
              <Save size={14} />
            </button>
          </div>
          <ul className="space-y-1">
            {workflows.map(wf => (
              <li key={wf.WorkflowDefinitionId || wf.WorkflowName} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-800 rounded cursor-pointer transition-colors">
                <FileJson size={14} className="text-slate-500" />
                <span className="truncate">{wf.WorkflowName}</span>
              </li>
            ))}
            {workflows.length === 0 && (
              <li className="text-xs text-slate-600 px-2">No workflows saved.</li>
            )}
          </ul>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scenarios</h3>
            <button className="text-lime-400 hover:text-lime-300" title="New Scenario">
              <Plus size={14} />
            </button>
          </div>
          <ul className="space-y-1">
            {scenarios.map(sc => (
              <li key={sc.ScenarioId} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-800 rounded cursor-pointer transition-colors">
                <FileJson size={14} className="text-slate-500" />
                <span className="truncate">{sc.ScenarioName}</span>
              </li>
            ))}
            {scenarios.length === 0 && (
              <li className="text-xs text-slate-600 px-2">No scenarios saved.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onDryRun}
          className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold py-2 px-4 rounded shadow-lg shadow-lime-500/20 transition-all"
        >
          <Play size={16} />
          Dry Run
        </button>
      </div>
    </div>
  );
}
