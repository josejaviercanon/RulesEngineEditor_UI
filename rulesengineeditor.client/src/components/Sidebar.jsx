import { useEffect, useState, useCallback } from 'react';
import { Folder, FileJson, Save, Plus, Play, Trash2, Globe, FlaskConical } from 'lucide-react';
import { rulesApi } from '../services/apiClient';

// Utility: generate path assertions from expected output JSON
function generateAssertionsFromExpectedOutput(expectedOutputJson, basePath = '') {
  const assertions = [];
  try {
    const obj = JSON.parse(expectedOutputJson);
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => {
        const pathPrefix = basePath ? `${basePath}[${idx}]` : `[${idx}]`;
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => {
            const val = item[key];
            if (typeof val !== 'object' || val === null) {
              assertions.push({
                id: `auto-${Date.now()}-${idx}-${key}`,
                path: `${pathPrefix}.${key}`,
                expectedValue: String(val),
                active: true,
                source: 'auto'
              });
            }
          });
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (typeof val !== 'object' || val === null) {
          assertions.push({
            id: `auto-${Date.now()}-${key}`,
            path: basePath ? `${basePath}.${key}` : key,
            expectedValue: String(val),
            active: true,
            source: 'auto'
          });
        }
      });
    }
  } catch (err) {
    console.error('Failed to parse expected output JSON:', err);
  }
  return assertions;
}

