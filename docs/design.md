# 设计说明

## 1. 目标与非目标

### 目标

1. 让学习者在 30 分钟内建立“分支是指向提交的指针”的直觉。
2. 让第一次冲突解决发生在安全、可重置的沙盒里。
3. 保持零依赖、零构建，能在机房电脑和 GitHub Pages 上直接运行。
4. 让课程脚本可被教师阅读、修改和测试。

### 非目标

- 不复刻 Git 的完整对象模型、索引和工作区。
- 不替代真实仓库中的协作练习。
- 不提供账号系统、排行榜或后端存储。
- 不追求覆盖所有 Git 命令。

## 2. 总体架构

```text
index.html
   │
   ├─ src/data/site.js        首页文案
   ├─ assets/js/lessons.js    课程脚本（纯数据）
   ├─ assets/js/lab-engine.js 状态机（纯函数）
   └─ assets/js/app.js        DOM 渲染与交互
```

页面加载顺序很重要：`site.js` 和 `lessons.js` 先提供数据，`lab-engine.js` 不依赖 DOM，最后 `app.js` 读取全局对象并绑定事件。

## 3. 状态模型

一个实验由 `start` 与一组 `steps` 组成。每个步骤包含：

```js
{
  id: "merge-header",
  title: "触发一次真实冲突",
  detail: "……",
  command: "git merge feature/header",
  choices: ["git merge feature/header", "…"],
  hint: "……",
  output: ["CONFLICT (content): …"],
  state: { commits, branches, head, working, conflict }
}
```

`state` 是纯 JSON 快照，渲染层不需要理解 Git 操作，只负责把快照画出来。这样课程作者可以精确控制每一帧，测试也可以直接断言状态。

### 会话

```js
{
  lessonId: "conflict",
  stepIndex: 2,
  status: "active" | "conflict" | "done",
  state: { ... },
  resolvedOption: "both"
}
```

`lab-engine.js` 暴露五个函数：

- `createSession(lesson)`
- `getCurrentStep(session, lesson)`
- `getProgress(session, lesson)`
- `runCommand(session, lesson, command)`
- `resolveConflict(session, lesson, optionId)`

所有函数都返回新对象，不修改传入的会话。这使状态变化可追踪，也方便未来加入“回放”功能。

## 4. 提交图渲染

提交图用 SVG 手绘，不引入图形库。布局由两个字段决定：

- `seq`：横向序号，决定 x 坐标。
- `lane`：分支泳道，决定 y 坐标。

合并边使用三次贝塞尔曲线连接两个父提交；同泳道的父子提交使用直线。分支标签跟随分支最新提交，`HEAD` 标签跟随当前分支。

这个布局不追求处理上百个提交，只服务于课程中的 3–5 个节点。超过 20 个提交时应切换到自动布局算法，这是 v0.3 的工作。

## 5. 交互与可访问性

- 所有命令都是 `<button>`，支持键盘 Tab 与 Enter。
- 按 `1`–`3` 可快速执行对应命令。
- 终端区域使用 `aria-live="polite"`，屏幕阅读器会朗读新输出。
- 颜色不是唯一信息载体：冲突节点同时有红色描边和文字提示。
- `prefers-reduced-motion` 下关闭脉冲与过渡动画。
- 提供“跳到实验区”的 skip link。

## 6. 关键取舍

### 状态快照 vs 完整 Git 实现

完整实现需要对象数据库、引用、索引、工作区、合并策略和大量边界情况。课程只需要“命令 → 下一帧”，状态快照让实现量降低一个数量级，同时保留教学所需的因果感。

代价是：学习者不能输入任意 Git 命令。每个实验的 `choices` 是精心设计的干扰项，错误提示承担了“解释为什么”的职责。

### 原生 DOM vs 框架

页面状态只有“当前实验、当前步骤、终端输出、冲突选择”四个维度，原生 DOM 足够。零依赖带来的部署简单性，对课堂场景比组件复用更重要。

### localStorage vs 后端

进度只需要保存在本机。没有账号、没有隐私数据、没有后端成本。代价是换设备后进度不同步，这不在当前目标内。

## 7. 测试策略

`tests/lab-engine.test.js` 覆盖：

- 三个实验都能从第一步走到完成。
- 错误命令不会推进步骤。
- 进度随步骤增加。
- 未触发合并时不能解决冲突。
- 错误解决方案被拒绝，正确方案解除阻塞。

测试直接 `require` 课程脚本和状态机，不启动浏览器。UI 的视觉检查依靠人工截图与代码 review。

## 8. 未来扩展

- 用 URL 编码当前状态，支持分享“我卡在这一步”。
- 教师模式：上传 JSON 课程脚本，自动生成实验。
- 接入真实仓库的只读提交图，作为沙盒与真实世界的桥梁。
