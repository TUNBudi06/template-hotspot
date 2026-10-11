/*
 * Hotspot template logic (ES5 on purpose: captive-portal browsers are old).
 * Needs: conf.js (var config) loaded first. md5.js only on login.html.
 */
var HS = (function () {
  "use strict";
  var C = window.config || {};

  var TEXT = {
    id: {
      voucher: "Voucher", member: "Member", code: "Kode Voucher", user: "Username", pass: "Password",
      login: "Masuk", show: "lihat", prices: "Daftar Harga", paket: "Paket", durasi: "Durasi", speed: "Kecepatan", harga: "Harga",
      how: "Cara pakai", s1: "Sambungkan HP ke WiFi", s2: "Ketik kode voucher atau scan QR di voucher", s3: "Tekan Masuk",
      check: "Cek sisa voucher", autologin: "Login otomatis dari QR...", hello: "Halo",
      connected: "Anda sudah terhubung", left: "Sisa waktu sesi", expires: "Voucher berlaku sampai", expleft: "Sisa masa aktif",
      dataleft: "Sisa kuota", used: "Pemakaian (upload / download)", uptime: "Lama terhubung", ip: "Alamat IP", mac: "MAC",
      logout: "Keluar (Logout)", logoutq: "Yakin ingin keluar?", loading: "Memuat...", unlimited: "Tanpa batas",
      bye: "Anda sudah keluar", again: "Masuk lagi", success: "Berhasil masuk!", redirecting: "Mengalihkan...",
      continuebtn: "Lanjut browsing", statuspage: "Lihat status", err: "Terjadi kesalahan", back: "Kembali",
      expired: "Voucher sudah habis", savepage: "Simpan halaman ini untuk cek sisa waktu:", d: "hari", h: "jam", m: "menit", s: "detik",
      trial: "Coba gratis", vstatus: "Status Voucher", vactive: "Aktif", vunused: "Belum dipakai", package: "Paket",
      validity: "Masa aktif", timeleft: "Sisa waktu pakai", total: "Total pemakaian", noinfo: "Info voucher belum bisa dimuat. Coba muat ulang halaman."
    },
    en: {
      voucher: "Voucher", member: "Member", code: "Voucher Code", user: "Username", pass: "Password",
      login: "Connect", show: "show", prices: "Prices", paket: "Package", durasi: "Duration", speed: "Speed", harga: "Price",
      how: "How to connect", s1: "Connect your phone to WiFi", s2: "Type the voucher code or scan the QR on the voucher", s3: "Press Connect",
      check: "Check my voucher", autologin: "Logging in from QR...", hello: "Hi",
      connected: "You are connected", left: "Session time left", expires: "Voucher valid until", expleft: "Validity left",
      dataleft: "Data left", used: "Used (upload / download)", uptime: "Connected for", ip: "IP address", mac: "MAC",
      logout: "Log out", logoutq: "Log out now?", loading: "Loading...", unlimited: "Unlimited",
      bye: "You are logged out", again: "Log in again", success: "You are connected!", redirecting: "Redirecting...",
      continuebtn: "Continue browsing", statuspage: "View status", err: "Something went wrong", back: "Back",
      expired: "Voucher used up", savepage: "Bookmark this page to check your time:", d: "days", h: "hours", m: "min", s: "sec",
      trial: "Free trial", vstatus: "Voucher Status", vactive: "Active", vunused: "Not used yet", package: "Package",
      validity: "Validity", timeleft: "Usage time left", total: "Total usage", noinfo: "Voucher info could not be loaded. Please reload the page."
    }
  };
  var L = TEXT[C.lang === "en" ? "en" : "id"];

  function $(id) { return document.getElementById(id); }
  function t(k) { return L[k] || k; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function store(k, v) { try { if (v === undefined) { return window.sessionStorage.getItem(k); } window.sessionStorage.setItem(k, v); } catch (e) { return null; } }

  function applyTheme() {
    var th = C.theme || "default";
    if (th === "auto") { th = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "default"; }
    document.documentElement.setAttribute("data-theme", th === "dark" ? "dark" : "light");
  }

  function name() { return C.hotspotName || C.SessionName || document.title || "Hotspot"; }

  // Fill common elements: [data-t] translations, brand block, footer.
  function init() {
    applyTheme();
    var els = document.querySelectorAll("[data-t]");
    for (var i = 0; i < els.length; i++) { els[i].innerHTML = esc(t(els[i].getAttribute("data-t"))); }
    var bn = document.querySelectorAll(".js-name");
    for (var j = 0; j < bn.length; j++) { bn[j].textContent = name(); }
    var wifi = document.querySelectorAll(".js-wifi");
    for (var w = 0; w < wifi.length; w++) { wifi[w].textContent = C.wifiName || name(); }
    var logo = $("logo");
    if (logo) { if (C.logo) { logo.src = C.logo; logo.onerror = function () { logo.className = "hide"; }; } else { logo.className = "hide"; } }
    document.title = name();
    var foot = $("foot");
    if (foot && C.contact) { foot.innerHTML = esc(C.contact); }
  }

  // ---------- durations ----------
  // MikroTik "1w2d3h4m5s" or "01:02:03" or "2d01:02:03" -> seconds
  function secs(d) {
    d = String(d || "").replace(/\s/g, "");
    if (!d) { return 0; }
    var m = d.match(/^(?:(\d+)w)?(?:(\d+)d)?(\d{1,2}):(\d{2}):(\d{2})$/);
    if (m) { return (+m[1] || 0) * 604800 + (+m[2] || 0) * 86400 + (+m[3]) * 3600 + (+m[4]) * 60 + (+m[5]); }
    var re = /(\d+)(w|d|h|m|s)/g, x, s = 0, mul = { w: 604800, d: 86400, h: 3600, m: 60, s: 1 };
    while ((x = re.exec(d))) { s += (+x[1]) * mul[x[2]]; }
    return s;
  }
  function human(s) {
    s = Math.max(0, Math.floor(s));
    var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
    if (d > 0) { return d + " " + t("d") + " " + h + " " + t("h") + " " + m + " " + t("m"); }
    if (h > 0) { return h + " " + t("h") + " " + m + " " + t("m"); }
    return m + " " + t("m") + " " + ss + " " + t("s");
  }
  function countdown(el, s) {
    if (!el || !s) { return; }
    var end = Date.now() + s * 1000;
    function tick() { el.textContent = human((end - Date.now()) / 1000); }
    tick();
    setInterval(tick, 1000);
  }

  // ---------- login page ----------
  function setMode(mode) {
    var vc = mode !== "member";
    $("tabV").className = vc ? "on" : "";
    $("tabM").className = vc ? "" : "on";
    $("rowPass").className = vc ? "hide" : "pw";
    $("lblUser").textContent = vc ? (C.voucherCode || t("code")) : t("user");
    $("info").innerHTML = vc ? (C.loginvc || "") : (C.loginup || "");
    $("username").placeholder = vc ? (C.voucherCode || t("code")) : t("user");
    store("hsMode", vc ? "voucher" : "member");
  }

  function fixCase(v) {
    if (C.setCase === "lowercase") { return v.toLowerCase(); }
    if (C.setCase === "uppercase") { return v.toUpperCase(); }
    return v;
  }

  // Called on submit. Voucher mode: password = code. CHAP hashing when the router offers it.
  function doLogin() {
    var f = document.login, u = fixCase(f.username.value.replace(/^\s+|\s+$/g, ""));
    var p = $("rowPass").className === "hide" ? u : f.password.value;
    f.username.value = u;
    if (!u) { f.username.focus(); return false; }
    $("btnLogin").innerHTML = '<span class="spin"></span> ' + esc(t("login"));
    var s = document.sendin;
    if (s && window.hexMD5 && window.HS_CHAP) {
      s.username.value = u;
      s.password.value = window.hexMD5(window.HS_CHAP.id + p + window.HS_CHAP.challenge);
      s.submit();
      return false;
    }
    f.password.value = p;
    return true;
  }

  function query(k) {
    var m = new RegExp("[?&]" + k + "=([^&#]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  function login(opts) {
    init();
    $("tabV").onclick = function () { setMode("voucher"); $("username").focus(); };
    $("tabM").onclick = function () { setMode("member"); $("username").focus(); };
    $("eye").onclick = function () { var p = document.login.password; p.type = p.type === "password" ? "text" : "password"; return false; };
    document.login.onsubmit = doLogin;
    renderPrices();
    var chk = $("checkLink");
    if (chk && C.url && C.SessionName) { chk.href = C.url + "/status/?session=" + encodeURIComponent(C.SessionName); } else if (chk) { chk.className = "hide"; }

    // Voucher QR codes open .../login?username=X&password=Y. If the router did not
    // log in directly (e.g. only CHAP enabled), log in here once.
    var qu = query("username"), qp = query("password");
    var mode = (qu && qp && qu !== qp) ? "member" : (store("hsMode") || C.defaultMode || "voucher");
    setMode(mode);
    if (qu) { document.login.username.value = qu; }
    if (qu && qp && !opts.error && store("hsAuto") !== qu) {
      store("hsAuto", qu);
      if (mode === "member") { document.login.password.value = qp; }
      $("info").innerHTML = '<span class="spin"></span> ' + esc(t("autologin"));
      if (doLogin()) { document.login.submit(); }
      return;
    }
    if (!opts.error) { $("username").focus(); }
  }

  function renderPrices() {
    var box = $("prices");
    if (!box) { return; }
    var p = C.packages || [];
    // showPrices: false hides the list (missing setting = shown, like the old template)
    if (C.showPrices === false || !p.length) { box.className = "hide"; return; }
    var html = "<table class='prices'><tr><th>" + esc(t("paket")) + "</th><th>" + esc(t("durasi")) + "</th><th>" + esc(t("speed")) + "</th><th>" + esc(t("harga")) + "</th></tr>";
    for (var i = 0; i < p.length; i++) {
      html += "<tr><td>" + esc(p[i].paket) + "</td><td>" + esc(p[i].durasi) + "</td><td>" + esc(p[i].kecepatan) + "</td><td>" + esc(p[i].harga) + "</td></tr>";
    }
    $("priceTable").innerHTML = html + "</table>";
    box.className = "card";
  }

  // ---------- status page ----------
  function status(v) {
    init();
    countdown($("timeLeft"), secs(v.sessionLeft));
    var up = secs(v.uptime);
    if ($("uptime")) {
      var start = Date.now() - up * 1000;
      var tick = function () { $("uptime").textContent = human((Date.now() - start) / 1000); };
      tick(); setInterval(tick, 1000);
    }
    if ($("statusLink")) { $("statusLink").textContent = window.location.protocol + "//" + window.location.host + "/status"; }
    if (!v.username || !C.url || !C.SessionName) { if ($("expBox")) { $("expBox").className = "hide"; } return; }

    // Voucher status (package, validity, expiry, quota) comes from Mikhmon (status/api.php).
    var x = new XMLHttpRequest();
    x.open("GET", C.url + "/status/api.php?session=" + encodeURIComponent(C.SessionName) + "&name=" + encodeURIComponent(v.username) + "&_=" + Date.now(), true);
    x.timeout = 8000;
    x.onload = function () {
      var r;
      try { r = JSON.parse(x.responseText); } catch (e) { r = null; }
      if (!r || !r.ok) { failed(); return; }
      voucherStatus(r, v);
    };
    x.onerror = x.ontimeout = failed;
    x.send();
  }

  function failed() {
    $("vLoading").innerHTML = esc(t("noinfo"));
  }

  // "30d" -> "30 hari", "1h30m" -> "1 jam 30 menit"
  function durText(d) {
    var s = secs(d);
    if (!s) { return d || ""; }
    var w = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), out = [];
    if (w) { out.push(w + " " + t("d")); }
    if (h) { out.push(h + " " + t("h")); }
    if (m) { out.push(m + " " + t("m")); }
    return out.join(" ");
  }

  function show(id, on) { $(id).className = on ? "kv" : "hide"; }

  function voucherStatus(r, v) {
    var labels = { active: ["vactive", ""], unused: ["vunused", "warn"], expired: ["expired", "bad"] };
    var b = labels[r.status] || labels.active;
    $("vBadge").textContent = t(b[0]);
    $("vBadge").className = "badge " + b[1];
    $("vLoading").className = "hide";
    $("vRows").className = "";

    $("vPkg").textContent = r.profile || "-";
    show("rowValid", !!r.validity);
    $("vValid").textContent = durText(r.validity);

    show("rowExp", !!r.expires);
    $("expDate").textContent = r.expires || "";
    show("rowExpLeft", r.seconds_left !== null && r.status !== "expired");
    if (r.seconds_left !== null) { countdown($("expLeft"), r.seconds_left); }

    // usage-time limit of the voucher (limit-uptime), counted down while connected
    show("rowTime", r.time_left_secs !== null);
    if (r.time_left_secs !== null) { countdown($("vTimeLeft"), r.time_left_secs); }

    // data left: the router shows it when it knows; Mikhmon is the fallback
    if (!v.remainNice && r.bytes_left !== null && r.bytes_limit > 0) {
      var pct = Math.max(0, Math.min(100, 100 * r.bytes_left / r.bytes_limit));
      $("dataLeft").textContent = r.bytes_left_nice;
      $("dataBar").style.width = pct.toFixed(1) + "%";
      $("dataBar").className = pct <= 0 ? "out" : (pct < 20 ? "low" : "");
      $("dataBox").className = "";
    }
    $("vTotal").textContent = r.bytes_used_nice || "-";
    if (r.status === "expired") { $("expiredMsg").className = "alert bad"; }
  }

  return { init: init, login: login, status: status, secs: secs, human: human, countdown: countdown, t: t };
})();
