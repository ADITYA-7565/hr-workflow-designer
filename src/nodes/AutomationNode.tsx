import { Handle, Position, type NodeProps } from "reactflow";

import type { AutomationNodeConfig } from "../types/workflowTypes";

type AutomationNodeData = {
  config: AutomationNodeConfig;
  isInvalid: boolean;
};

export function AutomationNode({ data, selected }: NodeProps<AutomationNodeData>) {
  return (
    <div
      className={`min-w-48 rounded-xl border bg-gradient-to-br from-purple-50 to-violet-100 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
        data.isInvalid
          ? "border-red-400 shadow-red-200"
          : selected
            ? "border-purple-500 shadow-purple-200 scale-105"
            : "border-white/50"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-purple-400 !border-purple-300" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-400 !border-purple-300" />
      <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Automation</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{data.config.title || "Untitled automation"}</p>
      <p className="mt-1 text-xs text-slate-600">
        {data.config.actionId ? `Action: ${data.config.actionId}` : "Action not selected"}
      </p>
    </div>
  );
}
