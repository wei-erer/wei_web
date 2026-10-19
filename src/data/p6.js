/* PART 6 · 工具与流程 */
COURSE.modules.push({
  id: "p6",
  title: "PART 3 · 工具与第一次解题",
  weeks: "第 3–4 周",
  summary: "先学会用工具、并且立刻去打最简单的题——不需要学完任何语言。这一 PART 的目标是：会用 Burp 改包、会起靶场、会查手册，并且打掉几道新手题。",
  lessons: [
    {
      id: "p6l1",
      title: "Burp Suite 四件套",
      est: 45,
      goal: "会用 Proxy / HTTP history / Repeater / Decoder 完成一次完整改包，并知道每一步该看什么。",
      sections: [
        { type: "p", text: "Burp 是 Web 安全最核心的工具。但初学只需要四个功能——把这四个用熟，比装一堆插件有用得多。" },
        { type: "table", title: "四件套的分工", head: ["功能", "作用", "什么时候用"], rows: [
          ["Proxy 代理", "浏览器流量经过 Burp，可拦截、修改、放行", "需要「看」和「改」每一个请求时"],
          ["HTTP history 历史", "所有经过的请求，可搜索、筛选、重放", "回头看「刚才那个请求长什么样」"],
          ["Repeater 重放", "改一个参数发一次，看响应变化", "做题的实验台，90% 的时间在这里"],
          ["Decoder 编解码", "Base64 / URL / Hex / 字节互转", "参数被编码、需要构造 payload 时"]
        ]},
        { type: "h", text: "十分钟装好并跑通" },
        { type: "steps", items: [
          "启动 Burp，确认 Proxy 监听 <code>127.0.0.1:8080</code>（Proxy → Options 里能看到）。",
          "浏览器装代理插件（SwitchyOmega），把 HTTP/HTTPS 都指向 <code>127.0.0.1:8080</code>。",
          "访问 <code>http://burp</code> 下载 CA 证书并安装到系统信任区——不装的话 HTTPS 全是证书错误。",
          "打开 Intercept，刷新一个页面：请求被拦下 → Forward 放行 → 关闭 Intercept。",
          "在 HTTP history 里找到刚才那条请求 → 右键 <b>Send to Repeater</b> → 改一个参数 → Send → 看响应。"
        ]},
        { type: "code", lang: "text", title: "做题的标准循环（背下来）", src: `Proxy 抓到 / HTTP history 找到
        ↓
   右键 Send to Repeater
        ↓
   改一个变量（只改一个！）
        ↓
   Send → 对比：状态码 / 长度 / 关键词 / 时间
        ↓
   有变化 → 顺着改；没变化 → 换一个变量` },
        { type: "code", lang: "bash", title: "不装浏览器也能抓：curl 直接过代理", src: `curl -x http://127.0.0.1:8080 -k "http://target/?id=1"

# 或者直接看脚本的请求（requests 走代理）
# proxies={"http":"http://127.0.0.1:8080","https":"http://127.0.0.1:8080"}` },
        { type: "note", text: "一个能救命的习惯：<b>每次只改一个东西再发</b>。同时改三个参数，响应变了你也不知道是哪个起了作用——这是新手最常见的浪费时间方式。" }
      ],
      code: [],
      labs: [
        { name: "PortSwigger · Burp 文档", url: "https://portswigger.net/burp/documentation" },
        { name: "PortSwigger Web Security Academy（免费靶场）", url: "https://portswigger.net/web-security" }
      ],
      quiz: [
        "Repeater 和 Proxy 的分工是什么？",
        "不装 CA 证书会看到什么现象？",
        "HTTP history 比浏览器 Network 强在哪？",
        "为什么「一次只改一个参数」？",
        "想在没有浏览器的情况下改包，用什么命令？"
      ]
    },
    {
      id: "p6l2",
      title: "Yakit、curl 与 CyberChef：更轻的三个工具",
      est: 25,
      goal: "知道每个工具的定位，能按场景选对工具——而不是只会一个。",
      sections: [
        { type: "table", title: "定位对照", head: ["工具", "定位", "最常用的场景", "替代关系"], rows: [
          ["Yakit", "国产免费的 Burp 替代", "图形化抓包、重放、插件式扫描", "新手友好的 Burp 替代"],
          ["curl", "命令行 HTTP 客户端", "精确复现、脚本化、复制即用", "和浏览器 Network 互通（Copy as cURL）"],
          ["CyberChef", "编解码瑞士军刀", "多层 Base64 / 换编码 / 哈希识别", "浏览器里就能用"],
          ["DevTools", "浏览器自带", "看 DOM、看请求、跑 JS", "一切的第一步"]
        ]},
        { type: "code", lang: "bash", title: "curl 必会参数", src: `curl -i   URL      # 带上响应头
curl -I   URL      # 只要响应头
curl -X POST -d "a=1&b=2" URL
curl -H "Cookie: session=xxx" URL
curl -b "session=xxx" URL           # 等价写法
curl -k   URL      # 忽略证书错误
curl -L   URL      # 跟随重定向
curl -x http://127.0.0.1:8080 URL   # 走 Burp 代理
curl -o out.html URL                # 存文件` },
        { type: "p", text: "CyberChef 的典型用法：拿到一串 <code>ZmxhZ3t3M2J9</code> 这样的字符，丢进去试 Base64 解码；如果是套娃，用 <b>Magic</b> 自动猜。CTF 的编码题基本都在这里解决。" },
        { type: "note", text: "工具不在多。一个抓包工具 + curl + 一个编解码工具，就足够打到中级题。真正决定你水平的是「看懂响应差异」的能力，不是工具数量。" }
      ],
      code: [],
      labs: [
        { name: "Yakit 官网", url: "https://www.yaklang.com/" },
        { name: "CyberChef", url: "https://gchq.github.io/CyberChef/" },
        { name: "curl 官方文档", url: "https://curl.se/docs/manpage.html" }
      ],
      quiz: [
        "为什么说「工具不在多」？",
        "CyberChef 最典型的用途是什么？",
        "curl 的 -i 和 -I 有什么区别？",
        "浏览器里怎么做才能拿到等价的 curl 命令？"
      ]
    },
    {
      id: "p6l3",
      title: "信息收集：把题目面积缩小",
      est: 35,
      goal: "掌握目录扫描、指纹识别、备份文件探测、源码泄露还原的基本流程。",
      sections: [
        { type: "p", text: "信息收集不是「扫得越多越好」，而是<b>用最少的请求找到最有价值的东西</b>：源码、备份、隐藏路径、版本号。" },
        { type: "table", title: "四类收集动作", head: ["类型", "动作", "常用工具"], rows: [
          ["指纹识别", "看响应头、报错页、Cookie 名、静态资源路径", "curl -I、whatweb、Wappalyzer"],
          ["目录与文件", "常见路径、备份文件、编辑器临时文件", "dirsearch、ffuf、自定义字典"],
          ["源码泄露", ".git / .svn / .bak / .zip / source map", "GitHack、git-dumper"],
          ["子域与端口", "子域名枚举、常见端口探测", "oneforall、nmap（仅授权目标）"]
        ]},
        { type: "code", lang: "bash", title: "常用动作（按性价比排序）", src: `curl -I http://target                 # 1. 响应头指纹
curl http://target/robots.txt         # 2. 隐藏路径
curl http://target/.git/config        # 3. 源码泄露（200 = 存在）
curl -s http://target/index.php.bak -o a.bak -w "%{http_code}\\n"

# 目录扫描（字典决定效果；比赛先用小字典跑一遍）
python dirsearch.py -u http://target -e php,zip,bak,txt,swp

# 指纹识别
whatweb http://target` },
        { type: "h", text: "处理顺序（先做最划算的）" },
        { type: "steps", items: [
          "先看题面有没有给源码/附件——给了就先读，不要在没读源码的情况下去扫目录。",
          "再做响应头 + 首页源码（Ctrl+F 搜 flag / api / key）——成本最低。",
          "接着试 robots.txt、常见备份名、.git/config——四个请求见分晓。",
          "以上都没有，才上目录扫描——这时你要的是一份「更大的地图」。",
          "扫到东西后立即停下来读，不要为了「扫完」继续消耗时间。"
        ]},
        { type: "note", text: "在真实环境里做目录扫描必须<b>有书面授权</b>，并且控制并发；扫描可能触发告警、影响业务。课程里的练习一律在靶场或本地容器里做。" }
      ],
      code: [],
      labs: [
        { name: "dirsearch", url: "https://github.com/maurosoria/dirsearch" }
      ],
      quiz: [
        "目录扫描的目的是什么？什么时候该扫、什么时候别扫？",
        ".git 泄露怎么还原源码？",
        "为什么要猜 .bak / .zip 这类后缀？",
        "信息收集的四类动作里，性价比最高的是哪个？"
      ]
    },
    {
      id: "p6l4",
      title: "Docker 搭本地靶场",
      est: 35,
      goal: "能在 Windows / WSL 里装好 Docker，一键起一个漏洞环境，并会排错。",
      sections: [
        { type: "p", text: "本地靶场是最安全的练习环境：随便打、随时重置、不违法。这也是 PART 0 强调的「合法练习」的落点。" },
        { type: "code", lang: "bash", title: "装好 Docker（两条路选一条）", src: `# 路线 A：Windows 装 Docker Desktop（新手推荐）
# 官网下载 -> 安装 -> 启动 -> 左下角显示 Engine running

# 路线 B：WSL Ubuntu 里装 docker（更接近服务器）
sudo apt update
sudo apt install -y docker.io
sudo usermod -aG docker $USER     # 免 sudo，重新登录后生效
docker --version` },
        { type: "table", title: "常见靶场镜像", head: ["靶场", "起法", "端口"], rows: [
          ["DVWA", "docker run -d -p 8081:80 vulnerables/web-dvwa", "8081"],
          ["SQLi-Labs", "docker run -d -p 8082:80 acgpiano/sqli-labs", "8082"],
          ["Upload-Labs", "docker run -d -p 8083:80 c0ny1/upload-labs", "8083"],
          ["XSS-Labs", "docker run -d -p 8084:80 vulfocus/xss-labs", "8084"],
          ["Pikachu", "docker run -d -p 8085:80 area39/pikachu", "8085"]
        ]},
        { type: "code", lang: "bash", title: "日常命令与排错", src: `docker ps                 # 正在运行的容器
docker ps -a              # 包括已停止的
docker logs <id>          # 容器启动失败先看这个
docker exec -it <id> bash # 进容器里看文件
docker stop <id> && docker rm <id>
docker images             # 本地镜像

# 端口被占用：换一个宿主机端口
docker run -d -p 8090:80 vulnerables/web-dvwa` },
        { type: "table", title: "起不来时按顺序查", head: ["现象", "先查什么"], rows: [
          ["docker ps 里没有容器", "docker ps -a 看是否 Exited；docker logs 看报错"],
          ["浏览器打不开", "容器端口映射对不对；宿主机防火墙；是否用了 127.0.0.1"],
          ["curl 能通但浏览器不行", "代理设置（Burp 还开着？）"],
          ["镜像拉不下来", "换国内镜像加速器；或先 docker pull 单独执行看错误"]
        ]},
        { type: "note", text: "在 WSL 里可以这样访问 Windows 上的靶场：<code>curl http://$(hostname).local:8081</code>；反过来 Windows 浏览器访问 WSL 里的服务，用 <code>http://localhost:8081</code> 即可（WSL2 默认能通）。" }
      ],
      code: [],
      labs: [{ name: "Docker 官方文档", url: "https://docs.docker.com/" }],
      quiz: [
        "为什么本地靶场是最安全的练习环境？",
        "docker ps 和 docker ps -a 的区别？",
        "容器起不来时第一步看什么？",
        "端口被占用怎么办？"
      ]
    },
    {
      id: "p6l5",
      title: "外部手册怎么用：HackTricks 与 seccmd 攻击手册",
      est: 30,
      goal: "把两个社区常用的手册变成自己的「字典」：卡住时知道查哪个词、查完怎么验证。",
      sections: [
        { type: "p", text: "这门课给你的是「体系和最小复现」；但每种漏洞的变体、冷门绕过、特定框架的 payload，多到没人能背完。<b>正确的做法是：会查，而不是会背。</b>下面两个站点，一个英文百科、一个中文速查，正好互补。" },
        { type: "table", title: "两个手册怎么分工", head: ["手册", "是什么", "怎么用", "适合什么时候"], rows: [
          ["HackTricks", "英文的渗透测试百科，按攻击面/漏洞名组织，覆盖面最广", "在站内搜英文关键词，例如 SQL injection、XSS、file upload", "想要「完整打法 + 变体」时"],
          ["seccmd · Attack_CN", "中文攻击手册速查", "按分类找对应条目，对照 payload 和命令", "想快速看中文步骤、确认写法时"]
        ]},
        { type: "table", title: "查什么词：漏洞 → 关键词 → 本课程对应节", head: ["漏洞", "搜这个英文关键词", "本课程"], rows: [
          ["SQL 注入", "SQL injection", "p5l3 / p5l4"],
          ["XSS", "XSS（cross site scripting）", "p5l5"],
          ["文件上传", "file upload", "p5l6"],
          ["文件包含 / 路径穿越", "file inclusion / path traversal", "p5l7"],
          ["命令执行", "command injection", "p5l8"],
          ["SSRF", "SSRF", "p5l9"],
          ["CSRF", "CSRF", "p5l10"],
          ["模板注入", "SSTI", "p5l11"],
          ["XXE", "XXE", "p5l12"],
          ["反序列化", "deserialization", "p5l13 / p5l14"],
          ["JWT", "JWT", "p5l15"],
          ["越权 / 逻辑漏洞", "IDOR / access control / business logic", "p5l16"]
        ]},
        { type: "h", text: "查手册的纪律（重要）" },
        { type: "steps", items: [
          "先自己做 15 分钟：判断漏洞类型、试 2 个 payload——没有自己的尝试，查了也记不住。",
          "卡住后再查：只看「下一步该怎么做」，不要整篇读完。",
          "回到题目验证：手册里的 payload 90% 要按目标环境改（引号、闭合符、路径）。",
          "验证成功后，把「为什么这样改」写进自己的速查表——这才是你的东西。",
          "最后回课程对应节，把原理补上：手册给招式，课程给内功。"
        ]},
        { type: "code", lang: "text", title: "一个典型的查手册循环", src: `做题卡住
  → 判断：这是哪一类？（对照 PART 7 的节）
  → 搜：HackTricks 里搜英文关键词
  → 挑：只挑和当前上下文相符的那一条
  → 改：按目标的引号/路径/编码改 payload
  → 验：Burp Repeater 发一次，看响应差异
  → 记：把「生效的 payload + 为什么」写进笔记` },
        { type: "note", text: "手册是字典，不是教材。只收藏不查、只查不复盘，都是白费——这也是「太笼统」的来源：课程给地图，具体路线要你自己在靶场上走一遍。" }
      ],
      code: [],
      labs: [
        { name: "HackTricks（英文渗透百科）", url: "https://book.hacktricks.wiki/en/index.html" },
        { name: "seccmd · Attack_CN（中文攻击手册）", url: "https://www.seccmd.net/Attack_CN/" }
      ],
      quiz: [
        "HackTricks 和 seccmd 各自适合什么时候查？",
        "查手册之前，为什么要求先自己做 15 分钟？",
        "手册里的 payload 为什么不能直接照抄？",
        "查完一条 payload，笔记里应该记哪两样东西？"
      ]
    }
  ]
});
