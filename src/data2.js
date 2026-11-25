// DOOM WAD Engine — модуль data2 (второй блок констант).
import { $ } from './util.js';
import { D_MI, D_SFXL, D_SPR, D_STB } from './tables.js';
import { STATE } from './state.js';
import { play } from './sfx.js';
import { NET, netSend } from './net.js';
import { damageMobj, hurt } from './combat.js';
import { patchCanvas } from './draw.js';

export const AFG = [['NUKAGE1', 'NUKAGE2', 'NUKAGE3'], ['FWATER1', 'FWATER2', 'FWATER3', 'FWATER4'], ['LAVA1', 'LAVA2', 'LAVA3', 'LAVA4'], ['BLOOD1', 'BLOOD2', 'BLOOD3'], ['RROCK05', 'RROCK06', 'RROCK07', 'RROCK08'], ['SLIME01', 'SLIME02', 'SLIME03', 'SLIME04'], ['SLIME05', 'SLIME06', 'SLIME07', 'SLIME08'], ['SLIME09', 'SLIME10', 'SLIME11', 'SLIME12']], AFM = {};
export const ATG = [['BLODGR1', 'BLODGR2', 'BLODGR3', 'BLODGR4'], ['BLODRIP1', 'BLODRIP2', 'BLODRIP3', 'BLODRIP4'], ['FIREBLU1', 'FIREBLU2'], ['FIRELAV3', 'FIRELAVA'], ['FIREMAG1', 'FIREMAG2', 'FIREMAG3'], ['FIREWALA', 'FIREWALB', 'FIREWALL'], ['GSTFONT1', 'GSTFONT2', 'GSTFONT3'], ['ROCKRED1', 'ROCKRED2', 'ROCKRED3'], ['SLADRIP1', 'SLADRIP2', 'SLADRIP3'], ['BFALL1', 'BFALL2', 'BFALL3', 'BFALL4'], ['DBRAIN1', 'DBRAIN2', 'DBRAIN3', 'DBRAIN4'], ['SFALL1', 'SFALL2', 'SFALL3', 'SFALL4'], ['WFALL1', 'WFALL2', 'WFALL3', 'WFALL4']], ATM = {};
export const anT = n => {const a = ATM[n]; if (!a) return n; const r = a[0][(a[1] + (STATE.tm * 4.3 | 0)) % a[0].length]; return STATE.td[r] ? r : n};
export const anF = n => {const a = AFM[n]; return a ? a[0][(a[1] + (STATE.tm * 4 | 0)) % a[0].length] : n};

