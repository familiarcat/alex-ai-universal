import * as vscode from 'vscode';

export type ProviderId = 'openai' | 'anthropic' | 'local';

export class ProviderTreeItem extends vscode.TreeItem {
  constructor(public readonly id: ProviderId, public readonly label: string, public readonly connected: boolean) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = connected ? 'connected' : 'disconnected';
    this.description = connected ? 'Connected' : 'Not connected';
  }
}

export class ProviderTree implements vscode.TreeDataProvider<ProviderTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ProviderTreeItem | undefined | null | void> = new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<ProviderTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private secrets: vscode.SecretStorage) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ProviderTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  async getChildren(): Promise<ProviderTreeItem[]> {
    const providers: ProviderId[] = ['openai', 'anthropic', 'local'];
    const items: ProviderTreeItem[] = [];
    for (const p of providers) {
      const key = `alexai.${p}.key`;
      const v = await this.secrets.get(key);
      items.push(new ProviderTreeItem(p, p.toUpperCase(), !!v));
    }
    return items;
  }
}
