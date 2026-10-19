/**
 * export-md.mjs —— 把课程数据导出成 Markdown（便于放到 GitHub / docsify / 语雀 / Notion 等网页阅读）
 * 用法：node tools/export-md.mjs
 * 产物：md/README.md、md/<模块id>.md、md/_sidebar.md、md/index.html（docsify 入口）
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DATA = join(ROOT, "src", "data");
const OUT = join(ROOT, "md");

const ORDER = [
  "_head.js", "p0.js", "p0b.js", "p1.js", "p2.js", "p2b.js", "p6.js",
  "p3.js", "p3d.js", "p4.js", "p5a.js", "p5b.js", "p7.js", "p8.js",
];

const parts = ORDER.filter((f) => existsSync(join(DATA, f))).map((f) => readFileSync(join(DATA, f), "utf8"));
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(parts.join("\n\n") + "\n;globalThis.__COURSE = COURSE;", ctx);
const C = ctx.__COURSE;

/* ---------- 工具函数 ---------- */

const esc = (s) =>
  String(s)
    .replace(/<br\s*\/?>/gi, "  \n")
    .replace(/<\/?(b|strong)>/gi, (m, t) => (m[1] === "/" ? "**" : "**"))
    .replace(/<\/?(i|em)>/gi, "*")
    .replace(/<code>([\s\S]*?)<\/code>/gi, (m, x) => "`" + x + "`")
    .replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, text) => `[${text}](${href})`)
    .replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();

const pipeEsc = (s) => esc(s).replace(/\|/g, "\\|").replace(/\n/g, "<br>");

function codeBlock(c) {
  const lang = c.lang && c.lang !== "text" ? c.lang : "";
  const title = c.title ? `**${c.title}**\n\n` : "";
  return `${title}\`\`\`${lang}\n${String(c.src).replace(/\`\`\`/g, "'''")}\n\`\`\`\n`;
}

function tableBlock(s) {
  const head = "| " + s.head.map(pipeEsc).join(" | ") + " |";
  const sep = "| " + s.head.map(() => "---").join(" | ") + " |";
  const rows = s.rows.map((r) => "| " + r.map(pipeEsc).join(" | ") + " |").join("\n");
  return (s.title ? `**${esc(s.title)}**\n\n` : "") + `${head}\n${sep}\n${rows}\n`;
}

function stepsBlock(s) {
  return s.items.map((it, i) => `${i + 1}. ${esc(it)}`).join("\n") + "\n";
}

function sectionsToMd(sections) {
  const out = [];
  for (const s of sections) {
    if (s.type === "h") out.push(`### ${esc(s.text)}\n`);
    else if (s.type === "p") out.push(`${esc(s.text)}\n`);
    else if (s.type === "list") out.push(s.items.map((x) => `- ${esc(x)}`).join("\n") + "\n");
    else if (s.type === "note") out.push(`> 💡 ${esc(s.text)}\n`);
    else if (s.type === "code") out.push(codeBlock(s));
    else if (s.type === "table") out.push(tableBlock(s));
    else if (s.type === "steps") out.push(stepsBlock(s));
  }
  return out.join("\n");
}

function lessonToMd(l) {
  const out = [`## ${esc(l.title)}\n`];
  const meta = [];
  if (l.est) meta.push(`约 ${l.est} 分钟`);
  if (meta.length) out.push(`*${meta.join(" · ")}*\n`);
  if (l.goal) out.push(`> 🎯 **本节目标**：${esc(l.goal)}\n`);
  out.push(sectionsToMd(l.sections || []));
  if (l.code && l.code.length) out.push(l.code.map(codeBlock).join("\n"));
  if (l.flag) out.push("\n> 🚩 本节含一个提交型 flag 挑战，请在课程中心的单文件版本里作答（答案未写入此 Markdown）。\n");
  if (l.labs && l.labs.length) {
    out.push("\n### 靶场与资源\n");
    out.push(l.labs.map((x) => `- [${esc(x.name)}](${x.url})`).join("\n") + "\n");
  }
  if (l.quiz && l.quiz.length) {
    out.push("\n### 自测 · 答不上就回去重读\n");
    out.push(l.quiz.map((q, i) => `${i + 1}. ${esc(q)}`).join("\n") + "\n");
  }
  return out.join("\n");
}

