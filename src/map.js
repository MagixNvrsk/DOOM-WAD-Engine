// DOOM WAD Engine — модуль map.
import { STATE } from './state.js';
import { dat, dvOf, s8 } from './util.js';
import { flatData, getTex } from './textures.js';
import { parseUdmf, xnod } from './wad.js';
import { cv } from './main.js';
import { initGame, showStory } from './game.js';
import { startMusic } from './music.js';
import { netLevel } from './net.js';
import { F_CORPSE, F_NOBM, F_SHOOT, F_SOLID, F_SPECIAL, T, av, sh } from './data.js';
import { nb } from './combat.js';
import { near } from './bot.js';
import { GS } from './config.js';
import { door } from './sectors.js';
import { seg } from './map2.js';

export function loadMap(i) {
        const m = {}; for (let k = i + 1; k < STATE.L.length && k <= i + 12; k++) {if (/^(E\dM\d|MAP\d\d)$/.test(STATE.L[k].n)) break; m[STATE.L[k].n] = dat(STATE.L[k])}
        const rd = (d, s, cb) => {const v = dvOf(d), r = []; for (let o = 0; o + s <= d.length; o += s)r.push(cb(v, o, d)); return r};
        let vx, sec, sd, ln, th, sg, ss, nodes; const udmf = !!m.TEXTMAP, hex = !udmf && !!m.BEHAVIOR;
        const mkS = (f, c, ft, ct, l, sp, tag) => ({f, c, l, sky: ct.startsWith('F_SKY'), fd: flatData(ft), cd: flatData(ct), tag, sp, ftn: ft, ctn: ct, l0: l});
        if (udmf) {
          const U = parseUdmf(new TextDecoder().decode(m.TEXTMAP)); if (/zdoom/i.test(U._ns || '')) throw Error('Карта в формате ZDoom (UDMF, namespace ' + U._ns + ') не поддерживается'); const z = U._ns !== 'doom', nu = n => String(n || '-').toUpperCase();
          vx = (U.vertex || []).map(o => ({x: o.x, y: o.y})); sec = (U.sector || []).map(o => mkS(o.heightfloor | 0, o.heightceiling | 0, nu(o.texturefloor), nu(o.textureceiling), o.lightlevel === undefined ? 160 : o.lightlevel, o.special | 0, o.id | 0));
          sd = (U.sidedef || []).map(o => ({xo: o.offsetx | 0, yo: o.offsety | 0, u: nu(o.texturetop), l: nu(o.texturebottom), m: nu(o.texturemiddle), s: o.sector | 0}));
          ln = (U.linedef || []).map(o => {
            const fl = (o.blocking ? 1 : 0) | (o.blockmonsters ? 2 : 0) | (o.twosided ? 4 : 0) | (o.dontpegtop ? 8 : 0) | (o.dontpegbottom ? 16 : 0) | (o.secret ? 32 : 0) | (o.dontdraw ? 128 : 0) | (o.repeatspecial ? 0x2000 : 0);
            const l = {a: o.v1, b: o.v2, fl, r: o.sidefront === undefined ? -1 : o.sidefront, l: o.sideback === undefined ? -1 : o.sideback, sp: o.special | 0, tag: o.id | 0};
            if (z && l.sp) {l.hx = [o.arg0 | 0, o.arg1 | 0, o.arg2 | 0, o.arg3 | 0, o.arg4 | 0]; l.hw = !!(o.playercross || o.monstercross); l.tag = l.hx[0]; l.sp += 1000} else if (!z && !l.tag && o.arg0) l.tag = o.arg0; return l
          });
          th = (U.thing || []).map(o => {let f = 0; const sk = [o.skill1, o.skill2, o.skill3, o.skill4, o.skill5]; if (sk.every(q => q === undefined)) f = 7; else {if (sk[0] || sk[1]) f |= 1; if (sk[2]) f |= 2; if (sk[3] || sk[4]) f |= 4} if (o.ambush) f |= 8; if (o.single === false) f |= 16; return {x: o.x | 0, y: o.y | 0, a: o.angle | 0, t: o.type | 0, f, tid: o.id | 0}})
        }
        else {
          vx = rd(m.VERTEXES, 4, (v, o) => ({x: v.getInt16(o, 1), y: v.getInt16(o + 2, 1)}));
          sec = rd(m.SECTORS, 26, (v, o, d) => mkS(v.getInt16(o, 1), v.getInt16(o + 2, 1), s8(d, o + 4), s8(d, o + 12), v.getInt16(o + 20, 1), v.getInt16(o + 22, 1), v.getInt16(o + 24, 1)));
          sd = rd(m.SIDEDEFS, 30, (v, o, d) => ({xo: v.getInt16(o, 1), yo: v.getInt16(o + 2, 1), u: s8(d, o + 4), l: s8(d, o + 12), m: s8(d, o + 20), s: v.getInt16(o + 28, 1)}));
          if (hex) {
            ln = rd(m.LINEDEFS, 16, (v, o, d) => {
              const fl = v.getUint16(o + 4, 1), spec = d[o + 6], l = {a: v.getInt16(o, 1), b: v.getInt16(o + 2, 1), fl: (fl & 0xFF) | (fl & 0x2000), r: v.getInt16(o + 12, 1), l: v.getInt16(o + 14, 1), sp: 0, tag: 0};
              if (spec) {const sc = (fl >> 10) & 7; l.hx = [d[o + 7], d[o + 8], d[o + 9], d[o + 10], d[o + 11]]; l.sp = 1000 + spec; l.hw = sc === 0 || sc === 5; l.tag = l.hx[0]} return l
            });
            th = rd(m.THINGS, 20, (v, o) => {const fl = v.getUint16(o + 12, 1); return {tid: v.getInt16(o, 1), x: v.getInt16(o + 2, 1), y: v.getInt16(o + 4, 1), a: v.getInt16(o + 8, 1), t: v.getInt16(o + 10, 1), f: (fl & 7) | ((fl & 0x80) ? 0 : 16) | ((fl & 8) ? 8 : 0)}})
          }
          else {
            ln = rd(m.LINEDEFS, 14, (v, o) => ({a: v.getInt16(o, 1), b: v.getInt16(o + 2, 1), fl: v.getInt16(o + 4, 1), r: v.getInt16(o + 10, 1), l: v.getInt16(o + 12, 1), sp: v.getInt16(o + 6, 1), tag: v.getInt16(o + 8, 1)}));
            th = rd(m.THINGS, 10, (v, o) => ({x: v.getInt16(o, 1), y: v.getInt16(o + 2, 1), a: v.getInt16(o + 4, 1), t: v.getInt16(o + 6, 1), f: v.getInt16(o + 8, 1)}))
          }
        }
        const nd = m.ZNODES || m.NODES, cv = c => c & 0x8000 ? 0x40000000 | (c === 0xFFFF ? 0 : c & 0x7FFF) : c;
        if (nd && nd.length > 8 && nd[0] === 88 && nd[1] === 78 && nd[2] === 79 && nd[3] === 68) {const X = xnod(nd, vx, ln, sd, sec); vx = X.vx; sg = X.sg; ss = X.ss; nodes = X.nodes}
        else if (udmf || (nd && nd.length > 8 && nd[0] === 88 && nd[1] === 71)) throw Error('\u0422\u0438\u043f \u0443\u0437\u043b\u043e\u0432 BSP \u043d\u0435 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442\u0441\u044f (\u043d\u0443\u0436\u043d\u044b XNOD/ZNOD)');
        else {
          sg = rd(m.SEGS, 12, (v, o) => {
            const a = v.getInt16(o, 1), b = v.getInt16(o + 2, 1), ld = ln[v.getInt16(o + 6, 1)], side = v.getInt16(o + 8, 1);
            const fs = side ? ld.l : ld.r, bs = side ? ld.r : ld.l, A = vx[a], B = vx[b];
            return {a, b, ld, fl: ld.fl, off: v.getInt16(o + 10, 1), len: Math.hypot(B.x - A.x, B.y - A.y), fd: sd[fs], bd: bs >= 0 ? sd[bs] : null, fs: fs >= 0 ? sec[sd[fs].s] : null, bs: bs >= 0 ? sec[sd[bs].s] : null}
          });
          ss = rd(m.SSECTORS, 4, (v, o) => ({n: v.getInt16(o, 1), f: v.getInt16(o + 2, 1)}));
          nodes = rd(m.NODES, 28, (v, o) => ({x: v.getInt16(o, 1), y: v.getInt16(o + 2, 1), dx: v.getInt16(o + 4, 1), dy: v.getInt16(o + 6, 1), br: [v.getInt16(o + 8, 1), v.getInt16(o + 10, 1), v.getInt16(o + 12, 1), v.getInt16(o + 14, 1)], bl: [v.getInt16(o + 16, 1), v.getInt16(o + 18, 1), v.getInt16(o + 20, 1), v.getInt16(o + 22, 1)], c0: cv(v.getUint16(o + 24, 1)), c1: cv(v.getUint16(o + 26, 1))}))
        }
        const blk = []; for (const l of ln) {
          let b = l.l < 0 || (l.fl & 1);
          if (!b) {const f = sec[sd[l.r].s], k = sec[sd[l.l].s]; b = Math.abs(f.f - k.f) > 24 || Math.min(f.c, k.c) - Math.max(f.f, k.f) < 56}
          if (b) {const A = vx[l.a], B = vx[l.b]; blk.push({A, B, q: (B.x - A.x) ** 2 + (B.y - A.y) ** 2 || 1})}
        }
        STATE.map = {vx, sec, sg, ss, nodes, blk, ln, sd, th}; STATE.map.boomOk = !udmf && !hex; for (const l of ln) {l.A = vx[l.a]; l.B = vx[l.b]; l.fs = l.r >= 0 ? sec[sd[l.r].s] : null; l.bs = l.l >= 0 ? sec[sd[l.l].s] : null} initGame(th); startMusic(i); netLevel(i); {const nm = STATE.L[i].n, n2 = +nm.slice(3); STATE.skyName = nm[0] === 'E' ? 'SKY' + nm[1] : 'SKY' + (n2 < 12 ? 1 : n2 < 21 ? 2 : 3); STATE.skyT = getTex(STATE.skyName) || getTex('SKY1')} const p = th.find(t => t.t === 1) || th[0] || {x: 0, y: 0, a: 0};
        STATE.START = {x: p.x, y: p.y, a: p.a * Math.PI / 180}; STATE.px = p.x; STATE.py = p.y; STATE.ang = p.a * Math.PI / 180; STATE.eye = sectorAt(STATE.px, STATE.py).f + 41; try {showStory(STATE.L[i].n)} catch (e) { }
      }
