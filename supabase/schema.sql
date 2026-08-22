-- Guestbook anonim — jalankan sekali di Supabase SQL Editor.
--
-- Kolom `ip_hash` BUKAN alamat IP: isinya sha256(ip + GUESTBOOK_SALT), jadi
-- tidak bisa dibalik jadi IP asli tapi tetap stabil untuk rate limit. Tanpa
-- salt hash IPv4 bisa di-brute force (ruangnya cuma 2^32), makanya salt-nya
-- wajib dan disimpan di env, bukan di kode.

create extension if not exists pgcrypto;

create table if not exists public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  -- Nama panggilan opsional. Kosong = ditampilkan sebagai "Anonymous".
  nickname    text check (nickname is null or char_length(nickname) between 1 and 32),
  body        text not null check (char_length(body) between 2 and 500),
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);

-- Urutan tampil (terbaru dulu).
create index if not exists guestbook_created_at_idx
  on public.guestbook (created_at desc);

-- Query rate limit: "berapa komentar dari ip_hash ini sejak waktu X".
create index if not exists guestbook_ratelimit_idx
  on public.guestbook (ip_hash, created_at desc);

-- RLS ON tanpa satu pun policy = anon key & authenticated key TIDAK bisa
-- baca/tulis apa pun. Semua akses lewat route handler kita yang memakai
-- service_role key (service_role bypass RLS). Ini disengaja: kalau anon key
-- boleh insert langsung, rate limit & filter di server bisa dilewati dengan
-- memanggil REST API Supabase dari luar.
alter table public.guestbook enable row level security;
