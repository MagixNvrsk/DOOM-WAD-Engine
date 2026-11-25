// DOOM WAD Engine — звуки: пул буферов, 3D-позиционирование.

import { STATE } from './state.js';
import { dat, dvOf } from './util.js';
import { D_SFXL } from './data.js';
import { NET } from './net.js';

export function snd(o, i) {if (!i) return; const n = D_SFXL[i]; if (o && o.x !== undefined) play(n, o.x, o.y); else play(n)}
export const pick = function pick(a) {return Array.isArray(a) ? a[Math.random() * a.length | 0] : a};
export function initAudio() {if (!STATE.ac) {try {STATE.ac = new (window.AudioContext || window.webkitAudioContext)()} catch (e) { } } if (STATE.ac && STATE.ac.state === 'suspended') STATE.ac.resume()}
export function sbuf(n) {
        if (n in STATE.sb) return STATE.sb[n]; const l = STATE.byName['DS' + n]; let r = null;
        if (l && l.s > 40) {const d = dat(l), v = dvOf(d); if (v.getUint16(0, 1) === 3) {const rate = v.getUint16(2, 1), len = Math.min(v.getUint32(4, 1), d.length - 8) - 32; if (len > 0) {r = STATE.ac.createBuffer(1, len, rate); const ch = r.getChannelData(0); for (let i = 0; i < len; i++)ch[i] = (d[24 + i] - 128) / 128} } }
        return STATE.sb[n] = r
      }
export function play(n, x, y) {
        if (NET.on && NET.role === 'host' && x !== undefined && n && NET.sq.length < 12) NET.sq.push([n, x | 0, y | 0]); if (!STATE.ac || !STATE.sndOn || !n || STATE.nsnd > 20) return; const b = sbuf(n); if (!b) return; let vol = 1, pan = 0;
        if (x !== undefined) {const dx = x - STATE.px, dy = y - STATE.py, d = Math.hypot(dx, dy); if (d > 1200) return; vol = d < 200 ? 1 : 1 - (d - 200) / 1000; pan = d > 1 ? Math.max(-1, Math.min(1, (dx * STATE.si - dy * STATE.co) / d)) * .7 : 0}
        const s = STATE.ac.createBufferSource(); s.buffer = b; const g = STATE.ac.createGain(); g.gain.value = vol * .8 * STATE.SVOL; s.connect(g);
        if (STATE.ac.createStereoPanner) {const p = STATE.ac.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(STATE.ac.destination)} else g.connect(STATE.ac.destination);
        STATE.nsnd++; s.onended = () => STATE.nsnd--; s.start()
      }
