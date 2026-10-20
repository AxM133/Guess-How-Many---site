# Угадай сумму · alif academy

Сайт-конкурс: у входа в alif academy стоит коробка для донатов. Люди угадывают, сколько в ней денег.
Чей ответ ближе всех к реальной сумме — тот забирает всё содержимое.

- **Главная** (`/`) — 3D-коробка (можно крутить, клик бросает купюру), обратный отсчёт, форма ответа, правила, итоги.
- **Админка** (`/admin`) — вход по паролю, запуск/продление/остановка таймера, все ответы с поиском,
  ввод реальной суммы → автоматический рейтинг по точности, публикация итогов, выгрузка в CSV, новый раунд.

## Запуск локально

```bash
npm install
cp .env.example .env   # впишите свой ADMIN_PASSWORD
npm run dev            # сайт: http://localhost:5173, API: http://localhost:3001
```

Без `DATABASE_URL` используется встроенный Postgres (PGlite) в папке `data/pglite` — ничего ставить не нужно.

## Деплой на Vercel

1. Залейте проект на GitHub и импортируйте репозиторий в Vercel (настройки сборки подтянутся из `vercel.json`).
2. **Storage → Create Database → Neon (Postgres)** и подключите базу к проекту — Vercel сам добавит `DATABASE_URL`.
   Таблицы создаются автоматически при первом запросе.
3. **Settings → Environment Variables**: добавьте `ADMIN_PASSWORD` (длинный случайный пароль).
4. Redeploy. Сайт — `https://<проект>.vercel.app`, админка — `/admin`.

> Почему не SQLite: на Vercel код работает в serverless-функциях без постоянного диска — файл базы бы терялся.

Как это устроено: сборка Vite → статика в `dist/`, а все запросы `/api/*` уходят в одну
serverless-функцию [api/index.js](api/index.js), которая запускает Express-приложение из `server/`.

## Структура (Feature-Sliced Design)

```
src/
├── app/        точка входа, роутер, глобальные стили
├── pages/      home, admin — собирают страницу из виджетов
├── widgets/    hero, how-it-works, site-header/footer,
│               admin-header, contest-stats, timer-panel, result-panel, guesses-table, new-round-panel
├── features/   submit-guess, admin-auth, manage-timer, set-actual-amount,
│               publish-results, remove-guess, export-guesses, reset-round
├── entities/   contest (состояние, отсчёт, итоги), guess (статистика, лидер), donation-box (3D-коробка)
└── shared/     api (клиент и эндпоинты), lib (форматирование, хуки), ui (логотип, карточки, поля), config (бренд)

server/         Express-приложение, работа с БД (Neon / PGlite), авторизация
api/index.js    serverless-функция для Vercel
```

Правила: слой импортирует только слои ниже себя; в слайс заходим только через его `index.js`;
внутри слоя слайсы друг друга не импортируют. Импорты — через алиас `@/` (`@/shared/ui`, `@/entities/contest`).
Проверка — `npm run lint` (ESLint + [Steiger](https://github.com/feature-sliced/steiger), линтер FSD).

## Правила конкурса, зашитые в сервер

- Ответы принимаются только пока идёт таймер; время считается по часам сервера.
- Один ответ с одного номера (+992) за раунд; не больше 8 ответов с одного IP за 10 минут.
- Победитель — минимальная разница с реальной суммой; при равенстве — кто ответил раньше.
- Реальная сумма не уходит на сайт, пока админ не нажмёт «Опубликовать итоги» (и только после окончания конкурса).
- На публичной странице номер победителя скрыт, кроме двух последних цифр.

## Стек

React 19 · Vite · Tailwind CSS 4 · @react-three/fiber + drei · motion · canvas-confetti ·
Express 5 · Neon Postgres (прод) / PGlite (локально)
