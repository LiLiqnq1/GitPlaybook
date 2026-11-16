# 发布清单

这份清单把项目从本地仓库发布到 GitHub，并收集课程报告所需的截图。

## 1. 创建远程仓库

在 GitHub 新建公开仓库：

- 名称：`GitPlaybook`
- 描述：`A zero-dependency, browser-based lab for learning Git branching, merging and conflict resolution.`
- 不要勾选 “Add a README / .gitignore / license”，本地已经有。
- 许可证选择 MIT。

## 2. 关联远程并推送

把 `LiLiqnq1` 替换为你的用户名：

```bash
git remote add origin https://github.com/LiLiqnq1/GitPlaybook.git
git push -u origin main
git push origin --all
git push origin --tags
```

推送后确认：

- `main` 可见，README 正常渲染。
- 分支列表里能看到 `feature/parallel-lab`、`feature/test-suite`、`feature/community-docs`。
- Actions 中 `tests` 工作流为绿色。
- About 区域填写描述、Topics：`git`、`open-source`、`education`、`interactive`。
- 开启 Issues、Discussions（可选）、Wiki（可选）。

## 3. 开启 GitHub Pages

Settings → Pages → Build and deployment：

- Source：`Deploy from a branch`
- Branch：`main` / `root`

等待 1–2 分钟，访问：

```text
https://LiLiqnq1.github.io/GitPlaybook/
```

如果页面 404，检查仓库是否公开、Pages 是否启用、文件名是否为 `index.html`。

## 4. 替换占位符

全局搜索并替换：

| 占位符 | 替换为 |
| --- | --- |
| `LiLiqnq1` | 你的 GitHub 用户名 |
| `https://github.com/LiLiqnq1/GitPlaybook` | 真实仓库地址 |
| 报告封面中的“指导教师” | 任课教师姓名 |

涉及文件：

- `README.md`
- `package.json`
- `CONTRIBUTING.md`
- `.github/ISSUE_TEMPLATE/config.yml`
- `index.html` 与 `assets/js/app.js` 中的 `REPO_URL`

## 5. 邀请同学互动

按 [community.md](community.md) 的步骤：

1. 请 2–3 位同学完成实验 03。
2. 请他们提一个具体 Issue（使用模板）。
3. 逐条公开回复，至少形成两轮对话。
4. 请他们 star / watch，并说明区别。
5. 至少合并一个外部 PR（可以是文档错别字修复）。

## 6. 截图清单

课程报告建议包含：

- [ ] 仓库首页（README、About、star/watch）。
- [ ] 分支列表（`main` 与三个 feature 分支）。
- [ ] Network graph 或 `git log --graph`。
- [ ] 一条 Issue 对话。
- [ ] 一个已合并 PR 的 review 评论。
- [ ] GitHub Actions 测试通过。
- [ ] GitHub Pages 运行中的实验界面。

## 7. 报告定稿

- 把真实仓库链接填入报告“项目链接”位置。
- 用真实截图替换报告中的占位框。
- 核对封面：班级、姓名、学号。
- 导出 PDF，命名：`班级-姓名-学号-期末大报告.pdf`。
- 检查页数在 5–10 页，正文小四、1.5 倍行距。

## 8. 发布后检查

```bash
git status
git log --graph --oneline --all --decorate
node --test tests
```

确认没有未提交的本地截图、PDF 或浏览器配置。
