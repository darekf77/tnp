import { crossPlatformPath, fse, path } from 'tnp-core/lib-prod';
export function handleTaonRedirect(context, vscode) {
    //#region not stable definition changes
    // const inProgress = new Set<string>();
    // vscode.languages.registerDefinitionProvider(['typescript', 'javascript'], {
    //   async provideDefinition(document, position) {
    //     const key = `${document.uri.toString()}:${position.line}:${position.character}`;
    //     if (inProgress.has(key)) return;
    //     inProgress.add(key);
    //     try {
    //       const defs = await vscode.commands.executeCommand<
    //         Location[] | LocationLink[]
    //       >('vscode.executeDefinitionProvider', document.uri, position);
    //       if (!defs || defs.length === 0) return;
    //       const mapped: Location[] = [];
    //       const seen = new Set<string>();
    //       for (const def of defs) {
    //         const uri = 'uri' in def ? def.uri : def.targetUri;
    //         const range = 'range' in def ? def.range : def.targetSelectionRange;
    //         const originalPath = crossPlatformPath(uri.fsPath);
    //         let finalPath: string | null = null;
    //         const match = originalPath.match(
    //           /\/node_modules\/((?:@[^\/]+\/)?[^\/]+)\/source\//,
    //         );
    //         if (match) {
    //           // 🔥 map to real source
    //           const [projPath, relative] = originalPath.split(match[0]);
    //           let fullPathToSource = crossPlatformPath([projPath, match[0]]);
    //           try {
    //             fullPathToSource = crossPlatformPath(
    //               fse.realpathSync(fullPathToSource),
    //             );
    //           } catch {
    //             continue;
    //           }
    //           finalPath = crossPlatformPath([fullPathToSource, relative]);
    //         } else {
    //           // ❌ skip EVERYTHING from node_modules
    //           if (originalPath.includes('/node_modules/')) {
    //             continue;
    //           }
    //           // ✅ allow project files
    //           finalPath = originalPath;
    //         }
    //         if (!finalPath) continue;
    //         const dedupeKey = `${finalPath}:${range.start.line}:${range.start.character}`;
    //         if (seen.has(dedupeKey)) continue;
    //         seen.add(dedupeKey);
    //         mapped.push(new vscode.Location(vscode.Uri.file(finalPath), range));
    //         // TODO QUICK _FIX
    //         // setTimeout(async () => {
    //         //   const doc = await vscode.workspace.openTextDocument(finalPath);
    //         //   await vscode.window.showTextDocument(doc, {
    //         //     selection: range,
    //         //   });
    //         // }, 0);
    //         // return [];
    //       }
    //       // 🔥 CRITICAL: if we mapped anything → RETURN ONLY mapped
    //       if (mapped.length > 0) {
    //         const items = mapped.map(loc => ({
    //           label: vscode.workspace.asRelativePath(loc.uri.fsPath),
    //           description: `Line ${loc.range.start.line + 1}`,
    //           location: loc,
    //         }));
    //         const selected = await vscode.window.showQuickPick(items, {
    //           placeHolder: 'Select definition (mapped source)',
    //         });
    //         if (selected) {
    //           const doc = await vscode.workspace.openTextDocument(
    //             selected.location.uri,
    //           );
    //           await vscode.window.showTextDocument(doc, {
    //             selection: selected.location.range,
    //           });
    //         }
    //         // console.log({ mapped, mappedLength: mapped.length });
    //         // TODO IT DISPLAY ALSO NOT NEED source node_modules even when not in mapped
    //         return mapped;
    //       }
    //       // fallback only if nothing matched
    //       // console.log({ defs: mapped.length });
    //       return defs;
    //     } finally {
    //       inProgress.delete(key);
    //     }
    //   },
    // });
    //#endregion
    //#region when hitting debugger in wrong file => change it
    // const mapNodeModulesToSrc = (originalPath: string) => {
    //   const match = originalPath.match(
    //     /\/node_modules\/((?:@[^\/]+\/)?[^\/]+)\/source\//,
    //   );
    //   if (match) {
    //     // /node_modules/taon/source/ zero
    //     const [porjPath, relative] = originalPath.split(match[0]);
    //     let fullPathToSource = crossPlatformPath([porjPath, match[0]]);
    //     try {
    //       fullPathToSource = crossPlatformPath(
    //         fse.realpathSync(fullPathToSource),
    //       );
    //     } catch (error) {
    //       // console.log('failed to read symlink');
    //       return;
    //     }
    //     const properRedirectLink = crossPlatformPath([
    //       fullPathToSource,
    //       relative,
    //     ]);
    //     return properRedirectLink;
    //   }
    //   return originalPath;
    // };
    // vscode.debug.onDidChangeBreakpoints(async session => {
    //   const allTabs: vscode.Tab[] = vscode.window.tabGroups.all.flatMap(
    //     group => group.tabs,
    //   );
    //   for (const tab of allTabs) {
    //     if (!(tab.input instanceof vscode.TabInputText)) continue;
    //     const originalPath = crossPlatformPath(tab.input.uri.fsPath);
    //     const mapped = mapNodeModulesToSrc(originalPath);
    //     if (mapped && mapped !== originalPath) {
    //       const doc = await vscode.workspace.openTextDocument(mapped);
    //       // 🔥 close original tab
    //       await vscode.window.tabGroups.close(tab);
    //       await vscode.window.showTextDocument(doc, {
    //         preview: false,
    //       });
    //     }
    //   }
    // });
    //#endregion
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (!editor) {
            return;
        }
        const document = editor.document;
        let originalPath = crossPlatformPath(document.uri.fsPath);
        // ❌ ignore preview editors
        if (editor.viewColumn === undefined) {
            console.log('viewColumn undefined');
            return;
        }
        const match2 = originalPath.match(/\/node_modules\/((?:@[^\/]+\/)?[^\/]+)\/src\.d\.ts/);
        if (match2) {
            const toRep = crossPlatformPath(path.dirname(match2[0]));
            const [porjPath] = originalPath.split(toRep);
            // console.log({ match2, porjPath, toRep });
            if (await fse.exists(crossPlatformPath([porjPath, toRep, 'source']))) {
                originalPath = crossPlatformPath([porjPath, toRep, 'source/index.ts']);
            }
        }
        // else {
        //   return; // TODO REDIRECT AUTOMATICALLY ONLY src.d.ts
        // }
        const match = originalPath.match(/\/node_modules\/((?:@[^\/]+\/)?[^\/]+)\/source\//);
        if (match) {
            // /node_modules/taon/source/ zero
            const [porjPath, relative] = originalPath.split(match[0]);
            let fullPathToSource = crossPlatformPath([porjPath, match[0]]);
            try {
                fullPathToSource = crossPlatformPath(fse.realpathSync(fullPathToSource));
            }
            catch (error) {
                // console.log('failed to read symlink');
                return;
            }
            const properRedirectLink = crossPlatformPath([
                fullPathToSource,
                relative,
            ]);
            if (properRedirectLink === originalPath) {
                return;
            }
            setTimeout(async () => {
                // console.log({ porjPath, relative, fullPathToSource });
                const uri = vscode.Uri.file(properRedirectLink);
                try {
                    const doc = await vscode.workspace.openTextDocument(uri);
                    const selection = editor.selection;
                    await vscode.window.showTextDocument(doc, {
                        preview: false,
                        selection,
                    });
                    vscode.window.setStatusBarMessage(`[${match[1]}] Redirected to proper source.`, 3000);
                    // close original editor
                    const editors = vscode.window.visibleTextEditors;
                    const originalEditor = editors.find(e => e.document.uri.fsPath === originalPath);
                    if (originalEditor) {
                        await vscode.window.showTextDocument(document);
                        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                    }
                    const tabGroups = vscode.window.tabGroups.all;
                    for (const group of tabGroups) {
                        for (const tab of group.tabs) {
                            if (tab.input instanceof vscode.TabInputText &&
                                tab.input.uri.fsPath === document.uri.fsPath) {
                                await vscode.window.tabGroups.close(tab);
                                return;
                            }
                        }
                    }
                }
                catch (err) {
                    console.error('Redirect failed:', err);
                }
            }, 500);
        }
    });
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/vscode-handle-taon-redirect.js.map