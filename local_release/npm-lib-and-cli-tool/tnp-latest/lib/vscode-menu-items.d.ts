import type { Project } from './project/abstract/project';
import type { activateMenuTnp } from './vscode-ext-menu';
export declare const vscodeMenuItems: ({ vscode, FRAMEWORK_NAME, CURRENT_PROJECT, ProjectItem, focustFirstElement, runInTerminal, tmp_FRONTEND_NORMAL_APP_PORT, tmp_FRONTEND_WEBSQL_APP_PORT, skipTaonItems, }: {
    vscode: typeof import("vscode");
    FRAMEWORK_NAME: string;
    CURRENT_PROJECT: Project | undefined;
    ProjectItem: ReturnType<typeof activateMenuTnp>;
    focustFirstElement: () => void;
    runInTerminal: (command: string, inNewTerminal?: boolean) => void;
    tmp_FRONTEND_NORMAL_APP_PORT: string;
    tmp_FRONTEND_WEBSQL_APP_PORT: string;
    skipTaonItems?: boolean;
}) => {
    readonly clickLink: string | undefined;
    readonly project?: Project;
    readonly clickLinkFn?: (project: Project | undefined) => string;
    readonly refreshLinkOnClick?: boolean;
    readonly triggerActionOnClick?: (project?: Project, progres?: import("vscode").Progress<{
        message?: string;
        increment?: number;
    }>, token?: import("vscode").CancellationToken) => Promise<any> | void;
    readonly processTitle?: string;
    readonly progressLocation: import("vscode").ProgressLocation;
    readonly label: string;
    readonly collapsibleState: import("vscode").TreeItemCollapsibleState;
    id?: string;
    iconPath?: string | import("vscode").IconPath;
    description?: string | boolean;
    resourceUri?: import("vscode").Uri;
    tooltip?: string | import("vscode").MarkdownString | undefined;
    command?: import("vscode").Command;
    contextValue?: string;
    accessibilityInformation?: import("vscode").AccessibilityInformation;
    checkboxState?: import("vscode").TreeItemCheckboxState | {
        readonly state: import("vscode").TreeItemCheckboxState;
        readonly tooltip?: string;
        readonly accessibilityInformation?: import("vscode").AccessibilityInformation;
    };
}[];
