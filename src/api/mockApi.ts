import type { AutomationDefinition, ExecutionLog, Workflow } from "../types/workflowTypes";
import { runWorkflowEngine } from "../utils/workflowEngine";

type SimulateOptions = {
  failRate?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
};

const DEFAULT_MIN_DELAY_MS = 150;
const DEFAULT_MAX_DELAY_MS = 450;

const automationDefinitions: AutomationDefinition[] = [
  { id: "send_email", params: ["to", "subject"] },
  { id: "generate_doc", params: ["template", "recipient"] },
];

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const randomDelay = (minDelayMs: number, maxDelayMs: number): number =>
  Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;

const withTimestamp = (message: string, level: ExecutionLog["level"], nodeId?: string): ExecutionLog => ({
  timestamp: new Date().toISOString(),
  nodeId,
  message,
  level,
});

const maybeFail = (failRate = 0): void => {
  if (failRate <= 0) {
    return;
  }

  if (Math.random() < failRate) {
    throw new Error("Mock API failure: simulated network error.");
  }
};

export const mockApi = {
  async getAutomations(options?: SimulateOptions): Promise<AutomationDefinition[]> {
    const minDelayMs = options?.minDelayMs ?? DEFAULT_MIN_DELAY_MS;
    const maxDelayMs = options?.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;

    await sleep(randomDelay(minDelayMs, maxDelayMs));
    maybeFail(options?.failRate ?? 0);

    return automationDefinitions;
  },

  async simulateWorkflow(workflow: Workflow, options?: SimulateOptions): Promise<ExecutionLog[]> {
    const minDelayMs = options?.minDelayMs ?? DEFAULT_MIN_DELAY_MS;
    const maxDelayMs = options?.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
    const failRate = options?.failRate ?? 0;
    await sleep(randomDelay(minDelayMs, maxDelayMs));
    maybeFail(failRate);
    const engineLogs = runWorkflowEngine(workflow);

    const timestampedLogs: ExecutionLog[] = [];
    for (const entry of engineLogs) {
      await sleep(randomDelay(minDelayMs, maxDelayMs));
      maybeFail(failRate);
      timestampedLogs.push(withTimestamp(entry.message, entry.level, entry.nodeId));
    }

    return timestampedLogs;
  },
};
