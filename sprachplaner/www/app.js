(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const r of document.querySelectorAll('link[rel="modulepreload"]')) c(r);
  new MutationObserver((r) => {
    for (const i of r)
      if (i.type === "childList")
        for (const a of i.addedNodes)
          a.tagName === "LINK" && a.rel === "modulepreload" && c(a);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(r) {
    const i = {};
    return (
      r.integrity && (i.integrity = r.integrity),
      r.referrerPolicy && (i.referrerPolicy = r.referrerPolicy),
      r.crossOrigin === "use-credentials"
        ? (i.credentials = "include")
        : r.crossOrigin === "anonymous"
          ? (i.credentials = "omit")
          : (i.credentials = "same-origin"),
      i
    );
  }
  function c(r) {
    if (r.ep) return;
    r.ep = !0;
    const i = n(r);
    fetch(r.href, i);
  }
})();
/*! Capacitor: https://capacitorjs.com/ - MIT License */ var J;
(function (e) {
  ((e.Unimplemented = "UNIMPLEMENTED"), (e.Unavailable = "UNAVAILABLE"));
})(J || (J = {}));
class ze extends Error {
  constructor(t, n, c) {
    (super(t), (this.message = t), (this.code = n), (this.data = c));
  }
}
const Dt = (e) => {
    var t, n;
    return e?.androidBridge
      ? "android"
      : !(
            (n =
              (t = e?.webkit) === null || t === void 0
                ? void 0
                : t.messageHandlers) === null || n === void 0
          ) && n.bridge
        ? "ios"
        : "web";
  },
  Lt = (e) => {
    const t = e.CapacitorCustomPlatform || null,
      n = e.Capacitor || {},
      c = (n.Plugins = n.Plugins || {}),
      r = () => (t !== null ? t.name : Dt(e)),
      i = () => r() !== "web",
      a = (u) => {
        const g = d.get(u);
        return !!(g?.platforms.has(r()) || s(u));
      },
      s = (u) => {
        var g;
        return (g = n.PluginHeaders) === null || g === void 0
          ? void 0
          : g.find((f) => f.name === u);
      },
      o = (u) => e.console.error(u),
      d = new Map(),
      l = (u, g = {}) => {
        const f = d.get(u);
        if (f)
          return (
            console.warn(
              `Capacitor plugin "${u}" already registered. Cannot register plugins twice.`,
            ),
            f.proxy
          );
        const b = r(),
          w = s(u);
        let k;
        const p = async () => (
            !k && b in g
              ? (k =
                  typeof g[b] == "function" ? (k = await g[b]()) : (k = g[b]))
              : t !== null &&
                !k &&
                "web" in g &&
                (k =
                  typeof g.web == "function"
                    ? (k = await g.web())
                    : (k = g.web)),
            k
          ),
          m = (E, P) => {
            var R, N;
            if (w) {
              const H = w?.methods.find((O) => P === O.name);
              if (H)
                return H.rtype === "promise"
                  ? (O) => n.nativePromise(u, P.toString(), O)
                  : (O, ce) => n.nativeCallback(u, P.toString(), O, ce);
              if (E)
                return (R = E[P]) === null || R === void 0 ? void 0 : R.bind(E);
            } else {
              if (E)
                return (N = E[P]) === null || N === void 0 ? void 0 : N.bind(E);
              throw new ze(
                `"${u}" plugin is not implemented on ${b}`,
                J.Unimplemented,
              );
            }
          },
          y = (E) => {
            let P;
            const R = (...N) => {
              const H = p().then((O) => {
                const ce = m(O, E);
                if (ce) {
                  const de = ce(...N);
                  return ((P = de?.remove), de);
                } else
                  throw new ze(
                    `"${u}.${E}()" is not implemented on ${b}`,
                    J.Unimplemented,
                  );
              });
              return (E === "addListener" && (H.remove = async () => P()), H);
            };
            return (
              (R.toString = () => `${E.toString()}() { [capacitor code] }`),
              Object.defineProperty(R, "name", {
                value: E,
                writable: !1,
                configurable: !1,
              }),
              R
            );
          },
          M = y("addListener"),
          _ = y("removeListener"),
          j = (E, P) => {
            const R = M({ eventName: E }, P),
              N = async () => {
                const O = await R;
                _({ eventName: E, callbackId: O }, P);
              },
              H = new Promise((O) => R.then(() => O({ remove: N })));
            return (
              (H.remove = async () => {
                (console.warn(
                  "Using addListener() without 'await' is deprecated.",
                ),
                  await N());
              }),
              H
            );
          },
          ee = new Proxy(
            {},
            {
              get(E, P) {
                switch (P) {
                  case "$$typeof":
                    return;
                  case "toJSON":
                    return () => ({});
                  case "addListener":
                    return w ? j : M;
                  case "removeListener":
                    return _;
                  default:
                    return y(P);
                }
              },
            },
          );
        return (
          (c[u] = ee),
          d.set(u, {
            name: u,
            proxy: ee,
            platforms: new Set([...Object.keys(g), ...(w ? [b] : [])]),
          }),
          ee
        );
      };
    return (
      n.convertFileSrc || (n.convertFileSrc = (u) => u),
      (n.getPlatform = r),
      (n.handleError = o),
      (n.isNativePlatform = i),
      (n.isPluginAvailable = a),
      (n.registerPlugin = l),
      (n.Exception = ze),
      (n.DEBUG = !!n.DEBUG),
      (n.isLoggingEnabled = !!n.isLoggingEnabled),
      n
    );
  },
  Et = (e) => (e.Capacitor = Lt(e)),
  X = Et(
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
        ? self
        : typeof window < "u"
          ? window
          : typeof global < "u"
            ? global
            : {},
  ),
  Ne = X.registerPlugin;
class He {
  constructor() {
    ((this.listeners = {}),
      (this.retainedEventArguments = {}),
      (this.windowListeners = {}));
  }
  addListener(t, n) {
    let c = !1;
    (this.listeners[t] || ((this.listeners[t] = []), (c = !0)),
      this.listeners[t].push(n));
    const i = this.windowListeners[t];
    (i && !i.registered && this.addWindowListener(i),
      c && this.sendRetainedArgumentsForEvent(t));
    const a = async () => this.removeListener(t, n);
    return Promise.resolve({ remove: a });
  }
  async removeAllListeners() {
    this.listeners = {};
    for (const t in this.windowListeners)
      this.removeWindowListener(this.windowListeners[t]);
    this.windowListeners = {};
  }
  notifyListeners(t, n, c) {
    const r = this.listeners[t];
    if (!r) {
      if (c) {
        let i = this.retainedEventArguments[t];
        (i || (i = []), i.push(n), (this.retainedEventArguments[t] = i));
      }
      return;
    }
    r.forEach((i) => i(n));
  }
  hasListeners(t) {
    var n;
    return !!(!((n = this.listeners[t]) === null || n === void 0) && n.length);
  }
  registerWindowListener(t, n) {
    this.windowListeners[n] = {
      registered: !1,
      windowEventName: t,
      pluginEventName: n,
      handler: (c) => {
        this.notifyListeners(n, c);
      },
    };
  }
  unimplemented(t = "not implemented") {
    return new X.Exception(t, J.Unimplemented);
  }
  unavailable(t = "not available") {
    return new X.Exception(t, J.Unavailable);
  }
  async removeListener(t, n) {
    const c = this.listeners[t];
    if (!c) return;
    const r = c.indexOf(n);
    (this.listeners[t].splice(r, 1),
      this.listeners[t].length ||
        this.removeWindowListener(this.windowListeners[t]));
  }
  addWindowListener(t) {
    (window.addEventListener(t.windowEventName, t.handler),
      (t.registered = !0));
  }
  removeWindowListener(t) {
    t &&
      (window.removeEventListener(t.windowEventName, t.handler),
      (t.registered = !1));
  }
  sendRetainedArgumentsForEvent(t) {
    const n = this.retainedEventArguments[t];
    n &&
      (delete this.retainedEventArguments[t],
      n.forEach((c) => {
        this.notifyListeners(t, c);
      }));
  }
}
const Ke = (e) =>
    encodeURIComponent(e)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape),
  Ve = (e) => e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
class _t extends He {
  async getCookies() {
    const t = document.cookie,
      n = {};
    return (
      t.split(";").forEach((c) => {
        if (c.length <= 0) return;
        let [r, i] = c.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
        ((r = Ve(r).trim()), (i = Ve(i).trim()), (n[r] = i));
      }),
      n
    );
  }
  async setCookie(t) {
    try {
      const n = Ke(t.key),
        c = Ke(t.value),
        r = t.expires ? `; expires=${t.expires.replace("expires=", "")}` : "",
        i = (t.path || "/").replace("path=", ""),
        a = t.url != null && t.url.length > 0 ? `domain=${t.url}` : "";
      document.cookie = `${n}=${c || ""}${r}; path=${i}; ${a};`;
    } catch (n) {
      return Promise.reject(n);
    }
  }
  async deleteCookie(t) {
    try {
      document.cookie = `${t.key}=; Max-Age=0`;
    } catch (n) {
      return Promise.reject(n);
    }
  }
  async clearCookies() {
    try {
      const t = document.cookie.split(";") || [];
      for (const n of t)
        document.cookie = n
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    } catch (t) {
      return Promise.reject(t);
    }
  }
  async clearAllCookies() {
    try {
      await this.clearCookies();
    } catch (t) {
      return Promise.reject(t);
    }
  }
}
Ne("CapacitorCookies", { web: () => new _t() });
const zt = async (e) =>
    new Promise((t, n) => {
      const c = new FileReader();
      ((c.onload = () => {
        const r = c.result;
        t(r.indexOf(",") >= 0 ? r.split(",")[1] : r);
      }),
        (c.onerror = (r) => n(r)),
        c.readAsDataURL(e));
    }),
  Pt = (e = {}) => {
    const t = Object.keys(e);
    return Object.keys(e)
      .map((r) => r.toLocaleLowerCase())
      .reduce((r, i, a) => ((r[i] = e[t[a]]), r), {});
  },
  Ct = (e, t = !0) =>
    e
      ? Object.entries(e)
          .reduce((c, r) => {
            const [i, a] = r;
            let s, o;
            return (
              Array.isArray(a)
                ? ((o = ""),
                  a.forEach((d) => {
                    ((s = t ? encodeURIComponent(d) : d), (o += `${i}=${s}&`));
                  }),
                  o.slice(0, -1))
                : ((s = t ? encodeURIComponent(a) : a), (o = `${i}=${s}`)),
              `${c}&${o}`
            );
          }, "")
          .substr(1)
      : null,
  Tt = (e, t = {}) => {
    const n = Object.assign(
        { method: e.method || "GET", headers: e.headers },
        t,
      ),
      r = Pt(e.headers)["content-type"] || "";
    if (typeof e.data == "string") n.body = e.data;
    else if (r.includes("application/x-www-form-urlencoded")) {
      const i = new URLSearchParams();
      for (const [a, s] of Object.entries(e.data || {})) i.set(a, s);
      n.body = i.toString();
    } else if (
      r.includes("multipart/form-data") ||
      e.data instanceof FormData
    ) {
      const i = new FormData();
      if (e.data instanceof FormData)
        e.data.forEach((s, o) => {
          i.append(o, s);
        });
      else for (const s of Object.keys(e.data)) i.append(s, e.data[s]);
      n.body = i;
      const a = new Headers(n.headers);
      (a.delete("content-type"), (n.headers = a));
    } else
      (r.includes("application/json") || typeof e.data == "object") &&
        (n.body = JSON.stringify(e.data));
    return n;
  };
