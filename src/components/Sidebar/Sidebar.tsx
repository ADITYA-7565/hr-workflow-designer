import { useState } from "react";
import { NodeType } from "../../types/workflowTypes";
import type { Workflow } from "../../types/workflowTypes";
import { useWorkflowStore } from "../../store/workflowStore";
import { validateWorkflowRules } from "../../utils/validators";

const draggableNodeTypes: Array<{ type: NodeType; label: string }> = [
  { type: NodeType.START, label: "Start" },
  { type: NodeType.TASK, label: "Task" },
  { type: NodeType.APPROVAL, label: "Approval" },
  { type: NodeType.AUTOMATION, label: "Automation" },
  { type: NodeType.END, label: "End" },
];

const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeType: NodeType): void => {
  event.dataTransfer.setData("application/hrflow-node-type", nodeType);
  event.dataTransfer.effectAllowed = "move";
};

type Template = {
  name: string;
  workflow: Workflow;
};

const TEMPLATES_KEY = "hrflow-templates";

export function Sidebar() {
  const [validationIssues, setValidationIssues] = useState<readonly { message: string; nodeId?: string }[]>([]);
  const [validationRun, setValidationRun] = useState(false);
  const [templates, setTemplates] = useState<Template[]>(() => {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const { nodes, edges, past, future, undo, redo, exportWorkflow, importWorkflow } = useWorkflowStore();

  const saveTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(newTemplates));
  };

  const handleSaveTemplate = () => {
    const name = window.prompt("Enter template name:");
    if (!name || name.trim() === "") {
      return;
    }
    const workflow = exportWorkflow();
    const newTemplate: Template = { name: name.trim(), workflow };
    const existingIndex = templates.findIndex((t) => t.name === newTemplate.name);
    if (existingIndex >= 0) {
      if (!window.confirm(`Template "${newTemplate.name}" already exists. Overwrite?`)) {
        return;
      }
      const updated = [...templates];
      updated[existingIndex] = newTemplate;
      saveTemplates(updated);
    } else {
      saveTemplates([...templates, newTemplate]);
    }
  };

  const handleLoadTemplate = () => {
    const template = templates.find((t) => t.name === selectedTemplate);
    if (!template) {
      return;
    }
    importWorkflow(template.workflow);
    setSelectedTemplate("");
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) {
      return;
    }
    if (!window.confirm(`Delete template "${selectedTemplate}"?`)) {
      return;
    }
    const updated = templates.filter((t) => t.name !== selectedTemplate);
    saveTemplates(updated);
    setSelectedTemplate("");
  };

  const handleExport = () => {
    const workflow = exportWorkflow();
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workflow.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<Workflow>;
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error("Invalid workflow JSON shape.");
      }
      importWorkflow({
        nodes: parsed.nodes,
        edges: parsed.edges,
      });
    } catch {
      window.alert("Could not import workflow. Please use a valid workflow JSON file.");
    } finally {
      event.target.value = "";
    }
  };

  const handleValidate = () => {
    const issues = validateWorkflowRules({ nodes, edges });
    setValidationIssues(issues.map((issue) => ({ message: issue.message, nodeId: issue.nodeId })));
    setValidationRun(true);
  };

  return (
    <aside className="w-64 rounded-2xl bg-white/30 backdrop-blur-md p-6 shadow-lg border border-white/20">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-600">Node Library</h2>
      <p className="mb-6 text-xs text-slate-500">Drag a node to the canvas</p>
      <div className="space-y-3">
        {draggableNodeTypes.map((node) => (
          <button
            key={node.type}
            type="button"
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 ${
              node.type === NodeType.START
                ? "bg-gradient-to-r from-green-400 to-teal-500 shadow-green-200"
                : node.type === NodeType.TASK
                ? "bg-gradient-to-r from-blue-400 to-indigo-500 shadow-blue-200"
                : node.type === NodeType.APPROVAL
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-yellow-200"
                : node.type === NodeType.AUTOMATION
                ? "bg-gradient-to-r from-purple-400 to-violet-500 shadow-purple-200"
                : "bg-gradient-to-r from-red-400 to-pink-500 shadow-red-200"
            }`}
          >
            {node.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-3 border-t border-white/30 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={undo}
            disabled={past.length === 0}
            className="rounded-xl border border-white/40 bg-white/20 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            className="rounded-xl border border-white/40 bg-white/20 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Redo
          </button>
        </div>

        <button
          type="button"
          onClick={handleValidate}
          className="w-full rounded-xl border border-white/40 bg-white/20 px-4 py-3 text-left text-xs font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/30"
        >
          Validate Workflow
        </button>

        <button
          type="button"
          onClick={handleExport}
          className="w-full rounded-xl border border-white/40 bg-white/20 px-4 py-3 text-left text-xs font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/30"
        >
          Export Workflow JSON
        </button>

        <label className="block cursor-pointer rounded-xl border border-white/40 bg-white/20 px-4 py-3 text-xs font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/30">
          Import Workflow JSON
          <input type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
        </label>

        <button
          type="button"
          onClick={handleSaveTemplate}
          className="w-full rounded-xl border border-white/40 bg-white/20 px-4 py-3 text-left text-xs font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/30"
        >
          Save as Template
        </button>

        {templates.length > 0 ? (
          <div className="space-y-2">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full rounded-xl border border-white/40 bg-white/20 px-3 py-2 text-xs text-slate-700 backdrop-blur-sm"
            >
              <option value="">Select template...</option>
              {templates.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLoadTemplate}
                disabled={!selectedTemplate}
                className="rounded-xl border border-white/40 bg-white/20 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Load
              </button>
              <button
                type="button"
                onClick={handleDeleteTemplate}
                disabled={!selectedTemplate}
                className="rounded-xl border border-white/40 bg-red-200/20 px-3 py-2 text-xs font-semibold text-red-700 backdrop-blur-sm transition-all duration-200 hover:bg-red-200/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        ) : null}

        {validationRun ? (
          <div className="rounded-xl border border-white/20 bg-slate-50/80 p-3 text-xs text-slate-700">
            {validationIssues.length === 0 ? (
              <p className="font-semibold text-slate-900">Workflow is valid.</p>
            ) : (
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Validation issues</p>
                <ul className="space-y-1">
                  {validationIssues.map((issue, index) => (
                    <li key={`${issue.nodeId ?? index}-${index}`}>
                      <span className="font-semibold">{issue.message}</span>
                      {issue.nodeId ? <span className="ml-1 text-slate-500">({issue.nodeId})</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
