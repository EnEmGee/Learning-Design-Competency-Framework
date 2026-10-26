(function () {
  "use strict";
  var D = window.DLD;
  var LEVELS = ["Commencing", "Consolidating", "Mastery"];
  var PAGES = [
    ["index.html", "Home"],
    ["matrix.html", "Matrix"],
    ["progression.html", "Progression"],
    ["plan.html", "Plan builder"],
    ["cdf.html", "CDF"],
    ["about.html", "About"]
  ];

  // ---------- helpers ----------
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function role(code) { return D.roles.filter(function (r) { return r.code === code; })[0]; }
  function comp(id) { return D.competencies.filter(function (c) { return c.id === id; })[0]; }
  function cdfByTag(tag) { return D.cdf.filter(function (c) { return c.tag === tag; })[0]; }
  function chip(tag) {
    var c = cdfByTag(tag);
    if (c && c.link) return el("a", { class: "chip", href: c.link, target: "_blank", rel: "noopener", title: "ACU LinkedIn Learning path: " + c.name, text: tag });
    return el("span", { class: "chip", text: tag });
  }
  function levelLabel(i) { return el("span", { class: "level-label lv-" + (i + 1), text: LEVELS[i] }); }

  // ---------- theme ----------
  var saved = store("dld-theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    var dark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store("dld-theme", next);
  }

  // ---------- chrome ----------
  function chrome() {
    var here = location.pathname.split("/").pop() || "index.html";
    var nav = el("nav", { class: "nav", "aria-label": "Main" }, PAGES.map(function (p) {
      var a = el("a", { href: p[0], text: p[1] });
      if (p[0] === here) a.setAttribute("aria-current", "page");
      return a;
    }));
    var btn = el("button", { class: "theme-btn", type: "button", text: "Light / dark" });
    btn.addEventListener("click", toggleTheme);
    var header = el("header", { class: "site-header" }, [
      el("div", { class: "wrap" }, [
        el("a", { class: "brand", href: "index.html", html: "DLD Competency Matrix<small>ACU Online · Digital Learning Design</small>" }),
        nav, btn
      ])
    ]);
    document.body.insertBefore(header, document.body.firstChild);
    document.body.insertBefore(el("a", { class: "skip", href: "#main", text: "Skip to content" }), header);
    document.body.appendChild(el("footer", { class: "site-footer" }, [
      el("div", { class: "wrap", html: "Draft, October 2026. Use alongside your position description and the ACU Capability Development Framework in Progress Plan conversations. Descriptors are drawn from the documents listed on the <a href=\"about.html\">About</a> page." })
    ]));
  }

  // ---------- competency block (matrix) ----------
  function compBlock(c, roleCode) {
    var d = D.descriptors[c.id][roleCode];
    var head = el("div", { class: "comp-head" }, [
      el("div", null, [el("h3", { id: c.id + "-" + roleCode, text: c.name }), el("p", { text: c.summary })]),
      el("div", { class: "tag-row", "aria-label": "CDF capabilities" }, c.cdf.map(chip))
    ]);
    var card = el("section", { class: "card comp", "aria-labelledby": c.id + "-" + roleCode }, [head]);
    if (d.na) {
      card.appendChild(el("div", { class: "na", text: d.na }));
    } else {
      card.appendChild(el("div", { class: "levels" }, d.levels.map(function (t, i) {
        return el("div", { class: "level lv-" + (i + 1) }, [levelLabel(i), el("p", { text: t })]);
      })));
    }
    var dl = el("dl", null, [
      el("dt", { text: "ESSP" }), el("dd", { text: c.essp }),
      el("dt", { text: "Vision 2033" }), el("dd", { text: c.v2033 }),
      el("dt", { text: "Sources" }), el("dd", { text: d.sources }),
      el("dt", { text: "Progression" }), el("dd", null, [el("a", { href: "progression.html?c=" + c.id, text: "See this competency across all roles" })])
    ]);
    card.appendChild(el("div", { class: "comp-foot" }, [el("details", null, [el("summary", { text: "Alignment and sources" }), dl])]));
    return card;
  }

  // ---------- pages ----------
  var pages = {};

  pages.index = function (m) {
    var cards = el("div", { class: "grid grid-4" }, D.roles.map(function (r) {
      return el("a", { class: "card role-card", href: "matrix.html?role=" + r.code }, [
        el("div", { class: "code", text: r.code }),
        el("div", { text: r.title }),
        el("div", { class: "muted small", text: r.hew + " · " + r.cdf })
      ]);
    }));
    m.appendChild(cards);
    m.appendChild(el("h2", { text: "Three levels within each role" }));
    m.appendChild(el("div", { class: "grid grid-3" }, [
      ["Commencing", "New to the role, or meeting its core expectations."],
      ["Consolidating", "Performing the role confidently and independently."],
      ["Mastery", "Performing at the top of the role. Mastery in one role broadly matches Commencing in the next, which is the progression path."]
    ].map(function (x, i) { return el("div", { class: "card lv-" + (i + 1) }, [levelLabel(i), el("p", { text: x[1] })]); })));
    m.appendChild(el("h2", { text: "Ways to use it" }));
    m.appendChild(el("div", { class: "grid grid-3" }, [
      ["matrix.html", "Read the matrix", "All competencies and descriptors for one role, with the CDF capabilities and LinkedIn Learning paths linked to each."],
      ["progression.html", "See the pathway", "One competency traced from ADLD Commencing to LDLD Mastery."],
      ["plan.html", "Build a plan", "Mark where you are, then get goals, CDF links and development resources ready for your Progress Plan."]
    ].map(function (x) { return el("a", { class: "card role-card", href: x[0] }, [el("h3", { text: x[1] }), el("p", { class: "muted", text: x[2] })]); })));
  };

  pages.matrix = function (m) {
    var current = role(param("role")) ? param("role") : "DLD";
    var tabs = el("div", { class: "tabs", role: "tablist", "aria-label": "Role" });
    var filter = el("select", { id: "f-comp" }, [el("option", { value: "", text: "All competencies" })].concat(
      D.competencies.map(function (c) { return el("option", { value: c.id, text: c.name }); })));
    var q = el("input", { type: "search", id: "f-q", placeholder: "e.g. Canvas, AI, mentor" });
    m.appendChild(el("div", { class: "controls no-print" }, [
      el("div", { class: "field" }, [el("span", { text: "Role" }), tabs]),
      el("label", { class: "field", for: "f-comp" }, ["Competency", filter]),
      el("label", { class: "field", for: "f-q" }, ["Search descriptors", q])
    ]));
    var title = el("h2", { id: "role-title" });
    var list = el("div", { id: "comp-list", role: "tabpanel", "aria-labelledby": "role-title" });
    m.appendChild(title); m.appendChild(list);

    function render() {
      var r = role(current);
      title.textContent = r.title + " (" + r.code + ") · " + r.hew + " · " + r.cdf;
      [].forEach.call(tabs.children, function (t) { t.setAttribute("aria-selected", String(t.dataset.code === current)); });
      list.innerHTML = "";
      var term = q.value.trim().toLowerCase(), fc = filter.value, shown = 0;
      D.competencies.forEach(function (c) {
        if (fc && c.id !== fc) return;
        var d = D.descriptors[c.id][current];
        var hay = (c.name + " " + c.summary + " " + (d.levels || []).join(" ") + " " + c.cdf.join(" ")).toLowerCase();
        if (term && hay.indexOf(term) === -1) return;
        list.appendChild(compBlock(c, current)); shown++;
      });
      if (!shown) list.appendChild(el("p", { class: "muted", text: "No competencies match that search." }));
    }
    D.roles.forEach(function (r) {
      var b = el("button", { class: "tab", type: "button", role: "tab", text: r.code, title: r.title });
      b.dataset.code = r.code;
      b.addEventListener("click", function () {
        current = r.code;
        history.replaceState(null, "", "?role=" + r.code);
        render();
      });
      tabs.appendChild(b);
    });
    filter.addEventListener("change", render);
    q.addEventListener("input", render);
    render();
  };

  pages.progression = function (m) {
    var sel = el("select", { id: "p-comp" }, D.competencies.map(function (c) { return el("option", { value: c.id, text: c.name }); }));
    if (comp(param("c"))) sel.value = param("c");
    m.appendChild(el("div", { class: "controls no-print" }, [el("label", { class: "field", for: "p-comp" }, ["Competency", sel])]));
    var out = el("div");
    m.appendChild(out);
    function render() {
      var c = comp(sel.value);
      out.innerHTML = "";
      out.appendChild(el("h2", { text: c.name }));
      out.appendChild(el("p", { class: "muted", text: c.summary }));
      out.appendChild(el("div", { class: "tag-row", style: "margin-bottom:16px" }, c.cdf.map(chip)));
      var ol = el("ol", { class: "ladder" });
      D.roles.forEach(function (r, ri) {
        var d = D.descriptors[c.id][r.code];
        if (d.na) {
          ol.appendChild(el("li", { class: "rung" + (ri ? " role-break" : "") }, [
            el("div", { class: "who", html: r.code + "<small>" + r.hew + "</small>" }),
            el("div", { class: "card muted", text: d.na })
          ]));
          return;
        }
        d.levels.forEach(function (t, i) {
          ol.appendChild(el("li", { class: "rung" + (ri && i === 0 ? " role-break" : "") }, [
            el("div", { class: "who", html: r.code + "<small>" + r.hew + " · " + r.cdf + "</small>" }),
            el("div", { class: "card lv-" + (i + 1) }, [levelLabel(i), el("p", { style: "margin:0", text: t })])
          ]));
        });
      });
      out.appendChild(ol);
    }
    sel.addEventListener("change", function () { history.replaceState(null, "", "?c=" + sel.value); render(); });
    render();
  };

  pages.plan = function (m) {
    var state = store("dld-plan") || { role: "DLD", levels: {} };
    var roleSel = el("select", { id: "pl-role" }, D.roles.map(function (r) { return el("option", { value: r.code, text: r.code + " – " + r.title }); }));
    roleSel.value = state.role;
    m.appendChild(el("div", { class: "notice", text: "Your selections stay in this browser only and are not sent anywhere. Print or copy the summary to bring it to your Progress Plan conversation." }));
    m.appendChild(el("div", { class: "controls no-print" }, [el("label", { class: "field", for: "pl-role" }, ["Your role", roleSel])]));
    var form = el("div", { class: "card no-print" });
    m.appendChild(el("h2", { class: "no-print", text: "1. Where are you now?" }));
    m.appendChild(form);
    m.appendChild(el("h2", { text: "2. Suggested goals for your Progress Plan" }));
    var actions = el("div", { class: "controls no-print" });
    var printBtn = el("button", { class: "btn", type: "button", text: "Print / save as PDF" });
    var copyBtn = el("button", { class: "btn secondary", type: "button", text: "Copy as text" });
    var clearBtn = el("button", { class: "btn secondary", type: "button", text: "Clear selections" });
    var status = el("span", { class: "muted small", role: "status" });
    actions.appendChild(printBtn); actions.appendChild(copyBtn); actions.appendChild(clearBtn); actions.appendChild(status);
    m.appendChild(actions);
    var summary = el("div");
    m.appendChild(summary);

    var opts = [["", "Not assessed"], ["-1", "Not yet Commencing"], ["0", "Commencing"], ["1", "Consolidating"], ["2", "Mastery"]];
    function target(code, cid, lv) {
      var d = D.descriptors[cid][code];
      var idx = D.roles.map(function (r) { return r.code; }).indexOf(code);
      if (lv < 2) return { role: code, level: lv + 1, text: d.levels[lv + 1] };
      var next = D.roles[idx + 1];
      if (next && !D.descriptors[cid][next.code].na) return { role: next.code, level: 0, text: D.descriptors[cid][next.code].levels[0] };
      return null;
    }
    function rows() {
      var code = state.role, out = [];
      D.competencies.forEach(function (c) {
        var d = D.descriptors[c.id][code];
        var v = state.levels[code + ":" + c.id];
        if (d.na || v === undefined || v === "") return;
        var t = target(code, c.id, parseInt(v, 10));
        out.push({ c: c, current: parseInt(v, 10) < 0 ? "Not yet Commencing" : LEVELS[parseInt(v, 10)], t: t });
      });
      return out;
    }
    function renderForm() {
      form.innerHTML = "";
      D.competencies.forEach(function (c) {
        var d = D.descriptors[c.id][state.role];
        if (d.na) return;
        var key = state.role + ":" + c.id;
        var s = el("select", { id: "lv-" + c.id, "aria-label": "Current level for " + c.name }, opts.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
        s.value = state.levels[key] !== undefined ? state.levels[key] : "";
        s.addEventListener("change", function () { state.levels[key] = s.value; store("dld-plan", state); renderSummary(); });
        form.appendChild(el("div", { class: "plan-row" }, [
          el("label", { for: "lv-" + c.id }, [el("strong", { text: c.name })]),
          s,
          el("a", { href: "matrix.html?role=" + state.role + "#" + c.id + "-" + state.role, class: "small", text: "Read descriptors" })
        ]));
      });
    }
    function renderSummary() {
      summary.innerHTML = "";
      var r = rows();
      if (!r.length) { summary.appendChild(el("p", { class: "muted", text: "Select your current level for at least one competency to see suggested goals." })); return; }
      var tbody = el("tbody");
      r.forEach(function (x) {
        var goal = x.t ? el("td", null, [el("div", { class: "small muted", text: x.t.role + " · " + LEVELS[x.t.level] }), el("div", { text: x.t.text })])
                       : el("td", { class: "muted", text: "At the top of this competency. Consider sharing your practice with others." });
        var dev = el("td", null, x.c.cdf.filter(function (t) { return cdfByTag(t) && cdfByTag(t).link; }).map(function (t) {
          return el("div", null, [el("a", { href: cdfByTag(t).link, target: "_blank", rel: "noopener", text: "LinkedIn Learning: " + t })]);
        }));
        tbody.appendChild(el("tr", null, [el("td", null, [el("strong", { text: x.c.name })]), el("td", { text: x.current }), goal, el("td", { text: x.c.cdf.join("; ") }), dev]));
      });
      var table = el("table", null, [el("thead", null, [el("tr", null, ["Competency", "Current", "Goal (next descriptor)", "Linkage to CDF", "Development"].map(function (h) { return el("th", { scope: "col", text: h }); }))]), tbody]);
      summary.appendChild(el("div", { class: "table-scroll" }, [table]));
    }
    roleSel.addEventListener("change", function () { state.role = roleSel.value; store("dld-plan", state); renderForm(); renderSummary(); });
    printBtn.addEventListener("click", function () { window.print(); });
    clearBtn.addEventListener("click", function () {
      Object.keys(state.levels).forEach(function (k) { if (k.indexOf(state.role + ":") === 0) delete state.levels[k]; });
      store("dld-plan", state); renderForm(); renderSummary(); status.textContent = "Cleared.";
    });
    copyBtn.addEventListener("click", function () {
      var lines = ["DLD Competency Matrix – Progress Plan goals (" + state.role + ")", ""];
      rows().forEach(function (x) {
        lines.push(x.c.name + " — current: " + x.current);
        lines.push("  Goal: " + (x.t ? x.t.text + " (" + x.t.role + " " + LEVELS[x.t.level] + ")" : "At the top of this competency."));
        lines.push("  Linkage to CDF: " + x.c.cdf.join("; "));
        x.c.cdf.forEach(function (t) { var cd = cdfByTag(t); if (cd && cd.link) lines.push("  Development: LinkedIn Learning – " + t + " " + cd.link); });
        lines.push("");
      });
      var text = lines.join("\n");
      var done = function () { status.textContent = "Copied."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { status.textContent = "Copy failed – use Print instead."; });
      else status.textContent = "Copy isn't available in this browser – use Print instead.";
    });
    renderForm(); renderSummary();
  };

  pages.cdf = function (m) {
    D.cdf.forEach(function (c) {
      var tagged = D.competencies.filter(function (x) { return x.cdf.indexOf(c.tag) > -1; });
      function list(txt) {
        var parts = txt.split("\n").map(function (s) { return s.replace(/^•\s*/, "").trim(); }).filter(Boolean);
        return el("ul", null, parts.map(function (p) { return el("li", { text: p }); }));
      }
      var linkEl = c.link ? el("a", { class: "btn", href: c.link, target: "_blank", rel: "noopener", text: "ACU LinkedIn Learning path ↗" })
                          : el("span", { class: "muted small", text: "LinkedIn Learning link to be added." });
      m.appendChild(el("section", { class: "card", style: "margin-bottom:16px", "aria-labelledby": "cdf-" + D.cdf.indexOf(c) }, [
        el("div", { class: "comp-head", style: "padding:0" }, [
          el("div", null, [el("div", { class: "muted small", text: c.group }), el("h3", { id: "cdf-" + D.cdf.indexOf(c), text: c.name })]),
          linkEl
        ]),
        el("p", { text: c.definition }),
        el("div", { class: "cdf-grid" }, [
          el("div", null, [el("strong", { text: "Level 1: All staff (ADLD, DLD)" }), list(c.l1)]),
          el("div", null, [el("strong", { text: "Level 2: Management (SDLD, LDLD)" }), list(c.l2)])
        ]),
        el("p", { class: "small" }, [el("strong", { text: "Matrix competencies tagged: " })].concat(
          tagged.length ? tagged.map(function (t, i) { return el("span", null, [i ? ", " : "", el("a", { href: "progression.html?c=" + t.id, text: t.name })]); }) : [el("span", { text: "none" })]))
      ]));
    });
  };

  pages.about = function (m) {
    var tb = el("tbody", null, D.sources.map(function (s) { return el("tr", null, [el("td", null, [el("strong", { text: s.code })]), el("td", { text: s.doc }), el("td", { text: s.note })]); }));
    m.appendChild(el("h2", { text: "Source documents" }));
    m.appendChild(el("p", { text: "Every descriptor cites the documents it is drawn from, using these codes." }));
    m.appendChild(el("div", { class: "table-scroll" }, [el("table", null, [el("thead", null, [el("tr", null, ["Code", "Document", "Notes"].map(function (h) { return el("th", { scope: "col", text: h }); }))]), tb])]));
    m.appendChild(el("h2", { text: "What changed from the 2024 draft" }));
    var tb2 = el("tbody", null, D.competencies.map(function (c) { return el("tr", null, [el("td", null, [el("strong", { text: c.name })]), el("td", { text: c.change })]); }));
    m.appendChild(el("div", { class: "table-scroll" }, [el("table", null, [el("thead", null, [el("tr", null, ["Competency", "Change"].map(function (h) { return el("th", { scope: "col", text: h }); }))]), tb2])]));
  };

  // ---------- boot ----------
  document.addEventListener("DOMContentLoaded", function () {
    chrome();
    var page = document.body.getAttribute("data-page");
    var m = document.getElementById("app");
    if (pages[page] && m) pages[page](m);
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  });
})();
