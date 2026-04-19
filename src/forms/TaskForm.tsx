import type { TaskNodeConfig } from "../types/workflowTypes";

type TaskFormProps = {
  config: TaskNodeConfig;
  onChange: (nextConfig: TaskNodeConfig) => void;
};

export function TaskForm({ config, onChange }: TaskFormProps) {
  const hasTitleError = config.title.trim().length === 0;

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-600">Title *</label>
        <input
          value={config.title}
          onChange={(event) => onChange({ ...config, title: event.target.value })}
          className={`w-full rounded-lg border px-4 py-3 text-sm bg-white/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-indigo-400 ${
            hasTitleError ? "border-red-400" : "border-white/40"
          }`}
          placeholder="Task title"
        />
        {hasTitleError ? <p className="mt-2 text-xs text-red-400">Title is required.</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-600">Description</label>
        <textarea
          value={config.description}
          onChange={(event) => onChange({ ...config, description: event.target.value })}
          className="w-full rounded-lg border border-white/40 bg-white/50 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-600">Assignee</label>
          <input
            value={config.assignee}
            onChange={(event) => onChange({ ...config, assignee: event.target.value })}
            className="w-full rounded-lg border border-white/40 bg-white/50 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
            placeholder="HR_MANAGER"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-600">Due Date</label>
          <input
            type="date"
            value={config.dueDate}
            onChange={(event) => onChange({ ...config, dueDate: event.target.value })}
            className="w-full rounded-lg border border-white/40 bg-white/50 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">Custom Fields</label>
          <button
            type="button"
            onClick={() => onChange({ ...config, customFields: [...config.customFields, { key: "", value: "" }] })}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
          >
            + Add Field
          </button>
        </div>
        <div className="space-y-3">
          {config.customFields.map((item, index) => (
            <div key={`${index}-${item.key}`} className="grid grid-cols-2 gap-3">
              <input
                value={item.key}
                onChange={(event) =>
                  onChange({
                    ...config,
                    customFields: config.customFields.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, key: event.target.value } : entry,
                    ),
                  })
                }
                className="rounded-lg border border-white/40 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
                placeholder="field"
              />
              <div className="flex gap-2">
                <input
                  value={item.value}
                  onChange={(event) =>
                    onChange({
                      ...config,
                      customFields: config.customFields.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, value: event.target.value } : entry,
                      ),
                    })
                  }
                  className="w-full rounded-lg border border-white/40 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
                  placeholder="value"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...config,
                      customFields: config.customFields.filter((_, entryIndex) => entryIndex !== index),
                    })
                  }
                  className="rounded-lg border border-white/40 bg-white/50 px-3 py-2 text-xs text-slate-600 backdrop-blur-sm transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
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