class Mt extends He {
  async request(t) {
    const n = Tt(t, t.webFetchExtra),
      c = Ct(t.params, t.shouldEncodeUrlParams),
      r = c ? `${t.url}?${c}` : t.url,
      i = await fetch(r, n),
      a = i.headers.get("content-type") || "";
    let { responseType: s = "text" } = i.ok ? t : {};
    a.includes("application/json") && (s = "json");
    let o, d;
    switch (s) {
      case "arraybuffer":
      case "blob":
        ((d = await i.blob()), (o = await zt(d)));
        break;
      case "json":
        o = await i.json();
        break;
      case "document":
      case "text":
      default:
        o = await i.text();
    }
    const l = {};
    return (
      i.headers.forEach((u, g) => {
        l[g] = u;
      }),
      { data: o, headers: l, status: i.status, url: i.url }
    );
  }
  async get(t) {
    return this.request(Object.assign(Object.assign({}, t), { method: "GET" }));
  }
  async post(t) {
    return this.request(
      Object.assign(Object.assign({}, t), { method: "POST" }),
    );
  }
  async put(t) {
    return this.request(Object.assign(Object.assign({}, t), { method: "PUT" }));
  }
  async patch(t) {
    return this.request(
      Object.assign(Object.assign({}, t), { method: "PATCH" }),
    );
  }
  async delete(t) {
    return this.request(
      Object.assign(Object.assign({}, t), { method: "DELETE" }),
    );
  }
}
Ne("CapacitorHttp", { web: () => new Mt() });
const Ot = "modulepreload",
  xt = function (e, t) {
    return new URL(e, t).href;
  },
  Ye = {},
  At = function (t, n, c) {
    let r = Promise.resolve();
    if (n && n.length > 0) {
      let a = function (l) {
        return Promise.all(
          l.map((u) =>
            Promise.resolve(u).then(
              (g) => ({ status: "fulfilled", value: g }),
              (g) => ({ status: "rejected", reason: g }),
            ),
          ),
        );
      };
      const s = document.getElementsByTagName("link"),
        o = document.querySelector("meta[property=csp-nonce]"),
        d = o?.nonce || o?.getAttribute("nonce");
      r = a(
        n.map((l) => {
          if (((l = xt(l, c)), l in Ye)) return;
          Ye[l] = !0;
          const u = l.endsWith(".css"),
            g = u ? '[rel="stylesheet"]' : "";
          if (!!c)
            for (let w = s.length - 1; w >= 0; w--) {
              const k = s[w];
              if (k.href === l && (!u || k.rel === "stylesheet")) return;
            }
          else if (document.querySelector(`link[href="${l}"]${g}`)) return;
          const b = document.createElement("link");
          if (
            ((b.rel = u ? "stylesheet" : Ot),
            u || (b.as = "script"),
            (b.crossOrigin = ""),
            (b.href = l),
            d && b.setAttribute("nonce", d),
            document.head.appendChild(b),
            u)
          )
            return new Promise((w, k) => {
              (b.addEventListener("load", w),
                b.addEventListener("error", () =>
                  k(new Error(`Unable to preload CSS for ${l}`)),
                ));
            });
        }),
      );
    }
    function i(a) {
      const s = new Event("vite:preloadError", { cancelable: !0 });
      if (((s.payload = a), window.dispatchEvent(s), !s.defaultPrevented))
        throw a;
    }
    return r.then((a) => {
      for (const s of a || []) s.status === "rejected" && i(s.reason);
      return t().catch(i);
    });
  },
  x = Ne("SpeechRecognition", {
    web: () =>
      At(() => Promise.resolve().then(() => zn), void 0, import.meta.url).then(
        (e) => new e.SpeechRecognitionWeb(),
      ),
  }),
  Ze = new Set(
    `
milch eier ei butter brot brötchen semmeln käse joghurt quark sahne schmand margarine mehl zucker salz pfeffer
öl olivenöl rapsöl essig nudeln spaghetti penne reis kartoffeln zwiebeln knoblauch tomaten gurke gurken paprika
möhren karotten salat spinat brokkoli blumenkohl zucchini aubergine pilze champignons lauch porree sellerie kohl
rotkohl weißkohl radieschen kürbis mais bete ingwer petersilie basilikum schnittlauch dill
äpfel apfel birnen bananen banane orangen orange zitronen zitrone limetten trauben erdbeeren himbeeren blaubeeren
kirschen pflaumen pfirsiche kiwi mango ananas melone avocado datteln feigen rosinen
fleisch hackfleisch hähnchen hühnchen hähnchenbrust schnitzel steak wurst würstchen bratwurst schinken salami
speck lachs fisch thunfisch garnelen forelle tofu
wasser saft apfelsaft orangensaft cola limo limonade bier wein sekt prosecco kaffee tee kakao tonic
müsli haferflocken cornflakes marmelade konfitüre honig nutella schokolade kekse chips nüsse mandeln erdnüsse
popcorn eis pizza pommes ketchup senf mayo mayonnaise soße sauce suppe brühe linsen bohnen erbsen
toast toastbrot aufschnitt frischkäse mozzarella parmesan gouda feta camembert tomatenmark backpulver
vanillezucker hefe wraps tortillas couscous bulgur hummus gewürze curry paprikapulver zimt
spülmittel waschmittel weichspüler shampoo duschgel zahnpasta zahnbürste seife toilettenpapier klopapier
küchenrolle taschentücher müllbeutel müllsäcke tabs batterien glühbirnen windeln tierfutter katzenfutter
hundefutter katzenstreu deo rasierer tampons binden watte pflaster zeitung blumen kerzen servietten
backpapier alufolie frischhaltefolie gefrierbeutel kaugummi bonbons gummibärchen cracker salzstangen
`
      .split(/\s+/)
      .filter(Boolean),
  ),
  Rt = new Set(
    `
bio frisch frische frischer frisches rot rote roter rotes grün grüne grüner grünes gelb gelbe gelber weiß weiße
weißer weißes braun braune brauner saure saurer süße süßer süßes stilles stille laktosefreie laktosefreier
fettarme fettarmer fettarmes vollfett mageres magerer kleine kleiner kleines große großer großes reife reifer
geräucherte geräucherter geräuchertes gemischte gemischter gemischtes griechischer griechische italienischer
normale normaler zarte zarter dunkle dunkler helle heller glutenfreie glutenfreier vegane veganer
`
      .split(/\s+/)
      .filter(Boolean),
  ),
  Oe = new Set(
    `
liter l ml milliliter kilo kg kilogramm g gramm pfund packung packungen pack päckchen stück stücke flasche
flaschen dose dosen becher bund tüte tüten glas gläser kasten kisten paket pakete netz schale schalen rolle
rollen tafel tafeln sack säcke beutel
`
      .split(/\s+/)
      .filter(Boolean),
  ),
  Y = {
    ein: 1,
    eine: 1,
    einen: 1,
    einem: 1,
    zwei: 2,
    drei: 3,
    vier: 4,
    fünf: 5,
    sechs: 6,
    sieben: 7,
    acht: 8,
    neun: 9,
    zehn: 10,
    elf: 11,
    zwölf: 12,
  },
  ot = new Set(["halbe", "halbes", "halben", "halber"]),
  It = new Set([
    "für",
    "mit",
    "von",
    "vom",
    "aus",
    "ohne",
    "zum",
    "zur",
    "im",
    "in",
    "auf",
    "bei",
    "nach",
    "zu",
  ]),
  Bt = new Set(
    `
der die das den dem dann noch auch mal bitte etwas einmal außerdem ach also so ja okay ok halt eben
ich brauche brauchen muss müssen will möchte kaufen einkaufen besorgen holen mir uns wir
`
      .split(/\s+/)
      .filter(Boolean),
  ),
  Ut = (e) => /^\p{Lu}/u.test(e),
  jt = (e) => e && e.charAt(0).toUpperCase() + e.slice(1);
