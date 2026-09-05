
if (undefined == window.zolaTheme) {
  window.zolaTheme = {}
}
// Dracola — Dracula is the only color scheme, so the `.dark` class is always
// applied and the light/dark toggle (localStorage, prefers-color-scheme) is
// gone. The public API surface is kept so other modules (menu, mermaid) and
// optional user scripts keep working.
zolaTheme.color = {
  Key: "theme-color-scheme",
  DarkPrefName: "dark",
  LightPrefName: "light",
  DarkClass: "dark",
  EventName: "set-theme",

  init: function () {
    this.HtmlClass = document.documentElement.classList
    this.HtmlClass.add(this.DarkClass)
    this.HtmlClass.remove("not-ready")
  },

  // No-op: kept for compatibility with optional user scripts.
  toggle: () => true,

  // No-op: kept for compatibility with optional user scripts.
  select: ({ par }) => {
    if (undefined != par) {
      par.removeAttribute("open")
    }
  },

  reset: () => {
  },
}

zolaTheme.color.init()
