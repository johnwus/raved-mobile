declare module 'node-cron' {
  interface Task {
    start(): void;
    stop(): void;
    destroy(): void;
    validate(expression: string): boolean;
  }

  interface Scheduler {
    schedule(expression: string, fn: () => void, options?: any): Task;
    validate(expression: string): boolean;
  }

  const cron: Scheduler;
  export default cron;
}
