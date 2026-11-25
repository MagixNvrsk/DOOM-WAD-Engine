// DOOM WAD Engine — модуль map2 (плоскости, стены, сегменты, коллизии).
import { STATE } from './state.js';
import { T, av, sh, F_SOLID, F_SHOOT, F_SPECIAL, F_CORPSE, F_NOBM } from './data.js';
import { getTex } from './textures.js';
import { near } from './bot.js';
import { GS } from './config.js';
import { door } from './sectors.js';
import { gAdd } from './entities.js';

export function flat(x, y0, y1, s, c, h) {
        h = Math.abs(h) || 1; const fo = (c ? s.cox : s.fox) || 0, go = (c ? s.coy : s.foy) || 0, sk = c && s.sky, d = c ? s.cd : s.fd, dx = (x + .5 - STATE.W / 2) / STATE.F;
        for (let y = y0; y <= y1; y++) {
          if (sk) {if (STATE.skyT) {let r = (100 + (y - STATE.H2) * 200 / STATE.H) | 0; r = r < 0 ? 0 : r >= STATE.skyT.h ? STATE.skyT.h - 1 : r; let c = STATE.skyT.d[STATE.skyU[x] * STATE.skyT.h + r]; if (c === 65535) c = 0; STATE.buf[y * STATE.W + x] = STATE.pal[STATE.cm[c]]} else STATE.buf[y * STATE.W + x] = STATE.skyR[y]; continue}
          const z = h * STATE.F / Math.abs(y + .5 - STATE.H2 || .5), row = sh(s.l, z); STATE.zb[y * STATE.W + x] = z;
          if (STATE.Q && d) {
            const dz = z * z / (h * STATE.F), ns = dz > 2 ? 3 : 1; let R = 0, G = 0, B = 0;
            for (let k = 0; k < ns; k++) {const zz = z + (k - (ns - 1) / 2) * dz * .5, la = dx * zz, q = bl(d, 64, 64, 1, 64, STATE.px + STATE.co * zz + STATE.si * la - fo, STATE.py + STATE.si * zz - STATE.co * la - go, row << 8); R += q & 255; G += q >> 8 & 255; B += q >> 16 & 255}
            R /= ns; G /= ns; B /= ns;
            if (z > 350) {const f = Math.min(1, (z - 350) / 600), m = avg(d), k = 1 - row / 34; R += (m[0] * k - R) * f; G += (m[1] * k - G) * f; B += (m[2] * k - B) * f}
            STATE.buf[y * STATE.W + x] = 0xFF000000 | (B << 16) | (G << 8) | R; continue
          }
          const lat = dx * z, wx = Math.floor(STATE.px + STATE.co * z + STATE.si * lat - fo), wy = Math.floor(STATE.py + STATE.si * z - STATE.co * lat - go);
          STATE.buf[y * STATE.W + x] = STATE.pal[STATE.cm[(row << 8) | (d ? d[((wy & 63) << 6) | (wx & 63)] : 96)]]
        }
      }
export function bl(d, w, h, sx, sy, u, v, r) {
        u -= .5; v -= .5; const x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
        let xa = x0 % w; if (xa < 0) xa += w; let ya = y0 % h; if (ya < 0) ya += h; const xb = xa + 1 === w ? 0 : xa + 1, yb = ya + 1 === h ? 0 : ya + 1;
        const a = T(d, xa * sx + ya * sy, r), b = T(d, xb * sx + ya * sy, r), c = T(d, xa * sx + yb * sy, r), e = T(d, xb * sx + yb * sy, r), w1 = (1 - fx) * (1 - fy), w2 = fx * (1 - fy), w3 = (1 - fx) * fy, w4 = fx * fy;
        return 0xFF000000 | (((a >> 16 & 255) * w1 + (b >> 16 & 255) * w2 + (c >> 16 & 255) * w3 + (e >> 16 & 255) * w4) << 16) | (((a >> 8 & 255) * w1 + (b >> 8 & 255) * w2 + (c >> 8 & 255) * w3 + (e >> 8 & 255) * w4) << 8) | ((a & 255) * w1 + (b & 255) * w2 + (c & 255) * w3 + (e & 255) * w4)
      }
