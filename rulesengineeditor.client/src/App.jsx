import { useEffect } from 'react';
import { useRulesState } from './hooks/useRulesReducer';
import { rulesApi } from './services/apiClient';

import Sidebar from './components/Sidebar';
import RulesEditorPane from './components/RulesEditorPane';
import FactsEditorPane from './components/FactsEditorPane';
import ResultsViewerPane from './components/ResultsViewerPane';
import AssertionTable from './components/AssertionTable';

export default function App() {
  const { state, dispatch } = useRulesState();

  const handleDryRun = async () => {
    // Send raw JSON strings to the backend (or fallback simulation)
    const result = await rulesApi.dryRun(
      state.currentRules,
      state.currentFacts,
      JSON.stringify(state.settings)
    );
    dispatch({ type: 'SET_TEST_RESULT', payload: result });
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar state={state} dispatch={dispatch} onDryRun={handleDryRun} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Top Header/Toolbar */}
        <div className="h-14 border-b border-slate-800 bg-slate-950 flex items-center px-6 justify-between shrink-0">
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">Phase 1.0 JSON-First Editor</h1>
            <p className="text-xs text-slate-400">RulesEngine Evaluation Service</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Validation Mode:</span>
              <select 
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none focus:border-lime-500"
                value={state.settings.ValidationMode}
                onChange={(e) => dispatch({ type: 'SET_SETTINGS', payload: { ValidationMode: e.target.value }})}
              >
                <option value="Default">Default</option>
                <option value="ThrowOnFirstError">Throw On First Error</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={state.settings.EnableScopedParams}
                  onChange={(e) => dispatch({ type: 'SET_SETTINGS', payload: { EnableScopedParams: e.target.checked }})}
                  className="accent-lime-500"
                />
                <span className="text-slate-400">Scoped Params</span>
              </label>
            </div>
          </div>
        </div>

        {/* Three Pane Layout */}
        <div className="flex-1 flex min-h-0">
          <div className="w-1/3 min-w-[300px]">
            <RulesEditorPane 
              value={state.currentRules} 
              onChange={(val) => dispatch({ type: 'SET_RULES', payload: val })} 
            />
          </div>
          <div className="w-1/3 min-w-[300px]">
            <FactsEditorPane 
              value={state.currentFacts} 
              onChange={(val) => dispatch({ type: 'SET_FACTS', payload: val })} 
            />
          </div>
          <div className="w-1/3 min-w-[300px]">
            <ResultsViewerPane 
              testResult={state.testResult} 
              isMockMode={state.isMockMode}
            />
          </div>
        </div>

        {/* Bottom Assertion Table */}
        <AssertionTable 
          assertions={state.assertions} 
          testResult={state.testResult} 
          dispatch={dispatch} 
        />

      </div>
    </div>
  );
}
