// Service worker do Cofrinho.
// Estrategia: tudo que o app ja carregou uma vez fica guardado e funciona sem internet.
// Nao ha precache de nomes fixos porque o Vite gera arquivos com hash no build.

const CACHE = 'cofrinho-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./', './manifest.webmanifest', './icone.svg']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  const mesmaOrigem = url.origin === self.location.origin
  const fonte = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
  if (!mesmaOrigem && !fonte) return

  // Navegacao: tenta a rede, cai pro cache (app abre offline).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone()
          caches.open(CACHE).then((c) => c.put('./', copia))
          return res
        })
        .catch(() => caches.match('./').then((r) => r || caches.match(req)))
    )
    return
  }

  // Demais recursos: responde do cache e atualiza em segundo plano.
  event.respondWith(
    caches.match(req).then((cacheado) => {
      const rede = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copia = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copia))
          }
          return res
        })
        .catch(() => cacheado)
      return cacheado || rede
    })
  )
})
