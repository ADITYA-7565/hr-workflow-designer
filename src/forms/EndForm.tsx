import type { EndNodeConfig } from "../types/workflowTypes";

type EndFormProps = {
  config: EndNodeConfig;
  onChange: (nextConfig: EndNodeConfig) => void;
};

export function EndForm({ config, onChange }: EndFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Message</label>
        <textarea
          rows={3}
          value={config.message}
          onChange={(event) => onChange({ ...config, message: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Workflow completion message"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={config.showSummary}
          onChange={(event) => onChange({ ...config, showSummary: event.target.checked })}
        />
        Show summary on completion
      </label>
    </div>
  );
}
