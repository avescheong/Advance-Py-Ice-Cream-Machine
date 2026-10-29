/* ==========================================================================
   CURRICULUM MODULE 3: LISTS & FILTERING
   Lessons 9 to 10: Looping over lists and conditional filtering inside loops
   ========================================================================== */

(function () {
  "use strict";

  Curriculum.registerModule({
    id: "module3-lists",
    title: "🍦 Module 3: Lists & Filtering",
    description: "Learn how to store multiple flavors in lists, loop through them, and use conditions inside loops to filter.",
    lessons: [
      {
        t: "9. A list of flavors",
        c: "Lists + for",
        task: "Scoop every flavor in the flavors list, in order from first to last.",
        th: [
          "A list holds multiple items in [ ] square brackets.",
          "for f in flavors: grabs one item at a time from the list and puts it in box f.",
          "Inside the loop, scoop(f) serves whichever flavor is currently in f."
        ],
        h: [
          "Write for f in flavors: then indent scoop(f) on the next line.",
          'for f in ___:\n    scoop(___)'
        ],
        checks: [
          { label: "Loop through the list: for f in flavors:", test: code => /for\s+(\w+)\s+in\s+flavors\s*:/.test(code) },
          { label: "Scoop the loop variable: scoop(f)", test: code => /scoop\(\s*[A-Za-z_]\w*\s*\)/.test(code) }
        ],
        start: 'flavors = ["vanilla", "strawberry", "mango"]\n# Scoop every flavor:\n',
        sol: 'flavors = ["vanilla", "strawberry", "mango"]\nfor f in flavors:\n    scoop(f)',
        v: [],
        tests: [{ e: {}, w: [sc("vanilla"), sc("strawberry"), sc("mango")] }]
      },
      {
        t: "10. No mint, please!",
        c: "if inside a loop",
        task: 'Bear dislikes mint! Scoop every flavor in flavors EXCEPT "mint".',
        th: [
          "We need to inspect each flavor before scooping it.",
          '!= means “is NOT equal to”. So f != "mint" is True for every flavor except mint.',
          "Indent once for the for loop, and indent TWICE (8 spaces) for the command inside if!"
        ],
        h: [
          'Loop over flavors, then check if f != "mint": inside the loop.',
          'for f in flavors:\n    if f != "___":\n        scoop(f)'
        ],
        checks: [
          { label: "Loop over flavors: for f in flavors:", test: code => /for\s+\w+\s+in\s+flavors\s*:/.test(code) },
          { label: 'Filter out mint: if f != "mint":', test: code => /if\s+\w+\s*!=\s*["']mint["']\s*:/.test(code) },
          { label: "Double-indent scoop(f) inside the if block", test: code => /\n        scoop\(\s*\w+\s*\)/.test(code) }
        ],
        start: "# Skip mint:\n",
        sol: 'for f in flavors:\n    if f != "mint":\n        scoop(f)',
        v: ["flavors"],
        tests: [
          { e: { flavors: ["vanilla", "mint", "mango"] }, w: [sc("vanilla"), sc("mango")] },
          { e: { flavors: ["mint", "mint"] }, w: [] },
          { e: { flavors: ["strawberry", "vanilla"] }, w: [sc("strawberry"), sc("vanilla")] }
        ]
      }
    ]
  });
})();
