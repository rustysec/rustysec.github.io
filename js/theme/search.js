zolaTheme.search = {

  init: function ({ scripts, arg }) {
    this.SearchFiles = scripts
    this.ElWrapper = document.querySelector(arg.w)
    this.ElInput = document.querySelector(arg.i)
    this.ElResults = document.querySelector(arg.r)
    this.ready = null
    this.timer = null
    this.ElInput.addEventListener("input", this.onInput.bind(this))
    this.ElInput.addEventListener("keydown", this.onKeydown.bind(this))
  },

  toggle: function () {
    if (this.ElWrapper.classList.contains("hidden")) {
      this.ElWrapper.classList.remove("hidden")
      this.ElInput.focus()
    } else {
      this.close()
    }
    return true
  },

  close: function () {
    this.ElWrapper.classList.add("hidden")
    this.ElInput.value = ""
    this.ElResults.replaceChildren()
  },

  onKeydown: function (event) {
    if (event.key === "Escape") {
      event.preventDefault()
      this.close()
    } else if (event.key === "Enter") {
      event.preventDefault()
    }
  },

  onInput: function () {
    const q = this.ElInput.value.trim()
    if (!q) {
      this.ElResults.replaceChildren()
      return
    }
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.run(q), 120)
  },

  // Load the search index once; resolve when `this.index` is ready.
  prepare: function () {
    if (this.ready) {
      return this.ready
    }
    if ("undefined" === typeof (searchIndex) && "undefined" === typeof (elasticlunr)) {
      this.render([[["Search: Please wait..."]]])
      this.ready = Promise.all(this.SearchFiles.map(this.loadScript))
        .then(() => {
          this.index = elasticlunr.Index.load(window.searchIndex)
        })
        .catch((error) => {
          this.render([[["Search file not found: ", { code: error }]]])
        })
    } else {
      this.ready = Promise.resolve().then(() => {
        this.index = elasticlunr.Index.load(window.searchIndex)
      })
    }
    return this.ready
  },

  run: function (q) {
    if (this.index) {
      this.act(q)
      return
    }
    this.render([[["Search: Please wait..."]]])
    this.prepare().then(() => {
      if (!this.index) {
        return
      }
      const current = this.ElInput.value.trim()
      if (current) {
        this.act(current)
      }
    })
  },

  act: function (q) {
    const results = this.index.search(q)
    const resultsCount = results.length
    const rows = []
    if (resultsCount > 0) {
      const countText = " search " + (resultsCount === 1 ? "result" : "results") + " for "
      rows.push([{ strong: String(resultsCount) }, countText, { code: q }, ":"])
      for (let i = 0; i < resultsCount; i++) {
        const result = results[i]
        rows.push([{ link: result.ref, text: result.doc.title }])
      }
    } else {
      rows.push(["No search results for ", { code: q }, "."])
    }
    this.render(rows)
  },

  // Render result rows into the results list. Each row is an array of
  // segments: a plain string is text, { code } is <code>, { strong } is
  // <strong>, and { link, text } is a link. All text is assigned via
  // textContent, so user or index data can never inject markup.
  render: function (rows) {
    this.ElResults.replaceChildren()
    for (const row of rows) {
      const li = document.createElement("li")
      for (const segment of row) {
        if (segment && typeof segment === "object") {
          if (segment.link !== undefined) {
            const a = document.createElement("a")
            a.href = segment.link
            a.textContent = segment.text
            li.append(a)
          } else if (segment.code !== undefined) {
            const code = document.createElement("code")
            code.textContent = segment.code
            li.append(code)
          } else if (segment.strong !== undefined) {
            const strong = document.createElement("strong")
            strong.textContent = segment.strong
            li.append(strong)
          }
        } else {
          li.append(segment)
        }
      }
      this.ElResults.append(li)
    }
    this.ElResults.scrollIntoViewIfNeeded()
  },

  loadScript: (fileName) => new Promise((resolve, reject) => {
      const newScript = document.createElement("script")
      newScript.onload = () => resolve(fileName)
      newScript.onerror = () => reject(fileName)
      newScript.async = true
      newScript.src = fileName
      document.head.append(newScript)
    }),

}
