/**
 * fetch-discussions.mjs —— 抓取仓库最近讨论，供「最近讨论」列表使用
 *
 * 由 GitHub Actions 在部署前运行：
 *   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo GISCUS_CATEGORY=Comments node tools/fetch-discussions.mjs
 * 产出：docs/recent.json（[{ term, title, url, updatedAt }]）
 *
 * 本地没有 token 时直接跳过（页面会显示「还没有讨论记录」），不影响开发。
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = process.env.GITHUB_TOKEN;
const repoFull = process.env.GITHUB_REPOSITORY;
const category = process.env.GISCUS_CATEGORY || "Comments";
const OUT = join(ROOT, "docs", "recent.json");

if (!token || !repoFull) {
  console.log("⚠ 未设置 GITHUB_TOKEN / GITHUB_REPOSITORY，跳过最近讨论抓取（本地开发时正常）");
  process.exit(0);
}

const [owner, name] = repoFull.split("/");
const query = `query($owner:String!,$name:String!){
  repository(owner:$owner,name:$name){
    discussions(first:30, orderBy:{field:UPDATED_AT,direction:DESC}){
      nodes{ title url updatedAt category{name} }
    }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "wei-web",
  },
  body: JSON.stringify({ query, variables: { owner, name } }),
});

if (!res.ok) {
  console.error("GraphQL HTTP", res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
if (data.errors) {
  console.error("GraphQL errors:", JSON.stringify(data.errors));
  process.exit(1);
}

const nodes = (data.data && data.data.repository && data.data.repository.discussions.nodes) || [];
const list = nodes
  .filter((n) => !n.category || n.category.name === category)
  .map((n) => ({ term: n.title, title: n.title, url: n.url, updatedAt: n.updatedAt }));

mkdirSync(join(ROOT, "docs"), { recursive: true });
writeFileSync(OUT, JSON.stringify(list, null, 2) + "\n", "utf8");
console.log("✔ 写入", OUT, list.length, "条最近讨论");
