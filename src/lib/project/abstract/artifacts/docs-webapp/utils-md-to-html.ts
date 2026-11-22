//#region imports
import * as hljs from 'highlight.js/lib/core';
import * as bash from 'highlight.js/lib/languages/bash';
import * as javascript from 'highlight.js/lib/languages/javascript';
import * as scss from 'highlight.js/lib/languages/scss';
import * as typescript from 'highlight.js/lib/languages/typescript';
import * as MarkdownIt from 'markdown-it'; // @backend
import type { DocsHeading, IndexData } from 'taon/src';
import { crossPlatformPath, path } from 'tnp-core/src';

import { baseHrefDocsGen } from '../../../../constants';
//#endregion

//#region constants
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('scss', scss);
//#endregion

export namespace UtilsMdToHtml {
  //#region @backend
  const markdownit: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
    breaks: false,
  });
  //#endregion

  //#region code block
  export interface CodeBlock {
    codeContent: string;
    highlightedHtml?: string;
    name: string; // codeblock0, codeblock1...
  }
  //#endregion

  //#region transform
  export const transform = (
    content: string,
    filePath: string,
    packageName: string,
  ): ReturnType<typeof modifyAndGetHeadings> => {
    //#region @backendFunc
    content = markdownit.render(content);

    const res = modifyAndGetHeadings(content, filePath);

    res.resultContent = replaceHrefsWithAngularBaseHref(
      res.resultContent,
      packageName,
      filePath,
    ).replace(/\[innerhtml\](?="|=)/g, '[innerHTML]');

    return res;
    //#endregion
  };
  //#endregion

  //#region translation
  function addTranslationTags($: any): void {
    //#region @backendFunc
    const translatableBlocks = 'h1, h2, h3, p, div';

    const excludedFromTranslation = [
      'pre',
      'code',
      'i',
      'kbd',
      'samp',
      'var',
      'script',
      'style',
      'textarea',
      'template',
      'svg',
      'math',
      '[translate="no"]',
      '[data-no-translate]',
    ].join(', ');

    const inlineFormatting = [
      'br',
      'strong',
      'em',
      'b',
      'u',
      's',
      'del',
      'sub',
      'sup',
    ].join(', ');

    const translationBoundaries = `${translatableBlocks}, ${excludedFromTranslation}`;

    const isElement = (node: any): boolean => node?.type === 'tag';

    const isExcluded = (node: any): boolean =>
      isElement(node) && $(node).is(excludedFromTranslation);

    const isBoundary = (node: any): boolean =>
      isElement(node) && $(node).is(translationBoundaries);

    const hasTranslatableText = (nodes: any[]): boolean => {
      const container = $('<span></span>');

      nodes.forEach(node => {
        container.append($(node).clone());
      });

      container.find(translationBoundaries).remove();

      return !!container.text().trim();
    };

    const applyTranslationAttributes = (element: any): void => {
      const target = $(element);

      target.attr('translate', '');
      target.attr('[translate-t]', 't');

      const descendants = target.find('*');

      const hasOnlyInlineFormatting =
        descendants.length > 0 &&
        descendants.not(inlineFormatting).length === 0;

      if (hasOnlyInlineFormatting) {
        target.attr('translate-html', '');
      }
    };

    const containsExcludedDescendant = (element: any): boolean =>
      $(element).find(excludedFromTranslation).length > 0;

    const containsNestedTranslationBlock = (element: any): boolean =>
      $(element).find(translatableBlocks).length > 0;

    const splitIntoTranslatableSpans = (element: any): void => {
      const block = $(element);
      const originalNodes = block.contents().toArray();

      block.empty();

      let pendingNodes: any[] = [];

      const flushPending = (): void => {
        if (!pendingNodes.length) {
          return;
        }

        if (!hasTranslatableText(pendingNodes)) {
          pendingNodes.forEach(node => block.append(node));
          pendingNodes = [];
          return;
        }

        const span = $('<span></span>');

        pendingNodes.forEach(node => span.append(node));

        applyTranslationAttributes(span);
        block.append(span);

        pendingNodes = [];
      };

      const appendNode = (node: any): void => {
        if (isBoundary(node)) {
          flushPending();
          block.append(node);
          return;
        }

        if (isElement(node) && containsExcludedDescendant(node)) {
          // Preserve inline formatting around excluded elements.
          //
          // Example:
          // <strong>Hello <code>World</code> again</strong>
          //
          // becomes:
          // <strong>
          //   <span translate> Hello </span>
          //   <code>World</code>
          //   <span translate> again </span>
          // </strong>

          flushPending();

          const wrapper = $(node);
          const children = wrapper.contents().toArray();

          wrapper.empty();
          block.append(wrapper);

          splitIntoTranslatableSpans(node);

          return;
        }

        pendingNodes.push(node);
      };

      originalNodes.forEach(appendNode);
      flushPending();
    };

    $(translatableBlocks).each((_, element) => {
      const block = $(element);

      if (
        block.closest(excludedFromTranslation).length ||
        block.attr('translate') !== undefined
      ) {
        return;
      }

      const prose = block.clone();
      prose.find(translationBoundaries).remove();

      if (!prose.text().trim()) {
        return;
      }

      const hasExcludedContent = containsExcludedDescendant(element);

      const hasNestedBlocks = containsNestedTranslationBlock(element);

      if (!hasExcludedContent && !hasNestedBlocks) {
        // Keep original behavior for ordinary paragraphs/headings.
        applyTranslationAttributes(block);
        return;
      }

      // Keep the parent element free of translation directives.
      // Translate only safe text fragments.
      splitIntoTranslatableSpans(element);
    });
    //#endregion
  }
  //#endregion

  //#region modify and get headings
  function modifyAndGetHeadings(
    content: string,
    filePath: string,
  ): {
    resultContent: string;
    headings: DocsHeading[];
    codeblocks: CodeBlock[];
    indexData: IndexData[];
  } {
    //#region @backendFunc
    const cheerio = require('cheerio');

    const $ = cheerio.load(content, null, false);

    const usedIds = new Map<string, number>();
    const headings: DocsHeading[] = [];
    const codeblocks: CodeBlock[] = [];
    const indexData: IndexData[] = [];

    //#region heading ids
    $('h1, h2, h3').each((_, element) => {
      const heading = $(element);

      const title = heading.text().trim();
      const level = Number(element.tagName.slice(1)) as 1 | 2 | 3;

      const baseId = slugify(title) || 'section';

      const currentCount = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, currentCount + 1);

      const id = currentCount === 0 ? baseId : `${baseId}-${currentCount + 1}`;

      heading.attr('id', id);

      headings.push({
        id,
        title,
        level,
      });
    });
    //#endregion

    //#region search index
    // IMPORTANT:
    // Do this BEFORE replacing <code> contents.
    $('h1, h2, h3').each((_, element) => {
      const heading = $(element);

      const headingId = heading.attr('id')!;
      const headingTitle = heading.text().trim();

      const contentParts: string[] = [];

      let current = heading.next();

      while (current.length) {
        const tagName = current[0]?.tagName?.toLowerCase();

        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
          break;
        }

        const text = current.text().trim();

        if (text) {
          contentParts.push(text);
        }

        current = current.next();
      }

      const sectionText = normalizeSearchText(
        [headingTitle, ...contentParts].join(' '),
      );

      indexData.push({
        filePath,
        headingId,
        headingTitle,
        text: sectionText,
        api: false,
      });
    });
    //#endregion

    //#region code block
    $('code').each((index, element) => {
      const codeElement = $(element);
      const name = `codeblock${index}`;
      const isBlock = codeElement.closest('pre').length > 0;
      const decodedCode = codeElement.text();

      const codeContent = isBlock
        ? decodedCode
        : decodedCode.replace(/[ \t]*(?:\r\n?|\n)[ \t]*/g, ' ').trim();

      const block: CodeBlock = {
        name,
        codeContent,
      };

      codeblocks.push(block);

      const language = (codeElement.attr('class') ?? '')
        .match(/(?:^|\s)language-([\w-]+)(?=\s|$)/i)?.[1]
        ?.toLowerCase();

      if (isBlock) {
        const preElement = codeElement.closest('pre');

        preElement.wrap('<div class="docs-code-block"></div>');

        const copyButton = $(`
          <button
            type="button"
            class="docs-code-copy"
            aria-label="Copy code"
            title="Copy code">
            <span
              class="material-icons"
              aria-hidden="true">content_copy</span>
          </button>
        `).attr('(click)', `copyCode(context.${name}, $event)`);

        preElement.before(copyButton);
      }

      if (isBlock && language && hljs.getLanguage(language)) {
        block.highlightedHtml = hljs.highlight(codeContent, {
          language,
          ignoreIllegals: true,
        }).value;

        codeElement
          .addClass('hljs')
          .attr('[innerHTML]', `context.${name}Html`)
          .empty();

        return;
      }

      codeElement.html(`{{ context.${name} }}`);
    });
    //#endregion

    //#region add translate tags
    // Run after code processing so inline code interpolation
    // stays outside translated elements.
    addTranslationTags($);
    //#endregion

    return {
      resultContent: $.html(),
      headings,
      codeblocks,
      indexData,
    };
    //#endregion
  }
  //#endregion

  //#region normalize search text
  function normalizeSearchText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }
  //#endregion

  //#region slugify
  function slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  //#endregion

  //#region replace href with angular base href
  export function replaceHrefsWithAngularBaseHref(
    html: string,
    packageName: string,
    filePath?: string,
  ): string {
    //#region @backendFunc
    const cheerio = require('cheerio');
    const { posix } = require('node:path') as typeof import('node:path');
    const $ = cheerio.load(html, null, false);

    const packagePrefix = `${packageName}/`;
    const normalizedFilePath = filePath?.replace(/\\/g, '/') ?? '';

    const pathInPackage = normalizedFilePath.startsWith(packagePrefix)
      ? normalizedFilePath.slice(packagePrefix.length)
      : normalizedFilePath;

    const sourceDirectory = posix.dirname(pathInPackage);

    $('a[href]').each((_, el) => {
      const anchor = $(el);
      const href = anchor.attr('href');

      if (
        !href ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        /^[a-z][a-z\d+.-]*:/i.test(href)
      ) {
        return;
      }

      if (href.startsWith('./') || href.startsWith('../')) {
        const suffixIndex = href.search(/[?#]/);

        const targetPath =
          suffixIndex === -1 ? href : href.slice(0, suffixIndex);

        const suffix = suffixIndex === -1 ? '' : href.slice(suffixIndex);

        const resolvedPath = posix.join(sourceDirectory, targetPath);

        anchor
          .removeAttr('href')
          .attr(
            '[href]',
            `${baseHrefDocsGen} + '/${packageName}/' + ${JSON.stringify(
              resolvedPath + suffix,
            )}`,
          );

        return;
      }

      anchor
        .removeAttr('href')
        .attr('[href]', `${baseHrefDocsGen} + ${JSON.stringify(`/${href}`)}`);
    });

    return $.html();
    //#endregion
  }
  //#endregion
}
