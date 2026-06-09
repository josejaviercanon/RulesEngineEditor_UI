import { Plus, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function AssertionTable({ assertions, testResult, dispatch }) {
  
  const handleAdd = () => {
    dispatch({ 
      type: 'ADD_ASSERTION', 
      payload: { id: Date.now().toString(), path: '', expectedValue: '', active: true } 
    });
  };

  const handleUpdate = (id, field, value) => {
    dispatch({ type: 'UPDATE_ASSERTION', payload: { id, updates: { [field]: value } } });
  };

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE_ASSERTION', payload: id });
  };

  // Helper to extract value by path from the result object
  const evaluatePath = (obj, path) => {
    if (!obj || !path) return undefined;
    try {
      // Very basic path evaluation for demo (e.g., "[0].IsSuccess" or "0.IsSuccess")
      const keys = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
      let current = obj;
      for (let key of keys) {
        if (current === undefined || current === null) return undefined;
        current = current[key];
      }
      return current;
    } catch (e) {
      return undefined;
    }
  };

  return (
    <div className="flex flex-col bg-slate-950 border-t border-slate-800 h-64">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-200">Expected Values (Assertions)</h2>
        <button onClick={handleAdd} className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300">
          <Plus size={14} /> Add Assertion
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-500 uppercase bg-slate-900 border-b border-slate-800">
            <tr>
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
                <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
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
                  <td className="px-3 py-2 text-slate-400 font-mono text-xs">
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
                <td colSpan="5" className="px-3 py-6 text-center text-slate-600 italic">
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
