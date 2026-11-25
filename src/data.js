// DOOM WAD Engine — модуль data.
import { $ } from './util.js';
import { STATE } from './state.js';
import { D_MI, D_RND, D_SFXL, D_SPR, D_STB } from './tables.js';
import { play } from './sfx.js';
import { pmOf } from './entities.js';
import { NET, netSend } from './net.js';
import { damageMobj, hurt } from './combat.js';
import { patchCanvas } from './draw.js';

export const ctx = $('c').getContext('2d');
export const sh = (l, z) => {if (STATE.lamp) l = 255; else l += STATE.xl * 16; const r = (15 - (l >> 4)) * 4 - ((1280 / (z > 1 ? z : 1)) | 0); return r < 0 ? 0 : r > 31 ? 31 : r};
export const T = (d, i, r) => {const c = d[i]; return STATE.pal[STATE.cm[r | (c === 65535 ? 0 : c)]]};
export const av = (a, b) => 0xFF000000 | ((((a >> 16 & 255) + (b >> 16 & 255)) >> 1) << 16) | ((((a >> 8 & 255) + (b >> 8 & 255)) >> 1) << 8) | (((a & 255) + (b & 255)) >> 1);
export const MON = {3004: ['POSS', 20, 'ABCD', 'EF', 'G', 'HIJKL', 8, 'h'], 9: ['SPOS', 30, 'ABCD', 'EF', 'G', 'HIJKL', 8, 'H'], 65: ['CPOS', 70, 'ABCD', 'EF', 'G', 'HIJKLMN', 8, 'h'], 3001: ['TROO', 60, 'ABCD', 'EFG', 'H', 'IJKLM', 8, 'f'], 3002: ['SARG', 150, 'ABCD', 'EFG', 'H', 'IJKLMN', 10, 'm'], 58: ['SARG', 150, 'ABCD', 'EFG', 'H', 'IJKLMN', 10, 'm', null, 1], 3005: ['HEAD', 400, 'A', 'BCD', 'E', 'GHIJKL', 8, 'F'], 3003: ['BOSS', 1000, 'ABCD', 'EFG', 'H', 'IJKLMNO', 8, 'B'], 69: ['BOS2', 500, 'ABCD', 'EFG', 'H', 'IJKLMNO', 8, 'B'], 3006: ['SKUL', 100, 'AB', 'CD', 'E', 'FGHIJK', 8, 'L'], 66: ['SKEL', 300, 'ABCDEF', 'JK', 'L', 'MNOPQ', 10, 'R'], 67: ['FATT', 600, 'ABCDEF', 'GHI', 'J', 'KLMNOPQRST', 8, 'M', [1.2, 1]], 68: ['BSPI', 500, 'ABCDEF', 'GH', 'I', 'JKLMNO', 12, 'A', [.25, .3]], 16: ['CYBR', 4000, 'ABCD', 'EF', 'G', 'HIJKLMNOP', 8, 'C', [1, 1.2]], 7: ['SPID', 3000, 'ABCDEF', 'GH', 'I', 'JKLMNOPQRS', 10, 'H', [.2, .2]], 71: ['PAIN', 400, 'ABC', 'DEF', 'G', 'HIJKLM', 8, 'P'], 64: ['VILE', 700, 'ABCDEF', 'GHIJKLMNOP', 'Q', 'QRSTUVWXYZ', 14, 'V']};
export const PR = {f: ['BAL1', 3], F: ['BAL2', 5], B: ['BAL7', 8], R: ['FATB', 10, 1, 350, 1], M: ['MANF', 8, 2, 350], A: ['APLS', 5, 1, 700], C: ['MISL', 10, 1, 500]};
export const ITM = {2011: ['STIM', 'A', 'h', 10], 2012: ['MEDI', 'A', 'h', 25], 2014: ['BON1', 'ABCDCB', 'H', 1], 2015: ['BON2', 'ABCDCB', 'A', 1], 2018: ['ARM1', 'AB', 'a', 100], 2019: ['ARM2', 'AB', 'a', 200], 2007: ['CLIP', 'A', 'b', 10], 2048: ['AMMO', 'A', 'b', 50], 2008: ['SHEL', 'A', 's', 4], 2049: ['SBOX', 'A', 's', 20], 2010: ['ROCK', 'A', 'r', 1], 2046: ['BROK', 'A', 'r', 5], 2047: ['CELL', 'A', 'c', 20], 17: ['CELP', 'A', 'c', 100], 2013: ['SOUL', 'ABCB', 'H', 100], 82: ['SGN2', 'A', 'w', 9], 8: ['BPAK', 'A', 'p', 0], 5: ['BKEY', 'AB', 'k', 1], 40: ['BSKU', 'AB', 'k', 1], 6: ['YKEY', 'AB', 'k', 2], 39: ['YSKU', 'AB', 'k', 2], 13: ['RKEY', 'AB', 'k', 3], 38: ['RSKU', 'AB', 'k', 3], 2001: ['SHOT', 'A', 'w', 3], 2002: ['MGUN', 'A', 'w', 4], 2003: ['LAUN', 'A', 'w', 5], 2004: ['PLAS', 'A', 'w', 6], 2005: ['CSAW', 'A', 'w', 8], 2006: ['BFUG', 'A', 'w', 7], 2023: ['PSTR', 'A', 'u', 'Z'], 2022: ['PINV', 'ABCD', 'u', 'I'], 2024: ['PSIS', 'ABCD', 'u', 'G'], 2025: ['SUIT', 'A', 'u', 'S'], 2045: ['PVIS', 'AB', 'u', 'L'], 83: ['MEGA', 'ABCD', 'u', 'M'], 2026: ['PMAP', 'ABCDCB', 'u', 'X']};
export const DEC = {2028: 'COLU A s', 2035: 'BAR1 AB s', 48: 'ELEC A s', 30: 'COL1 A s', 31: 'COL2 A s', 32: 'COL3 A s', 33: 'COL4 A s', 37: 'COL6 A s', 36: 'COL5 AB s', 47: 'SMIT A s', 43: 'TRE1 A s', 54: 'TRE2 A s', 44: 'TBLU ABCD s', 45: 'TGRN ABCD s', 46: 'TRED ABCD s', 55: 'SMBT ABCD s', 56: 'SMGT ABCD s', 57: 'SMRT ABCD s', 34: 'CAND A', 35: 'CBRA A s', 41: 'CEYE ABCB s', 42: 'FSKU ABC s', 25: 'POL1 A s', 26: 'POL6 AB s', 27: 'POL4 A s', 28: 'POL2 A s', 29: 'POL3 AB s', 24: 'POL5 A', 10: 'PLAY W', 12: 'PLAY W', 15: 'PLAY N', 18: 'POSS L', 19: 'SPOS L', 20: 'TROO M', 21: 'SARG N', 22: 'HEAD L', 23: 'SKUL K', 49: 'GOR1 ABCB s', 50: 'GOR2 A s', 51: 'GOR3 A s', 52: 'GOR4 A s', 53: 'GOR5 A s', 59: 'GOR2 A', 60: 'GOR4 A', 61: 'GOR3 A', 62: 'GOR5 A', 63: 'GOR1 ABCB', 85: 'TLMP ABCD s', 86: 'TLP2 ABCD s', 70: 'FCAN ABC s'};
export const KD = {26: 1, 27: 2, 28: 3, 32: 1, 33: 3, 34: 2}, MAN = {1: 0, 26: 0, 27: 0, 28: 0, 117: 1, 31: 2, 32: 2, 33: 2, 34: 2, 118: 3};
export const TG = {29: 'dc', 63: 'dc', 103: 'do', 61: 'do', 50: 'cl', 42: 'cl', 21: 'lf', 62: 'lf', 122: 'lf', 123: 'lf', 2: 'do', 4: 'dc', 90: 'dc', 86: 'do', 10: 'lf', 88: 'lf'};
export const WALK = new Set([30, 53, 54, 87, 89, 105, 106, 107, 108, 109, 110, 2, 4, 90, 86, 10, 88, 39, 97, 52, 124, 119, 22, 128, 129, 130, 5, 91, 58, 92, 93, 59, 19, 38, 82, 36, 98, 83, 40, 44, 6, 25, 73, 77, 141, 57, 74, 8, 100, 12, 80, 13, 81, 35, 79, 3, 75, 17]), ONCE = new Set([9, 30, 53, 54, 108, 109, 110, 111, 112, 113, 29, 103, 50, 21, 122, 2, 4, 10, 39, 52, 11, 51, 124]), SRS = new Set([114, 115, 116, 63, 61, 42, 62, 123, 69, 64, 60, 70, 45, 43, 132, 138, 139]);
export const itemCI = id => {const I = D_MI.find(m => m[0] === id); return !!(I && (I[21] & F_COUNTITEM))};
export const solid = l => !l.bs || Math.min(l.fs.c, l.bs.c) - Math.max(l.fs.f, l.bs.f) <= 0;
export const isGen = sp => sp >= 12160 && sp < 32768;
export const FT = {
        E1: ['SFLR6_1', 'Вы победили главных чудовищ и очистили лунную базу. Но на этом всё не кончится: впереди бездна, и она уже ждёт вас...', 'CREDIT'], E2: ['MFLR8_4', 'Вы одолели Кибердемона и вырвались из ада. Но где вы теперь?.. Перед вами новая, ещё более страшная дорога.', 'VICTORY2'], E3: ['MFLR8_3', 'Ужасный Паук-Предводитель повержен. Ад пал. Вы возвращаетесь домой, на Землю, и надеетесь, что хотя бы там будет тихо...', 'PFUB1'], E4: ['MFLR8_3', 'Вы победили. Но дом изменился: тишина обманчива, а кошмар только начинается.', 'ENDPIC'],
        6: ['SLIME16', 'Вы пробились через защиту и уничтожили шахту врага. Но путь к Земле ещё не свободен...'], 11: ['RROCK14', 'Вы уничтожили центр управления. Враг не ожидал такого. Но город впереди всё ещё в огне.'], 20: ['RROCK07', 'Вы прорвались к цитадели. Остаётся последний рывок: найти источник вторжения.'], 30: ['RROCK17', 'Главный демон мёртв, портал закрыт. Земля спасена. Вы возвращаетесь домой героем.', 'CREDIT'], 15: ['RROCK13', 'Вы нашли тайный проход. Что-то странное ждёт вас впереди.'], 31: ['RROCK19', 'Секретный уровень пройден. Но это ещё не конец.']
      };
