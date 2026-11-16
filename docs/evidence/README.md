# 分支与冲突证据

本目录保存一次真实合并冲突的原始输出，供课程报告与代码 review 使用。

| 文件 | 内容 |
| --- | --- |
| `merge-conflict.txt` | `git merge feature/parallel-lab` 的冲突输出 |
| `conflict-status.txt` | 冲突发生后 `git status --short` 的结果 |
| `merge-conflict.diff` | 冲突文件在解决前的差异（含冲突标记） |
| `git-graph.txt` | 截至证据提交时的 `git log --graph --all --decorate --oneline` |

## 复现方式

```bash
git switch main
git merge feature/parallel-lab
```

两个分支都在 `assets/js/lessons.js` 的同一位置新增课程对象，因此 Git 无法自动决定保留哪一个。实际解决方式是保留双方，并按 01 → 02 → 03 的顺序排列，然后提交合并。

解决后的验证：

```bash
node --test tests
git log --graph --oneline --all --decorate
```

> 本目录只保存文本证据，不包含学生个人信息、浏览器配置或本地截图。
