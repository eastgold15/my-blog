declare module "remark-obsidian" {
  import type { Plugin } from "unified";
  import type { Root } from "mdast";

  const remarkObsidian: Plugin<[], Root>;
  export default remarkObsidian;
}
