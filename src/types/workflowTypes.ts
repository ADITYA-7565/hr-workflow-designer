export enum NodeType {
  START = "START",
  TASK = "TASK",
  APPROVAL = "APPROVAL",
  AUTOMATION = "AUTOMATION",
  END = "END",
}

export type MetadataEntry = {
  key: string;
  value: string;
};

export type CustomFieldEntry = {
  key: string;
  value: string;
};

export type StartNodeConfig = {
  title: string;
  metadata: MetadataEntry[];
};

export type TaskNodeConfig = {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: CustomFieldEntry[];
};

export type ApprovalNodeConfig = {
  title: string;
  approverRole: string;
  threshold: number;
};

export type AutomationNodeConfig = {
  title: string;
  actionId: string;
  params: Record<string, string>;
};

export type EndNodeConfig = {
  message: string;
  showSummary: boolean;
};

export type NodeConfigMap = {
  [NodeType.START]: StartNodeConfig;
  [NodeType.TASK]: TaskNodeConfig;
  [NodeType.APPROVAL]: ApprovalNodeConfig;
  [NodeType.AUTOMATION]: AutomationNodeConfig;
  [NodeType.END]: EndNodeConfig;
};

export type WorkflowNode<T extends NodeType = NodeType> = {
  id: string;
  type: T;
  position: {
    x: number;
    y: number;
  };
  config: NodeConfigMap[T];
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
};

export type Workflow = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type NodeData<T extends NodeType = NodeType> = WorkflowNode<T>;

export type AutomationDefinition = {
  id: string;
  params: string[];
};

export type ExecutionLog = {
  timestamp: string;
  nodeId?: string;
  message: string;
  level: "info" | "warning" | "error";
};
