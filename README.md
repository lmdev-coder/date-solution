# date-solution 💕

Приглашение в отпуск: Vue 3 клиент + Netlify Functions (TypeScript) + Cloudflare R2.

## Структура

```
.
├── frontend/                       # Vue 3 + TypeScript + Vite
│   └── src/
│       ├── App.vue                 # роутинг шагов: login → menu → сценарий
│       ├── components/             # CatIcon / CatBackground / CatPair
│       │   └── steps/              # StepLogin, StepMenu, StepStory, StepBrest,
│       │                           # StepQuestion, StepCountries, StepChoice, StepFinal
│       ├── composables/            # usePasswordAuth, useInvitationSelection, useInvitationSaver
│       ├── constants/              # страны/отель/даты, текст мини-игры, цвета котиков
│       ├── services/api.ts         # HTTP-клиент (ApiError со status)
│       ├── types/invitation.ts     # доменные типы и версии ответов
│       ├── utils/password.ts       # SHA-256 через WebCrypto
│       └── styles/main.css
└── backend/                        # Netlify Functions (TypeScript, esbuild)
    ├── netlify/functions/          # тонкие HTTP-эндпоинты
    │   ├── validate-password.ts
    │   └── save-response.ts
    └── src/
        ├── config/env.ts           # типизированное чтение process.env
        ├── lib/{errors,http}.ts    # ConfigError, HTTP-хелперы, единая обработка ошибок
        ├── schemas/                # Zod-схемы запросов
        ├── services/               # auth, invitation (домен), r2-storage (инфраструктура)
        └── types/
```

Слои бэкенда не смешиваются: эндпоинт разбирает HTTP → сервис применяет бизнес-логику →
`R2StorageService` только перемещает байты в Cloudflare R2.

## Сценарии

После входа открывается меню со сценариями:

| Сценарий | Шаги | Версия ответа |
| --- | --- | --- |
| **Годовщина — скрытая игра** | `anniversary-story` (сообщения) → `anniversary-gift` (пасхалка с подарком → подсказка) | не сохраняется |
| **V3 — ужин-приглашение** | `dinner-story` (сообщения по кнопке «Далее») → `dinner-places` (два места) → `dinner-time` (одно время) → финал | `version: 3` |
| **V2 — мини-игра** | `story` (сообщения по кнопке «Далее») → `brest` (вопрос про Брест, да/нет) → финал | `version: 2` |
| **V1 — приглашение в отпуск** | `question` → `countries` → `hotel` → `dates` → финал | `version: 1` |

Меню полностью управляется одним объектом `date-solution/configuration.json` в R2
(см. «Конфигурация меню» ниже). Для каждой игры задаются ярлыки, активность и флаг
`done`. После прохождения игры клиент вызывает `POST /configuration`, и сервер записывает
`done: true` прямо в файл конфигурации:

- активная игра (`done: false`) → розовая кнопка с `freshLabel` («А тут у нас что-то
  новенькое 🤔»);
- пройденная игра (`done: true`) → серая кнопка с `doneLabel` (например, у подарка —
  «Локация подарка на годовщину 🔍»);
- игра с `active: false` → кнопка не показывается.

Пасхалка с подарком живёт в игре «Годовщина»: текст «люблю жену, рад, что зашла в этот
день» → «надеюсь, понравится подарок» → кликабельный 🎁 (5 кликов — растёт, 10 — растёт
ещё, 15 — превращается в дверцу 🚪 с подсказкой, где лежит подарок).
Константы — в `frontend/src/constants/anniversary.ts`.

В сценариях V3 и годовщины падают сердечки и осенние листья (оверлей `AutumnHearts.vue`),
а на шаге выбора мест V3 можно отметить ровно два варианта. Константы — в
`frontend/src/constants/dinner.ts`.

На вопросе про Брест «Нет» сразу не принимается: первые четыре клика показывают
уговоры «Подумай, пожалуйста, ещё 🙏», пятый принимает отказ и завершает игру грустной
строкой. Лимит и тексты — в `frontend/src/constants/story.ts`.

## Конфигурация меню

Единственный объект `date-solution/configuration.json` в бакете описывает все кнопки
меню. Если объект отсутствует, функция `configuration` сама создаёт его из дефолта
(все игры активны и не пройдены). Редактировать можно напрямую в R2 (или через
`POST /configuration` для отметки `done`):

```jsonc
{
  "games": [
    { "id": "gift",   "freshLabel": "А тут у нас что-то новенькое 🤔", "doneLabel": "Локация подарка на годовщину 🔍", "active": true, "done": false },
    { "id": "dinner", "freshLabel": "А тут у нас что-то новенькое 🤔", "doneLabel": "Годовщина ужин 🥂", "active": true, "done": false },
    { "id": "brest",  "freshLabel": "А тут у нас что-то новенькое 🤔", "doneLabel": "Поездка в Брест ❤️", "active": true, "done": false },
    { "id": "travel", "freshLabel": "А тут у нас что-то новенькое 🤔", "doneLabel": "А тут выбор, куда поедем в отпуск 🌍", "active": true, "done": false }
  ]
}
```

