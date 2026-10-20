import { CONTEST_STATUS } from '@/entities/contest'

// Состояние таймера для панели: идёт ли конкурс, закончился ли, какой бейдж показать
export function getTimerStatus(state) {
  const { adminLabel, pill } = CONTEST_STATUS[state.status]
  return {
    running: state.status === 'running',
    finished: state.status === 'finished',
    badge: { label: adminLabel, className: pill },
  }
}