function Nt(e) {
  const t = "\\p{L}",
    n = (c) => `(?<!${t})(?:${c})(?!${t})`;
  return (" " + e + " ")
    .replace(
      new RegExp(
        `(?:auf|in|zu|zur|an|für)\\s+(?:die|der|meine|meiner|unsere|deine|dieser)?\\s*[${t}-]*liste`,
        "giu",
      ),
      " ",
    )
    .replace(
      new RegExp(
        n(
          "erstell(?:e|st|en)?|anleg(?:e|st|en)?|füg(?:e|st|en)?|hinzu|dazu|setz(?:e|t|en)?|schreib(?:e|st|en)?|pack(?:e|st)?|trag(?:e|st)?|leg(?:e|st)?|notier(?:e|st|en)?|nimm|nehm(?:e|st|en)?",
        ),
        "giu",
      ),
      " ",
    )
    .replace(
      new RegExp(
        n(
          "bitte|ich|mir|uns|wir|brauche|brauchen|muss|müssen|will|möchte|noch|auch|außerdem|unbedingt|kaufen|einkaufen|besorgen|holen|ein",
        ),
        "giu",
      ),
      " ",
    )
    .replace(/[.:!?;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function Ht(e) {
  const t = [];
  for (let n = 0; n < e.length; n++) {
    const c = e[n],
      r = c.toLowerCase();
    if (ot.has(r)) t.push("½");
    else if (r in Y && Oe.has((e[n + 1] || "").toLowerCase()))
      t.push(String(Y[r]));
    else if (
      r in Y &&
      r !== "ein" &&
      r !== "eine" &&
      r !== "einen" &&
      r !== "einem"
    )
      t.push(String(Y[r]));
    else {
      if (["ein", "eine", "einen", "einem"].includes(r)) continue;
      t.push(c);
    }
  }
  return jt(t.join(" ").trim());
}
function xe(e) {
  const t = [],
    n = e
      .replace(/\s+/g, " ")
      .trim()
      .split(/\s*,\s*|\s+und\s+|\s+sowie\s+|\s+außerdem\s+|\s+plus\s+/i);
  for (const c of n) {
    const r = c.split(" ").filter(Boolean);
    let i = null,
      a = [],
      s = !1;
    const o = () => {
      (i && i.length && t.push(Ht(i)), (i = null));
    };
    for (const d of r) {
      const l = d.replace(/^[„"“'(]+|[„"“'.)]+$/g, "");
      if (!l) continue;
      const u = l.toLowerCase();
      if ((s && Ze.has(u) && (s = !1), s && i)) {
        i.push(l);
        continue;
      }
      if (Bt.has(u) && !(u in Y)) continue;
      if (It.has(u) && i) {
        (i.push(l), (s = !0));
        continue;
      }
      if (/^\d+([.,]\d+)?$/.test(l) || u in Y || ot.has(u)) {
        (i && !Oe.has((i[i.length - 1] || "").toLowerCase()) && o(), a.push(l));
        continue;
      }
      if (Oe.has(u) && a.length) {
        a.push(l);
        continue;
      }
      if (Rt.has(u)) {
        (i && !a.length && o(), a.push(l));
        continue;
      }
      if (Ze.has(u) || Ut(l)) {
        (o(), (i = [...a, l]), (a = []));
        continue;
      }
      i ? i.push(l) : ((i = [...a, l]), (a = []));
    }
    (a.length && (i ? i.push(...a) : (i = a)), o());
  }
  return t.filter(Boolean);
}
function lt(e) {
  return xe(Nt(e));
}
const ct = {
    sonntag: 0,
    montag: 1,
    dienstag: 2,
    mittwoch: 3,
    donnerstag: 4,
    freitag: 5,
    samstag: 6,
    sonnabend: 6,
  },
  dt = {
    januar: 0,
    jänner: 0,
    februar: 1,
    märz: 2,
    maerz: 2,
    april: 3,
    mai: 4,
    juni: 5,
    juli: 6,
    august: 7,
    september: 8,
    oktober: 9,
    november: 10,
    dezember: 11,
  },
  ut = {
    ein: 1,
    einem: 1,
    eins: 1,
    zwei: 2,
    drei: 3,
    vier: 4,
    fünf: 5,
    sechs: 6,
    sieben: 7,
    acht: 8,
    neun: 9,
    zehn: 10,
    elf: 11,
    zwölf: 12,
  },
  qt = {
    früh: 7,
    morgens: 8,
    vormittags: 10,
    mittags: 12,
    nachmittags: 15,
    abends: 19,
    abend: 19,
    nachts: 22,
  },
  te = Object.keys(ut).join("|"),
  Ft = Object.keys(dt).join("|"),
  Wt = Object.keys(ct).join("|"),
  ne = (e) =>
    e == null
      ? null
      : ((e = String(e).toLowerCase()),
        /^\d+$/.test(e) ? Number(e) : (ut[e] ?? null)),
  ft = (e) => e && e.charAt(0).toUpperCase() + e.slice(1),
  me = "\\p{L}",
  $e = (e) => `(?<!${me})(?:${e})(?!${me})`,
  Gt = new RegExp(`\\s([${me}-]*liste)(?=\\s)`, "iu"),
  Kt = new RegExp(
    $e(
      "erstell(?:e|st|en)?|anleg(?:e|st|en)?|neue[rns]?|mach(?:e|st|en)?|leg(?:e|st)?",
    ),
    "iu",
  ),
  Vt = new RegExp(
    `${$e("füg(?:e|st|en)?|hinzu|setz(?:e|t|en)?|schreib(?:e|st|en)?|pack(?:e|st)?|trag(?:e|st)?")}|(?:auf|in|zu|zur|an)\\s+(?:die|der|meine|meiner|unsere|deine)?\\s*[${me}-]*liste`,
    "iu",
  ),
  Yt = new RegExp($e("einkaufen|kaufen|besorgen"), "iu"),
  Je = new RegExp(
    $e(
      "erstell(?:e|st|en)?|anleg(?:e|st|en)?|leg(?:e|st)?|mach(?:e|st|en)?|neue[rns]?|bitte|mir|uns|ich|muss|musst|soll|sollte|will|noch|auch|einkaufen|kaufen|besorgen|füg(?:e|st|en)?|hinzu|setz(?:e|t|en)?|schreib(?:e|st|en)?|pack(?:e|st)?|trag(?:e|st)?|ein|eine|einen|auf|in|zu|zur|zum|an|am|den|die|der|das|mit|dass|dazu|unbedingt|für|von|meine|meiner",
    ),
    "giu",
  );
function Zt(e, t) {
  const n = Gt.exec(e);
  if (n) {
    const c = Kt.test(e) ? "create" : Vt.test(e) ? "add" : "create",
      r = e
        .replace(n[0], " ")
        .replace(Je, " ")
        .replace(/[.:\-]/g, " "),
      i = n[1].replace(/^-+/, "");
    return { mode: c, title: ft(i.toLowerCase()), items: xe(r) };
  }
  if (!t && Yt.test(e)) {
    const c = xe(e.replace(Je, " ").replace(/[.:\-]/g, " "));
    if (c.length >= 2)
      return { mode: "create", title: "Einkaufsliste", items: c };
  }
  return null;
}
function Jt(e, t = new Date()) {
  const n = (e || "").trim();
  let c = " " + n.replace(/[,!?;]/g, " ").replace(/\s+/g, " ") + " ";
  const r = (m) => {
      const y = m.exec(c);
      return (
        y && (c = c.slice(0, y.index) + " " + c.slice(y.index + y[0].length)),
        y
      );
    },
    i = new Date(t.getFullYear(), t.getMonth(), t.getDate()),
    a = (m, y) => {
      const M = new Date(m);
      return (M.setDate(M.getDate() + y), M);
    };
  let s = null,
    o;
  if ((o = r(/\s(übermorgen|morgen|heute)(?=\s)/i))) {
    const m = o[1].toLowerCase();
    s = a(i, m === "heute" ? 0 : m === "morgen" ? 1 : 2);
  } else if (
    (o = r(
      new RegExp(
        `\\sin\\s+(\\d+|${te})\\s+(tagen|tag|wochen|woche)(?=\\s)`,
        "i",
      ),
    ))
  ) {
    const m = ne(o[1]);
    s = a(i, /woche/i.test(o[2]) ? m * 7 : m);
  } else if (
    (o = r(/\s(?:am\s+|den\s+)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})?(?=\s)/i))
  ) {
    let m = o[3] ? Number(o[3]) : i.getFullYear();
    (m < 100 && (m += 2e3),
      (s = new Date(m, Number(o[2]) - 1, Number(o[1]))),
      !o[3] && s < i && (s = new Date(m + 1, Number(o[2]) - 1, Number(o[1]))));
  } else if (
    (o = r(
      new RegExp(
        `\\s(?:am\\s+|den\\s+)?(\\d{1,2})\\.?\\s+(${Ft})(?:\\s+(\\d{4}))?(?=\\s)`,
        "i",
      ),
    ))
  ) {
    let m = o[3] ? Number(o[3]) : i.getFullYear();
    const y = dt[o[2].toLowerCase()];
    ((s = new Date(m, y, Number(o[1]))),
      !o[3] && s < i && (s = new Date(m + 1, y, Number(o[1]))));
  } else if (
    (o = r(
      new RegExp(
        `\\s(?:(?:am|nächsten|nächste|kommenden|kommende)\\s+)*(${Wt})(?=\\s)`,
        "i",
      ),
    ))
  ) {
    const y = (ct[o[1].toLowerCase()] - i.getDay() + 7) % 7 || 7;
    s = a(i, y);
  }
  const d = r(/\s(?:für\s+|auf\s+)?(?:am|den)\s+(\d{1,2})\.(?=\s)/i);
  if (d && !s) {
    const m = Number(d[1]);
    m >= 1 &&
      m <= 31 &&
      ((s = new Date(i.getFullYear(), i.getMonth(), m)),
      s < i && (s = new Date(i.getFullYear(), i.getMonth() + 1, m)));
  }
  let l = null,
    u = 0;
  if (
    (o = r(
      new RegExp(
        `\\s(?:um\\s+)?halb\\s+(\\d{1,2}|${te})(?:\\s+uhr)?(?=\\s)`,
        "i",
      ),
    ))
  ) {
    const m = ne(o[1]);
    ((l = m === 1 ? 12 : m - 1), (u = 30));
  } else if (
    (o = r(
      new RegExp(
        `\\s(?:um\\s+)?dreiviertel\\s+(\\d{1,2}|${te})(?:\\s+uhr)?(?=\\s)`,
        "i",
      ),
    ))
  ) {
    const m = ne(o[1]);
    ((l = m === 1 ? 12 : m - 1), (u = 45));
  } else if (
    (o = r(
      new RegExp(
        `\\s(?:um\\s+)?viertel\\s+(nach|vor)\\s+(\\d{1,2}|${te})(?:\\s+uhr)?(?=\\s)`,
        "i",
      ),
    ))
  ) {
    const m = ne(o[2]);
    o[1].toLowerCase() === "nach"
      ? ((l = m), (u = 15))
      : ((l = m === 1 ? 12 : m - 1), (u = 45));
  } else
    (o = r(/\s(?:um\s+)?(\d{1,2}):(\d{2})(?:\s*uhr)?(?=\s)/i)) ||
    (o = r(/\s(?:um\s+)?(\d{1,2})\.(\d{2})\s*uhr(?=\s)/i))
      ? ((l = Number(o[1])), (u = Number(o[2])))
      : (o = r(
            new RegExp(
              `\\s(?:um\\s+)?(\\d{1,2}|${te})\\s+uhr(?:\\s+(\\d{1,2}))?(?=\\s)`,
              "i",
            ),
          ))
        ? ((l = ne(o[1])), (u = o[2] ? Number(o[2]) : 0))
        : (o = r(/\sum\s+(\d{1,2})(?=\s)/i)) && (l = Number(o[1]));
  let g = null;
  (o = r(
    /\s(früh|morgens|vormittags|mittags|nachmittags|abends|abend|nachts)(?=\s)/i,
  )) && (g = o[1].toLowerCase());
  let f = !1;
  (l != null && l <= 24 && u < 60
    ? ((f = !0),
      (((g === "nachmittags" || g === "abends" || g === "abend") && l < 12) ||
        (!g && l >= 1 && l <= 5)) &&
        (l += 12),
      l === 24 && (l = 0))
    : g && ((l = qt[g]), (u = 0), (f = !0)),
    f &&
      !s &&
      (s =
        new Date(i.getFullYear(), i.getMonth(), i.getDate(), l, u) <= t
          ? a(i, 1)
          : i));
  let b = null;
  s &&
    (b = new Date(
      s.getFullYear(),
      s.getMonth(),
      s.getDate(),
      f ? l : 0,
      f ? u : 0,
    ));
  const w = Zt(c, f);
  if (w)
    return {
      kind: "list",
      mode: w.mode,
      title: w.title,
      date: s ? new Date(s.getFullYear(), s.getMonth(), s.getDate()) : null,
      allDay: !0,
      items: w.items,
    };
  const k = !!b || /\btermin\b/i.test(n);
  k && !b && (b = new Date(i));
  let p = c.replace(/\s+/g, " ").trim();
  return (
    (p = p
      .replace(
        /\b(bitte|eintragen|trag(?:e)?(?: mir| uns)?(?: bitte)?(?: ein)?|erinner(?:e)?(?: mich| mir)?(?: bitte)?(?: daran| an)?|neuer termin|neue notiz|neue aufgabe|termin|notiz|aufgabe|to-?do|schreib(?: auf)?|ich habe|ich hab|ich muss|dass)\b/gi,
        " ",
      )
      .replace(/\s+/g, " ")
      .trim()),
    (p = p
      .replace(/^(?:(?:ein|einen|eine|an|am|um|für|dass|:|-)\s+)+/i, "")
      .replace(/(?:\s+(?:ein|an|am|um|für|auf|den))+$/i, "")
      .replace(/^[:\-\s]+|[:\-\s]+$/g, "")
      .trim()),
    p || (p = n),
    (p = ft(p)),
    { kind: k ? "event" : "task", title: p, date: b, allDay: k ? !f : !1 }
  );
}
const qe = "sp_local_v1",
  q = () => {
    const raw = localStorage.getItem(qe);
    if (raw === null) return { users: {}, data: {}, session: null };
    const db = JSON.parse(raw);
    if (
      !db ||
      typeof db.users !== "object" ||
      !db.users ||
      typeof db.data !== "object" ||
      !db.data
    ) {
      throw new Error(
        "Gespeicherte Daten konnten nicht gelesen werden. Bitte die App-Daten nicht löschen.",
      );
    }
    return db;
  },
  ue = (db) => {
    try {
      localStorage.setItem(qe, JSON.stringify(db));
    } catch {
      throw new Error(
        "Speichern fehlgeschlagen. Bitte freien Gerätespeicher prüfen.",
      );
    }
  },
  Xe = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2);
async function Qe(e) {
  try {
    const t = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode("sp:" + e),
    );
    return Array.from(new Uint8Array(t))
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "plain:" + e;
  }
}
function Qt() {
  const e = new Set(),
    t = (a) => {
      const s = a.session,
        o = s && Object.values(a.users).find((d) => d.id === s);
      return o ? { user: { id: o.id, email: o.email } } : null;
    },
    n = (a) => {
      const s = t(q());
      e.forEach((o) => o(a, s));
    },
    c = (a, s) => {
      var o;
      return (o = a.data)[s] ?? (o[s] = []);
    },
    r = (a) => {
      const s = {
        _eq: null,
        _in: null,
        order() {
          return s;
        },
        in(o, d) {
          return ((s._in = d), s);
        },
        eq(o, d) {
          return ((s._eq = [o, d]), s);
        },
        then(o, d) {
          return Promise.resolve()
            .then(() => a(s))
            .catch((error) => ({ error: { message: error.message } }))
            .then(o, d);
        },
      };
      return s;
    },
    i = (a) => {
      const s = q(),
        o = t(s);
      if (!o) return { error: { message: "Nicht angemeldet." } };
      const d = a(s, c(s, o.user.id), o.user.id);
      return (ue(s), d);
    };
  return {
    from() {
      return {
        select: () =>
          r(() =>
            i((a, s) => ({ data: s.map((o) => ({ ...o })), error: null })),
          ),
        insert: (a) =>
          r(() =>
            i((s, o, d) => {
              const l = (Array.isArray(a) ? a : [a]).map((u) => ({
                id: Xe(),
                done: !1,
                created_at: new Date().toISOString(),
                starts_at: null,
                all_day: !1,
                user_id: d,
                ...u,
              }));
              return ((s.data[d] = [...l, ...o]), { error: null });
            }),
          ),
        update: (a) =>
          r((s) =>
            i(
              (o, d, l) => (
                (o.data[l] = d.map((u) =>
                  u.id === s._eq[1] ? { ...u, ...a } : u,
                )),
                { error: null }
              ),
            ),
          ),
        delete: () =>
          r((a) =>
            i((s, o, d) => {
              const l = a._in ?? [a._eq[1]];
              return (
                (s.data[d] = o.filter(
                  (u) => !l.includes(u.id) && !l.includes(u.parent_id),
                )),
                { error: null }
              );
            }),
          ),
      };
    },
    auth: {
      onAuthStateChange(a) {
        return (
          e.add(a),
          setTimeout(() => a("INITIAL_SESSION", t(q())), 0),
          { data: { subscription: { unsubscribe: () => e.delete(a) } } }
        );
      },
      async signUp({ email: a, password: s }) {
        const o = q();
        if (o.users[a])
          return { data: {}, error: { message: "User already registered" } };
        const d = { id: Xe(), email: a, pw: await Qe(s) };
        ((o.users[a] = d), (o.session = d.id), ue(o), n("SIGNED_IN"));
        const l = t(q());
        return { data: { session: l, user: l.user }, error: null };
      },
      async signInWithPassword({ email: a, password: s }) {
        const o = q(),
          d = o.users[a];
        if (!d || d.pw !== (await Qe(s)))
          return { data: {}, error: { message: "Invalid login credentials" } };
        ((o.session = d.id), ue(o), n("SIGNED_IN"));
        const l = t(q());
        return { data: { session: l, user: l.user }, error: null };
      },
      async signOut() {
        const a = q();
        return ((a.session = null), ue(a), n("SIGNED_OUT"), { error: null });
      },
    },
  };
}
const en = "mailinator.com",
  Ae = !0,
  h = (e, t = document) => t.querySelector(e),
  z = (e) =>
    String(e ?? "").replace(
      /[&<>"']/g,
      (t) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[t],
    ),
  ge = (e) => String(e).padStart(2, "0"),
  K = (e) => `${e.getFullYear()}-${ge(e.getMonth() + 1)}-${ge(e.getDate())}`,
  Fe = (e) => `${ge(e.getHours())}:${ge(e.getMinutes())}`,
  A = {
    cal: '<svg viewBox="0 0 24 24"><path d="M7 2.5v3M17 2.5v3M3.5 9.5h17M5 4.5h14A1.5 1.5 0 0 1 20.5 6v13a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L20 7"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5v3"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>',
    out: '<svg viewBox="0 0 24 24"><path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9M15 8l4 4-4 4M19 12H9"/></svg>',
  };
let et;
function v(e) {
  const t = h("#toast");
  ((t.textContent = e),
    t.classList.add("show"),
    clearTimeout(et),
    (et = setTimeout(() => t.classList.remove("show"), 3200)));
}
let D = null,
  pe = null,
  be = null,
  $ = [],
  W = "events",
  we = !1;
const Re = h("#app"),
  Se = () => document.getElementById("phone") || document.body;
let tt = null;
function tn() {
  ht();
}
function ht() {
  (clearInterval(tt), (tt = null));
}
document.addEventListener("visibilitychange", () => {
  !document.hidden && pe && be === "app" && !Ae && B();
});
function nn(e) {
  ((pe = e), (be = "app"), on(), setTimeout(B, 0), tn());
}
function sn() {
  ((D = Qt()),
    D.auth.onAuthStateChange((e, t) => {
      const n = t?.user?.id ?? null;
      if (!(n === pe && (n ? "app" : "auth") === be)) {
        if (n) return nn(n);
        (ht(), (pe = null), (be = "auth"), ($ = []), Ie());
      }
    }));
}
const mt = (e) => e.trim().toLowerCase(),
  rn = (e) => /^[a-z0-9._-]{3,20}$/.test(mt(e)),
  nt = (e) => `${mt(e)}@${en}`,
  st = (e) => {
    const t = (e?.message || "").toLowerCase();
    return t.includes("invalid login")
      ? "Benutzername oder Passwort stimmt nicht."
      : t.includes("already registered") ||
          t.includes("already been registered")
        ? "Dieser Benutzername ist schon vergeben."
        : t.includes("rate limit") ||
            t.includes("too many") ||
            t.includes("security purposes")
          ? "Zu viele Versuche. Bitte warte kurz und probiere es dann nochmal."
          : t.includes("failed to fetch") || t.includes("network")
            ? "Keine Verbindung. Bitte prüfe dein Internet."
            : t.includes("email") && t.includes("invalid")
              ? "Registrierung nicht möglich: Der Server lehnt die interne Adresse ab (siehe LOGIN_DOMAIN in src/config.js)."
              : e?.message || "Etwas ist schiefgelaufen.";
  },
  Pe = (e) => h(`#${e}`).value.trim();
async function an(e, t) {
  e.disabled = !0;
  try {
    await t();
  } catch (error) {
    v(error.message);
  } finally {
    e.disabled = !1;
  }
}
function Ie(e = "login", t = {}) {
  const n =
      '<div class="hint">Lokales Profil: Deine Daten bleiben auf diesem Gerät. Keine Cloud-Synchronisierung. Das Profil ist kein verschlüsselter Datentresor.</div>',
    c = (o = "") =>
      `<label class="field"><span>Benutzername</span><input id="user" type="text" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" value="${z(o)}" /></label>`,
    r = (o, d, l) =>
      `<label class="field"><span>${d}</span><input id="${o}" type="password" autocomplete="${l}" /></label>`,
    i = (o, d) => `<div class="logo">${A.mic}</div><h1>${o}</h1><p>${d}</p>`,
    a = {
      login: `${i("Willkommen zurück", "Melde dich mit deinem Benutzernamen an. Deine Termine und Listen bleiben auf diesem Gerät.")}
      ${c(t.user)}${r("pw", "Passwort", "current-password")}
      <button class="btn" id="go">Anmelden</button>
      <button class="link" id="to-signup">Noch kein Konto? Registrieren</button>`,
      signup: `${i("Konto erstellen", "Wähle einen Benutzernamen und ein Passwort. Eine E-Mail brauchst du nicht.")}
      ${c(t.user)}${r("pw", "Passwort (mind. 6 Zeichen)", "new-password")}${r("pw2", "Passwort wiederholen", "new-password")}
      <button class="btn" id="go">Konto erstellen</button>
      <button class="link" id="to-login">Schon ein Konto? Anmelden</button>
      <div class="hint">Merke dir das Passwort gut: Ohne E-Mail kann es nicht zurückgesetzt werden.</div>`,
    };
  Re.innerHTML = `<div class="center">${a[e]}${n}</div>`;
  const s = (o, d) => {
    const l = h(`#${o}`);
    l && (l.onclick = d);
  };
  (s("to-login", () => Ie("login", { user: Pe("user") })),
    s("to-signup", () => Ie("signup", { user: Pe("user") })),
    s("go", () =>
      an(h("#go"), async () => {
        const o = Pe("user"),
          d = h("#pw").value;
        if (e === "login") {
          if (!o || !d) return v("Bitte Benutzername und Passwort eingeben.");
          const { error: g } = await D.auth.signInWithPassword({
            email: nt(o),
            password: d,
          });
          g && v(st(g));
          return;
        }
        if (!rn(o))
          return v(
            "Benutzername: 3–20 Zeichen, nur Buchstaben a–z, Zahlen, Punkt, Strich und Unterstrich.",
          );
        if (d.length < 6)
          return v("Das Passwort braucht mindestens 6 Zeichen.");
        if (d !== h("#pw2").value)
          return v("Die beiden Passwörter sind nicht gleich.");
        const { data: l, error: u } = await D.auth.signUp({
          email: nt(o),
          password: d,
        });
        if (u) return v(st(u));
        l.session ||
          v(
            "Registrierung noch nicht fertig: In Supabase muss „Confirm email“ ausgeschaltet sein.",
          );
      }),
    ));
}
function on() {
  ((Re.innerHTML = `
    <header class="top"><h1 id="title"></h1><button class="icon-btn" id="add" aria-label="Eintrag erstellen">+</button><button class="icon-btn" id="logout" aria-label="Abmelden">${A.out}</button></header>
    <main id="view"></main>
    <nav class="tabs">
      <button class="tab" data-tab="events">${A.cal}<span>Termine</span></button>
      <button class="fab" id="mic" aria-label="Einsprechen">${A.mic}</button>
      <button class="tab" data-tab="tasks">${A.check}<span>To-dos &amp; Listen</span></button>
    </nav>`),
    Re.querySelectorAll(".tab").forEach(
      (e) =>
        (e.onclick = () => {
          ((W = e.dataset.tab), U());
        }),
    ),
    (h("#add").onclick = () => Le({})),
    (h("#mic").onclick = () => $t()),
    (h("#logout").onclick = async () => {
      (await D.auth.signOut(), ($ = []));
    }),
    h("#view").addEventListener("click", fn),
    U());
}
async function B() {
  const { data: e, error: t } = await D.from("items")
    .select("*")
    .order("created_at", { ascending: !1 });
  if (t) return v("Laden fehlgeschlagen: " + t.message);
  (($ = e), U());
}
function G(e) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const n = Math.round(
    (new Date(e.getFullYear(), e.getMonth(), e.getDate()) - t) / 864e5,
  );
  return n === 0
    ? "Heute"
    : n === 1
      ? "Morgen"
      : n === -1
        ? "Gestern"
        : e.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          });
}
function ln(e, t) {
  const n = new Date(e.starts_at),
    c = e.all_day
      ? '<div class="time all">ganztägig</div>'
      : `<div class="time">${Fe(n)}</div>`;
  return `<div class="card${t ? " past" : ""}" data-id="${e.id}" data-act="edit">${c}<div class="grow"><div class="t">${z(e.title)}</div></div></div>`;
}
function cn() {
  const e = new Date();
  e.setHours(0, 0, 0, 0);
  const t = $.filter((a) => a.kind === "event" && a.starts_at).sort(
      (a, s) => new Date(a.starts_at) - new Date(s.starts_at),
    ),
    n = t.filter((a) => new Date(a.starts_at) >= e),
    c = t.filter((a) => new Date(a.starts_at) < e).reverse(),
    r = (a, s) => {
      let o = "",
        d = "";
      for (const l of a) {
        const u = new Date(l.starts_at),
          g = K(u);
        (g !== d &&
          ((o += `<div class="day${s ? " past" : ""}">${z(G(u))}</div>`),
          (d = g)),
          (o += ln(l, s)));
      }
      return o;
    };
  let i = n.length
    ? r(n, !1)
    : '<div class="empty"><div class="big">📅</div>Noch keine Termine.<br />Tippe auf das Mikrofon und sag z. B.<br /><b>„Zahnarzt morgen 15 Uhr“</b></div>';
  return (
    c.length &&
      ((i += `<button class="more" data-act="past">${we ? "Vergangene ausblenden" : `Vergangene anzeigen (${c.length})`}</button>`),
      we && (i += r(c, !0))),
    i
  );
}
const gt = () => {
    const e = new Date();
    return (e.setHours(0, 0, 0, 0), e);
  },
  se = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (e) =>
          (
            e ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (e / 4)))
          ).toString(16),
        ),
  De = (e) =>
    $.filter((t) => t.kind === "item" && t.parent_id === e).sort((t, n) =>
      String(t.created_at).localeCompare(String(n.created_at)),
    );
