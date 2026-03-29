import type * as vscode from 'vscode';
import { Project } from './project/abstract/project';
type TriggerActionFn = (project?: Project, progres?: vscode.Progress<{
    message?: string;
    increment?: number;
}>, token?: vscode.CancellationToken) => Promise<any> | void;
export declare function activateMenuTnp(context: vscode.ExtensionContext, vscode: typeof import('vscode'), FRAMEWORK_NAME: string): {
    new (label: string, collapsibleState: vscode.TreeItemCollapsibleState, options?: {
        project?: Project;
        clickLinkFn?: (project: Project) => string;
        refreshLinkOnClick?: boolean;
        triggerActionOnClick?: TriggerActionFn;
        processTitle?: string;
        progressLocation?: vscode.ProgressLocation;
        boldLabel?: boolean;
        iconPath?: null | string | vscode.ThemeIcon | vscode.Uri | {
            light: string | vscode.Uri;
            dark: string | vscode.Uri;
        };
    }): {
        readonly clickLink: string | undefined;
        readonly project?: Project;
        readonly clickLinkFn?: (project: Project | undefined) => string;
        readonly refreshLinkOnClick?: boolean;
        readonly triggerActionOnClick?: TriggerActionFn;
        readonly processTitle?: string;
        readonly progressLocation: vscode.ProgressLocation;
        readonly label: string;
        readonly collapsibleState: vscode.TreeItemCollapsibleState;
        id?: string;
        iconPath?: string | vscode.IconPath;
        description?: string | boolean;
        resourceUri?: vscode.Uri;
        tooltip?: string | vscode.MarkdownString | undefined;
        command?: vscode.Command;
        contextValue?: string;
        accessibilityInformation?: vscode.AccessibilityInformation;
        checkboxState?: vscode.TreeItemCheckboxState | {
            readonly state: vscode.TreeItemCheckboxState;
            readonly tooltip?: string;
            readonly accessibilityInformation?: vscode.AccessibilityInformation;
        };
    };
};
export declare function deactivateMenuTnp(): void;
export {};
