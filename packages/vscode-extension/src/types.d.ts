declare module '@alex-ai/universal-extension' {
  export function createVSCodeExtension(vscode: any): {
    core: {
      initialize(): Promise<void>;
      processMessage(message: string): Promise<{ success: boolean; coordinatedResponse: string; message?: string }>;
    };
    commands: Record<string, unknown>;
  };
}
