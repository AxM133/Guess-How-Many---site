import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '@/shared/api'

const WEBHOOK_PATH = '/api/telegram/webhook'

// Проверка настройки бота: токен, вебхук, коды входа. Превращаем ответ сервера в чек-лист.
export function useTelegramStatus(run) {
  const [info, setInfo] = useState(null)

  const load = useCallback(
    () =>
      adminApi
        .telegram()
        .then(setInfo)
        .catch((err) => setInfo({ error: err.message })),
    [],
  )

  useEffect(() => {
    load()
  }, [load])

  const connect = useCallback(() => run(async () => {
    await adminApi.connectWebhook()
    await load()
  }, 'Бот подключён к сайту'), [run, load])

  return { info, checks: info && !info.error ? buildChecks(info) : [], connect }
}

function buildChecks(info) {
  const webhookOk = Boolean(info.webhook?.url?.endsWith(WEBHOOK_PATH))
  return [
    {
      key: 'bot',
      ok: info.enabled,
      title: info.enabled ? `Бот @${info.username}` : 'Бот не настроен',
      hint: info.enabled
        ? 'Подтверждает номера участников'
        : info.devVerification
          ? 'Локальный режим: номер вводится вручную. Задайте TELEGRAM_BOT_TOKEN.'
          : 'Задайте TELEGRAM_BOT_TOKEN — без него участники не смогут подтвердить номер.',
    },
    info.enabled && {
      key: 'webhook',
      ok: webhookOk,
      title: webhookOk ? 'Вебхук подключён' : 'Вебхук не подключён',
      hint: info.webhook?.lastError
        ? `Последняя ошибка Telegram: ${info.webhook.lastError}`
        : webhookOk
          ? info.webhook.url
          : 'Нажмите «Подключить» на сайте с https (Vercel). Локально — TELEGRAM_POLLING=1.',
      action: !webhookOk,
    },
    {
      key: '2fa',
      ok: info.twoFactor,
      title: info.twoFactor ? 'Вход по коду из Telegram включён' : 'Вход только по паролю',
      hint: info.twoFactor
        ? 'После пароля бот присылает админу одноразовый код'
        : 'Напишите боту /id и добавьте свой ID в TELEGRAM_ADMIN_IDS — пароля станет недостаточно для входа.',
    },
  ].filter(Boolean)
}
