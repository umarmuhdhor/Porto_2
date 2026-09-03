/**
 * Test mesin jawab asisten "ask-me".
 *
 * Dua hal yang diuji, dan yang kedua justru yang lebih gampang rusak:
 *
 * 1. PENCOCOKAN — pertanyaan wajar dalam dua bahasa harus mendarat di topik
 *    yang benar, dan pertanyaan di luar cakupan harus mendarat di `null`
 *    (bot ini tidak punya model bahasa; mengaku tidak tahu adalah jawaban yang
 *    benar, menjawab topik yang salah tidak).
 * 2. INTEGRITAS DATA — `next` yang menunjuk id tak ada, chip default yang tidak
 *    punya label, atau `keys` yang berisi stopword semuanya GAGAL DIAM-DIAM:
 *    TypeScript tetap senang, panel tetap render, cuma saran atau pemicunya
 *    yang hilang. Itu kelas bug yang cuma ketahuan lewat test seperti ini.
 */

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CHIPS,
  FALLBACK,
  GREETING,
  TOPICS,
  chipsFor,
  matchTopic,
  topicById,
} from '@/lib/chatbot';

const IDS = new Set(TOPICS.map((topic) => topic.id));

describe('matchTopic — pertanyaan yang wajar', () => {
  it.each([
    ['how do i contact him', 'contact'],
    ['what is his tech stack', 'skills'],
    ['tell me about his projects', 'projects'],
    ['who is umar', 'about'],
    ['apple developer academy', 'academy'],
    ['can i see his resume', 'resume'],
    ['tell me about load away', 'loadaway'],
  ])('EN: %s → %s', (question, expected) => {
    expect(matchTopic(question)?.id).toBe(expected);
  });

  it.each([
    ['kontak', 'contact'],
    ['apa tech stack nya', 'skills'],
    ['dimana dia tinggal', 'location'],
    ['cv nya ada', 'resume'],
  ])('ID: %s → %s', (question, expected) => {
    // Situsnya Inggris, pengunjungnya belum tentu — `keys` memang dua bahasa.
    expect(matchTopic(question)?.id).toBe(expected);
  });

  it('menormalkan diakritik', () => {
    // "dímana" dan "dimana" tidak boleh jadi dua kata yang berbeda.
    expect(matchTopic('dímana dia tinggal')?.id).toBe(matchTopic('dimana dia tinggal')?.id);
  });

  it('tidak peduli huruf besar-kecil & tanda baca', () => {
    expect(matchTopic('KONTAK!!!')?.id).toBe('contact');
    expect(matchTopic('Tech stack?')?.id).toBe('skills');
  });
});

describe('matchTopic — yang harus dijawab "tidak tahu"', () => {
  it('mengembalikan null untuk masukan kosong', () => {
    for (const input of ['', '   ', '???', '\n\t']) expect(matchTopic(input)).toBeNull();
  });

  it('mengembalikan null untuk pertanyaan di luar cakupan', () => {
    // Pemanggil menampilkan FALLBACK. Menjawab topik yang salah lebih merugikan
    // daripada mengaku tidak tahu — itu seluruh alasan MIN_SCORE ada.
    for (const input of ['xyzzy', 'what is the weather in tokyo', 'cuaca besok gimana']) {
      expect(matchTopic(input), input).toBeNull();
    }
  });

  it('tidak terpicu oleh kata tanya & kata fungsi saja', () => {
    // Tanpa STOPWORDS, "apa" pada "apa skill kamu" bernilai sama dengan
    // "skill", dan pertanyaan apa pun akan menyerempet topik yang kebetulan
    // memuat kata tanya.
    for (const input of ['what do you', 'apa yang bisa kamu', 'is it he or she']) {
      expect(matchTopic(input), input).toBeNull();
    }
  });
});

