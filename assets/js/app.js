/* global GitPlaybookLessons, LabEngine, SITE_COPY */
(function () {
  "use strict";

  const { lessons } = window.GitPlaybookLessons;
  const ENGINE = window.LabEngine;
  const STORAGE_KEY = "gitplaybook.completed.v1";
  const REPO_URL = "https://github.com/your-github-name/GitPlaybook";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const els = {
    lessonList: $("#lesson-list"),
    lessonTitle: $("#lesson-title"),
    lessonSubtitle: $("#lesson-subtitle"),
    lessonMeta: $("#lesson-meta"),
    lessonObjectives: $("#lesson-objectives"),
    progressBar: $("#progress-bar"),
    progressLabel: $("#progress-label"),
    graph: $("#graph-canvas"),
    graphCaption: $("#graph-caption"),
    stepKicker: $("#step-kicker"),
    stepTitle: $("#step-title"),
    stepDetail: $("#step-detail"),
    commandList: $("#command-list"),
    conflictPanel: $("#conflict-panel"),
    terminal: $("#terminal-output"),
    resetButton: $("#reset-lab"),
    statusPill: $("#lab-status"),
    toast: $("#toast"),
    repoLinks: $$("[data-repo-link]")
  };

  const palette = ["#0f766e", "#2563eb", "#7c3aed", "#d97706", "#db2777"];
  let activeIndex = 0;
  let session = null;
  let terminalLines = [];
  let toastTimer = null;

  function completedLessons() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      return [];
    }
  }

  function markCompleted(id) {
    const current = new Set(completedLessons());
    current.add(id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
    } catch (error) {
      /* 隐私模式下 localStorage 可能被禁用，不影响实验。 */
    }
  }

  function activeLesson() {
    return lessons[activeIndex];
  }

  function branchColor(name, branchIndex) {
    if (name === "main") return palette[0];
    return palette[(branchIndex % (palette.length - 1)) + 1];
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function truncate(value, length) {
    const text = String(value);
    return text.length > length ? `${text.slice(0, length - 1)}…` : text;
  }

  function setRepoLinks() {
    const isPlaceholder = REPO_URL.includes("your-github-name");
    els.repoLinks.forEach((link) => {
      link.href = isPlaceholder ? "#lab" : REPO_URL;
      link.title = isPlaceholder ? "仓库地址将在发布后替换" : "打开 GitHub 仓库";
      if (isPlaceholder) link.setAttribute("data-placeholder", "true");
    });
  }

  function applySiteCopy() {
    if (!window.SITE_COPY) return;
    const copy = window.SITE_COPY;
    const setText = (id, value) => {
      const node = document.getElementById(id);
      if (node) node.textContent = value;
    };
    setText("hero-eyebrow", copy.eyebrow);
    setText("hero-title", copy.title);
    setText("hero-subtitle", copy.subtitle);
    setText("hero-primary", copy.primaryCta);
    setText("hero-secondary", copy.secondaryCta);
    copy.stats.forEach((stat, index) => {
      setText(`stat-value-${index}`, stat.value);
      setText(`stat-label-${index}`, stat.label);
    });
  }

  function showToast(message, tone) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.dataset.tone = tone || "info";
    els.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2600);
  }

  function initialTerminalLine() {
    return [
      {
        kind: "system",
        text: "GitPlaybook 沙盒已就绪。点击下方命令，或按数字键 1–3 执行。"
      }
    ];
  }

  function selectLesson(index, options) {
    activeIndex = index;
    session = ENGINE.createSession(activeLesson());
    terminalLines = initialTerminalLine();
    render();
    if (!options || !options.silent) {
      showToast(`已切换到「${activeLesson().title}」`, "info");
    }
  }

  function renderLessonList() {
    const completed = new Set(completedLessons());
    els.lessonList.innerHTML = lessons
      .map((lesson, index) => {
        const isActive = index === activeIndex;
        const isDone = completed.has(lesson.id);
        return `
          <button class="lesson-tab${isActive ? " is-active" : ""}" data-lesson-index="${index}" type="button">
            <span class="lesson-number">${lesson.index}</span>
            <span class="lesson-tab-copy">
              <strong>${escapeHtml(lesson.title)}</strong>
              <small>${escapeHtml(lesson.level)} · ${escapeHtml(lesson.duration)}</small>
            </span>
            <span class="lesson-state${isDone ? " is-done" : ""}" aria-label="${isDone ? "已完成" : "未完成"}">
              ${isDone ? "✓" : ""}
            </span>
          </button>`;
      })
      .join("");
  }

  function renderLessonIntro() {
    const lesson = activeLesson();
    els.lessonTitle.textContent = lesson.title;
    els.lessonSubtitle.textContent = lesson.subtitle;
    els.lessonMeta.textContent = `${lesson.level} · ${lesson.duration} · ${lesson.steps.length} 个步骤`;
    els.lessonObjectives.innerHTML = lesson.objectives
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  function renderProgress() {
    const lesson = activeLesson();
    const progress = session.status === "done" ? 100 : ENGINE.getProgress(session, lesson);
    els.progressBar.style.width = `${progress}%`;
    els.progressLabel.textContent = `${progress}%`;
    els.statusPill.textContent =
      session.status === "done" ? "实验完成" : session.status === "conflict" ? "等待解决冲突" : "实验中";
    els.statusPill.dataset.state = session.status;
  }

  function nodePosition(commit) {
    return {
      x: 92 + commit.seq * 128,
      y: 84 + commit.lane * 88
    };
  }

  function renderGraph() {
    const state = session.state;
    const allLanes = [
      ...state.commits.map((item) => item.lane),
      ...state.branches.map((item) => item.lane)
    ];
    const laneCount = Math.max(...allLanes, 0) + 1;
    const maxSeq = Math.max(...state.commits.map((item) => item.seq), 1);
    const width = Math.max(650, 188 + maxSeq * 128);
    const height = 94 + laneCount * 88 + 34;
    const commitsById = new Map(state.commits.map((item) => [item.id, item]));

    const edges = state.commits
      .flatMap((child) =>
        child.parents.map((parentId) => {
          const parent = commitsById.get(parentId);
          if (!parent) return "";
          const from = nodePosition(parent);
          const to = nodePosition(child);
          const sameLane = parent.lane === child.lane;
          const path = sameLane
            ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
            : `M ${from.x} ${from.y} C ${from.x + 46} ${from.y}, ${to.x - 46} ${to.y}, ${to.x} ${to.y}`;
          return `<path class="graph-edge" d="${path}" />`;
        })
      )
      .join("");

    const branchLabels = state.branches
      .map((branch, index) => {
        const target = commitsById.get(branch.at);
        if (!target) return "";
        const point = nodePosition(target);
        const stacked = state.branches.filter((item) => item.at === branch.at).indexOf(branch);
        const color = branchColor(branch.name, index);
        const isHead = state.head === branch.name;
        return `
          <g class="branch-label" transform="translate(${point.x + 22}, ${point.y - 22 - stacked * 25})">
            <rect width="${Math.max(74, branch.name.length * 8.2 + 24)}" height="21" rx="10.5" fill="${color}" opacity="0.12" />
            <text x="12" y="14.5" fill="${color}" font-size="11" font-weight="700">${escapeHtml(branch.name)}</text>
            ${isHead ? `<text x="${Math.max(74, branch.name.length * 8.2 + 24) + 7}" y="14.5" fill="#f05133" font-size="10" font-weight="800">HEAD</text>` : ""}
          </g>`;
      })
      .join("");

    const nodes = state.commits
      .map((commit) => {
        const point = nodePosition(commit);
        const isHeadCommit = state.branches.some(
          (branch) => branch.name === state.head && branch.at === commit.id
        );
        const isConflict = Boolean(state.conflict) && !state.conflict.resolved && isHeadCommit;
        return `
          <g class="commit-node${isConflict ? " is-conflict" : ""}" transform="translate(${point.x}, ${point.y})">
            <circle r="16" class="commit-halo" />
            <circle r="10.5" class="commit-dot" />
            <text x="0" y="32" text-anchor="middle" class="commit-id">${escapeHtml(commit.id)}</text>
            <text x="0" y="47" text-anchor="middle" class="commit-message">${escapeHtml(truncate(commit.message, 18))}</text>
          </g>`;
      })
      .join("");

    const working = state.working
      ? `<g class="working-note" transform="translate(${width - 178}, ${height - 26})">
           <rect width="162" height="22" rx="11" fill="#fff7ed" stroke="#fdba74" />
           <circle cx="14" cy="11" r="3" fill="#f97316" />
           <text x="24" y="15" fill="#9a3412" font-size="10.5" font-weight="600">${escapeHtml(truncate(state.working, 17))}</text>
         </g>`
      : "";

    els.graph.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="当前实验的提交图">
        <defs>
          <pattern id="dot-grid" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#dbe3ea" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" opacity="0.7" />
        ${edges}
        ${nodes}
        ${branchLabels}
        ${working}
      </svg>`;
    els.graphCaption.textContent =
      state.conflict && !state.conflict.resolved
        ? "红色节点表示合并冲突；解决后即可继续提交。"
        : "分支标签跟随提交移动；HEAD 指向你当前所在的分支。";
  }

  function renderStep() {
    const lesson = activeLesson();
    const step = ENGINE.getCurrentStep(session, lesson);

    if (!step) {
      const repoHref = REPO_URL.includes("your-github-name") ? "#lab" : REPO_URL;
      els.stepKicker.textContent = "COMPLETE";
      els.stepTitle.textContent = "实验完成，去真实仓库练一次";
      els.stepDetail.textContent =
        "你已经在沙盒里走完了一遍。下一步：把项目 fork 到自己的账号，创建分支，发一个真实的 Pull Request。";
      els.commandList.innerHTML = `
        <a class="command-chip command-chip--link" href="${repoHref}">
          <span class="prompt">↗</span><code>打开 GitHub 仓库</code>
        </a>
        <button class="command-chip command-chip--quiet" type="button" data-reset>
          <span class="prompt">↺</span><code>再练一次</code>
        </button>`;
      return;
    }

    els.stepKicker.textContent = `STEP ${String(session.stepIndex + 1).padStart(2, "0")} / ${String(lesson.steps.length).padStart(2, "0")}`;
    els.stepTitle.textContent = step.title;
    els.stepDetail.textContent = step.detail;
    els.commandList.innerHTML = step.choices
      .map(
        (command, index) => `
          <button class="command-chip" type="button" data-command="${escapeHtml(command)}">
            <span class="command-key">${index + 1}</span>
            <span class="prompt">$</span>
            <code>${escapeHtml(command)}</code>
          </button>`
      )
      .join("");
  }

  function renderConflict() {
    const lesson = activeLesson();
    if (session.status !== "conflict" || !lesson.conflict) {
      els.conflictPanel.hidden = true;
      els.conflictPanel.innerHTML = "";
      return;
    }
    const conflict = lesson.conflict;
    els.conflictPanel.hidden = false;
    els.conflictPanel.innerHTML = `
      <div class="conflict-heading">
        <span class="conflict-dot"></span>
        <div>
          <strong>合并冲突</strong>
          <span>${escapeHtml(conflict.file)} 的同一行被两边修改</span>
        </div>
      </div>
      <div class="conflict-versions">
        <div class="conflict-version">
          <span class="version-tag">HEAD · main</span>
          <code>${escapeHtml(conflict.ours)}</code>
        </div>
        <div class="conflict-version">
          <span class="version-tag version-tag--theirs">feature/header</span>
          <code>${escapeHtml(conflict.theirs)}</code>
        </div>
      </div>
      <div class="resolution-list">
        ${conflict.options
          .map(
            (option) => `
            <button type="button" class="resolution-option" data-resolution="${option.id}">
              <strong>${escapeHtml(option.label)}</strong>
              <span>${escapeHtml(option.description)}</span>
            </button>`
          )
          .join("")}
      </div>`;
  }

  function renderTerminal() {
    els.terminal.innerHTML = terminalLines
      .map((line) => {
        if (line.kind === "command") {
          return `<div class="term-line term-command"><span class="term-prompt">❯</span><span>${escapeHtml(line.text)}</span></div>`;
        }
        return `<div class="term-line term-${line.kind}">${escapeHtml(line.text)}</div>`;
      })
      .join("");
    els.terminal.scrollTop = els.terminal.scrollHeight;
  }

  function render() {
    renderLessonList();
    renderLessonIntro();
    renderProgress();
    renderGraph();
    renderStep();
    renderConflict();
    renderTerminal();
  }

  function execute(command) {
    const lesson = activeLesson();
    const result = ENGINE.runCommand(session, lesson, command);
    if (!result.ok) {
      terminalLines.push({ kind: "command", text: command });
      terminalLines.push({ kind: "error", text: result.message });
      renderTerminal();
      showToast(result.message, "error");
      return;
    }

    terminalLines.push({ kind: "command", text: command });
    (result.output || []).forEach((line) => terminalLines.push({ kind: "output", text: line }));
    session = result.session;

    if (session.status === "done") {
      markCompleted(lesson.id);
      terminalLines.push({ kind: "success", text: "✓ 实验完成。进度已保存到本地。" });
      showToast("实验完成，进度已保存", "success");
    }
    render();
  }

  function resolve(optionId) {
    const lesson = activeLesson();
    const result = ENGINE.resolveConflict(session, lesson, optionId);
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    session = result.session;
    (result.output || []).forEach((line) => terminalLines.push({ kind: "success", text: line }));
    render();
    showToast("冲突已解决，继续完成合并提交", "success");
  }

  function reset() {
    session = ENGINE.resetSession(activeLesson());
    terminalLines = initialTerminalLine();
    render();
    showToast("实验已重置", "info");
  }

  function autoPlayToConflict() {
    const lesson = activeLesson();
    let guard = 0;
    while (session.status === "active" && guard < 20) {
      const step = ENGINE.getCurrentStep(session, lesson);
      if (!step) break;
      const result = ENGINE.runCommand(session, lesson, step.command);
      if (!result.ok) break;
      terminalLines.push({ kind: "command", text: step.command });
      (result.output || []).forEach((line) => terminalLines.push({ kind: "output", text: line }));
      session = result.session;
      guard += 1;
    }
    render();
  }

  function bindEvents() {
    els.lessonList.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-lesson-index]");
      if (!tab) return;
      selectLesson(Number(tab.dataset.lessonIndex));
    });

    els.commandList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-command]");
      if (button) {
        execute(button.dataset.command);
        return;
      }
      if (event.target.closest("[data-reset]")) reset();
    });

    els.conflictPanel.addEventListener("click", (event) => {
      const option = event.target.closest("[data-resolution]");
      if (option) resolve(option.dataset.resolution);
    });

    els.resetButton.addEventListener("click", reset);

    document.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target.matches("input, textarea, select")) return;
      const index = Number(event.key) - 1;
      if (Number.isNaN(index) || index < 0) return;
      const chips = els.commandList.querySelectorAll("[data-command]");
      if (chips[index]) {
        event.preventDefault();
        chips[index].click();
      }
    });
  }

  function boot() {
    setRepoLinks();
    applySiteCopy();

    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "lab") {
      document.body.classList.add("lab-focus");
    }

    const requestedLesson = params.get("lesson");
    const requestedIndex = lessons.findIndex((lesson) => lesson.id === requestedLesson);
    activeIndex = requestedIndex >= 0 ? requestedIndex : 0;
    session = ENGINE.createSession(activeLesson());
    terminalLines = initialTerminalLine();
    bindEvents();
    render();

    if (params.get("demo") === "1" && session.status === "active") {
      autoPlayToConflict();
    }

    window.GitPlaybook = {
      lessons,
      get session() {
        return session;
      },
      selectLesson,
      reset
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
