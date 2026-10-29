/* ==========================================================================
   CURRICULUM MODULE 4: WHILE LOOPS & BOSS CHALLENGES
   Lessons 11 to 13: while loops, Grand Opening capstone, and free sandbox
   ========================================================================== */

(function () {
  "use strict";

  Curriculum.registerModule({
    id: "module4-while",
    title: "🍦 Module 4: While Loops & Boss Mastery",
    description: "Master while loops with counter variables, conquer the Grand Opening boss challenge, and explore the creative sandbox.",
    lessons: [
      {
        t: "11. Keep going: while",
        c: "while loops",
        task: "Use a while loop to serve 3 vanilla scoops. Count up using scoops += 1.",
        th: [
          "A while loop keeps repeating as long as its condition stays True.",
          "Each round, you MUST add 1 to scoops (scoops += 1), or the loop will run forever!",
          "When scoops reaches 3, scoops < 3 becomes False and the loop stops."
        ],
        h: [
          "Start at scoops = 0, repeat while scoops < 3:, scoop vanilla, and add scoops += 1.",
          'scoops = 0\nwhile scoops < ___:\n    scoop("vanilla")\n    scoops += 1'
        ],
        checks: [
          { label: "Check condition: while scoops < 3:", test: code => /while\s+scoops\s*<\s*3\s*:/.test(code) },
          { label: "Increase counter inside loop: scoops += 1", test: code => /scoops\s*\+=\s*1/.test(code) }
        ],
        start: "scoops = 0\n# Keep scooping while scoops < 3:\n",
        sol: 'scoops = 0\nwhile scoops < 3:\n    scoop("vanilla")\n    scoops += 1',
        v: [],
        tests: [{ e: {}, w: R(3, "vanilla") }]
      },
      {
        t: "12. Boss: Grand Opening!",
        c: "Everything together",
        task: "Serve n vanilla scoops, then 1 mango on top. If promo is True, finish with free nuts!",
        th: [
          "Break the big mission into 3 small steps: (1) Loop n vanillas, (2) 1 mango, (3) if promo nuts.",
          "Make sure scoop(\"mango\") is NOT indented so it only happens once after the loop.",
          "Combine for, variables, and if — you are a Master Ice Cream Coder!"
        ],
        h: [
          "Loop with range(n), then scoop mango (un-indented), then check if promo == True:.",
          'for i in range(n):\n    scoop("vanilla")\nscoop("___")\nif ___:\n    topping("nuts")'
        ],
        checks: [
          { label: "Loop n vanilla scoops with range(n)", test: code => /for\s+\w+\s+in\s+range\(\s*n\s*\)\s*:/.test(code) },
          { label: 'Serve 1 mango scoop after the loop: scoop("mango")', test: code => /\nscoop\(\s*["']mango["']\s*\)/.test(code) },
          { label: 'Add nuts if promo is True', test: code => /if\s+promo[\s\S]*topping\(\s*["']nuts["']\s*\)/.test(code) }
        ],
        start: "# 1. n vanilla scoops\n# 2. 1 mango scoop\n# 3. if promo, add nuts:\n",
        sol: 'for i in range(n):\n    scoop("vanilla")\nscoop("mango")\nif promo:\n    topping("nuts")',
        v: ["n", "promo"],
        tests: [
          { e: { n: 2, promo: true }, w: [...R(2, "vanilla"), sc("mango"), tp("nuts")] },
          { e: { n: 1, promo: false }, w: [sc("vanilla"), sc("mango")] },
          { e: { n: 4, promo: true }, w: [...R(4, "vanilla"), sc("mango"), tp("nuts")] },
          { e: { n: 0, promo: false }, w: [sc("mango")] }
        ]
      },
      {
        t: "13. Free Sandbox Parlor 🎮",
        c: "Creative Mode",
        task: "No rules! Invent your own crazy sundae with loops, lists, and ifs. Flavors: vanilla, strawberry, mango, mint, chocolate, blueberry, caramel.",
        th: [
          "Experiment and have fun!",
          "Try making a giant tower of scoops with a loop over a list.",
          "Toppings: nuts, sprinkles, cherry. Sauces: chocolate, caramel, strawberry."
        ],
        h: [
          "Try looping over your own custom list of flavors and adding toppings!",
          'for f in ["mint", "blueberry", "mango"]:\n    scoop(f)\nsauce("chocolate")\ntopping("cherry")'
        ],
        checks: [
          { label: "Experiment with any scoop(), topping(), or sauce() commands!", test: code => /(scoop|topping|sauce)\s*\(/.test(code) }
        ],
        start: '# Make your dream sundae!\nfor f in ["vanilla", "strawberry", "mango"]:\n    scoop(f)\nsauce("chocolate")\ntopping("cherry")',
        sol: 'for f in ["mint", "blueberry"]:\n    scoop(f)\ntopping("cherry")',
        v: [],
        free: true,
        tests: [{ e: {}, w: [] }]
      }
    ]
  });
})();