describe('matchTopic — aturan skoring yang didokumentasikan', () => {
  it('frasa menang atas kata tunggal yang kebetulan sama', () => {
    // "apple developer academy" adalah niat yang jauh lebih kuat daripada
    // kebetulan menyebut "apple".
    expect(matchTopic('apple developer academy')?.id).toBe('academy');
  });

  it('satu kecocokan awalan saja TIDAK cukup untuk menjawab', () => {
    // MIN_SCORE = 3. "freelancer" cuma menyerempet key "freelance" lewat
    // awalan (nilai 1), dan di tingkat kemiripan itu "kar" pada "karya" bisa
    // menyeret topik "karir" — jawaban salah lebih merugikan daripada mengaku
    // tidak tahu. Kata utuhnya tetap kena.
    expect(matchTopic('freelancer')).toBeNull();
    expect(matchTopic('freelance')?.id).toBe('hire');
  });

  it('seri dimenangkan topik yang lebih dulu di TOPICS', () => {
    // "hiring" memang terdaftar di DUA topik (availability & hire). Urutan
    // array-lah yang memutuskan, dan urutan itu memang dipakai sebagai
    // prioritas. Kalau suatu saat urutannya diubah, baris ini yang memberi tahu.
    const owners = TOPICS.filter((topic) => topic.keys.includes('hiring')).map((t) => t.id);
    expect(owners.length).toBeGreaterThan(1);
    expect(matchTopic('hiring')?.id).toBe(owners[0]);
  });
});

describe('integritas TOPICS', () => {
  it('id-nya unik', () => {
    expect(IDS.size).toBe(TOPICS.length);
  });

  it('setiap `next` menunjuk topik yang ada', () => {
    // Id yang salah ketik tidak error — chip-nya cuma hilang tanpa jejak.
    for (const topic of TOPICS) {
      for (const next of topic.next ?? []) {
        expect(IDS.has(next), `${topic.id}.next → ${next}`).toBe(true);
      }
    }
  });

  it('setiap DEFAULT_CHIPS ada dan punya label chip', () => {
    for (const id of DEFAULT_CHIPS) {
      expect(topicById(id)?.chip, id).toBeTruthy();
    }
  });

  it('semua `keys` huruf kecil & tanpa spasi berlebih', () => {
    // Pencocokan dilakukan pada teks yang sudah di-lowercase; key berhuruf
    // besar tidak akan pernah kena.
    for (const topic of TOPICS) {
      for (const key of topic.keys) {
        expect(key, `${topic.id}: "${key}"`).toBe(key.toLowerCase().trim());
        expect(key.length).toBeGreaterThan(0);
      }
    }
  });

  it('tidak ada key satu kata yang berupa stopword', () => {
    // Stopword dibuang SEBELUM skoring, jadi key seperti itu mati sejak lahir.
    // Diuji lewat perilaku, bukan lewat isi STOPWORDS (yang tidak diekspor).
    for (const topic of TOPICS) {
      for (const key of topic.keys) {
        if (key.includes(' ')) continue;
        expect(matchTopic(key), `${topic.id}: "${key}" tidak memicu apa pun`).not.toBeNull();
      }
    }
  });

  it('setiap jawaban terisi dan setiap tautan punya bentuk yang sah', () => {
    for (const topic of TOPICS) {
      expect(topic.answer.trim().length, topic.id).toBeGreaterThan(0);
      for (const link of topic.links ?? []) {
        expect(link.label.trim().length).toBeGreaterThan(0);
        expect(link.href, `${topic.id} → ${link.href}`).toMatch(/^(https:\/\/|mailto:|\/)/);
      }
    }
  });

  it('GREETING & FALLBACK bukan string kosong', () => {
    expect(GREETING.trim().length).toBeGreaterThan(0);
    // FALLBACK memuat email supaya pengunjung tetap punya jalan keluar.
    expect(FALLBACK).toContain('@');
  });
});

describe('chipsFor', () => {
  it('mengembalikan id + label untuk topik yang punya chip', () => {
    expect(chipsFor(['contact'])).toEqual([{ id: 'contact', label: topicById('contact')!.chip }]);
  });

  it('melewati id yang tidak dikenal & topik tanpa chip, tanpa melempar', () => {
    const chipless = TOPICS.find((topic) => !topic.chip)!.id;
    expect(chipsFor(['tidak-ada', chipless])).toEqual([]);
  });

  it('mempertahankan urutan yang diminta', () => {
    expect(chipsFor(['contact', 'skills']).map((chip) => chip.id)).toEqual(['contact', 'skills']);
  });
});
