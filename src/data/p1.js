/* PART 1 · Web 地基 */
COURSE.modules.push({
  id: "p1",
  title: "PART 1 · Web 地基",
  weeks: "第 1–2 周",
  summary: "浏览器里的一切：HTML 结构、CSS 隐藏、JS 行为、控制台、开发者工具、读源码。这一层不学，后面全是背 payload。",
  lessons: [
    {
      id: "p1l1",
      title: "HTML：网页的骨架",
      est: 25,
      goal: "看懂任意网页的 HTML 结构，分清「给人看的」和「给浏览器看的」。",
      sections: [
        { type: "p", text: "HTML 用「标签」描述页面有什么内容。浏览器读到标签，才知道哪里是标题、哪里是图片、哪里是链接。" },
        { type: "code", lang: "html", title: "最小网页结构", src: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>我的第一个网页</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>你好，Web</h1>
    <p>这是一段文字。</p>
    <a href="https://example.com">一个链接</a>
    <img src="cat.png" alt="一只猫">
    <!-- 注释：浏览器不会显示这一行 -->
  </body>
</html>` },
        { type: "list", items: [
          "<b>&lt;head&gt;</b>：给浏览器看的信息。标题、字符集、外部样式、脚本、meta 信息。不直接显示在页面上。",
          "<b>&lt;body&gt;</b>：给人看的内容。",
          "常见标签：<b>h1-h6</b> 标题、<b>p</b> 段落、<b>a</b> 链接、<b>img</b> 图片、<b>div</b> 区块、<b>form/input</b> 表单。",
          "<b>属性</b>：name=\"value\" 给标签补充信息，例如 href、src、class、id、type。",
          "<b>&lt;!-- --&gt;</b>：注释。页面上看不到，但源码里完整存在。"
        ]},
        { type: "note", text: "CTF 里大量「藏在页面里」的 flag，就藏在注释、隐藏表单字段、display:none 的元素、或者 data-* 自定义属性里。记住：能发到浏览器的，就不算秘密。" },
        { type: "p", text: "动手：在桌面新建 hello.html，粘进上面的代码，双击用浏览器打开，然后按 F12 看 Elements 面板。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "&lt;head&gt; 和 &lt;body&gt; 的内容，哪个会显示在页面上？",
        "注释在页面上能看到吗？在哪里能看到？",
        "写出一个带链接的段落和一个带 id 的 div。"
      ]
    },
    {
      id: "p1l2",
      title: "CSS：样式，以及「被藏起来的东西」",
      est: 25,
      goal: "知道 CSS 能隐藏内容，并能在 Elements 面板里把隐藏的东西「扒出来」。",
      sections: [
        { type: "p", text: "CSS 决定页面长什么样。选择器选中元素，声明块决定属性。" },
        { type: "code", lang: "css", title: "三种常见的「隐藏」", src: `/* 1. 完全不占位，元素还在 DOM 里 */
.hidden { display: none; }

/* 2. 占位但看不见 */
.invisible { visibility: hidden; }

/* 3. 透明 / 移出屏幕外 —— 内容仍然可选中、可读 */
.ghost {
  opacity: 0;
  position: absolute;
  left: -9999px;
}` },
        { type: "p", text: "这三种方式都只是「视觉隐藏」。DOM 里内容原样存在，F12 一看就露。" },
        { type: "p", text: "实操：在 Elements 面板选中元素，右侧 Styles 里把 <b>display: none</b> 取消勾选，元素立刻出现。这是 CTF 里最基本的一招。" },
        { type: "code", lang: "html", title: "练习用页面", src: `<div style="display:none">你找到我了</div>
<div style="opacity:0">我也在</div>
<input type="hidden" name="token" value="secret-token">` },
        { type: "note", text: "注意最后那个 &lt;input type=\"hidden\"&gt;：它不是 CSS 隐藏，而是表单字段本身就不显示。它的 value 会随表单一起提交——这是「前端泄露」的经典位置。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "display:none 和 visibility:hidden 的区别是什么？",
        "元素被 display:none 之后，内容还在 DOM 里吗？",
        "type=\"hidden\" 的 input 有什么安全风险？"
      ]
    },
    {
      id: "p1l3",
      title: "JavaScript：从看懂到能改页面",
      est: 35,
      goal: "读懂基本 JS 代码，并能在控制台里改页面内容、发一个请求。",
      sections: [
        { type: "p", text: "JavaScript 让页面「动起来」：响应点击、发请求、改内容。它是 Web 方向第一门必须掌握的语言。" },
        { type: "code", lang: "js", title: "最小语法集", src: `// 变量
var a = 1;            // 老写法，函数作用域
let b = "text";       // 块级作用域
const c = true;       // 常量，不可重新赋值

// 对象与数组
const user = { name: "wei", age: 18, tags: ["web", "ctf"] };
console.log(user.name);      // wei
console.log(user.tags[0]);   // web

// 函数
function add(x, y) { return x + y; }
const mul = (x, y) => x * y;  // 箭头函数，等价写法

// 条件与循环
if (user.age >= 18) { console.log("adult"); }
for (const t of user.tags) { console.log(t); }` },
        { type: "code", lang: "js", title: "操作页面（DOM）", src: `// 选中元素
const box = document.getElementById("box");
const first = document.querySelector("h1");
const all = document.querySelectorAll("a");   // 类数组

// 改内容与样式
box.textContent = "被改了";
box.style.background = "red";

// 读属性
console.log(box.getAttribute("data-x"));

// 绑定事件
box.onclick = () => alert("你点了我");` },
        { type: "code", lang: "js", title: "发请求（fetch）", src: `fetch("/api/user?id=1")
  .then(r => r.json())          // 把响应体当 JSON 解析
  .then(data => console.log(data))
  .catch(err => console.error(err));` },
        { type: "touch", title: "为什么会有 XSS", text: "同一段字符串，放进 <code>textContent</code> 是文本，放进 <code>innerHTML</code> 就变成 HTML；浏览器一旦把它当标签/脚本解析，XSS 就诞生了。浏览器不是没防：<b>CSP</b> 限制能执行什么、<b>HttpOnly</b> 保护凭据不被脚本读取、<b>Trusted Types</b> 限制危险赋值，同源策略则限制跨源读取；但每种防护都有前提和绕过史——这正是图谱里 XSS 节点要追的主线。", links: [
          { name: "图谱 · XSS", href: "#vulnmap/xss" },
          { name: "读 XSS 的诞生", href: "#p5l5" }
        ]},
        { type: "note", text: "fetch 是异步的。代码写完之后不会立刻拿到结果，所以要用 .then 或 async/await。<b>在控制台里直接写返回值，会看到 Promise {&lt;pending&gt;} —— 这不是错，是还没回来。</b>" }
      ],
      code: [],
      labs: [{ name: "MDN · JavaScript 入门（中文）", url: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide" }],
      quiz: [
        "var / let / const 的区别？",
        "document.querySelector 和 querySelectorAll 返回的东西有什么不同？",
        "为什么控制台里 fetch 之后立刻打印是 Promise pending？"
      ]
    },
    {
      id: "p1l4",
      title: "在控制台写代码（Console 实战）",
      est: 35,
      goal: "能在 Console 面板里直接执行 JS：选元素、改页面、读变量、发请求。",
      sections: [
        { type: "p", text: "控制台（Console）是浏览器留给你的「任意代码执行入口」。它跑在当前页面的环境里，能用页面上所有变量和函数——这是 Web 安全和前端逆向最重要的工具之一。" },
        { type: "p", text: "打开方式：F12 → Console 面板。快捷键 Ctrl+Shift+J 可直接跳过来。" },
        { type: "code", lang: "js", title: "第一步：选元素（$ 与 $$）", src: `$("h1")            // 等价 document.querySelector("h1")
$$("a")            // 等价 querySelectorAll，返回数组
$("h1").textContent = "控制台改的"` },
        { type: "code", lang: "js", title: "第二步：读页面上的东西", src: `document.title           // 标题
document.cookie          // 本页可见的 Cookie
document.forms[0]        // 第一个表单
[...document.querySelectorAll("input")].map(i => i.value)  // 所有输入框的值` },
        { type: "code", lang: "js", title: "第三步：发请求并看结果", src: `// 同步写法：控制台支持 await（顶层 await）
const r = await fetch("/api/user?id=1");
const j = await r.json();
console.log(j);` },
        { type: "code", lang: "js", title: "第四步：几个提高效率的技巧", src: `$_            // 上一次表达式的结果
$0            // 在 Elements 里当前选中的元素
console.table([{a:1,b:2},{a:3,b:4}])   // 表格化输出
console.dir(obj)                       // 展开对象结构
copy(obj)                              // 把对象复制到剪贴板
monitorEvents(window, "click")         // 监控事件` },
        { type: "p", text: "<b>动手练习（就在这个页面上做）：</b>" },
        { type: "list", items: [
          "按 F12 打开 Console，输入 <b>document.title</b>，看到当前标题。",
          "输入 <b>document.title = \"我改的\"</b>，看浏览器标签页标题变化。",
          "输入 <b>$(\"h1\").textContent</b>，读出当前这节的标题。",
          "输入 <b>document.cookie</b>，看这个页面有没有 Cookie。"
        ]},
        { type: "note", text: "控制台里的修改只在当前页面有效，刷新就没了。这是它适合「试探」的原因——但也意味着你不能靠它改文件。" },
        { type: "p", text: "进阶：控制台是 CTF 里破解「前端校验」最直接的入口。如果一段逻辑写在 JS 里（比如密码比对、token 生成），你完全可以在控制台里调用它、改参数、绕过它。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "在控制台里 $(\"h1\") 等价于什么？",
        "为什么说控制台能绕过前端校验？",
        "console.table 和 console.log 有什么区别，什么时候更好用？",
        "控制台里改的东西刷新后会保留吗？"
      ]
    },
    {
      id: "p1l5",
      title: "开发者工具五个核心面板",
      est: 30,
      goal: "说清 Elements / Console / Sources / Network / Application 各查什么。",
      sections: [
        { type: "p", text: "F12 打开后，顶部一排标签就是你的主战场。CTF Web 题 80% 的信息都在这里。" },
        { type: "list", items: [
          "<b>Elements / 元素</b>：看并临时修改 HTML 与 CSS。找隐藏内容、找注释、改样式，都在这里。",
          "<b>Console / 控制台</b>：执行 JS、看报错、发请求。上一节专门讲过。",
          "<b>Sources / 源代码</b>：看页面加载的 JS 文件、打断点、单步调试。读 app.js 就在这里。",
          "<b>Network / 网络</b>：看每一次 HTTP 请求——URL、方法、请求头、请求体、响应。<b>这是 Web 安全最核心的面板。</b>",
          "<b>Application / 应用</b>：看 Cookie、LocalStorage、SessionStorage、IndexedDB、缓存。"
        ]},
        { type: "code", lang: "text", title: "Network 面板最该看的四样东西", src: `1. Request URL      —— 请求打到了哪个接口
2. Request Method   —— GET 还是 POST
3. Request Headers  —— Cookie / Authorization / Referer / User-Agent
4. Payload / Form Data —— 到底提交了什么参数

进阶：右键请求 → Copy as cURL，可以直接拿到命令行复现命令` },
        { type: "p", text: "实操：打开任意网站 → F12 → Network → 刷新页面 → 点开第一个请求 → 找到「请求标头」和「响应标头」。" },
        { type: "note", text: "Network 面板默认会「清空」历史请求。勾上 Preserve log（保留日志），页面跳转时请求记录才不会丢——登录流程、重定向类题目必须开这个。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "想知道登录时提交了什么，看哪个面板的哪一部分？",
        "Cookie 在哪个面板查看和编辑？",
        "为什么做登录/重定向题要先勾「保留日志」？",
        "「Copy as cURL」有什么用？"
      ]
    },
    {
      id: "p1l6",
      title: "读源代码：从 F12 到读懂 app.js",
      est: 40,
      goal: "能在 Sources 面板里定位并读懂一个 JS 文件，从中找出关键变量或 flag。",
      flag: "flag{r3ad_th3_s0urc3}",
      sections: [
        { type: "p", text: "前面都是「看页面」。这一节是「看代码」。Web 题里真正值钱的信息，往往在被压缩过、看不下去的 JS 文件里。" },
        { type: "p", text: "<b>第一步：找到文件。</b>F12 → Sources 面板 → 左侧 Page 折叠出站点域名 → 展开可以看到所有加载的 js / css / 图片。" },
        { type: "p", text: "<b>第二步：全局搜索。</b>按 Ctrl+Shift+F（不是 Ctrl+F），可以在<b>所有文件</b>里搜索字符串。找 flag、找 api、找 password、找 key，这是最快的一招。" },
        { type: "p", text: "<b>第三步：美化压缩代码。</b>压缩过的代码是一整行。点 Sources 面板左下角的 <b>{ }</b> 按钮（Pretty print），它会自动换行缩进。" },
        { type: "code", lang: "js", title: "压缩代码长什么样，为什么要看懂它", src: `// 压缩后的样子（一行到底，变量名全被改成 _0x 开头）
!function(){var _0x3f8a=["r3ad_th3_s0urc3"],_0x1a2b="flag{";
window.__demo={version:"1.0",key:function(){return _0x1a2b+_0x3f8a[0]+"}"}};}();

// 美化 + 加换行后，逻辑就出来了：
// 1) 定义字符串数组 _0x3f8a
// 2) 定义前缀 _0x1a2b = "flag{"
// 3) 挂一个全局对象 window.__demo，其中 key() 返回 前缀 + 数组第 0 项 + "}"` },
        { type: "p", text: "压缩代码的三个阅读要诀：" },
        { type: "list", items: [
          "<b>先找字符串数组</b>：压缩工具通常把所有字符串集中到一个数组里（如 _0x3f8a），再通过下标取用。",
          "<b>再找全局挂载</b>：window.xxx、globalThis.xxx —— 这些是外部能访问到的出口，也是题目留给你的突破口。",
          "<b>最后看关键函数</b>：加密、校验、生成 token 的函数，就是你要绕过的对象。"
        ]},
        { type: "p", text: "<b>第四步（核心技巧）：直接执行它。</b>如果能读到代码，就不一定要读懂——很多情况下你可以在控制台里直接调用那个函数拿到结果。" },
        { type: "code", lang: "js", title: "读不懂就调用", src: `// 上面那段代码挂了 window.__demo，于是在控制台里：
__demo.key()          // 直接把结果算出来
// 输出：flag{r3ad_th3_s0urc3}` },
        { type: "note", text: "这是 Web 安全里极其重要的思维：<b>只要代码在客户端，它就是可读、可改、可调用的。</b>「前端加密」在有代码的情况下等于没有加密。" },
        { type: "p", text: "<b>实战挑战：</b>这个页面里就埋了一段压缩脚本（不叫 app.js，但同理）。请你自己找出 flag：" },
        { type: "list", items: [
          "方式一（读代码）：F12 → Sources → 找到本页的 HTML 或内联脚本 → 找 <b>__weiweb_bundle</b> 相关的代码，读出拼接逻辑。",
          "方式二（搜索）：Ctrl+Shift+F 搜 <b>r3ad_th3_s0urc3</b>，看它在哪个文件、被谁拼起来。",
          "方式三（执行）：在 Console 里直接调 <b>__weiweb_bundle.key()</b>。"
        ]},
        { type: "p", text: "三条路都能拿到同一个 flag。拿到后填到下面：" }
      ],
      code: [],
      labs: [
        { name: "Chrome DevTools 官方文档 · Sources", url: "https://developer.chrome.com/docs/devtools/sources" }
      ],
      quiz: [
        "Ctrl+Shift+F 和 Ctrl+F 的区别是什么？",
        "压缩代码为什么要把字符串集中放到数组里？",
        "「前端加密等于没有加密」这句话怎么理解？",
        "如果一段 JS 逻辑你看不懂，还有什么绕过办法？"
      ]
    }
  ]
});
