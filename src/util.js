// DOOM WAD Engine — утилиты: доступ к DOM, чтение WAD-данных, строки-шрифты.

export const $ = function $(id) {return document.getElementById(id)};
export const dat = function dat(l) {return l.u.subarray(l.o, l.o + l.s)};
export const dvOf = function dvOf(d) {return new DataView(d.buffer, d.byteOffset, d.byteLength)};
export const s8 = function s8(d, o) {let s = ''; for (let i = 0; i < 8 && d[o + i]; i++)s += String.fromCharCode(d[o + i]); return s.toUpperCase()};
