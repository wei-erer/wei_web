/* ===== wei_web 应用逻辑（零依赖） ===== */
(function () {
  "use strict";

  var LS = {
    progress: "weiweb.progress.v1",
    notes: "weiweb.notes.v1",
    theme: "weiweb.theme",
    open: "weiweb.open.v1",
  };

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  var progress = load(LS.progress, {});
  var notes = load(LS.notes, {});
  var openMods = load(LS.open, null);
  var startDate = load("weiweb.start.v1", "");
  var visits = load("weiweb.visits.v1", []);
  var lastId = load("weiweb.last.v1", "");
  var review = load("weiweb.review.v1", {});
  var labsDone = load("weiweb.labs.v1", {});
  var dailyPick = load("weiweb.daily.v1", {});

  var ALL = [];
  COURSE.modules.forEach(function (m) {
    m.lessons.forEach(function (l, i) {
      ALL.push({ mod: m, lesson: l, idx: i });
    });
  });
  function flatIndex(id) {
    for (var i = 0; i < ALL.length; i++) if (ALL[i].lesson.id === id) return i;
    return -1;
  }

  var el = {
    tree: document.getElementById("tree"),
    main: document.getElementById("main"),
    bar: document.getElementById("bar"),
    pnum: document.getElementById("pnum"),
    ptot: document.getElementById("ptot"),
    search: document.getElementById("search"),
    exportBtn: document.getElementById("export-btn"),
    themeBtn: document.getElementById("theme-btn"),
    mapbtn: document.getElementById("mapbtn"),
    homeBtn: document.getElementById("homebtn"),
    reviewBtn: document.getElementById("reviewbtn"),
    discussBtn: document.getElementById("discussbtn"),
  };

  /* ---------- 主题 ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    save(LS.theme, t);
    el.themeBtn.textContent = t === "light" ? "🌙 深色" : "☀️ 浅色";
    if (typeof syncCommentTheme === "function") syncCommentTheme();
  }
  applyTheme(load(LS.theme, "dark"));

  /* ---------- 学习面板：打卡 / 周计划 ---------- */
  var PLAN_WEEKS = 22;

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function recordVisit() {
    var t = todayStr();
    if (visits.indexOf(t) === -1) {
      visits.push(t);
      if (visits.length > 400) visits = visits.slice(-400);
      save("weiweb.visits.v1", visits);
    }
  }

  function streakDays() {
    var set = {};
    visits.forEach(function (d) { set[d] = 1; });
    var n = 0;
    var d = new Date();
    for (;;) {
      var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      if (!set[key]) break;
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function planWeek() {
    if (!startDate) return 0;
    var s = new Date(startDate + "T00:00:00");
    if (isNaN(s.getTime())) return 0;
    var days = Math.floor((new Date() - s) / 86400000);
    if (days < 0) return 0;
    return Math.min(PLAN_WEEKS, Math.floor(days / 7) + 1);
  }

  function weekLessons(w) {
    if (!w) return [];
    var total = ALL.length;
    var a = Math.floor(((w - 1) * total) / PLAN_WEEKS);
    var b = Math.floor((w * total) / PLAN_WEEKS);
    return ALL.slice(a, b);
  }

  /* ---------- 复习卡（间隔重复） ---------- */
  var BOX_DAYS = [1, 3, 7, 15, 30];

  function allCards() {
    var out = [];
    ALL.forEach(function (x) {
      (x.lesson.quiz || []).forEach(function (q, i) {
        out.push({ key: x.lesson.id + "#" + i, lesson: x.lesson, mod: x.mod, q: q, i: i });
      });
    });
    return out;
  }

  function dueCards() {
    var now = Date.now();
    return allCards().filter(function (c) {
      var st = review[c.key];
      return !st || st.due <= now;
    });
  }

  function gradeCard(key, ok) {
    var st = review[key] || { box: 0 };
    st.box = ok ? Math.min(BOX_DAYS.length, st.box + 1) : 1;
    st.due = Date.now() + BOX_DAYS[st.box - 1] * 86400000;
    st.last = Date.now();
    review[key] = st;
    save("weiweb.review.v1", review);
  }

  function labStats() {
    var total = 0, done = 0;
    ALL.forEach(function (x) {
      (x.lesson.labs || []).forEach(function (l, i) {
        total++;
        if (labsDone[x.lesson.id + "#" + i]) done++;
      });
    });
    return { total: total, done: done };
  }

  function dailyCard() {
    var cards = allCards();
    if (!cards.length) return null;
    var today = todayStr();
    if (dailyPick.date === today && dailyPick.key) {
      for (var i = 0; i < cards.length; i++) if (cards[i].key === dailyPick.key) return cards[i];
    }
    var idx = Math.floor(Date.now() / 86400000) % cards.length;
    return cards[idx];
  }

  /* ---------- 进度 ---------- */
  function refreshProgress() {
    var done = ALL.filter(function (x) {
      return progress[x.lesson.id];
    }).length;
    var pct = ALL.length ? Math.round((done / ALL.length) * 100) : 0;
    el.bar.style.width = pct + "%";
    el.pnum.textContent = done;
    el.ptot.textContent = ALL.length;
  }

  /* ---------- 侧栏 ---------- */
  function defaultOpenSet() {
    var s = {};
    COURSE.modules.forEach(function (m, i) {
      s[m.id] = i < 2;
    });
    return s;
  }
  if (!openMods) openMods = defaultOpenSet();

  function lessonMatches(lesson, q) {
    if (!q) return true;
    var hay = [lesson.title, lesson.goal || ""].join(" ");
    (lesson.sections || []).forEach(function (s) {
      if (s.text) hay += " " + s.text;
      if (s.title) hay += " " + s.title;
      if (s.items) hay += " " + s.items.join(" ");
      if (s.head) hay += " " + s.head.join(" ");
      if (s.rows) hay += " " + s.rows.map(function (r) { return r.join(" "); }).join(" ");
      if (s.src) hay += " " + s.src;
    });
    (lesson.quiz || []).forEach(function (q2) {
      hay += " " + q2;
    });
    return hay.toLowerCase().indexOf(q) !== -1;
  }

  function renderTree(filter) {
    var q = (filter || "").trim().toLowerCase();
    el.tree.innerHTML = "";
    COURSE.modules.forEach(function (m) {
      var shown = m.lessons.filter(function (l) {
        return lessonMatches(l, q);
      });
      if (q && !shown.length) return;

      var mod = document.createElement("div");
      mod.className = "mod" + (openMods[m.id] || q ? " open" : "");
      mod.dataset.mod = m.id;

      var head = document.createElement("div");
      head.className = "mod-head";
      head.innerHTML =
        '<span class="caret">▶</span><span class="mname"></span><span class="mweek"></span>';
      head.querySelector(".mname").textContent = m.title;
      head.querySelector(".mweek").textContent = m.weeks;
      head.onclick = function () {
        openMods[m.id] = !openMods[m.id];
        save(LS.open, openMods);
        renderTree(el.search.value);
      };
      mod.appendChild(head);

      var body = document.createElement("div");
      body.className = "mod-body";
      shown.forEach(function (l) {
        var a = document.createElement("div");
        var curHash = (location.hash || "").replace(/^#/, "");
        var active = curHash === l.id;
        a.className =
          "lesson" + (progress[l.id] ? " done" : "") + (active ? " active" : "");
        a.innerHTML = '<span class="tick">✓</span><span class="ltitle"></span>';
        a.querySelector(".ltitle").textContent = l.title;
        a.onclick = function () {
          location.hash = l.id;
        };
        body.appendChild(a);
      });
      mod.appendChild(body);
      el.tree.appendChild(mod);
    });
    if (!el.tree.children.length) {
      el.tree.innerHTML = '<p class="empty" style="padding:12px">没有匹配的课程</p>';
    }
  }

  /* ---------- 内容渲染 ---------- */
  function currentId() {
    var h = (location.hash || "").replace(/^#/, "");
    return flatIndex(h) >= 0 ? h : ALL[0].lesson.id;
  }

  function codeBlock(c) {
    var wrap = document.createElement("div");
    wrap.className = "codecard";
    var bar = document.createElement("div");
    bar.className = "cbar";
    var lang = document.createElement("span");
    lang.className = "lang";
    lang.textContent = (c.title ? c.title + " · " : "") + (c.lang || "code");
    var btn = document.createElement("button");
    btn.textContent = "复制";
    btn.onclick = function () {
      var txt = c.src;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(function () {
          btn.textContent = "已复制";
          setTimeout(function () {
            btn.textContent = "复制";
          }, 1400);
        });
      } else {
        var ta = document.createElement("textarea");
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        btn.textContent = "已复制";
        setTimeout(function () {
          btn.textContent = "复制";
        }, 1400);
      }
    };
    bar.appendChild(lang);
    bar.appendChild(btn);
    var pre = document.createElement("pre");
    pre.textContent = c.src;
    wrap.appendChild(bar);
    wrap.appendChild(pre);
    return wrap;
  }

  function renderLesson(id) {
    var fi = flatIndex(id);
    if (fi < 0) fi = 0;
    var item = ALL[fi];
    var m = item.mod;
    var l = item.lesson;

    el.main.innerHTML = "";

    var crumb = document.createElement("div");
    crumb.className = "crumb";
    crumb.innerHTML = "<b></b> / <span></span>";
    crumb.querySelector("b").textContent = m.title;
    crumb.querySelector("span").textContent = l.title;
    el.main.appendChild(crumb);

    var h1 = document.createElement("h1");
    h1.className = "ltitle-h";
    h1.textContent = l.title;
    el.main.appendChild(h1);

    var meta = document.createElement("div");
    meta.className = "meta-row";
    var p1 = document.createElement("span");
    p1.className = "pill week";
    p1.textContent = m.weeks;
    var p2 = document.createElement("span");
    p2.className = "pill";
    p2.textContent = "约 " + (l.est || 20) + " 分钟";
    var p3 = document.createElement("span");
    p3.className = "pill" + (progress[l.id] ? " ok" : "");
    p3.id = "status-pill";
    p3.textContent = progress[l.id] ? "✓ 已完成" : "未完成";
    meta.appendChild(p1);
    meta.appendChild(p2);
    meta.appendChild(p3);

    var doneBtn = document.createElement("button");
    doneBtn.className = "btn primary";
    doneBtn.style.flex = "0 0 auto";
    doneBtn.style.padding = "6px 14px";
    doneBtn.textContent = progress[l.id] ? "取消完成" : "标记完成";
    doneBtn.onclick = function () {
      if (progress[l.id]) delete progress[l.id];
      else progress[l.id] = true;
      save(LS.progress, progress);
      refreshProgress();
      renderTree(el.search.value);
      renderLesson(id);
    };
    meta.appendChild(doneBtn);
    el.main.appendChild(meta);

    if (l.goal) {
      var g = document.createElement("div");
      g.className = "goal";
      g.innerHTML = '<div class="lab">本节目标</div><p></p>';
      g.querySelector("p").textContent = l.goal;
      el.main.appendChild(g);
    }

    // 正文
    (l.sections || []).forEach(function (s) {
      if (s.type === "p") {
        var p = document.createElement("p");
        p.innerHTML = s.text; // 作者自撰内容，允许行内标签
        el.main.appendChild(p);
      } else if (s.type === "list") {
        var ul = document.createElement("ul");
        ul.className = "body-list";
        s.items.forEach(function (it) {
          var li = document.createElement("li");
          li.innerHTML = it;
          ul.appendChild(li);
        });
        el.main.appendChild(ul);
      } else if (s.type === "note") {
        var nt = document.createElement("div");
        nt.className = "note";
        nt.innerHTML = s.text;
        el.main.appendChild(nt);
      } else if (s.type === "code") {
        el.main.appendChild(codeBlock(s));
      } else if (s.type === "h") {
        var hh = document.createElement("h2");
        hh.className = "sec";
        hh.textContent = s.text;
        el.main.appendChild(hh);
      } else if (s.type === "steps") {
        var st = document.createElement("ol");
        st.className = "steps";
        (s.items || []).forEach(function (it) {
          var sli = document.createElement("li");
          sli.innerHTML = it;
          st.appendChild(sli);
        });
        el.main.appendChild(st);
      } else if (s.type === "table") {
        var tw = document.createElement("div");
        tw.className = "tablewrap";
        if (s.title) {
          var cap = document.createElement("div");
          cap.className = "tablecap";
          cap.textContent = s.title;
          tw.appendChild(cap);
        }
        var tbl = document.createElement("table");
        tbl.className = "datatable";
        var thead = document.createElement("thead");
        var trh = document.createElement("tr");
        (s.head || []).forEach(function (hcell) {
          var th = document.createElement("th");
          th.innerHTML = hcell;
          trh.appendChild(th);
        });
        thead.appendChild(trh);
        tbl.appendChild(thead);
        var tbody = document.createElement("tbody");
        (s.rows || []).forEach(function (row) {
          var tr = document.createElement("tr");
          row.forEach(function (cell) {
            var td = document.createElement("td");
            td.innerHTML = cell;
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        tbl.appendChild(tbody);
        tw.appendChild(tbl);
        el.main.appendChild(tw);
      }
    });

    // 多代码块
    (l.code || []).forEach(function (c) {
      el.main.appendChild(codeBlock(c));
    });

    // flag 挑战
    if (l.flag) {
      var chal = document.createElement("div");
      chal.className = "chal";
      chal.innerHTML =
        '<div style="font-weight:600;margin-bottom:4px">🚩 提交你的 flag</div>' +
        '<div class="chal-row"><input id="flag-in" placeholder="flag{...}" autocomplete="off"><button id="flag-go">提交</button></div>' +
        '<div class="msg" id="flag-msg"></div>';
      el.main.appendChild(chal);
      var input = chal.querySelector("#flag-in");
      var msg = chal.querySelector("#flag-msg");
      chal.querySelector("#flag-go").onclick = function () {
        var v = (input.value || "").trim();
        if (v === l.flag) {
          msg.className = "msg ok";
          msg.textContent = "✓ 正确！你完成了第一个 flag。已自动标记本节完成。";
          progress[l.id] = true;
          save(LS.progress, progress);
          refreshProgress();
          renderTree(el.search.value);
        } else if (!v) {
          msg.className = "msg bad";
          msg.textContent = "还没填东西。先按 F12 看看 <head>。";
        } else {
          msg.className = "msg bad";
          msg.textContent = "✗ 不对。再检查一下大小写和花括号。";
        }
      };
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") chal.querySelector("#flag-go").click();
      });
    }

    // 靶场
    if (l.labs && l.labs.length) {
      var h2a = document.createElement("h2");
      h2a.className = "sec";
      h2a.textContent = "靶场与资源（练过就勾上）";
      el.main.appendChild(h2a);
      var box = document.createElement("div");
      box.className = "lab-list";
      l.labs.forEach(function (lab, li) {
        var key = l.id + "#" + li;
        var row = document.createElement("div");
        row.className = "labrow";
        var cb = document.createElement("span");
        cb.className = "labcheck" + (labsDone[key] ? " on" : "");
        cb.setAttribute("role", "checkbox");
        cb.setAttribute("aria-checked", labsDone[key] ? "true" : "false");
        cb.textContent = "✓";
        cb.title = "标记为已练过";
        cb.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          labsDone[key] = !labsDone[key];
          save("weiweb.labs.v1", labsDone);
          cb.classList.toggle("on", !!labsDone[key]);
          cb.setAttribute("aria-checked", labsDone[key] ? "true" : "false");
        };
        var a = document.createElement("a");
        a.className = "lab";
        a.href = lab.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.innerHTML = "<span></span><span class='arrow'>↗</span>";
        a.querySelector("span").textContent = lab.name;
        row.appendChild(cb);
        row.appendChild(a);
        box.appendChild(row);
      });
      el.main.appendChild(box);
    }

    // 自测
    if (l.quiz && l.quiz.length) {
      var h2b = document.createElement("h2");
      h2b.className = "sec";
      h2b.textContent = "自测 · 答不上就回去重读";
      el.main.appendChild(h2b);
      var q = document.createElement("div");
      q.className = "quiz";
      var ol = document.createElement("ol");
      l.quiz.forEach(function (t) {
        var li = document.createElement("li");
        li.innerHTML = t;
        ol.appendChild(li);
      });
      q.appendChild(ol);
      el.main.appendChild(q);
    }

    // 笔记
    var nw = document.createElement("div");
    nw.className = "notes-wrap";
    nw.innerHTML =
      '<h2 class="sec">我的笔记</h2>' +
      '<textarea id="note" placeholder="写下你的理解、踩过的坑、还没搞懂的地方…（自动保存到本机）"></textarea>' +
      '<div class="savehint" id="savehint"></div>';
    el.main.appendChild(nw);
    var ta = nw.querySelector("#note");
    var hint = nw.querySelector("#savehint");
    ta.value = notes[l.id] || "";
    var timer = null;
    ta.addEventListener("input", function () {
      hint.textContent = "输入中…";
      clearTimeout(timer);
      timer = setTimeout(function () {
        notes[l.id] = ta.value;
        save(LS.notes, notes);
        hint.textContent = "已保存 ✓";
        setTimeout(function () {
          if (hint.textContent === "已保存 ✓") hint.textContent = "";
        }, 1600);
      }, 420);
    });

    // 上下节
    var pager = document.createElement("div");
    pager.className = "pager";
    if (fi > 0) {
      var prev = ALL[fi - 1].lesson;
      var pa = document.createElement("a");
      pa.href = "#" + prev.id;
      pa.textContent = "← " + prev.title;
      pager.appendChild(pa);
    } else {
      pager.appendChild(document.createElement("span"));
    }
    if (fi < ALL.length - 1) {
      var nxt = ALL[fi + 1].lesson;
      var na = document.createElement("a");
      na.className = "next";
      na.href = "#" + nxt.id;
      na.textContent = nxt.title + " →";
      pager.appendChild(na);
    }
    el.main.appendChild(pager);

    mountComments(l);

    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  /* ---------- 评论区（giscus） ---------- */
  function commentsTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function commentConfig() {
    var cfg = (window.WEIWEB_CONFIG || {}).comments || {};
    return {
      cfg: cfg,
      ready: cfg.enabled === true && !!cfg.repo && !!cfg.repoId && !!cfg.categoryId,
    };
  }

  function mountGiscusInto(body, term, hintText) {
    var c = commentConfig();
    if (location.protocol === "file:") {
      body.innerHTML = '<p class="comments-hint">' + hintText + "</p>";
      return;
    }
    if (!c.ready) {
      body.innerHTML =
        '<p class="comments-hint">评论区尚未启用。按 README「评论区」一节填写 <code>src/config.js</code> 并重新构建即可。' +
        "讨论内容会存放在 GitHub Discussions 中，不需要自建服务器。</p>";
      return;
    }
    var cfg = c.cfg;
    var s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    var attrs = {
      "data-repo": cfg.repo,
      "data-repo-id": cfg.repoId,
      "data-category": cfg.category,
      "data-category-id": cfg.categoryId,
      "data-mapping": "specific",
      "data-term": term,
      "data-strict": "0",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": commentsTheme(),
      "data-lang": cfg.lang || "zh-CN",
      "data-loading": "lazy",
    };
    Object.keys(attrs).forEach(function (k) {
      s.setAttribute(k, attrs[k]);
    });
    body.appendChild(s);
  }

  function mountComments(lesson) {
    var wrap = document.createElement("div");
    wrap.id = "comments";
    wrap.className = "comments-wrap";
    var h2 = document.createElement("h2");
    h2.className = "sec";
    h2.textContent = "讨论 · " + lesson.title;
    wrap.appendChild(h2);
    var body = document.createElement("div");
    body.className = "comments-body";
    wrap.appendChild(body);
    el.main.appendChild(wrap);
    mountGiscusInto(
      body,
      lesson.id,
      "评论区需要部署到网页后使用（本地双击打开时无法加载）。部署到 GitHub Pages 并按 README 配置 giscus 后，这里会显示本节讨论。"
    );
  }

  /* ---------- 最近讨论 / 全局讨论 ---------- */
  var recentCache = null;

  function loadRecent(cb) {
    if (recentCache !== null) {
      cb(recentCache);
      return;
    }
    function done(list) {
      recentCache = Array.isArray(list) ? list : [];
      cb(recentCache);
    }
    try {
      fetch("recent.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(done)
        .catch(function () { done([]); });
    } catch (e) {
      done([]);
    }
  }

  function lessonByTerm(term) {
    for (var i = 0; i < ALL.length; i++) {
      if (ALL[i].lesson.id === term) return ALL[i];
    }
    return null;
  }

  function recentRow(it) {
    var hit = lessonByTerm(it.term);
    var isGlobal = it.term === "global";
    var row = document.createElement("div");
    row.className = "recentrow";
    var main = document.createElement("a");
    main.className = "rtitle";
    if (hit) {
      main.href = "#" + hit.lesson.id;
      main.textContent = hit.lesson.title;
    } else if (isGlobal) {
      main.href = "#discuss";
      main.textContent = "全局讨论";
    } else {
      main.href = it.url || "#discuss";
      main.textContent = it.title || it.term || "讨论";
      if (it.url) {
        main.target = "_blank";
        main.rel = "noopener";
      }
    }
    row.appendChild(main);
    var meta = document.createElement("span");
    meta.className = "rmeta";
    var d = it.updatedAt ? new Date(it.updatedAt) : null;
    var when = d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";
    meta.textContent = (hit ? hit.mod.title + " · " : isGlobal ? "讨论区 · " : "") + when;
    row.appendChild(meta);
    return row;
  }

  function fillRecent(box, limit) {
    loadRecent(function (list) {
      box.innerHTML = "";
      if (!list.length) {
        box.innerHTML =
          '<p class="comments-hint">还没有讨论记录。部署后在任意一节课底部发言，或到下方「全局讨论」发起话题。</p>';
        return;
      }
      list.slice(0, limit).forEach(function (it) {
        box.appendChild(recentRow(it));
      });
    });
  }

  function renderDiscuss() {
    el.mapbtn.classList.remove("active");
    el.homeBtn.classList.remove("active");
    el.reviewBtn.classList.remove("active");
    el.discussBtn.classList.add("active");

    el.main.innerHTML = "";
    var crumb = document.createElement("div");
    crumb.className = "crumb";
    crumb.innerHTML = "<b></b> / 讨论区";
    crumb.querySelector("b").textContent = COURSE.name;
    el.main.appendChild(crumb);

    var h1 = document.createElement("h1");
    h1.className = "ltitle-h";
    h1.textContent = "讨论区";
    el.main.appendChild(h1);

    var note = document.createElement("blockquote");
    note.className = "note";
    note.textContent =
      "每节课底部有该节的独立讨论；这里汇总最近讨论，并提供一个全局讨论区，用来提问、约人组队、反馈课程问题。需要登录 GitHub 才能发言。";
    el.main.appendChild(note);

    var h2 = document.createElement("h2");
    h2.className = "sec";
    h2.textContent = "最近讨论";
    el.main.appendChild(h2);
    var recent = document.createElement("div");
    recent.className = "recentlist";
    el.main.appendChild(recent);
    fillRecent(recent, 20);

    var h3 = document.createElement("h2");
    h3.className = "sec";
    h3.textContent = "全局讨论";
    el.main.appendChild(h3);
    var body = document.createElement("div");
    body.className = "comments-body";
    el.main.appendChild(body);
    mountGiscusInto(
      body,
      "global",
      "评论区需要部署到网页后使用。部署到 GitHub Pages 并配置 giscus 后，这里会显示全局讨论。"
    );

    window.scrollTo(0, 0);
  }

  function syncCommentTheme() {
    var iframes = document.querySelectorAll("iframe.giscus-frame");
    for (var i = 0; i < iframes.length; i++) {
      try {
        iframes[i].contentWindow.postMessage(
          { giscus: { setConfig: { theme: commentsTheme() } } },
          "https://giscus.app"
        );
      } catch (e) {}
    }
  }

  /* ---------- 技术栈路线图 ---------- */
  function renderRoadmap() {
    var R = COURSE.roadmap;
    el.main.innerHTML = "";

    var crumb = document.createElement("div");
    crumb.className = "crumb";
    crumb.innerHTML = "<b>wei_web</b> / 技术栈认知路线";
    el.main.appendChild(crumb);

    var h1 = document.createElement("h1");
    h1.className = "ltitle-h";
    h1.textContent = R.title;
    el.main.appendChild(h1);

    var note = document.createElement("div");
    note.className = "note";
    note.textContent = R.note;
    el.main.appendChild(note);

    // 主链路：横向流程
    var flow = document.createElement("div");
    flow.className = "flow";
    R.stages.forEach(function (s, i) {
      var chip = document.createElement("span");
      chip.className = "flow-chip";
      chip.textContent = s.stage;
      flow.appendChild(chip);
      if (i < R.stages.length - 1) {
        var arrow = document.createElement("span");
        arrow.className = "flow-arrow";
        arrow.textContent = "→";
        flow.appendChild(arrow);
      }
    });
    el.main.appendChild(flow);

    // 阶段卡片
    R.stages.forEach(function (s) {
      var card = document.createElement("div");
      card.className = "stage";
      var head = document.createElement("div");
      head.className = "stage-head";
      head.innerHTML =
        '<span class="stagedot"></span><span class="sname"></span>' +
        '<span class="stag"></span><span class="sopt"></span>';
      head.querySelector(".sname").textContent = s.stage + " · " + s.name;
      head.querySelector(".stag").textContent = (s.tracks || []).join(" / ");
      if (s.optional) head.querySelector(".sopt").textContent = "可选";
      card.appendChild(head);

      var body = document.createElement("div");
      body.className = "stage-body";

      var why = document.createElement("p");
      why.className = "why";
      why.textContent = s.why;
      body.appendChild(why);

      var ul = document.createElement("ul");
      ul.className = "body-list";
      s.learn.forEach(function (x) {
        var li = document.createElement("li");
        li.textContent = x;
        ul.appendChild(li);
      });
      body.appendChild(ul);

      var check = document.createElement("div");
      check.className = "checkline";
      check.innerHTML = "<b>验收标准</b> ";
      var span = document.createElement("span");
      span.textContent = s.check;
      check.appendChild(span);
      body.appendChild(check);

      card.appendChild(body);
      el.main.appendChild(card);
    });

    // 横向能力
    var h2 = document.createElement("h2");
    h2.className = "sec";
    h2.textContent = "横向能力（不属某个语言，但贯穿全程）";
    el.main.appendChild(h2);
    var grid = document.createElement("div");
    grid.className = "crossgrid";
    R.cross.forEach(function (c) {
      var d = document.createElement("div");
      d.className = "crossitem";
      d.innerHTML = "<b></b><span></span>";
      d.querySelector("b").textContent = c.name;
      d.querySelector("span").textContent = c.detail;
      grid.appendChild(d);
    });
    el.main.appendChild(grid);

    window.scrollTo(0, 0);
  }

  /* ---------- 学习面板 ---------- */
  function exportData() {
    var data = {
      app: "wei_web",
      version: COURSE.version,
      exportedAt: new Date().toISOString(),
      progress: progress,
      notes: notes,
      startDate: startDate,
      visits: visits,
      lastId: lastId,
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wei_web-data-" + todayStr() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var d = JSON.parse(reader.result);
        if (d.progress) {
          Object.keys(d.progress).forEach(function (k) { progress[k] = d.progress[k]; });
          save(LS.progress, progress);
        }
        if (d.notes) {
          Object.keys(d.notes).forEach(function (k) { notes[k] = d.notes[k]; });
          save(LS.notes, notes);
        }
        if (d.startDate) { startDate = d.startDate; save("weiweb.start.v1", startDate); }
        if (Array.isArray(d.visits)) {
          d.visits.forEach(function (v) { if (visits.indexOf(v) === -1) visits.push(v); });
          save("weiweb.visits.v1", visits);
        }
        refreshProgress();
        renderHome();
        renderTree(el.search.value);
        alert("导入完成：进度与笔记已合并。");
      } catch (e) {
        alert("导入失败：这不是有效的 JSON 备份文件。");
      }
    };
    reader.readAsText(file);
  }

  function renderHome() {
    el.mapbtn.classList.remove("active");
    el.reviewBtn.classList.remove("active");
    el.discussBtn.classList.remove("active");
    el.homeBtn.classList.add("active");
    var done = ALL.filter(function (x) { return progress[x.lesson.id]; }).length;
    var wk = planWeek();
    var streak = streakDays();
    var weekList = weekLessons(wk);

    el.main.innerHTML = "";
    var crumb = document.createElement("div");
    crumb.className = "crumb";
    crumb.innerHTML = "<b></b> / 学习面板";
    crumb.querySelector("b").textContent = COURSE.name;
    el.main.appendChild(crumb);

    var h1 = document.createElement("h1");
    h1.className = "ltitle-h";
    h1.textContent = "学习面板";
    el.main.appendChild(h1);

    var due = dueCards().length;
    var ls = labStats();
    var grid = document.createElement("div");
    grid.className = "homegrid";
    grid.innerHTML =
      '<div class="hcard"><div class="lab">总进度</div><div class="big-num" id="h-done"></div>' +
      '<div class="hnote" id="h-left"></div></div>' +
      '<div class="hcard"><div class="lab">复习待办</div><div class="big-num" id="h-due"></div>' +
      '<div class="hnote"><a href="#review" class="hlink">去复习 →</a></div></div>' +
      '<div class="hcard"><div class="lab">靶场进度</div><div class="big-num" id="h-lab"></div>' +
      '<div class="hnote">在每节「靶场与资源」里勾选</div></div>' +
      '<div class="hcard"><div class="lab">连续打卡</div><div class="big-num" id="h-streak"></div>' +
      '<div class="hnote">打开页面即算打卡（本地记录）</div></div>';
    el.main.appendChild(grid);
    grid.querySelector("#h-done").textContent = done + " / " + ALL.length;
    grid.querySelector("#h-left").textContent = done === ALL.length ? "全部完成，去做 WriteUp 吧" : "还剩 " + (ALL.length - done) + " 节";
    grid.querySelector("#h-due").textContent = due + " 张";
    grid.querySelector("#h-lab").textContent = ls.done + " / " + ls.total;
    grid.querySelector("#h-streak").textContent = streak + " 天";

    // 今日一题
    var dc = dailyCard();
    if (dc) {
      var dh = document.createElement("h2");
      dh.className = "sec";
      dh.textContent = "今日一题";
      el.main.appendChild(dh);
      var dbox = document.createElement("div");
      dbox.className = "dailybox";
      dbox.innerHTML =
        '<div class="dsrc"></div><div class="dq"></div>' +
        '<div class="dbtns"><button class="btn primary" id="d-go">去这一节</button>' +
        '<button class="btn" id="d-refresh">换一题</button></div>';
      dbox.querySelector(".dsrc").textContent = dc.mod.title + " · " + dc.lesson.title;
      dbox.querySelector(".dq").textContent = dc.q;
      el.main.appendChild(dbox);
      dbox.querySelector("#d-go").onclick = function () { location.hash = dc.lesson.id; };
      dbox.querySelector("#d-refresh").onclick = function () {
        var cards = allCards();
        dailyPick = { date: todayStr(), key: cards[Math.floor(Math.random() * cards.length)].key };
        save("weiweb.daily.v1", dailyPick);
        renderHome();
      };
    }

    var h2 = document.createElement("h2");
    h2.className = "sec";
    h2.textContent = "本周计划（22 周排完 82 节）";
    el.main.appendChild(h2);

    var plan = document.createElement("div");
    plan.className = "planbox";
    plan.innerHTML =
      '<div class="planbar"><span id="plan-state"></span>' +
      '<label class="datelabel">开始日期 <input type="date" id="start-date"></label></div>' +
      '<div class="planlist" id="plan-list"></div>';
    el.main.appendChild(plan);

    var dateInput = plan.querySelector("#start-date");
    if (startDate) dateInput.value = startDate;
    dateInput.addEventListener("change", function () {
      startDate = dateInput.value || "";
      save("weiweb.start.v1", startDate);
      renderHome();
    });

    var state = plan.querySelector("#plan-state");
    var list = plan.querySelector("#plan-list");
    if (!wk) {
      state.textContent = "设置开始日期，就能看到「本周该学哪几节」。";
      list.innerHTML = '<p class="hnote">没有开始日期也可以直接用左侧目录学——计划只是帮你排节奏。</p>';
    } else {
      var startLabel = startDate;
      state.innerHTML = "";
      var b = document.createElement("b");
      b.textContent = "第 " + wk + " / " + PLAN_WEEKS + " 周";
      state.appendChild(b);
      state.appendChild(document.createTextNode("（起点 " + startLabel + "）"));
      weekList.forEach(function (it) {
        var l = it.lesson;
        var row = document.createElement("a");
        row.className = "planrow" + (progress[l.id] ? " done" : "");
        row.href = "#" + l.id;
        row.innerHTML = '<span class="pt"></span><span class="pm"></span>';
        row.querySelector(".pt").textContent = l.title;
        row.querySelector(".pm").textContent = progress[l.id] ? "已完成" : "约 " + (l.est || 20) + " 分钟";
        list.appendChild(row);
      });
      if (!weekList.length) list.innerHTML = '<p class="hnote">这一周没有安排（22 周已走完）。</p>';
    }

    var hRecent = document.createElement("h2");
    hRecent.className = "sec";
    hRecent.textContent = "最近讨论";
    el.main.appendChild(hRecent);
    var recentBox = document.createElement("div");
    recentBox.className = "recentlist";
    el.main.appendChild(recentBox);
    fillRecent(recentBox, 5);
    var more = document.createElement("p");
    more.className = "hnote";
    more.innerHTML = '<a href="#discuss" class="hlink">进入讨论区 →</a>';
    el.main.appendChild(more);

    var h3 = document.createElement("h2");
    h3.className = "sec";
    h3.textContent = "数据与工具";
    el.main.appendChild(h3);

    var tools = document.createElement("div");
    tools.className = "toolrow";
    tools.innerHTML =
      '<button class="btn" id="home-random">🎲 随机一节（未完成）</button>' +
      '<button class="btn" id="home-continue">⏯ 继续上次</button>' +
      '<button class="btn" id="home-export">⬇ 导出数据备份</button>' +
      '<label class="btn filebtn">⬆ 导入数据<input type="file" id="home-import" accept="application/json,.json"></label>';
    el.main.appendChild(tools);

    var tip = document.createElement("p");
    tip.className = "hnote";
    tip.textContent = "备份文件包含全部进度、笔记、开始日期和打卡记录；换电脑时导入即可接着学。数据只存在你自己的浏览器里。";
    el.main.appendChild(tip);

    tools.querySelector("#home-random").onclick = function () {
      var pool = ALL.filter(function (x) { return !progress[x.lesson.id]; });
      if (!pool.length) pool = ALL;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      location.hash = pick.lesson.id;
    };
    tools.querySelector("#home-continue").onclick = function () {
      location.hash = lastId || ALL[0].lesson.id;
    };
    tools.querySelector("#home-export").onclick = exportData;
    tools.querySelector("#home-import").onchange = function (e) {
      if (e.target.files && e.target.files[0]) importData(e.target.files[0]);
    };

    window.scrollTo(0, 0);
  }

  /* ---------- 复习卡页面 ---------- */
  function renderReview(practiceKey) {
    el.mapbtn.classList.remove("active");
    el.homeBtn.classList.remove("active");
    el.discussBtn.classList.remove("active");
    el.reviewBtn.classList.add("active");

    var due = dueCards();
    var total = allCards().length;
    var today = todayStr();
    var reviewedToday = 0;
    Object.keys(review).forEach(function (k) {
      var st = review[k];
      if (st.last) {
        var d = new Date(st.last);
        var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        if (key === today) reviewedToday++;
      }
    });

    el.main.innerHTML = "";
    var crumb = document.createElement("div");
    crumb.className = "crumb";
    crumb.innerHTML = "<b></b> / 复习卡";
    crumb.querySelector("b").textContent = COURSE.name;
    el.main.appendChild(crumb);

    var h1 = document.createElement("h1");
    h1.className = "ltitle-h";
    h1.textContent = "复习卡 · 间隔重复";
    el.main.appendChild(h1);

    var sm = document.createElement("div");
    sm.className = "reviewstats";
    sm.textContent = "待复习 " + due.length + " 张 · 今天已复习 " + reviewedToday + " 张 · 全部 " + total + " 张";
    el.main.appendChild(sm);

    var tip = document.createElement("blockquote");
    tip.className = "note";
    tip.textContent = "每条自测题都是一张卡片。选「记住了」按 1 / 3 / 7 / 15 / 30 天安排下次复习；「没记住」明天再来。每天 5–10 分钟就够。";
    el.main.appendChild(tip);

    var card = practiceKey || (due.length ? due[0].key : "");
    if (!card) {
      var done = document.createElement("div");
      done.className = "reviewdone";
      done.innerHTML = "今天没有到期的卡片 🎉<br><span class=\"hnote\">明天再来，或者先随机复习一张。</span>";
      el.main.appendChild(done);
      var nextBtn = document.createElement("button");
      nextBtn.className = "btn";
      nextBtn.textContent = "🎲 随机复习一张";
      nextBtn.style.marginTop = "12px";
      nextBtn.onclick = function () {
        var cards = allCards();
        renderReview(cards[Math.floor(Math.random() * cards.length)].key);
      };
      el.main.appendChild(nextBtn);
      window.scrollTo(0, 0);
      return;
    }

    var found = null;
    allCards().forEach(function (c) { if (c.key === card) found = c; });
    if (!found) {
      renderReview();
      return;
    }

    var box = document.createElement("div");
    box.className = "reviewcard";
    box.innerHTML =
      '<div class="rsrc"><span class="rmod"></span></div>' +
      '<div class="rq"></div>' +
      '<div class="rbtns">' +
      '<button class="btn" id="r-bad">没记住</button>' +
      '<button class="btn primary" id="r-good">记住了</button>' +
      "</div>" +
      '<div class="rfoot"><a class="rlink">打开这一节 →</a></div>';
    box.querySelector(".rmod").textContent = found.mod.title + " · 第 " + (found.i + 1) + " 问";
    box.querySelector(".rq").textContent = found.q;
    var link = box.querySelector(".rlink");
    link.href = "#" + found.lesson.id;
    link.textContent = found.lesson.title + " →";
    el.main.appendChild(box);

    box.querySelector("#r-good").onclick = function () {
      gradeCard(found.key, true);
      renderReview();
    };
    box.querySelector("#r-bad").onclick = function () {
      gradeCard(found.key, false);
      renderReview();
    };

    window.scrollTo(0, 0);
  }

  /* ---------- 路由 ---------- */
  function route() {
    var h = (location.hash || "").replace(/^#/, "");
    if (h === "roadmap") {
      el.mapbtn.classList.add("active");
      el.homeBtn.classList.remove("active");
      el.reviewBtn.classList.remove("active");
      el.discussBtn.classList.remove("active");
      renderRoadmap();
      renderTree(el.search.value);
      return;
    }
    if (h === "home") {
      renderHome();
      renderTree(el.search.value);
      return;
    }
    if (h === "review") {
      renderReview();
      renderTree(el.search.value);
      return;
    }
    if (h === "discuss") {
      renderDiscuss();
      renderTree(el.search.value);
      return;
    }
    el.mapbtn.classList.remove("active");
    el.homeBtn.classList.remove("active");
    el.reviewBtn.classList.remove("active");
    el.discussBtn.classList.remove("active");
    var id = currentId();
    lastId = id;
    save("weiweb.last.v1", id);
    renderLesson(id);
    renderTree(el.search.value);
    var active = el.tree.querySelector(".lesson.active");
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ block: "nearest" });
    }
  }

  /* ---------- 导出笔记 ---------- */
  function exportNotes() {
    var lines = [];
    lines.push("# " + COURSE.name + " 学习笔记");
    lines.push("");
    lines.push("> 导出时间：" + new Date().toLocaleString());
    lines.push("");
    var done = ALL.filter(function (x) {
      return progress[x.lesson.id];
    }).length;
    lines.push("**进度**：" + done + " / " + ALL.length + " 节");
    lines.push("");
    COURSE.modules.forEach(function (m) {
      lines.push("## " + m.title + "（" + m.weeks + "）");
      lines.push("");
      m.lessons.forEach(function (l) {
        var mark = progress[l.id] ? "x" : " ";
        lines.push("- [" + mark + "] " + l.title);
        var n = (notes[l.id] || "").trim();
        if (n) {
          lines.push("");
          n.split("\n").forEach(function (ln) {
            lines.push("  > " + ln);
          });
          lines.push("");
        }
      });
      lines.push("");
    });
    var blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wei_web-notes-" + new Date().toISOString().slice(0, 10) + ".md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 3000);
  }

  /* ---------- 事件 ---------- */
  el.search.addEventListener("input", function () {
    renderTree(el.search.value);
  });
  el.exportBtn.addEventListener("click", exportNotes);
  el.mapbtn.addEventListener("click", function () {
    location.hash = "roadmap";
  });
  el.homeBtn.addEventListener("click", function () {
    location.hash = "home";
  });
  el.reviewBtn.addEventListener("click", function () {
    location.hash = "review";
  });
  el.discussBtn.addEventListener("click", function () {
    location.hash = "discuss";
  });
  el.themeBtn.addEventListener("click", function () {
    applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
  });
  window.addEventListener("hashchange", route);

  /* ---------- 启动 ---------- */
  recordVisit();
  refreshProgress();
  route();
})();
