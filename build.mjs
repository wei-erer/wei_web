/**
 * wei_web 构建脚本
 * 把 src/data/*.js（课程数据）、src/app.js、src/style.css 全部内联进 template.html，
 * 产出可分发的单文件：dist/wei_web.html
 *
 * 用法：node build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src");
const DATA = join(SRC, "data");

const read = (p) => readFileSync(p, "utf8");

// 数据文件按固定顺序拼接：_head 必须先定义 COURSE，其余按 PART 顺序 push
const DATA_ORDER = [
  "_head.js",
  "p0.js",
  "p0b.js",
  "p1.js",
  "p2.js",
  "p2b.js",
  "p6.js",
  "p3.js",
  "p3d.js",
  "p4.js",
  "p5a.js",
  "p5b.js",
  "p7.js",
  "p8.js",
];

const parts = [];
for (const f of DATA_ORDER) {
  const p = join(DATA, f);
  if (!existsSync(p)) {
    console.warn("⚠ 缺少数据文件:", f);
    continue;
  }
  parts.push(`/* ===== ${f} ===== */\n` + read(p));
}
const dataCode = parts.join("\n\n");

const style = read(join(SRC, "style.css"));
const app = read(join(SRC, "app.js"));
const config = read(join(SRC, "config.js"));
const tpl = read(join(SRC, "template.html"));

// 防止源码里出现 </script> 把标签提前闭合
const guard = (code) => code.replace(/<\/script>/gi, "<\\/script>");

const out = tpl
  .replace("{{STYLE}}", () => style)
  .replace("{{CONFIG}}", () => guard(config))
  .replace("{{DATA}}", () => guard(dataCode))
  .replace("{{APP}}", () => guard(app));

const dist = join(ROOT, "dist");
mkdirSync(dist, { recursive: true });
const dest = join(dist, "wei_web.html");
writeFileSync(dest, out, "utf8");

console.log("✔ 构建完成:", dest);
console.log("  体积:", (statSync(dest).size / 1024).toFixed(1), "KB");
console.log("  数据文件:", DATA_ORDER.filter((f) => existsSync(join(DATA, f))).length, "个");
