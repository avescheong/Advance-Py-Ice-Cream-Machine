/* ==========================================================================
   MODULE: KID-FRIENDLY PYTHON SUBSET PARSER & AST EVALUATOR
   Parses indentation, variables, for/while loops, if/elif/else, and commands.
   Extensible: Supports registering custom commands with validation hooks.
   ========================================================================== */

(function (window) {
  "use strict";

  const VALID_COMMANDS = ["scoop", "topping", "sauce"];
  const commandConfigs = {};

  const len = x => x.length;

  class PyErr extends Error {}
  const E = (n, m) => new PyErr("Line " + n + ": " + m);

  function getLimits() {
    return (window.AppConfig && window.AppConfig.limits) || { maxEvents: 300, maxLoopRange: 60 };
  }

  function compileExpr(txt, knownNames, lineNum) {
    if (!txt) throw E(lineNum, "Something is missing here.");
    const tokenRegex = /\s+|"[^"\\]*"|'[^'\\]*'|\d+(?:\.\d+)?|[A-Za-z_]\w*|==|!=|>=|<=|[><+\-*(),\[\]]/y;
    let js = "";
    let pos = 0;
    let match;

    while (pos < txt.length) {
      tokenRegex.lastIndex = pos;
      match = tokenRegex.exec(txt);
      if (!match) {
        throw E(
          lineNum,
          txt[pos] === "="
            ? "Use two equals == to compare values. One = is only for saving a variable."
            : "I don’t understand the symbol “" + txt[pos] + "”."
        );
      }
      const tok = match[0];
      pos = tokenRegex.lastIndex;

      if (/^\s+$/.test(tok)) {
        js += " ";
        continue;
      }
      if (tok === "and") js += "&&";
      else if (tok === "or") js += "||";
      else if (tok === "not") js += "!";
      else if (tok === "True") js += "true";
      else if (tok === "False") js += "false";
      else if (tok === "==") js += "===";
      else if (tok === "!=") js += "!==";
      else if (tok === "len") js += "len";
      else if (/^[A-Za-z_]/.test(tok)) {
        if (!knownNames.includes(tok)) {
          throw E(
            lineNum,
            'I don’t know the word “' +
              tok +
              '”. If it is a flavor or topping word, wrap it in quotes like "' +
              tok +
              '". Memory boxes I know: ' +
              (knownNames.join(", ") || "none yet")
          );
        }
        js += "e." + tok;
      } else {
        js += tok;
      }
    }

    let fn;
    try {
      fn = new Function("e", "len", "return (" + js + ")");
    } catch (err) {
      throw E(lineNum, "This line doesn’t look quite right. Check your quotes \" \" and brackets ( ).");
    }
    return env => fn(env, len);
  }

  function parsePython(src, inputVarNames) {
    const lines = [];
    src
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\t/g, "    ")
      .split("\n")
      .forEach((raw, idx) => {
        const trimmed = raw.trim();
        if (trimmed && trimmed[0] !== "#") {
          lines.push({
            n: idx + 1,
            ind: raw.length - raw.trimStart().length,
            s: trimmed
          });
        }
      });

    const knownNames = (inputVarNames || []).slice();
    let ptr = 0;

    function parseSubBlock(headerLine) {
      if (ptr >= lines.length || lines[ptr].ind <= headerLine.ind) {
        throw E(headerLine.n, "After a colon : the next line must be pushed in (press Tab).");
      }
      return parseBlock(lines[ptr].ind);
    }

    function parseHeaderCondition(line, keyword) {
      if (!line.s.endsWith(":")) {
        throw E(line.n, "Don’t forget the colon : at the end of the " + keyword + " line.");
      }
      return compileExpr(line.s.slice(keyword.length, -1).trim(), knownNames, line.n);
    }

    function parseIfNode(line) {
      const branches = [{ c: parseHeaderCondition(line, "if"), b: parseSubBlock(line), n: line.n, s: line.s }];
      let elseBlock = null;
      let elseLineNum = 0;

      while (ptr < lines.length && lines[ptr].ind === line.ind) {
        const nextLine = lines[ptr];
        if (/^elif\b/.test(nextLine.s)) {
          ptr++;
          branches.push({
            c: parseHeaderCondition(nextLine, "elif"),
            b: parseSubBlock(nextLine),
            n: nextLine.n,
            s: nextLine.s
          });
        } else if (/^else\b/.test(nextLine.s)) {
          ptr++;
          if (!/^else\s*:$/.test(nextLine.s)) {
            throw E(nextLine.n, "else stands alone with a colon, like this: else:");
          }
          elseBlock = parseSubBlock(nextLine);
          elseLineNum = nextLine.n;
          break;
        } else {
          break;
        }
      }
      return { t: "if", br: branches, els: elseBlock, elsN: elseLineNum };
    }

    function parseForNode(line) {
      if (!line.s.endsWith(":")) {
        throw E(line.n, "Don’t forget the colon : at the end of the for line.");
      }
      const m = line.s.match(/^for\s+([A-Za-z_]\w*)\s+in\s+(.+?)\s*:$/);
      if (!m) {
        throw E(line.n, "Write your for loop like this: for i in range(3):");
      }
      const rangeMatch = m[2].match(/^range\((.*)\)$/);
      const iterExpr = compileExpr(rangeMatch ? rangeMatch[1].trim() : m[2], knownNames, line.n);
      if (!knownNames.includes(m[1])) knownNames.push(m[1]);
      return {
        t: "for",
        k: m[1],
        it: iterExpr,
        rng: !!rangeMatch,
        b: parseSubBlock(line),
        n: line.n
      };
    }

    function parseWhileNode(line) {
      return {
        t: "while",
        c: parseHeaderCondition(line, "while"),
        b: parseSubBlock(line),
        n: line.n,
        s: line.s
      };
    }

    function parseSimpleStatement(line) {
      let m;
      const cmdRegex = new RegExp(`^(${VALID_COMMANDS.join("|")})$`);
      if (cmdRegex.test(line.s)) {
        throw E(line.n, 'Add brackets and a flavor in quotes: ' + line.s + '("vanilla")');
      }
      if ((m = line.s.match(/^([A-Za-z_]\w*)\((.*)\)$/))) {
        if (!VALID_COMMANDS.includes(m[1])) {
          throw E(line.n, 'I don’t know the command “' + m[1] + '()”. Available commands: ' + VALID_COMMANDS.join(", "));
        }
        if (!m[2].trim()) {
          throw E(line.n, 'Put a flavor or item inside the brackets, like ' + m[1] + '("vanilla")');
        }
        return { t: "call", f: m[1], a: compileExpr(m[2], knownNames, line.n), n: line.n };
      }
      if ((m = line.s.match(/^([A-Za-z_]\w*)\s*(\+=|-=|=(?!=))\s*(.+)$/))) {
        const valExpr = compileExpr(m[3], knownNames, line.n);
        if (m[2] !== "=" && !knownNames.includes(m[1])) {
          throw E(line.n, '“' + m[1] + '” has no starting value yet. Save one first, like ' + m[1] + " = 0");
        }
        if (!knownNames.includes(m[1])) knownNames.push(m[1]);
        return { t: "set", k: m[1], op: m[2], v: valExpr, n: line.n };
      }
      throw E(line.n, 'I can’t read this line. Try for, if, while, or a command like scoop("vanilla").');
    }

    function parseBlock(expectedIndent) {
      const stmts = [];
      while (ptr < lines.length) {
        const line = lines[ptr];
        if (line.ind < expectedIndent) break;
        if (line.ind > expectedIndent) {
          throw E(line.n, "This line is pushed in too far. Check your spaces/Tab.");
        }
        ptr++;
        if (/^if\b/.test(line.s)) stmts.push(parseIfNode(line));
        else if (/^for\b/.test(line.s)) stmts.push(parseForNode(line));
        else if (/^while\b/.test(line.s)) stmts.push(parseWhileNode(line));
        else if (/^(elif|else)\b/.test(line.s)) {
          throw E(line.n, '“' + line.s.split(/\W/)[0] + '” must line up under a matching if.');
        } else {
          stmts.push(parseSimpleStatement(line));
        }
      }
      return stmts;
    }

    if (!lines.length) throw new PyErr("Type some Python code in the editor first!");
    const ast = parseBlock(lines[0].ind);
    if (ptr < lines.length) {
      throw E(lines[ptr].n, "This line is not lined up with the code above it.");
    }
    return ast;
  }

  function traceAST(nodes, env, events) {
    const limits = getLimits();
    for (const node of nodes) {
      if (events.length > limits.maxEvents) {
        throw new PyErr("Whoa! Your loop never stops! Make sure your counter changes each round.");
      }
      if (node.t === "call") {
        const argVal = node.a(env);
        events.push({ k: "call", n: node.n, f: node.f, a: String(argVal), env: { ...env } });
      } else if (node.t === "set") {
        const rhs = node.v(env);
        env[node.k] = node.op === "+=" ? env[node.k] + rhs : node.op === "-=" ? env[node.k] - rhs : rhs;
        events.push({ k: "set", n: node.n, key: node.k, val: env[node.k], env: { ...env } });
      } else if (node.t === "if") {
        let matched = false;
        for (const br of node.br) {
          const condResult = !!br.c(env);
          events.push({ k: "cond", n: br.n, s: br.s, r: condResult, env: { ...env } });
          if (condResult) {
            traceAST(br.b, env, events);
            matched = true;
            break;
          }
        }
        if (!matched && node.els) {
          events.push({ k: "else", n: node.elsN, env: { ...env } });
          traceAST(node.els, env, events);
        }
      } else if (node.t === "for") {
        const rawIter = node.it(env);
        const arr = node.rng
          ? Array.from({ length: Math.max(0, Math.floor(+rawIter || 0)) }, (_, i) => i)
          : Array.from(rawIter);
        if (arr.length > limits.maxLoopRange) {
          throw new PyErr("That’s too many scoops for one bowl! Try a smaller number.");
        }
        arr.forEach((val, idx) => {
          env[node.k] = val;
          events.push({
            k: "loop",
            n: node.n,
            key: node.k,
            val,
            round: idx + 1,
            total: arr.length,
            env: { ...env }
          });
          traceAST(node.b, env, events);
        });
        events.push({ k: "end", n: node.n, env: { ...env } });
      } else if (node.t === "while") {
        let round = 0;
        while (true) {
          const condResult = !!node.c(env);
          round++;
          events.push({ k: "cond", n: node.n, s: node.s, r: condResult, env: { ...env }, w: 1, round });
          if (!condResult) break;
          traceAST(node.b, env, events);
        }
      }
    }
  }

  function registerCommand(commandName, config) {
    if (!commandName) return;
    const name = String(commandName).trim();
    if (!VALID_COMMANDS.includes(name)) {
      VALID_COMMANDS.push(name);
    }
    if (config) {
      commandConfigs[name] = config;
      if (config.actionDescription && window.GraphicsEngine) {
        window.GraphicsEngine.ACTION_DESCRIPTIONS[name] = config.actionDescription;
      }
    }
  }

  // Export module API and global aliases
  window.PythonInterpreter = {
    VALID_COMMANDS,
    PyErr,
    compileExpr,
    parsePython,
    traceAST,
    registerCommand,
    getCommandConfig: name => commandConfigs[name] || null
  };

  window.VALID_COMMANDS = VALID_COMMANDS;
  window.PyErr = PyErr;
  window.compileExpr = compileExpr;
  window.parsePython = parsePython;
  window.traceAST = traceAST;
})(window);
