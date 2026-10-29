/* ==========================================================================
   MODULE: CURRICULUM & LESSON MANAGER
   Provides lesson registry, event hooks, and helpers to easily plug in new modules!
   ========================================================================== */

(function (window) {
  "use strict";

  // Item string helpers used across lesson definitions
  const sc = f => "scoop:" + f;
  const tp = f => "topping:" + f;
  const sa = f => "sauce:" + f;
  const R = (n, f) => Array(n).fill(sc(f));

  const registeredModules = [];
  const allLessons = [];
  const listeners = {
    moduleAdded: [],
    lessonAdded: []
  };

  const Curriculum = {
    // Helpers
    helpers: { sc, tp, sa, R },
    sc,
    tp,
    sa,
    R,

    /**
     * Registers a curriculum module containing a set of lessons and optional extensions.
     * @param {Object} moduleConfig
     * @param {string} moduleConfig.id - Unique ID (e.g., 'basics', 'logic')
     * @param {string} moduleConfig.title - Display title
     * @param {string} [moduleConfig.description] - Module overview
     * @param {Array<Object>} moduleConfig.lessons - Array of lesson objects
     * @param {Array<Object>} [moduleConfig.cheatSheet] - Optional cheat sheet cards for Recipe Book
     * @param {Array<Object>} [moduleConfig.quickKeys] - Optional quick key buttons for toolbar
     * @param {Array<Object>} [moduleConfig.commands] - Optional custom commands to register
     */
    registerModule(moduleConfig) {
      if (!moduleConfig || !Array.isArray(moduleConfig.lessons)) {
        console.warn("Invalid module registration: 'lessons' array is required.", moduleConfig);
        return;
      }

      registeredModules.push(moduleConfig);

      // Register lessons
      moduleConfig.lessons.forEach(lesson => {
        lesson.moduleId = moduleConfig.id;
        allLessons.push(lesson);
        listeners.lessonAdded.forEach(fn => fn(lesson));
      });

      // Register optional module cheat sheet cards
      if (Array.isArray(moduleConfig.cheatSheet) && window.AppConfig) {
        moduleConfig.cheatSheet.forEach(card => window.AppConfig.addCheatSheetCard(card));
      }

      // Register optional module quick keys
      if (Array.isArray(moduleConfig.quickKeys) && window.AppConfig) {
        moduleConfig.quickKeys.forEach(key => window.AppConfig.addQuickKey(key));
      }

      // Register optional custom commands
      if (Array.isArray(moduleConfig.commands) && window.PythonInterpreter) {
        moduleConfig.commands.forEach(cmd => {
          window.PythonInterpreter.registerCommand(cmd.name, cmd);
          if (cmd.flavor && window.GraphicsEngine) {
            window.GraphicsEngine.registerFlavor(cmd.flavor.name, cmd.flavor.palette);
          }
          if (cmd.topping && window.GraphicsEngine) {
            window.GraphicsEngine.registerTopping(cmd.topping.name, cmd.topping.icon, cmd.topping.description);
          }
        });
      }

      listeners.moduleAdded.forEach(fn => fn(moduleConfig));
    },

    /**
     * Registers a single standalone lesson.
     * @param {Object} lesson
     */
    registerLesson(lesson) {
      if (!lesson) return;
      allLessons.push(lesson);
      listeners.lessonAdded.forEach(fn => fn(lesson));
    },

    /**
     * Returns all registered lessons across all modules in sequential order.
     * @returns {Array<Object>}
     */
    getAllLessons() {
      return allLessons;
    },

    /**
     * Returns all registered curriculum modules.
     * @returns {Array<Object>}
     */
    getModules() {
      return registeredModules;
    },

    /**
     * Retrieves a module by its unique ID.
     * @param {string} moduleId
     * @returns {Object|null}
     */
    getModule(moduleId) {
      return registeredModules.find(m => m.id === moduleId) || null;
    },

    /**
     * Retrieves a lesson by its zero-based index.
     * @param {number} index
     * @returns {Object|null}
     */
    getLesson(index) {
      return allLessons[index] || null;
    },

    /**
     * Returns total number of registered lessons.
     * @returns {number}
     */
    getLessonCount() {
      return allLessons.length;
    },

    /**
     * Returns number of challenges (excluding free sandbox modes).
     * @returns {number}
     */
    getChallengeCount() {
      return allLessons.filter(l => !l.free).length;
    },

    /**
     * Subscribe to curriculum lifecycle events.
     * @param {"moduleAdded"|"lessonAdded"} eventName
     * @param {Function} callback
     */
    on(eventName, callback) {
      if (listeners[eventName] && typeof callback === "function") {
        listeners[eventName].push(callback);
      }
    }
  };

  // Expose helpers and Curriculum to window
  window.Curriculum = Curriculum;
  window.sc = sc;
  window.tp = tp;
  window.sa = sa;
  window.R = R;
  window.LESSONS = allLessons;
})(window);
