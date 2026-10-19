/**
 * verify3.mjs —— 深度校验 dist 单文件里的课程数据
 * 检查：模块/节数、id 唯一、每节结构完整、表格与步骤结构、flag、残留占位、路线图
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

const dataSrc = scripts.find((s) => s.includes("const COURSE"));
if (!dataSrc) { console.error("✘ 找不到 COURSE 数据脚本"); process.exit(1); }

const ctx = { console };
vm.createContext(ctx);
vm.runInContext(dataSrc + "\n;globalThis.__COURSE = COURSE;", ctx);
const C = ctx.__COURSE;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? "✔ " : "✘ ") + msg); if (!cond) fail++; };

console.log("=== 总体 ===");
console.log("版本:", C.version, "| 模块:", C.modules.length, "| 路线阶段:", C.roadmap.stages.length);

const lessons = [];
const modIds = new Set();
for (const m of C.modules) {
  ok(!modIds.has(m.id), `模块 id 唯一: ${m.id}`);
  modIds.add(m.id);
  if (!/^PART/.test(m.title)) console.log("  ! 模块标题不以 PART 开头:", m.id, m.title);
  for (const l of m.lessons) lessons.push({ m, l });
}
console.log("总节数:", lessons.length);

const lessonIds = new Set();
for (const { m, l } of lessons) {
  ok(!lessonIds.has(l.id), `${l.id} id 唯一`);
  lessonIds.add(l.id);
  ok(Array.isArray(l.sections) && l.sections.length > 0, `${l.id} 有正文`);
  ok(typeof l.est === "number", `${l.id} 有预计时长`);
  ok(typeof l.goal === "string" && l.goal.length > 0, `${l.id} 有目标`);
  ok(Array.isArray(l.quiz) && l.quiz.length >= 2, `${l.id} 自测 >= 2 题`);
  for (const s of l.sections) {
    if (s.type === "table") {
      ok(Array.isArray(s.head) && s.head.length > 0, `${l.id} 表格有表头`);
      ok(Array.isArray(s.rows) && s.rows.length > 0 && s.rows.every(r => r.length === s.head.length),
         `${l.id} 表格行宽一致 (${s.rows?.length} 行)`);
    }
    if (s.type === "steps") ok(Array.isArray(s.items) && s.items.length >= 2, `${l.id} steps >= 2 步`);
    if (s.type === "code") ok(typeof s.src === "string" && s.src.trim().length > 0, `${l.id} 代码块非空`);
    if ((s.type === "p" || s.type === "note" || s.type === "h") && !s.text) ok(false, `${l.id} ${s.type} 缺 text`);
  }
}

console.log("=== 核心 / 选学 ===");
const optional = lessons.filter((x) => x.l.core === false);
console.log("全部必学:", lessons.length, "节 | 选学:", optional.length, "节");
ok(optional.length === 0, "没有选修节（全部必学）");

console.log("=== PART 5 检查 ===");
const p5 = C.modules.filter((m) => m.id.startsWith("p5"));
const p5lessons = p5.flatMap((m) => m.lessons);
console.log("PART 5 节数:", p5lessons.length);
let tables = 0, steps = 0;
for (const l of p5lessons) {
  for (const s of l.sections) { if (s.type === "table") tables++; if (s.type === "steps") steps++; }
}
console.log("PART 5 表格数:", tables, "| 步骤块:", steps);
ok(p5lessons.length === 18, "PART 5 共 18 节");

console.log("=== 残留占位 / 敏感构建 ===");
for (const bad of ["待编写", "TODO", "{{STYLE}}", "{{DATA}}", "{{APP}}"]) {
  ok(!html.includes(bad), `dist 中不含 "${bad}"`);
}

console.log("=== flag ===");
const flags = lessons.filter((x) => x.l.flag).map((x) => x.l.id + " -> " + x.l.flag);
flags.forEach((f) => console.log("  " + f));
ok(flags.length === 2, "两个 flag 挑战");
ok(html.includes("__weiweb_bundle"), "页面内嵌 __weiweb_bundle 压缩脚本");

console.log("=== 路线图 ===");
console.log("阶段:", C.roadmap.stages.map((s) => s.stage + " " + s.name).join(" | "));
ok(C.roadmap.stages.length === 7, "路线图 7 个阶段");
ok(C.roadmap.cross.length >= 6, "横向能力 >= 6 项");

console.log("=== 每模块节数 ===");
for (const m of C.modules) console.log(`  ${m.id.padEnd(4)} ${String(m.lessons.length).padStart(2)} 节  ${m.title}`);

console.log(fail === 0 ? "\nALL CHECKS PASSED" : `\n${fail} CHECK(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
