const test = require("node:test");
const assert = require("node:assert/strict");

const { lessons } = require("../assets/js/lessons.js");
const {
  createSession,
  getCurrentStep,
  getProgress,
  runCommand,
  resolveConflict
} = require("../assets/js/lab-engine.js");

function playLesson(lesson) {
  let session = createSession(lesson);
  for (const step of lesson.steps) {
    assert.equal(session.status === "conflict", false, "lesson should not block before conflict step");
    const result = runCommand(session, lesson, step.command);
    assert.equal(result.ok, true, `expected command to pass: ${step.command}`);
    session = result.session;
    if (session.status === "conflict") {
      const conflict = lesson.conflict;
      const correct = conflict.options.find((option) => option.correct);
      const resolved = resolveConflict(session, lesson, correct.id);
      assert.equal(resolved.ok, true);
      session = resolved.session;
    }
  }
  return session;
}

test("each lesson can be completed end-to-end", () => {
  for (const lesson of lessons) {
    const session = playLesson(lesson);
    assert.equal(session.status, "done");
    assert.equal(getCurrentStep(session, lesson), null);
    assert.equal(getProgress(session, lesson), 100);
  }
});

test("lesson one has a deterministic start state", () => {
  const lesson = lessons[0];
  const session = createSession(lesson);
  assert.equal(session.stepIndex, 0);
  assert.equal(session.state.head, "main");
  assert.equal(session.state.commits.length, 1);
  assert.equal(session.state.commits[0].id, "c0");
});

test("wrong command does not advance the session", () => {
  const lesson = lessons[0];
  const session = createSession(lesson);
  const result = runCommand(session, lesson, "git push origin main");
  assert.equal(result.ok, false);
  assert.equal(session.stepIndex, 0);
  assert.ok(result.message.length > 0);
});

test("progress increases as commands succeed", () => {
  const lesson = lessons[0];
  let session = createSession(lesson);
  assert.equal(getProgress(session, lesson), 0);
  const step = getCurrentStep(session, lesson);
  const result = runCommand(session, lesson, step.command);
  assert.equal(result.ok, true);
  session = result.session;
  assert.ok(getProgress(session, lesson) > 0);
});

test("conflict cannot be skipped before merge", () => {
  const lesson = lessons.find((item) => item.id === "conflict");
  assert.ok(lesson, "conflict lesson must exist");
  const session = createSession(lesson);
  const result = resolveConflict(session, lesson, "both");
  assert.equal(result.ok, false);
  assert.match(result.message, /git merge/);
});

test("only the correct resolution unblocks the merge", () => {
  const lesson = lessons.find((item) => item.id === "conflict");
  let session = createSession(lesson);
  for (const step of lesson.steps) {
    const result = runCommand(session, lesson, step.command);
    assert.equal(result.ok, true, result.message);
    session = result.session;
    if (session.status === "conflict") break;
  }
  assert.equal(session.status, "conflict");

  const wrong = lesson.conflict.options.find((option) => !option.correct);
  const rejected = resolveConflict(session, lesson, wrong.id);
  assert.equal(rejected.ok, false);
  assert.equal(session.status, "conflict");

  const correct = lesson.conflict.options.find((option) => option.correct);
  const accepted = resolveConflict(session, lesson, correct.id);
  assert.equal(accepted.ok, true);
  assert.equal(accepted.session.status, "active");
});
