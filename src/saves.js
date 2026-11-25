// DOOM WAD Engine — сохранения и загрузка в localStorage.

import { STATE } from './state.js';
import { $ } from './util.js';
import { loadMap, sectorAt } from './map.js';
import { isSw } from './textures.js';
import { ITM } from './data.js';
import { msg, resetP } from './player.js';
import { desMobs, serMobs } from './entities.js';

export const sigW = function sigW() {return STATE.L.length + ':' + STATE.L.reduce((a, l) => a + l.s, 0)};
export function saveG(slot) {try {if (STATE.map) localStorage[slot || 'dsave'] = JSON.stringify(snap())} catch (e) { } }
export function loadSlot(k) {try {const sv = JSON.parse(localStorage[k]); if (!sv || sv.sig !== sigW()) {msg('\u041d\u0435\u0442 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f'); return } STATE.SKM = sv.sk || STATE.SKM; STATE.DIF = sv.df | 0; resetP(); STATE.curIdx = sv.ci; loadMap(STATE.curIdx); applySnap(sv); msg('\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043e')} catch (e) {msg('\u041e\u0448\u0438\u0431\u043a\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438')} }
export function snap() {
        const sI = new Map(STATE.map.sec.map((s, i) => [s, i])), eI = new Map(STATE.ents.map((e, i) => [e, i])), sw = {}; STATE.map.sd.forEach((q, i) => {if (isSw(q.u) || isSw(q.l) || isSw(q.m)) sw[i] = [q.u, q.l, q.m]});
        const seen = []; STATE.map.ln.forEach((l, i) => {if (l.seen) seen.push(i)});
        return {
          sig: sigW(), lv: STATE.L[STATE.curIdx].n, ci: STATE.curIdx, sk: STATE.SKM, df: STATE.DIF, P: STATE.P, px: STATE.px, py: STATE.py, ang: STATE.ang, ST: STATE.ST,
          e: STATE.ents.map(e => [e.got | 0, e.id, e.x, e.y, e.dr | 0]), mb: serMobs(), gt: STATE.gtic, pr: STATE.prnd,
          s: STATE.map.sec.map(s => [s.f, s.c, s.l0]), ln: STATE.map.ln.map(l => l.sp), seen, sw, mv: STATE.movers.map(m => ({...m, s: sI.get(m.s)}))
        }
      }
export function applySnap(sv) {
        if (sv.df !== undefined) STATE.DIF = sv.df | 0; Object.assign(STATE.P, sv.P); if (STATE.P.hp < 1) STATE.P.hp = 100; STATE.P.dead = false; STATE.px = sv.px; STATE.py = sv.py; STATE.ang = sv.ang; STATE.ST = sv.ST; const n0 = STATE.ents.length;
        sv.e.forEach((d, i) => {let e = STATE.ents[i]; if (!e) {if (!d || !ITM[d[1]]) return; e = STATE.ents[i] = {k: 'i', id: d[1], x: d[2], y: d[3], I: ITM[d[1]], dr: d[4]}} e.got = d[0]});
        sv.s.forEach((v, i) => {const s = STATE.map.sec[i]; if (s) {s.f = v[0]; s.c = v[1]; s.l0 = s.l = v[2]} }); sv.ln.forEach((v, i) => {if (STATE.map.ln[i]) STATE.map.ln[i].sp = v}); for (const i of sv.seen) if (STATE.map.ln[i]) STATE.map.ln[i].seen = 1; if (sv.mb) desMobs(sv.mb, sv.gt, sv.pr);
        for (const k in sv.sw) {const q = STATE.map.sd[k], v = sv.sw[k]; if (q) {q.u = v[0]; q.l = v[1]; q.m = v[2]} }
        STATE.movers = sv.mv.map(m => ({...m, s: STATE.map.sec[m.s]})); STATE.projs = []; STATE.fx = []; STATE.eye = sectorAt(STATE.px, STATE.py).f + 41
      }
export const contSlot = function contSlot(k) {try {STATE.pend = JSON.parse(localStorage[k]); $('sk').value = STATE.pend.df === 2 ? 'n' : STATE.pend.df === 1 ? 'i' : (STATE.pend.sk || 2); const o = [...$('lv').options].find(o => o.text === STATE.pend.lv); if (o) {$('lv').value = o.value; $('go').onclick()} } catch (e) {STATE.pend = null} };
