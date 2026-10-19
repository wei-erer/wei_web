# wei_web · CTF Web 学习中心

> 面向 Web 安全初学者的开源课程中心：13 个 PART、82 节，单文件离线可用，含间隔重复复习卡与靶场清单。

**wei_web** 把 Web 安全的学习路径拆成 13 个 PART、82 节，并按「四条线并行」组织：地基（浏览器 / HTTP）、工具（抓包 / 靶场 / 查手册）、脚本（Python 优先、Python 先于 PHP）、漏洞与流程（18 类漏洞 + 渗透测试全流程）。工具和简单题从 PART 3 就开始，不需要学完语言才动手。

课程强调「动手」：每节都有最小复现代码、可执行步骤、靶场链接和自测题，全部 82 节都要学、不设选修。整个课程打包成一个可离线打开的 HTML 文件，双击即可学习，不需要服务器、账号或联网。

内置的能力围绕「记得住、练得到」设计：学习面板（总进度、连续打卡、22 周计划、今日一题）、间隔重复复习卡（1 / 3 / 7 / 15 / 30 天）、靶场清单勾选、本地笔记与进度，以及数据导出 / 导入迁移。所有数据只保存在浏览器本地。

项目以 MIT 协议开源，正在从单文件版向静态站点与移动端（PWA）演进，欢迎新手使用、也欢迎社区一起补齐内容和靶场题号。

## 两种使用方式

| 方式 | 文件 | 说明 |
| --- | --- | --- |
| 交互版（推荐） | `dist/wei_web.html` | 带学习面板、进度、笔记、复习卡、靶场清单、两个 flag 挑战 |
| 阅读版 | `md/wei_web-阅读版.html` | 纯阅读，适合分享与打印 |
| Markdown | `md/p*.md` | 便于导入语雀 / Notion / 飞书，或部署到 docsify / VitePress |

## 在线访问（GitHub Pages）

仓库里已经准备好 `docs/` 与 `.github/workflows/pages.yml`，推到 GitHub 后打开 Pages 即可得到网址：

1. 在 GitHub 新建仓库，把本目录推上去（默认分支 `main`）。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
3. 推一次代码（或手动跑一次 `Deploy to GitHub Pages` 工作流），约 1 分钟后网址可用：`https://<用户名>.github.io/<仓库名>/`。

页面结构：首页 = 交互版（`docs/index.html`），`/read.html` = 阅读版，`/p5.md` 等 = Markdown 原文。

本地预览与重建：

```bash
npm run pages     # 重新构建并同步 docs/
python -m http.server 8000 --directory docs   # 打开 http://127.0.0.1:8000/
```

> 如果不想用 Actions：把仓库 Pages 的 Source 改成「Deploy from a branch」，分支选 `main`、目录选 `/docs` 也可以。

## 评论区（giscus，可选）

评论用 [giscus](https://giscus.app/zh-CN)（基于 GitHub Discussions）实现，免费、无后端，默认关闭。

启用步骤：

1. 仓库设为 **public**，Settings → Features 勾选 **Discussions**。
2. 新建一个分类（建议 **Announcements** 类型），名称如 `Comments`。
3. 安装 giscus App（<https://github.com/apps/giscus>），授权到该仓库。
4. 打开 <https://giscus.app/zh-CN>，填入仓库名、选好分类，复制生成的 `repoId` 与 `categoryId`。
5. 编辑 `src/config.js`：

```js
window.WEIWEB_CONFIG = {
  comments: {
    enabled: true,
    repo: "yourname/wei_web",
    repoId: "R_xxxxxx",
    category: "Comments",
    categoryId: "DIC_xxxxxx",
    lang: "zh-CN"
  }
};
```

6. 运行 `npm run pages` 重新构建并部署。

说明：每节一个讨论（`mapping: specific`，`term` 用课程 id），评论随主题自动切换深浅色；本地双击打开时只显示提示，不会加载外部脚本。

### 最近讨论与全局讨论

- 侧栏「💬 讨论区」= 全局讨论页：上面是最近讨论列表，下面是一个固定的全局讨论串（`term = global`）。
- 「最近讨论」列表由 `.github/workflows/pages.yml` 在每次部署时用 GitHub GraphQL 抓取，写入 `docs/recent.json`；本地没有该文件时显示「还没有讨论记录」。
- 想手动生成：`GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo npm run discussions`（需要 `discussions: read` 权限）。

## 课程结构

| PART | 内容 | 周次 |
| --- | --- | --- |
| 0 / 0.5 | 开课准备、终端与 WSL、20 个命令、本地起服务 | 第 1 周内 |
| 1 | HTML / CSS / JS / 控制台 / 读源码 | 1–2 |
| 2 / 2.5 | HTTP、Cookie、curl；四层组件与六段旅程 | 2–3 |
| 3 | 工具与第一次解题：Burp、靶场、信息收集、外部手册 | 3–4 |
| 4 | 编程：JS、Python（先）、PHP（后）、读源码四步法 | 4–7 |
| 5 | 自己写一个 Web 应用（Flask 小站 + 自查清单） | 7–9 |
| 6 | 框架认知（快速过） | 9–10 |
| 7 / 8 | 18 类漏洞：信息泄露 → SQLi → XSS → … → 原型链污染 | 10–18 |
| 9 | 渗透流程：收集 → 验证 → 后渗透 → 报告 + 解题方法论 | 18–20 |
| 10 | 实战复盘 | 20–22 |

## 功能

- **学习面板**：总进度、连续打卡、22 周计划（设置开始日期自动排周）、今日一题
- **复习卡**：每节的自测题自动成为卡片，按 1 / 3 / 7 / 15 / 30 天间隔重复
- **靶场清单**：每节的靶场与资源可勾选，统计完成度
- **进度与笔记**：localStorage 本地保存，支持 JSON 导出 / 导入迁移
- **两个可提交的 flag 挑战**：分别藏在 `<head>` 注释与页面内联脚本里

## 开发

```bash
# 重新打包单文件（产出 dist/wei_web.html）
node build.mjs

# 数据与结构校验
node verify3.mjs

# 生成 Markdown / 阅读版（产出 md/）
node tools/export-md.mjs

# 内联脚本语法检查（先运行 build）
node check-inline.mjs
```

源码结构：

```
src/
  template.html     页面骨架（含 flag 彩蛋与内联脚本位）
  style.css         样式（深色 / 浅色主题、响应式）
  app.js            应用逻辑（路由、进度、笔记、复习卡、靶场、面板）
  data/             课程数据（按 PART 拆分，build 时按顺序拼接）
tools/
  export-md.mjs     课程数据 → Markdown / 阅读版 HTML
  pptx_dump.py      参考课件文字提取（可选）
refs/               参考资料提取文本
dist/               构建产物（单文件 HTML）
md/                 阅读版与 Markdown
share/              分享用压缩包
```

## 路线图

- 当前：单文件版（桌面浏览器）
- 计划：部署为静态站点；适配移动端；拆出可复用的题库与复习数据格式
- 欢迎提交 issue / PR：新增课程、修正内容、补充靶场题号、改进前端

## 许可

MIT License，见 [LICENSE](LICENSE)。
