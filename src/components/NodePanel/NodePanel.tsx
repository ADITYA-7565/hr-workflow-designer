import { ApprovalForm } from "../../forms/ApprovalForm";
import { AutomationForm } from "../../forms/AutomationForm";
import { EndForm } from "../../forms/EndForm";
import { StartForm } from "../../forms/StartForm";
import { TaskForm } from "../../forms/TaskForm";
import { useWorkflowStore } from "../../store/workflowStore";
import {
  NodeType,
  type ApprovalNodeConfig,
  type AutomationNodeConfig,
  type EndNodeConfig,
  type StartNodeConfig,
  type TaskNodeConfig,
} from "../../types/workflowTypes";

export function NodePanel() {
  const { nodes, selectedNodeId, updateNodeConfig } = useWorkflowStore();
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-80 rounded-2xl bg-white/30 backdrop-blur-md p-6 shadow-lg border border-white/20">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Node Config</h2>
        <p className="mt-2 text-xs text-slate-500">Select a node to configure its properties.</p>
        <div className="mt-6 rounded-xl border border-dashed border-white/40 bg-white/20 p-6 text-xs text-slate-500 backdrop-blur-sm">
          Node settings will appear here.
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 overflow-y-auto rounded-2xl bg-white/30 backdrop-blur-md p-6 shadow-lg border border-white/20">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Node Config</h2>
      <p className="mt-2 inline-flex rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
        {selectedNode.type}
      </p>

      <div className="mt-4">
        {selectedNode.type === NodeType.START ? (
          <StartForm
            config={selectedNode.config as StartNodeConfig}
            onChange={(config) => updateNodeConfig(selectedNode.id, config)}
          />
        ) : null}
        {selectedNode.type === NodeType.TASK ? (
          <TaskForm
            config={selectedNode.config as TaskNodeConfig}
            onChange={(config) => updateNodeConfig(selectedNode.id, config)}
          />
        ) : null}
        {selectedNode.type === NodeType.APPROVAL ? (
          <ApprovalForm
            config={selectedNode.config as ApprovalNodeConfig}
            onChange={(config) => updateNodeConfig(selectedNode.id, config)}
          />
        ) : null}
        {selectedNode.type === NodeType.AUTOMATION ? (
          <AutomationForm
            config={selectedNode.config as AutomationNodeConfig}
            onChange={(config) => updateNodeConfig(selectedNode.id, config)}
          />
        ) : null}
        {selectedNode.type === NodeType.END ? (
          <EndForm
            config={selectedNode.config as EndNodeConfig}
            onChange={(config) => updateNodeConfig(selectedNode.id, config)}
          />
        ) : null}
      </div>
    </aside>
  );
}
