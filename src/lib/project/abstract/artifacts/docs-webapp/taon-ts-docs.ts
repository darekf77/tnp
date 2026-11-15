import {
  IndexData,
  TaonTsDocsDecorator,
  TaonTsDocsGraph,
  TaonTsDocsJsDoc,
  TaonTsDocsMember,
  TaonTsDocsMemberKind,
  TaonTsDocsParameter,
  TaonTsDocsRelationKind,
  TaonTsDocsSignature,
  TaonTsDocsSourceLocation,
  TaonTsDocsSymbol,
  TaonTsDocsSymbolKind,
  TaonTsDocsType,
} from 'taon/src';
import { crossPlatformPath, fse as fs, path } from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';
import {
  Node,
  canHaveDecorators,
  canHaveModifiers,
  CompilerOptions,
  createProgram,
  Diagnostic,
  displayPartsToString,
  findConfigFile,
  flattenDiagnosticMessageText,
  forEachChild,
  getDecorators,
  getModifiers,
  Identifier,
  isCallExpression,
  isClassDeclaration,
  isConstructorDeclaration,
  isEnumDeclaration,
  isFunctionDeclaration,
  isFunctionLike,
  isGetAccessorDeclaration,
  isIdentifier,
  isImportDeclaration,
  isInterfaceDeclaration,
  isMethodDeclaration,
  isMethodSignature,
  isModuleDeclaration,
  isParameter,
  isPropertyDeclaration,
  isPropertySignature,
  isSetAccessorDeclaration,
  isStringLiteral,
  isTypeAliasDeclaration,
  isVariableDeclaration,
  ModuleKind,
  ModuleResolutionKind,
  parseJsonConfigFileContent,
  readConfigFile,
  ScriptTarget,
  SymbolFlags,
  Symbol,
  SyntaxKind,
  sys,
  tokenToString,
  Type,
  TypeFormatFlags,
  TypeReference,
} from 'typescript';

import { generatedDocsFromMd } from '../../../../constants';
import { Project } from '../../project';

// @ts-ignore TODO weird inheritance problem
export class TaonTsDocs extends BaseFeatureForProject<Project> {
  //#region methods / get graph
  getGraph(): TaonTsDocsGraph {
    //#region @backendFunc
    const root = this.project.location;
    const src = crossPlatformPath([root, 'src', 'lib']);

    const excludedPaths = [
      'src/lib/env',
      `src/lib/${generatedDocsFromMd}`,
      'node_modules',
      '.git',
    ];

    const graph: TaonTsDocsGraph = {
      schemaVersion: 1,
      project: { name: path.basename(root), location: '.' },
      files: {},
      symbols: {},
      members: {},
      relations: [],
      exports: [],
      diagnostics: [],
    };

    if (!fs.existsSync(src)) {
      graph.diagnostics.push('Missing src/lib directory');
      return graph;
    }

    const configPath = findConfigFile(root, sys.fileExists, 'tsconfig.json');

    let options: CompilerOptions = {
      target: ScriptTarget.ES2022,
      module: ModuleKind.NodeNext,
      moduleResolution: ModuleResolutionKind.NodeNext,
      skipLibCheck: true,
      experimentalDecorators: true,
    };

    if (configPath) {
      const read = readConfigFile(configPath, sys.readFile);

      if (read.error) {
        graph.diagnostics.push(this.diagnosticText(read.error));
      } else {
        const parsed = parseJsonConfigFileContent(
          read.config,
          sys,
          path.dirname(configPath),
        );

        options = parsed.options;

        graph.diagnostics.push(
          ...parsed.errors.map(d => this.diagnosticText(d)),
        );
      }
    }

    const rootNames = this.discoverTsFiles(src, excludedPaths);

    const program = createProgram({ rootNames, options });
    const checker = program.getTypeChecker();

    const isLocal = (file: string): boolean => {
      const relative = path.relative(src, file);

      return (
        relative !== '' &&
        relative !== '..' &&
        !relative.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relative) &&
        !this.isPathExcluded(file, excludedPaths)
      );
    };

