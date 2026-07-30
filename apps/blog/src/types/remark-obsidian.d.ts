declare module "remark-obsidian" {
  import type { Root } from "mdast";
  import type { Plugin } from "unified";

  const remarkObsidian: Plugin<[], Root>;
  export default remarkObsidian;
}
