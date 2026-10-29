/* ==========================================================================
   MODULE: VECTOR GRAPHICS & SVG FACTORY
   Generates rich vector scoops, drizzles, bowls, and Bear expressions.
   Extensible: Register custom flavors, toppings, sauces & item renderers.
   ========================================================================== */

(function (window) {
  "use strict";

  const FLAVOR_COLORS = {
    vanilla:    { base: "#fff3b0", shade: "#f3d57c", chip: "#d4a359" },
    strawberry: { base: "#ff8fab", shade: "#fb6f92", chip: "#ffe5ec" },
    mango:      { base: "#ffbe0b", shade: "#fb8500", chip: "#fff" },
    mint:       { base: "#72efdd", shade: "#48bfe3", chip: "#3d2214" },
    chocolate:  { base: "#7f4f24", shade: "#582f0e", chip: "#3d2214" },
    blueberry:  { base: "#8388ff", shade: "#5e60ce", chip: "#e0e1dd" },
    caramel:    { base: "#d48c46", shade: "#a45c1c", chip: "#fff3b0" }
  };

  const TOPPING_ICONS = {
    nuts: "🥜",
    sprinkles: "✨",
    cherry: "🍒"
  };

  const ACTION_DESCRIPTIONS = {
    scoop: "a creamy scoop lands in the bowl! 🍨",
    topping: "a crunchy topping sprinkles on top! ✨",
    sauce: "sweet sauce drizzles over the scoop! 🍫"
  };

  // Custom Item Renderers Registry: commandName -> function(argument) -> HTMLElement
  const customRenderers = {};

  /**
   * Generates a pleasant deterministic pastel color for unlisted custom flavors.
   */
  function generateFallbackPalette(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return {
      base: `hsl(${h}, 85%, 82%)`,
      shade: `hsl(${h}, 80%, 70%)`,
      chip: `hsl(${h}, 60%, 45%)`
    };
  }

  function getFlavorPalette(flavor) {
    if (!flavor) return { base: "#e2e8f0", shade: "#cbd5e1", chip: "#94a3b8" };
    const key = String(flavor).toLowerCase().trim();
    return FLAVOR_COLORS[key] || generateFallbackPalette(key);
  }

  function createBowlBaseSVG() {
    const wrap = document.createElement("div");
    wrap.className = "cup-svg-wrap";
    wrap.innerHTML = `
      <svg viewBox="0 0 110 54" width="100%" height="100%">
        <!-- Bowl Rim -->
        <ellipse cx="55" cy="10" rx="48" ry="8" fill="#ffffff" stroke="#e11d48" stroke-width="3"/>
        <!-- Bowl Body -->
        <path d="M10 10 C14 42, 96 42, 100 10 Z" fill="#ffe4e6" stroke="#e11d48" stroke-width="3"/>
        <!-- Cute Stripes -->
        <path d="M30 15 L36 33 M55 17 L55 36 M80 15 L74 33" stroke="#fb7185" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Bowl Foot -->
        <rect x="36" y="36" width="38" height="9" rx="4.5" fill="#fb7185" stroke="#e11d48" stroke-width="2.5"/>
      </svg>`;
    return wrap;
  }

  function createScoopSVG(flavor) {
    const pal = getFlavorPalette(flavor);
    const div = document.createElement("div");
    div.className = "scoop-item";
    div.title = "scoop: " + flavor;
    div.innerHTML = `
      <svg viewBox="0 0 80 46" width="100%" height="100%">
        <!-- Main Dome -->
        <path d="M8 34 C8 6, 72 6, 72 34 C76 34, 78 42, 70 42 C63 42, 60 37, 54 41 C47 44, 33 44, 26 41 C20 37, 17 42, 10 42 C2 42, 4 34, 8 34 Z"
              fill="${pal.base}" stroke="#3d2214" stroke-width="2.5"/>
        <!-- Gloss Highlight -->
        <path d="M22 18 Q34 11 48 15" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity="0.75"/>
        <!-- Flavor Specks -->
        <circle cx="28" cy="26" r="2" fill="${pal.chip}"/>
        <circle cx="52" cy="24" r="2.2" fill="${pal.chip}"/>
        <circle cx="40" cy="31" r="1.8" fill="${pal.chip}"/>
      </svg>`;
    return div;
  }

  function createSauceSVG(flavor) {
    const pal = getFlavorPalette(flavor || "chocolate");
    const div = document.createElement("div");
    div.className = "sauce-item";
    div.title = "sauce: " + flavor;
    div.innerHTML = `
      <svg viewBox="0 0 76 22" width="100%" height="100%">
        <path d="M6 6 Q38 0 70 6 Q72 14 66 14 Q60 14 58 9 Q50 21 44 21 Q38 21 36 10 Q26 19 20 19 Q14 19 12 10 Q4 14 6 6 Z"
              fill="${pal.base}" stroke="#3d2214" stroke-width="2"/>
      </svg>`;
    return div;
  }

  function createToppingElement(toppingName) {
    const d = document.createElement("div");
    d.className = "topping-item";
    d.textContent = TOPPING_ICONS[toppingName] || "⭐";
    d.title = "topping: " + toppingName;
    return d;
  }

  /**
   * Unified item renderer - renders any action into an HTMLElement.
   */
  function renderItemNode(cmd, arg) {
    if (customRenderers[cmd]) {
      return customRenderers[cmd](arg);
    }
    if (cmd === "scoop") {
      return createScoopSVG(arg);
    } else if (cmd === "topping") {
      return createToppingElement(arg);
    } else if (cmd === "sauce") {
      return createSauceSVG(arg);
    }
    // Generic fallback for any other command
    const d = document.createElement("div");
    d.className = "topping-item";
    d.textContent = "✨";
    d.title = `${cmd}: ${arg}`;
    return d;
  }

  function setBearMood(mood) {
    const g = document.getElementById("bear-face-expr");
    const svg = document.getElementById("bear-svg");
    if (!g || !svg) return;
    svg.classList.toggle("bear-bounce", mood === "happy");

    if (mood === "happy") {
      g.innerHTML = `
        <path d="M39 52 Q45 45 51 52" fill="none" stroke="#2b1708" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M69 52 Q75 45 81 52" fill="none" stroke="#2b1708" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M50 69 Q60 82 70 69 Z" fill="#e11d48" stroke="#3d2214" stroke-width="2.5"/>`;
    } else if (mood === "thinking") {
      g.innerHTML = `
        <circle cx="45" cy="50" r="4.5" fill="#2b1708"/>
        <circle cx="46.5" cy="48.5" r="1.5" fill="#fff"/>
        <circle cx="75" cy="50" r="4.5" fill="#2b1708"/>
        <circle cx="76.5" cy="48.5" r="1.5" fill="#fff"/>
        <circle cx="63" cy="73" r="4" fill="#3d2214"/>`;
    } else if (mood === "oops") {
      g.innerHTML = `
        <circle cx="45" cy="52" r="4.5" fill="#2b1708"/>
        <circle cx="75" cy="52" r="4.5" fill="#2b1708"/>
        <path d="M52 75 Q60 69 68 75" fill="none" stroke="#3d2214" stroke-width="3" stroke-linecap="round"/>`;
    } else {
      // Default friendly smile
      g.innerHTML = `
        <circle cx="45" cy="52" r="4.5" fill="#2b1708"/>
        <circle cx="43.5" cy="50.5" r="1.5" fill="#fff"/>
        <circle cx="75" cy="52" r="4.5" fill="#2b1708"/>
        <circle cx="73.5" cy="50.5" r="1.5" fill="#fff"/>
        <path d="M53 71 Q60 77 67 71" fill="none" stroke="#3d2214" stroke-width="3" stroke-linecap="round"/>`;
    }
  }

  // Extensibility APIs for future modules
  function registerFlavor(name, palette) {
    if (name && palette) {
      FLAVOR_COLORS[name.toLowerCase()] = palette;
    }
  }

  function registerTopping(name, icon, description) {
    if (name && icon) {
      TOPPING_ICONS[name.toLowerCase()] = icon;
      if (description) {
        ACTION_DESCRIPTIONS["topping"] = description;
      }
    }
  }

  function registerSauce(name, palette, description) {
    if (name && palette) {
      FLAVOR_COLORS[name.toLowerCase()] = palette;
      if (description) {
        ACTION_DESCRIPTIONS["sauce"] = description;
      }
    }
  }

  function registerItemRenderer(commandName, rendererFn) {
    if (commandName && typeof rendererFn === "function") {
      customRenderers[commandName] = rendererFn;
    }
  }

  // Export module API and global aliases
  window.GraphicsEngine = {
    FLAVOR_COLORS,
    TOPPING_ICONS,
    ACTION_DESCRIPTIONS,
    createBowlBaseSVG,
    createScoopSVG,
    createSauceSVG,
    createToppingElement,
    renderItemNode,
    setBearMood,
    registerFlavor,
    registerTopping,
    registerSauce,
    registerItemRenderer
  };

  window.FLAVOR_COLORS = FLAVOR_COLORS;
  window.TOPPING_ICONS = TOPPING_ICONS;
  window.ACTION_DESCRIPTIONS = ACTION_DESCRIPTIONS;
  window.createBowlBaseSVG = createBowlBaseSVG;
  window.createScoopSVG = createScoopSVG;
  window.createSauceSVG = createSauceSVG;
  window.setBearMood = setBearMood;
})(window);
