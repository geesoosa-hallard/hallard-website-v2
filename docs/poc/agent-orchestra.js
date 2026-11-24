/**
 * Orchestration tray: four distinct handoff plates resting in a console.
 * The plate under the pointer rises; the plates around it fan away so the
 * viewer can follow one request becoming a coordinated set of moves.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, open, poly, proj, rad, ringAt, rrect, run, seg,
  tdone, tset, tval, tween, disposer, mk, place, pointer, reflect, register,
} = HL;

const N = 4, W = 94, H = 48, G = 24, REST = -11, BACK = -22, FWD = 18, LIFT = 18;
const X0 = -6, X1 = W + 6, Y0 = -12, Y1 = (N - 1) * G + 12, WH = 19, WR = 7, WT = 2.5;

const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

function tray(P, front, outer, inner) {
  const far = [
    [poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), 'sil'],
    [poly(ringAt(P, inner, WH)), 'nf'],
    [open(ringAt(P, run(inner, (q) => !front(q)), 2.5)), 'nf lo'],
  ];
  const iF = LR(ringAt(P, run(inner, front), WH));
  const oT = LR(ringAt(P, run(outer, front), WH));
  const oB = LR(ringAt(P, run(outer, front), 0));
  const onFront = (ring) => ring.map((q) => P(q.u, Y1, q.v));
  const near = [
    [poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), 'fo'],
    [open(oT), 'nf lo'],
    [open(iF), 'nf'],
    [open([oT[0], ...oB, oT[oT.length - 1]]), 'nf sil'],
    [poly(onFront(rrect(34, 6, 60, 12, 3, 6))), 'nf'],
    [poly(onFront(rrect(37, 8, 57, 10.5, 1.4, 5))), 'nf lo'],
  ];
  return { far, near };
}

function plate(i) {
  const slot = [13, 33, 53, 73][i];
  const shape = fillet([[0, 0], [W, 0], [W, H], [slot + 14, H], [slot + 14, H + 7], [slot, H + 7], [slot, H], [0, H]], [1, 1, 3.2, 1.8, 2.4, 2.4, 1.8, 3.2]);
  return { slot, shape };
}

function pose(P, i, slot, shape, th, lift) {
  const yb = i * G, s = Math.sin(rad(th)), c = Math.cos(rad(th));
  const w = (u, v) => P(u, yb + v * s, v * c + lift);
  const wb = (u, v) => P(u, yb + v * s - 1.5 * c, v * c + 1.5 * s + lift);
  const dots = [-7, -2.4, 2.4, 7].map((x, k) => w(slot + 7 + x, H + 3.5 + (k % 2 ? 1.4 : -1.4)));
  return {
    back: poly(shape.map((p) => wb(p[0], p[1]))),
    face: poly(shape.map((p) => w(p[0], p[1]))),
    head: seg(w(7, H - 12), w(W - 7, H - 12)),
    rules: [H - 20, H - 28, H - 35].map((v) => seg(w(7, v), w(W - 7, v))).join(''),
    dots,
  };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stagger = value;
  const C = Cam(45, 0.5, 1.62);
  fit(C, [[X0, Y0, 0], [X1, Y1, -8], [X1, Y0, 0], [X0, Y1, 0], [X0, Y0, H + 8], [X1, Y0, H + 8 + LIFT]], 198, 167);
  const P = proj(C), front = facing(C);
  const outer = rrect(X0, Y0, X1, Y1, WR, 6), inner = rrect(X0 + WT, Y0 + WT, X1 - WT, Y1 - WT, WR - WT, 6);
  const paths = tray(P, front, outer, inner);
  const g = mk('g', {}, svg);
  reflect(svg, g, P, front, outer, 0, 14);
  paths.far.forEach(([d, cls]) => mk('path', { d, class: cls }, g));

  const plates = [];
  for (let i = 0; i < N; i++) {
    const { slot, shape } = plate(i), grp = mk('g', {}, g);
    const back = mk('path', { class: 'lo' }, grp), face = mk('path', { class: 'sil' }, grp);
    const head = mk('path', { class: 'nf' }, grp), rules = mk('path', { class: 'nf lo' }, grp);
    const dots = Array.from({ length: 4 }, () => mk('circle', { r: 1.05, class: 'dot off' }, grp));
    plates.push({ slot, shape, back, face, head, rules, dots, a: tween(REST), z: tween(0) });
  }
  paths.near.forEach(([d, cls]) => mk('path', { d, class: cls }, g));

  const top = (i) => P(W / 2, i * G + H * Math.sin(rad(REST)), H * Math.cos(rad(REST)));
  const c0 = top(0), c1 = top(1), d = [c1[0] - c0[0], c1[1] - c0[1]];
  const px0 = P(0, 0, 0), px1 = P(1, 0, 0), ex = [px1[0] - px0[0], px1[1] - px0[1]];
  const half = W / 2 + 7, det = d[0] * ex[1] - d[1] * ex[0];
  function hit([x, y]) {
    const qx = x - c0[0], qy = y - c0[1];
    const s = (qx * ex[1] - qy * ex[0]) / det, r = (d[0] * qy - d[1] * qx) / det;
    return Math.abs(r) > half || s < -0.5 || s > N - .5 ? -1 : clamp(Math.round(s), 0, N - 1);
  }
  function draw(i, th, lift) {
    const it = plates[i], q = pose(P, i, it.slot, it.shape, th, lift);
    it.back.setAttribute('d', q.back); it.face.setAttribute('d', q.face); it.head.setAttribute('d', q.head); it.rules.setAttribute('d', q.rules);
    it.dots.forEach((dot, k) => place(dot, q.dots[k]));
  }
  const B = register(stage, (_dt, now) => {
    let moving = false;
    plates.forEach((it, i) => { draw(i, tval(it.a, now), tval(it.z, now)); if (!tdone(it.a, now) || !tdone(it.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);
  let active = -1;
  function setActive(next) {
    if (next === active) return;
    const now = performance.now(), from = next >= 0 ? next : active;
    active = next;
    plates.forEach((it, i) => {
      const delay = Math.abs(i - from) * stagger;
      tset(it.a, next < 0 ? REST : i < next ? BACK : i > next ? FWD : 0, now, delay);
      tset(it.z, i === next ? LIFT : 0, now, delay);
      it.face.classList.toggle('hi', i === next); it.head.classList.toggle('hi', i === next);
      it.dots.forEach((dot) => dot.classList.toggle('m', i === next));
    });
    read.textContent = next < 0 ? 'rest' : `0${next + 1}`;
    B.wake();
  }
  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { stagger = v; }, destroy: bag.dispose };
}

hairline({
  name: 'agent-orchestra',
  means: 'Four handoff plates resting in one orchestration tray; a selected plate rises while adjacent work parts to make the handoff legible.',
  rules: [1, 2, 8, 10],
  range: [0, 28, 80],
  tour: [[160, 154], [205, 130], [270, 116], null],
  mount,
});
