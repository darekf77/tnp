import * as MarkdownIt from 'markdown-it'; // @backend
import type { DocsHeading } from 'taon/src';

export namespace UtilsMdToHtml {
  //#region @backend
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
    breaks: false,
  });
  //#endregion

  export interface CodeBlock {
    codeContent: string;
    name: string; // codeblock0, codeblock1...
  }

  export const transform = (
    content: string,
  ): ReturnType<typeof modifyAndGetHeadings> => {
    //#region @backendFunc
    content = md.render(content);

    return modifyAndGetHeadings(content);
    //#endregion
  };

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

  function slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
