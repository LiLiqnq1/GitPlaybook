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

  const lesson2 = {
    id: "parallel-dev",
    index: "02",
    title: "并行开发与合并提交",
    subtitle: "让两条功能线同时前进，再合成一条历史",
    level: "进阶",
    duration: "约 8 分钟",
    summary:
      "模拟两位开发者在不同分支上并行提交，再把两条历史合并。理解 merge commit 为什么有两个父提交。",
    objectives: ["在两条分支上分别提交", "识别分叉历史", "完成一次非快进合并"],
    start: {
      commits: [commit("c0", "chore: 初始化项目", "main", 0, 0)],
      branches: [
        { name: "main", at: "c0", lane: 0 },
        { name: "feature/ui", at: "c0", lane: 1 },
        { name: "feature/api", at: "c0", lane: 2 }
      ],
      head: "main",
      working: null,
      conflict: null
    },
    steps: [
      {
        id: "switch-ui",
        title: "进入 UI 功能分支",
        detail: "feature/ui 已经由队友创建。先切换过去，完成实验卡片的界面改动。",
        command: "git switch feature/ui",
        choices: ["git switch feature/ui", "git switch -c feature/ui", "git merge feature/ui"],
        hint: "分支已经存在，直接 switch，不要再加 -c。",
        output: ["Switched to branch 'feature/ui'"],
        state: {
          commits: [commit("c0", "chore: 初始化项目", "main", 0, 0)],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/ui", at: "c0", lane: 1 },
            { name: "feature/api", at: "c0", lane: 2 }
          ],
          head: "feature/ui",
          working: null,
          conflict: null
        }
      },
      {
        id: "commit-ui",
        title: "提交 UI 改动",
        detail: "把实验卡片组件提交到 feature/ui。现在这条分支比 main 多走了一步。",
        command: "git commit -m \"feat: add lesson cards\"",
        choices: [
          "git commit -m \"feat: add lesson cards\"",
          "git commit -m \"feat: add API\"",
          "git merge feature/ui"
        ],
        hint: "提交信息要描述这次 UI 改动。",
        output: ["[feature/ui 4d5e6f7] feat: add lesson cards", " 2 files changed, 86 insertions(+)"],
        state: {
          commits: [
            commit("c0", "chore: 初始化项目", "main", 0, 0),
            commit("c1", "feat: add lesson cards", "feature/ui", 1, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/ui", at: "c1", lane: 1 },
            { name: "feature/api", at: "c0", lane: 2 }
          ],
          head: "feature/ui",
          working: null,
          conflict: null
        }
      },
      {
        id: "switch-api",
        title: "切换到 API 分支",
        detail: "队友在 feature/api 上开发进度接口。切过去，接力完成第二个提交。",
        command: "git switch feature/api",
        choices: ["git switch feature/api", "git switch feature/ui", "git merge feature/api"],
        hint: "切换到另一条已经存在的功能分支。",
        output: ["Switched to branch 'feature/api'"],
        state: {
          commits: [
            commit("c0", "chore: 初始化项目", "main", 0, 0),
            commit("c1", "feat: add lesson cards", "feature/ui", 1, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/ui", at: "c1", lane: 1 },
            { name: "feature/api", at: "c0", lane: 2 }
          ],
          head: "feature/api",
          working: null,
          conflict: null
        }
      },
      {
        id: "commit-api",
        title: "提交 API 改动",
        detail: "进度接口完成。此时两条功能分支都从 c0 分叉，各自有了新提交。",
        command: "git commit -m \"feat: persist lab progress\"",
        choices: [
          "git commit -m \"feat: persist lab progress\"",
          "git commit -m \"docs: update readme\"",
          "git switch main"
        ],
        hint: "这次提交的是进度持久化接口。",
        output: ["[feature/api 8a9b0c1] feat: persist lab progress", " 1 file changed, 34 insertions(+)"],
        state: {
          commits: [
            commit("c0", "chore: 初始化项目", "main", 0, 0),
            commit("c1", "feat: add lesson cards", "feature/ui", 1, 1, ["c0"]),
            commit("c2", "feat: persist lab progress", "feature/api", 2, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/ui", at: "c1", lane: 1 },
            { name: "feature/api", at: "c2", lane: 2 }
          ],
          head: "feature/api",
          working: null,
          conflict: null
        }
      },
      {
        id: "back-main",
        title: "回到主线准备合并",
        detail: "两条功能线都完成了。回到 main，把它们依次合并进来。",
        command: "git switch main",
        choices: ["git switch main", "git merge main", "git switch -c main"],
        hint: "main 已存在，直接切换。",
        output: ["Switched to branch 'main'"],
        state: {
          commits: [
            commit("c0", "chore: 初始化项目", "main", 0, 0),
            commit("c1", "feat: add lesson cards", "feature/ui", 1, 1, ["c0"]),
            commit("c2", "feat: persist lab progress", "feature/api", 2, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c0", lane: 0 },
            { name: "feature/ui", at: "c1", lane: 1 },
            { name: "feature/api", at: "c2", lane: 2 }
          ],
          head: "main",
          working: null,
          conflict: null
        }
      },
      {
        id: "merge-ui",
        title: "先合并 UI 分支",
        detail:
          "main 仍停在 c0，feature/ui 只领先一步，因此可以快进。main 现在指向 UI 的最新提交。",
        command: "git merge feature/ui",
        choices: ["git merge feature/ui", "git merge feature/api", "git rebase feature/ui"],
        hint: "先合并 UI 分支，让 main 获得实验卡片。",
        output: ["Updating 9f0e1d2..4d5e6f7", "Fast-forward", " 2 files changed, 86 insertions(+)"],
        state: {
          commits: [
            commit("c0", "chore: 初始化项目", "main", 0, 0),
            commit("c1", "feat: add lesson cards", "main", 0, 1, ["c0"]),
            commit("c2", "feat: persist lab progress", "feature/api", 2, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c1", lane: 0 },
            { name: "feature/ui", at: "c1", lane: 0 },
            { name: "feature/api", at: "c2", lane: 2 }
          ],
          head: "main",
          working: null,
          conflict: null
        }
      },
      {
        id: "merge-api",
        title: "合并 API 分支",
        detail:
          "这次 main 和 feature/api 都有各自的新提交，无法快进。Git 会创建一个有两个父提交的 merge commit。",
        command: "git merge feature/api",
        choices: ["git merge feature/api", "git merge feature/ui", "git reset --hard c0"],
        hint: "把 API 分支合并进当前 main。",
        output: [
          "Merge made by the 'ort' strategy.",
          " src/api/progress.js | 34 +++++++++++++++++",
          " 1 file changed, 34 insertions(+)"
        ],
        state: {
          commits: [
            commit("c0", "chore: 初始化项目", "main", 0, 0),
            commit("c1", "feat: add lesson cards", "main", 0, 1, ["c0"]),
            commit("c2", "feat: persist lab progress", "feature/api", 2, 1, ["c0"]),
            commit("c3", "merge: feature/api into main", "main", 0, 2, ["c1", "c2"])
          ],
          branches: [
            { name: "main", at: "c3", lane: 0 },
            { name: "feature/ui", at: "c1", lane: 0 },
            { name: "feature/api", at: "c2", lane: 2 }
          ],
          head: "main",
          working: null,
          conflict: null
        }
      }
    ]
  };

  const lesson3 = {
    id: "conflict",
    index: "03",
    title: "冲突解决",
    subtitle: "两边改了同一行，如何合并成一个更好的版本",
    level: "实战",
    duration: "约 10 分钟",
    summary:
      "模拟 main 与 feature/header 同时修改首页文案。先读懂冲突，再比较两版内容，最后完成合并提交。",
    objectives: ["读懂合并冲突现场", "比较两版内容并做决策", "完成冲突后的合并提交"],
    start: {
      commits: [
        commit("c0", "chore: 初始化站点", "main", 0, 0),
        commit("c1", "feat: 改写首页主文案", "feature/header", 1, 1, ["c0"]),
        commit("c2", "docs: 更新课程介绍", "main", 0, 1, ["c0"])
      ],
      branches: [
        { name: "main", at: "c2", lane: 0 },
        { name: "feature/header", at: "c1", lane: 1 }
      ],
      head: "main",
      working: null,
      conflict: null
    },
    conflict: {
      file: "src/data/site.js",
      ours: "在浏览器里完成分支、合并与冲突解决。",
      theirs: "用 3 个实验，把 Git 协作练成肌肉记忆。",
      options: [
        {
          id: "both",
          label: "保留双方，合并成一句",
          description: "两版信息都重要：既说明练什么，也说明怎么练。",
          correct: true,
          working: "src/data/site.js · 已合并双方",
          output: ["已保留双方信息：用 3 个实验，在浏览器里把 Git 分支、合并与冲突解决练成肌肉记忆。"]
        },
        {
          id: "ours",
          label: "只保留 HEAD（main）",
          description: "丢弃 feature/header 的文案改动。",
          correct: false,
          feedback: "这样会丢掉队友的文案，冲突并没有真正合并。"
        },
        {
          id: "theirs",
          label: "只保留 feature/header",
          description: "用对方版本覆盖 main 上的课程介绍。",
          correct: false,
          feedback: "这样会丢掉 main 上刚更新的课程信息，再比较一次两版内容。"
        }
      ]
    },
    steps: [
      {
        id: "merge-header",
        title: "触发一次真实冲突",
        detail:
          "feature/header 和 main 都修改了 src/data/site.js 的同一行。执行合并，看看 Git 会怎么提示。",
        command: "git merge feature/header",
        choices: ["git merge feature/header", "git merge main", "git rebase feature/header"],
        hint: "把 feature/header 合并进当前所在的分支 main。",
        output: [
          "Auto-merging src/data/site.js",
          "CONFLICT (content): Merge conflict in src/data/site.js",
          "Automatic merge failed; fix conflicts and then commit the result."
        ],
        state: {
          commits: [
            commit("c0", "chore: 初始化站点", "main", 0, 0),
            commit("c1", "feat: 改写首页主文案", "feature/header", 1, 1, ["c0"]),
            commit("c2", "docs: 更新课程介绍", "main", 0, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c2", lane: 0 },
            { name: "feature/header", at: "c1", lane: 1 }
          ],
          head: "main",
          working: null,
          conflict: {
            file: "src/data/site.js",
            resolved: false
          }
        }
      },
      {
        id: "inspect-conflict",
        title: "查看冲突现场",
        detail: "先别急着改。用 git status 确认哪些文件处于 unmerged 状态。",
        command: "git status",
        choices: ["git status", "git add .", "git commit -m \"merge\""],
        hint: "查看当前工作区与暂存区状态，使用 git status。",
        output: [
          "On branch main",
          "You have unmerged paths.",
          "  (fix conflicts and run \"git commit\")",
          "Unmerged paths:",
          "  both modified:   src/data/site.js"
        ],
        state: {
          commits: [
            commit("c0", "chore: 初始化站点", "main", 0, 0),
            commit("c1", "feat: 改写首页主文案", "feature/header", 1, 1, ["c0"]),
            commit("c2", "docs: 更新课程介绍", "main", 0, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c2", lane: 0 },
            { name: "feature/header", at: "c1", lane: 1 }
          ],
          head: "main",
          working: "src/data/site.js · 冲突已解决",
          conflict: {
            file: "src/data/site.js",
            resolved: true
          }
        }
      },
      {
        id: "edit-resolution",
        title: "合并两版文案",
        detail: "不要简单二选一。把“练什么”和“怎么练”都保留下来，写成一句通顺的话。",
        command: "edit src/data/site.js",
        choices: ["edit src/data/site.js", "git checkout --ours src/data/site.js", "git checkout --theirs src/data/site.js"],
        hint: "解决冲突需要编辑文件；checkout --ours / --theirs 会直接丢弃一方。",
        output: ["src/data/site.js 已更新：用 3 个实验，在浏览器里把 Git 分支、合并与冲突解决练成肌肉记忆。"],
        state: {
          commits: [
            commit("c0", "chore: 初始化站点", "main", 0, 0),
            commit("c1", "feat: 改写首页主文案", "feature/header", 1, 1, ["c0"]),
            commit("c2", "docs: 更新课程介绍", "main", 0, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c2", lane: 0 },
            { name: "feature/header", at: "c1", lane: 1 }
          ],
          head: "main",
          working: "src/data/site.js · 已合并双方",
          conflict: {
            file: "src/data/site.js",
            resolved: true
          }
        }
      },
      {
        id: "stage-resolution",
        title: "把解决结果加入暂存区",
        detail: "Git 需要你明确标记：这个冲突已经处理完了。",
        command: "git add src/data/site.js",
        choices: ["git add src/data/site.js", "git add .", "git commit -m \"merge\""],
        hint: "只暂存刚刚解决冲突的文件。",
        output: ["Changes to be committed:", "  modified:   src/data/site.js"],
        state: {
          commits: [
            commit("c0", "chore: 初始化站点", "main", 0, 0),
            commit("c1", "feat: 改写首页主文案", "feature/header", 1, 1, ["c0"]),
            commit("c2", "docs: 更新课程介绍", "main", 0, 1, ["c0"])
          ],
          branches: [
            { name: "main", at: "c2", lane: 0 },
            { name: "feature/header", at: "c1", lane: 1 }
          ],
          head: "main",
          working: "src/data/site.js · 已暂存",
          conflict: {
            file: "src/data/site.js",
            resolved: true
          }
        }
      },
      {
        id: "commit-merge",
        title: "完成合并提交",
        detail:
          "提交后，Git 会生成一个有两个父提交的 merge commit。冲突解决的结果被永久记录在历史里。",
        command: "git commit -m \"merge: resolve hero copy conflict\"",
        choices: [
          "git commit -m \"merge: resolve hero copy conflict\"",
          "git commit -m \"fix\"",
          "git merge --abort"
        ],
        hint: "提交信息说明这是一次冲突解决后的合并。",
        output: [
          "[main 3c4d5e6] merge: resolve hero copy conflict",
          " 1 file changed, 1 insertion(+), 1 deletion(-)"
        ],
        state: {
          commits: [
            commit("c0", "chore: 初始化站点", "main", 0, 0),
            commit("c1", "feat: 改写首页主文案", "feature/header", 1, 1, ["c0"]),
            commit("c2", "docs: 更新课程介绍", "main", 0, 1, ["c0"]),
            commit("c3", "merge: resolve hero copy conflict", "main", 0, 2, ["c2", "c1"])
          ],
          branches: [
            { name: "main", at: "c3", lane: 0 },
            { name: "feature/header", at: "c1", lane: 1 }
          ],
          head: "main",
          working: null,
          conflict: null
        }
      }
    ]
  };

  return { lessons: [lesson1, lesson2, lesson3] };
});
