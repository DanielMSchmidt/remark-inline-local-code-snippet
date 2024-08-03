import { type Plugin } from "unified";
import { type Root, type Code } from "mdast";
import { visit } from "unist-util-visit";
import * as Path from "path";
import * as fs from "fs";

// eslint-disable-next-line
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
const DEFAULT_SETTINGS: Options = {
  inlineMarker: "inline",
  logError: () => {},
  rootPath: process.cwd(),
};

type InlineSnippet = {
  inline: (codeblock: Code) => void;
  url: string;
};

type CodeInfo = { path: string; start: number; end: number; ext: string };

const RemarkInlinLocalCodeSnippet: Plugin<[Options?], Root> = (
  options: Options | undefined,
) => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, options);

  return async (tree) => {
    const inlineSnippets: InlineSnippet[] = [];

    // find all snippets
    visit(tree, (node, index, parent) => {
      // Search for links starting with github.com and containing the inlineMarker
      if (
        node.type === "link" &&
        node.children[0].type === "text" &&
        node.children[0].value === settings.inlineMarker &&
        isFilePath(settings.rootPath!, node.url)
      ) {
        inlineSnippets.push({
          url: node.url,
          inline: (codeblock) => {
            parent!.children[index!] = codeblock;
          },
        });
      }
    });

    // replace all snippets
    inlineSnippets.map((snippet) => {
      const info = decomposeUrl(snippet.url);

      if (!info) {
        settings?.logError?.call(this, new Error(`Invalid URL: ${snippet.url}`));
        return;
      }

      const { path, start, end, ext } = info;

      const content = fs.readFileSync(Path.resolve(settings.rootPath!, path), "utf8");

      const snippetContent = content
        .split("\n")
        .slice(start - 1, end)
        .join("\n");
      snippet.inline({
        type: "code",
        lang: pathExtensionToMarkdownLanguageTag(ext),
        value: settings.originComment
          ? `${commentOutBasedOnLanguage(ext, settings.originComment.replaceAll("<url>", path))}` +
            snippetContent
          : snippetContent,
      });
    });
  };
};

function decomposeUrl(url: string): CodeInfo | undefined {
  // Dumb solution, but hey, it works
  const [path, startAndEnd] = url.split("#");
  if (!path || !startAndEnd) {
    return undefined;
  }

  // parseInt might fail if the string is not a number (or Path.parse if path is no string)
  try {
    const [start, end] = startAndEnd.split("-").map((n) => parseInt(n.replace("L", "")));
    const ext = Path.parse(path).ext;
    return { path, start, end, ext };
  } catch (e) {
    return undefined;
  }
}

// Check if a string is a path to a file that exists by trying to access it
function isFilePath(basePath: string, url: string): boolean {
  const info = decomposeUrl(url);

  if (!info) {
    return false;
  }

  try {
    fs.readFileSync(Path.resolve(basePath, info.path));
    return true;
  } catch (e) {
    return false;
  }
}

type LanguageHandler = {
  markdown: string;
  comment: (comment: string) => string;
};
export const supportedLanguageExtensions: Record<string, LanguageHandler> = {
  ".js": {
    markdown: "javascript",
    comment: (c) => `// ${c}\n`,
  },
  ".ts": {
    markdown: "typescript",
    comment: (c) => `// ${c}\n`,
  },
  ".py": {
    markdown: "python",
    comment: (c) => `# ${c}\n`,
  },
  ".sh": {
    markdown: "bash",
    comment: (c) => `# ${c}\n`,
  },
  ".json": {
    markdown: "json",
    comment: () => "",
  },
  ".yaml": {
    markdown: "yaml",
    comment: (c) => `# ${c}\n`,
  },
  ".yml": {
    markdown: "yaml",
    comment: (c) => `# ${c}\n`,
  },
  ".tf": {
    markdown: "terraform",
    comment: (c) => `# ${c}\n`,
  },
  ".hcl": {
    markdown: "hcl",
    comment: (c) => `# ${c}\n`,
  },
  ".tfstacks.hcl": {
    markdown: "hcl",
    comment: (c) => `# ${c}\n`,
  },
  ".go": {
    markdown: "go",
    comment: (c) => `// ${c}\n`,
  },
} as const;

const defaultLanguageExtension: LanguageHandler = {
  markdown: "",
  comment: (c) => `// ${c}\n`,
};

export function commentOutBasedOnLanguage(ext: string, code: string) {
  return (supportedLanguageExtensions[ext] || defaultLanguageExtension).comment(code);
}

export function pathExtensionToMarkdownLanguageTag(ext: string) {
  return (supportedLanguageExtensions[ext] || defaultLanguageExtension).markdown;
}

export default RemarkInlinLocalCodeSnippet;
