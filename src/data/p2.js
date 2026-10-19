/* PART 2 · HTTP 与状态 */
COURSE.modules.push({
  id: "p2",
  title: "PART 2 · HTTP 与状态",
  weeks: "第 2–3 周",
  summary: "浏览器和服务器之间到底说了什么。Cookie 为什么能维持登录，又为什么会成为攻击面。",
  lessons: [
    {
      id: "p2l1",
      title: "HTTP 请求与响应结构",
      est: 30,
      goal: "能逐行拆解一个原始 HTTP 请求和响应。",
      sections: [
        { type: "p", text: "HTTP 是「一问一答」的文本协议。读懂它，是后面所有漏洞的前提。" },
        { type: "code", lang: "http", title: "请求的四部分", src: `POST /login HTTP/1.1          ← 请求行：方法 + 路径 + 版本
Host: example.com             ← 请求头开始
User-Agent: Mozilla/5.0
Content-Type: application/json
Cookie: session=abc123
Content-Length: 27
                              ← 空行（必须）
{"user":"admin","pw":"123"}   ← 请求体` },
        { type: "code", lang: "http", title: "响应的四部分", src: `HTTP/1.1 200 OK               ← 状态行
Content-Type: text/html; charset=utf-8
Set-Cookie: session=abc123; HttpOnly
Content-Length: 26
                              ← 空行
<h1>Hello, Web!</h1>          ← 响应体` },
        { type: "list", items: [
          "<b>请求行</b>：方法、路径（含查询串 ?a=1&b=2）、协议版本。",
          "<b>请求头</b>：Host、Cookie、User-Agent、Referer、Content-Type 等。",
          "<b>请求体</b>：GET 一般没有；POST/PUT 携带数据。",
          "<b>响应头</b>：Content-Type、Set-Cookie、Location（重定向）、Server。"
        ]},
        { type: "note", text: "CTF 里「改请求」改的通常是这几处：路径参数、请求头（Cookie/Referer/X-Forwarded-For/User-Agent）、请求体。90% 的 Web 题都是在这三个位置做文章。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "请求行包含哪三部分？",
        "GET 请求可以有请求体吗？（技术上与约定上要分开想）",
        "Set-Cookie 出现在请求还是响应里？"
      ]
    },
    {
      id: "p2l2",
      title: "请求方法与状态码",
      est: 25,
      goal: "能根据方法和状态码判断发生了什么，并知道哪些状态码在 CTF 里是「有戏」的信号。",
      sections: [
        { type: "list", items: [
          "<b>GET</b> 取数据，参数在 URL；<b>POST</b> 提交数据，参数在请求体；<b>PUT</b> 更新；<b>DELETE</b> 删除；<b>HEAD</b> 只要响应头；<b>OPTIONS</b> 查支持的方法（CORS 预检会用到）。"
        ]},
        { type: "list", items: [
          "<b>200</b> 成功｜<b>301/302</b> 重定向｜<b>304</b> 缓存未改",
          "<b>400</b> 请求格式错误｜<b>401</b> 未认证｜<b>403</b> 拒绝访问｜<b>404</b> 不存在｜<b>405</b> 方法不允许",
          "<b>500</b> 服务器内部错误｜<b>502/503/504</b> 网关/服务不可用"
        ]},
        { type: "p", text: "CTF 里的状态码信号：" },
        { type: "list", items: [
          "本该 403 的页面返回 200 → 可能绕过了权限校验。",
          "同样的请求，改一个参数后响应长度变了 → 存在注入或条件判断（盲注的核心）。",
          "500 且报错里带 SQL 语法 → 注入点暴露。",
          "302 跳到 /admin → 可能已经拿到管理员会话。"
        ]},
        { type: "note", text: "别只看状态码。<b>响应长度、响应时间、响应内容差异</b>，往往比状态码更能说明问题。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "401 和 403 的本质区别是什么？",
        "为什么盲注要盯「响应长度」或「响应时间」？",
        "OPTIONS 请求在什么场景下会自动发出？"
      ]
    },
    {
      id: "p2l3",
      title: "Cookie、Session、Token",
      est: 35,
      goal: "讲清「登录状态」的三代实现方式，以及各自的攻击面。",
      sections: [
        { type: "p", text: "HTTP 是无状态的：服务器默认不记得你上次来过。为了让「登录一次，之后都认识你」，诞生了三种方案。" },
        { type: "code", lang: "http", title: "① Cookie + Session（服务端存状态）", src: `响应：Set-Cookie: session=8f3a...; HttpOnly; Path=/
请求：Cookie: session=8f3a...

服务端：session 表里 8f3a -> {uid: 1, role: "user"}
特点：浏览器只拿到一个随机 ID，真实数据在服务器` },
        { type: "code", lang: "js", title: "② JWT（信息存在 token 里）", src: `// JWT 由三段组成：header.payload.signature
// payload 是 base64url，任何人都能解开看
{
  "alg": "HS256",
  "typ": "JWT"
}
.
{ "uid": 1, "role": "user" }
.
<用密钥算出的签名>` },
        { type: "p", text: "JWT 的关键认知：<b>payload 是明文可读的（只是 base64），安全性完全依赖签名。</b>所以攻击面很明确——篡改 payload 后能否让签名校验通过。" },
        { type: "list", items: [
          "<b>Cookie 相关攻击面</b>：session id 可预测、未设 HttpOnly 被 XSS 偷走、SameSite 缺失导致 CSRF。",
          "<b>JWT 相关攻击面</b>：alg 改成 none、弱密钥可爆破、公钥当私钥用（算法混淆）、kid 注入。",
          "<b>前端存储 token 的风险</b>：放 localStorage 会被 XSS 读走。"
        ]},
        { type: "p", text: "实操：F12 → Application → Cookies / LocalStorage，看这个站存了什么。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "Cookie 和 Session 分别存在哪一侧？",
        "JWT 的 payload 能被别人看到吗？为什么？",
        "为什么把 token 放 localStorage 有风险？"
      ]
    },
    {
      id: "p2l4",
      title: "用 curl 手动发请求",
      est: 30,
      goal: "脱离浏览器，用命令行精确控制每一个请求头。",
      sections: [
        { type: "p", text: "浏览器会「帮你补全」很多头，这反而让你看不清到底发了什么。curl 让你完全掌控。" },
        { type: "code", lang: "bash", title: "常用姿势", src: `# 最基础
curl https://example.com/

# 只看响应头
curl -I https://example.com/

# 跟随重定向，并显示过程
curl -L -v https://example.com/

# 发 POST 表单
curl -X POST -d "username=admin&password=123" https://example.com/login

# 发 JSON
curl -X POST -H "Content-Type: application/json" \\
     -d '{"user":"admin"}' https://example.com/api

# 带上 Cookie
curl -b "session=abc123" https://example.com/profile

# 自定义任意头（伪造 Referer / XFF）
curl -H "Referer: https://admin.example.com" \\
     -H "X-Forwarded-For: 127.0.0.1" https://example.com/` },
        { type: "note", text: "浏览器 Network 面板里右键请求 → <b>Copy as cURL</b>，可以直接得到等价命令。这是从「浏览器操作」过渡到「脚本操作」最省力的桥。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "-I 和 -i 有什么区别？",
        "-b 和 -H \"Cookie: ...\" 是等效的吗？",
        "为什么要伪造 X-Forwarded-For？"
      ]
    },
    {
      id: "p2l5",
      title: "第一个 flag（动手）",
      est: 20,
      goal: "用开发者工具在本页里找到隐藏 flag。",
      flag: "flag{w3lc0me_t0_w3b}",
      sections: [
        { type: "p", text: "你已经知道「页面显示的 ≠ 页面的全部」。现在在<b>这个课程中心</b>里找 flag。" },
        { type: "p", text: "提示 1：F12。" },
        { type: "p", text: "提示 2：Elements 面板里的 &lt;head&gt;。" },
        { type: "p", text: "提示 3：HTML 注释不显示在页面上；也可以 Ctrl+F 搜 flag。" },
        { type: "p", text: "找到后填到下面：" }
      ],
      code: [],
      labs: [],
      quiz: [
        "你是怎么找到的？把过程写进笔记。",
        "为什么说「数据一旦发送到客户端，就不能再假设它是秘密」？"
      ]
    }
  ]
});
