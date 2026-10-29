/* ==========================================================================
   CURRICULUM MODULE 1: PYTHON BASICS & VARIABLES
   Lessons 1 to 5: Commands, For Loops, Indentation, Variables & range(n)
   ========================================================================== */

(function () {
  "use strict";

  Curriculum.registerModule({
    id: "module1-basics",
    title: "🍦 Module 1: Python Basics & Variables",
    description: "Learn how to run commands, repeat with for loops, store values in variables, and use variables in range().",
    lessons: [
      {
        t: "1. Serve a scoop",
        c: "Calling a command",
        task: "Customer Bear wants one vanilla scoop. Type the command to serve it!",
        th: [
          "The bowl is empty and Bear is hungry.",
          "Python runs your lines from top to bottom. scoop(...) is a command.",
          "Words in quotes are text (strings). Brackets ( ) run the command."
        ],
        h: [
          'scoop(...) puts a scoop in the bowl. The flavor goes inside the brackets, in quotes: "vanilla".',
          'scoop("___")'
        ],
        checks: [
          { label: 'Use the scoop(...) command', test: code => /scoop\s*\(/.test(code) },
          { label: 'Put "vanilla" in quotes inside the brackets', test: code => /["']vanilla["']/.test(code) }
        ],
        start: "# Serve one vanilla scoop:\n",
        sol: 'scoop("vanilla")',
        v: [],
        tests: [{ e: {}, w: [sc("vanilla")] }]
      },
      {
        t: "2. Repeat with for",
        c: "for loops",
        task: "Bear wants 3 vanilla scoops. Don’t type scoop 3 times — use a for loop!",
        th: [
          "We need the exact same scoop 3 times.",
          "for i in range(3): means “repeat the indented lines 3 times”.",
          "The pushed-in (indented with Tab) lines are what gets repeated."
        ],
        h: [
          'Write for i in range(3): on the first line, then press Tab before scoop("vanilla") on the next line.',
          'for i in range(___):\n    scoop("vanilla")'
        ],
        checks: [
          { label: "Start a loop with for i in range(3):", test: code => /for\s+\w+\s+in\s+range\(\s*3\s*\)\s*:/.test(code) },
          { label: 'Indent scoop("vanilla") with 4 spaces (Tab)', test: code => /\n    scoop\(\s*["']vanilla["']\s*\)/.test(code) }
        ],
        start: '# Repeat 3 times:\nscoop("vanilla")',
        sol: 'for i in range(3):\n    scoop("vanilla")',
        v: [],
        tests: [{ e: {}, w: R(3, "vanilla") }]
      },
      {
        t: "3. Loop, then one more",
        c: "Indentation ends a loop",
        task: "Serve 3 vanilla scoops in a loop, then ONE strawberry scoop on top.",
        th: [
          "Two different jobs: a loop of 3 vanilla scoops, then a single strawberry scoop.",
          "Lines pushed in belong to the loop. A line NOT pushed in runs once, after the loop finishes.",
          "Indentation decides what repeats and what runs once!"
        ],
        h: [
          'Add scoop("strawberry") on a new line at the bottom that is NOT pushed in (no spaces at the start).',
          'for i in range(3):\n    scoop("vanilla")\nscoop("___")'
        ],
        checks: [
          { label: "Keep the for i in range(3): loop for vanilla", test: code => /for\s+\w+\s+in\s+range\(\s*3\s*\)\s*:/.test(code) },
          { label: 'Add un-indented scoop("strawberry") on the last line', test: code => /\nscoop\(\s*["']strawberry["']\s*\)/.test(code) }
        ],
        start: 'for i in range(3):\n    scoop("vanilla")\n',
        sol: 'for i in range(3):\n    scoop("vanilla")\nscoop("strawberry")',
        v: [],
        tests: [{ e: {}, w: [...R(3, "vanilla"), sc("strawberry")] }]
      },
      {
        t: "4. The memory box =",
        c: "Variables",
        task: 'Save "mango" in a variable called flavor, then scoop it 2 times.',
        th: [
          "We use the same flavor twice, so we store it inside a named memory box.",
          'flavor = "mango" saves the text "mango" inside a box named flavor.',
          "When you use a variable name inside scoop(flavor), do NOT put quotes around flavor!"
        ],
        h: [
          'Write flavor = "mango" first, then loop 2 times with scoop(flavor) inside.',
          'flavor = "___"\nfor i in range(2):\n    scoop(___)'
        ],
        checks: [
          { label: 'Create memory box: flavor = "mango"', test: code => /flavor\s*=\s*["']mango["']/.test(code) },
          { label: "Loop 2 times with range(2):", test: code => /range\(\s*2\s*\)\s*:/.test(code) },
          { label: "Use scoop(flavor) without quotes around flavor", test: code => /scoop\(\s*flavor\s*\)/.test(code) }
        ],
        start: '# Save "mango" in flavor, then scoop it 2 times:\n',
        sol: 'flavor = "mango"\nfor i in range(2):\n    scoop(flavor)',
        v: [],
        tests: [{ e: {}, w: R(2, "mango") }]
      },
      {
        t: "5. Count from the customer",
        c: "Variables in range()",
        task: "Bear tells you n (how many scoops he wants). Scoop vanilla n times. Watch the test values change!",
        th: [
          "Each customer wants a different number of scoops stored in box n.",
          "range(n) repeats n times, whatever number is inside n.",
          "A variable can go anywhere a number can!"
        ],
        h: [
          "Use range(n) with no quotes around n so Python reads the number inside box n.",
          'for i in range(___):\n    scoop("vanilla")'
        ],
        checks: [
          { label: "Use variable n inside range(n):", test: code => /for\s+\w+\s+in\s+range\(\s*n\s*\)\s*:/.test(code) },
          { label: 'Indent scoop("vanilla") inside the loop', test: code => /\n    scoop\(\s*["']vanilla["']\s*\)/.test(code) }
        ],
        start: '# n = how many scoops?\nscoop("vanilla")',
        sol: 'for i in range(n):\n    scoop("vanilla")',
        v: ["n"],
        tests: [
          { e: { n: 2 }, w: R(2, "vanilla") },
          { e: { n: 4 }, w: R(4, "vanilla") },
          { e: { n: 1 }, w: R(1, "vanilla") }
        ]
      }
    ]
  });
})();