    // Keep the rest of your existing graph extraction logic here.
    const fileId = (file: string) =>
      path.relative(root, file).split(path.sep).join('/');

    const location = (node: Node): TaonTsDocsSourceLocation => {
      const source = node.getSourceFile();
      const position = source.getLineAndCharacterOfPosition(
        node.getStart(source),
      );
      return {
        fileId: fileId(source.fileName),
        line: position.line + 1,
        column: position.character + 1,
      };
    };
    const docs = (symbol: Symbol | undefined): TaonTsDocsJsDoc => ({
      description: symbol
        ? displayPartsToString(symbol.getDocumentationComment(checker))
        : '',
      tags: symbol
        ? symbol.getJsDocTags(checker).map(tag => ({
            name: tag.name,
            text: displayPartsToString(tag.text),
          }))
        : [],
    });
    const modifiers = (node: Node): string[] =>
      canHaveModifiers(node)
        ? (getModifiers(node) ?? [])
            .map(m => tokenToString(m.kind) ?? '')
            .filter(Boolean)
        : [];
    const decorators = (node: Node): TaonTsDocsDecorator[] =>
      canHaveDecorators(node)
        ? (getDecorators(node) ?? []).map(d => ({
            name: isCallExpression(d.expression)
              ? d.expression.expression.getText()
              : d.expression.getText(),
            expression: d.expression.getText(),
          }))
        : [];
    const resolveAlias = (symbol: Symbol): Symbol =>
      symbol.flags & SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;
    const symbolIds = new Map<Symbol, string>();
    const allSymbols = new Map<string, Symbol>();
    const symbolId = (symbol: Symbol | undefined): string | undefined => {
      if (!symbol) return undefined;
      const resolved = resolveAlias(symbol);
      const cached = symbolIds.get(resolved);
      if (cached) return cached;
      const declaration = resolved.declarations?.find(d =>
        isLocal(d.getSourceFile().fileName),
      );
      if (!declaration) return undefined;
      const id = `${fileId(declaration.getSourceFile().fileName)}#${checker.getFullyQualifiedName(resolved).replace(/^".*?"\./, '')}`;
      symbolIds.set(resolved, id);
      return id;
    };
    const addRelation = (
      fromId: string,
      toId: string | undefined,
      kind: TaonTsDocsRelationKind,
    ) => {
      if (toId && fromId !== toId) graph.relations.push({ fromId, toId, kind });
    };
    const typeInfo = (type: Type, node: Node): TaonTsDocsType => {
      const text = checker.typeToString(
        type,
        node,
        TypeFormatFlags.NoTruncation,
      );
      const refs = new Set<string>();
      const seen = new Set<Type>();
      const walk = (current: Type, depth: number) => {
        if (depth > 12 || seen.has(current)) return;
        seen.add(current);
        const id = symbolId(current.aliasSymbol ?? current.getSymbol());
        if (id) refs.add(id);
        if (current.isUnionOrIntersection())
          current.types.forEach(t => walk(t, depth + 1));
        for (const arg of (current as TypeReference).typeArguments ?? [])
          walk(arg, depth + 1);
        if (current.aliasTypeArguments)
          current.aliasTypeArguments.forEach(t => walk(t, depth + 1));
      };
      walk(type, 0);
      return { text, symbolIds: [...refs] };
    };
    const typeOf = (node: Node) =>
      typeInfo(checker.getTypeAtLocation(node), node);
    const signatures = (node: Node, ownerId: string): TaonTsDocsSignature[] => {
      const type = checker.getTypeAtLocation(node);
      const signatures = type.getCallSignatures();
      const declarationSignature = isFunctionLike(node)
        ? checker.getSignatureFromDeclaration(node)
        : undefined;
      const resolved = declarationSignature
        ? [declarationSignature]
        : signatures;
      return resolved.map(sig => {
        const params: TaonTsDocsParameter[] = sig.getParameters().map(p => {
          const decl = p.valueDeclaration ?? p.declarations?.[0] ?? node;
          const paramDecl = isParameter(decl) ? decl : undefined;
          const pType = typeInfo(
            checker.getTypeOfSymbolAtLocation(p, decl),
            decl,
          );
          pType.symbolIds.forEach(id => addRelation(ownerId, id, 'parameter'));
          return {
            name: p.getName(),
            type: pType,
            optional:
              !!(p.flags & SymbolFlags.Optional) || !!paramDecl?.questionToken,
            rest: !!paramDecl?.dotDotDotToken,
            defaultValue: paramDecl?.initializer?.getText(),
            docs: docs(p),
          };
        });
        const returnType = typeInfo(
          checker.getReturnTypeOfSignature(sig),
          node,
        );
        returnType.symbolIds.forEach(id => addRelation(ownerId, id, 'returns'));
        return {
          text: checker.signatureToString(
            sig,
            node,
            TypeFormatFlags.NoTruncation,
          ),
          parameters: params,
          returnType,
          typeParameters:
            sig.typeParameters?.map(t => checker.typeToString(t)) ?? [],
        };
      });
    };

