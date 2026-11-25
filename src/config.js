// DOOM WAD Engine — конфигурация и константы настроек.

import { STATE } from './state.js';

export const MISC0 = {ih: 100, ib: 50, mh: 200, ma: 200, ga: 1, ba: 2, ms: 200, sh: 100, meg: 200, god: 100, fa: 200, fac: 2, ka: 200, kac: 2, bfg: 40, inf: 202};
STATE.MISC = Object.assign({}, MISC0);
export const AM0 = {b: 200, s: 50, r: 50, c: 300};
STATE.AMM = Object.assign({}, AM0);
export const OPT = {nomon: 0, fast: 0, resp: 0};
export const GTB = [1, 1.25, 1.5, 1.8, 2.2];
export const GS = 128;
