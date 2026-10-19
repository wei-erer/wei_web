/* PART 5 · 自己写一个 Web 应用
 * 学完脚本之后、学框架之前：亲手搭一个小站，把「六段旅程」变成自己写过的东西。
 */
COURSE.modules.push({
  id: "p3d",
  title: "PART 5 · 自己写一个 Web 应用",
  weeks: "第 7–9 周",
  summary: "不写过一个站，读别人的源码永远是雾里看花。这一 PART 用 Flask 从零写一个带登录、下单、权限判断的小应用，再回头用 Burp 打自己的站——你会发现漏洞都是「开发时偷的懒」。",
  lessons: [
    {
      id: "p3d1",
      title: "为什么要自己写一个站",
      est: 25,
      goal: "理解「开发视角」和「攻击视角」是同一件事的两面，并知道自己要写一个什么样的站。",
      sections: [
        { type: "p", text: "学长给的建议里有一条特别关键：<b>学语言的时候顺手写一个正经 Web 应用</b>。因为漏洞从来不是凭空出现的，它是开发过程中的某个决定——图省事、少校验、信任前端——带来的副作用。写过一遍，你才知道那些决定发生在哪里。" },
        { type: "table", title: "开发时会做的决定 → 后来变成的漏洞", head: ["开发时的决定", "当时的理由", "后来成了什么"], rows: [
          ["直接在页面里拼 SQL", "快，先跑通", "SQL 注入"],
          ["前端校验金额和数量", "用户体验好", "逻辑漏洞、价格篡改"],
          ["把用户 id 放在请求里", "方便，模板里直接取", "水平越权"],
          ["登录后把 role 放 Cookie", "省一次查库", "权限伪造"],
          ["错误信息直接返回", "方便调试", "信息泄露"],
          ["上传文件不过滤后缀", "先支持常见格式", "文件上传 getshell"]
        ]},
        { type: "p", text: "我们要写的小站叫 <b>wei_shop</b>，只做四件事：注册/登录、商品列表、下单、个人中心。功能很少，但六段旅程里的每一段都能碰到。" },
        { type: "steps", items: [
          "先在纸上画出页面对应的四个路由和它们需要的字段。",
          "决定每个页面的「身份从哪来」（session 里的 user_id，绝不从请求里取）。",
          "决定「数据怎么存」（SQLite 一张 users、一张 orders）。",
          "写完后再想：如果我是攻击者，这四处分别能怎么打？"
        ]},
        { type: "note", text: "写这个站的目的不是做出一个能上线的产品，而是让你从此读别人的源码时，能一眼看到「这里本来该有校验，但他偷懒了」。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "开发视角和攻击视角为什么是同一件事的两面？",
        "为什么「前端校验」会同时导致体验问题和安全问题？",
        "你打算让自己的小站支持哪四个页面？"
      ]
    },
    {
      id: "p3d2",
      title: "需求与数据建模：先想清楚再写代码",
      est: 30,
      goal: "能用三张表描述一个小商城，并说清哪些字段是「敏感字段」。",
      sections: [
        { type: "p", text: "很多漏洞在写代码之前就埋下了：表设计里没有「归属」字段，后面就很容易写出越权；密码字段图省事存明文，泄露时就是灾难。" },
        { type: "table", title: "三张表", head: ["表", "字段", "注意点"], rows: [
          ["users", "id, username, pass_hash, role, created_at", "密码只存哈希；role 只用于服务端判断"],
          ["products", "id, name, price, stock", "price 用整数（分），避免浮点误差"],
          ["orders", "id, user_id, product_id, qty, amount, status, created_at", "user_id 必须来自 session；amount 由服务端算"]
        ]},
        { type: "code", lang: "sql", title: "建表语句（SQLite）", src: `CREATE TABLE users (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  username  TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'user',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  price INTEGER NOT NULL,     -- 单位：分
  stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,   -- 归属：谁下的单
  product_id INTEGER NOT NULL,
  qty        INTEGER NOT NULL,
  amount     INTEGER NOT NULL,   -- 服务端计算，不接收前端传的金额
  status     TEXT NOT NULL DEFAULT 'created',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);` },
        { type: "table", title: "哪些字段不能信", head: ["字段", "为什么", "正确做法"], rows: [
          ["amount", "前端可以改成 1 分钱", "服务端按 price × qty 重新算"],
          ["role", "用户可以改 Cookie", "只从数据库读"],
          ["user_id", "可以改成别人的 id", "从 session 取，不接收"],
          ["status", "可以跳过支付", "状态机由服务端推进"]
        ]},
        { type: "note", text: "这张表的思想可以迁移到所有系统：<b>凡是「钱、身份、归属、状态」，都必须由服务端决定。</b>记住这句话，一半的逻辑漏洞就没了。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "orders 表里 user_id 为什么必须来自 session？",
        "price 为什么用整数存「分」而不是浮点？",
        "哪四个字段属于「服务端必须自己决定」的？"
      ]
    },
    {
      id: "p3d3",
      title: "用 Flask 写登录与页面",
      est: 45,
      goal: "写出一个能注册、登录、看商品、下单的最小 Flask 应用，并理解 session 在这里的作用。",
      sections: [
        { type: "code", lang: "python", title: "app.py（最小可运行）", src: `from flask import Flask, request, session, redirect, render_template_string
import sqlite3, hashlib, os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-only-change-me")

def db():
    conn = sqlite3.connect("shop.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        u = request.form["username"]
        p = request.form["password"]
        h = hashlib.sha256(p.encode()).hexdigest()
        with db() as c:
            c.execute("INSERT INTO users(username, pass_hash) VALUES(?, ?)", (u, h))
        return redirect("/login")
    return render_template_string(REG_FORM)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        u = request.form["username"]
        h = hashlib.sha256(request.form["password"].encode()).hexdigest()
        row = db().execute("SELECT id, pass_hash FROM users WHERE username = ?", (u,)).fetchone()
        if row and row["pass_hash"] == h:
            session["uid"] = row["id"]          # 身份只放服务端签名过的 session
            return redirect("/")
        return "用户名或密码错误", 401
    return render_template_string(LOGIN_FORM)

@app.route("/")
def index():
    if "uid" not in session:
        return redirect("/login")
    rows = db().execute("SELECT * FROM products").fetchall()
    return render_template_string(INDEX, rows=rows, uid=session["uid"])` },
        { type: "table", title: "这一段里，哪些地方是「安全写法」", head: ["写法", "为什么安全"], rows: [
          ["session[\"uid\"] = row[\"id\"]", "身份由服务端签名，用户改不了"],
          ["SQL 用 ? 占位符", "参数化查询，杜绝注入"],
          ["密码只存 sha256（真实项目用 bcrypt/argon2）", "拖库也拿不到明文"],
          ["secret_key 从环境变量读", "不把密钥写进代码/仓库"]
        ]},
        { type: "note", text: "这个站还故意留了几处「不安全的写法」——比如金额从表单读、错误信息原样返回——就是为了让你在第 5 节用 Burp 亲手打自己。带着「我知道这里会出问题」的心态写代码，是理解漏洞最快的路。" }
      ],
      code: [],
      labs: [{ name: "Flask 官方教程（中文）", url: "https://flask.palletsprojects.com/zh-cn/stable/tutorial/" }],
      quiz: [
        "session 里的 uid 为什么比「请求参数里的 uid」安全？",
        "SQL 的 ? 占位符解决了哪一类问题？",
        "真实项目里密码哈希为什么不用裸 sha256？"
      ]
    },
    {
      id: "p3d4",
      title: "数据层：SQLite、参数化与事务",
      est: 35,
      goal: "会用参数化查询与事务写业务逻辑，并能说出「拼接 SQL」到底错在哪。",
      sections: [
        { type: "code", lang: "python", title: "正确 vs 错误", src: `# ❌ 错误：拼接字符串
sql = f"SELECT * FROM users WHERE username = '{u}'"
c.execute(sql)          # 传入 ' OR '1'='1 就直接绕过

# ✅ 正确：参数化
c.execute("SELECT * FROM users WHERE username = ?", (u,))

# ✅ 正确：多条语句用事务，保证「扣库存 + 建订单」同时成功或同时失败
with db() as c:
    c.execute("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?", (qty, pid, qty))
    if c.total_changes == 0:
        raise ValueError("库存不足")
    c.execute("INSERT INTO orders(user_id, product_id, qty, amount) VALUES(?,?,?,?)",
              (session["uid"], pid, qty, amount))` },
        { type: "table", title: "数据层的三件事", head: ["事项", "做法", "防住了什么"], rows: [
          ["参数化", "永远用 ? 占位符", "SQL 注入"],
          ["事务", "扣库存与建订单放同一事务", "并发下超卖/半成功"],
          ["服务端计算", "金额、库存、状态都在服务端算", "价格篡改、状态跳过"]
        ]},
        { type: "code", lang: "python", title: "一个容易忽略的越权写法", src: `# ❌ 从请求里取 user_id：用户传别人的 id 就能看别人订单
uid = request.args.get("uid")
orders = db().execute("SELECT * FROM orders WHERE user_id = ?", (uid,)).fetchall()

# ✅ 从 session 取：只可能看到自己的
orders = db().execute("SELECT * FROM orders WHERE user_id = ?", (session["uid"],)).fetchall()` },
        { type: "note", text: "参数化解决「代码注入」，事务解决「并发与一致性」，服务端计算解决「信任前端」。这三条写完，你的小站就比很多线上项目安全了。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "拼接 SQL 与参数化查询在执行层面有什么不同？",
        "为什么「扣库存 + 建订单」必须放在一个事务里？",
        "从请求里取 user_id 会带来什么漏洞？"
      ]
    },
    {
      id: "p3d5",
      title: "上线前的安全检查清单，以及用 Burp 打自己的站",
      est: 40,
      goal: "把自己的站跑起来，按清单自查一遍，再用 Burp 实际验证 3 个漏洞并修复。",
      sections: [
        { type: "table", title: "上线前自查清单", head: ["检查项", "怎么查", "对应漏洞"], rows: [
          ["所有查询都参数化", "全局搜 execute( / f-string 拼 SQL", "SQL 注入"],
          ["输出做了转义", "搜 render_template_string / Markup", "XSS"],
          ["身份只从 session 取", "搜 request.args.get(\"uid\")", "越权"],
          ["金额/状态服务端算", "搜 request.form[\"amount\"]", "逻辑漏洞"],
          ["上传有白名单", "搜 .filename / save(", "文件上传"],
          ["错误信息不回显", "故意传错参数看报错", "信息泄露"],
          ["依赖没有已知漏洞", "pip list → 对照 CVE", "组件漏洞"]
        ]},
        { type: "steps", items: [
          "本地跑起来：<code>flask --app app run --debug</code>，用浏览器把四个页面都走一遍。",
          "打开 Burp，浏览器代理到 127.0.0.1:8080，勾上 Intercept。",
          "<b>打自己的站 1</b>：登录请求里把密码改成 <code>' OR '1'='1</code>，看你写的是不是参数化（应当失败）。",
          "<b>打自己的站 2</b>：下单时把 amount 改成 1，看服务端是否重新计算（应当忽略）。",
          "<b>打自己的站 3</b>：把 URL 里的订单 id 改成别人的，看是否越权（应当 403）。",
          "发现能打通的地方，回到代码里修掉，再打一次——这一步比看十篇 WriteUp 有用。"
        ]},
        { type: "note", text: "这份清单就是「正经 Web 应用开发会考虑什么」的答案：<b>输入校验、身份与权限、数据一致性、错误处理、依赖管理、部署配置</b>。它同样是你以后审计别人代码的检查表。" }
      ],
      code: [],
      labs: [
        { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
        { name: "PortSwigger · 用 Burp 打自己的站", url: "https://portswigger.net/burp/documentation" }
      ],
      quiz: [
        "自查清单里哪一项最容易被新手忽略？",
        "为什么「打自己的站」比看 WriteUp 更有效？",
        "如果 amount 能被篡改成功，代码里应该改哪里？"
      ]
    }
  ]
});
