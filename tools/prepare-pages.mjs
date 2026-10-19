/**
 * prepare-pages.mjs —— 把构建产物同步到 docs/，用于 GitHub Pages
 * 用法：node tools/prepare-pages.mjs
 *   docs/index.html  交互版（dist/wei_web.html）
 *   docs/read.html   阅读版（md/wei_web-阅读版.html）
 *   docs/p*.md       各 PART 的 Markdown
 *   docs/.nojekyll   关闭 Jekyll，避免下划线开头的文件被忽略
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");

mkdirSync(DOCS, { recursive: true });

const pairs = [
  [join(ROOT, "dist", "wei_web.html"), join(DOCS, "index.html")],
  [join(ROOT, "md", "wei_web-阅读版.html"), join(DOCS, "read.html")],
];

for (const [src, dst] of pairs) {
  if (!existsSync(src)) {
    console.error("✘ 缺少文件:", src, "（先运行 node build.mjs 与 node tools/export-md.mjs）");
    process.exit(1);
  }
  copyFileSync(src, dst);
  console.log("✔ 复制", src, "→", dst);
}

const mdDir = join(ROOT, "md");
for (const f of readdirSync(mdDir)) {
  if (/^p\w*\.md$/.test(f)) copyFileSync(join(mdDir, f), join(DOCS, f));
}
writeFileSync(join(DOCS, ".nojekyll"), "", "utf8");
console.log("✔ docs/ 就绪，可直接用于 GitHub Pages");
