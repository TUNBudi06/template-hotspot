# Template Hotspot MikroTik (untuk Mikhmon)

Halaman login hotspot yang besar, jelas, dan mudah dipakai siapa saja.
Semua file lokal (tanpa CDN), jadi tetap jalan sebelum pelanggan login.

## Fitur
- **Login**: tab Voucher / Member, kotak kode besar, pesan error jelas, login CHAP.
- **Scan QR voucher**: tombol "Scan QR Voucher" di halaman login (kamera langsung di HTTPS, atau ambil foto QR di HTTP), dan scan dengan kamera HP juga langsung login (QR dari Mikhmon berisi `login?username=…&password=…`).
- **Member**: tombol Lihat / Tutup di dalam kotak password.
- **Status**: sisa waktu sesi (hitung mundur), **Status Voucher** dari Mikhmon:
  Aktif / Belum dipakai / Habis, paket, masa aktif, berlaku sampai, sisa masa aktif,
  sisa waktu pakai, sisa kuota, total pemakaian. Plus IP, MAC, tombol Logout.
- **Daftar harga** bisa ditampilkan / disembunyikan (`showPrices`).
- Tema terang / gelap / otomatis, bahasa Indonesia / Inggris.

## Pengaturan (`conf.js`)
| Kunci | Arti |
|---|---|
| `url` | Alamat Mikhmon, tanpa `/` di akhir |
| `SessionName` | Nama session router di Mikhmon |
| `hotspotName`, `wifiName` | Judul halaman dan nama WiFi di petunjuk (kosong = SessionName) |
| `defaultMode` | `voucher` atau `member` |
| `setCase` | `none`, `lowercase`, `uppercase` |
| `theme` | `default`, `dark`, `auto` |
| `lang` | `id` atau `en` |
| `contact` | Teks kontak di bawah halaman |
| `showPrices` | `true` tampilkan daftar harga, `false` sembunyikan |
| `packages` | Isi daftar harga |

Ganti `img/logo.png` dengan logo Anda.

## Pasang di router (RouterOS v7)
1. Upload semua file ke folder baru, misalnya `hotspot-v2` (Winbox → Files, atau `scp -r * admin@ROUTER:/hotspot-v2/`).
2. Aktifkan:
   ```
   /ip hotspot profile set [find name=hsprof1] html-directory=hotspot-v2 login-by=http-chap,http-pap,cookie,mac-cookie
   /ip hotspot walled-garden add dst-host=mikhmon.tunzerosix.xyz comment=mikhmon-status
   ```
   (`http-pap` supaya QR bisa login langsung; walled garden supaya "Cek sisa voucher" bisa dibuka sebelum login.)
3. Kembali ke template lama: `/ip hotspot profile set [find name=hsprof1] html-directory=hotspot`

Status Voucher membutuhkan Mikhmon versi baru (endpoint `status/api.php`),
branch `original` di https://github.com/TUNBudi06/mikhmon.
