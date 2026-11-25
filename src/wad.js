// DOOM WAD Engine — модуль wad.
import { STATE } from './state.js';
import { $, dat, dvOf, s8 } from './util.js';
import { applyDEH, dehReset } from './dehacked.js';
import { buildSprites, patchCanvas, setPal } from './draw.js';
import { boomTables, door, exitLv, flip, lift, tpTo } from './sectors.js';
import { sigW } from './saves.js';
import { cv } from './main.js';
import { sectorAt } from './map.js';
import { play } from './sfx.js';

export async function loadFiles(fs) {
        STATE.KST = undefined; try {
          $('err').textContent = ''; STATE.L = []; STATE.byName = {}; STATE.tc = {}; STATE.fc = {}; STATE.td = {}; STATE.pn = [];
          const dehT = [], bufs = []; for (const f of fs) {const u = new Uint8Array(await f.arrayBuffer()); if (/\.(deh|bex)$/i.test(f.name)) dehT.push(new TextDecoder('latin1').decode(u)); else bufs.push(u)}
          bufs.sort((a, b) => (a[0] === 73 ? 0 : 1) - (b[0] === 73 ? 0 : 1));
          for (const u of bufs) {
            const id = String.fromCharCode(u[0], u[1], u[2], u[3]);
            if (id !== 'IWAD' && id !== 'PWAD') throw Error('Это не WAD-файл');
            const v = dvOf(u), n = v.getInt32(4, 1), o = v.getInt32(8, 1);
            for (let i = 0; i < n; i++) {const p = o + i * 16; STATE.L.push({n: s8(u, p + 8), u, o: v.getInt32(p, 1), s: v.getInt32(p + 4, 1)})}
          }
          STATE.L.forEach(l => STATE.byName[l.n] = l); dehReset(); STATE.dehN = 0; try {for (const l of STATE.L) if (l.n === 'DEHACKED') STATE.dehN += applyDEH(new TextDecoder('latin1').decode(dat(l))); for (const t of dehT) STATE.dehN += applyDEH(t)} catch (e) {STATE.dehLog.push('ошибка ' + e.message)} {const zl = ['ZMAPINFO', 'ZSCRIPT', 'DECORATE', 'GLDEFS'].filter(n => STATE.byName[n]); if (zl.length) throw Error('Это ресурсы ZDoom (' + zl.join(', ') + '). Формат ZDoom не поддерживается: нужны WAD для Doom, Heretic, Hexen или Boom.')} buildSprites(); await inflateZ();
          if (!STATE.byName.PLAYPAL || !STATE.byName.COLORMAP) throw Error('Нужен IWAD с PLAYPAL и COLORMAP (добавьте основной doom.wad)');
          STATE.ppR = dat(STATE.byName.PLAYPAL); STATE.PI = -1; setPal(0);
          STATE.cm = STATE.cm0 = dat(STATE.byName.COLORMAP); STATE.cmI = null; if (STATE.cm0.length >= 33 * 256) {STATE.cmI = new Uint8Array(STATE.cm0); for (let r = 0; r < 32; r++)STATE.cmI.set(STATE.cm0.subarray(32 * 256, 33 * 256), r * 256)}

          if (STATE.byName.PNAMES) {const d = dat(STATE.byName.PNAMES), v = dvOf(d); for (let i = 0; i < v.getInt32(0, 1); i++)STATE.pn.push(s8(d, 4 + i * 8))}
          for (const nm of ['TEXTURE1', 'TEXTURE2']) {
            const l = STATE.byName[nm]; if (!l) continue; const d = dat(l), v = dvOf(d), n = v.getInt32(0, 1);
            for (let i = 0; i < n; i++) {
              const o = v.getInt32(4 + i * 4, 1), pc = v.getInt16(o + 20, 1), p = [];
              for (let k = 0; k < pc; k++) {const q = o + 22 + k * 10; p.push({ox: v.getInt16(q, 1), oy: v.getInt16(q + 2, 1), p: v.getInt16(q + 4, 1)})}
              STATE.td[s8(d, o)] = {w: v.getInt16(o + 12, 1), h: v.getInt16(o + 14, 1), p}
            }
          }
          boomTables(); const lv = {}; STATE.L.forEach((l, i) => {if (/^(E\dM\d|MAP\d\d)$/.test(l.n) && STATE.L[i + 1] && (STATE.L[i + 1].n === 'THINGS' || STATE.L[i + 1].n === 'TEXTMAP')) lv[l.n] = i});
          const names = Object.keys(lv); if (!names.length) throw Error('В файле нет уровней');
          $('lv').innerHTML = names.map(n => `<option value="${lv[n]}">${n}</option>`).join('');
          $('lv').hidden = false; $('go').disabled = false; $('go').textContent = 'Играть'; try {const c = patchCanvas('TITLEPIC'); if (c) $('menu').style.background = 'linear-gradient(rgba(0,0,0,.72),rgba(0,0,0,.72)),url(' + c.toDataURL() + ') center/cover no-repeat'} catch (e) { }
          for (const [id, k] of [['ct', 'dsave'], ['cm', 'dsaveM']]) try {const sv = JSON.parse(localStorage[k] || 'null'); $(id).hidden = !(sv && sv.sig === sigW() && [...$('lv').options].some(o => o.text === sv.lv))} catch (e) {$(id).hidden = true} $('dt').textContent = 'Загружено файлов: ' + fs.length + ', уровней: ' + names.length + (STATE.boomN ? ', Boom:' + STATE.boomN : '') + (STATE.dehN ? ', патч DEHACKED: ' + STATE.dehN + ' блоков' + (STATE.dehLog.length ? ' (не поддержано: ' + STATE.dehLog.length + ')' : '') : '');
        } catch (e) {$('err').textContent = e.message}
      }