    // Pass 1: register all declarations before resolving cross-file references.
    const supported = (node: Node): TaonTsDocsSymbolKind | undefined => {
      if (isClassDeclaration(node)) return 'class';
      if (isInterfaceDeclaration(node)) return 'interface';
      if (isTypeAliasDeclaration(node)) return 'type';
      if (isEnumDeclaration(node)) return 'enum';
      if (isFunctionDeclaration(node)) return 'function';
      if (isModuleDeclaration(node)) return 'namespace';
      return undefined;
    };
    for (const source of program.getSourceFiles()) {
      if (!isLocal(source.fileName) || source.isDeclarationFile) continue;
      const id = fileId(source.fileName);
      graph.files[id] = { id, imports: [], exports: [], symbolIds: [] };
      const visit = (node: Node) => {
        const kind = supported(node);
        if (
          kind &&
          'name' in node &&
          node.name &&
          isIdentifier(node.name as Node)
        ) {
          const nameNode = node.name as Identifier;
          const symbol = checker.getSymbolAtLocation(nameNode);
          const sid = symbolId(symbol);
          if (sid && symbol) {
            allSymbols.set(sid, resolveAlias(symbol));
            if (!graph.symbols[sid]) {
              graph.symbols[sid] = {
                id: sid,
                name: nameNode.text,
                kind,
                fileId: id,
                locations: [],
                exported: false,
                exportPaths: [],
                docs: docs(symbol),
                decorators: [],
                modifiers: [],
                typeParameters: [],
                heritage: [],
                members: [],
                signatures: [],
              };
            }
            graph.symbols[sid].locations.push(location(node));
            if (!graph.files[id].symbolIds.includes(sid))
              graph.files[id].symbolIds.push(sid);
          }
        }
        if (isVariableDeclaration(node) && isIdentifier(node.name)) {
          const symbol = checker.getSymbolAtLocation(node.name);
          const sid = symbolId(symbol);
          if (sid && symbol) {
            allSymbols.set(sid, resolveAlias(symbol));
            if (!graph.symbols[sid])
              graph.symbols[sid] = {
                id: sid,
                name: node.name.text,
                kind: 'variable',
                fileId: id,
                locations: [],
                exported: false,
                exportPaths: [],
                docs: docs(symbol),
                decorators: [],
                modifiers: [],
                typeParameters: [],
                heritage: [],
                members: [],
                signatures: [],
              };
            graph.symbols[sid].locations.push(location(node));
            if (!graph.files[id].symbolIds.includes(sid))
              graph.files[id].symbolIds.push(sid);
          }
        }
        forEachChild(node, visit);
      };
      visit(source);
    }

