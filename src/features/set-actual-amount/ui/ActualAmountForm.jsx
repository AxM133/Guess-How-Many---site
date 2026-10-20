import { useState } from 'react'
import { adminApi } from '@/shared/api'
import { formatMoney } from '@/shared/lib'

// Реальная сумма из коробки. После сохранения сервер сортирует ответы по точности.
export function ActualAmountForm({ savedAmount, run }) {
  const [amount, setAmount] = useState(savedAmount ?? '')

  return (
    <div className="flex gap-2">
      <input
        className="field py-2.5 font-display text-xl font-bold"
        inputMode="numeric"
        placeholder="Сумма, сомони"
        value={amount === '' ? '' : formatMoney(amount)}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, '').slice(0, 9)
          setAmount(d === '' ? '' : Number(d))
        }}
      />
      <button
        className="btn btn-ghost shrink-0 py-2.5"
        disabled={amount === '' || amount === savedAmount}
        onClick={() => run(() => adminApi.setAmount(amount), 'Сумма сохранена — ответы отсортированы по точности')}
      >
        Сохранить
      </button>
    </div>
  )
}
