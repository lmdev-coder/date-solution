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

После входа открывается меню, из которого доступны два сценария:

| Сценарий | Шаги | Версия ответа |
| --- | --- | --- |
| **V2 — мини-игра** | `story` (сообщения по кнопке «Далее») → `brest` (вопрос про Брест, да/нет) → финал | `version: 2` |
| **V1 — приглашение в отпуск** | `question` → `countries` → `hotel` → `dates` → финал | `version: 1` |

Второй пункт меню намеренно оформлен серым: он ведёт в уже знакомый сценарий V1
и не должен перетягивать внимание с нового.

На вопросе про Брест «Нет» сразу не принимается: первые четыре клика показывают
уговоры «Подумай, пожалуйста, ещё 🙏», пятый принимает отказ и завершает игру грустной
строкой. Лимит и тексты — в `frontend/src/constants/story.ts`.

## API

| Метод | Путь | Заголовок | Тело / ответ |
| --- | --- | --- | --- |
| POST | `/.netlify/functions/validate-password` | `Authorization: Bearer <sha256>` | → `{ valid: true }` |
| POST | `/.netlify/functions/save-response` | `Authorization: Bearer <sha256>` | см. ниже → `{ success, objectKey, savedAt }` |

Тело `save-response` — размеченное объединение по полю `version`:

```jsonc
// V1
{ "version": 1, "countries": ["Турция"], "hotel": "Все включено", "dates": "С 19.09.2026 до конца отпуска" }

// V2
{ "version": 2, "brestTrip": true }
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
