import { useMemo, useState } from "react";

import { mockApi } from "../../api/mockApi";
import { useWorkflowStore } from "../../store/workflowStore";
import type { ExecutionLog, Workflow } from "../../types/workflowTypes";

const levelStyles: Record<ExecutionLog["level"], string> = {
  info: "text-white/80",
  warning: "text-yellow-300",
  error: "text-red-300",
};

export function Sandbox() {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const workflow = useMemo<Workflow>(
    () => ({
      nodes,
      edges,
    }),
    [nodes, edges],
  );

  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setRunError(null);

    try {
      const executionLogs = await mockApi.simulateWorkflow(workflow);
      setLogs(executionLogs);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown API error occurred.";
      setRunError(message);
      setLogs([]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-gradient-to-r from-slate-950/90 via-violet-950/80 to-indigo-950/90 p-6 text-white shadow-2xl ring-1 ring-white/10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Sandbox</h2>
          <p className="text-xs text-slate-300">Execute and inspect workflow logs</p>
        </div>
        <button
          type="button"
          onClick={handleRunWorkflow}
          disabled={isRunning}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "Running..." : "Run Workflow"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-white/15 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/30 backdrop-blur-sm">
        {runError ? <p className="text-sm text-red-300">{runError}</p> : null}
        {!runError && logs.length === 0 ? (
          <p className="text-sm text-white/60">Run workflow to view execution logs.</p>
        ) : null}
        <ul className="space-y-2">
          {logs.map((entry, index) => (
            <li key={`${entry.timestamp}-${index}`} className={`text-xs font-mono ${levelStyles[entry.level]}`}>
              <span className="text-white/50">[{new Date(entry.timestamp).toLocaleTimeString()}]</span> {entry.message}
              {entry.nodeId ? <span className="text-white/40"> ({entry.nodeId})</span> : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
