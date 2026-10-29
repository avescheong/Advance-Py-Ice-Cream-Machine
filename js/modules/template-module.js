/* ==========================================================================
   HOW TO ADD A NEW MODULE (TEMPLATE & DEVELOPER GUIDE)
   Copy or use this file to add new learning modules & lessons to CodeCream!
   
   Steps to add your new module:
   1. Create a new file in `js/modules/`, e.g. `module5-custom.js`.
   2. Use the Curriculum.registerModule(...) call below.
   3. In your HTML (`index.html`), add:
      <script src="js/modules/module5-custom.js"></script>
      (right after module4-while.js, before app.js).
   4. Reload! Your lessons, custom quick-keys, recipe book cards, and commands
      will automatically register with zero hardcoding!
   ========================================================================== */

(function () {
  "use strict";

  // Helper shortcuts:
  //   sc("flavor")   -> "scoop:flavor"
  //   tp("topping")  -> "topping:topping"
  //   sa("sauce")    -> "sauce:sauce"
  //   R(count, "fl") -> Array of `count` scoop strings
  const { sc, tp, sa, R } = Curriculum.helpers;

  /*
  Curriculum.registerModule({
    id: "module5-functions",
    title: "🍦 Module 5: Python Functions",
    description: "Learn how to define your own ice cream recipes with def!",

    // (Optional) Add custom Recipe Book cards to the cheat sheet modal
    cheatSheet: [
      {
        id: "functions-cheat",
        title: "7. Custom Functions with def",
        description: "Group commands into a reusable recipe:",
        code: "def make_sundae():\n    scoop(\"vanilla\")\n    sauce(\"chocolate\")\nmake_sundae()"
      }
    ],

    // (Optional) Add custom Quick-Keys to the toolbar
    quickKeys: [
      { label: "def ...():", insert: "def recipe():\n    ", className: "cmd-btn", title: "Define a function" }
    ],

    // (Optional) Register custom commands or toppings
    commands: [
      {
        name: "cherry_on_top",
        topping: { name: "cherry_on_top", icon: "🍒", description: "a bright red cherry on top!" },
        actionDescription: "a juicy cherry crowns the sundae! 🍒"
      }
    ],

    // Lessons list
    lessons: [
      {
        t: "14. My First Function",
        c: "Defining functions with def",
        task: "Define a function make_sundae() that scoops vanilla and adds chocolate sauce, then call it!",
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
  */
})();
