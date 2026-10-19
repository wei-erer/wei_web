/* PART 0.5 · 环境与命令行：给「不熟 cmd / PowerShell / WSL」的人补的地基 */
COURSE.modules.push({
  id: "p0b",
  title: "PART 0.5 · 环境与命令行",
  weeks: "第 0 周 · 开工前",
  summary: "你说过对 cmd、PowerShell、WSL 都不太熟——这一模块专门补这个。学完你会：分清三个命令行、背下 20 个命令、在 Ubuntu 里装好环境、跑起第一个本地 Web 服务。",
  lessons: [
    {
      id: "p0b1",
      title: "终端、Shell、命令行：三个词到底是什么",
      est: 15,
      goal: "说清「终端 / Shell / 命令行 / 脚本」的区别，不再被这几个词绕晕。",
      sections: [
        { type: "p", text: "先拆开这三个词，它们经常被混着用，但指的是不同的东西：" },
        { type: "table", title: "三个概念", head: ["词", "是什么", "例子"], rows: [
          ["终端（Terminal）", "一个窗口，负责显示文字、接收你敲的键", "Windows Terminal、VS Code 的终端、Ubuntu 的 Terminal"],
          ["Shell", "终端里真正干活的程序：读你的命令、去执行、把结果打印出来", "cmd.exe、PowerShell、bash、zsh"],
          ["命令行（CLI）", "「用文字下指令」这种交互方式本身，与图形界面相对", "你在 Shell 里敲命令这件事"]
        ]},
        { type: "p", text: "所以「打开命令行」= 打开一个终端 + 里面跑着一个 Shell。你在 cmd 里敲的是 cmd 的命令，在 PowerShell 里敲的是 PowerShell 的命令，在 Ubuntu 的终端里敲的是 bash 的命令——<b>它们长得像，但不完全一样</b>，这正是初学者最容易被绊倒的地方。" },
        { type: "code", lang: "text", title: "同一个意思，三种写法", src: `             Windows cmd        PowerShell            Linux (bash)
列出文件      dir                ls / Get-ChildItem    ls
切换目录      cd 路径            cd 路径               cd 路径
看当前目录    cd                 pwd                   pwd
清屏          cls                cls                   clear
看文件内容    type 文件          cat 文件 / Get-Content cat 文件
新建文件夹    mkdir 名字         mkdir 名字            mkdir 名字
删除文件      del 文件           rm 文件               rm 文件
查帮助        help 命令           Get-Help 命令         man 命令` },
        { type: "note", text: "本课程后面的命令默认写在 <b>Ubuntu / bash</b> 里（因为 CTF 靶场、题目环境基本都是 Linux）。你自己的 Windows 上也能用，但要知道哪些命令要换写法——下一节专门讲。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "终端、Shell、命令行分别指什么？",
        "为什么同一个操作在 cmd、PowerShell、bash 里写法可能不同？",
        "「打开命令行」实际上是打开了哪两样东西？"
      ]
    },
    {
      id: "p0b2",
      title: "你这台 Windows 上的三个命令行环境",
      est: 20,
      goal: "分清 cmd、PowerShell、WSL 的关系，知道每件事该在哪个环境里做。",
      sections: [
        { type: "table", title: "三个环境对照", head: ["环境", "怎么打开", "特点", "适合做什么"], rows: [
          ["cmd（命令提示符）", "Win+R → 输入 cmd → 回车", "最老、最简单，命令少", "临时跑个 exe、ping 一下、看版本"],
          ["PowerShell", "Win+X → 终端 / 搜索 PowerShell", "功能强，能写脚本，命令是动词-名词式", "Windows 上的文件批量操作、查进程、装工具"],
          ["WSL（Ubuntu）", "开始菜单搜 Ubuntu / 在终端输入 wsl", "真正的 Linux 内核，和服务器几乎一样", "跑靶场、装 python/php/nginx、练 Linux 命令"]
        ]},
        { type: "h", text: "先分清「你在哪」" },
        { type: "steps", items: [
          "打开后看提示符：<code>C:\\Users\\你&gt;</code> 是 cmd 或 PowerShell；<code>你@主机:~$</code> 是 WSL 的 bash。",
          "在 PowerShell 里敲 <code>wsl</code> 回车就会进入 Ubuntu；在 Ubuntu 里敲 <code>exit</code> 回到 Windows。",
          "在任意环境里敲 <code>pwd</code> 看当前目录：bash 认识，cmd 不认识（cmd 用 <code>cd</code> 看当前目录）。",
          "不确定某个命令属于谁？先敲 <code>help</code> 或 <code>xxx --help</code>，能出来就是当前环境支持。"
        ]},
        { type: "code", lang: "text", title: "一个容易踩的坑：路径写法", src: `Windows 路径：  C:\\Users\\WEIHAO\\Desktop\\wei_web
Linux 路径：    /home/weihao/wei_web

WSL 访问 Windows 文件：/mnt/c/Users/WEIHAO/Desktop/wei_web
Windows 访问 WSL 文件：\\\\wsl$\\Ubuntu\\home\\weihao

结论：同一个文件，两边路径写法完全不同。搞不清就用 pwd 看一眼。` },
        { type: "note", text: "Windows + WSL 其实是最好的组合：<b>Windows 上写的东西放到 Ubuntu 里跑，Ubuntu 里的文件随时能用 Windows 的编辑器打开</b>。不用装虚拟机也不用折腾双系统。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "cmd、PowerShell、WSL 三个环境，各自最适合做什么？",
        "在 PowerShell 里怎么进入 Ubuntu？在 Ubuntu 里怎么回 Windows？",
        "WSL 里的 /mnt/c 对应 Windows 的什么位置？",
        "为什么本课程的命令默认写 bash 的写法？"
      ]
    },
    {
      id: "p0b3",
      title: "20 个必会命令（够你用一整年）",
      est: 30,
      goal: "把这 20 个命令练到不用查，能独立在目录里走动、看文件、跑服务。",
      sections: [
        { type: "p", text: "命令不用背全，先把下面 20 个练熟。你在 Ubuntu 里敲（Windows 的 cmd 里有些名字不一样，对照着看）。" },
        { type: "table", title: "目录与文件（最常用）", head: ["命令", "作用", "例子"], rows: [
          ["pwd", "我在哪（打印当前目录）", "pwd"],
          ["ls -la", "看这个目录有什么（含隐藏文件）", "ls -la"],
          ["cd 目录", "进入目录；cd .. 返回上一级；cd ~ 回家目录", "cd /var/www"],
          ["mkdir -p 目录", "新建目录（-p 连父目录一起建）", "mkdir -p web/test"],
          ["touch 文件", "新建空文件 / 更新时间戳", "touch a.txt"],
          ["cp -r 源 目标", "复制文件或目录", "cp -r src/ backup/"],
          ["mv 源 目标", "移动 / 重命名", "mv a.txt b.txt"],
          ["rm -rf 目录", "删除（很危险，-rf 是递归强制，别乱用）", "rm -rf old/"],
          ["cat 文件", "把文件内容打印出来", "cat /etc/passwd"],
          ["less 文件", "分页看长文件（q 退出）", "less access.log"]
        ]},
        { type: "table", title: "查找、网络、运行", head: ["命令", "作用", "例子"], rows: [
          ["grep 关键字 文件", "在文件里搜字符串", "grep flag access.log"],
          ["find 目录 -name 模式", "按名字找文件", "find / -name \"flag*\""],
          ["chmod +x 文件", "给执行权限", "chmod +x run.sh"],
          ["ps aux", "看所有进程", "ps aux | grep python"],
          ["kill 进程号", "结束进程", "kill 1234"],
          ["curl 网址", "发 HTTP 请求（最常用）", "curl -i http://127.0.0.1:8000/"],
          ["ping 地址", "测连通性", "ping -c 3 baidu.com"],
          ["sudo 命令", "用管理员权限执行", "sudo apt update"],
          ["apt install 包", "安装软件", "sudo apt install nginx"],
          ["history", "看之前敲过什么", "history | tail -20"]
        ]},
        { type: "code", lang: "bash", title: "几个马上就用的组合", src: `# 看某个端口有没有被占用
ss -tlnp | grep 8000

# 把命令输出写到文件（> 覆盖，>> 追加）
ls -la > list.txt

# 管道：把前一个命令的输出交给后一个
ps aux | grep nginx

# 后台运行一个服务，日志写到文件
python3 -m http.server 8000 > server.log 2>&1 &

# 结束它
kill %1` },
        { type: "note", text: "记命令的正确方式不是抄，而是<b>每用一次就把当天的命令记进笔记</b>。这门课每节底下都有笔记框，专门给你记这些。" }
      ],
      code: [],
      labs: [
        { name: "Linux 命令速查（交互式）", url: "https://explainshell.com/" }
      ],
      quiz: [
        "怎么查看当前目录下所有文件（含隐藏文件）？",
        "cd ..、cd ~、cd / 分别去哪？",
        "怎么在文件里搜一个字符串？",
        "curl 和浏览器访问网页的区别是什么？",
        "rm -rf 为什么危险？"
      ]
    },
    {
      id: "p0b4",
      title: "WSL + Ubuntu 上手：装好你的练习环境",
      est: 30,
      goal: "在 Ubuntu 里装好 python3、php、nginx，并把项目文件放到能两边访问的位置。",
      sections: [
        { type: "p", text: "你已经装了 Ubuntu，这节把它变成能干活的环境。全程在 <b>Ubuntu 终端</b>里操作（开始菜单搜 Ubuntu，或在 PowerShell 里敲 wsl）。" },
        { type: "steps", items: [
          "打开 Ubuntu，先更新软件源：<code>sudo apt update</code>（第一次要输 Windows 的密码，输密码时屏幕不显示，正常）。",
          "装基础工具：<code>sudo apt install -y python3 python3-pip php nginx curl git</code>。",
          "验证装好：<code>python3 -V</code>、<code>php -v</code>、<code>nginx -v</code>，各出一行版本号就成功。",
          "建一个练手目录：<code>mkdir -p ~/ctf && cd ~/ctf</code>。",
          "把 Windows 上的文件用 <code>/mnt/c/...</code> 访问，或把文件复制进来：<code>cp /mnt/c/Users/WEIHAO/Desktop/wei_web/dist/wei_web.html .</code>。",
          "（可选）想换源加速：编辑 <code>/etc/apt/sources.list</code>，把 archive.ubuntu.com 换成 mirrors.tuna.tsinghua.edu.cn，再 <code>sudo apt update</code>。"
        ]},
        { type: "code", lang: "bash", title: "常用环境检查一次性跑完", src: `sudo apt update
sudo apt install -y python3 python3-pip php nginx curl git unzip

python3 -V        # Python 3.x
php -v            # PHP 8.x
nginx -v          # nginx/1.x
curl --version    # curl 8.x

mkdir -p ~/ctf && cd ~/ctf && pwd` },
        { type: "table", title: "WSL 的四个实用知识", head: ["问题", "答案"], rows: [
          ["Windows 的文件在哪？", "/mnt/c/Users/WEIHAO/...（C 盘对应 /mnt/c）"],
          ["Ubuntu 的文件 Windows 能打开吗？", "能：资源管理器地址栏输入 \\\\wsl$\\Ubuntu\\home\\weihao"],
          ["为什么 apt 要 sudo？", "装软件要写系统目录，普通用户没权限"],
          ["sudo 密码输不进去？", "Linux 输入密码时不显示任何字符，盲输完回车即可"]
        ]},
        { type: "note", text: "装 Kali 的事先不急：<b>Ubuntu 已经足够跑通本课程 90% 的内容</b>。等你把这一模块的 Ubuntu 用熟了，再考虑装 Kali（或者直接装个 Docker 跑 Kali 镜像）。" }
      ],
      code: [],
      labs: [
        { name: "WSL 官方文档（中文）", url: "https://learn.microsoft.com/zh-cn/windows/wsl/" }
      ],
      quiz: [
        "sudo apt install 里的 sudo 是干什么的？",
        "WSL 里怎么访问 C 盘的文件？",
        "怎么确认 python3 / php / nginx 装好了？",
        "为什么现在不建议马上装 Kali？"
      ]
    },
    {
      id: "p0b5",
      title: "跑起你的第一个本地 Web 服务",
      est: 25,
      goal: "用三条命令分别起一个静态站、一个 PHP 站、一个 Flask 站，并知道端口是什么。",
      sections: [
        { type: "p", text: "本地起服务是你以后每天都要做的事：靶场在本地跑、自己的漏洞代码在本地跑、调试在本地跑。不用装复杂的东西，三条命令足够。" },
        { type: "code", lang: "bash", title: "① 静态文件服务（最简单，任意目录可用）", src: `# 在任意目录里执行，就把这个目录当成网站根目录
python3 -m http.server 8000

# 然后浏览器打开 http://127.0.0.1:8000
# 本课程的单文件版就是这样预览：
cd /mnt/c/Users/WEIHAO/Desktop/wei_web/dist && python3 -m http.server 8899
# 打开 http://127.0.0.1:8899/wei_web.html` },
        { type: "code", lang: "bash", title: "② PHP 内置服务（练 PHP 特性时用）", src: `cd ~/ctf
echo '<?php echo "hello " . $_GET["name"]; ?>' > index.php
php -S 127.0.0.1:8001

# 浏览器打开 http://127.0.0.1:8001/?name=web` },
        { type: "code", lang: "python", title: "③ Flask（PART 5 会详细学）", src: `# pip install flask
from flask import Flask, request

app = Flask(__name__)

@app.route("/")
def index():
    name = request.args.get("name", "web")
    return f"<h1>Hello, {name}</h1>"

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8002)` },
        { type: "table", title: "端口与访问地址", head: ["概念", "说明"], rows: [
          ["127.0.0.1", "本机地址（localhost 和它等价）"],
          ["端口 8000/8001/8002", "同一台机器上区分不同服务；一个端口只能被一个程序占用"],
          ["http://127.0.0.1:8000", "完整访问地址：协议 + 地址 + 端口"],
          ["服务没起来？", "看终端报错；换一个端口；确认端口没被占用（ss -tlnp）"]
        ]},
        { type: "note", text: "一个小习惯：<b>每起一个服务就在终端占一个窗口，别关掉</b>；要停就 Ctrl+C。把这些启动命令记进 p0b3 的笔记里，以后直接复制。" }
      ],
      code: [],
      labs: [
        { name: "MDN · HTTP 概述（中文）", url: "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview" }
      ],
      quiz: [
        "python3 -m http.server 8000 做了一件什么事？",
        "127.0.0.1 和 localhost 是什么关系？",
        "端口被占用了怎么排查？",
        "怎么停掉一个前台运行的本地服务？"
      ]
    },
    {
      id: "p0b6",
      title: "2–3 小时/周怎么学：22 周计划（82 节全学）",
      est: 20,
      goal: "按每周 2–3 小时的节奏排出可执行的计划：22 周走完 82 节，工具与刷题从第 3 周就开始。",
      sections: [
        { type: "p", text: "先说结论：<b>每周 2–3 小时，22 周能把 82 节全部走完一遍</b>。关键不是「学完再练」，而是<b>学到工具那部分就开始打题</b>，边打边补语言。" },
        { type: "table", title: "22 周计划（按 2.5 小时/周）", head: ["周次", "学什么", "节数", "这一阶段的验收"], rows: [
          ["第 1 周", "PART 0 + 0.5：开课准备、命令行、WSL、起服务", "10 节", "能在 Ubuntu 里起服务、跑 20 个命令"],
          ["第 1–2 周", "PART 1：HTML/CSS/JS/控制台/读源码", "6 节", "能在控制台改页面、拿到第一个 flag"],
          ["第 2–3 周", "PART 2 + 2.5：HTTP、Cookie、curl、六段旅程", "10 节", "能手工发请求、把漏洞放回六段图"],
          ["第 3–4 周", "PART 3：Burp、靶场、信息收集、查手册（开始打题）", "5 节", "能改包、能独立打掉几道新手题"],
          ["第 4–7 周", "PART 4：JS / Python / PHP（Python 在 PHP 前）", "8 节", "能写 20 行脚本复现一次手工测试"],
          ["第 7–9 周", "PART 5：自己写一个 Web 应用（Flask 小站）", "5 节", "能跑起自己的站，并用 Burp 打它"],
          ["第 9–10 周", "PART 6：技术栈识别（快速过）", "5 节", "看到站能猜出后端与框架"],
          ["第 10–15 周", "PART 7：漏洞体系 9 节 + 靶场", "9 节", "每类漏洞能独立复现"],
          ["第 15–18 周", "PART 8：高级漏洞 9 节", "9 节", "能读源码找链，不靠背 payload"],
          ["第 18–20 周", "PART 9：渗透流程（收集/验证/后渗透/报告）+ 解题方法论", "11 节", "能写出一份合格的验证记录与报告"],
          ["第 20–22 周", "PART 10：实战复盘", "4 节", "能独立完成一遍完整流程并复盘"]
        ]},
        { type: "h", text: "「2 小时」怎么切" },
        { type: "list", items: [
          "<b>20 分钟</b>：读一节正文（不敲代码，先建立印象）。",
          "<b>60 分钟</b>：跟着动手——起服务、敲命令、在控制台试。这一块不能省。",
          "<b>20 分钟</b>：做本节自测 + 写笔记（写「我今天学会了什么」，3 行就够）。",
          "<b>20 分钟</b>：把命令和 payload 抄进自己的速查表（用笔记框）。"
        ]},
        { type: "h", text: "什么时候可以加速、什么时候该停" },
        { type: "list", items: [
          "基础部分（PART 0–4）不要反复回炉：过一遍就往前走，后面用到了自然会补。",
          "PART 6 框架只花 2 周快速过：认得出技术栈就够了，框架细节遇到题目再查。",
          "某一节连续两次都卡住超过 40 分钟：记下「卡在哪」，先走下一节，别停在一节上。",
          "漏洞部分（PART 7 / 8）反过来要慢：每节必须在靶场上动手一次，不能只读。"
        ]},
        { type: "note", text: "最重要的不是速度，是<b>每周真的打开一次</b>。建议把「周三晚 20:00 学 1 小时 + 周六上午 1.5 小时」写进日历，比任何学习方法都有效。" }
      ],
      code: [],
      labs: [],
      quiz: [
        "22 周计划里，基础（PART 0–4）占了前几周？为什么要压缩它？",
        "「2 小时」的四个 20 分钟分别做什么？",
        "某节连续两次卡住超过 40 分钟时该怎么处理？",
        "为什么漏洞部分（PART 7）反而要慢下来、每节都动手？"
      ]
    }
  ]
});
