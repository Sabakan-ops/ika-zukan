// 自動生成（scripts/postbuild.mjs）。一度ひらけばオフラインでも遊べるようにする
const CACHE = 'ika-zukan-645e8da2544a';
const FILES = [
  "./",
  "./assets/index-DLX3zNH5.js",
  "./assets/style-n5-cmlUT.css",
  "./icon.svg",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const old = (await caches.keys()).filter((k) => k.startsWith('ika-zukan-') && k !== CACHE);
    await Promise.all(old.map((k) => caches.delete(k)));
    await self.clients.claim();
    // 古い版を開いている画面があれば、新しい版で開きなおす
    if (old.length > 0) {
      const wins = await self.clients.matchAll({ type: 'window' });
      for (const w of wins) w.navigate(w.url).catch(() => {});
    }
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // ページ本体（HTML）はネットを優先して、つねに最新版を読む。オフラインのときだけ保存した版を使う
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req.url, { cache: 'no-cache' })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }
  // 画像や JS は名前に版の印がついているので、保存した版を優先してよい
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
