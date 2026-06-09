import { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, XCircle, Code, ListTree } from 'lucide-react';
import Editor from '@monaco-editor/react';

const RuleNode = ({ node }) => {
  const [expanded, setExpanded] = useState(true);
  const isSuccess = node.IsSuccess === true || node.IsSuccess === "True";
  const hasChildren = node.ChildResults && node.ChildResults.length > 0;

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
        <span className="font-mono text-sm text-slate-200">
          {node.Rule?.RuleName || "Rule"}
        </span>
        {!isSuccess && node.ExceptionMessage && (
          <span className="text-xs text-red-400 ml-2 bg-red-500/10 px-2 py-0.5 rounded truncate max-w-xs">
            {node.ExceptionMessage}
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

export default function ResultsViewerPane({ testResult, isMockMode }) {
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'json'

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Execution Results</h2>
          {isMockMode && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
              Sandbox Mode (Local Simulator)
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
      <div className="flex-1 min-h-0 overflow-auto p-4">
        {!testResult ? (
          <div className="flex items-center justify-center h-full text-slate-600 italic text-sm">
            Run a dry-run to see execution results here.
          </div>
        ) : viewMode === 'tree' ? (
          <div className="text-slate-300">
            {Array.isArray(testResult) ? testResult.map((res, idx) => (
              <RuleNode key={idx} node={res} />
            )) : (
              <RuleNode node={testResult} />
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
