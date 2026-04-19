import { Handle, Position, type NodeProps } from "reactflow";

import type { EndNodeConfig } from "../types/workflowTypes";

type EndNodeData = {
  config: EndNodeConfig;
  isInvalid: boolean;
};

export function EndNode({ data, selected }: NodeProps<EndNodeData>) {
  return (
    <div
      className={`min-w-44 rounded-xl border bg-gradient-to-br from-red-50 to-pink-100 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
        data.isInvalid
          ? "border-red-400 shadow-red-200"
          : selected
            ? "border-red-500 shadow-red-200 scale-105"
            : "border-white/50"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-red-400 !border-red-300" />
      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">End</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{data.config.message || "Workflow completed."}</p>
      <p className="mt-1 text-xs text-slate-600">{data.config.showSummary ? "Summary enabled" : "Summary disabled"}</p>
    </div>
  );
}
