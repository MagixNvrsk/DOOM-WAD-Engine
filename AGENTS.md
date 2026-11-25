# AGENTS.md — DOOM WAD Engine (структура src/ и правила правки)

Проект: браузерный движок DOOM на чистом JS, разрезанный из монолита DOOM_WAD_Engine.html (316 КБ) на ES-модули в src/. Оригинальный монолит сохранён в корне репозитория как эталон для сверки — не удалять, пока модульная версия не подтверждена запуском.

## Текущее состояние
Модули заливаются поэтапно. Полностью зашиты: state, config, util, anim, sfx, textures, saves, cheats и все таблицы (tables, tables2-7). Остальные модули (wad, map, draw, sprites, hud, physics, entities, ai, combat, player, weapon, sectors, game, finale, music, net, ui, input, bot, dehacked, data, main) ещё не залиты — рабочая версия движка по-прежнему монолит DOOM_WAD_Engine.html.

## Карта модулей src/
| Файл | Содержимое |
|------|-----------|
| state.js | Объект STATE (ST занят именем таблицы состояний) — единый контейнер всех 165 mutable let-переменных движка. Все обращения из любых модулей идут через STATE.<имя>. |
| config.js | Конфигурация экрана/качества: W, F, H, H2, Q, SC. |
| util.js | Общие утилиты. |
| data.js | Таблицы данных движка (не залит — в ожидании восстановления пайплайна разрезки). |
| tables.js | Спрайты (SPR) и состояния (ST), сборка полной таблицы D_I = {SPR, ST, ...D_I_B, ...D_MTN, ...D_STN, ...D_SFX}; производные D_SPR, D_STB, D_MI, D_MTn, D_Sn, D_RND, D_SFXL. |
| tables2.js | Часть D_I: таблица монстров MI (export const D_I_B). |
| tables3.js | Имена типов объектов MTn (export const D_MTN). |
| tables4.js | Имена состояний STn (export const D_STN). |
| tables5.js | Имена звуков SFXn/SFXlump и таблица случайностей RND (export const D_SFX). |
| tables6.js | Состояния ST, часть A (export const ST_A). |
| tables7.js | Состояния ST, часть B (export const ST_B). |
| wad.js | Загрузка WAD-файлов. |
| textures.js | Управление текстурами/спрайтами из WAD. |
| map.js | Разбор карт (levels). |
| draw.js | Рендер (BSP, сектора, стены). |
| sprites.js | Рендер спрайтов. |
| hud.js | HUD и интерфейс. |
| physics.js | Физика (движение, коллизии). |
| entities.js | Сущности (игрок, монстры, предметы). |
| ai.js | AI монстров. |
| combat.js | Урон и взаимодействия. |
| player.js | Управление игроком. |
| weapon.js | Оружие. |
| sectors.js | Логика секторов (двери, лифты, телепорты). |
| game.js | Игровой цикл и состояния игры. |
| finale.js | Финал/интро/сюжет. |
| music.js | Музыка. |
| sfx.js | Звук. |
| anim.js | Анимации. |
| saves.js | Сохранение/загрузка (localStorage). |
| cheats.js | Читы (idkfa и т.д.). |
| net.js | Сетевая игра (WebRTC). |
| ui.js | Меню и оверлеи. |
| input.js | Клавиатура/мышь/тач. |
| bot.js | Игровой бот. |
| dehacked.js | Dehacked-совместимость. |
| main.js | Точка входа; весь top-level код с побочными эффектами (слушатели, кнопки, блоки настроек) живёт здесь. |

## Критические правила правки
1. **Mutable-состояние только через STATE.** Все let-переменные движка переехали в объект STATE в state.js. Прямые обращения к ним из кода модулей — запрещены; используйте STATE.<имя>.
2. **Side effects — только в main.js.** Слушатели DOM, обработчики кнопок, setInterval,addEventListener и т.п. — не в модулях, а в main.js (он инициализируется последним и не участвует в циклических импортах).
3. **Инициализации, зависящие от других модулей** (например, `clipT = new Int16Array(STATE.W)`) — выносятся в пост-присваивания после импорта, а не в top-level литералы (иначе TDZ).
4. **const-стрелки превращены в function-объявления** — это ломает hoisting-зависимости при циклических импортах. Не возвращать стрелки для cross-module функций.
5. **ST занят** именем таблицы состояний — не использовать как имя переменной.

## Проверка сборки
Сборка через esbuild из src/main.js:
```
esbuild src/main.js --bundle --outfile=dist/engine.js
```
Smoke-тест: запускается в Node с заглушками DOM/Audio — top-level инициализация всех модулей без исключений.

## Подтверждённые инварианты
- Склейка всех модулей даёт те же unresolved-имена, что исходный монолит (только браузерные API: document, Math, localStorage, RTCPeerConnection и т.п.) — 42 имени.
- Бандл собранный из src/main.js — 343 КБ; top-level инициализация проходит без ошибок.
- Таблицы D_I собираются из 6 файлов (tables, tables2-7) и совпадают с исходником по содержимому (SPR 139, ST 967, MI 137, MTn 138, STn 968, SFXn 110, SFXlump 109, RND 256).