export const PAR1 = [0, [0, 30, 75, 120, 90, 165, 180, 180, 30, 165], [0, 90, 90, 90, 120, 90, 360, 240, 30, 170], [0, 90, 45, 90, 150, 90, 90, 165, 30, 135], [0, 165, 255, 135, 150, 180, 390, 135, 360, 180]], PAR2 = [30, 90, 120, 120, 90, 150, 120, 120, 270, 90, 210, 150, 150, 150, 210, 150, 420, 150, 210, 150, 240, 150, 180, 150, 150, 300, 330, 420, 300, 180, 120, 30];
export const WLN = [[[185, 164], [148, 143], [69, 122], [209, 102], [116, 89], [166, 55], [71, 24], [135, 29], [71, 24]], [[254, 25], [97, 50], [188, 64], [128, 78], [214, 92], [133, 130], [208, 136], [148, 140], [235, 158]], [[156, 168], [48, 154], [174, 95], [265, 75], [130, 48], [279, 23], [198, 48], [140, 25], [281, 136]]];
export const CAST = [['POSSESSED', 'Зомби-солдат'], ['SHOTGUY', 'Сержант с дробовиком'], ['CHAINGUY', 'Тяжёлый пулемётчик'], ['TROOP', 'Имп'], ['SERGEANT', 'Демон'], ['SKULL', 'Потерянная душа'], ['HEAD', 'Какодемон'], ['KNIGHT', 'Рыцарь ада'], ['BRUISER', 'Барон ада'], ['BABY', 'Арахнотрон'], ['PAIN', 'Элементаль боли'], ['UNDEAD', 'Ревенант'], ['FATSO', 'Манкубус'], ['VILE', 'Арчвайл'], ['SPIDER', 'Паук-предводитель'], ['CYBORG', 'Кибердемон'], ['PLAYER', 'Наш герой']];
export const snd_ = i => {const n = D_SFXL[i]; if (n) play(n)};
export const MT = {}, SS = {}, SFX = {};
export const F_SPECIAL = 1, F_SOLID = 2, F_SHOOT = 4, F_NOSEC = 8, F_NOBM = 16, F_AMBUSH = 32, F_JUSTHIT = 64, F_JUSTATT = 128, F_CEIL = 256, F_NOGRAV = 512, F_DROPOFF = 1024, F_PICKUP = 2048, F_NOCLIP = 4096, F_FLOAT = 16384, F_TELE = 32768, F_MISSILE = 65536, F_DROPPED = 131072, F_SHADOW = 262144, F_NOBLOOD = 524288, F_CORPSE = 1048576, F_INFLOAT = 2097152, F_COUNTKILL = 4194304, F_COUNTITEM = 8388608, F_SKULLFLY = 16777216;
export const ONFLOOR = -1e9, ONCEIL = 1e9, MELEE = 64, MISSRANGE = 2048, MAXMOVE = 30, BASETHR = 100, FLOATSPD = 4;
export const BAMK = 1.4629180792671596e-9, A45 = 0x20000000, A90 = 0x40000000, A180 = 0x80000000, A270 = 0xC0000000;
export const pRand = () => {STATE.prnd = (STATE.prnd + 1) & 255; return D_RND[STATE.prnd]};
export const bamC = a => Math.cos(a * BAMK), bamS = a => Math.sin(a * BAMK);
export const ptAng = (x1, y1, x2, y2) => Math.round(Math.atan2(y2 - y1, x2 - x1) * 683565275.576) >>> 0;
export const aprox = (dx, dy) => {dx = Math.abs(dx); dy = Math.abs(dy); return dx + dy - (dx < dy ? dx : dy) / 2};
export const PMLIST = () => STATE.PLS.map(pmOf);
export const gk = (cx, cy) => ((cx + 2048) << 12) | (cy + 2048);
export const XSP = [1, .71715, 0, -.71715, -1, -.71715, 0, .71715], YSP = [0, .71715, 1, .71715, 0, -.71715, -1, -.71715], OPP = [4, 5, 6, 7, 0, 1, 2, 3, 8], DIAG = [3, 1, 5, 7];
export const FATSP = A90 / 8;
export const secMem = new Map();
export const sbCache = new Map();
export const pcmd = {f: 0, s: 0, run: 0, jump: false, atk: false};
export const AMK = [null, 'b', 's', 'b', 'r', 'c', 'c', null, 's'], AMC = [0, 1, 1, 1, 1, 1, 40, 0, 2];
export const decAmmo = n => {const k = AMK[STATE.P.rw - 1]; if (k) STATE.P[k] = Math.max(0, STATE.P[k] - n)};
export const gfire = w => {if (NET.on && NET.role === 'guest') {netSend({t: 'f', w, a: STATE.ang, x: STATE.px, y: STATE.py}); return true} return false};
export const aBAM = () => pmOf(PL0).an;
export const DM2 = ['RUNNIN', 'STALKS', 'COUNTD', 'BETWEE', 'DOOM', 'THE_DA', 'SHAWN', 'DDTBLU', 'IN_CIT', 'DEAD', 'STLKS2', 'THEDA2', 'DOOM2', 'DDTBL2', 'RUNNI2', 'DEAD2', 'STLKS3', 'ROMERO', 'SHAWN2', 'MESSAG', 'COUNT2', 'DDTBL3', 'AMPIE', 'THEDA3', 'ADRIAN', 'MESSG2', 'ROMER2', 'TENSE', 'SHAWN3', 'OPENIN', 'EVIL', 'ULTIMA'];
export const MULT = [.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 12, 12, 15, 15], WAVE = ['sine', 'triangle', 'sine', 'sawtooth'];

// реэкспорт второго блока констант (импортирующие ссылаются на data.js)
export * from './data2.js';