function dn(e) {
  const t = De(e.id),
    n = t.filter((s) => s.done).length,
    c = e.starts_at ? new Date(e.starts_at) : null,
    r = c
      ? `<div class="time">${c.getDate()}.${c.getMonth() + 1}.</div>`
      : '<div class="time all">Liste</div>',
    i = t.length ? `${n} von ${t.length} erledigt` : "Noch leer",
    a = t.length
      ? `<div class="bar"><i style="width:${Math.round((n / t.length) * 100)}%"></i></div>`
      : "";
  return `
    <div class="card" data-id="${e.id}" data-act="openlist">
      ${r}
      <div class="grow"><div class="t">${z(e.title)}</div><div class="s">${z(i)}${c ? " · " + z(G(c)) : ""}</div>${a}</div>
      <span class="chev">›</span>
    </div>`;
}
function un() {
  const e = $.filter((a) => a.kind === "list").sort((a, s) =>
      a.starts_at && s.starts_at
        ? new Date(a.starts_at) - new Date(s.starts_at)
        : a.starts_at
          ? -1
          : s.starts_at
            ? 1
            : String(s.created_at).localeCompare(String(a.created_at)),
    ),
    t = $.filter((a) => a.kind === "task"),
    n = t.filter((a) => !a.done),
    c = t.filter((a) => a.done),
    r = (a) => `
    <div class="card${a.done ? " done" : ""}" data-id="${a.id}">
      <button class="check" data-act="toggle" aria-label="Abhaken">${A.check}</button>
      <button class="grow" data-act="edit"><div class="t">${z(a.title)}</div></button>
    </div>`;
  if (!t.length && !e.length)
    return '<div class="empty"><div class="big">✅</div>Noch nichts zu erledigen.<br />Sag z. B. <b>„Milch kaufen“</b><br />oder <b>„Erstelle eine Einkaufsliste für morgen“</b></div>';
  let i = "";
  return (
    e.length && (i += '<div class="day">Listen</div>' + e.map(dn).join("")),
    t.length && (i += '<div class="day">To-dos</div>' + n.map(r).join("")),
    c.length && (i += '<div class="day">Erledigt</div>' + c.map(r).join("")),
    i
  );
}
function U() {
  h("#view") &&
    ((h("#title").textContent = W === "events" ? "Termine" : "To-dos & Listen"),
    document
      .querySelectorAll(".tab")
      .forEach((e) => e.classList.toggle("active", e.dataset.tab === W)),
    (h("#view").innerHTML = W === "events" ? cn() : un()),
    pt());
}
async function fn(e) {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  const n = t.dataset.act;
  if (n === "past") return ((we = !we), U());
  const c = t.closest("[data-id]")?.dataset.id,
    r = $.find((i) => i.id === c);
  if (r) {
    if (n === "openlist") return ve(c);
    if (n === "edit") return Le({ item: r });
    if (n === "toggle") {
      ((r.done = !r.done), U());
      const { error: i } = await D.from("items")
        .update({ done: r.done })
        .eq("id", c);
      i && (v(i.message), B());
    }
  }
}
let C = null,
  F = null;
