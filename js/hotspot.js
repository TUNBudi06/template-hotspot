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
      how: "Cara pakai", s1: "Sambungkan HP ke WiFi", s2: "Ketik kode voucher, atau tekan tombol Scan QR Voucher", s3: "Tekan Masuk",
      check: "Cek sisa voucher", autologin: "Login otomatis dari QR...", hello: "Halo",
      connected: "Anda sudah terhubung", left: "Sisa waktu sesi", expires: "Voucher berlaku sampai", expleft: "Sisa masa aktif",
      dataleft: "Sisa kuota", used: "Pemakaian (upload / download)", uptime: "Lama terhubung", ip: "Alamat IP", mac: "MAC",
      logout: "Keluar (Logout)", logoutq: "Yakin ingin keluar?", loading: "Memuat...", unlimited: "Tanpa batas",
      bye: "Anda sudah keluar", again: "Masuk lagi", success: "Berhasil masuk!", redirecting: "Mengalihkan...",
      continuebtn: "Lanjut browsing", statuspage: "Lihat status", err: "Terjadi kesalahan", back: "Kembali",
      expired: "Voucher sudah habis", savepage: "Simpan halaman ini untuk cek sisa waktu:", d: "hari", h: "jam", m: "menit", s: "detik",
      trial: "Coba gratis", vstatus: "Status Voucher", vactive: "Aktif", vunused: "Belum dipakai", package: "Paket",
      validity: "Masa aktif", timeleft: "Sisa waktu pakai", total: "Total pemakaian", noinfo: "Info voucher belum bisa dimuat. Coba muat ulang halaman.",
      or: "atau", scan: "Scan QR Voucher", scanhelp: "Arahkan kamera ke QR pada voucher", cancel: "Batal",
      scanfail: "QR tidak terbaca. Foto lebih dekat dan terang, atau ketik kodenya.", pwshow: "Lihat", pwhide: "Tutup", scanlocal: "Kamera tidak terbuka? Foto QR di sini"
    },
    en: {
      voucher: "Voucher", member: "Member", code: "Voucher Code", user: "Username", pass: "Password",
      login: "Connect", show: "show", prices: "Prices", paket: "Package", durasi: "Duration", speed: "Speed", harga: "Price",
      how: "How to connect", s1: "Connect your phone to WiFi", s2: "Type the voucher code, or press Scan Voucher QR", s3: "Press Connect",
      check: "Check my voucher", autologin: "Logging in from QR...", hello: "Hi",
      connected: "You are connected", left: "Session time left", expires: "Voucher valid until", expleft: "Validity left",
      dataleft: "Data left", used: "Used (upload / download)", uptime: "Connected for", ip: "IP address", mac: "MAC",
      logout: "Log out", logoutq: "Log out now?", loading: "Loading...", unlimited: "Unlimited",
      bye: "You are logged out", again: "Log in again", success: "You are connected!", redirecting: "Redirecting...",
      continuebtn: "Continue browsing", statuspage: "View status", err: "Something went wrong", back: "Back",
      expired: "Voucher used up", savepage: "Bookmark this page to check your time:", d: "days", h: "hours", m: "min", s: "sec",
      trial: "Free trial", vstatus: "Voucher Status", vactive: "Active", vunused: "Not used yet", package: "Package",
      validity: "Validity", timeleft: "Usage time left", total: "Total usage", noinfo: "Voucher info could not be loaded. Please reload the page.",
      or: "or", scan: "Scan Voucher QR", scanhelp: "Point the camera at the QR on the voucher", cancel: "Cancel",
      scanfail: "Could not read the QR. Take the photo closer and brighter, or type the code.", pwshow: "Show", pwhide: "Hide", scanlocal: "Camera did not open? Take a photo of the QR here"
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
    $("rowPass").className = vc ? "hide" : "";
    $("lblUser").textContent = vc ? (C.voucherCode || t("code")) : t("user");
    $("info").className = "alert info";
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

  // ---------- password show / hide ----------
  var EYE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 5C6.5 5 2.7 9.2 1.5 12c1.2 2.8 5 7 10.5 7s9.3-4.2 10.5-7C21.3 9.2 17.5 5 12 5zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9zm0-2.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M2.3 3.7 3.7 2.3l18 18-1.4 1.4-3.2-3.2A11.3 11.3 0 0 1 12 19C6.5 19 2.7 14.8 1.5 12a13 13 0 0 1 3.9-5.2L2.3 3.7zM12 5c5.5 0 9.3 4.2 10.5 7-.6 1.4-1.8 3.2-3.5 4.6l-3.1-3.1A4.5 4.5 0 0 0 10.5 7.6L8.7 5.8C9.7 5.3 10.8 5 12 5z"/></svg>';
  function setEye(shown) {
    document.login.password.type = shown ? "text" : "password";
    $("eye").innerHTML = (shown ? EYE_OFF : EYE) + "<span>" + esc(t(shown ? "pwhide" : "pwshow")) + "</span>";
    $("eye").setAttribute("aria-pressed", shown ? "true" : "false");
  }

  // ---------- QR scan ----------
  // Voucher QR = "http://<dns>/login?username=U&password=P" (or just the code).
  function fromQR(text) {
    text = String(text || "").replace(/^\s+|\s+$/g, "");
    var u = (/[?&]username=([^&#]*)/.exec(text) || [])[1];
    var p = (/[?&]password=([^&#]*)/.exec(text) || [])[1];
    try { u = u !== undefined ? decodeURIComponent(u.replace(/\+/g, " ")) : u; p = p !== undefined ? decodeURIComponent(p.replace(/\+/g, " ")) : p; } catch (e) {}
    if (u === undefined) { u = text; p = text; }
    if (!u) { return false; }
    setMode(u === p ? "voucher" : "member");
    document.login.username.value = u;
    if (u !== p) { document.login.password.value = p; }
    $("info").innerHTML = '<span class="spin"></span> ' + esc(t("autologin"));
    if (doLogin()) { document.login.submit(); }
    return true;
  }

  function loadJsQR(cb) {
    if (window.jsQR) { cb(); return; }
    var s = document.createElement("script");
    s.src = "/js/jsQR.js";
    s.onload = cb;
    s.onerror = function () { scanMsg(t("scanfail")); };
    document.head.appendChild(s);
  }

  function scanMsg(m) { $("info").className = "alert bad"; $("info").innerHTML = esc(m); }

  function decodeCanvas(ctx, w, h, attempts) {
    var img = ctx.getImageData(0, 0, w, h);
    var r = window.jsQR(img.data, w, h, { inversionAttempts: attempts || "dontInvert" });
    return r ? r.data : null;
  }

  // Photo fallback (works on plain http, where browsers block the live camera).
  function scanPhoto(file) {
    loadJsQR(function () {
      var img = new Image(), url = (window.URL || window.webkitURL).createObjectURL(file);
      img.onload = function () {
        var sizes = [1000, 1600, 600], found = null;
        for (var i = 0; i < sizes.length && !found; i++) {
          var k = Math.min(1, sizes[i] / Math.max(img.width, img.height));
          var c = document.createElement("canvas");
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          var ctx = c.getContext("2d");
          ctx.drawImage(img, 0, 0, c.width, c.height);
          found = decodeCanvas(ctx, c.width, c.height, "attemptBoth");
        }
        if (!found || !fromQR(found)) { scanMsg(t("scanfail")); }
      };
      img.onerror = function () { scanMsg(t("scanfail")); };
      img.src = url;
    });
  }

  // Live camera (only on https / secure pages).
  function scanLive() {
    var ov = document.createElement("div"), stream = null, timer = null;
    ov.className = "scan-ov";
    ov.innerHTML = '<div class="frame"><video playsinline muted></video></div><p>' + esc(t("scanhelp")) +
      '</p><button type="button" class="btn ghost" style="color:#fff;border-color:#fff">' + esc(t("cancel")) + '</button>';
    document.body.appendChild(ov);
    var video = ov.querySelector("video"), c = document.createElement("canvas"), ctx = c.getContext("2d");
    function stop() {
      if (timer) { clearInterval(timer); }
      if (stream) { stream.getTracks().forEach(function (tr) { tr.stop(); }); }
      if (ov.parentNode) { ov.parentNode.removeChild(ov); }
    }
    ov.querySelector("button").onclick = stop;
    loadJsQR(function () {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (s) {
        stream = s; video.srcObject = s; video.play();
        timer = setInterval(function () {
          if (video.readyState < 2) { return; }
          var k = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
          c.width = Math.round(video.videoWidth * k); c.height = Math.round(video.videoHeight * k);
          ctx.drawImage(video, 0, 0, c.width, c.height);
          var found = decodeCanvas(ctx, c.width, c.height);
          if (found) { stop(); if (!fromQR(found)) { scanMsg(t("scanfail")); } }
        }, 250);
      }, function () { stop(); $("qrPhoto").click(); });
    });
  }

  // Scan button: the router page is plain http (no live camera), so go to the
  // Mikhmon scanner (https, allowed by the walled garden). It reads the QR and
  // sends the customer back to this router's /login?username=..&password=..
  function startScan() {
    if (C.url && C.SessionName) {
      window.location.href = C.url + "/scan/?session=" + encodeURIComponent(C.SessionName) + "&lang=" + (C.lang === "en" ? "en" : "id");
      return;
    }
    localScan();
  }

  // Fallback without Mikhmon: live camera on https, otherwise a photo of the QR.
  function localScan() {
    var live = window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    if (live) { scanLive(); } else { $("qrPhoto").click(); }
  }

  function login(opts) {
    init();
    $("tabV").onclick = function () { setMode("voucher"); $("username").focus(); };
    $("tabM").onclick = function () { setMode("member"); $("username").focus(); };
    setEye(false);
    $("eye").onclick = function () { setEye(document.login.password.type === "password"); return false; };
    $("btnScan").onclick = startScan;
    if ($("scanLocal")) { $("scanLocal").onclick = function () { localScan(); return false; }; }
    $("qrPhoto").onchange = function () { if (this.files && this.files[0]) { scanPhoto(this.files[0]); } this.value = ""; };
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
