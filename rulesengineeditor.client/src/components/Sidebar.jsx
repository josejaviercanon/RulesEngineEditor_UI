import { useEffect, useState, useCallback } from 'react';
import { Folder, FileJson, Save, Plus, Play, Trash2, Globe, FlaskConical } from 'lucide-react';
import { rulesApi } from '../services/apiClient';
import WorkflowModal from './WorkflowModal';

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
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingScenario, setIsCreatingScenario] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');

  const loadScenarios = useCallback(async (workflowId) => {
    const scRes = await rulesApi.getScenarios(workflowId);
    setScenarios(scRes.data || []);
  }, []);

  // Reload scenarios when workflow changes — only fires when currentWorkflowId is set
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

  // Modal handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectWorkflow = (workflowData) => {
    dispatch({ type: 'CLEAR_SCENARIO' });
    dispatch({
      type: 'SET_WORKFLOW',
      payload: {
        id: workflowData.id,
        rulesJson: workflowData.rulesJson
      }
    });
    setIsModalOpen(false);
  };

  const handleCreateWorkflow = (workflowData) => {
    dispatch({
      type: 'CREATE_WORKFLOW_SUCCESS',
      payload: {
        id: workflowData.id,
        rulesJson: workflowData.rulesJson
      }
    });
    alert(`Workflow "${workflowData.name}" created and saved successfully.`);
    setIsModalOpen(false);
  };

  const handleDeleteWorkflowFromModal = (workflowId) => {
    if (state.currentWorkflowId === workflowId || state.currentWorkflowId === Number(workflowId)) {
      dispatch({ type: 'CLEAR_WORKFLOW' });
      dispatch({ type: 'CLEAR_SCENARIO' });
    }
  };

  /**
   * Validates and parses the current rules JSON.
   * Returns { valid, parsed, firstWorkflow, error } object.
   */
  const validateRulesJson = () => {
    const raw = state.currentRules;
    if (!raw || raw.trim() === '' || raw.trim() === '[]' || raw.trim() === '{}') {
      return { valid: false, parsed: null, firstWorkflow: null, error: 'Rules JSON is empty. Add workflow content first.' };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return { valid: false, parsed: null, firstWorkflow: null, error: `Invalid JSON: ${e.message}` };
    }

    if (!parsed) {
      return { valid: false, parsed, firstWorkflow: null, error: 'Rules JSON is null or undefined.' };
    }

    const firstWorkflow = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!firstWorkflow || typeof firstWorkflow !== 'object') {
      return { valid: false, parsed, firstWorkflow: null, error: 'Rules JSON must contain at least one workflow object.' };
    }

    return { valid: true, parsed, firstWorkflow, error: null };
  };

  const handleUpdateWorkflow = async () => {
    if (!state.currentWorkflowId) {
      alert('No workflow loaded. Use the New button to create one first.');
      return;
    }

    const validation = validateRulesJson();
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const { firstWorkflow } = validation;
    const name = firstWorkflow.WorkflowName || 'Workflow';

    try {
      const res = await rulesApi.updateWorkflow(state.currentWorkflowId, {
        WorkflowName: name,
        Version: firstWorkflow.Version || 1,
        JsonContent: state.currentRules,
        Status: 'Draft'
      });

      if (res.data) {
        alert('Workflow saved successfully!');
      } else {
        alert('Update returned no data. Workflow may not have been saved.');
      }
    } catch (err) {
      console.error('Update workflow error:', err);
      alert(`Failed to update workflow: ${err.message || 'Unknown error'}`);
    }
  };

  const handleSaveWorkflow = async () => {
    if (state.currentWorkflowId) {
      // Update existing
      await handleUpdateWorkflow();
      return;
    }

    // Save as new
    const validation = validateRulesJson();
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const { firstWorkflow } = validation;
    const name = window.prompt('Enter workflow name:', firstWorkflow.WorkflowName || 'New Workflow');
    if (!name) return;

    try {
      const res = await rulesApi.saveWorkflow({
        WorkflowName: name,
        Version: firstWorkflow.Version || 1,
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
      } else {
        alert('Save returned no data. Workflow may not have been saved.');
      }
    } catch (err) {
      console.error('Save workflow error:', err);
      alert(`Failed to save workflow: ${err.message || 'Unknown error'}`);
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

        // Load scenario assertions from expected output JSON
        const expectedOutput = sc.ExpectedOutputJson || sc.expectedOutputJson;
        if (expectedOutput) {
          try {
            const parsed = JSON.parse(expectedOutput);
            if (Array.isArray(parsed) && parsed.length > 0 && 'path' in parsed[0]) {
              // It's a serialized assertions list! Load it.
              dispatch({ type: 'REPLACE_ASSERTIONS', payload: parsed });
            } else {
              // Standard mock JSON output, generate auto assertions
              const autoAssertions = generateAssertionsFromExpectedOutput(expectedOutput);
              dispatch({ type: 'REPLACE_ASSERTIONS', payload: autoAssertions });
            }
          } catch {
            // Not a JSON string or not array, just empty it
            dispatch({ type: 'REPLACE_ASSERTIONS', payload: [] });
          }
        } else {
          dispatch({ type: 'REPLACE_ASSERTIONS', payload: [] });
        }
      }
    } catch (err) {
      console.error('Failed to load scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewScenario = () => {
    if (!state.currentWorkflowId) {
      alert('No workflow loaded or saved. Please load an existing workflow or save your current one before creating scenarios.');
      return;
    }
    setIsCreatingScenario(true);
    setNewScenarioName('');
    dispatch({ type: 'CLEAR_ASSERTIONS' });
  };

  const handleConfirmCreateScenario = async () => {
    const name = newScenarioName.trim();
    if (!name) return;

    try {
      const serializedAssertions = JSON.stringify(state.assertions);

      const res = await rulesApi.saveScenario({
        WorkflowDefinitionId: state.currentWorkflowId,
        ScenarioName: name,
        MockInputJson: state.currentFacts,
        ExpectedOutputJson: serializedAssertions
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
        setIsCreatingScenario(false);
        setNewScenarioName('');
      }
    } catch (err) {
      console.error('Failed to save scenario:', err);
      const details = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
      alert(`Failed to save scenario: ${details}`);
    }
  };

  const handleUpdateScenario = async () => {
    if (!state.currentScenarioId) {
      alert('No scenario loaded. Create new instead.');
      return;
    }
    const name = state.activeScenario?.ScenarioName || 'Scenario';

    try {
      const serializedAssertions = JSON.stringify(state.assertions);

      await rulesApi.updateScenario(state.currentScenarioId, {
        WorkflowDefinitionId: state.currentWorkflowId,
        ScenarioName: name,
        MockInputJson: state.currentFacts,
        ExpectedOutputJson: serializedAssertions
      });

      const updatedScenario = {
        ...state.activeScenario,
        ScenarioName: name,
        MockInputJson: state.currentFacts,
        ExpectedOutputJson: serializedAssertions
      };

      dispatch({
        type: 'SET_SCENARIO',
        payload: {
          id: state.currentScenarioId,
          factsJson: state.currentFacts,
          scenario: updatedScenario
        }
      });

      await loadScenarios(state.currentWorkflowId);
      alert('Scenario saved successfully!');
    } catch (err) {
      console.error('Failed to update scenario:', err);
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
              <button onClick={handleOpenModal} data-testid="new-workflow-btn" className="text-lime-400 hover:text-lime-300 p-1" title="Load or Create Workflow">
                <Plus size={14} />
              </button>
              <button onClick={handleSaveWorkflow} data-testid="save-workflow-btn" className="text-slate-400 hover:text-slate-200 p-1" title={state.currentWorkflowId ? 'Update Current Workflow' : 'Save as New Workflow'}>
                <Save size={14} />
              </button>
            </div>
          </div>
          {!state.currentWorkflowId && (
            <p data-testid="workflow-list-empty" className="text-xs text-slate-600 px-2 py-3 italic">
              Click New to load or create a workflow
            </p>
          )}
          {state.currentWorkflowId && (
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm rounded bg-lime-500/10 text-lime-400 border border-lime-500/20">
              <FileJson size={14} className="text-lime-400" />
              <span className="truncate">Workflow #{state.currentWorkflowId}</span>
            </div>
          )}
        </div>

        {/* Scenarios Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Scenarios {state.currentWorkflowId ? `(${filteredScenarios.length})` : '(select workflow)'}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={handleNewScenario} data-testid="new-scenario-btn" className="text-lime-400 hover:text-lime-300 p-1" title="New Scenario">
                <Plus size={14} />
              </button>
              <button onClick={handleUpdateScenario} data-testid="update-scenario-btn" className="text-slate-400 hover:text-slate-200 p-1" title="Update Current Scenario">
                <Save size={14} />
              </button>
            </div>
          </div>
          {isCreatingScenario && (
            <div className="mb-2 p-2 rounded bg-slate-900 border border-slate-800 space-y-2">
              <input
                type="text"
                data-testid="new-scenario-name-input"
                placeholder="Scenario name..."
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmCreateScenario();
                  } else if (e.key === 'Escape') {
                    setIsCreatingScenario(false);
                    setNewScenarioName('');
                  }
                }}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => {
                    setIsCreatingScenario(false);
                    setNewScenarioName('');
                  }}
                  data-testid="cancel-create-scenario-btn"
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreateScenario}
                  disabled={!newScenarioName.trim()}
                  data-testid="confirm-create-scenario-btn"
                  className="px-2 py-0.5 rounded bg-lime-500 hover:bg-lime-400 disabled:bg-slate-800 disabled:text-slate-600 text-[10px] text-slate-950 font-bold transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          )}
          <ul className="space-y-1">
            {filteredScenarios.map(sc => {
              const isActive = state.currentScenarioId === sc.ScenarioId || state.currentScenarioId === Number(sc.ScenarioId);
              return (
                <li 
                  key={sc.ScenarioId} 
                  data-testid={`scenario-item-${sc.ScenarioId}`}
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
                    data-testid="delete-scenario-btn"
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
          data-testid="run-dryrun-btn"
          className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold py-2 px-4 rounded shadow-lg shadow-lime-500/20 transition-all cursor-pointer"
        >
          <Play size={16} />
          Dry Run
        </button>
      </div>

      {/* Workflow Modal */}
      {isModalOpen && (
        <WorkflowModal
          onClose={handleCloseModal}
          onSelectWorkflow={handleSelectWorkflow}
          onCreateWorkflow={handleCreateWorkflow}
          onDeleteWorkflow={handleDeleteWorkflowFromModal}
          isCreatingExternal={state.isCreatingWorkflow}
        />
      )}
    </div>
  );
}
