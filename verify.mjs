const url = "http://127.0.0.1:8899/wei_web.html";
const r = await fetch(url);
const t = await r.text();
console.log("HTTP", r.status, "bytes", Buffer.byteLength(t, "utf8"));

const checks = [
  ["标题", "<title>wei_web · CTF Web 学习中心</title>"],
  ["侧栏挂载点", 'id="tree"'],
  ["课程数据", "const COURSE"],
  ["模块数", "modules:"],
  ["flag 彩蛋", "flag{w3lc0me_t0_w3b}"],
  ["样式已内联", "--accent: #4d6bfe"],
  ["应用逻辑", "renderLesson"],
  ["零外部依赖(不应出现)", "<script src="],
  ["零外链CSS(不应出现)", 'rel="stylesheet"'],
];
for (const [name, needle] of checks) {
  const has = t.includes(needle);
  const want = name.includes("不应出现") ? !has : has;
  console.log(`${want ? "✔" : "✘"} ${name}: ${has ? "存在" : "不存在"}`);
}

const lessons = (t.match(/id: "m\d+l\d+"/g) || []).length;
console.log("课程节数(粗计):", lessons);