export function avg(d) {if (d.av) return d.av; let r = 0, g = 0, b = 0; for (let i = 0; i < 4096; i++) {const p = STATE.pal[d[i]]; r += p & 255; g += p >> 8 & 255; b += p >> 16 & 255} return d.av = [r / 4096, g / 4096, b / 4096]}
export function wall(x, y0, y1, n, top, ah, yo, z, u, l) {
        if (y0 > y1) return; const t = getTex(n); if (!t) return;
        const w = t.w, h = t.h, o = ((((u | 0) % w) + w) % w) * h, dv = z / STATE.F, r = sh(l, z) << 8; if (ah) top += h; for (let y = y0; y <= y1; y++)STATE.zb[y * STATE.W + x] = z;
        let v = top + yo - (STATE.eye + (STATE.H2 - y0 - .5) * dv);
        if (STATE.Q) {const a = dv > 1.2; for (let y = y0; y <= y1; y++, v += dv)STATE.buf[y * STATE.W + x] = a ? av(bl(t.d, w, h, h, 1, u, v - dv * .3, r), bl(t.d, w, h, h, 1, u, v + dv * .3, r)) : bl(t.d, w, h, h, 1, u, v, r); return }
        for (let y = y0; y <= y1; y++, v += dv) {let i = Math.floor(v) % h; if (i < 0) i += h; let c = t.d[o + i]; if (c === 65535) c = 0; STATE.buf[y * STATE.W + x] = STATE.pal[STATE.cm[r | c]]}
      }
export function eff(s) {if (!s || !s.tf) return s; return STATE.eye > s.tf.f ? s.vA : s.vB}
export function seg(sg) {const f = eff(sg.fs); if (f && f.cmap && STATE.cm === STATE.cm0) {STATE.cm = f.cmap; try {seg0(sg)} finally {STATE.cm = STATE.cm0} } else seg0(sg)}
export function seg0(sg) {
        const fr = eff(sg.fs), fd = sg.fd; if (!fr || !fd) return;
        const A = STATE.map.vx[sg.a], B = STATE.map.vx[sg.b];
        if ((B.x - A.x) * (STATE.py - A.y) - (B.y - A.y) * (STATE.px - A.x) >= 0) return;
        const ax = A.x - STATE.px, ay = A.y - STATE.py, bx = B.x - STATE.px, by = B.y - STATE.py;
        let z1 = ax * STATE.co + ay * STATE.si, x1 = ax * STATE.si - ay * STATE.co, z2 = bx * STATE.co + by * STATE.si, x2 = bx * STATE.si - by * STATE.co, u1 = sg.off, u2 = sg.off + sg.len;
        if (z1 < 1 && z2 < 1) return;
        if (z1 < 1) {const t = (1 - z1) / (z2 - z1); x1 += (x2 - x1) * t; u1 += (u2 - u1) * t; z1 = 1}
        else if (z2 < 1) {const t = (1 - z2) / (z1 - z2); x2 += (x1 - x2) * t; u2 += (u1 - u2) * t; z2 = 1}
        const sx1 = STATE.W / 2 + x1 * STATE.F / z1, sx2 = STATE.W / 2 + x2 * STATE.F / z2; if (sx1 >= sx2) return;
        const i0 = Math.max(0, Math.round(sx1)), i1 = Math.min(STATE.W - 1, Math.round(sx2) - 1); if (i0 > i1) return; sg.ld.seen = 1;
        const iz1 = 1 / z1, iz2 = 1 / z2, uz1 = u1 * iz1, uz2 = u2 * iz2, bk = eff(sg.bs), l = fr.l; if (bk && fd.m !== '-') STATE.masked.push({sg, sx1, sx2, iz1, iz2, uz1, uz2, i0, i1});
        for (let x = i0; x <= i1; x++) {
          const ct = STATE.clipT[x], cb = STATE.clipB[x]; if (ct > cb) continue;
          let t = (x + .5 - sx1) / (sx2 - sx1); t = t < 0 ? 0 : t > 1 ? 1 : t;
          const iz = iz1 + (iz2 - iz1) * t, z = 1 / iz, u = (uz1 + (uz2 - uz1) * t) / iz + fd.xo, k = STATE.F / z;
          const yt = Math.ceil(STATE.H2 - (fr.c - STATE.eye) * k), yb = Math.floor(STATE.H2 - (fr.f - STATE.eye) * k);
          const ytc = bk && fr.sky && bk.sky ? Math.ceil(STATE.H2 - (bk.c - STATE.eye) * k) : yt; if (ytc > ct) flat(x, ct, Math.min(ytc - 1, cb), fr, true, fr.c - STATE.eye);
          if (yb < cb) flat(x, Math.max(yb + 1, ct), cb, fr, false, STATE.eye - fr.f);
          if (!bk) {wall(x, Math.max(yt, ct), Math.min(yb, cb), fd.m, (sg.fl & 16) ? fr.f : fr.c, !!(sg.fl & 16), fd.yo, z, u, l); STATE.clipT[x] = STATE.H; STATE.clipB[x] = -1; STATE.closed++; continue}
          const bt = Math.ceil(STATE.H2 - (bk.c - STATE.eye) * k), bb = Math.floor(STATE.H2 - (bk.f - STATE.eye) * k);
          if (bk.c < fr.c && !(fr.sky && bk.sky)) wall(x, Math.max(yt, ct), Math.min(bt - 1, cb), fd.u, (sg.fl & 8) ? fr.c : bk.c, !(sg.fl & 8), fd.yo, z, u, l);
          if (bk.f > fr.f) wall(x, Math.max(bb + 1, ct), Math.min(yb, cb), fd.l, (sg.fl & 16) ? fr.c : bk.f, false, fd.yo, z, u, l);
          const nt = bk.c < fr.c ? bt : yt, nb = bk.f > fr.f ? bb : yb;
          if (nt > ct) STATE.clipT[x] = nt; if (nb < cb) STATE.clipB[x] = nb; if (STATE.clipT[x] > STATE.clipB[x]) STATE.closed++
        }
      }
