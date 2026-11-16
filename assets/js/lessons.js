/*
 * GitPlaybook 课程脚本。
 * 每个 step 都是一次“命令校验 + 状态快照”，让学习者在安全的沙盒里
 * 体验分支、合并与冲突解决。状态数据保持为纯 JSON，便于测试与回放。
 */
(function (global, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    global.GitPlaybookLessons = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const commit = (id, message, branch, lane, seq, parents) => ({
    id,
    message,
    branch,
    lane,
    seq,
    parents: parents || []
  });

  const lesson1 = {
    id: "branch-basics",
    index: "01",
    title: "分支与快进合并",
    subtitle: "从一条主线，长出你的第一条功能分支",
    level: "入门",
    duration: "约 6 分钟",
    summary:
      "练习 git switch -c、提交、切回主线与 git merge。理解分支只是一个指向提交的可移动指针。",
    objectives: ["创建并切换功能分支", "在分支上提交改动", "完成一次 Fast-forward 合并"],
    start: {
      commits: [commit("c0", "chore: 初始化项目", "main", 0, 0)],
      branches: [{ name: "main", at: "c0", lane: 0 }],
      head: "main",
      working: null,
      conflict: null
    },
    steps: [
      {
        id: "create-branch",
        title: "创建并切换到功能分支",
        detail:
          "从 main 创建一个叫 feature/readme 的分支，并立即切换过去。-c 表示 create。",
        command: "git switch -c feature/readme",
        choices: ["git switch -c feature/readme", "git branch feature/readme", "git merge feature/readme"],
        hint: "要“创建 + 切换”一步完成，使用 git switch -c。",
        output: ["Switched to a new branch 'feature/readme'"],
        state: {
          commits: [commit("c0", "chore: 初始化项目", "main", 0, 0)],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/readme", at: "c0", lane: 1 }
          ],
          head: "feature/readme",
          working: null,
          conflict: null
        }
      },
      {
        id: "edit-readme",
        title: "修改 README",
        detail: "现在你在功能分支上。给 README 增加一个“快速开始”章节，先不提交。",
        command: "edit README.md",
        choices: ["edit README.md", "git add README.md", "git commit -m \"docs: add quick start\""],
        hint: "先编辑文件，再暂存，最后提交。",
        output: ["README.md 已修改：新增“快速开始”章节（工作区）"],
        state: {
          commits: [commit("c0", "chore: 初始化项目", "main", 0, 0)],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/readme", at: "c0", lane: 1 }
          ],
          head: "feature/readme",
          working: "README.md · 已修改",
          conflict: null
        }
      },
      {
        id: "stage-readme",
        title: "把改动放入暂存区",
        detail: "提交之前，先用 git add 把 README.md 的改动放进暂存区。",
        command: "git add README.md",
        choices: ["git add README.md", "git commit -m \"docs: add quick start\"", "git status"],
        hint: "暂存区的英文是 staging area，对应命令是 git add。",
        output: ["Changes to be committed:", "  modified: README.md"],
        state: {
          commits: [commit("c0", "chore: 初始化项目", "main", 0, 0)],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/readme", at: "c0", lane: 1 }
          ],
          head: "feature/readme",
          working: "README.md · 已暂存",
          conflict: null
        }
      },
      {
        id: "commit-readme",
        title: "在功能分支上提交",
        detail: "写一条清晰的提交信息，把这次改动记录成一个新的提交。",
        command: "git commit -m \"docs: add quick start\"",
        choices: [
          "git commit -m \"docs: add quick start\"",
          "git commit -m \"update\"",
          "git add . && git commit"
        ],
        hint: "使用 Conventional Commits 风格：docs: add quick start。",
        output: ["[feature/readme 1a2b3c4] docs: add quick start", " 1 file changed, 12 insertions(+)"],
        state: {
          commits: [
            commit("c0", "chore: 初始化项目", "main", 0, 0),
            commit("c1", "docs: add quick start", "feature/readme", 1, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/readme", at: "c1", lane: 1 }
          ],
          head: "feature/readme",
          working: null,
          conflict: null
        }
      },
      {
        id: "back-to-main",
        title: "切回主线",
        detail: "功能分支的工作告一段落。切回 main，准备把改动合并进来。",
        command: "git switch main",
        choices: ["git switch main", "git merge main", "git switch -c main"],
        hint: "切换已有分支不需要 -c。",
        output: ["Switched to branch 'main'", "Your branch is up to date with 'origin/main'."],
        state: {
          commits: [
            commit("c0", "chore: 初始化项目", "main", 0, 0),
            commit("c1", "docs: add quick start", "feature/readme", 1, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/readme", at: "c1", lane: 1 }
          ],
          head: "main",
          working: null,
          conflict: null
        }
      },
      {
        id: "merge-readme",
        title: "合并功能分支",
        detail:
          "main 没有产生新提交，因此这次合并可以快进。观察：main 直接指到了 feature/readme 的最新提交。",
        command: "git merge feature/readme",
        choices: ["git merge feature/readme", "git merge main", "git rebase feature/readme"],
        hint: "把 feature/readme 合并进当前分支 main。",
        output: [
          "Updating 9f0e1d2..1a2b3c4",
          "Fast-forward",
          " README.md | 12 ++++++++++++",
          " 1 file changed, 12 insertions(+)"
        ],
        state: {
          commits: [
            commit("c0", "chore: 初始化项目", "main", 0, 0),
            commit("c1", "docs: add quick start", "main", 0, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c1", lane: 0 },
            { name: "feature/readme", at: "c1", lane: 0 }
          ],
          head: "main",
          working: null,
          conflict: null
        }
      }
    ]
  };

  return { lessons: [lesson1] };
});
