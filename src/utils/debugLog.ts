import { Settings } from "../types/types";

/**
 * Outputs a debug log message to the console if debugLogs is enabled in settings.
 * Optionally accepts extra arguments.
 */
export function debugLog(
  settings: Settings | undefined,
  functionName: string,
  ...args: any[]
): void {
  if (settings?.debugLogs) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] 🔍 ${functionName}()`;
    console.log(message, ...args);
  }
}