function ve(e) {
  F = e;
  {
    const t = $.find((n) => n.id === e);
    t && t.kind === "list" && (Z = { id: e, at: Date.now() });
  }
  (C ||
    ((C = document.createElement("div")),
    (C.className = "detail"),
    C.addEventListener("click", hn),
    C.addEventListener("submit", mn),
    Se().appendChild(C)),
    pt());
}
function We() {
  (C?.remove(), (C = null), (F = null));
}
function pt() {
  if (!C) return;
  const e = $.find((d) => d.id === F);
  if (!e) return We();
  const t = De(e.id),
    n = t.filter((d) => !d.done),
    c = t.filter((d) => d.done),
    r = e.starts_at ? new Date(e.starts_at) : null,
    i = (d) => `
    <div class="card${d.done ? " done" : ""}" data-id="${d.id}">
      <button class="check" data-d="toggle" aria-label="Abhaken">${A.check}</button>
      <div class="grow"><div class="t">${z(d.title)}</div></div>
      <button class="x" data-d="del" aria-label="Entfernen">×</button>
    </div>`,
    a = C.querySelector("#d-new")?.value ?? "",
    s = document.activeElement?.id === "d-new";
  C.innerHTML = `
    <header class="dtop">
      <button class="icon-btn" data-d="back" aria-label="Zurück">${A.back}</button>
      <div class="dtitle">
        <h2>${z(e.title)}</h2>
        <div class="s">${r ? z(/^(Heute|Morgen|Gestern)$/.test(G(r)) ? G(r) + " · " + r.toLocaleDateString("de-DE", { day: "numeric", month: "long" }) : G(r)) : "Ohne Datum"}</div>
      </div>
      <button class="icon-btn" data-d="edit" aria-label="Liste bearbeiten">${A.edit}</button>
    </header>
    <div class="dbody">
      ${t.length ? n.map(i).join("") : '<div class="empty"><div class="big">🛒</div>Die Liste ist noch leer.<br />Tippe unten auf das Mikrofon und sag z. B. <b>„Milch, Eier, Butter“</b><br />oder tippe einen Punkt ein.</div>'}
      ${c.length ? '<div class="day">Erledigt</div>' + c.map(i).join("") : ""}
    </div>
    <form class="dadd" id="d-form">
      <input id="d-new" type="text" placeholder="Neuer Punkt …" autocomplete="off" />
      <button class="micbtn" type="button" data-d="dictate" aria-label="Punkte einsprechen">${A.mic}</button>
      <button class="add" type="submit" aria-label="Hinzufügen">+</button>
    </form>`;
  const o = C.querySelector("#d-new");
  ((o.value = a), s && o.focus());
}
async function hn(e) {
  const t = e.target.closest("[data-d]");
  if (!t) return;
  const n = t.dataset.d;
  if (n === "back") return We();
  if (n === "dictate") return $t(F);
  if (n === "edit") return Le({ item: $.find((i) => i.id === F) });
  const c = t.closest("[data-id]")?.dataset.id,
    r = $.find((i) => i.id === c);
  if (r) {
    if (n === "toggle") {
      ((r.done = !r.done), U());
      const { error: i } = await D.from("items")
        .update({ done: r.done })
        .eq("id", c);
      i && (v(i.message), B());
    } else if (n === "del") {
      (($ = $.filter((a) => a.id !== c)), U());
      const { error: i } = await D.from("items").delete().eq("id", c);
      i && (v(i.message), B());
    }
  }
}
async function mn(e) {
  e.preventDefault();
  const t = C.querySelector("#d-new"),
    n = t.value.trim();
  if (!n || !F) return;
  t.value = "";
  const c = n.charAt(0).toUpperCase() + n.slice(1),
    { error: r } = await D.from("items").insert({
      kind: "item",
      parent_id: F,
      title: c,
      created_at: new Date().toISOString(),
    });
  if (r) {
    (v(r.message), (t.value = n));
    return;
  }
  (await B(), C?.querySelector("#d-new")?.focus());
}
function bt(e, t, n) {
  const c = e.filter(
    (a) => a.title.toLowerCase() === (t.title || "").toLowerCase(),
  );
  if (!c.length) return "new";
  if (n?.date) {
    const a = K(n.date),
      s = c.find((o) => o.starts_at && K(new Date(o.starts_at)) === a);
    if (s) return s.id;
  }
  const r = gt(),
    i = c
      .filter((a) => a.starts_at && new Date(a.starts_at) >= r)
      .sort((a, s) => new Date(a.starts_at) - new Date(s.starts_at));
  return i.length
    ? i[0].id
    : [...c].sort((a, s) =>
        String(s.created_at).localeCompare(String(a.created_at)),
      )[0].id;
}
function Le({ item: e = null, transcript: t = "", parsed: n = null }) {
  const c = new Date(),
    r = new Date(c.getFullYear(), c.getMonth(), c.getDate()),
    i = $.filter((f) => f.kind === "list").sort((f, b) =>
      String(f.starts_at ?? "9").localeCompare(String(b.starts_at ?? "9")),
    ),
    a = e?.kind ?? n?.kind ?? "task",
    s = {
      kind: a,
      title: e?.title ?? n?.title ?? "",
      date: e?.starts_at ? new Date(e.starts_at) : (n?.date ?? c),
      allDay: e ? e.all_day : (n?.allDay ?? !1),
      hasDate: e
        ? !!e.starts_at
        : !!n?.date || (a === "list" && n?.mode !== "add"),
      target: "new",
    };
  (!e &&
    !n?.date &&
    (s.date =
      a === "list"
        ? r
        : new Date(
            c.getFullYear(),
            c.getMonth(),
            c.getDate(),
            c.getHours() + 1,
            0,
          )),
    !e && a === "list" && n?.mode === "add" && (s.target = bt(i, s, n)));
  const o = e
      ? e.kind === "list"
        ? []
        : [
            ["event", "Termin"],
            ["task", "To-do"],
          ]
      : [
          ["event", "Termin"],
          ["task", "To-do"],
          ["list", "Liste"],
        ],
    d = (f) => {
      const b = f.starts_at ? new Date(f.starts_at) : null;
      return `${f.title} · ${b ? b.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" }) : "ohne Datum"}`;
    },
    l = document.createElement("div");
  ((l.className = "backdrop"),
    (l.innerHTML = `
    <div class="sheet" role="dialog">
      <div class="grab"></div>
      ${t ? `<div class="heard">Verstanden: <b>„${z(t)}“</b></div>` : ""}
      ${o.length ? `<div class="seg">${o.map(([f, b]) => `<button data-kind="${f}">${b}</button>`).join("")}</div>` : ""}
      <label class="field" id="title-field"><span id="title-label">Titel</span><input id="f-title" type="text" /></label>
      <div id="when">
        <div class="row2">
          <label class="field"><span>Datum</span><input id="f-date" type="date" /></label>
          <label class="field" id="time-field"><span>Uhrzeit</span><input id="f-time" type="time" /></label>
        </div>
        <label class="switch"><input id="f-all" type="checkbox" /> Ganztägig</label>
      </div>
      <div id="lst">
        <label class="field" id="target-field"><span>Wohin?</span>
          <select id="f-target">
            <option value="new">Neue Liste anlegen</option>
            ${i.map((f) => `<option value="${f.id}">Zu „${z(d(f))}“ hinzufügen</option>`).join("")}
          </select>
        </label>
        <div id="newlist">
          <label class="switch"><input id="f-hasdate" type="checkbox" /> Mit Datum</label>
          <label class="field" id="ldate-field"><span>Datum</span><input id="f-ldate" type="date" /></label>
        </div>
        <label class="field" id="items-field"><span>Punkte (einer pro Zeile)</span><textarea id="f-items" rows="4" placeholder="Milch&#10;Eier&#10;Brot"></textarea></label>
      </div>
      <div class="sheet-actions">
        <button class="btn" id="f-save">Eintragen</button>
        <button class="btn secondary" id="f-cancel">Abbrechen</button>
        ${e ? '<button class="btn danger" id="f-del">Löschen</button>' : ""}
      </div>
    </div>`),
    Se().appendChild(l));
  const u = () => {
    const f = s.kind === "list",
      b = s.target === "new";
    (l
      .querySelectorAll(".seg button")
      .forEach((w) => w.classList.toggle("on", w.dataset.kind === s.kind)),
      (h("#title-field", l).style.display = f && !e && !b ? "none" : ""),
      (h("#title-label", l).textContent = f ? "Name der Liste" : "Titel"),
      (h("#when", l).style.display = s.kind === "event" ? "" : "none"),
      (h("#time-field", l).style.display = s.allDay ? "none" : ""),
      (h("#lst", l).style.display = f ? "" : "none"),
      (h("#target-field", l).style.display = !e && i.length ? "" : "none"),
      (h("#newlist", l).style.display = b ? "" : "none"),
      (h("#ldate-field", l).style.display = s.hasDate ? "" : "none"),
      (h("#items-field", l).style.display = e ? "none" : ""),
      (h("#f-save", l).textContent = e
        ? "Speichern"
        : f && !b
          ? "Hinzufügen"
          : "Eintragen"));
  };
  ((h("#f-title", l).value = s.title),
    (h("#f-date", l).value = K(s.date)),
    (h("#f-time", l).value = Fe(s.date)),
    (h("#f-all", l).checked = s.allDay),
    (h("#f-ldate", l).value = K(s.date)),
    (h("#f-hasdate", l).checked = s.hasDate),
    (h("#f-target", l).value = s.target),
    (h("#f-items", l).value = (n?.items ?? []).join(`
`)),
    u(),
    l.querySelectorAll(".seg button").forEach(
      (f) =>
        (f.onclick = () => {
          ((s.kind = f.dataset.kind), u());
        }),
    ),
    (h("#f-all", l).onchange = (f) => {
      ((s.allDay = f.target.checked), u());
    }),
    (h("#f-hasdate", l).onchange = (f) => {
      ((s.hasDate = f.target.checked), u());
    }),
    (h("#f-target", l).onchange = (f) => {
      ((s.target = f.target.value), u());
    }));
  const g = () => l.remove();
  (l.addEventListener("click", (f) => {
    f.target === l && g();
  }),
    (h("#f-cancel", l).onclick = g),
    e &&
      (h("#f-del", l).onclick = async () => {
        const { error: f } = await D.from("items").delete().eq("id", e.id);
        if (f) return v(f.message);
        (g(),
          ($ = $.filter((b) => b.id !== e.id && b.parent_id !== e.id)),
          F === e.id && We(),
          U());
      }),
    (h("#f-save", l).onclick = async () => {
      const f = h("#f-save", l),
        b = s.kind === "list";
      let w = h("#f-title", l).value.trim(),
        k = null,
        p = null;
      if (b && !e) {
        const m = h("#f-items", l)
            .value.split(
              `
`,
            )
            .map((_) => _.trim())
            .filter(Boolean),
          y = Date.now(),
          M = (_) =>
            m.map((j, ee) => ({
              kind: "item",
              parent_id: _,
              title: j,
              created_at: new Date(y + ee + 1).toISOString(),
            }));
        if (s.target !== "new") {
          if (!m.length) return v("Bitte mindestens einen Punkt eingeben");
          ((f.disabled = !0),
            (p = s.target),
            ({ error: k } = await D.from("items").insert(M(p))));
        } else {
          if (!w) return v("Bitte einen Namen für die Liste angeben");
          let _ = null;
          if (s.hasDate) {
            const j = h("#f-ldate", l).value;
            if (!j) return v("Bitte ein Datum wählen");
            _ = new Date(`${j}T00:00`).toISOString();
          }
          ((f.disabled = !0),
            (p = se()),
            ({ error: k } = await D.from("items").insert([
              {
                id: p,
                kind: "list",
                title: w,
                starts_at: _,
                all_day: !0,
                created_at: new Date(y).toISOString(),
              },
              ...M(p),
            ])));
        }
      } else {
        if (!w) return v("Bitte einen Titel angeben");
        let m = null,
          y = !1;
        if (b) {
          if (((y = !0), s.hasDate)) {
            const _ = h("#f-ldate", l).value;
            if (!_) return v("Bitte ein Datum wählen");
            m = new Date(`${_}T00:00`).toISOString();
          }
        } else if (s.kind === "event") {
          y = s.allDay;
          const _ = h("#f-date", l).value;
          if (!_) return v("Bitte ein Datum wählen");
          const j = y ? "00:00" : h("#f-time", l).value || "09:00";
          m = new Date(`${_}T${j}`).toISOString();
        }
        const M = { kind: s.kind, title: w, starts_at: m, all_day: y };
        ((f.disabled = !0),
          ({ error: k } = e
            ? await D.from("items").update(M).eq("id", e.id)
            : await D.from("items").insert(M)));
      }
      if (((f.disabled = !1), k)) return v(k.message);
      (g(),
        (W = s.kind === "event" ? "events" : "tasks"),
        v(e ? "Gespeichert" : b ? "Liste gespeichert ✓" : "Eingetragen ✓"),
        await B(),
        p && ve(p));
    }));
}
const it = (e) => {
  const t = G(e);
  return t === "Heute"
    ? "heute"
    : t === "Morgen"
      ? "morgen"
      : t === "Gestern"
        ? "gestern"
        : "am " +
          e.toLocaleDateString("de-DE", { day: "numeric", month: "long" });
};
let Be = null,
  rt = null;