function moduleToMd(m) {
  const out = [`# ${esc(m.title)}\n`];
  const meta = [];
  if (m.weeks) meta.push(m.weeks);
  meta.push(`${m.lessons.length} 节`);
  out.push(`*${meta.join(" · ")}*\n`);
  if (m.summary) out.push(`> ${esc(m.summary)}\n`);
  out.push("---\n");
  for (const l of m.lessons) out.push(lessonToMd(l) + "\n---\n");
  return out.join("\n");
}

/* ---------- 输出 ---------- */
mkdirSync(OUT, { recursive: true });

const files = [];
const rows = [];
for (const m of C.modules) {
  const file = `${m.id}.md`;
  writeFileSync(join(OUT, file), moduleToMd(m), "utf8");
  files.push({ file, title: m.title, weeks: m.weeks, n: m.lessons.length });
  rows.push(`| ${esc(m.title)} | ${m.weeks || ""} | ${m.lessons.length} | [阅读](${file}) |`);
}

const total = C.modules.reduce((a, m) => a + m.lessons.length, 0);
const readme = `# ${C.name} · ${C.subtitle}

> 面向 Web 安全初学者的开源课程中心：${C.modules.length} 个 PART、${total} 节，单文件离线可用，含间隔重复复习卡与靶场清单。

**${C.name}** 把 Web 安全的学习路径拆成 ${C.modules.length} 个 PART、${total} 节，并按「四条线并行」组织：地基、工具、脚本（Python 先于 PHP）、漏洞与流程，给出 22 周的推荐节奏。工具与简单题从 PART 3 就开始，不需要学完语言才动手。

课程强调「动手」：每节都有最小复现代码、可执行步骤、靶场链接和自测题，全部 ${total} 节都要学、不设选修。整个课程打包成一个可离线打开的 HTML 文件，不需要服务器、账号或联网。

内置能力：学习面板（总进度、连续打卡、20 周计划、今日一题）、间隔重复复习卡（1 / 3 / 7 / 15 / 30 天）、靶场清单勾选、本地笔记与进度，以及数据导出 / 导入迁移；所有数据只保存在浏览器本地。

> ${esc(C.intro)}

**规模**：${C.modules.length} 个 PART / ${total} 节 / 技术栈路线 ${C.roadmap.stages.length} 阶段。

## 目录

| PART | 时间 | 节数 | 链接 |
| --- | --- | --- | --- |
${rows.join("\n")}

## 这份 Markdown 怎么用

- **单文件阅读版（最省事）**：\`wei_web-阅读版.html\` —— 已把全部 Markdown 渲染成网页，双击就能看，不联网、不依赖任何平台；发给别人或上传到静态托管即可。
- **完整课程（可交互）**：\`../dist/wei_web.html\` —— 带进度条、笔记自动保存、flag 挑战，同样单文件离线可用。
- **GitHub / Gitee 仓库**：把 \`md/\` 里的文件推上去，打开仓库就能直接渲染阅读（README 就是目录）。
- **语雀 / Notion / 飞书**：导入 \`wei_web-完整课程.md\`（单文件合并版，约 190 KB），一步到位。
- **docsify / VitePress / MkDocs**：把 \`md/\` 当作文档目录即可；本目录已带 \`_sidebar.md\` 和 \`index.html\`（docsify 入口，需联网加载 CDN，离线环境会停在「加载中」）。

> 说明：Markdown 与阅读版是「只读版」——不带进度条、笔记自动保存和 flag 校验；这些交互只在完整课程版（\`dist/wei_web.html\`）里。
`;

writeFileSync(join(OUT, "README.md"), readme, "utf8");

const sidebar = ["- [首页](README.md)"]; 
for (const f of files) sidebar.push(`- [${f.title}（${f.n} 节）](${f.file})`);
writeFileSync(join(OUT, "_sidebar.md"), sidebar.join("\n") + "\n", "utf8");

// 单文件合并版：方便一次性导入 Notion / 语雀 / 飞书
const merged = [
  `# ${C.name} · ${C.subtitle}`,
  "",
  `> ${esc(C.intro)}`,
  "",
  `**规模**：${C.modules.length} 个 PART / ${total} 节。`,
  "",
  "## 目录",
  "",
  ...C.modules.map((m) => `- ${esc(m.title)}（${m.weeks || ""} · ${m.lessons.length} 节）`),
  "",
  "---",
  "",
  ...C.modules.map((m) => moduleToMd(m)),
].join("\n");
writeFileSync(join(OUT, "wei_web-完整课程.md"), merged, "utf8");

