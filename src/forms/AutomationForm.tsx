import type { AutomationNodeConfig } from "../types/workflowTypes";

type AutomationOption = {
  id: string;
  params: string[];
};

type AutomationFormProps = {
  config: AutomationNodeConfig;
  onChange: (nextConfig: AutomationNodeConfig) => void;
};

const automationOptions: AutomationOption[] = [
  { id: "send_email", params: ["to", "subject"] },
  { id: "generate_doc", params: ["template", "recipient"] },
];

export function AutomationForm({ config, onChange }: AutomationFormProps) {
  const selectedAutomation = automationOptions.find((option) => option.id === config.actionId);
  const requiredParams = selectedAutomation?.params ?? [];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Title</label>
        <input
          value={config.title}
          onChange={(event) => onChange({ ...config, title: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Automation title"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Action</label>
        <select
          value={config.actionId}
          onChange={(event) => {
            const nextActionId = event.target.value;
            const paramsForAction = automationOptions.find((option) => option.id === nextActionId)?.params ?? [];
            const nextParams = paramsForAction.reduce<Record<string, string>>((accumulator, key) => {
              accumulator[key] = config.params[key] ?? "";
              return accumulator;
            }, {});

            onChange({
              ...config,
              actionId: nextActionId,
              params: nextParams,
            });
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Select action</option>
          {automationOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.id}
            </option>
          ))}
        </select>
      </div>

      {requiredParams.length > 0 ? (
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Parameters</label>
          <div className="space-y-2">
            {requiredParams.map((paramKey) => (
              <input
                key={paramKey}
                value={config.params[paramKey] ?? ""}
                onChange={(event) =>
                  onChange({
                    ...config,
                    params: {
                      ...config.params,
                      [paramKey]: event.target.value,
                    },
                  })
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder={paramKey}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
