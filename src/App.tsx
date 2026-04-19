import "reactflow/dist/style.css";

import { WorkflowCanvas } from "./components/Canvas/WorkflowCanvas";
import { NodePanel } from "./components/NodePanel/NodePanel";
import { Sandbox } from "./components/Sandbox/Sandbox";
import { Sidebar } from "./components/Sidebar/Sidebar";

function App() {
  return (
    <main className="grid min-h-screen grid-rows-[minmax(0,1fr)_280px] gap-4 p-4">
      <section className="grid min-h-0 grid-cols-[280px_minmax(0,1fr)_320px] gap-4">
        <Sidebar />
        <section className="rounded-2xl bg-white/30 backdrop-blur-md shadow-lg border border-white/20 overflow-hidden">
          <WorkflowCanvas />
        </section>
        <NodePanel />
      </section>
      <section className="rounded-2xl bg-white/30 backdrop-blur-md shadow-lg border border-white/20 overflow-hidden">
        <Sandbox />
      </section>
    </main>
  );
}

export default App;
