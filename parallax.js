/* Builds the hero: hills made of piled-up popsicle sticks in four depths (always the same pile: seeded), and moves
   each depth at its own speed as the page scrolls, the far ones slowest. */
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const NS = 'http://www.w3.org/2000/svg';
  // depth: colour, how high the pile reaches (of 900), stick size, how many, speed, how far it drops in with scrolling
  const LAYERS = [                                    // rows of standing popsicle sticks, like a forest: far rows small and pale
    { col: 'var(--l1)', top: 520, h: [120, 260], w: [16, 22], gap: 26, speed: 0.12 },
    { col: 'var(--l2)', top: 600, h: [150, 320], w: [22, 30], gap: 34, speed: 0.26 },
    { col: 'var(--l3)', top: 690, h: [180, 380], w: [30, 40], gap: 46, speed: 0.42 },
    { col: 'var(--l4)', top: 780, h: [220, 440], w: [40, 52], gap: 62, speed: 0.62 },
  ];
  const ridge = (x, k) => Math.sin(x / 260 + k * 1.7) * 38 + Math.sin(x / 113 + k) * 18;   // a gentle rolling skyline
  const els = [];
  LAYERS.forEach((L, k) => {
    const layer = document.createElement('div'); layer.className = 'layer';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 1600 900'); svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
    const g = document.createElementNS(NS, 'g'); g.setAttribute('fill', L.col);
    // the solid body of the hill under the sticks
    let d = `M0 900 L0 ${L.top + 70 + ridge(0, k)}`;
    for (let x = 0; x <= 1600; x += 40) d += ` L${x} ${L.top + 70 + ridge(x, k)}`;
    d += ' L1600 900 Z';
    const body = document.createElementNS(NS, 'path'); body.setAttribute('d', d); g.appendChild(body);
    // the sticks, standing up out of the hill (a little crooked), some in clumps, some alone
    for (let x = -40; x < 1660; x += L.gap * (0.55 + rnd() * 0.9)) {
      if (rnd() < 0.18) { x += L.gap * 1.6; continue; }              // a clearing now and then
      const h = L.h[0] + rnd() * (L.h[1] - L.h[0]), w = L.w[0] + rnd() * (L.w[1] - L.w[0]);
      const base = L.top + 70 + ridge(x, k) + 10, ang = (rnd() - 0.5) * 14;
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', (-w / 2).toFixed(1)); r.setAttribute('y', (-h).toFixed(1)); r.setAttribute('width', w.toFixed(1)); r.setAttribute('height', (h + 40).toFixed(1)); r.setAttribute('rx', (w / 2).toFixed(1));
      r.setAttribute('transform', `translate(${x.toFixed(1)} ${base.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      g.appendChild(r);
    }
    svg.appendChild(g); layer.appendChild(svg);
    hero.appendChild(layer); els.push([layer, L.speed]);
  });
  // the ground the content sits on: the nearest hill blends into it
  const ground = document.createElement('div'); ground.className = 'layer';
  ground.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"><path fill="var(--ground)" d="M0 900 L0 ${830} ${Array.from({ length: 41 }, (_, i) => `L${i * 40} ${838 + Math.sin(i * 0.7) * 14 + Math.sin(i * 0.23) * 10}`).join(' ')} L1600 900 Z"/></svg>`;
  hero.appendChild(ground); els.push([ground, 0.8]);
  const title = hero.querySelector('.title'), sun = hero.querySelector('.sun');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;
  function place() {
    ticking = false;
    const y = Math.min(window.scrollY, hero.offsetHeight);
    for (const [el, s] of els) el.style.transform = `translate3d(0,${(y * (1 - s) * 0.55).toFixed(1)}px,0)`;   // nearer = moves with the page more
    if (sun) sun.style.transform = `translate(-50%,calc(-50% + ${(y * 0.5).toFixed(1)}px))`;
    if (title) { title.style.transform = `translate3d(0,${(y * 0.7).toFixed(1)}px,0)`; title.style.opacity = Math.max(0, 1 - y / (hero.offsetHeight * 0.55)).toFixed(3); }
  }
  if (!still) { addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(place); } }, { passive: true }); place(); }
})();
