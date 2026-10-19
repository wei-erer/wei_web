/**
 * 校验 dist 单文件里的内联脚本语法（用 node --check 的方式：写临时文件后 spawn 检查）。
 * 这里不 spawn，只把脚本切出来落盘，交给外层命令逐个 --check。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(ROOT, "dist", "wei_web.html"), "utf8");

const re = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi;
let m, i = 0;
const tmp = join(ROOT, "dist", "_check");
mkdirSync(tmp, { recursive: true });

while ((m = re.exec(html)) !== null) {
  const body = m[1];
  if (!body.trim()) continue;
  i++;
  const p = join(tmp, `inline-${i}.cjs`);
  writeFileSync(p, body, "utf8");
  console.log(p);
}
// 顺便检查 <style> 是否有未闭合的大括号
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
for (const s of styles) {
  const open = (s[1].match(/{/g) || []).length;
  const close = (s[1].match(/}/g) || []).length;
  console.log(`STYLE braces: { = ${open}, } = ${close}`, open === close ? "OK" : "MISMATCH");
}
console.log("inline scripts:", i);
