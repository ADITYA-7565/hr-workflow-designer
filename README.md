# HR Workflow Designer

A modern, glassmorphism-styled frontend prototype for visually designing, validating, and simulating HR workflows with drag-and-drop functionality.

## Demo Preview

> Replace these placeholder paths with your real screenshots/GIFs (for example in `docs/media/`).

### Workflow Builder GIF

![Workflow Builder Demo](docs/media/workflow-builder-demo.gif)

### UI Snapshots

![Canvas Overview](docs/media/canvas%20overview.png)
![Node Config Panel](docs/media/Task%20node%20config.png)
![Simulation Logs](docs/media/simulation%20logs.png)

## Objective

This app allows an HR admin to:
- Build workflows via drag-and-drop nodes with a modern glassmorphism UI
- Configure node behavior with dynamic forms
- Connect nodes into a workflow graph
- Validate workflow structure and required fields
- Simulate workflow execution and inspect step-by-step logs
- Save and load workflow templates for reuse
- Export/import workflows as JSON

## Tech Stack

- `React` + `Vite`
- `TypeScript` (strict mode)
- `React Flow` (visual workflow canvas)
- `Zustand` (state management)
- `Tailwind CSS` (glassmorphism UI styling)
- `UUID` (node ids)
- Mock API layer (local async simulation)

## Project Structure

```text
src/
├── api/
│   └── mockApi.ts
├── components/
│   ├── Canvas/
│   ├── NodePanel/
│   ├── Sandbox/
│   └── Sidebar/
├── forms/
│   ├── ApprovalForm.tsx
│   ├── AutomationForm.tsx
│   ├── EndForm.tsx
│   ├── StartForm.tsx
│   └── TaskForm.tsx
├── nodes/
│   ├── ApprovalNode.tsx
│   ├── AutomationNode.tsx
│   ├── EndNode.tsx
│   ├── StartNode.tsx
│   └── TaskNode.tsx
├── store/
│   └── workflowStore.ts
├── types/
│   └── workflowTypes.ts
└── utils/
    ├── validators.ts
    └── workflowEngine.ts
```

## Architecture

- **UI Layer**
  - `Sidebar`: draggable node library + import/export + undo/redo controls
  - `WorkflowCanvas`: React Flow graph editor
  - `NodePanel`: node-type-aware dynamic configuration forms
  - `Sandbox`: simulation trigger and execution log viewer

- **State Layer (`Zustand`)**
  - Central store for `nodes`, `edges`, `selectedNodeId`
  - Graph mutation actions (`add`, `connect`, `delete`, `update`)
  - Guardrails (single Start node, no self-loops, no duplicate edges)
  - History stacks for `undo/redo`

- **Domain/Logic Layer**
  - `workflowEngine.ts`: graph validation, cycle detection, traversal, execution logs
  - `validators.ts`: UI-focused rules and invalid-node highlighting signals

- **API Layer**
  - `mockApi.ts`: async mock endpoints for automations and workflow simulation
  - Adds configurable delay and optional failure simulation

## Key Design Decisions

- **Modern Glassmorphism UI** with backdrop blur, gradients, and glass-like panels for a contemporary look
- **Discriminated workflow node types** with per-node config contracts for predictable forms
- **Store-centric state** to keep canvas, forms, and sandbox synchronized
- **Validation split**:
  - engine-level validation for execution correctness
  - UI-level validation for real-time visual feedback
- **Template system** for saving and reusing common workflow patterns
- **Async simulation logs** to mimic real API behavior and improve realism
- **Optional productivity features** (`undo/redo`, import/export, templates) included for iteration speed

## Validation Rules Implemented

- Exactly one Start node (engine)
- At least one End node (engine)
- Broken edge references detected (engine)
- Cycle detection via DFS (engine)
- Disconnected nodes from Start (engine)
- Nodes must be able to reach an End node (engine + UI rule layer)
- Required field checks per node type (engine + UI rule layer)
- Invalid nodes highlighted with red border on canvas (UI)

## Getting Started

### Prerequisites
- Node.js `v20+` recommended

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

## How to Use

1. Drag nodes from the left panel into the canvas.
2. Connect nodes by dragging handles between them.
3. Select a node to configure it in the right panel.
4. Use **Validate Workflow** to check for structural issues and required fields.
5. Use **Run Workflow** in Sandbox to simulate execution.
6. Review ordered logs at the bottom panel.
7. Save frequently used workflows as templates for quick reuse.
8. Optionally use:
   - **Undo / Redo**
   - **Save as Template** / **Load Template**
   - **Export Workflow JSON**
   - **Import Workflow JSON**

## Assumptions

- This is a prototype focused on frontend architecture; no real backend/database.
- Automation options are mocked and finite.
- Node config validation is intentionally lightweight and extendable.
- Workflow execution is simulated and non-persistent across browser refresh.

## Limitations

- No authentication/authorization layer.
- No multi-user collaboration.
- No server persistence/versioning of workflows.
- No comprehensive schema validation for imported JSON beyond shape checks.
- No automated test suite included yet.

## Future Improvements

- Add `React Hook Form` + `Zod` for stronger schema-driven form validation
- Add keyboard shortcuts (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`) for undo/redo
- Add run history panel to track workflow executions with timestamps
- Add node grouping/subflows and richer branching semantics
- Add test coverage (unit tests for engine/validators, component integration tests)
- Add richer simulation modes (conditional branches, delays per node, retries)
- Add GitHub integration for template sharing and collaboration
