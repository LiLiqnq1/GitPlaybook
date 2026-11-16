# 分支管理与协作流程

## 1. 分支模型

GitPlaybook 使用短生命周期的功能分支模型。`main` 始终可运行、测试通过；所有改动通过分支和 Pull Request 进入主线。

```text
main
 ├─ feature/parallel-lab     新实验开发
 ├─ feature/community-docs   文档、模板与社区规范
 ├─ feature/test-suite       测试与 CI
 ├─ fix/<issue-id>           缺陷修复
 └─ docs/<topic>             纯文档修改
```

### 命名规则

- `feature/`：面向用户的新能力。
- `fix/`：修复缺陷，建议带 Issue 编号，例如 `fix/42-graph-overflow`。
- `docs/`：文档、课程脚本说明、README。
- `chore/`：CI、依赖、仓库配置。
- 使用小写短横线，不使用空格、下划线或中文。

## 2. 提交规范

采用 Conventional Commits：

```text
feat: add merge conflict lab
fix: keep graph labels inside the viewport
docs: document the three-step conflict drill
test: cover wrong-resolution branches
chore: normalize line endings
merge: bring parallel lab into main
```

一条提交只做一件事。合并提交使用 `merge:` 前缀，并在正文说明冲突如何解决。

## 3. 合并策略

| 场景 | 策略 | 原因 |
| --- | --- | --- |
| 单人小改动 | Squash merge | 保持 main 线性、易读 |
| 需要保留并行历史的课程开发 | Merge commit | 让学习者看到真实的分叉与汇合 |
| 紧急修复 | Squash merge + 补丁版本 | 便于回滚与追踪 |

不在 `main` 上直接提交。合并前必须：

1. `node --test tests` 通过。
2. `git diff --check` 无空白错误。
3. 至少一位维护者 review。
4. PR 描述包含验证步骤。

## 4. 一次真实的分支与冲突演练

本仓库在开发第二个实验时，实际经历了一次内容冲突。过程如下。

### 4.1 从 main 创建功能分支

```bash
git switch main
git switch -c feature/parallel-lab
# 在 assets/js/lessons.js 中新增 lesson2
git add assets/js/lessons.js
git commit -m "feat: add parallel development lab"
```

### 4.2 主线同时推进

在 `feature/parallel-lab` 开发期间，`main` 也新增了第三个实验（冲突解决），两个分支都修改了 `lessons.js` 的同一区域。

```bash
git switch main
# 新增 lesson3
git commit -am "feat: add merge conflict lab"
```

### 4.3 合并触发冲突

```bash
git merge feature/parallel-lab
```

输出：

```text
Auto-merging assets/js/lessons.js
CONFLICT (content): Merge conflict in assets/js/lessons.js
Automatic merge failed; fix conflicts and then commit the result.
```

`git status` 显示：

```text
UU assets/js/lessons.js
```

### 4.4 解决冲突

冲突的根源不是“谁写错了”，而是两个分支都在同一锚点插入了新的课程对象。解决目标是**两边都保留**，并让课程顺序符合 01 → 02 → 03。

```bash
# 以 main 的版本为底，手动把 feature 分支的 lesson2 插入 lesson3 之前
git checkout --ours assets/js/lessons.js
# 编辑：插入 lesson2，并调整导出顺序
git add assets/js/lessons.js
git commit -m "merge: bring parallel lab into main" \
  -m "Resolve the lessons.js overlap by keeping both course scripts and ordering them 01, 02, 03."
```

解决后验证：

```bash
node --test tests
git log --graph --oneline --all --decorate
```

### 4.5 可复现的证据

- [`docs/evidence/merge-conflict.txt`](evidence/merge-conflict.txt)：合并失败输出。
- [`docs/evidence/conflict-status.txt`](evidence/conflict-status.txt)：冲突文件状态。
- [`docs/evidence/merge-conflict.diff`](evidence/merge-conflict.diff)：冲突差异。

## 5. 冲突解决检查清单

遇到冲突时，按顺序问四个问题：

1. **冲突发生在哪个文件、哪一行？** 先用 `git status` 和 `git diff` 定位。
2. **两边各自想解决什么问题？** 读提交信息和对方代码，不要只看当前行。
3. **能不能都保留？** 大多数内容冲突可以通过重排、合并语义来解决。
4. **解决后如何验证？** 运行测试、打开页面、检查生成物。

禁止的操作：

- 不看内容直接 `git checkout --ours` / `--theirs`。
- 删除冲突标记后不测试就提交。
- 用 `git merge --abort` 逃避所有冲突而不记录原因。

## 6. 分支清理

合并后删除远程与本地分支：

```bash
git push origin --delete feature/parallel-lab
git branch -d feature/parallel-lab
```

保留带注释的 tag 用于课程版本：

```bash
git tag -a v0.1.0 -m "GitPlaybook v0.1.0: three labs"
git push origin v0.1.0
```
