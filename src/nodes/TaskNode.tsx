import { Handle, Position, type NodeProps } from "reactflow";

import type { TaskNodeConfig } from "../types/workflowTypes";

type TaskNodeData = {
  config: TaskNodeConfig;
  isInvalid: boolean;
};

export function TaskNode({ data, selected }: NodeProps<TaskNodeData>) {
  return (
    <div
      className={`min-w-48 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-100 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
        data.isInvalid
          ? "border-red-400 shadow-red-200"
          : selected
            ? "border-indigo-500 shadow-indigo-200 scale-105"
            : "border-white/50"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-400 !border-blue-300" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-400 !border-blue-300" />
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Task</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{data.config.title || "Untitled task"}</p>
      <p className="mt-1 text-xs text-slate-600">{data.config.assignee ? `Assignee: ${data.config.assignee}` : "No assignee"}</p>
    </div>
  );
}
