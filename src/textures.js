// DOOM WAD Engine — текстуры и флаты из WAD.

import { STATE } from './state.js';
import { dat, dvOf } from './util.js';
import { anT } from './data.js';

export function getTex(n) {
        if (n === '-' || !n) return null; n = anT(n); if (n in STATE.tc) return STATE.tc[n]; const def = STATE.td[n]; if (!def) return STATE.tc[n] = null;
        const d = new Uint16Array(def.w * def.h).fill(65535);
        for (const p of def.p) {
          const lp = STATE.byName[STATE.pn[p.p]]; if (!lp) continue; const b = dat(lp), v = dvOf(b), pw = v.getInt16(0, 1);
          for (let cx = 0; cx < pw; cx++) {
            const x = cx + p.ox; if (x < 0 || x >= def.w) continue; let o = v.getInt32(8 + cx * 4, 1);
            while (b[o] !== 255) {const top = b[o], len = b[o + 1]; for (let k = 0; k < len; k++) {const y = top + k + p.oy; if (y >= 0 && y < def.h) d[x * def.h + y] = b[o + 3 + k]} o += len + 4}
          }
        }
        return STATE.tc[n] = {w: def.w, h: def.h, d}
      }
export function flatData(n) {const l = STATE.byName[n]; return l && l.s >= 4096 ? dat(l) : null}
export const isSw = function isSw(n) {return STATE.SWM ? !!STATE.SWM[n] : /^SW[12]/.test(n || '')};
