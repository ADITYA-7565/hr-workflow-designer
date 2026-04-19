import { useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type NodeTypes,
} from "reactflow";
import { v4 as uuidv4 } from "uuid";

import { useWorkflowStore } from "../../store/workflowStore";
import { NodeType, type NodeConfigMap, type Workflow } from "../../types/workflowTypes";
import { getInvalidNodeIds } from "../../utils/validators";
import { ApprovalNode } from "../../nodes/ApprovalNode";
import { AutomationNode } from "../../nodes/AutomationNode";
import { EndNode } from "../../nodes/EndNode";
import { StartNode } from "../../nodes/StartNode";
import { TaskNode } from "../../nodes/TaskNode";

type CanvasNodeData = {
  config: NodeConfigMap[NodeType];
  isInvalid: boolean;
};

const defaultConfigs: NodeConfigMap = {
  [NodeType.START]: { title: "Start", metadata: [] },
  [NodeType.TASK]: {
    title: "Task",
    description: "",
    assignee: "",
    dueDate: "",
    customFields: [],
  },
  [NodeType.APPROVAL]: {
    title: "Approval",
    approverRole: "",
    threshold: 1,
  },
  [NodeType.AUTOMATION]: {
    title: "Automation",
    actionId: "",
    params: {},
  },
  [NodeType.END]: {
    message: "Workflow completed.",
    showSummary: true,
  },
};

const nodeTypeMap: Record<NodeType, string> = {
  [NodeType.START]: "startNode",
  [NodeType.TASK]: "taskNode",
  [NodeType.APPROVAL]: "approvalNode",
  [NodeType.AUTOMATION]: "automationNode",
  [NodeType.END]: "endNode",
};

const nodeTypes: NodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  automationNode: AutomationNode,
  endNode: EndNode,
};

function WorkflowCanvasInner() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const reactFlow = useReactFlow();
  const { nodes, edges, selectedNodeId, addNode, connectNodes, deleteNode, deleteEdge, setSelectedNode, updateNodePosition } =
    useWorkflowStore();
  const workflow = useMemo<Workflow>(() => ({ nodes, edges }), [nodes, edges]);
  const invalidNodeIds = useMemo(() => getInvalidNodeIds(workflow), [workflow]);

  const getMiniMapNodeColor = (node: Node<CanvasNodeData>): string => {
    const workflowNode = nodes.find((n) => n.id === node.id);
    if (!workflowNode) return "#e5e7eb";

    switch (workflowNode.type) {
      case NodeType.START:
        return "#20c997";
      case NodeType.TASK:
        return "#4f46e5";
      case NodeType.APPROVAL:
        return "#f59e0b";
      case NodeType.AUTOMATION:
        return "#a855f7";
      case NodeType.END:
        return "#ef4444";
      default:
        return "#e5e7eb";
    }
  };

  const rfNodes: Node<CanvasNodeData>[] = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: nodeTypeMap[node.type],
        position: node.position,
        data: {
          config: node.config,
          isInvalid: invalidNodeIds.has(node.id),
        },
        selected: selectedNodeId === node.id,
      })),
    [nodes, selectedNodeId, invalidNodeIds],
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: false,
      })),
    [edges],
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node<CanvasNodeData>) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition],
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    for (const change of changes) {
      if (change.type === "remove") {
        deleteNode(change.id);
      }
    }
  }, [deleteNode]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/hrflow-node-type") as NodeType;
      if (!nodeType || !Object.values(NodeType).includes(nodeType)) {
        return;
      }

      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (!bounds) {
        return;
      }

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const nodeId = uuidv4();
      addNode({
        id: nodeId,
        type: nodeType,
        config: defaultConfigs[nodeType],
        position,
      });
    },
    [addNode, reactFlow],
  );

  const onConnect = connectNodes;

  const isValidConnection = useCallback(
    (connection: Connection) => {
      // Prevent self-loops
      if (connection.source === connection.target) {
        return false;
      }

      // Prevent duplicate connections
      const isDuplicate = rfEdges.some(
        (edge) =>
          (edge.source === connection.source && edge.target === connection.target) ||
          edge.id === `${connection.source}=>${connection.target}`,
      );
      if (isDuplicate) {
        return false;
      }

      return true;
    },
    [rfEdges],
  );

  return (
    <div ref={wrapperRef} className="h-full w-full" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        fitView
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        onEdgesDelete={(deletedEdges) => deletedEdges.forEach((edge) => deleteEdge(edge.id))}
        defaultEdgeOptions={{ markerEnd: undefined }}
        deleteKeyCode={["Delete", "Backspace"]}
      >
        <Background gap={20} size={1} color="#dbe2ea" />
        <Controls />
        <MiniMap
          pannable
          zoomable
          nodeColor={getMiniMapNodeColor}
          maskColor="rgba(255, 255, 255, 0.35)"
          className="!rounded-xl !bg-white/40 !backdrop-blur-md !border-white/20 !shadow-lg"
          style={{
            right: 16,
            bottom: 16,
            padding: 8,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.42)",
            boxShadow: "0 24px 80px rgba(15,23,42,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
