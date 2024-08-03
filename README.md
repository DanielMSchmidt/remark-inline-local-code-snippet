# remark-inline-local-code-snippets

[![NPM version][badge-npm-version]][npm-package-url]
[![NPM downloads][badge-npm-download]][npm-package-url]
[![Build][badge-build]][github-workflow-url]
[![typescript][badge-typescript]][typescript-url]
[![License][badge-license]][github-license-url]

This package is a [unified][unified] ([remark][remark]) plugin to replace links to a github code snippet with the code snippet itself.

## Installation

```bash
npm install remark-inline-local-code-snippets
```

## Usage

If you have a markdown file like this:

```markdown
My blog post about code has snippets:

[inline](./index.ts#L8-L23)

This is the `.prettierrc.json` file:

[inline](./.prettierrc.json#L1-L7)
```

With a configuration like this
```javascript
import * as path from "path";
import { read } from "to-vfile";
import remark from "remark";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

import remarkInlinLocalCodeSnippet from "remark-inline-local-code-snippet";

main();

async function main() {
  const file = await remark()
    .use(gfm)
    .use(remarkInlinLocalCodeSnippet, {
      rootPath: path.resolve(__dirname, "src")),
      inlineMarker: "inline",
      originComment: "Source of this code snippet: <url>"
    })
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(await read("example.md"));
}
```

We get an output equivalent to this Markdown:

```markdown
My blog post about code has snippets:

\`\`\`typescript
export type Options = {
  // If this string is detected in a link text, the link will be replaced with a code snippet
  // Default: "inline"
  inlineMarker?: string;
  // The comment placed on top of the linked code snippet, <url> will be replaced with the URL
  // of the link. If undefined, no comment will be added.
  // Default: undefined
  originComment?: string;
  // Function that gets called with an error if a fetch fails. If undefined, the error will be
  // ignored.
  // Default: undefined
  logError?: (error: Error) => void;
  // The root path of the project, used to resolve relative paths. Ideally use an absolute path.
  // Default: process.cwd()
  rootPath?: string;
};
\`\`\`

This is the `.prettierrc.json` file:

\`\`\`json
{
  "bracketSpacing": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 96
}
\`\`\`
```

Please note that you need the starting and ending line numbers in the URL to get the correct code snippet.

### Options

#### `rootPath`

The base path that is used to resolve relative paths. Default: `process.cwd()`.

#### `inlineMarker`

The string that is used to identify links that should be replaced with code snippets. Default: `inline`.

#### `originComment`

A comment that is placed on top of the linked code snippet. The string `<url>` will be replaced with the URL of the link. Default: `undefined`.

### Supported languages

- JavaScript
- TypeScript
- Python
- Shell
- JSON
- YAML
- Terraform
- HCL
- Go

Adding a new language is [easy](https://github.com/DanielMSchmidt/remark-inline-local-code-snippet/blob/main/src/index.ts#L92), feel free to open a PR if your favorite language is missing.

## License

[MIT License](./LICENSE) © DanielMSchmidt


[unified]: https://github.com/unifiedjs/unified
[remark]: https://github.com/remarkjs/remark
[remarkplugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
[mdast]: https://github.com/syntax-tree/mdast
[micromark]: https://github.com/micromark/micromark
[typescript]: https://www.typescriptlang.org/

[badge-npm-version]: https://img.shields.io/npm/v/remark-inline-local-code-snippets
[badge-npm-download]:https://img.shields.io/npm/dt/remark-inline-local-code-snippets
[npm-package-url]: https://www.npmjs.com/package/remark-inline-local-code-snippets

[badge-license]: https://img.shields.io/github/license/DanielMSchmidt/remark-inline-local-code-snippets
[github-license-url]: https://github.com/DanielMSchmidt/remark-inline-local-code-snippets/blob/main/LICENSE

[badge-build]: https://github.com/DanielMSchmidt/remark-inline-local-code-snippets/actions/workflows/publish.yml/badge.svg
[github-workflow-url]: https://github.com/DanielMSchmidt/remark-inline-local-code-snippets/actions/workflows/publish.yml

[badge-typescript]: https://img.shields.io/npm/types/remark-flexible-toc
[typescript-url]: https://www.typescriptlang.org/
