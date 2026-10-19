/* wei_web 课程主数据头：元信息 + 技术栈路线图。各 PART 通过 COURSE.modules.push 追加。 */
const COURSE = {
  name: "wei_web",
  subtitle: "CTF Web 方向 · 系统化学习中心",
  version: "v2.0",
  weeks: 36,
  intro:
    "这门课面向「以后专攻 Web 方向」的长期目标：不追求速成，而是把基础、语言、框架、漏洞、工具、方法论六层打通。每节都按「原理 → 动手 → 靶场 → 自测」四步走。原始依据为 MoeCTF 2026 Web 入门指北，并在其上扩展为一套完整的 Web 安全学习体系。",

  /* 技术栈认知路线：用户指定的主线路径 + 每阶段该掌握什么 */
  roadmap: {
    title: "Web 方向技术栈认知路线",
    note:
      "这条路线不是「全部学会才能做题」，而是「按这个顺序建立认知，越往后越能看懂题目的源码」。每一阶段只要达到该阶段的验收标准就可以往下走，回头补细节。",
    stages: [
      {
        stage: "S1",
        name: "JavaScript / 前端基础",
        why: "CTF Web 题的入口几乎永远是浏览器。看不懂前端，连题面都读不全。",
        learn: [
          "HTML 结构与注释、CSS 如何隐藏内容",
          "JS 语法：变量、函数、对象、数组、JSON",
          "DOM 操作与事件、fetch 发请求",
          "浏览器控制台（Console）直接执行代码",
          "开发者工具：Elements / Network / Sources / Application",
        ],
        check: "能在不刷新页面的情况下，用控制台改掉页面内容、读出页面里的隐藏变量。",
        tracks: ["入门必备"],
      },
      {
        stage: "S2",
        name: "PHP 语言基础与特性",
        why: "PHP 是 CTF Web 出现频率最高的后端语言，且「弱类型 + 松散比较」是大量题目的核心考点。",
        learn: [
          "语法：变量、数组、函数、超全局变量（$_GET / $_POST / $_COOKIE / $_FILES / $_SERVER）",
          "文件操作：include / require / file_get_contents / file_put_contents",
          "命令执行：system / exec / eval / assert / preg_replace",
          "弱类型与松散比较（== 的陷阱）、MD5 缺陷（0e 开头）",
          "序列化 serialize / 反序列化 unserialize 与魔术方法",
        ],
        check: "看到一段 PHP 源码，能指出「用户输入从哪进来、经过什么处理、最终到了哪个危险函数」。",
        tracks: ["CTF 高频", "语言特性"],
      },
      {
        stage: "S3",
        name: "PHP 框架（ThinkPHP 等）",
        why: "真实题目常跑在框架上，漏洞从「函数」上升到「框架的路由、ORM、模板」。",
        learn: [
          "MVC 结构与路由如何把 URL 映射到方法",
          "ThinkPHP 的入口文件、控制器、模板渲染",
          "框架层的常见问题：参数绑定、模板注入、反序列化链",
          "如何通过目录结构 / 报错 / Composer 文件识别框架与版本",
        ],
        check: "拿到一个 ThinkPHP 站，能定位入口、猜出路由、判断版本区间。",
        tracks: ["框架层"],
        optional: true,
      },
      {
        stage: "S4",
        name: "Python（写脚本的能力）",
        why: "Python 是 Web 选手的「手」。爆破、批量请求、编码处理、盲注自动化，全靠它。",
        learn: [
          "环境与 venv、pip 安装第三方库",
          "requests：会话保持、自定义 Header、Cookie、代理",
          "编码处理：base64 / urllib.parse / hashlib",
          "多线程与并发提速",
          "把手工测试写成一键脚本",
        ],
        check: "能用 20 行以内脚本，复现你手工在 Burp 里做过的一次测试。",
        tracks: ["自动化"],
      },
      {
        stage: "S5",
        name: "Python Web 框架（Flask / Django）",
        why: "题目里 Python 后端极常见，SSTI 的根源就是模板引擎。",
        learn: [
          "Flask：路由、请求参数、渲染模板（Jinja2）",
          "Jinja2 模板注入原理与利用",
          "Django：MTV 结构、ORM、模板",
          "Werkzeug 调试模式与 PIN 相关考点",
        ],
        check: "能写一个带表单的 Flask 小站，并自己构造一次 SSTI。",
        tracks: ["框架层"],
      },
      {
        stage: "S6",
        name: "Java 与 Spring Boot",
        why: "Java 题占比逐年上升，反序列化链和 Spring 漏洞是国内比赛的重点。",
        learn: [
          "Java 基础：类、对象、序列化机制",
          "Java 反序列化与常见利用链（CommonsCollections 等）",
          "Spring：Controller、参数绑定、SpEL",
          "Spring 常见漏洞：Actuator 暴露、SpEL 注入、路由绕过",
        ],
        check: "能看懂一段 Java 反序列化链的调用路径，说出触发点。",
        tracks: ["语言特性", "进阶"],
        optional: true,
      },
      {
        stage: "S7",
        name: "Node.js（JavaScript 后端）",
        why: "前后端同一门语言，考点集中在原型链污染与沙箱逃逸。",
        learn: [
          "Express 基础：路由、中间件、参数",
          "原型链污染（prototype pollution）原理",
          "Node 沙箱逃逸（vm 模块限制）",
          "大小写特性与路径处理差异",
        ],
        check: "能解释 Object.prototype 被污染后，为什么会影响无关代码。",
        tracks: ["语言特性", "进阶"],
        optional: true,
      },
    ],
    /* 横向能力：不属于某个语言，但贯穿全程 */
    cross: [
      { name: "HTTP 协议", detail: "请求/响应结构、方法、状态码、Header、Cookie、编码" },
      { name: "Linux 基础", detail: "文件、权限、进程、端口、管道、常见命令；建议 Kali 或 WSL" },
      { name: "数据库与 SQL", detail: "增删改查、WHERE、UNION、子查询、权限；SQL 注入的地基" },
      { name: "编码与数据格式", detail: "Base64 / URL / Hex / Unicode / JSON / XML / JWT / 哈希" },
      { name: "抓包与改包", detail: "Burp Suite / Yakit / curl / 浏览器 Network" },
      { name: "方法论", detail: "拿到题怎么入手、卡住怎么破局、WriteUp 怎么复盘" },
    ],
  },

  modules: [],
};
