import { Handle, Position, type NodeProps } from "reactflow";

import type { ApprovalNodeConfig } from "../types/workflowTypes";

type ApprovalNodeData = {
  config: ApprovalNodeConfig;
  isInvalid: boolean;
};

export function ApprovalNode({ data, selected }: NodeProps<ApprovalNodeData>) {
  return (
    <div
      className={`min-w-48 rounded-xl border bg-gradient-to-br from-yellow-50 to-orange-100 p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
        data.isInvalid
          ? "border-red-400 shadow-red-200"
          : selected
            ? "border-yellow-500 shadow-yellow-200 scale-105"
            : "border-white/50"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-yellow-400 !border-yellow-300" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-yellow-400 !border-yellow-300" />
      <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">Approval</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{data.config.title || "Untitled approval"}</p>
      <p className="mt-1 text-xs text-slate-600">
        {data.config.approverRole ? `Role: ${data.config.approverRole}` : "Approver role not set"}
      </p>
    </div>
  );
}
