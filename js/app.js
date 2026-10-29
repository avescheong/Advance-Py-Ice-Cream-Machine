/* ==========================================================================
   MODULE: APPLICATION CONTROLLER & INTERACTIVE VISUALIZER
   Manages UI state, line gutter, checklists, step playback & event listeners.
   Extensible: Dynamically builds toolbars, cheat sheet modals, and tabs from data.
   ========================================================================== */

(function (window) {
  "use strict";

  // DOM Query Helpers
  const $ = sel => document.querySelector(sel);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const formatPyVal = v => (v === true ? "True" : v === false ? "False" : JSON.stringify(v));
  const cleanCondExpr = s => s.replace(/^(if|elif|while)\s+/, "").replace(/:$/, "").trim();

  function getConfig() {
    return window.AppConfig || {
      storageKey: "codecream_v1",
      timings: { stepDelay: 550, callDelay: 320, autoPlayInterval: 950 },
      i18n: {}
    };
  }

  const describeUsedVars = (expr, env) => {
    const found = [];
    (expr.match(/[A-Za-z_]\w*/g) || []).forEach(word => {
      if (word in env && !found.includes(word)) found.push(word);
    });
    return found.map(w => w + " is " + formatPyVal(env[w])).join(", ");
  };

  const prettyItems = arr => (arr.length ? arr.map(s => s.replace(":", " ")).join(" → ") : "empty bowl");

  function buildOrderSummary(wanted, isFree) {
    const i18n = getConfig().i18n || {};
    if (isFree) return i18n.surpriseMe || "🐻 “Surprise me with your own creation!”";
    if (!wanted.length) return i18n.noOrder || "🐻 “Nothing for me this round, thanks!”";
    const counts = new Map();
    wanted.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
    const prefix = i18n.orderPrefix || "🐻 Bear’s Order: ";
    return (
      prefix +
      [...counts].map(([item, count]) => item.replace(":", " ") + (count > 1 ? " ×" + count : "")).join(" + ")
    );
  }

  function renderTargetMiniPreview(wanted, isFree) {
    const wrap = $("#target-wrap");
    const mini = $("#target-mini");
    if (isFree) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    mini.innerHTML = "";
    if (!wanted.length) {
      mini.textContent = "Empty";
      return;
    }
    wanted.forEach(w => {
      const [kind, name] = w.split(":");
      if (kind === "topping") {
        const span = document.createElement("span");
        span.textContent = (window.TOPPING_ICONS && window.TOPPING_ICONS[name]) || "⭐";
        span.title = w;
        mini.appendChild(span);
      } else {
        const dot = document.createElement("span");
        dot.className = "mini-dot";
        const pal = (window.GraphicsEngine && window.GraphicsEngine.FLAVOR_COLORS[name]) || { base: "#ccc" };
        dot.style.background = pal.base;
        dot.title = w;
        mini.appendChild(dot);
      }
    });
  }

  function renderBowl(items) {
    const bowlEl = $("#bowl");
    bowlEl.innerHTML = "";
    bowlEl.appendChild(createBowlBaseSVG());

    items.forEach(it => {
      if (window.GraphicsEngine && typeof window.GraphicsEngine.renderItemNode === "function") {
        bowlEl.appendChild(window.GraphicsEngine.renderItemNode(it.f, it.a));
      } else {
        if (it.f === "scoop") bowlEl.appendChild(createScoopSVG(it.a));
        else if (it.f === "topping") bowlEl.appendChild(createToppingElement(it.a));
        else bowlEl.appendChild(createSauceSVG(it.a));
      }
    });
  }

  function renderMemoryBoxes(env) {
    const container = $("#vars");
    container.innerHTML = "";
    const entries = Object.entries(env);
    if (!entries.length) {
      const empty = document.createElement("span");
      empty.style.fontSize = "0.8rem";
      empty.style.color = "var(--ink-muted)";
      empty.textContent = "(none yet)";
      container.appendChild(empty);
      return;
    }
    entries.forEach(([k, v]) => {
      const box = document.createElement("div");
      box.className = "mem-box";
      const keyEl = document.createElement("span");
      keyEl.className = "mem-key";
      keyEl.textContent = k;
      const valEl = document.createElement("span");
      valEl.className = "mem-val";
      valEl.textContent = formatPyVal(v);
      box.append(keyEl, valEl);
      container.appendChild(box);
    });
  }

  function setThoughtBubble(text) {
    const b = $("#bubble");
    b.textContent = text;
    b.classList.remove("pop");
    void b.offsetWidth;
    b.classList.add("pop");
  }

  function showStatusMessage(text, type) {
    const m = $("#msg");
    m.className = "msg " + type;
    m.textContent = text;
  }

  function highlightTraceLine(lineNum) {
    document.querySelectorAll("#view .ln").forEach(row => {
      const active = +row.dataset.n === lineNum;
      row.classList.toggle("hl", active);
      if (active) row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  function updateLineGutter() {
    const code = $("#code").value;
    const count = Math.max(1, code.split("\n").length);
    $("#gutter").innerHTML = Array.from({ length: count }, (_, i) => i + 1).join("<br>");
  }

  function updateLiveChecklist() {
    const lesson = LESSONS[cur];
    if (!lesson) return;
    const code = $("#code").value;
    const listEl = $("#checklist-items");
    listEl.innerHTML = "";
    const checks = lesson.checks || [];
    let passedCount = 0;

    checks.forEach(chk => {
      const ok = !!chk.test(code);
      if (ok) passedCount++;
      const li = document.createElement("li");
      li.className = "step-item" + (ok ? " checked" : "");
      li.innerHTML = `<span class="step-icon">${ok ? "✅" : "⬜"}</span><span>${chk.label}</span>`;
      listEl.appendChild(li);
    });

    $("#checklist-status").textContent = `${passedCount}/${checks.length} ready`;
  }

  /**
   * Dynamically renders Quick-Keys Toolbar from AppConfig.quickKeys
   */
  function renderQuickKeys() {
    const keysWrap = $("#keys");
    if (!keysWrap) return;
    keysWrap.innerHTML = "";
    const label = document.createElement("span");
    label.className = "key-group-label";
    label.textContent = "Quick Keys:";
    keysWrap.appendChild(label);

    const keys = (window.AppConfig && window.AppConfig.quickKeys) || [];
    keys.forEach(k => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.i = k.insert;
      btn.textContent = k.label;
      if (k.title) btn.title = k.title;
      if (k.className) btn.className = k.className;
      keysWrap.appendChild(btn);
    });
  }

  /**
   * Dynamically renders Recipe Book Cheat Sheet Cards from AppConfig.cheatSheetCards
   */
  function renderRecipeBookCards() {
    const grid = $("#guide-modal .recipe-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const cards = (window.AppConfig && window.AppConfig.cheatSheetCards) || [];
    cards.forEach(card => {
      const item = document.createElement("div");
      item.className = "recipe-item";
      const b = document.createElement("b");
      b.textContent = card.title;
      const desc = document.createTextNode(" " + card.description + " ");
      const code = document.createElement("code");
      code.textContent = card.code;
      item.append(b, desc, code);
      grid.appendChild(item);
    });
  }

  /* Application State */
  let cur = 0;
  let running = false;
  let autoPlayTimer = null;
  let S = null;
  let hintLevel = 0;
  const done = new Set();

  function getChallengeCount() {
    if (window.Curriculum && typeof window.Curriculum.getChallengeCount === "function") {
      return window.Curriculum.getChallengeCount();
    }
    return Math.max(1, LESSONS.length - 1);
  }

  function getStorageKey() {
    return (window.AppConfig && window.AppConfig.storageKey) || "codecream_v1";
  }

  try {
    const saved = JSON.parse(localStorage.getItem(getStorageKey()) || "{}").completed || [];
    saved.forEach(i => done.add(i));
  } catch (e) {}

  function saveProgress() {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify({ completed: [...done] }));
    } catch (e) {}
  }

  function updateProgressBar() {
    const challengeCount = getChallengeCount();
    const n = [...done].filter(i => i < challengeCount).length;
    $("#pt").textContent = `Progress: ${n} / ${challengeCount}`;
    $("#pf").style.width = Math.round((n / challengeCount) * 100) + "%";
  }

  function renderTabs() {
    const t = $("#tabs");
    t.innerHTML = "";
    const challengeCount = getChallengeCount();
    LESSONS.forEach((L, i) => {
      const b = document.createElement("button");
      b.type = "button";
      const isDone = done.has(i);
      b.className = "tab" + (i === cur ? " cur" : "") + (isDone ? " done" : "");
      b.textContent = (L.free ? "🎮 Free" : i + 1) + (isDone ? " ⭐" : "");
      b.title = L.t;
      b.addEventListener("click", () => {
        if (!running) loadLesson(i);
      });
      t.appendChild(b);
    });
    updateProgressBar();
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
    const btn = $("#auto-play");
    if (btn) {
      btn.textContent = "⏯ Auto-Play";
      btn.classList.remove("active-auto");
    }
  }

  function exitStepMode() {
    stopAutoPlay();
    S = null;
    $("#view").hidden = true;
    $("#editor-wrap").classList.remove("locked");
    $("#keys").hidden = false;
    $("#stepbar").hidden = true;
    $("#run").hidden = false;
    $("#loop-dial").hidden = true;
    const defaultExpl = (getConfig().i18n && getConfig().i18n.defaultExplanation) || "Press “Serve & Watch” to see Python run your recipe one line at a time!";
    $("#expl").textContent = defaultExpl;
  }

  function loadLesson(index) {
    exitStepMode();
    cur = index;
    hintLevel = 0;
    const L = LESSONS[index];
    if (!L) return;

    $("#tag").textContent = "📘 " + L.c;
    $("#goal-pill").textContent = L.free
      ? "🎨 Creative Sandbox"
      : `🎯 ${L.tests.length} Customer Test${L.tests.length > 1 ? "s" : ""}`;
    $("#title").textContent = L.t;
    $("#task").textContent = L.task;

    $("#thb").innerHTML = "";
    const headers = (getConfig().i18n && getConfig().i18n.howPythonThinksHeaders) || [
      "1️⃣ What is the problem?",
      "2️⃣ How does Python work?",
      "3️⃣ Secret Tip:"
    ];

    if (Array.isArray(L.th)) {
      L.th.forEach((entry, k) => {
        const p = document.createElement("p");
        const b = document.createElement("b");
        if (typeof entry === "object" && entry.question) {
          b.textContent = entry.question + " ";
          p.append(b, entry.answer || "");
        } else {
          b.textContent = (headers[k] || `Tip ${k + 1}:`) + " ";
          p.append(b, String(entry));
        }
        $("#thb").appendChild(p);
      });
    }
    $("#th").open = false;

    $("#hint").textContent = "💡 Hint 1: Concept clue";
    $("#hp").hidden = true;

    $("#code").value = L.start;
    updateLineGutter();
    updateLiveChecklist();

    $("#res").innerHTML = "";
    $("#next").hidden = true;
    showStatusMessage("", "");

    const firstTest = L.tests[0] || { e: {}, w: [] };
    renderBowl([]);
    setBearMood("smile");
    $("#order").textContent = buildOrderSummary(firstTest.w, L.free);
    renderTargetMiniPreview(firstTest.w, L.free);
    renderMemoryBoxes(firstTest.e);
    setThoughtBubble("👋 Ready for my order!");
    renderTabs();
  }

  /* Progressive Hint Handler */
  $("#hint").addEventListener("click", () => {
    const L = LESSONS[cur];
    if (!L) return;
    hintLevel = Math.min(hintLevel + 1, 3);
    const p = $("#hp");
    p.hidden = false;
    if (hintLevel === 1) {
      p.textContent = "💡 Concept Clue:\n" + L.h[0];
      $("#hint").textContent = "💡 Hint 2: Code structure";
    } else if (hintLevel === 2) {
      p.textContent = "🧩 Code Structure (fill in the ___ blanks):\n" + L.h[1];
      $("#hint").textContent = "💡 Hint 3: Show full answer";
    } else {
      p.textContent = "✅ Full Solution:\n" + L.sol;
      $("#hint").textContent = "💡 All hints shown";
    }
    playSound("step");
  });

  /* Reset Starter Code Handler */
  $("#reset-code").addEventListener("click", () => {
    if (running) return;
    exitStepMode();
    const L = LESSONS[cur];
    if (L) {
      $("#code").value = L.start;
      updateLineGutter();
      updateLiveChecklist();
      showStatusMessage("Code reset to starter template.", "info");
    }
  });

  /* Run & Compile Handler */
  function startRun() {
    if (running) return;
    const L = LESSONS[cur];
    if (!L) return;

    $("#res").innerHTML = "";
    $("#next").hidden = true;
    showStatusMessage("", "");

    let ast;
    try {
      ast = parsePython($("#code").value, L.v);
    } catch (e) {
      if (e instanceof PyErr) {
        setBearMood("oops");
        setThoughtBubble("🐞 Oops! Syntax error");
        playSound("err");
        showStatusMessage("🐞 " + e.message, "bad");
        return;
      }
      throw e;
    }

    const testRuns = [];
    for (const t of L.tests) {
      const env0 = { ...t.e };
      const env = { ...env0 };
      const events = [];
      try {
        traceAST(ast, env, events);
      } catch (e) {
        setBearMood("oops");
        playSound("err");
        showStatusMessage("🐞 " + (e instanceof PyErr ? e.message : "Something went wrong inside your recipe."), "bad");
        return;
      }
      const items = events.filter(x => x.k === "call").map(x => x.f + ":" + x.a);
      const passed = L.free || JSON.stringify(items) === JSON.stringify(t.w);
      const label =
        Object.entries(env0)
          .map(([k, v]) => k + " = " + formatPyVal(v))
          .join(", ") || "Bear’s order";
      testRuns.push({ t, env0, ev: events, items, good: passed, lab: label });
    }

    const viewEl = $("#view");
    viewEl.innerHTML = "";
    $("#code")
      .value.split("\n")
      .forEach((lineText, idx) => {
        const row = document.createElement("div");
        row.className = "ln";
        row.dataset.n = idx + 1;
        const num = document.createElement("i");
        num.textContent = idx + 1;
        row.append(num, document.createTextNode(lineText));
        viewEl.appendChild(row);
      });

    S = { L, T: testRuns, si: 0, ei: -1, rows: 0, testDone: false, bowl: [] };
    $("#editor-wrap").classList.add("locked");
    $("#keys").hidden = true;
    viewEl.hidden = false;
    $("#run").hidden = true;
    $("#stepbar").hidden = false;
    prepareTestIntro();
  }

  function prepareTestIntro() {
    const t = S.T[S.si];
    S.ei = -1;
    S.testDone = false;
    S.bowl = [];
    highlightTraceLine(0);
    renderMemoryBoxes(t.env0);
    renderBowl([]);
    setBearMood("smile");
    setThoughtBubble(`📋 Test ${S.si + 1} of ${S.T.length}`);
    $("#loop-dial").hidden = true;
    $("#order").textContent = buildOrderSummary(t.t.w, S.L.free);
    renderTargetMiniPreview(t.t.w, S.L.free);
    $("#expl").textContent = `Customer Test ${S.si + 1} of ${S.T.length} (${t.lab}). Press “Next step ▶” or “Auto-Play” to watch Python execute!`;
    $("#step").textContent = "Next step ▶";
  }

  function appendResultRow(idx) {
    const t = S.T[idx];
    const row = document.createElement("div");
    row.className = "chip " + (t.good ? "pass" : "fail");
    row.textContent = S.L.free
      ? "🍨 Created Bowl: " + prettyItems(t.items)
      : (t.good ? "✅ PASS · " : "❌ TRY AGAIN · ") +
        t.lab +
        " → Served: " +
        prettyItems(t.items) +
        (t.good ? "" : "  (Bear wanted: " + prettyItems(t.t.w) + ")");
    $("#res").appendChild(row);
    S.rows = idx + 1;
  }

  function finalizeRun() {
    const L = S.L;
    const allPassed = S.T.every(t => t.good);
    exitStepMode();

    if (L.free) {
      setBearMood("happy");
      playSound("win");
      setThoughtBubble("😋 Yummy creation!");
      showStatusMessage("Awesome creation! Edit your code anytime to invent new sundaes.", "info");
      return;
    }

    if (allPassed) {
      done.add(cur);
      saveProgress();
      renderTabs();
      setBearMood("happy");
      playSound("win");
      setThoughtBubble("🎉 YUM! Perfect order!");
      showStatusMessage("🎉 Every test passed! Customer Bear loves your Python recipe!", "ok");
      if (cur < LESSONS.length - 1) $("#next").hidden = false;
    } else {
      setBearMood("oops");
      playSound("err");
      setThoughtBubble("🤔 Almost! Check the order");
      showStatusMessage("Almost there! Check the red ❌ test row below to see what Bear needed, then click Edit.", "bad");
    }
  }

  function skipToResults() {
    if (!S || running) return;
    stopAutoPlay();
    const lastTest = S.T[S.T.length - 1];
    renderBowl(lastTest.ev.filter(x => x.k === "call").map(x => ({ f: x.f, a: x.a })));
    for (let i = S.rows; i < S.T.length; i++) appendResultRow(i);
    finalizeRun();
  }

  async function executeSingleStep() {
    if (!S || running) return;
    if (S.testDone) {
      if (S.si < S.T.length - 1) {
        S.si++;
        prepareTestIntro();
      } else {
        finalizeRun();
      }
      return;
    }

    const t = S.T[S.si];
    const e = t.ev[++S.ei];
    const X = $("#expl");

    if (!e) {
      S.testDone = true;
      appendResultRow(S.si);
      return;
    }

    running = true;
    $("#step").disabled = true;
    highlightTraceLine(e.n || 0);
    if (e.env) renderMemoryBoxes(e.env);

    const timings = (getConfig().timings) || { stepDelay: 550, callDelay: 320 };

    if (e.k === "cond") {
      setBearMood("thinking");
      playSound("step");
      const expr = cleanCondExpr(e.s);
      const varContext = describeUsedVars(expr, e.env);
      const questionText = `Checking condition: Is ${expr}? ${varContext ? "(" + varContext + ")" : ""}`;
      setThoughtBubble("🤔 " + expr + " ?");
      if (e.w) {
        $("#loop-dial").hidden = false;
        $("#loop-dial").textContent = `🔁 while check #${e.round}`;
      }
      X.textContent = questionText;
      await sleep(timings.stepDelay);
      setThoughtBubble(e.r ? "✅ Yes (True)!" : "❌ No (False)");
      X.textContent =
        questionText +
        (e.r
          ? " → ✅ True! Running the indented lines inside."
          : " → ❌ False! " + (e.w ? "Stopping the while loop." : "Skipping the indented lines."));
    } else if (e.k === "set") {
      playSound("step");
      setThoughtBubble(`📦 ${e.key} = ${formatPyVal(e.val)}`);
      X.textContent = `Memory Box Updated! Box “${e.key}” now holds ${formatPyVal(e.val)}.`;
    } else if (e.k === "loop") {
      playSound("step");
      $("#loop-dial").hidden = false;
      $("#loop-dial").textContent = `🔁 Loop Round ${e.round} of ${e.total}`;
      setThoughtBubble(`🔁 ${e.key} = ${formatPyVal(e.val)}`);
      X.textContent = `Loop Round ${e.round} of ${e.total}: “${e.key}” is set to ${formatPyVal(e.val)}. Running indented lines!`;
    } else if (e.k === "end") {
      playSound("step");
      $("#loop-dial").textContent = "🏁 Loop Complete!";
      setThoughtBubble("🏁 Loop finished!");
      X.textContent = "Loop finished all its rounds! Python moves to the next un-indented line.";
    } else if (e.k === "else") {
      playSound("step");
      setThoughtBubble("↪️ Taking else: branch");
      X.textContent = "Since the if condition above was False, Python runs the else: block!";
    } else if (e.k === "call") {
      S.bowl.push({ f: e.f, a: e.a });
      renderBowl(S.bowl);
      playSound("pop");
      setBearMood("happy");
      setThoughtBubble(`🍨 ${e.f}("${e.a}")`);
      const actionDesc = (window.GraphicsEngine && window.GraphicsEngine.ACTION_DESCRIPTIONS[e.f]) || "item served in bowl!";
      X.textContent = `Line ${e.n} runs ${e.f}("${e.a}") — ${actionDesc}`;
      await sleep(timings.callDelay);
    }

    if (S.ei >= t.ev.length - 1) {
      S.testDone = true;
      appendResultRow(S.si);
      highlightTraceLine(0);
      if (!S.L.free) {
        setBearMood(t.good ? "happy" : "oops");
        X.textContent += t.good ? "  ✅ Order matched!" : "  ❌ Bowl doesn’t match Bear’s order yet.";
      }
    }

    running = false;
    $("#step").disabled = false;
    $("#step").textContent = S.testDone
      ? S.si < S.T.length - 1
        ? "Next Customer Test ▶"
        : "See Final Results ▶"
      : "Next step ▶";
  }

  function toggleAutoPlay() {
    if (!S) return;
    if (autoPlayTimer) {
      stopAutoPlay();
      return;
    }
    const btn = $("#auto-play");
    btn.textContent = "⏸ Pause Auto";
    btn.classList.add("active-auto");
    executeSingleStep();
    const interval = (getConfig().timings && getConfig().timings.autoPlayInterval) || 950;
    autoPlayTimer = setInterval(() => {
      if (!S) {
        stopAutoPlay();
        return;
      }
      if (!running) executeSingleStep();
    }, interval);
  }

  /* Editor Keyboard & Quick-Key Enhancements */
  const ta = $("#code");
  function insertSnippet(text) {
    ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
    ta.focus();
    updateLineGutter();
    updateLiveChecklist();
  }

  ta.addEventListener("input", () => {
    updateLineGutter();
    updateLiveChecklist();
  });

  ta.addEventListener("scroll", () => {
    $("#gutter").scrollTop = ta.scrollTop;
  });

  ta.addEventListener("keydown", e => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertSnippet("    ");
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      startRun();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pos = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf("\n", pos - 1) + 1;
      const currentLine = ta.value.slice(lineStart, pos);
      let indent = currentLine.match(/^ */)[0];
      if (currentLine.trim().endsWith(":")) indent += "    ";
      insertSnippet("\n" + indent);
    }
  });

  $("#keys").addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const snippet = btn.dataset.i;
    insertSnippet(snippet);
    if (/\)$|\]$/.test(snippet) && !snippet.includes('"')) {
      ta.setSelectionRange(ta.selectionStart - 1, ta.selectionStart - 1);
    }
    playSound("step");
  });

  /* Header & Modal Controls */
  $("#btn-sound").addEventListener("click", () => {
    const enabled = SoundEngine.toggle();
    $("#btn-sound").textContent = enabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
    if (enabled) playSound("pop");
  });

  $("#btn-guide").addEventListener("click", () => {
    $("#guide-modal").hidden = false;
  });

  $("#close-guide").addEventListener("click", () => {
    $("#guide-modal").hidden = true;
  });

  $("#guide-modal").addEventListener("click", e => {
    if (e.target === $("#guide-modal")) $("#guide-modal").hidden = true;
  });

  /* Execution Control Listeners */
  $("#run").addEventListener("click", startRun);
  $("#step").addEventListener("click", () => {
    stopAutoPlay();
    executeSingleStep();
  });
  $("#auto-play").addEventListener("click", toggleAutoPlay);
  $("#skip").addEventListener("click", skipToResults);
  $("#edit").addEventListener("click", () => {
    if (!running) exitStepMode();
  });
  $("#next").addEventListener("click", () => {
    loadLesson(Math.min(cur + 1, LESSONS.length - 1));
  });

  // App Initialization
  function initApp() {
    renderQuickKeys();
    renderRecipeBookCards();
    loadLesson(0);
  }

  // Export public App Controller for developer & module extensions
  window.CodeCreamApp = {
    loadLesson,
    startRun,
    skipToResults,
    resetCode: () => $("#reset-code").click(),
    toggleSound: () => $("#btn-sound").click(),
    getCurrentLesson: () => LESSONS[cur] || null,
    renderQuickKeys,
    renderRecipeBookCards
  };

  initApp();
})(window);