export const SP2 = {18: ['fn', 1], 20: ['fn', 1], 69: ['fn', 0], 119: ['fn', 1], 22: ['fn', 1], 128: ['fn', 0], 129: ['fn', 0, 1], 130: ['fn', 1, 1], 131: ['fn', 1, 1], 132: ['fn', 0, 1], 5: ['fc', 1], 91: ['fc', 0], 101: ['fc', 1], 64: ['fc', 0], 58: ['f24', 1], 92: ['f24', 0], 93: ['f24', 0], 59: ['f24', 1], 19: ['fd', 1], 38: ['fd', 0], 23: ['fd', 1], 60: ['fd', 0], 82: ['fd', 0], 36: ['fh', 1], 70: ['fh', 0], 71: ['fh', 1], 98: ['fh', 0], 45: ['fh', 0], 102: ['fh', 1], 83: ['fh', 0], 40: ['cu', 1], 41: ['cd', 1], 43: ['cd', 0], 44: ['cd', 1], 6: ['ck', 1], 25: ['ck', 1], 73: ['ck', 0], 77: ['ck', 0], 49: ['ck', 1], 141: ['ck', 1], 57: ['cs', 1], 74: ['cs', 0], 7: ['st8', 1], 8: ['st8', 1], 100: ['st16', 1], 127: ['st16', 1], 12: ['lb', 1], 80: ['lb', 0], 13: ['l255', 1], 81: ['l255', 0], 35: ['l35', 1], 79: ['l35', 0], 138: ['l255', 0], 139: ['l35', 0], 3: ['cl', 1], 75: ['cl', 0], 17: ['str', 1], 24: ['fn', 1], 46: ['dopen', 0], 47: ['fn', 1], 14: ['f32', 1], 15: ['f24', 1], 37: ['fd', 1], 55: ['fc', 1], 56: ['fc', 1], 65: ['fc', 0], 66: ['f24', 0], 67: ['f32', 0], 68: ['fn', 0], 72: ['cd', 0], 78: ['fn', 0], 94: ['fc', 0], 95: ['fn', 0], 96: ['fn', 0], 104: ['llo', 1], 140: ['f512', 1], 9: ['don', 1], 30: ['ftex', 1], 53: ['perp', 1], 54: ['pstop', 1], 87: ['perp', 0], 89: ['pstop', 0]};
export const SHOOT = new Set([24, 46, 47]);
export const FASTD = new Set([99, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 133, 134, 135, 136, 137]);
export const KDS = {99: 1, 133: 1, 134: 3, 135: 3, 136: 2, 137: 2};
export const PL0 = {k: 'p', get x() {return STATE.px}, get y() {return STATE.py}, get dead() {return STATE.P.dead}, hurt: n => hurt(n)};
export function dmgT(T, n, src) {if (T.k === 'p') T.hurt(n, src); else damageMobj(T, src, src, n)}
export const pcs = {};
export const face = n => n in pcs ? pcs[n] : (pcs[n] = patchCanvas(n));
export const MX = () => STATE.P.bp ? 2 : 1, RAD = {SPID: 128, CYBR: 40, FATT: 48, BSPI: 64, BOSS: 24, BOS2: 24, HEAD: 31, SKUL: 16, PAIN: 31, VILE: 20, SKEL: 20, SARG: 30, TROO: 20, POSS: 20, SPOS: 20, CPOS: 20}, FLY = {HEAD: 24, PAIN: 24, SKUL: 20};
export const PL1 = {k: 'p', x: 0, y: 0, dead: true, hurt: n => netSend({t: 'hurt', n})};
export const mkey = o => (o.x * 10 | 0) + '|' + (o.y * 10 | 0) + '|' + (o.z | 0) + '|' + o.s + '|' + o.hp + '|' + (o.an >>> 20) + '|' + o.fl, skey = s => (s.f * 10 | 0) + '|' + (s.c * 10 | 0) + '|' + (s.l0 | 0);
export const ck = t => {let h = 0; for (let i = 0; i < t.length; i++)h = (h * 31 + t.charCodeAt(i)) % 100000; return h};
export const mq = q => {try {return matchMedia(q).matches} catch (e) {return false} }, coarse = mq('(pointer:coarse)');
export const HELP_T = 'Касание: левая половина экрана — движение, правая — поворот. Правый стик — только поворот. Красная кнопка — огонь (удерживать). Остальные кнопки: использовать, смена оружия, карта.', HELP_D = 'Клавиатура и мышь: WASD или стрелки — движение, мышь — поворот (клик по экрану захватывает курсор), ЛКМ / Ctrl / Пробел — огонь, E или Enter — использовать, Shift — бег, Пробел — прыжок (если включён в меню), 1–7 или колесо мыши — оружие, Tab — карта, G — гамма, F5 / F9 — сохранить / загрузить.';
export const bf = $('bf');
export const bj = $('bj');
export const PRI = {ST: D_STB.map(r => r.slice()), MI: D_MI.map(r => r.slice()), SPR: D_SPR.slice(), SFX: D_SFXL.slice(), AMK: AMK0()};
export function AMK0() {return [null, 'b', 's', 'b', 'r', 'c', 'c', null, 's']}
export const DEH_BITS = {SPECIAL: 1, SOLID: 2, SHOOTABLE: 4, NOSECTOR: 8, NOBLOCKMAP: 16, AMBUSH: 32, JUSTHIT: 64, JUSTATTACKED: 128, SPAWNCEILING: 256, NOGRAVITY: 512, DROPOFF: 1024, PICKUP: 2048, NOCLIP: 4096, SLIDE: 8192, FLOAT: 16384, TELEPORT: 32768, MISSILE: 65536, DROPPED: 131072, SHADOW: 262144, NOBLOOD: 524288, CORPSE: 1048576, INFLOAT: 2097152, COUNTKILL: 4194304, COUNTITEM: 8388608, SKULLFLY: 16777216, NOTDMATCH: 33554432, TRANSLATION1: 67108864, TRANSLATION2: 134217728, TRANSLATION: 201326592, TOUCHY: 0, BOUNCES: 0, FRIEND: 0};
export const DEH_TH = {'id #': 0, 'initial frame': 1, 'hit points': 2, 'first moving frame': 3, 'alert sound': 4, 'reaction time': 5, 'attack sound': 6, 'injury frame': 7, 'pain chance': 8, 'pain sound': 9, 'close attack frame': 10, 'far attack frame': 11, 'death frame': 12, 'exploding frame': 13, 'death sound': 14, 'speed': 15, 'width': 16, 'height': 17, 'mass': 18, 'missile damage': 19, 'action sound': 20, 'bits': 21, 'respawn frame': 22};
export const DEH_FR = {'sprite number': 0, 'sprite subnumber': 1, 'duration': 2, 'next frame': 4, 'unknown 1': 5, 'unknown 2': 6};
export const DEH_MISC = {'initial health': 'ih', 'initial bullets': 'ib', 'max health': 'mh', 'max armor': 'ma', 'green armor class': 'ga', 'blue armor class': 'ba', 'max soulsphere': 'ms', 'soulsphere health': 'sh', 'megasphere health': 'meg', 'god mode health': 'god', 'idfa armor': 'fa', 'idfa armor class': 'fac', 'idkfa armor': 'ka', 'idkfa armor class': 'kac', 'bfg cells/shot': 'bfg', 'monsters infight': 'inf'};
export const PRIAN = {F: AFG.map(g => g.slice()), T: ATG.map(g => g.slice())};
export const BCS = 32;
export const bCell = (x, y) => {const g = STATE.BG, cx = Math.floor((x - g.x0) / BCS), cy = Math.floor((y - g.y0) / BCS); return cx < 0 || cy < 0 || cx >= g.w || cy >= g.h ? -1 : cy * g.w + cx};

// реэкспорт производных таблиц (залитые модули импортируют из data.js)
export { D_SFXL } from './tables.js';
