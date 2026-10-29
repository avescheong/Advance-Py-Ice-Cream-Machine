/* ==========================================================================
   APPLICATION CONFIGURATION & EXTENSION SETTINGS
   Central configuration for game settings, timings, default keys & cheat sheet.
   Edit this file to tweak behavior, timings, or translations without touching core code.
   ========================================================================== */

(function (window) {
  "use strict";

  const AppConfig = {
    // Storage & Persistence
    storageKey: "codecream_v1",

    // Execution & Animation Timings (in milliseconds)
    timings: {
      stepDelay: 550,        // Pause duration during condition / memory explanation
      callDelay: 320,        // Pause duration after scoop/topping action
      autoPlayInterval: 950  // Step interval during auto-play mode
    },

    // Execution Safety Limits
    limits: {
      maxEvents: 300,        // Maximum AST trace events (infinite loop safeguard)
      maxLoopRange: 60       // Maximum iterations in a single for loop
    },

    // UI Labels & Translations (Easily translate into any language!)
    i18n: {
      appTitle: "CodeCream Python",
      appSubtitle: "Customer Bear’s Coding Parlor",
      progressLabel: "Progress",
      soundOn: "🔊 Sound: ON",
      soundOff: "🔇 Sound: OFF",
      recipeBookBtn: "📖 Recipe Book",
      resetBtn: "↺ Reset",
      runBtn: "▶ Serve & Watch Step-by-Step",
      nextBtn: "Next Level ➜",
      stepBtn: "Next step ▶",
      autoPlayBtn: "⏯ Auto-Play",
      pauseAutoBtn: "⏸ Pause Auto",
      skipBtn: "⏭ Skip to results",
      editBtn: "✏️ Edit code",
      memoryTitle: "📦 Memory Boxes:",
      readyGreeting: "👋 Ready to code!",
      orderReady: "👋 Ready for my order!",
      orderPrefix: "🐻 Bear’s Order: ",
      surpriseMe: "🐻 “Surprise me with your own creation!”",
      noOrder: "🐻 “Nothing for me this round, thanks!”",
      syntaxErrorBubble: "🐞 Oops! Syntax error",
      passBubble: "🎉 YUM! Perfect order!",
      failBubble: "🤔 Almost! Check the order",
      passMessage: "🎉 Every test passed! Customer Bear loves your Python recipe!",
      failMessage: "Almost there! Check the red ❌ test row below to see what Bear needed, then click Edit.",
      sandboxPassBubble: "😋 Yummy creation!",
      sandboxPassMessage: "Awesome creation! Edit your code anytime to invent new sundaes.",
      defaultExplanation: "Press “Serve & Watch” to see Python run your recipe one line at a time!",
      howPythonThinksHeaders: [
        "1️⃣ What is the problem?",
        "2️⃣ How does Python work?",
        "3️⃣ Secret Tip:"
      ]
    },

    // Default Quick-Keys Toolbar Definitions
    // Modules can dynamically add more keys using AppConfig.addQuickKey(...)
    quickKeys: [
      { label: "⇥ Tab", insert: "    ", title: "Indent (4 spaces)" },
      { label: ":", insert: ":" },
      { label: '" "', insert: '"' },
      { label: "=", insert: "=" },
      { label: "==", insert: "==" },
      { label: "!=", insert: "!=" },
      { label: "+=", insert: "+=" },
      { label: ">=", insert: ">=" },
      { label: "<", insert: "<" },
      { label: "[ ]", insert: "[]" },
      { label: "range()", insert: "range()" },
      { label: "🍨 scoop", insert: 'scoop("vanilla")', className: "cmd-btn" },
      { label: "🥜 topping", insert: 'topping("nuts")', className: "cmd-btn" },
      { label: "🍫 sauce", insert: 'sauce("chocolate")', className: "cmd-btn" }
    ],

    // Default Recipe Book Cheat Sheet Cards
    // Modules can add new cards using AppConfig.addCheatSheetCard(...)
    cheatSheetCards: [
      {
        id: "commands",
        title: "1. Shop Commands",
        description: "Put the flavor or topping in quotes inside ( ):",
        code: 'scoop("vanilla")\ntopping("cherry")\nsauce("chocolate")'
      },
      {
        id: "for-loop",
        title: "2. Repeat with for",
        description: "Repeats indented lines 3 times:",
        code: 'for i in range(3):\n    scoop("mango")'
      },
      {
        id: "variables",
        title: "3. Memory Boxes (Variables)",
        description: "Use one = to store a value:",
        code: 'flavor = "strawberry"\nscoop(flavor)'
      },
      {
        id: "conditionals",
        title: "4. Decisions with if / else",
        description: "Use two == to compare values:",
        code: 'if promo == True:\n    topping("nuts")\nelse:\n    sauce("chocolate")'
      },
      {
        id: "lists",
        title: "5. Looping Over Lists",
        description: "Scoop every item inside [ ]:",
        code: 'for f in flavors:\n    scoop(f)'
      },
      {
        id: "while-loop",
        title: "6. while Loops",
        description: "Repeat while a condition is True:",
        code: 'scoops = 0\nwhile scoops < 3:\n    scoop("vanilla")\n    scoops += 1'
      }
    ],

    /**
     * Helper to register a new quick key dynamically.
     */
    addQuickKey(keyDef) {
      if (!keyDef || !keyDef.label || !keyDef.insert) return;
      this.quickKeys.push(keyDef);
    },

    /**
     * Helper to register a new card in the Recipe Book modal cheat sheet.
     */
    addCheatSheetCard(cardDef) {
      if (!cardDef || !cardDef.title) return;
      this.cheatSheetCards.push(cardDef);
    }
  };

  window.AppConfig = AppConfig;
})(window);
