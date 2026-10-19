/* wei_web 站点配置
 * 部署到 GitHub Pages 后，按 README「评论区」一节填写即可启用讨论功能。
 * 未填写时课程页面会显示一段提示，不影响其他功能。
 */
window.WEIWEB_CONFIG = {
  comments: {
    enabled: false,          // 填好下面的 ID 后改成 true
    provider: "giscus",
    repo: "",                // 例如 "yourname/wei_web"
    repoId: "",              // 在 giscus.app 生成
    category: "Comments",    // Discussions 分类名（建议用 Announcements 类型）
    categoryId: "",          // 在 giscus.app 生成
    lang: "zh-CN"
  }
};
