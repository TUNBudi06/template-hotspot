// =====================================================================
//  Hotspot settings. This is the only file you normally need to edit.
//  (Same keys as the previous template; new optional keys are marked NEW.)
// =====================================================================
var config = {

    // Text on the login page
    loginvc      : "Masukkan Kode Voucher kemudian klik Masuk.",
    loginup      : "Masukkan Username dan Password kemudian klik Masuk.",
    voucherCode  : "Kode Voucher",
    setCase      : "none",    // lowercase, uppercase or none (applied to what the user types)
    defaultMode  : "voucher", // voucher or member
    theme        : "dark",    // default (light), dark, auto (follows the phone)

    // Mikhmon server: used to show the voucher expiry date on the status page.
    // The router must allow this domain before login (IP > Hotspot > Walled Garden)
    // if you want the "Check voucher" link to work before login.
    url          : "https://mikhmon.tunzerosix.xyz", // no trailing slash
    SessionName  : "TheUnknownHotspot",                      // Mikhmon session (router) name

    // NEW: display
    hotspotName  : "",        // shown as title; empty = SessionName
    wifiName     : "",        // SSID shown in the help text; empty = hotspotName
    lang         : "id",      // id or en
    contact      : "",        // e.g. "WA 0812-xxxx-xxxx" (shown at the bottom)
    logo         : "img/logo.png", // put your logo in img/ (empty = no logo)

    // =========================================================
    // Daftar Harga Paket / price list
    // showPrices : true = tampilkan di halaman login, false = sembunyikan
    // =========================================================
    showPrices : false,
    packages : [
        { paket: "1 Jam",    durasi: "60 Menit", kecepatan: "1 Mbps",  harga: "Rp 2.000"   },
        { paket: "3 Jam",    durasi: "3 Jam",    kecepatan: "2 Mbps",  harga: "Rp 5.000"   },
        { paket: "5 Jam",    durasi: "5 Jam",    kecepatan: "2 Mbps",  harga: "Rp 8.000"   },
        { paket: "1 Hari",   durasi: "24 Jam",   kecepatan: "3 Mbps",  harga: "Rp 12.000"  },
        { paket: "3 Hari",   durasi: "3 Hari",   kecepatan: "3 Mbps",  harga: "Rp 30.000"  },
        { paket: "1 Minggu", durasi: "7 Hari",   kecepatan: "5 Mbps",  harga: "Rp 60.000"  },
        { paket: "1 Bulan",  durasi: "30 Hari",  kecepatan: "10 Mbps", harga: "Rp 180.000" },
    ],

}