Поля: `id` (`gift` / `dinner` / `brest` / `travel`), `freshLabel` (ярлык до прохождения),
`doneLabel` (ярлык после прохождения), `active` (`false` — не показывать кнопку),
`done` (`true` — показать серую кнопку с `doneLabel`). Порядок пунктов в массиве задаёт
порядок кнопок в меню.

## API

| Метод | Путь | Заголовок | Тело / ответ |
| --- | --- | --- | --- |
| POST | `/.netlify/functions/validate-password` | `Authorization: Bearer <sha256>` | → `{ valid: true }` |
| GET | `/.netlify/functions/configuration` | `Authorization: Bearer <sha256>` | → `{ games: [{ id, freshLabel, doneLabel, active, done }] }` |
| POST | `/.netlify/functions/configuration` | `Authorization: Bearer <sha256>` | `{ id: "gift" }` → `{ games: [...] }` (отмечает `done: true`) |
| POST | `/.netlify/functions/save-response` | `Authorization: Bearer <sha256>` | см. ниже → `{ success, objectKey, savedAt }` |

Тело `save-response` — размеченное объединение по полю `version`:

```jsonc
// V1
{ "version": 1, "countries": ["Турция"], "hotel": "Все включено", "dates": "С 19.09.2026 до конца отпуска" }

// V2
{ "version": 2, "brestTrip": true }

// V3
{ "version": 3, "places": ["Ужин дома 🏠", "Джерри 🍔"], "time": "20:00" }
```

Пароль никогда не покидает браузер: клиент отправляет SHA-256 хеш, сервер сравнивает его
с `PASSWORD_HASH` через `timingSafeEqual`.

## Хранилище: Cloudflare R2

Бакет общий для нескольких приложений, поэтому объекты разложены по неймспейсам
`<app>/<категория>/`. Каждый ответ пишется отдельным JSON-объектом
через S3-совместимый API, а имя файла начинается с версии ответа:

```
date-solution/answers/v1_2026-09-13_203.0.113.7_12-34-56-789Z.json
date-solution/answers/v2_2026-09-13_203.0.113.7_13-05-11-204Z.json
date-solution/answers/v3_2026-09-13_203.0.113.7_14-22-03-890Z.json
```

Внутри — тот же payload плюс `clientIp` и `submittedAt`. Соседние приложения работают
под своими префиксами (`other-app/...`) и друг другу не мешают.

## Переменные окружения

Скопируйте `.env.example` в `.env` (или задайте в Netlify UI):

| Переменная | Назначение |
| --- | --- |
| `PASSWORD_HASH` | SHA-256 hex хеш пароля |
| `R2_ACCOUNT_ID` | Cloudflare Account ID (из него выводится endpoint) |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | Имя бакета |

## Команды

```bash
npm install
npm run dev          # netlify dev: Vite + функции на http://localhost:8888
npm run build        # сборка клиента в frontend/dist
npm run typecheck    # vue-tsc + tsc по всем воркспейсам
```

`npm run dev` запускается как `netlify dev --offline --filter @date-solution/frontend`:

- `--offline` — не требует логина и линковки сайта, берёт переменные только из `.env`.
- `--filter` — репозиторий использует npm workspaces, и без явного фильтра CLI спрашивает,
  какой из проектов (`frontend` / `backend`) использовать. Фильтр убирает этот промпт.

Если понадобится тянуть переменные из Netlify UI, уберите `--offline` и выполните `npx netlify link`.

## Локальная разработка

1. Скопируйте `.env.example` в `.env` (файл в `.gitignore`).
2. Заполните `PASSWORD_HASH` и четыре переменные R2.
3. `npm run dev` → http://localhost:8888

Проверка эндпоинтов без браузера:

```bash
curl -X POST http://localhost:8888/.netlify/functions/validate-password \
  -H "Authorization: Bearer <PASSWORD_HASH>" -H "Content-Type: application/json" -d "{}"
# → {"valid":true}
```

Ответы `save-response`:

| Ситуация | Код | Тело |
| --- | --- | --- |
| Успех | 200 | `{ success, objectKey, savedAt }` |
| Нет/неверный `Authorization` | 401 | `{ error: "Unauthorized" }` |
| Пустые `countries` / `hotel` / `dates` | 400 | `{ error: "Выбери хотя бы одну страну; ..." }` |
| Не заданы переменные R2 | 500 | `{ error: "Server misconfigured" }` |

Последний случай — ожидаемый, если `.env` ещё не заполнен: приложение поднимется, вход
работает, но сохранение вернёт 500. Детали (каких переменных не хватает) пишутся только
в лог сервера.

## Переход со старой версии

Хранилище в GitHub-ветке `answers` заменено на R2 — старые файлы остаются в истории git,
переносить их не требуется. `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` больше не нужны.
