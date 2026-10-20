import { Download } from 'lucide-react'
import { adminApi } from '@/shared/api'
import { downloadBlob } from '@/shared/lib'

export function ExportGuessesButton({ round, run }) {
  return (
    <button
      className="btn btn-ghost px-3 py-2 text-sm"
      onClick={() => run(async () => downloadBlob(await adminApi.exportCsv(), `otvety-raund-${round}.csv`))}
    >
      <Download className="size-4" /> CSV
    </button>
  )
}
