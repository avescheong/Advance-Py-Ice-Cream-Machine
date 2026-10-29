# 🍦 CodeCream Python · Customer Bear’s Ice Cream Academy

A kid-friendly interactive Python learning academy where kids write Python code to serve delicious sundaes to Customer Bear.

---

## 📁 Modular File Structure (Zero Hardcoding)

Every layer of the application is isolated into standalone, human-readable files:

```text
.
├── index.html                                 # Clean HTML structure (no hardcoded buttons or cards)
├── Argon_codecream_python_customer_bear_s_...html # Legacy entry point (mirrored)
├── README.md                                  # Developer & curriculum guide
├── css/
│   ├── style.css                              # Master stylesheet (imports all modular sheets)
│   ├── variables.css                          # Colors, fonts, design tokens & reset
│   ├── layout.css                             # Header awning, navigation, progress bar, 2-panel grid
│   ├── editor.css                             # Mission checklist, code editor, gutter, quick keys
│   ├── stage.css                              # Bear mascot, bowl, scoops, HUD, stepping trace, memory boxes
│   └── modal.css                              # Recipe book cheat-sheet modal dialog
└── js/
    ├── config.js                              # Central settings (timings, safety limits, i18n, default keys)
    ├── audio.js                               # Web Audio API sound synthesizer & custom sound registry
    ├── graphics.js                            # SVG graphics factory (scoops, sauces, Bear expressions, custom palettes)
    ├── parser.js                              # Python subset tokenizer, AST parser & custom command engine
    ├── curriculum.js                          # Curriculum registry, lifecycle events & module loader
    ├── app.js                                 # Main UI controller, step playback, dynamic DOM rendering
    └── modules/                               # Plug-and-play curriculum modules
        ├── module1-basics.js                  # Lessons 1–5: Commands, For Loops, Variables, range(n)
        ├── module2-logic.js                   # Lessons 6–8: Conditionals (if, else, elif)
        ├── module3-lists.js                   # Lessons 9–10: Lists & loop filtering
        ├── module4-while.js                   # Lessons 11–13: While loops, Boss challenge, Creative sandbox
        └── template-module.js                 # Boilerplate template for new future modules
```

---

## 🚀 How to Add a New Module in the Future

Adding a new module or curriculum pack is completely data-driven:

### Step 1: Create your module file
Create a new file in `js/modules/`, for example `js/modules/module5-functions.js`.

### Step 2: Register your module using `Curriculum.registerModule(...)`
You can define:
- Lessons (`lessons: [...]`)
- Custom Recipe Book cards (`cheatSheet: [...]`)
- Custom Quick-Key toolbar buttons (`quickKeys: [...]`)
- Custom shop commands or toppings (`commands: [...]`)

```javascript
(function () {
  "use strict";
  const { sc, tp, sa, R } = Curriculum.helpers;

  Curriculum.registerModule({
    id: "module5-functions",
    title: "🍦 Module 5: Functions & Recipes",
    description: "Learn how to define and call reusable sundae functions!",
    
    // (Optional) Automatically adds a card to the Recipe Book modal!
    cheatSheet: [
      {
        id: "func",
        title: "7. Custom Functions with def",
        description: "Group commands into a reusable recipe:",
        code: "def make_sundae():\n    scoop(\"vanilla\")\nmake_sundae()"
      }
    ],

    // (Optional) Automatically adds a quick-key button to the toolbar!
    quickKeys: [
      { label: "def ...():", insert: "def recipe():\n    ", className: "cmd-btn" }
    ],

    lessons: [
      {
        t: "14. My First Function",
        c: "Defining functions with def",
        task: "Define a make_sundae() function that scoops vanilla and adds sauce, then call it!",
        th: [
          "Functions bundle lines together so you can reuse them anytime.",
          "def name(): creates the recipe.",
          "Remember to call make_sundae() at the bottom to run it!"
        ],
        h: [
          "Write def make_sundae(): and indent the commands underneath.",
          "def make_sundae():\n    scoop(\"vanilla\")\n    sauce(\"chocolate\")\nmake_sundae()"
        ],
        checks: [
          { label: "Define function: def make_sundae():", test: code => /def\s+make_sundae\s*\(\s*\)\s*:/.test(code) },
          { label: "Call your function: make_sundae()", test: code => /make_sundae\s*\(\s*\)/.test(code) }
        ],
        start: "# Define and call your recipe:\n",
        sol: "def make_sundae():\n    scoop(\"vanilla\")\n    sauce(\"chocolate\")\nmake_sundae()",
        v: [],
        tests: [{ e: {}, w: [sc("vanilla"), sa("chocolate")] }]
      }
    ]
  });
})();
```

### Step 3: Include the script in `index.html`
In `index.html` (and `Argon_codecream_python_customer_bear_s_ice_cream_academy.html`), add:
```html
<script src="js/modules/module5-functions.js"></script>
```

---

## 🛠 Easy Configuration (`js/config.js`)

All game parameters, text labels, and timings can be modified in `js/config.js` without touching core JavaScript logic:
- **`timings`**: Adjust step delays, animation pauses, or auto-play speed.
- **`limits`**: Infinite loop guards (`maxEvents`, `maxLoopRange`).
- **`i18n`**: All UI strings and dialogue texts (ready for translations or rebranding).
- **`quickKeys`**: Default list of code snippet insertion buttons.
- **`cheatSheetCards`**: Default cheat sheet cards rendered inside the Recipe Book modal.
