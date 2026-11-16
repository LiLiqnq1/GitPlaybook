/*
 * 一个刻意做小的“教学 Git”状态机。
 * 它不是 Git 的替代品，只负责校验课程命令、推进状态快照与记录终端输出。
 */
(function (global, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    global.LabEngine = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function createSession(lesson) {
    if (!lesson || !Array.isArray(lesson.steps) || lesson.steps.length === 0) {
      throw new Error("lesson must contain at least one step");
    }
    return {
      lessonId: lesson.id,
      stepIndex: 0,
      status: "active",
      state: clone(lesson.start),
      resolvedOption: null
    };
  }

  function getCurrentStep(session, lesson) {
    if (session.status === "done" || session.stepIndex >= lesson.steps.length) {
      return null;
    }
    return lesson.steps[session.stepIndex];
  }

  function getProgress(session, lesson) {
    if (!lesson.steps.length) return 0;
    return Math.round((session.stepIndex / lesson.steps.length) * 100);
  }

  function normalize(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function runCommand(session, lesson, command) {
    if (!session || !lesson) {
      return { ok: false, message: "实验尚未初始化。" };
    }
    if (session.status === "conflict") {
      return { ok: false, message: "存在未解决的冲突：先选择保留哪一版内容。" };
    }
    if (session.status === "done") {
      return { ok: false, message: "这个实验已经完成，可以重置后再练一次。" };
    }

    const step = getCurrentStep(session, lesson);
    if (!step) {
      return { ok: false, message: "没有待执行的步骤。" };
    }
    if (normalize(command) !== normalize(step.command)) {
      return {
        ok: false,
        message: step.hint || "命令还不对，再想一想这一步的目标。"
      };
    }

    const next = clone(session);
    next.stepIndex += 1;
    next.state = clone(step.state);
    next.lastStepId = step.id;

    if (next.state.conflict && !next.state.conflict.resolved) {
      next.status = "conflict";
    } else if (next.stepIndex >= lesson.steps.length) {
      next.status = "done";
    }

    return {
      ok: true,
      session: next,
      output: step.output || [],
      step
    };
  }

  function resolveConflict(session, lesson, optionId) {
    if (!session || !lesson || !lesson.conflict) {
      return { ok: false, message: "当前实验没有冲突需要解决。" };
    }
    if (session.status !== "conflict") {
      return { ok: false, message: "先执行 git merge，触发冲突后再做选择。" };
    }

    const option = lesson.conflict.options.find((item) => item.id === optionId);
    if (!option) {
      return { ok: false, message: "请选择一个解决方案。" };
    }
    if (!option.correct) {
      return {
        ok: false,
        message: option.feedback || "这个选择会丢失一方的改动，再读一遍两版内容。"
      };
    }

    const next = clone(session);
    next.status = "active";
    next.resolvedOption = option.id;
    next.state.conflict.resolved = true;
    next.state.working = option.working || "src/data/site.js · 已解决";

    return {
      ok: true,
      session: next,
      output: option.output || ["冲突已解决，工作区已更新。"]
    };
  }

  function resetSession(lesson) {
    return createSession(lesson);
  }

  return {
    createSession,
    getCurrentStep,
    getProgress,
    runCommand,
    resolveConflict,
    resetSession
  };
});
