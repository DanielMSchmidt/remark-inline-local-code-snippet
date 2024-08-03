import { unified } from "unified";
import remarkParse from "remark-parse";
import gfm from "remark-gfm";
import remarkHeadingId from "remark-heading-id";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import type { VFileCompatible, VFile } from "vfile";
import path from "path";

import plugin, { type Options } from "../../src";

const compilerCreator = (options?: Options) =>
  unified()
    .use(remarkParse)
    .use(gfm)
    .use(remarkHeadingId)
    .use(plugin, options)
    .use(remarkRehype)
    .use(rehypeFormat)
    .use(rehypeStringify);

export const process = async (content: VFileCompatible, options?: Options): Promise<VFile> => {
  return compilerCreator({
    rootPath: path.resolve(__dirname, "..", "fixtures"),
    ...options,
  }).process(content);
};
