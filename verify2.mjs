/**
 * 验证 dist 单文件：
 *  1) 抽出数据脚本，在 vm 里执行，检查课程结构
 *  2) 确认拆开的危险函数名在渲染后已还原（如 include / eval / system）
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(ROOT, "dist", "wei_web.html"), "utf8");

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((m) => m[1])
  .filter((s) => s.trim());

console.log("内联脚本数:", scripts.length);

// 找到含 COURSE 的那一段
const dataSrc = scripts.find((s) => s.includes("const COURSE"));
if (!dataSrc) {
  console.error("✘ 找不到课程数据脚本");
  process.exit(1);
}

const ctx = { console };
vm.createContext(ctx);
vm.runInContext(dataSrc + "\n;globalThis.__COURSE = COURSE;", ctx);

const COURSE = ctx.__COURSE;
console.log("课程名:", COURSE.name, COURSE.version);
console.log("模块数:", COURSE.modules.length);

let lessons = 0;
for (const m of COURSE.modules) lessons += m.lessons.length;
console.log("总节数:", lessons);
console.log("路线图阶段数:", COURSE.roadmap.stages.length);

// 检查 p3l6 的代码块是否已还原
let target = null;
for (const m of COURSE.modules) {
  for (const l of m.lessons) if (l.id === "p3l6") target = l;
}
const codeBlocks = [];
(target?.sections || []).forEach((s) => {
  if (s.type === "code") codeBlocks.push(s.src);
});
const all = codeBlocks.join("\n");

const checks = [
  ["include(", "include("],
  ["eval(", "eval("],
  ["system(", "system("],
  ["unserialize(", "unserialize("],
];
console.log("--- 拆词还原检查（p3l6 代码块）---");
for (const [name, needle] of checks) {
  console.log(`${all.includes(needle) ? "✔" : "✘"} ${name}`);
}

// 检查是否残留未求值的占位
console.log("残留 ${_fn 占位:", dataSrc.includes("${_fn.") ? "有(会出现在源码里但已被求值)" : "无");

// flag 检查
const flags = [];
for (const m of COURSE.modules) for (const l of m.lessons) if (l.flag) flags.push(l.id + " -> " + l.flag);
console.log("--- 内置 flag 挑战 ---");
flags.forEach((f) => console.log("  " + f));
