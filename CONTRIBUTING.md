# 贡献指南

感谢你愿意帮助 GitPlaybook。这个项目希望成为“第一次参与开源”也可以完成的地方。

## 开始之前

- 先搜索已有的 [Issue](https://github.com/your-github-name/GitPlaybook/issues)，避免重复。
- 大功能或课程结构调整，请先开 Issue 说明目标和方案，再动手。
- 小的拼写、样式和文档修复可以直接提交 PR。

## 本地开发

```bash
git clone https://github.com/<your-github-username>/GitPlaybook.git
cd GitPlaybook
python -m http.server 4173
```

访问 <http://localhost:4173>。项目没有构建步骤，也没有运行时依赖。

运行测试：

```bash
node --test tests
```

## 分支命名

| 前缀 | 用途 | 示例 |
| --- | --- | --- |
| `feature/` | 新功能或新实验 | `feature/keyboard-hints` |
| `fix/` | 缺陷修复 | `fix/mobile-graph-overflow` |
| `docs/` | 文档与课程脚本 | `docs/teaching-notes` |
| `chore/` | 构建、CI、依赖等杂项 | `chore/node-version` |

从最新的 `main` 创建分支：

```bash
git switch main
git pull --ff-only
git switch -c feature/my-change
```

## 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```text
feat: add keyboard shortcuts to lesson commands
fix: keep graph labels inside the viewport
docs: explain the three-step conflict drill
test: cover wrong-resolution branches
```

一条提交只做一件事。提交前检查：

```bash
node --test tests
git diff --check
```

## Pull Request

PR 描述中请写清楚：

1. **改了什么**：用一两句话说明。
2. **为什么改**：关联 Issue，例如 `Closes #12`。
3. **怎么验证**：列出你实际执行过的命令或手动检查步骤。
4. **截图**：涉及界面的改动请附上修改前后截图。

PR 合并前需要：

- [ ] CI 通过
- [ ] 至少一位维护者 review
- [ ] 没有提交生成文件、截图或本地配置
- [ ] 文档随代码同步更新

## 课程脚本贡献

新增实验时，请优先保证：

- 每个步骤只引入一个新概念。
- 错误命令的提示解释“为什么错”，而不只是“错了”。
- 状态快照是纯 JSON，能被 `lab-engine.test.js` 回放。
- 冲突实验必须提供“保留双方”的正确答案，不鼓励无脑二选一。

课程设计原则见 [docs/teaching-design.md](docs/teaching-design.md)。

## 行为准则

参与项目即表示同意遵守 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。维护者可以对违反准则的评论、提交和 Issue 做出删除或封禁处理。

## 许可证

提交贡献即表示你同意以 [MIT License](LICENSE) 授权你的贡献。
