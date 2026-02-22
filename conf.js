var config = {

    loginvc      : "Masukkan Kode Voucher kemudian klik Connect.",
    loginup      : "Masukkan Username dan Password <br> kemudian klik Connect.",
    voucherCode  : "Kode Voucher",
    setCase      : "none",    // lowercase, uppercase or none
    defaultMode  : "voucher", // voucher or member
    theme        : "dark",    // default, dark, lite

    // status expire
    url          : "https://mikhmon.theunknownname06.my.id", // url server Mikhmon
    SessionName  : "TheUnknownHotspot",

    // =========================================================
    // Daftar Harga Paket — edit di sini untuk mengubah harga
    // Kolom: paket, durasi, kecepatan, harga
    // =========================================================
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
