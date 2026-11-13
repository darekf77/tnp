import * as hljs from 'highlight.js/lib/core';
import * as bash from 'highlight.js/lib/languages/bash';
import * as javascript from 'highlight.js/lib/languages/javascript';
import * as scss from 'highlight.js/lib/languages/scss';
import * as typescript from 'highlight.js/lib/languages/typescript';
import * as MarkdownIt from 'markdown-it'; // @backend
import type { DocsHeading, IndexData } from 'taon/src';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('scss', scss);

import { baseHrefDocsGen } from '../../../../constants';
import { crossPlatformPath, path } from 'tnp-core/src';

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
    // const originlContent = content;
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

    //#region add translate tags
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

    const translationBoundaries = `${translatableBlocks}, ${excludedFromTranslation}`;

    $(translatableBlocks).each((_, element) => {
      const block = $(element);

      if (
        block.closest(excludedFromTranslation).length ||
        block.attr('translate') !== undefined
      ) {
        return;
      }

      // Look for prose owned by this block. Inline formatting such as
      // <strong>, <em>, and <a> can contribute text to the same block.
      const prose = block.clone();
      prose.find(translationBoundaries).remove();

      if (prose.text().trim()) {
        block.attr('translate', '');
        block.attr('[translate-t]', 't');

        const children = block.children();
        const hasOnlyLineBreaks =
          children.length > 0 &&
          children.filter('br').length === children.length;

        if (hasOnlyLineBreaks) {
          const htmlKey = (block.html() ?? '').trim();
          block.attr('[translate-html-key]', JSON.stringify(htmlKey));
        }
      }
    });

    // $('br')
    //   .filter((_, element) => !$(element).closest('pre, code').length)
    //   .replaceWith(' ');

    //#endregion

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
    // ---------------------------------------------------------
    // Search index
    //
    // IMPORTANT:
    // Do this BEFORE replacing <code> contents.
    // ---------------------------------------------------------

    $('h1, h2, h3').each((_, element) => {
      const heading = $(element);

      const headingId = heading.attr('id')!;
      const headingTitle = heading.text().trim();

      const contentParts: string[] = [];

      let current = heading.next();

      while (current.length) {
        const tagName = current[0]?.tagName?.toLowerCase();

        // Next searchable section starts here.
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
      });
    });
    //#endregion

    //#region code block
    // ---------------------------------------------------------
    // Code blocks
    // ---------------------------------------------------------

    $('code').each((index, element) => {
      const codeElement = $(element);
      const name = `codeblock${index}`;
      const isBlock = codeElement.closest('pre').length > 0;
      const decodedCode = codeElement.text();

      const codeContent = isBlock
        ? decodedCode
        : decodedCode.replace(/[ \t]*(?:\r\n?|\n)[ \t]*/g, ' ').trim();

      const block: CodeBlock = { name, codeContent };
      codeblocks.push(block);

      const language = (codeElement.attr('class') ?? '')
        .match(/(?:^|\s)language-([\w-]+)(?=\s|$)/i)?.[1]
        .toLowerCase();

      if (isBlock) {
        const preElement = codeElement.closest('pre');
        preElement.wrap('<div class="docs-code-block" translate="no"></div>');

        const copyButton = $(
          '<button type="button" class="docs-code-copy">Copy</button>',
        ).attr('(click)', `copyCode(context.${name}, $event)`);

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
            `${baseHrefDocsGen} + '/${packageName}/' + ${JSON.stringify(resolvedPath + suffix)}`,
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