function ie(e, t = []) {
  (Be?.remove(), clearTimeout(rt));
  const n = document.createElement("div");
  ((n.className = "atoast"),
    (n.innerHTML = `<span>${z(e)}</span>${t.map((c, r) => `<button data-i="${r}">${z(c.label)}</button>`).join("")}`),
    (n.onclick = (c) => {
      const r = c.target.closest("button");
      r && (n.remove(), t[Number(r.dataset.i)].run());
    }),
    Se().appendChild(n),
    (Be = n),
    (rt = setTimeout(() => n.remove(), 8e3)));
}
async function Ge(e) {
  const { error: t } = await D.from("items").delete().in("id", e);
  if (t) return v(t.message);
  (($ = $.filter((n) => !e.includes(n.id) && !e.includes(n.parent_id))),
    U(),
    v("Rückgängig gemacht"));
}
async function gn(e, t) {
  if (!$.find((d) => d.id === e)) return v("Die Liste gibt es nicht mehr.");
  const c = lt(t);
  if (!c.length)
    return v("Ich habe kein Produkt verstanden – versuch es nochmal.");
  const r = new Set(
      De(e)
        .filter((d) => !d.done)
        .map((d) => d.title.toLowerCase()),
    ),
    i = c.filter((d) => {
      const l = d.toLowerCase();
      return r.has(l) ? !1 : (r.add(l), !0);
    });
  if (!i.length) return ie("Schon alles auf der Liste", []);
  const a = Date.now(),
    s = i.map((d, l) => ({
      id: se(),
      kind: "item",
      parent_id: e,
      title: d,
      created_at: new Date(a + l).toISOString(),
    })),
    { error: o } = await D.from("items").insert(s);
  if (o) return v(o.message);
  ((Z = { id: e, at: Date.now() }),
    await B(),
    ie(`${i.length} ${i.length === 1 ? "Punkt" : "Punkte"}: ${i.join(", ")}`, [
      { label: "Rückgängig", run: () => Ge(s.map((d) => d.id)) },
    ]));
}
async function pn(e) {
  const t = Jt(e);
  return t.kind === "list" ? wn(t) : bn(t);
}
async function bn(e) {
  const t = se(),
    n = e.kind === "event",
    c = {
      id: t,
      kind: e.kind,
      title: e.title,
      starts_at: n ? e.date.toISOString() : null,
      all_day: n ? e.allDay : !1,
    },
    { error: r } = await D.from("items").insert(c);
  if (r) return v(r.message);
  ((W = n ? "events" : "tasks"), await B());
  const i = n ? ` · ${G(e.date)}${e.allDay ? "" : ", " + Fe(e.date)}` : "";
  ie(`${n ? "Termin" : "To-do"} „${e.title}“${i}`, [
    {
      label: "Ändern",
      run: () => {
        const a = $.find((s) => s.id === t);
        a && Le({ item: a });
      },
    },
    { label: "Rückgängig", run: () => Ge([t]) },
  ]);
}
let Z = null;
async function wn(e) {
  const t = $.filter((p) => p.kind === "list"),
    n = gt(),
    c = (p, m) => p.starts_at && K(new Date(p.starts_at)) === K(m),
    r = (p) => p.title.toLowerCase() === e.title.toLowerCase();
  let i = null;
  if (e.mode === "add") {
    const p =
      Z && !e.date && Date.now() - Z.at < 18e5
        ? t.find((m) => m.id === Z.id && r(m))
        : null;
    if (p) i = p;
    else {
      const m = bt(t, { title: e.title }, e);
      i = t.find((y) => y.id === m) ?? null;
    }
  } else i = t.find((p) => r(p) && c(p, e.date ?? n)) ?? null;
  const a = Date.now(),
    s = [];
  let o,
    d = !1,
    l;
  i
    ? ((o = i.id), (l = i.starts_at ? new Date(i.starts_at) : null))
    : ((o = se()),
      (d = !0),
      (l = e.date ?? n),
      s.push({
        id: o,
        kind: "list",
        title: e.title,
        starts_at: l.toISOString(),
        all_day: !0,
        created_at: new Date(a).toISOString(),
      }));
  const u = new Set(
      De(o)
        .filter((p) => !p.done)
        .map((p) => p.title.toLowerCase()),
    ),
    g = [];
  for (const p of e.items)
    u.has(p.toLowerCase()) || (u.add(p.toLowerCase()), g.push(p));
  g.forEach((p, m) =>
    s.push({
      id: se(),
      kind: "item",
      parent_id: o,
      title: p,
      created_at: new Date(a + m + 1).toISOString(),
    }),
  );
  const f = `${e.title}${l ? " (" + it(l) + ")" : ""}`;
  if (((Z = { id: o, at: Date.now() }), (W = "tasks"), !s.length))
    return (
      U(),
      ie(e.items.length ? `Schon auf der ${f}` : `Die ${f} gibt es schon`, [
        { label: "Öffnen", run: () => ve(o) },
      ])
    );
  const { error: b } = await D.from("items").insert(s);
  if (b) return v(b.message);
  await B();
  const w = g.length,
    k = d
      ? `${e.title} ${l ? it(l) + " " : ""}angelegt${w ? ` · ${w} ${w === 1 ? "Punkt" : "Punkte"}` : ""}`
      : `${w} ${w === 1 ? "Punkt" : "Punkte"} zur ${f} hinzugefügt`;
  ie(k, [
    { label: "Öffnen", run: () => ve(o) },
    { label: "Rückgängig", run: () => Ge(s.map((p) => p.id)) },
  ]);
}
const vn = 3500,
  kn = 9e3,
  yn = 9e4,
  wt = { language: "de-DE", maxResults: 1, partialResults: !0, popup: !1 };
