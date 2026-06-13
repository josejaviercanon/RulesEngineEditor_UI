import { Plus, Trash2, CheckCircle2, XCircle, AlertCircle, Bot, User } from 'lucide-react';

export default function AssertionTable({ assertions, testResult, dispatch }) {
  
  const handleAdd = () => {
    dispatch({ 
      type: 'ADD_ASSERTION', 
      payload: { id: Date.now().toString(), path: '', expectedValue: '', active: true, source: 'manual' } 
    });
  };

  const handleUpdate = (id, field, value) => {
    dispatch({ type: 'UPDATE_ASSERTION', payload: { id, updates: { [field]: value } } });
  };

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE_ASSERTION', payload: id });
  };

  // Helper to convert a string to PascalCase and camelCase variants
  const toPascalCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const toCamelCase = (str) => str.charAt(0).toLowerCase() + str.slice(1);

  // Try to resolve a key against an object, trying original, PascalCase, and camelCase
  const resolveKey = (obj, key) => {
    if (obj === undefined || obj === null) return undefined;
    // Try exact key first
    if (key in obj) return obj[key];
    // Try PascalCase variant
    const pascal = toPascalCase(key);
    if (pascal !== key && pascal in obj) return obj[pascal];
    // Try camelCase variant
    const camel = toCamelCase(key);
    if (camel !== key && camel in obj) return obj[camel];
    return undefined;
  };

  // Helper to extract value by path from the result object
  const evaluatePath = (obj, path) => {
    if (!obj || !path) return undefined;
    try {
      // If the path starts with an array index like [0], auto-unwrap ruleResultTree
      let root = obj;
      let effectivePath = path;

      if (/^\[/.test(path)) {
        // Path starts with array index — try to unwrap ruleResultTree/RuleResultTree
        const tree = resolveKey(obj, 'ruleResultTree');
        if (tree !== undefined) {
          root = tree;
        }
      }

      // Convert [N] notation to dot notation, then split
      const keys = effectivePath.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
      let current = root;
      for (let key of keys) {
        if (current === undefined || current === null) return undefined;
        // Try numeric index for arrays
        if (Array.isArray(current) && !isNaN(key)) {
          current = current[Number(key)];
        } else {
          current = resolveKey(current, key);
        }
      }
      return current;
    } catch {
      return undefined;
    }
  };

  // Calculate overall scenario validation status
  let overallStatus = null; // null = no assertions, 'pass' = all pass, 'fail' = some fail
  if (testResult && assertions.length > 0) {
    const allPassed = assertions.every(a => {
      if (!a.path || !a.active) return true;
      const actual = evaluatePath(testResult, a.path);
      return String(actual) === String(a.expectedValue);
    });
    overallStatus = allPassed ? 'pass' : 'fail';
  }

  return (
    <div data-testid="assertion-table" className="flex flex-col bg-slate-950 border-t border-slate-800 h-64">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-200">Expected Values (Assertions)</h2>
          {overallStatus && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              overallStatus === 'pass'
                ? 'bg-lime-500/20 text-lime-400 border-lime-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {overallStatus === 'pass' ? 'Scenario Passed' : 'Scenario Failed'}
            </span>
          )}
        </div>
        <button onClick={handleAdd} data-testid="add-assertion-btn" className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300">
          <Plus size={14} /> Add Assertion
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-500 uppercase bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="px-3 py-2 font-medium">Source</th>
              <th className="px-3 py-2 font-medium">Path (e.g. [0].IsSuccess)</th>
              <th className="px-3 py-2 font-medium">Expected Value</th>
              <th className="px-3 py-2 font-medium">Actual Value</th>
              <th className="px-3 py-2 font-medium text-center">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {assertions.map(a => {
              // Calculate status if we have a testResult
              let actual = undefined;
              let isMatch = false;
              let evaluated = false;
              
              if (testResult && a.path) {
                evaluated = true;
                actual = evaluatePath(testResult, a.path);
                // Simple string comparison for now
                isMatch = String(actual) === String(a.expectedValue);
              }

              return (
                <tr key={a.id} className={`border-b border-slate-800/50 hover:bg-slate-900/50 ${
                  a.source === 'auto' ? 'bg-slate-900/30' : ''
                }`}>
                  <td className="px-3 py-2">
                    {a.source === 'auto' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Bot size={10} />
                        Auto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-400 border border-slate-600">
                        <User size={10} />
                        Manual
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="text" 
                      value={a.path}
                      onChange={(e) => handleUpdate(a.id, 'path', e.target.value)}
                      placeholder="[0].IsSuccess"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-lime-500 transition-colors"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="text" 
                      value={a.expectedValue}
                      onChange={(e) => handleUpdate(a.id, 'expectedValue', e.target.value)}
                      placeholder="true"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-lime-500 transition-colors"
                    />
                  </td>
                  <td className="px-3 py-2 text-slate-400 font-mono text-xs" data-testid={`assertion-actual-${a.id}`}>
                    {evaluated ? (actual !== undefined ? String(actual) : <span className="text-slate-600">undefined</span>) : '-'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {!evaluated ? (
                       <AlertCircle size={16} className="text-slate-600 mx-auto" />
                    ) : isMatch ? (
                      <CheckCircle2 size={16} className="text-lime-500 mx-auto" />
                    ) : (
                      <XCircle size={16} className="text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => handleRemove(a.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {assertions.length === 0 && (
              <tr>
                <td colSpan="6" className="px-3 py-6 text-center text-slate-600 italic">
                  No assertions defined. Add one to test your workflow execution.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