/* ---------- 自包含 HTML 阅读版（离线可用，无需 CDN） ---------- */
const escHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function htmlSections(sections) {
  const out = [];
  for (const s of sections) {
    if (s.type === "h") out.push(`<h3>${s.text}</h3>`);
    else if (s.type === "p") out.push(`<p>${s.text}</p>`);
    else if (s.type === "list") out.push(`<ul>${s.items.map((x) => `<li>${x}</li>`).join("")}</ul>`);
    else if (s.type === "note") out.push(`<blockquote class="note">💡 ${s.text}</blockquote>`);
    else if (s.type === "code")
      out.push(
        `<div class="code"><div class="cbar">${s.title ? escHtml(s.title) + " · " : ""}${escHtml(s.lang || "code")}</div><pre><code>${escHtml(s.src)}</code></pre></div>`
      );
    else if (s.type === "table") {
      const head = s.head.map((h) => `<th>${h}</th>`).join("");
      const rows = s.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
      out.push(
        `<div class="tablewrap">${s.title ? `<div class="tcap">${escHtml(s.title)}</div>` : ""}<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`
      );
    } else if (s.type === "steps")
      out.push(`<ol class="steps">${s.items.map((x) => `<li>${x}</li>`).join("")}</ol>`);
  }
  return out.join("\n");
}

function lessonHtml(l) {
  const parts = [`<article id="l-${l.id}">`, `<h2>${l.title}</h2>`];
  parts.push(`<div class="meta">约 ${l.est || 20} 分钟</div>`);
  if (l.goal) parts.push(`<div class="goal"><b>🎯 本节目标</b><p>${l.goal}</p></div>`);
  parts.push(htmlSections(l.sections || []));
  if (l.code && l.code.length)
    parts.push(
      l.code
        .map(
          (c) =>
            `<div class="code"><div class="cbar">${c.title ? escHtml(c.title) + " · " : ""}${escHtml(c.lang || "code")}</div><pre><code>${escHtml(c.src)}</code></pre></div>`
        )
        .join("")
    );
  if (l.flag) parts.push(`<blockquote class="note">🚩 本节含提交型 flag 挑战，请在交互版（dist/wei_web.html）里作答。</blockquote>`);
  if (l.labs && l.labs.length)
    parts.push(`<h3>靶场与资源</h3><ul class="links">${l.labs.map((x) => `<li><a href="${x.url}" target="_blank" rel="noopener">${x.name}</a></li>`).join("")}</ul>`);
  if (l.quiz && l.quiz.length)
    parts.push(`<h3>自测 · 答不上就回去重读</h3><ol class="quiz">${l.quiz.map((q) => `<li>${q}</li>`).join("")}</ol>`);
  parts.push(`</article>`);
  return parts.join("\n");
}

const toc = C.modules
  .map(
    (m) =>
      `<div class="tocmod"><a href="#m-${m.id}" class="tochead">${m.title}</a><div class="tocles">${m.lessons
        .map((l) => `<a href="#l-${l.id}">${l.title}</a>`)
        .join("")}</div></div>`
  )
  .join("");

const body = C.modules
  .map(
    (m) =>
      `<section class="mod" id="m-${m.id}"><h1>${m.title}</h1><div class="sub">${m.weeks || ""} · ${m.lessons.length} 节</div><blockquote class="note">${m.summary || ""}</blockquote>${m.lessons
        .map(lessonHtml)
        .join("\n")}</section>`
  )
  .join("\n");

const readHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${C.name} · ${C.subtitle}（阅读版）</title>
<style>
:root { color-scheme: dark; --bg:#0f1115; --card:#161922; --card2:#1c2029; --border:#272c37; --text:#e6e9ef; --dim:#9aa3b2; --accent:#4d6bfe; --code:#0b0d12; }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--text); font: 15px/1.75 -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif; }
.wrap { display:flex; min-height:100vh; }
aside { width:280px; flex:0 0 280px; border-right:1px solid var(--border); padding:20px 14px; position:sticky; top:0; height:100vh; overflow:auto; background:var(--card); }
aside .brand { font-weight:700; font-size:16px; margin-bottom:4px; }
aside .brand small { color:var(--dim); font-weight:400; font-size:12px; margin-left:6px; }
.tocmod { margin-top:12px; }
.tochead { display:block; font-size:13px; font-weight:600; color:var(--text); text-decoration:none; padding:4px 0; }
.tocles { display:flex; flex-direction:column; }
.tocles a { font-size:12.5px; color:var(--dim); text-decoration:none; padding:2px 0 2px 10px; border-left:2px solid transparent; }
.tocles a:hover { color:var(--accent); border-left-color:var(--accent); }
main { flex:1; min-width:0; padding:36px 40px 90px; max-width:900px; }
h1 { font-size:26px; margin:34px 0 4px; padding-top:14px; border-top:1px solid var(--border); }
section.mod:first-child h1 { border-top:0; margin-top:0; }
h2 { font-size:20px; margin:30px 0 6px; }
h3 { font-size:15.5px; margin:22px 0 8px; }
.meta, .sub { color:var(--dim); font-size:12.5px; }
.goal { border:1px solid var(--border); border-left:3px solid var(--accent); background:var(--card); border-radius:8px; padding:12px 16px; margin:14px 0 20px; }
.goal p { margin:4px 0 0; }
blockquote.note { background:#161d33; border:1px solid var(--border); border-radius:8px; margin:0 0 16px; padding:12px 16px; font-size:14px; }
ul, ol { padding-left:22px; }
li { margin:4px 0; }
code { font-family: ui-monospace, Consolas, "SF Mono", monospace; font-size:0.92em; color:#9db3ff; }
.code { border:1px solid var(--border); border-radius:8px; overflow:hidden; margin:0 0 18px; background:var(--card); }
.code .cbar { background:var(--card2); padding:6px 12px; font-size:11.5px; color:var(--dim); font-family: ui-monospace, Consolas, monospace; }
.code pre { margin:0; padding:13px 15px; overflow-x:auto; background:var(--code); font-size:12.8px; line-height:1.65; }
.tablewrap { border:1px solid var(--border); border-radius:8px; overflow-x:auto; margin:0 0 18px; }
.tcap { background:var(--card2); padding:8px 12px; font-size:12px; color:var(--accent); }
table { border-collapse:collapse; width:100%; font-size:13px; }
th, td { border-top:1px solid var(--border); padding:8px 12px; text-align:left; vertical-align:top; }
th { background:var(--card2); color:var(--dim); font-weight:600; white-space:nowrap; }
ol.steps { list-style:none; padding-left:0; counter-reset:st; }
ol.steps li { counter-increment:st; position:relative; padding:8px 12px 8px 40px; background:var(--card); border:1px solid var(--border); border-radius:8px; margin-bottom:7px; }
ol.steps li::before { content:counter(st); position:absolute; left:11px; top:8px; width:20px; height:20px; border-radius:50%; background:var(--accent); color:#fff; font-size:11px; display:flex; align-items:center; justify-content:center; }
ol.quiz li { background:var(--card); border:1px solid var(--border); border-radius:8px; margin-bottom:7px; padding:9px 14px; }
ul.links a { color:var(--accent); }
@media (max-width: 860px) {
  .wrap { flex-direction:column; }
  aside { width:auto; flex:none; height:auto; position:static; border-right:0; border-bottom:1px solid var(--border); }
  main { padding:22px 18px 70px; }
}
</style>
</head>
<body>
<div class="wrap">
<aside>
  <div class="brand">${C.name}<small>${C.subtitle}</small></div>
  <div class="meta">${C.modules.length} 个 PART · ${total} 节</div>
  ${toc}
</aside>
<main>
${body}
</main>
</div>
</body>
</html>
`;
writeFileSync(join(OUT, "wei_web-阅读版.html"), readHtml, "utf8");

/* ---------- docsify 入口（需联网加载 CDN；离线场景用上面的阅读版） ---------- */
const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${C.name} · ${C.subtitle}</title>
<style>
  body { margin: 0; }
  .app-nav { display: none; }
</style>
</head>
<body>
<div id="app">加载中…</div>
<script>
  window.$docsify = {
    name: "${C.name}",
    repo: "",
    loadSidebar: true,
    subMaxLevel: 2,
    auto2top: true,
    search: { maxAge: 86400000, paths: 'auto' },
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/docsify@4"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-bash.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-sql.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-php.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-python.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-json.min.js"></script>
</body>
</html>
`;
writeFileSync(join(OUT, "index.html"), indexHtml, "utf8");

console.log("生成文件:", files.length + 3, "个 →", OUT);
console.log("模块:", C.modules.length, "节数:", total);
for (const f of files) console.log("  ", f.file.padEnd(8), f.n, "节", f.title);