let T = !1,
  Q = !1,
  oe = "",
  I = "",
  Ue = 0,
  Ee = 0,
  ke = null,
  S = null,
  L = null,
  Ce = !1,
  Te = !1,
  _e = !1,
  ye = null,
  re = null,
  $n = null,
  Me = !1,
  at = !1;
const le = () => `${oe} ${I}`.trim(),
  je = () => window.SpeechRecognition || window.webkitSpeechRecognition;
function vt() {
  ((S = document.createElement("div")),
    (S.className = "listen"),
    (S.innerHTML = `
    <div class="orb">${A.mic}</div>
    <div class="live ph" id="live">Ich höre zu …</div>
    <div class="sub" id="sub">${re ? "Sag deine Produkte nacheinander, zum Beispiel „Milch, Eier, zwei Liter Wasser“. Jedes Produkt wird einzeln eingetragen." : "Sprich in Ruhe, Pausen sind okay. Ich trage ein, sobald du fertig bist."}</div>
    <div class="btns">
      <button class="btn" id="l-stop">Fertig</button>
      <button class="btn secondary" id="l-cancel">Abbrechen</button>
      <button class="link" id="l-type">Lieber tippen</button>
    </div>
    
      <div class="demo-box" id="fallback" hidden>
        <div class="sub" id="fb-msg"></div>
        <form id="demo-form"><input id="demo-text" type="text" placeholder="Satz eintippen, z. B. Einkaufsliste für morgen" autocomplete="off" /><button type="submit">OK</button></form>
      </div>`),
    Se().appendChild(S),
    (h("#l-stop", S).onclick = he),
    (h("#l-cancel", S).onclick = () => V(!0)),
    (h("#l-type", S).onclick = () =>
      ae("Tippe deinen Satz ein, so als hättest du ihn gesprochen.")),
    (h("#demo-form", S).onsubmit = (e) => {
      e.preventDefault();
      const t = h("#demo-text", S).value.trim();
      t && ((oe = t), (I = ""), V(!1));
    }));
}
function ae(e) {
  _e = !0;
  const t = S && h("#fallback", S);
  t &&
    ((h("#fb-msg", S).textContent = e),
    (t.hidden = !1),
    h("#demo-text", S).focus());
}
function kt() {
  const e = S && h("#live", S);
  if (!e) return;
  const t = le();
  if ((e.classList.toggle("ph", !t), re && t)) {
    const n = lt(t);
    e.innerHTML = n.length
      ? `<div class="chips live-chips">${n.map((c) => `<span>${z(c)}</span>`).join("")}</div>`
      : "";
    return;
  }
  e.textContent = t || "Ich höre zu …";
}
function yt() {
  (clearInterval(ke),
    (ke = setInterval(() => {
      if (!T || Q) return;
      const e = Date.now(),
        t = le();
      if ((t && e - Ee > vn) || (!t && !_e && e - Ue > kn) || e - Ue > yn)
        return he();
    }, 300)));
}
async function Sn() {
  const { available: e } = await x.available();
  if (!e)
    throw new Error("Spracherkennung ist auf diesem Gerät nicht verfügbar.");
  if (!at) {
    let t = await x.checkPermissions();
    if (
      (t.speechRecognition !== "granted" && (t = await x.requestPermissions()),
      t.speechRecognition !== "granted")
    )
      throw new Error(
        "Bitte erlaube den Mikrofon-Zugriff in den App-Einstellungen.",
      );
    at = !0;
  }
  (await x.removeAllListeners(),
    await x.addListener("partialResults", (t) => {
      t.matches?.length && ((I = t.matches[0]), (Ee = Date.now()), kt());
    }),
    await x.addListener("listeningState", (t) => {
      t.status === "stopped" && Dn();
    }),
    (T = !0),
    vt(),
    yt(),
    await x.start(wt));
}
function Dn() {
  if (T) {
    if ((I && ((oe = le()), (I = "")), Q)) return V(!1);
    Te ||
      ((Te = !0),
      setTimeout(async () => {
        if (((Te = !1), !(!T || Q)))
          try {
            await x.start(wt);
          } catch {
            V(!1);
          }
      }, 250));
  }
}
function Ln() {
  const e = je();
  ((Ce = !1),
    (L = $n ?? ($n = new e())),
    (L.lang = "de-DE"),
    (L.interimResults = !0),
    (L.continuous = !0));
  let t = !1;
  ((L.onstart = () => {
    t = !0;
  }),
    setTimeout(() => {
      T &&
        !t &&
        !I &&
        !_e &&
        ae(
          "Das Mikrofon startet hier nicht. Tippe stattdessen einen Satz ein. Alternativ kannst du die Tastatur-Diktierfunktion verwenden.",
        );
    }, 3500),
    (L.onresult = (n) => {
      let c = "";
      for (let r = 0; r < n.results.length; r++)
        c += n.results[r][0].transcript + " ";
      ((I = c.trim()), (Ee = Date.now()), kt());
    }),
    (L.onend = () => {
      if (!(!T || Ce)) {
        if ((I && ((oe = le()), (I = "")), Q)) return V(!1);
        try {
          L.start();
        } catch {
          V(!1);
        }
      }
    }),
    (L.onerror = (n) => {
      if (!(n.error === "no-speech" || n.error === "aborted"))
        return (
          (Ce = !0),
          ae(
            n.error === "not-allowed" || n.error === "service-not-allowed"
              ? "Das Mikrofon ist hier nicht erlaubt (in der Vorschau-Seite gesperrt, im Browser verweigert oder blockiert). Tippe stattdessen einen Satz ein. Alternativ kannst du die Tastatur-Diktierfunktion verwenden."
              : "Die Spracherkennung ist hier nicht verfügbar. Tippe stattdessen einen Satz ein.",
          )
        );
    }));
  try {
    L.start();
  } catch {}
}
async function En() {
  if (Me) return "ok";
  try {
    const e = await navigator.permissions?.query({ name: "microphone" });
    if (e?.state === "granted") return ((Me = !0), "ok");
    if (e?.state === "denied") return "denied";
  } catch {}
  if (!navigator.mediaDevices?.getUserMedia) return "unavailable";
  try {
    return (
      (await navigator.mediaDevices.getUserMedia({ audio: !0 }))
        .getTracks()
        .forEach((t) => t.stop()),
      (Me = !0),
      "ok"
    );
  } catch (e) {
    return e?.name === "NotFoundError" ? "unavailable" : "denied";
  }
}
async function $t(e = null) {
  if (!T) {
    (clearTimeout(ye),
      (re = typeof e == "string" ? e : null),
      Be?.remove(),
      (oe = ""),
      (I = ""),
      (Q = !1),
      (_e = !1),
      (Ue = Ee = Date.now()));
    try {
      if (X.isNativePlatform()) await Sn();
      else if ((je(), (T = !0), vt(), yt(), je())) {
        const t = await En();
        if (!T) return;
        t === "denied"
          ? Ae &&
            ae(
              "Das Mikrofon ist hier nicht erlaubt (in der Vorschau-Seite gesperrt oder im Browser verweigert). Tippe stattdessen einen Satz ein.",
            )
          : Ln();
      } else
        ae(
          "Dieser Browser unterstützt keine Spracherkennung. Bitte nutze Chrome. Tippe hier stattdessen einen Satz ein.",
        );
    } catch (t) {
      ((T = !1),
        clearInterval(ke),
        S?.remove(),
        (S = null),
        v(t?.message || "Spracherkennung konnte nicht gestartet werden."),
        Le({}));
    }
  }
}
async function he() {
  if (T) {
    Q = !0;
    try {
      X.isNativePlatform() ? await x.stop() : L?.stop();
    } catch {}
    (clearTimeout(ye), (ye = setTimeout(() => V(!1), 800)));
  }
}
function V(e) {
  if ((clearTimeout(ye), !T)) return;
  if (((T = !1), clearInterval(ke), X.isNativePlatform()))
    (x.stop().catch(() => {}), x.removeAllListeners().catch(() => {}));
  else if (L) {
    ((L.onend = null), (L.onerror = null), (L.onresult = null));
    try {
      L.abort();
    } catch {}
    L = null;
  }
  if ((S?.remove(), (S = null), e)) return;
  const t = le(),
    n = re;
  if (((re = null), !t))
    return v("Ich habe nichts verstanden – versuch es nochmal.");
  if (n) return gn(n, t);
  pn(t);
}
window.addEventListener("unhandledrejection", (event) => {
  v(event.reason?.message || "Der Vorgang konnte nicht abgeschlossen werden.");
});
sn();
class St extends He {
  available() {
    throw this.unimplemented("Method not implemented on web.");
  }
  start(t) {
    throw this.unimplemented("Method not implemented on web.");
  }
  stop() {
    throw this.unimplemented("Method not implemented on web.");
  }
  getSupportedLanguages() {
    throw this.unimplemented("Method not implemented on web.");
  }
  hasPermission() {
    throw this.unimplemented("Method not implemented on web.");
  }
  isListening() {
    throw this.unimplemented("Method not implemented on web.");
  }
  requestPermission() {
    throw this.unimplemented("Method not implemented on web.");
  }
  checkPermissions() {
    throw this.unimplemented("Method not implemented on web.");
  }
  requestPermissions() {
    throw this.unimplemented("Method not implemented on web.");
  }
}
const _n = new St(),
  zn = Object.freeze(
    Object.defineProperty(
      { __proto__: null, SpeechRecognition: _n, SpeechRecognitionWeb: St },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  );
