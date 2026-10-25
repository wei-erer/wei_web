/* wei_web 课程主数据头：元信息 + 技术栈路线图。各 PART 通过 COURSE.modules.push 追加。 */
const COURSE = {
  name: "wei_web",
  subtitle: "CTF Web 方向 · 系统化学习中心",
  version: "v2.4",
  weeks: 36,
  intro:
    "这门课面向「以后专攻 Web 方向」的长期目标：把基础、语言、框架、漏洞、工具、方法论六层打通。v2.4 起不再把漏洞分成「基础 / 高级」两个 PART，而是做成一张按「诞生地」组织的漏洞图谱：先知道有什么、为什么会有，再自己找文章、手动复现。每节仍按「原理 → 动手 → 靶场 → 自测」四步走，但重心从「怎么打」移到「这一行代码为什么会制造漏洞」。",

  /* 技术栈认知路线：用户指定的主线路径 + 每阶段该掌握什么 */
  roadmap: {
    title: "Web 方向技术栈认知路线",
    note:
      "这条路线不是「全部学会才能做题」，而是「按这个顺序建立认知，越往后越能看懂题目的源码」。每一阶段只要达到该阶段的验收标准就可以往下走，回头补细节。每个阶段下面会标出「顺路会遇到」的漏洞节点，点进去就是图谱里的根因、复现与搜索词。",
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
        vulns: ["xss", "proto"],
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
        vulns: ["upload", "lfi", "rce", "php-deser"],
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
        vulns: ["rce", "php-deser"],
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
        vulns: ["sqli"],
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
        vulns: ["auth", "ssti", "py-deser", "ssrf"],
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
        vulns: ["java-deser", "xxe"],
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
        vulns: ["proto", "rce"],
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

  /* 漏洞图谱：v2.4 的核心。节点按「诞生地」挂回技术栈，不按难度分基础/高级。 */
  vulnmap: {
    title: "漏洞图谱",
    subtitle: "先知道有什么、为什么会有，再自己去复现",
    note:
      "这张图不是 payload 大全，而是「漏洞出生地」地图。左边是技术现场，右边是它最容易生出的漏洞；虚线表示两个漏洞可以接成一条链。点开一个节点，只看四件事：一句话是什么、诞生在哪、根因是什么、怎么观察。想深入，再按节点里的关键词去找博客、去靶场手动复现。",
    loop: [
      "先在图谱里挑一个节点，读「一句话 / 根因 / 怎么观察」，不要急着背 payload。",
      "按节点给出的英文关键词，找 2 篇高质量文章（优先官方文档、PortSwigger、HackTricks）。",
      "在本地靶场手动复现：先证明「数据被当成了什么」，再谈具体 payload。",
      "写三行笔记：根因、修复点、换一个语言/框架是否还成立。",
      "回到图谱，把相关节点连起来看（如 上传 → 包含 → RCE），理解漏洞链而不是单点。"
    ],
    scenes: [
      { id: "s-browser", name: "浏览器 / 前端 JS", sub: "DOM · 输出编码" },
      { id: "s-http", name: "HTTP / Cookie", sub: "自动携带 · 同源策略" },
      { id: "s-auth", name: "登录 / 鉴权", sub: "Session · Token" },
      { id: "s-business", name: "业务流程", sub: "归属 · 状态 · 金额" },
      { id: "s-response", name: "响应 / 错误", sub: "报错 · 备份 · source map" },
      { id: "s-data", name: "数据库", sub: "SQL · NoSQL · 权限" },
      { id: "s-file", name: "文件系统", sub: "上传 · 路径 · 包含 · 执行" },
      { id: "s-template", name: "模板引擎", sub: "Jinja2 · Twig · FreeMarker" },
      { id: "s-parser", name: "XML / 解析器", sub: "DTD · 外部实体" },
      { id: "s-serial", name: "序列化 / 对象", sub: "unserialize · pickle · readObject" },
      { id: "s-node", name: "Node.js 运行时", sub: "原型 · 沙箱 · 子进程" },
      { id: "s-server", name: "服务端请求", sub: "HTTP 客户端 · 内网 · 元数据" }
    ],
    nodes: [
      {
        id: "xss", name: "XSS 跨站脚本", scene: "s-browser", lesson: "p5l5",
        short: "用户输入被浏览器当成 HTML/JS 执行。",
        born: "搜索回显、留言/昵称、innerHTML 拼接、模板的 |safe。",
        root: "输出时没有按 HTML / 属性 / JS / URL 的上下文编码，数据越过了「文本」边界。",
        observe: "输入一个带标签的字符串，看它出现在源码里是文本，还是变成了 DOM 节点。",
        fix: "按上下文编码；少用 innerHTML；CSP、HttpOnly、Trusted Types 做纵深防御。",
        search: "XSS 输出编码 上下文 CSP Trusted Types",
        repro: "本地留言板：同一条输入分别用 textContent 与 innerHTML 渲染，对比 DOM；再打开 CSP 看拦截。"
      },
      {
        id: "csrf", name: "CSRF 跨站请求伪造", scene: "s-http", lesson: "p5l10",
        short: "借浏览器自动携带的 Cookie，发一个用户没想发的请求。",
        born: "Cookie 会话 + 只校验「登录了」的敏感操作（转账、改密、绑定）。",
        root: "身份凭据由浏览器自动附带，而操作本身没有绑定「本次请求」的额外凭证。",
        observe: "在另一个源构造表单自动提交；看目标是否只凭 Cookie 就执行。",
        fix: "CSRF Token、SameSite、Origin/Referer 校验、敏感操作二次验证。",
        search: "CSRF SameSite token origin 校验",
        repro: "本地两个端口：A 站登录，B 站放自动提交表单，观察 A 站 Cookie 是否被带上。"
      },
      {
        id: "auth", name: "Session / JWT 绕过", scene: "s-auth", lesson: "p5l15",
        short: "身份凭据可预测、可伪造，或服务端根本没校验签名。",
        born: "Session ID、Cookie 里的 role、JWT 的 alg/kid、Flask 的签名 cookie。",
        root: "把「客户端提交的身份」当成可信身份；或密钥、算法、随机性不足。",
        observe: "解码 token、改 role/uid、试 alg=none / 弱密钥 / 空 session。",
        fix: "服务端会话、强随机 ID、固定算法与强密钥、退出即失效。",
        search: "JWT alg none 弱密钥 session fixation Flask SECRET_KEY",
        repro: "本地 Flask 站：改 session cookie 看是否被拒；再用 flask-unsign 验证弱 SECRET_KEY。"
      },
      {
        id: "idor", name: "越权与逻辑漏洞", scene: "s-business", lesson: "p5l16",
        short: "功能按设计跑，但「这个对象是不是你的」没校验。",
        born: "订单 id、用户 id、文件 id 来自请求；后台接口只在前端隐藏。",
        root: "把「参数里的对象归属」交给客户端决定，服务端只按 id 查询。",
        observe: "把自己的 id 改成相邻值；用普通账号重放管理员请求。",
        fix: "从 session 取 user_id；每个对象查询都带归属条件；后端统一鉴权。",
        search: "IDOR 水平越权 垂直越权 对象归属",
        repro: "本地商城：两个账号各下一单，改 order id 互看，记录修复前后的响应。"
      },
      {
        id: "info", name: "信息泄露", scene: "s-response", lesson: "p5l2",
        short: "响应、备份、版本库把「不该给的地图」给了出去。",
        born: "报错页、.git、备份文件、source map、默认后台、版本头。",
        root: "生产环境保留了开发/调试/历史产物；错误信息直接回显。",
        observe: "看响应头、robots、.git/config、备份名、报错堆栈、source map。",
        fix: "上线清理；关闭详细报错；source map 不发布；敏感配置只放服务端。",
        search: "信息泄露 .git source map 备份文件 报错",
        repro: "本地起一个带 .git 和 .env 的站，用 git-dumper 还原，体会「泄露 → 源码 → 新漏洞」。"
      },
      {
        id: "sqli", name: "SQL 注入", scene: "s-data", lesson: "p5l3", extraLessons: ["p5l4"],
        short: "用户输入变成了 SQL 语句的一部分。",
        born: "字符串拼接 SQL；ORDER BY / LIMIT / 表名等不能参数化的位置。",
        root: "SQL 结构由字符串拼接决定，数据越过了「值」的边界。",
        observe: "加引号看报错；真假条件看响应；order by 猜字段；不同数据库看指纹。",
        fix: "参数化/预编译；无法参数化的标识符用白名单；数据库最小权限。",
        search: "SQL 注入 参数化 联合查询 盲注 information_schema",
        repro: "SQLite 与 MySQL 各起一个本地库，用同一段拼接代码，对比 sqlite_master / information_schema。"
      },
      {
        id: "nosql", name: "NoSQL 注入", scene: "s-data", lesson: "p5l17",
        short: "查询条件从字符串变成了对象，操作符被注入。",
        born: "MongoDB 登录/查询直接接收 JSON 或 qs 解析后的对象。",
        root: "把用户提交的对象原样当查询条件，$ne / $regex 等操作符生效。",
        observe: "在参数里加 [$ne]=1 或 JSON 的 {\"$ne\":null}，看是否绕过。",
        fix: "强制类型转换；拒绝 $ 开头的键；查询条件白名单；应用层比对密码。",
        search: "NoSQL injection MongoDB $ne $regex",
        repro: "Node + MongoDB 本地登录接口，分别传字符串和对象，打印最终 query。"
      },
      {
        id: "udf", name: "数据库 UDF 提权", scene: "s-data", lesson: "p3d4",
        short: "数据库高权限账号把攻击者的共享库加载进进程，执行系统命令。",
        born: "旧版 MySQL + FILE/SUPER 权限 + plugin_dir 可写；SQLi 拿到高权限账号。",
        root: "数据库账号权限过大，且允许从可写目录加载原生代码。",
        observe: "查 @@version、current_user()、@@plugin_dir、secure_file_priv；确认能否写文件。",
        fix: "数据库最小权限；禁止 FILE/SUPER；plugin 目录只读；升级数据库；SQLi 参数化。",
        search: "MySQL UDF 提权 plugin_dir FILE 权限",
        repro: "仅在本地隔离容器里：低版本 MySQL + 高权限账号，验证 UDF 的加载条件；不要对真实目标尝试。"
      },
      {
        id: "upload", name: "文件上传", scene: "s-file", lesson: "p5l6",
        short: "用户控制文件名/内容，文件又落在可执行目录。",
        born: "头像、附件、导入功能；只查后缀、Content-Type 或前端 JS。",
        root: "上传校验信任客户端元数据；上传目录与 Web 根目录未隔离。",
        observe: "改后缀/Content-Type/文件名；看返回路径能否访问、是否被解析。",
        fix: "白名单 + 重命名 + 上传目录禁执行 + 存储分离 + 内容校验。",
        search: "文件上传 绕过 解析漏洞 .htaccess 图片马",
        repro: "Upload-Labs 前 5 关，每关只记录「校验发生在哪一层」。"
      },
      {
        id: "lfi", name: "路径穿越 / 文件包含", scene: "s-file", lesson: "p5l7",
        short: "用户控制路径，读到任意文件，或把文件当代码包含。",
        born: "下载/预览的 ?page=；include/require；模板路径拼接。",
        root: "路径由输入拼接，没有白名单或 realpath 边界校验。",
        observe: "试 ../、绝对路径、php://filter；看回显、报错或文件内容。",
        fix: "键值白名单映射；realpath 后校验目录；禁用远程包含；最小文件权限。",
        search: "path traversal LFI php://filter 日志包含",
        repro: "本地 PHP：写一个 ?page= 的包含点，先用 php://filter 读源码，再试日志包含。"
      },
      {
        id: "rce", name: "命令 / 代码执行", scene: "s-file", lesson: "p5l8",
        short: "用户输入进入了 shell 或语言求值器。",
        born: "system/exec/passthru；eval/assert；反引号；模板或表达式引擎。",
        root: "数据被拼进命令/代码字符串，没有做到「参数与代码分离」。",
        observe: "加分隔符 ; | &&、$()、反引号；看回显、延时或带外。",
        fix: "避免 shell；用参数数组与 escapeshellarg；禁用危险函数；最小权限。",
        search: "命令注入 代码执行 无回显 带外",
        repro: "本地 ping 接口：先证明分隔符生效，再改成参数数组修复，复测同一 payload。"
      },
      {
        id: "ssti", name: "SSTI 模板注入", scene: "s-template", lesson: "p5l11",
        short: "用户输入被模板引擎当成模板源码求值。",
        born: "render_template_string 拼接；Twig createTemplate；FreeMarker 动态模板。",
        root: "把「模板源码」和「模板变量」混为一谈，用户能写表达式。",
        observe: "输入 {{7*7}} / ${7*7} / <%= 7*7 %>，看是否求值。",
        fix: "用户输入只作为变量；固定模板；沙箱与最小对象暴露；关闭调试。",
        search: "SSTI Jinja2 Twig FreeMarker 沙箱",
        repro: "本地 Flask：先 {{7*7}}，再 {{config}}，最后只做到「证明对象可达」，不急着 RCE。"
      },
      {
        id: "xxe", name: "XXE 外部实体", scene: "s-parser", lesson: "p5l12",
        short: "XML 解析器把外部实体指向的文件/URL 读了进来。",
        born: "XML 上传、SOAP、SVG、Office 解析；默认开启 DTD 的解析器。",
        root: "解析器允许 DTD/外部实体，且解析结果会回显或被使用。",
        observe: "加 DOCTYPE 实体读 file:///etc/passwd；无回显试 DNSLog 或外部 DTD。",
        fix: "禁用 DTD 与外部实体；用 defusedxml；不需要 XML 就换 JSON。",
        search: "XXE 外部实体 盲 XXE OOB DTD",
        repro: "本地 Python lxml / PHP libxml 两个解析点，对比默认配置与禁用实体后的结果。"
      },
      {
        id: "php-deser", name: "PHP 反序列化", scene: "s-serial", lesson: "p5l13",
        short: "可控序列化字符串还原成对象，魔术方法被自动触发。",
        born: "unserialize($_COOKIE/$_GET)；框架 cache/session；phar://。",
        root: "反序列化不可信数据，且类里有危险魔术方法/调用链。",
        observe: "找 unserialize 入口；列 __wakeup/__destruct/__toString；跟属性到危险函数。",
        fix: "不反序列化外部数据；用 JSON；签名/白名单；升级框架。",
        search: "PHP 反序列化 魔术方法 pop chain phar",
        repro: "写两个类做最小 pop 链，本地 unserialize 触发；再用 phpggc 看真实框架链。"
      },
      {
        id: "py-deser", name: "Python 反序列化", scene: "s-serial", lesson: "p5l19",
        short: "pickle / PyYAML 等把字节还原成对象，可能触发任意调用。",
        born: "pickle.loads、yaml.load（非 safe）、joblib、Flask 缓存。",
        root: "反序列化不可信字节；Python 对象图可在还原时执行代码。",
        observe: "看数据开头（pickle 常见 0x80 04）；找 loads/load 调用；确认是否 safe_load。",
        fix: "不反序列化不可信数据；用 JSON；yaml.safe_load；签名/HMAC。",
        search: "Python pickle 反序列化 yaml.load RCE",
        repro: "本地写一个 pickle.dumps 的简单对象，再用 RestrictedUnpickler 限制，观察拦截点。"
      },
      {
        id: "java-deser", name: "Java 反序列化", scene: "s-serial", lesson: "p5l14",
        short: "readObject 还原对象，第三方库的调用链被串起来。",
        born: "rememberMe、rO0AB、RMI/JNDI、Fastjson @type、XStream。",
        root: "反序列化不可信字节；classpath 里存在可利用的 gadget 链。",
        observe: "看到 rO0AB/rememberMe/@type；读 pom.xml 或 Web-INF/lib 定版本。",
        fix: "禁用/限制反序列化；升级组件；JEP 290 过滤器；不信任外部序列化数据。",
        search: "Java 反序列化 ysoserial CommonsCollections Shiro Fastjson",
        repro: "本地用 ysoserial URLDNS 做「只发 DNS」的无害验证，理解链的入口与出口。"
      },
      {
        id: "proto", name: "原型链污染", scene: "s-node", lesson: "p5l18",
        short: "__proto__ 被写进公共原型，之后所有对象都带上被污染的属性。",
        born: "deepMerge / 深拷贝 / qs 解析 / 配置合并；JSON 里的 __proto__。",
        root: "递归合并时没有过滤 __proto__/constructor/prototype，写穿了对象原型。",
        observe: "提交 {\"__proto__\":{\"x\":1}}，看后续对象/模板/子进程选项是否变化。",
        fix: "拒绝危险键；Object.create(null)；Map；升级 lodash/qs 等依赖。",
        search: "prototype pollution __proto__ deepMerge Node.js",
        repro: "本地写一个不安全的 merge，污染后打印 {}.x；再换 Object.create(null) 复测。"
      },
      {
        id: "ssrf", name: "SSRF 服务端请求", scene: "s-server", lesson: "p5l9",
        short: "服务器替你访问了你指定的、它本不该访问的地址。",
        born: "URL 预览、远程图片、webhook、PDF 生成、文件导入。",
        root: "服务端把用户给的 URL 直接交给 HTTP 客户端，没有出站白名单。",
        observe: "喂自己的地址/DNSLog 看回连；试 127.0.0.1、内网段、云元数据 169.254.169.254。",
        fix: "出站白名单代理；解析后校验 IP；禁跳转；禁危险协议；网络层隔离。",
        search: "SSRF 内网 169.254.169.254 DNS rebinding gopher",
        repro: "本地两个服务：A 站 URL 预览，B 站只监听 127.0.0.1；从 A 访问 B，证明边界被绕过。"
      }
    ],
    edges: [
      { from: "xss", to: "csrf", label: "XSS 可读 Token，绕过 CSRF 防护" },
      { from: "upload", to: "lfi", label: "图片马需要文件包含来执行" },
      { from: "lfi", to: "rce", label: "包含即执行" },
      { from: "upload", to: "rce", label: "上传可执行文件" },
      { from: "sqli", to: "udf", label: "高权限 DB + 可写 plugin 目录" },
      { from: "udf", to: "rce", label: "数据库进程执行系统代码" },
      { from: "ssti", to: "rce", label: "模板引擎进入语言运行时" },
      { from: "xxe", to: "ssrf", label: "外部实体可以让解析器发请求" },
      { from: "xxe", to: "lfi", label: "外部实体可以读本地文件" },
      { from: "php-deser", to: "rce", label: "魔术方法链接到危险函数" },
      { from: "py-deser", to: "rce", label: "对象图还原时执行调用" },
      { from: "java-deser", to: "rce", label: "gadget 链接到命令执行" },
      { from: "proto", to: "rce", label: "污染到子进程/模板配置" },
      { from: "ssrf", to: "info", label: "读云元数据与内网信息" },
      { from: "auth", to: "idor", label: "身份可伪造后越权" }
    ]
  },

  modules: [],
};
