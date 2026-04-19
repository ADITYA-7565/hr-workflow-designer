import { NodeType, type ExecutionLog, type Workflow, type WorkflowNode } from "../types/workflowTypes";

export type WorkflowValidationErrorCode =
  | "EMPTY_WORKFLOW"
  | "INVALID_START_COUNT"
  | "MISSING_END_NODE"
  | "BROKEN_EDGE_REFERENCE"
  | "DISCONNECTED_NODE"
  | "CYCLE_DETECTED"
  | "NO_PATH_TO_END"
  | "INVALID_NODE_CONFIG";

export type WorkflowValidationError = {
  code: WorkflowValidationErrorCode;
  message: string;
  nodeId?: string;
  edgeId?: string;
};

export type WorkflowValidationResult = {
  isValid: boolean;
  errors: WorkflowValidationError[];
};

const log = (message: string, level: ExecutionLog["level"], nodeId?: string): ExecutionLog => ({
  timestamp: new Date().toISOString(),
  message,
  level,
  nodeId,
});

export const buildAdjacencyList = (workflow: Workflow): Map<string, string[]> => {
  const adjacency = new Map<string, string[]>();

  workflow.nodes.forEach((node) => adjacency.set(node.id, []));

  workflow.edges.forEach((edge) => {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) {
      return;
    }
    adjacency.get(edge.source)?.push(edge.target);
  });

  return adjacency;
};

const validateNodeConfig = (node: WorkflowNode): boolean => {
  switch (node.type) {
    case NodeType.START: {
      const config = node.config as { title: string };
      return typeof config.title === "string" && config.title.trim().length > 0;
    }
    case NodeType.TASK: {
      const config = node.config as { title: string };
      return typeof config.title === "string" && config.title.trim().length > 0;
    }
    case NodeType.APPROVAL: {
      const config = node.config as { title: string; threshold: number };
      return (
        typeof config.title === "string" &&
        config.title.trim().length > 0 &&
        typeof config.threshold === "number" &&
        Number.isFinite(config.threshold) &&
        config.threshold >= 1
      );
    }
    case NodeType.AUTOMATION: {
      const config = node.config as { title: string };
      return typeof config.title === "string" && config.title.trim().length > 0;
    }
    case NodeType.END: {
      const config = node.config as { message: string };
      return typeof config.message === "string" && config.message.trim().length > 0;
    }
    default:
      return false;
  }
};

const detectCycle = (adjacency: Map<string, string[]>): boolean => {
  const visited = new Set<string>();
  const activeStack = new Set<string>();

  const visit = (nodeId: string): boolean => {
    if (activeStack.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    activeStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (visit(neighbor)) {
        return true;
      }
    }

    activeStack.delete(nodeId);
    return false;
  };

  for (const nodeId of adjacency.keys()) {
    if (visit(nodeId)) {
      return true;
    }
  }

  return false;
};

const collectReachableNodeIds = (startId: string, adjacency: Map<string, string[]>): Set<string> => {
  const visited = new Set<string>();
  const queue: string[] = [startId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    const neighbors = adjacency.get(current) ?? [];
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    });
  }

  return visited;
};

const canReachAnyEnd = (startId: string, adjacency: Map<string, string[]>, endNodeIds: Set<string>): boolean => {
  const visited = new Set<string>();
  const stack: string[] = [startId];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || visited.has(current)) {
      continue;
    }
    if (endNodeIds.has(current)) {
      return true;
    }
    visited.add(current);

    const neighbors = adjacency.get(current) ?? [];
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    });
  }

  return false;
};

export const validateWorkflow = (workflow: Workflow): WorkflowValidationResult => {
  const errors: WorkflowValidationError[] = [];

  if (workflow.nodes.length === 0) {
    errors.push({
      code: "EMPTY_WORKFLOW",
      message: "Workflow cannot be empty.",
    });
    return { isValid: false, errors };
  }

  const nodeIdSet = new Set(workflow.nodes.map((node) => node.id));
  const startNodes = workflow.nodes.filter((node) => node.type === NodeType.START);
  const endNodes = workflow.nodes.filter((node) => node.type === NodeType.END);

  if (startNodes.length !== 1) {
    errors.push({
      code: "INVALID_START_COUNT",
      message: "Workflow must contain exactly one START node.",
    });
  }

  if (endNodes.length < 1) {
    errors.push({
      code: "MISSING_END_NODE",
      message: "Workflow must contain at least one END node.",
    });
  }

  workflow.edges.forEach((edge) => {
    if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) {
      errors.push({
        code: "BROKEN_EDGE_REFERENCE",
        message: `Edge ${edge.id} references missing node(s).`,
        edgeId: edge.id,
      });
    }
  });

  workflow.nodes.forEach((node) => {
    if (!validateNodeConfig(node)) {
      errors.push({
        code: "INVALID_NODE_CONFIG",
        message: `Node ${node.id} has invalid configuration.`,
        nodeId: node.id,
      });
    }
  });

  if (startNodes.length === 1) {
    const adjacency = buildAdjacencyList(workflow);
    const startNode = startNodes[0];
    const reachable = collectReachableNodeIds(startNode.id, adjacency);

    workflow.nodes.forEach((node) => {
      if (!reachable.has(node.id)) {
        errors.push({
          code: "DISCONNECTED_NODE",
          message: `Node ${node.id} is disconnected from START.`,
          nodeId: node.id,
        });
      }
    });

    if (detectCycle(adjacency)) {
      errors.push({
        code: "CYCLE_DETECTED",
        message: "Workflow contains a cycle.",
      });
    }

    const endNodeIds = new Set(endNodes.map((node) => node.id));
    reachable.forEach((nodeId) => {
      if (!canReachAnyEnd(nodeId, adjacency, endNodeIds)) {
        errors.push({
          code: "NO_PATH_TO_END",
          message: `Node ${nodeId} does not connect to an END node.`,
          nodeId,
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const traverseWorkflow = (workflow: Workflow): string[] => {
  const startNode = workflow.nodes.find((node) => node.type === NodeType.START);
  if (!startNode) {
    return [];
  }

  const adjacency = buildAdjacencyList(workflow);
  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  const orderedNodeIds: string[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId || visited.has(nodeId)) {
      continue;
    }
    visited.add(nodeId);
    orderedNodeIds.push(nodeId);

    const neighbors = adjacency.get(nodeId) ?? [];
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    });
  }

  return orderedNodeIds;
};

export const runWorkflowEngine = (workflow: Workflow): ExecutionLog[] => {
  const validation = validateWorkflow(workflow);
  if (!validation.isValid) {
    const errorLogs: ExecutionLog[] = [log("Workflow validation failed.", "error")];
    validation.errors.forEach((error) => {
      errorLogs.push(log(error.message, "error", error.nodeId));
    });
    return errorLogs;
  }

  const traversalOrder = traverseWorkflow(workflow);
  const logs: ExecutionLog[] = [log("Workflow execution started.", "info")];

  traversalOrder.forEach((nodeId) => {
    const node = workflow.nodes.find((item) => item.id === nodeId);
    if (!node) {
      logs.push(log(`Skipped missing node ${nodeId}.`, "warning", nodeId));
      return;
    }
    logs.push(log(`Executed node ${node.type}.`, "info", nodeId));
  });

  logs.push(log("Workflow execution completed.", "info"));
  return logs;
};
