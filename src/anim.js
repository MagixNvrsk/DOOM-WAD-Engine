// DOOM WAD Engine — анимации текстур и скроллинги.

import { STATE } from './state.js';
import { door } from './sectors.js';
import { NG } from './net.js';

export function tmr(dt) {if (NG()) return; for (let i = STATE.timedS.length - 1; i >= 0; i--) {const q = STATE.timedS[i]; q.t -= dt; if (q.t <= 0) {if (q.o) door(q.s, 1, 0, false); else door(q.s, 0, 0, true); STATE.timedS.splice(i, 1)} } }
