// Injected into every recorded page (Playwright addInitScript).
// Draws a visible cursor, click ripples, lower-third captions, highlight boxes and a smooth camera zoom.
// Everything lives in a host attached to <html> (outside <body>) and ignores pointer events.
(() => {
  if (window.__ov) return
  const css = `
  #__ovh{position:fixed;inset:0;pointer-events:none;z-index:2147483647;font-family:Inter,system-ui,sans-serif}
  #__ovh .cur{position:absolute;left:0;top:0;width:26px;height:26px;transform:translate(-100px,-100px);transition:opacity .25s;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
  #__ovh .rip{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid rgba(59,91,253,.85);background:rgba(59,91,253,.18);animation:__rip .55s ease-out forwards}
  @keyframes __rip{from{transform:scale(.25);opacity:1}to{transform:scale(1.25);opacity:0}}
  #__ovh .cap{position:absolute;left:40px;bottom:36px;max-width:min(980px,calc(100% - 80px));display:flex;align-items:stretch;border-radius:16px;overflow:hidden;
    background:rgba(11,16,32,.88);backdrop-filter:blur(10px);box-shadow:0 18px 50px rgba(11,16,32,.35);color:#fff;
    transform:translateY(24px);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .45s}
  #__ovh .cap.on{transform:none;opacity:1}
  #__ovh .cap .bar{width:6px;background:linear-gradient(#5B7BFF,#3B5BFD)}
  #__ovh .cap .tx{padding:14px 22px 15px 18px}
  #__ovh .cap .lb{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8FA4FF}
  #__ovh .cap .mn{margin-top:3px;font-size:21px;font-weight:600;line-height:1.3;letter-spacing:-.01em}
  #__ovh .hl{position:absolute;border:3px solid #3B5BFD;border-radius:14px;box-shadow:0 0 0 9999px rgba(11,16,32,.28),0 0 30px rgba(59,91,253,.55);
    opacity:0;transition:all .5s cubic-bezier(.2,.8,.2,1)}
  #__ovh .hl.on{opacity:1}
  #__ovh .info{position:absolute;right:40px;top:90px;width:430px;padding:18px 20px;border-radius:16px;background:rgba(11,16,32,.92);color:#E6EAFF;
    font:500 14px/1.55 "JetBrains Mono",ui-monospace,monospace;box-shadow:0 18px 50px rgba(11,16,32,.35);opacity:0;transform:translateY(-10px);transition:all .45s}
  #__ovh .info.on{opacity:1;transform:none}
  #__ovh .info b{color:#8FA4FF;font-weight:700}
  body{transform-origin:0 0;transition:transform 1.1s cubic-bezier(.45,0,.2,1)}
  `
  let host, cur, cap, hl, info
  function mount() {
    if (host && host.isConnected) return
    const st = document.createElement('style'); st.textContent = css
    host = document.createElement('div'); host.id = '__ovh'
    host.innerHTML = `<svg class="cur" viewBox="0 0 26 26"><path d="M4 2.5l17 10.2-7.4 1.6 4.3 8.2-3.1 1.6-4.3-8.2L4 21.3z" fill="#fff" stroke="#0B1020" stroke-width="1.6" stroke-linejoin="round"/></svg>
      <div class="hl"></div><div class="info"></div>
      <div class="cap"><div class="bar"></div><div class="tx"><div class="lb"></div><div class="mn"></div></div></div>`
    document.documentElement.appendChild(st)
    document.documentElement.appendChild(host)
    cur = host.querySelector('.cur'); cap = host.querySelector('.cap'); hl = host.querySelector('.hl'); info = host.querySelector('.info')
  }
  let mx = -100, my = -100
  addEventListener('mousemove', (e) => { mount(); mx = e.clientX; my = e.clientY; cur.style.transform = `translate(${mx - 4}px,${my - 2}px)` }, true)
  addEventListener('mousedown', (e) => {
    mount(); const r = document.createElement('div'); r.className = 'rip'
    r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; host.appendChild(r); setTimeout(() => r.remove(), 700)
  }, true)
  window.__ov = {
    caption(label, text) {
      mount()
      const show = () => { cap.querySelector('.lb').textContent = label; cap.querySelector('.mn').textContent = text; cap.classList.add('on') }
      if (cap.classList.contains('on')) { cap.classList.remove('on'); setTimeout(show, 350) } else show()
    },
    hideCaption() { mount(); cap.classList.remove('on') },
    highlight(x, y, w, h) { mount(); Object.assign(hl.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); hl.classList.add('on') },
    hideHighlight() { mount(); hl.classList.remove('on') },
    info(html) { mount(); info.innerHTML = html; info.classList.add('on') },
    hideInfo() { mount(); info.classList.remove('on') },
    cursor(visible) { mount(); cur.style.opacity = visible ? '1' : '0' },
    // camera: scale s, keeping point (cx, cy) centred where possible
    zoom(s, cx, cy, ms = 1100) {
      const W = innerWidth, H = innerHeight
      document.body.style.transition = `transform ${ms}ms cubic-bezier(.45,0,.2,1)`
      if (s <= 1) { document.body.style.transform = ''; return }
      const tx = Math.min(0, Math.max(W - W * s, W / 2 - cx * s))
      const ty = Math.min(0, Math.max(H - H * s, H / 2 - cy * s))
      document.body.style.transform = `translate(${tx}px,${ty}px) scale(${s})`
    },
  }
  if (document.readyState !== 'loading') mount(); else addEventListener('DOMContentLoaded', mount)
})()
