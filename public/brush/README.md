# public/brush/

Kosong secara sengaja (M2).

Divider brush-stroke antar section dirender sebagai **SVG inline** di
`components/ui/BrushDivider.tsx`, bukan aset `.webp` seperti draft plan M2 §3.4.
Alasannya ada di komentar file komponen — ringkasnya: warna divider harus
persis mengikuti latar section penutup (`currentColor`), sementara `.webp`
butuh satu file per warna.

Folder ini dipertahankan untuk aset kuas bertekstur raster kalau nanti butuh
butir/bulu kuas yang tidak bisa diwakili path vektor.