export default function Sidebar({ state, dispatch, onDryRun }) {
  const [workflows, setWorkflows] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWorkflows = useCallback(async () => {
    const wfRes = await rulesApi.getWorkflows();
    setWorkflows(wfRes.data || []);
  }, []);

  const loadScenarios = useCallback(async (workflowId) => {
    const scRes = await rulesApi.getScenarios(workflowId);
    setScenarios(scRes.data || []);
  }, []);

  // Initial data load on mount — only workflows, scenarios load when workflow selected
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload scenarios when workflow changes
  useEffect(() => {
    if (state.currentWorkflowId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadScenarios(state.currentWorkflowId);
    } else {
      setScenarios([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentWorkflowId]);

  const handleToggleOnlineMode = () => {
    dispatch({ type: 'SET_ONLINE_MODE', payload: !state.onlineMode });
  };

  const handleLoadWorkflow = async (workflow) => {
    setLoading(true);
    try {
      const res = await rulesApi.getWorkflow(workflow.WorkflowDefinitionId);
      if (res.data) {
        dispatch({
          type: 'SET_WORKFLOW',
          payload: {
            id: workflow.WorkflowDefinitionId,
            rulesJson: res.data.JsonContent || res.data.jsonContent || state.currentRules
          }
        });
      }
    } catch (err) {
      console.error('Failed to load workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewWorkflow = async () => {
    try {
      const parsed = JSON.parse(state.currentRules);
      const toSave = Array.isArray(parsed) ? parsed[0] : parsed;
      const name = window.prompt('Enter workflow name:', toSave.WorkflowName || 'New Workflow');
      if (!name) return;

      const res = await rulesApi.saveWorkflow({
        WorkflowName: name,
        JsonContent: state.currentRules,
        Status: 'Draft'
      });

      if (res.data) {
        dispatch({
          type: 'SET_WORKFLOW',
          payload: {
            id: res.data.WorkflowDefinitionId,
            rulesJson: state.currentRules
          }
        });
        await loadWorkflows();
      }
    } catch {
      alert('Invalid JSON rules or save failed. Cannot save.');
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!state.currentWorkflowId) {
      alert('No workflow loaded. Save as new instead.');
      return;
    }
    try {
      const parsed = JSON.parse(state.currentRules);
      const toSave = Array.isArray(parsed) ? parsed[0] : parsed;
      const name = window.prompt('Update workflow name:', toSave.WorkflowName || 'Workflow');
      if (!name) return;

      await rulesApi.updateWorkflow(state.currentWorkflowId, {
        WorkflowName: name,
        JsonContent: state.currentRules,
        Status: 'Draft'
      });
      await loadWorkflows();
    } catch {
      alert('Invalid JSON rules or update failed.');
    }
  };

  const handleDeleteWorkflow = async (workflow) => {
    if (!window.confirm(`Delete workflow "${workflow.WorkflowName}"?`)) return;
    try {
      await rulesApi.deleteWorkflow(workflow.WorkflowDefinitionId);
      if (state.currentWorkflowId === workflow.WorkflowDefinitionId) {
        dispatch({ type: 'CLEAR_WORKFLOW' });
      }
      await loadWorkflows();
    } catch {
      alert('Failed to delete workflow.');
    }
  };

  const handleLoadScenario = async (scenario) => {
    setLoading(true);
    try {
      const res = await rulesApi.getScenario(scenario.ScenarioId);
      if (res.data) {
        const sc = res.data;
        dispatch({
          type: 'SET_SCENARIO',
          payload: {
            id: sc.ScenarioId,
            factsJson: sc.MockInputJson || sc.mockInputJson,
            scenario: sc
          }
        });

        // Auto-populate assertions from expected output
        const expectedOutput = sc.ExpectedOutputJson || sc.expectedOutputJson;
        if (expectedOutput) {
          // Replace assertions: keep manual, add new auto-generated ones
          const manualAssertions = state.assertions.filter(a => a.source === 'manual');
          const autoAssertions = generateAssertionsFromExpectedOutput(expectedOutput);
          dispatch({ type: 'REPLACE_ASSERTIONS', payload: [...manualAssertions, ...autoAssertions] });
        }
      }
    } catch (err) {
      console.error('Failed to load scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewScenario = async () => {
    if (!state.currentWorkflowId) {
      alert('Please load or create a workflow first before adding a scenario.');
      return;
    }
    const name = window.prompt('Enter scenario name:', 'New Scenario');
    if (!name) return;

    const expectedOutput = window.prompt('Enter expected output JSON (optional):', '');

    try {
      const res = await rulesApi.saveScenario({
        WorkflowDefinitionId: state.currentWorkflowId,
        ScenarioName: name,
        MockInputJson: state.currentFacts,
        ExpectedOutputJson: expectedOutput || null
      });

      if (res.data) {
        dispatch({
          type: 'SET_SCENARIO',
          payload: {
            id: res.data.ScenarioId,
            factsJson: state.currentFacts,
            scenario: res.data
          }
        });
        await loadScenarios(state.currentWorkflowId);
      }
    } catch {
      alert('Failed to save scenario.');
    }
  };

  const handleUpdateScenario = async () => {
    if (!state.currentScenarioId) {
      alert('No scenario loaded. Create new instead.');
      return;
    }
    const name = window.prompt('Update scenario name:', state.activeScenario?.ScenarioName || 'Scenario');
    if (!name) return;

    try {
      await rulesApi.updateScenario(state.currentScenarioId, {
        WorkflowDefinitionId: state.currentWorkflowId,
        ScenarioName: name,
        MockInputJson: state.currentFacts,
        ExpectedOutputJson: state.activeScenario?.ExpectedOutputJson || null
      });
      await loadScenarios(state.currentWorkflowId);
    } catch {
      alert('Failed to update scenario.');
    }
  };

  const handleDeleteScenario = async (scenario) => {
    if (!window.confirm(`Delete scenario "${scenario.ScenarioName}"?`)) return;
    try {
      await rulesApi.deleteScenario(scenario.ScenarioId);
      if (state.currentScenarioId === scenario.ScenarioId) {
        dispatch({ type: 'CLEAR_SCENARIO' });
      }
      await loadScenarios(state.currentWorkflowId);
    } catch {
      alert('Failed to delete scenario.');
    }
  };

  // Filter scenarios by current workflow
  const filteredScenarios = state.currentWorkflowId
    ? scenarios.filter(s => s.WorkflowDefinitionId === state.currentWorkflowId || s.WorkflowDefinitionId === Number(state.currentWorkflowId))
    : [];

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full text-slate-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-lime-400 font-bold">
          <Folder size={18} />
          <span>RulesEngine Lab</span>
        </div>
      </div>

      {/* Online Mode Toggle */}
      <div className="px-4 py-3 border-b border-slate-800">
        <button
          onClick={handleToggleOnlineMode}
          className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-semibold transition-colors border ${
            state.onlineMode
              ? 'bg-lime-500/10 text-lime-400 border-lime-500/30 hover:bg-lime-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
          title={state.onlineMode ? 'Backend evaluation active' : 'Local simulation active'}
        >
          {state.onlineMode ? <Globe size={14} /> : <FlaskConical size={14} />}
          {state.onlineMode ? 'Online Mode' : 'Sandbox Mode'}
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        {/* Workflows Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workflows</h3>
            <div className="flex items-center gap-1">
              <button onClick={handleSaveNewWorkflow} className="text-lime-400 hover:text-lime-300 p-1" title="Save as New Workflow">
                <Plus size={14} />
              </button>
              <button onClick={handleUpdateWorkflow} className="text-slate-400 hover:text-slate-200 p-1" title="Update Current Workflow">
                <Save size={14} />
              </button>
            </div>
          </div>
          <ul className="space-y-1">
            {workflows.map(wf => {
              const isActive = state.currentWorkflowId === wf.WorkflowDefinitionId || state.currentWorkflowId === Number(wf.WorkflowDefinitionId);
              return (
                <li 
                  key={wf.WorkflowDefinitionId || wf.WorkflowName} 
                  className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors group ${
                    isActive ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0" onClick={() => handleLoadWorkflow(wf)}>
                    <FileJson size={14} className={isActive ? 'text-lime-400' : 'text-slate-500'} />
                    <span className="truncate">{wf.WorkflowName}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteWorkflow(wf)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-0.5 transition-opacity"
                    title="Delete Workflow"
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              );
            })}
            {workflows.length === 0 && (
              <li className="text-xs text-slate-600 px-2">No workflows saved.</li>
            )}
          </ul>
        </div>

        {/* Scenarios Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Scenarios {state.currentWorkflowId ? `(${filteredScenarios.length})` : '(select workflow)'}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={handleNewScenario} className="text-lime-400 hover:text-lime-300 p-1" title="New Scenario">
                <Plus size={14} />
              </button>
              <button onClick={handleUpdateScenario} className="text-slate-400 hover:text-slate-200 p-1" title="Update Current Scenario">
                <Save size={14} />
              </button>
            </div>
          </div>
          <ul className="space-y-1">
            {filteredScenarios.map(sc => {
              const isActive = state.currentScenarioId === sc.ScenarioId || state.currentScenarioId === Number(sc.ScenarioId);
              return (
                <li 
                  key={sc.ScenarioId} 
                  className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors group ${
                    isActive ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0" onClick={() => handleLoadScenario(sc)}>
                    <FileJson size={14} className={isActive ? 'text-lime-400' : 'text-slate-500'} />
                    <span className="truncate">{sc.ScenarioName}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteScenario(sc)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-0.5 transition-opacity"
                    title="Delete Scenario"
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              );
            })}
            {filteredScenarios.length === 0 && (
              <li className="text-xs text-slate-600 px-2">
                {state.currentWorkflowId ? 'No scenarios for this workflow.' : 'Load a workflow to see scenarios.'}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Dry Run Button */}
      <div className="p-4 border-t border-slate-800">
        {loading && (
          <div className="text-xs text-slate-500 text-center mb-2">Loading...</div>
        )}
        <button
          onClick={onDryRun}
          className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold py-2 px-4 rounded shadow-lg shadow-lime-500/20 transition-all cursor-pointer"
        >
          <Play size={16} />
          Dry Run
        </button>
      </div>
    </div>
  );
}


