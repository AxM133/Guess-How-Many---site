import { CONTEST_STATUS } from '../model/status'

export function ContestStatusBadge({ contest }) {
  const { dot, label } = CONTEST_STATUS[contest.status]
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold">
      <span className="relative flex size-2.5">
        {contest.status === 'running' && <span className={`absolute inset-0 animate-ping rounded-full ${dot}`} />}
        <span className={`relative size-2.5 rounded-full ${dot}`} />
      </span>
      {contest.result ? 'Итоги подведены' : label}
    </span>
  )
}
