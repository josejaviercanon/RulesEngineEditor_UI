import { useEffect, useState, useCallback } from 'react';
import { X, FileJson, Plus, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { rulesApi } from '../services/apiClient';

export default function WorkflowModal({ onClose, onSelectWorkflow, onCreateWorkflow, onDeleteWorkflow }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rulesApi.getWorkflows();
      setWorkflows(res.data || []);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
      setError('Failed to load workflows.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWorkflows();
  }, [fetchWorkflows]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelectWorkflow = async (workflow) => {
    setLocalError(null);
    try {
      const res = await rulesApi.getWorkflow(workflow.WorkflowDefinitionId);
      if (res.data) {
        onSelectWorkflow({
          id: workflow.WorkflowDefinitionId,
          rulesJson: res.data.JsonContent || res.data.jsonContent
        });
      } else {
        setLocalError('Failed to load workflow: no data returned from server.');
      }
    } catch (err) {
      console.error('Failed to load workflow:', err);
      setLocalError(`Failed to load workflow: ${err.message || 'Unknown error'}`);
    }
  };

  const handleCreateSubmit = async () => {
    const name = newWorkflowName.trim();
    if (!name) return;

    setIsCreating(true);
    setLocalError(null);

    const defaultTemplate = JSON.stringify([{
      WorkflowName: name,
      Rules: [{
        RuleName: 'DefaultRule',
        SuccessEvent: '10',
        ErrorMessage: 'One or more conditions failed.',
        ErrorType: 'Error',
        RuleExpressionType: 'LambdaExpression',
        Expression: 'input1 == true'
      }]
    }], null, 2);

    try {
      const res = await rulesApi.saveWorkflow({
        WorkflowName: name,
        Version: 1,
        JsonContent: defaultTemplate,
        Status: 'Draft'
      });

      if (res.data) {
        onCreateWorkflow({
          id: res.data.WorkflowDefinitionId,
          rulesJson: defaultTemplate,
          name: name
        });
      } else {
        setLocalError('Failed to create workflow: No data returned.');
      }
    } catch (err) {
      console.error('Failed to create workflow:', err);
      setLocalError(`Failed to create workflow: ${err.message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkflow = async (e, workflow) => {
    e.stopPropagation();
    if (!window.confirm(`Delete workflow "${workflow.WorkflowName}"?`)) return;
    try {
      await rulesApi.deleteWorkflow(workflow.WorkflowDefinitionId);
      if (onDeleteWorkflow) {
        onDeleteWorkflow(workflow.WorkflowDefinitionId);
      }
      // Refresh the list
      await fetchWorkflows();
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      alert('Failed to delete workflow.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="workflow-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">
            {isCreatingMode ? 'Create New Workflow' : 'Select or Create Workflow'}
          </h2>
          <button
            onClick={onClose}
            data-testid="workflow-modal-cancel-btn"
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {localError && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{localError}</span>
            </div>
          )}
          {isCreatingMode ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="workflow-name" className="block text-sm font-medium text-slate-300 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  id="workflow-name"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Enter workflow name (e.g. OrderProcessing)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateSubmit();
                    }
                  }}
                />
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-lime-400 animate-spin" />
              <span className="ml-3 text-slate-400 text-sm">Loading workflows...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle size={24} className="text-red-400 mb-2" />
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={fetchWorkflows}
                className="text-xs text-lime-400 hover:text-lime-300 underline"
              >
                Retry
              </button>
            </div>
          ) : workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileJson size={32} className="text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">No workflows found. Create a new one.</p>
            </div>
          ) : (
            <ul className="space-y-2" data-testid="workflow-modal-list">
              {workflows.map((wf) => (
                <li
                  key={wf.WorkflowDefinitionId || wf.WorkflowName}
                  data-testid={`workflow-modal-item-${wf.WorkflowDefinitionId}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-lime-500/30 hover:bg-slate-900 cursor-pointer transition-colors group"
                  onClick={() => handleSelectWorkflow(wf)}
                >
                  <FileJson size={16} className="text-slate-500 group-hover:text-lime-400 transition-colors shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-lime-400 truncate transition-colors">
                      {wf.WorkflowName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {wf.Version ? `v${wf.Version}` : 'v1'} · {wf.Status || 'Draft'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteWorkflow(e, wf)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-1 transition-all"
                    title="Delete Workflow"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
          {isCreatingMode ? (
            <>
              <button
                onClick={handleCreateSubmit}
                disabled={isCreating || !newWorkflowName.trim()}
                data-testid="workflow-submit-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm transition-colors"
              >
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {isCreating ? 'Creating...' : 'Create Workflow'}
              </button>
              <button
                onClick={() => {
                  setIsCreatingMode(false);
                  setNewWorkflowName('');
                  setLocalError(null);
                }}
                disabled={isCreating}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-300 text-sm transition-colors"
              >
                Back to List
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsCreatingMode(true);
                  setNewWorkflowName('');
                  setLocalError(null);
                }}
                data-testid="workflow-modal-create-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold text-sm transition-colors"
              >
                <Plus size={16} />
                Create New Workflow
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
