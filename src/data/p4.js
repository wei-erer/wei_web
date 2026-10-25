/* PART 4 · 后端与框架认知 */
COURSE.modules.push({
  id: "p4",
  title: "PART 6 · 框架认知",
  weeks: "第 9–10 周 · 快速过",
  summary: "这一 PART 只花 2 周：认出技术栈、知道源码大概长什么样就够了。框架细节等遇到具体题目再回来查。",
  lessons: [
    {
      id: "p4l1",
      title: "技术栈全景：为什么是这个顺序",
      est: 30,
      goal: "说清这条路线每一步学什么、为什么不能跳、以及每一阶段什么时候算「可以往下走」。",
      sections: [
        { type: "p", text: "左侧「技术栈认知路线」页是完整的七阶段图。这里讲清楚顺序背后的逻辑——它不是难度排名，而是<b>认知依赖</b>：后一个阶段要拿前一个阶段当工具。" },
        { type: "table", title: "七阶段与验收标准", head: ["阶段", "内容", "验收（做不到就别往下走）"], rows: [
          ["S1 JS / 前端基础", "HTML/CSS/JS、DOM、Console、DevTools", "能在控制台改页面、读出隐藏变量"],
          ["S2 PHP 基础与特性", "语法、超全局变量、危险函数、弱类型", "看到一段 PHP 能指出「输入从哪进来、进了哪个函数」"],
          ["S3 PHP 框架", "ThinkPHP/Laravel 的路由、模板、ORM", "能定位入口、猜出路由、判断版本区间"],
          ["S4 Python 工具", "requests、编码、并发、脚本化", "20 行内复现一次手工测试"],
          ["S5 Python 框架", "Flask/Django、Jinja2、Werkzeug", "能写带表单的小站，并自己构造一次 SSTI"],
          ["S6 Java / Spring", "反序列化、Actuator、SpEL", "能看懂一段链的调用路径，说出触发点"],
          ["S7 Node.js", "Express、原型链、沙箱", "能解释 Object.prototype 被污染后为什么影响全局"]
        ]},
        { type: "h", text: "为什么不能跳" },
        { type: "list", items: [
          "<b>JS 第一</b>：你所有观测都发生在浏览器里。看不懂 JS，连「这题页面在干嘛」都判断不了。",
          "<b>PHP 特性必须早于 PHP 框架</b>：框架漏洞的表现形式（参数绑定、反序列化）都建立在弱类型与魔术方法之上。",
          "<b>Python 是工具，不是被攻击对象</b>：它可以在任何阶段并行学，但越早学会越省时间——从 PART 4 开始你就需要它了。",
          "<b>Java / Node 最后</b>：它们的漏洞形态（反序列化链、原型链污染）需要前面全部基础，提前学只会背 payload。"
        ]},
        { type: "h", text: "怎么用这条路线" },
        { type: "steps", items: [
          "先看自己现在在第几阶段：能过验收标准的，直接跳到下一阶段。",
          "把当前阶段的「验收标准」抄进笔记，作为这一阶段的学习目标。",
          "每完成一个 PART，回来对照一次——发现自己退步了就把上一阶段补回来。",
          "标「可选」的阶段（S3、S6、S7）第一轮可以先跳过：CTF 新手题里它们出现频率低于 S1/S2/S5。"
        ]},
        { type: "note", text: "顺序是「认知依赖」，不是「学习难度排名」。你可以并行学 Python（它是工具），但 PHP 特性必须在学 PHP 框架之前——否则你只是记住了框架漏洞的名字。" }
      ],
      code: [],
      labs: [{ name: "左侧「🗺 技术栈认知路线」页", url: "#roadmap" }],
      quiz: [
        "为什么 JS 排在第一位？",
        "「PHP 特性」和「PHP 框架」为什么不能颠倒？",
        "Python 在这条路线里的角色是什么？",
        "你的当前阶段是哪一阶段？验收标准是什么？",
        "哪几个阶段第一轮可以先跳过？"
      ]
    },
    {
      id: "p4l2",
      title: "PHP 框架：ThinkPHP 与它的考点",
      est: 45,
      goal: "看懂 ThinkPHP 站点的目录结构、路由规则与常见漏洞位置，并能判断版本。",
      sections: [
        { type: "p", text: "ThinkPHP 是国内中小项目用得极多的 PHP 框架，也是国内 CTF 的常客。框架题的难度不在「挖洞」，而在「认出这是哪个框架、哪个版本」。" },
        { type: "touch", title: "框架把「一个函数」放大成「一条链」", text: "框架的入口、路由、模板、ORM 会把同一份输入送到更多落点；版本号决定已知链。但根因仍是<b>「参数进了不该进的位置」</b>，只是路径更长。先认版本，再读入口，最后才套链。", links: [
          { name: "图谱 · PHP 反序列化", href: "#vulnmap/php-deser" },
          { name: "图谱 · RCE", href: "#vulnmap/rce" },
          { name: "图谱 · SSTI", href: "#vulnmap/ssti" }
        ]},
        { type: "table", title: "典型目录结构", head: ["路径", "作用", "能泄露什么"], rows: [
          ["public/index.php", "唯一入口文件", "入口写法暴露版本"],
          ["app/controller/", "控制器：处理请求", "业务逻辑、SQL 拼接、参数使用"],
          ["app/model/", "数据模型", "表结构、字段名"],
          ["app/view/", "模板", "渲染方式（是否可注入）"],
          ["config/", "配置", "数据库账号、密钥（若可读）"],
          ["runtime/", "运行时缓存与日志", "日志泄露、缓存文件"],
          ["vendor/", "Composer 依赖", "框架版本、第三方库版本"],
          ["composer.json", "依赖清单", "精确版本号"]
        ]},
        { type: "table", title: "路由长什么样", head: ["写法", "含义", "考点"], rows: [
          ["/index.php/index/index/index", "模块/控制器/方法", "默认路由，可猜"],
          ["/index.php/index/hello?name=wei", "控制器 hello 方法", "参数直接映射到方法参数"],
          ["/index.php?s=/index/index", "兼容模式（s 参数）", "参数覆盖风险"],
          ["/index.php/index/index/index/name/wei", "路径式传参", "多版本写法差异"]
        ]},
        { type: "code", lang: "php", title: "控制器里常见的危险写法", src: `<?php
namespace app\index\controller;

class Index {
    public function index($name = '') {
        // 危险 1：直接把参数拼进 SQL
        $sql = "select * from user where name = '$name'";
        Db::query($sql);

        // 危险 2：参数被当成模板源码渲染（SSTI）
        return $this->fetch($name);

        // 危险 3：参数进了 file_get_contents（SSRF / 文件读取）
        return file_get_contents(input('url'));
    }
}
?>` },
        { type: "table", title: "常见版本与漏洞家族", head: ["版本", "代表漏洞", "怎么确认"], rows: [
          ["5.0.x", "RCE（多处参数注入 -> 命令执行）", "报错页样式、入口文件写法"],
          ["5.1.x", "RCE、反序列化", "vendor 目录、composer.lock"],
          ["6.x", "相对少见，注意多应用模式与路由", "README/错误页版本号"],
          ["Laravel", "调试模式泄露、反序列化链", "X-Powered-By、报错页"]
        ]},
        { type: "h", text: "怎么判断版本" },
        { type: "steps", items: [
          "访问 <code>/index.php</code> 故意传错参数，看报错页样式（不同版本差异明显）。",
          "试读 <code>/composer.json</code>、<code>/vendor/composer/installed.json</code>、<code>/composer.lock</code>。",
          "看静态资源路径里的版本号、README/LICENSE 文件。",
          "看入口文件的写法：5.0 与 5.1 的 bootstrap 写法不同。",
          "确认版本后，直接去搜「ThinkPHP 5.0.x RCE」对应的公开 payload。"
        ]},
        { type: "note", text: "框架漏洞的价值在于「一个版本号 → 一个已知利用链」。所以信息收集阶段，<b>版本识别比漏洞挖掘更重要</b>——国内比赛里大量框架题就是考这个。" }
      ],
      code: [],
      labs: [
        { name: "ThinkPHP 官方文档", url: "https://doc.thinkphp.cn/" },
        { name: "CTFHub · ThinkPHP 专项", url: "https://www.ctfhub.com/" }
      ],
      quiz: [
        "ThinkPHP 的入口文件在哪？",
        "怎么判断一个站用的是哪个 ThinkPHP 版本？",
        "为什么「版本识别」比「自己挖洞」更高效？",
        "控制器里哪三类写法最危险？",
        "vendor 目录为什么值得优先看？"
      ]
    },
    {
      id: "p4l3",
      title: "Python / Flask：读源码与 SSTI 的根源",
      est: 45,
      goal: "看懂一个 Flask 应用，理解模板渲染为什么会产生 SSTI，并知道 Flask 的四个常见配置风险。",
      sections: [
        { type: "p", text: "Flask 是 CTF 里最常见的 Python 后端。它代码量小、结构清晰，所以几乎每道 Flask 题都可以「读源码做题」。" },
        { type: "touch", title: "Flask 的雷区，与 Python 的对象图", text: "<code>debug=True</code>、<code>SECRET_KEY</code> 泄露、<code>render_template_string</code> 拼接、pickle 反序列化。前三个已经在 p3d 里出现过；pickle 是 Python 特有的对象图问题，和 JS 原型链不是一回事。", links: [
          { name: "图谱 · SSTI", href: "#vulnmap/ssti" },
          { name: "图谱 · Session/JWT", href: "#vulnmap/auth" },
          { name: "图谱 · Python 反序列化", href: "#vulnmap/py-deser" }
        ]},
        { type: "code", lang: "python", title: "一个最小 Flask 应用", src: `from flask import Flask, request, render_template_string

app = Flask(__name__)

@app.route("/")
def index():
    name = request.args.get("name", "world")
    return render_template_string("Hello, " + name)      # ← 危险！

    # 安全写法：把用户输入当变量，而不是模板源码
    # return render_template_string("Hello, {{ name }}", name=name)

if __name__ == "__main__":
    app.run(debug=True)` },
        { type: "p", text: "关键就在那个「危险」：<b>把用户输入拼进模板字符串，再交给 Jinja2 渲染</b>，等于让用户写模板代码。模板引擎会把 <code>{{ ... }}</code> 求值，所以输入 <code>{{7*7}}</code> 会输出 49。" },
        { type: "code", lang: "python", title: "SSTI 的最小验证与利用思路", src: `# 请求：/?name={{7*7}}
# 返回 Hello, 49   -> 模板被执行了，存在 SSTI
# 返回 Hello, {{7*7}} -> 只是字符串

# 确认后往下走：看配置、找能执行命令的类
# {{ config }}
# {{ ''.__class__.__mro__[1].__subclasses__() }}
# 在子类列表里找 Popen 等危险类，再调用` },
        { type: "table", title: "Flask 的四个常见配置风险", head: ["配置", "风险", "怎么发现"], rows: [
          ["debug=True", "Werkzeug 调试器可执行任意代码", "报错页出现调试器 / PIN 输入框"],
          ["SECRET_KEY 弱/泄露", "可伪造 session（Flask 的 session 是签名 cookie）", "读源码拿到 key，用 flask-unsign 伪造"],
          ["render_template_string 拼接", "SSTI", "输入 {{7*7}} 看是否求值"],
          ["debug 页的 PIN", "可按算法算出 PIN 进调试器", "拿到 /sys/class/... 等文件即可算 PIN"]
        ]},
        { type: "code", lang: "python", title: "读 Flask 源码的顺序", src: `# 1. 找所有路由
@app.route("/xxx", methods=["GET", "POST"])
# 2. 看每个路由的参数怎么被使用
request.args.get() / request.form.get() / request.json
# 3. 看三件事：
#    - 有没有拼进模板（SSTI）
#    - 有没有拼进命令/文件路径（命令执行/文件读取）
#    - 有没有校验（登录、角色、签名）
# 4. 看全局配置：app.config、SECRET_KEY、debug 开关` },
        { type: "note", text: "Flask 的 session 是「客户端 cookie + 服务端签名」，不是服务端存储。<b>拿到 SECRET_KEY 就能伪造任意 session</b>——这类题比 SSTI 还常见。记住常用工具：flask-unsign。" }
      ],
      code: [],
      labs: [
        { name: "Flask 官方文档", url: "https://flask.palletsprojects.com/" },
        { name: "PortSwigger · SSTI", url: "https://portswigger.net/web-security/server-side-template-injection" }
      ],
      quiz: [
        "render_template_string 和 render_template 的安全差异在哪？",
        "怎么用一行请求判断有没有 SSTI？",
        "Flask debug 模式为什么危险？",
        "拿到 SECRET_KEY 能做什么？",
        "读 Flask 源码时先看哪三件事？"
      ]
    },
    {
      id: "p4l4",
      title: "Django / Java Spring / Node.js 概览",
      est: 40,
      goal: "知道这三类技术栈各自的「考点地形」，遇到时知道往哪看、怎么确认。",
      sections: [
        { type: "p", text: "这三者不需要一开始就精通，但必须知道它们的典型漏洞形态。目标是：<b>看到站的指纹，就能立刻缩小到对应的漏洞集合</b>。" },
        { type: "touch", title: "解析器与运行时默认信任了什么", text: "Java 的 XML 解析器默认可能允许 DTD（XXE），<code>readObject</code> 是反序列化入口；Node 的 <code>vm</code> 不是安全边界，原型链污染能影响子进程选项。看到这些技术栈，先问「它默认信任了什么」，而不是先找 payload。", links: [
          { name: "图谱 · XXE", href: "#vulnmap/xxe" },
          { name: "图谱 · Java 反序列化", href: "#vulnmap/java-deser" },
          { name: "图谱 · 原型链污染", href: "#vulnmap/proto" }
        ]},
        { type: "table", title: "Django（Python）", head: ["项目", "内容"], rows: [
          ["结构", "MTV：Model / Template / View，app 分模块"],
          ["默认安全", "模板自动转义（XSS 少见）、CSRF 默认开启"],
          ["考点", "SECRET_KEY 泄露 → session 伪造；DEBUG=True 报错泄露；pickle 反序列化；SQL 注入（少）"],
          ["怎么确认", "错误页 Django 风格、Cookie 名 csrftoken/sessionid、路径 /admin/"]
        ]},
        { type: "table", title: "Spring Boot（Java）", head: ["项目", "内容"], rows: [
          ["结构", "Controller / Service / Repository，注解驱动"],
          ["指纹", "Whitelabel Error Page、JSESSIONID、actuator"],
          ["考点", "Actuator 端点暴露（/actuator/env、/heapdump）、SpEL 注入、路由后缀绕过、反序列化链、Shiro/Fastjson/Log4j"],
          ["怎么确认", "报错页、Cookie 名、/actuator 探测、静态资源路径"]
        ]},
        { type: "table", title: "Node.js / Express（JS）", head: ["项目", "内容"], rows: [
          ["结构", "路由 + 中间件，app.use / app.get 链式"],
          ["指纹", "X-Powered-By: Express、connect.sid Cookie"],
          ["考点", "原型链污染、沙箱逃逸（vm 不是安全边界）、路径/大小写处理差异、EJS/Pug 模板注入"],
          ["怎么确认", "响应头、错误栈里的 node_modules 路径"]
        ]},
        { type: "note", text: "一句话记忆：<b>看到 Java 先想组件版本，看到 Node 先想原型链，看到 Python 先想模板与调试模式</b>。三者共同的起点仍然是：读源码、认版本、找入口。" }
      ],
      code: [],
      labs: [
        { name: "Spring Boot Actuator 文档", url: "https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html" }
      ],
      quiz: [
        "Spring 的 Actuator 暴露会泄露什么？",
        "Node 的原型链污染为什么影响面这么大？",
        "Django 默认对 XSS 的处理是什么？",
        "白标错误页（Whitelabel Error Page）是哪类框架的特征？",
        "三类栈各有一个「优先想」的漏洞，分别是什么？"
      ]
    },
    {
      id: "p4l5",
      title: "如何快速识别一个站的技术栈",
      est: 35,
      goal: "用 5 个信号在两分钟内判断后端语言与框架，并能写出对应的探测命令。",
      sections: [
        { type: "p", text: "技术栈识别不是炫技，而是「把题目面积从无限缩小到一个已知的漏洞集合」。CTF 里这一步做对，后面往往就是套 payload；做错，就会反复试错浪费时间。" },
        { type: "table", title: "五个信号", head: ["信号", "怎么查", "能看出什么"], rows: [
          ["URL 后缀", "看路径", ".php → PHP；.jsp/.do/.action → Java；.aspx → .NET；无后缀 → 框架路由"],
          ["响应头", "curl -I", "Server、X-Powered-By（ThinkPHP 会暴露）、Set-Cookie 名"],
          ["报错页", "故意传错参数", "ThinkPHP 紫色页 / Flask Werkzeug 调试页 / Spring 白标页"],
          ["Cookie 名", "看 Set-Cookie", "PHPSESSID=PHP、JSESSIONID=Java、connect.sid=Express、csrftoken=Django"],
          ["静态资源路径", "看源码里的 link/script", "/static/、/assets/、/public/ 的组织方式各框架不同"]
        ]},
        { type: "code", lang: "bash", title: "两个命令先看头", src: `curl -I https://target.com/                 # 响应头指纹
curl -s https://target.com/ | head -50      # 源码头部

# 针对性探测
curl -I https://target.com/actuator/health  # Spring Actuator
curl -s https://target.com/.git/config      # 源码泄露
curl -s https://target.com/robots.txt` },
        { type: "h", text: "两分钟识别流程" },
        { type: "steps", items: [
          "敲 <code>curl -I</code> 看 Server / X-Powered-By / Set-Cookie。",
          "打开首页看 URL 后缀和静态资源路径。",
          "随便传个错参数（如 <code>?id='</code>），看报错页样式。",
          "用上面的对照表得出结论；结论不确定就估一个「最可能」，后面按这个方向试。",
          "把结论写进笔记：语言、框架、版本迹象、下一步该看哪一节。"
        ]},
        { type: "note", text: "真实站点还有 WAF/CDN，头信息可能被改。所以「识别」是一个<b>概率判断</b>：用多个信号投票，而不是信一个。CTF 题目里改头信息的情况少，报告头通常可信。" }
      ],
      code: [],
      labs: [
        { name: "Wappalyzer（技术栈识别扩展）", url: "https://www.wappalyzer.com/" }
      ],
      quiz: [
        "看到 PHPSESSID 能推断出什么？",
        "Whitelabel Error Page 是哪类框架的典型报错？",
        "为什么「干净路径（无后缀）」反而暗示用了框架？",
        "JSESSIONID 属于哪种语言？",
        "识别出技术栈之后，下一步是什么？"
      ]
    }
  ]
});
