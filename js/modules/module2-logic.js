/* ==========================================================================
   CURRICULUM MODULE 2: DECISIONS & CONDITIONALS
   Lessons 6 to 8: if statements, if/else branching, and multi-branch elif
   ========================================================================== */

(function () {
  "use strict";

  Curriculum.registerModule({
    id: "module2-logic",
    title: "🍦 Module 2: Decisions & Conditionals",
    description: "Learn how to make decisions with if, handle alternate paths with else, and check multiple conditions with elif.",
    lessons: [
      {
        t: "6. Promo day: if",
        c: "if decisions",
        task: "Serve 1 vanilla scoop. Then, if promo == True, add free nuts on top.",
        th: [
          "Nuts are only free on promo days.",
          "Python asks: is promo == True? If yes, it runs the pushed-in line.",
          "Two == ask a question (compare). One = saves a value. Don't forget the colon : at the end!"
        ],
        h: [
          'Use if promo == True: and indent topping("nuts") on the next line.',
          'scoop("vanilla")\nif promo == ___:\n    topping("nuts")'
        ],
        checks: [
          { label: "Check condition with if promo == True:", test: code => /if\s+promo\s*(==\s*True)?\s*:/.test(code) },
          { label: 'Indent topping("nuts") underneath if', test: code => /\n    topping\(\s*["']nuts["']\s*\)/.test(code) }
        ],
        start: 'scoop("vanilla")\n# If promo, add free nuts:\n',
        sol: 'scoop("vanilla")\nif promo == True:\n    topping("nuts")',
        v: ["promo"],
        tests: [
          { e: { promo: true }, w: [sc("vanilla"), tp("nuts")] },
          { e: { promo: false }, w: [sc("vanilla")] }
        ]
      },
      {
        t: "7. Two choices: else",
        c: "if / else",
        task: "Always serve 1 vanilla. On promo day: free nuts. Otherwise (else): chocolate sauce!",
        th: [
          "Every customer gets a treat: either nuts OR chocolate sauce.",
          "If the if question is False, Python jumps straight to else:.",
          "else: never has a condition of its own — just else and a colon!"
        ],
        h: [
          'Add else: lined up with if, then indent sauce("chocolate") on the next line.',
          'if promo == True:\n    topping("nuts")\nelse:\n    sauce("___")'
        ],
        checks: [
          { label: "Write else: lined up at the left edge", test: code => /\nelse\s*:/.test(code) },
          { label: 'Indent sauce("chocolate") under else:', test: code => /\n    sauce\(\s*["']chocolate["']\s*\)/.test(code) }
        ],
        start: 'scoop("vanilla")\nif promo == True:\n    topping("nuts")',
        sol: 'scoop("vanilla")\nif promo == True:\n    topping("nuts")\nelse:\n    sauce("chocolate")',
        v: ["promo"],
        tests: [
          { e: { promo: true }, w: [sc("vanilla"), tp("nuts")] },
          { e: { promo: false }, w: [sc("vanilla"), sa("chocolate")] }
        ]
      },
      {
        t: "8. Coins: elif",
        c: "if / elif / else",
        task: "Always serve 1 vanilla. 10+ coins: chocolate sauce. 5 to 9 coins: nuts. Fewer than 5: no extras.",
        th: [
          "Three possible outcomes depending on how many coins Bear has.",
          "Python checks from top to bottom and picks ONLY the FIRST True branch.",
          "elif stands for “else if”. >= means “greater than or equal to”."
        ],
        h: [
          "Check the biggest number first: if coins >= 10:, then elif coins >= 5:.",
          'if coins >= ___:\n    sauce("chocolate")\nelif coins >= ___:\n    topping("nuts")'
        ],
        checks: [
          { label: "Check 10+ coins first: if coins >= 10:", test: code => /if\s+coins\s*>=\s*10\s*:/.test(code) },
          { label: "Check 5+ coins next: elif coins >= 5:", test: code => /elif\s+coins\s*>=\s*5\s*:/.test(code) }
        ],
        start: 'scoop("vanilla")\n# Use if / elif on coins:\n',
        sol: 'scoop("vanilla")\nif coins >= 10:\n    sauce("chocolate")\nelif coins >= 5:\n    topping("nuts")',
        v: ["coins"],
        tests: [
          { e: { coins: 12 }, w: [sc("vanilla"), sa("chocolate")] },
          { e: { coins: 10 }, w: [sc("vanilla"), sa("chocolate")] },
          { e: { coins: 7 }, w: [sc("vanilla"), tp("nuts")] },
          { e: { coins: 5 }, w: [sc("vanilla"), tp("nuts")] },
          { e: { coins: 2 }, w: [sc("vanilla")] }
        ]
      }
    ]
  });
})();
