# -*- coding: utf-8 -*-
import os, re, html, sys

PDF = r"D:\下载\web_ru_men_zhi_bei (5).pdf"
HTMLF = r"C:\Users\WEIHAO\AppData\Local\Temp\Web 安全与渗透测试入门指北.html"
OUT = r"D:\文档\deepseek-harness\default-workspace\wei_web\refs"
os.makedirs(OUT, exist_ok=True)

# ---------- PDF ----------
try:
    from pypdf import PdfReader
    r = PdfReader(PDF)
    print("PDF 页数:", len(r.pages))
    parts = []
    for i, p in enumerate(r.pages, 1):
        try:
            t = p.extract_text() or ""
        except Exception as e:
            t = f"[page {i} extract failed: {e}]"
        parts.append(f"\n\n===== PAGE {i} =====\n{t}")
    txt = "".join(parts)
    # 压缩多余空白
    txt = re.sub(r"[ \t]+", " ", txt)
    open(os.path.join(OUT, "pdf.txt"), "w", encoding="utf-8").write(txt)
    print("PDF 提取字符数:", len(txt))
except Exception as e:
    print("PDF 失败:", e)

# ---------- HTML ----------
try:
    raw = open(HTMLF, encoding="utf-8", errors="replace").read()
    print("HTML 原始字符数:", len(raw))
    s = raw
    s = re.sub(r"(?is)<script.*?</script>", " ", s)
    s = re.sub(r"(?is)<style.*?</style>", " ", s)
    s = re.sub(r"(?is)<!--.*?-->", " ", s)
    # 标题与段落换行
    s = re.sub(r"(?i)</(h[1-6]|p|li|tr|div|section|article)>", "\n", s)
    s = re.sub(r"(?i)<br\s*/?>", "\n", s)
    s = re.sub(r"(?i)</t[dh]>", " | ", s)
    s = re.sub(r"(?s)<[^>]+>", " ", s)
    s = html.unescape(s)
    s = re.sub(r"[ \t\u00a0]+", " ", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    open(os.path.join(OUT, "html.txt"), "w", encoding="utf-8").write(s)
    print("HTML 提取字符数:", len(s))
except Exception as e:
    print("HTML 失败:", e)

print("\n输出目录:", OUT)
for f in os.listdir(OUT):
    print("  ", f, os.path.getsize(os.path.join(OUT, f)), "bytes")