export function parseUdmf(t) {
        t = t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, ''); const out = {vertex: [], linedef: [], sidedef: [], sector: [], thing: []}, nm = t.match(/namespace\s*=\s*"([^"]+)"/i); out._ns = nm ? nm[1].toLowerCase() : 'doom';
        const re = /(\w+)\s*\{([^}]*)\}/g; let m; while (m = re.exec(t)) {
          const o = {}; for (const kv of m[2].split(';')) {const q = kv.split('='); if (q.length < 2) continue; const k = q[0].trim().toLowerCase(); let v = q.slice(1).join('=').trim(); if (v[0] === '"') v = v.slice(1, -1); else if (v === 'true') v = true; else if (v === 'false') v = false; else v = parseFloat(v); o[k] = v}
          const bt = m[1].toLowerCase(); (out[bt] || (out[bt] = [])).push(o)
        } return out
      }
export function xnod(d, vx0, ln, sd, sec) {
        const v = dvOf(d); let p = 4; const no = v.getUint32(p, 1), nn = v.getUint32(p + 4, 1); p += 8; const vx = vx0.slice(0, no);
        for (let k = 0; k < nn; k++) {vx.push({x: v.getInt32(p, 1) / 65536, y: v.getInt32(p + 4, 1) / 65536}); p += 8}
        const nss = v.getUint32(p, 1); p += 4; const cnt = []; for (let k = 0; k < nss; k++) {cnt.push(v.getUint32(p, 1)); p += 4}
        const nsg = v.getUint32(p, 1); p += 4; const sg = [];
        for (let k = 0; k < nsg; k++) {
          const a = v.getUint32(p, 1), b = v.getUint32(p + 4, 1), li = v.getUint16(p + 8, 1), side = d[p + 10]; p += 11; const ld = ln[li], fs = side ? ld.l : ld.r, bs = side ? ld.r : ld.l, A = vx[a], B = vx[b], O = vx[side ? ld.b : ld.a];
          sg.push({a, b, ld, fl: ld.fl, off: Math.hypot(A.x - O.x, A.y - O.y), len: Math.hypot(B.x - A.x, B.y - A.y), fd: sd[fs], bd: bs >= 0 ? sd[bs] : null, fs: fs >= 0 ? sec[sd[fs].s] : null, bs: bs >= 0 ? sec[sd[bs].s] : null})
        }
        let f = 0; const ss = cnt.map(n => {const o = {n, f}; f += n; return o}); const nnod = v.getUint32(p, 1); p += 4; const nodes = [], cv = c => c & 0x80000000 ? 0x40000000 | (c & 0x7FFFFFFF) : c;
        for (let k = 0; k < nnod; k++) {nodes.push({x: v.getInt16(p, 1), y: v.getInt16(p + 2, 1), dx: v.getInt16(p + 4, 1), dy: v.getInt16(p + 6, 1), br: [v.getInt16(p + 8, 1), v.getInt16(p + 10, 1), v.getInt16(p + 12, 1), v.getInt16(p + 14, 1)], bl: [v.getInt16(p + 16, 1), v.getInt16(p + 18, 1), v.getInt16(p + 20, 1), v.getInt16(p + 22, 1)], c0: cv(v.getUint32(p + 24, 1)), c1: cv(v.getUint32(p + 28, 1))}); p += 32}
        return {vx, sg, ss, nodes}
      }
export async function inflateZ() {
        for (const l of STATE.L) {
          if ((l.n === 'NODES' || l.n === 'ZNODES') && l.s > 8) {
            const d = dat(l); if (d[0] === 90 && d[1] === 78 && d[2] === 79 && d[3] === 68) {
              try {
                const b = await new Response(new Blob([d.subarray(4)]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer(); const u = new Uint8Array(4 + b.byteLength); u.set([88, 78, 79, 68]); u.set(new Uint8Array(b), 4); l.u = u; l.o = 0; l.s = u.length
              } catch (e) {l.bad = 1}
            }
          }
        }
      }
export function htele(a) {const t = STATE.map.th.find(t => a[0] && t.tid === a[0]) || STATE.map.th.find(t => t.t === 14 && a[1] && sectorAt(t.x, t.y).tag === a[1]) || STATE.map.th.find(t => t.t === 14); if (t) tpTo(t)}
export function hact(l, use) {
        const sp = l.sp - 1000, a = l.hx || [0, 0, 0, 0, 0]; if (!!use === !!l.hw) return; const secs = a[0] ? STATE.map.sec.filter(s => s.tag === a[0]) : [];
        if (sp === 10 || sp === 11 || sp === 12 || sp === 13) {const front = (l.B.x - l.A.x) * (STATE.py - l.A.y) - (l.B.y - l.A.y) * (STATE.px - l.A.x) < 0, list = a[0] ? secs : [front ? l.bs : l.fs]; for (const s of list) if (s) door(s, sp === 11, (a[1] || 16) >= 64, sp === 10)}
        else if (sp === 62 || sp === 64 || sp === 65) {for (const s of secs) lift(s, (a[1] || 16) >= 32)}
        else if (sp === 70) htele(a); else if (sp === 243 || sp === 244) exitLv(sp === 244); else return;
        if (use) {flip(l); play('SWTCHN')} if (!(l.fl & 0x2000)) l.sp = 0
      }
