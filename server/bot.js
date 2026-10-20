import { escapeHtml, sendMessage, siteUrl } from './telegram.js'
import { bindTelegram, confirmPhoneFromTelegram } from './verification.js'

const SHARE_KEYBOARD = {
  keyboard: [[{ text: '📱 Поделиться номером', request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
}
const REMOVE_KEYBOARD = { remove_keyboard: true }

function backToSite(chatId, text) {
  const url = siteUrl()
  return sendMessage(chatId, text, {
    reply_markup: url ? { inline_keyboard: [[{ text: '↩️ Вернуться на сайт', url }]] } : REMOVE_KEYBOARD,
  })
}

async function onStart(msg, code) {
  const chatId = msg.chat.id
  if (!code) {
    return backToSite(
      chatId,
      '👋 Это бот конкурса <b>«Угадай сумму»</b> от alif academy.\n\nЧтобы участвовать, откройте сайт конкурса и нажмите «Подтвердить номер через Telegram».',
    )
  }
  if (!(await bindTelegram(code, msg.from))) {
    return backToSite(chatId, '⌛ Ссылка устарела. Вернитесь на сайт и нажмите «Подтвердить номер» ещё раз.')
  }
  return sendMessage(
    chatId,
    'Подтвердите номер телефона для конкурса <b>«Угадай сумму»</b> — нажмите кнопку ниже 👇\n\n' +
      'Номер нужен, только чтобы связаться с победителем. Один номер — один ответ.',
    { reply_markup: SHARE_KEYBOARD },
  )
}

async function onContact(msg) {
  const chatId = msg.chat.id
  // Принимаем только собственный номер аккаунта, а не пересланный чужой контакт
  if (msg.contact.user_id !== msg.from.id) {
    return sendMessage(chatId, 'Отправьте, пожалуйста, <b>свой</b> номер — кнопкой «📱 Поделиться номером».', {
      reply_markup: SHARE_KEYBOARD,
    })
  }
  const phone = msg.contact.phone_number.replace(/\D/g, '')
  if (!/^992\d{9}$/.test(phone)) {
    return sendMessage(chatId, '🇹🇯 В конкурсе участвуют только номера Таджикистана (+992).', { reply_markup: REMOVE_KEYBOARD })
  }
  if (!(await confirmPhoneFromTelegram(msg.from.id, phone))) {
    return backToSite(chatId, 'Сначала нажмите «Подтвердить номер через Telegram» на сайте конкурса.')
  }
  await sendMessage(chatId, `✅ Номер <b>+${phone}</b> подтверждён!`, { reply_markup: REMOVE_KEYBOARD })
  return backToSite(chatId, 'Вернитесь на сайт — форма уже ждёт ваш ответ.')
}

/** Обработка одного апдейта от Telegram (вебхук или long polling) */
export async function handleUpdate(update) {
  const msg = update.message
  if (!msg?.from || msg.chat?.type !== 'private') return
  if (msg.contact) return onContact(msg)

  const text = (msg.text || '').trim()
  if (text.startsWith('/start')) return onStart(msg, text.split(/\s+/)[1])
  if (text === '/id') {
    return sendMessage(msg.chat.id, `Ваш Telegram ID: <code>${escapeHtml(msg.from.id)}</code>`)
  }
  return onStart(msg, null)
}
