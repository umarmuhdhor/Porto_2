# Membuat ulang `public/models/brand-object-poster.webp`

Poster fallback (M4 §3.6) adalah render dari objek yang sama, bukan ilustrasi
terpisah — supaya pergantian poster→canvas tidak terlihat sebagai lompatan
bentuk. Jalankan prosedur ini **setiap kali geometri di
`scripts/generate-brand-object.mjs` berubah**.

Tidak bisa di-otomatiskan lewat script Node: merender `.glb` butuh WebGL, dan
WebGL butuh browser. Karena itu caranya route dev sementara — sengaja TIDAK
ikut dikirim ke produksi.

## Langkah

1. `pnpm run gen:model` — pastikan `.glb`-nya sudah versi terbaru.

2. Buat `app/dev-poster/page.tsx`:

```tsx
'use client';

import { Suspense, useEffect } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { MODEL_URL } from '@/components/three/FloatingObject';

function Model() {
  const { scene } = useLoader(GLTFLoader, MODEL_URL);
  const box = new Box3().setFromObject(scene);
  const center = box.getCenter(new Vector3()).multiplyScalar(-1);
  const size = box.getSize(new Vector3());
  // 2.0 = FIT_SIZE di FloatingObject.tsx. Samakan kalau di sana diubah.
  const scale = 2.0 / Math.max(size.x, size.y, size.z);
  return (
    <group rotation={[0.1, 0.6, -0.06]} position={[0, 0, -0.4]}>
      <primitive object={scene} position={center.toArray()} scale={scale} />
    </group>
  );
}

function Expose() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    Object.assign(window, {
      __capture: () => {
        gl.render(scene, camera);
        return gl.domElement.toDataURL('image/webp', 0.92);
      },
    });
  }, [gl, scene, camera]);
  return null;
}

export default function DevPoster() {
  return (
    <div style={{ width: 720, height: 720 }}>
      {/* preserveDrawingBuffer wajib: tanpa ini toDataURL mengembalikan frame kosong. */}
      <Canvas
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        dpr={1}
        camera={{ position: [0, 0, 4.4], fov: 34 }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 4, 5]} intensity={2.4} />
        <directionalLight position={[-4, -2, -3]} intensity={0.9} color="#ffd9c9" />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <Expose />
      </Canvas>
    </div>
  );
}
```

   Lighting & kamera HARUS sama persis dengan `components/three/Scene.tsx`.
   Beda satu nilai saja, poster akan terlihat "berkedip ganti warna" saat
   canvas mengambil alih.

3. Buat `app/dev-poster/save/route.ts` (menghindari copy-paste base64 30KB):

```ts
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function POST(request: Request) {
  const { dataUrl } = (await request.json()) as { dataUrl: string };
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const out = resolve(process.cwd(), 'public/models/brand-object-poster.webp');
  await writeFile(out, Buffer.from(base64, 'base64'));
  return Response.json({ ok: true, out });
}
```

4. `pnpm dev`, buka `/dev-poster`, lalu di console:

```js
fetch('/dev-poster/save', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ dataUrl: window.__capture() }),
}).then((r) => r.json());
```

5. **Hapus `app/dev-poster/`.** Route ini menulis file dari request HTTP —
   tidak boleh ada di bundle produksi.

6. Cek hasilnya punya alpha (latar transparan, bukan putih):

```bash
node -e "const b=require('fs').readFileSync('public/models/brand-object-poster.webp');console.log(b.toString('ascii',12,16), b[20].toString(2).padStart(8,'0'))"
```

   Harus `VP8X` dengan bit ke-4 dari kiri = 1. Latar putih solid akan tampak
   sebagai kotak putih di atas section cream.

## Catatan

Ukuran render 720x720 mengikuti `POSTER_SIZE` di `components/three/Poster.tsx`.
Kalau salah satu diubah, ubah keduanya.
