import { NodeType, type Workflow } from "../types/workflowTypes";

export type ValidationIssueCode =
  | "START_NOT_FIRST"
  | "ORPHAN_NODE"
  | "NO_PATH_TO_END"
  | "MISSING_REQUIRED_FIELD";

export type ValidationIssue = {
  code: ValidationIssueCode;
  message: string;
  nodeId?: string;
};

const hasRequiredFields = (workflow: Workflow, nodeId: string): boolean => {
  const node = workflow.nodes.find((item) => item.id === nodeId);
  if (!node) {
    return false;
  }

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

const buildAdjacency = (workflow: Workflow): Map<string, string[]> => {
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

const buildReverseAdjacency = (workflow: Workflow): Map<string, string[]> => {
  const reverse = new Map<string, string[]>();
  workflow.nodes.forEach((node) => reverse.set(node.id, []));

  workflow.edges.forEach((edge) => {
    if (!reverse.has(edge.source) || !reverse.has(edge.target)) {
      return;
    }
    reverse.get(edge.target)?.push(edge.source);
  });

  return reverse;
};

export const validateWorkflowRules = (workflow: Workflow): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (workflow.nodes.length === 0) {
    return issues;
  }

  const startNodes = workflow.nodes.filter((node) => node.type === NodeType.START);
  const endNodes = workflow.nodes.filter((node) => node.type === NodeType.END);
  const adjacency = buildAdjacency(workflow);
  const reverseAdjacency = buildReverseAdjacency(workflow);

  if (startNodes.length === 1) {
    const startNodeId = startNodes[0].id;
    const inboundCount = reverseAdjacency.get(startNodeId)?.length ?? 0;
    if (inboundCount > 0) {
      issues.push({
        code: "START_NOT_FIRST",
        message: "Start node must be first (no incoming edges).",
        nodeId: startNodeId,
      });
    }
  }

  workflow.nodes.forEach((node) => {
    if (node.type !== NodeType.START && node.type !== NodeType.END) {
      const inbound = reverseAdjacency.get(node.id)?.length ?? 0;
      const outbound = adjacency.get(node.id)?.length ?? 0;
      if (inbound === 0 && outbound === 0) {
        issues.push({
          code: "ORPHAN_NODE",
          message: "Node is orphaned (no incoming or outgoing edges).",
          nodeId: node.id,
        });
      }
    }

    if (!hasRequiredFields(workflow, node.id)) {
      issues.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "Node is missing required fields.",
        nodeId: node.id,
      });
    }
  });

  const endNodeIds = new Set(endNodes.map((node) => node.id));
  workflow.nodes.forEach((node) => {
    const stack = [node.id];
    const visited = new Set<string>();
    let reachesEnd = false;

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current)) {
        continue;
      }
      if (endNodeIds.has(current)) {
        reachesEnd = true;
        break;
      }
      visited.add(current);
      (adjacency.get(current) ?? []).forEach((nextId) => stack.push(nextId));
    }

    if (!reachesEnd) {
      issues.push({
        code: "NO_PATH_TO_END",
        message: "Node does not connect to an End node.",
        nodeId: node.id,
      });
    }
  });

  return issues;
};

export const getInvalidNodeIds = (workflow: Workflow): Set<string> =>
  new Set(validateWorkflowRules(workflow).flatMap((issue) => (issue.nodeId ? [issue.nodeId] : [])));