    // Pass 2: extract details and relationships from declarations.
    for (const [sid, symbol] of allSymbols) {
      const entry = graph.symbols[sid];
      for (const decl of symbol.declarations ?? []) {
        if (!isLocal(decl.getSourceFile().fileName)) continue;
        entry.modifiers = [
          ...new Set([...entry.modifiers, ...modifiers(decl)]),
        ];
        entry.decorators.push(...decorators(decl));
        if (isClassDeclaration(decl) || isInterfaceDeclaration(decl)) {
          entry.typeParameters =
            decl.typeParameters?.map(p => p.getText()) ?? [];
          for (const clause of decl.heritageClauses ?? []) {
            const kind =
              clause.token === SyntaxKind.ExtendsKeyword
                ? 'extends'
                : 'implements';
            for (const t of clause.types) {
              const info = typeOf(t);
              entry.heritage.push({ kind, type: info });
              info.symbolIds.forEach(id => addRelation(sid, id, kind));
            }
          }
          for (const member of decl.members) {
            const kind: TaonTsDocsMemberKind | undefined =
              isMethodDeclaration(member) || isMethodSignature(member)
                ? 'method'
                : isPropertyDeclaration(member) || isPropertySignature(member)
                  ? 'property'
                  : isConstructorDeclaration(member)
                    ? 'constructor'
                    : isGetAccessorDeclaration(member)
                      ? 'getter'
                      : isSetAccessorDeclaration(member)
                        ? 'setter'
                        : undefined;
            if (!kind) continue;
            const nameNode =
              'name' in member ? (member.name as Node | undefined) : undefined;
            const name = nameNode ? nameNode.getText() : 'constructor';
            const mid = `${sid}::${kind}:${name}`;
            const ms = nameNode
              ? checker.getSymbolAtLocation(nameNode)
              : undefined;
            const mods = modifiers(member);
            const visibility = mods.includes('private')
              ? 'private'
              : mods.includes('protected')
                ? 'protected'
                : 'public';
            const existing = graph.members[mid];
            if (existing) {
              // Merge overload signatures into the same logical member.
              existing.signatures.push(...signatures(member, mid));
              continue;
            }
            const info: TaonTsDocsMember = {
              id: mid,
              ownerId: sid,
              name,
              kind,
              visibility,
              static: mods.includes('static'),
              readonly: mods.includes('readonly'),
              optional: !!('questionToken' in member && member.questionToken),
              abstract: mods.includes('abstract'),
              docs: docs(ms),
              decorators: decorators(member),
              location: location(member),
              signatures: [],
            };
            if (kind === 'property' || kind === 'getter' || kind === 'setter') {
              info.type = typeOf(member);
              info.type.symbolIds.forEach(id =>
                addRelation(mid, id, 'property-type'),
              );
            }
            if (
              kind === 'method' ||
              kind === 'constructor' ||
              kind === 'getter' ||
              kind === 'setter'
            ) {
              info.signatures = signatures(member, mid);
            }
            graph.members[mid] = info;
            entry.members.push(mid);
          }
        } else if (isEnumDeclaration(decl)) {
          for (const member of decl.members) {
            const name = member.name.getText();
            const mid = `${sid}::enum-member:${name}`;
            if (graph.members[mid]) continue;
            graph.members[mid] = {
              id: mid,
              ownerId: sid,
              name,
              kind: 'enum-member',
              visibility: 'public',
              static: true,
              readonly: true,
              optional: false,
              abstract: false,
              docs: docs(checker.getSymbolAtLocation(member.name)),
              decorators: [],
              location: location(member),
              signatures: [],
              type: typeOf(member),
            };
            entry.members.push(mid);
          }
        } else if (
          isTypeAliasDeclaration(decl) ||
          isVariableDeclaration(decl)
        ) {
          entry.type = typeOf(decl);
          entry.type.symbolIds.forEach(id =>
            addRelation(sid, id, 'references'),
          );
          if (isVariableDeclaration(decl))
            entry.value = decl.initializer?.getText();
          if (isTypeAliasDeclaration(decl))
            entry.typeParameters =
              decl.typeParameters?.map(p => p.getText()) ?? [];
        } else if (isFunctionDeclaration(decl)) {
          entry.signatures.push(...signatures(decl, sid));
          entry.typeParameters =
            decl.typeParameters?.map(p => p.getText()) ?? [];
        }
      }
      const names = entry.decorators.map(d => d.name.toLowerCase());
      entry.taonCategory = names.some(n => n.includes('controller'))
        ? 'controller'
        : names.some(n => n.includes('repository'))
          ? 'repository'
          : names.some(n => n.includes('provider'))
            ? 'provider'
            : names.some(n => n.includes('entity'))
              ? 'entity'
              : 'other';
    }

