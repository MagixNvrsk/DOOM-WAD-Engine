// DOOM WAD Engine — чит-коды.

import { STATE } from './state.js';
import { $ } from './util.js';
import { loadMap } from './map.js';
import { msg } from './player.js';

export function cheat(c) {
        c = (c || '').toLowerCase().trim(); let m;
        if (c === 'iddqd') {STATE.P.god = !STATE.P.god; if (STATE.P.god) STATE.P.hp = Math.max(STATE.P.hp, STATE.MISC.god); msg(STATE.P.god ? '\u0411\u0435\u0441\u0441\u043c\u0435\u0440\u0442\u0438\u0435 \u0432\u043a\u043b' : '\u0411\u0435\u0441\u0441\u043c\u0435\u0440\u0442\u0438\u0435 \u0432\u044b\u043a\u043b')}
        else if (c === 'idkfa' || c === 'idfa') {for (let i = 0; i < 9; i++)STATE.P.have[i] = 1; STATE.P.bp = 1; STATE.P.b = STATE.AMM.b * 2; STATE.P.s = STATE.AMM.s * 2; STATE.P.r = STATE.AMM.r * 2; STATE.P.c = STATE.AMM.c * 2; if (c === 'idkfa') {STATE.P.ar = STATE.MISC.ka; STATE.P.at = STATE.MISC.kac; STATE.P.keys = [0, 1, 1, 1]} else {STATE.P.ar = STATE.MISC.fa; STATE.P.at = STATE.MISC.fac}; msg('\u0412\u0441\u0451 \u043e\u0440\u0443\u0436\u0438\u0435!')}
        else if (c === 'idclip' || c === 'idspispopd') {STATE.P.nc = !STATE.P.nc; msg(STATE.P.nc ? '\u0421\u043a\u0432\u043e\u0437\u044c \u0441\u0442\u0435\u043d\u044b' : '\u041e\u0431\u044b\u0447\u043d\u044b\u0439 \u0440\u0435\u0436\u0438\u043c')}
        else if (c === 'iddt') {STATE.P.map = ((STATE.P.map | 0) + 1) % 3; if (!STATE.P.am) STATE.P.am = 1; msg('\u041a\u0430\u0440\u0442\u0430')}
        else if (c === 'idchoppers') {STATE.P.have[7] = 1; STATE.P.w = 8; msg('\u0411\u0435\u043d\u0437\u043e\u043f\u0438\u043b\u0430!')}
        else if (c === 'idmypos') msg('X ' + (STATE.px | 0) + ' Y ' + (STATE.py | 0) + ' A ' + (STATE.ang * 180 / Math.PI | 0));
        else if (m = c.match(/^idbehold([a-z])$/)) {const k = m[1]; if (k === 's') {STATE.P.bz = 1; STATE.P.hp = Math.max(STATE.P.hp, 100)} else if (k === 'v') STATE.P.inv = 30; else if (k === 'i') STATE.P.gh = 60; else if (k === 'r') STATE.P.su = 60; else if (k === 'l') STATE.P.la = 120; else if (k === 'a') STATE.P.map = 1; else return false; msg('\u0411\u043e\u043d\u0443\u0441')}
        else if (m = c.match(/^idclev(\d)(\d)$/)) {const o = [...$('lv').options].find(o => o.text === 'E' + m[1] + 'M' + m[2] || o.text === 'MAP' + m[1] + m[2]); if (o) {$('lv').value = o.value; STATE.curIdx = +o.value; loadMap(STATE.curIdx); msg('\u0423\u0440\u043e\u0432\u0435\u043d\u044c ' + o.text)} else return false}
        else return false; return true
      }
