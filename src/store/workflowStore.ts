import { create } from "zustand";
import type { Connection } from "reactflow";

import {
  NodeType,
  type Workflow,
  type WorkflowEdge,
  type WorkflowNode,
} from "../types/workflowTypes";

type NodeId = WorkflowNode["id"];

type WorkflowState = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: NodeId | null;
  past: Workflow[];
  future: Workflow[];
  addNode: (node: WorkflowNode) => void;
  updateNodeConfig: (nodeId: NodeId, config: WorkflowNode["config"]) => void;
  deleteNode: (nodeId: NodeId) => void;
  connectNodes: (connection: Connection) => void;
  deleteEdge: (edgeId: string) => void;
  updateNodePosition: (nodeId: NodeId, position: { x: number; y: number }) => void;
  setSelectedNode: (nodeId: NodeId | null) => void;
  exportWorkflow: () => Workflow;
  importWorkflow: (workflow: Workflow) => void;
  undo: () => void;
  redo: () => void;
};

const createEdgeId = (source: string, target: string): string => `${source}=>${target}`;

const hasStartNode = (nodes: WorkflowNode[]): boolean =>
  nodes.some((node) => node.type === NodeType.START);

const snapshot = (nodes: WorkflowNode[], edges: WorkflowEdge[]): Workflow => ({ nodes, edges });

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  past: [],
  future: [],

  addNode: (node) =>
    set((state) => {
      if (node.type === NodeType.START && hasStartNode(state.nodes)) {
        return state;
      }

      if (state.nodes.some((existingNode) => existingNode.id === node.id)) {
        return state;
      }

      return {
        ...state,
        past: [...state.past, snapshot(state.nodes, state.edges)],
        future: [],
        nodes: [...state.nodes, node],
      };
    }),

  updateNodeConfig: (nodeId, config) =>
    set((state) => {
      const nextNodes = state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              config,
            }
          : node,
      );

      return {
        ...state,
        past: [...state.past, snapshot(state.nodes, state.edges)],
        future: [],
        nodes: nextNodes,
      };
    }),

  deleteNode: (nodeId) =>
    set((state) => ({
      ...state,
      past: [...state.past, snapshot(state.nodes, state.edges)],
      future: [],
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    })),

  connectNodes: ({ source, target }) =>
    set((state) => {
      if (!source || !target) {
        return state;
      }

      if (source === target) {
        return state;
      }

      const sourceExists = state.nodes.some((node) => node.id === source);
      const targetExists = state.nodes.some((node) => node.id === target);
      if (!sourceExists || !targetExists) {
        return state;
      }

      const edgeId = createEdgeId(source, target);
      const hasDuplicateEdge = state.edges.some(
        (edge) => edge.id === edgeId || (edge.source === source && edge.target === target),
      );
      if (hasDuplicateEdge) {
        return state;
      }

      return {
        ...state,
        past: [...state.past, snapshot(state.nodes, state.edges)],
        future: [],
        edges: [
          ...state.edges,
          {
            id: edgeId,
            source,
            target,
          },
        ],
      };
    }),

  deleteEdge: (edgeId) =>
    set((state) => ({
      ...state,
      past: [...state.past, snapshot(state.nodes, state.edges)],
      future: [],
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    })),

  updateNodePosition: (nodeId, position) =>
    set((state) => {
      const currentNode = state.nodes.find((node) => node.id === nodeId);
      if (!currentNode) {
        return state;
      }
      if (currentNode.position.x === position.x && currentNode.position.y === position.y) {
        return state;
      }

      return {
        ...state,
        past: [...state.past, snapshot(state.nodes, state.edges)],
        future: [],
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                position,
              }
            : node,
        ),
      };
    }),

  setSelectedNode: (nodeId) =>
    set((state) => ({
      ...state,
      selectedNodeId: nodeId,
    })),

  exportWorkflow: (): Workflow => {
    const state = get();
    return snapshot(state.nodes, state.edges);
  },

  importWorkflow: (workflow) =>
    set((state) => ({
      ...state,
      past: [...state.past, snapshot(state.nodes, state.edges)],
      future: [],
      nodes: workflow.nodes,
      edges: workflow.edges,
      selectedNodeId: null,
    })),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) {
        return state;
      }

      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        past: state.past.slice(0, -1),
        future: [snapshot(state.nodes, state.edges), ...state.future],
        nodes: previous.nodes,
        edges: previous.edges,
        selectedNodeId: null,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) {
        return state;
      }

      const [next, ...rest] = state.future;
      return {
        ...state,
        past: [...state.past, snapshot(state.nodes, state.edges)],
        future: rest,
        nodes: next.nodes,
        edges: next.edges,
        selectedNodeId: null,
      };
    }),
}));