    // Resolve exports through barrel files and aliases.
    for (const source of program.getSourceFiles()) {
      if (!isLocal(source.fileName) || source.isDeclarationFile) continue;
      const fid = fileId(source.fileName);
      for (const statement of source.statements) {
        if (
          isImportDeclaration(statement) &&
          isStringLiteral(statement.moduleSpecifier)
        ) {
          graph.files[fid].imports.push(statement.moduleSpecifier.text);
        }
      }
      const moduleSymbol = checker.getSymbolAtLocation(source);
      if (!moduleSymbol) continue;
      for (const exported of checker.getExportsOfModule(moduleSymbol)) {
        const targetId = symbolId(exported);
        if (!targetId || !graph.symbols[targetId]) continue;
        graph.exports.push({
          moduleId: fid,
          name: exported.getName(),
          symbolId: targetId,
        });
        graph.files[fid].exports.push(exported.getName());
        graph.symbols[targetId].exported = true;
        if (!graph.symbols[targetId].exportPaths.includes(fid))
          graph.symbols[targetId].exportPaths.push(fid);
      }
    }
    graph.relations = [
      ...new Map(
        graph.relations.map(r => [`${r.fromId}|${r.toId}|${r.kind}`, r]),
      ).values(),
    ];
    return graph;
    //#endregion
  }
  //#endregion

  //#region path filtering
  private normalizeRelativePath(value: string): string {
    return value
      .replace(/\\/g, '/')
      .replace(/^\.\/+/, '')
      .replace(/\/+/g, '/')
      .replace(/\/+$/, '');
  }

  private isPathExcluded(
    absolutePath: string,
    excludedPaths: string[],
  ): boolean {
    const relativePath = this.normalizeRelativePath(
      path.relative(this.project.location, absolutePath),
    );

    return excludedPaths.some(excludedPath => {
      const excluded = this.normalizeRelativePath(excludedPath);

      return (
        relativePath === excluded || relativePath.startsWith(`${excluded}/`)
      );
    });
  }

  private discoverTsFiles(
    directory: string,
    excludedPaths: string[],
  ): string[] {
    const result: string[] = [];

    if (this.isPathExcluded(directory, excludedPaths)) {
      return result;
    }

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = crossPlatformPath([directory, entry.name]);

      if (this.isPathExcluded(fullPath, excludedPaths)) {
        continue;
      }

      if (entry.isDirectory()) {
        result.push(...this.discoverTsFiles(fullPath, excludedPaths));
      } else if (
        entry.isFile() &&
        /\.tsx?$/.test(entry.name) &&
        !/\.d\.ts$/.test(entry.name)
      ) {
        result.push(fullPath);
      }
    }

    return result;
  }
  //#endregion

  //#region methods / diagnostic text
  private diagnosticText(d: Diagnostic): string {
    //#region @backendFunc
    return flattenDiagnosticMessageText(d.messageText, '\n');
    //#endregion
  }
  //#endregion

  //#region method / get insdex graph data
  getIndexDataGraph(graph: TaonTsDocsGraph, filePath: string): IndexData[] {
    const result: IndexData[] = [];

    const normalize = (value?: string): string =>
      (value || '').replace(/\s+/g, ' ').trim();

    for (const symbol of Object.values(graph.symbols)) {
      result.push({
        filePath,
        headingId: symbol.id,
        headingTitle: symbol.name,
        text: normalize(
          [
            symbol.name,
            symbol.kind,
            symbol.taonCategory,
            symbol.docs?.description,
          ]
            .filter(Boolean)
            .join(' '),
        ),
      });

      for (const memberId of symbol.members) {
        const member = graph.members[memberId];

        if (!member) continue;

        result.push({
          filePath,
          headingId: member.id,
          headingTitle: `${symbol.name}.${member.name}`,
          text: normalize(
            [symbol.name, member.name, member.kind, member.docs?.description]
              .filter(Boolean)
              .join(' '),
          ),
        });
      }
    }

    return result.map(c => {
      return { ...c, api: true };
    });
  }
  //#endregion

  // getIndexDataGraph(
  //   graph: TaonTsDocsGraph,
  //   options: {
  //     filePath: string;
  //   },
  // ): IndexData[] {
  //   const result: IndexData[] = [];

  //   const normalize = (values: (string | undefined)[]): string =>
  //     values
  //       .filter((value): value is string => !!value)
  //       .join('\n')
  //       .trim();

  //   const docsText = (docs?: {
  //     description?: string;
  //     tags?: {
  //       name: string;
  //       text?: string;
  //     }[];
  //   }): string =>
  //     normalize([
  //       docs?.description,
  //       ...(docs?.tags ?? []).map(tag => normalize([tag.name, tag.text])),
  //     ]);

  //   const add = (
  //     headingId: string,
  //     headingTitle: string,
  //     values: (string | undefined)[],
  //   ): void => {
  //     const text = normalize(values);

  //     if (!text) {
  //       return;
  //     }

  //     result.push({
  //       filePath: options.filePath,
  //       headingId,
  //       headingTitle,
  //       text,
  //     });
  //   };

  //   for (const symbol of Object.values(graph.symbols)) {
  //     const symbolHeadingId = symbol.id;

  //     add(symbolHeadingId, symbol.name, [
  //       symbol.name,
  //       symbol.kind,
  //       symbol.taonCategory,
  //       symbol.fileId,
  //       docsText(symbol.docs),
  //       symbol.type?.text,
  //       ...symbol.typeParameters,
  //       ...symbol.heritage.map(h => h.type.text),
  //       ...symbol.decorators.map(d => d.expression),
  //       ...symbol.signatures.flatMap(signature => [
  //         signature.text,
  //         signature.returnType.text,
  //         ...signature.parameters.flatMap(parameter => [
  //           parameter.name,
  //           parameter.type.text,
  //           docsText(parameter.docs),
  //         ]),
  //       ]),
  //     ]);

  //     for (const memberId of symbol.members) {
  //       const member = graph.members[memberId];

  //       if (!member) {
  //         continue;
  //       }

  //       add(member.id, `${symbol.name}.${member.name}`, [
  //         symbol.name,
  //         member.name,
  //         member.kind,
  //         member.visibility,
  //         docsText(member.docs),
  //         member.type?.text,
  //         ...member.decorators.map(d => d.expression),
  //         ...member.signatures.flatMap(signature => [
  //           signature.text,
  //           signature.returnType.text,
  //           ...signature.parameters.flatMap(parameter => [
  //             parameter.name,
  //             parameter.type.text,
  //             docsText(parameter.docs),
  //           ]),
  //         ]),
  //       ]);
  //     }
  //   }

  //   return result;
  // }
}
