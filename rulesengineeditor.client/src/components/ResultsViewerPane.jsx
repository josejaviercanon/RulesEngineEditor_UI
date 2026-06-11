import { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, XCircle, Code, ListTree } from 'lucide-react';
import Editor from '@monaco-editor/react';

const RuleNode = ({ node }) => {
  const [expanded, setExpanded] = useState(true);
  const isSuccess = node.IsSuccess === true || node.IsSuccess === "True" || node.isSuccess === true;
  const hasChildren = node.ChildResults && node.ChildResults.length > 0;
  const exceptionMessage = node.ExceptionMessage || node.exceptionMessage;

  return (
    <div className="ml-4 border-l border-slate-700/50 pl-2 py-1">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50 p-1 rounded"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="w-4 flex justify-center text-slate-500">
          {hasChildren ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
        </span>
        {isSuccess ? (
          <CheckCircle2 size={14} className="text-lime-500" />
        ) : (
          <XCircle size={14} className="text-red-500" />
        )}
        <span className={`font-mono text-sm ${isSuccess ? 'text-slate-200' : 'text-red-300'}`}>
          {node.Rule?.RuleName || node.Rule?.ruleName || "Rule"}
        </span>
        {exceptionMessage && (
          <span className="text-xs text-red-400 ml-2 bg-red-500/10 px-2 py-0.5 rounded truncate max-w-xs">
            {exceptionMessage}
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div className="mt-1">
          {node.ChildResults.map((child, idx) => (
            <RuleNode key={idx} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ResultsViewerPane({ testResult, isMockMode, onlineMode }) {
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'json'

  // Handle both backend EvaluationResult shape and local simulation shape
  const resultTree = testResult?.ruleResultTree || testResult?.RuleResultTree || (Array.isArray(testResult) ? testResult : null);
  const overallSuccess = testResult?.isSuccess ?? testResult?.IsSuccess ?? null;
  const errorMessage = testResult?.errorMessage || testResult?.ErrorMessage || null;
  const hasError = !!errorMessage;

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Execution Results</h2>
          {isMockMode && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
              {onlineMode ? 'Sandbox Mode (Server Simulator)' : 'Sandbox Mode (Local Simulator)'}
            </span>
          )}
          {overallSuccess !== null && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              overallSuccess 
                ? 'bg-lime-500/20 text-lime-400 border-lime-500/30' 
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {overallSuccess ? 'Overall Success' : 'Overall Failed'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-slate-950 rounded border border-slate-700 p-0.5">
          <button 
            onClick={() => setViewMode('tree')}
            className={`p-1 rounded ${viewMode === 'tree' ? 'bg-slate-800 text-lime-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Tree View"
          >
            <ListTree size={14} />
          </button>
          <button 
            onClick={() => setViewMode('json')}
            className={`p-1 rounded ${viewMode === 'json' ? 'bg-slate-800 text-lime-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Raw JSON View"
          >
            <Code size={14} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-start gap-2">
            <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">Evaluation Error</p>
              <p className="text-xs text-red-300 mt-1 font-mono">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto p-4">
        {!testResult ? (
          <div className="flex items-center justify-center h-full text-slate-600 italic text-sm">
            Run a dry-run to see execution results here.
          </div>
        ) : viewMode === 'tree' ? (
          <div className="text-slate-300">
            {hasError ? (
              <div className="text-slate-500 italic text-sm">
                Fix the error above to see results.
              </div>
            ) : resultTree ? (
              Array.isArray(resultTree) ? resultTree.map((res, idx) => (
                <RuleNode key={idx} node={res} />
              )) : (
                <RuleNode node={resultTree} />
              )
            ) : (
              <div className="text-slate-500 italic text-sm">
                No result tree available.
              </div>
            )}
          </div>
        ) : (
          <div className="h-full -m-4">
            <Editor
              height="100%"
              defaultLanguage="json"
              theme="vs-dark"
              value={JSON.stringify(testResult, null, 2)}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                wordWrap: 'on'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