export function sectorAt(x, y) {
        const N = STATE.map.nodes; let n = N.length ? N.length - 1 : 0x40000000;
        while (!(n & 0x40000000)) {const d = N[n]; n = ((y - d.y) * d.dx < (x - d.x) * d.dy) ? d.c0 : d.c1}
        const s = STATE.map.ss[n & 0x3FFFFFFF]; return STATE.map.sg[s.f].fs || STATE.map.sec[0]
      }
export function bvis(b) {if (STATE.px >= b[2] && STATE.px <= b[3] && STATE.py >= b[1] && STATE.py <= b[0]) return true; const tn = STATE.W / 2 / STATE.F * 1.1; let cl = 0, cr = 0, cn = 0; for (let k = 0; k < 4; k++) {const x = (k & 1 ? b[3] : b[2]) - STATE.px, y = (k & 2 ? b[0] : b[1]) - STATE.py, z = x * STATE.co + y * STATE.si, la = x * STATE.si - y * STATE.co; if (la + tn * z < 0) cl++; if (tn * z - la < 0) cr++; if (z < -1) cn++} return cl < 4 && cr < 4 && cn < 4}
export function bsp(n, bb) {
        if (STATE.closed >= STATE.W) return; if (bb && !bvis(bb)) return;
        if (n & 0x40000000) {const s = STATE.map.ss[n & 0x3FFFFFFF]; for (let i = 0; i < s.n; i++)seg(STATE.map.sg[s.f + i]); return }
        const d = STATE.map.nodes[n], s = ((STATE.py - d.y) * d.dx < (STATE.px - d.x) * d.dy) ? 0 : 1;
        bsp(s ? d.c1 : d.c0, s ? d.bl : d.br); bsp(s ? d.c0 : d.c1, s ? d.br : d.bl)
      }

// рендер-часть модуля map вынесена в map2 (импортирующие ссылаются на map.js)
export * from './map2.js';
