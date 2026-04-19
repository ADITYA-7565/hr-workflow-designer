import type { ApprovalNodeConfig } from "../types/workflowTypes";

type ApprovalFormProps = {
  config: ApprovalNodeConfig;
  onChange: (nextConfig: ApprovalNodeConfig) => void;
};

export function ApprovalForm({ config, onChange }: ApprovalFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Title</label>
        <input
          value={config.title}
          onChange={(event) => onChange({ ...config, title: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Approval title"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Approver Role</label>
        <input
          value={config.approverRole}
          onChange={(event) => onChange({ ...config, approverRole: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="HR_DIRECTOR"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Threshold</label>
        <input
          type="number"
          min={1}
          value={config.threshold}
          onChange={(event) => onChange({ ...config, threshold: Number(event.target.value) || 1 })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
