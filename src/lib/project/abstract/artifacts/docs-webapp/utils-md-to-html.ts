import * as MarkdownIt from 'markdown-it'; // @backend
import type { DocsHeading } from 'taon/src';

import { baseHrefDocsGen } from '../../../../constants';

export namespace UtilsMdToHtml {
  //#region @backend
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
    breaks: false,
  });
  //#endregion

  //#region code block
  export interface CodeBlock {
    codeContent: string;
    name: string; // codeblock0, codeblock1...
  }
  //#endregion

  //#region transform
  export const transform = (
    content: string,
    packageName: string,
  ): ReturnType<typeof modifyAndGetHeadings> => {
    //#region @backendFunc
    content = md.render(content);

    const res = modifyAndGetHeadings(content);
    res.resultContent = replaceHrefsWithAngularBaseHref(
      res.resultContent,
      packageName,
    );
    return res;
    //#endregion
  };
  //#endregion

  //#region modify and get headings
  function modifyAndGetHeadings(content: string): {
    resultContent: string;
    headings: DocsHeading[];
    codeblocks: CodeBlock[];
  } {
    //#region @backendFunc
    const cheerio = require('cheerio');

    const $ = cheerio.load(content, null, false);

    const usedIds = new Map<string, number>();
    const headings: DocsHeading[] = [];
    const codeblocks: CodeBlock[] = [];

    // ---------------------------------------------------------
    // Headings
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // Code blocks
    // ---------------------------------------------------------

    $('code').each((index, element) => {
      const codeElement = $(element);

      const name = `codeblock${index}`;

      // .text() gives us decoded code:
      //
      // &lt;div&gt;
      //
      // becomes:
      //
      // <div>
      //
      // which is exactly what we want inside context.codeblockX.
      const codeContent = codeElement.text();

      codeblocks.push({
        name,
        codeContent,
      });

      // IMPORTANT:
      //
      // Use html(), not text().
      //
      // text('{{ context.codeblock0 }}')
      // would escape braces in some serializers / transformations.
      //
      // We deliberately want Angular template syntax here.
      codeElement.html(`{{ context.${name} }}`);
    });

    return {
      resultContent: $.html(),
      headings,
      codeblocks,
    };
    //#endregion
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
  ): string {
    //#region @backendFunc
    const cheerio = require('cheerio');
    const $ = cheerio.load(html, null, false);

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') as string;

      if (!href) {
        return;
      }

      // Leave external/special links untouched
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      $(el).removeAttr('href');

      if (href.startsWith('./') || href.startsWith('./')) {
        $(el).attr(
          '[href]',
          `${baseHrefDocsGen} + '/${packageName}/' + ${JSON.stringify(href.replace(/^\.\//, ''))}`,
        );
      } else {
        $(el).attr('[href]', `${baseHrefDocsGen} + ${JSON.stringify(`/${href}`)}`);
      }
    });

    return $.html();
    //#endregion
  }
  //#endregion
}
