import { useEffect, useState } from 'react'

// QR-код ссылки на бота — чтобы с компьютера открыть Telegram на телефоне
export function useQrCode(url) {
  const [qr, setQr] = useState({ url: null, dataUrl: null })
  useEffect(() => {
    if (!url) return
    let alive = true
    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: '#0b0a24', light: '#ffffff' } }),
      )
      .then((dataUrl) => alive && setQr({ url, dataUrl }))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [url])
  return qr.url === url ? qr.dataUrl : null
}
