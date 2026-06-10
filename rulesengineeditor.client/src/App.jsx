import { useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { useRulesState } from './hooks/useRulesReducer';
import { rulesApi } from './services/apiClient';
import { LogOut, User, Shield, KeyRound } from 'lucide-react';

import Sidebar from './components/Sidebar';
import RulesEditorPane from './components/RulesEditorPane';
import FactsEditorPane from './components/FactsEditorPane';
import ResultsViewerPane from './components/ResultsViewerPane';
import AssertionTable from './components/AssertionTable';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

// Editor Layout Component (the original app content)
function EditorLayout() {
  const { state, dispatch } = useRulesState();
  const { user, logout, isDevAutoLogin, registerPasskey } = useAuth();
  const navigate = useNavigate();

  const parsedSettings = useMemo(() => {
    try { return JSON.parse(state.currentSettings); } catch { return {}; }
  }, [state.currentSettings]);

  const handleDryRun = async () => {
    const result = await rulesApi.dryRun(
      state.currentRules,
      state.currentFacts,
      state.currentSettings
    );
    dispatch({ type: 'SET_TEST_RESULT', payload: result });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRegisterPasskey = async () => {
    const result = await registerPasskey();
    if (result.success) {
      alert('Passkey registered successfully!');
    } else {
      alert(result.error || 'Passkey registration failed');
    }
  };

  // Check if user has Administrator role
  const isAdmin = user?.roles?.includes('Administrator') || false;

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
          
          <div className="flex items-center gap-4">
            {/* Settings Controls */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Validation Mode:</span>
                <select 
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none focus:border-lime-500"
                  value={parsedSettings.ValidationMode || 'Default'}
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
                    checked={parsedSettings.EnableScopedParams ?? true}
                    onChange={(e) => dispatch({ type: 'SET_SETTINGS', payload: { EnableScopedParams: e.target.checked }})}
                    className="accent-lime-500"
                  />
                  <span className="text-slate-400">Scoped Params</span>
                </label>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              {isDevAutoLogin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-lime-500/10 text-lime-400 border border-lime-500/20">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
              
              {user && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300">{user.email}</span>
                </div>
              )}

              {/* Admin-only Register Passkey */}
              {isAdmin && (
                <button
                  onClick={handleRegisterPasskey}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Register Passkey (Admin Only)"
                >
                  <KeyRound className="w-3 h-3" />
                  Register Passkey
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
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
              currentSettings={state.currentSettings}
              onSettingsChange={(val) => dispatch({ type: 'SET_SETTINGS_JSON', payload: val })}
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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <EditorLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
