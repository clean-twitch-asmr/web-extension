import { writeFile } from "fs/promises";
import prettier from "prettier";

export type ParserType =
  | "flow"
  | "babel"
  | "babel-flow"
  | "babel-ts"
  | "typescript"
  | "acorn"
  | "espree"
  | "meriyah"
  | "css"
  | "less"
  | "scss"
  | "json"
  | "json5"
  | "json-stringify"
  | "graphql"
  | "markdown"
  | "mdx"
  | "vue"
  | "yaml"
  | "glimmer"
  | "html"
  | "angular"
  | "lwc";

export type FileOptions = { parser: ParserType };

export async function file(path: string, content: string, { parser }: FileOptions): Promise<void> {
  const formattedContent = prettier.format(content, { parser });
  await writeFile(path, formattedContent, { encoding: "utf8" });
}
