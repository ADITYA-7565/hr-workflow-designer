import type { StartNodeConfig } from "../types/workflowTypes";

type StartFormProps = {
  config: StartNodeConfig;
  onChange: (nextConfig: StartNodeConfig) => void;
};

export function StartForm({ config, onChange }: StartFormProps) {
  const hasTitleError = config.title.trim().length === 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Title</label>
        <input
          value={config.title}
          onChange={(event) => onChange({ ...config, title: event.target.value })}
          className={`w-full rounded-md border px-3 py-2 text-sm ${
            hasTitleError ? "border-red-400" : "border-slate-300"
          }`}
          placeholder="Workflow start title"
        />
        {hasTitleError ? <p className="mt-1 text-xs text-red-600">Title is required.</p> : null}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Metadata</label>
          <button
            type="button"
            onClick={() => onChange({ ...config, metadata: [...config.metadata, { key: "", value: "" }] })}
            className="text-xs font-medium text-blue-600 hover:text-blue-500"
          >
            + Add Pair
          </button>
        </div>
        <div className="space-y-2">
          {config.metadata.map((item, index) => (
            <div key={`${index}-${item.key}`} className="grid grid-cols-2 gap-2">
              <input
                value={item.key}
                onChange={(event) =>
                  onChange({
                    ...config,
                    metadata: config.metadata.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, key: event.target.value } : entry,
                    ),
                  })
                }
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                placeholder="key"
              />
              <div className="flex gap-1">
                <input
                  value={item.value}
                  onChange={(event) =>
                    onChange({
                      ...config,
                      metadata: config.metadata.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, value: event.target.value } : entry,
                      ),
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  placeholder="value"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...config,
                      metadata: config.metadata.filter((_, entryIndex) => entryIndex !== index),
                    })
                  }
                  className="rounded-md border border-slate-300 px-2 text-xs text-slate-600"
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
