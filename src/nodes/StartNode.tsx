import { Handle, Position, type NodeProps } from "reactflow";

import type { StartNodeConfig } from "../types/workflowTypes";

type StartNodeData = {
  config: StartNodeConfig;
  isInvalid: boolean;
};

export function StartNode({ data, selected }: NodeProps<StartNodeData>) {
  return (
    <div
      className={`min-w-44 rounded-xl border bg-gradient-to-br from-green-50 to-teal-100 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
        data.isInvalid
          ? "border-red-400 shadow-red-200"
          : selected
            ? "border-green-500 shadow-green-200 scale-105"
            : "border-white/50"
      }`}
    >
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-green-400 !border-green-300" />
      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Start</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{data.config.title || "Untitled start"}</p>
      <p className="mt-1 text-xs text-slate-600">Metadata entries: {data.config.metadata.length}</p>
    </div>
  );
}