export function bd(x, y, r, m, self, zf, fly) {
        r = r || 16; let best = 1e9; for (const e of STATE.mobs) {if (e.rm || !(e.fl & F_SOLID) || e === self) continue; const dd = Math.max(Math.abs(e.x - x), Math.abs(e.y - y)) - e.r; if (dd < best) best = dd}
        for (const l of near(x - r, y - r, x + r, y + r)) {
          const A = l.A, B = l.B; if (x < Math.min(A.x, B.x) - r || x > Math.max(A.x, B.x) + r || y < Math.min(A.y, B.y) - r || y > Math.max(A.y, B.y) + r) continue;
          if (l.bs && !(l.fl & 1) && !(m && l.fl & 2)) {const f = l.fs, k = l.bs, ob = Math.max(f.f, k.f), ot = Math.min(f.c, k.c); let ok; if (zf === undefined) ok = Math.abs(f.f - k.f) <= 24 && ot - ob >= 56; else ok = ot - ob >= (fly ? 32 : 56) && (fly || (ob <= zf + 24 && ot >= zf + 56 && (!m || Math.min(f.f, k.f) >= zf - 24))); if (ok) continue}
          const dx = B.x - A.x, dy = B.y - A.y; let t = ((x - A.x) * dx + (y - A.y) * dy) / (dx * dx + dy * dy || 1); t = t < 0 ? 0 : t > 1 ? 1 : t; const ex = A.x + dx * t - x, ey = A.y + dy * t - y; const dd = Math.hypot(ex, ey); if (dd < best) best = dd
        } return best
      }
export function blocked(x, y, r, m, self, zf, fly) {return bd(x, y, r, m, self, zf, fly) < (r || 16)}
export function buildGrid() {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const l of STATE.map.ln) {x0 = Math.min(x0, l.A.x, l.B.x); y0 = Math.min(y0, l.A.y, l.B.y); x1 = Math.max(x1, l.A.x, l.B.x); y1 = Math.max(y1, l.A.y, l.B.y)}
        STATE.GX0 = x0; STATE.GY0 = y0; STATE.GW = Math.max(1, Math.ceil((x1 - x0 + 1) / GS)); STATE.GH = Math.max(1, Math.ceil((y1 - y0 + 1) / GS)); STATE.GRID = Array.from({length: STATE.GW * STATE.GH}, () => []);
        for (const l of STATE.map.ln) {
          const a = Math.max(0, Math.floor((Math.min(l.A.x, l.B.x) - STATE.GX0) / GS)), b = Math.min(STATE.GW - 1, Math.floor((Math.max(l.A.x, l.B.x) - STATE.GX0) / GS)), c = Math.max(0, Math.floor((Math.min(l.A.y, l.B.y) - STATE.GY0) / GS)), d = Math.min(STATE.GH - 1, Math.floor((Math.max(l.A.y, l.B.y) - STATE.GY0) / GS));
          for (let cy = c; cy <= d; cy++)for (let cx = a; cx <= b; cx++)STATE.GRID[cy * STATE.GW + cx].push(l)
        }
      }
export function mdoor(e) {
        if (STATE.tm < (e.du || 0)) return; e.du = STATE.tm + .7; for (const l of near(e.x - 60, e.y - 60, e.x + 60, e.y + 60)) {
          if (!(l.sp === 1 || l.sp === 32 || l.sp === 33 || l.sp === 34) || !l.bs || (l.fl & 32)) continue;
          const A = l.A, B = l.B, dx = B.x - A.x, dy = B.y - A.y; let t = ((e.x - A.x) * dx + (e.y - A.y) * dy) / (dx * dx + dy * dy || 1); t = t < 0 ? 0 : t > 1 ? 1 : t; if (Math.hypot(A.x + dx * t - e.x, A.y + dy * t - e.y) > 48) continue;
          const sec = (dx * (e.y - A.y) - dy * (e.x - A.x) < 0) ? l.bs : l.fs; if (sec && sec.c <= sec.f + 8) {door(sec, l.sp !== 1, 0, false); return }
        }
      }
export function gridBuild() {STATE.TGR.clear(); for (const o of STATE.mobs) if (!o.rm && (o.fl & (F_SOLID | F_SHOOT | F_SPECIAL | F_CORPSE)) && !(o.fl & F_NOBM)) gAdd(o)}
